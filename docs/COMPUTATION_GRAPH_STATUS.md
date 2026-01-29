# ComputationGraph System - Status & Plan

## Overview

Building a new ComputationGraph system to replace legacy StateManager calculations. The new system must be **standalone** - computing all values independently without syncing from legacy.

## Current Status (January 28, 2026)

| Metric | Status |
|--------|--------|
| **Case Study Validation** | 12/12 passing (100%) |
| **Field Matches** | 329–338 exact matches per case study |
| **Close Matches** | 0–9 within 0.02% (floating point precision) |
| **Mismatches** | 0 |
| **Computed Nodes** | 7 former INPUTs now graph-native COMPUTED (h_70, i_71, k_71, e_51, k_54, d_65, d_67) |
| **Cutover Ready** | No — widespread failures when legacy bypassed |

### Performance Benchmarks

```
=== Performance Comparison (20 iterations) ===
Legacy (StateManager + Section recalcs): 168.92ms avg
New - Full Recalc (computeAll):          0.68ms avg
New - Incremental (single value change): 0.03ms avg

Speedup vs Legacy:
  Full recalc:   248x faster
  Incremental:   5,631x faster
```

Run benchmark: `node test/perf-test.cjs`

### Why So Fast?

1. **No DOM manipulation** during calculation
2. **Topological sort** ensures each node computed once
3. **Incremental updates** only recompute downstream nodes
4. **Pure JavaScript** vs jQuery/DOM event propagation

## Architecture

```
OLD SYSTEM (Legacy)                    NEW SYSTEM (ComputationGraph)
┌─────────────────────┐                ┌─────────────────────────────────┐
│ StateManager        │                │ ComputationGraph                │
│ - setValue/getValue │                │ - nodes (compute functions)     │
│ - calculateFull()   │                │ - inputs (user-editable)        │
│ - dependencies map  │                │ - topological sort              │
└─────────────────────┘                └─────────────────────────────────┘
         │                                          │
         │ ~170ms                                    │ ~0.03ms
         ▼                                          ▼
┌─────────────────────┐                ┌────────────────────────────────┐
│ Section*.js         │                │ MultiModelState                │
│ - DOM updates       │                │ - G-fields (shared geometry)   │
│ - Event propagation │                │ - C-fields (per-model perf)    │
└─────────────────────┘                └────────────────────────────────┘
         │                                          │
         ▼                                          ▼
┌─────────────────────┐                ┌────────────────────────────────┐
│ UI (DOM)            │                │ IncrementalEngine              │
│                     │ ◄──── NOT ────►│ - onValueChange() 0.03ms       │
│                     │   CONNECTED    │ - computeAll() 0.68ms          │
└─────────────────────┘    YET         └────────────────────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `src/core/computation/ComputationGraph.js` | Dependency graph, topological sort |
| `src/core/computation/IncrementalEngine.js` | Incremental recomputation engine |
| `src/core/computation/ComputationIntegration.js` | Integration with legacy system |
| `src/core/model/MultiModelState.js` | G/C field separation, per-model state |
| `src/sections/nodes/*.js` | Node definitions per domain |
| `src/core/ui/DOMBridge.js` | DOM synchronization (not enabled yet) |
| `test/caseStudyValidation.spec.cjs` | Playwright validation tests |
| `test/perf-test.cjs` | Performance benchmark |

## Node Modules

| Module | Fields | Purpose |
|--------|--------|---------|
| `BuildingInfoNodes.js` | S02 | Building metadata, occupancy |
| `ClimateNodes.js` | S03 | HDD, CDD, temperatures |
| `EnergyNodes.js` | S04, S14, S15 | TED, CED, TEUI totals |
| `EnvelopeNodes.js` | S10, S11, S12 | Transmission losses/gains |
| `MechanicalNodes.js` | S13 | Heating/cooling systems, COP |
| `VentilationNodes.js` | S13 | Ventilation heat loss/gain |
| `RadiantGainsNodes.js` | S10 | Solar gains, SHGC |
| `KeyValuesNodes.js` | S01 | Summary metrics |
| `EmissionsNodes.js` | S05 | Carbon calculations |
| `RenewableNodes.js` | S06 | PV, wind, offsets |
| `WaterHeatingNodes.js` | S07 | DHW calculations + intermediates (e_52, j_51, e_53, j_52, d_54, e_51, k_54) |
| `OccupancyNodes.js` | S08 | Occupants, occupied hours |
| `InternalGainsNodes.js` | S09 | Internal gains (occupants, plugs, lighting, equipment), seasonal splits |

---

# Phase 1: Validation (COMPLETE)

## Achievements

- **12/12 case studies passing** validation
- Fixed precision issues (COP calculations, heat gain rates)
- Fixed formula bugs (d_129, h_10 override)
- Matched legacy behavior for all building types

## Fixes Applied

| Issue | Fix | Commit |
|-------|-----|--------|
| COP precision (copHeat, copCool) | toFixed(2) → toFixed(4) | `62ec56c` |
| h_10 TEUI override in Section15 | Removed duplicate setValue | `74f05f2` |
| d_129 formula in Section14 | Fixed overwrite bug | Earlier |
| Heat gain/loss rates | toFixed(2) → toFixed(4) | `7ca05dd` |
| U-value conversions | toFixed(3) → toFixed(4) | `7ca05dd` |

---

# Phase 1.5: Intermediate Node Conversion (COMPLETE)

Converted 5 intermediate INPUTs from legacy-synced to graph-native COMPUTED nodes, plus added 10 new intermediate computed nodes.

## Converted Nodes (INPUT → COMPUTED)

| Legacy ID | Semantic ID | Was | Now | Module |
|-----------|-------------|-----|-----|--------|
| `h_70` | `energy.plugLoads.subtotal` | INPUT in EnergyNodes | COMPUTED in InternalGainsNodes | S09 |
| `i_71` | `internal.heatingGains` | INPUT in RadiantGainsNodes | COMPUTED in InternalGainsNodes | S09 |
| `k_71` | `internal.coolingLoad.occupants` | INPUT in EnergyNodes | COMPUTED in InternalGainsNodes | S09 |
| `e_51` | `waterHeating.gasVolume` | INPUT in EmissionsNodes | COMPUTED in WaterHeatingNodes | S07 |
| `k_54` | `waterHeating.oilVolume` | INPUT in EmissionsNodes | COMPUTED in WaterHeatingNodes | S07 |
| `d_65` | `internal.plugLoadDensity` | INPUT | COMPUTED with lookup (standard + building type) | S09 |
| `d_67` | `internal.equipmentDensity` | INPUT | COMPUTED with lookup (building type × efficiency × elevators) | S09 |

## New Intermediate Computed Nodes

### WaterHeatingNodes.js (7 new)

| Legacy ID | Semantic ID | Formula |
|-----------|-------------|---------|
| `e_52` | `waterHeating.efficiencyDecimal` | d_52 / 100 |
| `j_51` | `waterHeating.netThermalDemand` | j_50 / e_52 |
| `e_53` | `waterHeating.energyRecovered` | j_51 × (d_53 / 100) |
| `j_52` | `waterHeating.netDemandAfterRecovery` | j_51 − e_53 |
| `d_54` | `waterHeating.systemLosses` | (e_52 ≤ 1) ? j_50 × factor : 0 |
| `e_51` | `waterHeating.gasVolume` | (type=Gas) ? j_52 / (0.0373 × 277.78 × e_52) : 0 |
| `k_54` | `waterHeating.oilVolume` | (type=Oil) ? j_52 / (10.18 × e_52) : 0 |

### InternalGainsNodes.js (4 inputs + 10 computed)

**Inputs:**

| Legacy ID | Semantic ID | Default |
|-----------|-------------|---------|
| `d_64` | `internal.activityLevel` | "Normal" (dropdown) |
| `d_66` | `internal.lightingDensity` | 1.5 W/m² |
| `g_67` | `internal.efficiencySpec` | "Regular" (dropdown) |
| `d_68` | `internal.elevators` | "No Elevators" (dropdown) |

**Computed nodes (including d_65/d_67 lookup tables):**

| Legacy ID | Semantic ID | Formula |
|-----------|-------------|---------|
| `d_65` | `internal.plugLoadDensity` | Lookup by standard + building type |
| `d_67` | `internal.equipmentDensity` | Lookup by building type × efficiency × elevators |
| `g_64` | `internal.occupants.wattsPerPerson` | Activity level → watts lookup |
| `h_64` | `internal.occupants.annual` | (g_64 × occupants × hours) / 1000 |
| `h_65` | `internal.plugLoads.annual` | (d_65 × area × hours) / 1000 |
| `h_66` | `internal.lighting.annual` | (d_66 × area × hours) / 1000 |
| `h_67` | `internal.equipment.annual` | (d_67 × area × hours) / 1000 |
| `h_70` | `energy.plugLoads.subtotal` | h_65 + h_66 + h_67 |
| `i_71` | `internal.heatingGains` | (h_70 + h_64 + d_54) × (365 − coolingDays) / 365 |
| `k_71` | `internal.coolingLoad.occupants` | (h_70 + h_64 + d_54) × coolingDays / 365 |

**d_65 Plug Load Density Logic:**
- PH Classic/Plus/Premium → 2.1 W/m²
- PHIUS/EnerPHit/PH Low Energy → 5 W/m²
- Residential/Care occupancies (C-, B1-, B2-, B3-) → 5 W/m²
- Otherwise → 7 W/m²

**d_67 Equipment Density Lookup Table** (11 building types × 2 efficiency × 2 elevator):
- Uses `equipmentLoadsTable` with fallback to 5.0 W/m²
- Reference model always uses g_67="Regular" (via ReferenceValues.js)

**Activity level mapping** (from SCHEDULES-3037.csv):
```
Relaxed:     96.71 W/person
Normal:     117.23 W/person
Active:     219.81 W/person
Hyperactive: 424.95 W/person
```

## Also Fixed

| Issue | Fix |
|-------|-----|
| `k_51` duplicate INPUT | Removed from EnergyNodes (already computed in WaterHeatingNodes) |
| `d_135`/`d_136` dependency | Changed from `energy.dhw.netElectrical` → `waterHeating.netElectricalDemand` |

## Validation

12/12 case studies passing, 0 mismatches. Commit: `aa74a2f`

## Running Validation

```bash
# Run all case study validations
npx playwright test test/caseStudyValidation.spec.cjs --reporter=list

# Expected output:
# Testing: 01-ThreeFeathersTerrace.csv
#   ✅ PASS (340 matches, 9 close)
# ...
# Testing: 12-AberdeenHouse.csv
#   ✅ PASS (338 matches, 11 close)
```

---

# Phase 2: UI Integration (NEXT)

## Current State

The new system runs in **parallel mode** - both systems compute independently but only legacy updates the UI.

From `init.js`:
```javascript
window.TEUI.ComputationIntegration.initialize({
  runInParallel: true,  // Both systems run independently
  autoSync: true
});
```

## Why Not Connected Yet?

> Adapter CANNOT be enabled - old sections call setValue constantly during calculations, causing infinite recursion. Migration requires rewriting sections, not just interception.

## USE_COMPUTATION_GRAPH Cutover Investigation

When `USE_COMPUTATION_GRAPH = true` in `init.js`, Calculator.calculateAll() bypasses legacy Section*.js and relies entirely on the ComputationGraph.

### Previously Fixed Issues

| Issue | Status | Details |
|-------|--------|---------|
| h_124 Free Cooling | FIXED | Computed node with ventilation setback transform |
| g_110 N-Factor | FIXED | Changed from INPUT to computed with lookup table |
| d_13 Reference standard | FIXED | Was using wrong field `l_13` |
| `ref_` prefix handling | FIXED | In syncFromStateManager and populateReferenceModel |
| Reference model population | FIXED | Loads from ReferenceValues.js |
| `ref_j_32` Reference energy | FIXED | C-field priority: CSV ref_ values > ReferenceValues.js > Target fallback. 12/12 case studies match within 5 kWh. |

### Latest Cutover Test (January 28, 2026)

Tested `USE_COMPUTATION_GRAPH = true` after Phase 1.5 intermediate node conversions. **Result: Widespread failures** — test timed out at case study 6 with many mismatches across all files.

**Failures observed:**

| Field | Problem | Root Cause |
|-------|---------|------------|
| `k_51` | = 0 | d_51/d_52 water heating inputs not populated without Section07 running |
| `h_70` | Doubled values | d_65/d_67 energy densities wrong without Section09 lookup tables |
| `h_124` | Exploded values | Cooling.js not running, psychrometric calculations missing |
| `m_43` | Wrong | Renewable values not populated without Section06 |
| `ref_j_32` | **FIXED** | Reference model now computed via `computeAllWithReference()` with correct C-field priority |
| `d_127` (TED) | Cascading error | Wrong i_71 from wrong h_70, cascades through all energy totals |

**Conclusion**: The graph cannot stand alone yet. Too many inputs depend on legacy Section*.js calculations that aren't yet implemented as graph nodes. The cutover is all-or-nothing — bypassing legacy sections means losing ALL their intermediate calculations.

### Cutover Blockers

The following legacy Section*.js calculations must be converted to graph nodes before cutover:

| Section | Missing Calculations | Priority |
|---------|---------------------|----------|
| Section07 | d_51/d_52 population, DHW method selection | **FIXED** — d_51="Electric" added to all standards in ReferenceValues.js |
| Section09 | d_65/d_67 lookup tables | **FIXED** — d_65/d_67 now COMPUTED with lookup tables, g_67/d_68 as INPUTs |
| Section06 | m_43 renewable energy values | **OK** — All renewable fields are INPUTs that sync correctly |
| Section04 | `ref_j_32` Reference total energy computation | **FIXED** — graph-computed for all 12 case studies |
| Section13/Cooling.js | Full psychrometric calculation chain | **PARALLEL OK** — Cooling.js outputs synced as INPUTs. Cutover requires implementing psychrometric calculations as graph nodes. |
| All Sections | Reference model C-field overrides | **FIXED** — CSV ref_ values now take priority over ReferenceValues.js |

**Section09 Fix** (completed 2026-01-28):
- d_65/d_67 converted from INPUTs to COMPUTED nodes with full lookup table logic
- g_67 (efficiency spec) and d_68 (elevators) added as INPUTs
- ReferenceValues.js updated: ALL standards now use g_67="Regular" (matching Section09.js legacy behavior)
- Previous issue (9/12 failures) was caused by PH standards having g_67="Efficient" in ReferenceValues.js while Section09.js forces g_67="Regular" for Reference model
- 12/12 case studies pass with d_65/d_67 computed natively

### Current Status (January 28, 2026)

- `USE_COMPUTATION_GRAPH = false` (11/12 ref_j_32 pass in parallel mode)
- **Parallel mode**: Both systems run, graph validated against legacy, legacy authoritative
- **ref_j_32**: 11/12 case studies match (AberdeenHouse has d_117 cooling demand difference)
- **CoolingNodes.js**: IMPLEMENTED — psychrometric calculations, free cooling, m_124 as graph-native nodes
- **Cooling.js guards**: ADDED — `USE_COMPUTATION_GRAPH` check skips initialization and listener registration
- **Section09**: **FIXED** — d_65/d_67 now COMPUTED with lookup tables
- **Cutover**: BLOCKED — times out at case 6, event loop blocked by Section*.js listeners

### Cutover Investigation (January 28, 2026)

Attempted `USE_COMPUTATION_GRAPH = true` with:
1. CoolingNodes.js implementing h_124, m_124, latentLoadFactor as graph-native
2. Cooling.js guards to skip initialization when cutover enabled

**Result: Still times out at case 6**

The timeout is NOT caused by:
- Disclaimer modal (fixed with localStorage pre-set in test)
- Cooling.js listeners (guarded with USE_COMPUTATION_GRAPH check)
- Error in validation code (inner try/catch added, no error thrown)

**Root cause hypothesis**: Section*.js listeners still fire when ComputationIntegration.syncToStateManager() writes values. These listeners call Section.calculateAll() which may:
1. Wait for values that the graph doesn't produce in the expected order
2. Trigger calculation cascades that overwhelm the event loop

**Path forward options**:
1. Add USE_COMPUTATION_GRAPH guards to all Section*.js calculateAll() functions
2. Implement a "listener suppression" mode in StateManager during cutover sync
3. Migrate remaining Section calculations to graph nodes incrementally

## Path to UI Integration

### Option A: DOMBridge (Partial)

Enable `DOMBridge` for read-only display of new system values:

```javascript
window.TEUI.ComputationIntegration.enableDOMBridge();
```

This binds DOM elements with `data-field-path` attributes to ComputationGraph values.

### Option B: Section Migration (Full)

Rewrite Section*.js files to use ComputationGraph instead of setValue loops:

```javascript
// OLD (legacy pattern)
function calculate() {
  const value = parseFloat(SM.getValue('d_20'));
  const result = value * 24;
  SM.setValue('d_21', result);  // Triggers cascade
}

// NEW (computation graph pattern)
// No Section code needed - defined in *Nodes.js
graph.registerNode({
  id: "climate.heating.something",
  dependencies: ["climate.heating.degreedays"],
  compute: (inputs) => inputs["climate.heating.degreedays"] * 24
});
```

---

# Phase 3: Multi-Model Architecture (FUTURE)

## Problem

KeyValuesNodes needs to compare Target vs Reference values, but compute functions only see one model.

Current workaround:
```javascript
// Uses actual values as "reference approximation"
compute: (inputs) => {
  const refEnergy = inputs["energy.actual.total"];  // Workaround
```

## Solution: Cross-Model Context

Add optional `context` parameter for nodes needing multi-model access:

```javascript
graph.registerNode({
  id: "keyValues.teui.reductionPercent",
  crossModel: true,
  compute: (inputs, context) => {
    const target = context.getModelValue("target", "energy.teui");
    const ref = context.getModelValue("reference", "energy.teui");
    return (1 - target / ref) * 100;
  }
});
```

## Future Use Cases

- Compare Target vs OBC Reference
- Compare Target vs NBC Reference
- Compare Target vs PHPP baseline
- Multiple target variants (design options)

---

# Field Classification

- **G-fields (Geometry)**: Shared across all models (location, floor area, volume)
- **C-fields (Code/Performance)**: Model-specific (envelope R-values, mechanical efficiency)
- **A-fields (All other)**: Model-specific metadata

When G-field changes → recompute all models
When C-field changes → recompute only that model

---

# Node Module Pattern

Each `*Nodes.js` file follows this pattern:

```javascript
(function () {
  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  const inputs = [
    {
      id: "semantic.input.path",
      legacyId: "d_XX",
      section: "SXX",
      label: "Human readable label",
      defaultValue: 0
    }
  ];

  const nodes = [
    {
      id: "semantic.computed.path",
      legacyId: "e_XX",
      dependencies: ["semantic.input.path", "other.dependency"],
      classification: "C",  // G, C, or A
      section: "SXX",
      label: "Computed value label",
      unit: "kWh/yr",
      compute: (inputs) => {
        const value = parseNum(inputs["semantic.input.path"], 0);
        return +(value * 24).toFixed(4);  // Use toFixed(4) for precision
      }
    }
  ];

  function register(graph) {
    inputs.forEach(i => graph.registerInput(i));
    nodes.forEach(n => graph.registerNode(n));
  }

  window.TEUI.ComputationNodes.SectionName = { register };
})();
```

---

# Testing

## Case Study Validation

```bash
npx playwright test test/caseStudyValidation.spec.cjs
```

Compares ~350 fields across 12 real building projects.

## Performance Benchmark

```bash
node test/perf-test.cjs
```

Measures:
- Legacy full recalc time
- New system full recalc time
- New system incremental update time

## Manual Browser Testing

Open `test/computation/fullCalculation.test.html`:
1. Load a CSV project file
2. Click "Validate" to compare systems
3. Review mismatches (should be 0)
