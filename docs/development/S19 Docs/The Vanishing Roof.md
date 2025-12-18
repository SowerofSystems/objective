# The Vanishing Roof 🏔️→💨

**Date**: 2025-12-16
**Issue**: Pyramidal roofs collapse/vanish on rectangular buildings; monopitch/shed roofs not implemented
**Status**: 🔍 INVESTIGATING

---

## The Mystery

We have TWO related roof rendering problems:

### Problem 1: Pyramidal Roofs Vanish on Rectangles
**Observed Behavior:**
- ✅ Pyramidal roofs work perfectly on **square** buildings (aspect ratio ≈ 0.0)
- ✅ Pyramidal roofs work on **slightly rectangular** buildings (aspect ratio = 0.1)
- ❌ Pyramidal roofs **vanish** on **moderately rectangular** buildings (aspect ratio ≥ 0.2)

**Example:**
```
Aspect Ratio 0.0 (square):     Roof renders ✅
Aspect Ratio 0.1 (slight):     Roof renders ✅
Aspect Ratio 0.2 (moderate):   Roof VANISHES ❌
Aspect Ratio 0.5+ (wide):      Roof VANISHES ❌
```

### Problem 2: Monopitch/Shed Roofs Not Implemented
**Observed Behavior:**
- User selects "Monoplane" roof type (d_159 = "monoplane")
- Code logs: `'[WOMBAT] Monoplane roof type not yet implemented - using flat roof'`
- Falls back to flat roof (no rendering)

**Code Evidence** (Section19.js:1000-1004):
```javascript
} else {
  // MONOPLANE (shed roof) - future implementation
  console.warn('[WOMBAT] Monoplane roof type not yet implemented - using flat roof');
  roofType = "flat";
  roofHeight = 0;
}
```

**Result**: Monopitch/shed roofs silently fall back to flat roof.

---

## Problem 1: The Pyramidal Roof Collapse (Rectangular Buildings)

### Current Implementation

**Location**: Section19.js:727-763 `pyramidHeightRectangle()`

The code attempts to solve for pyramid height on rectangular bases using this approach:

```javascript
function pyramidHeightRectangle(width, length, areaRatio) {
  const baseArea = width * length;
  const roofArea = areaRatio * baseArea;
  const faceArea = roofArea / 4;  // Assumes 4 equal triangular faces

  // Slant heights from face areas
  const sW = (2 * faceArea) / width;   // Width-face slant height
  const sL = (2 * faceArea) / length;  // Length-face slant height

  // Height quadrance from Pythagorean theorem
  const h2w = sW * sW - (width * width) / 4;
  const h2l = sL * sL - (length * length) / 4;

  // Check for negative quadrance (CRITICAL!)
  if (h2w < 0 || h2l < 0) {
    console.error('[WOMBAT] Invalid pyramid geometry - negative height quadrance');
    return 0;  // ❌ ROOF VANISHES!
  }

  // Use minimum height
  const heightSquared = Math.max(0, Math.min(h2w, h2l));
  return Math.sqrt(heightSquared);
}
```

### The Fundamental Problem: Equal-Area Assumption

**Current Approach**: Assumes 4 equal-area triangular faces
**Reality**: Pyramids over rectangles CAN exist, but faces have UNEQUAL areas

**User's Topological Insight**:
> "Topologically, pyramidal roofs can resolve with unequal triangles, if we consider a point elevated above the centroid of the floorplate (h) and draw vectors from each corner to that point."

**Absolutely correct!** A pyramid (or hip roof) over a rectangle:
- Has ONE apex point at height h above the centroid
- Has 4 triangular faces connecting corners to apex
- **Faces have different areas** (2 short + 2 long)
- **All faces meet at same apex height** (topologically sound!)

### Why Current Math Fails

The code assumes `faceArea = roofArea / 4` (equal division), leading to:

```
For width-face:  face area = (width × slant_W) / 2 = roofArea / 4
For length-face: face area = (length × slant_L) / 2 = roofArea / 4

This forces:  slant_W = (roofArea/4) × 2 / width
              slant_L = (roofArea/4) × 2 / length

Then solves for height from BOTH:
  h²_from_width  = slant_W² - (width/2)²
  h²_from_length = slant_L² - (length/2)²

Problem: These give DIFFERENT heights!
Code takes min(h²_width, h²_length), but for long rectangles, one goes NEGATIVE.
```

**The issue**: Forcing equal areas creates contradictory constraints.

### The Correct Approach: Hip Roof with Unequal Faces

**What SHOULD happen**:

1. Place apex at height `h` above centroid of rectangle
2. Four faces naturally have different areas:
   - 2 "width-faces" (along short dimension)
   - 2 "length-faces" (along long dimension)
3. Total roof area = sum of all 4 faces
4. Solve for `h` that satisfies total area constraint

**Mathematical formulation**:

```javascript
// Apex at (0, 0, h) above centroid of rectangle
// Four corners at: (±width/2, ±length/2, 0)

// Slant heights to apex from edge midpoints:
slant_width  = √[h² + (length/2)²]  // From midpoint of width-edge
slant_length = √[h² + (width/2)²]   // From midpoint of length-edge

// Face areas (4 triangles):
area_width_face  = (width × slant_width) / 2   // × 2 faces
area_length_face = (length × slant_length) / 2 // × 2 faces

// Total roof area:
roofArea = 2 × area_width_face + 2 × area_length_face
         = width × √[h² + (length/2)²] + length × √[h² + (width/2)²]

// Solve for h given roofArea (transcendental equation)
```

**This is NON-LINEAR** → requires numerical solver (Newton's method or binary search).

---

## Problem 2: Monopitch/Shed Roof (Not Implemented)

### Current Status
**Code**: Falls back to flat roof with warning
**Status**: "future implementation" placeholder

### What's Needed

Monopitch (shed) roof geometry:
- Single sloped plane from low edge to high edge
- Roof area determines slope angle
- Need to choose slope direction (N, S, E, W)

**Mathematical approach** (simple!):

```javascript
// For shed roof sloping along length (Y-axis):
// Low edge at z=wallHeight, high edge at z=wallHeight+roofRise

// Roof area = √[(length² + roofRise²)] × width  (rectangular slope)
// Given roofArea, solve for roofRise:

roofRise = √[(roofArea/width)² - length²]
```

**Much simpler than pyramidal!** Just a tilted rectangle.

---

## User's Elegant Solution: Hip Roof as Truncated Gable

**User's insight**:
> "We COULD truncate our gable roof and match the slope that gives us the constraint-fit to our user-provided area (d_85). That would be much more elegant and probably more realistically reflect constructed spaces."

**Brilliant!** This is exactly what a **hip roof** is:
- Start with gable roof (ridge along longer dimension)
- "Truncate" the ridge (shorten it)
- Cap the ends with triangular hip faces
- Result: 2 trapezoidal slopes + 2 triangular hips

### Hip Roof Geometry (Elegant Approach)

```
Ridge length = L_ridge (< building length)
Building: width × length
Ridge runs centered along longer dimension

Components:
- 2 trapezoidal slopes (long sides)
- 2 triangular hip ends (gable ends)
- Total area = constraint from user (d_85)
```

**Advantages over current pyramidal approach**:
1. **Works for ALL aspect ratios** (not just squares)
2. **Realistic** (hip roofs are common in real buildings)
3. **Mathematically clean** (no contradictory constraints)
4. **Graceful transition**: Ridge shortens as aspect ratio increases

### Mathematical Approach

```javascript
// Given: width, length, roofArea (from d_85)
// Find: ridge length and roof height

// For hip roof with ridge along length:
//   ridgeLength = L_r (unknown)
//   roofHeight = h (unknown)

// Geometry:
//   2 trapezoidal slopes: area = [(length + L_r)/2] × slant_width × 2
//   2 triangular hips:    area = [(length - L_r)/2] × slant_length × 2

// Constraint: Total area = roofArea

// Can parameterize by L_r/length ratio, then solve for h
```

**This is the ELEGANT solution!**

---

## Recommended Solutions

### Solution 1A: Hip Roof (Truncated Gable) - **PREFERRED**
**Approach**: Implement true hip roof geometry
**Complexity**: Moderate (non-linear but well-defined)
**Benefit**: Works for all aspect ratios, realistic, elegant

**Implementation**:
```javascript
function calculateHipRoofHeight(width, length, roofArea) {
  // Ridge runs along longer dimension
  const ridgeOrientation = length >= width ? "longitudinal" : "transverse";
  const buildingSpan = Math.min(width, length);
  const buildingRun = Math.max(width, length);

  // Parameterize by ridge ratio: r = ridgeLength / buildingRun
  // For r=1: Full gable (no hips)
  // For r=0: Full pyramid (point apex)
  // For 0 < r < 1: Hip roof

  // Use binary search or Newton's method to find r and h
  // that satisfy: totalArea(r, h) = roofArea

  return solveHipRoofIteratively(buildingSpan, buildingRun, roofArea);
}
```

### Solution 1B: Fix Pyramidal Math (Unequal Faces)
**Approach**: Accept non-equal faces, solve for apex height
**Complexity**: Moderate (transcendental equation)
**Benefit**: True pyramidal roofs for all rectangles

**Implementation**: Use numerical solver for:
```
roofArea = width × √[h² + (length/2)²] + length × √[h² + (width/2)²]
```

### Solution 1C: Validation Warning (Short-term)
**Approach**: Warn user when pyramid fails
**Complexity**: Low (just better error messages)
**Benefit**: User guidance until proper fix implemented

### Solution 2: Implement Monopitch/Shed Roof
**Approach**: Add monoplane geometry calculation and rendering
**Complexity**: Low (simple tilted plane)
**Benefit**: Complete roof type coverage

**Implementation**:
```javascript
function calculateMonopitchHeight(width, length, roofArea, slopeDirection) {
  // Roof slopes along slopeDirection ("N", "S", "E", "W")
  const slopeDimension = (slopeDirection === "N" || slopeDirection === "S") ? length : width;
  const widthDimension = (slopeDirection === "N" || slopeDirection === "S") ? width : length;

  // Sloped rectangle: area = width × √(slopeDim² + rise²)
  const slantLength = roofArea / widthDimension;
  const roofRise = Math.sqrt(slantLength * slantLength - slopeDimension * slopeDimension);

  return roofRise;
}
```

---

## Implementation Priority

### High Priority: Hip Roof (Solution 1A) ⭐
**Why**: Most elegant, realistic, works for all cases

**Steps**:
1. Add `calculateHipRoofHeight()` function (iterative solver)
2. Add `renderHipRoof()` in wombatRender.js
3. Use for "multiplanar" roof type on rectangles (aspect > 0.2)
4. Keep pyramidal for squares (aspect ≤ 0.2)

### Medium Priority: Monopitch/Shed (Solution 2)
**Why**: Completes roof type coverage

**Steps**:
1. Add `calculateMonopitchHeight()` function
2. Add `renderMonopitchRoof()` in wombatRender.js
3. Add slope direction parameter (default: along longer dimension)

### Low Priority: Better Pyramidal Math (Solution 1B)
**Why**: Hip roof covers this use case more realistically

---

## Testing Matrix

### Hip Roof Tests (After Implementation)
| Aspect Ratio | Width | Length | Expected Behavior |
|--------------|-------|--------|-------------------|
| 0.0 (square) | 20m   | 20m    | Ridge = 0 (pyramid) ✅ |
| 0.2 (slight) | 20m   | 24m    | Ridge ~20m (mostly gable) ✅ |
| 0.5 (moderate)| 20m  | 30m    | Ridge ~24m (balanced hip) ✅ |
| 1.0 (2:1)    | 20m   | 40m    | Ridge ~32m (hip roof) ✅ |

### Monopitch Tests (After Implementation)
| Building | Roof Area | Slope Direction | Expected Rise |
|----------|-----------|-----------------|---------------|
| 20×20m   | 450m²     | North           | ~2.7m ✅ |
| 20×40m   | 900m²     | East            | ~4.0m ✅ |

---

## Code Locations

**Pyramidal height calc**: [Section19.js:727-763](../../src/sections/Section19.js#L727-L763)
**Gable height calc**: [Section19.js:785-845](../../src/sections/Section19.js#L785-L845)
**Roof type selection**: [Section19.js:956-1013](../../src/sections/Section19.js#L956-L1013)
**Roof rendering**: [wombatRender.js:1648-1657](../../src/core/wombatRender.js#L1648-L1657)

---

## References

**User Insights**:
- Pyramids CAN resolve topologically with unequal triangles (apex above centroid)
- Hip roof = truncated gable = elegant solution for rectangles
- More realistic for constructed spaces

**Mathematical Background**:
- Hip roof: Gable with shortened ridge + triangular ends
- Transcendental equations require numerical solvers
- Binary search or Newton's method for roof height

**Related Issues**:
- Gable roofs work perfectly (biplanar)
- Basement volume fix (The Great Basement Caper - SOLVED)

---

## Implementation Attempt 1: Iterative Hip Roof Solver (REVERTED)

**Date**: 2025-12-16
**Status**: REVERTED - Abandoned rational trigonometry principles
**Commits**: 51bcd5e, 1e4c191 (reverted back to 8215caa)

### What We Tried
Implemented nested binary search solver for hip roof:
- Searched over ridge ratio space [0, 1] (0=pyramid, 1=gable)
- For each ratio, solved for height that satisfies area constraint
- Used iterative convergence with `Math.sqrt()` on every iteration

### Problems Encountered
1. **Abandoned Rational Trigonometry**: Used `Math.sqrt()` extensively throughout iteration, violating Wildberger's quadrance principle
2. **Geometry Bugs**: Rendering worked for positive aspect ratios but failed for negative (twisted geometry)
3. **Vertex Issues**: Hip rafter calculations had constraint problems causing glitchy appearance

### Why We Reverted
- Violated NJ Wildberger's rational trigonometry approach (work with quadrance, defer sqrt)
- Current pyramidal code beautifully defers sqrt until final step
- Geometry bugs suggest fundamental approach issues

### Lessons Learned
- Must preserve rational trig throughout (quadrance-based calculations)
- User's truncated gable suggestion is more elegant and aligns with rational trig
- Hip roof should build on working gable code, not replace pyramidal math

---

## Next Approach: Truncated Gable (Planned for 2025-12-17)

**Why This Is Better**:
1. **Preserves Rational Trigonometry**: Builds on gable calculation which already uses quadrance properly
2. **Conceptually Simpler**: Start with gable, shorten ridge, solve for truncation that meets area
3. **Uses Working Code**: Leverages existing `calculateGableHeight()` that respects rational trig

**Approach**:
```javascript
// Start with full gable geometry (ridge = building length)
// Parameterize by ridge shortening factor
// Shortened portions become hip slopes with SAME PITCH as gable
// Solve for shortening that achieves target roof area
// All in quadrance space - single sqrt at end
```

**Advantages**:
- All slopes have identical pitch (realistic construction)
- Natural transition: shortening → 0 gives pyramid
- Works with quadrance throughout iteration
- Likely avoids geometry bugs from first attempt

---

## Implementation Attempt 2: Aspect Ratio Alignment Fix (REVERTED)

**Date**: 2025-12-17
**Status**: REVERTED - Wrong problem solved
**Branch**: WOMBAT-HIP (uncommitted changes reverted)

### What We Tried
Fixed aspect ratio orientation mismatch by storing original building dimensions:
- Stored `buildingWidth` and `buildingLength` (original, not swapped) in hipData
- Used absolute values (`spanLength`, `spanWidth`) for geometric calculations
- Updated rendering to use original dimensions from hipData
- Goal: Make ridge stay aligned with building as aspect ratio changes

### What We Observed
**✅ SUCCESS**: Ridge points render in CORRECT positions in 3D space
**❌ FAILURE**: Hip rafters connect to WRONG ridge endpoints

**The Real Problem**: This is a **vector rendering issue**, NOT a calculation issue!

### Visual Analysis
Looking at the screenshot with negative aspect ratio:
- Ridge line endpoints are CORRECTLY positioned (blue dots at right locations)
- Building perimeter is CORRECTLY sized and oriented
- **Hip rafters (from eave corners to ridge) connect to OPPOSITE ridge endpoint**
- Result: Crossed/twisted roof geometry at the point of sliding into negative aspect ratio, positive renders correctly (clockwise vector render flips counterclockwise?)

**Example**:
```
Should be:              Actually renders:
NW corner → Ridge1      NW corner → Ridge2  ❌ (wrong endpoint!)
NE corner → Ridge2      NE corner → Ridge1  ❌ (wrong endpoint!)
```

### Root Cause Analysis
**NOT** an aspect ratio problem
**NOT** a dimension swapping problem
**IS** a **vector connection problem**

The rendering code connects eave corners to ridge endpoints, but when aspect ratio flips:
- The building orientation changes (portrait ↔ landscape)
- The ridge orientation SHOULD change too
- But the eave-to-ridge connections use the WRONG pairing

### Why Coordinates Are Correct But Connections Are Wrong
In `renderHipRoof()` (wombatRender.js ~800-833):
```javascript
// Four eave corners (building perimeter)
const eave1 = { x: -width/2, y: -length/2, z: wallHeight };  // SW
const eave2 = { x:  width/2, y: -length/2, z: wallHeight };  // SE
const eave3 = { x:  width/2, y:  length/2, z: wallHeight };  // NE
const eave4 = { x: -width/2, y:  length/2, z: wallHeight };  // NW

// Ridge endpoints (correct positions)
ridge1 = { x: 0, y: -length/2 + offset, z: wallHeight + roofHeight };
ridge2 = { x: 0, y:  length/2 - offset, z: wallHeight + roofHeight };

// Hip rafters (THIS IS THE PROBLEM!)
svg.appendChild(createLine(r1Pt, e1Pt, ...));  // Ridge1 → SW corner
svg.appendChild(createLine(r1Pt, e2Pt, ...));  // Ridge1 → SE corner
svg.appendChild(createLine(r2Pt, e3Pt, ...));  // Ridge2 → NE corner
svg.appendChild(createLine(r2Pt, e4Pt, ...));  // Ridge2 → NW corner
```

**The Issue**: When aspect ratio is negative (width > length):
- Ridge orientation should swap (longitudinal ↔ transverse)
- The ridge endpoints ARE in correct positions
- But the eave-to-ridge pairings remain HARD-CODED
- Should connect to CLOSEST ridge endpoint, not fixed pairing

### The Elegant Fix (NOT YET IMPLEMENTED)
**DON'T**: Complicate dimension tracking
**DO**: Fix the vector connections to find closest ridge endpoint

**Approach**: For each eave corner, connect to the NEAREST ridge endpoint:
```javascript
// For each eave corner, find closest ridge endpoint
const ridgePoints = [ridge1, ridge2];

eaveCorners.forEach(eave => {
  // Find closest ridge point
  const closest = ridgePoints.reduce((nearest, ridge) => {
    const distSq = (ridge.x - eave.x)**2 + (ridge.y - eave.y)**2;
    return distSq < nearest.dist ? { point: ridge, dist: distSq } : nearest;
  }, { point: null, dist: Infinity });

  // Draw rafter to closest ridge point
  svg.appendChild(createLine(eave, closest.point, roofColor, 2));
});
```

**OR EVEN SIMPLER**: Recognize the pattern - hip rafters should form an "X" when viewed from above:
- Corners on one end → Ridge point on that end
- Based on which half of the building they're in (front/back or left/right depending on ridge orientation)

### Lessons Learned (Attempt 2)
1. **Vertices were ALWAYS correct** - only connections were wrong
2. **Over-engineered the solution** - added dimension tracking when not needed
3. **Should have focused on rendering logic** - the hip rafter connection algorithm
4. **Key insight**: It's a graph connectivity problem (which corner connects to which ridge point), not a coordinate problem

### Why We Reverted
- Added unnecessary complexity (dimension tracking) that didn't solve the real problem
- Real issue is simpler: just need to fix which corners connect to which ridge endpoints
- Need to preserve clean code and tackle the actual problem

---

## Next Approach: Fix Hip Rafter Connections (Simple!)

**The ACTUAL Problem**: Hip rafter rendering connects corners to wrong ridge endpoints when orientation changes

**The Solution** (much simpler than attempt 2!):
1. Identify ridge orientation (longitudinal vs transverse)
2. For each corner, determine which ridge endpoint is closer
3. Draw rafter to that endpoint
4. NO need for complex dimension tracking - just fix the pairing logic!

**Implementation** (probably 10-20 lines of code):
```javascript
// Determine which corners connect to which ridge points based on orientation
if (ridgeOrientation === "longitudinal") {
  // Ridge runs along Y-axis
  // Front corners (y < 0) connect to ridge1, back corners (y > 0) to ridge2
  createLine(eave1, ridge1);  // SW → front ridge
  createLine(eave2, ridge1);  // SE → front ridge
  createLine(eave3, ridge2);  // NE → back ridge
  createLine(eave4, ridge2);  // NW → back ridge
} else {
  // Ridge runs along X-axis
  // Left corners (x < 0) connect to ridge1, right corners (x > 0) to ridge2
  createLine(eave1, ridge1);  // SW → left ridge
  createLine(eave4, ridge1);  // NW → left ridge
  createLine(eave2, ridge2);  // SE → right ridge
  createLine(eave3, ridge2);  // NE → right ridge
}
```

---

---

## Implementation Attempt 3: Working Hip Roof with Refinements Needed

**Date**: 2025-12-17
**Status**: WORKING - Rendering correctly, but area constraint needs refinement
**Branch**: WOMBAT-HIP
**Commit**: 81b2496

### What We Implemented ✅

**1. Hip Roof Calculation** (Section19.js:847-990)
- `calculateHipHeight()` using binary search to find ridge length
- **Area Formula**: `2 × ridgeLength × slopeLength + 2 × ridgeOffset × slopeLength`
  - Main slopes: 2 rectangles (ridgeLength × slopeLength)
  - Hip ends: 2 × (ridgeOffset × slopeLength) for both triangular ends
- Converges on **first iteration** to exact target area match
- Uses rational trigonometry throughout (quadrance-based)

**2. Orientation-Aware Hip Rafter Connections** (wombatRender.js:799-819)
- Fixed the torsion bug with simple orientation logic (~20 lines)
- **Longitudinal ridge** (Y-axis): Front corners → ridge1, back corners → ridge2
- **Transverse ridge** (X-axis): Left corners → ridge1, right corners → ridge2
- No more crossed/twisted rafters in negative aspect ratios

**3. Volume Calculation** (Section19.js:1244-1257)
- Hip roof volume = gable section + 2 pyramidal end caps
- Formula: `(ridgeLength × span × height)/2 + 2 × (1/3) × (ridgeOffset × span) × height`
- Properly integrated into thermal model

**4. Bounds Calculation** (wombatRender.js:115-132)
- Includes shortened ridge endpoints for proper scaling

### Current Behavior Observed

**Positive Aspect (Square Building)**:
- Building: 33.17m × 33.17m
- Ridge: 16.59m (offset: 8.29m)
- Ridge height: **23.01m**
- Achieved area: 1411.52 m² ✅

**Positive Aspect (Rectangular Building)**:
- Building: 22.36m × 49.20m (aspect ratio 1.2)
- Ridge: 24.60m (offset: 12.30m)
- Ridge height: **15.52m**
- Achieved area: 1411.52 m² ✅

**Negative Aspect (Portrait)**:
- Building: 58.4m × 18.8m (aspect ratio -1.5)
- Ridge: Still renders correctly with orientation-aware connections ✅
- No torsion/twisting ✅

---

## Critical Refinements Needed (Tomorrow's Work)

### Issue 1: Square Buildings Should Render as Pyramids

**Problem**: When building is square (aspect ratio 0), hip roof shows a ridge line
- Current: Square building (33.17m × 33.17m) has ridge length 16.59m
- Expected: Ridge length should be **0.00m** (pure pyramid)

**Root Cause**: Binary search starts with `ridgeLengthMin = 0` but immediately moves away from it

**Solution**:
```javascript
// In calculateHipHeight(), detect square buildings first
const tolerance = 1e-6;
if (Math.abs(width - length) < tolerance) {
  // Square building → pure pyramid (no ridge)
  // Fall through to pyramidHeightRectangle() instead
  console.log('[WOMBAT] Square building detected - using pyramidal roof');
  return {
    height: calculatePyramidalHeight(width, length, areaRatio),
    ridgeOrientation: "longitudinal",
    ridgeLength: 0,
    ridgeOffset: maxDimension / 2,
    span,
    hipData: {
      ridgeLength: 0,
      ridgeOffset: maxDimension / 2,
      ridgeOrientation: "longitudinal",
      achievedArea: targetRoofArea
    },
    isValid: true
  };
}
```

### Issue 2: Roof Height Not Responding to Aspect Ratio Changes

**Problem**: As aspect ratio increases, roof height should DECREASE to maintain constant roof area
- Aspect 0 (square): 23.01m height
- Aspect 1.2 (2.2:1): 15.52m height (good trend ✓)
- Aspect -1.5 (portrait): **Should also decrease from square baseline**

**Current Behavior**: Roof appears too tall/steep, especially at square aspect ratios

**Root Cause**: The area constraint is working, BUT the effective pitch is not being constrained by the **actual roof surface area (d_85)**

**The Fundamental Issue**:
We're solving for ridge length to match target area, then deriving height from that ridge. But the visual result shows roofs that are far too steep/tall for the stated roof area. This suggests our area calculation may be including BASE area instead of just SURFACE area.

### Issue 3: Roof Area Constraint Verification

**Problem**: Roof renders appear much larger than stated area (1411.52 m²)
- Visual inspection: Roofs look massive compared to 1100.42 m² footprint
- Stated ratio: 1.283 (roof/footprint)
- Visual ratio: Appears closer to 2.0+ (roof/footprint)

**Diagnosis Needed**:
1. Is our area formula calculating **surface area** or **projected area**?
2. Current formula: `2 × ridgeLength × slopeLength + 2 × ridgeOffset × slopeLength`
   - `slopeLength` = hypotenuse from eave to ridge
   - This IS surface area ✓
3. **But**: Are we correctly accounting for all 4 faces?

**Potential Issue**: Hip end area calculation
```javascript
// Current (Section19.js:946)
const hipEndArea = 2 * ridgeOffset * slopeLength;

// This gives BOTH triangular hip ends (each end has 2 triangular faces)
// Each face area = (1/2) × base × slant
// But we're using ridgeOffset × slopeLength, which is the rectangular projection
```

**Correct Hip End Calculation** (Rational Trigonometry):
```javascript
// Each hip end consists of 2 triangular faces meeting at ridge endpoint
// Triangle base = span/2 (from corner to center)
// Triangle slant height = hip rafter length

// Hip rafter length (using Pythagorean theorem - still rational!)
// From corner (±width/2, ±length/2, wallHeight) to ridge endpoint (0, y_ridge, wallHeight+roofHeight)
// Horizontal distance: sqrt((width/2)² + ridgeOffset²)
// Vertical distance: roofHeight
// Hip rafter quadrance: (width/2)² + ridgeOffset² + roofHeight²
const hipRafterQuadrance = (span/2) * (span/2) + ridgeOffset * ridgeOffset + roofHeight * roofHeight;
const hipRafterLength = Math.sqrt(hipRafterQuadrance); // Only sqrt at final step

// Each triangular face area = (1/2) × span × hipRafterLength
// Each hip end (2 faces) = span × hipRafterLength
const hipEndArea = 2 * span * hipRafterLength; // Total for BOTH ends
```

**BUT WAIT**: This doesn't match our current calculation which gives correct area convergence!

**Re-analysis Required**:
- Current formula converges to exact target area on first iteration
- But visual result doesn't match stated area
- **Either**: Formula is correct, but visual rendering scale is wrong
- **Or**: Formula has compensating errors

### Issue 4: Calculation Flow - Roof MUST Be Solved First

**Current Flow** (CORRECT ✓):
1. Footprint area (d_95) → SACRED touchstone
2. Aspect ratio → width × length
3. **Roof area (d_85) → Solve for roof height** ← This happens FIRST ✓
4. Roof volume → Derived from roof geometry
5. Wall height → Solved from (total volume - roof volume - basement volume)

**This is already correct!** Roof IS being solved first, constrained by d_85.

**But**: Need to verify the area constraint is truly being satisfied with SURFACE area, not base area.

---

## Diagnostic Steps for Tomorrow

### 1. Manual Area Verification
For a known geometry, calculate roof area by hand:
- Square building: 33.17m × 33.17m
- Ridge length: 16.59m (from current output)
- Ridge height: 23.01m
- Calculate:
  - Slope length = sqrt(h² + (span/2)²) = sqrt(23.01² + 16.585²) = ?
  - Main slope area = 2 × 16.59 × slopeLength = ?
  - Hip end area = 2 × 8.29 × slopeLength = ?
  - Total = ? (should be 1411.52 m²)

### 2. Test Pyramid Constraint
- Set aspect ratio to 0.0 (perfect square)
- Expected: Ridge length = 0, pure pyramid
- Check: Does `calculatePyramidalHeight()` give same area?

### 3. Test Aspect Ratio Scaling
- Series: -2, -1, 0, +1, +2
- For each: Record ridge length, height, visual pitch
- Expected: As aspect increases, height decreases proportionally
- Verify: Roof area stays constant at 1411.52 m²

### 4. Remove Transcendental Functions (Future)
Current code uses:
- `Math.sqrt()` - Acceptable (final step of rational trig)
- No trig functions (sin, cos, tan) ✓

All calculations use quadrance (squared distances) internally, only taking sqrt at the final step. This is **proper rational trigonometry** ✓

---

## Code Solutions (For Tomorrow)

### Fix 1: Detect Square → Pyramid
```javascript
// In solveGeometry(), before calling calculateHipHeight()
if (roofTypeSelection === "multiplanar") {
  // Check if building is square
  const tolerance = 1e-6;
  const isSquare = Math.abs(width - length) < tolerance;

  if (isSquare) {
    // Square building → PYRAMIDAL ROOF (no ridge)
    roofType = "pyramidal";
    roofHeight = calculatePyramidalHeight(width, length, areaRatio);
    console.log(`[WOMBAT] Square building - using pyramidal roof: h=${roofHeight.toFixed(2)}m`);
  } else {
    // Rectangular building → HIP ROOF (truncated gable)
    roofType = "hip";
    const hipData = calculateHipHeight(width, length, roofArea);
    // ... existing code
  }
}
```

### Fix 2: Verify Hip End Area Calculation
Need to determine which formula is geometrically correct:

**Option A** (Current):
```javascript
const hipEndArea = 2 * ridgeOffset * slopeLength;
```
- Treats hip end as rectangular projection
- Works mathematically (converges to target)
- But may not be true surface area

**Option B** (True Surface Area):
```javascript
// Hip rafter from corner to ridge endpoint
const hipRafterLength = Math.sqrt(
  (span/2) * (span/2) +           // Half span
  ridgeOffset * ridgeOffset +      // Longitudinal distance
  roofHeight * roofHeight          // Vertical distance
);
const hipEndArea = 2 * span * hipRafterLength;
```
- Calculates actual slant surface
- Each triangular face: (1/2) × span × hipRafter
- Both ends (4 faces total): 2 × span × hipRafter

**Test**: Implement Option B, see if convergence still works and if visual matches stated area

### Fix 3: Add Visual Scale Verification
Add debug overlay showing:
- Roof surface area (calculated)
- Footprint area (d_95)
- Ratio (should match stated 1.283)
- If visual doesn't match, issue is in RENDERING scale, not calculation

---

## Lessons Learned

### What Worked ✅
1. **Truncated gable approach** - Elegant, rational, geometrically sound
2. **Binary search** - Converges instantly (first iteration)
3. **Orientation-aware connections** - Simple fix (20 lines) vs complex dimension tracking (100+ lines)
4. **Rational trigonometry** - No trig functions, only sqrt at final step

### What Needs Refinement ⚠️
1. **Square → Pyramid detection** - Should have no ridge when square
2. **Area calculation verification** - Visual doesn't match stated area
3. **Hip end surface area** - May be using projection instead of true surface
4. **Height scaling with aspect ratio** - Should decrease as building stretches

### Key Insight 💡
The area constraint IS being satisfied mathematically (converges to exact match), but the **visual result suggests the constraint may not be correct**. Either:
- Formula calculates wrong thing (projection vs surface)
- Rendering scale is wrong
- User expectation of "roof area" differs from geometric surface area

**Tomorrow**: Manually verify the geometry, test pyramid case, refine area calculation.

---

## CRITICAL ISSUE DISCOVERED: Hip Roof Violates Wall Area Constraint

**Date**: 2025-12-18
**Status**: BLOCKING BUG - Hip roof steals volume from storey below and thus wall areas below, thus violating the stated total wall area constraint.

### The Problem

From live testing logs, switching between Gable and Hip roofs on the same building shows a massive discrepancy:

**Test Building**:
- Footprint: 29.70 m² (5.45m × 5.45m square)
- Total conditioned volume: 81.00 m³ (SACRED - from d_105)
- Wall area checksum: 53.00 m² (SACRED - from S12 g_107 = sum of d_86 + doors + windows)
- Roof area: 35.00 m² (1.178 ratio)

**Hip Roof (multiplanar)**:
- Roof height: 3.30 m
- **Roof volume: 40.87 m³**
- Above-grade rectangular volume: 40.13 m³
- **Wall height: 1.351 m**
- Wall height from area: 2.431 m
- **Discrepancy: 79.9%** ❌

**Gable Roof (biplanar)** - SAME BUILDING:
- Roof height: 1.70 m
- **Roof volume: 25.23 m³**
- Above-grade rectangular volume: 55.77 m³
- **Wall height: 1.878 m**
- Wall height from area: 2.007 m
- **Discrepancy: 6.9%** (barely acceptable)

### The Numbers Don't Lie

Hip roof consumes **15.64 m³ MORE volume** than gable roof (40.87 vs 25.23).

This extra volume is stolen from the walls below, which violates the **SACRED wall area constraint** from Section 12.

**Volume arithmetic**:
```
Total volume:         81.00 m³  (fixed)
Hip roof volume:     -40.87 m³
Rectangular volume:   40.13 m³
÷ Footprint:         ÷29.70 m²
Wall height:          1.351 m   ← TOO SHORT!

Expected wall height from area:
Wall area:            53.00 m²  (fixed - from S12)
÷ Perimeter:         ÷21.80 m  (4 × 5.45m)
Wall height:          2.431 m   ← REQUIRED!

Discrepancy: 1.351m vs 2.431m = 79.9% error!
```

### Root Cause Analysis

Looking at the hip roof area calculation (Section19.js:939-946):

```javascript
// Main rectangular slopes: 2 rectangles with dimensions ridgeLength × slopeLength
const mainSlopeArea = 2 * ridgeLength * slopeLength;

// Hip end triangular sections
// Each hip end consists of 2 triangular roof planes meeting at ridge endpoint
// The projected area of each hip end (both triangles) = ridgeOffset × slopeLength
// Total for both ends = 2 × (ridgeOffset × slopeLength)
const hipEndArea = 2 * ridgeOffset * slopeLength;

const calculatedArea = mainSlopeArea + hipEndArea;
```

**The formula is WRONG!**

This treats the hip ends as **rectangular projections** (ridgeOffset × slopeLength), NOT as the actual **triangular surface area**.

### The Geometric Truth

A hip roof consists of:
1. **2 main trapezoidal slopes** (NOT rectangles!)
2. **4 triangular hip end faces** (2 at each end)

**Current formula (WRONG)**:
```
Area = 2 × ridgeLength × slopeLength + 2 × ridgeOffset × slopeLength
     = 2 × slopeLength × (ridgeLength + ridgeOffset)
     = 2 × slopeLength × (ridgeLength + ridgeOffset)
```

This is treating it like **2 rectangles** with width = (ridgeLength + ridgeOffset) = maxDimension.

**In other words**: We're calculating the area of a GABLE ROOF with full ridge length = maxDimension, NOT a hip roof!

**Correct formula should be**:

For each trapezoidal main slope:
- Top edge: ridgeLength
- Bottom edge: maxDimension
- "Height" (slope distance): slopeLength
- Area = (ridgeLength + maxDimension) / 2 × slopeLength

Wait, that's still not right. Let me think about this geometrically...

Actually, a **hip roof face is NOT a trapezoid**. Each main slope is a **rectangle** running from ridge to eave, with dimensions:
- Length: ridgeLength (along ridge)
- Width: slopeLength (from ridge down to eave)

Each hip end has 2 **triangular faces**:
- Base: span (building width at that end)
- Height: **hip rafter length** (NOT slopeLength!)

### The Real Problem: Hip Rafter Length vs Slope Length

**Slope length** = distance from ridge to eave, perpendicular to ridge
- This is correct for the main rectangular slopes ✓

**Hip rafter length** = distance from corner to ridge endpoint (diagonal)
- From corner at (±span/2, ±ridgeOffset, 0) to ridge endpoint at (0, ±ridgeOffset, height)
- Horizontal distance: `sqrt((span/2)² + ridgeOffset²)`
- Vertical distance: `height`
- Hip rafter: `sqrt((span/2)² + ridgeOffset² + height²)`

**Current hip end area calculation**:
```javascript
const hipEndArea = 2 * ridgeOffset * slopeLength;
```

This is treating the hip end as if it's a rectangular projection with dimensions (ridgeOffset × slopeLength).

But geometrically:
- Each hip end has 2 triangular faces
- Each triangle: base = span, height = hip rafter length
- Area of one triangle = (1/2) × span × hipRafterLength
- Area of one hip end (2 triangles) = span × hipRafterLength
- Total both ends = 2 × span × hipRafterLength

**The error compounds**:
1. We're using `ridgeOffset × slopeLength` instead of `span × hipRafterLength`
2. For a square building (5.45m × 5.45m):
   - ridgeOffset = 1.36m
   - span = 5.45m
   - So we're calculating with 1.36m instead of 5.45m for the base!

This massively **underestimates the hip end area**, which causes the binary search to:
1. Find a longer ridge length (to hit target area)
2. Derive a taller roof height (from the longer ridge)
3. Create enormous roof volume
4. Steal volume from walls below

### Manual Verification

Let's verify with the actual geometry from logs:

**Hip roof**: 5.45m × 5.45m, ridge = 2.72m, height = 3.30m

```
Span: 5.45m
Ridge length: 2.72m
Ridge offset: (5.45 - 2.72) / 2 = 1.365m
Height: 3.30m

Slope length (main slopes):
  s = sqrt(h² + (span/2)²)
  s = sqrt(3.30² + 2.725²)
  s = sqrt(10.89 + 7.426)
  s = sqrt(18.316)
  s = 4.28m

Main slope area:
  2 × ridgeLength × slopeLength
  2 × 2.72 × 4.28
  = 23.28 m²

Hip end area (CURRENT WRONG FORMULA):
  2 × ridgeOffset × slopeLength
  2 × 1.365 × 4.28
  = 11.68 m²

Total (WRONG): 23.28 + 11.68 = 34.96 m² ≈ 35.00 m² ✓ (matches target)
```

Now with CORRECT formula:

```
Hip rafter length:
  From corner (2.725, 1.365, 0) to ridge endpoint (0, 1.365, 3.30)
  Horizontal: sqrt(2.725² + 0²) = 2.725m
  Vertical: 3.30m
  Hip rafter = sqrt(2.725² + 3.30²)
             = sqrt(7.426 + 10.89)
             = sqrt(18.316)
             = 4.28m

Hip end area (CORRECT):
  Each triangle: (1/2) × span × hipRafter
               = (1/2) × 5.45 × 4.28
               = 11.66 m²
  Both ends (4 triangles): 2 × 11.66 = 23.32 m²

Total (CORRECT): 23.28 + 23.32 = 46.60 m²
```

**The correct roof area should be 46.60 m², NOT 35.00 m²!**

To achieve the actual target of 35.00 m², the roof would need to be MUCH flatter, giving:
- Lower roof height
- Less roof volume
- More volume for walls
- Correct wall height to match area constraint

### Why Gable Works Better

Gable roof formula (Section19.js:~800-835) correctly uses:
```javascript
const slopeLength = targetRoofArea / (2 * ridgeLength);
```

This solves directly for slope length from area, then derives height. The gable ends are properly calculated as triangles.

### The Fix

We need to fix the hip end area calculation in `calculateHipHeight()`:

**Instead of**:
```javascript
const hipEndArea = 2 * ridgeOffset * slopeLength;
```

**Should be**:
```javascript
// Hip rafter from corner to ridge endpoint (rational trig)
const hipRafterQuadrance = (span/2) * (span/2) + ridgeOffset * ridgeOffset + height * height;
const hipRafterLength = Math.sqrt(hipRafterQuadrance);

// Each hip end: 2 triangles, each with area = (1/2) × span × hipRafter
// Total both ends: 2 × span × hipRafter
const hipEndArea = 2 * span * hipRafterLength;
```

But this creates a **circular dependency**:
- We need height to calculate hip rafter length
- We need hip rafter length to calculate total area
- We need total area to determine if this ridge length is correct
- The binary search adjusts ridge length to hit target area

**Solution**: We need to iterate on BOTH ridge length AND height simultaneously, OR use a different solving strategy.

### Alternative Strategy: Parametric Sweep

Instead of binary search on ridge length alone, we could:
1. For each candidate ridge length
2. Sweep through possible heights
3. Calculate true roof area with correct hip rafter formula
4. Find height that gives target area
5. Select the ridge/height combination that satisfies constraints

Or even simpler: Recognize that for a given ridge length and target area, there's only ONE height that works. Solve algebraically.

---

## SOLUTION: Two-Phase Planar-Then-Vertical Approach

**Date**: 2025-12-18
**Status**: PROPOSED - Elegant solution avoiding circular dependency

### The Insight

User's key observation: **Hip roof geometry is naturally separable into planar and vertical components.**

The hip rafters run at 45° from the corners to the ridge endpoints. This **determines the ridge length geometrically** based purely on the building footprint, independent of roof height!

### The Algorithm

**Phase 1: Solve Ridge on X-Y Plane (Height = 0)**

For a rectangular building (width × length):
1. Hip rafters run at 45° from corners toward center
2. For a square building: They meet at a point (pyramid)
3. For rectangular: They meet along a ridge line

**Ridge endpoints** (using rational trig, height = 0):
- Ridge runs along the longer dimension
- Hip rafter travels equal distances in both perpendicular directions
- **45° in rational trig**: Equal perpendicular distances = spread of 1/2
- At 45°: `ridgeOffset = span / 2` where span = shorter dimension
- Ridge length: `ridgeLength = maxDimension - span`

**Rational Trigonometry Explanation**:

Without using angles, we use the fact that a 45° line has **spread = 1/2**.

**Spread** = (perpendicular distance)² / (hypotenuse distance)²

For a 45° hip rafter from corner to ridge:
- Moves distance `d` perpendicular to ridge (toward center)
- Moves distance `d` parallel to ridge (toward center)
- Hypotenuse = `d × sqrt(2)`
- Spread = d² / (d × sqrt(2))² = d² / (2d²) = 1/2 ✓

But we don't even need spread! **The geometric constraint is simpler**:

For a hip roof, the corner diagonals must meet. For a rectangular building:
- Corner is at distance `width/2` from center (perpendicular to long axis)
- Corner is at distance `length/2` from center (parallel to long axis)

If we move from corner toward center at 45° (equal x and y components):
- We move `width/2` perpendicular to ridge → reach the ridge line
- We move some distance `d` parallel to ridge
- The two diagonals from opposite corners meet when `d = ridgeOffset`

**The constraint**: Hip rafter must travel **full width** perpendicular to ridge.
- Perpendicular distance: `width / 2` (from corner to centerline)
- At 45°: Parallel distance = perpendicular distance = `width / 2`
- Ridge extends from `(length/2 - width/2)` to `(length/2 - width/2)`
- Ridge length = `length - 2×(width/2)` = `length - width`

**No angles needed!** Just the geometric fact that hip rafters bisect the corner (equal perpendicular components).

**For square building**:
```
width = length = span
ridgeLength = span - span = 0  ✓ (pure pyramid!)
```

**For rectangular building (length > width)**:
```
span = width
ridgeOffset = width / 2
ridgeLength = length - width
```

**Example**: 5.45m × 5.45m square
```
Ridge length = 5.45 - 5.45 = 0.00m ✓
Ridge offset = 5.45 / 2 = 2.725m
```

**Example**: 22.36m × 49.20m rectangle
```
span = 22.36m
ridgeLength = 49.20 - 22.36 = 26.84m
ridgeOffset = 22.36 / 2 = 11.18m
```

**Phase 2: Solve Height from Target Roof Area**

Now that ridge length is **fixed geometrically**, solve for height that achieves target area:

```javascript
// Ridge geometry is fixed from planar solution
const span = minDimension;
const ridgeLength = maxDimension - span;
const ridgeOffset = span / 2;

// Now solve for height h that gives target area
// Total area = mainSlopeArea + hipEndArea
// mainSlopeArea = 2 × ridgeLength × slopeLength
// hipEndArea = 2 × span × hipRafterLength

// Where:
// slopeLength² = h² + (span/2)²
// hipRafterLength² = h² + (span/2)² + ridgeOffset²

// This is ONE equation in ONE unknown (h)!
// Solve algebraically or with simple 1D root finding
```

**Algebraic formulation**:
```
Target = 2 × L_ridge × sqrt(h² + (w/2)²) + 2 × w × sqrt(h² + (w/2)² + offset²)

Where:
L_ridge = length - width  (fixed)
offset = width / 2        (fixed)
w = width                 (fixed)
h = height               (SOLVE FOR THIS)
```

This is a **single-variable equation** - much simpler than 2D search!

### Why This Works

**Geometric truth**: A hip roof is a truncated pyramid. The 45° hip rafters are **structurally required** - they define where the ridge must be.

**No circular dependency**:
1. Ridge position determined by footprint geometry ✓
2. Height determined by area constraint ✓
3. Volume calculated from known geometry ✓
4. Wall height from remaining volume ✓

**Rational trigonometry preserved**:
- Planar phase: Uses only differences and ratios
- Vertical phase: Uses quadrance (squared distances)
- Only `Math.sqrt()` at final step

### Advantages

1. **Geometrically correct**: Ridge position matches real hip roof construction
2. **Square → Pyramid automatic**: Ridge length = 0 when width = length
3. **Single-variable solve**: Much faster, more robust convergence
4. **No binary search on ridge**: Ridge is deterministic
5. **Preserves rational trig**: All intermediate calculations use quadrance

### Implementation Steps

**Step 1: Calculate fixed ridge geometry**
```javascript
function calculateHipRidgeGeometry(width, length) {
  const maxDimension = Math.max(width, length);
  const minDimension = Math.min(width, length);
  const span = minDimension;

  // Hip rafters at 45° determine ridge position
  const ridgeLength = maxDimension - span;
  const ridgeOffset = span / 2;
  const ridgeOrientation = length >= width ? "longitudinal" : "transverse";

  return { ridgeLength, ridgeOffset, span, ridgeOrientation };
}
```

**Step 2: Solve for height from target area**
```javascript
function solveHipHeightFromArea(ridgeGeometry, targetArea) {
  const { ridgeLength, ridgeOffset, span } = ridgeGeometry;

  // Function: area(h) = 2×ridge×sqrt(h²+(span/2)²) + 2×span×sqrt(h²+(span/2)²+offset²)
  // Find h where area(h) = targetArea

  // Use Newton-Raphson or bisection on height only
  let hMin = 0;
  let hMax = span * 2; // Reasonable upper bound
  const tolerance = 0.01;

  while (hMax - hMin > tolerance) {
    const h = (hMin + hMax) / 2;

    // Calculate area with this height (using correct formulas)
    const slopeLength = Math.sqrt(h * h + (span/2) * (span/2));
    const mainSlopeArea = 2 * ridgeLength * slopeLength;

    const hipRafterQuadrance = h * h + (span/2) * (span/2) + ridgeOffset * ridgeOffset;
    const hipRafterLength = Math.sqrt(hipRafterQuadrance);
    const hipEndArea = 2 * span * hipRafterLength;

    const calculatedArea = mainSlopeArea + hipEndArea;

    if (calculatedArea < targetArea) {
      hMin = h; // Need taller roof
    } else {
      hMax = h; // Need flatter roof
    }
  }

  return (hMin + hMax) / 2;
}
```

**Step 3: Combine**
```javascript
function calculateHipHeight(width, length, targetRoofArea) {
  // Phase 1: Fixed ridge geometry from 45° hip rafters
  const geometry = calculateHipRidgeGeometry(width, length);

  // Check if square (pyramid)
  if (geometry.ridgeLength < 0.01) {
    // Pure pyramid - use existing pyramidal solver
    return calculatePyramidalHeight(width, length, targetRoofArea);
  }

  // Phase 2: Solve height from area constraint
  const height = solveHipHeightFromArea(geometry, targetRoofArea);

  return {
    height,
    ridgeOrientation: geometry.ridgeOrientation,
    ridgeLength: geometry.ridgeLength,
    ridgeOffset: geometry.ridgeOffset,
    span: geometry.span,
    hipData: { ...geometry, achievedArea: targetRoofArea },
    isValid: height > 0
  };
}
```

### Expected Results

**5.45m × 5.45m square, target 35.00 m²**:
```
Phase 1 (planar):
  Ridge length: 0.00m (pyramid!)
  Ridge offset: 2.725m

Phase 2 (height from area):
  Pyramidal height solving for 35.00 m²
  Expected: Much lower than 3.30m
  Result: Lower roof volume → more wall volume → correct wall height
```

**Test validation**:
- Wall height should match 2.431m (from 53.00 m² wall area)
- Roof volume should leave enough for walls
- Discrepancy should drop from 79.9% to <5%

---

**Document Status**: ACTIVE - Solution strategy documented, ready to implement
**Last Updated**: 2025-12-18
**Next Steps**:
1. Implement two-phase algorithm (planar ridge → height from area)
2. Test on square building (should auto-pyramid)
3. Verify wall area constraint satisfied
4. Test across aspect ratio range
