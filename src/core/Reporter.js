/**
 * Reporter.js
 * PDF Report Export Module for OBJECTIVE TEUI Calculator
 *
 * Generates clean, professional PDF reports of calculator data
 * using text-based jsPDF approach for better quality and smaller file sizes.
 *
 * Features:
 * - Dual report generation (Target Model + Reference Model)
 * - Exports sections S01-S15 (S19 Notes optional)
 * - Excludes graphics sections (S16-S18)
 * - Row numbering for reference
 * - Professional formatting with title sheet
 * - Reference model highlighting (grey text with red differences)
 */

// Create TEUI namespace if it doesn't exist
window.TEUI = window.TEUI || {};

TEUI.Reporter = (function () {
  // Section configuration - maps UI section IDs to display info
  const SECTION_CONFIG = {
    keyValues: { order: 1, title: "01. Key Values", include: true },
    buildingInfo: { order: 2, title: "02. Building Information", include: true },
    climateCalculations: {
      order: 3,
      title: "03. Climate Calculations",
      include: true,
    },
    actualTargetEnergy: {
      order: 4,
      title: "04. Actual Target Energy",
      include: true,
    },
    emissions: { order: 5, title: "05. Emissions", include: true },
    onSiteEnergy: { order: 6, title: "06. On-Site Energy", include: true },
    waterUse: { order: 7, title: "07. Water Use", include: true },
    indoorAirQuality: {
      order: 8,
      title: "08. Indoor Air Quality",
      include: true,
    },
    occupantInternalGains: {
      order: 9,
      title: "09. Occupant Internal Gains",
      include: true,
    },
    envelopeRadiantGains: {
      order: 10,
      title: "10. Envelope Radiant Gains",
      include: true,
    },
    envelopeTransmissionLosses: {
      order: 11,
      title: "11. Envelope Transmission Losses",
      include: true,
    },
    volumeSurfaceMetrics: {
      order: 12,
      title: "12. Volume Surface Metrics",
      include: true,
    },
    mechanicalLoads: {
      order: 13,
      title: "13. Mechanical Loads",
      include: true,
    },
    tediSummary: { order: 14, title: "14. TEDI Summary", include: true },
    teuiSummary: { order: 15, title: "15. TEUI Summary", include: true },
    sankeyDiagram: { order: 16, title: "16. Sankey Diagram", include: false },
    dependencyDiagram: {
      order: 17,
      title: "17. Dependency Diagram",
      include: false,
    },
    parallelCoordinates: {
      order: 18,
      title: "18. Parallel Coordinates",
      include: false,
    },
    notes: { order: 19, title: "19. Notes", include: true },
  };

  /**
   * Extract structured report data from DOM
   * @returns {Object} Report data structure
   */
  function extractReportData() {
    const sections = [];
    const sectionMap = TEUI.FieldManager.getSections();

    // Get project name (from S02)
    const projectName =
      TEUI.StateManager?.getValue("d_11") || "OBJECTIVE Report";

    // Iterate through sections in order
    Object.entries(SECTION_CONFIG)
      .sort((a, b) => a[1].order - b[1].order)
      .forEach(([sectionId, config]) => {
        if (!config.include) return;

        const sectionElement = document.getElementById(sectionId);
        if (!sectionElement) return;

        const sectionData = {
          id: sectionId,
          title: config.title,
          rows: [],
        };

        // Find all table rows in this section
        const tableRows = sectionElement.querySelectorAll(".data-table tbody tr");

        tableRows.forEach((row, rowIndex) => {
          const rowId = row.getAttribute("data-id");
          if (!rowId) return;

          const cells = [];
          const tdElements = row.querySelectorAll("td");

          tdElements.forEach((td, cellIndex) => {
            // Column mapping: 0=A, 1=B (ID), 2=C (Description), 3+=D-N (Values)
            const colLetter = String.fromCharCode(97 + cellIndex); // a, b, c, etc.

            const cellData = {
              column: colLetter.toUpperCase(),
              content: "",
              fieldId: td.getAttribute("data-field-id"),
              classes: Array.from(td.classList),
              isUserInput: td.classList.contains("user-input"),
              isCalculated: td.classList.contains("calculated-value"),
              isReference: td.classList.contains("reference-value"),
              isReferenced: td.classList.contains("referenced"), // Different from Target
              colSpan: td.colSpan > 1 ? td.colSpan : 1,
            };

            // Extract content based on cell type
            if (td.querySelector("select")) {
              // Dropdown - get selected option text
              const select = td.querySelector("select");
              cellData.content = select.options[select.selectedIndex]?.text || "";
              cellData.type = "dropdown";
            } else if (td.querySelector('input[type="range"]')) {
              // Slider - get display value
              const displaySpan = td.querySelector(".slider-value");
              cellData.content = displaySpan ? displaySpan.textContent : "";
              cellData.type = "slider";
            } else if (td.querySelector('input[type="number"]')) {
              // Number input
              const input = td.querySelector('input[type="number"]');
              cellData.content = input.value;
              cellData.type = "number";
            } else {
              // Text content
              cellData.content = td.textContent.trim();
              cellData.type = "text";
            }

            // Detect formatting from computed styles
            const computedStyle = window.getComputedStyle(td);
            cellData.isBold = computedStyle.fontWeight >= 600;
            cellData.isItalic = computedStyle.fontStyle === "italic";
            cellData.color = computedStyle.color;

            cells.push(cellData);
          });

          if (cells.length > 0) {
            sectionData.rows.push({
              rowId,
              rowNumber: rowIndex + 1,
              cells,
            });
          }
        });

        if (sectionData.rows.length > 0) {
          sections.push(sectionData);
        }
      });

    return {
      projectName,
      reportDate: new Date().toISOString(),
      mode: TEUI.ReferenceToggle?.isReferenceMode()
        ? "Reference"
        : "Target",
      currentStandard: TEUI.StateManager?.getValue("d_13") || "Not specified",
      sections,
    };
  }

  /**
   * Get building information data for title sheet
   * @returns {Object} Building info for title sheet
   */
  function getBuildingInfo() {
    return {
      projectName: TEUI.StateManager?.getValue("d_11") || "Untitled Project",
      location: TEUI.StateManager?.getValue("d_14") || "",
      climateZone: TEUI.StateManager?.getValue("d_15") || "",
      occupancy: TEUI.StateManager?.getValue("d_12") || "",
      standard: TEUI.StateManager?.getValue("d_13") || "",
      reportingPeriod: TEUI.StateManager?.getValue("h_12") || "",
      conditionedArea: TEUI.StateManager?.getValue("h_15") || "",
    };
  }

  /**
   * Generate title sheet page
   * @param {Object} pdf - jsPDF instance
   * @param {Object} buildingInfo - Building information
   * @param {string} modelType - "Target" or "Reference"
   */
  function generateTitleSheet(pdf, buildingInfo, modelType) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;

    // Project name - large and bold at vertical center
    pdf.setFontSize(24);
    pdf.setFont(undefined, "bold");
    pdf.text(buildingInfo.projectName, centerX, centerY - 1, {
      align: "center",
    });

    // Model type indicator
    pdf.setFontSize(16);
    pdf.setFont(undefined, "normal");
    const modelColor = modelType === "Reference" ? "#888888" : "#000000";
    pdf.setTextColor(modelColor);
    pdf.text(`${modelType} Model Report`, centerX, centerY - 0.3, {
      align: "center",
    });

    // Building information below title
    pdf.setFontSize(11);
    pdf.setTextColor("#000000");
    let yPos = centerY + 0.5;
    const lineHeight = 0.25;

    const infoLines = [
      buildingInfo.location ? `Location: ${buildingInfo.location}` : null,
      buildingInfo.climateZone
        ? `Climate Zone: ${buildingInfo.climateZone}`
        : null,
      buildingInfo.occupancy ? `Occupancy: ${buildingInfo.occupancy}` : null,
      buildingInfo.standard ? `Standard: ${buildingInfo.standard}` : null,
      buildingInfo.reportingPeriod
        ? `Reporting Period: ${buildingInfo.reportingPeriod}`
        : null,
      buildingInfo.conditionedArea
        ? `Conditioned Area: ${buildingInfo.conditionedArea} m²`
        : null,
    ].filter(Boolean);

    infoLines.forEach(line => {
      pdf.text(line, centerX, yPos, { align: "center" });
      yPos += lineHeight;
    });

    // Footer with generation date
    pdf.setFontSize(9);
    pdf.setTextColor("#666666");
    pdf.text(
      `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      centerX,
      pageHeight - 0.5,
      { align: "center" }
    );
    pdf.text("OBJECTIVE TEUI Calculator | openbuilding.ca", centerX, pageHeight - 0.3, {
      align: "center",
    });
  }

  /**
   * Generate PDF report using text-based jsPDF approach
   * @param {Object} reportData - Extracted report data
   * @param {string} modelType - "Target" or "Reference"
   * @param {Object} targetData - Target model data (for reference comparison)
   * @returns {Object} jsPDF instance
   */
  function generatePDF(reportData, modelType, targetData = null) {
    const { jsPDF } = window.jspdf;

    // Create PDF in landscape Letter (11" x 8.5")
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "in",
      format: "letter",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 0.5;
    const leftMargin = margin;
    const rightMargin = pageWidth - margin;
    const topMargin = margin;
    const bottomMargin = pageHeight - margin;

    const lineHeight = 0.15;
    const sectionSpacing = 0.3;

    // Generate title sheet
    const buildingInfo = getBuildingInfo();
    generateTitleSheet(pdf, buildingInfo, modelType);

    // Add new page for content
    pdf.addPage();

    let yPos = topMargin;

    // Helper function to check if we need a new page
    function checkPageBreak(requiredSpace = 0.5) {
      if (yPos + requiredSpace > bottomMargin) {
        pdf.addPage();
        yPos = topMargin;
        return true;
      }
      return false;
    }

    // Helper function to add page header
    function addPageHeader() {
      pdf.setFontSize(8);
      pdf.setTextColor("#666666");
      pdf.text(
        `${buildingInfo.projectName} - ${modelType} Model`,
        leftMargin,
        topMargin - 0.2
      );
      pdf.text(
        `Page ${pdf.internal.getCurrentPageInfo().pageNumber - 1}`,
        rightMargin,
        topMargin - 0.2,
        { align: "right" }
      );
    }

    // Iterate through sections
    reportData.sections.forEach((section, sectionIndex) => {
      // Check if section will fit, otherwise start new page
      checkPageBreak(1.0);

      // Section header
      pdf.setFontSize(12);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor("#000000");
      pdf.text(section.title, leftMargin, yPos);
      yPos += lineHeight * 1.5;

      // Draw underline for section header
      pdf.setDrawColor("#CCCCCC");
      pdf.setLineWidth(0.01);
      pdf.line(leftMargin, yPos - lineHeight * 0.3, rightMargin, yPos - lineHeight * 0.3);

      // Section rows
      section.rows.forEach((row, rowIndex) => {
        checkPageBreak(lineHeight * 2);

        // Row number (small grey text)
        pdf.setFontSize(7);
        pdf.setTextColor("#999999");
        pdf.setFont(undefined, "normal");
        const rowNumberText = `${section.title.split(".")[0]}.${rowIndex + 1}`;
        pdf.text(rowNumberText, leftMargin, yPos);

        // Row ID (Column B)
        pdf.setFontSize(8);
        pdf.setTextColor("#666666");
        const rowIdCell = row.cells[1]; // Column B
        if (rowIdCell && rowIdCell.content) {
          pdf.text(rowIdCell.content, leftMargin + 0.3, yPos);
        }

        // Description (Column C)
        const descCell = row.cells[2];
        if (descCell && descCell.content) {
          pdf.setFontSize(9);
          pdf.setTextColor("#000000");
          pdf.setFont(undefined, descCell.isBold ? "bold" : "normal");
          pdf.text(descCell.content, leftMargin + 0.8, yPos);
        }

        // Value columns (D onwards) - horizontal layout
        let xPos = leftMargin + 4.5;
        const columnWidth = 1.2;

        row.cells.slice(3).forEach((cell, cellIndex) => {
          if (cell.content && cell.colSpan === 1) {
            pdf.setFontSize(9);

            // For reference model, apply grey color except for differences
            if (modelType === "Reference" && targetData) {
              // TODO: Compare with target data to highlight differences in red
              pdf.setTextColor("#888888");
            } else {
              pdf.setTextColor("#000000");
            }

            // Apply bold if user input or calculated
            pdf.setFont(
              undefined,
              cell.isBold || cell.isUserInput ? "bold" : "normal"
            );

            // Render cell content
            const cellText = cell.content.substring(0, 20); // Limit length
            pdf.text(cellText, xPos, yPos);
          }

          xPos += columnWidth;
        });

        yPos += lineHeight;

        // Light grey row separator
        pdf.setDrawColor("#E0E0E0");
        pdf.setLineWidth(0.005);
        pdf.line(leftMargin + 0.3, yPos - lineHeight * 0.2, rightMargin, yPos - lineHeight * 0.2);
      });

      yPos += sectionSpacing;
    });

    // Add page numbers to all pages except title sheet
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 2; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor("#666666");
      pdf.text(
        `${buildingInfo.projectName} - ${modelType} Model`,
        leftMargin,
        topMargin - 0.2
      );
      pdf.text(
        `Page ${i - 1}`,
        rightMargin,
        topMargin - 0.2,
        { align: "right" }
      );
    }

    return pdf;
  }

  /**
   * Download both Target and Reference model PDFs
   */
  async function downloadReports() {
    try {
      // Check if jsPDF is loaded
      if (!window.jspdf) {
        throw new Error("jsPDF library not loaded");
      }

      console.log("[Reporter] Starting PDF generation...");

      // Get current mode
      const isReferenceMode = TEUI.ReferenceToggle?.isReferenceMode();

      // Extract Target Model data
      if (isReferenceMode) {
        // Switch to Target mode temporarily
        await TEUI.ReferenceToggle.setTargetMode();
      }

      console.log("[Reporter] Extracting Target Model data...");
      const targetData = extractReportData();

      // Generate Target Model PDF
      console.log("[Reporter] Generating Target Model PDF...");
      const targetPDF = generatePDF(targetData, "Target");

      // Download Target PDF
      const timestamp = new Date().toISOString().slice(0, 10);
      const projectName =
        targetData.projectName.replace(/[^a-z0-9]/gi, "_").substring(0, 30) ||
        "OBJECTIVE";
      targetPDF.save(`${projectName}_Target_${timestamp}.pdf`);

      console.log("[Reporter] Target Model PDF downloaded");

      // Switch to Reference mode
      console.log("[Reporter] Switching to Reference Mode...");
      await TEUI.ReferenceToggle.setReferenceMode();

      // Wait for UI to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Extract Reference Model data
      console.log("[Reporter] Extracting Reference Model data...");
      const referenceData = extractReportData();

      // Generate Reference Model PDF with comparison
      console.log("[Reporter] Generating Reference Model PDF...");
      const referencePDF = generatePDF(referenceData, "Reference", targetData);

      // Download Reference PDF
      referencePDF.save(`${projectName}_Reference_${timestamp}.pdf`);

      console.log("[Reporter] Reference Model PDF downloaded");

      // Restore original mode
      if (!isReferenceMode) {
        await TEUI.ReferenceToggle.setTargetMode();
      }

      console.log("[Reporter] PDF generation complete!");
      return true;
    } catch (error) {
      console.error("[Reporter] PDF generation failed:", error);
      alert(`Failed to generate PDF reports: ${error.message}`);
      return false;
    }
  }

  // Public API
  return {
    extractReportData,
    generatePDF,
    downloadReports,
    getBuildingInfo,
  };
})();

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  console.log("[Reporter] Module loaded");
});
