/**
 * Section19.js - WOMBAT: 3D Thermal Topology Visualization
 * TEUI 4.012 - Created 2025-12-08
 *
 * WOMBAT generates a constraint-driven 3D thermal topology from area-based geometry.
 * Like a wombat creates cubic output from inputs, we transform thermal geometry fields
 * into cube-like topology. This is NOT an architectural model - it's a thermal model as topology.
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
      cells: {
        a: {},
        b: {},
        c: { content: "C", classes: ["section-subheader"] },
        d: { content: "D", classes: ["section-subheader"] },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "H", classes: ["section-subheader"] },
      },
    },

    // Stories dropdown (mirrored from S12 d_103)
    row199: {
      id: "19.0",
      rowId: "19.0",
      label: "Stories",
      cells: {
        a: {},
        b: {},
        c: { label: "Stories" },
        d: {
          fieldId: "d_199",
          type: "dropdown",
          dropdownId: "dd_d_199",
          value: "1.5",
          section: "wombat",
          tooltip: true,
          label: "Number of stories (mirrored from S12)",
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
        e: { content: "Stories", classes: ["unit-label"] },
        f: {},
        g: {},
        h: {},
      },
    },

    // Volume input (mirrored from S12 d_105)
    row198: {
      id: "19.V",
      rowId: "19.V",
      label: "Conditioned Volume",
      cells: {
        a: {},
        b: {},
        c: { label: "Conditioned Volume" },
        d: {
          fieldId: "d_198",
          type: "number",
          value: "8000.00",
          classes: ["user-input"],
          tooltip: true,
          label: "Conditioned volume (mirrored from S12)",
        },
        e: { content: "m³", classes: ["unit-label"] },
        f: {},
        g: {},
        h: {},
      },
    },

    // User controls for topology solver
    row200: {
      id: "19.1",
      rowId: "19.1",
      label: "Footprint Aspect Ratio (L:W)",
      cells: {
        a: {},
        b: {},
        c: { label: "Footprint Aspect Ratio (L:W)" },
        d: {
          fieldId: "d_202",
          type: "coefficient_slider",
          value: "0.0",
          min: -4.0,
          max: 4.0,
          step: 0.1,
          section: "wombat",
          tooltip: true,
          label: "Aspect Ratio: 0 = square, negative = portrait (tall), positive = landscape (wide)",
        },
        e: { content: "(0 = square)", classes: ["text-left"] },
        f: {},
        g: {},
        h: {
          fieldId: "h_200",
          type: "calculated",
          value: "0.00",
          label: "Footprint Length (m)",
        },
      },
    },

    row201: {
      id: "19.2",
      rowId: "19.2",
      label: "Footprint Width",
      cells: {
        a: {},
        b: {},
        c: { label: "Footprint Width" },
        d: {},
        e: {},
        f: {},
        g: {},
        h: {
          fieldId: "h_201",
          type: "calculated",
          value: "0.00",
          label: "Footprint Width (m)",
        },
      },
    },

    row203: {
      id: "19.3",
      rowId: "19.3",
      label: "Building Height",
      cells: {
        a: {},
        b: {},
        c: { label: "Building Height" },
        d: {},
        e: {},
        f: {},
        g: {},
        h: {
          fieldId: "h_203",
          type: "calculated",
          value: "0.00",
          label: "Nominal Height (m)",
        },
      },
    },
  };

  //==========================================================================
  // ACCESSOR METHODS
  //==========================================================================

  function getFields() {
    const fields = {};
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;
      // Handle object-based cells (like Section12)
      Object.values(row.cells).forEach(cell => {
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
          if (cell.options !== undefined) fields[cell.fieldId].options = cell.options;
          if (cell.dropdownId !== undefined) fields[cell.fieldId].dropdownId = cell.dropdownId;
        }
      });
    });
    return fields;
  }

  function getDropdownOptions() {
    return {
      dd_d_199: [
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

  /**
   * Convert object-based cells to array format for FieldManager
   * (Following Section12 pattern)
   */
  function createLayoutRow(row) {
    const rowDef = { id: row.id, cells: [{}, {}] }; // Start with columns A, B (empty)
    const columns = ["c", "d", "e", "f", "g", "h"];

    columns.forEach(col => {
      if (row.cells && row.cells[col]) {
        const cell = { ...row.cells[col] };

        // Handle column C (description) label conversion
        if (col === "c") {
          if (cell.type === "label" && cell.content && !cell.label) {
            cell.label = cell.content;
            delete cell.type;
            delete cell.content;
          } else if (!cell.label && !cell.content && row.label) {
            cell.label = row.label;
          }
        }

        // Clean up internal properties not needed by FieldManager
        delete cell.section;
        delete cell.dependencies;

        rowDef.cells.push(cell);
      } else {
        // Empty cell or fallback to row label for column C
        if (col === "c" && !row.cells?.c && row.label) {
          rowDef.cells.push({ label: row.label });
        } else {
          rowDef.cells.push({});
        }
      }
    });

    return rowDef;
  }

  function getLayout() {
    const layoutRows = [];

    // Add header
    if (sectionRows.header) {
      layoutRows.push(createLayoutRow(sectionRows.header));
    }

    // Add data rows
    ["row199", "row198", "row200", "row201", "row203"].forEach(key => {
      if (sectionRows[key]) {
        layoutRows.push(createLayoutRow(sectionRows[key]));
      }
    });

    return { rows: layoutRows };
  }

  //==========================================================================
  // GEOMETRY SOLVER (Constraint-Driven "Jello Cube")
  //==========================================================================

  function solveGeometry() {
    console.log("[WOMBAT] Solving geometry from thermal constraints...");

    // Read inputs from StateManager and Pattern A sections
    // KISS: Use h_15 (Conditioned Area) instead of d_106 (Total Floor Area)
    // h_15 = thermal envelope area (heated space only)
    const conditionedArea = parseFloat(window.TEUI?.StateManager?.getValue("h_15")) || 100;
    const roofArea = parseFloat(window.TEUI?.StateManager?.getValue("d_85")) || 100;
    const wallArea = parseFloat(window.TEUI?.StateManager?.getValue("d_86")) || 160;

    // ⚠️ Read from WOMBAT mirror fields (d_198, d_199)
    // These are synced bidirectionally with Section 12's d_105/d_103
    const volume = parseFloat(window.TEUI?.StateManager?.getValue("d_198")) || 1000;
    const stories = parseFloat(window.TEUI?.StateManager?.getValue("d_199")) || 1;

    // User preferences
    // Aspect ratio slider: -4 to +4, centered at 0
    // 0 = square (1:1)
    // Positive = landscape (wider than tall): +1 = 2:1, +2 = 3:1, +4 = 5:1
    // Negative = portrait (taller than wide): -1 = 1:2, -2 = 1:3, -4 = 1:5
    const aspectRatioRaw = parseFloat(window.TEUI?.StateManager?.getValue("d_202")) || 0.0;
    const aspectRatio = aspectRatioRaw >= 0 ? (1 + aspectRatioRaw) : (1 / (1 - aspectRatioRaw));

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
      console.warn(`[WOMBAT] Roof area (${roofArea} m²) < Conditioned area (${footprintArea} m²) - Creating inverted geometry`);
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

    console.log("[WOMBAT] Geometry solved:", solvedGeometry);
    return solvedGeometry;
  }

  //==========================================================================
  // 3D RENDERING (Placeholder - Three.js integration in Phase 2)
  //==========================================================================

  function initializeCanvas() {
    const canvas = document.getElementById("wombat-canvas");
    if (!canvas) {
      console.error("[WOMBAT] Canvas element not found");
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
    ctx.fillText("WOMBAT - 3D Thermal Topology", config.canvasWidth / 2, config.canvasHeight / 2 - 40);

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
    const canvas = document.getElementById("wombat-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    // Building dimensions
    const length = geometry.footprint.length;
    const width = geometry.footprint.width;
    const storyHeight = geometry.storyHeight;
    const stories = geometry.stories;
    const totalHeight = geometry.height;

    // Calculate optimal scale to fill canvas (with padding)
    const padding = 80; // pixels of padding around edges
    const availableWidth = config.canvasWidth - padding * 2;
    const availableHeight = config.canvasHeight - padding * 2;

    // Isometric projection dimensions (diagonal extents)
    const isoX = Math.cos(Math.PI / 6); // 0.866
    const isoY = Math.sin(Math.PI / 6); // 0.5
    const projectedWidth = (length + width) * isoX;
    const projectedHeight = (length + width) * isoY + totalHeight;

    // Calculate scale to fit both dimensions
    const scaleX = availableWidth / projectedWidth;
    const scaleY = availableHeight / projectedHeight;
    const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to leave breathing room

    // Center the building in the canvas
    const centerX = config.canvasWidth / 2;
    const centerY = config.canvasHeight / 2 + (totalHeight * scale * 0.2); // Offset slightly down

    // Helper function: Convert 3D coords to isometric 2D
    function toIso(x, y, z) {
      return {
        x: centerX + (x - y) * isoX * scale,
        y: centerY - (x + y) * isoY * scale - z * scale,
      };
    }

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
    const container = document.querySelector(".wombat-controls-wrapper");
    if (!container) {
      console.error("[WOMBAT] Controls wrapper not found");
      return;
    }

    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
        <button
          id="wombat-activate-btn"
          class="btn btn-primary"
          style="padding: 8px 16px; font-weight: 500;"
        >
          🏗️ Activate Topology View
        </button>

        <div style="flex: 1; color: #6c757d; font-size: 13px;">
          Generate 3D thermal topology from envelope areas (Volume, Roof, Walls, Windows)
        </div>

        <button
          id="wombat-info-btn"
          class="btn btn-outline-secondary btn-sm"
          style="padding: 4px 12px; font-size: 13px;"
          title="What is WOMBAT?"
        >
          <i class="bi bi-info-circle"></i> Info
        </button>

        <div id="wombat-status" style="padding: 6px 12px; background: white; border-radius: 4px; font-size: 12px; color: #666;">
          <span style="color: #dc3545;">●</span> Inactive
        </div>
      </div>
    `;

    // Attach activation handler
    const activateBtn = document.getElementById("wombat-activate-btn");
    if (activateBtn) {
      activateBtn.addEventListener("click", toggleActivation);
    }

    // Attach info modal handler
    const infoBtn = document.getElementById("wombat-info-btn");
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
    header.textContent = "💡 What is WOMBAT?";
    header.className = "pc-modal-header";
    header.style.color = "#007bff";

    const content = document.createElement("div");
    content.innerHTML = `
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6;">
        WOMBAT shows how <strong>OBJECTIVE "sees" your building</strong> based on thermal areas you entered.
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

    const activateBtn = document.getElementById("wombat-activate-btn");
    const statusIndicator = document.getElementById("wombat-status");

    if (isActivated) {
      // Activate
      activateBtn.textContent = "🔄 Refresh Topology";
      activateBtn.classList.remove("btn-primary");
      activateBtn.classList.add("btn-success");

      if (statusIndicator) {
        statusIndicator.innerHTML = '<span style="color: #28a745;">●</span> Active';
      }

      console.log("[WOMBAT] Topology view activated");
      updateVisualization();

    } else {
      // Deactivate
      activateBtn.textContent = "🏗️ Activate Topology View";
      activateBtn.classList.remove("btn-success");
      activateBtn.classList.add("btn-primary");

      if (statusIndicator) {
        statusIndicator.innerHTML = '<span style="color: #dc3545;">●</span> Inactive';
      }

      console.log("[WOMBAT] Topology view deactivated");

      // Clear canvas
      const canvas = document.getElementById("wombat-canvas");
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
    console.log("[WOMBAT] Initializing event handlers");

    // Aspect ratio slider
    const aspectSlider = document.querySelector('[data-field-id="d_202"] input[type="range"]');
    if (aspectSlider && !aspectSlider.hasSliderListener) {
      aspectSlider.addEventListener("input", (e) => {
        const rawValue = parseFloat(e.target.value);
        const displaySpan = document.querySelector('span[data-display-for="d_202"]');
        if (displaySpan) {
          // Convert slider value to aspect ratio display
          if (rawValue === 0) {
            displaySpan.textContent = "1:1 (square)";
          } else if (rawValue > 0) {
            // Landscape: +1 = 2:1, +2 = 3:1, etc.
            displaySpan.textContent = `${(1 + rawValue).toFixed(1)}:1 (landscape)`;
          } else {
            // Portrait: -1 = 1:2, -2 = 1:3, etc.
            displaySpan.textContent = `1:${(1 - rawValue).toFixed(1)} (portrait)`;
          }
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

    // Listen to geometry changes from other sections (external dependencies)
    // Per 4012-CHEATSHEET Anti-Pattern 7: Only listen to EXTERNAL dependencies
    if (window.TEUI?.StateManager) {
      const geometryFields = ["d_85", "d_86", "d_106"];
      geometryFields.forEach(fieldId => {
        window.TEUI.StateManager.addListener(fieldId, () => {
          if (isActivated) {
            console.log(`[WOMBAT] Geometry field ${fieldId} changed, updating visualization`);
            updateVisualization();
          }
        });

        // Also listen to Reference versions for mode-aware visualization
        const refFieldId = `ref_${fieldId}`;
        window.TEUI.StateManager.addListener(refFieldId, () => {
          if (isActivated) {
            console.log(`[WOMBAT] Reference field ${refFieldId} changed, updating visualization`);
            updateVisualization();
          }
        });
      });

      // ⚠️ MIRROR FIELD SYNC: Section 12 → WOMBAT (d_105→d_198, d_103→d_199)
      // When S12 volume/stories change, sync to WOMBAT mirror fields
      window.TEUI.StateManager.addListener("d_105", (newValue) => {
        const currentValue = window.TEUI?.StateManager?.getValue("d_198");
        if (currentValue !== newValue) {
          window.TEUI.StateManager.setValue("d_198", newValue, "external");
          console.log(`[WOMBAT] Synced d_198 = ${newValue} from S12 (d_105)`);
          if (isActivated) {
            updateVisualization();
          }
        }
      });

      window.TEUI.StateManager.addListener("ref_d_105", (newValue) => {
        const currentValue = window.TEUI?.StateManager?.getValue("ref_d_198");
        if (currentValue !== newValue) {
          window.TEUI.StateManager.setValue("ref_d_198", newValue, "external");
          console.log(`[WOMBAT] Synced ref_d_198 = ${newValue} from S12 (ref_d_105)`);
          if (isActivated) {
            updateVisualization();
          }
        }
      });

      window.TEUI.StateManager.addListener("d_103", (newValue) => {
        const currentValue = window.TEUI?.StateManager?.getValue("d_199");
        if (currentValue !== newValue) {
          window.TEUI.StateManager.setValue("d_199", newValue, "external");
          console.log(`[WOMBAT] Synced d_199 = ${newValue} from S12 (d_103)`);
          if (isActivated) {
            updateVisualization();
          }
        }
      });

      window.TEUI.StateManager.addListener("ref_d_103", (newValue) => {
        const currentValue = window.TEUI?.StateManager?.getValue("ref_d_199");
        if (currentValue !== newValue) {
          window.TEUI.StateManager.setValue("ref_d_199", newValue, "external");
          console.log(`[WOMBAT] Synced ref_d_199 = ${newValue} from S12 (ref_d_103)`);
          if (isActivated) {
            updateVisualization();
          }
        }
      });
    }
  }

  //==========================================================================
  // LIFECYCLE
  //==========================================================================

  function onSectionRendered() {
    console.log("[WOMBAT] Section 19 rendered");

    // Initialize canvas
    setTimeout(() => {
      initializeCanvas();
      createActivationControls();
    }, 100);
  }

  function calculateAll() {
    // WOMBAT doesn't calculate - it visualizes
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

    // WOMBAT-specific exports
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
