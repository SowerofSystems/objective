# East-West-Positive Debug Document
**Issue**: Gable and Shed roofs render with opposite orientations despite identical aspect ratios
**Date**: 2025-12-21
**Status**: BUG CONFIRMED - Shed and Gable map dimensions to X/Y axes inconsistently
**Scope**: **Rendering bug only** (Section19.js Phase 4) - constraint solving is CORRECT ✅
**Impact**: Section19.js only - wombatRender.js is innocent

---

## Problem Statement - CORRECTED

When switching between **Shed** and **Gable** roof types with the same positive aspect ratio (5.0), the building orientation rotates 90°:

- **Shed roof** (aspect = +5.0): Building runs **East-West** (X-dominant, long axis horizontal)
- **Gable roof** (aspect = +5.0): Building runs **North-South** (Y-dominant, long axis vertical)

**User Requirement**:
> "Roof type changes should have NO EFFECT on orientation. The aspect ratio slider determines orientation, not the roof type."

**Expected behavior**: Both roof types maintain the **same X-Y axis mapping** for a given aspect ratio.

**Correct behavior**: **GABLE is correct ✅, SHED needs to match GABLE's axis mapping ❌**

---

## Core Requirement: Consistent Axis Mapping

### The Invariant Rule

For a given footprint defined by `width` and `length` from aspect ratio:

**Positive aspect (+5.0)**:
- `width = 13.55m` (SHORT)
- `length = 81.27m` (LONG)
- **X-axis MUST = width** (13.55m, East-West, SHORT)
- **Y-axis MUST = length** (81.27m, North-South, LONG)
- Ridge MUST run along **Y-axis** (North-South) for structural efficiency

**This mapping must be INDEPENDENT of roof type** - changing from shed to gable should NOT rotate the building!

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

For aspect = +5.0 (slider value):
- `aspectRatio = 1 + 5.0 = 6.0` (L:W ratio)
- `width = 13.55m` (SHORT, should map to X-axis)
- `length = 81.27m` (LONG, should map to Y-axis)

### Short/Long Dimension Assignment (CORRECT ✅)
From [Section19.js:1103-1104](../../../src/sections/Section19.js#L1103-L1104):
```javascript
const shortDimension = Math.min(width, length);  // SHORT footprint edge
const longDimension = Math.max(width, length);   // LONG footprint edge
```

For our example:
- `shortDimension = 13.55m` (should map to X-axis)
- `longDimension = 81.27m` (should map to Y-axis)

---

## CRITICAL: Constraint Solving is CORRECT ✅

**Phase 1 & 2: Roof geometry solving (Lines 724-895) works perfectly for both roof types.**

Both `solveShedRoof()` and `solveGableRoof()` correctly interpret:
```javascript
const ridgeLength = longDimension;      // 81.27m LONG ✅ (ridge runs along this)
const slopeSpan = shortDimension;       // 13.55m SHORT ✅ (slope drops across this)
```

**Result**:
- ✅ Roof height calculated correctly
- ✅ Roof volume calculated correctly
- ✅ End wall areas calculated correctly
- ✅ All constraints satisfied (volume, footprint area, roof area)

**The constraint solvers are NOT the problem - they work identically for both roof types.**

---

## The Bug: Inconsistent X/Y Axis Mapping (Phase 4)

### How generate3DNodes() Maps to Axes

From [Section19.js:971-983](../../../src/sections/Section19.js#L971-L983):

```javascript
function generate3DNodes(profile2D, extrusionDepth) {
  const width = profile2D.nodes[1].x;  // Profile width from 2D
  const halfWidth = width / 2;
  const halfDepth = extrusionDepth / 2;

  const nodes = {
    ground: [
      { x: -halfWidth, y: -halfDepth, z: 0 },  // X = profile width
      { x: halfWidth, y: -halfDepth, z: 0 },   // Y = extrusion depth
      // ...
    ]
  };
}
```

**The coordinate mapping rule**:
- **X-axis** = `profile2D.nodes[1].x` (profile width)
- **Y-axis** = `extrusionDepth` (extrusion dimension)
- **Z-axis** = height (up)

### Gable Roof (Lines 1215-1242) - CORRECT AXIS MAPPING ✅

```javascript
if (roofResult.roofType === "gable") {
  profile2D = buildGable2DProfile(shortDimension, wallHeight, roofResult.roofHeight);
  //                               ↑
  //                          13.55m (SHORT)
}

// Later...
extrusionDepth = longDimension;   // 81.27m (LONG)
```

**Axis mapping result**:
- X-axis = `shortDimension` (13.55m) ✅ Matches `width`
- Y-axis = `longDimension` (81.27m) ✅ Matches `length`
- Ridge runs along **Y-axis** (North-South) ✅
- Building orientation: **North-South** (Y-dominant) ✅

### Shed Roof (Lines 1222-1240) - INCORRECT AXIS MAPPING ❌

```javascript
else if (roofResult.roofType === "shed") {
  profile2D = buildShed2DProfile(longDimension, wallHeight, roofResult.roofHeight);
  //                              ↑
  //                         81.27m (LONG) ❌ WRONG!
}

// Later...
if (roofResult.roofType === "shed") {
  extrusionDepth = shortDimension;  // 13.55m (SHORT) ❌ WRONG!
}
```

**Axis mapping result**:
- X-axis = `longDimension` (81.27m) ❌ Should be `width` (13.55m)
- Y-axis = `shortDimension` (13.55m) ❌ Should be `length` (81.27m)
- Ridge runs along **X-axis** (East-West) ❌ Should be Y-axis
- Building orientation: **East-West** (X-dominant) ❌ Should be North-South

**The axes are swapped!** This causes the 90° rotation when switching roof types.

---

## Why This Happens: Profile vs Extrusion Semantics

### Current Shed Profile Logic

The `buildShed2DProfile()` function (Lines 949-965) creates a **2D trapezoid profile**:

```javascript
function buildShed2DProfile(width, wallHeight, roofHeight) {
  const tallWallHeight = wallHeight + roofHeight;

  return {
    nodes: [
      { x: 0, z: 0 },                   // Left ground (low eave side)
      { x: width, z: 0 },               // Right ground (high ridge side)
      { x: width, z: tallWallHeight },  // Right eave (high ridge)
      { x: 0, z: wallHeight },          // Left eave (low eave)
    ],
    // ...
  };
}
```

**The profile shows elevation variation** (low eave at x=0, high eave at x=width).

**BUT**: The actual slope direction is applied during 3D node generation (Lines 987-995):

```javascript
if (profile2D.type === "shed") {
  // Slope runs from -Y (short) to +Y (tall)
  nodes.eave = [
    { x: -halfWidth, y: -halfDepth, z: profile2D.wallHeight },      // Front (short)
    { x: halfWidth, y: -halfDepth, z: profile2D.wallHeight },       // Front (short)
    { x: halfWidth, y: halfDepth, z: profile2D.tallWallHeight },    // Back (tall)
    { x: -halfWidth, y: halfDepth, z: profile2D.tallWallHeight },   // Back (tall)
  ];
}
```

**The slope is in the Y direction** (extrusion direction), NOT in the profile X direction!

So the profile's X-dimension "elevation variation" is **ignored** - the actual slope is applied in Y during 3D generation. This means we CAN swap the parameters without breaking the slope direction.

---

## The Fix

### Required Changes (Section19.js)

**Change 1: Line 1224 - Swap shed profile parameter**
```javascript
// Current (WRONG):
profile2D = buildShed2DProfile(longDimension, wallHeight, roofResult.roofHeight);

// Fixed (CORRECT):
profile2D = buildShed2DProfile(shortDimension, wallHeight, roofResult.roofHeight);
```

**Change 2: Line 1240 - Swap shed extrusion depth**
```javascript
// Current (WRONG):
if (roofResult.roofType === "shed") {
  extrusionDepth = shortDimension;
}

// Fixed (CORRECT):
if (roofResult.roofType === "shed") {
  extrusionDepth = longDimension;
}
```

**Change 3: Update comments (Lines 1222-1223, 1237, 1240)**
```javascript
// Updated to reflect correct axis mapping:
// - Shed: Profile = SHORT, Extrude = LONG (same as gable)
```

**Change 4: Update buildShed2DProfile documentation (Lines 945-946)**
```javascript
// Current:
* Profile width = LONG dimension (ridge runs across this width)
* Profile will be extruded along SHORT dimension

// Fixed:
* Profile width = SHORT dimension (end wall cross-section)
* Profile will be extruded along LONG dimension (ridge direction)
```

### Why This Fix Works

**After the fix, both roof types will have identical axis mapping**:

| Roof Type | Profile Width | Extrusion Depth | X-Axis | Y-Axis | Ridge Direction |
|-----------|---------------|-----------------|--------|--------|-----------------|
| Gable     | SHORT (13.55m) | LONG (81.27m)  | 13.55m | 81.27m | Y-axis (N-S) ✅ |
| Shed      | SHORT (13.55m) | LONG (81.27m)  | 13.55m | 81.27m | Y-axis (N-S) ✅ |

**Result**: Changing roof type will NOT rotate the building - only the aspect ratio slider controls orientation.

### Slope Direction Preservation

The shed roof slope direction is controlled by the 3D node generation (Lines 987-995), NOT by the 2D profile. The slope runs from `y: -halfDepth` (low eave) to `y: +halfDepth` (high eave).

**This logic doesn't change** - it automatically adapts to the new extrusion depth:
- Before: Slope across 13.55m (SHORT, wrong axis)
- After: Slope across 81.27m (LONG, correct axis)

Wait, that's wrong! The slope should be across the SHORT dimension (13.55m), not the LONG dimension (81.27m).

Let me reconsider...

---

## HOLD: Slope Direction Analysis

Looking at the constraint solver again (Lines 879-886):

```javascript
console.log(`[WOMBAT] Shed roof solved from area constraint:`);
console.log(`  Ridge length: ${ridgeLength.toFixed(2)} m (LONG dimension)`);
console.log(`  Slope span: ${slopeSpan.toFixed(2)} m (SHORT dimension - slope drops across this)`);
```

**From constraint solver**: "Slope drops across SHORT dimension" (13.55m)

**From 3D node generation** (Lines 987-995): Slope runs in **Y direction** (the extrusion direction)

**After our proposed fix**:
- Extrusion direction = LONG (81.27m) along Y-axis
- Slope in Y direction = slope across 81.27m ❌ **WRONG!**

**The slope should drop across SHORT (13.55m), but with our fix it would drop across LONG (81.27m).**

This means the 3D node generation logic (Lines 987-995) needs to be updated to put the slope in the **X direction** (profile direction) instead of the **Y direction** (extrusion direction) after we swap the parameters.

OR... we need a different approach entirely.

---

## Alternative: The Real Problem

Maybe the issue isn't with shed OR gable - maybe it's that we need to **rotate the entire coordinate system** based on aspect ratio?

**User's actual requirement**:
- Positive aspect: Building should run North-South (Y-dominant)
- Negative aspect: Building should run East-West (X-dominant)

**Current mapping from aspect ratio** (Lines 1077-1078):
```javascript
const width = Math.sqrt(footprintArea / aspectRatio);  // X-axis
const length = footprintArea / width;                   // Y-axis
```

For positive aspect (+5.0):
- `width = 13.55m` (SHORT) → X-axis
- `length = 81.27m` (LONG) → Y-axis
- Result: **Y-dominant** (North-South) ✅ This is CORRECT

So the aspect ratio calculation already produces the right axis assignment!

**The problem**: Gable uses it correctly, shed swaps it.

**Conclusion**: My original fix IS correct - swap shed parameters to match gable. But we also need to fix the slope direction in the 3D node generation.

Let me document the complete fix...

---

## Complete Fix (Updated)

### Code Changes Required

**1. Fix shed profile parameter (Line 1224)**
```javascript
// Swap longDimension → shortDimension
profile2D = buildShed2DProfile(shortDimension, wallHeight, roofResult.roofHeight);
```

**2. Fix shed extrusion depth (Line 1240)**
```javascript
// Swap shortDimension → longDimension
extrusionDepth = longDimension;
```

**3. Fix shed eave node generation (Lines 987-995)**

Current logic puts slope in **Y direction** (extrusion):
```javascript
if (profile2D.type === "shed") {
  nodes.eave = [
    { x: -halfWidth, y: -halfDepth, z: profile2D.wallHeight },      // Front (low)
    { x: halfWidth, y: -halfDepth, z: profile2D.wallHeight },       // Front (low)
    { x: halfWidth, y: halfDepth, z: profile2D.tallWallHeight },    // Back (high)
    { x: -halfWidth, y: halfDepth, z: profile2D.tallWallHeight },   // Back (high)
  ];
}
```

After parameter swap, this needs to put slope in **X direction** (profile):
```javascript
if (profile2D.type === "shed") {
  nodes.eave = [
    { x: -halfWidth, y: -halfDepth, z: profile2D.wallHeight },      // Left (low)
    { x: halfWidth, y: -halfDepth, z: profile2D.tallWallHeight },   // Right (high)
    { x: halfWidth, y: halfDepth, z: profile2D.tallWallHeight },    // Right (high)
    { x: -halfWidth, y: halfDepth, z: profile2D.wallHeight },       // Left (low)
  ];
}
```

Slope now runs from `-halfWidth` (low eave) to `+halfWidth` (high eave) in the **X direction** ✅

**4. Update documentation comments** (Lines 945-946, 1222-1223, 1237)

---

## Impact Analysis

### Files Affected
1. **[Section19.js:1224](../../../src/sections/Section19.js#L1224)** - Fix shed profile parameter (longDim → shortDim)
2. **[Section19.js:1240](../../../src/sections/Section19.js#L1240)** - Fix shed extrusion depth (shortDim → longDim)
3. **[Section19.js:987-995](../../../src/sections/Section19.js#L987-L995)** - Fix shed eave slope direction (Y → X)
4. **[Section19.js:945-946](../../../src/sections/Section19.js#L945-L946)** - Update buildShed2DProfile() docs
5. **[Section19.js:1222-1223, 1237](../../../src/sections/Section19.js#L1222-L1223)** - Update inline comments

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
- Slope span (SHORT dimension) ✅

**This is purely an axis mapping fix - no constraint math changes.**

---

## Testing Checklist

After fix:
- [ ] Positive aspect (+5.0): Both shed and gable run **North-South** (Y-dominant, long axis vertical)
- [ ] Negative aspect (-5.0): Both shed and gable run **East-West** (X-dominant, long axis horizontal)
- [ ] Zero aspect (0): Both shed and gable are **square** (symmetric)
- [ ] Shed roof slope runs across **SHORT dimension** (13.55m in X direction)
- [ ] Gable roof ridge runs along **LONG dimension** (81.27m in Y direction)
- [ ] Coordinate axes indicator shows same orientation for both roof types
- [ ] Legend dimensions match visual orientation
- [ ] Roof area constraint still satisfied (no change)
- [ ] Volume constraint still satisfied (no change)
- [ ] End wall areas still correct (no change)

---

## Conclusion

**Bug confirmed**: Shed and gable roofs map dimensions to X/Y axes inconsistently, causing 90° rotation when switching roof types.

**Root cause**: Shed uses (profile=LONG, extrude=SHORT) while gable uses (profile=SHORT, extrude=LONG), resulting in swapped axis assignments.

**Fix**: Make shed match gable's axis mapping:
1. Change shed profile width: `longDimension` → `shortDimension`
2. Change shed extrusion depth: `shortDimension` → `longDimension`
3. Change shed eave slope direction: Y-axis → X-axis (in 3D node generation)

**Scope**: Rendering bug only (Phase 4) - constraint solving (Phases 1-3) is already correct.

**Safety**: No risk to sacred constraints - only affects 3D visualization coordinates.

**Result**: Roof type selection will NOT affect building orientation - only aspect ratio slider controls orientation.
