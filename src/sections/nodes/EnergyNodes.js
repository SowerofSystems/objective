/**
 * EnergyNodes.js - Energy Results Calculation Nodes (TEDI/TEUI)
 *
 * Part of the Multi-Model Architecture refactoring (Phase 2, Task 2.5)
 * See: docs/REFACTORING_PLAN.md
 *
 * This module expresses Section 04/14/15 energy result calculations.
 * Key metrics:
 * - TED (Total Energy Demand for Heating)
 * - TEDI (Thermal Energy Demand Intensity)
 * - TELI (Transmission Loss Intensity)
 * - CED (Cooling Energy Demand)
 * - TEUI (Total Energy Use Intensity)
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  // ============================================================================
  // HELPER
  // ============================================================================

  function parseNum(value, defaultVal = 0) {
    if (value === null || value === undefined || value === "N/A") return defaultVal;
    const num = parseFloat(String(value).replace(/,/g, ""));
    return isNaN(num) ? defaultVal : num;
  }

  // ============================================================================
  // INPUT NODES (Upstream values needed for energy calculations)
  // ============================================================================

  // NOTE: Energy calculations depend on values from other sections:
  // - geometry.conditionedFloorArea (h_15) - from Geometry/S02
  // - mechanical.heating.demand (d_114) - computed by MechanicalNodes
  // - mechanical.cooling.demand (d_117) - computed by MechanicalNodes
  // These are NOT re-declared here; they're referenced via dependencies.

  const EnergyInputs = [
    // Transmission losses (from S11/S12)
    {
      id: "envelope.airFacing.totalHeatLoss",
      legacyId: "i_97",
      defaultValue: 0,
      classification: "C",
      section: "S11",
      label: "Air-Facing Transmission Heat Loss",
      unit: "kWh/yr"
    },
    {
      id: "envelope.groundFacing.totalHeatLoss",
      legacyId: "i_98",
      defaultValue: 0,
      classification: "C",
      section: "S11",
      label: "Ground-Facing Transmission Heat Loss",
      unit: "kWh/yr"
    },
    {
      id: "envelope.airLeakage.heatLoss",
      legacyId: "i_103",
      defaultValue: 0,
      classification: "C",
      section: "S12",
      label: "Air Leakage Heat Loss",
      unit: "kWh/yr"
    },

    // Ventilation losses (from S13)
    {
      id: "mechanical.ventilation.heatLoss",
      legacyId: "m_121",
      defaultValue: 0,
      classification: "C",
      section: "S13",
      label: "Ventilation Heat Loss",
      unit: "kWh/yr"
    },

    // Internal gains (from S09/S10)
    {
      id: "internal.totalGains",
      legacyId: "i_80",
      defaultValue: 0,
      classification: "C",
      section: "S09",
      label: "Internal Heat Gains",
      unit: "kWh/yr"
    },
    {
      id: "solar.totalGains",
      legacyId: "d_122",
      defaultValue: 0,
      classification: "C",
      section: "S10",
      label: "Solar Heat Gains",
      unit: "kWh/yr"
    },

    // Cooling loads (heat gains)
    {
      id: "envelope.airFacing.totalHeatGain",
      legacyId: "k_71",
      defaultValue: 0,
      classification: "C",
      section: "S11",
      label: "Air-Facing Heat Gain",
      unit: "kWh/yr"
    },
    {
      id: "internal.coolingLoad",
      legacyId: "k_79",
      defaultValue: 0,
      classification: "C",
      section: "S09",
      label: "Internal Cooling Load",
      unit: "kWh/yr"
    },
    {
      id: "envelope.airLeakage.heatGain",
      legacyId: "k_98",
      defaultValue: 0,
      classification: "C",
      section: "S12",
      label: "Air Leakage Heat Gain",
      unit: "kWh/yr"
    },

    // Other energy uses
    {
      id: "energy.dhw",
      legacyId: "h_52",
      defaultValue: 0,
      classification: "C",
      section: "S07",
      label: "DHW Energy Use",
      unit: "kWh/yr"
    },
    {
      id: "energy.lighting",
      legacyId: "h_77",
      defaultValue: 0,
      classification: "C",
      section: "S09",
      label: "Lighting Energy",
      unit: "kWh/yr"
    },
    {
      id: "energy.plugLoads",
      legacyId: "h_78",
      defaultValue: 0,
      classification: "C",
      section: "S09",
      label: "Plug Load Energy",
      unit: "kWh/yr"
    },
    {
      id: "energy.fans",
      legacyId: "h_118",
      defaultValue: 0,
      classification: "C",
      section: "S13",
      label: "Fan Energy",
      unit: "kWh/yr"
    }
  ];

  // ============================================================================
  // COMPUTATION NODES
  // ============================================================================

  const EnergyNodes = [
    // ========================================================================
    // THERMAL ENERGY DEMAND (Section 14)
    // ========================================================================
    {
      id: "energy.ted.heating",
      legacyId: "d_127",
      dependencies: [
        "envelope.airFacing.totalHeatLoss",
        "envelope.groundFacing.totalHeatLoss",
        "envelope.airLeakage.heatLoss",
        "mechanical.ventilation.heatLoss",
        "internal.totalGains"
      ],
      classification: "C",
      section: "S14",
      label: "Total Energy Demand for Heating (TED)",
      unit: "kWh/yr",
      compute: (inputs) => {
        // TED = Transmission losses + Ventilation losses - Internal gains
        const i97 = parseNum(inputs["envelope.airFacing.totalHeatLoss"], 0);
        const i98 = parseNum(inputs["envelope.groundFacing.totalHeatLoss"], 0);
        const i103 = parseNum(inputs["envelope.airLeakage.heatLoss"], 0);
        const m121 = parseNum(inputs["mechanical.ventilation.heatLoss"], 0);
        const i80 = parseNum(inputs["internal.totalGains"], 0);

        return +(i97 + i98 + i103 + m121 - i80).toFixed(2);
      }
    },
    {
      id: "energy.tedi",
      legacyId: "h_127",
      dependencies: ["energy.ted.heating", "geometry.conditionedFloorArea"],
      classification: "C",
      section: "S14",
      label: "Thermal Energy Demand Intensity (TEDI)",
      unit: "kWh/m²/yr",
      compute: (inputs) => {
        const ted = parseNum(inputs["energy.ted.heating"], 0);
        const area = parseNum(inputs["geometry.conditionedFloorArea"], 5000);

        return area > 0 ? +(ted / area).toFixed(2) : 0;
      }
    },
    {
      id: "energy.ted.envelope",
      legacyId: "d_128",
      dependencies: [
        "envelope.airFacing.totalHeatLoss",
        "envelope.groundFacing.totalHeatLoss",
        "envelope.airLeakage.heatLoss",
        "internal.totalGains"
      ],
      classification: "C",
      section: "S14",
      label: "TED Envelope Only",
      unit: "kWh/yr",
      compute: (inputs) => {
        // TED Envelope = Transmission losses - Internal gains (no ventilation)
        const i97 = parseNum(inputs["envelope.airFacing.totalHeatLoss"], 0);
        const i98 = parseNum(inputs["envelope.groundFacing.totalHeatLoss"], 0);
        const i103 = parseNum(inputs["envelope.airLeakage.heatLoss"], 0);
        const i80 = parseNum(inputs["internal.totalGains"], 0);

        return +(i97 + i98 + i103 - i80).toFixed(2);
      }
    },
    {
      id: "energy.tedi.envelope",
      legacyId: "h_128",
      dependencies: ["energy.ted.envelope", "geometry.conditionedFloorArea"],
      classification: "C",
      section: "S14",
      label: "TEDI Envelope Only",
      unit: "kWh/m²/yr",
      compute: (inputs) => {
        const ted = parseNum(inputs["energy.ted.envelope"], 0);
        const area = parseNum(inputs["geometry.conditionedFloorArea"], 5000);

        return area > 0 ? +(ted / area).toFixed(2) : 0;
      }
    },

    // ========================================================================
    // TRANSMISSION LOSS (TELI)
    // ========================================================================
    {
      id: "energy.tel",
      legacyId: "d_131",
      dependencies: [
        "envelope.airFacing.totalHeatLoss",
        "envelope.groundFacing.totalHeatLoss",
        "envelope.airLeakage.heatLoss"
      ],
      classification: "C",
      section: "S14",
      label: "Total Envelope Heat Loss (TEL)",
      unit: "kWh/yr",
      compute: (inputs) => {
        const i97 = parseNum(inputs["envelope.airFacing.totalHeatLoss"], 0);
        const i98 = parseNum(inputs["envelope.groundFacing.totalHeatLoss"], 0);
        const i103 = parseNum(inputs["envelope.airLeakage.heatLoss"], 0);

        return +(i97 + i98 + i103).toFixed(2);
      }
    },
    {
      id: "energy.teli",
      legacyId: "h_131",
      dependencies: ["energy.tel", "geometry.conditionedFloorArea"],
      classification: "C",
      section: "S14",
      label: "Transmission Loss Intensity (TELI)",
      unit: "kWh/m²/yr",
      compute: (inputs) => {
        const tel = parseNum(inputs["energy.tel"], 0);
        const area = parseNum(inputs["geometry.conditionedFloorArea"], 5000);

        return area > 0 ? +(tel / area).toFixed(2) : 0;
      }
    },

    // ========================================================================
    // COOLING ENERGY DEMAND
    // ========================================================================
    {
      id: "energy.ced.unmitigated",
      legacyId: "d_129",
      dependencies: [
        "envelope.airFacing.totalHeatGain",
        "internal.coolingLoad",
        "envelope.airLeakage.heatGain",
        "solar.totalGains"
      ],
      classification: "C",
      section: "S14",
      label: "Cooling Energy Demand Unmitigated",
      unit: "kWh/yr",
      compute: (inputs) => {
        const k71 = parseNum(inputs["envelope.airFacing.totalHeatGain"], 0);
        const k79 = parseNum(inputs["internal.coolingLoad"], 0);
        const k98 = parseNum(inputs["envelope.airLeakage.heatGain"], 0);
        const d122 = parseNum(inputs["solar.totalGains"], 0);

        return +(k71 + k79 + k98 + d122).toFixed(2);
      }
    },
    {
      id: "energy.cedi.unmitigated",
      legacyId: "h_129",
      dependencies: ["energy.ced.unmitigated", "geometry.conditionedFloorArea"],
      classification: "C",
      section: "S14",
      label: "Cooling Energy Demand Intensity (Unmitigated)",
      unit: "kWh/m²/yr",
      compute: (inputs) => {
        const ced = parseNum(inputs["energy.ced.unmitigated"], 0);
        const area = parseNum(inputs["geometry.conditionedFloorArea"], 5000);

        return area > 0 ? +(ced / area).toFixed(2) : 0;
      }
    },

    // ========================================================================
    // TOTAL ENERGY USE INTENSITY (Section 15)
    // ========================================================================
    {
      id: "energy.total.heating",
      legacyId: "h_135",
      dependencies: ["mechanical.heating.demand"],
      classification: "C",
      section: "S15",
      label: "Total Heating Energy",
      unit: "kWh/yr",
      compute: (inputs) => {
        return parseNum(inputs["mechanical.heating.demand"], 0);
      }
    },
    {
      id: "energy.total.cooling",
      legacyId: "h_136_cooling",
      dependencies: ["mechanical.cooling.demand"],
      classification: "C",
      section: "S15",
      label: "Total Cooling Energy",
      unit: "kWh/yr",
      compute: (inputs) => {
        return parseNum(inputs["mechanical.cooling.demand"], 0);
      }
    },
    {
      id: "energy.total.all",
      legacyId: "d_136",
      dependencies: [
        "mechanical.heating.demand",
        "mechanical.cooling.demand",
        "energy.dhw",
        "energy.lighting",
        "energy.plugLoads",
        "energy.fans"
      ],
      classification: "C",
      section: "S15",
      label: "Total Energy Use",
      unit: "kWh/yr",
      compute: (inputs) => {
        const heating = parseNum(inputs["mechanical.heating.demand"], 0);
        const cooling = parseNum(inputs["mechanical.cooling.demand"], 0);
        const dhw = parseNum(inputs["energy.dhw"], 0);
        const lighting = parseNum(inputs["energy.lighting"], 0);
        const plugLoads = parseNum(inputs["energy.plugLoads"], 0);
        const fans = parseNum(inputs["energy.fans"], 0);

        return +(heating + cooling + dhw + lighting + plugLoads + fans).toFixed(2);
      }
    },
    {
      id: "energy.teui",
      legacyId: "h_136",
      dependencies: ["energy.total.all", "geometry.conditionedFloorArea"],
      classification: "C",
      section: "S15",
      label: "Total Energy Use Intensity (TEUI)",
      unit: "kWh/m²/yr",
      compute: (inputs) => {
        const total = parseNum(inputs["energy.total.all"], 0);
        const area = parseNum(inputs["geometry.conditionedFloorArea"], 5000);

        return area > 0 ? +(total / area).toFixed(2) : 0;
      }
    },

    // ========================================================================
    // INTENSITY BREAKDOWNS
    // ========================================================================
    {
      id: "energy.intensity.heating",
      legacyId: "f_135",
      dependencies: ["mechanical.heating.demand", "geometry.conditionedFloorArea"],
      classification: "C",
      section: "S15",
      label: "Heating Intensity",
      unit: "kWh/m²/yr",
      compute: (inputs) => {
        const heating = parseNum(inputs["mechanical.heating.demand"], 0);
        const area = parseNum(inputs["geometry.conditionedFloorArea"], 5000);

        return area > 0 ? +(heating / area).toFixed(2) : 0;
      }
    },
    {
      id: "energy.intensity.cooling",
      legacyId: "f_136",
      dependencies: ["mechanical.cooling.demand", "geometry.conditionedFloorArea"],
      classification: "C",
      section: "S15",
      label: "Cooling Intensity",
      unit: "kWh/m²/yr",
      compute: (inputs) => {
        const cooling = parseNum(inputs["mechanical.cooling.demand"], 0);
        const area = parseNum(inputs["geometry.conditionedFloorArea"], 5000);

        return area > 0 ? +(cooling / area).toFixed(2) : 0;
      }
    },
    {
      id: "energy.intensity.dhw",
      legacyId: "f_137",
      dependencies: ["energy.dhw", "geometry.conditionedFloorArea"],
      classification: "C",
      section: "S15",
      label: "DHW Intensity",
      unit: "kWh/m²/yr",
      compute: (inputs) => {
        const dhw = parseNum(inputs["energy.dhw"], 0);
        const area = parseNum(inputs["geometry.conditionedFloorArea"], 5000);

        return area > 0 ? +(dhw / area).toFixed(2) : 0;
      }
    }
  ];

  // ============================================================================
  // REGISTRATION
  // ============================================================================

  function registerEnergyNodes(graph) {
    for (const input of EnergyInputs) {
      graph.registerInput(input);
    }
    for (const node of EnergyNodes) {
      graph.registerNode(node);
    }
    console.log(
      `[EnergyNodes] Registered ${EnergyInputs.length} inputs and ${EnergyNodes.length} nodes`
    );
  }

  function registerEnergyFields() {
    const Registry = window.TEUI.FieldRegistry;
    if (!Registry) return;

    for (const input of EnergyInputs) {
      Registry.register({
        legacyId: input.legacyId,
        semanticPath: input.id,
        classification: input.classification,
        section: input.section,
        label: input.label,
        unit: input.unit,
        defaultValue: input.defaultValue
      });
    }
    for (const node of EnergyNodes) {
      Registry.register({
        legacyId: node.legacyId,
        semanticPath: node.id,
        classification: node.classification,
        section: node.section,
        label: node.label,
        unit: node.unit
      });
    }
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  window.TEUI.ComputationNodes.Energy = {
    inputs: EnergyInputs,
    nodes: EnergyNodes,
    register: registerEnergyNodes,
    registerFields: registerEnergyFields
  };

  console.log("[EnergyNodes] Module loaded");
})();
