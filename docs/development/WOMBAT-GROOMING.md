# WOMBAT Geometry Solver - Grooming Algorithm

**Status**: Planning
**Created**: 2025-12-15
**Branch**: WOMBAT-RT-ROOFS
**Goal**: Refine geometry solver to respect volumetric constraints and handle partial stories correctly

---

## Problem Statement

The current `solveGeometry()` function has volumetric inconsistencies:

**Current Issues:**
- Treats fractional stories (e.g., 1.5) as simple divisors
- Doesn't properly account for adiabatic mezzanines
- Wall height calculation violates volume constraint
- Roof area doesn't contribute to volume calculations

**Example (Default Model):**
- **Volume** (d_105): 8000 m³
- **Footprint** (d_95): 1100.42 m²
- **Conditioned Area** (h_15): 1427.2 m²
- **Stories** (d_103): 1.5
- **Expected Wall Height**: 8000 ÷ 1100.42 = **7.269 m**
- **Current Wall Height**: Incorrect due to story division

**Key Insight**: The mezzanine (326.78 m²) is **adiabatic** - it's inside the thermal envelope, not part of the exterior surface area.

---

## The 8 Sacred Constraints

### 1. Basement Detection (`d_94 > 0`)

**Rule**: If basement wall area exists, basement forms part of conditioned volume calculations.

```javascript
// Detect basement
const basementWallArea = parseFloat(getModeAwareValue("d_94", isRef)) || 0;
const hasBasement = basementWallArea > 0;

// If basement exists, add one level below grade
const basementLevel = hasBasement ? 1 : 0;
```

**Impact**:
- Adds a level to total levels count
- Basement perimeter = above-grade perimeter
- Basement depth = basementWallArea / perimeter

---

### 2. Stories Define Levels (`d_103`)

**Rule**: Stories can be fractional. Treat as:
- **Integer part**: Full-height levels
- **Fractional part**: Indicates adiabatic mezzanine OR conditioned space under pitched roof

```javascript
const storiesDeclared = parseFloat(getModeAwareValue("d_103", isRef)) || 1;
const fullLevels = Math.floor(storiesDeclared);
const hasFractionalStory = (storiesDeclared % 1) > 0;

// Total levels = basement (if any) + full levels + fractional level
const totalLevels = basementLevel + fullLevels + (hasFractionalStory ? 1 : 0);
```

**Interpretation**:
- 1.5 stories = 1 full level + 1 partial level (mezzanine)
- 2.0 stories = 2 full levels
- 2.5 stories = 2 full levels + 1 partial level

---

### 3. Total Wall Area Includes Windows (`d_86` + `d_88:d_92`)

**Rule**: Gross wall area = opaque walls + all window areas (excluding skylights d_93).

```javascript
const opaqueWallArea = parseFloat(getModeAwareValue("d_86", isRef)) || 0;
const window_N = parseFloat(getModeAwareValue("d_88", isRef)) || 0;
const window_E = parseFloat(getModeAwareValue("d_89", isRef)) || 0;
const window_S = parseFloat(getModeAwareValue("d_90", isRef)) || 0;
const window_W = parseFloat(getModeAwareValue("d_91", isRef)) || 0;
const window_other = parseFloat(getModeAwareValue("d_92", isRef)) || 0;

// Total wall area (gross)
const totalWallArea = opaqueWallArea + window_N + window_E + window_S + window_W + window_other;
```

**Note**:
- Skylights (d_93) are NOT part of wall area
- WWR calculation (d_107) should exclude d_93, note added to S12 header

---

### 4. Footprint is Sacred (`d_95`)

**Rule**: Footprint area defines the building's X-Y plane. All floors share this perimeter. Later when we integrate OBC Matrix, this will relate to the term 'Building Area'. 

```javascript
const footprintArea = parseFloat(getModeAwareValue("d_95", isRef)) || 100;

// Aspect ratio slider determines width/length split
const aspectRatioRaw = parseFloat(currentState.getValue("d_202") || 0);
const aspectRatio = aspectRatioRaw >= 0 ? 1 + aspectRatioRaw : 1 / (1 - aspectRatioRaw);

const width = Math.sqrt(footprintArea / aspectRatio);
const length = footprintArea / width;
const perimeter = 2 * (width + length);
```

**Derived Values**:
- Width and length from aspect ratio
- Perimeter used for basement and wall height calculations

---

### 5. Conditioned Area Reveals Mezzanines (`h_15`)

**Rule**: If conditioned area ≠ footprint × stories, the difference is an adiabatic mezzanine, stair-holes, atria, double-ht. spaces, etc. What matters is surfaces facing ground or air, which are accounted for.

```javascript
const conditionedArea = parseFloat(getModeAwareValue("h_15", isRef)) || 100;
const expectedArea = footprintArea * storiesDeclared;

// Mezzanine area (adiabatic internal floor)
const mezzanineArea = Math.max(0, conditionedArea - footprintArea * fullLevels);

console.log(`[WOMBAT] Mezzanine area: ${mezzanineArea.toFixed(2)} m²`);
```

**Example (1.5 stories)**:
- Footprint: 1100.42 m²
- Conditioned: 1427.2 m²
- Full levels: 1 × 1100.42 = 1100.42 m²
- **Mezzanine**: 1427.2 - 1100.42 = 326.78 m²

**Critical Insights**:
- Mezzanine does NOT add to exterior wall area!
- **Visualization concern**: The 3D model should NOT show "footprint area" labels on each floor level
  - ❌ WRONG: Showing "951 m²" on Level 1 and Level 2 (misleading)
  - ✅ CORRECT: Show actual floor areas OR just show footprint dimensions without area labels
  - For 1.5 stories: Level 1 = 1100.42 m², Level 2 (mezzanine) = 326.78 m²
  - OR: Just show "44.5m × 24.7m" without area labels to avoid confusion

---

### 6. Roof Area Determines Roof Type (`d_85`)

**Rule**: Compare roof area to footprint to detect roof geometry.

```javascript
const roofArea = parseFloat(getModeAwareValue("d_85", isRef)) || 100;
const areaRatio = roofArea / footprintArea;

let roofType = "flat";
if (areaRatio > 1.01) {
  roofType = "pyramidal"; // Multi-planar
} else if (areaRatio < 0.99) {
  roofType = "inverted"; // Visual indicator
}
```

**Roof Types**:
- `areaRatio ≈ 1.0`: Flat roof
- `areaRatio > 1.0`: Pitched/pyramidal (multiple planes)
- `areaRatio < 1.0`: Invalid (visual warning) 

---

### 7. Volume is LESS SACRED (`d_105`)

**CORRECTED RULE**: Volume is **VERIFICATION ONLY**, not a constraint. Surface areas are SACRED.

**Why Volume is Less Sacred:**
- Heat loss/gain calculations use **surface areas** (d_85, d_86, d_88-d_92), not volume
- Volume is primarily used in S13 Mechanical calculations (ACH, ventilation rates)
- If volume doesn't match calculated volume from surfaces, **surfaces win**

```javascript
const volumeDeclared = parseFloat(getModeAwareValue("d_105", isRef));

// Volume is NOT used to calculate wall height!
// It's used for VERIFICATION only
```

**Volume Calculation (from surfaces)**:
```
Total Volume = Below-Roof Volume + Roof Volume

Below-Roof Volume = footprint × wallHeight (where wallHeight comes from wall area!)
Roof Volume = (1/3) × footprint × roofHeight (pyramidal approximation)
```

**Critical**: Wall height is derived from **wall area ÷ perimeter**, NOT from volume!

---

### 8. Wall Height from Surfaces (MOST SACRED)

**CORRECTED RULE**: Wall height is calculated from wall surface areas, which are SACRED.

```javascript
// Phase 2: Wall height from SURFACE AREAS (MOST SACRED)

// Read window areas
const window_N = parseFloat(getModeAwareValue("d_88", isRef)) || 0;
const window_E = parseFloat(getModeAwareValue("d_89", isRef)) || 0;
const window_S = parseFloat(getModeAwareValue("d_90", isRef)) || 0;
const window_W = parseFloat(getModeAwareValue("d_91", isRef)) || 0;
const window_other = parseFloat(getModeAwareValue("d_92", isRef)) || 0;

// Total wall area (gross) = opaque walls + windows
const totalWallAreaGross = opaqueWallArea + window_N + window_E + window_S + window_W + window_other;

// Calculate perimeter from footprint
const perimeter = 2 * (width + length);

// Wall height from SURFACES (SACRED calculation)
const wallHeight = totalWallAreaGross / perimeter;

console.log(`[WOMBAT] Wall height from surfaces: ${wallHeight.toFixed(3)} m`);
```

**Then calculate roof height from roof area** (also SACRED):

```javascript
// Phase 3: Roof height from ROOF AREA (SACRED)
const areaRatio = roofArea / footprintArea;
const roofHeight = calculatePyramidalHeight(width, length, areaRatio);

// Total building height = wall height + roof height
const totalBuildingHeight = wallHeight + roofHeight;
```

**Finally, verify volume** (LESS SACRED):

```javascript
// Phase 3.5: Volume Verification (informational only)
const boxVolume = footprintArea * wallHeight;
const pyramidVolume = (1/3) * footprintArea * roofHeight;
const calculatedVolume = boxVolume + pyramidVolume;

if (volumeDeclared) {
  const volumeError = Math.abs(calculatedVolume - volumeDeclared);
  const volumeErrorPct = (volumeError / volumeDeclared) * 100;

  if (volumeErrorPct > 5) {
    console.warn(`[WOMBAT] Volume discrepancy ${volumeErrorPct.toFixed(1)}%`);
    console.warn(`  Declared (d_105): ${volumeDeclared.toFixed(2)} m³`);
    console.warn(`  Calculated from surfaces: ${calculatedVolume.toFixed(2)} m³`);
    console.warn(`  Using surface-derived dimensions (SACRED)`);
  }
}
```

---

## Revised Geometry Solver Algorithm

### Phase 0: Input Validation and Sacred Hierarchy

**CRITICAL PRINCIPLE: Surface Areas > Volume**

Surface areas are MORE sacred than volume because:
- Heat loss/gain calculations use **surface areas**, not volume
- 100% of declared surfaces = valid model, even if volume doesn't match
- Volume is only used in S13 Mechanical calculations (flag discrepancies there)

**NO FALLBACK VALUES** - Use StateManager values or throw errors:

```javascript
// Read all user inputs (NO fallbacks - fail loudly!)
const basementWallArea = parseFloat(getModeAwareValue("d_94", isRef));
const storiesDeclared = parseFloat(getModeAwareValue("d_103", isRef));
const opaqueWallArea = parseFloat(getModeAwareValue("d_86", isRef));
const footprintArea = parseFloat(getModeAwareValue("d_95", isRef)); // Slab area
const roofArea = parseFloat(getModeAwareValue("d_85", isRef));
const volumeDeclared = parseFloat(getModeAwareValue("d_105", isRef));
const conditionedArea = parseFloat(getModeAwareValue("h_15", isRef));

// Window areas (can legitimately be 0)
const window_N = parseFloat(getModeAwareValue("d_88", isRef)) || 0;
const window_E = parseFloat(getModeAwareValue("d_89", isRef)) || 0;
const window_S = parseFloat(getModeAwareValue("d_90", isRef)) || 0;
const window_W = parseFloat(getModeAwareValue("d_91", isRef)) || 0;
const window_other = parseFloat(getModeAwareValue("d_92", isRef)) || 0;

// Validate SACRED inputs (must exist and be positive)
if (!footprintArea || footprintArea <= 0) {
  throw new Error("[WOMBAT] Footprint area (d_95) is required and must be positive");
}
if (!conditionedArea || conditionedArea <= 0) {
  throw new Error("[WOMBAT] Conditioned area (h_15) is required and must be positive");
}
if (!roofArea || roofArea <= 0) {
  throw new Error("[WOMBAT] Roof area (d_85) is required and must be positive");
}
if (isNaN(opaqueWallArea) || opaqueWallArea < 0) {
  throw new Error("[WOMBAT] Opaque wall area (d_86) is required and must be >= 0");
}
if (!storiesDeclared || storiesDeclared < 0.5) {
  throw new Error("[WOMBAT] Stories (d_103) must be >= 0.5");
}

// Basement is optional (can be 0 or NaN)
const hasBasement = !isNaN(basementWallArea) && basementWallArea > 0;
const basementWallAreaClean = hasBasement ? basementWallArea : 0;

// Volume is LESS sacred - can be missing or mismatched
let volumeDeclaredClean = volumeDeclared;
if (!volumeDeclared || volumeDeclared <= 0 || isNaN(volumeDeclared)) {
  console.warn("[WOMBAT] Volume (d_105) is missing or invalid - will calculate from surfaces");
  volumeDeclaredClean = null; // Will calculate later
}

console.log("[WOMBAT] Input validation passed - all sacred surface areas present");
```

**Sacred Hierarchy:**
1. **MOST SACRED**: Surface areas (d_85, d_86, d_88-d_92, d_94, d_95) - used for heat loss/gain
2. **SACRED**: Conditioned area (h_15), Stories (d_103), Footprint (d_95)
3. **LESS SACRED**: Volume (d_105) - warn if mismatch, but don't fail

---

### Phase 1: Footprint Geometry

```javascript
// Footprint dimensions from aspect ratio
const aspectRatioRaw = parseFloat(currentState.getValue("d_202")) || 0; // Default to square
const aspectRatio = aspectRatioRaw >= 0 ? 1 + aspectRatioRaw : 1 / (1 - aspectRatioRaw);

const width = Math.sqrt(footprintArea / aspectRatio);
const length = footprintArea / width;
const perimeter = 2 * (width + length);

console.log(`[WOMBAT] Footprint: ${width.toFixed(2)}m × ${length.toFixed(2)}m`);
```

---

### Phase 2: Wall Height from Surface Areas (NOT Volume!)

**REVISED APPROACH**: Calculate wall height from **wall area** (SACRED), not volume.

```javascript
// Calculate total wall area (gross) = opaque + windows
const totalWallAreaGross = opaqueWallArea + (window_N + window_E + window_S + window_W + window_other);

// Wall height from wall area and perimeter (SACRED calculation)
const wallHeight = totalWallAreaGross / perimeter;

console.log(`[WOMBAT] Wall height from surfaces: ${wallHeight.toFixed(3)} m`);
console.log(`[WOMBAT] Total wall area: ${totalWallAreaGross.toFixed(2)} m²`);
console.log(`[WOMBAT] Perimeter: ${perimeter.toFixed(2)} m`);
```

**Then calculate roof height from roof area** (also SACRED):

```javascript
// Calculate roof area ratio
const areaRatio = roofArea / footprintArea;
let roofType = "flat";
let roofHeight = 0;

if (areaRatio > 1.01) {
  // Pitched/pyramidal roof
  roofType = "pyramidal";
  roofHeight = calculatePyramidalHeight(width, length, areaRatio);
} else if (areaRatio < 0.99) {
  // Inverted pyramid (visual indicator)
  roofType = "inverted";
  roofHeight = -calculatePyramidalHeight(width, length, 1.0 / areaRatio);
}

console.log(`[WOMBAT] Roof height from area: ${roofHeight.toFixed(3)} m`);
```

**Finally, calculate and verify volume** (LESS SACRED):

```javascript
// Calculate volume from surface-derived dimensions
let calculatedVolume = footprintArea * wallHeight;

// Add roof volume if pyramidal
if (roofType === "pyramidal") {
  const pyramidVolume = (1/3) * footprintArea * roofHeight;
  calculatedVolume += pyramidVolume;
}

// Compare to declared volume (if provided)
if (volumeDeclaredClean) {
  const volumeError = Math.abs(calculatedVolume - volumeDeclaredClean);
  const volumeErrorPct = (volumeError / volumeDeclaredClean) * 100;

  console.log(`[WOMBAT] Volume verification:`);
  console.log(`  Declared (d_105): ${volumeDeclaredClean.toFixed(2)} m³`);
  console.log(`  Calculated from surfaces: ${calculatedVolume.toFixed(2)} m³`);
  console.log(`  Discrepancy: ${volumeErrorPct.toFixed(2)}%`);

  if (volumeErrorPct > 5) {
    console.warn(`[WOMBAT] Volume discrepancy > 5% - flag for S13 Mechanical`);
    console.warn(`  Using surface-derived dimensions (SACRED)`);
    console.warn(`  Declared volume may be incorrect`);
  }
} else {
  console.log(`[WOMBAT] Volume calculated from surfaces: ${calculatedVolume.toFixed(2)} m³`);
}
```

**Key Insight**:
- Surface areas drive the geometry (SACRED)
- Volume is a derived/verification metric (LESS SACRED)
- If volume doesn't match, surfaces win!

---

### Phase 3: Story Height Distribution

```javascript
// Story height is NOT used for wall height calculation!
// It's derived FROM wall height for visualization

const fullLevels = Math.floor(storiesDeclared);
const hasFractionalStory = (storiesDeclared % 1) > 0;

// Distribute wall height among stories
let storyHeight = wallHeight / storiesDeclared;

// If fractional story, treat as mezzanine at reduced height
if (hasFractionalStory) {
  const fractionalPortion = storiesDeclared % 1;
  const fullStoryHeight = wallHeight / (fullLevels + fractionalPortion * 0.5);
  const mezzanineHeight = fullStoryHeight * 0.5;

  storyHeight = fullStoryHeight; // Use for full levels

  console.log(`[WOMBAT] Full story height: ${fullStoryHeight.toFixed(2)} m`);
  console.log(`[WOMBAT] Mezzanine height: ${mezzanineHeight.toFixed(2)} m`);
}
```

---

### Phase 4: Mezzanine Detection

```javascript
// Calculate expected area for full levels
const fullLevelArea = footprintArea * fullLevels;

// Mezzanine area (adiabatic)
const mezzanineArea = Math.max(0, conditionedArea - fullLevelArea);

if (mezzanineArea > 0) {
  console.log(`[WOMBAT] Adiabatic mezzanine detected: ${mezzanineArea.toFixed(2)} m²`);
  console.log(`[WOMBAT] Mezzanine is ${(mezzanineArea/footprintArea*100).toFixed(1)}% of footprint`);
}
```

---

### Phase 5: Wall Area Validation

```javascript
// Total wall area (gross) = opaque + windows
const totalWallAreaGross = opaqueWallArea + (window_N + window_E + window_S + window_W + window_other);

// Expected wall area from geometry
const expectedWallArea = perimeter * wallHeight;

// Check for consistency
const wallAreaError = Math.abs(totalWallAreaGross - expectedWallArea);
const wallAreaErrorPct = (wallAreaError / expectedWallArea) * 100;

if (wallAreaErrorPct > 5) {
  console.warn(`[WOMBAT] Wall area mismatch: ${wallAreaErrorPct.toFixed(1)}% error`);
  console.warn(`  Declared: ${totalWallAreaGross.toFixed(2)} m²`);
  console.warn(`  Calculated: ${expectedWallArea.toFixed(2)} m²`);
}
```

---

### Phase 6: Roof Geometry (Rational Trigonometry)

```javascript
// Calculate roof height from area ratio
const areaRatio = roofArea / footprintArea;
let roofType = "flat";
let roofHeight = 0;

if (areaRatio > 1.01) {
  roofType = "pyramidal";
  roofHeight = calculatePyramidalHeight(width, length, areaRatio);
} else if (areaRatio < 0.99) {
  roofType = "inverted";
  roofHeight = -calculatePyramidalHeight(width, length, 1.0 / areaRatio);
}

const roof = {
  type: roofType,
  height: roofHeight,
  areaRatio: areaRatio,
  area: roofArea
};
```

---

### Phase 7: Basement Geometry

```javascript
const hasBasement = basementWallArea > 0;
const basementDepth = hasBasement ? basementWallArea / perimeter : 0;

const belowGrade = {
  hasBasement: hasBasement,
  hasSlab: slabArea > 0,
  hasRaisedFloor: floorExposedToAir > 0,
  basementDepth: basementDepth,
  basementWallArea: basementWallArea,
  slabArea: slabArea,
  foundationType: determineFoundationType(...)
};
```

---

### Phase 8: Volume Verification

```javascript
// Calculate total volume from geometry
let calculatedVolume = footprintArea * wallHeight;

// Add roof volume if pyramidal
if (roofType === "pyramidal") {
  const pyramidVolume = (1/3) * footprintArea * roofHeight;
  calculatedVolume += pyramidVolume;
}

// Check against declared volume
const volumeError = Math.abs(calculatedVolume - volumeDeclared);
const volumeErrorPct = (volumeError / volumeDeclared) * 100;

console.log(`[WOMBAT] Volume check:`);
console.log(`  Declared: ${volumeDeclared.toFixed(2)} m³`);
console.log(`  Calculated: ${calculatedVolume.toFixed(2)} m³`);
console.log(`  Error: ${volumeErrorPct.toFixed(2)}%`);

if (volumeErrorPct > 1) {
  console.warn(`[WOMBAT] Volume constraint violated by ${volumeErrorPct.toFixed(2)}%`);
}
```

---

## Implementation Workplan

### Task 1: Update Input Reading (Remove Fallbacks)
**File**: `src/sections/Section19.js`
**Location**: `solveGeometry()` function, lines ~680-720

**Changes**:
```javascript
// OLD (with fallbacks):
const conditionedArea = parseFloat(getModeAwareValue("h_15", isReferenceCalculation)) || 100;
const roofArea = parseFloat(getModeAwareValue("d_85", isReferenceCalculation)) || 100;
const wallArea = parseFloat(getModeAwareValue("d_86", isReferenceCalculation)) || 160;

// NEW (no fallbacks, fail loudly):
const conditionedArea = parseFloat(getModeAwareValue("h_15", isReferenceCalculation));
const roofArea = parseFloat(getModeAwareValue("d_85", isReferenceCalculation));
const opaqueWallArea = parseFloat(getModeAwareValue("d_86", isReferenceCalculation));
const footprintArea = parseFloat(getModeAwareValue("d_95", isReferenceCalculation));
const storiesDeclared = parseFloat(getModeAwareValue("d_103", isReferenceCalculation));
const volumeDeclared = parseFloat(getModeAwareValue("d_105", isReferenceCalculation));

// Validate SACRED inputs
if (!footprintArea || footprintArea <= 0) {
  throw new Error("[WOMBAT] Footprint area (d_95) required and must be > 0");
}
if (!conditionedArea || conditionedArea <= 0) {
  throw new Error("[WOMBAT] Conditioned area (h_15) required and must be > 0");
}
if (!roofArea || roofArea <= 0) {
  throw new Error("[WOMBAT] Roof area (d_85) required and must be > 0");
}
if (isNaN(opaqueWallArea) || opaqueWallArea < 0) {
  throw new Error("[WOMBAT] Opaque wall area (d_86) required and must be >= 0");
}
if (!storiesDeclared || storiesDeclared < 0.5) {
  throw new Error("[WOMBAT] Stories (d_103) required and must be >= 0.5");
}
```

**Estimated Effort**: 30 minutes
**Priority**: HIGH (prevents silent failures)

---

### Task 2: Replace Volume-Based Wall Height with Surface-Based
**File**: `src/sections/Section19.js`
**Location**: `solveGeometry()` Phase 2, lines ~710-750

**OLD Logic** (lines ~711-732):
```javascript
// Phase 2: Height calculation from volume constraint (SACRED)
// Total volume divided by footprint area gives overall building height
const totalBuildingHeight = volume / footprintArea;
// Height per story
const storyHeight = totalBuildingHeight / stories;
```

**NEW Logic**:
```javascript
// Phase 2: Wall height from SURFACE AREAS (SACRED)

// Read window areas
const window_N = parseFloat(getModeAwareValue("d_88", isReferenceCalculation)) || 0;
const window_E = parseFloat(getModeAwareValue("d_89", isReferenceCalculation)) || 0;
const window_S = parseFloat(getModeAwareValue("d_90", isReferenceCalculation)) || 0;
const window_W = parseFloat(getModeAwareValue("d_91", isReferenceCalculation)) || 0;
const window_other = parseFloat(getModeAwareValue("d_92", isReferenceCalculation)) || 0;

// Total wall area (gross) = opaque + windows
const totalWallAreaGross = opaqueWallArea + window_N + window_E + window_S + window_W + window_other;

// Calculate perimeter from footprint
const perimeter = 2 * (length + width);

// Wall height from SURFACES (not volume!)
const wallHeight = totalWallAreaGross / perimeter;

console.log(`[WOMBAT] Wall height from surfaces: ${wallHeight.toFixed(3)} m`);
console.log(`[WOMBAT] Total wall area (gross): ${totalWallAreaGross.toFixed(2)} m²`);

// Story height derived from wall height (for visualization)
const storyHeight = wallHeight / storiesDeclared;
```

**Remove old variable**:
- Delete `totalBuildingHeight` (no longer needed)
- Rename `height` to `wallHeight` throughout for clarity

**Estimated Effort**: 45 minutes
**Priority**: HIGH (core algorithm fix)

---

### Task 3: Add Volume Verification (Not Constraint)
**File**: `src/sections/Section19.js`
**Location**: After Phase 3 (roof geometry), add new Phase 3.5

**Add After Roof Calculations**:
```javascript
// Phase 3.5: Volume Verification (LESS SACRED - informational only)

// Calculate volume from surface-derived dimensions
let calculatedVolume = footprintArea * wallHeight;

// Add roof volume if pyramidal
if (roofType === "pyramidal" && roofHeight > 0) {
  const pyramidVolume = (1/3) * footprintArea * roofHeight;
  calculatedVolume += pyramidVolume;
  console.log(`[WOMBAT] Roof pyramid volume: ${pyramidVolume.toFixed(2)} m³`);
}

// Compare to declared volume (if valid)
if (volumeDeclared && volumeDeclared > 0 && !isNaN(volumeDeclared)) {
  const volumeError = Math.abs(calculatedVolume - volumeDeclared);
  const volumeErrorPct = (volumeError / volumeDeclared) * 100;

  console.log(`[WOMBAT] Volume verification:`);
  console.log(`  Declared (d_105): ${volumeDeclared.toFixed(2)} m³`);
  console.log(`  Calculated from surfaces: ${calculatedVolume.toFixed(2)} m³`);
  console.log(`  Discrepancy: ${volumeErrorPct.toFixed(2)}%`);

  if (volumeErrorPct > 5) {
    console.warn(`[WOMBAT] Volume discrepancy > 5%`);
    console.warn(`  Using surface-derived dimensions (SACRED)`);
    console.warn(`  Flag for S13 Mechanical section`);
  }
} else {
  console.log(`[WOMBAT] Volume calculated from surfaces: ${calculatedVolume.toFixed(2)} m³`);
}

// Store calculated volume for geometry object
const totalBuildingHeight = wallHeight + (roofHeight > 0 ? roofHeight : 0);
```

**Estimated Effort**: 30 minutes
**Priority**: MEDIUM (validation/debugging aid)

---

### Task 4: Add Mezzanine Detection
**File**: `src/sections/Section19.js`
**Location**: After Phase 1 (footprint), add logging

**Add After Footprint Calculations**:
```javascript
// Detect mezzanines from conditioned area mismatch
const fullLevels = Math.floor(storiesDeclared);
const fullLevelArea = footprintArea * fullLevels;
const mezzanineArea = Math.max(0, conditionedArea - fullLevelArea);

if (mezzanineArea > 0.1) {
  const mezzaninePct = (mezzanineArea / footprintArea) * 100;
  console.log(`[WOMBAT] Mezzanine/adiabatic floor detected:`);
  console.log(`  Area: ${mezzanineArea.toFixed(2)} m²`);
  console.log(`  ${mezzaninePct.toFixed(1)}% of footprint`);
  console.log(`  (Stairs, atria, double-height spaces, etc.)`);
}
```

**Estimated Effort**: 15 minutes
**Priority**: LOW (informational only, not used in calculations yet)

---

### Task 5: Update Geometry Return Object
**File**: `src/sections/Section19.js`
**Location**: `solveGeometry()` return statement, lines ~815-825

**Update Field Names**:
```javascript
// OLD:
return {
  footprint: { length, width, area: footprintArea },
  height: totalBuildingHeight,  // This was wrong!
  storyHeight: storyHeight,
  // ...
};

// NEW:
return {
  footprint: { length, width, area: footprintArea },
  height: wallHeight,  // CHANGED: Now wall height from surfaces
  totalHeight: totalBuildingHeight,  // NEW: Wall + roof height
  storyHeight: storyHeight,
  calculatedVolume: calculatedVolume,  // NEW: For verification
  volumeDiscrepancy: volumeErrorPct || 0,  // NEW: Flag for S13
  // ...
};
```

**Estimated Effort**: 15 minutes
**Priority**: HIGH (required for correct rendering)

---

### Task 6: Update Console Logging
**File**: `src/sections/Section19.js`
**Location**: Throughout `solveGeometry()`

**Add Comprehensive Logging**:
```javascript
console.log(`[WOMBAT] ========== GEOMETRY SOLVER (${mode} mode) ==========`);
console.log(`[WOMBAT] Phase 1: Footprint`);
console.log(`  Slab area (d_95): ${footprintArea.toFixed(2)} m²`);
console.log(`  Aspect ratio: ${aspectRatio.toFixed(2)}`);
console.log(`  Dimensions: ${width.toFixed(2)}m × ${length.toFixed(2)}m`);
console.log(`  Perimeter: ${perimeter.toFixed(2)} m`);

console.log(`[WOMBAT] Phase 2: Wall Height (from SURFACES)`);
console.log(`  Opaque walls (d_86): ${opaqueWallArea.toFixed(2)} m²`);
console.log(`  Windows (d_88-d_92): ${(window_N + window_E + window_S + window_W + window_other).toFixed(2)} m²`);
console.log(`  Total wall area (gross): ${totalWallAreaGross.toFixed(2)} m²`);
console.log(`  Wall height: ${wallHeight.toFixed(3)} m`);

console.log(`[WOMBAT] Phase 3: Roof Geometry`);
console.log(`  Roof area (d_85): ${roofArea.toFixed(2)} m²`);
console.log(`  Area ratio R: ${areaRatio.toFixed(3)}`);
console.log(`  Roof type: ${roofType}`);
console.log(`  Roof height: ${roofHeight.toFixed(3)} m`);

console.log(`[WOMBAT] ========================================`);
```

**Estimated Effort**: 20 minutes
**Priority**: MEDIUM (debugging aid)

---

### Task 7: Test with Default Model
**Test Case**: Default 1.5-story building

**Expected Results**:
- Footprint: 1100.42 m² (from d_95)
- Wall height: ~8.4 m (from wall area ÷ perimeter)
- Mezzanine: 326.78 m² detected
- Roof type: Pyramidal (R = 1.28)
- Volume: ~7500 m³ calculated, warn about 8000 m³ declared

**Verification**:
1. Open browser console
2. Activate WOMBAT
3. Check console logs match expected values
4. Verify 3D rendering looks correct
5. Check no NaN or Infinity values

**Estimated Effort**: 30 minutes
**Priority**: HIGH (validation)

---

## Implementation Order

### Sprint 1: Core Algorithm Fix (2-3 hours)
1. ✅ Task 1: Remove fallbacks (30 min)
2. ✅ Task 2: Surface-based wall height (45 min)
3. ✅ Task 5: Update return object (15 min)
4. ✅ Task 7: Test with default model (30 min)

### Sprint 2: Validation & Logging (1-2 hours)
5. Task 3: Volume verification (30 min)
6. Task 4: Mezzanine detection (15 min)
7. Task 6: Console logging (20 min)
8. Retest all scenarios

---

## Success Criteria

✅ **No fallback values** - All `|| 100` patterns removed
✅ **Surface areas drive geometry** - Wall height from wall area ÷ perimeter
✅ **Volume is verification only** - Warns but doesn't fail if mismatch
✅ **Console logs show clear hierarchy** - SACRED vs LESS SACRED
✅ **Default model renders correctly** - Wall height ~8.4m, roof ~3.5m
✅ **No silent failures** - Throws errors for missing SACRED inputs

---

## Testing Scenarios

### Test 1: Default Model (1.5 Stories with Mezzanine)

**Inputs:**
- Volume (d_105): 8000 m³
- Footprint (d_95): 1100.42 m²
- Conditioned (h_15): 1427.2 m²
- Stories (d_103): 1.5
- Roof area (d_85): 1411.52 m²

**Expected Results:**
- Wall height: 7.269 m (from 8000 / 1100.42)
- Mezzanine area: 326.78 m² (1427.2 - 1100.42)
- Story height: ~4.85 m per full story
- Roof type: Pyramidal (R = 1.28)

---

### Test 2: Simple 2-Story Box (No Mezzanine)

**Inputs:**
- Volume: 1000 m³
- Footprint: 100 m²
- Conditioned: 200 m²
- Stories: 2.0
- Roof area: 100 m² (flat)

**Expected Results:**
- Wall height: 10 m (from 1000 / 100)
- Mezzanine area: 0 m²
- Story height: 5 m per story
- Roof type: Flat (R = 1.0)

---

### Test 3: Basement + 1 Story

**Inputs:**
- Volume: 600 m³
- Footprint: 100 m²
- Basement wall area (d_94): 80 m²
- Stories: 1.0
- Roof area: 100 m²

**Expected Results:**
- Wall height: 6 m (from 600 / 100)
- Basement depth: 2 m (from 80 / perimeter)
- Total levels: 2 (basement + 1)
- Story height: 6 m above grade

---

## Notes

- This algorithm prioritizes **volume constraint** as SACRED
- Mezzanines are treated as **adiabatic** (internal floor area)
- Roof volume contribution needs iterative solver for perfect accuracy
- Current implementation assumes user's roof area input is valid
- Wall area validation helps catch input errors

---

## References

- Section19.js `solveGeometry()` (lines 672-825)
- S19-RT.md (rational trigonometry documentation)
- Default model analysis (screenshot provided by user)
