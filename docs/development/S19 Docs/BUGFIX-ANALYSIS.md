# WOMBAT-4 Bug Analysis
## Date: 2025-12-20
## Status: ANALYSIS PHASE - Do not modify code yet

---

## Reported Bugs

### Bug 1: Shed Roof "Bowtie" Effect
**Symptom**: Shed roof extends BELOW ground plane, building height shows as NEGATIVE (-16.63m)
**Test Case**: Aspect +2.30, shed roof, volume=8319.5m³, footprint=1100m²

### Bug 2: Gable Roof Exceeds Area Allowance
**Symptom**: Gable roof area far exceeds specified constraint (d_85)
**Test Case**: Aspect +1.90, gable roof

### Bug 3: Gable Roof Builds from Grade, Not Eave
**Symptom**: Triangle positioned from ground instead of sitting on top of walls

---

## Root Cause Analysis

### Hypothesis 1: Negative Wall Heights (Bug #1)

**Evidence**:
- Document shows "building height -16.63m" at line 1415
- Negative heights impossible unless `wallHeight = wallVolume / footprintArea` is negative
- This requires `wallVolume = targetVolume - roofVolume` to be negative
- Therefore: `roofVolume > targetVolume` (roof stealing MORE than total available)

**Validation**:
Looking at shed roof volume formula (Section19.js:861):
```javascript
const roofVolume = (footprintArea * roofHeight) / 2;
```

For test case (aspect +2.30):
- Footprint = 1100 m²
- Volume = 8319.5 m³
- If roofVolume > 8319.5, then: roofHeight > 15.13m

This means the shed roof must be over 15m tall. Let's check if the roof area constraint forces this:

**Roof Area Calculation**:
- d_85 (roof area) = 1411.52 m² (from test case assumption)
- Aspect +2.30 → aspectRatio = 1 + 2.30 = 3.30
- width = sqrt(1100 / 3.30) = 18.27m
- length = 1100 / 18.27 = 60.20m
- ridgeLength = min(18.27, 60.20) = 18.27m (SHORT)
- span = max(18.27, 60.20) = 60.20m (LONG)

**Shed Roof Solver** (solveShedRoof):
```
slopeLength = roofArea / ridgeLength = 1411.52 / 18.27 = 77.24m
h² = slopeLength² - span² = 77.24² - 60.20² = 5966 - 3624 = 2342
roofHeight = sqrt(2342) = 48.40m (!!)
roofVolume = (1100 × 48.40) / 2 = 26,620 m³
```

**CONFIRMED**: With these constraints, the shed roof would be **48.4m tall** and steal **26,620 m³**, which is 3.2× the total building volume!

**Conclusion**: Bug #1 is caused by **conflicting constraints** - the roof area (d_85=1411.52m²) is too large for the given volume (d_105=8319.5m³) and footprint aspect ratio.

---

### Hypothesis 2: Geometry Is Mathematically Correct

The code is actually computing the CORRECT geometry for the given constraints. The issue is that the constraints are **physically impossible** to satisfy simultaneously.

**What should happen**:
1. Detect when roof volume > total volume
2. Either:
   - Auto-reduce roof area to fit within volume budget, OR
   - Collapse to flat roof, OR
   - Show error message and refuse to render

**What currently happens**:
1. Roof volume calculated as 26,620 m³
2. Wall volume = 8319.5 - 26,620 = -18,300 m³ (NEGATIVE!)
3. Wall height = -18,300 / 1100 = -16.64m (NEGATIVE!)
4. Renderer draws nodes at negative Z → appears below ground

---

### Hypothesis 3: Gable Roof Geometry (Bug #2)

**Check gable roof calculation**:

For aspect +1.90:
- Aspect ratio = 1 + 1.90 = 2.90
- width = sqrt(1100 / 2.90) = 19.48m
- length = 1100 / 19.48 = 56.47m
- ridgeLength = min(19.48, 56.47) = 19.48m (SHORT)
- span = max(19.48, 56.47) = 56.47m (LONG)

**Gable Roof Solver** (solveGableRoof):
```
slopeLength = roofArea / (2 × ridgeLength) = 1411.52 / (2 × 19.48) = 36.23m
h² = slopeLength² - (span/2)² = 36.23² - (56.47/2)² = 1313 - 797 = 516
roofHeight = sqrt(516) = 22.72m
roofVolume = (1100 × 22.72) / 2 = 12,496 m³
```

This also exceeds the total volume! roofVolume (12,496) > targetVolume (8319.5)

**But wait** - let me check the Pythagorean calculation. For a gable roof:
- The slope drops from ridge to eave
- The ridge is centered over the building
- The horizontal distance from ridge to eave is **span/2** (half the long dimension)

**CRITICAL QUESTION**: Is the gable roof slope running perpendicular to the ridge or parallel?

Looking at the geometry:
- Ridge runs across SHORT dimension (width = 19.48m)
- The profile is perpendicular to the ridge
- The profile shows a triangle with base = ??? and height = roofHeight

**From the 2D profile** (solveGable2DProfile line 908-932):
```javascript
const ridgeLength = width; // SHORT dimension
const slopeLength = roofArea / (2 * ridgeLength);
const halfWidth = width / 2; // HALF of SHORT dimension!

const h2 = slopeLength² - halfWidth²; // Uses halfWIDTH, not halfSPAN
```

**DISCREPANCY FOUND!**

The `solveGableRoof` function uses `span/2` (line 786):
```javascript
const h2 = slopeLength * slopeLength - (span * span) / 4;
```

But `solveGable2DProfile` uses `halfWidth` (line 916):
```javascript
const Q_halfWidth = halfWidth * halfWidth;
const Q_height = R - Q_halfWidth;
```

**These are DIFFERENT dimensions!**

- `solveGableRoof` thinks the slope runs across the LONG dimension (span)
- `solveGable2DProfile` thinks the slope runs across the SHORT dimension (width)

---

## The Actual Bug: Ridge Orientation Confusion

**Standard Gable Roof**:
```
Top View:
┌─────────┐
│    │    │  ← Ridge runs ALONG the length
│    │    │
│    │    │
└─────────┘
   width

Profile (perpendicular to ridge):
    /\      ← Triangle
   /  \
  /____\
  width   ← Base of triangle
```

The ridge runs ALONG one dimension, and the triangle's base is the dimension PERPENDICULAR to the ridge.

**Current Code Assumption**:
- Ridge = SHORT dimension = ridgeLength
- Ridge runs across the SHORT dimension
- Triangle base = PERPENDICULAR to ridge = LONG dimension (span)

**But this is BACKWARDS for a typical gable roof!**

Typically:
- Ridge runs ALONG the LONG dimension (ridge is long)
- Triangle base is the SHORT dimension (perpendicular to ridge)

**Let me re-examine the "ridge runs across SHORT dimension" rule...**

Looking at the documentation (S19-WOMBAT-4.md:1576-1599), it says:

> **CRITICAL DESIGN DECISION**: Ridge always runs across **SHORT dimension**

This is justified by structural efficiency. But I think there's semantic confusion:
- "Ridge runs across SHORT dimension" could mean:
  - A) Ridge SPANS the short dimension (ridge is short, triangle base is long) ← Current code
  - B) Ridge runs PERPENDICULAR across the building (from short wall to short wall) ← Typical

I think the code interprets it as (A), but the structural convention is actually (B).

**For a rectangular building (20m × 60m)**:
- Traditional gable: Ridge runs the LONG direction (60m), triangle base is SHORT (20m)
- This is structurally efficient because floor joists span the SHORT direction
- The "ridge runs across SHORT dimension" means it crosses FROM one short wall TO the other short wall

**Current code** sets:
- ridgeLength = SHORT dimension (20m)
- span = LONG dimension (60m)
- Triangle base = span (60m) ← WRONG!

**Should be**:
- ridgeLength = LONG dimension (60m)
- span = SHORT dimension (20m)
- Triangle base = span (20m) ← CORRECT!

---

## Proposed Fix

### Option 1: Swap Ridge Orientation for Gable Roofs

For **gable roofs only**, use the LONG dimension as ridge:
```javascript
// Gable roof: ridge runs ALONG the long dimension
const ridgeLength = Math.max(width, length);  // LONG (ridge is long)
const span = Math.min(width, length);         // SHORT (triangle base)
```

For **shed roofs**, keep current convention:
```javascript
// Shed roof: ridge at one end of short dimension
const ridgeLength = Math.min(width, length);  // SHORT (ridge is short)
const span = Math.max(width, length);         // LONG (slope runs long distance)
```

### Option 2: Clarify "Across" vs "Along"

The documentation uses "across" ambiguously. Need to clarify:
- "Ridge runs **across** the building" = ridge goes from wall A to wall B
- "Ridge runs **along** dimension X" = ridge is parallel to dimension X

For gable roofs:
- Ridge runs ALONG the LONG dimension (ridge is parallel to length)
- Ridge runs ACROSS the width (ridge crosses from one width-wall to the other)
- Triangle base = width (the dimension the ridge crosses)

### Option 3: Let User Choose Ridge Orientation

Add a dropdown: "Ridge Orientation: Longitudinal | Transverse"
- Longitudinal: Ridge parallel to length (traditional)
- Transverse: Ridge parallel to width (rotated 90°)

---

## Testing Plan

Before changing code:

1. **Verify current behavior**:
   - Test gable roof at aspect 0 (square) - should work
   - Test gable roof at aspect +2 (landscape) - check if roof too steep
   - Test shed roof at aspect +2 - check if roof too steep

2. **Calculate expected values manually**:
   - For 1100m² footprint, 8319.5m³ volume
   - What roof area (d_85) is feasible without negative walls?
   - What roof height results from typical slopes (e.g., 30° pitch)?

3. **Test constraint conflict detection**:
   - Does the code warn when roofVolume > targetVolume?
   - Should we add auto-collapse logic?

---

## SOLUTION FOUND IN DOCUMENTATION

After re-reading S19-WOMBAT-4.md:1329-1395, the fix is clear:

### The Root Cause

**Current code** (WRONG):
- `solveGable2DProfile(ridgeLength, roofArea, wallHeight)` - SOLVES roofHeight from roofArea
- `solveShed2DProfile(ridgeLength, roofArea, span, wallHeight)` - SOLVES roofHeight from roofArea
- This creates DUPLICATION - roof geometry solved TWICE (once in solveRoofGeometry, again in profile builders)
- The two solvers use DIFFERENT formulas, causing inconsistency!

**Target code** (CORRECT):
- `build2DProfile(roofType, width, wallHeight, roofHeight)` - ACCEPTS pre-calculated roofHeight
- Just BUILDS node array from given dimensions
- No solving, no duplication, single source of truth

### Implementation Steps

Following S19-WOMBAT-4.md:1387-1389 checklist:

1. **Modify profile builders** to accept `roofHeight` parameter instead of calculating it
2. **Remove** roofArea parameter (not needed for building nodes)
3. **Remove** all Pythagorean calculations from profile builders
4. **Update** calls to pass `roofResult.roofHeight`

### Code Changes Required

**In Section19.js:**

1. Change `solveGable2DProfile(width, roofArea, wallHeight)` signature to:
   ```javascript
   function buildGable2DProfile(width, wallHeight, roofHeight)
   ```
   Remove lines 910-917 (roofHeight calculation)

2. Change `solveShed2DProfile(width, roofArea, length, wallHeight)` signature to:
   ```javascript
   function buildShed2DProfile(width, wallHeight, roofHeight)
   ```
   Remove lines 940-948 (roofHeight calculation)

3. Update calls at lines 1171-1177:
   ```javascript
   // BEFORE:
   profile2D = solveGable2DProfile(ridgeLength, roofArea, wallHeight);
   profile2D = solveShed2DProfile(ridgeLength, roofArea, span, wallHeight);

   // AFTER:
   profile2D = buildGable2DProfile(ridgeLength, wallHeight, roofResult.roofHeight);
   profile2D = buildShed2DProfile(ridgeLength, wallHeight, roofResult.roofHeight);
   ```

This eliminates the duplicate solving and ensures consistency.

---

## Next Steps

1. ✅ Document analysis (this file)
2. ✅ Found solution in S19-WOMBAT-4.md
3. ⬜ Implement profile builder changes
4. ⬜ Test rendering with fixed builders
5. ⬜ Verify no more negative wall heights
6. ⬜ Update implementation checklist
