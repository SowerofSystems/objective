/**
 * 4012-Section15.js
 * TEUI Summary (Section 15) - Final Energy Calculations & Dashboard Feed
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

// Section 15: TEUI Summary Module
window.TEUI.SectionModules.sect15 = (function () {
  //==========================================================================
  // HELPER FUNCTIONS
  //==========================================================================

  // Legacy helpers removed — graph computes all values

  //==========================================================================
  // PATTERN A DUAL-STATE ARCHITECTURE
  //==========================================================================

  /**
   * TargetState: Manages Target (user's design) state with persistence
   */
  const TargetState = {
    data: {},
    storageKey: "S15_TARGET_STATE",

    // Load saved state from localStorage
    loadState: function () {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          this.data = JSON.parse(saved);
        }
      } catch (error) {
        console.warn(`S15: Error loading Target state:`, error);
        this.data = {};
      }
    },

    // Save current state to localStorage
    saveState: function () {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      } catch (error) {
        console.warn(`S15: Error saving Target state:`, error);
      }
    },

    // Get value from internal state
    getValue: function (fieldId) {
      return this.data[fieldId];
    },

    // Set value and optionally save state
    setValue: function (fieldId, value, source = "calculated") {
      this.data[fieldId] = value;
      if (source === "user" || source === "user-modified") {
        this.saveState();
      }
    },

    // Set default values for Target calculations
    setDefaults: function () {
      // S15 is mostly calculated values, minimal defaults needed
    },
  };

  /**
   * ReferenceState: Manages Reference (building code minimums) state with persistence
   */
  const ReferenceState = {
    data: {},
    storageKey: "S15_REFERENCE_STATE",

    // Load saved state from localStorage
    loadState: function () {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          this.data = JSON.parse(saved);
          // Re-publish to StateManager even when loading from localStorage
          // This ensures values are available for CSV export after page refresh
          this.publishToStateManager();
        }
      } catch (error) {
        console.warn(`S15: Error loading Reference state:`, error);
        this.data = {};
      }
    },

    // Save current state to localStorage
    saveState: function () {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      } catch (error) {
        console.warn(`S15: Error saving Reference state:`, error);
      }
    },

    // Get value from internal state
    getValue: function (fieldId) {
      return this.data[fieldId];
    },

    // Set value and optionally save state
    setValue: function (fieldId, value, source = "calculated") {
      this.data[fieldId] = value;
      if (source === "user" || source === "user-modified") {
        this.saveState();
      }
    },

    // Set default values for Reference calculations
    setDefaults: function () {
      // d_142: Capital cost premium for heatpump (user input field)
      this.data.d_142 = "30000.00"; // Default heatpump cost premium

      // Publish to StateManager
      this.publishToStateManager();
    },
    publishToStateManager: function () {
      // CSV EXPORT FIX: Publish d_142 Reference default to StateManager
      if (window.TEUI?.StateManager && this.data.d_142) {
        window.TEUI.StateManager.setValue(
          "ref_d_142",
          this.data.d_142,
          "default"
        );
      }
    },
  };

  /**
   * ModeManager: Handles UI mode switching and state coordination
   */
  const ModeManager = {
    currentMode: "target", // "target" or "reference"

    // Initialize the mode manager
    initialize: function () {
      TargetState.loadState();
      ReferenceState.loadState();
      TargetState.setDefaults();
      ReferenceState.setDefaults();
    },

    // Switch between Target and Reference modes
    switchMode: function (mode) {
      if (mode !== "target" && mode !== "reference") {
        console.warn(`S15: Invalid mode: ${mode}`);
        return;
      }

      this.currentMode = mode;

      this.refreshUI();
      this.updateCalculatedDisplayValues();

      // Sync visual toggle UI when mode changes (from global or local toggle)
      this.syncToggleUI(mode);
    },

    // Refresh UI based on current mode
    refreshUI: function () {
      /* DOMBridge.stampAll() handles display */
    },

    // Update calculated field displays based on current mode
    updateCalculatedDisplayValues: function () {
      /* DOMBridge.stampAll() handles display */
    },

    // Reset current mode's state to defaults
    resetCurrentState: function () {
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      currentState.data = {};
      currentState.setDefaults();
      currentState.saveState();

      this.refreshUI();

      console.log(`S15: ${this.currentMode} state reset to defaults`);
    },

    // Get current value based on active mode
    getValue: function (fieldId) {
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      return currentState.getValue(fieldId);
    },

    // Set value in current mode's state
    setValue: function (fieldId, value, source = "calculated") {
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      currentState.setValue(fieldId, value, source);
    },

    getCurrentState: function () {
      return this.currentMode === "target" ? TargetState : ReferenceState;
    },

    // Sync visual toggle switch and indicator to match current mode
    syncToggleUI: function (mode) {
      // Use centralized ToggleUISync utility
      window.TEUI.ToggleUISync.syncToggleUI(this._toggleElements, mode, "S15");
    },
  };

  // MANDATORY: Global exposure for cross-section communication
  window.TEUI.sect15 = window.TEUI.sect15 || {};
  window.TEUI.sect15.ModeManager = ModeManager;
  window.TEUI.sect15.TargetState = TargetState;
  window.TEUI.sect15.ReferenceState = ReferenceState;

  //==========================================================================
  // HEADER CONTROLS INJECTION
  //==========================================================================

  //==========================================================================
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  // Define rows with integrated field definitions
  const sectionRows = {
    // SECTION HEADER
    header: {
      id: "15-ID",
      rowId: "15-ID",
      label: "TEUI Summary Units",
      cells: {
        c: {
          content: "SECTION 15. TEUI Targeted",
          classes: ["section-header"],
        },
        d: { content: "D", classes: ["section-subheader"] },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "H", classes: ["section-subheader"] },
        i: { content: "I", classes: ["section-subheader"] },
        j: { content: "J", classes: ["section-subheader"] },
        k: { content: "K", classes: ["section-subheader"] },
        l: { content: "L", classes: ["section-subheader"] },
        m: { content: "M", classes: ["section-subheader"] },
        n: { content: "N", classes: ["section-subheader"] },
      },
    },

    // Row 135: T.6.0 TEU Targeted Electricity / T.6.1 TEUI
    135: {
      id: "T.6.0",
      rowId: "T.6.0",
      label: "TEU Targeted Electricity",
      cells: {
        c: { label: "TEU Targeted Electricity" },
        d: {
          fieldId: "d_135",
          semanticPath: "teuiSummary.teu.targeted",
          type: "calculated",
          value: "0.00", // Default to 0.00, will be calculated
          label: "TEU Targeted Electricity: ekWh/yr",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        e: { content: "ekWh/yr" },
        f: {
          content: "T.6.1",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: { content: "TEUI", classes: ["label-main", "text-left", "no-wrap"] },
        h: {
          fieldId: "h_135",
          semanticPath: "teuiSummary.teui.targeted",
          type: "calculated",
          value: "0.00", // Default to 0.00
          label: "TEUI: kWh/m\u00B2/yr",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        i: { content: "kWh/m\u00B2/yr" },
        j: {
          content: "Excludes ekWh of any Gas or Oil loads",
          classes: ["note-text"],
        },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 136: T.6.2 TEU Targeted Electricity if HP/Gas/Oil Bldg. / T.6.3 TEUI
    136: {
      id: "T.6.2",
      rowId: "T.6.2",
      label: "TEU Targeted Electricity if HP/Gas/Oil Bldg.",
      cells: {
        c: { label: "TEU Targeted Electricity if HP/Gas/Oil Bldg." },
        d: {
          fieldId: "d_136",
          semanticPath: "teuiSummary.teu.hpGasOil",
          type: "calculated",
          value: "0.00", // Default to 0.00
          label: "TEU if HP/Gas/Oil: kWh/yr",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        e: { content: "kWh/yr" },
        f: {
          content: "T.6.3",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: { content: "TEUI", classes: ["label-main", "text-left", "no-wrap"] },
        h: {
          fieldId: "h_136",
          semanticPath: "teuiSummary.teui.hpGasOil",
          type: "calculated",
          value: "0.00", // Default to 0.00
          label: "TEUI if HP/Gas/Oil: kWh/m\u00B2/yr",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        i: { content: "kWh/m\u00B2/yr" },
        j: {
          content: "Excl. ekWh of fossil eqpt/Applies COP for HP",
          classes: ["note-text"],
        }, //Excludes ekWh of any Gas loads, and Applies COP for HP Equipment
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 137: T.6.4 Peak Heating Load (Enclosure Only) / T.6.4 TEUI-imp
    137: {
      id: "T.6.4",
      rowId: "T.6.4",
      label: "Peak Heating Load (Enclosure Only)",
      cells: {
        c: { label: "Peak Heating Load (Enclosure Only)" },
        d: {
          fieldId: "d_137",
          semanticPath: "teuiSummary.peakHeating.enclosureKw",
          type: "calculated",
          value: "0.00", // Default to 0.00
          label: "Peak Heating Load (Enclosure): kW",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        e: { content: "kW" },
        f: {
          content: "T.6.4",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "TEUI-imp",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: { content: "" }, // Removed fieldId, no calculation for h_137
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: {
          fieldId: "l_137",
          semanticPath: "teuiSummary.peakHeating.enclosureBtu",
          type: "calculated",
          value: "0", // Default to 0
          label: "Peak Heating Load (Enclosure): BTU/hr",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        m: { content: "BTU/hr" },
        n: { content: "" },
      },
    },

    // Row 138: T.6.5 Peak Cooling Load (Enclosure Only) / T.6.6 Peak Cooling Imp
    138: {
      id: "T.6.5",
      rowId: "T.6.5",
      label: "Peak Cooling Load (Enclosure Only)",
      cells: {
        c: { label: "Peak Cooling Load (Enclosure Only)" },
        d: {
          fieldId: "d_138",
          semanticPath: "teuiSummary.peakCooling.enclosureKw",
          type: "calculated",
          value: "0.00", // Default to 0.00
          label: "Peak Cooling Load (Enclosure): kW",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        e: { content: "kW" },
        f: {
          content: "T.6.6",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "Peak Cooling Imp",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "h_138",
          semanticPath: "teuiSummary.peakCooling.enclosureTons",
          type: "calculated",
          value: "0.00", // Default to 0.00
          label: "Peak Cooling (Enclosure): Tons",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        i: { content: "Tons-Cooling" },
        j: { content: "" },
        k: { content: "" },
        l: {
          fieldId: "l_138",
          semanticPath: "teuiSummary.peakCooling.enclosureBtu",
          type: "calculated",
          value: "0", // Default to 0
          label: "Peak Cooling Load (Enclosure): BTU/hr",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        m: { content: "BTU/hr" },
        n: { content: "" },
      },
    },

    // Row 139: T.6.7 Peak Cooling Load (Enclosure + Gains) / T.6.9 Peak Cooling Imp
    139: {
      id: "T.6.7",
      rowId: "T.6.7",
      label: "Peak Cooling Load (Enclosure + Gains)",
      cells: {
        c: { label: "Peak Cooling Load (Enclosure + Gains)" },
        d: {
          fieldId: "d_139",
          semanticPath: "teuiSummary.peakCooling.totalKw",
          type: "calculated",
          value: "0.00", // Default to 0.00
          label: "Peak Cooling Load (Encl.+Gains): kW",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        e: { content: "kW" },
        f: {
          content: "T.6.9",
          classes: ["label-prefix", "text-right", "no-wrap"],
        }, // Note: CSV says T.6.7, but UI label suggests T.6.9? Assuming T.6.9 for field h_139
        g: {
          content: "Peak Cooling Imp",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "h_139",
          semanticPath: "teuiSummary.peakCooling.totalTons",
          type: "calculated",
          value: "0.00", // Default to 0.00
          label: "Peak Cooling (Encl.+Gains): Tons",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        i: { content: "Tons-Cooling" },
        j: { content: "" },
        k: { content: "" },
        l: {
          fieldId: "l_139",
          semanticPath: "teuiSummary.peakCooling.totalBtu",
          type: "calculated",
          value: "0", // Default to 0
          label: "Peak Cooling Load (Encl.+Gains): BTU/hr",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        m: { content: "BTU/hr" },
        n: { content: "" },
      },
    },

    // Row 140: T.6.8 Max. Heating Load Intensity / T.6.8 Heat Load Imp
    140: {
      id: "T.6.8",
      rowId: "T.6.8",
      label: "Max. Heating Load Intensity",
      cells: {
        c: { label: "Max. Heating Load Intensity" },
        d: {
          fieldId: "d_140",
          semanticPath: "teuiSummary.maxIntensity.heating",
          type: "calculated",
          value: "0.00", // Default to 0.00
          label: "Max. Heating Load Intensity: W/m\u00B2",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        e: { content: "W/m\u00B2" },
        f: {
          content: "T.6.8",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "Heat Load Imp",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "h_140",
          semanticPath: "teuiSummary.maxIntensity.cooling",
          type: "calculated",
          value: "0.00", // Default to 0.00 - Max Cool Intsty in W/m\u00B2 (Enclosure Only)
          label: "Max. Cooling Load Intensity: W/m\u00B2",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        i: { content: "" }, // Unit removed as it's W/m2
        j: { content: "T.6.6 Mx. Cool Intsty in W/m\u00B2 (Enclosure Only)" },
        k: { content: "" },
        l: { content: "" }, // l_140 removed, no formula in CSV
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 141: T.7.1 Annual Cost of Electricity
    141: {
      id: "T.7.1",
      rowId: "T.7.1",
      label: "Annual Cost of Electricity",
      cells: {
        c: { label: "Annual Cost of Electricity" },
        d: {
          fieldId: "d_141",
          semanticPath: "teuiSummary.annualCost.preHeatpump",
          type: "calculated",
          value: "$0.00", // Default to $0.00
          label: "Annual Cost of Electricity (pre-HP): $",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        e: { content: "" },
        f: {
          content: "T.7.2",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "pre and",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "h_141",
          semanticPath: "teuiSummary.annualCost.postHeatpump",
          type: "calculated",
          value: "$0.00", // Default to $0.00
          label: "Annual Cost of Electricity (post-HP): $",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        i: { content: "post heat pump" },
        j: { content: "T.7.3" },
        k: { content: "\u2211 Other Energy" },
        l: {
          fieldId: "l_141",
          semanticPath: "teuiSummary.annualCost.otherEnergy",
          type: "calculated",
          value: "$0.00", // Default to $0.00
          label: "\u2211 Other Energy Costs: $",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 142: T.7.4 Cost Premium of HP Equipment
    142: {
      id: "T.7.4",
      rowId: "T.7.4",
      label: "Cost Premium of HP Equipment",
      cells: {
        c: { label: "Cost Premium of HP Equipment" },
        d: {
          // This seems like an input, not calculated. Assuming it's an editable field for now.
          fieldId: "d_142",
          semanticPath: "teuiSummary.capitalCost.heatpumpPremium",
          type: "editable",
          value: "30000.00", // Default value from CSV example
          label: "Cost Premium of HP Equipment: $",
          classes: ["user-input"], // Assuming user input style
          section: "teuiSummary",
          tooltip: true, // Capital Cost Premium
        },
        e: { content: "" },
        f: {
          content: "T.7.5",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: { content: "ROI", classes: ["label-main", "text-left", "no-wrap"] },
        h: {
          fieldId: "h_142",
          semanticPath: "teuiSummary.capitalCost.roiYears",
          type: "calculated",
          value: "0.00", // Default to 0.00
          label: "Heatpump ROI: Years",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        i: { content: "Years to Amortize" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 143: T.3.1 TEUI Reference / T.3.2 Targeted TEUI / T.3.3 Actual
    143: {
      id: "T.3.1",
      rowId: "T.3.1",
      label: "TEUI Reference (Performance Gap)",
      cells: {
        c: { label: "TEUI Reference (Performance Gap)" },
        d: {
          fieldId: "d_143",
          semanticPath: "teuiSummary.performanceGap.reference",
          type: "calculated",
          value: "0.00", // Default to 0.00
          label: "TEUI Reference: kWh/m\u00B2/yr",
          classes: ["reference-value"], // Keep reference style
          section: "teuiSummary",
        },
        e: { content: "Reference" },
        f: {
          content: "T.3.2",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "Targeted TEUI",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "h_143",
          semanticPath: "teuiSummary.performanceGap.targeted",
          type: "calculated",
          value: "0.00", // Default to 0.00
          label: "TEUI Targeted: kWh/m\u00B2/yr",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        i: { content: "Target (Design)" },
        j: { content: "T.3.3" },
        k: { content: "Actual" },
        l: {
          fieldId: "l_143",
          semanticPath: "teuiSummary.performanceGap.actual",
          type: "calculated",
          value: "0.00", // Default to 0.00
          label: "TEUI Actual: kWh/m\u00B2/yr",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        m: { content: "Actual (Utility Bills)" },
        n: { content: "" },
      },
    },

    // Row 144: T.8.1 TEUI Energy Reduction from Reference / T.8.2 Target % of Utility
    144: {
      id: "T.8.1",
      rowId: "T.8.1",
      label: "TEUI Energy Reduction from Reference",
      cells: {
        c: { label: "TEUI Energy Reduction from Reference" },
        d: {
          fieldId: "d_144",
          semanticPath: "teuiSummary.reduction.fromReference",
          type: "calculated",
          value: "0%", // Default to 0%
          label: "TEUI Reduction from Reference: %",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        e: { content: "" },
        f: {
          content: "T.8.2",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "Target % of Utility Data",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "h_144",
          semanticPath: "teuiSummary.reduction.targetOfUtility",
          type: "calculated",
          value: "0%", // Default to 0%
          label: "Target % of Utility Data: %",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        i: { content: "of Utility Data" },
        j: { content: "T.8.3" },
        k: { content: "Actual" },
        l: {
          fieldId: "l_144",
          semanticPath: "teuiSummary.reduction.actualOfTargeted",
          type: "calculated",
          value: "0%", // Default to 0%
          label: "Actual % of Targeted Design: %",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        m: { content: "of Targeted Design" },
        n: { content: "" },
      },
    },

    // Row 145: T.9.1 GHGe Reduction from Reference
    145: {
      id: "T.9.1",
      rowId: "T.9.1",
      label: "GHGe Reduction from Reference",
      cells: {
        c: { label: "GHGe Reduction from Reference" },
        d: {
          fieldId: "d_145",
          semanticPath: "teuiSummary.ghgeReduction",
          type: "calculated",
          value: "0%", // Default to 0%
          label: "GHGe Reduction from Reference: %",
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },
  };

  //==========================================================================
  // ACCESSOR METHODS TO EXTRACT FIELDS AND LAYOUT
  //==========================================================================

  /**
   * Extract field definitions from the integrated layout
   * This method is required for compatibility with the FieldManager
   */
  function getFields() {
    const fields = {};

    // Extract field definitions from all rows except the header
    Object.entries(sectionRows).forEach(([rowKey, row]) => {
      if (rowKey === "header") return; // Skip the header row
      if (!row.cells) return;

      // Process each cell in the row
      Object.entries(row.cells).forEach(([colKey, cell]) => {
        // Include 'editable' types now
        if (
          cell.fieldId &&
          (cell.type === "calculated" || cell.type === "editable")
        ) {
          // Create field definition with all relevant properties
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || row.label,
            // Use 'value' from cell definition as defaultValue
            defaultValue: cell.value !== undefined ? cell.value.toString() : "",
            section: cell.section || "teuiSummary",
            semanticPath: cell.semanticPath || null, // Phase 5: Include semantic path
          };

          // Copy additional field properties if they exist
          if (cell.dropdownId)
            fields[cell.fieldId].dropdownId = cell.dropdownId;
          if (cell.options) fields[cell.fieldId].options = cell.options;
          if (cell.getOptions)
            fields[cell.fieldId].getOptions = cell.getOptions;
          if (cell.dependencies)
            fields[cell.fieldId].dependencies = cell.dependencies;
          if (cell.min !== undefined) fields[cell.fieldId].min = cell.min;
          if (cell.max !== undefined) fields[cell.fieldId].max = cell.max;
          if (cell.step !== undefined) fields[cell.fieldId].step = cell.step;
        }
      });
    });

    return fields;
  }

  /**
   * Extract dropdown options from the integrated layout
   * Required for backward compatibility
   */
  function getDropdownOptions() {
    const options = {};

    // Extract dropdown options from all cells with dropdownId
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

  /**
   * Generate layout from integrated row definitions
   * This converts our compact definition to the format expected by the renderer
   */
  function getLayout() {
    // IMPORTANT: To ensure the header appears first, we process the rows in
    // a specific order: header first, then all other rows

    // Start with an empty array for rows
    const layoutRows = [];

    // First add the header row if it exists
    if (sectionRows["header"]) {
      layoutRows.push(createLayoutRow(sectionRows["header"]));
    }

    // Then add all other rows in their original order, excluding the header
    Object.entries(sectionRows).forEach(([key, row]) => {
      if (key !== "header") {
        layoutRows.push(createLayoutRow(row));
      }
    });

    return { rows: layoutRows };
  }

  /**
   * Helper function to convert a row definition to the layout format
   * This function handles the conversion of column C cells for proper row labels
   */
  function createLayoutRow(row) {
    // Create standard row structure
    const rowDef = {
      id: row.id,
      cells: [
        {}, // Empty column A
        {}, // ID column B (auto-populated)
      ],
    };

    // Add cells C through N based on the row definition
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
    ];

    // For each column, add the cell definition if it exists in the row
    columns.forEach(col => {
      if (row.cells && row.cells[col]) {
        // Create a simplified cell definition for the renderer
        // without the extra field properties
        const cell = { ...row.cells[col] };

        // Special handling for column C to support both label patterns
        if (col === "c") {
          // If using content+type pattern, convert to label pattern
          if (cell.type === "label" && cell.content && !cell.label) {
            cell.label = cell.content;
            delete cell.type; // Not needed for rendering
            delete cell.content; // Not needed once we have label
          }
          // If neither label nor content exists, use row's label as fallback
          else if (!cell.label && !cell.content && row.label) {
            cell.label = row.label;
          }
        }

        // Remove field-specific properties that aren't needed for rendering
        delete cell.getOptions;
        delete cell.section;
        delete cell.dependencies; // Dependencies are handled by StateManager, not renderer
        // Keep 'value' for editable fields' initial display
        // Keep 'type' for renderer to identify editable vs calculated

        rowDef.cells.push(cell);
      } else {
        // Add empty cell if not defined
        // Special handling for column C - use row's label if available
        if (col === "c" && !row.cells?.c && row.label) {
          rowDef.cells.push({ label: row.label });
        } else {
          // Otherwise add empty cell
          rowDef.cells.push({});
        }
      }
    });

    return rowDef;
  }

  //==========================================================================
  // CALCULATIONS AND DEPENDENCIES
  //==========================================================================

  /**
   * Register dependencies — graph owns the dependency map
   */
  function registerDependencies() {
    /* graph computes */
  }

  /**
   * Calculate all values — graph computes
   */
  function calculateAll() {
    /* graph computes */
  }

  function calculateReferenceModel() {
    /* graph computes */
  }

  function calculateTargetModel() {
    /* graph computes */
  }

  function calculateValues() {
    /* graph computes */
  }

  /**
   * Handle editable field blur events (for d_142 cost premium input)
   */
  function handleEditableBlur(event) {
    const fieldElement = event.target;
    const fieldId = fieldElement.getAttribute("data-field-id");
    if (!fieldId) return;

    let valueStr = fieldElement.textContent.trim();
    let numValue = window.TEUI.parseNumeric(valueStr, NaN);

    if (!isNaN(numValue)) {
      // Store in both local state and global StateManager to trigger dependencies
      ModeManager.setValue(fieldId, numValue.toString(), "user-modified");
      window.TEUI.StateManager.setValue(
        fieldId,
        numValue.toString(),
        "user-modified"
      );
    } else {
      // Invalid input - revert to stored value or default
      const storedValue = ModeManager.getValue(fieldId) || "30000.00";
      fieldElement.textContent = storedValue;
    }
  }

  /**
   * Initialize event handlers for this section
   * Sets up listeners for changes in dependency values from other sections.
   */
  function initializeEventHandlers() {
    if (!window.TEUI.StateManager) {
      console.warn(
        "StateManager not available for teuiSummary dependency registration"
      );
      return;
    }
    const sm = window.TEUI.StateManager;

    // Setup event handlers for editable fields
    const editableFields = ["d_142"]; // Cost Premium of HP Equipment

    editableFields.forEach(fieldId => {
      const field = document.querySelector(`[data-field-id="${fieldId}"]`);
      if (
        field &&
        field.hasAttribute("contenteditable") &&
        !field.hasEditableListeners
      ) {
        // Prevent Enter key from creating newlines
        field.addEventListener("keydown", e => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            field.blur();
          }
        });

        // Handle blur event
        field.addEventListener("blur", handleEditableBlur);

        // Visual feedback for editing state
        field.addEventListener("focus", () => field.classList.add("editing"));
        field.addEventListener("focusout", () =>
          field.classList.remove("editing")
        );

        field.hasEditableListeners = true;
      }
    });

    // All computational SM listeners removed — graph handles dependency tracking
  }

  /**
   * Called when section is rendered
   */
  function onSectionRendered() {
    // Initialize Pattern A Dual-State Module
    ModeManager.initialize();

    // Inject header controls for local testing and troubleshooting

    // Register dependencies first
    // Dependencies might rely on other sections being registered, so ensure StateManager is ready
    if (window.TEUI.StateManager) {
      registerDependencies();
    } else {
      console.warn(
        "StateManager not ready during sect15 onSectionRendered dependency registration."
      );
      // Optionally, retry registration later or listen for a StateManager ready event
    }

    // Initialize event handlers AFTER dependencies are registered
    initializeEventHandlers();

    // Apply validation tooltips to fields
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }

    // Initial calculation should now be triggered by the central Calculator.calculateAll
    // or by listeners responding to dependency updates.
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    // Field definitions and layout - REQUIRED
    getFields: getFields,
    getDropdownOptions: getDropdownOptions,
    getLayout: getLayout,

    // Calculations
    calculateAll: calculateAll,

    // Pattern A Mode management
    switchMode: function (mode) {
      ModeManager.switchMode(mode);
    },

    // Event handling and initialization - REQUIRED
    initializeEventHandlers: initializeEventHandlers,
    onSectionRendered: onSectionRendered,

    // Expose ModeManager for global toggle integration
    ModeManager: ModeManager,
  };
})();

// Event listeners removed in ORDERING branch

// Add an initialized flag to prevent multiple runs of onSectionRendered
if (
  window.TEUI &&
  window.TEUI.SectionModules &&
  window.TEUI.SectionModules.sect15
) {
  window.TEUI.SectionModules.sect15.initialized = false;
}
