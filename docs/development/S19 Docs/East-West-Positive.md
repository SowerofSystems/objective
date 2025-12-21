# East-West-Positive Debug Document
**Issue**: Gable and Shed roofs render with opposite orientations despite identical aspect ratios
**Date**: 2025-12-21
**Status**: BUG CONFIRMED - Shed roof has backwards extrusion logic
**Scope**: **Rendering bug only** (Section19.js Phase 4) - constraint solving is CORRECT ✅
**Impact**: Section19.js only - wombatRender.js is innocent

---

## Problem Statement

When switching between **Shed** and **Gable** roof types with the same positive aspect ratio (1.5), the building orientation rotates 90°:

- **Shed roof** (aspect = +1.5): Building runs **East-West** (long axis horizontal, X-aligned)
- **Gable roof** (aspect = +1.5): Building runs **North-South** (long axis vertical, Y-aligned)

**Expected behavior**: Both roof types should maintain the same orientation for a given aspect ratio.

**Correct behavior**: **GABLE is correct ✅, SHED is backwards ❌**

---

## Root Cause Analysis

### Aspect Ratio Convention (CORRECT ✅)
From [Section19.js:1069-1071](../../../src/sections/Section19.js#L1069-L1071):
```javascript
// Convert slider value to actual aspect ratio (length/width)
const aspectRatio = aspectRatioRaw >= 0
  ? 1 + aspectRatioRaw           // Landscape: 0→1, +1→2, +2→3, +5→6
  : 1 / (1 - aspectRatioRaw);    // Portrait:  0→1, -1→0.5, -2→0.33, -5→0.167
```

Positive aspect ratio = **LANDSCAPE** = Length > Width

### Footprint Calculation (CORRECT ✅)
From [Section19.js:1077-1078](../../../src/sections/Section19.js#L1077-L1078):
```javascript
const width = Math.sqrt(footprintArea / aspectRatio);
const length = footprintArea / width;  // Exact, no rounding error
```

For aspect = +1.5 (slider value):
- `aspectRatio = 1 + 1.5 = 2.5` (L:W ratio)
- `width = 14.64m` (SHORT, X-axis, East)
- `length = 36.61m` (LONG, Y-axis, North)

### Short/Long Dimension Assignment (CORRECT ✅)
From [Section19.js:1103-1104](../../../src/sections/Section19.js#L1103-L1104):
```javascript
const shortDimension = Math.min(width, length);  // SHORT footprint edge
const longDimension = Math.max(width, length);   // LONG footprint edge
```

For our example:
- `shortDimension = 14.64m`
- `longDimension = 36.61m`

---

## CRITICAL: Constraint Solving is CORRECT ✅

**Phase 1 & 2: Roof geometry solving (Lines 724-895) works perfectly:**

Both `solveShedRoof()` and `solveGableRoof()` receive and correctly interpret parameters:

```javascript
// Called from solveGeometry() line 1114-1120
const roofResult = solveRoofGeometry(
  roofType,
  roofArea,
  footprintArea,
  shortDimension,     // 14.64m - passed as param 4
  longDimension       // 36.61m - passed as param 5
);

// Inside solveShedRoof(roofArea, shortDimension, longDimension, footprintArea)
// Lines 846-847:
const ridgeLength = longDimension;      // 36.61m LONG ✅ (ridge runs along this)
const slopeSpan = shortDimension;       // 14.64m SHORT ✅ (slope drops across this)

// Roof area = ridge × slopeLength
const slopeLength = roofArea / ridgeLength;  // ✅ CORRECT

// End wall area = slopeSpan × roofHeight ✅
const shedEndWallArea = slopeSpan * roofHeight;
```

**Result**:
- ✅ Roof height calculated correctly
- ✅ Roof volume calculated correctly
- ✅ End wall areas calculated correctly
- ✅ All constraints satisfied (volume, footprint area, roof area)

**The constraint solver correctly assumes ridge runs along LONG dimension (36.61m, Y-axis).**

---

## The Bug: Profile/Extrusion Logic (Phase 4 - Rendering Only)

### Correct Extrusion Pattern (CAD/Architectural Standard)

In traditional CAD/architectural extrusion:
1. Draw a **2D profile** (cross-section/elevation view)
2. **Sweep** that profile along a path (extrusion depth)
3. The extrusion path is typically the **LONG** dimension (like extruding pasta)

**Analogy**: Draw a gable end wall elevation, then extrude it along the building length (ridge direction).

### Gable Roof (Lines 1215-1242) - CORRECT ✅

```javascript
if (roofResult.roofType === "gable") {
  // Profile width = SHORT dimension (gable end cross-section)
  profile2D = buildGable2DProfile(shortDimension, wallHeight, roofResult.roofHeight);
  //                               ↑
  //                          14.64m (SHORT) - the gable end elevation

  // Extrusion depth = LONG dimension (sweep along ridge direction)
  extrusionDepth = longDimension;   // 36.61m (LONG)
}
```

**What this does**:
- Draw a **14.64m wide gable end triangle** (the elevation you'd see from the end)
- Extrude it **36.61m along the Y-axis** (North-South, the ridge direction)
- Ridge runs **perpendicular to the profile**, along the extrusion direction

**Result**:
- Ridge runs along LONG dimension (36.61m, Y-axis) ✅
- Building appears to run North-South (Y-dominant) ✅
- **Matches constraint solver assumptions** ✅
- **Correct CAD extrusion pattern** ✅

### Shed Roof (Lines 1222-1240) - BACKWARDS ❌

```javascript
else if (roofResult.roofType === "shed") {
  // Profile width = LONG dimension (WRONG!)
  profile2D = buildShed2DProfile(longDimension, wallHeight, roofResult.roofHeight);
  //                              ↑
  //                         36.61m (LONG) - This is the ridge direction!

  // Extrusion depth = SHORT dimension (WRONG!)
  extrusionDepth = shortDimension;  // 14.64m (SHORT)
}
```

**What this does**:
- Draw a **36.61m wide profile** (this includes the full ridge length IN the profile!)
- Extrude it **14.64m along the Y-axis** (the slope span direction)
- This is **backwards** - we're extruding across the slope instead of along the ridge

**Result**:
- Ridge runs along SHORT dimension (14.64m, X-axis) ❌
- Building appears to run East-West (X-dominant) ❌
- **Contradicts constraint solver** (solver assumes ridge along LONG) ❌
- **Backwards CAD extrusion pattern** ❌

### The Coordinate Mapping Proof

From [generate3DNodes()](../../../src/sections/Section19.js#L971-L1016):

```javascript
const width = profile2D.nodes[1].x;  // Profile width from 2D
const halfWidth = width / 2;

const nodes = {
  ground: [
    { x: -halfWidth, y: -halfDepth, z: 0 },  // X = profile width
    { x: halfWidth, y: -halfDepth, z: 0 },   // Y = extrusion depth
    // ...
  ]
};
```

**The mapping**:
- **X-axis** gets the profile width
- **Y-axis** gets the extrusion depth

**For Gable (CORRECT)**:
- X = `shortDimension` (14.64m)
- Y = `longDimension` (36.61m)
- Result: Y-dominant building (North-South) ✅

**For Shed (WRONG)**:
- X = `longDimension` (36.61m)
- Y = `shortDimension` (14.64m)
- Result: X-dominant building (East-West) ❌

---

## Why This Happened

During the PRISMATIC-TERMINOLOGY refactor, we updated the **constraint-solving functions** (`solveShedRoof`, `solveGableRoof`) to use `shortDimension/longDimension` correctly.

BUT we forgot to update the **profile building and extrusion logic** for shed roofs to match the gable pattern.

The gable roof was already using the correct CAD extrusion pattern (profile = cross-section, extrude along length), but the shed roof was written with a non-standard extrusion approach.

---

## The Fix

### Change Required (Section19.js Lines 1222-1240)

**Current (WRONG)**:
```javascript
else if (roofResult.roofType === "shed") {
  profile2D = buildShed2DProfile(longDimension, wallHeight, roofResult.roofHeight);
  extrusionDepth = shortDimension;
}
```

**Fixed (CORRECT)**:
```javascript
else if (roofResult.roofType === "shed") {
  // FIXED: Profile = SHORT dimension (shed end wall cross-section)
  // Extrude along LONG dimension (ridge direction)
  profile2D = buildShed2DProfile(shortDimension, wallHeight, roofResult.roofHeight);
  extrusionDepth = longDimension;
}
```

### Update Profile Builder Documentation

The `buildShed2DProfile()` function documentation (Lines 941-948) currently says:
```javascript
/**
 * Profile width = LONG dimension (ridge runs across this width)  ❌ WRONG
 * Profile will be extruded along SHORT dimension  ❌ WRONG
 */
```

Should say:
```javascript
/**
 * Profile width = SHORT dimension (shed end wall cross-section)  ✅ CORRECT
 * Profile will be extruded along LONG dimension (ridge direction)  ✅ CORRECT
 * Slope drops from Z=0 (low eave) to Z=wallHeight+roofHeight (high eave)
 */
```

### Update generate3DNodes for Shed

The `generate3DNodes()` function (Lines 987-995) has special handling for shed roofs that assumes the backwards extrusion. This logic needs review:

```javascript
if (profile2D.type === "shed") {
  // Shed roof: short side at wallHeight, tall side at tallWallHeight
  // Slope runs from -Y (short) to +Y (tall)
  nodes.eave = [
    { x: -halfWidth, y: -halfDepth, z: profile2D.wallHeight },      // Front (short)
    { x: halfWidth, y: -halfDepth, z: profile2D.wallHeight },       // Front (short)
    { x: halfWidth, y: halfDepth, z: profile2D.tallWallHeight },    // Back (tall)
    { x: -halfWidth, y: halfDepth, z: profile2D.tallWallHeight },   // Back (tall)
  ];
}
```

After the fix, this should still work because:
- Profile width (now SHORT) spans X-axis
- Extrusion (now LONG) spans Y-axis
- Slope in the profile goes from low (left X) to high (right X)
- When extruded, this creates the sloped roof along Y

**Actually, this logic should be REMOVED** - the shed eave nodes should be uniform height like gable/flat, because the slope is in the **roof surface**, not in the eave heights.

---

## Impact Analysis

### Files Affected
1. **[Section19.js:1222-1240](../../../src/sections/Section19.js#L1222-L1240)** - Fix shed profile/extrusion parameters
2. **[Section19.js:941-965](../../../src/sections/Section19.js#L941-L965)** - Update `buildShed2DProfile()` documentation
3. **[Section19.js:987-995](../../../src/sections/Section19.js#L987-L995)** - Review shed eave node generation in `generate3DNodes()`

### Files NOT Affected
- **wombatRender.js** - Innocent! Just renders whatever geometry Section19 provides
- **Constraint solvers** (`solveShedRoof`, `solveGableRoof`) - Already correct ✅
- **Roof area calculations** - Already correct ✅
- **Volume calculations** - Already correct ✅

### Constraint Preservation
✅ **All sacred constraints remain preserved**:
- Volume (d_105) ✅
- Footprint area (d_95) ✅
- Roof area (d_85) ✅
- Roof height ✅
- End wall areas ✅

**This is purely a rendering orientation fix - no constraint math changes.**

---

## Testing Checklist

After fix:
- [ ] Positive aspect (+1.5): Both shed and gable run **North-South** (Y-dominant, long axis vertical)
- [ ] Negative aspect (-1.5): Both shed and gable run **East-West** (X-dominant, long axis horizontal)
- [ ] Zero aspect (0): Both shed and gable are **square** (symmetric)
- [ ] Coordinate axes indicator shows same orientation for both roof types
- [ ] Legend dimensions match visual orientation
- [ ] Roof area constraint still satisfied (no change)
- [ ] Volume constraint still satisfied (no change)
- [ ] End wall areas still correct (no change)

---

## Conclusion

**Bug confirmed**: Shed roof uses backwards extrusion logic (profile=LONG, extrude=SHORT) while gable uses correct CAD pattern (profile=SHORT, extrude=LONG).

**Fix**: Swap shed parameters to match gable:
- Change `buildShed2DProfile(longDimension, ...)` → `buildShed2DProfile(shortDimension, ...)`
- Change `extrusionDepth = shortDimension` → `extrusionDepth = longDimension`

**Scope**: Rendering bug only (Phase 4) - constraint solving (Phases 1-3) is already correct.

**Safety**: No risk to sacred constraints - this only affects the 3D node coordinates for visualization.
