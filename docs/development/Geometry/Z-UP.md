# Z-Up Coordinate System - Simple Convention Change

## Executive Summary

**Objective:** Change ARTexplorer coordinate convention from Y-up to Z-up (CAD/BIM/Architecture standard).

**Key Insight:** Vertex coordinates don't need to change! Only camera orientation and comment labels.

**Approach:** Update camera.up, fix grid rotations, update comments/labels. That's it.

**Estimated Time:** 30-45 minutes

**Status:** Planning - Ready for Implementation

---

## The Simple Truth

The vertices are already defined with numerical coordinates like `(±1, ±1, ±1)`. These numbers don't need to change.

**What changes:**
1. Camera tells Three.js "Z is up" instead of "Y is up"
2. Grid planes rotate to match new convention
3. Comments/labels updated to reflect Z-up thinking

**What doesn't change:**
- Vertex coordinate values (the numbers stay the same!)
- Edge definitions
- Face definitions
- RT math (coordinate-agnostic)

---

## Coordinate System Definition

### Z-Up Convention (CAD/BIM Standard)
```
X+ = Right (horizontal)
Y+ = Depth (horizontal, away from viewer)
Z+ = Up (vertical)
```

### Three.js Interpretation
The same vertex `new THREE.Vector3(1, 1, 1)`:
- **Y-up interpretation**: right-up-back
- **Z-up interpretation**: right-back-up

The numbers are identical, only our mental model changes!

---

## Quick Reference: What Changes

### Code Changes (3 locations)
1. **Camera setup**: `camera.up.set(0, 0, 1)` and adjust position
2. **Grid rotations**: XY horizontal, XZ/YZ vertical
3. **Default toggle**: XY active (not XZ)

### Visual Changes
- **Blue axis points UP** (instead of green)
- **XY plane is horizontal ground** (instead of XZ)
- **XZ and YZ planes are vertical walls**

### Comment/Label Updates
- Update vertex descriptions (top/bottom instead of front/back)
- Update plane references (XY=ground, not XZ)
- Capitalize Z in comments for consistency

---

## Implementation Plan

### Phase 1: Camera & Scene (15 min)

**Camera Setup**
```javascript
// Current (Y-up):
camera.position.set(5, 5, 5);
camera.up.set(0, 1, 0);  // Y is up
camera.lookAt(0, 0, 0);

// New (Z-up):
camera.position.set(5, -5, 5);
camera.up.set(0, 0, 1);  // Z is up
camera.lookAt(0, 0, 0);
```

**Grid Planes**

Current understanding needs verification, but likely:
```javascript
// XY plane (Z=0) - Should be HORIZONTAL in Z-up
gridXY = new THREE.GridHelper(gridSize, divisions, color, color);
gridXY.rotation.x = Math.PI / 2;  // Rotate to lie flat
gridXY.visible = true;  // Default visible (ground plane)

// XZ plane (Y=0) - Should be VERTICAL in Z-up
gridXZ = new THREE.GridHelper(gridSize, divisions, color, color);
// Needs rotation to be vertical front wall
gridXZ.visible = false;

// YZ plane (X=0) - Should be VERTICAL in Z-up
gridYZ = new THREE.GridHelper(gridSize, divisions, color, color);
// Needs rotation to be vertical side wall
gridYZ.visible = false;
```

**Axes Helper**
No code change needed - axes automatically follow camera.up:
- **Red = X+** (right, horizontal)
- **Green = Y+** (depth, horizontal, away from viewer)
- **Blue = Z+** (up, VERTICAL) ← Industry standard: Blue = Up in Z-up systems

This matches CAD/Blender/glTF convention where Blue = Z = Up.
When we set camera.up.set(0, 0, 1), blue arrow automatically points vertically.

---

### Phase 2: Comment Updates (15 min)

**Cube Comments**
```javascript
// Current (Y-up):
new THREE.Vector3(-s, -s, -s),  // 0: (-, -, -)

// Update to (Z-up):
new THREE.Vector3(-s, -s, -s),  // 0: left-back-bottom
new THREE.Vector3( s, -s, -s),  // 1: right-back-bottom
new THREE.Vector3( s,  s, -s),  // 2: right-front-bottom
new THREE.Vector3(-s,  s, -s),  // 3: left-front-bottom
new THREE.Vector3(-s, -s,  s),  // 4: left-back-top
new THREE.Vector3( s, -s,  s),  // 5: right-back-top
new THREE.Vector3( s,  s,  s),  // 6: right-front-top
new THREE.Vector3(-s,  s,  s),  // 7: left-front-top
```

**Edge/Face Comments**
```javascript
// Current (Y-up):
// Bottom face (z = -s)

// Update to (Z-up):
// Bottom face (Z = -s)  // Just capitalize!
```

**Octahedron Comments**
```javascript
// Current (Y-up):
new THREE.Vector3( 0,  s,  0),  // 2: Top (+y)
new THREE.Vector3( 0, -s,  0),  // 3: Bottom (-y)
new THREE.Vector3( 0,  0,  s),  // 4: Front (+z)

// Update to (Z-up):
new THREE.Vector3( 0,  s,  0),  // 2: Front (+Y)
new THREE.Vector3( 0, -s,  0),  // 3: Back (-Y)
new THREE.Vector3( 0,  0,  s),  // 4: Top (+Z)  ← Key change!
```

**Icosahedron Comments**
```javascript
// Current (Y-up):
// Rectangle 1: XZ plane, y = ±a
// Rectangle 2: YZ plane, x = ±a
// Rectangle 3: XY plane, z = ±a

// Update to (Z-up):
// Rectangle 1: XY plane, Z = ±a  (horizontal rectangles)
// Rectangle 2: XZ plane, Y = ±a  (vertical front/back)
// Rectangle 3: YZ plane, X = ±a  (vertical left/right)
```

**Quadray Basis Comments**
```javascript
// Current (Y-up):
/**
 * A: ( 1,  1,  1)
 * B: ( 1, -1, -1)
 * C: (-1,  1, -1)
 * D: (-1, -1,  1)
 */

// Update to (Z-up):
/**
 * Z-UP: Tetrahedral basis vectors
 * A: ( 1,  1,  1)  // top-front-right
 * B: ( 1, -1, -1)  // bottom-back-right
 * C: (-1,  1, -1)  // bottom-front-left
 * D: (-1, -1,  1)  // top-back-left
 */
```

---

### Phase 3: UI Labels & Grid Toggles (10 min)

**Grid Plane Toggle Defaults**
In Z-up, the XY plane should be the default horizontal ground plane:
```javascript
// Update default visible plane in HTML:
// XY toggle: ACTIVE (horizontal ground plane in Z-up)
// XZ toggle: inactive (vertical wall in Z-up)
// YZ toggle: inactive (vertical wall in Z-up)
```

**Grid Plane Toggle Labels (Optional Enhancement)**
```javascript
// Consider adding descriptive labels in UI:
"XY" → "XY (Ground)"    // Horizontal floor at Z=0
"XZ" → "XZ (Wall)"      // Vertical front/back at Y=0
"YZ" → "YZ (Wall)"      // Vertical left/right at X=0
```

**Console Logging**
Search for any logs that mention specific planes and update references from Y-up to Z-up thinking.

---

## What NOT to Change

**❌ Don't touch these (they work as-is):**
- Vertex coordinate values (numbers stay the same!)
- Edge arrays
- Face arrays
- RT.validateEdges() calls
- Geodesic subdivision functions
- Quadray.toCartesian() implementation
- Any RT math (quadrance, spread calculations)

**✅ Only change:**
- camera.up
- camera.position (to view from good angle)
- Grid plane rotations
- Comments describing vertex positions
- UI labels for clarity

---

## Testing Checklist

### Visual Validation (5 min)
- [ ] **Blue axis (Z) points vertically upward** ← Key test!
- [ ] Green axis (Y) points away from viewer (horizontal depth)
- [ ] Red axis (X) points right (horizontal)
- [ ] **XY toggle active by default** (shows horizontal ground grid)
- [ ] XY plane is horizontal (ground at Z=0)
- [ ] XZ plane is vertical when toggled on (wall at Y=0)
- [ ] YZ plane is vertical when toggled on (wall at X=0)
- [ ] Cube: 4 edges vertical, 8 edges horizontal
- [ ] Octahedron: top and bottom vertices on vertical line (along Z-axis)

### RT Validation (5 min)
- [ ] Console shows same quadrances as before
- [ ] No errors in console
- [ ] All polyhedra toggle on/off correctly
- [ ] Geodesic subdivisions work correctly

### Functional Validation (5 min)
- [ ] Camera controls feel natural (orbit feels like going around vertical object)
- [ ] Scale slider works
- [ ] Grid toggles show/hide correctly
- [ ] All polyhedra render properly
- [ ] Node size buttons work
- [ ] Opacity slider works

---

## Implementation Timeline

**Total: 30-45 minutes**

1. **Camera & Grids** (15 min)
   - Update camera.up to (0, 0, 1)
   - Adjust camera.position
   - Fix grid plane rotations
   - Test: blue axis vertical, XY horizontal

2. **Comments** (15 min)
   - Update cube comments (top/bottom instead of front/back)
   - Update octahedron comments (Z is vertical)
   - Update icosahedron rectangle descriptions
   - Update Quadray basis descriptions

3. **Labels & Testing** (10-15 min)
   - Update UI labels if desired
   - Run through testing checklist
   - Verify everything works

---

## Success Criteria

**Definition of Done:**
1. **Blue axis (Z) visibly points vertically upward** ← Primary visual test
2. **XY toggle is active by default** (shows horizontal ground grid)
3. **XY plane is horizontal** (ground at Z=0)
4. XZ and YZ planes are vertical (walls)
5. Comments reflect Z-up convention (top/bottom, not front/back for vertical)
6. Same visual output when viewed from equivalent angles
7. All RT validations still pass (same quadrances)

**Acceptance Test:**
Side-by-side comparison with Y-up backup:
- ✓ Polyhedra look identical? (same geometry)
- ✓ Quadrances match? (same RT values in console)
- ✓ **Blue axis now vertical?** (was green before)
- ✓ **XY plane now horizontal?** (was XZ before)
- ✓ Grid orientations make sense? (XY=ground, XZ/YZ=walls)
- ✓ Camera feels natural? (orbiting around vertical axis)

---

## File Management

```bash
# Already done:
ARTexplorer.html              # Y-up (current)
ARTexplorer-YUP-BACKUP.html   # Y-up (backup)

# After changes:
ARTexplorer.html              # Z-up (updated)
ARTexplorer-YUP-BACKUP.html   # Y-up (reference)
```

No need for separate ARTexplorer-ZUP.html - just edit ARTexplorer.html directly since changes are minimal and backup already exists.

---

## The Mental Model Shift

**Same vertex `(1, 1, 1)` means different things:**

**Y-up thinking:**
- X = 1: right
- Y = 1: up
- Z = 1: toward viewer

**Z-up thinking:**
- X = 1: right
- Y = 1: away from viewer (depth)
- Z = 1: up

**The coordinates don't change. Only how we interpret them.**

---

## References

- **Three.js camera.up**: https://threejs.org/docs/#api/en/cameras/Camera.up
- **glTF 2.0 (Z-up)**: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
- **Blender Z-up**: Industry standard
- **Rational Trigonometry**: Coordinate-agnostic mathematics

---

**Status:** 📋 Simple Plan Ready
**Next Action:** Update camera.up and grid rotations, test with blue axis vertical
