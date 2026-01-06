/**
 * rt-math.js
 * Rational Trigonometry Library for ARTexplorer
 *
 * Pure mathematical functions based on Norman J. Wildberger's Rational Trigonometry.
 * Uses quadrance (Q = distance²) and spread (s) instead of distance and angle.
 *
 * Benefits:
 * - No square roots needed (exact calculations)
 * - No transcendental functions (sin, cos, atan)
 * - Algebraic identities remain exact
 * - Better for tetrahedral/cubic geometry
 *
 * References:
 * - Divine Proportions: Rational Trigonometry to Universal Geometry (N.J. Wildberger)
 * - https://www.youtube.com/watch?v=GJPJKPNb2Zg
 */

/**
 * Rational Trigonometry (RT) Library
 * @namespace RT
 */
export const RT = {
  /**
   * Quadrance (Q = distance²) - Wildberger's alternative to distance
   * Avoids sqrt, keeps calculations exact
   *
   * @param {Object} p1 - Point with x, y, z coordinates
   * @param {Object} p2 - Point with x, y, z coordinates
   * @returns {number} Quadrance (distance squared)
   *
   * @example
   * const Q = RT.quadrance({x: 0, y: 0, z: 0}, {x: 1, y: 1, z: 1});
   * // Q = 3 (not √3!)
   */
  quadrance: (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return dx * dx + dy * dy + dz * dz;
  },

  /**
   * Spread (s) - Wildberger's version of angle
   * Measures "perpendicularity" between two vectors (0 = parallel, 1 = perpendicular)
   *
   * Formula: s = 1 - (v1·v2)² / (|v1|²|v2|²)
   *
   * Key values:
   * - s = 0: vectors parallel (0°)
   * - s = 0.5: 45° angle (tetrahedral geometry)
   * - s = 1: vectors perpendicular (90°)
   *
   * @param {Object} v1 - Vector with x, y, z components
   * @param {Object} v2 - Vector with x, y, z components
   * @returns {number} Spread (0 to 1)
   *
   * @example
   * const s = RT.spread({x: 1, y: 0, z: 0}, {x: 0, y: 1, z: 0});
   * // s = 1 (perpendicular)
   */
  spread: (v1, v2) => {
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const q1 = v1.x * v1.x + v1.y * v1.y + v1.z * v1.z;
    const q2 = v2.x * v2.x + v2.y * v2.y + v2.z * v2.z;
    return 1 - (dot * dot) / (q1 * q2);
  },

  /**
   * Rational Circle Parameterization - Wildberger's alternative to sin/cos
   * Generates points on unit circle using only rational operations (no trig functions)
   *
   * Formula: Circle(t) = ((1 - t²) / (1 + t²), 2t / (1 + t²))
   *
   * Based on Weierstrass substitution where t = tan(θ/2) in traditional trigonometry.
   * Maps all real numbers to the full unit circle:
   * - t = 0 → (1, 0) - positive x-axis
   * - t = 1 → (0, 1) - top of circle
   * - t → ∞ → (-1, 0) - negative x-axis
   *
   * IMPORTANT: Parameter 't' is NOT spread!
   * - 't' is an INPUT representing angle/turns (ranges over all reals)
   * - 'spread' is an OUTPUT measuring perpendicularity (ranges 0-1)
   *
   * RT-Pure Benefits:
   * - No transcendental functions (sin, cos, tan, atan)
   * - Only rational operations (multiply, add, divide)
   * - Spread can be extracted directly from coordinates: spread = 1 - x² or spread = y²
   *
   * Use Cases:
   * 1. RT-pure rotation calculations (avoid sin/cos for angles)
   * 2. Convert between angle parameter and spread without inverse trig
   * 3. Snap-to-spread constraints (find 't' for target spread algebraically)
   *
   * @param {number} t - Angle parameter (any real number, NOT spread)
   * @returns {Object} {x, y} - Point on unit circle
   *
   * @example
   * // Get point at parameter t = 1
   * const point = RT.circleParam(1);
   * // point = {x: 0, y: 1} - top of circle
   *
   * // Extract spread from coordinates (no inverse trig!)
   * const spread = 1 - point.x * point.x;  // = 1 (perpendicular to x-axis)
   *
   * @see docs/development/Geometry documents/Kieran-Math.md - "Rational Circle Parameterization"
   */
  circleParam: t => {
    const tSquared = t * t;
    const denominator = 1 + tSquared;
    return {
      x: (1 - tSquared) / denominator,
      y: (2 * t) / denominator,
    };
  },

  /**
   * Convert spread to angle parameter 't' using rational circle parameterization
   * Solves: 4t² / (1 + t²)² = spread for t
   *
   * WARNING: This is a helper for understanding the relationship.
   * The actual solution requires solving a quartic equation, which may use sqrt.
   * For RT-pure calculations, work directly with 't' parameter instead of converting.
   *
   * Note: Given spread s = sin²(θ), there are two possible 't' values:
   * - Positive t: 0° ≤ θ ≤ 180° (upper semicircle)
   * - Negative t: 180° ≤ θ ≤ 360° (lower semicircle)
   *
   * This function returns the positive 't' value.
   *
   * @param {number} spread - Spread value (0 to 1)
   * @returns {number} Parameter 't' (positive solution)
   *
   * @example
   * // For spread = 1 (90° angle):
   * const t = RT.spreadToParam(1);  // t ≈ 1.0
   * const point = RT.circleParam(t); // {x: 0, y: 1}
   */
  spreadToParam: spread => {
    // From spread = 4t² / (1 + t²)²
    // Rearranging: spread(1 + 2t² + t⁴) = 4t²
    //             spread·t⁴ + (2·spread - 4)t² + spread = 0
    // Substituting u = t²:
    //             spread·u² + (2·spread - 4)u + spread = 0
    // Quadratic formula:
    const a = spread;
    const b = 2 * spread - 4;
    const c = spread;
    const discriminant = b * b - 4 * a * c;
    const u = (-b + Math.sqrt(discriminant)) / (2 * a); // Take positive solution
    return Math.sqrt(u); // t = √u (positive root)
  },

  /**
   * Verify Euler's formula: V - E + F = 2
   * Valid for any convex polyhedron
   *
   * @param {number} vertices - Number of vertices
   * @param {number} edges - Number of edges
   * @param {number} faces - Number of faces
   * @returns {boolean} True if Euler's formula is satisfied
   *
   * @example
   * RT.verifyEuler(8, 12, 6); // Cube: true
   * RT.verifyEuler(4, 6, 4);  // Tetrahedron: true
   */
  verifyEuler: (vertices, edges, faces) => {
    return vertices - edges + faces === 2;
  },

  /**
   * Golden Ratio (φ) - Symbolic operations to defer √5 expansion
   * φ = (1 + √5)/2 ≈ 1.618033988749895
   *
   * Key identities:
   * - φ² = φ + 1
   * - 1/φ = φ - 1
   *
   * Used in icosahedron and dodecahedron geometry
   */
  Phi: {
    /**
     * Compute √5 - only call when absolutely necessary
     * @returns {number} Square root of 5
     */
    sqrt5: () => Math.sqrt(5),

    /**
     * φ = (1 + √5)/2
     * Deferred: only expands √5 when called
     * @returns {number} Golden ratio value
     */
    value: function () {
      return 0.5 * (1 + this.sqrt5());
    },

    /**
     * φ² = φ + 1 (algebraic identity - no sqrt needed!)
     * Derived from φ² - φ - 1 = 0
     * @returns {number} Golden ratio squared
     */
    squared: function () {
      return this.value() + 1;
    },

    /**
     * 1/φ = φ - 1 (algebraic identity - no division needed!)
     * Also equals (√5 - 1)/2
     * @returns {number} Reciprocal of golden ratio
     */
    inverse: function () {
      return this.value() - 1;
    },
  },

  /**
   * Validate edges have uniform quadrance (regular polyhedron check)
   * Returns array of {edge, Q, error} for each edge
   *
   * @param {Array} vertices - Array of vertex objects with x, y, z
   * @param {Array} edges - Array of [i, j] vertex index pairs
   * @param {number} expectedQ - Expected quadrance for all edges
   * @param {number} tolerance - Error tolerance (default 1e-10)
   * @returns {Array} Validation results for each edge
   *
   * @example
   * const results = RT.validateEdges(vertices, edges, 2, 1e-10);
   * const allValid = results.every(r => r.valid);
   */
  validateEdges: (vertices, edges, expectedQ, tolerance = 1e-10) => {
    return edges.map(([i, j]) => {
      const Q = RT.quadrance(vertices[i], vertices[j]);
      const error = Math.abs(Q - expectedQ);
      return {
        edge: [i, j],
        Q,
        error,
        valid: error < tolerance,
      };
    });
  },

  /**
   * Convert spread to degrees
   * spread → θ (degrees)
   * @param {number} spread - Spread value (0.00 to 1.00)
   * @returns {number} - Angle in degrees (0° to 90°)
   */
  spreadToDegrees: spread => {
    const clampedSpread = Math.max(0, Math.min(1, spread));
    const radians = Math.asin(Math.sqrt(clampedSpread));
    return (radians * 180) / Math.PI;
  },

  /**
   * Convert degrees to spread using RT-pure calculation
   * θ → spread = sin²(θ)
   * @param {number} degrees - Angle in degrees
   * @returns {number} - Spread value (0.00 to 1.00)
   */
  degreesToSpread: degrees => {
    const radians = (degrees * Math.PI) / 180;
    const sinValue = Math.sin(radians);
    return sinValue * sinValue; // sin²(θ)
  },

  /**
   * Apply 45° rotation around Z-axis using RT-pure spread/cross values
   * Used for matrix grid alignment (aligns Tet/Octa edges to X-Y axes)
   *
   * RT-Pure Implementation:
   * - Works in spread/cross space, NOT angle space
   * - Spread s = sin²(45°) = 1/2 = 0.5 (exact rational!)
   * - Cross c = cos²(45°) = 1/2 = 0.5 (exact rational!)
   * - Verifies RT identity: s + c = 1.0
   *
   * @param {THREE.Group} group - THREE.js Group to rotate
   * @requires THREE - THREE.js library
   *
   * @example
   * const matrixGroup = new THREE.Group();
   * // ... add polyhedra to group ...
   * RT.applyRotation45(matrixGroup);
   * // Group is now rotated 45° around Z-axis for grid alignment
   */
  applyRotation45: group => {
    // Work in spread/cross space, not angle space
    const s = 0.5; // Spread = sin²(45°) = 1/2 (exact rational!)
    const c = 0.5; // Cross = cos²(45°) = 1/2 (exact rational!)

    // Extract sin/cos ONLY when constructing matrix (deferred √)
    const sin_val = Math.sqrt(s); // √(1/2) = √2/2
    const cos_val = Math.sqrt(c); // √(1/2) = √2/2

    // Build rotation matrix from spread/cross values
    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.set(
      cos_val,
      -sin_val,
      0,
      0,
      sin_val,
      cos_val,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    );

    group.applyMatrix4(rotationMatrix);
    console.log(`[RT] Matrix rotation applied: s=${s}, c=${c}, s+c=${s + c} ✓`);
  },
};

/**
 * Quadray Coordinate System
 * Originally implemented in C++ by Tom Ace / Kirby Urner
 *
 * A 4D coordinate system using tetrahedral basis vectors.
 * All coordinates sum to zero (zero-sum normalization).
 *
 * @namespace Quadray
 * @requires THREE - THREE.js Vector3
 */
export const Quadray = {
  /**
   * 4 basis vectors pointing to tetrahedral vertices inscribed in cube
   * These are the face normals of a regular tetrahedron
   *
   * Z-up convention: Z coordinate indicates height
   * A: ( 1,  1,  1)  // top-front-right
   * B: ( 1, -1, -1)  // bottom-back-right
   * C: (-1,  1, -1)  // bottom-front-left
   * D: (-1, -1,  1)  // top-back-left
   *
   * Note: This will be initialized when THREE.js is available
   * @type {Array<THREE.Vector3>}
   */
  basisVectors: null,

  /**
   * Initialize basis vectors (call after THREE.js is loaded)
   * @param {Object} THREE - THREE.js library
   */
  init: THREE => {
    Quadray.basisVectors = [
      new THREE.Vector3(1, 1, 1).normalize(), // A (top-front-right)
      new THREE.Vector3(1, -1, -1).normalize(), // B (bottom-back-right)
      new THREE.Vector3(-1, 1, -1).normalize(), // C (bottom-front-left)
      new THREE.Vector3(-1, -1, 1).normalize(), // D (top-back-left)
    ];
  },

  /**
   * Zero-sum normalization: A + B + C + D = 0
   * Subtracts mean from all coordinates
   *
   * @param {Array<number>} coords - Array of 4 quadray coordinates
   * @returns {Array<number>} Normalized coordinates
   *
   * @example
   * Quadray.zeroSumNormalize([1, 0, 0, 0]); // [0.75, -0.25, -0.25, -0.25]
   */
  zeroSumNormalize: coords => {
    const mean = (coords[0] + coords[1] + coords[2] + coords[3]) / 4;
    return coords.map(c => c - mean);
  },

  /**
   * Convert quadray (a, b, c, d) to Cartesian (x, y, z)
   * Using zero-sum normalized coordinates
   *
   * @param {number} a - First quadray coordinate
   * @param {number} b - Second quadray coordinate
   * @param {number} c - Third quadray coordinate
   * @param {number} d - Fourth quadray coordinate
   * @param {Object} THREE - THREE.js library
   * @returns {THREE.Vector3} Cartesian coordinates
   *
   * @example
   * const pos = Quadray.toCartesian(1, 0, 0, 0, THREE);
   */
  toCartesian: (a, b, c, d, THREE) => {
    if (!Quadray.basisVectors) {
      Quadray.init(THREE);
    }

    const normalized = Quadray.zeroSumNormalize([a, b, c, d]);
    const result = new THREE.Vector3(0, 0, 0);

    for (let i = 0; i < 4; i++) {
      result.add(Quadray.basisVectors[i].clone().multiplyScalar(normalized[i]));
    }

    return result;
  },
};
