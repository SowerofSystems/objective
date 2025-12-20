/**
 * wombatRender-2.js - WOMBAT Prismatic Rendering (WOMBAT 4)
 * TEUI 4.012
 *
 * Minimal stub renderer for prismatic extrusion approach
 * Will render from 8-node geometry (4 ground + 4 eave corners)
 */

window.TEUI = window.TEUI || {};
window.TEUI.WombatRender2 = (function () {
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
  // HELPER FUNCTIONS
  //==========================================================================

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
   * STUB: Render function - minimal implementation for testing
   */
  function render(svg, geometry, isReference) {
    console.log("[WombatRender-4] Prismatic render stub called");
    console.log("  Geometry:", geometry);
    console.log("  IsReference:", isReference);

    // Clear SVG
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Add placeholder text
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", "450");
    text.setAttribute("y", "300");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#666");
    text.setAttribute("font-size", "24");
    text.textContent = "WOMBAT 4 Prismatic Renderer - Coming Soon";
    svg.appendChild(text);
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    render: render,
    renderPlaceholder: renderPlaceholder,
  };
})();
