/**
 * EnvelopeNodes.js - Envelope Calculation Nodes for Incremental Computation
 *
 * Part of the Multi-Model Architecture refactoring (Phase 2, Task 2.3)
 * See: docs/REFACTORING_PLAN.md
 *
 * This module expresses Section 10/11/12 (Envelope) calculations as computation nodes.
 * Key calculations:
 * - Component areas (roof, walls, windows, foundation)
 * - RSI to U-value conversion
 * - Heat loss and heat gain per component
 * - Aggregate envelope metrics (Ae, Ag, total area)
 * - Thermal bridge penalty
 */
(function () {
  "use strict";

  // Ensure namespaces exist
  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  function parseNum(value, defaultVal = 0) {
    if (value === null || value === undefined || value === "N/A") return defaultVal;
    if (value === "Unavailable") return "Unavailable";
    const num = parseFloat(String(value).replace(/,/g, ""));
    return isNaN(num) ? defaultVal : num;
  }

  function isUnavailable(value) {
    return value === "Unavailable" || value === "N/A";
  }

  // ============================================================================
  // INPUT NODES (User-editable areas and RSI values)
  // ============================================================================

  const EnvelopeInputs = [
    // Component Areas (from S10, synced to S11)
    {
      id: "envelope.roof.area",
      legacyId: "d_85",
      defaultValue: 1100.42,
      classification: "G",
      section: "S10",
      label: "Roof Area",
      unit: "m²"
    },
    {
      id: "envelope.walls.area",
      legacyId: "d_86",
      defaultValue: 840,
      classification: "G",
      section: "S10",
      label: "Walls Above Grade Area",
      unit: "m²"
    },
    {
      id: "envelope.floorExposed.area",
      legacyId: "d_87",
      defaultValue: 0,
      classification: "G",
      section: "S10",
      label: "Floor Exposed Area",
      unit: "m²"
    },
    {
      id: "envelope.doors.area",
      legacyId: "d_88",
      defaultValue: 7.5,
      classification: "G",
      section: "S10",
      label: "Doors Area",
      unit: "m²"
    },
    {
      id: "envelope.windowsNorth.area",
      legacyId: "d_89",
      defaultValue: 81.14,
      classification: "G",
      section: "S10",
      label: "Windows North Area",
      unit: "m²"
    },
    {
      id: "envelope.windowsEast.area",
      legacyId: "d_90",
      defaultValue: 3.83,
      classification: "G",
      section: "S10",
      label: "Windows East Area",
      unit: "m²"
    },
    {
      id: "envelope.windowsSouth.area",
      legacyId: "d_91",
      defaultValue: 159,
      classification: "G",
      section: "S10",
      label: "Windows South Area",
      unit: "m²"
    },
    {
      id: "envelope.windowsWest.area",
      legacyId: "d_92",
      defaultValue: 100.66,
      classification: "G",
      section: "S10",
      label: "Windows West Area",
      unit: "m²"
    },
    {
      id: "envelope.skylights.area",
      legacyId: "d_93",
      defaultValue: 0,
      classification: "G",
      section: "S10",
      label: "Skylights Area",
      unit: "m²"
    },
    {
      id: "envelope.wallsBelowGrade.area",
      legacyId: "d_94",
      defaultValue: 0,
      classification: "G",
      section: "S10",
      label: "Walls Below Grade Area",
      unit: "m²"
    },
    {
      id: "envelope.slabOnGrade.area",
      legacyId: "d_95",
      defaultValue: 1100.42,
      classification: "G",
      section: "S10",
      label: "Slab on Grade Area",
      unit: "m²"
    },

    // RSI Values (C-fields - model-specific performance)
    {
      id: "envelope.roof.rsi",
      legacyId: "f_85",
      defaultValue: 8.81,
      classification: "C",
      section: "S11",
      label: "Roof RSI",
      unit: "m²·K/W"
    },
    {
      id: "envelope.walls.rsi",
      legacyId: "f_86",
      defaultValue: 6.19,
      classification: "C",
      section: "S11",
      label: "Walls Above Grade RSI",
      unit: "m²·K/W"
    },
    {
      id: "envelope.floorExposed.rsi",
      legacyId: "f_87",
      defaultValue: 9.52,
      classification: "C",
      section: "S11",
      label: "Floor Exposed RSI",
      unit: "m²·K/W"
    },
    {
      id: "envelope.wallsBelowGrade.rsi",
      legacyId: "f_94",
      defaultValue: 4.0,
      classification: "C",
      section: "S11",
      label: "Walls Below Grade RSI",
      unit: "m²·K/W"
    },
    {
      id: "envelope.slabOnGrade.rsi",
      legacyId: "f_95",
      defaultValue: 4.0,
      classification: "C",
      section: "S11",
      label: "Slab on Grade RSI",
      unit: "m²·K/W"
    },

    // U-Values for windows/doors (direct input)
    {
      id: "envelope.doors.uValue",
      legacyId: "g_88",
      defaultValue: 1.5,
      classification: "C",
      section: "S11",
      label: "Doors U-Value",
      unit: "W/m²·K"
    },
    {
      id: "envelope.windowsNorth.uValue",
      legacyId: "g_89",
      defaultValue: 0.9,
      classification: "C",
      section: "S11",
      label: "Windows North U-Value",
      unit: "W/m²·K"
    },
    {
      id: "envelope.windowsEast.uValue",
      legacyId: "g_90",
      defaultValue: 0.9,
      classification: "C",
      section: "S11",
      label: "Windows East U-Value",
      unit: "W/m²·K"
    },
    {
      id: "envelope.windowsSouth.uValue",
      legacyId: "g_91",
      defaultValue: 0.9,
      classification: "C",
      section: "S11",
      label: "Windows South U-Value",
      unit: "W/m²·K"
    },
    {
      id: "envelope.windowsWest.uValue",
      legacyId: "g_92",
      defaultValue: 0.9,
      classification: "C",
      section: "S11",
      label: "Windows West U-Value",
      unit: "W/m²·K"
    },
    {
      id: "envelope.skylights.uValue",
      legacyId: "g_93",
      defaultValue: 0.9,
      classification: "C",
      section: "S11",
      label: "Skylights U-Value",
      unit: "W/m²·K"
    },

    // Thermal Bridge Penalty
    {
      id: "envelope.thermalBridge.penalty",
      legacyId: "d_97",
      defaultValue: 0,
      classification: "C",
      section: "S11",
      label: "Thermal Bridge Penalty",
      unit: "%"
    }
  ];

  // ============================================================================
  // COMPUTATION NODES
  // ============================================================================

  const EnvelopeNodes = [
    // ========================================================================
    // RSI TO U-VALUE CONVERSIONS
    // ========================================================================
    {
      id: "envelope.roof.uValue",
      legacyId: "g_85",
      dependencies: ["envelope.roof.rsi"],
      classification: "C",
      section: "S11",
      label: "Roof U-Value",
      unit: "W/m²·K",
      compute: (inputs) => {
        const rsi = parseNum(inputs["envelope.roof.rsi"], 8.81);
        return rsi > 0 ? +(1 / rsi).toFixed(3) : 0;
      }
    },
    {
      id: "envelope.walls.uValue",
      legacyId: "g_86",
      dependencies: ["envelope.walls.rsi"],
      classification: "C",
      section: "S11",
      label: "Walls Above Grade U-Value",
      unit: "W/m²·K",
      compute: (inputs) => {
        const rsi = parseNum(inputs["envelope.walls.rsi"], 6.19);
        return rsi > 0 ? +(1 / rsi).toFixed(3) : 0;
      }
    },
    {
      id: "envelope.floorExposed.uValue",
      legacyId: "g_87",
      dependencies: ["envelope.floorExposed.rsi"],
      classification: "C",
      section: "S11",
      label: "Floor Exposed U-Value",
      unit: "W/m²·K",
      compute: (inputs) => {
        const rsi = parseNum(inputs["envelope.floorExposed.rsi"], 9.52);
        return rsi > 0 ? +(1 / rsi).toFixed(3) : 0;
      }
    },
    {
      id: "envelope.wallsBelowGrade.uValue",
      legacyId: "g_94",
      dependencies: ["envelope.wallsBelowGrade.rsi"],
      classification: "C",
      section: "S11",
      label: "Walls Below Grade U-Value",
      unit: "W/m²·K",
      compute: (inputs) => {
        const rsi = parseNum(inputs["envelope.wallsBelowGrade.rsi"], 4.0);
        return rsi > 0 ? +(1 / rsi).toFixed(3) : 0;
      }
    },
    {
      id: "envelope.slabOnGrade.uValue",
      legacyId: "g_95",
      dependencies: ["envelope.slabOnGrade.rsi"],
      classification: "C",
      section: "S11",
      label: "Slab on Grade U-Value",
      unit: "W/m²·K",
      compute: (inputs) => {
        const rsi = parseNum(inputs["envelope.slabOnGrade.rsi"], 4.0);
        return rsi > 0 ? +(1 / rsi).toFixed(3) : 0;
      }
    },

    // ========================================================================
    // AGGREGATE AREAS
    // ========================================================================
    {
      id: "envelope.airFacing.totalArea",
      legacyId: "d_101",
      dependencies: [
        "envelope.roof.area",
        "envelope.walls.area",
        "envelope.floorExposed.area",
        "envelope.doors.area",
        "envelope.windowsNorth.area",
        "envelope.windowsEast.area",
        "envelope.windowsSouth.area",
        "envelope.windowsWest.area",
        "envelope.skylights.area"
      ],
      classification: "G",
      section: "S12",
      label: "Total Air-Facing Area (Ae)",
      unit: "m²",
      compute: (inputs) => {
        const areas = [
          "envelope.roof.area",
          "envelope.walls.area",
          "envelope.floorExposed.area",
          "envelope.doors.area",
          "envelope.windowsNorth.area",
          "envelope.windowsEast.area",
          "envelope.windowsSouth.area",
          "envelope.windowsWest.area",
          "envelope.skylights.area"
        ];
        return areas.reduce((sum, key) => sum + parseNum(inputs[key], 0), 0);
      }
    },
    {
      id: "envelope.groundFacing.totalArea",
      legacyId: "d_102",
      dependencies: ["envelope.wallsBelowGrade.area", "envelope.slabOnGrade.area"],
      classification: "G",
      section: "S12",
      label: "Total Ground-Facing Area (Ag)",
      unit: "m²",
      compute: (inputs) => {
        return (
          parseNum(inputs["envelope.wallsBelowGrade.area"], 0) +
          parseNum(inputs["envelope.slabOnGrade.area"], 0)
        );
      }
    },
    {
      id: "envelope.total.area",
      legacyId: "d_104",
      dependencies: ["envelope.airFacing.totalArea", "envelope.groundFacing.totalArea"],
      classification: "G",
      section: "S12",
      label: "Total Envelope Area",
      unit: "m²",
      compute: (inputs) => {
        return (
          parseNum(inputs["envelope.airFacing.totalArea"], 0) +
          parseNum(inputs["envelope.groundFacing.totalArea"], 0)
        );
      }
    },

    // ========================================================================
    // WEIGHTED AVERAGE U-VALUES
    // ========================================================================
    {
      id: "envelope.airFacing.weightedUValue",
      // Note: legacyId "g_101" is mapped in VolumeMetricsNodes
      // This node applies thermal bridge penalty for internal use
      dependencies: [
        "envelope.roof.area",
        "envelope.roof.uValue",
        "envelope.walls.area",
        "envelope.walls.uValue",
        "envelope.floorExposed.area",
        "envelope.floorExposed.uValue",
        "envelope.doors.area",
        "envelope.doors.uValue",
        "envelope.windowsNorth.area",
        "envelope.windowsNorth.uValue",
        "envelope.windowsEast.area",
        "envelope.windowsEast.uValue",
        "envelope.windowsSouth.area",
        "envelope.windowsSouth.uValue",
        "envelope.windowsWest.area",
        "envelope.windowsWest.uValue",
        "envelope.skylights.area",
        "envelope.skylights.uValue",
        "envelope.thermalBridge.penalty"
      ],
      classification: "C",
      section: "S12",
      label: "Weighted Average U-Value (Ae)",
      unit: "W/m²·K",
      compute: (inputs) => {
        const components = [
          { area: "envelope.roof.area", u: "envelope.roof.uValue" },
          { area: "envelope.walls.area", u: "envelope.walls.uValue" },
          { area: "envelope.floorExposed.area", u: "envelope.floorExposed.uValue" },
          { area: "envelope.doors.area", u: "envelope.doors.uValue" },
          { area: "envelope.windowsNorth.area", u: "envelope.windowsNorth.uValue" },
          { area: "envelope.windowsEast.area", u: "envelope.windowsEast.uValue" },
          { area: "envelope.windowsSouth.area", u: "envelope.windowsSouth.uValue" },
          { area: "envelope.windowsWest.area", u: "envelope.windowsWest.uValue" },
          { area: "envelope.skylights.area", u: "envelope.skylights.uValue" }
        ];

        let totalUA = 0;
        let totalArea = 0;

        for (const comp of components) {
          const area = parseNum(inputs[comp.area], 0);
          const u = parseNum(inputs[comp.u], 0);
          totalUA += area * u;
          totalArea += area;
        }

        if (totalArea === 0) return 0;

        // Apply thermal bridge penalty
        const penalty = parseNum(inputs["envelope.thermalBridge.penalty"], 0);
        const baseU = totalUA / totalArea;
        const adjustedU = baseU * (1 + penalty / 100);

        return +adjustedU.toFixed(3);
      }
    },
    {
      id: "envelope.groundFacing.weightedUValue",
      // Note: legacyId "g_102" is mapped in VolumeMetricsNodes
      dependencies: [
        "envelope.wallsBelowGrade.area",
        "envelope.wallsBelowGrade.uValue",
        "envelope.slabOnGrade.area",
        "envelope.slabOnGrade.uValue",
        "envelope.thermalBridge.penalty"
      ],
      classification: "C",
      section: "S12",
      label: "Weighted Average U-Value (Ag)",
      unit: "W/m²·K",
      compute: (inputs) => {
        const wallsArea = parseNum(inputs["envelope.wallsBelowGrade.area"], 0);
        const wallsU = parseNum(inputs["envelope.wallsBelowGrade.uValue"], 0);
        const slabArea = parseNum(inputs["envelope.slabOnGrade.area"], 0);
        const slabU = parseNum(inputs["envelope.slabOnGrade.uValue"], 0);

        const totalUA = wallsArea * wallsU + slabArea * slabU;
        const totalArea = wallsArea + slabArea;

        if (totalArea === 0) return 0;

        // Apply thermal bridge penalty
        const penalty = parseNum(inputs["envelope.thermalBridge.penalty"], 0);
        const baseU = totalUA / totalArea;
        const adjustedU = baseU * (1 + penalty / 100);

        return +adjustedU.toFixed(3);
      }
    },

    // ========================================================================
    // HEAT LOSS CALCULATIONS
    // ========================================================================
    {
      id: "envelope.airFacing.heatLossRate",
      legacyId: "h_101",
      dependencies: [
        "envelope.airFacing.weightedUValue",
        "climate.heating.degreedays"
      ],
      classification: "C",
      section: "S12",
      label: "Heat Loss Rate (Ae)",
      unit: "kWh/m²",
      compute: (inputs) => {
        const hdd = inputs["climate.heating.degreedays"];
        if (isUnavailable(hdd)) return "Unavailable";

        const u = parseNum(inputs["envelope.airFacing.weightedUValue"], 0);
        // Heat loss = U × HDD × 24 / 1000
        return +((u * parseNum(hdd) * 24) / 1000).toFixed(2);
      }
    },
    {
      id: "envelope.airFacing.totalHeatLoss",
      legacyId: "i_101",
      dependencies: ["envelope.airFacing.heatLossRate", "envelope.airFacing.totalArea"],
      classification: "C",
      section: "S12",
      label: "Total Heat Loss (Ae)",
      unit: "kWh/yr",
      compute: (inputs) => {
        const rate = parseNum(inputs["envelope.airFacing.heatLossRate"], 0);
        const area = parseNum(inputs["envelope.airFacing.totalArea"], 0);
        return +(rate * area).toFixed(2);
      }
    },
    {
      id: "envelope.groundFacing.heatLossRate",
      legacyId: "h_102",
      dependencies: [
        "envelope.groundFacing.weightedUValue",
        "climate.groundFacing.hdd"
      ],
      classification: "C",
      section: "S12",
      label: "Heat Loss Rate (Ag)",
      unit: "kWh/m²",
      compute: (inputs) => {
        const gfhdd = inputs["climate.groundFacing.hdd"];
        if (isUnavailable(gfhdd)) return "Unavailable";

        const u = parseNum(inputs["envelope.groundFacing.weightedUValue"], 0);
        // Heat loss = U × GF_HDD × 24 / 1000
        return +((u * parseNum(gfhdd) * 24) / 1000).toFixed(2);
      }
    },
    {
      id: "envelope.groundFacing.totalHeatLoss",
      legacyId: "i_102",
      dependencies: [
        "envelope.groundFacing.heatLossRate",
        "envelope.groundFacing.totalArea"
      ],
      classification: "C",
      section: "S12",
      label: "Total Heat Loss (Ag)",
      unit: "kWh/yr",
      compute: (inputs) => {
        const rate = parseNum(inputs["envelope.groundFacing.heatLossRate"], 0);
        const area = parseNum(inputs["envelope.groundFacing.totalArea"], 0);
        return +(rate * area).toFixed(2);
      }
    },

    // ========================================================================
    // HEAT GAIN CALCULATIONS
    // ========================================================================
    {
      id: "envelope.airFacing.heatGainRate",
      legacyId: "j_101",
      dependencies: [
        "envelope.airFacing.weightedUValue",
        "climate.cooling.degreedays"
      ],
      classification: "C",
      section: "S12",
      label: "Heat Gain Rate (Ae)",
      unit: "kWh/m²",
      compute: (inputs) => {
        const cdd = inputs["climate.cooling.degreedays"];
        // Legacy returns 0 when CDD unavailable
        if (isUnavailable(cdd)) return 0;

        const u = parseNum(inputs["envelope.airFacing.weightedUValue"], 0);
        // Heat gain = U × CDD × 24 / 1000
        return +((u * parseNum(cdd) * 24) / 1000).toFixed(2);
      }
    },
    {
      id: "envelope.airFacing.totalHeatGain",
      legacyId: "k_101",
      dependencies: ["envelope.airFacing.heatGainRate", "envelope.airFacing.totalArea"],
      classification: "C",
      section: "S12",
      label: "Total Heat Gain (Ae)",
      unit: "kWh/yr",
      compute: (inputs) => {
        const rate = parseNum(inputs["envelope.airFacing.heatGainRate"], 0);
        const area = parseNum(inputs["envelope.airFacing.totalArea"], 0);
        return +(rate * area).toFixed(2);
      }
    },
    {
      id: "envelope.groundFacing.heatGainRate",
      legacyId: "j_102",
      dependencies: [
        "envelope.groundFacing.weightedUValue",
        "climate.groundFacing.cdd"
      ],
      classification: "C",
      section: "S12",
      label: "Heat Gain Rate (Ag)",
      unit: "kWh/m²",
      compute: (inputs) => {
        const gfcdd = inputs["climate.groundFacing.cdd"];
        const u = parseNum(inputs["envelope.groundFacing.weightedUValue"], 0);
        // Heat gain = U × GF_CDD × 24 / 1000
        return +((u * parseNum(gfcdd, 0) * 24) / 1000).toFixed(2);
      }
    },
    {
      id: "envelope.groundFacing.totalHeatGain",
      legacyId: "k_102",
      dependencies: [
        "envelope.groundFacing.heatGainRate",
        "envelope.groundFacing.totalArea"
      ],
      classification: "C",
      section: "S12",
      label: "Total Heat Gain (Ag)",
      unit: "kWh/yr",
      compute: (inputs) => {
        const rate = parseNum(inputs["envelope.groundFacing.heatGainRate"], 0);
        const area = parseNum(inputs["envelope.groundFacing.totalArea"], 0);
        return +(rate * area).toFixed(2);
      }
    },

    // ========================================================================
    // TOTAL TRANSMISSION LOSSES/GAINS
    // ========================================================================
    {
      id: "envelope.total.heatLoss",
      legacyId: "i_104",
      dependencies: [
        "envelope.airFacing.totalHeatLoss",
        "envelope.groundFacing.totalHeatLoss"
      ],
      classification: "C",
      section: "S12",
      label: "Total Transmission Heat Loss",
      unit: "kWh/yr",
      compute: (inputs) => {
        return (
          parseNum(inputs["envelope.airFacing.totalHeatLoss"], 0) +
          parseNum(inputs["envelope.groundFacing.totalHeatLoss"], 0)
        );
      }
    },
    {
      id: "envelope.total.heatGain",
      legacyId: "k_104",
      dependencies: [
        "envelope.airFacing.totalHeatGain",
        "envelope.groundFacing.totalHeatGain"
      ],
      classification: "C",
      section: "S12",
      label: "Total Transmission Heat Gain",
      unit: "kWh/yr",
      compute: (inputs) => {
        return (
          parseNum(inputs["envelope.airFacing.totalHeatGain"], 0) +
          parseNum(inputs["envelope.groundFacing.totalHeatGain"], 0)
        );
      }
    }
  ];

  // ============================================================================
  // REGISTRATION HELPER
  // ============================================================================

  function registerEnvelopeNodes(graph) {
    for (const input of EnvelopeInputs) {
      graph.registerInput(input);
    }
    for (const node of EnvelopeNodes) {
      graph.registerNode(node);
    }

    console.log(
      `[EnvelopeNodes] Registered ${EnvelopeInputs.length} inputs and ${EnvelopeNodes.length} computation nodes`
    );
  }

  function registerEnvelopeFields() {
    const Registry = window.TEUI.FieldRegistry;
    if (!Registry) return;

    for (const input of EnvelopeInputs) {
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

    for (const node of EnvelopeNodes) {
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

  window.TEUI.ComputationNodes.Envelope = {
    inputs: EnvelopeInputs,
    nodes: EnvelopeNodes,
    register: registerEnvelopeNodes,
    registerFields: registerEnvelopeFields
  };

  console.log("[EnvelopeNodes] Module loaded");
})();
