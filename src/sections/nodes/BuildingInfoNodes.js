/**
 * BuildingInfoNodes.js - Building Information Inputs (Section 02)
 *
 * Part of the Multi-Model Architecture refactoring
 * See: docs/REFACTORING_PLAN.md
 *
 * S02 provides base inputs that all other sections depend on:
 * - Conditioned floor area (h_15)
 * - Service life (h_13)
 * - Reference standard (d_13)
 * - Actual/Target mode (d_14)
 * - Carbon standard (d_15)
 * - Major occupancy (d_12)
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  // Carbon targets by standard (kgCO2e/m²)
  const CARBON_TARGETS = {
    "Self Reported": null,
    "LEED BD+C v4.1": 500,
    "LEED BD+C v4.1 (40%)": 300,
    "Zero Carbon Building": 250,
    "Passive House": 200,
    "CaGBC Zero Carbon": 175,
  };

  /**
   * Register all Building Info nodes with the computation graph
   * @param {ComputationGraph} graph
   */
  function register(graph) {
    // ========================================================================
    // INPUT NODES - User editable values
    // ========================================================================

    const inputs = [
      {
        id: "building.conditionedFloorArea",
        legacyId: "h_15",
        section: "S02",
        classification: "G", // Geometry - shared across models
        label: "Conditioned Floor Area (m²)",
        defaultValue: 1427.2,
        validation: { min: 1, max: 1000000 },
      },
      {
        id: "building.serviceLife",
        legacyId: "h_13",
        section: "S02",
        classification: "A", // Model-specific
        label: "Service Life (years)",
        defaultValue: 50,
        validation: { min: 1, max: 100 },
      },
      {
        id: "building.numStoreys",
        legacyId: "d_16_storeys", // Note: different from embodied carbon d_16
        section: "S02",
        classification: "G",
        label: "Number of Storeys",
        defaultValue: 2,
        validation: { min: 1, max: 100 },
      },
      {
        id: "building.ceilingHeight",
        legacyId: "h_17",
        section: "S02",
        classification: "G",
        label: "Ceiling Height (m)",
        defaultValue: 2.7,
        validation: { min: 2, max: 10 },
      },
      {
        id: "building.majorOccupancy",
        legacyId: "d_12",
        section: "S02",
        classification: "A",
        label: "Major Occupancy",
        defaultValue: "A-Assembly",
      },
      {
        id: "building.referenceStandard",
        legacyId: "d_13",
        section: "S02",
        classification: "A",
        label: "Reference Standard",
        defaultValue: "OBC SB10 5.5-6 Z6",
      },
      {
        id: "building.analysisMode",
        legacyId: "d_14",
        section: "S02",
        classification: "A",
        label: "Analysis Mode (Utility Bills / Target)",
        defaultValue: "Utility Bills",
      },
      {
        id: "building.carbonStandard",
        legacyId: "d_15",
        section: "S02",
        classification: "A",
        label: "Carbon Benchmarking Standard",
        defaultValue: "Self Reported",
      },
    ];

    // Register all inputs
    graph.registerInputs(inputs);

    // ========================================================================
    // COMPUTED NODES
    // ========================================================================

    // Embodied Carbon Target (based on carbon standard selection)
    graph.registerNode({
      id: "building.embodiedCarbonTarget",
      legacyId: "d_16",
      section: "S02",
      classification: "C",
      dependencies: ["building.carbonStandard"],
      label: "Embodied Carbon Target (kgCO2e/m²)",
      compute: (inputs) => {
        const standard = inputs["building.carbonStandard"] || "Self Reported";
        const target = CARBON_TARGETS[standard];
        return target !== null ? target : 345.82; // Default for Self Reported
      },
    });

    // Building Volume
    graph.registerNode({
      id: "building.volume",
      section: "S02",
      classification: "G",
      dependencies: [
        "building.conditionedFloorArea",
        "building.ceilingHeight",
      ],
      label: "Building Volume (m³)",
      compute: (inputs) => {
        const area = parseFloat(inputs["building.conditionedFloorArea"]) || 0;
        const height = parseFloat(inputs["building.ceilingHeight"]) || 2.7;
        return area * height;
      },
    });

    // Floor Area per Storey
    graph.registerNode({
      id: "building.floorAreaPerStorey",
      section: "S02",
      classification: "G",
      dependencies: [
        "building.conditionedFloorArea",
        "building.numStoreys",
      ],
      label: "Floor Area per Storey (m²)",
      compute: (inputs) => {
        const area = parseFloat(inputs["building.conditionedFloorArea"]) || 0;
        const storeys = parseFloat(inputs["building.numStoreys"]) || 1;
        return storeys > 0 ? area / storeys : area;
      },
    });

    // Is Target Mode (boolean for conditional logic)
    graph.registerNode({
      id: "building.isTargetMode",
      section: "S02",
      classification: "A",
      dependencies: ["building.analysisMode"],
      label: "Is Target Mode",
      compute: (inputs) => {
        const mode = inputs["building.analysisMode"] || "Utility Bills";
        return mode !== "Utility Bills";
      },
    });

    console.log("[BuildingInfoNodes] Registered", inputs.length, "inputs");
  }

  // Export
  window.TEUI.ComputationNodes.BuildingInfo = {
    register,
    CARBON_TARGETS,
  };

  console.log("[BuildingInfoNodes] Module loaded");
})();
