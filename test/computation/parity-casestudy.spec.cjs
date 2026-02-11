// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

/**
 * Case Study Parity Test
 *
 * For each case study CSV, creates a FRESH computation graph,
 * syncs inputs from StateManager (after CSV import + legacy recalculation),
 * computes, and compares EVERY computed field to legacy values.
 *
 * This isolates actual computation bugs from state-leak between sequential loads.
 */

const CASE_STUDIES_DIR = path.join(__dirname, 'case-studies');

test.describe('Case Study Graph Parity', () => {
  test('each case study must match legacy after fresh graph sync', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('disclaimerSeen', 'true');
    });

    const indexPath = path.join(__dirname, '..', '..', 'index.html');
    await page.goto(`file://${indexPath}`);

    await page.waitForFunction(() =>
      window.TEUI?.ComputationIntegration?.isInitialized?.() &&
      window.TEUI?.StateManager &&
      window.TEUI?.FileHandler?.processImportedCSV,
      { timeout: 60000 }
    );

    const csvFiles = fs.readdirSync(CASE_STUDIES_DIR)
      .filter(f => f.endsWith('.csv'))
      .sort();

    console.log(`\n=== CASE STUDY GRAPH PARITY (${csvFiles.length} files) ===`);

    let totalMismatches = 0;
    const allMismatches = [];

    for (const csvFile of csvFiles) {
      const csvContent = fs.readFileSync(path.join(CASE_STUDIES_DIR, csvFile), 'utf-8');
      const caseName = csvFile.replace('.csv', '');

      const result = await page.evaluate(async (csv) => {
        return new Promise((resolve) => {
          try {
            // Import CSV - triggers legacy recalculation
            window.TEUI.FileHandler.processImportedCSV(csv);

            // Wait for legacy calculations to settle
            setTimeout(() => {
              try {
                const SM = window.TEUI.StateManager;

                // Create a FRESH computation graph (not the integration's)
                const graph = window.TEUI.ComputationGraph.create();
                const nodes = window.TEUI.ComputationNodes || {};
                const moduleOrder = [
                  'Climate', 'BuildingInfo', 'Envelope', 'Mechanical',
                  'SpaceHeating', 'WaterHeating', 'Renewable', 'Energy',
                  'Forestry', 'Emissions', 'Occupancy', 'InternalGains',
                  'RadiantGains', 'TransmissionLoss', 'VolumeMetrics',
                  'Cooling', 'Ventilation', 'KeyValues'
                ];

                for (const name of moduleOrder) {
                  if (nodes[name]) nodes[name].register(graph);
                }

                // Create fresh state
                const state = window.TEUI.MultiModelState.create();
                const meta = window.TEUI.ModelMetadata.createTarget('Parity');
                state.addModel(meta);

                // Sync ALL inputs from StateManager
                const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];
                let syncCount = 0;
                for (const sp of inputIds) {
                  const inputNode = graph.getInput(sp);
                  const lid = inputNode?.legacyId;
                  if (lid) {
                    const v = SM.getValue(lid);
                    if (v !== undefined && v !== null && v !== '') {
                      state.setValueForModel(meta.id, sp, v);
                      syncCount++;
                    }
                  }
                }

                // Compute
                const engine = window.TEUI.MultiModelEngine.create({ state, graph });
                engine.computeAllForModel(meta.id);

                // Compare EVERY computed node
                const mismatches = [];
                let matchCount = 0;
                let skipCount = 0;

                function parseNum(v) {
                  if (v === null || v === undefined || v === 'N/A' || v === 'Unavailable' || v === '') return NaN;
                  const n = parseFloat(String(v).replace(/,/g, ''));
                  return n;
                }

                for (const nodePath of graph.getAllNodeIds()) {
                  const node = graph.getNode(nodePath);
                  if (!node?.legacyId) continue;

                  const lid = node.legacyId;
                  const legacyVal = SM.getValue(lid);
                  const graphVal = state.getValueForModel(meta.id, nodePath);

                  // Skip if legacy has no value
                  if (legacyVal === undefined || legacyVal === null || legacyVal === '') {
                    skipCount++;
                    continue;
                  }

                  const legNum = parseNum(legacyVal);
                  const graNum = parseNum(graphVal);

                  // String comparison for non-numeric
                  if (isNaN(legNum) || isNaN(graNum)) {
                    if (String(legacyVal) === String(graphVal)) {
                      matchCount++;
                    } else {
                      mismatches.push({ lid, path: nodePath, legacy: legacyVal, graph: graphVal });
                    }
                    continue;
                  }

                  const absDiff = Math.abs(legNum - graNum);
                  const relDiff = legNum !== 0 ? absDiff / Math.abs(legNum) : (absDiff === 0 ? 0 : 1);

                  if (absDiff < 0.01 || relDiff < 0.001) {
                    matchCount++;
                  } else {
                    mismatches.push({
                      lid, path: nodePath,
                      legacy: legNum, graph: graNum,
                      absDiff: absDiff.toFixed(4),
                      pct: (relDiff * 100).toFixed(2) + '%'
                    });
                  }
                }

                resolve({ syncCount, matchCount, skipCount, mismatches });
              } catch (e) {
                resolve({ error: e.message, mismatches: [] });
              }
            }, 1000);
          } catch (e) {
            resolve({ error: e.message, mismatches: [] });
          }
        });
      }, csvContent);

      if (result.error) {
        console.log(`  ${caseName}: ERROR ${result.error}`);
        continue;
      }

      if (result.mismatches.length === 0) {
        console.log(`  ${caseName}: ${result.matchCount} fields match, ${result.skipCount} skipped`);
      } else {
        console.log(`  ${caseName}: ${result.matchCount} match, ${result.mismatches.length} MISMATCH, ${result.skipCount} skipped`);
        for (const m of result.mismatches.slice(0, 5)) {
          console.log(`    ${m.lid} (${m.path}): legacy=${m.legacy} graph=${m.graph} ${m.pct || ''}`);
        }
        if (result.mismatches.length > 5) {
          console.log(`    ... and ${result.mismatches.length - 5} more`);
        }
        totalMismatches += result.mismatches.length;
        allMismatches.push({ file: caseName, mismatches: result.mismatches });
      }
    }

    // Collect unique mismatched fields
    if (allMismatches.length > 0) {
      const fieldMap = new Map();
      for (const { file, mismatches } of allMismatches) {
        for (const m of mismatches) {
          if (!fieldMap.has(m.lid)) fieldMap.set(m.lid, []);
          fieldMap.get(m.lid).push(file);
        }
      }
      console.log(`\n--- Unique mismatched fields ---`);
      for (const [lid, files] of fieldMap) {
        console.log(`  ${lid}: ${files.length} case studies`);
      }
    }

    console.log(`\nTotal mismatches: ${totalMismatches}`);
    expect(totalMismatches, `${totalMismatches} total field mismatches across case studies`).toBe(0);
  });
});
