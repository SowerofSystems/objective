# Z-Up Coordinate System Refactor - ARTexplorer

## Executive Summary

**Objective:** Convert ARTexplorer from Three.js default Y-up convention to industry-standard Z-up convention (CAD/BIM/Architecture).

**Rationale:**
- Prepare for glTF, GXF, DWG export formats (all expect Z-up)
- Align with architectural/BIM workflows
- Industry standard for building geometry visualization
- Better now (Phase 2.9) than after Phase 3+ 4D projections

**Status:** Planning (Pre-implementation)

**Estimated Effort:** 2-3 hours comprehensive refactor

---

## Current State (Y-Up Convention)

### Three.js Default Coordinate System:
```
Y+ = Up (vertical)
X+ = Right (horizontal)
Z+ = Toward viewer (depth)
```

### Affected Components:
1. ✅ All polyhedra vertex generators (12 polyhedra)
2. ✅ Geodesic subdivision algorithms (tetrahedron, octahedron, icosahedron)
3. ✅ Quadray basis vectors (tetrahedral symmetry)
4. ✅ Camera setup and OrbitControls
5. ✅ Cartesian grid planes (XY, XZ, YZ)
6. ✅ Axes helper visualization
7. ✅ RT validation and console logging

---

## Target State (Z-Up Convention)

### CAD/BIM Standard Coordinate System:
```
Z+ = Up (vertical)
X+ = Right (horizontal)
Y+ = Away from viewer (depth)
```

### Coordinate Transformation:
```javascript
// Current Y-up → Target Z-up
(x, y, z)_yup = (x, z, -y)_zup

// Example:
(1, 2, 3)_yup → (1, 3, -2)_zup
```

---

## Implementation Plan

### Phase 1: Scene-Level Infrastructure (30 min)

**1.1 Camera Setup**
- Current: Camera looks down -Z axis, Y-up
- Target: Camera looks down -Y axis, Z-up
- File: `ARTexplorer.html` (~line 1640)

```javascript
// BEFORE (Y-up)
camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// AFTER (Z-up)
camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
camera.position.set(5, -5, 5);  // Swap Y↔Z, negate new Y
camera.up.set(0, 0, 1);         // Tell camera Z is up
camera.lookAt(0, 0, 0);
```

**1.2 OrbitControls**
- File: `ARTexplorer.html` (~line 1650)
- OrbitControls automatically respect `camera.up` vector
- Should work after camera.up change

**1.3 Axes Helper**
- Current: Red=X+, Green=Y+, Blue=Z+
- Target: Red=X+, Green=Y+, Blue=Z+ (same colors, Z now vertical)
- No code change needed (orientation follows camera.up)

**1.4 Cartesian Grid Planes**
- File: `createCartesianGrid()` (~line 1698)

```javascript
// BEFORE (Y-up)
// XY plane (z=0) - horizontal
gridXY.rotation.x = Math.PI / 2;

// XZ plane (y=0) - vertical front
// (no rotation)

// YZ plane (x=0) - vertical side
gridYZ.rotation.z = Math.PI / 2;

// AFTER (Z-up)
// XY plane (z=0) - vertical front (was horizontal)
// (no rotation)

// XZ plane (y=0) - horizontal (was vertical)
gridXZ.rotation.x = Math.PI / 2;

// YZ plane (x=0) - vertical side (same)
gridYZ.rotation.z = Math.PI / 2;
```

**1.5 UI Labels**
- Update plane labels to reflect new orientations:
  - XY Plane (vertical front)
  - XZ Plane (horizontal)
  - YZ Plane (vertical side)

---

### Phase 2: Polyhedra Vertex Generators (60 min)

**Strategy:** Create coordinate transform helper, apply to all vertices

**2.1 Add Coordinate Transform Helper**
```javascript
// Add to RT library section
const CoordinateSystem = {
  /**
   * Convert Y-up coordinates to Z-up (CAD/BIM standard)
   * Transformation: (x, y, z)_yup → (x, z, -y)_zup
   */
  yUpToZUp: (vec) => {
    return new THREE.Vector3(vec.x, vec.z, -vec.y);
  },

  /**
   * Apply Z-up transform to array of vertices
   */
  transformVertices: (vertices) => {
    return vertices.map(v => CoordinateSystem.yUpToZUp(v));
  }
};
```

**2.2 Update All Polyhedra Generators**

Each polyhedron function follows this pattern:

```javascript
// BEFORE
cube: (halfSize = 1) => {
  const vertices = [
    new THREE.Vector3(-s, -s, -s), // vertex 0
    new THREE.Vector3( s, -s, -s), // vertex 1
    // ... etc
  ];
  return { vertices, edges, faces };
}

// AFTER
cube: (halfSize = 1) => {
  // Original Y-up vertices (keep for clarity)
  const verticesYUp = [
    new THREE.Vector3(-s, -s, -s), // vertex 0
    new THREE.Vector3( s, -s, -s), // vertex 1
    // ... etc
  ];

  // Transform to Z-up
  const vertices = CoordinateSystem.transformVertices(verticesYUp);

  return { vertices, edges, faces };
}
```

**Polyhedra to Update:**
1. `cube()` - 8 vertices
2. `tetrahedron()` - 4 vertices
3. `octahedron()` - 6 vertices
4. `icosahedron()` - 12 vertices
5. `dodecahedron()` - 20 vertices
6. `dualTetrahedron()` - 4 vertices
7. `dualOctahedron()` - 8 vertices (cube)
8. `dualIcosahedron()` - 12 vertices
9. `rhombicDodecahedron()` - 14 vertices
10. `geodesicIcosahedron()` - uses base icosahedron
11. `geodesicOctahedron()` - uses base octahedron
12. `geodesicTetrahedron()` - uses base tetrahedron

**Files:** `ARTexplorer.html` Polyhedra object (~lines 550-1400)

---

### Phase 3: Quadray Basis Vectors (30 min)

**3.1 Update Quadray Basis**
- File: `ARTexplorer.html` Quadray object (~line 470)

Current Quadray basis (Y-up):
```javascript
const sqrt3 = Math.sqrt(3);
basisVectors: [
  new THREE.Vector3( 1,  1,  1).normalize(), // A (W)
  new THREE.Vector3( 1, -1, -1).normalize(), // B (X)
  new THREE.Vector3(-1,  1, -1).normalize(), // C (Y)
  new THREE.Vector3(-1, -1,  1).normalize(), // D (Z)
]
```

Transform to Z-up:
```javascript
// Apply (x,y,z)_yup → (x,z,-y)_zup
basisVectors: [
  new THREE.Vector3( 1,  1, -1).normalize(), // A (W) - was (1,1,1)
  new THREE.Vector3( 1, -1,  1).normalize(), // B (X) - was (1,-1,-1)
  new THREE.Vector3(-1, -1, -1).normalize(), // C (Y) - was (-1,1,-1)
  new THREE.Vector3(-1,  1,  1).normalize(), // D (Z) - was (-1,-1,1)
]
```

**3.2 Verify Tetrahedral Symmetry**
- Ensure basis vectors still point to cube vertices
- Maintain 109.47° angles between vectors
- Update console validation logging

---

### Phase 4: RT Validation & Logging (15 min)

**4.1 Console Log Updates**
Update coordinate references in logging:
- "XY plane" → context-appropriate labels
- Quadrance validation messages (coordinate-agnostic, no change needed)
- Edge validation (coordinate-agnostic, no change needed)

**4.2 Visual Validation**
After refactor, verify:
- [ ] Cube appears square from all angles
- [ ] Tetrahedron inscribed in cube correctly
- [ ] Octahedron dual of cube aligns
- [ ] Icosahedron/dodecahedron nested correctly
- [ ] Geodesic subdivisions uniform
- [ ] Quadray basis forms proper tetrahedron
- [ ] Grid planes labeled correctly

---

### Phase 5: Documentation Updates (15 min)

**5.1 Update ARTexplorer.md**
- Add coordinate system section
- Document Z-up convention choice
- Update any Y-up references

**5.2 Code Comments**
- Update inline comments referencing "horizontal" / "vertical"
- Add Z-up convention note to file header
- Update Quadray basis documentation

**5.3 Update This Document**
- Mark implementation status
- Add "Completed" timestamp
- Document any issues encountered

---

## Testing Checklist

### Visual Tests (All Required):
- [ ] **Camera controls**: Orbit, pan, zoom work naturally
- [ ] **Grid planes**: XZ horizontal, XY/YZ vertical
- [ ] **Cube**: Appears square from orthogonal views
- [ ] **Tetrahedron**: Inscribed in cube, vertices at cube vertices
- [ ] **Octahedron**: Dual of cube, face centers at cube vertices
- [ ] **Icosahedron**: Proper orientation, pentagonal symmetry visible
- [ ] **Dodecahedron**: Nested in icosahedron correctly
- [ ] **Geodesics (all)**: Uniform subdivision, proper sphere projection
- [ ] **Quadray basis**: 4 arrows form tetrahedral pattern
- [ ] **Node rendering**: Vertices appear at correct positions
- [ ] **Face rendering**: Transparency and culling work correctly

### RT Purity Tests (Console Validation):
- [ ] **Edge quadrances**: All polyhedra show correct Q values
- [ ] **Quadrance uniformity**: Geodesics maintain edge uniformity
- [ ] **Basis angles**: Quadray vectors maintain 109.47° spreads
- [ ] **Nesting ratios**: Icosa/dodeca radii match expected ratios

### Functional Tests:
- [ ] **Scale slider**: All polyhedra scale uniformly
- [ ] **Opacity slider**: Faces fade correctly
- [ ] **Node size buttons**: Vertices resize properly
- [ ] **Plane toggles**: Each grid plane shows/hides independently
- [ ] **Polyhedra toggles**: Each solid shows/hides independently
- [ ] **Geodesic options**: Frequency and projection work correctly

---

## Implementation Sequence

### Recommended Order:
1. **Phase 1**: Scene infrastructure (camera, grids, labels)
   - Test: Can orbit naturally, Z appears vertical
2. **Phase 2**: Simple polyhedra first (cube, tetrahedron, octahedron)
   - Test: Basic solids render correctly
3. **Phase 2**: Complex polyhedra (icosa, dodeca, rhombic)
   - Test: Golden ratio relationships preserved
4. **Phase 2**: Geodesics (use transformed base polyhedra)
   - Test: Subdivisions uniform, projections correct
5. **Phase 3**: Quadray basis
   - Test: Tetrahedral symmetry maintained
6. **Phase 4**: Validation & logging
   - Test: Console shows correct values
7. **Phase 5**: Documentation
   - Test: Comments accurate, workplan updated

---

## Alternative Approaches Considered

### Approach A: Scene-Level Rotation Transform
**Pros:**
- Minimal code changes (rotate entire scene)
- Polyhedra code unchanged
- Quick implementation (15 min)

**Cons:**
- Internal coords still Y-up (confusing for future work)
- Export functions would need reverse transform
- Not truly Z-up, just appears that way
- Technical debt for future features

**Verdict:** ❌ Rejected - creates confusion for CAD export

### Approach B: Full Coordinate Refactor (Selected)
**Pros:**
- True Z-up throughout codebase
- Clean export to glTF/DWG/GXF
- Consistent with industry standards
- Clear code for future developers

**Cons:**
- Requires touching every polyhedron
- More time investment (2-3 hours)
- Risk of coordinate errors

**Verdict:** ✅ Selected - proper solution for professional tool

### Approach C: Dual Convention Support
**Pros:**
- Flexibility for different export formats
- Could switch on demand

**Cons:**
- Complexity overhead
- Confusing for maintenance
- Unnecessary for single-use case

**Verdict:** ❌ Rejected - overengineered

---

## Risk Assessment

### Low Risk:
- ✅ RT math is coordinate-agnostic (quadrance doesn't care)
- ✅ Transformation is well-defined: (x,y,z) → (x,z,-y)
- ✅ Can validate visually and with console logs
- ✅ Git allows easy rollback if issues arise

### Medium Risk:
- ⚠️ Quadray basis transformation (requires careful verification)
- ⚠️ Grid plane orientations (labels must match reality)
- ⚠️ Camera controls (must feel natural after change)

### Mitigation:
- Test each polyhedron individually after transformation
- Use console.log to verify quadrances unchanged
- Visual inspection against current Y-up version
- Keep Y-up version in separate branch for comparison

---

## Future Implications

### Enables:
- ✅ glTF export (industry-standard 3D format)
- ✅ DWG export (AutoCAD compatibility)
- ✅ GXF export (GIS compatibility)
- ✅ BIM integration (Revit, ArchiCAD workflows)
- ✅ Consistent with architectural visualization tools

### Maintains:
- ✅ All RT purity principles (coordinate-independent)
- ✅ Geodesic subdivision algorithms (topology unchanged)
- ✅ Phase 2.8 Quadray planar projection (adapt naturally)
- ✅ Phase 3+ 4D projections (coordinate choice orthogonal)

---

## Success Criteria

**Definition of Done:**
1. All 12 polyhedra render identically to Y-up version (rotated 90°)
2. All RT console validations pass (quadrances unchanged)
3. Camera controls feel natural (Z visually vertical)
4. Grid planes labeled correctly for Z-up
5. Quadray basis maintains tetrahedral symmetry
6. All geodesic features work correctly
7. Documentation updated
8. Code committed with passing tests

**Acceptance Test:**
Side-by-side comparison of Y-up (current) vs Z-up (refactored):
- Same visual appearance when viewed from equivalent angles
- Same edge quadrances in console logs
- Same geodesic subdivision counts
- Intuitive camera controls (Z-up feels "right" for architecture)

---

## Timeline Estimate

### Conservative (First Time):
- Phase 1: 30 min (scene setup)
- Phase 2: 90 min (12 polyhedra + testing each)
- Phase 3: 30 min (Quadray basis)
- Phase 4: 15 min (logging)
- Phase 5: 15 min (docs)
- **Total: ~3 hours**

### Optimistic (If Smooth):
- Phase 1: 20 min
- Phase 2: 60 min (batch transform with helper)
- Phase 3: 20 min
- Phase 4: 10 min
- Phase 5: 10 min
- **Total: ~2 hours**

### Realistic Target: **2.5 hours** (afternoon session)

---

## Open Questions

1. **Grid plane defaults**: Which planes visible by default in Z-up?
   - Current (Y-up): XY horizontal (default on)
   - Z-up equivalent: XZ horizontal (should be default?)

2. **Camera starting position**: Best initial view for Z-up?
   - Isometric: (5, -5, 5) - sees XY and XZ planes
   - Top-down: (0, 0, 10) - architectural plan view
   - Front: (0, -10, 5) - elevation view

3. **Quadray labels**: Update W/X/Y/Z labels to match new orientation?
   - Keep current labels (consistent with Quadray literature)
   - Or update to reflect spatial positions in Z-up

4. **Export formats**: Which format to implement first after Z-up?
   - glTF (web standard)
   - DWG (CAD standard)
   - Both?

---

## Post-Implementation

### Add After Completion:
- [ ] Timestamp: YYYY-MM-DD HH:MM
- [ ] Actual time taken: X hours
- [ ] Issues encountered: (list)
- [ ] Deviations from plan: (list)
- [ ] Lessons learned: (notes)
- [ ] Next steps: Export format implementation

---

## References

- **Three.js Coordinate Systems**: https://threejs.org/docs/#manual/en/introduction/Coordinate-systems
- **glTF 2.0 Spec** (Z-up): https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
- **DWG Coordinate Convention**: AutoCAD Z-up standard
- **Wildberger RT**: Coordinate-agnostic (works in any orientation)
- **ARTexplorer.md**: Current documentation

---

**Status:** 📋 Planning Complete - Ready for Implementation
**Next Action:** Begin Phase 1 (Scene Infrastructure) when approved
