# Section 19: WOMBAT - 3D Thermal Topology Visualization

**Branch**: `WOMBAT`
**Status**: Active Development
**Created**: 2025-12-08
**Major Update**: 2025-12-12 (Pattern A Dual-State Implementation - PR #63 Merged)
**Target Release**: 4.013

---

## Executive Summary

OBJECTIVE TEUI currently tracks comprehensive building envelope geometry (roof, walls, windows, doors, foundation) by orientation and thermal performance. However, this data exists as **area-based thermal abstractions** without spatial representation.

**WOMBAT** (like a wombat creates cubic output from inputs) leverages existing geometry data to generate a **3D thermal topology model** that:
- Visualizes building form derived from envelope areas and volumetric data
- Provides interactive exploration of thermal performance in 3D space
- Enables geometric validation (does my WWR visually match the building I designed?)
- Will create export-ready 3D models for integration with external tools (future phase)

This feature is implemented as **Section 19** following TEUI's modular Pattern A architecture with full dual-state support.

---

## Table of Contents

1. [Current Implementation Status](#current-implementation-status)
2. [Project Vision & Thermal Topology Philosophy](#project-vision--thermal-topology-philosophy)
3. [Architecture Overview](#architecture-overview)
4. [Pattern A Dual-State Implementation](#pattern-a-dual-state-implementation)
5. [Bidirectional Sync with Section 12](#bidirectional-sync-with-section-12)
6. [Geometry Solver (Constraint-Driven)](#geometry-solver-constraint-driven)
7. [Next Steps & Roadmap](#next-steps--roadmap)
8. [Known Issues](#known-issues)
9. [References & Resources](#references--resources)

---

## Current Implementation Status

### ✅ **Completed Features (PR #63 - Merged 2025-12-12)**

#### **Pattern A Dual-State Architecture** ✅

**TargetState & ReferenceState objects** ([Section19.js:45-127](../../src/sections/Section19.js#L45-L127))
- Sovereign state storage for Target/Reference modes
- Methods: `getValue()`, `setValue()`, `setDefaults()`, `syncFromGlobalState()`
- Field coverage: d_198, d_199, d_202, h_200, h_201, h_203

**ModeManager Facade** ([Section19.js:132-204](../../src/sections/Section19.js#L132-L204))
- Mode switching: `switchMode("target"|"reference")`
- Mode-aware StateManager publishing (unprefixed vs `ref_` prefixed)
- UI refresh on mode change: `refreshUI()`
- Calculated value updates: `updateCalculatedDisplayValues()`

#### **Dual-Engine Calculations** ✅

- **calculateTargetModel()** - Computes geometry from Target state, publishes unprefixed
- **calculateReferenceModel()** - Computes geometry from Reference state, publishes `ref_` prefixed
- **calculateAll()** - ALWAYS runs both engines (Pattern A requirement)
- **solveGeometry(isReferenceCalculation)** - Mode-aware constraint solver

#### **Bidirectional Synchronization with S12** ✅

**S12 → S19 sync** ([Section19.js:1062-1112](../../src/sections/Section19.js#L1062-L1112))
- d_105 → d_198 (volume)
- d_103 → d_199 (stories)
- ref_d_105 → ref_d_198
- ref_d_103 → ref_d_199
- Includes DOM updates via `updateWombatDOM()`
- Triggers `calculateAll()` → dual-engine + 3D visualization

**S19 → S12 sync** ([Section12.js:3086-3136](../../src/sections/Section12.js#L3086-L3136))
- d_198 → d_105 (volume) with `FieldManager.updateFieldDisplay()`
- d_199 → d_103 (stories) with direct dropdown value update
- ref_d_198 → ref_d_105
- ref_d_199 → ref_d_103
- Includes `calculateAll()` + `updateCalculatedDisplayValues()`

#### **3D Visualization (Canvas 2D Isometric)** ✅

- Isometric projection of building geometry
- Multi-story stacked visualization
- Per-floor area display (m²/floor)
- Dimension annotations (length, width, height in meters)
- Activation controls with status indicator
- Info modal explaining WOMBAT philosophy

#### **Geometry Solver** ✅

- Volume-first constraint satisfaction (d_105/d_198 is **SACRED**)
- Footprint calculation from conditioned area (h_15) and stories
- Aspect ratio control (slider d_202: -4 to +4, where 0 = square)
- Story height derivation from volume / footprint area
- Roof pitch calculation from roof area constraint (flat, gabled, or inverted)
- Wall height solving from wall area / perimeter

#### **Field Definitions** ✅

| Field ID | Label | Type | Default | Source |
|----------|-------|------|---------|--------|
| **d_198** | Conditioned Volume | number | 8000.00 | Mirrors S12 d_105 |
| **d_199** | Stories | dropdown | 1.5 | Mirrors S12 d_103 |
| **d_202** | Aspect Ratio (L:W) | coefficient_slider | 0.0 | User input (-4 to +4) |
| **h_200** | Footprint Length | calculated | 0.00 | Derived from volume |
| **h_201** | Footprint Width | calculated | 0.00 | Derived from volume |
| **h_203** | Story Height | calculated | 0.00 | Derived from volume |

---

### ⚠️ **Known Issues**

#### **1. Volume Field (d_198) Input Locked After First Edit** 🔴

**Status**: Under Investigation - Failed Attempts Documented
**Severity**: High - Blocks S19 → S12 user input flow
**Affects**: Volume field (d_198) input in S19 table
**Date Discovered**: 2025-12-12

**Symptoms:**
- ✅ First edit works: value syncs to S12, calculations update, 3D redraws
- ❌ Second click: field appears focused but rejects typed input
- ❌ Field becomes locked and unresponsive
- ✅ S12 → S19 direction works perfectly (editing d_105 updates d_198 correctly)
- ✅ Stories dropdown (d_199) works perfectly for bidirectional sync

**Evidence from Logs:**
```
[WOMBAT DOM] Volume field changed: d_198 = "10000"
[WOMBAT] ✅ Published d_198 = 10000 via ModeManager (target mode)
[WOMBAT] Solving geometry from thermal constraints (Target mode)...
[S12→WOMBAT] Syncing d_105 = 11000 from WOMBAT d_198
[WOMBAT SYNC] d_105 changed: 10000 → 11000
[WOMBAT] ✅ Synced d_198 = 11000 from S12 (d_105)
```

**Root Cause Hypothesis:**

**Circular Update Loop** (identified by user):
```
User edits d_198
  ↓
ModeManager.setValue("d_198", value)
  ↓
StateManager publishes "d_198"
  ↓
S12 listener catches "d_198" → updates d_105
  ↓
StateManager publishes "d_105"
  ↓
S19 listener (Section19.js:1058) catches "d_105" → calls updateWombatDOM("d_198")
  ↓
FieldManager.updateFieldDisplay() or DOM manipulation breaks active input field
  ↓
Field locks/becomes unresponsive
```

**Failed Fix Attempts** (reverted 2025-12-12):

**Attempt #1**: Field Type Mismatch Fix
- **Theory**: Field definition uses `type: "number"` → creates `<input type="number">`, not contenteditable div
- **Changes**:
  - Changed selector from `'[data-field-id="d_198"][contenteditable="true"]'` to `'[data-field-id="d_198"]'`
  - Changed event from `blur` to `change`
  - Changed value access from `.textContent` to `.value`
- **Result**: FAILED - Field still locks after first edit
- **Reverted**: Yes

**Attempt #2**: Focus Detection Guard
- **Theory**: Prevent updateWombatDOM() from modifying field while user is actively editing
- **Changes**: Added guard in `updateWombatDOM()`:
  ```javascript
  const element = document.querySelector(`[data-field-id="${fieldId}"]`);
  if (element && element === document.activeElement) {
    console.log(`[WOMBAT] Skipping DOM update for ${fieldId} (user is editing)`);
    return;
  }
  ```
- **Result**: FAILED - Field still locks after first edit
- **Reverted**: Yes

**Why Debugging is Difficult:**
- Cannot observe what happens during second edit attempt because field is already locked
- We're "locked out" from seeing the logs that would explain the failure
- First edit succeeds, so initial event handler attachment works correctly
- Something about the S12→S19 listener callback breaks the field's ability to accept subsequent input

**Alternative Approaches to Investigate:**
1. **Temporary StateManager logging**: Add extensive logging inside StateManager publish/notify cycle to trace exact event sequence
2. **Examine FieldManager global handlers**: Check if FieldManager has document-level blur/focus handlers that might conflict
3. **Compare with d_199 (stories dropdown)**: Dropdown works perfectly - examine why it doesn't break but number input does
4. **Test input[type="text"] instead of input[type="number"]**: Browser number inputs may have different focus/blur behavior
5. **Debounce updateWombatDOM calls**: Add 100ms debounce to prevent rapid-fire DOM updates during user interaction
6. **Listener deduplication**: Check if multiple listeners are being attached to same field (causing race conditions)

**Workaround:**
Use S12 d_105 field for volume input (bidirectional sync S12→S19 works correctly)

---

## Next Steps & Roadmap

### 🎯 **Immediate Priority 1: Fix Entangled Volume Input**

**Goal**: Resolve d_198 contenteditable field input blocking issue

**Observation**: Stories dropdown (d_199) works **perfectly** for bidirectional sync, so numeric input should function identically using the same pattern.

**Investigation Plan:**

1. **Debug field selector timing**
   ```javascript
   // Add logging at different lifecycle stages:
   console.log("[WOMBAT] onSectionRendered: d_198 field exists?",
     document.querySelector('[data-field-id="d_198"]'));

   // Try deferred attachment:
   setTimeout(() => {
     setupFieldListeners();
   }, 500); // After FieldManager completes rendering
   ```

2. **Compare with working dropdown pattern**
   - Stories dropdown (d_199) attaches via:
     ```javascript
     const storiesDropdown = sectionElement.querySelector('[data-field-id="d_199"]');
     storiesDropdown.addEventListener("change", ...)
     ```
   - Apply same simplified selector pattern to volume field

3. **Test alternative event strategies**
   ```javascript
   // Option A: Simplified selector (remove contenteditable requirement)
   const volumeField = sectionElement.querySelector('[data-field-id="d_198"]');

   // Option B: Global event delegation (like FieldManager blur handler)
   document.addEventListener('blur', (e) => {
     if (e.target.matches('[data-field-id="d_198"]')) {
       handleVolumeBlur(e);
     }
   }, true);

   // Option C: Use 'input' event instead of 'blur'
   volumeField.addEventListener('input', handleVolumeInput);
   ```

4. **Check field definition**
   - Verify `sectionRows.row198` includes `contenteditable: true` or `editable: true` in cell definition
   - Compare with other contenteditable number fields in S11/S12

**Success Criteria:**
- ✅ User can edit d_198 multiple times without field locking
- ✅ Each edit triggers S19→S12 sync + 3D visualization update
- ✅ Field maintains focus and cursor position during edit

---

### 🎨 **Immediate Priority 2: Enhanced Graphics Rendering**

**Goal**: Replace Canvas 2D with SVG vector graphics for D3-style clean lines, nodes, and dual-model visualization

#### **Why SVG over Canvas 2D?**

| Feature | Canvas 2D (Current) | SVG (Proposed) | Three.js (Future) |
|---------|---------------------|----------------|-------------------|
| **Vector quality** | Pixelated at zoom | Crisp at any scale | GPU-accelerated |
| **D3 integration** | Manual pixel math | Native D3 support | Requires bridge |
| **Node rendering** | Complex manual draw | Simple `<circle>` | `THREE.Mesh` |
| **Interactivity** | Manual hit detection | CSS hover, click | Raycasting API |
| **Styling** | Procedural fillStyle | CSS classes | Material shaders |
| **File size** | N/A (raster) | Small (vector) | Large (WebGL) |

**Decision**: Use **SVG for next phase** (easier D3 integration, matches S18 aesthetic), then migrate to **Three.js for Phase 4** (true 3D, export capabilities).

---

#### **Dual-Model Visualization Design**

Show Target vs Reference models simultaneously with interactive toggle:

```
┌─────────────────────────────────────────────────────────────┐
│  WOMBAT - 3D Thermal Topology                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Display Mode:                                               │
│  ( ) Target Only  ( ) Reference Only  (●) Both (Overlay)     │
│                                                               │
│         Target (Blue)           Reference (Red)              │
│       ┌────────────┐            ┌──────────┐                │
│      ╱│            │╲          ╱│          │╲               │
│     ╱ │            │ ╲        ╱ │          │ ╲              │
│    ╱  │   8000 m³  │  ╲      ╱  │  6500 m³ │  ╲             │
│   ●───●────────────●───●    ●──●──────────●──●            │
│   │   │            │   │    │  │          │  │             │
│   │   │  ▢ ▢ ▢    │   │    │  │  ▢ ▢    │  │             │
│   │   │            │   │    │  │          │  │             │
│   ●───●────────────●───●    ●──●──────────●──●            │
│                                                               │
│  Legend:                                                     │
│  ● Vertex nodes | ─ Edges (walls) | ▢ Windows               │
│  Blue = Target (Proposed) | Red = Reference (Baseline)      │
│                                                               │
│  [Rotate] [Reset View] [Export SVG] [Screenshot]            │
└─────────────────────────────────────────────────────────────┘
```

---

#### **Implementation Plan: SVG Graphics Upgrade**

**Phase 2A: SVG Rendering Engine** (Week 1)

1. **Replace Canvas with SVG container**
   ```javascript
   // Remove:
   const canvas = document.getElementById("wombat-canvas");
   const ctx = canvas.getContext("2d");

   // Add:
   const svg = d3.select("#wombat-canvas-container")
     .append("svg")
     .attr("width", config.canvasWidth)
     .attr("height", config.canvasHeight)
     .attr("viewBox", `0 0 ${config.canvasWidth} ${config.canvasHeight}`)
     .style("border", "1px solid #dee2e6");
   ```

2. **Port isometric projection to D3 scales**
   ```javascript
   function toIso(x, y, z) {
     const isoX = Math.cos(Math.PI / 6);
     const isoY = Math.sin(Math.PI / 6);
     return {
       x: centerX + (x - y) * isoX * scale,
       y: centerY - (x + y) * isoY * scale - z * scale,
     };
   }

   // Use D3 line generator
   const lineGenerator = d3.line()
     .x(d => d.x)
     .y(d => d.y);
   ```

3. **Render building edges as SVG lines**
   ```javascript
   const edges = [
     { from: toIso(-w/2, -l/2, z0), to: toIso(w/2, -l/2, z0) }, // Bottom front
     { from: toIso(w/2, -l/2, z0), to: toIso(w/2, l/2, z0) },   // Bottom right
     // ... all 12 edges of box
   ];

   svg.selectAll("line.edge")
     .data(edges)
     .enter().append("line")
     .attr("class", "edge")
     .attr("x1", d => d.from.x)
     .attr("y1", d => d.from.y)
     .attr("x2", d => d.to.x)
     .attr("y2", d => d.to.y)
     .attr("stroke", "#007bff")
     .attr("stroke-width", 2)
     .attr("stroke-linecap", "round");
   ```

4. **Add vertex nodes as circles**
   ```javascript
   const vertices = [
     toIso(-w/2, -l/2, z0), // Bottom front-left
     toIso(w/2, -l/2, z0),  // Bottom front-right
     // ... all 8 vertices
   ];

   svg.selectAll("circle.vertex")
     .data(vertices)
     .enter().append("circle")
     .attr("class", "vertex")
     .attr("cx", d => d.x)
     .attr("cy", d => d.y)
     .attr("r", 4)
     .attr("fill", "#007bff")
     .attr("stroke", "#fff")
     .attr("stroke-width", 2);
   ```

5. **Apply S18-style CSS**
   ```css
   /* In styles.css */
   .wombat-edge {
     stroke: #007bff;
     stroke-width: 2;
     stroke-linecap: round;
     fill: none;
     transition: stroke 0.3s ease;
   }

   .wombat-edge:hover {
     stroke: #0056b3;
     stroke-width: 3;
   }

   .wombat-vertex {
     fill: #007bff;
     stroke: #fff;
     stroke-width: 2;
     transition: r 0.3s ease, fill 0.3s ease;
   }

   .wombat-vertex:hover {
     r: 6;
     fill: #0056b3;
   }
   ```

**Phase 2B: Dual-Model Support** (Week 1)

1. **Refactor `updateVisualization()` to render both models**
   ```javascript
   function updateVisualization(displayMode = "target") {
     // Solve both geometries
     const targetGeometry = solveGeometry(false);
     const referenceGeometry = solveGeometry(true);

     // Clear previous rendering
     svg.selectAll("*").remove();

     // Render based on mode
     if (displayMode === "target" || displayMode === "both") {
       renderModel(targetGeometry, "target", "#007bff"); // Blue
     }

     if (displayMode === "reference" || displayMode === "both") {
       renderModel(referenceGeometry, "reference", "#dc3545"); // Red
     }

     // If both, add difference indicators
     if (displayMode === "both") {
       showDifferenceIndicators(targetGeometry, referenceGeometry);
     }
   }
   ```

2. **Add display mode toggle**
   ```html
   <div class="wombat-display-mode">
     <label>
       <input type="radio" name="display-mode" value="target" checked>
       Target Only
     </label>
     <label>
       <input type="radio" name="display-mode" value="reference">
       Reference Only
     </label>
     <label>
       <input type="radio" name="display-mode" value="both">
       Both (Overlay)
     </label>
   </div>
   ```

3. **Implement semi-transparent overlay**
   ```javascript
   function renderModel(geometry, mode, color) {
     const opacity = (currentDisplayMode === "both") ? 0.6 : 1.0;

     // Render edges with mode-specific color
     svg.selectAll(`line.edge-${mode}`)
       .data(edges)
       .enter().append("line")
       .attr("class", `edge edge-${mode}`)
       .attr("stroke", color)
       .attr("stroke-opacity", opacity)
       // ... positions ...
   }
   ```

4. **Show dimension deltas** (when both models visible)
   ```javascript
   function showDifferenceIndicators(targetGeom, refGeom) {
     const volumeDelta = targetGeom.volume - refGeom.volume;
     const deltaText = volumeDelta > 0
       ? `+${volumeDelta.toFixed(0)} m³`
       : `${volumeDelta.toFixed(0)} m³`;

     svg.append("text")
       .attr("x", 20)
       .attr("y", 40)
       .attr("fill", volumeDelta > 0 ? "#28a745" : "#dc3545")
       .attr("font-size", "14px")
       .text(`Volume Δ: ${deltaText}`);
   }
   ```

**Phase 2C: Interactive Features** (Week 2)

1. **Hover tooltips on nodes**
   ```javascript
   svg.selectAll("circle.vertex")
     .on("mouseover", function(event, d) {
       d3.select(this)
         .transition().duration(200)
         .attr("r", 6);

       // Show tooltip
       const tooltip = svg.append("text")
         .attr("class", "vertex-tooltip")
         .attr("x", d.x + 10)
         .attr("y", d.y - 10)
         .text(`(${d.realX.toFixed(1)}m, ${d.realY.toFixed(1)}m, ${d.realZ.toFixed(1)}m)`);
     })
     .on("mouseout", function() {
       d3.select(this).transition().duration(200).attr("r", 4);
       svg.selectAll(".vertex-tooltip").remove();
     });
   ```

2. **Edge hover shows wall properties**
   ```javascript
   svg.selectAll("line.edge")
     .on("mouseover", function(event, d) {
       // Highlight edge
       d3.select(this).attr("stroke-width", 4);

       // Show wall info (if edge is a wall)
       if (d.type === "wall") {
         svg.append("text")
           .attr("class", "edge-tooltip")
           .attr("x", (d.from.x + d.to.x) / 2)
           .attr("y", (d.from.y + d.to.y) / 2 - 10)
           .text(`${d.orientation} Wall: ${d.area.toFixed(1)} m² | U=${d.uValue} W/m²K`);
       }
     });
   ```

3. **Click face → highlight related S11 fields**
   ```javascript
   svg.selectAll("polygon.face")
     .on("click", function(event, d) {
       // Highlight corresponding S11 row
       if (d.component === "roof") {
         highlightField("d_85"); // Roof area
       } else if (d.component === "north-wall") {
         highlightField("d_86"); // Walls
         highlightField("d_89"); // Windows North
       }
     });

   function highlightField(fieldId) {
     const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
     fieldElement.classList.add("highlight-flash");
     setTimeout(() => fieldElement.classList.remove("highlight-flash"), 2000);
   }
   ```

---

**Phase 2D: Three.js Migration** (Week 3-4, Future)

Once SVG rendering is stable, migrate to Three.js for:
- True 3D perspective camera
- Real-time rotation/zoom (OrbitControls)
- Solar shadows for shading analysis
- glTF export for SketchUp/Rhino/Blender
- WebGL performance for complex geometries

**Approach**: Keep SVG as fallback for browsers without WebGL support.

---

### 📋 **Long-Term Roadmap**

#### **Phase 3: Roof Pitch & Window Distribution** (Future)
- Pitched roof geometry (gabled, hipped)
- Skylight rendering (d_93)
- Per-story window distribution on facades
- Foundation/basement visualization

#### **Phase 4: Export & Import** (Future)
- glTF 2.0 export (binary and ASCII)
- OBJ export (legacy tools)
- Screenshot export (PNG from SVG)
- Basic glTF import to populate TEUI fields

#### **Phase 5: Solar Radiation Overlay** (Future)
- Color-code surfaces by incident solar radiation (kWh/m²/year)
- Integrate with Section 10 radiant gains
- Shading analysis (self-shading, neighbor shading)

#### **Phase 6: Advanced Shapes** (Future)
- L-shapes, U-shapes, courtyard buildings
- Custom polygon footprints
- Multi-zone buildings

---

## Project Vision & Thermal Topology Philosophy

### Problem Statement

**Current limitation**: Users enter building geometry as abstract areas (roof: 120 m², walls: 180 m², windows by orientation) without visual feedback of the resulting building form.

**User pain points**:
- No way to validate if entered geometry represents a realistic building
- Cannot visualize thermal performance distribution across building surfaces
- Difficult to communicate design intent to stakeholders
- No export path to 3D modeling tools

### Solution Approach - "Thermal Topology"

**WOMBAT** generates a **constraint-driven 3D thermal topology** from TEUI's area-based geometry:

```
Thermal Areas (Input) → Constraint Solver → Deformable Geometry → Visual Feedback
d_85-d_95, d_105        "Jello Cube"       Vertices adapt to     Color-coded
(user enters areas)     Area = Priority     satisfy area targets  thermal performance
```

**Revolutionary insight**: This is **NOT** an architectural model—it's a **thermal model as topology**.

### Core Principles

1. **Areas Drive Form** (not the other way around)
   - Roof area = 240 m², floor = 120 m² → Roof pitch emerges (~45° slope)
   - North wall ≠ South wall → Building deforms asymmetrically
   - **No validation errors** - model adapts to match thermal data

2. **Topology First, Realism Second**
   - Floor slabs always horizontal (X-Y plane)
   - Default square footprint unless user adjusts aspect ratio slider
   - Walls stretch/compress to satisfy area constraints

3. **Constraint Satisfaction Over Geometric Truth**
   - Impossible constraints (roof < floor) → renders as inverted pyramid
   - Overlapping walls → shown transparently (visual conflict indicator)
   - Strange model = feedback: "Your areas don't match typical proportions"

4. **Volume is Sacred**
   - d_105/d_198 ALWAYS satisfied exactly
   - All dimensions emerge from: Volume + Areas + User preferences

### User Education

**UI Tooltip** (shown in Info modal):

> **"WOMBAT shows how OBJECTIVE 'sees' your building from thermal data."**
>
> You entered:
> - Volume: 1,000 m³
> - Roof: 120 m²
> - Walls: 180 m²
> - Windows: 30 m²
>
> OBJECTIVE doesn't know if your building is square, rectangular, or L-shaped.
> It only knows the **thermal surfaces** you defined.
>
> WOMBAT creates a wireframe that satisfies these constraints.
> If it looks strange, that's **feedback** - check your inputs!
>
> **This is not a CAD model** - it's a **thermal topology diagram**.

---

## Architecture Overview

### Module Structure

```
src/sections/Section19.js                     # Main WOMBAT module
├── STATE & CONFIGURATION (Lines 20-36)
│   ├── isActivated                           # Topology view activation flag
│   └── config                                # Canvas dimensions, defaults
│
├── PATTERN A DUAL-STATE (Lines 37-204)
│   ├── TargetState                           # Target mode values
│   ├── ReferenceState                        # Reference mode values
│   └── ModeManager                           # Dual-state facade
│
├── FIELD DEFINITIONS (Lines 206-357)
│   └── sectionRows                           # d_198, d_199, d_202, h_200-203
│
├── GEOMETRY SOLVER (Lines 464-556)
│   └── solveGeometry(isReferenceCalculation) # Constraint-driven algorithm
│
├── 3D RENDERING (Lines 562-751)
│   ├── initializeCanvas()                    # Setup Canvas 2D context
│   ├── updateVisualization(mode)             # Render isometric view
│   └── drawPlaceholder()                     # Inactive state placeholder
│
├── ACTIVATION CONTROLS (Lines 757-900)
│   ├── createActivationControls()            # Button, status, info
│   ├── toggleActivation()                    # Activate/deactivate
│   └── showInfoModal()                       # Philosophy explainer
│
├── EVENT HANDLERS (Lines 929-1114)
│   ├── setupFieldListeners()                 # DOM blur/change handlers
│   ├── initializeEventHandlers()             # Aspect slider, S11/S12 listeners
│   └── StateManager.addListener()            # Bidirectional sync
│
├── LIFECYCLE (Lines 1120-1162)
│   ├── onSectionRendered()                   # Canvas init, controls
│   └── initializeMirrorFields()              # Sync from S12 on load
│
└── DUAL-ENGINE CALCULATIONS (Lines 1169-1205)
    ├── calculateTargetModel()                # Target geometry + publish
    ├── calculateReferenceModel()             # Reference geometry + publish
    └── calculateAll()                        # Run BOTH engines
```

---

## Pattern A Dual-State Implementation

### State Objects

**TargetState** ([Section19.js:45-83](../../src/sections/Section19.js#L45-L83))

```javascript
const TargetState = {
  values: {
    d_198: "8000.00",  // Volume (mirrors S12 d_105)
    d_199: "1.5",      // Stories (mirrors S12 d_103)
    d_202: "0.0",      // Aspect ratio slider
    h_200: "0.00",     // Calculated: Footprint length
    h_201: "0.00",     // Calculated: Footprint width
    h_203: "0.00",     // Calculated: Story height
  },

  getValue(fieldId) {
    return this.values[fieldId] !== undefined ? this.values[fieldId] : null;
  },

  setValue(fieldId, value) {
    this.values[fieldId] = value;
  },

  setDefaults() {
    // Initialize from field definitions
  },

  syncFromGlobalState() {
    // Sync Target values from StateManager (unprefixed)
    const fieldIds = ["d_198", "d_199", "d_202", "h_200", "h_201", "h_203"];
    fieldIds.forEach((fieldId) => {
      const value = window.TEUI?.StateManager?.getValue(fieldId);
      if (value !== null && value !== undefined) {
        this.values[fieldId] = value;
      }
    });
  },
};
```

**ReferenceState** ([Section19.js:88-127](../../src/sections/Section19.js#L88-L127))
- Same structure as TargetState
- `syncFromGlobalState()` reads from `ref_${fieldId}` instead

---

### ModeManager Facade

**ModeManager** ([Section19.js:132-204](../../src/sections/Section19.js#L132-L204))

```javascript
const ModeManager = {
  currentMode: "target", // "target" or "reference"

  switchMode(mode) {
    if (mode !== "target" && mode !== "reference") {
      console.warn(`[WOMBAT ModeManager] Invalid mode: ${mode}`);
      return;
    }
    this.currentMode = mode;
    console.log(`[WOMBAT ModeManager] Switched to ${mode} mode`);
    this.refreshUI();
  },

  refreshUI() {
    const currentState = this.currentMode === "target" ? TargetState : ReferenceState;
    const fieldIds = ["d_198", "d_199", "d_202", "h_200", "h_201", "h_203"];

    fieldIds.forEach((fieldId) => {
      const value = currentState.getValue(fieldId);
      if (value !== null) {
        updateWombatDOM(fieldId, value);
      }
    });
  },

  updateCalculatedDisplayValues() {
    const currentState = this.currentMode === "target" ? TargetState : ReferenceState;
    const calculatedFields = ["h_200", "h_201", "h_203"];

    calculatedFields.forEach((fieldId) => {
      const value = currentState.getValue(fieldId);
      if (value !== null) {
        updateWombatDOM(fieldId, value);
      }
    });
  },

  getValue(fieldId) {
    const currentState = this.currentMode === "target" ? TargetState : ReferenceState;
    return currentState.getValue(fieldId);
  },

  setValue(fieldId, value, source = "user-modified") {
    const currentState = this.currentMode === "target" ? TargetState : ReferenceState;
    currentState.setValue(fieldId, value);

    // MODE-AWARE PUBLISHING: Target unprefixed, Reference ref_ prefixed
    if (this.currentMode === "target") {
      window.TEUI.StateManager.setValue(fieldId, value, source);
    } else {
      window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, source);
    }
  },
};
```

---

### Dual-Engine Calculations

**calculateAll()** ([Section19.js:1191-1205](../../src/sections/Section19.js#L1191-L1205))

```javascript
function calculateAll() {
  // DUAL-ENGINE: ALWAYS run both Target and Reference calculations
  const targetGeometry = calculateTargetModel();
  const referenceGeometry = calculateReferenceModel();

  // Update visualization ONLY if activated
  if (isActivated) {
    // Show visualization for current mode
    const mode = ModeManager?.currentMode || "target";
    updateVisualization(mode);
  }

  // Update calculated display values in DOM for current mode
  ModeManager.updateCalculatedDisplayValues();
}
```

**calculateTargetModel()** ([Section19.js:1169-1178](../../src/sections/Section19.js#L1169-L1178))

```javascript
function calculateTargetModel() {
  const geometry = solveGeometry(false); // isReferenceCalculation = false

  // Publish calculated dimensions to StateManager (unprefixed for Target)
  window.TEUI.StateManager.setValue("h_200", geometry.footprint.length.toFixed(2), "calculated");
  window.TEUI.StateManager.setValue("h_201", geometry.footprint.width.toFixed(2), "calculated");
  window.TEUI.StateManager.setValue("h_203", geometry.storyHeight.toFixed(2), "calculated");

  return geometry;
}
```

**calculateReferenceModel()** ([Section19.js:1180-1189](../../src/sections/Section19.js#L1180-L1189))

```javascript
function calculateReferenceModel() {
  const geometry = solveGeometry(true); // isReferenceCalculation = true

  // Publish calculated dimensions to StateManager (ref_ prefixed for Reference)
  window.TEUI.StateManager.setValue("ref_h_200", geometry.footprint.length.toFixed(2), "calculated");
  window.TEUI.StateManager.setValue("ref_h_201", geometry.footprint.width.toFixed(2), "calculated");
  window.TEUI.StateManager.setValue("ref_h_203", geometry.storyHeight.toFixed(2), "calculated");

  return geometry;
}
```

---

## Bidirectional Sync with Section 12

### Data Flow

```
┌──────────────────────────────────────────────────────────┐
│  Section 12 (Building Metrics)                           │
│  ├─ d_105: Conditioned Volume (m³)                       │
│  └─ d_103: Number of Stories                             │
└──────────────────────────────────────────────────────────┘
           ↕ Bidirectional Sync (StateManager listeners)
┌──────────────────────────────────────────────────────────┐
│  Section 19 (WOMBAT)                                      │
│  ├─ d_198: Volume (mirrors d_105)                        │
│  ├─ d_199: Stories (mirrors d_103)                       │
│  ├─ d_202: Aspect Ratio (user preference slider)         │
│  ├─ h_200: Footprint Length (calculated)                 │
│  ├─ h_201: Footprint Width (calculated)                  │
│  └─ h_203: Story Height (calculated)                     │
│       └─> 3D Visualization (Canvas 2D isometric)         │
└──────────────────────────────────────────────────────────┘
```

### S12 → S19 Listeners ([Section19.js:1062-1112](../../src/sections/Section19.js#L1062-L1112))

```javascript
// Target volume sync
window.TEUI.StateManager.addListener("d_105", (newValue) => {
  const currentValue = TargetState.getValue("d_198");
  console.log(`[WOMBAT SYNC] d_105 changed: ${currentValue} → ${newValue}`);
  if (currentValue !== newValue) {
    // Update TargetState
    TargetState.setValue("d_198", newValue);
    // Update DOM
    updateWombatDOM("d_198", newValue);
    console.log(`[WOMBAT] ✅ Synced d_198 = ${newValue} from S12 (d_105)`);
    // Recalculate (runs both engines + updates visualization)
    calculateAll();
  }
});

// Reference volume sync
window.TEUI.StateManager.addListener("ref_d_105", (newValue) => {
  const currentValue = ReferenceState.getValue("d_198");
  console.log(`[WOMBAT SYNC] ref_d_105 changed: ${currentValue} → ${newValue}`);
  if (currentValue !== newValue) {
    // Update ReferenceState
    ReferenceState.setValue("d_198", newValue);
    console.log(`[WOMBAT] ✅ Synced ref_d_198 = ${newValue} from S12 (ref_d_105)`);
    // Recalculate (runs both engines + updates visualization)
    calculateAll();
  }
});

// Similar for d_103/d_199 (stories) with Target and Reference variants
```

**Key Features:**
- ✅ Updates local state (TargetState/ReferenceState)
- ✅ Updates DOM via `updateWombatDOM()`
- ✅ Triggers `calculateAll()` → dual-engine + 3D visualization

---

### S19 → S12 Listeners ([Section12.js:3086-3136](../../src/sections/Section12.js#L3086-L3136))

```javascript
// ✅ NEW: S12 listens to WOMBAT mirror field changes

// Target volume from WOMBAT (d_198 → d_105)
window.TEUI.StateManager.addListener("d_198", (newValue) => {
  const currentValue = ModeManager.getValue("d_105");
  if (currentValue !== newValue) {
    ModeManager.setValue("d_105", newValue, "external");

    // ✅ DOM UPDATE: Critical for keeping S12 table current
    const fieldDef = window.TEUI.FieldManager.getField("d_105");
    if (fieldDef && window.TEUI.FieldManager.updateFieldDisplay) {
      window.TEUI.FieldManager.updateFieldDisplay("d_105", newValue, fieldDef);
    }

    console.log(`[S12] ✅ Synced d_105 = ${newValue} from WOMBAT (d_198)`);
    calculateAll();
    ModeManager.updateCalculatedDisplayValues();
  }
});

// Target stories from WOMBAT (d_199 → d_103)
window.TEUI.StateManager.addListener("d_199", (newValue) => {
  const currentValue = ModeManager.getValue("d_103");
  if (currentValue !== newValue) {
    ModeManager.setValue("d_103", newValue, "external");

    // ✅ DOM UPDATE: Direct dropdown value update
    const dropdown = document.querySelector('[data-field-id="d_103"]');
    if (dropdown && dropdown.tagName === "SELECT") {
      dropdown.value = newValue;
    }

    console.log(`[S12] ✅ Synced d_103 = ${newValue} from WOMBAT (d_199)`);
    calculateAll();
    ModeManager.updateCalculatedDisplayValues();
  }
});

// Similar for ref_d_198/ref_d_105, ref_d_199/ref_d_103
```

**Key Features:**
- ✅ Updates S12 state (via `ModeManager.setValue()`)
- ✅ Updates S12 DOM (via `FieldManager.updateFieldDisplay()` or direct dropdown assignment)
- ✅ Triggers S12 `calculateAll()` + `updateCalculatedDisplayValues()`

**Critical Bug Fix** (applied in PR #63):
Added `FieldManager.updateFieldDisplay()` calls to S12 listeners to prevent "stale DOM" issue where state updates correctly but table display doesn't refresh.

---

## Geometry Solver (Constraint-Driven)

### Constraint Hierarchy

```
1. SACRED (Never violated):
   └─ Volume (d_105/d_198) - MUST be satisfied exactly

2. PRIMARY (Satisfy if possible, show visual conflict if not):
   ├─ Roof Area (d_85)
   ├─ Floor Area (h_15 conditioned area)
   └─ Wall Area (d_86)

3. SECONDARY (Distribute across PRIMARY constraints):
   ├─ Window Areas by Orientation (d_89-d_92)
   ├─ Door Areas (d_88)
   └─ Skylight Area (d_93)

4. PREFERENTIAL (User aesthetics - deformable):
   ├─ Aspect Ratio (d_202) - "I prefer square-ish footprints"
   └─ Symmetry - "I prefer symmetric facades"
```

---

### Solver Algorithm ([Section19.js:464-556](../../src/sections/Section19.js#L464-L556))

**solveGeometry(isReferenceCalculation)**

```javascript
function solveGeometry(isReferenceCalculation = false) {
  const mode = isReferenceCalculation ? "Reference" : "Target";
  console.log(`[WOMBAT] Solving geometry from thermal constraints (${mode} mode)...`);

  // Phase 1: Read inputs from StateManager and Pattern A states
  const conditionedArea = parseFloat(window.TEUI?.StateManager?.getValue("h_15")) || 100;
  const roofArea = parseFloat(window.TEUI?.StateManager?.getValue("d_85")) || 100;
  const wallArea = parseFloat(window.TEUI?.StateManager?.getValue("d_86")) || 160;

  // ⚠️ DUAL-STATE: Read from appropriate state based on calculation mode
  const currentState = isReferenceCalculation ? ReferenceState : TargetState;
  const volume = parseFloat(window.TEUI.parseNumeric(currentState.getValue("d_198")) || 8000);
  const stories = parseFloat(currentState.getValue("d_199") || 1);

  // User preferences - aspect ratio slider
  // -4 to +4, centered at 0 (0 = square, positive = landscape, negative = portrait)
  const aspectRatioRaw = parseFloat(currentState.getValue("d_202") || 0);
  const aspectRatio = aspectRatioRaw >= 0 ? (1 + aspectRatioRaw) : (1 / (1 - aspectRatioRaw));

  // Phase 2: Footprint (X-Y plane, always horizontal)
  const footprintArea = conditionedArea / stories;
  const width = Math.sqrt(footprintArea / aspectRatio);
  const length = footprintArea / width;

  // Phase 3: Height calculation from SACRED volume constraint
  const totalBuildingHeight = volume / footprintArea;
  const storyHeight = totalBuildingHeight / stories;

  // Phase 4: Roof geometry (pitch emerges from roof area constraint)
  const areaRatio = roofArea / footprintArea;
  let roofPitch = 0;
  let roofType = "flat";

  if (areaRatio > 1.01) {
    // Pitched roof needed to achieve larger roof area
    roofType = "gabled";
    roofPitch = Math.asin(Math.min((areaRatio - 1) / 2, 1)) * (180 / Math.PI);
  } else if (areaRatio < 0.99) {
    // Inverted pyramid (roof smaller than floor - visual conflict indicator)
    roofType = "inverted";
    roofPitch = -20; // Negative pitch
    console.warn(`[WOMBAT] Roof area (${roofArea} m²) < Conditioned area (${footprintArea} m²) - Creating inverted geometry`);
  }

  // Phase 5: Wall geometry (symmetric for now)
  const perimeter = 2 * (length + width);
  const wallHeight = wallArea / perimeter;

  // Store solved dimensions in current state
  currentState.setValue("h_200", length.toFixed(2));
  currentState.setValue("h_201", width.toFixed(2));
  currentState.setValue("h_203", storyHeight.toFixed(2));

  const solvedGeometry = {
    footprint: { length, width, area: footprintArea },
    height: totalBuildingHeight,
    storyHeight: storyHeight,
    stories: stories,
    volumePerFloor: volume / stories,
    areaPerFloor: conditionedArea / stories,
    walls: {
      north: { width: width, height: wallHeight },
      south: { width: width, height: wallHeight },
      east: { width: length, height: wallHeight },
      west: { width: length, height: wallHeight },
    },
    roof: {
      type: roofType,
      pitch: roofPitch,
      area: roofArea,
    },
    volume: volume,
  };

  console.log(`[WOMBAT] Geometry solved (${mode} mode):`, solvedGeometry);
  return solvedGeometry;
}
```

**Key Features:**
- ✅ Volume ALWAYS preserved (SACRED constraint)
- ✅ Aspect ratio controls footprint proportions
- ✅ Roof pitch emerges from area ratio (flat, gabled, or inverted)
- ✅ Wall heights derive from wall area / perimeter
- ✅ Mode-aware: reads from TargetState or ReferenceState
- ✅ Stores calculated dimensions back in current state

---

## Known Issues

### 🔴 **Volume Field (d_198) Input Locked After First Edit**

**Full Description**: See [Next Steps & Roadmap](#next-steps--roadmap) → Immediate Priority 1

**Quick Summary:**
- First edit works correctly
- Subsequent edits rejected (field appears focused but doesn't accept input)
- Root cause: Field selector returns `null` during `setupFieldListeners()`
- **Workaround**: Use S12 d_105 field (bidirectional sync works perfectly)

---

## References & Resources

### TEUI Documentation
- [TECHNICAL2.md](../TECHNICAL2.md) - Core architecture (StateManager, Calculator, Pattern A)
- [4012-CHEATSHEET.md](../4012-CHEATSHEET.md) - Anti-patterns and best practices
- [SectionXX.js](../../src/sections/SectionXX.js) - Pattern A template
- [Section07.js](../../src/sections/Section07.js) - Latest Pattern A reference
- [Section12.js](../../src/sections/Section12.js) - Bidirectional sync pattern

### Graphics Libraries

**D3.js (Current Plan for SVG)**
- D3.js v7: https://d3js.org/
- S18 Parallel Coordinates: Clean SVG line/node rendering reference

**Three.js (Future Phase 4)**
- Official site: https://threejs.org/
- Documentation: https://threejs.org/docs/
- OrbitControls: https://threejs.org/docs/#examples/en/controls/OrbitControls
- GLTFExporter: https://threejs.org/docs/#examples/en/exporters/GLTFExporter
- glTF 2.0 spec: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

### Inspiration Projects
- **Speckle** (https://speckle.systems/) - BIM data platform with Three.js viewer
- **cove.tool** - Early-phase energy modeling with 3D visualization
- **Sefaira** - SketchUp plugin for real-time energy analysis

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-12-08 | Andy & Claude | Initial draft - Thermal Topology philosophy |
| 0.2 | 2025-12-08 | Andy & Claude | Implementation status after first working version |
| 0.3 | 2025-12-12 | Andy & Claude | Pattern A dual-state implementation (PR #63) |
| **1.0** | **2025-12-12** | **Andy & Claude** | **Consolidated with S19-DUAL-STATE-IMPLEMENTATION.md** |

---

**STATUS**: Implementation ongoing on `WOMBAT` branch
**NEXT SESSION GOALS**:
1. Fix d_198 volume field input blocking issue
2. Migrate Canvas 2D → SVG rendering with D3.js
3. Implement dual-model visualization (Target blue, Reference red, Overlay mode)

---

**END OF DOCUMENTATION**
