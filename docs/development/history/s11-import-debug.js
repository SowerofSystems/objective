/**
 * S11 IMPORT CASCADE DEBUG SCRIPT
 *
 * PURPOSE: Trace why S11 Reference values don't propagate to downstream sections after import
 *
 * HYPOTHESIS: S12 is reading S11 Reference values BEFORE S11's calculateReferenceModel() completes,
 * resulting in undefined/null values cascading to S15, which shows "interim partially calculated values"
 *
 * HOW TO USE:
 * 1. Open browser console
 * 2. Paste this entire script
 * 3. Import an Excel file
 * 4. Check console output for timing and value flow
 */

(function() {
  console.log('%c[S11-DEBUG] Installing import cascade tracer...', 'color: #0f0; font-weight: bold;');

  // Track critical S11 Reference outputs
  const s11Outputs = ['ref_i_98', 'ref_k_98', 'ref_i_97', 'ref_k_97'];

  // Track critical S12 Reference outputs (needed by S15)
  const s12Outputs = ['ref_g_101', 'ref_d_101', 'ref_i_104'];

  // Track S15 Reference input reads
  const s15Inputs = ['ref_i_104', 'ref_g_101', 'ref_d_101'];

  let importStarted = false;

  // Intercept FileHandler.processImportedExcel
  const originalFileHandler = window.TEUI?.FileHandler?.processImportedExcel;
  if (originalFileHandler && window.TEUI?.FileHandler) {
    window.TEUI.FileHandler.processImportedExcel = function(...args) {
      console.log('%c[S11-DEBUG] ========== IMPORT STARTED ==========', 'color: #ff0; font-weight: bold; font-size: 14px;');
      importStarted = true;

      // Call original
      const result = originalFileHandler.apply(this, args);

      console.log('%c[S11-DEBUG] ========== IMPORT COMPLETE ==========', 'color: #ff0; font-weight: bold; font-size: 14px;');
      importStarted = false;

      return result;
    };
  }

  // Intercept S11.calculateReferenceModel
  const s11Module = window.TEUI?.SectionModules?.sect11;
  if (s11Module) {
    const originalS11CalcAll = s11Module.calculateAll;

    s11Module.calculateAll = function(...args) {
      const timestamp = performance.now().toFixed(2);
      console.log(`%c[S11-DEBUG ${timestamp}ms] S11.calculateAll() STARTED`, 'color: #0ff; font-weight: bold;');

      // Check S11 outputs BEFORE calculation
      console.log('%c[S11-DEBUG] S11 Reference outputs BEFORE calculateAll:', 'color: #888;');
      s11Outputs.forEach(fieldId => {
        const value = window.TEUI?.StateManager?.getValue(fieldId);
        console.log(`  ${fieldId} = ${value}`);
      });

      // Call original
      const result = originalS11CalcAll.apply(this, args);

      // Check S11 outputs AFTER calculation
      const timestampAfter = performance.now().toFixed(2);
      console.log(`%c[S11-DEBUG ${timestampAfter}ms] S11.calculateAll() FINISHED`, 'color: #0ff; font-weight: bold;');
      console.log('%c[S11-DEBUG] S11 Reference outputs AFTER calculateAll:', 'color: #0f0;');
      s11Outputs.forEach(fieldId => {
        const value = window.TEUI?.StateManager?.getValue(fieldId);
        console.log(`  ${fieldId} = ${value}`);
      });

      return result;
    };
  }

  // Intercept S12.calculateAll
  const s12Module = window.TEUI?.SectionModules?.sect12;
  if (s12Module) {
    const originalS12CalcAll = s12Module.calculateAll;

    s12Module.calculateAll = function(...args) {
      const timestamp = performance.now().toFixed(2);
      console.log(`%c[S11-DEBUG ${timestamp}ms] S12.calculateAll() STARTED`, 'color: #f0f; font-weight: bold;');

      // Check what S12 READS from S11 (S12 reads ref_i_98 for calculations)
      console.log('%c[S11-DEBUG] S12 reading S11 Reference values:', 'color: #888;');
      s11Outputs.forEach(fieldId => {
        const value = window.TEUI?.StateManager?.getValue(fieldId);
        console.log(`  ${fieldId} = ${value}`);
      });

      // Call original
      const result = originalS12CalcAll.apply(this, args);

      // Check S12 outputs AFTER calculation
      const timestampAfter = performance.now().toFixed(2);
      console.log(`%c[S11-DEBUG ${timestampAfter}ms] S12.calculateAll() FINISHED`, 'color: #f0f; font-weight: bold;');
      console.log('%c[S11-DEBUG] S12 Reference outputs AFTER calculateAll:', 'color: #0f0;');
      s12Outputs.forEach(fieldId => {
        const value = window.TEUI?.StateManager?.getValue(fieldId);
        console.log(`  ${fieldId} = ${value}`);
      });

      return result;
    };
  }

  // Intercept S15.calculateReferenceModel
  const s15Module = window.TEUI?.SectionModules?.sect15;
  if (s15Module) {
    const originalS15CalcAll = s15Module.calculateAll;

    s15Module.calculateAll = function(...args) {
      const timestamp = performance.now().toFixed(2);
      console.log(`%c[S11-DEBUG ${timestamp}ms] S15.calculateAll() STARTED`, 'color: #fa0; font-weight: bold;');

      // Check what S15 READS from S12
      console.log('%c[S11-DEBUG] S15 reading S12 Reference values:', 'color: #888;');
      s15Inputs.forEach(fieldId => {
        const value = window.TEUI?.StateManager?.getValue(fieldId);
        console.log(`  ${fieldId} = ${value}`);
      });

      // Call original
      const result = originalS15CalcAll.apply(this, args);

      const timestampAfter = performance.now().toFixed(2);
      console.log(`%c[S11-DEBUG ${timestampAfter}ms] S15.calculateAll() FINISHED`, 'color: #fa0; font-weight: bold;');

      return result;
    };
  }

  // Intercept S01.updateTEUIDisplay to see final e_10
  const s01Module = window.TEUI?.SectionModules?.sect01;
  if (s01Module) {
    const originalUpdateTEUI = s01Module.updateTEUIDisplay;

    if (originalUpdateTEUI) {
      s01Module.updateTEUIDisplay = function(...args) {
        const result = originalUpdateTEUI.apply(this, args);

        const timestamp = performance.now().toFixed(2);
        const e_10 = window.TEUI?.StateManager?.getValue('e_10');
        const h_10 = window.TEUI?.StateManager?.getValue('h_10');

        console.log(`%c[S11-DEBUG ${timestamp}ms] S01.updateTEUIDisplay() FINISHED`, 'color: #0af; font-weight: bold;');
        console.log(`  e_10 (Reference TEUI) = ${e_10}`);
        console.log(`  h_10 (Target TEUI) = ${h_10}`);

        return result;
      };
    }
  }

  console.log('%c[S11-DEBUG] Tracer installed. Import an Excel file to see cascade.', 'color: #0f0; font-weight: bold;');
  console.log('%c[S11-DEBUG] Looking for:', 'color: #0f0;');
  console.log('  - S11 writes ref_i_98, ref_k_98, etc.');
  console.log('  - S12 reads S11 values, writes ref_g_101, ref_d_101, ref_i_104');
  console.log('  - S15 reads S12 values, calculates e_10');
  console.log('  - If S12 reads undefined/null from S11, that\'s the bug!');
})();
