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
    if (value === "Unavailable") return "Unavailable";
    const num = parseFloat(String(value).replace(/,/g, ""));
    return isNaN(num) ? defaultVal : num;
  }

  function isUnavailable(value) {
    return value === "Unavailable" || value === "N/A";
  }

  function register(graph) {
    // NOTE: All S13 inputs are registered in MechanicalNodes.
    // This module uses mechanical.* paths for those inputs.

    // ========================================================================
    // VENTILATION RATES - from Section13 rows 119-120
    // ========================================================================

    // Volumetric ventilation rate (L/s) - d_120
    graph.registerNode({
      id: "ventilation.volumetricRate",
      legacyId: "d_120",
      section: "S13",
      classification: "C",
      dependencies: [
        "mechanical.ventilation.method",
        "mechanical.ventilation.ach",
        "mechanical.ventilation.ratePerPerson",
        "volume.conditioned",
        "occupancy.occupants",
        "occupancy.occupiedHours",
        "occupancy.totalHours"
      ],
      label: "Volumetric Ventilation Rate (L/s)",
      compute: (inputs) => {
        const method = inputs["mechanical.ventilation.method"] || "Volume by Schedule";
        const ach = parseNum(inputs["mechanical.ventilation.ach"], 3);
        const perPersonRate = parseNum(inputs["mechanical.ventilation.ratePerPerson"], 14);
        const volume = parseNum(inputs["volume.conditioned"], 6000);
        const occupants = parseNum(inputs["occupancy.occupants"], 20);
        const occupiedHours = parseNum(inputs["occupancy.occupiedHours"], 4380);
        const totalHours = parseNum(inputs["occupancy.totalHours"], 8760);
        const scheduleFactor = totalHours > 0 ? occupiedHours / totalHours : 0.5;

        if (method === "Volume Constant") {
          return (ach * volume) / 3.6;
        } else if (method === "Volume by Schedule") {
          return ((ach * volume) / 3.6) * scheduleFactor;
        } else if (method === "Occupant Constant") {
          return perPersonRate * occupants;
        } else if (method === "Occupant by Schedule") {
          return perPersonRate * occupants * scheduleFactor;
        } else {
          // Default to Volume by Schedule (matches legacy default)
          return ((ach * volume) / 3.6) * scheduleFactor;
        }
      }
    });

    // Volumetric ventilation rate in m³/h - h_120
    graph.registerNode({
      id: "ventilation.volumeRate",
      legacyId: "h_120",
      section: "S13",
      classification: "C",
      dependencies: ["ventilation.volumetricRate"],
      label: "Volumetric Ventilation Rate (m³/h)",
      compute: (inputs) => {
        const flowRate = parseNum(inputs["ventilation.volumetricRate"]);
        return flowRate * 3.6; // L/s to m³/h
      }
    });

    // ========================================================================
    // VENTILATION HEAT LOSS/GAIN - from Section13 rows 121-123
    // ========================================================================

    // Ventilation heating load (before recovery) - d_121
    graph.registerNode({
      id: "ventilation.grossHeatLoss",
      legacyId: "d_121",
      section: "S13",
      classification: "C",
      dependencies: ["ventilation.volumetricRate", "climate.heating.degreedays"],
      label: "Ventilation Heating Load (kWh/yr)",
      compute: (inputs) => {
        const hdd = inputs["climate.heating.degreedays"];
        if (isUnavailable(hdd)) return "Unavailable";

        const volumeRate = parseNum(inputs["ventilation.volumetricRate"]);
        // Formula from Section13: (1.21 * ventRate * hdd * 24) / 1000
        // 1.21 is volumetric heat capacity of air (kJ/(m³·K))
        return (1.21 * volumeRate * parseNum(hdd) * 24) / 1000;
      }
    });

    // Ventilation energy recovered - h_121
    graph.registerNode({
      id: "ventilation.energyRecovered",
      legacyId: "h_121",
      section: "S13",
      classification: "C",
      dependencies: ["ventilation.grossHeatLoss", "mechanical.ventilation.efficiency"],
      label: "Ventilation Energy Recovered (kWh/yr)",
      compute: (inputs) => {
        const grossLoss = parseNum(inputs["ventilation.grossHeatLoss"]);
        const efficiency = parseNum(inputs["mechanical.ventilation.efficiency"], 89) / 100;
        return grossLoss * efficiency;
      }
    });

    // Net heating season ventilation losses - m_121
    graph.registerNode({
      id: "ventilation.netHeatLoss",
      legacyId: "m_121",
      section: "S13",
      classification: "C",
      dependencies: ["ventilation.grossHeatLoss", "ventilation.energyRecovered"],
      label: "Net Ventilation Heat Loss (kWh/yr)",
      compute: (inputs) => {
        const grossLoss = parseNum(inputs["ventilation.grossHeatLoss"]);
        const recovered = parseNum(inputs["ventilation.energyRecovered"]);
        return grossLoss - recovered;
      }
    });

    // Ventilation cooling load - d_122
    graph.registerNode({
      id: "ventilation.heatGain",
      legacyId: "d_122",
      section: "S13",
      classification: "C",
      dependencies: ["ventilation.volumetricRate", "climate.cooling.degreedays", "mechanical.ventilation.efficiency"],
      label: "Net Ventilation Heat Gain (kWh/yr)",
      compute: (inputs) => {
        const cdd = inputs["climate.cooling.degreedays"];
        // Legacy returns 0 when CDD unavailable
        if (isUnavailable(cdd)) return 0;

        const volumeRate = parseNum(inputs["ventilation.volumetricRate"]);
        const efficiency = parseNum(inputs["mechanical.ventilation.efficiency"], 89) / 100;
        // Formula from Section13: (1.21 * ventRate * cdd * 24) / 1000 * (1 - efficiency)
        const grossGain = (1.21 * volumeRate * parseNum(cdd) * 24) / 1000;
        return grossGain * (1 - efficiency);
      }
    });

    // ========================================================================
    // HEATING SYSTEM PERFORMANCE - from Section13 row 113-114
    // ========================================================================

    // Heating COP (derived from HSPF or AFUE) - no direct legacyId
    graph.registerNode({
      id: "heating.copDerived",
      section: "S13",
      classification: "C",
      dependencies: ["mechanical.heating.systemType", "mechanical.heating.hspf", "mechanical.heating.afue"],
      label: "Heating COP",
      compute: (inputs) => {
        const type = inputs["mechanical.heating.systemType"] || "Heatpump";
        const hspf = parseNum(inputs["mechanical.heating.hspf"], 10);
        const afue = parseNum(inputs["mechanical.heating.afue"], 0.95);

        if (type === "Heatpump") {
          // HSPF to COP: COP = HSPF / 3.412
          return hspf / 3.412;
        } else if (type === "Electric") {
          return 1.0;
        } else {
          // Combustion systems - AFUE is already a decimal (0.95)
          return afue;
        }
      }
    });

    // Heating energy consumption
    // Note: No legacyId - this is an intermediate computation not stored in legacy system
    graph.registerNode({
      id: "heating.energyConsumption",
      section: "S13",
      classification: "C",
      dependencies: ["energy.ted.heating", "heating.copDerived"],
      label: "Heating Energy Consumption (kWh/yr)",
      compute: (inputs) => {
        const ted = parseNum(inputs["energy.ted.heating"]);
        const cop = parseNum(inputs["heating.copDerived"], 1);
        return cop > 0 ? ted / cop : ted;
      }
    });

    // ========================================================================
    // COOLING SYSTEM PERFORMANCE - from Section13 row 116-117
    // ========================================================================

    // Cooling energy
    // Note: No legacyId - this is an intermediate computation not stored in legacy system
    graph.registerNode({
      id: "cooling.energyConsumption",
      section: "S13",
      classification: "C",
      dependencies: ["energy.ced.unmitigated", "mechanical.cooling.effectiveCop"],
      label: "Cooling Energy Consumption (kWh/yr)",
      compute: (inputs) => {
        const ced = parseNum(inputs["energy.ced.unmitigated"]);
        const cop = parseNum(inputs["mechanical.cooling.effectiveCop"], 2.66);
        return cop > 0 ? ced / cop : ced;
      }
    });

    // ========================================================================
    // FREE COOLING - from Section13 row 124
    // ========================================================================

    // Free cooling potential - m_124
    graph.registerNode({
      id: "cooling.freeCooling",
      legacyId: "m_124",
      section: "S13",
      classification: "C",
      dependencies: ["radiantGains.subtotal.coolingGain", "climate.cooling.degreedays"],
      label: "Free Cooling Potential (kWh/yr)",
      compute: (inputs) => {
        const cdd = inputs["climate.cooling.degreedays"];
        // Legacy returns 0 when CDD unavailable
        if (isUnavailable(cdd)) return 0;

        const coolingGain = parseNum(inputs["radiantGains.subtotal.coolingGain"]);
        const cddNum = parseNum(cdd);
        const freeCoolingFactor = cddNum < 500 ? 0.15 : cddNum < 1000 ? 0.10 : 0.05;
        return coolingGain * freeCoolingFactor;
      }
    });

    console.log("[VentilationNodes] Registered ventilation computed nodes");
  }

  window.TEUI.ComputationNodes.Ventilation = { register };
  console.log("[VentilationNodes] Module loaded");
})();
