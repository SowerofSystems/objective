const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function runPerfTest() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const indexPath = path.join(__dirname, '..', 'index.html');
  await page.goto('file://' + indexPath);

  await page.waitForFunction(
    () => window.TEUI?.ComputationIntegration?.isInitialized?.() &&
          window.TEUI?.StateManager,
    { timeout: 30000 }
  );

  const csvPath = path.join(__dirname, 'computation', 'case-studies', '01-ThreeFeathersTerrace.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  const results = await page.evaluate(async (csv) => {
    window.TEUI.FileHandler.processImportedCSV(csv);
    await new Promise(r => setTimeout(r, 500));

    const iterations = 20;
    const results = { legacy: [], newSystem: [] };
    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

    // Benchmark legacy - trigger full recalc via StateManager
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      window.TEUI.StateManager.setValue('h_15', String(1000 + i), 'user');
      await new Promise(r => setTimeout(r, 100)); // Wait for cascade
      results.legacy.push(performance.now() - start);
    }

    // Benchmark new computation graph - full recalc
    const CI = window.TEUI.ComputationIntegration;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      CI.computeAll();
      results.newSystem.push(performance.now() - start);
    }

    // Benchmark incremental recomputation
    const engine = CI.getEngine();
    const incrementalResults = [];

    // Check what methods are available
    const engineMethods = Object.keys(engine || {});

    if (engine && typeof engine.onValueChange === 'function') {
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        // Incremental update - only recomputes affected nodes
        engine.onValueChange('building.conditionedFloorArea', 1000 + i);
        incrementalResults.push(performance.now() - start);
      }
    } else {
      // Fallback
      incrementalResults.push(0);
      return {
        legacy: { avg: avg(results.legacy).toFixed(2) },
        newSystem: { avg: avg(results.newSystem).toFixed(2) },
        incremental: { avg: '0', note: 'onValueChange not available', engineMethods }
      };
    }

    return {
      legacy: { avg: avg(results.legacy).toFixed(2) },
      newSystem: { avg: avg(results.newSystem).toFixed(2) },
      incremental: { avg: avg(incrementalResults).toFixed(2) }
    };
  }, csvContent);

  console.log('\n=== Performance Comparison (20 iterations) ===');
  console.log('Legacy (StateManager + Section recalcs): ' + results.legacy.avg + 'ms avg');
  console.log('New - Full Recalc (computeAll):          ' + results.newSystem.avg + 'ms avg');

  if (results.incremental.note) {
    console.log('\nIncremental test: ' + results.incremental.note);
    console.log('Engine methods available: ' + JSON.stringify(results.incremental.engineMethods));
    if (results.incremental.impact) {
      console.log('Impact analysis for building.conditionedFloorArea:');
      console.log('  Affected nodes: ' + results.incremental.impact.affectedCount);
      console.log('  Estimated savings: ' + results.incremental.impact.estimatedSavings);
    }
  } else {
    console.log('New - Incremental (single value change): ' + results.incremental.avg + 'ms avg');
    console.log('\nSpeedup vs Legacy:');
    console.log('  Full recalc:   ' + (parseFloat(results.legacy.avg) / parseFloat(results.newSystem.avg)).toFixed(1) + 'x faster');
    console.log('  Incremental:   ' + (parseFloat(results.legacy.avg) / parseFloat(results.incremental.avg)).toFixed(1) + 'x faster');
  }

  await browser.close();
}

runPerfTest().catch(console.error);
