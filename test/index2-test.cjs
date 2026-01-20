const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function testIndex2() {
  console.log('Testing index2.html...\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Capture console output
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[') || text.includes('Error') || text.includes('initialized') || text.includes('Loaded') || text.includes('Parsed')) {
      console.log(`[Browser] ${text}`);
    }
  });

  const indexPath = path.join(__dirname, '..', 'index2.html');
  await page.goto('file://' + indexPath);

  // Wait for initialization
  await page.waitForFunction(
    () => window.demo?.graph && window.demo?.state && window.demo?.engine,
    { timeout: 10000 }
  );

  // Load case study CSV
  console.log('\n--- Loading Case Study CSV ---');
  const csvPath = path.join(__dirname, 'computation', 'case-studies', '01-ThreeFeathersTerrace.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  await page.evaluate(async (csv) => {
    // Trigger the parseAndLoadCSV function
    window.parseAndLoadCSV = window.parseAndLoadCSV || (() => {});
    // We need to expose parseAndLoadCSV globally first
  }, csvContent);

  // Wait for parseAndLoadCSV to be available
  await page.waitForFunction(() => typeof window.parseAndLoadCSV === 'function', { timeout: 5000 });

  // Call parseAndLoadCSV with the CSV content
  const loadResult = await page.evaluate((csv) => {
    try {
      window.parseAndLoadCSV(csv);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, csvContent);

  console.log('Load result:', loadResult);

  // Wait for recomputation
  await page.waitForTimeout(500);

  // Get stats
  const stats = await page.evaluate(() => {
    const graphStats = window.demo.graph.getStats();
    const boundCount = window.demo.domBridge.getBoundCount();
    const boundPaths = window.demo.domBridge.getBoundPaths();

    // Try to get some computed values
    const state = window.demo.state;
    const targetId = state.getActiveModelId();

    // Sample computed values
    const teuiRef = state.getValue('keyValues.reference.teui');
    const teuiTarget = state.getValue('keyValues.target.teui');

    // Get DOM text content for Key Values
    const domValues = {};
    const kvElements = document.querySelectorAll('[data-field-id^="keyValues"]');
    kvElements.forEach(el => {
      domValues[el.dataset.fieldId] = el.textContent;
    });

    // Trace the TEUI calculation chain to find where values break
    const chain = {
      // Level 0: Final output
      'keyValues.target.teui (h_10)': state.getValue('keyValues.target.teui'),

      // Level 1: Direct dependencies of h_10
      'energy.target.total (j_32)': state.getValue('energy.target.total'),
      'building.conditionedFloorArea (h_15)': state.getValue('building.conditionedFloorArea'),

      // Level 2: Dependencies of j_32
      'energy.target.electricity (j_27)': state.getValue('energy.target.electricity'),
      'energy.target.gas (j_28)': state.getValue('energy.target.gas'),

      // Level 3: Dependencies of j_27
      'energy.total.all (d_136)': state.getValue('energy.total.all'),
      'renewable.onsiteTotal (d_43)': state.getValue('renewable.onsiteTotal'),

      // Level 4: Dependencies of d_136
      'energy.total.targeted (d_135)': state.getValue('energy.total.targeted'),
      'mechanical.heating.demand (d_114)': state.getValue('mechanical.heating.demand'),
      'mechanical.cooling.electricalDemand (d_117)': state.getValue('mechanical.cooling.electricalDemand'),

      // Level 5: Key heating inputs
      'mechanical.heating.copHeat': state.getValue('mechanical.heating.copHeat'),
      'energy.ted.total (d_127)': state.getValue('energy.ted.total'),
      'envelope.total.heatLoss': state.getValue('envelope.total.heatLoss'),

      // Level 6: Base inputs from CSV
      'mechanical.heating.systemType (d_113)': state.getValue('mechanical.heating.systemType'),
      'mechanical.heating.hspf (f_113)': state.getValue('mechanical.heating.hspf'),
      'climate.heating.degreeDays': state.getValue('climate.heating.degreeDays'),

      // Level 7: Trace the heatLoss components
      'envelope.airFacing.totalHeatLoss (i_101)': state.getValue('envelope.airFacing.totalHeatLoss'),
      'envelope.groundFacing.totalHeatLoss (i_102)': state.getValue('envelope.groundFacing.totalHeatLoss'),
      'airTightness.heatLoss (i_103)': state.getValue('airTightness.heatLoss'),
    };

    const debugValues = chain;

    return {
      nodes: graphStats.nodeCount,
      inputs: graphStats.inputCount,
      boundElements: boundCount,
      boundPaths: boundPaths.slice(0, 10),
      sampleValues: {
        'keyValues.reference.teui': teuiRef,
        'keyValues.target.teui': teuiTarget
      },
      debugValues: debugValues,
      domValues: domValues
    };
  });

  console.log('\n=== Index2.html Test Results ===');
  console.log(`Nodes: ${stats.nodes}`);
  console.log(`Inputs: ${stats.inputs}`);
  console.log(`Bound Elements: ${stats.boundElements}`);
  console.log(`Sample Bound Paths: ${stats.boundPaths.join(', ')}`);
  console.log(`Sample Values: ${JSON.stringify(stats.sampleValues, null, 2)}`);

  // Check if any Key Values fields are bound
  const keyValuesBound = stats.boundPaths.filter(p => p.includes('keyValues'));
  console.log(`\nKey Values Paths Bound: ${keyValuesBound.length}`);
  if (keyValuesBound.length > 0) {
    console.log(`  ${keyValuesBound.join('\n  ')}`);
  }

  console.log('\nDebug Values (upstream dependencies):');
  console.log(JSON.stringify(stats.debugValues, null, 2));

  console.log('\nDOM Values (displayed in browser):');
  console.log(JSON.stringify(stats.domValues, null, 2));

  await browser.close();
  console.log('\nTest complete!');
}

testIndex2().catch(e => {
  console.error('Test failed:', e.message);
  process.exit(1);
});
