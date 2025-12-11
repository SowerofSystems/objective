# Section 18 Parallel Coordinates - Style Cleanup Analysis

**Date:** November 26, 2025
**Branch:** Super-Buttons
**Purpose:** Identify and consolidate inline styles from ParallelCoordinates.js into styles.css

---

## Summary

ParallelCoordinates.js contains **significant inline styling** that should be moved to CSS for:
- Maintainability (centralized styling)
- Performance (reusable classes vs. inline strings)
- Consistency (all S18 styles in one location)

**Current State:**
- CSS: ~100 lines of S18 styles (lines 1902-2008 in styles.css)
- JS: ~40+ inline style assignments scattered throughout

---

## Inline Styles Inventory

### Category 1: Button Styles (HIGH PRIORITY)
**Location:** Lines 267-288 in ParallelCoordinates.js

```javascript
// Decarbonize button
decarbonizeBtn.style.fontWeight = "500";

// Optimize button (teal)
optimizeBtn.style.cssText = "background-color: #20c997; color: white; border-color: #20c997; font-weight: 500;";

// Super Optimize button (orange)
superOptimizeBtn.style.cssText = "background-color: #ff8c00; color: white; border-color: #ff8c00; font-weight: 500;";

// PassivHaus-ify button (yellow/red)
passivhausBtn.style.cssText = "background-color: #ffc107; color: #dc3545; border-color: #ffc107; font-weight: 500;";
```

**Recommendation:** Move to CSS classes
```css
/* Super Buttons - Optimization Actions */
.pc-btn-decarbonize {
  font-weight: 500;
}

.pc-btn-optimize {
  background-color: #20c997;
  color: white;
  border-color: #20c997;
  font-weight: 500;
}

.pc-btn-super-optimize {
  background-color: #ff8c00;
  color: white;
  border-color: #ff8c00;
  font-weight: 500;
}

.pc-btn-passivhaus {
  background-color: #ffc107;
  color: #dc3545;
  border-color: #ffc107;
  font-weight: 500;
}
```

---

### Category 2: Legend Container Styles (MEDIUM PRIORITY)
**Location:** Lines 311-364 in ParallelCoordinates.js

```javascript
// Feedback console
feedbackConsole.style.cssText =
  "color: #0dcaf0; font-size: 0.8rem; font-family: monospace; margin-left: 10px;";

// Legend container
legendContainer.style.cssText =
  "display: flex; gap: 15px; align-items: center; margin-left: 20px; margin-right: 20px; padding-left: 20px; border-left: 1px solid #dee2e6;";

// Line legend container
lineLegendContainer.style.cssText = "display: flex; gap: 12px; align-items: center;";

// Target line legend
targetLineLegend.style.cssText = "display: flex; align-items: center; gap: 6px;";

// Reference line legend
referenceLineLegend.style.cssText = "display: flex; align-items: center; gap: 6px;";

// Node legend container
nodeLegendContainer.style.cssText = "display: flex; gap: 12px; align-items: center; padding-left: 15px; border-left: 1px solid #dee2e6;";

// Calculated node legend
calculatedNodeLegend.style.cssText = "display: flex; align-items: center; gap: 6px;";

// Editable node legend
editableNodeLegend.style.cssText = "display: flex; align-items: center; gap: 6px;";
```

**Recommendation:** Move to CSS classes
```css
/* Section 18 Feedback Console */
#s18-feedback-console {
  color: #0dcaf0;
  font-size: 0.8rem;
  font-family: monospace;
  margin-left: 10px;
}

/* Legend Containers */
.pc-legend-container {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-left: 20px;
  margin-right: 20px;
  padding-left: 20px;
  border-left: 1px solid #dee2e6;
}

.pc-line-legend {
  display: flex;
  gap: 12px;
  align-items: center;
}

.pc-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pc-node-legend {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-left: 15px;
  border-left: 1px solid #dee2e6;
}
```

---

### Category 3: Modal Styles (MEDIUM PRIORITY)
**Location:** Lines 428-465 in ParallelCoordinates.js

```javascript
// Settings modal backdrop
backdrop.style.cssText =
  "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;";

// Settings modal dialog
modal.style.cssText =
  "background: white; border-radius: 8px; padding: 20px; max-width: 400px; width: 90%; box-shadow: 0 4px 16px rgba(0,0,0,0.2);";

// Modal header
header.style.cssText = "margin: 0 0 15px 0; font-weight: 600;";

// Modal label
label.style.cssText =
  "display: block; margin-bottom: 8px; font-weight: 500;";

// Modal select
select.style.cssText = "margin-bottom: 20px;";

// Modal button container
btnContainer.style.cssText =
  "display: flex; gap: 10px; justify-content: flex-end;";
```

**Recommendation:** Move to CSS classes
```css
/* Settings Modal */
.pc-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pc-modal-dialog {
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.pc-modal-header {
  margin: 0 0 15px 0;
  font-weight: 600;
}

.pc-modal-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.pc-modal-select {
  margin-bottom: 20px;
}

.pc-modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
```

---

### Category 4: Fullscreen Styles (LOW PRIORITY - Keep in JS)
**Location:** Lines 1989-2005 in ParallelCoordinates.js

```javascript
// Fullscreen on
section.style.position = "fixed";
section.style.top = "0";
section.style.left = "0";
section.style.width = "100vw";
section.style.height = "100vh";
section.style.zIndex = "9999";
section.style.background = "white";
section.style.overflow = "auto";

// Fullscreen off (reset all)
section.style.position = "";
// ... etc.
```

**Recommendation:** **KEEP IN JS** - Dynamic state management is appropriate here.
Could use CSS class toggle instead:
```css
.pc-fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 9999 !important;
  background: white !important;
  overflow: auto !important;
}
```

Then JS becomes: `section.classList.toggle('pc-fullscreen')`

---

### Category 5: Loading Placeholder (LOW PRIORITY)
**Location:** Line 188 in ParallelCoordinates.js

```javascript
placeholder.style.cssText =
  "padding: 40px 20px; text-align: center; background: #f9f9f9; border-radius: 4px; color: #666;";
```

**Recommendation:** Move to CSS (already has class `teui-loading-placeholder`)
```css
.teui-loading-placeholder {
  padding: 40px 20px;
  text-align: center;
  background: #f9f9f9;
  border-radius: 4px;
  color: #666;
}
```

---

### Category 6: Inline HTML Styles (KEEP AS-IS)
**Location:** Lines 327, 335, 350, 360, 850, 1038, 2759

These are **template literals with dynamic values** (e.g., `${CONFIG.colors.target}`). Keep as-is:
- Legend line colors (dynamic from CONFIG)
- SVG inline styles (standard practice)
- Table column widths (dynamic)
- Capital input field widths (functional requirement)
- Modal subtitle formatting (conditional rendering)

**Recommendation:** **NO CHANGE** - These use dynamic values and are appropriate as inline styles.

---

### Category 7: Feedback Console Opacity (LOW PRIORITY - Keep in JS)
**Location:** Lines 1214-1223 in ParallelCoordinates.js

```javascript
console.style.opacity = "1";
// ... animation
console.style.transition = "opacity 1s";
console.style.opacity = "0";
```

**Recommendation:** **KEEP IN JS** - Animation state management. Could be refactored to CSS classes if desired:
```css
.s18-feedback-console.visible {
  opacity: 1;
}

.s18-feedback-console.fade-out {
  opacity: 0;
  transition: opacity 1s;
}
```

---

## Implementation Plan

### Priority 1: Button Styles (High Impact)
- Add 4 button classes to styles.css
- Replace inline `style.cssText` with `className` in JS
- Lines affected: 267-288

### Priority 2: Legend Container Styles
- Add 5 legend classes to styles.css
- Replace inline `style.cssText` with `className` in JS
- Lines affected: 311-364

### Priority 3: Modal Styles
- Add 6 modal classes to styles.css
- Replace inline `style.cssText` with `className` in JS
- Lines affected: 428-465

### Priority 4: Loading Placeholder
- Use existing `.teui-loading-placeholder` class
- Remove inline style assignment
- Lines affected: 188

### Priority 5 (Optional): Fullscreen Toggle
- Add `.pc-fullscreen` class to styles.css
- Replace style property assignments with `classList.toggle()`
- Lines affected: 1989-2005

### Priority 6 (Optional): Feedback Console Animation
- Add animation classes to styles.css
- Replace style property assignments with `classList` operations
- Lines affected: 1214-1223

---

## Estimated Impact

**Before:**
- ~40 inline style assignments in JS
- ~100 lines of CSS

**After (Priorities 1-4):**
- ~15 inline style assignments in JS (dynamic values only)
- ~200 lines of CSS (centralized)

**Benefits:**
- Easier maintenance (all styles in one place)
- Better performance (class reuse vs. string parsing)
- Cleaner separation of concerns (presentation vs. logic)
- Easier theming/customization (CSS only)

---

## Files to Modify

1. **styles.css** - Add new classes (Priorities 1-5)
2. **ParallelCoordinates.js** - Replace inline styles with class assignments (Priorities 1-5)

---

## Next Steps

1. Review this analysis with user
2. Get approval for priority levels
3. Implement changes in order (Priority 1 → 5)
4. Test each category after changes
5. Commit with proper message format

---

**End of Analysis**
