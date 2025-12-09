/**
 * Section19.js - TOPOMETRY: 3D Thermal Topology Visualization
 * TEUI 4.012 - Created 2025-12-08
 *
 * TOPOMETRY generates a constraint-driven 3D thermal topology from area-based geometry.
 * This is NOT an architectural model - it's a thermal model as topology.
 *
 * Core Principles:
 * - Volume is Sacred (d_105 ALWAYS preserved exactly)
 * - Areas Drive Form (roof pitch, wall heights emerge from area constraints)
 * - No Validation Errors (impossible geometry renders visually as feedback)
 * - Constraint Satisfaction Feedback (color-coded UI shows how well areas match)
 */

window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

window.TEUI.SectionModules.sect19 = (function () {
  "use strict";

  //==========================================================================
  // STATE & CONFIGURATION
  //==========================================================================

  let isActivated = false;
  let threejsLoaded = false;
  let currentModel = null;

  const config = {
    defaultAspectRatio: 1.0,      // Square footprint by default
    defaultAllowAsymmetry: true,   // Allow walls to deform independently
    canvasWidth: 800,
    canvasHeight: 600,
  };

  //==========================================================================
  // FIELD DEFINITIONS (Section 20 - 200 series)
  //==========================================================================

  const sectionRows = {
    header: {
      id: "S19-HEADER",
      rowId: "S19-HEADER",
      cells: [
        {}, // Column A (blank)
        {}, // Column B (blank)
        { content: "C", classes: ["section-subheader"] },
        { content: "D", classes: ["section-subheader"] },
        { content: "E", classes: ["section-subheader"] },
        { content: "F", classes: ["section-subheader"] },
        { content: "G", classes: ["section-subheader"] },
        { content: "H", classes: ["section-subheader"] },
      ],
    },

    // User controls for topology solver
    row200: {
      id: "19.1",
      rowId: "19.1",
      label: "Footprint Aspect Ratio (L:W)",
      cells: [
        {}, // Column A (blank)
        {}, // Column B (blank)
        { label: "Footprint Aspect Ratio (L:W)" }, // Column C
        { // Column D
          fieldId: "d_202",
          type: "percentage",
          value: "100",
          min: 50,
          max: 400,
          step: 10,
          classes: ["user-input"],
          tooltip: true,
          label: "Aspect Ratio: 1.0 = square, 2.0 = 2:1 rectangle",
        },
        { content: "(1.0 = square)", classes: ["text-left"] }, // Column E
        {}, // Column F
        {}, // Column G
        { // Column H
          fieldId: "h_200",
          type: "calculated",
          value: "0.00",
          label: "Footprint Length (m)",
        },
      ],
    },

    row201: {
      id: "19.2",
      rowId: "19.2",
      label: "Footprint Width",
      cells: [
        {}, // Column A
        {}, // Column B
        { label: "Footprint Width" }, // Column C
        {}, // Column D
        {}, // Column E
        {}, // Column F
        {}, // Column G
        { // Column H
          fieldId: "h_201",
          type: "calculated",
          value: "0.00",
          label: "Footprint Width (m)",
        },
      ],
    },

    row203: {
      id: "19.3",
      rowId: "19.3",
      label: "Building Height",
      cells: [
        {}, // Column A
        {}, // Column B
        { label: "Building Height" }, // Column C
        {}, // Column D
        {}, // Column E
        {}, // Column F
        {}, // Column G
        { // Column H
          fieldId: "h_203",
          type: "calculated",
          value: "0.00",
          label: "Nominal Height (m)",
        },
      ],
    },
  };

  //==========================================================================
  // ACCESSOR METHODS
  //==========================================================================

  function getFields() {
    const fields = {};
    Object.values(sectionRows).forEach(row => {
      if (!row.cells || !Array.isArray(row.cells)) return;
      row.cells.forEach(cell => {
        if (cell.fieldId) {
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || cell.content || row.label,
            defaultValue: cell.value || "",
            section: "section19",
          };
          if (cell.min !== undefined) fields[cell.fieldId].min = cell.min;
          if (cell.max !== undefined) fields[cell.fieldId].max = cell.max;
          if (cell.step !== undefined) fields[cell.fieldId].step = cell.step;
        }
      });
    });
    return fields;
  }

  function getDropdownOptions() {
    return {};
  }

  function getLayout() {
    // Partial custom layout: Return rows for left panel controls,
    // HTML structure in index.html handles canvas container
    return {
      rows: [
        sectionRows.header,
        sectionRows.row200,
        sectionRows.row201,
        sectionRows.row203,
      ],
    };
  }

  //==========================================================================
  // GEOMETRY SOLVER (Constraint-Driven "Jello Cube")
  //==========================================================================

  function solveGeometry() {
    console.log("[TOPOMETRY] Solving geometry from thermal constraints...");

    // Read inputs from StateManager
    // KISS: Use h_15 (Conditioned Area) instead of d_106 (Total Floor Area)
    // h_15 = thermal envelope area (heated space only)
    const conditionedArea = parseFloat(window.TEUI?.StateManager?.getValue("h_15")) || 100;
    const volume = parseFloat(window.TEUI?.StateManager?.getValue("d_105")) || 1000;
    const roofArea = parseFloat(window.TEUI?.StateManager?.getValue("d_85")) || 100;
    const wallArea = parseFloat(window.TEUI?.StateManager?.getValue("d_86")) || 160;

    // User preferences
    const aspectRatioPercent = parseFloat(window.TEUI?.StateManager?.getValue("d_202")) || 100;
    const aspectRatio = aspectRatioPercent / 100; // Convert percentage to ratio

    // Phase 1: Footprint (X-Y plane, always horizontal)
    const footprintArea = conditionedArea;
    const width = Math.sqrt(footprintArea / aspectRatio);
    const length = footprintArea / width;

    // Phase 2: Nominal height (from volume constraint - SACRED)
    const nominalHeight = volume / footprintArea;

    // Phase 3: Roof geometry (pitch emerges from roof area)
    const areaRatio = roofArea / footprintArea;
    let roofPitch = 0;
    let roofType = "flat";

    if (areaRatio > 1.01) {
      // Pitched roof needed to achieve larger roof area
      roofType = "gabled";
      // Simplified pitch calculation (assumes gabled roof)
      roofPitch = Math.asin(Math.min((areaRatio - 1) / 2, 1)) * (180 / Math.PI);
    } else if (areaRatio < 0.99) {
      // Inverted pyramid (roof smaller than floor - visual conflict indicator)
      roofType = "inverted";
      roofPitch = -20; // Negative pitch
      console.warn(`[TOPOMETRY] Roof area (${roofArea} m²) < Conditioned area (${footprintArea} m²) - Creating inverted geometry`);
    }

    // Phase 4: Wall geometry (symmetric for now - asymmetry in Phase 2)
    const perimeter = 2 * (length + width);
    const wallHeight = wallArea / perimeter;

    // Store solved dimensions
    const solvedGeometry = {
      footprint: { length, width, area: footprintArea },
      height: nominalHeight,
      walls: {
        north: { width: width, height: wallHeight },
        south: { width: width, height: wallHeight },
        east: { width: length, height: wallHeight },
        west: { width: length, height: wallHeight },
      },
      roof: {
        type: roofType,
        pitch: roofPitch,
        area: roofArea,
      },
      volume: volume,
    };

    // Update calculated fields in StateManager
    window.TEUI?.StateManager?.setValue("h_200", length.toFixed(2), "calculated");
    window.TEUI?.StateManager?.setValue("h_201", width.toFixed(2), "calculated");
    window.TEUI?.StateManager?.setValue("h_203", nominalHeight.toFixed(2), "calculated");

    console.log("[TOPOMETRY] Geometry solved:", solvedGeometry);
    return solvedGeometry;
  }

  //==========================================================================
  // 3D RENDERING (Placeholder - Three.js integration in Phase 2)
  //==========================================================================

  function initializeCanvas() {
    const canvas = document.getElementById("topometry-canvas");
    if (!canvas) {
      console.error("[TOPOMETRY] Canvas element not found");
      return;
    }

    const ctx = canvas.getContext("2d");
    canvas.width = config.canvasWidth;
    canvas.height = config.canvasHeight;

    // Placeholder: Draw simple 2D projection until Three.js loaded
    drawPlaceholder(ctx);
  }

  function drawPlaceholder(ctx) {
    // Clear canvas
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    // Draw border
    ctx.strokeStyle = "#dee2e6";
    ctx.strokeRect(0, 0, config.canvasWidth, config.canvasHeight);

    // Draw message
    ctx.fillStyle = "#6c757d";
    ctx.font = "16px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TOPOMETRY - 3D Thermal Topology", config.canvasWidth / 2, config.canvasHeight / 2 - 40);

    ctx.font = "14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("Click 'Activate Topology View' to generate 3D model", config.canvasWidth / 2, config.canvasHeight / 2);

    ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#999";
    ctx.fillText("Constraint-driven thermal visualization (areas → form)", config.canvasWidth / 2, config.canvasHeight / 2 + 30);
  }

  function updateVisualization() {
    if (!isActivated) return;

    const geometry = solveGeometry();
    currentModel = geometry;

    // Render 2D footprint visualization
    const canvas = document.getElementById("topometry-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    // Draw square footprint in center
    const scale = 10; // pixels per meter
    const squareSize = Math.sqrt(geometry.footprint.area) * scale;
    const centerX = config.canvasWidth / 2;
    const centerY = config.canvasHeight / 2;
    const squareX = centerX - squareSize / 2;
    const squareY = centerY - squareSize / 2;

    // Draw footprint square
    ctx.strokeStyle = "#007bff";
    ctx.lineWidth = 3;
    ctx.strokeRect(squareX, squareY, squareSize, squareSize);

    // Fill with light blue
    ctx.fillStyle = "rgba(0, 123, 255, 0.1)";
    ctx.fillRect(squareX, squareY, squareSize, squareSize);

    // Draw dimension labels
    ctx.fillStyle = "#007bff";
    ctx.font = "14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";

    // Length label (bottom)
    ctx.fillText(`${geometry.footprint.length.toFixed(1)}m`, centerX, squareY + squareSize + 25);

    // Width label (right side, rotated)
    ctx.save();
    ctx.translate(squareX + squareSize + 35, centerY);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${geometry.footprint.width.toFixed(1)}m`, 0, 0);
    ctx.restore();

    // Draw area label in center
    ctx.font = "16px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#495057";
    ctx.fillText(`${geometry.footprint.area.toFixed(1)} m²`, centerX, centerY);

    // Overlay geometry info in top-left
    ctx.font = "12px monospace";
    ctx.textAlign = "left";
    const x = 20;
    let y = 30;
    const lineHeight = 18;

    ctx.fillStyle = "#007bff";
    ctx.fillText(`Conditioned Area: ${geometry.footprint.area.toFixed(1)} m² (from h_15)`, x, y);
    y += lineHeight;
    ctx.fillText(`Footprint: ${geometry.footprint.length.toFixed(1)}m × ${geometry.footprint.width.toFixed(1)}m`, x, y);
    y += lineHeight;
    ctx.fillText(`Height: ${geometry.height.toFixed(1)}m`, x, y);
    y += lineHeight;
    ctx.fillText(`Volume: ${geometry.volume.toFixed(0)} m³`, x, y);
  }

  //==========================================================================
  // ACTIVATION CONTROLS (Following S17 pattern)
  //==========================================================================

  function createActivationControls() {
    const container = document.querySelector(".topometry-controls-wrapper");
    if (!container) {
      console.error("[TOPOMETRY] Controls wrapper not found");
      return;
    }

    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
        <button
          id="topometry-activate-btn"
          class="btn btn-primary"
          style="padding: 8px 16px; font-weight: 500;"
        >
          🏗️ Activate Topology View
        </button>

        <div style="flex: 1; color: #6c757d; font-size: 13px;">
          Generate 3D thermal topology from envelope areas (Volume, Roof, Walls, Windows)
        </div>

        <div id="topometry-status" style="padding: 6px 12px; background: white; border-radius: 4px; font-size: 12px; color: #666;">
          <span style="color: #dc3545;">●</span> Inactive
        </div>
      </div>

      <div id="topometry-info-panel" style="display: none; padding: 15px; background: #e3f2fd; border-left: 4px solid #007bff; border-radius: 4px; margin-bottom: 20px;">
        <h6 style="margin: 0 0 10px 0; color: #007bff;">💡 What is TOPOMETRY?</h6>
        <p style="margin: 0; font-size: 13px; line-height: 1.5;">
          TOPOMETRY shows how <strong>OBJECTIVE "sees" your building</strong> based on thermal areas you entered.
          This is NOT a 3D architectural model - it's a <strong>thermal topology</strong> where areas drive form.
        </p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 12px;">
          <li>✓ Volume is sacred (d_105 always preserved exactly)</li>
          <li>✓ Roof pitch emerges from roof area (larger roof = steeper pitch)</li>
          <li>✓ Walls deform to match area constraints (no validation errors)</li>
          <li>⚠ If model looks strange → Your areas don't match typical building proportions</li>
        </ul>
      </div>
    `;

    // Attach activation handler
    const activateBtn = document.getElementById("topometry-activate-btn");
    if (activateBtn) {
      activateBtn.addEventListener("click", toggleActivation);
    }
  }

  function toggleActivation() {
    isActivated = !isActivated;

    const activateBtn = document.getElementById("topometry-activate-btn");
    const statusIndicator = document.getElementById("topometry-status");
    const infoPanel = document.getElementById("topometry-info-panel");

    if (isActivated) {
      // Activate
      activateBtn.textContent = "🔄 Refresh Topology";
      activateBtn.classList.remove("btn-primary");
      activateBtn.classList.add("btn-success");

      if (statusIndicator) {
        statusIndicator.innerHTML = '<span style="color: #28a745;">●</span> Active';
      }

      if (infoPanel) {
        infoPanel.style.display = "block";
      }

      console.log("[TOPOMETRY] Topology view activated");
      updateVisualization();

    } else {
      // Deactivate
      activateBtn.textContent = "🏗️ Activate Topology View";
      activateBtn.classList.remove("btn-success");
      activateBtn.classList.add("btn-primary");

      if (statusIndicator) {
        statusIndicator.innerHTML = '<span style="color: #dc3545;">●</span> Inactive';
      }

      if (infoPanel) {
        infoPanel.style.display = "none";
      }

      console.log("[TOPOMETRY] Topology view deactivated");

      // Clear canvas
      const canvas = document.getElementById("topometry-canvas");
      if (canvas) {
        const ctx = canvas.getContext("2d");
        drawPlaceholder(ctx);
      }
    }
  }

  //==========================================================================
  // EVENT HANDLERS
  //==========================================================================

  function initializeEventHandlers() {
    console.log("[TOPOMETRY] Initializing event handlers");

    // Aspect ratio slider
    const aspectSlider = document.querySelector('[data-field-id="d_202"] input[type="range"]');
    if (aspectSlider && !aspectSlider.hasSliderListener) {
      aspectSlider.addEventListener("input", (e) => {
        const value = e.target.value;
        const displaySpan = document.querySelector('span[data-display-for="d_202"]');
        if (displaySpan) {
          const ratio = (value / 100).toFixed(1);
          displaySpan.textContent = `${ratio}:1`;
        }
      });

      aspectSlider.addEventListener("change", (e) => {
        const value = e.target.value;
        window.TEUI?.StateManager?.setValue("d_202", value, "user-modified");

        if (isActivated) {
          updateVisualization();
        }
      });

      aspectSlider.hasSliderListener = true;
    }

    // Listen to geometry changes from other sections
    if (window.TEUI?.StateManager) {
      const geometryFields = ["d_85", "d_86", "d_105", "d_106", "d_103"];
      geometryFields.forEach(fieldId => {
        window.TEUI.StateManager.addListener(fieldId, () => {
          if (isActivated) {
            console.log(`[TOPOMETRY] Geometry field ${fieldId} changed, updating visualization`);
            updateVisualization();
          }
        });
      });
    }
  }

  //==========================================================================
  // LIFECYCLE
  //==========================================================================

  function onSectionRendered() {
    console.log("[TOPOMETRY] Section 19 rendered");

    // Initialize canvas
    setTimeout(() => {
      initializeCanvas();
      createActivationControls();
    }, 100);
  }

  function calculateAll() {
    // TOPOMETRY doesn't calculate - it visualizes
    // Calculations happen in solveGeometry() when activated
    if (isActivated) {
      updateVisualization();
    }
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    getFields,
    getDropdownOptions,
    getLayout,
    initializeEventHandlers,
    onSectionRendered,
    calculateAll,

    // TOPOMETRY-specific exports
    solveGeometry,
    isActivated: () => isActivated,
    getCurrentModel: () => currentModel,
  };
})();

// Global namespace exposure
document.addEventListener("DOMContentLoaded", function () {
  const module = window.TEUI.SectionModules.sect19;
  if (module) {
    window.TEUI.sect19 = {
      calculateAll: module.calculateAll,
      solveGeometry: module.solveGeometry,
    };
  }
});
