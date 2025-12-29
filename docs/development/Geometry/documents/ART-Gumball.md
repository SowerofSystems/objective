# ART Gumball: Rational Trigonometry Transform System

**Version:** 1.0
**Status:** Specification
**Related:** [ARTexplorer.md](./ARTexplorer.md)

## Overview

The ART (Algebraic Rational Trigonometry) Gumball is a transform control system for manipulating polyhedra in 3D space using pure Rational Trigonometry principles. Unlike traditional CAD gumballs that use degrees and floating-point distances, ART Gumball operates **exclusively with quadrance and spread**, maintaining algebraic exactness throughout all transformations.

### Philosophical Foundation: "Nows" (Julian Barbour)

Following Julian Barbour's relational theory of time, each transform state is a "Now" - a snapshot in configuration space. Users don't "animate" objects through time; they **deposit instances** at specific configurations, building up a sequence of Nows that represent the object's trajectory through shape-space.

## Core Principles

### 1. RT-Pure Operations

**Traditional CAD Problems:**
- Angles in degrees → transcendental functions (sin, cos) → irrational numbers
- Floating-point accumulation errors in rotations
- Distance calculations using √ → decimal expansion issues
- Loss of precision in iterative transforms

**ART Gumball Solution:**
- **Spread** (s = Q_quad/R_quad) instead of angles → rational values
- **Quadrance** (Q = x² + y² + z²) instead of distance → exact algebraic values
- All calculations remain in rational/algebraic domain
- No transcendental functions required
- Perfect precision for trajectories, orbits, lattice placements

### 2. Coordinate System Awareness

The gumball operates in **dual mode**:

#### Cartesian Mode (XYZ)
- Move: Translate along X, Y, Z axes
- Rotate: Spread-based rotation in XY, XZ, YZ planes
- Units: Standard Cartesian coordinate increments

#### Quadray Mode (WXYZ)
- Move: Translate along tetrahedral basis vectors W, X, Y, Z
- Rotate: Spread-based rotation in tetrahedral planes (WX, WY, WZ, XY, XZ, YZ)
- Units: Quadray coordinate increments (tetrahedral lattice alignment)

## Transform Operations

### Scale (Universal)

**Parameters:**
- `scaleX`: Multiplicative scale factor for X dimension
- `scaleY`: Multiplicative scale factor for Y dimension
- `scaleZ`: Multiplicative scale factor for Z dimension
- `scaleUniform`: Single scale factor applied to all dimensions

**Implementation:**
```javascript
// Uniform scaling
polyhedron.scale.set(scaleUniform, scaleUniform, scaleUniform);

// Non-uniform scaling
polyhedron.scale.set(scaleX, scaleY, scaleZ);
```

**RT Considerations:**
- Scaling preserves quadrance ratios
- Spread values remain invariant under uniform scaling
- Non-uniform scaling changes spreads (must recalculate if needed)

### Move (Position)

#### Cartesian Mode
**Parameters:**
- `posX`: Position along X-axis (algebraic value)
- `posY`: Position along Y-axis (algebraic value)
- `posZ`: Position along Z-axis (algebraic value)

**Implementation:**
```javascript
polyhedron.position.set(posX, posY, posZ);
```

#### Quadray Mode
**Parameters:**
- `qW`: Coefficient for W basis vector
- `qX`: Coefficient for X basis vector
- `qY`: Coefficient for Y basis vector
- `qZ`: Coefficient for Z basis vector

**Implementation:**
```javascript
// Quadray coordinates (w, x, y, z)
// Convert to Cartesian for THREE.js positioning
const cartesianPos = quadrayToCartesian(qW, qX, qY, qZ);
polyhedron.position.copy(cartesianPos);
```

**Quadray to Cartesian Conversion:**
```javascript
function quadrayToCartesian(w, x, y, z) {
  // Using existing Quadray.basisVectors from ARTexplorer
  const position = new THREE.Vector3(0, 0, 0);

  position.add(Quadray.basisVectors[0].clone().multiplyScalar(w)); // W
  position.add(Quadray.basisVectors[1].clone().multiplyScalar(x)); // X
  position.add(Quadray.basisVectors[2].clone().multiplyScalar(y)); // Y
  position.add(Quadray.basisVectors[3].clone().multiplyScalar(z)); // Z

  return position;
}
```

**RT Advantages:**
- Quadray moves align perfectly with IVM lattice
- Natural for tetrahedral close-packing arrangements
- Exact lattice positions without floating-point drift

### Rotate (Spread-Based)

**Traditional Problem:**
- Rotation by θ degrees requires cos(θ) and sin(θ)
- Transcendental functions → irrationals
- Composition of rotations accumulates error

**RT Solution:**
- Define rotation by **spread** (s) in a specific plane
- Spread s = Q_quad/R_quad (ratio of quadrances, purely algebraic)
- Use **spread polynomials** for exact rotation matrices

#### Spread Definition

For two lines forming an angle:
- **Quadrance** of perpendicular from intersection to line: Q_quad
- **Quadrance** of radius (distance along line): R_quad
- **Spread**: s = Q_quad/R_quad

**Key Values:**
- s = 0: Lines parallel (0°)
- s = 0.5: 45° angle (most common in tetrahedral geometry)
- s = 1: Lines perpendicular (90°)

**Example from diagram:**
- R_q = 2, Q_q = 1 → s = 0.5 (45°)
- R_q = 5, Q_q = 1 → s = 0.2 (≈26.56...°)
- R_q = 10, Q_q = 1 → s = 0.1 (≈18.43...°)

#### Parameters

**Cartesian Mode:**
- `spreadXY`: Spread for rotation in XY plane (about Z-axis)
- `spreadXZ`: Spread for rotation in XZ plane (about Y-axis)
- `spreadYZ`: Spread for rotation in YZ plane (about X-axis)

**Quadray Mode:**
- `spreadWX`: Spread for rotation in WX plane
- `spreadWY`: Spread for rotation in WY plane
- `spreadWZ`: Spread for rotation in WZ plane
- `spreadXY`: Spread for rotation in XY plane
- `spreadXZ`: Spread for rotation in XZ plane
- `spreadYZ`: Spread for rotation in YZ plane

#### Implementation Strategy

**Spread to Rotation Matrix (RT-Pure):**

For a rotation in a plane with spread s:

```javascript
/**
 * Create rotation matrix from spread value (RT-Pure method)
 *
 * For spread s in a 2D plane, the rotation preserves quadrance and uses
 * the relationship: s = sin²(θ) where θ is the traditional angle
 *
 * Given spread s, we can derive:
 * - sin²(θ) = s
 * - cos²(θ) = 1 - s (from Pythagorean identity)
 * - sin(θ) = √s
 * - cos(θ) = √(1-s)
 *
 * While √s is irrational, for SPECIFIC algebraic spreads (s = 1/2, 1/4, 3/4, etc.)
 * we get exact algebraic values:
 * - s = 1/2 → sin = 1/√2, cos = 1/√2 (45°)
 * - s = 1 → sin = 1, cos = 0 (90°)
 * - s = 0 → sin = 0, cos = 1 (0°)
 *
 * @param {number} spread - Spread value (0 to 1)
 * @param {string} plane - Plane of rotation: 'XY', 'XZ', 'YZ'
 * @returns {THREE.Matrix4} Rotation matrix
 */
function spreadToRotationMatrix(spread, plane) {
  // Clamp spread to valid range [0, 1]
  const s = Math.max(0, Math.min(1, spread));

  // Calculate sin and cos from spread
  // Note: For exact algebraic spreads, these could be stored as exact values
  const sinTheta = Math.sqrt(s);
  const cosTheta = Math.sqrt(1 - s);

  const matrix = new THREE.Matrix4();

  // Rotation matrices by plane
  switch(plane) {
    case 'XY': // Rotation about Z-axis
      matrix.set(
        cosTheta, -sinTheta, 0, 0,
        sinTheta,  cosTheta, 0, 0,
        0,         0,        1, 0,
        0,         0,        0, 1
      );
      break;

    case 'XZ': // Rotation about Y-axis
      matrix.set(
        cosTheta,  0, sinTheta, 0,
        0,         1, 0,        0,
        -sinTheta, 0, cosTheta, 0,
        0,         0, 0,        1
      );
      break;

    case 'YZ': // Rotation about X-axis
      matrix.set(
        1, 0,         0,        0,
        0, cosTheta, -sinTheta, 0,
        0, sinTheta,  cosTheta, 0,
        0, 0,         0,        1
      );
      break;
  }

  return matrix;
}
```

**Exact Algebraic Spread Values (Preferred):**

For maximum RT purity, restrict spreads to algebraic values:

```javascript
// Common exact spreads in tetrahedral geometry
const EXACT_SPREADS = {
  PARALLEL: 0,           // 0° - s = 0
  TETRAHEDRAL: 1/3,      // ≈54.74° - tetrahedron dihedral angle
  OCTAHEDRAL: 1/2,       // 45° - s = 1/2
  CUBE_DIAGONAL: 2/3,    // ≈70.53° - cube diagonal to edge
  PERPENDICULAR: 1       // 90° - s = 1
};

// UI could provide these as preset buttons or snap-to values
```

**Composition of Rotations:**

For multiple rotations, apply sequentially:

```javascript
function applySpreadRotations(polyhedron, rotations) {
  // rotations = [{spread: 0.5, plane: 'XY'}, {spread: 0.25, plane: 'YZ'}, ...]

  const compositeMatrix = new THREE.Matrix4();

  rotations.forEach(rot => {
    const rotMatrix = spreadToRotationMatrix(rot.spread, rot.plane);
    compositeMatrix.multiply(rotMatrix);
  });

  polyhedron.setRotationFromMatrix(compositeMatrix);
}
```

**RT Advantages:**
- Spread values remain rational/algebraic
- No angle accumulation errors
- Exact lattice rotations for tetrahedral/cubic symmetries
- Reversible transforms (spread addition/subtraction is exact)

## "Now" System: Configuration Snapshots

### Concept

Each "Now" is an **immutable snapshot** of a polyhedron's configuration at a moment in shape-space. Users manipulate a "working" polyhedron using the gumball, then press **"Now"** to deposit that configuration as a permanent instance, with position, scale, rotation noted in whatever system it was created in (XYZ/WXYZ) and stored in StateManager (able to export via CSV or other formats)

### Now Data Structure

```javascript
/**
 * A "Now" represents a single configuration snapshot
 * Stores ONLY the object state, NOT global environment
 */
const nowSchema = {
  id: String,              // Unique identifier (UUID or timestamp-based)
  timestamp: Number,       // Unix timestamp when "Now" was created

  // Polyhedron identity
  polyhedronType: String,  // 'tetrahedron', 'cube', 'octahedron', 'icosahedron', etc.

  // Transform state (in Quadray space for RT purity)
  transform: {
    position: {
      mode: String,        // 'cartesian' or 'quadray'

      // Quadray coordinates (preferred for RT)
      quadray: {
        w: Number,         // Algebraic coefficient
        x: Number,
        y: Number,
        z: Number
      },

      // Cartesian fallback
      cartesian: {
        x: Number,
        y: Number,
        z: Number
      }
    },

    rotation: {
      mode: String,        // 'spread' (RT-pure) or 'euler' (fallback)

      // Spread rotations (preferred for RT)
      spreads: [
        {
          plane: String,   // 'XY', 'XZ', 'YZ', 'WX', 'WY', 'WZ'
          spread: Number,  // Algebraic spread value (0-1)
          exact: String    // Optional: exact algebraic expression e.g., "1/2", "√2/2"
        }
      ],

      // Euler angles fallback (if needed for THREE.js)
      euler: {
        x: Number,
        y: Number,
        z: Number,
        order: String    // 'XYZ', 'YXZ', etc.
      }
    },

    scale: {
      x: Number,         // Scale factors (algebraic)
      y: Number,
      z: Number,
      uniform: Boolean   // True if xyz are equal
    }
  },

  // Visual properties (optional)
  appearance: {
    color: Number,       // Hex color
    opacity: Number,     // 0-1
    wireframe: Boolean,
    visible: Boolean
  },

  // Metadata (optional)
  metadata: {
    label: String,       // User-defined name
    tags: [String],      // Searchable tags
    notes: String        // User notes
  }
};
```

### "Now" Operations

#### Create Now
```javascript
/**
 * Capture current polyhedron state as a "Now"
 * @param {THREE.Object3D} polyhedron - The working polyhedron
 * @param {Object} gumballState - Current gumball transform settings
 * @returns {Object} Now snapshot
 */
function createNow(polyhedron, gumballState) {
  const now = {
    id: generateUUID(),
    timestamp: Date.now(),
    polyhedronType: polyhedron.userData.type,
    transform: {
      position: {
        mode: gumballState.coordinateMode,
        quadray: gumballState.quadrayPosition,
        cartesian: {
          x: polyhedron.position.x,
          y: polyhedron.position.y,
          z: polyhedron.position.z
        }
      },
      rotation: {
        mode: 'spread',
        spreads: gumballState.spreadRotations,
        euler: {
          x: polyhedron.rotation.x,
          y: polyhedron.rotation.y,
          z: polyhedron.rotation.z,
          order: polyhedron.rotation.order
        }
      },
      scale: {
        x: polyhedron.scale.x,
        y: polyhedron.scale.y,
        z: polyhedron.scale.z,
        uniform: polyhedron.scale.x === polyhedron.scale.y && polyhedron.scale.y === polyhedron.scale.z
      }
    },
    appearance: {
      color: polyhedron.material.color.getHex(),
      opacity: polyhedron.material.opacity,
      wireframe: polyhedron.material.wireframe,
      visible: polyhedron.visible
    },
    metadata: {
      label: gumballState.label || `Now_${Date.now()}`,
      tags: gumballState.tags || [],
      notes: gumballState.notes || ''
    }
  };

  return now;
}
```

#### Deposit Now Instance
```javascript
/**
 * Create a permanent instance from a "Now" snapshot
 * @param {Object} now - The Now snapshot
 * @returns {THREE.Object3D} Deposited polyhedron instance
 */
function depositNowInstance(now) {
  // Create polyhedron based on type
  const instance = createPolyhedron(now.polyhedronType);

  // Apply transform
  instance.position.set(
    now.transform.position.cartesian.x,
    now.transform.position.cartesian.y,
    now.transform.position.cartesian.z
  );

  instance.scale.set(
    now.transform.scale.x,
    now.transform.scale.y,
    now.transform.scale.z
  );

  // Apply rotation from spread or euler
  if (now.transform.rotation.mode === 'spread') {
    applySpreadRotations(instance, now.transform.rotation.spreads);
  } else {
    instance.rotation.set(
      now.transform.rotation.euler.x,
      now.transform.rotation.euler.y,
      now.transform.rotation.euler.z
    );
  }

  // Apply appearance
  instance.material.color.setHex(now.appearance.color);
  instance.material.opacity = now.appearance.opacity;
  instance.material.wireframe = now.appearance.wireframe;
  instance.visible = now.appearance.visible;

  // Store Now reference
  instance.userData.nowId = now.id;
  instance.userData.nowTimestamp = now.timestamp;

  return instance;
}
```

#### Now Collection Management
```javascript
/**
 * Collection of all "Nows" in the current session
 */
const nowCollection = {
  nows: [],              // Array of Now snapshots
  instances: [],         // Array of deposited THREE.Object3D instances

  /**
   * Add a Now to the collection and deposit its instance
   */
  add(now) {
    this.nows.push(now);
    const instance = depositNowInstance(now);
    this.instances.push(instance);
    scene.add(instance);
    return instance;
  },

  /**
   * Remove a Now and its instance
   */
  remove(nowId) {
    const nowIndex = this.nows.findIndex(n => n.id === nowId);
    if (nowIndex === -1) return;

    // Remove instance from scene
    const instance = this.instances[nowIndex];
    scene.remove(instance);

    // Remove from collections
    this.nows.splice(nowIndex, 1);
    this.instances.splice(nowIndex, 1);
  },

  /**
   * Clear all Nows
   */
  clear() {
    // Remove all instances from scene
    this.instances.forEach(instance => scene.remove(instance));

    this.nows = [];
    this.instances = [];
  },

  /**
   * Export Nows to JSON
   */
  exportJSON() {
    return JSON.stringify({
      version: '1.0',
      count: this.nows.length,
      nows: this.nows
    }, null, 2);
  },

  /**
   * Import Nows from JSON
   */
  importJSON(jsonString) {
    const data = JSON.parse(jsonString);

    // Clear existing
    this.clear();

    // Import each Now
    data.nows.forEach(now => this.add(now));
  }
};
```

## User Interface

### Interactive Gumball Handles (3D Viewport)

The ART Gumball uses the **actual basis vectors as interactive handles** - similar to Maya, Blender, or Rhino gumballs. NO separate control panel needed.

#### Handle Types by Operation

**MOVE Handles** - Arrow tips at end of each basis vector
```
Quadray Mode (WXYZ):
  - 4 arrow handles (W, X, Y, Z directions)
  - Click + drag arrow = constrained move along that basis vector
  - Color-coded: W=Yellow, X=Red, Y=Blue, Z=Green

Cartesian Mode (XYZ):
  - 3 arrow handles (X, Y, Z directions)
  - Click + drag arrow = constrained move along that axis
  - Color-coded: X=Red, Y=Green, Z=Blue
```

**SCALE Handles** - Cubes at end of each basis vector
```
Quadray Mode (WXYZ):
  - 4 cube handles (W, X, Y, Z directions)
  - Click + drag cube = scale in that direction
  - Central sphere at origin = uniform scale all directions
  - Color-coded to match basis vectors

Cartesian Mode (XYZ):
  - 3 cube handles (X, Y, Z directions)
  - Click + drag cube = scale in that direction
  - Central sphere at origin = uniform scale all directions
  - Color-coded to match axes
```

**ROTATE Handles** - Hexagons (or polygons) around each basis vector axis
```
Quadray Mode (WXYZ):
  - 4 rotation handles (around W, X, Y, Z axes)
  - Each handle = hexagon perpendicular to its basis vector
  - Click + drag hexagon = rotation around that axis (spread-based)
  - Color-coded to match basis vector (W=Yellow, X=Red, Y=Blue, Z=Green)
  - Simpler than 6 Central Angle plane rings (reduces visual clutter)

Cartesian Mode (XYZ):
  - 3 rotation handles (around X, Y, Z axes)
  - Each handle = hexagon perpendicular to its axis
  - Click + drag hexagon = rotation around that axis (spread-based)
  - Color-coded to match axis (X=Red, Y=Green, Z=Blue)
```

**Design Rationale:**
- Hexagons preferred over circles for RT fidelity (polygonal geometry)
- 4 rotation axes (WXYZ) simpler than 6 Central Angle planes (WX, WY, WZ, XY, XZ, YZ)
- Less visual clutter while maintaining full rotational control
- Axis-aligned rotations easier to understand than plane-based rotations

#### Visual Design

```
QUADRAY GUMBALL (WXYZ Mode):

              Z (Green)
                ▲
                │ ●─── Z-scale cube (green)
                │/
                ◯  <── YZ rotation ring (cyan)
               /│
              / │
             /  │
    W (Yellow)  │
        ▲       │
        │\      │
        │ ●─────┼──────● X (Red)
        │  \    │     /│
        │   \   │    / │ ●─── X-scale cube (red)
        ●────\──┼───/──◯
       /|\    \ │  /  / <── XY rotation ring (magenta)
      / │ \    \│ /  /
     /  │  \    ◯  /
    ●───┼───────●─/
   /    │      / │/
  /     │     /  │
 ●      │    ●   │
W-cube  │  Y-cube│
        ▼        ▼
      Y (Blue)  Origin Sphere (uniform scale)


CARTESIAN GUMBALL (XYZ Mode):

              Z (Blue)
                ▲
                │ ●─── Z-scale cube (blue)
                │
                │
                ◯  <── YZ rotation ring (cyan)
                │
                │
                │
                ●─────────────────● Y (Green)
               /│                 │
              / │                 │ ●─── Y-scale cube (green)
             /  │                 │
            /   ◯  <── XY rotation ring (yellow)
           /    │
          ●─────┼─────●
         /│     │    /
        / │     │   /
       /  │     │  /
      ●   │     ● ●─── X-scale cube (red)
    X-cube│    Origin Sphere
          ▼
       X (Red)
```

### Status Bar / Streaming Console

**Location:** Top or bottom of viewport (user preference)

**Appears:** When user starts an operation (click on handle)

**Purpose:** Numeric input completion for precise control

```
┌─────────────────────────────────────────────────────────────────┐
│ MOVE W: [____] | TAB to accept | ESC to cancel | NOW to deposit │
└─────────────────────────────────────────────────────────────────┘
```

#### Interaction Flow

1. **User clicks arrow handle (e.g., W-axis move)**
   - Status bar appears: `MOVE W: [____]`
   - Polyhedron follows mouse in W direction
   - Real-time numeric display shows current value

2. **User types value** (e.g., `2.5`)
   - Status bar: `MOVE W: [2.5_]`
   - Polyhedron jumps to exact position
   - TAB or ENTER to accept

3. **User presses NOW button** (or keyboard shortcut `N`)
   - Current transform deposited as "Now" instance
   - Counter increments
   - Working polyhedron remains for next transform

#### Status Bar States

```
IDLE:
[No active operation]

MOVE (Quadray W):
MOVE W: [2.500] | TAB: accept | ESC: cancel | N: NOW

ROTATE (XY plane, spread):
ROTATE XY: s=[0.500] (45°) | TAB: accept | ESC: cancel | N: NOW
Exact spreads: [0] [1/6] [1/4] [1/3] [1/2] [2/3] [3/4] [1]

SCALE (Uniform):
SCALE UNIFORM: [1.414] | TAB: accept | ESC: cancel | N: NOW

NOW DEPOSITED:
✓ Now #5 deposited: Tet_001 at (W:2.5, X:0, Y:0, Z:0)
```

### Exact Spread Presets

When rotating (clicking rotation ring), status bar shows preset spread buttons:

```
ROTATE XY plane:
┌──────────────────────────────────────────────────────────────┐
│ s=[____] │ [0°] [1/6] [1/4] [1/3·tet] [1/2·45°] [2/3] [3/4] [1·90°] │
└──────────────────────────────────────────────────────────────┘
```

Click preset = instantly apply that spread value

### Minimal UI Elements

**Top-right corner (always visible):**
```
┌─────────────────────────────┐
│ Mode: [Quadray ▼]           │
│ Tool: [Move ▼]              │
│ Poly: [Tetrahedron ▼]       │
│                             │
│ [🕐 NOW] Deposited: 3      │
│                             │
│ [Export] [Import] [Clear]   │
└─────────────────────────────┘
```

**Mode dropdown:**
- Cartesian (XYZ)
- Quadray (WXYZ)

**Tool dropdown:**
- Move
- Rotate
- Scale

**Poly dropdown:**
- Tetrahedron
- Cube
- Octahedron
- Icosahedron
- Dodecahedron
- etc.

## StateManager Integration

### Environment State (Captured Once)

The **global environment** is captured once as metadata, NOT in each Now:

```javascript
const environmentState = {
  version: '1.0',
  timestamp: Date.now(),

  // Global settings
  grids: {
    cartesian: {
      visible: Boolean,
      tessellation: Number
    },
    quadray: {
      visible: Boolean,
      tessellation: Number
    }
  },

  basis: {
    cartesian: Boolean,
    quadray: Boolean
  },

  camera: {
    position: {x, y, z},
    target: {x, y, z},
    zoom: Number
  },

  // RT Constants
  constants: {
    tetrahedronEdge: Number,
    cubeEdge: Number,
    gridUnit: Number
  }
};
```

### Session Export Format

```javascript
const sessionExport = {
  meta: environmentState,
  nows: nowCollection.nows
};
```

**CSV Export (for Now sequence):**

```csv
id,timestamp,polyhedron,mode,qW,qX,qY,qZ,spreadWX,spreadWY,spreadWZ,spreadXY,spreadXZ,spreadYZ,scaleX,scaleY,scaleZ,label
uuid1,1234567890,tetrahedron,quadray,1,0,0,0,0,0,0,0,0,0,1,1,1,Origin
uuid2,1234567891,tetrahedron,quadray,2,0,0,0,0,0,0,0.5,0,0,1,1,1,Lattice_01
uuid3,1234567892,cube,quadray,0,2,0,0,0,0,0,0,0,0,1.414,1.414,1.414,Cube_Center
...
```

## Implementation Roadmap

### Phase 1: Core Gumball (MVP) - ✅ IN PROGRESS

- [x] Minimal UI controls (Controls section)
  - [x] ~~Coordinate mode toggle (Cartesian XYZ / Quadray WXYZ)~~ - Uses existing Coordinate System section
  - [x] Tool mode selector (Move / Scale / Rotate)
  - [x] ~~Polyhedron selection dropdown~~ - Works with currently selected polyhedra
  - [x] NOW button with deposited count (UI only, functionality pending)
  - [x] XYZ coordinate input fields (3 inputs with 4dp precision)
  - [x] WXYZ coordinate input fields (4 inputs with 4dp precision)
- [x] Interactive 3D gumball handles (basis vectors ARE the gumball)
  - [x] MOVE mode: Arrow handles at basis vector tips
    - [ ] Cartesian: 3 arrows (X, Y, Z) - Pending implementation
    - [x] **Quadray: 4 arrows (W, X, Y, Z) - ✅ IMPLEMENTED**
    - [x] **Click + drag arrow = constrained move along that axis - ✅ WORKING**
  - [ ] SCALE mode: Cube handles at basis vector tips
    - [ ] Cartesian: 3 cubes + center sphere (uniform)
    - [ ] Quadray: 4 cubes + center sphere (uniform)
    - [ ] Click + drag cube = scale in that direction
  - [x] **Visual feedback: Real-time transform preview - ✅ WORKING**
  - [x] **Real-time coordinate updates during drag - ✅ WORKING**
- [ ] Status bar for numeric input - DEFERRED (using coordinate input fields instead)
  - [ ] Appears on handle click
  - [ ] Live value display
  - [ ] Keyboard input for precise values
  - [ ] TAB/ENTER to accept, ESC to cancel

**Implementation Notes (Phase 1):**
- **Date:** 2025-12-29
- **Commit:** (pending)
- **Status:** WXYZ Move functionality implemented and ready for testing
- **Files Modified:**
  - `ARTexplorer.html` (lines 2311-2491): Added gumball tool event listeners, raycasting, and drag behavior
  - Coordinate inputs automatically update during drag operations
  - Orbit controls properly disabled during drag, re-enabled on release
- **Key Features Working:**
  - Raycasting detects clicks on Quadray basis vector arrows (W, X, Y, Z)
  - Constrained axis movement (drag projects onto selected axis direction)
  - Real-time XYZ and WXYZ coordinate display (4 decimal precision)
  - Cartesian to Quadray coordinate conversion (simplified projection method)
- **Next Steps:**
  - Test WXYZ movement with dev server (http://localhost:8000/ARTexplorer.html)
  - Add Cartesian XYZ arrow dragging support
  - Implement Scale and Rotate modes

### Phase 2: Spread-Based Rotation
- [ ] ROTATE mode: Polygon handles (hexagons preferred for RT fidelity)
  - [ ] Cartesian XYZ: 3 rotation handles around each axis (X, Y, Z)
    - [ ] Each handle = polygon perpendicular to rotation axis
    - [ ] Color-coded to axis color
  - [ ] Quadray WXYZ: 4 rotation handles around each basis (W, X, Y, Z)
    - [ ] Each handle = polygon perpendicular to basis vector
    - [ ] Simpler than 6 coplanar Central Angle planes (less clutter)
- [ ] `spreadToRotationMatrix()` function
- [ ] Exact spread preset buttons in status bar
  - [ ] [0] [1/6] [1/4] [1/3·tet] [1/2·45°] [2/3] [3/4] [1·90°]
- [ ] Rotation composition logic
- [ ] Visual feedback during rotation

### Phase 3: "Now" System
- [ ] Now data structure
- [ ] "NOW" button functionality
- [ ] `createNow()` and `depositNowInstance()` functions
- [ ] Now collection management
- [ ] Instance rendering in scene
- [ ] Now counter display

### Phase 4: Import/Export
- [ ] JSON export for Nows
- [ ] CSV export for Nows
- [ ] Import functionality
- [ ] Environment state capture
- [ ] Session file format (.artnow or .json)

### Phase 5: Advanced Features
- [ ] Now timeline visualization
- [ ] Now editing/deletion
- [ ] Instance ghosting/hiding
- [ ] Trajectory paths between Nows
- [ ] Animation interpolation (optional)
- [ ] Lattice snap-to-grid (Quadray mode)

## RT Purity Checklist

To maintain Rational Trigonometry principles:

- ✅ All positions stored as algebraic coordinates (Quadray preferred)
- ✅ All rotations defined by spread (not degrees)
- ✅ Exact algebraic spread values provided as presets
- ✅ Quadrance used internally (not distance)
- ✅ No transcendental functions in core logic
- ✅ Floating-point only for final rendering (THREE.js requirement)
- ✅ Reversible transforms (spread arithmetic is exact)

## Mathematical Foundations

### Spread Formula

For two lines L₁ and L₂ meeting at point P:

**Spread s = Q_quad / R_quad**

Where:
- **Q_quad**: Quadrance from P to closest point on opposite line (perpendicular distance²)
- **R_quad**: Quadrance from P along the line (radius²)

**Properties:**
- 0 ≤ s ≤ 1 (always bounded, unlike angles)
- s = 0: Parallel lines
- s = 1: Perpendicular lines
- s = 1/2: 45° angle (common in tetrahedral geometry)

### Spread Laws (Wildberger's RT)

**Spread Law (analog of sine rule):**
```
s₁/Q₁ = s₂/Q₂ = s₃/Q₃
```

**Cross Law (analog of cosine rule):**
```
(Q₁ + Q₂ + Q₃)² = 2(Q₁² + Q₂² + Q₃²) + 8Q₁Q₂Q₃(1-s₁)(1-s₂)(1-s₃)
```

**Triple Spread Formula:**
```
(s₁ + s₂ + s₃)² = 2(s₁² + s₂² + s₃²) + 4s₁s₂s₃
```

### Exact Algebraic Spreads

Common spreads in Platonic/Archimedean solids:

| Spread | Exact Value | Angle (approx) | Geometry |
|--------|-------------|----------------|----------|
| 0 | 0 | 0° | Parallel |
| 1/6 | 1/6 | ≈23.6° | - |
| 1/4 | 1/4 | 30° | - |
| 1/3 | 1/3 | ≈35.3° | Tetrahedron dihedral |
| 1/2 | 1/2 | 45° | Octahedron, cube diagonal |
| 2/3 | 2/3 | ≈54.7° | Cube diagonal to edge |
| 3/4 | 3/4 | 60° | - |
| 1 | 1 | 90° | Perpendicular |

## References

- **Rational Trigonometry**: N.J. Wildberger, "Divine Proportions: Rational Trigonometry to Universal Geometry" (2005)
- **Julian Barbour**: "The End of Time" - Timeless physics and configuration space
- **Quadray Coordinates**: R. Buckminster Fuller, "Synergetics" (1975)
- **ARTexplorer**: See [ARTexplorer.md](./ARTexplorer.md) for base implementation

## Future Research Directions

### Exact Trajectory Calculation
Using spread-based rotations, we can calculate **exact trajectories** without floating-point drift:
- Orbital paths in tetrahedral lattice
- Geodesic paths on polyhedra
- Lattice filling patterns

### Quantum Geometry Integration
RT's algebraic exactness may align with:
- Discrete spacetime models
- Loop quantum gravity (spin networks)
- Causal set theory

### Computational Advantages
- **GPU shaders**: Spread polynomials may be faster than sin/cos
- **Symbolic computation**: Keep transforms in algebraic form
- **Exact inverse kinematics**: No iterative solving needed

---

**Status:** Ready for implementation planning
**Next Steps:** Create detailed UI mockups and begin Phase 1 development
