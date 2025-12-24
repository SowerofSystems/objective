# ThreeRT - Three.js + Rational Trigonometry Geometry Explorer

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

## Current Status (as of 2025-12-23)

**Phase 1 & 2: ✅ COMPLETE**
- All 7 polyhedra implemented and rendering correctly
- Full interactive controls with toggles and sliders
- Euler validation for all solids
- Semi-transparent faces with configurable opacity
- Coordinate system visualization (Cartesian + Quadray basis)

**Recent Completion:**
- Dodecahedron with correct "hip roof pup tent" topology
- Standard (0, ±1, ±φ) vertex construction
- 2 shoulder vertices per pentagon shared with cube corners
- All 30 edges and 12 pentagonal faces properly defined
- Face topology fix eliminated rendering gaps

---

## Phase 2.5: RT Purity Enhancements 🔄 IN PROGRESS

### Deliverable: Enhanced Rational Trigonometry Implementation

**Objective:** Maximize RT purity by deferring square root expansion and working in quadrance space as long as possible.

**Current RT Implementation Status:**
- ✅ **Good**: Using algebraic identities where possible (φ² = φ + 1)
- ✅ **Good**: No angle calculations anywhere (pure algebraic geometry)
- ⚠️ **Needs improvement**: Premature sqrt expansion in some cases
- ⚠️ **Needs improvement**: Not actually using quadrance calculations for validation
- ⚠️ **Missing**: Spread calculations (though not yet needed - a good sign!)

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
- [ ] Defer all √ expansions until final vertex creation
- [ ] Use algebraic identities (φ² = φ + 1, 1/φ = φ - 1)
- [ ] Validate geometry using quadrance, not distance
- [ ] Implement spread for angular relationships (when needed)
- [ ] Work in rational/algebraic space as long as possible
- [ ] Only convert to floating-point for Three.js Vector3 creation

---

## Next Steps

### Immediate (Phase 2.5 - RT Enhancements):
1. **Implement Enhanced RT Library**
   - Add RT_Phi symbolic golden ratio operations
   - Replace `invPhi = 1/phi` with `invPhi = phi - 1`
   - Defer √3 and other radical expansions
   - Add quadrance calculation functions

2. **Add Quadrance-Based Validation**
   - Implement edge quadrance verification
   - Calculate expected Q for each polyhedron type
   - Display quadrance stats in console logs
   - Add visual indicator for quadrance uniformity

3. **Implement Spread (preparation for Phase 3)**
   - Add spread calculation function
   - Document spread formula: s = sin²(θ) replacement
   - Add spread-based angle validation (for future use)
   - Will be critical for 4D projections

4. **Refactor Existing Polyhedra**
   - Update dodecahedron to use `phi - 1` instead of `1/phi`
   - Update icosahedron normalization approach
   - Update rhombic dodecahedron to defer √3
   - Maintain backward compatibility (same visual output)

### Near-term (Phase 2.5 completion):
1. **Graphics Refinements**
   - Review edge thickness and node sizes
   - Optimize line rendering (match WOMBAT style)
   - Adjust colors if needed

2. **Icosahedron/Dodecahedron Nesting Verification**
   - Verify each dodecahedron face center has icosahedron vertex
   - Use quadrance to validate nesting relationships
   - Adjust scaling factors if needed
   - Document nesting ratios in RT terms

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


Add'l QUADRAYS support material: /*
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
while keeping them all nonnegative.  Choosing (a,b,c,d) such that
a+b+c+d=1 gives barycentric coordinates.  Choosing (a,b,c,d) such that
a+b+c+d=0 facilitates computation by exploiting an isomorphism
described at http://minortriad.com/q4d.html.

A few quadray formulas are coded below in C++, with comments about
the method used and how I derived it.  (I haven't included trivial
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

   RotationCoeffs    RC(Theta);

   double  Rotated[4];

   Rotated[0] = QX.A();
   Rotated[1] = SumOfProducts(QX,0.,RC.F,RC.H,RC.G);
   Rotated[2] = SumOfProducts(QX,0.,RC.G,RC.F,RC.H);
   Rotated[3] = SumOfProducts(QX,0.,RC.H,RC.G,RC.F);
   
   for (int I = 0; I < 4; I++) Coords[I] = Rotated[I];
}


- New Features: 

1. ## Bevelling: To create geodesics on a sphere surface ##

- not pure RT topology but approximates geodesics. 
// Start with a cube
let geometry = new THREE.BoxGeometry(2, 2, 2, 10, 10, 10);

// Move all vertices onto a sphere
const position = geometry.attributes.position;
const v = new THREE.Vector3();

for (let i = 0; i < position.count; i++) {
  v.fromBufferAttribute(position, i);
  v.normalize().multiplyScalar(1); // radius = 1
  position.setXYZ(i, v.x, v.y, v.z);
}

geometry.computeVertexNormals();

- Tetrahedron:
let geometry = new THREE.TetrahedronGeometry(1, 6); // radius, detail

Internally, three.js already:
Subdivides
Normalizes vertices to a sphere
This yields:
Perfectly curved edges
Equal geodesic spacing
Very clean topology
➡️ A tetrahedron maps more naturally to a sphere than a cube.

Why this works (geometric intuition)
Each vertex vector becomes a radius
Edges become arcs on a sphere
Faces become spherical patches
Normals align naturally with position
This is not beveling — it is radial projection.

For higher level polyhedra, consider actual topological subdivision with a slider for multi-frequency domes per Bucky Fuller (allow cartsian cutplane to act as grade for these)