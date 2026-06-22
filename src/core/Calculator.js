/**
 * Calculator.js
 *
 * Thin wrapper around ComputationIntegration that provides the
 * calculateAll() pipeline used by batch operations (CSV import,
 * mode switching, optimization presets, PC drag).
 *
 * Single-input changes bypass this and use recomputeForInput()
 * via the wildcard SM listener registered in init.js.
 */

window.TEUI = window.TEUI || {};

TEUI.Calculator = (function () {
  /**
   * Recalculate both Target and Reference models from scratch.
   *
   * Pipeline:
   *   1. populateReferenceModel — G-fields from Target, C-fields from ReferenceValues.js
   *      (or from EEM baseline if EEMTreeManager is active)
   *   2. computeAllWithReference — compute both models + cross-model sync
   *   3. syncToStateManager — write Target computed values to SM
   *   4. syncReferenceToStateManager — write Reference values to SM (ref_* prefix)
   *   5. stampAll — push graph values to DOM
   *   6. postStamp — Section01 animated key values
   */
  function calculateAll() {
    if (window.TEUI?.Clock?.markCalculationStart) {
      window.TEUI.Clock.markCalculationStart();
    }

    if (!window.TEUI?.ComputationIntegration?.isInitialized?.()) {
      console.warn(
        "[Calculator] ComputationIntegration not initialized - skipping calculation"
      );
      return;
    }

    const CI = window.TEUI.ComputationIntegration;
    const SM = window.TEUI.StateManager;

    // EEM baseline support: if an EEM tree is active, resolve baseline
    const eemManager = window.TEUI._eemInstance;
    let eemBaseline = null;
    if (eemManager) {
      const active = eemManager.getActiveEEM();
      if (active) {
        eemBaseline = eemManager.getBaseline(active.id);
      }
    }

    // Mute SM listeners to prevent wildcard from firing during sync
    if (SM?.muteListeners) SM.muteListeners();

    try {
      const refPopResult = CI.populateReferenceModel();
      console.log(
        `[Calculator] Reference model: ${refPopResult.gFieldsCopied} G-fields, ${refPopResult.cFieldsLoaded} C-fields from standard`
      );

      // If EEM baseline is available, overlay baseline EEM state onto Reference model
      if (eemBaseline && CI.getState && CI.getRefModelId) {
        const state = CI.getState();
        const refModelId = CI.getRefModelId();
        if (state && refModelId) {
          const baselineFields = eemBaseline.getOwnFieldIds();
          for (const fieldId of baselineFields) {
            const value = eemBaseline.getValue(fieldId);
            if (value !== null && value !== undefined) {
              state.setValueForModel(refModelId, fieldId, value);
            }
          }
          if (baselineFields.length > 0) {
            console.log(
              `[Calculator] EEM baseline "${eemBaseline.name}": ${baselineFields.length} fields overlaid onto Reference model`
            );
          }
        }
      }

      const result = CI.computeAllWithReference();

      if (window.TEUI?.Clock?.markCalculationEnd) {
        window.TEUI.Clock.markCalculationEnd();
      }

      CI.syncToStateManager();
      CI.syncReferenceToStateManager();

      if (window.TEUI.DOMBridge?.stampAll) {
        window.TEUI.DOMBridge.stampAll();
      }

      // Section postStamp hooks (display mirrors, key values)
      const modules = window.TEUI.SectionModules || {};
      for (const key of ["sect01", "sect16", "sect21"]) {
        if (modules[key]?.postStamp) modules[key].postStamp();
      }

      if (result) {
        console.log(
          `[Calculator] ComputationGraph complete: ${result.totalComputed} nodes in ${result.totalDuration?.toFixed(2)}ms`
        );
      }
    } finally {
      if (SM?.unmuteListeners) SM.unmuteListeners();
    }
  }

  return {
    calculateAll: calculateAll,
  };
})();
