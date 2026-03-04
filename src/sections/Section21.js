/**
 * Section21.js - CSA F280 Compliance Report
 *
 * Provides UI for F280-specific user inputs (designer certification,
 * equipment capacity, project metadata) and displays read-only summary
 * of all F280 report field values pulled from the computation graph.
 *
 * ARCHITECTURE: Simplified Pattern A (display-focused)
 * - F280ComplianceNodes.js handles all peak load & compliance calculations
 * - This section reads computed values from StateManager
 * - Own calculations are minimal (field validation, display refresh)
 *
 * References:
 *   - CSA F280-12 (R2025)
 *   - SectionXX.js (Pattern A template)
 *   - Section07.js (proven Pattern A reference)
 */
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

window.TEUI.SectionModules.sect21 = (function () {
  //==========================================================================
  // 1. FIELD DEFINITIONS (Single Source of Truth)
  //==========================================================================

  // Semantic field IDs — keys match graph node names from F280ComplianceNodes.js
  const FIELDS = {
    // === F280 OWN INPUTS (editable) ===
    // Project metadata
    projectNumber:                "f280_proj_num",
    complianceType:               "f280_comp_type",
    codeReference:                "f280_code_ref",
    // Equipment capacity
    installedHeatingCapacity:     "f280_cap_heat",
    installedCoolingCapacity:     "f280_cap_cool",
    // Designer certification
    designerName:                 "f280_dsgn_name",
    designerCompany:              "f280_dsgn_co",
    certType:                     "f280_cert_type",
    certNumber:                   "f280_cert_num",
    serviceOrg:                   "f280_svc_org",
    attestation:                  "f280_attest",

    // === DISPLAY MIRRORS (read-only, sourced from other sections) ===
    // Design conditions (S03)
    tsetHeating:                  "f280_d_h23",      // h_23 — climate.heating.setpoint
    tsetCooling:                  "f280_d_h24",      // h_24 — climate.cooling.setpoint
    temperatureColdest:           "f280_d_d23",      // d_23 — climate.temperature.coldest
    temperatureHottest:           "f280_d_d24",      // d_24 — climate.temperature.hottest
    heatingDegreeDays:            "f280_d_d20",      // d_20 — climate.heating.degreedays
    coolingDegreeDays:            "f280_d_d21",      // d_21 — climate.cooling.degreedays
    conditionedFloorArea:         "f280_d_h15",      // h_15 — building.conditionedFloorArea
    conditionedVolume:            "f280_d_d105",     // d_105 — volume.conditioned
    numStoreys:                   "f280_d_d103",     // d_103 — volume.numStoreys
    // Envelope areas (S11: d_85..d_95)
    wallAreaAboveGrade:           "f280_d_d86",      // d_86
    ceilingRoofArea:              "f280_d_d85",      // d_85
    windowAreaNorth:              "f280_d_d89",      // d_89
    windowAreaEast:               "f280_d_d89b",     // d_90
    windowAreaSouth:              "f280_d_d89c",     // d_91
    windowAreaWest:               "f280_d_d89d",     // d_92
    doorArea:                     "f280_d_d88",      // d_88
    skylightArea:                 "f280_d_d93",      // d_93
    wallAreaBelowGrade:           "f280_d_d94",      // d_94
    slabArea:                     "f280_d_d95",      // d_95
    // Envelope U-values (S11: g_85..g_95)
    uWallAboveGrade:              "f280_h_g86",      // g_86
    uCeilingRoof:                 "f280_h_g85",      // g_85
    uWindowNorth:                 "f280_h_g89",      // g_89
    uWindowEast:                  "f280_h_g89b",     // g_90
    uWindowSouth:                 "f280_h_g89c",     // g_91
    uWindowWest:                  "f280_h_g89d",     // g_92
    uDoor:                        "f280_h_g88",      // g_88
    uSkylight:                    "f280_h_g93",      // g_93
    uWallBelowGrade:              "f280_h_g94",      // g_94
    uSlab:                        "f280_h_g95",      // g_95
    // Air tightness & ventilation (S13/S14)
    nrl50:                        "f280_d_g108",     // g_108 — airTightness.nrl50
    ach50Target:                  "f280_d_d109",     // d_109 — airTightness.ach50Target
    ventilationVolumetricRate:    "f280_d_d120",     // d_120 — ventilation.volumetricRate
    ventilationEfficiency:        "f280_d_d118",     // d_118 — mechanical.ventilation.efficiency

    // === F280 COMPUTED RESULTS (read-only) ===
    // Peak loads
    peakEnvelopeHeatLoss:         "f280_d_hl_env",
    peakInfiltrationHeatLoss:     "f280_d_hl_inf",
    peakVentilationHeatLoss:      "f280_d_hl_vent",
    totalDesignHeatLoss:          "f280_d_hl_total",
    totalDesignHeatLossBTU:       "f280_h_hl_btu",
    nominalCoolingCapacity:       "f280_d_cl_total",
    nominalCoolingCapacityBTU:    "f280_h_cl_btu",
    // Equipment sizing
    heatingSizingRatio:           "f280_d_sz_heat_ratio",
    heatingSizingCompliance:      "f280_d_sz_heat",
    coolingSizingRatio:           "f280_d_sz_cool_ratio",
    coolingSizingCompliance:      "f280_d_sz_cool",
    // Overall compliance
    overallCompliance:            "f280_d_overall",
  };

  // Text-type fields that should NOT be parsed as numeric on blur
  const TEXT_FIELDS = new Set([
    FIELDS.projectNumber,
    FIELDS.codeReference,
    FIELDS.designerName,
    FIELDS.designerCompany,
    FIELDS.certNumber,
    FIELDS.serviceOrg,
  ]);

  const sectionRows = {
    // Unit header
    header: {
      id: "S21-ID",
      rowId: "S21-ID",
      cells: {
        c: {
          content: "SECTION 21. CSA F280 Compliance",
          classes: ["section-subheader"],
        },
        d: { content: "Value", classes: ["section-subheader"] },
        e: { content: "", classes: ["section-subheader"] },
        f: { content: "Unit", classes: ["section-subheader"] },
        g: { content: "", classes: ["section-subheader"] },
        h: { content: "Value", classes: ["section-subheader"] },
        i: { content: "", classes: ["section-subheader"] },
        j: { content: "Unit", classes: ["section-subheader"] },
        k: { content: "", classes: ["section-subheader"] },
        l: { content: "", classes: ["section-subheader"] },
        m: { content: "", classes: ["section-subheader"] },
        n: { content: "Status", classes: ["section-subheader"] },
      },
    },

    // ---- Group 1: F280 Form Metadata ----
    subheader_meta: {
      id: "F.0A",
      rowId: "F.0A",
      label: "F280 Form Metadata",
      cells: {
        c: {
          content: "F280 Form Metadata",
          classes: ["group-header"],
        },
        d: { content: "\u00A0", classes: ["section-subheader"] },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    1: {
      id: "F.1",
      rowId: "F.1",
      label: "Project Number",
      cells: {
        c: { label: "Project Number" },
        d: {
          fieldId: "f280_proj_num",
          type: "editable",
          value: "",
          classes: ["user-input"],
          tooltip: true,
          label: "F280 Project Number",
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    2: {
      id: "F.2",
      rowId: "F.2",
      label: "Compliance Type",
      cells: {
        c: { label: "Compliance Type" },
        d: {
          fieldId: "f280_comp_type",
          type: "calculated",
          value: "Whole House",
          label: "Compliance Type (Whole House only)",
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    3: {
      id: "F.3",
      rowId: "F.3",
      label: "Code Reference",
      cells: {
        c: { label: "Code Reference" },
        d: {
          fieldId: "f280_code_ref",
          type: "editable",
          value: "NBC 2020: 9.33.5.1, 9.36.3.2, 9.36.5.15(5), 9.36.8.9",
          classes: ["user-input"],
          tooltip: true,
          label: "Applicable Code Reference",
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    // ---- Group 2: Design Conditions (Read-Only) ----
    subheader_design: {
      id: "F.0B",
      rowId: "F.0B",
      label: "Design Conditions",
      cells: {
        c: {
          content: "Design Conditions",
          classes: ["group-header"],
        },
        d: { content: "Value", classes: ["section-subheader"] },
        e: {},
        f: { content: "Unit", classes: ["section-subheader"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    4: {
      id: "F.4",
      rowId: "F.4",
      label: "Indoor Heating Setpoint",
      cells: {
        c: { label: "Indoor Heating Setpoint" },
        d: {
          fieldId: "f280_d_h23",
          type: "calculated",
          value: "0",
          label: "Indoor Heating Setpoint",
        },
        e: {},
        f: { content: "\u00B0C", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    5: {
      id: "F.5",
      rowId: "F.5",
      label: "Indoor Cooling Setpoint",
      cells: {
        c: { label: "Indoor Cooling Setpoint" },
        d: {
          fieldId: "f280_d_h24",
          type: "calculated",
          value: "0",
          label: "Indoor Cooling Setpoint",
        },
        e: {},
        f: { content: "\u00B0C", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    6: {
      id: "F.6",
      rowId: "F.6",
      label: "Outdoor Design Temp (Heating)",
      cells: {
        c: { label: "Outdoor Design Temp (Heating)" },
        d: {
          fieldId: "f280_d_d23",
          type: "calculated",
          value: "0",
          label: "Outdoor Design Temperature - Heating",
        },
        e: {},
        f: { content: "\u00B0C", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    7: {
      id: "F.7",
      rowId: "F.7",
      label: "Outdoor Design Temp (Cooling)",
      cells: {
        c: { label: "Outdoor Design Temp (Cooling)" },
        d: {
          fieldId: "f280_d_d24",
          type: "calculated",
          value: "0",
          label: "Outdoor Design Temperature - Cooling",
        },
        e: {},
        f: { content: "\u00B0C", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    8: {
      id: "F.8",
      rowId: "F.8",
      label: "Heating Degree Days",
      cells: {
        c: { label: "Heating Degree Days" },
        d: {
          fieldId: "f280_d_d20",
          type: "calculated",
          value: "0",
          label: "Heating Degree Days",
        },
        e: {},
        f: { content: "HDD", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    9: {
      id: "F.9",
      rowId: "F.9",
      label: "Cooling Degree Days",
      cells: {
        c: { label: "Cooling Degree Days" },
        d: {
          fieldId: "f280_d_d21",
          type: "calculated",
          value: "0",
          label: "Cooling Degree Days",
        },
        e: {},
        f: { content: "CDD", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    10: {
      id: "F.10",
      rowId: "F.10",
      label: "Conditioned Floor Area",
      cells: {
        c: { label: "Conditioned Floor Area" },
        d: {
          fieldId: "f280_d_h15",
          type: "calculated",
          value: "0",
          label: "Conditioned Floor Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    11: {
      id: "F.11",
      rowId: "F.11",
      label: "Conditioned Volume",
      cells: {
        c: { label: "Conditioned Volume" },
        d: {
          fieldId: "f280_d_d105",
          type: "calculated",
          value: "0",
          label: "Conditioned Volume",
        },
        e: {},
        f: { content: "m\u00B3", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    12: {
      id: "F.12",
      rowId: "F.12",
      label: "Number of Storeys",
      cells: {
        c: { label: "Number of Storeys" },
        d: {
          fieldId: "f280_d_d103",
          type: "calculated",
          value: "0",
          label: "Number of Storeys",
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    // ---- Group 3: Envelope Summary (Read-Only) ----
    subheader_envelope: {
      id: "F.0C",
      rowId: "F.0C",
      label: "Envelope Summary",
      cells: {
        c: {
          content: "Envelope Summary",
          classes: ["group-header"],
        },
        d: { content: "Area", classes: ["section-subheader"] },
        e: {},
        f: { content: "m\u00B2", classes: ["section-subheader"] },
        g: {},
        h: { content: "U-value", classes: ["section-subheader"] },
        i: {},
        j: {
          content: "W/m\u00B2K",
          classes: ["section-subheader"],
        },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    13: {
      id: "F.13",
      rowId: "F.13",
      label: "Walls (Above Grade)",
      cells: {
        c: { label: "Walls (Above Grade)" },
        d: {
          fieldId: "f280_d_d86",
          type: "calculated",
          value: "0",
          label: "Wall Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g86",
          type: "calculated",
          value: "0",
          label: "Wall U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    14: {
      id: "F.14",
      rowId: "F.14",
      label: "Roof / Ceiling",
      cells: {
        c: { label: "Roof / Ceiling" },
        d: {
          fieldId: "f280_d_d85",
          type: "calculated",
          value: "0",
          label: "Roof Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g85",
          type: "calculated",
          value: "0",
          label: "Roof U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    15: {
      id: "F.15",
      rowId: "F.15",
      label: "Windows North",
      cells: {
        c: { label: "Windows North" },
        d: {
          fieldId: "f280_d_d89",
          type: "calculated",
          value: "0",
          label: "North Window Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g89",
          type: "calculated",
          value: "0",
          label: "North Window U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    16: {
      id: "F.16",
      rowId: "F.16",
      label: "Windows East",
      cells: {
        c: { label: "Windows East" },
        d: {
          fieldId: "f280_d_d89b",
          type: "calculated",
          value: "0",
          label: "East Window Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g89b",
          type: "calculated",
          value: "0",
          label: "East Window U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    17: {
      id: "F.17",
      rowId: "F.17",
      label: "Windows South",
      cells: {
        c: { label: "Windows South" },
        d: {
          fieldId: "f280_d_d89c",
          type: "calculated",
          value: "0",
          label: "South Window Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g89c",
          type: "calculated",
          value: "0",
          label: "South Window U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    18: {
      id: "F.18",
      rowId: "F.18",
      label: "Windows West",
      cells: {
        c: { label: "Windows West" },
        d: {
          fieldId: "f280_d_d89d",
          type: "calculated",
          value: "0",
          label: "West Window Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g89d",
          type: "calculated",
          value: "0",
          label: "West Window U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    19: {
      id: "F.19",
      rowId: "F.19",
      label: "Doors",
      cells: {
        c: { label: "Doors" },
        d: {
          fieldId: "f280_d_d88",
          type: "calculated",
          value: "0",
          label: "Door Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g88",
          type: "calculated",
          value: "0",
          label: "Door U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    20: {
      id: "F.20",
      rowId: "F.20",
      label: "Skylights",
      cells: {
        c: { label: "Skylights" },
        d: {
          fieldId: "f280_d_d93",
          type: "calculated",
          value: "0",
          label: "Skylight Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g93",
          type: "calculated",
          value: "0",
          label: "Skylight U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    21: {
      id: "F.21",
      rowId: "F.21",
      label: "Below-Grade Walls",
      cells: {
        c: { label: "Below-Grade Walls" },
        d: {
          fieldId: "f280_d_d94",
          type: "calculated",
          value: "0",
          label: "Below-Grade Wall Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g94",
          type: "calculated",
          value: "0",
          label: "Below-Grade Wall U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    22: {
      id: "F.22",
      rowId: "F.22",
      label: "Slab-on-Grade",
      cells: {
        c: { label: "Slab-on-Grade" },
        d: {
          fieldId: "f280_d_d95",
          type: "calculated",
          value: "0",
          label: "Slab Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g95",
          type: "calculated",
          value: "0",
          label: "Slab U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    // ---- Group 4: Air Tightness & Ventilation (Read-Only) ----
    subheader_air: {
      id: "F.0D",
      rowId: "F.0D",
      label: "Air Tightness & Ventilation",
      cells: {
        c: {
          content: "Air Tightness & Ventilation",
          classes: ["group-header"],
        },
        d: { content: "Value", classes: ["section-subheader"] },
        e: {},
        f: { content: "Unit", classes: ["section-subheader"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    23: {
      id: "F.23",
      rowId: "F.23",
      label: "NRL50",
      cells: {
        c: { label: "NRL50 (Normalized Leakage)" },
        d: {
          fieldId: "f280_d_g108",
          type: "calculated",
          value: "0",
          label: "NRL50",
        },
        e: {},
        f: { content: "L/s/m\u00B2", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    24: {
      id: "F.24",
      rowId: "F.24",
      label: "ACH50",
      cells: {
        c: { label: "ACH50 (Air Changes at 50Pa)" },
        d: {
          fieldId: "f280_d_d109",
          type: "calculated",
          value: "0",
          label: "ACH50",
        },
        e: {},
        f: { content: "ACH", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    25: {
      id: "F.25",
      rowId: "F.25",
      label: "Ventilation Rate",
      cells: {
        c: { label: "Ventilation Rate" },
        d: {
          fieldId: "f280_d_d120",
          type: "calculated",
          value: "0",
          label: "Ventilation Rate",
        },
        e: {},
        f: { content: "L/s", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    26: {
      id: "F.26",
      rowId: "F.26",
      label: "HRV/ERV Efficiency (ATRE)",
      cells: {
        c: { label: "HRV/ERV Efficiency (ATRE)" },
        d: {
          fieldId: "f280_d_d118",
          type: "calculated",
          value: "0",
          label: "HRV/ERV Efficiency",
        },
        e: {},
        f: { content: "%", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    // ---- Group 5: F280 Peak Load Results (Read-Only) ----
    subheader_results: {
      id: "F.0E",
      rowId: "F.0E",
      label: "F280 Peak Load Results",
      cells: {
        c: {
          content: "F280 Peak Load Results",
          classes: ["group-header"],
        },
        d: { content: "Watts", classes: ["section-subheader"] },
        e: {},
        f: { content: "W", classes: ["section-subheader"] },
        g: {},
        h: { content: "BTU/h", classes: ["section-subheader"] },
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    27: {
      id: "F.27",
      rowId: "F.27",
      label: "Peak Envelope Heat Loss",
      cells: {
        c: { label: "Peak Envelope Heat Loss" },
        d: {
          fieldId: "f280_d_hl_env",
          type: "calculated",
          value: "0",
          label: "Peak Envelope Heat Loss",
        },
        e: {},
        f: { content: "W", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    28: {
      id: "F.28",
      rowId: "F.28",
      label: "Peak Infiltration Heat Loss",
      cells: {
        c: { label: "Peak Infiltration Heat Loss" },
        d: {
          fieldId: "f280_d_hl_inf",
          type: "calculated",
          value: "0",
          label: "Peak Infiltration Heat Loss",
        },
        e: {},
        f: { content: "W", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    29: {
      id: "F.29",
      rowId: "F.29",
      label: "Peak Ventilation Heat Loss",
      cells: {
        c: { label: "Peak Ventilation Heat Loss" },
        d: {
          fieldId: "f280_d_hl_vent",
          type: "calculated",
          value: "0",
          label: "Peak Ventilation Heat Loss",
        },
        e: {},
        f: { content: "W", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    30: {
      id: "F.30",
      rowId: "F.30",
      label: "Total Design Heat Loss",
      cells: {
        c: { label: "Total Design Heat Loss" },
        d: {
          fieldId: "f280_d_hl_total",
          type: "calculated",
          value: "0",
          label: "Total Design Heat Loss (W)",
        },
        e: {},
        f: { content: "W", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_hl_btu",
          type: "calculated",
          value: "0",
          label: "Total Design Heat Loss (BTU/h)",
        },
        i: {},
        j: { content: "BTU/h", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    31: {
      id: "F.31",
      rowId: "F.31",
      label: "Nominal Cooling Capacity",
      cells: {
        c: { label: "Nominal Cooling Capacity" },
        d: {
          fieldId: "f280_d_cl_total",
          type: "calculated",
          value: "0",
          label: "Nominal Cooling Capacity (W)",
        },
        e: {},
        f: { content: "W", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_cl_btu",
          type: "calculated",
          value: "0",
          label: "Nominal Cooling Capacity (BTU/h)",
        },
        i: {},
        j: { content: "BTU/h", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    // ---- Group 6: Equipment Sizing (User Input + Compliance) ----
    subheader_equipment: {
      id: "F.0F",
      rowId: "F.0F",
      label: "Equipment Sizing",
      cells: {
        c: {
          content: "Equipment Sizing",
          classes: ["group-header"],
        },
        d: { content: "Installed", classes: ["section-subheader"] },
        e: {},
        f: { content: "W", classes: ["section-subheader"] },
        g: {},
        h: { content: "Sizing Ratio", classes: ["section-subheader"] },
        i: {},
        j: { content: "%", classes: ["section-subheader"] },
        k: {},
        l: {},
        m: {},
        n: { content: "Pass", classes: ["section-subheader"] },
      },
    },

    32: {
      id: "F.32",
      rowId: "F.32",
      label: "Installed Heating Capacity",
      cells: {
        c: { label: "Installed Heating Capacity" },
        d: {
          fieldId: "f280_cap_heat",
          type: "editable",
          value: "0",
          classes: ["user-input"],
          tooltip: true,
          label: "Installed Heating Capacity (W)",
        },
        e: {},
        f: { content: "W", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_d_sz_heat_ratio",
          type: "calculated",
          value: "0",
          label: "Heating Sizing Ratio",
        },
        i: {},
        j: { content: "%", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {
          fieldId: "f280_d_sz_heat",
          type: "calculated",
          value: "",
          label: "Heating Sizing Compliance",
        },
      },
    },

    33: {
      id: "F.33",
      rowId: "F.33",
      label: "Installed Cooling Capacity",
      cells: {
        c: { label: "Installed Cooling Capacity" },
        d: {
          fieldId: "f280_cap_cool",
          type: "editable",
          value: "0",
          classes: ["user-input"],
          tooltip: true,
          label: "Installed Cooling Capacity (W)",
        },
        e: {},
        f: { content: "W", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_d_sz_cool_ratio",
          type: "calculated",
          value: "0",
          label: "Cooling Sizing Ratio",
        },
        i: {},
        j: { content: "%", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {
          fieldId: "f280_d_sz_cool",
          type: "calculated",
          value: "",
          label: "Cooling Sizing Compliance",
        },
      },
    },

    // ---- Group 7: Designer Certification (User Input) ----
    subheader_designer: {
      id: "F.0G",
      rowId: "F.0G",
      label: "Designer Certification",
      cells: {
        c: {
          content: "Designer Certification",
          classes: ["group-header"],
        },
        d: { content: "\u00A0", classes: ["section-subheader"] },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    34: {
      id: "F.34",
      rowId: "F.34",
      label: "Designer Name",
      cells: {
        c: { label: "Designer Name" },
        d: {
          fieldId: "f280_dsgn_name",
          type: "editable",
          value: "",
          classes: ["user-input"],
          tooltip: true,
          label: "Designer Full Name",
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    35: {
      id: "F.35",
      rowId: "F.35",
      label: "Designer Company",
      cells: {
        c: { label: "Designer Company" },
        d: {
          fieldId: "f280_dsgn_co",
          type: "editable",
          value: "",
          classes: ["user-input"],
          tooltip: true,
          label: "Designer Company Name",
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    36: {
      id: "F.36",
      rowId: "F.36",
      label: "Certification Type",
      cells: {
        c: { label: "Certification Type" },
        d: {
          fieldId: "f280_cert_type",
          type: "dropdown",
          dropdownId: "f280_cert_type",
          value: "Other",
          tooltip: true,
          label: "Certification Type",
          options: [
            "NRCan EA",
            "TECA",
            "P.Eng",
            "OAA",
            "BCIN",
            "Other",
          ],
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    37: {
      id: "F.37",
      rowId: "F.37",
      label: "Certification Number",
      cells: {
        c: { label: "Certification Number" },
        d: {
          fieldId: "f280_cert_num",
          type: "editable",
          value: "",
          classes: ["user-input"],
          tooltip: true,
          label: "Certificate / License Number",
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    38: {
      id: "F.38",
      rowId: "F.38",
      label: "Service Organization",
      cells: {
        c: { label: "Service Organization" },
        d: {
          fieldId: "f280_svc_org",
          type: "editable",
          value: "",
          classes: ["user-input"],
          tooltip: true,
          label: "NRCan Service Organization (required for NRCan EA)",
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    39: {
      id: "F.39",
      rowId: "F.39",
      label: "Responsibility Declaration",
      cells: {
        c: { label: "Responsibility Declaration" },
        d: {
          fieldId: "f280_attest",
          type: "dropdown",
          dropdownId: "f280_attest",
          value: "No",
          tooltip: true,
          label: "Responsibility Declaration",
          options: ["Yes", "No"],
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    // ---- Group 8: Overall Compliance ----
    subheader_overall: {
      id: "F.0H",
      rowId: "F.0H",
      label: "Compliance Status",
      cells: {
        c: {
          content: "Compliance Status",
          classes: ["group-header"],
        },
        d: { content: "\u00A0", classes: ["section-subheader"] },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: { content: "Status", classes: ["section-subheader"] },
      },
    },

    40: {
      id: "F.40",
      rowId: "F.40",
      label: "F280 Overall Compliance",
      cells: {
        c: { label: "F280 Overall Compliance" },
        d: {},
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {
          fieldId: "f280_d_overall",
          type: "calculated",
          value: "",
          label: "F280 Overall Compliance",
        },
      },
    },
  };

  //==========================================================================
  // 2. ACCESSOR METHODS (FieldManager Integration)
  //==========================================================================

  function getFields() {
    const fields = {};
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;
      Object.values(row.cells).forEach(cell => {
        if (cell.fieldId) {
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || cell.content || row.label,
            defaultValue: cell.value || "",
            section: "f280Compliance",
          };
          if (cell.dropdownId)
            fields[cell.fieldId].dropdownId = cell.dropdownId;
          if (cell.options) fields[cell.fieldId].options = cell.options;
          if (cell.dependencies)
            fields[cell.fieldId].dependencies = cell.dependencies;
        }
      });
    });
    return fields;
  }

  function getDropdownOptions() {
    const options = {};
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;
      Object.values(row.cells).forEach(cell => {
        if (cell.type === "dropdown" && cell.dropdownId && cell.options) {
          options[cell.dropdownId] = cell.options.map(opt => ({
            value: opt,
            name: opt,
          }));
        }
      });
    });
    return options;
  }

  // Explicit row ordering to prevent JavaScript numeric-key-first iteration
  const ROW_ORDER = [
    "header",
    "subheader_meta", 1, 2, 3,
    "subheader_design", 4, 5, 6, 7, 8, 9, 10, 11, 12,
    "subheader_envelope", 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
    "subheader_air", 23, 24, 25, 26,
    "subheader_results", 27, 28, 29, 30, 31,
    "subheader_equipment", 32, 33,
    "subheader_designer", 34, 35, 36, 37, 38, 39,
    "subheader_overall", 40,
  ];

  function getLayout() {
    const layoutRows = [];
    ROW_ORDER.forEach(function (key) {
      if (sectionRows[key]) {
        layoutRows.push(createLayoutRow(sectionRows[key]));
      }
    });
    return { rows: layoutRows };
  }

  function createLayoutRow(row) {
    const rowDef = { id: row.id, cells: [{}, {}] };
    const columns = [
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
    ];
    columns.forEach(col => {
      const cell = row.cells?.[col] || {};
      if (col === "c" && !cell.label && row.label) cell.label = row.label;
      rowDef.cells.push(cell);
    });
    return rowDef;
  }

  //==========================================================================
  // 3. STATE OBJECTS (Pattern A Dual-State Architecture)
  //==========================================================================

  // Editable field IDs owned by this section
  const EDITABLE_FIELDS = [
    FIELDS.projectNumber,
    FIELDS.codeReference,
    FIELDS.installedHeatingCapacity,
    FIELDS.installedCoolingCapacity,
    FIELDS.designerName,
    FIELDS.designerCompany,
    FIELDS.certType,
    FIELDS.certNumber,
    FIELDS.serviceOrg,
    FIELDS.attestation,
  ];

  // Display-only field IDs (read from StateManager, rendered in section)
  const DISPLAY_FIELDS = [
    // Design conditions
    FIELDS.tsetHeating, FIELDS.tsetCooling,
    FIELDS.temperatureColdest, FIELDS.temperatureHottest,
    FIELDS.heatingDegreeDays, FIELDS.coolingDegreeDays,
    FIELDS.conditionedFloorArea, FIELDS.conditionedVolume, FIELDS.numStoreys,
    // Envelope areas
    FIELDS.wallAreaAboveGrade, FIELDS.ceilingRoofArea,
    FIELDS.windowAreaNorth, FIELDS.windowAreaEast,
    FIELDS.windowAreaSouth, FIELDS.windowAreaWest,
    FIELDS.doorArea, FIELDS.skylightArea,
    FIELDS.wallAreaBelowGrade, FIELDS.slabArea,
    // Envelope U-values
    FIELDS.uWallAboveGrade, FIELDS.uCeilingRoof,
    FIELDS.uWindowNorth, FIELDS.uWindowEast,
    FIELDS.uWindowSouth, FIELDS.uWindowWest,
    FIELDS.uDoor, FIELDS.uSkylight,
    FIELDS.uWallBelowGrade, FIELDS.uSlab,
    // Air tightness & ventilation
    FIELDS.nrl50, FIELDS.ach50Target, FIELDS.ventilationVolumetricRate, FIELDS.ventilationEfficiency,
    // F280 peak load results
    FIELDS.peakEnvelopeHeatLoss, FIELDS.peakInfiltrationHeatLoss,
    FIELDS.peakVentilationHeatLoss, FIELDS.totalDesignHeatLoss,
    FIELDS.totalDesignHeatLossBTU, FIELDS.nominalCoolingCapacity,
    FIELDS.nominalCoolingCapacityBTU,
    // Equipment sizing results
    FIELDS.heatingSizingRatio, FIELDS.heatingSizingCompliance,
    FIELDS.coolingSizingRatio, FIELDS.coolingSizingCompliance,
    // Compliance
    FIELDS.overallCompliance,
  ];

  // Mapping from section display field IDs to StateManager source field IDs
  // Maps S21 display field → { semantic, legacy } for graph-first reads with SM fallback.
  // Semantic paths from graph nodes (ClimateNodes, VolumeMetricsNodes, F280ComplianceNodes).
  // S11 envelope fields use semanticPath annotations (not yet graph nodes) so legacy key is required.
  // SOURCE_MAP: display fieldId → semantic path
  // Paths match the data-semantic attributes on source section cells.
  // Values resolved via graph state or SM (reverse-lookup at runtime).
  const SOURCE_MAP = {
    // Design conditions (S03)
    [FIELDS.tsetHeating]:             "building.heatingSetpoint",
    [FIELDS.tsetCooling]:             "building.coolingSetpoint",
    [FIELDS.temperatureColdest]:      "climate.coldestTemp",
    [FIELDS.temperatureHottest]:      "climate.hottestTemp",
    [FIELDS.heatingDegreeDays]:       "climate.hdd",
    [FIELDS.coolingDegreeDays]:       "climate.cdd",
    [FIELDS.conditionedFloorArea]:    "building.conditionedFloorArea",
    [FIELDS.conditionedVolume]:       "geometry.conditionedVolume",
    [FIELDS.numStoreys]:              "airLeakage.stories",
    // Envelope areas (S11)
    [FIELDS.wallAreaAboveGrade]:      "envelope.wallsAbove.area",
    [FIELDS.ceilingRoofArea]:         "envelope.roof.area",
    [FIELDS.windowAreaNorth]:         "envelope.windowNorth.area",
    [FIELDS.windowAreaEast]:          "envelope.windowEast.area",
    [FIELDS.windowAreaSouth]:         "envelope.windowSouth.area",
    [FIELDS.windowAreaWest]:          "envelope.windowWest.area",
    [FIELDS.doorArea]:                "envelope.doors.area",
    [FIELDS.skylightArea]:            "envelope.skylight.area",
    [FIELDS.wallAreaBelowGrade]:      "envelope.wallsBelow.area",
    [FIELDS.slabArea]:                "envelope.slab.area",
    // Envelope U-values (S11)
    [FIELDS.uWallAboveGrade]:         "envelope.wallsAbove.uValue",
    [FIELDS.uCeilingRoof]:            "envelope.roof.uValue",
    [FIELDS.uWindowNorth]:            "envelope.windowNorth.uValue",
    [FIELDS.uWindowEast]:             "envelope.windowEast.uValue",
    [FIELDS.uWindowSouth]:            "envelope.windowSouth.uValue",
    [FIELDS.uWindowWest]:             "envelope.windowWest.uValue",
    [FIELDS.uDoor]:                   "envelope.doors.uValue",
    [FIELDS.uSkylight]:              "envelope.skylight.uValue",
    [FIELDS.uWallBelowGrade]:         "envelope.wallsBelow.uValue",
    [FIELDS.uSlab]:                   "envelope.slab.uValue",
    // Air tightness & ventilation (S12/S13)
    [FIELDS.nrl50]:                   "airLeakage.nrl50Target",
    [FIELDS.ach50Target]:             "airLeakage.ach50Target",
    [FIELDS.ventilationVolumetricRate]: "ventilation.volumetricRate",
    [FIELDS.ventilationEfficiency]:   "ventilation.hrvEfficiency",
    // F280 computed results (graph nodes)
    [FIELDS.peakEnvelopeHeatLoss]:    "f280.peakEnvelopeHeatLoss",
    [FIELDS.peakInfiltrationHeatLoss]: "f280.peakInfiltrationHeatLoss",
    [FIELDS.peakVentilationHeatLoss]: "f280.peakVentilationHeatLoss",
    [FIELDS.totalDesignHeatLoss]:     "f280.totalDesignHeatLoss",
    [FIELDS.totalDesignHeatLossBTU]:  "f280.totalDesignHeatLossBTU",
    [FIELDS.nominalCoolingCapacity]:  "f280.nominalCoolingCapacity",
    [FIELDS.nominalCoolingCapacityBTU]: "f280.nominalCoolingCapacityBTU",
    // Equipment sizing compliance (graph nodes)
    [FIELDS.heatingSizingRatio]:      "f280.heatingSizingRatio",
    [FIELDS.heatingSizingCompliance]: "f280.heatingSizingCompliance",
    [FIELDS.coolingSizingRatio]:      "f280.coolingSizingRatio",
    [FIELDS.coolingSizingCompliance]: "f280.coolingSizingCompliance",
    // Overall compliance (graph node)
    [FIELDS.overallCompliance]:       "f280.overallCompliance",
  };

  // TargetState/ReferenceState/ModeManager removed — graph + SM is the single source of truth.

  function getFieldDefault(fieldId) {
    for (const rowKey in sectionRows) {
      const row = sectionRows[rowKey];
      if (row.cells) {
        for (const cellKey in row.cells) {
          const cell = row.cells[cellKey];
          if (cell.fieldId === fieldId && cell.value !== undefined) {
            return cell.value;
          }
        }
      }
    }
    return null;
  }

  // Expose for ComponentBridge compatibility
  window.TEUI.sect21 = window.TEUI.sect21 || {};

  //==========================================================================
  // MODE-AWARE STATE HELPERS
  //==========================================================================

  function getModeValue(fieldId) {
    const isRef = window.TEUI.ReferenceToggle?.isReferenceMode();
    return window.TEUI.StateManager?.getValue(isRef ? `ref_${fieldId}` : fieldId);
  }

  function setModeValue(fieldId, value, source = "user-modified") {
    const isRef = window.TEUI.ReferenceToggle?.isReferenceMode();
    const key = isRef ? `ref_${fieldId}` : fieldId;
    if (window.TEUI.StateManager?.setValue) {
      window.TEUI.StateManager.setValue(key, value, source);
    }
  }

  //==========================================================================
  // 5. HELPER FUNCTIONS
  //==========================================================================

  function updateServiceOrgVisibility() {
    var certType = getModeValue(FIELDS.certType) || "Other";
    var shouldGhost = certType !== "NRCan EA";
    setFieldGhosted(FIELDS.serviceOrg, shouldGhost);
  }

  function setFieldGhosted(fieldId, shouldBeGhosted) {
    var valueCell = document.querySelector(
      'td[data-field-id="' + fieldId + '"]'
    );
    if (valueCell) {
      valueCell.classList.toggle("disabled-input", shouldBeGhosted);
      var input = valueCell.querySelector(
        'input, select, [contenteditable="true"]'
      );
      if (input) {
        if (input.hasAttribute("contenteditable")) {
          input.contentEditable = !shouldBeGhosted;
        } else {
          input.disabled = shouldBeGhosted;
        }
      }
    }
  }

  /**
   * Build a reverse lookup: semanticPath → legacy fieldId from all section
   * cell definitions. Cached after first call.
   */
  var _semanticToFieldId = null;
  function getSemanticToFieldId() {
    if (_semanticToFieldId) return _semanticToFieldId;
    _semanticToFieldId = {};
    var modules = window.TEUI?.SectionModules || {};
    for (var key in modules) {
      var mod = modules[key];
      if (!mod?.getFields) continue;
      try {
        var fields = mod.getFields();
        for (var fieldId in fields) {
          var field = fields[fieldId];
          if (field.semanticPath) {
            _semanticToFieldId[field.semanticPath] = fieldId;
          }
        }
      } catch (_) { /* skip */ }
    }
    return _semanticToFieldId;
  }

  /**
   * Stamp display-only fields from graph state or SM (via semantic reverse-lookup).
   * Called on render, after each graph recompute (postStamp), and on mode switch.
   *
   * Resolution order:
   * 1. Graph state (MultiModelState) — for values stored as graph nodes
   * 2. SM via reverse-lookup (semanticPath → fieldId) — for values computed
   *    by section calculateAll but not yet registered as graph nodes
   */
  function stampDisplayFields() {
    var section = document.getElementById("f280Compliance");
    if (!section) return;

    var ci = window.TEUI?.ComputationIntegration;
    var graphState = ci?.isInitialized?.() ? ci.getState() : null;
    var modelId = graphState?.getActiveModelId?.();
    var sm = window.TEUI?.StateManager;
    var lookup = getSemanticToFieldId();

    Object.entries(SOURCE_MAP).forEach(function ([displayId, semanticPath]) {
      var value = null;

      // 1. Try graph state
      if (graphState && modelId) {
        value = graphState.getValueForModel(modelId, semanticPath);
      }

      // 2. Fallback: SM via semantic → fieldId reverse lookup
      if ((value == null || value === "") && sm) {
        var fieldId = lookup[semanticPath];
        if (fieldId) {
          value = sm.getValue(fieldId);
        }
      }

      if (value == null || value === "") return;

      var el = section.querySelector('[data-field-id="' + displayId + '"]');
      if (el) {
        el.textContent = value;
        if (value === "\u2713") el.dataset.status = "pass";
        else if (value === "\u2717") el.dataset.status = "fail";
      }
    });
  }

  //==========================================================================
  // 6. EVENT HANDLING
  //==========================================================================

  function handleEditableBlur(event) {
    var fieldElement = event.target.closest("[data-field-id]") || event.target;
    var fieldId = fieldElement.getAttribute("data-field-id");
    if (!fieldId) return;

    var rawValue = fieldElement.textContent.trim();

    if (TEXT_FIELDS.has(fieldId)) {
      // Text field: store raw string value, no numeric parsing
      var currentValue = getModeValue(fieldId);
      if (currentValue !== rawValue) {
        setModeValue(fieldId, rawValue, "user-modified");
      }
    } else {
      // Numeric field: parse and format
      var numericValue =
        window.TEUI?.parseNumeric?.(rawValue, NaN) ??
        parseFloat(rawValue.replace(/[$,%]/g, ""));

      if (isNaN(numericValue)) {
        var previousValue = getModeValue(fieldId) || "0";
        numericValue =
          window.TEUI?.parseNumeric?.(previousValue, 0) ?? 0;
      }

      var valueToStore = numericValue.toString();
      var formattedDisplay =
        window.TEUI?.formatNumber?.(numericValue, "number-0dp-comma") ??
        valueToStore;
      fieldElement.textContent = formattedDisplay;

      var currentVal = getModeValue(fieldId);
      if (currentVal !== valueToStore) {
        setModeValue(fieldId, valueToStore, "user-modified");
      }
    }
  }

  function handleDropdownChange(e) {
    var fieldId =
      e.target.getAttribute("data-field-id") ||
      e.target.getAttribute("data-dropdown-id");
    var value = e.target.value;

    console.log('[S21] Dropdown changed: ' + fieldId + ' = "' + value + '"');

    if (fieldId) {
      setModeValue(fieldId, value, "user-modified");

      // Update Service Org visibility when cert type changes
      if (fieldId === FIELDS.certType) {
        updateServiceOrgVisibility();
      }
    }
  }

  function initializeEventHandlers() {
    var sectionElement = document.getElementById("f280Compliance");
    if (!sectionElement) return;

    // Editable text and numeric fields
    var editableFieldIds = [
      FIELDS.projectNumber, FIELDS.codeReference,
      FIELDS.installedHeatingCapacity, FIELDS.installedCoolingCapacity,
      FIELDS.designerName, FIELDS.designerCompany,
      FIELDS.certNumber, FIELDS.serviceOrg,
    ];

    editableFieldIds.forEach(function (fieldId) {
      var field = sectionElement.querySelector(
        '[data-field-id="' + fieldId + '"]'
      );
      if (
        field &&
        field.classList.contains("editable") &&
        !field.hasEditableListeners
      ) {
        field.setAttribute("contenteditable", "true");
        field.classList.add("user-input");
        field.addEventListener("blur", handleEditableBlur);
        field.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            this.blur();
          }
        });
        field.hasEditableListeners = true;
      }
    });

    // Dropdowns
    var dropdowns = sectionElement.querySelectorAll(
      "select[data-dropdown-id]"
    );
    dropdowns.forEach(function (dropdown) {
      if (!dropdown.hasDropdownListener) {
        dropdown.addEventListener("change", handleDropdownChange);
        dropdown.hasDropdownListener = true;
      }
    });

    // Display field updates handled by DOMBridge.stampAll() via graph recomputation
  }

  //==========================================================================
  // 7. LIFECYCLE & PUBLIC API
  //==========================================================================

  function onSectionRendered() {
    console.log("[S21] Section rendered - initializing F280 Compliance module");

    // Publish field defaults to StateManager
    if (window.TEUI?.StateManager) {
      EDITABLE_FIELDS.forEach(fieldId => {
        const defaultVal = getFieldDefault(fieldId);
        if (defaultVal != null) {
          window.TEUI.StateManager.setValue(fieldId, defaultVal, "default");
        }
      });
    }

    // Stamp display fields with current SM source values
    stampDisplayFields();

    // Initialize event handlers
    initializeEventHandlers();

    // Apply Service Org ghosting
    updateServiceOrgVisibility();

    // Apply tooltips
    if (window.TEUI.TooltipManager?.initialized) {
      setTimeout(function () {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }

    console.log("[S21] Initialization complete");
  }

  /**
   * Called by ReferenceToggle when mode switches.
   */
  function onModeSwitch(mode) {
    stampDisplayFields();
    updateServiceOrgVisibility();
  }

  return {
    getFields: getFields,
    getDropdownOptions: getDropdownOptions,
    getLayout: getLayout,
    initializeEventHandlers: initializeEventHandlers,
    onSectionRendered: onSectionRendered,
    onModeSwitch: onModeSwitch,
    postStamp: stampDisplayFields,
  };
})();

