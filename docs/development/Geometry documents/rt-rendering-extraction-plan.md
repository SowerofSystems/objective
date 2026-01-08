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

## Testing Protocol: Comment-Out Method

**CRITICAL: Do NOT delete rt-init.js functions. Comment them out.**

### Step-by-Step Testing

**Test 1: Verify rt-rendering.js imports correctly**

```javascript
// At top of rt-init.js (after existing imports)
import { initScene, animate, updateGeometry } from "./rt-rendering.js";

// Check console for errors
// If errors: fix imports/exports in rt-rendering.js
```

**Test 2: Comment out ONE function at a time**

```javascript
// In rt-init.js startARTexplorer():

// TEST: animate()
// function animate() {  // ← Comment out
//   requestAnimationFrame(animate);
//   controls.update();
//   renderer.render(scene, camera);
// }

// Now using rt-rendering.js animate()
animate(); // ← This should call the imported function

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

## Export/Import Structure

### rt-rendering.js exports:

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
  countGroupTriangles
};
```

### rt-init.js imports:

```javascript
import {
  initScene,
  animate,
  updateGeometry,
  // ... others as needed
} from "./rt-rendering.js";
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

*To be filled in if extraction fails*

### Attempt 1: (If needed)

**Date:**
**What failed:**
**Error message:**
**Root cause:**
**Lesson learned:**

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

**Status:** Ready for Phase 1 (Sync Simple Functions)
