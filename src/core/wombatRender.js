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

    // Include below-grade depth if present
    const basementDepth = geometry.belowGrade?.basementDepth || 0;
    const totalVerticalSpan = totalHeight + basementDepth;

    // Isometric projection dimensions
    const isoX = Math.cos(Math.PI / 6);
    const isoY = Math.sin(Math.PI / 6);
    const projectedWidth = (length + width) * isoX;
    const projectedHeight = (length + width) * isoY + totalVerticalSpan;

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
   * Create SVG text element with optional background for readability
   * Note: This returns a wrapper function that creates the background after DOM insertion
   */
  function createTextWithBackground(x, y, text, color, fontSize = 11, options = {}) {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

    // Create text element
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
    group.appendChild(textEl);

    // Add background if not disabled
    if (options.noBackground !== true) {
      // Mark for background rendering (will be added after DOM insertion)
      group.__needsBackground = true;
      group.__backgroundPadding = 2;
    }

    return group;
  }

  /**
   * Create SVG text element (legacy - for compatibility)
   */
  function createText(x, y, text, color, fontSize = 11, options = {}) {
    const element = createTextWithBackground(x, y, text, color, fontSize, options);

    // If element needs background and is a group, add it now if possible
    if (element.__needsBackground && element.parentNode) {
      addBackgroundToTextGroup(element);
    }

    return element;
  }

  /**
   * Add background rect to a text group (call after element is in DOM)
   */
  function addBackgroundToTextGroup(group) {
    if (!group.__needsBackground) return;

    const textEl = group.querySelector('text');
    if (!textEl) return;

    try {
      const bbox = textEl.getBBox();
      const padding = group.__backgroundPadding || 2;

      const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bg.setAttribute("x", bbox.x - padding);
      bg.setAttribute("y", bbox.y - padding);
      bg.setAttribute("width", bbox.width + padding * 2);
      bg.setAttribute("height", bbox.height + padding * 2);
      bg.setAttribute("fill", "rgba(255, 255, 255, 0.85)");
      bg.setAttribute("rx", 2);

      // Insert background before text
      group.insertBefore(bg, textEl);
      delete group.__needsBackground;
    } catch (e) {
      console.warn('[WombatRender] Failed to add background to text:', e);
    }
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

    // Check if ground floor should be brown (at-grade with ground contact)
    const hasGroundContact = geometry.belowGrade?.hasBasement || geometry.belowGrade?.hasSlab;
    const groundFloorColor = hasGroundContact ? config.colors.ground : modelColor;

    const allVertices = [];
    const groundFloorVertices = []; // Separate array for ground floor nodes
    const allEdges = [];
    const groundFloorEdges = []; // Separate array for ground floor edges

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
        // Ground floor vertices - may be brown if at-grade
        groundFloorVertices.push(p0, p1, p2, p3);
      }
      allVertices.push(p4, p5, p6, p7); // Ceiling vertices for each story

      // Floor edges (only for first story)
      if (story === 0) {
        // Ground floor edges - may be brown if at-grade
        groundFloorEdges.push([p0, p1], [p1, p2], [p2, p3], [p3, p0]);
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

    // Draw ground floor edges first (brown if at-grade, blue/red if raised)
    groundFloorEdges.forEach(([p1, p2]) => {
      const edge = createLine(p1, p2, groundFloorColor, 3);
      svg.appendChild(edge);
    });

    // Draw all other edges (always blue/red)
    allEdges.forEach(([p1, p2]) => {
      const edge = createLine(p1, p2, modelColor, 3);
      svg.appendChild(edge);
    });

    // Draw ground floor nodes (brown if at-grade, blue/red if raised)
    groundFloorVertices.forEach((vertex) => {
      const node = createNode(vertex, groundFloorColor, 5);
      svg.appendChild(node);
    });

    // Draw all other vertex nodes on top (always blue/red)
    allVertices.forEach((vertex) => {
      const node = createNode(vertex, modelColor, 5);
      svg.appendChild(node);
    });
  }

  //==========================================================================
  // RENDERING: PYRAMIDAL ROOF GEOMETRY (Rational Trigonometry)
  //==========================================================================

  /**
   * Draw a triangle in isometric projection
   * @param {SVGElement} svg - Target SVG element
   * @param {Object} p1 - First vertex {x, y, z}
   * @param {Object} p2 - Second vertex {x, y, z}
   * @param {Object} p3 - Third vertex {x, y, z}
   * @param {number} scale - Isometric scale factor
   * @param {number} centerX - SVG center X
   * @param {number} centerY - SVG center Y
   * @param {string} color - Stroke color
   */
  function drawTriangle(svg, p1, p2, p3, scale, centerX, centerY, color) {
    const pt1 = toIsometric(p1.x, p1.y, p1.z, scale, centerX, centerY);
    const pt2 = toIsometric(p2.x, p2.y, p2.z, scale, centerX, centerY);
    const pt3 = toIsometric(p3.x, p3.y, p3.z, scale, centerX, centerY);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${pt1.x},${pt1.y} L ${pt2.x},${pt2.y} L ${pt3.x},${pt3.y} Z`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", 2);

    svg.appendChild(path);
  }

  /**
   * Render pyramidal roof geometry using rational trigonometry
   * @param {SVGElement} svg - Target SVG element
   * @param {Object} geometry - Geometry object with roof data
   * @param {string} mode - "target" or "reference"
   * @param {number} scale - Isometric scale factor
   * @param {number} centerX - SVG center X coordinate
   * @param {number} centerY - SVG center Y coordinate
   */
  function renderPyramidalRoof(svg, geometry, mode, scale, centerX, centerY) {
    const isReference = mode === "reference";
    const roofColor = isReference ? config.colors.reference : config.colors.target;

    const { width, length } = geometry.footprint;
    const wallHeight = geometry.height;
    const roofHeight = geometry.roof.height;

    // Apex point (centered above base)
    const apex = {
      x: 0,
      y: 0,
      z: wallHeight + roofHeight
    };

    // Four corners of roof base (top of walls)
    const roofBase = [
      { x: -width/2, y: -length/2, z: wallHeight }, // SW corner
      { x:  width/2, y: -length/2, z: wallHeight }, // SE corner
      { x:  width/2, y:  length/2, z: wallHeight }, // NE corner
      { x: -width/2, y:  length/2, z: wallHeight }  // NW corner
    ];

    // Draw four triangular faces
    roofBase.forEach((corner, i) => {
      const nextCorner = roofBase[(i + 1) % 4];
      drawTriangle(svg, corner, apex, nextCorner, scale, centerX, centerY, roofColor);
    });

    // Draw apex node
    const apexPt = toIsometric(apex.x, apex.y, apex.z, scale, centerX, centerY);
    const node = createNode(apexPt, roofColor, 5);
    svg.appendChild(node);

    // Add roof height label
    const roofLabelPos = toIsometric(
      width / 2 + 8,
      0,
      wallHeight + roofHeight / 2,
      scale,
      centerX,
      centerY
    );
    const roofLabel = createText(
      roofLabelPos.x + 15,
      roofLabelPos.y,
      `Roof: ${roofHeight.toFixed(1)}m`,
      roofColor,
      10,
      { style: "italic" }
    );
    svg.appendChild(roofLabel);
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
  // RENDERING: BELOW-GRADE GEOMETRY (Phase 2)
  //==========================================================================

  /**
   * Render grade line at z=0 (dashed brown)
   */
  function renderGradeLine(svg, geometry, scale, centerX, centerY) {
    if (!geometry.belowGrade.hasBasement && !geometry.belowGrade.hasSlab) {
      return; // No grade line for raised floor only
    }

    const gradeColor = config.colors.ground;
    const length = geometry.footprint.length;
    const width = geometry.footprint.width;

    // Grade line extends beyond building footprint
    const gradeLeft = toIsometric(-width / 2 - 10, -length / 2, 0, scale, centerX, centerY);
    const gradeRight = toIsometric(width / 2 + 10, -length / 2, 0, scale, centerX, centerY);

    // Create dashed line at z=0
    const gradeLine = createLine(gradeLeft, gradeRight, gradeColor, 2);
    gradeLine.setAttribute("stroke-dasharray", "8,4");
    svg.appendChild(gradeLine);

    // Add "Grade" label
    const gradeLabel = createText(
      gradeRight.x + 15,
      gradeRight.y + 5,
      "Grade",
      gradeColor,
      10,
      { style: "italic" }
    );
    svg.appendChild(gradeLabel);
  }

  /**
   * Render basement walls geometry only (dashed brown, z=0 to z=-depth)
   */
  function renderBasementWallsGeometry(svg, geometry, scale, centerX, centerY) {
    if (!geometry.belowGrade.hasBasement) {
      return;
    }

    const gradeColor = config.colors.ground;
    const length = geometry.footprint.length;
    const width = geometry.footprint.width;
    const basementDepth = geometry.belowGrade.basementDepth;

    // Define grade-level nodes (z=0)
    const gradeNodes = [
      { x: -width / 2, y: -length / 2, z: 0 },
      { x: width / 2, y: -length / 2, z: 0 },
      { x: width / 2, y: length / 2, z: 0 },
      { x: -width / 2, y: length / 2, z: 0 },
    ];

    // Define basement floor nodes (z=-depth)
    const basementNodes = gradeNodes.map((node) => ({
      x: node.x,
      y: node.y,
      z: -basementDepth,
    }));

    // Draw vertical edges (basement walls) - DASHED for hidden line effect
    for (let i = 0; i < 4; i++) {
      const topNode = toIsometric(
        gradeNodes[i].x,
        gradeNodes[i].y,
        gradeNodes[i].z,
        scale,
        centerX,
        centerY
      );
      const bottomNode = toIsometric(
        basementNodes[i].x,
        basementNodes[i].y,
        basementNodes[i].z,
        scale,
        centerX,
        centerY
      );

      const edge = createLine(topNode, bottomNode, gradeColor, 3);
      edge.setAttribute("stroke-dasharray", "8,4"); // Hidden line (below ground)
      svg.appendChild(edge);
    }

    // Draw basement floor perimeter edges - DASHED for hidden line effect
    for (let i = 0; i < 4; i++) {
      const node1 = basementNodes[i];
      const node2 = basementNodes[(i + 1) % 4];
      const p1 = toIsometric(node1.x, node1.y, node1.z, scale, centerX, centerY);
      const p2 = toIsometric(node2.x, node2.y, node2.z, scale, centerX, centerY);

      const edge = createLine(p1, p2, gradeColor, 3);
      edge.setAttribute("stroke-dasharray", "8,4"); // Hidden line (below ground)
      svg.appendChild(edge);
    }

    // Draw basement floor nodes (brown circles)
    basementNodes.forEach((node) => {
      const point = toIsometric(node.x, node.y, node.z, scale, centerX, centerY);
      const circle = createNode(point, gradeColor, 5);
      svg.appendChild(circle);
    });
  }

  /**
   * Render basement depth label
   */
  function renderBasementDepthLabel(svg, geometry, scale, centerX, centerY) {
    if (!geometry.belowGrade.hasBasement) {
      return;
    }

    const gradeColor = config.colors.ground;
    const length = geometry.footprint.length;
    const width = geometry.footprint.width;
    const basementDepth = geometry.belowGrade.basementDepth;

    // Add basement depth annotation
    const depthLabelPos = toIsometric(
      -width / 2 - 10,
      length / 2,
      -basementDepth / 2,
      scale,
      centerX,
      centerY
    );
    const depthLabel = createText(
      depthLabelPos.x - 35,
      depthLabelPos.y,
      `${basementDepth.toFixed(1)}m`,
      gradeColor,
      11,
      { anchor: "middle" }
    );
    svg.appendChild(depthLabel);
  }

  /**
   * Render slab-on-grade (solid brown, z=0)
   * Note: The slab perimeter at z=0 is now rendered by renderAboveGrade()
   * as brown ground floor edges/nodes. This function is kept for future
   * enhancements (e.g., slab fill pattern, thermal break indicators)
   */
  function renderSlabOnGrade(svg, geometry, scale, centerX, centerY) {
    // Ground floor perimeter is now handled by renderAboveGrade()
    // when hasGroundContact is true

    // Future: Could add slab-specific features here like:
    // - Thermal break indicators
    // - Slab insulation visualization
    // - Edge detail annotations
  }

  /**
   * Render Ag (Area Exposed to Ground) label
   */
  function renderAgLabel(svg, geometry, scale, centerX, centerY) {
    if (!geometry.belowGrade.hasBasement && !geometry.belowGrade.hasSlab) {
      return;
    }

    const gradeColor = config.colors.ground;
    const agTotal = geometry.belowGrade.slabArea + geometry.belowGrade.basementWallArea;

    // Position label below basement geometry (or below grade line if no basement)
    const labelZ = geometry.belowGrade.hasBasement
      ? -geometry.belowGrade.basementDepth - 5
      : -5;
    const labelPos = toIsometric(0, 0, labelZ, scale, centerX, centerY);

    const agLabel = createText(
      labelPos.x,
      labelPos.y,
      `Ag: ${agTotal.toFixed(1)} m²`,
      gradeColor,
      12,
      { anchor: "middle", weight: "600" }
    );
    svg.appendChild(agLabel);

    // Add foundation type subtitle
    const typeNames = {
      "full-basement": "Full Basement",
      "slab-on-grade": "Slab-on-Grade",
      "raised-floor": "Raised Floor",
      "basement-no-slab": "Basement (no slab)",
    };

    const typeLabel = createText(
      labelPos.x,
      labelPos.y + 14,
      typeNames[geometry.belowGrade.foundationType] || "Unknown",
      gradeColor,
      10,
      { anchor: "middle", style: "italic" }
    );
    svg.appendChild(typeLabel);
  }

  /**
   * Render mixed foundation warning
   */
  function renderMixedFoundationWarning(svg, geometry, scale, centerX, centerY) {
    const hasRaisedFloor = geometry.belowGrade.hasRaisedFloor;
    const hasGroundContact = geometry.belowGrade.hasBasement || geometry.belowGrade.hasSlab;

    if (!hasRaisedFloor || !hasGroundContact) {
      return; // No warning needed
    }

    const width = geometry.footprint.width;
    const length = geometry.footprint.length;
    const storyHeight = geometry.storyHeight;

    const warningPos = toIsometric(
      width / 2 + 15,
      -length / 2,
      storyHeight,
      scale,
      centerX,
      centerY
    );

    // Warning badge emoji
    const warningBadge = createText(
      warningPos.x,
      warningPos.y,
      "⚠️",
      "#ff9800",
      14
    );
    svg.appendChild(warningBadge);

    // Warning label
    const warningLabel = createText(
      warningPos.x + 20,
      warningPos.y,
      "Mixed foundation",
      "#ff9800",
      10
    );
    svg.appendChild(warningLabel);
  }

  /**
   * Render below-grade geometry only (lines and nodes)
   * Labels are rendered separately in Phase 2 to ensure they appear on top
   */
  function renderBelowGradeGeometry(svg, geometry, scale, centerX, centerY) {
    if (!geometry.belowGrade) {
      return;
    }

    // Render geometry only: grade line, basement walls, slab
    renderGradeLine(svg, geometry, scale, centerX, centerY);
    renderBasementWallsGeometry(svg, geometry, scale, centerX, centerY);
    renderSlabOnGrade(svg, geometry, scale, centerX, centerY);
  }

  /**
   * Render below-grade labels (on top of all geometry)
   */
  function renderBelowGradeLabels(svg, geometry, scale, centerX, centerY) {
    if (!geometry.belowGrade) {
      return;
    }

    // Render labels only: basement depth, Ag label, warnings
    renderBasementDepthLabel(svg, geometry, scale, centerX, centerY);
    renderAgLabel(svg, geometry, scale, centerX, centerY);
    renderMixedFoundationWarning(svg, geometry, scale, centerX, centerY);
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

    // PHASE 1: Render all geometry (lines and nodes) - these go in back

    // Render below-grade geometry first (grade line, basement walls)
    if (geometry.belowGrade) {
      renderBelowGradeGeometry(svgElement, geometry, scale, centerX, centerY);
    }

    // Render above-grade wireframe
    renderAboveGrade(svgElement, geometry, mode, scale, centerX, centerY);

    // Render pyramidal roof (if pitched)
    if (geometry.roof && geometry.roof.type === "pyramidal") {
      renderPyramidalRoof(svgElement, geometry, mode, scale, centerX, centerY);
    } else if (geometry.roof && geometry.roof.type === "inverted") {
      // Inverted pyramid (visual indicator for roof area deficit)
      renderPyramidalRoof(svgElement, geometry, mode, scale, centerX, centerY);
    }

    // PHASE 2: Render all labels - these go on top for legibility

    // Render below-grade labels (basement depth, Ag label)
    if (geometry.belowGrade) {
      renderBelowGradeLabels(svgElement, geometry, scale, centerX, centerY);
    }

    // Render dimension annotations
    renderDimensions(svgElement, geometry, mode, scale, centerX, centerY);

    // Render info overlay
    renderInfoOverlay(svgElement, geometry, mode);

    // PHASE 3: Add backgrounds to all labels (now that they're in the DOM)
    const allGroups = svgElement.querySelectorAll('g');
    allGroups.forEach(group => {
      if (group.__needsBackground) {
        addBackgroundToTextGroup(group);
      }
    });
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
