# Close-Packed Vertex Spheres
**Feature Implementation Plan**

## Overview
Add "Packed" node size option that automatically calculates vertex sphere radii using the universal close-packing formula for kissing spheres at polyhedron vertices.

## Mathematical Foundation

### Classical Distance Formula
```
r = a/2
```
Where:
- `r` = vertex sphere radius
- `a` = edge length of polyhedron

### Rational Trigonometry (Quadrance) Formula
```
Q_vertex = Q_edge / 4
```
Where:
- `Q_vertex` = quadrance of vertex sphere radius (r²)
- `Q_edge` = quadrance of edge length (a²)

**Universal Law**: This formula applies to ALL regular polyhedra when spheres at adjacent vertices are mutually tangent.

## Implementation Plan

### Phase 1: Core Formula Implementation
**Location**: `src/geometry/rt-init.js`

1. **Add edge length calculator** (lines ~635-697, near `getCachedNodeGeometry`)
   ```javascript
   /**
    * Calculate edge length for each polyhedron type
    * @param {string} type - Polyhedron type (tetrahedron, cube, octahedron, etc.)
    * @param {number} scale - halfSize parameter
    * @returns {number} Edge length in world units
    */
   function getPolyhedronEdgeLength(type, scale) {
     switch(type) {
       case 'tetrahedron':
       case 'dualTetrahedron':
         return 2 * scale * Math.sqrt(2); // Tet edge = 2s√2

       case 'cube':
         return 2 * scale; // Cube edge = 2s

       case 'octahedron':
         return 2 * scale; // Octa edge = 2s (same as cube in RT system)

       case 'icosahedron':
         return 2 * scale; // Icosa edge = 2s

       case 'dodecahedron':
         return 2 * scale / Math.sqrt(3); // Dodeca edge

       case 'cuboctahedron':
         return 2 * scale; // Cubocta edge = 2s

       case 'rhombicDodecahedron':
         return 2 * scale; // Rhombic dodeca edge

       case 'geodesicTetrahedron':
       case 'geodesicOctahedron':
       case 'geodesicIcosahedron':
         // Geodesics subdivide base edges - use base polyhedron formula
         const baseType = type.replace('geodesic', '').toLowerCase();
         return getPolyhedronEdgeLength(baseType, scale);

       default:
         console.warn(`Unknown polyhedron type: ${type}`);
         return 2 * scale;
     }
   }
   ```

2. **Add close-pack radius calculator**
   ```javascript
   /**
    * Calculate close-packed vertex sphere radius using universal formula
    * Universal formula: r = a/2 (works for ALL regular polyhedra)
    * Rational Trigonometry: Q_vertex = Q_edge / 4
    *
    * @param {string} type - Polyhedron type
    * @param {number} scale - halfSize parameter
    * @returns {number} Vertex sphere radius for close-packing
    */
   function getClosePackedRadius(type, scale) {
     const edgeLength = getPolyhedronEdgeLength(type, scale);

     // Universal close-packing formula: r = a/2
     const radius = edgeLength / 2;

     // DIAGNOSTIC: Log quadrance calculation (RT verification)
     const edgeQuadrance = edgeLength * edgeLength;
     const vertexQuadrance = edgeQuadrance / 4;
     const vertexRadius = Math.sqrt(vertexQuadrance);

     console.log(`Close-pack for ${type}:`);
     console.log(`  Edge length (a): ${edgeLength.toFixed(4)}`);
     console.log(`  Edge quadrance (a²): ${edgeQuadrance.toFixed(4)}`);
     console.log(`  Vertex quadrance (a²/4): ${vertexQuadrance.toFixed(4)}`);
     console.log(`  Vertex radius (a/2): ${radius.toFixed(4)}`);
     console.log(`  RT verification (√Q_vertex): ${vertexRadius.toFixed(4)}`);

     return radius;
   }
   ```

3. **Modify `getCachedNodeGeometry` function** (lines ~637-696)
   - Add `packed` case to handle close-packed sizing
   - Pass `polyhedronType` parameter to determine correct edge length

   ```javascript
   function getCachedNodeGeometry(useRT, nodeSize, polyhedronType, scale) {
     const cacheKey = `${useRT ? "rt" : "classical"}-${nodeSize}-${polyhedronType}`;

     if (nodeGeometryCache.has(cacheKey)) {
       return nodeGeometryCache.get(cacheKey);
     }

     let nodeGeometry;
     let trianglesPerNode = 0;
     let radius;

     if (nodeSize === 'packed') {
       // CLOSE-PACKED MODE: Calculate from edge length
       radius = getClosePackedRadius(polyhedronType, scale);
     } else {
       // FIXED SIZE MODE: Use predefined sizes
       const nodeSizes = {
         sm: 0.02,
         md: 0.04,
         lg: 0.08,
       };
       radius = nodeSizes[nodeSize];
     }

     if (useRT) {
       // RT Geodesic Icosahedron node
       const polyData = window.RTPolyhedra.geodesicIcosahedron(radius, 0, "out");
       // ... rest of RT geometry code
     } else {
       // Classical THREE.js Sphere
       nodeGeometry = new THREE.SphereGeometry(radius, 16, 16);
       trianglesPerNode = 16 * 16 * 2;
     }

     const result = { geometry: nodeGeometry, triangles: trianglesPerNode };
     nodeGeometryCache.set(cacheKey, result);
     return result;
   }
   ```

4. **Update `renderPolyhedron` function** (lines ~702-818)
   - Pass `group.userData.type` and `scale` to `getCachedNodeGeometry`
   - Clear cache when switching to/from packed mode

   ```javascript
   function renderPolyhedron(group, geometry, color, opacity) {
     // ... existing code ...

     if (showNodes) {
       // Start node generation timing
       PerformanceClock.startNodeGeneration();

       // Get polyhedron type and scale from group
       const polyType = group.userData.type;
       const scale = parseFloat(document.getElementById("tetScaleSlider").value) / (2 * Math.sqrt(2));

       // Get cached geometry with polyhedron-specific parameters
       const { geometry: nodeGeometry, triangles: trianglesPerNode } =
         getCachedNodeGeometry(useRTNodeGeometry, nodeSize, polyType, scale);

       // ... rest of node rendering code ...
     }
   }
   ```

### Phase 2: UI Implementation
**Location**: `src/geometry/index.html`

1. **Add "Packed" button to Node size selector** (around line ~240)
   ```html
   <!-- Node Size Selector -->
   <div class="control-group">
     <label>Nodes</label>
     <div class="button-group">
       <button class="node-size-btn" data-node-size="off">Off</button>
       <button class="node-size-btn" data-node-size="sm">Sm</button>
       <button class="node-size-btn active" data-node-size="md">Md</button>
       <button class="node-size-btn" data-node-size="lg">Lg</button>
       <button class="node-size-btn" data-node-size="packed">Packed</button>
     </div>
   </div>
   ```

2. **Add tooltip/help text**
   ```html
   <button class="node-size-btn" data-node-size="packed"
           title="Close-packed spheres: r = edge/2 (kissing number)">
     Packed
   </button>
   ```

3. **Update CSS** (if needed for 5-button layout)
   ```css
   .button-group {
     display: grid;
     grid-template-columns: repeat(5, 1fr); /* Changed from 4 to 5 */
     gap: 5px;
   }
   ```

### Phase 3: Event Handler Updates
**Location**: `src/geometry/rt-init.js`

1. **Node size selector handler** (lines ~1804-1817)
   - Already handles dynamic button clicks
   - No changes needed - will automatically support 'packed' value

2. **Add cache clearing logic** when toggling between modes
   ```javascript
   document.querySelectorAll(".node-size-btn").forEach(btn => {
     btn.addEventListener("click", function () {
       const newSize = this.dataset.nodeSize;
       const oldActiveBtn = document.querySelector(".node-size-btn.active");
       const oldSize = oldActiveBtn ? oldActiveBtn.dataset.nodeSize : null;

       // Clear cache when switching to/from packed mode
       if (newSize === 'packed' || oldSize === 'packed') {
         nodeGeometryCache.clear();
         console.log('🔄 Cache cleared: switching packed mode');
       }

       // ... existing button toggle code ...
     });
   });
   ```

### Phase 4: Testing & Validation

1. **Visual Tests**
   - [ ] Verify spheres at adjacent vertices are tangent (kissing)
   - [ ] Test on all polyhedron types (tet, cube, octa, icosa, dodeca)
   - [ ] Test on geodesic subdivisions (freq 1-5)
   - [ ] Verify Classical Spheres mode
   - [ ] Verify RT Geodesics mode

2. **Mathematical Verification**
   - [ ] Console log edge lengths for each polyhedron type
   - [ ] Verify quadrance calculations (Q_vertex = Q_edge / 4)
   - [ ] Compare Classical (distance) vs RT (quadrance) approaches
   - [ ] Measure actual sphere spacing in scene

3. **Performance Tests**
   - [ ] Check geometry caching working correctly
   - [ ] Verify no geometry regeneration on camera movement
   - [ ] Test cache clearing on mode switches
   - [ ] Monitor triangle count for different node sizes

### Phase 5: Documentation

1. **Code Comments**
   - Add JSDoc comments to new functions
   - Explain universal formula derivation
   - Reference Synergetics and Rational Trigonometry

2. **User Documentation**
   - Add tooltip explaining "Packed" mode
   - Update help text with formula explanation
   - Add visual diagram showing kissing spheres

3. **Developer Notes**
   - Document edge length formulas for each polyhedron
   - Explain relationship to Synergetics unit-radius spheres
   - Note connection to kissing number problem

## Mathematical References

### Synergetics (Buckminster Fuller)
- Unit-radius sphere packing as foundation
- Tetrahedron as unit of volume from 4 closest-packed spheres
- IVM (Isotropic Vector Matrix) from CCP lattice
- Prime vector = 2 (distance between unit-radius sphere centers)

### Rational Trigonometry (Norman Wildberger)
- Quadrance Q = d² (square of distance)
- No transcendental functions (sin, cos, tan)
- Pure algebraic relationships
- Q_vertex = Q_edge / 4 (rational, exact)

### Universal Formula Proof
```
For two spheres of radius r centered at adjacent vertices:
- Centers are separated by edge length a
- Spheres are tangent when 2r = a
- Therefore: r = a/2

In quadrance terms:
- Q(2r) = (2r)² = 4r² = Q_edge
- Q(r) = r² = Q_edge / 4
```

## Future Enhancements

1. **Dynamic Sizing**
   - Update packed radius when sliders change
   - Live edge length display
   - Show quadrance values in UI

2. **Multi-Polyhedra**
   - Different radii for each polyhedron type when multiple active
   - Color-code spheres by polyhedron type
   - Highlight tangent pairs

3. **Educational Mode**
   - Show edge length measurements
   - Display quadrance calculations
   - Animate sphere packing demonstration

4. **Export**
   - Include sphere data in glTF export
   - Preserve close-pack relationships
   - Metadata with mathematical properties

## Implementation Priority
1. ✅ Phase 1: Core formula (CRITICAL - foundation)
2. ✅ Phase 2: UI button (HIGH - user access)
3. ✅ Phase 3: Event handlers (HIGH - functionality)
4. ⬜ Phase 4: Testing (MEDIUM - validation)
5. ⬜ Phase 5: Documentation (LOW - polish)

## Estimated Effort
- **Phase 1-3**: 2-3 hours (core implementation)
- **Phase 4**: 1-2 hours (testing)
- **Phase 5**: 1 hour (documentation)
- **Total**: 4-6 hours

---

## Implementation Status (2026-01-04)

**Status**: ✅ **IMPLEMENTED** (Phases 1-3 Complete)
**Commit**: `964f057` - "Feat: Add close-packed vertex spheres (Packed button)"
**Net Code Added**: ~110 lines (127 insertions, 17 deletions in rt-init.js + 3 in HTML)

### What Was Implemented

#### Phase 1: Core Functions (rt-init.js)
- ✅ `getPolyhedronEdgeLength(type, scale)` - lines 645-694
- ✅ `getClosePackedRadius(type, scale)` - lines 696-716
- ✅ Modified `getCachedNodeGeometry()` to support 'packed' mode - lines 718-782
- ✅ Updated `renderPolyhedron()` to pass polyType and scale - lines 869-910

#### Phase 2: UI (index.html)
- ✅ Added "Packed" button (5th button: Off/Sm/Md/Lg/Packed) - line 1029-1031
- ✅ Tooltip: "Close-packed spheres: r = a/2 (kissing number)"
- ✅ Flexbox auto-distributes 5 buttons evenly (no CSS changes needed)

#### Phase 3: Integration
- ✅ Works with **both** Classical Spheres and RT Geodesics
- ✅ Dynamic cache key includes polyhedronType and scale
- ✅ Console logging shows classical vs RT verification
- ✅ Supports all polyhedra including geodesic subdivisions

### Actual Edge Length Formulas (from rt-polyhedra.js logs)

All formulas at **halfSize = 1**:

| Polyhedron | Edge Quadrance Q | Edge Length Formula | Status |
|------------|------------------|---------------------|--------|
| **Cube** | 4.0 | `2s` | ✅ Working |
| **Tetrahedron** | 8.0 | `2s√2` | ✅ Working |
| **Dual Tetrahedron** | 4.0 | `2s` | ✅ Working |
| **Octahedron** | 2.0 | `s√2` | ✅ Fixed (was 2s) |
| **Icosahedron** | 1.105573 | `s√1.105573` | ✅ Working |
| **Dodecahedron** | 1.527864 | `s√1.527864` | ✅ Working |
| **Dual Icosahedron** | 1.447214 | `s√1.447214` | ⚠️ Needs tuning |
| **Cuboctahedron** | 0.5 | `s/√2` | ✅ Working |
| **Rhombic Dodecahedron** | 0.5 | `s/√2` | ✅ Working |

### Testing Results

**Working Correctly:**
- ✅ Cube - Spheres kiss perfectly
- ✅ Tetrahedron - Perfect close-packing
- ✅ Dual Tetrahedron - Correct
- ✅ Octahedron - Fixed edge length formula
- ✅ Icosahedron - Correct
- ✅ Dodecahedron - Correct
- ✅ Cuboctahedron - Correct
- ✅ Rhombic Dodecahedron - Correct

**Needs Investigation:**
- ⚠️ **Dual Icosahedron** - Spheres too small (not kissing)
  - Issue: Dual icosa scaled to dodec inradius φ·s, not dodec halfSize
  - Logged Q=1.447214 at icosa radius 1.144123 (≠ dodec halfSize 0.707)
  - Need to account for scaling relationship between dual and parent

---

## CRITICAL ISSUE: Not Staying in Rational Trigonometry Space! ⚠️

### Current Implementation Problem

The current implementation **breaks Rational Trigonometry principles** by:

1. **Using hardcoded decimal approximations**:
   ```javascript
   case 'icosahedron':
     return scale * Math.sqrt(1.105573);  // ❌ BAD: Static decimal terminated number
   ```

2. **Taking sqrt() too early**:
   - We compute `Math.sqrt(Q)` immediately in `getPolyhedronEdgeLength()`
   - We should stay in **quadrance space** and defer sqrt until render

3. **Losing algebraic precision**:
   - 1.105573 is a decimal approximation
   - Should use symbolic expressions involving φ (golden ratio)

### What We SHOULD Be Doing (Wildberger Principles)

**Stay in quadrance space as long as possible:**

```javascript
// CURRENT (BAD):
function getPolyhedronEdgeLength(type, scale) {
  case 'icosahedron':
    return scale * Math.sqrt(1.105573);  // ❌ sqrt too early!
}

function getClosePackedRadius(type, scale) {
  const edgeLength = getPolyhedronEdgeLength(type, scale);
  return edgeLength / 2;  // Distance-based
}

// BETTER (Rational Trigonometry):
function getPolyhedronEdgeQuadrance(type, scale) {
  case 'icosahedron':
    // Return QUADRANCE, not distance!
    const Q_base = 1.105573;  // Or better: symbolic form with φ
    return Q_base * scale * scale;  // Q scales as s²
}

function getClosePackedRadiusQuadrance(type, scale) {
  const Q_edge = getPolyhedronEdgeQuadrance(type, scale);

  // Work in QUADRANCE space - pure algebra!
  const Q_vertex = Q_edge / 4;  // ✅ Rational: Q_vertex = Q_edge / 4

  // Only sqrt at the VERY END for rendering
  return Math.sqrt(Q_vertex);
}
```

### Even Better: Use Symbolic Ratios

**Leverage RT.Phi library for golden ratio:**

```javascript
case 'icosahedron':
  // Q involves φ (golden ratio) - use symbolic form!
  const phi = RT.Phi.value();  // φ = (1 + √5)/2
  const Q_edge = /* symbolic expression with φ */;
  return Q_edge * scale * scale;
```

### Why This Matters

1. **Precision**: Algebraic ratios are exact, decimals are approximations
2. **Philosophy**: Wildberger's Rational Trig avoids transcendental functions
3. **Correctness**: Q_vertex = Q_edge / 4 is pure algebra (no sqrt needed!)
4. **Performance**: Fewer sqrt() calls = faster computation

### Recommended Refactor

**Priority**: HIGH (aligns with RT philosophy)
**Effort**: 2-3 hours
**Benefit**: True Rational Trigonometry implementation

**Steps**:
1. Rename `getPolyhedronEdgeLength()` → `getPolyhedronEdgeQuadrance()`
2. Return quadrance values (Q = a²), not distances
3. Update `getClosePackedRadius()` to work in quadrance space
4. Only call `Math.sqrt()` at final render step
5. Use `RT.Phi` library for symbolic golden ratio expressions

---

## Known Issues & TODO

### Immediate Issues
1. ⚠️ **Dual Icosahedron**: Edge length formula needs correction for scaling relationship
2. ⚠️ **Not using Rational Trigonometry properly**: Taking sqrt() too early, using decimal approximations

### Future Work
1. **Refactor to stay in quadrance space** (HIGH priority)
2. **Use symbolic ratios** instead of decimal approximations
3. **Leverage RT.Phi library** for golden ratio calculations
4. Add UI display showing quadrance values
5. Visual diagram of kissing spheres
6. Export sphere data in glTF format

---

**Last Updated**: 2026-01-04
**Next Session**: Investigate dual icosahedron scaling + Refactor to quadrance space
