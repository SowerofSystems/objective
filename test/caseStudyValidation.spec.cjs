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
      { timeout: 60000 }
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
                m_43: { old: parseFloat(SM.getValue("m_43")) || 0, new: parseFloat(state.getValueForModel(targetId, "renewable.onsiteTotal")) || 0 },
                h_70: { old: parseFloat(SM.getValue("h_70")) || 0, new: parseFloat(state.getValueForModel(targetId, "energy.plugLoads.subtotal")) || 0 },
                // d_114 inputs: TED / COPheat
                d_127: { old: parseFloat(SM.getValue("d_127")) || 0, new: parseFloat(state.getValueForModel(targetId, "energy.ted.heating")) || 0 },
                // FIX: Compare h_113 (legacy) vs h_113 (graph's mechanical.heating.copHeat)
                copHeat_h113: { old: parseFloat(SM.getValue("h_113")) || 0, new: parseFloat(state.getValueForModel(targetId, "mechanical.heating.copHeat")) || 0 },
                // d_117 inputs: m_129 / COP
                m_129: { old: parseFloat(SM.getValue("m_129")) || 0, new: parseFloat(state.getValueForModel(targetId, "energy.ced.mitigated")) || 0 },
                // FIX: The effective COP doesn't exist as a single field in legacy - show both components
                j_113_coolDerived: { old: parseFloat(SM.getValue("j_113")) || 0, new: parseFloat(state.getValueForModel(targetId, "mechanical.heating.copCoolDerived")) || 0 },
                j_116_coolDedicated: { old: parseFloat(SM.getValue("j_116")) || 0, new: parseFloat(state.getValueForModel(targetId, "mechanical.cooling.copDedicated")) || 0 },
                // Raw HSPF input
                f_113: { old: parseFloat(SM.getValue("f_113")) || 0, new: parseFloat(state.getValueForModel(targetId, "mechanical.heating.hspf")) || 0 },
                // CED chain: d_129 (unmitigated) - check heat gain components
                d_129_ced_unmit: { old: parseFloat(SM.getValue("d_129")) || 0, new: parseFloat(state.getValueForModel(targetId, "energy.ced.unmitigated")) || 0 },
                k_104_heatGain: { old: parseFloat(SM.getValue("k_104")) || 0, new: parseFloat(state.getValueForModel(targetId, "envelope.total.heatGain")) || 0 },
                // m_129 = d_129 - h_124 - d_123
                h_124_freeCool: { old: parseFloat(SM.getValue("h_124")) || 0, new: parseFloat(state.getValueForModel(targetId, "cooling.freeCoolingLimit")) || 0 },
                d_123_ventRecov: { old: parseFloat(SM.getValue("d_123")) || 0, new: parseFloat(state.getValueForModel(targetId, "ventilation.energyRecoveredCooling")) || 0 },
              };

              // Debug climate and cooling inputs
              const climateDebug = {
                d_19_province: { old: SM.getValue("d_19"), new: state.getValueForModel(targetId, "climate.location.province") },
                h_19_city: { old: SM.getValue("h_19"), new: state.getValueForModel(targetId, "climate.location.city") },
                h_20_timeframe: { old: SM.getValue("h_20"), new: state.getValueForModel(targetId, "climate.timeframe") },
                d_21_cdd: { old: SM.getValue("d_21"), new: state.getValueForModel(targetId, "climate.cooling.degreedays") },
                d_116_coolingType: { old: SM.getValue("d_116"), new: state.getValueForModel(targetId, "mechanical.cooling.systemType") },
                d_113_heatingType: { old: SM.getValue("d_113"), new: state.getValueForModel(targetId, "mechanical.heating.systemType") },
              };

              // Debug i_103 (air leakage heat loss) chain
              // Formula: i_103 = (1.21 × NRL50 × area × HDD × 24) / (N_factor × 1000)
              const i103Debug = {
                i_103: { old: parseFloat(SM.getValue("i_103")) || 0, new: parseFloat(state.getValueForModel(targetId, "airTightness.heatLoss")) || 0 },
                g_108_nrl50: { old: parseFloat(SM.getValue("g_108")) || 0, new: parseFloat(state.getValueForModel(targetId, "airTightness.nrl50")) || 0 },
                d_101_area: { old: parseFloat(SM.getValue("d_101")) || 0, new: parseFloat(state.getValueForModel(targetId, "envelope.airFacing.area")) || 0 },
                g_110_nFactor: { old: parseFloat(SM.getValue("g_110")) || 0, new: parseFloat(state.getValueForModel(targetId, "airTightness.nFactor")) || 0 },
                h_20_hdd: { old: parseFloat(SM.getValue("h_20")) || 0, new: parseFloat(state.getValueForModel(targetId, "climate.heating.degreedays")) || 0 },
                // NRL50 inputs
                d_108_method: { old: SM.getValue("d_108"), new: state.getValueForModel(targetId, "airTightness.method") },
                g_109_measuredAch50: { old: parseFloat(SM.getValue("g_109")) || 0, new: parseFloat(state.getValueForModel(targetId, "airTightness.measuredAch50")) || 0 },
                d_105_volume: { old: parseFloat(SM.getValue("d_105")) || 0, new: parseFloat(state.getValueForModel(targetId, "volume.conditioned")) || 0 },
              };

              // Debug Reference model
              // NOTE: Don't call populateReferenceModel() here - it was already called in
              // Calculator.calculateAll(). Calling again would show correct values but
              // they weren't the ones used during computation (useful for debugging setup,
              // but misleading for diagnosing computation issues).
              const CI = window.TEUI.ComputationIntegration;
              const refPopDebug = null; // See note above

              const refDebug = {
                // Key Reference outputs
                ref_j_32: { old: parseFloat(SM.getValue("ref_j_32")) || 0, new: 0 },
                ref_h_15: { old: parseFloat(SM.getValue("ref_h_15")) || 0, new: 0 },
                e_10: { old: parseFloat(SM.getValue("e_10")) || 0, new: 0 },
                // Reference envelope inputs from StateManager (should come from ReferenceValues.js)
                ref_f_85: SM.getValue("ref_f_85"),
                ref_f_86: SM.getValue("ref_f_86"),
                ref_g_89: SM.getValue("ref_g_89"),
                ref_f_113: SM.getValue("ref_f_113"),
                ref_d_118: SM.getValue("ref_d_118"),
                // Standard selection (d_13 is the standard dropdown)
                d_13: SM.getValue("d_13"),
                // Debug info from populateReferenceModel
                populateDebug: refPopDebug?.debug || null,
              };

              // Get Reference model values if available
              const models = state.getAllModels ? state.getAllModels() : [];
              const refModel = models.find(m => m.modelType === "reference");
              if (refModel) {
                // Use correct semantic paths for Reference model inputs/outputs
                refDebug.ref_j_32.new = parseFloat(state.getValueForModel(refModel.id, "reference.energy.total")) || 0;
                refDebug.ref_h_15.new = parseFloat(state.getValueForModel(refModel.id, "reference.building.conditionedFloorArea")) || 0;
                refDebug.e_10.new = parseFloat(state.getValueForModel(refModel.id, "keyValues.reference.teui")) || 0;
              }

              // Also get the TARGET model's reference.* values (used for e_10 computation)
              refDebug.targetRefJ32 = parseFloat(state.getValueForModel(targetId, "reference.energy.total")) || 0;
              refDebug.targetRefH15 = parseFloat(state.getValueForModel(targetId, "reference.building.conditionedFloorArea")) || 0;
              refDebug.targetE10 = parseFloat(state.getValueForModel(targetId, "keyValues.reference.teui")) || 0;

              const result = {
                matches: 0,
                close: 0,
                mismatches: 0,
                missing: 0,
                mismatchDetails: [],
                j27Debug,
                climateDebug,
                i103Debug,
                refDebug,
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
          console.log(`       d_127 (TED):         OLD=${d.d_127.old.toFixed(2)} NEW=${d.d_127.new.toFixed(2)} diff=${(d.d_127.new - d.d_127.old).toFixed(2)}`);
          console.log(`       h_113 (copHeat):     OLD=${d.copHeat_h113.old.toFixed(4)} NEW=${d.copHeat_h113.new.toFixed(4)}`);
          console.log(`     [d_117 = m_129 / copCool]`);
          console.log(`       m_129 (CED mit):     OLD=${d.m_129.old.toFixed(2)} NEW=${d.m_129.new.toFixed(2)} diff=${(d.m_129.new - d.m_129.old).toFixed(2)}`);
          console.log(`       j_113 (coolDerived): OLD=${d.j_113_coolDerived.old.toFixed(4)} NEW=${d.j_113_coolDerived.new.toFixed(4)}`);
          console.log(`       j_116 (coolDedic):   OLD=${d.j_116_coolDedicated.old.toFixed(4)} NEW=${d.j_116_coolDedicated.new.toFixed(4)}`);
          console.log(`     [CED chain: m_129 = d_129 - h_124 - d_123]`);
          console.log(`       d_129 (CED unmit):   OLD=${d.d_129_ced_unmit.old.toFixed(2)} NEW=${d.d_129_ced_unmit.new.toFixed(2)}`);
          console.log(`       h_124 (free cool):   OLD=${d.h_124_freeCool.old.toFixed(2)} NEW=${d.h_124_freeCool.new.toFixed(2)}`);
          console.log(`       d_123 (vent recov):  OLD=${d.d_123_ventRecov.old.toFixed(2)} NEW=${d.d_123_ventRecov.new.toFixed(2)}`);
          console.log(`       k_104 (heat gain):   OLD=${d.k_104_heatGain.old.toFixed(2)} NEW=${d.k_104_heatGain.new.toFixed(2)}`);
          console.log(`     [Raw inputs]`);
          console.log(`       f_113 (HSPF):        OLD=${d.f_113.old.toFixed(2)} NEW=${d.f_113.new.toFixed(2)}`);
        }
        // Show i_103 debug if i_103 is a mismatch
        if (result.mismatchDetails.some(m => m.legacyId === "i_103") && result.i103Debug) {
          const a = result.i103Debug;
          console.log(`     [i_103 Air Leakage Chain]`);
          console.log(`       i_103 result:    OLD=${a.i_103.old.toFixed(2)} NEW=${a.i_103.new.toFixed(2)} diff=${(a.i_103.new - a.i_103.old).toFixed(2)}`);
          console.log(`       g_108 NRL50:     OLD=${a.g_108_nrl50.old.toFixed(4)} NEW=${a.g_108_nrl50.new.toFixed(4)}`);
          console.log(`       d_101 area:      OLD=${a.d_101_area.old.toFixed(2)} NEW=${a.d_101_area.new.toFixed(2)}`);
          console.log(`       g_110 nFactor:   OLD=${a.g_110_nFactor.old.toFixed(2)} NEW=${a.g_110_nFactor.new.toFixed(2)}`);
          console.log(`       h_20 HDD:        OLD=${a.h_20_hdd.old.toFixed(2)} NEW=${a.h_20_hdd.new.toFixed(2)}`);
          console.log(`     [NRL50 Inputs]`);
          console.log(`       d_108 method:    OLD="${a.d_108_method.old}" NEW="${a.d_108_method.new}"`);
          console.log(`       g_109 measAch50: OLD=${a.g_109_measuredAch50.old.toFixed(2)} NEW=${a.g_109_measuredAch50.new.toFixed(2)}`);
          console.log(`       d_105 volume:    OLD=${a.d_105_volume.old.toFixed(2)} NEW=${a.d_105_volume.new.toFixed(2)}`);
        }
        // Show e_10 Reference debug if e_10 is a mismatch
        if (result.mismatchDetails.some(m => m.legacyId === "e_10") && result.refDebug) {
          const r = result.refDebug;
          console.log(`     [e_10 Reference TEUI Chain]`);
          console.log(`       e_10 result:     OLD=${r.e_10.old.toFixed(2)} NEW=${r.e_10.new.toFixed(2)} diff=${(r.e_10.new - r.e_10.old).toFixed(2)}`);
          console.log(`       ref_j_32 total:  OLD=${r.ref_j_32.old.toFixed(2)} NEW=${r.ref_j_32.new.toFixed(2)}`);
          console.log(`       ref_h_15 area:   OLD=${r.ref_h_15.old.toFixed(2)} NEW=${r.ref_h_15.new.toFixed(2)}`);
          console.log(`       d_13 standard:   "${r.d_13}"`);
          console.log(`     [Target Model's reference.* values (used for e_10)]`);
          console.log(`       targetRefJ32:    ${r.targetRefJ32?.toFixed(2) || 'N/A'}`);
          console.log(`       targetRefH15:    ${r.targetRefH15?.toFixed(2) || 'N/A'}`);
          console.log(`       targetE10:       ${r.targetE10?.toFixed(2) || 'N/A'}`);
          console.log(`     [Reference C-Field Sources]`);
          console.log(`       ref_f_85 (walls): ${r.ref_f_85}`);
          console.log(`       ref_f_86 (roof):  ${r.ref_f_86}`);
          console.log(`       ref_g_89 (win):   ${r.ref_g_89}`);
          console.log(`       ref_f_113 (hspf): ${r.ref_f_113}`);
          console.log(`       ref_d_118 (hrv):  ${r.ref_d_118}`);
          if (r.populateDebug) {
            const pd = r.populateDebug;
            console.log(`     [populateReferenceModel Debug]`);
            console.log(`       Standard: ${pd.standardName}`);
            console.log(`       G-fields copied: ${pd.gFields.length}`);
            console.log(`       C-fields from standard: ${pd.cFieldsFromStandard.length}`);
            console.log(`       C-fields from StateManager: ${pd.cFieldsFromStateManager.length}`);
            console.log(`       C-fields copied from Target: ${pd.cFieldsCopiedFromTarget.length}`);
            if (pd.cFieldsCopiedFromTarget.length > 0) {
              console.log(`       ⚠️  C-fields fallback to Target (potential issues):`);
              pd.cFieldsCopiedFromTarget.slice(0, 10).forEach(f => {
                console.log(`         - ${f.legacyId}: ${f.value}`);
              });
              if (pd.cFieldsCopiedFromTarget.length > 10) {
                console.log(`         ... and ${pd.cFieldsCopiedFromTarget.length - 10} more`);
              }
            }
          }
        }
        // Always show climate debug for mismatches
        if (result.climateDebug) {
          const c = result.climateDebug;
          console.log(`     [Climate & Mechanical Inputs]`);
          console.log(`       d_19 province:  OLD="${c.d_19_province.old}" NEW="${c.d_19_province.new}"`);
          console.log(`       h_19 city:      OLD="${c.h_19_city.old}" NEW="${c.h_19_city.new}"`);
          console.log(`       h_20 timeframe: OLD="${c.h_20_timeframe.old}" NEW="${c.h_20_timeframe.new}"`);
          console.log(`       d_21 CDD:       OLD="${c.d_21_cdd.old}" NEW="${c.d_21_cdd.new}"`);
          console.log(`       d_116 cooling:  OLD="${c.d_116_coolingType.old}" NEW="${c.d_116_coolingType.new}"`);
          console.log(`       d_113 heating:  OLD="${c.d_113_heatingType.old}" NEW="${c.d_113_heatingType.new}"`);
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
