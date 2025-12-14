/**
 * wombatRender.js - WOMBAT 3D Thermal Topology Rendering
 * TEUI 4.012
 *
 * Graphics module for Section 19 (WOMBAT) - handles all 3D visualization:
 * - SVG isometric projection rendering
 * - Above-grade wireframe geometry
 * - Below-grade geometry (Phase 2)
 * - Dimension annotations
 * - Mode-aware color coding
 *
 * Coordinate System: Z-up (X+=East, Y+=North, Z+=Up)
 */

window.TEUI = window.TEUI || {};
window.TEUI.WombatRender = (function () {
  "use strict";

  //==========================================================================
  // CONFIGURATION
  //==========================================================================

  const config = {
    canvasWidth: 800,
    canvasHeight: 600,
    colors: {
      target: "#007bff", // Blue for Target mode
      reference: "#dc3545", // Red for Reference mode
      ground: "#8b4513", // Brown for ground-facing (Ag)
      air: "#b0e0e6", // Powder blue for air-facing (Ae)
    },
  };

  //==========================================================================
  // ISOMETRIC PROJECTION HELPERS
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

  /**
   * Calculate optimal scale to fit geometry in canvas
   */
  function calculateScale(geometry, canvasWidth, canvasHeight) {
    const padding = 80;
    const availableWidth = canvasWidth - padding * 2;
    const availableHeight = canvasHeight - padding * 2;

    const length = geometry.footprint.length;
    const width = geometry.footprint.width;
    const totalHeight = geometry.height;

    // Isometric projection dimensions
    const isoX = Math.cos(Math.PI / 6);
    const isoY = Math.sin(Math.PI / 6);
    const projectedWidth = (length + width) * isoX;
    const projectedHeight = (length + width) * isoY + totalHeight;

    // Calculate scale to fit both dimensions
    const scaleX = availableWidth / projectedWidth;
    const scaleY = availableHeight / projectedHeight;
    return Math.min(scaleX, scaleY) * 0.9; // 90% to leave breathing room
  }

  //==========================================================================
  // SVG ELEMENT CREATION HELPERS
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
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", fill);
    circle.setAttribute("stroke", "#fff");
    circle.setAttribute("stroke-width", 2);
    return circle;
  }

  /**
   * Create SVG text element
   */
  function createText(x, y, text, color, fontSize = 11, options = {}) {
    const textEl = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    textEl.setAttribute("x", x);
    textEl.setAttribute("y", y);
    textEl.setAttribute("fill", color);
    textEl.setAttribute(
      "font-family",
      "-apple-system, BlinkMacSystemFont, sans-serif"
    );
    textEl.setAttribute("font-size", fontSize);

    if (options.anchor) textEl.setAttribute("text-anchor", options.anchor);
    if (options.weight) textEl.setAttribute("font-weight", options.weight);
    if (options.style) textEl.setAttribute("font-style", options.style);

    textEl.textContent = text;
    return textEl;
  }

  //==========================================================================
  // RENDERING: ABOVE-GRADE GEOMETRY
  //==========================================================================

  /**
   * Render above-grade building wireframe (multi-story)
   */
  function renderAboveGrade(svg, geometry, mode, scale, centerX, centerY) {
    const isReference = mode === "reference";
    const modelColor = isReference ? config.colors.reference : config.colors.target;

    const length = geometry.footprint.length;
    const width = geometry.footprint.width;
    const storyHeight = geometry.storyHeight;
    const stories = geometry.stories;

    const allVertices = [];
    const allEdges = [];

    // Build wireframe for each story
    for (let story = 0; story < stories; story++) {
      const z0 = story * storyHeight;
      const z1 = (story + 1) * storyHeight;

      // Floor vertices
      const p0 = toIsometric(-width / 2, -length / 2, z0, scale, centerX, centerY);
      const p1 = toIsometric(width / 2, -length / 2, z0, scale, centerX, centerY);
      const p2 = toIsometric(width / 2, length / 2, z0, scale, centerX, centerY);
      const p3 = toIsometric(-width / 2, length / 2, z0, scale, centerX, centerY);

      // Ceiling vertices
      const p4 = toIsometric(-width / 2, -length / 2, z1, scale, centerX, centerY);
      const p5 = toIsometric(width / 2, -length / 2, z1, scale, centerX, centerY);
      const p6 = toIsometric(width / 2, length / 2, z1, scale, centerX, centerY);
      const p7 = toIsometric(-width / 2, length / 2, z1, scale, centerX, centerY);

      // Collect vertices
      if (story === 0) {
        allVertices.push(p0, p1, p2, p3); // Floor vertices only on first story
      }
      allVertices.push(p4, p5, p6, p7); // Ceiling vertices for each story

      // Floor edges (only for first story)
      if (story === 0) {
        allEdges.push([p0, p1], [p1, p2], [p2, p3], [p3, p0]);
      }

      // Ceiling edges
      allEdges.push([p4, p5], [p5, p6], [p6, p7], [p7, p4]);

      // Vertical edges
      allEdges.push([p0, p4], [p1, p5], [p2, p6], [p3, p7]);

      // Story label (per-floor area)
      const labelPos = toIsometric(0, 0, z0 + storyHeight / 2, scale, centerX, centerY);
      const label = createText(
        labelPos.x,
        labelPos.y,
        `${geometry.areaPerFloor.toFixed(0)} m²`,
        "#666",
        11,
        { anchor: "middle", weight: "500" }
      );
      svg.appendChild(label);
    }

    // Draw all edges
    allEdges.forEach(([p1, p2]) => {
      const edge = createLine(p1, p2, modelColor, 3);
      svg.appendChild(edge);
    });

    // Draw all vertex nodes on top
    allVertices.forEach((vertex) => {
      const node = createNode(vertex, modelColor, 5);
      svg.appendChild(node);
    });
  }

  //==========================================================================
  // RENDERING: DIMENSION ANNOTATIONS
  //==========================================================================

  /**
   * Render dimension annotations (length, width, height)
   */
  function renderDimensions(svg, geometry, mode, scale, centerX, centerY) {
    const isReference = mode === "reference";
    const modelColor = isReference ? config.colors.reference : config.colors.target;

    const length = geometry.footprint.length;
    const width = geometry.footprint.width;
    const height = geometry.height;

    // Length label (bottom edge)
    const lengthPos = toIsometric(0, -length / 2 - 5, 0, scale, centerX, centerY);
    const lengthLabel = createText(
      lengthPos.x,
      lengthPos.y + 15,
      `${length.toFixed(1)}m`,
      modelColor,
      11,
      { anchor: "middle" }
    );
    svg.appendChild(lengthLabel);

    // Width label (bottom right edge)
    const widthPos = toIsometric(width / 2 + 5, 0, 0, scale, centerX, centerY);
    const widthLabel = createText(
      widthPos.x + 20,
      widthPos.y,
      `${width.toFixed(1)}m`,
      modelColor,
      11,
      { anchor: "middle" }
    );
    svg.appendChild(widthLabel);

    // Height label (left edge)
    const heightPos = toIsometric(-width / 2 - 10, length / 2, height / 2, scale, centerX, centerY);
    const heightLabel = createText(
      heightPos.x - 30,
      heightPos.y,
      `${height.toFixed(1)}m`,
      modelColor,
      11,
      { anchor: "middle" }
    );
    svg.appendChild(heightLabel);
  }

  //==========================================================================
  // RENDERING: GEOMETRY INFO OVERLAY
  //==========================================================================

  /**
   * Render geometry information overlay (top-left)
   */
  function renderInfoOverlay(svg, geometry, mode) {
    const isReference = mode === "reference";
    const modelColor = isReference ? config.colors.reference : config.colors.target;

    const infoLines = [
      `Stories: ${geometry.stories} × ${geometry.areaPerFloor.toFixed(1)} m² = ${(geometry.stories * geometry.areaPerFloor).toFixed(1)} m²`,
      `Footprint: ${geometry.footprint.length.toFixed(1)}m × ${geometry.footprint.width.toFixed(1)}m`,
      `Story Height: ${geometry.storyHeight.toFixed(2)}m`,
      `Total Volume: ${geometry.volume.toFixed(0)} m³ (${geometry.volumePerFloor.toFixed(0)} m³/floor)`,
    ];

    const x = 20;
    let y = 30;
    const lineHeight = 18;

    infoLines.forEach((line) => {
      const infoText = createText(x, y, line, modelColor, 12, {});
      infoText.setAttribute("font-family", "monospace");
      svg.appendChild(infoText);
      y += lineHeight;
    });
  }

  //==========================================================================
  // RENDERING: PLACEHOLDER
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
      "WOMBAT - 3D Thermal Topology",
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
   * Main render function - orchestrates all visualization
   *
   * @param {Object} geometry - Solved geometry from Section19 solveGeometry()
   * @param {String} mode - "target" or "reference"
   * @param {SVGElement} svgElement - SVG container element
   * @param {Object} options - Rendering options
   */
  function render(geometry, mode, svgElement, options = {}) {
    if (!svgElement) {
      console.error("[WombatRender] SVG element not found");
      return;
    }

    // Clear SVG
    svgElement.innerHTML = "";

    // If no geometry provided, show placeholder
    if (!geometry) {
      renderPlaceholder(svgElement);
      return;
    }

    // Calculate scale and center
    const scale = calculateScale(geometry, config.canvasWidth, config.canvasHeight);
    const centerX = config.canvasWidth / 2;
    const centerY = config.canvasHeight / 2 + geometry.height * scale * 0.2; // Offset slightly down

    // Render above-grade wireframe
    renderAboveGrade(svgElement, geometry, mode, scale, centerX, centerY);

    // Render dimension annotations
    renderDimensions(svgElement, geometry, mode, scale, centerX, centerY);

    // Render info overlay
    renderInfoOverlay(svgElement, geometry, mode);

    // Future: Render below-grade geometry (Phase 2)
    if (options.showBelowGrade && geometry.belowGrade) {
      // renderBelowGrade(svgElement, geometry, mode, scale, centerX, centerY);
    }
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    render,
    renderPlaceholder,

    // Expose helpers for testing/debugging
    toIsometric,
    createLine,
    createNode,
    createText,

    // Config access
    getConfig: () => ({ ...config }),
  };
})();
