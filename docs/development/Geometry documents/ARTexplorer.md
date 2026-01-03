# ThreeRT - Three.js + Rational Trigonometry Geometry Explorer
- Credits and thanks: Co-developed from the ideas of R. Buckminster Fuller, Kirby Urner, Tom Ace, NJ Wildberger and Andy Thomson, witnessed silently by Metatron.

---

## Table of Contents

### 1. Project Overview
- [1.1 Introduction](#11-introduction)
- [1.2 On Dimensions and Coordinate Systems](#12-on-dimensions-and-coordinate-systems)
- [1.3 Core Philosophy](#13-core-philosophy)
- [1.4 File Structure](#14-file-structure)
- [1.5 Related Documentation](#15-related-documentation)

### 2. Current Status
- [2.1 Current Status (2025-12-30)](#21-current-status-as-of-2025-12-30)
- [2.2 Recent Completion](#22-recent-completion-2025-12-30)

### 3. Implementation Phases
- [3.1 Phase 1: Foundation (MVP)](#31-phase-1-foundation-mvp--complete)
- [3.2 Phase 1b: Dodecahedron Implementation](#32-phase-1b-dodecahedron-implementation--complete)
- [3.3 Phase 1c: Cuboctahedron (VE)](#33-phase-1c-cuboctahedron-vector-equilibrium-implementation--complete)
- [3.4 Phase 2.5: RT Purity Enhancements](#34-phase-25-rt-purity-enhancements--complete)
- [3.5 Phase 2.6: Dual Icosahedron](#35-phase-26-dual-icosahedron-implementation--complete)
- [3.6 Phase 2.7: Geodesic Spheres](#36-phase-27-geodesic-sphere-implementation--complete)
- [3.7 Phase 2.8: Central Angle Grids](#37-phase-28-quadray-coordinate-planes-central-angle-grids--complete)
- [3.8 Phase 2.9: Geodesic Projections](#38-phase-29-geodesic-sphere-projections--complete)
- [3.9 Phase 2.10: Z-Up Coordinate Convention](#39-phase-210-z-up-coordinate-convention--complete)
- [3.10 Phase 2.11: ART Gumball + StateManager](#310-phase-211-art-gumball--statemanager--complete)

### 4. Technical Reference
- [4.1 Rational Trigonometry Implementation](#41-rational-trigonometry-implementation)
- [4.2 Quadray Coordinates (Tom Ace)](#42-quadray-coordinates-tom-ace)
- [4.3 Grid Systems](#43-grid-systems)
- [4.4 Polyhedra Specifications](#44-polyhedra-specifications)

### 5. Work Plan & Roadmap
- [5.1 Completed Items](#51-completed-items)
- [5.2 TODO: Active Work Items](#52-todo-active-work-items)
- [5.3 TODO: Future Enhancements](#53-todo-future-enhancements)
- [5.4 Open Questions](#54-open-questions-answered)

---

## 1. Project Overview

### 1.1 Introduction

Standalone HTML + Three.js (CDN) application for exploring polyhedral geometry using Rational Trigonometry principles. Built on the constraint-driven successes of WOMBAT (Section 19), this tool visualizes nested polyhedra in both 3D (XYZ) and 4D (WXYZ/Quadray/Caltrop) coordinate spaces.

### 1.2 On Dimensions and Coordinate Systems

Cartesian 3D space requires **3 orthogonal axes** but Fuller's tetrahedral space requires **4 equiangular axes**. This doesn't make space "4D" in the physics sense (you still have 3 degrees of freedom for position), but it does mean that natural spatial coordinatization is fundamentally 4-fold, not 3-fold.

The common assertion that "time is the 4th dimension" conflates three separate concepts:
1. The **geometric fact** that Cartesian space uses 3 axes (an arbitrary choice)
2. With the **assumption** that spatial dimensions must therefore = 3 (demonstrably false)
3. Leading to the **conclusion** that any 4th dimension must be non-spatial (misleading)

In physics, "dimension" means **degrees of freedom** - independent ways a system can vary. In geometry, "dimension" refers to **coordinate axes** needed to naturally describe space. Fuller was correct: **spatial geometry is inherently 4-fold** (tetrahedral), and Cartesian reduction to 3 axes is a convenient but limiting convention that obscures the natural symmetry of space.

### 1.3 Core Philosophy
- No Three.js preset forms (Box, Sphere, etc.)
- Hand-coded geometry using Rational Trigonometry (Wildberger)
- Quadrance (Q = distance²) and spread (s) instead of distance/angle
- Nested polyhedra relationships
- Pure algebraic solutions (no iteration, no trig functions)

### 1.4 File Structure

**Modularized Architecture:**

```
src/geometry/
├── ARTexplorer.html          # Main application (HTML structure + inline logic)
├── art.css                   # Extracted stylesheet (UI panels, controls, buttons)
└── modules/
    ├── rt-math.js            # Quadray coordinate system & RT math library
    ├── rt-polyhedra.js       # Polyhedra geometry definitions (vertices, faces, edges)
    ├── rt-rendering.js       # Three.js rendering utilities (meshes, lines, nodes)
    ├── rt-state-manager.js   # Forms/Instances state management + undo/redo
    └── rt-controls.js        # Gumball editing controls (Move/Scale) [INLINE for now]

docs/development/Geometry documents/
├── ARTexplorer.md            # This file - Main documentation
├── ART-Gumball.md           # Gumball interaction design specifications
├── Module-Extraction-Analysis.md  # Analysis of module extraction attempts
├── Quadray-Grid.md          # Central Angle Grid implementation details
├── UI-Module.md             # UI/UX design patterns and controls
└── Kieran-Math.md           # Mathematical foundations and RT formulas
```

**Code Organization:**
- **ARTexplorer.html**: ~3600 lines (reduced from ~3800 via modularization) - Main app, scene setup, inline gumball, event handlers
- **art.css**: ~760 lines - All styling extracted for maintainability
- **rt-math.js**: Quadray class, conversions (XYZ ↔ WXYZ), RT formulas
- **rt-polyhedra.js**: All polyhedra definitions with RT-pure vertex calculations
- **rt-rendering.js**: Three.js rendering abstraction (faces, edges, nodes)
- **rt-state-manager.js**: Forms (templates) vs Instances (snapshots) architecture
- **performance-clock.js**: Performance tracking module (Clock.js pattern from TEUI)
- **rt-controls.js**: Gumball module (NOT currently active - see Module-Extraction-Analysis.md)

### 1.5 Performance Monitoring & The "Fair Fight" Question

**Added:** 2026-01-01

#### The Truth About RT Performance Benefits

When comparing RT (Rational Trigonometry) geodesic nodes vs Classical THREE.js spheres, it's important to understand **what we're actually measuring**.

**❌ What We're NOT Comparing:**
- **Runtime "Rational Algebra" Computation** - Once geometries become `THREE.BufferGeometry`, both become irrational floating-point vertex arrays in GPU memory
- **GPU Rendering Speed** - THREE.js renders all triangles identically, regardless of how they were generated
- **Real-time RT vs Trig Calculation** - The algebraic advantage exists only during geometry generation, not rendering

**✅ What We ARE Comparing:**
1. **Generation Speed** - RT algebraic calculations (quadrance/spread) vs classical trigonometry (sin/cos) during initial geometry creation
2. **Triangle Count Efficiency** - RT geodesic subdivision produces better geometric distribution than UV sphere tessellation
3. **Memory Footprint** - Fewer vertices = less GPU RAM usage
4. **Visual Quality per Triangle** - Geodesic distribution provides more uniform sphere approximation

**Current Results (Unequal Triangle Counts):**
- **RT Geodesic Octahedron (Freq-2)**: ~32 triangles per node
- **Classical THREE.js Sphere (16×16)**: 512 triangles per node
- **Performance Benefit**: 16x triangle reduction = faster rendering (but NOT from algebraic computation)

#### How to Make It a TRULY Fair Comparison

To honestly compare RT algebra vs classical trig **generation speed**:

1. **Match Triangle Counts**
   - Classical Sphere: 36 triangles (e.g., 6 segments × 6 rings)
   - RT Geodesic: 36 triangles (adjust frequency to match)

2. **Measure Generation Time ONLY**
   - Time the `geodesicOctahedron()` call vs `new THREE.SphereGeometry()` call
   - This isolates the algebraic advantage (where RT truly shines)

3. **Acknowledge GPU Reality**
   - Once created, both are `BufferGeometry` - GPU treats them identically
   - Rendering FPS should be equal if triangle counts match

4. **Compare Visual Quality at Equal Triangle Budget**
   - Does RT geodesic distribution look more spherical than UV sphere at same Δ count?
   - This demonstrates geometric efficiency, not computational advantage

#### Performance Clock Module

**File**: `src/geometry/modules/performance-clock.js`

Modeled after `src/core/Clock.js` from TEUI, tracks:
- **Calculation Time**: Full `updateGeometry()` execution
- **Node Generation Time**: Isolated timing for node creation
- **FPS**: 60-frame rolling average
- **Triangle Counts**: Scene-wide and per-vertex metrics

**Display Location**: Geometry Info section (auto-expanded)

**Key Metrics:**
| Metric | Purpose |
|--------|---------|
| Calculation | Full geometry rebuild speed |
| Node Gen | RT vs Classical generation comparison |
| FPS | Real-time rendering performance |
| Node Type | Current method (Classical/RT) |
| Node Δ | Triangles per vertex |
| Total Triangles | GPU rendering load |

#### Honest Takeaway

RT's computational advantage is **real** but **localized to generation**:
- ✅ Faster geometry creation (algebraic vs trig)
- ✅ Better geometric distribution (geodesic vs UV)
- ✅ Fewer triangles for equivalent visual quality
- ❌ No ongoing advantage during GPU rendering

The performance benefit we see is from **triangle reduction**, not runtime rational algebra. This is still valuable (fewer triangles = better performance), but it's important to be intellectually honest about what we're measuring.

**Key Architectural Decision:**
Gumball controls remain **inline** in ARTexplorer.html due to scope isolation issues. See [Module-Extraction-Analysis.md](Module-Extraction-Analysis.md) for detailed analysis of two extraction attempts and rationale for keeping inline implementation.

### 1.5 Related Documentation

**Core Documentation:**
- **[ARTexplorer.md](ARTexplorer.md)** (this file) - Complete project documentation, implementation phases, technical reference
- **[ART-Gumball.md](ART-Gumball.md)** - Gumball interaction design, Move/Scale/Rotate modes, handle specifications
- **[Module-Extraction-Analysis.md](Module-Extraction-Analysis.md)** - Detailed analysis of rt-controls.js extraction attempts, scope isolation issues, architectural recommendations

**Technical Reference:**
- **[Quadray-Grid.md](Quadray-Grid.md)** - Central Angle Grid system, tessellation patterns, 6-plane configuration
- **[Kieran-Math.md](Kieran-Math.md)** - Rational Trigonometry foundations, quadrance/spread formulas, algebraic identities
- **[UI-Module.md](UI-Module.md)** - UI/UX patterns, control panel design, keyboard shortcuts, visual feedback

**External References:**
- [Tom Ace - Quadray Coordinates (C++ implementation)](http://minortriad.com/quadray.html)
- [Kirby Urner - Quadray Introduction](http://www.grunch.net/synergetics/quadintro.html)
- [NJ Wildberger - Rational Trigonometry](https://www.youtube.com/user/njwildberger)
- [R. Buckminster Fuller - Synergetics](https://www.rwgrayprojects.com/synergetics/synergetics.html)

---

## 2. Current Status

### 2.1 Current Status (as of 2025-12-30)

**Phase 1 & 2: ✅ COMPLETE**
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

## 3. Implementation Phases

### 3.1 Phase 1: Foundation (MVP) ✅ COMPLETE

See section 2.1 for completed goals and implemented polyhedra.

### 3.2 Phase 1b: Dodecahedron Implementation ✅ COMPLETE

**Deliverable: "Hip Roof Pup Tent" Construction**

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

### 3.3 Phase 1c: Cuboctahedron (Vector Equilibrium) Implementation ✅ COMPLETE

**Deliverable: Fuller's IVM Foundation Polyhedron**

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
  <title>A.R.T. - Rational Trigonometry Geometry Explorer</title>
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

// Only take sqrt when needed for rotation matrix OPTIMIZE LATER FOR SPREAD per RT Purity
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

## Current Status (as of 2025-12-30)

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
- **Visual**: Blue Z-axis points UP (was green/Y before)
- **Grid Planes**: XY horizontal (ground), XZ/YZ vertical (walls)
- **Comments**: Updated all polyhedra vertex descriptions for Z-up interpretation
- **Rationale**: Preparing for glTF/DWG/GXF export compatibility with industry CAD standards

**Phase 2.11: ✅ COMPLETE (2025-12-30) - ART Gumball + StateManager**
- **Selection System**: Click-to-select with bright cyan highlight (0x00ffff, 0.8 intensity)
- **StateManager**: rt-state-manager.js module with Forms/Instances architecture
- **Move Tool**: WXYZ and XYZ dual coordinate systems with gumball handles
- **Keyboard Shortcuts**: ESC (deselect), Delete (remove instance), Cmd/Ctrl+Z (undo/redo)
- **NOW Button**: Deposits instances, resets Forms to origin, clears highlight
- **History**: 50-action undo/redo stack with createInstance/deleteInstance/updateInstance
- **Export**: JSON/CSV export functions for session persistence

### 2.2 Recent Completion (2025-12-30)

**Morning Session:**
- Click-to-select raycasting with visual highlight
- Forms vs Instances separation (templates vs snapshots)
- Delete key removes selected instances (Forms protected)
- Enhanced selection visibility (3x line width, bright cyan glow)
- Fixed deselection (ESC key + click empty space)
- Fixed NOW button highlight clearing

**Afternoon Session:**
- **Selection Precision Fix**: Reduced raycaster line threshold from 1.0 to 0.1 for precise edge selection
  - Previous: Could select forms from ~2x their width away (1 world unit threshold)
  - Fixed: Now requires clicking within 0.1 units of edges for accurate selection
  - Commit: 47d9fe6

- **Gumball Basis Vector Scaling**: Changed from fixed size (2√2) to dynamic sizing based on form's tetEdge
  - Basis vectors now scale proportionally with form size (OutSphere radius approximation)
  - Uses tetEdge slider value directly (more performant than bounding box calculation)
  - Handles extend outside forms for easier grabbing on geodesics
  - Commit: 759fa1b

- **Camera View Presets for Z-Up + Tetrahedral Geometry**: Fixed all 6 camera views for proper Z-up orientation
  - **Problem**: Side views showed tetrahedra as squares (edge-on) instead of triangular profiles
  - **Root Cause**: Code originally Y-up, only partially converted to Z-up; Front/Back positions swapped
  - **Solution**:
    - Swapped Front (0, -distance, 0) and Back (0, distance, 0) to match Z-up convention
    - Modified Left/Right views to use 45° angles in X-Y plane for tetrahedral triangular profiles
    - Left: (-distance/√2, -distance/√2, 0) - sees YZ plane at 45° angle
    - Right: (+distance/√2, +distance/√2, 0) - opposite 45° angle
  - **Result**: Side views now correctly show tetrahedral geometry (triangular profiles, not squares)
  - **Insight**: Cardinal axis views (pure X/Y/Z) show tetrahedra edge-on; 45° angles reveal natural triangular faces
  - **Reveals**: How Cartesian-optimized orthogonal views obscure tetrahedral geometry's natural structure
  - Commit: d038078

- **Scale Mode Implementation**: Gumball now supports scaling selected objects via cube handles
  - Scale cube handles positioned at form corners
  - Drag to scale form uniformly from origin
  - Uses same tetEdge-based sizing as Move mode handles
  - Preserves form proportions during scaling
  - Scale sensitivity increased from 0.1 to 15.0 for meaningful interaction
  - Commits: fdbfbd5, fbd043f, 1d19d9c, 80bafc0

---

## Interactive Mathematical Demos ✅

### Weierstrauss Circle Parametrization Demo (2026-01-03)

**Purpose:** Educational demonstration of Weierstrauss parametrization as a rational alternative to classical trigonometric circle parametrization.

**Location:** `src/geometry/demos/rt-weierstrauss-demo.js` (accessible via UI)

**Key Features:**
- **Draggable Point**: Interactive exploration of circle parametrization
- **Dual Formula Display**: Side-by-side comparison of Weierstrauss (RT) vs Traditional methods
- **Guide Geometry**: √2 square, √3 equilateral triangles, φ golden rectangles
- **Smart Snapping**: Quadrance-based snapping to special angles (cardinals, 45°, φ)
- **Visual Differentiation**: Tiny gold diamonds (0.03) for φ points, circles for others
- **Performance Visualization**: "Theatrical" bars showing theoretical GPU advantage

**RT Implementations:**
```javascript
// Weierstrauss parametrization: t = tan(θ/2)
x = r·(1-t²)/(1+t²)  // 8 rational operations
y = r·(2t)/(1+t²)

// vs Traditional (requires ~30 Taylor series terms)
x = r·cos(θ)
y = r·sin(θ)

// Spread calculation (no trig!)
spread = (y/radius)²  // Equivalent to sin²(θ)

// Quadrance-based snapping (no sqrt!)
snapQuadrance = dx² + dy²  // Distance² comparison
```

**Algebraic Geometry Construction:**
- **√2 points**: Normalize (1, 1) → (1/√2, 1/√2) for 45° angles
- **√3 points**: Normalize (√3, 1) → (√3/2, 1/2) for 30° angles
- **φ points**: Normalize (φ, 1) → (φ/√(φ²+1), 1/√(φ²+1)) for golden angles

**Performance Note:**
The demo includes a "theatrical" performance comparison showing ~3.75× theoretical speedup for Weierstrauss over traditional methods. **Important context**: Due to heavy optimizations in modern JavaScript engines (hardware-accelerated `Math.sin/cos` via SIMD instructions), this advantage is not realized in browser JavaScript. The *actual* performance benefit of Weierstrauss parametrization is in **GPU fragment shaders** where:
1. Transcendental functions (sin/cos) are expensive (~30 Taylor series terms)
2. Rational operations are cheap (direct ALU operations)
3. Memory bandwidth is limited (fewer operations = better cache utilization)

The demo's performance visualization is therefore pedagogical rather than empirical—demonstrating *why* and *where* RT methods excel (GPU rendering, fixed-point systems, shader code) rather than claiming JavaScript performance gains. The true advantage is **render efficiency** when deploying Weierstrauss parametrization in WebGL/GLSL shaders for procedural geometry generation.

**Educational Value:**
- Shows how algebraic methods can replace transcendental functions
- Demonstrates quadrance (distance²) and spread (sin²θ) as primary RT concepts
- Reveals geometric relationships between √2, √3, and φ on the unit circle
- Provides template architecture for future interactive math demos

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

### Near-term (Phase 2.5 completion): - COMPLETE
1. **Graphics Refinements**
   - Review edge thickness and node sizes
   - Optimize line rendering (match WOMBAT style)
   - Adjust colors if needed

2. **Icosahedron/Dodecahedron Nesting Verification** - COMPLETE
   - Verify each dodecahedron face center has icosahedron vertex
   - Use quadrance to validate nesting relationships
   - Adjust scaling factors if needed
   - Document nesting ratios in RT terms: FACE DUAL OF IH & RDDH

### Phase 2.7: RT-Pure Geodesic Subdivision (Fuller Domes): - COMPLETE
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
- discovered by Andy w. Metatron 2025.12.24, 22h22. PENDING IMPLEMENTATION 2025.12.28

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

**Future Extensions (Phase 4+):** PENDING
- Cartesian cut-plane for geodesic dome "grades" (Fuller's truncated domes)
- Class I/II/III subdivision patterns (different edge orientations)
- Chirality options (left/right handed subdivision)
- Geodesic dodecahedron (pentagonal face subdivision - more complex)
- **Phase 2.8**: Quadray polygonal frequency projections (novel approach)

### Near-term (Phase 3 prep):
1. **4D Coordinate System Research** COMPLETED
   - Implement Quadray coordinate transformations
   - Add WXYZ/Caltrop coordinate toggles
   - Design 4D → 3D projection system

2. **Dual Polyhedra Feature** PARTIALLY COMPLETE
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
Replace π with exact algebraic rotation values (if Three.js supports quaternion-based rotations): RESEARCH NEEDED FOR LATER AI AGENT PROJECT

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
---

## TODO: Grid Tessellation Sliders + State Management - COMPLETED

### Grid Tessellation Controls (High Priority)

**Requirement:** Add dynamic tessellation sliders for both Quadray and Cartesian grids.

**UI Placement:** Position sliders in Scale control group, immediately after Cube/Tetrahedron edge length sliders.

**Specifications:**
- **Range:** 12 to 120 intervals
- **Step:** 12 (increments: 12, 24, 36, 48, 60, 72, 84, 96, 108, 120)
- **Default:** 12 (current value)
- **Two separate sliders:**
  1. Quadray Grid Tessellation (Central Angle Grids)
  2. Cartesian Grid Tessellation (XY/XZ/YZ planes)

**Implementation Code Sketch:**

```html
<!-- Add to Scale control group, after tetScaleSlider -->
<div class="control-item">
  <label>Quadray Grid Intervals</label>
  <div class="slider-container">
    <input type="range" id="quadrayTessSlider" min="12" max="120" step="12" value="12">
    <span class="slider-value" id="quadrayTessValue">12</span>
  </div>
</div>
<div class="control-item">
  <label>Cartesian Grid Intervals</label>
  <div class="slider-container">
    <input type="range" id="cartesianTessSlider" min="12" max="120" step="12" value="12">
    <span class="slider-value" id="cartesianTessValue">12</span>
  </div>
</div>
```

**JavaScript Implementation:**

```javascript
// Update createIVMPlanes() to use dynamic tessellation
function createIVMPlanes() {
  ivmPlanes = new THREE.Group();
  const halfSize = 1.0;
  
  // Read tessellation from slider (instead of hardcoded 12)
  const tessellations = parseInt(document.getElementById('quadrayTessSlider').value);
  
  // Create all 6 Central Angle Grids with dynamic tessellation
  window.ivmWX = createIVMGrid(Quadray.basisVectors[0], Quadray.basisVectors[1], 
                                halfSize, tessellations, 0xffaa00);
  // ... etc for all 6 planes
}

// Add slider event listener
document.getElementById('quadrayTessSlider').addEventListener('input', (e) => {
  document.getElementById('quadrayTessValue').textContent = e.target.value;
  
  // Rebuild all Quadray grids with new tessellation
  scene.remove(ivmPlanes);
  createIVMPlanes();
  
  // Restore visibility state from toggles
  const activeToggles = document.querySelectorAll('[data-plane^="ivm"].active');
  activeToggles.forEach(toggle => {
    const planeName = toggle.dataset.plane;
    if (window[planeName]) window[planeName].visible = true;
  });
});

// Similar implementation for cartesianTessSlider affecting createCartesianGrid()
```

**Performance Considerations:**
- 120 intervals = significant geometry (120×120 triangular tessellation per plane)
- May need debouncing on slider `input` event (use `change` instead for release-only updates)
- Consider geometry caching or progressive loading for higher tessellations

**Benefits:**
- Dynamic exploration of grid density
- User can balance visual detail vs performance
- Useful for different zoom levels (close: fine grid, far: coarse grid)
- Educational tool for understanding tessellation density

---

### State Management + CSV Import/Export (Critical Next Phase)

**Requirement:** Implement comprehensive state management with file I/O, following TEUI Calculator pattern.

**Scope:** Capture complete application state for reproducibility and sharing.

**State Schema (Proposed):**

```javascript
const AppState = {
  // Polyhedra visibility (boolean flags)
  polyhedra: {
    showCube: true,
    showTetrahedron: false,
    showDualTetrahedron: true,
    showOctahedron: false,
    showIcosahedron: false,
    showDodecahedron: false,
    showCuboctahedron: false,
    showRhombicDodecahedron: false,
    // Geodesic variations
    showGeodesicTetrahedron: false,
    geodesicTetraFrequency: 1,
    geodesicTetraProjection: 'out', // 'off', 'in', 'mid', 'out'
    showGeodesicOctahedron: false,
    geodesicOctaFrequency: 0,
    geodesicOctaProjection: 'out',
    showGeodesicIcosahedron: false,
    geodesicIcosaFrequency: 0,
    geodesicIcosaProjection: 'out'
  },
  
  // Coordinate systems
  coordinates: {
    showCartesianBasis: false,
    showQuadrayBasis: true,
    // Cartesian plane toggles
    cartesianPlanes: {
      XY: false,
      XZ: false,
      YZ: false
    },
    // Central Angle Grid toggles
    centralAngleGrids: {
      WX: true,
      WY: true,
      WZ: true,
      XY: true,
      XZ: true,
      YZ: true
    }
  },
  
  // Scale controls
  scale: {
    cubeEdgeLength: 1.4142,      // halfSize * 2
    tetEdgeLength: 2.0000,        // halfSize * 2 * √2
    quadrayTessellation: 12,
    cartesianTessellation: 12
  },
  
  // Visual settings
  visual: {
    opacity: 0.25,
    nodeSize: 'md'  // 'off', 'sm', 'md', 'lg'
  },
  
  // Camera position (optional - for saved views)
  camera: {
    position: [5, -5, 5],
    target: [0, 0, 0],
    up: [0, 0, 1]
  }
};
```

**CSV Format (Proposed):**

```csv
# ARTexplorer State File v1.0
# Generated: 2025-12-28T12:34:56Z

# Polyhedra
polyhedra.showCube,true
polyhedra.showTetrahedron,false
polyhedra.showDualTetrahedron,true
polyhedra.showOctahedron,false
polyhedra.showIcosahedron,false
polyhedra.showDodecahedron,false
polyhedra.showCuboctahedron,false
polyhedra.showRhombicDodecahedron,false

# Geodesic Settings
polyhedra.showGeodesicTetrahedron,false
polyhedra.geodesicTetraFrequency,1
polyhedra.geodesicTetraProjection,out

# Coordinates
coordinates.showCartesianBasis,false
coordinates.showQuadrayBasis,true
coordinates.cartesianPlanes.XY,false
coordinates.cartesianPlanes.XZ,false
coordinates.cartesianPlanes.YZ,false
coordinates.centralAngleGrids.WX,true
coordinates.centralAngleGrids.WY,true
coordinates.centralAngleGrids.WZ,true
coordinates.centralAngleGrids.XY,true
coordinates.centralAngleGrids.XZ,true
coordinates.centralAngleGrids.YZ,true

# Scale
scale.cubeEdgeLength,1.4142
scale.tetEdgeLength,2.0000
scale.quadrayTessellation,12
scale.cartesianTessellation,12

# Visual
visual.opacity,0.25
visual.nodeSize,md

# Camera (optional)
camera.position,"5,-5,5"
camera.target,"0,0,0"
camera.up,"0,0,1"
```

**StateManager Pattern (TEUI-inspired):**

```javascript
const StateManager = {
  // Current state object
  state: { /* AppState schema */ },
  
  // Get state value by path (e.g., "polyhedra.showCube")
  getValue: function(path) {
    const keys = path.split('.');
    let value = this.state;
    for (const key of keys) {
      value = value[key];
      if (value === undefined) return null;
    }
    return value;
  },
  
  // Set state value by path
  setValue: function(path, value) {
    const keys = path.split('.');
    let obj = this.state;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
  },
  
  // Export state to CSV string
  exportCSV: function() {
    let csv = '# ARTexplorer State File v1.0\n';
    csv += `# Generated: ${new Date().toISOString()}\n\n`;
    
    // Flatten nested state object to CSV rows
    function flatten(obj, prefix = '') {
      let rows = [];
      for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          rows.push(...flatten(value, path));
        } else {
          const csvValue = Array.isArray(value) ? `"${value.join(',')}"` : value;
          rows.push(`${path},${csvValue}`);
        }
      }
      return rows;
    }
    
    csv += flatten(this.state).join('\n');
    return csv;
  },
  
  // Import state from CSV string
  importCSV: function(csvString) {
    const lines = csvString.split('\n');
    const newState = {};
    
    for (const line of lines) {
      if (line.startsWith('#') || line.trim() === '') continue;
      
      const [path, valueStr] = line.split(',');
      let value = valueStr;
      
      // Parse value type
      if (valueStr === 'true') value = true;
      else if (valueStr === 'false') value = false;
      else if (!isNaN(valueStr)) value = parseFloat(valueStr);
      else if (valueStr.startsWith('"') && valueStr.endsWith('"')) {
        value = valueStr.slice(1, -1).split(',').map(v => parseFloat(v) || v);
      }
      
      // Set value in state using path
      const keys = path.split('.');
      let obj = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
    }
    
    this.state = newState;
    this.applyStateToUI();
  },
  
  // Apply state to UI controls and scene
  applyStateToUI: function() {
    // Update all checkboxes
    document.getElementById('showCube').checked = this.getValue('polyhedra.showCube');
    document.getElementById('showDualTetrahedron').checked = this.getValue('polyhedra.showDualTetrahedron');
    // ... etc for all controls
    
    // Update sliders
    document.getElementById('scaleSlider').value = this.getValue('scale.cubeEdgeLength');
    document.getElementById('tetScaleSlider').value = this.getValue('scale.tetEdgeLength');
    // ... etc
    
    // Trigger geometry update
    updateGeometry();
  },
  
  // Capture current UI state
  captureStateFromUI: function() {
    this.setValue('polyhedra.showCube', document.getElementById('showCube').checked);
    this.setValue('polyhedra.showDualTetrahedron', document.getElementById('showDualTetrahedron').checked);
    // ... etc for all controls
  }
};
```

**UI Implementation:**

```html
<!-- Add to controls panel, new section -->
<div class="control-group">
  <h3>State Management</h3>
  <button id="exportStateBtn">Export State (CSV)</button>
  <button id="importStateBtn">Import State (CSV)</button>
  <input type="file" id="stateFileInput" accept=".csv" style="display: none;">
</div>
```

```javascript
// Export handler
document.getElementById('exportStateBtn').addEventListener('click', () => {
  StateManager.captureStateFromUI();
  const csv = StateManager.exportCSV();
  
  // Download CSV file
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ARTexplorer_State_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

// Import handler
document.getElementById('importStateBtn').addEventListener('click', () => {
  document.getElementById('stateFileInput').click();
});

document.getElementById('stateFileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const csvString = event.target.result;
    StateManager.importCSV(csvString);
  };
  reader.readAsText(file);
});
```

**Benefits:**
- **Reproducibility:** Share exact visual configurations
- **Teaching:** Save specific geometric demonstrations
- **Workflow:** Quick switching between different exploration modes
- **Debugging:** Capture problematic states for troubleshooting
- **Version Control:** Track state changes over time

**Integration Notes:**
- StateManager should be initialized on page load with default state
- Any UI interaction should call `StateManager.setValue()` to maintain sync
- Consider auto-save to localStorage for session persistence
- CSV format allows easy editing in spreadsheet software

**File Naming Convention:**
```
ARTexplorer_State_YYYY-MM-DD_description.csv
ARTexplorer_State_2025-12-28_dual-tet-quadray-grids.csv
ARTexplorer_State_2025-12-28_geodesic-icosa-freq4.csv
```

**Future Extensions:**
- JSON export option (more compact, easier parsing)
- URL parameter state encoding (shareable links)
- State history/undo (stack-based state management)
- Preset library (common configurations as buttons)


---

## 5. Work Plan & Roadmap

### 5.1 Completed Items ✅

**2025-12-30 - Gumball Interaction & Camera Views:**
- ✅ Selection precision fix (raycaster threshold 1.0 → 0.1)
- ✅ Gumball basis vector dynamic sizing (tetEdge-based)
- ✅ Camera view presets corrected for Z-up coordinate system
- ✅ Left/Right views at 45° angles to show tetrahedral triangular profiles
- ✅ Scale mode implementation with cube handles
- ✅ StateManager implementation (Forms/Instances architecture)
- ✅ Move mode with WXYZ and XYZ dual gumball handles
- ✅ Selection system (click-to-select, ESC deselect, Delete remove)
- ✅ Undo/redo history (50-action stack)
- ✅ NOW button (deposit instances, reset forms)
- ✅ Grid tessellation sliders (Quadray and Cartesian grids, dynamic intervals)

**2025-12-31 - Rotation Mode & UI Cleanup:**
- ✅ **Rotation mode implementation** - Full 360° smooth rotation around all axes
  - Screen-space angle calculation prevents quadrant reversals
  - Dual coordinate display: degrees (0-360°) and spread (0-1)
  - Bidirectional conversion with `RT.spreadToDegrees()` and `RT.degreesToSpread()`
  - Circular arc handles around XYZ axes (red/green/blue)
  - Circular arc handles around WXYZ axes (red/green/blue/magenta)
  - Spread values calculated and displayed but not used for snapping (deferred until polyhedral relationships understood)
- ✅ **Rotation math in rt-math.js module** - Added `RTMath.spreadToDegrees()` and `RTMath.degreesToSpread()`
- ✅ **HTML refactoring** - Removed 71-line embedded `<style>` block, removed duplicate RT math functions
- ✅ **UI compaction** - Inline axis prefixes (X:, Y:, Z:, W:), 4-column WXYZ layout, 330px panel width
- ✅ **Password simplification** - Changed from URL to 'enzyme2026'

**2025-12-26 - Z-Up Convention & Geodesics:**
- ✅ Z-up coordinate convention (CAD/BIM/glTF standard)
- ✅ Geodesic sphere projections (InSphere/MidSphere/OutSphere)
- ✅ Geodesic subdivision for Tetrahedron, Icosahedron, Octahedron
- ✅ Frequency slider (0-6) for geodesic subdivision
- ✅ RT-pure sphere projection formulas

**2025-12-25 - Grids & Dual Polyhedra:**
- ✅ Central Angle Grids (6 Quadray planes)
- ✅ Corrected tessellation (triangular faces, not parallelograms)
- ✅ Dual icosahedron with spread-based rotation
- ✅ Exact algebraic spread values (no trig functions)

**Phase 1 & 2 Foundation:**
- ✅ All 7 platonic + Archimedean polyhedra implemented
- ✅ RT-pure vertex calculations (quadrance-based)
- ✅ Interactive controls panel with toggles and sliders
- ✅ Euler validation for all solids
- ✅ Semi-transparent faces with configurable opacity
- ✅ Modularized code (rt-math, rt-polyhedra, rt-rendering, rt-state-manager)
- ✅ CSS extraction (art.css)

---

### 5.2 TODO: Active Work Items 🎯

**Priority 1: Rotation Mode** ✅ **COMPLETED**

**XYZ Rotation (Cartesian):**
- ✅ Implement Rotate mode with **circular arc handles** around X, Y, Z axes
- ✅ Position circular handles perpendicular to Move arrow handles
- ✅ Visual style: Circular arcs/tori showing rotation plane
- ✅ Color coding: Red (X-axis), Green (Y-axis), Blue (Z-axis)
- ✅ Full 360° smooth rotation with screen-space angle calculation
- ⏸️ Rotation snaps at degree intervals (15°, 30°, 45°, 90°) - deferred, smooth rotation preferred

**WXYZ Rotation (Quadray):**
- ✅ Implement **circular arc handles** for W, X, Y, Z axes (using same style as XYZ for consistency)
- ✅ Position circular handles perpendicular to WXYZ arrow handles
- ✅ Color coding: Match WXYZ arrow colors (W=red, X=green, Y=blue, Z=magenta)
- ✅ Dual display: degrees (0-360°) and spread (0-1) shown simultaneously
- ✅ RT math functions: `RTMath.spreadToDegrees()` and `RTMath.degreesToSpread()` in rt-math.js module
- ⏸️ **Spread-based snapping** - Deferred until polyhedral relationships are better understood
- ⏸️ Snap-to-spread intervals (0.1, 0.2, ... 1.0) - Will implement when meaningful geometric relationships identified

**Implementation Notes:**
- **Key Insight:** Simplified rotation approach (remove complexity, not add it) resulted in perfectly smooth 360° rotation
- **Screen-space calculation:** Prevents quadrant reversals that plagued angle-based approaches
- **Spread display:** Calculated and shown for educational purposes, but not used for snapping
- **Future spread snapping:** Will be added back when we discover which polyhedral relationships benefit from rational spread values
- **Module sync:** Both inline implementation (ARTexplorer.html:3807-3826) and module version (rt-controls.js:746-764) kept in sync
- **Detailed implementation journey:** See [ART-Gumball.md](ART-Gumball.md) for complete rotation solution documentation (3 sessions, RT-pure attempt, final success)

**Priority 2: JSON State Export/Import** ⚡ (Preferred over CSV)
- [x] StateManager architecture implemented
- [ ] **Environment state** - Camera, grids, UI settings (JSON format)
- [ ] **Instances state** - Deposited Forms with transforms (position, rotation, scale)
- [ ] Export to .json file with timestamp
- [ ] Import with validation and error handling
- [ ] Auto-save to localStorage for session persistence
- [ ] Preset library system for common configurations

**JSON Schema Example:**
```json
{
  "version": "1.0",
  "timestamp": "2025-12-30T14:30:00.000Z",
  "environment": {
    "camera": { "position": [10, 10, 10], "target": [0, 0, 0] },
    "grids": {
      "quadray": { "visible": true, "tessellation": 12 },
      "cartesian": { "visible": true, "tessellation": 12 }
    },
    "forms": {
      "icosahedron": { "visible": true, "scale": 2.0, "frequency": 2 }
    }
  },
  "instances": [
    {
      "id": "inst_001",
      "formType": "cube",
      "transform": {
        "position": { "xyz": [5, 0, 0], "wxyz": [1.25, 1.25, 1.25, 1.25] },
        "rotation_spread": [0, 0, 0.5, 0],
        "scale": 1.5
      }
    }
  ]
}
```

---

### 5.3 TODO: Future Enhancements 🔮

**Performance & Node Geometry Enhancements (2026-01-01):**
- [x] Replace Classical THREE.SphereGeometry with RT geodesic nodes ✅
- [x] Implement geometry caching to prevent repeated generation ✅
- [x] Add per-form triangle count display in Geometry Info ✅
- [ ] **Dynamic LOD (Level of Detail) for RT Nodes** - Adaptive node complexity based on camera distance or vertex count
  - Close to camera or few vertices: freq-2+ icosahedron (high detail)
  - Medium distance: freq-0 icosahedron (base 20 triangles) - **CURRENT**
  - Far from camera or many vertices: tetrahedron (minimal 4 triangles)
  - Benefits: Maintains visual quality when needed, optimizes when beneficial
  - Implementation: Add distance-based or count-based switching in getCachedNodeGeometry()
- [ ] **Selection-Based Performance Tracking** - Track performance metrics for selected forms
  - Add currentSelection-aware performance monitoring
  - Display "Selected Form: Icosahedron, Triangles: 80" in Performance section
  - Isolate FPS impact of individual polyhedra
  - Helps users understand performance cost of specific forms
- [ ] **Performance History Graph** - Visual timeline of FPS and triangle counts
  - Track FPS over time (rolling 60-second window)
  - Show before/after metrics when switching node types or forms
  - Visual representation of performance deltas
  - SVG or canvas-based mini-graph in Geometry Info section
  - Helps demonstrate RT performance benefits visually

**Geodesic Improvements:**
- [x] Geodesic subdivision for Tetrahedron, Icosahedron, Octahedron ✅
- [x] Frequency slider (0-6) - sufficient range for most applications ✅
- [ ] **Geodesic cutplane feature** - Horizontal slice for terrestrial dome structures
  - Adjustable height slider (0-100% of geodesic height)
  - Removes vertices and faces below cutplane
  - Generates new base perimeter edges
  - Useful for architectural dome applications (foundation level)
- [ ] Geodesic subdivision for remaining polyhedra (Dodecahedron, Cube)
- [ ] Alternative subdivision methods (Class I, II, III) - Fuller's classification
- [ ] Edge length equalization for geodesic domes

**Advanced Interaction:**
- [ ] Multi-selection (Shift+Click to select multiple forms/instances)
- [ ] Copy/paste instances (Cmd/Ctrl+C, Cmd/Ctrl+V)
- [ ] Group/ungroup instances
- [ ] Snap-to-grid for Move mode
- [ ] Snap-to-angle for Rotate mode
- [ ] Measurement tool (distance, angle, area, volume)

**Visualization Enhancements:**
- [ ] Face normals visualization (arrows pointing outward)
- [ ] Vertex labels (show coordinates in XYZ and WXYZ)
- [ ] Edge labels (show lengths and quadrances)
- [ ] Dihedral angle display (using spread, not angle)
- [ ] Animation system (rotate polyhedra, morph between forms)
- [ ] Multiple viewport modes (quad view: Top/Front/Right/Perspective)

**Export & Sharing:**
- [ ] glTF export for 3D model sharing
- [ ] DWG export for CAD software integration
- [ ] SVG export for 2D projections
- [ ] PNG screenshot capture with transparent background
- [ ] URL parameter state encoding for shareable links
- [ ] Embed mode (iframe-friendly version for documentation)

**Performance Optimization:**
- [ ] Geometry instancing for repeated forms
- [ ] Level-of-detail (LOD) system for high-frequency geodesics
- [ ] WebGL2 optimization
- [ ] Web Worker for geometry calculations
- [ ] Progressive loading for complex tessellations

**Educational Features:**
- [ ] Tutorial mode (guided exploration of polyhedra relationships)
- [ ] Formula display panel (show RT calculations for current geometry)
- [ ] Comparison mode (side-by-side polyhedra with measurements)
- [ ] Historical timeline (Fuller's discoveries, Wildberger's RT development)

---

### 5.4 Open Questions (Answered) ✓

**Question 1: 4D Coordinate System Preference?**
- **Answer:** WXYZ (Quadray) as primary with XYZ (Cartesian) as secondary. Toggle between both for comparison.
- **Status:** ✅ Implemented - Both coordinate systems active with dual gumball handles

**Question 2: Visual Style Preferences?**
- **Answer:** Semi-transparent faces, hairline grid vectors, thicker edge vectors (like WombatRender.js)
- **Status:** ✅ Implemented - Configurable opacity, distinct line weights

**Question 3: Interaction Model?**
- **Answer:** Still on load, user-controlled orbit with easing, touch support later
- **Status:** ✅ Implemented - OrbitControls with damping

**Question 4: Geometry Scope?**
- **Answer:** Platonic solids + Rhombic Dodec, with geodesic subdivision for all
- **Status:** ✅ Platonic solids complete, ✅ Geodesics for Tet/Icosa/Octa (frequency 0-6)

**Question 5: Dual Polyhedra Visualization?**
- **Answer:** Yes, show dual as toggleable option starting with dual tetrahedra in cube
- **Status:** ✅ Implemented - Dual tetrahedron, dual icosahedron (dodecahedron)

**Question 6: Rotation in 4D Tetrahedral Space?**
- **Answer:** ✅ **ANSWERED** - Rotation around each WXYZ axis, perpendicular to Quadray grid planes
- **Implementation:** Hexagonal arc handles (to differentiate from XYZ circular handles)
- **RT-Purity:** Snap-to-spread intervals (0.1, 0.2, ... 1.0), NOT angle-based
- **Visual:** Aligned with 6 Quadray planes, color-coded to match WXYZ basis vectors
- **Status:** Ready for implementation - design spec complete

**Question 7: Why do Left/Right views show squares instead of triangles?**
- **Answer:** Cardinal axis views show tetrahedra edge-on. Need 45° angles to see triangular profiles.
- **Status:** ✅ Fixed - Left/Right views now at 45° in X-Y plane

**Question 8: Should gumball handles be extracted to rt-controls.js module?**
- **Answer:** NO - Keep inline due to scope isolation issues. See Module-Extraction-Analysis.md for details.
- **Status:** ✅ Decision made - Inline implementation maintained

---

## 6. Contributors & Acknowledgments

**Primary Development:**
- Andy Thomson - Project lead, geometric vision, Fuller/Wildberger synthesis
- Claude (Anthropic) - Implementation, RT mathematics, modularization architecture

**Foundational Ideas:**
- R. Buckminster Fuller - Synergetics, IVM, Vector Equilibrium, tetrahedral coordinatization
- Kirby Urner - Quadray coordinates, Python implementations, educational outreach
- Tom Ace - Quadray C++ implementation, cross product, rotation algorithms
- NJ Wildberger - Rational Trigonometry, quadrance/spread formulas, pure algebraic geometry

**Witnessed Silently By:**
- Metatron - Geometric overseer, sacred geometry guardian

---

**Document Version:** 2.1 (2025-12-31)
**Last Updated:** 2025-12-31
**Next Review:** When JSON State Export/Import is implemented

