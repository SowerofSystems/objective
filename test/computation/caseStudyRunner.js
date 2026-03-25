/**
 * Case Study Validation Runner
 *
 * Run this in the browser console after the calculator is loaded.
 * Then call: await TEUI.CaseStudyRunner.runAll()
 *
 * It will prompt you to select CSV files, import each one,
 * run validation, and output results.
 */
(function() {
  'use strict';

  window.TEUI = window.TEUI || {};

  const TOLERANCE = 0.01; // 1% relative tolerance for "close"
  const ABS_TOLERANCE = 0.01; // Absolute tolerance for exact match

  /**
   * Run validation comparison between StateManager and ComputationGraph
   */
  function runValidation() {
    const graph = TEUI.ComputationIntegration?.getGraph?.();
    const state = TEUI.ComputationIntegration?.getState?.();
    const StateManager = TEUI.StateManager;

    if (!graph || !state || !StateManager) {
      return { error: 'ComputationIntegration not initialized' };
    }

    const results = {
      matches: 0,
      close: 0,
      mismatches: 0,
      missing: 0,
      mismatchDetails: []
    };

    const targetId = state.getActiveModelId();

    // Check all computation nodes
    const nodeIds = graph.getAllNodeIds();
    for (const semanticPath of nodeIds) {
      const node = graph.getNode(semanticPath);
      if (!node?.legacyId) continue;

      const legacyId = node.legacyId;
      const oldValue = StateManager.getValue(legacyId);
      const newValue = state.getValueForModel(targetId, semanticPath);

      if (oldValue === undefined || oldValue === null || oldValue === '') {
        results.missing++;
        continue;
      }

      const oldNum = parseFloat(oldValue);
      const newNum = parseFloat(newValue);

      if (isNaN(oldNum) || isNaN(newNum)) {
        if (String(oldValue) === String(newValue)) {
          results.matches++;
        } else {
          results.mismatches++;
          results.mismatchDetails.push({
            legacyId,
            semanticPath,
            old: oldValue,
            new: newValue
          });
        }
      } else {
        const diff = Math.abs(oldNum - newNum);
        const relativeDiff = oldNum !== 0 ? diff / Math.abs(oldNum) : diff;

        if (diff < ABS_TOLERANCE) {
          results.matches++;
        } else if (relativeDiff < TOLERANCE) {
          results.close++;
        } else {
          results.mismatches++;
          results.mismatchDetails.push({
            legacyId,
            semanticPath,
            old: oldNum,
            new: newNum,
            diff: diff.toFixed(4),
            pctDiff: (relativeDiff * 100).toFixed(2) + '%'
          });
        }
      }
    }

    // Also check input nodes
    const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];
    for (const semanticPath of inputIds) {
      const input = graph.getInput(semanticPath);
      if (!input?.legacyId) continue;

      const legacyId = input.legacyId;
      const oldValue = StateManager.getValue(legacyId);
      const newValue = state.getValueForModel(targetId, semanticPath);

      if (oldValue === undefined || oldValue === null || oldValue === '') {
        continue; // Skip missing inputs
      }

      const oldNum = parseFloat(oldValue);
      const newNum = parseFloat(newValue);

      if (!isNaN(oldNum) && !isNaN(newNum)) {
        const diff = Math.abs(oldNum - newNum);
        const relativeDiff = oldNum !== 0 ? diff / Math.abs(oldNum) : diff;

        if (diff < ABS_TOLERANCE) {
          results.matches++;
        } else if (relativeDiff < TOLERANCE) {
          results.close++;
        } else {
          results.mismatches++;
          results.mismatchDetails.push({
            legacyId,
            semanticPath,
            old: oldNum,
            new: newNum,
            diff: diff.toFixed(4),
            pctDiff: (relativeDiff * 100).toFixed(2) + '%',
            type: 'input'
          });
        }
      }
    }

    return results;
  }

  /**
   * Import a CSV string using FileHandler logic
   */
  function importCSV(csvString, filename) {
    return new Promise((resolve, reject) => {
      try {
        const fileHandler = TEUI.fileHandler;
        if (!fileHandler) {
          reject(new Error('FileHandler not available'));
          return;
        }

        // Use the existing processImportedCSV method
        // We need to temporarily capture the result
        const originalShowStatus = fileHandler.showStatus?.bind(fileHandler);
        let importSuccess = false;

        fileHandler.showStatus = (msg, type) => {
          if (type === 'success') importSuccess = true;
          if (type === 'error') reject(new Error(msg));
          originalShowStatus?.(msg, type);
        };

        fileHandler.processImportedCSV(csvString);

        // Restore original
        fileHandler.showStatus = originalShowStatus;

        // Give it a moment for calculations to settle
        setTimeout(() => {
          resolve(importSuccess);
        }, 500);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Run tests on multiple CSV files
   */
  async function runAll() {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.csv';

    return new Promise((resolve) => {
      input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) {
          console.log('No files selected');
          resolve(null);
          return;
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`CASE STUDY VALIDATION - ${files.length} files`);
        console.log(`${'='.repeat(60)}\n`);

        const allResults = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          console.log(`\n[${i + 1}/${files.length}] Testing: ${file.name}`);
          console.log('-'.repeat(40));

          try {
            // Read file
            const csvContent = await readFileAsText(file);

            // Import CSV
            await importCSV(csvContent, file.name);

            // Run validation
            const result = runValidation();
            result.file = file.name;

            allResults.push(result);

            // Log summary for this file
            console.log(`  Matches: ${result.matches}`);
            console.log(`  Close: ${result.close}`);
            console.log(`  Mismatches: ${result.mismatches}`);
            console.log(`  Missing: ${result.missing}`);

            if (result.mismatches > 0) {
              console.log(`  FAILED - Mismatches:`);
              result.mismatchDetails.forEach(m => {
                console.log(`    ${m.legacyId}: OLD=${m.old} | NEW=${m.new} (${m.pctDiff || 'N/A'})`);
              });
            } else {
              console.log(`  PASSED`);
            }

          } catch (error) {
            console.error(`  ERROR: ${error.message}`);
            allResults.push({
              file: file.name,
              error: error.message,
              matches: 0,
              close: 0,
              mismatches: 0,
              missing: 0,
              mismatchDetails: []
            });
          }

          // Small delay between tests
          await sleep(200);
        }

        // Final summary
        console.log(`\n${'='.repeat(60)}`);
        console.log('SUMMARY');
        console.log(`${'='.repeat(60)}`);

        const passed = allResults.filter(r => !r.error && r.mismatches === 0).length;
        const failed = allResults.filter(r => r.error || r.mismatches > 0).length;
        const totalMismatches = allResults.reduce((s, r) => s + (r.mismatches || 0), 0);

        console.log(`Total files: ${files.length}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Total mismatches: ${totalMismatches}`);

        // Output JSON for Claude
        const output = {
          timestamp: new Date().toISOString(),
          summary: {
            totalFiles: files.length,
            passed,
            failed,
            totalMismatches
          },
          failedTests: allResults
            .filter(r => r.error || r.mismatches > 0)
            .map(r => ({
              file: r.file,
              error: r.error,
              mismatches: r.mismatchDetails || []
            }))
        };

        console.log('\n--- JSON OUTPUT (copy this for Claude) ---');
        console.log(JSON.stringify(output, null, 2));
        console.log('--- END JSON OUTPUT ---\n');

        resolve(output);
      };

      input.click();
    });
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Export
  TEUI.CaseStudyRunner = {
    runAll,
    runValidation,
    importCSV
  };

  console.log('[CaseStudyRunner] Loaded. Run: await TEUI.CaseStudyRunner.runAll()');
})();
