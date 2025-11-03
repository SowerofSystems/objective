# Reference System UI/Mode Switch Workplan

> **Status**: Planning Phase
> **Goal**: Complete the global Reference mode display system by linking dropdown commands to section controls
> **Scope**: UI/mode switching only - constrained to "Show Reference" and "Show Target" commands
> **Last Updated**: 2025-11-02

---

## Executive Summary

The Reference system UI is **90% complete** but needs final integration between global controls and section-based toggles. The infrastructure exists - we just need to wire it together properly.

### What Works ✅

1. **CSS Styling System**: Complete red/blue theming for Reference/Target modes
2. **Dropdown UI**: Well-organized dropdown with "Reference Setup", "Display Toggle", and "Legacy" sections
3. **Section ModeManagers**: All Pattern A sections (sect02, sect03, sect04, sect08, sect10-sect15) have working dual-state architecture
4. **ReferenceToggle.js**: Core switching logic implemented with `switchAllSectionsMode()`
5. **Button Event Handlers**: All dropdown buttons wired to appropriate functions
6. **Global CSS Application**: Body-level classes apply/remove correctly for application-wide styling

### What's Missing 🔧

1. **Visual Feedback Gap**: Clicking "Show Reference" applies red CSS but sections still display Target values
2. **Section Sync Issue**: Individual section toggles don't coordinate with master toggle
3. **Missing Method Calls**: `updateCalculatedDisplayValues()` not being called on all sections after mode switch
4. **Incomplete ModeManager Integration**: Some sections may not implement all required ModeManager methods

---

## Current State Analysis

### From 4012-REFERENCE.md (Lines 154-183)

**What Works:**
- Dual calculation engines running in parallel ✓
- Perfect state isolation (Target/Reference never mix) ✓
- User input in Reference mode working ✓
- File import populating both models ✓
- CSS styling exists and is comprehensive ✓
- Section-level toggles functional ✓

**What Needs Work:**
- **Master Toggle Display Switching**: CSS changes but values don't switch
- **Reference Setup Mode Functions**: Implemented but paused (not in scope for this workplan)
- **ReferenceValues.js Integration**: Implemented but paused (not in scope for this workplan)

### From Master-Reference-Roadmap.md (Lines 1130-1200)

**Work Paused Status (August 21, 2025):**
- Display toggle infrastructure: ✅ COMPLETED
- Section discovery: ✅ COMPLETED
- Button integration: ✅ COMPLETED
- Field discovery system: ✅ COMPLETED
- **What remains**: Fix missing methods and ensure `updateCalculatedDisplayValues()` calls

**Success Criteria for Resuming Work:**
- Perfect state isolation: ✅ Already achieved
- S13 contamination fixed: ✅ Resolved
- Import/export working: ✅ Working
- Default consistency: ✅ Maintained
- Cross-section clean: ✅ Clean `ref_` prefix isolation

---

## Problem Statement

### User Experience Issue

**Current Behavior:**
1. User clicks "Reference" dropdown → Opens menu
2. User clicks "Show Reference" → Red UI appears
3. **BUT**: All sections still show Target values (blue toggle icons)
4. User must manually click each section's toggle to see Reference values

**Expected Behavior:**
1. User clicks "Reference" dropdown → Opens menu
2. User clicks "Show Reference" → Red UI appears
3. **AND**: All sections automatically switch to Reference values
4. All section toggle icons show "Reference" (red) state

### Root Cause

From [ReferenceToggle.js:63-97](src/core/ReferenceToggle.js#L63-L97):

```javascript
function switchAllSectionsMode(mode) {
  const sections = getAllDualStateSections();
  let switchedCount = 0;

  // Switch all section ModeManagers
  sections.forEach((section) => {
    try {
      if (section.modeManager && typeof section.modeManager.switchMode === "function") {
        section.modeManager.switchMode(mode);
        section.modeManager.updateCalculatedDisplayValues(); // ⚠️ May not exist on all sections
        switchedCount++;
      }
    } catch (error) {
      console.error(`[ReferenceToggle] Error switching ${section.id}:`, error);
    }
  });

  // Apply existing CSS classes for global Reference styling
  const isReference = mode === "reference";
  document.body.classList.toggle("viewing-reference-inputs", isReference);
  // ... more CSS toggles
}
```

**Issues:**
1. `updateCalculatedDisplayValues()` may not exist on all ModeManager implementations
2. No visual update to section header toggles after global switch
3. No verification that section actually switched modes successfully

---

## Scope Definition

### In Scope ✅

**This workplan focuses ONLY on display/UI switching:**
1. "Show Reference" command → All sections display Reference values
2. "Show Target" command → All sections display Target values
3. Section toggle icons sync with global mode
4. CSS styling coordination (red/blue themes)
5. Error handling for sections missing required methods
6. Visual feedback consistency across all sections

### Out of Scope ❌

**Explicitly NOT included in this workplan:**
1. "Mirror Target" setup function (paused work, separate implementation)
2. "Mirror Target + Reference" overlay function (paused work, separate implementation)
3. "Reference Independence" setup (already complete - no-op function)
4. ReferenceValues.js integration and highlighting
5. Import/export functionality
6. State isolation improvements
7. New calculation logic or formula changes

---

## Technical Architecture

### Dual-State Section Pattern (Pattern A)

From [DUAL-STATE-CHEATSHEET.md](docs/development/DUAL-STATE-CHEATSHEET.md):

**Core Components:**
1. **TargetState**: Manages Target model values and calculations
2. **ReferenceState**: Manages Reference model values and calculations
3. **ModeManager**: Facade that switches between states and updates display

**ModeManager Interface:**
```javascript
const ModeManager = {
  currentMode: "target" | "reference",
  switchMode(mode) { ... },           // Required
  getValue(fieldId) { ... },          // Required
  setValue(fieldId, value) { ... },   // Required
  refreshUI() { ... },                // Required
  updateCalculatedDisplayValues() { ... } // ⚠️ May not exist on all sections
};
```

### Section Discovery

From [ReferenceToggle.js:30-57](src/core/ReferenceToggle.js#L30-L57):

**Current Implementation:**
```javascript
function getAllDualStateSections() {
  const sectionIds = [
    "sect02", "sect03", "sect04", "sect08", "sect10",
    "sect11", "sect12", "sect13", "sect14", "sect15"
  ];

  return sectionIds
    .map(id => ({
      id,
      module: window.TEUI?.[id],
      modeManager: window.TEUI?.[id]?.ModeManager
    }))
    .filter(s => s.modeManager);
}
```

**Status**: ✅ Works correctly, finds ~9-10 sections

### CSS Styling System

From [styles.css:1398-1605](src/styles.css#L1398-L1605):

**Global CSS Classes:**
- `.viewing-reference-inputs` - Primary Reference mode class
- `.viewing-reference-values` - Reference values display
- `.reference-mode` - General Reference indicator
- `body.reference-mode` - Body-level styling trigger

**Section-Level Classes:**
- `.section-header.reference-mode` - Red header background (#8B0000)
- `.section-content.reference-mode` - Red borders
- `.field.reference-mode` - Field-level reference styling

**Status**: ✅ Comprehensive, working, no changes needed

---

## Implementation Plan

### Phase 1: Fix `updateCalculatedDisplayValues()` Calls

**Problem**: Not all sections implement this method.

**Solution**: Add fallback to `refreshUI()` method.

**Code Changes** - [ReferenceToggle.js:63-97](src/core/ReferenceToggle.js#L63-L97):

```javascript
function switchAllSectionsMode(mode) {
  const sections = getAllDualStateSections();
  let switchedCount = 0;

  sections.forEach((section) => {
    try {
      if (section.modeManager && typeof section.modeManager.switchMode === "function") {
        section.modeManager.switchMode(mode);

        // ✅ NEW: Try updateCalculatedDisplayValues first, fallback to refreshUI
        if (typeof section.modeManager.updateCalculatedDisplayValues === "function") {
          section.modeManager.updateCalculatedDisplayValues();
        } else if (typeof section.modeManager.refreshUI === "function") {
          section.modeManager.refreshUI();
        } else {
          console.warn(`[ReferenceToggle] ${section.id} has no refreshUI or updateCalculatedDisplayValues method`);
        }

        switchedCount++;
      }
    } catch (error) {
      console.error(`[ReferenceToggle] Error switching ${section.id}:`, error);
    }
  });

  // ... rest of CSS application code
}
```

**Files Modified**: `src/core/ReferenceToggle.js`
**Lines Changed**: ~10 lines modified
**Risk**: Low - adds fallback, no breaking changes

---

### Phase 2: Sync Section Toggle Icons with Global Mode

**Problem**: Section header toggles don't update when global toggle is used.

**Solution**: Query and update all section toggle elements after global mode switch.

**Code Changes** - [ReferenceToggle.js:63-97](src/core/ReferenceToggle.js#L63-L97):

```javascript
function switchAllSectionsMode(mode) {
  // ... existing section switching code ...

  // ✅ NEW: Update section header toggle UI elements
  syncSectionToggleIcons(mode);

  // Apply existing CSS classes for global Reference styling
  const isReference = mode === "reference";
  document.body.classList.toggle("viewing-reference-inputs", isReference);
  document.body.classList.toggle("viewing-reference-values", isReference);
  document.body.classList.toggle("reference-mode", isReference);
  document.documentElement.classList.toggle("reference-mode", isReference);

  console.log(
    `🎨 Master Toggle: Switched ${switchedCount}/${sections.length} sections to ${mode.toUpperCase()} mode with global styling`
  );
  return switchedCount;
}

// ✅ NEW: Helper function to sync section toggle icons
function syncSectionToggleIcons(mode) {
  const sections = getAllDualStateSections();

  sections.forEach((section) => {
    // Find section header toggle button/icon
    const sectionContainer = document.querySelector(`#${section.id}`);
    if (!sectionContainer) return;

    const toggleButton = sectionContainer.querySelector('.section-toggle-button') ||
                        sectionContainer.querySelector('[data-toggle="mode"]');

    if (toggleButton) {
      // Update toggle icon/state to match mode
      toggleButton.classList.toggle('reference-mode', mode === 'reference');
      toggleButton.classList.toggle('target-mode', mode === 'target');

      // Update aria labels for accessibility
      const modeLabel = mode === 'reference' ? 'Reference' : 'Target';
      toggleButton.setAttribute('aria-label', `Switch to ${mode === 'reference' ? 'Target' : 'Reference'} mode`);
      toggleButton.setAttribute('title', `Currently showing ${modeLabel} values`);
    }
  });
}
```

**Files Modified**: `src/core/ReferenceToggle.js`
**Lines Added**: ~25 lines (new helper function)
**Risk**: Low - purely visual updates, no state changes

**Note**: This assumes section headers have toggle buttons with identifiable selectors. If not, we'll need to inspect actual section HTML to determine correct selectors.

---

### Phase 3: Add Master Toggle State Indicator

**Problem**: User can't easily tell which mode is currently active.

**Solution**: Update global toggle UI to show current state clearly.

**Code Changes** - [ReferenceToggle.js:209-257](src/core/ReferenceToggle.js#L209-L257):

```javascript
function toggleReferenceDisplay() {
  isShowingReference = !isShowingReference;
  const targetMode = isShowingReference ? "reference" : "target";

  console.log(
    `[ReferenceToggle] Switching ALL sections to ${targetMode.toUpperCase()} display mode`
  );

  const switchedCount = switchAllSectionsMode(targetMode);

  if (switchedCount > 0) {
    // Update all calculated display values
    updateAllCalculatedDisplays();

    // ✅ MODIFIED: Update button text AND visual state
    updateMasterToggleUI(isShowingReference);

    // Apply Reference mode styling
    document.body.classList.toggle("viewing-reference-inputs", isShowingReference);
    document.body.classList.toggle("viewing-reference-values", isShowingReference);
    document.body.classList.toggle("reference-mode", isShowingReference);
    document.documentElement.classList.toggle("reference-mode", isShowingReference);

    console.log(
      `[ReferenceToggle] Successfully toggled to ${targetMode.toUpperCase()} display mode with UI styling`
    );
  } else {
    console.warn("[ReferenceToggle] No sections were switched - reverting toggle");
    isShowingReference = !isShowingReference;
  }
}

// ✅ NEW: Update master toggle UI elements
function updateMasterToggleUI(isReference) {
  // Update dropdown button text
  const showRefBtn = document.getElementById("showReferenceBtn");
  const showTargetBtn = document.getElementById("showTargetBtn");

  if (showRefBtn) {
    showRefBtn.classList.toggle('active', isReference);
  }
  if (showTargetBtn) {
    showTargetBtn.classList.toggle('active', !isReference);
  }

  // Update main Reference dropdown button appearance
  const referenceDropdown = document.querySelector('.btn-danger');
  if (referenceDropdown) {
    referenceDropdown.textContent = isReference ? 'Reference (Active)' : 'Reference';
    referenceDropdown.classList.toggle('active', isReference);
  }

  // Update global toggle switch if it exists (from index.html)
  const toggleLabel = document.querySelector('label[for="globalToggleSwitch"]');
  if (toggleLabel) {
    toggleLabel.textContent = isReference ? 'Show Target' : 'Show Reference';
  }
}
```

**Files Modified**: `src/core/ReferenceToggle.js`
**Lines Added**: ~30 lines (new helper function)
**Risk**: Low - purely visual updates

---

### Phase 4: Add Keyboard Shortcuts (Optional Enhancement)

**Problem**: No quick way to toggle between modes.

**Solution**: Add keyboard shortcut (Ctrl+Shift+R) to toggle Reference mode.

**Code Changes** - [ReferenceToggle.js:128-203](src/core/ReferenceToggle.js#L128-L203):

```javascript
function initialize() {
  // ... existing button event handlers ...

  // ✅ NEW: Keyboard shortcut for quick toggle
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+R or Cmd+Shift+R to toggle Reference mode
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      toggleReferenceDisplay();
      console.log('[ReferenceToggle] Toggled via keyboard shortcut');
    }
  });

  console.log("[ReferenceToggle] Master Reference Toggle initialization complete");
  console.log("[ReferenceToggle] Keyboard shortcut: Ctrl+Shift+R (or Cmd+Shift+R on Mac)");
}
```

**Files Modified**: `src/core/ReferenceToggle.js`
**Lines Added**: ~12 lines
**Risk**: Very low - optional enhancement, easily removable if unwanted

---

## Testing Plan

### Test 1: Basic Display Toggle

**Steps:**
1. Load application (all sections in Target mode by default)
2. Click "Reference" dropdown → Click "Show Reference"
3. Verify:
   - ✅ Red UI styling appears globally
   - ✅ ALL sections show Reference values (not Target)
   - ✅ All section header toggles show "Reference" state
   - ✅ Dropdown button shows "Reference (Active)"
4. Click "Reference" dropdown → Click "Show Target"
5. Verify:
   - ✅ Blue UI styling restored
   - ✅ ALL sections show Target values
   - ✅ All section header toggles show "Target" state
   - ✅ Dropdown button shows "Reference"

**Success Criteria**: All verifications pass, no console errors

---

### Test 2: Section Toggle Sync

**Steps:**
1. Start in Target mode (default)
2. Manually click Section 03 toggle → Switch to Reference
3. Verify:
   - ✅ Section 03 shows Reference values
   - ✅ Section 03 toggle icon shows "Reference" state
   - ✅ Other sections still show Target values
4. Click global "Show Reference"
5. Verify:
   - ✅ ALL sections now show Reference values
   - ✅ Section 03 toggle still shows "Reference" (no duplicate switch)
   - ✅ Other section toggles updated to "Reference"

**Success Criteria**: No sections get "stuck" or switch modes twice

---

### Test 3: Error Handling

**Steps:**
1. Open browser console
2. Temporarily remove `updateCalculatedDisplayValues()` from Section 03 ModeManager:
   ```javascript
   delete window.TEUI.sect03.ModeManager.updateCalculatedDisplayValues;
   ```
3. Click "Show Reference"
4. Verify:
   - ✅ Section 03 still switches to Reference mode (using `refreshUI()` fallback)
   - ✅ Console shows warning: `[ReferenceToggle] sect03 using refreshUI() fallback`
   - ✅ No errors thrown
   - ✅ Other sections switch correctly

**Success Criteria**: Graceful fallback, no crashes

---

### Test 4: Visual Feedback

**Steps:**
1. Start in Target mode
2. Observe dropdown button (should say "Reference")
3. Click "Show Reference"
4. Verify dropdown button says "Reference (Active)"
5. Verify all UI elements show Reference styling (red theme)
6. Click "Show Target"
7. Verify dropdown button reverts to "Reference"
8. Verify all UI elements show Target styling (blue theme)

**Success Criteria**: Clear visual indication of current mode at all times

---

### Test 5: Keyboard Shortcut (If Implemented)

**Steps:**
1. Start in Target mode
2. Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
3. Verify mode switches to Reference
4. Press Ctrl+Shift+R again
5. Verify mode switches back to Target

**Success Criteria**: Keyboard shortcut works identically to clicking dropdown buttons

---

## Implementation Checklist

### Pre-Implementation
- [ ] Review 4012-REFERENCE.md for architectural constraints
- [ ] Review Master-Reference-Roadmap.md for historical context
- [ ] Review DUAL-STATE-CHEATSHEET.md for Pattern A requirements
- [ ] Confirm all Pattern A sections are listed in `getAllDualStateSections()`

### Phase 1: Fix Display Value Updates
- [ ] Modify `switchAllSectionsMode()` to try `updateCalculatedDisplayValues()` first
- [ ] Add fallback to `refreshUI()` if `updateCalculatedDisplayValues()` doesn't exist
- [ ] Add console warning for sections with neither method
- [ ] Test with all sections

### Phase 2: Sync Toggle Icons
- [ ] Inspect actual section HTML to find toggle button selectors
- [ ] Implement `syncSectionToggleIcons()` helper function
- [ ] Add calls to update toggle icons after mode switch
- [ ] Test visual sync across all sections

### Phase 3: Master Toggle UI
- [ ] Implement `updateMasterToggleUI()` helper function
- [ ] Update dropdown button text to show "(Active)" state
- [ ] Update individual menu item styling (if desired)
- [ ] Test visual feedback

### Phase 4: Keyboard Shortcut (Optional)
- [ ] Add keyboard event listener in `initialize()`
- [ ] Test keyboard shortcut functionality
- [ ] Document shortcut in UI or help text

### Testing
- [ ] Execute Test 1: Basic Display Toggle
- [ ] Execute Test 2: Section Toggle Sync
- [ ] Execute Test 3: Error Handling
- [ ] Execute Test 4: Visual Feedback
- [ ] Execute Test 5: Keyboard Shortcut (if implemented)

### Documentation
- [ ] Update comments in ReferenceToggle.js
- [ ] Note completion status in 4012-REFERENCE.md
- [ ] Note completion status in Master-Reference-Roadmap.md
- [ ] Add keyboard shortcut to user documentation (if implemented)

---

## Success Criteria

### Functional Requirements

1. **Global Mode Switching**: "Show Reference" and "Show Target" commands switch ALL sections simultaneously
2. **Visual Synchronization**: Section toggle icons update to match global mode
3. **CSS Coordination**: Red/blue themes apply/remove consistently
4. **Error Resilience**: Missing methods handled gracefully with fallbacks
5. **State Isolation**: Reference operations NEVER affect Target values (already guaranteed by architecture)

### User Experience Requirements

1. **Clear Feedback**: User always knows which mode is active
2. **Consistent Behavior**: All sections behave identically when toggled
3. **No Manual Steps**: User doesn't need to click individual section toggles
4. **Keyboard Access**: Quick toggle available via keyboard (optional)

### Technical Requirements

1. **No Architecture Changes**: Uses existing ModeManager pattern
2. **No Calculation Changes**: Display-only system, no formula modifications
3. **Performance**: Mode switch completes in <100ms
4. **Maintainability**: Clear code comments, follows existing patterns

---

## Risks and Mitigations

### Risk 1: Section Toggle Selectors Not Consistent

**Risk Level**: Medium

**Mitigation**:
- Inspect actual HTML for each section before implementing Phase 2
- Use multiple fallback selectors
- Log warnings for sections where toggles can't be found
- Consider this phase optional if selectors too inconsistent

### Risk 2: `updateCalculatedDisplayValues()` Not Implemented Everywhere

**Risk Level**: Low

**Mitigation**:
- Already planned in Phase 1
- Fallback to `refreshUI()` method
- Console warnings help identify problem sections
- Can be fixed section-by-section after initial implementation

### Risk 3: Keyboard Shortcut Conflicts

**Risk Level**: Low

**Mitigation**:
- Use uncommon combination (Ctrl+Shift+R)
- Check for conflicts with browser shortcuts
- Make this phase completely optional
- Easy to remove if causes issues

### Risk 4: CSS Styling Interactions

**Risk Level**: Very Low

**Mitigation**:
- Use existing CSS classes only (no new CSS)
- Body-level classes already proven to work
- No specificity issues expected

---

## Timeline Estimate

### Estimated Hours
- **Phase 1**: 1-2 hours (fallback logic + testing)
- **Phase 2**: 2-3 hours (HTML inspection + implementation + testing)
- **Phase 3**: 1 hour (UI updates + testing)
- **Phase 4**: 0.5 hours (keyboard shortcut - optional)
- **Testing**: 1-2 hours (comprehensive testing across all sections)
- **Documentation**: 0.5 hours (update docs)

**Total**: 6-9 hours (excluding optional Phase 4)

### Implementation Order
1. **Day 1**: Phases 1 + 3 (core functionality + visual feedback) - 3 hours
2. **Day 2**: Phase 2 (toggle sync) + Testing - 4-5 hours
3. **Day 3**: Phase 4 (optional) + Final testing + Documentation - 1 hour

**Recommended**: Implement Phases 1 and 3 first for immediate user benefit, defer Phase 2 if toggle selectors prove difficult.

---

## Notes

- **Constraint**: This workplan ONLY addresses UI/mode switching for "Show Reference" and "Show Target" commands
- **Out of Scope**: "Mirror Target", "Mirror Target + Reference", and "Reference Independence" are separate features with their own implementation plans (see 4012-REFERENCE.md lines 421-713)
- **Foundation**: All required infrastructure already exists - we're just wiring it together
- **Philosophy**: KWW (Keep What Works) - use existing patterns, don't reinvent

---

## References

### Primary Documentation
- [4012-REFERENCE.md](4012-REFERENCE.md) - Complete Reference system implementation guide
- [Master-Reference-Roadmap.md](Master-Reference-Roadmap.md) - Historical context and paused work status
- [DUAL-STATE-CHEATSHEET.md](DUAL-STATE-CHEATSHEET.md) - Pattern A architecture patterns

### Code Files
- [src/core/ReferenceToggle.js](../src/core/ReferenceToggle.js) - Main toggle logic
- [src/core/ReferenceManager.js](../src/core/ReferenceManager.js) - Reference value management
- [src/styles.css](../src/styles.css) - CSS styling system (lines 1398-1605)
- [index.html](../index.html) - Dropdown UI structure (lines 165-217)

### Key Sections
- Lines 154-183 of 4012-REFERENCE.md: Current state vs desired state
- Lines 1130-1200 of Master-Reference-Roadmap.md: Work paused status and completion criteria
- Lines 30-57 of ReferenceToggle.js: Section discovery implementation
- Lines 63-97 of ReferenceToggle.js: Mode switching logic
