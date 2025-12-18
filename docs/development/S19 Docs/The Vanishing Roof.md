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
- Result: Crossed/twisted roof geometry

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

**Document Status**: ACTIVE - Hip roof working, refinements needed for square buildings and area verification
**Last Updated**: 2025-12-17 (End of Day)
**Next Steps**:
1. Add square → pyramid detection
2. Verify hip end area calculation (projection vs surface)
3. Manual geometry verification
4. Test aspect ratio scaling behavior
