# F280 Compliance Gap Analysis & Implementation

## Overview

This document identifies what is required for the TEUI Objective calculator to achieve
full CSA F280-12 compliance for residential HVAC equipment sizing, certification, and
licensing. The analysis maps every F280 requirement against the existing computation
graph architecture and identifies gaps that have been addressed or still remain.

CSA F280-12 (R2025) — "Determining the Required Capacity of Residential Space Heating
and Cooling Appliances" — is the Canadian standard for Part 9 building HVAC sizing,
referenced by NBC 9.33.5.1, 9.36.3.2, and 9.36.5.15.

---

## 1. What Already Existed (Pre-Implementation)

The TEUI calculator already contained 95% of the building science inputs and annual
energy calculations that map to F280 requirements. These are spread across 18
computation node modules:

### 1.1 Building Envelope (TransmissionLossNodes.js — Section 11)

| F280 Requirement | Existing Node | Legacy ID | Status |
|---|---|---|---|
| Roof area and U-value | `transmissionLoss.roof.area/uValue` | d_85, g_85 | Exists |
| Above-grade walls area and U-value | `transmissionLoss.walls.area/uValue` | d_86, g_86 | Exists |
| Exposed floor area and U-value | `transmissionLoss.exposedFloor.area/uValue` | d_87, g_87 | Exists |
| Doors area and U-value | `transmissionLoss.doors.area/uValue` | d_88, g_88 | Exists |
| Windows N/E/S/W areas and U-values | `transmissionLoss.window{N/E/S/W}.area/uValue` | d_89–d_92, g_89–g_92 | Exists |
| Skylights area and U-value | `transmissionLoss.skylights.area/uValue` | d_93, g_93 | Exists |
| Below-grade walls area and U-value | `transmissionLoss.wallsBelowGrade.area/uValue` | d_94, g_94 | Exists |
| Slab-on-grade area and U-value | `transmissionLoss.slabOnGrade.area/uValue` | d_95, g_95 | Exists |
| Thermal bridge penalty (%) | `transmissionLoss.thermalBridgePenalty` | d_97 | Exists |
| Annual heat loss per component | `transmissionLoss.*.heatLoss` | i_85–i_95 | Exists (annual only) |
| Annual heat gain per component | `transmissionLoss.*.heatGain` | k_85–k_95 | Exists (annual only) |

### 1.2 Climate Design Conditions (ClimateNodes.js — Section 03)

| F280 Requirement | Existing Node | Legacy ID | Status |
|---|---|---|---|
| Heating Degree Days (HDD) | `climate.heating.degreedays` | d_20 | Exists |
| Cooling Degree Days (CDD) | `climate.cooling.degreedays` | d_21 | Exists |
| Outdoor design temp, heating (1% or 2.5%) | `climate.temperature.coldest` | d_23 | Exists |
| Outdoor design temp, cooling (July 2.5%) | `climate.temperature.hottest` | d_24 | Exists |
| Indoor heating setpoint | `climate.heating.setpoint` | h_23 | Exists |
| Indoor cooling setpoint | `climate.cooling.setpoint` | h_24 | Exists |
| Climate zone (HDD-based) | `climate.zone` | j_19 | Exists |
| Ground-facing HDD | `climate.groundFacing.hdd` | d_22 | Exists |
| Ground-facing CDD | `climate.groundFacing.cdd` | h_22 | Exists |
| Elevation | `climate.elevation` | l_22 | Exists |
| Winter average temperature | `climate.temperature.winterAverage` | d_25 | Exists |

### 1.3 Air Tightness / Infiltration (VolumeMetricsNodes.js — Section 12)

| F280 Requirement | Existing Node | Legacy ID | Status |
|---|---|---|---|
| NRL50 (normalized leakage rate at 50Pa) | `airTightness.nrl50` | g_108 | Exists |
| ACH50 target | `airTightness.ach50Target` | d_109 | Exists |
| N-factor (climate zone, shielding, stories) | `airTightness.nFactor` | g_110 | Exists |
| Air leakage heat loss (annual) | `airTightness.heatLoss` | i_103 | Exists (annual only) |
| Air-facing envelope area (Ae) | `envelope.airFacing.area` | d_101 | Exists |
| Conditioned volume | `volume.conditioned` | d_105 | Exists |
| Number of storeys | `volume.numStoreys` | d_103 | Exists |
| NRL50 presets (AL-1A through AL-4B) | Lookup table in VolumeMetricsNodes | — | Exists |
| N-factor 3D lookup (zone, shielding, stories) | `N_FACTOR_TABLE` in VolumeMetricsNodes | — | Exists |

### 1.4 Ventilation (VentilationNodes.js — Section 13)

| F280 Requirement | Existing Node | Legacy ID | Status |
|---|---|---|---|
| Volumetric ventilation rate (L/s) | `ventilation.volumeRate` | d_120 | Exists |
| HRV/ERV efficiency (ATRE) | `mechanical.ventilation.efficiency` | d_118 | Exists |
| Gross ventilation heat loss (annual) | `ventilation.grossHeatLoss` | d_121 | Exists (annual only) |
| Energy recovered (annual) | `ventilation.energyRecovered` | h_121 | Exists (annual only) |
| Net ventilation heat loss (annual) | `ventilation.netHeatLoss` | m_121 | Exists (annual only) |
| Ventilation method (Vol Const, Occ, etc.) | `mechanical.ventilation.method` | d_118_method | Exists |

### 1.5 Solar Gains (RadiantGainsNodes.js — Section 10)

| F280 Requirement | Existing Node | Legacy ID | Status |
|---|---|---|---|
| SHGC by orientation | `radiantGains.row74-78.shgc` | f_74–f_78 | Exists |
| Winter/summer shading factors | `radiantGains.row74-78.winterShading/summerShading` | g_74–h_78 | Exists |
| Orientation-based gain factors | `radiantGains.row74-78.gainFactor` | m_74–m_78 | Exists |
| Heating season solar gains (seasonal) | `radiantGains.subtotal.heatingGain` | i_79 | Exists (seasonal only) |
| Cooling season solar gains (seasonal) | `radiantGains.subtotal.coolingGain` | k_79 | Exists (seasonal only) |
| Utilization factor (PHPP/NRC method) | `radiantGains.utilizationFactor` | g_80 | Exists |

### 1.6 Internal Gains (InternalGainsNodes.js — Section 09)

| F280 Requirement | Existing Node | Legacy ID | Status |
|---|---|---|---|
| Occupant gains (W/person activity levels) | `internal.heatingGains` | i_71 | Exists (seasonal) |
| Plug load density (W/m2) | `internal.plugLoadDensity` | d_65 | Exists |
| Lighting gains | Component of i_71 | — | Exists |
| Equipment gains | Component of i_71 | — | Exists |
| DHW system losses | `waterHeating.systemLosses` | d_54 | Exists |

### 1.7 Mechanical Systems (MechanicalNodes.js — Section 13)

| F280 Requirement | Existing Node | Legacy ID | Status |
|---|---|---|---|
| Heating system type | `mechanical.heating.systemType` | d_113 | Exists |
| HSPF (heat pump) | `mechanical.heating.hspf` | f_113 | Exists |
| AFUE (combustion) | `mechanical.heating.afue` | j_115 | Exists |
| Cooling system type | `mechanical.cooling.systemType` | d_116 | Exists |
| Cooling COP | `mechanical.cooling.cop` | j_116 | Exists |
| COP derived from HSPF | `mechanical.heating.cop` | — | Exists |

---

## 2. The Core Gap: Annual Energy vs Peak Loads

The fundamental difference between the existing TEUI calculations and F280 requirements:

| Aspect | Existing TEUI | F280 Required |
|---|---|---|
| **Metric** | Annual energy (kWh/yr) | Peak instantaneous load (Watts) |
| **Temperature basis** | Degree-days (HDD/CDD) | Design-day temperature (ΔT) |
| **Purpose** | Energy performance rating | Equipment sizing |
| **Time scope** | Full year (8760 hours) | Single design-day condition |

### Formula Conversion Pattern

Every existing annual calculation has an F280 analog. The conversion is systematic:

| Component | Annual Formula | F280 Peak Formula |
|---|---|---|
| **Envelope** | `Q = U × A × HDD × 24 / 1000` (kWh/yr) | `Q = U × A × ΔT` (W) |
| **Infiltration** | `Q = 1.21 × NRL50 × Ae/N × HDD × 24 / 1000` (kWh/yr) | `Q = 1.21 × NRL50 × Ae/N × ΔT` (W) |
| **Ventilation** | `Q = 1.21 × V × (1-ATRE/100) × HDD × 24 / 1000` (kWh/yr) | `Q = 1.21 × V × (1-ATRE/100) × ΔT` (W) |

Where:
- `ΔT_heating = T_setpoint - T_outdoor_design` (heating)
- `ΔT_cooling = T_outdoor_design - T_setpoint` (cooling)
- `ΔT_ground = T_setpoint - 10°C` (ground-facing components)

The inputs (`U`, `A`, `NRL50`, `Ae`, `N`, `V`, `ATRE`, `T_setpoint`, `T_outdoor_design`)
are ALL already present in the computation graph. Only the peak load math layer was missing.

---

## 3. What Was Added

### 3.1 Parnas Table Specifications (10 files)

Located in `docs/parnas-tables/f280/`:

| File | Semantic ID | CSA Reference | Description |
|---|---|---|---|
| `peak-envelope-heat-loss.json` | `f280.peakEnvelopeHeatLoss` | §5.2 | Peak heat loss through all 11 envelope components, with separate ΔT for air-facing (setpoint - design temp) and ground-facing (setpoint - 10°C), including thermal bridge penalty |
| `peak-infiltration-heat-loss.json` | `f280.peakInfiltrationHeatLoss` | §5.2.5 | Peak air leakage loss: `1.21 × NRL50 × Ae/N × ΔT`, using N-factor from 3D lookup (climate zone × shielding × stories) |
| `peak-ventilation-heat-loss.json` | `f280.peakVentilationHeatLoss` | §5.2.6 | Peak ventilation loss net of ATRE recovery: `1.21 × V × (1 - ATRE/100) × ΔT` |
| `total-design-heat-loss.json` | `f280.totalDesignHeatLoss` | §5.2.7 | **Primary F280 output**: sum of envelope + infiltration + ventilation peak losses. This is the value that heating equipment must meet or exceed. |
| `total-design-heat-loss-btu.json` | `f280.totalDesignHeatLossBTU` | §5.2.7 | BTU/h conversion (`W × 3.41214`) for HVAC industry compatibility |
| `nominal-cooling-capacity.json` | `f280.nominalCoolingCapacity` | §6.3.1 | Total cooling load: envelope sensible + ventilation + infiltration + solar + internal gains, multiplied by latent load factor |
| `heating-sizing-compliance.json` | `f280.heatingSizingCompliance` | §5.2.7 | Installed heating capacity must be >= 100% of total design heat loss |
| `cooling-sizing-compliance.json` | `f280.coolingSizingCompliance` | §6.3.1 | Installed cooling capacity must be 80-125% of nominal, with small system exception (< 6000W may exceed by up to 1750W) |
| `designer-certification.json` | `f280.designerCertification` | §7.1 | Validates designer credentials (5 certification types), attestation, and NRCan Service Organization requirement |
| `f280-input-summary.json` | `f280.inputSummary` | §7.1 | Complete mapping from computation graph nodes to F280 Form Page 2 input summary fields (39 existing, 6 new needed) |

### 3.2 Computation Module (F280ComplianceNodes.js)

Located in `src/sections/nodes/F280ComplianceNodes.js`:

**Input Nodes (11):**

| Node ID | Purpose |
|---|---|
| `f280.installedHeatingCapacity` | Rated heating equipment output (W) |
| `f280.installedCoolingCapacity` | Rated cooling equipment output (W) |
| `f280.designer.name` | Designer's full name |
| `f280.designer.company` | Designer's company name |
| `f280.designer.certType` | Certification type (NRCan EA, TECA, P.Eng, OAA, BCIN, Other) |
| `f280.designer.certNumber` | Certificate/license number |
| `f280.designer.serviceOrg` | NRCan Service Organization (required for NRCan EA) |
| `f280.designer.attestation` | Responsibility declaration (boolean) |
| `f280.projectNumber` | F280 project identifier |
| `f280.complianceType` | Whole House or Room-by-Room |
| `f280.codeReference` | NBC code sections |

**Computed Nodes (20+):**

| Node ID | Dependencies | Output |
|---|---|---|
| `f280.peakEnvelopeHeatLoss` | 11 component areas + U-values, setpoint, design temp | W |
| `f280.peakInfiltrationHeatLoss` | NRL50, Ae, N-factor, setpoint, design temp | W |
| `f280.peakVentilationHeatLoss` | Vent rate, ATRE, setpoint, design temp | W |
| `f280.totalDesignHeatLoss` | Sum of envelope + infiltration + ventilation | W |
| `f280.totalDesignHeatLossBTU` | totalDesignHeatLoss × 3.41214 | BTU/h |
| `f280.peakSolarGain` | Seasonal solar gain / cooling hours × peak factor | W |
| `f280.peakInternalGain` | Seasonal internal gain / 8760 × peak factor | W |
| `f280.nominalCoolingCapacity` | All cooling load components × latent load factor | W |
| `f280.nominalCoolingCapacityBTU` | nominalCoolingCapacity × 3.41214 | BTU/h |
| `f280.heatingSizingRatio` | installed / designHeatLoss × 100 | % |
| `f280.heatingSizingCompliance` | ratio >= 100% | ✓/✗ |
| `f280.coolingSizingRatio` | installed / nominalCooling × 100 | % |
| `f280.coolingSizingCompliance` | 80% <= ratio <= 125% (with small system exception) | ✓/✗ |
| `f280.certificationValid` | name + certNumber + attestation (+ serviceOrg for NRCan EA) | ✓/✗ |
| `f280.overallCompliance` | All three compliance checks pass | ✓/✗ |
| `f280.component.{id}.peakLoss` | Per-component peak heat loss (11 components) | W |

---

## 4. F280 Certification & Licensing Requirements

### 4.1 Who Can Perform F280 Calculations

CSA F280-12 requires calculations to be completed by a **"competent person"** — defined
as a person, firm, or corporation knowledgeable and experienced in the application of
NBC Section 9.36 and the F280 methodology.

### 4.2 Recognized Certification Types

| Type | Full Name | Issuing Body | Scope | Key Requirements |
|---|---|---|---|---|
| **NRCan EA** | NRCan-Registered Energy Advisor | Natural Resources Canada | EnerGuide evaluations, federal/provincial rebate programs | Foundation exam + EA exam + probationary period + Service Organization affiliation + 3-year requalification |
| **TECA** | Thermal Environmental Comfort Association | TECA | BC-recognized F280 calculations, HVAC design | Active TECA membership, F280 software proficiency |
| **P.Eng** | Professional Engineer | Provincial engineering associations (PEO, APEGA, etc.) | Engineering design submissions, Part 3 buildings | Provincial P.Eng license in applicable jurisdiction |
| **OAA** | Ontario Association of Architects | OAA | Architectural submissions in Ontario | Current OAA membership and licence |
| **BCIN** | Building Code Identification Number | Ontario Ministry of Municipal Affairs | Ontario building code submissions | Valid BCIN with building science qualification category |

### 4.3 NRCan Energy Advisor Certification Path

The most common F280 certification path involves:

1. **Foundation Level Exam** — Building science principles, construction technology
2. **Energy Advisor (House) Exam** — EnerGuide Rating System, HOT2000 software,
   technical procedures, quality assurance
3. **Probationary Period** — Supervised file reviews with a Service Organization
4. **Service Organization Affiliation** — Must affiliate with an NRCan-licensed SO that
   has 2+ years of energy efficiency experience and is incorporated/registered in Canada
5. **Requalification** — Every three years

### 4.4 F280 Software Verification

Calculations must use CSA F280-12 verified software. Recognized programs include:
- **TECA Quality First** Heat Loss & Heat Gain Calculator
- **Right-F280** (Wrightsoft)
- **LoopCAD / HeatCAD** (Professional and MJ8 editions)
- **HOT2000** (NRCan's modeling software)
- **HRAI Excel spreadsheets** supplied with the CSA F280-12 standard

### 4.5 Designer Attestation Requirements (F280 Form Page 1)

The F280 form requires the following on Page 1:

| Field | Description | Implemented |
|---|---|---|
| Project Number | Unique project identifier | `f280.projectNumber` |
| Building Location | Full address of the building | Via `climate.location.*` |
| Model Name | Building model name/identifier | Via `building.*` |
| Compliance Type | "Whole House" or "Room-by-Room" | `f280.complianceType` |
| Units | Imperial or Metric | Default: Metric |
| Code Reference | NBC section numbers | `f280.codeReference` |
| Designer Name | Full name of designer | `f280.designer.name` |
| Company | Company name | `f280.designer.company` |
| Address/Contact | Full company address, phone, email | Partially (needs UI) |
| Signature/Stamp | Designer's attestation mark | `f280.designer.attestation` |
| Certification Mark | Professional certification display | `f280.designer.certType` + `certNumber` |
| Responsibility Declaration | Statement of review and responsibility | `f280.designer.attestation` |

---

## 5. F280 Sizing Rules

### 5.1 Heating Equipment Sizing (CSA F280-12 §5.2.7)

```
RULE: Installed heating capacity >= Total design heat loss

  Total Design Heat Loss = Q_envelope + Q_infiltration + Q_ventilation

  Where:
    Q_envelope   = SUM(A_i × U_i × ΔT_i) × (1 + TB/100)   for all 11 components
    Q_infiltration = 1.21 × NRL50 × Ae / N × ΔT
    Q_ventilation  = 1.21 × V_dot × (1 - ATRE/100) × ΔT

  ΔT (air-facing)    = T_setpoint - T_outdoor_design
  ΔT (ground-facing) = T_setpoint - 10°C
```

**Compliance**: `heatingSizingRatio = (installedCapacity / totalDesignHeatLoss) × 100`
- PASS: ratio >= 100%
- FAIL: ratio < 100%

### 5.2 Cooling Equipment Sizing (CSA F280-12 §6.3.1)

```
RULE: 80% <= (installed / nominal) × 100 <= 125%

  Nominal Cooling = (Q_env + Q_vent + Q_inf + Q_solar + Q_internal) × LLF

  Where:
    Q_env     = U_air × A_air × ΔT_cool
    Q_vent    = 1.21 × V_dot × (1 - ATRE/100) × ΔT_cool
    Q_inf     = 1.21 × NRL50 × Ae / N × ΔT_cool
    Q_solar   = Peak solar gain estimate (orientation × SHGC × shading)
    Q_internal = Peak internal gains (occupants + plugs + lighting + equipment)
    LLF       = Latent load factor (>= 1.0, from psychrometric calculations)

  ΔT_cool = T_outdoor_design_cooling - T_setpoint_cooling

  EXCEPTION: If nominal < 6000 W (1.7 tons), installed may exceed
             nominal by up to 1750 W (0.49 tons)
```

**Compliance**: `coolingSizingRatio = (installedCapacity / nominalCooling) × 100`
- PASS: 80% <= ratio <= 125%
- PASS (small system): nominal < 6000W AND installed <= nominal + 1750W
- FAIL: ratio < 80% OR ratio > 125%

### 5.3 Room-by-Room Requirements (F280 §5.2.6)

For Room-by-Room compliance type:
- Heating delivery to each room must be >= 100% of that room's design heat loss
- This requires room-level area/U-value/ventilation allocation (not yet implemented)

---

## 6. Remaining Gaps for Full F280 Compliance

### 6.1 New Input Fields Needed (6 fields)

These inputs are defined in `f280-input-summary.json` as needed but not yet connected to UI:

| Field | Description | Priority | Note |
|---|---|---|---|
| `f280.building.postalCode` | Postal code of building | High | Currently climate uses province+city, not postal code |
| `f280.building.lotNumber` | Lot identification number | Medium | Administrative field for form output |
| `f280.building.waterTableDepth` | Water table depth (m) | Low | Refines below-grade heat loss; rarely affects sizing significantly |
| `f280.building.slabFluidTemp` | Slab fluid temperature (°C) | Low | Only for radiant floor slab systems |
| `f280.installedHeatingCapacity` | Rated heating output (W) | High | Input exists in graph, needs UI connection |
| `f280.installedCoolingCapacity` | Rated cooling output (W) | High | Input exists in graph, needs UI connection |

### 6.2 Peak Solar Gain Refinement

**Current**: The peak solar gain is approximated by dividing seasonal solar gains by
cooling season hours and applying a 2.5x peak factor. This is a reasonable estimate
but not the exact F280 method.

**F280 Method**: Uses hourly peak solar radiation values by orientation from ASHRAE
tables or weather data. For each glazing orientation, the peak-hour solar radiation
(W/m2) is multiplied by area × SHGC × shading factor.

**Recommendation**: Add peak solar radiation lookup table by orientation per
climate region, sourced from ASHRAE Fundamentals or CWEC weather files.

### 6.3 Peak Internal Gains Refinement

**Current**: Approximated from seasonal internal gains divided by 8760 hours with
a 1.5x peak factor.

**F280 Method**: Uses instantaneous occupant + equipment + lighting loads at peak
conditions. The existing `InternalGainsNodes.js` already has activity-level wattages
per person (96.71W relaxed to 424.95W hyperactive) and equipment load tables — these
could be used directly for peak values.

**Recommendation**: Wire the existing per-person wattage and equipment load values
directly into the F280 peak gain calculation, bypassing the seasonal integration.

### 6.4 Room-by-Room Calculations

**Current**: Only "Whole House" compliance type is supported.

**F280 Requirement**: Room-by-Room mode (F280 Form Page 3) requires:
- Individual room definitions (up to 40 rooms)
- Per-room envelope component allocation (wall area, window area, etc.)
- Per-room infiltration allocation
- Per-room ventilation allocation
- Per-room heat loss subtotals
- Room-level equipment sizing check: delivery >= 100% of room heat loss

**Recommendation**: This is a substantial feature requiring a room-level data model.
It would involve:
1. Room definition input array (name, area, volume)
2. Component-to-room allocation matrix
3. Per-room peak load calculations (reusing the component-level formulas)
4. Per-room equipment delivery inputs
5. Per-room sizing compliance checks

### 6.5 F280 Form Output Generation (Pages 1-3)

**Current**: Parnas tables and computation nodes calculate all values but no
PDF/print-ready F280 form output exists.

**F280 Requirement**: The output must match the official F280 Form Set (v24.10)
format with three pages:
- **Page 1**: Designer info, project details, certification marks
- **Page 2**: Input summary table (all building parameters)
- **Page 3**: Results summary (total heat loss, room breakdown if applicable)

**Recommendation**: Add an F280 form renderer that:
1. Pulls all values from the computation graph via semantic paths
2. Formats them into the official F280 form layout
3. Generates a printable/PDF output matching the FormSet v24.10 format
4. Includes designer attestation and certification marks

### 6.6 Verified Software Compliance

**Current**: The TEUI calculator is not listed as CSA F280-12 verified software.

**F280 Requirement**: Calculations must be conducted using CSA F280-12 verified
software. The verification process involves submitting test cases to CSA Group
for validation.

**Recommendation**: This is a business/certification process, not a code change:
1. Prepare standardized test cases per CSA F280-12 Annex D
2. Validate calculator outputs against reference implementations (HOT2000, TECA QF)
3. Submit for CSA verification through the HVAC Designers of Canada process
4. Until verified, F280 outputs should be clearly labeled as "FOR REFERENCE ONLY"

### 6.7 Designer Contact Information

**Current**: Designer name, company, and certification are captured. Full address,
phone, fax, and email fields are not yet registered as computation graph inputs.

**F280 Requirement**: Page 1 requires complete designer contact information.

**Recommendation**: Add the following input nodes:
- `f280.designer.address` — Street address
- `f280.designer.city` — City
- `f280.designer.province` — Province
- `f280.designer.postalCode` — Postal code
- `f280.designer.phone` — Phone number
- `f280.designer.email` — Email address

---

## 7. F280 Compliance Checklist

### Required for Basic F280 Compliance

| # | Requirement | Status | Implementation |
|---|---|---|---|
| 1 | Peak envelope heat loss calculation (§5.2) | DONE | `f280.peakEnvelopeHeatLoss` |
| 2 | Peak infiltration heat loss (§5.2.5) | DONE | `f280.peakInfiltrationHeatLoss` |
| 3 | Peak ventilation heat loss with ATRE (§5.2.6) | DONE | `f280.peakVentilationHeatLoss` |
| 4 | Total design heat loss (§5.2.7) | DONE | `f280.totalDesignHeatLoss` |
| 5 | Design heat loss in BTU/h | DONE | `f280.totalDesignHeatLossBTU` |
| 6 | Nominal cooling capacity (§6.3.1) | DONE | `f280.nominalCoolingCapacity` |
| 7 | Heating sizing compliance check | DONE | `f280.heatingSizingCompliance` |
| 8 | Cooling sizing compliance check (80-125%) | DONE | `f280.coolingSizingCompliance` |
| 9 | Small system exception (< 6000W) | DONE | Integrated in cooling compliance |
| 10 | Designer certification validation | DONE | `f280.certificationValid` |
| 11 | Overall compliance aggregation | DONE | `f280.overallCompliance` |
| 12 | Per-component peak loss breakdown | DONE | `f280.component.*.peakLoss` (11 components) |
| 13 | Input summary field mapping (§7.1) | DONE | `f280-input-summary.json` |

### Required for Full F280 Production Use

| # | Requirement | Status | Priority |
|---|---|---|---|
| 14 | Equipment capacity UI inputs | PENDING | High — inputs exist, need UI |
| 15 | Building postal code input | PENDING | High |
| 16 | Peak solar radiation lookup tables | PENDING | Medium — currently approximated |
| 17 | Direct peak internal gain wiring | PENDING | Medium — currently approximated |
| 18 | F280 Form PDF/print output (Pages 1-3) | PENDING | High |
| 19 | Designer contact fields (address, phone, email) | PENDING | Medium |
| 20 | Room-by-Room mode (F280 Page 3) | PENDING | Low — Whole House sufficient for most use cases |
| 21 | CSA software verification submission | PENDING | High for regulatory acceptance |
| 22 | Test case validation against HOT2000/TECA QF | PENDING | High |

---

## 8. Architecture Notes

### 8.1 How Peak Loads Derive from Existing Nodes

The F280 peak load calculations reuse existing computation graph values without
duplicating the building model. The dependency chain is:

```
Existing Inputs                    F280 Peak Loads
─────────────────                  ────────────────
transmissionLoss.*.area    ──┐
transmissionLoss.*.uValue  ──┼──> f280.peakEnvelopeHeatLoss
climate.heating.setpoint   ──┤
climate.temperature.coldest──┘

airTightness.nrl50     ──┐
envelope.airFacing.area──┼──> f280.peakInfiltrationHeatLoss
airTightness.nFactor   ──┤
climate.heating.setpoint──┤
climate.temperature.coldest──┘

ventilation.volumeRate         ──┐
mechanical.ventilation.efficiency──┼──> f280.peakVentilationHeatLoss
climate.heating.setpoint       ──┤
climate.temperature.coldest    ──┘

f280.peakEnvelopeHeatLoss     ──┐
f280.peakInfiltrationHeatLoss ──┼──> f280.totalDesignHeatLoss
f280.peakVentilationHeatLoss  ──┘

f280.totalDesignHeatLoss      ──┐
f280.installedHeatingCapacity ──┼──> f280.heatingSizingCompliance
                               ──┘
```

### 8.2 Incremental Recomputation

Because F280 nodes are registered in the same computation graph as all other nodes,
they benefit from the existing incremental recomputation (topological sort + dirty
flag propagation). Changing a single U-value automatically propagates through to:
1. The annual heat loss (existing)
2. The F280 peak heat loss (new)
3. The F280 total design heat loss (new)
4. The F280 heating sizing compliance (new)
5. The F280 overall compliance status (new)

### 8.3 Provincial Code Reference Mapping

| Province | Code Section | F280 Requirement |
|---|---|---|
| Ontario | OBC 9.33.2.2 | Mandatory for residential heating/cooling capacity |
| British Columbia | BCBC 9.33.5 | Required for building permits; Step Code checklists |
| Alberta | NBC 2023 Alberta 9.33.5.1 | Referenced for mechanical system sizing |
| National | NBC 9.33.5.1, 9.36.3.2, 9.36.5.15 | F280 is the referenced standard for Part 9 HVAC |

---

## 9. References

- CSA F280:12 (R2025) — Determining the Required Capacity of Residential Space
  Heating and Cooling Appliances (CSA Group)
- F280 Form Set v24.10 (HVAC Designers of Canada, hvacdc.ca)
- F280 Form Set Guide V24.07 (HVAC Designers of Canada)
- F280 Checklist V24.7 (SRD)
- NBC 2020 National Building Code of Canada, Part 9
- HRAI Residential Heat Loss and Heat Gain Calculations Manual
- NRCan Energy Advisor Certification Requirements
- TECA Quality First Heat Loss & Heat Gain Calculator documentation
