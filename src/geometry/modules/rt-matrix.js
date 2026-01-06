/**
 * rt-matrix.js
 * IVM Spatial Array Matrix Generator
 *
 * Generates N×N arrays of polyhedra in the X-Y plane to demonstrate
 * Fuller's Isotropic Vector Matrix (IVM) space-filling geometry.
 *
 * RT-Pure Implementation:
 * - Uses quadrance (Q = distance²) for spacing calculations
 * - Defers √ expansion until final Vector3 creation
 * - Leverages RT.applyRotation45() for grid alignment
 *
 * References:
 * - Fuller's Synergetics: Section 400-480 (IVM)
 * - docs/development/Geometry documents/matrix-slider.md
 */

import { RT } from './rt-math.js';
import { Polyhedra } from './rt-polyhedra.js';

/**
 * Matrix generation module for IVM spatial arrays
 * @namespace RTMatrix
 */
export const RTMatrix = {
  /**
   * Create N×N matrix of cubes in X-Y plane
   * Simple orthogonal grid with edge-to-edge contact
   *
   * @param {number} matrixSize - Grid size (1 to 10, creates N×N array)
   * @param {number} halfSize - Half the cube edge length
   * @param {boolean} rotate45 - Apply 45° Z-rotation for grid alignment
   * @param {Object} THREE - THREE.js library
   * @returns {THREE.Group} Group containing all cube instances
   *
   * @example
   * const cubeMatrix = RTMatrix.createCubeMatrix(5, 0.707, false, THREE);
   * scene.add(cubeMatrix);
   * // Creates 5×5 grid of 25 cubes
   */
  createCubeMatrix: (matrixSize, halfSize, rotate45, opacity, color, THREE) => {
    const matrixGroup = new THREE.Group();
    const cubeEdge = halfSize * 2; // Full edge length
    const spacing = cubeEdge; // Edge-to-edge contact

    // Get base cube geometry
    const cubeGeom = Polyhedra.cube(halfSize);
    const { vertices, edges, faces } = cubeGeom;

    // Generate N×N grid centered at origin
    for (let i = 0; i < matrixSize; i++) {
      for (let j = 0; j < matrixSize; j++) {
        // Calculate position: centered at origin
        // offset = (index - N/2 + 0.5) * spacing
        const offset_x = (i - matrixSize / 2 + 0.5) * spacing;
        const offset_y = (j - matrixSize / 2 + 0.5) * spacing;
        const offset_z = 0; // Z-centered at origin

        // Create cube instance at this grid position
        const cubeGroup = new THREE.Group();

        // Build indexed face geometry
        const positions = [];
        const indices = [];

        // Add all vertices to positions array (with offset)
        vertices.forEach(v => {
          positions.push(v.x + offset_x, v.y + offset_y, v.z + offset_z);
        });

        // Build face indices (triangulate quads if needed)
        faces.forEach(faceIndices => {
          // Fan triangulation from first vertex
          for (let k = 1; k < faceIndices.length - 1; k++) {
            indices.push(faceIndices[0], faceIndices[k], faceIndices[k + 1]);
          }
        });

        const faceGeometry = new THREE.BufferGeometry();
        faceGeometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(positions, 3)
        );
        faceGeometry.setIndex(indices);
        faceGeometry.computeVertexNormals();

        const faceMaterial = new THREE.MeshStandardMaterial({
          color: color,
          transparent: true,
          opacity: opacity,
          side: THREE.DoubleSide,
          depthWrite: opacity >= 0.99,
          flatShading: true,
        });

        const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
        faceMesh.renderOrder = 1;
        cubeGroup.add(faceMesh);

        // Render edges
        const edgePositions = [];
        edges.forEach(([vi, vj]) => {
          const v1 = vertices[vi];
          const v2 = vertices[vj];
          edgePositions.push(v1.x + offset_x, v1.y + offset_y, v1.z + offset_z);
          edgePositions.push(v2.x + offset_x, v2.y + offset_y, v2.z + offset_z);
        });

        const edgeGeometry = new THREE.BufferGeometry();
        edgeGeometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(edgePositions, 3)
        );

        const edgeMaterial = new THREE.LineBasicMaterial({
          color: color,
          linewidth: 1,
          depthTest: true,
          depthWrite: true,
        });

        const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        edgeLines.renderOrder = 2;
        cubeGroup.add(edgeLines);

        matrixGroup.add(cubeGroup);
      }
    }

    // Apply 45° rotation if requested (RT-pure)
    if (rotate45) {
      RT.applyRotation45(matrixGroup);
    }

    console.log(
      `[RTMatrix] Cube matrix created: ${matrixSize}×${matrixSize} = ${matrixSize * matrixSize} cubes, rotate45=${rotate45}`
    );

    return matrixGroup;
  },

  /**
   * Create N×N matrix of tetrahedra in X-Y plane
   * Vertex-to-vertex array with octahedral voids (alternating orientations)
   *
   * @param {number} matrixSize - Grid size (1 to 10)
   * @param {number} halfSize - Half the tetrahedron edge length
   * @param {boolean} rotate45 - Apply 45° Z-rotation for grid alignment
   * @param {number} opacity - Opacity value (0.0 to 1.0)
   * @param {number} color - Hex color value
   * @param {Object} THREE - THREE.js library
   * @returns {THREE.Group} Group containing all tetrahedron instances
   *
   * Pattern: Alternating up/down orientations in checkerboard pattern
   * Creates vertex-to-vertex contact with octahedral voids (invisible)
   */
  createTetrahedronMatrix: (
    matrixSize,
    halfSize,
    rotate45,
    opacity,
    color,
    THREE
  ) => {
    const matrixGroup = new THREE.Group();

    // Tet edge length: e = 2 * halfSize * √2
    const tetEdge = 2 * halfSize * Math.sqrt(2);

    // Spacing: Distance between tet centers in grid
    // For vertex-to-vertex contact: spacing = tetEdge
    const spacing = tetEdge;

    // Get base tetrahedron geometry
    const tetGeom = Polyhedra.tetrahedron(halfSize);
    const { vertices, edges, faces } = tetGeom;

    // Generate N×N grid with alternating orientations
    for (let i = 0; i < matrixSize; i++) {
      for (let j = 0; j < matrixSize; j++) {
        // Calculate position: centered at origin
        const offset_x = (i - matrixSize / 2 + 0.5) * spacing;
        const offset_y = (j - matrixSize / 2 + 0.5) * spacing;
        const offset_z = 0; // Z-centered at origin

        // Determine orientation: checkerboard pattern (up vs down)
        // (i + j) % 2 === 0 → up, else → down (inverted)
        const isUp = (i + j) % 2 === 0;

        // Create tetrahedron instance at this grid position
        const tetGroup = new THREE.Group();

        // Build indexed face geometry
        const positions = [];
        const indices = [];

        // Add all vertices to positions array (with offset)
        vertices.forEach(v => {
          positions.push(v.x + offset_x, v.y + offset_y, v.z + offset_z);
        });

        // Build face indices (triangles)
        faces.forEach(faceIndices => {
          indices.push(faceIndices[0], faceIndices[1], faceIndices[2]);
        });

        const faceGeometry = new THREE.BufferGeometry();
        faceGeometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(positions, 3)
        );
        faceGeometry.setIndex(indices);
        faceGeometry.computeVertexNormals();

        const faceMaterial = new THREE.MeshStandardMaterial({
          color: color,
          transparent: true,
          opacity: opacity,
          side: THREE.DoubleSide,
          depthWrite: opacity >= 0.99,
          flatShading: true,
        });

        const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
        faceMesh.renderOrder = 1;
        tetGroup.add(faceMesh);

        // Render edges
        const edgePositions = [];
        edges.forEach(([vi, vj]) => {
          const v1 = vertices[vi];
          const v2 = vertices[vj];
          edgePositions.push(v1.x + offset_x, v1.y + offset_y, v1.z + offset_z);
          edgePositions.push(v2.x + offset_x, v2.y + offset_y, v2.z + offset_z);
        });

        const edgeGeometry = new THREE.BufferGeometry();
        edgeGeometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(edgePositions, 3)
        );

        const edgeMaterial = new THREE.LineBasicMaterial({
          color: color,
          linewidth: 1,
          depthTest: true,
          depthWrite: true,
        });

        const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        edgeLines.renderOrder = 2;
        tetGroup.add(edgeLines);

        // Apply orientation rotation (180° around Z for down-facing tets)
        if (!isUp) {
          tetGroup.rotation.z = Math.PI; // Flip 180°
        }

        matrixGroup.add(tetGroup);
      }
    }

    // Apply 45° rotation if requested (RT-pure)
    if (rotate45) {
      RT.applyRotation45(matrixGroup);
    }

    console.log(
      `[RTMatrix] Tetrahedron matrix created: ${matrixSize}×${matrixSize} = ${matrixSize * matrixSize} tetrahedra, rotate45=${rotate45}`
    );

    return matrixGroup;
  },

  /**
   * Create N×N matrix of octahedra in X-Y plane
   * Face-to-face square array
   *
   * @param {number} matrixSize - Grid size (1 to 10)
   * @param {number} halfSize - Half the octahedron edge length
   * @param {boolean} rotate45 - Apply 45° Z-rotation for grid alignment
   * @param {number} opacity - Opacity value (0.0 to 1.0)
   * @param {number} color - Hex color value
   * @param {Object} THREE - THREE.js library
   * @returns {THREE.Group} Group containing all octahedron instances
   *
   * Pattern: Square grid with octahedra showing square faces in plan view
   * Natural fit: Octahedra have square cross-section when viewed from above
   */
  createOctahedronMatrix: (
    matrixSize,
    halfSize,
    rotate45,
    opacity,
    color,
    THREE
  ) => {
    const matrixGroup = new THREE.Group();

    // Spacing: Distance between octahedra centers for face-to-face contact
    // For octahedra with square faces touching: spacing = 2 * halfSize
    // (The octahedron vertices lie at ±halfSize in each axis)
    // Note: Octahedron edge length = halfSize * √2
    const spacing = 2 * halfSize;

    // Get base octahedron geometry
    const octaGeom = Polyhedra.octahedron(halfSize);
    const { vertices, edges, faces } = octaGeom;

    // Generate N×N grid (all same orientation)
    for (let i = 0; i < matrixSize; i++) {
      for (let j = 0; j < matrixSize; j++) {
        // Calculate position: centered at origin
        const offset_x = (i - matrixSize / 2 + 0.5) * spacing;
        const offset_y = (j - matrixSize / 2 + 0.5) * spacing;
        const offset_z = 0; // Z-centered at origin

        // Create octahedron instance at this grid position
        const octaGroup = new THREE.Group();

        // Build indexed face geometry
        const positions = [];
        const indices = [];

        // Add all vertices to positions array (with offset)
        vertices.forEach(v => {
          positions.push(v.x + offset_x, v.y + offset_y, v.z + offset_z);
        });

        // Build face indices (triangles)
        faces.forEach(faceIndices => {
          indices.push(faceIndices[0], faceIndices[1], faceIndices[2]);
        });

        const faceGeometry = new THREE.BufferGeometry();
        faceGeometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(positions, 3)
        );
        faceGeometry.setIndex(indices);
        faceGeometry.computeVertexNormals();

        const faceMaterial = new THREE.MeshStandardMaterial({
          color: color,
          transparent: true,
          opacity: opacity,
          side: THREE.DoubleSide,
          depthWrite: opacity >= 0.99,
          flatShading: true,
        });

        const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
        faceMesh.renderOrder = 1;
        octaGroup.add(faceMesh);

        // Render edges
        const edgePositions = [];
        edges.forEach(([vi, vj]) => {
          const v1 = vertices[vi];
          const v2 = vertices[vj];
          edgePositions.push(v1.x + offset_x, v1.y + offset_y, v1.z + offset_z);
          edgePositions.push(v2.x + offset_x, v2.y + offset_y, v2.z + offset_z);
        });

        const edgeGeometry = new THREE.BufferGeometry();
        edgeGeometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(edgePositions, 3)
        );

        const edgeMaterial = new THREE.LineBasicMaterial({
          color: color,
          linewidth: 1,
          depthTest: true,
          depthWrite: true,
        });

        const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        edgeLines.renderOrder = 2;
        octaGroup.add(edgeLines);

        matrixGroup.add(octaGroup);
      }
    }

    // Apply 45° rotation if requested (RT-pure)
    if (rotate45) {
      RT.applyRotation45(matrixGroup);
    }

    console.log(
      `[RTMatrix] Octahedron matrix created: ${matrixSize}×${matrixSize} = ${matrixSize * matrixSize} octahedra, rotate45=${rotate45}`
    );

    return matrixGroup;
  },

  /**
   * Calculate grid position for matrix array (RT-pure)
   * Uses quadrance-based calculations where possible
   *
   * @param {number} i - Grid index X (0 to N-1)
   * @param {number} j - Grid index Y (0 to N-1)
   * @param {number} matrixSize - Total grid size N
   * @param {number} spacing - Distance between instances
   * @returns {Object} {x, y, z} position
   */
  calculateGridPosition: (i, j, matrixSize, spacing) => {
    return {
      x: (i - matrixSize / 2 + 0.5) * spacing,
      y: (j - matrixSize / 2 + 0.5) * spacing,
      z: 0, // Always centered at origin in Z
    };
  },
};
