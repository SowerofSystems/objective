# ARTexplorer UI Module Refactoring Plan

**Version:** 1.0
**Status:** Planning
**Related:** [ARTexplorer.md](./ARTexplorer.md), [ART-Gumball.md](./ART-Gumball.md)

## Overview

Refactor ARTexplorer into modular components separating UI, Controls, Rendering, and Geometry logic. This will improve maintainability, enable feature development (like ART Gumball), and create a cleaner, more professional interface.

## Current Architecture Issues

### Monolithic Structure
- Single 3000+ line HTML file contains everything
- UI markup mixed with JavaScript logic
- Hard to maintain and extend
- Difficult to test components independently

### UI Clutter
- All control sections expanded by default
- No clear visual hierarchy
- Too much information visible at once
- Inconsistent toggle/collapse patterns

### Missing Features
- No gumball transform controls
- No file management (import/export/save)
- No view presets (Top/Bottom/Ortho/Perspective)
- No papercut/print preparation tools

## Proposed Modular Architecture

### Module Separation Strategy

```
ARTexplorer/
├── index.html (minimal shell)
├── modules/
│   ├── ui/
│   │   ├── controls-panel.js      // UI component management
│   │   ├── status-bar.js          // Streaming console
│   │   └── collapsible-section.js // Reusable toggle component
│   ├── geometry/
│   │   ├── polyhedra.js           // Polyhedra definitions
│   │   ├── geodesic.js            // Geodesic subdivision
│   │   └── rt-math.js             // RT calculations
│   ├── rendering/
│   │   ├── scene-manager.js       // THREE.js scene setup
│   │   ├── grid-renderer.js       // Cartesian/Quadray grids
│   │   └── basis-renderer.js      // Basis vector rendering
│   ├── controls/
│   │   ├── gumball.js             // ART Gumball transform system
│   │   ├── camera-controller.js   // Camera/view management
│   │   └── interaction-handler.js // Mouse/keyboard events
│   └── data/
│       ├── state-manager.js       // Application state
│       ├── now-collection.js      // "Now" snapshots
│       └── file-manager.js        // Import/Export/Save
└── styles/
    └── art.css (existing)
```

## Phase 1: UI Decluttering (Immediate - Tonight)

### Goal
Make existing ARTexplorer UI cleaner with collapsible sections

### Tasks

#### 1.1 Convert Main Sections to Collapsible

**Current Sections:**
- Coordinate System
- Polyhedra
- Scale
- Visual Options
- Geometry Info

**Make Collapsible:**
All sections should use the same toggle pattern as "Cartesian Planes" and "Central Angle Grids"

**Pattern:**
```html
<div class="control-group">
  <h3>
    <span class="section-toggle collapsed" data-target="section-id"></span>
    Section Name
  </h3>
  <div id="section-id" class="section-content collapsed">
    <!-- Content here -->
  </div>
</div>
```

**Rename:**
- "Polyhedra" → "Forms"

**Default States:**
- Coordinate System: Collapsed
- Forms: Expanded
- Scale: Collapsed
- Visual Options: Collapsed
- Geometry Info: Collapsed

#### 1.2 Add New Placeholder Sections

Add empty/minimal sections for future implementation:

**Controls** (Future ART Gumball)
```html
<div class="control-group">
  <h3>
    <span class="section-toggle collapsed" data-target="controls-section"></span>
    Controls
  </h3>
  <div id="controls-section" class="section-content collapsed">
    <p class="info-text">ART Gumball controls - Coming soon</p>
    <p class="info-text" style="font-size: 10px;">
      Move, Scale, Rotate (spread-based), NOW button
    </p>
  </div>
</div>
```

**File** (Import/Export/Save)
```html
<div class="control-group">
  <h3>
    <span class="section-toggle collapsed" data-target="file-section"></span>
    File
  </h3>
  <div id="file-section" class="section-content collapsed">
    <div class="control-item">
      <button id="importBtn" disabled>Import (.json)</button>
    </div>
    <div class="control-item">
      <button id="exportBtn" disabled>Export (.json)</button>
    </div>
    <div class="control-item">
      <button id="saveBtn" disabled>Save (Local Storage)</button>
    </div>
    <p class="info-text" style="font-size: 10px;">
      StateManager integration - Coming soon
    </p>
  </div>
</div>
```

**View** (Camera Presets)
```html
<div class="control-group">
  <h3>
    <span class="section-toggle collapsed" data-target="view-section"></span>
    View
  </h3>
  <div id="view-section" class="section-content collapsed">
    <div class="control-item">
      <label style="font-size: 12px; color: #b0b0b0;">Camera Presets</label>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 5px;">
        <button id="viewTop" disabled>Top</button>
        <button id="viewBottom" disabled>Bottom</button>
        <button id="viewLeft" disabled>Left</button>
        <button id="viewRight" disabled>Right</button>
        <button id="viewFront" disabled>Front</button>
        <button id="viewBack" disabled>Back</button>
      </div>
    </div>
    <div class="control-item" style="margin-top: 10px;">
      <label class="checkbox-label">
        <input type="checkbox" id="orthoPerspective" disabled>
        Orthographic (Plan/Elevation)
      </label>
    </div>
    <p class="info-text" style="font-size: 10px;">
      Camera controller - Coming soon
    </p>
  </div>
</div>
```

**Papercut** (Print Preparation)
```html
<div class="control-group">
  <h3>
    <span class="section-toggle collapsed" data-target="papercut-section"></span>
    Papercut
  </h3>
  <div id="papercut-section" class="section-content collapsed">
    <div class="control-item">
      <label style="font-size: 12px; color: #b0b0b0;">Line Weight</label>
      <div class="slider-container">
        <input type="range" id="lineWeight" min="1" max="5" value="1" disabled>
        <span class="slider-value" id="lineWeightValue">1</span>
      </div>
    </div>
    <div class="control-item">
      <label class="checkbox-label">
        <input type="checkbox" id="backfaceCulling" disabled>
        Backface Culling
      </label>
    </div>
    <div class="control-item">
      <label class="checkbox-label">
        <input type="checkbox" id="enableCutPlane" disabled>
        Enable Cut Plane
      </label>
    </div>
    <div class="control-item">
      <label style="font-size: 12px; color: #b0b0b0;">Print Extents</label>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 5px;">
        <button id="fitA4" disabled>A4</button>
        <button id="fitLetter" disabled>Letter</button>
        <button id="fitA3" disabled>A3</button>
        <button id="fitCustom" disabled>Custom</button>
      </div>
    </div>
    <p class="info-text" style="font-size: 10px;">
      Print optimization tools - Coming soon
    </p>
  </div>
</div>
```

#### 1.3 CSS Updates

Add styles for new section-toggle and section-content classes:

```css
/* Section Toggle (for h3 sections) */
.section-toggle {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid #888;
  margin-right: 8px;
  cursor: pointer;
  transition: transform 0.2s;
  vertical-align: middle;
}

.section-toggle.collapsed {
  transform: rotate(-90deg);
}

.section-content {
  max-height: 2000px;
  overflow: hidden;
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
  opacity: 1;
}

.section-content.collapsed {
  max-height: 0;
  opacity: 0;
}

h3 {
  cursor: pointer;
  user-select: none;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### 1.4 JavaScript Toggle Logic

Add event listeners for section toggles (similar to existing geodesic-toggle):

```javascript
// Section toggle functionality (for main h3 sections)
document.querySelectorAll('.section-toggle').forEach(toggle => {
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const targetId = toggle.dataset.target;
    const content = document.getElementById(targetId);

    toggle.classList.toggle('collapsed');
    content.classList.toggle('collapsed');
  });
});

// Make h3 headers clickable (entire row)
document.querySelectorAll('h3').forEach(header => {
  if (header.querySelector('.section-toggle')) {
    header.addEventListener('click', () => {
      const toggle = header.querySelector('.section-toggle');
      toggle.click();
    });
  }
});
```

## Phase 2: Module Extraction (Future)

### 2.1 Extract UI Components

**Goal:** Separate UI markup and event handling from rendering logic

**Files to Create:**
- `modules/ui/controls-panel.js`
- `modules/ui/collapsible-section.js`
- `modules/ui/status-bar.js`

**Approach:**
- Create HTML using JavaScript template literals or DOM manipulation
- Use custom events for inter-component communication
- Implement reactive state updates

### 2.2 Extract Geometry Logic

**Goal:** Pure geometry calculations separate from rendering

**Files to Create:**
- `modules/geometry/polyhedra.js` - Shape definitions
- `modules/geometry/geodesic.js` - Subdivision algorithms
- `modules/geometry/rt-math.js` - RT calculations (quadrance, spread)

**Approach:**
- Export factory functions for each polyhedron
- RT calculations use pure functions (no THREE.js dependencies)
- Return vertex/face/edge data structures

### 2.3 Extract Rendering Logic

**Goal:** THREE.js rendering isolated from business logic

**Files to Create:**
- `modules/rendering/scene-manager.js`
- `modules/rendering/grid-renderer.js`
- `modules/rendering/basis-renderer.js`

**Approach:**
- SceneManager owns THREE.Scene, Camera, Renderer
- Grid/Basis renderers are stateless functions
- Use observer pattern for updates

### 2.4 Extract Control Logic

**Goal:** Interaction handling separate from UI

**Files to Create:**
- `modules/controls/gumball.js` - ART Gumball implementation
- `modules/controls/camera-controller.js` - View management
- `modules/controls/interaction-handler.js` - Mouse/keyboard

**Approach:**
- Gumball as separate object with own rendering
- Camera controller manages OrbitControls + presets
- Event delegation for all interactions

### 2.5 Extract Data Management

**Goal:** State management and persistence

**Files to Create:**
- `modules/data/state-manager.js` - Application state
- `modules/data/now-collection.js` - "Now" snapshots
- `modules/data/file-manager.js` - Import/Export/Save

**Approach:**
- Single source of truth for app state
- Observable state changes
- JSON/CSV serialization

## Phase 3: ART Gumball Integration

### 3.1 Gumball Rendering

Implement 3D interactive handles as per [ART-Gumball.md](./ART-Gumball.md):
- Arrow handles for MOVE
- Cube handles for SCALE
- Ring handles for ROTATE (spread-based)
- Color-coded by coordinate system mode

### 3.2 Status Bar

Implement streaming console for numeric input:
- Appears on handle click
- Real-time value display
- TAB/ENTER to accept, ESC to cancel
- Preset buttons for exact spreads

### 3.3 NOW System

Implement snapshot deposition:
- NOW button creates immutable configuration
- Deposits instance in scene
- Stores in NowCollection
- Increments counter

## Phase 4: Advanced Features

### 4.1 View Presets

Implement camera positioning:
- Top/Bottom/Left/Right/Front/Back buttons
- Orthographic/Perspective toggle
- Smooth transitions

### 4.2 Papercut Tools

Implement print preparation:
- Adjustable line weights
- Backface culling toggle
- Cut plane controls
- Print extent fitting (A4, Letter, A3, Custom)

### 4.3 File Management

Implement state persistence:
- Export session to JSON
- Export Nows to CSV
- Import from file
- Save/Load from localStorage

## Implementation Priority

### Immediate (Tonight)
✅ Phase 1 Tasks:
1. Make existing sections collapsible
2. Rename Polyhedra → Forms
3. Add placeholder sections (Controls, File, View, Papercut)
4. Update CSS for section toggles
5. Add JavaScript toggle logic

### Near-Term (Next Session)
- Phase 2.1: Extract UI components
- Phase 2.4: Start camera controller
- Phase 3.1: Begin gumball rendering

### Medium-Term
- Phase 2.2: Extract geometry logic
- Phase 2.3: Extract rendering logic
- Phase 3.2: Status bar implementation
- Phase 4.1: View presets

### Long-Term
- Phase 2.5: Data management
- Phase 3.3: NOW system
- Phase 4.2: Papercut tools
- Phase 4.3: File management

## Technical Considerations

### ES6 Modules
Use native ES6 modules:
```html
<script type="module" src="modules/ui/controls-panel.js"></script>
```

### Build Tool (Optional)
Consider bundler if needed:
- Vite (fast, simple)
- Rollup (tree-shaking)
- Webpack (full-featured)

### Testing
Unit tests for:
- RT math functions
- Geometry calculations
- State management

### Documentation
- JSDoc comments for all modules
- README for each module directory
- API documentation

## Success Criteria

### Phase 1 Complete
- [ ] All main sections collapsible
- [ ] Polyhedra renamed to Forms
- [ ] 4 new placeholder sections added
- [ ] CSS styles for toggles implemented
- [ ] JavaScript toggle logic working
- [ ] UI feels cleaner and more organized

### Full Refactor Complete
- [ ] All modules extracted and independent
- [ ] ART Gumball fully functional
- [ ] View presets working
- [ ] File import/export operational
- [ ] Code coverage >80%
- [ ] Performance maintained or improved

## Migration Strategy

### Backward Compatibility
During refactoring:
- Keep existing functionality working
- Add new features incrementally
- Test after each module extraction

### Testing Approach
- Manual testing after each phase
- Regression testing on existing features
- Visual inspection of UI changes

### Rollback Plan
- Git branches for each phase
- Tag stable versions
- Document breaking changes

---

**Status:** Ready for Phase 1 implementation
**Next Steps:** Implement collapsible sections tonight, plan Phase 2 for next session
