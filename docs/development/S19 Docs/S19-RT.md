# S19 WOMBAT - Rational Trigonometry for Roof Geometry

**Status**: Planning
**Created**: 2025-12-14
**Branch**: WOMBAT-RT-ROOFS
**Goal**: Implement pyramidal roof geometry using rational trigonometry (Wildberger approach)

---

## Overview

This document outlines the implementation of pyramidal roof geometry for WOMBAT using **rational trigonometry** instead of traditional trigonometric functions (sin, cos, tan). This approach:

- **Defers irrational numbers** (square roots) until final rendering
- **Eliminates cumulative floating-point errors** from trig functions
- **Works purely with areas and quadrance** (squared distances)
- **Provides algebraic stability** for programmatic geometry generation

Per NJ Wildberger's rational trigonometry, we avoid angles entirely and work with **quadrance** (distance squared) and **spread** (generalized angle measure).

---

## Mathematical Foundation

### Core Concepts

**Quadrance** instead of distance:
```
Q(A,B) = (x₂ - x₁)² + (y₂ - y₁)²
```
*No square root needed!*

**Area-based constraints** instead of angles:
- Roof area ratio: `R = totalRoofArea / baseArea`
- Slant heights derived from face areas
- Pyramid height from Pythagorean quadrance

**Key Principle**: All calculations remain rational (or quadratic) until the final `sqrt()` for rendering.

---

## Pyramidal Roof Height Formulas

### Square Base (Symmetric Pyramid)

**Given:**
- Base side length: `a`
- Roof area ratio: `R` (where `R ≥ 1`)

**Derivation:**
```
Base area:      A_base = a²
Roof area:      A_roof = R · a²
Slant height:   s = (R · a) / 2
Height²:        h² = s² - (a/2)²
                h² = (R²a²/4) - (a²/4)
                h² = (a²/4)(R² - 1)
Height:         h = (a/2) · √(R² - 1)
```

**Implementation:**
```javascript
function pyramidHeightSquare(side, areaRatio) {
  if (areaRatio < 1) {
    throw new Error("Roof area ratio must be >= 1");
  }

  // Work with quadrance internally
  const h2 = (side * side / 4) * (areaRatio * areaRatio - 1);

  // Defer sqrt until render
  return Math.sqrt(h2);
}
```

---

### Rectangular Base (Asymmetric Pyramid)

**Given:**
- Base dimensions: `w` (width), `l` (length)
- Roof area ratio: `R`

**Challenge**: A centered apex with equal face areas is only possible when `w = l` or `R = 1`.

**Solution**: Treat width-faces and length-faces independently.

**Derivation:**
```
Base area:       A_base = w · l
Roof area:       A_roof = R · w · l
Face area:       A_face = A_roof / 4

Slant heights:
  Width faces:   s_w = (2 · A_face) / w = (R · l) / 2
  Length faces:  s_l = (2 · A_face) / l = (R · w) / 2

Height quadrance (per axis):
  From width:    h²_w = s²_w - (w/2)²
  From length:   h²_l = s²_l - (l/2)²
```

**Implementation:**
```javascript
function pyramidHeightRectangle(width, length, areaRatio) {
  if (areaRatio < 1) {
    throw new Error("Roof area ratio must be >= 1");
  }

  const roofArea = areaRatio * width * length;
  const faceArea = roofArea / 4;

  // Slant heights from face areas
  const sW = (2 * faceArea) / width;
  const sL = (2 * faceArea) / length;

  // Height quadrance from each axis
  const h2w = sW * sW - (width * width) / 4;
  const h2l = sL * sL - (length * length) / 4;

  // Check for non-congruent faces
  if (Math.abs(h2w - h2l) > 1e-9) {
    console.warn("Non-congruent faces: height differs by axis");
    console.warn(`  h²_w = ${h2w}, h²_l = ${h2l}`);
  }

  // Conservative choice: use minimum height for rendering
  return Math.sqrt(Math.min(h2w, h2l));
}
```

---

## Integration with WOMBAT Geometry Solver

### Current Roof Logic (Section19.js)

Located in `solveGeometry()` function:

```javascript
// Phase 3: Roof geometry (pitch emerges from roof area)
const areaRatio = roofArea / footprintArea;
let roofPitch = 0;
let roofType = "flat";

if (areaRatio > 1.01) {
  // Pitched roof needed
  roofType = "gabled";
  roofPitch = Math.asin(Math.min((areaRatio - 1) / 2, 1)) * (180 / Math.PI);
} else if (areaRatio < 0.99) {
  roofType = "inverted";
  roofPitch = -15;
}
```

**Issues with current approach:**
- Uses `Math.asin()` (trigonometric, irrational)
- Assumes gabled roof (not pyramidal)
- Loses precision with angle conversions

---

### Proposed Rational Approach

Replace angle-based roof logic with rational pyramidal height:

```javascript
// Phase 3: Roof geometry (RATIONAL TRIGONOMETRY)
const areaRatio = roofArea / footprintArea;
let roofHeight = 0;
let roofType = "flat";

if (areaRatio > 1.01) {
  // Pitched/pyramidal roof
  roofType = "pyramidal";

  // Calculate height using rational method
  if (Math.abs(width - length) < 1e-6) {
    // Square base - symmetric pyramid
    roofHeight = pyramidHeightSquare(width, areaRatio);
  } else {
    // Rectangular base - asymmetric pyramid
    roofHeight = pyramidHeightRectangle(width, length, areaRatio);
  }
} else if (areaRatio < 0.99) {
  // Inverted pyramid (visual indicator only)
  roofType = "inverted";
  roofHeight = -pyramidHeightRectangle(width, length, 1.0 / areaRatio);
}

// Store in geometry object
geometry.roof = {
  type: roofType,
  height: roofHeight,
  areaRatio: areaRatio
};
```

---

## Rendering Strategy (wombatRender.js)

### Pyramid Apex Calculation

```javascript
function renderPyramidalRoof(svg, geometry, scale, centerX, centerY) {
  const { width, length } = geometry.footprint;
  const roofHeight = geometry.roof.height;

  // Apex point (centered above base)
  const apex = {
    x: 0,
    y: 0,
    z: geometry.height + roofHeight  // Top of walls + roof height
  };

  // Four corners of roof base (top of walls)
  const roofBase = [
    { x: -width/2, y: -length/2, z: geometry.height },
    { x:  width/2, y: -length/2, z: geometry.height },
    { x:  width/2, y:  length/2, z: geometry.height },
    { x: -width/2, y:  length/2, z: geometry.height }
  ];

  // Draw four triangular faces
  roofBase.forEach((corner, i) => {
    const nextCorner = roofBase[(i + 1) % 4];

    // Triangle: corner -> apex -> nextCorner
    drawTriangle(svg, corner, apex, nextCorner, scale, centerX, centerY);
  });
}

function drawTriangle(svg, p1, p2, p3, scale, centerX, centerY) {
  const pt1 = toIsometric(p1.x, p1.y, p1.z, scale, centerX, centerY);
  const pt2 = toIsometric(p2.x, p2.y, p2.z, scale, centerX, centerY);
  const pt3 = toIsometric(p3.x, p3.y, p3.z, scale, centerX, centerY);

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", `M ${pt1.x},${pt1.y} L ${pt2.x},${pt2.y} L ${pt3.x},${pt3.y} Z`);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", config.colors.roof);
  path.setAttribute("stroke-width", 1);

  svg.appendChild(path);
}
```

---

## Implementation Workplan

### Phase 1: Add Rational Geometry Functions to Section19.js ⬅️ **CURRENT**
**File**: `src/sections/Section19.js`
**Location**: Add helper functions before `solveGeometry()` (around line 1100)

**Tasks**:
1. ✅ **Document mathematical foundation** (completed in this doc)
2. ✅ **Define `pyramidHeightSquare()` function**
3. ✅ **Define `pyramidHeightRectangle()` function**
4. **Add `calculatePyramidalHeight()` wrapper function**
5. **Update `solveGeometry()` Phase 3 roof logic**
   - Location: Around line 1277 (current roof pitch calculation)
   - Replace `roofPitch` with `geometry.roof` object
   - Call `calculatePyramidalHeight()` when R > 1.01
6. **Update geometry return object**
   - Remove `roofPitch` field
   - Add `roof: { type, height, areaRatio }` field

**Input Data Sources**:
- `d_85` - Roof area (from Section 11)
- `d_87` - Floor area (from Section 11)
- Calculated: `roofArea / footprintArea` = area ratio `R`

**Code to Add** (approximately 70 lines):
```javascript
/**
 * Calculate pyramidal roof height for square base using rational trigonometry
 * @param {number} side - Side length of square base
 * @param {number} areaRatio - Roof area / base area (R >= 1)
 * @returns {number} - Pyramid height (positive)
 */
function pyramidHeightSquare(side, areaRatio) {
  if (areaRatio < 1) {
    console.warn('[WOMBAT] Roof area ratio < 1, returning 0 height');
    return 0;
  }

  // Work with quadrance (squared quantities) internally
  // h² = (a²/4)(R² - 1)
  const h2 = (side * side / 4) * (areaRatio * areaRatio - 1);

  // Defer sqrt until final step (only irrational operation)
  return Math.sqrt(h2);
}

/**
 * Calculate pyramidal roof height for rectangular base using rational trigonometry
 * @param {number} width - Width of rectangular base
 * @param {number} length - Length of rectangular base
 * @param {number} areaRatio - Roof area / base area (R >= 1)
 * @returns {number} - Pyramid height (minimum of two axes)
 */
function pyramidHeightRectangle(width, length, areaRatio) {
  if (areaRatio < 1) {
    console.warn('[WOMBAT] Roof area ratio < 1, returning 0 height');
    return 0;
  }

  const baseArea = width * length;
  const roofArea = areaRatio * baseArea;
  const faceArea = roofArea / 4;

  // Slant heights from face areas (no trig functions!)
  const sW = (2 * faceArea) / width;  // Width-face slant height
  const sL = (2 * faceArea) / length; // Length-face slant height

  // Height quadrance from each axis using Pythagorean theorem
  const h2w = sW * sW - (width * width) / 4;
  const h2l = sL * sL - (length * length) / 4;

  // Check for non-congruent faces (only exact for square or R=1)
  if (Math.abs(h2w - h2l) > 1e-6) {
    console.warn('[WOMBAT] Non-congruent pyramid faces detected');
    console.warn(`  h²_width = ${h2w.toFixed(4)}, h²_length = ${h2l.toFixed(4)}`);
  }

  // Conservative: use minimum height to ensure all faces fit
  return Math.sqrt(Math.min(h2w, h2l));
}

/**
 * Calculate pyramidal roof height using rational trigonometry
 * Automatically detects square vs rectangular base
 * @param {number} width - Building width
 * @param {number} length - Building length
 * @param {number} areaRatio - Roof area / base area
 * @returns {number} - Pyramid height
 */
function calculatePyramidalHeight(width, length, areaRatio) {
  const tolerance = 1e-6;

  // Check if base is effectively square
  if (Math.abs(width - length) < tolerance) {
    return pyramidHeightSquare(width, areaRatio);
  } else {
    return pyramidHeightRectangle(width, length, areaRatio);
  }
}
```

**Update `solveGeometry()` Phase 3** (replace lines ~1277-1285):
```javascript
// Phase 3: Roof geometry (RATIONAL TRIGONOMETRY - no trig functions!)
const areaRatio = roofArea / footprintArea;
let roofType = "flat";
let roofHeight = 0;

if (areaRatio > 1.01) {
  // Pitched/pyramidal roof needed
  roofType = "pyramidal";
  roofHeight = calculatePyramidalHeight(width, length, areaRatio);

  console.log(`[WOMBAT] Pyramidal roof: R=${areaRatio.toFixed(3)}, h=${roofHeight.toFixed(2)}m`);
} else if (areaRatio < 0.99) {
  // Inverted pyramid (visual indicator for roof area deficit)
  roofType = "inverted";
  roofHeight = -calculatePyramidalHeight(width, length, 1.0 / areaRatio);

  console.log(`[WOMBAT] Inverted roof: R=${areaRatio.toFixed(3)}, h=${roofHeight.toFixed(2)}m`);
}

// Store roof geometry (replaces old roofPitch field)
const roof = {
  type: roofType,
  height: roofHeight,
  areaRatio: areaRatio
};
```

**Update Geometry Return Object** (around line 1300):
```javascript
return {
  footprint: { width, length },
  height: height,
  wallArea: wallArea,
  roof: roof,  // NEW: replaces roofPitch
  belowGrade: belowGradeGeometry
};
```

**Testing Checklist**:
- [ ] Square footprint (10m × 10m), R = 1.5 → height ≈ 5.59m
- [ ] Rectangular footprint (10m × 20m), R = 1.3 → console warning about non-congruent faces
- [ ] Flat roof (R = 1.0) → height = 0
- [ ] Inverted roof (R = 0.8) → negative height
- [ ] No NaN or Infinity values
- [ ] Console logs show correct R and h values

---

### Phase 2: Update Renderer (wombatRender.js)
**File**: `src/core/wombatRender.js`
**Location**: Add new function after `renderAboveGrade()` (around line 600)

**Tasks**:
1. Add `renderPyramidalRoof()` function
2. Add `drawTriangle()` helper function
3. Update `renderAboveGrade()` to detect roof type and call pyramid renderer
4. Add roof ridge lines for visibility
5. Update info overlay to show roof height instead of pitch

**Code to Add** (approximately 80 lines):
```javascript
/**
 * Render pyramidal roof geometry
 * @param {SVGElement} svg - Target SVG element
 * @param {Object} geometry - Geometry object with roof data
 * @param {number} scale - Isometric scale factor
 * @param {number} centerX - SVG center X coordinate
 * @param {number} centerY - SVG center Y coordinate
 */
function renderPyramidalRoof(svg, geometry, scale, centerX, centerY) {
  const { width, length } = geometry.footprint;
  const wallHeight = geometry.height;
  const roofHeight = geometry.roof.height;

  // Apex point (centered above base)
  const apex = {
    x: 0,
    y: 0,
    z: wallHeight + roofHeight
  };

  // Four corners of roof base (top of walls)
  const roofBase = [
    { x: -width/2, y: -length/2, z: wallHeight }, // SW corner
    { x:  width/2, y: -length/2, z: wallHeight }, // SE corner
    { x:  width/2, y:  length/2, z: wallHeight }, // NE corner
    { x: -width/2, y:  length/2, z: wallHeight }  // NW corner
  ];

  // Draw four triangular faces
  const roofColor = config.colors.roof || "#8B4513";

  roofBase.forEach((corner, i) => {
    const nextCorner = roofBase[(i + 1) % 4];
    drawTriangle(svg, corner, apex, nextCorner, scale, centerX, centerY, roofColor);
  });

  // Draw apex node
  const apexPt = toIsometric(apex.x, apex.y, apex.z, scale, centerX, centerY);
  const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  node.setAttribute("cx", apexPt.x);
  node.setAttribute("cy", apexPt.y);
  node.setAttribute("r", 3);
  node.setAttribute("fill", roofColor);
  svg.appendChild(node);
}

/**
 * Draw a triangle in isometric projection
 * @param {SVGElement} svg - Target SVG element
 * @param {Object} p1 - First vertex {x, y, z}
 * @param {Object} p2 - Second vertex {x, y, z}
 * @param {Object} p3 - Third vertex {x, y, z}
 * @param {number} scale - Isometric scale factor
 * @param {number} centerX - SVG center X
 * @param {number} centerY - SVG center Y
 * @param {string} color - Stroke color
 */
function drawTriangle(svg, p1, p2, p3, scale, centerX, centerY, color) {
  const pt1 = toIsometric(p1.x, p1.y, p1.z, scale, centerX, centerY);
  const pt2 = toIsometric(p2.x, p2.y, p2.z, scale, centerX, centerY);
  const pt3 = toIsometric(p3.x, p3.y, p3.z, scale, centerX, centerY);

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", `M ${pt1.x},${pt1.y} L ${pt2.x},${pt2.y} L ${pt3.x},${pt3.y} Z`);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", color);
  path.setAttribute("stroke-width", 1);

  svg.appendChild(path);
}
```

**Update `renderAboveGrade()`** (around line 450):
```javascript
// Render roof (if pitched)
if (geometry.roof && geometry.roof.type === "pyramidal") {
  renderPyramidalRoof(svg, geometry, scale, centerX, centerY);
} else if (geometry.roof && geometry.roof.type === "inverted") {
  // Visual indicator for inverted pyramid (dashed lines)
  renderPyramidalRoof(svg, geometry, scale, centerX, centerY);
}
```

**Testing Checklist**:
- [ ] Pyramid renders with four triangular faces
- [ ] Apex node visible at correct height
- [ ] Roof edges render in correct color
- [ ] Flat roofs show no pyramid geometry
- [ ] Inverted roofs show pyramid pointing downward

---

### Phase 3: Visual Refinement
**Tasks**:
1. Add face shading (different fill colors for N/S/E/W faces)
2. Add roof pitch annotation label
3. Test with various aspect ratios (1:1, 2:1, 3:1)
4. Edge case handling (very steep roofs, R > 3)
5. Add config option to toggle between gabled and pyramidal

---

### Phase 4: Future Extensions
**Ideas for later iterations**:
1. **Hip roofs**: Four sloped faces meeting at apex
2. **Gable roofs**: Two triangular ends, two rectangular slopes
3. **Gambrel roofs**: Double-pitched barn-style
4. **Mansard roofs**: Four-sided gambrel
5. **User-selectable roof type** in UI

All using rational trigonometry principles!

---

## Field Naming Convention (Future Work)

**Current field naming** is inconsistent:
- `d_199`, `d_198`, `d_101`, `d_102`, `d_200`, `d_201`, `d_203`...

**Proposed convention** (for rainy day cleanup):
- Principal DOM fields end at row 150
- WOMBAT-specific fields: `d_150`, `d_151`, `d_152`, etc.
- Sequential numbering for easier tracking

**Suggested mapping**:
- `d_150` - Building width (current: `d_199`)
- `d_151` - Building length (current: `d_198`)
- `d_152` - Wall height (current: `d_101`)
- `d_153` - Below-grade depth (current: `d_102`)
- `d_154` - Roof height (NEW - pyramidal height)
- `d_155` - Roof area ratio (NEW - R value)

*Note: This cleanup is deferred - not part of current Phase 1 implementation.*

---

## Testing Scenarios

### Test Cases

1. **Square footprint, R = 1.5**
   - Expected: Symmetric pyramid
   - Height should match formula

2. **Rectangular footprint (2:1), R = 1.3**
   - Expected: Asymmetric pyramid
   - Console warning about non-congruent faces

3. **Square footprint, R = 1.0**
   - Expected: Flat roof
   - Height = 0

4. **Rectangular footprint, R = 0.8**
   - Expected: Inverted pyramid (visual indicator)
   - Negative height

### Validation Checks

- Roof area calculated from faces matches target area
- No NaN or Infinity values
- Height always positive for R > 1
- Symmetric pyramids have congruent faces

---

## Advantages of Rational Approach

1. **Accuracy**: No cumulative trig errors
2. **Performance**: Fewer transcendental function calls
3. **Algebraic**: All intermediate values are rational/quadratic
4. **Debuggable**: Clear geometric relationships
5. **Unique**: Novel approach in web-based building modeling

---

## References

- N.J. Wildberger, "Divine Proportions: Rational Trigonometry to Universal Geometry"
- Rational trigonometry: Uses quadrance (Q) and spread (s) instead of distance and angle
- YouTube: "MathFoundations" series by Wildberger

---

## Notes

- This is a **local-only branch** (WOMBAT-RT-ROOFS) - no pushes to remote during CTO's calculation ordering work
- Current WOMBAT uses simplified gabled roof logic with `Math.asin()`
- Rational approach will replace this with pyramidal geometry
- Future: Could extend to hip roofs, gambrel, etc. using same rational principles
