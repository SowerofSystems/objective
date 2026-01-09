/**
 * WaterHeatingNodes.js - Water Heating System (Section 07)
 *
 * Matches legacy Section07.js calculation logic exactly.
 * Key fields:
 * - d_49: Water Use Method dropdown
 * - e_49: User Defined litres/person/day
 * - e_50: By Engineer direct kWh/yr input
 * - j_50: Calculated hot water energy demand
 * - d_51: System type (Heatpump, Gas, Oil, Electric)
 * - d_52: Efficiency %
 * - d_53: Drain Water Heat Recovery Efficiency (0-70%)
 * - k_51: Net Electrical Demand (calculated)
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
    "Heatpump": { unit: "kWh", factor: 1 },
  };

  // Litres per person per day by method
  const METHOD_LPPPD = {
    "User Defined": null,  // Uses e_49 input
    "By Engineer": null,   // Uses e_50 direct input
    "PHPP Method": 62.5,
    "NBC Method": 220,
    "OBC Method": 275,
    "Luxury": 400,
  };

  function register(graph) {
    const inputs = [
      { id: "waterHeating.method", legacyId: "d_49", section: "S07", classification: "C", label: "Water Use Method", defaultValue: "User Defined" },
      { id: "waterHeating.userDefinedLpppd", legacyId: "e_49", section: "S07", classification: "C", label: "User Defined Water Use (L/person/day)", defaultValue: 40 },
      { id: "waterHeating.byEngineerKwh", legacyId: "e_50", section: "S07", classification: "C", label: "By Engineer Energy Demand (kWh/yr)", defaultValue: 10000 },
      { id: "waterHeating.systemType", legacyId: "d_51", section: "S07", classification: "C", label: "Water Heating System Type", defaultValue: "Heatpump" },
      { id: "waterHeating.efficiency", legacyId: "d_52", section: "S07", classification: "C", label: "Water Heating Efficiency (%)", defaultValue: 300 },
      { id: "waterHeating.dwhrEfficiency", legacyId: "d_53", section: "S07", classification: "C", label: "Drain Water Heat Recovery Efficiency (%)", defaultValue: 0 },
    ];

    graph.registerInputs(inputs);

    // Litres per person per day (computed from method)
    graph.registerNode({
      id: "waterHeating.lpppd",
      legacyId: "h_49",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.method", "waterHeating.userDefinedLpppd", "waterHeating.byEngineerKwh", "occupancy.occupants"],
      label: "Litres per Person per Day",
      compute: (inputs) => {
        const method = inputs["waterHeating.method"] || "User Defined";
        const userDefined = parseFloat(inputs["waterHeating.userDefinedLpppd"]) || 40;
        const byEngineer = parseFloat(inputs["waterHeating.byEngineerKwh"]) || 10000;
        const occupants = parseFloat(inputs["occupancy.occupants"]) || 4;

        if (method === "By Engineer") {
          // Reverse-calculate lpppd from kWh
          const waterHeatFactor = 0.0524;
          return occupants > 0 ? byEngineer / (365 * waterHeatFactor * occupants * 0.4) : 0;
        } else if (method === "User Defined") {
          return userDefined;
        } else {
          return METHOD_LPPPD[method] || 40;
        }
      },
    });

    // Hot water energy demand (j_50 in legacy)
    graph.registerNode({
      id: "waterHeating.energyDemand",
      legacyId: "j_50",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.method", "waterHeating.lpppd", "waterHeating.byEngineerKwh", "occupancy.occupants"],
      label: "Hot Water Energy Demand (kWh/yr)",
      compute: (inputs) => {
        const method = inputs["waterHeating.method"] || "User Defined";
        const lpppd = parseFloat(inputs["waterHeating.lpppd"]) || 40;
        const byEngineer = parseFloat(inputs["waterHeating.byEngineerKwh"]) || 10000;
        const occupants = parseFloat(inputs["occupancy.occupants"]) || 4;

        if (method === "By Engineer") {
          return byEngineer;
        } else {
          // Formula: lpppd * 0.4 * occupants * 0.0523 * 365
          return lpppd * 0.4 * occupants * 0.0523 * 365;
        }
      },
    });

    // Net electrical demand (k_51) - only for Heatpump/Electric systems
    graph.registerNode({
      id: "waterHeating.netElectricalDemand",
      legacyId: "k_51",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.energyDemand", "waterHeating.efficiency", "waterHeating.systemType", "waterHeating.dwhrEfficiency"],
      label: "Net Electrical Demand (kWh/yr)",
      compute: (inputs) => {
        const systemType = inputs["waterHeating.systemType"] || "Electric";

        // k_51 is only non-zero for Heatpump or Electric
        if (systemType !== "Heatpump" && systemType !== "Electric") {
          return 0;
        }

        const demand = parseFloat(inputs["waterHeating.energyDemand"]) || 0;
        const efficiency = parseFloat(inputs["waterHeating.efficiency"]) || 100;
        const dwhrEfficiency = parseFloat(inputs["waterHeating.dwhrEfficiency"]) || 0;

        // Net thermal demand after efficiency
        const netThermalDemand = efficiency > 0 ? demand / (efficiency / 100) : demand;

        // Apply DWHR recovery
        const energyRecovered = netThermalDemand * (dwhrEfficiency / 100);
        return netThermalDemand - energyRecovered;
      },
    });

    console.log("[WaterHeatingNodes] Registered", inputs.length, "inputs");
  }

  window.TEUI.ComputationNodes.WaterHeating = { register, FUEL_FACTORS, METHOD_LPPPD };
  console.log("[WaterHeatingNodes] Module loaded");
})();
