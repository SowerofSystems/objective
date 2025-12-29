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

### Module Separation Strategy (Pragmatic)

**Philosophy:** Only modularize when it improves maintainability. Avoid over-engineering.

**Analysis of Current ARTexplorer.html (~2820 lines):**
- RT Library: ~130 lines (small, self-contained)
- Polyhedra Generators: ~1870 lines (large but cohesive)
- THREE.js Scene/Rendering: ~500-800 lines (integrated functionality)
- Event Handlers: ~200 lines (will stay in main HTML)

**Pragmatic Module Structure (ES6, No Build Step):**

```
ARTexplorer/
├── ARTexplorer.html           // Main shell + UI + event handlers (~500 lines)
├── modules/
│   ├── rt-math.js             // ~260 lines: RT calculations (quadrance, spread)
│   ├── rt-polyhedra.js        // ~1122 lines: All polyhedra generators
│   ├── rt-rendering.js        // ~781 lines: Scene, viewer, grids, basis
│   ├── rt-state-manager.js    // Future: Application state management
│   ├── rt-file-handler.js     // Future: Import/Export/Save operations
│   └── rt-gumball.js          // Future: ART Gumball transform system
└── styles/
    └── art.css (existing)
```

**Why This Structure:**
- **rt-math.js**: Small, reusable, pure functions - easy to test independently
- **rt-polyhedra.js**: Large but cohesive - all shape definitions in one place
- **rt-rendering.js**: All THREE.js code together - scene/viewer/grids are tightly coupled
- **rt-state-manager.js**: Proven pattern from TEUI/OBJECTIVE - manages app state
- **rt-file-handler.js**: Proven pattern from TEUI/OBJECTIVE - handles I/O operations
- **rt-gumball.js**: Complex feature, deserves its own module when implemented
- **rt- prefix**: Avoids confusion with core TEUI/OBJECTIVE app modules

**Technical Approach:**
- Use native ES6 modules (`<script type="module">`)
- No build step, no bundler - runs directly in browser
- Import/export syntax for clean dependencies
- Maintain backward compatibility during migration

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

## Phase 2: Module Extraction (Pragmatic Approach)

### 2.1 Extract RT Math Module (~130 lines)

**Goal:** Create reusable, testable rational trigonometry library

**File to Create:** `modules/rt-math.js`

**Contents:**
- `quadrance(p1, p2)` - Distance squared
- `spread(v1, v2)` - Perpendicularity measure (0-1)
- `crossSpread(v1, v2, v3)` - Triple spread formula
- Helper functions for RT calculations

**Approach:**
- Pure functions, no dependencies on THREE.js
- Export object: `export const RT = { quadrance, spread, ... }`
- Fully documented with JSDoc comments
- Easy to unit test independently

**Estimated Effort:** 1-2 hours

---

### 2.2 Extract Polyhedra Module (~1870 lines)

**Goal:** Separate shape generation logic from rendering

**File to Create:** `modules/polyhedra.js`

**Contents:**
- `createTetrahedron()` - Tetrahedron generator
- `createCube()` - Cube generator
- `createOctahedron()` - Octahedron generator
- `createIcosahedron()` - Icosahedron generator
- `createDodecahedron()` - Dodecahedron generator
- Geodesic subdivision algorithms
- All polyhedra factory functions

**Approach:**
- Import RT from `rt-math.js`
- Export factory functions for each shape
- Return vertex/edge/face data structures
- Keep all shape definitions together (cohesive)

**Estimated Effort:** 3-4 hours

---

### 2.3 Extract Rendering Module (~500-800 lines)

**Goal:** Isolate THREE.js rendering logic

**File to Create:** `modules/rendering.js`

**Contents:**
- Scene initialization (THREE.Scene, Camera, Renderer)
- Viewer/canvas management (resize handling)
- Grid rendering (Cartesian XYZ, Quadray WXYZ)
- Basis vector rendering
- Lighting setup
- OrbitControls initialization

**Approach:**
- Import THREE.js from CDN
- Export `SceneManager` class or init function
- Keep scene/viewer/grids together (tightly coupled)
- Provide hooks for polyhedra updates

**Estimated Effort:** 4-5 hours

---

### 2.4 Create State Manager Module (Future)

**Goal:** Application state management (proven TEUI/OBJECTIVE pattern)

**File to Create:** `modules/state-manager.js`

**Contents:**
- Application state object
- State getters/setters
- Observable state changes
- "Now" collection management
- Environment metadata

**Approach:**
- Follow TEUI/OBJECTIVE StateManager pattern
- Single source of truth for app state
- Event-based state updates
- Serializable for export

**Estimated Effort:** 3-4 hours

---

### 2.5 Create File Handler Module (Future)

**Goal:** Import/Export/Save operations (proven TEUI/OBJECTIVE pattern)

**File to Create:** `modules/file-handler.js`

**Contents:**
- JSON import/export
- CSV export for "Now" snapshots
- LocalStorage persistence
- File validation

**Approach:**
- Follow TEUI/OBJECTIVE FileHandler pattern
- Separate I/O from state management
- Handle file read/write operations
- Error handling for corrupt files

**Estimated Effort:** 2-3 hours

---

### 2.6 Create Gumball Module (Future - Phase 3)

**Goal:** ART Gumball interactive transform system

**File to Create:** `modules/gumball.js`

**Contents:**
- Gumball handle rendering (arrows, cubes, rings)
- Interaction handlers (move, scale, rotate)
- Spread-based rotation logic
- Status bar integration
- NOW button functionality

**Approach:**
- Import THREE.js and RT
- Separate object with own rendering
- Event-based communication with main app
- Follow ART-Gumball.md specification

**Estimated Effort:** 8-10 hours

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

### ✅ Phase 1 Complete (Dec 29, 2025)
1. Made all sections collapsible with toggle functionality
2. Renamed Polyhedra → Forms
3. Added placeholder sections (Controls, File, View, Papercut, Geometry Info)
4. Updated CSS for section toggles
5. Added JavaScript toggle logic
6. Standardized button styling across all sections

**Result:** Clean, organized UI with ~40% less visual clutter

---

### 🔄 Phase 2: Module Extraction (Current - Next Session)

**Priority Order:**

1. **Phase 2.1: Extract RT Math** (~130 lines, 1-2 hours)
   - Pure functions, no dependencies
   - Easiest to test
   - Foundation for other modules

2. **Phase 2.2: Extract Polyhedra** (~1870 lines, 3-4 hours)
   - Depends on rt-math.js
   - Self-contained shape generators
   - Large but cohesive

3. **Phase 2.3: Extract Rendering** (~500-800 lines, 4-5 hours)
   - Depends on polyhedra.js
   - Scene, viewer, grids together
   - Update main HTML to use modules

**Success Criteria:**
- ARTexplorer.html reduced from 2820 → ~500 lines
- All existing functionality preserved
- No build step required (native ES6 modules)
- Code is more maintainable and testable

---

### 📋 Phase 3: State & File Management (Future)

1. **Phase 2.4: State Manager** (3-4 hours)
   - Follow TEUI/OBJECTIVE pattern
   - Application state management
   - "Now" collection foundation

2. **Phase 2.5: File Handler** (2-3 hours)
   - Follow TEUI/OBJECTIVE pattern
   - Import/Export/Save functionality
   - Enable File section buttons

---

### 🎯 Phase 4: ART Gumball & Advanced Features (Future)

1. **Phase 2.6: Gumball Module** (8-10 hours)
   - Interactive 3D handles
   - Spread-based rotation
   - NOW system implementation

2. **Phase 4.1: View Presets** (2-3 hours)
   - Camera positioning
   - Ortho/Perspective toggle
   - Enable View section buttons

3. **Phase 4.2: Papercut Tools** (3-4 hours)
   - Line weight control
   - Backface culling
   - Print extent fitting
   - Enable Papercut section buttons

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
