# Section 19: WOMBAT - 3D Thermal Topology Visualization

**Status**: ✅ Production Ready (Phase 2 Complete + Refactoring)
**Created**: 2025-12-08
**Last Updated**: 2025-12-15
**Target Release**: 4.013

---

## Executive Summary

WOMBAT generates a **3D thermal topology model** from OBJECTIVE's envelope geometry data. Like wombats creating cubic output from inputs, we transform thermal area-based abstractions into volumetric spatial representations. **This is not an architectural model** — it's a visual representation of thermal attributes.

**Current Features**:
- ✅ Constraint-driven 3D wireframe visualization (SVG-based)
- ✅ Pattern A dual-state architecture (Target/Reference modes)
- ✅ Bidirectional sync with Section 12 (Volume & Stories)
- ✅ Display of Ae (Area Exposed to Air) and Ag (Area Exposed to Ground)
- ✅ Interactive aspect ratio control
- ✅ Multi-story visualization with per-floor area labels
- ✅ **Fractional story rendering** - Proportional height boxes for partial floors (e.g., 1.5 stories)
- ✅ **Floorplate Options dropdown** - Clarifies mezzanine vs equal floorplates
- ✅ **Correct floor area display** - Shows footprint (d_95 SACRED), not averaged
- ✅ Mode-aware color coding (Blue=Target, Red=Reference)
- ✅ **Below-grade geometry visualization** (Phase 2 - Complete)
  - Brown dashed vectors for basement walls (hidden line effect)
  - Brown nodes for basement floor corners
  - Brown solid vectors for slab-on-grade perimeter
  - Grade line indicator with label
  - Basement depth annotation
  - Total Ag area label with foundation type
  - Mixed foundation warning indicator
- ✅ **Refresh button sync** - User-controlled StateManager sync after import
- ✅ **Label readability** - Semi-transparent backgrounds, z-order optimized
- ✅ **Field ID renumbering** - Sequential d_150-d_158 range for maintainability

**Planned Enhancements**:
- **Gable Roof Geometry** - Biplanar roof rendering with triangular gable ends
- **Roof Type Selector** - Dropdown for multiplanar/biplanar/monoplane selection
- **Gable Wall Area Accounting** - Extract gable ends from total wall area for proper height calculation
- Window areas in walls (orientation-specific placement)
- Shade plane projections (0-100%)
- Three.js migration for 3D interaction

---

## Table of Contents

1. [Architecture: Pattern A Dual-State](#architecture-pattern-a-dual-state)
2. [Field Definitions](#field-definitions)
3. [Bidirectional Sync with Section 12](#bidirectional-sync-with-section-12)
4. [Geometry Solver: Constraint-Driven](#geometry-solver-constraint-driven)
5. [3D Visualization: SVG Wireframe](#3d-visualization-svg-wireframe)
6. [Display Fields: Ae and Ag](#display-fields-ae-and-ag)
7. [Future Enhancements](#future-enhancements)
8. [References](#references)

---

## Architecture: Pattern A Dual-State

Section 19 implements TEUI's Pattern A dual-state architecture, maintaining separate state objects for Target and Reference modes with 100% isolation.

### State Objects

```javascript
// TargetState: Holds Target mode values
const TargetState = {
  values: {
    d_150: "1.5",           // Stories (mirrors S12 d_103)
    d_151: "8000.00",       // Volume (mirrors S12 d_105)
    d_154: "0.0",           // Aspect ratio slider (L:W)
    d_158: "mezzanine",     // Floorplate Options (mezzanine/equal)
    h_155: "0.00",          // Calculated: Footprint width
    h_156: "0.00",          // Calculated: Story height
    h_157: "0.00",          // Calculated: Footprint length
  }
};

// ReferenceState: Identical structure for Reference mode
```

### ModeManager

The ModeManager facade provides mode-aware publishing to StateManager:

- **Target mode**: Publishes unprefixed field IDs (`d_150`, `h_155`)
- **Reference mode**: Publishes with `ref_` prefix (`ref_d_150`, `ref_h_155`)
- **Passive pattern**: Mode switching only re-renders visualization; FieldManager handles table updates
- **Dual-engine**: `calculateAll()` always runs both Target and Reference calculations

**Location**: [Section19.js:130-242](../../src/sections/Section19.js#L130-L242)

---

## Field Definitions

Section 19 owns the following fields (renumbered to d_150-d_158 range):

| Field ID | Row | Type | Description | Mirrors |
|----------|-----|------|-------------|---------|
| `d_150` | 19.0 | dropdown | Number of Stories (1, 1.5, 2, 3, 4, 5, 6) | S12 `d_103` |
| `d_158` | 19.FP | dropdown | Floorplate Options (Mezzanine/Equal) | - |
| `d_151` | 19.V | editable | Conditioned Volume (m³) | S12 `d_105` |
| `d_152` | 19.Ae | calculated | Ae - Total Area Exposed to Air (m²) | S12 `d_101` |
| `d_153` | 19.Ag | calculated | Ag - Total Area Exposed to Ground (m²) | S12 `d_102` |
| `d_154` | 19.1 | slider | Footprint Aspect Ratio L:W (-4 to +4) | - |
| `h_155` | 19.2 | calculated | Footprint Width (m) | - |
| `h_156` | 19.3 | calculated | Building Height (m) | - |
| `h_157` | (inline) | calculated | Footprint Length (m) | - |

### Display-Only Fields (from S12)

Section 19 displays aggregate U-values owned by Section 12:

| Field ID | Description | Owner |
|----------|-------------|-------|
| `g_152` | U-value for Ae (W/m²·K) | S12 `g_101` |
| `g_153` | U-value for Ag (W/m²·K) | S12 `g_102` |

**Location**: [Section19.js:248-455](../../src/sections/Section19.js#L248-L455)

---

## Bidirectional Sync with Section 12

Section 19 maintains bidirectional synchronization with Section 12 for Volume and Stories fields using StateManager listeners.

### Mirror Fields

| S12 Field | S19 Field | Description | Sync Status |
|-----------|-----------|-------------|-------------|
| `d_105` / `ref_d_105` | `d_151` / `ref_d_151` | Conditioned Volume (m³) | ✅ Both directions |
| `d_103` / `ref_d_103` | `d_150` / `ref_d_150` | Number of Stories | ✅ Both directions |

### How It Works

**S12 → S19**: StateManager listeners in S19 respond to changes from S12
**S19 → S12**: ModeManager publishes field changes to StateManager, which S12 listens for

Both sections have listeners with proper guards against circular updates (`source="external"` flag).

**S12 Listeners** (Section12.js:3087-3190): Listen for d_150/d_151 changes from S19
**S19 State Sync** (Section19.js): Publishes via ModeManager.setValue()

**Location**: Section12.js listeners updated in commit `ce74cd7` (2025-12-15)

---

## Geometry Solver: Constraint-Driven

WOMBAT's geometry solver transforms thermal area data into 3D geometry using a constraint satisfaction approach where **volume is sacred** and all dimensions emerge from area constraints.

### Input Dependencies

**External** (from StateManager):
- `h_15` / `ref_h_15` - Conditioned Area (m²) from S12
- `d_85` / `ref_d_85` - Roof Area (m²) from S11
- `d_86` / `ref_d_86` - Wall Area (m²) from S11

**Internal** (from TargetState/ReferenceState):
- `d_151` - Volume (m³) - **LESS SACRED** (verified against surfaces)
- `d_150` - Stories (1, 1.5, 2, 3, 4, 5, 6)
- `d_158` - Floorplate Options (mezzanine/equal)
- `d_154` - Aspect Ratio Slider (-4 to +4, 0 = square)

### Constraint Solving Algorithm

The solver works in phases:

**Phase 1: Footprint** (X-Y plane)
```
footprintArea = conditionedArea / stories
aspectRatio = slider >= 0 ? (1 + slider) : 1 / (1 - slider)
width = sqrt(footprintArea / aspectRatio)
length = footprintArea / width
```

**Phase 2: Height** (Z-axis) - **Volume-First**
```
totalBuildingHeight = volume / footprintArea  // SACRED - never violated
storyHeight = totalBuildingHeight / stories
```

**Phase 3: Roof Geometry** (pitch emerges from roof area)
```
areaRatio = roofArea / footprintArea
if (areaRatio > 1.01) → gabled roof (pitched)
if (areaRatio < 0.99) → inverted pyramid (visual conflict indicator)
roofPitch = arcsin((areaRatio - 1) / 2) * (180 / π)

Note: Future enhancement will use rational trigonometry (NJ Wildberger approach)
```

**Phase 4: Wall Geometry**
```
perimeter = 2 * (length + width)
wallHeight = wallArea / perimeter
```

### Outputs

Calculated fields published to StateManager:
- `h_157` / `ref_h_157` - Footprint Length (m)
- `h_155` / `ref_h_155` - Footprint Width (m)
- `h_156` / `ref_h_156` - Building Height (m) - wall + roof

Geometry object also includes:
- `areaPerFloor` - Footprint area (d_95 SACRED)
- `mezzanineArea` - Adiabatic floor area (conditioned - footprint × fullStories)
- `volume` - Calculated from surfaces
- `volumeDiscrepancy` - Percentage difference from declared

**Location**: [Section19.js:637-950](../../src/sections/Section19.js#L637-L950)

---

## 3D Visualization: SVG Wireframe

WOMBAT uses SVG-based isometric projection to render the constraint-driven geometry as a 3D wireframe.

### Coordinate System

**Right-handed coordinate system (Z-up convention)**:
- **X+ = East** (horizontal)
- **Y+ = North** (horizontal)
- **Z+ = Up** (vertical)
- **X-Y plane** = Ground plane (footprint)
- **Z-axis** = Building height

This matches standard architectural/BIM conventions and enables proper cardinal orientation for future window placement and solar calculations.

### Why SVG?
- DOM-based manipulation (easier debugging than Canvas)
- Resolution independence
- Better integration with web standards
- Matches Section 18's graph visualization pattern

### Rendering Features

- **Isometric projection**: 3D coordinates → 2D using standard isometric angles (Z-up)
- **Multi-story stacking**: Each story rendered with floor/ceiling edges and vertical posts
- **Mode-aware colors**: Blue (#007bff) for Target, Red (#dc3545) for Reference
- **Dimension annotations**: Length, width, height labels with values in meters
- **Per-floor area labels**: Shows conditioned area for each story
- **Geometry info overlay**: Summary of stories, footprint, height, volume
- **Dynamic scaling**: Auto-scales to fit canvas while maintaining proportions

### Activation Controls

Users must click "Activate Topology View" to generate the 3D model. This prevents unnecessary calculations on page load.

- **Inactive state**: Shows placeholder message
- **Active state**: Generates and displays wireframe, updates on any geometry change
- **Info modal**: Explains thermal topology concept and constraints

**Location**: [Section19.js:769-1024](../../src/sections/Section19.js#L769-L1024)

---

## Display Fields: Ae and Ag

Section 19 displays aggregate envelope area fields from Section 12 using the "Robot Fingers" pattern—StateManager listeners scoped to the `#wombat` container.

### Implementation

**Ae (Area Exposed to Air)**:
- `d_101` / `ref_d_101` - Total air-facing area (m²)
- `g_101` / `ref_g_101` - Aggregate U-value for air-facing surfaces (W/m²·K)
- Color: Powder blue (`text-air-facing` class)

**Ag (Area Exposed to Ground)**:
- `d_102` / `ref_d_102` - Total ground-facing area (m²)
- `g_102` / `ref_g_102` - Aggregate U-value for ground-facing surfaces (W/m²·K)
- Color: Brown (`text-ground-facing` class)

### How It Works

1. **Ownership**: S12 calculates and publishes these values to StateManager
2. **Display**: S19 uses scoped StateManager listeners to update its DOM elements
3. **No initialization needed**: Field definitions contain defaults; robot fingers handle live updates
4. **DOM scoping**: `wombatContainer.querySelector('[data-field-id="d_101"]')` prevents collision with S12's elements

**Location**: Section19.js scoped listeners

---

## Recent Refactoring (2025-12-15)

### Field ID Renumbering ✅ COMPLETE

**Goal**: Reorganize field IDs from scattered 198-203 range to sequential 150-158 range.

**Commits**:
- `ce74cd7` - Refactor: Rename S19 field IDs to sequential d_150-d_157 range
- `0e8c181` - Improve: Fractional story rendering and add Floorplate Options
- `72264ce` - Fix: Correct floor area display to use footprint (d_95), not averaged

**Changes**:
| Old ID | New ID | Description |
|--------|--------|-------------|
| d_199 | d_150 | Stories |
| d_198 | d_151 | Volume |
| d_101 | d_152 | Ae (display) |
| d_102 | d_153 | Ag (display) |
| d_202 | d_154 | Aspect Ratio |
| h_201 | h_155 | Footprint Width |
| h_203 | h_156 | Building Height |
| h_200 | h_157 | Footprint Length |
| (new) | d_158 | Floorplate Options |

**S12 Listener Updates**: Section12.js listeners updated to listen for d_150/d_151 instead of d_198/d_199 (8 total listeners updated)

### Fractional Story Visualization ✅ COMPLETE

**Problem**: 1.5 stories rendered as two identical full-height boxes (misleading).

**Solution**: Render fractional stories at proportional height.
- Full stories: Full-height boxes
- Fractional story: Partial-height box (e.g., 0.5 × storyHeight for 1.5 stories)
- Hairline at correct position (e.g., 2/3rds wall height for 1.5 stories)

**File**: [wombatRender.js:207-342](../../src/core/wombatRender.js#L207-L342)

### Floor Area Math Correction ✅ COMPLETE

**Problem**: Showed 951 m² per floor (conditioned ÷ stories) instead of footprint 1100.42 m².

**Root Cause**: `areaPerFloor = conditionedArea / storiesDeclared` gave averaged value.

**Fix**:
1. `areaPerFloor = footprintArea` (d_95 is SACRED)
2. Mezzanine calculation: `conditionedArea - (footprint × fullStories)` = 326.78 m²
3. Renderer uses actual `geometry.mezzanineArea` instead of calculated value

**Result**:
- Full story label: 1100.42 m² (footprint - SACRED)
- Mezzanine label: 326.78 m² (actual adiabatic floor area)

**Files**:
- [Section19.js:800-808](../../src/sections/Section19.js#L800-L808) - Calculation
- [wombatRender.js:306](../../src/core/wombatRender.js#L306) - Rendering

### Floorplate Options Dropdown ✅ COMPLETE

**Goal**: Clarify geometric interpretation for fractional stories.

**Implementation**: Added d_158 dropdown with two options:
- "Mezzanine/Partial Floor" (default) - Adiabatic internal floor
- "Equal Floorplates" - Stacked floors at proportional heights

**Usage**: Buildings can have BOTH mezzanine AND conditioned volume under roof. The dropdown clarifies floorplate interpretation while roof area > footprint automatically implies conditioned space under roof slope.

**File**: [Section19.js:302-329](../../src/sections/Section19.js#L302-L329)

---

## Recent Enhancements

### Phase 2: Below-Grade Geometry Visualization ✅ COMPLETE (Testing)

**Goal**: Visualize basement/below-grade components using brown nodes and vectors to distinguish ground-facing surfaces (Ag) from air-facing surfaces (Ae).

**Status**: ✅ **Implemented - In Testing** (2025-12-14)

**Commits**:
- `722b624` - Docs: Update below-grade workplan with hidden line visual design
- `3a19421` - Refactor: Extract S19 rendering to wombatRender.js module
- `9809ae8` - Docs: Revise S19-WOMBAT-3.md to reflect production state
- `fbad071` - Docs: Add Phase 2 below-grade geometry workplan to S19-WOMBAT-3
- `2ecdc00` - Improve: Add color classes to Ae/Ag U-value fields in S19
- `975163c` - Fix: WOMBAT refresh button sync and UI improvements
- `d221df2` - Improve: Add semi-transparent backgrounds to WOMBAT labels
- `b0b2388` - Fix: Ensure WOMBAT labels render on top of geometry
- `cdfcdee` - Fix: Correct label background rendering timing

**Data Sources** (from S11):
- `d_95` / `ref_d_95` - Slab Area (m²) - Brown (ground-facing)
- `d_94` / `ref_d_94` - Below-Grade Wall Area (m²) - Brown (ground-facing)
- `d_87` / `ref_d_87` - Floor Exposed to Air (m²) - For mixed foundation detection

**Visual Design**:
```
Above Grade (Blue):          Below Grade (Brown):
      ┌────┐                      ═══════  ← Grade line (dashed)
     ╱│    │╲                     ┌────┐
    ╱ │    │ ╲                    ┊    ┊   ← Basement walls (dashed)
   ●──●────●──●                   ┊    ┊
   │  │    │  │                   ●──●─●──● ← Basement floor nodes
   │  │    │  │
   ●──●────●──●                  Ag: 306.4 m²
   ═══════════  ← Grade line    Full Basement
```

**Implementation Highlights**:
1. ✅ Foundation type detection (full-basement, slab-on-grade, raised-floor, basement-no-slab)
2. ✅ Basement depth calculation: `depth = basementWallArea / perimeter`
3. ✅ Grade line (dashed brown, italic "Grade" label) at z=0
4. ✅ Basement walls (dashed brown vectors, hidden line effect)
5. ✅ Basement floor nodes (brown circles)
6. ✅ Ground floor perimeter detection (brown when ground contact, blue/red when raised)
7. ✅ Depth annotation label (left side)
8. ✅ Total Ag area label with foundation type subtitle
9. ✅ Mixed foundation warning (when both raised floor and ground contact exist)
10. ✅ 3-phase rendering for proper z-order (geometry → labels → backgrounds)
11. ✅ Semi-transparent label backgrounds for legibility

**Location**:
- Geometry solver: [Section19.js:652-711](../../src/sections/Section19.js#L652-L711)
- Rendering: [wombatRender.js:328-554](../../src/core/wombatRender.js#L328-L554)

**Testing Required**:
- [ ] Full basement scenario (d_94 > 0, d_95 > 0, d_87 = 0)
- [ ] Slab-on-grade scenario (d_94 = 0, d_95 > 0, d_87 = 0)
- [ ] Raised floor scenario (d_94 = 0, d_95 = 0, d_87 > 0)
- [ ] Mixed foundation scenario (combination of above)
- [ ] Basement-no-slab scenario (d_94 > 0, d_95 = 0)
- [ ] Import/export with below-grade data
- [ ] Target/Reference mode switching
- [ ] Label legibility over all geometry types

## Future Enhancements

### Phase 3: Gable Roof Geometry

**Goal**: Implement biplanar (gable) roof rendering with proper geometric calculations.

**Status**: Planned - Field d_158 (Floorplate Options) added but not yet used in calculations

**Implementation Tasks**:
1. **Add Roof Type dropdown (d_159)** - multiplanar/biplanar/monoplane
   - Default: "biplanar" for rectangular buildings
   - Auto-suggest based on aspect ratio
2. **Gable height calculation** using rational trigonometry
   - Ridge runs along longer axis
   - Calculate triangular gable end area
   - Formula: `gableEndArea = (span × height) / 2`
3. **Wall area accounting** - Extract gable ends from total opaque wall area
   - Gable ends are OPAQUE WALL AREA (d_86), not roof area
   - Wall plate height = `(opaqueWallArea - gableArea) / perimeter`
4. **Gable roof renderer** in wombatRender.js
   - Two rectangular slopes
   - Two triangular gable ends
   - Ridge line visualization

**Mathematical Foundation**:
```javascript
// Gable roof: ridge along longer dimension
const ridgeOrientation = length >= width ? "longitudinal" : "transverse";
const ridgeLength = Math.max(width, length);
const span = Math.min(width, length);

// Height from roof area using Pythagorean theorem
const roofArea = areaRatio * baseArea;
const slopeLength = roofArea / (2 * ridgeLength);
const h2 = slopeLength² - (span/2)²;
const roofHeight = Math.sqrt(h2);

// Gable end area (each triangular end)
const gableEndArea = (span × roofHeight) / 2;
```

**References**:
- Mathematical derivation: [S19-RT.md](../S19-RT.md) (rational trigonometry approach)
- Implementation plan: S19-REFACTOR-PLAN.md Tasks 3-6 (archived)

### Phase 4: Three.js Migration

**Goal**: Migrate from SVG to Three.js for true 3D interaction and export capabilities.

**Benefits**:
- Real-time rotation via OrbitControls
- Raycasting for interactive element selection
- glTF/OBJ export for CAD tool integration
- GPU-accelerated rendering
- Directional lights for solar shading visualization

**Status**: Planned for future release

### Phase 5: Window Distribution

**Goal**: Show window placement on facades based on S11 orientation data.

**Data Sources**:
- `d_88-d_92` - Window areas by cardinal direction (N, E, S, W, Other)
- `d_93` - Skylight area

**Status**: Planned for future release

### Phase 6: Solar Radiation Overlay

**Goal**: Visualize solar gains on building surfaces with color-coded irradiance.

**Features**:
- Hourly/seasonal sun position calculation
- Surface-specific irradiance based on orientation
- Color gradient (blue → yellow → red) for heat gain intensity
- Integration with Section 10 for annual solar gains

**Status**: Planned for future release

---

## Core Principles

### 1. Volume is Sacred
`d_105`/`d_198` (Volume) is ALWAYS preserved exactly. All dimensions emerge from volume constraints.

### 2. Areas Drive Form
Roof pitch, wall heights, and building proportions emerge from area constraints, not pre-defined geometry.

### 3. No Validation Errors
Impossible geometry (e.g., roof area < floor area) renders visually as feedback rather than throwing errors.

### 4. Constraint Satisfaction Feedback
Visual conflicts (inverted pyramids, stretched walls) indicate when entered areas don't match typical building proportions.

### 5. Topology First, Realism Second
This is a **thermal topology model**, not an architectural model. Strange-looking geometry is feedback about thermal data, not a rendering bug.

---

## References

### Section Dependencies

**Upstream** (S19 reads from):
- Section 11 (Envelope Components) - `d_85`, `d_86` (roof/wall areas)
- Section 12 (Volume Metrics) - `h_15` (Conditioned Area), `d_101`, `d_102` (Ae/Ag)

**Bidirectional** (S19 mirrors):
- Section 12 - `d_105`/`d_151` (Volume), `d_103`/`d_150` (Stories)

**Downstream** (S19 publishes to):
- Section 12 - Geometry dimensions `h_155`, `h_156`, `h_157`

### Related Documents

- [4012-CHEATSHEET.md](./4012-CHEATSHEET.md) - Pattern A architecture guidelines
- [TECHNICAL2.md](../TECHNICAL2.md) - Core architecture reference

### Graphics Libraries (Future)

**Three.js** (Phase 3+ target):
- Official site: https://threejs.org/
- OrbitControls: https://threejs.org/docs/#examples/en/controls/OrbitControls
- GLTFExporter: https://threejs.org/docs/#examples/en/exporters/GLTFExporter
- glTF 2.0 spec: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

**Solar Calculations** (Phase 5):
- SunCalc.js: https://github.com/mourner/suncalc

---

**Document Status**: ACTIVE - Production documentation
**Last Updated**: 2025-12-15
**Next Review**: After gable roof implementation (Phase 3)
