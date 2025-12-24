# ComputationGraph System - Status & Plan

## Overview

Building a new ComputationGraph system to replace legacy StateManager calculations. The new system must be **standalone** - computing all values independently without syncing from legacy.

## Architecture

```
OLD SYSTEM (Legacy)                    NEW SYSTEM (ComputationGraph)
┌─────────────────────┐                ┌─────────────────────────────────┐
│ StateManager        │                │ ComputationGraph                │
│ - setValue/getValue │                │ - nodes (compute functions)     │
│ - calculateFull()   │                │ - inputs (user-editable)        │
│ - dependencies map  │                │ - topological sort              │
└─────────────────────┘                └─────────────────────────────────┘
                                                    │
                                       ┌────────────────────────────────┐
                                       │ MultiModelState                │
                                       │ - G-fields (shared geometry)   │
                                       │ - C-fields (per-model perf)    │
                                       └────────────────────────────────┘
                                                    │
                                       ┌────────────────────────────────┐
                                       │ MultiModelEngine               │
                                       │ - computeAllForModel()         │
                                       │ - incremental recomputation    │
                                       └────────────────────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `src/core/computation/ComputationGraph.js` | Dependency graph, topological sort |
| `src/core/model/MultiModelState.js` | G/C field separation, per-model state |
| `src/core/model/MultiModelEngine.js` | Computation engine |
| `src/sections/nodes/*.js` | Node definitions per domain |
| `src/core/DevTools.js` | Validation comparison UI |
| `test/computation/fullCalculation.test.html` | Browser validation test |

## Node Module Pattern

Each `*Nodes.js` file follows this pattern:

```javascript
(function () {
  window.TEUI.ComputationNodes.SectionName = { register };

  function register(graph) {
    // Register inputs (user-editable values)
    graph.registerInputs([
      { id: "semantic.path", legacyId: "d_XX", section: "SXX", ... }
    ]);

    // Register computed nodes
    graph.registerNode({
      id: "semantic.computed.path",
      legacyId: "e_XX",
      dependencies: ["semantic.path", ...],
      compute: (inputs) => {
        return /* pure calculation */;
      }
    });
  }
})();
```

---

# Phase 1: Validation Fix (CURRENT)

## Goal

Fix all validation mismatches so ComputationGraph produces identical values to legacy StateManager.

## Current State

- **Branch**: `mhp/apply-se-principles`
- **Commit**: `712c0e3` - Climate data lookup fix applied
- **Reset from**: Misguided approach that converted computed nodes to inputs

## Critical Lesson

**NEVER convert computed nodes to inputs that sync from StateManager!**

Wrong approach (reverted):
```javascript
// BAD - just copies legacy values, doesn't validate computation logic
graph.registerInput({
  id: "climate.heating.degreedays",
  legacyId: "d_20",  // Will sync from StateManager
});
```

Correct approach:
```javascript
// GOOD - computes independently, validates logic
graph.registerNode({
  id: "climate.heating.degreedays",
  legacyId: "d_20",
  dependencies: ["climate.location.province", "climate.location.city"],
  compute: (inputs) => {
    const data = getClimateData(inputs["climate.location.province"], inputs["climate.location.city"]);
    return data?.HDD ?? "Unavailable";
  }
});
```

## Validation Process

1. Open `test/computation/fullCalculation.test.html` in browser
2. Load a project file (loads into legacy StateManager)
3. Click "Validate":
   - Syncs INPUTS from StateManager to new system
   - Runs `engine.computeAllForModel()`
   - Compares each node's computed value vs StateManager's value
4. Fix mismatches by correcting computation logic
5. Test on MULTIPLE projects for robustness

## Known Issues

| Issue | Status | Fix |
|-------|--------|-----|
| Climate data lookup case sensitivity | Fixed | Case-insensitive city matching |
| "Heatpump" vs "Heat Pump" string | Pending | Normalize fuel type strings |
| Rounding precision differences | Check | Match legacy rounding |
| KeyValuesNodes reference workaround | Acceptable | Uses actual as ref proxy |

---

# Phase 2: Multi-Model Architecture (FUTURE)

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
- Multiple target variants

---

# Field Classification

- **G-fields (Geometry)**: Shared across all models (location, floor area, volume)
- **C-fields (Code/Performance)**: Model-specific (envelope R-values, mechanical efficiency)
- **A-fields (All other)**: Model-specific metadata

When G-field changes → recompute all models
When C-field changes → recompute only that model
