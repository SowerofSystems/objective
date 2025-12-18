/**
 * WaterHeatingNodes.js - Water Heating System (Section 07)
 *
 * Water heating fuel type, efficiency, and energy calculations
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  // Fuel type energy factors (kWh per unit)
  const FUEL_FACTORS = {
    "Electric": { unit: "kWh", factor: 1 },
    "Gas": { unit: "m³", factor: 10.3321 },
    "Propane": { unit: "L", factor: 7.0833 },
    "Oil": { unit: "L", factor: 10.7444 },
    "Heat Pump": { unit: "kWh", factor: 1 },
  };

  function register(graph) {
    const inputs = [
      { id: "waterHeating.systemType", legacyId: "d_51", section: "S07", classification: "C", label: "Water Heating System Type", defaultValue: "Electric" },
      { id: "waterHeating.efficiency", legacyId: "d_52", section: "S07", classification: "C", label: "Water Heating Efficiency (%)", defaultValue: 95 },
      { id: "waterHeating.annualDemand", legacyId: "d_49", section: "S07", classification: "C", label: "Hot Water Demand (L/day)", defaultValue: 200 },
      { id: "waterHeating.deltaT", legacyId: "e_49", section: "S07", classification: "C", label: "Temperature Rise (°C)", defaultValue: 45 },
    ];

    graph.registerInputs(inputs);

    // Water heating energy demand
    graph.registerNode({
      id: "waterHeating.energyDemand",
      legacyId: "e_50",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.annualDemand", "waterHeating.deltaT"],
      label: "Water Heating Energy Demand (kWh/yr)",
      compute: (inputs) => {
        const demand = parseFloat(inputs["waterHeating.annualDemand"]) || 200;
        const deltaT = parseFloat(inputs["waterHeating.deltaT"]) || 45;
        // Q = m * c * deltaT; c = 4.186 kJ/kg°C, convert to kWh
        return (demand * 365 * 4.186 * deltaT) / 3600;
      },
    });

    // Water heating fuel consumption
    graph.registerNode({
      id: "waterHeating.fuelConsumption",
      legacyId: "d_53",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.energyDemand", "waterHeating.efficiency", "waterHeating.systemType"],
      label: "Water Heating Fuel Consumption",
      compute: (inputs) => {
        const demand = parseFloat(inputs["waterHeating.energyDemand"]) || 0;
        const efficiency = parseFloat(inputs["waterHeating.efficiency"]) || 95;
        const systemType = inputs["waterHeating.systemType"] || "Electric";
        const factor = FUEL_FACTORS[systemType]?.factor || 1;

        const energyIn = efficiency > 0 ? demand / (efficiency / 100) : demand;
        return factor !== 1 ? energyIn / factor : energyIn;
      },
    });

    console.log("[WaterHeatingNodes] Registered", inputs.length, "inputs");
  }

  window.TEUI.ComputationNodes.WaterHeating = { register, FUEL_FACTORS };
  console.log("[WaterHeatingNodes] Module loaded");
})();
