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
    const padding = 120; // Increased from 80 to prevent label clipping
    const availableWidth = canvasWidth - padding * 2;
    const availableHeight = canvasHeight - padding * 2;

    const length = geometry.footprint.length;
    const width = geometry.footprint.width;

    // Use totalHeight if available (includes roof), otherwise fallback to wall height
    const totalHeight = geometry.totalHeight || geometry.height;

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
   * Handles fractional stories by rendering partial-height boxes
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

    // Determine number of full stories and fractional remainder
    const fullStories = Math.floor(stories);
    const fractionalPart = stories - fullStories;
    const hasFractionalStory = fractionalPart > 0.01; // Tolerance for floating point

    // Build wireframe for each full story
    for (let story = 0; story < fullStories; story++) {
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

      // Story label (per-floor area for full stories)
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

    // Add fractional story (partial height box)
    if (hasFractionalStory) {
      const z0 = fullStories * storyHeight;
      const z1 = z0 + fractionalPart * storyHeight; // Partial height

      // Floor vertices (top of last full story)
      const p0 = toIsometric(-width / 2, -length / 2, z0, scale, centerX, centerY);
      const p1 = toIsometric(width / 2, -length / 2, z0, scale, centerX, centerY);
      const p2 = toIsometric(width / 2, length / 2, z0, scale, centerX, centerY);
      const p3 = toIsometric(-width / 2, length / 2, z0, scale, centerX, centerY);

      // Ceiling vertices (partial height)
      const p4 = toIsometric(-width / 2, -length / 2, z1, scale, centerX, centerY);
      const p5 = toIsometric(width / 2, -length / 2, z1, scale, centerX, centerY);
      const p6 = toIsometric(width / 2, length / 2, z1, scale, centerX, centerY);
      const p7 = toIsometric(-width / 2, length / 2, z1, scale, centerX, centerY);

      // Collect vertices
      allVertices.push(p4, p5, p6, p7);

      // Ceiling edges (hairline - thinner stroke to indicate partial)
      allEdges.push([p4, p5], [p5, p6], [p6, p7], [p7, p4]);

      // Vertical edges (hairline)
      allEdges.push([p0, p4], [p1, p5], [p2, p6], [p3, p7]);

      // Fractional story label (mezzanine/adiabatic floor area)
      const mezzanineArea = geometry.mezzanineArea || 0;
      const labelPos = toIsometric(0, 0, z0 + (fractionalPart * storyHeight) / 2, scale, centerX, centerY);
      const label = createText(
        labelPos.x,
        labelPos.y,
        `${mezzanineArea.toFixed(0)} m²`,
        "#999",
        10,
        { anchor: "middle", weight: "400", style: "italic" }
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

    // Validate roof height (allow 0 for flat/failed roofs, but catch NaN/Infinity)
    if (isNaN(roofHeight) || !isFinite(roofHeight)) {
      console.error('[WombatRender] Invalid roof height:', roofHeight);
      console.error('  Geometry:', { width, length, wallHeight, roof: geometry.roof });
      return;
    }

    // If roof height is 0, don't render (flat roof or geometric impossibility)
    if (roofHeight === 0) {
      console.log('[WombatRender] Roof height is 0 - skipping pyramid rendering (flat roof)');
      return;
    }

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
      `Roof: ${Math.abs(roofHeight).toFixed(1)}m`,
      roofColor,
      10,
      { style: "italic" }
    );
    svg.appendChild(roofLabel);
  }

  /**
   * Render gable roof geometry using rational trigonometry
   * @param {SVGElement} svg - Target SVG element
   * @param {Object} geometry - Geometry object with roof data
   * @param {string} mode - "target" or "reference"
   * @param {number} scale - Isometric scale factor
   * @param {number} centerX - SVG center X coordinate
   * @param {number} centerY - SVG center Y coordinate
   */
  function renderGableRoof(svg, geometry, mode, scale, centerX, centerY) {
    const isReference = mode === "reference";
    const roofColor = isReference ? config.colors.reference : config.colors.target;

    const { width, length } = geometry.footprint;
    const wallHeight = geometry.height;
    const roofHeight = geometry.roof.height;
    const gableData = geometry.roof.gableData;

    // Debug logging
    console.log('[WombatRender] renderGableRoof called with:');
    console.log('  width:', width, 'length:', length, 'wallHeight:', wallHeight, 'roofHeight:', roofHeight);
    console.log('  scale:', scale, 'centerX:', centerX, 'centerY:', centerY);
    console.log('  gableData:', gableData);

    // Validate roof data
    if (!gableData || !gableData.isValid) {
      console.error('[WombatRender] Invalid gable roof data');
      return;
    }

    if (isNaN(roofHeight) || !isFinite(roofHeight) || roofHeight === 0) {
      console.error('[WombatRender] Invalid roof height:', roofHeight);
      return;
    }

    // Ridge runs along longer dimension
    const ridgeOrientation = gableData.ridgeOrientation;
    const ridgeLength = gableData.ridgeLength;
    const span = gableData.span;

    // Ridge endpoints (at peak height)
    let ridge1, ridge2;
    if (ridgeOrientation === "longitudinal") {
      // Ridge runs along length (Y-axis), gable ends on width (X-axis)
      ridge1 = { x: 0, y: -length/2, z: wallHeight + roofHeight };
      ridge2 = { x: 0, y:  length/2, z: wallHeight + roofHeight };
    } else {
      // Ridge runs along width (X-axis), gable ends on length (Y-axis)
      ridge1 = { x: -width/2, y: 0, z: wallHeight + roofHeight };
      ridge2 = { x:  width/2, y: 0, z: wallHeight + roofHeight };
    }

    // Four corners of roof base (top of walls)
    const roofBase = [
      { x: -width/2, y: -length/2, z: wallHeight }, // SW corner
      { x:  width/2, y: -length/2, z: wallHeight }, // SE corner
      { x:  width/2, y:  length/2, z: wallHeight }, // NE corner
      { x: -width/2, y:  length/2, z: wallHeight }  // NW corner
    ];

    // Draw gable roof geometry
    if (ridgeOrientation === "longitudinal") {
      // Gable ends on North (NE-NW) and South (SE-SW) faces
      // Ridge runs East-West along length

      // South gable end (triangular): SW - SE - ridge1
      drawTriangle(svg, roofBase[0], roofBase[1], ridge1, scale, centerX, centerY, roofColor);

      // North gable end (triangular): NE - NW - ridge2
      drawTriangle(svg, roofBase[2], roofBase[3], ridge2, scale, centerX, centerY, roofColor);

      // West slope (rectangular): SW - NW - ridge2 - ridge1
      const west1 = createLine(
        toIsometric(roofBase[3].x, roofBase[3].y, roofBase[3].z, scale, centerX, centerY),
        toIsometric(ridge2.x, ridge2.y, ridge2.z, scale, centerX, centerY),
        roofColor
      );
      const west2 = createLine(
        toIsometric(ridge2.x, ridge2.y, ridge2.z, scale, centerX, centerY),
        toIsometric(ridge1.x, ridge1.y, ridge1.z, scale, centerX, centerY),
        roofColor
      );
      const west3 = createLine(
        toIsometric(ridge1.x, ridge1.y, ridge1.z, scale, centerX, centerY),
        toIsometric(roofBase[0].x, roofBase[0].y, roofBase[0].z, scale, centerX, centerY),
        roofColor
      );
      svg.appendChild(west1);
      svg.appendChild(west2);
      svg.appendChild(west3);

      // East slope (rectangular): SE - NE - ridge2 - ridge1
      const east1 = createLine(
        toIsometric(roofBase[1].x, roofBase[1].y, roofBase[1].z, scale, centerX, centerY),
        toIsometric(ridge1.x, ridge1.y, ridge1.z, scale, centerX, centerY),
        roofColor
      );
      const east2 = createLine(
        toIsometric(ridge1.x, ridge1.y, ridge1.z, scale, centerX, centerY),
        toIsometric(ridge2.x, ridge2.y, ridge2.z, scale, centerX, centerY),
        roofColor
      );
      const east3 = createLine(
        toIsometric(ridge2.x, ridge2.y, ridge2.z, scale, centerX, centerY),
        toIsometric(roofBase[2].x, roofBase[2].y, roofBase[2].z, scale, centerX, centerY),
        roofColor
      );
      svg.appendChild(east1);
      svg.appendChild(east2);
      svg.appendChild(east3);

    } else {
      // Gable ends on East (SE-NE) and West (SW-NW) faces
      // Ridge runs North-South along width

      // West gable end (triangular): SW - NW - ridge1
      drawTriangle(svg, roofBase[0], roofBase[3], ridge1, scale, centerX, centerY, roofColor);

      // East gable end (triangular): SE - NE - ridge2
      drawTriangle(svg, roofBase[1], roofBase[2], ridge2, scale, centerX, centerY, roofColor);

      // South slope (rectangular): SW - SE - ridge2 - ridge1
      const south1 = createLine(
        toIsometric(roofBase[0].x, roofBase[0].y, roofBase[0].z, scale, centerX, centerY),
        toIsometric(roofBase[1].x, roofBase[1].y, roofBase[1].z, scale, centerX, centerY),
        roofColor
      );
      const south2 = createLine(
        toIsometric(roofBase[1].x, roofBase[1].y, roofBase[1].z, scale, centerX, centerY),
        toIsometric(ridge2.x, ridge2.y, ridge2.z, scale, centerX, centerY),
        roofColor
      );
      const south3 = createLine(
        toIsometric(ridge2.x, ridge2.y, ridge2.z, scale, centerX, centerY),
        toIsometric(ridge1.x, ridge1.y, ridge1.z, scale, centerX, centerY),
        roofColor
      );
      svg.appendChild(south1);
      svg.appendChild(south2);
      svg.appendChild(south3);

      // North slope (rectangular): NW - NE - ridge2 - ridge1
      const north1 = createLine(
        toIsometric(roofBase[3].x, roofBase[3].y, roofBase[3].z, scale, centerX, centerY),
        toIsometric(ridge1.x, ridge1.y, ridge1.z, scale, centerX, centerY),
        roofColor
      );
      const north2 = createLine(
        toIsometric(ridge1.x, ridge1.y, ridge1.z, scale, centerX, centerY),
        toIsometric(ridge2.x, ridge2.y, ridge2.z, scale, centerX, centerY),
        roofColor
      );
      const north3 = createLine(
        toIsometric(ridge2.x, ridge2.y, ridge2.z, scale, centerX, centerY),
        toIsometric(roofBase[2].x, roofBase[2].y, roofBase[2].z, scale, centerX, centerY),
        roofColor
      );
      svg.appendChild(north1);
      svg.appendChild(north2);
      svg.appendChild(north3);
    }

    // Draw ridge line (prominent)
    const ridgeLine = createLine(
      toIsometric(ridge1.x, ridge1.y, ridge1.z, scale, centerX, centerY),
      toIsometric(ridge2.x, ridge2.y, ridge2.z, scale, centerX, centerY),
      roofColor,
      3
    );
    svg.appendChild(ridgeLine);

    // Draw ridge endpoint nodes
    const ridge1Pt = toIsometric(ridge1.x, ridge1.y, ridge1.z, scale, centerX, centerY);
    const ridge2Pt = toIsometric(ridge2.x, ridge2.y, ridge2.z, scale, centerX, centerY);
    svg.appendChild(createNode(ridge1Pt, roofColor, 5));
    svg.appendChild(createNode(ridge2Pt, roofColor, 5));

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
      `Gable: ${roofHeight.toFixed(1)}m`,
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
   * Render dimension annotations (X/East, Y/North, building height)
   * Per user request: Label dimensions as "X: 33.2m" and "Y: 33.2m"
   */
  function renderDimensions(svg, geometry, mode, scale, centerX, centerY) {
    const isReference = mode === "reference";
    const modelColor = isReference ? config.colors.reference : config.colors.target;

    const length = geometry.footprint.length;  // Y-axis (North)
    const width = geometry.footprint.width;    // X-axis (East)
    const height = geometry.height;

    // Y-dimension label (North, length along Y-axis)
    const yDimPos = toIsometric(0, -length / 2 - 5, 0, scale, centerX, centerY);
    const yDimLabel = createText(
      yDimPos.x,
      yDimPos.y + 15,
      `Y: ${length.toFixed(1)}m`,
      modelColor,
      11,
      { anchor: "middle" }
    );
    svg.appendChild(yDimLabel);

    // X-dimension label (East, width along X-axis)
    const xDimPos = toIsometric(width / 2 + 5, 0, 0, scale, centerX, centerY);
    const xDimLabel = createText(
      xDimPos.x + 20,
      xDimPos.y,
      `X: ${width.toFixed(1)}m`,
      modelColor,
      11,
      { anchor: "middle" }
    );
    svg.appendChild(xDimLabel);

    // Height label (left edge) - keep as is
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
   * Shows diagnostic calculations for verifying geometry solver
   */
  function renderInfoOverlay(svg, geometry, mode) {
    const isReference = mode === "reference";
    const modelColor = isReference ? config.colors.reference : config.colors.target;

    // Calculate volume per floor
    const volumePerFloor = geometry.volume / geometry.stories;

    // Build diagnostic info lines
    const infoLines = [];

    // Stories line - handle mezzanine vs equal floorplates differently
    if (geometry.mezzanineArea && geometry.mezzanineArea > 0.1) {
      // Mezzanine case: show conditioned area directly (not multiplication)
      const conditionedArea = geometry.areaPerFloor + geometry.mezzanineArea;
      infoLines.push(`Stories: ${geometry.stories}: ${conditionedArea.toFixed(1)} m² Conditioned Area`);
      infoLines.push(`Mezzanine Area: ${geometry.mezzanineArea.toFixed(1)} m²`);
    } else {
      // Equal floorplates: show multiplication
      infoLines.push(`Stories: ${geometry.stories} × ${geometry.areaPerFloor.toFixed(1)} m² = ${(geometry.stories * geometry.areaPerFloor).toFixed(1)} m²`);
    }

    infoLines.push(`Footprint: ${geometry.footprint.length.toFixed(1)}m × ${geometry.footprint.width.toFixed(1)}m`);
    infoLines.push(`Story Height: ${geometry.storyHeight.toFixed(2)}m`);
    infoLines.push(`Total Volume: ${geometry.volume.toFixed(0)} m³ (${volumePerFloor.toFixed(0)} m³/floor)`);

    // Show roof area and type
    if (geometry.roof) {
      const roofArea = geometry.footprint.area * geometry.roof.areaRatio;
      infoLines.push(`Roof Area: ${roofArea.toFixed(2)} m² (ridge ht. determined from this)`);

      // Show gable area if gable roof
      if (geometry.roof.type === "gable" && geometry.roof.gableEndArea > 0) {
        infoLines.push(`Gable Area: ${geometry.roof.gableEndArea.toFixed(2)} m²`);
      }
    }

    // Show effective wall area (excluding gable ends)
    if (geometry.walls && geometry.walls.effectiveArea) {
      infoLines.push(`Ae Walls: ${geometry.walls.effectiveArea.toFixed(2)} m²`);
    }

    const x = 20;
    let y = 30;
    const lineHeight = 18;

    infoLines.forEach((line) => {
      const infoText = createText(x, y, line, modelColor, 12, {});
      infoText.setAttribute("font-family", "monospace");
      svg.appendChild(infoText);
      y += lineHeight;
    });

    // Add coordinate axes indicator (bottom-left)
    renderCoordinateAxes(svg);
  }

  /**
   * Render coordinate axes indicator (X/East, Y/North, Z/Up)
   */
  function renderCoordinateAxes(svg) {
    const x0 = 50;
    const y0 = config.canvasHeight - 100;
    const axisLength = 40;

    // Z-axis (Up) - blue
    const zLine = createLine(
      {x: x0, y: y0},
      {x: x0, y: y0 - axisLength},
      "#0066cc",
      2
    );
    svg.appendChild(zLine);
    const zLabel = createText(x0 - 5, y0 - axisLength - 5, "Z/Up", "#0066cc", 11, {});
    svg.appendChild(zLabel);

    // Y-axis (North) - green, isometric
    const yEndIso = toIsometric(0, axisLength, 0, 1, x0, y0);
    const yLine = createLine(
      {x: x0, y: y0},
      yEndIso,
      "#00cc66",
      2
    );
    svg.appendChild(yLine);
    const yLabel = createText(yEndIso.x + 5, yEndIso.y - 5, "Y/North", "#00cc66", 11, {});
    svg.appendChild(yLabel);

    // X-axis (East) - red, isometric
    const xEndIso = toIsometric(axisLength, 0, 0, 1, x0, y0);
    const xLine = createLine(
      {x: x0, y: y0},
      xEndIso,
      "#cc0000",
      2
    );
    svg.appendChild(xLine);
    const xLabel = createText(xEndIso.x + 5, xEndIso.y + 5, "X/East", "#cc0000", 11, {});
    svg.appendChild(xLabel);
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

    // Render roof geometry based on type
    if (geometry.roof && geometry.roof.type === "gable") {
      // Gable roof (biplanar)
      renderGableRoof(svgElement, geometry, mode, scale, centerX, centerY);
    } else if (geometry.roof && geometry.roof.type === "pyramidal") {
      // Pyramidal roof (multiplanar)
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
