# Basis Vector Systems - Technical Reference

## Overview

The ART Explorer has **4 distinct basis vector systems** serving different purposes:

1. **Symbolic Quadray Basis (WXYZ)** - Tetrahedral coordinate reference
2. **Symbolic Cartesian Basis (XYZ)** - Orthogonal coordinate reference
3. **Editing Quadray Basis (WXYZ)** - Interactive gumball handles
4. **Editing Cartesian Basis (XYZ)** - Interactive gumball handles

## System Comparison

| System | File | Purpose | Interactive | Visibility | Visual Style |
|--------|------|---------|-------------|------------|--------------|
| Symbolic WXYZ | rt-rendering.js | Coordinate reference | No | Toggle via UI checkbox | Tetrahedral arrowheads |
| Symbolic XYZ | rt-rendering.js | Coordinate reference | No | Toggle via UI checkbox | Conical arrowheads (THREE.ArrowHelper) |
| Editing WXYZ | rt-init.js | Transform handles | Yes | Appears when Form selected | Conical arrowheads + hexagonal rotation handles |
| Editing XYZ | rt-init.js | Transform handles | Yes | Appears when Form selected | Conical arrowheads + circular rotation handles |

## Historical Context

### Pre-Branch Behavior (Working Correctly)
Before the `Basis-Vector-Symbols` branch:
- ✅ Symbolic basis vectors scaled with geometry sliders
- ✅ Editing basis vectors scaled with geometry sliders
- ✅ All basis vectors reached grid intersections at all scales
- ✅ WXYZ vectors used standard THREE.ArrowHelper (conical heads)

### Branch Goal
Align Quadray (WXYZ) basis vectors to grid intervals using `RT.PureRadicals.QUADRAY_GRID_INTERVAL * 3`

### Issues Introduced
1. ❌ Symbolic WXYZ basis now FIXED at 3x grid intervals (no scaling)
2. ❌ Cartesian basis vectors don't reach grid intersections
3. ❌ Lost dynamic scaling relationship with geometry
4. ✅ Successfully introduced tetrahedral arrowheads for WXYZ distinction

## Grid Interval Mathematics

### Quadray Grid Interval (WXYZ)
```javascript
// RT.PureRadicals.QUADRAY_GRID_INTERVAL
// √6/4 ≈ 0.6123724356957945
// For a unit tetrahedron: centroid-to-vertex distance

// 3x grid intervals for visibility + alignment:
const totalBasisLength = RT.PureRadicals.QUADRAY_GRID_INTERVAL * 3; // ≈ 1.837
```

**Tetrahedral Arrowhead Geometry:**
- Dual tetrahedron vertices at `(±s, ±s, ±s)` where s = headSize
- Tip extends `headSize * √3` from center
- Shaft length calculation:
  ```javascript
  const headSize = 0.15;
  const headTipExtension = headSize * Math.sqrt(3); // ≈ 0.260
  const shaftLength = totalBasisLength - headTipExtension; // ≈ 1.577
  // Arrow tip reaches exactly: 1.577 + 0.260 = 1.837 ✓
  ```

### Cartesian Grid Interval (XYZ)
```javascript
// Cube edge length defines grid spacing
// Default: cubeEdge = 2.0
// Grid lines at integer intervals

// Current issue: Arrows don't reach grid intersections
// Need to align with cube edge length scaling
```

## Desired Behavior

### Symbolic Basis Vectors
**Option A: Fixed Length (Current)**
- Remain constant size regardless of geometry scale
- Always visible coordinate reference at fixed 3x grid intervals
- ⚠️ May appear too small/large relative to scaled geometry

**Option B: Dynamic Scaling (Pre-Branch)**
- Scale proportionally with geometry sliders
- Maintain alignment with grid intersections at all scales
- ✅ Consistent visual relationship with geometry

### Editing Basis Vectors (Gumball)
- **MUST scale with geometry** for effective interaction
- Handle size should match form size for usability
- Different scaling per coordinate system:
  - WXYZ: Scale with `tetEdge` slider
  - XYZ: Scale with `cubeEdge` slider

## Code Locations

### Symbolic Basis Creation
**File:** `src/geometry/modules/rt-rendering.js`

**Quadray (WXYZ):**
- Function: `createQuadrayBasis()` (lines ~430-470)
- Length: `RT.PureRadicals.QUADRAY_GRID_INTERVAL * 3`
- Arrowheads: Custom tetrahedral via `createTetrahedralArrow()`
- Scaling: Currently REMOVED (commented out at line ~1773)

**Cartesian (XYZ):**
- Function: `createCartesianBasis()` (lines ~270-340)
- Length: Needs investigation for grid alignment
- Arrowheads: THREE.ArrowHelper (conical)
- Scaling: Active via `cartesianBasis.scale.set(cubeEdge, ...)` (line ~1768)

### Editing Basis Creation
**File:** `src/geometry/modules/rt-init.js`

**Function:** `createEditingBasis(position, selectedObject)` (lines ~1507-1830)

**Current Implementation:**
```javascript
const quadrayArrowLength = RT.PureRadicals.QUADRAY_GRID_INTERVAL * 3; // Fixed
const cartesianArrowLength = tetEdge; // Slider-based
```

## Solution Strategy

### Step 1: Document (Complete)
Create this reference document explaining all 4 systems.

### Step 2: Revert Branch
```bash
git stash  # Save Basis-Vector-Symbols.md
git reset --hard 65af6b2  # Before branch changes
git stash pop  # Restore documentation
```

### Step 3: Incremental Implementation
Implement changes carefully without breaking scaling:

1. **Add tetrahedral arrowheads** to symbolic WXYZ basis
   - Keep existing scaling behavior
   - Use `createTetrahedralArrow()` function

2. **Align WXYZ to grid intervals**
   - Calculate correct base length that reaches grid when scaled
   - Test at multiple scale values

3. **Align XYZ to grid intervals**
   - Investigate current grid spacing
   - Calculate correct base length

4. **Preserve scaling relationship**
   - Ensure `quadrayBasis.scale.set()` remains active
   - Ensure `cartesianBasis.scale.set()` remains active

### Step 4: Test All Scales
- Test cube edge: 0.5, 1.0, 2.0, 4.0
- Test tet edge: 1.0, 2.0, 2.828, 4.0
- Verify grid alignment at each scale
- Verify editing basis scales correctly

## Key Insights from Branch Work

### Success: Tetrahedral Tip Extension Math
```javascript
// Dual tetrahedron vertices at (±s, ±s, ±s)
// Distance from center: s * √3
const headTipExtension = headSize * Math.sqrt(3);
const shaftLength = totalLength - headTipExtension;
// This calculation is CORRECT and should be preserved
```

### Success: Grid Interval Constant
```javascript
RT.PureRadicals.QUADRAY_GRID_INTERVAL = Math.sqrt(6) / 4;
// This is the correct fundamental unit for tetrahedral grid
```

### Issue: Removed Scaling
The line that was commented out was CRITICAL:
```javascript
// This should NOT have been removed:
if (quadrayBasis) {
  quadrayBasis.scale.set(
    tetEdge / (2 * Math.sqrt(2)),
    tetEdge / (2 * Math.sqrt(2)),
    tetEdge / (2 * Math.sqrt(2))
  );
}
```

Instead, we need to calculate the BASE length that, when scaled by this factor, reaches exactly 3x grid intervals.

## Correct Implementation Formula

### Quadray Basis (WXYZ)
```javascript
// What we want: Arrow tip at 3x grid intervals AFTER scaling
const targetLength = RT.PureRadicals.QUADRAY_GRID_INTERVAL * 3; // ≈ 1.837

// Scaling factor applied by updateGeometry():
const scaleFactor = tetEdge / (2 * Math.sqrt(2));

// Base length BEFORE scaling:
const baseLength = targetLength / scaleFactor;

// Then scaling will bring it to exactly targetLength:
// baseLength * scaleFactor = targetLength ✓
```

### Cartesian Basis (XYZ)
```javascript
// What we want: Arrow tip at cube edge AFTER scaling
const targetLength = cubeEdge; // or multiple thereof for visibility

// Scaling factor applied by updateGeometry():
const scaleFactor = cubeEdge;

// Base length BEFORE scaling:
const baseLength = targetLength / scaleFactor;
// For unit multiplier: baseLength = 1.0
```

## Next Steps

1. ✅ Documentation complete
2. ⏳ Stash documentation
3. ⏳ Revert to pre-branch state
4. ⏳ Re-implement with correct scaling-aware calculations
5. ⏳ Test at multiple scales
6. ⏳ Commit with clean history

## References

- **rt-math.js**: PureRadicals constants
- **rt-polyhedra.js**: Dual tetrahedron geometry (line 141)
- **rt-rendering.js**: Symbolic basis creation & updateGeometry()
- **rt-init.js**: Editing basis (gumball) creation

---

*Document created during `Basis-Vector-Symbols` branch to explain the complexity before reverting and re-implementing correctly.*
