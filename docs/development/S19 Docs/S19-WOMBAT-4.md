# WOMBAT Phase 4: Unified Prismatic Extrusion Architecture

**Status**: 🎯 **ARCHITECTURE DESIGN** (2025-12-19)
**Priority**: HIGH - Architectural refactor for code clarity and maintainability
**Branch**: `WOMBAT-PRISMATIC` (future implementation)

---

## Executive Summary

This document proposes a **unified geometric solver** for all WOMBAT roof types based on **prismatic extrusion**. Rather than multiple ad-hoc solvers (flat, gable, shed, hip), we use a single pattern:

1. **Footprint** from floor area (d_95) - already solved
2. **2D Profile** - solve elevation cross-section from constraints
3. **Extrude** - prismatic extrusion to satisfy volume (d_105)
4. **Render** - draw from 8 corner nodes (4 ground + 4 eave)

This eliminates iteration, clarifies dependency chains, and makes rendering straightforward.

---

## Constraint Hierarchy & Priority Order

### Sacred Constraints (Inflexible)

These constraints MUST be satisfied exactly and drive the geometry:

1. **Volume** (d_105) - SACRED, always preserved exactly (highest priority)
2. **Footprint Area** (d_95 or d_87) - SACRED, always preserved exactly
3. **Roof Area** (d_85) - SACRED ONLY if > footprint area, else collapses to flat roof
   - **ROOF COLLAPSE RULE**: If roof area ≤ footprint area, pitched roof is geometrically impossible
   - Automatically falls back to flat roof (roof area = footprint area)
   - User must increase d_85 to enable pitched roofs (minimum ~110% of footprint area)
4. **Wall Areas** (Ae walls + Gable/Shed end walls) - Thermal envelope areas

### Derived Constraints (Flexible)

These values are calculated FROM the sacred constraints:

1. **Aspect Ratio** (d_154) - Reshapes footprint while preserving area, affects roof height
2. **Footprint Dimensions** (Width × Length) - Derived from area + aspect ratio
3. **Storey Height** (h_156) - SACRIFICIAL to satisfy volume constraint
   - **NOT prescribed** from g_106 (typical F2F height)
   - **Derived** from volume ÷ footprint ÷ stories
   - Can flex based on roof geometry to satisfy volume exactly
   - User may see "pancake" storeys if volume is insufficient for realistic heights

### Critical Insight: Aspect Ratio ↔ Roof Height Relationship

**The shed roof "too tall" issue is likely an aspect ratio problem:**

For shed/gable roofs with fixed roof area:
- **Narrow footprint (low aspect ratio)** → Roof area spread over SHORT ridge → TALL roof rise
- **Wide footprint (high aspect ratio)** → Roof area spread over LONG ridge → LOW roof rise

**Example**:
```javascript
// Given: Roof area = 1100 m², Volume = 8319 m³, Footprint = 1100 m²

// Case 1: Square footprint (aspect ratio = 1:1)
const width = 33.2m;   // sqrt(1100)
const length = 33.2m;
const ridgeLength = 33.2m;  // SHORT dimension
const slopeLength = 1100 / 33.2 = 33.1m;
const roofHeight = sqrt(33.1² - 16.6²) = 28.6m;  // VERY TALL!

// Case 2: Rectangular footprint (aspect ratio = 2:1)
const width = 23.5m;   // sqrt(1100/2)
const length = 46.9m;  // width × 2
const ridgeLength = 23.5m;  // SHORT dimension
const slopeLength = 1100 / 23.5 = 46.8m;
const roofHeight = sqrt(46.8² - 23.5²) = 40.6m;  // EVEN TALLER!

// Case 3: Aspect ratio needs adjustment to distribute roof area
// The aspect ratio slider (d_154) redistributes roof area across dimensions
// Higher aspect ratio → longer ridge → shallower roof slope
```

**Conclusion**: The "too tall" shed roof may already be mathematically correct given current constraints. We need to either:
1. Adjust aspect ratio to distribute roof area over longer ridge
2. Re-examine if roof area constraint (d_85) is properly wired
3. Verify volume constraint isn't forcing unrealistic wall heights

---

## Aspect Ratio Implementation Specification

### Overview

The aspect ratio slider (d_154) controls the footprint shape, redistributing the sacred footprint area between width and length dimensions. This directly affects roof height because the ridge orientation follows the SHORT dimension convention.

### Slider Range & Interpretation

```javascript
// d_154 slider: -4.0 to +4.0, step 0.1, default 0.0

// Value → Footprint Shape
// -4.0 → 5:1 portrait (very tall/narrow)
// -2.0 → 3:1 portrait
// -1.0 → 2:1 portrait
//  0.0 → 1:1 square (current default)
// +1.0 → 2:1 landscape
// +2.0 → 3:1 landscape
// +4.0 → 5:1 landscape (very wide/shallow)
```

### Mathematical Formula

**✨ DISCOVERY FROM BACKUP (Section19.js.backup:1108-1127)**: The original WOMBAT 3 has a **superior, more elegant formula**:

```javascript
// ✅ RECOMMENDED APPROACH (from backup - simpler, no branching)
// Convert slider value to actual aspect ratio (length/width)
const aspectRatioRaw = parseFloat(d_154) || 0;
const aspectRatio = aspectRatioRaw >= 0
  ? 1 + aspectRatioRaw           // Landscape: 0→1, +1→2, +2→3, +4→5
  : 1 / (1 - aspectRatioRaw);    // Portrait:  0→1, -1→0.5, -2→0.33, -4→0.2

// Solve dimensions with elegant single formula
const width = Math.sqrt(footprintArea / aspectRatio);
const length = footprintArea / width;  // Exact, no rounding error
const perimeter = 2 * (length + width);
```

**Why This Is Better**:
1. **No branching** - Single formula handles landscape and portrait uniformly
2. **Mathematically pure** - `length = area / width` guarantees exact area preservation
3. **Direct ratio** - `aspectRatio` directly represents `length/width` ratio
4. **Simpler** - 3 lines vs 10+ lines with conditionals
5. **Clearer intent** - aspectRatio variable name matches what it represents

**Comparison to Initially Proposed Formula** (more complex):

```javascript
// ❌ INITIALLY PROPOSED (works but unnecessarily complex)
function calculateFootprintDimensions(footprintArea, aspectRatioValue) {
  const ratio = 1 + Math.abs(aspectRatioValue);
  let width, length;
  if (aspectRatioValue >= 0) {
    width = Math.sqrt(footprintArea / ratio);
    length = width * ratio;
  } else {
    length = Math.sqrt(footprintArea / ratio);
    width = length * ratio;
  }
  return { width, length };
}
```

**Examples**:
```javascript
// Square (d_154 = 0):
const aspectRatio = 1;  // 1 + 0
const width = sqrt(1100 / 1) = 33.17m;
const length = 1100 / 33.17 = 33.17m;  // Exact square

// Landscape 2:1 (d_154 = +1):
const aspectRatio = 2;  // 1 + 1
const width = sqrt(1100 / 2) = 23.45m;
const length = 1100 / 23.45 = 46.90m;  // Exactly 2:1

// Portrait 1:2 (d_154 = -1):
const aspectRatio = 0.5;  // 1 / (1 - (-1)) = 1 / 2
const width = sqrt(1100 / 0.5) = 46.90m;
const length = 1100 / 46.90 = 23.45m;  // Exactly 1:2
```

### Ridge Orientation Impact

**CRITICAL**: Ridge ALWAYS runs across SHORT dimension (structural efficiency convention)

```javascript
// Example: 1100m² footprint area

// Square (aspectRatio = 0):
const { width: 33.2m, length: 33.2m } = calculateFootprintDimensions(1100, 0);
const ridgeLength = Math.min(width, length) = 33.2m;  // SHORT dimension
// → Roof area spread over 33.2m ridge → TALL roof

// Landscape 2:1 (aspectRatio = +1):
const { width: 23.5m, length: 46.9m } = calculateFootprintDimensions(1100, 1);
const ridgeLength = Math.min(width, length) = 23.5m;  // SHORT dimension (width)
// → Roof area spread over 23.5m ridge → EVEN TALLER roof (worse!)

// Landscape 1:2 (aspectRatio = -1):
const { width: 46.9m, length: 23.5m } = calculateFootprintDimensions(1100, -1);
const ridgeLength = Math.min(width, length) = 23.5m;  // SHORT dimension (length)
// → Same ridge length, same tall roof issue

// Landscape 1:3 (aspectRatio = -2):
const { width: 57.4m, length: 19.2m } = calculateFootprintDimensions(1100, -2);
const ridgeLength = Math.min(width, length) = 19.2m;  // SHORT dimension (length)
// → Roof area spread over 19.2m ridge → EVEN TALLER roof
```

### Key Insight: Aspect Ratio Paradox

**Changing aspect ratio alone may NOT reduce roof height!**

- Ridge always uses SHORT dimension
- Making building more rectangular → shorter SHORT dimension → TALLER roof
- For gable/shed roofs: `roofHeight = sqrt(slopeLength² - (span/2)²)` where `slopeLength = roofArea / ridgeLength`
- Smaller ridgeLength → larger slopeLength → potentially taller roof

**Solution**: Aspect ratio must work in conjunction with:
1. **Roof area iteration** - Adjust d_85 to match realistic slope
2. **Volume iteration** - Recalculate wall height to satisfy volume constraint
3. **User feedback** - Legend shows when roof geometry is unrealistic

### Implementation Location

**File**: `src/sections/Section19.js`
**Function**: `solveGeometry(isReferenceCalculation)`
**Line**: ~840 (currently has `const width = Math.sqrt(footprintArea);`)

**Changes Required**:

```javascript
// BEFORE (line ~840):
const width = Math.sqrt(footprintArea);

// AFTER:
// Read aspect ratio from d_154
const d_154_raw = getModeAwareValue("d_154", isReferenceCalculation);
const aspectRatio = parseFloat(d_154_raw) || 0.0;

// Calculate dimensions from aspect ratio
const { width, length } = calculateFootprintDimensions(footprintArea, aspectRatio);

console.log(`[WOMBAT-2] Aspect ratio: ${aspectRatio.toFixed(2)}, footprint: ${width.toFixed(2)}m × ${length.toFixed(2)}m`);
```

**Additional Changes**:

1. Add `calculateFootprintDimensions()` helper function before `solveGeometry()`
2. Update ridge orientation logic to use `Math.min(width, length)` explicitly
3. Ensure profile solvers receive correct width/length for their orientation
4. Publish h_155 (width) and h_157 (length) to StateManager

### Testing Plan

1. **Square test** (d_154 = 0): Verify width = length = sqrt(area)
2. **Landscape test** (d_154 = +1): Verify length = 2 × width, area preserved
3. **Portrait test** (d_154 = -1): Verify width = 2 × length, area preserved
4. **Extremes test** (d_154 = ±4): Verify 5:1 ratio, area preserved
5. **Roof height test**: Document how roof height changes with aspect ratio for 1100m² footprint

### Expected Outcome

With aspect ratio slider implemented:
- User can reshape footprint while preserving area
- Legend shows width × length dimensions updating in real-time
- Roof height may increase or decrease depending on ridge orientation
- Volume and area constraints remain sacred (always preserved)

---

## Problem Statement

### Current Architecture Issues

**WOMBAT 3.0** (current implementation in Section19.js, wombatRender.js):
- ✅ Works correctly for flat and gable roofs
- ⚠️ Shed roof has rendering issues (dual planes, missing edges)
- ⚠️ Each roof type has bespoke solve logic
- ⚠️ Unclear dependency between d_85 (roof area), d_105 (volume), g_106 (height)
- ⚠️ Renderer must handle asymmetric cases with conditional logic

### Architectural Inconsistencies

| Roof Type | Current Solve Approach | Issues |
|-----------|------------------------|--------|
| **Flat** | Footprint → Height from volume | ✅ Works |
| **Gable** | Roof area → Ridge height → Subtract gable ends | ✅ Works but iterative |
| **Shed** | Roof area → Slope → Asymmetric walls | ⚠️ Rendering complexity |
| **Hip** | Not yet implemented | ❌ No clear path |

**Key insight**: All these are fundamentally **prismatic extrusions** of 2D profiles!

---

## Mathematical Foundation: Rational Trigonometry

### Why Rational Trigonometry?

**Rational Trigonometry** (developed by Norman Wildberger) replaces traditional trigonometric functions with algebraic operations using **spreads** and **quadrances**.

**Key Concept: Spread Ratio**

Instead of angles (which require transcendental functions like sin/cos), we use **spread** `s`:

```
s = Q/R

Where:
- Q = perpendicular² (opposite side squared)
- R = hypotenuse² (slope length squared)
- s is a pure ratio (dimensionless)
```

**Example from Diagram**:
```
Roof with:
- Q (perpendicular²) = 36
- R (hypotenuse²) = 100

Spread s = 36/100 = 0.36
```

**Advantages**:
1. **No irrational decimals** - calculations stay in exact ratios until final sqrt
2. **Numerically stable** - fewer rounding errors in calculation chains
3. **Algebraically pure** - Pythagorean theorem in squared form: `R = Q + span²`

### WOMBAT Implementation

We use rational trigonometry throughout:

```javascript
// Traditional approach (error-prone)
const angle = Math.atan(height / span);
const slope = span / Math.cos(angle);  // Multiple sqrt operations

// Rational trigonometry (stable)
const R = slopeLength * slopeLength;  // Quadrance (squared distance)
const Q_span = span * span;           // Span quadrance
const Q_height = R - Q_span;          // Pythagorean in squared form
const height = Math.sqrt(Q_height);   // Single sqrt at end
```

**Result**: More accurate computation with fewer accumulated errors.

---

## Prismatic Extrusion Paradigm

### Core Concept

Every building is a **2D elevation profile extruded along one axis**:

```
2D PROFILE (elevation)        EXTRUDE         3D BUILDING
    ___                        ======>         ________
   /   \                                      /       /|
  /     \                                    /       / |
 /       \                                  /       /  |
|_________|                                |_______|   |
                                           |       |  /
                                           |       | /
                                           |_______|/
```

**Advantages**:
1. **Single solve pattern** for all roof types
2. **No iteration** - direct geometric solve
3. **Clear constraint order**: d_95 → profile → d_105 → render
4. **Simpler rendering** - 8 nodes define entire geometry

---

## Unified Solve Order

### Phase 1: Footprint (Existing)

Already implemented in Section19.js - solve from d_95 (floor area):

```javascript
// EXISTING CODE (keep as-is)
const footprint = solveFootprint(d_95, aspectRatio, mezzanineRatio);
const width = footprint.width;   // SHORT dimension
const length = footprint.length; // LONG dimension
```

### Phase 2: 2D Profile (NEW - Unified Pattern)

**Key insight**: For ALL roof types, solve the elevation cross-section perpendicular to the ridge.

**Profile Definition**:
- **Horizontal axis**: Building width (perpendicular to ridge)
- **Vertical axis**: Height (Z)
- **4 profile nodes**: 2 ground nodes, 2 eave nodes

```javascript
// NEW UNIFIED FUNCTION
function solve2DProfile(roofType, width, roofArea, shortWallHeight) {
  switch (roofType) {
    case "flat":
      return solveFlat2DProfile(width, shortWallHeight);

    case "biplanar": // Gable
      return solveGable2DProfile(width, roofArea, shortWallHeight);

    case "monoplane": // Shed
      return solveShed2DProfile(width, roofArea, shortWallHeight);

    case "hip": // Future
      return solveHip2DProfile(width, roofArea, shortWallHeight);

    default:
      return solveFlat2DProfile(width, shortWallHeight);
  }
}
```

**Profile Return Format**:
```javascript
{
  // 2D nodes (local coordinates)
  nodes: [
    { x: 0,     z: 0 },              // Left ground
    { x: width, z: 0 },              // Right ground
    { x: width, z: tallWallHeight }, // Right eave (or peak)
    { x: 0,     z: shortWallHeight },// Left eave (or peak)
  ],

  // Metadata
  type: "flat" | "gable" | "shed" | "hip",
  height: roofHeight,              // Rise above short wall
  shortWallHeight: g_106,
  tallWallHeight: g_106 + height,  // For asymmetric roofs
  avgWallHeight: average,          // For volume calculation
  endWallArea: triangularArea,     // Area to subtract from d_86
}
```

### Phase 3: Extrude for Volume (NEW - Unified Pattern)

**Solve extrusion depth to match d_105**:

```javascript
// NEW UNIFIED FUNCTION
function extrudeProfile(profile2D, targetVolume) {
  // Calculate 2D cross-sectional area
  const crossSectionArea = calculatePolygonArea(profile2D.nodes);

  // Volume = cross-section × extrusion depth
  // Solve: extrusionDepth = targetVolume / crossSectionArea
  const extrusionDepth = targetVolume / crossSectionArea;

  return {
    depth: extrusionDepth,
    crossSectionArea: crossSectionArea,
    calculatedVolume: crossSectionArea * extrusionDepth,
  };
}
```

**Cross-section area calculation**:
- **Flat roof**: Rectangle = width × height
- **Gable roof**: Rectangle + triangle = width × height + (width × roofHeight / 2)
- **Shed roof**: Trapezoid = width × ((shortHeight + tallHeight) / 2)
- **Hip roof**: Rectangle + trapezoid = width × height + (width × roofHeight / 2)

### Phase 4: Generate 3D Nodes (NEW - Unified Pattern)

**Extrude 2D profile along Y-axis (ridge direction)**:

```javascript
// NEW UNIFIED FUNCTION
function generate3DNodes(profile2D, extrusionDepth, centerOrigin = true) {
  const halfDepth = centerOrigin ? extrusionDepth / 2 : 0;
  const halfWidth = centerOrigin ? profile2D.width / 2 : 0;

  // Front 4 nodes (Y = -halfDepth)
  const frontNodes = profile2D.nodes.map(node => ({
    x: node.x - halfWidth,
    y: -halfDepth,
    z: node.z,
  }));

  // Back 4 nodes (Y = +halfDepth)
  const backNodes = profile2D.nodes.map(node => ({
    x: node.x - halfWidth,
    y: +halfDepth,
    z: node.z,
  }));

  return {
    front: frontNodes,
    back: backNodes,
    all: [...frontNodes, ...backNodes], // 8 nodes total
  };
}
```

### Phase 5: Render (SIMPLIFIED)

**Renderer receives 8 nodes and draws**:
- 4 vertical edges (ground to eave at each corner)
- 4 horizontal edges (connecting eaves)
- Roof plane(s) from eave nodes
- End walls from profile shape

```javascript
// SIMPLIFIED RENDERING
function renderFromNodes(svg, nodes3D, roofType) {
  const { front, back } = nodes3D;

  // Draw vertical edges (4 corners)
  for (let i = 0; i < 4; i++) {
    drawEdge(svg, front[i], back[i]);
  }

  // Draw ground rectangle
  drawQuad(svg, [front[0], front[1], back[1], back[0]], groundColor);

  // Draw eave rectangle
  drawQuad(svg, [front[2], front[3], back[3], back[2]], roofColor);

  // Draw end walls (profile shape)
  drawPolygon(svg, front, wallColor);
  drawPolygon(svg, back, wallColor);
}
```

---

## Roof Type Implementations

### 1. Flat Roof (Simplest)

**2D Profile**: Rectangle

```javascript
function solveFlat2DProfile(width, wallHeight) {
  return {
    nodes: [
      { x: 0,     z: 0 },          // Left ground
      { x: width, z: 0 },          // Right ground
      { x: width, z: wallHeight }, // Right eave
      { x: 0,     z: wallHeight }, // Left eave
    ],
    type: "flat",
    height: 0,
    shortWallHeight: wallHeight,
    tallWallHeight: wallHeight,
    avgWallHeight: wallHeight,
    endWallArea: 0, // No roof geometry to extract
  };
}
```

**Cross-section**: `width × wallHeight`

**Extrude**: `depth = d_105 / (width × wallHeight)`

**Render**: Simple rectangular prism

### 2. Gable Roof (Biplanar)

**2D Profile**: Rectangle + triangle (house shape)

```javascript
function solveGable2DProfile(width, roofArea, wallHeight) {
  // Ridge runs across SHORT dimension (structural)
  const ridgeLength = width;

  // Roof area = 2 × (ridge × slope)
  // For symmetric gable: slope = roofArea / (2 × ridge)
  const slopeLength = roofArea / (2 * ridgeLength);

  // Half-width to peak
  const halfWidth = width / 2;

  // Pythagorean: slope² = halfWidth² + height²
  // Solve: height = √(slope² - halfWidth²)
  const h2 = slopeLength * slopeLength - halfWidth * halfWidth;
  const roofHeight = Math.sqrt(h2);

  // Gable end area (two triangular ends)
  const gableEndArea = width * roofHeight; // Total for both

  return {
    nodes: [
      { x: 0,         z: 0 },                    // Left ground
      { x: width,     z: 0 },                    // Right ground
      { x: width,     z: wallHeight },           // Right eave
      { x: width / 2, z: wallHeight + roofHeight }, // Peak
      { x: 0,         z: wallHeight },           // Left eave
    ],
    type: "gable",
    height: roofHeight,
    shortWallHeight: wallHeight,
    tallWallHeight: wallHeight, // Symmetric
    avgWallHeight: wallHeight,
    endWallArea: gableEndArea,
    ridgeHeight: wallHeight + roofHeight,
  };
}
```

**Cross-section**: `width × wallHeight + (width × roofHeight / 2)`

**Extrude**: `depth = d_105 / crossSectionArea`

**Render**: Pentagonal prism (5 nodes per end)

### 3. Shed Roof (Monoplane)

**2D Profile**: Trapezoid (asymmetric)

**Diagram Example**:
```
Isometric view showing rational trigonometry:

        R = 100 (roof slope²)
       /|
      / |
     /  | Q = 36 (perpendicular²)
    /   |
   /    |
  /_____|
  span = 8m

Spread s = Q/R = 36/100 = 0.36

3D Building:
- Roof area = 100m²
- Footprint = 80m² (10m × 8m)
- Short wall = 3m
- Tall wall = 6m (3m + roof height)
- Ridge = 10m (across SHORT dimension)
```

**Implementation**:

```javascript
function solveShed2DProfile(width, length, roofArea, shortWallHeight) {
  // Ridge runs across SHORT dimension (structural convention)
  const ridgeLength = Math.min(width, length);  // SHORT dimension
  const span = Math.max(width, length);         // LONG dimension

  // Roof area = ridge × slope
  const slopeLength = roofArea / ridgeLength;

  // Rational trigonometry: R = Q_span + Q_height
  // slope² = span² + height²
  // Solve: height² = slope² - span²
  const R = slopeLength * slopeLength;  // Quadrance (roof slope)
  const Q_span = span * span;            // Quadrance (span)
  const Q_height = R - Q_span;           // Pythagorean in squared form

  if (Q_height <= 0) {
    console.warn(`[WOMBAT] Invalid shed geometry: slope² < span²`);
    return { isValid: false };
  }

  const roofHeight = Math.sqrt(Q_height);  // Single sqrt

  const tallWallHeight = shortWallHeight + roofHeight;
  const avgWallHeight = (shortWallHeight + tallWallHeight) / 2;

  // Shed end area (two trapezoidal ends)
  // Each end = (short + tall) / 2 × width = trapezoid area
  // Total both ends = width × roofHeight (simplified)
  const shedEndArea = ridgeLength * roofHeight;

  return {
    nodes: [
      { x: 0,           z: 0 },                   // Front ground (short wall)
      { x: ridgeLength, z: 0 },                   // Front ground (tall wall)
      { x: ridgeLength, z: tallWallHeight },      // Front eave (tall)
      { x: 0,           z: shortWallHeight },     // Front eave (short)
    ],
    type: "shed",
    height: roofHeight,
    shortWallHeight: shortWallHeight,
    tallWallHeight: tallWallHeight,
    avgWallHeight: avgWallHeight,
    endWallArea: shedEndArea,
    spread: Q_height / R,  // Spread ratio for reference
    isValid: true,
  };
}
```

**Cross-section** (trapezoid area):
```javascript
const trapezoidArea = ((shortWallHeight + tallWallHeight) / 2) * ridgeLength;
// Example: ((3 + 6) / 2) * 10 = 45 m²
```

**Extrude for volume**:
```javascript
const extrusionDepth = d_105 / trapezoidArea;
// Example: 360 m³ / 45 m² = 8m ✓
```

**Render**: Trapezoidal prism (4 nodes per end, asymmetric)
- Front trapezoid: 4 nodes at Y=0
- Back trapezoid: 4 nodes at Y=extrusionDepth
- Total: 8 corner nodes define entire geometry

---

## Multi-Storey Scalability

### Prismatic Extrusion for Multi-Storey Buildings

**Key Insight**: The prismatic approach scales elegantly to multi-storey buildings by **stacking rectangular profiles** before adding the roof.

### Single-Storey Shed Example (from Diagram)

**Building Parameters**:
- Footprint: 80m² (10m × 8m)
- Roof area: 100m²
- Ridge: 10m (SHORT dimension)
- Span: 8m (LONG dimension)
- Short wall: 3m
- Roof rise: 3m
- Tall wall: 6m (3m + 3m)
- Total volume: 360m³

**2D Profile** (trapezoid):
```
     6m ___
       /   |
  3m  /    | 3m rise
     /_____|
     10m wide
```

**Cross-section area**:
```javascript
const trapezoidArea = ((3 + 6) / 2) * 10 = 45 m²
```

**Extrusion depth**:
```javascript
const depth = 360 / 45 = 8m ✓
```

### Multi-Storey Shed Example (2-Storey)

**Building Parameters**:
- Footprint: 80m² (10m × 8m)
- Roof area: 100m²
- Ridge: 10m (SHORT dimension)
- Storey 1 height: 3m
- Storey 2 height: 3m
- Roof rise: 3m
- Total height: 9m (3m + 3m + 3m)
- Total volume: 720m³ (double the single-storey)

**2D Profile** (stacked rectangles + trapezoid):
```
     9m ___
       /   |
      /    | 3m roof rise
  6m |_____|
     |     | 3m storey 2
  3m |_____|
     |     | 3m storey 1
  0m |_____|
     10m wide
```

**Cross-section area**:
```javascript
// Storey 1: rectangle
const storey1Area = 10 * 3 = 30 m²

// Storey 2: rectangle
const storey2Area = 10 * 3 = 30 m²

// Roof: trapezoid (same as single-storey)
const roofArea = ((6 + 9) / 2) * 10 = 75 m² - 60 m² = 15 m²
// OR: roofArea = 10 * 3 / 2 = 15 m² (triangle approximation)

// Total cross-section
const totalArea = 30 + 30 + 30 = 90 m²
```

**Extrusion depth**:
```javascript
const depth = 720 / 90 = 8m ✓
```

**Key Observation**: Volume doubles when storeys double, extrusion depth stays same.

### Multi-Storey Gable Example (2-Storey)

**Diagram from user**:
```
Isometric view showing Z-axis mirror symmetry:

        Peak
         /\
        /  \
    6m |____| 6m
       |    |
    3m |____|
       |    |
    0m |____|
       10m wide

Ridge: 10m (SHORT dimension)
Extrusion depth: 16m (LONG dimension)
Footprint: 160m² (10m × 16m)
Roof area: 200m²
Total volume: 1280m³
```

**2D Profile** (rectangle + triangle):
```
Peak   /\
  8m  /  \  2m roof rise
     |____|
  6m |    | 3m storey 2
     |____|
  3m |    | 3m storey 1
     |____|
  0m
     10m wide
```

**Cross-section area**:
```javascript
// Storey 1: rectangle
const storey1Area = 10 * 3 = 30 m²

// Storey 2: rectangle
const storey2Area = 10 * 3 = 30 m²

// Roof: triangle
const roofTriangleArea = (10 * 2) / 2 = 10 m²

// Total cross-section
const totalArea = 30 + 30 + 10 = 70 m²
```

**Solve roof rise from roof area**:
```javascript
// Roof area = 2 × (ridge × slope)
const ridgeLength = 10;  // SHORT dimension
const slopeLength = 200 / (2 * 10) = 10m;

// Half-width to peak
const halfWidth = 10 / 2 = 5m;

// Pythagorean: slope² = halfWidth² + height²
const h2 = 10*10 - 5*5 = 100 - 25 = 75;
const roofHeight = Math.sqrt(75) = 8.66m;
```

**Extrusion depth**:
```javascript
const crossSectionArea = 30 + 30 + (10 * 8.66 / 2) = 60 + 43.3 = 103.3 m²
const depth = 1280 / 103.3 = 12.4m
// OR if roof area constraint is exact: depth = 16m (from footprint)
```

**Key Observation**: Same prismatic pattern works for gable - Z-axis mirror symmetry, same X-dimension sweep (10m).

### Wall Area Calculations

**Prismatic Advantage**: Wall areas become trivial to calculate.

**For Shed Roof (multi-storey)**:
```javascript
// Longitudinal walls (along extrusion depth)
const leftWallArea = extrusionDepth * shortWallHeight;  // Low eave wall
const rightWallArea = extrusionDepth * tallWallHeight;   // High eave wall

// End walls (trapezoid × 2)
const endWallArea = 2 * ((shortWallHeight + tallWallHeight) / 2) * ridgeLength;

// Total wall area
const totalWallArea = leftWallArea + rightWallArea + endWallArea;
```

**For Gable Roof (multi-storey)**:
```javascript
// Longitudinal walls (along extrusion depth)
const wallArea = 2 * extrusionDepth * wallHeight;  // Both side walls

// Gable ends (each end = rectangle + triangle)
const rectangleArea = ridgeLength * wallHeight;
const triangleArea = ridgeLength * roofHeight / 2;
const gableEndArea = 2 * (rectangleArea + triangleArea);

// Total wall area
const totalWallArea = wallArea + gableEndArea;
```

**Observation**: "Obviously wall areas would be easy to calculate" - proved correct!

### Generalized Multi-Storey Profile Solver

```javascript
function solve2DProfile_MultiStorey(width, stories, storyHeight, roofType, roofArea) {
  // Wall height = stories × story height
  const wallHeight = stories * storyHeight;  // e.g., 2 × 3m = 6m

  if (roofType === "flat") {
    return {
      nodes: [
        { x: 0,     z: 0 },
        { x: width, z: 0 },
        { x: width, z: wallHeight },
        { x: 0,     z: wallHeight },
      ],
      wallHeight: wallHeight,
      roofHeight: 0,
      stories: stories,
    };
  }

  if (roofType === "gable") {
    const ridgeLength = width;
    const slopeLength = roofArea / (2 * ridgeLength);
    const halfWidth = width / 2;
    const h2 = slopeLength * slopeLength - halfWidth * halfWidth;
    const roofHeight = Math.sqrt(h2);

    return {
      nodes: [
        { x: 0,         z: 0 },
        { x: width,     z: 0 },
        { x: width,     z: wallHeight },
        { x: width / 2, z: wallHeight + roofHeight },
        { x: 0,         z: wallHeight },
      ],
      wallHeight: wallHeight,
      roofHeight: roofHeight,
      stories: stories,
    };
  }

  if (roofType === "shed") {
    // Assume shortWallHeight = wallHeight, solve roof rise
    const ridgeLength = width;
    const span = length;
    const slopeLength = roofArea / ridgeLength;
    const R = slopeLength * slopeLength;
    const Q_span = span * span;
    const Q_height = R - Q_span;
    const roofHeight = Math.sqrt(Q_height);
    const tallWallHeight = wallHeight + roofHeight;

    return {
      nodes: [
        { x: 0,     z: 0 },
        { x: width, z: 0 },
        { x: width, z: tallWallHeight },
        { x: 0,     z: wallHeight },
      ],
      wallHeight: wallHeight,
      roofHeight: roofHeight,
      tallWallHeight: tallWallHeight,
      stories: stories,
    };
  }
}
```

**Result**: Same algorithm pattern works for 1, 2, 3, ... N storeys!

### Fewer Steps to Volume

**Traditional Approach** (WOMBAT 3):
1. Solve footprint from d_95
2. Solve roof geometry from d_85 (roof area)
3. Calculate wall area from footprint + roof
4. Iterate to match d_105 (volume) by adjusting height
5. Re-check wall area, re-iterate if needed
6. Render from implicit geometry

**Prismatic Approach** (WOMBAT 4):
1. Solve footprint from d_95 ✓
2. Solve 2D profile from roof area ✓
3. Extrude: depth = d_105 / cross-section area ✓
4. Wall areas = simple geometry from profile + depth ✓
5. Render from 8 nodes ✓

**Steps reduced**: 6 → 5, and **no iteration**!

---

### 4. Hip Roof (Future - Truncated Gable)

**2D Profile**: Trapezoid (like shed but symmetric)

```javascript
function solveHip2DProfile(width, roofArea, wallHeight) {
  // Hip roof is gable with truncated peak
  // Ridge runs across SHORT dimension
  const ridgeLength = width;

  // Solve similar to gable, but with flat ridge at top
  // (Detailed implementation TBD)

  return {
    nodes: [
      { x: 0,     z: 0 },              // Left ground
      { x: width, z: 0 },              // Right ground
      { x: width, z: wallHeight },     // Right eave
      { x: width * 0.75, z: wallHeight + hipHeight }, // Ridge right
      { x: width * 0.25, z: wallHeight + hipHeight }, // Ridge left
      { x: 0,     z: wallHeight },     // Left eave
    ],
    type: "hip",
    height: hipHeight,
    shortWallHeight: wallHeight,
    tallWallHeight: wallHeight,
    avgWallHeight: wallHeight,
    endWallArea: hipEndArea,
  };
}
```

**Cross-section**: `width × wallHeight + trapezoid_roof_area`

**Extrude**: `depth = d_105 / crossSectionArea`

**Render**: Hexagonal prism (6 nodes per end)

---

## Ridge Orientation Convention

**CRITICAL DESIGN DECISION**: Ridge always runs across **SHORT dimension**

### Structural Rationale

In real buildings, structural beams span the SHORT dimension to minimize:
- Beam deflection (proportional to span⁴)
- Material cost
- Structural complexity

### Implementation

```javascript
// ALWAYS use this convention
const ridgeLength = Math.min(width, length);  // SHORT dimension
const span = Math.max(width, length);         // LONG dimension (perpendicular to ridge)
```

**Result**:
- Square buildings (width = length): Ridge orientation arbitrary
- Rectangular buildings: Ridge ALWAYS across short dimension
- Consistent with structural engineering practice

---

## Benefits of Prismatic Approach

### 1. Code Clarity

| Aspect | Current (WOMBAT 3) | Prismatic (WOMBAT 4) |
|--------|-------------------|----------------------|
| **Roof solvers** | 3 separate functions | 1 unified pattern |
| **Solve order** | Varies by roof type | Always: footprint → profile → extrude |
| **Iteration** | Possible for convergence | Never - direct solve |
| **Renderer logic** | Conditional per roof type | Generic from 8 nodes |
| **Lines of code** | ~800 (estimated) | ~400 (estimated) |

### 2. Maintainability

- **Single solve pattern** - easier to debug
- **Clear constraints** - d_95 → profile → d_105 dependency chain
- **Extensible** - new roof types = new profile solver
- **Testable** - each phase independently testable

### 3. Performance

- **No iteration** - direct geometric solve
- **Minimal recalculation** - only when constraints change
- **Simpler rendering** - 8 nodes vs complex conditional logic

### 4. Correctness

- **Volume guarantee** - extrusion depth directly from d_105
- **No drift** - no convergence issues
- **Constraint satisfaction** - explicit solve order ensures consistency

---

## Implementation Strategy

### Non-Breaking Approach

**DO NOT modify existing working code!**

1. **Create parallel files**:
   - `Section19-2.js` - New prismatic solver
   - `wombatRender-2.js` - New node-based renderer

2. **Feature flag**:
   ```javascript
   const USE_PRISMATIC_SOLVER = false; // Toggle for testing

   if (USE_PRISMATIC_SOLVER) {
     const geometry = Section19_2.solveGeometry(...);
     WombatRender_2.render(geometry, ...);
   } else {
     // Existing WOMBAT 3 code
     const geometry = Section19.solveGeometry(...);
     WombatRender.render(geometry, ...);
   }
   ```

3. **Parallel validation**:
   - Run BOTH solvers
   - Compare outputs
   - Flag discrepancies
   - Build confidence before switchover

4. **Migration path**:
   - Phase 1: Implement Section19-2.js (flat + gable + shed)
   - Phase 2: Validate against Section19.js outputs
   - Phase 3: Add hip roof (new functionality)
   - Phase 4: Enable flag, deprecate old code
   - Phase 5: Remove Section19.js after burn-in period

---

## File Structure

### New Files (Create)

```
src/sections/
├── Section19-2.js          ← New prismatic solver
└── Section19.js            ← Keep existing (deprecated later)

src/core/
├── wombatRender-2.js       ← New node-based renderer
└── wombatRender.js         ← Keep existing (deprecated later)

docs/development/S19 Docs/
├── S19-WOMBAT-4.md         ← This document
├── S19-WOMBAT-3.md         ← Current implementation docs
└── S19-WOMBAT-MIGRATION.md ← Migration guide (future)
```

### Integration Points

**index.html**:
```html
<!-- Existing -->
<script src="src/sections/Section19.js"></script>
<script src="src/core/wombatRender.js"></script>

<!-- New (load alongside for validation) -->
<script src="src/sections/Section19-2.js"></script>
<script src="src/core/wombatRender-2.js"></script>
```

**Feature flag in Section19-2.js**:
```javascript
window.TEUI = window.TEUI || {};
window.TEUI.WOMBAT_USE_PRISMATIC = false; // Set true to enable

// Export both solvers
window.TEUI.Section19_Legacy = Section19; // Existing
window.TEUI.Section19_Prismatic = Section19_2; // New
```

---

## Testing Strategy

### Unit Tests (New)

Test each phase independently:

1. **Profile solvers**:
   ```javascript
   test("solveFlat2DProfile", () => {
     const profile = solveFlat2DProfile(10, 3);
     expect(profile.nodes.length).toBe(4);
     expect(profile.avgWallHeight).toBe(3);
   });
   ```

2. **Extrusion**:
   ```javascript
   test("extrudeProfile", () => {
     const profile = solveFlat2DProfile(10, 3);
     const result = extrudeProfile(profile, 300); // 10×3×10 = 300
     expect(result.depth).toBeCloseTo(10);
   });
   ```

3. **3D node generation**:
   ```javascript
   test("generate3DNodes", () => {
     const profile = solveFlat2DProfile(10, 3);
     const nodes = generate3DNodes(profile, 10);
     expect(nodes.all.length).toBe(8);
   });
   ```

### Integration Tests

Compare WOMBAT 3 vs WOMBAT 4 outputs:

```javascript
test("prismatic matches legacy - flat roof", () => {
  const inputs = { d_95: 100, d_105: 300, g_106: 3, roofType: "flat" };

  const legacy = Section19.solveGeometry(inputs);
  const prismatic = Section19_2.solveGeometry(inputs);

  expect(prismatic.footprint).toEqual(legacy.footprint);
  expect(prismatic.height).toBeCloseTo(legacy.height);
  expect(prismatic.totalHeight).toBeCloseTo(legacy.totalHeight);
});
```

### Visual Regression Tests

Render both and compare SVG outputs:

```javascript
test("visual parity - gable roof", () => {
  const geometry_legacy = Section19.solveGeometry(...);
  const geometry_prismatic = Section19_2.solveGeometry(...);

  const svg_legacy = WombatRender.render(geometry_legacy);
  const svg_prismatic = WombatRender_2.render(geometry_prismatic);

  // Compare bounding boxes, node positions, edge counts
  expect(svg_prismatic.bbox).toEqual(svg_legacy.bbox);
});
```

---

## Success Criteria

✅ WOMBAT 4 complete when:

1. **Parity**: All WOMBAT 3 roof types (flat, gable, shed) render identically
2. **Extension**: Hip roof implemented using prismatic approach
3. **Performance**: No regression vs WOMBAT 3
4. **Tests**: 100% unit test coverage of profile solvers
5. **Documentation**: Migration guide for future developers
6. **Validation**: Parallel mode runs both solvers, flags discrepancies
7. **Cleanup**: WOMBAT 3 code deprecated, removed after 1-month burn-in

---

## Open Questions

1. **Hip roof profile**: What exact geometry for truncated gable?
2. **Pyramidal roof**: Can this fit prismatic model? (Probably not - true multiplanar)
3. **Cathedral ceilings**: How to handle non-rectilinear volumes?
4. **Mezzanines**: Does prismatic work with split-level floors?

---

## Implementation Status

### Completed ✅

1. ✅ **Document review** - Architectural design approved
2. ✅ **Create Section19.js** (activated from Section19-2.js) - Prismatic solver implemented
3. ✅ **Create wombatRender.js** (activated from wombatRender-2.js) - Wireframe renderer implemented
4. ✅ **File activation** - Renamed to replace WOMBAT 3 files, backups created
5. ✅ **Branch setup** - WOMBAT-PRISMATIC branch created and active
6. ✅ **Flat roof solver** - Renders cube (8 nodes), verified working
7. ✅ **Gable roof solver** - Renders house with ridge (10 nodes), verified working
8. ✅ **Dropdown integration** - Roof type (d_159) correctly switches between flat/gable/shed
9. ✅ **Renderer fixes** - Parameter order, export name, placeholder function all fixed
10. ✅ **Shed roof solver** - Renders sloped trapezoid (8 nodes), verified working

### Completed ✅ (continued)

11. ✅ **Aspect ratio implementation** - d_154 slider wired to footprint dimensions (Section19.js:910-927)
12. ✅ **Roof collapse constraint** - Auto-fallback to flat if roof area ≤ footprint (Section19.js:932-945)
13. ✅ **Storey height sacrificial** - Wall height derived from volume, not prescribed (Section19.js:954-960)
14. ✅ **Legend annotations** - Canvas legend with roof area, floorplate area, wall areas, storey height, dimensions
15. ✅ **Documentation updates** - Constraint hierarchy, roof collapse rule, aspect ratio analysis

### Next Steps 📋

16. **Test aspect ratio impact** - Verify shed roof height reduces with landscape aspect ratio
17. **Volume iteration** - Refine wall height calculation to exactly match volume constraint
16. **Area constraints** - Iterate to satisfy roof area (d_85) exactly
17. **Wall area calculations** - Implement prismatic wall area formulas and display
18. **Multi-storey support** - Scale pattern for multiple storeys
19. **Test and merge** - Comprehensive testing, then merge to main
20. **Future enhancements** - Hip roof, pyramidal, basement support

---

## Current Implementation Details

### Files Changed

**Active Files** (WOMBAT 4 Prismatic):
- `src/sections/Section19.js` - Prismatic solver with flat roof support
- `src/core/wombatRender.js` - 8-node wireframe renderer

**Backup Files** (WOMBAT 3 Legacy):
- `src/sections/Section19-WOMBAT3-BACKUP.js` - Original iterative solver
- `src/core/wombatRender-WOMBAT3-BACKUP.js` - Original renderer

### Implemented Functions

**Section19.js**:
- `solveFlat2DProfile(width, wallHeight)` - Returns 4-node rectangle profile
- `solveGable2DProfile(width, roofArea, wallHeight)` - Returns 5-node gable profile (pentagon)
- `solveShed2DProfile(width, roofArea, length, wallHeight)` - Returns 4-node trapezoid profile (shed)
- `extrudeProfile(profile2D, targetVolume)` - Calculates extrusion depth, handles flat/gable/shed cross-sections
- `generate3DNodes(profile2D, extrusionDepth)` - Creates 8 or 10 nodes (flat=8, gable=10, shed=8)
- `solveGeometry(isReferenceCalculation)` - Main entry point, reads d_159 roof type

**wombatRender.js**:
- `toIsometric(x, y, z, scale, centerX, centerY)` - 3D → 2D projection
- `createLine(p1, p2, stroke, strokeWidth)` - SVG line helper
- `createNode(point, fill, radius)` - SVG circle helper
- `createText(x, y, text, color, fontSize, options)` - SVG text helper
- `renderPlaceholder(svg)` - Shows inactive state message
- `render(geometry, mode, svg, options)` - Main rendering function, handles flat/gable/shed

**Roof Type Values** (from d_159 dropdown):
- `"flat"` → Flat roof (8 nodes) ✅
- `"biplanar"` → Gable roof (10 nodes) ✅
- `"monoplane"` → Shed roof (8 nodes) ✅
- `"multiplanar"` → Pyramid/Hip (future)

### Known Issues

- **Shed roof height**: Currently too tall (33m visible in screenshot) - likely caused by square footprint aspect ratio forcing roof area over short ridge. Need to:
  - Wire aspect ratio slider (d_154) to redistribute roof area over longer dimension
  - Verify roof area constraint (d_85) is properly applied
  - Add legend annotations to troubleshoot constraint satisfaction

- **Missing legend annotations**: Need to restore upper-left canvas legend from WOMBAT 3:
  - **Roof Area**: `xxxx.xx m²` (from d_85, StateManager 2dp format)
  - **Floorplate Area**: `xxxx.xx m²` (from d_95 or d_87, 2dp)
  - **Gable End Wall Area**: `xxxx.xx m²` (calculated, visible for gable roofs only)
  - **Shed End Wall Area**: `xxxx.xx m²` (calculated, visible for shed roofs only)
  - **Ae Wall Area**: `xxxx.xx m²` (calculated air-facing longitudinal walls)
  - **Storey Height**: `x.xx m` (from h_156, 2dp)
  - **Footprint Dimensions**: X and Y labels showing `Width: xx.x m` and `Length: xx.x m`

- **Volume calculation approximate**: 0.85 factor for gable/shed, needs exact iteration to satisfy volume constraint
- **Aspect ratio fixed at 1:1**: Square footprint currently, needs d_154 slider integration to allow rectangular footprints
- **Wall areas not calculated**: Prismatic formulas designed but not implemented yet
- **No multi-storey support yet**: Phase 2 enhancement

---

**Document Status**: ACTIVE - Implementation in progress
**Author**: Claude + Andy
**Date**: 2025-12-19 (Created), 2025-12-20 (Updated with progress)
**Branch**: WOMBAT-PRISMATIC
**Next Review**: After flat roof rendering verified
