// @ts-check
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const CASE_STUDIES_DIR = path.join(__dirname, "computation", "case-studies");
const RESULTS_FILE = path.join(__dirname, "case-study-results.json");

test.describe("Case Study Validation", () => {
  test("validate all case study CSVs", async ({ page }) => {
    // Load the calculator
    const indexPath = path.join(__dirname, "..", "index.html");
    await page.goto(`file://${indexPath}`);

    // Wait for calculator to initialize
    await page.waitForFunction(
      () =>
        window.TEUI?.ComputationIntegration?.isInitialized?.() &&
        window.TEUI?.StateManager &&
        window.TEUI?.FileHandler?.processImportedCSV,
      { timeout: 30000 }
    );

    console.log("Calculator loaded");

    // Get list of CSV files
    const csvFiles = fs
      .readdirSync(CASE_STUDIES_DIR)
      .filter((f) => f.endsWith(".csv"))
      .sort();

    console.log(`Found ${csvFiles.length} CSV files`);

    const allResults = [];

    for (const csvFile of csvFiles) {
      const csvPath = path.join(CASE_STUDIES_DIR, csvFile);
      const csvContent = fs.readFileSync(csvPath, "utf-8");

      console.log(`Testing: ${csvFile}`);

      // Import CSV and run validation
      const result = await page.evaluate(async (csv) => {
        return new Promise((resolve) => {
          try {
            // Import CSV
            window.TEUI.FileHandler.processImportedCSV(csv);

            // Wait for calculations
            setTimeout(() => {
              // Run validation
              const graph = window.TEUI.ComputationIntegration.getGraph();
              const state = window.TEUI.ComputationIntegration.getState();
              const SM = window.TEUI.StateManager;

              const targetId = state.getActiveModelId();

              // Debug j_27 components for detailed analysis
              const j27Debug = {
                // j_27 = d_136 - d_43 - i_43
                d_136: { old: parseFloat(SM.getValue("d_136")) || 0, new: parseFloat(state.getValueForModel(targetId, "energy.total.all")) || 0 },
                d_43: { old: parseFloat(SM.getValue("d_43")) || 0, new: parseFloat(state.getValueForModel(targetId, "renewable.onsiteTotal")) || 0 },
                i_43: { old: parseFloat(SM.getValue("i_43")) || 0, new: parseFloat(state.getValueForModel(targetId, "renewable.offsiteTotal")) || 0 },
                // d_136 components (for Heatpump: k51 + d117 + d114 + m43 + h70)
                k_51: { old: parseFloat(SM.getValue("k_51")) || 0, new: parseFloat(state.getValueForModel(targetId, "energy.dhw.netElectrical")) || 0 },
                d_117: { old: parseFloat(SM.getValue("d_117")) || 0, new: parseFloat(state.getValueForModel(targetId, "mechanical.cooling.electricalDemand")) || 0 },
                d_114: { old: parseFloat(SM.getValue("d_114")) || 0, new: parseFloat(state.getValueForModel(targetId, "mechanical.heating.demand")) || 0 },
                m_43: { old: parseFloat(SM.getValue("m_43")) || 0, new: parseFloat(state.getValueForModel(targetId, "renewable.exteriorLoads")) || 0 },
                h_70: { old: parseFloat(SM.getValue("h_70")) || 0, new: parseFloat(state.getValueForModel(targetId, "energy.plugLoads.subtotal")) || 0 },
                // d_114 inputs: TED / COPheat
                d_127: { old: parseFloat(SM.getValue("d_127")) || 0, new: parseFloat(state.getValueForModel(targetId, "energy.ted.heating")) || 0 },
                copHeat: { old: parseFloat(SM.getValue("j_113")) || 0, new: parseFloat(state.getValueForModel(targetId, "mechanical.heating.copHeat")) || 0 },
                // d_117 inputs: m_129 / COP
                m_129: { old: parseFloat(SM.getValue("m_129")) || 0, new: parseFloat(state.getValueForModel(targetId, "energy.ced.mitigated")) || 0 },
                copCool: { old: parseFloat(SM.getValue("k_116")) || 0, new: parseFloat(state.getValueForModel(targetId, "mechanical.cooling.effectiveCop")) || 0 },
                // Raw HSPF input
                f_113: { old: parseFloat(SM.getValue("f_113")) || 0, new: parseFloat(state.getValueForModel(targetId, "mechanical.heating.hspf")) || 0 },
                h_113: { old: parseFloat(SM.getValue("h_113")) || 0, new: 0 }, // h_113 = copHeat in legacy
              };

              const result = {
                matches: 0,
                close: 0,
                mismatches: 0,
                missing: 0,
                mismatchDetails: [],
                j27Debug,
              };
              const ABS_TOL = 0.01;
              const REL_TOL = 0.01;

              // Check computation nodes
              for (const nodePath of graph.getAllNodeIds()) {
                const node = graph.getNode(nodePath);
                if (!node?.legacyId) continue;

                const legacyId = node.legacyId;
                const oldVal = SM.getValue(legacyId);
                const newVal = state.getValueForModel(targetId, nodePath);

                if (
                  oldVal === undefined ||
                  oldVal === null ||
                  oldVal === ""
                ) {
                  result.missing++;
                  continue;
                }

                const oldNum = parseFloat(oldVal);
                const newNum = parseFloat(newVal);

                if (isNaN(oldNum) || isNaN(newNum)) {
                  if (String(oldVal) === String(newVal)) {
                    result.matches++;
                  } else {
                    result.mismatches++;
                    result.mismatchDetails.push({
                      legacyId,
                      path: nodePath,
                      old: oldVal,
                      new: newVal,
                    });
                  }
                  continue;
                }

                const diff = Math.abs(oldNum - newNum);
                const relDiff = oldNum !== 0 ? diff / Math.abs(oldNum) : diff;

                if (diff < ABS_TOL) {
                  result.matches++;
                } else if (relDiff < REL_TOL) {
                  result.close++;
                  result.closeDetails = result.closeDetails || [];
                  result.closeDetails.push({
                    legacyId,
                    path: nodePath,
                    old: oldNum,
                    new: newNum,
                    diff: diff.toFixed(4),
                    pctDiff: (relDiff * 100).toFixed(2) + "%",
                  });
                } else {
                  result.mismatches++;
                  result.mismatchDetails.push({
                    legacyId,
                    path: nodePath,
                    old: oldNum,
                    new: newNum,
                    diff: diff.toFixed(4),
                    pctDiff: (relDiff * 100).toFixed(2) + "%",
                  });
                }
              }

              // Check input nodes
              if (graph.getAllInputIds) {
                for (const inputPath of graph.getAllInputIds()) {
                  const input = graph.getInput(inputPath);
                  if (!input?.legacyId) continue;

                  const legacyId = input.legacyId;
                  const oldVal = SM.getValue(legacyId);
                  const newVal = state.getValueForModel(targetId, inputPath);

                  if (
                    oldVal === undefined ||
                    oldVal === null ||
                    oldVal === ""
                  )
                    continue;

                  const oldNum = parseFloat(oldVal);
                  const newNum = parseFloat(newVal);

                  if (isNaN(oldNum) || isNaN(newNum)) continue;

                  const diff = Math.abs(oldNum - newNum);
                  const relDiff = oldNum !== 0 ? diff / Math.abs(oldNum) : diff;

                  if (diff < ABS_TOL) {
                    result.matches++;
                  } else if (relDiff < REL_TOL) {
                    result.close++;
                  } else {
                    result.mismatches++;
                    result.mismatchDetails.push({
                      legacyId,
                      path: inputPath,
                      old: oldNum,
                      new: newNum,
                      diff: diff.toFixed(4),
                      pctDiff: (relDiff * 100).toFixed(2) + "%",
                      type: "input",
                    });
                  }
                }
              }

              resolve(result);
            }, 500);
          } catch (err) {
            resolve({ error: err.message, mismatches: 0, mismatchDetails: [] });
          }
        });
      }, csvContent);

      result.file = csvFile;
      allResults.push(result);

      if (result.mismatches > 0) {
        console.log(`  ❌ FAIL: ${result.mismatches} mismatches`);
        result.mismatchDetails.slice(0, 3).forEach((m) => {
          console.log(`     ${m.legacyId}: OLD=${m.old} NEW=${m.new}`);
        });
        // Show j_27 debug info if j_27 is a mismatch
        if (result.mismatchDetails.some(m => m.legacyId === "j_27") && result.j27Debug) {
          const d = result.j27Debug;
          console.log(`     [j_27 = d_136 - d_43 - i_43]`);
          console.log(`       d_136: OLD=${d.d_136.old.toFixed(2)} NEW=${d.d_136.new.toFixed(2)} diff=${(d.d_136.new - d.d_136.old).toFixed(2)}`);
          console.log(`       d_43:  OLD=${d.d_43.old.toFixed(2)} NEW=${d.d_43.new.toFixed(2)}`);
          console.log(`       i_43:  OLD=${d.i_43.old.toFixed(2)} NEW=${d.i_43.new.toFixed(2)}`);
          console.log(`     [d_136 = k51 + d117 + d114 + m43 + h70]`);
          console.log(`       k_51:  OLD=${d.k_51.old.toFixed(2)} NEW=${d.k_51.new.toFixed(2)} diff=${(d.k_51.new - d.k_51.old).toFixed(2)}`);
          console.log(`       d_117: OLD=${d.d_117.old.toFixed(2)} NEW=${d.d_117.new.toFixed(2)} diff=${(d.d_117.new - d.d_117.old).toFixed(2)}`);
          console.log(`       d_114: OLD=${d.d_114.old.toFixed(2)} NEW=${d.d_114.new.toFixed(2)} diff=${(d.d_114.new - d.d_114.old).toFixed(2)}`);
          console.log(`       m_43:  OLD=${d.m_43.old.toFixed(2)} NEW=${d.m_43.new.toFixed(2)}`);
          console.log(`       h_70:  OLD=${d.h_70.old.toFixed(2)} NEW=${d.h_70.new.toFixed(2)}`);
          console.log(`     [d_114 = d_127 / copHeat]`);
          console.log(`       d_127 (TED):    OLD=${d.d_127.old.toFixed(2)} NEW=${d.d_127.new.toFixed(2)} diff=${(d.d_127.new - d.d_127.old).toFixed(2)}`);
          console.log(`       copHeat:        OLD=${d.copHeat.old.toFixed(4)} NEW=${d.copHeat.new.toFixed(4)}`);
          console.log(`     [d_117 = m_129 / copCool]`);
          console.log(`       m_129 (CED):    OLD=${d.m_129.old.toFixed(2)} NEW=${d.m_129.new.toFixed(2)} diff=${(d.m_129.new - d.m_129.old).toFixed(2)}`);
          console.log(`       copCool:        OLD=${d.copCool.old.toFixed(4)} NEW=${d.copCool.new.toFixed(4)}`);
          console.log(`     [Raw inputs]`);
          console.log(`       f_113 (HSPF):   OLD=${d.f_113.old.toFixed(2)} NEW=${d.f_113.new.toFixed(2)}`);
          console.log(`       h_113 (copHeat):OLD=${d.h_113.old.toFixed(4)}`);
        }
      } else {
        console.log(
          `  ✅ PASS (${result.matches} matches, ${result.close} close)`
        );
        if (result.closeDetails && result.closeDetails.length > 0) {
          result.closeDetails.forEach((c) => {
            console.log(`     ~ ${c.legacyId}: OLD=${c.old} NEW=${c.new} (${c.pctDiff})`);
          });
        }
      }
    }

    // Write results to file
    const output = {
      timestamp: new Date().toISOString(),
      summary: {
        total: csvFiles.length,
        passed: allResults.filter((r) => !r.error && r.mismatches === 0).length,
        failed: allResults.filter((r) => r.error || r.mismatches > 0).length,
      },
      uniqueMismatches: collectUniqueMismatches(allResults),
      byFile: allResults.map((r) => ({
        file: r.file,
        matches: r.matches,
        close: r.close,
        mismatches: r.mismatches,
        error: r.error,
      })),
    };

    fs.writeFileSync(RESULTS_FILE, JSON.stringify(output, null, 2));
    console.log(`\nResults written to ${RESULTS_FILE}`);

    // Assert no mismatches
    const totalMismatches = allResults.reduce(
      (sum, r) => sum + (r.mismatches || 0),
      0
    );
    expect(totalMismatches).toBe(0);
  });
});

function collectUniqueMismatches(allResults) {
  const map = new Map();
  allResults.forEach((r) => {
    (r.mismatchDetails || []).forEach((m) => {
      if (!map.has(m.legacyId)) {
        map.set(m.legacyId, {
          legacyId: m.legacyId,
          path: m.path,
          occurrences: [],
        });
      }
      map.get(m.legacyId).occurrences.push({
        file: r.file,
        old: m.old,
        new: m.new,
        pctDiff: m.pctDiff,
      });
    });
  });
  return Array.from(map.values());
}
