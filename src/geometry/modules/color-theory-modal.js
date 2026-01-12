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
    this.isOpen = false;
    this.renderingAPI = null; // Will be set by rt-init.js

    // Color data structure (preserving current rt-rendering.js colors)
    this.colorData = [
      {
        section: "Platonic Solids - Base & Geodesic (Complementary Colors)",
        groups: [
          {
            name: "Cube (Blue)",
            pairs: [
              { id: 'cube', label: 'Base Solid', color: '0x0433FF' },
              { id: 'cube-matrix', label: 'Matrix Color', color: '0x00FDFF' }
            ]
          },
          {
            name: "Tetrahedron (Yellow) ↔ Geodesic Tetrahedron (Cyan)",
            pairs: [
              { id: 'tetra', label: 'Base Solid', color: '0xFFFB00' },
              { id: 'tetra-geodesic', label: 'Geodesic', color: '0x00FDFF' }
            ]
          },
          {
            name: "Octahedron (Green) ↔ Geodesic Octahedron (Magenta)",
            pairs: [
              { id: 'octa', label: 'Base Solid', color: '0x00F900' },
              { id: 'octa-geodesic', label: 'Geodesic', color: '0xFF40FF' }
            ]
          },
          {
            name: "Icosahedron (Cyan) ↔ Geodesic Icosahedron (Orange)",
            pairs: [
              { id: 'icosa', label: 'Base Solid', color: '0x00FDFF' },
              { id: 'icosa-geodesic', label: 'Geodesic', color: '0xFF9300' }
            ]
          },
          {
            name: "Dodecahedron (Yellow)",
            pairs: [
              { id: 'dodeca', label: 'Base Solid', color: '0xFFFB00' },
              { id: 'dodeca-geodesic', label: 'Future Geodesic?', color: '0x0088ff' }
            ]
          }
        ]
      },
      {
        section: "Dual Polyhedra (Reciprocal Complementary Colors)",
        groups: [
          {
            name: "Dual Tetrahedron (Magenta) ↔ Geodesic Dual Tetra (Yellow)",
            pairs: [
              { id: 'dual-tetra', label: 'Dual Solid', color: '0xFF40FF' },
              { id: 'dual-tetra-geodesic', label: 'Geodesic Dual', color: '0xFFFB00' }
            ]
          },
          {
            name: "Dual Icosahedron (Orange) ↔ Geodesic Dual Icosa (Cyan)",
            pairs: [
              { id: 'dual-icosa', label: 'Dual Solid', color: '0xFF9300' },
              { id: 'dual-icosa-geodesic', label: 'Geodesic Dual', color: '0x00FDFF' }
            ]
          }
        ]
      },
      {
        section: "Archimedean & Space-Filling Polyhedra",
        groups: [
          {
            name: "Cuboctahedron",
            pairs: [
              { id: 'cubocta', label: 'Solid & Matrix', color: '0x00F900' }
            ]
          },
          {
            name: "Rhombic Dodecahedron",
            pairs: [
              { id: 'rhombic', label: 'Solid & Matrix', color: '0xff9900' }
            ]
          }
        ]
      }
    ];

    // Mapping from modal color IDs to rt-rendering polyhedron types
    this.colorIdToPolyType = {
      'cube': 'cube',
      'cube-matrix': 'cubeMatrix',
      'tetra': 'tetrahedron',
      'tetra-geodesic': 'geodesicTetrahedron',
      'dual-tetra': 'dualTetrahedron',
      'dual-tetra-geodesic': 'geodesicDualTetrahedron',
      'octa': 'octahedron',
      'octa-geodesic': 'geodesicOctahedron',
      'icosa': 'icosahedron',
      'icosa-geodesic': 'geodesicIcosahedron',
      'dodeca': 'dodecahedron',
      'dual-icosa': 'dualIcosahedron',
      'dual-icosa-geodesic': 'geodesicDualIcosahedron',
      'cubocta': 'cuboctahedron',
      'rhombic': 'rhombicDodecahedron',
    };
  }

  /**
   * Set the rendering API reference (called by rt-init.js)
   * @param {Object} api - Rendering API object from rt-rendering.js
   */
  setRenderingAPI(api) {
    this.renderingAPI = api;

    // Try to restore colors from localStorage on initialization
    this.restoreColorsFromLocalStorage();
  }

  /**
   * Restore colors from localStorage (if available)
   */
  restoreColorsFromLocalStorage() {
    if (!this.renderingAPI) return;

    const savedPalette = this.loadFromLocalStorage();
    if (savedPalette) {
      console.log('✅ Restoring color palette from localStorage');

      // Apply each color from the saved palette
      Object.keys(savedPalette).forEach(polyType => {
        this.renderingAPI.updatePolyhedronColor(polyType, savedPalette[polyType]);
      });

      // Save to StateManager
      if (window.RTStateManager) {
        window.RTStateManager.setColorPalette(savedPalette);
      }
    }
  }

  /**
   * Initialize modal structure and event listeners
   */
  init() {
    if (this.overlay) return; // Already initialized
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
    if (this.overlay) {
      this.overlay.classList.add('hidden');
    }
    this.isOpen = false;
  }

  /**
   * Create modal DOM structure (matches demo modal pattern)
   */
  createModalStructure() {
    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.id = 'color-theory-modal';
    this.overlay.className = 'hidden';

    // Create modal content container
    const modalContent = document.createElement('div');
    modalContent.className = 'color-theory-modal-content';

    // Create modal header
    const header = document.createElement('div');
    header.className = 'color-theory-modal-header';
    header.innerHTML = `
      <div>
        <h2>Color Theory Calibration Tool</h2>
        <div class="color-theory-modal-subtitle">Backface Culling Brightness Compensation - Interactive Color Calibration</div>
      </div>
      <button class="close-modal" id="color-theory-close">×</button>
    `;

    // Create modal body
    const body = document.createElement('div');
    body.className = 'color-theory-modal-body';

    // Add info box
    body.innerHTML += `
      <div class="color-info-box">
        <strong>Context:</strong> With backface culling enabled (proper single-sided rendering), we've eliminated the 30-40% brightness boost from accidental double-rendering (front + back faces overlapping). This tool helps calibrate color values to maintain visual "pop" and intensity.
        <br><br>
        <strong>How to Use:</strong> Click the colored square next to each hex input to open your system color picker. Select colors that work well at both full opacity (1.0) and the default (0.35). The hex values will update automatically.
      </div>
    `;

    // Add global controls
    body.innerHTML += `
      <div class="color-global-controls">
        <h3>Global Opacity Control</h3>
        <div class="slider-group">
          <label class="slider-label">Face Opacity (simulates 3D transparency)</label>
          <div class="slider-container">
            <input type="range" id="colorTheoryGlobalOpacity" min="0" max="1" step="0.01" value="0.35">
            <span class="slider-value" id="colorTheoryGlobalOpacityValue">0.35</span>
          </div>
        </div>
        <div class="slider-group">
          <label class="slider-label">Brightness Multiplier (simulate backface culling loss)</label>
          <div class="slider-container">
            <input type="range" id="colorTheoryBrightnessMult" min="0.5" max="2" step="0.05" value="1">
            <span class="slider-value" id="colorTheoryBrightnessMultValue">1.00×</span>
          </div>
        </div>
      </div>
    `;

    // Add color sections container
    const sectionsContainer = document.createElement('div');
    sectionsContainer.id = 'color-theory-sections';
    this.generateColorSections(sectionsContainer);
    body.appendChild(sectionsContainer);

    // Add export section
    body.innerHTML += `
      <div class="color-export-section">
        <h3>Export Updated Color Values</h3>
        <button class="toggle-btn variant-standard" id="colorTheoryExportBtn">Generate rt-rendering.js Color Updates</button>
        <div class="color-code-output" id="colorTheoryCodeOutput">Click "Generate" to see JavaScript code with updated color values...</div>
      </div>
    `;

    // Assemble modal
    modalContent.appendChild(header);
    modalContent.appendChild(body);
    this.overlay.appendChild(modalContent);

    // Add to document
    document.body.appendChild(this.overlay);

    this.modal = modalContent;
  }

  /**
   * Generate color sections HTML
   * @param {HTMLElement} container - Container element for sections
   */
  generateColorSections(container) {
    this.colorData.forEach(sectionData => {
      const section = document.createElement('div');
      section.className = 'color-section';
      section.innerHTML = `<h3>${sectionData.section}</h3>`;

      sectionData.groups.forEach(group => {
        const polyGroup = document.createElement('div');
        polyGroup.className = 'color-polyhedron-group';

        let html = `<div class="color-polyhedron-name">${group.name}</div>`;

        if (group.pairs.length === 1) {
          // Single color
          const pair = group.pairs[0];
          html += `
            <div class="color-swatch-container">
              <div class="color-label">
                <span class="type">${pair.label}</span>
                <span class="value" id="${pair.id}-hex">—</span>
              </div>
              <div class="color-swatch" id="${pair.id}-swatch"></div>
              <div class="color-input-group">
                <div class="color-picker-btn">
                  <input type="color" id="${pair.id}-picker" value="${this.hexToColor(pair.color)}">
                </div>
                <input type="text" class="color-input" id="${pair.id}-input" value="${pair.color}">
              </div>
            </div>
          `;
        } else {
          // Pair of colors
          html += '<div class="color-pair">';
          group.pairs.forEach(pair => {
            html += `
              <div class="color-swatch-container">
                <div class="color-label">
                  <span class="type">${pair.label}</span>
                  <span class="value" id="${pair.id}-hex">—</span>
                </div>
                <div class="color-swatch" id="${pair.id}-swatch"></div>
                <div class="color-input-group">
                  <div class="color-picker-btn">
                    <input type="color" id="${pair.id}-picker" value="${this.hexToColor(pair.color)}">
                  </div>
                  <input type="text" class="color-input" id="${pair.id}-input" value="${pair.color}">
                </div>
              </div>
            `;
          });
          html += '</div>';
        }

        polyGroup.innerHTML = html;
        section.appendChild(polyGroup);
      });

      container.appendChild(section);
    });
  }

  /**
   * Attach event listeners to modal controls
   */
  attachEventListeners() {
    // Close button
    const closeBtn = document.getElementById('color-theory-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Click outside to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Global opacity slider
    const opacitySlider = document.getElementById('colorTheoryGlobalOpacity');
    const opacityValue = document.getElementById('colorTheoryGlobalOpacityValue');
    if (opacitySlider && opacityValue) {
      opacitySlider.addEventListener('input', () => {
        opacityValue.textContent = parseFloat(opacitySlider.value).toFixed(2);
        this.refreshAllSwatches();
      });
    }

    // Brightness multiplier slider
    const brightnessSlider = document.getElementById('colorTheoryBrightnessMult');
    const brightnessValue = document.getElementById('colorTheoryBrightnessMultValue');
    if (brightnessSlider && brightnessValue) {
      brightnessSlider.addEventListener('input', () => {
        brightnessValue.textContent = parseFloat(brightnessSlider.value).toFixed(2) + '×';
        this.refreshAllSwatches();
      });
    }

    // Export button
    const exportBtn = document.getElementById('colorTheoryExportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportColors());
    }

    // Get all color IDs and attach listeners
    const colorIds = [];
    this.colorData.forEach(section => {
      section.groups.forEach(group => {
        group.pairs.forEach(pair => {
          colorIds.push(pair.id);
        });
      });
    });

    // Set up listeners for each color
    colorIds.forEach(id => {
      const inputEl = document.getElementById(`${id}-input`);
      const pickerEl = document.getElementById(`${id}-picker`);

      if (inputEl) {
        inputEl.addEventListener('input', () => this.updateColor(id));
      }

      if (pickerEl) {
        pickerEl.addEventListener('input', (e) => {
          const hexValue = this.colorToHex(e.target.value);
          document.getElementById(`${id}-input`).value = hexValue;
          this.updateColor(id);
        });
      }
    });
  }

  /**
   * Refresh color values from current settings
   */
  refreshColorValues() {
    // Get all color IDs
    const colorIds = [];
    this.colorData.forEach(section => {
      section.groups.forEach(group => {
        group.pairs.forEach(pair => {
          colorIds.push(pair.id);
        });
      });
    });

    // Update each color
    colorIds.forEach(id => this.updateColor(id));
  }

  /**
   * Refresh all color swatches (after opacity/brightness change)
   */
  refreshAllSwatches() {
    const colorIds = [];
    this.colorData.forEach(section => {
      section.groups.forEach(group => {
        group.pairs.forEach(pair => {
          colorIds.push(pair.id);
        });
      });
    });

    colorIds.forEach(id => this.updateColor(id));
  }

  /**
   * Update a single color swatch
   * @param {string} id - Color swatch ID
   */
  updateColor(id) {
    const inputEl = document.getElementById(`${id}-input`);
    const pickerEl = document.getElementById(`${id}-picker`);
    const swatchEl = document.getElementById(`${id}-swatch`);
    const hexEl = document.getElementById(`${id}-hex`);

    if (!inputEl || !swatchEl || !hexEl) return;

    let colorValue = inputEl.value.trim();

    // Validate hex format
    if (!colorValue.match(/^0x[0-9a-fA-F]{6}$/)) {
      hexEl.textContent = 'Invalid';
      return;
    }

    const rgb = this.hexToRgb(colorValue);
    const opacity = parseFloat(document.getElementById('colorTheoryGlobalOpacity').value);
    const brightnessMult = parseFloat(document.getElementById('colorTheoryBrightnessMult').value);

    const adjusted = this.applyBrightness(rgb.r, rgb.g, rgb.b, brightnessMult);

    swatchEl.style.backgroundColor = `rgba(${adjusted.r}, ${adjusted.g}, ${adjusted.b}, ${opacity})`;
    hexEl.textContent = `${colorValue} → rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

    // Update picker if it exists
    if (pickerEl) {
      pickerEl.value = this.hexToColor(colorValue);
    }

    // Apply color to scene in real-time via rendering API
    if (this.renderingAPI && this.colorIdToPolyType[id]) {
      const polyType = this.colorIdToPolyType[id];
      const colorHex = parseInt(colorValue.replace('0x', ''), 16);
      this.renderingAPI.updatePolyhedronColor(polyType, colorHex);

      // Save updated color palette to StateManager
      this.saveColorPaletteToStateManager();
    }
  }

  /**
   * Save current color palette to StateManager as environment setting
   */
  saveColorPaletteToStateManager() {
    if (!this.renderingAPI) return;

    // Get current color palette from rendering API
    const colorPalette = this.renderingAPI.exportColorPalette();

    // Save to StateManager (if available)
    if (window.RTStateManager) {
      window.RTStateManager.setColorPalette(colorPalette);

      // Save to localStorage for session persistence
      this.saveToLocalStorage(colorPalette);
    }
  }

  /**
   * Save color palette to localStorage
   * @param {Object} colorPalette - Color palette to save
   */
  saveToLocalStorage(colorPalette) {
    try {
      localStorage.setItem('artexplorer-color-palette', JSON.stringify(colorPalette));
    } catch (e) {
      console.warn('Could not save color palette to localStorage:', e);
    }
  }

  /**
   * Load color palette from localStorage
   * @returns {Object|null} Saved color palette or null
   */
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('artexplorer-color-palette');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Could not load color palette from localStorage:', e);
      return null;
    }
  }

  /**
   * Clear color palette from localStorage (revert to defaults)
   */
  clearLocalStorage() {
    try {
      localStorage.removeItem('artexplorer-color-palette');
      console.log('✅ Color palette cleared from localStorage');
    } catch (e) {
      console.warn('Could not clear color palette from localStorage:', e);
    }
  }

  /**
   * Export color values as code snippet
   */
  exportColors() {
    const output = document.getElementById('colorTheoryCodeOutput');
    let code = '// Updated color values for rt-rendering.js\n';
    code += '// Brightness compensation for backface culling (30-40% boost)\n\n';

    code += '// PLATONIC SOLIDS\n';
    code += `Cube: ${document.getElementById('cube-input').value}\n`;
    code += `Cube Matrix: ${document.getElementById('cube-matrix-input').value}\n\n`;

    code += `Tetrahedron: ${document.getElementById('tetra-input').value}\n`;
    code += `Geodesic Tetrahedron: ${document.getElementById('tetra-geodesic-input').value}\n\n`;

    code += `Octahedron: ${document.getElementById('octa-input').value}\n`;
    code += `Geodesic Octahedron: ${document.getElementById('octa-geodesic-input').value}\n\n`;

    code += `Icosahedron: ${document.getElementById('icosa-input').value}\n`;
    code += `Geodesic Icosahedron: ${document.getElementById('icosa-geodesic-input').value}\n\n`;

    code += `Dodecahedron: ${document.getElementById('dodeca-input').value}\n`;
    code += `Geodesic Dodecahedron (future): ${document.getElementById('dodeca-geodesic-input').value}\n\n`;

    code += '// DUAL POLYHEDRA\n';
    code += `Dual Tetrahedron: ${document.getElementById('dual-tetra-input').value}\n`;
    code += `Geodesic Dual Tetrahedron: ${document.getElementById('dual-tetra-geodesic-input').value}\n\n`;

    code += `Dual Icosahedron: ${document.getElementById('dual-icosa-input').value}\n`;
    code += `Geodesic Dual Icosahedron: ${document.getElementById('dual-icosa-geodesic-input').value}\n\n`;

    code += '// ARCHIMEDEAN & SPACE-FILLING\n';
    code += `Cuboctahedron: ${document.getElementById('cubocta-input').value}\n`;
    code += `Rhombic Dodecahedron: ${document.getElementById('rhombic-input').value}\n`;

    output.textContent = code;
  }

  /**
   * Convert 0xRRGGBB to #RRGGBB
   * @param {string} hex - Hex color with 0x prefix
   * @returns {string} Hex color with # prefix
   */
  hexToColor(hex) {
    return '#' + hex.replace('0x', '');
  }

  /**
   * Convert #RRGGBB to 0xRRGGBB
   * @param {string} color - Hex color with # prefix
   * @returns {string} Hex color with 0x prefix
   */
  colorToHex(color) {
    return '0x' + color.replace('#', '').toUpperCase();
  }

  /**
   * Convert hex to RGB
   * @param {string} hex - Hex color (0xRRGGBB)
   * @returns {Object} {r, g, b} values
   */
  hexToRgb(hex) {
    hex = hex.replace('0x', '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }

  /**
   * Apply brightness multiplier to RGB values
   * @param {number} r - Red value (0-255)
   * @param {number} g - Green value (0-255)
   * @param {number} b - Blue value (0-255)
   * @param {number} multiplier - Brightness multiplier
   * @returns {Object} Adjusted {r, g, b} values
   */
  applyBrightness(r, g, b, multiplier) {
    r = Math.min(255, Math.round(r * multiplier));
    g = Math.min(255, Math.round(g * multiplier));
    b = Math.min(255, Math.round(b * multiplier));
    return { r, g, b };
  }
}

// Export singleton instance
export const colorTheoryModal = new ColorTheoryModal();
