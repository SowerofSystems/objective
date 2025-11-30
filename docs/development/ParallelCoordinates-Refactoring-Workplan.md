# ParallelCoordinates.js Refactoring Work Plan

**Date Created:** November 29, 2025
**Target Date:** November 30, 2025
**Estimated Time:** 2-3 hours (including testing)
**Current File Size:** 3,114 lines (109KB)
**Target File Size:** ~2,000 lines (with deduplication)
**Risk Level:** Moderate (requires thorough testing)

---

## Current Problems

### 1. Illogical Organization
- **EDITABLE_AXES** is at line 2360 (should be near top with CONFIG)
- **getAxisConfig()** is at line 2594 (should be adjacent to EDITABLE_AXES)
- Configuration scattered across 2000+ lines of separation
- No clear "read from top to bottom" flow

### 2. Massive Code Duplication
The four optimization handlers contain **~850 lines of nearly identical code**:

- `handleDecarbonize()` - 259 lines (1415-1673)
- `handleOptimize()` - 197 lines (1680-1876)
- `handleSuperOptimize()` - 196 lines (1884-2079)
- `handlePassivHausIfy()` - 194 lines (2089-2282)

**Shared Pattern (80% duplicate):**
```javascript
// Every handler does this:
1. Get StateManager reference
2. Get section references (sect07, sect10, sect11, sect12, sect13)
3. Update d_52/d_53 (S07 - SHW/DWHR)
4. Update d_113/f_113/j_115 (S13 - Heating)
5. Update d_118 (S13 - MVHR)
6. Update d_97 (S11 - Thermal Bridge)
7. Update d_80 (S10 - Net Gains)
8. Update d_108/g_109 (S12 - ACH50)
9. Call sect##.TargetState.setValue()
10. Call StateManager.setValue()
11. Call sect##.calculateAll()
12. Call sect##.ModeManager.refreshUI()
13. Build changes[] array
14. Show feedback
15. Refresh graph
```

**Only Differences:**
- Decarbonize: Focuses on fuel switching (SHW + Heating only)
- Optimize: SHW 300%, DWHR 50%, MVHR 85%, TB 20%, nGains 60%, ACH50 1.00
- SuperOptimize: SHW 400%, DWHR 70%, MVHR 95%, TB **10%**, nGains PHPP, ACH50 0.60
- PassivHaus: SHW 400%, DWHR 70%, MVHR 95%, TB **5%**, nGains PHPP, ACH50 0.60

### 3. Development Artifacts
- Inconsistent "Part 1, Part 2, Part 3" comments throughout
- Diagnostic code blocks that could be cleaner
- Redundant comments explaining the same pattern multiple times

---

## Refactoring Goals

### Primary Objectives
1. **Reduce file size by ~35%** (3,114 → ~2,000 lines)
2. **Organize logically** (Configuration → State → Utils → UI → Render → Interact → Actions → API)
3. **Eliminate duplication** (4 handlers → 1 shared function + 4 config objects)
4. **Improve maintainability** (clear sections, consistent patterns)

### Success Criteria
- ✅ All functionality works identically
- ✅ File is ~2,000 lines or less
- ✅ Code follows single responsibility principle
- ✅ No "Part 1, Part 2" artifacts remain
- ✅ Configuration grouped at top
- ✅ Optimization handlers use shared logic

---

## Refactoring Plan

### Phase 1: Reorganize Structure (30 min)

**Step 1.1: Move Configuration to Top**
- Move EDITABLE_AXES (2360-2591) → after CONFIG (line 58)
- Move getAxisConfig() (2594-2608) → after EDITABLE_AXES
- Result: All configuration in lines 20-320

**Step 1.2: Reorder Functions Logically**
Current chaos → Logical flow:

```
1. Configuration (CONFIG, EDITABLE_AXES, getAxisConfig)
2. State Variables (svgElement, currentData, etc.)
3. Utility Functions (formatCurrency, showFeedback, showErrorMessage, createButton)
4. Data Management (fetchData)
5. UI Initialization (initialize, createControls, activate, showSettings)
6. Rendering - Graph (renderGraph + D3 logic)
7. Rendering - Table (renderTable, updateROIRow)
8. Drag Interactions (initializeDrag, dragStarted, dragging, dragEnded)
9. Action Handlers (4 optimization handlers - TO BE REFACTORED)
10. Export & Fullscreen (toggleFullscreen, exportToPNG)
11. Public API (refresh, exports)
```

**Step 1.3: Clean Up Artifacts**
- Remove "Part 1, Part 2, Part 3" comments
- Consolidate redundant explanatory comments
- Standardize section headers

---

### Phase 2: Deduplicate Optimization Handlers (60 min)

**Step 2.1: Extract Common Section Update Pattern**

Create helper function:
```javascript
/**
 * Update a field in both TargetState and StateManager
 * Follows the standard pattern used across all optimization handlers
 */
function updateField(sectionId, fieldId, value) {
  const section = window.TEUI?.SectionModules?.[sectionId];

  // Update section's TargetState
  if (section?.TargetState) {
    section.TargetState.setValue(fieldId, value);
  }

  // Update global StateManager
  const stateManager = window.TEUI?.StateManager;
  if (stateManager) {
    stateManager.setValue(fieldId, value, "user-modified");
  }

  // Trigger recalculation
  if (section?.calculateAll) {
    section.calculateAll();
  }

  // Refresh UI
  if (section?.ModeManager?.refreshUI) {
    section.ModeManager.refreshUI();
  }
}
```

**Step 2.2: Create Optimization Preset Configurations**

```javascript
const OPTIMIZATION_PRESETS = {
  decarbonize: {
    name: "Decarbonize",
    fields: [
      // Only SHW and Heating (fuel switching focus)
      { section: "sect07", field: "d_51", value: "Heatpump" }, // Switch to HP first
      { section: "sect07", field: "d_52", value: "300" },      // Then set efficiency
      { section: "sect13", field: "d_113", value: "Heatpump" },
      { section: "sect13", field: "f_113", value: "12.5" },
    ],
    feedback: (changes) => changes.join(", ")
  },

  optimize: {
    name: "Optimize",
    fields: [
      { section: "sect07", field: "d_51", value: "Heatpump", preCalc: true },
      { section: "sect07", field: "d_52", value: "300" },
      { section: "sect07", field: "d_53", value: "50" },
      { section: "sect13", field: "j_115", value: "0.98", condition: (sm) => ["Oil", "Gas"].includes(sm.getValue("d_113")) },
      { section: "sect13", field: "f_113", value: "12.5", condition: (sm) => sm.getValue("d_113") === "Heatpump" },
      { section: "sect13", field: "d_118", value: "85" },
      { section: "sect11", field: "d_97", value: "20" },
      { section: "sect10", field: "d_80", value: "NRC 60%" },
      { section: "sect12", field: "d_108", value: "MEASURED", preCalc: true },
      { section: "sect12", field: "g_109", value: "1.00" },
    ],
    feedback: (changes) => `Optimized: ${changes.join(", ")}`
  },

  superOptimize: {
    name: "Super Optimize",
    fields: [
      { section: "sect07", field: "d_51", value: "Heatpump", preCalc: true },
      { section: "sect07", field: "d_52", value: "400" },
      { section: "sect07", field: "d_53", value: "70" },
      { section: "sect13", field: "j_115", value: "0.98", condition: (sm) => ["Oil", "Gas"].includes(sm.getValue("d_113")) },
      { section: "sect13", field: "f_113", value: "15", condition: (sm) => sm.getValue("d_113") === "Heatpump" },
      { section: "sect13", field: "d_118", value: "95" },
      { section: "sect11", field: "d_97", value: "10" }, // KEY DIFFERENCE: 10% vs 5%
      { section: "sect10", field: "d_80", value: "PH Method" },
      { section: "sect12", field: "d_108", value: "MEASURED", preCalc: true },
      { section: "sect12", field: "g_109", value: "0.60" },
    ],
    feedback: (changes) => `Super Optimized: ${changes.join(", ")}`
  },

  passivhaus: {
    name: "PassivHaus-ify",
    fields: [
      { section: "sect07", field: "d_51", value: "Heatpump", preCalc: true },
      { section: "sect07", field: "d_52", value: "400" },
      { section: "sect07", field: "d_53", value: "70" },
      { section: "sect13", field: "j_115", value: "0.98", condition: (sm) => ["Oil", "Gas"].includes(sm.getValue("d_113")) },
      { section: "sect13", field: "f_113", value: "15", condition: (sm) => sm.getValue("d_113") === "Heatpump" },
      { section: "sect13", field: "d_118", value: "95" },
      { section: "sect11", field: "d_97", value: "5" }, // KEY DIFFERENCE: 5% vs 10%
      { section: "sect10", field: "d_80", value: "PH Method" },
      { section: "sect12", field: "d_108", value: "MEASURED", preCalc: true },
      { section: "sect12", field: "g_109", value: "0.60" },
    ],
    feedback: (changes) => `PassivHaus: ${changes.join(", ")}`
  }
};
```

**Step 2.3: Create Unified Optimization Handler**

```javascript
/**
 * Apply an optimization preset
 * Replaces the 4 individual handlers with a data-driven approach
 */
function applyOptimizationPreset(presetName) {
  console.log(`[ParallelCoordinates] ${presetName} action triggered`);

  const stateManager = window.TEUI?.StateManager;
  if (!stateManager) {
    console.error("[ParallelCoordinates] StateManager not available");
    return;
  }

  const preset = OPTIMIZATION_PRESETS[presetName];
  if (!preset) {
    console.error(`[ParallelCoordinates] Unknown preset: ${presetName}`);
    return;
  }

  let changesMade = false;
  const changes = [];

  // Apply each field update in the preset
  for (const update of preset.fields) {
    // Skip if condition not met
    if (update.condition && !update.condition(stateManager)) {
      continue;
    }

    // If preCalc flag set, recalculate section first (for dropdown switches)
    if (update.preCalc) {
      const section = window.TEUI?.SectionModules?.[update.section];
      if (section?.calculateAll) {
        section.calculateAll();
      }
    }

    // Apply the update
    updateField(update.section, update.field, update.value);

    // Track change for feedback
    const label = `${update.field} ${update.value}`;
    changes.push(label);
    changesMade = true;
  }

  // Show feedback and refresh
  if (changesMade) {
    const message = preset.feedback(changes);
    showFeedback(message, 6000);
    setTimeout(() => refresh(), 200);
  } else {
    showFeedback("No changes needed", 4000);
  }
}

// Replace the 4 handlers with simple wrapper calls
function handleDecarbonize() { applyOptimizationPreset("decarbonize"); }
function handleOptimize() { applyOptimizationPreset("optimize"); }
function handleSuperOptimize() { applyOptimizationPreset("superOptimize"); }
function handlePassivHausIfy() { applyOptimizationPreset("passivhaus"); }
```

**Expected Savings:**
- Before: ~850 lines (4 handlers)
- After: ~150 lines (config objects + shared function + wrappers)
- **Reduction: ~700 lines**

---

### Phase 3: Testing (45 min)

**Test Plan Checklist:**

#### Basic Functionality
- [ ] Page loads without console errors
- [ ] Section 18 activates properly
- [ ] Graph renders with correct axes
- [ ] Table displays all rows
- [ ] Tooltips appear on button hover

#### Optimization Buttons
- [ ] **Decarbonize:** Switches SHW/Heating to Heatpump, correct efficiencies
- [ ] **Optimize:** All 8 parameters updated correctly (TB=20%)
- [ ] **Super Optimize:** All 8 parameters updated correctly (TB=10%)
- [ ] **PassivHaus-ify:** All 8 parameters updated correctly (TB=5%)
- [ ] Feedback console shows correct messages
- [ ] Graph refreshes after each action
- [ ] Values persist in StateManager

#### Interaction
- [ ] Drag nodes on graph works
- [ ] Values snap correctly
- [ ] StateManager updates on drag end
- [ ] Sections recalculate after drag

#### Export & Display
- [ ] Export to PNG works
- [ ] Fullscreen toggle works
- [ ] Settings modal (ROI Term) works
- [ ] Capital budget inputs save/update

#### Regression Testing
- [ ] Reference mode vs Target mode isolation
- [ ] S07 mode switching (diagnostic flag test)
- [ ] No unexpected state mixing between Target/Reference

---

### Phase 4: Documentation (15 min)

**Update Comments:**
- Add JSDoc to `updateField()` helper
- Add JSDoc to `applyOptimizationPreset()`
- Document OPTIMIZATION_PRESETS structure
- Update file header with refactoring date

**Update Section Headers:**
- Ensure all 10 sections have clear, consistent headers
- Remove "Part 1, Part 2" artifacts
- Add "Refactored: Nov 30, 2025" note to top

---

## Implementation Order

### Session 1: Structure Reorganization (30 min)
1. Create new working file: `ParallelCoordinates-refactor.js`
2. Move configuration to top
3. Reorder all functions into logical sections
4. Test syntax: `node -c ParallelCoordinates-refactor.js`

### Session 2: Deduplication (60 min)
5. Add `updateField()` helper function
6. Create `OPTIMIZATION_PRESETS` configuration object
7. Create `applyOptimizationPreset()` function
8. Replace 4 handlers with simple wrappers
9. Test syntax again

### Session 3: Testing (45 min)
10. Replace original file with refactored version
11. Run through full test checklist
12. Fix any issues found
13. Verify no regressions

### Session 4: Cleanup (15 min)
14. Update documentation
15. Remove `.backup` file if tests pass
16. Commit with detailed message

**Total Time: 2.5 hours**

---

## Rollback Plan

If issues arise:
1. **Backup exists:** `ParallelCoordinates.js.backup`
2. **Quick restore:** `cp ParallelCoordinates.js.backup ParallelCoordinates.js`
3. **Git reset:** Changes not yet committed can be discarded

---

## Expected Outcomes

### Before Refactoring
- **Size:** 3,114 lines, 109KB
- **Organization:** Chaotic, configuration scattered
- **Duplication:** ~850 lines of repeated optimization code
- **Maintainability:** Low (hard to find things, lots of copy-paste)

### After Refactoring
- **Size:** ~2,000 lines, ~70KB
- **Organization:** Logical top-to-bottom flow
- **Duplication:** Eliminated (shared functions + config objects)
- **Maintainability:** High (clear sections, DRY principles, easy to modify)

---

## Notes

- Keep diagnostic code blocks (they're helpful for debugging S07-S13-S18 state mix bug)
- Preserve all console.log statements (useful for troubleshooting)
- Maintain tooltip integration exactly as-is (working correctly)
- Don't change any D3.js rendering logic (complex and working)
- Keep drag behavior patterns identical (well-tested)

---

## Success Metrics

| Metric | Before | Target |
|--------|--------|--------|
| Line Count | 3,114 | ~2,000 |
| File Size | 109KB | ~70KB |
| Code Duplication | High | Minimal |
| Configuration Location | Scattered | Top of file |
| Section Organization | Poor | Excellent |
| Maintainability Score | 4/10 | 9/10 |

---

## Prepared For Testing

When starting tomorrow:
1. Run `git status` to ensure clean working directory
2. Verify backup exists: `ls -lh src/core/ParallelCoordinates.js.backup`
3. Review this work plan
4. Allocate 2.5 hours uninterrupted
5. Have browser dev tools ready for testing
6. Begin with Phase 1: Structure Reorganization
