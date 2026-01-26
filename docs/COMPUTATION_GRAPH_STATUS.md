# ComputationGraph System - Status & Plan

## Overview

Building a new ComputationGraph system to replace legacy StateManager calculations. The new system must be **standalone** - computing all values independently without syncing from legacy.

## Current Status (January 2025)

| Metric | Status |
|--------|--------|
| **Case Study Validation** | 12/12 passing (100%) |
| **Field Matches** | ~340 exact matches per case study |
| **Close Matches** | ~9 within 0.02% (floating point precision) |
| **Mismatches** | 0 |

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
| `WaterHeatingNodes.js` | S07 | DHW calculations |

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

## USE_COMPUTATION_GRAPH Cutover Investigation (January 2025)

When `USE_COMPUTATION_GRAPH = true` in `init.js`, Calculator.calculateAll() bypasses legacy Section*.js and relies entirely on the ComputationGraph. This revealed several issues:

### Issue 1: Cooling.js Values Not Available

The Cooling module (`Cooling.js`) computes psychrometric values and stores them as:
- `cooling_h_124` - Free cooling potential (raw)
- `cooling_m_124` - Days active cooling required
- `cooling_latentLoadFactor` - Latent load multiplier

Section13 then transforms these values (e.g., applying ventilation setback) and writes to the final fields (`h_124`, `m_124`). When legacy is bypassed, this transformation doesn't happen.

**Impact**: `m_129` (CED mitigated) = 0 because `h_124` has wrong/missing value.

**Solution Required**: Either:
1. Run Cooling.js and Section13's freeCooling calculation before graph sync, OR
2. Implement the transformation logic as computed nodes in the graph

### Issue 2: Field Value Differences

Some fields show different values between legacy and graph:
- `h_124`: Graph gets raw Cooling.js value instead of Section13-adjusted value
- `d_114`, `d_117`: Downstream calculations affected by CED chain

### Issue 3: COP Comparisons in Tests

The test script was comparing wrong field pairs:
- `copHeat` compared j_113 (coolDerived) vs mechanical.heating.copHeat (h_113)
- `copCool` compared k_116 (doesn't exist) vs effectiveCop

This was fixed by updating test comparisons, but highlights the need for careful field mapping.

### Current Status

- `USE_COMPUTATION_GRAPH = false` by default (12/12 tests pass)
- Enabling cutover requires solving Cooling.js value flow
- All other graph calculations match legacy when h_124/m_124 are correct

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
