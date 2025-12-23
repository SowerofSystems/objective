/**
 * VolumeMetricsNodes.js - Building Volume & Surface Metrics (Section 12)
 *
 * Calculates envelope areas, heat loss rates, and totals per Section12.js formulas:
 * - d_101 = Total Air-Facing Area (Ae) = SUM(d_85:d_93)
 * - d_102 = Total Ground-Facing Area (Ag) = SUM(d_94:d_95)
 * - g_101 = Weighted U-Value for Ae
 * - h_101 = Heat Loss Rate per m² (Ae) = (g_101 × HDD × 24) / 1000
 * - i_101 = Total Heat Loss (Ae) = h_101 × d_101
 * - i_102 = Total Heat Loss (Ag) = h_102 × d_102
 * - i_103 = Air Leakage Heat Loss
 * - i_104 = Total Envelope Heat Loss = i_101 + i_102 + i_103
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
    const inputs = [
      // Volume inputs
      { id: "volume.ceilingHeight", legacyId: "d_100", section: "S12", classification: "C", label: "Ceiling Height (m)", defaultValue: 2.7 },
      { id: "volume.numStoreys", legacyId: "d_99", section: "S12", classification: "C", label: "Number of Storeys", defaultValue: 2 },

      // Air tightness inputs
      { id: "airTightness.ach50", legacyId: "d_103", section: "S12", classification: "C", label: "ACH50 (air changes/hour @ 50Pa)", defaultValue: 3.0 },
      { id: "airTightness.nFactor", legacyId: "g_110", section: "S12", classification: "C", label: "N-Factor", defaultValue: 13 },

      // Conditioned volume (user input or from S02)
      { id: "volume.conditioned", legacyId: "d_105", section: "S12", classification: "C", label: "Conditioned Volume (m³)", defaultValue: 0 },
    ];

    graph.registerInputs(inputs);

    // ========================================================================
    // ENVELOPE AREA TOTALS (Row 101, 102)
    // From Section12.js line 1697: d_101 = sum of air-facing component areas
    // ========================================================================

    // d_101: Total Air-Facing Area (Ae) - uses d_91 from TransmissionLossNodes
    graph.registerNode({
      id: "envelope.airFacing.area",
      legacyId: "d_101",
      section: "S12",
      classification: "C",
      dependencies: ["transmissionLoss.airFacing.totalArea"],
      label: "Total Air-Facing Envelope Area (Ae) (m²)",
      compute: (inputs) => {
        // d_101 = sum of air-facing component areas from S11
        return parseNum(inputs["transmissionLoss.airFacing.totalArea"]);
      }
    });

    // d_102: Total Ground-Facing Area (Ag) - uses d_95 from TransmissionLossNodes
    graph.registerNode({
      id: "envelope.groundFacing.area",
      legacyId: "d_102",
      section: "S12",
      classification: "C",
      dependencies: ["transmissionLoss.groundFacing.totalArea"],
      label: "Total Ground-Facing Envelope Area (Ag) (m²)",
      compute: (inputs) => {
        // d_102 = sum of ground-facing component areas from S11
        return parseNum(inputs["transmissionLoss.groundFacing.totalArea"]);
      }
    });

    // d_104: Total Envelope Area
    graph.registerNode({
      id: "envelope.total.area",
      legacyId: "d_104",
      section: "S12",
      classification: "C",
      dependencies: ["envelope.airFacing.area", "envelope.groundFacing.area"],
      label: "Total Envelope Area (m²)",
      compute: (inputs) => {
        return parseNum(inputs["envelope.airFacing.area"]) +
               parseNum(inputs["envelope.groundFacing.area"]);
      }
    });

    // ========================================================================
    // WEIGHTED U-VALUES (Row 101, 102)
    // From Section12.js calculateCombinedUValue function
    // ========================================================================

    // g_101: Weighted U-Value for Air-Facing Envelope
    graph.registerNode({
      id: "envelope.airFacing.uValue",
      legacyId: "g_101",
      section: "S12",
      classification: "C",
      dependencies: ["transmissionLoss.airFacing.weightedUValue"],
      label: "Weighted U-Value for Air-Facing (W/m²K)",
      compute: (inputs) => {
        return parseNum(inputs["transmissionLoss.airFacing.weightedUValue"]);
      }
    });

    // g_102: Weighted U-Value for Ground-Facing Envelope
    // Note: Ground-facing components typically have different U-values
    // Includes thermal bridge penalty factor as per legacy Section12.js formula
    graph.registerNode({
      id: "envelope.groundFacing.uValue",
      legacyId: "g_102",
      section: "S12",
      classification: "C",
      dependencies: [
        "transmissionLoss.wallsBelowGrade.area",
        "transmissionLoss.wallsBelowGrade.uValue",
        "transmissionLoss.slabOnGrade.area",
        "transmissionLoss.slabOnGrade.uValue",
        "transmissionLoss.groundFacing.totalArea",
        "transmissionLoss.thermalBridgePenalty"
      ],
      label: "Weighted U-Value for Ground-Facing (W/m²K)",
      compute: (inputs) => {
        const totalArea = parseNum(inputs["transmissionLoss.groundFacing.totalArea"], 1);
        if (totalArea === 0) return 0;

        // Weighted average of ground-facing component U-values
        const wallsArea = parseNum(inputs["transmissionLoss.wallsBelowGrade.area"]);
        const wallsU = parseNum(inputs["transmissionLoss.wallsBelowGrade.uValue"]);
        const slabOnArea = parseNum(inputs["transmissionLoss.slabOnGrade.area"]);
        const slabOnU = parseNum(inputs["transmissionLoss.slabOnGrade.uValue"]);

        const weightedSum = (wallsArea * wallsU) + (slabOnArea * slabOnU);

        // Include thermal bridge penalty factor: g_102 = weighted_avg × (1 + d_97/100)
        const penaltyPercent = parseNum(inputs["transmissionLoss.thermalBridgePenalty"], 5);
        const tbFactor = 1 + penaltyPercent / 100;
        return (weightedSum / totalArea) * tbFactor;
      }
    });

    // ========================================================================
    // HEAT LOSS RATES (Row 101, 102)
    // From Section12.js line 2556: h_101 = (g_101 × HDD × 24) / 1000
    // ========================================================================

    // h_101: Heat Loss Rate per m² (Air-Facing)
    graph.registerNode({
      id: "envelope.airFacing.heatLossRate",
      legacyId: "h_101",
      section: "S12",
      classification: "C",
      dependencies: ["envelope.airFacing.uValue", "climate.heating.degreedays"],
      label: "Heat Loss Rate (Ae) (kWh/m²/yr)",
      compute: (inputs) => {
        const hdd = inputs["climate.heating.degreedays"];
        if (isUnavailable(hdd)) return "Unavailable";
        // h_101 = (g_101 × HDD × 24) / 1000
        const uValue = parseNum(inputs["envelope.airFacing.uValue"]);
        return (uValue * parseNum(hdd) * 24) / 1000;
      }
    });

    // h_102: Heat Loss Rate per m² (Ground-Facing)
    graph.registerNode({
      id: "envelope.groundFacing.heatLossRate",
      legacyId: "h_102",
      section: "S12",
      classification: "C",
      dependencies: ["envelope.groundFacing.uValue", "climate.groundFacing.hdd"],
      label: "Heat Loss Rate (Ag) (kWh/m²/yr)",
      compute: (inputs) => {
        const groundHdd = inputs["climate.groundFacing.hdd"];
        if (isUnavailable(groundHdd)) return "Unavailable";
        // h_102 = (g_102 × Ground HDD × 24) / 1000
        const uValue = parseNum(inputs["envelope.groundFacing.uValue"]);
        return (uValue * parseNum(groundHdd) * 24) / 1000;
      }
    });

    // ========================================================================
    // ENVELOPE HEAT LOSSES (Row 101, 102)
    // From Section12.js line 2557: i_101 = h_101 × d_101
    // ========================================================================

    // i_101: Total Heat Loss (Air-Facing)
    graph.registerNode({
      id: "envelope.airFacing.totalHeatLoss",
      legacyId: "i_101",
      section: "S12",
      classification: "C",
      dependencies: ["envelope.airFacing.heatLossRate", "envelope.airFacing.area"],
      label: "Total Heat Loss (Ae) (kWh/yr)",
      compute: (inputs) => {
        // i_101 = h_101 × d_101
        const rate = parseNum(inputs["envelope.airFacing.heatLossRate"]);
        const area = parseNum(inputs["envelope.airFacing.area"]);
        return rate * area;
      }
    });

    // i_102: Total Heat Loss (Ground-Facing)
    graph.registerNode({
      id: "envelope.groundFacing.totalHeatLoss",
      legacyId: "i_102",
      section: "S12",
      classification: "C",
      dependencies: ["envelope.groundFacing.heatLossRate", "envelope.groundFacing.area"],
      label: "Total Heat Loss (Ag) (kWh/yr)",
      compute: (inputs) => {
        // i_102 = h_102 × d_102
        const rate = parseNum(inputs["envelope.groundFacing.heatLossRate"]);
        const area = parseNum(inputs["envelope.groundFacing.area"]);
        return rate * area;
      }
    });

    // ========================================================================
    // AIR LEAKAGE HEAT LOSS (Row 103)
    // From Section12.js line 2498: i_103 = (baseLeakageCoefficient × HDD × 24) / 1000
    // ========================================================================

    // ACH natural = ACH50 / N-factor
    // Note: No legacyId - this is an intermediate computation not stored in legacy system
    graph.registerNode({
      id: "airTightness.achNatural",
      section: "S12",
      classification: "C",
      dependencies: ["airTightness.ach50", "airTightness.nFactor"],
      label: "Natural Air Changes (ACH)",
      compute: (inputs) => {
        const ach50 = parseNum(inputs["airTightness.ach50"], 3);
        const nFactor = parseNum(inputs["airTightness.nFactor"], 13);
        return nFactor > 0 ? ach50 / nFactor : 0;
      }
    });

    // Air leakage volume rate
    // Note: No legacyId - this is an intermediate computation not stored in legacy system
    graph.registerNode({
      id: "airTightness.leakageRate",
      section: "S12",
      classification: "C",
      dependencies: ["airTightness.achNatural", "volume.conditioned"],
      label: "Air Leakage Rate (m³/h)",
      compute: (inputs) => {
        const achNatural = parseNum(inputs["airTightness.achNatural"]);
        const volume = parseNum(inputs["volume.conditioned"]);
        return achNatural * volume;
      }
    });

    // i_103: Air Leakage Heat Loss
    // From Section12.js line 2492-2498: baseLeakageCoefficient × HDD × 24 / 1000
    graph.registerNode({
      id: "airTightness.heatLoss",
      legacyId: "i_103",
      section: "S12",
      classification: "C",
      dependencies: [
        "airTightness.leakageRate",
        "climate.heating.degreedays"
      ],
      label: "Air Leakage Heat Loss (kWh/yr)",
      compute: (inputs) => {
        const hdd = inputs["climate.heating.degreedays"];
        if (isUnavailable(hdd)) return "Unavailable";
        const leakageRate = parseNum(inputs["airTightness.leakageRate"]);
        // Heat loss = Volume rate × 0.34 (air heat capacity Wh/m³K) × HDD × 24 / 1000
        const airHeatCapacity = 0.34;
        return (leakageRate * airHeatCapacity * parseNum(hdd) * 24) / 1000;
      }
    });

    // k_103: Air Leakage Heat Gain (cooling season)
    graph.registerNode({
      id: "airTightness.heatGain",
      legacyId: "k_103",
      section: "S12",
      classification: "C",
      dependencies: [
        "airTightness.leakageRate",
        "climate.cooling.degreedays"
      ],
      label: "Air Leakage Heat Gain (kWh/yr)",
      compute: (inputs) => {
        const cdd = inputs["climate.cooling.degreedays"];
        // Legacy returns 0 when CDD unavailable
        if (isUnavailable(cdd)) return 0;
        const leakageRate = parseNum(inputs["airTightness.leakageRate"]);
        const airHeatCapacity = 0.34;
        return (leakageRate * airHeatCapacity * parseNum(cdd) * 24) / 1000;
      }
    });

    // ========================================================================
    // TOTAL ENVELOPE HEAT LOSS (Row 104)
    // From Section12.js line 2700: i_104 = i_101 + i_102 + i_103
    // ========================================================================

    // i_104: Total Envelope Heat Loss (used in TEUI d_135 calculation)
    graph.registerNode({
      id: "envelope.total.heatLoss",
      legacyId: "i_104",
      section: "S12",
      classification: "C",
      dependencies: [
        "envelope.airFacing.totalHeatLoss",
        "envelope.groundFacing.totalHeatLoss",
        "airTightness.heatLoss"
      ],
      label: "Total Envelope Heat Loss (kWh/yr)",
      compute: (inputs) => {
        // i_104 = i_101 + i_102 + i_103
        const i101 = parseNum(inputs["envelope.airFacing.totalHeatLoss"]);
        const i102 = parseNum(inputs["envelope.groundFacing.totalHeatLoss"]);
        const i103 = parseNum(inputs["airTightness.heatLoss"]);
        return i101 + i102 + i103;
      }
    });

    // k_104: Total Envelope Heat Gain
    graph.registerNode({
      id: "envelope.total.heatGain",
      legacyId: "k_104",
      section: "S12",
      classification: "C",
      dependencies: [
        "transmissionLoss.airFacing.totalHeatGain",
        "transmissionLoss.groundFacing.totalHeatGain",
        "airTightness.heatGain"
      ],
      label: "Total Envelope Heat Gain (kWh/yr)",
      compute: (inputs) => {
        // k_104 = k_101 + k_102 + k_103
        const k101 = parseNum(inputs["transmissionLoss.airFacing.totalHeatGain"]);
        const k102 = parseNum(inputs["transmissionLoss.groundFacing.totalHeatGain"]);
        const k103 = parseNum(inputs["airTightness.heatGain"]);
        return k101 + k102 + k103;
      }
    });

    // ========================================================================
    // COMBINED ENVELOPE METRICS
    // ========================================================================

    // g_104: Combined Weighted U-value
    graph.registerNode({
      id: "envelope.combined.uValue",
      legacyId: "g_104",
      section: "S12",
      classification: "C",
      dependencies: [
        "envelope.airFacing.uValue",
        "envelope.airFacing.area",
        "envelope.groundFacing.uValue",
        "envelope.groundFacing.area"
      ],
      label: "Combined Envelope U-Value (W/m²K)",
      compute: (inputs) => {
        // g_104 = (g_101 × d_101 + g_102 × d_102) / (d_101 + d_102)
        const g101 = parseNum(inputs["envelope.airFacing.uValue"]);
        const d101 = parseNum(inputs["envelope.airFacing.area"]);
        const g102 = parseNum(inputs["envelope.groundFacing.uValue"]);
        const d102 = parseNum(inputs["envelope.groundFacing.area"]);
        const totalArea = d101 + d102 + 0.000001; // Avoid division by zero
        return (g101 * d101 + g102 * d102) / totalArea;
      }
    });

    console.log("[VolumeMetricsNodes] Registered", inputs.length, "inputs");
  }

  window.TEUI.ComputationNodes.VolumeMetrics = { register };
  console.log("[VolumeMetricsNodes] Module loaded");
})();
