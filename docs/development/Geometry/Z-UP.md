# Z-Up Coordinate System - Foundational Refactor

## Executive Summary

**Objective:** Rebuild ARTexplorer from the ground up using native Z-up coordinate convention (CAD/BIM/Architecture standard).

**Approach:** Complete rewrite, NOT transformation layer. All geometry defined with Z as vertical axis from first principles.

**Status:** Planning - Ready for Implementation

---

## Rationale: Why Foundational vs Transformation

### ❌ Transformation Approach (REJECTED)
```javascript
// BAD: Define in Y-up, then transform
const verticesYUp = [new THREE.Vector3(x, y, z), ...];
const vertices = transform(verticesYUp); // (x,y,z) → (x,z,-y)
```
**Problems:**
- Internal coordinates still Y-up (confusing for developers)
- Transformation overhead on every polyhedron
- Grid planes conceptually backwards
- Export requires reverse transform
- Mental model mismatch with CAD tools

### ✅ Foundational Approach (SELECTED)
```javascript
// GOOD: Define natively in Z-up
const vertices = [
  new THREE.Vector3(x, y, z)  // Z is naturally vertical
];
// Camera sees Z as up, geometry is Z-up, grids are Z-up
// Everything aligned from first principles
```
**Benefits:**
- Clear mental model: Z = height everywhere
- No transformation layer needed
- Direct export to glTF/DWG/GXF
- Matches industry tools (Blender, AutoCAD, Revit)
- Future-proof for CAD integration

---

## Coordinate System Definition

### Z-Up Convention (CAD/BIM Standard)
```
X+ = Right (horizontal, east-west)
Y+ = Away from viewer (horizontal, north-south, depth)
Z+ = Up (vertical, elevation)
```

### Three.js Camera Configuration
```javascript
camera.position.set(5, -5, 5);  // Isometric-like view
camera.up.set(0, 0, 1);         // Z is up
camera.lookAt(0, 0, 0);
```

### Grid Planes in Z-Up
- **XY plane (Z=0)**: Horizontal ground plane - DEFAULT VISIBLE
- **XZ plane (Y=0)**: Vertical wall (front elevation)
- **YZ plane (X=0)**: Vertical wall (side elevation)

---

## Implementation Strategy

### Phase 1: Create New File Structure

**File:** `ARTexplorer-ZUP.html` (will become ARTexplorer.html after testing)

**Steps:**
1. Copy ARTexplorer.html → ARTexplorer-ZUP.html
2. Update title/branding to indicate Z-up version
3. Implement changes phase by phase
4. Test thoroughly
5. Replace original when validated

---

## Phase 2: Camera & Scene Setup

### Camera Position
```javascript
// Z-up isometric view
camera.position.set(5, -5, 5);
camera.up.set(0, 0, 1);  // Critical: tells Three.js Z is up
camera.lookAt(0, 0, 0);
```

### Axes Helper
- Red: X+ (right)
- Green: Y+ (away/depth)
- Blue: Z+ (up) ← Should point vertically in view

### Grid Planes
```javascript
// XY plane (Z=0) - HORIZONTAL ground plane
gridXY = new THREE.GridHelper(10, 10);
// GridHelper creates XZ by default, rotate for XY:
gridXY.rotation.x = Math.PI / 2;  // Rotate to horizontal XY
gridXY.visible = true;  // Default visible (ground plane)

// XZ plane (Y=0) - VERTICAL front wall
gridXZ = new THREE.GridHelper(10, 10);
gridXZ.rotation.z = Math.PI / 2;  // Rotate to vertical XZ plane
gridXZ.visible = false;

// YZ plane (X=0) - VERTICAL side wall
gridYZ = new THREE.GridHelper(10, 10);
gridYZ.rotation.x = Math.PI / 2;
gridYZ.rotation.y = Math.PI / 2;
gridYZ.visible = false;
```

---

## Phase 3: Polyhedra - Native Z-Up Definitions

### Cube (Hexahedron)
```javascript
// Z-UP: Bottom 4 vertices at Z=-s, Top 4 vertices at Z=+s
cube: (halfSize = 1) => {
  const s = halfSize;
  const vertices = [
    // Bottom face (Z = -s)
    new THREE.Vector3(-s, -s, -s),  // 0: bottom-back-left
    new THREE.Vector3( s, -s, -s),  // 1: bottom-back-right
    new THREE.Vector3( s,  s, -s),  // 2: bottom-front-right
    new THREE.Vector3(-s,  s, -s),  // 3: bottom-front-left

    // Top face (Z = +s)
    new THREE.Vector3(-s, -s,  s),  // 4: top-back-left
    new THREE.Vector3( s, -s,  s),  // 5: top-back-right
    new THREE.Vector3( s,  s,  s),  // 6: top-front-right
    new THREE.Vector3(-s,  s,  s),  // 7: top-front-left
  ];

  const edges = [
    // Bottom face
    [0, 1], [1, 2], [2, 3], [3, 0],
    // Top face
    [4, 5], [5, 6], [6, 7], [7, 4],
    // Vertical edges (connecting bottom to top)
    [0, 4], [1, 5], [2, 6], [3, 7]
  ];

  const faces = [
    [0, 1, 2, 3],  // Bottom (Z = -s)
    [4, 5, 6, 7],  // Top (Z = +s)
    [0, 1, 5, 4],  // Back (Y = -s)
    [2, 3, 7, 6],  // Front (Y = +s)
    [0, 3, 7, 4],  // Left (X = -s)
    [1, 2, 6, 5]   // Right (X = +s)
  ];

  return { vertices, edges, faces };
}
```

### Tetrahedron (Inscribed in Cube)
```javascript
// Z-UP: Select alternating cube vertices
tetrahedron: (halfSize = 1) => {
  const s = halfSize;
  const vertices = [
    new THREE.Vector3(-s, -s, -s),  // 0: bottom-back-left
    new THREE.Vector3( s,  s, -s),  // 2: bottom-front-right
    new THREE.Vector3( s, -s,  s),  // 5: top-back-right
    new THREE.Vector3(-s,  s,  s),  // 7: top-front-left
  ];
  // ... edges, faces
}
```

### Octahedron (Dual of Cube)
```javascript
// Z-UP: 6 vertices at axis centers
octahedron: (halfSize = 1) => {
  const s = halfSize;
  const vertices = [
    new THREE.Vector3( s,  0,  0),  // Right (+X)
    new THREE.Vector3(-s,  0,  0),  // Left (-X)
    new THREE.Vector3( 0,  s,  0),  // Front (+Y)
    new THREE.Vector3( 0, -s,  0),  // Back (-Y)
    new THREE.Vector3( 0,  0,  s),  // Top (+Z) ← Vertical!
    new THREE.Vector3( 0,  0, -s),  // Bottom (-Z)
  ];
  // ... edges, faces
}
```

### Icosahedron
```javascript
// Z-UP: Three orthogonal golden rectangles
// Rectangles lie in XY, XZ, YZ planes
icosahedron: (halfSize = 1) => {
  const phi = RT.Phi.value();
  const a = halfSize * normFactor;
  const b = halfSize * phi * normFactor;

  const vertices = [
    // XY plane (Z = ±a) - horizontal rectangles
    new THREE.Vector3( b,  0,  a),  new THREE.Vector3( b,  0, -a),
    new THREE.Vector3(-b,  0,  a),  new THREE.Vector3(-b,  0, -a),

    // XZ plane (Y = ±a) - vertical rectangle (front/back)
    new THREE.Vector3( 0,  a,  b),  new THREE.Vector3( 0,  a, -b),
    new THREE.Vector3( 0, -a,  b),  new THREE.Vector3( 0, -a, -b),

    // YZ plane (X = ±a) - vertical rectangle (left/right)
    new THREE.Vector3( a,  b,  0),  new THREE.Vector3( a, -b,  0),
    new THREE.Vector3(-a,  b,  0),  new THREE.Vector3(-a, -b,  0),
  ];
  // ... edges, faces
}
```

### Dodecahedron
```javascript
// Z-UP: 8 cube corners + 12 phi vertices
dodecahedron: (halfSize = 1) => {
  const s = halfSize;
  const phi = RT.Phi.value();
  const invPhi = RT.Phi.inverse();

  const vertices = [
    // 8 cube corners (±s, ±s, ±s)
    new THREE.Vector3( s,  s,  s),  new THREE.Vector3( s,  s, -s),
    new THREE.Vector3( s, -s,  s),  new THREE.Vector3( s, -s, -s),
    new THREE.Vector3(-s,  s,  s),  new THREE.Vector3(-s,  s, -s),
    new THREE.Vector3(-s, -s,  s),  new THREE.Vector3(-s, -s, -s),

    // 12 phi vertices - cyclic permutations of (0, ±invPhi, ±phi)
    // XY plane family (Z = ±a)
    new THREE.Vector3( 0,  s*invPhi,  s*phi),
    new THREE.Vector3( 0,  s*invPhi, -s*phi),
    new THREE.Vector3( 0, -s*invPhi,  s*phi),
    new THREE.Vector3( 0, -s*invPhi, -s*phi),

    // XZ plane family (Y = ±a)
    new THREE.Vector3( s*invPhi,  s*phi,  0),
    new THREE.Vector3( s*invPhi, -s*phi,  0),
    new THREE.Vector3(-s*invPhi,  s*phi,  0),
    new THREE.Vector3(-s*invPhi, -s*phi,  0),

    // YZ plane family (X = ±a)
    new THREE.Vector3( s*phi,  0,  s*invPhi),
    new THREE.Vector3( s*phi,  0, -s*invPhi),
    new THREE.Vector3(-s*phi,  0,  s*invPhi),
    new THREE.Vector3(-s*phi,  0, -s*invPhi),
  ];
  // ... edges, faces
}
```

---

## Phase 4: Quadray Basis Vectors (Z-Up)

```javascript
const Quadray = {
  /**
   * Z-UP: 4 basis vectors pointing to tetrahedral vertices
   * These point to alternating cube corners inscribed in unit cube
   */
  basisVectors: [
    new THREE.Vector3( 1,  1,  1).normalize(),  // A: top-front-right
    new THREE.Vector3( 1, -1, -1).normalize(),  // B: bottom-back-right
    new THREE.Vector3(-1,  1, -1).normalize(),  // C: bottom-front-left
    new THREE.Vector3(-1, -1,  1).normalize(),  // D: top-back-left
  ],
  // ... rest of Quadray implementation
}
```

**Key point:** These are the SAME numeric values as Y-up, but now Z component is vertical!

---

## Phase 5: Geodesic Subdivisions

Geodesic functions will automatically work correctly because they:
1. Call base polyhedra generators (which are now Z-up)
2. Subdivide in algebraic space (coordinate-agnostic)
3. Project to sphere using quadrance (coordinate-agnostic)

**No changes needed** - they inherit Z-up from base polyhedra.

---

## Phase 6: UI Labels & Documentation

### Grid Plane Labels
```javascript
// Update UI labels to match Z-up convention
"XY" → "XY (Ground)"     // Horizontal floor
"XZ" → "XZ (Front Wall)" // Vertical front
"YZ" → "YZ (Side Wall)"  // Vertical side
```

### Console Logging
```javascript
// Update any logs that reference coordinate planes
console.log(`Top vertex at Z = ${topZ}`);  // Not "Y = ..."
console.log(`Ground plane (XY at Z=0)`);   // Not "XZ at Y=0"
```

### Code Comments
- Update all "horizontal"/"vertical" references
- Change "Y-up" comments to "Z-up"
- Update axis descriptions (X=right, Y=depth, Z=up)

---

## Testing Checklist

### Visual Validation
- [ ] Blue axis (Z) points vertically upward
- [ ] XY plane is horizontal (ground)
- [ ] XZ and YZ planes are vertical (walls)
- [ ] Cube edges: 4 vertical, 8 horizontal
- [ ] Tetrahedron: 1 vertex at top, 1 at bottom (Z-aligned)
- [ ] Octahedron: top/bottom vertices on Z-axis
- [ ] Camera controls feel natural (orbit around Z-up)

### RT Validation (Console)
- [ ] All edge quadrances match expected values
- [ ] Cube: Q = 4s² for all 12 edges
- [ ] Tetrahedron: Q = 8s² for all 6 edges
- [ ] Octahedron: Q = 2s² for all 12 edges
- [ ] Icosahedron: Uniform edge quadrance
- [ ] Dodecahedron: Uniform edge quadrance
- [ ] Quadray basis: 109.47° spreads maintained

### Functional Tests
- [ ] Scale slider works
- [ ] Opacity slider works
- [ ] Node size buttons work
- [ ] All plane toggles show/hide correctly
- [ ] All polyhedra toggles work
- [ ] Geodesic frequency controls work
- [ ] Projection options work (In/Mid/Out/Off)

---

## Implementation Timeline

### Session 1: Setup & Camera (30 min)
- Create ARTexplorer-ZUP.html
- Implement Phase 2 (camera, grids, axes)
- Visual test: blue axis up, XY horizontal

### Session 2: Core Polyhedra (60 min)
- Implement cube, tetrahedron, octahedron (Z-up)
- Test each individually
- Validate RT quadrances

### Session 3: Golden Ratio Polyhedra (60 min)
- Implement icosahedron, dodecahedron
- Dual icosahedron, rhombic dodecahedron
- Validate nesting relationships

### Session 4: Quadray & Validation (30 min)
- Update Quadray basis
- Update all console logs
- Full RT validation suite

### Session 5: Final Testing (30 min)
- Complete testing checklist
- Side-by-side comparison with Y-up backup
- Document any differences
- Rename to ARTexplorer.html if successful

**Total:** ~3.5 hours

---

## Success Criteria

### Definition of Done
1. All polyhedra render identically to Y-up version (when viewed from equivalent angles)
2. Blue axis (Z) visibly points up in default view
3. XY plane is horizontal ground plane
4. All RT quadrance validations pass
5. Camera controls feel natural (Z feels "up")
6. No transformation layer in code
7. All vertex definitions use Z as vertical directly
8. Code comments reflect Z-up convention

### Acceptance Test
Open ARTexplorer-ZUP.html:
- Blue axis vertical? ✓
- XY plane horizontal? ✓
- Cube has 4 vertical edges? ✓
- Console shows same quadrances as Y-up? ✓
- Mental model clear (Z=height)? ✓

If all pass → Replace ARTexplorer.html

---

## Migration Path

```bash
# Current state:
ARTexplorer.html              # Y-up (original)
ARTexplorer-YUP-BACKUP.html   # Y-up (safety backup)

# Development:
ARTexplorer-ZUP.html          # Z-up (new version, in progress)

# After validation:
mv ARTexplorer.html ARTexplorer-YUP-OLD.html
mv ARTexplorer-ZUP.html ARTexplorer.html

# Final state:
ARTexplorer.html              # Z-up (production)
ARTexplorer-YUP-BACKUP.html   # Y-up (reference)
ARTexplorer-YUP-OLD.html      # Y-up (deprecated)
```

---

## Notes for Developer

**Critical Mental Model:**
- Z is height (elevation, altitude)
- XY plane is the floor you walk on
- Looking down at XY from above (+Z) is architectural plan view
- XZ and YZ planes are vertical walls

**When Defining Vertices:**
Ask: "How high is this point?" → That's the Z coordinate
Ask: "North-south position?" → That's the Y coordinate
Ask: "East-west position?" → That's the X coordinate

**Three.js GridHelper Quirk:**
GridHelper creates grids in the XZ plane by default (Y-up convention).
For Z-up, we need to rotate to get planes right:
- XY horizontal: `rotation.x = π/2`
- XZ vertical: `rotation.z = π/2`
- YZ vertical: `rotation.x = π/2, rotation.y = π/2`

---

## References

- **Three.js Coordinate Systems**: https://threejs.org/docs/#manual/en/introduction/Coordinate-systems
- **glTF 2.0 Spec (Z-up)**: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
- **AutoCAD Z-up Convention**: Industry standard for architectural drawings
- **Blender Z-up**: Default coordinate system
- **Rational Trigonometry**: Coordinate-agnostic (Wildberger)

---

**Status:** 📋 Documentation Complete - Ready for Implementation
**Next Action:** Create ARTexplorer-ZUP.html and begin Phase 2
