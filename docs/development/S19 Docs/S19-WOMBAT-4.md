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

**CRITICAL INSIGHT (2025-12-20)**: The constraint order was BACKWARDS in initial WOMBAT-4 implementation!

### Correct Constraint Flow (from Section19.js.backup)

The backup file (WOMBAT 3) had the **correct constraint order** documented at lines 1113-1122:

```javascript
// CORRECT CONSTRAINT FLOW (per user specification 2025-12-15)
// 1. Footprint (d_95) = SACRED touchstone
// 2. Mezzanine = h_15 - d_95 (if Mezzanine/Partial Floor option selected)
// 3. Total Wall Area = d_86 + all windows
// 4. Solve ridge height from roof area (d_85) FIRST ← CRITICAL
// 5. Extract gable end area from wall area
// 6. Wall height = (walls - gables) / perimeter
// 7. Volume (d_105) is verification check ONLY ← NOT a driver!
```

### Sacred Constraints (Execution Order)

These constraints MUST be satisfied in THIS ORDER:

1. **Footprint Area** (d_95 or d_87) - SACRED touchstone, foundation of all geometry
2. **Aspect Ratio** (d_154) - Reshapes footprint: `width = sqrt(area/aspectRatio)`, `length = area/width`
3. **Roof Area** (d_85) - SACRED, drives roof height calculation FIRST
   - **ROOF COLLAPSE RULE**: If roof area ≤ footprint area, pitched roof is geometrically impossible
   - Automatically falls back to flat roof
   - User must increase d_85 to > 110% of footprint area to enable pitched roofs
4. **Roof Geometry Solved** - Calculate roof height from roof area using rational trigonometry
5. **Roof Volume Calculated** - Derive volume from roof geometry (pyramid, prism, etc.)
6. **Volume** (d_105) - SACRED total volume constraint
7. **Wall Height DERIVED** - **SACRIFICIAL**: `wallHeight = (volume - roofVolume) / footprintArea`
   - Roof "steals" volume from walls
   - Storey height gets compressed if roof takes significant volume
   - Can result in "pancake" storeys if roof volume is large relative to total volume

### What Was Wrong (Initial WOMBAT-4 Implementation)

**Incorrect Order** (lines 962-968 in current Section19.js):
```javascript
// ❌ WRONG: Estimated wall height FIRST, then solve roof
const estimatedWallHeight = targetVolume / footprintArea * 0.85; // Rough guess
profile2D = solveGable2DProfile(ridgeLength, roofArea, estimatedWallHeight);

// Then extrude to match volume
const extrusion = extrudeProfile(profile2D, targetVolume);
```

**Problems**:
1. Wall height estimated from volume × 0.85 factor (arbitrary)
2. Roof geometry solved with estimated wall height
3. Extrusion depth forced to match total volume
4. Result: Footprint dimensions wrong, roof geometry doesn't satisfy roof area constraint

**Evidence from Flat Roof Test** (2025-12-20):
- Flat roof at aspect ratio +4.00 renders CORRECTLY
- Footprint: 14.84m × 74.19m = 1100.92 m² (exact 5:1 ratio) ✅
- Storey Height: 7.56m = 8319.5 ÷ 1100.92 ✅
- Visual proportions: Long skinny rectangle ✅
- **Conclusion**: Footprint and wall solver work perfectly when roof volume = 0

### Correct Implementation Pattern (from backup)

**Phase 1: Footprint** (backup lines 1124-1132)
```javascript
const width = Math.sqrt(footprintArea / aspectRatio);
const length = footprintArea / width;  // Exact, no rounding error
```

**Phase 4: Roof Geometry FIRST** (backup lines 1183-1271)
```javascript
// Solve roof height from roof area constraint using rational trigonometry
const gableData = calculateGableHeight(width, length, roofArea);
roofHeight = gableData.height;
gableEndArea = 2 * gableData.gableEndArea;

// Calculate roof volume (for gable: pyramid volume of triangular cap)
const roofVolume = (footprintArea * roofHeight) / 3;  // Pyramid formula
```

**Phase 5: Wall Height DERIVED** (backup lines 1273-1319)
```javascript
// Wall height is SACRIFICIAL - derived from remaining volume after roof
const wallVolume = conditionedVolume - roofVolume;
const wallHeight = wallVolume / footprintArea;
const storyHeight = wallHeight / storiesDeclared;

console.log(`Roof steals ${roofVolume.toFixed(0)}m³, leaving ${wallVolume.toFixed(0)}m³ for walls`);
```

### Visual Proof of Problem

**Current WOMBAT-4 with Gable Roof** (aspect ratio -4.00):
- Displayed dimensions: 74.2m × 14.8m (says width=74.19, length=14.84)
- Expected proportions: 5:1 ratio
- **Visual proportions**: WRONG - appears nearly square, not 5:1
- **Volume calculation**: Footprint × storey height = 1100.98 × 6.42 = 7068.29 m³
- **Roof volume remaining**: 8319.5 - 7068.29 = only 1251.21 m³
- **Problem**: Roof area constraint (1574 m²) cannot be satisfied with only 1251 m³ available

**Correct Approach** (what should happen):
1. Footprint: 1100.92 m² → width=14.84m, length=74.19m (portrait mode, aspect=-4)
2. Roof area: 1574 m² → solve gable height using ridgeLength=14.84m (SHORT)
3. Roof height: ~H meters (from Pythagorean theorem with roof area constraint)
4. Roof volume: (1100.92 × H) / 3 = ~V m³
5. Wall height: (8319.5 - V) / 1100.92 = reduced height
6. Storey height: wallHeight / 1 storey = sacrificial (compressed by roof)

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

## Implementation Specification: Correct Constraint Order

**STATUS**: 🚧 **NEEDS IMPLEMENTATION** - Documentation complete, code needs refactoring

This section provides a complete specification for fixing the constraint order in WOMBAT-4.

### High-Level Algorithm

```javascript
function solveGeometry(isReferenceCalculation) {
  // Phase 1: Read SACRED constraints
  const footprintArea = getModeAwareValue("d_95");  // SACRED
  const roofArea = getModeAwareValue("d_85");        // SACRED
  const targetVolume = getModeAwareValue("d_105");   // SACRED
  const aspectRatioRaw = getModeAwareValue("d_154"); // User preference
  const roofTypeRequested = getModeAwareValue("d_159"); // User selection
  const storiesDeclared = getModeAwareValue("d_150"); // User input

  // Phase 2: Calculate footprint dimensions from aspect ratio
  const aspectRatio = aspectRatioRaw >= 0
    ? 1 + aspectRatioRaw
    : 1 / (1 - aspectRatioRaw);

  const width = Math.sqrt(footprintArea / aspectRatio);
  const length = footprintArea / width;  // Exact preservation

  // Phase 3: Calculate ridge orientation (dynamic)
  const ridgeLength = Math.min(width, length);  // SHORT dimension
  const span = Math.max(width, length);         // LONG dimension
  const ridgeOrientation = length >= width ? "longitudinal" : "transverse";

  // Phase 4: Solve roof geometry from ROOF AREA constraint (FIRST!)
  const roofResult = solveRoofGeometry(
    roofTypeRequested,
    roofArea,
    footprintArea,
    ridgeLength,
    span
  );

  // roofResult contains:
  // - roofHeight: height of ridge above eave
  // - roofVolume: volume of pitched cap
  // - roofType: "flat", "gable", "shed", "hip" (may collapse)
  // - gableEndArea: area of triangular ends (for wall area calculations)

  // Phase 5: Derive wall height from REMAINING volume (SACRIFICIAL!)
  const wallVolume = targetVolume - roofResult.roofVolume;
  const wallHeight = wallVolume / footprintArea;
  const storyHeight = wallHeight / storiesDeclared;

  // Phase 6: Build 2D profile for rendering (NOT for solving!)
  const profile2D = build2DProfile(
    roofResult.roofType,
    ridgeLength,
    wallHeight,
    roofResult.roofHeight
  );

  // Phase 7: Extrude along SPAN dimension (perpendicular to profile)
  const nodes3D = generate3DNodes(profile2D, span);

  // Return complete geometry
  return {
    footprint: { width, length },
    ridgeOrientation,
    roofType: roofResult.roofType,
    roofHeight: roofResult.roofHeight,
    roofVolume: roofResult.roofVolume,
    wallHeight,
    storyHeight,
    stories: storiesDeclared,
    totalHeight: wallHeight + roofResult.roofHeight,
    nodes3D,
    profile2D
  };
}
```

### Key Function: solveRoofGeometry()

This function solves roof geometry from the roof area constraint FIRST, without knowing wall height.

```javascript
function solveRoofGeometry(roofTypeRequested, roofArea, footprintArea, ridgeLength, span) {
  // Check roof collapse condition
  const areaRatio = roofArea / footprintArea;

  if (areaRatio <= 1.01) {
    // Roof area ≤ footprint → pitched roof impossible
    return {
      roofType: "flat",
      roofHeight: 0,
      roofVolume: 0,
      gableEndArea: 0
    };
  }

  // Roof area > footprint → solve pitched roof geometry
  if (roofTypeRequested === "biplanar") {
    return solveGableRoof(roofArea, ridgeLength, span, footprintArea);
  } else if (roofTypeRequested === "monoplane") {
    return solveShedRoof(roofArea, ridgeLength, span, footprintArea);
  } else if (roofTypeRequested === "multiplanar") {
    return solveHipRoof(roofArea, ridgeLength, span, footprintArea);
  } else {
    // Flat roof explicitly selected
    return {
      roofType: "flat",
      roofHeight: 0,
      roofVolume: 0,
      gableEndArea: 0
    };
  }
}
```

### Gable Roof Solver (from backup)

```javascript
function solveGableRoof(roofArea, ridgeLength, span, footprintArea) {
  // Gable roof: two rectangular slopes meet at ridge
  // Ridge runs across SHORT dimension (ridgeLength)
  // Slope runs down LONG dimension (span)

  // Total roof area = 2 rectangular slopes
  // roofArea = 2 × ridgeLength × slopeLength
  // Therefore: slopeLength = roofArea / (2 × ridgeLength)
  const slopeLength = roofArea / (2 * ridgeLength);

  // Pythagorean theorem (rational trigonometry):
  // slopeLength² = roofHeight² + (span/2)²
  // roofHeight² = slopeLength² - (span/2)²
  const h2 = slopeLength * slopeLength - (span * span) / 4;

  if (h2 < 0) {
    console.error(`[WOMBAT] Invalid gable geometry - roof area ${roofArea.toFixed(0)}m² too small for footprint`);
    return {
      roofType: "flat",
      roofHeight: 0,
      roofVolume: 0,
      gableEndArea: 0
    };
  }

  const roofHeight = Math.sqrt(h2);

  // Gable end area (triangular): base × height / 2
  const gableEndArea = (span * roofHeight) / 2;

  // Roof volume = rectangular prism (footprint × roofHeight / 2)
  // OR equivalently: pyramid volume = (base × height) / 3 where base = 2 × footprint
  const roofVolume = (footprintArea * roofHeight) / 2;

  console.log(`[WOMBAT] Gable roof solved from area constraint:`);
  console.log(`  Roof area: ${roofArea.toFixed(2)} m²`);
  console.log(`  Ridge length: ${ridgeLength.toFixed(2)} m (SHORT dimension)`);
  console.log(`  Span: ${span.toFixed(2)} m (LONG dimension)`);
  console.log(`  Slope length: ${slopeLength.toFixed(2)} m`);
  console.log(`  Roof height: ${roofHeight.toFixed(2)} m`);
  console.log(`  Roof volume: ${roofVolume.toFixed(2)} m³ (steals from walls)`);
  console.log(`  Gable end area (both): ${(2 * gableEndArea).toFixed(2)} m²`);

  return {
    roofType: "gable",
    roofHeight,
    roofVolume,
    gableEndArea: 2 * gableEndArea  // Both triangular ends
  };
}
```

### Shed Roof Solver

```javascript
function solveShedRoof(roofArea, ridgeLength, span, footprintArea) {
  // Shed roof: single rectangular slope
  // Ridge runs across SHORT dimension (ridgeLength) at HIGH end
  // Slope runs down LONG dimension (span)

  // Roof area = ridgeLength × slopeLength
  const slopeLength = roofArea / ridgeLength;

  // Pythagorean theorem:
  // slopeLength² = roofHeight² + span²
  // roofHeight² = slopeLength² - span²
  const h2 = slopeLength * slopeLength - span * span;

  if (h2 < 0) {
    console.error(`[WOMBAT] Invalid shed geometry - roof area ${roofArea.toFixed(0)}m² too small for footprint`);
    return {
      roofType: "flat",
      roofHeight: 0,
      roofVolume: 0,
      gableEndArea: 0
    };
  }

  const roofHeight = Math.sqrt(h2);

  // Shed end wall area (rectangular): ridgeLength × roofHeight
  const shedEndWallArea = ridgeLength * roofHeight;

  // Roof volume = trapezoidal prism volume
  // = footprint × (average height above eave)
  // = footprint × (roofHeight / 2)
  const roofVolume = (footprintArea * roofHeight) / 2;

  console.log(`[WOMBAT] Shed roof solved from area constraint:`);
  console.log(`  Roof area: ${roofArea.toFixed(2)} m²`);
  console.log(`  Ridge length: ${ridgeLength.toFixed(2)} m (SHORT dimension)`);
  console.log(`  Span: ${span.toFixed(2)} m (LONG dimension)`);
  console.log(`  Slope length: ${slopeLength.toFixed(2)} m`);
  console.log(`  Roof height: ${roofHeight.toFixed(2)} m`);
  console.log(`  Roof volume: ${roofVolume.toFixed(2)} m³ (steals from walls)`);
  console.log(`  Shed end wall area (both): ${(2 * shedEndWallArea).toFixed(2)} m²`);

  return {
    roofType: "shed",
    roofHeight,
    roofVolume,
    shedEndWallArea: 2 * shedEndWallArea  // Both rectangular ends
  };
}
```

### Modified Profile Builders (for rendering only)

The profile solvers no longer SOLVE geometry - they just BUILD 2D node arrays for rendering.

```javascript
function build2DProfile(roofType, width, wallHeight, roofHeight) {
  // width = ridgeLength (SHORT dimension)
  // This profile will be extruded along span (LONG dimension)

  if (roofType === "gable") {
    return {
      type: "gable",
      wallHeight,
      height: roofHeight,
      nodes: [
        { x: 0, z: 0 },                     // Left ground
        { x: width, z: 0 },                 // Right ground
        { x: width, z: wallHeight },        // Right eave
        { x: width / 2, z: wallHeight + roofHeight }, // Ridge (center)
        { x: 0, z: wallHeight }             // Left eave
      ]
    };
  } else if (roofType === "shed") {
    return {
      type: "shed",
      wallHeight,
      tallWallHeight: wallHeight + roofHeight,
      height: roofHeight,
      nodes: [
        { x: 0, z: 0 },                          // Left ground (short wall)
        { x: width, z: 0 },                      // Right ground (tall wall)
        { x: width, z: wallHeight + roofHeight }, // Right eave (tall)
        { x: 0, z: wallHeight }                  // Left eave (short)
      ]
    };
  } else {
    // Flat roof
    return {
      type: "flat",
      wallHeight,
      height: 0,
      nodes: [
        { x: 0, z: 0 },
        { x: width, z: 0 },
        { x: width, z: wallHeight },
        { x: 0, z: wallHeight }
      ]
    };
  }
}
```

### Implementation Checklist

- [x] Refactor `solveGeometry()` to use correct constraint order (Commit 9cd09d3)
- [x] Implement `solveRoofGeometry()` function (Commit 2412e2f)
- [x] Implement `solveGableRoof()` with volume calculation (Commit 2412e2f)
- [x] Implement `solveShedRoof()` with volume calculation (Commit 2412e2f)
- [ ] Modify profile builders to NOT solve (just build node arrays)
- [ ] Remove `extrudeProfile()` volume-matching logic
- [ ] Update `generate3DNodes()` to use span dimension for extrusion
- [x] Test flat roof (WORKS - roof volume = 0) ✅
- [x] Test gable roof with aspect ratio +4 and -4 (RENDERS but bugs found) ⚠️
- [x] Test shed roof with aspect ratio +4 and -4 (RENDERS but bugs found) ⚠️
- [x] Verify footprint proportions render correctly (WORKS) ✅
- [ ] Verify storey height compresses when roof volume is large
- [ ] Update legend to show "Roof steals Xm³ from walls"

### Testing Results (2025-12-20)

**STATUS**: 🧪 **TESTING IN PROGRESS** - Core refactoring complete, rendering bugs identified

**What Works ✅**:
1. **Flat roof** - Perfect at all aspect ratios
2. **Pyramid roof** - Perfect at all aspect ratios (for now)
3. **Footprint proportions** - Displays correctly (19.48m × 56.50m at aspect +1.90)
4. **Ridge orientation swap** - Clever solution: flip X/Y instead of rotating building
5. **Aspect ratio calculation** - Works across full range (-4 to +4)
6. **Storey height compression** - Shows negative heights when roof steals too much volume

**Critical Bugs Found ⚠️**:

**Bug 1: Shed Roof Dives Below Ground (Bowtie Effect)**
- **Symptom**: Shed roof extends BELOW ground plane, forming 3D "bowtie" shape
- **Root Cause**: Roof geometry positioned from ground (Z=0) instead of eave line
- **Expected**: Roof should sit ON TOP of base storey, from eave to ridge
- **Fix Needed**: Profile nodes should place short wall at eave, tall wall at eave+roofHeight
- **Test Case**: Aspect +2.30, shed roof shows building height -16.63m (NEGATIVE!)

**Bug 2: Gable Roof Exceeds Area Allowance**
- **Symptom**: Gable roof area far exceeds specified roof area constraint
- **Root Cause**: Roof geometry solving may be using wrong dimensions
- **Expected**: Roof area should equal 1411.52 m² (from d_85)
- **Test Case**: Aspect +1.90, gable shows "Gable End Wall Area: 266.27 m²"
- **Fix Needed**: Verify slopeLength calculation and area formulas

**Bug 3: Gable Roof Builds from Grade, Not Eave**
- **Symptom**: Gable roof positioned from ground (Z=0) instead of eave line
- **Root Cause**: Same as Bug 1 - profile nodes use absolute Z instead of eave-relative
- **Expected**: Triangle should sit on top of rectangular walls (eave to ridge)
- **Fix Needed**: Profile builders need wallHeight offset in Z coordinates

**Bug 4: Missing Axis Indicator**
- **Symptom**: No visual indicator of coordinate system or ridge orientation
- **Expected**: Show X, Y, Z axis key (Z-up, Y-North, X-E/W) like backup file
- **Implementation**: Add axis indicator that rotates when aspect ratio crosses origin
- **Purpose**: Help user understand ridge orientation swap (longitudinal ↔ transverse)

### Detailed Bug Analysis

**Shed Roof Bowtie (CRITICAL)**:

Current profile nodes (Section19.js:~950-970):
```javascript
// WRONG - positions from ground
nodes: [
  { x: 0, z: 0 },                          // Short wall ground
  { x: width, z: 0 },                      // Tall wall ground
  { x: width, z: wallHeight + roofHeight }, // Tall wall top
  { x: 0, z: wallHeight }                  // Short wall top (eave)
]
```

Should be:
```javascript
// CORRECT - positions from eave line
nodes: [
  { x: 0, z: 0 },                     // Left ground
  { x: width, z: 0 },                 // Right ground
  { x: width, z: wallHeight },        // Right eave (short wall)
  { x: width / 2, z: wallHeight + roofHeight }, // Ridge (high point)
  { x: 0, z: wallHeight + roofHeight } // Left eave (tall wall)
]
```

Wait, this is actually backwards. Shed roof should be:
```javascript
nodes: [
  { x: 0, z: 0 },                          // Left ground
  { x: width, z: 0 },                      // Right ground
  { x: width, z: wallHeight + roofHeight }, // Right top (tall wall)
  { x: 0, z: wallHeight }                  // Left top (short wall = eave)
]
```

The issue is the roof is being built DOWNWARD instead of UPWARD from the eave line.

**Gable Roof Geometry (CRITICAL)**:

The issue is likely in the volume calculation. Current formula:
```javascript
const roofVolume = (footprintArea * roofHeight) / 2;  // Rectangular prism
```

This is CORRECT for gable roof (two triangular prisms).

The visual issue suggests the profile is being built incorrectly. Let me check if it's the same eave-offset problem.

Current gable profile (Section19.js:~920-935):
```javascript
nodes: [
  { x: 0, z: 0 },                     // Left ground
  { x: width, z: 0 },                 // Right ground
  { x: width, z: wallHeight },        // Right eave
  { x: width / 2, z: wallHeight + roofHeight }, // Ridge (center)
  { x: 0, z: wallHeight }             // Left eave
]
```

This looks CORRECT! The triangle sits on top of the rectangle. So why is it rendering from grade?

**Hypothesis**: The issue might be in generate3DNodes() - it may be using absolute coordinates instead of offsetting the roof portion by wallHeight.

### Fix Priority

1. **CRITICAL**: Fix shed/gable roof Z-offset (profiles building from ground instead of eave)
2. **HIGH**: Verify roof area constraint satisfaction (gable exceeding allowance)
3. **MEDIUM**: Add axis indicator for ridge orientation visualization
4. **LOW**: Add "Roof steals Xm³" to legend

### Next Implementation Step

Focus on fixing Bug 1 & 3 together - the Z-offset issue affecting both shed and gable roofs.

### Step-by-Step Implementation Plan

**Decision (2025-12-20)**: Modify current WOMBAT-4 files, not backup files.

**Rationale**:
- Prismatic rendering works perfectly (proven by flat roof test)
- Dynamic ridge orientation already implemented (commit c27b220)
- Only need to refactor constraint order (~250-300 lines in one file)
- Backup has complex rendering and broken shed roof wall areas
- This is a surgical fix, not major surgery

**5-Phase Implementation**:

**Phase 1: Add Roof Solver Functions** (~120 lines, Section19.js)
- Add `solveRoofGeometry()` function (lines 1097-1127 from spec)
- Add `solveGableRoof()` function (lines 1133-1182 from spec)
- Add `solveShedRoof()` function (lines 1188-1236 from spec)
- These functions solve ONLY roof geometry from roof area constraint
- They calculate roof volume and return it for wall height derivation

**Phase 2: Refactor solveGeometry() Function** (~80 lines, Section19.js)
- Follow high-level algorithm (lines 1022-1089 from spec)
- Change constraint order: footprint → roof area → volume
- Call `solveRoofGeometry()` BEFORE calculating wall height
- Derive wall height from: `wallHeight = (targetVolume - roofVolume) / footprintArea`
- Remove `0.85` estimation factor (now exact)
- Pass `storyHeight` to returned geometry object

**Phase 3: Modify Profile Builders** (~40 lines, Section19.js)
- Rename `solveGable2DProfile()` to `buildGable2DProfile()`
- Rename `solveShed2DProfile()` to `buildShed2DProfile()`
- Remove all solving logic (area, height calculations)
- Keep ONLY node array construction
- Accept pre-calculated `wallHeight` and `roofHeight` parameters
- Follow spec lines 1244-1288

**Phase 4: Update Extrusion Logic** (~30 lines, Section19.js)
- Remove volume-matching logic from `extrudeProfile()`
- Function should just use pre-calculated `span` dimension
- No iteration needed - extrusion depth IS the span
- Simplify to direct node generation

**Phase 5: Testing & Validation**
1. Test flat roof first (roof volume = 0, should work unchanged)
2. Test gable roof at aspect +4.00 (landscape, 5:1 ratio)
3. Test gable roof at aspect -4.00 (portrait, 1:5 ratio)
4. Verify visual proportions match calculated dimensions
5. Verify storey height compresses when roof volume is large
6. Test shed roof at both aspect extremes
7. Check legend shows correct roof volume and wall volume

**File Locations**:
- All changes in: `src/sections/Section19.js`
- Total affected lines: ~900-1000 (main solveGeometry function)
- Rendering unchanged: `src/core/wombatRender.js` (no changes needed)

**Rollback Plan**:
- Git branch: WOMBAT-PRISMATIC (can reset if needed)
- Backup file: Section19.js.backup (original WOMBAT-3)
- Each phase commits separately for granular rollback

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

### Dynamic Ridge Orientation Implementation (2025-12-20)

**STATUS**: ✅ **IMPLEMENTED** - Commit c27b220

**Critical Bug Fix**: The aspect ratio slider was failing at portrait extremes (< -2) due to hardcoded dimension assumptions.

**Root Cause**:
- Profile solvers originally assumed `width` parameter was always SHORT and `length` was always LONG
- When aspect ratio went negative (portrait mode), `width > length`, inverting the dimensions
- Profile solvers received geometrically incorrect dimensions → negative height quadrance → NaN cascade

**Solution Implemented**:
```javascript
// BEFORE calling profile solvers, calculate ridge orientation dynamically
const ridgeLength = Math.min(width, length);  // SHORT dimension (ridge runs across this)
const span = Math.max(width, length);         // LONG dimension (slope runs across this)
const ridgeOrientation = length >= width ? "longitudinal" : "transverse";

// Pass correct dimensions to profile solvers
profile2D = solveGable2DProfile(ridgeLength, roofArea, estimatedWallHeight);
profile2D = solveShed2DProfile(ridgeLength, roofArea, span, estimatedWallHeight);
```

**Key Changes**:
1. Ridge orientation calculated BEFORE profile solving (Section19.js:956-962)
2. Profile solvers receive `ridgeLength` and `span` (not raw `width`/`length`)
3. Ridge automatically swaps: "longitudinal" (ridge along length) ↔ "transverse" (ridge along width)
4. Works correctly across full aspect ratio range: -4.0 to +4.0
5. Footprint dimensions (h_155, h_157) now update correctly on aspect ratio changes

**Structural Convention Maintained**:
- Ridge ALWAYS on SHORT dimension (structural efficiency)
- Slope ALWAYS across LONG dimension (minimizes structural span)
- Roof geometry remains valid in both landscape and portrait modes

**Testing Requirements**:
- Test aspect ratio slider across full range: -4, -2, -1, 0, +1, +2, +4
- Verify h_155 (width) and h_157 (length) display updates when slider moves
- Verify no NaN errors in console at extreme portrait values
- Verify ridge orientation swaps correctly at aspect ratio = 0 crossing

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

16. **Fix aspect ratio NaN bug** - Debug d_154 state sync issue (current blocker)
17. **Test aspect ratio impact** - Verify shed roof height reduces with landscape aspect ratio
18. **Implement stories dropdown handler** - Wire d_150 changes to recalculate geometry
19. **Volume iteration** - Refine wall height calculation to exactly match volume constraint
20. **Area constraints** - Iterate to satisfy roof area (d_85) exactly
21. **Wall area calculations** - Implement prismatic wall area formulas and display
22. **Multi-storey rendering** - Add horizontal floor plane lines to visualization (see spec below)
23. **Test and merge** - Comprehensive testing, then merge to main
24. **Future enhancements** - Hip roof, pyramidal, basement support

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
- **Aspect ratio NaN bug**: d_154 state sync issue causing rendering errors (BLOCKER - see debug section below)
- **Wall areas not calculated**: Prismatic formulas designed but not implemented yet
- **No multi-storey visualization yet**: Stories dropdown works but doesn't draw floor planes (see implementation spec below)

---

## Multi-Storey Implementation Specification

### Overview

The stories dropdown (d_150) is already wired to recalculate geometry, but the visualization doesn't show horizontal floor planes. This section documents how to add multi-storey rendering based on the backup file implementation.

### Current State (WOMBAT 4 Prismatic)

**What Works:**
- ✅ Stories dropdown (d_150) mirrors S12 d_103 via TargetState/ReferenceState
- ✅ FieldManager routes dropdown changes through ModeManager.setValue()
- ✅ ModeManager.setValue() publishes to StateManager and calls calculateAll()
- ✅ Storey height calculated: `wallHeight / storiesDeclared` (Section19.js:line ~1542 in backup)
- ✅ Geometry object includes `stories` and `storyHeight` properties

**What's Missing:**
- ❌ Horizontal floor plane lines not rendered in 3D visualization
- ❌ No visual indication of multiple storeys (1.5, 2, 3+ storeys look identical)
- ❌ Legend doesn't show storey-by-storey breakdown

### Implementation Pattern (from Section19.js.backup)

**Data Flow:**
1. User changes d_150 dropdown (1 → 1.5 → 2 → 3, etc.)
2. FieldManager routes to `ModeManager.setValue("d_150", value, "user-modified")` (backup:line ~2043-2045)
3. ModeManager publishes to StateManager → triggers calculateAll()
4. solveGeometry() reads `storiesDeclared = parseFloat(currentState.getValue("d_150"))` (backup:line 1073)
5. Wall height calculated: `wallHeight = (volume - roofVolume) / footprintArea` (sacrificial to volume)
6. **Storey height derived**: `storyHeight = wallHeight / storiesDeclared` (backup:line 1542)
7. Geometry returned with `{ stories: storiesDeclared, storyHeight: storyHeight }` (backup:line 1596-1597)
8. **Renderer draws floor planes** at intervals of `storyHeight` (MISSING IN WOMBAT 4)

### Rendering Multi-Storey Floor Planes

**Concept:**
For a 3-storey building with `storyHeight = 3.0m`, draw horizontal lines at:
- Z = 0m (ground level)
- Z = 3m (storey 1 ceiling / storey 2 floor)
- Z = 6m (storey 2 ceiling / storey 3 floor)
- Z = 9m (storey 3 ceiling / eave line)
- Z = 9m + roofHeight (ridge/peak)

**Implementation Location:**
`src/core/wombatRender.js` - Add floor plane rendering after eave lines, before roof planes

**Implementation (Updated 2025-12-21):**
```javascript
/**
 * Render horizontal floor planes for multi-storey buildings
 * Shows intermediate floor levels as gray hairlines
 *
 * @param {SVGElement} svg - SVG container
 * @param {Object} geometry - Geometry object with stories, storyHeight
 * @param {Object} nodes3D - 3D nodes with ground corner positions
 * @param {number} scale - Isometric scale factor
 * @param {number} centerX - Canvas center X
 * @param {number} centerY - Canvas center Y
 */
function renderFloorPlanes(svg, geometry, nodes3D, scale, centerX, centerY) {
  const stories = geometry.stories || 1;
  const storyHeight = geometry.storyHeight || geometry.height;

  if (stories <= 1) {
    return; // No intermediate floors for single-storey
  }

  // Draw horizontal floor planes at each storey boundary
  // Iterate from 1 to stories-1 (intermediate floors only, not ground or eave)
  for (let i = 1; i < stories; i++) {
    const floorZ = i * storyHeight;

    // Create 4 corner points at this floor level
    // Use ground footprint corners, just elevated to floor height
    const floorCorners = [
      { x: nodes3D.ground[0].x, y: nodes3D.ground[0].y, z: floorZ },
      { x: nodes3D.ground[1].x, y: nodes3D.ground[1].y, z: floorZ },
      { x: nodes3D.ground[2].x, y: nodes3D.ground[2].y, z: floorZ },
      { x: nodes3D.ground[3].x, y: nodes3D.ground[3].y, z: floorZ },
    ];

    // Draw floor plane as rectangular perimeter (4 edges)
    for (let j = 0; j < 4; j++) {
      const p1 = toIsometric(floorCorners[j].x, floorCorners[j].y, floorCorners[j].z, scale, centerX, centerY);
      const p2 = toIsometric(floorCorners[(j + 1) % 4].x, floorCorners[(j + 1) % 4].y, floorCorners[(j + 1) % 4].z, scale, centerX, centerY);

      // Gray hairline (solid, thin, low opacity)
      const line = createLine(p1, p2, "#999999", 0.5);
      line.setAttribute("opacity", "0.4");
      svg.appendChild(line);
    }

    // Add corner nodes at each floor level
    for (let j = 0; j < 4; j++) {
      const pt = toIsometric(floorCorners[j].x, floorCorners[j].y, floorCorners[j].z, scale, centerX, centerY);
      const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      node.setAttribute("cx", pt.x);
      node.setAttribute("cy", pt.y);
      node.setAttribute("r", 2); // Smaller than structural nodes
      node.setAttribute("fill", "#999999");
      node.setAttribute("opacity", "0.4");
      svg.appendChild(node);
    }
  }
}
```

**Integration into render():**
```javascript
// In wombatRender.js render() function, after drawing vertical edges:

// Draw vertical edges (existing code)
drawVerticalEdges(svg, nodes3D, ...);

// NEW: Draw intermediate floor planes for multi-storey buildings
renderFloorPlanes(svg, geometry, nodes3D, scale, centerX, centerY);

// Draw eave lines (existing code)
drawEaveLines(svg, nodes3D, ...);
```

### Fractional Stories Handling

**Mezzanine Option** (d_158 = "mezzanine"):
- 1.5 storeys = 1 full floor + mezzanine (partial floor, smaller area)
- Render mezzanine as dashed outline at `1.0 × storyHeight`
- Mezzanine area calculated: `conditionedArea - footprintArea - (fullStories × footprintArea)` (backup:line 1153-1156)
- Visual: Smaller rectangle inset from building perimeter

**Equal Floorplates Option** (d_158 = "equal"):
- 1.5 storeys = equal distribution of conditioned area across 1.5 levels
- No mezzanine - just taller storey height
- Render as uniform floor plane at `1.0 × storyHeight`

**Implementation Notes:**
- Read `floorplateOption = currentState.getValue("d_158")` in renderer
- If `mezzanine` AND `stories` is fractional → draw partial floor
- Mezzanine dimensions: Calculate from `mezzanineArea` in geometry object

### Validation & Testing

**Test Cases:**
1. **1 storey**: No floor planes (ground + eave only)
2. **1.5 storeys (mezzanine)**: 1 dashed partial floor plane at Z = storyHeight
3. **2 storeys**: 1 solid floor plane at Z = storyHeight
4. **3 storeys**: 2 solid floor planes at Z = storyHeight, Z = 2×storyHeight
5. **6 storeys**: 5 solid floor planes (max dropdown value)

**Expected Behavior:**
- Dropdown change 1→2 → floor plane appears at mid-height
- Dropdown change 2→1 → floor plane disappears
- Volume stays constant → building gets taller or shorter (storey height sacrificial)
- Roof height stays constant → wall height flexes to accommodate stories

### Known Issues from Backup

**Volume vs. Height Conflict:**
- If user sets `d_105 = 8000m³`, `d_95 = 1000m²`, `d_150 = 3 storeys`
- Implied wall height = 8000 / 1000 = 8m total → 2.67m per storey (low!)
- If g_106 = 3.5m → intended = 3 × 3.5 = 10.5m → volume deficit
- Backup handled this with "pancake" warning (backup:line 1348-1377)
- **Solution**: Show constraint violation in legend (e.g., "⚠️ Volume too low for realistic storey heights")

### Implementation Checklist

- [ ] Add `renderFloorPlanes()` function to wombatRender.js
- [ ] Call `renderFloorPlanes()` after vertical edges, before eave lines
- [ ] Pass `geometry.stories` and `geometry.storyHeight` to renderer
- [ ] Handle fractional stories (1.5) with mezzanine option check
- [ ] Add "STOREY X" labels to floor planes (optional)
- [ ] Add legend entry: "Storey Height: X.XXm (sacrificial to volume)"
- [ ] Test with 1, 1.5, 2, 3, 6 storeys
- [ ] Verify volume stays constant as stories change
- [ ] Verify roof height independent of stories count

---

## Current Blocker: Aspect Ratio NaN Bug

### Symptoms:
- Moving aspect ratio slider (d_154) causes NaN errors in wombatRender.js
- Lines and circles render with NaN coordinates
- No WOMBAT-2 DEBUG output in console (code not running)

### Hypothesis:
`currentState.getValue("d_154")` on Section19.js:917 returns invalid value because:
1. ModeManager.setValue() publishes to StateManager but doesn't update TargetState.values["d_154"]
2. TargetState.getValue() reads stale/null value
3. `parseFloat(null)` → NaN
4. `width = sqrt(area / NaN)` → NaN
5. Cascade failure in geometry calculations

### Debug Strategy:
1. Check ModeManager.setValue() implementation (Section19.js:~268-281)
2. Verify it calls `currentState.setValue(fieldId, value)` BEFORE publishing to StateManager
3. Add breakpoint at line 917 to inspect d_154_raw value
4. Trace why debug logs aren't appearing (code path not executing?)

### Fix Approach:
Ensure ModeManager.setValue() updates local state FIRST:
```javascript
setValue: function (fieldId, value, source = "user-modified") {
  const currentState = this.currentMode === "target" ? TargetState : ReferenceState;

  // ✅ UPDATE LOCAL STATE FIRST (critical!)
  currentState.setValue(fieldId, value);

  // ✅ THEN publish to StateManager
  if (this.currentMode === "target") {
    window.TEUI.StateManager.setValue(fieldId, value, source);
  } else {
    window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, source);
  }
}
```

---

## Implementation Status (2025-12-20)

### ✅ Completed

1. **Shed Roof Orientation Fix** - Ridge now runs along LONG dimension, slope drops across SHORT dimension for structural efficiency
2. **Gable Roof Orientation Fix** - Ridge parallel to long walls, triangle base = SHORT dimension, roof area satisfied correctly
3. **Volume Constraint Logic** - Changed from volume-driven to g_106-driven with compression when exceeded, eliminates negative wall heights
4. **Roof Area Satisfaction** - Both gable and shed roofs now correctly satisfy d_85 constraint exactly
5. **Nomenclature Refactoring** - Eliminated confusing `ridgeLength`/`span` parameter swaps throughout Section19.js:
   - All roof solver functions now use clear `shortDimension`/`longDimension` parameters
   - Removed internal parameter swap logic
   - Added self-documenting local variable names (`triangleBase`, `slopeSpan`, etc.)
   - Removed obsolete `extrudeProfile()` function
   - Updated profile building and extrusion depth logic
6. **Documentation** - Created [PRISMATIC-TERMINOLOGY.md](PRISMATIC-TERMINOLOGY.md) with rational trigonometry notation, coordinate conventions, and variable naming guide

### ⬜ Remaining Work

1. **Visual Aids Needed**:
   - X-Y-Z coordinate system key graphic (reference old backup files)
   - Dimension labels showing X, Y, and Height axes
   - Isometric view showing coordinate orientation

2. **Hip Roof Solver** (Tomorrow):
   - Implement hip roof geometry using same prismatic extrusion pattern
   - Ridge runs parallel to LONG dimension (same as gable/shed)
   - Four triangular faces at corners, two trapezoidal faces on sides
   - Maintain consistent constraint hierarchy (footprint → roof area → volume)

3. **Runtime Testing**:
   - Verify gable/shed roof orientations at various aspect ratios
   - Test multi-storey buildings
   - Verify volume compression logic with extreme roof areas

4. **Code Quality**:
   - Verify wombatRender.js coordinate system matches documentation
   - Consider spread-based roof pitch display (rational trig)
   - Add geometric feasibility validation before rendering

### Testing Results

- ✅ Linter check passed (no syntax errors)
- ✅ Quick runtime test passed (user verified)
- ⬜ Comprehensive testing pending

### Git Status

- **Branch**: WOMBAT-PRISMATIC (pushed to origin)
- **Commits**: 32 commits ahead of main
- **Latest commit**: af66e97 "Refactor: Eliminate confusing ridgeLength/span parameter swaps"

---

**Document Status**: ACTIVE - Implementation in progress
**Author**: Claude + Andy
**Date**: 2025-12-19 (Created), 2025-12-20 (Updated with implementation status)
**Branch**: WOMBAT-PRISMATIC
**Next Session**: Implement hip roof solver and add coordinate system graphics
