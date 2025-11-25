# Section 18: Optimize - Parallel Coordinates Workplan

**Date Created**: November 23, 2025
**Branch**: S18-19-PARALLEL-COORDINATES
**Status**: Planning Phase

---

## Overview

Section 18 will implement a **Parallel Coordinates** visualization to show optimization paths between Target and Reference building configurations. The graph will display two lines (blue for Target, red for Reference) traversing across multiple vertical axes representing key performance parameters with the highest total influence for the least capital cost.

Future development can show 'Runs' of energy models that the user chooses to save, together with the concurrent Target/Reference model pair. Feature TBD. 

**Design Goals**:
- Clean, unique visualization (not generic parallel coordinates)
- 80% graph / 20% data table layout
- Two-line comparison (Target vs Reference)
- Focus on high-impact, low-cost parameters
- Consistent with S16/S17 D3.js patterns
- Will add 'Optimize' and 'Super Optimize' buttons in button row just right of 'Refresh Graph' button, similar bootstrap format
- Will add 2 more rows, afrer existing Savings row, 8. Capital Cost Premium, 9. Target ROI (need to update name of 'Savings' to 'Targeted Savings') - Capital cost premium will be user editable and stored to StateManager as SHW_premium, DWHR_premium, etc. and shall only apply to the Target model, not the Reference model (so no ref_ counterparts). ROI shall be calculated as SHW_premium-SHW_TargetSavings and be in Years (2dp numberFormat)

---

## 1. D3.js Library Analysis

### Current External Dependencies (from index.html)

```html
<!-- Line 60: D3.js Core -->
<script src="https://d3js.org/d3.v7.min.js"></script>

<!-- Line 61-62: Dependency Graph Libraries -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/dagre-d3/0.6.4/dagre-d3.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dagre/0.8.5/dagre.min.js"></script>

<!-- Line 63: Sankey Diagram Library -->
<script src="https://cdn.jsdelivr.net/npm/d3-sankey@0.12.3/dist/d3-sankey.min.js"></script>
```

### D3.js v7 Parallel Coordinates Capability

**✅ GOOD NEWS**: D3.js v7 (already loaded) has **native support** for parallel coordinates via:
- **d3-scale**: Handles axis scaling (linear, ordinal, etc.)
- **d3-axis**: Renders vertical axes
- **d3-shape**: Line generation (`d3.line()`)
- **d3-selection**: DOM manipulation
- **d3-brush**: Interactive axis brushing (optional feature)

**No additional libraries needed!** D3.js v7 is self-sufficient for parallel coordinates. Tell human to download libraries for legacy functioning/local methods and archiving purposes. 

### Licensing ✅

- **D3.js v7**: BSD 3-Clause License (permissive, FOSS-compatible)
- **No additional dependencies required**
- Aligns perfectly with TEUI Calculator's open-source ethos

---

## 2. Architecture Pattern (Following S16/S17)

### Section Module Structure (Section18.js)

Following the **minimal module pattern** from S17:

```javascript
/**
 * 4012-Section18.js
 * Parallel Coordinates Optimization Section for TEUI Calculator 4.012
 */

window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

window.TEUI.SectionModules.sect18 = (function () {
  function getFields() {
    // No specific fields owned by this section
    return {};
  }

  function getLayout() {
    // Layout managed by index.html and ParallelCoordinates.js
    return { rows: [] };
  }

  function calculateAll() {
    // Refresh parallel coordinates visualization
    if (window.TEUI?.ParallelCoordinates?.refresh) {
      window.TEUI.ParallelCoordinates.refresh();
    }
  }

  function initializeEventHandlers() {
    // Initialize controls (fullscreen, refresh, etc.)
    if (window.TEUI?.ParallelCoordinates?.initializeControls) {
      window.TEUI.ParallelCoordinates.initializeControls();
    }
  }

  return {
    getFields,
    getLayout,
    calculateAll,
    initializeEventHandlers,
  };
})();
```

### Dedicated Visualization Module (ParallelCoordinates.js)

Create new file: **`src/sections/ParallelCoordinates.js`** (similar to S16C.js pattern)

**Responsibilities**:
- Graph rendering (D3.js v7)
- Data fetching from StateManager (Target vs Reference)
- Control panel setup (fullscreen, refresh, export, settings, Optimize, Super Optimize)
- Table rendering (bottom 20%)
- Interaction handlers (hover, click, brush)

---

## 3. HTML Structure (Already Set Up ✅)

Current HTML in [index.html:650-669](../index.html#L650-L669):

```html
<!-- Section 18: Optimize -->
<div id="parallelCoordinates" class="section">
  <div class="section-header">
    <span class="section-icon"><i class="bi bi-shuffle"></i></span>
    SECTION 18. Optimize
  </div>
  <div class="section-content">
    <!-- Container for Parallel Coordinates visualization -->
    <div class="parallel-coordinates-controls-wrapper mb-3"></div>
    <!-- Wrapper for controls -->
    <div class="parallel-coordinates-info-wrapper mb-3"></div>
    <!-- Wrapper for info panel -->
    <div
      class="parallel-coordinates-container"
      style="width: 100%; border: 1px solid #eee"
    >
      <!-- SVG will be injected here by ParallelCoordinates.js -->
    </div>
  </div>
</div>
```

**Pattern matches**:
- S16: `#section16ContentTarget` (dynamic injection)
- S17: `.dependency-graph-controls-wrapper`, `.dependency-graph-container`
- S18: `.parallel-coordinates-controls-wrapper`, `.parallel-coordinates-container`

---

## 4. Layout Specification

### Visual Layout (80/20 Split)

```
┌─────────────────────────────────────────────────────┐
│ Controls Row:                                       │
│ [Fullscreen] [Refresh] [Export PNG] [Settings]      │
├─────────────────────────────────────────────────────┤
│                                                     │
│                                                     │
│         PARALLEL COORDINATES GRAPH                  │
│         (80% of vertical space)                     │
│                                                     │
│    Axis1   Axis2   Axis3   Axis4   Axis5   Axis6    │
│      │      │      │      │      │      │      │    │
│      │      │      │      │      │      │      │    │
│    ──┴──────┴──────┴──────┴──────┴──────┴──────┴──  │
│    [Blue Line: Target Model]                        │
│    [Red Line: Reference Model]                      │
│                                                     │
├─────────────────────────────────────────────────────┤
│ DATA TABLE (20% of vertical space)                  │
│                                                     │
│ Parameter    | Target  | Reference | Δ      | %Δ    │
│──────────────┼─────────┼───────────┼────────┼────── │
│ Window U-Val | 0.20    | 0.40      | -0.20  | -50%  │
│ Wall R-Value | 30      | 20        | +10    | +50%  │
│ ... (user-defined axes from tomorrow's list)        │
└─────────────────────────────────────────────────────┘
```

### Control Panel (Top Row)

**Buttons** (following S16/S17 pattern):
1. **Fullscreen Toggle** (⛶) - Expand/collapse visualization
2. **Refresh** (⟳) - Reload data from StateManager
3. **Export PNG** (⬇) - Download graph as image
4. **Settings** (⚙) - ROI modal popup, etc. 

**Info Panel** (same row as Buttons, as UI vert space is at a premium):
- Active mode indicator (Target/Reference comparison)
- Data timestamp
- Quick stats (e.g., "6 parameters optimized")
- Legend
- Optimize, Super Optimize buttons

---

## 5. Data Integration

### StateManager Pattern (Mode-Aware)

Following **S16C.js pattern** (lines 104-123):

```javascript
// Helper function to get Target or Reference values
const getStateValue = (key, mode = "target") => {
  const teuiState = window.TEUI.StateManager;
  if (!teuiState) return null;

  // Mode-aware reading (ref_ prefix for Reference mode)
  const rawValue = mode === "reference"
    ? teuiState.getValue(`ref_${key}`)
    : teuiState.getValue(key);

  const numValue = parseFloat(rawValue);
  return typeof numValue === "number" && !isNaN(numValue)
    ? numValue
    : null;
};
```

### Data Structure for Parallel Coordinates

**✅ USER PROVIDED**: November 23, 2025

**Axes Configuration** (14 parameters):

```javascript
const OPTIMIZATION_AXES = [
  {
    id: "shw_efficiency",
    label: "SHW%",
    unit: "%",
    targetField: "d_52",           // Electric/Heatpump path (already %)
    targetFieldAlt: "k_52",        // Oil/Gas AFUE path
    targetFieldMultiplier: null,   // d_52 already in %
    targetFieldAltMultiplier: 100, // k_52 * 100 to convert AFUE to %
    targetFieldSelector: "d_51",   // Conditional: Electric/Heatpump vs Oil/Gas
    referenceField: "ref_d_52",
    referenceFieldAlt: "ref_k_52",
    referenceFieldMultiplier: null,
    referenceFieldAltMultiplier: 100,
    referenceFieldSelector: "ref_d_51",
    optimal: "higher", // note: this can be counter-intuitive, lower hetaloss = higher performance
    description: "Service Hot Water efficiency - conditional on heating fuel type",
  },
  {
    id: "dwhr_efficiency",
    label: "DWHR%",
    unit: "%",
    targetField: "d_53",
    referenceField: "ref_d_53",
    optimal: "higher", // higher value = higher performance = lower drain heatloss = lower costs, so higher value is at bottom of axis, but to 70% from 0% at top
    description: "Drain Water Heat Recovery efficiency",
  },
  {
    id: "net_gains",
    label: "nGains%",
    unit: "%",
    targetField: "g_80",
    referenceField: "ref_g_80",
    optimal: "higher", // more usable gains, lower the line because lower the heating system demand, and lower costs for same
    description: "Net useable internal gains utilization",
  },
  {
    id: "thermal_bridge",
    label: "TB%",
    unit: "%",
    targetField: "d_97",
    referenceField: "ref_d_97",
    optimal: "lower", //lower % is lower thermal transmission, lower heatloss, lower costs, lower line
    description: "Thermal bridging penalty",
  },
  {
    id: "aggregate_ground_uvalue",
    label: "Ag",
    unit: "W/m²K",
    targetField: "g_102",
    referenceField: "ref_g_102",
    optimal: "lower",
    description: "Aggregate U-value for all elements facing ground",
  },
  {
    id: "aggregate_air_uvalue",
    label: "Ae",
    unit: "W/m²K",
    targetField: "g_101",
    referenceField: "ref_g_101",
    optimal: "lower",
    description: "Aggregate U-value for all elements facing air",
  },
  {
    id: "normalized_airtightness",
    label: "NRL50",
    unit: "L/s·m²",
    targetField: "g_108",
    referenceField: "ref_g_108",
    optimal: "lower",
    description: "Normalized air leakage rate at 50Pa",
  },
  {
    id: "window_wall_ratio",
    label: "WWR",
    unit: "%",
    targetField: "d_107",
    referenceField: "ref_d_107",
    optimal: "balanced",
    description: "Window-to-wall ratio (affects gains vs losses)",
  },
  {
    id: "heating_efficiency",
    label: "HEAT%",
    unit: "%",
    targetField: "h_113",           // Heatpump/Electric COP path
    targetFieldMultiplier: 100,     // h_113 * 100 (COP 3.0 → 300%, Electric 1.0 → 100%)
    targetFieldAlt: "j_115",        // Oil/Gas AFUE path
    targetFieldAltMultiplier: 100,  // j_115 * 100 (AFUE 0.90 → 90%)
    targetFieldSelector: "d_113",   // Conditional: Heatpump/Electricity vs Oil/Gas
    referenceField: "ref_h_113",
    referenceFieldMultiplier: 100,
    referenceFieldAlt: "ref_j_115",
    referenceFieldAltMultiplier: 100,
    referenceFieldSelector: "ref_d_113",
    optimal: "higher",
    description: "Heating system efficiency - COP×100% for electric/heatpump, AFUE×100% for fossil fuels",
  },
  {
    id: "mvhr_efficiency",
    label: "MVHR%",
    unit: "%",
    targetField: "d_118",
    referenceField: "ref_d_118",
    optimal: "higher",
    description: "Mechanical Ventilation Heat Recovery efficiency",
  },
  {
    id: "tedi",
    label: "TEDI",
    unit: "kWh/m²·yr",
    targetField: "h_127",
    referenceField: "ref_h_127",
    optimal: "lower",
    description: "Thermal Energy Demand Intensity (per m² area)",
  },
  {
    id: "teli",
    label: "TELI",
    unit: "kWh/m²·yr",
    targetField: "h_131",
    referenceField: "ref_h_131",
    optimal: "lower",
    description: "Thermal Envelope Loss Intensity (per m² area)",
  },
  {
    id: "ghgi",
    label: "GHGI",
    unit: "kgCO2e/m²·yr",
    targetField: "h_8",              // ⚠️ SPECIAL: Target uses h_8 (NOT d_8)
    referenceField: "e_8",           // ⚠️ SPECIAL: Reference uses e_8 (NOT ref_e_8)
    optimal: "lower",
    description: "Greenhouse Gas Intensity",
  },
  {
    id: "teui",
    label: "TEUI",
    unit: "kWh/m²·yr",
    targetField: "h_10",             // ⚠️ SPECIAL: Target uses h_10 (NOT d_10)
    referenceField: "e_10",          // ⚠️ SPECIAL: Reference uses e_10 (NOT ref_e_10)
    optimal: "lower",
    description: "Total Energy Use Intensity",
  },
];
```

**⚠️ CRITICAL NOTES**:

1. **Conditional Fields with Multipliers** (Axes 1, 9):

   **SHW% (Axis 1)**:
   - Field depends on heating fuel type (d_51 / ref_d_51)
   - If `Electric` or `Heatpump` → use `d_52` (already in %)
   - If `Oil` or `Gas` → use `k_52 * 100` (AFUE → %)

   **HEAT% (Axis 9)** - Unified heating efficiency:
   - Field depends on heating system type (d_113 / ref_d_113)
   - If `Heatpump` or `Electricity` → use `h_113 * 100` (COP → %)
     - Example: COP 3.0 → 300%, Electric 1.0 → 100%
   - If `Oil` or `Gas` → use `j_115 * 100` (AFUE → %)
     - Example: AFUE 0.90 → 90%
   - **Result**: All heating efficiencies displayed as percentages

2. **Special Field Naming** (Axes 13, 14):
   - **GHGI**: Target = `h_8`, Reference = `e_8` (NOT `ref_e_8`)
   - **TEUI**: Target = `h_10`, Reference = `e_10` (NOT `ref_e_10`)
   - These do NOT follow the standard `ref_` prefix pattern

3. **Unit Corrections**:
   - **Ag/Ae**: represent aggregate U-values (W/m²K), Ae surfaces to air, Ag surfaces to ground
   - **TELI**: Thermal **Total Envelope Loss/m2 of Envelope** Intensity (not "Load")
   - **nGains%**: Net **useable** internal gains, a function of mass, mass transfer effects, heat recovery, thermal storage, etc.

4. **All Other Axes** (2-4, 7-8, 10-12): Standard `ref_` prefix for Reference mode

### Two-Line Rendering (Target & Reference)

```javascript
function renderParallelCoordinates(axes, targetData, referenceData) {
  // Create vertical scales for each axis
  const scales = axes.map(axis =>
    d3.scaleLinear()
      .domain(axis.domain)
      .range([graphHeight, 0])
  );

  // Line generator
  const line = d3.line()
    .x((d, i) => xScale(i))  // Horizontal position
    .y((d, i) => scales[i](d));  // Vertical position per axis

  // Draw blue line (Target)
  svg.append("path")
    .datum(targetData)
    .attr("class", "target-line")
    .attr("d", line)
    .style("stroke", "#007bff")  // Blue
    .style("stroke-width", 3)
    .style("fill", "none");

  // Draw red line (Reference)
  svg.append("path")
    .datum(referenceData)
    .attr("class", "reference-line")
    .attr("d", line)
    .style("stroke", "#dc3545")  // Red
    .style("stroke-width", 3)
    .style("fill", "none");
}
```
*need to determine processor overhead burden of rubber-banding recalculations so line moves with node on interactive nodes for improved UX.
---

## 6. Styling and Differentiation

### Making It Unique (Not Generic PC Graph, but a clear representation of a worse Reference model and a better Target model)

**Design Differentiators**:
1. **Two-line focus** - Not cluttered with dozens of lines
2. **Color-coded optimization** - Blue (Target) vs Red (Reference) clearly labeled
3. **Contextual axes** - Only show high-impact, low-capital cost parameters
4. **Integrated table** - Live data below graph (not separate) with editable nodes that update all section inputs and updated totals in KeyValues (functional now for first 3 axes)
5. **Minimalist aesthetic** - Clean, professional, not academic
6. **Interactive highlights** - Hover to show delta values between lines

**Visual Style**: Attempt to keep all styling in styles.css, not inline!
```css
/* Clean, modern parallel coordinates */
.parallel-coordinates-container {
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
}

.axis line {
  stroke: #ccc;
  stroke-width: 2;
}

.axis text {
  font-size: 12px;
  fill: #333;
  font-weight: 500;
}

.target-line {
  stroke: #007bff;
  stroke-width: 3;
  fill: none;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.reference-line {
  stroke: #dc3545;
  stroke-width: 3;
  fill: none;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.target-line:hover,
.reference-line:hover {
  opacity: 1;
  stroke-width: 4;
}

/* Axis labels with impact indicators */
.axis-label {
  font-weight: 600;
  fill: #222;
}

.axis-label.high-impact {
  fill: #ff6b6b;  /* Red for high impact */
}

.axis-label.low-cost {
  fill: #51cf66;  /* Green for low cost */
}
```

---

## 7. Implementation Phases

### Phase 1: Infrastructure Setup ✅ COMPLETED
- [x] Rename Section 18 → Section 19 (Notes/Debug)
- [x] Create new Section 18 (Optimize)
- [x] Update navigation (tab label, icon, tooltip)
- [x] Create minimal Section18.js module stub

### Phase 2: Data Schema ✅ COMPLETED (November 23, 2025)
**Dependencies**: ✅ User provided axis list

**Tasks**:
1. [x] Receive list of axes/parameters from user (14 axes)
2. [x] Map each parameter to StateManager field IDs
3. [ ] Define domain ranges (min/max) for each axis (requires data analysis)
4. [ ] Classify by impact (high/medium/low) and cost (low/medium/high)
5. [ ] Create `OPTIMIZATION_AXES` configuration object

**Critical Implementation Notes**:
- **2 Conditional axes** require runtime field selection (SHW%, HSPF)
- **2 Special axes** use non-standard field naming (GHGI, TEUI)
- **10 Standard axes** follow `ref_` prefix pattern

**File**: ✅ Created `src/core/ppConfig.js`

### Phase 3: Core Visualization Module ✅ COMPLETED (November 24, 2025)
**Dependencies**: Phase 2 complete

**Tasks**:
1. [x] Create `src/core/ParallelCoordinates.js` (main module) - **680 lines**
2. [x] Implement data fetching (Target vs Reference from StateManager)
3. [x] Implement D3.js parallel coordinates renderer
   - [x] Create SVG container (75% height for graph)
   - [x] Draw vertical axes
   - [x] Draw blue line (Target data)
   - [x] Draw red line (Reference data)
   - [x] Add axis labels with units
4. [x] Implement control panel
   - [x] Fullscreen toggle
   - [x] Refresh button
   - [x] Export PNG functionality
   - [x] Settings panel (placeholder for future)
5. [x] Implement data table (25% height)
   - [x] Target values column
   - [x] Reference values column
   - [x] Delta (Δ) column
   - [x] Percentage change (%) column

**Files Created**:
- `src/core/ppConfig.js` (~346 lines) - Configuration with 14 axes
- `src/core/ParallelCoordinates.js` (~680 lines) - Main visualization module

### Phase 4: Integration & Testing ⚠️ IN PROGRESS (November 24, 2025)
**Dependencies**: Phase 3 complete

**Tasks**:
1. [x] Add script imports to index.html (ppConfig.js + ParallelCoordinates.js in core section)
2. [x] Add "Activate Optimization View" button following S16/S17 pattern
3. [x] Test data loading from StateManager
4. [x] Test control panel buttons
5. [x] Test fullscreen mode
6. [ ] Test responsive layout (mobile/tablet/desktop)
7. [x] Verify table data matches graph
8. [x] Performance testing (render time < 500ms) - recalcs are sub 100ms, render sub 60ms. Excellent!

**Current Status**: Modules created and imported, activate button added. Tested, expanding interactivity and economics now.

### Phase 5: Polish & Documentation
**Dependencies**: Phase 4 complete

**Tasks**:
1. [ ] Add hover interactions (show delta on hover)
2. [ ] Add tooltips for axes (explain parameter impact/cost)
3. [ ] Add loading state indicator
4. [ ] Add error handling (missing StateManager values)
5. [ ] Maintain this documentation as future User and Dev guide
6. [ ] Update CLAUDE.md with S18 architecture notes
7. [ ] Create user guide section in docs

---

## 8. Technical Specifications

### Browser Compatibility
- **Target**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- **D3.js v7**: Requires ES6+ support (covered by target browsers)- seems fine using only local Filereader methods...

### Performance Targets
- **Initial render**: < 200ms
- **Refresh/update**: < 100ms
- **Fullscreen toggle**: < 100ms
- **Export PNG**: < 2s - works but this should be a PDF report with graph and table, not just an image

### Accessibility
- **Keyboard navigation**: Arrow keys to traverse axes
- **Screen reader support**: ARIA labels on axes and lines
- **Color contrast**: WCAG AA compliance (4.5:1 minimum)
- **Alternative text**: Table provides data fallback if graph fails

---

## 9. Open Questions

1. ~~**Axis List**: Which parameters to visualize?~~ ✅ RESOLVED - 14 axes defined
2. **Axis Order**: Left-to-right sequence by Section Order and impact, category.
   - Current order: As provided by user (inputs → outputs)
3. **Domain Ranges**: Min/max for each axis
   - Need to analyze typical value ranges from StateManager
   - Consider auto-scaling vs fixed ranges (depends on Axis/System)
4. **Normalization**: Should axes be normalized (0-1) or use actual units?
   - Recommendation: Keep actual units for clarity
   - Use per-axis scaling (each axis independent)
5. **Interaction**: Should axes be draggable/reorderable?
   - Phase 3: No (fixed order)
   - Phase 5: Optional enhancement
6. **Export**: PNG only, or also PDF/SVG/CSV?
   - Phase 3: PNG only
   - Phase 5: Add CSV table export
7. **Filtering**: Allow hiding/showing individual axes?
   - Phase 5: Optional enhancement
8. **Comparison Mode**: Support more than 2 lines (e.g., multiple scenarios)?
   - Phase 3: No (Target vs Reference only)
   - Future: Could add user-defined scenarios

---

## 10. File Structure

```
objective/
├── index.html                          ✅ Updated (S18 HTML structure + activate button)
├── src/
│   ├── core/
│   │   ├── init.js                     ✅ Updated (navigation mapping)
│   │   ├── ppConfig.js                 ✅ Created (14-axis configuration)
│   │   └── ParallelCoordinates.js      ✅ Created (main visualization)
│   └── sections/
│       ├── Section18.js                ✅ Created (minimal module stub)
│       └── Section19.js                ✅ Renamed (formerly Section18.js)
└── docs/
    └── development/
        ├── S18-OPTIMIZE.md             ✅ This file
        └── history (completed)/        ✅ Archived completed project docs
```

---

## 11. Dependencies Summary

### External Libraries (Already Loaded ✅)
- **D3.js v7.min.js** - Core library (sufficient for parallel coordinates)
- **No additional libraries needed!**

### Internal Dependencies
- **StateManager** - Data source (Target/Reference values)
- **ReferenceToggle** - Mode awareness (Target vs Reference)
- **FieldManager** - Field registration (if needed)
- **Section16/17 patterns** - Architectural reference

---

## 12. Next Steps

### Immediate (Today - November 23, 2025)
- [x] Create this workplan document
- [x] Review with user
- [x] Await parameter list from user (tomorrow)

### Tomorrow (November 24, 2025)
1. **User provides**: List of parameters to visualize
2. **Developer creates**: `ParallelCoordinatesConfig.js` with axes definitions
3. **Developer begins**: Core visualization module (`ParallelCoordinates.js`)

### Week of November 25, 2025
1. Complete core visualization (graph + table)
2. Implement control panel
3. Test and iterate
4. Add Interactive Features and Economics sections
5. Polish and document

---

## 13. References

### Internal Files
- [Section16.js](../src/sections/Section16.js) - Sankey diagram pattern
- [Section16C.js](../src/sections/Section16C.js) - Cooling Sankey, mode-aware data fetching
- [Section17.js](../src/sections/Section17.js) - Dependency graph minimal module
- [index.html](../index.html#L650-L669) - S18 HTML structure

### External Resources
- [D3.js v7 Documentation](https://d3js.org/)
- [D3.js Parallel Coordinates Examples](https://observablehq.com/@d3/parallel-coordinates)
- [D3.js Scale Documentation](https://github.com/d3/d3-scale)
- [D3.js Axis Documentation](https://github.com/d3/d3-axis)

### Licensing
- [D3.js BSD 3-Clause License](https://github.com/d3/d3/blob/main/LICENSE)

---

## Status Log

| Date | Status | Notes |
|------|--------|-------|
| 2025-11-23 | Planning | Workplan created |
| 2025-11-23 | Phase 2 Complete | User provided 14-axis configuration with conditional logic |
| 2025-11-24 | Phase 3 Complete | Created ppConfig.js (346 lines) and ParallelCoordinates.js (680 lines) |
| 2025-11-24 | Phase 4 In Progress | Added imports, activate button. Working state: Commit 64cf4a8 |
| 2025-11-24 | Refactor Attempt | Attempted S17 two-phase pattern. Commits 5be5fd6, a2d581e - **UPDATE THIS TO REFLECT CURRENT STATE OF CODEBASE NOV 25** |

---

**Document Version**: 1.2
**Last Updated**: November 24, 2025 (Session 3 - SUCCESSFUL)
**Author**: Claude (AI Assistant) + Andrew Thomson
**Branch**: S18-19-PARALLEL-COORDINATES
**Status**: ✅ FIXED - S18 now initializing correctly with S17 button pattern

---

## SUCCESSFUL FIX - Session 3 (November 24, 2025)

### Root Cause Identified 🎯

**THE PROBLEM**: `parallelCoordinates` section was **NOT REGISTERED** in FieldManager.js!

**Location**: [FieldManager.js:19-38](../../src/core/FieldManager.js#L19-L38)

```javascript
// ❌ BEFORE (Missing parallelCoordinates mapping)
const sections = {
  keyValues: "sect01",
  buildingInfo: "sect02",
  // ... other sections ...
  sankeyDiagram: "sect16",
  dependencyDiagram: "sect17",
  notes: "sect18",  // ❌ Should be sect19
};

// ✅ AFTER (Fixed mapping)
const sections = {
  keyValues: "sect01",
  buildingInfo: "sect02",
  // ... other sections ...
  sankeyDiagram: "sect16",
  dependencyDiagram: "sect17",
  parallelCoordinates: "sect18",  // ✅ Added
  notes: "sect19",                 // ✅ Fixed
};
```

### Why Previous Attempts Failed

Both refactor attempts failed because `initializeEventHandlers()` was never called. The reason was simple:

1. FieldManager.renderSection() calls `initializeSectionEventHandlers(sectionId)` for each section
2. `initializeSectionEventHandlers()` looks up the section in the `sections` mapping
3. Since `parallelCoordinates` wasn't in the mapping, it **never called** `Section18.initializeEventHandlers()`

### The Complete Solution

**Commit**: `6c5a4bc` - Fix: S18 initialization - register parallelCoordinates in FieldManager and implement S17 button pattern

#### 1. FieldManager.js - Section Registration
- Added `parallelCoordinates: "sect18"` mapping
- Updated `notes: "sect19"` mapping

#### 2. ParallelCoordinates.js - S17 Pattern Implementation
Refactored to match Dependency.js pattern exactly:

**New Functions**:
- `createInitialControlsRow()` - Creates activate button + disabled controls in single row
- `createLoadingPlaceholder()` - Creates user-friendly placeholder message
- `activateVisualization()` - Transforms "Activate Optimization View" → "Refresh Graph" button
- `initializeFullControls()` - Enables all controls after activation

**Key Changes**:
- Added DOMContentLoaded listener (like S17)
- Single-row layout: Activate button (left) + Controls (right, disabled until activated)
- Button transformation on click (Primary blue → Outline secondary)
- Proper state management with `isActivated` flag

#### 3. Section18.js - Minimal Pattern
- Simplified `initializeEventHandlers()` to just log message
- Removed direct call to `ParallelCoordinates.initialize()`
- ParallelCoordinates.js now handles its own initialization via DOMContentLoaded

### Architecture Pattern Comparison

**S17 (Dependency Graph)**:
```
Section17.js (minimal)
  → NO initializeEventHandlers call
Dependency.js (autonomous)
  → DOMContentLoaded listener
  → createInitialControlsRow()
  → activateDependencyGraph() on button click
```

**S18 (Parallel Coordinates)** - NOW MATCHES:
```
Section18.js (minimal)
  → NO initializeEventHandlers call
ParallelCoordinates.js (autonomous)
  → DOMContentLoaded listener
  → createInitialControlsRow()
  → activateVisualization() on button click
```

### Lessons Learned

1. **Always check section registration first** - Before debugging complex initialization logic, verify the section is registered in FieldManager.js
2. **Follow existing patterns** - S17 pattern works because Dependency.js is autonomous with DOMContentLoaded
3. **Trust the simple solution** - The fix was just adding one line to the sections mapping
4. **Document status clearly** - Recovery plan helped track the problem across sessions

### Files Modified

- ✅ [src/core/FieldManager.js](../../src/core/FieldManager.js) - Line 37-38 (section mapping)
- ✅ [src/core/ParallelCoordinates.js](../../src/core/ParallelCoordinates.js) - Lines 64-254, 782-805 (S17 pattern)
- ✅ [src/sections/Section18.js](../../src/sections/Section18.js) - Lines 35-39 (minimal pattern)

### Current Status - SUCCESS ✅

**Commit**: `7664231` - Fix: S18 graph not rendering - container height fix

**GRAPH NOW RENDERING SUCCESSFULLY!** 🎉

✅ **Completed (Session 3)**:
- S18 section registered in FieldManager
- Button pattern matches S17 (single-row controls)
- "Activate Optimization View" → "Refresh Graph" transformation works
- Control buttons styled and positioned correctly (fullscreen at far right)
- Graph renders with D3.js v7
- Table renders below graph with 14 parameter rows
- Container height fixed (min-height: 600px)

**Known Issues Fixed**:
- ✅ Container height was 0, causing negative SVG height (-80px)
- ✅ Button state management (isActivated flag set before control recreation)
- ✅ CSS styling matches S17 pattern

---

## AFTERNOON WORKPLAN - Graph Refinements

**Status**: Ready for implementation
**Priority**: High (visual/UX improvements)

### Task 1: Remove Table Header Row
**Goal**: Align graph axes directly with table parameter labels

**Current**: Table has header row "SHW% | DWHR% | nGains% | ..." above data
**Target**: Remove header, axes labels align directly with first table column

**Files**: [ParallelCoordinates.js:renderTable()](../../src/core/ParallelCoordinates.js) (lines ~590-680)

**Implementation**:
- Remove `<thead>` creation in renderTable()
- Start table directly with data rows (Target, Reference, Δ, %Δ)
- Ensure axis labels in graph match table column positions

---

### Task 2: Flip Efficiency Axes (Invert Y-Scale)
**Goal**: "Lower is better" visual theme - optimized Target line should be BELOW Reference line

**Concept**: Higher efficiency % = lower energy loss = lower position on graph

**Axes to Flip** (invert Y-scale):
1. ✅ **SHW%** - Higher efficiency → Lower line
2. ✅ **DWHR%** - Higher efficiency → Lower line
3. ✅ **nGains%** - Higher utilization → Lower line
4. ❌ **TB%** - Already correct (thermal bridging penalty, lower is better)
5. **WWR** - Needs scale adjustment (see Task 2b)
6. ✅ **HEAT%** - Higher efficiency → Lower line
7. ✅ **MVHR%** - Higher efficiency → Lower line

**Files**: [ParallelCoordinates.js:renderGraph()](../../src/core/ParallelCoordinates.js) (lines ~367-410)

**Implementation**:
```javascript
// Current: y-scale normal (low value = bottom, high value = top)
const yScale = d3.scaleLinear()
  .domain([minVal, maxVal])
  .range([graphHeight, 0]); // 0 = top

// Flip for efficiency axes: invert range
const yScale = d3.scaleLinear()
  .domain([minVal, maxVal])
  .range([0, graphHeight]); // 0 = bottom (INVERTED)
```

**Logic**:
- Check axis `optimal` property in ppConfig.js
- If `optimal: "higher"` AND axis is efficiency (contains "%") → invert scale
- If `optimal: "lower"` → keep normal scale

---

### Task 2b: WWR Scale Adjustment
**Goal**: Display WWR as proper percentage (0-100 scale)

**Current**: WWR = 0.33 (ratio) displays at bottom of 0.0-1.0 scale
**Target**: WWR = 33% (percentage) displays mid-range on 0-100 scale

**Files**: [ppConfig.js:OPTIMIZATION_AXES](../../src/core/ppConfig.js) (lines ~304-312)

**Current Config**:
```javascript
{
  id: "window_wall_ratio",
  label: "WWR",
  unit: "%",
  targetField: "d_107",
  referenceField: "ref_d_107",
  optimal: "balanced",
  description: "Window-to-wall ratio (affects gains vs losses)",
}
```

**Implementation**:
- Add `multiplier: 100` to WWR axis config
- Apply multiplier in data fetching: `value = rawValue * 100`
- Display as 33% instead of 0.33
- Y-scale domain: [0, 100] instead of [0, 1]

---

### Task 3: Move Legend to Controls Row
**Goal**: Prevent legend from overlapping graph/table

**Current**: Legend renders inside `.parallel-coordinates-container` (interferes with SVG)
**Target**: Legend renders in controls row or separate container above graph

**Files**:
- [ParallelCoordinates.js:renderGraph()](../../src/core/ParallelCoordinates.js) - Legend creation
- [index.html:649-652](../../index.html#L649-L652) - Info wrapper container

**Options**:
1. **Info Panel** (Recommended): Use `.parallel-coordinates-info-wrapper` (already exists)
   - Render legend as simple HTML: `[Blue square] Target | [Red square] Reference`
   - Position above graph, below controls

2. **Inline in Controls**: Add legend to end of controls row
   - Append after fullscreen button: `<span>Target</span> <span>Reference</span>`
   - Less prominent, saves vertical space

**Implementation (Option 1)**:
```javascript
function createLegend() {
  const infoWrapper = document.querySelector('.parallel-coordinates-info-wrapper');
  if (!infoWrapper) return;

  infoWrapper.innerHTML = `
    <div style="display: flex; gap: 20px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 20px; height: 3px; background: #007bff;"></div>
        <span>Target Model</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 20px; height: 3px; background: #dc3545;"></div>
        <span>Reference Model</span>
      </div>
    </div>
  `;
}
```

Call `createLegend()` after `activateVisualization()`.

---

### Implementation Order
1. **Task 1** (Simple) - Remove table header
2. **Task 2b** (Simple) - WWR multiplier in ppConfig.js
3. **Task 2** (Moderate) - Flip efficiency axes Y-scales
4. **Task 3** (Simple) - Move legend to info panel

**Estimated Time**: 1-2 hours
**Testing**: Visual inspection of graph/table alignment and "lower is better" theme

---

### Success Criteria
- ✅ Graph axes align directly with table parameter labels (no header row)
- ✅ WWR displays as 33% (not 0.33) on 0-100 scale
- ✅ Efficiency axes inverted: Higher % = Lower line position
- ✅ Target (blue) line visibly LOWER than Reference (red) line for optimized building
- ✅ Legend positioned cleanly (no graph overlap)
- ✅ Visual theme: "Lower = Better performance"

---

## Implementation Status (November 24, 2025 - Post-Compact)

### ✅ Completed Tasks

**Morning Session:**
1. ✅ Fixed FieldManager.js section registration
   - Added `parallelCoordinates: "sect18"` to sections mapping
   - Fixed `notes: "sect19"`
   - Root cause of all initialization failures resolved

2. ✅ Implemented S17 pattern (DOMContentLoaded autonomous initialization)
   - Added isActivated state flag
   - Refactored initialize() for placeholder + disabled controls
   - Created createInitialControlsRow() with activate button
   - Created activateVisualization() for button transformation
   - Simplified Section18.js to minimal pattern

3. ✅ Fixed container height issue
   - Added `.parallel-coordinates-container { min-height: 600px; }` to CSS
   - Graph now renders with correct dimensions (1226 x 370)

4. ✅ Matched S17 control styling
   - Added S18-specific CSS (lines 1825-1879 in styles.css)
   - Control row layout with flexbox
   - Fullscreen button positioned at far right with margin-left: auto

5. ✅ Cleaned up HTML
   - Removed redundant standalone "Activate Optimization View" button
   - Removed static placeholder text

**Afternoon Session:**
6. ✅ Removed table header row (Task 1)
   - Commented out thead creation (lines 623-632)
   - Preserved code for future finance row functionality
   - Table axes now align directly with graph axes above

7. ✅ Moved legend to controls row inline (Task 3)
   - Integrated Target/Reference legend into controls row
   - Legend positioned between main button and utility buttons
   - Added border-left separator for visual grouping

8. ✅ Fixed legend order (Post-compact)
   - Reordered layoutContainer appends
   - Final order: Legend, Refresh, Export, Settings, Fullscreen
   - Matches user specification: [Activate/Refresh] ... Target Reference [↻][⬇][⚙][⛶]

### ⚠️ Known Issues

1. **SVG Axis Labels Still Visible**
   - User reported "header row label in the chart still renders"
   - Investigation revealed: NOT the table header (properly commented out)
   - Actual source: SVG axis labels at top of graph (lines 436-453)
   - These are INTENTIONAL and NECESSARY - they show what each axis represents
   - Table header was redundant duplication, now removed
   - **No action needed** - this is correct behavior

### 📋 Afternoon Session #2 - Axis Scaling & Domain Refinements

9. ✅ **Flipped Efficiency Axes (Task 2)** - [ParallelCoordinates.js:390-419](src/core/ParallelCoordinates.js#L390-L419)
   - Inverted Y-scale for all axes with `optimal: "higher"`
   - Conditional range: `axis.optimal === "higher" ? [0, height] : [height, 0]`
   - Higher efficiency values now appear LOWER on screen
   - Visual theme: "Lower = Better performance"
   - Affected axes: SHW%, DWHR%, nGains%, HEAT%, HRV% (6 metrics)

10. ✅ **WWR Scale Adjustment (Task 2b)** - [ppConfig.js:136-139](src/core/ppConfig.js#L136-L139)
   - Added `targetFieldMultiplier: 100` and `referenceFieldMultiplier: 100`
   - WWR displays as 33% instead of 0.33
   - Domain already set to [0, 100]

11. ✅ **DWHR Domain Adjustment** - [ppConfig.js:61](src/core/ppConfig.js#L61)
   - Changed domain from [0, 100] to [0, 80]
   - Few systems exceed 75% efficiency, realistic range

12. ✅ **nGains Percentage Multiplier** - [ppConfig.js:72-74](src/core/ppConfig.js#L72-L74)
   - Added `targetFieldMultiplier: 100` and `referenceFieldMultiplier: 100`
   - g_80 stored as decimal (0.40) now displays as percentage (40%)
   - Domain confirmed [0, 100] - always 0-100%, never more, never less

### 📋 Polish & Final Refinements

13. ✅ **Compact Initial Canvas Height** - [styles.css:1877-1884](src/styles.css#L1877-L1884), [ParallelCoordinates.js:184](src/core/ParallelCoordinates.js#L184)
   - Changed `.parallel-coordinates-container` min-height to 150px
   - Added `.parallel-coordinates-container.activated { height: 500px; }` in CSS
   - JavaScript adds `activated` class on activation (single source of truth in CSS)
   - Container expands to 500px on activation (reduced from 600px)
   - 100px saved for future table rows (financial metrics planned)

14. ✅ **Table Bottom Spacing** - [styles.css:1882-1884](src/styles.css#L1882-L1884)
   - Added `.pc-data-table { margin-bottom: 5px; }`
   - Prevents table from sitting directly on container border
   - Clean visual separation

### 🎯 Current Success State

**Graph Rendering:** ✅ Working perfectly
- 14 axes rendering correctly with inverted efficiency scales
- 2 lines (Target blue, Reference red)
- Initial: Compact 150px placeholder → Expands to 500px on activation
- 100px reserved for future table rows (financial metrics)
- Visual theme: Lower = Better (optimized Target line below Reference)

**Controls:** ✅ Match S17 pattern
- Activate → Refresh button transformation works
- Legend inline with controls (Target/Reference)
- Correct button order: Legend, Refresh, Export, Settings, Fullscreen
- Compact initial state matching S17

**Table:** ✅ Clean alignment & spacing
- Column headers with axis labels/units
- No row labels (axes align with graph above)
- 4 rows: Target, Reference, Delta (Δ), Percent Delta (%Δ)
- 5px bottom margin for clean visual separation

**Axis Scaling:** ✅ Accurate percentage display
- WWR: 33% (not 0.33) - domain [0, 100]
- nGains: 40% (not 0.40) - domain [0, 100]
- DWHR: 0-80% range (realistic, few exceed 75%)
- All efficiency axes inverted for "lower = better" visual

---

## Next Steps (Planned Features)

### 🎯 Priority: Financial Metrics Rows

**Goal:** Add 3 new table rows showing financial impact of optimization decisions

**Phase 1: Table Structure (Blocking with Dummy Data)** ✅ COMPLETE
- ✅ Added "Ref Cost" row (Red, $0.00 per axis)
- ✅ Added "Target Cost" row (Blue, $0.00 per axis)
- ✅ Added "Savings" row (Green, $0.00 per axis)
- ✅ Row labels added to all 7 rows (100px wide, left-aligned)
- ✅ Graph left margin increased 40px→70px for alignment

**Phase 2: Vertical Space & Alignment Fixes** 🚧 NEXT
- [ ] **Vertical Space Issue:** Bottom "Savings" row is clipped
  - Options:
    - Increase container from 500px to 550px (add 50px)
    - Reduce graph top margin to let it touch control row
    - Reduce table font size slightly
  - Current: Graph 55% (275px), Table 45% (225px + 10px padding)

- [ ] **Column Alignment Issue:** Table columns don't perfectly align with graph axes
  - Problem: Graph has 70px left margin, table has 100px row label column
  - 30px mismatch causes slight horizontal offset
  - Options:
    - Adjust graph left margin to match table row label width (100px)
    - Use CSS grid for table with fixed column widths matching graph x-positions
    - Calculate exact axis positions and apply as inline widths
  - **Recommended:** Graph left margin = row label width (both 100px)

**Phase 3: Financial Calculations** 🚧 IN PROGRESS

**Goal:** Calculate real financial impact (cost in CAD$) for each optimization axis

**Architecture Decision - Base vs Pro Split:**

Since financial formulas will be **Pro version only**, we need a clean separation strategy:

**Option A: Separate Config Files** (Recommended)
- Create `ppConfigBase.js` (no financial calculations)
- Create `ppConfigPro.js` (extends Base with financial formulas)
- ParallelCoordinates.js checks which config is loaded
- Build process copies appropriate file

**Option B: Feature Flag in Config**
- Add `financialFormulas` object to ppConfig.js
- Set to `null` in Base version, populated in Pro version
- ParallelCoordinates.js checks if formulas exist before calculating

**Option C: Separate Financial Module**
- Keep ppConfig.js unchanged (data fields only)
- Create `ppFinancials.js` (Pro-only module with all formulas)
- ParallelCoordinates.js imports ppFinancials.js if available
- Base version simply doesn't include the script tag

**DECISION:** Option C - Separate Financial Module
- ✅ Cleanest separation (one file to exclude for Base)
- ✅ No config file duplication
- ✅ ParallelCoordinates.js works with both versions
- ✅ Easy to maintain (formulas in dedicated file)
- ✅ No build process changes needed

**Implementation Plan:**

1. **Create `src/core/ppFinancials.js`** (Pro-only file)
   - IIFE pattern: `window.TEUI.ppFinancials = (function() { ... })()`
   - Export `calculateFinancials(axisId, mode)` function
   - Returns `{ cost: number }` for given axis and mode (target/reference)
   - Each axis has dedicated calculation function

2. **Update `ParallelCoordinates.js`**
   - Check if `window.TEUI.ppFinancials` exists
   - If yes: Call financial calculations for each axis
   - If no: Display $0.00 (Base version behavior)
   - Format currency: `new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' })`

3. **Update `index.html`**
   - Add `<script src="src/core/ppFinancials.js"></script>` (Pro version)
   - Comment out or omit in Base version

**Financial Formula Structure:**

```javascript
// ppFinancials.js
window.TEUI = window.TEUI || {};
window.TEUI.ppFinancials = (function () {

  const StateManager = window.TEUI.StateManager;

  // Helper to get StateManager value
  const getValue = (key) => {
    const val = StateManager?.getValue(key);
    return parseFloat(val) || 0;
  };

  // Financial calculation per axis
  const calculations = {

    shw_efficiency: {
      // SHW% (Service Hot Water Efficiency)
      target: () => {
        const energy = getValue('j_51');        // Total SHW energy (kWh) - TARGET
        const rate = getValue('l_12');          // Electricity cost ($/kWh) - TARGET
        return energy * rate;                   // Target cost ($)
      },
      reference: () => {
        const energy = getValue('ref_j_51');    // Total SHW energy (kWh) - REFERENCE
        const rate = getValue('ref_l_12');      // Electricity cost ($/kWh) - REFERENCE
        return energy * rate;                   // Reference cost ($)
      },
      savings: function() {
        return this.reference() - this.target(); // Savings ($) - positive when optimized
      }
    },

    // dwhr_efficiency: { ... },
    // net_gains: { ... },
    // ... (13 more axes)
  };

  // Public API
  function calculateFinancials(axisId, mode = 'target') {
    const calc = calculations[axisId];
    if (!calc) return { cost: 0 };

    if (mode === 'reference') {
      return { cost: calc.reference() };
    } else if (mode === 'target') {
      return { cost: calc.target() };
    } else if (mode === 'savings') {
      return { cost: calc.savings() };
    }

    return { cost: 0 };
  }

  return {
    calculateFinancials,
  };
})();
```

**Usage in ParallelCoordinates.js:**

```javascript
function renderFinancialRows(axes) {
  // Check if Pro version
  const hasPro = window.TEUI?.ppFinancials?.calculateFinancials;

  if (!hasPro) {
    // Base version: show $0.00
    return renderDummyFinancialRows(axes);
  }

  // Pro version: calculate real costs
  axes.forEach(axis => {
    const refCost = window.TEUI.ppFinancials.calculateFinancials(axis.id, 'reference');
    const targetCost = window.TEUI.ppFinancials.calculateFinancials(axis.id, 'target');
    const savings = window.TEUI.ppFinancials.calculateFinancials(axis.id, 'savings');

    // Format currency
    const formatter = new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    // Render cells with formatted values
    refCostRow.innerHTML += `<td class="text-center pc-reference-cell">${formatter.format(refCost.cost)}</td>`;
    targetCostRow.innerHTML += `<td class="text-center pc-target-cell">${formatter.format(targetCost.cost)}</td>`;
    savingsRow.innerHTML += `<td class="text-center text-success">${formatter.format(savings.cost)}</td>`;
  });
}
```

**First Formula: SHW% (Service Hot Water Efficiency)** ✅ COMPLETE

**Formula Pattern (Template for All Axes):**

```javascript
// pcFinancials.js - Axis calculation template
axis_name: {
  target: () => {
    // Get StateManager values (use base field IDs)
    const value1 = getValue('field_id');     // Auto-strips $ and commas
    const value2 = getValue('field_id2');

    // Calculate annual cost
    return value1 * value2;  // Or more complex formula
  },
  reference: () => {
    // Get StateManager values (use ref_ prefix)
    const value1 = getValue('ref_field_id');
    const value2 = getValue('ref_field_id2');

    // Calculate annual cost
    return value1 * value2;
  },
  savings: function() {
    const delta = this.reference() - this.target();
    return delta > 0 ? delta : 0; // Only show positive savings, $0 if cost increases
  }
}
```

**SHW% Implementation:**

**StateManager Fields:**
- **Target Cost:** `(k_51 × l_12) + (e_51 × l_13) + (k_54 × l_16)`
  - `k_51`: Net electric demand (kWh) - 0 when gas/oil system
  - `l_12`: Electricity rate ($/kWh) - stored as "$0.1300"
  - `e_51`: Gas energy (kWh) - 0 when electric/oil system
  - `l_13`: Gas rate ($/kWh) - stored as "$0.0750"
  - `k_54`: Oil volume (litres) - 0 when electric/gas system
  - `l_16`: Oil price ($/litre) - stored as "$1.2000"
- **Reference Cost:** `(ref_k_51 × ref_l_12) + (ref_e_51 × ref_l_13) + (ref_k_54 × ref_l_16)`
- **Savings:** Reference Cost - Target Cost (positive = optimization working)

**Field Naming Convention:** ✅ STANDARD
- Target = base fields (`k_51`, `l_12`, `e_51`, `l_13`, `k_54`, `l_16`)
- Reference = `ref_` prefix (`ref_k_51`, `ref_l_12`, `ref_e_51`, `ref_l_13`, `ref_k_54`, `ref_l_16`)

**Critical Implementation Notes:**

1. **Currency Parsing Fix** ⚠️ CRITICAL
   - StateManager stores cost fields with currency formatting: `"$0.1300"`
   - Must strip `$` and commas before `parseFloat()`
   - `getValue()` helper handles this automatically:
     ```javascript
     const cleanVal = typeof val === 'string' ? val.replace(/[$,]/g, '') : val;
     ```

2. **Either/Or Logic Pattern**
   - Electric system: `k_51 > 0`, `e_51 = 0` → Gas cost = 0
   - Gas system: `k_51 = 0`, `e_51 > 0` → Electric cost = 0
   - Formula handles both: `(electric × rate) + (gas × rate)`

3. **ROI Term Multiplier** ✅ IMPLEMENTED
   - User selects term in Settings modal (⚙ button): 1-5, 10, 15, 20, 30, 40, 50 years
   - Stored in `CONFIG.roiTerm` (default: 1 year)
   - Applied in ParallelCoordinates.js table rendering:
     ```javascript
     const annualizedCost = result.cost * roiMultiplier;
     ```
   - Example: $1,667.66/year × 20 years = $33,353.20

4. **Savings Edge Case Handling** ⚠️ STANDARD PATTERN
   - Savings row shows **only positive savings** (when Reference > Target)
   - When Target cost > Reference cost (no savings), display **$0.00**
   - Rationale: Negative savings = cost increase, which shouldn't appear in "Savings" row
   - Edge case: Target has worse performance than Reference (unusual but possible)
   - Standard pattern: `return delta > 0 ? delta : 0;`

5. **DWHR% Special Case** ⚠️ COUNTERINTUITIVE LOGIC
   - **DWHR% represents energy RECOVERY** (higher % = more recovery = better)
   - **Target Cost** = Energy recovered by Target's DWHR system
   - **Reference Cost** = Energy recovered by Reference's DWHR system
   - **Savings** = Target recovery - Reference recovery (REVERSED from normal cost pattern!)
   - Examples:
     - Reference 0%, Target 50% → Savings = $416.91 (Target recovers more)
     - Reference 42%, Target 42% → Savings = $0.00 (same recovery)
     - Reference 50%, Target 0% → Savings = $0.00 (Target is worse, no positive benefit)
     - Reference 30%, Target 50% → Savings = positive (Target recovers more energy)
   - Rationale: Savings shows **additional benefit** when Target has better DWHR than Reference
   - Formula: `return (targetRecovery - refRecovery) > 0 ? (targetRecovery - refRecovery) : 0;`
   - **Important:** This is the OPPOSITE of SHW% (where Reference - Target = savings)

**Completed Tasks:**
- ✅ Created `src/core/pcFinancials.js` with SHW% formula
- ✅ Updated `ParallelCoordinates.js` to conditionally use pcFinancials
- ✅ Added CAD currency formatting (`Intl.NumberFormat`)
- ✅ Added currency parsing fix (strip $ and commas)
- ✅ Tested with real StateManager values (electric & gas scenarios)
- ✅ Implemented ROI Term multiplier with settings modal
- ✅ Renamed ppConfig.js → pcConfig.js for consistency
- ✅ Implemented DWHR% with counterintuitive recovery logic
- [ ] Add remaining 12 axis formulas (formulas to be provided)

---

## ✅ nGains% Formula - IMPLEMENTED (November 24, 2025 - Late Evening)

**Formula: nGains% (Net Useable Internal Gains)**

### What is nGains%?

nGains% represents **internal heat gains** that reduce heating demand:
- Occupants (body heat)
- Appliances (equipment heat)
- Solar gains (passive solar heating through windows)
- Recovered ventilation heat

**The key concept:** These gains are **"free heating"** - energy we DON'T need to buy because it's already present in the building.

**Value in dollars:** The value of `i_80` (avoided heating in thermal kWh) depends on what fuel would have provided that heating.

---

### Implementation Logic

**StateManager Fields:**
- `i_80` / `ref_i_80` = Net useable internal gains (thermal kWh) - avoided heating energy
- `d_114` / `ref_d_114` = Total heating system demand (thermal kWh)
- `f_115` / `ref_f_115` = Oil heating volume (litres) - only populated if oil system
- `h_115` / `ref_h_115` = Gas heating volume (m³) - only populated if gas system
- If both oil and gas are 0 → Electric heating system

**Fuel Rates:**
- `l_12` / `ref_l_12` = Electricity rate ($/kWh)
- `l_13` / `ref_l_13` = Gas rate ($/kWh)
- `l_16` / `ref_l_16` = Oil rate ($/litre)

---

### Cost Calculation (Same Pattern as SHW%)

**No fuel detection needed** - Just sum all three fuel costs. Whichever fuel is 0 contributes $0.

#### For Electric Heating:
```javascript
Cost = i_80 × l_12
```
**Example:** 1,000 kWh × $0.13/kWh = **$130**

#### For Gas Heating:
```javascript
Cost = i_80 × l_13
```
**Example:** 1,000 kWh × $0.075/kWh = **$75**

#### For Oil Heating:
```javascript
Cost = (i_80 / d_114) × f_115 × l_16
```

**Breaking it down:**
1. `d_114` = Total heating demand (thermal kWh)
2. `f_115` = Oil volume used for that heating (litres)
3. `f_115 / d_114` = **Litres of oil per thermal kWh** (conversion ratio)
4. `i_80 × (f_115 / d_114)` = **Litres of oil avoided** by internal gains
5. `Litres avoided × l_16` = **Dollar value** of avoided oil cost

**Example:**
- d_114 = 10,000 kWh total heating demand
- f_115 = 1,000 litres oil consumed
- i_80 = 1,000 kWh avoided by internal gains
- **Ratio** = 1,000 litres / 10,000 kWh = **0.1 litres/kWh**
- **Oil avoided** = 1,000 kWh × 0.1 = **100 litres**
- **Cost** = 100 litres × $1.20/litre = **$120**

---

### Savings Logic (Reversed Pattern)

**IMPORTANT:** nGains% uses the **reversed pattern** (like DWHR%), NOT the standard pattern (like SHW%).

**Why reversed?**
- nGains% represents a **BENEFIT** (avoided heating cost), not a direct cost
- Higher nGains% = MORE benefit = MORE "free heating" = MORE savings
- Lower nGains% = LESS benefit = LESS "free heating" = LESS savings
- Standard pattern would show backwards results (making good performance look bad)

**Formula:**
```javascript
savings = Target - Reference (if positive, otherwise $0)
```

**Examples:**

**Example 1: Target is Better**
- Reference building: 40% nGains = $500 avoided heating cost
- Target building: 50% nGains = $750 avoided heating cost
- **Savings** = $750 - $500 = **$250**
- Target avoids MORE heating cost → Positive savings ✅

**Example 2: Reference is Better**
- Reference building: 50% nGains = $750 avoided heating cost
- Target building: 40% nGains = $500 avoided heating cost
- **Savings** = $500 - $750 = -$250 → **$0**
- Target avoids LESS heating cost → No positive savings (show $0) ✅

**Example 3: Same Performance**
- Reference building: 45% nGains = $600 avoided heating cost
- Target building: 45% nGains = $600 avoided heating cost
- **Savings** = $600 - $600 = **$0**
- Same benefit → No additional savings ✅

---

### Summary: Savings Pattern Classification

| Metric | Type | Savings Pattern | Reason |
|--------|------|----------------|---------|
| **SHW%** | Cost | Reference - Target | Lower energy cost is better |
| **DWHR%** | Benefit | Target - Reference | Higher energy recovery is better |
| **nGains%** | Benefit | Target - Reference | Higher avoided cost is better |

**Rule of thumb:**
- **Costs** (money spent): Standard pattern (Ref - Tar)
  - Lower Target cost = savings
- **Benefits** (money saved): Reversed pattern (Tar - Ref)
  - Higher Target benefit = savings

---

### ✅ CLARIFICATION: nGains% Savings Logic (Nov 24 Late Evening - RESOLVED)

**Initial confusion resolved:** nGains% is **thermal energy only**, not total electrical loads.

**Key insight from Andy:**
> "nGains is dealing with thermal energy. And so it is correct that it can reduce thermal energy required, dependent on fuel type. Just because it is in kWh, increasing usable nGains will never for example, reduce plug loads. So the formula is correct to draw down heating THERMAL energy only, and not net electrical loads."

**What this means:**
- `i_80` represents **thermal kWh** that reduce **heating system demand** only
- Internal gains offset heating fuel consumption (electric, gas, or oil for heating)
- Internal gains do NOT reduce plug loads or other electrical consumption
- The dollar value depends on the **heating fuel cost**, not total electrical cost

**Scenario revisited (now makes sense):**
- Both buildings have **40% nGains** (same percentage)
- Reference building is "lossier" → needs MORE heating → 40% of larger demand = **$31,438.26 avoided heating cost**
- Target building is efficient → needs LESS heating → 40% of smaller demand = **$29,225.29 avoided heating cost**

**Why this is correct:**
- Reference building HAS more heating demand (worse envelope)
- So its internal gains offset MORE heating fuel
- Result: Reference gets MORE dollar value from the same 40% nGains
- This accurately reflects that internal gains have more impact in leaky buildings!

**Savings calculation:**
- Current formula: Target - Reference = $29k - $31k = **-$2k → $0.00 savings**
- This is CORRECT because:
  - When both have same nGains%, there's no additional benefit from optimization
  - The Target's lower heating demand is already captured in other metrics (envelope, TB%, etc.)
  - nGains% savings should show benefit of INCREASING nGains%, not reducing heating demand

**Testing scenarios:**
- Target 50%, Reference 40% → Target avoids MORE from internal gains → Positive savings ✅
- Target 40%, Reference 40% → Same nGains% → $0 savings (correct, as shown above) ✅
- Target 30%, Reference 40% → Target avoids LESS from internal gains → $0 savings ✅

**Current implementation:** ✅ CONFIRMED CORRECT - Using reversed pattern (Target - Reference)

---

## 📝 TB% Formula - READY TO IMPLEMENT

**Formula: TB% (Thermal Bridging Penalty)**

### What is TB%?

TB% represents the **thermal bridging penalty** - additional heat loss through structural elements that bypass insulation:
- Studs, joists, beams (wood or steel framing)
- Window frames, door frames
- Foundation connections
- Balcony connections

**The key concept:** Thermal bridges create "shortcuts" for heat to escape, increasing heating demand beyond what insulation alone would predict.

**Value in dollars:** The value of thermal bridging loss (in kWh) × heating fuel cost.

---

### Implementation Logic

**StateManager Fields:**
- `i_97` / `ref_i_97` = Thermal bridging heat loss (kWh) - energy lost through thermal bridges
- `d_114` / `ref_d_114` = Total heating system demand (thermal kWh)
- `f_115` / `ref_f_115` = Oil heating volume (litres) - only populated if oil system
- `l_12` / `ref_l_12` = Electricity rate ($/kWh)
- `l_13` / `ref_l_13` = Gas rate ($/kWh)
- `l_16` / `ref_l_16` = Oil rate ($/litre)

---

### Cost Calculation (Same Pattern as nGains%)

**Thermal bridging loss is heating COST** (not benefit like nGains%). Lower TB% = less heat loss = better performance.

**Savings calculation:**
```
Savings (kWh) = ref_i_97 - i_97
```
- Reference: i_97 = 1000 kWh lost → Target: i_97 = 500 kWh lost → Savings: 500 kWh avoided loss

**Then convert kWh savings to dollars using heating fuel:**

#### For Electric Heating:
```javascript
Cost = i_97 × l_12
Savings = (ref_i_97 - i_97) × l_12
```
**Example:** (1000 - 500) kWh × $0.13/kWh = **$65 savings**

#### For Gas Heating:
```javascript
Cost = i_97 × l_13
Savings = (ref_i_97 - i_97) × l_13
```
**Example:** (1000 - 500) kWh × $0.075/kWh = **$37.50 savings**

#### For Oil Heating:
```javascript
Cost = (i_97 / d_114) × f_115 × l_16
Savings = ((ref_i_97 - i_97) / d_114) × f_115 × l_16
```

**Breaking it down:**
1. `d_114` = Total heating demand (thermal kWh)
2. `f_115` = Oil volume used for that heating (litres)
3. `f_115 / d_114` = Litres of oil per thermal kWh (conversion ratio)
4. `i_97 × (f_115 / d_114)` = Litres of oil for thermal bridging loss
5. `Litres × l_16` = Dollar cost of thermal bridging

**Example:**
- ref_i_97 = 1,000 kWh bridging loss (Reference)
- i_97 = 500 kWh bridging loss (Target)
- d_114 = 10,000 kWh total heating demand
- f_115 = 1,000 litres oil consumed
- **Ratio** = 1,000 litres / 10,000 kWh = **0.1 litres/kWh**
- **Ref oil for TB** = 1,000 kWh × 0.1 = **100 litres**
- **Target oil for TB** = 500 kWh × 0.1 = **50 litres**
- **Ref Cost** = 100 litres × $1.20/litre = **$120**
- **Target Cost** = 50 litres × $1.20/litre = **$60**
- **Savings** = $120 - $60 = **$60**

---

### Savings Logic (Standard Pattern)

**TB% uses the STANDARD pattern** (like SHW%), NOT reversed (like DWHR% or nGains%).

**Why standard?**
- TB% represents a **COST** (heat loss), not a benefit
- Lower TB% = LESS heat loss = LESS cost = better performance
- Higher TB% = MORE heat loss = MORE cost = worse performance
- This is the same as SHW% - we want lower costs

**Formula:**
```javascript
savings = Reference - Target (if positive, otherwise $0)
```

**Examples:**

**Example 1: Target is Better (Lower TB%)**
- Reference: i_97 = 1000 kWh loss = $130 cost
- Target: i_97 = 500 kWh loss = $65 cost
- **Savings** = $130 - $65 = **$65**
- Target has LESS thermal bridging → Lower cost → Positive savings ✅

**Example 2: Reference is Better (Target has MORE TB%)**
- Reference: i_97 = 500 kWh loss = $65 cost
- Target: i_97 = 1000 kWh loss = $130 cost
- **Savings** = $65 - $130 = -$65 → **$0**
- Target has MORE thermal bridging → Higher cost → No positive savings ✅

**Example 3: Same Performance**
- Reference: i_97 = 750 kWh loss = $97.50 cost
- Target: i_97 = 750 kWh loss = $97.50 cost
- **Savings** = $97.50 - $97.50 = **$0**
- Same thermal bridging → No savings ✅

---

### Summary: Pattern Classification (Updated)

| Metric | Type | Savings Pattern | Reason |
|--------|------|----------------|---------|
| **SHW%** | Cost | Reference - Target | Lower energy cost is better |
| **DWHR%** | Benefit | Target - Reference | Higher energy recovery is better |
| **nGains%** | Benefit | Target - Reference | Higher avoided cost is better |
| **TB%** | Cost | Reference - Target | Lower heat loss is better |

**Rule of thumb:**
- **Costs** (money spent on heating/energy loss): Standard pattern (Ref - Tar)
  - Lower Target cost = savings
- **Benefits** (money saved through efficiency/recovery): Reversed pattern (Tar - Ref)
  - Higher Target benefit = savings

---
- 7 rows total: Target, Reference, Δ, %Δ, Ref Cost, Target Cost, Savings
- Row labels functional and color-coded
- Graph/table alignment fixed with table-layout: fixed
- Vertical space fixed at 550px container height
- **Financial rows showing real calculated costs with ROI multiplier** ✅
- SHW% working for both electric and gas fuel types

**Test Results (November 24, 2025):**
- Electric (Heatpump): Target $1,667.66/yr, Reference $5,558.86/yr, Savings $3,891.20/yr
- Gas (Reference): Target $1,667.66/yr (electric), Reference $3,563.37/yr (gas), Savings $1,895.71/yr

### 🎯 Priority: Data Point Tooltips

**Goal:** Show axis values on hover over data points in the graph

**Implementation:**
- [ ] Add D3 tooltip on hover over data points (circles)
- [ ] Display: Axis label, Target value, Reference value, Delta
- [ ] Style: Floating tooltip following cursor
- [ ] Color-coded: Blue background for Target point, Red for Reference point
- [ ] Example: "SHW%: Target 300.00% | Reference 90.00% | Δ +210.00"

**Rationale:**
- Graph shows visual patterns but exact values require checking table
- Tooltips provide instant value feedback on hover
- Reduces need to look back and forth between graph and table
- Enhances interactivity and user experience

### 🔮 Future Enhancements

- [ ] Test responsive behavior (mobile/tablet)
- [ ] Add hover interactions on lines (show all axis values for that line)
- [ ] Add tooltips for axes (explain parameter impact/cost/calculations)
- [ ] Implement Settings panel functionality (show/hide axes, reorder)
- [ ] Add axis reordering (drag to rearrange)
- [ ] Export functionality for graph (PNG with current settings)

---

## 🎮 INTERACTIVITY - Interactive Node Dragging (Future Feature)

**Vision:** Allow users to click and drag nodes vertically to adjust parameter values in real-time, creating an interactive optimization exploration tool.

### Feature Overview

**The Concept:**
- User clicks on an editable node (e.g., DWHR% efficiency)
- Drags the node up/down along its vertical axis
- Real-time modal shows the new percentage value as they drag
- On release, the system updates StateManager and recalculates all dependent sections
- Graph refreshes to show the impact of the change

**Example Use Case:**
- User drags DWHR% node from 0% to 50%
- Modal shows "DWHR%: 50%" during drag
- On release:
  - Updates `d_52` (Target DWHR%) or `ref_d_52` (Reference DWHR%) in StateManager
  - Triggers Section 7 recalculation
  - Refreshes Section 18 Parallel Coordinates graph
  - Updates all financial rows with new costs

---

### Technical Implementation Plan

#### 1. Visual Design

**Editable vs Non-Editable Nodes:**
- **Editable nodes:** 2× size (radius = 8px instead of 4px)
- **Non-editable nodes:** Normal size (radius = 4px)
- **Visual indicators:**
  - Editable nodes: Glow effect on hover (`filter: drop-shadow(0 0 4px color)`)
  - Cursor changes to `grab` on hover, `grabbing` on drag
  - Slightly transparent when dragging (opacity: 0.7)

**Editable Axes (Initial Set):**
- DWHR% (d_52 / ref_d_52) - Range: 0-70%
- SHW% (conditional field - TBD)
- HEAT% (conditional field - TBD)
- MVHR% (conditional field - TBD)

#### 2. D3.js Drag Behavior

**✅ CRITICAL ARCHITECTURAL REQUIREMENTS:**

1. **1-interval steps**: Values snap to whole numbers (1.00, 2.00, 3.00) matching S07 slider behavior
2. **Both Target and Reference draggable**: Users can adjust parameters in both modes
3. **OnRelease updates only**: Prevents calculation storms from streaming intermediate values
4. **ModeManager integration**: Follows 4012-CHEATSHEET.md refreshUI() → calculateAll() → updateCalculatedDisplayValues() pattern
5. **CSS styling only**: No inline styles - all styling in global styles.css Section 18 block

```javascript
// In ParallelCoordinates.js

/**
 * Configuration for editable axes
 * Each axis defines fields, bounds, step size, and owning section
 */
const editableAxes = {
  'dwhr_efficiency': {
    targetField: 'd_52',        // Target DWHR%
    refField: 'ref_d_52',       // Reference DWHR%
    min: 0,
    max: 70,
    step: 1,                    // ✅ CRITICAL: 1-interval steps (matches S07 behavior)
    unit: '%',
    label: 'DWHR%',
    owningSection: 'sect07'     // Section that owns this parameter
  },
  // Add more editable axes here
};

/**
 * Initialize drag behavior for editable nodes
 * Applies D3 drag handler to nodes where axis is marked editable
 */
function initializeDragBehavior() {
  const drag = d3.drag()
    .on('start', dragStarted)
    .on('drag', dragging)
    .on('end', dragEnded);

  // Apply drag to editable nodes only
  svg.selectAll('.data-point')
    .filter(d => editableAxes[d.axisId])
    .call(drag)
    .classed('pc-editable-node', true);  // ✅ CSS class for styling (2× size, cursor, glow)
}

/**
 * Drag start handler
 * Shows modal and applies dragging visual state
 */
function dragStarted(event, d) {
  d3.select(this)
    .classed('pc-dragging', true);  // ✅ CSS class for dragging state (opacity, cursor)

  showDragModal(d);
}

/**
 * Drag handler (fires continuously during drag)
 * Updates node position and modal display
 * ⚠️ NO STATE UPDATES - only visual feedback
 */
function dragging(event, d) {
  const axisConfig = editableAxes[d.axisId];
  const axisScale = scales[d.axisId]; // Y-scale for this axis

  // Constrain drag to axis bounds
  const newY = Math.max(axisScale.range()[0], Math.min(axisScale.range()[1], event.y));

  // Convert Y position back to value
  let newValue = axisScale.invert(newY);

  // ✅ CRITICAL: Snap to 1-interval steps (like S07 sliders)
  newValue = Math.round(newValue / axisConfig.step) * axisConfig.step;

  // Clamp to min/max
  const clampedValue = Math.max(axisConfig.min, Math.min(axisConfig.max, newValue));

  // Update node position (visual only)
  d3.select(this).attr('cy', axisScale(clampedValue));

  // Update modal display (visual only)
  updateDragModal(axisConfig.label, clampedValue, axisConfig.unit);
}

/**
 * Drag end handler (fires once on mouse release)
 * Updates StateManager and triggers recalculation
 * ✅ CRITICAL: OnRelease update only (no intermediate calculations)
 */
function dragEnded(event, d) {
  d3.select(this)
    .classed('pc-dragging', false);  // ✅ Remove dragging state

  const axisConfig = editableAxes[d.axisId];
  const axisScale = scales[d.axisId];

  // Get final value with 1-interval snapping
  let finalValue = axisScale.invert(event.y);
  finalValue = Math.round(finalValue / axisConfig.step) * axisConfig.step;
  const clampedValue = Math.max(axisConfig.min, Math.min(axisConfig.max, finalValue));

  // ✅ CRITICAL: Update StateManager - listeners handle the rest automatically!
  // StateManager.setValue() triggers registered listeners in owning section:
  //   1. Section's StateManager listener → calculateAll() (both Target & Reference engines)
  //   2. ModeManager.refreshUI() → updates input fields (slider moves to new position)
  //   3. updateCalculatedDisplayValues() → updates DOM with calculated results
  // Example: d_52 change → S07 listener fires → S07.calculateAll() → slider updates
  const fieldId = d.mode === 'target' ? axisConfig.targetField : axisConfig.refField;
  window.TEUI.StateManager.setValue(fieldId, clampedValue, 'user-modified');

  // Refresh S18 Parallel Coordinates to show updated graph
  refresh();

  // Hide modal
  hideDragModal();
}
```

**Key CSS Classes** (defined in `src/styles.css` Section 18 block):

```css
/* Editable nodes - 2× size (8px radius) */
.pc-editable-node {
  r: 8px;
  cursor: grab;
  filter: drop-shadow(0 0 2px rgba(0, 123, 255, 0.5)); /* Subtle glow */
}

.pc-editable-node:hover {
  filter: drop-shadow(0 0 4px rgba(0, 123, 255, 0.8)); /* Stronger glow on hover */
}

/* Dragging state - reduced opacity, grabbing cursor */
.pc-dragging {
  cursor: grabbing !important;
  opacity: 0.7;
}
```

#### 3. Drag Modal Implementation

```javascript
function showDragModal(nodeData) {
  const modal = document.createElement('div');
  modal.id = 'pc-drag-modal';
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 2px solid #0d6efd;
    border-radius: 8px;
    padding: 20px 40px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    z-index: 10000;
    font-size: 24px;
    font-weight: bold;
    color: #0d6efd;
    pointer-events: none;
  `;
  document.body.appendChild(modal);
}

function updateDragModal(label, value, unit) {
  const modal = document.getElementById('pc-drag-modal');
  if (modal) {
    modal.textContent = `${label}: ${value.toFixed(1)}${unit}`;
  }
}

function hideDragModal() {
  const modal = document.getElementById('pc-drag-modal');
  if (modal) {
    modal.remove();
  }
}
```

#### 4. Recalculation Flow (Pattern A Direct Call)

**🔧 CORRECT ARCHITECTURE**: StateManager + Direct calculateAll() Call

Per 4012-CHEATSHEET.md, sections **do not listen to their own fields** - they only listen to external dependencies. Therefore, when S18 modifies a field owned by another section, we must:

1. Update StateManager (triggers downstream dependencies)
2. Directly call the owning section's `calculateAll()` (required for Pattern A compliance)

```javascript
// ✅ CORRECT PATTERN (Pattern A compliant):
function dragEnded(event, d) {
  const fieldId = d.mode === 'target' ? axisConfig.targetField : axisConfig.refField;

  // 1. Update StateManager (triggers downstream dependencies)
  window.TEUI.StateManager.setValue(fieldId, clampedValue, 'user-modified');

  // 2. Directly call owning section's calculateAll() (Pattern A compliant)
  const owningSection = window.TEUI.SectionModules[axisConfig.owningSection];
  owningSection.calculateAll();

  // 3. Refresh S18
  refresh();
}
```

**Why Direct Call is Required:**

**Sections only register StateManager listeners for EXTERNAL dependencies:**
```javascript
// In Section07.js initialization:
window.TEUI.StateManager.addListener('d_63', calculateAll);    // ✅ External: Occupancy
window.TEUI.StateManager.addListener('l_30', calculateAll);    // ✅ External: Oil emissions
// ❌ NO LISTENER for d_53 (DWHR%) - it's owned by S07, not external!
```

**Why?** Per 4012-CHEATSHEET.md Pattern A:
- Sections manage their own fields directly through user input handlers
- Sections don't need listeners for their own fields (would cause double calculation)
- External modifications (like S18's drag) must call `calculateAll()` explicitly

**Flow (with automatic mode switching):**

1. **User drags blue Target DWHR% node to 50% in S18**
2. **S18**: `ModeManager.switchMode('target')` → Switches S07 to Target mode
3. **S18**: `TargetState.setValue('d_53', 50)` → Updates S07's Target state
4. **S18**: `StateManager.setValue('d_53', 50)` → Triggers downstream dependencies
5. **S18**: `calculateAll()` → Recalculates S07 (both engines)
6. **S07**: `ModeManager.refreshUI()` → Slider moves to 50% in Target mode
7. **S18**: `refresh()` → Graph redraws with new values

**Mode Switching Behavior:**
- Drag **blue node** → Section switches to **Target mode**
- Drag **red node** → Section switches to **Reference mode**
- This provides clear visual feedback about which model is being adjusted

**Benefits:**
- ✅ Pattern A compliant (direct state access)
- ✅ Automatic mode switching (user sees what they're editing)
- ✅ Works for both Target and Reference parameters
- ✅ Explicit and predictable (no hidden dependencies)

#### 5. Integration with Existing Systems

**🎛️ S18 as a "Remote Control" for Other Sections**

Interactive node dragging in S18 is essentially a **remote control** for parameters owned by other sections. S18 doesn't directly modify parameters—it publishes changes to StateManager, and the owning section responds automatically.

```
┌─────────────────────────────────────────────────────────┐
│  SECTION 18 (Parallel Coordinates)                      │
│                                                         │
│  User drags DWHR% node ────┐                            │
│                             │                           │
│  dragEnded():               │                           │
│    setValue('d_53', 50) ────┼──→ StateManager           │
│    refresh()                │         ↓                 │
└─────────────────────────────┼─────────┼─────────────────┘
                              │         │
                              │    Publishes to listeners
                              │         ↓
┌─────────────────────────────┼─────────┼─────────────────┐
│  SECTION 7 (Water Use)      │         │                 │
│                              │        │                 │
│  Listener registered: ←──────┘        │                 │
│    d_53 → calculateAll()              │                 │
│         → refreshUI()                 │                 │
│         → slider moves to 50% ←───────┘                 │
│                                                         │
│  ┌──────────────────────┐                               │
│  │  DWHR%: [====○----]  │ ← Slider updates              │
│  │         50%          │                               │
│  └──────────────────────┘                               │
└─────────────────────────────────────────────────────────┘
```

**What S18 doesn't need to know:**
- ❌ How S07 is structured
- ❌ Where the slider is located
- ❌ What S07's `calculateAll()` does
- ❌ What other sections depend on `d_52`

**What S07 doesn't need to know:**
- ❌ That S18 exists
- ❌ Whether the change came from:
  - Its own slider
  - S18's drag interaction
  - ReferenceValues.js overlay setting
  - Imported file value
  - Any other source
- ❌ That it's being "remote controlled"

**Result:** Clean, decoupled pub/sub messaging through StateManager. S18 is just another publisher, S07 is just a subscriber. ✅

---

**StateManager Integration:**
- ✅ Use existing `setValue()` - automatically triggers registered listeners
- ✅ No manual section lookups or calls needed
- ✅ Works for both Target (`d_52`) and Reference (`ref_d_52`) fields

**Section 7 Integration (Example):**
- ✅ S07 already has StateManager listener for `d_52` registered
- ✅ Listener automatically calls `calculateAll()` when value changes
- ✅ Slider updates automatically via `ModeManager.refreshUI()`
- ✅ No additional code needed in S07!

**Validation:**
- ✅ Drag constrained to axis Y-bounds (can't go off-screen)
- ✅ Values clamped to min/max per axis config (0-70 for DWHR%)
- ✅ 1-interval snapping prevents fractional values
- ✅ Invalid states prevented by design (no negative percentages possible)

#### 6. User Experience Enhancements

**Before Drag:**
- Tooltip on hover: "Click and drag to adjust DWHR%"
- Editable nodes glow on hover

**During Drag:**
- Large modal shows current value
- Node follows mouse vertically (constrained to axis)
- Line connecting to node updates in real-time
- Opacity reduces to show it's being edited

**After Release:**
- Node snaps to final position
- Modal fades out
- Success notification: "DWHR% updated to 50%"
- All affected values recalculate and update

**Undo/Redo (Optional):**
- Store previous value before drag
- Provide "Undo" button in notification
- Could integrate with browser history API

#### 7. Performance Considerations

**Optimization Strategies:**
- Throttle drag events (update every 50ms, not every frame)
- Debounce final recalculation (wait 200ms after release)
- Cache scale functions to avoid recalculation
- Only refresh affected sections, not entire DOM

**Large Datasets:**
- For complex calculations, show loading spinner during recalculation
- Consider web workers for heavy computation
- Progressive rendering if needed

---

### Implementation Phases

**Phase 1: Proof of Concept (Single Axis)**
1. ✅ Identify DWHR% as first editable axis
2. [ ] Add drag behavior to DWHR% nodes only
3. [ ] Implement basic modal showing value during drag
4. [ ] Update StateManager on release
5. [ ] Trigger Section 7 recalculation
6. [ ] Verify slider updates correctly

**Phase 2: Multi-Axis Support**
1. [ ] Define `editableAxes` configuration object
2. [ ] Apply drag to all editable axes
3. [ ] Visual distinction (2× size) for editable nodes
4. [ ] Test with multiple efficiency axes (DWHR%, HEAT%, MVHR%)

**Phase 3: Polish & UX**
1. [ ] Add glow effect on hover
2. [ ] Smooth animations (node movement, modal fade)
3. [ ] Success notifications
4. [ ] Error handling (invalid values, failed calculations)
5. [ ] Loading states for slow recalculations

**Phase 4: Advanced Features**
1. [ ] Undo/redo functionality
2. [ ] Keyboard support (arrow keys to adjust)
3. [ ] Snap-to-grid option (5% increments)
4. [ ] Batch updates (drag multiple nodes, apply all at once)

---

### Configuration Template

**Adding a New Editable Axis:**

```javascript
// In pcConfig.js or ParallelCoordinates.js

const editableAxes = {
  'axis_id': {
    targetField: 'field_id',      // StateManager field for Target
    refField: 'ref_field_id',     // StateManager field for Reference
    min: 0,                       // Minimum allowed value
    max: 100,                     // Maximum allowed value
    step: 1,                      // Optional: snap increment (e.g., 5% steps)
    unit: '%',                    // Display unit
    label: 'Axis Label',          // Display name
    owningSection: 'sect07',      // Section to recalculate
    validation: (val) => val >= 0 && val <= 100  // Optional custom validation
  }
};
```

---

### Testing Checklist

- [ ] Drag constrained to axis bounds (doesn't go off-screen)
- [ ] Values clamp to min/max correctly
- [ ] Modal updates smoothly during drag
- [ ] StateManager updates on release
- [ ] Section 7 recalculates correctly
- [ ] S18 graph refreshes with new values
- [ ] Financial costs update accordingly
- [ ] Works for both Target and Reference nodes
- [ ] Handles rapid dragging without lag
- [ ] Multiple consecutive drags work correctly
- [ ] Browser console shows no errors
- [ ] Mobile/touch support (if applicable)

---

### Open Questions

1. **Which axes should be editable initially?**
   - DWHR% ✅ confirmed
   - SHW%, HEAT%, MVHR%? (conditional axes - need field mapping)
   - Envelope parameters (Ag, Ae)? (may be calculated, not direct inputs)

2. ~~**Should Reference nodes be draggable?**~~ ✅ RESOLVED
   - **Decision:** YES - Both Target and Reference nodes draggable
   - Allows users to adjust baseline/code requirements for comparison
   - ModeManager/StateManager handles ref_ prefix automatically

3. ~~**Real-time vs On-Release updates?**~~ ✅ RESOLVED
   - **Decision:** On-release with live modal preview
   - OnRelease prevents calculation storms from streaming intermediate values
   - Modal shows value during drag for immediate visual feedback
   - Recalculation only triggers once on mouse release

4. ~~**Step size for dragging?**~~ ✅ RESOLVED
   - **Decision:** 1-interval steps (1.00, 2.00, 3.00)
   - Matches Section 7 slider behavior for consistency
   - Implemented via `Math.round(value / step) * step` snapping

5. **Undo functionality priority?**
   - High value for users exploring scenarios
   - Could be Phase 2 or 4 feature

---

### Benefits of This Feature

✅ **Interactive Exploration:** Users can instantly see impact of parameter changes
✅ **Visual Feedback:** Graph updates in real-time show optimization paths
✅ **Scenario Testing:** Quickly test "what-if" scenarios without navigating away
✅ **Intuitive Interface:** Dragging is more natural than typing numbers
✅ **Educational:** Helps users understand parameter relationships
✅ **Pro Version Differentiator:** Advanced interactive feature for paid tier

---

**This feature would be PHENOMENAL for user engagement and making optimization tangible!** 🚀

---

## 📋 DEVELOPER HANDOFF GUIDE - Adding New Editable Axes

**Purpose:** This guide enables a developer with NO conversation history or prior context to implement additional interactive node dragging axes following the proven DWHR% pattern.

**Status:** DWHR% interactive dragging is COMPLETE and merged to S18-19-PARALLEL-COORDINATES branch (commit 3f11fe5).

**Reference Implementation:** See [ParallelCoordinates.js:941-1165](../src/core/ParallelCoordinates.js#L941-L1165) for complete working code.

---

### Quick Reference: Axes to Implement

| Axis ID | Label | Section | Field ID | Min | Max | Step | Unit | Status |
|---------|-------|---------|----------|-----|-----|------|------|--------|
| `dwhr_efficiency` | DWHR | S07 | `d_53` | 0 | 80 | 1 | % | ✅ DONE |
| `shw_efficiency` | SHW | S07 | `d_52` | 50* | 300* | 1 | % | ⏳ TODO |
| `thermal_bridge` | TB | S11 | `d_97` | 5 | 95 | 1 | % | ⏳ TODO |
| `heating_efficiency` | HEAT | S13 | `f_113` | TBD | TBD | TBD | COP | ⏳ TODO |
| `mvhr_efficiency` | MVHR | S13 | `d_118` | 0 | 100 | 1 | % | ⏳ TODO |

*SHW% range varies by system type: Gas/Oil = 50-100%, Heatpump = 50-300%

---

### Step-by-Step Implementation Process

#### Step 1: Identify Field Details

Before coding, gather these details from the owning section's code:

1. **Field ID:** The exact StateManager field name (e.g., `d_53`)
2. **Owning Section:** Which section module owns this field (e.g., `sect07`)
3. **Range:** Minimum and maximum values (check slider config or field definition)
4. **Step Size:** Increment size for snapping (typically 1 for percentages)
5. **Unit:** Display unit (%, COP, etc.)
6. **Label:** Short display name (e.g., "DWHR" not "DWHR%" - value shows %)

**Where to Find This Info:**
- Open `/src/sections/Section##.js` where ## is the section number
- Search for `fieldId: "field_id"` to find the field definition
- Look for slider configuration or field schema for min/max/step
- Check `type: "percentage"` or `type: "editable"` declarations

**Example from Section07.js (DWHR%):**
```javascript
// Line 709 in Section07.js
d: {
  fieldId: "d_53",
  type: "percentage",
  value: "0",
  min: 0,
  max: 80,  // From pcConfig.js domain
  step: 1,
  // ...
}
```

---

#### Step 2: Add Configuration to EDITABLE_AXES

**File:** `/src/core/ParallelCoordinates.js`
**Location:** Lines 949-960 (inside INTERACTIVITY section)

**Add your new axis to the `EDITABLE_AXES` object:**

```javascript
const EDITABLE_AXES = {
  'dwhr_efficiency': {
    targetField: 'd_53',
    refField: 'ref_d_53',
    min: 0,
    max: 80,
    step: 1,
    unit: '%',
    label: 'DWHR',
    owningSection: 'sect07'
  },

  // 👇 ADD YOUR NEW AXIS HERE:
  'your_axis_id': {  // Must match axisId from pcConfig.js
    targetField: 'field_id',      // e.g., 'd_52'
    refField: 'ref_field_id',     // e.g., 'ref_d_52'
    min: 0,                       // From section field config
    max: 100,                     // From section field config
    step: 1,                      // Snapping increment (1 for whole numbers)
    unit: '%',                    // Display unit
    label: 'Display Name',        // Short label (strip % if in unit)
    owningSection: 'sect##'       // e.g., 'sect07', 'sect11', 'sect13'
  }
};
```

**Critical Notes:**
- `axisId` (object key) **must** match the axis ID used in `pcConfig.js`
- `targetField` is the **base** field ID (no `ref_` prefix)
- `refField` is the **same** field with `ref_` prefix
- `label` should be SHORT - the value already includes the unit (e.g., "45%")
- `owningSection` must match the module name in `window.TEUI.SectionModules`

---

#### Step 3: Field Mapping Reference

**Here's the complete field mapping for planned axes:**

##### SHW% (Service Hot Water Efficiency) - Section 07 ⚠️ CONDITIONAL AXIS

**⚠️ ADVANCED PATTERN: This axis has conditional configuration based on system type.**

SHW% behavior depends on the value of `d_51` (DHW/SHW System Type):

| System Type (d_51) | Field to Update | Storage Range | Display Range | Format | Unit |
|--------------------|----------------|---------------|---------------|--------|------|
| `Heatpump` | `d_52` | 100-450 | 100-450 | Integer | % |
| `Electric` | `d_52` | 90-100 | 90-100 | Integer | % |
| `Gas` | `k_52` | 0.50-0.98 | **50-98** | Decimal | % |
| `Oil` | `k_52` | 0.50-0.98 | **50-98** | Decimal | % |

**Note:** Gas/Oil storage uses decimals (0.90) but graph displays as percentages (90%). pcConfig multiplies by 100 for display, dragEnded divides by 100 for storage.

**Implementation Requirements:**

1. **Dynamic Configuration Function:**
   - Read `d_51` (or `ref_d_51` for Reference mode) to determine system type
   - Return appropriate config object with correct field, min, max, step

2. **State Manager Listener:**
   - Register listener for `d_51` changes
   - When system type changes, update axis configuration
   - Refresh graph to show new axis range

3. **Value Format Handling:**
   - `d_52` (Electric/Heatpump): Store as integer percentage (100, 200, 300)
   - `k_52` (Gas/Oil): Store as decimal (0.90, 0.95, 0.98)
   - Modal display must handle both formats

**Example Configuration:**
```javascript
'shw_efficiency': {
  // This function is called dynamically to get current config
  getConfig: (mode) => {
    const systemTypeField = mode === 'target' ? 'd_51' : 'ref_d_51';
    const systemType = window.TEUI?.StateManager?.getValue(systemTypeField) || 'Heatpump';

    if (systemType === 'Heatpump') {
      return {
        targetField: 'd_52',
        refField: 'ref_d_52',
        min: 100,
        max: 450,
        step: 1,
        unit: '%',
        label: 'SHW',
        owningSection: 'sect07',
        systemType: 'Heatpump'
      };
    } else if (systemType === 'Electric') {
      return {
        targetField: 'd_52',
        refField: 'ref_d_52',
        min: 90,
        max: 100,
        step: 1,
        unit: '%',
        label: 'SHW',
        owningSection: 'sect07',
        systemType: 'Electric'
      };
    } else { // Gas or Oil
      return {
        targetField: 'k_52',
        refField: 'ref_k_52',
        min: 50,   // Display space (pcConfig multiplies by 100)
        max: 98,   // Display space
        step: 1,   // 1% increments in display space
        unit: '%',
        label: 'SHW AFUE',
        owningSection: 'sect07',
        isDecimal: true,  // Flag that storage is decimal
        storageMultiplier: 0.01  // Convert display (90) → storage (0.90)
      };
    }
  },

  // Dependency field that triggers config updates
  dependsOn: 'd_51',

  owningSection: 'sect07'
}
```

**Actual Implementation (No Listeners Needed!):**

The axis domain is calculated **once per render** by reading both `d_51` and `ref_d_51` from StateManager. No listeners are needed because:
1. Graph refreshes when data changes (via refresh button or section updates)
2. `getDomain()` reads current state at render time
3. Domain is fixed for the render cycle (doesn't change during drags)

**⚠️ CRITICAL: Display Space vs Storage Space**

Gas/Oil AFUE values are stored as **decimals** (0.90) in `k_52` but displayed as **percentages** (90%) in the graph. This is handled by:
1. **pcConfig.js** multiplies by 100 when reading (0.90 → 90 for display)
2. **getDomain()** returns display range (50-98, not 0.50-0.98)
3. **getConfig()** uses display constraints (50-98, step=1, unit='%')
4. **dragEnded()** applies `storageMultiplier` (0.01) to convert back (90 → 0.90 for storage)

```javascript
getDomain: function() {
  // Read BOTH Target and Reference system types
  const targetSystem = window.TEUI?.StateManager?.getValue('d_51') || 'Heatpump';
  const refSystem = window.TEUI?.StateManager?.getValue('ref_d_51') || 'Heatpump';

  // Check if either uses Gas/Oil (k_52 decimal field)
  const hasGasOil = (targetSystem === 'Gas' || targetSystem === 'Oil' ||
                    refSystem === 'Gas' || refSystem === 'Oil');

  if (hasGasOil) {
    // Return DISPLAY range (pcConfig multiplies k_52 by 100)
    // k_52 = 0.90 → displayed as 90
    return { min: 50, max: 98 };
  } else {
    // Otherwise both use d_52 percentage field
    // Union of Electric (90-100) and Heatpump (100-450) = 90-450
    return { min: 90, max: 450 };
  }
}
```

**Graph Rendering Integration:**
```javascript
// In yScales calculation (line 492-497)
if (axisConfig && typeof axisConfig.getDomain === 'function') {
  // Use conditional domain function for axes like SHW%
  const conditionalDomain = axisConfig.getDomain();
  domainMin = conditionalDomain.min;
  domainMax = conditionalDomain.max;
  // Domain is now FIXED for this render cycle
}
```

**Complete Gas/Oil Data Flow:**

```
STORAGE → DISPLAY → USER DRAG → STORAGE
(k_52)    (graph)    (modal)     (k_52)

0.90   →    90     →    90     →   0.90
  ↓          ↓          ↓          ↓
Read    × 100     Display    × 0.01
(pcConfig) (getDomain) (getConfig) (dragEnded)
```

**Step-by-Step Example (Gas system with 90% AFUE):**

1. **Storage:** k_52 = "0.90" (decimal string)
2. **pcConfig reads:** parseFloat("0.90") × 100 = 90
3. **Graph renders:** Axis domain [50, 98], node at y-position for 90
4. **User drags:** Node to new position, reads as 85 (display space)
5. **dragEnded converts:** 85 × 0.01 = 0.85 (storage space)
6. **Writes back:** k_52 = "0.85" (decimal string)
7. **Next render:** pcConfig reads 0.85 × 100 = 85 (display space)

**Result:** Axis stays stable at 50-98% for Gas/Oil (or 90-450% for Electric/Heatpump) regardless of node dragging.

##### nGains% (Net Useable Internal Gains) - Section 10 ⚠️ DISCRETE DROPDOWN PATTERN

**⚠️ ADVANCED PATTERN: This axis uses discrete dropdown values, not a continuous slider.**

Unlike other axes (sliders with continuous values), nGains% is controlled by a **dropdown** (d_80) that maps to specific percentage values. The calculated percentage appears in g_80.

| Dropdown Value (d_80) | Display Value (g_80) | Graph Position |
|----------------------|---------------------|----------------|
| `"NRC 0%"` | 0.00% | 0% on axis |
| `"NRC 40%"` | 40.00% | 40% on axis |
| `"NRC 50%"` | 50.00% | 50% on axis |
| `"NRC 60%"` | 60.00% | 60% on axis |
| `"PH Method"` | **94.43%** (calculated) | 94.43% on axis |

**Implementation Requirements:**

1. **Discrete Value Mapping:**
   - Dragging to 0-20% → Set d_80 = "NRC 0%"
   - Dragging to 21-45% → Set d_80 = "NRC 40%"
   - Dragging to 46-55% → Set d_80 = "NRC 50%"
   - Dragging to 56-60% → Set d_80 = "NRC 60%"
   - Dragging to 61-100% → Set d_80 = "PH Method"

2. **Display Value Reading:**
   - For NRC methods: Read g_80 (always matches dropdown percentage)
   - For PHPP method: Read g_80 (calculated by Section 10, typically 90-100%)

3. **Snap Behavior:**
   - Modal shows nearest snap point during drag
   - On release, sets dropdown to corresponding string value
   - Section 10 recalculates → g_80 updates automatically

**Example Configuration:**
```javascript
'net_gains': {
  targetField: 'd_80',      // Dropdown field (not a slider!)
  refField: 'ref_d_80',
  min: 0,
  max: 100,
  step: 10,                 // Snap to nearest option
  unit: '%',
  label: 'nGains',
  owningSection: 'sect10',
  isDiscrete: true,         // Flag for discrete value mapping
  valueMap: {               // Maps display % to dropdown string
    0: 'NRC 0%',
    40: 'NRC 40%',
    50: 'NRC 50%',
    60: 'NRC 60%',
    70: 'PH Method'         // 70-100% all map to PHPP
  },
  displayField: 'g_80'      // Field to read for actual display value
}
```

**Data Flow:**

**Reading for Display (pcConfig.js):**
```javascript
// Map dropdown string to display percentage
const dropdownValue = StateManager.getValue('d_80'); // e.g., "NRC 40%"
if (dropdownValue === 'NRC 0%') return 0;
if (dropdownValue === 'NRC 40%') return 40;
if (dropdownValue === 'NRC 50%') return 50;
if (dropdownValue === 'NRC 60%') return 60;
if (dropdownValue === 'PH Method') {
  // Read calculated value from g_80
  const calculated = StateManager.getValue('g_80'); // e.g., "94.43"
  return parseFloat(calculated); // 94.43
}
```

**Writing from Drag (dragEnded):**
```javascript
// Round dragged value to nearest snap point
let snappedValue;
if (clampedValue < 20) snappedValue = 0;
else if (clampedValue < 45) snappedValue = 40;
else if (clampedValue < 55) snappedValue = 50;
else if (clampedValue < 60) snappedValue = 60;
else snappedValue = 70; // Triggers PHPP

// Map snapped value to dropdown string
const dropdownString = axisConfig.valueMap[snappedValue]; // e.g., "NRC 40%"

// Write dropdown string to d_80
StateManager.setValue('d_80', dropdownString, 'user-modified');

// Section 10 recalculates → g_80 updates automatically
// Next graph refresh reads new g_80 value
```

**Why This Pattern?**

Section 10 doesn't have a continuous nGains% slider - it uses a **method selection dropdown**:
- NRC methods (0%, 40%, 50%, 60%) are predefined percentages
- PHPP method calculates percentage dynamically based on building parameters
- Users can't set arbitrary percentages like 47% or 83% - only discrete options

The graph interaction must respect this constraint while providing intuitive dragging UX.

##### TB% (Thermal Bridging Penalty) - Section 11 ✅ IMPLEMENTED

**Implementation Date:** November 25, 2025

```javascript
'thermal_bridge': {
  targetField: 'd_97',
  refField: 'ref_d_97',
  min: 5,                   // Minimum 5% (Section 11 slider min)
  max: 100,
  step: 5,                  // 5% intervals (5, 10, 15, 20, ..., 100)
  unit: '%',
  label: 'TB',
  owningSection: 'sect11'
}
```

**Storage Format:**
- **Section 11 slider** stores d_97 as **percentage string** ("5", "10", "20", etc.)
- Similar to DWHR% pattern - no decimal conversion needed
- ⚠️ **Important:** Section 11 has TWO input handlers:
  - **Slider handler** (lines 3045-3092): Stores as percentage string ("20")
  - **Text input handler** (lines 2976-3015): Stores as decimal ("0.20")
  - Our dragging mimics **slider behavior** → use percentage string

**Interactive Behavior:**
- Snaps to 5% intervals during drag (5, 10, 15, 20, 25, ...)
- Lower TB% = less thermal bridging = better performance
- Modal shows red for Reference, blue for Target
- Graph updates immediately on drag; section recalculates on release

**Pattern A Flow:**
1. User drags TB% node to 25%
2. `dragEnded()` switches Section 11 to correct mode (Target/Reference)
3. Updates TargetState or ReferenceState with d_97 = "25"
4. Updates StateManager with d_97 or ref_d_97 = "25"
5. Calls `sect11.calculateAll()` to recalculate heat loss
6. Calls `sect11.ModeManager.refreshUI()` to update slider position
7. Section 11 slider moves to 25%, thermal bridging loss recalculates

**Note:** Lower TB% is better (less heat loss). Savings calculation already handles this correctly in pcFinancials.js.

##### HEAT% (Heating System Efficiency) - Section 13
```javascript
'heating_efficiency': {
  targetField: 'f_113',     // Heating System COP
  refField: 'ref_f_113',
  min: 0.8,                 // Typical minimum for heat pumps
  max: 10.0,                // High-efficiency heat pump max
  step: 0.1,                // Decimal precision for COP
  unit: '',                 // COP is unitless
  label: 'HEAT COP',
  owningSection: 'sect13'
}
```

**Note:** HEAT uses COP (Coefficient of Performance), not percentage. Range 0.8-10.0 with 0.1 step increments.

##### MVHR% (Mechanical Ventilation Heat Recovery) - Section 13
```javascript
'mvhr_efficiency': {
  targetField: 'd_118',     // HRV/ERV/MVHR Efficiency (SRE)
  refField: 'ref_d_118',
  min: 0,
  max: 100,
  step: 1,
  unit: '%',
  label: 'MVHR',
  owningSection: 'sect13'
}
```

**Note:** Section 13 calls this "SRE" (Sensible Recovery Efficiency) internally, but user-facing label is MVHR%.

---

#### Step 4: Verify CSS Styling

**No changes needed!** The existing CSS classes in `/src/styles.css` (lines 1923-1965) automatically apply to all editable nodes.

**Just verify these classes exist:**
```css
/* Editable node styling with hover effects */
.pc-editable-node {
  cursor: grab;
  transition: filter 0.2s ease;
}

.pc-editable-node:hover {
  filter: drop-shadow(0 0 4px rgba(13, 110, 253, 0.8));
}

/* Dragging state styling */
.pc-dragging {
  cursor: grabbing !important;
  opacity: 0.7;
  filter: drop-shadow(0 0 6px rgba(13, 110, 253, 1));
}

/* Modal color variants */
#pc-drag-modal[data-mode="target"] {
  border: 2px solid #0d6efd;
  color: #0d6efd;
}

#pc-drag-modal[data-mode="reference"] {
  border: 2px solid #dc3545;
  color: #dc3545;
}
```

---

#### Step 5: Test Your Implementation

**Testing Checklist:**

1. **Visual Tests:**
   - [ ] Node is 2× normal size (editable indicator)
   - [ ] Node glows blue on hover
   - [ ] Cursor changes to `grab` on hover
   - [ ] Cursor changes to `grabbing` during drag
   - [ ] Node becomes semi-transparent (opacity: 0.7) when dragging

2. **Drag Behavior Tests:**
   - [ ] Modal appears when drag starts
   - [ ] Modal shows correct label and value during drag
   - [ ] Modal color: Blue for Target node, Red for Reference node
   - [ ] Node position follows mouse vertically (constrained to axis)
   - [ ] Values snap to whole numbers (or step size) during drag
   - [ ] Modal disappears when drag ends

3. **State Update Tests (Target Mode):**
   - [ ] Drag blue Target node to new value
   - [ ] Owning section switches to **Target mode** automatically
   - [ ] Owning section's slider moves to new position
   - [ ] StateManager updates with correct field ID (no `ref_` prefix)
   - [ ] Section's `calculateAll()` runs automatically
   - [ ] Section's DOM updates with new calculated values
   - [ ] S18 graph refreshes with new node position

4. **State Update Tests (Reference Mode):**
   - [ ] Drag red Reference node to new value
   - [ ] Owning section switches to **Reference mode** automatically
   - [ ] Owning section's slider moves to new position
   - [ ] StateManager updates with correct field ID (`ref_` prefix)
   - [ ] Section's `calculateAll()` runs automatically
   - [ ] Section's DOM updates with new calculated values
   - [ ] S18 graph refreshes with new node position

5. **Edge Case Tests:**
   - [ ] Drag to minimum value (0% or field min) - works correctly
   - [ ] Drag to maximum value (80% or field max) - works correctly
   - [ ] Rapid consecutive drags - no lag or errors
   - [ ] Drag beyond axis bounds - values clamp correctly
   - [ ] Browser console shows no errors
   - [ ] Financial costs update in S18 table (if applicable)

6. **Cross-Section Tests:**
   - [ ] Make change in owning section slider → S18 updates
   - [ ] Make change in S18 drag → owning section updates
   - [ ] Both directions work for Target values
   - [ ] Both directions work for Reference values
   - [ ] No double-calculation or infinite loops

---

#### Step 6: Common Pitfalls and Solutions

**Pitfall 1: Wrong Field ID**
- ❌ **Symptom:** Slider doesn't move after drag
- ✅ **Solution:** Verify `targetField` matches **exact** field ID from section's field schema
- 🔍 **Debug:** Search section file for `fieldId: "your_field"` to confirm

**Example Error:**
```javascript
// ❌ WRONG - using display label
targetField: 'DWHR%',

// ✅ CORRECT - using actual field ID
targetField: 'd_53',
```

**Pitfall 2: Forgot ref_ Prefix**
- ❌ **Symptom:** Reference node drag doesn't work
- ✅ **Solution:** Ensure `refField` has `ref_` prefix
- 🔍 **Debug:** Check StateManager - Reference fields always stored with `ref_` prefix

**Example Error:**
```javascript
// ❌ WRONG - missing ref_ prefix
refField: 'd_53',

// ✅ CORRECT - includes ref_ prefix
refField: 'ref_d_53',
```

**Pitfall 3: Wrong owningSection**
- ❌ **Symptom:** `calculateAll()` not found error in console
- ✅ **Solution:** Verify section module name matches `window.TEUI.SectionModules` key
- 🔍 **Debug:** Open browser console, type `Object.keys(window.TEUI.SectionModules)` to see valid names

**Example Error:**
```javascript
// ❌ WRONG - incorrect module name
owningSection: 'section07',  // "section" not "sect"

// ✅ CORRECT - matches module registration
owningSection: 'sect07',
```

**Pitfall 4: axisId Mismatch**
- ❌ **Symptom:** Node not editable (no hover glow, no drag)
- ✅ **Solution:** Ensure `EDITABLE_AXES` key matches `axisId` from `pcConfig.js`
- 🔍 **Debug:** Search pcConfig.js for axis definition, copy exact ID

**Example Error:**
```javascript
// In pcConfig.js:
{ id: 'dwhr_efficiency', label: 'DWHR%', ... }

// ❌ WRONG - ID doesn't match
const EDITABLE_AXES = {
  'dwhr': { ... }  // Won't match!
};

// ✅ CORRECT - exact match
const EDITABLE_AXES = {
  'dwhr_efficiency': { ... }
};
```

**Pitfall 5: Mode Not Switching**
- ❌ **Symptom:** Drag works but section shows wrong mode
- ✅ **Solution:** This is handled automatically in `dragEnded()` - no action needed
- 🔍 **Debug:** Check lines 2124-2134 in S18-OPTIMIZE.md for mode switching flow

**Pitfall 6: Label Shows Duplicate %**
- ❌ **Symptom:** Modal shows "DWHR%: 45%" (% appears twice)
- ✅ **Solution:** Strip % from label - the value already includes it
- 🔍 **Debug:** Check line 1148 in ParallelCoordinates.js

**Example Error:**
```javascript
// ❌ WRONG - % in label
label: 'DWHR%',  // Results in "DWHR%: 45%"

// ✅ CORRECT - no % in label
label: 'DWHR',   // Results in "DWHR: 45%"
```

---

### Architecture Deep Dive

**Why This Works: Pattern A Direct State Access**

The interactive dragging uses **Pattern A** from 4012-CHEATSHEET.md. Here's why sections don't listen to their own fields:

```javascript
// ❌ ANTI-PATTERN: Sections listening to their own fields
// In Section07.js initialization:
StateManager.addListener('d_53', calculateAll);  // DON'T DO THIS!
// Why? User drags slider → setValue('d_53') → listener fires → calculateAll()
// Result: Calculation happens TWICE (once in slider handler, once in listener)
```

**Instead, Pattern A uses:**
1. **Internal field changes:** Handled directly by user input handlers (no listener)
2. **External field changes:** Require explicit method calls from external code

**This is why S18's `dragEnded()` must:**
1. Switch owning section to correct mode
2. Update appropriate state (TargetState or ReferenceState)
3. Update StateManager (for downstream dependencies)
4. Call `calculateAll()` explicitly
5. Call `refreshUI()` to update DOM

**Complete Flow Diagram:**

```
User drags DWHR% node to 50% in S18
         ↓
[dragEnded() in ParallelCoordinates.js]
         ↓
   ┌────────────────────────────────────┐
   │ 1. Switch S07 to Target mode       │
   │    ModeManager.switchMode('target')│
   └────────────────────────────────────┘
         ↓
   ┌────────────────────────────────────┐
   │ 2. Update S07's Target state       │
   │    TargetState.setValue('d_53', 50)│
   └────────────────────────────────────┘
         ↓
   ┌────────────────────────────────────┐
   │ 3. Update StateManager             │
   │    StateManager.setValue('d_53',50)│  ←─ Triggers downstream listeners
   └────────────────────────────────────┘      (e.g., S18, S14, etc.)
         ↓
   ┌────────────────────────────────────┐
   │ 4. Calculate S07                   │
   │    owningSection.calculateAll()    │  ←─ Required! S07 doesn't
   └────────────────────────────────────┘      listen to d_53
         ↓
   ┌────────────────────────────────────┐
   │ 5. Refresh S07 UI                  │
   │    ModeManager.refreshUI()         │  ←─ Slider moves to 50%
   └────────────────────────────────────┘
         ↓
   ┌────────────────────────────────────┐
   │ 6. Refresh S18 graph               │
   │    refresh()                       │  ←─ Graph redraws
   └────────────────────────────────────┘
```

**Key Insight:** StateManager is pub/sub for **cross-section dependencies**, not for internal section state. Sections manage their own fields directly.

---

### Code Reference: Complete dragEnded() Implementation

**Location:** [ParallelCoordinates.js:1068-1116](../src/core/ParallelCoordinates.js#L1068-L1116)

This is the complete working code for DWHR%. Use this as a template:

```javascript
function dragEnded(event, d) {
  // Remove dragging visual state
  d3.select(this).classed('pc-dragging', false);

  const axisConfig = EDITABLE_AXES[d.axisId];

  // Get final value with step snapping
  const axisScale = scales[d.axisId];
  let finalValue = axisScale.invert(event.y);
  finalValue = Math.round(finalValue / axisConfig.step) * axisConfig.step;
  const clampedValue = Math.max(axisConfig.min, Math.min(axisConfig.max, finalValue));

  // Determine which field to update (Target or Reference)
  const baseFieldId = axisConfig.targetField;
  const isTarget = d.mode === 'target';
  const fieldId = isTarget ? baseFieldId : `ref_${baseFieldId}`;

  // Get owning section module
  const owningSection = window.TEUI?.SectionModules?.[axisConfig.owningSection];

  if (owningSection) {
    // ✅ STEP 1: Switch section to correct mode
    const targetMode = isTarget ? 'target' : 'reference';
    if (owningSection.ModeManager && owningSection.ModeManager.currentMode !== targetMode) {
      owningSection.ModeManager.switchMode(targetMode);
    }

    // ✅ STEP 2: Update appropriate internal state (TargetState or ReferenceState)
    const targetState = isTarget ? owningSection.TargetState : owningSection.ReferenceState;
    if (targetState) {
      targetState.setValue(baseFieldId, clampedValue.toString());
    }

    // ✅ STEP 3: Update StateManager (triggers downstream dependencies)
    if (window.TEUI?.StateManager) {
      window.TEUI.StateManager.setValue(fieldId, clampedValue.toString(), 'user-modified');
    }

    // ✅ STEP 4: Calculate owning section (CRITICAL - section doesn't listen to own fields)
    if (owningSection.calculateAll) {
      owningSection.calculateAll();
    }

    // ✅ STEP 5: Refresh owning section UI (slider moves to new position)
    if (owningSection.ModeManager) {
      owningSection.ModeManager.refreshUI();
    }
  }

  // ✅ STEP 6: Refresh S18 graph (with small delay for DOM updates)
  setTimeout(() => {
    refresh();
  }, 100);

  // Hide modal
  hideDragModal();
}
```

**You don't need to modify this function!** Just add your axis config to `EDITABLE_AXES` and it works automatically.

---

### Verification Script

**After adding a new axis, run this in browser console to verify setup:**

```javascript
// Verify axis configuration
const axisId = 'your_axis_id';  // e.g., 'shw_efficiency'
const config = window.TEUI?.ParallelCoordinates?.EDITABLE_AXES?.[axisId];

if (!config) {
  console.error(`❌ Axis "${axisId}" not found in EDITABLE_AXES`);
} else {
  console.log('✅ Axis configuration found:', config);

  // Verify owning section exists
  const section = window.TEUI?.SectionModules?.[config.owningSection];
  if (!section) {
    console.error(`❌ Section "${config.owningSection}" not found`);
  } else {
    console.log(`✅ Owning section "${config.owningSection}" exists`);

    // Verify section has required methods
    if (!section.calculateAll) {
      console.error(`❌ Section missing calculateAll() method`);
    } else {
      console.log('✅ Section has calculateAll() method');
    }

    if (!section.ModeManager) {
      console.error(`❌ Section missing ModeManager`);
    } else {
      console.log('✅ Section has ModeManager');
    }

    if (!section.TargetState || !section.ReferenceState) {
      console.error(`❌ Section missing TargetState or ReferenceState`);
    } else {
      console.log('✅ Section has TargetState and ReferenceState');
    }
  }

  // Verify field exists in StateManager
  const targetValue = window.TEUI?.StateManager?.getValue(config.targetField);
  const refValue = window.TEUI?.StateManager?.getValue(config.refField);

  console.log(`Target field "${config.targetField}" value:`, targetValue);
  console.log(`Reference field "${config.refField}" value:`, refValue);

  // Verify axis exists in pcConfig
  const pcConfig = window.TEUI?.pcConfig;
  const axisExists = pcConfig?.axes?.some(a => a.id === axisId);

  if (!axisExists) {
    console.error(`❌ Axis "${axisId}" not found in pcConfig.js`);
  } else {
    console.log(`✅ Axis "${axisId}" exists in pcConfig.js`);
  }
}
```

---

### Summary: What You Need to Do

For each new editable axis, follow these **4 simple steps:**

1. **Gather Info:** Find field ID, range, step, unit, owning section
2. **Add Config:** Add entry to `EDITABLE_AXES` in ParallelCoordinates.js
3. **Test:** Run through testing checklist
4. **Verify:** Run verification script in browser console

**That's it!** The existing infrastructure handles everything else automatically:
- ✅ Drag behavior (already implemented)
- ✅ Modal display (already implemented)
- ✅ Mode switching (already implemented)
- ✅ State updates (already implemented)
- ✅ CSS styling (already implemented)
- ✅ Section recalculation (already implemented)
- ✅ Graph refresh (already implemented)

**Total Time per Axis:** ~15 minutes (5 min research + 5 min config + 5 min testing)

---

## PREVIOUS ATTEMPTS (Historical Record)

### REFACTOR ATTEMPT #2 - FAILED (November 24, 2025 - Late Session)

**What Was Attempted**:
- Added isActivated state flag
- Modified initialize() to create placeholder, NOT call refresh()
- Refactored initializeControls() with button transformation

**Why It Failed**:
- Section18.js.initializeEventHandlers() never called
- Root cause: Missing section registration in FieldManager.js

**Action Taken**:
- Reverted to commit f25f3e4

### REFACTOR ATTEMPT #1 - FAILED (November 24, 2025 - Mid Session)

**What Was Attempted**:
- Two-phase initialization pattern
- Retry logic (5 attempts)
- DOM timing defensive code

**Why It Failed**:
- Over-engineered solution
- Same root cause: Missing section registration

**Action Taken**:
- Reverted to commit 64cf4a8

