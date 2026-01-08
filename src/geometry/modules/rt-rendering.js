/**
 * rt-rendering.js
 * THREE.js Rendering Module for ARTexplorer
 *
 * Manages scene setup, camera, lighting, grids, and basis vectors.
 * Handles all THREE.js rendering logic separate from geometry generation.
 *
 * @requires THREE.js
 * @requires rt-math.js
 * @requires rt-polyhedra.js
 */

import { Quadray } from "./rt-math.js";
import { Polyhedra } from "./rt-polyhedra.js";
import { PerformanceClock } from "./performance-clock.js";

// Re-export PerformanceClock so rt-init.js can import it from here
export { PerformanceClock };

// Module-level cache for node geometries
const nodeGeometryCache = new Map();

// Module-level variable to track RT vs classical node geometry
let useRTNodeGeometry = false;

/**
 * Initialize THREE.js scene and return rendering context
 * @param {Object} THREE - THREE.js library
 * @returns {Object} Scene management functions
 */
export function initScene(THREE) {
  let scene, camera, renderer, controls;
  let cubeGroup, tetrahedronGroup, dualTetrahedronGroup, octahedronGroup;
  let icosahedronGroup, dodecahedronGroup, dualIcosahedronGroup;
  let cuboctahedronGroup, rhombicDodecahedronGroup;
  let geodesicIcosahedronGroup; // Phase 2.7a: Geodesic subdivision
  let geodesicTetrahedronGroup; // Phase 2.7c: Geodesic tetrahedron
  let geodesicOctahedronGroup; // Phase 2.7b: Geodesic octahedron
  let cubeMatrixGroup, tetMatrixGroup, octaMatrixGroup; // Matrix forms (IVM arrays)
  let cuboctaMatrixGroup; // Cuboctahedron matrix (Vector Equilibrium array)
  let rhombicDodecMatrixGroup; // Rhombic dodecahedron matrix (space-filling array)
  let cartesianGrid, cartesianBasis, quadrayBasis, ivmPlanes;

  function initScene() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // Get container dimensions FIRST (before camera setup)
    const container = document.getElementById("canvas-container");
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const aspect = width / height;

    // Camera (Z-up coordinate system for CAD/BIM compatibility)
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);

    // Z-up convention: Position camera for isometric-like view
    // Blue axis (Z) will point vertically upward
    camera.position.set(5, -5, 5);
    camera.up.set(0, 0, 1); // Tell Three.js that Z is up (CAD/BIM standard)
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Orbit Controls (with damping for easing)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Create coordinate grids
    createCartesianGrid();
    createQuadrayBasis();
    createIVMPlanes();

    // Create polyhedra groups
    cubeGroup = new THREE.Group();
    tetrahedronGroup = new THREE.Group();
    dualTetrahedronGroup = new THREE.Group();
    octahedronGroup = new THREE.Group();
    icosahedronGroup = new THREE.Group();
    dodecahedronGroup = new THREE.Group();
    dualIcosahedronGroup = new THREE.Group();
    cuboctahedronGroup = new THREE.Group();
    rhombicDodecahedronGroup = new THREE.Group();
    geodesicIcosahedronGroup = new THREE.Group(); // Phase 2.7a
    geodesicTetrahedronGroup = new THREE.Group(); // Phase 2.7c
    geodesicOctahedronGroup = new THREE.Group(); // Phase 2.7b

    // Matrix forms (IVM spatial arrays)
    cubeMatrixGroup = new THREE.Group();
    cubeMatrixGroup.userData.type = "cubeMatrix";
    cubeMatrixGroup.userData.isInstance = false;

    tetMatrixGroup = new THREE.Group();
    tetMatrixGroup.userData.type = "tetMatrix";
    tetMatrixGroup.userData.isInstance = false;

    octaMatrixGroup = new THREE.Group();
    octaMatrixGroup.userData.type = "octaMatrix";
    octaMatrixGroup.userData.isInstance = false;

    cuboctaMatrixGroup = new THREE.Group();
    cuboctaMatrixGroup.userData.type = "cuboctaMatrix";
    cuboctaMatrixGroup.userData.isInstance = false;

    rhombicDodecMatrixGroup = new THREE.Group();
    rhombicDodecMatrixGroup.userData.type = "rhombicDodecMatrix";
    rhombicDodecMatrixGroup.userData.isInstance = false;

    scene.add(cubeGroup);
    scene.add(tetrahedronGroup);
    scene.add(dualTetrahedronGroup);
    scene.add(octahedronGroup);
    scene.add(icosahedronGroup);
    scene.add(dodecahedronGroup);
    scene.add(dualIcosahedronGroup);
    scene.add(cuboctahedronGroup);
    scene.add(rhombicDodecahedronGroup);
    scene.add(geodesicIcosahedronGroup);
    scene.add(geodesicTetrahedronGroup);
    scene.add(geodesicOctahedronGroup);
    scene.add(cubeMatrixGroup);
    scene.add(tetMatrixGroup);
    scene.add(octaMatrixGroup);
    scene.add(cuboctaMatrixGroup);
    scene.add(rhombicDodecMatrixGroup);

    // Initial render
    updateGeometry();

    // Handle window resize
    window.addEventListener("resize", onWindowResize);
  }

  /**
   * Create Cartesian grid (XYZ) - grey hairlines
   * Z-up coordinate system: Z is vertical, XY is horizontal ground plane
   */
  function createCartesianGrid() {
    cartesianGrid = new THREE.Group();

    // Read tessellation from slider (dynamic control)
    const sliderElement = document.getElementById("cartesianTessSlider");
    const divisions = sliderElement ? parseInt(sliderElement.value) : 10;

    // Grid size scales with divisions to maintain 1.0×1.0 unit squares
    // This makes grid EXTEND (like Quadray grids) rather than subdivide
    // divisions=10 → 10-unit extent (-5 to +5) with 1.0 unit squares (cube edge=2 occupies 2×2 squares)
    const gridSize = divisions;

    // Simple grey grid color - subtle and non-distracting
    const gridColor = 0x444444;

    // Z-UP CONVENTION: Notation swap from Y-up
    // In Y-up: XZ was horizontal (default), XY was rotated, YZ was rotated
    // In Z-up: XY is horizontal, XZ is vertical, YZ is vertical
    // Just swap which planes get rotations - same rotation values as before

    // XY plane (Z = 0) - HORIZONTAL ground plane in Z-up
    window.gridXY = new THREE.GridHelper(
      gridSize,
      divisions,
      gridColor,
      gridColor
    );
    window.gridXY.rotation.x = Math.PI / 2; // Same rotation as Y-up XY had
    window.gridXY.visible = false; // Hidden by default
    cartesianGrid.add(window.gridXY);

    // XZ plane (Y = 0) - VERTICAL wall in Z-up (front/back)
    window.gridXZ = new THREE.GridHelper(
      gridSize,
      divisions,
      gridColor,
      gridColor
    );
    // GridHelper default - was horizontal in Y-up, now vertical in Z-up (notation swap)
    window.gridXZ.visible = false; // Hidden by default
    cartesianGrid.add(window.gridXZ);

    // YZ plane (X = 0) - VERTICAL wall in Z-up (left/right)
    window.gridYZ = new THREE.GridHelper(
      gridSize,
      divisions,
      gridColor,
      gridColor
    );
    window.gridYZ.rotation.z = Math.PI / 2; // Same rotation as Y-up YZ had
    window.gridYZ.visible = false; // Hidden by default
    cartesianGrid.add(window.gridYZ);

    scene.add(cartesianGrid);

    // Add Cartesian axes as separate object (can be toggled independently)
    // Using ArrowHelper to match Quadray vector style (with arrowheads)
    cartesianBasis = new THREE.Group();

    // Fundamental unit: cube edge = 2.0 (for halfSize = 1)
    // ArrowHelper 'length' parameter = TOTAL arrow length (shaft + head)
    const totalBasisLength = 2.0; // Cube edge length at base scale
    const headLength = 0.3;
    const arrowLength = totalBasisLength; // Total visual length

    // X-axis (Red)
    const xAxis = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0), // Direction
      new THREE.Vector3(0, 0, 0), // Origin
      arrowLength, // Total arrow length = 2.0
      0xff0000, // Red
      headLength, // Head length = 0.3
      0.2 // Head width (matching Quadray style)
    );
    cartesianBasis.add(xAxis);

    // Y-axis (Green)
    const yAxis = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0), // Direction
      new THREE.Vector3(0, 0, 0), // Origin
      arrowLength, // Total arrow length = 2.0
      0x00ff00, // Green
      headLength, // Head length = 0.3
      0.2 // Head width
    );
    cartesianBasis.add(yAxis);

    // Z-axis (Blue) - vertical in Z-up convention
    const zAxis = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1), // Direction (up in Z-up)
      new THREE.Vector3(0, 0, 0), // Origin
      arrowLength, // Total arrow length = 2.0
      0x0000ff, // Blue
      headLength, // Head length = 0.3
      0.2 // Head width
    );
    cartesianBasis.add(zAxis);

    cartesianBasis.visible = false; // Hidden by default
    scene.add(cartesianBasis);
  }

  /**
   * Create Quadray basis vectors (WXYZ)
   * 4 vectors pointing to tetrahedral vertices
   */
  function createQuadrayBasis() {
    quadrayBasis = new THREE.Group();

    // Fundamental unit: tetrahedron edge length = 2√2 (for halfSize = 1)
    // ArrowHelper 'length' parameter = TOTAL arrow length (shaft + head)
    const totalBasisLength = 2 * Math.sqrt(2); // ≈ 2.828 (one tetrahedron edge)
    const headLength = 0.3;
    const arrowLength = totalBasisLength; // Total visual length

    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00]; // R, G, B, Y
    const labels = ["A", "B", "C", "D"];

    Quadray.basisVectors.forEach((vec, i) => {
      const arrow = new THREE.ArrowHelper(
        vec,
        new THREE.Vector3(0, 0, 0),
        arrowLength, // Total arrow length = 2√2
        colors[i],
        headLength, // Head length = 0.3
        0.2
      );
      quadrayBasis.add(arrow);
    });

    quadrayBasis.visible = true; // Visible by default
    scene.add(quadrayBasis);
  }

  /**
   * Create triangular grid for a Quadray plane defined by two basis vectors
   * RT-PURE: Uses SAME tessellation method as tetrahedron frequency subdivisions
   *
   * TRIANGULAR LATTICE: Three line families form equilateral triangles
   * - Direction 1: basis1
   * - Direction 2: basis2
   * - Direction 3: basis1 + basis2 (creates proper 60° triangular grid)
   *
   * CRITICAL: This uses pure barycentric subdivision principles!
   * When Project='Flat', tetrahedron geodesic vertices lie EXACTLY on these grids.
   * Functionally equivalent to tetrahedron frequency divisions.
   *
   * @param {THREE.Vector3} basis1 - First basis vector (e.g., W)
   * @param {THREE.Vector3} basis2 - Second basis vector (e.g., X)
   * @param {number} minExtent - Inner radius (near-zero, avoid origin singularity)
   * @param {number} maxExtent - Outer radius (tetrahedral boundary)
   * @param {number} divisions - Grid subdivisions (frequency parameter)
   * @param {number} color - Grid line color
   * @returns {THREE.LineSegments} Triangular grid geometry
   */
  /**
   * Create Central Angle Grid (Corrected Tessellation Method)
   * This is the CORRECT implementation of the "Tetrahedral Central Angle Exploration Grid"
   * Tessellates triangular faces vertex-to-vertex - NO extraneous lines!
   * RT-PURE: Uses tetrahedron edge length as unit increment
   *
   * NOTE: Originally intended as IVM grid, but this is actually the corrected
   * implementation of Option 1 (Central Angle Grid). TRUE IVM still to be done.
   *
   * @param {THREE.Vector3} basis1 - First basis vector (e.g., W)
   * @param {THREE.Vector3} basis2 - Second basis vector (e.g., X)
   * @param {number} halfSize - Tetrahedron halfSize (s)
   * @param {number} tessellations - Number of triangle copies in each direction (e.g., 5)
   * @param {number} color - Grid line color
   * @returns {THREE.LineSegments} Central Angle grid geometry
   */
  function createIVMGrid(basis1, basis2, halfSize, tessellations, color) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    // RT-PURE: Unit tetrahedron grid interval
    // For a unit tetrahedron (edge length = 1):
    // Centroid-to-vertex distance (OutSphere radius) = √6/4 ≈ 0.612
    // This provides meaningful intervals at edge lengths 1, 2, 3, 4...
    const edgeLength = Math.sqrt(6) / 4;

    // DIAGNOSTIC: Log grid interval with full precision (first plane only)
    if (!window.gridIntervalLogged) {
      console.log("=== QUADRAY GRID INTERVAL (FIXED) ===");
      console.log(`Grid interval (√6/4): ${edgeLength.toFixed(16)}`);
      console.log(`Exact value: ${edgeLength}`);
      window.gridIntervalLogged = true;
    }

    // Base triangle vertices:
    // v0 = origin (0,0,0)
    // v1 = basis1 * edgeLength
    // v2 = basis2 * edgeLength
    const v0 = new THREE.Vector3(0, 0, 0);
    const v1 = basis1.clone().multiplyScalar(edgeLength);
    const v2 = basis2.clone().multiplyScalar(edgeLength);

    // Tessellate triangle outward in three directions:
    // Direction A: along basis1 (v0 -> v1 edge)
    // Direction B: along basis2 (v0 -> v2 edge)
    // Direction C: along (v1 -> v2 edge), which is (v2 - v1) direction

    // For each tessellation position (i, j, k) where i+j+k <= tessellations:
    // - i: steps along basis1 direction
    // - j: steps along basis2 direction
    // - k: steps along (basis2 - basis1) direction
    //
    // Triangle vertex calculation using vector addition:
    // TriangleOrigin = i*v1 + j*v2
    // Each triangle has three vertices: origin, origin+v1, origin+v2

    for (let i = 0; i <= tessellations; i++) {
      for (let j = 0; j <= tessellations - i; j++) {
        // Calculate the "origin" of this triangle copy
        const triOrigin = v1
          .clone()
          .multiplyScalar(i)
          .add(v2.clone().multiplyScalar(j));

        // Three vertices of this triangle:
        const p0 = triOrigin.clone();
        const p1 = triOrigin.clone().add(v1);
        const p2 = triOrigin.clone().add(v2);

        // Draw three edges (triangle outline):
        // Edge 1: p0 -> p1
        vertices.push(p0.x, p0.y, p0.z);
        vertices.push(p1.x, p1.y, p1.z);

        // Edge 2: p1 -> p2
        vertices.push(p1.x, p1.y, p1.z);
        vertices.push(p2.x, p2.y, p2.z);

        // Edge 3: p2 -> p0
        vertices.push(p2.x, p2.y, p2.z);
        vertices.push(p0.x, p0.y, p0.z);
      }
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    return new THREE.LineSegments(
      geometry,
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.4, // Slightly more visible than Central Angle Grid
      })
    );
  }

  /**
   * Create Central Angle Grids (Corrected Implementation)
   * This is the CORRECTED "Tetrahedral Central Angle Exploration Grid" (Option 1)
   * Uses vertex-to-vertex triangular tessellation (no extraneous lines!)
   *
   * NOTE: This accidentally became the correct implementation when we thought
   * we were building IVM grids. The TRUE IVM (Option 2) is still to be implemented.
   */
  function createIVMPlanes() {
    ivmPlanes = new THREE.Group();

    const halfSize = 1.0; // Tetrahedron halfSize (s) - matches dual tetrahedron

    // Read tessellation from slider (dynamic control)
    const sliderElement = document.getElementById("quadrayTessSlider");
    const tessellations = sliderElement ? parseInt(sliderElement.value) : 12;

    // Using nomenclature: W, X, Y, Z for Quadray basis (mapping to indices 0,1,2,3)
    // 6 planes from 6 combinations of 4 basis vectors (all Quadray planes)
    // Color scheme: W=Yellow, X=Red, Y=Blue, Z=Green → RGB two-color mixes

    // WX plane (basis 0, 1) - Yellow+Red = Orange-Yellow
    window.ivmWX = createIVMGrid(
      Quadray.basisVectors[0],
      Quadray.basisVectors[1],
      halfSize,
      tessellations,
      0xffaa00
    );
    window.ivmWX.visible = true;
    window.ivmWX.name = "CentralAngle_WX";
    ivmPlanes.add(window.ivmWX);

    // WY plane (basis 0, 2) - Yellow+Blue = Light Purple/Lavender
    window.ivmWY = createIVMGrid(
      Quadray.basisVectors[0],
      Quadray.basisVectors[2],
      halfSize,
      tessellations,
      0xaaaaff
    );
    window.ivmWY.visible = true;
    window.ivmWY.name = "CentralAngle_WY";
    ivmPlanes.add(window.ivmWY);

    // WZ plane (basis 0, 3) - Yellow+Green = Yellow-Green/Lime
    window.ivmWZ = createIVMGrid(
      Quadray.basisVectors[0],
      Quadray.basisVectors[3],
      halfSize,
      tessellations,
      0xaaff00
    );
    window.ivmWZ.visible = true;
    window.ivmWZ.name = "CentralAngle_WZ";
    ivmPlanes.add(window.ivmWZ);

    // XY plane (basis 1, 2) - Red+Blue = Magenta
    window.ivmXY = createIVMGrid(
      Quadray.basisVectors[1],
      Quadray.basisVectors[2],
      halfSize,
      tessellations,
      0xff00ff
    );
    window.ivmXY.visible = true;
    window.ivmXY.name = "CentralAngle_XY";
    ivmPlanes.add(window.ivmXY);

    // XZ plane (basis 1, 3) - Red+Green = Yellow
    window.ivmXZ = createIVMGrid(
      Quadray.basisVectors[1],
      Quadray.basisVectors[3],
      halfSize,
      tessellations,
      0xffff00
    );
    window.ivmXZ.visible = true;
    window.ivmXZ.name = "CentralAngle_XZ";
    ivmPlanes.add(window.ivmXZ);

    // YZ plane (basis 2, 3) - Blue+Green = Cyan
    window.ivmYZ = createIVMGrid(
      Quadray.basisVectors[2],
      Quadray.basisVectors[3],
      halfSize,
      tessellations,
      0x00ffff
    );
    window.ivmYZ.visible = true;
    window.ivmYZ.name = "CentralAngle_YZ";
    ivmPlanes.add(window.ivmYZ);

    console.log(
      "✅ Central Angle grids created (corrected tessellation, 6 planes) with edge length:",
      (2 * halfSize * Math.sqrt(2)).toFixed(4)
    );

    scene.add(ivmPlanes);
  }

  /**
   * Get edge quadrance (Q = a²) for a polyhedron type
   * Uses RT-pure algebraic formulas (defers sqrt to last possible moment)
   * @param {string} type - Polyhedron type (tetrahedron, cube, octahedron, etc.)
   * @param {number} scale - halfSize parameter (s)
   * @returns {number} Edge quadrance Q = a² (NOT edge length!)
   */
  function getPolyhedronEdgeQuadrance(type, scale) {
    const s2 = scale * scale; // Pre-compute s² for RT calculations

    switch (type) {
      case "tetrahedron":
        // Edge quadrance Q = 8s² (edge = 2s√2)
        return 8 * s2;

      case "dualTetrahedron":
        // Edge quadrance Q = 8s² (edge = 2s√2, SAME as regular tetrahedron!)
        // Vertices: (±s, ∓s, ∓s) - same as tet, just different vertex selection
        // Edge: (s,-s,-s) → (-s,s,-s): Q = (2s)² + (2s)² + 0² = 8s²
        return 8 * s2;

      case "cube":
        // Edge quadrance Q = 4s² (edge = 2s)
        return 4 * s2;

      case "octahedron":
        // Edge quadrance Q = 2s² (edge = s√2)
        return 2 * s2;

      case "icosahedron": {
        // RT-PURE: Edge quadrance using algebraic φ expression (NO hardcoded decimals!)
        // Vertices: a = s/√(1 + φ²), edge Q = 4a² = 4s²/(1 + φ²)
        // Since φ² = φ + 1 (from φ² - φ - 1 = 0):
        // Q = 4s²/(φ + 2) = 4s²/((1+√5)/2 + 2) = 8s²/(5 + √5)
        // This defers √5 expansion to RT.Phi.sqrt5() - algebraic until last step
        const Q_coefficient = 8 / (5 + RT.Phi.sqrt5());
        return Q_coefficient * s2;
      }

      case "dodecahedron": {
        // RT-PURE: Dodecahedron edge quadrance using algebraic φ (NO decimals!)
        // Vertices: cube corners (±s,±s,±s) + phi vertices (0,±s/φ,±sφ) and permutations
        // Sample edge [0,8]: (s,s,s) → (0,s/φ,sφ)
        // Q = s² + s²(1-1/φ)² + s²(1-φ)²
        // Using 1/φ = φ-1 and φ² = φ+1:
        //   = s²[1 + (2-φ)² + (1-φ)²] = s²[1 + (5-3φ) + (2-φ)] = s²(8-4φ)
        //   = 4s²(2-φ) = 2s²(4-2φ) = 2s²(4-(1+√5)) = 2s²(3-√5)
        const Q_coefficient = 2 * (3 - RT.Phi.sqrt5());
        return Q_coefficient * s2;
      }

      case "dualIcosahedron": {
        // RT-PURE: Dual icosa edge Q = base icosa Q × φ²
        // dualRadius = φ × halfSize, so all quadrances scale by φ²
        // Q_dual = Q_base × φ² = [8/(5+√5)] × (φ+1) using φ²=φ+1
        const phi_squared = RT.Phi.squared(); // φ² = φ + 1 (algebraic!)
        const Q_base_coefficient = 8 / (5 + RT.Phi.sqrt5());
        return Q_base_coefficient * phi_squared * s2;
      }

      case "cuboctahedron":
        // Edge quadrance Q = s² (NOT 0.5s²!)
        // Vertices at t = s/√2: (±t,±t,0), (±t,0,±t), (0,±t,±t)
        // Edge: (t,t,0) → (t,0,t): Q = 0² + t² + t² = 2t² = 2(s²/2) = s²
        // rt-polyhedra.js line 1400: expectedQ = 2 * t * t where t = s/√2
        return s2;

      case "rhombicDodecahedron":
        // Edge quadrance Q = 3s²/8 (RT-PURE: exact rational fraction, no decimals!)
        // With u = t/2 where t = s/√2:
        // Edge: (t,0,0) → (t/2,t/2,t/2): Q = (t/2)² + (t/2)² + (t/2)² = 3t²/4 = 3s²/8
        return (3 / 8) * s2;

      case "geodesicTetrahedron":
      case "geodesicOctahedron":
      case "geodesicIcosahedron": {
        // Geodesics subdivide base edges - use base polyhedron quadrance
        const baseType = type.replace("geodesic", "").toLowerCase();
        return getPolyhedronEdgeQuadrance(baseType, scale);
      }

      default:
        console.warn(
          `Unknown polyhedron type: ${type}, using default cube Q=4s²`
        );
        return 4 * s2;
    }
  }

  /**
   * Calculate close-packed vertex sphere radius using RT-pure quadrance formula
   *
   * RATIONAL TRIGONOMETRY: Q_vertex = Q_edge / 4 (pure algebra!)
   * Stay in quadrance space as long as possible, only sqrt at final step.
   *
   * UNIVERSAL FORMULA: When spheres at adjacent vertices are mutually tangent,
   * the vertex sphere quadrance is exactly 1/4 of the edge quadrance.
   * Classical equivalent: r = a/2, but we work with Q = a²/4 directly.
   *
   * @param {string} type - Polyhedron type
   * @param {number} scale - halfSize parameter
   * @returns {number} Vertex sphere radius for close-packing
   */
  function getClosePackedRadius(type, scale) {
    // RT-PURE: Work in quadrance space (no sqrt until final step!)
    const Q_edge = getPolyhedronEdgeQuadrance(type, scale);

    // UNIVERSAL CLOSE-PACKING LAW (Rational Trigonometry form):
    // Q_vertex = Q_edge / 4
    // Pure algebraic relationship - no transcendental functions!
    const Q_vertex = Q_edge / 4;

    // Only NOW do we take sqrt for final radius (rendering requirement)
    const radius = Math.sqrt(Q_vertex);

    // DIAGNOSTIC: RT validation logging (matches rt-polyhedra.js pattern)
    console.log(`🔵 Close-pack RT for ${type} (halfSize=${scale.toFixed(4)}):`);
    console.log(`  Edge quadrance Q_edge: ${Q_edge.toFixed(6)}`);
    console.log(
      `  Vertex quadrance Q_vertex = Q_edge/4: ${Q_vertex.toFixed(6)}`
    );
    console.log(`  Vertex radius r = √Q_vertex: ${radius.toFixed(6)}`);
    console.log(`  ✓ RT-PURE: Stayed in quadrance space until final sqrt`);

    return radius;
  }

  /**
   * Get cached node geometry (prevents repeated generation)
   * @param {boolean} useRT - Use RT geodesic icosahedron (true) or classical sphere (false)
   * @param {string} nodeSize - Size ('sm', 'md', 'lg', 'packed', 'off')
   * @param {string} polyhedronType - Type for close-pack calculations
   * @param {number} scale - halfSize for close-pack calculations
   * @returns {Object} {geometry: THREE.BufferGeometry, triangles: number}
   */
  function getCachedNodeGeometry(useRT, nodeSize, polyhedronType, scale) {
    const cacheKey = `${useRT ? "rt" : "classical"}-${nodeSize}-${polyhedronType || "default"}-${scale || 1}`;

    if (nodeGeometryCache.has(cacheKey)) {
      return nodeGeometryCache.get(cacheKey);
    }

    let nodeGeometry;
    let trianglesPerNode = 0;
    let radius;

    if (nodeSize === "packed") {
      // CLOSE-PACKED MODE: Calculate from edge length using universal formula
      if (!polyhedronType || !scale) {
        console.warn(
          "⚠️ Packed mode requires polyhedronType and scale parameters"
        );
        radius = 0.04; // Fallback to medium size
      } else {
        radius = getClosePackedRadius(polyhedronType, scale);
      }
    } else {
      // FIXED SIZE MODE: Use predefined sizes
      const nodeSizes = {
        sm: 0.02,
        md: 0.04,
        lg: 0.08,
      };
      radius = nodeSizes[nodeSize] || 0.04;
    }

    if (useRT) {
      // RT Geodesic Icosahedron (freq-0 = base 20-triangle icosahedron)
      const polyData = window.RTPolyhedra.geodesicIcosahedron(radius, 0, "out");

      nodeGeometry = new THREE.BufferGeometry();
      const positions = [];
      const indices = [];

      polyData.vertices.forEach(v => {
        positions.push(v.x, v.y, v.z);
      });

      polyData.faces.forEach(faceIndices => {
        for (let i = 1; i < faceIndices.length - 1; i++) {
          indices.push(faceIndices[0], faceIndices[i], faceIndices[i + 1]);
        }
      });

      nodeGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      nodeGeometry.setIndex(indices);
      nodeGeometry.computeVertexNormals();

      trianglesPerNode = indices.length / 3;
    } else {
      // Classical THREE.js Sphere
      nodeGeometry = new THREE.SphereGeometry(radius, 16, 16);
      trianglesPerNode = 16 * 16 * 2; // 512 triangles
    }

    const result = { geometry: nodeGeometry, triangles: trianglesPerNode };
    nodeGeometryCache.set(cacheKey, result);
    return result;
  }

  /**
   * Add vertex nodes to a matrix group
   * Generates unique vertex positions for matrix arrays
   * Supports alternating orientations for tetrahedra
   */
  function addMatrixNodes(
    matrixGroup,
    matrixSize,
    scale,
    rotate45,
    color,
    nodeSize,
    polyhedronType = "cube"
  ) {
    // Get node geometry settings
    // useRTNodeGeometry is read from module-level variable set by button toggles
    const useFlatShading =
      document.getElementById("nodeFlatShading")?.checked || false;

    // Get cached node geometry
    const { geometry: nodeGeometry } = getCachedNodeGeometry(
      useRTNodeGeometry,
      nodeSize,
      polyhedronType,
      scale
    );

    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.2,
      flatShading: useFlatShading,
    });

    // Collect all unique vertex positions from matrix
    const vertexPositions = new Set();

    // Calculate spacing based on polyhedron type
    // - Cube: edge-to-edge contact (spacing = 2 * halfSize)
    // - Tet: inscribes in cube (vertices at cube vertices, spacing = 2 * halfSize)
    // - Octa: centers in cube (vertices at cube face centers, spacing = 2 * halfSize)
    // - Cuboctahedron: scaled by √2, edge length = (halfSize * √2) * √2 = 2 * halfSize
    // - Rhombic Dodecahedron: space-filling tiling (spacing = 2 * halfSize, same as cube)
    let spacing = scale * 2; // All matrices now use 2 * halfSize spacing

    // Generate polyhedron vertices at each grid position
    import("./rt-polyhedra.js").then(PolyModule => {
      const { Polyhedra } = PolyModule;

      // Get the appropriate polyhedron geometry
      let polyGeom;
      if (polyhedronType === "cube") {
        polyGeom = Polyhedra.cube(scale);
      } else if (polyhedronType === "tetrahedron") {
        polyGeom = Polyhedra.tetrahedron(scale);
      } else if (polyhedronType === "octahedron") {
        polyGeom = Polyhedra.octahedron(scale);
      } else if (polyhedronType === "cuboctahedron") {
        // Scale by √2 to match matrix geometry (vertices at scale, not scale/√2)
        polyGeom = Polyhedra.cuboctahedron(scale * Math.sqrt(2));
      } else if (polyhedronType === "rhombicDodecahedron") {
        // Scale by √2 to match matrix geometry (rhombic dodec axial vertices at scale, not scale/√2)
        polyGeom = Polyhedra.rhombicDodecahedron(scale * Math.sqrt(2));
      }

      const { vertices } = polyGeom;

      // For each grid position, add transformed vertices
      for (let i = 0; i < matrixSize; i++) {
        for (let j = 0; j < matrixSize; j++) {
          const offset_x = (i - matrixSize / 2 + 0.5) * spacing;
          const offset_y = (j - matrixSize / 2 + 0.5) * spacing;
          const offset_z = 0;

          // For tetrahedra, handle alternating orientations
          const isUp =
            polyhedronType === "tetrahedron" ? (i + j) % 2 === 0 : true;

          vertices.forEach(v => {
            let x = v.x + offset_x;
            let y = v.y + offset_y;
            let z = v.z + offset_z;

            // Apply 180° rotation for down-facing tets
            if (polyhedronType === "tetrahedron" && !isUp) {
              // Rotate 180° around Z-axis
              x = -(v.x + offset_x);
              y = -(v.y + offset_y);
            }

            // Apply 45° rotation if enabled
            if (rotate45) {
              const cos45 = Math.sqrt(0.5);
              const sin45 = Math.sqrt(0.5);
              const x_rot = cos45 * x - sin45 * y;
              const y_rot = sin45 * x + cos45 * y;
              x = x_rot;
              y = y_rot;
            }

            // Use string key for deduplication
            const key = `${x.toFixed(6)},${y.toFixed(6)},${z.toFixed(6)}`;
            vertexPositions.add(key);
          });
        }
      }

      // Create nodes at unique positions
      vertexPositions.forEach(key => {
        const [x, y, z] = key.split(",").map(parseFloat);
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
        node.position.set(x, y, z);
        node.renderOrder = 3;
        matrixGroup.add(node);
      });

      console.log(
        `[Matrix Nodes] Added ${vertexPositions.size} nodes to ${matrixSize}×${matrixSize} ${polyhedronType} matrix`
      );
    });
  }

  /**
   * Count total triangles in a group (including all children)
   * Used for performance statistics
   */
  function countGroupTriangles(group) {
    let triangles = 0;
    if (group && group.visible) {
      group.traverse(child => {
        if (child.geometry) {
          if (child.geometry.index) {
            triangles += child.geometry.index.count / 3;
          } else if (child.geometry.attributes.position) {
            triangles += child.geometry.attributes.position.count / 3;
          }
        }
      });
    }
    return Math.round(triangles);
  }

  /**
   * Render a polyhedron from vertices, edges, faces
   * Uses proper geometry with indexed faces for clean rendering
   */
  function renderPolyhedron(group, geometry, color, opacity) {
    // Clear existing geometry
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const { vertices, edges, faces } = geometry;

    // Get selected node size from new button selector
    const nodeSizeBtn = document.querySelector(".node-size-btn.active");
    const nodeSize = nodeSizeBtn ? nodeSizeBtn.dataset.nodeSize : "md";
    const showNodes = nodeSize !== "off";
    const showFaces = true; // Always render faces (use opacity slider to hide)

    // Render faces first (back to front) using proper BufferGeometry
    if (showFaces) {
      // Build indexed face geometry
      const positions = [];
      const indices = [];

      // Add all vertices to positions array
      vertices.forEach(v => {
        positions.push(v.x, v.y, v.z);
      });

      // Build face indices (triangulate quads if needed)
      faces.forEach(faceIndices => {
        // Fan triangulation from first vertex
        for (let i = 1; i < faceIndices.length - 1; i++) {
          indices.push(faceIndices[0], faceIndices[i], faceIndices[i + 1]);
        }
      });

      const faceGeometry = new THREE.BufferGeometry();
      faceGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      faceGeometry.setIndex(indices);
      faceGeometry.computeVertexNormals();

      const faceMaterial = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide,
        depthWrite: opacity >= 0.99, // Only write depth for opaque faces
        flatShading: true,
      });

      const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
      faceMesh.renderOrder = 1; // Render faces before edges
      group.add(faceMesh);
    }

    // Render edges using LineSegments for efficiency
    const edgePositions = [];
    edges.forEach(([i, j]) => {
      const v1 = vertices[i];
      const v2 = vertices[j];
      edgePositions.push(v1.x, v1.y, v1.z);
      edgePositions.push(v2.x, v2.y, v2.z);
    });

    const edgeGeometry = new THREE.BufferGeometry();
    edgeGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(edgePositions, 3)
    );

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: color,
      linewidth: 1, // WebGL limitation
      depthTest: true,
      depthWrite: true,
    });

    const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    edgeLines.renderOrder = 2; // Render edges after faces
    group.add(edgeLines);

    // Render vertex nodes using cached geometry for efficiency
    if (showNodes) {
      // Start node generation timing
      PerformanceClock.startNodeGeneration();

      // Get polyhedron type and scale from group for close-pack calculations
      const polyType = group.userData.type;
      const tetEdge = parseFloat(
        document.getElementById("tetScaleSlider").value
      );
      const scale = tetEdge / (2 * Math.sqrt(2)); // Convert tet edge to halfSize

      // Get cached geometry (prevents repeated generation)
      // Pass polyhedronType and scale for 'packed' mode calculations
      const { geometry: nodeGeometry, triangles: trianglesPerNode } =
        getCachedNodeGeometry(useRTNodeGeometry, nodeSize, polyType, scale);

      // Get flatShading preference from checkbox
      const useFlatShading =
        document.getElementById("nodeFlatShading")?.checked || false;

      const nodeMaterial = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.2,
        flatShading: useFlatShading, // User-controlled shading
      });

      vertices.forEach(vertex => {
        // Clone material for each node to avoid shared material issues during selection
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
        node.position.copy(vertex);
        node.renderOrder = 3; // Render nodes on top
        group.add(node);
      });

      // End node generation timing and store triangle count
      PerformanceClock.endNodeGeneration();
      PerformanceClock.timings.lastNodeTriangles = Math.round(trianglesPerNode);
    } else {
      // Reset node triangle count when nodes are OFF
      PerformanceClock.timings.lastNodeTriangles = 0;
    }
  }

  /**
   * Update all geometry based on current settings
   */
  function updateGeometry() {
    // Start performance timing
    PerformanceClock.startCalculation();

    // QUADRAY SYSTEM: Use tet edge length as primary unit
    // For tetrahedron edge length e: halfSize = e / (2√2)
    const tetEdge = parseFloat(document.getElementById("tetScaleSlider").value);
    const scale = tetEdge / (2 * Math.sqrt(2)); // Convert tet edge to halfSize
    const opacity = parseFloat(document.getElementById("opacitySlider").value);

    // Cube (Blue)
    if (document.getElementById("showCube").checked) {
      const cube = Polyhedra.cube(scale);
      renderPolyhedron(cubeGroup, cube, 0x4a9eff, opacity);
      cubeGroup.visible = true;
    } else {
      cubeGroup.visible = false;
    }

    // Cube Matrix (IVM Array)
    if (document.getElementById("showCubeMatrix").checked) {
      const matrixSize = parseInt(
        document.getElementById("cubeMatrixSizeSlider")?.value || "1"
      );
      const rotate45 =
        document.getElementById("cubeMatrixRotate45")?.checked || false;

      // Clear existing cube matrix group
      while (cubeMatrixGroup.children.length > 0) {
        cubeMatrixGroup.remove(cubeMatrixGroup.children[0]);
      }

      // Generate cube matrix
      import("./rt-matrix.js").then(MatrixModule => {
        const { RTMatrix } = MatrixModule;
        const cubeMatrix = RTMatrix.createCubeMatrix(
          matrixSize,
          scale,
          rotate45,
          opacity,
          0x4a9eff,
          THREE
        );
        cubeMatrixGroup.add(cubeMatrix);

        // Add vertex nodes if enabled
        const nodeSizeBtn = document.querySelector(".node-size-btn.active");
        const nodeSize = nodeSizeBtn ? nodeSizeBtn.dataset.nodeSize : "md";
        const showNodes = nodeSize !== "off";

        if (showNodes) {
          addMatrixNodes(
            cubeMatrixGroup,
            matrixSize,
            scale,
            rotate45,
            0x4a9eff,
            nodeSize
          );
        }
      });
      cubeMatrixGroup.visible = true;
    } else {
      cubeMatrixGroup.visible = false;
    }

    // Tetrahedron (Yellow)
    if (document.getElementById("showTetrahedron").checked) {
      const tetra = Polyhedra.tetrahedron(scale);
      renderPolyhedron(tetrahedronGroup, tetra, 0xffff00, opacity);
      tetrahedronGroup.visible = true;

      // DIAGNOSTIC: Log OutSphere radius for edge lengths 1, 2, 3, 4, 5
      // scale = halfSize (s), edge length = 2s√2, OutSphere = s√3
      const halfSize = scale;
      const tetEdgeLength = 2 * halfSize * Math.sqrt(2);
      const outSphereRadius = halfSize * Math.sqrt(3);
      const gridInterval = Math.sqrt(6) / 4;
      const difference = outSphereRadius - gridInterval;
      const percentDiff = (difference / gridInterval) * 100;

      // Only log for integer edge lengths 1-5
      const roundedEdge = Math.round(tetEdgeLength * 10) / 10;
      if ([1.0, 2.0, 3.0, 4.0, 5.0].includes(roundedEdge)) {
        console.log(`\n=== TETRAHEDRON EDGE LENGTH ${roundedEdge} ===`);
        console.log(`HalfSize (s): ${halfSize.toFixed(16)}`);
        console.log(`Edge length (2s√2): ${tetEdgeLength.toFixed(16)}`);
        console.log(`OutSphere radius (s√3): ${outSphereRadius.toFixed(16)}`);
        console.log(`Grid interval (√6/4): ${gridInterval.toFixed(16)}`);
        console.log(`Difference (OutSphere - Grid): ${difference.toFixed(16)}`);
        console.log(`Percent difference: ${percentDiff.toFixed(8)}%`);
      }
    } else {
      tetrahedronGroup.visible = false;
    }

    // Geodesic Tetrahedron (Phase 2.7c - Cyan/Turquoise, complementary to Red)
    // Geodesic Tetrahedron (Phase 2.9 - with projection options)
    if (document.getElementById("showGeodesicTetrahedron").checked) {
      const frequency = parseInt(
        document.getElementById("geodesicTetraFrequency").value
      );
      const projectionRadio = document.querySelector(
        'input[name="geodesicTetraProjection"]:checked'
      );
      const projection = projectionRadio ? projectionRadio.value : "out";

      const geodesicTetra = Polyhedra.geodesicTetrahedron(
        scale,
        isNaN(frequency) ? 1 : frequency,
        projection
      );
      renderPolyhedron(
        geodesicTetrahedronGroup,
        geodesicTetra,
        0x00cccc,
        opacity
      ); // Cyan/turquoise
      geodesicTetrahedronGroup.visible = true;
    } else {
      geodesicTetrahedronGroup.visible = false;
    }

    // Dual Tetrahedron (Magenta)
    if (document.getElementById("showDualTetrahedron").checked) {
      const dualTetra = Polyhedra.dualTetrahedron(scale);
      renderPolyhedron(dualTetrahedronGroup, dualTetra, 0xff00ff, opacity);
      dualTetrahedronGroup.visible = true;
    } else {
      dualTetrahedronGroup.visible = false;
    }

    // Tet Matrix (IVM Array)
    if (document.getElementById("showTetMatrix").checked) {
      const matrixSize = parseInt(
        document.getElementById("tetMatrixSizeSlider")?.value || "1"
      );
      const rotate45 =
        document.getElementById("tetMatrixRotate45")?.checked || false;

      // Clear existing tet matrix group
      while (tetMatrixGroup.children.length > 0) {
        tetMatrixGroup.remove(tetMatrixGroup.children[0]);
      }

      // Generate tet matrix
      import("./rt-matrix.js").then(MatrixModule => {
        const { RTMatrix } = MatrixModule;
        const tetMatrix = RTMatrix.createTetrahedronMatrix(
          matrixSize,
          scale,
          rotate45,
          opacity,
          0xffff00,
          THREE
        );
        tetMatrixGroup.add(tetMatrix);

        // Add vertex nodes if enabled
        const nodeSizeBtn = document.querySelector(".node-size-btn.active");
        const nodeSize = nodeSizeBtn ? nodeSizeBtn.dataset.nodeSize : "md";
        const showNodes = nodeSize !== "off";

        if (showNodes) {
          addMatrixNodes(
            tetMatrixGroup,
            matrixSize,
            scale,
            rotate45,
            0xffff00,
            nodeSize,
            "tetrahedron"
          );
        }
      });
      tetMatrixGroup.visible = true;
    } else {
      tetMatrixGroup.visible = false;
    }

    // Octahedron (Green)
    if (document.getElementById("showOctahedron").checked) {
      const octa = Polyhedra.octahedron(scale);
      renderPolyhedron(octahedronGroup, octa, 0x00ff00, opacity);
      octahedronGroup.visible = true;
    } else {
      octahedronGroup.visible = false;
    }

    // Geodesic Octahedron (Phase 2.7b - Magenta/Pink, complementary to Green)
    if (document.getElementById("showGeodesicOctahedron").checked) {
      const frequency = parseInt(
        document.getElementById("geodesicOctaFrequency").value
      );
      const projectionRadio = document.querySelector(
        'input[name="geodesicOctaProjection"]:checked'
      );
      const projection = projectionRadio ? projectionRadio.value : "out";
      const geodesicOcta = Polyhedra.geodesicOctahedron(
        scale,
        isNaN(frequency) ? 1 : frequency,
        projection
      );
      renderPolyhedron(
        geodesicOctahedronGroup,
        geodesicOcta,
        0xff00cc,
        opacity
      ); // Magenta/pink
      geodesicOctahedronGroup.visible = true;
    } else {
      geodesicOctahedronGroup.visible = false;
    }

    // Octa Matrix (IVM Array)
    if (document.getElementById("showOctaMatrix").checked) {
      const matrixSize = parseInt(
        document.getElementById("octaMatrixSizeSlider")?.value || "1"
      );
      const rotate45 =
        document.getElementById("octaMatrixRotate45")?.checked || false;

      // Clear existing octa matrix group
      while (octaMatrixGroup.children.length > 0) {
        octaMatrixGroup.remove(octaMatrixGroup.children[0]);
      }

      // Generate octa matrix
      import("./rt-matrix.js").then(MatrixModule => {
        const { RTMatrix } = MatrixModule;
        const octaMatrix = RTMatrix.createOctahedronMatrix(
          matrixSize,
          scale,
          rotate45,
          opacity,
          0xff6b6b,
          THREE
        );
        octaMatrixGroup.add(octaMatrix);

        // Add vertex nodes if enabled
        const nodeSizeBtn = document.querySelector(".node-size-btn.active");
        const nodeSize = nodeSizeBtn ? nodeSizeBtn.dataset.nodeSize : "md";
        const showNodes = nodeSize !== "off";

        if (showNodes) {
          addMatrixNodes(
            octaMatrixGroup,
            matrixSize,
            scale,
            rotate45,
            0xff6b6b,
            nodeSize,
            "octahedron"
          );
        }
      });
      octaMatrixGroup.visible = true;
    } else {
      octaMatrixGroup.visible = false;
    }

    // Icosahedron (Cyan)
    if (document.getElementById("showIcosahedron").checked) {
      const icosa = Polyhedra.icosahedron(scale);
      renderPolyhedron(icosahedronGroup, icosa, 0x00ffff, opacity);
      icosahedronGroup.visible = true;
    } else {
      icosahedronGroup.visible = false;
    }

    // Dodecahedron (Yellow)
    if (document.getElementById("showDodecahedron").checked) {
      const dodec = Polyhedra.dodecahedron(scale);
      renderPolyhedron(dodecahedronGroup, dodec, 0xffff00, opacity);
      dodecahedronGroup.visible = true;
    } else {
      dodecahedronGroup.visible = false;
    }

    // Geodesic Icosahedron (Phase 2.7a - Orange-Red, complementary to Cyan)
    if (document.getElementById("showGeodesicIcosahedron").checked) {
      const frequency = parseInt(
        document.getElementById("geodesicFrequency").value
      );
      const projectionRadio = document.querySelector(
        'input[name="geodesicIcosaProjection"]:checked'
      );
      const projection = projectionRadio ? projectionRadio.value : "out";
      const geodesicIcosa = Polyhedra.geodesicIcosahedron(
        scale,
        isNaN(frequency) ? 1 : frequency,
        projection
      );
      renderPolyhedron(
        geodesicIcosahedronGroup,
        geodesicIcosa,
        0xff4400,
        opacity
      ); // Vibrant orange-red
      geodesicIcosahedronGroup.visible = true;
    } else {
      geodesicIcosahedronGroup.visible = false;
    }

    // Dual Icosahedron (Magenta - Face dual of dodecahedron)
    if (document.getElementById("showDualIcosahedron").checked) {
      const dualIcosa = Polyhedra.dualIcosahedron(scale);
      renderPolyhedron(dualIcosahedronGroup, dualIcosa, 0xff00ff, opacity);
      dualIcosahedronGroup.visible = true;
    } else {
      dualIcosahedronGroup.visible = false;
    }

    // Cuboctahedron (Lime green - Vector Equilibrium)
    if (document.getElementById("showCuboctahedron").checked) {
      const cubocta = Polyhedra.cuboctahedron(scale);
      renderPolyhedron(cuboctahedronGroup, cubocta, 0x00ff88, opacity); // Bright lime-cyan
      cuboctahedronGroup.visible = true;
    } else {
      cuboctahedronGroup.visible = false;
    }

    // Cuboctahedron Matrix (Vector Equilibrium Array)
    if (document.getElementById("showCuboctahedronMatrix").checked) {
      const matrixSize = parseInt(
        document.getElementById("cuboctaMatrixSizeSlider")?.value || "1"
      );
      const rotate45 =
        document.getElementById("cuboctaMatrixRotate45")?.checked || false;

      // Clear existing cubocta matrix group
      while (cuboctaMatrixGroup.children.length > 0) {
        cuboctaMatrixGroup.remove(cuboctaMatrixGroup.children[0]);
      }

      // Generate cuboctahedron matrix
      import("./rt-matrix.js").then(MatrixModule => {
        const { RTMatrix } = MatrixModule;
        const cuboctaMatrix = RTMatrix.createCuboctahedronMatrix(
          matrixSize,
          scale,
          rotate45,
          opacity,
          0x00ff88, // Lime-cyan (Vector Equilibrium color)
          THREE
        );
        cuboctaMatrixGroup.add(cuboctaMatrix);

        // Add vertex nodes if enabled
        const nodeSizeBtn = document.querySelector(".node-size-btn.active");
        const nodeSize = nodeSizeBtn ? nodeSizeBtn.dataset.nodeSize : "md";
        const showNodes = nodeSize !== "off";

        if (showNodes) {
          addMatrixNodes(
            cuboctaMatrixGroup,
            matrixSize,
            scale,
            rotate45,
            0x00ff88,
            nodeSize,
            "cuboctahedron"
          );
        }
      });
      cuboctaMatrixGroup.visible = true;
    } else {
      cuboctaMatrixGroup.visible = false;
    }

    // Rhombic Dodecahedron (Orange)
    if (document.getElementById("showRhombicDodecahedron").checked) {
      const rhombicDodec = Polyhedra.rhombicDodecahedron(scale);
      renderPolyhedron(
        rhombicDodecahedronGroup,
        rhombicDodec,
        0xff8800,
        opacity
      );
      rhombicDodecahedronGroup.visible = true;
    } else {
      rhombicDodecahedronGroup.visible = false;
    }

    // Rhombic Dodecahedron Matrix (Space-Filling Array)
    if (document.getElementById("showRhombicDodecMatrix").checked) {
      const matrixSize = parseInt(
        document.getElementById("rhombicDodecMatrixSizeSlider")?.value || "1"
      );
      const rotate45 =
        document.getElementById("rhombicDodecMatrixRotate45")?.checked || false;

      // Clear existing rhombic dodec matrix group
      while (rhombicDodecMatrixGroup.children.length > 0) {
        rhombicDodecMatrixGroup.remove(rhombicDodecMatrixGroup.children[0]);
      }

      // Generate rhombic dodecahedron matrix
      import("./rt-matrix.js").then(MatrixModule => {
        const { RTMatrix } = MatrixModule;
        const rhombicDodecMatrix = RTMatrix.createRhombicDodecahedronMatrix(
          matrixSize,
          scale,
          rotate45,
          opacity,
          0xff8800, // Orange (Rhombic Dodecahedron color)
          THREE
        );
        rhombicDodecMatrixGroup.add(rhombicDodecMatrix);

        // Add vertex nodes if enabled
        const nodeSizeBtn = document.querySelector(".node-size-btn.active");
        const nodeSize = nodeSizeBtn ? nodeSizeBtn.dataset.nodeSize : "md";
        const showNodes = nodeSize !== "off";

        if (showNodes) {
          addMatrixNodes(
            rhombicDodecMatrixGroup,
            matrixSize,
            scale,
            rotate45,
            0xff8800,
            nodeSize,
            "rhombicDodecahedron"
          );
        }
      });
      rhombicDodecMatrixGroup.visible = true;
    } else {
      rhombicDodecMatrixGroup.visible = false;
    }

    // Scale basis vectors to match current slider values
    // Cartesian basis vectors scale with cube edge length
    const cubeEdge = parseFloat(document.getElementById("scaleSlider").value);
    if (cartesianBasis) {
      cartesianBasis.scale.set(cubeEdge, cubeEdge, cubeEdge);
    }

    // Quadray basis vectors scale with tetrahedron edge length
    // (tetEdge already declared at top of function)
    if (quadrayBasis) {
      quadrayBasis.scale.set(
        tetEdge / (2 * Math.sqrt(2)),
        tetEdge / (2 * Math.sqrt(2)),
        tetEdge / (2 * Math.sqrt(2))
      );
    }

    updateGeometryStats();

    // End performance timing
    PerformanceClock.endCalculation();
    PerformanceClock.updateDisplay(useRTNodeGeometry);
  }

  /**
   * Update geometry statistics display
   */
  function updateGeometryStats() {
    const stats = document.getElementById("geometryStats");
    let html = "";

    if (document.getElementById("showCube").checked) {
      const cube = Polyhedra.cube(1);
      const eulerOK = RT.verifyEuler(
        cube.vertices.length,
        cube.edges.length,
        cube.faces.length
      );
      html += `<div><strong>Hexahedron (Cube):</strong></div>`;
      html += `<div>Schläfli: {4,3}</div>`;
      html += `<div>V: ${cube.vertices.length}, E: ${cube.edges.length}, F: ${cube.faces.length}</div>`;
      html += `<div>Euler: ${eulerOK ? "✓" : "✗"} (V - E + F = 2)</div>`;
    }

    if (document.getElementById("showTetrahedron").checked) {
      const tetra = Polyhedra.tetrahedron(1);
      const eulerOK = RT.verifyEuler(
        tetra.vertices.length,
        tetra.edges.length,
        tetra.faces.length
      );
      html += `<div style="margin-top: 10px;"><strong>Tetrahedron:</strong></div>`;
      html += `<div>Schläfli: {3,3}</div>`;
      html += `<div>V: ${tetra.vertices.length}, E: ${tetra.edges.length}, F: ${tetra.faces.length}</div>`;
      html += `<div>Euler: ${eulerOK ? "✓" : "✗"} (V - E + F = 2)</div>`;
    }

    if (document.getElementById("showDualTetrahedron").checked) {
      const tetra = Polyhedra.tetrahedron(1);
      const eulerOK = RT.verifyEuler(
        tetra.vertices.length,
        tetra.edges.length,
        tetra.faces.length
      );
      html += `<div style="margin-top: 10px;"><strong>Dual Tetrahedron:</strong></div>`;
      html += `<div>Schläfli: {3,3} (self-dual)</div>`;
      html += `<div>V: ${tetra.vertices.length}, E: ${tetra.edges.length}, F: ${tetra.faces.length}</div>`;
      html += `<div>Euler: ${eulerOK ? "✓" : "✗"} (V - E + F = 2)</div>`;
    }

    if (document.getElementById("showOctahedron").checked) {
      const octa = Polyhedra.octahedron(1);
      const eulerOK = RT.verifyEuler(
        octa.vertices.length,
        octa.edges.length,
        octa.faces.length
      );
      html += `<div style="margin-top: 10px;"><strong>Octahedron:</strong></div>`;
      html += `<div>Schläfli: {3,4}</div>`;
      html += `<div>V: ${octa.vertices.length}, E: ${octa.edges.length}, F: ${octa.faces.length}</div>`;
      html += `<div>Euler: ${eulerOK ? "✓" : "✗"} (V - E + F = 2)</div>`;
    }

    if (document.getElementById("showIcosahedron").checked) {
      const icosa = Polyhedra.icosahedron(1);
      const eulerOK = RT.verifyEuler(
        icosa.vertices.length,
        icosa.edges.length,
        icosa.faces.length
      );
      html += `<div style="margin-top: 10px;"><strong>Icosahedron:</strong></div>`;
      html += `<div>Schläfli: {3,5}</div>`;
      html += `<div>V: ${icosa.vertices.length}, E: ${icosa.edges.length}, F: ${icosa.faces.length}</div>`;
      html += `<div>Euler: ${eulerOK ? "✓" : "✗"} (V - E + F = 2)</div>`;
    }

    if (document.getElementById("showDualIcosahedron").checked) {
      const icosa = Polyhedra.icosahedron(1);
      const eulerOK = RT.verifyEuler(
        icosa.vertices.length,
        icosa.edges.length,
        icosa.faces.length
      );
      html += `<div style="margin-top: 10px;"><strong>Dual Icosahedron:</strong></div>`;
      html += `<div>Schläfli: {3,5} (inverted)</div>`;
      html += `<div>V: ${icosa.vertices.length}, E: ${icosa.edges.length}, F: ${icosa.faces.length}</div>`;
      html += `<div>Euler: ${eulerOK ? "✓" : "✗"} (V - E + F = 2)</div>`;
    }

    if (document.getElementById("showDodecahedron").checked) {
      const dodec = Polyhedra.dodecahedron(1);
      const eulerOK = RT.verifyEuler(
        dodec.vertices.length,
        dodec.edges.length,
        dodec.faces.length
      );
      html += `<div style="margin-top: 10px;"><strong>Dodecahedron:</strong></div>`;
      html += `<div>Schläfli: {5,3}</div>`;
      html += `<div>V: ${dodec.vertices.length}, E: ${dodec.edges.length}, F: ${dodec.faces.length}</div>`;
      html += `<div>Euler: ${eulerOK ? "✓" : "✗"} (V - E + F = 2)</div>`;
    }

    if (document.getElementById("showRhombicDodecahedron").checked) {
      const rhombicDodec = Polyhedra.rhombicDodecahedron(1);
      const eulerOK = RT.verifyEuler(
        rhombicDodec.vertices.length,
        rhombicDodec.edges.length,
        rhombicDodec.faces.length
      );
      html += `<div style="margin-top: 10px;"><strong>Rhombic Dodecahedron:</strong></div>`;
      html += `<div>Catalan: V(3,4)</div>`;
      html += `<div>V: ${rhombicDodec.vertices.length}, E: ${rhombicDodec.edges.length}, F: ${rhombicDodec.faces.length}</div>`;
      html += `<div>Euler: ${eulerOK ? "✓" : "✗"} (V - E + F = 2)</div>`;
    }

    if (document.getElementById("showCuboctahedron").checked) {
      const cubocta = Polyhedra.cuboctahedron(1);
      const eulerOK = RT.verifyEuler(
        cubocta.vertices.length,
        cubocta.edges.length,
        cubocta.faces.length
      );
      html += `<div style="margin-top: 10px;"><strong>Cuboctahedron:</strong></div>`;
      html += `<div>Archimedean: (3.4)²</div>`;
      html += `<div>V: ${cubocta.vertices.length}, E: ${cubocta.edges.length}, F: ${cubocta.faces.length}</div>`;
      html += `<div>Euler: ${eulerOK ? "✓" : "✗"} (V - E + F = 2)</div>`;
    }

    // Geodesic Tetrahedron
    if (document.getElementById("showGeodesicTetrahedron").checked) {
      const frequency = parseInt(
        document.getElementById("geodesicTetraFrequency").value
      );
      const projectionRadio = document.querySelector(
        'input[name="geodesicTetraProjection"]:checked'
      );
      const projection = projectionRadio ? projectionRadio.value : "out";
      const geodesicTetra = Polyhedra.geodesicTetrahedron(
        1,
        isNaN(frequency) ? 1 : frequency,
        projection
      );
      const eulerOK = RT.verifyEuler(
        geodesicTetra.vertices.length,
        geodesicTetra.edges.length,
        geodesicTetra.faces.length
      );
      const triangles = countGroupTriangles(geodesicTetrahedronGroup);
      html += `<div style="margin-top: 10px;"><strong>Geodesic Tetrahedron:</strong></div>`;
      html += `<div>Freq: ${isNaN(frequency) ? 1 : frequency}, Proj: ${projection}</div>`;
      html += `<div>V: ${geodesicTetra.vertices.length}, E: ${geodesicTetra.edges.length}, F: ${geodesicTetra.faces.length}</div>`;
      html += `<div>Triangles: ${triangles}</div>`;
      html += `<div>Euler: ${eulerOK ? "✓" : "✗"} (V - E + F = 2)</div>`;
    }

    // Geodesic Octahedron
    if (document.getElementById("showGeodesicOctahedron").checked) {
      const frequency = parseInt(
        document.getElementById("geodesicOctaFrequency").value
      );
      const projectionRadio = document.querySelector(
        'input[name="geodesicOctaProjection"]:checked'
      );
      const projection = projectionRadio ? projectionRadio.value : "out";
      const geodesicOcta = Polyhedra.geodesicOctahedron(
        1,
        isNaN(frequency) ? 1 : frequency,
        projection
      );
      const eulerOK = RT.verifyEuler(
        geodesicOcta.vertices.length,
        geodesicOcta.edges.length,
        geodesicOcta.faces.length
      );
      const triangles = countGroupTriangles(geodesicOctahedronGroup);
      html += `<div style="margin-top: 10px;"><strong>Geodesic Octahedron:</strong></div>`;
      html += `<div>Freq: ${isNaN(frequency) ? 1 : frequency}, Proj: ${projection}</div>`;
      html += `<div>V: ${geodesicOcta.vertices.length}, E: ${geodesicOcta.edges.length}, F: ${geodesicOcta.faces.length}</div>`;
      html += `<div>Triangles: ${triangles}</div>`;
      html += `<div>Euler: ${eulerOK ? "✓" : "✗"} (V - E + F = 2)</div>`;
    }

    // Geodesic Icosahedron
    if (document.getElementById("showGeodesicIcosahedron").checked) {
      const frequency = parseInt(
        document.getElementById("geodesicIcosaFrequency").value
      );
      const projectionRadio = document.querySelector(
        'input[name="geodesicIcosaProjection"]:checked'
      );
      const projection = projectionRadio ? projectionRadio.value : "out";
      const geodesicIcosa = Polyhedra.geodesicIcosahedron(
        1,
        isNaN(frequency) ? 1 : frequency,
        projection
      );
      const eulerOK = RT.verifyEuler(
        geodesicIcosa.vertices.length,
        geodesicIcosa.edges.length,
        geodesicIcosa.faces.length
      );
      const triangles = countGroupTriangles(geodesicIcosahedronGroup);
      html += `<div style="margin-top: 10px;"><strong>Geodesic Icosahedron:</strong></div>`;
      html += `<div>Freq: ${isNaN(frequency) ? 1 : frequency}, Proj: ${projection}</div>`;
      html += `<div>V: ${geodesicIcosa.vertices.length}, E: ${geodesicIcosa.edges.length}, F: ${geodesicIcosa.faces.length}</div>`;
      html += `<div>Triangles: ${triangles}</div>`;
      html += `<div>Euler: ${eulerOK ? "✓" : "✗"} (V - E + F = 2)</div>`;
    }

    stats.innerHTML = html || "Select a polyhedron to see stats";
  }

  /**
   * Animation loop with FPS tracking
   */
  function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Required for damping
    renderer.render(scene, camera);

    // Update FPS tracking and performance display
    PerformanceClock.updateFPS();

    // Update display every 10 frames (reduce overhead)
    if (Math.floor(performance.now() / 100) % 10 === 0) {
      PerformanceClock.updateDisplay(useRTNodeGeometry);
    }
  }

  /**
   * Handle window resize
   */
  function onWindowResize() {
    const container = document.getElementById("canvas-container");
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  // Return public API from initScene() factory
  return {
    // Core scene initialization
    initScene,
    animate,
    onWindowResize,

    // Rendering functions
    updateGeometry,
    updateGeometryStats,

    // Grid and basis functions (if needed by rt-init.js)
    // These may not need to be exposed if only called from initScene()
    // Uncomment if rt-init.js needs direct access:
    // createCartesianGrid,
    // createQuadrayBasis,
    // createIVMPlanes,
  };

  // ========================================================================
}
