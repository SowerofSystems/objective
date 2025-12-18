/**
 * SpaceHeatingNodes.js - Space Heating System (Section 13)
 *
 * Space heating fuel type, efficiency, and energy calculations
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  const FUEL_FACTORS = {
    "Electric": { unit: "kWh", factor: 1 },
    "Gas": { unit: "m³", factor: 10.3321 },
    "Propane": { unit: "L", factor: 7.0833 },
    "Oil": { unit: "L", factor: 10.7444 },
    "Heat Pump": { unit: "kWh", factor: 1 },
    "Wood": { unit: "kg", factor: 4.5 },
  };

  function register(graph) {
    const inputs = [
      { id: "spaceHeating.systemType", legacyId: "d_113", section: "S13", classification: "C", label: "Space Heating System Type", defaultValue: "Gas" },
      { id: "spaceHeating.efficiency", legacyId: "d_114", section: "S13", classification: "C", label: "Heating Efficiency/COP", defaultValue: 95 },
      { id: "spaceHeating.secondaryType", legacyId: "d_115", section: "S13", classification: "C", label: "Secondary Heating Type", defaultValue: "None" },
      { id: "spaceHeating.secondaryFraction", legacyId: "d_116", section: "S13", classification: "C", label: "Secondary Heating Fraction (%)", defaultValue: 0 },
    ];

    graph.registerInputs(inputs);

    // Space heating energy from envelope heat loss
    graph.registerNode({
      id: "spaceHeating.annualDemand",
      section: "S13",
      classification: "C",
      dependencies: ["envelope.total.heatLoss"],
      label: "Space Heating Demand (kWh/yr)",
      compute: (inputs) => {
        // Heat loss from envelope is the heating demand
        return parseFloat(inputs["envelope.total.heatLoss"]) || 0;
      },
    });

    // Primary heating fuel consumption
    graph.registerNode({
      id: "spaceHeating.primaryFuelConsumption",
      section: "S13",
      classification: "C",
      dependencies: ["spaceHeating.annualDemand", "spaceHeating.efficiency", "spaceHeating.systemType", "spaceHeating.secondaryFraction"],
      label: "Primary Heating Fuel Consumption",
      compute: (inputs) => {
        const demand = parseFloat(inputs["spaceHeating.annualDemand"]) || 0;
        const efficiency = parseFloat(inputs["spaceHeating.efficiency"]) || 95;
        const secondaryFraction = parseFloat(inputs["spaceHeating.secondaryFraction"]) || 0;
        const systemType = inputs["spaceHeating.systemType"] || "Gas";
        const factor = FUEL_FACTORS[systemType]?.factor || 1;

        const primaryDemand = demand * (1 - secondaryFraction / 100);
        const energyIn = efficiency > 0 ? primaryDemand / (efficiency / 100) : primaryDemand;
        return factor !== 1 ? energyIn / factor : energyIn;
      },
    });

    // Is heat pump (for COP logic)
    graph.registerNode({
      id: "spaceHeating.isHeatPump",
      section: "S13",
      classification: "C",
      dependencies: ["spaceHeating.systemType"],
      label: "Is Heat Pump System",
      compute: (inputs) => {
        const type = inputs["spaceHeating.systemType"] || "";
        return type.toLowerCase().includes("heat pump");
      },
    });

    console.log("[SpaceHeatingNodes] Registered", inputs.length, "inputs");
  }

  window.TEUI.ComputationNodes.SpaceHeating = { register, FUEL_FACTORS };
  console.log("[SpaceHeatingNodes] Module loaded");
})();
