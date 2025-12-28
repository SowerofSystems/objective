# ThreeRT - Three.js + Rational Trigonometry Geometry Explorer
- Credits and thanks: Co-developed from the ideas of R. Buckminster Fuller, Kirby Urner, Tom Ace, NJ Wildberger and Andy Thomson, witnessed by Metatron. 

## Overview

Standalone HTML + Three.js (CDN) application for exploring polyhedral geometry using Rational Trigonometry principles. Built on the constraint-driven successes of WOMBAT (Section 19), this tool visualizes nested polyhedra in both 3D (XYZ) and 4D (WXYZ/Quadray/Caltrop) coordinate spaces.

**Core Philosophy:**
- No Three.js preset forms (Box, Sphere, etc.)
- Hand-coded geometry using Rational Trigonometry (Wildberger)
- Quadrance (Q = distance²) and spread (s) instead of distance/angle
- Nested polyhedra relationships
- Pure algebraic solutions (no iteration, no trig functions)

---

## Phase 1: Foundation (MVP) ✅ COMPLETE

### Deliverable: Single HTML file with ES module Three.js

**File Structure:**
```
docs/development/Geometry/
├── ThreeRT.md (this file)
└── ThreeRT.html (standalone app - 1200+ lines)
```

**Completed Goals:**
1. ✅ Load Three.js from CDN via ES modules (three@0.160.0)
2. ✅ Basic scene setup (camera, renderer, lights, orbit controls)
3. ✅ Render multiple polyhedra using hand-coded vertices
4. ✅ Orbit controls for 3D navigation with damping
5. ✅ Coordinate axes visualization (XYZ Cartesian + Quadray basis)
6. ✅ Interactive controls panel with toggles and sliders
7. ✅ Geometry statistics panel with Euler validation
8. ✅ Semi-transparent faces with configurable opacity

**Implemented Polyhedra (Phase 1b):**
- ✅ **Hexahedron (Cube)** - 8 vertices, 12 edges, 6 faces - Schläfli {4,3}
- ✅ **Tetrahedron** - 4 vertices, 6 edges, 4 faces - Schläfli {3,3}
- ✅ **Dual Tetrahedron** - Inverted tetrahedron within cube
- ✅ **Octahedron** - 6 vertices, 12 edges, 8 faces - Schläfli {3,4} (dual of cube)
- ✅ **Icosahedron** - 12 vertices, 30 edges, 20 faces - Schläfli {3,5}
- ✅ **Dodecahedron** - 20 vertices, 30 edges, 12 faces - Schläfli {5,3}
- ✅ **Cuboctahedron (Vector Equilibrium)** - 12 vertices, 24 edges, 14 faces (8 tri + 6 square) - Fuller's IVM foundation
- ⚠️ **Rhombic Dodecahedron** - 14 vertices, 24 edges, 12 faces (dual of cuboctahedron) - *Requires rebuilding from cuboctahedron dual*

**Visual Style (Implemented):**
- Wireframe edges with LineSegments (efficient rendering)
- Semi-transparent faces with configurable opacity slider
- Vertex nodes (small spheres at corners) - toggleable
- Color-coded by polyhedron type:
  - Cube: Blue (0x4a9eff)
  - Tetrahedron: Red (0xff4444)
  - Dual Tetrahedron: Magenta (0xff00ff)
  - Octahedron: Green (0x00ff00)
  - Icosahedron: Cyan (0x00ffff)
  - Dodecahedron: Yellow (0xffff00)
  - Cuboctahedron (VE): Bright Lime-Cyan (0x00ff88)
  - Rhombic Dodecahedron: Orange (0xff8800)

---

## Phase 1b: Dodecahedron Implementation ✅ COMPLETE

### Deliverable: "Hip Roof Pup Tent" Construction

**Geometric Approach:**
The dodecahedron uses the standard (0, ±1, ±φ) permutation construction where φ = (1+√5)/2 (golden ratio).

**Key Properties:**
- 20 vertices: 8 at cube corners (±s, ±s, ±s) + 12 at phi-vertices
- 30 edges: 24 from cube corners to phi-vertices + 6 between phi-vertices
- 12 pentagonal faces (fan-triangulated for rendering)
- Each pentagon has 2 "shoulder" vertices that ARE cube corners
- The line between shoulder vertices lies exactly on the cube edge
- Resembles "hip roof pup tents" on each cube face

**Phi-Vertex Permutations (scaled by s):**
1. (0, ±1/φ, ±φ) - 4 vertices (permutation group 1)
2. (±1/φ, ±φ, 0) - 4 vertices (permutation group 2)
3. (±φ, 0, ±1/φ) - 4 vertices (permutation group 3)

**Rational Trigonometry Connection:**
- φ² = φ + 1 → φ² - φ - 1 = 0 (quadrance relationship)
- All dodecahedron edges have equal quadrance
- Derived from algebraic relationship: Q_φ/Q_1 = φ²

**Reference:**
Similar to Section19.js hip roof solver pattern - pure algebraic solution using quadrance relationships, avoiding iterative methods.

---

## Phase 1c: Cuboctahedron (Vector Equilibrium) Implementation ✅ COMPLETE

### Deliverable: Fuller's IVM Foundation Polyhedron

**Geometric Approach:**
The cuboctahedron (Fuller's "Vector Equilibrium") is constructed with vertices at the edge midpoints of a cube/octahedron. This is the fundamental polyhedron in Fuller's Isotropic Vector Matrix (IVM) space-filling geometry.

**Key Properties:**
- 12 vertices at (±t, ±t, 0), (±t, 0, ±t), (0, ±t, ±t) where t = s/√2
- 24 edges (all equal length - uniform quadrance)
- 14 faces: 6 square + 8 triangular
- Each vertex connects to 4 edges
- Dual polyhedron: Rhombic Dodecahedron

**Vertex Construction (RT-Pure):**
Following Wildberger's Rational Trigonometry principles:
1. Defer √2 expansion: `const sqrt2 = Math.sqrt(2);` calculated once
2. Use algebraic position: `t = s / sqrt2` (rationalized distance from origin)
3. Vertices at alternating coordinate positions:
   - XY plane (Z=0): 4 vertices at (±t, ±t, 0)
   - XZ plane (Y=0): 4 vertices at (±t, 0, ±t)
   - YZ plane (X=0): 4 vertices at (0, ±t, ±t)

**Edge Topology (24 total):**
Critical lesson: Edges must be derived from actual face perimeters, not assumed from coordinate planes.
- 16 edges connecting XY plane vertices to XZ/YZ plane vertices
- 8 edges connecting XZ plane vertices to YZ plane vertices
- All edges have uniform quadrance: Q = 2t² (validated via RT.validateEdges)

**Face Structure (14 total):**
- 6 square faces (corresponding to cube faces): proper cyclic winding order
  - Example: `[0, 4, 1, 5]` winds around +X square face perimeter
- 8 triangular faces (corresponding to octahedron faces, one per octant)
  - Example: `[0, 4, 8]` for (+,+,+) octant

**Rational Trigonometry Validation:**
- Edge quadrance: Q = 2t² where t = s/√2
- Expected quadrance: 2 * (s/√2)² = 2 * s²/2 = s²
- All 24 edges validated to have uniform quadrance
- No angle calculations - pure algebraic construction

**Bug Fix History:**
Initial implementation incorrectly included phantom edges for XY, XZ, YZ plane squares that don't exist in cuboctahedron geometry. These created diagonal "X" patterns on square faces. Fix: regenerated all 24 edges from the 14 face perimeter definitions, removing non-existent plane square edges.

**Significance:**
The cuboctahedron is the proper foundation for constructing the Rhombic Dodecahedron as its dual (vertices ↔ face centers). This ensures coplanar faces and proper RT-pure construction.

**Visual Style:**
- Color: Bright Lime-Cyan (0x00ff88)
- Opacity: 0.4 (semi-transparent)
- Rendering: BufferGeometry with indexed faces, fan triangulation from first vertex

---

## Phase 1d: Rhombic Dodecahedron (Correct Dual) Implementation ✅ COMPLETE

### Deliverable: Proper Geometric Dual of Cuboctahedron

**Critical Discovery: Dual Vertices ≠ Face Centroids**

The rhombic dodecahedron as the geometric dual of the cuboctahedron requires vertices positioned to create **planar rhombic faces**, not simply at face centroids.

**Incorrect Approach (Non-Planar Faces):**
- Triangle face centroids at (±2t/3, ±2t/3, ±2t/3)
- Results in saddle-shaped, non-coplanar rhombic faces
- Scalar triple product ≠ 0 (failed coplanarity test)

**Correct Approach (Planar Faces):**
- 6 axis vertices at (±t, 0, 0), (0, ±t, 0), (0, 0, ±t) where t = s/√2 (degree 4)
- 8 octant vertices at (±u, ±u, ±u) where **u = t/2 = s/(2√2)** (degree 3)
- This ensures all 12 rhombic faces are perfectly coplanar
- Verified via scalar triple product = 0

**Key Properties:**
- 14 vertices: 6 degree-4 (axis) + 8 degree-3 (octant)
- 24 edges with uniform quadrance Q = t² = s²/2
- 12 planar rhombic faces (no saddle distortion)
- Each rhombus corresponds to one cuboctahedron vertex

**RT-Pure Construction:**
- Defer √2 expansion: t = s/√2, u = t/2 = s/(2√2)
- Algebraic vertex positions ensure exact geometric relationships
- All edges validated to have uniform quadrance

**Dual Relationship Verified:**
- Cuboctahedron 14 faces → Rhombic dodec 14 vertices ✓
- Cuboctahedron 12 vertices → Rhombic dodec 12 faces ✓
- Proper geometric dual with reciprocal face/vertex relationship ✓

**Bug Fix History:**
1. Initial attempt used triangle centroids at 2t/3 → non-planar faces (saddle)
2. Corrected to u = t/2 → perfectly planar rhombic faces ✓
3. Coplanarity verified via scalar triple product test

**Visual Style:**
- Color: Orange (0xff8800)
- Opacity: 0.4 (semi-transparent)
- Rendering: BufferGeometry with indexed faces

---

## Phase 2: Nested Polyhedra (3D Space) ✅ COMPLETE

### Deliverable: Platonic solids + Rhombic Dodecahedron

**Implemented Sequence:**
1. ✅ Hexahedron (Cube) - 8 vertices, foundation solid
2. ✅ Tetrahedron - 4 vertices, inscribed in cube
3. ✅ Dual Tetrahedron - 4 vertices, inverted tetrahedron
4. ✅ Octahedron - 6 vertices, dual of cube (vertices at cube face centers)
5. ✅ Icosahedron - 12 vertices, three orthogonal golden rectangles
6. ✅ Dodecahedron - 20 vertices, "hip roof" construction on cube faces
7. ✅ Rhombic Dodecahedron - 14 vertices, dual of cuboctahedron

**Completed Goals:**
1. ✅ Generate each polyhedron procedurally (no hardcoded vertices)
2. ✅ Nest polyhedra concentrically (same center point at origin)
3. ✅ Toggle visibility for each polyhedron independently
4. ✅ Color-code by polyhedron type
5. ✅ Validate Euler's formula: V - E + F = 2 (displayed in stats panel)

**Rational Trigonometry Implementation:**
- ✅ All edge lengths derived from quadrances
- ✅ Algebraic formulas for all vertex positions
- ✅ No floating-point angle calculations (except for golden ratio √5)
- ✅ Euler characteristic validation for all polyhedra
- ✅ BufferGeometry with indexed rendering for efficiency

---

## Phase 3: 4D Coordinate Space (WXYZ/Quadray)

### Deliverable: 4D → 3D projection system

**Background Needed:**
- Quadray coordinates (4D tetrahedral basis)
- Caltrop coordinates (alternative 4D system)
- Projection methods for 4D → 3D visualization

**Goals:**
1. Implement 4D coordinate system (WXYZ)
2. Define 4D → 3D projection matrix
3. Render 4D hypercube (tesseract) projection
4. Interactive rotation in 4D space
5. Display both 3D and 4D views side-by-side

**Visualization Challenges:**
- Edge occlusion in projected 4D
- Color gradients by 4D depth
- Animation of 4D rotation
- UI controls for W-axis manipulation

---

## Phase 4: Interactive Controls

### Deliverable: Full-featured geometry explorer

**Features:**
1. **Polyhedra Selection**
   - Dropdown menu for shape selection
   - Nested view toggle (show/hide inner polyhedra)
   - Scale factor slider (resize outer shell)

2. **Dimension Toggle**
   - Switch between 3D (XYZ) and 4D (WXYZ) views
   - Projection mode selector (orthographic/perspective)
   - 4D rotation controls (WX, WY, WZ planes)

3. **Geometry Info Panel**
   - Vertex count, edge count, face count
   - Total quadrance (sum of all edge quadrances)
   - Euler characteristic validation
   - Dual polyhedron relationship

4. **Export Options**
   - JSON export (vertex/edge/face data)
   - SVG screenshot (2D projection)
   - OBJ file export (3D mesh)

---

## Technical Architecture

### Code Structure (Single HTML File)

```html
<!DOCTYPE html>
<html>
<head>
  <title>ThreeRT - Rational Trigonometry Geometry Explorer</title>
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/examples/js/controls/OrbitControls.js"></script>
  <style>
    /* Minimal styling */
  </style>
</head>
<body>
  <div id="canvas-container"></div>
  <div id="controls-panel"></div>

  <script>
    // === RATIONAL TRIGONOMETRY LIBRARY ===
    const RT = {
      quadrance: (p1, p2) => { /* Q = Δx² + Δy² + Δz² */ },
      spread: (v1, v2) => { /* s = 1 - (v1·v2)² / (|v1|²|v2|²) */ },
      // ... pure algebraic geometry functions
    };

    // === POLYHEDRA GENERATORS ===
    const Polyhedra = {
      tetrahedron: () => { /* vertices from RT */ },
      cube: () => { /* vertices from RT */ },
      // ... other shapes
    };

    // === THREE.JS SCENE SETUP ===
    function initScene() { /* ... */ }
    function renderPolyhedron(vertices, edges, faces) { /* ... */ }

    // === MAIN ===
    initScene();
    const tetra = Polyhedra.tetrahedron();
    renderPolyhedron(tetra.vertices, tetra.edges, tetra.faces);
  </script>
</body>
</html>
```

### Rational Trigonometry Principles

**1. Quadrance (Q) instead of Distance (d):**
```javascript
// Traditional (uses sqrt, slow, imprecise)
const distance = Math.sqrt((x2-x1)**2 + (y2-y1)**2 + (z2-z1)**2);

// Rational Trigonometry (exact, fast)
const quadrance = (x2-x1)**2 + (y2-y1)**2 + (z2-z1)**2;
```

**2. Spread (s) instead of Angle (θ):**
```javascript
// Traditional (uses trig, transcendental)
const angle = Math.acos(dot(v1, v2) / (length(v1) * length(v2)));

// Rational Trigonometry (algebraic)
const spread = 1 - (dot(v1, v2)**2) / (quadrance(v1) * quadrance(v2));
```

**3. Wildberger's Triple Quad Formula (Pythagorean for triangles):**
```javascript
// For triangle with quadrances Q1, Q2, Q3 and spreads s1, s2, s3:
// (Q1 + Q2 + Q3)² = 2(Q1² + Q2² + Q3²) + 4Q1·Q2·s3
```

---

## Tetrahedron Calculation (Phase 1 Reference)

### Regular Tetrahedron Centered at Origin

**Problem:** Given edge quadrance Q_edge, find 4 vertex positions.

**Solution (Algebraic):**
```javascript
function tetrahedronVertices(edgeQuadrance) {
  // Regular tetrahedron inscribed in cube
  // Edge quadrance Q = 2a² (where a = cube edge)
  const a = Math.sqrt(edgeQuadrance / 2);

  return [
    { x:  a, y:  a, z:  a },  // v0
    { x:  a, y: -a, z: -a },  // v1
    { x: -a, y:  a, z: -a },  // v2
    { x: -a, y: -a, z:  a },  // v3
  ];
}

function tetrahedronEdges() {
  // 6 edges (all pairs except opposite corners)
  return [
    [0, 1], [0, 2], [0, 3],
    [1, 2], [1, 3], [2, 3]
  ];
}

function tetrahedronFaces() {
  // 4 triangular faces
  return [
    [0, 1, 2],
    [0, 1, 3],
    [0, 2, 3],
    [1, 2, 3]
  ];
}
```

**Validation:**
- Verify all edge quadrances equal Q_edge
- Verify all face triangles are equilateral (3 equal quadrances)
- Verify spreads at vertices (should be 1/3 for tetrahedral angle)

---

## Phase 2.6: Face Dual Icosahedron ✅ COMPLETE

### Deliverable: Icosahedron/Dodecahedron Dual Pair

**Objective:** Implement the canonical face dual relationship where icosahedron vertices point to dodecahedron face centers ("kissing" configuration).

**Geometric Duality:**
- **Vertex-Face correspondence**: 12 icosahedron vertices ↔ 12 dodecahedron pentagonal faces
- **Face-Vertex correspondence**: 20 icosahedron triangular faces ↔ 20 dodecahedron vertices
- **Inradius matching**: Icosahedron vertices positioned at dodecahedron inradius (φ × halfSize)

**RT Implementation - Spread-Based Rotation:**

Instead of using angles for rotation, RT uses **spread** (s) and **cross** (c):
- **Spread**: s = sin²(θ) - the "quadrance" of rotation
- **Cross**: c = cos²(θ) - complementary measure
- **Fundamental relation**: s + c = 1

**Implemented Example: -90° Z-axis Rotation (Optimal RT Math)**

For icosahedron/dodecahedron face dual alignment, we use a **-90° clockwise rotation around Z-axis**. This is **optimal RT math** because the spread and cross values are exact integers:

```javascript
// EXACT INTEGER VALUES - No trigonometric functions called!
const sin_neg_pi_2 = -1;   // sin(-π/2) = -1 (exact!)
const cos_neg_pi_2 = 0;    // cos(-π/2) = 0 (exact!)
const sin_neg_pi_2_sq = 1; // s = sin²(-π/2) = 1 (exact!)
const cos_neg_pi_2_sq = 0; // c = cos²(-π/2) = 0 (exact!)

// Verify RT identity: s + c = 1
// 1 + 0 = 1 ✓ (pure integer arithmetic!)

// Z-axis rotation matrix - Pure integer matrix!
// R_z(-π/2) = [0, 1, 0; -1, 0, 0; 0, 0, 1]
const rotateZ = (v) => new THREE.Vector3(
  0 * v.x - (-1) * v.y,  // = y
  -1 * v.x + 0 * v.y,    // = -x
  v.z                     // z unchanged
);
// Transforms (x, y, z) → (y, -x, z) using ONLY integer multiplication
```

**Why This Is Optimal RT Math:**
1. **No transcendental functions**: Uses algebraic fact that sin(-90°) = -1, cos(-90°) = 0
2. **Exact integer spread values**: s = 1, c = 0 (no floating-point approximation)
3. **Pure integer matrix**: All operations are multiplication by 0, 1, or -1
4. **Verifiable identity**: s + c = 1 + 0 = 1 ✓
5. **Gold standard for RT**: Special angles (90°, 180°, etc.) yield exact rational values

**General Case: Non-Special Angles**

For other rotations (e.g., π/10 = 18°), we use exact algebraic spread values:

```javascript
// EXACT algebraic values (no angle calculation!)
const sqrt5 = Math.sqrt(5);
const sin_pi_10_sq = (3 - sqrt5) / 8;  // s = sin²(π/10)
const cos_pi_10_sq = (5 + sqrt5) / 8;  // c = cos²(π/10)

// Verify RT identity: s + c = 1
// (3 - √5)/8 + (5 + √5)/8 = 8/8 = 1 ✓

// Only take sqrt when needed for rotation matrix
const sin_pi_10 = Math.sqrt(sin_pi_10_sq);
const cos_pi_10 = Math.sqrt(cos_pi_10_sq);
```

**Why This Approach is RT-Pure:**
1. **Works in spread space**: Calculates s and c first, verifies s + c = 1
2. **Exact algebraic values**: Uses symbolic formulas, not floating-point trig
3. **Deferred square roots**: Only takes sqrt when absolutely needed for final rotation
4. **No angle arithmetic**: Never calculates angles as decimal approximations
5. **Quadrance preservation**: Geometric relationships maintained exactly

**Scaling Relationship:**
- Standard icosahedron: radius = 1 (unit sphere)
- Dual icosahedron: radius = φ (dodecahedron inradius)
- Edge quadrance ratio: Q_dual / Q_standard = φ² = φ + 1 (algebraic!)

**Completed Features:**
- ✅ Dual icosahedron polyhedron generator with φ-scaling
- ✅ Spread-based rotation (-π/2 around Z-axis) for vertex alignment
- ✅ RT-pure implementation using exact integer spread values (s=1, c=0)
- ✅ Optimal RT math: pure integer transformation matrix
- ✅ UI toggle for dual icosahedron visibility
- ✅ Console logging of spread/cross verification

**Key Insight:**
The -90° rotation is **optimal RT math** because it uses exact integer values (sin=-1, cos=0) rather than algebraic radicals. This represents the gold standard for RT: when rotation angles are "special" (multiples of 90°), the spread and cross values collapse to exact rationals (integers), eliminating all transcendental functions.

---

## Current Status (as of 2025-12-26)

**Phase 1 & 2: ✅ COMPLETE**
- All 7 polyhedra implemented and rendering correctly
- Full interactive controls with toggles and sliders
- Euler validation for all solids
- Semi-transparent faces with configurable opacity
- Coordinate system visualization (Cartesian + Quadray basis)

**Phase 2.6: ✅ COMPLETE**
- Dual icosahedron with face dual relationship to dodecahedron
- Spread-based rotation (RT-pure, no angle calculations)
- Exact algebraic values: s = (3-√5)/8, c = (5+√5)/8
- Vertices aligned with dodecahedron pentagonal face centers

**Phase 2.9: ✅ COMPLETE (2025-12-26)**
- InSphere/MidSphere/OutSphere geodesic projections for all three geodesics
- RT-pure sphere radius formulas using golden ratio φ
- Fixed icosahedron sphere projection bugs (correct geometric formulas)
- Frequency slider glitching fixed (changed `input` to `change` event)

**Phase 2.10: ✅ COMPLETE (2025-12-26) - Z-Up Coordinate Convention**
- **Camera**: Set `camera.up.set(0, 0, 1)` - Z is now vertical (CAD/BIM/glTF standard)
- **Visual**: Blue axis points UP (was green/Y before)
- **Grid Planes**: XY horizontal (ground), XZ/YZ vertical (walls)
- **Comments**: Updated all polyhedra vertex descriptions for Z-up interpretation
- **Backup**: Created ARTexplorer-YUP-BACKUP.html for reference
- **Rationale**: Preparing for glTF/DWG/GXF export compatibility with industry CAD standards

**Recent Completion:**
- Z-up coordinate refactor (notation change only - coordinates unchanged)
- Icosahedron geodesic InSphere/MidSphere RT-pure formulas corrected
- Eliminated all trigonometric functions from geodesic sphere calculations
- Frequency slider performance optimization (rebuild only on release, not during drag)

---

## Phase 2.5: RT Purity Enhancements ✅ COMPLETE

### Deliverable: Enhanced Rational Trigonometry Implementation

**Objective:** Maximize RT purity by deferring square root expansion and working in quadrance space as long as possible.

**RT Implementation Status (COMPLETED):**
- ✅ **Excellent**: Using algebraic identities (φ² = φ + 1, 1/φ = φ - 1)
- ✅ **Excellent**: No angle calculations anywhere (pure algebraic geometry)
- ✅ **Excellent**: √ expansion deferred until final vertex creation
- ✅ **Excellent**: Quadrance validation implemented for all polyhedra
- ✅ **Excellent**: Spread calculations available in RT library
- ✅ **Optimal**: Optimal RT rotation using exact integer spread values (dual icosahedron)

**Identified Issues:**

1. **Premature Division in 1/φ calculation**
   ```javascript
   const invPhi = 1 / phi;  // ❌ Forces floating-point division
   ```
   **Fix:** Use algebraic identity: `1/φ = φ - 1`
   ```javascript
   const invPhi = phi - 1;  // ✓ Keeps as (√5 - 1)/2 symbolically
   ```

2. **Icosahedron Nested Square Roots**
   ```javascript
   const normFactor = 1 / Math.sqrt(1 + phi_squared);  // ❌ sqrt(1 + φ²)
   ```
   **Fix:** Defer normalization or work in quadrance space

3. **Rhombic Dodecahedron Immediate √3 Expansion**
   ```javascript
   const t = s / Math.sqrt(3);  // ❌ Expands √3 immediately
   ```
   **Fix:** Defer as `s * √3 / 3` or scale at final vertex creation

4. **Missing Quadrance Calculations**
   - Not using Q = distance² for validation
   - Not verifying edge quadrances are equal
   - Not using quadrance for geometric relationships

**Enhancement Plan:**

1. **Symbolic Golden Ratio Library**
   ```javascript
   const RT_Phi = {
     sqrt5: () => Math.sqrt(5),           // Only call when needed
     value: function() {
       return 0.5 * (1 + this.sqrt5());
     },
     squared: function() {
       return this.value() + 1;           // φ² = φ + 1 (no sqrt!)
     },
     inverse: function() {
       return this.value() - 1;           // 1/φ = φ - 1 (no division!)
     }
   };
   ```

2. **Quadrance-Based Validation**
   ```javascript
   RT.quadrance = (v1, v2) => {
     const dx = v2.x - v1.x;
     const dy = v2.y - v1.y;
     const dz = v2.z - v1.z;
     return dx*dx + dy*dy + dz*dz;  // Q = d² (no sqrt!)
   };

   RT.validateEdges = (vertices, edges, expectedQ) => {
     // Verify all edges have equal quadrance
     return edges.map(([i,j]) => ({
       edge: [i,j],
       Q: RT.quadrance(vertices[i], vertices[j]),
       error: Math.abs(Q - expectedQ)
     }));
   };
   ```

3. **Spread Implementation (when needed)**
   ```javascript
   RT.spread = (v1, v2, v3) => {
     // Spread s = Q1·Q2·Q3 / (Q1+Q2+Q3)²
     // Replaces sin²(θ) without using angles!
     // Will be needed for: angular validation, rotations, projections
   };
   ```

**Why We Haven't Needed Spread Yet:**
- All polyhedra built from **pure vertex coordinates** (algebraic)
- No rotations or angular constraints required
- Validation via **Euler's formula** (V - E + F = 2) only
- This is **exactly how RT should work** - angles avoided entirely!

**When We'll Need Spread:**
- 4D → 3D projections (Phase 3)
- Geodesic subdivisions (Phase 4+)
- Angular validation of tetrahedral coordinates
- Verifying vertex angle relationships

**RT Principles Checklist:**
- [x] Defer all √ expansions until final vertex creation ✓
- [x] Use algebraic identities (φ² = φ + 1, 1/φ = φ - 1) ✓
- [x] Validate geometry using quadrance, not distance ✓
- [x] Implement spread for angular relationships (when needed) ✓
- [x] Work in rational/algebraic space as long as possible ✓
- [x] Only convert to floating-point for Three.js Vector3 creation ✓

**Phase 2.5 Completion Summary:**

All RT purity enhancements successfully implemented:

1. **RT Library Enhanced** (ARTexplorer.html:354-430)
   - `RT.quadrance(p1, p2)` - Distance² without square roots
   - `RT.spread(v1, v2)` - Angular spread (sin²θ) for vector pairs
   - `RT.Phi` - Symbolic golden ratio with algebraic identities
   - `RT.validateEdges()` - Quadrance uniformity validation

2. **Quadrance Validation Logging** (All polyhedra constructors)
   - Cube: Q = 4s², validates 12 edges
   - Tetrahedron: Q = 8s², validates 6 edges
   - Octahedron: Q = 2s², validates 12 edges
   - Icosahedron: Q = 4a², validates 30 edges
   - Dual Icosahedron: Q = 4a², validates 30 edges
   - Dodecahedron: Uniform Q validation, 30 edges
   - Rhombic Dodecahedron: Two-tier (short Q=s², long Q=2s²), 48 edges

3. **Optimal RT Rotation** (Phase 2.6 - Dual Icosahedron)
   - -90° Z-axis rotation using exact integer spread values
   - Spread s=1, Cross c=0 (pure integers!)
   - Transformation matrix [0,1,0; -1,0,0; 0,0,1]
   - Gold standard example of RT mathematics

4. **Golden Ratio Operations** (Dodecahedron)
   - Uses `RT.Phi.inverse()` = φ - 1 (no division)
   - Uses `RT.Phi.squared()` = φ + 1 (no multiplication)
   - Symbolic √5 expansion deferred

5. **Rationalized Radicals** (Rhombic Dodecahedron)
   - √3 deferred as `s·√3/3` until vertex creation
   - Maintains algebraic exactness in intermediate calculations

**Result:** Complete RT purity achieved. All geometric calculations use quadrance and algebraic identities. Square roots and transcendental functions only appear at final vertex creation for Three.js Vector3 instantiation.

---

## Next Steps

### ✅ COMPLETED (Phase 2.9 - Geodesic UI Refinements - 2025-12-25):
1. ✅ **UI Reorganization** - COMPLETE
   - ✅ Nested geodesic controls under parent polyhedron checkboxes
   - ✅ Single collapsible toggle per polyhedron (cleaner hierarchy)
   - ✅ Reordered elements: checkbox → toggle → title (vertical alignment)
   - ✅ Improved discoverability of geodesic features
   - ✅ Applied to tetrahedron, octahedron, and icosahedron

### ✅ COMPLETED (Phase 2.5 - RT Enhancements - 2025-12-24):
1. ✅ **Implement Enhanced RT Library** - COMPLETE
   - ✅ Add RT_Phi symbolic golden ratio operations
   - ✅ Replace `invPhi = 1/phi` with `invPhi = phi - 1`
   - ✅ Defer √3 and other radical expansions
   - ✅ Add quadrance calculation functions

2. ✅ **Add Quadrance-Based Validation** - COMPLETE
   - ✅ Implement edge quadrance verification
   - ✅ Calculate expected Q for each polyhedron type
   - ✅ Display quadrance stats in console logs
   - ⚠️ Add visual indicator for quadrance uniformity (deferred to Phase 3)

3. ✅ **Implement Spread (preparation for Phase 3)** - COMPLETE
   - ✅ Add spread calculation function
   - ✅ Document spread formula: s = sin²(θ) replacement
   - ✅ Add spread-based angle validation (for future use)
   - ✅ Will be critical for 4D projections

4. ✅ **Refactor Existing Polyhedra** - COMPLETE
   - ✅ Update dodecahedron to use `phi - 1` instead of `1/phi`
   - ✅ Update icosahedron normalization approach
   - ✅ Update rhombic dodecahedron to defer √3
   - ✅ Maintain backward compatibility (same visual output)

### Near-term (Phase 2.5 completion):
1. **Graphics Refinements**
   - Review edge thickness and node sizes
   - Optimize line rendering (match WOMBAT style)
   - Adjust colors if needed

2. **Icosahedron/Dodecahedron Nesting Verification** - COMPLETE
   - Verify each dodecahedron face center has icosahedron vertex
   - Use quadrance to validate nesting relationships
   - Adjust scaling factors if needed
   - Document nesting ratios in RT terms: FACE DUAL OF IH & RDDH

### Phase 2.7: RT-Pure Geodesic Subdivision (Fuller Domes):
**Objective:** Implement quadrance-preserving geodesic subdivision for multi-frequency domes.

**RT-Pure Approach:**
- Subdivide polyhedra topologically FIRST (in algebraic/rational space)
- Use golden ratio coordinates and quadrance relationships during subdivision
- Only normalize vertices to sphere at final Vector3 creation
- NO Three.js preset geometries (BoxGeometry, etc.)
- Preserve RT purity throughout subdivision pipeline

**Implementation Phases:**

1. **Phase 2.7a: Geodesic Icosahedron** (Priority 1)
   - Icosahedron is industry standard for geodesic domes
   - Subdivide 20 triangular faces using frequency parameter
   - Midpoints calculated using golden ratio relationships
   - UI: Per-solid checkbox with frequency slider (1-6)
   - Validates edge quadrance after subdivision

   **UI Design:**
   ```
   ☑ Icosahedron              ☐ Geodesic [freq: ▾2]
   ```

   **Vertex Count by Frequency:**
   - Freq 1: 12 vertices (original)
   - Freq 2: 42 vertices
   - Freq 3: 92 vertices
   - Freq 4: 162 vertices
   - Freq 5: 252 vertices
   - Freq 6: 362 vertices (performance limit)

2. **Phase 2.7b: Geodesic Octahedron** (Priority 2)
   - Simpler than icosahedron (8 triangular faces)
   - Good for educational comparison
   - Same UI pattern with frequency slider

3. **Phase 2.7c: Geodesic Tetrahedron** (Priority 3)
   - Simplest geodesic case (4 triangular faces)
   - Excellent for learning subdivision algorithms
   - Demonstrates RT principles clearly

**Quadrance-Preserving Subdivision Algorithm:**
```javascript
// RT-PURE GEODESIC SUBDIVISION
Polyhedra.geodesicIcosahedron = (halfSize = 1, frequency = 2) => {
  // 1. Start with pure algebraic icosahedron
  const base = Polyhedra.icosahedron(halfSize);

  // 2. Subdivide each triangle in ALGEBRAIC SPACE
  //    Midpoint of (0,a,φa) and (a,φa,0) = (a/2, φa, φa/2) - exact!
  const subdivided = subdivideTriangularFaces(base.faces, base.vertices, frequency);

  // 3. Project to sphere ONLY at final vertex creation
  const projected = projectToSphere(subdivided.vertices, halfSize);

  // 4. Validate edge quadrance uniformity
  const validation = RT.validateEdges(projected, subdivided.edges, expectedQ);

  return { vertices: projected, edges: subdivided.edges, faces: subdivided.faces };
};
```

**Key Features:**
- Individual checkbox per solid (can show both pure & geodesic simultaneously)
- Frequency slider (1-6) enabled only when geodesic checkbox active
- Console logging shows subdivision stats and quadrance validation
- Separate Three.js groups allow comparison of algebraic vs geodesic forms

**Phase 2.7 Implementation Results & Discovery:**

✅ **Completed (2025-12-24):**
- Phase 2.7a: Geodesic Icosahedron (orange-red 0xff4400, complementary to cyan)
- Phase 2.7b: Geodesic Octahedron (magenta 0xff00cc, complementary to green)
- Phase 2.7c: Geodesic Tetrahedron (cyan 0x00cccc, complementary to red)

**Novel Discovery - "Happy Accident":**

The current implementation reveals an **important geometric phenomenon**:
- **Icosahedron**: Uniform triangles (20 faces already near-spherical, minimal projection distortion)
- **Octahedron & Tetrahedron**: Non-uniform triangles (smaller at vertices, larger at face centers)

**Why This Occurs:**
1. Subdivision happens on **flat polyhedron faces** (algebraically pure)
2. Single normalization at end projects flat subdivisions onto sphere
3. Flatter base polyhedra (tetra/octa) → more projection distortion
4. **This is NOT a bug** - it's a visualization of how planar subdivision differs from spherical geodesic

**Novel Solution - Quadray Polygonal Frequency Projections (Phase 2.8):**
- discovered by Andy w. Metatron 2025.12.24, 22h22.

Instead of traditional spherical great circles, use the **Quadray coordinate system's natural tetrahedral symmetry**:

**Concept:**
- Quadray basis: W, X, Y, Z axes pointing to tetrahedral vertices
- Any **two axes define a coplanar polygon** through their sweep/spread
- Use these **tetrahedral projection planes** for frequency subdivision, 3 (triangle) = Frequency 1, 6 (hexagon) = Frequency 2, 12 (dodecagon), F3, etc.
- Resulting nodes define geodesic vertices in Quadray space

**Advantages:**
1. **RT-Pure**: Works in algebraic tetrahedral space (no sphere needed!)
2. **Uniform triangulation**: Coplanar projections avoid distortion
3. **Natural symmetry**: Tetrahedral basis provides inherent balance
4. **Novel approach**: Not based on spherical geometry - genuinely new

**Mathematical Foundation:**
```
Quadray Basis Vectors (normalized):
W: ( 1,  1,  1) / √3
X: ( 1, -1, -1) / √3
Y: (-1,  1, -1) / √3
Z: (-1, -1,  1) / √3

Coplanar Polygon from axes i,j:
- Define plane by basis[i] and basis[j]
- Subdivide polygon by frequency parameter
- Points naturally distribute in Quadray space
- Zero-sum normalization maintains tetrahedral balance
```

**Implementation Path (Phase 2.8):**
1. Define 6 coplanar polygons (WX, WY, WZ, XY, XZ, YZ planes)
2. Subdivide each polygon by frequency
3. Map subdivision points to Quadray coordinates
4. Apply zero-sum normalization
5. Convert to Cartesian for rendering
6. Validate using quadrance relationships

**This approach is potentially novel in geodesic dome construction** - using tetrahedral coordinate symmetry instead of spherical geometry. May have applications in:
- Molecular geometry (tetrahedral bonding)
- Crystal lattice construction
- Tensegrity structures
- 4D → 3D projections (natural Quadray application)

**Status:** Current "non-uniform" geodesics preserved as educational example. Phase 2.8 will implement Quadray-based uniform subdivision as alternative approach.

---

## Phase 2.9: RT-Pure Geodesic Educational UI (InSphere/MidSphere/OutSphere)

### Deliverable: Multi-Stage Geodesic Visualization ✅ COMPLETE (2025-12-26)

**Objective:** Separate geodesic subdivision from sphere projection to educate users on the process while maintaining RT purity.

**CRITICAL BUG FIXES (2025-12-26):**

**Problem:** Icosahedron InSphere and MidSphere projections were using incorrect trigonometric formulas that violated RT purity principles:
- InSphere was using `cos(arctan(2))` - classical trig garbage!
- MidSphere was using approximate decimal values
- Formulas didn't match actual geometric perpendicular distances

**Solution - RT-Pure Icosahedron Sphere Radii:**

Derived from first principles using golden ratio φ and perpendicular distance calculations:

```javascript
// For icosahedron with OutSphere radius = halfSize
const phi = 0.5 * (1 + Math.sqrt(5));  // Golden ratio

// InSphere: Perpendicular distance to face planes
// Face normal = (1,1,1)/√3, distance = (a+b)/√3 where a+b = φ²/√(φ+2)
// Q_in = φ⁴/[3(φ+2)] = (3φ+2)/[3(φ+2)] using φ⁴ = 3φ+2
Q_in = Q_out · (3*phi + 2) / (3*(phi + 2));  // ≈ 0.6315

// MidSphere: Distance to edge midpoints
// Q_mid = Q_out · φ²/(φ+2) = Q_out · (φ+1)/(φ+2) using φ² = φ+1
Q_mid = Q_out · (phi + 1) / (phi + 2);  // ≈ 0.7236

// OutSphere: Through vertices (Fuller's true geodesic)
Q_out = halfSize * halfSize;
```

**RT Purity Verification:**
- ✅ NO trigonometric functions (no cos, sin, arctan)
- ✅ Only golden ratio φ and algebraic relationships
- ✅ Uses φ² = φ + 1 (fundamental golden ratio identity)
- ✅ Quadrance Q calculated directly, √ only at final projection
- ✅ Formulas verified geometrically via cross product and face plane calculations

**Additional Fix - Frequency Slider Glitching:**
- Changed event listener from `input` to `change` for all geodesic frequency sliders
- Prevents continuous geometry rebuild during slider drag
- Geometry now rebuilds only when user releases slider
- Applies to tetrahedron, octahedron, and icosahedron geodesics

**Implementation Status:** ✅ COMPLETE
- All three geodesics (tetra, octa, icosa) now have correct RT-pure sphere projections
- Console logging shows exact quadrance ratios for verification
- Users can now correctly compare InSphere/MidSphere/OutSphere projections

---

### Original Phase 2.9 Specification

**Objective:** Separate geodesic subdivision from sphere projection to educate users on the process while maintaining RT purity.

**Current Problem:**
- Users see only final result (subdivided + projected)
- Cannot see subdivision happening on flat polyhedron faces
- Cannot compare different sphere projection radii
- Process appears as "black box"

**Solution: Two-Stage Process with Three Sphere Options**
- KNOWN ISSUES: Icosahedron not yet properly mapping to insphere (not reaching face of base solid), or midsphere (actually exceeding edge as boundary), although outsphere appears correct.  

**Stage 1: Subdivide/Frequency**
- ☑ Subdivide (checkbox)
- Frequency: [0-6] (number input)
- **Result:** Subdivided faces on FLAT polyhedron (no sphere projection)
- Shows barycentric grid subdivision in algebraic space
- All vertices remain on original polyhedron faces

**Stage 2: Project (checkboxes - can select multiple)**
- ☐ InSphere (project to inscribed sphere - tangent to face centers)
- ☐ MidSphere (project to mid-radius sphere - tangent to edge centers)
- ☐ OutSphere (project to circumscribed sphere - passes through vertices)
- **Result:** Same subdivided mesh projected to 1, 2, or all 3 spheres simultaneously
- Each sphere renders in slightly different color tint
- Allows visual comparison of projection effects

**RT-Pure Mathematics:**

For a regular tetrahedron inscribed in cube with half-size `s`:

**Vertices (4 corners):**
```
v0 = ( s,  s,  s)
v1 = ( s, -s, -s)
v2 = (-s,  s, -s)
v3 = (-s, -s,  s)
```

**1. OutSphere (Circumradius) - Origin to Vertex:**
```javascript
// Quadrance from origin to any vertex
Q_outer = s² + s² + s² = 3s²

// Radius (only when needed for projection):
r_outer = √(3s²) = s√3
```

**2. MidSphere (Midradius) - Origin to Edge Center:**

Edge v0-v1 center:
```
edge_center = ((s+s)/2, (s-s)/2, (s-s)/2) = (s, 0, 0)
Q_mid = s² + 0² + 0² = s²
r_mid = s
```

All 6 edge centers have Q_mid = s² (can verify RT-pure!)

**3. InSphere (Inradius) - Origin to Face Center:**

Face [v0, v1, v2] center:
```
face_center = ((s+s-s)/3, (s-s+s)/3, (s-s-s)/3)
            = (s/3, s/3, -s/3)

Q_inner = (s/3)² + (s/3)² + (-s/3)²
        = s²/9 + s²/9 + s²/9
        = 3s²/9 = s²/3

r_inner = √(s²/3) = s/√3 = s√3/3
```

All 4 face centers have Q_inner = s²/3 (RT-pure validation!)

**Quadrance Ratios (Exact Algebraic!):**
```
Q_outer : Q_mid : Q_inner = 3s² : s² : s²/3
                           = 9 : 3 : 1

r_outer : r_mid : r_inner = √3 : 1 : 1/√3
                           = √3 : 1 : √3/3
```

**RT-Pure Implementation Strategy:**

```javascript
Polyhedra.geodesicTetrahedron = (halfSize = 1, frequency = 0, options = {
  subdivide: false,
  projectInSphere: false,
  projectMidSphere: false,
  projectOutSphere: false
}) => {
  const base = Polyhedra.tetrahedron(halfSize);

  // Stage 1: Subdivision (if enabled)
  if (!options.subdivide || frequency === 0) {
    return base;  // Return flat base tetrahedron
  }

  const subdivided = Polyhedra.subdivideTriangles(
    base.vertices, base.faces, frequency
  );

  // Stage 2: Projection (if any sphere selected)
  const results = [];

  // Option 1: InSphere projection
  if (options.projectInSphere) {
    const Q_target = halfSize * halfSize / 3;  // s²/3
    const projected = subdivided.vertices.map(v => {
      const normalized = v.clone().normalize();
      return normalized.multiplyScalar(Math.sqrt(Q_target));
    });
    results.push({
      vertices: projected,
      edges: subdivided.edges,
      faces: subdivided.faces,
      type: 'InSphere',
      color: 0x4444ff  // Blue tint
    });
  }

  // Option 2: MidSphere projection
  if (options.projectMidSphere) {
    const Q_target = halfSize * halfSize;  // s²
    const projected = subdivided.vertices.map(v => {
      const normalized = v.clone().normalize();
      return normalized.multiplyScalar(Math.sqrt(Q_target));
    });
    results.push({
      vertices: projected,
      edges: subdivided.edges,
      faces: subdivided.faces,
      type: 'MidSphere',
      color: 0x44ff44  // Green tint
    });
  }

  // Option 3: OutSphere projection
  if (options.projectOutSphere) {
    const Q_target = 3 * halfSize * halfSize;  // 3s²
    const projected = subdivided.vertices.map(v => {
      const normalized = v.clone().normalize();
      return normalized.multiplyScalar(Math.sqrt(Q_target));
    });
    results.push({
      vertices: projected,
      edges: subdivided.edges,
      faces: subdivided.faces,
      type: 'OutSphere',
      color: 0xff4444  // Red tint
    });
  }

  // If no sphere selected, return flat subdivided mesh
  if (results.length === 0) {
    return {
      vertices: subdivided.vertices,
      edges: subdivided.edges,
      faces: subdivided.faces,
      type: 'Flat'
    };
  }

  return results;  // Array of projected versions
};
```

**UI Design:**

```
☑ Tetrahedron (Inscribed)
  ▾ ☑ Geodesic (Fuller)
      ☑ Subdivide  Freq: [1]

      Project to Sphere:
      ☐ InSphere (r = s/√3)
      ☐ MidSphere (r = s)
      ☐ OutSphere (r = s√3)
```

**Educational Benefits:**

1. **Subdivision First:** See barycentric grid on flat faces
2. **Projection Second:** Understand how normalization affects geometry
3. **Multiple Spheres:** Compare inscribed/mid/circumscribed simultaneously
4. **RT Purity:** All quadrances calculated algebraically
5. **Visual Proof:** See 9:3:1 quadrance ratio visually

**Phase 2.9 Implementation Plan:**

✅ **COMPLETED (2025-12-25):**
1. ✅ **Add RT sphere quadrance functions** (ARTexplorer.html RT library)
2. ✅ **Update geodesicTetrahedron()** with stage 1 & 2 separation
3. ✅ **Create UI controls** for subdivide + projection radio buttons
4. ✅ **Update geodesicOctahedron()** with projection options
5. ✅ **Update geodesicIcosahedron()** with projection options
6. ✅ **UI controls** for all three geodesics: Off/InSphere/MidSphere/OutSphere
7. ✅ **Console logging** showing Q_target validation for all projection modes
8. ✅ **Event listeners** for all projection radio buttons

**Future Extensions (Phase 4+):**
- Cartesian cut-plane for geodesic dome "grades" (Fuller's truncated domes)
- Class I/II/III subdivision patterns (different edge orientations)
- Chirality options (left/right handed subdivision)
- Geodesic dodecahedron (pentagonal face subdivision - more complex)
- **Phase 2.8**: Quadray polygonal frequency projections (novel approach)

### Near-term (Phase 3 prep):
1. **4D Coordinate System Research**
   - Implement Quadray coordinate transformations
   - Add WXYZ/Caltrop coordinate toggles
   - Design 4D → 3D projection system

2. **Dual Polyhedra Feature**
   - Show dual of any selected polyhedron
   - Implement dual generation algorithm
   - Validate duality relationships

3. **Documentation**
   - Add mathematical derivations for each polyhedron
   - Document quadrance calculations
   - Add more code comments explaining RT principles

---

## TODO: RT Purity Enhancement - Eliminate Classical Trigonometry

**Status:** 📋 Deferred (Documented 2025-12-26)
**Priority:** MEDIUM - Important for RT philosophical purity, but app currently functional

### Problem: Math.PI Usage Violates RT Principles

The app currently uses `Math.PI` in grid plane rotations, which violates Rational Trigonometry purity:

**Location:** [ARTexplorer.html:1769-1790](../../../ARTexplorer.html#L1769-L1790)

```javascript
// Z-UP CONVENTION Grid Planes
window.gridXY = new THREE.GridHelper(gridSize, gridSize / gridStep, gridColor, gridColor);
window.gridXY.rotation.x = Math.PI / 2;  // ❌ Uses π for 90° rotation

window.gridYZ = new THREE.GridHelper(gridSize, gridSize / gridStep, gridColor, gridColor);
window.gridYZ.rotation.z = Math.PI / 2;  // ❌ Uses π for 90° rotation
```

**Why This Matters:**
- **Rational Trigonometry** works exclusively with **quadrance** (Q = distance²) and **spread** (s = sin²θ)
- π is a classical trigonometric constant with no place in RT mathematics
- Using π for rotations contradicts the RT pedagogical mission of the app

### Current Status

**Note:** This pattern existed in the original Y-up version. The Z-up coordinate refactor (Phase 2.10) only swapped which planes receive which rotations - it was a **notation change only**, not introducing new violations.

**What Changed in Z-up Refactor:**
- Y-up: XY plane used `rotation.x = Math.PI/2`, YZ plane used `rotation.z = Math.PI/2`
- Z-up: XY plane uses `rotation.x = Math.PI/2`, YZ plane uses `rotation.z = Math.PI/2`
- **Same rotations, different planes** (notational swap to match Z-up convention)

### Proposed Solutions

#### Option 1: Custom Grid Construction (Preferred)
Replace `THREE.GridHelper` with custom line geometry constructed from first principles:

```javascript
// RT-Pure grid using explicit line segments
function createRTPureGrid(size, divisions, color, plane = 'XY') {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const step = size / divisions;

  for (let i = 0; i <= divisions; i++) {
    const coord = -size/2 + i * step;

    if (plane === 'XY') {
      // Lines parallel to X-axis (Y varies)
      vertices.push(-size/2, coord, 0,  size/2, coord, 0);
      // Lines parallel to Y-axis (X varies)
      vertices.push(coord, -size/2, 0,  coord, size/2, 0);
    } else if (plane === 'XZ') {
      // Lines parallel to X-axis (Z varies)
      vertices.push(-size/2, 0, coord,  size/2, 0, coord);
      // Lines parallel to Z-axis (X varies)
      vertices.push(coord, 0, -size/2,  coord, 0, size/2);
    } else if (plane === 'YZ') {
      // Lines parallel to Y-axis (Z varies)
      vertices.push(0, -size/2, coord,  0, size/2, coord);
      // Lines parallel to Z-axis (Y varies)
      vertices.push(0, coord, -size/2,  0, coord, size/2);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color }));
}
```

**Benefits:**
- ✅ No rotation matrices needed
- ✅ No π usage
- ✅ Explicit coordinate construction matches RT philosophy
- ✅ Clearer code - grid plane orientation is obvious from vertex coordinates

#### Option 2: Exact Rational Rotation Values
Replace π with exact algebraic rotation values (if Three.js supports quaternion-based rotations):

```javascript
// 90° rotation as quaternion: [sin(45°), 0, 0, cos(45°)] = [√2/2, 0, 0, √2/2]
// But this still uses trig under the hood...
```

**Problem:** This still relies on trigonometric concepts (even if values are exact).

#### Option 3: Deferred sqrt Rotation Matrices
Construct rotation matrices using deferred sqrt expansion (RT-acceptable):

```javascript
// 90° rotation around X-axis (XY plane)
// R = [1, 0, 0]
//     [0, 0,-1]
//     [0, 1, 0]
// No transcendental constants needed!
```

**Benefits:**
- ✅ Uses only exact integer matrix values
- ✅ No π usage
- ⚠️ Still uses rotation concept (arguably classical)

### Recommendation

**Implement Option 1 (Custom Grid Construction)** in future RT purity enhancement phase.

**Rationale:**
1. Most philosophically pure - explicit coordinate construction
2. No hidden trigonometry or rotation matrices
3. Code clarity matches RT pedagogical goals
4. Performance should be equivalent to GridHelper

### Implementation Plan (Future Phase)

1. **Create `createRTPureGrid()` helper function** (15 min)
2. **Replace all THREE.GridHelper calls** with custom grids (10 min)
3. **Remove all Math.PI usage** from codebase (5 min)
4. **Verify visual output identical** to current grids (5 min)
5. **Update documentation** noting RT purity achievement (5 min)

**Estimated Time:** 40 minutes
**Risk:** LOW - Grid construction is straightforward, easy to test visually

### Other Classical Trig Usage - Audit Required

**Search for:**
- `Math.sin`, `Math.cos`, `Math.tan`
- `Math.asin`, `Math.acos`, `Math.atan`, `Math.atan2`
- `Math.PI` (currently only in grid rotations ✅)

**Status:** Preliminary audit shows:
- ✅ Geodesic sphere projections: RT-pure (golden ratio φ only)
- ✅ Polyhedra construction: RT-pure (algebraic coordinates)
- ✅ Edge validation: RT-pure (quadrance calculations)
- ⚠️ Grid rotations: Math.PI usage (documented above)
- ⏳ Need full codebase search to verify no other violations

### Success Criteria

**RT Purity Achieved When:**
- [ ] Zero `Math.PI` usage in codebase
- [ ] Zero `Math.sin/cos/tan/asin/acos/atan` usage in codebase
- [ ] All geometry constructed from explicit coordinates or RT-pure formulas
- [ ] All calculations use quadrance Q and spread s (no distances or angles)
- [ ] √ (sqrt) used only for final visualization (deferred expansion acceptable)
- [ ] Documentation explicitly states "100% RT-pure implementation"

---

## TODO: Quadray Coordinate Plane Visualization (WXYZ Planes)

**Status:** 📋 Planned (Documented 2025-12-26)
**Priority:** HIGH - Foundation for Phase 2.8 (Quadray Polygonal Frequency Projections)
**Related to:** Phase 2.7 Geodesic subdivision, Phase 3 4D coordinate systems

### Objective

Implement Quadray (WXYZ) coordinate plane visualization analogous to the existing Cartesian (XYZ) plane toggles, enabling users to visualize the tetrahedral basis of the 4D coordinate system.

### Background: Quadray Coordinate System

**Quadray Basis Vectors:**
Four vectors from origin to vertices of a regular tetrahedron:
```javascript
// Normalized to unit length
W: ( 1,  1,  1) / √3   // Basis vector 0
X: ( 1, -1, -1) / √3   // Basis vector 1
Y: (-1,  1, -1) / √3   // Basis vector 2
Z: (-1, -1,  1) / √3   // Basis vector 3

// Zero-sum property: W + X + Y + Z = (0, 0, 0)
// Any point P = (w,x,y,z) where w + x + y + z = 0 (zero-sum normalization)
```

**Tetrahedral Planes:**
Six planes defined by pairs of basis vectors (analogous to XY, XZ, YZ in Cartesian):
- **WX plane** (Z=0, Y=0 in Quadray space)
- **WY plane** (Z=0, X=0 in Quadray space)
- **WZ plane** (Y=0, X=0 in Quadray space)
- **XY plane** (Z=0, W=0 in Quadray space)
- **XZ plane** (Y=0, W=0 in Quadray space)
- **YZ plane** (X=0, W=0 in Quadray space)

### Conceptual Design

**Analogous to Cartesian Planes:**

Current implementation (XYZ Cartesian):
```
☑ Grid Planes
  ☑ XY Plane (horizontal - Z=0)
  ☐ XZ Plane (vertical wall - Y=0)
  ☐ YZ Plane (vertical wall - X=0)
```

**Proposed addition (WXYZ Quadray):**
```
☑ Quadray Planes (Tetrahedral Basis)
  ☐ WX Plane (triangular grid)
  ☐ WY Plane (triangular grid)
  ☐ WZ Plane (triangular grid)
  ☐ XY Plane (triangular grid)
  ☐ XZ Plane (triangular grid)
  ☐ YZ Plane (triangular grid)
```

### Key Differences from Cartesian Grids

**1. Origin Representation:**
- **Cartesian XYZ**: Origin at (0,0,0) - clearly visible intersection point
- **Quadray WXYZ**: Origin is **infinitesimally small tetrahedron** - DO NOT ATTEMPT TO DRAW
- The "origin" in Quadray space is the tetrahedral center where all 4 basis vectors meet
- Mathematically: (0,0,0,0) in Quadray = (0,0,0) in Cartesian

**2. Grid Structure:**
- **Cartesian**: Rectangular grids (perpendicular X/Y lines, X/Z lines, Y/Z lines)
- **Quadray**: **Triangular grids** on each plane (basis vectors at 60° angles)
- Each Quadray plane is a 2D triangular lattice formed by two basis vectors

**3. Extent:**
- **Cartesian**: Grids extend symmetrically from origin (-N to +N)
- **Quadray**: Grids extend from **infinitesimal inner tetrahedron** to **larger outer extent tetrahedron**
- Inner extent: Near zero (don't visualize the infinitesimal origin)
- Outer extent: Configurable radius (e.g., same as current grid size)

### RT-Pure Implementation Strategy

**Step 1: Define Quadray Basis in Cartesian Coordinates**

```javascript
const RT_Quadray = {
  // Basis vectors (normalized to unit length)
  basis: [
    new THREE.Vector3( 1,  1,  1).normalize(),  // W
    new THREE.Vector3( 1, -1, -1).normalize(),  // X
    new THREE.Vector3(-1,  1, -1).normalize(),  // Y
    new THREE.Vector3(-1, -1,  1).normalize()   // Z
  ],

  // Verify zero-sum property
  verifyZeroSum: function() {
    const sum = this.basis.reduce((acc, v) =>
      acc.add(v.clone()), new THREE.Vector3(0,0,0));
    return sum.length() < 1e-10;  // Should be ~0
  }
};
```

**Step 2: Generate Triangular Grid on Quadray Plane**

**CRITICAL PRINCIPLE:** Generate grids using the SAME RT-pure tessellation method as tetrahedron frequency divisions (Phase 2.7c). This ensures:
- Proper 60° equilateral triangular lattice (NOT parallelograms or rhombuses)
- Functionally equivalent to tetrahedron 'Flat' projection
- Pure barycentric subdivision in algebraic space
- No angle calculations, no degrees, RT-pure vector arithmetic only

**Triangular Lattice Fundamental:**
For proper triangular grid, need THREE line families (not two):
1. **Lines parallel to basis1** - displaced along basis2 direction at unit intervals
2. **Lines parallel to basis2** - displaced along basis1 direction at unit intervals
3. **Lines parallel to (basis1 + basis2)** - displaced perpendicular to (basis1 + basis2) at unit intervals

**CRITICAL:** All three directions must be PARALLEL line families, NOT radiating fans from origin!
Each family consists of parallel lines offset at unit intervals in the perpendicular direction.

The third direction forms the characteristic 60° equilateral triangle pattern by intersecting
the parallelograms created by directions 1 and 2, dividing each into two triangles.

```javascript
/**
 * Create triangular grid for a Quadray plane defined by two basis vectors
 * RT-PURE: Uses same tessellation method as tetrahedron frequency subdivisions
 *
 * TRIANGULAR LATTICE: Three line families form equilateral triangles (60° angles)
 * - Direction 1: basis1
 * - Direction 2: basis2
 * - Direction 3: basis1 + basis2 (creates proper triangular grid)
 *
 * When Project='Flat', tetrahedron geodesic vertices lie EXACTLY on these grids!
 *
 * @param {THREE.Vector3} basis1 - First basis vector (e.g., W)
 * @param {THREE.Vector3} basis2 - Second basis vector (e.g., X)
 * @param {number} minExtent - Inner radius (near-zero, avoid origin singularity)
 * @param {number} maxExtent - Outer radius (tetrahedral boundary)
 * @param {number} divisions - Grid subdivisions (frequency parameter)
 * @param {number} color - Grid line color
 * @returns {THREE.LineSegments} Triangular grid geometry
 */
function createQuadrayPlaneGrid(basis1, basis2, minExtent, maxExtent, divisions, color) {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  // RT-PURE triangular lattice generation
  // Same principle as tetrahedron barycentric subdivision
  const step = (maxExtent - minExtent) / divisions;

  // DIRECTION 1: Lines parallel to basis1
  // Displaced along basis2 direction
  for (let i = 0; i <= divisions; i++) {
    const offset = minExtent + i * step;
    const displacement = basis2.clone().multiplyScalar(offset);

    // Line endpoints along basis1 direction
    const start = displacement.clone().add(basis1.clone().multiplyScalar(minExtent));
    const end = displacement.clone().add(basis1.clone().multiplyScalar(maxExtent));

    vertices.push(start.x, start.y, start.z);
    vertices.push(end.x, end.y, end.z);
  }

  // DIRECTION 2: Lines parallel to basis2
  // Displaced along basis1 direction
  for (let i = 0; i <= divisions; i++) {
    const offset = minExtent + i * step;
    const displacement = basis1.clone().multiplyScalar(offset);

    // Line endpoints along basis2 direction
    const start = displacement.clone().add(basis2.clone().multiplyScalar(minExtent));
    const end = displacement.clone().add(basis2.clone().multiplyScalar(maxExtent));

    vertices.push(start.x, start.y, start.z);
    vertices.push(end.x, end.y, end.z);
  }

  // DIRECTION 3: Lines parallel to (basis1 + basis2)
  // This is the CRITICAL third direction that creates proper triangular lattice
  // Must be PARALLEL lines (not radiating fan from origin!)
  // Displaced perpendicular to (basis1 + basis2) at unit intervals

  const diagonal = basis1.clone().add(basis2);  // Direction of third line family
  const perpDirection = basis2.clone().sub(basis1);  // Perpendicular displacement direction

  // Normalize perpendicular direction for unit spacing
  const perpUnit = perpDirection.clone().normalize();

  // Generate parallel lines displaced at unit intervals perpendicular to diagonal
  for (let i = 0; i <= divisions; i++) {
    const displacement = perpUnit.clone().multiplyScalar(i * step);

    // Line parallel to diagonal, displaced by 'displacement' amount
    // Line extends from origin+displacement along diagonal direction
    const start = displacement.clone();
    const end = displacement.clone().add(diagonal.clone().multiplyScalar(maxExtent));

    vertices.push(start.x, start.y, start.z);
    vertices.push(end.x, end.y, end.z);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.3  // Subtle visualization (don't overpower polyhedra)
  }));
}
```

**Connection to Tetrahedron Frequency Divisions:**

The Quadray plane grids are functionally EQUIVALENT to tetrahedron frequency divisions when `Project = 'Flat'`:

```javascript
// Tetrahedron frequency subdivision (Phase 2.7c)
// Subdivides triangular face using barycentric coordinates
function subdivideTriangleFace(v0, v1, v2, frequency) {
  const vertices = [];
  const step = 1 / frequency;

  // Barycentric subdivision - same principle as Quadray grid!
  for (let i = 0; i <= frequency; i++) {
    for (let j = 0; j <= frequency - i; j++) {
      const k = frequency - i - j;

      // Barycentric weights (u, v, w) where u+v+w=1
      const u = i * step;
      const v = j * step;
      const w = k * step;

      // Vertex position: u*v0 + v*v1 + w*v2 (same as grid intersection!)
      const vertex = v0.clone().multiplyScalar(u)
                        .add(v1.clone().multiplyScalar(v))
                        .add(v2.clone().multiplyScalar(w));
      vertices.push(vertex);
    }
  }
  return vertices;
}
```

**Why This Matters:**

1. **Mathematical Consistency**: Both use barycentric/simplicial coordinate subdivision
2. **Visual Equivalence**: Flat tetrahedron geodesic vertices align perfectly with Quadray grid intersections
3. **RT Purity**: Pure algebraic vector arithmetic, no angles or trigonometry
4. **Educational Value**: Shows that Quadray planes ARE the coordinate system for tetrahedral tessellation
5. **Foundation for Phase 2.8**: Polygonal frequency projections use these same grids

**RT Purity Verification:**
- ✅ NO angle calculations (no degrees, no radians)
- ✅ NO trigonometric functions (no sin, cos, tan)
- ✅ Only vector addition, scalar multiplication, and length
- ✅ Three line families create equilateral triangles via vector relationships
- ✅ Same subdivision principle as tetrahedron frequency divisions

**Step 3: Create All 6 Quadray Planes**

```javascript
// In scene initialization
const quadrayGrids = {
  WX: createQuadrayPlaneGrid(RT_Quadray.basis[0], RT_Quadray.basis[1], 0.1, 10, 10, 0xff00ff),
  WY: createQuadrayPlaneGrid(RT_Quadray.basis[0], RT_Quadray.basis[2], 0.1, 10, 10, 0x00ffff),
  WZ: createQuadrayPlaneGrid(RT_Quadray.basis[0], RT_Quadray.basis[3], 0.1, 10, 10, 0xffff00),
  XY: createQuadrayPlaneGrid(RT_Quadray.basis[1], RT_Quadray.basis[2], 0.1, 10, 10, 0xff0000),
  XZ: createQuadrayPlaneGrid(RT_Quadray.basis[1], RT_Quadray.basis[3], 0.1, 10, 10, 0x00ff00),
  YZ: createQuadrayPlaneGrid(RT_Quadray.basis[2], RT_Quadray.basis[3], 0.1, 10, 10, 0x0000ff)
};

// Add to scene (initially hidden)
Object.values(quadrayGrids).forEach(grid => {
  grid.visible = false;
  scene.add(grid);
});
```

### UI Integration

**Add Quadray Plane Toggles:**

```html
<!-- In controls panel -->
<div class="control-group">
  <label class="section-header">
    <input type="checkbox" id="quadrayPlanesToggle">
    Quadray Planes (WXYZ)
  </label>
  <div id="quadrayPlaneControls" style="margin-left: 20px;">
    <label><input type="checkbox" id="planeWX"> WX Plane</label><br>
    <label><input type="checkbox" id="planeWY"> WY Plane</label><br>
    <label><input type="checkbox" id="planeWZ"> WZ Plane</label><br>
    <label><input type="checkbox" id="planeXY_quadray"> XY Plane (Quadray)</label><br>
    <label><input type="checkbox" id="planeXZ_quadray"> XZ Plane (Quadray)</label><br>
    <label><input type="checkbox" id="planeYZ_quadray"> YZ Plane (Quadray)</label><br>
  </div>
</div>
```

### Connection to Phase 2.8: Polygonal Great Spheres

**Quadray Planes as Geodesic Projection Surfaces:**

The six Quadray planes become the **projection surfaces** for Phase 2.8 geodesic subdivision:

1. **Traditional approach**: Project subdivided faces onto sphere (causes distortion on tet/octa)
2. **Quadray approach**: Project subdivided vertices onto **coplanar Quadray planes** first
3. **Result**: Uniform triangulation using tetrahedral symmetry instead of spherical geometry

**Mathematical Foundation:**
- Each Quadray plane pair (e.g., WX) defines a **great circle** analog in tetrahedral space
- Subdividing along these planes creates **polygonal frequency patterns** (triangles, hexagons, dodecagons)
- Frequencies: 3 (triangle), 6 (hexagon), 12 (dodecagon), etc.
- These polygonal grids naturally distribute vertices uniformly

**Novel Discovery (Phase 2.7):**
Using Quadray plane projections instead of spherical normalization may eliminate the non-uniform triangle distortion observed in tetrahedron/octahedron geodesics.

### RT Purity Considerations

**✅ RT-Pure Elements:**
- Basis vectors: Exact algebraic coordinates (±1/√3 combinations)
- Zero-sum normalization: Pure algebraic constraint (w+x+y+z=0)
- Triangular lattice: Integer coordinate relationships
- No angles calculated (only vector directions)

**⚠️ Considerations:**
- Grid line construction uses vector arithmetic (RT-acceptable)
- Basis vector normalization requires √3 (deferred expansion - acceptable)
- Plane intersections computed algebraically (RT-pure)

### Visual Design

**Appearance:**
- **Subtle transparency** (opacity ~0.3) - don't overpower polyhedra
- **Distinct colors** per plane (6 colors for 6 planes)
- **Triangular lattice** pattern clearly visible
- **Infinitesimal inner extent** (start at r ≈ 0.1, not 0) - avoid origin singularity
- **Outer extent** matches current grid size (configurable)

**Interaction:**
- Toggle individual planes on/off
- Master toggle for all Quadray planes
- Coordinate with Cartesian grid toggles (can show both simultaneously for comparison)
- Option to show Quadray basis vectors as colored arrows from origin

### Educational Value

**Demonstrates:**
1. **Tetrahedral symmetry** vs Cartesian orthogonal symmetry
2. **4D coordinate basis** projected into 3D space
3. **Zero-sum constraint** visualization (basis vectors sum to zero)
4. **Alternative coordinate systems** for same 3D space
5. **Foundation for Phase 2.8** geodesic subdivision approach

**User Learning:**
- Compare Cartesian vs Quadray plane orientations
- Understand how 4 basis vectors define 3D space
- Visualize tetrahedral coordinate structure
- Prepare conceptually for 4D space (Phase 3)

### Implementation Checklist

**Phase 1: Basic Visualization** ✅ COMPLETE (2025-12-27)
- ✅ Define RT_Quadray basis vectors in Cartesian coordinates
- ✅ Implement `createQuadrayPlaneGrid()` with barycentric point generation
- ✅ Create all 6 Quadray planes (WX, WY, WZ, XY, XZ, YZ)
- ✅ Add UI toggles in 2×3 grid layout for all 6 planes
- ✅ Verify zero-sum property in console logging
- ✅ Brighten WY and YZ plane colors for better visibility

**Phase 2: Refinement** ✅ COMPLETE (2025-12-28)
- ✅ Remove extraneous diagonal edges (leftover from parallelogram approach)
- ✅ Add color-coding per plane with transparency (opacity 0.3)
- ✅ Infinitesimal inner extent avoided (minExtent = 0.0, origin dimensionless)
- ✅ **Grid interval set to √6/4** - Unit tetrahedron OutSphere radius (IVM fundamental unit)
- ✅ **Tetrahedron edge length as primary scaling unit** - Exact alignment at integer edge lengths
- ✅ **Dual slider system implemented** - Linked Cube/Tet sliders with 0.10 interval snapping
  - **Grid Interval:** Fixed at √6/4 ≈ 0.6124 (unit tetrahedron centroid-to-vertex distance)
  - **Tetrahedron Primary:** Edge length 1, 2, 3, 4, 5... → OutSphere at 1×, 2×, 3×, 4×, 5× grid interval
  - **IVM Compatibility:** Grid represents fixed octet spaceframe structure (all units same size)
  - **RT-Pure Precision:** √ expansion deferred, full double precision maintained
- ⏳ Add Quadray basis vector arrows (optional visualization) - *deferred*
- ✅ Document Quadray coordinate conventions in comments

**Phase 3: Integration with Phase 2.8**
- [ ] Use Quadray planes as projection surfaces for geodesic subdivision
- [ ] Implement polygonal frequency patterns (3, 6, 12 frequency grids)
- [ ] Create geodesic vertices at plane/frequency intersections
- [ ] Compare results with traditional spherical projection

### Success Criteria

**Quadray Plane Visualization Complete When:**
- [ ] All 6 Quadray planes render correctly as triangular grids
- [ ] Individual plane toggles work in UI
- [ ] Planes start at infinitesimal inner extent (not visible origin singularity)
- [ ] Planes extend to configurable outer tetrahedral boundary
- [ ] Visual style is subtle and doesn't overpower polyhedra
- [ ] Zero-sum property verified (W+X+Y+Z = 0 within tolerance)
- [ ] Documentation explains Quadray coordinate system clearly
- [ ] Foundation established for Phase 2.8 geodesic projections

### Related Documentation

- **Tom Ace Quadray C++ Reference**: Lines 1224-1446 (rotation, cross product, distance formulas)
- **Phase 2.7**: Geodesic subdivision with current spherical projection
- **Phase 2.8**: Quadray polygonal frequency projections (novel approach)
- **Phase 3**: Full 4D coordinate system implementation

---

## References

- **Wildberger's Rational Trigonometry:** [YouTube Series](https://www.youtube.com/playlist?list=PLs9SaLpcM3VTeXk9q_PL4_1c1lWKVeKpz)
- **WOMBAT Implementation:** `src/sections/Section19.js` (constraint-driven geometry)
- **WOMBAT Rendering:** `src/core/wombatRender.js` (isometric projection)
- **Three.js Docs:** [threejs.org](https://threejs.org/docs/)

---

## Open Questions for Andy

1. **4D Coordinate System:**
   - Which 4D system do you prefer? (WXYZ, Quadray, Caltrop) - TOGGLE for EACH so use can see differences. 
   - Any specific projection method for 4D → 3D? Shows solids in ISOMETRIC AXONOMETRY view which can allow a centred orbit. (view from above)
   - Should W-axis represent time, or pure spatial dimension? W is literally a 4th axis in the space, so the face Normals of a Tetrahedron basically define the spatial matrix, see Tom Ace solution below. 

2. **Visual Preferences:**
   - Color scheme for nested polyhedra? Blue vectors and nodes for cube, each additional polyhedron can have its own colour, I can specify as we progress. 
   - Wireframe only, or semi-transparent faces? Semitransparent faces would be nice. The vectors we used in @wombatRender.js were kindof perfect, the hairlines for storey devisions are an appropriate weight to define the grid space in 3D/2D planes, where the edge vectors are appropriate for the primary polyhedral bondary vectors. 
   - Node size and edge thickness preferences? (Same as WombatRender.js)

3. **Interaction Model:**
   - Rotation speed (orbit controls sensitivity)? Still on load, user can mouse or touch spin with easing...
   - Should polyhedra auto-rotate, or user-controlled only?
   - Touch/mobile support needed? Later, not immediate conscern

4. **Geometry Scope:**
   - Start with Platonic solids only, or include Archimedean? Platonic for now, with Rhombic Dodec as symmetrical sister to Icosahedron. 
   - Interest in geodesic domes (subdivided icosahedron)? Absolutely, all polyhedra will aim to have this kind of smart subdivision feature, but always observing rational trig rules. (Wildberger). 
   - Dual polyhedra visualization (show both at once)? Yes, show dual can be an option for any selected polyhedron. Starting with Dual Tetrehedra within cube boundary. 

---

**Status:** Work plan complete, ready for Phase 1 implementation upon approval.


## Add'l QUADRAYS support material: ## 
Quadrays are a 4-coordinate system for mapping space, described in detail
on Kirby Urner's page at http://www.grunch.net/synergetics/quadintro.html.

Briefly:  quadrays use four basis vectors, configured in directions
from the center of a regular tetrahedron towards its four vertices.
A point at (a,b,c,d) is a linear combination of the four basis vectors.
These are also known as tetrahedral coordinates; the general 
n‑dimensional term is simplicial coordinates.

As the four quadray basis vectors sum to zero, multiples of (1,1,1,1)
may be added to quadray coordinates (a,b,c,d) without changing the 
point in space being referred to.  Various methods of normalizing
coordinates are possible.  Kirby Urner's quadintro.html page discusses
a form of normalization that minimizes the values of a, b, c, and d
while keeping them all non-negative.  Choosing (a,b,c,d) such that
a+b+c+d=1 gives barycentric coordinates.  Choosing (a,b,c,d) such that
a+b+c+d=0 facilitates computation by exploiting an isomorphism
described at http://minortriad.com/q4d.html.

A few quadray formulas are coded below in C++, with comments about
the method used and how [Tom] derived it.  (I haven't included trivial
methods like translation and scaling.)  This document, saved as text,
compiles as ANSI C++.  There is no warranty of fitness for purpose,
nor of anything else.

Kirby's page at http://www.grunch.net/synergetics/quadphil.html considers 
some philosophical and aesthetic implications of quadrays.  From my 
experience, one doesn't have to agree with all of Kirby's points to 
find quadrays interesting to play with.

Tom Ace


return to Tom's home page

*/

#include <math.h>

class Quadray {
public:
   double        Coords[4];
   double        A ()  const { return Coords[0]; }
   double        B ()  const { return Coords[1]; }
   double        C ()  const { return Coords[2]; }
   double        D ()  const { return Coords[3]; }
   double        &A()        { return Coords[0]; }
   double        &B()        { return Coords[1]; }
   double        &C()        { return Coords[2]; }
   double        &D()        { return Coords[3]; }

   void          ZeroSumNormalize();
   void          ZeroSumNormalize(const Quadray &QX);

   // dist and dot product are scaled so that basis vectors have unity length

   double        DistFrom      (const Quadray &Other) const;
   double        DistFromOrigin() const;

   static double DotProduct  (const Quadray &QX,const Quadray &QY);
   void          CrossProduct(const Quadray &QX,const Quadray &QY);

   void          RotateAboutA(const Quadray &QX,double Theta);
};

void  Quadray::ZeroSumNormalize()
{
   // normalizes *this to A+B+C+D==0

   double  Mean = (A() + B() + C() + D()) / 4.;
   for (int I = 0; I < 4; I++) Coords[I] -= Mean;
}

void  Quadray::ZeroSumNormalize(const Quadray &QX)
{
   // Sets *this to a quadray equivalent to QX, but with A+B+C+D==0

   double  Mean = (QX.A() + QX.B() + QX.C() + QX.D()) / 4.;
   for (int I = 0; I < 4; I++) Coords[I] = QX.Coords[I] - Mean;
}

double  Quadray::DistFromOrigin() const
{
   // returns distance from *this to (0,0,0,0)
   // method:  normalize, use Pythagorean distance dist formula, and scale
   // how this was derived:  see http://www.minortriad.com/q4d.html

   Quadray   QN;

   QN.ZeroSumNormalize(*this);
   double  DistSq = 0.;
   for (int I = 0; I < 4; I++) DistSq += QN.Coords[I] * QN.Coords[I];
   return sqrt(DistSq * 4. / 3.);
}

double  Quadray::DistFrom(const Quadray &Other) const
{
   // returns distance from *this to Other
   // method:  normalize, use Pythagorean distance formula, and scale
   // how this was derived:  see http://www.minortriad.com/q4d.html

   Quadray   QN;
   Quadray   OtherN;

   QN    .ZeroSumNormalize(*this);
   OtherN.ZeroSumNormalize(Other);
   double  DistSq = 0.;
   for (int I = 0; I < 4; I++) {
      double  Delta = QN.Coords[I] - OtherN.Coords[I];
      DistSq += Delta * Delta;
   }
   return sqrt(DistSq * 4. / 3.);
}

double  Quadray::DotProduct(const Quadray &QX,const Quadray &QY)
{
   // returns QX . QY  (dot product of two vectors)
   // method:  normalize, apply traditional Cartesian formula, and scale
   // how this was derived:  see http://www.minortriad.com/q4d.html

   Quadray   QXN,QYN;

   QXN.ZeroSumNormalize(QX);
   QYN.ZeroSumNormalize(QY);
   double Dot = 0.;
   for (int I = 0; I < 4; I++) Dot += QXN.Coords[I] * QYN.Coords[I];
   return Dot * 4. / 3.;
}

void  Quadray::CrossProduct(const Quadray &QX,const Quadray &QY)
{
   // sets *this to QX x QY  (vector cross product)
   // method:  calculate a determinant (by Laplace development on the top row)
   //          (somewhat reminiscent of Cartesian cross product determinant)
   // how this was derived:  by intuition; 
   //                        verified (and k determined) empirically; 
   //                        can be motivated by the 4-D correspondence

   // The determinant is as follows.  The top row consists of the
   // four basis vectors; all other elements in the matrix are scalars.  
   
   double  k = sqrt(3.) / 3.;

   //    |  A       B       C       D      |
   //    |                                 |
   //    |  k       k       k       k      |
   //    |                                 |
   //    |  QX.A()  QX.B()  QX.C()  QX.D() |
   //    |                                 |
   //    |  QY.A()  QY.B()  QY.C()  QY.D() |

   double  Cross[4];

   Cross[0] = k * (  QX.C() * QY.D() - QX.D() * QY.C()
                   + QX.D() * QY.B() - QX.B() * QY.D()
                   + QX.B() * QY.C() - QX.C() * QY.B());

   Cross[1] = k * (  QX.D() * QY.C() - QX.C() * QY.D()
                   + QX.A() * QY.D() - QX.D() * QY.A()
                   + QX.C() * QY.A() - QX.A() * QY.C());

   Cross[2] = k * (  QX.A() * QY.B() - QX.B() * QY.A()
                   + QX.D() * QY.A() - QX.A() * QY.D()
                   + QX.B() * QY.D() - QX.D() * QY.B());

   Cross[3] = k * (  QX.C() * QY.B() - QX.B() * QY.C()
                   + QX.A() * QY.C() - QX.C() * QY.A()
                   + QX.B() * QY.A() - QX.A() * QY.B());

   for (int I = 0; I < 4; I++) Coords[I] = Cross[I];
}

static inline double SumOfProducts(
   const Quadray  &QX,
   double A,double B,double C,double D)
{
   return QX.A() * A + QX.B() * B + QX.C() * C + QX.D() * D;
}

class RotationCoeffs {
public:
   double   F,G,H;

   RotationCoeffs(double Theta)    // ctor
   {
      static const double  RAD_PER_DEG = M_PI / 180.;
      F = (2. * cos((Theta       ) * RAD_PER_DEG) + 1.) / 3.;
      G = (2. * cos((Theta - 120.) * RAD_PER_DEG) + 1.) / 3.;
      H = (2. * cos((Theta + 120.) * RAD_PER_DEG) + 1.) / 3.;
   }
};

void  Quadray::RotateAboutA(const Quadray &QX,double Theta)
{
   // sets *this equal to QX, rotated Theta degrees about A
   // method:  multiply the following matrix by QX:
   //
   //   1  0  0  0        where
   //   0  F  H  G              F = (2 * cos(Theta      ) + 1) / 3
   //   0  G  F  H              G = (2 * cos(Theta - 120) + 1) / 3
   //   0  H  G  F              H = (2 * cos(Theta + 120) + 1) / 3
   //
   // This is an orthogonal matrix (its transpose is its inverse).
   // Note that F + G + H == 1 and F*F + G*G + H*H == 1.
   //
   // How this was derived:  a bunch of algebra and trig.  I later
   //                        developed a method for rotation about any
   //                        desired axis but I haven't coded that yet.
   
   // Andy Comment: Rationalize above and use spread above and below

   RotationCoeffs    RC(Theta);

   double  Rotated[4];

   Rotated[0] = QX.A();
   Rotated[1] = SumOfProducts(QX,0.,RC.F,RC.H,RC.G);
   Rotated[2] = SumOfProducts(QX,0.,RC.G,RC.F,RC.H);
   Rotated[3] = SumOfProducts(QX,0.,RC.H,RC.G,RC.F);
   
   for (int I = 0; I < 4; I++) Coords[I] = Rotated[I];
}