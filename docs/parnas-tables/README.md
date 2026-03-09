# Parnas Tables for TEUI Calculator

This directory contains Parnas table specifications for all calculations in the TEUI calculator.
These tables extract the **semantic meaning** of formulas in a language-independent format,
enabling implementation in any programming language.

## What are Parnas Tables?

Parnas tables (named after David Parnas) are tabular specifications that define functions
by listing input conditions and their corresponding outputs. They make the behavior of
computations explicit and verifiable.

## Table Format

Each calculation is specified with:

### Header
- **id**: Semantic path (e.g., `energy.tedi`)
- **legacyId**: Original cell reference (e.g., `h_127`)
- **label**: Human-readable description
- **unit**: Output unit of measurement
- **classification**: G (geometry), C (code-specific), A (other)

### Signature
- **inputs**: List of input parameters with types and units
- **output**: Return type and unit

### Domain
- **preconditions**: Valid input constraints
- **invariants**: Properties that must always hold

### Behavior Table
| Condition | Output |
|-----------|--------|
| Predicate on inputs | Result expression |

### Edge Cases
- Division by zero handling
- Unavailable data handling
- Boundary conditions

## Directory Structure

```
parnas-tables/
├── README.md                 # This file
├── format.schema.json        # JSON Schema for table format
├── air-quality/              # S08 - Indoor air quality compliance
├── building-info/            # S02 - Building info, geometry, prices, metadata
├── climate/                  # S03 - Climate calculations, inputs, degree days
├── compliance/               # Cross-section compliance ratios
├── cooling/                  # S13 - Free cooling, active cooling days, psychrometrics
├── emissions/                # S02/S05 - Embodied carbon targets, TGS4 caps
├── energy/                   # S04/S14/S15 - Energy metrics, peak loads, costs
├── f280/                     # SF280 - CSA F280-12 peak loads & compliance
├── forestry/                 # Wood carbon storage
├── internal-gains/           # S09 - Occupants, plugs, lighting, equipment
├── key-values/               # S01 - Dashboard summary KPIs
├── mechanical/               # S13 - Heating, cooling, ventilation, compliance
├── occupancy/                # S09 - Occupancy inputs, hours, density
├── radiant-gains/            # S10 - Solar gains, utilization factors
├── renewable/                # S06 - Onsite/offsite renewable energy
├── section-compliance/       # Per-section pass/fail (S08, S09, S11, S21)
├── space-heating/            # S13 - Annual space heating demand
├── transmission-loss/        # S11 - Envelope heat transfer
├── ventilation/              # S12 - Ventilation rates, heat recovery
├── volume-metrics/           # S11 - Air tightness, envelope areas
└── water-heating/            # S07 - DHW energy, fuel volumes
```

## Mechanical Section (S13)

The mechanical section handles:
- **Heating**: COP calculations, demand, fuel consumption, emissions
- **Cooling**: COP, demand, intensity, heat sinks
- **Ventilation**: Rates, heat recovery, energy loss
- **Compliance Ratios**: Target vs Reference comparisons (M-column)

### Compliance Ratio Architecture

Compliance ratios compare Target model values against Reference model values:
- `m_113`: HSPF ratio (target_f_113 / ref_f_113)
- `m_115`: AFUE ratio (target_j_115 / ref_j_115)
- `m_116`: COPc ratio (target_j_116 / ref_j_116)
- `m_117`: Cooling intensity ratio (INVERTED: ref_f_117 / target_f_117)
- `m_118`: SRE ratio (target_d_118 / ref_d_118)
- `m_119`: Ventilation rate ratio (target_d_119 / ref_d_119)
- `n_124`: Free cooling compliance status (based on m_124 days)

#### Cross-Model Comparison Pattern

The computation graph uses a **reference.* input injection** pattern:

1. **Reference Inputs**: `ComplianceNodes.js` registers `reference.*` input nodes
   (e.g., `reference.mechanical.heating.afue`)

2. **REF_OUTPUT_TO_TARGET_INPUT Mapping**: After the Reference model computes,
   its output values are copied to the Target model's `reference.*` inputs

3. **Compliance Computation**: Compliance ratio nodes depend on both:
   - Target values (e.g., `mechanical.heating.afue`)
   - Reference inputs (e.g., `reference.mechanical.heating.afue`)

4. **Recompute Target**: After copying Reference outputs, the Target model
   is recomputed to calculate compliance ratios

This pattern allows cross-model comparisons while keeping each model's
computation independent and maintaining the incremental computation benefits.

## F280 Section (CSA F280-12 Peak Load Compliance)

The F280 section implements CSA F280-12 peak load calculations for HVAC equipment
sizing compliance. Unlike the annual energy calculations (kWh/yr using degree-days),
F280 calculates **instantaneous peak loads** (Watts) using design-day temperatures.

### Key Relationship to Existing Nodes

| Annual Energy Formula | F280 Peak Load Formula |
|---|---|
| `Q = U × A × HDD × 24 / 1000` (kWh/yr) | `Q = U × A × ΔT` (Watts) |
| `Q_inf = 1.21 × NRL50 × A/N × HDD × 24 / 1000` | `Q_inf = 1.21 × NRL50 × A/N × ΔT` |
| `Q_vent = 1.21 × V × HDD × 24 / 1000` | `Q_vent = 1.21 × V × (1-ATRE) × ΔT` |

### F280 Parnas Tables

| File | ID | Description |
|---|---|---|
| `peak-envelope-heat-loss.json` | `f280.peakEnvelopeHeatLoss` | Peak heat loss through all envelope components |
| `peak-infiltration-heat-loss.json` | `f280.peakInfiltrationHeatLoss` | Peak air leakage heat loss |
| `peak-ventilation-heat-loss.json` | `f280.peakVentilationHeatLoss` | Peak ventilation heat loss (net of HRV/ERV recovery) |
| `total-design-heat-loss.json` | `f280.totalDesignHeatLoss` | **Total building design heat loss** (primary F280 output) |
| `total-design-heat-loss-btu.json` | `f280.totalDesignHeatLossBTU` | Design heat loss in BTU/h |
| `nominal-cooling-capacity.json` | `f280.nominalCoolingCapacity` | Nominal cooling capacity (sensible + latent) |
| `heating-sizing-compliance.json` | `f280.heatingSizingCompliance` | Heating capacity >= 100% of design loss |
| `cooling-sizing-compliance.json` | `f280.coolingSizingCompliance` | Cooling capacity 80-125% of nominal |
| `designer-certification.json` | `f280.designerCertification` | Designer credentials and attestation |
| `f280-input-summary.json` | `f280.inputSummary` | Mapping to F280 Form Page 2 fields |
| `f280-overall-compliance.json` | `f280.overallCompliance` | Aggregated pass/fail + cooling BTU conversion |

### F280 Sizing Rules

| Rule | Requirement | Standard Reference |
|---|---|---|
| Heating minimum | Installed capacity >= 100% of design heat loss | CSA F280-12 §5.2.7 |
| Cooling minimum | Installed capacity >= 80% of nominal cooling | CSA F280-12 §6.3.1 |
| Cooling maximum | Installed capacity <= 125% of nominal cooling | CSA F280-12 §6.3.1 |
| Small system exception | Nominal < 6000W: may exceed by up to 1750W | CSA F280-12 |

### Designer Certification Types

| Type | Full Name | Required For |
|---|---|---|
| NRCan EA | NRCan-Registered Energy Advisor | EnerGuide evaluations, rebate programs |
| TECA | Thermal Environmental Comfort Association | BC-recognized F280 calculations |
| P.Eng | Professional Engineer | Engineering design submissions |
| OAA | Ontario Association of Architects | Architectural submissions in Ontario |
| BCIN | Building Code Identification Number | Ontario building code submissions |

### Implementation

The F280 calculations are implemented in `src/sections/nodes/F280ComplianceNodes.js`,
which reuses existing computation graph inputs (envelope U×A values, climate design
temperatures, ventilation rates, air tightness parameters) and derives peak loads
from them.

## Emissions Section (S02/S05) — Embodied Carbon

The emissions section handles embodied carbon targets based on the selected carbon benchmarking standard.

### TGS4 Embodied Carbon Caps

The City of Toronto adopted embodied carbon caps that vary by **building category and tier**, NOT by material type. The material-specific values from "Figure 1" (created by Ryan Zizzo and Kelly Alvarez-Doran at Mantle Climate) were not adopted as-is.

| File | ID | Description |
|---|---|---|
| `tgs4-building-category.json` | `emissions.tgs4.buildingCategory` | Maps occupancy + storeys to TGS4 category |
| `embodied-carbon-target.json` | `building.embodiedCarbonTarget` | Embodied carbon cap by standard selection |

### Category Determination

The Part 9 vs Part 3 boundary for residential buildings is **3 storeys** (OBC threshold):

| Occupancy | Storeys | Category |
|---|---|---|
| C-Residential | ≤3 | Part 9 Low-Rise Residential |
| C-Residential | >3 | Part 3 Residential/Commercial |
| D-Business, E-Mercantile | any | Part 3 Residential/Commercial |
| A-Assembly, B-Institutional, F-Industrial | any | Part 3 Other |

### Adopted TGS4 Caps (kgCO2e/m²)

| Category | Tier 2 | Tier 3 |
|---|---|---|
| Part 9 Low-Rise Residential (A1-A3) | 250 | — |
| Part 3 Residential/Commercial (A1-A5) | 350 | 250 |
| Part 3 Other (A1-A5) | 400 | 275 |

### Terminology

Per Ryan Zizzo (Mantle Climate):
- **"embodied"** — emissions released to atmosphere (kgCO2e/m²)
- **"storage"** — carbon sequestered in materials
- Do NOT use "embedded"

## Code Generation

These specifications can be used to generate implementations in:
- JavaScript (current)
- TypeScript
- Python
- Rust
- Go
- Any language with basic numeric operations

## Validation

Each Parnas table can be validated against:
1. The legacy Section*.js implementations
2. The current computation graph nodes
3. Test case study results (12 buildings)
