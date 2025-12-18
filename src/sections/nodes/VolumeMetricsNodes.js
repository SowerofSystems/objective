/**
 * VolumeMetricsNodes.js - Building Volume & Surface Metrics (Section 12)
 *
 * Calculates volume and surface area metrics:
 * - Conditioned volume
 * - Surface-to-volume ratio
 * - Window-to-wall ratio (WWR)
 * - Air changes per hour (ACH50)
 * - N-factor for air leakage
 * - Air leakage heat loss
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
      // Volume inputs
      { id: "volume.ceilingHeight", legacyId: "d_100", section: "S12", classification: "C", label: "Ceiling Height (m)", defaultValue: 2.7 },
      { id: "volume.numStoreys", legacyId: "d_99", section: "S12", classification: "C", label: "Number of Storeys", defaultValue: 2 },

      // Air tightness inputs
      { id: "airTightness.ach50", legacyId: "d_103", section: "S12", classification: "C", label: "ACH50 (air changes/hour @ 50Pa)", defaultValue: 3.0 },
      { id: "airTightness.method", legacyId: "d_106", section: "S12", classification: "C", label: "Air Leakage Calculation Method", defaultValue: "LBL" },
    ];

    graph.registerInputs(inputs);

    // ========================================================================
    // VOLUME CALCULATIONS
    // ========================================================================

    // Conditioned volume
    graph.registerNode({
      id: "volume.conditioned",
      legacyId: "d_101",
      section: "S12",
      classification: "C",
      dependencies: ["building.conditionedFloorArea", "volume.ceilingHeight"],
      label: "Conditioned Volume (m³)",
      compute: (inputs) => {
        const area = parseNum(inputs["building.conditionedFloorArea"]);
        const height = parseNum(inputs["volume.ceilingHeight"], 2.7);
        return area * height;
      }
    });

    // Floor area per storey
    graph.registerNode({
      id: "volume.floorAreaPerStorey",
      legacyId: "e_101",
      section: "S12",
      classification: "C",
      dependencies: ["building.conditionedFloorArea", "volume.numStoreys"],
      label: "Floor Area per Storey (m²)",
      compute: (inputs) => {
        const area = parseNum(inputs["building.conditionedFloorArea"]);
        const storeys = parseNum(inputs["volume.numStoreys"], 1);
        return storeys > 0 ? area / storeys : area;
      }
    });

    // Total envelope area (from S11)
    graph.registerNode({
      id: "volume.envelopeArea",
      legacyId: "d_102",
      section: "S12",
      classification: "C",
      dependencies: ["transmissionLoss.total.area"],
      label: "Total Envelope Area (m²)",
      compute: (inputs) => {
        return parseNum(inputs["transmissionLoss.total.area"]);
      }
    });

    // Surface to volume ratio
    graph.registerNode({
      id: "volume.surfaceToVolumeRatio",
      legacyId: "e_102",
      section: "S12",
      classification: "C",
      dependencies: ["volume.envelopeArea", "volume.conditioned"],
      label: "Surface to Volume Ratio",
      compute: (inputs) => {
        const surface = parseNum(inputs["volume.envelopeArea"]);
        const volume = parseNum(inputs["volume.conditioned"], 1);
        return volume > 0 ? surface / volume : 0;
      }
    });

    // ========================================================================
    // WINDOW-TO-WALL RATIO (WWR)
    // ========================================================================

    // Total glazing area (windows + skylights)
    graph.registerNode({
      id: "volume.glazingArea",
      legacyId: "f_102",
      section: "S12",
      classification: "C",
      dependencies: [
        "transmissionLoss.windows.area",
        "transmissionLoss.skylights.area"
      ],
      label: "Total Glazing Area (m²)",
      compute: (inputs) => {
        const windows = parseNum(inputs["transmissionLoss.windows.area"]);
        const skylights = parseNum(inputs["transmissionLoss.skylights.area"]);
        return windows + skylights;
      }
    });

    // Wall area (above grade only)
    graph.registerNode({
      id: "volume.wallArea",
      legacyId: "g_102",
      section: "S12",
      classification: "C",
      dependencies: ["transmissionLoss.walls.area"],
      label: "Wall Area (m²)",
      compute: (inputs) => {
        return parseNum(inputs["transmissionLoss.walls.area"]);
      }
    });

    // Window-to-wall ratio
    graph.registerNode({
      id: "volume.wwr",
      legacyId: "h_102",
      section: "S12",
      classification: "C",
      dependencies: ["volume.glazingArea", "volume.wallArea"],
      label: "Window-to-Wall Ratio (%)",
      compute: (inputs) => {
        const glazing = parseNum(inputs["volume.glazingArea"]);
        const wall = parseNum(inputs["volume.wallArea"], 1);
        return wall > 0 ? (glazing / wall) * 100 : 0;
      }
    });

    // ========================================================================
    // AIR LEAKAGE / INFILTRATION
    // ========================================================================

    // N-factor (climate-dependent infiltration factor)
    graph.registerNode({
      id: "airTightness.nFactor",
      legacyId: "d_105",
      section: "S12",
      classification: "C",
      dependencies: ["climate.zone", "volume.numStoreys"],
      label: "N-Factor",
      compute: (inputs) => {
        const climateZone = parseNum(inputs["climate.zone"], 6);
        const storeys = parseNum(inputs["volume.numStoreys"], 2);

        // N-factor lookup table based on climate zone and building height
        // Values from ASHRAE/building science research
        const nFactors = {
          1: { 1: 18, 2: 16, 3: 14 },
          2: { 1: 17, 2: 15, 3: 13 },
          3: { 1: 16, 2: 14, 3: 12 },
          4: { 1: 15, 2: 13, 3: 11 },
          5: { 1: 14, 2: 12, 3: 10 },
          6: { 1: 13, 2: 11, 3: 9 },
          7: { 1: 12, 2: 10, 3: 8 },
          8: { 1: 11, 2: 9, 3: 7 }
        };

        const zoneKey = Math.min(8, Math.max(1, Math.round(climateZone)));
        const storeysKey = Math.min(3, Math.max(1, storeys));

        return nFactors[zoneKey]?.[storeysKey] || 13;
      }
    });

    // Air leakage rate (ACH natural)
    graph.registerNode({
      id: "airTightness.achNatural",
      legacyId: "e_103",
      section: "S12",
      classification: "C",
      dependencies: ["airTightness.ach50", "airTightness.nFactor"],
      label: "Natural Air Changes (ACH)",
      compute: (inputs) => {
        const ach50 = parseNum(inputs["airTightness.ach50"], 3);
        const nFactor = parseNum(inputs["airTightness.nFactor"], 13);
        // ACH natural = ACH50 / N-factor
        return nFactor > 0 ? ach50 / nFactor : 0;
      }
    });

    // Air leakage volume rate
    graph.registerNode({
      id: "airTightness.leakageRate",
      legacyId: "f_103",
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

    // Air leakage heat loss
    graph.registerNode({
      id: "airTightness.heatLoss",
      legacyId: "i_106",
      section: "S12",
      classification: "C",
      dependencies: [
        "airTightness.leakageRate",
        "climate.heating.degreedays"
      ],
      label: "Air Leakage Heat Loss (kWh/yr)",
      compute: (inputs) => {
        const leakageRate = parseNum(inputs["airTightness.leakageRate"]);
        const hdd = parseNum(inputs["climate.heating.degreedays"], 4000);
        // Heat loss = Volume rate × 0.34 (air heat capacity) × HDD × 24 / 1000
        const airHeatCapacity = 0.34; // W·h/m³·K
        return (leakageRate * airHeatCapacity * hdd * 24) / 1000;
      }
    });

    // Air leakage heat gain (cooling season)
    graph.registerNode({
      id: "airTightness.heatGain",
      legacyId: "k_106",
      section: "S12",
      classification: "C",
      dependencies: [
        "airTightness.leakageRate",
        "climate.cooling.degreedays"
      ],
      label: "Air Leakage Heat Gain (kWh/yr)",
      compute: (inputs) => {
        const leakageRate = parseNum(inputs["airTightness.leakageRate"]);
        const cdd = parseNum(inputs["climate.cooling.degreedays"], 300);
        const airHeatCapacity = 0.34;
        return (leakageRate * airHeatCapacity * cdd * 24) / 1000;
      }
    });

    // ========================================================================
    // COMBINED ENVELOPE METRICS
    // ========================================================================

    // Combined weighted U-value (all components)
    graph.registerNode({
      id: "volume.combinedUValue",
      legacyId: "g_97",
      section: "S12",
      classification: "C",
      dependencies: [
        "transmissionLoss.airFacing.weightedUValue",
        "transmissionLoss.airFacing.totalArea",
        "transmissionLoss.groundFacing.totalArea"
      ],
      label: "Combined Envelope U-Value (W/m²K)",
      compute: (inputs) => {
        // Simplified - uses air-facing weighted U-value as primary metric
        // Ground-facing typically has much lower contribution
        return parseNum(inputs["transmissionLoss.airFacing.weightedUValue"]);
      }
    });

    // Ae10 (envelope area per 10m² floor area)
    graph.registerNode({
      id: "volume.ae10",
      legacyId: "h_101",
      section: "S12",
      classification: "C",
      dependencies: ["volume.envelopeArea", "building.conditionedFloorArea"],
      label: "Ae10 (Envelope per 10m² floor)",
      compute: (inputs) => {
        const envelope = parseNum(inputs["volume.envelopeArea"]);
        const floor = parseNum(inputs["building.conditionedFloorArea"], 1);
        return floor > 0 ? (envelope / floor) * 10 : 0;
      }
    });

    console.log("[VolumeMetricsNodes] Registered", inputs.length, "inputs");
  }

  window.TEUI.ComputationNodes.VolumeMetrics = { register };
  console.log("[VolumeMetricsNodes] Module loaded");
})();
