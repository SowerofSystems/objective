# WOMBAT Prismatic Extrusion - Terminology & Implementation
## Date: 2025-12-20
## Status: IMPLEMENTATION COMPLETE

---

## Core Concept: Prismatic Extrusion

A **prismatic extrusion** sweeps a 2D profile along an axis to generate a 3D form:

```
2D PROFILE (cross-section)    EXTRUDE ALONG AXIS    3D SOLID
      /\                            ══════>           ________
     /  \                                            /\      /\
    /____\                                          /  \    /  \
                                                   /____\  /____\
```

The profile defines the **cross-sectional shape**, and extrusion creates depth.

---

## Terminology & Notation

### Rational Trigonometry (Wildberger)

Following N.J. Wildberger's rational trigonometry notation:

- **Q (Quadrance)**: Square of a distance, `Q = distance²`
  - Avoids square roots until final value needed
  - Example: `Q_width = width²` instead of `distance = √value`

- **s (Spread)**: Ratio of quadrances, `s = Q/R`
  - Replaces traditional angles
  - Example: `s = 36/100 = 0.36` (from diagram)

- **R**: Quadrance of slope/hypotenuse
  - In roof geometry: `R = slopeLength²`
  - Example: `R = 100` (from diagram: slope² = 100)

### Building Geometry Terms

**Footprint Dimensions:**
- `footprintArea`: Total ground area (d_95, SACRED)
- `width`: SHORT dimension of footprint
- `length`: LONG dimension of footprint
- `aspectRatio`: length/width (from d_154 slider)

**Orientation:**
- `ridgeLength`: Dimension parallel to ridge line
  - Gable: LONG dimension (ridge runs parallel to long walls)
  - Shed: LONG dimension (ridge at one end)
- `span`: Dimension perpendicular to ridge
  - Gable: SHORT dimension (triangle base)
  - Shed: SHORT dimension (slope drop direction)

**Profile vs Extrusion:**
- `profile.width`: Width of 2D cross-section
  - Gable: SHORT (triangle base, perpendicular to ridge)
  - Shed: LONG (trapezoid face, parallel to ridge)
- `extrusionDepth`: Distance to sweep profile
  - Gable: LONG (parallel to ridge)
  - Shed: SHORT (perpendicular to ridge)

---

## Implementation Details

### Gable Roof Geometry

**Ridge Orientation**: Parallel to LONG walls

**2D Profile (cross-section perpendicular to ridge):**
```
      /\          ← Peak at center
     /  \
    /____\        ← Triangle base = SHORT dimension
    width = SHORT = ridgeLength (confusing naming!)
```

**Rational Trig Calculation:**
```javascript
// Roof area constraint
const roofArea = d_85;  // SACRED (e.g., 1411.52 m²)

// Dimensions (SWAPPED from parameter names!)
const actualRidgeLength = span;      // LONG (74.19m)
const actualSpan = ridgeLength;      // SHORT (20.19m)

// Area = 2 slopes × (ridge × slopeLength)
// Each slope is a rectangle: ridge × slopeLength
const slopeLength = roofArea / (2 * actualRidgeLength);

// Pythagorean using Quadrance (Q)
// R = Q_slope = slopeLength²
const R = slopeLength * slopeLength;

// Triangle base = SHORT dimension, half-width from center
const Q_halfBase = (actualSpan * actualSpan) / 4;

// Q_height = R - Q_base (Pythagorean theorem in Q-space)
const Q_height = R - Q_halfBase;

// Final height (expand irrational only when needed)
const roofHeight = Math.sqrt(Q_height);
```

**3D Extrusion:**
```javascript
profile.width = ridgeLength;  // SHORT (20.19m) - triangle base
extrusionDepth = span;         // LONG (74.19m) - ridge direction
```

**Result**: Ridge runs 74.19m parallel to long walls ✓

---

### Shed Roof Geometry

**Ridge Orientation**: At one END of building (perpendicular to length)

**2D Profile (face parallel to ridge):**
```
    ________      ← High ridge
   /
  /
 /___________    ← Low eave
 width = LONG = span
```

**Rational Trig Calculation:**
```javascript
// Dimensions (SWAPPED from parameter names!)
const actualRidgeLength = span;      // LONG (74.19m)
const actualSpan = ridgeLength;      // SHORT (20.19m)

// Area = ridge × slopeLength (one rectangular slope)
const slopeLength = roofArea / actualRidgeLength;

// Pythagorean using Quadrance
const R = slopeLength * slopeLength;
const Q_span = actualSpan * actualSpan;
const Q_height = R - Q_span;
const roofHeight = Math.sqrt(Q_height);
```

**3D Extrusion:**
```javascript
profile.width = span;          // LONG (74.19m) - ridge runs across this
extrusionDepth = ridgeLength;  // SHORT (20.19m) - perpendicular to ridge
```

**Result**: Ridge runs 74.19m at building end ✓

---

## The Confusing Parameter Names (Legacy Issue)

**Historical naming confusion:**
```javascript
function solveGableRoof(roofArea, ridgeLength, span, footprintArea) {
  // INCOMING PARAMETERS:
  // ridgeLength = min(width, length) = SHORT
  // span = max(width, length) = LONG

  // BUT FOR GABLE, WE NEED:
  // Ridge should be LONG
  // Span should be SHORT

  // SO WE SWAP:
  const actualRidgeLength = span;      // LONG (what ridge should be)
  const actualSpan = ridgeLength;      // SHORT (what span should be)
}
```

This naming issue arose because the parameters were initially designed for shed roofs, where:
- Ridge is at the end (could be short or long depending on orientation)
- Span is the distance the slope travels

For gable roofs, the architectural convention differs:
- Ridge runs parallel to long walls (LONG dimension)
- Span is perpendicular to ridge (SHORT dimension)

**TODO (future refactor)**: Rename parameters to be roof-type agnostic:
- `dimension1` and `dimension2` instead of `ridgeLength` and `span`
- Or pass `{width, length}` object and let each roof type decide orientation

---

## Constraint Hierarchy (As Implemented)

### SACRED Constraints (always satisfied):
1. **Footprint Area (d_95)** → determines width × length
2. **Roof Area (d_85)** → determines roof height via rational trig
3. **Aspect Ratio (d_154)** → reshapes footprint maintaining area

### ATTEMPTED Constraints (compressed if needed):
4. **Wall Height (g_106 × stories)** → starting point, may compress
5. **Volume (d_105)** → calculated and compared, may violate

### Volume Resolution Logic:
```javascript
// Start with reference wall height
wallHeightTarget = g_106 × stories;

// Calculate resulting volume
calculatedVolume = wallVolume + roofVolume;

// If exceeds target:
if (calculatedVolume > targetVolume) {
  // Compress walls to fit
  wallHeight = (targetVolume - roofVolume) / footprintArea;
  // Flag violation
  wallHeightViolation = true;
}

// If roof alone exceeds total:
if (roofVolume > targetVolume) {
  // Use reference height anyway (surface area priority)
  wallHeight = wallHeightTarget;
  // Flag critical violation
  console.error("Roof volume exceeds total volume");
}
```

---

## Rational Trigonometry Best Practices

### Defer Square Roots

**Good** (defer expansion):
```javascript
const R = slopeLength * slopeLength;      // Quadrance
const Q_base = (span * span) / 4;         // Quadrance
const Q_height = R - Q_base;              // Arithmetic in Q-space
const height = Math.sqrt(Q_height);       // Expand only at end
```

**Avoid** (premature expansion):
```javascript
const slope = Math.sqrt(someValue);       // Too early!
const result = slope * slope;             // Wasted sqrt then square
```

### Use Ratios

**Good** (work with ratios):
```javascript
const s = Q_base / R;                     // Spread (ratio)
// Calculations with s remain rational
```

**Avoid** (trigonometric functions):
```javascript
const angle = Math.atan2(rise, run);      // Introduces irrationals
const slope = Math.tan(angle);            // Compounds errors
```

---

## Glossary of Current Variable Names

| Variable | Meaning | Typical Value |
|----------|---------|---------------|
| `width` | SHORT footprint dimension | 20.19m |
| `length` | LONG footprint dimension | 54.52m |
| `ridgeLength` | min(width, length) | 20.19m (SHORT) |
| `span` | max(width, length) | 54.52m (LONG) |
| `actualRidgeLength` | SWAPPED for gable/shed | 54.52m (LONG) |
| `actualSpan` | SWAPPED for gable/shed | 20.19m (SHORT) |
| `slopeLength` | Roof slope distance | 9.51m (gable example) |
| `roofHeight` | Vertical rise | 5.61m (gable example) |
| `profile.width` | 2D profile width | Gable: 20.19m, Shed: 54.52m |
| `extrusionDepth` | 3D sweep distance | Gable: 54.52m, Shed: 20.19m |

---

## Implementation Status

### ✅ Completed (2025-12-20)

1. **Refactor parameter names** to eliminate swap confusion
   - All `ridgeLength`/`span` → `shortDimension`/`longDimension` changes complete
   - Functions: `solveGableRoof()`, `solveShedRoof()`, main solver, profile building
   - No more internal parameter swapping required

### ⬜ Pending (Future Work)

2. **Implement full rational trig** using `s` (spread) consistently
   - Current code still uses direct quadrance calculations
   - Need to refactor to work with spread ratios throughout
   - Would eliminate premature square root operations

3. **Add spread-based roof pitch display** instead of degrees
   - Currently no pitch display at all
   - Future: Show `s = 0.36` instead of "33.7°"

4. **Optimize calculations** to minimize square root operations
   - Related to #2 - defer `Math.sqrt()` until final value needed
   - Keep intermediate values in quadrance (Q) space

5. **Add validation** for geometric feasibility before rendering
   - Check if roof area constraints are physically possible
   - Warn user before attempting to render impossible geometry
   - Auto-collapse to flat roof when constraints conflict

---

## Code Locations Refactored (COMPLETED 2025-12-20)

**Status**: ✅ Nomenclature refactoring COMPLETE

All confusing `ridgeLength`/`span` parameters have been replaced with clear `shortDimension`/`longDimension` naming.

### Section19.js - Completed Changes

#### ✅ Line 770-825: `solveGableRoof()`
**Refactored**:
```javascript
function solveGableRoof(roofArea, shortDimension, longDimension, footprintArea) {
  // Clear, no swap needed:
  const ridgeLength = longDimension;      // Ridge parallel to long walls
  const triangleBase = shortDimension;    // Perpendicular to ridge
}
```

#### ✅ Line 831-888: `solveShedRoof()`
**Refactored**:
```javascript
function solveShedRoof(roofArea, shortDimension, longDimension, footprintArea) {
  const ridgeLength = longDimension;      // Ridge at end
  const slopeSpan = shortDimension;       // Slope drops across this
}
```

#### ✅ Line 1128-1146: Main Variable Declarations
**Refactored**:
```javascript
const shortDimension = Math.min(width, length);  // SHORT footprint edge
const longDimension = Math.max(width, length);   // LONG footprint edge

const roofResult = solveRoofGeometry(
  roofType,
  roofArea,
  footprintArea,
  shortDimension,
  longDimension
);
```

#### ✅ Line 1222-1237: Profile Building
**Refactored**:
```javascript
if (roofResult.roofType === "gable") {
  profile2D = buildGable2DProfile(shortDimension, wallHeight, roofResult.roofHeight);
} else if (roofResult.roofType === "shed") {
  profile2D = buildShed2DProfile(longDimension, wallHeight, roofResult.roofHeight);
} else {
  profile2D = solveFlat2DProfile(shortDimension, wallHeight);
}
```

#### ✅ Line 1244-1254: Extrusion Depth
**Refactored**:
```javascript
let extrusionDepth;
if (roofResult.roofType === "shed") {
  extrusionDepth = shortDimension;  // Shed: extrude short
} else {
  extrusionDepth = longDimension;   // Gable/Flat: extrude long
}
```

#### ✅ Removed Obsolete Function
**Line 970**: Removed `extrudeProfile()` function (no longer needed - using footprint dimensions directly)

---

### wombatRender.js

**TODO**: Verify if wombatRender.js uses X/Y coordinate naming that conflicts with width/length

**Check these functions**:
- `toIsometric()` - Line ~36
- `generate3DNodes()` - Should receive clear dimension names
- Any hardcoded assumptions about X=width, Y=length

---

## Coordinate System Conventions

**Recommended standard** (to implement throughout):

```javascript
// Footprint in plan view (looking down, Z-up):
//
//        Y (North)
//        ^
//        |
//        |
//        +-------> X (East)
//
// width = X dimension (East-West)
// length = Y dimension (North-South)
// height/Z = vertical (Up)

// For landscape buildings (length > width):
// - X: SHORT dimension (width)
// - Y: LONG dimension (length)
// - Gable ridge runs parallel to Y axis (long walls)

// For portrait buildings (width > length):
// - X: LONG dimension (width)
// - Y: SHORT dimension (length)
// - Gable ridge runs parallel to X axis (long walls)
```

**Key principle**: Ridge runs parallel to LONGEST dimension, regardless of whether that's X or Y.

---

## Variable Naming Guide for Future Agents

When working on roof geometry, **use these names**:

| Use This | Not This | Meaning |
|----------|----------|---------|
| `shortDimension` | `ridgeLength` | Shorter footprint edge |
| `longDimension` | `span` | Longer footprint edge |
| `roofHeight` | `height` | Vertical roof rise |
| `slopeLength` | `R` (alone) | Roof slope distance |
| `Q_base` | `baseSquared` | Quadrance of base |
| `Q_height` | `heightSquared` | Quadrance of height |
| `triangleBase` | `width` (ambiguous) | Gable triangle base |
| `profileWidth` | `width` | 2D profile dimension |
| `extrusionDepth` | `length` | 3D sweep distance |

**When in doubt**: Be explicit! `gableTriangleBase` is better than `base`.

---

## Refactoring Session Summary (2025-12-20)

### What Was Changed

Completed systematic nomenclature refactoring to eliminate confusing `ridgeLength`/`span` parameter names throughout [Section19.js](../../../src/sections/Section19.js).

**Problem**: Parameters were named based on shed roof conventions where ridge could be at either end, but this created confusion for gable roofs where ridge conventionally runs along the long dimension. The functions internally "swapped" these parameters, making the code difficult to understand.

**Solution**: Renamed parameters to dimension-agnostic names that clearly indicate size:
- `ridgeLength` → `shortDimension`
- `span` → `longDimension`

Then each roof type assigns these to appropriate local variables:
- **Gable**: `ridgeLength = longDimension`, `triangleBase = shortDimension`
- **Shed**: `ridgeLength = longDimension`, `slopeSpan = shortDimension`

### Files Modified

1. **[Section19.js](../../../src/sections/Section19.js)**:
   - Lines 770-830: `solveGableRoof()` - Changed signature and removed swap logic
   - Lines 831-895: `solveShedRoof()` - Changed signature and removed swap logic
   - Lines 1128-1146: Main variable declarations and `solveRoofGeometry()` call
   - Lines 1222-1237: Profile building calls
   - Lines 1244-1254: Extrusion depth logic
   - Line 1257: Console logging
   - Removed obsolete `extrudeProfile()` function (line 970)

2. **[PRISMATIC-TERMINOLOGY.md](PRISMATIC-TERMINOLOGY.md)** (this file):
   - Updated "Code Locations Requiring Refactoring" section to show completed status
   - Added this summary section

### Testing Status

- ✅ Linter check passed (no syntax errors introduced)
- ✅ Quick runtime test passed (user verified basic rendering works)
- ⬜ Comprehensive testing pending (gable/shed roof orientations at various aspect ratios)
- ⬜ Multi-storey building testing
- ⬜ Edge case testing (extreme roof areas, volume conflicts)

### Benefits

1. **Code Clarity**: No more internal parameter swapping - what comes in is what's used
2. **Future-Proof**: Next developer won't need to understand the swap pattern
3. **Self-Documenting**: Variable names like `triangleBase` and `slopeSpan` are explicit
4. **Consistent**: All roof solvers use same parameter naming convention

### Next Steps (Future Work)

1. Verify wombatRender.js coordinate system matches documentation
2. Consider implementing spread-based roof pitch display (rational trig)
3. Add geometric feasibility validation before rendering
4. Optimize to minimize square root operations further

---

## Canvas Scaling and Viewport Optimization (TODO)

### Problem Statement

The SVG canvas is currently fixed at 900×600px with static scaling that creates excessive whitespace for smaller buildings while potentially clipping larger ones.

**Current Issues**:
- Fixed canvas size wastes vertical space for short buildings (e.g., 2.49m building height in flat roof example)
- Legend positioned at top (y=14, y=32, y=50) but geometry is centered, leaving large gaps
- No dynamic scaling based on actual building dimensions
- Isometric projection scale is hardcoded, not responsive to geometry bounds

### Observed Symptoms

From user screenshot (flat roof, 6 storeys, 23.15m × 23.15m × 2.49m):
- Legend block starts at top (~y=14)
- Building geometry starts around y=100-150 (large whitespace gap)
- Building occupies small portion of canvas vertically
- Most canvas area is empty space above/below geometry

### Proposed Solutions

#### Option A: Dynamic Vertical Scaling (Recommended)
Adjust the canvas viewBox or scale factor based on building height to fill available space efficiently.

**Implementation approach**:
1. Calculate geometry bounding box (min/max X, Y, Z after isometric projection)
2. Add padding buffer (e.g., 10% margins)
3. Scale to fit canvas height optimally
4. Shift geometry vertically to minimize top whitespace while leaving room for legend

**Pros**:
- Efficient use of canvas for all building sizes
- Legend stays at top, geometry scales below
- Automatic adaptation to tall/short buildings

**Cons**:
- Need to calculate bounds before rendering
- May make comparison between different geometries harder (non-uniform scaling)

#### Option B: Variable Canvas Height
Change canvas from fixed 600px height to dynamic based on geometry.

**Implementation approach**:
1. Calculate required height from geometry bounds
2. Set minimum height (e.g., 400px) for very short buildings
3. Set maximum height (e.g., 800px) to prevent excessive scroll
4. Adjust canvas height attribute dynamically

**Pros**:
- Consistent scale across different buildings
- Better for visual comparison
- Simpler than recalculating scale

**Cons**:
- May cause layout reflow
- Table and canvas won't always align in height
- Requires container layout changes

#### Option C: Smart Centering with Legend Offset
Keep canvas size fixed, but center geometry accounting for legend block at top.

**Implementation approach**:
1. Calculate center point excluding legend area (y > 70)
2. Center geometry in remaining vertical space (y: 70-600)
3. Scale to fit that reduced area

**Pros**:
- Simple implementation
- Legend stays clean at top
- No layout changes

**Cons**:
- Still wastes space for short buildings
- Doesn't fully solve the problem

#### Option D: Collapsible Legend / Overlay
Move detailed metrics to a collapsible panel or tooltip overlay, freeing canvas space.

**Implementation approach**:
1. Show minimal info at top (title + dimensions only)
2. Move detailed metrics (areas, volumes) to:
   - Tooltip on hover over building
   - Collapsible panel beside canvas
   - Info button that shows modal
3. Use reclaimed vertical space for geometry

**Pros**:
- Maximum space for geometry
- Cleaner visual presentation
- Legend details still accessible

**Cons**:
- Requires new UI components
- Info less immediately visible
- More clicks for user

### Recommended Implementation Plan

**Phase 1**: Option A (Dynamic Vertical Scaling)
- Calculate geometry bounds in `wombatRender.js`
- Add `calculateGeometryBounds(nodes3D)` function
- Adjust scale factor: `scale = (canvasHeight - legendHeight - padding) / geometryHeight`
- Center geometry in remaining space

**Phase 2** (Optional): Option D elements
- Move verbose metrics to hover tooltips
- Keep essential info (title, dimensions, roof type) at top
- Consider SVG `<title>` elements on geometry nodes for accessibility

### Technical Considerations

**Isometric Projection**:
- Current scale factor affects all axes equally
- Z-axis compression in isometric: `z * sin(30°) = z * 0.5`
- May need separate horizontal/vertical scale factors

**Legend Height Calculation**:
```javascript
// Current legend occupies approximately:
// - Title: y=14 (14px font)
// - Dimensions: y=32 (12px font)
// - Metrics start: y=50
// - Each metric line: 18px (lineHeight)
// - ~8 metric lines = 144px
// Total legend height: ~194px

const legendHeight = 50 + (metricCount * 18);
const availableGeometryHeight = canvasHeight - legendHeight - padding;
```

**Bounding Box Calculation**:
```javascript
function calculateGeometryBounds(nodes3D) {
  const allPoints = [
    ...nodes3D.ground,
    ...nodes3D.eave,
    ...(nodes3D.ridge || [])
  ].map(node => toIsometric(node.x, node.y, node.z, scale, 0, 0));

  return {
    minX: Math.min(...allPoints.map(p => p.x)),
    maxX: Math.max(...allPoints.map(p => p.x)),
    minY: Math.min(...allPoints.map(p => p.y)),
    maxY: Math.max(...allPoints.map(p => p.y))
  };
}
```

### Testing Checklist

When implementing:
- [ ] Test with flat roof (minimal height)
- [ ] Test with tall gable (maximum height)
- [ ] Test with multi-storey (6+ storeys)
- [ ] Test with extreme aspect ratios (±5.0)
- [ ] Verify legend doesn't overlap geometry
- [ ] Check coordinate axes still visible at bottom-right
- [ ] Ensure responsive behavior on window resize

---

## References

- N.J. Wildberger: "Divine Proportions: Rational Trigonometry to Universal Geometry"
- ArchiCad GDL: Prismatic extrusion concept
- Current implementation: Section19.js (solveGableRoof, solveShedRoof)
- File: [/src/sections/Section19.js](../../../src/sections/Section19.js) (lines 770-1254)
- File: `/src/core/wombatRender.js` (coordinate system)
