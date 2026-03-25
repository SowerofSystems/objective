# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The OBJECTIVE TEUI (Total Energy Use Intensity) Calculator is a web-based energy modeling tool for buildings in Canada. It performs dual-model calculations (Target vs Reference) to compare proposed building designs against code minimum requirements.

Two components:
1. **4012** (pre-production deployment) — Computation graph architecture with ~158 nodes
2. **OBC Matrix** — Ontario Building Code compliance matrix tool (`src/obc/`)

## Commands

```bash
# Linting and formatting
npm run lint         # Run ESLint checks
npm run lint:fix     # Auto-fix ESLint issues
npm run format:check # Check Prettier formatting
npm run format:write # Auto-format with Prettier

# Testing
npx playwright test test/caseStudyValidation.spec.cjs  # 12 case study validation
npx playwright test test/undoRevert.spec.cjs            # Undo/revert test
node test/perf-test.cjs                                 # Performance benchmark
node test/test-parity-quick.cjs                         # Quick parity smoke test

# Open calculators locally
open "OBJECTIVE/index.html"           # Main calculator
open "OBJECTIVE/src/obc/index.html"   # OBC Matrix
```

## Architecture

### Computation Graph (Single Source of Truth)

All calculations flow through a **directed acyclic graph** of ~158 computation nodes. The graph runs in two modes: full recalc (0.68ms) and incremental (0.03ms per single-value change).

```
User Input → DOMBridge → MultiModelEngine → ComputationGraph → MultiModelState → DOMBridge → DOM
                              │                     │
                              │                     ├── Target model computation
                              │                     └── Reference model computation
                              │
                              └── LegacyAdapter (bridge to StateManager)
```

**Key principle**: The computation graph computes values. The DOM displays them. StateManager is a legacy store bridged via LegacyAdapter — it does NOT drive calculations.

### Core Modules

#### Computation (`src/core/computation/`)
| File | Role |
|------|------|
| `ComputationGraph.js` | DAG of nodes with topological sort, incremental recomputation |
| `ComputationIntegration.js` | Wires graph to app: init, calculateAll(), REF_OUTPUT_TO_TARGET_INPUT mappings |
| `IncrementalEngine.js` | Detects changed inputs, recomputes only downstream nodes |
| `LegacyAdapter.js` | Intercepts StateManager.setValue/getValue to route through graph |
| `FieldRegistry.js` | Maps legacy field IDs (d_12) to semantic paths (building.storeys) |
| `types.js` | Node type definitions (INPUT, COMPUTED, REFERENCE_INPUT) |

#### Model (`src/core/model/`)
| File | Role |
|------|------|
| `MultiModelState.js` | Stores values for Target + Reference models by semantic path |
| `MultiModelEngine.js` | Orchestrates dual-model computation (target first, then reference) |
| `ModelMetadata.js` | Model IDs, labels, active model tracking |
| `ModelOperations.js` | Copy/compare operations between models |

#### UI (`src/core/ui/`)
| File | Role |
|------|------|
| `DOMBridge.js` | Reads inputs from DOM, stamps computed values back to DOM |
| `ModelSelector.js` | Target/Reference model toggle UI |
| `ComparisonView.js` | Side-by-side model comparison |

#### Legacy Core (`src/core/`)
| File | Role |
|------|------|
| `StateManager.js` | Legacy key-value store (bridged via LegacyAdapter, not authoritative) |
| `Calculator.js` | Calls `ComputationIntegration.calculateAll()` — no longer does calculations itself |
| `FieldManager.js` | Creates DOM elements (rows, cells, inputs); `writeUserInput()` routes user input to SM with ref_ prefix awareness |
| `FileHandler.js` | CSV import/export, syncPostImportUI for cascading dropdowns |
| `ReferenceToggle.js` | Target/Reference mode switching, mirror functions, `isReferenceMode()` |
| `Dependency.js` | Legacy dependency graph (visualized in Section 17) |
| `ReferenceValues.js` | Building code minimum values by standard |
| `ClimateValues.js` | Climate data (HDD, CDD, temperatures) by province/city |
| `init.js` | Application bootstrap sequence |

### Computation Nodes (`src/sections/nodes/`)

21 node modules define the computation graph inputs/outputs:

| Module | Domain |
|--------|--------|
| `ClimateNodes.js` | HDD, CDD, temperatures, design conditions |
| `BuildingInfoNodes.js` | Storeys, floor area, building type, standards |
| `VolumeMetricsNodes.js` | Volume, ACH, NRL50, air leakage |
| `TransmissionLossNodes.js` | U-values, R-values, weighted heat loss coefficients |
| `VentilationNodes.js` | Ventilation rates, HRV efficiency, schedule factors |
| `InternalGainsNodes.js` | Occupant/lighting/equipment loads |
| `RadiantGainsNodes.js` | Solar gains, utilization factors |
| `SpaceHeatingNodes.js` | Annual space heating energy |
| `CoolingNodes.js` | Psychrometric calculations, wet bulb, humidity |
| `MechanicalNodes.js` | HVAC equipment, COP/HSPF, electrical demand |
| `WaterHeatingNodes.js` | DHW energy |
| `EnergyNodes.js` | TED, CED, TEDI, CEDI, EUI intensity metrics |
| `EmissionsNodes.js` | GHG intensity, operational/embodied carbon |
| `KeyValuesNodes.js` | Summary KPIs for header display |
| `ComplianceNodes.js` | Target vs reference compliance ratios |
| `F280ComplianceNodes.js` | CSA F280 peak load sizing |
| `AirQualityNodes.js` | Indoor air quality metrics |
| `OccupancyNodes.js` | Occupancy schedules and counts |
| `RenewableNodes.js` | Renewable energy generation |
| `ForestryNodes.js` | Wood carbon storage |
| `SectionComplianceNodes.js` | Per-section compliance pass/fail (S08, S09, S11) |

Each node module is formally documented in `docs/parnas-tables/` (127 JSON files specifying inputs, outputs, secrets, preconditions, and effects).

### Sections (`src/sections/Section*.js`)

18 UI sections (S02–S21) define **layout only** — row definitions, cell configurations, dropdown options. All computation logic and the ModeManager/TargetState/ReferenceState dual-state pattern ("Pattern A") have been fully removed. Sections use:

- `sectionRows` object with cells keyed by column letter (c through n)
- `ROW_ORDER` array for explicit row ordering
- `createLayoutRow()` to convert to array format for FieldManager
- `section-subheader` CSS class triggers gray background via `:has()` selector
- `getModeAwareValue(fieldId)` utility to read mode-aware values from SM
- Optional `onModeSwitch(mode)` callback for sections needing UI updates on mode switch (S07, S12, S13, S21)

### Dual-Model System

The calculator runs two models simultaneously:
- **Target model**: User's proposed design values
- **Reference model**: Code minimum values (auto-derived from `d_13` building standard selection)

Field IDs: target uses base ID (`d_12`), reference uses `ref_` prefix (`ref_d_12`).

**User input routing**: `FieldManager.writeUserInput()` checks `ReferenceToggle.isReferenceMode()` and prefixes `ref_` when in reference mode. LegacyAdapter dual-writes `ref_*` fields to both the target model (under `reference.*` path) and the reference model (under base path).

**G-field independence**: G-fields (geometry) are stored per-model in MultiModelState. `populateReferenceModel()` copies from target but `ref_*` SM values (from CSV import or user edit) override.

`REF_OUTPUT_TO_TARGET_INPUT` in ComputationIntegration.js maps reference model outputs to target model `reference.*` inputs for compliance ratio calculations.

### calculateAll() Flow

```
Calculator.calculateAll()
  → ComputationIntegration.calculateAll()
    → populateReferenceModel()           # Copy shared inputs to reference
    → computeAllWithReference()           # Compute target, then reference
    → syncToStateManager()                # Graph → StateManager (for legacy consumers)
    → syncReferenceToStateManager()       # Reference values → ref_* fields
    → DOMBridge.stampAll()                # Push all values to DOM
    → postStamp()                         # S19 wombat, S18 parallel coordinates
```

### Undo/Reset System

3-tier reset: Tier 1 (undo to last import), Tier 2 (clear/reload), Tier 3 (factory reset).

`revertToLastImportedState()` in StateManager routes through `window.TEUI.StateManager.setValue` (public API → LegacyAdapter → graph) to ensure the computation graph is updated, then calls `syncPatternASections()` for cascading dropdown restoration.

## Field ID Convention

- Format: `[column]_[row]` (e.g., `d_12` for column D, row 12)
- Target variant: `d_12`
- Reference variant: `ref_d_12`
- Semantic path: `building.storeys` (mapped via FieldRegistry)

## Git Workflow

Standard feature branch workflow with PR review. CTO merges all PRs.

```bash
git checkout main && git pull origin main
git checkout -b FEATURE-NAME
# ... work, test locally ...
git push -u origin FEATURE-NAME
# Create PR via GitHub — wait for CTO review
```

- Commit ONLY when explicitly directed by user
- Push ONLY when explicitly directed by user
- Use `--force-with-lease` (never `--force`) for rebases

## Testing

| Test | Command | What it validates |
|------|---------|-------------------|
| Case study validation | `npx playwright test test/caseStudyValidation.spec.cjs` | 12 CSV imports, 632-635 field matches, 0 mismatches |
| Undo revert | `npx playwright test test/undoRevert.spec.cjs` | Province/city change → undo → SM/graph/DOM all revert |
| Performance | `node test/perf-test.cjs` | Full recalc <1ms, incremental <0.05ms |
| Quick parity | `node test/test-parity-quick.cjs` | Fast smoke test |

## Data Sources

- Climate data: `src/core/ClimateValues.js` (uses 666 as sentinel for unavailable — see TECHNICAL_DEBT.md)
- Building code values: `src/core/ReferenceValues.js`
- Case study CSVs: `test/case-studies/*.csv` (12 files)
- Parnas table specs: `docs/parnas-tables/` (127 JSON files)

## Documentation

| File | Contents |
|------|----------|
| `docs/CLAUDE.md` | This file — primary AI guidance |
| `docs/COMPUTATION_GRAPH_STATUS.md` | Graph architecture, benchmarks, validation status |
| `docs/parnas-tables/` | Formal node specifications (inputs, outputs, secrets, effects) |
| `docs/REFACTORING_PLAN.md` | Phase-by-phase refactoring roadmap |
| `docs/TECHNICAL_DEBT.md` | Known debt items (666 sentinel, etc.) |
| `docs/F280_COMPLIANCE_GAP_ANALYSIS.md` | F280 peak load compliance analysis |
| `docs/SEMANTIC_MIGRATION_PLAN.md` | Future: migrate legacy IDs to semantic paths |
| `docs/obsolete/` | Pre-graph development notes — **do not consume** |

## Repository Structure

```
objective/
├── docs/
│   ├── CLAUDE.md                    ← This file
│   ├── COMPUTATION_GRAPH_STATUS.md  ← Graph system status
│   ├── parnas-tables/               ← 127 node specification files
│   ├── obsolete/                    ← Archived pre-graph docs (do not consume)
│   └── development/                 ← Active feature docs (S16-S20, tooltips, etc.)
├── src/
│   ├── core/
│   │   ├── computation/             ← Graph engine (ComputationGraph, LegacyAdapter, etc.)
│   │   ├── model/                   ← Multi-model state (MultiModelState, MultiModelEngine)
│   │   ├── ui/                      ← DOM bridge, model selector, comparison view
│   │   ├── StateManager.js          ← Legacy state store (bridged, not authoritative)
│   │   ├── Calculator.js            ← Delegates to ComputationIntegration
│   │   ├── FieldManager.js          ← UI element creation
│   │   ├── FileHandler.js           ← CSV import/export
│   │   ├── ClimateValues.js         ← Climate data
│   │   ├── ReferenceValues.js       ← Code minimum values
│   │   └── init.js                  ← Bootstrap
│   ├── sections/
│   │   ├── nodes/                   ← 21 computation node modules
│   │   ├── Section01.js–Section21.js ← UI layout definitions (no computation)
│   │   └── SectionXX.js             ← Section template
│   ├── styles/                      ← CSS
│   └── obc/                         ← OBC Matrix tool
├── test/                            ← Playwright + node test suite
├── index.html                       ← Application entry point
└── package.json
```

## Debugging Best Practices

**Prefer console scripts over inline logging:**
- Provide console scripts for the user to run in browser console
- Don't add `console.log()` to source files (requires commit → test → revert cycle)
- Exception: permanent debug logging for critical production issues only

```javascript
// Example: check a graph value
console.log(window.TEUI.ComputationGraph.state.getValueForModel('target', 'energy.tedi.annual'));

// Example: check StateManager value
console.log(window.TEUI.StateManager.getValue('d_127'));
```
