# OBJECTIVE Technical Documentation

This document explains how OBJECTIVE handles realtime calculations and provides step-by-step instructions for adding new inputs and calculations.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Realtime Calculation System](#realtime-calculation-system)
   - [Data Flow](#data-flow)
   - [ComputationGraph: Dependency Tracking](#computationgraph-dependency-tracking)
   - [IncrementalEngine: Smart Recomputation](#incrementalengine-smart-recomputation)
   - [Dual-State Architecture (Target & Reference)](#dual-state-architecture-target--reference)
   - [DOM Synchronization](#dom-synchronization)
3. [How to Add a New Input](#how-to-add-a-new-input)
4. [How to Add a New Calculation](#how-to-add-a-new-calculation)
5. [Complete Walkthrough: Adding a New Input and Calculation](#complete-walkthrough-adding-a-new-input-and-calculation)
6. [Section Reference](#section-reference)
7. [Field Classification (G/C/A)](#field-classification-gca)
8. [Testing and Validation](#testing-and-validation)

---

## Architecture Overview

OBJECTIVE is a pure client-side JavaScript application with no backend server. All calculations run in the browser using a dependency graph that tracks relationships between inputs and computed values.

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  User Input (HTML form)                                     │
│       │                                                     │
│       ▼                                                     │
│  StateManager ──► setValue() ──► markDependentsDirty()       │
│       │                                                     │
│       ▼                                                     │
│  Calculator.calculateAll()                                  │
│       │                                                     │
│       ├──► ComputationIntegration.populateReferenceModel()   │
│       ├──► ComputationIntegration.computeAllWithReference()  │
│       │         │                                           │
│       │         ├──► ComputationGraph (dependency DAG)       │
│       │         └──► IncrementalEngine (recompute dirty)     │
│       │                   │                                 │
│       │                   └──► MultiModelState              │
│       │                         ├── Target model            │
│       │                         └── Reference model         │
│       │                                                     │
│       ├──► syncToStateManager()                              │
│       ├──► syncReferenceToStateManager()                     │
│       └──► DOMBridge.stampAll() ──► Update HTML              │
│                                                             │
│  localStorage (auto-save, debounced)                        │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

| File | Purpose |
|------|---------|
| `src/core/StateManager.js` | Stores all field values, notifies listeners on changes, persists to localStorage |
| `src/core/Calculator.js` | Orchestrates the full calculation pipeline |
| `src/core/computation/ComputationGraph.js` | Directed acyclic graph (DAG) of node dependencies |
| `src/core/computation/IncrementalEngine.js` | Recomputes only affected nodes when an input changes |
| `src/core/computation/ComputationIntegration.js` | Wires the graph, engine, and state together |
| `src/core/model/MultiModelState.js` | Manages dual Target/Reference model state |
| `src/core/DOMBridge.js` | Pushes computed values from the graph back into the HTML DOM |
| `src/sections/Section##.js` | Defines inputs, layout, and UI for each calculator section |
| `src/sections/nodes/*Nodes.js` | Registers computation nodes (inputs + calculations) with the graph |

---

## Realtime Calculation System

### Data Flow

When a user changes an input field, the following chain of events executes in real time:

1. **User edits a field** → the HTML input fires a change event
2. **StateManager.setValue()** is called with the new value
3. **markDependentsDirty()** marks all downstream fields as needing recalculation
4. **Calculator.calculateAll()** runs the full pipeline:
   - Populates the Reference model with code-standard values
   - The **IncrementalEngine** walks the **ComputationGraph** to find affected nodes
   - Nodes are recomputed in topological order (dependencies first)
   - Both **Target** and **Reference** models are computed
5. **syncToStateManager()** writes computed values back to StateManager
6. **DOMBridge.stampAll()** pushes all values into the HTML DOM
7. The user sees updated results, typically within 10–50 ms

### ComputationGraph: Dependency Tracking

The `ComputationGraph` is a directed acyclic graph (DAG) that tracks which values depend on which other values. It has two types of nodes:

- **Input nodes** — leaf nodes representing user-editable values (no `compute` function)
- **Computation nodes** — nodes with a `compute` function and a list of `dependencies`

When a node is registered, the graph builds bidirectional edges:

- **upstream**: "what does this node depend on?" (its `dependencies` array)
- **downstream**: "what nodes depend on this one?" (reverse lookup)

This allows the engine to efficiently answer: "If input X changes, which calculations need to be re-run?"

Here is how nodes are registered (from `ComputationGraph.js`):

```javascript
// Register an input node (user-editable, no compute function)
registerInput(input) {
  inputs.set(input.id, input);
  if (!downstream.has(input.id)) {
    downstream.set(input.id, new Set());
  }
}

// Register a computation node (has dependencies and a compute function)
registerNode(node) {
  nodes.set(node.id, node);
  _cachedComputeOrder = null; // invalidate cache

  // Build upstream edges (what this node depends on)
  upstream.set(node.id, new Set(node.dependencies));

  // Build downstream edges (reverse: what depends on each dependency)
  for (const dep of node.dependencies) {
    if (!downstream.has(dep)) {
      downstream.set(dep, new Set());
    }
    downstream.get(dep).add(node.id);
  }
}
```

### IncrementalEngine: Smart Recomputation

When an input changes, the `IncrementalEngine` does **not** recompute every node. Instead, it:

1. **Updates** the changed value in state
2. **Finds all affected downstream nodes** using `graph.getDownstream(changedNodeId)`
3. **Topologically sorts** the affected nodes so dependencies are computed before dependents
4. **Computes each affected node** by gathering its dependency values and calling its `compute` function

```javascript
recompute(changedNodeId, newValue) {
  // 1. Update the changed value
  currentState.set(changedNodeId, newValue);

  // 2. Find all affected downstream nodes
  const affected = graph.getDownstream(changedNodeId);

  // 3. Sort in dependency order
  const computeOrder = graph.topologicalSort(affected);

  // 4. Compute each node
  for (const nodeId of computeOrder) {
    this._computeNode(nodeId);
  }
}

_computeNode(nodeId) {
  const node = graph.getNode(nodeId);

  // Gather dependency values from current state
  const inputs = {};
  for (const dep of node.dependencies) {
    inputs[dep] = currentState.get(dep);
  }

  // Call the node's compute function
  const result = node.compute(inputs);
  currentState.set(nodeId, result);
}
```

This approach is efficient: changing a single input typically recomputes only the 5–50 downstream nodes that actually depend on it, rather than all 200+ nodes in the graph.

### Dual-State Architecture (Target & Reference)

OBJECTIVE computes two models simultaneously:

- **Target model** — the building design the user is creating
- **Reference model** — the code-compliant baseline for comparison

The `MultiModelState` manages this by classifying every field:

| Classification | Meaning | Behavior |
|---|---|---|
| **G** (Geometry) | Location and geometry data | Shared across both models (same building shape and climate) |
| **C** (Code) | Performance and code values | Independent per model (different insulation, efficiency, etc.) |
| **A** (All other) | Everything else | Independent per model |

When the user changes a G-field (e.g., city or floor area), both models update. When the user changes a C-field (e.g., wall insulation), only the Target model updates; the Reference model keeps its code-standard value.

```javascript
// From MultiModelState.js — field classification
function getClassification(fieldPath) {
  // G-fields: geometry and location (shared across models)
  if (fieldPath.startsWith("geometry.") ||
      fieldPath.startsWith("climate.location.") ||
      fieldPath.startsWith("climate.heating.")) {
    return "G";
  }
  // C-fields and A-fields: model-specific
  // ...
}
```

### DOM Synchronization

After calculation, `DOMBridge.stampAll()` iterates over all computed values and pushes them into the HTML DOM. Each field has a `fieldId` (e.g., `"h_32"`) that maps to a DOM element. The DOMBridge finds each element and updates its displayed value, so the UI always reflects the latest computed state.

---

## How to Add a New Input

Adding a new input requires changes to two files: a **Section file** (for the UI) and a corresponding **Nodes file** (for the computation graph).

### Step 1: Define the field in the Section file

Open the appropriate `src/sections/Section##.js` file and add a new row in the `sectionRows` object. Each row has a numeric key and defines cells for the UI columns.

```javascript
// In src/sections/Section##.js, inside the sectionRows object:
42: {
  id: "X.1",                          // Row identifier
  rowId: "X.1",
  label: "My New Input",
  cells: {
    c: { label: "My New Input" },      // Column C: label
    d: {                               // Column D: input field
      fieldId: "d_42",                 // Unique DOM field ID
      semanticPath: "mySection.myInput", // Semantic path for the graph
      type: "editable",               // Input type (see below)
      value: "100",                    // Default value
      section: "mySection",           // Section grouping
      tooltip: true,
    },
    e: { content: "m²" },             // Column E: units
  },
},
```

**Available input types:**

| Type | Description | Extra Properties |
|------|-------------|-----------------|
| `editable` | Free-text numeric input | — |
| `dropdown` | Select from predefined options | `dropdownId`, `options: [{ value, name }]` |
| `year_slider` | Year range slider | `min`, `max`, `step` |
| `slider` | Numeric range slider | `min`, `max`, `step` |
| `display` | Read-only calculated value | — |

### Step 2: Register the input in the Nodes file

Open or create the corresponding `src/sections/nodes/*Nodes.js` file and register the input with the computation graph:

```javascript
// In the register(graph) function of the Nodes file:
graph.registerInput({
  id: "mySection.myInput",       // Must match semanticPath from the Section file
  legacyId: "d_42",              // Must match fieldId from the Section file
  section: "S##",                // Section number
  classification: "C",           // G, C, or A (see Field Classification below)
  label: "My New Input",
  defaultValue: 100,
});
```

### Step 3: Add to ExcelMapper (optional)

If you want the field to be included in CSV/Excel import and export, add a mapping in `src/core/ExcelMapper.js`:

```javascript
// In the excelReportInputMapping object:
D_42: "d_42",
```

---

## How to Add a New Calculation

A calculation is a **computation node** that derives its value from one or more dependencies.

### Step 1: Register the computation node

In the appropriate `src/sections/nodes/*Nodes.js` file, add a `registerNode` call:

```javascript
graph.registerNode({
  id: "mySection.myCalculation",    // Unique semantic path
  legacyId: "h_42",                 // Unique DOM field ID
  section: "S##",                   // Section number
  classification: "C",              // G, C, or A
  label: "My Calculated Value",
  dependencies: [                   // List of semantic paths this depends on
    "mySection.myInput",
    "building.conditionedFloorArea",
  ],
  compute: (inputs) => {
    // Access dependency values by their semantic path
    const myInput = parseFloat(inputs["mySection.myInput"]) || 0;
    const area = parseFloat(inputs["building.conditionedFloorArea"]) || 1;

    // Return the computed value
    return myInput / area;
  },
});
```

**Key rules for `compute` functions:**
- The `inputs` parameter is an object keyed by dependency semantic paths
- Always handle missing or invalid values (use `parseFloat`, default to 0 or 1)
- Return a single numeric value (or a string like `"Unavailable"` for error states)
- The function must be pure — no side effects, no DOM access

### Step 2: Display the result in the Section file

Add a display cell for the computed value in the Section's `sectionRows`:

```javascript
// In the same or another row in sectionRows:
cells: {
  // ...
  h: {
    fieldId: "h_42",               // Must match legacyId from registerNode
    type: "display",               // Read-only display
    classes: ["text-right"],
  },
}
```

### Step 3: Verify the dependency chain

The computation graph automatically connects your node. When any of its dependencies change, the IncrementalEngine will:

1. Detect the change
2. Find your node as a downstream dependent
3. Recompute your node with the updated dependency values
4. Push the new value to the DOM

No additional wiring is needed.

---

## Complete Walkthrough: Adding a New Input and Calculation

This example adds a "Cost per Square Meter" calculation to Section 02 (Building Information), derived from the existing Conditioned Floor Area and a new Total Building Cost input.

### 1. Add the input field to Section02.js

In `src/sections/Section02.js`, add a new row in `sectionRows`:

```javascript
// Add after the existing rows in sectionRows:
43: {
  id: "B.NEW",
  rowId: "B.NEW",
  label: "Total Building Cost",
  cells: {
    c: { label: "Total Building Cost" },
    d: {
      fieldId: "d_43",
      semanticPath: "building.totalCost",
      type: "editable",
      value: "500000",
      section: "buildingInfo",
      tooltip: true,
    },
    e: { content: "$" },
    f: { content: "", classes: ["label-prefix"] },
    g: { content: "Cost per m²", classes: ["label-main"] },
    h: {
      fieldId: "h_43",
      type: "display",
      classes: ["text-right"],
    },
    i: { content: "$/m²" },
  },
},
```

### 2. Register input and computation in BuildingInfoNodes.js

In `src/sections/nodes/BuildingInfoNodes.js`, add to the `register(graph)` function:

```javascript
// Register the new input
graph.registerInput({
  id: "building.totalCost",
  legacyId: "d_43",
  section: "S02",
  classification: "C",
  label: "Total Building Cost ($)",
  defaultValue: 500000,
});

// Register the computed node
graph.registerNode({
  id: "building.costPerSquareMeter",
  legacyId: "h_43",
  section: "S02",
  classification: "C",
  label: "Cost per Square Meter ($/m²)",
  dependencies: [
    "building.totalCost",
    "building.conditionedFloorArea",
  ],
  compute: (inputs) => {
    const cost = parseFloat(inputs["building.totalCost"]) || 0;
    const area = parseFloat(inputs["building.conditionedFloorArea"]) || 1;
    return Math.round(cost / area);
  },
});
```

### 3. What happens at runtime

1. The user types `750000` into the "Total Building Cost" field
2. `StateManager.setValue("d_43", "750000", "USER_MODIFIED")` fires
3. `markDependentsDirty("d_43")` marks `h_43` as dirty
4. `Calculator.calculateAll()` runs
5. The `IncrementalEngine` finds that `building.costPerSquareMeter` depends on `building.totalCost`
6. It calls the `compute` function with `{ "building.totalCost": 750000, "building.conditionedFloorArea": 1427.2 }`
7. The function returns `Math.round(750000 / 1427.2)` = `525`
8. `DOMBridge.stampAll()` updates the DOM element for `h_43` to display `525`
9. The user sees "525 $/m²" update in real time

---

## Section Reference

OBJECTIVE is organized into 21 sections, each handling a different aspect of building energy calculation:

| Section | File | Purpose |
|---------|------|---------|
| **S01** | `Section01.js` | Key Values — animated display of TEUI, TEDI, carbon targets |
| **S02** | `Section02.js` | Building Information — occupancy, floor area, service life |
| **S03** | `Section03.js` | Climate Calculations — HDD/CDD, weather data lookup |
| **S04** | `Section04.js` | Actual Energy — utility bills, fuel consumption |
| **S05** | `Section05.js` | CO₂e Emissions — embodied carbon by standard |
| **S06** | `Section06.js` | Renewable Energy — PV, wind, offsets |
| **S07** | `Section07.js` | Water & DHW — water consumption, heating efficiency |
| **S08** | `Section08.js` | Indoor Air Quality — ventilation rates, CO₂ targets |
| **S09** | `Section09.js` | Occupancy & Internal Gains — people, equipment, lighting |
| **S10** | `Section10.js` | Radiant Gains — solar transmission through windows |
| **S11** | `Section11.js` | Transmission Losses — envelope R-values, infiltration |
| **S12** | `Section12.js` | Volume & Surface Metrics — geometry calculations |
| **S13** | `Section13.js` | Mechanical Loads — heating/cooling capacity, COP |
| **S14** | `Section14.js` | TEDI & TELI — thermal energy demand intensity |
| **S15** | `Section15.js` | TEUI — total energy use intensity (final metric) |
| **S16** | `Section16.js` | Sankey Diagram — D3 energy flow visualization |
| **S17** | `Section17.js` | Dependency Graph — D3 field relationship visualization |
| **S18** | `Section18.js` | Parallel Coordinates — optimization parameter sweep |
| **S19** | `Section19.js` | WOMBAT 3D — thermal topology envelope visualization |
| **S20** | `Section20.js` | Notes & Debug — calculation trace, diagnostics |
| **S21** | `Section21.js` | CSA F280 — compliance form generation |

Each section has a corresponding Nodes file in `src/sections/nodes/` that registers its inputs and calculations with the computation graph.

---

## Field Classification (G/C/A)

Every field is classified to control how it behaves in the dual-state model:

| Classification | Name | Behavior | Examples |
|---|---|---|---|
| **G** | Geometry | Shared across Target and Reference models | Floor area, building height, city/location, climate data |
| **C** | Code | Independent per model — Target uses user values, Reference uses code standards | Wall insulation (RSI), window U-value, HVAC efficiency |
| **A** | All other | Independent per model | Utility bills, occupancy schedules, custom notes |

**When to use each classification:**
- Use **G** if the value describes the physical building or its location — changing it should update both models
- Use **C** if the value describes performance that differs between a user's design and the code baseline
- Use **A** for everything else (this is the default/safest choice)

---

## Testing and Validation

### Automated Tests (Playwright)

```bash
npm test                # Run all Playwright tests
npm run test:ui         # Interactive test UI
npm run test:debug      # Debug mode with inspector
npm run test:report     # View HTML test report
```

The test suite includes:
- **Case study validation** (`caseStudyValidation.spec.cjs`) — imports 12 real-world building CSVs and validates calculations match expected baselines
- **Graph parity** (`graphParity.spec.cjs`) — verifies the computation graph produces the same results as the legacy calculation system
- **Undo/revert** (`undoRevert.spec.cjs`) — tests the three-tier reset system
- **Observer pattern** (`observer-pattern.spec.cjs`) — validates the event notification system

### Browser Console Testing

Open the calculator in a browser and use the developer console:

```javascript
// Run built-in computation tests
TEUI.ComputationTests.runAll();

// Trigger a full recalculation
TEUI.Calculator.calculateAll();

// Inspect a field value
TEUI.StateManager.getValue("h_32");

// Export the full dependency graph for debugging
TEUI.StateManager.exportDependencyGraph("target");

// Access the computation system directly
TEUI.ComputationSystem.graph;   // The ComputationGraph instance
TEUI.ComputationSystem.state;   // The MultiModelState instance
TEUI.ComputationSystem.engine;  // The IncrementalEngine instance
```

### Code Quality

```bash
npm run lint            # ESLint check
npm run lint:fix        # Auto-fix lint issues
npm run format:check    # Prettier formatting check
npm run format:write    # Auto-format code
```
