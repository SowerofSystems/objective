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

**Phase 1: Table Structure (Blocking with Dummy Data)**
- [ ] Add "Reference Cost" row (Red, $0.00 per axis)
- [ ] Add "Target Cost" row (Blue, $0.00 per axis)
- [ ] Add "Savings (Δ$)" row (Green for savings, $0.00 per axis)
- [ ] Style with appropriate colors matching Target/Reference legend
- [ ] Ensure proper alignment with existing 4 rows

**Phase 2: Financial Calculations (Future Session)**
- [ ] Implement cost calculation formulas per axis
- [ ] Wire up to StateManager financial fields
- [ ] Add totals column (optional)
- [ ] Format currency values (locale-aware)

**Rationale:**
- 100px vertical space reserved in 500px container
- Financial impact is critical for decision-making
- Parallels performance metrics with economic metrics
- Completes the "optimization story" (performance + cost)

### 🔮 Future Enhancements

- [ ] Test responsive behavior (mobile/tablet)
- [ ] Add hover interactions (show delta on hover)
- [ ] Add tooltips for axes (explain parameter impact/cost)
- [ ] Implement Settings panel functionality
- [ ] Add axis reordering (drag to rearrange)

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

