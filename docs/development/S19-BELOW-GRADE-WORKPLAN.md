# Section 19: Below-Grade Geometry Visualization - Implementation Workplan

**Status**: 📋 Planning Phase
**Created**: 2025-12-14
**Target**: Phase 2 of WOMBAT visualization
**Estimated Duration**: 3-4 hours

---

## Executive Summary

Add below-grade geometry visualization to WOMBAT, showing basement walls and slab-on-grade foundations using brown nodes and vectors to distinguish ground-facing surfaces (Ag) from air-facing surfaces (Ae).

**Visual Goal**: Extend the 3D wireframe below z=0 to show thermal boundary components in contact with the ground.

---

## Prerequisites

✅ **Completed**:
- Section 19 WOMBAT core visualization working
- Z-up coordinate system (X+=East, Y+=North, Z+=Up)
- Ae/Ag display fields showing aggregate areas from S12
- SVG isometric rendering pipeline established

✅ **Data Available** (from S11 via StateManager):
- `d_94` / `ref_d_94` - Below-Grade Wall Area (m²)
- `d_95` / `ref_d_95` - Slab Area (m²)
- `d_87` / `ref_d_87` - Floor Exposed to Air (m²) - for context

---

## Design Specification

### Visual Design Language

| Component | Color | Line Style | Z-Range | Rationale |
|-----------|-------|------------|---------|-----------|
| Above-grade building | Blue/Red (mode) | Solid 3px | z=0 to z=height | Visible geometry |
| Grade line | Brown (#8b4513) | Dashed 2px | z=0 (horizontal) | Ground plane indicator |
| **Below-grade walls** | Brown (#8b4513) | **Dashed 3px** | z=0 to z=-depth | **Hidden line (below ground)** |
| **Below-grade slab** | Brown (#8b4513) | **Dashed 3px** | z=-depth | **Hidden line (below ground)** |
| **Slab-on-grade** | Brown (#8b4513) | **Solid 3px** | z=0 | **At grade (visible)** |

**Key Principle**: Dashed = below ground (hidden line effect), Solid = at/above grade (visible)

### Foundation Type Detection

```javascript
const slabArea = parseFloat(getModeAwareValue("d_95", isReference)) || 0;
const basementWallArea = parseFloat(getModeAwareValue("d_94", isReference)) || 0;
const floorArea = parseFloat(getModeAwareValue("d_87", isReference)) || 0;

// Foundation type logic
const hasBasement = basementWallArea > 0;
const hasSlab = slabArea > 0;
const hasRaisedFloor = floorArea > 0;

if (hasBasement && hasSlab) {
  foundationType = "full-basement"; // Brown box below grade
} else if (hasSlab && !hasBasement) {
  foundationType = "slab-on-grade"; // Brown grade line + perimeter
} else if (floorArea > 0 && !hasSlab && !hasBasement) {
  foundationType = "raised-floor"; // Blue floor at z=0, no grade line
} else if (hasBasement && !hasSlab) {
  foundationType = "basement-no-slab"; // Unusual but render
}
```

### Visual Design

```
Above Grade (Blue/Red - Solid):    Below Grade (Brown - Dashed):
      ┌────┐                         ═══════════  ← Grade line (z=0, dashed)
     ╱│    │╲                        ┆        ┆
    ╱ │    │ ╲                       ┆        ┆   ← Basement walls (dashed)
   ●──●────●──●                      ┆        ┆      "Hidden line" effect
   │  │    │  │                      ●╌╌●╌╌●╌╌● ← Slab (dashed, z=-depth)
   │  │    │  │
   ●──●────●──●

Slab-on-Grade (Brown - Solid):
   ●══●════●══●  ← Slab perimeter (solid, z=0)
   ═══════════  ← Grade line (dashed, z=0)
```

**Line Styles**:
- **Solid** (3px): Above-grade or at-grade components (visible)
- **Dashed** (3px, 8-4 pattern): Below-grade components (hidden line)
- **Grade line** (2px, 8-4 pattern): Ground plane indicator

---

## Implementation Steps

### Step 1: Extend Geometry Solver (30 min)

**Location**: [Section19.js:585-687](../../src/sections/Section19.js#L585-L687) - `solveGeometry()`

**Add below-grade calculations**:

```javascript
// After Phase 4 (Wall Geometry), add Phase 5:

// Phase 5: Below-Grade Geometry
const slabArea = parseFloat(getModeAwareValue("d_95", isReferenceCalculation)) || 0;
const basementWallArea = parseFloat(getModeAwareValue("d_94", isReferenceCalculation)) || 0;

const hasBasement = basementWallArea > 0;
const hasSlab = slabArea > 0;

// Calculate basement depth from wall area
const perimeter = 2 * (length + width);
const basementDepth = hasBasement ? basementWallArea / perimeter : 0;

// Store in geometry object
solvedGeometry.belowGrade = {
  hasBasement: hasBasement,
  hasSlab: hasSlab,
  basementDepth: basementDepth,
  slabArea: slabArea,
  basementWallArea: basementWallArea,
  foundationType: determineFoundationType(hasSlab, hasBasement, slabArea, basementWallArea)
};
```

**Add helper function**:

```javascript
function determineFoundationType(hasSlab, hasBasement, slabArea, basementWallArea) {
  if (hasBasement && hasSlab) return "full-basement";
  if (hasSlab && !hasBasement) return "slab-on-grade";
  if (!hasSlab && !hasBasement) return "raised-floor";
  if (hasBasement && !hasSlab) return "basement-no-slab";
  return "unknown";
}
```

**Test Criteria**:
- ✅ `solvedGeometry.belowGrade` object populated correctly
- ✅ Basement depth calculation: `depth = wallArea / perimeter`
- ✅ Foundation type detection works for all scenarios
- ✅ No regression in above-grade geometry

---

### Step 2: Add Grade Line Rendering (15 min)

**Location**: [Section19.js:769-1024](../../src/sections/Section19.js#L769-L1024) - `updateVisualization()`

**Add after wireframe rendering, before dimension annotations**:

```javascript
// Draw grade line if ground-facing components exist
if (geometry.belowGrade.hasBasement || geometry.belowGrade.hasSlab) {
  const gradeColor = "#8b4513"; // Brown (matches text-ground-facing)

  // Calculate endpoints in isometric projection
  const gradeLeft = toIso(-width / 2 - 10, -length / 2, 0);
  const gradeRight = toIso(width / 2 + 10, -length / 2, 0);

  // Create dashed line at z=0
  const gradeLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  gradeLine.setAttribute("x1", gradeLeft.x);
  gradeLine.setAttribute("y1", gradeLeft.y);
  gradeLine.setAttribute("x2", gradeRight.x);
  gradeLine.setAttribute("y2", gradeRight.y);
  gradeLine.setAttribute("stroke", gradeColor);
  gradeLine.setAttribute("stroke-width", "2");
  gradeLine.setAttribute("stroke-dasharray", "8,4");
  svg.appendChild(gradeLine);

  // Add "Grade" label
  const gradeLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  gradeLabel.setAttribute("x", gradeRight.x + 15);
  gradeLabel.setAttribute("y", gradeRight.y + 5);
  gradeLabel.setAttribute("fill", gradeColor);
  gradeLabel.setAttribute("font-family", "-apple-system, BlinkMacSystemFont, sans-serif");
  gradeLabel.setAttribute("font-size", "10");
  gradeLabel.setAttribute("font-style", "italic");
  gradeLabel.textContent = "Grade";
  svg.appendChild(gradeLabel);
}
```

**Test Criteria**:
- ✅ Grade line appears when `d_94 > 0` OR `d_95 > 0`
- ✅ Grade line does NOT appear for raised floor only (`d_87 > 0`, `d_94 = 0`, `d_95 = 0`)
- ✅ Brown color (#8b4513) matches `text-ground-facing` class
- ✅ Dashed style clearly distinguishes from building edges
- ✅ "Grade" label visible and positioned correctly

---

### Step 3: Render Basement Walls (30 min)

**Location**: Same as Step 2 - `updateVisualization()`

**Add basement wall rendering**:

```javascript
// Draw basement walls if present
if (geometry.belowGrade.hasBasement) {
  const gradeColor = "#8b4513";
  const basementDepth = geometry.belowGrade.basementDepth;

  // Define grade-level nodes (z=0)
  const gradeNodes = [
    { x: -width / 2, y: -length / 2, z: 0 },
    { x: width / 2, y: -length / 2, z: 0 },
    { x: width / 2, y: length / 2, z: 0 },
    { x: -width / 2, y: length / 2, z: 0 }
  ];

  // Define basement floor nodes (z=-depth)
  const basementNodes = gradeNodes.map(node => ({
    ...node,
    z: -basementDepth
  }));

  // Draw vertical edges (basement walls) - DASHED for hidden line effect
  for (let i = 0; i < 4; i++) {
    const topNode = toIso(gradeNodes[i].x, gradeNodes[i].y, gradeNodes[i].z);
    const bottomNode = toIso(basementNodes[i].x, basementNodes[i].y, basementNodes[i].z);

    const edge = createLine(topNode, bottomNode, gradeColor, 3);
    edge.setAttribute("stroke-dasharray", "8,4"); // Hidden line (below ground)
    svg.appendChild(edge);
  }

  // Draw basement floor perimeter edges - DASHED for hidden line effect
  for (let i = 0; i < 4; i++) {
    const node1 = basementNodes[i];
    const node2 = basementNodes[(i + 1) % 4];
    const p1 = toIso(node1.x, node1.y, node1.z);
    const p2 = toIso(node2.x, node2.y, node2.z);

    const edge = createLine(p1, p2, gradeColor, 3);
    edge.setAttribute("stroke-dasharray", "8,4"); // Hidden line (below ground)
    svg.appendChild(edge);
  }

  // Draw basement floor nodes (brown circles)
  basementNodes.forEach(node => {
    const point = toIso(node.x, node.y, node.z);
    const circle = createNode(point, gradeColor, 5);
    svg.appendChild(circle);
  });

  // Add basement depth annotation
  const depthLabelPos = toIso(-width / 2 - 10, length / 2, -basementDepth / 2);
  const depthLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  depthLabel.setAttribute("x", depthLabelPos.x - 35);
  depthLabel.setAttribute("y", depthLabelPos.y);
  depthLabel.setAttribute("text-anchor", "middle");
  depthLabel.setAttribute("fill", gradeColor);
  depthLabel.setAttribute("font-family", "-apple-system, BlinkMacSystemFont, sans-serif");
  depthLabel.setAttribute("font-size", "11");
  depthLabel.textContent = `${basementDepth.toFixed(1)}m`;
  svg.appendChild(depthLabel);
}
```

**Test Criteria**:
- ✅ Basement walls render as brown **dashed** vertical lines from z=0 to z=-depth
- ✅ Basement floor perimeter renders as brown **dashed** lines at z=-depth
- ✅ Hidden line effect communicates "below ground"
- ✅ Brown nodes at basement floor corners
- ✅ Depth annotation shows basement depth in meters
- ✅ Basement depth is reasonable (typical: 2-3m for ~200-300m² wall area)
- ✅ No basement rendering when `d_94 = 0`

---

### Step 4: Render Slab-on-Grade (20 min)

**Location**: Same as Steps 2-3 - `updateVisualization()`

**Add slab rendering**:

```javascript
// Draw slab-on-grade if present (and no basement)
if (geometry.belowGrade.hasSlab && !geometry.belowGrade.hasBasement) {
  const gradeColor = "#8b4513";

  // Slab is at grade level (z=0) - render as SOLID (visible, at grade)
  const slabNodes = [
    { x: -width / 2, y: -length / 2, z: 0 },
    { x: width / 2, y: -length / 2, z: 0 },
    { x: width / 2, y: length / 2, z: 0 },
    { x: -width / 2, y: length / 2, z: 0 }
  ];

  // Draw slab perimeter - SOLID (at grade, visible)
  for (let i = 0; i < 4; i++) {
    const node1 = slabNodes[i];
    const node2 = slabNodes[(i + 1) % 4];
    const p1 = toIso(node1.x, node1.y, node1.z);
    const p2 = toIso(node2.x, node2.y, node2.z);

    const edge = createLine(p1, p2, gradeColor, 3); // Same weight as other vectors
    // NO stroke-dasharray - solid line for at-grade component
    svg.appendChild(edge);
  }

  // Draw brown nodes at slab corners
  slabNodes.forEach(node => {
    const point = toIso(node.x, node.y, node.z);
    const circle = createNode(point, gradeColor, 5); // Same size as other nodes
    svg.appendChild(circle);
  });
}
```

**Test Criteria**:
- ✅ Slab perimeter renders in brown at z=0 when `d_95 > 0` and `d_94 = 0`
- ✅ **Solid line** (not dashed) - indicates at-grade (visible) component
- ✅ Same stroke weight (3px) as all other vectors
- ✅ Brown nodes at corners (same size as other nodes)
- ✅ Grade line + slab rendering combined correctly
- ✅ No slab rendering when `d_95 = 0`
- ✅ Visual distinction: solid slab vs dashed basement

---

### Step 5: Add Ag Area Label (15 min)

**Location**: Same as Steps 2-4 - `updateVisualization()`

**Add below-grade area summary**:

```javascript
// Add Ag (Area Exposed to Ground) label if below-grade components exist
if (geometry.belowGrade.hasBasement || geometry.belowGrade.hasSlab) {
  const gradeColor = "#8b4513";
  const agTotal = geometry.belowGrade.slabArea + geometry.belowGrade.basementWallArea;

  // Position label below basement geometry (or below grade line if no basement)
  const labelZ = geometry.belowGrade.hasBasement ? -geometry.belowGrade.basementDepth - 5 : -5;
  const labelPos = toIso(0, 0, labelZ);

  const agLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  agLabel.setAttribute("x", labelPos.x);
  agLabel.setAttribute("y", labelPos.y);
  agLabel.setAttribute("text-anchor", "middle");
  agLabel.setAttribute("fill", gradeColor);
  agLabel.setAttribute("font-family", "-apple-system, BlinkMacSystemFont, sans-serif");
  agLabel.setAttribute("font-size", "12");
  agLabel.setAttribute("font-weight", "600");
  agLabel.textContent = `Ag: ${agTotal.toFixed(1)} m²`;
  svg.appendChild(agLabel);

  // Add foundation type subtitle
  const typeLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  typeLabel.setAttribute("x", labelPos.x);
  typeLabel.setAttribute("y", labelPos.y + 14);
  typeLabel.setAttribute("text-anchor", "middle");
  typeLabel.setAttribute("fill", gradeColor);
  typeLabel.setAttribute("font-family", "-apple-system, BlinkMacSystemFont, sans-serif");
  typeLabel.setAttribute("font-size", "10");
  typeLabel.setAttribute("font-style", "italic");

  const typeNames = {
    "full-basement": "Full Basement",
    "slab-on-grade": "Slab-on-Grade",
    "raised-floor": "Raised Floor",
    "basement-no-slab": "Basement (no slab)"
  };
  typeLabel.textContent = typeNames[geometry.belowGrade.foundationType] || "Unknown";
  svg.appendChild(typeLabel);
}
```

**Test Criteria**:
- ✅ Ag total = `d_94 + d_95` (matches S12's `d_102`)
- ✅ Label positioned below basement geometry
- ✅ Foundation type subtitle shows correct classification
- ✅ Brown color consistent with ground-facing theme

---

### Step 6: Handle Edge Cases (30 min)

**Mixed Foundation Warning** - When `d_87 > 0` AND (`d_94 > 0` OR `d_95 > 0`):

```javascript
// Add warning indicator for mixed foundations
if (geometry.belowGrade.hasRaisedFloor && (geometry.belowGrade.hasBasement || geometry.belowGrade.hasSlab)) {
  const warningPos = toIso(width / 2 + 15, -length / 2, storyHeight);

  const warningBadge = document.createElementNS("http://www.w3.org/2000/svg", "text");
  warningBadge.setAttribute("x", warningPos.x);
  warningBadge.setAttribute("y", warningPos.y);
  warningBadge.setAttribute("fill", "#ff9800");
  warningBadge.setAttribute("font-size", "14");
  warningBadge.textContent = "⚠️";
  svg.appendChild(warningBadge);

  const warningLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  warningLabel.setAttribute("x", warningPos.x + 20);
  warningLabel.setAttribute("y", warningPos.y);
  warningLabel.setAttribute("fill", "#ff9800");
  warningLabel.setAttribute("font-family", "-apple-system, BlinkMacSystemFont, sans-serif");
  warningLabel.setAttribute("font-size", "10");
  warningLabel.textContent = "Mixed foundation";
  svg.appendChild(warningLabel);
}
```

**Test Cases**:

| d_87 (Floor) | d_94 (Basement Wall) | d_95 (Slab) | Expected Rendering | Warning |
|--------------|---------------------|-------------|-------------------|---------|
| 0 | 0 | 100 | Slab-on-grade only | No |
| 0 | 200 | 100 | Full basement | No |
| 0 | 200 | 0 | Basement walls only | No |
| 100 | 0 | 0 | Raised floor (blue), no grade line | No |
| 100 | 0 | 100 | Slab + raised floor | ⚠️ Yes |
| 100 | 200 | 100 | Basement + raised floor | ⚠️ Yes |

**Test Criteria**:
- ✅ Warning badge appears for mixed foundations
- ✅ All 6 test cases render correctly
- ✅ No crashes for unusual input combinations
- ✅ Visualization makes sense even for edge cases

---

### Step 7: Update Info Modal (15 min)

**Location**: [Section19.js:1079-1133](../../src/sections/Section19.js#L1079-L1133) - `showInfoModal()`

**Add below-grade explanation**:

```javascript
// Update modal content
content.innerHTML = `
  <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6;">
    WOMBAT shows how <strong>OBJECTIVE "sees" your building</strong> based on thermal areas you entered.
    This is NOT a 3D architectural model - it's a <strong>thermal topology</strong> where areas drive form.
  </p>
  <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8;">
    <li><strong>Volume is sacred:</strong> Section12's volume parameter is always preserved exactly</li>
    <li><strong>Stories constrain height:</strong> Building height = volume ÷ (area ÷ stories)</li>
    <li><strong>Aspect ratio shapes footprint:</strong> 0 = square, ±4 = 5:1 ratio</li>
    <li><strong>Roof pitch emerges from roof area:</strong> Larger roof = steeper pitch</li>
    <li><strong>Below-grade geometry (NEW):</strong> Brown = ground-facing (Ag), Blue/Red = air-facing (Ae)</li>
    <li><strong>Grade line at z=0:</strong> Shows separation between above and below grade</li>
    <li style="color: #dc3545;"><strong>⚠ Abstract representation:</strong> This models thermal boundaries, not exact building geometry</li>
  </ul>
`;
```

**Test Criteria**:
- ✅ Info modal explains below-grade visualization
- ✅ Color coding explained (brown = ground-facing)
- ✅ Grade line concept documented

---

### Step 8: Testing & Validation (45 min)

**Test Matrix**:

| Test Scenario | S11 Inputs | Expected S19 Rendering | Line Style | Ae/Ag Values |
|---------------|------------|------------------------|------------|--------------|
| **Slab-on-grade** | d_95=100, d_94=0, d_87=0 | Brown **solid** perimeter at z=0, dashed grade line | Solid (at grade) | Ag=100 |
| **Full basement** | d_95=100, d_94=300, d_87=0 | Brown **dashed** box below grade, depth ~2.5m | Dashed (hidden) | Ag=400 |
| **Raised floor only** | d_87=100, d_94=0, d_95=0 | Blue floor, NO grade line, NO brown | Solid blue | Ag=0, Ae includes floor |
| **Basement no slab** | d_94=300, d_95=0, d_87=0 | Brown **dashed** walls extending down, no floor | Dashed (hidden) | Ag=300 |
| **Mixed: Slab + Raised** | d_87=50, d_95=50 | Brown **solid** slab + warning badge | Solid + warning | Ag=50, ⚠️ shown |
| **Multi-story + basement** | d_199=3, d_94=300, d_95=100 | 3 stories blue solid above + brown **dashed** basement | Solid above, dashed below | Ag=400 |

**Validation Checklist**:
- ✅ All 6 test scenarios render correctly
- ✅ Target mode works
- ✅ Reference mode works (red geometry)
- ✅ Mode switching updates below-grade geometry correctly
- ✅ Below-grade geometry updates when S11 fields change
- ✅ Activation/deactivation doesn't break
- ✅ No console errors
- ✅ No regression in above-grade visualization
- ✅ Ag total in info overlay matches S12's d_102
- ✅ Basement depth is reasonable for given wall area
- ✅ Dynamic scaling works with below-grade geometry included

**Performance**:
- ✅ Rendering performance acceptable (< 100ms for recalculation)
- ✅ No memory leaks on repeated activation/deactivation

---

## File Modifications

**Modified Files**:
1. `src/sections/Section19.js`
   - `solveGeometry()` - Add Phase 5 calculations (~30 lines)
   - `updateVisualization()` - Add below-grade rendering (~150 lines)
   - `showInfoModal()` - Update documentation (~5 lines)

**No new files required** - all changes within existing Section19.js

**Estimated Lines Added**: ~185 lines
**Estimated Lines Modified**: ~10 lines

---

## Success Criteria

### Must Have (MVP):
- ✅ Grade line appears when ground-facing components exist
- ✅ Basement walls render as brown vertical vectors
- ✅ Slab-on-grade renders as brown perimeter at z=0
- ✅ Brown color (#8b4513) matches `text-ground-facing` class
- ✅ Ag total label shows `d_94 + d_95`
- ✅ Both Target and Reference modes work
- ✅ No regression in above-grade visualization

### Nice to Have:
- ✅ Foundation type classification and labeling
- ✅ Mixed foundation warning badge
- ✅ Basement depth annotation
- ✅ Updated info modal documentation

### Future Enhancements (Phase 3+):
- Below-grade window wells (if windows allocated to basement)
- Ground temperature gradient visualization
- Frost depth indicator
- Walkout basement detection (asymmetric basement)

---

## Rollback Plan

If implementation fails or causes regressions:

1. **Immediate rollback**: `git checkout HEAD -- src/sections/Section19.js`
2. **Create bug branch**: `git checkout -b WOMBAT-BELOW-GRADE-FIX`
3. **Isolate issue**: Test each step independently
4. **Fix or defer**: Either fix specific step or defer feature to later release

**Critical**: Do not merge if ANY regression in above-grade visualization occurs.

---

## References

- [S19-WOMBAT-3.md](./S19-WOMBAT-3.md) - Main WOMBAT documentation
- [Section19.js](../../src/sections/Section19.js) - Implementation file
- Section 11 - Source of `d_94`, `d_95` data
- Section 12 - Source of `d_102` (Ag total) for validation

---

**Document Status**: ACTIVE - Implementation workplan
**Created**: 2025-12-14
**Next Action**: Begin implementation with Step 1 (Geometry Solver)
