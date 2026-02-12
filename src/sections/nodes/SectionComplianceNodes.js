/**
 * SectionComplianceNodes.js - Cross-Model Compliance Display Nodes
 *
 * Extends the compliance pattern from ComplianceNodes.js (S13) to cover
 * M/N column compliance display fields across other sections:
 * - S07: Water heating compliance (m_49, m_50, m_52, m_53)
 * - S09: Internal gains compliance (m_65, m_66, m_67, n_65, n_66, n_67)
 * - S12: Volume metrics compliance (m_104, n_104, m_109, n_109)
 * - S15: GHG reduction percentage (d_145)
 *
 * Pattern (same as ComplianceNodes.js):
 * 1. Register "reference.*" input nodes for Reference model values
 * 2. After both models compute, Reference values are copied to Target's reference.* inputs
 * 3. Compliance ratio nodes depend on both target values and reference.* inputs
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

  // ==========================================================================
  // REFERENCE INPUTS — populated from Reference model after computation
  // ==========================================================================

  const ReferenceInputs = [
    // S07: Water Heating
    { id: "reference.waterHeating.lpppd", legacyId: "ref_h_49", defaultValue: 40, classification: "C", section: "S07", label: "Reference Water Use (L/person/day)" },
    { id: "reference.waterHeating.warmWaterFraction", legacyId: "ref_h_50", defaultValue: 16, classification: "C", section: "S07", label: "Reference Warm Water Fraction" },
    { id: "reference.waterHeating.efficiency", legacyId: "ref_d_52", defaultValue: 300, classification: "C", section: "S07", label: "Reference Water Heating Efficiency (%)" },
    { id: "reference.waterHeating.dwhrEfficiency", legacyId: "ref_d_53", defaultValue: 0, classification: "C", section: "S07", label: "Reference DWHR Efficiency (%)" },

    // S09: Internal Gains
    { id: "reference.internal.plugLoadDensity", legacyId: "ref_d_65", defaultValue: 7, classification: "C", section: "S09", label: "Reference Plug Load Density (W/m²)" },
    { id: "reference.internal.lightingDensity", legacyId: "ref_d_66", defaultValue: 1.5, classification: "C", section: "S09", label: "Reference Lighting Density (W/m²)" },
    { id: "reference.internal.equipmentDensity", legacyId: "ref_d_67", defaultValue: 3, classification: "C", section: "S09", label: "Reference Equipment Density (W/m²)" },

    // S12: Volume Metrics (ACH50 reference for compliance)
    { id: "reference.airTightness.ach50Target", legacyId: "ref_d_109", defaultValue: 1.5, classification: "C", section: "S12", label: "Reference ACH50" },
  ];

  // ==========================================================================
  // COMPLIANCE NODES
  // ==========================================================================

  const ComplianceNodes = [
    // ========================================================================
    // S07: Water Heating Compliance
    // ========================================================================

    // m_49: Water Use compliance (h_49 / ref_h_49) — lower is better
    {
      id: "compliance.waterUse.ratio",
      legacyId: "m_49",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.lpppd", "reference.waterHeating.lpppd"],
      label: "Water Use Compliance Ratio",
      compute: (inputs) => {
        const target = parseNum(inputs["waterHeating.lpppd"]);
        const ref = parseNum(inputs["reference.waterHeating.lpppd"]);
        if (ref > 0) {
          return Math.round((target / ref) * 100) + "%";
        }
        return "0%";
      }
    },

    // m_50: Energy Demand compliance (h_50 / ref_h_50) — lower is better
    {
      id: "compliance.waterEnergy.ratio",
      legacyId: "m_50",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.warmWaterFraction", "reference.waterHeating.warmWaterFraction"],
      label: "Water Energy Compliance Ratio",
      compute: (inputs) => {
        const target = parseNum(inputs["waterHeating.warmWaterFraction"]);
        const ref = parseNum(inputs["reference.waterHeating.warmWaterFraction"]);
        if (ref > 0) {
          return Math.round((target / ref) * 100) + "%";
        }
        return "0%";
      }
    },

    // m_52: Efficiency compliance (d_52 / ref_d_52) — higher is better
    {
      id: "compliance.waterEfficiency.ratio",
      legacyId: "m_52",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.efficiency", "reference.waterHeating.efficiency"],
      label: "Water Heating Efficiency Compliance Ratio",
      compute: (inputs) => {
        const target = parseNum(inputs["waterHeating.efficiency"]);
        const ref = parseNum(inputs["reference.waterHeating.efficiency"]);
        if (ref > 0) {
          return Math.round((target / ref) * 100) + "%";
        }
        return "100%";
      }
    },

    // m_53: DWHR compliance (d_53 / ref_d_53) — higher is better, N/A if no ref
    {
      id: "compliance.waterDWHR.ratio",
      legacyId: "m_53",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.dwhrEfficiency", "reference.waterHeating.dwhrEfficiency"],
      label: "DWHR Compliance Ratio",
      compute: (inputs) => {
        const ref = parseNum(inputs["reference.waterHeating.dwhrEfficiency"]);
        if (ref === 0) return "N/A";
        const target = parseNum(inputs["waterHeating.dwhrEfficiency"]);
        return Math.round((target / ref) * 100) + "%";
      }
    },

    // ========================================================================
    // S09: Internal Gains Compliance
    // ========================================================================

    // m_65: Plug load density compliance (d_65 / ref_d_65) — lower is better
    {
      id: "compliance.plugLoad.ratio",
      legacyId: "m_65",
      section: "S09",
      classification: "C",
      dependencies: ["internal.plugLoadDensity", "reference.internal.plugLoadDensity"],
      label: "Plug Load Compliance Ratio",
      compute: (inputs) => {
        const target = parseNum(inputs["internal.plugLoadDensity"]);
        const ref = parseNum(inputs["reference.internal.plugLoadDensity"]);
        if (ref > 0) {
          return Math.round((target / ref) * 100) + "%";
        }
        return "100%";
      }
    },
    {
      id: "compliance.plugLoad.pass",
      legacyId: "n_65",
      section: "S09",
      classification: "C",
      dependencies: ["internal.plugLoadDensity", "reference.internal.plugLoadDensity"],
      label: "Plug Load Compliance Status",
      compute: (inputs) => {
        const target = parseNum(inputs["internal.plugLoadDensity"]);
        const ref = parseNum(inputs["reference.internal.plugLoadDensity"]);
        return ref > 0 && target / ref <= 1.0 ? "✓" : "✗";
      }
    },

    // m_66: Lighting density compliance (d_66 / ref_d_66) — lower is better
    {
      id: "compliance.lighting.ratio",
      legacyId: "m_66",
      section: "S09",
      classification: "C",
      dependencies: ["internal.lightingDensity", "reference.internal.lightingDensity"],
      label: "Lighting Compliance Ratio",
      compute: (inputs) => {
        const target = parseNum(inputs["internal.lightingDensity"]);
        const ref = parseNum(inputs["reference.internal.lightingDensity"]);
        if (ref > 0) {
          return Math.round((target / ref) * 100) + "%";
        }
        return "100%";
      }
    },
    {
      id: "compliance.lighting.pass",
      legacyId: "n_66",
      section: "S09",
      classification: "C",
      dependencies: ["internal.lightingDensity", "reference.internal.lightingDensity"],
      label: "Lighting Compliance Status",
      compute: (inputs) => {
        const target = parseNum(inputs["internal.lightingDensity"]);
        const ref = parseNum(inputs["reference.internal.lightingDensity"]);
        return ref > 0 && target / ref <= 1.0 ? "✓" : "✗";
      }
    },

    // m_67: Equipment density compliance (d_67 / ref_d_67) — lower is better
    {
      id: "compliance.equipment.ratio",
      legacyId: "m_67",
      section: "S09",
      classification: "C",
      dependencies: ["internal.equipmentDensity", "reference.internal.equipmentDensity"],
      label: "Equipment Compliance Ratio",
      compute: (inputs) => {
        const target = parseNum(inputs["internal.equipmentDensity"]);
        const ref = parseNum(inputs["reference.internal.equipmentDensity"]);
        if (ref > 0) {
          return Math.round((target / ref) * 100) + "%";
        }
        return "100%";
      }
    },
    {
      id: "compliance.equipment.pass",
      legacyId: "n_67",
      section: "S09",
      classification: "C",
      dependencies: ["internal.equipmentDensity", "reference.internal.equipmentDensity"],
      label: "Equipment Compliance Status",
      compute: (inputs) => {
        const target = parseNum(inputs["internal.equipmentDensity"]);
        const ref = parseNum(inputs["reference.internal.equipmentDensity"]);
        return ref > 0 && target / ref <= 1.0 ? "✓" : "✗";
      }
    },

    // ========================================================================
    // S12: Volume Metrics Compliance
    // ========================================================================

    // m_104: Passive House compliance text (based on g_104 U-value)
    {
      id: "compliance.passiveHouse.text",
      legacyId: "m_104",
      section: "S12",
      classification: "C",
      dependencies: ["envelope.combined.uValue"],
      label: "Passive House Compliance Level",
      compute: (inputs) => {
        const g104 = parseNum(inputs["envelope.combined.uValue"]);
        if (g104 < 0.15) return "PH level";
        if (g104 < 0.2) return "Very Good";
        if (g104 < 0.3) return "Good";
        return "Meh";
      }
    },
    {
      id: "compliance.passiveHouse.pass",
      legacyId: "n_104",
      section: "S12",
      classification: "C",
      dependencies: ["envelope.combined.uValue"],
      label: "Passive House Compliance Status",
      compute: (inputs) => {
        const g104 = parseNum(inputs["envelope.combined.uValue"]);
        return g104 < 0.3 ? "✓" : "✗";
      }
    },

    // m_109: ACH50 compliance (ref_d_109 / d_109) — higher ratio is better
    {
      id: "compliance.ach50.ratio",
      legacyId: "m_109",
      section: "S12",
      classification: "C",
      dependencies: ["airTightness.ach50Target", "reference.airTightness.ach50Target"],
      label: "ACH50 Compliance Ratio",
      compute: (inputs) => {
        const target = parseNum(inputs["airTightness.ach50Target"]);
        const ref = parseNum(inputs["reference.airTightness.ach50Target"]);
        if (target > 0) {
          return Math.round((ref / target) * 100) + "%";
        }
        return "0%";
      }
    },
    {
      id: "compliance.ach50.pass",
      legacyId: "n_109",
      section: "S12",
      classification: "C",
      dependencies: ["airTightness.ach50Target", "reference.airTightness.ach50Target"],
      label: "ACH50 Compliance Status",
      compute: (inputs) => {
        const target = parseNum(inputs["airTightness.ach50Target"]);
        const ref = parseNum(inputs["reference.airTightness.ach50Target"]);
        // Pass if ref/target >= 0.995 (0.5% tolerance)
        return target > 0 && (ref / target) >= 0.995 ? "✓" : "✗";
      }
    },

    // ========================================================================
    // S15: GHG Reduction Percentage
    // ========================================================================

    // d_145: =1-(K32/REFERENCE!K32) — GHG reduction from Reference baseline
    {
      id: "compliance.ghgReduction",
      legacyId: "d_145",
      section: "S15",
      classification: "C",
      dependencies: ["emissions.target.subtotal", "reference.emissions.subtotal"],
      label: "GHG Reduction from Reference",
      compute: (inputs) => {
        const targetEmissions = parseNum(inputs["emissions.target.subtotal"]);
        const refEmissions = parseNum(inputs["reference.emissions.subtotal"]);
        if (refEmissions > 0) {
          return 1 - (targetEmissions / refEmissions);
        }
        // Sequestration edge case
        if (refEmissions === 0 && targetEmissions < 0) return 1;
        return 0;
      }
    },
  ];

  // ==========================================================================
  // REFERENCE OUTPUT → TARGET INPUT MAPPING
  // After Reference model computes, copy these outputs to Target's reference.* inputs
  // ==========================================================================

  const REF_OUTPUT_TO_TARGET_INPUT = {
    // S07: Water Heating
    "waterHeating.lpppd":        "reference.waterHeating.lpppd",
    "waterHeating.warmWaterFraction": "reference.waterHeating.warmWaterFraction",
    "waterHeating.efficiency":   "reference.waterHeating.efficiency",
    "waterHeating.dwhrEfficiency": "reference.waterHeating.dwhrEfficiency",

    // S09: Internal Gains
    "internal.plugLoadDensity":  "reference.internal.plugLoadDensity",
    "internal.lightingDensity":  "reference.internal.lightingDensity",
    "internal.equipmentDensity": "reference.internal.equipmentDensity",

    // S12: ACH50
    "airTightness.ach50Target":  "reference.airTightness.ach50Target",
  };

  // ==========================================================================
  // REGISTRATION
  // ==========================================================================

  function register(graph) {
    // Register reference inputs
    for (const input of ReferenceInputs) {
      graph.registerInput(input);
    }

    // Register compliance ratio computed nodes
    for (const node of ComplianceNodes) {
      graph.registerNode(node);
    }

    // Register h_50 (warm water fraction) as a computed node — needed for m_50 compliance
    graph.registerNode({
      id: "waterHeating.warmWaterFraction",
      legacyId: "h_50",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.lpppd"],
      label: "Warm Water Fraction (L/person/day × 0.4)",
      compute: (inputs) => {
        const lpppd = parseNum(inputs["waterHeating.lpppd"]);
        return lpppd * 0.4;
      }
    });

    console.log(
      `[SectionComplianceNodes] Registered ${ReferenceInputs.length} reference inputs, ${ComplianceNodes.length} compliance nodes`
    );
  }

  // ==========================================================================
  // EXPORT
  // ==========================================================================

  window.TEUI.ComputationNodes.SectionCompliance = {
    register,
    inputs: ReferenceInputs,
    nodes: ComplianceNodes,
    REF_OUTPUT_TO_TARGET_INPUT
  };

  console.log("[SectionComplianceNodes] Module loaded");
})();
