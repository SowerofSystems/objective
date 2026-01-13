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

              const result = {
                matches: 0,
                close: 0,
                mismatches: 0,
                missing: 0,
                mismatchDetails: [],
              };

              const targetId = state.getActiveModelId();
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
      } else {
        console.log(
          `  ✅ PASS (${result.matches} matches, ${result.close} close)`
        );
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
