/**
 * 4012-Section12.js
 * Volume and Surface Metrics (Section 12) module for TEUI Calculator 4.012. Note added 2025.12.15: Make sure skylights d_93, ref_d_93, do not form part of WWR calcs at d_107. Excel had this and we fixed it.
 */

window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

window.TEUI.SectionModules.sect12 = (function () {
  let isInitialized = false;
  let s12ListenersAdded = false;
  // lastReferenceResults removed – graph handles Reference storage

  //==========================================================================
  // DUAL-STATE ARCHITECTURE (Self-Contained State Module)
  //==========================================================================

  // PATTERN A: Internal State Objects (Self-Contained + Persistent)
  const TargetState = {
    state: {},
    listeners: {},
    initialize: function () {
      const savedState = localStorage.getItem("S12_TARGET_STATE");
      if (savedState) {
        this.state = JSON.parse(savedState);
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      // S12-specific defaults - MUST match sectionRows values CONSOLIDATE THESE TO FIELD DEFINITIONS PER 4012-CHEATSHEET.md
      this.state = {
        d_103: "1.5", // Number of stories (dropdown)
        g_103: "Normal", // Exposure (dropdown)
        d_105: "8319.50", // Conditioned volume (editable)
        g_106: "5.15", // Typical floor-to-floor height (editable)
        d_108: "AL-1B", // ✅ FIXED: Use AL-1B method (was MEASURED) to get proper 93.6 TEUI
        g_109: "1.30", // Measured value (conditional editable, N/A when not MEASURED)
      };
    },
    /**
     * ✅ PHASE 2: Sync from global StateManager after import
     */
    syncFromGlobalState: function () { /* graph is source of truth */ },

    /**
     * ✅ PHASE 6: Apply code-minimum baseline values from ReferenceValues
     * Called by "Set Values" button to overlay reference values onto Target model
     * ⚠️ STATE ISOLATION SAFEGUARD: Only writes to unprefixed fields (Target model)
     */
    applyReferenceValues: function (standard) {
      const referenceValues = window.TEUI?.ReferenceValues?.[standard] || {};

      console.log(
        `[S12 TargetState] Applying code-minimum values from "${standard}"`
      );

      Object.keys(referenceValues).forEach(fieldId => {
        if (referenceValues[fieldId] !== undefined) {
          // ✅ Writes to d_103, g_103, etc., NOT ref_d_103
          this.state[fieldId] = referenceValues[fieldId];
          console.log(
            `[S12 TargetState] ${fieldId} = ${referenceValues[fieldId]} (from ${standard})`
          );
        }
      });

      this.saveState();
      console.log(
        `[S12 TargetState] Code-minimum values from "${standard}" applied to Target model`
      );
    },

    saveState: function () {
      localStorage.setItem("S12_TARGET_STATE", JSON.stringify(this.state));
    },
    setValue: function (fieldId, value, source = "user") {
      this.state[fieldId] = value;
      // ✅ FIXED: Save state for any user action (user or user-modified)
      if (source === "user" || source === "user-modified") {
        this.saveState();
        console.log(
          `S12 TargetState: Saved state after ${source} changed ${fieldId} to ${value}`
        );
      }
    },
    getValue: function (fieldId) {
      return this.state[fieldId];
    },
  };

  const ReferenceState = {
    state: {},
    listeners: {},
    initialize: function () {
      console.log(`[S12 DEBUG] ReferenceState.initialize() called`);
      const savedState = localStorage.getItem("S12_REFERENCE_STATE");
      if (savedState) {
        console.log(`[S12 DEBUG] Found saved Reference state in localStorage`);
        this.state = JSON.parse(savedState);
        console.log(`[S12 DEBUG] ReferenceState loaded:`, this.state);

        // ✅ CRITICAL: Re-publish to StateManager even when loading from localStorage
        // This ensures values are available for CSV export after page refresh (S10 pattern)
        if (window.TEUI?.StateManager) {
          const referenceFields = [
            "d_103",
            "g_103",
            "d_105",
            "g_106",
            "d_108",
            "g_109",
          ];
          console.log(
            `[S12 DEBUG] Re-publishing ${referenceFields.length} Reference fields from localStorage...`
          );
          referenceFields.forEach(fieldId => {
            const value = this.state[fieldId];
            if (value !== null && value !== undefined) {
              console.log(`[S12 DEBUG] Publishing ref_${fieldId} = ${value}`);
              window.TEUI.StateManager.setValue(
                `ref_${fieldId}`,
                value,
                "default"
              );
            } else {
              console.warn(
                `[S12 DEBUG] Skipping ref_${fieldId} - value is null/undefined`
              );
            }
          });
          console.log(`[S12 DEBUG] Reference field publishing complete`);
        }
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      console.log(
        `[S12 DEBUG] ReferenceState.setDefaults() called - no localStorage, using defaults`
      );
      // ✅ DYNAMIC LOADING: Get current reference standard from dropdown ref_d_13
      const currentStandard =
        window.TEUI?.StateManager?.getValue?.("ref_d_13") ||
        "OBC SB10 5.5-6 Z6";
      const referenceValues =
        window.TEUI?.ReferenceValues?.[currentStandard] || {};
      console.log(`[S12 DEBUG] Using reference standard: ${currentStandard}`);

      // Apply reference values to S12 fields with fallbacks - these are fine
      this.state = {
        d_103: referenceValues.d_103 || "1.5", // Stories - MATCHES Target 1.0
        g_103: referenceValues.g_103 || "Exposed", // Exposure - DIFFERENT: Exposed vs Target Normal
        d_105: "8319.50", // Volume - MATCHES:Target 8319.50
        g_106: "5.15", // Typical floor-to-floor height - Generally >2.5m
        d_108: referenceValues.d_108 || "MEASURED", // Blower door method - DIFFERENT: Reference uses MEASURED vs Target AL-1B
        g_109: referenceValues.g_109 || "1.30", // Measured - DIFFERENT method: But same result as AL-1B
      };
      console.log(`[S12 DEBUG] ReferenceState defaults set:`, this.state);

      // ✅ CRITICAL: Publish Reference defaults to StateManager (S10/S11/S04 pattern)
      if (window.TEUI?.StateManager) {
        console.log(
          `[S12 DEBUG] StateManager available - Publishing ${6} Reference default fields...`
        );
        const referenceFields = [
          "d_103",
          "g_103",
          "d_105",
          "g_106",
          "d_108",
          "g_109",
        ];
        referenceFields.forEach(fieldId => {
          const value = this.state[fieldId];
          if (value !== null && value !== undefined) {
            console.log(
              `[S12 DEBUG] Publishing ref_${fieldId} = ${value} (from defaults)`
            );
            window.TEUI.StateManager.setValue(
              `ref_${fieldId}`,
              value,
              "default"
            );
          } else {
            console.warn(
              `[S12 DEBUG] Skipping ref_${fieldId} - value is null/undefined`
            );
          }
        });
        console.log(`[S12 DEBUG] Reference defaults publishing complete`);
      } else {
        console.error(
          `[S12 DEBUG] ❌ StateManager NOT AVAILABLE - cannot publish Reference defaults!`
        );
      }

      console.log(
        `S12: Reference defaults loaded from standard: ${currentStandard}`
      );
    },
    // MANDATORY: Include onReferenceStandardChange for d_13 changes
    onReferenceStandardChange: function () {
      console.log("S12: Reference standard changed, reloading defaults");
      this.setDefaults();
      this.saveState();
    },
    saveState: function () {
      localStorage.setItem("S12_REFERENCE_STATE", JSON.stringify(this.state));
    },
    syncFromGlobalState: function () { /* graph is source of truth */ },
    setValue: function (fieldId, value, source = "user") {
      this.state[fieldId] = value;
      // ✅ FIXED: Save state for any user action (user or user-modified)
      if (source === "user" || source === "user-modified") {
        this.saveState();
        console.log(
          `S12 ReferenceState: Saved state after ${source} changed ${fieldId} to ${value}`
        );
      }
    },
    getValue: function (fieldId) {
      return this.state[fieldId];
    },
  };

  // PATTERN 2: The ModeManager Facade
  const ModeManager = {
    currentMode: "target",
    initialize: function () {
      TargetState.initialize();
      ReferenceState.initialize();

      // ✅ PHASE 3 CLEANUP: PASSIVE d_13/ref_d_13 listeners removed
      // "Set Values" button handles value application via FileHandler
      // Note: CRITICAL d_13 listener at line ~2927 will also be removed
    },
    switchMode: function (mode) {
      if (
        this.currentMode === mode ||
        (mode !== "target" && mode !== "reference")
      )
        return;
      this.currentMode = mode;
      console.log(`S12: Switched to ${mode.toUpperCase()} mode`);

      // ✅ FIX: Re-evaluate conditional editability after mode switch
      // This ensures g_109 is properly editable/locked based on mode and d_108 value
      handleConditionalEditability();

      // ✅ NEW: Sync visual toggle UI when mode changes (from global or local toggle)
      this.syncToggleUI(mode);
    },

    updateCalculatedDisplayValues: function () { /* DOMBridge.stampAll() handles display */ },
    resetState: function () {
      console.log("S12: Resetting state and clearing localStorage.");
      TargetState.setDefaults();
      TargetState.saveState();
      ReferenceState.setDefaults();
      ReferenceState.saveState();
      console.log("S12: States have been reset to defaults.");
    },
    getCurrentState: function () {
      return this.currentMode === "target" ? TargetState : ReferenceState;
    },
    getValue: function (fieldId) {
      return this.getCurrentState().getValue(fieldId);
    },
    setValue: function (fieldId, value, source = "user") {
      this.getCurrentState().setValue(fieldId, value, source);

      // ✅ FIX: Publish BOTH Target and Reference changes to StateManager
      // This ensures downstream sections receive updates in both modes
      if (this.currentMode === "target") {
        // Target mode: publish unprefixed value
        window.TEUI.StateManager.setValue(fieldId, value, "user-modified");
      } else if (this.currentMode === "reference") {
        // Reference mode: publish with ref_ prefix
        window.TEUI.StateManager.setValue(
          `ref_${fieldId}`,
          value,
          "user-modified"
        );
      }
    },
    refreshUI: function () { /* DOMBridge.stampAll() handles display */ },

    // ✅ NEW: Sync visual toggle switch and indicator to match current mode
    // Called both when user clicks local toggle AND when global toggle switches mode
    syncToggleUI: function (mode) {
      // Use centralized ToggleUISync utility
      window.TEUI.ToggleUISync.syncToggleUI(this._toggleElements, mode, "S12");
    },
  };

  // MANDATORY: Global exposure
  window.TEUI.sect12 = window.TEUI.sect12 || {};
  window.TEUI.sect12.ModeManager = ModeManager;
  window.TEUI.sect12.TargetState = TargetState;
  window.TEUI.sect12.ReferenceState = ReferenceState;

  //==========================================================================
  // FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  const sectionRows = {
    header: {
      id: "12-ID",
      rowId: "12-ID",
      label: "Volume and Surface Metrics Units",
      cells: {
        c: {
          content: "SECTION 12. Volume and Surface Metrics",
          classes: ["section-header"],
          colspan: 4,
        },
        d: { content: "", classes: ["section-subheader"] },
        e: { content: "", classes: ["section-subheader"] },
        f: { content: "", classes: ["section-subheader"] },
        g: {
          content: "U-Value\nW/m²·K",
          classes: ["section-subheader", "align-right"],
        },
        h: {
          content: "Loss Rate\nkWh/m²",
          classes: ["section-subheader", "align-right"],
        },
        i: {
          content: "Heatloss\nkWh/Htg. Season",
          classes: ["section-subheader", "align-right"],
        },
        j: {
          content: "Gain Rate\nkWh/m²",
          classes: ["section-subheader", "align-right"],
        },
        k: {
          content: "Heatgain\nkWh/Cool Season",
          classes: ["section-subheader", "align-right"],
        },
        l: {
          content: "Heatloss %",
          classes: ["section-subheader", "align-right"],
        },
        m: {
          content: "Reference",
          classes: ["section-subheader", "align-right"],
        },
        n: { content: "N", classes: ["section-subheader", "align-center"] },
        o: {
          content: "MRT °C",
          classes: ["section-subheader", "align-right"],
        },
      },
    },
    101: {
      id: "B.16",
      rowId: "B.16",
      label: "Total Area Exposed to Air (Ae)",
      cells: {
        c: { label: "Total Area Exposed to Air (Ae)" },
        d: {
          fieldId: "d_101",
          semanticPath: "geometry.airFacing.area",
          type: "calculated",
          value: "2476.62",
          section: "volumeSurfaceMetrics",
          dependencies: [
            "d_85",
            "d_86",
            "d_87",
            "d_88",
            "d_89",
            "d_90",
            "d_91",
            "d_92",
            "d_93",
          ],
          classes: ["text-air-facing"],
        },
        e: { content: "m²", classes: ["unit-label"] },
        f: { content: "U-Val. for Ae", classes: ["label-main"] },
        g: {
          fieldId: "g_101",
          semanticPath: "geometry.airFacing.uValue",
          type: "calculated",
          value: "0.278",
          section: "volumeSurfaceMetrics",
          dependencies: [
            "g_85",
            "h_85",
            "g_86",
            "h_86",
            "g_87",
            "h_87",
            "g_88",
            "h_88",
            "g_89",
            "h_89",
            "g_90",
            "h_90",
            "g_91",
            "h_91",
            "g_92",
            "h_92",
            "g_93",
            "h_93",
            "d_97",
          ],
          classes: ["text-air-facing"],
          label: "U-Value for Air-Exposed Envelope (Ae)",
        },
        h: {
          fieldId: "h_101",
          semanticPath: "geometry.airFacing.lossRate",
          type: "calculated",
          value: "30.73",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_101", "d_20"],
          label: "Heat Loss Rate per m² (Ae Envelope): kWh/m²",
        },
        i: {
          fieldId: "i_101",
          semanticPath: "geometry.airFacing.heatLoss",
          type: "calculated",
          value: "76,103.69",
          section: "volumeSurfaceMetrics",
          dependencies: ["h_101", "d_101"],
          label: "Total Heat Loss (Ae Envelope): kWh/yr",
        },
        j: {
          fieldId: "j_101",
          semanticPath: "geometry.airFacing.gainRate",
          type: "calculated",
          value: "1.31",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_101", "d_21"],
          label: "Heat Gain Rate per m² (Ae Envelope): kWh/m²",
        },
        k: {
          fieldId: "k_101",
          semanticPath: "geometry.airFacing.heatGain",
          type: "calculated",
          value: "3,242.68",
          section: "volumeSurfaceMetrics",
          dependencies: ["j_101", "d_101"],
          label: "Total Heat Gain (Ae Envelope): kWh/yr",
        },
        l: {
          fieldId: "l_101",
          semanticPath: "geometry.airFacing.lossPercent",
          type: "calculated",
          value: "65.57%",
          section: "volumeSurfaceMetrics",
          dependencies: ["i_101", "i_104"],
          classes: ["percentage-value"],
          label: "Ae Heat Loss as % of Total",
        },
        m: { content: "", classes: ["reference-value"] },
        n: { content: "" },
        o: {
          fieldId: "o_101",
          semanticPath: "geometry.airFacing.surfaceTemp",
          type: "calculated",
          value: "0.00",
          dependencies: ["g_101", "h_23", "d_25", "d_101"],
          label: "Air-facing Aggregate: Interior Surface Temperature °C",
          tooltip: true,
        },
      },
    },
    102: {
      id: "B.17",
      rowId: "B.17",
      label: "Total Area Exposed to Ground (Ag)",
      cells: {
        c: { label: "Total Area Exposed to Ground (Ag)" },
        d: {
          fieldId: "d_102",
          semanticPath: "geometry.groundFacing.area",
          type: "calculated",
          value: "1100.93",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_94", "d_95"],
          classes: ["text-ground-facing"],
        },
        e: { content: "m²", classes: ["unit-label"] },
        f: { content: "U-Val. for Ag", classes: ["label-main"] },
        g: {
          fieldId: "g_102",
          semanticPath: "geometry.groundFacing.uValue",
          type: "calculated",
          value: "0.324",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_94", "h_94", "g_95", "h_95", "d_97"],
          conditionalDeps: ["d_94", "d_95"],
          classes: ["text-ground-facing"],
          label: "U-Value for Ground-Exposed Envelope (Ag)",
        },
        h: {
          fieldId: "h_102",
          semanticPath: "geometry.groundFacing.lossRate",
          type: "calculated",
          value: "15.26",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_102", "d_22"],
          label: "Heat Loss Rate per m² (Ag Envelope): kWh/m²",
        },
        i: {
          fieldId: "i_102",
          semanticPath: "geometry.groundFacing.heatLoss",
          type: "calculated",
          value: "16,788.25",
          section: "volumeSurfaceMetrics",
          dependencies: ["h_102", "d_102"],
          label: "Total Heat Loss (Ag Envelope): kWh/yr",
        },
        j: {
          fieldId: "j_102",
          semanticPath: "geometry.groundFacing.gainRate",
          type: "calculated",
          value: "-13.08",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_102", "h_22"],
          label: "Heat Gain Rate per m² (Ag Envelope): kWh/m²",
        },
        k: {
          fieldId: "k_102",
          semanticPath: "geometry.groundFacing.heatGain",
          type: "calculated",
          value: "-14,389.92",
          section: "volumeSurfaceMetrics",
          dependencies: ["j_102", "d_102"],
          label: "Total Heat Gain (Ag Envelope): kWh/yr",
        },
        l: {
          fieldId: "l_102",
          semanticPath: "geometry.groundFacing.lossPercent",
          type: "calculated",
          value: "14.46%",
          section: "volumeSurfaceMetrics",
          dependencies: ["i_102", "i_104"],
          label: "Ag Heat Loss as % of Total",
          classes: ["percentage-value"],
        },
        m: { content: "", classes: ["reference-value"] },
        n: { content: "" },
        o: {
          fieldId: "o_102",
          semanticPath: "geometry.groundFacing.surfaceTemp",
          type: "calculated",
          value: "0.00",
          dependencies: ["g_102", "h_23", "d_102"],
          label: "Ground-facing Aggregate: Interior Surface Temperature °C",
          tooltip: true,
        },
      },
    },
    103: {
      id: "B.18.3",
      rowId: "B.18.3",
      label: "Heating Natural Air Leakage Heatloss",
      cells: {
        c: { label: "Heating Natural Air Leakage Heatloss" },
        d: {
          fieldId: "d_103",
          semanticPath: "airLeakage.stories",
          type: "dropdown",
          dropdownId: "dd_d_103",
          value: "1.5",
          section: "volumeSurfaceMetrics",
          tooltip: true, // Select Stories
          options: [
            { value: "1", name: "1" },
            { value: "1.5", name: "1.5" },
            { value: "2", name: "2" },
            { value: "3", name: "3" },
            { value: "4", name: "4" },
            { value: "5", name: "5" },
            { value: "6", name: "6" },
          ],
        },
        e: { content: "Stories", classes: ["unit-label"] },
        f: { content: "B.18.3 Shielding", classes: ["label-main"] },
        g: {
          fieldId: "g_103",
          semanticPath: "airLeakage.shielding",
          type: "dropdown",
          dropdownId: "dd_g_103",
          value: "Normal",
          section: "volumeSurfaceMetrics",
          tooltip: true, // Exposure (no tooltip in manager, but keeping for future)
          options: [
            { value: "Shielded", name: "Shielded" },
            { value: "Normal", name: "Normal" },
            { value: "Exposed", name: "Exposed" },
          ],
        },
        h: {},
        i: {
          fieldId: "i_103",
          semanticPath: "airLeakage.heatingHeatLoss",
          type: "calculated",
          value: "23,178.39",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_108", "g_110", "d_101", "d_20"],
          label: "Air Leakage Heat Loss (Heating Season)",
        },
        j: {},
        k: {
          fieldId: "k_103",
          semanticPath: "airLeakage.coolingHeatGain",
          type: "calculated",
          value: "987.60",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_108", "g_110", "d_101", "d_21"],
          label: "Air Leakage Heat Gain (Cooling Season)",
        },
        l: {
          fieldId: "l_103",
          semanticPath: "airLeakage.lossPercent",
          type: "calculated",
          value: "19.97%",
          section: "volumeSurfaceMetrics",
          dependencies: ["i_103", "i_104"],
          classes: ["percentage-value"],
          label: "Air Leakage Heat Loss as % of Total",
        },
        m: { content: "", classes: ["reference-value"] },
        n: { content: "" },
      },
    },
    104: {
      id: "T.4",
      rowId: "T.4",
      label: "Building U-Value Combined Total & Transmission Losses & Gains",
      cells: {
        c: {
          label:
            "Building U-Value Combined Total & Transmission Losses & Gains",
          classes: ["total-row-text"],
        },
        d: {
          fieldId: "d_104",
          semanticPath: "envelope.total.area",
          type: "calculated",
          value: "3577.04",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_101", "d_102"],
          classes: ["total-row-text"],
          label: "Total Envelope Area (Air + Ground): m²",
        },
        e: { content: "m²", classes: ["unit-label"] },
        f: {},
        g: {
          fieldId: "g_104",
          semanticPath: "envelope.total.uValue",
          type: "calculated",
          value: "0.292",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_101", "d_101", "g_102", "d_102"],
          classes: ["total-row-text"],
          label: "Area-Weighted Average U-Value (Building Envelope): W/m²·K",
        },
        h: {},
        i: {
          fieldId: "i_104",
          semanticPath: "envelope.total.heatLoss",
          type: "calculated",
          value: "116,070.33",
          section: "volumeSurfaceMetrics",
          dependencies: ["i_101", "i_102", "i_103"],
          classes: ["total-row-text"],
          label: "Total Envelope Heat Loss (All Components): kWh/yr",
        },
        j: {},
        k: {
          fieldId: "k_104",
          semanticPath: "envelope.total.heatGain",
          type: "calculated",
          value: "-10,160.19",
          section: "volumeSurfaceMetrics",
          dependencies: ["k_101", "k_102"],
          conditionalDeps: ["h_21", "k_98"],
          classes: ["total-row-text"],
          label: "Total Envelope Heat Gain (Conditional)",
        },
        l: {
          fieldId: "l_104",
          semanticPath: "envelope.total.lossPercent",
          type: "calculated",
          value: "100%",
          section: "volumeSurfaceMetrics",
          tooltip: true, // Total Excludes B.12 TB Penalty
          classes: ["percentage-value", "total-row-text"],
          dependencies: ["l_101", "l_102", "l_103"],
          label: "Total Heat Loss Percentage (Should Equal 100%)",
        },
        m: {
          fieldId: "m_104",
          semanticPath: "envelope.total.complianceRatio",
          type: "calculated",
          value: "N/A",
          section: "volumeSurfaceMetrics",
          classes: ["reference-value", "total-row-text"],
          label: "Passive House Compliance Percentage",
        },
        n: {
          fieldId: "n_104",
          semanticPath: "envelope.total.complianceStatus",
          type: "calculated",
          value: "✓",
          section: "volumeSurfaceMetrics",
          classes: ["total-row-text"],
          dependencies: ["m_104"],
          label: "Passive House Compliance Status",
        },
        o: {
          fieldId: "o_104",
          semanticPath: "envelope.total.surfaceTemp",
          type: "calculated",
          value: "0.00",
          dependencies: ["g_104", "h_23", "d_25", "d_101", "d_102"],
          label: "Total Building Aggregate: Interior Surface Temperature °C",
          tooltip: true,
          classes: ["total-row-text"],
        },
      },
    },
    105: {
      id: "B.13",
      rowId: "B.13",
      label: "Total Conditioned Volume",
      cells: {
        c: { label: "Total Conditioned Volume" },
        d: {
          fieldId: "d_105",
          semanticPath: "geometry.conditionedVolume",
          type: "editable",
          value: "8319.50", // Our only required Target default set here
          section: "volumeSurfaceMetrics",
          tooltip: true, // Conditioned Volume
          classes: ["user-input"],
        },
        e: { content: "m³", classes: ["unit-label"] },
        f: { content: "Volume/Area", classes: ["label-main"] },
        g: {
          fieldId: "g_105",
          semanticPath: "geometry.volumeToAreaRatio",
          type: "calculated",
          value: "3.23",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_105", "d_101"],
          label: "Volume to Area Ratio: m³/m²",
        },
        h: { content: "Area/Volume", classes: ["text-center"] },
        i: {
          fieldId: "i_105",
          semanticPath: "geometry.areaToVolumeRatio",
          type: "calculated",
          value: "0.31",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_101", "d_105"],
          label: "Area to Volume Ratio: m²/m³",
        },
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },
    106: {
      id: "B.14",
      rowId: "B.14",
      label: "Total Floor Area (Cond. + Uncond.)",
      cells: {
        c: { label: "Total Floor Area (Cond. + Uncond.)" },
        d: {
          fieldId: "d_106",
          semanticPath: "geometry.totalFloorArea",
          type: "calculated",
          value: "1130.12",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_87", "d_95", "d_96"],
        },
        e: { content: "m²", classes: ["unit-label"] },
        f: { content: "Typ. F2F Ht.", classes: ["label-main"] },
        g: {
          fieldId: "g_106",
          semanticPath: "geometry.floorToFloorHeight",
          type: "editable",
          value: "5.15",
          section: "volumeSurfaceMetrics",
          tooltip: true, // Typical Floor-to-Floor Height
          classes: ["user-input"],
        },
        h: { content: "Ht. in Metres", classes: ["unit-label"] },
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },
    107: {
      id: "B.15",
      rowId: "B.15",
      label: "Window:Wall Ratio (WWR)",
      cells: {
        c: { label: "Window:Wall Ratio (WWR)" },
        d: {
          fieldId: "d_107",
          semanticPath: "geometry.windowWallRatio",
          type: "calculated",
          value: "0.33",
          section: "volumeSurfaceMetrics",
          dependencies: [
            "d_88",
            "d_89",
            "d_90",
            "d_91",
            "d_92",
            "d_93",
            "d_86",
          ],
        },
        e: { content: "%", classes: ["unit-label"] },
        f: { content: "Total Wall Area", classes: ["label-main"] },
        g: {
          fieldId: "g_107",
          semanticPath: "geometry.totalWallArea",
          type: "calculated",
          value: "0.00",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_86", "d_88", "d_89", "d_90", "d_91", "d_92"],
          tooltip: true,
          label: "Total Wall Area (Opaque + Windows)",
        },
        h: { content: "m²", classes: ["unit-label"] },
        i: {
          fieldId: "i_107",
          semanticPath: "geometry.windowDoorHeatLoss",
          type: "calculated",
          value: "0.00",
          section: "volumeSurfaceMetrics",
          dependencies: ["i_88", "i_89", "i_90", "i_91", "i_92"],
          label: "Total Window & Door Heat Loss: kWh/yr",
        },
        j: { content: "kWh/yr", classes: ["unit-label"] },
        k: {},
        l: {},
        m: {
          fieldId: "m_107",
          semanticPath: "geometry.wwrComplianceRatio",
          type: "calculated",
          value: "61%",
          section: "volumeSurfaceMetrics",
          classes: ["percentage-value"],
          dependencies: ["d_107"],
          label: "WWR Ratio to Reference Standard",
        },
        n: {
          fieldId: "n_107",
          semanticPath: "geometry.wwrComplianceStatus",
          type: "calculated",
          value: "✓",
          section: "volumeSurfaceMetrics",
          dependencies: ["m_107"],
          label: "WWR Compliance Status",
        },
      },
    },
    108: {
      id: "B.18.1",
      rowId: "B.18.1",
      label: "NRL₅₀ Target Method",
      cells: {
        c: { label: "NRL₅₀ Target Method" },
        d: {
          fieldId: "d_108",
          semanticPath: "airLeakage.nrl50Method",
          type: "dropdown",
          dropdownId: "dd_d_108",
          value: "AL-1B",
          section: "volumeSurfaceMetrics",
          tooltip: true, // A.2 NRL50 * Ae
          options: [
            { value: "MEASURED", name: "Measured" },
            { value: "PH_CLASSIC", name: "PH Classic" },
            { value: "PH_LOW", name: "PH Low" },
            { value: "PH_PLUS", name: "PH+" },
            { value: "AL-1A", name: "AL-1A" },
            { value: "AL-2A", name: "AL-2A" },
            { value: "AL-3A", name: "AL-3A" },
            { value: "AL-4A", name: "AL-4A" },
            { value: "AL-5A", name: "AL-5A" },
            { value: "AL-1B", name: "AL-1B" },
            { value: "AL-2B", name: "AL-2B" },
            { value: "AL-3B", name: "AL-3B" },
            { value: "AL-4B", name: "AL-4B" },
            { value: "AL-5B", name: "AL-5B" },
            { value: "AL-6B", name: "AL-6B" },
          ],
        },
        e: { content: "", classes: ["unit-label"] },
        f: { content: "B.18.1 Target", classes: ["label-main"] },
        g: {
          fieldId: "g_108",
          semanticPath: "airLeakage.nrl50Target",
          type: "calculated",
          value: "1.17",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_108", "g_109", "d_105", "d_101"],
          label: "NRL₅₀ Target Value: L/s·m²",
        },
        h: { content: "L/s•m²", classes: ["unit-label"] },
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },
    109: {
      id: "B.18.2",
      rowId: "B.18.2",
      label: "ACH₅₀ Target (Converts B.18.1)",
      cells: {
        c: { label: "ACH₅₀ Target (Converts B.18.1)" },
        d: {
          fieldId: "d_109",
          semanticPath: "airLeakage.ach50Target",
          type: "calculated",
          value: "1.30",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_108", "d_101", "d_105"],
        },
        e: { content: "ACH", classes: ["unit-label"] },
        f: { content: "B.18.2 Measured", classes: ["label-main"] },
        g: {
          fieldId: "g_109",
          semanticPath: "airLeakage.ach50Measured",
          type: "editable",
          value: "1.30",
          section: "volumeSurfaceMetrics",
          tooltip: true, // Calculation Dependency
          classes: ["user-input"],
        },
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {
          fieldId: "m_109",
          semanticPath: "airLeakage.ach50ComplianceRatio",
          type: "calculated",
          value: "115%",
          section: "volumeSurfaceMetrics",
          classes: ["percentage-value"],
          dependencies: ["g_109", "d_109"],
          label: "ACH₅₀ Ratio (Measured/Target)",
        },
        n: {
          fieldId: "n_109",
          semanticPath: "airLeakage.ach50ComplianceStatus",
          type: "calculated",
          value: "✓",
          section: "volumeSurfaceMetrics",
          dependencies: ["m_109"],
          label: "ACH₅₀ Compliance Status",
        },
      },
    },
    110: {
      id: "B.18.4",
      rowId: "B.18.4",
      label: "Ae₁₀ or ELA₁₀ (m²)",
      cells: {
        c: { label: "Ae₁₀ or ELA₁₀ (m²)" },
        d: {
          fieldId: "d_110",
          semanticPath: "airLeakage.ela10",
          type: "calculated",
          value: "2.898",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_109", "d_105"],
          label: "Ae₁₀ or ELA₁₀: m²",
        },
        e: { content: "m²", classes: ["unit-label"] },
        f: { content: "B.18.5.1 n-Factor", classes: ["label-main"] },
        g: {
          fieldId: "g_110",
          semanticPath: "airLeakage.nFactor",
          type: "calculated",
          value: "16.7",
          section: "volumeSurfaceMetrics",
          tooltip: true, // n-Factor Description
          dependencies: ["j_19", "d_103", "g_103"],
          label: "n-Factor for Air Leakage Calculation",
        },
        h: { content: "B.18.3 Ae₁₀ Zone", classes: ["text-center"] },
        i: {
          fieldId: "i_110",
          semanticPath: "airLeakage.climateZone",
          type: "calculated",
          value: "2",
          section: "volumeSurfaceMetrics",
          dependencies: ["j_19"],
          label: "Air Leakage Climate Zone Number",
        },
        j: {},
        k: {},
        l: {},
        m: {
          fieldId: "m_110",
          semanticPath: "airLeakage.elaComplianceRatio",
          type: "calculated",
          value: "173%",
          section: "volumeSurfaceMetrics",
          classes: ["percentage-value"],
          dependencies: ["d_110"],
          label: "ELA₁₀ Ratio to Reference Standard",
        },
        n: {
          fieldId: "n_110",
          semanticPath: "airLeakage.elaComplianceStatus",
          type: "calculated",
          value: "✓",
          section: "volumeSurfaceMetrics",
          dependencies: ["m_110"],
          label: "ELA₁₀ Compliance Status",
        },
      },
    },
  };

  //==========================================================================
  // ACCESSOR METHODS
  //==========================================================================

  function getFields() {
    const fields = {};
    Object.entries(sectionRows).forEach(([rowKey, row]) => {
      if (rowKey === "header" || rowKey === "subheader") return;
      if (!row.cells) return;
      Object.entries(row.cells).forEach(([colKey, cell]) => {
        if (cell.fieldId && cell.type) {
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || row.label,
            defaultValue: cell.value || "",
            section: cell.section || "volumeSurfaceMetrics",
            dependencies: cell.dependencies || [],
          };
          if (cell.semanticPath)
            fields[cell.fieldId].semanticPath = cell.semanticPath;
          if (cell.dropdownId)
            fields[cell.fieldId].dropdownId = cell.dropdownId;
          if (cell.options) fields[cell.fieldId].options = cell.options;
          if (cell.getOptions)
            fields[cell.fieldId].getOptions = cell.getOptions;
          if (cell.min !== undefined) fields[cell.fieldId].min = cell.min;
          if (cell.max !== undefined) fields[cell.fieldId].max = cell.max;
          if (cell.step !== undefined) fields[cell.fieldId].step = cell.step;
        }
      });
    });
    return fields;
  }

  function getDropdownOptions() {
    const options = {};
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;
      Object.values(row.cells).forEach(cell => {
        if (cell.dropdownId && cell.options) {
          options[cell.dropdownId] = cell.options;
        }
      });
    });
    return options;
  }

  function getLayout() {
    const layoutRows = [];
    if (sectionRows["header"]) {
      layoutRows.push(createLayoutRow(sectionRows["header"]));
    }
    if (sectionRows["subheader"]) {
      layoutRows.push(createLayoutRow(sectionRows["subheader"]));
    }
    Object.entries(sectionRows).forEach(([key, row]) => {
      if (key !== "header" && key !== "subheader") {
        layoutRows.push(createLayoutRow(row));
      }
    });
    return { rows: layoutRows };
  }

  function createLayoutRow(row) {
    const rowDef = { id: row.id, cells: [{}, {}] };
    const columns = [
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o", // MRT Surface Temperature (condensation risk feature)
    ];
    columns.forEach(col => {
      if (row.cells && row.cells[col]) {
        const cell = { ...row.cells[col] };
        if (col === "c") {
          if (cell.type === "label" && cell.content && !cell.label) {
            cell.label = cell.content;
            delete cell.type;
            delete cell.content;
          } else if (!cell.label && !cell.content && row.label) {
            cell.label = row.label;
          }
        }
        delete cell.getOptions;
        delete cell.section;
        delete cell.dependencies;
        rowDef.cells.push(cell);
      } else {
        if (col === "c" && !row.cells?.c && row.label) {
          rowDef.cells.push({ label: row.label });
        } else {
          rowDef.cells.push({});
        }
      }
    });
    return rowDef;
  }

  // Helper functions removed – graph handles all computation

  // Reference indicator configuration removed – graph handles compliance

  //==========================================================================
  // CALCULATION STUBS (graph computes all ~608 fields)
  //==========================================================================

  function calculateAll() { /* graph computes */ }
  function calculateTargetModel() { /* graph computes */ }
  function calculateReferenceModel() { /* graph computes */ }

  //==========================================================================
  // EVENT HANDLING AND INITIALIZATION
  //==========================================================================

  function registerDependencies() {
    if (!window.TEUI?.StateManager) {
      return;
    }
    const fields = getFields();
    let count = 0;
    Object.entries(fields).forEach(([fieldId, fieldDef]) => {
      if (fieldDef.dependencies && Array.isArray(fieldDef.dependencies)) {
        fieldDef.dependencies.forEach(depId => {
          if (
            window.TEUI.StateManager.getValue(depId) !== null ||
            document.querySelector(`[data-field-id="${depId}"]`)
          ) {
            window.TEUI.StateManager.registerDependency(depId, fieldId);
            count++;
          }
        });
      }
    });
  }

  function initializeEventHandlers() {
    const sectionElement = document.getElementById("volumeSurfaceMetrics");
    if (!sectionElement) return;

    // ✅ S10 PROVEN PATTERN: Inline dropdown handlers (like working sections)
    const dropdowns = sectionElement.querySelectorAll("select");
    dropdowns.forEach(dropdown => {
      // Prevent attaching listeners multiple times
      if (dropdown.hasS12Listener) return;

      dropdown.addEventListener("change", function () {
        const fieldId = this.getAttribute("data-field-id");
        if (!fieldId) return;

        ModeManager.setValue(fieldId, this.value, "user-modified");

        // Handle conditional g_109 logic for d_108
        if (fieldId === "d_108") {
          handleConditionalEditability();
        }
      });
      dropdown.hasS12Listener = true;
    });

    const editableFields = sectionElement.querySelectorAll(
      '[contenteditable="true"].user-input'
    );
    editableFields.forEach(field => {
      // Prevent attaching listeners multiple times
      if (field.hasS12Listener) return;

      field.addEventListener("focus", handleFieldFocus);
      field.addEventListener("focusout", handleFieldFocusOut);
      // Blur and Keydown are attached globally now, but keeping local pattern for robustness
      field.addEventListener("blur", handleFieldBlur, true);
      field.addEventListener("keydown", handleFieldKeydown, true);
      field.hasS12Listener = true;
    });

    // Initialize conditional editability state
    handleConditionalEditability();

    // Legacy SM listeners removed — graph handles all computation
  }

  // ✅ REMOVED: Now using S10's inline dropdown handler pattern

  function handleFieldFocus(event) {
    event.target.classList.add("editing");
  }

  function handleFieldFocusOut(event) {
    event.target.classList.remove("editing");
  }

  function handleFieldBlur(event) {
    const field = event.target;
    const fieldId = field.getAttribute("data-field-id");
    if (!fieldId) return;

    const numValue = window.TEUI.parseNumeric(field.textContent);
    if (!isNaN(numValue) && isFinite(numValue)) {
      const formattedValue = window.TEUI.formatNumber(numValue, "number-2dp");
      field.textContent = formattedValue;

      // ✅ DUAL-STATE: Store value using ModeManager
      ModeManager.setValue(fieldId, String(numValue), "user-modified");
    }
  }

  function handleFieldKeydown(event) {
    const field = event.target;
    if (
      field.hasAttribute("contenteditable") &&
      field.getAttribute("contenteditable") === "true"
    ) {
      if (event.key === "Enter") {
        event.preventDefault();
        field.blur();
      }
    }
  }

  function handleConditionalEditability() {
    const d108Dropdown = document.querySelector(
      'select[data-field-id="d_108"]'
    );
    const g109Cell = document.querySelector('[data-field-id="g_109"]');

    if (!d108Dropdown || !g109Cell) return;

    // ✅ DUAL-STATE: Use ModeManager to get current value
    const currentD108Value =
      ModeManager.getValue("d_108") || d108Dropdown.value;
    const isMeasured = currentD108Value === "MEASURED";

    if (isMeasured) {
      g109Cell.setAttribute("contenteditable", "true");
      g109Cell.classList.add("user-input", "editable");
      g109Cell.classList.remove("disabled-input", "ghosted");
      g109Cell.style.backgroundColor = "#f0f8ff";
      g109Cell.style.color = "#000";

      // ✅ FIX: Read from current state instead of hardcoding Target default
      const currentValue = ModeManager.getValue("g_109");

      // If the cell is empty or N/A when switching to Measured, restore from state or use hardcoded default
      if (
        !g109Cell.textContent.trim() ||
        g109Cell.textContent.trim() === "N/A"
      ) {
        // ✅ HARDCODED DEFAULT: Use 1.30 for both Target and Reference to match typical AL-1B calculation
        // This prevents calculations from changing when switching to MEASURED mode
        // User can manually override this value if needed
        const defaultValue = "1.30";
        const rawValue = currentValue || defaultValue;
        console.log(
          `[g_109 Default] currentValue="${currentValue}", using rawValue="${rawValue}"`
        );

        // ✅ FIX: Format to 2dp for consistency
        const numericValue = window.TEUI.parseNumeric(rawValue);
        const displayValue = window.TEUI.formatNumber(
          numericValue,
          "number-2dp"
        );
        g109Cell.textContent = displayValue;

        // Only setValue if we're using the default (not already in state)
        if (!currentValue) {
          ModeManager.setValue("g_109", defaultValue, "calculated");
          console.log(`[g_109 Default] Set g_109 to default: ${defaultValue}`);
        }
      } else {
        // ✅ FIX: Even if cell has content, ensure it's formatted to 2dp
        const numericValue = window.TEUI.parseNumeric(g109Cell.textContent);
        if (!isNaN(numericValue)) {
          g109Cell.textContent = window.TEUI.formatNumber(
            numericValue,
            "number-2dp"
          );
        }
      }
    } else {
      g109Cell.setAttribute("contenteditable", "false");
      g109Cell.classList.remove("user-input", "editable");
      g109Cell.classList.add("disabled-input", "ghosted");
      g109Cell.style.backgroundColor = "#f8f9fa";
      g109Cell.style.color = "#6c757d";
      g109Cell.textContent = "N/A";
      // ✅ DON'T set g_109 to "0" - preserve the value in state
      // This way, if user switches back to MEASURED, the value is still there
      // The N/A display is enough to show the field is not used
      console.log(`[g_109] Locked (not MEASURED mode), preserving state value`);
    }
  }

  function onSectionRendered() {
    if (isInitialized) return;

    console.log(
      "S12: Section rendered - initializing Pattern A Dual-State Module."
    );

    // 1. Initialize the ModeManager and its internal states
    ModeManager.initialize();

    // 2. Setup the section-specific toggle switch in the header

    // 3. Initialize event handlers for this section
    initializeEventHandlers();

    // 4. Add StateManager listeners
    addStateManagerListeners();

    // 5. Apply validation tooltips to fields
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }

    // 6. Register with StateManager and dependencies
    registerWithStateManager();
    registerDependencies();

    // 7. Initialize conditional field state
    handleConditionalEditability();

    // 10. Add section-specific styles
    addCheckmarkStyles();

    isInitialized = true;
    console.log("S12: Pattern A initialization complete.");
  }

  function registerWithStateManager() {
    if (!window.TEUI?.StateManager) return;
    const fields = getFields();
    Object.entries(fields).forEach(([fieldId, fieldDef]) => {
      const currentValue = window.TEUI.StateManager.getValue(fieldId);
      if (
        currentValue === null ||
        currentValue === undefined ||
        window.TEUI.StateManager.getDebugInfo(fieldId)?.state === "default"
      ) {
        if (
          fieldDef.defaultValue !== undefined &&
          fieldDef.defaultValue !== null &&
          fieldDef.defaultValue !== ""
        ) {
          window.TEUI.StateManager.setValue(
            fieldId,
            fieldDef.defaultValue,
            "default"
          );
        }
      }
    });
  }

  function addStateManagerListeners() {
    if (!window.TEUI?.StateManager) return;
    if (s12ListenersAdded) return;

    // Legacy SM listeners removed — graph handles all computation

    s12ListenersAdded = true;
  }

  function addCheckmarkStyles() {
    let styleElement = document.getElementById("sect12-styles");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "sect12-styles";
      styleElement.textContent = `
                .checkmark { color: green; font-weight: bold; }
                .warning { color: red; font-weight: bold; }
                .editable { background-color: #f0f8ff; cursor: text; }
                .editing { outline: 1px solid blue; background-color: #e6f2ff; }
                /* .calculated-value { background-color: #f8f9fa; } REMOVED - Style handled globally */
                .highlighted-result { font-weight: bold; background-color: #fff3cd; }
            `;
      document.head.appendChild(styleElement);
    }
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    getFields: getFields,
    getDropdownOptions: getDropdownOptions,
    getLayout: getLayout,
    initializeEventHandlers: initializeEventHandlers,
    onSectionRendered: onSectionRendered,
    calculateAll: calculateAll,
    calculateTargetModel: calculateTargetModel,
    calculateReferenceModel: calculateReferenceModel,
    ModeManager: ModeManager, // ✅ CRITICAL FIX: Enable FieldManager integration
    // ✅ PHASE 2: Expose state objects for import sync
    TargetState: TargetState,
    ReferenceState: ReferenceState,
    // ✅ BACKUP: Expose initialization state and force method for S03 integration
    get isInitialized() {
      return isInitialized;
    },
    forceInitialization: onSectionRendered,
  };
})();
