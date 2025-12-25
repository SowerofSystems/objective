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
- ✅ **Rhombic Dodecahedron** - 14 vertices, 24 edges, 12 faces (dual of cuboctahedron)

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

## Current Status (as of 2025-12-24)

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

**Recent Completion:**
- Dodecahedron with correct "hip roof pup tent" topology
- Dual icosahedron with spread-based rotation for perfect alignment
- RT.Phi library with symbolic golden ratio operations
- Spread/cross rotation implementation (Wildberger principles)

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

### Deliverable: Multi-Stage Geodesic Visualization

**Objective:** Separate geodesic subdivision from sphere projection to educate users on the process while maintaining RT purity.

**Current Problem:**
- Users see only final result (subdivided + projected)
- Cannot see subdivision happening on flat polyhedron faces
- Cannot compare different sphere projection radii
- Process appears as "black box"

**Solution: Two-Stage Process with Three Sphere Options**

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

1. **Add RT sphere quadrance functions** (ARTexplorer.html RT library)
2. **Update geodesicTetrahedron()** with stage 1 & 2 separation
3. **Create UI controls** for subdivide + 3 sphere checkboxes
4. **Render multiple projections** simultaneously with color coding
5. **Console logging** showing Q_inner, Q_mid, Q_outer validation
6. **Test and refine** with tetrahedron before extending to octa/icosa

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