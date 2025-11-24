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

**Tomorrow's Input**: User will provide list of parameters to visualize

**Expected Format**:
```javascript
const OPTIMIZATION_AXES = [
  {
    id: "window_u_value",
    label: "Window U-Value",
    unit: "W/m²K",
    targetField: "h_27",       // StateManager field ID
    referenceField: "ref_h_27",
    domain: [0.1, 0.5],         // Min/max range for axis
    optimal: "lower",           // Direction of improvement
    capitalCost: "low",         // Relative cost to optimize
    impact: "high",             // Relative energy impact
  },
  // ... (user will provide complete list tomorrow)
];
```

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

### Phase 2: Data Schema (WAITING ON USER INPUT)
**Dependencies**: User to provide list of parameters tomorrow

**Tasks**:
1. [ ] Receive list of axes/parameters from user
2. [ ] Map each parameter to StateManager field IDs
3. [ ] Define domain ranges (min/max) for each axis
4. [ ] Classify by impact (high/medium/low) and cost (low/medium/high)
5. [ ] Create `OPTIMIZATION_AXES` configuration object

**File**: Create `src/sections/ParallelCoordinatesConfig.js`

### Phase 3: Core Visualization Module
**Dependencies**: Phase 2 complete

**Tasks**:
1. [ ] Create `src/sections/ParallelCoordinates.js` (main module)
2. [ ] Implement data fetching (Target vs Reference from StateManager)
3. [ ] Implement D3.js parallel coordinates renderer
   - [ ] Create SVG container (80% height)
   - [ ] Draw vertical axes
   - [ ] Draw blue line (Target data)
   - [ ] Draw red line (Reference data)
   - [ ] Add axis labels with units
4. [ ] Implement control panel
   - [ ] Fullscreen toggle
   - [ ] Refresh button
   - [ ] Export PNG functionality
   - [ ] Settings panel (axis visibility, colors)
5. [ ] Implement data table (20% height)
   - [ ] Target values column
   - [ ] Reference values column
   - [ ] Delta (Δ) column
   - [ ] Percentage change (%) column

**File**: `src/sections/ParallelCoordinates.js` (~500-800 lines)

### Phase 4: Integration & Testing
**Dependencies**: Phase 3 complete

**Tasks**:
1. [ ] Add script import to index.html (`<script src="src/sections/ParallelCoordinates.js"></script>`)
2. [ ] Test data loading from StateManager
3. [ ] Test mode switching (Target → Reference → Target)
4. [ ] Test control panel buttons
5. [ ] Test fullscreen mode
6. [ ] Test responsive layout (mobile/tablet/desktop)
7. [ ] Verify table data matches graph
8. [ ] Performance testing (render time < 500ms)

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

## 9. Open Questions (To Resolve Tomorrow)

1. **Axis List**: Which parameters to visualize? (User to provide)
2. **Axis Order**: Left-to-right sequence by impact, cost, or category?
3. **Normalization**: Should axes be normalized (0-1) or use actual units?
4. **Interaction**: Should axes be draggable/reorderable?
5. **Export**: PNG only, or also PDF/SVG/CSV?
6. **Filtering**: Allow hiding/showing individual axes?
7. **Comparison Mode**: Support more than 2 lines (e.g., multiple scenarios)?

---

## 10. File Structure

```
objective/
├── index.html                          ✅ Updated (S18 HTML structure)
├── src/
│   ├── core/
│   │   └── init.js                     ✅ Updated (navigation mapping)
│   └── sections/
│       ├── Section18.js                ✅ Created (minimal module stub)
│       ├── Section19.js                ✅ Renamed (formerly Section18.js)
│       ├── ParallelCoordinates.js      🔜 TO CREATE (main visualization)
│       └── ParallelCoordinatesConfig.js 🔜 TO CREATE (axes configuration)
└── docs/
    └── development/
        └── S18-OPTIMIZE.md             ✅ This file
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
| 2025-11-23 | Planning | Workplan created, awaiting user parameter list |
| 2025-11-24 | TBD | User to provide axis configuration |

---

**Document Version**: 1.0
**Last Updated**: November 23, 2025
**Author**: Claude (AI Assistant) + Andrew Thomson
**Branch**: S18-19-PARALLEL-COORDINATES
