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

## Forms, Instances, and Localized Gumballs

### Conceptual Architecture

The ART Gumball system distinguishes between **Forms** (templates) and **Instances** ("Nows"):

#### Forms
**Forms** are polyhedra templates that always exist at the origin (0,0,0,0). They serve as:
- **Blueprints** for creating instances
- **Active editing objects** when selected
- **Reusable templates** that reset after instance creation

When a user selects a Form:
1. Form appears at origin with default properties
2. **Editing Basis** (localized gumball) appears at Form's center
3. User can transform the Form using gumball handles
4. Form remains "active" until released/deposited

#### Instances ("Nows")
**Instances** are deposited snapshots of Forms with stored transforms:
- **Immutable configurations** in shape-space (Julian Barbour's "Nows")
- **Fixed position, rotation, scale** stored in StateManager
- **Selectable objects** that can be edited or deleted
- **Independent from Forms** - Forms reset to origin after instance creation

When a user releases a transformed Form:
1. Instance is auto-created with current transform
2. Instance is deposited in scene with stored state
3. Form resets to origin (0,0,0,0)
4. Form ready for next transformation

#### Editing Basis vs. Origin Basis

**Origin Basis (Global Reference)**
- Always visible at world origin (0,0,0,0)
- Shows global coordinate frame (XYZ or WXYZ)
- Cannot be moved or hidden
- Provides spatial orientation reference

**Editing Basis (Localized Gumball)**
- Appears when Form or Instance is selected
- Centered on selected object's position
- Moves with object during transformations
- Hidden when nothing is selected
- Provides interactive transform handles

### Workflow: Forms → Instances

**Step 1: Select Form**
```
User clicks "Tetrahedron" in Forms list
→ Tetrahedron Form appears at origin
→ Editing Basis appears at Form center
→ Origin Basis remains at world origin
```

**Step 2: Transform Form**
```
User activates Move tool
→ Clicks/drags Editing Basis W-axis handle
→ Form moves along W-axis (grid snapping to 0.1)
→ Coordinate inputs update in real-time
→ Origin Basis stays at world origin (reference)
```

**Step 3: Release/Deposit**
```
User releases mouse button (or clicks NOW button)
→ Instance auto-created with Form's current transform
→ Instance deposited in scene at (W:2.5, X:0, Y:0, Z:0)
→ Form resets to origin (0,0,0,0)
→ Editing Basis disappears (nothing selected)
→ User can now select another Form or edit existing Instance
```

**Step 4: Select Instance (Edit Existing)**
```
User clicks on deposited Instance
→ Instance becomes selected (visual highlight/glow)
→ Editing Basis appears at Instance center
→ User can Move/Scale/Rotate the Instance
→ On release, Instance transform updates in StateManager
```

**Step 5: Delete Instance**
```
User selects Instance
→ Presses Delete key (or Delete button)
→ Instance removed from scene and StateManager
→ Action added to Undo stack
```

**Step 6: Undo/Redo**
```
User presses Cmd+Z (Undo)
→ Last action (create/move/delete) is reversed
→ StateManager reverts to previous state
→ Scene updates to match StateManager

User presses Cmd+Shift+Z (Redo)
→ Undone action is reapplied
→ StateManager advances forward
```

### StateManager Architecture

Following the proven TEUI/OBJECTIVE pattern (see [UI-Module.md](./UI-Module.md)), the `rt-state-manager.js` module manages all state:

#### State Structure
```javascript
/**
 * rt-state-manager.js
 * State management for ART Gumball system
 * Following TEUI/OBJECTIVE StateManager pattern
 */

const RTStateManager = {
  // Forms registry (templates at origin)
  forms: {
    tetrahedron: { type: 'tetrahedron', name: 'Tetrahedron', ... },
    cube: { type: 'cube', name: 'Hexahedron', ... },
    octahedron: { type: 'octahedron', name: 'Octahedron', ... },
    // ... all polyhedra types
  },

  // Active Form (currently being transformed)
  activeForm: null, // { type: 'tetrahedron', transform: {...}, threeObject: Group }

  // Deposited Instances (all "Nows")
  instances: [], // Array of Instance objects

  // Selection state
  selection: {
    type: null,      // 'form' or 'instance'
    id: null,        // Instance ID or null for Form
    object: null     // THREE.Object3D reference
  },

  // Undo/Redo stacks
  history: {
    undoStack: [],   // Past states
    redoStack: [],   // Future states (cleared on new action)
    maxHistory: 50   // Limit to prevent memory issues
  },

  // Gumball state
  gumball: {
    tool: null,           // 'move', 'scale', 'rotate', or null
    editingBasis: null,   // THREE.Group for localized gumball
    visible: false        // Show/hide editing basis
  }
};
```

#### Instance Data Structure
```javascript
const Instance = {
  id: String,              // Unique UUID
  timestamp: Number,       // Creation time
  type: String,            // 'tetrahedron', 'cube', etc.

  transform: {
    position: {
      mode: String,        // 'cartesian' or 'quadray'
      quadray: { w, x, y, z },
      cartesian: { x, y, z }
    },
    rotation: {
      mode: String,        // 'spread' or 'euler'
      spreads: [{plane, spread, exact}],
      euler: { x, y, z, order }
    },
    scale: { x, y, z, uniform }
  },

  appearance: {
    color: Number,
    opacity: Number,
    wireframe: Boolean,
    visible: Boolean
  },

  metadata: {
    label: String,
    tags: [String],
    notes: String
  },

  // THREE.js object reference (not serialized)
  threeObject: THREE.Group
};
```

#### Core Functions

**Form Management**
```javascript
/**
 * Select a Form (load at origin with editing basis)
 */
function selectForm(formType) {
  // Clear previous selection
  if (RTStateManager.activeForm) {
    resetForm(RTStateManager.activeForm);
  }

  // Create Form at origin
  const form = {
    type: formType,
    transform: createDefaultTransform(),
    threeObject: createPolyhedronGroup(formType)
  };

  // Add to scene
  scene.add(form.threeObject);

  // Create editing basis at Form center
  createEditingBasis(form.threeObject.position);

  RTStateManager.activeForm = form;
  RTStateManager.selection = { type: 'form', id: null, object: form.threeObject };

  return form;
}

/**
 * Reset Form to origin (after instance creation)
 */
function resetForm(form) {
  form.threeObject.position.set(0, 0, 0);
  form.threeObject.rotation.set(0, 0, 0);
  form.threeObject.scale.set(1, 1, 1);
  form.transform = createDefaultTransform();
  hideEditingBasis();
}
```

**Instance Management**
```javascript
/**
 * Create Instance from active Form (auto-deposit on release)
 */
function createInstance() {
  if (!RTStateManager.activeForm) return null;

  const form = RTStateManager.activeForm;

  // Create Instance snapshot
  const instance = {
    id: generateUUID(),
    timestamp: Date.now(),
    type: form.type,
    transform: cloneTransform(form.transform),
    appearance: cloneAppearance(form.threeObject),
    metadata: { label: `${form.type}_${Date.now()}`, tags: [], notes: '' },
    threeObject: clonePolyhedronGroup(form.threeObject)
  };

  // Add to StateManager
  RTStateManager.instances.push(instance);

  // Add to scene
  scene.add(instance.threeObject);

  // Add to undo stack
  addToHistory({ action: 'create', instance });

  // Reset Form to origin
  resetForm(form);

  return instance;
}

/**
 * Select an existing Instance (show editing basis)
 */
function selectInstance(instanceId) {
  const instance = RTStateManager.instances.find(i => i.id === instanceId);
  if (!instance) return;

  // Deselect Form if active
  if (RTStateManager.activeForm) {
    resetForm(RTStateManager.activeForm);
    RTStateManager.activeForm = null;
  }

  // Highlight Instance
  highlightObject(instance.threeObject);

  // Show editing basis at Instance center
  createEditingBasis(instance.threeObject.position);

  RTStateManager.selection = { type: 'instance', id: instanceId, object: instance.threeObject };
}

/**
 * Update Instance transform (after drag/edit)
 */
function updateInstance(instanceId, newTransform) {
  const instance = RTStateManager.instances.find(i => i.id === instanceId);
  if (!instance) return;

  // Store old transform for undo
  const oldTransform = cloneTransform(instance.transform);

  // Apply new transform
  instance.transform = newTransform;
  applyTransformToObject(instance.threeObject, newTransform);

  // Add to undo stack
  addToHistory({ action: 'update', instanceId, oldTransform, newTransform });
}

/**
 * Delete Instance
 */
function deleteInstance(instanceId) {
  const index = RTStateManager.instances.findIndex(i => i.id === instanceId);
  if (index === -1) return;

  const instance = RTStateManager.instances[index];

  // Remove from scene
  scene.remove(instance.threeObject);

  // Remove from StateManager
  RTStateManager.instances.splice(index, 1);

  // Hide editing basis
  hideEditingBasis();

  // Clear selection
  RTStateManager.selection = { type: null, id: null, object: null };

  // Add to undo stack
  addToHistory({ action: 'delete', instance, index });
}
```

**Selection & Highlighting**
```javascript
/**
 * Highlight selected object (outline glow effect)
 */
function highlightObject(object) {
  // Remove previous highlights
  clearHighlights();

  // Add outline pass or glow shader
  // Option 1: THREE.OutlinePass (post-processing)
  // Option 2: Edge glow shader on wireframe
  // Option 3: Colored outline geometry

  object.traverse(mesh => {
    if (mesh.isMesh) {
      mesh.userData.originalEmissive = mesh.material.emissive.clone();
      mesh.material.emissive.setHex(0x4a9eff); // Blue glow
      mesh.material.emissiveIntensity = 0.3;
    }
  });
}

/**
 * Clear all highlights
 */
function clearHighlights() {
  RTStateManager.instances.forEach(instance => {
    instance.threeObject.traverse(mesh => {
      if (mesh.isMesh && mesh.userData.originalEmissive) {
        mesh.material.emissive.copy(mesh.userData.originalEmissive);
        mesh.material.emissiveIntensity = 0;
      }
    });
  });
}

/**
 * Handle click on scene object (raycasting)
 */
function onSceneClick(event) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Check for Instance hits
  const instanceObjects = RTStateManager.instances.map(i => i.threeObject);
  const intersects = raycaster.intersectObjects(instanceObjects, true);

  if (intersects.length > 0) {
    // Find parent Instance
    let hitObject = intersects[0].object;
    while (hitObject.parent && !hitObject.userData.instanceId) {
      hitObject = hitObject.parent;
    }

    if (hitObject.userData.instanceId) {
      selectInstance(hitObject.userData.instanceId);
    }
  } else {
    // Clicked on empty space - deselect
    clearSelection();
  }
}
```

**Undo/Redo System**
```javascript
/**
 * Add action to history
 */
function addToHistory(action) {
  // Clear redo stack (new action invalidates future)
  RTStateManager.history.redoStack = [];

  // Add to undo stack
  RTStateManager.history.undoStack.push(action);

  // Limit history size
  if (RTStateManager.history.undoStack.length > RTStateManager.history.maxHistory) {
    RTStateManager.history.undoStack.shift();
  }
}

/**
 * Undo last action
 */
function undo() {
  if (RTStateManager.history.undoStack.length === 0) return;

  const action = RTStateManager.history.undoStack.pop();

  switch (action.action) {
    case 'create':
      // Remove Instance
      const index = RTStateManager.instances.findIndex(i => i.id === action.instance.id);
      if (index !== -1) {
        scene.remove(RTStateManager.instances[index].threeObject);
        RTStateManager.instances.splice(index, 1);
      }
      break;

    case 'delete':
      // Re-add Instance
      RTStateManager.instances.splice(action.index, 0, action.instance);
      scene.add(action.instance.threeObject);
      break;

    case 'update':
      // Revert transform
      updateInstance(action.instanceId, action.oldTransform);
      break;
  }

  // Add to redo stack
  RTStateManager.history.redoStack.push(action);
}

/**
 * Redo last undone action
 */
function redo() {
  if (RTStateManager.history.redoStack.length === 0) return;

  const action = RTStateManager.history.redoStack.pop();

  switch (action.action) {
    case 'create':
      // Re-add Instance
      RTStateManager.instances.push(action.instance);
      scene.add(action.instance.threeObject);
      break;

    case 'delete':
      // Remove Instance again
      const index = RTStateManager.instances.findIndex(i => i.id === action.instance.id);
      if (index !== -1) {
        scene.remove(RTStateManager.instances[index].threeObject);
        RTStateManager.instances.splice(index, 1);
      }
      break;

    case 'update':
      // Re-apply new transform
      updateInstance(action.instanceId, action.newTransform);
      break;
  }

  // Add back to undo stack
  RTStateManager.history.undoStack.push(action);
}
```

**Editing Basis (Localized Gumball)**
```javascript
/**
 * Create editing basis at specified position
 */
function createEditingBasis(position) {
  // Remove existing editing basis
  if (RTStateManager.gumball.editingBasis) {
    scene.remove(RTStateManager.gumball.editingBasis);
  }

  // Create new basis group
  const editingBasis = new THREE.Group();
  editingBasis.position.copy(position);

  // Add basis vectors (same as origin basis, but localized)
  const basisVectors = createBasisVectors(currentCoordinateSystem); // 'XYZ' or 'WXYZ'
  editingBasis.add(basisVectors);

  // Add to scene
  scene.add(editingBasis);

  RTStateManager.gumball.editingBasis = editingBasis;
  RTStateManager.gumball.visible = true;
}

/**
 * Update editing basis position (follow selected object)
 */
function updateEditingBasisPosition(position) {
  if (RTStateManager.gumball.editingBasis) {
    RTStateManager.gumball.editingBasis.position.copy(position);
  }
}

/**
 * Hide editing basis (nothing selected)
 */
function hideEditingBasis() {
  if (RTStateManager.gumball.editingBasis) {
    scene.remove(RTStateManager.gumball.editingBasis);
    RTStateManager.gumball.editingBasis = null;
    RTStateManager.gumball.visible = false;
  }
}
```

### User Interactions

**Keyboard Shortcuts**
- `G` - Activate Move tool
- `S` - Activate Scale tool
- `R` - Activate Rotate tool
- `Esc` - Deactivate current tool / Deselect
- `Delete` / `Backspace` - Delete selected Instance
- `Cmd+Z` / `Ctrl+Z` - Undo
- `Cmd+Shift+Z` / `Ctrl+Shift+Z` - Redo
- `N` - Deposit Now (create Instance from active Form)

**Mouse Interactions**
- **Click on canvas (empty space)** - Deselect all
- **Click on Instance** - Select Instance (show editing basis + highlight)
- **Click on Form in list** - Select Form (load at origin with editing basis)
- **Click + Drag gumball handle** - Transform selected object (Form or Instance)
- **Release mouse** - Auto-deposit Instance if Form was moved

**UI Buttons**
- **Move / Scale / Rotate** - Toggle gumball tool mode
- **NOW** - Manually deposit Instance from active Form
- **Delete** - Delete selected Instance
- **Undo / Redo** - History navigation

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
- **Commit:** `f4e30fe` - "Feat: Implement WXYZ Move gumball with grid snapping (MVP)"
- **Branch:** `Gumball`
- **Status:** MVP working with known limitations requiring architectural improvements

**Files Modified:**
- `ARTexplorer.html` (lines 1307-1321, 2311-2510): Gumball implementation
  - Added invisible hit spheres (0.3 radius) at basis vector tips
  - Tool mode buttons with toggle behavior (default off)
  - Raycasting and drag event listeners
  - Grid snapping to 0.1 increments
  - Real-time coordinate updates (XYZ and WXYZ)

**What's Working:**
- ✅ Invisible clickable handles at basis vector tips
- ✅ Constrained axis movement (drag along W, X, Y, Z)
- ✅ Grid snapping to 0.1 for RT precision
- ✅ Real-time coordinate display (4dp, text inputs without spinners)
- ✅ 5x sensitivity multiplier for responsive dragging
- ✅ Entire polyhedra groups move together

**Critical Issues Identified:**
1. **Orbit lock incomplete** - Camera still rotates during drag attempts
   - `controls.enabled = false` not fully preventing orbit
   - May need `event.stopPropagation()` at canvas level

2. **Basis vectors stationary** - Global basis stays at origin
   - Need **localized gumball** that follows selected polyhedra
   - Each selected object should have its own transform gizmo

3. **Instance management broken** - Only first selection works
   - Second polyhedra (icosahedron) loads at origin but won't move
   - Need proper instance/selection system
   - StateManager integration required

4. **Selection model unclear** - Multiple polyhedra vs. single active
   - Should moved polyhedra become "instances"?
   - How to select/deselect for subsequent moves?

**Architectural Decisions Needed:**

**Option A: Global Gumball (Current)**
- Single basis vector set at world origin
- Selected polyhedra move relative to global axes
- ❌ Basis doesn't follow objects
- ❌ Confusing UX when polyhedra far from origin

**Option B: Localized Gumball (Recommended)**
- Each selected polyhedra gets own gumball at its center
- Basis vectors move with the object
- ✅ Matches Maya/Blender/Rhino UX
- ✅ Clear visual feedback
- Need: Gumball attachment/detachment system

**Option C: Hybrid (Best for RT)**
- Global Quadray basis always visible (reference frame)
- Local gumball overlays on selected object
- Can toggle between local/global transform space
- Most powerful but most complex

**Next Steps:**

**Phase 1.5: Forms, Instances & StateManager (CRITICAL ARCHITECTURE)** - ✅ COMPLETED (2025-12-29)
- [x] **Localized editing basis (Option C: Hybrid approach) - ✅ IMPLEMENTED**
  - [x] **Global origin basis remains visible at (0,0,0) as reference frame**
  - [x] **Editing basis appears at selected Form center when Move tool activated**
  - [x] **Editing basis follows Forms during drag operations**
  - [x] **Hit spheres positioned correctly in WXYZ quadray coordinate system**
  - [x] **Semi-transparent debug spheres (0.5 radius, 30% opacity) at arrow tips**
- [x] **Orbit controls management - ✅ FIXED**
  - [x] **Orbit disabled when Move tool activated (not just during drag)**
  - [x] **Orbit re-enabled when Move tool deactivated**
  - [x] **Clean tool-level control prevents camera fighting**
- [ ] Create `rt-state-manager.js` module following TEUI/OBJECTIVE pattern - DEFERRED
  - [ ] RTStateManager object with forms registry, instances array, selection state
  - [ ] Form management: `selectForm()`, `resetForm()`
  - [ ] Instance management: `createInstance()`, `selectInstance()`, `updateInstance()`, `deleteInstance()`
  - [ ] Undo/Redo: `addToHistory()`, `undo()`, `redo()` with action stacks
- [ ] Integrate Forms/Instances workflow - PENDING Phase 2
  - [ ] Auto-deposit Instance on mouseup (create from active Form)
  - [ ] Reset Form to origin after Instance creation
  - [ ] Track all instances in RTStateManager.instances array

**Phase 1.6: Selection & Deletion**
- [ ] Implement click-to-select for Instances
  - [ ] Raycasting on canvas click (check for Instance hits)
  - [ ] `selectInstance()` shows editing basis + highlight
  - [ ] Click empty space to deselect
- [ ] Visual highlight for selected objects
  - [ ] Option 1: THREE.OutlinePass (post-processing glow)
  - [ ] Option 2: Emissive material glow (simpler, current approach)
  - [ ] Option 3: Edge glow shader on wireframe
- [ ] Delete functionality
  - [ ] Delete key removes selected Instance
  - [ ] Delete button in UI
  - [ ] Remove from scene and StateManager
  - [ ] Add to undo stack
- [ ] Undo/Redo keyboard shortcuts
  - [ ] Cmd+Z / Ctrl+Z for Undo
  - [ ] Cmd+Shift+Z / Ctrl+Shift+Z for Redo
  - [ ] Undo/Redo buttons in UI (optional)

**Phase 1.7: Cartesian XYZ Support & Polish** - ✅ COMPLETED (2025-12-29)
- [x] **Add Cartesian XYZ arrow dragging (same pattern as WXYZ) - ✅ IMPLEMENTED**
  - [x] **Create XYZ basis vectors in editing basis (X=red, Y=green, Z=blue)**
  - [x] **Add hit spheres at XYZ arrow tips**
  - [x] **Implement constrained movement along X, Y, Z axes**
  - [x] **Checkbox-controlled visibility: UI checkboxes determine which systems appear**
  - [x] **User can enable WXYZ only, XYZ only, or both simultaneously**
- [ ] Implement Scale and Rotate modes (using same hit sphere pattern) - NEXT
- [ ] Add keyboard shortcuts (G=Move, S=Scale, R=Rotate, ESC=Cancel/Deselect, N=NOW)
- [ ] Visual feedback when handle is hovered (change color/scale)
- [ ] Visual feedback when handle is selected during drag
- [ ] Hide debug hit spheres (set opacity: 0) once testing complete

**Testing Observations (2025-12-29):**
- ✅ Cube and Dual Tetrahedron move together correctly
- ✅ Grid snapping works (positions snap to 0.1, 0.2, 0.3, etc.)
- ✅ Coordinate inputs update in real-time (both XYZ and WXYZ)
- ✅ Tool toggle works (click to activate, click again to deactivate)
- ✅ Movement is visually apparent and responsive
- ✅ Editing basis follows Forms during drag operations
- ✅ Hit spheres correctly positioned at both WXYZ and XYZ arrow tips
- ✅ Orbit controls locked when Move tool active
- ✅ Can perform multiple moves on same Form (editing basis persists)
- ✅ Checkbox control works: uncheck XYZ/WXYZ to hide respective handles
- ✅ Cleaner workspace when using single coordinate system
- ✅ Both systems can be enabled simultaneously for maximum flexibility

**Known Issues & Blockers (2025-12-29):**

⚠️ **CRITICAL: No Selection System** - Blocking further progress on Phase 1.6+

**Problem:**
- All visible polyhedra move together globally
- No way to select individual instances via click
- Cannot isolate Forms (templates) from Instances (deposited snapshots)
- User loses control over what gets edited

**Impact:**
- "Everything gets moved together and without instantiation, also everything is edited globally" (User feedback)
- NOW button can deposit instance snapshots but they remain coupled to Forms
- Cannot implement delete functionality (Phase 1.6)
- Cannot implement proper Forms vs Instances workflow (Phase 1.5)

**Required Solution (Phase 1.6 Prerequisites):**
1. **Click-to-select raycasting** - Detect mouse clicks on 3D objects
2. **Visual highlight glow** - Show which Form/Instance is selected (emissive material or OutlinePass)
3. **Forms vs Instances separation:**
   - Forms: Editable templates at origin (only one active at a time)
   - Instances: Independent deposited snapshots (immutable after NOW button pressed)
4. **StateManager integration** - Track selected instance, deposited instances, undo stack

**Architectural Recommendation (User Suggestion):**
- "Should we consider breaking these functions into a new 'rt-controls.js' file?"
- Extract gumball logic from ARTexplorer.html (~3000+ lines) to dedicated modules:
  - `rt-controls.js` - Gumball interaction logic, raycasting, selection
  - `rt-state-manager.js` - Instance tracking, undo/redo, state persistence
- Keep ARTexplorer.html as UI container only (~500 lines target)

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

## Session Plan: 2025-12-30 - Selection System & StateManager (CRITICAL)

### Current State (as of 2025-12-29 EOD)

**Branch:** Gumball
**Commit:** 2cf2da1 - "Revert: Reset to working inline gumball version for analysis"

**What We Have:**
- ✅ Working inline gumball implementation in ARTexplorer.html
- ✅ Extracted rt-controls.js module saved for comparison
- ✅ Move tool with WXYZ and XYZ dual coordinate system support
- ✅ Grid snapping, real-time coordinate updates, editing basis following forms
- ✅ Backup branch `backup-broken-state` preserving broken extraction attempt

**What's Broken:**
- ❌ Previous hasty rt-controls.js extraction broke all axis movement except W-axis (partially)
- ❌ No selection system - all visible polyhedra move together globally
- ❌ No StateManager - cannot track Forms vs Instances
- ❌ NOW button deposits instances but they remain coupled to Forms
- ❌ Cannot delete, undo/redo, or isolate individual objects

### Priority 1: Analyze Failed Module Extraction (2-3 hours)

**Goal:** Understand what broke when extracting gumball code to rt-controls.js module

**Tasks:**
1. **Side-by-side comparison** - Compare inline gumball code in ARTexplorer.html with extracted rt-controls.js
2. **Identify broken dependencies:**
   - What global variables does inline code access?
   - Which THREE.js objects (scene, camera, renderer, controls) need proper passing?
   - How do event listeners differ between inline and module contexts?
   - Why does editing basis creation fail in module but work inline?
   - What causes X/Y/Z axes to break while W-axis works partially?
3. **Document findings** - Create detailed analysis of what dependencies must be preserved
4. **Plan systematic extraction** - Design incremental approach with testing at each step

**Key Questions to Answer:**
- Does inline code rely on global `scene`, `camera`, `renderer`, `controls` variables?
- Are there closure/scope issues with `this` binding in ES6 module class?
- Do event listeners lose context when moved to module?
- Is `editingBasis` reference lost between inline and module?
- What's different about W-axis that makes it partially work vs X/Y/Z total failure?

**Deliverable:** Analysis document outlining exact dependencies and extraction plan

---

### Priority 2: Implement Selection System (4-5 hours)

**Goal:** Enable click-to-select individual polyhedra/instances with visual feedback

**CRITICAL:** This is blocking all further progress. Without selection, we cannot:
- Distinguish Forms (templates at origin) from Instances (deposited snapshots)
- Edit individual objects without affecting everything globally
- Implement delete functionality
- Track state properly
- Have a functional Forms/Instances workflow

**Tasks:**

#### 2.1: Click-to-Select Raycasting
```javascript
/**
 * Handle canvas click for object selection
 * Add to ARTexplorer.html (inline for now, extract later)
 */
function onCanvasClick(event) {
  // Prevent selection during gumball drag operations
  if (isDragging) return;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Convert mouse position to normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Check for polyhedra hits (all groups with userData.polyhedronType)
  const selectableObjects = [];
  scene.traverse(obj => {
    if (obj.userData && obj.userData.polyhedronType) {
      selectableObjects.push(obj);
    }
  });

  const intersects = raycaster.intersectObjects(selectableObjects, true);

  if (intersects.length > 0) {
    // Find parent group (traverse up from mesh to group)
    let hitObject = intersects[0].object;
    while (hitObject.parent && !hitObject.userData.polyhedronType) {
      hitObject = hitObject.parent;
    }

    selectPolyhedron(hitObject);
  } else {
    // Clicked empty space - deselect all
    deselectAll();
  }
}

// Attach listener
renderer.domElement.addEventListener('click', onCanvasClick);
```

#### 2.2: Visual Selection Highlight
```javascript
/**
 * Highlight selected polyhedron with emissive glow
 */
let currentSelection = null;

function selectPolyhedron(polyhedron) {
  // Deselect previous
  if (currentSelection) {
    clearHighlight(currentSelection);
  }

  // Highlight new selection
  currentSelection = polyhedron;
  applyHighlight(polyhedron);

  console.log(`✅ Selected: ${polyhedron.userData.polyhedronType}`);
}

function applyHighlight(polyhedron) {
  polyhedron.traverse(mesh => {
    if (mesh.isMesh) {
      // Store original emissive for restoration
      mesh.userData.originalEmissive = mesh.material.emissive.clone();
      mesh.userData.originalEmissiveIntensity = mesh.material.emissiveIntensity;

      // Apply blue glow
      mesh.material.emissive.setHex(0x4a9eff);
      mesh.material.emissiveIntensity = 0.3;
    }
  });
}

function clearHighlight(polyhedron) {
  polyhedron.traverse(mesh => {
    if (mesh.isMesh && mesh.userData.originalEmissive) {
      mesh.material.emissive.copy(mesh.userData.originalEmissive);
      mesh.material.emissiveIntensity = mesh.userData.originalEmissiveIntensity;
    }
  });
}

function deselectAll() {
  if (currentSelection) {
    clearHighlight(currentSelection);
    currentSelection = null;
  }
  console.log('✅ Deselected all');
}
```

#### 2.3: Integrate Selection with Gumball
```javascript
/**
 * Modify getSelectedPolyhedra() to return ONLY currently selected object
 * Replace the TEMPORARY workaround that selects all visible polyhedra
 */
function getSelectedPolyhedra() {
  // Return only the currently selected polyhedron
  if (currentSelection) {
    return [currentSelection];
  }
  return [];
}
```

**Testing Checklist:**
- [ ] Click on hexahedron → hexahedron glows blue, becomes selected
- [ ] Click on dual tetrahedron → tetrahedron glows, hexahedron deselects
- [ ] Click on empty space → all deselect, no glow
- [ ] Activate Move tool on selected object → only selected object moves
- [ ] Deactivate Move tool → glow persists (selection separate from tool state)
- [ ] Multiple clicks on same object → remains selected (no toggle)

**Deliverable:** Working click-to-select with visual feedback, only selected objects move

---

### Priority 3: Implement StateManager (3-4 hours)

**Goal:** Create `rt-state-manager.js` module following TEUI/OBJECTIVE pattern

**Why Critical:**
- Without StateManager, we cannot distinguish Forms from Instances
- Cannot track deposited instances for delete/undo/redo
- Cannot export/import sessions
- Cannot implement proper NOW button workflow

**Tasks:**

#### 3.1: Create rt-state-manager.js Module
```javascript
/**
 * rt-state-manager.js
 * State management for ART Gumball system
 * Following TEUI/OBJECTIVE StateManager pattern
 */

export const RTStateManager = {
  // Forms registry (templates - always at origin)
  forms: {
    tetrahedron: { type: 'tetrahedron', name: 'Tetrahedron' },
    cube: { type: 'cube', name: 'Hexahedron' },
    octahedron: { type: 'octahedron', name: 'Octahedron' },
    icosahedron: { type: 'icosahedron', name: 'Icosahedron' },
    dodecahedron: { type: 'dodecahedron', name: 'Dodecahedron' },
    dualTetrahedron: { type: 'dualTetrahedron', name: 'Dual Tetrahedron' }
  },

  // Active Form (currently being transformed, NOT yet deposited)
  activeForm: null,

  // Deposited Instances (all "Nows" - immutable snapshots)
  instances: [],

  // Selection state
  selection: {
    type: null,      // 'form' or 'instance'
    id: null,        // Instance ID or null for Form
    object: null     // THREE.Object3D reference
  },

  // Undo/Redo stacks
  history: {
    undoStack: [],
    redoStack: [],
    maxHistory: 50
  },

  // Gumball state
  gumball: {
    tool: null,           // 'move', 'scale', 'rotate', or null
    editingBasis: null,   // THREE.Group for localized gumball
    visible: false
  }
};

/**
 * Create Instance from current transform state
 */
export function createInstance(polyhedronGroup, scene) {
  const instance = {
    id: generateUUID(),
    timestamp: Date.now(),
    type: polyhedronGroup.userData.polyhedronType,
    transform: {
      position: {
        cartesian: {
          x: polyhedronGroup.position.x,
          y: polyhedronGroup.position.y,
          z: polyhedronGroup.position.z
        }
      },
      rotation: {
        euler: {
          x: polyhedronGroup.rotation.x,
          y: polyhedronGroup.rotation.y,
          z: polyhedronGroup.rotation.z
        }
      },
      scale: {
        x: polyhedronGroup.scale.x,
        y: polyhedronGroup.scale.y,
        z: polyhedronGroup.scale.z
      }
    },
    threeObject: polyhedronGroup.clone() // Deep clone for independence
  };

  // Add to instances array
  RTStateManager.instances.push(instance);

  // Add to scene
  scene.add(instance.threeObject);

  // Add to undo stack
  addToHistory({ action: 'create', instance });

  console.log(`✅ Instance created: ${instance.type} #${RTStateManager.instances.length}`);

  return instance;
}

/**
 * Delete Instance by ID
 */
export function deleteInstance(instanceId, scene) {
  const index = RTStateManager.instances.findIndex(i => i.id === instanceId);
  if (index === -1) return;

  const instance = RTStateManager.instances[index];

  // Remove from scene
  scene.remove(instance.threeObject);

  // Remove from array
  RTStateManager.instances.splice(index, 1);

  // Add to undo stack
  addToHistory({ action: 'delete', instance, index });

  console.log(`✅ Instance deleted: ${instance.type}`);
}

/**
 * Generate UUID for instances
 */
function generateUUID() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Add action to undo stack
 */
function addToHistory(action) {
  RTStateManager.history.undoStack.push(action);
  RTStateManager.history.redoStack = []; // Clear redo on new action

  // Limit history size
  if (RTStateManager.history.undoStack.length > RTStateManager.history.maxHistory) {
    RTStateManager.history.undoStack.shift();
  }
}
```

#### 3.2: Integrate StateManager with NOW Button
```javascript
/**
 * Update NOW button to use StateManager
 * ARTexplorer.html
 */
document.getElementById('now-btn').addEventListener('click', () => {
  const selectedPolyhedra = getSelectedPolyhedra();

  if (selectedPolyhedra.length === 0) {
    console.warn('⚠️ No polyhedra selected - cannot deposit instance');
    return;
  }

  // Deposit each selected polyhedron as instance
  selectedPolyhedra.forEach(poly => {
    const instance = createInstance(poly, scene);

    // Update counter
    document.getElementById('now-count').textContent = RTStateManager.instances.length;
  });
});
```

**Testing Checklist:**
- [ ] Import rt-state-manager.js into ARTexplorer.html
- [ ] Select polyhedron, move it, click NOW → instance created and tracked
- [ ] Instance counter increments correctly
- [ ] Multiple NOW clicks → multiple instances at same/different positions
- [ ] Instances persist in scene independently
- [ ] Console logs show instance creation with unique IDs

**Deliverable:** Functional StateManager tracking all instances with NOW button integration

---

### Priority 4: Forms vs Instances Workflow (2-3 hours)

**Goal:** Implement proper separation between Forms (templates at origin) and Instances (deposited snapshots)

**Current Problem:**
- When a polyhedron is moved and deposited via NOW, it remains in the moved position
- The "Form" (template) should reset to origin after deposition
- User should be able to create multiple instances from same Form without interference

**Proposed Workflow:**

#### 4.1: Reset Form After Instance Creation
```javascript
/**
 * After depositing instance, reset Form to origin
 */
function depositAndResetForm(formGroup, scene) {
  // Create instance at current transform
  const instance = createInstance(formGroup, scene);

  // Reset Form to origin
  formGroup.position.set(0, 0, 0);
  formGroup.rotation.set(0, 0, 0);
  formGroup.scale.set(1, 1, 1);

  // Update coordinate inputs
  updateCoordinateInputs(formGroup);

  console.log(`✅ Form reset to origin, instance deposited`);

  return instance;
}
```

#### 4.2: Mark Forms vs Instances in userData
```javascript
/**
 * When creating polyhedra groups in initScene()
 */
cubeGroup.userData.isForm = true;         // Template at origin
cubeGroup.userData.polyhedronType = 'cube';

// When depositing instance
instance.threeObject.userData.isForm = false;  // Deposited snapshot
instance.threeObject.userData.instanceId = instance.id;
```

#### 4.3: Selection Logic Differentiates Forms vs Instances
```javascript
/**
 * Update selectPolyhedron to track selection type
 */
function selectPolyhedron(polyhedron) {
  // ... existing highlight code ...

  // Update StateManager selection
  if (polyhedron.userData.isForm) {
    RTStateManager.selection = {
      type: 'form',
      id: null,
      object: polyhedron
    };
    console.log(`✅ Form selected: ${polyhedron.userData.polyhedronType}`);
  } else {
    RTStateManager.selection = {
      type: 'instance',
      id: polyhedron.userData.instanceId,
      object: polyhedron
    };
    console.log(`✅ Instance selected: ${polyhedron.userData.instanceId}`);
  }
}
```

**Testing Checklist:**
- [ ] Select Form (hexahedron at origin) → marked as Form in StateManager
- [ ] Move Form to (1, 1, 1) → Form moves, origin basis stays at (0,0,0)
- [ ] Click NOW → Instance deposited at (1,1,1), Form resets to (0,0,0)
- [ ] Move Form again to (2, 2, 2) → First instance stays at (1,1,1)
- [ ] Click NOW again → Second instance at (2,2,2), Form resets to (0,0,0)
- [ ] Select first instance → marked as Instance in StateManager
- [ ] Move first instance → only that instance moves, Form stays at origin
- [ ] Forms always at origin after deposition, Instances independent

**Deliverable:** Working Forms/Instances separation with proper reset behavior

---

### Priority 5: Delete & Undo/Redo (2-3 hours) - OPTIONAL

**Goal:** Implement delete key and undo/redo keyboard shortcuts

**Only proceed if Priorities 1-4 completed and tested**

#### 5.1: Delete Key Functionality
```javascript
/**
 * Delete selected instance
 */
document.addEventListener('keydown', (event) => {
  if (event.key === 'Delete' || event.key === 'Backspace') {
    if (RTStateManager.selection.type === 'instance') {
      deleteInstance(RTStateManager.selection.id, scene);

      // Clear selection
      deselectAll();

      // Update counter
      document.getElementById('now-count').textContent = RTStateManager.instances.length;
    } else {
      console.warn('⚠️ Cannot delete Forms (templates), only Instances');
    }
  }
});
```

#### 5.2: Undo/Redo Implementation
```javascript
/**
 * Undo last action
 */
function undo(scene) {
  if (RTStateManager.history.undoStack.length === 0) return;

  const action = RTStateManager.history.undoStack.pop();

  switch (action.action) {
    case 'create':
      // Remove instance
      const index = RTStateManager.instances.findIndex(i => i.id === action.instance.id);
      if (index !== -1) {
        scene.remove(RTStateManager.instances[index].threeObject);
        RTStateManager.instances.splice(index, 1);
      }
      break;

    case 'delete':
      // Re-add instance
      RTStateManager.instances.splice(action.index, 0, action.instance);
      scene.add(action.instance.threeObject);
      break;
  }

  RTStateManager.history.redoStack.push(action);
  console.log(`✅ Undo: ${action.action}`);
}

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', (event) => {
  // Cmd+Z or Ctrl+Z
  if ((event.metaKey || event.ctrlKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault();
    undo(scene);
    document.getElementById('now-count').textContent = RTStateManager.instances.length;
  }

  // Cmd+Shift+Z or Ctrl+Shift+Z
  if ((event.metaKey || event.ctrlKey) && event.key === 'z' && event.shiftKey) {
    event.preventDefault();
    redo(scene);
    document.getElementById('now-count').textContent = RTStateManager.instances.length;
  }
});
```

**Deliverable:** Delete key removes instances, Cmd+Z/Ctrl+Z undo/redo working

---

### Success Criteria for Session - ✅ COMPLETED (2025-12-30)

**Minimum (Must Complete):**
1. ✅ Analysis document explaining why module extraction failed
2. ✅ Click-to-select working with visual highlight
3. ✅ StateManager tracking instances
4. ✅ Forms reset to origin after NOW button pressed

**Stretch Goals (If Time Permits):**
5. ✅ Delete key functionality
6. ✅ Undo/Redo keyboard shortcuts

**Additional Improvements:**
7. ✅ Enhanced selection visibility (bright cyan glow, 0.8 intensity, 3x line width)
8. ✅ ESC key deselection
9. ✅ Click empty space to deselect
10. ✅ Fixed NOW button deselection (removes highlight glow)

**Deferred:**
- ❌ Module extraction of rt-controls.js (keep inline until selection is rock-solid)
- ❌ Scale or Rotate modes (focus on Move perfection first)

---

### Session Outcomes (2025-12-30)

**Key Commits:**
1. `acdca9f` - Feat: Implement click-to-select system with visual highlight
2. `cb8e495` - Feat: Implement RTStateManager with Forms/Instances workflow and keyboard shortcuts
3. `88d5a33` - Improve: Enhance selection visibility and fix deselection issues
4. `3eaf7ea` - Fix: Clear highlight glow when NOW button deposits instances

**Files Modified:**
- `src/geometry/ARTexplorer.html` - Selection system, StateManager integration, keyboard shortcuts
- `src/geometry/modules/rt-state-manager.js` - New module (500+ lines)
- `docs/development/Geometry documents/Module-Extraction-Analysis.md` - New analysis document

**Working Features:**
- ✅ Click to select Forms/Instances (bright cyan highlight)
- ✅ ESC or click empty space to deselect
- ✅ Move tool with WXYZ and XYZ dual coordinate systems
- ✅ NOW button deposits instances and resets Forms to origin
- ✅ Delete key removes selected Instance
- ✅ Cmd/Ctrl+Z undo, Cmd/Ctrl+Shift+Z redo
- ✅ 50-action history stack
- ✅ Export to JSON/CSV (RTStateManager methods)

**Known Issues to Refine:**
- Selection sensitivity during camera orbit (minor - acceptable for now)
- Snap modes need UI refinement (currently working but need better documentation)

---

**Status:** Session COMPLETE - All 7 priorities achieved + 3 bonus improvements
**Next Steps:**
1. Refine snap mode UI/UX
2. Add keyboard shortcut documentation to UI

---

### Session: Scale Mode Implementation (2025-12-30)

**Objective:** Implement Scale mode functionality for ART Gumball system to enable scaling of both Forms and Instances using cube handles and central sphere.

**Key Commits:**
1. `fdbfbd5` - Feat: Add Scale mode gumball functionality with cube handles
2. `fbd043f` - Fix: Increase scale sensitivity from 0.1 to 15.0 for meaningful scaling
3. [pending] - Fix: Enable scaling of selected objects (Forms and Instances)

**Files Modified:**
- `src/geometry/ARTexplorer.html` - Visual handle switching, scale dragging logic, selection-based scaling

**Implemented Features:**
- ✅ Visual handle switching: Cube handles for Scale mode, sphere handles for Move mode
- ✅ Central white sphere for uniform scaling
- ✅ Scale dragging logic with appropriate sensitivity (15.0)
- ✅ Dual coordinate system support: Quadray handles (WXYZ) and Cartesian handles (XYZ)
- ✅ Selection-based scaling: Works on both Forms at origin AND deposited Instances
- ✅ Direct THREE.js scaling: Uses `scale.set()` instead of slider manipulation
- ✅ Scale state tracking: Stores `userData.currentScale` for cumulative changes
- ✅ Reasonable bounds: Clamps scale to 0.1 - 10.0 range

**Scale Mode Workflow:**
1. User selects Form or Instance → cyan highlight appears
2. Click Scale button → arrow handles convert to cubes, central white sphere appears
3. Drag cube handle (axis-constrained) or central sphere (uniform) → object scales in real-time
4. For Forms: Sliders update to reflect scale (optional visual feedback)
5. For Instances: Direct scaling without slider interference
6. Click NOW button → deposits scaled instance to RTStateManager, resets Form to origin

**Technical Implementation:**
- **Handle Geometry**: Cubes (0.4 size, 0.5 opacity) replace spheres in Scale mode
- **Arrow Heads**: Removed in Scale mode (`headLength = 0`) for cleaner visual
- **Sensitivity**: 15.0 (vs 5.0 for Move mode) for visible scaling
- **Scale Calculation**: Percentage-based multiplier (`1 + scaleDelta * 0.01`)
- **Cumulative Scaling**: Each drag multiplies current scale by delta
- **Uniform Scaling**: All three axes scaled equally (`scale.set(s, s, s)`)

**Future Refinements (Deferred):**
- ⏳ Rational scaling steps: Align scale increments with 0.1 slider steps for rational consistency
- ⏳ Cube=Rational vs Tetrahedron=Rational: Respect which polyhedron type uses rational edge lengths
- ⏳ Snap-aware scaling: Coordinate scaling with XYZ/WXYZ snap modes (0.100 steps)
- ⏳ Non-uniform scaling: Per-axis deformations (stretch/compress along individual axes)
- ⏳ Scale visualization: Display current scale value near gumball during drag

**Known Limitations:**
- Current implementation uses continuous floating-point scale multipliers rather than rational 0.1 steps
- Slider synchronization for Forms uses base edge lengths (1.4142 for cube, 2.0 for tet) - may need refinement
- No visual feedback of current scale value during drag (console only)

**Note:** The Scale mode now works correctly on both Forms and Instances. The rational scaling refinement is intentionally deferred to maintain clean, working code. When we return to implement rational scaling, we should:
1. Quantize scale deltas to 0.1 increments
2. Respect Cube=Rational vs Tetrahedron=Rational edge length conventions
3. Ensure scale steps align with XYZ/WXYZ snap grid intervals
4. Maintain algebraic precision throughout scaling operations

---

**Status:** Scale Mode FUNCTIONAL - Basic scaling complete, rational refinements deferred
**Next Steps:**
1. Return to rational scaling implementation (coordinate with snap modes)
2. Add Rotate mode functionality
3. Consider per-axis (non-uniform) scaling with deformation controls
3. Consider Scale and Rotate modes after Move is perfected
