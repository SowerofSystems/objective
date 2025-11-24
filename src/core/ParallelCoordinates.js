/**
 * ParallelCoordinates.js
 * Section 18 Parallel Coordinates Optimization Visualization
 *
 * Renders a two-line parallel coordinates graph comparing Target vs Reference
 * building configurations across 14 key performance parameters.
 *
 * Architecture follows S16C.js pattern with D3.js v7 native support.
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};

window.TEUI.ParallelCoordinates = (function () {
  "use strict";

  // ========================================================================
  // CONFIGURATION
  // ========================================================================

  const CONFIG = {
    // Layout
    graphHeightPercent: 0.75,     // 75% for graph (adjusted from 80% to accommodate controls)
    tableHeightPercent: 0.25,     // 25% for table
    margin: {
      top: 60,                    // Space for axis labels
      right: 40,
      bottom: 20,
      left: 40,
    },

    // Visual styling
    colors: {
      target: "#007bff",          // Blue for Target model
      reference: "#dc3545",       // Red for Reference model
      axisLine: "#ccc",
      axisText: "#333",
      gridLine: "#eee",
    },

    // Line styling
    lineWidth: 3,
    lineWidthHover: 4,
    lineOpacity: 0.9,
    lineOpacityHover: 1,

    // Animation
    transitionDuration: 300,

    // Container selectors
    containerSelector: ".parallel-coordinates-container",
    controlsSelector: ".parallel-coordinates-controls-wrapper",
    infoSelector: ".parallel-coordinates-info-wrapper",
  };

  // ========================================================================
  // STATE
  // ========================================================================

  let svgElement = null;
  let tableElement = null;
  let currentData = null;
  let isFullscreen = false;

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  /**
   * Initialize the parallel coordinates visualization
   * Called by Section18.js initializeEventHandlers()
   */
  function initialize() {
    console.log("[ParallelCoordinates] Initializing visualization");

    // Setup control panel
    initializeControls();

    // Initial render
    refresh();
  }

  /**
   * Setup control panel buttons
   */
  function initializeControls() {
    const controlsWrapper = document.querySelector(CONFIG.controlsSelector);
    if (!controlsWrapper) {
      console.warn("[ParallelCoordinates] Controls wrapper not found");
      return;
    }

    // Clear existing controls
    controlsWrapper.innerHTML = "";

    // Create button group
    const buttonGroup = document.createElement("div");
    buttonGroup.className = "btn-group btn-group-sm";
    buttonGroup.setAttribute("role", "group");

    // Fullscreen button
    const fullscreenBtn = createButton(
      "bi-arrows-fullscreen",
      "Toggle Fullscreen",
      toggleFullscreen
    );

    // Refresh button
    const refreshBtn = createButton(
      "bi-arrow-clockwise",
      "Refresh Data",
      refresh
    );

    // Export PNG button
    const exportBtn = createButton(
      "bi-download",
      "Export as PNG",
      exportToPNG
    );

    // Settings button (future enhancement)
    const settingsBtn = createButton(
      "bi-gear",
      "Settings",
      () => alert("Settings panel coming soon!")
    );

    // Append buttons
    buttonGroup.appendChild(fullscreenBtn);
    buttonGroup.appendChild(refreshBtn);
    buttonGroup.appendChild(exportBtn);
    buttonGroup.appendChild(settingsBtn);

    controlsWrapper.appendChild(buttonGroup);

    console.log("[ParallelCoordinates] Controls initialized");
  }

  /**
   * Helper to create a button with icon
   */
  function createButton(iconClass, tooltip, clickHandler) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-outline-secondary";
    btn.setAttribute("title", tooltip);
    btn.innerHTML = `<i class="bi ${iconClass}"></i>`;
    btn.addEventListener("click", clickHandler);
    return btn;
  }

  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  /**
   * Fetch current data from StateManager via ParallelCoordinatesConfig
   * Returns data structure ready for rendering
   */
  function fetchData() {
    console.log("[ParallelCoordinates] Fetching data from StateManager");

    // Use config module's data fetcher
    if (!window.TEUI.getParallelCoordinatesData) {
      console.error("[ParallelCoordinates] Config module not loaded");
      return null;
    }

    const data = window.TEUI.getParallelCoordinatesData();

    // Validate data
    if (!data || !data.axes || data.axes.length === 0) {
      console.warn("[ParallelCoordinates] No valid data available");
      return null;
    }

    console.log("[ParallelCoordinates] Fetched data for", data.axes.length, "axes");
    return data;
  }

  // ========================================================================
  // RENDERING
  // ========================================================================

  /**
   * Main refresh function - fetches data and re-renders visualization
   */
  function refresh() {
    console.log("[ParallelCoordinates] Refreshing visualization");

    // Fetch current data
    currentData = fetchData();

    if (!currentData) {
      console.warn("[ParallelCoordinates] Cannot render - no data available");
      showErrorMessage("No data available. Please ensure all required fields are calculated.");
      return;
    }

    // Render graph and table
    renderGraph();
    renderTable();
  }

  /**
   * Render the parallel coordinates graph using D3.js v7
   */
  function renderGraph() {
    const container = document.querySelector(CONFIG.containerSelector);
    if (!container) {
      console.error("[ParallelCoordinates] Container not found");
      return;
    }

    // Clear existing SVG
    container.innerHTML = "";

    // Calculate dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight * CONFIG.graphHeightPercent;
    const width = containerWidth - CONFIG.margin.left - CONFIG.margin.right;
    const height = containerHeight - CONFIG.margin.top - CONFIG.margin.bottom;

    console.log("[ParallelCoordinates] Rendering graph:", width, "x", height);

    // Create SVG
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .append("g")
      .attr("transform", `translate(${CONFIG.margin.left},${CONFIG.margin.top})`);

    svgElement = svg;

    // Extract data
    const { axes, targetData, referenceData } = currentData;
    const numAxes = axes.length;

    // Calculate horizontal spacing for axes
    const xScale = d3
      .scaleLinear()
      .domain([0, numAxes - 1])
      .range([0, width]);

    // Create vertical scale for each axis with dynamic domain adjustment
    const yScales = axes.map((axis, i) => {
      const targetVal = targetData[i];
      const refVal = referenceData[i];

      // Get min/max from both data values
      const dataMin = Math.min(targetVal, refVal);
      const dataMax = Math.max(targetVal, refVal);

      // Expand domain if data exceeds configured domain
      let [domainMin, domainMax] = axis.domain;

      // Add 10% padding to accommodate outliers
      if (dataMin < domainMin) {
        domainMin = dataMin * 0.9;
      }
      if (dataMax > domainMax) {
        domainMax = dataMax * 1.1;
      }

      return d3
        .scaleLinear()
        .domain([domainMin, domainMax])
        .range([height, 0]);
    });

    // ====================================================================
    // DRAW AXES
    // ====================================================================

    const axisGroup = svg
      .selectAll(".axis")
      .data(axes)
      .enter()
      .append("g")
      .attr("class", "axis")
      .attr("transform", (d, i) => `translate(${xScale(i)},0)`);

    // Draw vertical axis lines
    axisGroup
      .append("line")
      .attr("y1", 0)
      .attr("y2", height)
      .style("stroke", CONFIG.colors.axisLine)
      .style("stroke-width", 2);

    // Draw axis labels (top)
    axisGroup
      .append("text")
      .attr("y", -25)
      .attr("text-anchor", "middle")
      .style("fill", CONFIG.colors.axisText)
      .style("font-weight", "600")
      .style("font-size", "12px")
      .text(d => d.label);

    // Draw axis units (top, below label)
    axisGroup
      .append("text")
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("fill", CONFIG.colors.axisText)
      .style("font-size", "10px")
      .text(d => d.unit);

    // Draw axis ticks and labels (min/max) using dynamic domains
    axisGroup.each(function (axis, i) {
      const axisG = d3.select(this);
      const scale = yScales[i];
      const [domainMin, domainMax] = scale.domain();

      // Min value (bottom)
      axisG
        .append("text")
        .attr("y", height + 15)
        .attr("text-anchor", "middle")
        .style("fill", CONFIG.colors.axisText)
        .style("font-size", "9px")
        .text(domainMin.toFixed(1));

      // Max value (top)
      axisG
        .append("text")
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .style("fill", CONFIG.colors.axisText)
        .style("font-size", "9px")
        .text(domainMax.toFixed(1));
    });

    // ====================================================================
    // DRAW LINES
    // ====================================================================

    // Line path generator with curved splines
    const line = d3.line()
      .x((d, i) => xScale(i))
      .y((d, i) => yScales[i](d))
      .curve(d3.curveMonotoneX); // Smooth curved splines through points

    // Draw Reference line (behind)
    svg
      .append("path")
      .datum(referenceData)
      .attr("class", "reference-line")
      .attr("d", line)
      .style("stroke", CONFIG.colors.reference)
      .style("stroke-width", CONFIG.lineWidth)
      .style("fill", "none")
      .style("opacity", CONFIG.lineOpacity)
      .on("mouseover", function () {
        d3.select(this)
          .style("stroke-width", CONFIG.lineWidthHover)
          .style("opacity", CONFIG.lineOpacityHover);
      })
      .on("mouseout", function () {
        d3.select(this)
          .style("stroke-width", CONFIG.lineWidth)
          .style("opacity", CONFIG.lineOpacity);
      });

    // Draw Target line (in front)
    svg
      .append("path")
      .datum(targetData)
      .attr("class", "target-line")
      .attr("d", line)
      .style("stroke", CONFIG.colors.target)
      .style("stroke-width", CONFIG.lineWidth)
      .style("fill", "none")
      .style("opacity", CONFIG.lineOpacity)
      .on("mouseover", function () {
        d3.select(this)
          .style("stroke-width", CONFIG.lineWidthHover)
          .style("opacity", CONFIG.lineOpacityHover);
      })
      .on("mouseout", function () {
        d3.select(this)
          .style("stroke-width", CONFIG.lineWidth)
          .style("opacity", CONFIG.lineOpacity);
      });

    // ====================================================================
    // DRAW DATA POINTS (optional, for clarity)
    // ====================================================================

    // Target points
    axes.forEach((axis, i) => {
      svg
        .append("circle")
        .attr("cx", xScale(i))
        .attr("cy", yScales[i](targetData[i]))
        .attr("r", 4)
        .style("fill", CONFIG.colors.target)
        .style("stroke", "white")
        .style("stroke-width", 2);
    });

    // Reference points
    axes.forEach((axis, i) => {
      svg
        .append("circle")
        .attr("cx", xScale(i))
        .attr("cy", yScales[i](referenceData[i]))
        .attr("r", 4)
        .style("fill", CONFIG.colors.reference)
        .style("stroke", "white")
        .style("stroke-width", 2);
    });

    // ====================================================================
    // LEGEND
    // ====================================================================

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 150}, -50)`);

    // Target legend
    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 30)
      .attr("y1", 0)
      .attr("y2", 0)
      .style("stroke", CONFIG.colors.target)
      .style("stroke-width", CONFIG.lineWidth);

    legend
      .append("text")
      .attr("x", 35)
      .attr("y", 4)
      .text("Target")
      .style("font-size", "12px")
      .style("fill", CONFIG.colors.axisText);

    // Reference legend
    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 30)
      .attr("y1", 15)
      .attr("y2", 15)
      .style("stroke", CONFIG.colors.reference)
      .style("stroke-width", CONFIG.lineWidth);

    legend
      .append("text")
      .attr("x", 35)
      .attr("y", 19)
      .text("Reference")
      .style("font-size", "12px")
      .style("fill", CONFIG.colors.axisText);

    console.log("[ParallelCoordinates] Graph rendered successfully");
  }

  /**
   * Render the data table below the graph
   */
  function renderTable() {
    const container = document.querySelector(CONFIG.containerSelector);
    if (!container) {
      console.error("[ParallelCoordinates] Container not found for table");
      return;
    }

    // Remove existing table if present
    const existingTable = container.querySelector(".pc-data-table");
    if (existingTable) {
      existingTable.remove();
    }

    // Create table wrapper
    const tableWrapper = document.createElement("div");
    tableWrapper.className = "pc-data-table mt-3";
    tableWrapper.style.maxHeight = "200px";
    tableWrapper.style.overflowY = "auto";

    // Create table
    const table = document.createElement("table");
    table.className = "table table-sm table-striped table-hover";
    table.style.fontSize = "11px";

    // Table header - transposed to match graph layout (axes as columns)
    const thead = document.createElement("thead");
    const { axes, targetData, referenceData } = currentData;

    // Build header row with axis labels
    let headerHTML = '<tr><th></th>'; // Empty cell for row labels
    axes.forEach(axis => {
      headerHTML += `<th class="text-center"><strong>${axis.label}</strong><br><small class="text-muted">${axis.unit}</small></th>`;
    });
    headerHTML += '</tr>';
    thead.innerHTML = headerHTML;
    table.appendChild(thead);

    // Table body - transposed rows
    const tbody = document.createElement("tbody");

    // Target row
    const targetRow = document.createElement("tr");
    targetRow.innerHTML = `<td style="color: ${CONFIG.colors.target}"><strong>Target</strong></td>`;
    targetData.forEach(val => {
      targetRow.innerHTML += `<td class="text-center" style="color: ${CONFIG.colors.target}">${val.toFixed(2)}</td>`;
    });
    tbody.appendChild(targetRow);

    // Reference row
    const referenceRow = document.createElement("tr");
    referenceRow.innerHTML = `<td style="color: ${CONFIG.colors.reference}"><strong>Reference</strong></td>`;
    referenceData.forEach(val => {
      referenceRow.innerHTML += `<td class="text-center" style="color: ${CONFIG.colors.reference}">${val.toFixed(2)}</td>`;
    });
    tbody.appendChild(referenceRow);

    // Delta row
    const deltaRow = document.createElement("tr");
    deltaRow.innerHTML = '<td><strong>Δ</strong></td>';
    axes.forEach((axis, i) => {
      const delta = targetData[i] - referenceData[i];
      let deltaClass = "";
      if (axis.optimal === "higher") {
        deltaClass = delta > 0 ? "text-success" : "text-danger";
      } else if (axis.optimal === "lower") {
        deltaClass = delta < 0 ? "text-success" : "text-danger";
      }
      deltaRow.innerHTML += `<td class="text-center ${deltaClass}">${delta >= 0 ? "+" : ""}${delta.toFixed(2)}</td>`;
    });
    tbody.appendChild(deltaRow);

    // Percent Delta row
    const percentRow = document.createElement("tr");
    percentRow.innerHTML = '<td><strong>%Δ</strong></td>';
    axes.forEach((axis, i) => {
      const delta = targetData[i] - referenceData[i];
      const reference = referenceData[i];
      const percentDelta = reference !== 0 ? ((delta / reference) * 100) : 0;
      let deltaClass = "";
      if (axis.optimal === "higher") {
        deltaClass = delta > 0 ? "text-success" : "text-danger";
      } else if (axis.optimal === "lower") {
        deltaClass = delta < 0 ? "text-success" : "text-danger";
      }
      percentRow.innerHTML += `<td class="text-center ${deltaClass}">${percentDelta >= 0 ? "+" : ""}${percentDelta.toFixed(1)}%</td>`;
    });
    tbody.appendChild(percentRow);

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);

    tableElement = tableWrapper;

    console.log("[ParallelCoordinates] Table rendered with", axes.length, "rows");
  }

  /**
   * Show error message in container
   */
  function showErrorMessage(message) {
    const container = document.querySelector(CONFIG.containerSelector);
    if (!container) return;

    container.innerHTML = `
      <div class="alert alert-warning mt-3" role="alert">
        <i class="bi bi-exclamation-triangle"></i> ${message}
      </div>
    `;
  }

  // ========================================================================
  // CONTROL HANDLERS
  // ========================================================================

  /**
   * Toggle fullscreen mode
   */
  function toggleFullscreen() {
    const section = document.getElementById("parallelCoordinates");
    if (!section) return;

    isFullscreen = !isFullscreen;

    if (isFullscreen) {
      section.style.position = "fixed";
      section.style.top = "0";
      section.style.left = "0";
      section.style.width = "100vw";
      section.style.height = "100vh";
      section.style.zIndex = "9999";
      section.style.background = "white";
      section.style.overflow = "auto";
    } else {
      section.style.position = "";
      section.style.top = "";
      section.style.left = "";
      section.style.width = "";
      section.style.height = "";
      section.style.zIndex = "";
      section.style.background = "";
      section.style.overflow = "";
    }

    // Re-render to adjust to new dimensions
    setTimeout(refresh, 100);

    console.log("[ParallelCoordinates] Fullscreen:", isFullscreen);
  }

  /**
   * Export visualization as PNG
   */
  function exportToPNG() {
    console.log("[ParallelCoordinates] Exporting to PNG...");

    const svgNode = document.querySelector(CONFIG.containerSelector + " svg");
    if (!svgNode) {
      alert("No graph to export");
      return;
    }

    // Serialize SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgNode);

    // Create canvas
    const canvas = document.createElement("canvas");
    const bbox = svgNode.getBoundingClientRect();
    canvas.width = bbox.width;
    canvas.height = bbox.height;

    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = function () {
      ctx.drawImage(img, 0, 0);

      // Download
      canvas.toBlob(function (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "parallel-coordinates-optimization.png";
        a.click();
        URL.revokeObjectURL(url);
        console.log("[ParallelCoordinates] PNG export complete");
      });
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
  }

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  return {
    initialize,
    refresh,
    initializeControls,
    toggleFullscreen,
    exportToPNG,
  };
})();

console.log("[ParallelCoordinates] Module loaded");
