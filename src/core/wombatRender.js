/**
 * wombatRender-2.js - WOMBAT Prismatic Rendering (WOMBAT 4)
 * TEUI 4.012
 *
 * Minimal stub renderer for prismatic extrusion approach
 * Will render from 8-node geometry (4 ground + 4 eave corners)
 */

window.TEUI = window.TEUI || {};
window.TEUI.WombatRender = (function () {
  "use strict";

  //==========================================================================
  // CONFIGURATION
  //==========================================================================

  const config = {
    canvasWidth: 900,
    canvasHeight: 600,
    colors: {
      target: "#007bff", // Blue for Target mode
      reference: "#dc3545", // Red for Reference mode
      ground: "#8b4513", // Brown for ground-facing (Ag)
      air: "#b0e0e6", // Powder blue for air-facing (Ae)
    },
  };

  //==========================================================================
  // ISOMETRIC PROJECTION
  //==========================================================================

  /**
   * Convert 3D coordinates to 2D isometric projection
   * Uses Z-up convention: X+=East, Y+=North, Z+=Up
   */
  function toIsometric(x, y, z, scale, centerX, centerY) {
    const isoX = Math.cos(Math.PI / 6); // 0.866
    const isoY = Math.sin(Math.PI / 6); // 0.5

    return {
      x: centerX + (x - y) * isoX * scale,
      y: centerY - (x + y) * isoY * scale - z * scale,
    };
  }

  //==========================================================================
  // SVG HELPERS
  //==========================================================================

  /**
   * Create SVG line element
   */
  function createLine(p1, p2, stroke, strokeWidth = 3) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", p1.x);
    line.setAttribute("y1", p1.y);
    line.setAttribute("x2", p2.x);
    line.setAttribute("y2", p2.y);
    line.setAttribute("stroke", stroke);
    line.setAttribute("stroke-width", strokeWidth);
    line.setAttribute("stroke-linecap", "round");
    return line;
  }

  /**
   * Create SVG circle node
   */
  function createNode(point, fill, radius = 5) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", fill);
    circle.setAttribute("stroke", "#000");
    circle.setAttribute("stroke-width", "1");
    return circle;
  }

  /**
   * Create SVG text element
   */
  function createText(x, y, text, color, fontSize = 11, options = {}) {
    const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textEl.setAttribute("x", x);
    textEl.setAttribute("y", y);
    textEl.setAttribute("fill", color);
    textEl.setAttribute("font-size", fontSize);

    if (options.anchor) {
      textEl.setAttribute("text-anchor", options.anchor);
    }

    textEl.textContent = text;
    return textEl;
  }

  //==========================================================================
  // PLACEHOLDER RENDERING
  //==========================================================================

  /**
   * Draw placeholder message when visualization is inactive
   */
  function renderPlaceholder(svg) {
    const centerX = config.canvasWidth / 2;
    const centerY = config.canvasHeight / 2;

    // Title text
    const titleText = createText(
      centerX,
      centerY - 40,
      "WOMBAT 4 - Prismatic 3D Thermal Topology",
      "#6c757d",
      16,
      { anchor: "middle" }
    );
    svg.appendChild(titleText);

    // Instruction text
    const instructionText = createText(
      centerX,
      centerY,
      "Click 'Activate Topology View' to generate 3D model",
      "#6c757d",
      14,
      { anchor: "middle" }
    );
    svg.appendChild(instructionText);

    // Subtitle text
    const subtitleText = createText(
      centerX,
      centerY + 30,
      "Constraint-driven thermal visualization (areas → form)",
      "#999",
      12,
      { anchor: "middle" }
    );
    svg.appendChild(subtitleText);
  }

  //==========================================================================
  // MAIN RENDER FUNCTION
  //==========================================================================

  /**
   * Main render function - draws 8-node prismatic geometry
   * @param {Object} geometry - Geometry data with nodes3D
   * @param {String} mode - "target" or "reference"
   * @param {SVGElement} svg - SVG container element
   * @param {Object} options - Additional render options
   */
  function render(geometry, mode, svg, options = {}) {
    console.log("[WombatRender-4] Prismatic render called");
    console.log("  Geometry:", geometry);
    console.log("  Mode:", mode);
    console.log("  Options:", options);

    const isReference = mode === "reference";

    // Clear SVG
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Validate geometry
    if (!geometry || !geometry.nodes3D) {
      console.error("[WombatRender-4] Invalid geometry - missing nodes3D");
      const errorText = createText(
        config.canvasWidth / 2,
        config.canvasHeight / 2,
        "Error: Invalid geometry",
        "#dc3545",
        16,
        { anchor: "middle" }
      );
      svg.appendChild(errorText);
      return;
    }

    const { ground, eave, ridge } = geometry.nodes3D;

    // Calculate scale to fit geometry in canvas
    const maxDim = Math.max(
      geometry.footprint.width,
      geometry.footprint.length,
      geometry.totalHeight
    );
    const scale = Math.min(config.canvasWidth, config.canvasHeight) / (maxDim * 1.5);
    const centerX = config.canvasWidth / 2;
    const centerY = config.canvasHeight / 2;

    // Choose color based on mode
    const color = isReference ? config.colors.reference : config.colors.target;

    // Project ground and eave nodes to isometric
    const groundProj = ground.map((node) =>
      toIsometric(node.x, node.y, node.z, scale, centerX, centerY)
    );
    const eaveProj = eave.map((node) =>
      toIsometric(node.x, node.y, node.z, scale, centerX, centerY)
    );

    // Project ridge nodes if present (gable roof)
    const ridgeProj = ridge
      ? ridge.map((node) => toIsometric(node.x, node.y, node.z, scale, centerX, centerY))
      : null;

    // Draw ground rectangle (4 edges)
    for (let i = 0; i < 4; i++) {
      const next = (i + 1) % 4;
      const line = createLine(groundProj[i], groundProj[next], color, 2);
      svg.appendChild(line);
    }

    // Draw eave rectangle (4 edges)
    for (let i = 0; i < 4; i++) {
      const next = (i + 1) % 4;
      const line = createLine(eaveProj[i], eaveProj[next], color, 2);
      svg.appendChild(line);
    }

    // Draw vertical edges (4 edges connecting ground to eave)
    for (let i = 0; i < 4; i++) {
      const line = createLine(groundProj[i], eaveProj[i], color, 2);
      svg.appendChild(line);
    }

    // Draw roof edges for gable
    if (ridgeProj) {
      // Ridge line (front to back)
      const ridgeLine = createLine(ridgeProj[0], ridgeProj[1], color, 2);
      svg.appendChild(ridgeLine);

      // Front gable (eave corners to front ridge)
      const frontLeft = createLine(eaveProj[0], ridgeProj[0], color, 2);
      const frontRight = createLine(eaveProj[1], ridgeProj[0], color, 2);
      svg.appendChild(frontLeft);
      svg.appendChild(frontRight);

      // Back gable (eave corners to back ridge)
      const backLeft = createLine(eaveProj[3], ridgeProj[1], color, 2);
      const backRight = createLine(eaveProj[2], ridgeProj[1], color, 2);
      svg.appendChild(backLeft);
      svg.appendChild(backRight);
    }

    // Draw nodes (circles)
    ground.forEach((node, i) => {
      const circle = createNode(groundProj[i], config.colors.ground, 4);
      svg.appendChild(circle);
    });
    eave.forEach((node, i) => {
      const circle = createNode(eaveProj[i], config.colors.air, 4);
      svg.appendChild(circle);
    });
    if (ridgeProj) {
      ridge.forEach((node, i) => {
        const circle = createNode(ridgeProj[i], "#ff6b6b", 5); // Red for ridge peaks
        svg.appendChild(circle);
      });
    }

    // Render intermediate floor planes for multi-storey buildings
    renderFloorPlanes(svg, geometry, ground, scale, centerX, centerY);

    // Add title annotation
    const title = createText(
      20,
      30,
      `WOMBAT 4 - ${geometry.roofType} roof (${isReference ? "Reference" : "Target"})`,
      color,
      14
    );
    svg.appendChild(title);

    // Add dimensions annotation
    const dims = createText(
      20,
      50,
      `${geometry.footprint.width.toFixed(1)}m × ${geometry.footprint.length.toFixed(1)}m × ${geometry.totalHeight.toFixed(1)}m`,
      "#666",
      12
    );
    svg.appendChild(dims);

    // Add legend annotations
    renderLegend(svg, geometry, mode);

    // Add coordinate axes indicator (bottom-right corner)
    // Pass aspect ratio SIGN to determine orientation (180° rotation at aspect=0)
    const aspectRatio = geometry.footprint.length / geometry.footprint.width;
    renderCoordinateAxes(svg, aspectRatio);

    console.log("[WombatRender-4] Rendered successfully");
  }

  //==========================================================================
  // FLOOR PLANES RENDERING (Multi-Storey)
  //==========================================================================

  /**
   * Render horizontal floor planes for multi-storey buildings
   * Shows intermediate floor levels as gray hairlines
   *
   * @param {SVGElement} svg - SVG container
   * @param {Object} geometry - Geometry object with stories, storyHeight
   * @param {Array} ground - Ground corner nodes (3D coordinates)
   * @param {number} scale - Isometric scale factor
   * @param {number} centerX - Canvas center X
   * @param {number} centerY - Canvas center Y
   */
  function renderFloorPlanes(svg, geometry, ground, scale, centerX, centerY) {
    const stories = geometry.stories || 1;
    const storyHeight = geometry.storyHeight || geometry.height;

    if (stories <= 1) {
      return; // No intermediate floors for single-storey
    }

    // Draw horizontal floor planes at each storey boundary
    // Iterate from 1 to stories-1 (intermediate floors only, not ground or eave)
    for (let i = 1; i < stories; i++) {
      const floorZ = i * storyHeight;

      // Create 4 corner points at this floor level
      // Use ground footprint corners, just elevated to floor height
      const floorCorners = [
        { x: ground[0].x, y: ground[0].y, z: floorZ },
        { x: ground[1].x, y: ground[1].y, z: floorZ },
        { x: ground[2].x, y: ground[2].y, z: floorZ },
        { x: ground[3].x, y: ground[3].y, z: floorZ },
      ];

      // Draw floor plane as rectangular perimeter (4 edges)
      for (let j = 0; j < 4; j++) {
        const p1 = toIsometric(
          floorCorners[j].x,
          floorCorners[j].y,
          floorCorners[j].z,
          scale,
          centerX,
          centerY
        );
        const p2 = toIsometric(
          floorCorners[(j + 1) % 4].x,
          floorCorners[(j + 1) % 4].y,
          floorCorners[(j + 1) % 4].z,
          scale,
          centerX,
          centerY
        );

        // Gray hairline (solid, thin, visible but subtle)
        const line = createLine(p1, p2, "#666666", 0.5);
        line.setAttribute("opacity", "0.6");
        svg.appendChild(line);
      }

      // Add corner nodes at each floor level
      for (let j = 0; j < 4; j++) {
        const pt = toIsometric(
          floorCorners[j].x,
          floorCorners[j].y,
          floorCorners[j].z,
          scale,
          centerX,
          centerY
        );
        const node = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        node.setAttribute("cx", pt.x);
        node.setAttribute("cy", pt.y);
        node.setAttribute("r", 2); // Smaller than structural nodes
        node.setAttribute("fill", "#666666");
        node.setAttribute("opacity", "0.6");
        svg.appendChild(node);
      }
    }
  }

  //==========================================================================
  // LEGEND RENDERING
  //==========================================================================

  /**
   * Render legend with key metrics in upper-left area
   * @param {SVGElement} svg - SVG container
   * @param {Object} geometry - Geometry data
   * @param {String} mode - "target" or "reference"
   */
  function renderLegend(svg, geometry, mode) {
    const isReference = mode === "reference";
    let yOffset = 75; // Start below title and dimensions
    const xOffset = 20;
    const lineHeight = 18;
    const labelColor = "#666";
    const valueColor = "#333";

    // Helper to get values from StateManager with mode awareness
    function getValue(fieldId) {
      if (!window.TEUI?.StateManager) return null;
      const fullFieldId = isReference ? `ref_${fieldId}` : fieldId;
      return window.TEUI.StateManager.getValue(fullFieldId);
    }

    // Helper to format number with 2dp
    function format2dp(value) {
      const num = parseFloat(value);
      return isNaN(num) ? "0.00" : num.toFixed(2);
    }

    // 1. Footprint dimensions (Width × Length)
    const widthText = createText(
      xOffset,
      yOffset,
      `Width (X): ${geometry.footprint.width.toFixed(2)} m`,
      labelColor,
      11
    );
    svg.appendChild(widthText);
    yOffset += lineHeight;

    const lengthText = createText(
      xOffset,
      yOffset,
      `Length (Y): ${geometry.footprint.length.toFixed(2)} m`,
      labelColor,
      11
    );
    svg.appendChild(lengthText);
    yOffset += lineHeight;

    // 2. Storey Height
    const storeyHeight = getValue("h_156") || geometry.storyHeight.toFixed(2);
    const storeyText = createText(
      xOffset,
      yOffset,
      `Storey Height: ${format2dp(storeyHeight)} m`,
      labelColor,
      11
    );
    svg.appendChild(storeyText);
    yOffset += lineHeight;

    // 3. Floorplate Area (from d_95 or d_87)
    const floorplateArea = getValue("d_95") || getValue("d_87") || "0.00";
    const floorplateText = createText(
      xOffset,
      yOffset,
      `Floorplate Area: ${format2dp(floorplateArea)} m²`,
      labelColor,
      11
    );
    svg.appendChild(floorplateText);
    yOffset += lineHeight;

    // 4. Roof Area (from d_85)
    const roofArea = getValue("d_85") || "0.00";
    const roofText = createText(
      xOffset,
      yOffset,
      `Roof Area: ${format2dp(roofArea)} m²`,
      labelColor,
      11
    );
    svg.appendChild(roofText);
    yOffset += lineHeight;

    // 5. Roof Height (Q dimension)
    const roofHeight = geometry.roofHeight || 0;
    const roofHeightText = createText(
      xOffset,
      yOffset,
      `Roof Ht. (Q): ${roofHeight.toFixed(2)} m`,
      labelColor,
      11
    );
    svg.appendChild(roofHeightText);
    yOffset += lineHeight;

    // 6. End Wall Area (gable or shed specific)
    if (geometry.roofType === "gable" || geometry.roofType === "shed") {
      const endWallArea = geometry.profile2D?.endWallArea || 0;
      const endWallLabel = geometry.roofType === "gable" ? "Gable End Wall Area" : "Shed End Wall Area";
      const endWallText = createText(
        xOffset,
        yOffset,
        `${endWallLabel}: ${endWallArea.toFixed(2)} m²`,
        labelColor,
        11
      );
      svg.appendChild(endWallText);
      yOffset += lineHeight;
    }

    // 7. Ae Wall Area (air-facing longitudinal walls - calculated from geometry)
    // For prismatic geometry: 2 longitudinal walls × length × wall height
    const longitudinalWallArea = 2 * geometry.footprint.length * geometry.height;
    const aeWallText = createText(
      xOffset,
      yOffset,
      `Ae Wall Area: ${longitudinalWallArea.toFixed(2)} m²`,
      labelColor,
      11
    );
    svg.appendChild(aeWallText);
    yOffset += lineHeight;

    // 8. Volume (from d_105) - for verification
    const volume = getValue("d_105") || "0.00";
    const volumeText = createText(
      xOffset,
      yOffset,
      `Volume: ${format2dp(volume)} m³`,
      valueColor,
      11,
      { fontWeight: "bold" }
    );
    svg.appendChild(volumeText);
  }

  //==========================================================================
  // COORDINATE AXES INDICATOR
  //==========================================================================

  /**
   * Render coordinate axes indicator (X/East, Y/North, Z/Up)
   * Positioned in bottom-right corner
   * Rotates 180° when aspect ratio crosses 1.0 (landscape vs portrait)
   *
   * aspectRatio >= 1.0: Length > Width (Y-aligned, North-South is long)
   * aspectRatio < 1.0:  Width > Length (X-aligned, East-West is long)
   */
  function renderCoordinateAxes(svg, aspectRatio) {
    const x0 = config.canvasWidth - 100; // Bottom-right corner
    const y0 = config.canvasHeight - 80;
    const axisLength = 40;

    // Determine orientation based on aspect ratio (length/width)
    // aspectRatio >= 1.0: Building longer in Y direction (North-South)
    // aspectRatio < 1.0:  Building longer in X direction (East-West)
    const isYAligned = aspectRatio >= 1.0;

    // Z-axis (Up) - blue (always vertical)
    const zLine = createLine(
      { x: x0, y: y0 },
      { x: x0, y: y0 - axisLength },
      "#0066cc",
      2
    );
    svg.appendChild(zLine);
    const zLabel = createText(
      x0 - 5,
      y0 - axisLength - 5,
      "Z/Up",
      "#0066cc",
      11,
      {}
    );
    svg.appendChild(zLabel);

    if (isYAligned) {
      // Aspect >= 1.0: Building longer in North-South direction (Y=LONG)
      // Y-axis (North) - green, isometric pointing up-left (long dimension)
      const yEndIso = toIsometric(0, axisLength, 0, 1, x0, y0);
      const yLine = createLine({ x: x0, y: y0 }, yEndIso, "#00cc66", 2);
      svg.appendChild(yLine);
      const yLabel = createText(
        yEndIso.x,
        yEndIso.y + 30,
        "Y/North",
        "#00cc66",
        11,
        { anchor: "middle" }
      );
      svg.appendChild(yLabel);

      // X-axis (East) - red, isometric pointing down-right (short dimension)
      const xEndIso = toIsometric(axisLength, 0, 0, 1, x0, y0);
      const xLine = createLine({ x: x0, y: y0 }, xEndIso, "#cc0000", 2);
      svg.appendChild(xLine);
      const xLabel = createText(
        xEndIso.x + 5,
        xEndIso.y + 5,
        "X/East",
        "#cc0000",
        11,
        {}
      );
      svg.appendChild(xLabel);
    } else {
      // Aspect < 1.0: Building longer in East-West direction (X=LONG)
      // 180° rotation: flip both axes to opposite isometric directions
      // X-axis (East) - red, isometric pointing up-left (long dimension, negated Y)
      const xEndIso = toIsometric(0, -axisLength, 0, 1, x0, y0);
      const xLine = createLine({ x: x0, y: y0 }, xEndIso, "#cc0000", 2);
      svg.appendChild(xLine);
      const xLabel = createText(
        xEndIso.x,
        xEndIso.y + 30,
        "X/East",
        "#cc0000",
        11,
        { anchor: "middle" }
      );
      svg.appendChild(xLabel);

      // Y-axis (North) - green, isometric pointing down-right (short dimension, negated X)
      const yEndIso = toIsometric(-axisLength, 0, 0, 1, x0, y0);
      const yLine = createLine({ x: x0, y: y0 }, yEndIso, "#00cc66", 2);
      svg.appendChild(yLine);
      const yLabel = createText(
        yEndIso.x + 5,
        yEndIso.y + 5,
        "Y/North",
        "#00cc66",
        11,
        {}
      );
      svg.appendChild(yLabel);
    }
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    render: render,
    renderPlaceholder: renderPlaceholder,
  };
})();
