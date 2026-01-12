# Color Theory Modal Integration - Workplan

**Status**: Planning
**Branch**: `Colour-Theory` (current)
**Goal**: Integrate color-theory-test.html as a modal feature in ART Explorer
**Reference Architecture**: [Geometry README](./README.md)

---

## Overview

Transform the standalone `color-theory-test.html` into an integrated modal feature matching the architecture of existing math demos (RT Cross, RT Spread). This will allow real-time color calibration while viewing the 3D scene underneath.

---

## Phase 1: CSS Extraction & Consolidation

### 1.1 Extract Reusable Styles to art.css
**File**: `src/geometry/art.css`

Extract and consolidate color theory styles into new CSS sections:

```css
/* ========================================================================
   COLOR THEORY MODAL
   ======================================================================== */

/* Color theory modal overlay (matches demo modal pattern) */
#color-theory-modal-overlay {
  /* Similar to #info-modal-overlay but full-screen */
}

#color-theory-modal {
  /* Wide modal like demo modals (1200px+) */
  /* Semi-transparent background to see scene underneath */
}

/* Color swatch components */
.color-swatch-container { }
.color-swatch { }
.color-label { }
.color-input-group { }
.color-picker-btn { }

/* Brightness comparison bars */
.brightness-comparison { }
.brightness-swatch { }

/* Export section */
.color-export-section { }
.color-code-output { }
```

**Key Changes from Standalone HTML**:
- Reduce swatch heights from 80px → 40px (compact squares)
- Adjust grid layouts for modal width constraints
- Match existing modal blur/transparency patterns
- Reuse existing button/slider/input styles where possible

---

## Phase 2: JavaScript Module Creation

### 2.1 Create color-theory-modal.js
**File**: `src/geometry/modules/color-theory-modal.js`

**Architecture Pattern**: Follow `rt-cross-demo.js` structure

```javascript
/**
 * color-theory-modal.js
 * Color Theory Calibration Tool - Modal Integration
 *
 * Interactive color picker for adjusting polyhedra colors with
 * real-time preview and backface culling brightness compensation.
 *
 * @requires THREE.js
 * @requires rt-rendering.js (for color updates)
 */

export class ColorTheoryModal {
  constructor() {
    this.overlay = null;
    this.modal = null;
    this.colorData = [ /* ... color definitions ... */ ];
    this.isOpen = false;
  }

  /**
   * Initialize modal structure and event listeners
   */
  init() {
    this.createModalStructure();
    this.attachEventListeners();
  }

  /**
   * Open the color theory modal
   */
  open() {
    if (!this.overlay) this.init();
    this.overlay.classList.remove('hidden');
    this.isOpen = true;
    this.refreshColorValues(); // Read current rt-rendering.js colors
  }

  /**
   * Close the modal
   */
  close() {
    this.overlay.classList.add('hidden');
    this.isOpen = false;
  }

  /**
   * Create modal DOM structure (matches demo modal pattern)
   */
  createModalStructure() {
    // Build overlay + modal container
    // Add color swatches grid
    // Add global opacity/brightness controls
    // Add export section
  }

  /**
   * Refresh color swatches with current rt-rendering.js values
   */
  refreshColorValues() {
    // Read colors from rt-rendering.js module
    // Update swatch displays
  }

  /**
   * Apply selected colors to scene (live preview)
   */
  applyColors() {
    // Call rt-rendering.js update functions
    // Trigger scene re-render
  }

  /**
   * Export color values as code snippet
   */
  exportColors() {
    // Generate code output (same as standalone HTML)
    // Copy to clipboard option
  }

  /**
   * Handle color picker input
   */
  handleColorChange(id, hexValue) {
    // Update internal color data
    // Update swatch display
    // Call applyColors() for live preview
  }
}

// Export singleton instance
export const colorTheoryModal = new ColorTheoryModal();
```

**Key Features**:
- **Live Preview**: Colors apply to scene in real-time (no page reload)
- **Compact UI**: Smaller swatches (40px squares) for modal constraints
- **Two-Way Sync**: Reads current colors from rt-rendering.js on open
- **Export Code**: Generates copy-paste color values (like standalone)

---

## Phase 3: UI Integration

### 3.1 Add Control Panel Button
**File**: `src/geometry/art.html`

Add button in "Developer Tools" section (after existing demo buttons):

```html
<!-- Developer Tools Section -->
<div class="control-group">
  <h3>
    <span class="section-toggle" data-section="dev-tools"></span>
    Developer Tools
  </h3>
  <div class="section-content" id="dev-tools-section">

    <!-- Existing demos -->
    <button id="openRTCrossDemo">RT Cross Demo</button>
    <button id="openRTSpreadDemo">RT Spread Demo</button>

    <!-- NEW: Color Theory Tool -->
    <button id="openColorTheoryModal">
      🎨 Color Theory Calibration
    </button>

  </div>
</div>
```

### 3.2 Wire Up Button in rt-init.js
**File**: `src/geometry/modules/rt-init.js`

```javascript
import { colorTheoryModal } from './color-theory-modal.js';

// In initialization function:
document.getElementById('openColorTheoryModal')?.addEventListener('click', () => {
  colorTheoryModal.open();
});
```

---

## Phase 4: Integration with rt-rendering.js

### 4.1 Expose Color Update API
**File**: `src/geometry/modules/rt-rendering.js`

Add public API for color updates:

```javascript
/**
 * Update polyhedron color and re-render
 * @param {string} polyhedronType - e.g., 'cube', 'tetrahedron'
 * @param {number} color - Hex color (e.g., 0xFF9300)
 */
export function updatePolyhedronColor(polyhedronType, color) {
  // Update internal color mapping
  // Trigger updateGeometry() to re-render
}

/**
 * Get current color for a polyhedron type
 * @param {string} polyhedronType
 * @returns {number} Current hex color
 */
export function getPolyhedronColor(polyhedronType) {
  // Return current color value
}

/**
 * Get all current colors as exportable object
 * @returns {Object} Color mapping
 */
export function exportColorPalette() {
  return {
    cube: 0x0433FF,
    cubeMatrix: 0x00FDFF,
    tetrahedron: 0xFFFB00,
    // ... all colors
  };
}
```

### 4.2 Color Theory Modal Calls API
**File**: `src/geometry/modules/color-theory-modal.js`

```javascript
import { updatePolyhedronColor, getPolyhedronColor, exportColorPalette } from './rt-rendering.js';

// In handleColorChange():
handleColorChange(id, hexValue) {
  const polyType = this.getPolyTypeFromId(id); // 'cube', 'tetrahedron', etc.
  updatePolyhedronColor(polyType, parseInt(hexValue.replace('0x', ''), 16));
  // Scene automatically re-renders via rt-rendering.js
}

// In refreshColorValues():
refreshColorValues() {
  const palette = exportColorPalette();
  Object.keys(palette).forEach(key => {
    this.updateSwatchDisplay(key, palette[key]);
  });
}
```

---

## Phase 5: Modal Layout Design

### 5.1 Compact Grid Layout

**Modal Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│ Color Theory Calibration Tool                      [Close X]│
├─────────────────────────────────────────────────────────────┤
│ Global Controls (Opacity + Brightness sliders)              │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┬─────────────────────┬─────────────┐ │
│ │ Platonic Solids     │ Dual Polyhedra      │ Archimedean │ │
│ │                     │                     │             │ │
│ │ [Cube] [Matrix]     │ [Dual Tetra] [Geo]  │ [Cubocta]   │ │
│ │ [Tetra] [Geodesic]  │ [Dual Icosa] [Geo]  │ [Rhombic]   │ │
│ │ [Octa] [Geodesic]   │                     │             │ │
│ │ [Icosa] [Geodesic]  │                     │             │ │
│ │ [Dodeca]            │                     │             │ │
│ └─────────────────────┴─────────────────────┴─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Export Section                                               │
│ [Generate Code] [Copy to Clipboard]                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ // Generated color values...                            │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Compact Swatch Design** (40px × 40px squares):
```
┌────────────────────┐
│ Label: Cube        │
├──────┬─────────────┤
│ [■]  │ 0x0433FF    │  ← Color picker button + hex input
└──────┴─────────────┘
```

---

## Phase 6: Testing & Refinement

### 6.1 Test Cases
- [ ] Modal opens/closes smoothly
- [ ] Scene visible underneath (semi-transparent modal)
- [ ] Color changes apply in real-time
- [ ] Opacity slider affects all swatches
- [ ] Brightness slider simulates backface culling loss
- [ ] Export code generates correct format
- [ ] Copy to clipboard works
- [ ] Keyboard shortcuts (ESC to close)

### 6.2 Performance Checks
- [ ] No lag when changing colors (debounce if needed)
- [ ] Modal doesn't block scene rendering
- [ ] Color updates don't cause memory leaks

---

## Phase 7: Documentation

### 7.1 Update Geometry README
**File**: `docs/development/Geometry documents/README.md`

Add section under "Developer Tools":

```markdown
### Color Theory Calibration Tool

Interactive color picker for adjusting polyhedra colors with backface culling
brightness compensation.

**Features**:
- Live preview with 3D scene visible underneath
- Opacity/brightness controls for testing transparency
- Export code snippet for manual updates
- macOS color picker integration

**Usage**:
1. Open via "Developer Tools" → "Color Theory Calibration"
2. Adjust colors using color picker squares
3. Test at different opacity/brightness levels
4. Export code or apply directly to scene

**Technical**:
- Module: `src/geometry/modules/color-theory-modal.js`
- Styles: `src/geometry/art.css` (Color Theory Modal section)
- Integration: `rt-init.js` → `rt-rendering.js` API
```

### 7.2 Add Comments to color-theory-modal.js
Document all public methods with JSDoc format (matching rt-rendering.js style).

---

## Implementation Checklist

### Phase 1: CSS Extraction
- [ ] Extract color theory styles from standalone HTML
- [ ] Add to art.css under "COLOR THEORY MODAL" section
- [ ] Adjust dimensions for compact modal layout (80px → 40px swatches)
- [ ] Test styles in isolation

### Phase 2: JavaScript Module
- [ ] Create `color-theory-modal.js` file
- [ ] Implement ColorTheoryModal class (constructor, init, open, close)
- [ ] Port color data structure from standalone HTML
- [ ] Implement createModalStructure()
- [ ] Implement color swatch generation logic
- [ ] Add global opacity/brightness controls
- [ ] Implement export functionality

### Phase 3: UI Integration
- [ ] Add button to art.html (Developer Tools section)
- [ ] Import module in rt-init.js
- [ ] Wire up button event listener
- [ ] Test modal open/close

### Phase 4: rt-rendering.js API
- [ ] Add updatePolyhedronColor() function
- [ ] Add getPolyhedronColor() function
- [ ] Add exportColorPalette() function
- [ ] Test API with manual calls

### Phase 5: Two-Way Integration
- [ ] Color modal calls rt-rendering.js API
- [ ] Live preview updates scene
- [ ] Modal reads current colors on open
- [ ] Test round-trip (read → modify → apply)

### Phase 6: Testing
- [ ] All test cases from Phase 6.1
- [ ] Performance checks from Phase 6.2
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

### Phase 7: Documentation
- [ ] Update Geometry README
- [ ] Add JSDoc comments to color-theory-modal.js
- [ ] Update this workplan with "COMPLETED" status

---

## Future Enhancements (Post-MVP)

1. **Color Presets**: Save/load color schemes (e.g., "High Contrast", "Pastel")
2. **Undo/Redo**: Color change history
3. **Real-time Contrast Analysis**: Warn if colors too similar (accessibility)
4. **Color Harmony Suggestions**: Auto-suggest complementary colors
5. **Persistent Storage**: Save custom colors to localStorage
6. **Export Formats**: CSS variables, JSON, THREE.js code snippets

---

## Success Criteria

✅ **Phase Complete When**:
- Modal opens from Developer Tools button
- All polyhedra colors editable via compact UI
- Live preview works without lag
- Export generates correct code format
- Modal matches existing demo architecture
- Documentation updated in Geometry README

---

## Notes

- **Architecture Consistency**: Follow RT Cross Demo pattern exactly
- **No Standalone File**: color-theory-test.html remains for reference only
- **Color Source of Truth**: rt-rendering.js holds all color values
- **Modal Transparency**: User can see 3D scene changes underneath
- **Keyboard Shortcuts**: ESC to close (matches info modal)

---

**Created**: 2026-01-11
**Author**: Andy & Claude
**Related Files**:
- Reference: `src/geometry/color-theory-test.html` (standalone prototype)
- Modal: `src/geometry/modules/color-theory-modal.js` (to be created)
- Styles: `src/geometry/art.css` (COLOR THEORY MODAL section)
- Integration: `src/geometry/modules/rt-init.js`
- API: `src/geometry/modules/rt-rendering.js`
