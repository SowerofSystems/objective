/**
 * pcConfig.js
 * Configuration for Section 18 Parallel Coordinates Optimization Visualization
 *
 * This file defines the 14 axes used in the parallel coordinates graph,
 * including field mappings, conditional logic, and display properties.
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};

/**
 * OPTIMIZATION_AXES Configuration
 *
 * Each axis represents a key building performance parameter with:
 * - Field mappings for Target and Reference modes
 * - Conditional field selection (for fuel-dependent parameters)
 * - Multipliers for unit conversion (e.g., AFUE/COP to percentages)
 * - Display properties (label, unit, optimal direction)
 *
 * SPECIAL CASES:
 * - Axes 1 (SHW%) and 9 (HEAT%): Require conditional field selection based on fuel type
 * - Axes 13 (GHGI) and 14 (TEUI): Use non-standard field naming (no ref_ prefix)
 */
window.TEUI.OPTIMIZATION_AXES = [
  {
    id: "shw_efficiency",
    label: "SHW%",
    unit: "%",
    description: "Service Hot Water efficiency",
    optimal: "higher",

    // Target mode fields
    targetField: "d_52",                 // Electric/Heatpump path (already %)
    targetFieldAlt: "k_52",              // Oil/Gas AFUE path
    targetFieldMultiplier: null,         // d_52 already in %
    targetFieldAltMultiplier: 100,       // k_52 * 100 to convert AFUE to %
    targetFieldSelector: "d_51",         // Heating fuel type selector

    // Reference mode fields
    referenceField: "ref_d_52",
    referenceFieldAlt: "ref_k_52",
    referenceFieldMultiplier: null,
    referenceFieldAltMultiplier: 100,
    referenceFieldSelector: "ref_d_51",

    // Domain will be determined during data analysis
    domain: [0, 100],
  },

  {
    id: "dwhr_efficiency",
    label: "DWHR%",
    unit: "%",
    description: "Drain Water Heat Recovery efficiency",
    optimal: "higher",

    targetField: "d_53",
    referenceField: "ref_d_53",

    domain: [0, 80],  // Few systems exceed 75% efficiency
  },

  {
    id: "net_gains",
    label: "nGains%",
    unit: "%",
    description: "Net useable internal gains utilization",
    optimal: "higher",

    // ⚠️ DISCRETE DROPDOWN PATTERN: nGains% uses dropdown (d_80), not slider
    // Display value comes from calculated field (g_80)
    targetField: "g_80",
    targetFieldMultiplier: 100,      // g_80 is stored as decimal (0.40), display as % (40)
    referenceField: "ref_g_80",
    referenceFieldMultiplier: 100,   // ref_g_80 is stored as decimal, display as %

    // Additional fields for dropdown control (not used for display, but needed for editing)
    targetDropdownField: "d_80",     // Dropdown field that controls method
    referenceDropdownField: "ref_d_80",

    domain: [0, 100],  // Always 0-100%, never more, never less
  },

  {
    id: "thermal_bridge",
    label: "TB%",
    unit: "%",
    description: "Thermal bridging penalty",
    optimal: "lower",

    targetField: "d_97",
    referenceField: "ref_d_97",

    domain: [0, 100],
  },

  {
    id: "aggregate_ground_uvalue",
    label: "Ag",
    unit: "W/m²K",
    description: "Aggregate U-value for all elements facing ground",
    optimal: "lower",

    targetField: "g_102",
    referenceField: "ref_g_102",

    domain: [0, 1.0],  // Typical range for U-values
  },

  {
    id: "aggregate_air_uvalue",
    label: "Ae",
    unit: "W/m²K",
    description: "Aggregate U-value for all elements facing air",
    optimal: "lower",

    targetField: "g_101",
    referenceField: "ref_g_101",

    domain: [0, 1.0],  // Typical range for U-values
  },

  {
    id: "ach50",
    label: "ACH50",
    unit: "",  // No unit needed - label already says ACH50
    description: "Air Changes per Hour at 50Pa (airtightness)",
    optimal: "lower",

    targetField: "d_109",
    referenceField: "ref_d_109",

    domain: [0, 10.0],  // 0.10 (super tight) to 10.0 (very leaky)
  },

  {
    id: "window_wall_ratio",
    label: "WWR",
    unit: "%",
    description: "Window-to-wall ratio (affects gains vs losses)",
    optimal: "balanced",

    targetField: "d_107",
    targetFieldMultiplier: 100,      // d_107 is stored as decimal (0.33), display as % (33)
    referenceField: "ref_d_107",
    referenceFieldMultiplier: 100,   // ref_d_107 is stored as decimal, display as %

    domain: [0, 100],
  },

  {
    id: "heating_efficiency",
    label: "HEAT%",
    unit: "%",
    description: "Unified heating system efficiency",
    optimal: "higher",

    // Target mode fields
    targetField: "h_113",                // Heatpump/Electric COP path
    targetFieldMultiplier: 100,          // h_113 * 100 (COP 3.0 → 300%, Electric 1.0 → 100%)
    targetFieldAlt: "j_115",             // Oil/Gas AFUE path
    targetFieldAltMultiplier: 100,       // j_115 * 100 (AFUE 0.90 → 90%)
    targetFieldSelector: "d_113",        // Heating system type selector

    // Reference mode fields
    referenceField: "ref_h_113",
    referenceFieldMultiplier: 100,
    referenceFieldAlt: "ref_j_115",
    referenceFieldAltMultiplier: 100,
    referenceFieldSelector: "ref_d_113",

    domain: [0, 586],  // 0% to 586% (gives visual space for 50-100% AFUE range and full heatpump COP range)
  },

  {
    id: "mvhr_efficiency",
    label: "MVHR%",
    unit: "%",
    description: "Mechanical Ventilation Heat Recovery efficiency",
    optimal: "higher",

    targetField: "d_118",            // d_118 stores as percentage (89 means 89%)
    referenceField: "ref_d_118",     // ref_d_118 stores as percentage

    domain: [0, 100],
  },

  {
    id: "tedi",
    label: "TEDI",
    unit: "kWh/m²·yr",
    description: "Thermal Energy Demand Intensity (per m² area)",
    optimal: "lower",

    targetField: "h_127",
    referenceField: "ref_h_127",

    domain: [0, 200],  // Typical range, will be refined
  },

  {
    id: "teli",
    label: "TELI",
    unit: "kWh/m²·yr",
    description: "Thermal Envelope Loss Intensity (per m² area)",
    optimal: "lower",

    targetField: "h_131",
    referenceField: "ref_h_131",

    domain: [0, 200],  // Typical range, will be refined
  },

  {
    id: "ghgi",
    label: "GHGI",
    unit: "kgCO2e/m²·yr",
    description: "Greenhouse Gas Intensity",
    optimal: "lower",

    // ⚠️ SPECIAL: These fields do NOT use the ref_ prefix pattern
    targetField: "h_8",      // NOT d_8
    referenceField: "e_8",   // NOT ref_e_8

    domain: [0, 100],  // Typical range, will be refined
  },

  {
    id: "teui",
    label: "TEUI",
    unit: "kWh/m²·yr",
    description: "Total Energy Use Intensity",
    optimal: "lower",

    // ⚠️ SPECIAL: These fields do NOT use the ref_ prefix pattern
    targetField: "h_10",     // NOT d_10
    referenceField: "e_10",  // NOT ref_e_10

    domain: [0, 300],  // Typical range, will be refined
  },
];

/**
 * Helper function to get the correct field value based on conditional logic
 *
 * @param {object} axis - Axis configuration from OPTIMIZATION_AXES
 * @param {string} mode - "target" or "reference"
 * @returns {number|null} - Field value with multiplier applied, or null if unavailable
 */
window.TEUI.getAxisValue = function(axis, mode = "target") {
  const stateManager = window.TEUI.StateManager;
  if (!stateManager) {
    console.warn("[ppConfig] StateManager not available");
    return null;
  }

  // Determine which field set to use based on mode
  const primaryField = mode === "target" ? axis.targetField : axis.referenceField;
  const altField = mode === "target" ? axis.targetFieldAlt : axis.referenceFieldAlt;
  const selectorField = mode === "target" ? axis.targetFieldSelector : axis.referenceFieldSelector;
  const primaryMultiplier = mode === "target" ? axis.targetFieldMultiplier : axis.referenceFieldMultiplier;
  const altMultiplier = mode === "target" ? axis.targetFieldAltMultiplier : axis.referenceFieldAltMultiplier;

  // Handle conditional fields (SHW%, HEAT%)
  if (selectorField && altField) {
    const selectorValue = stateManager.getValue(selectorField);

    // Determine which field to use based on selector value
    let fieldToUse = primaryField;
    let multiplierToUse = primaryMultiplier;

    // For SHW% (d_51): If Oil/Gas, use altField (k_52)
    if (axis.id === "shw_efficiency") {
      if (selectorValue === "Oil" || selectorValue === "Gas") {
        fieldToUse = altField;
        multiplierToUse = altMultiplier;
      }
    }

    // For HEAT% (d_113): If Oil/Gas, use altField (j_115)
    if (axis.id === "heating_efficiency") {
      if (selectorValue === "Oil" || selectorValue === "Gas") {
        fieldToUse = altField;
        multiplierToUse = altMultiplier;
      }
    }

    const rawValue = stateManager.getValue(fieldToUse);
    const numValue = parseFloat(rawValue);

    if (typeof numValue === "number" && !isNaN(numValue)) {
      // Apply multiplier if specified
      return multiplierToUse ? numValue * multiplierToUse : numValue;
    }

    return null;
  }

  // Handle standard fields (no conditional logic)
  const rawValue = stateManager.getValue(primaryField);
  const numValue = parseFloat(rawValue);

  if (typeof numValue === "number" && !isNaN(numValue)) {
    // Apply multiplier if specified (e.g., HEAT% for electric/heatpump)
    return primaryMultiplier ? numValue * primaryMultiplier : numValue;
  }

  return null;
};

/**
 * Helper function to get both Target and Reference values for an axis
 *
 * @param {object} axis - Axis configuration from OPTIMIZATION_AXES
 * @returns {object} - { target: number|null, reference: number|null }
 */
window.TEUI.getAxisValuesForBothModes = function(axis) {
  return {
    target: window.TEUI.getAxisValue(axis, "target"),
    reference: window.TEUI.getAxisValue(axis, "reference"),
  };
};

/**
 * Get all data points for parallel coordinates rendering
 * Returns arrays of values for Target and Reference lines
 *
 * @returns {object} - { targetData: number[], referenceData: number[], axes: object[] }
 */
window.TEUI.getParallelCoordinatesData = function() {
  const targetData = [];
  const referenceData = [];
  const axes = [];

  window.TEUI.OPTIMIZATION_AXES.forEach(axis => {
    const values = window.TEUI.getAxisValuesForBothModes(axis);

    // Only include axes where both values are available
    if (values.target !== null && values.reference !== null) {
      targetData.push(values.target);
      referenceData.push(values.reference);
      axes.push(axis);
    } else {
      console.warn(`[ppConfig] Missing data for axis: ${axis.label}`);
    }
  });

  return {
    targetData,
    referenceData,
    axes,
  };
};

console.log("[ppConfig] Configuration loaded with", window.TEUI.OPTIMIZATION_AXES.length, "axes");
