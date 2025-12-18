/**
 * VentilationNodes.js - Mechanical Ventilation (Section 13)
 *
 * Calculates ventilation energy:
 * - Ventilation rates (ACH, L/s)
 * - HRV/ERV efficiency
 * - Ventilation heat loss/gain
 * - Free cooling potential
 * - COP and heating/cooling system performance
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  function parseNum(value, defaultVal = 0) {
    if (value === null || value === undefined || value === "N/A") return defaultVal;
    const num = parseFloat(String(value).replace(/,/g, ""));
    return isNaN(num) ? defaultVal : num;
  }

  function register(graph) {
    const inputs = [
      // Ventilation system inputs
      { id: "ventilation.type", legacyId: "d_107", section: "S13", classification: "C", label: "Ventilation Type", defaultValue: "HRV" },
      { id: "ventilation.efficiency", legacyId: "d_108", section: "S13", classification: "C", label: "Heat Recovery Efficiency (%)", defaultValue: 75 },
      { id: "ventilation.flowRate", legacyId: "d_109", section: "S13", classification: "C", label: "Ventilation Flow Rate (L/s)", defaultValue: 50 },

      // Heating system inputs
      { id: "heating.systemType", legacyId: "d_113", section: "S13", classification: "C", label: "Heating System Type", defaultValue: "Heat Pump" },
      { id: "heating.hspf", legacyId: "d_114", section: "S13", classification: "C", label: "HSPF", defaultValue: 10 },
      { id: "heating.afue", legacyId: "d_115", section: "S13", classification: "C", label: "AFUE (%)", defaultValue: 95 },

      // Cooling system inputs
      { id: "cooling.systemType", legacyId: "d_119", section: "S13", classification: "C", label: "Cooling System Type", defaultValue: "Heat Pump" },
      { id: "cooling.seer", legacyId: "d_120", section: "S13", classification: "C", label: "SEER", defaultValue: 15 },
      { id: "cooling.eer", legacyId: "d_121", section: "S13", classification: "C", label: "EER", defaultValue: 12 },
    ];

    graph.registerInputs(inputs);

    // ========================================================================
    // VENTILATION RATES
    // ========================================================================

    // Ventilation ACH
    graph.registerNode({
      id: "ventilation.ach",
      legacyId: "e_107",
      section: "S13",
      classification: "C",
      dependencies: ["ventilation.flowRate", "volume.conditioned"],
      label: "Ventilation ACH",
      compute: (inputs) => {
        const flowRate = parseNum(inputs["ventilation.flowRate"], 50); // L/s
        const volume = parseNum(inputs["volume.conditioned"], 500); // m³
        // ACH = (flow rate in L/s × 3.6) / volume
        return volume > 0 ? (flowRate * 3.6) / volume : 0;
      }
    });

    // Ventilation volume rate
    graph.registerNode({
      id: "ventilation.volumeRate",
      legacyId: "f_107",
      section: "S13",
      classification: "C",
      dependencies: ["ventilation.flowRate"],
      label: "Ventilation Volume Rate (m³/h)",
      compute: (inputs) => {
        const flowRate = parseNum(inputs["ventilation.flowRate"], 50);
        return flowRate * 3.6; // L/s to m³/h
      }
    });

    // ========================================================================
    // HEAT RECOVERY
    // ========================================================================

    // Effective heat recovery
    graph.registerNode({
      id: "ventilation.effectiveRecovery",
      legacyId: "g_108",
      section: "S13",
      classification: "C",
      dependencies: ["ventilation.type", "ventilation.efficiency"],
      label: "Effective Heat Recovery (%)",
      compute: (inputs) => {
        const type = inputs["ventilation.type"] || "HRV";
        const efficiency = parseNum(inputs["ventilation.efficiency"], 75);

        // No recovery for exhaust-only or natural ventilation
        if (type === "Exhaust Only" || type === "Natural") {
          return 0;
        }

        return efficiency;
      }
    });

    // ========================================================================
    // VENTILATION HEAT LOSS/GAIN
    // ========================================================================

    // Ventilation heat loss (before recovery)
    graph.registerNode({
      id: "ventilation.grossHeatLoss",
      legacyId: "h_109",
      section: "S13",
      classification: "C",
      dependencies: ["ventilation.volumeRate", "climate.heating.degreedays"],
      label: "Gross Ventilation Heat Loss (kWh/yr)",
      compute: (inputs) => {
        const volumeRate = parseNum(inputs["ventilation.volumeRate"]);
        const hdd = parseNum(inputs["climate.heating.degreedays"], 4000);
        const airHeatCapacity = 0.34; // W·h/m³·K
        return (volumeRate * airHeatCapacity * hdd * 24) / 1000;
      }
    });

    // Ventilation heat loss (net after recovery)
    graph.registerNode({
      id: "ventilation.netHeatLoss",
      legacyId: "i_109",
      section: "S13",
      classification: "C",
      dependencies: ["ventilation.grossHeatLoss", "ventilation.effectiveRecovery"],
      label: "Net Ventilation Heat Loss (kWh/yr)",
      compute: (inputs) => {
        const grossLoss = parseNum(inputs["ventilation.grossHeatLoss"]);
        const recovery = parseNum(inputs["ventilation.effectiveRecovery"], 75) / 100;
        return grossLoss * (1 - recovery);
      }
    });

    // Ventilation heat gain (cooling season)
    graph.registerNode({
      id: "ventilation.heatGain",
      legacyId: "k_109",
      section: "S13",
      classification: "C",
      dependencies: ["ventilation.volumeRate", "climate.cooling.degreedays", "ventilation.effectiveRecovery"],
      label: "Net Ventilation Heat Gain (kWh/yr)",
      compute: (inputs) => {
        const volumeRate = parseNum(inputs["ventilation.volumeRate"]);
        const cdd = parseNum(inputs["climate.cooling.degreedays"], 300);
        const recovery = parseNum(inputs["ventilation.effectiveRecovery"], 75) / 100;
        const airHeatCapacity = 0.34;
        const grossGain = (volumeRate * airHeatCapacity * cdd * 24) / 1000;
        return grossGain * (1 - recovery);
      }
    });

    // ========================================================================
    // HEATING SYSTEM PERFORMANCE
    // ========================================================================

    // Heating COP
    graph.registerNode({
      id: "heating.cop",
      legacyId: "e_113",
      section: "S13",
      classification: "C",
      dependencies: ["heating.systemType", "heating.hspf", "heating.afue"],
      label: "Heating COP",
      compute: (inputs) => {
        const type = inputs["heating.systemType"] || "Heat Pump";
        const hspf = parseNum(inputs["heating.hspf"], 10);
        const afue = parseNum(inputs["heating.afue"], 95);

        if (type.includes("Heat Pump") || type.includes("ASHP") || type.includes("GSHP")) {
          // HSPF to COP: COP = HSPF / 3.412
          return hspf / 3.412;
        } else if (type.includes("Electric")) {
          return 1.0; // Electric resistance
        } else {
          // Combustion systems - AFUE to COP equivalent
          return afue / 100;
        }
      }
    });

    // Heating energy consumption
    graph.registerNode({
      id: "heating.energyConsumption",
      legacyId: "i_113",
      section: "S13",
      classification: "C",
      dependencies: [
        "energy.ted",
        "heating.cop"
      ],
      label: "Heating Energy Consumption (kWh/yr)",
      compute: (inputs) => {
        const ted = parseNum(inputs["energy.ted"]); // Thermal energy demand
        const cop = parseNum(inputs["heating.cop"], 1);
        return cop > 0 ? ted / cop : ted;
      }
    });

    // ========================================================================
    // COOLING SYSTEM PERFORMANCE
    // ========================================================================

    // Cooling COP
    graph.registerNode({
      id: "cooling.cop",
      legacyId: "e_119",
      section: "S13",
      classification: "C",
      dependencies: ["cooling.systemType", "cooling.seer", "cooling.eer"],
      label: "Cooling COP",
      compute: (inputs) => {
        const type = inputs["cooling.systemType"] || "Heat Pump";
        const seer = parseNum(inputs["cooling.seer"], 15);
        const eer = parseNum(inputs["cooling.eer"], 12);

        if (type.includes("Heat Pump") || type.includes("Central AC")) {
          // SEER to COP: COP = SEER / 3.412
          return seer / 3.412;
        } else {
          // EER to COP: COP = EER / 3.412
          return eer / 3.412;
        }
      }
    });

    // Cooling energy consumption
    graph.registerNode({
      id: "cooling.energyConsumption",
      legacyId: "i_119",
      section: "S13",
      classification: "C",
      dependencies: [
        "energy.ced",
        "cooling.cop"
      ],
      label: "Cooling Energy Consumption (kWh/yr)",
      compute: (inputs) => {
        const ced = parseNum(inputs["energy.ced"]); // Cooling energy demand
        const cop = parseNum(inputs["cooling.cop"], 3);
        return cop > 0 ? ced / cop : ced;
      }
    });

    // ========================================================================
    // FREE COOLING
    // ========================================================================

    // Free cooling potential (night flush, economizer)
    graph.registerNode({
      id: "cooling.freeCooling",
      legacyId: "i_122",
      section: "S13",
      classification: "C",
      dependencies: [
        "radiantGains.subtotal.coolingGain",
        "climate.cooling.degreedays"
      ],
      label: "Free Cooling Potential (kWh/yr)",
      compute: (inputs) => {
        const coolingGain = parseNum(inputs["radiantGains.subtotal.coolingGain"]);
        const cdd = parseNum(inputs["climate.cooling.degreedays"], 300);
        // Estimate: 10% of cooling gains can be offset by free cooling in moderate climates
        const freeCoolingFactor = cdd < 500 ? 0.15 : cdd < 1000 ? 0.10 : 0.05;
        return coolingGain * freeCoolingFactor;
      }
    });

    // ========================================================================
    // TOTAL MECHANICAL ENERGY
    // ========================================================================

    // Total HVAC energy
    graph.registerNode({
      id: "mechanical.totalEnergy",
      legacyId: "i_125",
      section: "S13",
      classification: "C",
      dependencies: [
        "heating.energyConsumption",
        "cooling.energyConsumption",
        "ventilation.netHeatLoss"
      ],
      label: "Total HVAC Energy (kWh/yr)",
      compute: (inputs) => {
        const heating = parseNum(inputs["heating.energyConsumption"]);
        const cooling = parseNum(inputs["cooling.energyConsumption"]);
        // Fan energy is typically small compared to heating/cooling
        // Assume ~5% of total for fans
        const baseEnergy = heating + cooling;
        const fanEnergy = baseEnergy * 0.05;
        return baseEnergy + fanEnergy;
      }
    });

    console.log("[VentilationNodes] Registered", inputs.length, "inputs");
  }

  window.TEUI.ComputationNodes.Ventilation = { register };
  console.log("[VentilationNodes] Module loaded");
})();
