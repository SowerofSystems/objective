# PDF Report Export - Implementation Plan

**Feature**: Download Report (PDF) button
**Goal**: Export clean, professional PDF of calculator data without UI chrome
**Status**: In Progress (Dec 4, 2025)

## Overview

Export the OBJECTIVE calculator data as a clean PDF report that mirrors the DOM content but removes UI controls and adds professional formatting. Uses client-side PDF generation to avoid backend dependencies. Disclaimer and license for use at end of printed document. 

## Requirements

### Included Content
- **15/19 sections** (S01-S15) with data exactly as displayed in DOM
- **Preserve formatting**: Bold, italic, font sizes from current display
- **Row numbers**: Small grey font on left margin for reference
- **Light grey horizontal dividers**: Between rows for readability
- **Section headers**: Keep section icons and titles
- **Both Models**: Export 2 reports, Target Model AND Reference Model. Reference report will have ALL text in light grey except bold warning red colour font for values that differ from the Target model for clarity. Reference report can have mostly black text except grey where ghosted, line numbers, etc.
- **Title sheet**  : to be 50% whitespace, large/bold Project name as title, and S02 Building information data under the title which is at the vertical centre of the page. 

### Excluded Content
- **UI Controls**: Buttons, sliders (we can simply show values), input controls, dropdowns - just the relevant text for the selected values and options. 
- **Interactive Elements**: Toggles, modals, navigation tabs
- **Graphics Sections**: Skip S16 (Sankey), S17 (Dependency Graph), S18 (Optimize) and S19 (Debug/Dev/Notes) for now
- **Action Buttons**: Import/Export, Reset, Tilt, etc.
- **Section expand/collapse controls**

### PDF Specifications
- **Page Size**: US Letter (8.5" x 11") or Legal (8.5" x 14")
- **Orientation**: Landscape preferred (wider tables fit better), but portrait should be considered (more standard)
- **Margins**: 0.5" all sides
- **Font**: Match DOM (system sans-serif stack)
- **Colors**: Minimize - use greys for structure, black for data, blue/bold for user inputs, dark red for reference user inputs
- **Layout**: Auto-flow sections across pages, intelligent page breaks - ideally at start/end of sections. 

## Technical Approach

### Recommended Library: jsPDF + html2canvas

**Why jsPDF?**
- ✅ Most popular client-side PDF library (29k GitHub stars)
- ✅ Works entirely in browser (no backend required)
- ✅ Handles multi-page documents automatically
- ✅ Good text rendering quality
- ✅ Active maintenance (last update 2024)
- ✅ Already using XLSX library - similar pattern

**Installation:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

### Alternative Considered: Print CSS + window.print()

**Why NOT using print CSS:**
- ❌ User specified: "will NOT use browser print function"
- ❌ Less control over exact formatting
- ❌ Browser-dependent rendering
- ❌ Can't customize filename easily
- ✅ But already works as fallback

## Implementation Plan

### Phase 1: DOM Cloning & Sanitization (2-3 hours)

**Goal**: Create clean copy of DOM without UI chrome

```javascript
// File: src/core/ReportGenerator.js
function createCleanDOM() {
  // 1. Clone entire calculator container
  const original = document.getElementById('calculator-container');
  const clone = original.cloneNode(true);

  // 2. Remove excluded sections
  ['section16', 'section17', 'section18'].forEach(id => {
    const section = clone.querySelector(`#${id}`);
    if (section) section.remove();
  });

  // 3. Remove all UI controls
  const uiSelectors = [
    'button',
    'input[type="range"]',
    '.section-controls',
    '.layout-toggle-btn',
    '.reference-toggle',
    '.dropdown',
    '.modal'
  ];
  uiSelectors.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove());
  });

  // 4. Remove contenteditable attributes
  clone.querySelectorAll('[contenteditable]').forEach(el => {
    el.removeAttribute('contenteditable');
  });

  // 5. Add row numbers
  addRowNumbers(clone);

  return clone;
}
```

**Tasks**:
- [ ] Create `src/core/ReportGenerator.js` module
- [ ] Implement DOM cloning logic
- [ ] Remove all interactive elements
- [ ] Test clone renders correctly in hidden container

### Phase 2: Styling for Print (1-2 hours)

**Goal**: Apply clean, minimal styling for PDF output

```javascript
function applyPrintStyles(clone) {
  // Create style element for PDF-specific styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    /* Clean table styling */
    .report-output table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }

    .report-output tr {
      border-bottom: 1px solid #e0e0e0;
    }

    .report-output td {
      padding: 6px 8px;
      font-size: 10pt;
    }

    /* Row numbers */
    .report-output .row-number {
      color: #999;
      font-size: 8pt;
      width: 30px;
      text-align: right;
      padding-right: 8px;
    }

    /* Section headers */
    .report-output .section-header {
      background: #f5f5f5;
      padding: 12px;
      margin-top: 20px;
      font-weight: bold;
      font-size: 14pt;
      border-bottom: 2px solid #333;
    }

    /* Preserve existing formatting */
    .report-output .calculated { font-weight: bold; }
    .report-output .italic { font-style: italic; }

    /* Page breaks */
    .report-output .section {
      page-break-inside: avoid;
    }

    .report-output .page-break {
      page-break-before: always;
    }
  `;

  clone.prepend(styleSheet);
  return clone;
}
```

**Tasks**:
- [ ] Design minimal print stylesheet
- [ ] Preserve bold/italic from DOM
- [ ] Add light grey row separators
- [ ] Test font sizes render correctly

### Phase 3: Row Numbering (1 hour)

**Goal**: Add small row numbers for reference

```javascript
function addRowNumbers(clone) {
  clone.querySelectorAll('.section').forEach((section, sectionIdx) => {
    const rows = section.querySelectorAll('tr');
    rows.forEach((row, rowIdx) => {
      const numberCell = document.createElement('td');
      numberCell.className = 'row-number';
      numberCell.textContent = `${sectionIdx + 1}.${rowIdx + 1}`;
      row.insertBefore(numberCell, row.firstChild);
    });
  });
}
```

**Tasks**:
- [ ] Implement row numbering function
- [ ] Use section.row format (e.g., "1.5" = Section 1, Row 5)
- [ ] Style numbers in light grey, small font
- [ ] Ensure doesn't break table layout

### Phase 4: PDF Generation (2-3 hours)

**Goal**: Convert clean DOM to multi-page PDF

```javascript
async function generatePDF(cleanDOM) {
  const { jsPDF } = window.jspdf;

  // Create PDF in landscape Letter (11" x 8.5")
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: 'letter'
  });

  // Render DOM to canvas
  const canvas = await html2canvas(cleanDOM, {
    scale: 2, // Higher quality
    useCORS: true,
    logging: false
  });

  // Calculate pages needed
  const imgWidth = 11; // Letter landscape width
  const pageHeight = 8.5;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  // Add first page
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Add subsequent pages
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `OBJECTIVE-Report-${timestamp}.pdf`;

  // Download
  pdf.save(filename);
}
```

**Alternative Approach (Text-based, better quality):**

```javascript
async function generatePDF_TextBased(data) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: 'letter'
  });

  let yPos = 0.5;
  const leftMargin = 0.5;
  const lineHeight = 0.15;

  // Add each section
  data.sections.forEach(section => {
    // Section header
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text(section.title, leftMargin, yPos);
    yPos += lineHeight * 1.5;

    // Section rows
    pdf.setFontSize(10);
    section.rows.forEach(row => {
      pdf.setFont(undefined, 'normal');
      pdf.text(row.label, leftMargin, yPos);

      pdf.setFont(undefined, row.isBold ? 'bold' : 'normal');
      pdf.text(row.value, leftMargin + 5, yPos);

      yPos += lineHeight;

      // Page break if needed
      if (yPos > 8) {
        pdf.addPage();
        yPos = 0.5;
      }
    });

    yPos += lineHeight; // Space between sections
  });

  pdf.save('OBJECTIVE-Report.pdf');
}
```

**Tasks**:
- [ ] Implement canvas-based PDF generation (Phase 4A)
- [ ] Implement text-based PDF generation (Phase 4B - better quality)
- [ ] Test multi-page layout
- [ ] Handle page breaks intelligently
- [ ] Add header/footer with page numbers
- [ ] Generate timestamp-based filename

### Phase 5: Data Extraction (1-2 hours)

**Goal**: Extract structured data from DOM for text-based PDF

```javascript
function extractReportData() {
  const sections = [];

  document.querySelectorAll('.section').forEach(section => {
    const sectionId = section.id;

    // Skip graphics sections
    if (['section16', 'section17', 'section18'].includes(sectionId)) {
      return;
    }

    const title = section.querySelector('.section-header').textContent.trim();
    const rows = [];

    section.querySelectorAll('tr').forEach(row => {
      const cells = Array.from(row.querySelectorAll('td, th'));
      const rowData = cells.map(cell => ({
        text: cell.textContent.trim(),
        isBold: window.getComputedStyle(cell).fontWeight >= 600,
        isItalic: window.getComputedStyle(cell).fontStyle === 'italic',
        className: cell.className
      }));

      if (rowData.length > 0) {
        rows.push(rowData);
      }
    });

    sections.push({ id: sectionId, title, rows });
  });

  return {
    sections,
    mode: getCurrentMode(),
    timestamp: new Date().toISOString(),
    projectName: getProjectName()
  };
}
```

**Tasks**:
- [ ] Extract section titles
- [ ] Extract row data with formatting
- [ ] Capture current mode (Target/Reference)
- [ ] Include project metadata
- [ ] Test extraction completeness

### Phase 6: UI Integration (1 hour)

**Goal**: Wire up Download Report button

```javascript
// In src/core/FileHandler.js or new ReportGenerator.js

function initializeReportDownload() {
  const downloadBtn = document.getElementById('downloadReport');

  if (downloadBtn) {
    downloadBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      // Show loading indicator
      const originalText = downloadBtn.textContent;
      downloadBtn.textContent = 'Generating PDF...';
      downloadBtn.disabled = true;

      try {
        // Extract data
        const reportData = extractReportData();

        // Generate PDF (choose approach)
        await generatePDF_TextBased(reportData); // Recommended
        // OR
        // const cleanDOM = createCleanDOM();
        // await generatePDF(cleanDOM);

        console.log('PDF Report generated successfully');
      } catch (error) {
        console.error('PDF generation failed:', error);
        alert('Failed to generate PDF. Please try again.');
      } finally {
        // Restore button
        downloadBtn.textContent = originalText;
        downloadBtn.disabled = false;
      }
    });
  }
}

// Call on DOM ready
document.addEventListener('DOMContentLoaded', initializeReportDownload);
```

**Tasks**:
- [ ] Add event listener to Download Report button
- [ ] Show loading state during generation
- [ ] Handle errors gracefully
- [ ] Test download functionality

## Completed Work (Dec 4, 2025)

### ✅ Phase 4B: Text-Based PDF Generation (COMPLETED)
- **File Created**: `src/core/Reporter.js` (802 lines)
- **Approach**: Text-based jsPDF (not html2canvas)
- **Features Implemented**:
  - Dual-report generation (Target + Reference models combined into single PDF)
  - Professional title sheets for both models with left-aligned layout
  - Building information from Section02 field definitions (proper labels)
  - Location field combining City + Province (h_19, d_19)
  - Metric timestamp format (YYYY.MM.DD, HHhMM)
  - Text-based footer with generation timestamp and attribution
  - Multi-page layout with automatic page breaks
  - Section headers with proper formatting
  - Row numbering in format "02.1" (Section.Row)
  - Data extraction from DOM with formatting preservation

### ✅ Phase 5: Data Extraction (COMPLETED)
- **Function**: `extractReportData()` in Reporter.js
- Extracts sections S01-S15 (skips graphics S16-S18)
- Captures cell content, formatting (bold/italic), field IDs, classes
- Handles dropdowns, sliders, number inputs, and text content
- Mode-aware extraction (Target vs Reference)

### ✅ Phase 6: UI Integration (COMPLETED)
- **File Modified**: `src/core/init.js` (lines 702-739)
- Wired up "Download Report" button
- Loading state during PDF generation ("Generating PDFs...")
- Error handling with user alerts
- Null-safety checks for optional buttons (teui-factsheet, tedi-factsheet)

### ✅ Library Integration (COMPLETED)
- **File Modified**: `index.html` (lines 65-67, 89-90)
- Added jsPDF 2.5.1 via CDN
- Added html2canvas 1.4.1 via CDN (for future use)
- Registered Reporter.js module in load order

### Title Sheet Details (COMPLETED)
- **Layout**: Landscape Letter (11" × 8.5"), 0.5" margins
- **Project Title**: Large (24pt), bold, left-justified at vertical center
- **Model Type**: "Target Model Report" or "Reference Model Report" (16pt, grey for Reference)
- **Building Info**: Left-justified label: value pairs using proper field labels:
  - Major Occupancy (d_12)
  - Reference Standard (d_13)
  - Location (h_19, d_19) - "City, Province" format
  - Reporting Period (h_12)
  - Service Life (h_13)
  - Conditioned Area (h_15)
  - Certifier (i_16)
  - License No. (i_17)
  - ~~Carbon Benchmarking Standard~~ (removed to reduce clutter)
- **Footer**: Generation timestamp (left) + "OBJECTIVE TEUI Calculator | openbuilding.ca" (right)
- **Logo Attempts**: PNG and SVG logos attempted but removed due to:
  - PNG corruption errors
  - SVG plugin requirement
  - ~33ms load time regression
  - Decision: Text-only footer for performance

### Current Issues
1. **Horizontal Layout** (IN PROGRESS):
   - Excessive whitespace after row numbers
   - Content clipping on right edge of page
   - Need to optimize column widths for landscape layout
   - Screenshot analysis shows wasted space in row number column

2. **Performance**:
   - Minor load time regression (~33ms)
   - May be related to CDN/Cloudflare for jsPDF libraries
   - Need to test if removing logos improved performance

### Next Steps
1. **Fix horizontal layout** (HIGH PRIORITY):
   - Reduce row number column width
   - Optimize content column spacing
   - Ensure all data fits within page width
   - Test with various section widths

2. **Reference Model Styling** (MEDIUM PRIORITY):
   - Implement grey text for Reference model content
   - Add red highlighting for values differing from Target
   - Use `targetData` parameter in `generatePDF()` for comparison

3. **Testing** (HIGH PRIORITY):
   - Test all 15 sections render correctly
   - Verify no content clipping
   - Check page breaks are intelligent
   - Test with different data sets

## File Structure

```
src/core/
  ├── Reporter.js              ✅ NEW - PDF export logic (802 lines)
  ├── init.js                  ✅ MODIFIED - wired up Download Report button
  └── ...

index.html                     ✅ MODIFIED - added jsPDF/html2canvas CDN links

docs/development/
  └── EXPORT-REPORT.md          (This file)
```

## Testing Checklist

- [ ] All sections (S01-S15, S19) appear in PDF
- [ ] Graphics sections (S16-S18) excluded correctly
- [ ] No UI controls appear in PDF
- [ ] Bold/italic formatting preserved
- [ ] Row numbers display correctly
- [ ] Section headers formatted properly
- [ ] Multi-page layout works (no cut-off content)
- [ ] PDF downloads with correct filename
- [ ] Works in both Target and Reference modes
- [ ] File size reasonable (< 5MB target)
- [ ] Text is selectable (not rasterized)
- [ ] Renders correctly on mobile/tablet

## Recommended Approach: Text-Based PDF (jsPDF)

**Advantages over html2canvas:**
1. **Smaller file size** - Text rendered as vectors, not raster images
2. **Selectable text** - Users can copy/paste from PDF
3. **Better quality** - Sharp at any zoom level
4. **Faster generation** - No canvas rendering step
5. **More control** - Precise page breaks, headers, footers

**Disadvantages:**
1. **More code** - Need to manually layout each element
2. **Complex tables** - Harder to match exact DOM layout
3. **Custom fonts** - Need to embed if using non-standard fonts

**Verdict:** Use text-based jsPDF approach for production quality.

## Implementation Timeline

**Total Estimate**: 8-12 hours

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1: DOM Cloning | 2-3 hrs | High |
| Phase 2: Print Styles | 1-2 hrs | High |
| Phase 3: Row Numbers | 1 hr | Medium |
| Phase 4: PDF Generation | 2-3 hrs | High |
| Phase 5: Data Extraction | 1-2 hrs | High |
| Phase 6: UI Integration | 1 hr | High |
| Testing & Refinement | 2-3 hrs | High |

**Suggested Development Order:**
1. Start with Phase 5 (data extraction) to understand structure
2. Build Phase 4B (text-based PDF) with sample data
3. Add Phase 3 (row numbers) to data extraction
4. Implement Phase 6 (UI integration)
5. Polish Phase 2 (styling) for final look
6. Test extensively across browsers

## First Draft Enhancements

- [ ] Add cover page with project details 
- [ ] Include report generation date/time 
- [ ] Add page numbers in footer
- [ ] FUTURE: Support for graphics sections (S16-S18) as embedded images
- [ ] FUTURE: Custom paper sizes (Tabloid, A4)
- [ ] FUTURE: Option to include/exclude specific sections
- [ ] No Wod Doc, prefer to not offer editable formats which could falsify results
- [ ] FUTURE: Email PDF directly from app

## References

- jsPDF Documentation: https://github.com/parallax/jsPDF
- jsPDF Examples: https://raw.githack.com/MrRio/jsPDF/master/docs/index.html
- html2canvas: https://html2canvas.hertzen.com/
- Alternative: pdfmake (more powerful, steeper learning curve)

## Notes

- Consider performance for large documents (1000+ rows)
- Test memory usage during canvas rendering
- Fallback to CSV export if PDF fails
- Consider progressive rendering for better UX (show progress bar)
