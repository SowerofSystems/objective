# RT-Papercut Module

**Module**: `rt-papercut.js`
**Branch**: `Papercut` (branched from `Fold-Space`)
**Created**: 2026-01-01
**Status**: ✅ **Phase 1 Complete** - Core features implemented

---

## Implementation Status

### ✅ Completed Features
- **Dynamic Cutplane** - Slides along current view axis with ±10 unit range
- **Intersection Edge Rendering** - Clean Line2 edges where cutplane slices through geometry
- **Print Mode (B&W)** - One-click toggle for white background, black lines, dark gray meshes
- **Line Weight Control** - Real-time slider (1-5) with Line2/LineMaterial for actual thickness
- **Invert Cutplane** - Simple checkbox to flip normal direction (ground plane mode)
- **Smart Filtering** - Automatically excludes grids, basis vectors (up to 3 levels), hidden objects

### 🔲 TODO Features
- **Visualize Cutplane** - Optional visible plane with light gray fill and Line2 boundary edges
  - Should inherit grid extent (±10 units default)
  - Works for both normal and inverted modes
  - Toggle on/off independently of clipping

---

## 1. Overview

RT-Papercut transforms the ART Explorer into a print-ready architectural section tool by:
- Switching UI from black background to white (print-optimized)
- Adding depth-based line weights (LOD - Level of Detail)
- Implementing a dynamic cutplane with UI slider control
- Leveraging existing camera view presets
- Exporting via browser's native print-to-PDF functionality

**Design Philosophy**: Maximize reuse of existing tools (camera views, rendering utilities, state management) without creating redundant systems.

---

## 2. Core Features

### 2.1 Print Mode Toggle
- **UI Control**: Checkbox in Papercut section: "Enable Print Mode"
- **Visual Changes**:
  - Background: Black (`#000000`) → White (`#FFFFFF`)
  - Line colors: Bright/saturated → Dark/print-optimized
  - Hide non-essential UI elements (performance stats, debug info)
  - Show print-specific controls (cutplane slider, line weight options)

### 2.2 Depth-Based Line Weights (LOD)
Geometry closer to the view plane gets thicker lines than distant geometry.

**Implementation Strategy**:
- Calculate distance from each vertex/edge to the current camera position
- Map distance to line weight: `lineWeight = lerp(maxWeight, minWeight, normalizedDistance)`
- Update on camera move (debounced for performance)

**Weight Ranges**:
- **Close**: 2.0 - 3.0 px (foreground detail)
- **Medium**: 1.0 - 2.0 px (mid-ground context)
- **Far**: 0.5 - 1.0 px (background reference)

### 2.3 Dynamic Cutplane
A plane that slices through geometry, hiding everything on one side.

**Cutplane Properties**:
- **Orientation**: Aligned to current camera view (Top = XY horizontal, Front = XZ vertical, etc.)
- **Range**: Full grid extent (if grid is 12 units tall, slider ranges from -12 to +12)
- **UI Control**: Slider in Papercut section
- **Visual Feedback**: Optional plane visualization (toggle-able, semi-transparent grid)

**Cutplane Logic**:
```javascript
// Pseudocode
function applyCutplane(geometry, cutplaneHeight, cutplaneAxis) {
  geometry.vertices.forEach(vertex => {
    const distanceFromPlane = vertex[cutplaneAxis] - cutplaneHeight;
    vertex.visible = (distanceFromPlane >= 0); // Show only above cutplane
  });

  // Update faces to hide those with all vertices below cutplane
  geometry.faces.forEach(face => {
    const allVerticesVisible = face.vertices.every(v => v.visible);
    face.visible = allVerticesVisible;
  });
}
```

### 2.4 SVG Export
Generate SVG from visible geometry for high-quality vector output.

**SVG Generation**:
- Project 3D geometry to 2D screen space
- Convert THREE.js line geometry to SVG `<path>` elements
- Apply line weights based on depth
- Include visible UI controls (view name, scale bar, cutplane indicator)
- Output to new browser tab/window for print dialog

---

## 3. Integration with Existing Systems

### 3.1 Camera View Presets (Leverage Existing)
**File**: `src/geometry/rt-init.js:1632-1722`

Existing views to leverage:
- **Top** (`camera.position.set(0, 0, distance)`) - XY plane cutplane slides along Z
- **Front** (`camera.position.set(0, -distance, 0)`) - XZ plane cutplane slides along Y
- **Left/Right** (45° angles) - Angled cutplane (more complex, phase 2)
- **Axo** - Isometric cutplane (advanced feature)

**Cutplane Axis Mapping**:
```javascript
const cutplaneConfig = {
  top:    { axis: 'z', normal: [0, 0, 1] },
  bottom: { axis: 'z', normal: [0, 0, -1] },
  front:  { axis: 'y', normal: [0, 1, 0] },
  back:   { axis: 'y', normal: [0, -1, 0] },
  left:   { axis: 'x', normal: [1, 0, 0] },
  right:  { axis: 'x', normal: [-1, 0, 0] }
};
```

### 3.2 Grid Extent Detection
**File**: `src/geometry/rt-init.js:260-307`

Cartesian grid already calculates extent:
```javascript
const gridSize = divisions; // Line 266
// divisions from slider: min=10, max=100, step=10
```

**Cutplane Range Calculation**:
```javascript
function getCutplaneRange() {
  const cartesianSlider = document.getElementById('cartesianTessSlider');
  const divisions = parseInt(cartesianSlider.value);
  const gridExtent = divisions;

  return {
    min: -gridExtent / 2,
    max: gridExtent / 2
  };
}
```

### 3.3 Rendering Utilities (rt-rendering.js)
**File**: `src/geometry/modules/rt-rendering.js`

Leverage existing functions:
- `RTRendering.createEdgeGeometry()` - Line rendering
- `RTRendering.createMeshWithEdges()` - Mesh + wireframe combo

**New Functions to Add**:
```javascript
// rt-rendering.js additions
RTRendering.setLineWeightByDepth = function(lineGeometry, camera, minWeight, maxWeight) {
  // Calculate distance from camera to each line segment
  // Update LineBasicMaterial.linewidth based on depth
};

RTRendering.applyClippingPlane = function(geometry, planeNormal, planeConstant) {
  // Use THREE.Plane for geometry clipping
  // Returns clipped geometry or null if fully clipped
};
```

### 3.4 State Management
**Status**: ⏸️ DEFERRED (Not needed for MVP)

**Initial Implementation Philosophy**:
The first version of Papercut is a **"one-shot" print export** tool - the user simply clicks a button to generate a print-ready view, then prints via browser. No persistent state management needed.

**Why defer StateManager integration?**
- Simpler initial implementation (fewer dependencies)
- Faster time to working prototype
- User can regenerate print view on demand (no need to save/restore print states)
- Reduces complexity for first iteration

**Future Enhancement** (Post-MVP):
If users request the ability to save/restore multiple papercut configurations (different cutplane positions, line weight presets, etc.), we can integrate with StateManager:
```javascript
// FUTURE: Add to StateManager for persistent papercut configurations
const papercutState = {
  enabled: false,
  cutplaneEnabled: false,
  cutplaneHeight: 0,
  cutplaneAxis: 'z',
  lineWeightEnabled: true,
  lineWeightMin: 0.5,
  lineWeightMax: 3.0,
  currentView: 'top'
};
```

**Current Approach** (MVP):
- Papercut module maintains local state (not persisted)
- State resets when print mode is toggled off
- User adjusts cutplane/line weights, then immediately exports
- Simple, fast, no undo/redo complexity

---

## 4. Module Structure: rt-papercut.js

### 4.1 Module Exports

```javascript
/**
 * RT-Papercut Module
 * Print-optimized rendering with cutplane and depth-based line weights
 */

export const RTPapercut = {
  // Core state
  state: {
    printModeEnabled: false,
    cutplaneEnabled: false,
    cutplaneValue: 0,      // Current slider position
    cutplaneAxis: 'z',     // 'x', 'y', or 'z'
    cutplaneNormal: null,  // THREE.Vector3
    lineWeightEnabled: true,
    currentView: 'top'
  },

  // Public API
  enablePrintMode: function(scene, renderer) { },
  disablePrintMode: function(scene, renderer) { },
  updateCutplane: function(value, scene) { },
  updateLineWeights: function(camera, scene) { },
  exportToSVG: function(camera, scene) { },

  // Internal helpers
  _switchToWhiteBackground: function(scene, renderer) { },
  _updateMaterialsForPrint: function(scene) { },
  _createCutplaneVisual: function() { },
  _clipGeometry: function(geometry, plane) { },
  _calculateLineWeight: function(vertex, camera) { }
};
```

### 4.2 Initialization Function

```javascript
/**
 * Initialize Papercut module and wire up UI controls
 * @param {THREE.Scene} scene
 * @param {THREE.Camera} camera
 * @param {THREE.WebGLRenderer} renderer
 */
RTPapercut.init = function(scene, camera, renderer) {
  // 1. Enable Print Mode checkbox
  const printModeCheckbox = document.getElementById('enablePrintMode');
  printModeCheckbox.disabled = false;
  printModeCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      RTPapercut.enablePrintMode(scene, renderer);
    } else {
      RTPapercut.disablePrintMode(scene, renderer);
    }
  });

  // 2. Enable Cutplane checkbox
  const cutplaneCheckbox = document.getElementById('enableCutPlane');
  cutplaneCheckbox.disabled = false;
  cutplaneCheckbox.addEventListener('change', (e) => {
    RTPapercut.state.cutplaneEnabled = e.target.checked;
    RTPapercut.updateCutplane(RTPapercut.state.cutplaneValue, scene);
  });

  // 3. Create Cutplane slider (NEW UI ELEMENT)
  const cutplaneSlider = document.createElement('input');
  cutplaneSlider.type = 'range';
  cutplaneSlider.id = 'cutplaneSlider';
  cutplaneSlider.min = '-12'; // Will be updated dynamically
  cutplaneSlider.max = '12';
  cutplaneSlider.step = '0.1';
  cutplaneSlider.value = '0';
  cutplaneSlider.addEventListener('input', (e) => {
    RTPapercut.state.cutplaneValue = parseFloat(e.target.value);
    RTPapercut.updateCutplane(RTPapercut.state.cutplaneValue, scene);
  });

  // 4. Inject slider into Papercut section
  const papercutSection = document.getElementById('papercut-section');
  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'slider-container';
  sliderContainer.innerHTML = `
    <label class="label-subsection">Cut Plane Height</label>
    <div class="slider-container">
      <input type="range" id="cutplaneSlider" min="-12" max="12" step="0.1" value="0" />
      <span class="slider-value" id="cutplaneValue">0.0</span>
    </div>
  `;
  papercutSection.appendChild(sliderContainer);

  // 5. Listen to camera view changes to update cutplane axis
  document.querySelectorAll('[id^="view"]').forEach(button => {
    button.addEventListener('click', () => {
      const view = button.id.replace('view', '').toLowerCase();
      RTPapercut._updateCutplaneAxisForView(view);
    });
  });

  console.log('✅ RT-Papercut module initialized');
};
```

### 4.3 Print Mode Toggle

```javascript
/**
 * Enable print mode: white background, dark lines, hide UI chrome
 */
RTPapercut.enablePrintMode = function(scene, renderer) {
  RTPapercut.state.printModeEnabled = true;

  // 1. Switch background to white
  scene.background = new THREE.Color(0xffffff);
  renderer.setClearColor(0xffffff);

  // 2. Update all materials for print (dark colors)
  scene.traverse((object) => {
    if (object.material) {
      // Store original material for restoration
      if (!object.userData.originalMaterial) {
        object.userData.originalMaterial = object.material.clone();
      }

      // Convert to print-optimized material
      if (object.material.color) {
        object.material.color.setHex(0x000000); // Black lines
      }
      if (object.material.emissive) {
        object.material.emissive.setHex(0x000000); // No glow
      }
    }
  });

  // 3. Hide UI elements
  document.getElementById('info-overlay').style.display = 'none';
  document.getElementById('controls-panel').style.backgroundColor = 'white';
  document.getElementById('controls-panel').style.color = 'black';

  // 4. Enable line weight updates
  if (RTPapercut.state.lineWeightEnabled) {
    RTPapercut.updateLineWeights(camera, scene);
  }

  console.log('✅ Print mode enabled');
};

/**
 * Disable print mode: restore original appearance
 */
RTPapercut.disablePrintMode = function(scene, renderer) {
  RTPapercut.state.printModeEnabled = false;

  // 1. Restore black background
  scene.background = new THREE.Color(0x000000);
  renderer.setClearColor(0x000000);

  // 2. Restore original materials
  scene.traverse((object) => {
    if (object.userData.originalMaterial) {
      object.material = object.userData.originalMaterial;
      delete object.userData.originalMaterial;
    }
  });

  // 3. Show UI elements
  document.getElementById('info-overlay').style.display = 'block';
  document.getElementById('controls-panel').style.backgroundColor = '';
  document.getElementById('controls-panel').style.color = '';

  console.log('✅ Print mode disabled');
};
```

### 4.4 Cutplane Implementation

```javascript
/**
 * Update cutplane position and clip geometry
 * @param {number} value - Cutplane position along current axis
 * @param {THREE.Scene} scene
 */
RTPapercut.updateCutplane = function(value, scene) {
  if (!RTPapercut.state.cutplaneEnabled) {
    // Remove clipping planes from all materials
    scene.traverse((object) => {
      if (object.material && object.material.clippingPlanes) {
        object.material.clippingPlanes = [];
      }
    });
    return;
  }

  // 1. Create clipping plane based on current axis
  const normal = new THREE.Vector3();
  if (RTPapercut.state.cutplaneAxis === 'x') {
    normal.set(1, 0, 0);
  } else if (RTPapercut.state.cutplaneAxis === 'y') {
    normal.set(0, 1, 0);
  } else { // 'z'
    normal.set(0, 0, 1);
  }

  const plane = new THREE.Plane(normal, -value);
  RTPapercut.state.cutplaneNormal = plane;

  // 2. Apply clipping plane to all renderable objects
  scene.traverse((object) => {
    if (object.material) {
      object.material.clippingPlanes = [plane];
      object.material.clipShadows = true;
      object.material.needsUpdate = true;
    }
  });

  // 3. Update renderer to enable local clipping
  if (!window.renderer.localClippingEnabled) {
    window.renderer.localClippingEnabled = true;
  }

  // 4. Update slider value display
  const valueDisplay = document.getElementById('cutplaneValue');
  if (valueDisplay) {
    valueDisplay.textContent = value.toFixed(1);
  }

  console.log(`✂️ Cutplane updated: ${RTPapercut.state.cutplaneAxis} = ${value.toFixed(1)}`);
};

/**
 * Update cutplane axis based on camera view
 * @param {string} view - Camera view name (top, front, left, etc.)
 * @private
 */
RTPapercut._updateCutplaneAxisForView = function(view) {
  const axisMap = {
    top: 'z',
    bottom: 'z',
    front: 'y',
    back: 'y',
    left: 'x',
    right: 'x',
    axo: 'z',      // Default to Z for axonometric
    perspective: 'z'
  };

  const newAxis = axisMap[view] || 'z';

  if (newAxis !== RTPapercut.state.cutplaneAxis) {
    RTPapercut.state.cutplaneAxis = newAxis;
    RTPapercut.state.currentView = view;

    // Update slider range based on grid extent
    const range = RTPapercut._getCutplaneRange();
    const slider = document.getElementById('cutplaneSlider');
    if (slider) {
      slider.min = range.min;
      slider.max = range.max;
      slider.value = 0; // Reset to center
      RTPapercut.state.cutplaneValue = 0;
    }

    console.log(`📐 Cutplane axis updated: ${newAxis} (view: ${view})`);
  }
};

/**
 * Get cutplane range based on current grid extent
 * @returns {{min: number, max: number}}
 * @private
 */
RTPapercut._getCutplaneRange = function() {
  const slider = document.getElementById('cartesianTessSlider');
  const divisions = slider ? parseInt(slider.value) : 10;
  const extent = divisions;

  return {
    min: -extent / 2,
    max: extent / 2
  };
};
```

### 4.5 Depth-Based Line Weights

```javascript
/**
 * Update line weights based on distance from camera (LOD)
 * @param {THREE.Camera} camera
 * @param {THREE.Scene} scene
 */
RTPapercut.updateLineWeights = function(camera, scene) {
  if (!RTPapercut.state.printModeEnabled || !RTPapercut.state.lineWeightEnabled) {
    return;
  }

  const minWeight = 0.5;
  const maxWeight = 3.0;

  scene.traverse((object) => {
    // Only process LineSegments and Line objects
    if (object.type === 'LineSegments' || object.type === 'Line') {
      const positions = object.geometry.attributes.position;
      if (!positions) return;

      // Calculate average distance from camera to line
      let totalDistance = 0;
      let count = 0;

      for (let i = 0; i < positions.count; i++) {
        const vertex = new THREE.Vector3(
          positions.getX(i),
          positions.getY(i),
          positions.getZ(i)
        );

        // Transform to world space
        vertex.applyMatrix4(object.matrixWorld);

        // Distance to camera
        const distance = camera.position.distanceTo(vertex);
        totalDistance += distance;
        count++;
      }

      const avgDistance = totalDistance / count;

      // Map distance to line weight (closer = thicker)
      // Assume max distance is ~15 units (camera distance preset)
      const normalizedDistance = Math.min(avgDistance / 15, 1.0);
      const lineWeight = maxWeight - (normalizedDistance * (maxWeight - minWeight));

      // Update material
      if (object.material && object.material.linewidth !== undefined) {
        object.material.linewidth = lineWeight;
        object.material.needsUpdate = true;
      }
    }
  });

  console.log('📏 Line weights updated based on depth');
};
```

### 4.6 SVG Export

```javascript
/**
 * Export current view to SVG for print
 * @param {THREE.Camera} camera
 * @param {THREE.Scene} scene
 */
RTPapercut.exportToSVG = function(camera, scene) {
  // Import THREE.js SVGRenderer dynamically
  // Note: SVGRenderer is in examples/jsm/renderers/SVGRenderer.js

  import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/renderers/SVGRenderer.js')
    .then(({ SVGRenderer }) => {
      const svgRenderer = new SVGRenderer();
      svgRenderer.setSize(window.innerWidth, window.innerHeight);
      svgRenderer.render(scene, camera);

      // Get SVG element
      const svgElement = svgRenderer.domElement;

      // Open in new window for printing
      const svgBlob = new Blob([svgElement.outerHTML], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const printWindow = window.open(svgUrl, '_blank');
      printWindow.onload = function() {
        printWindow.print();
      };

      console.log('📄 SVG export complete - print dialog opened');
    })
    .catch(err => {
      console.error('❌ SVG export failed:', err);
      alert('SVG export requires THREE.js SVGRenderer. Falling back to browser print.');
      window.print(); // Fallback to regular print
    });
};
```

---

## 5. HTML/CSS Changes

### 5.1 New UI Elements in index.html

**Location**: Papercut section (around line 1150)

```html
<!-- ========================================
     SECTION 7: PAPERCUT (PRINT MODE)
     ======================================== -->
<div class="control-group">
  <h3>
    <span class="section-toggle collapsed" data-target="papercut-section"></span>
    Papercut
  </h3>
  <div id="papercut-section" class="section-content collapsed">

    <!-- Enable Print Mode -->
    <div class="control-item">
      <label class="checkbox-label">
        <input type="checkbox" id="enablePrintMode" />
        Enable Print Mode
      </label>
      <p class="info-text">White background, dark lines, optimized for print</p>
    </div>

    <!-- Enable Cut Plane -->
    <div class="control-item">
      <label class="checkbox-label">
        <input type="checkbox" id="enableCutPlane" />
        Enable Cut Plane
      </label>
    </div>

    <!-- Cutplane Slider (dynamically injected by rt-papercut.js) -->
    <div id="cutplane-slider-container"></div>

    <!-- Line Weight Controls -->
    <div class="control-item">
      <label class="checkbox-label">
        <input type="checkbox" id="enableLineWeights" checked />
        Depth-Based Line Weights
      </label>
    </div>

    <div class="control-item">
      <label class="label-subsection">Min/Max Line Weight</label>
      <div class="slider-container">
        <input type="range" id="lineWeightMin" min="0.1" max="2.0" step="0.1" value="0.5" />
        <span class="slider-value" id="lineWeightMinValue">0.5</span>
      </div>
      <div class="slider-container">
        <input type="range" id="lineWeightMax" min="1.0" max="5.0" step="0.1" value="3.0" />
        <span class="slider-value" id="lineWeightMaxValue">3.0</span>
      </div>
    </div>

    <!-- Export to SVG/Print -->
    <div class="control-item">
      <label class="label-section">Export</label>
      <div class="toggle-btn-group">
        <button class="toggle-btn variant-standard" id="exportSVG">
          Export SVG
        </button>
        <button class="toggle-btn variant-standard" id="browserPrint">
          Print (Browser)
        </button>
      </div>
    </div>

    <!-- Print Extents (A4, Letter, etc.) - FUTURE -->
    <div class="control-item">
      <label class="label-section">Print Extents</label>
      <div class="button-grid-2col">
        <button class="toggle-btn variant-standard" id="fitA4" disabled>A4</button>
        <button class="toggle-btn variant-standard" id="fitLetter" disabled>Letter</button>
        <button class="toggle-btn variant-standard" id="fitA3" disabled>A3</button>
        <button class="toggle-btn variant-standard" id="fitCustom" disabled>Custom</button>
      </div>
      <p class="info-text">Page size helpers - Coming soon</p>
    </div>

  </div>
</div>
```

### 5.2 CSS Additions (art.css)

```css
/* Papercut Print Mode Overrides */
body.print-mode {
  background-color: #ffffff !important;
}

body.print-mode #controls-panel {
  background-color: #ffffff;
  color: #000000;
  border-color: #cccccc;
}

body.print-mode .control-group h3,
body.print-mode .label-section,
body.print-mode .label-subsection {
  color: #000000;
}

/* Cutplane Visual Indicator */
.cutplane-indicator {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 16px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 100;
}

/* Print-specific styles */
@media print {
  #controls-panel,
  #info-overlay,
  .cutplane-indicator {
    display: none !important;
  }

  #canvas-container {
    width: 100% !important;
    height: 100% !important;
  }
}
```

---

## 6. Implementation Phases

### Phase 1: Core Papercut Module (Day 1)
**Estimated Effort**: 4-6 hours

1. ✅ Create `src/geometry/modules/rt-papercut.js`
2. ✅ Implement print mode toggle (white background, dark materials)
3. ✅ Add UI controls to Papercut section in `index.html`
4. ✅ Wire up initialization in `rt-init.js`
5. ✅ Test print mode toggle

**Success Criteria**:
- Checkbox toggles black/white background
- Materials update to print-optimized colors
- UI remains functional in both modes

### Phase 2: Cutplane Implementation (Day 1-2)
**Estimated Effort**: 6-8 hours

1. ✅ Implement cutplane slider UI (dynamic range based on grid extent)
2. ✅ Add cutplane logic using THREE.Plane and material clipping
3. ✅ Wire up camera view listeners to update cutplane axis
4. ✅ Add optional visual cutplane indicator (semi-transparent grid)
5. ✅ Test cutplane in all 6 orthographic views

**Success Criteria**:
- Slider correctly clips geometry along current view axis
- Range updates when grid extent changes
- Cutplane axis updates when view changes
- No performance degradation

### Phase 3: Depth-Based Line Weights (Day 2)
**Estimated Effort**: 4-6 hours

1. ✅ Implement `updateLineWeights()` function
2. ✅ Add debounced camera movement listener
3. ✅ Test with various polyhedra and geodesics
4. ✅ Add min/max weight sliders to UI
5. ✅ Optimize performance (limit updates to visible geometry)

**Success Criteria**:
- Lines visibly thicken when closer to camera
- No jitter or performance issues during orbit
- Weight ranges are aesthetically pleasing

### Phase 4: SVG Export & Browser Print (Day 2-3)
**Estimated Effort**: 4-6 hours

1. ✅ Implement SVG export using THREE.SVGRenderer
2. ✅ Add "Export SVG" button
3. ✅ Add "Print (Browser)" button (leverages native print)
4. ✅ Test print output quality
5. ✅ Document workflow in user guide

**Success Criteria**:
- SVG export opens in new window with print dialog
- Browser print produces acceptable output
- Line weights and cutplane respected in output

### Phase 5: Polish & Documentation (Day 3)
**Estimated Effort**: 2-4 hours

1. ✅ Add keyboard shortcuts (Ctrl+P for print mode toggle)
2. ✅ Add tooltips/help text to Papercut controls
3. ✅ Update ARTexplorer.md with Papercut section
4. ✅ Create user guide with examples
5. ✅ Test across browsers (Chrome, Firefox, Safari)

---

## 7. Code Integration Points

### 7.1 rt-init.js Modifications

**Location**: After line 3800 (end of initialization)

```javascript
// Import Papercut module
import { RTPapercut } from './modules/rt-papercut.js';

// Initialize Papercut (after scene, camera, renderer are ready)
RTPapercut.init(scene, camera, renderer);

// Add camera movement listener for line weight updates
let lineWeightUpdateTimeout;
controls.addEventListener('change', () => {
  if (RTPapercut.state.printModeEnabled && RTPapercut.state.lineWeightEnabled) {
    clearTimeout(lineWeightUpdateTimeout);
    lineWeightUpdateTimeout = setTimeout(() => {
      RTPapercut.updateLineWeights(camera, scene);
    }, 150); // Debounce 150ms
  }
});

// Add to global window object for debugging
window.RTPapercut = RTPapercut;
```

### 7.2 index.html Script Imports

**Location**: Bottom of `<body>`, after existing script tags

```html
<!-- Papercut Module -->
<script type="module">
  import { RTPapercut } from './modules/rt-papercut.js';

  // Export button listeners
  document.getElementById('exportSVG').addEventListener('click', () => {
    RTPapercut.exportToSVG(window.camera, window.scene);
  });

  document.getElementById('browserPrint').addEventListener('click', () => {
    window.print();
  });

  // Line weight slider listeners
  document.getElementById('lineWeightMin').addEventListener('input', (e) => {
    RTPapercut.state.lineWeightMin = parseFloat(e.target.value);
    document.getElementById('lineWeightMinValue').textContent = e.target.value;
    RTPapercut.updateLineWeights(window.camera, window.scene);
  });

  document.getElementById('lineWeightMax').addEventListener('input', (e) => {
    RTPapercut.state.lineWeightMax = parseFloat(e.target.value);
    document.getElementById('lineWeightMaxValue').textContent = e.target.value;
    RTPapercut.updateLineWeights(window.camera, window.scene);
  });
</script>
```

---

## 8. Testing Plan

### 8.1 Unit Tests
- [ ] Print mode toggle (black ↔ white background)
- [ ] Material color updates (bright ↔ dark)
- [ ] Cutplane range calculation (grid extent changes)
- [ ] Cutplane axis update (view changes)
- [ ] Line weight calculation (distance to camera)

### 8.2 Integration Tests
- [ ] Cutplane + geodesic subdivision (complex geometry)
- [ ] Line weights + camera orbit (performance)
- [ ] Print mode + gumball selection (UI interaction)
- [ ] SVG export + cutplane (correct clipping in output)

### 8.3 Manual Tests
- [ ] Print to PDF in Chrome, Firefox, Safari
- [ ] SVG export quality (vector lines, no rasterization)
- [ ] Cutplane in all 6 orthographic views
- [ ] Line weights visible at various zoom levels
- [ ] UI responsiveness (slider feedback, checkbox states)

---

## 9. Performance Considerations

### 9.1 Line Weight Updates
**Challenge**: Updating line weights on every camera move is expensive.

**Solution**:
- Debounce updates (150ms delay after camera stops moving)
- Only update visible geometry (frustum culling)
- Cache distance calculations per frame
- Option to disable line weights for complex scenes

### 9.2 Cutplane Clipping
**Challenge**: THREE.Plane clipping is GPU-based but requires material updates.

**Solution**:
- Apply clipping plane to materials once, not every frame
- Only update when cutplane slider value changes
- Use `material.needsUpdate = true` sparingly

### 9.3 SVG Export
**Challenge**: SVGRenderer is slow for complex scenes (1000+ lines).

**Solution**:
- Warn user if scene has >2000 line segments
- Offer fallback to browser print (faster, rasterized output)
- Consider WebGL screenshot + overlay SVG labels (hybrid approach)

---

## 10. Future Enhancements (Post-MVP)

### 10.1 Advanced Cutplane Features
- [ ] **Dual Cutplanes**: Top and bottom cutplanes (sandwich clip)
- [ ] **Angled Cutplanes**: Cutplane rotation for axo/perspective views
- [ ] **Cutplane Interpolation**: Animate cutplane sweeping through geometry
- [ ] **Boolean Operations**: Union/Intersection/Difference of multiple cutplanes

### 10.2 Enhanced SVG Export
- [ ] **Layer Separation**: Export edges, faces, nodes as separate SVG groups
- [ ] **Stroke Dashing**: Dashed lines for hidden edges (architectural convention)
- [ ] **Dimension Annotations**: Auto-generate dimension lines from geometry
- [ ] **Scale Bar**: Embedded scale indicator in SVG

### 10.3 Print Templates
- [ ] **Title Block**: Customizable project info (name, date, scale)
- [ ] **Border Margins**: A4/Letter/A3 preset margins
- [ ] **Multi-View Layout**: Export 4 views on single page (Top/Front/Left/Axo)

### 10.4 Material Overrides
- [ ] **Hatch Patterns**: Fill faces with architectural hatch patterns
- [ ] **Color by Property**: Color code geometry by vertex count, symmetry, etc.
- [ ] **Transparency Control**: Adjust face opacity for X-ray views

---

## 11. Known Limitations

### 11.1 THREE.js Line Weights
**Issue**: `LineBasicMaterial.linewidth` is not supported in WebGL (only value of 1.0).

**Workaround**:
- Use `THREE.Line2` from `examples/jsm/lines/Line2.js` (supports variable line widths)
- Or accept constant line width in WebGL, rely on SVG export for variable weights

**Decision**: Start with constant line width (1.0), add Line2 support in Phase 3 if needed.

### 11.2 Browser Print Limitations
**Issue**: Browser print is rasterized (not vector), quality depends on zoom level.

**Workaround**:
- Encourage users to use SVG export for high-quality output
- Document recommended zoom levels for browser print (e.g., fit to page width)

### 11.3 Cutplane Edge Generation
**Issue**: THREE.Plane clips geometry but doesn't generate new edges at cut boundary.

**Workaround**:
- Accept open edges for MVP
- Future enhancement: Use CSG (Constructive Solid Geometry) library to generate cap faces

---

## 12. Git Workflow

### 12.1 Branching Strategy

**Option A: New Branch from Fold-Space (Recommended)**
```bash
git checkout Fold-Space
git pull origin Fold-Space
git checkout -b Papercut
```

**Option B: Continue on Fold-Space**
```bash
git checkout Fold-Space
# Implement Papercut features directly
```

**Recommendation**: Use **Option A** (new branch) to keep Fold-Space stable while Papercut is in development.

### 12.2 Commit Strategy

Commit after each phase:
1. `feat(papercut): Add print mode toggle and white background`
2. `feat(papercut): Implement cutplane with dynamic slider`
3. `feat(papercut): Add depth-based line weights`
4. `feat(papercut): Add SVG export and browser print`
5. `docs(papercut): Update ARTexplorer.md with Papercut section`

### 12.3 Merge Strategy

Once Papercut is stable:
```bash
git checkout Fold-Space
git merge Papercut --no-ff
git push origin Fold-Space

# Then merge to main when ready
git checkout main
git merge Fold-Space --no-ff
git push origin main
```

---

## 13. Success Metrics

### 13.1 Functional Goals
- ✅ Print mode toggle works reliably
- ✅ Cutplane clips geometry correctly in all 6 orthographic views
- ✅ Line weights visually differentiate foreground/background geometry
- ✅ SVG export produces vector output (no rasterization)
- ✅ Browser print is acceptable quality (min 150 DPI equivalent)

### 13.2 Performance Goals
- ✅ Print mode toggle: < 100ms
- ✅ Cutplane update: < 50ms (for scenes with <1000 objects)
- ✅ Line weight update: < 200ms (debounced)
- ✅ SVG export: < 5s (for scenes with <500 lines)

### 13.3 Usability Goals
- ✅ User can produce print-ready output in < 5 clicks
- ✅ Cutplane slider provides real-time visual feedback
- ✅ Print output matches on-screen preview (WYSIWYG)

---

## 14. Questions & Decisions

### 14.1 Open Questions
1. **Line Weight Range**: Should we support custom min/max via sliders or use fixed presets (Thin/Medium/Thick)?
   - **Decision**: Start with sliders (more flexible), consider presets in future.

2. **Cutplane Visual**: Should the cutplane itself be visible (semi-transparent grid) or invisible?
   - **Decision**: Make it optional via checkbox ("Show Cutplane Grid").

3. **SVG Fallback**: If SVGRenderer fails, should we fallback to canvas screenshot or abort?
   - **Decision**: Fallback to `window.print()` (browser print), notify user via console/alert.

4. **Print Mode Default**: Should Print Mode automatically switch to orthographic view?
   - **Decision**: No, let user choose view. Print mode only affects colors/background.

### 14.2 Resolved Decisions
- ✅ **Module Location**: `src/geometry/modules/rt-papercut.js` (consistent with existing modules)
- ✅ **UI Location**: Papercut section in `index.html` (already exists, currently disabled)
- ✅ **Cutplane Axis**: Auto-update based on camera view (Top=Z, Front=Y, Left=X)
- ✅ **Grid Extent**: Use existing Cartesian grid extent (no new configuration needed)
- ✅ **Line Weight Method**: Start with constant width (1.0), upgrade to Line2 if needed

---

## 15. References & Resources

### 15.1 THREE.js Documentation
- [THREE.Plane](https://threejs.org/docs/#api/en/math/Plane) - Clipping plane math
- [Material.clippingPlanes](https://threejs.org/docs/#api/en/materials/Material.clippingPlanes) - Material clipping
- [SVGRenderer](https://threejs.org/docs/#examples/en/renderers/SVGRenderer) - Vector export
- [Line2](https://threejs.org/docs/#examples/en/lines/Line2) - Variable line widths

### 15.2 Existing Codebase References
- `src/geometry/rt-init.js:1632-1722` - Camera view presets
- `src/geometry/rt-init.js:260-307` - Grid extent calculation
- `src/geometry/modules/rt-rendering.js` - Rendering utilities
- `src/geometry/modules/rt-state-manager.js` - State management patterns
- `docs/development/Geometry documents/ARTexplorer.md` - Main documentation

### 15.3 Architectural References
- [Architectural Line Weights](https://www.archisoup.com/line-weights) - Standard conventions
- [Section Cut Conventions](https://www.archtoolbox.com/representation/architectural-drawings/sections.html) - Cut plane visualization

---

## Appendix A: File Checklist

### Files to Create
- [ ] `src/geometry/modules/rt-papercut.js` (new module)

### Files to Modify
- [ ] `src/geometry/index.html` (enable Papercut UI controls)
- [ ] `src/geometry/rt-init.js` (import and initialize Papercut module)
- [ ] `src/geometry/art.css` (add print mode styles)
- [ ] `docs/development/Geometry documents/ARTexplorer.md` (add Papercut section)

### Files to Reference (no changes)
- `src/geometry/modules/rt-rendering.js`
- `src/geometry/modules/rt-state-manager.js`
- `src/geometry/modules/rt-math.js`

---

## Appendix B: Code Snippets Reference

### B.1 Import Statement (rt-init.js)
```javascript
import { RTPapercut } from './modules/rt-papercut.js';
```

### B.2 Initialization Call (rt-init.js)
```javascript
// After scene, camera, renderer are ready (line ~3800)
RTPapercut.init(scene, camera, renderer);
```

### B.3 Debounced Camera Listener (rt-init.js)
```javascript
let lineWeightUpdateTimeout;
controls.addEventListener('change', () => {
  if (RTPapercut.state.printModeEnabled && RTPapercut.state.lineWeightEnabled) {
    clearTimeout(lineWeightUpdateTimeout);
    lineWeightUpdateTimeout = setTimeout(() => {
      RTPapercut.updateLineWeights(camera, scene);
    }, 150);
  }
});
```

### B.4 Print Mode Toggle (HTML Button)
```html
<input type="checkbox" id="enablePrintMode" />
```

### B.5 Cutplane Slider (HTML)
```html
<input type="range" id="cutplaneSlider" min="-12" max="12" step="0.1" value="0" />
```

---

**Document Status**: ✅ READY FOR IMPLEMENTATION
**Next Action**: Review with team, then create `Papercut` branch and begin Phase 1
**Estimated Total Effort**: 20-30 hours across 3 days
