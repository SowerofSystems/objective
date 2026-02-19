/**
 * 4012-Section06.js
 * Renewable Energy (Section 6) - Onsite/Offsite Energy Sources
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

// Section 6: Renewable Energy Module
window.TEUI.SectionModules.sect06 = (function () {
  //==========================================================================
  // DUAL-STATE ARCHITECTURE (Self-Contained State Module - Pattern A)
  //==========================================================================

  // PATTERN 1: Internal State Objects (Self-Contained + Persistent)
  const TargetState = {
    state: {},
    listeners: {},
    initialize: function () {
      const savedState = localStorage.getItem("S06_TARGET_STATE");
      if (savedState) {
        this.state = JSON.parse(savedState);
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      this.state = {
        // Editable renewable energy fields - all default to 0
        d_44: "0.00", // Photovoltaics (kWh/yr)
        d_45: "0.00", // Wind (kWh/yr)
        d_46: "0.00", // Remove EV Charging from TEUI (kWh/yr)
        i_44: "0.00", // WWS Electricity (kWh/yr)
        i_46: "0.00", // Reserved other removals (kWh/yr)
        k_45: "0.00", // Green Natural Gas (m³)
        m_43: "0.00", // Exterior/Site/Other Loads (kWh/yr)
      };
    },
    saveState: function () {
      localStorage.setItem("S06_TARGET_STATE", JSON.stringify(this.state));
    },
    setValue: function (fieldId, value, source = "user") {
      this.state[fieldId] = value;
      this.saveState();
    },
    getValue: function (fieldId) {
      return this.state[fieldId];
    },

    /**
     * ✅ PHASE 2: Sync from global StateManager after import
     * Bridges global StateManager → isolated TargetState for imported values
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
        `[S06 TargetState] Applying code-minimum values from "${standard}"`
      );

      Object.keys(referenceValues).forEach(fieldId => {
        if (referenceValues[fieldId] !== undefined) {
          // ✅ Writes to d_44, d_45, etc., NOT ref_d_44
          this.state[fieldId] = referenceValues[fieldId];
          console.log(
            `[S06 TargetState] ${fieldId} = ${referenceValues[fieldId]} (from ${standard})`
          );
        }
      });

      this.saveState();
      console.log(
        `[S06 TargetState] Code-minimum values from "${standard}" applied to Target model`
      );
    },
  };

  const ReferenceState = {
    state: {},
    listeners: {},
    initialize: function () {
      const savedState = localStorage.getItem("S06_REFERENCE_STATE");
      if (savedState) {
        this.state = JSON.parse(savedState);
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      // ✅ DYNAMIC LOADING: Get current reference standard from dropdown ref_d_13
      const currentStandard =
        window.TEUI?.StateManager?.getValue?.("ref_d_13") ||
        "OBC SB10 5.5-6 Z6";
      const referenceValues =
        window.TEUI?.ReferenceValues?.[currentStandard] || {};

      // Apply reference values with fallbacks - renewable energy typically 0 for reference
      this.state = {
        d_44: referenceValues.d_44 || "0.00", // Photovoltaics
        d_45: referenceValues.d_45 || "0.00", // Wind
        d_46: referenceValues.d_46 || "0.00", // Remove EV Charging
        i_44: referenceValues.i_44 || "0.00", // WWS Electricity
        i_46: referenceValues.i_46 || "0.00", // Reserved removals
        k_45: referenceValues.k_45 || "0.00", // Green Natural Gas
        m_43: referenceValues.m_43 || "0.00", // Exterior/Site loads
      };

      console.log(
        `S06: Reference defaults loaded from standard: ${currentStandard}`
      );
    },
    // Listen for changes to the reference standard and reload defaults
    onReferenceStandardChange: function () {
      console.log("S06: Reference standard changed, reloading defaults");
      this.setDefaults();
      this.saveState();
    },
    saveState: function () {
      localStorage.setItem("S06_REFERENCE_STATE", JSON.stringify(this.state));
    },
    setValue: function (fieldId, value, source = "user") {
      this.state[fieldId] = value;
      this.saveState();
    },
    getValue: function (fieldId) {
      return this.state[fieldId];
    },

    /**
     * ✅ PHASE 2: Sync from global StateManager after import
     * Bridges global StateManager → isolated ReferenceState for imported values
     */
    syncFromGlobalState: function () { /* graph is source of truth */ },
  };

  // PATTERN 2: ModeManager Facade (Unified Interface)
  const ModeManager = {
    currentMode: "target",

    initialize: function () {
      TargetState.initialize();
      ReferenceState.initialize();

      // ✅ CSV EXPORT FIX: Publish ALL Reference defaults to StateManager
      if (window.TEUI?.StateManager) {
        ["d_44", "d_45", "d_46", "i_44", "k_45", "i_46", "m_43"].forEach(id => {
          const refId = `ref_${id}`;
          const val = ReferenceState.getValue(id);
          if (
            !window.TEUI.StateManager.getValue(refId) &&
            val != null &&
            val !== ""
          ) {
            window.TEUI.StateManager.setValue(refId, val, "calculated");
          }
        });
      }

      // Listen for reference standard changes
      // ✅ PHASE 3 CLEANUP: d_13 listeners removed - FileHandler handles value application
      // "Set Values" button in Section02 delegates to FileHandler.applyReferenceValuesFromStandard()
      // which applies ReferenceValues using Import Quarantine pattern
    },

    getCurrentState: function () {
      return this.currentMode === "target" ? TargetState : ReferenceState;
    },

    getValue: function (fieldId) {
      return this.getCurrentState().getValue(fieldId);
    },

    setValue: function (fieldId, value, source = "user") {
      this.getCurrentState().setValue(fieldId, value, source);

      // ✅ CRITICAL STATE MIXING FIX: Proper dual-state publication
      if (this.currentMode === "target") {
        // Target changes to StateManager for downstream sections (unprefixed)
        window.TEUI.StateManager.setValue(fieldId, value, "user-modified");
      } else if (this.currentMode === "reference") {
        // ✅ MISSING: Reference changes must be published with ref_ prefix
        window.TEUI.StateManager.setValue(
          `ref_${fieldId}`,
          value,
          "user-modified"
        );
      }
    },

    switchMode: function (mode) {
      if (this.currentMode === mode) return;
      this.currentMode = mode;
      console.log(`S06: Switched to ${mode.toUpperCase()} mode`);

      // ✅ NEW: Sync visual toggle UI when mode changes (from global or local toggle)
      this.syncToggleUI(mode);
    },

    // ✅ NEW: Sync visual toggle switch and indicator to match current mode
    // Called both when user clicks local toggle AND when global toggle switches mode
    syncToggleUI: function (mode) {
      // Use centralized ToggleUISync utility
      window.TEUI.ToggleUISync.syncToggleUI(this._toggleElements, mode, "S06");
    },

    refreshUI: function () { /* DOMBridge.stampAll() handles display */ },

    updateCalculatedDisplayValues: function () { /* DOMBridge.stampAll() handles display */ },

    resetState: function () { /* graph handles state */ },
  };

  // Expose ModeManager for debugging and cross-section communication
  window.TEUI.SectionModules = window.TEUI.SectionModules || {};
  window.TEUI.SectionModules.sect06 = window.TEUI.SectionModules.sect06 || {};
  window.TEUI.SectionModules.sect06.ModeManager = ModeManager;

  // ✅ PATTERN A: Expose ModeManager for ReferenceToggle global switching
  window.TEUI.sect06 = { ModeManager: ModeManager };

  //==========================================================================
  // FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  const sectionRows = {
    header: {
      id: "06-ID",
      rowId: "06-ID",
      label: "Renewable Energy Units",
      cells: {
        c: { content: "C", classes: ["section-subheader"] },
        d: { content: "kWh/yr", classes: ["section-subheader"] },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "H", classes: ["section-subheader"] },
        i: { content: "kWh/yr", classes: ["section-subheader"] },
        j: { content: "J", classes: ["section-subheader"] },
        k: { content: "K", classes: ["section-subheader"] },
        l: { content: "L", classes: ["section-subheader"] },
        m: { content: "kWh/yr", classes: ["section-subheader"] },
        n: { content: "N", classes: ["section-subheader"] },
      },
    },
    43: {
      id: "R.1",
      rowId: "R.1",
      label: "Onsite Energy Subtotals",
      cells: {
        c: { label: "Onsite Energy Subtotals" },
        d: {
          fieldId: "d_43",
          semanticPath: "renewable.onsiteTotal",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_44", "d_45", "d_46", "i_46"],
          label: "Onsite Energy Subtotal: kWh/yr",
        },
        f: { content: "R.5", classes: ["label-prefix"] },
        g: { content: "Offsite Renewable (REC)", classes: ["label-main"] },
        h: {},
        i: {
          fieldId: "i_43",
          semanticPath: "renewable.offsiteTotal",
          type: "calculated",
          value: "0.00",
          dependencies: ["i_44", "i_46"],
          label: "Offsite Renewable (REC) Subtotal: kWh/yr",
        },
        j: { content: "P.5", classes: ["label-prefix"] },
        k: { content: "Exterior/Site/Other Loads", classes: ["label-main"] },
        m: {
          fieldId: "m_43",
          semanticPath: "renewable.exteriorLoads",
          type: "editable",
          value: "0.00",
          classes: ["user-input"],
          tooltip: true, // Default is 0
          label: "Exterior/Site/Other Loads: kWh/yr",
        },
      },
    },
    44: {
      id: "R.2",
      rowId: "R.2",
      label: "Photovoltaics",
      cells: {
        c: { label: "Photovoltaics" },
        d: {
          fieldId: "d_44",
          semanticPath: "renewable.pv",
          type: "editable",
          value: "0.00",
          classes: ["user-input"],
          tooltip: true, // Photovoltaics (no tooltip data available in TooltipManager)
          label: "Photovoltaics: kWh/yr",
        },
        f: { content: "R.6", classes: ["label-prefix"] },
        g: { content: "WWS Electricity", classes: ["label-main"] },
        h: {},
        i: {
          fieldId: "i_44",
          semanticPath: "renewable.wws",
          type: "editable",
          value: "0.00",
          classes: ["user-input"],
          tooltip: true, // WWS Electricity (no tooltip data available)
          label: "WWS Electricity (Offsite REC): kWh/yr",
        },
      },
    },
    45: {
      id: "R.3",
      rowId: "R.3",
      label: "Wind",
      cells: {
        c: { label: "Wind" },
        d: {
          fieldId: "d_45",
          semanticPath: "renewable.wind",
          type: "editable",
          value: "0.00",
          classes: ["user-input"],
          tooltip: true, // Wind (no tooltip data available)
          label: "Wind Energy: kWh/yr",
        },
        f: { content: "R.7", classes: ["label-prefix"] },
        g: { content: "Green Natural Gas", classes: ["label-main"] },
        h: {},
        i: {
          fieldId: "i_45",
          semanticPath: "renewable.greenGasEnergy",
          type: "calculated",
          value: "0.00",
          dependencies: ["k_45"],
          label: "Green Natural Gas (ekWh): kWh/yr",
        },
        j: { content: "ekWh/yr" },
        k: {
          fieldId: "k_45",
          semanticPath: "renewable.greenGas",
          type: "editable",
          value: "0.00",
          classes: ["user-input"],
          tooltip: true, // Green Natural Gas (no tooltip data available)
          label: "Green Natural Gas: m³",
        },
        l: { content: "m³" },
      },
    },
    46: {
      id: "R.4",
      rowId: "R.4",
      label: "Remove EV Charging from TEUI",
      cells: {
        c: { label: "Remove EV Charging from TEUI" },
        d: {
          fieldId: "d_46",
          semanticPath: "renewable.evRemoval",
          type: "editable",
          value: "0.00",
          classes: ["user-input"],
          tooltip: true, // Remove EV Charging (no tooltip data available)
          label: "Remove EV Charging from TEUI: kWh/yr",
        },
        f: { content: "R.8", classes: ["label-prefix"] },
        g: { content: "Reserved (other removals)", classes: ["label-main"] },
        h: {},
        i: {
          fieldId: "i_46",
          semanticPath: "renewable.reserved",
          type: "editable",
          value: "0.00",
          classes: ["user-input"],
          tooltip: true, // Reserved other removals (no tooltip data available)
          label: "Reserved Removals (Special Cases): kWh/yr",
        },
      },
    },
  };

  //==========================================================================
  // ACCESSOR METHODS (Standardized)
  //==========================================================================
  function getFields() {
    const fields = {};
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;
      Object.values(row.cells).forEach(cell => {
        if (cell.fieldId) {
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || row.label,
            defaultValue: cell.value || "",
            section: "onSiteEnergy",
            semanticPath: cell.semanticPath || null, // Phase 5: Include semantic path for migration
          };
        }
      });
    });
    return fields;
  }

  function getDropdownOptions() {
    return {};
  }

  function getLayout() {
    const layoutRows = [];
    if (sectionRows["header"])
      layoutRows.push(createLayoutRow(sectionRows["header"]));
    Object.keys(sectionRows).forEach(key => {
      if (key !== "header") layoutRows.push(createLayoutRow(sectionRows[key]));
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
    ];
    columns.forEach(col => {
      if (row.cells && row.cells[col]) {
        const cell = { ...row.cells[col] };
        if (col === "c" && !cell.label && row.label) cell.label = row.label;
        rowDef.cells.push(cell);
      } else {
        rowDef.cells.push({});
      }
    });
    return rowDef;
  }

  //==========================================================================
  // EXTERNAL DEPENDENCIES (Clean Interface - Pattern A)
  //==========================================================================

  function getSectionValue(fieldId, isReferenceCalculation = false) { return null; /* graph computes */ }

  //==========================================================================
  // DUAL-ENGINE CALCULATIONS (Clean Pattern A - Preserve Excel Formulas)
  //==========================================================================

  function calculateOnSiteSubtotal(isReferenceCalculation = false) { /* graph computes */ }

  function calculateOffsiteRenewable(isReferenceCalculation = false) { /* graph computes */ }

  function calculateGreenNaturalGasEnergy(isReferenceCalculation = false) { /* graph computes */ }

  //==========================================================================
  // DUAL-ENGINE ARCHITECTURE (Clean Pattern A)
  //==========================================================================

  /**
   * REFERENCE MODEL ENGINE: Calculate all values using Reference state
   */
  function calculateReferenceModel() { /* graph computes */ }

  function calculateTargetModel() { /* graph computes */ }

  function calculateAll() { /* graph computes */ }

  //==========================================================================
  // EVENT HANDLERS (Clean Pattern A)
  //==========================================================================

  /**
   * Initialize all event handlers for this section
   */
  function initializeEventHandlers() {
    // 1. Event handlers for editable fields (all renewable energy inputs)
    const editableFields = [
      "d_44", // Photovoltaics
      "d_45", // Wind
      "d_46", // Remove EV Charging
      "i_44", // WWS Electricity
      "i_46", // Reserved removals
      "k_45", // Green Natural Gas
      "m_43", // Exterior/Site loads
    ];

    editableFields.forEach(fieldId => {
      const field = document.querySelector(`[data-field-id="${fieldId}"]`);
      if (field && !field.hasEditableListeners) {
        // ✅ CRITICAL: Prevent newlines on Enter key (copy from S05 pattern)
        field.addEventListener("keydown", e => {
          if (e.key === "Enter") {
            e.preventDefault(); // Prevent adding a newline
            field.blur(); // Remove focus to trigger the blur event
          }
        });

        field.addEventListener("blur", () => {
          const newValue = field.textContent.trim();

          // ✅ CLEAN: Update via ModeManager
          ModeManager.setValue(fieldId, newValue, "user-modified");
        });
        field.hasEditableListeners = true;
      }
    });
  }

  /**
   * Called when the section is rendered
   * This is a good place to initialize values and run initial calculations
   */
  function onSectionRendered() {
    console.log("S06: Pattern A initialization starting...");

    // 1. Initialize dual-state architecture
    ModeManager.initialize();

    // 2. Initialize event handlers
    initializeEventHandlers();

    // 7. Apply validation tooltips to fields
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }

    console.log("S06: Pattern A initialization complete.");
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    // Field definitions and layout - REQUIRED
    getFields: getFields,
    getDropdownOptions: getDropdownOptions,
    getLayout: getLayout,

    // Event handling and initialization - REQUIRED
    initializeEventHandlers: initializeEventHandlers,
    onSectionRendered: onSectionRendered,

    // Section-specific utility functions - OPTIONAL
    calculateAll: calculateAll,

    // ✅ PATTERN A: Expose ModeManager for cross-section communication
    ModeManager: ModeManager,

    // ✅ PHASE 2: Expose state objects for import sync
    TargetState: TargetState,
    ReferenceState: ReferenceState,
  };
})();
