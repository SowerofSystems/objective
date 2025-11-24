# Section 18: Optimize - Parallel Coordinates Workplan

**Date Created**: November 23, 2025
**Branch**: S18-19-PARALLEL-COORDINATES
**Status**: Planning Phase

---

## Overview

Section 18 will implement a **Parallel Coordinates** visualization to show optimization paths between Target and Reference building configurations. The graph will display two lines (blue for Target, red for Reference) traversing across multiple vertical axes representing key performance parameters with the highest total influence for the least capital cost.

**Design Goals**:
- Clean, unique visualization (not generic parallel coordinates)
- 80% graph / 20% data table layout
- Two-line comparison (Target vs Reference)
- Focus on high-impact, low-cost parameters
- Consistent with S16/S17 D3.js patterns

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

**No additional libraries needed!** D3.js v7 is self-sufficient for parallel coordinates.

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
- Control panel setup (fullscreen, refresh, export)
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
│ [Fullscreen] [Refresh] [Export PNG] [Settings]     │
├─────────────────────────────────────────────────────┤
│                                                     │
│                                                     │
│         PARALLEL COORDINATES GRAPH                  │
│         (80% of vertical space)                     │
│                                                     │
│    Axis1   Axis2   Axis3   Axis4   Axis5   Axis6   │
│      │      │      │      │      │      │      │    │
│      │      │      │      │      │      │      │    │
│    ──┴──────┴──────┴──────┴──────┴──────┴──────    │
│    [Blue Line: Target Model]                        │
│    [Red Line: Reference Model]                      │
│                                                     │
├─────────────────────────────────────────────────────┤
│ DATA TABLE (20% of vertical space)                 │
│                                                     │
│ Parameter    | Target  | Reference | Δ      | %Δ   │
│──────────────┼─────────┼───────────┼────────┼──────│
│ Window U-Val | 0.20    | 0.40      | -0.20  | -50% │
│ Wall R-Value | 30      | 20        | +10    | +50% │
│ ... (user-defined axes from tomorrow's list)       │
└─────────────────────────────────────────────────────┘
```

### Control Panel (Top Row)

**Buttons** (following S16/S17 pattern):
1. **Fullscreen Toggle** (⛶) - Expand/collapse visualization
2. **Refresh** (⟳) - Reload data from StateManager
3. **Export PNG** (⬇) - Download graph as image
4. **Settings** (⚙) - Toggle axis visibility, line colors, etc.

**Info Panel** (optional):
- Active mode indicator (Target/Reference comparison)
- Data timestamp
- Quick stats (e.g., "6 parameters optimized")

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
    optimal: "higher",
    description: "Service Hot Water efficiency - conditional on heating fuel type",
  },
  {
    id: "dwhr_efficiency",
    label: "DWHR%",
    unit: "%",
    targetField: "d_53",
    referenceField: "ref_d_53",
    optimal: "higher",
    description: "Drain Water Heat Recovery efficiency",
  },
  {
    id: "net_gains",
    label: "nGains%",
    unit: "%",
    targetField: "g_80",
    referenceField: "ref_g_80",
    optimal: "higher",
    description: "Net useable internal gains utilization",
  },
  {
    id: "thermal_bridge",
    label: "TB%",
    unit: "%",
    targetField: "d_97",
    referenceField: "ref_d_97",
    optimal: "lower",
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
   - **Ag/Ae**: Not areas (m²), but aggregate U-values (W/m²K)
   - **TELI**: Thermal **Envelope Loss** Intensity (not "Load")
   - **nGains%**: Net **useable** internal gains

4. **All Other Axes** (2-4, 7-8, 10-12): Standard `ref_` prefix for Reference mode

### Two-Line Rendering

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

---

## 6. Styling and Differentiation

### Making It Unique (Not Generic PC Graph)

**Design Differentiators**:
1. **Two-line focus** - Not cluttered with dozens of lines
2. **Color-coded optimization** - Blue (Target) vs Red (Reference) clearly labeled
3. **Contextual axes** - Only show high-impact, low-cost parameters
4. **Integrated table** - Live data below graph (not separate)
5. **Minimalist aesthetic** - Clean, professional, not academic
6. **Interactive highlights** - Hover to show delta values between lines

**Visual Style**:
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
3. [ ] Test data loading from StateManager
4. [ ] Test control panel buttons
5. [ ] Test fullscreen mode
6. [ ] Test responsive layout (mobile/tablet/desktop)
7. [ ] Verify table data matches graph
8. [ ] Performance testing (render time < 500ms)

**Current Status**: Modules created and imported, activate button added. Ready for user testing.

### Phase 5: Polish & Documentation
**Dependencies**: Phase 4 complete

**Tasks**:
1. [ ] Add hover interactions (show delta on hover)
2. [ ] Add tooltips for axes (explain parameter impact/cost)
3. [ ] Add loading state indicator
4. [ ] Add error handling (missing StateManager values)
5. [ ] Write inline code documentation
6. [ ] Update CLAUDE.md with S18 architecture notes
7. [ ] Create user guide section in docs

---

## 8. Technical Specifications

### Browser Compatibility
- **Target**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- **D3.js v7**: Requires ES6+ support (covered by target browsers)

### Performance Targets
- **Initial render**: < 500ms
- **Refresh/update**: < 200ms
- **Fullscreen toggle**: < 100ms
- **Export PNG**: < 2s

### Accessibility
- **Keyboard navigation**: Arrow keys to traverse axes
- **Screen reader support**: ARIA labels on axes and lines
- **Color contrast**: WCAG AA compliance (4.5:1 minimum)
- **Alternative text**: Table provides data fallback if graph fails

---

## 9. Open Questions

1. ~~**Axis List**: Which parameters to visualize?~~ ✅ RESOLVED - 14 axes defined
2. **Axis Order**: Left-to-right sequence by impact, cost, or category?
   - Current order: As provided by user (inputs → outputs)
   - Alternative: Group by category (efficiency → geometry → performance)
3. **Domain Ranges**: Min/max for each axis
   - Need to analyze typical value ranges from StateManager
   - Consider auto-scaling vs fixed ranges
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
4. Polish and document

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
| 2025-11-24 | Refactor Attempt | Attempted S17 two-phase pattern. Commits 5be5fd6, a2d581e - **NEEDS REVERT** |

---

## NEXT SESSION: Recovery Plan

### Current Situation (November 24, 2025 - Late Session)

**Problem**: Attempted to refactor S18 to match S17's two-phase initialization pattern (activate button in controls row). Implementation became complex with:
- Defensive retry logic (5 attempts)
- DOM timing issues
- S18 not rendering at all (blank section)

**Last Known Working State**: Commit **64cf4a8** (or earlier: 71ca7dc, f13809c)
- Basic implementation working
- Separate activate button (not integrated in controls row)
- Graph renders successfully when activated

**What Worked Well**:
- ✅ CSS styles added to `src/styles.css` (lines 1825-1952) - **Keep these!**
- ✅ Single-row control layout pattern identified from S17
- ✅ Control button styling (btn-sm, consistent gaps)

**What Needs Reverting**:
- ❌ Two-phase initialization in ParallelCoordinates.js
- ❌ setupInitialState() with retry logic
- ❌ activateVisualization() state management
- ❌ Changes to Section18.js calling setupInitialState

### Recovery Steps (Start of Next Session)

**Step 1: Revert to Working State**
```bash
# Revert the two problematic commits
git revert --no-commit a2d581e  # Retry logic
git revert --no-commit 5be5fd6  # S17 pattern refactor
git commit -m "Revert: Two-phase initialization - returning to simpler working pattern"

# Or hard reset if preferred:
git reset --hard 64cf4a8
```

**Step 2: Verify Working State**
- Refresh browser
- S18 should show standalone "Activate Optimization View" button
- Graph should render when button clicked
- Controls should appear and function

**Step 3: Simple Control Row Integration (Low-Risk Approach)**

Instead of two-phase initialization, do a **single-phase** refactor:

1. Keep existing `initialize()` function that works
2. Move CSS from inline styles to classes (already done ✅)
3. Update `initializeControls()` to add activate button at start of row:
   ```javascript
   function initializeControls() {
     const controlsContainer = document.createElement("div");
     controlsContainer.className = "parallel-coordinates-controls";
     // ... existing styling ...

     // Add activate button IF not already activated
     if (!isActivated) {
       const activateBtn = createButton("bi-shuffle", "Activate", () => {
         isActivated = true;
         activateBtn.remove(); // Remove self after click
         refresh(); // Render graph
       });
       activateBtn.classList.add("btn-primary");
       controlsContainer.appendChild(activateBtn);
     }

     // Add other buttons...
     const layoutContainer = document.createElement("div");
     layoutContainer.style.cssText = "display: flex; gap: 5px; align-items: center; margin-left: auto;";
     // ... rest of buttons ...
   }
   ```

4. Update HTML: Remove standalone button, keep just the wrappers

**Step 4: Test Incrementally**
- First: Just move button into controls row (no removal logic)
- Then: Add state flag and self-removal
- Finally: Add placeholder message if desired

### Key Lessons for Next Session

1. **Don't over-engineer**: S17's pattern is complex because Dependency.js has its own DOMContentLoaded listener. S18 uses Section18.js which is simpler.

2. **Single responsibility**: ParallelCoordinates.js should render, not manage initialization state

3. **Keep it simple**: Button starts in controls row, removes itself when clicked. No retry logic needed.

4. **Incremental changes**: Commit small working changes, not big refactors

5. **Trust the working pattern**: The original 64cf4a8 approach was fine, just needed styling cleanup

### Files to Review Next Session

- `src/core/ParallelCoordinates.js` - Check for overly complex initialization
- `src/sections/Section18.js` - Should be minimal (currently is ✅)
- `index.html` - Verify container structure is clean
- `src/styles.css` - Lines 1825-1952 are good, keep them

---

**Document Version**: 1.1
**Last Updated**: November 24, 2025 (Late Session - Pre-Revert)
**Author**: Claude (AI Assistant) + Andrew Thomson
**Branch**: S18-19-PARALLEL-COORDINATES
**Status**: ⚠️ NEEDS REVERT - See recovery plan above
