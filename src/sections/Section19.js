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

    // Stories dropdown (entangled with S12 d_103)
    row199: {
      id: "19.0",
      rowId: "19.0",
      label: "Stories",
      cells: [
        {}, // Column A (blank)
        {}, // Column B (blank)
        { label: "Stories" }, // Column C
        { // Column D - Stories dropdown (mirrored from S12)
          fieldId: "d_103",
          type: "dropdown",
          dropdownId: "dd_d_103_s19",
          value: "1.5",
          section: "topometry",
          tooltip: true,
          options: [
            { value: "1", name: "1" },
            { value: "1.5", name: "1.5" },
            { value: "2", name: "2" },
            { value: "3", name: "3" },
            { value: "4", name: "4" },
            { value: "5", name: "5" },
            { value: "6", name: "6" },
          ],
        },
        { content: "Stories", classes: ["unit-label"] }, // Column E
        {}, // Column F
        {}, // Column G
        {}, // Column H
      ],
    },

    // Volume input (entangled with S12 d_105)
    row198: {
      id: "19.V",
      rowId: "19.V",
      label: "Conditioned Volume",
      cells: [
        {}, // Column A (blank)
        {}, // Column B (blank)
        { label: "Conditioned Volume" }, // Column C
        { // Column D - Volume (mirrored from S12)
          fieldId: "d_105",
          type: "number",
          value: "8000.00",
          classes: ["user-input"],
          tooltip: true,
          label: "Total conditioned building volume",
        },
        { content: "m³", classes: ["unit-label"] }, // Column E
        {}, // Column F
        {}, // Column G
        {}, // Column H
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
          type: "coefficient_slider",
          value: "1.0",
          min: 0.5,
          max: 4.0,
          step: 0.1,
          section: "topometry",
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
    return {
      dd_d_103_s19: [
        { value: "1", name: "1" },
        { value: "1.5", name: "1.5" },
        { value: "2", name: "2" },
        { value: "3", name: "3" },
        { value: "4", name: "4" },
        { value: "5", name: "5" },
        { value: "6", name: "6" },
      ],
    };
  }

  function getLayout() {
    // Partial custom layout: Return rows for left panel controls,
    // HTML structure in index.html handles canvas container
    return {
      rows: [
        sectionRows.header,
        sectionRows.row199, // Stories dropdown
        sectionRows.row198, // Volume input
        sectionRows.row200, // Aspect ratio slider
        sectionRows.row201, // Footprint width (calculated)
        sectionRows.row203, // Building height (calculated)
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
    const stories = parseFloat(window.TEUI?.StateManager?.getValue("d_103")) || 1;

    // User preferences
    const aspectRatio = parseFloat(window.TEUI?.StateManager?.getValue("d_202")) || 1.0;

    // Phase 1: Footprint (X-Y plane, always horizontal)
    // Total conditioned area divided by number of stories
    const footprintArea = conditionedArea / stories;
    const width = Math.sqrt(footprintArea / aspectRatio);
    const length = footprintArea / width;

    // Phase 2: Height calculation from volume constraint (SACRED)
    // Total volume divided by footprint area gives overall building height
    const totalBuildingHeight = volume / footprintArea;
    // Height per story
    const storyHeight = totalBuildingHeight / stories;

    // Per-floor metrics
    const volumePerFloor = volume / stories;
    const areaPerFloor = conditionedArea / stories;

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
      height: totalBuildingHeight,
      storyHeight: storyHeight,
      stories: stories,
      volumePerFloor: volumePerFloor,
      areaPerFloor: areaPerFloor,
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
    window.TEUI?.StateManager?.setValue("h_203", storyHeight.toFixed(2), "calculated");

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

    // Render isometric visualization with stacked stories
    const canvas = document.getElementById("topometry-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    // Isometric projection parameters
    const scale = 5; // pixels per meter (reduced for better fit)
    const centerX = config.canvasWidth / 2;
    const centerY = config.canvasHeight / 2 + 50; // Offset down slightly

    // Isometric angle vectors (30° projection)
    const isoX = Math.cos(Math.PI / 6); // cos(30°) = 0.866
    const isoY = Math.sin(Math.PI / 6); // sin(30°) = 0.5

    // Helper function: Convert 3D coords to isometric 2D
    function toIso(x, y, z) {
      return {
        x: centerX + (x - y) * isoX * scale,
        y: centerY - (x + y) * isoY * scale - z * scale,
      };
    }

    // Building dimensions
    const length = geometry.footprint.length;
    const width = geometry.footprint.width;
    const storyHeight = geometry.storyHeight;
    const stories = geometry.stories;

    // Draw each story from bottom to top
    for (let story = 0; story < stories; story++) {
      const z0 = story * storyHeight;
      const z1 = (story + 1) * storyHeight;

      // Floor corners (at base of this story)
      const p0 = toIso(-width / 2, -length / 2, z0); // Front-left
      const p1 = toIso(width / 2, -length / 2, z0);  // Front-right
      const p2 = toIso(width / 2, length / 2, z0);   // Back-right
      const p3 = toIso(-width / 2, length / 2, z0);  // Back-left

      // Ceiling corners (at top of this story)
      const p4 = toIso(-width / 2, -length / 2, z1);
      const p5 = toIso(width / 2, -length / 2, z1);
      const p6 = toIso(width / 2, length / 2, z1);
      const p7 = toIso(-width / 2, length / 2, z1);

      // Story color (gradient from darker to lighter as we go up)
      const brightness = 100 + (story / stories) * 155;
      const fillColor = `rgba(0, 123, 255, ${0.15 + story * 0.05})`;
      const strokeColor = `rgb(0, ${Math.floor(brightness)}, 255)`;

      // Draw visible faces in painter's algorithm order

      // Top face (ceiling)
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p4.x, p4.y);
      ctx.lineTo(p5.x, p5.y);
      ctx.lineTo(p6.x, p6.y);
      ctx.lineTo(p7.x, p7.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Left face
      ctx.fillStyle = `rgba(0, 100, 200, ${0.1 + story * 0.04})`;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p7.x, p7.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right face
      ctx.fillStyle = `rgba(0, 80, 180, ${0.08 + story * 0.03})`;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p5.x, p5.y);
      ctx.lineTo(p6.x, p6.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Story label
      const labelPos = toIso(0, 0, z0 + storyHeight / 2);
      ctx.fillStyle = "#000";
      ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${geometry.areaPerFloor.toFixed(0)} m²`, labelPos.x, labelPos.y);
    }

    // Draw dimension annotations
    ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#007bff";

    // Length label (bottom edge)
    const lengthLabelPos = toIso(0, -length / 2 - 5, 0);
    ctx.fillText(`${length.toFixed(1)}m`, lengthLabelPos.x, lengthLabelPos.y + 15);

    // Width label (bottom right edge)
    const widthLabelPos = toIso(width / 2 + 5, 0, 0);
    ctx.fillText(`${width.toFixed(1)}m`, widthLabelPos.x + 20, widthLabelPos.y);

    // Height label (left edge)
    const heightLabelPos = toIso(-width / 2 - 10, length / 2, geometry.height / 2);
    ctx.fillText(`${geometry.height.toFixed(1)}m`, heightLabelPos.x - 30, heightLabelPos.y);

    // Overlay geometry info in top-left
    ctx.font = "12px monospace";
    ctx.textAlign = "left";
    const x = 20;
    let y = 30;
    const lineHeight = 18;

    ctx.fillStyle = "#007bff";
    ctx.fillText(`Stories: ${stories} × ${geometry.areaPerFloor.toFixed(1)} m² = ${(stories * geometry.areaPerFloor).toFixed(1)} m²`, x, y);
    y += lineHeight;
    ctx.fillText(`Footprint: ${length.toFixed(1)}m × ${width.toFixed(1)}m`, x, y);
    y += lineHeight;
    ctx.fillText(`Story Height: ${storyHeight.toFixed(2)}m`, x, y);
    y += lineHeight;
    ctx.fillText(`Total Volume: ${geometry.volume.toFixed(0)} m³ (${geometry.volumePerFloor.toFixed(0)} m³/floor)`, x, y);
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

        <button
          id="topometry-info-btn"
          class="btn btn-outline-secondary btn-sm"
          style="padding: 4px 12px; font-size: 13px;"
          title="What is TOPOMETRY?"
        >
          <i class="bi bi-info-circle"></i> Info
        </button>

        <div id="topometry-status" style="padding: 6px 12px; background: white; border-radius: 4px; font-size: 12px; color: #666;">
          <span style="color: #dc3545;">●</span> Inactive
        </div>
      </div>
    `;

    // Attach activation handler
    const activateBtn = document.getElementById("topometry-activate-btn");
    if (activateBtn) {
      activateBtn.addEventListener("click", toggleActivation);
    }

    // Attach info modal handler
    const infoBtn = document.getElementById("topometry-info-btn");
    if (infoBtn) {
      infoBtn.addEventListener("click", showInfoModal);
    }
  }

  function showInfoModal() {
    const backdrop = document.createElement("div");
    backdrop.className = "pc-modal-backdrop";

    const modal = document.createElement("div");
    modal.className = "pc-modal-dialog";
    modal.style.maxWidth = "600px";

    const header = document.createElement("h5");
    header.textContent = "💡 What is TOPOMETRY?";
    header.className = "pc-modal-header";
    header.style.color = "#007bff";

    const content = document.createElement("div");
    content.innerHTML = `
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6;">
        TOPOMETRY shows how <strong>OBJECTIVE "sees" your building</strong> based on thermal areas you entered.
        This is NOT a 3D architectural model - it's a <strong>thermal topology</strong> where areas drive form.
      </p>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8;">
        <li><strong>Volume is sacred:</strong> d_105 always preserved exactly</li>
        <li><strong>Stories constrain height:</strong> Building height = volume ÷ (area ÷ stories)</li>
        <li><strong>Aspect ratio shapes footprint:</strong> 1.0 = square, 2.0 = 2:1 rectangle</li>
        <li><strong>Roof pitch emerges from roof area:</strong> Larger roof = steeper pitch</li>
        <li><strong>Walls deform to match area constraints:</strong> No validation errors</li>
        <li style="color: #dc3545;"><strong>⚠ If model looks strange:</strong> Your areas don't match typical building proportions</li>
      </ul>
    `;

    const btnContainer = document.createElement("div");
    btnContainer.className = "pc-modal-actions";

    const closeBtn = document.createElement("button");
    closeBtn.className = "btn btn-primary";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", () => {
      document.body.removeChild(backdrop);
    });

    btnContainer.appendChild(closeBtn);

    modal.appendChild(header);
    modal.appendChild(content);
    modal.appendChild(btnContainer);

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Close on backdrop click
    backdrop.addEventListener("click", e => {
      if (e.target === backdrop) {
        document.body.removeChild(backdrop);
      }
    });
  }

  function toggleActivation() {
    isActivated = !isActivated;

    const activateBtn = document.getElementById("topometry-activate-btn");
    const statusIndicator = document.getElementById("topometry-status");

    if (isActivated) {
      // Activate
      activateBtn.textContent = "🔄 Refresh Topology";
      activateBtn.classList.remove("btn-primary");
      activateBtn.classList.add("btn-success");

      if (statusIndicator) {
        statusIndicator.innerHTML = '<span style="color: #28a745;">●</span> Active';
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
          displaySpan.textContent = `${parseFloat(value).toFixed(1)}:1`;
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
