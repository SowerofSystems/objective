# RT File Handler - Instance Restoration Workplan

**Created:** 2026-01-05
**Status:** Planning Phase
**Branch:** rt-filehandler
**Goal:** Implement full instance geometry restoration on JSON import

---

## Current Status

### ✅ What Works
- JSON state export with complete instance data
- File import/export UI (Import/Export/Save buttons)
- State validation and parsing
- Camera restoration
- Grid state restoration
- Auto-save system
- Preset library
- Keyboard shortcuts

### ❌ What Needs Fixing
- Instance geometry recreation on import
- Instances are logged but not visually restored in 3D scene

### 🐛 Issue Details
**Log Output:**
```
rt-state-manager.js:551 🗑️  All instances cleared
rt-filehandler.js:232 📦 Would restore 2 instances
rt-filehandler.js:239 ✅ State imported successfully
```

**Problem Location:** [rt-filehandler.js:229-236](../../src/geometry/modules/rt-filehandler.js#L229-L236)

---

## Architecture Analysis

### Key Files & Touchpoints

#### 1. **rt-filehandler.js** (Primary Work Area)
**Location:** `src/geometry/modules/rt-filehandler.js`

**Current Import Method:**
```javascript
// Line ~220-240
importState(stateData) {
  // ✅ Validates state data
  // ✅ Clears existing instances via RTStateManager.clearAll()
  // ✅ Restores camera
  // ✅ Restores grid states
  // ❌ INCOMPLETE: Instance restoration

  if (stateData.instances && Array.isArray(stateData.instances)) {
    console.log(`📦 Would restore ${stateData.instances.length} instances`);
    // TODO: Implement instance restoration
  }
}
```

**What We Need:**
- Access to polyhedron creation functions
- Ability to create geometry by type name (string → function)
- Apply saved transforms after creation

---

#### 2. **rt-init.js** (Polyhedron Creation Pipeline)
**Location:** `src/geometry/modules/rt-init.js`

**Polyhedron Creation Functions to Identify:**
- `renderPolyhedron(group, geometry, color, opacity)` - Core rendering function
- Individual polyhedron builders (need to find these)
- Scale/transform application logic
- Where `Polyhedra.cube()`, `Polyhedra.tetrahedron()`, etc. are called

**Search Patterns:**
```javascript
// Find where polyhedra are created:
- "Polyhedra.cube"
- "Polyhedra.tetrahedron"
- "Polyhedra.octahedron"
- "Polyhedra.icosahedron"
- "Polyhedra.dodecahedron"
- "Polyhedra.dualTetrahedron"
- "Polyhedra.dualIcosahedron"
- "Polyhedra.cuboctahedron"
- "Polyhedra.rhombicDodecahedron"
- "Polyhedra.geodesic"

// Find where groups are created:
- "cubeGroup"
- "tetrahedronGroup"
- "octahedronGroup"
// etc.
```

---

#### 3. **rt-polyhedra.js** (Geometry Generation)
**Location:** `src/geometry/modules/rt-polyhedra.js`

**What It Provides:**
- `Polyhedra.cube(scale)` - Returns `{ vertices, edges, faces }`
- `Polyhedra.tetrahedron(scale)` - Returns geometry data
- Similar methods for all polyhedron types

**What We Need to Know:**
- Input parameters (scale, frequency for geodesics)
- Output format
- How to convert output to THREE.js geometry

---

#### 4. **rt-state-manager.js** (Instance Management)
**Location:** `src/geometry/modules/rt-state-manager.js`

**Relevant Methods:**
```javascript
// Line 94-194
createInstance(polyhedronGroup, scene) {
  // Creates instance from existing polyhedron group
  // Clones geometry
  // Stores transform data
  // Adds to scene
  // Returns instance metadata
}

// Line 272-294
deleteInstance(instanceId, scene) {
  // Removes instance from scene and state
}

// Line 534-552
clearAll(scene) {
  // Removes all instances
}
```

**What's Important:**
- `createInstance()` expects an existing THREE.Group with geometry
- We need to build the group FIRST, then pass it to createInstance()
- Instance metadata structure is already correct in JSON export

---

## JSON State Structure

### Instance Data Format
```json
{
  "instances": [
    {
      "id": "instance_1736093847123_abc123",
      "timestamp": 1736093847123,
      "type": "cube",  // ← Key for recreation
      "transform": {
        "position": { "x": 2.5, "y": 0, "z": 0 },
        "rotation": { "x": 0, "y": 0, "z": 0, "order": "XYZ" },
        "scale": { "x": 1.5, "y": 1.5, "z": 1.5 }
      },
      "appearance": {
        "visible": true
      },
      "metadata": {
        "label": "cube_1736093847123",
        "tags": [],
        "notes": ""
      }
    }
  ]
}
```

**Critical Fields:**
- `type` - Determines which Polyhedra method to call
- `transform` - Applied after geometry creation
- `appearance.visible` - Controls visibility

---

## Implementation Strategy

### Phase 1: Research & Map Functions
**Goal:** Understand the existing polyhedron creation pipeline

**Tasks:**
1. ✅ Identify where polyhedra are initially created in rt-init.js
2. ✅ Map `type` string → creation function
3. ✅ Understand rendering pipeline (geometry → THREE.js → scene)
4. ✅ Document scale/transform application process

**Search Locations:**
- `rt-init.js` lines containing "Polyhedra."
- `rt-init.js` functions that create "Group" objects
- `renderPolyhedron()` function implementation

---

### Phase 2: Extract Creation Logic
**Goal:** Make polyhedron creation callable from file handler

**Option A: Create Factory Function in rt-init.js**
```javascript
// Add to rt-init.js after polyhedron creation
function createPolyhedronByType(type, scale = 1.0) {
  const group = new THREE.Group();
  let geometry;

  switch(type) {
    case 'cube':
      geometry = Polyhedra.cube(scale);
      break;
    case 'tetrahedron':
      geometry = Polyhedra.tetrahedron(scale);
      break;
    // ... all types
  }

  renderPolyhedron(group, geometry, color, opacity);
  group.userData.type = type;
  return group;
}

// Expose globally
window.createPolyhedronByType = createPolyhedronByType;
```

**Option B: Pass Creation Functions to File Handler**
```javascript
// In rt-init.js after RTFileHandler.init()
RTFileHandler.setPolyhedronFactory({
  cube: (scale) => createCube(scale),
  tetrahedron: (scale) => createTetrahedron(scale),
  // ... etc
});
```

**Option C: Minimal Coupling - Factory Registry**
```javascript
// Create a new lightweight module: rt-polyhedron-factory.js
export const PolyhedronFactory = {
  create(type, scale, THREE, Polyhedra) {
    // Self-contained creation logic
    // No dependencies on rt-init.js internals
  }
};
```

**Recommendation:** Start with Option A (simplest, least refactoring)

---

### Phase 3: Implement Instance Restoration
**Goal:** Complete the TODO in rt-filehandler.js

**Implementation:**
```javascript
// rt-filehandler.js - importState() method
// Replace lines 229-236

if (stateData.instances && Array.isArray(stateData.instances)) {
  console.log(`📦 Restoring ${stateData.instances.length} instances...`);

  stateData.instances.forEach(instanceData => {
    // 1. Create polyhedron group from type
    const polyhedronGroup = window.createPolyhedronByType(
      instanceData.type,
      1.0  // Base scale
    );

    // 2. Apply saved transform
    polyhedronGroup.position.set(
      instanceData.transform.position.x,
      instanceData.transform.position.y,
      instanceData.transform.position.z
    );

    polyhedronGroup.rotation.set(
      instanceData.transform.rotation.x,
      instanceData.transform.rotation.y,
      instanceData.transform.rotation.z
    );

    polyhedronGroup.scale.set(
      instanceData.transform.scale.x,
      instanceData.transform.scale.y,
      instanceData.transform.scale.z
    );

    // 3. Set visibility
    polyhedronGroup.visible = instanceData.appearance.visible;

    // 4. Register as instance via StateManager
    const restoredInstance = this.stateManager.createInstance(
      polyhedronGroup,
      this.scene
    );

    console.log(`✅ Restored instance: ${instanceData.type} at (${instanceData.transform.position.x}, ${instanceData.transform.position.y}, ${instanceData.transform.position.z})`);
  });

  console.log(`✅ All instances restored successfully`);
}
```

---

### Phase 4: Handle Edge Cases

**Edge Cases to Consider:**

1. **Geodesic Polyhedra**
   - Have additional parameters: `frequency`, `projection`
   - Need to save/restore these parameters
   - JSON schema extension needed

2. **Color/Opacity**
   - Currently not saved in instance data
   - Should we preserve per-instance colors?
   - May need appearance.color, appearance.opacity fields

3. **Node Rendering**
   - Are nodes part of the instance?
   - Node size preference (sm/md/lg/packed)
   - Node geometry type (classical vs RT)

4. **Unknown Types**
   - What if JSON contains a type we don't recognize?
   - Graceful degradation with warning

5. **Version Compatibility**
   - Future schema changes
   - Migration strategies

**Proposed JSON Extensions:**
```json
{
  "instances": [
    {
      "type": "geodesicIcosahedron",
      "parameters": {
        "frequency": 2,
        "projection": "out"  // "off", "in", "mid", "out"
      },
      "appearance": {
        "visible": true,
        "color": "#4a9eff",
        "opacity": 0.25,
        "nodeSize": "md"
      }
    }
  ]
}
```

---

### Phase 5: Testing Plan

**Test Cases:**

1. **Basic Polyhedra**
   - ✅ Export scene with 2 cubes (1 moved, 1 scaled)
   - ✅ Import and verify both appear correctly
   - ✅ Check transforms match original

2. **All Polyhedron Types**
   - Test each: cube, tetrahedron, octahedron, icosahedron, dodecahedron
   - Test duals: dualTetrahedron, dualIcosahedron
   - Test Archimedean: cuboctahedron, rhombicDodecahedron

3. **Geodesic Polyhedra**
   - Test with different frequencies (0-6)
   - Test different projections (off/in/mid/out)

4. **Complex Scenes**
   - 10+ instances
   - Mixed types
   - Extreme transforms (large scale, rotation)

5. **Round-Trip Fidelity**
   - Export → Import → Export again
   - Compare JSON files (should be identical)

6. **Error Handling**
   - Invalid JSON
   - Missing required fields
   - Unknown polyhedron types
   - Corrupted transform data

---

## Code Locations Reference

### Files to Modify
1. **rt-init.js** - Add polyhedron factory function
2. **rt-filehandler.js** - Implement instance restoration
3. **(Optional) rt-polyhedron-factory.js** - If we go with Option C

### Files to Read (No Changes)
1. **rt-polyhedra.js** - Understand geometry API
2. **rt-state-manager.js** - Understand instance API

### Search Commands
```bash
# Find polyhedron creation
grep -n "Polyhedra\." src/geometry/modules/rt-init.js

# Find group creation
grep -n "Group()" src/geometry/modules/rt-init.js

# Find renderPolyhedron function
grep -n "function renderPolyhedron" src/geometry/modules/rt-init.js

# Find where scale is applied
grep -n "scale" src/geometry/modules/rt-init.js | grep -i "slider\|value"
```

---

## Dependencies & Requirements

### Modules Required
- THREE.js (already loaded)
- Polyhedra (from rt-polyhedra.js)
- RTStateManager (already available)
- Scene reference (passed to init)
- Camera reference (passed to init)

### Global Variables Needed
- Access to polyhedron creation functions
- Access to rendering configuration (colors, opacity, node size)

### Potential Issues
1. **Scoping** - Creation functions may be in closure
2. **State** - UI state (opacity, node size) may not be accessible
3. **Async** - Geometry creation might be async
4. **Performance** - Restoring 100+ instances could be slow

---

## Next Steps

### Immediate Actions
1. ✅ Create this workplan document
2. ⏳ Search rt-init.js for polyhedron creation patterns
3. ⏳ Document the creation pipeline
4. ⏳ Identify best factory approach (A/B/C)
5. ⏳ Implement factory function
6. ⏳ Update importState() method
7. ⏳ Test with saved 2-cube scene
8. ⏳ Expand to all polyhedron types
9. ⏳ Handle geodesic edge cases
10. ⏳ Update documentation

### Success Criteria
- ✅ Import JSON with 2 hexahedra
- ✅ Both instances appear in scene
- ✅ Transforms match original (position/rotation/scale)
- ✅ Works for all polyhedron types
- ✅ No errors in console
- ✅ Round-trip fidelity maintained

---

## Notes & Observations

### From Logs.md Testing
```
rt-state-manager.js:551 🗑️  All instances cleared
rt-filehandler.js:232 📦 Would restore 2 instances
rt-filehandler.js:239 ✅ State imported successfully
```

**Observations:**
- Clear is working correctly
- State validation passes
- Instance count detected (2)
- No errors during import
- Just missing visual restoration

### Key Insight
The hardest part is **accessing the polyhedron creation pipeline** which lives in rt-init.js's closure. We need to either:
1. Expose it globally (simple, less elegant)
2. Pass it as dependency (cleaner, more refactoring)
3. Recreate minimal version (most work, most isolated)

**Recommendation:** Start with #1 (expose globally) for rapid prototyping, then optionally refactor to #2 if needed.

---

## Timeline Estimate

**Phase 1 (Research):** 15 minutes
**Phase 2 (Factory):** 30 minutes
**Phase 3 (Implementation):** 30 minutes
**Phase 4 (Edge Cases):** 45 minutes
**Phase 5 (Testing):** 30 minutes

**Total:** ~2.5 hours

**Actual:** TBD

---

## References

- [rt-filehandler.js](../../src/geometry/modules/rt-filehandler.js) - Main implementation
- [rt-init.js](../../src/geometry/modules/rt-init.js) - Polyhedron creation
- [rt-state-manager.js](../../src/geometry/modules/rt-state-manager.js) - Instance API
- [rt-polyhedra.js](../../src/geometry/modules/rt-polyhedra.js) - Geometry generation
- [ARTexplorer.md](ARTexplorer.md) - Project documentation

---

**Last Updated:** 2026-01-05
**Author:** Claude (with Andy Ross Thomson)
