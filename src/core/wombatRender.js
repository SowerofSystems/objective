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
   */
  function render(svg, geometry, isReference) {
    console.log("[WombatRender-4] Prismatic render called");
    console.log("  Geometry:", geometry);
    console.log("  IsReference:", isReference);

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

    const { ground, eave } = geometry.nodes3D;

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

    // Project all 8 nodes to isometric
    const groundProj = ground.map((node) =>
      toIsometric(node.x, node.y, node.z, scale, centerX, centerY)
    );
    const eaveProj = eave.map((node) =>
      toIsometric(node.x, node.y, node.z, scale, centerX, centerY)
    );

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

    // Draw nodes (8 circles)
    ground.forEach((node, i) => {
      const circle = createNode(groundProj[i], config.colors.ground, 4);
      svg.appendChild(circle);
    });
    eave.forEach((node, i) => {
      const circle = createNode(eaveProj[i], config.colors.air, 4);
      svg.appendChild(circle);
    });

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

    console.log("[WombatRender-4] Rendered successfully");
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    render: render,
    renderPlaceholder: renderPlaceholder,
  };
})();
