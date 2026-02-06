/**
 * Case Study Batch Runner
 *
 * Paste this in the browser console after calculator loads.
 * It will prompt for CSV files, run validation on each, and save results.
 *
 * Usage: Just paste this entire script in the console.
 */
(async function() {
  'use strict';

  const TOLERANCE = 0.01;
  const ABS_TOLERANCE = 0.01;

  console.log('='.repeat(60));
  console.log('CASE STUDY BATCH VALIDATION');
  console.log('='.repeat(60));
  console.log('Select your CSV files when prompted...\n');

  // Create file picker
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.accept = '.csv';

  const files = await new Promise(resolve => {
    input.onchange = e => resolve(Array.from(e.target.files));
    input.click();
  });

  if (files.length === 0) {
    console.log('No files selected. Aborting.');
    return;
  }

  console.log(`Processing ${files.length} files...\n`);

  const allResults = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`[${i + 1}/${files.length}] ${file.name}`);

    try {
      // Read CSV
      const csv = await file.text();

      // Import using FileHandler
      await new Promise((resolve, reject) => {
        try {
          TEUI.fileHandler.processImportedCSV(csv);
          setTimeout(resolve, 500); // Wait for calculations
        } catch (e) {
          reject(e);
        }
      });

      // Run validation
      const result = runValidation(file.name);
      allResults.push(result);

      if (result.mismatches > 0) {
        console.log(`  ❌ FAIL: ${result.mismatches} mismatches`);
        result.mismatchDetails.slice(0, 5).forEach(m => {
          console.log(`     ${m.legacyId}: OLD=${m.old} NEW=${m.new} (${m.pctDiff})`);
        });
        if (result.mismatchDetails.length > 5) {
          console.log(`     ... and ${result.mismatchDetails.length - 5} more`);
        }
      } else {
        console.log(`  ✅ PASS (${result.matches} matches, ${result.close} close)`);
      }

    } catch (err) {
      console.log(`  ⚠️ ERROR: ${err.message}`);
      allResults.push({ file: file.name, error: err.message, mismatches: 0, mismatchDetails: [] });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const passed = allResults.filter(r => !r.error && r.mismatches === 0).length;
  const failed = allResults.filter(r => r.error || r.mismatches > 0).length;

  console.log(`Passed: ${passed}/${files.length}`);
  console.log(`Failed: ${failed}/${files.length}`);

  // Collect all unique mismatches across files
  const mismatchMap = new Map();
  allResults.forEach(r => {
    (r.mismatchDetails || []).forEach(m => {
      const key = m.legacyId;
      if (!mismatchMap.has(key)) {
        mismatchMap.set(key, {
          legacyId: m.legacyId,
          semanticPath: m.semanticPath,
          occurrences: [],
          type: m.type || 'computed'
        });
      }
      mismatchMap.get(key).occurrences.push({
        file: r.file,
        old: m.old,
        new: m.new,
        diff: m.diff,
        pctDiff: m.pctDiff
      });
    });
  });

  // Output JSON
  const output = {
    timestamp: new Date().toISOString(),
    summary: { total: files.length, passed, failed },
    uniqueMismatches: Array.from(mismatchMap.values()),
    byFile: allResults.map(r => ({
      file: r.file,
      matches: r.matches,
      close: r.close,
      mismatches: r.mismatches,
      error: r.error
    }))
  };

  console.log('\n📋 JSON OUTPUT:\n');
  console.log(JSON.stringify(output, null, 2));

  // Also save to window for easy access
  window.CASE_STUDY_RESULTS = output;
  console.log('\n💾 Results saved to window.CASE_STUDY_RESULTS');

  // Create downloadable file
  const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'case-study-validation-results.json';
  a.click();
  console.log('📥 Results downloaded as case-study-validation-results.json');

  function runValidation(filename) {
    const graph = TEUI.ComputationIntegration?.getGraph?.();
    const state = TEUI.ComputationIntegration?.getState?.();
    const SM = TEUI.StateManager;

    if (!graph || !state || !SM) {
      throw new Error('ComputationIntegration not ready');
    }

    const result = {
      file: filename,
      matches: 0,
      close: 0,
      mismatches: 0,
      missing: 0,
      mismatchDetails: []
    };

    const targetId = state.getActiveModelId();

    // Check computation nodes
    for (const path of graph.getAllNodeIds()) {
      const node = graph.getNode(path);
      if (!node?.legacyId) continue;

      const legacyId = node.legacyId;
      const oldVal = SM.getValue(legacyId);
      const newVal = state.getValueForModel(targetId, path);

      compare(result, legacyId, path, oldVal, newVal, 'computed');
    }

    // Check input nodes
    if (graph.getAllInputIds) {
      for (const path of graph.getAllInputIds()) {
        const input = graph.getInput(path);
        if (!input?.legacyId) continue;

        const legacyId = input.legacyId;
        const oldVal = SM.getValue(legacyId);
        const newVal = state.getValueForModel(targetId, path);

        compare(result, legacyId, path, oldVal, newVal, 'input');
      }
    }

    return result;
  }

  function compare(result, legacyId, path, oldVal, newVal, type) {
    if (oldVal === undefined || oldVal === null || oldVal === '') {
      result.missing++;
      return;
    }

    const oldNum = parseFloat(oldVal);
    const newNum = parseFloat(newVal);

    if (isNaN(oldNum) || isNaN(newNum)) {
      if (String(oldVal) === String(newVal)) {
        result.matches++;
      } else {
        result.mismatches++;
        result.mismatchDetails.push({ legacyId, semanticPath: path, old: oldVal, new: newVal, type });
      }
      return;
    }

    const diff = Math.abs(oldNum - newNum);
    const relDiff = oldNum !== 0 ? diff / Math.abs(oldNum) : diff;

    if (diff < ABS_TOLERANCE) {
      result.matches++;
    } else if (relDiff < TOLERANCE) {
      result.close++;
    } else {
      result.mismatches++;
      result.mismatchDetails.push({
        legacyId,
        semanticPath: path,
        old: oldNum,
        new: newNum,
        diff: diff.toFixed(4),
        pctDiff: (relDiff * 100).toFixed(2) + '%',
        type
      });
    }
  }

})();
