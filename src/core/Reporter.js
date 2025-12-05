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

        // Section 01 (Key Values) uses a different DOM structure - extract from key-values-table
        if (sectionId === 'keyValues') {
          const keyValuesTable = sectionElement.querySelector(".key-values-table");
          console.log(`[Reporter] Section 01 extraction: table found=${!!keyValuesTable}`);

          if (keyValuesTable) {
            // Extract column headers from .key-explanation spans (more reliable than thead)
            const columnHeaders = [];
            const firstRow = keyValuesTable.querySelector("tbody tr");
            if (firstRow) {
              const explanationSpans = firstRow.querySelectorAll(".key-explanation");
              explanationSpans.forEach(span => {
                columnHeaders.push({
                  content: span.textContent.trim(),
                  colSpan: 1
                });
              });
            }
            sectionData.columnHeaders = columnHeaders;
            console.log(`[Reporter] Section 01: extracted ${columnHeaders.length} column headers`);

            // Extract rows from tbody
            const tbody = keyValuesTable.querySelector("tbody");
            if (tbody) {
              const tableRows = tbody.querySelectorAll("tr");
              console.log(`[Reporter] Section 01: found ${tableRows.length} rows in tbody`);

              tableRows.forEach((row, rowIndex) => {
                const cells = [];
                const tds = row.querySelectorAll("td");

                // Extract description and row label from first td
                let description = "";
                let rowLabel = "";

                if (tds[0]) {
                  // First td contains: <span class="title-explanation">...</span> and <span class="key-title-combined">...</span>
                  const titleExplanation = tds[0].querySelector(".title-explanation");
                  const keyTitleCombined = tds[0].querySelector(".key-title-combined");

                  if (titleExplanation) {
                    description = titleExplanation.textContent.trim();
                  }

                  if (keyTitleCombined) {
                    // Extract text content, removing the mode text span
                    const clone = keyTitleCombined.cloneNode(true);
                    const modeTextClone = clone.querySelector(".key-title-mode-text");
                    if (modeTextClone) modeTextClone.remove();
                    rowLabel = clone.textContent.trim();
                  }
                }

                // Process all td elements for cell data
                tds.forEach((td, tdIndex) => {
                  // Extract text - look for .key-value spans or direct text
                  const keyValueSpan = td.querySelector(".key-value");
                  const percentSpan = td.querySelector(".percent-value");
                  const content = keyValueSpan ? keyValueSpan.textContent.trim() :
                                 percentSpan ? percentSpan.textContent.trim() :
                                 td.textContent.trim();

                  cells.push({
                    column: String.fromCharCode(67 + tdIndex), // C, D, E, F, etc.
                    content,
                    type: "text",
                    isBold: !!keyValueSpan, // Values in .key-value spans are bold
                    isUserInput: false,
                    isCalculated: !!keyValueSpan,
                    colSpan: 1
                  });
                });

                if (cells.length > 0) {
                  sectionData.rows.push({
                    rowId: row.getAttribute("data-field-id") || `keyValue_${rowIndex}`,
                    rowNumber: rowIndex + 1,
                    description,  // NEW: Full technical description
                    rowLabel,     // NEW: Row ID label (e.g., "T.1 Lifetime Carbon Actual")
                    cells,
                    isSubheaderRow: false
                  });
                }
              });
            }
          }

          if (sectionData.rows.length > 0) {
            sections.push(sectionData);
          }
          return; // Skip the standard table extraction for keyValues
        }

        // Find all table rows in this section (standard sections)
        const tableRows = sectionElement.querySelectorAll(".data-table tbody tr");

        tableRows.forEach((row, rowIndex) => {
          const rowId = row.getAttribute("data-id");
          if (!rowId) return;

          const cells = [];
          const tdElements = row.querySelectorAll("td");

          tdElements.forEach((td, cellIndex) => {
            // Column mapping: 0=A, 1=B (ID), 2=C (Description), 3+=D-N (Values)
            const colLetter = String.fromCharCode(97 + cellIndex); // a, b, c, etc.
            const colLetterUpper = colLetter.toUpperCase();

            // Skip ID columns to save horizontal space (redundant with row numbering)
            // Column B (index 1): Skip in ALL sections
            // Column F (index 5): Skip in sections 02, 03, 05, 06, 08, 14, 15
            // Column J (index 9): Skip in sections 02, 03
            const sectionsWithColumnF = ['buildingInfo', 'climateCalculations', 'emissions', 'onSiteEnergy', 'indoorAirQuality', 'tediSummary', 'teuiSummary'];
            const sectionsWithColumnJ = ['buildingInfo', 'climateCalculations'];
            const shouldSkipColumn =
              colLetterUpper === 'B' || // Skip column B in all sections
              (colLetterUpper === 'F' && sectionsWithColumnF.includes(sectionId)) ||
              (colLetterUpper === 'J' && sectionsWithColumnJ.includes(sectionId));

            if (shouldSkipColumn) return; // Skip this column entirely

            const cellData = {
              column: colLetterUpper,
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
            cellData.isSubheader = td.classList.contains("section-subheader");

            cells.push(cellData);
          });

          // Check if this is a subheader row (column header row)
          const isSubheaderRow = cells.some(cell => cell.isSubheader);

          if (cells.length > 0) {
            sectionData.rows.push({
              rowId,
              rowNumber: rowIndex + 1,
              cells,
              isSubheaderRow, // Flag for special rendering
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
   * Uses proper field labels from Section02 field definitions
   * @returns {Object} Building info for title sheet with labels and values
   */
  function getBuildingInfo() {
    return {
      // h_14: Project Name (field label from Section02)
      projectTitle: TEUI.StateManager?.getValue("h_14") || "Untitled Project",

      // Fields with their proper labels from Section02 and Section03
      fields: [
        {
          label: "Major Occupancy",
          value: TEUI.StateManager?.getValue("d_12") || "", // d_12: Major Occupancy
        },
        {
          label: "Reference Standard",
          value: TEUI.StateManager?.getValue("d_13") || "", // d_13: Reference Standard
        },
        {
          label: "Location",
          value: (() => {
            const city = TEUI.StateManager?.getValue("h_19") || ""; // h_19: City
            const province = TEUI.StateManager?.getValue("d_19") || ""; // d_19: Province
            return city && province ? `${city}, ${province}` : city || province;
          })(),
        },
        {
          label: "Reporting Period",
          value: TEUI.StateManager?.getValue("h_12") || "", // h_12: Year
        },
        {
          label: "Service Life (yrs)",
          value: TEUI.StateManager?.getValue("h_13") || "", // h_13: Service Life
        },
        {
          label: "Conditioned Area",
          value: TEUI.StateManager?.getValue("h_15")
            ? `${TEUI.StateManager.getValue("h_15")} m²`
            : "", // h_15: Area
        },
        {
          label: "Certifier",
          value: TEUI.StateManager?.getValue("i_16") || "", // i_16: Certifier
        },
        {
          label: "License No.",
          value: TEUI.StateManager?.getValue("i_17") || "", // i_17: License
        },
      ].filter(field => field.value), // Only include fields with values
    };
  }

  /**
   * Format timestamp in metric format: YYYY.MM.DD, HHhMM
   * @returns {string} Formatted timestamp
   */
  function getMetricTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day}, ${hours}h${minutes}`;
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
    const leftMargin = 1.5; // Left-justified text block

    // Project Title - large, bold, and LEFT-JUSTIFIED
    pdf.setFontSize(24);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor("#000000");
    pdf.text(buildingInfo.projectTitle, leftMargin, centerY - 1);

    // Model type indicator - LEFT-JUSTIFIED
    pdf.setFontSize(16);
    pdf.setFont(undefined, "normal");
    const modelColor = modelType === "Reference" ? "#888888" : "#000000";
    pdf.setTextColor(modelColor);
    pdf.text(`${modelType} Model Report`, leftMargin, centerY - 0.3);

    // Building information - left-justified with labels
    pdf.setFontSize(11);
    pdf.setTextColor("#000000");
    let yPos = centerY + 0.5;
    const lineHeight = 0.25;
    const labelWidth = 2.0; // Width for label column

    // Render fields from the fields array
    buildingInfo.fields.forEach(field => {
      pdf.setFont(undefined, "bold");
      pdf.text(field.label + ":", leftMargin, yPos);

      pdf.setFont(undefined, "normal");
      pdf.text(field.value, leftMargin + labelWidth, yPos);

      yPos += lineHeight;
    });

    // Footer with generation date
    pdf.setFontSize(9);
    pdf.setTextColor("#666666");
    pdf.text(
      `Generated: ${getMetricTimestamp()}`,
      leftMargin,
      pageHeight - 0.5
    );
    pdf.text(
      "OBJECTIVE TEUI Calculator | openbuilding.ca",
      pageWidth - leftMargin,
      pageHeight - 0.5,
      { align: "right" }
    );
  }

  /**
   * Helper function to add disclaimer and credits page at the end of the PDF
   */
  function addDisclaimerPage(pdf, buildingInfo, leftMargin, topMargin, pageWidth, pageHeight) {
    // Add new page for disclaimer
    pdf.addPage();

    let yPos = topMargin + 0.3;
    const rightMargin = pageWidth - leftMargin;
    const contentWidth = rightMargin - leftMargin;

    // Title
    pdf.setFontSize(8);
    pdf.setTextColor("#000000");
    pdf.setFont(undefined, "bold");
    pdf.text("DISCLAIMER", leftMargin, yPos);
    yPos += 0.18;

    // Disclaimer text from LICENSE lines 33-51 - reduced font size to fit on one page
    pdf.setFontSize(5);
    pdf.setTextColor("#333333");
    pdf.setFont(undefined, "italic");

    const disclaimerText = `Disclaimer last updated: April 2025. Subject to change without notice.\n\nOpenBuilding, including its directors, advisors, and volunteers, makes no guarantees and assumes no legal responsibility for the accuracy, completeness, or usefulness of this tool.\n\nUse at Your Own Risk:\nWe have made reasonable efforts to review and ensure that the information provided is factually correct, comprehensive, and up-to-date. However, this tool and any related content should not be used as a substitute for the expertise of a licensed architect or engineer. Always consult a knowledgeable professional before using this tool to inform decisions.\n\nThis tool is designed to assist with evaluating energy and carbon targets during early-stage design only, and it is not a substitute for professional engineering or architectural services. Information in this tool may change and is not intended to cover all possible building types, system designs, building codes, standards, or occupancy scenarios. The absence of warnings does not imply that this tool is accurate, compliant with standards, effective, or appropriate for every situation.\n\nEnergy simulation or performance compliance methods cannot guarantee that a finished building will meet proposed targets due to factors beyond the control of any software, including user behavior, construction methods, site conditions, and climate variability. For example, weather data alone, over a 5-year period for the same Canadian location, can affect actual TEUI by up to 40%. Tools like OBJECTIVE are not intended to predict actual performance but to help set targets over a baseline or reference case.\n\nAs stated in an Informative Note from ASHRAE Standard 90.1-2013, "...actual experience will differ from these calculations due to variations such as occupancy, building operation and maintenance, weather, energy use not covered by this standard, changes in energy rates between design of the building and occupancy, and precision of the calculation tool."\n\nLoad calculations provided by a Mechanical Consultant take precedence over those generated by this tool. Architectural energy performance outputs should serve only as a reference for mechanical loads and to support data tables from Building Codes. Users must verify that any data in the 'Reference Values' section of this tool conforms to the most current and relevant sections of applicable building codes. We have provided some limited sample reference values to demonstrate how this section is intended to function but it is neither an exhaustive or complete list as there are simply far too many variables to add for every type of building occupancy and type, for every province in Canada.\n\nBuilding codes, standards, and professional regulations vary by province and territory. Users are responsible for ensuring compliance with local requirements.\n\nThis tool is intended for use by licensed professionals with the requisite insurance to undertake professional design activities in their respective jurisdiction in Canada. Use of this tool constitutes an acknowledgment that the user meets these qualifications and agrees to the terms of use stated here and agreed upon during download.`;

    const disclaimerLines = pdf.splitTextToSize(disclaimerText, contentWidth);
    pdf.text(disclaimerLines, leftMargin, yPos);
    yPos += disclaimerLines.length * 0.075 + 0.2;

    // License section
    pdf.setFontSize(7);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor("#000000");
    pdf.text("License", leftMargin, yPos);
    yPos += 0.15;

    pdf.setFontSize(5);
    pdf.setFont(undefined, "normal");
    const licenseText = `Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International\n(CC BY-NC-ND 4.0)\n\n© OpenBuilding, Inc., 2025\n\nThis work is licensed for non-commercial use only. See LICENSE for full terms.\nSupported by the Ontario Association of Architects (OAA).`;
    const licenseLines = pdf.splitTextToSize(licenseText, contentWidth);
    pdf.text(licenseLines, leftMargin, yPos);
    yPos += licenseLines.length * 0.075 + 0.2;

    // Credits section
    pdf.setFontSize(7);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor("#000000");
    pdf.text("Credits", leftMargin, yPos);
    yPos += 0.15;

    pdf.setFontSize(5);
    pdf.setFont(undefined, "normal");
    const creditsText = `Created by: Andy Thomson, OpenBuilding, Inc., OAA\n\nContributors: Mark H Pavlidis\n\nMentors & Advisors:\n- Dr. Ted Kesik, P.Eng\n- Evelyne Bouchard, OAQ, CPHD\n- Grant Walkin, P.Eng\n\nPeer Review:\n- INVISIJ Architects\n- Tandem Architecture\n- Pamela DeMelo, P.Eng.\n- Stephen Pope, OAA, FRAIC\n- Sheena Sharp, OAA, MRAIC`;
    const creditsLines = pdf.splitTextToSize(creditsText, contentWidth);
    pdf.text(creditsLines, leftMargin, yPos);
  }

  /**
   * Helper function to render Section 01 (Key Values) with special formatting
   * Moved to module scope so both generatePDF and appendReferenceToPDF can use it
   * REDESIGNED V3: Full visual hierarchy with descriptions, row labels, and column headers
   */
  function renderSection01KeyValues(pdf, section, modelType, leftMargin, topMargin, pageWidth, pageHeight, lineHeight) {
    console.log("[Reporter] renderSection01KeyValues called with:", {
      sectionTitle: section.title,
      rowCount: section.rows.length,
      columnHeaderCount: section.columnHeaders?.length || 0,
      modelType,
      pageHeight
    });

    let yPos = 1.5; // Start higher on page

    // Section title - JUMBO
    pdf.setFontSize(24);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor("#000000");
    pdf.text(section.title, leftMargin, yPos);
    yPos += 0.6; // Breathing room after title

    // Define visual theme - BOLD colors
    const refColor = "#8B0000"; // Dark red
    const targetColor = "#0066CC"; // Blue
    const actualColor = "#28a745"; // Green
    const tierGrey = "#999999"; // Lighter grey for tiers
    const descGrey = "#666666"; // Description text
    const headerGrey = "#888888"; // Column headers

    // Column positions - TIGHTER spacing, close up whitespace
    const labelXPos = leftMargin;
    const colWidth = 2.2; // Reduced column width to close up spacing
    const refXPos = leftMargin + 2.8;
    const targetXPos = refXPos + colWidth;
    const actualXPos = targetXPos + colWidth;
    const percentXPos = actualXPos + colWidth;

    // Render rows with THREE-LINE structure per row group
    section.rows.forEach((row, rowIndex) => {
      if (row.isSubheaderRow) return;

      // ===== LINE 1: HEADER LINE (1/5 of row height) =====
      // Description on left + Column headers above values
      if (row.description) {
        pdf.setFontSize(8);
        pdf.setTextColor(descGrey);
        pdf.setFont(undefined, "normal");
        pdf.text(row.description, labelXPos, yPos);
      }

      // Column headers directly above value columns - RIGHT ALIGNED
      if (section.columnHeaders && section.columnHeaders.length >= 3) {
        pdf.setFontSize(7);
        pdf.setTextColor(headerGrey);
        pdf.setFont(undefined, "normal");

        // Reference column header (index 0) - RIGHT ALIGNED
        if (section.columnHeaders[0]) {
          pdf.text(section.columnHeaders[0].content, refXPos + colWidth, yPos, { align: "right", maxWidth: colWidth });
        }

        // Target column header (index 1) - RIGHT ALIGNED
        if (section.columnHeaders[1]) {
          pdf.text(section.columnHeaders[1].content, targetXPos + colWidth, yPos, { align: "right", maxWidth: colWidth });
        }

        // Actual column header (index 2) - RIGHT ALIGNED
        if (section.columnHeaders[2]) {
          pdf.text(section.columnHeaders[2].content, actualXPos + colWidth, yPos, { align: "right", maxWidth: colWidth });
        }
      }

      yPos += 0.55; // Gap to value line (combines old line 2 + line 3 gaps)

      // ===== LINE 2: VALUE LINE (T.1/T.2/T.3 + JUMBO colored numbers on SAME baseline) =====
      // T.1, T.2, T.3 - REDUCED size labels on LEFT, same baseline as values
      if (row.rowLabel) {
        pdf.setFontSize(27); // Reduced from 36pt (75% of original)
        pdf.setTextColor("#000000");
        pdf.setFont(undefined, "bold");
        pdf.text(row.rowLabel, labelXPos, yPos);
      }

      // VALUES on RIGHT side of same line - RIGHT JUSTIFIED, REDUCED SIZE (75%)
      // COLUMN E: Reference (36pt Red) - TIER ON SAME LINE, MOVED AWAY
      const refCell = row.cells[1];
      if (refCell && refCell.content) {
        const tierMatch = refCell.content.match(/^(tier\d+)\s+(.+)$/);

        if (tierMatch) {
          // Tier + Value on SAME line - RIGHT JUSTIFIED, MORE SPACING
          pdf.setFontSize(20); // Reduced from 24pt (75%)
          pdf.setFont(undefined, "bold");
          pdf.setTextColor(refColor); // Match tier to Reference red color
          // Set 50% opacity for tier text
          pdf.setGState(new pdf.GState({ opacity: 0.5 }));
          // Position tier FURTHER LEFT of right-justified value
          const tierWidth = pdf.getTextWidth(tierMatch[1]);
          const valueWidth = pdf.getTextWidth(tierMatch[2]);
          pdf.text(tierMatch[1], refXPos + colWidth - tierWidth - valueWidth - 0.6, yPos); // Increased Tier-Key gap from 0.15 to 0.6

          // Reset to full opacity for value
          pdf.setGState(new pdf.GState({ opacity: 1.0 }));
          // Value RIGHT JUSTIFIED at column edge
          pdf.setFontSize(36); // Reduced from 48pt (75%)
          pdf.setFont(undefined, "bold");
          pdf.setTextColor(refColor);
          pdf.text(tierMatch[2], refXPos + colWidth, yPos, { align: "right" });
        } else {
          // No tier - REDUCED red RIGHT JUSTIFIED
          pdf.setFontSize(36); // Reduced from 48pt (75%)
          pdf.setFont(undefined, "bold");
          pdf.setTextColor(refColor);
          pdf.text(refCell.content, refXPos + colWidth, yPos, { align: "right" });
        }
      }

      // COLUMN H: Target (36pt Blue) - TIER ON SAME LINE, MOVED AWAY
      const targetCell = row.cells[2];
      if (targetCell && targetCell.content) {
        const tierMatch = targetCell.content.match(/^(tier\d+)\s+(.+)$/);

        if (tierMatch) {
          // Tier + Value on SAME line - RIGHT JUSTIFIED, MORE SPACING
          pdf.setFontSize(20); // Reduced from 24pt (75%)
          pdf.setFont(undefined, "bold");
          pdf.setTextColor(targetColor); // Match tier to Target blue color
          // Set 50% opacity for tier text
          pdf.setGState(new pdf.GState({ opacity: 0.5 }));
          // Position tier FURTHER LEFT of right-justified value
          const tierWidth = pdf.getTextWidth(tierMatch[1]);
          const valueWidth = pdf.getTextWidth(tierMatch[2]);
          pdf.text(tierMatch[1], targetXPos + colWidth - tierWidth - valueWidth - 0.6, yPos); // Increased Tier-Key gap from 0.15 to 0.6

          // Reset to full opacity for value
          pdf.setGState(new pdf.GState({ opacity: 1.0 }));
          // Value RIGHT JUSTIFIED at column edge
          pdf.setFontSize(36); // Reduced from 48pt (75%)
          pdf.setFont(undefined, "bold");
          pdf.setTextColor(targetColor);
          pdf.text(tierMatch[2], targetXPos + colWidth, yPos, { align: "right" });
        } else {
          // No tier - REDUCED blue RIGHT JUSTIFIED
          pdf.setFontSize(36); // Reduced from 48pt (75%)
          pdf.setFont(undefined, "bold");
          pdf.setTextColor(targetColor);
          pdf.text(targetCell.content, targetXPos + colWidth, yPos, { align: "right" });
        }
      }

      // COLUMN K: Actual (36pt Green or N/A) - RIGHT JUSTIFIED
      const actualCell = row.cells[3];
      if (actualCell && actualCell.content && actualCell.content !== "N/A") {
        pdf.setFontSize(36); // Reduced from 48pt (75%)
        pdf.setFont(undefined, "bold");
        pdf.setTextColor(actualColor);
        pdf.text(actualCell.content, actualXPos + colWidth, yPos, { align: "right" });
      } else if (actualCell && actualCell.content === "N/A") {
        pdf.setFontSize(27); // Reduced from 36pt (75%)
        pdf.setFont(undefined, "normal");
        pdf.setTextColor("#CCCCCC");
        pdf.text("N/A", actualXPos + colWidth, yPos - 0.05, { align: "right" });
      }

      // COLUMN M: Percentage (22pt Grey with colored checkmark) - RIGHT JUSTIFIED, REDUCED SIZE
      const percentCell = row.cells[4];
      if (percentCell && percentCell.content) {
        pdf.setFontSize(22); // Reduced from 30pt (73%)
        pdf.setFont(undefined, "bold");

        if (percentCell.content.includes("✓")) {
          const percentText = percentCell.content.replace("✓", "").trim();
          // Calculate widths for right alignment
          pdf.setTextColor("#999999");
          const percentWidth = pdf.getTextWidth(percentText);
          // Green checkmark positioned to left of percentage
          pdf.setTextColor("#28a745");
          pdf.text("✓", percentXPos + colWidth - percentWidth - 0.3, yPos - 0.05);
          // Grey percentage RIGHT JUSTIFIED
          pdf.setTextColor("#999999");
          pdf.text(percentText, percentXPos + colWidth, yPos - 0.05, { align: "right" });
        } else if (percentCell.content.includes("✗")) {
          const percentText = percentCell.content.replace("✗", "").trim();
          // Calculate widths for right alignment
          pdf.setTextColor("#999999");
          const percentWidth = pdf.getTextWidth(percentText);
          // Red X positioned to left of percentage
          pdf.setTextColor("#d9534f");
          pdf.text("✗", percentXPos + colWidth - percentWidth - 0.3, yPos - 0.05);
          // Grey percentage RIGHT JUSTIFIED
          pdf.setTextColor("#999999");
          pdf.text(percentText, percentXPos + colWidth, yPos - 0.05, { align: "right" });
        } else {
          pdf.setTextColor("#999999");
          pdf.text(percentCell.content, percentXPos + colWidth, yPos - 0.05, { align: "right" });
        }
      }

      // Gap to next row group (after value line)
      yPos += 0.5; // Spacing between row groups
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

    // Create PDF in landscape Legal (14" x 8.5") for better content fit
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "in",
      format: "legal",
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

    // Add new page for Section 01 (Key Values) - Special treatment
    pdf.addPage();

    // Render Section 01 on its own page with special formatting
    const section01 = reportData.sections.find(s => s.title === "01. Key Values");
    console.log("[Reporter] Section 01 lookup:", section01 ? `Found with ${section01.rows.length} rows` : "NOT FOUND");
    console.log("[Reporter] Available sections:", reportData.sections.map(s => s.title));
    if (section01) {
      renderSection01KeyValues(pdf, section01, modelType, leftMargin, topMargin, pageWidth, pageHeight, lineHeight);
    }

    // Add new page for remaining content
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

    // Helper function to calculate dynamic column widths for a section
    function calculateColumnWidths(section) {
      const availableWidth = rightMargin - leftMargin - 3.0; // Space after description column
      const valueCells = section.rows[0]?.cells.slice(2) || []; // Columns D onwards (now index 2+ after skipping B)
      const numColumns = valueCells.length;

      if (numColumns === 0) return [];

      // Calculate max content length for each column across all rows
      const columnMaxLengths = valueCells.map((_, colIdx) => {
        let maxLen = 0;
        section.rows.forEach(row => {
          const cell = row.cells[2 + colIdx]; // Index 2+ (was 3+ before skipping B)
          if (cell && cell.content) {
            // For subheader rows, account for line breaks
            if (row.isSubheaderRow && cell.content.includes("\n")) {
              const lines = cell.content.split("\n");
              maxLen = Math.max(maxLen, ...lines.map(l => l.length));
            } else {
              maxLen = Math.max(maxLen, cell.content.length);
            }
          }
        });
        return maxLen;
      });

      // Calculate total character width needed
      const totalChars = columnMaxLengths.reduce((sum, len) => sum + len, 0);

      // Distribute available width proportionally, with min/max constraints
      const minColWidth = 0.5; // Minimum column width in inches
      const maxColWidth = 1.5; // Maximum column width in inches

      return columnMaxLengths.map(charLen => {
        // Approximate: 1 character ≈ 0.06 inches at 9pt font
        const charWidthFactor = 0.065;
        let width = (charLen * charWidthFactor) + 0.15; // Add padding
        width = Math.max(minColWidth, Math.min(maxColWidth, width));
        return width;
      });
    }

    // Helper function to calculate total section height
    function calculateSectionHeight(section) {
      let height = 0;

      // Section header height
      height += lineHeight * 2.2; // Title
      height += lineHeight * 0.2; // Post-underline space (reduced from 0.5)

      // Row heights
      section.rows.forEach(row => {
        if (row.isSubheaderRow) {
          height += lineHeight * 0.8; // Pre-subheader spacing
          height += lineHeight * 1.8; // Subheader row height
        } else {
          height += lineHeight; // Normal row height
        }
      });

      // Section spacing
      height += sectionSpacing;

      return height;
    }

    // Iterate through sections (skip Section 01 - already rendered)
    reportData.sections.forEach((section, sectionIndex) => {
      // Skip Section 01 (Key Values) - rendered on its own page after title sheet
      if (section.title === "01. Key Values") return;

      // Calculate full section height to check if entire section fits on current page
      const fullSectionHeight = calculateSectionHeight(section);

      // If entire section doesn't fit on current page, move to next page
      if (yPos + fullSectionHeight > bottomMargin) {
        pdf.addPage();
        yPos = topMargin;
      }

      // Calculate dynamic column widths for this section
      const columnWidths = calculateColumnWidths(section);

      // Section header
      pdf.setFontSize(12);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor("#000000");
      pdf.text(section.title, leftMargin, yPos);
      yPos += lineHeight * 2.2; // Increased from 1.5 to 2.2 for better spacing

      // Draw underline for section header
      pdf.setDrawColor("#CCCCCC");
      pdf.setLineWidth(0.01);
      pdf.line(leftMargin, yPos - lineHeight * 0.8, rightMargin, yPos - lineHeight * 0.8); // Underline positioned higher
      yPos += lineHeight * 0.2; // Reduced from 0.5 to 0.2 for tighter spacing

      // Section rows
      section.rows.forEach((row, rowIndex) => {
        // Add extra space before subheader rows for breathing room (Comment #1)
        if (row.isSubheaderRow) {
          yPos += lineHeight * 0.8; // Increased from 0.5 to 0.8 for more vertical space
          checkPageBreak(lineHeight * 3); // More space needed for multi-line headers
        } else {
          checkPageBreak(lineHeight * 2);
        }

        // Row number (small grey text) - compact format
        pdf.setFontSize(7);
        pdf.setTextColor("#999999");
        pdf.setFont(undefined, "normal");
        const rowNumberText = `${section.title.split(".")[0]}.${rowIndex + 1}`;
        pdf.text(rowNumberText, leftMargin, yPos);

        // Description (Column C, now index 1 after skipping Column B) - start closer to left
        const descCell = row.cells[1]; // Column C (was index 2, now index 1 after skipping B)
        if (descCell && descCell.content) {
          pdf.setFontSize(9);
          pdf.setTextColor("#000000");
          pdf.setFont(undefined, descCell.isBold ? "bold" : "normal");
          // Truncate long descriptions to fit - reduced from 35 to 28 characters
          const maxDescWidth = 28; // characters
          const descText = descCell.content.length > maxDescWidth
            ? descCell.content.substring(0, maxDescWidth) + "..."
            : descCell.content;
          pdf.text(descText, leftMargin + 0.25, yPos); // Moved closer to row number (was 0.6)
        }

        // Value columns (D onwards, now index 2+ after skipping B and optionally F/J) - use dynamic widths
        let xPos = leftMargin + 3.0; // Start position for value columns (was 3.5, now 3.0)

        row.cells.slice(2).forEach((cell, cellIndex) => {
          if (cell.content && cell.colSpan === 1) {
            const colWidth = columnWidths[cellIndex] || 0.85;

            // Use smaller font for subheaders
            pdf.setFontSize(row.isSubheaderRow ? 7 : 9);

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

            // Handle multi-line text for subheaders (newline character support)
            if (row.isSubheaderRow && cell.content.includes("\n")) {
              const lines = cell.content.split("\n");
              lines.forEach((line, lineIdx) => {
                pdf.text(line, xPos, yPos + (lineIdx * lineHeight * 0.8));
              });
            } else {
              // Render cell content without truncation
              pdf.text(cell.content, xPos, yPos);
            }

            xPos += colWidth;
          } else if (cell.colSpan === 1) {
            // Empty cell, still advance position
            const colWidth = columnWidths[cellIndex] || 0.85;
            xPos += colWidth;
          }
        });

        // Use taller line height for subheader rows to accommodate multi-line text
        // Add extra spacing (1mm = ~0.04") so text sits above the divider line
        const rowHeight = row.isSubheaderRow ? lineHeight * 1.8 : lineHeight;
        yPos += rowHeight + 0.04; // 1mm extra spacing

        // Light grey row separator - draw below text with small gap (Comment #2)
        pdf.setDrawColor("#E0E0E0");
        pdf.setLineWidth(0.005);
        pdf.line(leftMargin + 0.3, yPos + lineHeight * 0.02, rightMargin, yPos + lineHeight * 0.02);
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
        `${buildingInfo.projectTitle} - ${modelType} Model`,
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
   * Download combined PDF with both Target and Reference models
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
        TEUI.ReferenceToggle.switchMode("target");
        // Wait for UI to update
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log("[Reporter] Extracting Target Model data...");
      const targetData = extractReportData();

      // Generate Target Model PDF
      console.log("[Reporter] Generating Target Model PDF...");
      const combinedPDF = generatePDF(targetData, "Target");

      console.log("[Reporter] Target Model added to PDF");

      // Switch to Reference mode
      console.log("[Reporter] Switching to Reference Mode...");
      TEUI.ReferenceToggle.switchMode("reference");

      // Wait for UI to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Extract Reference Model data
      console.log("[Reporter] Extracting Reference Model data...");
      const referenceData = extractReportData();

      // Add Reference Model to the same PDF
      console.log("[Reporter] Adding Reference Model to PDF...");
      appendReferenceToPDF(combinedPDF, referenceData, targetData);

      console.log("[Reporter] Reference Model added to PDF");

      // Restore original mode
      if (!isReferenceMode) {
        TEUI.ReferenceToggle.switchMode("target");
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Download combined PDF with metric timestamp
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
      const projectTitle =
        (TEUI.StateManager?.getValue("h_14") || "OBJECTIVE")
          .replace(/[^a-z0-9]/gi, "_")
          .substring(0, 30);
      combinedPDF.save(`${projectTitle}_Report_${timestamp}.pdf`);

      console.log("[Reporter] Combined PDF downloaded successfully!");
      return true;
    } catch (error) {
      console.error("[Reporter] PDF generation failed:", error);
      alert(`Failed to generate PDF report: ${error.message}`);
      return false;
    }
  }

  /**
   * Append Reference Model content to existing PDF
   * @param {Object} pdf - Existing jsPDF instance with Target Model
   * @param {Object} referenceData - Reference model data
   * @param {Object} targetData - Target model data (for comparison)
   */
  function appendReferenceToPDF(pdf, referenceData, targetData) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 0.5;
    const leftMargin = margin;
    const rightMargin = pageWidth - margin;
    const topMargin = margin;
    const bottomMargin = pageHeight - margin;

    const lineHeight = 0.15;
    const sectionSpacing = 0.3;

    // Add new page for Reference Model title sheet
    pdf.addPage();

    // Generate Reference Model title sheet
    const buildingInfo = getBuildingInfo();
    const centerY = pageHeight / 2;
    const leftMarg = 1.5; // Left-justified text block

    // Project Title - large, bold, and LEFT-JUSTIFIED
    pdf.setFontSize(24);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor("#000000");
    pdf.text(buildingInfo.projectTitle, leftMarg, centerY - 1);

    // Reference Model indicator in grey - LEFT-JUSTIFIED
    pdf.setFontSize(16);
    pdf.setFont(undefined, "normal");
    pdf.setTextColor("#888888");
    pdf.text("Reference Model Report", leftMarg, centerY - 0.3);

    // Building information - left-justified with labels
    pdf.setFontSize(11);
    pdf.setTextColor("#000000");
    let yPos = centerY + 0.5;
    const lineSpacing = 0.25;
    const labelWidth = 2.0; // Width for label column

    // Render fields from the fields array
    buildingInfo.fields.forEach(field => {
      pdf.setFont(undefined, "bold");
      pdf.text(field.label + ":", leftMarg, yPos);

      pdf.setFont(undefined, "normal");
      pdf.text(field.value, leftMarg + labelWidth, yPos);

      yPos += lineSpacing;
    });

    // Footer with generation date
    pdf.setFontSize(9);
    pdf.setTextColor("#666666");
    pdf.text(
      `Generated: ${getMetricTimestamp()}`,
      leftMarg,
      pageHeight - 0.5
    );
    pdf.text(
      "OBJECTIVE TEUI Calculator | openbuilding.ca",
      pageWidth - leftMarg,
      pageHeight - 0.5,
      { align: "right" }
    );

    // Add new page for Reference Model Section 01
    pdf.addPage();

    // Render Reference Section 01 on its own page with special formatting
    const refSection01 = referenceData.sections.find(s => s.title === "01. Key Values");
    if (refSection01) {
      renderSection01KeyValues(pdf, refSection01, "Reference", leftMargin, topMargin, pageWidth, pageHeight, lineHeight);
    }

    // Add new page for remaining Reference Model content
    pdf.addPage();

    yPos = topMargin;

    // Helper function to check if we need a new page
    function checkPageBreak(requiredSpace = 0.5) {
      if (yPos + requiredSpace > bottomMargin) {
        pdf.addPage();
        yPos = topMargin;
        return true;
      }
      return false;
    }

    // Helper function to render Section 01 for Reference (REMOVED - uses outer scope function)
    // The renderSection01KeyValues function is defined in the outer scope and handles both Target and Reference modes

    // Helper function to calculate dynamic column widths for a section (same as Target)
    function calculateColumnWidthsRef(section) {
      const valueCells = section.rows[0]?.cells.slice(2) || []; // Index 2+ (was 3+ before skipping B)
      const numColumns = valueCells.length;

      if (numColumns === 0) return [];

      const columnMaxLengths = valueCells.map((_, colIdx) => {
        let maxLen = 0;
        section.rows.forEach(row => {
          const cell = row.cells[2 + colIdx]; // Index 2+ (was 3+ before skipping B)
          if (cell && cell.content) {
            if (row.isSubheaderRow && cell.content.includes("\n")) {
              const lines = cell.content.split("\n");
              maxLen = Math.max(maxLen, ...lines.map(l => l.length));
            } else {
              maxLen = Math.max(maxLen, cell.content.length);
            }
          }
        });
        return maxLen;
      });

      const minColWidth = 0.5;
      const maxColWidth = 1.5;

      return columnMaxLengths.map(charLen => {
        const charWidthFactor = 0.065;
        let width = (charLen * charWidthFactor) + 0.15;
        width = Math.max(minColWidth, Math.min(maxColWidth, width));
        return width;
      });
    }

    // Helper function to calculate total section height (reuse from Target)
    function calculateSectionHeightRef(section) {
      let height = 0;

      // Section header height
      height += lineHeight * 2.2; // Title
      height += lineHeight * 0.2; // Post-underline space (reduced from 0.5)

      // Row heights
      section.rows.forEach(row => {
        if (row.isSubheaderRow) {
          height += lineHeight * 0.8; // Pre-subheader spacing
          height += lineHeight * 1.8; // Subheader row height
        } else {
          height += lineHeight; // Normal row height
        }
      });

      // Section spacing
      height += sectionSpacing;

      return height;
    }

    // Iterate through Reference Model sections (skip Section 01 - already rendered)
    referenceData.sections.forEach((section, sectionIndex) => {
      // Skip Section 01 (Key Values) - rendered on its own page after title sheet
      if (section.title === "01. Key Values") return;

      // Calculate full section height to check if entire section fits on current page
      const fullSectionHeight = calculateSectionHeightRef(section);

      // If entire section doesn't fit on current page, move to next page
      if (yPos + fullSectionHeight > bottomMargin) {
        pdf.addPage();
        yPos = topMargin;
      }

      // Calculate dynamic column widths for this section
      const columnWidths = calculateColumnWidthsRef(section);

      // Section header
      pdf.setFontSize(12);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor("#000000");
      pdf.text(section.title, leftMargin, yPos);
      yPos += lineHeight * 2.2; // Increased from 1.5 to 2.2 for better spacing

      // Draw underline for section header
      pdf.setDrawColor("#CCCCCC");
      pdf.setLineWidth(0.01);
      pdf.line(leftMargin, yPos - lineHeight * 0.8, rightMargin, yPos - lineHeight * 0.8); // Underline positioned higher
      yPos += lineHeight * 0.2; // Reduced from 0.5 to 0.2 for tighter spacing

      // Section rows
      section.rows.forEach((row, rowIndex) => {
        // Add extra space before subheader rows for breathing room (Comment #1)
        if (row.isSubheaderRow) {
          yPos += lineHeight * 0.8; // Increased from 0.5 to 0.8 for more vertical space
          checkPageBreak(lineHeight * 3); // More space needed for multi-line headers
        } else {
          checkPageBreak(lineHeight * 2);
        }

        // Row number (small grey text) - compact format
        pdf.setFontSize(7);
        pdf.setTextColor("#999999");
        pdf.setFont(undefined, "normal");
        const rowNumberText = `${section.title.split(".")[0]}.${rowIndex + 1}`;
        pdf.text(rowNumberText, leftMargin, yPos);

        // Description (Column C, now index 1 after skipping Column B) - start closer to left, grey for Reference
        const descCell = row.cells[1]; // Column C (was index 2, now index 1 after skipping B)
        if (descCell && descCell.content) {
          pdf.setFontSize(9);
          pdf.setTextColor("#888888"); // Grey for Reference
          pdf.setFont(undefined, descCell.isBold ? "bold" : "normal");
          // Truncate long descriptions to fit - reduced from 35 to 28 characters (match Target)
          const maxDescWidth = 28; // characters
          const descText = descCell.content.length > maxDescWidth
            ? descCell.content.substring(0, maxDescWidth) + "..."
            : descCell.content;
          pdf.text(descText, leftMargin + 0.25, yPos); // Moved closer to row number (was 0.6)
        }

        // Value columns (D onwards, now index 2+ after skipping B and optionally F/J) - use dynamic widths
        let xPos = leftMargin + 3.0; // Start position for value columns (was 3.5, now 3.0)

        row.cells.slice(2).forEach((cell, cellIndex) => {
          if (cell.content && cell.colSpan === 1) {
            const colWidth = columnWidths[cellIndex] || 0.85;

            // Use smaller font for subheaders
            pdf.setFontSize(row.isSubheaderRow ? 7 : 9);

            // Apply grey color for Reference Model, red for differences
            // TODO: Implement difference detection by comparing with targetData
            pdf.setTextColor("#888888");

            // Apply bold if user input or calculated
            pdf.setFont(
              undefined,
              cell.isBold || cell.isUserInput ? "bold" : "normal"
            );

            // Handle multi-line text for subheaders (newline character support)
            if (row.isSubheaderRow && cell.content.includes("\n")) {
              const lines = cell.content.split("\n");
              lines.forEach((line, lineIdx) => {
                pdf.text(line, xPos, yPos + (lineIdx * lineHeight * 0.8));
              });
            } else {
              // Render cell content without truncation
              pdf.text(cell.content, xPos, yPos);
            }

            xPos += colWidth;
          } else if (cell.colSpan === 1) {
            // Empty cell, still advance position
            const colWidth = columnWidths[cellIndex] || 0.85;
            xPos += colWidth;
          }
        });

        // Use taller line height for subheader rows to accommodate multi-line text
        // Add extra spacing (1mm = ~0.04") so text sits above the divider line
        const rowHeight = row.isSubheaderRow ? lineHeight * 1.8 : lineHeight;
        yPos += rowHeight + 0.04; // 1mm extra spacing

        // Light grey row separator - draw below text with small gap (Comment #2)
        pdf.setDrawColor("#E0E0E0");
        pdf.setLineWidth(0.005);
        pdf.line(leftMargin + 0.3, yPos + lineHeight * 0.02, rightMargin, yPos + lineHeight * 0.02);
      });

      yPos += sectionSpacing;
    });

    // Add disclaimer and credits page at the very end
    addDisclaimerPage(pdf, buildingInfo, leftMargin, topMargin, pageWidth, pageHeight);

    // Update page numbers for all pages (including new Reference pages)
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 2; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor("#666666");

      // Determine which model this page belongs to
      const modelType = i <= Math.ceil(pageCount / 2) ? "Target" : "Reference";

      pdf.text(
        `${buildingInfo.projectTitle} - ${modelType} Model`,
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
  }
    // Final TODOs:
    // 1. Need to add section for Disclaimer from LICENSE.txt in fine italic print
    // 2. Credits and version info could added after disclaimer in same fine italic print
    // 3. Add CSV Embed Function for user convenience - at most appropriate place
    // 4. Add styling Blue for Reference inputs and Red for differences in Reference model per FileHandler .csv exported fields array as template
    // 5. Add more space between text rows so text is not on the lines
    // 6. Test with S18 render (Graphics)

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
