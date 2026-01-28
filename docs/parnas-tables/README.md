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
├── climate/                  # S03 - Climate calculations
├── energy/                   # S04/S14/S15 - Energy metrics
├── internal-gains/           # S09 - Occupants, plugs, lighting, equipment
├── mechanical/               # S13 - Heating, cooling, ventilation, compliance
└── transmission-loss/        # S11 - Envelope heat transfer
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
