# Section 19 Refactoring Plan

**Status**: Planning phase
**Branch**: WOMBAT-Ae-Ag (local only, no push)
**Date**: 2025-12-15

---

## Overview

Reorganize Section 19 field IDs to sequential numbering (150+) and implement gable roof geometry with proper wall area accounting.

---

## Part 1: Field ID Renumbering

### Current Mapping (Out of Order)

| Current Row | Current Field | Label | New Field | New Row |
|-------------|---------------|-------|-----------|---------|
| row199 | d_199 | Stories | d_150 | row150 |
| row198 | d_198 | Conditioned Volume | d_151 | row151 |
| row101 | d_101 | Total Area Exposed to Air (Ae) | d_152 | row152 |
| row102 | d_102 | Total Area Exposed to Ground (Ag) | d_153 | row153 |
| row200 | d_202 | Footprint Aspect Ratio (L:W) | d_154 | row154 |
| row201 | h_201 | Footprint Width | h_155 | row155 |
| row203 | h_203 | Building Height | h_156 | row156 |
| - | h_200 | Footprint Length | h_157 | row157 |

**NEW FIELDS to Add**:
| Field | Label | Type | Notes |
|-------|-------|------|-------|
| d_158 | Roof Type | dropdown | multiplanar/biplanar/monoplane |
| h_159 | Roof Height | calculated | Pyramidal or gable ridge height |
| h_160 | Gable End Area | calculated | Triangular area (if biplanar) |

### Rationale

1. **Sequential numbering** (150-160) for easy tracking
2. **Logical order** matches visual table presentation
3. **Room for expansion** (161-170 reserved for future roof parameters)
4. **Consistent with OBC Matrix integration** (future "Building Area" at d_95 maps cleanly)

---

## Part 2: Implementation Tasks

### Task 1: Rename Field IDs in Section19.js
**File**: `src/sections/Section19.js`
**Estimated**: 45 minutes
**Priority**: HIGH

**Changes**:
1. Update `targetDefaults` and `referenceDefaults` objects (lines ~30-120)
2. Update table row definitions (lines ~265-455)
3. Update `solveGeometry()` getModeAwareValue calls (lines ~680-900)
4. Update `calculateTargetModel()` and `calculateReferenceModel()` setValue calls
5. Search/replace all references to old field IDs

**Pattern**:
```javascript
// OLD
const storiesDeclared = parseFloat(getModeAwareValue("d_199", isRef));
const volumeDeclared = parseFloat(getModeAwareValue("d_198", isRef));

// NEW
const storiesDeclared = parseFloat(getModeAwareValue("d_150", isRef));
const volumeDeclared = parseFloat(getModeAwareValue("d_151", isRef));
```

### Task 2: Update StateManager Field Definitions
**File**: `src/core/StateManager.js`
**Estimated**: 15 minutes
**Priority**: HIGH

Update field registration to use new IDs:
```javascript
// OLD
setValue("d_199", "1.5", VALUE_STATES.DEFAULT);
setValue("d_198", "8000.00", VALUE_STATES.DEFAULT);

// NEW
setValue("d_150", "1.5", VALUE_STATES.DEFAULT);
setValue("d_151", "8000.00", VALUE_STATES.DEFAULT);
```

### Task 3: Add Roof Type Dropdown (d_158)
**File**: `src/sections/Section19.js`
**Estimated**: 30 minutes
**Priority**: MEDIUM

Add new row after Aspect Ratio:
```javascript
row158: {
  id: "19.RT",
  rowId: "19.RT",
  label: "Roof Type",
  cells: {
    a: {},
    b: {},
    c: { label: "Roof Type" },
    d: {
      fieldId: "d_158",
      type: "dropdown",
      options: [
        { value: "multiplanar", label: "Multiplanar (Pyramid/Hip)" },
        { value: "biplanar", label: "Biplanar (Gable)" },
        { value: "monoplane", label: "Monoplane (Shed)" }
      ],
      value: "biplanar", // DEFAULT to gable for robustness
      label: "Roof Type"
    },
    e: { label: "" },
    f: {},
    g: {},
    h: {},
  },
},
```

### Task 4: Implement Gable Roof Geometry
**File**: `src/sections/Section19.js`
**Estimated**: 60 minutes
**Priority**: HIGH

Add gable height calculation function:
```javascript
/**
 * Calculate gable roof height using rational trigonometry
 * Ridge runs along the longer axis for rectangular buildings
 * @param {number} width - Building width (short axis)
 * @param {number} length - Building length (long axis)
 * @param {number} areaRatio - Roof area / base area (R >= 1)
 * @returns {Object} - { height, gableEndArea, ridgeOrientation }
 */
function calculateGableHeight(width, length, areaRatio) {
  // Ridge orientation: along longer dimension for stability
  const ridgeOrientation = length >= width ? "longitudinal" : "transverse";
  const ridgeLength = Math.max(width, length);
  const span = Math.min(width, length);

  const baseArea = width * length;
  const roofArea = areaRatio * baseArea;

  // Gable roof: 2 rectangular slopes + 2 triangular ends
  // Total roof area = 2 × (ridgeLength × slopeLength) + 2 × (triangleArea)
  // For symmetric gable: triangleArea = (span × height) / 2

  // Simplified: roof area ≈ 2 × ridgeLength × slopeLength
  const slopeLength = roofArea / (2 * ridgeLength);

  // Height from Pythagorean theorem: h² = s² - (span/2)²
  const h2 = slopeLength * slopeLength - (span / 2) * (span / 2);

  if (h2 < 0) {
    console.warn('[WOMBAT] Roof area too small for gable roof - returning flat');
    return { height: 0, gableEndArea: 0, ridgeOrientation };
  }

  const height = Math.sqrt(h2);

  // Gable end area (each triangular end)
  const gableEndArea = (span * height) / 2;

  console.log(`[WOMBAT] Gable roof: h=${height.toFixed(2)}m, ridge ${ridgeOrientation}`);
  console.log(`  Gable end area: ${gableEndArea.toFixed(2)} m² per end`);

  return { height, gableEndArea, ridgeOrientation };
}
```

Update roof geometry Phase 3:
```javascript
// Phase 3: Roof geometry
const roofTypeSelected = getModeAwareValue("d_158", isReferenceCalculation) || "biplanar";
const areaRatio = roofArea / footprintArea;
let roofType = "flat";
let roofHeight = 0;
let gableEndArea = 0;
let ridgeOrientation = null;

if (areaRatio > 1.01) {
  if (roofTypeSelected === "multiplanar") {
    // Pyramidal/hip roof (4 triangular faces)
    roofType = "pyramidal";
    roofHeight = calculatePyramidalHeight(width, length, areaRatio);
  } else if (roofTypeSelected === "biplanar") {
    // Gable roof (2 rectangular slopes + 2 triangular ends)
    roofType = "gable";
    const gableResult = calculateGableHeight(width, length, areaRatio);
    roofHeight = gableResult.height;
    gableEndArea = gableResult.gableEndArea;
    ridgeOrientation = gableResult.ridgeOrientation;
  } else if (roofTypeSelected === "monoplane") {
    // Shed roof (single slope)
    roofType = "shed";
    roofHeight = calculateShedHeight(width, length, areaRatio);
  }
}

const roof = {
  type: roofType,
  height: roofHeight,
  areaRatio: areaRatio,
  gableEndArea: gableEndArea || 0,
  ridgeOrientation: ridgeOrientation
};
```

### Task 5: Account for Gable Ends in Wall Area
**File**: `src/sections/Section19.js`
**Estimated**: 30 minutes
**Priority**: HIGH

**Critical Decision**: Gable ends are OPAQUE WALL AREA (not roof area)

Current approach:
```javascript
// Phase 2: Wall height from surfaces
const totalWallAreaGross = opaqueWallArea + (window_N + window_E + window_S + window_W + window_other);
const wallHeight = totalWallAreaGross / perimeter;
```

**Problem**: Gable ends are part of `opaqueWallArea` (d_86 from S11), but they have triangular geometry above the wall plate height.

**Solution A - Simple (Recommended)**:
Treat gable ends as distinct from perimeter walls:
```javascript
// For gable roofs, extract gable end area from total opaque wall area
let perimeterWallArea = opaqueWallArea;
let gableWallArea = 0;

if (roofType === "gable" && gableEndArea > 0) {
  // Gable ends contribute to opaque wall area (d_86)
  // But they're triangular, not rectangular
  gableWallArea = 2 * gableEndArea; // Two gable ends
  perimeterWallArea = opaqueWallArea - gableWallArea;

  console.log(`[WOMBAT] Gable end area: ${gableWallArea.toFixed(2)} m²`);
  console.log(`[WOMBAT] Perimeter wall area: ${perimeterWallArea.toFixed(2)} m²`);
}

// Wall height from perimeter walls only (rectangular sections)
const totalPerimeterWallGross = perimeterWallArea + (window_N + window_E + window_S + window_W + window_other);
const wallHeight = totalPerimeterWallGross / perimeter;
```

**Issue**: This creates circular dependency:
- Gable end area depends on roof height
- Roof height depends on roof area
- Wall height depends on gable end area

**Solution B - Iterative (Geometrically Pure)**:
1. Initial estimate: assume all opaque wall area is rectangular
2. Calculate preliminary wall height
3. Calculate gable roof height from roof area
4. Calculate gable end area from roof height
5. Recalculate wall height excluding gable ends
6. Iterate until convergence (usually 2-3 iterations)

**Recommendation**: Use **Solution A** with a twist:
- User declares total opaque wall area (d_86) INCLUDING gable ends
- We calculate gable ends from geometry
- Wall plate height = (opaqueWallArea - gableArea) / perimeter
- This is self-consistent and doesn't require iteration

### Task 6: Render Gable Roofs
**File**: `src/core/wombatRender.js`
**Estimated**: 45 minutes
**Priority**: MEDIUM

Add gable roof renderer:
```javascript
function renderGableRoof(svg, geometry, mode, scale, centerX, centerY) {
  const isReference = mode === "reference";
  const roofColor = isReference ? config.colors.reference : config.colors.target;

  const { width, length } = geometry.footprint;
  const wallHeight = geometry.height;
  const roofHeight = geometry.roof.height;
  const ridgeOrientation = geometry.roof.ridgeOrientation;

  // Ridge runs along longer axis
  const ridgeLength = ridgeOrientation === "longitudinal" ? length : width;
  const span = ridgeOrientation === "longitudinal" ? width : length;

  // Ridge endpoints (elevated above wall height)
  const ridge1 = {
    x: ridgeOrientation === "longitudinal" ? -length/2 : 0,
    y: ridgeOrientation === "longitudinal" ? 0 : -width/2,
    z: wallHeight + roofHeight
  };

  const ridge2 = {
    x: ridgeOrientation === "longitudinal" ? length/2 : 0,
    y: ridgeOrientation === "longitudinal" ? 0 : width/2,
    z: wallHeight + roofHeight
  };

  // Four corners of roof base (top of walls)
  const corners = [
    { x: -width/2, y: -length/2, z: wallHeight }, // SW
    { x:  width/2, y: -length/2, z: wallHeight }, // SE
    { x:  width/2, y:  length/2, z: wallHeight }, // NE
    { x: -width/2, y:  length/2, z: wallHeight }  // NW
  ];

  // Draw 2 rectangular slopes + 2 triangular gable ends
  // (Implementation details...)

  // Draw ridge line
  const ridge1Pt = toIsometric(ridge1.x, ridge1.y, ridge1.z, scale, centerX, centerY);
  const ridge2Pt = toIsometric(ridge2.x, ridge2.y, ridge2.z, scale, centerX, centerY);
  const ridgeLine = createLine(ridge1Pt, ridge2Pt, roofColor, 3);
  svg.appendChild(ridgeLine);
}
```

### Task 7: Update Documentation
**Files**:
- `docs/development/WOMBAT-GROOMING.md`
- `docs/development/S19-RT.md`

Update with:
- ✅ Canvas/clipping issue resolved (padding increased to 120px)
- ✅ Rectangular pyramid rendering fixed (validation allows roofHeight = 0)
- ✅ Field renumbering to 150+ sequence
- 🚧 Gable roof geometry implemented
- 🚧 Roof type selector added

---

## Part 3: Testing Scenarios

### Test 1: Square Footprint + Pyramid
- Aspect ratio: 0 (square)
- Roof type: multiplanar
- Expected: Symmetric pyramid, all 4 faces congruent

### Test 2: Rectangular Footprint + Gable
- Aspect ratio: 0.8 (1.8:1 rectangle)
- Roof type: biplanar
- Expected: Gable with ridge along long axis, no NaN errors

### Test 3: Extreme Rectangle + Gable
- Aspect ratio: 3.0 (4:1 rectangle)
- Roof type: biplanar
- Expected: Gable renders correctly, gable ends account for wall area

### Test 4: Field ID Migration
- Change all field IDs from old to new
- Verify StateManager reads/writes correctly
- Verify Target/Reference modes work
- Verify default model loads without errors

---

## Part 4: Migration Strategy

### Phase 1: Renumber Fields (BREAKING CHANGE)
**WARNING**: This will break existing saved models using old field IDs

**Mitigation**:
1. Add migration function in StateManager to map old IDs → new IDs
2. Document in changelog
3. Test with default model first
4. Commit with clear "BREAKING CHANGE" message

### Phase 2: Add Roof Type Selector
- Default to "biplanar" (gable) for robustness
- Automatically suggest type based on aspect ratio:
  - Aspect < 1.2: suggest "multiplanar"
  - Aspect >= 1.2: suggest "biplanar"

### Phase 3: Implement Gable Geometry
- Parallel to existing pyramid geometry
- Gable becomes new default for rectangular buildings

---

## Success Criteria

✅ **Field IDs sequential** - d_150 through d_160
✅ **Table rows ordered** - row150 through row160
✅ **Roof type selector** - Dropdown with 3 options
✅ **Gable geometry** - No NaN errors for rectangular footprints
✅ **Gable wall area** - Properly accounted in wall height calculation
✅ **Default model renders** - No breaking changes to existing workflow
✅ **Documentation updated** - WOMBAT-GROOMING.md reflects current state

---

## Timeline

**Estimated Total**: 4-5 hours

**Sprint 1** (2 hours): Field renumbering + testing
1. Task 1: Rename field IDs (45 min)
2. Task 2: Update StateManager (15 min)
3. Task 4 partial: Test default model (30 min)
4. Task 7: Update docs (30 min)

**Sprint 2** (2-3 hours): Gable implementation
1. Task 3: Add roof type dropdown (30 min)
2. Task 4: Gable geometry (60 min)
3. Task 5: Wall area accounting (30 min)
4. Task 6: Gable rendering (45 min)
5. Full testing (30 min)

---

## Notes

- This is **local-only branch** - no pushes during CTO's work
- Gable ends are OPAQUE WALL AREA (affects d_86, not d_85)
- Ridge orientation automatic: along longer dimension
- Future: User could override ridge orientation
- Future: Gambrel, mansard, etc. using same principles
