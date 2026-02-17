/**
 * 4011-SectionIntegrator.js
 *
 * Module for handling integration between different sections of the TEUI Calculator
 *
 * =============================================================================
 * LEGACY SM LISTENERS REMOVED (graph-parity migration)
 * =============================================================================
 *
 * All cross-section SM listeners have been removed. The ComputationGraph now
 * handles all cross-section dependencies. The wildcard SM listener in init.js
 * triggers Calculator.calculateAll() whenever a graph input changes, which
 * recomputes both models, syncs to SM, and stamps the DOM.
 *
 * Removed integrations:
 * - Emissions Factor (d_19, h_12 listeners → province dropdown cascade)
 * - TEDI/TELI (h_15, d_121 listeners → calculateAll)
 * - Volume Metrics (11 envelope field listeners → debounced calculateAll)
 * - Radiant Gains (j_19 listener → recalculateRadiantGains)
 * - TEUI (DOM input change listeners → updateTEUIValues)
 *
 * What remains:
 * - ensureCorrectTEUIValues: initial startup defaults (before graph init)
 * - setupSection01Listeners: d_14 dropdown → stampAll (UI presentation toggle)
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};

// Section Integrator Module
TEUI.SectionIntegrator = (function () {

  /**
   * Initialize the integrator
   */
  function initialize() {
    // Listen for rendering complete event
    document.addEventListener("teui-rendering-complete", function () {
      initializeAllIntegrations();
    });
  }

  /**
   * Initialize remaining integrations after DOM is ready
   */
  function initializeAllIntegrations() {
    // Set initial default values for TEUI fields (before graph calculates them)
    ensureCorrectTEUIValues();

    // d_14 dropdown (Energy Input Type) toggles Section01 presentation
    setupSection01Listeners();
  }

  /**
   * Ensure the correct TEUI values are set in the StateManager ONLY at initial startup
   */
  function ensureCorrectTEUIValues() {
    if (window.TEUI.StateManager) {
      const hasF32 = window.TEUI.StateManager.getValue("f_32") !== null;
      const hasJ32 = window.TEUI.StateManager.getValue("j_32") !== null;
      const hasH15 = window.TEUI.StateManager.getValue("h_15") !== null;

      if (!hasF32) {
        window.TEUI.StateManager.setValue(
          "f_32",
          "132938.00",
          window.TEUI.StateManager.VALUE_STATES.DEFAULT
        );
      }

      if (!hasJ32) {
        window.TEUI.StateManager.setValue(
          "j_32",
          "132763.65",
          window.TEUI.StateManager.VALUE_STATES.DEFAULT
        );
      }

      if (!hasH15) {
        window.TEUI.StateManager.setValue(
          "h_15",
          "1427.20",
          window.TEUI.StateManager.VALUE_STATES.DEFAULT
        );
      }
    }
  }

  /**
   * Setup listeners for Section01 to handle d_14 dropdown presentation toggle.
   * When user switches between "Targeted Use" and "Utility Bills", Section01
   * needs to re-stamp to show the correct display variant.
   */
  function setupSection01Listeners() {
    const dropdown = document.querySelector('select[data-field-id="d_14"]');
    if (dropdown) {
      dropdown.addEventListener("change", function () {
        if (window.TEUI.DOMBridge?.stampAll) window.TEUI.DOMBridge.stampAll();
        if (window.TEUI.SectionModules?.sect01?.postStamp) {
          window.TEUI.SectionModules.sect01.postStamp();
        }
      });
    }
  }

  // Initialize on load
  document.addEventListener("DOMContentLoaded", initialize);

  // Public API
  return {
    initialize: initialize,
    getRegisteredIntegrations: function () {
      return {};
    },
  };
})();
