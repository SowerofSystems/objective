/**
 * EmissionsNodes.js - CO2e Emissions Calculations (S04/S05)
 *
 * Energy emissions from fuel consumption and lifetime carbon:
 * - Row 32 subtotals (g_32, k_32)
 * - Annual emissions intensity
 * - Lifetime embodied carbon
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  // Emission factors (kg CO2e per unit) - Ontario defaults
  const EMISSION_FACTORS = {
    electricity: 0.028,  // kg CO2e/kWh (Ontario grid)
    gas: 1.888,          // kg CO2e/m³
    propane: 1.51,       // kg CO2e/L
    oil: 2.725,          // kg CO2e/L
    wood: 0.0,           // Carbon neutral (offset handled separately)
  };

  function parseNum(value, defaultVal = 0) {
    if (value === null || value === undefined || value === "N/A") return defaultVal;
    const num = parseFloat(String(value).replace(/,/g, ""));
    return isNaN(num) ? defaultVal : num;
  }

  function register(graph) {
    // ========================================================================
    // INPUTS - Fuel consumption from each source
    // ========================================================================
    const inputs = [
      // Energy consumption by fuel type
      { id: "energy.electricity.consumption", legacyId: "f_27", section: "S04", classification: "C", label: "Electricity Consumption (kWh/yr)", defaultValue: 0 },
      { id: "energy.gas.consumption", legacyId: "f_28", section: "S04", classification: "C", label: "Gas Consumption (m³/yr)", defaultValue: 0 },
      { id: "energy.propane.consumption", legacyId: "f_29", section: "S04", classification: "C", label: "Propane Consumption (L/yr)", defaultValue: 0 },
      { id: "energy.oil.consumption", legacyId: "f_30", section: "S04", classification: "C", label: "Oil Consumption (L/yr)", defaultValue: 0 },
      { id: "energy.wood.consumption", legacyId: "f_31", section: "S04", classification: "C", label: "Wood Consumption (kg/yr)", defaultValue: 0 },

      // Target energy (from S15)
      { id: "energy.target.electricity", legacyId: "j_27", section: "S04", classification: "C", label: "Target Electricity (kWh/yr)", defaultValue: 0 },
      { id: "energy.target.gas", legacyId: "j_28", section: "S04", classification: "C", label: "Target Gas (kWh)", defaultValue: 0 },
      { id: "energy.target.propane", legacyId: "j_29", section: "S04", classification: "C", label: "Target Propane (kWh)", defaultValue: 0 },
      { id: "energy.target.oil", legacyId: "j_30", section: "S04", classification: "C", label: "Target Oil (kWh)", defaultValue: 0 },
      { id: "energy.target.wood", legacyId: "j_31", section: "S04", classification: "C", label: "Target Wood (kWh)", defaultValue: 0 },

      // Embodied carbon inputs
      { id: "emissions.typology", legacyId: "d_39", section: "S05", classification: "C", label: "Building Typology", defaultValue: "Low-Rise Residential" },
      { id: "emissions.modelledEmbodied", legacyId: "i_41", section: "S05", classification: "C", label: "Modelled Embodied Carbon (kgCO2e/m²)", defaultValue: 350 },
    ];

    graph.registerInputs(inputs);

    // ========================================================================
    // EMISSIONS CALCULATIONS - Row 27-31
    // ========================================================================

    // Electricity emissions
    graph.registerNode({
      id: "emissions.electricity",
      legacyId: "g_27",
      section: "S04",
      classification: "C",
      dependencies: ["energy.electricity.consumption"],
      label: "Electricity Emissions (kg CO2e/yr)",
      compute: (inputs) => {
        const consumption = parseNum(inputs["energy.electricity.consumption"]);
        return consumption * EMISSION_FACTORS.electricity;
      },
    });

    // Gas emissions
    graph.registerNode({
      id: "emissions.gas",
      legacyId: "g_28",
      section: "S04",
      classification: "C",
      dependencies: ["energy.gas.consumption"],
      label: "Gas Emissions (kg CO2e/yr)",
      compute: (inputs) => {
        const consumption = parseNum(inputs["energy.gas.consumption"]);
        return consumption * EMISSION_FACTORS.gas;
      },
    });

    // Propane emissions
    graph.registerNode({
      id: "emissions.propane",
      legacyId: "g_29",
      section: "S04",
      classification: "C",
      dependencies: ["energy.propane.consumption"],
      label: "Propane Emissions (kg CO2e/yr)",
      compute: (inputs) => {
        const consumption = parseNum(inputs["energy.propane.consumption"]);
        return consumption * EMISSION_FACTORS.propane;
      },
    });

    // Oil emissions
    graph.registerNode({
      id: "emissions.oil",
      legacyId: "g_30",
      section: "S04",
      classification: "C",
      dependencies: ["energy.oil.consumption"],
      label: "Oil Emissions (kg CO2e/yr)",
      compute: (inputs) => {
        const consumption = parseNum(inputs["energy.oil.consumption"]);
        return consumption * EMISSION_FACTORS.oil;
      },
    });

    // ========================================================================
    // ROW 32 SUBTOTALS (Critical for S01 dashboard)
    // ========================================================================

    // Actual emissions subtotal (g_32) = SUM(g_27:g_31) - wood offset
    graph.registerNode({
      id: "emissions.actual.subtotal",
      legacyId: "g_32",
      section: "S04",
      classification: "C",
      dependencies: [
        "emissions.electricity",
        "emissions.gas",
        "emissions.propane",
        "emissions.oil",
        "forestry.annualOffset"
      ],
      label: "Actual Emissions Subtotal (kg CO2e/yr)",
      compute: (inputs) => {
        const elec = parseNum(inputs["emissions.electricity"]);
        const gas = parseNum(inputs["emissions.gas"]);
        const propane = parseNum(inputs["emissions.propane"]);
        const oil = parseNum(inputs["emissions.oil"]);
        const woodOffset = parseNum(inputs["forestry.annualOffset"]) * 1000; // MT to kg

        return elec + gas + propane + oil - woodOffset;
      },
    });

    // Target emissions subtotal (k_32) - similar but uses target consumption
    graph.registerNode({
      id: "emissions.target.subtotal",
      legacyId: "k_32",
      section: "S04",
      classification: "C",
      dependencies: [
        "energy.target.electricity",
        "energy.target.gas",
        "forestry.annualOffset"
      ],
      label: "Target Emissions Subtotal (kg CO2e/yr)",
      compute: (inputs) => {
        // Simplified - assumes all target energy is electricity equivalent
        const elec = parseNum(inputs["energy.target.electricity"]);
        const gas = parseNum(inputs["energy.target.gas"]) / 10.3321 * EMISSION_FACTORS.gas;
        const woodOffset = parseNum(inputs["forestry.annualOffset"]) * 1000;

        return elec * EMISSION_FACTORS.electricity + gas - woodOffset;
      },
    });

    // ========================================================================
    // EMISSIONS INTENSITY
    // ========================================================================

    // GHGI - Greenhouse Gas Intensity (kg CO2e/m²/yr)
    graph.registerNode({
      id: "emissions.ghgi",
      legacyId: "g_38",
      section: "S05",
      classification: "C",
      dependencies: ["emissions.actual.subtotal", "building.conditionedFloorArea"],
      label: "Annual GHG Intensity (kg CO2e/m²/yr)",
      compute: (inputs) => {
        const emissions = parseNum(inputs["emissions.actual.subtotal"]);
        const area = parseNum(inputs["building.conditionedFloorArea"], 1);
        return area > 0 ? emissions / area : 0;
      },
    });

    // Lifetime operational emissions
    graph.registerNode({
      id: "emissions.lifetime.operational",
      legacyId: "i_38",
      section: "S05",
      classification: "C",
      dependencies: ["emissions.ghgi", "building.serviceLife"],
      label: "Lifetime Operational Emissions (kg CO2e/m²)",
      compute: (inputs) => {
        const ghgi = parseNum(inputs["emissions.ghgi"]);
        const serviceLife = parseNum(inputs["building.serviceLife"], 50);
        return ghgi * serviceLife;
      },
    });

    // Total lifetime carbon (operational + embodied)
    graph.registerNode({
      id: "emissions.lifetime.total",
      section: "S05",
      classification: "C",
      dependencies: ["emissions.lifetime.operational", "emissions.modelledEmbodied"],
      label: "Total Lifetime Carbon (kg CO2e/m²)",
      compute: (inputs) => {
        const operational = parseNum(inputs["emissions.lifetime.operational"]);
        const embodied = parseNum(inputs["emissions.modelledEmbodied"]);
        return operational + embodied;
      },
    });

    console.log("[EmissionsNodes] Registered", inputs.length, "inputs");
  }

  window.TEUI.ComputationNodes.Emissions = { register, EMISSION_FACTORS };
  console.log("[EmissionsNodes] Module loaded");
})();
