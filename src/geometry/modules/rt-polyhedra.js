/**
 * rt-polyhedra.js
 * Polyhedra Generators for ARTexplorer
 *
 * All Platonic solids, Archimedean solids, and geodesic subdivisions.
 * Uses Rational Trigonometry (RT) for exact calculations.
 *
 * @requires THREE.js
 * @requires rt-math.js
 */

import { RT } from "./rt-math.js";

// Access THREE.js from global scope (set by main HTML)

/**
 * Polyhedra generator functions
 * All functions return {vertices, edges, faces}
 * @namespace Polyhedra
 */
export const Polyhedra = {
  /**
   * Hexahedron (Cube) - vertices at (±1, ±1, ±1)
   * Edge quadrance Q = 4 (edge length = 2)
   * Z-up convention: Z is vertical axis
   */
  cube: (halfSize = 1) => {
    const s = halfSize;
    const vertices = [
      // Bottom face (Z = -s)
      new THREE.Vector3(-s, -s, -s), // 0: left-back-bottom
      new THREE.Vector3(s, -s, -s), // 1: right-back-bottom
      new THREE.Vector3(s, s, -s), // 2: right-front-bottom
      new THREE.Vector3(-s, s, -s), // 3: left-front-bottom
      // Top face (Z = +s)
      new THREE.Vector3(-s, -s, s), // 4: left-back-top
      new THREE.Vector3(s, -s, s), // 5: right-back-top
      new THREE.Vector3(s, s, s), // 6: right-front-top
      new THREE.Vector3(-s, s, s), // 7: left-front-top
    ];

    // 12 edges (3 groups of 4 parallel edges)
    const edges = [
      // Bottom face (Z = -s)
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      // Top face (Z = +s)
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      // Vertical edges (parallel to Z-axis)
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ];

    // 6 square faces
    const faces = [
      [0, 1, 2, 3], // Bottom (Z = -s)
      [4, 5, 6, 7], // Top (Z = +s)
      [0, 1, 5, 4], // Back (Y = -s)
      [2, 3, 7, 6], // Front (Y = +s)
      [0, 3, 7, 4], // Left (X = -s)
      [1, 2, 6, 5], // Right (X = +s)
    ];

    // RT VALIDATION: Check edge quadrance uniformity
    const expectedQ = 4 * halfSize * halfSize; // Q = (2s)² = 4s²
    const validation = RT.validateEdges(vertices, edges, expectedQ);
    const maxError = validation.reduce((max, v) => Math.max(max, v.error), 0);
    console.log(
      `Cube: Expected Q=${expectedQ.toFixed(6)}, Max error=${maxError.toExponential(2)}`
    );

    return { vertices, edges, faces };
  },

  /**
   * Tetrahedron inscribed in cube
   * Uses alternating vertices (every other corner)
   * Edge quadrance Q = 8 (edge length = 2√2)
   */
  tetrahedron: (halfSize = 1) => {
    const s = halfSize;
    // Select 4 vertices of cube such that no two share an edge
    // These form a regular tetrahedron
    const vertices = [
      new THREE.Vector3(-s, -s, -s), // 0: (-, -, -)
      new THREE.Vector3(s, s, -s), // 2: (+, +, -)
      new THREE.Vector3(s, -s, s), // 5: (+, -, +)
      new THREE.Vector3(-s, s, s), // 7: (-, +, +)
    ];

    // 6 edges (all pairs - complete graph K4)
    const edges = [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
      [1, 3],
      [2, 3],
    ];

    // 4 triangular faces
    const faces = [
      [0, 1, 2],
      [0, 1, 3],
      [0, 2, 3],
      [1, 2, 3],
    ];

    // RT VALIDATION: Check edge quadrance uniformity
    const expectedQ = 8 * halfSize * halfSize; // Q = (2√2·s)² = 8s²
    const validation = RT.validateEdges(vertices, edges, expectedQ);
    const maxError = validation.reduce((max, v) => Math.max(max, v.error), 0);
    console.log(
      `Tetrahedron: Expected Q=${expectedQ.toFixed(6)}, Max error=${maxError.toExponential(2)}`
    );

    return { vertices, edges, faces };
  },

  /**
   * Dual Tetrahedron (opposite alternating vertices)
   * Forms stella octangula when both tetrahedra shown together
   */
  dualTetrahedron: (halfSize = 1) => {
    const s = halfSize;
    const vertices = [
      new THREE.Vector3(s, -s, -s), // 1: (+, -, -)
      new THREE.Vector3(-s, s, -s), // 3: (-, +, -)
      new THREE.Vector3(-s, -s, s), // 4: (-, -, +)
      new THREE.Vector3(s, s, s), // 6: (+, +, +)
    ];

    const edges = [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
      [1, 3],
      [2, 3],
    ];

    const faces = [
      [0, 1, 2],
      [0, 1, 3],
      [0, 2, 3],
      [1, 2, 3],
    ];

    // RT VALIDATION: Check edge quadrance uniformity
    const expectedQ = 8 * halfSize * halfSize; // Q = (2√2·s)² = 8s²
    const validation = RT.validateEdges(vertices, edges, expectedQ);
    const maxError = validation.reduce((max, v) => Math.max(max, v.error), 0);
    console.log(
      `Dual Tetrahedron: Expected Q=${expectedQ.toFixed(6)}, Max error=${maxError.toExponential(2)}`
    );

    return { vertices, edges, faces };
  },

  /**
   * Octahedron (dual of cube)
   * Vertices at face centers of cube: (±1,0,0), (0,±1,0), (0,0,±1)
   * Edge quadrance Q = 2 (edge length = √2)
   * Bounded by stella octangula (intersection of dual tetrahedra)
   * Z-up convention: Z is vertical axis
   */
  octahedron: (halfSize = 1) => {
    const s = halfSize;
    // 6 vertices at cube face centers
    const vertices = [
      new THREE.Vector3(s, 0, 0), // 0: Right (+X)
      new THREE.Vector3(-s, 0, 0), // 1: Left (-X)
      new THREE.Vector3(0, s, 0), // 2: Front (+Y)
      new THREE.Vector3(0, -s, 0), // 3: Back (-Y)
      new THREE.Vector3(0, 0, s), // 4: Top (+Z) ← Vertical!
      new THREE.Vector3(0, 0, -s), // 5: Bottom (-Z)
    ];

    // 12 edges (each vertex connects to 4 others, excluding opposite)
    const edges = [
      // Right (0) connects to: front, back, top, bottom
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      // Left (1) connects to: front, back, top, bottom
      [1, 2],
      [1, 3],
      [1, 4],
      [1, 5],
      // Front (2) connects to: top, bottom (already connected to left/right)
      [2, 4],
      [2, 5],
      // Back (3) connects to: top, bottom
      [3, 4],
      [3, 5],
    ];

    // 8 triangular faces (4 above XY-plane, 4 below)
    const faces = [
      // Upper hemisphere (Z > 0)
      [0, 2, 4], // Right-Front-Top
      [0, 3, 4], // Right-Back-Top
      [1, 2, 4], // Left-Front-Top
      [1, 3, 4], // Left-Back-Top
      // Lower hemisphere (Z < 0)
      [0, 2, 5], // Right-Front-Bottom
      [0, 3, 5], // Right-Back-Bottom
      [1, 2, 5], // Left-Front-Bottom
      [1, 3, 5], // Left-Back-Bottom
    ];

    // RT VALIDATION: Check edge quadrance uniformity
    const expectedQ = 2 * halfSize * halfSize; // Q = (√2·s)² = 2s²
    const validation = RT.validateEdges(vertices, edges, expectedQ);
    const maxError = validation.reduce((max, v) => Math.max(max, v.error), 0);
    console.log(
      `Octahedron: Expected Q=${expectedQ.toFixed(6)}, Max error=${maxError.toExponential(2)}`
    );

    return { vertices, edges, faces };
  },

  /**
   * Icosahedron (20 triangular faces, 12 vertices, 30 edges)
   * Rational Trigonometry construction: vertices derived from edge midpoints
   * Alternative to golden ratio: use quadrance relationships
   * For RT purity: coordinates (0, ±a, ±b) where b²/a² = 5 (golden rectangle ratio)
   * This gives edge quadrance Q = 4a² for all 30 edges
   */
  icosahedron: (halfSize = 1) => {
    // RT approach: Use (0, ±a, ±b) where b²/a² = 5 (golden rectangle ratio)
    // Quadrance from (0,1,√5) to (1,√5,0) = 1² + (√5-1)² + 5 = 1 + (6-2√5) + 5 = 12-2√5
    //
    // RATIONAL TRIGONOMETRY: Defer sqrt expansion following Wildberger principles
    // For icosahedron: Three orthogonal golden rectangles (aspect ratio 1:φ)
    // Vertices at (0, ±1, ±φ) and cyclic permutations
    //
    // Normalization: Scale to fit within unit sphere
    // sqrt(1² + φ²) = sqrt(1 + φ²) = sqrt(1 + ((1+√5)/2)²) = sqrt(1 + (3+√5)/2)

    const sqrt5 = Math.sqrt(5); // Defer until needed
    const phi = 0.5 * (1 + sqrt5); // φ = (1 + √5)/2

    // Normalization factor: 1/√(1 + φ²) for unit sphere radius
    const phi_squared = phi * phi; // φ² = φ + 1 = (3 + √5)/2
    const normFactor = 1 / Math.sqrt(1 + phi_squared);

    const a = halfSize * normFactor; // 1 * normalization
    const b = halfSize * phi * normFactor; // φ * normalization

    console.log(`[ThreeRT] Icosahedron RT construction:`);
    console.log(`  √5 = ${sqrt5.toFixed(6)} (deferred expansion)`);
    console.log(`  φ = 0.5(1 + √5) = ${phi.toFixed(6)}`);
    console.log(`  Normalization: 1/√(1 + φ²) = ${normFactor.toFixed(6)}`);
    console.log(`  a = ${a.toFixed(6)}, b = φ·a = ${b.toFixed(6)}`);

    // Z-up convention: Three orthogonal golden rectangles
    // Note: Vertex order unchanged (maintains edge/face topology)
    const vertices = [
      // Rectangle 1: XZ plane (Y = ±a) - VERTICAL front/back wall in Z-up
      new THREE.Vector3(0, a, b), // 0
      new THREE.Vector3(0, a, -b), // 1
      new THREE.Vector3(0, -a, b), // 2
      new THREE.Vector3(0, -a, -b), // 3
      // Rectangle 2: YZ plane (X = ±a) - VERTICAL left/right wall in Z-up
      new THREE.Vector3(a, b, 0), // 4
      new THREE.Vector3(a, -b, 0), // 5
      new THREE.Vector3(-a, b, 0), // 6
      new THREE.Vector3(-a, -b, 0), // 7
      // Rectangle 3: XY plane (Z = ±a) - HORIZONTAL ground plane in Z-up
      new THREE.Vector3(b, 0, a), // 8
      new THREE.Vector3(b, 0, -a), // 9
      new THREE.Vector3(-b, 0, a), // 10
      new THREE.Vector3(-b, 0, -a), // 11
    ];

    // 30 edges (each vertex connects to 5 others in pentagonal symmetry)
    const edges = [
      // Vertex 0 connections
      [0, 2],
      [0, 4],
      [0, 6],
      [0, 8],
      [0, 10],
      // Vertex 1 connections
      [1, 3],
      [1, 4],
      [1, 6],
      [1, 9],
      [1, 11],
      // Vertex 2 connections
      [2, 5],
      [2, 7],
      [2, 8],
      [2, 10],
      // Vertex 3 connections
      [3, 5],
      [3, 7],
      [3, 9],
      [3, 11],
      // Vertex 4 connections
      [4, 6],
      [4, 8],
      [4, 9],
      // Vertex 5 connections
      [5, 7],
      [5, 8],
      [5, 9],
      // Vertex 6 connections
      [6, 10],
      [6, 11],
      // Vertex 7 connections
      [7, 10],
      [7, 11],
      // Vertex 8-9 connection
      [8, 9],
      // Vertex 10-11 connection
      [10, 11],
    ];

    // 20 equilateral triangular faces
    const faces = [
      // Top cap (5 faces around +Y axis)
      [0, 4, 8],
      [0, 6, 4],
      [0, 10, 6],
      [0, 8, 2],
      [0, 2, 10],
      // Upper belt (5 faces)
      [4, 1, 9],
      [4, 9, 8],
      [6, 1, 4],
      [6, 11, 1],
      [6, 10, 11],
      // Lower belt (5 faces)
      [2, 8, 5],
      [8, 9, 5],
      [10, 2, 7],
      [2, 5, 7],
      [10, 7, 11],
      // Bottom cap (5 faces around -Y axis)
      [3, 9, 1],
      [3, 5, 9],
      [3, 11, 7],
      [3, 7, 5],
      [3, 1, 11],
    ];

    // RT VALIDATION: Check edge quadrance uniformity
    // For normalized icosahedron scaled to halfSize, edge Q = 4a²
    const expectedQ = 4 * a * a;
    const validation = RT.validateEdges(vertices, edges, expectedQ);
    const maxError = validation.reduce((max, v) => Math.max(max, v.error), 0);
    console.log(
      `Icosahedron: Expected Q=${expectedQ.toFixed(6)}, Max error=${maxError.toExponential(2)}`
    );

    return { vertices, edges, faces };
  },

  /**
   * Dual Icosahedron (face dual of dodecahedron)
   * Vertices positioned at dodecahedron face centers
   * Each icosahedron vertex points to center of dodecahedron pentagonal face
   *
   * RATIONAL TRIGONOMETRY: Face dual relationship in quadrance space
   * - Dodecahedron inradius (face center) = φ × halfSize
   * - Icosahedron vertices scaled to this radius for "kissing" configuration
   * - Rotation applied using SPREAD (s = sin²θ), not angle
   * - Edge quadrance scaled by φ²
   *
   * This creates the canonical Platonic dual pair positioning
   */
  dualIcosahedron: (halfSize = 1) => {
    // Standard icosahedron normalized to unit sphere
    const sqrt5 = Math.sqrt(5);
    const phi = RT.Phi.value(); // φ = (1 + √5)/2
    const phi_squared = phi * phi;
    const normFactor = 1 / Math.sqrt(1 + phi_squared);

    // Dodecahedron face centers are at radius φ × halfSize from origin
    // Scale icosahedron to match this radius for face dual alignment
    const dualRadius = phi * halfSize;

    const a = dualRadius * normFactor; // scaled to dual radius
    const b = dualRadius * phi * normFactor; // φ times a

    console.log(`[ThreeRT] Dual Icosahedron RT construction:`);
    console.log(`  Dodecahedron halfSize: ${halfSize.toFixed(3)}`);
    console.log(
      `  Dodecahedron inradius (face center): φ·s = ${dualRadius.toFixed(6)}`
    );
    console.log(
      `  Icosahedron vertex radius: ${dualRadius.toFixed(6)} (matches dodec inradius)`
    );
    console.log(`  a = ${a.toFixed(6)}, b = φ·a = ${b.toFixed(6)}`);

    // RATIONAL TRIGONOMETRY: Rotation using spread, not angles
    // For icosa/dodec duality, need -π/2 (90° clockwise) rotation around Z-axis
    // This aligns icosahedron vertices with dodecahedron face centers
    //
    // OPTIMAL RT MATH: This rotation uses EXACT INTEGER VALUES
    // No trigonometric functions called - pure algebraic transformation!
    //
    // For -90° rotation (clockwise when viewed from +Z):
    // sin(-π/2) = -1 (exact algebraic value)
    // cos(-π/2) = 0 (exact algebraic value)
    // Spread s = sin²(-π/2) = (-1)² = 1 (exact integer!)
    // Cross c = cos²(-π/2) = 0² = 0 (exact integer!)
    //
    // This represents the GOLD STANDARD for RT: when rotation angles are
    // "special" (multiples of 90°), spread and cross values are exact integers,
    // eliminating ALL transcendental functions.

    const sin_neg_pi_2 = -1; // sin(-π/2) = -1 (exact!)
    const cos_neg_pi_2 = 0; // cos(-π/2) = 0 (exact!)
    const sin_neg_pi_2_sq = 1; // s = sin²(-π/2) = 1 (EXACT INTEGER!)
    const cos_neg_pi_2_sq = 0; // c = cos²(-π/2) = 0 (EXACT INTEGER!)

    console.log(`  RT ROTATION (Optimal - Integer Spread):`);
    console.log(
      `  Spread s = sin²(-π/2) = ${sin_neg_pi_2_sq} (exact integer!)`
    );
    console.log(`  Cross c = cos²(-π/2) = ${cos_neg_pi_2_sq} (exact integer!)`);
    console.log(`  Verify s + c = 1: ${sin_neg_pi_2_sq + cos_neg_pi_2_sq} ✓`);
    console.log(`  Pure integer matrix - NO transcendental functions!`);

    // Z-axis rotation matrix using spread (clockwise -90°)
    // R_z(-π/2) = [cos, -sin, 0; sin, cos, 0; 0, 0, 1]
    //           = [0, 1, 0; -1, 0, 0; 0, 0, 1]
    // Pure integer matrix - transforms (x,y,z) → (y,-x,z) using ONLY
    // multiplication by 0, 1, and -1
    const rotateZ = v => {
      return new THREE.Vector3(
        cos_neg_pi_2 * v.x - sin_neg_pi_2 * v.y, // 0*x - (-1)*y = y
        sin_neg_pi_2 * v.x + cos_neg_pi_2 * v.y, // -1*x + 0*y = -x
        v.z // z unchanged
      );
    };

    // Same vertex configuration as standard icosahedron, but scaled to dual radius
    // Three orthogonal golden rectangles, THEN rotated by spread s=1 around Z
    const verticesUnrotated = [
      // Rectangle 1: XZ plane, y = ±a
      new THREE.Vector3(0, a, b), // 0
      new THREE.Vector3(0, a, -b), // 1
      new THREE.Vector3(0, -a, b), // 2
      new THREE.Vector3(0, -a, -b), // 3
      // Rectangle 2: YZ plane, x = ±a
      new THREE.Vector3(a, b, 0), // 4
      new THREE.Vector3(a, -b, 0), // 5
      new THREE.Vector3(-a, b, 0), // 6
      new THREE.Vector3(-a, -b, 0), // 7
      // Rectangle 3: XY plane, z = ±a
      new THREE.Vector3(b, 0, a), // 8
      new THREE.Vector3(b, 0, -a), // 9
      new THREE.Vector3(-b, 0, a), // 10
      new THREE.Vector3(-b, 0, -a), // 11
    ];

    // Apply RT-based Z-rotation to align with dodecahedron face normals
    const vertices = verticesUnrotated.map(v => rotateZ(v));

    // Same topology as standard icosahedron
    const edges = [
      [0, 2],
      [0, 4],
      [0, 6],
      [0, 8],
      [0, 10],
      [1, 3],
      [1, 4],
      [1, 6],
      [1, 9],
      [1, 11],
      [2, 5],
      [2, 7],
      [2, 8],
      [2, 10],
      [3, 5],
      [3, 7],
      [3, 9],
      [3, 11],
      [4, 6],
      [4, 8],
      [4, 9],
      [5, 7],
      [5, 8],
      [5, 9],
      [6, 10],
      [6, 11],
      [7, 10],
      [7, 11],
      [8, 9],
      [10, 11],
    ];

    const faces = [
      [0, 4, 8],
      [0, 6, 4],
      [0, 10, 6],
      [0, 8, 2],
      [0, 2, 10],
      [4, 1, 9],
      [4, 9, 8],
      [6, 1, 4],
      [6, 11, 1],
      [6, 10, 11],
      [2, 8, 5],
      [8, 9, 5],
      [10, 2, 7],
      [2, 5, 7],
      [10, 7, 11],
      [3, 9, 1],
      [3, 5, 9],
      [3, 11, 7],
      [3, 7, 5],
      [3, 1, 11],
    ];

    // RT VALIDATION: Check edge quadrance uniformity
    // Dual icosahedron scaled by φ, so edge Q = 4a² × φ²
    const expectedQ = 4 * a * a;
    const validation = RT.validateEdges(vertices, edges, expectedQ);
    const maxError = validation.reduce((max, v) => Math.max(max, v.error), 0);
    console.log(
      `Dual Icosahedron: Expected Q=${expectedQ.toFixed(6)}, Max error=${maxError.toExponential(2)}`
    );

    return { vertices, edges, faces };
  },

  /**
   * RT-PURE GEODESIC SUBDIVISION (Phase 2.7a)
   * Subdivide triangular face into smaller triangles for geodesic domes
   * IMPORTANT: Subdivision happens in ALGEBRAIC SPACE before sphere projection
   *
   * @param {Array} vertices - Original polyhedron vertices
   * @param {Array} faces - Original triangular faces
   * @param {number} frequency - Subdivision frequency (1-6)
   * @returns {Object} - {vertices, edges, faces} for subdivided polyhedron
   */
  subdivideTriangles: (vertices, faces, frequency) => {
    if (frequency === 0) {
      // Frequency 0 = base polyhedron (no subdivision)
      const edges = [];
      faces.forEach(([a, b, c]) => {
        edges.push([a, b], [b, c], [c, a]);
      });
      return { vertices, edges, faces };
    }

    // Class I geodesic subdivision: divide each edge into 2^frequency segments
    // Each triangular face becomes 4^frequency smaller triangles
    const divisions = Math.pow(2, frequency); // 2^freq edge segments

    const newVertices = [...vertices]; // Start with original vertices
    const vertexMap = new Map(); // Cache division points to avoid duplicates

    // Helper: Get or create division point along edge
    // t = parameter from 0 to 1 along edge from vi to vj
    const getEdgePoint = (i, j, t) => {
      // Create canonical key (smaller index first, then t value)
      const [i0, j0, t0] = i < j ? [i, j, t] : [j, i, 1 - t];
      const key = `${i0},${j0},${t0.toFixed(6)}`;

      if (vertexMap.has(key)) {
        return vertexMap.get(key);
      }

      const v1 = newVertices[i];
      const v2 = newVertices[j];

      // RT-PURE: Linear interpolation in algebraic space
      // Preserves golden ratio relationships for icosahedron
      const point = new THREE.Vector3(
        v1.x + t * (v2.x - v1.x),
        v1.y + t * (v2.y - v1.y),
        v1.z + t * (v2.z - v1.z)
      );

      const idx = newVertices.length;
      newVertices.push(point);
      vertexMap.set(key, idx);
      return idx;
    };

    const newFaces = [];

    // Subdivide each triangular face using barycentric grid
    faces.forEach(([v0, v1, v2]) => {
      // Create uniform triangular grid on this face
      // Grid points use barycentric coordinates (u, v, w) where u+v+w=1
      // u,v,w are multiples of 1/divisions

      // Build grid of vertex indices
      const grid = [];
      for (let row = 0; row <= divisions; row++) {
        grid[row] = [];
        for (let col = 0; col <= divisions - row; col++) {
          // Barycentric coordinates
          const u = row / divisions; // Weight for v0
          const v = col / divisions; // Weight for v1
          const w = 1 - u - v; // Weight for v2

          if (row === 0 && col === 0) {
            // Corner v0
            grid[row][col] = v0;
          } else if (row === 0 && col === divisions) {
            // Corner v1
            grid[row][col] = v1;
          } else if (row === divisions && col === 0) {
            // Corner v2
            grid[row][col] = v2;
          } else if (row === 0) {
            // Edge v0-v1
            grid[row][col] = getEdgePoint(v0, v1, v);
          } else if (col === 0) {
            // Edge v0-v2
            grid[row][col] = getEdgePoint(v0, v2, u);
          } else if (row + col === divisions) {
            // Edge v1-v2
            grid[row][col] = getEdgePoint(v1, v2, row / divisions);
          } else {
            // Interior point - create using barycentric interpolation
            const key = `${v0},${v1},${v2},${u.toFixed(6)},${v.toFixed(6)}`;

            if (vertexMap.has(key)) {
              grid[row][col] = vertexMap.get(key);
            } else {
              const p0 = newVertices[v0];
              const p1 = newVertices[v1];
              const p2 = newVertices[v2];

              const point = new THREE.Vector3(
                w * p0.x + v * p1.x + u * p2.x,
                w * p0.y + v * p1.y + u * p2.y,
                w * p0.z + v * p1.z + u * p2.z
              );

              const idx = newVertices.length;
              newVertices.push(point);
              vertexMap.set(key, idx);
              grid[row][col] = idx;
            }
          }
        }
      }

      // Create faces from grid
      for (let row = 0; row < divisions; row++) {
        for (let col = 0; col < divisions - row; col++) {
          // Upward-pointing triangle
          const a = grid[row][col];
          const b = grid[row][col + 1];
          const c = grid[row + 1][col];
          newFaces.push([a, b, c]);

          // Downward-pointing triangle (if not at edge)
          if (col < divisions - row - 1) {
            const d = grid[row][col + 1];
            const e = grid[row + 1][col + 1];
            const f = grid[row + 1][col];
            newFaces.push([d, e, f]);
          }
        }
      }
    });

    // Generate edges from faces
    const edgeSet = new Set();
    newFaces.forEach(([a, b, c]) => {
      const e1 = a < b ? `${a},${b}` : `${b},${a}`;
      const e2 = b < c ? `${b},${c}` : `${c},${b}`;
      const e3 = c < a ? `${c},${a}` : `${a},${c}`;
      edgeSet.add(e1);
      edgeSet.add(e2);
      edgeSet.add(e3);
    });

    const newEdges = Array.from(edgeSet).map(e => e.split(",").map(Number));

    console.log(
      `[RT] Geodesic subdivision: freq=${frequency}, divisions=${divisions}, faces=${newFaces.length} (expected: ${faces.length * divisions * divisions})`
    );

    return { vertices: newVertices, edges: newEdges, faces: newFaces };
  },

  /**
   * Geodesic Icosahedron (Phase 2.7a)
   * RT-pure implementation: Subdivision in algebraic space, then sphere projection
   *
   * @param {number} halfSize - Radius of geodesic sphere
   * @param {number} frequency - Subdivision frequency (1-6)
   * @returns {Object} - {vertices, edges, faces}
   */
  geodesicIcosahedron: (halfSize = 1, frequency = 2, projection = "out") => {
    // Phase 2.9: RT-Pure Geodesic with InSphere/MidSphere/OutSphere options

    // 1. Start with pure algebraic icosahedron
    const base = Polyhedra.icosahedron(halfSize);

    console.log(
      `[RT] Geodesic Icosahedron: frequency=${frequency}, projection=${projection}`
    );
    console.log(
      `  Base vertices: ${base.vertices.length}, faces: ${base.faces.length}`
    );

    // Frequency 0 = return base icosahedron (no subdivision, no sphere projection)
    if (frequency === 0) {
      console.log(`  Frequency 0: Returning base icosahedron (20 faces)`);
      return base;
    }

    // 2. Subdivide in algebraic space (preserves golden ratio relationships)
    const subdivided = Polyhedra.subdivideTriangles(
      base.vertices,
      base.faces,
      frequency
    );

    console.log(
      `  Subdivided vertices: ${subdivided.vertices.length}, faces: ${subdivided.faces.length}`
    );

    // Phase 2.9: RT-PURE Projection options (Off, InSphere, MidSphere, OutSphere)
    // NO TRIG! Pure quadrance relationships using golden ratio φ
    let Q_target;

    if (projection === "off") {
      // No sphere projection - return flat subdivided mesh
      console.log(`  Projection: OFF (flat subdivided mesh)`);
      return {
        vertices: subdivided.vertices,
        edges: subdivided.edges,
        faces: subdivided.faces,
      };
    } else if (projection === "in") {
      // RT-PURE InSphere: Perpendicular distance to face planes
      // Face normal is (1,1,1)/√3, distance = (a+b)/√3 where a+b = φ²/√(φ+2)
      // Q_in = [(a+b)/√3]² = φ⁴/[3(φ+2)] = (3φ+2)/[3(φ+2)] using φ⁴=3φ+2
      const phi = 0.5 * (1 + Math.sqrt(5)); // Golden ratio
      const ratio_in_sq = (3 * phi + 2) / (3 * (phi + 2));
      Q_target = halfSize * halfSize * ratio_in_sq;
      console.log(
        `  Projection: InSphere (perpendicular to face planes, RT-pure)`
      );
      console.log(
        `  RT: Q_in/Q_out = (3φ+2)/[3(φ+2)] = ${ratio_in_sq.toFixed(6)}`
      );
    } else if (projection === "mid") {
      // RT-PURE MidSphere: Distance to edge midpoints
      // For icosahedron: Q_mid = Q_out · φ²/(φ+2) = Q_out · (φ+1)/(φ+2)
      const phi = 0.5 * (1 + Math.sqrt(5)); // Golden ratio
      const ratio_mid_sq = (phi + 1) / (phi + 2); // Using φ² = φ + 1
      Q_target = halfSize * halfSize * ratio_mid_sq;
      console.log(
        `  Projection: MidSphere (distance to edge midpoints, RT-pure)`
      );
      console.log(
        `  RT: Q_mid/Q_out = φ²/(φ+2) = (φ+1)/(φ+2) = ${ratio_mid_sq.toFixed(6)}`
      );
    } else if (projection === "out") {
      // OutSphere: Through vertices (Fuller's true geodesic)
      Q_target = halfSize * halfSize;
      console.log(
        `  Projection: OutSphere (through vertices - Fuller geodesic)`
      );
    }

    const r_target = Math.sqrt(Q_target);
    console.log(
      `  Target quadrance: Q = ${Q_target.toFixed(6)}, r = ${r_target.toFixed(6)}`
    );

    // 3. Project to sphere - ONLY NOW do we normalize
    const projected = subdivided.vertices.map(v => {
      const normalized = v.clone().normalize();
      return normalized.multiplyScalar(r_target);
    });

    // 4. Validate edge quadrance uniformity
    const sampleQ = RT.quadrance(
      projected[subdivided.edges[0][0]],
      projected[subdivided.edges[0][1]]
    );
    const validation = RT.validateEdges(projected, subdivided.edges, sampleQ);
    // Use reduce instead of spread operator to avoid stack overflow with large arrays
    const maxError = validation.reduce((max, v) => Math.max(max, v.error), 0);
    const avgQ =
      validation.reduce((sum, v) => sum + v.Q, 0) / validation.length;

    console.log(
      `  Edge quadrance: avg=${avgQ.toFixed(6)}, max error=${maxError.toExponential(2)}`
    );
    console.log(`  RT PURITY: Normalization deferred until final step ✓`);

    return {
      vertices: projected,
      edges: subdivided.edges,
      faces: subdivided.faces,
    };
  },

  /**
   * Geodesic Tetrahedron (Phase 2.7c)
   * RT-pure implementation: Subdivision in algebraic space, then sphere projection
   * Simplest geodesic case - excellent for learning subdivision algorithms
   *
   * @param {number} halfSize - Radius of geodesic sphere
   * @param {number} frequency - Subdivision frequency (1-6)
   * @returns {Object} - {vertices, edges, faces}
   */
  geodesicTetrahedron: (halfSize = 1, frequency = 2, projection = "out") => {
    // Phase 2.9: RT-Pure Geodesic with InSphere/MidSphere/OutSphere options
    // 1. Start with pure algebraic tetrahedron
    const base = Polyhedra.tetrahedron(halfSize);

    console.log(
      `[RT] Geodesic Tetrahedron: frequency=${frequency}, projection=${projection}`
    );
    console.log(
      `  Base vertices: ${base.vertices.length}, faces: ${base.faces.length}`
    );

    // Frequency 0 = return base tetrahedron (no subdivision, no sphere projection)
    if (frequency === 0) {
      console.log(`  Frequency 0: Returning base tetrahedron (4 faces)`);
      return base;
    }

    // 2. Subdivide in algebraic space
    const subdivided = Polyhedra.subdivideTriangles(
      base.vertices,
      base.faces,
      frequency
    );

    console.log(
      `  Subdivided vertices: ${subdivided.vertices.length}, faces: ${subdivided.faces.length}`
    );

    // 3. Projection options (Phase 2.9)
    let finalVertices;
    let Q_target;

    if (projection === "off") {
      // No projection - return flat subdivided mesh
      console.log(`  Projection: OFF (flat subdivided faces)`);
      return {
        vertices: subdivided.vertices,
        edges: subdivided.edges,
        faces: subdivided.faces,
      };
    } else if (projection === "in") {
      // InSphere: tangent to face centers, Q = s²/3
      Q_target = (halfSize * halfSize) / 3;
      console.log(`  Projection: InSphere (Q = s²/3 = ${Q_target.toFixed(6)})`);
    } else if (projection === "mid") {
      // MidSphere: tangent to edge centers, Q = s²
      Q_target = halfSize * halfSize;
      console.log(`  Projection: MidSphere (Q = s² = ${Q_target.toFixed(6)})`);
    } else if (projection === "out") {
      // OutSphere: through vertices, Q = 3s² (Fuller's geodesic)
      Q_target = 3 * halfSize * halfSize;
      console.log(
        `  Projection: OutSphere (Q = 3s² = ${Q_target.toFixed(6)}) - Fuller geodesic`
      );
    }

    // Project to target sphere
    const r_target = Math.sqrt(Q_target);
    finalVertices = subdivided.vertices.map(v => {
      const normalized = v.clone().normalize();
      return normalized.multiplyScalar(r_target);
    });

    // 4. Validate edge quadrance uniformity
    const sampleQ = RT.quadrance(
      finalVertices[subdivided.edges[0][0]],
      finalVertices[subdivided.edges[0][1]]
    );
    const validation = RT.validateEdges(
      finalVertices,
      subdivided.edges,
      sampleQ
    );
    const maxError = validation.reduce((max, v) => Math.max(max, v.error), 0);
    const avgQ =
      validation.reduce((sum, v) => sum + v.Q, 0) / validation.length;

    console.log(`  Target radius: r = √Q = ${r_target.toFixed(6)}`);
    console.log(
      `  Edge quadrance: avg=${avgQ.toFixed(6)}, max error=${maxError.toExponential(2)}`
    );
    console.log(
      `  RT PURITY: Quadrance calculated algebraically, √ only at final projection ✓`
    );

    return {
      vertices: finalVertices,
      edges: subdivided.edges,
      faces: subdivided.faces,
    };
  },

  /**
   * Geodesic Octahedron (Phase 2.7b)
   * RT-pure implementation: Subdivision in algebraic space, then sphere projection
   * 8 triangular faces - simpler than icosahedron, more complex than tetrahedron
   *
   * @param {number} halfSize - Radius of geodesic sphere
   * @param {number} frequency - Subdivision frequency (1-6)
   * @returns {Object} - {vertices, edges, faces}
   */
  geodesicOctahedron: (halfSize = 1, frequency = 2, projection = "out") => {
    // Phase 2.9: RT-Pure Geodesic with InSphere/MidSphere/OutSphere options
    // 1. Start with pure algebraic octahedron
    const base = Polyhedra.octahedron(halfSize);

    console.log(
      `[RT] Geodesic Octahedron: frequency=${frequency}, projection=${projection}`
    );
    console.log(
      `  Base vertices: ${base.vertices.length}, faces: ${base.faces.length}`
    );

    // Frequency 0 = return base octahedron (no subdivision, no sphere projection)
    if (frequency === 0) {
      console.log(`  Frequency 0: Returning base octahedron (8 faces)`);
      return base;
    }

    // 2. Subdivide in algebraic space
    const subdivided = Polyhedra.subdivideTriangles(
      base.vertices,
      base.faces,
      frequency
    );

    console.log(
      `  Subdivided vertices: ${subdivided.vertices.length}, faces: ${subdivided.faces.length}`
    );

    // 3. Projection options (Phase 2.9)
    let finalVertices;
    let Q_target;

    if (projection === "off") {
      console.log(`  Projection: OFF (flat subdivided faces)`);
      return {
        vertices: subdivided.vertices,
        edges: subdivided.edges,
        faces: subdivided.faces,
      };
    } else if (projection === "in") {
      // InSphere: tangent to face centers, Q = s²/3
      Q_target = (halfSize * halfSize) / 3;
      console.log(`  Projection: InSphere (Q = s²/3 = ${Q_target.toFixed(6)})`);
    } else if (projection === "mid") {
      // MidSphere: tangent to edge centers, Q = s²/2
      Q_target = (halfSize * halfSize) / 2;
      console.log(
        `  Projection: MidSphere (Q = s²/2 = ${Q_target.toFixed(6)})`
      );
    } else if (projection === "out") {
      // OutSphere: through vertices, Q = s² (Fuller's geodesic)
      Q_target = halfSize * halfSize;
      console.log(
        `  Projection: OutSphere (Q = s² = ${Q_target.toFixed(6)}) - Fuller geodesic`
      );
    }

    // Project to target sphere
    const r_target = Math.sqrt(Q_target);
    finalVertices = subdivided.vertices.map(v => {
      const normalized = v.clone().normalize();
      return normalized.multiplyScalar(r_target);
    });

    // 4. Validate edge quadrance uniformity
    const sampleQ = RT.quadrance(
      finalVertices[subdivided.edges[0][0]],
      finalVertices[subdivided.edges[0][1]]
    );
    const validation = RT.validateEdges(
      finalVertices,
      subdivided.edges,
      sampleQ
    );
    const maxError = validation.reduce((max, v) => Math.max(max, v.error), 0);
    const avgQ =
      validation.reduce((sum, v) => sum + v.Q, 0) / validation.length;

    console.log(`  Target radius: r = √Q = ${r_target.toFixed(6)}`);
    console.log(
      `  Edge quadrance: avg=${avgQ.toFixed(6)}, max error=${maxError.toExponential(2)}`
    );
    console.log(
      `  RT PURITY: Quadrance calculated algebraically, √ only at final projection ✓`
    );

    return {
      vertices: finalVertices,
      edges: subdivided.edges,
      faces: subdivided.faces,
    };
  },

  /**
   * Dodecahedron (12 pentagonal faces, 20 vertices, 30 edges)
   * RT construction: "hip roof pup tent" on each cube face
   * Following Section19.js hip roof solver pattern - quadrance-based
   *
   * Each pentagon has TWO vertices SHARED with cube corners (the "shoulders")
   * The line between shoulders LIES ON the cube edge
   * Three additional vertices complete the pentagon (forming the "hip roof")
   *
   * Standard construction uses (0, ±1, ±φ) permutations where φ = golden ratio
   * RT approach: derive from quadrance relationships
   *
   * Schläfli: {5,3}
   */
  dodecahedron: (halfSize = 1) => {
    const s = halfSize;

    // RATIONAL TRIGONOMETRY: Defer sqrt(5) expansion following Wildberger principles
    // For dodecahedron: φ² = φ + 1 → φ² - φ - 1 = 0
    // Quadrance relationship: φ² - φ - 1 = 0 means Q_phi/Q_1 = (φ²)/1
    //
    // Use RT.Phi library for symbolic golden ratio operations
    // φ = (1 + √5)/2, and 1/φ = φ - 1 (algebraic identity!)

    const phi = RT.Phi.value(); // φ = (1 + √5)/2
    const invPhi = RT.Phi.inverse(); // 1/φ = φ - 1 (NO division!)

    console.log(`[ThreeRT] Dodecahedron RT construction:`);
    console.log(`  Cube half-size: ${s.toFixed(3)}`);
    console.log(`  φ = (1 + √5)/2 = ${phi.toFixed(6)} (from φ² - φ - 1 = 0)`);
    console.log(
      `  1/φ = φ - 1 = ${invPhi.toFixed(6)} (algebraic identity - no division!)`
    );

    // 20 vertices: 8 at (±1, ±1, ±1) + 12 at permutations of (0, ±1/φ, ±φ)
    // Scaled by s to fit cube of size ±s
    const vertices = [
      // 8 cube corner vertices (±s, ±s, ±s)
      new THREE.Vector3(s, s, s), // 0: (+,+,+)
      new THREE.Vector3(s, s, -s), // 1: (+,+,-)
      new THREE.Vector3(s, -s, s), // 2: (+,-,+)
      new THREE.Vector3(s, -s, -s), // 3: (+,-,-)
      new THREE.Vector3(-s, s, s), // 4: (-,+,+)
      new THREE.Vector3(-s, s, -s), // 5: (-,+,-)
      new THREE.Vector3(-s, -s, s), // 6: (-,-,+)
      new THREE.Vector3(-s, -s, -s), // 7: (-,-,-)

      // 12 additional vertices at (0, ±invPhi, ±phi) * s and cyclic permutations
      // These form the "ridge" vertices of the hip roof pentagons

      // Permutation 1: (0, ±1/φ, ±φ) * s
      new THREE.Vector3(0, s * invPhi, s * phi), // 8
      new THREE.Vector3(0, s * invPhi, -s * phi), // 9
      new THREE.Vector3(0, -s * invPhi, s * phi), // 10
      new THREE.Vector3(0, -s * invPhi, -s * phi), // 11

      // Permutation 2: (±1/φ, ±φ, 0) * s
      new THREE.Vector3(s * invPhi, s * phi, 0), // 12
      new THREE.Vector3(s * invPhi, -s * phi, 0), // 13
      new THREE.Vector3(-s * invPhi, s * phi, 0), // 14
      new THREE.Vector3(-s * invPhi, -s * phi, 0), // 15

      // Permutation 3: (±φ, 0, ±1/φ) * s
      new THREE.Vector3(s * phi, 0, s * invPhi), // 16
      new THREE.Vector3(s * phi, 0, -s * invPhi), // 17
      new THREE.Vector3(-s * phi, 0, s * invPhi), // 18
      new THREE.Vector3(-s * phi, 0, -s * invPhi), // 19
    ];

    // 30 edges - standard dodecahedron topology
    // Each cube corner connects to 3 phi-vertices
    // Cube corners: 0-7, Phi vertices: 8-19
    const edges = [
      // Edges from cube corner 0 (+,+,+)
      [0, 8],
      [0, 12],
      [0, 16],
      // Edges from cube corner 1 (+,+,-)
      [1, 9],
      [1, 12],
      [1, 17],
      // Edges from cube corner 2 (+,-,+)
      [2, 10],
      [2, 13],
      [2, 16],
      // Edges from cube corner 3 (+,-,-)
      [3, 11],
      [3, 13],
      [3, 17],
      // Edges from cube corner 4 (-,+,+)
      [4, 8],
      [4, 14],
      [4, 18],
      // Edges from cube corner 5 (-,+,-)
      [5, 9],
      [5, 14],
      [5, 19],
      // Edges from cube corner 6 (-,-,+)
      [6, 10],
      [6, 15],
      [6, 18],
      // Edges from cube corner 7 (-,-,-)
      [7, 11],
      [7, 15],
      [7, 19],

      // Edges between phi-vertices (6 edges, completing the 30 total)
      // These connect phi-vertices within the same permutation group
      [8, 10], // (0, +invPhi, +phi) to (0, -invPhi, +phi) - YZ group
      [9, 11], // (0, +invPhi, -phi) to (0, -invPhi, -phi) - YZ group
      [12, 14], // (+invPhi, +phi, 0) to (-invPhi, +phi, 0) - XY group
      [13, 15], // (+invPhi, -phi, 0) to (-invPhi, -phi, 0) - XY group
      [16, 17], // (+phi, 0, +invPhi) to (+phi, 0, -invPhi) - XZ group
      [18, 19], // (-phi, 0, +invPhi) to (-phi, 0, -invPhi) - XZ group
    ];

    // 12 pentagonal faces - standard dodecahedron topology
    // Vertices: 0-7 (cube), 8-11 (YZ permutation), 12-15 (XY permutation), 16-19 (XZ permutation)
    // Each face verified to follow edge connectivity
    const faces = [
      // Three faces meeting at vertex 0 (+,+,+)
      [0, 8, 4, 14, 12], // 0→8→4→14→12→0
      [0, 12, 1, 17, 16], // 0→12→1→17→16→0
      [0, 16, 2, 10, 8], // 0→16→2→10→8→0

      // Three faces meeting at vertex 7 (-,-,-)
      [7, 11, 3, 13, 15], // 7→11→3→13→15→7
      [7, 15, 6, 18, 19], // 7→15→6→18→19→7
      [7, 19, 5, 9, 11], // 7→19→5→9→11→7

      // Six remaining faces (belt)
      [1, 12, 14, 5, 9], // 1→12→14→5→9→1
      [1, 9, 11, 3, 17], // 1→9→11→3→17→1 (note: edge 9→11 exists)
      [2, 16, 17, 3, 13], // 2→16→17→3→13→2 (note: edge 16→17 exists)
      [2, 13, 15, 6, 10], // 2→13→15→6→10→2 (note: edge 13→15 exists)
      [4, 8, 10, 6, 18], // 4→8→10→6→18→4 (note: edge 8→10 exists)
      [4, 18, 19, 5, 14], // 4→18→19→5→14→4 (note: edge 18→19 exists)
    ];

    // RT VALIDATION: Check edge quadrance uniformity
    // Sample first edge to get actual quadrance, then validate all edges match
    const sampleQ = RT.quadrance(vertices[edges[0][0]], vertices[edges[0][1]]);
    const validation = RT.validateEdges(vertices, edges, sampleQ);
    const maxError = validation.reduce((max, v) => Math.max(max, v.error), 0);
    console.log(
      `Dodecahedron: Edge Q=${sampleQ.toFixed(6)}, Max error=${maxError.toExponential(2)}`
    );

    return { vertices, edges, faces };
  },

  /**
   * Rhombic Dodecahedron - Dual of Cuboctahedron (Vector Equilibrium)
   * 14 vertices (at cuboctahedron face centers)
   * 24 edges (connecting adjacent face centers)
   * 12 rhombic faces (corresponding to cuboctahedron vertices)
   *
   * RATIONAL TRIGONOMETRY: Defer √2 and √3 expansion following Wildberger principles
   * Vertices derived from cuboctahedron face centers (6 squares + 8 triangles)
   *
   * DUAL RELATIONSHIP:
   * - Cuboctahedron 14 faces → Rhombic dodec 14 vertices
   * - Cuboctahedron 12 vertices → Rhombic dodec 12 faces
   * - This ensures coplanar rhombic faces (no saddle distortion)
   */
  rhombicDodecahedron: (halfSize = 1) => {
    const s = halfSize;

    // RT-PURE: Defer expansions until needed
    const sqrt2 = Math.sqrt(2);
    const t = s / sqrt2; // Cuboctahedron vertex distance: s/√2
    const u = t / 2; // Rhombic dodec octant vertex distance: (s/√2)/2 = s/(2√2)

    console.log(
      `[ThreeRT] Rhombic Dodecahedron RT construction (dual of cuboctahedron):`
    );
    console.log(`  HalfSize: s = ${s.toFixed(6)}`);
    console.log(`  √2 = ${sqrt2.toFixed(6)} (deferred expansion)`);
    console.log(`  Cuboctahedron vertex distance: t = s/√2 = ${t.toFixed(6)}`);
    console.log(
      `  Rhombic dodec octant vertices: u = t/2 = s/(2√2) = ${u.toFixed(6)}`
    );

    // 14 vertices positioned to create planar rhombic faces
    const vertices = [
      // 6 vertices at SQUARE face centers (on coordinate axes) - degree 4
      // These are at distance t from origin, matching cuboctahedron square face centers
      new THREE.Vector3(t, 0, 0), // 0: +X square (degree 4)
      new THREE.Vector3(-t, 0, 0), // 1: -X square (degree 4)
      new THREE.Vector3(0, t, 0), // 2: +Y square (degree 4)
      new THREE.Vector3(0, -t, 0), // 3: -Y square (degree 4)
      new THREE.Vector3(0, 0, t), // 4: +Z square (degree 4)
      new THREE.Vector3(0, 0, -t), // 5: -Z square (degree 4)

      // 8 vertices at body diagonals (one per octant) - degree 3
      // CRITICAL: NOT at triangle centroids (2t/3), but at t/2 to ensure planar rhombic faces
      // This is the proper geometric dual relationship
      new THREE.Vector3(u, u, u), // 6: (+,+,+) octant (degree 3)
      new THREE.Vector3(u, u, -u), // 7: (+,+,-) octant (degree 3)
      new THREE.Vector3(u, -u, u), // 8: (+,-,+) octant (degree 3)
      new THREE.Vector3(u, -u, -u), // 9: (+,-,-) octant (degree 3)
      new THREE.Vector3(-u, u, u), // 10: (-,+,+) octant (degree 3)
      new THREE.Vector3(-u, u, -u), // 11: (-,+,-) octant (degree 3)
      new THREE.Vector3(-u, -u, u), // 12: (-,-,+) octant (degree 3)
      new THREE.Vector3(-u, -u, -u), // 13: (-,-,-) octant (degree 3)
    ];

    // 24 edges connecting adjacent face centers
    // Each square face center connects to 4 triangular face centers in same quadrant
    const edges = [
      // From +X square (0) to 4 adjacent triangles
      [0, 6],
      [0, 7],
      [0, 8],
      [0, 9],
      // From -X square (1) to 4 adjacent triangles
      [1, 10],
      [1, 11],
      [1, 12],
      [1, 13],
      // From +Y square (2) to 4 adjacent triangles
      [2, 6],
      [2, 7],
      [2, 10],
      [2, 11],
      // From -Y square (3) to 4 adjacent triangles
      [3, 8],
      [3, 9],
      [3, 12],
      [3, 13],
      // From +Z square (4) to 4 adjacent triangles
      [4, 6],
      [4, 8],
      [4, 10],
      [4, 12],
      // From -Z square (5) to 4 adjacent triangles
      [5, 7],
      [5, 9],
      [5, 11],
      [5, 13],
    ];

    // 12 rhombic faces (one per cuboctahedron vertex)
    // Each rhombus connects 2 square centers to 2 triangular centers
    // Proper cyclic winding order ensures coplanarity
    const faces = [
      // Rhombi corresponding to cuboctahedron XY plane vertices (indices 0-3)
      [0, 6, 2, 7], // Rhombus at cuboctahedron vertex 0 ( t, t, 0)
      [0, 8, 3, 9], // Rhombus at cuboctahedron vertex 1 ( t,-t, 0)
      [1, 10, 2, 11], // Rhombus at cuboctahedron vertex 2 (-t, t, 0)
      [1, 12, 3, 13], // Rhombus at cuboctahedron vertex 3 (-t,-t, 0)

      // Rhombi corresponding to cuboctahedron XZ plane vertices (indices 4-7)
      [0, 6, 4, 8], // Rhombus at cuboctahedron vertex 4 ( t, 0, t)
      [0, 7, 5, 9], // Rhombus at cuboctahedron vertex 5 ( t, 0,-t)
      [1, 10, 4, 12], // Rhombus at cuboctahedron vertex 6 (-t, 0, t)
      [1, 11, 5, 13], // Rhombus at cuboctahedron vertex 7 (-t, 0,-t)

      // Rhombi corresponding to cuboctahedron YZ plane vertices (indices 8-11)
      [2, 6, 4, 10], // Rhombus at cuboctahedron vertex 8 ( 0, t, t)
      [2, 7, 5, 11], // Rhombus at cuboctahedron vertex 9 ( 0, t,-t)
      [3, 8, 4, 12], // Rhombus at cuboctahedron vertex 10 ( 0,-t, t)
      [3, 9, 5, 13], // Rhombus at cuboctahedron vertex 11 ( 0,-t,-t)
    ];

    // RT VALIDATION: All edges have uniform quadrance
    // All 24 edges connect a square center to an adjacent triangle center
    // Example: (t,0,0) to (u,u,u) where u = 2t/3
    // Q = (t-u)² + (0-u)² + (0-u)² = (t-2t/3)² + 2(2t/3)² = (t/3)² + 2(4t²/9) = t²/9 + 8t²/9 = t²
    const expectedQ = t * t; // All edges have quadrance = t² = s²/2
    const validation = RT.validateEdges(vertices, edges, expectedQ);
    const maxError = validation.reduce((max, v) => Math.max(max, v.error), 0);
    console.log(
      `Rhombic Dodecahedron (dual): Expected edge Q=${expectedQ.toFixed(6)} (= s²/2), Max error=${maxError.toExponential(2)}`
    );

    return { vertices, edges, faces };
  },

  /**
   * Cuboctahedron (Vector Equilibrium in Fuller's terminology)
   * 12 vertices at edge midpoints of cube/octahedron
   * 14 faces: 8 triangular + 6 square
   * 24 edges (all equal length)
   *
   * RATIONAL TRIGONOMETRY: Defer √2 expansion following Wildberger principles
   * Vertices at (±1, ±1, 0), (±1, 0, ±1), (0, ±1, ±1) scaled by s/√2
   *
   * The cuboctahedron is self-dual with the rhombic dodecahedron:
   * - Cuboctahedron vertices → Rhombic dodec face centers
   * - Cuboctahedron faces → Rhombic dodec vertices
   */
  cuboctahedron: (halfSize = 1) => {
    const s = halfSize;

    // RT-PURE: Defer √2 expansion until needed
    const sqrt2 = Math.sqrt(2); // Deferred until needed
    const t = s / sqrt2; // Edge midpoint distance from origin: s/√2

    console.log(
      `[ThreeRT] Cuboctahedron (Vector Equilibrium) RT construction:`
    );
    console.log(`  HalfSize: s = ${s.toFixed(6)}`);
    console.log(`  √2 = ${sqrt2.toFixed(6)} (deferred expansion)`);
    console.log(
      `  Vertex distance from origin: s/√2 = ${t.toFixed(6)} (rationalized!)`
    );

    // 12 vertices at edge midpoints of cube (alternating coordinates)
    // Pattern: two coords ±t, one coord 0 (all permutations)
    const vertices = [
      // XY plane (Z = 0) - 4 vertices
      new THREE.Vector3(t, t, 0), // 0
      new THREE.Vector3(t, -t, 0), // 1
      new THREE.Vector3(-t, t, 0), // 2
      new THREE.Vector3(-t, -t, 0), // 3
      // XZ plane (Y = 0) - 4 vertices
      new THREE.Vector3(t, 0, t), // 4
      new THREE.Vector3(t, 0, -t), // 5
      new THREE.Vector3(-t, 0, t), // 6
      new THREE.Vector3(-t, 0, -t), // 7
      // YZ plane (X = 0) - 4 vertices
      new THREE.Vector3(0, t, t), // 8
      new THREE.Vector3(0, t, -t), // 9
      new THREE.Vector3(0, -t, t), // 10
      new THREE.Vector3(0, -t, -t), // 11
    ];

    // 24 edges (all equal length) - derived from face perimeters
    const edges = [
      // Edges from XY plane vertices
      [0, 4],
      [0, 5],
      [0, 8],
      [0, 9], // From vertex 0
      [1, 4],
      [1, 5],
      [1, 10],
      [1, 11], // From vertex 1
      [2, 6],
      [2, 7],
      [2, 8],
      [2, 9], // From vertex 2
      [3, 6],
      [3, 7],
      [3, 10],
      [3, 11], // From vertex 3
      // Edges between XZ and YZ plane vertices
      [4, 8],
      [4, 10], // From vertex 4
      [5, 9],
      [5, 11], // From vertex 5
      [6, 8],
      [6, 10], // From vertex 6
      [7, 9],
      [7, 11], // From vertex 7
    ];

    // 14 faces: 8 triangular + 6 square
    const faces = [
      // 6 square faces (corresponding to cube faces)
      [0, 4, 1, 5], // +X face (x > 0)
      [2, 6, 3, 7], // -X face (x < 0)
      [0, 8, 2, 9], // +Y face (y > 0)
      [1, 10, 3, 11], // -Y face (y < 0)
      [4, 8, 6, 10], // +Z face (z > 0)
      [5, 9, 7, 11], // -Z face (z < 0)

      // 8 triangular faces (corresponding to octahedron faces, one per octant)
      [0, 4, 8], // (+,+,+) octant
      [0, 5, 9], // (+,+,-) octant
      [1, 4, 10], // (+,-,+) octant
      [1, 5, 11], // (+,-,-) octant
      [2, 6, 8], // (-,+,+) octant
      [2, 7, 9], // (-,+,-) octant
      [3, 6, 10], // (-,-,+) octant
      [3, 7, 11], // (-,-,-) octant
    ];

    // RT VALIDATION: All edges should have same quadrance
    const expectedQ = 2 * t * t; // Two perpendicular components of length t
    const validation = RT.validateEdges(vertices, edges, expectedQ);
    const maxError = validation.reduce((max, v) => Math.max(max, v.error), 0);
    console.log(
      `Cuboctahedron: Expected edge Q=${expectedQ.toFixed(6)}, Max error=${maxError.toExponential(2)}`
    );

    return { vertices, edges, faces };
  },
};
