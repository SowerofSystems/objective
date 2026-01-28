/**
 * InternalGainsNodes.js - Internal Gains (Section 09)
 *
 * Calculates occupant, plug load, lighting, and equipment internal gains.
 * These feed into radiant gains utilization (S10) and cooling load (S14).
 *
 * Key fields:
 * - d_64: Activity level dropdown → g_64 watts/person
 * - d_65-d_67: Energy density inputs (W/m²)
 * - h_64-h_67: Annual energy by category (kWh/yr)
 * - h_70: Plug/Light/Equipment subtotal (kWh/yr)
 * - i_71: Internal heating gains (kWh/yr)
 * - k_71: Internal cooling load (kWh/yr)
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  // Activity level to watts/person mapping (from SCHEDULES-3037.csv G32:G43)
  const ACTIVITY_WATTS = {
    Relaxed: 96.71,
    Normal: 117.23,
    Active: 219.81,
    Hyperactive: 424.95,
  };

  function register(graph) {
    // ========================================================================
    // INPUTS - Section 09 user-editable values
    // ========================================================================
    const inputs = [
      { id: "internal.activityLevel", legacyId: "d_64", section: "S09", classification: "C", label: "Occupant Activity Level", defaultValue: "Normal" },
      { id: "internal.plugLoadDensity", legacyId: "d_65", section: "S09", classification: "C", label: "Plug Load Density (W/m²)", defaultValue: 7 },
      { id: "internal.lightingDensity", legacyId: "d_66", section: "S09", classification: "C", label: "Lighting Density (W/m²)", defaultValue: 1.5 },
      { id: "internal.equipmentDensity", legacyId: "d_67", section: "S09", classification: "C", label: "Equipment Density (W/m²)", defaultValue: 3 },
    ];

    graph.registerInputs(inputs);

    // ========================================================================
    // COMPUTED NODES
    // ========================================================================

    // g_64: Activity level → watts/person (Sensible + Latent)
    graph.registerNode({
      id: "internal.occupants.wattsPerPerson",
      legacyId: "g_64",
      section: "S09",
      classification: "C",
      dependencies: ["internal.activityLevel"],
      label: "Occupant Watts per Person (S+L)",
      compute: (inputs) => {
        const level = inputs["internal.activityLevel"] || "Normal";
        return ACTIVITY_WATTS[level] || 117.23;
      },
    });

    // h_64: Occupant energy annual = (occupants × watts × annualHours) / 1000
    graph.registerNode({
      id: "internal.occupants.annual",
      legacyId: "h_64",
      section: "S09",
      classification: "C",
      dependencies: ["internal.occupants.wattsPerPerson", "occupancy.occupants", "occupancy.occupiedHours"],
      label: "Occupant Internal Gains (kWh/yr)",
      compute: (inputs) => {
        const watts = parseFloat(inputs["internal.occupants.wattsPerPerson"]) || 117.23;
        const occupants = parseFloat(inputs["occupancy.occupants"]) || 4;
        const hours = parseFloat(inputs["occupancy.occupiedHours"]) || 4380;
        return (watts * occupants * hours) / 1000;
      },
    });

    // h_65: Plug loads annual = (density × area × annualHours) / 1000
    graph.registerNode({
      id: "internal.plugLoads.annual",
      legacyId: "h_65",
      section: "S09",
      classification: "C",
      dependencies: ["internal.plugLoadDensity", "building.conditionedFloorArea", "occupancy.occupiedHours"],
      label: "Plug Load Internal Gains (kWh/yr)",
      compute: (inputs) => {
        const watts = parseFloat(inputs["internal.plugLoadDensity"]) || 7;
        const area = parseFloat(inputs["building.conditionedFloorArea"]) || 0;
        const hours = parseFloat(inputs["occupancy.occupiedHours"]) || 4380;
        return (watts * area * hours) / 1000;
      },
    });

    // h_66: Lighting annual = (density × area × annualHours) / 1000
    graph.registerNode({
      id: "internal.lighting.annual",
      legacyId: "h_66",
      section: "S09",
      classification: "C",
      dependencies: ["internal.lightingDensity", "building.conditionedFloorArea", "occupancy.occupiedHours"],
      label: "Lighting Internal Gains (kWh/yr)",
      compute: (inputs) => {
        const watts = parseFloat(inputs["internal.lightingDensity"]) || 1.5;
        const area = parseFloat(inputs["building.conditionedFloorArea"]) || 0;
        const hours = parseFloat(inputs["occupancy.occupiedHours"]) || 4380;
        return (watts * area * hours) / 1000;
      },
    });

    // h_67: Equipment annual = (density × area × annualHours) / 1000
    graph.registerNode({
      id: "internal.equipment.annual",
      legacyId: "h_67",
      section: "S09",
      classification: "C",
      dependencies: ["internal.equipmentDensity", "building.conditionedFloorArea", "occupancy.occupiedHours"],
      label: "Equipment Internal Gains (kWh/yr)",
      compute: (inputs) => {
        const watts = parseFloat(inputs["internal.equipmentDensity"]) || 3;
        const area = parseFloat(inputs["building.conditionedFloorArea"]) || 0;
        const hours = parseFloat(inputs["occupancy.occupiedHours"]) || 4380;
        return (watts * area * hours) / 1000;
      },
    });

    // ========================================================================
    // SUBTOTAL AND SEASONAL SPLITS
    // ========================================================================

    // h_70: Plug/Light/Equipment subtotal (excludes occupants and DHW losses)
    graph.registerNode({
      id: "energy.plugLoads.subtotal",
      legacyId: "h_70",
      section: "S09",
      classification: "C",
      dependencies: ["internal.plugLoads.annual", "internal.lighting.annual", "internal.equipment.annual"],
      label: "Plug/Light/Equipment Subtotal (kWh/yr)",
      compute: (inputs) => {
        const plugs = parseFloat(inputs["internal.plugLoads.annual"]) || 0;
        const lighting = parseFloat(inputs["internal.lighting.annual"]) || 0;
        const equipment = parseFloat(inputs["internal.equipment.annual"]) || 0;
        return plugs + lighting + equipment;
      },
    });

    // i_71: Internal heating gains (heating season fraction)
    // = (h_70 + h_64 + d_54) × (365 - m_19) / 365
    graph.registerNode({
      id: "internal.heatingGains",
      legacyId: "i_71",
      section: "S09",
      classification: "C",
      dependencies: [
        "energy.plugLoads.subtotal",
        "internal.occupants.annual",
        "waterHeating.systemLosses",
        "climate.coolingDays"
      ],
      label: "Internal Gains - Heating Season (kWh/yr)",
      compute: (inputs) => {
        const h70 = parseFloat(inputs["energy.plugLoads.subtotal"]) || 0;
        const h64 = parseFloat(inputs["internal.occupants.annual"]) || 0;
        const d54 = parseFloat(inputs["waterHeating.systemLosses"]) || 0;
        const coolingDays = parseFloat(inputs["climate.coolingDays"]) || 0;
        const heatingFraction = (365 - coolingDays) / 365;
        return (h70 + h64 + d54) * heatingFraction;
      },
    });

    // k_71: Internal cooling load (cooling season fraction)
    // = (h_70 + h_64 + d_54) × m_19 / 365
    graph.registerNode({
      id: "internal.coolingLoad.occupants",
      legacyId: "k_71",
      section: "S09",
      classification: "C",
      dependencies: [
        "energy.plugLoads.subtotal",
        "internal.occupants.annual",
        "waterHeating.systemLosses",
        "climate.coolingDays"
      ],
      label: "Internal Gains - Cooling Season (kWh/yr)",
      compute: (inputs) => {
        const h70 = parseFloat(inputs["energy.plugLoads.subtotal"]) || 0;
        const h64 = parseFloat(inputs["internal.occupants.annual"]) || 0;
        const d54 = parseFloat(inputs["waterHeating.systemLosses"]) || 0;
        const coolingDays = parseFloat(inputs["climate.coolingDays"]) || 0;
        const coolingFraction = coolingDays / 365;
        return (h70 + h64 + d54) * coolingFraction;
      },
    });

    console.log("[InternalGainsNodes] Registered", inputs.length, "inputs and 8 computed nodes");
  }

  window.TEUI.ComputationNodes.InternalGains = { register };
  console.log("[InternalGainsNodes] Module loaded");
})();
