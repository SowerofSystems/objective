# Dual Polyhedra Refactoring Plan
**Objective:** Eliminate redundant geometry definitions for dual polyhedra by deriving them from base polyhedra using RT-pure transformations.

## Problem Statement

Currently, `rt-polyhedra.js` contains verbose, duplicate geometry definitions for dual polyhedra:

- **`dualTetrahedron()`** (lines 131-166): 35+ lines defining vertices, edges, faces independently
- **`dualIcosahedron()`** (lines 385-543): 160+ lines with redundant vertex/edge/face topology

This violates DRY principle and creates maintenance burden. Changes to base polyhedra don't propagate to duals, and geodesic subdivision features aren't inherited.

## Geometric Relationships

### Dual Tetrahedron
**Transformation:** Inversion (180° rotation)
- **Operation:** Multiply all vertices by -1
- **Face Winding:** Reverse to maintain outward normals
- **Scale:** Identical to base (halfSize remains unchanged)
- **Code:**
```javascript
dualTetrahedron: (halfSize = 1) => {
  const base = Polyhedra.tetrahedron(halfSize);
  const vertices = base.vertices.map(v => v.clone().multiplyScalar(-1));
  const faces = base.faces.map(face => [...face].reverse());
  return { vertices, edges: base.edges, faces };
}
```

**Mathematical Verification:**
- Base vertex: `(-s, -s, -s)` → Dual vertex: `(s, s, s)` ✓
- Base vertex: `(s, s, -s)` → Dual vertex: `(-s, -s, s)` ✓
- Edge quadrance: Q = 8s² (preserved under inversion)

### Dual Icosahedron
**Transformation:** Scale + Z-axis rotation (90° clockwise)
- **Scale Factor:** φ (golden ratio) to align with dodecahedron face centers
- **Rotation:** -90° around Z-axis (clockwise when viewed from +Z)
- **RT Purity:** Uses **exact integer spread values** (s=1, c=0)
- **Code:**
```javascript
dualIcosahedron: (halfSize = 1) => {
  const phi = RT.Phi.value(); // (1 + √5)/2
  const dualRadius = phi * halfSize; // Scale to dodecahedron face radius

  // Get base icosahedron at dual scale
  const base = Polyhedra.icosahedron(dualRadius);

  // Apply RT-pure Z-rotation: -90° → (x,y,z) → (y,-x,z)
  // Spread s = sin²(-π/2) = 1 (exact integer!)
  // Cross c = cos²(-π/2) = 0 (exact integer!)
  const vertices = base.vertices.map(v =>
    new THREE.Vector3(v.y, -v.x, v.z)
  );

  return { vertices, edges: base.edges, faces: base.faces };
}
```

**Mathematical Verification:**
- Rotation matrix: R_z(-π/2) = `[[0, 1, 0], [-1, 0, 0], [0, 0, 1]]`
- Pure integer transformation (only 0, 1, -1 multiplication)
- No transcendental functions - optimal RT approach
- Face winding preserved (rotation maintains handedness)

## Color Scheme

**Important:** Dual polyhedra should use the **same complementary color** as their base polyhedra's geodesic subdivisions.

- **Base Polyhedra:** Primary color for solid faces
- **Geodesic Subdivisions:** Complementary color (exact complement)
- **Dual Polyhedra:** Use the same complementary color as geodesic subdivisions

This creates visual consistency where:
- Base polyhedra and their geodesic versions share a color relationship
- Dual polyhedra visually connect to the geodesic aesthetic
- Color distinguishes base (primary) from dual (complementary)

### Example Color Relationships
- Base Tetrahedron: Primary color
- Geodesic Tetrahedron: Complementary color
- Dual Tetrahedron: Same complementary color as geodesic

This approach ensures that when displaying base + dual together (e.g., stella octangula), the color scheme maintains the established geodesic visual language.

## Benefits of Refactoring

1. **DRY Principle:** Single source of truth for geometry
2. **Geodesic Inheritance:** Dual polyhedra automatically support frequency subdivision
3. **Maintenance:** Fix base → dual updates automatically
4. **RT Purity:** Dual icosa uses exact integer spread (s=1, c=0)
5. **Code Reduction:**
   - Dual tetrahedron: 35 lines → 4 lines (88% reduction)
   - Dual icosahedron: 160 lines → 12 lines (92% reduction)
6. **Consistency:** Duals always perfectly aligned with base polyhedra
7. **Feature Parity:** Both base and dual can be geodesic-subdivided with identical UI controls
8. **Color Harmony:** Dual polyhedra automatically use complementary colors matching geodesic subdivisions

## Implementation Steps

### Phase 1: Dual Tetrahedron (Simple - Inversion)
1. ✅ Verify geometric relationship (inversion + face reversal)
2. Replace verbose implementation with 4-line inversion
3. Test with all edge cases (halfSize variations)
4. Verify RT edge quadrance validation still passes
5. Commit: "Refactor: Derive dualTetrahedron from base via inversion"

### Phase 2: Dual Icosahedron (RT-Pure Rotation)
1. ✅ Verify geometric relationship (φ-scale + Z-rotation)
2. Replace verbose implementation with scale + rotation
3. Preserve RT-pure integer spread approach (s=1, c=0)
4. Test alignment with dodecahedron face centers
5. Verify RT edge quadrance validation at dual radius
6. Commit: "Refactor: Derive dualIcosahedron from base via RT-pure rotation"

### Phase 3: Documentation & Testing
1. Update code comments to reference base polyhedra
2. Update README.md with architectural notes
3. Test geodesic subdivision on dual polyhedra (verify inheritance)
4. Verify stella octangula display (overlapping dual tetrahedra)
5. Verify icosa/dodeca dual relationship preservation

## RT Mathematical Details

### Dual Tetrahedron Spread Analysis
- **Rotation Angle:** θ = 180°
- **Spread:** s = sin²(180°) = 0²  = 0
- **Cross:** c = cos²(180°) = (-1)² = 1
- **Transform:** Equivalent to scalar multiplication by -1

### Dual Icosahedron Spread Analysis (Gold Standard!)
- **Rotation Angle:** θ = -90° (clockwise around Z)
- **Spread:** s = sin²(-π/2) = (-1)² = **1** (exact integer!)
- **Cross:** c = cos²(-π/2) = 0² = **0** (exact integer!)
- **Transform:** (x, y, z) → (y, -x, z) using only {-1, 0, 1}
- **RT Purity:** No transcendental functions - pure algebraic transformation

This represents the **optimal RT approach**: when angles are multiples of 90°, spread and cross collapse to exact integers, eliminating ALL irrational operations.

## Dependencies

### Required Modules
- `rt-polyhedra.js`: Source file for refactoring
- `rt-math.js`: RT.Phi.value() for golden ratio calculation

### Testing Requirements
- Edge quadrance validation must pass for all duals
- Stella octangula visualization (dual tetrahedra) must render correctly
- Icosa/dodeca dual alignment must be preserved
- Geodesic subdivision must work on dual polyhedra

## Future Work

After completing dual refactoring, this DRY approach enables:

1. **Tetrahedral Arrowheads for WXYZ Basis Vectors** (TODO 8.4.2)
   - Use refactored `dualTetrahedron()` geometry for WXYZ arrowheads
   - Each dual tetrahedron vertex points along a WXYZ axis direction
   - Scale appropriately to function as basis vector arrowhead
   - Distinguish WXYZ (tetrahedral) from XYZ (pentagonal cones)

   **Implementation Note:** For basis vector arrowheads, we need **static geometry only** (no geodesic subdivision complexity). The refactored dual functions should:
   - Return base geometry by default (frequency = 0 or undefined)
   - Only apply geodesic subdivision when explicitly requested
   - This keeps arrowhead implementation simple while preserving geodesic capability for polyhedra display

   **Recommendation:** Maintain dual implementations without automatic geodesic inheritance for arrowhead use case. The DRY refactoring still provides benefits (single source geometry, consistent alignment) while avoiding unnecessary complexity for simple arrowhead rendering.

2. **Other Dual Polyhedra**
   - Dual octahedron (cube) - already implemented as separate primitives
   - Dual cuboctahedron → rhombic dodecahedron (future)
   - Dual icosidodecahedron → rhombic triacontahedron (future)

## Success Criteria

- ✅ Dual tetrahedron derives from base with 4 lines
- ✅ Dual icosahedron derives from base with 12 lines
- ✅ RT edge quadrance validation passes for all duals
- ✅ Geodesic subdivision works on dual polyhedra
- ✅ Stella octangula renders correctly
- ✅ No visual or geometric regressions
- ✅ Code reduction: ~200 lines → ~16 lines (92% reduction)

---

**Status:** Ready for implementation
**Priority:** High (architectural improvement, enables future features)
**Estimated Complexity:** Low (pure refactoring, no new features)
