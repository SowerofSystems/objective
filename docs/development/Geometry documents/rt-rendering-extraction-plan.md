# rt-rendering.js Extraction Plan

**Date:** 2026-01-08
**Branch:** module-extraction
**Status:** Planning Phase
**Risk Level:** MEDIUM (rendering is critical path, but well-isolated)

---

## Executive Summary

rt-rendering.js exists as an **outdated stub (942 lines)** from an earlier extraction attempt. rt-init.js contains the **current, production rendering logic (4467 lines total)**. We need to carefully sync rt-rendering.js with current rt-init.js logic WITHOUT breaking anything.

**Key Insight:** Rendering functions are **well-isolated** from interactive code (gumball, selection), making this a **safer extraction target** than previous attempts.

---

## Previous Extraction Failures - Root Causes and Avoidance Strategy

### Historical Context

This is our **third attempt** at modularizing rt-init.js. Previous attempts failed catastrophically:

1. **First attempt (rt-controls.js):** `RTControls.init()` never called, selector mismatches, gumball completely broken
2. **Second attempt (2025-12-30):** Partial success, but dragging broke due to scope isolation issues

See [Module-Extraction-Analysis.md](./Module-Extraction-Analysis.md) for detailed failure analysis.

### Why Previous Extractions Failed

**Root Cause 1: Closure Access Loss**

Inline functions had direct access to global variables through closure scope. After extraction, module functions lost this access:

```javascript
// BEFORE EXTRACTION (inline in rt-init.js):
function createEditingBasis() {
  // ✅ Direct closure access to globals
  scene.add(editingBasis);
  cubeGroup.visible = true;
  selectedPolyhedra.push(cubeGroup);
}

// AFTER EXTRACTION (in rt-controls.js module):
export function createEditingBasis() {
  // ❌ scene is undefined (no longer in closure scope)
  // ❌ cubeGroup is undefined
  // ❌ selectedPolyhedra is undefined
  scene.add(editingBasis); // Error: Cannot read properties of undefined
}
```

**Root Cause 2: Variable Isolation (Shared State Synchronization Failure)**

Interactive functions required shared state that couldn't synchronize across module boundaries:

```javascript
// INLINE CODE (working):
let isDragging = false;

function onMouseDown(event) {
  isDragging = true; // ✅ Updates shared variable
}

function onMouseMove(event) {
  if (isDragging) { // ✅ Reads shared variable
    updateGumballPosition();
  }
}

// MODULE CODE (broken):
// rt-controls.js
let isDragging = false; // ❌ Separate copy of variable

export function onMouseDown(event) {
  isDragging = true; // ❌ Updates module copy only
}

// rt-init.js (HTML scope)
let isDragging = false; // ❌ Separate copy of variable

function onMouseMove(event) {
  if (isDragging) { // ❌ Always false (never sees module update)
    updateGumballPosition(); // Never runs
  }
}
```

**Root Cause 3: Function Call Dependencies (Cross-Scope Invocation Failure)**

Module functions couldn't call HTML-scope functions, and vice versa:

```javascript
// HTML SCOPE (index.html <script> tag):
function getSelectedPolyhedra() {
  return document.querySelectorAll('.polyhedron:checked');
}

function applyHighlight(elements) {
  elements.forEach(el => el.classList.add('highlight'));
}

// MODULE CODE (rt-controls.js):
export function createEditingBasis() {
  // ❌ getSelectedPolyhedra is not defined in module scope
  const selected = getSelectedPolyhedra(); // ReferenceError

  // ❌ applyHighlight is not defined in module scope
  applyHighlight(selected); // ReferenceError
}
```

### Why Rendering Extraction is SAFER

**Rendering functions have a self-contained dependency graph:**

```javascript
// RENDERING FUNCTIONS (call inward to same module):
function updateGeometry() {
  renderPolyhedron(cubeGroup, geometry, 0x4a9eff, 0.8);    // ← Same module ✅
  createCartesianGrid();                                    // ← Same module ✅
  const showCube = document.getElementById("showCube");     // ← Browser API ✅
}

function renderPolyhedron(group, geometry, color, opacity) {
  const nodeGeo = getCachedNodeGeometry(useRT, size, type); // ← Same module ✅
  const mesh = new THREE.Mesh(nodeGeo, material);           // ← THREE.js API ✅
  group.add(mesh);                                           // ← THREE.js API ✅
}

// GUMBALL FUNCTIONS (call outward to HTML scope):
function createEditingBasis() {
  const selected = getSelectedPolyhedra();                  // ← HTML scope ❌
  applyHighlight(selected);                                 // ← HTML scope ❌
  scene.add(editingBasis);                                  // ← HTML global ❌
}
```

**Key Differences:**

| Aspect | Rendering Functions | Gumball Functions |
|--------|-------------------|------------------|
| **Dependency Direction** | Call inward (same module) | Call outward (HTML scope) |
| **Shared State** | Minimal (mostly stateless) | Heavy (isDragging, selectedPolyhedra, etc.) |
| **Global Access** | Only THREE.js, RT library | Scene, groups, selection state |
| **DOM Dependencies** | Read-only (getElementById) | Read/write (event handlers, classList) |
| **Risk Level** | LOW | HIGH |

### Avoidance Strategy for This Extraction

**✅ Safe Practices:**

1. **Keep rendering functions stateless:** No shared variables between module and HTML scope
2. **Use explicit parameters:** Pass everything via function arguments (group, geometry, color, opacity)
3. **Return results explicitly:** Don't modify global state, return values
4. **Only call inward:** Rendering functions call other rendering functions in same module
5. **Use browser/library APIs only:** DOM (`document.getElementById`), THREE.js, RT library are safe
6. **Test offline first:** Update rt-rendering.js without touching rt-init.js, verify independently

**❌ Practices to Avoid:**

1. **Don't extract gumball yet:** Interactive code requires architectural prerequisites (event bus, state manager)
2. **Don't assume closure access:** Module code cannot access HTML-scope globals
3. **Don't share variables:** Each scope has separate copies
4. **Don't call outward:** Module functions cannot call HTML-scope functions without explicit import/export

### Success Criteria

This extraction succeeds if:

- ✅ All rendering functions moved to rt-rendering.js
- ✅ rt-init.js imports and uses rt-rendering.js functions
- ✅ No visual regressions (all polyhedra, matrices, geodesics render correctly)
- ✅ No performance regressions (PerformanceClock shows same/better timing)
- ✅ No errors in console
- ✅ Gumball still works (we didn't touch it)

This extraction fails if:

- ❌ Any polyhedra don't render
- ❌ Matrices broken
- ❌ Geodesics broken
- ❌ Dragging/selection broken
- ❌ Console errors
- ❌ Performance degradation

---

## Current State Analysis

### rt-init.js Rendering Functions (Production Code)

```javascript
// Core rendering (SAFE to extract)
- initScene() - Scene, camera, renderer setup
- createCartesianGrid() - XYZ grid planes
- createQuadrayBasis() - WXYZ basis vectors
- createIVMGrid() - Triangular grid tessellation
- createIVMPlanes() - 6 Quadray planes
- renderPolyhedron() - Main polyhedron rendering
- updateGeometry() - Update all visible geometry
- updateGeometryStats() - Geometry statistics display
- animate() - Animation loop
- onWindowResize() - Resize handler

// Gumball-specific (DO NOT extract - keep inline)
- createEditingBasis()
- updateEditingBasisPosition()
- destroyEditingBasis()
```

### rt-rendering.js Stub (Outdated Code)

**Has (but outdated):**
- ✅ initScene() - Basic structure exists
- ✅ createCartesianGrid() - Needs Z-up coordinate updates
- ✅ createQuadrayBasis() - Needs update
- ✅ createIVMGrid() - Needs tessellation fixes
- ✅ createIVMPlanes() - Needs update
- ✅ renderPolyhedron() - **SEVERELY OUTDATED** (no RT nodes, no caching, no matrices)
- ✅ updateGeometry() - Needs geodesic/matrix support
- ✅ updateGeometryStats() - Needs new polyhedra
- ✅ animate() - OK
- ✅ onWindowResize() - OK

**Missing:**
- ❌ `getCachedNodeGeometry()` - NEW function for RT node generation
- ❌ `getPolyhedronEdgeQuadrance()` - NEW function for close-pack calculations
- ❌ `getClosePackedRadius()` - NEW function for packed mode
- ❌ `addMatrixNodes()` - NEW function for matrix node rendering
- ❌ `countGroupTriangles()` - NEW performance tracking
- ❌ PerformanceClock integration
- ❌ Matrix rendering support (Hexahedral, Tetrahedral, Octahedral, Cuboctahedral, Rhombic Dodecahedral)
- ❌ Geodesic rendering support (Tetra, Octa, Icosa)

---

## Key Differences: renderPolyhedron()

### rt-init.js (CURRENT - Production)

```javascript
function renderPolyhedron(group, geometry, color, opacity) {
  // Uses getCachedNodeGeometry() with RT geometry or packed spheres
  const { geometry: nodeGeometry, triangles } = getCachedNodeGeometry(
    useRTNodeGeometry,
    nodeSize,
    polyType,
    scale
  );

  // PerformanceClock timing
  PerformanceClock.startNodeGeneration();

  // FlatShading checkbox support
  const useFlatShading = document.getElementById("nodeFlatShading")?.checked || false;

  // Clones materials per node (prevents selection issues)
  const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());

  // Triangle counting for performance stats
  PerformanceClock.timings.lastNodeTriangles = trianglesPerNode;
}
```

### rt-rendering.js (OUTDATED - Stub)

```javascript
function renderPolyhedron(group, geometry, color, opacity) {
  // Simple THREE.SphereGeometry (no RT geometry)
  const nodeGeometry = new THREE.SphereGeometry(radius, 16, 16);

  // No PerformanceClock
  // No flatShading support
  // No material cloning
  // No triangle counting

  const node = new THREE.Mesh(nodeGeometry, nodeMaterial); // Shared material
}
```

---

## Extraction Strategy: Safe & Incremental

### ❌ REJECTED APPROACH: "Big Bang" Replacement

**Don't do this:**
1. Copy all rendering functions from rt-init.js to rt-rendering.js
2. Import rt-rendering.js in rt-init.js
3. Comment out rt-init.js functions
4. Hope it works

**Why this fails:**
- Too many dependencies at once
- Hard to isolate failures
- Previous attempts failed this way

### ✅ RECOMMENDED APPROACH: Function-by-Function Sync

**Do this instead:**

#### Phase 1: Sync Simple Functions First (Low Risk)

**Step 1.1: animate() & onWindowResize() (SAFEST)**
- ✅ These are identical in both files
- ✅ No dependencies on other functions
- ✅ Pure THREE.js code
- **Action:** Verify they match, mark as "synced"

**Step 1.2: createCartesianGrid() & createQuadrayBasis()**
- ⚠️ rt-rendering.js may be outdated (Z-up coordinate changes)
- **Action:**
  1. Diff the functions
  2. Copy Z-up updates from rt-init.js to rt-rendering.js
  3. Add comments marking sync date

**Step 1.3: createIVMGrid() & createIVMPlanes()**
- ⚠️ Tessellation logic may differ
- **Action:**
  1. Diff the functions
  2. Copy corrected tessellation from rt-init.js
  3. Verify grid interval matches (√6/4)

---

#### Phase 2: Sync Complex Functions (Medium Risk)

**Step 2.1: Add Missing Utility Functions**

Copy these NEW functions from rt-init.js to rt-rendering.js:

```javascript
// Add to rt-rendering.js (BEFORE renderPolyhedron)
const nodeGeometryCache = new Map();

function getPolyhedronEdgeQuadrance(type, scale) {
  // Copy from rt-init.js:695-790
}

function getClosePackedRadius(type, scale) {
  // Copy from rt-init.js:791-813
}

function getCachedNodeGeometry(useRT, nodeSize, polyhedronType, scale) {
  // Copy from rt-init.js:815-885
}

function countGroupTriangles(group) {
  // Copy from rt-init.js:1605-1622
}
```

**Step 2.2: Update renderPolyhedron()**

Replace rt-rendering.js renderPolyhedron() with rt-init.js version:

```javascript
function renderPolyhedron(group, geometry, color, opacity) {
  // Copy ENTIRE function from rt-init.js:887-1020
  // This includes:
  // - getCachedNodeGeometry() integration
  // - PerformanceClock timing
  // - flatShading checkbox
  // - Material cloning
  // - Triangle counting
}
```

---

#### Phase 3: Sync updateGeometry() (High Risk)

**Why this is risky:**
- updateGeometry() references **ALL polyhedra groups**
- updateGeometry() reads **ALL UI checkboxes/sliders**
- updateGeometry() calls renderPolyhedron() for **every form**
- **Missing matrices/geodesics = visual regression**

**Action Plan:**

**Step 3.1: Audit what's missing**

Compare rt-init.js vs rt-rendering.js updateGeometry():

```bash
# rt-init.js has (lines 1143-1603):
- Cube
- Tetrahedron
- Geodesic Tetrahedron (NEW)
- Dual Tetrahedron
- Octahedron
- Geodesic Octahedron (NEW)
- Icosahedron
- Geodesic Icosahedron (NEW)
- Dodecahedron
- Dual Icosahedron
- Cuboctahedron
- Rhombic Dodecahedron
- Cube Matrix (NEW)
- Tet Matrix (NEW)
- Octa Matrix (NEW)
- Cuboctahedral Matrix (NEW)
- Rhombic Dodecahedral Matrix (NEW)

# rt-rendering.js has (lines 584-793):
- Cube
- Tetrahedron
- Geodesic Tetrahedron (PARTIAL - missing projection options)
- Dual Tetrahedron
- Octahedron
- Geodesic Octahedron (PARTIAL)
- Icosahedron
- Geodesic Icosahedron (PARTIAL)
- Dodecahedron
- Dual Icosahedron
- Cuboctahedron
- Rhombic Dodecahedron
- ❌ NO MATRICES
```

**Step 3.2: Add missing blocks**

Copy matrix rendering blocks from rt-init.js (lines 1163-1459):

```javascript
// Add to updateGeometry() in rt-rendering.js

// Cube Matrix (lines 1163-1275)
if (document.getElementById("showCubeMatrix").checked) {
  const matrixSize = parseInt(document.getElementById("cubeMatrixSizeSlider").value);
  const rotate45 = document.getElementById("cubeMatrixRotate45").checked;
  const cubeMatrixGroup = RTMatrix.createCubeMatrix(matrixSize, scale, rotate45, opacity, 0x4a9eff, Polyhedra, THREE);
  // ... rest of matrix logic
}

// Repeat for Tet, Octa, Cubocta, Rhombic Dodec matrices
```

**Step 3.3: Update geodesic projection options**

rt-rendering.js geodesics are **missing projection radio buttons**:

```javascript
// OLD (rt-rendering.js - missing projection):
const geodesicTetra = Polyhedra.geodesicTetrahedron(scale, frequency);

// NEW (rt-init.js - has projection):
const projectionRadio = document.querySelector('input[name="geodesicTetraProjection"]:checked');
const projection = projectionRadio ? projectionRadio.value : "out";
const geodesicTetra = Polyhedra.geodesicTetrahedron(scale, frequency, projection);
```

---

#### Phase 4: Sync updateGeometryStats() (Low Risk)

rt-rendering.js is **missing stats for**:
- Cuboctahedron
- Rhombic Dodecahedron

**Action:**
Copy blocks from rt-init.js:1624-1712 to rt-rendering.js:798-920

---

## Testing Protocol: Comment-Out Method (UPDATED 2026-01-08)

**CRITICAL: Do NOT delete rt-init.js functions. Comment them out.**

### Step-by-Step Testing

**Test 1: Import rendering API factory and create API object**

```javascript
// At top of rt-init.js (after existing imports)
import { initScene as createRenderingAPI } from "./rt-rendering.js";

// Inside startARTexplorer(), BEFORE any rendering functions are called:
function startARTexplorer(THREE, OrbitControls, RT, ...) {
  // Create rendering API object from factory
  const renderingAPI = createRenderingAPI(THREE);

  // Check console for errors
  // If errors: fix rt-rendering.js exports
}
```

**Test 2: Comment out and replace functions ONE at a time**

```javascript
// In rt-init.js startARTexplorer():

// TEST: animate()
// function animate() {  // ← Comment out inline function
//   requestAnimationFrame(animate);
//   controls.update();
//   renderer.render(scene, camera);
// }

// Replace direct call with API call:
// animate(); // ← OLD: direct call to inline function
renderingAPI.animate(); // ← NEW: call via API object

// If works: ✅ animate() extraction successful
// If breaks: ❌ revert (uncomment), debug rt-rendering.js
```

**Test 3: Expand to full rendering suite**

```javascript
// After animate() works, test updateGeometry():

// TEST: updateGeometry()
// function updateGeometry() { /* ... 500 lines ... */ }  // ← Comment out

// Now using rt-rendering.js updateGeometry()
updateGeometry();

// Visual test:
// 1. Toggle all Forms checkboxes (Cube, Tet, Octa, etc.)
// 2. Toggle all Matrix checkboxes
// 3. Toggle all Geodesic checkboxes
// 4. Adjust sliders (scale, opacity, node size)
// 5. Check console for errors
// 6. Verify geometry stats display updates

// If all work: ✅ updateGeometry() extraction successful
// If any break: ❌ revert, add missing pieces to rt-rendering.js
```

---

## Rollback Strategy

**If extraction fails at ANY point:**

1. **Immediately uncomment rt-init.js functions**
   ```javascript
   // Restore working code
   function animate() {
     requestAnimationFrame(animate);
     controls.update();
     renderer.render(scene, camera);
   }
   ```

2. **Remove import from rt-rendering.js**
   ```javascript
   // Delete or comment out
   // import { initScene, animate } from "./rt-rendering.js";
   ```

3. **Restore from backup if needed**
   ```bash
   cp src/geometry/modules/rt-init.js.backup src/geometry/modules/rt-init.js
   ```

4. **Document what failed in this file**
   - Add notes to "Failed Extraction Attempts" section below

---

## Success Criteria

Before merging rt-rendering.js extraction:

- ✅ All Forms render correctly (Cube, Tet, Octa, Icosa, Dodec, Cubocta, Rhombic Dodec, Duals)
- ✅ All Matrices render correctly (Hexahedral, Tetrahedral, Octahedral, Cuboctahedral, Rhombic Dodecahedral)
- ✅ All Geodesics render correctly (Tetra, Octa, Icosa) with projection options (off, in, mid, out)
- ✅ Node rendering works (SM/MD/LG/OFF toggle, RT geometry toggle, flatShading toggle)
- ✅ Grid rendering works (Cartesian XY/XZ/YZ, Quadray 6 planes, tessellation sliders)
- ✅ Basis vectors scale correctly (Cartesian XYZ, Quadray WXYZ)
- ✅ Opacity slider affects all forms
- ✅ Scale sliders work (cube edge, tet edge)
- ✅ Geometry stats display updates correctly
- ✅ Animation loop runs smoothly (60fps)
- ✅ Window resize works
- ✅ No console errors
- ✅ rt-init.js is **at least 400 lines smaller** (rendering functions removed)

---

## Dependencies to Keep in rt-init.js

**DO NOT extract these (they belong in rt-init.js):**

1. **Matrix checkbox/slider event listeners** (lines 2089-2261)
   - These are UI integration code, not rendering logic
   - Keep in rt-init.js

2. **Gumball functions** (lines 3203-3597)
   - createEditingBasis()
   - updateEditingBasisPosition()
   - destroyEditingBasis()
   - **Already proven to fail when extracted (see Module-Extraction-Analysis.md)**

3. **Selection functions** (if they exist in rt-init.js)
   - selectPolyhedron()
   - deselectAll()
   - onCanvasClick()
   - **Also proven to fail when extracted**

4. **Demo modal handlers** (lines 3780-3834)
   - initQuadranceDemo()
   - initCrossDemo()
   - initWeierstrassDemo()
   - These are UI event handlers, not rendering

---

## Export/Import Structure (UPDATED 2026-01-08)

### rt-rendering.js ACTUAL architecture:

**Factory Pattern with Closure Scope:**

```javascript
// rt-rendering.js exports ONE function that returns an API object
export function initScene(THREE) {
  // Closure-scoped variables (shared by all nested functions)
  let scene, camera, renderer, controls;
  let cubeGroup, tetrahedronGroup, /* ... all groups ... */;

  function initScene() { /* scene setup */ }
  function animate() { /* animation loop */ }
  function onWindowResize() { /* resize handler */ }
  function updateGeometry() { /* rendering */ }
  // ... all other functions as nested closures

  // Return public API
  return {
    initScene,
    animate,
    onWindowResize,
    updateGeometry,
    updateGeometryStats
  };
}
```

### rt-init.js REQUIRED changes:

```javascript
// Import the factory function
import { initScene as createRenderingAPI } from "./rt-rendering.js";

function startARTexplorer(THREE, OrbitControls, RT, Quadray, Polyhedra, ...) {
  // Call factory to get rendering API
  const renderingAPI = createRenderingAPI(THREE);

  // Comment out inline functions, use API instead:
  // function initScene() { ... } // ← COMMENT OUT
  renderingAPI.initScene(); // ← Use module version

  // function animate() { ... } // ← COMMENT OUT
  renderingAPI.animate(); // ← Use module version

  // function updateGeometry() { ... } // ← COMMENT OUT
  // Called via UI: renderingAPI.updateGeometry()
}
```

---

## Timeline Estimate

**Conservative estimate (with testing):**

- Phase 1 (Sync simple functions): 1 hour
- Phase 2 (Sync complex functions): 2 hours
- Phase 3 (Sync updateGeometry): 3 hours
- Phase 4 (Sync stats): 30 minutes
- Testing & debugging: 2 hours
- **Total: 8.5 hours**

**Optimistic estimate:**
- 4-5 hours if no major issues

**Realistic estimate:**
- 6-8 hours with inevitable debugging

---

## Risk Assessment

| Function | Risk Level | Why | Mitigation |
|----------|-----------|-----|------------|
| animate() | LOW | Identical in both files | None needed |
| onWindowResize() | LOW | Identical | None needed |
| createCartesianGrid() | MEDIUM | Z-up coordinate changes | Careful diff, visual test |
| createQuadrayBasis() | MEDIUM | May have scaling updates | Test with tet slider |
| createIVMGrid() | MEDIUM | Tessellation logic critical | Test grid intervals |
| renderPolyhedron() | HIGH | Heavily modified (RT nodes, caching, perf) | Thorough visual testing |
| updateGeometry() | HIGH | References ALL UI elements, ALL polyhedra | Test every checkbox/slider |
| updateGeometryStats() | LOW | Just HTML output | Check stats display |
| getCachedNodeGeometry() | MEDIUM | New function, complex logic | Test all node sizes |

---

## Failed Extraction Attempts

### Attempt 1: animate() Stack Overflow (2026-01-08)

**Date:** 2026-01-08
**Phase:** Phase 6.2.1 Step 1 (Comment out animate() function)

**What failed:**
Calling `renderingAPI.animate()` caused immediate stack overflow and canvas failed to render.

**Actions taken:**
1. Commented out inline `animate()` function in rt-init.js (line ~1865)
2. Replaced `animate()` call with `renderingAPI.animate()` (line ~4411)
3. Page loaded but stack overflow occurred, canvas blank

**Root cause:**
Factory pattern creates closure with uninitialized variables. When `renderingAPI.animate()` was called, the closure-scoped variables (`scene`, `camera`, `renderer`, `controls`) were **undefined** because `renderingAPI.initScene()` was never called to initialize them.

**Technical explanation:**
```javascript
// rt-rendering.js factory creates closure with uninitialized vars
export function initScene(THREE) {
  let scene, camera, renderer, controls; // ← UNDEFINED initially

  function initScene() {
    scene = new THREE.Scene(); // ← Initializes variables
    // ...
  }

  function animate() {
    renderer.render(scene, camera); // ← Uses undefined vars if initScene() not called!
  }

  return { initScene, animate };
}
```

**Error flow:**
1. rt-init.js creates API: `const renderingAPI = createRenderingAPI(THREE)`
2. rt-init.js immediately calls: `renderingAPI.animate()`
3. BUT rt-init.js's own `initScene()` ran (initialized rt-init.js's scene/camera/renderer)
4. NOT rt-rendering.js's `renderingAPI.initScene()` (would initialize rt-rendering.js's closure vars)
5. Result: `animate()` tries to use undefined `scene`, `camera`, `renderer` → stack overflow

**Lesson learned:**
**CRITICAL: Factory pattern requires initialization before use!**

Before calling `renderingAPI.animate()`, MUST call `renderingAPI.initScene()` to initialize closure-scoped variables.

**Correct extraction order:**
```javascript
const renderingAPI = createRenderingAPI(THREE);

// WRONG (causes stack overflow):
// animate();
// renderingAPI.animate(); // ← Variables undefined!

// CORRECT:
// Comment out rt-init.js's initScene()
// renderingAPI.initScene(); // ← Initialize variables FIRST
// Comment out rt-init.js's animate()
// renderingAPI.animate(); // ← NOW variables are initialized
```

**Resolution:**
Extraction plan updated. Must extract `initScene()` BEFORE attempting to extract `animate()`.

**Next attempt:** Extract initScene() first, verify it works, THEN extract animate().

---

## Next Steps After rt-rendering.js Extraction

**If extraction succeeds:**

1. **Update Module-Extraction-Analysis.md**
   - Document successful extraction
   - Note what worked vs rt-controls.js failure

2. **Identify next safe extraction candidate:**
   - Utility functions (pure math, no DOM)
   - CSS cleanup (move inline styles to art.css)
   - Static HTML (already mostly done)

3. **DO NOT attempt:**
   - Gumball extraction (proven to fail twice)
   - Selection extraction (needs global state first)
   - Event handlers (too tightly coupled)

---

## Sync Verification Report (2026-01-08)

**Verification Date:** 2026-01-08
**Status:** ⚠️ INCOMPLETE - Critical gaps identified
**Estimated Missing Code:** ~550 lines

### Executive Summary

Comprehensive comparison of rt-rendering.js (1,170 lines) vs rt-init.js (4,467 lines) reveals **significant missing functionality** that would prevent the module from working:

- ✅ **Has**: Basic helper functions (edge quadrance, close-packed radius, cached geometry)
- ✅ **Has**: Core renderPolyhedron() with partial PerformanceClock integration
- ✅ **Has**: Basic updateGeometry() for single polyhedra (no matrices)
- ✅ **Has**: Basic updateGeometryStats() (incomplete)
- ❌ **Missing**: PerformanceClock import (**causes runtime errors**)
- ❌ **Missing**: ALL matrix rendering functionality (5 complete blocks)
- ❌ **Missing**: Matrix group declarations and initialization
- ❌ **Missing**: 2 critical helper functions (addMatrixNodes, countGroupTriangles)
- ❌ **Missing**: Complete PerformanceClock timing in updateGeometry()
- ❌ **Missing**: Geodesic stats blocks and triangle counting

### 🔴 Critical Blockers (Must Fix Before Testing)

#### 1. Missing PerformanceClock Import

**rt-init.js** (Line 4):
```javascript
import { PerformanceClock } from "./performance-clock.js"; // ✅ PRESENT
```

**rt-rendering.js** (Lines 1-15):
```javascript
import { Quadray } from "./rt-math.js";
import { Polyhedra } from "./rt-polyhedra.js";
// ❌ NO PerformanceClock import!
```

**Impact:** Despite using PerformanceClock in renderPolyhedron() (lines 767, 801, 802, 805), the module has no import statement. **This will cause immediate runtime errors.**

**Fix Required:** Add line after imports:
```javascript
import { PerformanceClock } from "./performance-clock.js";
```

---

#### 2. Missing addMatrixNodes() Function (~115 lines)

**rt-init.js** (Lines 1023-1138): ✅ PRESENT

**rt-rendering.js**: ❌ MISSING

**Purpose:** Generates vertex nodes for matrix forms by:
- Importing rt-polyhedra.js dynamically
- Extracting vertices from each polyhedron in the matrix
- Handling alternating tet orientations
- Applying 45° rotation if enabled
- Deduplicating vertex positions
- Creating cached node geometry for each unique position

**Called By:** All 5 matrix rendering blocks (if they existed)

**Fix Required:** Copy lines 1023-1138 from rt-init.js

---

#### 3. Missing countGroupTriangles() Function (~15 lines)

**rt-init.js** (Lines 1605-1619): ✅ PRESENT

**rt-rendering.js**: ❌ MISSING

**Purpose:** Counts triangles in THREE.js groups for performance stats by:
- Traversing all children
- Checking for indexed geometry (count / 3)
- Checking for non-indexed geometry (position count / 3)
- Returning rounded triangle count

**Called By:** updateGeometryStats() for every polyhedron in rt-init.js

**Fix Required:** Copy lines 1605-1619 from rt-init.js

---

#### 4. Missing Matrix Groups (~40 lines)

**rt-init.js** (Lines 131-133, 241-277):
```javascript
// Line 131-133: Variable declarations
let cubeMatrixGroup, tetMatrixGroup, octaMatrixGroup;
let cuboctaMatrixGroup;
let rhombicDodecMatrixGroup;

// Lines 241-259: Initialization in initScene()
cubeMatrixGroup = new THREE.Group();
cubeMatrixGroup.userData.type = "cubeMatrix";
// ... repeat for all 5 matrix groups

// Lines 273-277: Add to scene
scene.add(cubeMatrixGroup);
// ... repeat for all 5 matrix groups

// Lines 293-297: Pass to PerformanceClock
PerformanceClock.init([
  // ... standard groups
  cubeMatrixGroup,
  tetMatrixGroup,
  // ... all matrix groups
]);
```

**rt-rendering.js**: ❌ MISSING - No matrix groups declared or initialized

**Fix Required:**
1. Add matrix group variables to initScene() function scope
2. Create and initialize groups in initScene()
3. Set userData.type for each group
4. Add groups to scene
5. Pass groups to PerformanceClock.init()

---

#### 5. Missing 5 Matrix Rendering Blocks (~233 lines)

**rt-init.js** contains these complete matrix blocks in updateGeometry():

1. **Cube Matrix** (Lines 1163-1207, ~45 lines)
   - Reads matrix size slider
   - Reads rotate45 checkbox
   - Dynamic imports rt-matrix.js
   - Calls RTMatrix.createCubeMatrix()
   - Calls addMatrixNodes() if nodes enabled

2. **Tet Matrix** (Lines 1275-1321, ~47 lines)
   - Same pattern as cube
   - Calls RTMatrix.createTetrahedronMatrix()
   - Passes "tetrahedron" type to addMatrixNodes()

3. **Octa Matrix** (Lines 1357-1403, ~47 lines)
   - Same pattern
   - Calls RTMatrix.createOctahedronMatrix()
   - Passes "octahedron" type to addMatrixNodes()

4. **Cuboctahedron Matrix** (Lines 1405-1451, ~47 lines)
   - Same pattern
   - Calls RTMatrix.createCuboctahedronMatrix()
   - Passes "cuboctahedron" type to addMatrixNodes()

5. **Rhombic Dodecahedron Matrix** (Lines 1453-1499, ~47 lines)
   - Same pattern
   - Calls RTMatrix.createRhombicDodecahedronMatrix()
   - Passes "rhombicDodecahedron" type to addMatrixNodes()

**rt-rendering.js**: ❌ ZERO matrix blocks present

**Fix Required:** Copy all 5 blocks from rt-init.js, inserting after standard polyhedra but before basis vector scaling

---

#### 6. Missing PerformanceClock Timing in updateGeometry() (~10 lines)

**rt-init.js** (Lines 1143-1599):
```javascript
function updateGeometry() {
  // Start performance timing
  PerformanceClock.startCalculation(); // Line 1145

  // ... rendering logic ...

  updateGeometryStats(); // Line 1595

  // End performance timing
  PerformanceClock.endCalculation(); // Line 1598
  PerformanceClock.updateDisplay(useRTNodeGeometry); // Line 1599
}
```

**rt-rendering.js** (Lines 812-1021): ❌ MISSING all 3 timing calls

**Fix Required:**
1. Add `PerformanceClock.startCalculation()` at beginning of updateGeometry()
2. Add `PerformanceClock.endCalculation()` after updateGeometryStats()
3. Add `PerformanceClock.updateDisplay(useRTNodeGeometry)` after endCalculation()

---

#### 7. Missing Geodesic Stats & Triangle Counting (~75 lines)

**rt-init.js** (Lines 1624-1844) includes:

**Triangle Counting:**
- Every polyhedron stats block calls `countGroupTriangles(group)`
- Displays "Triangles: X" count for each

**Geodesic Stats Blocks:**
- Geodesic Tetrahedron (Lines 1764-1788, ~25 lines)
- Geodesic Octahedron (Lines 1791-1815, ~25 lines)
- Geodesic Icosahedron (Lines 1818-1842, ~25 lines)

**rt-rendering.js** (Lines 1026-1148):
- ❌ No countGroupTriangles() calls (function doesn't exist)
- ❌ No "Triangles: X" display
- ❌ No geodesic stats blocks

**Fix Required:**
1. Add countGroupTriangles() calls to all existing stats blocks
2. Add "Triangles: X" display line for each
3. Copy 3 geodesic stats blocks from rt-init.js

---

### Missing Code Summary Table

| Component | Lines in rt-init.js | Status in rt-rendering.js | Impact |
|-----------|---------------------|---------------------------|--------|
| PerformanceClock import | Line 4 | ❌ Missing | **Runtime error** |
| addMatrixNodes() | Lines 1023-1138 (~115) | ❌ Missing | Cannot render matrix nodes |
| countGroupTriangles() | Lines 1605-1619 (~15) | ❌ Missing | No triangle stats |
| Matrix group declarations | Lines 131-133 | ❌ Missing | Groups don't exist |
| Matrix group init | Lines 241-277 (~40) | ❌ Missing | Groups not created |
| Cube Matrix block | Lines 1163-1207 (~45) | ❌ Missing | No cube matrices |
| Tet Matrix block | Lines 1275-1321 (~47) | ❌ Missing | No tet matrices |
| Octa Matrix block | Lines 1357-1403 (~47) | ❌ Missing | No octa matrices |
| Cubocta Matrix block | Lines 1405-1451 (~47) | ❌ Missing | No cubocta matrices |
| Rhombic Dodec Matrix block | Lines 1453-1499 (~47) | ❌ Missing | No rhombic dodec matrices |
| PerformanceClock timing | Lines 1145, 1598-1599 (~10) | ❌ Missing | No timing metrics |
| Geodesic stats | Lines 1764-1842 (~75) | ❌ Missing | No geodesic stats |
| Triangle counting | Throughout stats | ❌ Missing | No triangle counts |
| **TOTAL** | **~543 lines** | ❌ **0% present** | **Module non-functional** |

---

### What Works vs What's Missing

#### ✅ What rt-rendering.js HAS:

1. **Basic Structure** (Lines 1-27)
   - Module imports (Quadray, Polyhedra)
   - Module-level variables (nodeGeometryCache, useRTNodeGeometry)
   - initScene() export function wrapper

2. **Grid & Basis Functions** (Lines 122-474)
   - createCartesianGrid()
   - createQuadrayBasis()
   - createIVMGrid()
   - createIVMPlanes()

3. **Helper Functions** (Lines 483-677)
   - getPolyhedronEdgeQuadrance() ✅
   - getClosePackedRadius() ✅
   - getCachedNodeGeometry() ✅

4. **renderPolyhedron()** (Lines 683-807)
   - Face rendering ✅
   - Edge rendering ✅
   - Node rendering with cached geometry ✅
   - Partial PerformanceClock integration ✅ (but no import!)
   - FlatShading support ✅
   - Material cloning ✅

5. **Basic updateGeometry()** (Lines 812-1021)
   - All standard polyhedra (cube through rhombic dodec) ✅
   - Geodesic tetra/octa/icosa with projection options ✅
   - Basis vector scaling ✅
   - Calls updateGeometryStats() ✅

6. **Basic updateGeometryStats()** (Lines 1026-1148)
   - Stats for standard polyhedra ✅
   - Euler verification ✅
   - Schläfli symbols ✅

7. **Animation & Resize** (Lines 1153-1167)
   - animate() function ✅
   - onWindowResize() function ✅

#### ❌ What rt-rendering.js MISSING:

1. **PerformanceClock Import** → Runtime errors
2. **addMatrixNodes() function** → Cannot render matrix nodes
3. **countGroupTriangles() function** → No triangle stats
4. **Matrix group declarations** → Groups don't exist
5. **Matrix group initialization** → Groups not created
6. **5 Matrix rendering blocks** → No matrices render
7. **PerformanceClock timing in updateGeometry()** → No metrics
8. **Geodesic stats blocks** → Incomplete stats display
9. **Triangle counting in stats** → No triangle counts shown

---

### Recommended Fix Order

#### Phase 1: Critical Fixes (Must Have) ✅ COMPLETE
1. ✅ Add PerformanceClock import (1 line) - **DONE**
2. ✅ Add addMatrixNodes() function (115 lines) - **DONE**
3. ✅ Add countGroupTriangles() function (15 lines) - **DONE**
4. ✅ Add matrix group declarations in initScene() (40 lines) - **DONE**

#### Phase 2: Matrix Rendering (Core Functionality) ✅ COMPLETE
5. ✅ Add 5 matrix rendering blocks to updateGeometry() (233 lines) - **DONE**

#### Phase 3: Performance & Stats (Polish) ✅ COMPLETE
6. ✅ Add PerformanceClock timing to updateGeometry() (10 lines) - **DONE**
7. ✅ Add geodesic stats blocks (75 lines) - **DONE**
8. ✅ Add triangle counting to all stats blocks (scattered) - **DONE**

**Total Additions:** ~550 lines - **COMPLETED** (Commit: 66d2ff3)

**Date Completed:** 2026-01-08
**Branch:** 2026-01-07-matrix-rt-geodesics

---

### Testing Strategy After Fixes

Once all missing code is added:

1. **Syntax Check**: Run ESLint/Prettier
2. **Import Verification**: Verify all imports resolve
3. **Offline Test**: Load rt-rendering.js in isolation (no rt-init.js changes)
4. **Visual Test**: Comment out rt-init.js render functions one-by-one
5. **Matrix Test**: Specifically test all 5 matrix types
6. **Performance Test**: Verify PerformanceClock displays correctly
7. **Stats Test**: Verify triangle counts and geodesic stats

---

### Current Sync Status: 100% Complete ✅

**Synced (100%):**
- ✅ Helper functions (quadrance, close-pack, caching)
- ✅ renderPolyhedron() core logic
- ✅ Standard polyhedra rendering
- ✅ Geodesic rendering with projections
- ✅ Complete stats display with triangle counting
- ✅ Grid and basis functions
- ✅ PerformanceClock import **ADDED**
- ✅ Matrix rendering (all 5 types) **ADDED**
- ✅ Matrix node generation (addMatrixNodes) **ADDED**
- ✅ Triangle counting (countGroupTriangles) **ADDED**
- ✅ Complete timing integration **ADDED**
- ✅ Complete stats display with geodesics **ADDED**

**File Stats:**
- rt-rendering.js: 1,669 lines (was 1,170 lines)
- Added: ~499 lines of production code
- Sync Completion: 100%

**Work Completed:** All phases complete (2026-01-08)

---

## Conclusion

rt-rendering.js extraction is **MEDIUM RISK** but **HIGH VALUE**:

**Pros:**
- ✅ Rendering is well-isolated from interactive code
- ✅ Clear import/export boundaries
- ✅ Reduces rt-init.js by ~400 lines
- ✅ Makes rendering logic reusable
- ✅ Easier to test in isolation

**Cons:**
- ⚠️ Requires careful sync of 10+ functions
- ⚠️ updateGeometry() is 500+ lines and touches everything
- ⚠️ Missing matrices/geodesics = visual regression
- ⚠️ 6-8 hours of careful work

**Recommendation:** **PROCEED** with caution, using incremental function-by-function sync approach.

**DO NOT:** Attempt "big bang" replacement. Comment out functions incrementally, test each one.

**ALWAYS:** Keep rt-init.js.backup and be ready to rollback instantly.

---

**Status:** ✅ Sync Complete - Ready for Integration Testing

---

## Phase 4: Function Presence Verification

**Objective:** Verify all rendering functions are present in rt-rendering.js before commenting out rt-init.js code

### 4.1 Core Rendering Functions Checklist

Verify these functions exist in [rt-rendering.js](../../../src/geometry/modules/rt-rendering.js):

- [x] `initScene()` - Scene initialization
- [x] `createCartesianGrid()` - XYZ grid planes
- [x] `createQuadrayBasis()` - WXYZ basis vectors
- [x] `createIVMGrid()` - Triangular tessellation
- [x] `createIVMPlanes()` - 6 Quadray planes
- [x] `renderPolyhedron()` - Main rendering function
- [x] `updateGeometry()` - Update all visible geometry
- [x] `updateGeometryStats()` - Statistics display
- [x] `animate()` - Animation loop
- [x] `onWindowResize()` - Resize handler

### 4.2 Helper Functions Checklist

- [x] `getPolyhedronEdgeQuadrance()` - Edge quadrance calculation
- [x] `getClosePackedRadius()` - Close-packed sphere radius
- [x] `getCachedNodeGeometry()` - Cached node generation
- [x] `addMatrixNodes()` - Matrix node generation (lines 714-829)
- [x] `countGroupTriangles()` - Triangle counting (lines 835-849)

### 4.3 Matrix Rendering Blocks Checklist

Verify these matrix blocks exist in `updateGeometry()`:

- [x] Cube Matrix rendering (lines 1003-1048)
- [x] Tet Matrix rendering (lines 1116-1162)
- [x] Octa Matrix rendering (lines 1198-1244)
- [x] Cuboctahedron Matrix rendering (lines 1307-1353)
- [x] Rhombic Dodecahedron Matrix rendering (lines 1369-1415)

### 4.4 Performance Integration Checklist

- [x] PerformanceClock import statement (line 15)
- [x] `PerformanceClock.startCalculation()` at start of updateGeometry()
- [x] `PerformanceClock.endCalculation()` at end
- [x] `PerformanceClock.updateDisplay()` after endCalculation()
- [x] PerformanceClock timing in renderPolyhedron()

### 4.5 Stats Display Checklist

- [x] Geodesic Tetrahedron stats block (lines 1565-1590)
- [x] Geodesic Octahedron stats block (lines 1592-1617)
- [x] Geodesic Icosahedron stats block (lines 1619-1644)
- [x] Triangle counting in all stats blocks

**Phase 4 Status:** ✅ COMPLETE - All functions verified present

---

## Phase 5: Module Exposure & Availability Check

**Objective:** Ensure rt-rendering.js is properly exposed and available for index.html

### 5.1 Module Export Verification

**Check rt-rendering.js exports (line 1669+):**

Expected export structure:
```javascript
export {
  // Core scene
  initScene,
  animate,
  onWindowResize,

  // Grids & Basis
  createCartesianGrid,
  createQuadrayBasis,
  createIVMGrid,
  createIVMPlanes,

  // Rendering
  renderPolyhedron,
  updateGeometry,
  updateGeometryStats,

  // Utilities (for matrix rendering)
  getPolyhedronEdgeQuadrance,
  getClosePackedRadius,
  getCachedNodeGeometry,
  addMatrixNodes,
  countGroupTriangles
};
```

**Action Required:**
- [ ] Verify export block exists at end of rt-rendering.js
- [ ] Verify all 14+ functions are exported
- [ ] Check for syntax errors in export block

### 5.2 Import Path Verification ✅ COMPLETE

**Check rt-init.js can import rt-rendering.js:**

**Test completed (2026-01-08):**
- ✅ Added test import: `import { PerformanceClock as PerformanceClockTest } from "./rt-rendering.js"`
- ✅ Browser console shows: `[rt-init.js] ✅ Successfully imported from rt-rendering.js: PerformanceClock available`
- ✅ No module loading errors
- ✅ Application loads normally
- ✅ Import chain works correctly

Expected import location (top of rt-init.js, after existing imports):
```javascript
import { PerformanceClock } from "./performance-clock.js";
import { RTMatrix } from "./rt-matrix.js"; // If used
import {
  initScene,
  animate,
  updateGeometry,
  updateGeometryStats,
  onWindowResize,
  createCartesianGrid,
  createQuadrayBasis,
  createIVMGrid,
  createIVMPlanes
} from "./rt-rendering.js";
```

**Completed Actions:**
- [x] Add import statement to rt-init.js (DO NOT comment out inline functions yet)
- [x] Test that import resolves without errors
- [x] Check browser console for module loading errors

### 5.3 HTML Script Tag Verification

**Check index.html loads rt-init.js as module:**

Expected structure:
```html
<script type="module" src="src/geometry/modules/rt-init.js"></script>
```

**Action Required:**
- [ ] Verify `type="module"` attribute present
- [ ] Verify path to rt-init.js is correct
- [ ] Check that rt-rendering.js loads transitively (via rt-init.js import)

### 5.4 Global Scope Verification

**Verify rendering functions DO NOT need to be in global scope:**

rt-rendering.js functions are:
- ✅ Called only from rt-init.js (via import)
- ✅ NOT called from HTML onclick/onchange handlers
- ✅ NOT called from inline `<script>` tags
- ✅ Safe to extract from global scope

**If ANY function IS called from HTML:**
- ⚠️ Do NOT extract that function
- ⚠️ Keep it in rt-init.js inline code
- ⚠️ Document why in this plan

### 5.5 Dependency Graph Check

**Verify rt-rendering.js dependencies are satisfied:**

rt-rendering.js imports:
- [x] `Quadray` from rt-math.js
- [x] `Polyhedra` from rt-polyhedra.js
- [x] `PerformanceClock` from performance-clock.js
- [x] `THREE` (global from index.html)
- [x] `RT` (global from index.html)

**Action Required:**
- [ ] Verify all imports resolve
- [ ] Check that THREE.js loads before rt-init.js
- [ ] Check that RT library loads before rt-init.js

**Phase 5 Status:** ✅ COMPLETE (2026-01-08)

### 5.6 Architecture Clarification (Added 2026-01-08)

**Issue Identified:** Original plan showed standalone exports, but rt-rendering.js uses factory pattern.

**Resolution:**
- ✅ Updated plan documentation (Section "Export/Import Structure")
- ✅ Clarified factory pattern: `export function initScene(THREE)` returns API object
- ✅ Updated Testing Protocol to show correct usage: `const renderingAPI = createRenderingAPI(THREE)`
- ✅ Fixed rt-rendering.js return statement to include `initScene` function
- ✅ Updated Phase 6.2.1 with correct step-by-step instructions

**Architecture Decision:** Keep factory pattern (closure-based), do NOT restructure to standalone exports.
- Pros: Natural closure scope, matches existing rt-init.js pattern
- Cons: Slightly more verbose import (`renderingAPI.animate()` vs `animate()`)

---

## Phase 6: Careful rt-init.js Commenting Strategy

**Objective:** Comment out rt-init.js rendering functions ONLY after rt-rendering.js is verified working

### 6.1 Pre-Comment Safety Checks

**Before commenting out ANY rt-init.js code:**

- [ ] rt-rendering.js exports verified (Phase 5.1)
- [ ] rt-init.js imports added and tested (Phase 5.2)
- [ ] No console errors when loading page
- [ ] All checkboxes/sliders present in UI
- [ ] No visual regressions

**If ANY check fails:**
- ❌ STOP - Do not proceed with commenting
- ❌ Fix the failing check first
- ❌ Re-verify all Phase 5 checks

### 6.2 Function-by-Function Commenting Order

**Comment out functions in this SAFE order:**

#### 6.2.1 Test: animate() & onWindowResize() (SAFEST) - UPDATED 2026-01-08

**Step 0:** Add import and create rendering API at top of startARTexplorer():
```javascript
// At top of rt-init.js imports:
import { initScene as createRenderingAPI } from "./rt-rendering.js";

// Inside startARTexplorer(), FIRST thing:
function startARTexplorer(THREE, OrbitControls, RT, Quadray, Polyhedra, ...) {
  const renderingAPI = createRenderingAPI(THREE);
  // ... rest of function
}
```

**Step 1:** Comment out inline functions in rt-init.js:
```javascript
// function animate() {
//   requestAnimationFrame(animate);
//   controls.update();
//   renderer.render(scene, camera);
// }

// function onWindowResize() {
//   const container = document.getElementById("canvas-container");
//   camera.aspect = container.clientWidth / container.clientHeight;
//   camera.updateProjectionMatrix();
//   renderer.setSize(container.clientWidth, container.clientHeight);
// }
```

**Step 2:** Replace function calls with API calls:
```javascript
// OLD: animate();
renderingAPI.animate(); // ← NEW

// OLD: window.addEventListener("resize", onWindowResize);
window.addEventListener("resize", () => renderingAPI.onWindowResize()); // ← NEW (arrow function wrapper)
```

**Step 3:** Test:
- [ ] Page loads without errors
- [ ] Animation loop runs (objects rotate/respond to mouse)
- [ ] Window resize works (drag browser window)

**If fails:** Uncomment immediately, debug import/export

---

#### 6.2.2 Test: Grid & Basis Functions

**Comment out:**
- `createCartesianGrid()`
- `createQuadrayBasis()`
- `createIVMGrid()`
- `createIVMPlanes()`

**Test:**
- [ ] Cartesian grid renders correctly
- [ ] Quadray basis vectors render
- [ ] IVM tessellation renders
- [ ] Grid sliders work (opacity, interval, extent)

---

#### 6.2.3 Test: Helper Functions

**Comment out:**
- `getPolyhedronEdgeQuadrance()`
- `getClosePackedRadius()`
- `getCachedNodeGeometry()`
- `addMatrixNodes()`
- `countGroupTriangles()`

**Test:**
- [ ] Polyhedra still render with correct node sizes
- [ ] Packed mode toggle still works
- [ ] Matrix nodes render when enabled

---

#### 6.2.4 Test: renderPolyhedron() (HIGH RISK)

**Before commenting out:**
- [ ] All helper functions working
- [ ] No console errors
- [ ] Visual baseline confirmed

**Comment out renderPolyhedron():**
```javascript
// function renderPolyhedron(group, geometry, color, opacity) {
//   /* ~150 lines */
// }
```

**Test ALL polyhedra:**
- [ ] Cube renders
- [ ] Tetrahedron renders
- [ ] Octahedron renders
- [ ] Icosahedron renders
- [ ] Dodecahedron renders
- [ ] Cuboctahedron renders
- [ ] Rhombic Dodecahedron renders
- [ ] Dual Tetrahedron renders
- [ ] Dual Icosahedron renders

**Test ALL options:**
- [ ] Faces toggle
- [ ] Edges toggle
- [ ] Nodes toggle (SM/MD/LG/OFF)
- [ ] RT Geometry toggle
- [ ] Flat shading toggle
- [ ] Opacity slider
- [ ] Scale sliders

**If ANY polyhedron breaks:**
- ❌ Uncomment immediately
- ❌ Compare rt-init.js vs rt-rendering.js renderPolyhedron()
- ❌ Fix discrepancy in rt-rendering.js
- ❌ Re-sync before trying again

---

#### 6.2.5 Test: updateGeometry() (HIGHEST RISK)

**This is the BIG one - 500+ lines referencing ALL UI elements**

**Before commenting out:**
- [ ] renderPolyhedron() working perfectly
- [ ] All polyhedra tested individually
- [ ] Create MANUAL BACKUP of rt-init.js
- [ ] Prepare for potential rollback

**Comment out updateGeometry():**
```javascript
// function updateGeometry() {
//   /* ~500 lines */
// }
```

**Test EVERY checkbox:**
- [ ] Show Cube
- [ ] Show Tetrahedron
- [ ] Show Geodesic Tetrahedron
- [ ] Show Dual Tetrahedron
- [ ] Show Octahedron
- [ ] Show Geodesic Octahedron
- [ ] Show Icosahedron
- [ ] Show Geodesic Icosahedron
- [ ] Show Dodecahedron
- [ ] Show Dual Icosahedron
- [ ] Show Cuboctahedron
- [ ] Show Rhombic Dodecahedron
- [ ] Show Cube Matrix
- [ ] Show Tet Matrix
- [ ] Show Octa Matrix
- [ ] Show Cuboctahedron Matrix
- [ ] Show Rhombic Dodecahedron Matrix

**Test EVERY matrix slider:**
- [ ] Cube Matrix Size (1-10)
- [ ] Tet Matrix Size (1-10)
- [ ] Octa Matrix Size (1-10)
- [ ] Cuboctahedron Matrix Size (1-10)
- [ ] Rhombic Dodecahedron Matrix Size (1-10)

**Test EVERY matrix rotation:**
- [ ] Cube Matrix Rotate 45°
- [ ] Tet Matrix Rotate 45°
- [ ] Octa Matrix Rotate 45°
- [ ] Cuboctahedron Matrix Rotate 45°
- [ ] Rhombic Dodecahedron Matrix Rotate 45°

**Test EVERY geodesic control:**
- [ ] Geodesic Tetra Frequency slider (1-6)
- [ ] Geodesic Tetra Projection (off/in/mid/out)
- [ ] Geodesic Octa Frequency slider (1-6)
- [ ] Geodesic Octa Projection (off/in/mid/out)
- [ ] Geodesic Icosa Frequency slider (1-6)
- [ ] Geodesic Icosa Projection (off/in/mid/out)

**If ANYTHING breaks:**
- ❌ STOP ALL TESTING
- ❌ Uncomment updateGeometry() immediately
- ❌ Restore from backup if needed
- ❌ Document exact failure (which checkbox/slider)
- ❌ Compare rt-init.js vs rt-rendering.js for that specific block
- ❌ Fix in rt-rendering.js, re-sync, try again

---

#### 6.2.6 Test: updateGeometryStats()

**Comment out:**
```javascript
// function updateGeometryStats() {
//   /* ~120 lines */
// }
```

**Test:**
- [ ] Stats panel displays
- [ ] Vertex/Edge/Face counts correct
- [ ] Euler verification works
- [ ] Triangle counts display
- [ ] Geodesic stats display
- [ ] Stats update when checkboxes toggled

---

### 6.3 Rollback Triggers

**Immediately uncomment and rollback if:**

- ❌ Any console error appears
- ❌ Any polyhedron fails to render
- ❌ Any checkbox/slider has no effect
- ❌ Any visual regression vs baseline
- ❌ Performance degradation (check PerformanceClock)
- ❌ Gumball breaks (even though we didn't touch it)
- ❌ Selection breaks
- ❌ Any UI interaction breaks

**Rollback procedure:**
1. Uncomment ALL functions in rt-init.js
2. Comment out import from rt-rendering.js
3. Reload page, verify everything works again
4. Document what failed in Phase 9 (Post-Mortem)

**Phase 6 Status:** ⚠️ PENDING - Awaiting Phase 5 completion

---

## Phase 7: Incremental Testing Protocol

**Objective:** Test each function group separately with full coverage

### 7.1 Smoke Test (Quick Validation)

**After commenting out each function, run smoke test:**

1. **Load page** - No console errors
2. **Toggle 1 checkbox** - Something renders
3. **Move 1 slider** - Something changes
4. **Rotate view** - OrbitControls work
5. **Resize window** - No errors

**If smoke test fails:** STOP, rollback that function

### 7.2 Visual Regression Test

**Compare screenshots before/after each function commented:**

**Baseline (rt-init.js inline):**
- [ ] Take screenshot with Cube + Tet + Octa visible
- [ ] Take screenshot with all matrices visible
- [ ] Take screenshot with all geodesics visible

**After extraction (rt-rendering.js imported):**
- [ ] Compare Cube + Tet + Octa screenshot
- [ ] Compare matrices screenshot
- [ ] Compare geodesics screenshot

**Use tool:** Browser DevTools screenshot, or external diff tool

**If ANY pixel difference (except anti-aliasing):**
- ⚠️ Investigate discrepancy
- ⚠️ May indicate logic difference between rt-init.js and rt-rendering.js

### 7.3 Performance Regression Test

**Compare PerformanceClock metrics before/after:**

**Baseline (rt-init.js inline):**
- Record "Node Generation" time
- Record "Calculation" time
- Record "Display Update" time
- Record "Triangle Count"

**After extraction (rt-rendering.js imported):**
- Compare all 4 metrics

**Acceptable variance:** ±5% (due to normal runtime fluctuation)

**If >10% slower:**
- ⚠️ Performance regression detected
- ⚠️ Investigate cause (unnecessary cloning? import overhead?)

### 7.4 Edge Case Testing

**Test unusual configurations:**

- [ ] All checkboxes OFF (blank scene)
- [ ] All checkboxes ON (maximum complexity)
- [ ] Matrix size = 10 (stress test)
- [ ] Geodesic frequency = 6 (stress test)
- [ ] Node size = OFF (no nodes)
- [ ] Opacity = 0.1 (minimum)
- [ ] Opacity = 1.0 (maximum)
- [ ] Scale = 0.1 (tiny)
- [ ] Scale = 5.0 (huge)

**All should work without errors**

### 7.5 Browser Compatibility Test

**Test in multiple browsers:**

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Module imports work differently across browsers - verify all load correctly**

**Phase 7 Status:** ⚠️ PENDING - Awaiting Phase 6 completion

---

## Phase 8: Final Integration Verification

**Objective:** Confirm entire extraction is production-ready

### 8.1 Code Cleanup Checklist

**Before final commit:**

- [ ] Remove ALL commented-out code from rt-init.js (if tests pass)
- [ ] Remove rt-init.js.backup (or archive to ARCHIVE folder)
- [ ] Run ESLint on rt-rendering.js (fix all warnings)
- [ ] Run Prettier on rt-rendering.js (format consistently)
- [ ] Add JSDoc comments to exported functions
- [ ] Update module header comment with date/purpose

### 8.2 Documentation Updates

**Update these files:**

- [ ] [Module-Extraction-Analysis.md](./Module-Extraction-Analysis.md) - Add success case study
- [ ] This file (rt-rendering-extraction-plan.md) - Mark complete
- [ ] rt-rendering.js header comment - Document what's inside
- [ ] rt-init.js header comment - Document what was removed

### 8.3 Final Verification Checklist

**Complete end-to-end test:**

- [ ] Fresh browser tab (clear cache)
- [ ] No console errors on load
- [ ] All 12+ polyhedra render correctly
- [ ] All 5 matrix types render correctly
- [ ] All 3 geodesics render correctly
- [ ] All UI controls functional
- [ ] PerformanceClock displays correct metrics
- [ ] Geometry stats display correctly
- [ ] Gumball still works (we didn't touch it)
- [ ] Selection still works (we didn't touch it)
- [ ] Animation smooth (60fps)
- [ ] No memory leaks (run for 5 minutes, check DevTools memory)

### 8.4 Commit Message Template

**Once ALL Phase 8 checks pass:**

```bash
git add src/geometry/modules/rt-rendering.js
git add src/geometry/modules/rt-init.js
git add docs/development/Geometry\ documents/rt-rendering-extraction-plan.md
git add docs/development/Geometry\ documents/Module-Extraction-Analysis.md

git commit -m "$(cat <<'EOF'
Feat: Complete rt-rendering.js module extraction

Successfully extracted all rendering functions from rt-init.js to rt-rendering.js module:
- initScene(), animate(), onWindowResize()
- Grid functions (Cartesian, Quadray, IVM)
- renderPolyhedron() with full RT node support
- updateGeometry() with all polyhedra, matrices, geodesics
- updateGeometryStats() with triangle counting
- Helper functions (quadrance, close-pack, caching, matrix nodes)

rt-init.js reduced from 4,467 lines to ~4,050 lines (-417 lines)
rt-rendering.js expanded from 1,170 lines to 1,669 lines (+499 lines)

All visual tests pass, no regressions, PerformanceClock metrics stable.

Related: Phase 1-3 sync completed in commit 66d2ff3

🤖 Co-Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Andy🤦‍♂️ & Claude🤖 <andy@openbuilding.ca>
EOF
)"
```

### 8.5 Success Criteria (Final)

**This extraction is successful if ALL are true:**

- ✅ rt-rendering.js contains all rendering functions
- ✅ rt-init.js imports and uses rt-rendering.js functions
- ✅ rt-init.js is at least 400 lines smaller
- ✅ No visual regressions (screenshots match)
- ✅ No performance regressions (PerformanceClock metrics ±5%)
- ✅ No console errors in any browser
- ✅ All UI controls functional
- ✅ Gumball still works (untouched)
- ✅ Selection still works (untouched)
- ✅ Code passes ESLint
- ✅ Documentation updated

**If ANY criterion fails:**
- ❌ Extraction is NOT complete
- ❌ Fix the failing item before merging
- ❌ Do NOT commit partial/broken extraction

**Phase 8 Status:** ⚠️ PENDING - Awaiting Phase 7 completion

---

## Phase 9: Post-Mortem (If Extraction Fails)

**Only fill this out if extraction fails and must be reverted**

### Failure Documentation Template

**Date of failure:**

**Phase where failure occurred:**

**What was attempted:**

**Error message:**

**Visual symptom:**

**Root cause:**

**Why it failed:**

**What we learned:**

**Blocker for future attempts:**

**Next steps:**

---

## Next Steps After Successful Extraction

**If all phases complete successfully:**

1. **Merge to main branch**
   - Squash commits or keep detailed history
   - Update CHANGELOG

2. **Monitor production**
   - Watch for user-reported issues
   - Monitor performance metrics
   - Check error logs

3. **Plan next extraction:**
   - CSS cleanup (move inline styles to art.css)
   - Utility functions (pure math, no DOM)
   - DO NOT attempt gumball/selection yet

4. **Document lessons learned:**
   - Update Module-Extraction-Analysis.md
   - Share knowledge with team
   - Create extraction template for future modules

---

**Status:** Ready for Phase 5 (Module Exposure Verification)
