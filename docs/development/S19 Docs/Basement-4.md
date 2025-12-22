# Basement Integration for Rational Trigonometry WOMBAT
**Status**: 📋 Planning Phase
**Created**: 2025-12-21
**Target**: Integrate basement geometry into RT-optimized Section19.js
**Context**: Building on completed rational trigonometry optimization

---

## Executive Summary

Integrate below-grade basement geometry into the newly refactored rational trigonometry WOMBAT codebase. The original implementation (Section19.js.backup) has been replaced with an optimized version using explicit quadrance notation and spread ratios. This workplan adapts the basement integration to work with the new architecture while preserving the critical volume constraint logic.

**Key Insight from Backup**: Basement volume must be **subtracted from total conditioned volume** before calculating wall height, because basements are part of the conditioned space but below grade.

---

## CRITICAL: Air-Facing vs Ground-Facing Distinction

### Color Coding by Thermal Boundary Type

**The fundamental rule**: Color indicates what the surface **faces**, not where it is located.

| Surface Type | Faces | Color | S11 Field | Example |
|--------------|-------|-------|-----------|---------|
| **Slab-on-Grade** | Ground | Brown | d_95 | Concrete slab on soil |
| **Basement Wall** | Ground | Brown | d_94 | Below-grade foundation wall |
| **Raised Floor** | Air | Blue/Red | d_87 | Floor over crawlspace or pilings |
| **Above-Grade Wall** | Air | Blue/Red | d_86 | Standard exterior walls |
| **Roof** | Air | Blue/Red | d_85 | Roof surfaces |

### Key Scenarios

**Scenario 1: Slab-on-Grade** (d_95 > 0, d_94 = 0, d_87 = 0)
- Brown solid perimeter at z=0 (at grade, visible)
- Grade line (dashed) at z=0
- **Basement is NOT a storey** - it's below-grade conditioned space

**Scenario 2: Raised Floor / Crawlspace** (d_87 > 0, d_95 = 0, d_94 = 0)
- **Blue/Red floor perimeter** at z=0 (air-facing, NOT brown)
- **NO grade line** (building doesn't touch ground)
- NO brown geometry (nothing faces ground)
- Floor is elevated above grade or over ventilated crawlspace

**Scenario 3: Full Basement** (d_94 > 0, d_95 > 0, d_87 = 0)
- Brown dashed basement walls from z=0 to z=-depth (hidden, below ground)
- Brown dashed basement floor at z=-depth
- Grade line at z=0
- Blue/Red walls start at z=0 and go up

**Scenario 4: Mixed Foundation** (d_87 > 0 AND (d_95 > 0 OR d_94 > 0))
- ⚠️ Warning badge (unusual - part of building on ground, part elevated)
- Render both components with appropriate colors
- Example: Garage slab + bedroom over crawlspace

### Visual Design Language

| Line Style | Location | Visibility | Example |
|------------|----------|------------|---------|
| **Solid Brown** | At grade (z=0) | Visible | Slab-on-grade perimeter |
| **Dashed Brown** | Below grade (z<0) | Hidden (below ground) | Basement walls and floor |
| **Solid Blue/Red** | Above/at grade (z≥0) | Visible | Walls, raised floor, roof |
| **Dashed Brown (2px)** | z=0 horizontal | Grade plane indicator | Grade line marker |

### Rendering Decision Tree

```
Is d_95 > 0? (Slab on grade)
├─ YES: Draw brown SOLID perimeter at z=0
│   └─ Draw grade line (dashed, z=0)
└─ NO: Is d_87 > 0? (Raised floor)
    ├─ YES: Draw BLUE/RED floor perimeter at z=0
    │   └─ NO grade line (air-facing, not ground-facing)
    └─ NO: No floor perimeter

Is d_94 > 0? (Basement walls)
├─ YES: Calculate depth = d_94 / perimeter
│   ├─ Draw brown DASHED vertical walls (z=0 to z=-depth)
│   ├─ Draw brown DASHED floor perimeter (z=-depth)
│   ├─ Draw grade line if not already present
│   └─ Subtract basement_volume from d_105 before wall height calc
└─ NO: No basement geometry
```

---

## Architecture Context

### Current State (Post-RT Optimization)

**Completed Work (2025-12-21)**:
- ✅ Rational trigonometry math using explicit quadrance (Q) notation
- ✅ Spread ratio calculations for validation
- ✅ Carpenter's pitch ratio (rise:12) display in console and SVG
- ✅ Roof solvers: `solveGableRoof()`, `solveShedRoof()` with RT math
- ✅ Consistent X/Y axis mapping for shed and gable roofs
- ✅ Clean separation: Section19.js (geometry) + wombatRender.js (display)

**File Structure**:
- `Section19.js`: Geometry solver (constraint-driven "jello cube")
- `wombatRender.js`: SVG rendering (isometric projection, labels, legend)

### Key Differences from Backup

| Aspect | Backup (S19.backup) | Current (S19 RT-optimized) |
|--------|---------------------|---------------------------|
| **Roof Math** | Direct h² calculations | Explicit Q_slope, Q_height, spread |
| **Parameter Names** | ridgeLength/span (confusing) | shortDimension/longDimension (clear) |
| **Pitch Display** | None | rise:12 format (console + SVG) |
| **Rendering** | Inline in Section19.js | Delegated to wombatRender.js |
| **Return Objects** | Basic geometry | Includes pitchRise field |

---

## Critical Volume Constraint Logic (From Backup)

### The Basement Volume Problem

**User's SACRED d_105 volume constraint** = Total conditioned space, which includes:
1. Above-grade rectangular volume (walls × footprint)
2. Roof volume (triangular/pyramidal)
3. **Basement volume (below-grade conditioned space)**

**Math**:
```
d_105 (total) = basement_volume + wall_volume + roof_volume

Therefore:
wall_volume = d_105 - basement_volume - roof_volume
wall_height = wall_volume / footprint_area
```

**From backup lines 1407-1448**:
```javascript
// Calculate basement volume (below-grade conditioned space)
let basementVolume = 0;
if (hasBasement_early && perimeter > 0) {
  const basementDepth_early = basementWallArea_early / perimeter;
  basementVolume = footprintArea * basementDepth_early;
}

// Calculate roof volume
let roofVolume = 0;
if (roofType === "gable" && roofHeight > 0) {
  roofVolume = (footprintArea * roofHeight) / 2;
}

// CRITICAL: Subtract BOTH roof and basement from total conditioned volume
const rectangularVolume = conditionedVolume - roofVolume - basementVolume;
wallHeightFromVolume = rectangularVolume / footprintArea;
```

**Impact**: If basement = 300m³ and roof = 200m³, then wall volume is 500m³ less than d_105. This **dramatically reduces wall height** and can trigger the "absurd pancake" warning if d_105 is too small.

---

## Implementation Plan

### Phase 1: Geometry Solver Integration (Section19.js)

#### Step 1.1: Add Basement Calculation to Roof Solvers (30 min)

**Location**: After roof geometry is solved, before wall height calculation

**Add after line ~1155 in current Section19.js** (after roof solving, before wall height):

```javascript
// ========================================================================
// PHASE 3B: BASEMENT GEOMETRY (affects volume constraint)
// ========================================================================
// CRITICAL: Calculate basement BEFORE wall height, because basement volume
// must be subtracted from total conditioned volume (d_105)
// Basement is part of conditioned space, but below grade

const basementWallArea = parseFloat(getModeAwareValue("d_94", isReferenceCalculation)) || 0;
const slabArea = parseFloat(getModeAwareValue("d_95", isReferenceCalculation)) || 0;
const floorExposedToAir = parseFloat(getModeAwareValue("d_87", isReferenceCalculation)) || 0;

const hasBasement = basementWallArea > 0;
const hasSlab = slabArea > 0;
const hasRaisedFloor = floorExposedToAir > 0;

// Calculate basement depth from wall area and perimeter
let basementDepth = 0;
let basementVolume = 0;

if (hasBasement && perimeter > 0) {
  basementDepth = basementWallArea / perimeter;
  basementVolume = footprintArea * basementDepth;

  console.log(`[WOMBAT] Basement geometry:`);
  console.log(`  Basement wall area (d_94): ${basementWallArea.toFixed(2)} m²`);
  console.log(`  Basement depth: ${basementDepth.toFixed(2)} m`);
  console.log(`  Basement volume: ${basementVolume.toFixed(2)} m³ (part of conditioned space)`);
}

// Determine foundation type for rendering
function determineFoundationType(hasSlab, hasBasement, hasRaisedFloor) {
  if (hasBasement && hasSlab) return "full-basement";
  if (hasSlab && !hasBasement) return "slab-on-grade";
  if (!hasSlab && !hasBasement && hasRaisedFloor) return "raised-floor";
  if (hasBasement && !hasSlab) return "basement-no-slab";
  return "unknown";
}

const foundationType = determineFoundationType(hasSlab, hasBasement, hasRaisedFloor);
```

**Test Criteria**:
- ✅ Basement depth calculated correctly: `depth = d_94 / perimeter`
- ✅ Basement volume calculated: `volume = footprint × depth`
- ✅ Foundation type detection works for all cases
- ✅ No regression when d_94 = 0 (no basement)

#### Step 1.2: Update Volume Constraint Logic (30 min)

**Location**: Replace current wall height calculation (around line 1200+)

**Current code** (simplified):
```javascript
const wallVolume = targetVolume - roofResult.roofVolume;
const wallHeight = wallVolume / footprintArea;
```

**New code** (from backup, adapted to RT architecture):
```javascript
// CRITICAL: Subtract BOTH roof and basement from total conditioned volume
// This gives us ONLY the above-grade rectangular (box) volume
const rectangularVolume = targetVolume - roofResult.roofVolume - basementVolume;
const wallHeightFromVolume = rectangularVolume / footprintArea;

console.log(`[WOMBAT] Volume-constrained wall height:`);
console.log(`  Total conditioned volume (d_105): ${targetVolume.toFixed(2)} m³`);
console.log(`  Roof volume: ${roofResult.roofVolume.toFixed(2)} m³`);
console.log(`  Basement volume: ${basementVolume.toFixed(2)} m³`);
console.log(`  Above-grade rectangular volume: ${rectangularVolume.toFixed(2)} m³`);
console.log(`  Above-grade wall height: ${wallHeightFromVolume.toFixed(3)} m`);

// Validation: Check for impossible geometry
if (rectangularVolume < 100) {
  console.warn(`[WOMBAT] ⚠️  Above-grade volume very small (${rectangularVolume.toFixed(0)} m³)`);
  console.warn(`  This suggests inconsistent inputs:`);
  console.warn(`  - Total volume too small for roof + basement + walls`);
  console.warn(`  - OR roof area too large (cathedral ceiling?)`);
  console.warn(`  - OR basement too deep for building volume`);
}

const wallHeight = wallHeightFromVolume;
```

**Test Criteria**:
- ✅ Wall height reduces when basement volume is present
- ✅ Console shows all three volume components
- ✅ Warning triggers when rectangular volume < 100m³
- ✅ No regression when basement = 0

#### Step 1.3: Add Basement to Return Object (15 min)

**Location**: End of `solveGeometry()` function, around line 1285

**Add to return object**:
```javascript
return {
  footprint: { width, length },
  ridgeOrientation,
  roofType: roofResult.roofType,
  roofHeight: roofResult.roofHeight,
  roofVolume: roofResult.roofVolume,
  pitchRise: roofResult.pitchRise,
  wallHeight,
  wallVolume,
  calculatedVolume,
  targetVolume,
  volumeDifference,
  // ... other fields ...

  // NEW: Below-grade geometry
  belowGrade: {
    hasBasement,
    hasSlab,
    hasRaisedFloor,
    basementDepth,
    basementVolume,        // NEW: Critical for volume accounting
    slabArea,
    basementWallArea,
    foundationType,
  },

  nodes3D,
  profile2D,
  gableEndArea: roofResult.gableEndArea,
  shedEndWallArea: roofResult.shedEndWallArea,
};
```

**Test Criteria**:
- ✅ `geometry.belowGrade` object available in render functions
- ✅ All basement fields populated correctly
- ✅ Volume accounting preserved through return chain

---

### Phase 2: Rendering Integration (wombatRender.js)

#### Step 2.1: Add Grade Line Rendering (20 min)

**Location**: `wombatRender.js` - in `renderGeometry()` after main wireframe

**Add grade line visualization**:
```javascript
// Draw grade line if ground-facing components exist
if (geometry.belowGrade.hasBasement || geometry.belowGrade.hasSlab) {
  const gradeColor = "#8b4513"; // Brown (matches .text-ground-facing)
  const width = geometry.footprint.width;
  const length = geometry.footprint.length;

  // Grade line extends 10m beyond footprint for clarity
  const gradeStart = toIsometric(-width/2 - 10, -length/2, 0, scale, offsetX, offsetY);
  const gradeEnd = toIsometric(width/2 + 10, -length/2, 0, scale, offsetX, offsetY);

  // Dashed line at z=0
  const gradeLine = createSVGElement("line", {
    x1: gradeStart.x,
    y1: gradeStart.y,
    x2: gradeEnd.x,
    y2: gradeEnd.y,
    stroke: gradeColor,
    "stroke-width": "2",
    "stroke-dasharray": "8,4",
  });
  svg.appendChild(gradeLine);

  // Label
  const gradeLabel = createSVGElement("text", {
    x: gradeEnd.x + 15,
    y: gradeEnd.y + 5,
    fill: gradeColor,
    "font-size": "10",
    "font-style": "italic",
  });
  gradeLabel.textContent = "Grade";
  svg.appendChild(gradeLabel);
}
```

**Test Criteria**:
- ✅ Grade line appears when d_94 > 0 OR d_95 > 0
- ✅ Grade line does NOT appear for raised floor only (d_87 > 0, d_94 = 0, d_95 = 0)
- ✅ Brown color matches CSS `.text-ground-facing`
- ✅ Dashed style distinguishes from building edges

#### Step 2.2: Render Basement Walls (40 min)

**Location**: Same section in `wombatRender.js`

**Add basement wall visualization**:
```javascript
// Draw basement walls if present
if (geometry.belowGrade.hasBasement) {
  const gradeColor = "#8b4513";
  const basementDepth = geometry.belowGrade.basementDepth;
  const width = geometry.footprint.width;
  const length = geometry.footprint.length;

  // Grade-level corners (z=0)
  const gradeCorners = [
    { x: -width/2, y: -length/2, z: 0 },
    { x: width/2, y: -length/2, z: 0 },
    { x: width/2, y: length/2, z: 0 },
    { x: -width/2, y: length/2, z: 0 },
  ];

  // Basement floor corners (z=-depth)
  const basementCorners = gradeCorners.map(c => ({ ...c, z: -basementDepth }));

  // Draw vertical edges (basement walls) - DASHED (hidden line effect)
  gradeCorners.forEach((top, i) => {
    const bottom = basementCorners[i];
    const p1 = toIsometric(top.x, top.y, top.z, scale, offsetX, offsetY);
    const p2 = toIsometric(bottom.x, bottom.y, bottom.z, scale, offsetX, offsetY);

    const edge = createSVGElement("line", {
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      stroke: gradeColor,
      "stroke-width": "3",
      "stroke-dasharray": "8,4", // Hidden line (below ground)
    });
    svg.appendChild(edge);
  });

  // Draw basement floor perimeter - DASHED
  basementCorners.forEach((corner, i) => {
    const next = basementCorners[(i + 1) % 4];
    const p1 = toIsometric(corner.x, corner.y, corner.z, scale, offsetX, offsetY);
    const p2 = toIsometric(next.x, next.y, next.z, scale, offsetX, offsetY);

    const edge = createSVGElement("line", {
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      stroke: gradeColor,
      "stroke-width": "3",
      "stroke-dasharray": "8,4",
    });
    svg.appendChild(edge);
  });

  // Draw basement corner nodes (brown circles)
  basementCorners.forEach(corner => {
    const p = toIsometric(corner.x, corner.y, corner.z, scale, offsetX, offsetY);
    const node = createSVGElement("circle", {
      cx: p.x,
      cy: p.y,
      r: "5",
      fill: gradeColor,
    });
    svg.appendChild(node);
  });

  // Depth annotation
  const depthMidpoint = toIsometric(-width/2 - 10, length/2, -basementDepth/2, scale, offsetX, offsetY);
  const depthLabel = createSVGElement("text", {
    x: depthMidpoint.x - 35,
    y: depthMidpoint.y,
    fill: gradeColor,
    "font-size": "11",
    "text-anchor": "middle",
  });
  depthLabel.textContent = `${basementDepth.toFixed(1)}m`;
  svg.appendChild(depthLabel);
}
```

**Visual Design Principle**:
- **Dashed lines** = below ground (hidden line convention from technical drawing)
- **Solid lines** = at/above grade (visible)

**Test Criteria**:
- ✅ Basement walls render as brown dashed verticals from z=0 to z=-depth
- ✅ Basement floor perimeter dashed at z=-depth
- ✅ Brown nodes at basement corners
- ✅ Depth annotation shows correct value
- ✅ No rendering when d_94 = 0

#### Step 2.3: Render Slab-on-Grade (25 min)

**Location**: Same section in `wombatRender.js`

**Add slab visualization**:
```javascript
// Draw slab-on-grade if present (and no basement)
if (geometry.belowGrade.hasSlab && !geometry.belowGrade.hasBasement) {
  const gradeColor = "#8b4513";
  const width = geometry.footprint.width;
  const length = geometry.footprint.length;

  // Slab corners at grade (z=0)
  const slabCorners = [
    { x: -width/2, y: -length/2, z: 0 },
    { x: width/2, y: -length/2, z: 0 },
    { x: width/2, y: length/2, z: 0 },
    { x: -width/2, y: length/2, z: 0 },
  ];

  // Draw slab perimeter - SOLID (at grade, visible)
  slabCorners.forEach((corner, i) => {
    const next = slabCorners[(i + 1) % 4];
    const p1 = toIsometric(corner.x, corner.y, corner.z, scale, offsetX, offsetY);
    const p2 = toIsometric(next.x, next.y, next.z, scale, offsetX, offsetY);

    const edge = createSVGElement("line", {
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      stroke: gradeColor,
      "stroke-width": "3",
      // NO stroke-dasharray - solid line for at-grade component
    });
    svg.appendChild(edge);
  });

  // Draw corner nodes
  slabCorners.forEach(corner => {
    const p = toIsometric(corner.x, corner.y, corner.z, scale, offsetX, offsetY);
    const node = createSVGElement("circle", {
      cx: p.x,
      cy: p.y,
      r: "5",
      fill: gradeColor,
    });
    svg.appendChild(node);
  });
}
```

**Test Criteria**:
- ✅ Slab perimeter renders in brown SOLID lines at z=0 when d_95 > 0 and d_94 = 0
- ✅ Solid vs dashed clearly distinguishes slab from basement
- ✅ Brown nodes at corners
- ✅ No slab when d_95 = 0

#### Step 2.3b: Handle Raised Floor (BLUE, not brown!) (15 min)

**Location**: Same section in `wombatRender.js`

**CRITICAL**: Raised floor (d_87) is **AIR-FACING**, not ground-facing!

**Add raised floor detection**:
```javascript
// CRITICAL: Raised floor is AIR-FACING, render in mode color (blue/red), NOT brown
// This represents floor over crawlspace or elevated building (on pilings, etc.)
if (geometry.belowGrade.hasRaisedFloor && !geometry.belowGrade.hasSlab) {
  const floorColor = mode === "reference" ? "#dc3545" : "#007bff"; // Red for ref, blue for target
  const width = geometry.footprint.width;
  const length = geometry.footprint.length;

  // Floor corners at z=0 (NOT below grade - it's air-facing)
  const floorCorners = [
    { x: -width/2, y: -length/2, z: 0 },
    { x: width/2, y: -length/2, z: 0 },
    { x: width/2, y: length/2, z: 0 },
    { x: -width/2, y: length/2, z: 0 },
  ];

  // Draw floor perimeter - SOLID in mode color (air-facing surface)
  floorCorners.forEach((corner, i) => {
    const next = floorCorners[(i + 1) % 4];
    const p1 = toIsometric(corner.x, corner.y, corner.z, scale, offsetX, offsetY);
    const p2 = toIsometric(next.x, next.y, next.z, scale, offsetX, offsetY);

    const edge = createSVGElement("line", {
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      stroke: floorColor, // BLUE/RED - air-facing, NOT brown
      "stroke-width": "3",
      // Solid line - it's visible (air-facing)
    });
    svg.appendChild(edge);
  });

  // Draw corner nodes in mode color
  floorCorners.forEach(corner => {
    const p = toIsometric(corner.x, corner.y, corner.z, scale, offsetX, offsetY);
    const node = createSVGElement("circle", {
      cx: p.x,
      cy: p.y,
      r: "5",
      fill: floorColor,
    });
    svg.appendChild(node);
  });

  // Add "Raised Floor" label
  const labelPos = toIsometric(0, -length/2 - 5, 0, scale, offsetX, offsetY);
  const label = createSVGElement("text", {
    x: labelPos.x,
    y: labelPos.y,
    fill: floorColor,
    "font-size": "10",
    "font-style": "italic",
    "text-anchor": "middle",
  });
  label.textContent = "Raised Floor (Air-Facing)";
  svg.appendChild(label);
}
```

**Test Criteria**:
- ✅ Raised floor renders in BLUE (target) or RED (reference) when d_87 > 0 and d_95 = 0
- ✅ NO brown color (air-facing, not ground-facing)
- ✅ NO grade line when only raised floor (building doesn't touch ground)
- ✅ Solid lines (visible surface)
- ✅ Labeled "Raised Floor (Air-Facing)" for clarity
- ✅ No raised floor rendering when d_87 = 0

#### Step 2.4: Update Legend Block (20 min)

**Location**: `wombatRender.js` - legend rendering section

**Add Ag (Area exposed to Ground) to legend**:
```javascript
// After displaying roof area and pitch...

// Below-grade area (Ag) if present
if (geometry.belowGrade.hasBasement || geometry.belowGrade.hasSlab) {
  const agTotal = geometry.belowGrade.basementWallArea + geometry.belowGrade.slabArea;

  const agText = createText(
    xOffset,
    yOffset,
    `Ag (Ground): ${agTotal.toFixed(2)} m²`,
    "#8b4513", // Brown
    11
  );
  svg.appendChild(agText);
  yOffset += lineHeight;

  // Foundation type subtitle
  const typeNames = {
    "full-basement": "Full Basement",
    "slab-on-grade": "Slab-on-Grade",
    "raised-floor": "Raised Floor",
    "basement-no-slab": "Basement (no slab)",
  };

  const typeText = createText(
    xOffset + 10,
    yOffset,
    typeNames[geometry.belowGrade.foundationType] || "Unknown",
    "#8b4513",
    9
  );
  typeText.setAttribute("font-style", "italic");
  svg.appendChild(typeText);
  yOffset += lineHeight;
}
```

**Test Criteria**:
- ✅ Ag total displays when basement or slab present
- ✅ Ag = d_94 + d_95 (matches S12's d_102)
- ✅ Foundation type subtitle shows correct classification
- ✅ Brown color consistent with ground-facing theme

---

### Phase 3: Testing & Validation (60 min)

#### Test Matrix

| Scenario | d_94 (Basement) | d_95 (Slab) | d_87 (Raised) | Expected Visual | Volume Impact |
|----------|----------------|-------------|---------------|-----------------|---------------|
| **No basement** | 0 | 0 | 0 | No brown, no grade line | None (current behavior) |
| **Slab only** | 0 | 100 | 0 | Brown solid perimeter at z=0, grade line | None (slab at grade) |
| **Full basement** | 300 | 100 | 0 | Brown dashed box below grade | -basement_volume from walls |
| **Basement no slab** | 300 | 0 | 0 | Brown dashed walls, no floor | -basement_volume from walls |
| **Raised floor only** | 0 | 0 | 100 | Blue floor, NO brown, NO grade | None (all above grade) |
| **Mixed: Slab + Raised** | 0 | 50 | 50 | Brown slab + warning badge | None, but shows warning |
| **Multi-story + basement** | 300 | 100 | 0 | 3 blue stories + brown basement | -300m³ = pancake warning likely |

#### Validation Checklist

**Volume Constraint**:
- ✅ Wall height correctly reduced when basement present
- ✅ Formula: `wall_height = (d_105 - roof_vol - basement_vol) / footprint`
- ✅ Console shows breakdown: total, roof, basement, rectangular
- ✅ Warning when rectangular volume < 100m³
- ✅ "Absurd pancake" appears when d_105 too small for basement+roof

**Visual Rendering**:
- ✅ Grade line appears when appropriate
- ✅ Basement walls dashed (hidden line effect)
- ✅ Slab-on-grade solid (at grade, visible)
- ✅ Brown color (#8b4513) consistent
- ✅ Basement depth annotation correct
- ✅ Ag total in legend = d_94 + d_95

**Dual-State**:
- ✅ Target mode works with basement
- ✅ Reference mode works with basement (red geometry)
- ✅ Mode switching updates basement correctly
- ✅ ref_d_94 and ref_d_95 read correctly

**Edge Cases**:
- ✅ d_94 = 0: No basement rendering
- ✅ d_95 = 0, d_94 > 0: Basement walls only, no floor
- ✅ Very deep basement (d_94 = 600): Triggers volume warning
- ✅ Mixed foundation: Warning badge appears

**Performance**:
- ✅ Rendering < 100ms with basement geometry
- ✅ No memory leaks on repeated activation
- ✅ No regression in above-grade visualization

---

## Migration from Backup

### What to Keep from Backup

1. **Volume constraint logic** (lines 1407-1473) - CRITICAL
   - Basement volume calculation
   - Rectangular volume = total - roof - basement
   - Warning for small rectangular volume

2. **Foundation type detection** (lines 1574-1580)
   - `determineFoundationType()` function
   - Returns: full-basement, slab-on-grade, raised-floor, basement-no-slab

3. **Below-grade data structure** (lines 1612-1620)
   - `belowGrade` object in return
   - Fields: hasBasement, hasSlab, basementDepth, etc.

### What to Adapt for RT Architecture

1. **Integration point**: Insert basement calc AFTER roof solving (which is now via `solveGableRoof()`/`solveShedRoof()`)
2. **Return structure**: Add `basementVolume` to `roofResult` objects for cleaner passing
3. **Rendering**: All SVG generation moves to `wombatRender.js`, not inline
4. **Pitch display**: Basement depth annotation should match pitch display style

### What NOT to Port

1. **Old roof math**: Backup uses direct h² calculations, we now use Q notation
2. **Old parameter names**: Backup has ridgeLength/span confusion, we use shortDimension/longDimension
3. **Inline rendering**: Backup mixes geometry and SVG, we separate concerns

---

## Success Criteria

### Must Have (MVP)
- ✅ Basement volume correctly subtracted from d_105 before wall height calc
- ✅ Grade line appears when ground-facing components exist
- ✅ Basement walls render as brown dashed verticals
- ✅ Slab-on-grade renders as brown solid perimeter at z=0
- ✅ Ag total label shows d_94 + d_95
- ✅ Both Target and Reference modes work
- ✅ No regression in above-grade visualization or RT math

### Nice to Have
- ✅ Foundation type classification and labeling
- ✅ Mixed foundation warning badge
- ✅ Basement depth annotation
- ✅ Updated info modal documentation
- ✅ Volume warning when basement+roof exceed d_105

### Out of Scope (Future)
- Below-grade window wells
- Ground temperature gradients
- Frost depth indicators
- Walkout basement detection

---

## File Modifications

**Files to Modify**:
1. `src/sections/Section19.js` (~100 lines added)
   - Add basement calculation after roof solving
   - Update volume constraint logic
   - Add `belowGrade` to return object

2. `src/core/wombatRender.js` (~150 lines added)
   - Grade line rendering
   - Basement wall rendering
   - Slab-on-grade rendering
   - Legend updates

**No new files required**

**Estimated Total**: ~250 lines added, ~20 lines modified

---

## Risk Assessment

**Low Risk**:
- ✅ Basement rendering is additive (doesn't change existing above-grade code)
- ✅ Volume logic well-tested in backup implementation
- ✅ RT math unaffected (basement happens after roof solving)

**Medium Risk**:
- ⚠️ Volume constraint change could trigger unexpected pancake warnings
- ⚠️ Mixed foundation edge cases need careful testing

**Mitigation**:
- Implement in feature branch `WOMBAT-BASEMENT-4`
- Test each phase independently
- Keep backup as reference for validation
- Document volume formula changes in console output

---

## Implementation Sequence

1. **Phase 1.1**: Add basement calc to Section19.js (30 min)
2. **Phase 1.2**: Update volume constraint logic (30 min)
3. **Phase 1.3**: Add belowGrade to return object (15 min)
4. **Test Phase 1**: Validate volume calculations (15 min)
5. **Phase 2.1**: Add grade line to wombatRender.js (20 min)
6. **Phase 2.2**: Render basement walls (40 min)
7. **Phase 2.3**: Render slab-on-grade (25 min)
8. **Phase 2.4**: Update legend (20 min)
9. **Test Phase 2**: Visual validation (30 min)
10. **Phase 3**: Comprehensive testing (60 min)
11. **Documentation**: Update PRISMATIC-TERMINOLOGY.md (30 min)

**Total Estimated Time**: 5.5 hours

---

## References

- Original workplan: [S19-BELOW-GRADE-WORKPLAN.md](./S19-BELOW-GRADE-WORKPLAN.md)
- Backup implementation: `Section19.js.backup` (lines 1400-1620)
- RT optimization commits: c6f176d, c1f5380, 8b4d93a
- Terminology doc: [PRISMATIC-TERMINOLOGY.md](./PRISMATIC-TERMINOLOGY.md)

---

**Document Status**: ACTIVE - Ready for implementation
**Created**: 2025-12-21
**Next Action**: Create feature branch and begin Phase 1.1
