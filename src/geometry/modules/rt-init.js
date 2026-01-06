// MODULE IMPORTS
// ========================================================================
import { Polyhedra } from "./rt-polyhedra.js";
import { PerformanceClock } from "./performance-clock.js";
import { RTPapercut } from "./rt-papercut.js";
import { RT } from "./rt-math.js"; // For RT.Phi in edge quadrance calculations
import { initQuadranceDemo } from "../demos/rt-quadrance-demo.js";
import { initSpreadDemo } from "../demos/rt-spread-demo.js";
import { initWeierstrassDemo } from "../demos/rt-weierstrass-demo.js";
import { openDemoModal } from "../demos/rt-demo-utils.js";

// Make RTPolyhedra available globally for node geometry creation
window.RTPolyhedra = Polyhedra;

// TODO: Uncomment when ready to extract gumball to module
// import { RTControls } from "./modules/rt-controls.js";

// ========================================================================
// PASSWORD PROTECTION
// ========================================================================
const PASSWORD = "enzyme2026";
const passwordOverlay = document.getElementById("password-overlay");
const passwordInput = document.getElementById("password-input");
const passwordSubmit = document.getElementById("password-submit");
const passwordError = document.getElementById("password-error");

// Check if already authenticated (session storage)
if (sessionStorage.getItem("artexplorer-auth") === "true") {
  passwordOverlay.classList.add("hidden");
  initApp();
} else {
  // Focus on password input
  passwordInput.focus();

  // Handle password submission
  function checkPassword() {
    if (passwordInput.value === PASSWORD) {
      sessionStorage.setItem("artexplorer-auth", "true");
      passwordOverlay.classList.add("hidden");
      passwordError.classList.add("hidden");
      initApp();
    } else {
      passwordError.classList.remove("hidden");
      passwordInput.value = "";
      passwordInput.focus();
    }
  }

  passwordSubmit.addEventListener("click", checkPassword);
  passwordInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
      checkPassword();
    }
  });
}

// ========================================================================
// APPLICATION INITIALIZATION
// ========================================================================
function initApp() {
  // Import Three.js modules
  import("three").then(THREE_MODULE => {
    const THREE = THREE_MODULE.default || THREE_MODULE;

    import("three/addons/controls/OrbitControls.js").then(
      OrbitControlsModule => {
        const OrbitControls = OrbitControlsModule.OrbitControls;

        // Import ARTexplorer modules
        import("./rt-math.js").then(RTModule => {
          const { RT, Quadray } = RTModule;

          import("./rt-polyhedra.js").then(PolyhedraModule => {
            const { Polyhedra } = PolyhedraModule;

            import("./rt-state-manager.js").then(StateModule => {
              const { RTStateManager } = StateModule;

              import("./rt-filehandler.js").then(FileHandlerModule => {
                const { RTFileHandler } = FileHandlerModule;

                // Make THREE, RTStateManager, and RTFileHandler global for easier access in console
                window.THREE = THREE;
                window.RTStateManager = RTStateManager;
                window.RTFileHandler = RTFileHandler;

                // Initialize Quadray basis vectors with THREE.js
                Quadray.init(THREE);

                // Initialize StateManager
                RTStateManager.init();

                // Continue with app initialization
                startARTexplorer(
                  THREE,
                  OrbitControls,
                  RT,
                  Quadray,
                  Polyhedra,
                  RTStateManager,
                  RTFileHandler
                );
              });
            });
          });
        });
      }
    );
  });
}

function startARTexplorer(
  THREE,
  OrbitControls,
  RT,
  Quadray,
  Polyhedra,
  RTStateManager,
  RTFileHandler
) {
  // ========================================================================
  // THREE.JS SCENE SETUP
  // ========================================================================
  let scene, camera, renderer, controls;
  let cubeGroup, tetrahedronGroup, dualTetrahedronGroup, octahedronGroup;
  let icosahedronGroup, dodecahedronGroup, dualIcosahedronGroup;
  let cuboctahedronGroup, rhombicDodecahedronGroup;
  let geodesicIcosahedronGroup; // Phase 2.7a: Geodesic subdivision
  let geodesicTetrahedronGroup; // Phase 2.7c: Geodesic tetrahedron
  let geodesicOctahedronGroup; // Phase 2.7b: Geodesic octahedron
  let cubeMatrixGroup, tetMatrixGroup, octaMatrixGroup; // Matrix forms (IVM arrays)
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
    cubeGroup.userData.type = "cube";
    cubeGroup.userData.isInstance = false; // Mark as Form (template)

    tetrahedronGroup = new THREE.Group();
    tetrahedronGroup.userData.type = "tetrahedron";
    tetrahedronGroup.userData.isInstance = false;

    dualTetrahedronGroup = new THREE.Group();
    dualTetrahedronGroup.userData.type = "dualTetrahedron";
    dualTetrahedronGroup.userData.isInstance = false;

    octahedronGroup = new THREE.Group();
    octahedronGroup.userData.type = "octahedron";
    octahedronGroup.userData.isInstance = false;

    icosahedronGroup = new THREE.Group();
    icosahedronGroup.userData.type = "icosahedron";
    icosahedronGroup.userData.isInstance = false;

    dodecahedronGroup = new THREE.Group();
    dodecahedronGroup.userData.type = "dodecahedron";
    dodecahedronGroup.userData.isInstance = false;

    dualIcosahedronGroup = new THREE.Group();
    dualIcosahedronGroup.userData.type = "dualIcosahedron";
    dualIcosahedronGroup.userData.isInstance = false;

    cuboctahedronGroup = new THREE.Group();
    cuboctahedronGroup.userData.type = "cuboctahedron";
    cuboctahedronGroup.userData.isInstance = false;

    rhombicDodecahedronGroup = new THREE.Group();
    rhombicDodecahedronGroup.userData.type = "rhombicDodecahedron";
    rhombicDodecahedronGroup.userData.isInstance = false;

    geodesicIcosahedronGroup = new THREE.Group(); // Phase 2.7a
    geodesicIcosahedronGroup.userData.type = "geodesicIcosahedron";
    geodesicIcosahedronGroup.userData.isInstance = false;

    geodesicTetrahedronGroup = new THREE.Group(); // Phase 2.7c
    geodesicTetrahedronGroup.userData.type = "geodesicTetrahedron";
    geodesicTetrahedronGroup.userData.isInstance = false;

    geodesicOctahedronGroup = new THREE.Group(); // Phase 2.7b
    geodesicOctahedronGroup.userData.type = "geodesicOctahedron";
    geodesicOctahedronGroup.userData.isInstance = false;

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

    // Initialize PerformanceClock with all scene groups
    PerformanceClock.init([
      cubeGroup,
      tetrahedronGroup,
      dualTetrahedronGroup,
      octahedronGroup,
      icosahedronGroup,
      dodecahedronGroup,
      dualIcosahedronGroup,
      cuboctahedronGroup,
      rhombicDodecahedronGroup,
      geodesicIcosahedronGroup,
      geodesicTetrahedronGroup,
      geodesicOctahedronGroup,
      cubeMatrixGroup,
      tetMatrixGroup,
      octaMatrixGroup,
    ]);

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
    const labels = ["W", "X", "Y", "Z"];

    Quadray.basisVectors.forEach((vec, i) => {
      const arrow = new THREE.ArrowHelper(
        vec,
        new THREE.Vector3(0, 0, 0),
        arrowLength, // Total arrow length = 2√2
        colors[i],
        headLength, // Head length = 0.3
        0.2
      );

      // Add invisible sphere at arrow tip for easier clicking (gumball handle)
      const tipPosition = vec.clone().multiplyScalar(arrowLength);
      const hitSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8), // Larger hit target
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0, // Invisible
          depthTest: false,
        })
      );
      hitSphere.position.copy(tipPosition);
      hitSphere.userData.basisIndex = i; // Store which basis vector this is
      hitSphere.userData.basisAxis = vec.clone(); // Store axis direction
      hitSphere.userData.isGumballHandle = true; // Mark as gumball handle
      arrow.add(hitSphere);

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

  // ========================================================================
  // NODE GEOMETRY CACHE (prevent repeated generation)
  // ========================================================================
  const nodeGeometryCache = new Map();

  /**
   * Calculate edge QUADRANCE for any polyhedron type
   * RATIONAL TRIGONOMETRY: Stay in quadrance space (Q = a²) to avoid sqrt
   *
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
      case "geodesicIcosahedron":
        // Geodesics subdivide base edges - use base polyhedron quadrance
        const baseType = type.replace("geodesic", "").toLowerCase();
        return getPolyhedronEdgeQuadrance(baseType, scale);

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
   * Add vertex nodes to matrix forms
   * Extracts vertices from all cubes in the matrix and adds spherical nodes
   * @param {THREE.Group} matrixGroup - Matrix group to add nodes to
   * @param {number} matrixSize - Size of matrix (N×N)
   * @param {number} scale - Cube halfSize
   * @param {boolean} rotate45 - Whether matrix is rotated 45°
   * @param {number} color - Node color
   * @param {string} nodeSize - Node size ('sm', 'md', 'lg')
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
    const useRTNodeGeometry =
      document.getElementById("useRTNodeGeometry")?.checked || false;
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
    let spacing;
    if (polyhedronType === "cube") {
      spacing = scale * 2; // Cube edge = 2 * halfSize
    } else if (polyhedronType === "tetrahedron") {
      spacing = 2 * scale * Math.sqrt(2); // Tet edge = 2 * halfSize * √2
    } else if (polyhedronType === "octahedron") {
      spacing = 2 * scale; // Octa spacing for face-to-face contact
    }

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
      }

      const { vertices } = polyGeom;

      // For each grid position, add transformed vertices
      for (let i = 0; i < matrixSize; i++) {
        for (let j = 0; j < matrixSize; j++) {
          const offset_x = (i - matrixSize / 2 + 0.5) * spacing;
          const offset_y = (j - matrixSize / 2 + 0.5) * spacing;
          const offset_z = 0;

          // For tetrahedra, handle alternating orientations
          const isUp = polyhedronType === "tetrahedron" ? (i + j) % 2 === 0 : true;

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
        document.getElementById("geodesicIcosaFrequency").value
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
   * Count triangles in a THREE.js group
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
      const triangles = countGroupTriangles(cubeGroup);
      html += `<div><strong>Hexahedron (Cube):</strong></div>`;
      html += `<div>Schläfli: {4,3}</div>`;
      html += `<div>V: ${cube.vertices.length}, E: ${cube.edges.length}, F: ${cube.faces.length}</div>`;
      html += `<div>Triangles: ${triangles}</div>`;
      html += `<div>Euler: ${eulerOK ? "✓" : "✗"} (V - E + F = 2)</div>`;
    }

    if (document.getElementById("showTetrahedron").checked) {
      const tetra = Polyhedra.tetrahedron(1);
      const eulerOK = RT.verifyEuler(
        tetra.vertices.length,
        tetra.edges.length,
        tetra.faces.length
      );
      const triangles = countGroupTriangles(tetrahedronGroup);
      html += `<div style="margin-top: 10px;"><strong>Tetrahedron:</strong></div>`;
      html += `<div>Schläfli: {3,3}</div>`;
      html += `<div>V: ${tetra.vertices.length}, E: ${tetra.edges.length}, F: ${tetra.faces.length}</div>`;
      html += `<div>Triangles: ${triangles}</div>`;
      html += `<div>Euler: ${eulerOK ? "✓" : "✗"} (V - E + F = 2)</div>`;
    }

    if (document.getElementById("showOctahedron").checked) {
      const octa = Polyhedra.octahedron(1);
      const eulerOK = RT.verifyEuler(
        octa.vertices.length,
        octa.edges.length,
        octa.faces.length
      );
      const triangles = countGroupTriangles(octahedronGroup);
      html += `<div style="margin-top: 10px;"><strong>Octahedron:</strong></div>`;
      html += `<div>Schläfli: {3,4}</div>`;
      html += `<div>V: ${octa.vertices.length}, E: ${octa.edges.length}, F: ${octa.faces.length}</div>`;
      html += `<div>Triangles: ${triangles}</div>`;
      html += `<div>Euler: ${eulerOK ? "✓" : "✗"} (V - E + F = 2)</div>`;
    }

    if (document.getElementById("showIcosahedron").checked) {
      const icosa = Polyhedra.icosahedron(1);
      const eulerOK = RT.verifyEuler(
        icosa.vertices.length,
        icosa.edges.length,
        icosa.faces.length
      );
      const triangles = countGroupTriangles(icosahedronGroup);
      html += `<div style="margin-top: 10px;"><strong>Icosahedron:</strong></div>`;
      html += `<div>Schläfli: {3,5}</div>`;
      html += `<div>V: ${icosa.vertices.length}, E: ${icosa.edges.length}, F: ${icosa.faces.length}</div>`;
      html += `<div>Triangles: ${triangles}</div>`;
      html += `<div>Euler: ${eulerOK ? "✓" : "✗"} (V - E + F = 2)</div>`;
    }

    if (document.getElementById("showDodecahedron").checked) {
      const dodec = Polyhedra.dodecahedron(1);
      const eulerOK = RT.verifyEuler(
        dodec.vertices.length,
        dodec.edges.length,
        dodec.faces.length
      );
      const triangles = countGroupTriangles(dodecahedronGroup);
      html += `<div style="margin-top: 10px;"><strong>Dodecahedron:</strong></div>`;
      html += `<div>Schläfli: {5,3}</div>`;
      html += `<div>V: ${dodec.vertices.length}, E: ${dodec.edges.length}, F: ${dodec.faces.length}</div>`;
      html += `<div>Triangles: ${triangles}</div>`;
      html += `<div>Euler: ${eulerOK ? "✓" : "✗"} (V - E + F = 2)</div>`;
    }

    if (document.getElementById("showRhombicDodecahedron").checked) {
      const rhombicDodec = Polyhedra.rhombicDodecahedron(1);
      const eulerOK = RT.verifyEuler(
        rhombicDodec.vertices.length,
        rhombicDodec.edges.length,
        rhombicDodec.faces.length
      );
      const triangles = countGroupTriangles(rhombicDodecahedronGroup);
      html += `<div style="margin-top: 10px;"><strong>Rhombic Dodecahedron:</strong></div>`;
      html += `<div>Catalan: V(3,4)</div>`;
      html += `<div>V: ${rhombicDodec.vertices.length}, E: ${rhombicDodec.edges.length}, F: ${rhombicDodec.faces.length}</div>`;
      html += `<div>Triangles: ${triangles}</div>`;
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

  // ========================================================================
  // PERFORMANCE MONITORING INITIALIZATION
  // ========================================================================
  // Initialize PerformanceClock with scene groups after they're created
  // (Happens in initScene() - see geodesicOctahedronGroup creation below)

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
    const width = container.clientWidth;
    const height = container.clientHeight;
    const aspect = width / height;

    if (isOrthographic && orthographicCamera) {
      // Update orthographic camera
      const frustumSize = orthographicCamera.top * 2;
      orthographicCamera.left = (frustumSize * aspect) / -2;
      orthographicCamera.right = (frustumSize * aspect) / 2;
      orthographicCamera.top = frustumSize / 2;
      orthographicCamera.bottom = frustumSize / -2;
      orthographicCamera.updateProjectionMatrix();
    } else {
      // Update perspective camera
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }

    renderer.setSize(width, height);
  }

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  // Plane iOS-style toggle switches (Cartesian XYZ + Quadray WXYZ)
  document
    .querySelectorAll(".plane-toggle-switch[data-plane]")
    .forEach(toggleSwitch => {
      toggleSwitch.addEventListener("click", function () {
        // Toggle active state
        this.classList.toggle("active");

        const plane = this.dataset.plane;
        const isActive = this.classList.contains("active");

        // Update Cartesian grid visibility
        if (plane === "XY" && window.gridXY) {
          window.gridXY.visible = isActive;
        } else if (plane === "XZ" && window.gridXZ) {
          window.gridXZ.visible = isActive;
        } else if (plane === "YZ" && window.gridYZ) {
          window.gridYZ.visible = isActive;
        }
        // IVM Grids (Future Implementation) - placeholders, no action yet
        else if (plane.startsWith("quadray")) {
          // These toggles are placeholders for future TRUE IVM implementation
          // No action taken yet
        }
        // Update Central Angle Grid visibility (corrected implementation, 6 planes)
        else if (plane === "ivmWX" && window.ivmWX) {
          window.ivmWX.visible = isActive;
        } else if (plane === "ivmWY" && window.ivmWY) {
          window.ivmWY.visible = isActive;
        } else if (plane === "ivmWZ" && window.ivmWZ) {
          window.ivmWZ.visible = isActive;
        } else if (plane === "ivmXY" && window.ivmXY) {
          window.ivmXY.visible = isActive;
        } else if (plane === "ivmXZ" && window.ivmXZ) {
          window.ivmXZ.visible = isActive;
        } else if (plane === "ivmYZ" && window.ivmYZ) {
          window.ivmYZ.visible = isActive;
        }

        // Show/hide cartesianGrid group if any Cartesian plane is active
        const anyCartesianActive = Array.from(
          document.querySelectorAll(".plane-toggle-switch[data-plane]")
        ).some(
          sw =>
            !sw.dataset.plane.startsWith("quadray") &&
            !sw.dataset.plane.startsWith("ivm") &&
            sw.classList.contains("active")
        );
        if (cartesianGrid) {
          cartesianGrid.visible = anyCartesianActive;
        }

        // Show/hide ivmPlanes group if any IVM plane is active
        const anyIVMActive = Array.from(
          document.querySelectorAll(".plane-toggle-switch[data-plane]")
        ).some(
          sw =>
            sw.dataset.plane.startsWith("ivm") &&
            sw.classList.contains("active")
        );
        if (ivmPlanes) {
          ivmPlanes.visible = anyIVMActive;
        }
      });
    });

  document
    .getElementById("showCartesianBasis")
    .addEventListener("change", e => {
      cartesianBasis.visible = e.target.checked;
    });

  document.getElementById("showQuadray").addEventListener("change", e => {
    quadrayBasis.visible = e.target.checked;
  });

  // Polyhedra toggles
  document
    .getElementById("showCube")
    .addEventListener("change", updateGeometry);
  document
    .getElementById("showTetrahedron")
    .addEventListener("change", updateGeometry);
  document
    .getElementById("showDualTetrahedron")
    .addEventListener("change", updateGeometry);
  document
    .getElementById("showOctahedron")
    .addEventListener("change", updateGeometry);
  document
    .getElementById("showIcosahedron")
    .addEventListener("change", updateGeometry);
  document
    .getElementById("showDodecahedron")
    .addEventListener("change", updateGeometry);
  document
    .getElementById("showDualIcosahedron")
    .addEventListener("change", updateGeometry);
  document
    .getElementById("showCuboctahedron")
    .addEventListener("change", updateGeometry);
  document
    .getElementById("showRhombicDodecahedron")
    .addEventListener("change", updateGeometry);

  // Matrix forms (IVM Arrays)
  const cubeMatrixCheckbox = document.getElementById("showCubeMatrix");
  if (cubeMatrixCheckbox) {
    cubeMatrixCheckbox.addEventListener("change", () => {
      const cubeMatrixControls = document.getElementById("cube-matrix-controls");
      if (cubeMatrixControls) {
        cubeMatrixControls.style.display = cubeMatrixCheckbox.checked ? "block" : "none";
      }
      updateGeometry();
    });
  }

  const cubeMatrixSizeSlider = document.getElementById("cubeMatrixSizeSlider");
  if (cubeMatrixSizeSlider) {
    cubeMatrixSizeSlider.addEventListener("input", e => {
      const matrixSize = parseInt(e.target.value);
      document.getElementById("cubeMatrixSizeValue").textContent = `${matrixSize}×${matrixSize}`;
      updateGeometry();
    });
  }

  const cubeMatrixRotate45 = document.getElementById("cubeMatrixRotate45");
  if (cubeMatrixRotate45) {
    cubeMatrixRotate45.addEventListener("change", updateGeometry);
  }

  // Phase 2.7a, 2.7b, 2.7c: Geodesic controls
  document
    .getElementById("showGeodesicIcosahedron")
    .addEventListener("change", updateGeometry);
  document
    .getElementById("geodesicIcosaFrequency")
    .addEventListener("change", updateGeometry); // Use 'change' not 'input' to avoid glitching
  document
    .getElementById("showGeodesicTetrahedron")
    .addEventListener("change", updateGeometry);
  document
    .getElementById("geodesicTetraFrequency")
    .addEventListener("change", updateGeometry); // Use 'change' not 'input'
  // Phase 2.9: Projection radio buttons
  document
    .querySelectorAll('input[name="geodesicTetraProjection"]')
    .forEach(radio => {
      radio.addEventListener("change", updateGeometry);
    });
  document
    .getElementById("showGeodesicOctahedron")
    .addEventListener("change", updateGeometry);
  document
    .getElementById("geodesicOctaFrequency")
    .addEventListener("change", updateGeometry); // Use 'change' not 'input'
  document
    .querySelectorAll('input[name="geodesicOctaProjection"]')
    .forEach(radio => {
      radio.addEventListener("change", updateGeometry);
    });
  document
    .querySelectorAll('input[name="geodesicIcosaProjection"]')
    .forEach(radio => {
      radio.addEventListener("change", updateGeometry);
    });

  // Dual Scale Sliders - Linked with Smart Snapping
  // ONE unified metric, TWO presentation modes
  // Both snap to 0.10 intervals, show 2 decimal places
  // Which slider you adjust determines which shows rational values

  document.getElementById("scaleSlider").addEventListener("input", e => {
    const rawValue = parseFloat(e.target.value);

    // Snap cube edge to 0.10 intervals
    const cubeEdge = Math.round(rawValue * 10) / 10;

    // Update cube slider and display (rational - snapped)
    e.target.value = cubeEdge;
    document.getElementById("scaleValue").textContent = cubeEdge.toFixed(4);

    // Calculate corresponding tet edge (irrational)
    const tetEdge = cubeEdge * Math.sqrt(2);

    // Update tet slider and display (irrational - calculated)
    document.getElementById("tetScaleSlider").value = tetEdge;
    document.getElementById("tetScaleValue").textContent = tetEdge.toFixed(4);

    updateGeometry();
  });

  document.getElementById("tetScaleSlider").addEventListener("input", e => {
    const rawValue = parseFloat(e.target.value);

    // Snap tet edge to 0.10 intervals
    const tetEdge = Math.round(rawValue * 10) / 10;

    // Update tet slider and display (rational - snapped)
    e.target.value = tetEdge;
    document.getElementById("tetScaleValue").textContent = tetEdge.toFixed(4);

    // Calculate corresponding cube edge (irrational)
    const cubeEdge = tetEdge / Math.sqrt(2);

    // Update cube slider and display (irrational - calculated)
    document.getElementById("scaleSlider").value = cubeEdge;
    document.getElementById("scaleValue").textContent = cubeEdge.toFixed(4);

    updateGeometry();
  });

  // Opacity slider
  document.getElementById("opacitySlider").addEventListener("input", e => {
    document.getElementById("opacityValue").textContent = e.target.value;
    updateGeometry();
  });

  // Quadray Grid Tessellation Slider
  document.getElementById("quadrayTessSlider").addEventListener("input", e => {
    const tessValue = parseInt(e.target.value);
    document.getElementById("quadrayTessValue").textContent = tessValue;

    // Rebuild Central Angle Grids with new tessellation
    scene.remove(ivmPlanes);
    createIVMPlanes();

    // Restore visibility state from active toggles
    document.querySelectorAll('[data-plane^="ivm"]').forEach(toggle => {
      const planeName = toggle.dataset.plane;
      const isActive = toggle.classList.contains("active");
      if (window[planeName]) {
        window[planeName].visible = isActive;
      }
    });
  });

  // Cartesian Grid Tessellation Slider
  document
    .getElementById("cartesianTessSlider")
    .addEventListener("input", e => {
      const tessValue = parseInt(e.target.value);
      document.getElementById("cartesianTessValue").textContent = tessValue;

      // Save current cartesianBasis visibility state from checkbox
      const basisCheckbox = document.getElementById("showCartesianBasis");
      const basisWasVisible = basisCheckbox ? basisCheckbox.checked : false;

      // Rebuild Cartesian Grids with new tessellation
      // IMPORTANT: Remove BOTH cartesianGrid AND cartesianBasis to prevent duplicates
      scene.remove(cartesianGrid);
      scene.remove(cartesianBasis);
      createCartesianGrid();

      // Restore visibility state from active toggles
      if (window.gridXY) {
        const xyToggle = document.querySelector('[data-plane="XY"]');
        window.gridXY.visible = xyToggle
          ? xyToggle.classList.contains("active")
          : false;
      }
      if (window.gridXZ) {
        const xzToggle = document.querySelector('[data-plane="XZ"]');
        window.gridXZ.visible = xzToggle
          ? xzToggle.classList.contains("active")
          : false;
      }
      if (window.gridYZ) {
        const yzToggle = document.querySelector('[data-plane="YZ"]');
        window.gridYZ.visible = yzToggle
          ? yzToggle.classList.contains("active")
          : false;
      }

      // Restore cartesianBasis visibility from checkbox state
      if (cartesianBasis) {
        cartesianBasis.visible = basisWasVisible;
      }
    });

  // Reset camera to default axo view
  document.getElementById("resetCamera").addEventListener("click", () => {
    setCameraPreset("axo");
  });

  // ========================================================================
  // VIEW CONTROLS - Camera Presets
  // ========================================================================

  let orthographicCamera = null;
  let originalPerspectiveCamera = null; // Will be set after camera is initialized
  let isOrthographic = false;

  /**
   * Switch between Perspective and Orthographic camera
   */
  function switchCameraType(toOrthographic) {
    // CRITICAL: Store the original perspective camera on first call
    if (!originalPerspectiveCamera && !isOrthographic) {
      originalPerspectiveCamera = camera;
      console.log("📸 Saved original perspective camera reference");
    }

    const container = document.getElementById("canvas-container");
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const aspect = width / height;

    if (toOrthographic && !isOrthographic) {
      // Create orthographic camera matching current perspective view
      const distance = camera.position.distanceTo(controls.target);
      const frustumSize = distance * Math.tan((camera.fov * Math.PI) / 360) * 2;

      orthographicCamera = new THREE.OrthographicCamera(
        (frustumSize * aspect) / -2,
        (frustumSize * aspect) / 2,
        frustumSize / 2,
        frustumSize / -2,
        0.1,
        1000
      );

      // Copy position and orientation from perspective camera
      orthographicCamera.position.copy(camera.position);
      orthographicCamera.rotation.copy(camera.rotation);
      orthographicCamera.up.copy(camera.up);

      // Switch to orthographic
      camera = orthographicCamera;
      controls.object = orthographicCamera;
      isOrthographic = true;

      console.log("✅ Switched to Orthographic camera (parallel projection)");
    } else if (!toOrthographic && isOrthographic) {
      // Switch back to perspective - use ORIGINAL perspective camera
      if (!originalPerspectiveCamera) {
        console.error("❌ Original perspective camera not found!");
        return;
      }

      // Copy current position/rotation from orthographic camera to perspective camera
      originalPerspectiveCamera.position.copy(camera.position);
      originalPerspectiveCamera.rotation.copy(camera.rotation);
      originalPerspectiveCamera.up.copy(camera.up);

      // CRITICAL: Update perspective camera aspect ratio and projection matrix
      originalPerspectiveCamera.aspect = aspect;
      originalPerspectiveCamera.updateProjectionMatrix();

      // Switch to perspective - use the ORIGINAL camera
      camera = originalPerspectiveCamera;
      controls.object = originalPerspectiveCamera;
      isOrthographic = false;

      console.log(
        "✅ Switched to Perspective camera - TRUE perspective with view cone restored"
      );
      console.log(
        `   Camera type: ${camera.isPerspectiveCamera ? "PerspectiveCamera" : camera.isOrthographicCamera ? "OrthographicCamera" : "Unknown"}`
      );
    }

    controls.update();
  }

  /**
   * Set camera to preset view
   * @param {string} view - View name (top, bottom, left, right, front, back, axo)
   */
  function setCameraPreset(view) {
    const distance = 10; // Standard distance from origin

    // Z-up coordinate system (CAD/BIM standard)
    // Z = vertical, X-Y = horizontal ground plane
    // Viewing convention: Standing on ground (X-Y plane), Z is up
    switch (view) {
      case "top":
        // Top view: Looking DOWN from above (camera on +Z looking toward -Z)
        camera.position.set(0, 0, distance);
        camera.up.set(0, 1, 0); // Y axis points "north" in top view
        break;

      case "bottom":
        // Bottom view: Looking UP from below (camera on -Z looking toward +Z)
        camera.position.set(0, 0, -distance);
        camera.up.set(0, -1, 0); // Flip Y to keep orientation consistent
        break;

      case "left": {
        // Left view: Looking from LEFT side at 45° angle (camera on -X,-Y looking toward +X,+Y)
        // At 45° from X-axis to see tetrahedral triangular profile
        const leftDist = distance / Math.sqrt(2);
        camera.position.set(-leftDist, -leftDist, 0);
        camera.up.set(0, 0, 1); // Z points up
        break;
      }

      case "right": {
        // Right view: Looking from RIGHT side at 45° angle (camera on +X,+Y looking toward -X,-Y)
        // At 45° from X-axis to see tetrahedral triangular profile
        const rightDist = distance / Math.sqrt(2);
        camera.position.set(rightDist, rightDist, 0);
        camera.up.set(0, 0, 1); // Z points up
        break;
      }

      case "front":
        // Front view: Looking from FRONT (camera on -Y looking toward +Y)
        // Standing on ground, looking forward (north) - see XZ plane (front elevation)
        camera.position.set(0, -distance, 0);
        camera.up.set(0, 0, 1); // Z points up
        break;

      case "back":
        // Back view: Looking from BACK (camera on +Y looking toward -Y)
        // Standing on ground, looking back (south) - see XZ plane (back elevation)
        camera.position.set(0, distance, 0);
        camera.up.set(0, 0, 1); // Z points up
        break;

      case "axo": {
        // Axonometric/Isometric view (equal angles to X, Y, Z)
        // Position: (1, 1, 1) direction scaled to distance
        const axisoDistance = distance / Math.sqrt(3);
        camera.position.set(
          axisoDistance * Math.sqrt(3),
          axisoDistance * Math.sqrt(3),
          axisoDistance * Math.sqrt(3)
        );
        camera.up.set(0, 0, 1); // Z points up
        break;
      }

      case "perspective":
        // TRUE PERSPECTIVE view - return to initial app state
        // CRITICAL: Switch to perspective camera FIRST, then set position
        if (isOrthographic) {
          orthoCheckbox.checked = false;
          switchCameraType(false);
        }
        // Now set the perspective camera to initial position
        camera.position.set(5, -5, 5);
        camera.up.set(0, 0, 1); // Z points up
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();
        console.log(
          `✅ Camera preset: perspective (TRUE perspective mode restored)`
        );
        return; // Skip the common camera setup below
    }

    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();

    console.log(
      `✅ Camera preset: ${view} (${isOrthographic ? "Orthographic" : "Perspective"})`
    );
  }

  // Enable view preset buttons and wire up event listeners
  const viewButtons = [
    { id: "viewTop", view: "top" },
    { id: "viewBottom", view: "bottom" },
    { id: "viewLeft", view: "left" },
    { id: "viewRight", view: "right" },
    { id: "viewFront", view: "front" },
    { id: "viewBack", view: "back" },
    { id: "viewAxo", view: "axo" },
    { id: "viewPerspective", view: "perspective" },
  ];

  viewButtons.forEach(({ id, view }) => {
    const btn = document.getElementById(id);
    btn.addEventListener("click", () => {
      setCameraPreset(view);
    });
  });

  // Orthographic/Perspective toggle
  const orthoCheckbox = document.getElementById("orthoPerspective");
  orthoCheckbox.addEventListener("change", e => {
    switchCameraType(e.target.checked);
  });

  // ========================================================================
  // INITIALIZE
  // ========================================================================

  // Geodesic toggle functionality
  document.querySelectorAll(".geodesic-toggle").forEach(toggle => {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const targetId = this.dataset.target;
      const targetOptions = document.getElementById(targetId);

      // Toggle collapsed state
      this.classList.toggle("collapsed");
      targetOptions.classList.toggle("collapsed");
    });
  });

  // Section toggle functionality (for main h3 sections)
  document.querySelectorAll(".section-toggle").forEach(toggle => {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const targetId = this.dataset.target;
      const content = document.getElementById(targetId);

      // Toggle collapsed state
      this.classList.toggle("collapsed");
      content.classList.toggle("collapsed");
    });
  });

  // Make h3 headers clickable (entire row) - only those with section-toggle
  document.querySelectorAll("h3").forEach(header => {
    if (header.querySelector(".section-toggle")) {
      header.addEventListener("click", function (e) {
        // Don't trigger if clicking directly on the toggle arrow
        if (e.target.classList.contains("section-toggle")) return;

        const toggle = this.querySelector(".section-toggle");
        if (toggle) {
          toggle.click();
        }
      });
    }
  });

  // Node size selector functionality
  document.querySelectorAll(".node-size-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      // Clear geometry cache when size changes
      nodeGeometryCache.clear();
      // Remove active from all buttons
      document
        .querySelectorAll(".node-size-btn")
        .forEach(b => b.classList.remove("active"));
      // Add active to clicked button
      this.classList.add("active");
      // Trigger re-render
      updateGeometry();
    });
  });

  // Node geometry type toggle (Classical vs RT)
  let useRTNodeGeometry = false; // Default to classical THREE.js spheres

  document
    .getElementById("nodeGeomClassical")
    .addEventListener("click", function () {
      useRTNodeGeometry = false;
      // Clear geometry cache when switching node types
      nodeGeometryCache.clear();
      document.getElementById("nodeGeomClassical").classList.add("active");
      document.getElementById("nodeGeomRT").classList.remove("active");
      updateGeometry();
    });

  document.getElementById("nodeGeomRT").addEventListener("click", function () {
    useRTNodeGeometry = true;
    // Clear geometry cache when switching node types
    nodeGeometryCache.clear();
    document.getElementById("nodeGeomRT").classList.add("active");
    document.getElementById("nodeGeomClassical").classList.remove("active");
    updateGeometry();
  });

  // Node shading toggle (Faceted vs Smooth)
  document
    .getElementById("nodeFlatShading")
    .addEventListener("change", updateGeometry);

  // ========================================================================
  // DEMO MODAL HANDLERS
  // ========================================================================

  // Initialize demo modals on first open
  let demosInitialized = {
    quadrance: false,
    spread: false,
    weierstrass: false,
  };

  document
    .getElementById("open-quadrance-demo")
    .addEventListener("click", e => {
      e.preventDefault();
      openDemoModal("quadrance-modal");
      if (!demosInitialized.quadrance) {
        // Delay initialization to ensure modal is visible and container has dimensions
        setTimeout(() => {
          initQuadranceDemo();
          demosInitialized.quadrance = true;
        }, 50);
      }
    });

  document.getElementById("open-spread-demo").addEventListener("click", e => {
    e.preventDefault();
    openDemoModal("spread-modal");
    if (!demosInitialized.spread) {
      setTimeout(() => {
        initSpreadDemo();
        demosInitialized.spread = true;
      }, 50);
    }
  });

  document
    .getElementById("open-weierstrass-demo")
    .addEventListener("click", e => {
      e.preventDefault();
      openDemoModal("weierstrass-modal");
      if (!demosInitialized.weierstrass) {
        setTimeout(() => {
          initWeierstrassDemo();
          demosInitialized.weierstrass = true;
        }, 50);
      }
    });

  // ========================================================================
  // GUMBALL TOOL FUNCTIONALITY
  // ========================================================================

  // ========================================================================
  // GUMBALL STATE
  // ========================================================================

  // Gumball state
  let currentGumballTool = null; // null = off, "move", "scale", "rotate"
  let currentSnapMode = "free"; // 'free', 'xyz', 'wxyz'
  let isDragging = false;
  let selectedHandle = null; // { type: 'quadray'|'cartesian', index: number, axis: Vector3 }
  let dragPlane = null; // THREE.Plane for raycasting
  let dragStartPoint = new THREE.Vector3();
  let selectedPolyhedra = []; // Will store currently selected polyhedra
  let justFinishedDrag = false; // Track if we just completed a drag (prevent deselect on click-after-drag)
  let editingBasis = null; // Localized gumball that follows selected Forms

  // ========================================================================
  // SELECTION STATE
  // ========================================================================
  let currentSelection = null; // Currently selected polyhedron (Form or Instance)

  // NOW button - deposit current Form as Instance using RTStateManager
  document.getElementById("nowButton").addEventListener("click", function () {
    const selected = getSelectedPolyhedra();

    if (selected.length === 0) {
      console.warn("⚠️ No polyhedra selected - cannot deposit instance");
      return;
    }

    // Track if any matrix forms were deposited (need geometry update)
    let matrixFormDeposited = false;

    // Deposit each selected polyhedron using StateManager
    selected.forEach(poly => {
      const formType = poly.userData.type;

      // Create instance using RTStateManager
      const instance = RTStateManager.createInstance(poly, scene);

      // Reset Form to origin
      RTStateManager.resetForm(poly);

      // Check if this was a matrix form
      if (
        formType === "cubeMatrix" ||
        formType === "tetMatrix" ||
        formType === "octaMatrix"
      ) {
        matrixFormDeposited = true;
      }
    });

    // If matrix form was deposited, regenerate geometry with reset properties
    if (matrixFormDeposited) {
      updateGeometry();
    }

    // Hide editing basis after depositing (nothing selected)
    if (editingBasis) {
      scene.remove(editingBasis);
      editingBasis = null;
    }

    // Deselect after depositing (clear highlight and selection)
    deselectAll();

    // Update counter UI
    document.getElementById("nowCount").textContent =
      RTStateManager.getDepositedCount();

    console.log(
      `📦 Total deposited instances: ${RTStateManager.getDepositedCount()}`
    );
    console.log(`🏠 Forms reset to origin - ready for next transformation`);
  });

  // INLINE BUTTON HANDLERS - RESTORED (Module extraction deferred)
  // Gumball tool selector functionality
  document.querySelectorAll(".toggle-btn.variant-tool").forEach(btn => {
    btn.addEventListener("click", function () {
      const tool = this.dataset.gumballTool;

      // Toggle: if clicking active button, deactivate it
      if (this.classList.contains("active")) {
        this.classList.remove("active");
        currentGumballTool = null;
        controls.enabled = true; // Re-enable orbit controls
        destroyEditingBasis(); // Remove editing basis
        console.log("✅ Gumball disabled - orbit controls enabled");
      } else {
        // Remove active from all gumball tool buttons
        document
          .querySelectorAll(".toggle-btn.variant-tool")
          .forEach(b => b.classList.remove("active"));
        // Add active to clicked button
        this.classList.add("active");
        currentGumballTool = tool;
        controls.enabled = false; // Disable orbit controls when gumball tool active

        // Create editing basis at selected Forms' center
        const selected = getSelectedPolyhedra();
        if (selected.length > 0) {
          // Use first selected polyhedron's position and pass the object for sizing
          createEditingBasis(selected[0].position.clone(), selected[0]);
        }

        console.log(`✅ Gumball tool: ${tool} - orbit controls disabled`);
      }
    });
  });

  // Snap toggle button functionality (NOW HANDLED BY rt-controls.js)
  document.querySelectorAll(".toggle-btn.variant-snap").forEach(btn => {
    btn.addEventListener("click", function () {
      const snapMode = this.dataset.snapMode;

      // Remove active from all snap buttons
      document.querySelectorAll(".toggle-btn.variant-snap").forEach(b => {
        b.classList.remove("active");
      });

      // Add active to clicked button
      this.classList.add("active");

      // Update global snap mode
      currentSnapMode = snapMode;

      console.log(`📐 Snap mode changed to: ${snapMode.toUpperCase()}`);
    });
  });

  // ========================================================================
  // ROTATION INPUT FIELDS - Per-Axis Bidirectional Conversion (Degrees ↔ Spread)
  // ========================================================================

  /**
   * Setup bidirectional conversion between degrees and spread for a pair of input fields
   * @param {string} degreesId - ID of degrees input field
   * @param {string} spreadId - ID of spread input field
   * @param {string} axis - Axis name for logging
   */
  function setupRotationInputs(degreesId, spreadId, axis) {
    const degreesInput = document.getElementById(degreesId);
    const spreadInput = document.getElementById(spreadId);

    if (!degreesInput || !spreadInput) {
      console.warn(`⚠️ Could not find rotation inputs for ${axis}`);
      return;
    }

    // Degrees → Spread
    degreesInput.addEventListener("input", function (e) {
      const degreesValue = parseFloat(e.target.value);
      if (!isNaN(degreesValue)) {
        const spreadValue = RT.degreesToSpread(degreesValue);
        spreadInput.value = spreadValue.toFixed(2);
        console.log(
          `🔄 ${axis}: ${degreesValue.toFixed(2)}° → Spread: ${spreadValue.toFixed(2)}`
        );
      }
    });

    // Spread → Degrees
    spreadInput.addEventListener("input", function (e) {
      const spreadValue = parseFloat(e.target.value);
      if (!isNaN(spreadValue)) {
        const degreesValue = RT.spreadToDegrees(spreadValue);
        degreesInput.value = degreesValue.toFixed(2);
        console.log(
          `🔄 ${axis}: Spread: ${spreadValue.toFixed(2)} → ${degreesValue.toFixed(2)}°`
        );
      }
    });
  }

  // Setup bidirectional conversion for XYZ (Cartesian) axes
  setupRotationInputs("rotXDegrees", "rotXSpread", "X");
  setupRotationInputs("rotYDegrees", "rotYSpread", "Y");
  setupRotationInputs("rotZDegrees", "rotZSpread", "Z");

  // Setup bidirectional conversion for WXYZ (Quadray) axes
  setupRotationInputs("rotWDegrees", "rotWSpread", "W");
  setupRotationInputs("rotXQDegrees", "rotXQSpread", "X (Quadray)");
  setupRotationInputs("rotYQDegrees", "rotYQSpread", "Y (Quadray)");
  setupRotationInputs("rotZQDegrees", "rotZQSpread", "Z (Quadray)");

  // ========================================================================
  // COORDINATE INPUT HANDLERS - Execute transformations on Enter
  // ========================================================================

  /**
   * Helper function to exit current tool mode while keeping selection active
   * Called after transformations complete (Enter key or mouseup)
   */
  function exitToolMode() {
    if (currentGumballTool) {
      console.log(
        `🚪 Exiting ${currentGumballTool} mode - selection preserved`
      );

      // Deactivate tool button
      document.querySelectorAll(".toggle-btn.variant-tool").forEach(btn => {
        btn.classList.remove("active");
      });

      currentGumballTool = null;
      controls.enabled = true; // Re-enable orbit controls

      // Remove editing basis but keep selection highlight
      if (editingBasis) {
        scene.remove(editingBasis);
        editingBasis = null;
      }

      console.log("✅ Tool mode exited - orbit enabled, selection preserved");
    }
  }

  /**
   * Setup coordinate input handler for MOVE mode (XYZ fields)
   */
  function setupMoveCoordinateInputs() {
    const coordInputs = [
      { id: "coordX", axis: "x", name: "X" },
      { id: "coordY", axis: "y", name: "Y" },
      { id: "coordZ", axis: "z", name: "Z" },
    ];

    coordInputs.forEach(({ id, axis, name }) => {
      const input = document.getElementById(id);
      if (!input) return;

      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && currentGumballTool === "move") {
          const value = parseFloat(e.target.value);
          if (isNaN(value)) return;

          const selected = getSelectedPolyhedra();
          if (selected.length === 0) {
            console.warn("⚠️ No polyhedra selected");
            return;
          }

          // Apply position change
          selected.forEach(poly => {
            poly.position[axis] = value;
            console.log(`📍 ${name} position set to ${value.toFixed(4)}`);
          });

          // Update WXYZ coordinates
          if (selected.length > 0) {
            const pos = selected[0].position;
            const basisVectors = Quadray.basisVectors;
            let wxyz = [0, 0, 0, 0];
            for (let i = 0; i < 4; i++) {
              wxyz[i] = pos.dot(basisVectors[i]);
            }
            const mean = (wxyz[0] + wxyz[1] + wxyz[2] + wxyz[3]) / 4;
            wxyz = wxyz.map(c => c - mean);

            document.getElementById("coordW").value = wxyz[0].toFixed(4);
            document.getElementById("coordX2").value = wxyz[1].toFixed(4);
            document.getElementById("coordY2").value = wxyz[2].toFixed(4);
            document.getElementById("coordZ2").value = wxyz[3].toFixed(4);
          }

          // Update editing basis position if it exists
          if (editingBasis && selected.length > 0) {
            editingBasis.position.copy(selected[0].position);
          }

          // Exit tool mode but keep selection
          exitToolMode();
        }
      });
    });
  }

  /**
   * Setup coordinate input handler for MOVE mode (WXYZ fields)
   */
  function setupMoveQuadrayInputs() {
    const coordInputs = [
      { id: "coordW", index: 0, name: "W" },
      { id: "coordX2", index: 1, name: "X" },
      { id: "coordY2", index: 2, name: "Y" },
      { id: "coordZ2", index: 3, name: "Z" },
    ];

    coordInputs.forEach(({ id, index, name }) => {
      const input = document.getElementById(id);
      if (!input) return;

      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && currentGumballTool === "move") {
          const value = parseFloat(e.target.value);
          if (isNaN(value)) return;

          const selected = getSelectedPolyhedra();
          if (selected.length === 0) {
            console.warn("⚠️ No polyhedra selected");
            return;
          }

          // Get all WXYZ values
          let wxyz = [
            parseFloat(document.getElementById("coordW").value),
            parseFloat(document.getElementById("coordX2").value),
            parseFloat(document.getElementById("coordY2").value),
            parseFloat(document.getElementById("coordZ2").value),
          ];

          // Convert WXYZ to Cartesian
          const newPos = Quadray.toCartesian(
            wxyz[0],
            wxyz[1],
            wxyz[2],
            wxyz[3],
            THREE
          );

          // Apply position
          selected.forEach(poly => {
            poly.position.copy(newPos);
            console.log(
              `📍 WXYZ position set: (${wxyz[0].toFixed(4)}, ${wxyz[1].toFixed(4)}, ${wxyz[2].toFixed(4)}, ${wxyz[3].toFixed(4)})`
            );
          });

          // Update XYZ coordinates
          document.getElementById("coordX").value = newPos.x.toFixed(4);
          document.getElementById("coordY").value = newPos.y.toFixed(4);
          document.getElementById("coordZ").value = newPos.z.toFixed(4);

          // Update editing basis position if it exists
          if (editingBasis && selected.length > 0) {
            editingBasis.position.copy(selected[0].position);
          }

          // Exit tool mode but keep selection
          exitToolMode();
        }
      });
    });
  }

  /**
   * Setup rotation input handler for ROTATE mode (Degrees fields - XYZ)
   */
  function setupRotateDegreesInputs() {
    const rotInputs = [
      { id: "rotXDegrees", axis: new THREE.Vector3(1, 0, 0), name: "X" },
      { id: "rotYDegrees", axis: new THREE.Vector3(0, 1, 0), name: "Y" },
      { id: "rotZDegrees", axis: new THREE.Vector3(0, 0, 1), name: "Z" },
    ];

    rotInputs.forEach(({ id, axis, name }) => {
      const input = document.getElementById(id);
      if (!input) return;

      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && currentGumballTool === "rotate") {
          const degrees = parseFloat(e.target.value);
          if (isNaN(degrees)) return;

          const selected = getSelectedPolyhedra();
          if (selected.length === 0) {
            console.warn("⚠️ No polyhedra selected");
            return;
          }

          const radians = (degrees * Math.PI) / 180;

          // Apply rotation
          selected.forEach(poly => {
            poly.rotateOnWorldAxis(axis, radians);
            console.log(
              `🔄 Rotated ${degrees.toFixed(2)}° around ${name} axis`
            );
          });

          // Exit tool mode but keep selection
          exitToolMode();
        }
      });
    });
  }

  /**
   * Setup rotation input handler for ROTATE mode (Degrees fields - WXYZ)
   */
  function setupRotateQuadrayDegreesInputs() {
    const rotInputs = [
      { id: "rotWDegrees", basisIndex: 0, name: "W" },
      { id: "rotXQDegrees", basisIndex: 1, name: "X (Quadray)" },
      { id: "rotYQDegrees", basisIndex: 2, name: "Y (Quadray)" },
      { id: "rotZQDegrees", basisIndex: 3, name: "Z (Quadray)" },
    ];

    rotInputs.forEach(({ id, basisIndex, name }) => {
      const input = document.getElementById(id);
      if (!input) return;

      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && currentGumballTool === "rotate") {
          const degrees = parseFloat(e.target.value);
          if (isNaN(degrees)) return;

          const selected = getSelectedPolyhedra();
          if (selected.length === 0) {
            console.warn("⚠️ No polyhedra selected");
            return;
          }

          const radians = (degrees * Math.PI) / 180;
          const axis = Quadray.basisVectors[basisIndex];

          // Apply rotation
          selected.forEach(poly => {
            poly.rotateOnWorldAxis(axis, radians);
            console.log(
              `🔄 Rotated ${degrees.toFixed(2)}° around ${name} axis`
            );
          });

          // Exit tool mode but keep selection
          exitToolMode();
        }
      });
    });
  }

  // Initialize all coordinate/rotation input handlers
  setupMoveCoordinateInputs();
  setupMoveQuadrayInputs();
  setupRotateDegreesInputs();
  setupRotateQuadrayDegreesInputs();

  // ========================================================================
  // EDITING BASIS MANAGEMENT (Localized Gumball)
  // ========================================================================

  /**
   * Create editing basis (localized gumball) at specified position
   * Respects UI checkbox state: only shows checked coordinate systems
   * @param {THREE.Vector3} position - Position to create the basis at
   * @param {THREE.Group} selectedObject - The selected form/instance for sizing
   */
  function createEditingBasis(position, selectedObject) {
    // Remove existing editing basis if any
    if (editingBasis) {
      scene.remove(editingBasis);
    }

    // Create new group for editing basis
    editingBasis = new THREE.Group();
    editingBasis.position.copy(position);

    // Check which coordinate systems are enabled in UI
    const showCartesian = document.getElementById("showCartesianBasis").checked;
    const showQuadray = document.getElementById("showQuadray").checked;

    // Use tetEdge from slider for arrow length (performant, works for all forms)
    // For platonic solids: tetEdge ≈ OutSphere radius (good fit)
    // For geodesics: tetEdge < OutSphere (handles outside - easier to grab)
    const tetEdge = parseFloat(document.getElementById("tetScaleSlider").value);
    const arrowLength = tetEdge;
    const headLength = 0.3;

    // ALTERNATIVE: Bounding box calculation (more accurate but slower)
    // Useful for large subdivided geodesics if tetEdge becomes too small
    // Uncomment if needed for specific form types:
    /*
          const boundingBox = new THREE.Box3().setFromObject(selectedObject);
          const size = new THREE.Vector3();
          boundingBox.getSize(size);
          const outSphereRadius = Math.max(size.x, size.y, size.z) * Math.sqrt(3) / 2;
          const arrowLength = outSphereRadius;
          */

    // Determine handle type based on active tool
    const isScaleMode = currentGumballTool === "scale";
    const isRotateMode = currentGumballTool === "rotate";

    let basisCount = 0;

    // ========================================================================
    // QUADRAY BASIS VECTORS (WXYZ) - Tetrahedral coordinate system
    // ========================================================================
    if (showQuadray) {
      const quadrayColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00]; // R, G, B, Y

      Quadray.basisVectors.forEach((vec, i) => {
        if (isRotateMode) {
          // ROTATE MODE: Hexagonal circle (arc handle) perpendicular to axis
          const circleRadius = arrowLength * 0.9; // Slightly smaller than arrow length
          const segments = 6; // Hexagon for WXYZ differentiation

          // Create hexagonal circle using EllipseCurve with 6 segments
          const curve = new THREE.EllipseCurve(
            0,
            0, // center x, y
            circleRadius,
            circleRadius, // xRadius, yRadius
            0,
            2 * Math.PI, // start angle, end angle
            false, // clockwise
            0 // rotation
          );

          const points = curve.getPoints(segments);
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({
            color: quadrayColors[i],
            linewidth: 2,
            transparent: true,
            opacity: 0.8,
          });

          const rotationHandle = new THREE.LineLoop(geometry, material);

          // Orient circle perpendicular to the axis vector
          // Default circle is in XY plane (normal = Z-axis)
          const defaultNormal = new THREE.Vector3(0, 0, 1);
          const quaternion = new THREE.Quaternion().setFromUnitVectors(
            defaultNormal,
            vec
          );
          rotationHandle.setRotationFromQuaternion(quaternion);

          editingBasis.add(rotationHandle);

          // Torus hit zone for clicking (visible for debugging)
          const hitThickness = 0.15; // Clickable area thickness
          const hitZone = new THREE.Mesh(
            new THREE.TorusGeometry(circleRadius, hitThickness, 16, 64),
            new THREE.MeshBasicMaterial({
              color: quadrayColors[i],
              transparent: true,
              opacity: 0.2, // Visible for debugging
              depthTest: false,
            })
          );

          hitZone.setRotationFromQuaternion(quaternion);
          hitZone.userData.basisType = "quadray";
          hitZone.userData.basisIndex = i;
          hitZone.userData.basisAxis = vec.clone();
          hitZone.userData.isGumballHandle = true;
          hitZone.userData.isRotationHandle = true;

          editingBasis.add(hitZone);
        } else {
          // MOVE/SCALE MODE: Arrow with handle at tip
          const arrow = new THREE.ArrowHelper(
            vec,
            new THREE.Vector3(0, 0, 0),
            arrowLength,
            quadrayColors[i],
            isScaleMode ? 0 : headLength, // No arrowhead in Scale mode
            0.2
          );

          editingBasis.add(arrow);

          // Add handle at arrow tip - CUBE for Scale, SPHERE for Move
          const tipPosition = vec.clone().multiplyScalar(arrowLength);

          let handle;
          if (isScaleMode) {
            // SCALE MODE: Cube handle
            const cubeSize = 0.4;
            handle = new THREE.Mesh(
              new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize),
              new THREE.MeshBasicMaterial({
                color: quadrayColors[i],
                transparent: true,
                opacity: 0.5,
                depthTest: true,
              })
            );
          } else {
            // MOVE MODE: Sphere handle
            handle = new THREE.Mesh(
              new THREE.SphereGeometry(0.5, 16, 16),
              new THREE.MeshBasicMaterial({
                color: quadrayColors[i],
                transparent: true,
                opacity: 0.3, // Semi-visible for debugging
                depthTest: true,
              })
            );
          }

          handle.position.copy(tipPosition);
          handle.userData.basisType = "quadray";
          handle.userData.basisIndex = i;
          handle.userData.basisAxis = vec.clone();
          handle.userData.isGumballHandle = true;

          editingBasis.add(handle);
        }
      });
      basisCount++;
    }

    // ========================================================================
    // CARTESIAN BASIS VECTORS (XYZ) - Standard orthogonal coordinate system
    // ========================================================================
    if (showCartesian) {
      const cartesianVectors = [
        new THREE.Vector3(1, 0, 0), // X-axis (red)
        new THREE.Vector3(0, 1, 0), // Y-axis (green)
        new THREE.Vector3(0, 0, 1), // Z-axis (blue)
      ];
      const cartesianColors = [0xff0000, 0x00ff00, 0x0000ff]; // R, G, B

      cartesianVectors.forEach((vec, i) => {
        if (isRotateMode) {
          // ROTATE MODE: Smooth circle (arc handle) perpendicular to axis
          const circleRadius = arrowLength * 0.9; // Slightly smaller than arrow length
          const segments = 64; // Smooth circle for XYZ

          // Create smooth circle using EllipseCurve with many segments
          const curve = new THREE.EllipseCurve(
            0,
            0, // center x, y
            circleRadius,
            circleRadius, // xRadius, yRadius
            0,
            2 * Math.PI, // start angle, end angle
            false, // clockwise
            0 // rotation
          );

          const points = curve.getPoints(segments);
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({
            color: cartesianColors[i],
            linewidth: 2,
            transparent: true,
            opacity: 0.8,
          });

          const rotationHandle = new THREE.LineLoop(geometry, material);

          // Orient circle perpendicular to the axis vector
          // Default circle is in XY plane (normal = Z-axis)
          const defaultNormal = new THREE.Vector3(0, 0, 1);
          const quaternion = new THREE.Quaternion().setFromUnitVectors(
            defaultNormal,
            vec
          );
          rotationHandle.setRotationFromQuaternion(quaternion);

          editingBasis.add(rotationHandle);

          // Torus hit zone for clicking (visible for debugging)
          const hitThickness = 0.15; // Clickable area thickness
          const hitZone = new THREE.Mesh(
            new THREE.TorusGeometry(circleRadius, hitThickness, 16, 64),
            new THREE.MeshBasicMaterial({
              color: cartesianColors[i],
              transparent: true,
              opacity: 0.2, // Visible for debugging
              depthTest: false,
            })
          );

          hitZone.setRotationFromQuaternion(quaternion);
          hitZone.userData.basisType = "cartesian";
          hitZone.userData.basisIndex = i;
          hitZone.userData.basisAxis = vec.clone();
          hitZone.userData.isGumballHandle = true;
          hitZone.userData.isRotationHandle = true;

          editingBasis.add(hitZone);
        } else {
          // MOVE/SCALE MODE: Arrow with handle at tip
          const arrow = new THREE.ArrowHelper(
            vec,
            new THREE.Vector3(0, 0, 0),
            arrowLength,
            cartesianColors[i],
            isScaleMode ? 0 : headLength, // No arrowhead in Scale mode
            0.2
          );

          editingBasis.add(arrow);

          // Add handle at arrow tip - CUBE for Scale, SPHERE for Move
          const tipPosition = vec.clone().multiplyScalar(arrowLength);

          let handle;
          if (isScaleMode) {
            // SCALE MODE: Cube handle
            const cubeSize = 0.4;
            handle = new THREE.Mesh(
              new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize),
              new THREE.MeshBasicMaterial({
                color: cartesianColors[i],
                transparent: true,
                opacity: 0.5,
                depthTest: true,
              })
            );
          } else {
            // MOVE MODE: Sphere handle
            handle = new THREE.Mesh(
              new THREE.SphereGeometry(0.5, 16, 16),
              new THREE.MeshBasicMaterial({
                color: cartesianColors[i],
                transparent: true,
                opacity: 0.3, // Semi-visible for debugging
                depthTest: true,
              })
            );
          }

          handle.position.copy(tipPosition);
          handle.userData.basisType = "cartesian";
          handle.userData.basisIndex = i;
          handle.userData.basisAxis = vec.clone();
          handle.userData.isGumballHandle = true;

          editingBasis.add(handle);
        }
      });
      basisCount++;
    }

    // ========================================================================
    // CENTRAL SPHERE for UNIFORM SCALING (Scale mode only)
    // ========================================================================
    if (isScaleMode) {
      const centralSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 32, 32),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.4,
          depthTest: true,
        })
      );

      centralSphere.position.set(0, 0, 0); // At gumball origin
      centralSphere.userData.isGumballHandle = true;
      centralSphere.userData.basisType = "uniform";
      centralSphere.userData.basisIndex = -1; // Special index for uniform
      centralSphere.userData.basisAxis = null; // No specific axis (uniform)

      editingBasis.add(centralSphere);
    }

    scene.add(editingBasis);

    // Log which coordinate systems are shown
    const systems = [];
    if (showQuadray) systems.push("WXYZ");
    if (showCartesian) systems.push("XYZ");
    const systemsStr = systems.length > 0 ? systems.join(" + ") : "NONE";
    console.log(
      `✅ Created editing basis (${systemsStr}) at position: ${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}`
    );
  }

  /**
   * Update editing basis position to follow selected object
   */
  function updateEditingBasisPosition(position) {
    if (editingBasis) {
      editingBasis.position.copy(position);
    }
  }

  /**
   * Destroy editing basis (when tool deactivated)
   */
  function destroyEditingBasis() {
    if (editingBasis) {
      scene.remove(editingBasis);
      editingBasis = null;
      console.log("✅ Editing basis destroyed");
    }
  }

  // Raycaster for handle selection (will be initialized after scene)
  let raycaster;
  let mouse;

  // ========================================================================
  // SELECTION SYSTEM
  // ========================================================================

  /**
   * Select a polyhedron (Form or Instance) with visual highlight
   */
  function selectPolyhedron(polyhedron) {
    // Deselect previous selection
    if (currentSelection) {
      clearHighlight(currentSelection);
    }

    // Set new selection
    currentSelection = polyhedron;

    // Apply highlight
    applyHighlight(polyhedron);

    const type = polyhedron.userData.isInstance ? "Instance" : "Form";
    const name = polyhedron.userData.type || "unknown";
    console.log(`✅ Selected ${type}: ${name}`);
  }

  /**
   * Apply highlight glow to selected polyhedron
   * Enhanced with stronger emissive and thicker edges for visibility
   */
  function applyHighlight(polyhedron) {
    polyhedron.traverse(obj => {
      if (obj.isMesh) {
        // Store original emissive for restoration
        obj.userData.originalEmissive = obj.material.emissive.clone();
        obj.userData.originalEmissiveIntensity = obj.material.emissiveIntensity;

        // Apply bright cyan glow (more intense and visible)
        obj.material.emissive.setHex(0x00ffff);
        obj.material.emissiveIntensity = 0.8;
      } else if (obj.isLine) {
        // Store original line width
        obj.userData.originalLineWidth = obj.material.linewidth || 1;

        // Increase line width for selected edges (more visible)
        obj.material.linewidth = 3;
      }
    });
  }

  /**
   * Clear highlight from polyhedron
   */
  function clearHighlight(polyhedron) {
    polyhedron.traverse(obj => {
      if (obj.isMesh) {
        // Restore original emissive if it was saved
        if (obj.userData.originalEmissive) {
          obj.material.emissive.copy(obj.userData.originalEmissive);
          obj.material.emissiveIntensity =
            obj.userData.originalEmissiveIntensity;
          // Clean up stored data
          delete obj.userData.originalEmissive;
          delete obj.userData.originalEmissiveIntensity;
        } else {
          // Fallback: reset to black emissive (default for non-node meshes)
          // Note: Node meshes should have originalEmissive saved, but this
          // catches any edge cases where it wasn't stored
          obj.material.emissive.setHex(0x000000);
          obj.material.emissiveIntensity = 0;
        }
      } else if (obj.isLine && obj.userData.originalLineWidth !== undefined) {
        obj.material.linewidth = obj.userData.originalLineWidth;
        delete obj.userData.originalLineWidth;
      }
    });
  }

  /**
   * Deselect all polyhedra
   */
  function deselectAll() {
    if (currentSelection) {
      clearHighlight(currentSelection);
      currentSelection = null;
    }
    console.log("✅ Deselected all");
  }

  /**
   * Handle canvas click for object selection
   */
  function onCanvasClick(event) {
    // Don't select during drag operations
    if (isDragging) return;

    // Don't deselect immediately after completing a drag
    // (mouseup fires, then click fires - we want to ignore the click)
    if (justFinishedDrag) {
      justFinishedDrag = false;
      console.log("🚫 Ignoring click-after-drag (selection preserved)");
      return;
    }

    const rect = renderer.domElement.getBoundingClientRect();
    const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const selectionRaycaster = new THREE.Raycaster();

    // Set line threshold to 0.1 for precise edge selection (default is 1)
    // With threshold=1, you could click 1 unit away from edges (2x cube width!)
    // threshold=0.1 allows clicking within 0.1 units of edges
    selectionRaycaster.params.Line.threshold = 0.1;

    selectionRaycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    // Collect all selectable polyhedra (Forms and Instances)
    const selectableObjects = [];

    // Forms (including geodesics and matrix forms)
    const formGroups = [
      cubeGroup,
      tetrahedronGroup,
      dualTetrahedronGroup,
      octahedronGroup,
      icosahedronGroup,
      dodecahedronGroup,
      dualIcosahedronGroup,
      cuboctahedronGroup,
      rhombicDodecahedronGroup,
      geodesicIcosahedronGroup,
      geodesicTetrahedronGroup,
      geodesicOctahedronGroup,
      cubeMatrixGroup,
      tetMatrixGroup,
      octaMatrixGroup,
    ];

    formGroups.forEach(group => {
      if (group && group.visible && group.children.length > 0) {
        // Collect all meshes/lines from group for raycasting
        group.traverse(obj => {
          if (obj.isMesh || obj.isLine) {
            selectableObjects.push({ object: obj, parent: group });
          }
        });
      }
    });

    // Instances (from RTStateManager)
    RTStateManager.getAllInstances().forEach(instance => {
      if (instance.threeObject && instance.threeObject.visible) {
        instance.threeObject.traverse(obj => {
          if (obj.isMesh || obj.isLine) {
            selectableObjects.push({
              object: obj,
              parent: instance.threeObject,
            });
          }
        });
      }
    });

    // Raycast
    const intersects = selectionRaycaster.intersectObjects(
      selectableObjects.map(item => item.object),
      false
    );

    if (intersects.length > 0) {
      // Find parent group from hit object
      const hitObject = intersects[0].object;
      const parentEntry = selectableObjects.find(
        item => item.object === hitObject
      );

      if (parentEntry) {
        selectPolyhedron(parentEntry.parent);
      }
    }
    // NOTE: Clicking empty space no longer deselects
    // Deselection now requires: ESC key OR NOW button
    // This allows users to orbit camera between transformations without losing selection
  }

  // Get selected polyhedra - returns only currently selected polyhedron
  function getSelectedPolyhedra() {
    // Return only the currently selected polyhedron (if any)
    if (currentSelection) {
      return [currentSelection];
    }
    return [];
  }

  // Initialize gumball mouse event listeners (called after initScene)
  function initGumballEventListeners() {
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Mouse down - start dragging
    // Use capture phase (true) to intercept before OrbitControls
    renderer.domElement.addEventListener(
      "mousedown",
      event => {
        // Only work if a gumball tool is active (Move, Scale, or Rotate mode)
        // NOTE: This code is deprecated - gumball functionality moved to rt-controls.js
        // Keeping this check for backward compatibility
        if (
          !currentGumballTool ||
          (currentGumballTool !== "move" &&
            currentGumballTool !== "scale" &&
            currentGumballTool !== "rotate")
        )
          return;

        // Convert mouse position to normalized device coordinates
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        // Check editing basis (localized gumball) if it exists
        if (editingBasis) {
          // Collect all gumball handle hit spheres from editing basis
          const hitTargets = [];
          editingBasis.traverse(obj => {
            if (obj.userData.isGumballHandle) {
              hitTargets.push(obj);
            }
          });

          console.log(
            `🎯 Editing basis exists, found ${hitTargets.length} hit targets`
          );

          const intersects = raycaster.intersectObjects(hitTargets, false);

          console.log(`🎯 Raycaster intersects: ${intersects.length}`);

          if (intersects.length > 0) {
            // Get the first intersected handle
            const handle = intersects[0].object;

            if (handle.userData.isGumballHandle) {
              event.preventDefault();
              event.stopPropagation();

              isDragging = true;
              // Note: controls.enabled already false when tool is active

              // Get the basis vector direction and type from userData
              const axisDirection = handle.userData.basisAxis.clone();
              const basisIndex = handle.userData.basisIndex;
              const basisType = handle.userData.basisType; // 'quadray' or 'cartesian'

              selectedHandle = {
                type: basisType,
                index: basisIndex,
                axis: axisDirection,
              };

              // Create a drag plane perpendicular to camera view
              const cameraDirection = new THREE.Vector3();
              camera.getWorldDirection(cameraDirection);
              dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
                cameraDirection,
                new THREE.Vector3(0, 0, 0)
              );

              // Get starting point
              raycaster.ray.intersectPlane(dragPlane, dragStartPoint);

              // Store initial mouse position for rotation calculation
              dragStartPoint.userData = {
                mouseX: mouse.x,
                mouseY: mouse.y,
                // Store initial quaternions for all selected polyhedra
                initialQuaternions: [],
                initialPositions: [],
              };

              // Store selected polyhedra
              selectedPolyhedra = getSelectedPolyhedra();

              // Store initial state for rotation mode
              if (currentGumballTool === "rotate") {
                selectedPolyhedra.forEach(poly => {
                  dragStartPoint.userData.initialQuaternions.push(
                    poly.quaternion.clone()
                  );
                  dragStartPoint.userData.initialPositions.push(
                    poly.position.clone()
                  );
                });
              }

              const axisName =
                basisType === "cartesian"
                  ? ["X", "Y", "Z"][basisIndex]
                  : ["W", "X", "Y", "Z"][basisIndex];
              console.log(
                `✅ Gumball handle selected: ${basisType.toUpperCase()} ${axisName}-axis, polyhedra count: ${selectedPolyhedra.length}`
              );
            }
          }
        } else {
          console.warn(
            "⚠️ No editing basis found - did you activate Move tool?"
          );
        }
      },
      { capture: true }
    ); // Capture phase to intercept before OrbitControls

    // Mouse move - perform dragging
    renderer.domElement.addEventListener(
      "mousemove",
      event => {
        if (!isDragging || !selectedHandle) return;

        // Prevent orbit controls from receiving this event
        event.preventDefault();
        event.stopPropagation();

        console.log("🔄 Dragging...");

        // Update mouse position
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        // Get current point on drag plane
        const currentPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane, currentPoint);

        if (currentPoint) {
          // ====================================================================
          // TOOL MODE: MOVE vs SCALE
          // ====================================================================
          if (currentGumballTool === "move") {
            // ====================================================================
            // MOVE MODE: Translate polyhedra along axis
            // ====================================================================
            // Calculate movement vector
            const movement = new THREE.Vector3().subVectors(
              currentPoint,
              dragStartPoint
            );

            // Project movement onto the selected axis (constrained movement)
            const axisMovement = movement.dot(selectedHandle.axis);

            // Apply sensitivity multiplier for more responsive dragging
            const sensitivity = 5.0; // Amplify movement for better responsiveness
            const constrainedMovement = selectedHandle.axis
              .clone()
              .multiplyScalar(axisMovement * sensitivity);

            console.log(
              `Movement: ${(axisMovement * sensitivity).toFixed(4)}, Polyhedra: ${selectedPolyhedra.length}`
            );

            // Move all selected polyhedra (FULL PRECISION - no snapping during drag)
            selectedPolyhedra.forEach(poly => {
              poly.position.add(constrainedMovement);
              // Snapping will be applied at mouseup based on currentSnapMode
            });

            // Update editing basis to follow the Forms
            if (selectedPolyhedra.length > 0) {
              updateEditingBasisPosition(selectedPolyhedra[0].position);
            }
          } else if (currentGumballTool === "scale") {
            // ====================================================================
            // SCALE MODE: Scale selected object (Form or Instance)
            // ====================================================================
            // Calculate movement vector
            const movement = new THREE.Vector3().subVectors(
              currentPoint,
              dragStartPoint
            );

            // Project movement onto the selected axis (or radial for uniform)
            let scaleMovement;

            if (selectedHandle.type === "uniform") {
              // UNIFORM SCALING: Use radial distance from origin
              scaleMovement = movement.length();
              // Determine direction (inward vs outward)
              const direction = movement.dot(currentPoint.clone().normalize());
              if (direction < 0) scaleMovement = -scaleMovement;
            } else {
              // AXIS-CONSTRAINED SCALING: Project onto selected axis
              scaleMovement = movement.dot(selectedHandle.axis);
            }

            // Apply sensitivity for meaningful scale changes
            const scaleSensitivity = 15.0;
            const scaleDelta = scaleMovement * scaleSensitivity;

            console.log(
              `Scale delta: ${scaleDelta.toFixed(4)}, Handle type: ${selectedHandle.type}`
            );

            // Scale selected polyhedra directly
            if (selectedPolyhedra.length > 0) {
              selectedPolyhedra.forEach(poly => {
                // Get current scale (default to 1.0 if not set)
                if (!poly.userData.currentScale) {
                  poly.userData.currentScale = 1.0;
                }

                // Calculate new scale multiplier
                const scaleMultiplier = 1 + scaleDelta * 0.01; // Convert delta to percentage
                const newScale = poly.userData.currentScale * scaleMultiplier;

                // Clamp scale to reasonable bounds (0.1 to 10.0)
                const clampedScale = Math.max(0.1, Math.min(10.0, newScale));

                // Apply uniform scale to the object
                poly.scale.set(clampedScale, clampedScale, clampedScale);

                // Store current scale for next frame
                poly.userData.currentScale = clampedScale;

                console.log(
                  `✅ Scaled ${poly.userData.isInstance ? "Instance" : "Form"}: ${clampedScale.toFixed(4)}`
                );
              });

              // If scaling a Form at origin, also update sliders to reflect change
              if (
                selectedPolyhedra.length > 0 &&
                !selectedPolyhedra[0].userData.isInstance
              ) {
                const currentScale = selectedPolyhedra[0].userData.currentScale;
                const cubeSlider = document.getElementById("scaleSlider");
                const tetSlider = document.getElementById("tetScaleSlider");

                // Update sliders to match the visual scale
                const baseCubeEdge = 1.4142; // Default cube edge length
                const baseTetEdge = 2.0; // Default tet edge length

                const newCubeEdge = baseCubeEdge * currentScale;
                const newTetEdge = baseTetEdge * currentScale;

                cubeSlider.value = newCubeEdge;
                tetSlider.value = newTetEdge;

                document.getElementById("scaleValue").textContent =
                  newCubeEdge.toFixed(4);
                document.getElementById("tetScaleValue").textContent =
                  newTetEdge.toFixed(4);
              }
            }

            // NOTE: No position update needed - objects stay in place during scaling
            // Editing basis stays in place
          } else if (currentGumballTool === "rotate") {
            // ====================================================================
            // ROTATE MODE: Rotate selected object around axis
            // ====================================================================
            // Use screen-space mouse movement for rotation
            // Project rotation center to screen space
            const rotationCenter = editingBasis
              ? editingBasis.position
              : new THREE.Vector3(0, 0, 0);
            const centerScreen = rotationCenter.clone().project(camera);

            // Current mouse position in normalized device coordinates
            const currentMouseX = mouse.x;
            const currentMouseY = mouse.y;

            // CRITICAL: Use INITIAL mouse position stored at drag start (not updated every frame!)
            const startMouseX = dragStartPoint.userData.mouseX;
            const startMouseY = dragStartPoint.userData.mouseY;

            // Vectors from center to mouse positions (in screen space)
            const startDX = startMouseX - centerScreen.x;
            const startDY = startMouseY - centerScreen.y;
            const currentDX = currentMouseX - centerScreen.x;
            const currentDY = currentMouseY - centerScreen.y;

            // Calculate angle between the two vectors using atan2
            // This gives us the total accumulated rotation since drag started
            const startAngle = Math.atan2(startDY, startDX);
            const currentAngle = Math.atan2(currentDY, currentDX);
            let deltaAngle = currentAngle - startAngle;

            // Normalize angle to -π to π range
            // Note: This can still cause issues at ±180°, but we're storing initial state
            // so at least we're calculating from the original start point
            if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
            if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

            // Check if rotation axis points toward or away from camera
            const cameraDirection = new THREE.Vector3();
            camera.getWorldDirection(cameraDirection);
            const axisToCamera = selectedHandle.axis.dot(cameraDirection);

            // Flip rotation direction if axis points away from camera
            let signedAngleRadians =
              axisToCamera > 0 ? -deltaAngle : deltaAngle;

            // ================================================================
            // FULL CIRCLE ROTATION (360°) - No spread snapping for now
            // ================================================================
            // Use the deltaAngle directly - it's already calculated correctly
            // from the drag start point, so it supports full 360° rotation
            const snappedAngleRadians = signedAngleRadians;
            const snappedAngleDegrees = (snappedAngleRadians * 180) / Math.PI;

            // Calculate spread for display only (not used for snapping yet)
            const spreadValue =
              Math.sin(signedAngleRadians) * Math.sin(signedAngleRadians);
            const snappedSpread = spreadValue; // No snapping

            /* TODO: Add spread snapping back once full rotation is working
                  // Apply spread snapping (0.1 intervals)
                  const snapInterval = 0.1;
                  const snappedSpread = Math.round(spreadValue / snapInterval) * snapInterval;

                  // Convert snapped spread back to angle (preserving quadrant)
                  // ... quadrant preservation logic here ...
                  */

            console.log(
              `🔄 Rotation: ${snappedAngleDegrees.toFixed(2)}°, Spread: ${snappedSpread.toFixed(2)}, Axis: ${selectedHandle.type}[${selectedHandle.index}]`
            );

            // Update rotation input fields - determine which axis field to update
            let degreesFieldId, spreadFieldId;

            if (selectedHandle.type === "cartesian") {
              // XYZ axes: index 0=X, 1=Y, 2=Z
              const axisNames = ["X", "Y", "Z"];
              const axis = axisNames[selectedHandle.index];
              degreesFieldId = `rot${axis}Degrees`;
              spreadFieldId = `rot${axis}Spread`;
            } else if (selectedHandle.type === "quadray") {
              // WXYZ axes: index 0=W, 1=X, 2=Y, 3=Z
              const axisNames = ["W", "XQ", "YQ", "ZQ"];
              const axis = axisNames[selectedHandle.index];
              degreesFieldId = `rot${axis}Degrees`;
              spreadFieldId = `rot${axis}Spread`;
            }

            // Update the corresponding input fields
            const degreesField = document.getElementById(degreesFieldId);
            const spreadField = document.getElementById(spreadFieldId);
            if (degreesField && spreadField) {
              degreesField.value = snappedAngleDegrees.toFixed(2);
              spreadField.value = snappedSpread.toFixed(2);
            }

            // Apply rotation to selected polyhedra using stored initial state
            if (selectedPolyhedra.length > 0) {
              selectedPolyhedra.forEach((poly, index) => {
                // Get initial quaternion and position from drag start data
                const initialQuaternion =
                  dragStartPoint.userData.initialQuaternions[index];
                const initialPosition =
                  dragStartPoint.userData.initialPositions[index];

                // Reset to initial state FIRST
                poly.quaternion.copy(initialQuaternion);
                poly.position.copy(initialPosition);

                // Calculate offset from rotation center
                const offset = poly.position.clone().sub(rotationCenter);

                // Rotate the offset vector by the TOTAL accumulated angle
                const rotatedOffset = offset
                  .clone()
                  .applyAxisAngle(selectedHandle.axis, snappedAngleRadians);

                // Update position with rotated offset
                poly.position.copy(rotationCenter.clone().add(rotatedOffset));

                // Rotate the object itself using quaternion composition
                const rotationQuat = new THREE.Quaternion().setFromAxisAngle(
                  selectedHandle.axis,
                  snappedAngleRadians
                );
                poly.quaternion.multiplyQuaternions(
                  rotationQuat,
                  initialQuaternion
                );

                console.log(
                  `✅ Rotated ${poly.userData.isInstance ? "Instance" : "Form"}: ${snappedAngleDegrees.toFixed(2)}° around ${selectedHandle.type}[${selectedHandle.index}]`
                );
              });
            }

            // NOTE: Do NOT update dragStartPoint - we calculate angle from original start point
          }

          // Update coordinate inputs (MOVE MODE ONLY)
          if (currentGumballTool === "move" && selectedPolyhedra.length > 0) {
            const pos = selectedPolyhedra[0].position;

            // Update XYZ coordinates
            document.getElementById("coordX").value = pos.x.toFixed(4);
            document.getElementById("coordY").value = pos.y.toFixed(4);
            document.getElementById("coordZ").value = pos.z.toFixed(4);

            // Convert to WXYZ (reverse of Quadray.toCartesian)
            // For now, display placeholder - proper conversion needs implementation
            // This is a simplified approximation
            const basisVectors = Quadray.basisVectors;
            let wxyz = [0, 0, 0, 0];

            // Simple projection onto basis vectors
            for (let i = 0; i < 4; i++) {
              wxyz[i] = pos.dot(basisVectors[i]);
            }

            // Apply zero-sum normalization
            const mean = (wxyz[0] + wxyz[1] + wxyz[2] + wxyz[3]) / 4;
            wxyz = wxyz.map(c => c - mean);

            document.getElementById("coordW").value = wxyz[0].toFixed(4);
            document.getElementById("coordX2").value = wxyz[1].toFixed(4);
            document.getElementById("coordY2").value = wxyz[2].toFixed(4);
            document.getElementById("coordZ2").value = wxyz[3].toFixed(4);
          }

          // CRITICAL FIX: Only update drag start point for MOVE and SCALE modes
          // DO NOT update for ROTATE mode - we need the original start point!
          if (currentGumballTool !== "rotate") {
            dragStartPoint.copy(currentPoint);
          }
        }
      },
      { capture: true }
    ); // Capture phase to intercept before OrbitControls

    // Mouse up - stop dragging
    renderer.domElement.addEventListener(
      "mouseup",
      event => {
        if (isDragging) {
          // Prevent orbit controls from receiving this event
          event.preventDefault();
          event.stopPropagation();

          // ====================================================================
          // ALGEBRAIC PRECISION SNAPPING
          // Apply snapping based on snap mode and handle type (active/passive)
          // ====================================================================
          if (currentSnapMode !== "free" && selectedPolyhedra.length > 0) {
            selectedPolyhedra.forEach(poly => {
              if (currentSnapMode === "xyz") {
                // XYZ Snap Mode: Snap to 0.1 Cartesian grid
                const gridSize = 0.1;
                poly.position.x =
                  Math.round(poly.position.x / gridSize) * gridSize;
                poly.position.y =
                  Math.round(poly.position.y / gridSize) * gridSize;
                poly.position.z =
                  Math.round(poly.position.z / gridSize) * gridSize;
                console.log(
                  `📐 XYZ snap applied: (${poly.position.x.toFixed(2)}, ${poly.position.y.toFixed(2)}, ${poly.position.z.toFixed(2)})`
                );
              } else if (currentSnapMode === "wxyz") {
                // WXYZ Snap Mode: Snap to √6/4 ≈ 0.6124 Quadray grid
                // Convert position to Quadray coordinates
                const basisVectors = Quadray.basisVectors;
                let wxyz = [0, 0, 0, 0];

                // Project position onto Quadray basis vectors
                for (let i = 0; i < 4; i++) {
                  wxyz[i] = poly.position.dot(basisVectors[i]);
                }

                // Apply zero-sum normalization
                const mean = (wxyz[0] + wxyz[1] + wxyz[2] + wxyz[3]) / 4;
                wxyz = wxyz.map(c => c - mean);

                // Snap each Quadray coordinate to grid
                const quadrayGridSize = Math.sqrt(6) / 4; // ≈ 0.6124
                wxyz = wxyz.map(
                  c => Math.round(c / quadrayGridSize) * quadrayGridSize
                );

                // Convert back to Cartesian
                const snappedPos = Quadray.toCartesian(
                  wxyz[0],
                  wxyz[1],
                  wxyz[2],
                  wxyz[3],
                  THREE
                );
                poly.position.copy(snappedPos);
                console.log(
                  `📐 WXYZ snap applied: (W:${wxyz[0].toFixed(3)}, X:${wxyz[1].toFixed(3)}, Y:${wxyz[2].toFixed(3)}, Z:${wxyz[3].toFixed(3)})`
                );
              }
            });

            // Update coordinate displays after snapping
            if (selectedPolyhedra.length > 0) {
              const pos = selectedPolyhedra[0].position;

              // Update XYZ coordinates
              document.getElementById("coordX").value = pos.x.toFixed(4);
              document.getElementById("coordY").value = pos.y.toFixed(4);
              document.getElementById("coordZ").value = pos.z.toFixed(4);

              // Convert to WXYZ and update
              const basisVectors = Quadray.basisVectors;
              let wxyz = [0, 0, 0, 0];
              for (let i = 0; i < 4; i++) {
                wxyz[i] = pos.dot(basisVectors[i]);
              }
              const mean = (wxyz[0] + wxyz[1] + wxyz[2] + wxyz[3]) / 4;
              wxyz = wxyz.map(c => c - mean);

              document.getElementById("coordW").value = wxyz[0].toFixed(4);
              document.getElementById("coordX2").value = wxyz[1].toFixed(4);
              document.getElementById("coordY2").value = wxyz[2].toFixed(4);
              document.getElementById("coordZ2").value = wxyz[3].toFixed(4);
            }
          } else {
            console.log(
              "✨ Free mode - no snapping applied (full precision preserved)"
            );
          }

          // Mark that we just finished a drag to prevent click-after-drag deselection
          justFinishedDrag = true;

          isDragging = false;
          selectedHandle = null;

          // Clear drag start data from selected polyhedra
          selectedPolyhedra.forEach(poly => {
            delete poly.userData.dragStartQuaternion;
            delete poly.userData.dragStartPosition;
          });

          selectedPolyhedra = [];

          // Auto-exit tool mode after drag complete (keeps selection active)
          exitToolMode();
          console.log(
            "✅ Gumball drag ended - tool mode exited, selection preserved"
          );
        }
      },
      { capture: true }
    ); // Capture phase to intercept before OrbitControls
  } // End initGumballEventListeners

  initScene();
  initGumballEventListeners(); // Initialize gumball after scene is ready

  // ========================================================================
  // FILE HANDLER INITIALIZATION
  // ========================================================================
  RTFileHandler.init(RTStateManager, scene, camera);
  console.log("✅ RTFileHandler module initialized");

  // Wire up File section UI buttons
  const importBtn = document.getElementById("importBtn");
  const exportBtn = document.getElementById("exportBtn");
  const saveBtn = document.getElementById("saveBtn");

  // Enable buttons
  importBtn.disabled = false;
  exportBtn.disabled = false;
  saveBtn.disabled = false;

  // Import button - Load JSON state file
  importBtn.addEventListener("click", () => {
    RTFileHandler.showImportDialog();
  });

  // Export button - Show format selection dialog
  exportBtn.addEventListener("click", async () => {
    await RTFileHandler.showExportDialog();
  });

  // Save button - Quick save to JSON with timestamp
  saveBtn.addEventListener("click", () => {
    RTFileHandler.exportStateToFile();
  });

  // Keyboard shortcuts for file operations
  document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + S - Save
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      RTFileHandler.exportStateToFile();
      console.log("💾 Quick save triggered (Ctrl/Cmd+S)");
    }

    // Ctrl/Cmd + O - Open
    if ((e.ctrlKey || e.metaKey) && e.key === "o") {
      e.preventDefault();
      RTFileHandler.showImportDialog();
      console.log("📂 Import dialog opened (Ctrl/Cmd+O)");
    }

    // Ctrl/Cmd + E - Export dialog
    if ((e.ctrlKey || e.metaKey) && e.key === "e") {
      e.preventDefault();
      RTFileHandler.showExportDialog();
      console.log("📤 Export dialog opened (Ctrl/Cmd+E)");
    }
  });

  // TODO: Extract to rt-controls.js module when ready
  // RTControls.init(THREE, Quadray, scene, camera, renderer, controls);
  // console.log("✅ RTControls module initialized");

  // Initialize selection click listener with drag detection
  let mouseDownPos = null;
  let mouseMoved = false;

  renderer.domElement.addEventListener("mousedown", e => {
    mouseDownPos = { x: e.clientX, y: e.clientY };
    mouseMoved = false;
  });

  renderer.domElement.addEventListener("mousemove", e => {
    if (mouseDownPos) {
      const dx = e.clientX - mouseDownPos.x;
      const dy = e.clientY - mouseDownPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If mouse moved more than 5 pixels, consider it a drag/orbit
      if (distance > 5) {
        mouseMoved = true;
      }
    }
  });

  renderer.domElement.addEventListener("mouseup", () => {
    mouseDownPos = null;
  });

  renderer.domElement.addEventListener("click", e => {
    // Only select if mouse didn't move during click (not an orbit/drag)
    if (!mouseMoved) {
      onCanvasClick(e);
    }
    mouseMoved = false;
  });

  animate();

  // ========================================================================
  // RT-PAPERCUT MODULE INITIALIZATION
  // ========================================================================
  RTPapercut.init(scene, camera, renderer);
  window.RTPapercut = RTPapercut; // Global access for debugging

  // ========================================================================
  // KEYBOARD SHORTCUTS (ESC, Delete, Undo/Redo)
  // ========================================================================
  document.addEventListener("keydown", event => {
    // ESC key - deselect all
    if (event.key === "Escape") {
      deselectAll();
      console.log("⎋ ESC: Deselected all");
    }

    // Delete key - delete selected Instance
    if (event.key === "Delete" || event.key === "Backspace") {
      if (currentSelection && currentSelection.userData.isInstance) {
        const instanceId = currentSelection.userData.instanceId;

        // Delete via StateManager
        RTStateManager.deleteInstance(instanceId, scene);

        // Clear selection and highlight
        deselectAll();

        // Update counter UI
        document.getElementById("nowCount").textContent =
          RTStateManager.getDepositedCount();

        console.log(`🗑️  Instance deleted: ${instanceId}`);
      } else if (currentSelection && !currentSelection.userData.isInstance) {
        console.warn("⚠️  Cannot delete Forms (templates), only Instances");
      }
    }

    // Undo: Cmd+Z or Ctrl+Z
    if (
      (event.metaKey || event.ctrlKey) &&
      event.key === "z" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      RTStateManager.undo(scene);

      // Update counter UI
      document.getElementById("nowCount").textContent =
        RTStateManager.getDepositedCount();
    }

    // Redo: Cmd+Shift+Z or Ctrl+Shift+Z
    if (
      (event.metaKey || event.ctrlKey) &&
      event.key === "z" &&
      event.shiftKey
    ) {
      event.preventDefault();
      RTStateManager.redo(scene);

      // Update counter UI
      document.getElementById("nowCount").textContent =
        RTStateManager.getDepositedCount();
    }
  });
} // End startARTexplorer function
