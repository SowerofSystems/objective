/**
 * ParallelCoordinates.js
 * Section 18 Interactive Parallel Coordinates Optimization Visualization
 *
 * Renders a two-line parallel coordinates graph comparing Target vs Reference
 * building configurations across 14 key performance parameters.
 *
 * Architecture follows S16C.js pattern with D3.js v7 native support.
 *
 * @agent NOVA - November 25, 2025
 * Named for the stellar explosion that transforms a star system at critical threshold,
 * like our auto fuel-type switching where Gas/Oil becomes Heatpump at 100% efficiency.
 * A nova represents dramatic transformation and the creation of something brighter.
 *
 * Key implementations by NOVA:
 * - Interactive node dragging with Pattern A (mode-aware state updates)
 * - Multi-fuel conditional editing (SHW%, HEAT%)
 * - HSPF inversion formula for heatpump COP conversion
 * - Auto fuel-type switching (Gas/Oil → Heatpump at >100%)
 * - Real-time COP/HSPF modal display
 * - Discrete dropdown pattern (nGains% PHPP method)
 * - Dropdown flip pattern (ACH50 measured toggle)
 * - Financial calculations integration (pcFinancials.js)
 * - 5 interactive axes with 8 sophisticated patterns (A-H)
 *
 * Standing alongside: COSMO, HELIOS, ORIONIS, STELLARIA, ANDROMEDA, in Technical.md
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
    graphHeightPercent: 0.55, // 55% for graph (275px of 500px container)
    tableHeightPercent: 0.45, // 45% for table (225px + padding)
    margin: {
      top: 60, // Space for axis labels
      right: 55,
      bottom: 20,
      left: 115, // Matches row label width for perfect alignment
    },

    // Financial settings
    roiTerm: 1, // Default ROI term in years (multiplier for cost calculations)

    // Visual styling
    colors: {
      target: "#007bff", // Blue for Target model
      reference: "#dc3545", // Red for Reference model
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
  let isActivated = false; // Track whether visualization has been activated

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  /**
   * Initialize the parallel coordinates visualization
   * Called by DOMContentLoaded listener (similar to S17 pattern)
   */
  function initialize() {
    console.log("[ParallelCoordinates] Setting up initial state");

    const container = document.querySelector(CONFIG.containerSelector);
    const controlsWrapper = document.querySelector(CONFIG.controlsSelector);

    if (!container || !controlsWrapper) {
      console.warn("[ParallelCoordinates] Required containers not found");
      return;
    }

    // Create initial controls row with activate button and disabled controls
    createInitialControlsRow(controlsWrapper);

    // Create loading placeholder message
    createLoadingPlaceholder(container);

    console.log("[ParallelCoordinates] Initial state ready");
  }

  /**
   * Create initial controls row with activation button and placeholder controls
   * All controls except Activate button are disabled until visualization is activated
   */
  function createInitialControlsRow(controlsWrapper) {
    // Clear existing controls
    controlsWrapper.innerHTML = "";

    // Create controls container (CSS handles layout)
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "parallel-coordinates-controls";

    // Create activation button
    const activateBtn = document.createElement("button");
    activateBtn.id = "s18ActivateBtn";
    activateBtn.className = "btn btn-primary btn-sm";
    activateBtn.innerHTML =
      '<i class="bi bi-shuffle"></i> Activate Optimization View';
    activateBtn.addEventListener("click", activateVisualization);

    // Create layout container for other buttons (disabled) - CSS handles margin-left: auto
    const layoutContainer = document.createElement("div");

    // Refresh button (disabled)
    const refreshBtn = document.createElement("button");
    refreshBtn.className = "btn btn-outline-secondary btn-sm";
    refreshBtn.title = "Refresh Data";
    refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
    refreshBtn.disabled = true;

    // Export button (disabled)
    const exportBtn = document.createElement("button");
    exportBtn.className = "btn btn-outline-secondary btn-sm";
    exportBtn.title = "Export as PNG";
    exportBtn.innerHTML = '<i class="bi bi-download"></i>';
    exportBtn.disabled = true;

    // Settings button (disabled)
    const settingsBtn = document.createElement("button");
    settingsBtn.className = "btn btn-outline-secondary btn-sm";
    settingsBtn.title = "Settings";
    settingsBtn.innerHTML = '<i class="bi bi-gear"></i>';
    settingsBtn.disabled = true;

    // Fullscreen button (disabled) - added LAST so it's at far right
    const fullscreenBtn = document.createElement("button");
    fullscreenBtn.className = "btn btn-outline-secondary btn-sm";
    fullscreenBtn.title = "Toggle Fullscreen";
    fullscreenBtn.innerHTML = '<i class="bi bi-arrows-fullscreen"></i>';
    fullscreenBtn.disabled = true;

    // Append buttons in order: Refresh, Export, Settings, Fullscreen (far right)
    layoutContainer.appendChild(refreshBtn);
    layoutContainer.appendChild(exportBtn);
    layoutContainer.appendChild(settingsBtn);
    layoutContainer.appendChild(fullscreenBtn);

    // Assemble controls row
    controlsContainer.appendChild(activateBtn);
    controlsContainer.appendChild(layoutContainer);

    controlsWrapper.appendChild(controlsContainer);
  }

  /**
   * Create loading placeholder message
   */
  function createLoadingPlaceholder(container) {
    const placeholder = document.createElement("div");
    placeholder.id = "s18LoadingPlaceholder";
    placeholder.className = "teui-loading-placeholder";
    placeholder.innerHTML =
      "<p>Click 'Activate Optimization View' to visualize optimization paths between Target and Reference configurations.</p>";
    placeholder.style.cssText =
      "padding: 40px 20px; text-align: center; background: #f9f9f9; border-radius: 4px; color: #666;";

    // Clear container and add placeholder
    container.innerHTML = "";
    container.appendChild(placeholder);
  }

  /**
   * Activate the visualization (show and render)
   */
  function activateVisualization() {
    console.log("[ParallelCoordinates] Activating visualization");

    const container = document.querySelector(CONFIG.containerSelector);
    const placeholder = document.getElementById("s18LoadingPlaceholder");

    if (!container) return;

    // Add activated class to expand container (CSS: .activated { height: 500px })
    container.classList.add("activated");

    // Hide placeholder
    if (placeholder) {
      placeholder.style.display = "none";
    }

    // Mark as activated BEFORE recreating controls
    isActivated = true;

    // Enable other controls and setup full control panel
    // This will recreate the controls row with the button transformed to "Refresh Graph"
    initializeFullControls();

    // Initial render
    refresh();
  }

  /**
   * Setup full control panel with enabled buttons
   */
  function initializeFullControls() {
    const controlsWrapper = document.querySelector(CONFIG.controlsSelector);
    if (!controlsWrapper) return;

    const existingControls = controlsWrapper.querySelector(
      ".parallel-coordinates-controls"
    );
    if (existingControls) {
      existingControls.remove();
    }

    // Create new controls container (CSS handles layout)
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "parallel-coordinates-controls";

    // Create the activate/refresh button based on state
    const mainBtn = document.createElement("button");
    mainBtn.id = "s18ActivateBtn";
    if (isActivated) {
      // Already activated - show as Refresh button
      mainBtn.className = "btn btn-outline-secondary btn-sm";
      mainBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Refresh Graph';
      mainBtn.addEventListener("click", refresh);
    } else {
      // Not activated yet - show as Activate button
      mainBtn.className = "btn btn-primary btn-sm";
      mainBtn.innerHTML =
        '<i class="bi bi-shuffle"></i> Activate Optimization View';
      mainBtn.addEventListener("click", activateVisualization);
    }

    // Create layout container for buttons (CSS handles margin-left: auto)
    const layoutContainer = document.createElement("div");

    // Refresh button (enabled)
    const refreshBtn = createButton(
      "bi-arrow-clockwise",
      "Refresh Data",
      refresh
    );

    // Export button (enabled)
    const exportBtn = createButton("bi-download", "Export as PNG", exportToPNG);

    // Settings button (enabled)
    const settingsBtn = createButton("bi-gear", "Settings", showSettingsModal);

    // Create inline legend (in middle of controls row)
    const legendContainer = document.createElement("div");
    legendContainer.style.cssText =
      "display: flex; gap: 15px; align-items: center; margin-left: 20px; margin-right: 20px; padding-left: 20px; border-left: 1px solid #dee2e6;";

    // Target legend
    const targetLegend = document.createElement("div");
    targetLegend.style.cssText =
      "display: flex; align-items: center; gap: 6px;";
    targetLegend.innerHTML = `
      <div style="width: 20px; height: 3px; background: ${CONFIG.colors.target};"></div>
      <span style="font-size: 12px; font-weight: 500; color: ${CONFIG.colors.target};">Target</span>
    `;

    // Reference legend
    const referenceLegend = document.createElement("div");
    referenceLegend.style.cssText =
      "display: flex; align-items: center; gap: 6px;";
    referenceLegend.innerHTML = `
      <div style="width: 20px; height: 3px; background: ${CONFIG.colors.reference};"></div>
      <span style="font-size: 12px; font-weight: 500; color: ${CONFIG.colors.reference};">Reference</span>
    `;

    legendContainer.appendChild(targetLegend);
    legendContainer.appendChild(referenceLegend);

    // Fullscreen button (enabled) - added LAST so it's at far right
    const fullscreenBtn = createButton(
      "bi-arrows-fullscreen",
      "Toggle Fullscreen",
      toggleFullscreen
    );

    // Append in order: Legend, Refresh, Export, Settings, Fullscreen
    layoutContainer.appendChild(legendContainer);
    layoutContainer.appendChild(refreshBtn);
    layoutContainer.appendChild(exportBtn);
    layoutContainer.appendChild(settingsBtn);
    layoutContainer.appendChild(fullscreenBtn);

    // Assemble controls row
    controlsContainer.appendChild(mainBtn);
    controlsContainer.appendChild(layoutContainer);

    controlsWrapper.appendChild(controlsContainer);
  }

  /**
   * Helper to create a button with icon
   */
  function createButton(iconClass, tooltip, clickHandler) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-outline-secondary btn-sm";
    btn.setAttribute("title", tooltip);
    btn.innerHTML = `<i class="bi ${iconClass}"></i>`;
    btn.addEventListener("click", clickHandler);
    return btn;
  }

  /**
   * Show settings modal for ROI Term configuration
   */
  function showSettingsModal() {
    // Create modal backdrop
    const backdrop = document.createElement("div");
    backdrop.style.cssText =
      "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

    // Create modal dialog
    const modal = document.createElement("div");
    modal.style.cssText =
      "background: white; border-radius: 8px; padding: 20px; max-width: 400px; width: 90%; box-shadow: 0 4px 16px rgba(0,0,0,0.2);";

    // Modal header
    const header = document.createElement("h5");
    header.textContent = "Financial Settings";
    header.style.cssText = "margin: 0 0 15px 0; font-weight: 600;";

    // ROI Term label
    const label = document.createElement("label");
    label.textContent = "ROI Term (Years):";
    label.style.cssText =
      "display: block; margin-bottom: 8px; font-weight: 500;";

    // ROI Term dropdown
    const select = document.createElement("select");
    select.className = "form-select";
    select.style.cssText = "margin-bottom: 20px;";

    const terms = [1, 2, 3, 4, 5, 10, 15, 20, 30, 40, 50];
    terms.forEach(year => {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = `${year} year${year > 1 ? "s" : ""}`;
      if (year === CONFIG.roiTerm) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    // Button container
    const btnContainer = document.createElement("div");
    btnContainer.style.cssText =
      "display: flex; gap: 10px; justify-content: flex-end;";

    // Cancel button
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn btn-outline-secondary";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => {
      document.body.removeChild(backdrop);
    });

    // Apply button
    const applyBtn = document.createElement("button");
    applyBtn.className = "btn btn-primary";
    applyBtn.textContent = "Apply";
    applyBtn.addEventListener("click", () => {
      const newTerm = parseInt(select.value);
      CONFIG.roiTerm = newTerm;
      console.log(`[ParallelCoordinates] ROI Term updated to ${newTerm} years`);
      refresh(); // Refresh table with new multiplier
      document.body.removeChild(backdrop);
    });

    // Assemble modal
    btnContainer.appendChild(cancelBtn);
    btnContainer.appendChild(applyBtn);

    modal.appendChild(header);
    modal.appendChild(label);
    modal.appendChild(select);
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

    console.log(
      "[ParallelCoordinates] Fetched data for",
      data.axes.length,
      "axes"
    );
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
      showErrorMessage(
        "No data available. Please ensure all required fields are calculated."
      );
      return;
    }

    // Render graph and table (legend is in controls row)
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
      .attr(
        "transform",
        `translate(${CONFIG.margin.left},${CONFIG.margin.top})`
      );

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
    // For axes with optimal="higher", invert the range so higher values appear lower on screen
    const yScales = axes.map((axis, i) => {
      const targetVal = targetData[i];
      const refVal = referenceData[i];

      // Get min/max from both data values
      const dataMin = Math.min(targetVal, refVal);
      const dataMax = Math.max(targetVal, refVal);

      // Check if this axis has conditional domain (like SHW%)
      const axisConfig = EDITABLE_AXES[axis.id];
      let [domainMin, domainMax] = axis.domain;

      if (axisConfig && typeof axisConfig.getDomain === "function") {
        // Use conditional domain function for axes like SHW%
        const conditionalDomain = axisConfig.getDomain();
        domainMin = conditionalDomain.min;
        domainMax = conditionalDomain.max;
        console.log(
          `[ParallelCoordinates] Using conditional domain for ${axis.id}: [${domainMin}, ${domainMax}]`
        );
      } else {
        // Expand domain if data exceeds configured domain
        // Add 10% padding to accommodate outliers
        if (dataMin < domainMin) {
          domainMin = dataMin * 0.9;
        }
        if (dataMax > domainMax) {
          domainMax = dataMax * 1.1;
        }
      }

      // Invert range for "higher is better" axes (efficiency metrics)
      // This makes higher efficiency values appear LOWER on screen (better visual)
      const range = axis.optimal === "higher" ? [0, height] : [height, 0];

      return d3.scaleLinear().domain([domainMin, domainMax]).range(range);
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

      // For "higher is better" axes, range is inverted [0, height]
      // This means domainMax appears at y=0 (top) and domainMin at y=height (bottom)
      // So we swap the labels to match visual position
      const isInverted = axis.optimal === "higher";
      const bottomValue = isInverted ? domainMax : domainMin;
      const topValue = isInverted ? domainMin : domainMax;

      // Bottom label
      axisG
        .append("text")
        .attr("y", height + 15)
        .attr("text-anchor", "middle")
        .style("fill", CONFIG.colors.axisText)
        .style("font-size", "9px")
        .text(bottomValue.toFixed(1));

      // Top label
      axisG
        .append("text")
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .style("fill", CONFIG.colors.axisText)
        .style("font-size", "9px")
        .text(topValue.toFixed(1));
    });

    // ====================================================================
    // DRAW LINES
    // ====================================================================

    // Line path generator with curved splines
    const line = d3
      .line()
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

    // Reference points (draw first, so they're behind)
    axes.forEach((axis, i) => {
      svg
        .append("circle")
        .attr("cx", xScale(i))
        .attr("cy", yScales[i](referenceData[i]))
        .attr("r", 4)
        .attr("data-mode", "reference") // Mark for later filtering
        .style("fill", CONFIG.colors.reference)
        .style("stroke", "white")
        .style("stroke-width", 2);
    });

    // Target points (draw last, so they're on top for easier clicking)
    axes.forEach((axis, i) => {
      svg
        .append("circle")
        .attr("cx", xScale(i))
        .attr("cy", yScales[i](targetData[i]))
        .attr("r", 4)
        .attr("data-mode", "target") // Mark for later filtering
        .style("fill", CONFIG.colors.target)
        .style("stroke", "white")
        .style("stroke-width", 2);
    });

    // ====================================================================
    // INTERACTIVE DRAGGING - Apply to editable nodes
    // ====================================================================
    initializeDragBehavior(
      svg,
      axes,
      xScale,
      yScales,
      targetData,
      referenceData
    );

    // ====================================================================
    // LEGEND - MOVED TO INFO PANEL (see renderLegend() function)
    // ====================================================================
    // SVG legend commented out - now rendered as HTML in info wrapper
    // Uncomment if need to restore SVG legend
    // const legend = svg
    //   .append("g")
    //   .attr("class", "legend")
    //   .attr("transform", `translate(${width - 150}, -50)`);
    //
    // legend.append("line")
    //   .attr("x1", 0).attr("x2", 30).attr("y1", 0).attr("y2", 0)
    //   .style("stroke", CONFIG.colors.target)
    //   .style("stroke-width", CONFIG.lineWidth);
    //
    // legend.append("text")
    //   .attr("x", 35).attr("y", 4).text("Target")
    //   .style("font-size", "12px").style("fill", CONFIG.colors.axisText);
    //
    // legend.append("line")
    //   .attr("x1", 0).attr("x2", 30).attr("y1", 15).attr("y2", 15)
    //   .style("stroke", CONFIG.colors.reference)
    //   .style("stroke-width", CONFIG.lineWidth);
    //
    // legend.append("text")
    //   .attr("x", 35).attr("y", 19).text("Reference")
    //   .style("font-size", "12px").style("fill", CONFIG.colors.axisText);

    console.log("[ParallelCoordinates] Graph rendered successfully");
  }

  // Legend is now rendered inline in controls row (see initializeFullControls)

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

    // Create table
    const table = document.createElement("table");
    table.className = "table table-sm table-striped table-hover";

    // Extract data
    const { axes, targetData, referenceData } = currentData;

    // Table header - column labels align with graph axes above
    const thead = document.createElement("thead");
    let headerHTML = '<tr><th style="width: 60px;"></th>'; // Empty cell for row labels
    axes.forEach(axis => {
      headerHTML += `<th class="text-center"><strong>${axis.label}</strong><br><small class="text-muted">${axis.unit}</small></th>`;
    });
    headerHTML += "</tr>";
    thead.innerHTML = headerHTML;
    table.appendChild(thead);

    // Table body - transposed rows
    const tbody = document.createElement("tbody");

    // Target row
    const targetRow = document.createElement("tr");
    targetRow.innerHTML = `<td class="pc-row-label pc-target-cell"><strong>Target</strong></td>`;
    targetData.forEach(val => {
      targetRow.innerHTML += `<td class="text-center pc-target-cell">${val.toFixed(2)}</td>`;
    });
    tbody.appendChild(targetRow);

    // Reference row
    const referenceRow = document.createElement("tr");
    referenceRow.innerHTML = `<td class="pc-row-label pc-reference-cell"><strong>Reference</strong></td>`;
    referenceData.forEach(val => {
      referenceRow.innerHTML += `<td class="text-center pc-reference-cell">${val.toFixed(2)}</td>`;
    });
    tbody.appendChild(referenceRow);

    // Delta row
    const deltaRow = document.createElement("tr");
    deltaRow.innerHTML = `<td class="pc-row-label"><strong>Δ</strong></td>`;
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
    percentRow.innerHTML = `<td class="pc-row-label"><strong>%Δ</strong></td>`;
    axes.forEach((axis, i) => {
      const delta = targetData[i] - referenceData[i];
      const reference = referenceData[i];
      const percentDelta = reference !== 0 ? (delta / reference) * 100 : 0;
      let deltaClass = "";
      if (axis.optimal === "higher") {
        deltaClass = delta > 0 ? "text-success" : "text-danger";
      } else if (axis.optimal === "lower") {
        deltaClass = delta < 0 ? "text-success" : "text-danger";
      }
      percentRow.innerHTML += `<td class="text-center ${deltaClass}">${percentDelta >= 0 ? "+" : ""}${percentDelta.toFixed(1)}%</td>`;
    });
    tbody.appendChild(percentRow);

    // ========================================================================
    // FINANCIAL ROWS (Pro Version with pcFinancials.js)
    // ========================================================================

    // Check if Pro version (pcFinancials module available)
    const hasPro = window.TEUI?.pcFinancials?.calculateFinancials;

    // Currency formatter (CAD)
    const formatCurrency = value => {
      return new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    };

    // Get ROI term multiplier
    const roiMultiplier = CONFIG.roiTerm || 1;

    // Reference Cost row
    const refCostRow = document.createElement("tr");
    refCostRow.innerHTML = `<td class="pc-row-label pc-reference-cell"><strong>Ref Cost</strong></td>`;
    axes.forEach(axis => {
      if (hasPro) {
        const result = window.TEUI.pcFinancials.calculateFinancials(
          axis.id,
          "reference"
        );
        const annualizedCost = result.cost * roiMultiplier;
        refCostRow.innerHTML += `<td class="text-center pc-reference-cell">${formatCurrency(annualizedCost)}</td>`;
      } else {
        refCostRow.innerHTML += `<td class="text-center pc-reference-cell">$0.00</td>`;
      }
    });
    tbody.appendChild(refCostRow);

    // Target Cost row
    const targetCostRow = document.createElement("tr");
    targetCostRow.innerHTML = `<td class="pc-row-label pc-target-cell"><strong>Target Cost</strong></td>`;
    axes.forEach(axis => {
      if (hasPro) {
        const result = window.TEUI.pcFinancials.calculateFinancials(
          axis.id,
          "target"
        );
        const annualizedCost = result.cost * roiMultiplier;
        targetCostRow.innerHTML += `<td class="text-center pc-target-cell">${formatCurrency(annualizedCost)}</td>`;
      } else {
        targetCostRow.innerHTML += `<td class="text-center pc-target-cell">$0.00</td>`;
      }
    });
    tbody.appendChild(targetCostRow);

    // Savings row (Delta $)
    const savingsRow = document.createElement("tr");
    savingsRow.innerHTML = `<td class="pc-row-label text-success"><strong>Savings</strong></td>`;
    axes.forEach(axis => {
      if (hasPro) {
        const result = window.TEUI.pcFinancials.calculateFinancials(
          axis.id,
          "savings"
        );
        const annualizedSavings = result.cost * roiMultiplier;
        savingsRow.innerHTML += `<td class="text-center text-success">${formatCurrency(annualizedSavings)}</td>`;
      } else {
        savingsRow.innerHTML += `<td class="text-center text-success">$0.00</td>`;
      }
    });
    tbody.appendChild(savingsRow);

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);

    tableElement = tableWrapper;

    console.log(
      "[ParallelCoordinates] Table rendered with",
      axes.length,
      "rows"
    );
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

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgString)));
  }

  // ========================================================================
  // INTERACTIVE NODE DRAGGING
  // ========================================================================

  /**
   * Configuration for editable axes
   * Each axis defines fields, bounds, step size, and owning section
   *
   * For conditional axes (like shw_efficiency), use getConfig function
   */
  const EDITABLE_AXES = {
    dwhr_efficiency: {
      targetField: "d_53", // Target DWHR% field (NOTE: d_53, not d_52!)
      refField: "ref_d_53", // Reference DWHR% field
      min: 0,
      max: 70, // DWHR domain is 0-70% (S07 slider max)
      step: 1, // 1-interval steps (matches S07 slider behavior)
      unit: "%",
      label: "DWHR",
      owningSection: "sect07", // Section that owns this parameter
    },

    shw_efficiency: {
      // Conditional axis - config depends on system type (d_51)
      // getDomain() returns fixed domain for axis (union of Target + Reference ranges)
      // getConfig(mode) returns per-mode config for drag constraints

      getDomain: function () {
        // Read BOTH Target and Reference system types
        const targetSystem =
          window.TEUI?.StateManager?.getValue("d_51") || "Heatpump";
        const refSystem =
          window.TEUI?.StateManager?.getValue("ref_d_51") || "Heatpump";

        // Check if either uses Gas/Oil (k_52 decimal field)
        const hasGasOil =
          targetSystem === "Gas" ||
          targetSystem === "Oil" ||
          refSystem === "Gas" ||
          refSystem === "Oil";

        if (hasGasOil) {
          // If either uses Gas/Oil, return DISPLAY range (already multiplied by 100 in pcConfig)
          // pcConfig multiplies k_52 by 100, so 0.50 → 50, 0.98 → 98
          // This ensures graph data (50-98) matches axis domain (50-98)
          return { min: 50, max: 98 };
        } else {
          // Otherwise both use d_52 percentage field
          // Union of Electric (90-100) and Heatpump (100-450) = 90-450
          return { min: 90, max: 450 };
        }
      },

      getConfig: function (mode) {
        // Read system type from StateManager (sole source of truth)
        const systemTypeField = mode === "target" ? "d_51" : "ref_d_51";
        const systemType =
          window.TEUI?.StateManager?.getValue(systemTypeField) || "Heatpump";

        console.log(
          `[ParallelCoordinates] SHW% config: mode=${mode}, systemType=${systemType} (from ${systemTypeField})`
        );

        if (systemType === "Heatpump") {
          return {
            targetField: "d_52",
            refField: "ref_d_52",
            min: 100, // Drag constraint for this mode
            max: 450, // Drag constraint for this mode
            step: 1,
            unit: "%",
            label: "SHW",
            owningSection: "sect07",
            isDecimal: false,
          };
        } else if (systemType === "Electric") {
          return {
            targetField: "d_52",
            refField: "ref_d_52",
            min: 90, // Drag constraint for this mode
            max: 100, // Drag constraint for this mode
            step: 1,
            unit: "%",
            label: "SHW",
            owningSection: "sect07",
            isDecimal: false,
          };
        } else {
          // Gas or Oil
          return {
            targetField: "k_52",
            refField: "ref_k_52",
            min: 50, // Drag constraint in DISPLAY space (pcConfig multiplies by 100)
            max: 98, // Drag constraint in DISPLAY space
            step: 1, // Step in display space (1% increments)
            unit: "%",
            label: "SHW AFUE",
            owningSection: "sect07",
            isDecimal: true, // Flag that storage is decimal
            storageMultiplier: 0.01, // Convert display (90) to storage (0.90)
          };
        }
      },
      owningSection: "sect07",
    },

    net_gains: {
      // ⚠️ DISCRETE DROPDOWN PATTERN: nGains% uses dropdown, not continuous slider
      // Dropdown (d_80) maps to specific percentage values shown in calculated field (g_80)

      targetField: "d_80", // Dropdown field (stores "NRC 40%", "PH Method", etc.)
      refField: "ref_d_80",
      min: 0,
      max: 100,
      step: 10, // Large step for snapping to discrete values
      unit: "%",
      label: "nGains",
      owningSection: "sect10",
      isDiscrete: true, // Flag indicating discrete value mapping

      // Map display percentage to dropdown string value
      valueMap: {
        0: "NRC 0%",
        40: "NRC 40%",
        50: "NRC 50%",
        60: "NRC 60%",
        70: "PH Method", // Values 70-100 all map to PHPP
        80: "PH Method",
        90: "PH Method",
        100: "PH Method",
      },

      // Helper function to snap dragged value to nearest valid option
      snapValue: function (value) {
        if (value < 20) return 0; // 0-19 → 0%
        if (value < 45) return 40; // 20-44 → 40%
        if (value < 55) return 50; // 45-54 → 50%
        if (value < 61) return 60; // 55-60 → 60%
        return 70; // 61+ → PHPP (70 is key for valueMap)
      },
    },

    // TB% - Thermal Bridging Penalty (5-100%)
    // Lower TB% = less heat loss = better performance
    // Standard continuous slider in Section 11 (d_97, ref_d_97)
    // Snaps to intervals of 5% (5, 10, 15, 20, ..., 100)
    // Storage: d_97 stores as PERCENTAGE STRING (5% → "5", 20% → "20")
    // ⚠️ NOTE: S11 slider stores as percentage, not decimal (unlike text input handler)
    thermal_bridge: {
      targetField: "d_97",
      refField: "ref_d_97",
      min: 5, // Minimum 5% (Section 11 slider min)
      max: 100,
      step: 5, // 5% intervals
      unit: "%",
      label: "TB",
      owningSection: "sect11", // Section 11
    },

    // ACH50 - Air Changes per Hour at 50Pa (0.10 - 10.0)
    // Lower ACH50 = tighter envelope = better performance
    // Unique pattern: Dragging flips d_108 to "MEASURED" and writes to g_109
    // Display field: d_109 (calculated ACH50 result)
    // Write field: g_109 (measured ACH50 input - only editable when d_108="MEASURED")
    // Dropdown field: d_108 (blower door method selector)
    ach50: {
      targetField: "g_109", // Write to measured value field
      refField: "ref_g_109", // Reference measured value
      dropdownField: "d_108", // Blower door method selector (will be set to "MEASURED")
      refDropdownField: "ref_d_108",
      min: 0.1, // Super tight (Passive House level)
      max: 10.0, // Very leaky
      step: 0.1, // 0.10 intervals (0.10, 0.20, 0.30, ..., 1.30, ...)
      isDecimal: true, // Store with decimal precision (1.30, not 1)
      unit: "", // No unit - label already says ACH50
      label: "ACH50",
      owningSection: "sect12", // Section 12
    },

    // MVHR% - Mechanical Ventilation Heat Recovery Efficiency (0-100%)
    // Higher MVHR% = more heat recovered from exhaust air = better performance
    // Standard continuous slider in Section 13 (d_118, ref_d_118)
    // Range: 0% to 100% (98% practical maximum)
    // Storage: d_118 stores as percentage STRING (85% → "85.50", 4.81% → "4.81")
    // Same pattern as DWHR% (d_53) - stores value directly as percentage
    // Dragging: 0.5% intervals for easy control; S13 allows precise editing (e.g., 86.42%)
    mvhr_efficiency: {
      targetField: "d_118",
      refField: "ref_d_118",
      min: 0,
      max: 100,
      step: 0.5, // 0.5% intervals (85.0, 85.5, 86.0, 86.5, 87.0)
      unit: "%",
      label: "MVHR",
      owningSection: "sect13", // Section 13
      isDecimal: true, // Store with decimal precision (85.5, not 86)
      decimalPlaces: 2, // Store 2 decimals to preserve imported values (86.42 from Excel)
    },

    // HEAT% - Heating System Efficiency (Multi-fuel conditional)
    // Uses conditional config based on heating fuel type
    // Display: h_113 (COP%) × 100 for visual percentage
    // Edit: f_113 (HSPF) for heatpump, j_115 (AFUE) for gas/oil
    // Range: 100% (COP 1.0 electric) to 586% (HSPF 20, COP 5.86 heatpump)
    // Special: HSPF inversion formula: HSPF = COP × 3.412
    heating_efficiency: {
      // This is a conditional axis - config determined at runtime based on fuel type
      getConfig: function (mode) {
        const stateManager = window.TEUI.StateManager;
        if (!stateManager) return null;

        // Get heating system type from selector field
        const selectorField = mode === "target" ? "d_113" : "ref_d_113";
        const fuelType = stateManager.getValue(selectorField);

        // Return config based on fuel type
        if (fuelType === "Heatpump") {
          return {
            targetField: "f_113", // HSPF slider (user editable)
            refField: "ref_f_113",
            min: 100, // 100% (COP 1.0)
            max: 586, // 586% (HSPF 20, COP 5.86)
            step: 5, // 5% intervals
            unit: "%",
            label: "HEAT",
            owningSection: "sect13",
            isHeatpump: true, // Flag for HSPF conversion
            isDecimal: true, // Store HSPF with decimal precision
          };
        } else if (fuelType === "Electric") {
          // Electric resistance is fixed at 100%, not editable
          return null; // Cannot drag electric nodes
        } else {
          // Gas or Oil - use AFUE (j_115)
          // Allow dragging up to 586% to enable auto-switch to Heatpump
          // (one-way transition: Gas/Oil → Heatpump, not reversible via slider)
          return {
            targetField: "j_115", // AFUE field
            refField: "ref_j_115",
            min: 50, // 50% AFUE minimum
            max: 586, // Allow dragging to Heatpump range
            step: 1, // 1% intervals for fine control in 50-100% range
            unit: "%",
            label: "HEAT",
            owningSection: "sect13",
            storageMultiplier: 0.01, // Display 90%, store 0.90
            autoSwitchToHeatpump: true, // Flag to enable auto fuel-type switching
            isDecimal: true, // Store with decimal precision (0.90 not 1)
          };
        }
      },
    },
  };

  /**
   * Get configuration for an axis (handles both static and conditional configs)
   * @param {string} axisId - Axis identifier
   * @param {string} mode - 'target' or 'reference'
   * @returns {object} Axis configuration object
   */
  function getAxisConfig(axisId, mode) {
    const axisEntry = EDITABLE_AXES[axisId];
    if (!axisEntry) return null;

    // If axis has getConfig function, it's conditional - call it
    if (typeof axisEntry.getConfig === "function") {
      return axisEntry.getConfig(mode);
    }

    // Otherwise, return static config
    return axisEntry;
  }

  /**
   * Initialize drag behavior for editable nodes
   * Called from renderGraph() after nodes are created
   */
  function initializeDragBehavior(
    svg,
    axes,
    xScale,
    yScales,
    targetData,
    referenceData
  ) {
    const drag = d3
      .drag()
      .on("start", dragStarted)
      .on("drag", dragging)
      .on("end", dragEnded);

    // Apply drag to Reference nodes (red) - do this FIRST so they're behind in interaction order
    axes.forEach((axis, i) => {
      if (EDITABLE_AXES[axis.id]) {
        const node = svg.selectAll("circle").filter(function () {
          const cx = parseFloat(d3.select(this).attr("cx"));
          const cy = parseFloat(d3.select(this).attr("cy"));
          const mode = d3.select(this).attr("data-mode");
          // Match position AND data-mode='reference' to uniquely identify Reference nodes
          return (
            Math.abs(cx - xScale(i)) < 1 &&
            Math.abs(cy - yScales[i](referenceData[i])) < 1 &&
            mode === "reference"
          );
        });

        node
          .datum({
            axisId: axis.id,
            mode: "reference",
            axisIndex: i,
            value: referenceData[i],
          })
          .call(drag)
          .classed("pc-editable-node", true)
          .attr("r", 8); // 2× size for editable nodes
      }
    });

    // Apply drag to Target nodes (blue) - do this SECOND so they're on top in interaction order
    axes.forEach((axis, i) => {
      if (EDITABLE_AXES[axis.id]) {
        const node = svg.selectAll("circle").filter(function () {
          const cx = parseFloat(d3.select(this).attr("cx"));
          const cy = parseFloat(d3.select(this).attr("cy"));
          const mode = d3.select(this).attr("data-mode");
          // Match position AND data-mode='target' to uniquely identify Target nodes
          return (
            Math.abs(cx - xScale(i)) < 1 &&
            Math.abs(cy - yScales[i](targetData[i])) < 1 &&
            mode === "target"
          );
        });

        node
          .datum({
            axisId: axis.id,
            mode: "target",
            axisIndex: i,
            value: targetData[i],
          })
          .call(drag)
          .classed("pc-editable-node", true)
          .attr("r", 8); // 2× size for editable nodes
      }
    });

    // Store scales for drag functions to use
    initializeDragBehavior.xScale = xScale;
    initializeDragBehavior.yScales = yScales;
    initializeDragBehavior.svg = svg;
  }

  /**
   * Drag start handler - shows modal and applies dragging visual state
   */
  function dragStarted(event, d) {
    d3.select(this).classed("pc-dragging", true);
    showDragModal(d);
  }

  /**
   * Drag handler (fires continuously during drag)
   * Updates node position and modal display
   * NO STATE UPDATES - only visual feedback
   */
  function dragging(event, d) {
    // Get current axis config (handles conditional axes like SHW%)
    const axisConfig = getAxisConfig(d.axisId, d.mode);
    if (!axisConfig) return;

    const yScale = initializeDragBehavior.yScales[d.axisIndex];

    // Constrain drag to axis bounds
    const yRange = yScale.range();
    const minY = Math.min(...yRange);
    const maxY = Math.max(...yRange);
    const newY = Math.max(minY, Math.min(maxY, event.y));

    // Convert Y position back to value
    let newValue = yScale.invert(newY);

    // Snap to step intervals (1 for percentages, 0.01 for decimals)
    newValue = Math.round(newValue / axisConfig.step) * axisConfig.step;

    // Clamp to min/max
    let clampedValue = Math.max(
      axisConfig.min,
      Math.min(axisConfig.max, newValue)
    );

    // ⚠️ DISCRETE SNAPPING: For discrete axes (like nGains%), snap to valid values
    if (axisConfig.isDiscrete && typeof axisConfig.snapValue === "function") {
      clampedValue = axisConfig.snapValue(clampedValue);
    }

    // Update node position (visual only)
    d3.select(this).attr("cy", yScale(clampedValue));

    // Format value for display in modal
    // For discrete axes, show the snapped value
    // For Gas/Oil (storageMultiplier=0.01), clampedValue is already in display space (90)
    // For other axes, clampedValue is the actual value
    // ACH50: Use 2 decimals to show values like 1.30
    const decimals = d.axisId === "ach50" ? 2 : 1;
    let displayValue = clampedValue.toFixed(decimals);
    let displayUnit = axisConfig.unit;

    // ⚠️ SPECIAL CASE: nGains% PHPP Mode
    // When nGains% is dragged to 70+ (PHPP), show "PHPP" instead of percentage
    if (d.axisId === "net_gains" && clampedValue >= 70) {
      displayValue = "PHPP";
      displayUnit = ""; // No unit for PHPP label
    }

    // ⚠️ SPECIAL CASE: HEAT% Heatpump Mode
    // When HEAT% exceeds 100%, show COP and HSPF conversion in subtitle
    let subtitle = null;
    if (d.axisId === "heating_efficiency" && clampedValue > 100) {
      const cop = clampedValue / 100; // 400% → 4.0
      const hspf = cop * 3.412; // 4.0 → 13.648
      subtitle = `COPh ${cop.toFixed(2)} | HSPF ${hspf.toFixed(1)}`;
    }

    // Update modal display (visual only)
    updateDragModal(axisConfig.label, displayValue, displayUnit, subtitle);

    // Store current value for dragEnded
    d.value = clampedValue;
  }

  /**
   * Drag end handler (fires once on mouse release)
   * Updates StateManager and triggers recalculation
   * OnRelease update only (no intermediate calculations)
   */
  function dragEnded(event, d) {
    d3.select(this).classed("pc-dragging", false);

    // Get current axis config (handles conditional axes like SHW%)
    const axisConfig = getAxisConfig(d.axisId, d.mode);
    if (!axisConfig) {
      hideDragModal();
      return;
    }

    const clampedValue = d.value; // Get final value from dragging (in display space)

    // Determine field ID based on which node was dragged
    // For conditional axes like SHW%, targetField/refField may differ (d_52 vs k_52)
    const isTarget = d.mode === "target";
    const baseFieldId = axisConfig.targetField; // Base field without ref_ prefix (e.g., d_52 or k_52)
    const fieldId = isTarget ? baseFieldId : axisConfig.refField; // Use refField for Reference (e.g., ref_d_52 or ref_k_52)

    // Convert display value to storage value if needed
    // For Gas/Oil: display=90 (%), storage=0.90 (decimal) → multiply by storageMultiplier (0.01)
    // For others: display=90, storage=90 → no conversion needed
    let storageValue = clampedValue;

    // ⚠️ HSPF INVERSION: Convert COP percentage to HSPF for heatpump systems
    // Also applies when auto-switching from Gas/Oil to Heatpump (>100%)
    // User drags HEAT% node to 400% → COP 4.0 → HSPF 13.65 (stored in f_113)
    // Formula: HSPF = (percentage / 100) * 3.412
    // Section 13 will recalculate: h_113 = f_113 / 3.412 (display as COP)
    if (
      axisConfig.isHeatpump ||
      (axisConfig.autoSwitchToHeatpump && clampedValue > 100)
    ) {
      const cop = clampedValue / 100; // 400% → 4.0
      const hspf = cop * 3.412; // 4.0 → 13.648
      storageValue = Math.round(hspf * 100) / 100; // 13.65 (2 decimal places)
      console.log(
        `[HEAT% Heatpump] COP ${cop.toFixed(2)} (${clampedValue}%) → HSPF ${storageValue}`
      );
    } else if (axisConfig.storageMultiplier) {
      // Only apply storage multiplier if NOT doing HSPF conversion
      storageValue = clampedValue * axisConfig.storageMultiplier;
    }

    // ⚠️ DISCRETE DROPDOWN: Map snapped percentage to dropdown string
    // For nGains%: 40 → "NRC 40%", 70 → "PH Method"
    if (axisConfig.isDiscrete && axisConfig.valueMap) {
      const snappedKey = clampedValue; // Already snapped by dragging()
      storageValue = axisConfig.valueMap[snappedKey];

      if (!storageValue) {
        console.error(
          `[ParallelCoordinates] No valueMap entry for ${snappedKey} on axis ${d.axisId}`
        );
        hideDragModal();
        return;
      }

      console.log(
        `[ParallelCoordinates] Discrete mapping: ${snappedKey}% → "${storageValue}"`
      );
    }

    // Format value for storage
    let valueToStore;
    if (axisConfig.isDiscrete) {
      // Discrete dropdown: storageValue is already a string (e.g., "NRC 40%")
      valueToStore = storageValue;
    } else {
      // Continuous slider: format number as string
      if (axisConfig.isDecimal) {
        // Use custom decimal places if specified (e.g., 4 for MVHR%), otherwise default to 2
        const decimals = axisConfig.decimalPlaces || 2;
        valueToStore = storageValue.toFixed(decimals); // "0.90" for k_52 (Gas/Oil AFUE), "0.0481" for d_118 (MVHR%)
      } else {
        valueToStore = Math.round(storageValue).toString(); // "100" for d_52 (percentages)
      }
    }

    console.log(
      `[ParallelCoordinates] Drag ended: ${fieldId} = ${valueToStore} (node mode: ${d.mode}, axis: ${d.axisId})`
    );

    // Get owning section
    const owningSection =
      window.TEUI?.SectionModules?.[axisConfig.owningSection];

    if (owningSection) {
      // ❌ REMOVED: Do NOT switch section mode when dragging nodes from S18
      // The section should stay in whatever mode the user has selected via the global toggle
      // We update the appropriate state (Target or Reference) but let the section display
      // whatever mode it's currently in. This prevents cross-contamination where dragging
      // a Reference node would force the section into Reference mode even if the user is
      // viewing Target mode.
      //
      // Example: User is in Target mode, drags Reference ACH50 node to 1.30:
      // - Updates ReferenceState.g_109 = "1.30" ✅
      // - Updates StateManager.ref_g_109 = "1.30" ✅
      // - Section 12 stays in Target mode, displays TargetState.g_109 = "1.00" ✅
      // - If user switches to Reference mode later, they'll see "1.30" ✅

      // 0.5. ⚠️ SPECIAL CASE: ACH50 - Set dropdown to "MEASURED" before writing value
      // For ACH50, dragging requires switching d_108 to "MEASURED" method
      // This enables g_109 field to become editable and accept the new value
      if (axisConfig.dropdownField) {
        const dropdownFieldId = axisConfig.dropdownField; // d_108
        const dropdownFieldIdWithPrefix = isTarget
          ? dropdownFieldId
          : axisConfig.refDropdownField; // d_108 or ref_d_108
        const stateToUpdate = isTarget
          ? owningSection.TargetState
          : owningSection.ReferenceState;

        if (stateToUpdate) {
          stateToUpdate.setValue(dropdownFieldId, "MEASURED");
          console.log(
            `[ParallelCoordinates] Set ${isTarget ? "Target" : "Reference"}State.${dropdownFieldId} = "MEASURED"`
          );
        }

        if (window.TEUI?.StateManager) {
          window.TEUI.StateManager.setValue(
            dropdownFieldIdWithPrefix,
            "MEASURED",
            "user-modified"
          );
          console.log(
            `[ParallelCoordinates] Set StateManager.${dropdownFieldIdWithPrefix} = "MEASURED"`
          );
        }
      }

      // 0.6. ⚠️ SPECIAL CASE: HEAT% - Auto fuel-type switching when dragging past 100%
      // When user drags HEAT% past 100% while in Gas/Oil mode:
      // - Gas/Oil AFUE physically limited to 100% maximum
      // - Auto-switch to Heatpump to allow efficiency > 100% (COP > 1.0)
      // - This enables seamless exploration of efficiency ranges beyond AFUE limits
      let fieldToWrite = baseFieldId; // Default: use base field (e.g., j_115)
      let fieldToWriteWithPrefix = fieldId; // Default: with ref_ prefix if needed

      if (d.axisId === "heating_efficiency" && clampedValue > 100) {
        const selectorFieldId = "d_113"; // Heating system type selector
        const selectorFieldIdWithPrefix = isTarget
          ? selectorFieldId
          : "ref_d_113";
        const currentFuelType = window.TEUI?.StateManager?.getValue(
          selectorFieldIdWithPrefix
        );

        // Only switch if currently Gas or Oil (not if already Heatpump or Electric)
        if (currentFuelType === "Gas" || currentFuelType === "Oil") {
          const stateToUpdate = isTarget
            ? owningSection.TargetState
            : owningSection.ReferenceState;

          if (stateToUpdate) {
            stateToUpdate.setValue(selectorFieldId, "Heatpump");
            console.log(
              `[HEAT% Auto-Switch] ${currentFuelType} → Heatpump (efficiency ${clampedValue}% > 100%)`
            );
          }

          if (window.TEUI?.StateManager) {
            window.TEUI.StateManager.setValue(
              selectorFieldIdWithPrefix,
              "Heatpump",
              "user-modified"
            );
            console.log(
              `[ParallelCoordinates] Set StateManager.${selectorFieldIdWithPrefix} = "Heatpump"`
            );
          }

          // Switch field from j_115 (AFUE) to f_113 (HSPF)
          fieldToWrite = "f_113";
          fieldToWriteWithPrefix = isTarget ? "f_113" : "ref_f_113";
          console.log(
            `[HEAT% Auto-Switch] Field changed: ${baseFieldId} → ${fieldToWrite}`
          );
        }
      }

      // 1. Update the appropriate internal state (TargetState or ReferenceState)
      // Use baseFieldId (without ref_ prefix) for state updates, or fieldToWrite if auto-switched
      const stateToUpdate = isTarget
        ? owningSection.TargetState
        : owningSection.ReferenceState;
      if (stateToUpdate) {
        stateToUpdate.setValue(fieldToWrite, valueToStore);
        console.log(
          `[ParallelCoordinates] Updated ${isTarget ? "Target" : "Reference"}State.${fieldToWrite} = ${valueToStore}`
        );
      }

      // 2. Update StateManager (for cross-section communication)
      if (window.TEUI?.StateManager) {
        window.TEUI.StateManager.setValue(
          fieldToWriteWithPrefix,
          valueToStore,
          "user-modified"
        );
        console.log(
          `[ParallelCoordinates] Updated StateManager.${fieldToWriteWithPrefix} = ${valueToStore}`
        );
      }

      // 3. Call calculateAll() to recalculate (Pattern A compliant)
      if (owningSection.calculateAll) {
        owningSection.calculateAll();
        console.log(
          `[ParallelCoordinates] Called ${axisConfig.owningSection}.calculateAll()`
        );
      }

      // 4. Refresh UI to show updated values and dropdown state
      // For ACH50: refreshUI() will update both d_108 dropdown and g_109 field,
      // and call handleConditionalEditability() to enable/disable g_109 based on d_108
      if (owningSection.ModeManager) {
        owningSection.ModeManager.refreshUI();
        console.log(
          `[ParallelCoordinates] Called ${axisConfig.owningSection}.ModeManager.refreshUI()`
        );
      }
    }

    // 3. Refresh S18 to show updated graph
    setTimeout(() => {
      refresh();
    }, 100); // Small delay to let calculations propagate

    // Hide modal
    hideDragModal();
  }

  /**
   * Show drag value modal
   * Color: Blue for Target, Red for Reference
   */
  function showDragModal(nodeData) {
    const modal = document.createElement("div");
    modal.id = "pc-drag-modal";
    modal.setAttribute("data-mode", nodeData.mode); // 'target' or 'reference'

    // Get current axis config (handles conditional axes like SHW%)
    const axisConfig = getAxisConfig(nodeData.axisId, nodeData.mode);
    if (!axisConfig) return;

    // Remove % from label since value already shows it (e.g., "DWHR" not "DWHR%")
    const labelText = axisConfig.label.replace("%", "").trim();

    // Format value based on decimal/integer type
    const displayValue = axisConfig.isDecimal
      ? nodeData.value.toFixed(2)
      : nodeData.value.toFixed(1);

    modal.textContent = `${labelText}: ${displayValue}${axisConfig.unit}`;

    document.body.appendChild(modal);
  }

  /**
   * Update drag modal with current value
   * @param {string} label - Axis label
   * @param {string|number} value - Value to display (already formatted if string)
   * @param {string} unit - Unit symbol (%, etc.)
   */
  function updateDragModal(label, value, unit, subtitle = null) {
    const modal = document.getElementById("pc-drag-modal");
    if (modal) {
      // Remove % from label since value already shows it
      const labelText = label.replace("%", "").trim();
      // If value is string (pre-formatted), use as-is; otherwise format it
      const displayValue = typeof value === "string" ? value : value.toFixed(1);

      // Main value line
      const mainLine = `${labelText}: ${displayValue}${unit}`;

      // If subtitle provided (e.g., COP/HSPF conversion), add second line
      if (subtitle) {
        modal.innerHTML = `
          <div>${mainLine}</div>
          <div style="font-size: 0.85em; margin-top: 4px; opacity: 0.9;">${subtitle}</div>
        `;
      } else {
        modal.textContent = mainLine;
      }
    }
  }

  /**
   * Hide drag modal
   */
  function hideDragModal() {
    const modal = document.getElementById("pc-drag-modal");
    if (modal) {
      modal.remove();
    }
  }

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  return {
    initialize,
    refresh,
    activateVisualization,
    toggleFullscreen,
    exportToPNG,
  };
})();

console.log("[ParallelCoordinates] Module loaded");

// ========================================================================
// INITIALIZATION TRIGGER (Similar to S17 Dependency.js pattern)
// ========================================================================

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector("#parallelCoordinates .section-content")) {
    // Defer initialization to prevent blocking
    setTimeout(() => {
      window.TEUI.ParallelCoordinates.initialize();
    }, 800);
  }
});
