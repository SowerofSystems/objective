/**
 * TransmissionLossNodes.js - Envelope Transmission Losses (Section 11)
 *
 * Calculates heat loss through envelope components:
 * - RSI/U-value conversions
 * - Heat loss by component (air-facing and ground-facing)
 * - Surface temperatures
 * - Thermal bridge penalties
 * - Subtotals and percentages
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  // Component definitions
  const AIR_FACING_COMPONENTS = [
    { row: 85, id: "roof", label: "Roof/Ceiling", input: "rsi" },
    { row: 86, id: "walls", label: "Walls Above Grade", input: "rsi" },
    { row: 87, id: "exposedFloor", label: "Exposed Floor", input: "rsi" },
    { row: 88, id: "windows", label: "Windows", input: "uvalue" },
    { row: 89, id: "doors", label: "Doors", input: "uvalue" },
    { row: 90, id: "skylights", label: "Skylights", input: "uvalue" }
  ];

  const GROUND_FACING_COMPONENTS = [
    { row: 92, id: "wallsBelowGrade", label: "Walls Below Grade", input: "rsi" },
    { row: 93, id: "slabOnGrade", label: "Slab on Grade", input: "rsi" },
    { row: 94, id: "slabBelowGrade", label: "Slab Below Grade", input: "rsi" }
  ];

  const ALL_COMPONENTS = [...AIR_FACING_COMPONENTS, ...GROUND_FACING_COMPONENTS];

  function parseNum(value, defaultVal = 0) {
    if (value === null || value === undefined || value === "N/A") return defaultVal;
    const num = parseFloat(String(value).replace(/,/g, ""));
    return isNaN(num) ? defaultVal : num;
  }

  function register(graph) {
    const inputs = [];

    // ========================================================================
    // INPUTS - Component areas and thermal properties
    // ========================================================================
    ALL_COMPONENTS.forEach(({ row, id, label, input }) => {
      // Area input
      inputs.push({
        id: `transmissionLoss.${id}.area`,
        legacyId: `d_${row}`,
        section: "S11",
        classification: "C",
        label: `${label} Area (m²)`,
        defaultValue: 0
      });

      // RSI input (for components that use RSI as primary input)
      if (input === "rsi") {
        inputs.push({
          id: `transmissionLoss.${id}.rsi`,
          legacyId: `f_${row}`,
          section: "S11",
          classification: "C",
          label: `${label} RSI (m²K/W)`,
          defaultValue: 5.0
        });
      }

      // U-value input (for components that use U-value as primary input)
      if (input === "uvalue") {
        inputs.push({
          id: `transmissionLoss.${id}.uValue`,
          legacyId: `g_${row}`,
          section: "S11",
          classification: "C",
          label: `${label} U-Value (W/m²K)`,
          defaultValue: 2.0
        });
      }

      // R-improvement input (for components that can have added insulation)
      inputs.push({
        id: `transmissionLoss.${id}.rImprovement`,
        legacyId: `e_${row}`,
        section: "S11",
        classification: "C",
        label: `${label} R-Improvement`,
        defaultValue: 0
      });
    });

    // Thermal bridge penalty input
    inputs.push({
      id: "transmissionLoss.thermalBridgePenalty",
      legacyId: "d_96",
      section: "S11",
      classification: "C",
      label: "Thermal Bridge Penalty (%)",
      defaultValue: 5
    });

    graph.registerInputs(inputs);

    // ========================================================================
    // U-VALUE / RSI CONVERSIONS
    // ========================================================================
    ALL_COMPONENTS.forEach(({ row, id, label, input }) => {
      if (input === "rsi") {
        // RSI input -> compute U-value
        graph.registerNode({
          id: `transmissionLoss.${id}.uValue`,
          legacyId: `g_${row}`,
          section: "S11",
          classification: "C",
          dependencies: [`transmissionLoss.${id}.rsi`],
          label: `${label} U-Value (W/m²K)`,
          compute: (inputs) => {
            const rsi = parseNum(inputs[`transmissionLoss.${id}.rsi`], 5);
            return rsi > 0 ? 1 / rsi : 0;
          }
        });
      } else {
        // U-value input -> compute RSI
        graph.registerNode({
          id: `transmissionLoss.${id}.rsi`,
          legacyId: `f_${row}`,
          section: "S11",
          classification: "C",
          dependencies: [`transmissionLoss.${id}.uValue`],
          label: `${label} RSI (m²K/W)`,
          compute: (inputs) => {
            const uValue = parseNum(inputs[`transmissionLoss.${id}.uValue`], 2);
            return uValue > 0 ? 1 / uValue : 0;
          }
        });
      }
    });

    // ========================================================================
    // HEAT LOSS CALCULATIONS - Air-Facing Components
    // ========================================================================
    AIR_FACING_COMPONENTS.forEach(({ row, id, label }) => {
      graph.registerNode({
        id: `transmissionLoss.${id}.heatLoss`,
        legacyId: `i_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [
          `transmissionLoss.${id}.area`,
          `transmissionLoss.${id}.uValue`,
          "climate.heating.degreedays"
        ],
        label: `${label} Heat Loss (kWh/yr)`,
        compute: (inputs) => {
          const area = parseNum(inputs[`transmissionLoss.${id}.area`]);
          const uValue = parseNum(inputs[`transmissionLoss.${id}.uValue`]);
          const hdd = parseNum(inputs["climate.heating.degreedays"], 4000);
          // Heat loss = Area × U-value × HDD × 24 / 1000
          return (area * uValue * hdd * 24) / 1000;
        }
      });

      graph.registerNode({
        id: `transmissionLoss.${id}.heatGain`,
        legacyId: `k_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [
          `transmissionLoss.${id}.area`,
          `transmissionLoss.${id}.uValue`,
          "climate.cooling.degreedays"
        ],
        label: `${label} Heat Gain (kWh/yr)`,
        compute: (inputs) => {
          const area = parseNum(inputs[`transmissionLoss.${id}.area`]);
          const uValue = parseNum(inputs[`transmissionLoss.${id}.uValue`]);
          const cdd = parseNum(inputs["climate.cooling.degreedays"], 300);
          // Heat gain = Area × U-value × CDD × 24 / 1000
          return (area * uValue * cdd * 24) / 1000;
        }
      });
    });

    // ========================================================================
    // HEAT LOSS CALCULATIONS - Ground-Facing Components
    // ========================================================================
    GROUND_FACING_COMPONENTS.forEach(({ row, id, label }) => {
      graph.registerNode({
        id: `transmissionLoss.${id}.heatLoss`,
        legacyId: `i_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [
          `transmissionLoss.${id}.area`,
          `transmissionLoss.${id}.uValue`,
          "climate.groundFacing.hdd"
        ],
        label: `${label} Heat Loss (kWh/yr)`,
        compute: (inputs) => {
          const area = parseNum(inputs[`transmissionLoss.${id}.area`]);
          const uValue = parseNum(inputs[`transmissionLoss.${id}.uValue`]);
          const groundHdd = parseNum(inputs["climate.groundFacing.hdd"], 2000);
          // Heat loss = Area × U-value × Ground HDD × 24 / 1000
          return (area * uValue * groundHdd * 24) / 1000;
        }
      });

      graph.registerNode({
        id: `transmissionLoss.${id}.heatGain`,
        legacyId: `k_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [
          `transmissionLoss.${id}.area`,
          `transmissionLoss.${id}.uValue`,
          "climate.groundFacing.cdd"
        ],
        label: `${label} Heat Gain (kWh/yr)`,
        compute: (inputs) => {
          const area = parseNum(inputs[`transmissionLoss.${id}.area`]);
          const uValue = parseNum(inputs[`transmissionLoss.${id}.uValue`]);
          const groundCdd = parseNum(inputs["climate.groundFacing.cdd"], 150);
          // Heat gain = Area × U-value × Ground CDD × 24 / 1000
          return (area * uValue * groundCdd * 24) / 1000;
        }
      });
    });

    // ========================================================================
    // SUBTOTALS - Air-Facing (row 91)
    // ========================================================================
    graph.registerNode({
      id: "transmissionLoss.airFacing.totalArea",
      legacyId: "d_91",
      section: "S11",
      classification: "C",
      dependencies: AIR_FACING_COMPONENTS.map(c => `transmissionLoss.${c.id}.area`),
      label: "Air-Facing Total Area (m²)",
      compute: (inputs) => {
        return AIR_FACING_COMPONENTS.reduce((sum, c) => {
          return sum + parseNum(inputs[`transmissionLoss.${c.id}.area`]);
        }, 0);
      }
    });

    graph.registerNode({
      id: "transmissionLoss.airFacing.totalHeatLoss",
      legacyId: "i_91",
      section: "S11",
      classification: "C",
      dependencies: AIR_FACING_COMPONENTS.map(c => `transmissionLoss.${c.id}.heatLoss`),
      label: "Air-Facing Total Heat Loss (kWh/yr)",
      compute: (inputs) => {
        return AIR_FACING_COMPONENTS.reduce((sum, c) => {
          return sum + parseNum(inputs[`transmissionLoss.${c.id}.heatLoss`]);
        }, 0);
      }
    });

    graph.registerNode({
      id: "transmissionLoss.airFacing.totalHeatGain",
      legacyId: "k_91",
      section: "S11",
      classification: "C",
      dependencies: AIR_FACING_COMPONENTS.map(c => `transmissionLoss.${c.id}.heatGain`),
      label: "Air-Facing Total Heat Gain (kWh/yr)",
      compute: (inputs) => {
        return AIR_FACING_COMPONENTS.reduce((sum, c) => {
          return sum + parseNum(inputs[`transmissionLoss.${c.id}.heatGain`]);
        }, 0);
      }
    });

    // Weighted U-value for air-facing
    graph.registerNode({
      id: "transmissionLoss.airFacing.weightedUValue",
      legacyId: "g_91",
      section: "S11",
      classification: "C",
      dependencies: [
        ...AIR_FACING_COMPONENTS.map(c => `transmissionLoss.${c.id}.area`),
        ...AIR_FACING_COMPONENTS.map(c => `transmissionLoss.${c.id}.uValue`),
        "transmissionLoss.airFacing.totalArea"
      ],
      label: "Air-Facing Weighted U-Value (W/m²K)",
      compute: (inputs) => {
        const totalArea = parseNum(inputs["transmissionLoss.airFacing.totalArea"]);
        if (totalArea === 0) return 0;

        const weightedSum = AIR_FACING_COMPONENTS.reduce((sum, c) => {
          const area = parseNum(inputs[`transmissionLoss.${c.id}.area`]);
          const uValue = parseNum(inputs[`transmissionLoss.${c.id}.uValue`]);
          return sum + (area * uValue);
        }, 0);

        return weightedSum / totalArea;
      }
    });

    // ========================================================================
    // SUBTOTALS - Ground-Facing (row 95)
    // ========================================================================
    graph.registerNode({
      id: "transmissionLoss.groundFacing.totalArea",
      legacyId: "d_95",
      section: "S11",
      classification: "C",
      dependencies: GROUND_FACING_COMPONENTS.map(c => `transmissionLoss.${c.id}.area`),
      label: "Ground-Facing Total Area (m²)",
      compute: (inputs) => {
        return GROUND_FACING_COMPONENTS.reduce((sum, c) => {
          return sum + parseNum(inputs[`transmissionLoss.${c.id}.area`]);
        }, 0);
      }
    });

    graph.registerNode({
      id: "transmissionLoss.groundFacing.totalHeatLoss",
      legacyId: "i_95",
      section: "S11",
      classification: "C",
      dependencies: GROUND_FACING_COMPONENTS.map(c => `transmissionLoss.${c.id}.heatLoss`),
      label: "Ground-Facing Total Heat Loss (kWh/yr)",
      compute: (inputs) => {
        return GROUND_FACING_COMPONENTS.reduce((sum, c) => {
          return sum + parseNum(inputs[`transmissionLoss.${c.id}.heatLoss`]);
        }, 0);
      }
    });

    graph.registerNode({
      id: "transmissionLoss.groundFacing.totalHeatGain",
      legacyId: "k_95",
      section: "S11",
      classification: "C",
      dependencies: GROUND_FACING_COMPONENTS.map(c => `transmissionLoss.${c.id}.heatGain`),
      label: "Ground-Facing Total Heat Gain (kWh/yr)",
      compute: (inputs) => {
        return GROUND_FACING_COMPONENTS.reduce((sum, c) => {
          return sum + parseNum(inputs[`transmissionLoss.${c.id}.heatGain`]);
        }, 0);
      }
    });

    // ========================================================================
    // THERMAL BRIDGE PENALTY (row 96)
    // ========================================================================
    graph.registerNode({
      id: "transmissionLoss.thermalBridge.heatLoss",
      legacyId: "i_96",
      section: "S11",
      classification: "C",
      dependencies: [
        "transmissionLoss.airFacing.totalHeatLoss",
        "transmissionLoss.groundFacing.totalHeatLoss",
        "transmissionLoss.thermalBridgePenalty"
      ],
      label: "Thermal Bridge Heat Loss (kWh/yr)",
      compute: (inputs) => {
        const airLoss = parseNum(inputs["transmissionLoss.airFacing.totalHeatLoss"]);
        const groundLoss = parseNum(inputs["transmissionLoss.groundFacing.totalHeatLoss"]);
        const penalty = parseNum(inputs["transmissionLoss.thermalBridgePenalty"], 5) / 100;
        return (airLoss + groundLoss) * penalty;
      }
    });

    graph.registerNode({
      id: "transmissionLoss.thermalBridge.heatGain",
      legacyId: "k_96",
      section: "S11",
      classification: "C",
      dependencies: [
        "transmissionLoss.airFacing.totalHeatGain",
        "transmissionLoss.groundFacing.totalHeatGain",
        "transmissionLoss.thermalBridgePenalty"
      ],
      label: "Thermal Bridge Heat Gain (kWh/yr)",
      compute: (inputs) => {
        const airGain = parseNum(inputs["transmissionLoss.airFacing.totalHeatGain"]);
        const groundGain = parseNum(inputs["transmissionLoss.groundFacing.totalHeatGain"]);
        const penalty = parseNum(inputs["transmissionLoss.thermalBridgePenalty"], 5) / 100;
        return (airGain + groundGain) * penalty;
      }
    });

    // ========================================================================
    // GRAND TOTALS (row 97)
    // ========================================================================
    graph.registerNode({
      id: "transmissionLoss.total.area",
      legacyId: "d_97",
      section: "S11",
      classification: "C",
      dependencies: [
        "transmissionLoss.airFacing.totalArea",
        "transmissionLoss.groundFacing.totalArea"
      ],
      label: "Total Envelope Area (m²)",
      compute: (inputs) => {
        return parseNum(inputs["transmissionLoss.airFacing.totalArea"]) +
               parseNum(inputs["transmissionLoss.groundFacing.totalArea"]);
      }
    });

    graph.registerNode({
      id: "transmissionLoss.total.heatLoss",
      legacyId: "i_97",
      section: "S11",
      classification: "C",
      dependencies: [
        "transmissionLoss.airFacing.totalHeatLoss",
        "transmissionLoss.groundFacing.totalHeatLoss",
        "transmissionLoss.thermalBridge.heatLoss"
      ],
      label: "Total Heat Loss (kWh/yr)",
      compute: (inputs) => {
        return parseNum(inputs["transmissionLoss.airFacing.totalHeatLoss"]) +
               parseNum(inputs["transmissionLoss.groundFacing.totalHeatLoss"]) +
               parseNum(inputs["transmissionLoss.thermalBridge.heatLoss"]);
      }
    });

    graph.registerNode({
      id: "transmissionLoss.total.heatGain",
      legacyId: "k_97",
      section: "S11",
      classification: "C",
      dependencies: [
        "transmissionLoss.airFacing.totalHeatGain",
        "transmissionLoss.groundFacing.totalHeatGain",
        "transmissionLoss.thermalBridge.heatGain"
      ],
      label: "Total Heat Gain (kWh/yr)",
      compute: (inputs) => {
        return parseNum(inputs["transmissionLoss.airFacing.totalHeatGain"]) +
               parseNum(inputs["transmissionLoss.groundFacing.totalHeatGain"]) +
               parseNum(inputs["transmissionLoss.thermalBridge.heatGain"]);
      }
    });

    // ========================================================================
    // PERCENTAGES (j columns for each component)
    // ========================================================================
    ALL_COMPONENTS.forEach(({ row, id, label }) => {
      graph.registerNode({
        id: `transmissionLoss.${id}.heatLossPercent`,
        legacyId: `j_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [`transmissionLoss.${id}.heatLoss`, "transmissionLoss.total.heatLoss"],
        label: `${label} Heat Loss %`,
        compute: (inputs) => {
          const componentLoss = parseNum(inputs[`transmissionLoss.${id}.heatLoss`]);
          const totalLoss = parseNum(inputs["transmissionLoss.total.heatLoss"]);
          return totalLoss > 0 ? componentLoss / totalLoss : 0;
        }
      });

      graph.registerNode({
        id: `transmissionLoss.${id}.heatGainPercent`,
        legacyId: `l_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [`transmissionLoss.${id}.heatGain`, "transmissionLoss.total.heatGain"],
        label: `${label} Heat Gain %`,
        compute: (inputs) => {
          const componentGain = parseNum(inputs[`transmissionLoss.${id}.heatGain`]);
          const totalGain = parseNum(inputs["transmissionLoss.total.heatGain"]);
          return totalGain > 0 ? componentGain / totalGain : 0;
        }
      });
    });

    // ========================================================================
    // HEAT LOSS/GAIN INTENSITIES
    // ========================================================================
    graph.registerNode({
      id: "transmissionLoss.intensity.heatLoss",
      legacyId: "i_98",
      section: "S11",
      classification: "C",
      dependencies: ["transmissionLoss.total.heatLoss", "building.conditionedFloorArea"],
      label: "Heat Loss Intensity (kWh/m²/yr)",
      compute: (inputs) => {
        const totalLoss = parseNum(inputs["transmissionLoss.total.heatLoss"]);
        const area = parseNum(inputs["building.conditionedFloorArea"], 1);
        return area > 0 ? totalLoss / area : 0;
      }
    });

    graph.registerNode({
      id: "transmissionLoss.intensity.heatGain",
      legacyId: "k_98",
      section: "S11",
      classification: "C",
      dependencies: ["transmissionLoss.total.heatGain", "building.conditionedFloorArea"],
      label: "Heat Gain Intensity (kWh/m²/yr)",
      compute: (inputs) => {
        const totalGain = parseNum(inputs["transmissionLoss.total.heatGain"]);
        const area = parseNum(inputs["building.conditionedFloorArea"], 1);
        return area > 0 ? totalGain / area : 0;
      }
    });

    console.log("[TransmissionLossNodes] Registered", inputs.length, "inputs");
  }

  window.TEUI.ComputationNodes.TransmissionLoss = { register, AIR_FACING_COMPONENTS, GROUND_FACING_COMPONENTS };
  console.log("[TransmissionLossNodes] Module loaded");
})();
