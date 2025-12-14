# Section 19: WOMBAT - 3D Thermal Topology Visualization

**Status**: ✅ Production Ready
**Created**: 2025-12-08
**Last Updated**: 2025-12-14
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
- ✅ Mode-aware color coding (Blue=Target, Red=Reference)

**Planned Enhancements**:
- Window areas in walls
- Below-grade wall areas (brown nodes and vectors)
- Ground plane indicator
- Shade plane projections (0-100%)
- Roof topology (rational trigonometry-based)

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
    d_198: "8000.00",  // Volume (mirrors S12 d_105)
    d_199: "1.5",      // Stories (mirrors S12 d_103)
    d_202: "0.0",      // Aspect ratio slider
    h_200: "0.00",     // Calculated: Footprint length
    h_201: "0.00",     // Calculated: Footprint width
    h_203: "0.00",     // Calculated: Story height
  }
};

// ReferenceState: Identical structure for Reference mode
```

### ModeManager

The ModeManager facade provides mode-aware publishing to StateManager:

- **Target mode**: Publishes unprefixed field IDs (`d_198`, `h_200`)
- **Reference mode**: Publishes with `ref_` prefix (`ref_d_198`, `ref_h_200`)
- **Passive pattern**: Mode switching only re-renders visualization; FieldManager handles table updates
- **Dual-engine**: `calculateAll()` always runs both Target and Reference calculations

**Location**: [Section19.js:135-247](../../src/sections/Section19.js#L135-L247)

---

## Field Definitions

Section 19 owns the following fields:

| Field ID | Type | Description | Mirrors |
|----------|------|-------------|---------|
| `d_198` | editable | Conditioned Volume (m³) | S12 `d_105` |
| `d_199` | dropdown | Number of Stories | S12 `d_103` |
| `d_202` | slider | Footprint Aspect Ratio (-4 to +4) | - |
| `h_200` | calculated | Footprint Length (m) | - |
| `h_201` | calculated | Footprint Width (m) | - |
| `h_203` | calculated | Story Height (m) | - |

### Display-Only Fields (from S12)

Section 19 displays aggregate envelope values owned by Section 12:

| Field ID | Description | Owner |
|----------|-------------|-------|
| `d_101` / `g_101` | Ae - Area Exposed to Air & U-value | S12 |
| `d_102` / `g_102` | Ag - Area Exposed to Ground & U-value | S12 |

**Location**: [Section19.js:253-459](../../src/sections/Section19.js#L253-L459)

---

## Bidirectional Sync with Section 12

Section 19 maintains bidirectional synchronization with Section 12 for Volume and Stories fields using StateManager listeners.

### Mirror Fields

| S12 Field | S19 Field | Description | Sync Status |
|-----------|-----------|-------------|-------------|
| `d_105` / `ref_d_105` | `d_198` / `ref_d_198` | Conditioned Volume (m³) | ✅ Both directions |
| `d_103` / `ref_d_103` | `d_199` / `ref_d_199` | Number of Stories | ✅ Both directions |

### How It Works

**S12 → S19**: StateManager listeners update Section 19's state and trigger recalculation
**S19 → S12**: FieldManager routes user edits through ModeManager, which publishes to StateManager

Both sections listen for changes and update accordingly, with proper guards against circular updates.

**Location**: [Section19.js:1306-1368](../../src/sections/Section19.js#L1306-L1368)

---

## Geometry Solver: Constraint-Driven

WOMBAT's geometry solver transforms thermal area data into 3D geometry using a constraint satisfaction approach where **volume is sacred** and all dimensions emerge from area constraints.

### Input Dependencies

**External** (from StateManager):
- `h_15` / `ref_h_15` - Conditioned Area (m²) from S12
- `d_85` / `ref_d_85` - Roof Area (m²) from S11
- `d_86` / `ref_d_86` - Wall Area (m²) from S11

**Internal** (from TargetState/ReferenceState):
- `d_198` - Volume (m³) - **SACRED** (always preserved exactly)
- `d_199` - Stories (1, 1.5, 2, 3, 4, 5, 6)
- `d_202` - Aspect Ratio Slider (-4 to +4, 0 = square)

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
- `h_200` / `ref_h_200` - Footprint Length (m)
- `h_201` / `ref_h_201` - Footprint Width (m)
- `h_203` / `ref_h_203` - Story Height (m)

**Location**: [Section19.js:585-687](../../src/sections/Section19.js#L585-L687)

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

**Location**: [Section19.js:1370-1466](../../src/sections/Section19.js#L1370-L1466)

---

## Future Enhancements

### Phase 2: Below-Grade Geometry Visualization

**Goal**: Visualize basement/below-grade components using brown nodes and vectors to distinguish ground-facing surfaces (Ag) from air-facing surfaces (Ae).

**Data Sources** (from S11):
- `d_95` / `ref_d_95` - Slab Area (m²) - Brown (ground-facing)
- `d_94` / `ref_d_94` - Below-Grade Wall Area (m²) - Brown (ground-facing)

**Visual Design**:
```
Above Grade (Blue):          Below Grade (Brown):
      ┌────┐                      ═══════  ← Grade line
     ╱│    │╲                     ┌────┐
    ╱ │    │ ╲                    │    │   ← Basement walls (d_94)
   ●──●────●──●                   │    │
   │  │    │  │                   ●══●═●══● ← Slab (d_95)
   │  │    │  │
   ●──●────●──●
   ═══════════  ← Grade line
```

**Implementation Steps**:
1. Read S11 slab/basement data from StateManager
2. Calculate basement depth from wall area: `depth = basementWallArea / perimeter`
3. Draw grade line (dashed brown) at z=0 if ground-facing components exist
4. Extend brown vectors downward for basement walls
5. Draw brown perimeter for slab at basement floor level
6. Label with total Ag area

**Status**: Documented, ready for implementation

### Phase 3: Three.js Migration

**Goal**: Migrate from SVG to Three.js for true 3D interaction and export capabilities.

**Benefits**:
- Real-time rotation via OrbitControls
- Raycasting for interactive element selection
- glTF/OBJ export for CAD tool integration
- GPU-accelerated rendering
- Directional lights for solar shading visualization

**Status**: Planned for future release

### Phase 4: Window Distribution

**Goal**: Show window placement on facades based on S11 orientation data.

**Data Sources**:
- `d_89-d_92` - Window areas by cardinal direction (N, E, S, W)
- `d_88` - Door area
- `d_93` - Skylight area

**Status**: Planned for future release

### Phase 5: Solar Radiation Overlay

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
- Section 12 - `d_105`/`d_198` (Volume), `d_103`/`d_199` (Stories)

**Downstream** (S19 publishes to):
- Section 12 - Geometry dimensions `h_200`, `h_201`, `h_203`

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
**Last Updated**: 2025-12-14
**Next Review**: After Phase 2 (below-grade geometry) implementation
