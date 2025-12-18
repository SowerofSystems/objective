/**
 * ForestryNodes.js - Wood Emissions Offset (Section 08)
 *
 * d_60: Wood offset (MT/yr) used in S04 Row 32 emissions calculations
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  function register(graph) {
    const inputs = [
      { id: "forestry.woodVolume", legacyId: "d_57", section: "S08", classification: "C", label: "Wood Volume (m³)", defaultValue: 0 },
      { id: "forestry.woodDensity", legacyId: "h_57", section: "S08", classification: "C", label: "Wood Density (kg/m³)", defaultValue: 500 },
      { id: "forestry.carbonFraction", legacyId: "d_58", section: "S08", classification: "C", label: "Carbon Fraction", defaultValue: 0.5 },
    ];

    graph.registerInputs(inputs);

    // Wood carbon storage calculation
    graph.registerNode({
      id: "forestry.carbonStorage",
      legacyId: "d_59",
      section: "S08",
      classification: "C",
      dependencies: ["forestry.woodVolume", "forestry.woodDensity", "forestry.carbonFraction"],
      label: "Carbon Storage (kg CO2)",
      compute: (inputs) => {
        const volume = parseFloat(inputs["forestry.woodVolume"]) || 0;
        const density = parseFloat(inputs["forestry.woodDensity"]) || 500;
        const fraction = parseFloat(inputs["forestry.carbonFraction"]) || 0.5;
        // Carbon storage = volume * density * carbon fraction * 3.67 (CO2/C ratio)
        return volume * density * fraction * 3.67;
      },
    });

    // Annual wood offset (divided by service life)
    graph.registerNode({
      id: "forestry.annualOffset",
      legacyId: "d_60",
      section: "S08",
      classification: "C",
      dependencies: ["forestry.carbonStorage", "building.serviceLife"],
      label: "Annual Wood Offset (MT CO2/yr)",
      compute: (inputs) => {
        const storage = parseFloat(inputs["forestry.carbonStorage"]) || 0;
        const serviceLife = parseFloat(inputs["building.serviceLife"]) || 50;
        return serviceLife > 0 ? storage / serviceLife / 1000 : 0; // Convert kg to MT
      },
    });

    console.log("[ForestryNodes] Registered", inputs.length, "inputs");
  }

  window.TEUI.ComputationNodes.Forestry = { register };
  console.log("[ForestryNodes] Module loaded");
})();
