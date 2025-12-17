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

**Document Status**: ACTIVE - Investigation complete, solutions proposed
**Last Updated**: 2025-12-16
**Next Step**: Implement hip roof geometry (Solution 1A)
