/**
 * DOMBridge.js - Stamps graph-computed values to DOM
 *
 * The computation graph is the single source of truth.
 * After graph computation, DOMBridge reads all computed values
 * and stamps them to DOM elements via [data-field-id] selectors
 * with proper formatting per field.
 *
 * This replaces per-section updateCalculatedDisplayValues() methods.
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};

  // ==========================================================================
  // FORMAT MAP: legacyId -> formatType
  // Default is "number-2dp-comma". Only exceptions listed here.
  // ==========================================================================

  const FORMAT = {
    // S01 Key Values - 1 decimal place
    e_6: "number-1dp", e_8: "number-1dp", e_10: "number-1dp",
    h_6: "number-1dp", h_8: "number-1dp", h_10: "number-1dp",
    k_6: "number-1dp", k_8: "number-1dp", k_10: "number-1dp",
    // S01 - raw strings (percentages like "48%", tiers like "tier3")
    m_6: "raw", m_8: "raw", m_10: "raw",
    j_8: "raw", j_10: "raw",
    i_10: "raw", f_10: "raw",

    // S03 Climate
    j_19: "number-1dp",
    d_20: "integer", d_21: "integer",
    d_22: "integer", h_22: "integer",
    d_25: "integer", l_22: "integer", l_24: "integer",
    e_23: "integer-nocomma", i_23: "integer-nocomma",
    e_24: "integer-nocomma", i_24: "integer-nocomma",
    e_25: "integer-nocomma",
    m_23: "raw", m_24: "raw",
    n_23: "raw", n_24: "raw",

    // S04 Energy: emission factor integers, nuclear waste 4dp
    l_27: "integer",
    l_28: "integer", l_29: "integer", l_30: "integer", l_31: "integer",
    l_33: "number-4dp",

    // S05 Embodied Carbon - raw strings
    m_38: "raw", m_39: "raw", m_40: "raw", m_41: "raw",
    n_38: "raw", n_39: "raw", n_40: "raw", n_41: "raw",

    // S07 Water Heating: compliance ratios (pre-formatted strings)
    m_49: "raw", m_50: "raw", m_52: "raw", m_53: "raw",
    h_50: "number-1dp",

    // S09 Internal Gains: compliance ratios and checkmarks
    m_65: "raw", m_66: "raw", m_67: "raw",
    n_65: "raw", n_66: "raw", n_67: "raw",

    // S10 Radiant Gains: subtotal indicators
    j_79: "integer", l_79: "integer",

    // S12 Volume Metrics: WWR as percent, ELA10 as 3dp, compliance text and checkmarks
    d_107: "percent-2dp", d_110: "number-3dp",
    m_104: "raw", n_104: "raw",
    m_107: "raw", n_107: "raw",
    m_109: "raw", n_109: "raw",
    m_110: "raw", n_110: "raw",

    // S13 Cooling: compliance ratios and pass/fail checkmarks
    m_113: "integer-percent", m_115: "integer-percent", m_116: "integer-percent",
    m_117: "integer-percent", m_118: "integer-percent", m_119: "integer-percent",
    n_113: "raw", n_115: "raw", n_116: "raw",
    n_117: "raw", n_118: "raw", n_119: "raw",
    n_124: "raw",
    m_124: "integer",

    // S15 TEUI Summary: GHG reduction percentage
    d_145: "number-2dp-comma",
  };

  // S01 fields always read from Target model (S01 renders all 3 columns itself)
  const S01_FIELDS = new Set([
    "e_6", "e_8", "e_10", "h_6", "h_8", "h_10", "k_6", "k_8", "k_10",
    "f_10", "i_10", "j_8", "j_10", "m_6", "m_8", "m_10",
  ]);

  // Tier field → value field mapping (set data-tier attribute)
  const TIER_MAP = { e_10: "f_10", h_10: "i_10" };

  // ==========================================================================
  // STAMP ALL
  // ==========================================================================

  /**
   * Read computed values from MultiModelState and write to DOM.
   * Runs as final step in the calculation pipeline.
   */
  function stampAll() {
    const CI = window.TEUI.ComputationIntegration;
    if (!CI?.isInitialized?.()) return;

    const graph = CI.getGraph();
    const state = CI.getState();
    if (!graph || !state) return;

    const isRef = window.TEUI.ReferenceToggle?.isReferenceMode?.() || false;
    const targetModelId = state.getActiveModelId();
    const refModelId = isRef ? CI.getRefModelId() : null;
    if (!targetModelId) return;

    const fmt = window.TEUI.formatNumber;
    const parse = window.TEUI.parseNumeric;
    if (!fmt || !parse) return;

    // Build legacyId → semanticPath lookup from graph nodes
    const legacyToSemantic = new Map();
    const nodeIds = graph.getAllNodeIds ? graph.getAllNodeIds() : [];
    for (const nodeId of nodeIds) {
      const node = graph.getNode(nodeId);
      if (node?.legacyId) legacyToSemantic.set(node.legacyId, nodeId);
    }
    const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];
    for (const inputId of inputIds) {
      const input = graph.getInput(inputId);
      if (input?.legacyId) legacyToSemantic.set(input.legacyId, inputId);
    }

    let stamped = 0;

    for (const [legacyId, semanticPath] of legacyToSemantic) {
      // Choose model: S01 always Target, others depend on reference mode
      const modelId = S01_FIELDS.has(legacyId) ? targetModelId
        : (refModelId || targetModelId);

      const value = state.getValueForModel(modelId, semanticPath);
      if (value === undefined || value === null) continue;

      const el = document.querySelector(`[data-field-id="${legacyId}"]`);
      if (!el) continue;

      // Skip user-input elements only if actively being edited
      if (el.hasAttribute("contenteditable") && document.activeElement === el) continue;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") continue;
      if (el.querySelector("input, select, textarea")) continue;

      const formatType = FORMAT[legacyId] || "number-2dp-comma";

      if (formatType === "raw") {
        el.textContent = String(value);
        stamped++;
        continue;
      }

      if (formatType === "integer-percent") {
        const n = parse(value, NaN);
        if (!isNaN(n)) {
          el.textContent = Math.round(n) + "%";
          stamped++;
        }
        continue;
      }

      const n = parse(value, NaN);
      if (!isNaN(n)) {
        el.textContent = fmt(n, formatType);
        stamped++;
      }
    }

    // Stamp Section01 data attributes (tier badges, status indicators)
    stampSection01Attributes(state, targetModelId, legacyToSemantic, parse);

    console.log(`[DOMBridge] Stamped ${stamped} values`);
  }

  /**
   * Set data-tier and data-status attributes on Section01 elements.
   * CSS ::before pseudo-elements render tier badges and checkmarks.
   */
  function stampSection01Attributes(state, modelId, lookup, parse) {
    // Tier attributes
    for (const [valueField, tierField] of Object.entries(TIER_MAP)) {
      const el = document.querySelector(`[data-field-id="${valueField}"]`);
      const tierPath = lookup.get(tierField);
      if (el && tierPath) {
        const tier = state.getValueForModel(modelId, tierPath);
        if (tier) el.dataset.tier = String(tier);
      }
    }

    // Status attributes for percentage fields
    for (const pctField of ["m_6", "m_8", "m_10"]) {
      const el = document.querySelector(`[data-field-id="${pctField}"]`);
      if (!el) continue;
      const text = el.textContent;
      if (text === "N/A") {
        el.dataset.status = "na";
      } else {
        const n = parse(text, 0);
        el.dataset.status = n <= 100 ? "pass" : "fail";
      }
    }
  }

  // ==========================================================================
  // EXPORT
  // ==========================================================================

  window.TEUI.DOMBridge = { stampAll };

  console.log("[DOMBridge] Module loaded");
})();
