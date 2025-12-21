/**
 * Section19.js - WOMBAT: 3D Thermal Topology Visualization
 * TEUI 4.012 - Created 2025-12-08
 *
 * WOMBAT generates a constraint-driven 3D thermal topology from area-based geometry.
 * Like a wombat creates cubic output from inputs, we transform thermal geometry fields
 * into cube-like topology. This is NOT an architectural model - it's a thermal model as topology.
 *
 * Core Principles:
 * - Volume is Sacred (d_105 ALWAYS preserved exactly)
 * - Footprint Area is Sacred (d_95 ALWAYS preserved exactly, and varies with d_154 - Aspect Ratio)
 * - Roof Area is Sacred (d_85 ALWAYS preserved exactly, and uses roof type from d_159 and height as a flexible variable, greater ht. allows greater area AND volume)
 * - Areas Drive Form (Footprint area generates volume by storey, roof pitch/steepness/height, wall heights emerge from area constraints)
 * - No Validation Errors (impossible geometry renders visually as feedback in console ticker per S16.js.backup file pattern)
 * - Constraint Satisfaction Feedback (color-coded UI shows how well areas match)
 */

window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

window.TEUI.SectionModules.sect19 = (function () {
  "use strict";

  //==========================================================================
  // STATE & CONFIGURATION
  //==========================================================================

  let isActivated = false;
  let threejsLoaded = false; // Future implementation for flatShader, orbit, zoom, ground plane generation, etc.
  let currentModel = null;

  // BIM-STYLE COORDINATE CONVENTION: Y+ = North (for future window orientation per facade)
  // X+ = East, Y+ = North, Z+ = Up (right-handed coordinate system)
  // Config moved to wombatRender.js

  //==========================================================================
  // PATTERN A DUAL-STATE ARCHITECTURE
  //==========================================================================

  /**
   * TargetState - Holds Target mode values for WOMBAT fields
   * Provides state sovereignty for Target calculation mode
   */
  const TargetState = {
    values: {
      d_150: "1", // Stories (mirrors S12 d_103)
      d_151: "8319.50", // Volume (mirrors S12 d_105)
      d_154: "0.0", // Aspect ratio slider (L:W)- to be implemented
      d_158: "mezzanine", // Floorplate Options (mezzanine/equal), absorbs difference of h_15-d_95 when h_15>d_95 for 1.5 storey buildings
      d_159: "biplanar", // Roof Type (multiplanar/biplanar/monoplane)
      h_155: "0.00", // Calculated: Footprint width driven by user-editable slider
      h_156: "0.00", // Calculated: Storey height, use first g_106 as wall height, but allow to be less to satisfy volume and/or wall constraints
      h_157: "0.00", // Calculated: Footprint length
    },

    getValue: function (fieldId) {
      return this.values[fieldId] !== undefined ? this.values[fieldId] : null;
    },

    setValue: function (fieldId, value) {
      this.values[fieldId] = value;
    },

    setDefaults: function () {
      // Initialize from field definitions
      this.values.d_150 = "1.0";
      this.values.d_151 = "8319.50";
      this.values.d_154 = "0.0";
      this.values.d_158 = "mezzanine";
      this.values.d_159 = "biplanar";
      this.values.h_155 = "0.00";
      this.values.h_156 = "0.00";
      this.values.h_157 = "0.00";
    },

    syncFromGlobalState: function () {
      // ✅ MIRROR SYNC: Read S12 source fields (d_103, d_105) and store as S19 mirror fields (d_150, d_151)
      // ExcelMapper only populates d_103/d_105, NOT d_150/d_151 (those are S19-only fields)
      const d_103 = window.TEUI?.StateManager?.getValue("d_103");
      if (d_103 !== null && d_103 !== undefined) {
        this.values.d_150 = d_103; // Stories (mirrors S12 d_103)
      }

      const d_105 = window.TEUI?.StateManager?.getValue("d_105");
      if (d_105 !== null && d_105 !== undefined) {
        this.values.d_151 = d_105; // Volume (mirrors S12 d_105)
      }

      // Sync other S19-specific fields normally
      const fieldIds = ["d_154", "d_158", "d_159", "h_155", "h_156", "h_157"];
      fieldIds.forEach(fieldId => {
        const value = window.TEUI?.StateManager?.getValue(fieldId);
        if (value !== null && value !== undefined) {
          this.values[fieldId] = value;
        }
      });
    },
  };

  /**
   * ReferenceState - Holds Reference mode values for WOMBAT fields
   * Provides state sovereignty for Reference calculation mode, all identical on initialization but me have 100% independence from TargetState
   */
  const ReferenceState = {
    values: {
      d_150: "1.0", // Stories (mirrors S12 ref_d_103)
      d_151: "8319.50", // Volume (mirrors S12 ref_d_105)
      d_154: "0.0", // Aspect ratio slider
      d_158: "mezzanine", // Floorplate Options (mezzanine/equal)
      d_159: "biplanar", // Roof Type (multiplanar/biplanar/monoplane)
      h_155: "0.00", // Calculated: Footprint width
      h_156: "0.00", // Calculated: Story height
      h_157: "0.00", // Calculated: Footprint length
    },

    getValue: function (fieldId) {
      return this.values[fieldId] !== undefined ? this.values[fieldId] : null;
    },

    setValue: function (fieldId, value) {
      this.values[fieldId] = value;
    },

    setDefaults: function () {
      // Initialize from field definitions
      this.values.d_150 = "1.0";
      this.values.d_151 = "8319.50";
      this.values.d_154 = "0.0";
      this.values.d_158 = "mezzanine";
      this.values.d_159 = "biplanar";
      this.values.h_155 = "0.00";
      this.values.h_156 = "0.00";
      this.values.h_157 = "0.00";
    },

    syncFromGlobalState: function () {
      // ✅ MIRROR SYNC: Read S12 reference source fields (ref_d_103, ref_d_105) and store as S19 mirror fields
      // ExcelMapper only populates ref_d_103/ref_d_105, NOT ref_d_150/ref_d_151 (those are S19-only fields)
      const ref_d_103 = window.TEUI?.StateManager?.getValue("ref_d_103");
      if (ref_d_103 !== null && ref_d_103 !== undefined) {
        this.values.d_150 = ref_d_103; // Stories (mirrors S12 ref_d_103)
      }

      const ref_d_105 = window.TEUI?.StateManager?.getValue("ref_d_105");
      if (ref_d_105 !== null && ref_d_105 !== undefined) {
        this.values.d_151 = ref_d_105; // Volume (mirrors S12 ref_d_105)
      }

      // Sync other S19-specific reference fields normally
      const fieldIds = ["d_154", "d_158", "d_159", "h_155", "h_156", "h_157"];
      fieldIds.forEach(fieldId => {
        const value = window.TEUI?.StateManager?.getValue(`ref_${fieldId}`);
        if (value !== null && value !== undefined) {
          this.values[fieldId] = value;
        }
      });
    },
  };

  /**
   * ModeManager - Facade for dual-state operations
   * Handles mode-aware reading, writing, and StateManager publishing
   */
  const ModeManager = {
    currentMode: "target", // "target" or "reference"

    /**
     * Switch between Target and Reference modes (PASSIVE PATTERN - like S16)
     * IMPORTANT: Does NOT update input fields - FieldManager handles dual-state routing
     * Only re-renders the 3D visualization with the new mode's geometry
     */
    switchMode: function (mode) {
      if (mode !== "target" && mode !== "reference") {
        return;
      }

      if (this.currentMode === mode) {
        return; // No change needed
      }

      this.currentMode = mode;

      // Update visualization with new mode's geometry and color (passive redraw)
      // Per S16 pattern: Just re-render with current mode's data from StateManager
      if (isActivated) {
        updateVisualization(mode);
      }
    },

    /**
     * Refresh UI - Required by FileHandler Pattern A section sync
     * Called after import to update DOM with synced values
     */
    refreshUI: function () {
      this.updateCalculatedDisplayValues();
    },

    /**
     * Required by ReferenceToggle - but S19 is passive visualization like S16
     * Calculated fields are already published to StateManager by calculation engines
     * No need to manually update DOM - FieldManager handles display updates
     */
    updateCalculatedDisplayValues: function () {
      console.log(
        `[WOMBAT] updateCalculatedDisplayValues() called for mode="${this.currentMode}"`
      );

      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;

      // ✅ EXPANDED: Include mirror sync fields (d_150, d_151) that need DOM refresh
      // These are technically "input" fields, but when S12 changes them via mirror sync,
      // they BEHAVE like calculated fields and need DOM updates
      const fieldsToRefresh = [
        "h_155",
        "h_156",
        "h_157", // Geometry outputs (read-only)
        "d_150",
        "d_151", // Mirror sync inputs (editable) - NEW
      ];

      fieldsToRefresh.forEach(fieldId => {
        const value = currentState.getValue(fieldId);
        if (value === null || value === undefined) {
          return; // Skip if no value
        }

        // Try FieldManager first (for input fields like d_150/d_151)
        const fieldDef = window.TEUI?.FieldManager?.getField(fieldId);
        if (fieldDef && window.TEUI?.FieldManager?.updateFieldDisplay) {
          try {
            window.TEUI.FieldManager.updateFieldDisplay(
              fieldId,
              value,
              fieldDef
            );
          } catch (e) {
            // Silent failure - FieldManager will handle errors
          }
        } else {
          // Fallback for read-only calculated fields (h_155, h_156, h_157)
          const element = document.querySelector(
            `[data-field-id="${fieldId}"]`
          );
          if (
            element &&
            element.tagName !== "INPUT" &&
            !element.hasAttribute("contenteditable")
          ) {
            const formattedValue = parseFloat(value).toFixed(2);
            element.textContent = formattedValue;
          }
        }
      });
    },

    /**
     * Get value from current mode's state
     */
    getValue: function (fieldId) {
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      return currentState.getValue(fieldId);
    },

    /**
     * Set value in current mode's state and publish to StateManager
     * MODE-AWARE PUBLISHING: Target publishes unprefixed, Reference publishes ref_ prefixed
     */
    setValue: function (fieldId, value, source = "user-modified") {
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      currentState.setValue(fieldId, value);

      // Mode-aware publishing to StateManager
      if (this.currentMode === "target") {
        // Target mode: publish unprefixed
        window.TEUI.StateManager.setValue(fieldId, value, source);
      } else {
        // Reference mode: publish with ref_ prefix
        window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, source);
      }
    },
  };

  //==========================================================================
  // FIELD DEFINITIONS (Section 20 - 200 series)
  //==========================================================================

  const sectionRows = {
    header: {
      id: "S19-HEADER",
      rowId: "S19-HEADER",
      cells: {
        a: {},
        b: {},
        c: { content: "C", classes: ["section-subheader"] },
        d: {
          content: "Options related to Section12",
          classes: ["section-subheader"],
        },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "H", classes: ["section-subheader"] },
      },
    },

    // Stories dropdown (mirrored from S12 d_103)
    row150: {
      id: "19.0",
      rowId: "19.0",
      label: "Stories",
      cells: {
        a: {},
        b: {},
        c: { label: "Stories" },
        d: {
          fieldId: "d_150",
          type: "dropdown",
          dropdownId: "dd_d_150",
          value: "1",
          section: "wombat",
          tooltip: true,
          label: "Number of stories (mirrored from S12)",
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
        f: {},
        g: {},
        h: {},
      },
    },

    // Volume input (mirrored from S12 d_105)
    row151: {
      id: "19.V",
      rowId: "19.V",
      label: "Conditioned Volume",
      cells: {
        a: {},
        b: {},
        c: { label: "Conditioned Volume" },
        d: {
          fieldId: "d_151",
          type: "editable",
          value: "8319.50",
          classes: ["user-input"],
          tooltip: true,
          label: "Conditioned volume (mirrored from S12)",
        },
        e: { content: "m³", classes: ["unit-label"] },
        f: {},
        g: {},
        h: {},
      },
    },

    // Display-only: Area Exposed to Air (mirrored from S12 d_101, comprises total of Roof Area + Wall Area + Window Area)
    row152: {
      id: "19.Ae",
      rowId: "19.Ae",
      label: "Area Exposed to Air (Ae)",
      cells: {
        a: {},
        b: {},
        c: { label: "Area Exposed to Air (Ae)" },
        d: {
          fieldId: "d_152",
          type: "calculated",
          value: "2476.62",
          classes: ["text-air-facing"],
          label: "Total area of building components exposed to air (from S12)",
        },
        e: { content: "m²", classes: ["unit-label"] },
        f: { content: "U-Val. for Ae", classes: ["label-main"] },
        g: {
          fieldId: "g_152",
          type: "calculated",
          value: "0.278",
          classes: ["text-air-facing"],
          label: "Aggregate U-value for air-facing surfaces (from S12)",
        },
        h: { content: "W/m²·K", classes: ["unit-label"] },
      },
    },

    // Display-only: Area Exposed to Ground (mirrored from S12 d_102) - Includes floor slab and any basement walls
    row153: {
      id: "19.Ag",
      rowId: "19.Ag",
      label: "Area Exposed to Ground (Ag)",
      cells: {
        a: {},
        b: {},
        c: { label: "Area Exposed to Ground (Ag)" },
        d: {
          fieldId: "d_153",
          type: "calculated",
          value: "1100.93",
          classes: ["text-ground-facing"],
          label:
            "Total area of building components exposed to ground (from S12)",
        },
        e: { content: "m²", classes: ["unit-label"] },
        f: { content: "U-Val. for Ag", classes: ["label-main"] },
        g: {
          fieldId: "g_153",
          type: "calculated",
          value: "0.324",
          classes: ["text-ground-facing"],
          label: "Aggregate U-value for ground-facing surfaces (from S12)",
        },
        h: { content: "W/m²·K", classes: ["unit-label"] },
      },
    },

    // User controls for topology solver - redistributes area/volume into footprint length, width, and height, initializes as 0 = Square = X=Y. 
    row154: {
      id: "19.1",
      rowId: "19.1",
      label: "Footprint Aspect Ratio (L:W)",
      cells: {
        a: {},
        b: {},
        c: { label: "Footprint Aspect Ratio (L:W)" },
        d: {
          fieldId: "d_154",
          type: "coefficient_slider",
          value: "0.0",
          min: -4.0,
          max: 4.0,
          step: 0.1, // Consider adding snap to 0 for ease of value setting.
          section: "wombat",
          tooltip: true,
          label:
            "Aspect Ratio: 0 = square, negative = portrait (tall), positive = landscape (wide)",
        },
        e: { content: "(0 = square)", classes: ["text-left"] },
        f: {},
        g: {},
        h: {
          fieldId: "h_157",
          type: "calculated",
          value: "0.00",
          label: "Footprint Length (m)",
        },
      },
    },

    row155: {
      id: "19.2",
      rowId: "19.2",
      label: "Footprint Width",
      cells: {
        a: {},
        b: {},
        c: { label: "Footprint Width" },
        d: {},
        e: {},
        f: {},
        g: {},
        h: {
          fieldId: "h_155",
          type: "calculated",
          value: "0.00",
          label: "Footprint Width (m)",
        },
      },
    },

    row156: {
      id: "19.3",
      rowId: "19.3",
      label: "Building Height",
      cells: {
        a: {},
        b: {},
        c: { label: "Building Height" },
        d: {},
        e: {},
        f: {},
        g: {},
        h: {
          fieldId: "h_156",
          type: "calculated",
          value: "0.00",
          label: "Nominal Height (m)",
        },
      },
    },

    // No row 157 yet...

        // Floorplate Options dropdown (clarifies fractional story interpretation)
    row158: {
      id: "19.FP",
      rowId: "19.FP",
      label: "Floorplate Options",
      cells: {
        a: {},
        b: {},
        c: { label: "Floorplate Options" },
        d: {
          fieldId: "d_158",
          type: "dropdown",
          dropdownId: "dd_d_158",
          value: "mezzanine",
          section: "wombat",
          tooltip: true,
          label: "Geometry interpretation for fractional stories",
          options: [
            { value: "mezzanine", name: "Mezzanine" },
            { value: "equal", name: "Equal Floorplates" },
          ],
        },
        e: { content: "", classes: ["unit-label"] },
        f: {},
        g: {},
        h: {},
      },
    },

    // Roof Type dropdown (selects roof geometry type)
    row159: {
      id: "19.RT",
      rowId: "19.RT",
      label: "Roof Type",
      cells: {
        a: {},
        b: {},
        c: { label: "Roof Type" },
        d: {
          fieldId: "d_159",
          type: "dropdown",
          dropdownId: "dd_d_159",
          value: "biplanar",
          section: "wombat",
          tooltip: true,
          label:
            "Roof geometry type (multiplanar=pyramid, biplanar=gable, monoplane=shed, flat=no slope)",
          options: [
            { value: "multiplanar", name: "Pyramid/Hip" },
            { value: "biplanar", name: "Gable" },
            { value: "monoplane", name: "Shed" },
            { value: "flat", name: "Flat" },
          ],
        },
        e: { content: "", classes: ["unit-label"] },
        f: {},
        g: {},
        h: {},
      },
    },

  };

  //==========================================================================
  // ACCESSOR METHODS
  //==========================================================================

  function getFields() {
    const fields = {};
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;
      // Handle object-based cells (like Section12)
      Object.values(row.cells).forEach(cell => {
        if (cell.fieldId) {
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || cell.content || row.label,
            defaultValue: cell.value || "",
            section: "section19",
          };
          if (cell.min !== undefined) fields[cell.fieldId].min = cell.min;
          if (cell.max !== undefined) fields[cell.fieldId].max = cell.max;
          if (cell.step !== undefined) fields[cell.fieldId].step = cell.step;
          if (cell.options !== undefined)
            fields[cell.fieldId].options = cell.options;
          if (cell.dropdownId !== undefined)
            fields[cell.fieldId].dropdownId = cell.dropdownId;
        }
      });
    });
    return fields;
  }

  function getDropdownOptions() {
    return {
      dd_d_150: [
        { value: "1", name: "1" },
        { value: "1.5", name: "1.5" },
        { value: "2", name: "2" },
        { value: "3", name: "3" },
        { value: "4", name: "4" },
        { value: "5", name: "5" },
        { value: "6", name: "6" },
      ],
      dd_d_158: [
        { value: "mezzanine", name: "Mezzanine/Partial Floor" },
        { value: "equal", name: "Equal Floorplates" },
      ],
    };
  }

  /**
   * Convert object-based cells to array format for FieldManager
   * (Following Section12 pattern)
   */
  function createLayoutRow(row) {
    const rowDef = { id: row.id, cells: [{}, {}] }; // Start with columns A, B (empty)
    const columns = ["c", "d", "e", "f", "g", "h"];

    columns.forEach(col => {
      if (row.cells && row.cells[col]) {
        const cell = { ...row.cells[col] };

        // Handle column C (description) label conversion
        if (col === "c") {
          if (cell.type === "label" && cell.content && !cell.label) {
            cell.label = cell.content;
            delete cell.type;
            delete cell.content;
          } else if (!cell.label && !cell.content && row.label) {
            cell.label = row.label;
          }
        }

        // Clean up internal properties not needed by FieldManager
        delete cell.section;
        delete cell.dependencies;

        rowDef.cells.push(cell);
      } else {
        // Empty cell or fallback to row label for column C
        if (col === "c" && !row.cells?.c && row.label) {
          rowDef.cells.push({ label: row.label });
        } else {
          rowDef.cells.push({});
        }
      }
    });

    return rowDef;
  }

  function getLayout() {
    const layoutRows = [];

    // Add header
    if (sectionRows.header) {
      layoutRows.push(createLayoutRow(sectionRows.header));
    }

    // Add data rows
    [
      "row150",
      "row151",
      "row152",
      "row153",
      "row154",
      "row155",
      "row156",
      //"row157",   //Reserved for future use
      "row158",     //footprint width to be added
      "row159",     //building height to be added
      
      
    ].forEach(key => {
      if (sectionRows[key]) {
        layoutRows.push(createLayoutRow(sectionRows[key]));
      }
    });

    return { rows: layoutRows };
  }

  //==========================================================================
  // GEOMETRY SOLVER (Constraint-Driven "Jello Cube")
  //==========================================================================

  /**
   * Get mode-aware value from StateManager (S16 pattern)
   * - Target mode: reads unprefixed values (h_15, d_85, d_86)
   * - Reference mode: reads ref_ prefixed values (ref_h_15, ref_d_85, ref_d_86)
   */
  function getModeAwareValue(fieldId, isReferenceCalculation) {
    if (!window.TEUI?.StateManager) return null;

    if (isReferenceCalculation) {
      // Reference mode: Read ONLY ref_ prefixed values for perfect state isolation
      return window.TEUI.StateManager.getValue(`ref_${fieldId}`);
    } else {
      // Target mode: Read unprefixed (standard) values
      return window.TEUI.StateManager.getValue(fieldId);
    }
  }

  //==========================================================================
  // PRISMATIC EXTRUSION GEOMETRY SOLVER (WOMBAT 4)
  //==========================================================================
  // Architecture: Footprint → 2D Profile → Extrude for Volume → Render from Nodes
  // Unified pattern for flat, gable, shed, hip roofs - no iteration needed
  //==========================================================================

  //==========================================================================
  // PHASE 1: ROOF GEOMETRY SOLVERS (from area constraint)
  // These functions solve roof geometry from ROOF AREA constraint FIRST,
  // independent of wall height. They return roof height and roof volume.
  //==========================================================================

  /**
   * Solve roof geometry from roof area constraint (FIRST step in constraint flow)
   * Returns roof height and roof volume for wall height derivation
   */
  function solveRoofGeometry(roofTypeRequested, roofArea, footprintArea, ridgeLength, span) {
    const areaRatio = roofArea / footprintArea;

    // Check roof collapse condition
    if (areaRatio <= 1.01) {
      console.log(`[WOMBAT] Roof area ≤ footprint (${areaRatio.toFixed(2)}x) → flat roof`);
      return {
        roofType: "flat",
        roofHeight: 0,
        roofVolume: 0,
        gableEndArea: 0,
        shedEndWallArea: 0
      };
    }

    // Roof area > footprint → solve pitched roof geometry
    if (roofTypeRequested === "biplanar") {
      return solveGableRoof(roofArea, ridgeLength, span, footprintArea);
    } else if (roofTypeRequested === "monoplane") {
      return solveShedRoof(roofArea, ridgeLength, span, footprintArea);
    } else if (roofTypeRequested === "flat") {
      // Flat roof explicitly selected by user
      return {
        roofType: "flat",
        roofHeight: 0,
        roofVolume: 0,
        gableEndArea: 0,
        shedEndWallArea: 0
      };
    } else {
      // Default to flat for unknown types
      console.warn(`[WOMBAT] Unknown roof type "${roofTypeRequested}", defaulting to flat`);
      return {
        roofType: "flat",
        roofHeight: 0,
        roofVolume: 0,
        gableEndArea: 0,
        shedEndWallArea: 0
      };
    }
  }

  /**
   * Solve gable roof geometry from roof area constraint
   * Returns roof height, roof volume, and gable end areas
   */
  function solveGableRoof(roofArea, ridgeLength, span, footprintArea) {
    // Gable roof: two rectangular slopes meet at ridge
    // CRITICAL: Ridge runs along LONG dimension (structural efficiency)
    // Slope drops perpendicular to ridge across SHORT dimension
    // Structural members span the SHORT distance

    // SWAP: ridgeLength should be LONG, span should be SHORT
    // The parameters come in with ridgeLength=SHORT, span=LONG, so we swap them
    const actualRidgeLength = span;      // LONG dimension (ridge runs along this)
    const actualSpan = ridgeLength;      // SHORT dimension (triangle base, slope drops across this)

    // Total roof area = 2 rectangular slopes
    // roofArea = 2 × ridge × slopeLength
    const slopeLength = roofArea / (2 * actualRidgeLength);

    // Pythagorean theorem:
    // Slope runs from ridge at center to eave at edge
    // Horizontal distance = half the building width (actualSpan/2)
    // slopeLength² = roofHeight² + (actualSpan/2)²
    // roofHeight² = slopeLength² - (actualSpan/2)²
    const h2 = slopeLength * slopeLength - (actualSpan * actualSpan) / 4;

    if (h2 < 0) {
      console.error(`[WOMBAT] Invalid gable geometry - roof area ${roofArea.toFixed(0)}m² too small for footprint`);
      console.error(`[WOMBAT] Need slopeLength (${slopeLength.toFixed(2)}m) > span/2 (${(span/2).toFixed(2)}m)`);
      return {
        roofType: "flat",
        roofHeight: 0,
        roofVolume: 0,
        gableEndArea: 0,
        shedEndWallArea: 0
      };
    }

    const roofHeight = Math.sqrt(h2);

    // Gable end area (triangular): base × height / 2
    // Triangle base = SHORT dimension (actualSpan)
    const gableEndArea = (actualSpan * roofHeight) / 2;

    // Roof volume = rectangular prism (footprint × roofHeight / 2)
    // Geometrically: two triangular prisms stacked = box × 1/2
    const roofVolume = (footprintArea * roofHeight) / 2;

    console.log(`[WOMBAT] Gable roof solved from area constraint:`);
    console.log(`  Roof area: ${roofArea.toFixed(2)} m²`);
    console.log(`  Ridge length: ${actualRidgeLength.toFixed(2)} m (LONG dimension - CORRECTED)`);
    console.log(`  Span (triangle base): ${actualSpan.toFixed(2)} m (SHORT dimension)`);
    console.log(`  Slope length: ${slopeLength.toFixed(2)} m`);
    console.log(`  Roof height: ${roofHeight.toFixed(2)} m`);
    console.log(`  Roof volume: ${roofVolume.toFixed(2)} m³`);
    console.log(`  Gable end area (both): ${(2 * gableEndArea).toFixed(2)} m²`);

    return {
      roofType: "gable",
      roofHeight,
      roofVolume,
      gableEndArea: 2 * gableEndArea,  // Both triangular ends
      shedEndWallArea: 0
    };
  }

  /**
   * Solve shed roof geometry from roof area constraint
   * Returns roof height, roof volume, and shed end wall areas
   */
  function solveShedRoof(roofArea, ridgeLength, span, footprintArea) {
    // Shed roof: single rectangular slope
    // CRITICAL: Ridge runs along LONG dimension (structural efficiency)
    // Slope drops perpendicular to ridge across SHORT dimension
    // Structural members span the SHORT distance (same as slope horizontal distance)

    // SWAP: ridgeLength should be LONG, span should be SHORT
    // The parameters come in with ridgeLength=SHORT, span=LONG, so we swap them
    const actualRidgeLength = span;      // LONG dimension (ridge runs along this)
    const actualSpan = ridgeLength;      // SHORT dimension (slope drops across this)

    // Roof area = ridge × slopeLength
    const slopeLength = roofArea / actualRidgeLength;

    // Pythagorean theorem:
    // slopeLength² = roofHeight² + span²
    // roofHeight² = slopeLength² - span²
    const h2 = slopeLength * slopeLength - actualSpan * actualSpan;

    if (h2 < 0) {
      console.error(`[WOMBAT] Invalid shed geometry - roof area ${roofArea.toFixed(0)}m² too small for footprint`);
      console.error(`[WOMBAT] Need slopeLength (${slopeLength.toFixed(2)}m) > span (${span.toFixed(2)}m)`);
      return {
        roofType: "flat",
        roofHeight: 0,
        roofVolume: 0,
        gableEndArea: 0,
        shedEndWallArea: 0
      };
    }

    const roofHeight = Math.sqrt(h2);

    // Shed end wall area (rectangular): actualSpan × roofHeight
    const shedEndWallArea = actualSpan * roofHeight;

    // Roof volume = trapezoidal prism volume
    // = footprint × (average height above eave)
    // = footprint × (roofHeight / 2)
    const roofVolume = (footprintArea * roofHeight) / 2;

    console.log(`[WOMBAT] Shed roof solved from area constraint:`);
    console.log(`  Roof area: ${roofArea.toFixed(2)} m²`);
    console.log(`  Ridge length: ${actualRidgeLength.toFixed(2)} m (LONG dimension - CORRECTED)`);
    console.log(`  Span: ${actualSpan.toFixed(2)} m (SHORT dimension - slope drops across this)`);
    console.log(`  Slope length: ${slopeLength.toFixed(2)} m`);
    console.log(`  Roof height: ${roofHeight.toFixed(2)} m`);
    console.log(`  Roof volume: ${roofVolume.toFixed(2)} m³ (steals from walls)`);
    console.log(`  Shed end wall area (both): ${(2 * shedEndWallArea).toFixed(2)} m²`);

    return {
      roofType: "shed",
      roofHeight,
      roofVolume,
      gableEndArea: 0,
      shedEndWallArea: 2 * shedEndWallArea  // Both rectangular ends
    };
  }

  //==========================================================================
  // PHASE 3: 2D PROFILE BUILDERS (for rendering only, NOT solving)
  // These functions just BUILD node arrays from pre-calculated dimensions
  //==========================================================================

  /**
   * Solve flat roof 2D profile - simple rectangle
   */
  function solveFlat2DProfile(width, wallHeight) {
    return {
      nodes: [
        { x: 0, z: 0 },
        { x: width, z: 0 },
        { x: width, z: wallHeight },
        { x: 0, z: wallHeight },
      ],
      type: "flat",
      height: 0,
      wallHeight: wallHeight,
      endWallArea: 0,
    };
  }

  /**
   * Build gable roof 2D profile from pre-calculated dimensions
   * Does NOT solve geometry - just builds node array for rendering
   * Ridge runs across SHORT dimension (structural efficiency)
   */
  function buildGable2DProfile(width, wallHeight, roofHeight) {
    return {
      nodes: [
        { x: 0, z: 0 },                                 // Left ground
        { x: width, z: 0 },                             // Right ground
        { x: width, z: wallHeight },                    // Right eave
        { x: width / 2, z: wallHeight + roofHeight },   // Peak
        { x: 0, z: wallHeight },                        // Left eave
      ],
      type: "gable",
      height: roofHeight,
      wallHeight: wallHeight,
      endWallArea: width * wallHeight + (width * roofHeight) / 2, // Rectangle + triangle
    };
  }

  /**
   * Build shed roof 2D profile from pre-calculated dimensions
   * Does NOT solve geometry - just builds node array for rendering
   * CRITICAL: Ridge runs along LONG dimension (structural efficiency)
   * Profile width = LONG dimension (ridge runs across this width)
   * Profile will be extruded along SHORT dimension
   * Slope drops from X=0 (low eave) to X=width (high ridge)
   */
  function buildShed2DProfile(width, wallHeight, roofHeight) {
    const tallWallHeight = wallHeight + roofHeight;

    return {
      nodes: [
        { x: 0, z: 0 },                   // Left ground (low eave side)
        { x: width, z: 0 },               // Right ground (high ridge side)
        { x: width, z: tallWallHeight },  // Right eave (high ridge)
        { x: 0, z: wallHeight },          // Left eave (low eave)
      ],
      type: "shed",
      height: roofHeight,
      wallHeight: wallHeight,
      tallWallHeight: tallWallHeight,
      endWallArea: ((wallHeight + tallWallHeight) / 2) * width, // Trapezoid end wall
    };
  }

  /**
   * Extrude 2D profile to satisfy volume constraint AND footprint and roof constraints (noting mezzanine area does not participate in volume generation)
   */
  function extrudeProfile(profile2D, targetVolume) {
    const width = profile2D.nodes[1].x;
    let crossSectionArea;

    if (profile2D.type === "gable") {
      // Rectangle (wall) + Triangle (roof)
      const rectangleArea = width * profile2D.wallHeight;
      const triangleArea = (width * profile2D.height) / 2;
      crossSectionArea = rectangleArea + triangleArea;
    } else if (profile2D.type === "shed") {
      // Trapezoid: average of two parallel sides × width
      const avgHeight = (profile2D.wallHeight + profile2D.tallWallHeight) / 2;
      crossSectionArea = width * avgHeight;
    } else {
      // Flat roof: just rectangle
      crossSectionArea = width * profile2D.wallHeight;
    }

    const extrusionDepth = targetVolume / crossSectionArea;
    return {
      depth: extrusionDepth,
      crossSectionArea: crossSectionArea,
    };
  }

  /**
   * Generate 3D corner nodes from 2D profile + extrusion depth
   * Returns 8 nodes for flat/shed, 10 nodes for gable (4 ground + 4 eave + 2 ridge)
   */
  function generate3DNodes(profile2D, extrusionDepth) {
    const halfDepth = extrusionDepth / 2;
    const width = profile2D.nodes[1].x;
    const halfWidth = width / 2;

    const nodes = {
      ground: [
        { x: -halfWidth, y: -halfDepth, z: 0 },
        { x: halfWidth, y: -halfDepth, z: 0 },
        { x: halfWidth, y: halfDepth, z: 0 },
        { x: -halfWidth, y: halfDepth, z: 0 },
      ],
      eave: [],
    };

    // Generate eave nodes based on roof type
    if (profile2D.type === "shed") {
      // Shed roof: short side at wallHeight, tall side at tallWallHeight
      // Slope runs from -Y (short) to +Y (tall)
      nodes.eave = [
        { x: -halfWidth, y: -halfDepth, z: profile2D.wallHeight },      // Front left (short)
        { x: halfWidth, y: -halfDepth, z: profile2D.wallHeight },       // Front right (short)
        { x: halfWidth, y: halfDepth, z: profile2D.tallWallHeight },    // Back right (tall)
        { x: -halfWidth, y: halfDepth, z: profile2D.tallWallHeight },   // Back left (tall)
      ];
    } else {
      // Flat or gable: uniform eave height
      nodes.eave = [
        { x: -halfWidth, y: -halfDepth, z: profile2D.wallHeight },
        { x: halfWidth, y: -halfDepth, z: profile2D.wallHeight },
        { x: halfWidth, y: halfDepth, z: profile2D.wallHeight },
        { x: -halfWidth, y: halfDepth, z: profile2D.wallHeight },
      ];
    }

    // Add ridge nodes for gable roof
    if (profile2D.type === "gable") {
      const peakHeight = profile2D.wallHeight + profile2D.height;
      nodes.ridge = [
        { x: 0, y: -halfDepth, z: peakHeight }, // Front ridge
        { x: 0, y: halfDepth, z: peakHeight },  // Back ridge
      ];
    }

    return nodes;
  }

  /**
   * Main geometry solver using prismatic extrusion, translation of copy of elevation geometry as sweep along longer axis (idea from ArchiCad GDL)
   *
   * CRITICAL CONSTRAINTS (in priority order):
   * 1. Volume (d_105) - SACRED, always preserved exactly
   * 2. Footprint Area (d_95/d_87) - SACRED, always preserved exactly
   * 3. Roof Area (d_85) - SACRED ONLY if > footprint area, else collapses to flat roof
   * 4. Aspect Ratio (d_154) - Reshapes footprint while preserving area
   * 5. Storey Height (g_106) - SACRIFICIAL to satisfy volume constraint
   *
   * ROOF COLLAPSE RULE: If roof area <= footprint area, pitched roof is geometrically impossible
   * → Automatically fall back to flat roof (roof area = footprint area)
   * → User must increase d_85 to enable pitched roofs
   */
  function solveGeometry(isReferenceCalculation = false) {
    const mode = isReferenceCalculation ? "Reference" : "Target";
    console.log(`[WOMBAT-2] Prismatic solver (${mode} mode)`);

    // Read sacred constraints
    const d_105_raw = getModeAwareValue("d_105", isReferenceCalculation);
    const targetVolume = parseFloat(d_105_raw) || 8319.5;

    // Get roof type from d_159 dropdown
    const roofTypeRaw = getModeAwareValue("d_159", isReferenceCalculation);
    const roofTypeRequested = (roofTypeRaw || "flat").toLowerCase(); // biplanar, monoplane, flat, multiplanar

    // Get roof area (d_85) - SACRED constraint
    const d_85_raw = getModeAwareValue("d_85", isReferenceCalculation);
    const roofArea = parseFloat(d_85_raw) || 1100;

    // Get footprint area from d_95 (slab on grade) - SACRED constraint
    let footprintArea = parseFloat(getModeAwareValue("d_95", isReferenceCalculation));
    if (!footprintArea || footprintArea <= 0) {
      // Fallback to raised floor (d_87)
      footprintArea = parseFloat(getModeAwareValue("d_87", isReferenceCalculation)) || 1100;
    }

    // ========================================================================
    // ASPECT RATIO IMPLEMENTATION (from Section19.js.backup:1108-1127)
    // Superior formula - no branching, mathematically pure
    // ========================================================================
    // Read aspect ratio slider d_154 (-4.0 to +4.0, step 0.1, default 0.0)
    // 0 = square (1:1), positive = landscape (wide), negative = portrait (tall)
    const currentState = isReferenceCalculation ? ReferenceState : TargetState;
    const d_154_raw = currentState.getValue("d_154");

    console.log(`[WOMBAT-2 DEBUG] d_154_raw from state: ${d_154_raw} (type: ${typeof d_154_raw})`);

    const aspectRatioRaw = parseFloat(d_154_raw) || 0.0;

    // Convert slider value to actual aspect ratio (length/width)
    const aspectRatio = aspectRatioRaw >= 0
      ? 1 + aspectRatioRaw           // Landscape: 0→1, +1→2, +2→3, +4→5
      : 1 / (1 - aspectRatioRaw);    // Portrait:  0→1, -1→0.5, -2→0.33, -4→0.2

    console.log(`[WOMBAT-2 DEBUG] aspectRatio calculated: ${aspectRatio}`);
    console.log(`[WOMBAT-2 DEBUG] footprintArea: ${footprintArea}`);

    // Solve footprint dimensions - preserves area exactly
    const width = Math.sqrt(footprintArea / aspectRatio);
    const length = footprintArea / width;  // Exact, no rounding error

    console.log(`[WOMBAT-2 DEBUG] width: ${width}, length: ${length}`);
    console.log(`[WOMBAT-2] Aspect ratio: ${aspectRatioRaw.toFixed(1)} → ${aspectRatio.toFixed(2)}:1 (L:W)`);
    console.log(`[WOMBAT-2] Footprint: ${width.toFixed(2)}m × ${length.toFixed(2)}m = ${footprintArea.toFixed(2)}m²`);

    // ========================================================================
    // ROOF COLLAPSE CONSTRAINT
    // Pitched roofs require roof area > footprint area
    // If roof area <= footprint, geometry is impossible → fall back to flat
    // ========================================================================
    const areaRatio = roofArea / footprintArea;
    let roofType = roofTypeRequested;

    if (areaRatio <= 1.01 && roofTypeRequested !== "flat") {
      console.warn(`[WOMBAT-2] ⚠️ ROOF COLLAPSE: Roof area (${roofArea.toFixed(2)}m²) ≈ footprint (${footprintArea.toFixed(2)}m²)`);
      console.warn(`[WOMBAT-2] → Pitched roof geometrically impossible, falling back to FLAT roof`);
      console.warn(`[WOMBAT-2] → Increase d_85 to > ${(footprintArea * 1.1).toFixed(0)}m² to enable ${roofTypeRequested} roof`);
      roofType = "flat";
    }

    console.log(`[WOMBAT-2] Inputs: footprint=${footprintArea.toFixed(2)}m², volume=${targetVolume.toFixed(2)}m³, roof=${roofType} (requested: ${roofTypeRequested})`);

    // Calculate ridge orientation - ridge runs across SHORT dimension (structural efficiency)
    // This MUST be calculated dynamically because aspect ratio changes which dimension is short/long
    const ridgeLength = Math.min(width, length);  // SHORT dimension (ridge runs across this)
    const span = Math.max(width, length);         // LONG dimension (slope runs across this)
    const ridgeOrientation = length >= width ? "longitudinal" : "transverse";

    console.log(`[WOMBAT-2] Ridge: ${ridgeOrientation} (${ridgeLength.toFixed(2)}m across ${ridgeLength === width ? 'width' : 'length'}), Span: ${span.toFixed(2)}m`);

    // ========================================================================
    // PHASE 2: SOLVE ROOF GEOMETRY FROM AREA CONSTRAINT (FIRST!)
    // This is the CORRECT constraint order - roof area drives roof height
    // ========================================================================
    const roofResult = solveRoofGeometry(
      roofType,           // May be collapsed from roofTypeRequested
      roofArea,
      footprintArea,
      ridgeLength,
      span
    );

    console.log(`[WOMBAT-2] Roof solved: type=${roofResult.roofType}, height=${roofResult.roofHeight.toFixed(2)}m, volume=${roofResult.roofVolume.toFixed(2)}m³`);

    // ========================================================================
    // PHASE 3: CALCULATE WALL HEIGHT
    // Start with g_106 reference, compress if volume exceeded
    // ========================================================================
    const storiesDeclared = parseFloat(currentState.getValue("d_150")) || 1.0;

    // Get reference wall height per storey (g_106)
    const g_106_raw = getModeAwareValue("g_106", isReferenceCalculation);
    const storyHeightReference = parseFloat(g_106_raw) || 5.15; // Default 5.15m

    // TRY reference wall height first
    let wallHeightTarget = storyHeightReference * storiesDeclared;
    let wallVolume = footprintArea * wallHeightTarget;
    let calculatedVolume = wallVolume + roofResult.roofVolume;

    console.log(`[WOMBAT-2] Attempting reference wall height:`);
    console.log(`  Target wall height: ${wallHeightTarget.toFixed(2)} m (${storiesDeclared} × ${storyHeightReference.toFixed(2)}m from g_106)`);
    console.log(`  Would give volume: ${calculatedVolume.toFixed(2)} m³`);
    console.log(`  USER TARGET (d_105): ${targetVolume.toFixed(2)} m³`);

    // Check if volume would be exceeded
    let wallHeight;
    let storyHeightActual;
    let wallHeightViolation = false;

    if (calculatedVolume > targetVolume) {
      // Volume exceeded - compress walls to fit
      const availableWallVolume = targetVolume - roofResult.roofVolume;

      if (availableWallVolume < 0) {
        // Roof alone exceeds volume - this is critical
        console.error(`[WOMBAT-2] ⚠️ CRITICAL: Roof volume (${roofResult.roofVolume.toFixed(0)}m³) exceeds total volume (${targetVolume.toFixed(0)}m³)`);
        console.error(`[WOMBAT-2] → Using reference wall height anyway, volume will be violated`);
        wallHeight = wallHeightTarget;
        storyHeightActual = storyHeightReference;
        wallVolume = footprintArea * wallHeight;
        calculatedVolume = wallVolume + roofResult.roofVolume;
        wallHeightViolation = true;
      } else {
        // Compress walls to fit within volume budget
        wallHeight = availableWallVolume / footprintArea;
        storyHeightActual = wallHeight / storiesDeclared;
        wallVolume = availableWallVolume;
        calculatedVolume = targetVolume; // Exactly matches now
        wallHeightViolation = true;

        console.warn(`[WOMBAT-2] ⚠️ Volume exceeded - compressing walls to fit`);
        console.warn(`[WOMBAT-2] → Wall height reduced: ${wallHeightTarget.toFixed(2)}m → ${wallHeight.toFixed(2)}m`);
        console.warn(`[WOMBAT-2] → Storey height: ${storyHeightReference.toFixed(2)}m → ${storyHeightActual.toFixed(2)}m`);
        console.warn(`[WOMBAT-2] → To restore: increase d_105 (volume) or reduce d_85 (roof area)`);
      }
    } else {
      // Volume OK - use reference height
      wallHeight = wallHeightTarget;
      storyHeightActual = storyHeightReference;
      console.log(`[WOMBAT-2] ✓ Using reference wall height (volume within budget)`);
    }

    console.log(`[WOMBAT-2] Final geometry:`);
    console.log(`  Footprint: ${footprintArea.toFixed(2)} m² (d_95 - SACRED)`);
    console.log(`  Roof area: ${roofArea.toFixed(2)} m² (d_85 - SACRED)`);
    console.log(`  Roof height: ${roofResult.roofHeight.toFixed(2)} m`);
    console.log(`  Wall height: ${wallHeight.toFixed(2)} m (${wallHeightViolation ? 'COMPRESSED' : 'reference'})`);
    console.log(`  Storey height: ${storyHeightActual.toFixed(2)} m`);
    console.log(`  Wall volume: ${wallVolume.toFixed(2)} m³`);
    console.log(`  Roof volume: ${roofResult.roofVolume.toFixed(2)} m³`);
    console.log(`  Total volume: ${calculatedVolume.toFixed(2)} m³`);

    // ========================================================================
    // PHASE 4: BUILD 2D PROFILE FOR RENDERING (not solving!)
    // Profile builders just construct node arrays from pre-calculated dimensions
    // ========================================================================
    let profile2D;
    if (roofResult.roofType === "gable") {
      // CRITICAL: For gable, profile shows CROSS-SECTION (triangle)
      // Profile width = SHORT dimension (triangle base, perpendicular to ridge)
      // Profile will be extruded along LONG dimension (parallel to ridge)
      // Ridge runs parallel to long walls
      profile2D = buildGable2DProfile(ridgeLength, wallHeight, roofResult.roofHeight);
    } else if (roofResult.roofType === "shed") {
      // CRITICAL: For shed, profile width = LONG dimension (where ridge runs)
      // Profile will be extruded along SHORT dimension
      profile2D = buildShed2DProfile(span, wallHeight, roofResult.roofHeight);
    } else {
      // Flat roof
      profile2D = solveFlat2DProfile(ridgeLength, wallHeight);
    }

    // ========================================================================
    // PHASE 5: EXTRUDE AND GENERATE 3D NODES
    // ========================================================================
    const extrusion = extrudeProfile(profile2D, targetVolume);

    // Extrusion depth depends on roof type:
    // - Flat: extrude along LONG (span) - profile width is SHORT
    // - Gable: extrude along LONG (span) - profile width is SHORT (triangle cross-section)
    // - Shed: extrude along SHORT (ridgeLength) - profile width is LONG
    let extrusionDepth;
    if (roofResult.roofType === "shed") {
      extrusionDepth = ridgeLength;  // SHORT - shed ridge is at end
    } else {
      extrusionDepth = span;  // LONG - gable/flat ridge runs along length
    }
    const nodes3D = generate3DNodes(profile2D, extrusionDepth);

    console.log(`[WOMBAT-2] Profile: ${profile2D.type}, extrusion depth: ${extrusion.depth.toFixed(2)}m, span: ${span.toFixed(2)}m`);
    console.log(`[WOMBAT-2] Footprint dimensions: width=${width.toFixed(2)}m, length=${length.toFixed(2)}m (from aspect ratio)`);

    // Store calculated footprint dimensions in state for display
    currentState.setValue("h_155", width.toFixed(2));  // Footprint width (from aspect ratio)
    currentState.setValue("h_157", length.toFixed(2)); // Footprint length (from aspect ratio)
    currentState.setValue("h_156", storyHeightActual.toFixed(2)); // Actual storey height (may be compressed)

    const volumeDifference = calculatedVolume - targetVolume;

    // Return complete geometry
    return {
      footprint: { width, length },
      ridgeOrientation,
      roofType: roofResult.roofType,
      roofHeight: roofResult.roofHeight,
      roofVolume: roofResult.roofVolume,
      wallHeight,
      wallVolume,
      calculatedVolume,         // Actual volume from geometry
      targetVolume,              // User's specified volume (d_105)
      volumeDifference,          // Difference for reporting
      wallHeightViolation,       // Flag if walls were compressed
      storyHeightReference,      // Reference from g_106
      storyHeight: storyHeightActual,  // Actual (may be compressed)
      stories: storiesDeclared,
      height: wallHeight,  // For backward compatibility
      totalHeight: wallHeight + roofResult.roofHeight,
      roofCollapsed: roofResult.roofType !== roofTypeRequested,
      nodes3D,
      profile2D,
      // Wall area data for thermal calculations
      gableEndArea: roofResult.gableEndArea,
      shedEndWallArea: roofResult.shedEndWallArea,
    };
  }

  //==========================================================================
  // 3D RENDERING (Delegated to wombatRender.js)
  //==========================================================================

  function initializeSVG() {
    const svg = document.getElementById("wombat-svg");
    if (!svg) {
      console.error("[WOMBAT] SVG element not found");
      return;
    }

    console.log("[WOMBAT] SVG element initialized");
    // Placeholder: Draw simple message until activated
    drawPlaceholder();
  }

  function drawPlaceholder() {
    const svg = document.getElementById("wombat-svg");
    if (!svg) return;

    // Delegate to wombatRender.js
    window.TEUI.WombatRender.renderPlaceholder(svg);
  }

  function updateVisualization(mode = "target") {
    console.log(`🎨 [WOMBAT updateVisualization] Called with mode="${mode}"`);
    console.log(`🎨 [WOMBAT updateVisualization] isActivated = ${isActivated}`);
    if (!isActivated) {
      console.warn(
        `⚠️ [WOMBAT updateVisualization] Not activated, returning early`
      );
      return;
    }

    // Solve geometry for the requested mode
    const isReference = mode === "reference";
    console.log(`🎨 [WOMBAT updateVisualization] isReference = ${isReference}`);
    const geometry = solveGeometry(isReference);
    currentModel = geometry;

    // Get SVG element
    const svg = document.getElementById("wombat-svg");
    console.log(`🎨 [WOMBAT updateVisualization] SVG element found: ${!!svg}`);
    if (!svg) {
      console.error(`❌ [WOMBAT updateVisualization] SVG element not found!`);
      return;
    }

    // Delegate rendering to wombatRender.js
    console.log(`🎨 [WOMBAT] Delegating render to wombatRender.js`);
    window.TEUI.WombatRender.render(geometry, mode, svg, {
      showBelowGrade: false, // Phase 2: will enable when implemented
    });
  }

  //==========================================================================
  // ACTIVATION CONTROLS (Following S17 pattern)
  //==========================================================================

  function createActivationControls() {
    const container = document.querySelector(".wombat-controls-wrapper");
    if (!container) {
      console.error("[WOMBAT] Controls wrapper not found");
      return;
    }

    container.innerHTML = `
      <div class="wombat-controls">
        <!-- Activation button -->
        <button id="wombat-activate-btn" class="btn btn-primary btn-sm">
          🏗️ Activate Topology View
        </button>

        <!-- Description text (middle flex area) -->
        <span style="color: #6c757d; font-size: 13px;">
          Generate 3D thermal topology from envelope areas (Volume, Roof, Walls, Windows)
        </span>

        <!-- Control buttons (right side) -->
        <div>
          <button id="wombat-refresh-btn" class="btn btn-outline-secondary btn-sm"
                  title="Refresh Topology" disabled>
            <i class="bi bi-arrow-repeat"></i>
          </button>

          <button id="wombat-info-btn" class="btn btn-outline-secondary btn-sm"
                  title="What is WOMBAT?">
            <i class="bi bi-gear"></i>
          </button>

          <button id="wombat-fullscreen-btn" class="btn btn-outline-secondary btn-sm"
                  title="Toggle Fullscreen" disabled>
            <i class="bi bi-fullscreen"></i>
          </button>
        </div>
      </div>
    `;

    // Attach activation handler
    const activateBtn = document.getElementById("wombat-activate-btn");
    if (activateBtn) {
      activateBtn.addEventListener("click", toggleActivation);
    }

    // Attach refresh handler
    const refreshBtn = document.getElementById("wombat-refresh-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", handleRefreshTopology);
    }

    // Attach info modal handler
    const infoBtn = document.getElementById("wombat-info-btn");
    if (infoBtn) {
      infoBtn.addEventListener("click", showInfoModal);
    }

    // Attach fullscreen handler
    const fullscreenBtn = document.getElementById("wombat-fullscreen-btn");
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener("click", toggleFullscreen);
    }

    // Inject feedback console into section header (following S18 pattern)
    createFeedbackConsole();
  }

  function createFeedbackConsole() {
    const feedbackConsole = document.createElement("span");
    feedbackConsole.id = "s19-feedback-console";

    const sectionHeader = document.querySelector("#wombat .section-header");
    if (
      sectionHeader &&
      !sectionHeader.querySelector("#s19-feedback-console")
    ) {
      sectionHeader.appendChild(feedbackConsole);
      console.log("[WOMBAT] Feedback console injected into section header");
    }
  }

  function showFeedback(message, duration = 10000) {  //unless new message comes in then over-write
    const console = document.getElementById("s19-feedback-console");
    if (!console) return;

    console.textContent = message;
    console.style.opacity = "1";

    setTimeout(() => {
      console.style.transition = "opacity 1s";
      console.style.opacity = "0";
      setTimeout(() => {
        console.textContent = "";
        console.style.opacity = "1";
        console.style.transition = "";
      }, 1000);
    }, duration);
  }

  function showInfoModal() {
    const backdrop = document.createElement("div");
    backdrop.className = "pc-modal-backdrop";

    const modal = document.createElement("div");
    modal.className = "pc-modal-dialog";
    modal.style.maxWidth = "600px";

    const header = document.createElement("h5");
    header.textContent = "💡 What is WOMBAT?";
    header.className = "pc-modal-header";
    header.style.color = "#007bff";

    const content = document.createElement("div");
    content.innerHTML = `
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6;">
        WOMBAT shows how <strong>OBJECTIVE "sees" your building</strong> based on thermal areas you entered.
        This is NOT a 3D architectural model - it's a <strong>thermal topology</strong> where areas drive form. Why Wombat? Because Wombats poop little cubes, and that's what this section does with your geometry!
      </p>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8;">
        <li><strong>Volume is sacred:</strong> Section12's volume parameter is always preserved exactly</li>
        <li><strong>Stories constrain height:</strong> Building height = volume ÷ (area ÷ stories)</li>
        <li><strong>Aspect ratio shapes footprint:</strong> 1.0 = square, 2.0 = 2:1 rectangle</li>
        <li><strong>Roof pitch emerges from roof area:</strong> Larger roof = steeper pitch, based on vector algebra and rational trigonometry</li>
        <li><strong>Walls deform to match area constraints:</strong> No validation errors</li>
        <li><strong>Below-grade geometry:</strong> Brown dashed lines = ground-facing (Ag), Blue/Red solid lines = air-facing (Ae)</li>
        <li><strong>Grade line at z=0:</strong> Shows separation between above and below grade. Dashed = hidden (below ground), Solid = visible (at grade)</li>
        <li style="color: #dc3545;"><strong>⚠ We know this 3D shape may look nothing like your building:</strong> Think of this like a graph, an abstract representation of the surface geometry OBJECTIVE uses for its calculations. Over time, these models will become more refined, but for now, we hope this gives you an idea of what OBJECTIVE is considering for its area calculations</li>
      </ul>
    `;

    const btnContainer = document.createElement("div");
    btnContainer.className = "pc-modal-actions";

    const closeBtn = document.createElement("button");
    closeBtn.className = "btn btn-primary";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", () => {
      document.body.removeChild(backdrop);
    });

    btnContainer.appendChild(closeBtn);

    modal.appendChild(header);
    modal.appendChild(content);
    modal.appendChild(btnContainer);

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Close on backdrop click
    backdrop.addEventListener("click", e => {
      if (e.target === backdrop) {
        document.body.removeChild(backdrop);
      }
    });
  }

  function handleRefreshTopology() {
    console.log("[WOMBAT] Refreshing topology from refresh button");

    // Sync values from StateManager before rendering
    syncFromStateManager();

    const mode = ModeManager?.currentMode || "target";
    updateVisualization(mode);
  }

  function toggleFullscreen() {
    const wombatSection = document.getElementById("wombat");
    const fullscreenBtn = document.getElementById("wombat-fullscreen-btn");

    if (!wombatSection || !fullscreenBtn) return;

    if (wombatSection.classList.contains("wombat-fullscreen")) {
      // Exit fullscreen
      wombatSection.classList.remove("wombat-fullscreen");
      fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen"></i>';
      fullscreenBtn.title = "Toggle Fullscreen";

      // Remove ESC key listener
      document.removeEventListener("keydown", handleFullscreenEscape);
    } else {
      // Enter fullscreen
      wombatSection.classList.add("wombat-fullscreen");
      fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
      fullscreenBtn.title = "Exit Fullscreen";

      // Add ESC key listener to exit fullscreen
      document.addEventListener("keydown", handleFullscreenEscape);
    }
  }

  function handleFullscreenEscape(event) {
    if (event.key === "Escape" || event.keyCode === 27) {
      const wombatSection = document.getElementById("wombat");
      if (
        wombatSection &&
        wombatSection.classList.contains("wombat-fullscreen")
      ) {
        toggleFullscreen();
      }
    }
  }

  /**
   * Sync S19 fields and state from StateManager (S12 values)
   * Call this on activation/refresh to ensure values are current after import
   */
  function syncFromStateManager() {
    console.log("[WOMBAT] Syncing values from StateManager...");

    // Read current values from StateManager (S12's d_105/d_103)
    const volumeFromS12 = window.TEUI.StateManager.getValue("d_105");
    const refVolumeFromS12 = window.TEUI.StateManager.getValue("ref_d_105");
    const storiesFromS12 = window.TEUI.StateManager.getValue("d_103");
    const refStoriesFromS12 = window.TEUI.StateManager.getValue("ref_d_103");

    // Update Target state
    if (volumeFromS12) {
      const currentValue = TargetState.getValue("d_151");
      if (currentValue !== volumeFromS12) {
        TargetState.setValue("d_151", volumeFromS12);
        console.log(
          `[WOMBAT] Synced d_151 = ${volumeFromS12} from StateManager (d_105)`
        );

        // Update DOM field
        const volumeField = document.querySelector(
          '#wombat [data-field-id="d_151"]'
        );
        if (volumeField) {
          volumeField.textContent = window.TEUI.formatNumber(
            window.TEUI.parseNumeric(volumeFromS12),
            "number-2dp"
          );
        }
      }
    }

    if (storiesFromS12) {
      const currentValue = TargetState.getValue("d_150");
      if (currentValue !== storiesFromS12) {
        TargetState.setValue("d_150", storiesFromS12);
        console.log(
          `[WOMBAT] Synced d_150 = ${storiesFromS12} from StateManager (d_103)`
        );

        // Update DOM dropdown
        const storiesDropdown = document.querySelector(
          '#wombat [data-field-id="d_150"]'
        );
        if (storiesDropdown) {
          storiesDropdown.textContent = storiesFromS12;
        }
      }
    }

    // Update Reference state
    if (refVolumeFromS12) {
      const currentValue = ReferenceState.getValue("d_151");
      if (currentValue !== refVolumeFromS12) {
        ReferenceState.setValue("d_151", refVolumeFromS12);
        console.log(
          `[WOMBAT] Synced ref_d_151 = ${refVolumeFromS12} from StateManager (ref_d_105)`
        );

        // Update DOM field if Reference mode is active
        if (ModeManager?.currentMode === "reference") {
          const volumeField = document.querySelector(
            '#wombat [data-field-id="d_151"]'
          );
          if (volumeField) {
            volumeField.textContent = window.TEUI.formatNumber(
              window.TEUI.parseNumeric(refVolumeFromS12),
              "number-2dp"
            );
          }
        }
      }
    }

    if (refStoriesFromS12) {
      const currentValue = ReferenceState.getValue("d_150");
      if (currentValue !== refStoriesFromS12) {
        ReferenceState.setValue("d_150", refStoriesFromS12);
        console.log(
          `[WOMBAT] Synced ref_d_150 = ${refStoriesFromS12} from StateManager (ref_d_103)`
        );

        // Update DOM dropdown if Reference mode is active
        if (ModeManager?.currentMode === "reference") {
          const storiesDropdown = document.querySelector(
            '#wombat [data-field-id="d_150"]'
          );
          if (storiesDropdown) {
            storiesDropdown.textContent = refStoriesFromS12;
          }
        }
      }
    }
  }

  function toggleActivation() {
    const activateBtn = document.getElementById("wombat-activate-btn");
    const refreshBtn = document.getElementById("wombat-refresh-btn");
    const fullscreenBtn = document.getElementById("wombat-fullscreen-btn");

    if (!isActivated) {
      // First activation only
      isActivated = true;

      // Change button style to match S18 (outlined, not solid)
      activateBtn.classList.remove("btn-primary");
      activateBtn.classList.add("btn-outline-secondary");
      activateBtn.innerHTML =
        '<i class="bi bi-arrow-repeat"></i> Refresh Topology';

      // Enable refresh and fullscreen buttons
      if (refreshBtn) refreshBtn.disabled = false;
      if (fullscreenBtn) fullscreenBtn.disabled = false;

      console.log("[WOMBAT] Topology view activated");
    } else {
      // Already activated - this is a refresh
      console.log("[WOMBAT] Refreshing topology");
    }

    // Sync values from StateManager before rendering (handles post-import scenarios)
    syncFromStateManager();

    const mode = ModeManager?.currentMode || "target";
    updateVisualization(mode);
  }

  //==========================================================================
  // EVENT HANDLERS
  //==========================================================================

  function setupFieldListeners() {
    const sectionElement = document.getElementById("wombat");
    if (!sectionElement) {
      console.warn(
        "[WOMBAT] setupFieldListeners: Section element #wombat not found"
      );
      return;
    }

    // ⚠️ CRITICAL: WOMBAT owns d_151 and d_150 - must publish to StateManager on user edit
    // Per 4012-CHEATSHEET Anti-Pattern 6: Only listen to OWN input fields via DOM

    // ✅ ARCHITECTURAL COMPLIANCE: d_150 dropdown handled by FieldManager
    // FieldManager already has change listener that calls routeToSectionModeManager()
    // which routes through ModeManager.setValue() and calls calculateAll()
    // No custom listener needed (removed non-standard double listener)

    // ✅ STEP 3: d_151 volume field now uses standard "editable" type
    // Add blur and keydown handlers (matches S12 pattern for editable fields)
    const volumeField = sectionElement.querySelector('[data-field-id="d_151"]');
    if (volumeField && !volumeField.hasWombatListeners) {
      // Blur handler: Parse, format, and publish value (matches S12 handleFieldBlur)
      volumeField.addEventListener("blur", function (event) {
        const field = event.target;
        const fieldId = field.getAttribute("data-field-id");
        if (!fieldId) return;

        const numValue = window.TEUI.parseNumeric(field.textContent);
        if (!isNaN(numValue) && isFinite(numValue)) {
          const formattedValue = window.TEUI.formatNumber(
            numValue,
            "number-2dp"
          );
          field.textContent = formattedValue;

          // MODE-AWARE: Use ModeManager.setValue for dual-state publishing
          ModeManager.setValue(fieldId, String(numValue), "user-modified");
          if (isActivated) {
            calculateAll();
          }
        }
      });

      // Keydown handler: Prevent newlines on Enter (matches S12 handleFieldKeydown)
      volumeField.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          this.blur();
        }
      });

      volumeField.hasWombatListeners = true;
    }
  }

  function initializeEventHandlers() {
    console.log("[WOMBAT] Initializing event handlers");

    // Setup field blur handlers for WOMBAT's own input fields (d_151, d_150)
    // Per 4012-CHEATSHEET: Sections ONLY listen to their OWN input fields via DOM
    setupFieldListeners();

    // Aspect ratio slider
    const aspectSlider = document.querySelector(
      '[data-field-id="d_154"] input[type="range"]'
    );
    if (aspectSlider && !aspectSlider.hasSliderListener) {
      aspectSlider.addEventListener("input", e => {
        const rawValue = parseFloat(e.target.value);
        const displaySpan = document.querySelector(
          'span[data-display-for="d_154"]'
        );
        if (displaySpan) {
          // Convert slider value to aspect ratio display
          if (rawValue === 0) {
            displaySpan.textContent = "1:1 (square)";
          } else if (rawValue > 0) {
            // Landscape: +1 = 2:1, +2 = 3:1, etc.
            displaySpan.textContent = `${(1 + rawValue).toFixed(1)}:1 (landscape)`;
          } else {
            // Portrait: -1 = 1:2, -2 = 1:3, etc.
            displaySpan.textContent = `1:${(1 - rawValue).toFixed(1)} (portrait)`;
          }
        }
      });

      aspectSlider.addEventListener("change", e => {
        const value = e.target.value;
        console.log(`[WOMBAT] Aspect ratio slider changed: d_154 = ${value}`);

        // MODE-AWARE: Use ModeManager.setValue for dual-state publishing
        ModeManager.setValue("d_154", value, "user-modified");

        // Recalculate geometry with new aspect ratio (runs dual-engine + updates viz)
        calculateAll();
      });

      aspectSlider.hasSliderListener = true;
    }

    // Listen to geometry changes from other sections (external dependencies)
    // Per 4012-CHEATSHEET Anti-Pattern 7: Only listen to EXTERNAL dependencies
    if (window.TEUI?.StateManager) {
      const geometryFields = ["d_85", "d_86", "d_106"];
      geometryFields.forEach(fieldId => {
        window.TEUI.StateManager.addListener(fieldId, () => {
          if (isActivated) {
            console.log(
              `[WOMBAT] Geometry field ${fieldId} changed, recalculating`
            );
            calculateAll(); // Will update visualization with correct mode
          }
        });

        // Also listen to Reference versions for mode-aware visualization
        const refFieldId = `ref_${fieldId}`;
        window.TEUI.StateManager.addListener(refFieldId, () => {
          if (isActivated) {
            console.log(
              `[WOMBAT] Reference field ${refFieldId} changed, recalculating`
            );
            calculateAll(); // Will update visualization with correct mode
          }
        });
      });

      // ⚠️ MIRROR FIELD SYNC: Section 12 → WOMBAT (d_105→d_151, d_103→d_150)
      // When S12 volume/stories change, sync to WOMBAT mirror fields AND recalculate
      // NOTE: NO DOM updates here - FieldManager handles routing to correct state
      window.TEUI.StateManager.addListener("d_105", newValue => {
        const currentValue = TargetState.getValue("d_151");
        console.log(
          `[WOMBAT SYNC] d_105 changed: ${currentValue} → ${newValue}`
        );
        if (currentValue !== newValue) {
          // Update TargetState only - NO re-publication to break circular loop
          TargetState.setValue("d_151", newValue);
          console.log(
            `[WOMBAT] ✅ Synced d_151 = ${newValue} from S12 (d_105)`
          );
          // Recalculate (will run both engines and update visualization)
          calculateAll();
        }
      });

      window.TEUI.StateManager.addListener("ref_d_105", newValue => {
        const currentValue = ReferenceState.getValue("d_151");
        console.log(
          `[WOMBAT SYNC] ref_d_105 changed: ${currentValue} → ${newValue}`
        );
        if (currentValue !== newValue) {
          // Update ReferenceState
          ReferenceState.setValue("d_151", newValue);
          console.log(
            `[WOMBAT] ✅ Synced ref_d_151 = ${newValue} from S12 (ref_d_105)`
          );
          // Recalculate (will run both engines and update visualization)
          calculateAll();
        }
      });

      window.TEUI.StateManager.addListener("d_103", newValue => {
        const currentValue = TargetState.getValue("d_150");
        console.log(
          `[WOMBAT SYNC] d_103 changed: ${currentValue} → ${newValue}`
        );
        if (currentValue !== newValue) {
          // Update TargetState only - NO re-publication to break circular loop
          TargetState.setValue("d_150", newValue);
          console.log(
            `[WOMBAT] ✅ Synced d_150 = ${newValue} from S12 (d_103)`
          );
          // Recalculate (will run both engines and update visualization)
          calculateAll();
        }
      });

      window.TEUI.StateManager.addListener("ref_d_103", newValue => {
        const currentValue = ReferenceState.getValue("d_150");
        console.log(
          `[WOMBAT SYNC] ref_d_103 changed: ${currentValue} → ${newValue}`
        );
        if (currentValue !== newValue) {
          // Update ReferenceState
          ReferenceState.setValue("d_150", newValue);
          console.log(
            `[WOMBAT] ✅ Synced ref_d_150 = ${newValue} from S12 (ref_d_103)`
          );
          // Recalculate (will run both engines and update visualization)
          calculateAll();
        }
      });

      // ✅ NEW (2025-12-18): Listen for g_106 (Typical F2F Height) from S12 - TARGET mode
      // Ensures both engines recalculate when Target value changes (dual-engine architecture)
      window.TEUI.StateManager.addListener("g_106", newValue => {
        console.log(`[WOMBAT SYNC] g_106 changed to: ${newValue}`);
        console.log(
          `[WOMBAT SYNC] Triggering calculateAll() for Target geometry recalculation...`
        );
        // No state to sync (g_106 is read directly via getModeAwareValue in solveGeometry)
        // But we need to recalculate both engines when this value changes
        calculateAll();
      });

      // ✅ NEW (2025-12-18): Listen for ref_g_106 (Typical F2F Height) from S12 - REFERENCE mode
      // Ensures both engines recalculate when Reference value changes (dual-engine architecture)
      window.TEUI.StateManager.addListener("ref_g_106", newValue => {
        console.log(`[WOMBAT SYNC] ref_g_106 changed to: ${newValue}`);
        console.log(
          `[WOMBAT SYNC] Triggering calculateAll() for Reference geometry recalculation...`
        );
        // No state to sync (g_106 is read directly via getModeAwareValue in solveGeometry)
        // But we need to recalculate both engines when this value changes
        calculateAll();
      });

      // ✅ CRITICAL: Check if ref_g_106 was already published before listener was added
      // Section12 publishes during initialization, but Section19 listeners are added later
      // This ensures we don't miss the initial value (same pattern as d_105/d_103)
      const existingRefG106 = window.TEUI.StateManager.getValue("ref_g_106");
      if (existingRefG106 !== null && existingRefG106 !== undefined) {
        console.log(
          `[WOMBAT SYNC] Found existing ref_g_106 = ${existingRefG106} in StateManager`
        );
        console.log(
          `[WOMBAT SYNC] Triggering initial calculateAll() for Reference pre-calculation`
        );
        calculateAll();
      }

      // ✅ ROBOT FINGERS 🤖👆: Ae and Ag display fields from S12
      // S12 publishes d_101/g_101/d_102/g_102 to StateManager
      // S19 listens and updates its own DOM elements (scoped to #wombat container)

      const wombatContainer = document.getElementById("wombat");

      // Area Exposed to Air (Ae) - Target mode
      window.TEUI.StateManager.addListener("d_101", newValue => {
        if (!wombatContainer) return;
        const element = wombatContainer.querySelector(
          '[data-field-id="d_152"]'
        );
        if (element && newValue !== null && newValue !== undefined) {
          element.textContent = window.TEUI.formatNumber(
            window.TEUI.parseNumeric(newValue),
            "number-2dp-comma"
          );
        }
      });

      window.TEUI.StateManager.addListener("g_101", newValue => {
        if (!wombatContainer) return;
        const element = wombatContainer.querySelector(
          '[data-field-id="g_152"]'
        );
        if (element && newValue !== null && newValue !== undefined) {
          element.textContent = window.TEUI.formatNumber(
            window.TEUI.parseNumeric(newValue),
            "number-3dp"
          );
        }
      });

      // Area Exposed to Air (Ae) - Reference mode
      window.TEUI.StateManager.addListener("ref_d_101", newValue => {
        if (!wombatContainer) return;
        const element = wombatContainer.querySelector(
          '[data-field-id="d_152"]'
        );
        if (
          element &&
          newValue !== null &&
          newValue !== undefined &&
          window.TEUI.ReferenceToggle?.isReferenceMode()
        ) {
          element.textContent = window.TEUI.formatNumber(
            window.TEUI.parseNumeric(newValue),
            "number-2dp-comma"
          );
        }
      });

      window.TEUI.StateManager.addListener("ref_g_101", newValue => {
        if (!wombatContainer) return;
        const element = wombatContainer.querySelector(
          '[data-field-id="g_152"]'
        );
        if (
          element &&
          newValue !== null &&
          newValue !== undefined &&
          window.TEUI.ReferenceToggle?.isReferenceMode()
        ) {
          element.textContent = window.TEUI.formatNumber(
            window.TEUI.parseNumeric(newValue),
            "number-3dp"
          );
        }
      });

      // Area Exposed to Ground (Ag) - Target mode
      window.TEUI.StateManager.addListener("d_102", newValue => {
        if (!wombatContainer) return;
        const element = wombatContainer.querySelector(
          '[data-field-id="d_153"]'
        );
        if (element && newValue !== null && newValue !== undefined) {
          element.textContent = window.TEUI.formatNumber(
            window.TEUI.parseNumeric(newValue),
            "number-2dp-comma"
          );
        }
      });

      window.TEUI.StateManager.addListener("g_102", newValue => {
        if (!wombatContainer) return;
        const element = wombatContainer.querySelector(
          '[data-field-id="g_153"]'
        );
        if (element && newValue !== null && newValue !== undefined) {
          element.textContent = window.TEUI.formatNumber(
            window.TEUI.parseNumeric(newValue),
            "number-3dp"
          );
        }
      });

      // Area Exposed to Ground (Ag) - Reference mode
      window.TEUI.StateManager.addListener("ref_d_102", newValue => {
        if (!wombatContainer) return;
        const element = wombatContainer.querySelector(
          '[data-field-id="d_153"]'
        );
        if (
          element &&
          newValue !== null &&
          newValue !== undefined &&
          window.TEUI.ReferenceToggle?.isReferenceMode()
        ) {
          element.textContent = window.TEUI.formatNumber(
            window.TEUI.parseNumeric(newValue),
            "number-2dp-comma"
          );
        }
      });

      window.TEUI.StateManager.addListener("ref_g_102", newValue => {
        if (!wombatContainer) return;
        const element = wombatContainer.querySelector(
          '[data-field-id="g_153"]'
        );
        if (
          element &&
          newValue !== null &&
          newValue !== undefined &&
          window.TEUI.ReferenceToggle?.isReferenceMode()
        ) {
          element.textContent = window.TEUI.formatNumber(
            window.TEUI.parseNumeric(newValue),
            "number-3dp"
          );
        }
      });
    }
  }

  //==========================================================================
  // LIFECYCLE
  //==========================================================================

  function onSectionRendered() {
    console.log("[WOMBAT] Section 19 rendered");

    // Initialize mirror fields from S12 on first load
    initializeMirrorFields();

    // ✅ CRITICAL: Initialize event handlers (listeners for S12 dependencies)
    // This registers listeners for d_105/ref_d_105, d_103/ref_d_103, g_106/ref_g_106
    initializeEventHandlers();

    // Initialize SVG
    setTimeout(() => {
      initializeSVG();
      createActivationControls();
    }, 100);
  }

  function initializeMirrorFields() {
    // ⚠️ CRITICAL: Initialize WOMBAT mirror fields from S12 on section load
    // This ensures d_151/d_150 are synced with d_105/d_103 from the start
    if (window.TEUI?.StateManager) {
      const d_105 = window.TEUI.StateManager.getValue("d_105");
      const d_103 = window.TEUI.StateManager.getValue("d_103");
      const ref_d_105 = window.TEUI.StateManager.getValue("ref_d_105");
      const ref_d_103 = window.TEUI.StateManager.getValue("ref_d_103");

      if (d_105) {
        window.TEUI.StateManager.setValue("d_151", d_105, "initial");
        console.log(`[WOMBAT] Initialized d_151 = ${d_105} from S12 (d_105)`);
      }

      if (d_103) {
        window.TEUI.StateManager.setValue("d_150", d_103, "initial");
        console.log(`[WOMBAT] Initialized d_150 = ${d_103} from S12 (d_103)`);
      }

      if (ref_d_105) {
        window.TEUI.StateManager.setValue("ref_d_151", ref_d_105, "initial");
        console.log(
          `[WOMBAT] Initialized ref_d_151 = ${ref_d_105} from S12 (ref_d_105)`
        );
      }

      if (ref_d_103) {
        window.TEUI.StateManager.setValue("ref_d_150", ref_d_103, "initial");
        console.log(
          `[WOMBAT] Initialized ref_d_150 = ${ref_d_103} from S12 (ref_d_103)`
        );
      }

      // ✅ NO INITIALIZATION for Ae/Ag display fields
      // Field definitions have defaults - FieldManager renders initial values
      // Robot fingers listeners handle live updates when S12 recalculates
    }
  }

  /**
   * DUAL-ENGINE CALCULATIONS
   * Per Pattern A architecture: ALWAYS run both Target and Reference calculations
   */

  function calculateTargetModel() {
    const geometry = solveGeometry(false); // isReferenceCalculation = false

    // Update TargetState (for refreshUI to read)
    TargetState.setValue("h_157", geometry.footprint.length.toFixed(2));
    TargetState.setValue("h_155", geometry.footprint.width.toFixed(2));
    TargetState.setValue("h_156", geometry.storyHeight.toFixed(2));

    // Publish calculated dimensions to StateManager (unprefixed for Target)
    window.TEUI.StateManager.setValue(
      "h_157",
      geometry.footprint.length.toFixed(2),
      "calculated"
    );
    window.TEUI.StateManager.setValue(
      "h_155",
      geometry.footprint.width.toFixed(2),
      "calculated"
    );
    window.TEUI.StateManager.setValue(
      "h_156",
      geometry.storyHeight.toFixed(2),
      "calculated"
    );

    return geometry;
  }

  function calculateReferenceModel() {
    const geometry = solveGeometry(true); // isReferenceCalculation = true

    // Update ReferenceState (for refreshUI to read)
    ReferenceState.setValue("h_157", geometry.footprint.length.toFixed(2));
    ReferenceState.setValue("h_155", geometry.footprint.width.toFixed(2));
    ReferenceState.setValue("h_156", geometry.storyHeight.toFixed(2));

    // Publish calculated dimensions to StateManager (ref_ prefixed for Reference)
    window.TEUI.StateManager.setValue(
      "ref_h_157",
      geometry.footprint.length.toFixed(2),
      "calculated"
    );
    window.TEUI.StateManager.setValue(
      "ref_h_155",
      geometry.footprint.width.toFixed(2),
      "calculated"
    );
    window.TEUI.StateManager.setValue(
      "ref_h_156",
      geometry.storyHeight.toFixed(2),
      "calculated"
    );

    return geometry;
  }

  function calculateAll() {
    console.log(
      `[WOMBAT calculateAll] Called - Current mode: ${ModeManager.currentMode}, isActivated: ${isActivated}`
    );

    // DUAL-ENGINE: ALWAYS run both Target and Reference calculations
    const targetGeometry = calculateTargetModel();
    const referenceGeometry = calculateReferenceModel();

    // Update visualization ONLY if activated
    if (isActivated) {
      // Show visualization for current mode
      const mode = ModeManager?.currentMode || "target";
      console.log(
        `[WOMBAT calculateAll] Updating visualization for mode: ${mode}`
      );
      updateVisualization(mode);
    }

    // Update calculated display values in DOM for current mode
    console.log(
      `[WOMBAT calculateAll] Calling updateCalculatedDisplayValues()`
    );
    ModeManager.updateCalculatedDisplayValues();
    console.log(`[WOMBAT calculateAll] Complete`);
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    getFields,
    getDropdownOptions,
    getLayout,
    initializeEventHandlers,
    onSectionRendered,
    calculateAll,

    // WOMBAT-specific exports
    solveGeometry,
    isActivated: () => isActivated,
    getCurrentModel: () => currentModel,
    showFeedback, // Feedback console (S18 pattern)

    // Dual-state architecture exports (required by FieldManager and ReferenceToggle)
    ModeManager,
    TargetState,
    ReferenceState,
  };
})();

// Global namespace exposure
document.addEventListener("DOMContentLoaded", function () {
  const module = window.TEUI.SectionModules.sect19;
  if (module) {
    window.TEUI.sect19 = {
      calculateAll: module.calculateAll,
      solveGeometry: module.solveGeometry,
      ModeManager: module.ModeManager,
      modeManager: module.ModeManager, // Alias for ReferenceToggle (lowercase)
      TargetState: module.TargetState,
      ReferenceState: module.ReferenceState,
    };
  }
});
