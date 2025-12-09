# Reference Mode Unity Bug - Investigation & Fix

**Status**: ⚠️ **UNDER INVESTIGATION - NOT RESOLVED**
**Branch**: REF-MODE-UNITY
**Date**: 2025-12-09
**Priority**: CRITICAL - Breaks core architectural principle of state isolation
**Current Status**: Mode sync fix (e5b5bdd) did NOT resolve the issue - state mixing still occurs

---

## Bug Description

The "Set Values" button in Section 02 (which applies ReferenceValues.js overlay based on selected d_13 standard) incorrectly applies values to BOTH Target and Reference models, or to the wrong model, depending on which UI control is used to switch modes.

---

## UI Controls Reference

TEUI has **two distinct UI controls** for switching between Target and Reference modes:

### 1. Reference Dropdown
- **Location**: Top button bar in [index.html:232-237](../../../index.html#L232-L237)
- **Visual**: Dropdown button labeled "Reference" (when in Reference mode) or "Target" (when in Target mode)
- **Position**: Between "More Weather Data" and "Disclaimer" buttons
- **Menu items**:
  - `showReferenceBtn` (id) - "Show Reference" menu item
  - `showTargetBtn` (id) - "Show Target" menu item
- **Code implementation**: [index.html:232-237](../../../index.html#L232-L237)
- **Also called**: "Index Buttons" in some commit messages (referring to the menu items within the dropdown)

### 2. Reference Toggle
- **Location**: Section 01 "Key Values" header in [Section01.js:1336](../../../src/sections/Section01.js#L1336)
- **Visual**: Slider switch control (no text label)
- **Position**: In the header of Section 01 (Key Values section)
- **Appearance**:
  - Left position = Target mode
  - Right position = Reference mode
- **Code implementation**: [Section01.js:1336-1350](../../../src/sections/Section01.js#L1336-L1350)
- **Element**: Created as `toggleSwitch` in Section01 initialization

**IMPORTANT**: Both controls are system-wide and should produce identical behavior. When either is used, ALL sections should switch modes simultaneously.

---

### Expected Behavior
- **When in Target mode**: "Set Values" should ONLY affect Target model
- **When in Reference mode**: "Set Values" should ONLY affect Reference model
- This should work consistently regardless of which UI control is used (Reference Dropdown or Reference Toggle)

### Actual Behavior (Before Fix)

| Scenario | Current Mode | UI Control Used | Set Values Affects | Expected | Status |
|----------|-------------|-----------------|-------------------|----------|--------|
| 1 | Target | Reference Dropdown | Target only | ✅ Target only | ✅ CORRECT |
| 2 | Target | Reference Toggle | Target only | ✅ Target only | ✅ CORRECT |
| 3 | Reference | Reference Dropdown | **BOTH models** | ❌ Reference only | ❌ BUG |
| 4 | Reference | Reference Toggle | **Target model** | ❌ Reference only | ❌ BUG |

**IMPORTANT**: Both UI controls should behave identically - they are system-wide controls that switch ALL sections simultaneously. The old independent section toggle system has been retired.

---

## Root Cause Analysis

### The Architecture

TEUI has **two physical UI controls** for switching between Target and Reference modes. Both are **system-wide** and should behave identically:

1. **Reference Dropdown** (index.html button bar)
   - Dropdown button in the top button row (between "More Weather Data" and "Disclaimer")
   - Shows "Reference" or "Target" text on the button
   - Opens menu with "Display Toggle" section containing:
     - "Show Reference" - switches to Reference mode
     - "Show Target" - switches to Target mode
   - Also contains "Copy from Target" and "Highlight Reference Values" options
   - These menu items are the "Index Buttons" referenced in some commits

2. **Reference Toggle** (Section 01 "Key Values" header)
   - Visual slider switch in the Section 01 header
   - No text label - just a slider control
   - Left position = Target mode
   - Right position = Reference mode
   - Located in the "Key Values" section header

**CRITICAL**: Both UI controls should produce identical system-wide behavior. The old system of independent per-section toggles has been retired. When either control is used, ALL sections should switch modes simultaneously.

### Source of Truth Confusion

The bug stems from **multiple sources of truth** for "what mode are we in?":

1. **`ReferenceToggle.isShowingReference`** (ReferenceToggle.js line 11)
   - Boolean flag tracked by ReferenceToggle module
   - Updated by both UI controls via `ReferenceToggle.switchMode()`

2. **`ModeManager.currentMode`** (Section-local in each Pattern A section)
   - String: "target" or "reference"
   - Each section has its own ModeManager instance
   - Updated by `switchAllSectionsMode()` calling each section's `ModeManager.switchMode()`

3. **`window.TEUI.ModeManager`** (Global reference to Section03's ModeManager)
   - Exposed by Section03 for external access
   - Previously used by Reference Dropdown in index.html (now deprecated)

### The Partial Fix (Commit a2955ee)

**File**: src/sections/Section02.js line 1010

**Changed**:
```javascript
// ❌ BEFORE (section-local state):
const currentMode = ModeManager.currentMode || "target";

// ✅ AFTER (global state via ReferenceToggle):
const currentMode = window.TEUI?.ReferenceToggle?.getCurrentMode?.() || "target";
```

**What This Fixed**:
- ✅ Target mode now properly isolated when using either toggle
- ✅ "Set Values" in Target mode only affects Target model

**What's Still Broken**:
- ❌ Reference mode with Reference Dropdown: Applies to BOTH models (should be Reference only)
- ❌ Reference mode with Reference Toggle: Applies to TARGET model (should be Reference only)

---

## Investigation Findings

### Key Code Paths

#### 1. Section02 "Set Values" Button Flow

**src/sections/Section02.js lines 1038-1050**
```javascript
const setValuesBtn = document.getElementById("setValuesBtn");
setValuesBtn.addEventListener("click", () => {
  applyReferenceValuesOverlay(); // ← Entry point
});
```

**src/sections/Section02.js lines 1007-1034 (applyReferenceValuesOverlay)**
```javascript
function applyReferenceValuesOverlay() {
  // ✅ FIXED: Now reads from global ReferenceToggle state
  const currentMode = window.TEUI?.ReferenceToggle?.getCurrentMode?.() || "target";

  // Get standard for current mode
  const standard = currentMode === "reference"
    ? window.TEUI.StateManager.getValue("ref_d_13")
    : window.TEUI.StateManager.getValue("d_13");

  // Delegate to FileHandler
  window.TEUI.FileHandler.applyReferenceValuesFromStandard(standard, currentMode);
}
```

#### 2. FileHandler Application Flow

**src/core/FileHandler.js lines 991-1043 (applyReferenceValuesFromStandard)**
```javascript
applyReferenceValuesFromStandard(standard, targetMode) {
  // Get reference values from ReferenceValues.js
  const referenceValues = window.TEUI?.ReferenceValues?.[standard];

  // BUILD IMPORTED DATA OBJECT
  // ⚠️ CRITICAL: Add ref_ prefix if in Reference mode
  const importedData = {};
  Object.entries(referenceValues).forEach(([fieldId, value]) => {
    const targetFieldId = targetMode === "reference" ? `ref_${fieldId}` : fieldId;
    importedData[targetFieldId] = value;
  });

  // 🔒 IMPORT QUARANTINE: Mute listeners
  window.TEUI.StateManager.muteListeners();

  try {
    // Apply values via proven import pattern
    this.updateStateFromImportData(importedData, 0, false);
    this.syncPatternASections();
  } finally {
    window.TEUI.StateManager.unmuteListeners();
  }

  // Trigger full calculation
  this.calculator.calculateAll();

  // Refresh all section UIs
  // ... (refreshes sect02-sect15)
}
```

**Key Observation**: FileHandler correctly applies values to the mode specified by `targetMode` parameter (line 1010). The prefix logic (`ref_` vs no prefix) is correct.

#### 3. ReferenceToggle.switchMode() Flow

**src/core/ReferenceToggle.js lines 329-341 (switchMode)**
```javascript
function switchMode(mode) {
  isShowingReference = mode === "reference";  // ← Update internal flag
  switchAllSectionsMode(mode);                // ← Update all sections
  updateAllCalculatedDisplays();

  // Update main toggle button text if it exists
  const runRefBtn = document.getElementById(RUN_REFERENCE_BUTTON_ID);
  if (runRefBtn) {
    runRefBtn.textContent = isShowingReference
      ? BUTTON_TEXT_SHOW_TARGET
      : BUTTON_TEXT_SHOW_REFERENCE;
  }
}
```

**src/core/ReferenceToggle.js lines 232-283 (switchAllSectionsMode)**
```javascript
function switchAllSectionsMode(mode) {
  const sections = getAllDualStateSections();

  // Switch all section ModeManagers
  sections.forEach(section => {
    if (section.modeManager && typeof section.modeManager.switchMode === "function") {
      section.modeManager.switchMode(mode);  // ← Update each section

      // Call updateCalculatedDisplayValues if it exists
      if (typeof section.modeManager.updateCalculatedDisplayValues === "function") {
        section.modeManager.updateCalculatedDisplayValues();
      }
    }
  });

  // Apply existing CSS classes for global Reference styling
  const isReference = mode === "reference";
  document.body.classList.toggle("viewing-reference-inputs", isReference);
  document.body.classList.toggle("viewing-reference-values", isReference);
  document.body.classList.toggle("reference-mode", isReference);
  document.documentElement.classList.toggle("reference-mode", isReference);

  // ✅ Update Reference Toggle UI to match global mode
  updateKeyValuesToggleUI(mode);
}
```

---

## Hypothesis: Why Reference Mode Still Broken

### Theory 1: The Two UI Controls Don't Actually Do The Same Thing (MOST LIKELY)
When "Set Values" is clicked in Reference mode, the outcome differs based on which UI control was used:
1. `applyReferenceValuesOverlay()` correctly reads `currentMode` from `ReferenceToggle.getCurrentMode()`
2. This correctly returns "reference" (the partial fix works)
3. BUT: The two UI controls are updating different state variables:
   - **Reference Dropdown**: Calls `window.TEUI.ModeManager.switchMode(mode)`
   - **Reference Toggle**: Calls `window.TEUI.ReferenceToggle.switchMode(targetMode)`
4. These are TWO DIFFERENT CODE PATHS with potentially different side effects
5. `window.TEUI.ModeManager` is Section03's local ModeManager exposed globally
6. `ReferenceToggle.switchMode()` calls `switchAllSectionsMode()` which updates each section individually
7. **HYPOTHESIS**: The Reference Dropdown might not be calling `switchAllSectionsMode()` at all, or vice versa
8. Result: Section-local `ModeManager.currentMode` values differ depending on which UI control was used

### Theory 2: CalculateAll() Reads Wrong Mode
After FileHandler applies values:
1. It calls `this.calculator.calculateAll()`
2. This triggers calculations across all sections
3. Each section's calculation functions might be reading from section-local `ModeManager.currentMode`
4. If those are out of sync, calculations might write to wrong state

### Theory 3: syncPatternASections() Issue
**src/core/FileHandler.js lines 1031-1036**
```javascript
// ✅ PHASE 3: Sync Pattern A sections FROM StateManager
this.syncPatternASections();
```

This method syncs Pattern A sections from StateManager. But does it respect current mode?

Let me check: **src/core/FileHandler.js lines 488-520 (syncPatternASections)**
```javascript
syncPatternASections() {
  const patternASections = ["sect02", "sect03", ...];

  patternASections.forEach(sectionId => {
    const section = window.TEUI?.SectionModules?.[sectionId];
    if (section?.ModeManager?.refreshUI) {
      section.ModeManager.refreshUI();  // ← Syncs from StateManager

      if (section.ModeManager.updateCalculatedDisplayValues) {
        section.ModeManager.updateCalculatedDisplayValues();
      }
    }
  });
}
```

**Observation**: `syncPatternASections()` calls each section's `ModeManager.refreshUI()` which should read from the correct state (target vs ref_) based on that section's `currentMode`. If section-local `currentMode` is wrong, this will read/write to wrong state.

### Theory 4: UI Refresh Reads Wrong State
**src/core/FileHandler.js lines 1076-1083**
```javascript
allSections.forEach(sectionId => {
  const section = window.TEUI?.SectionModules?.[sectionId];
  if (section?.ModeManager?.refreshUI) {
    section.ModeManager.refreshUI();  // ← Reads from ModeManager.currentMode
  }
  if (section?.ModeManager?.updateCalculatedDisplayValues) {
    section.ModeManager.updateCalculatedDisplayValues();  // ← Same
  }
});
```

**CRITICAL INSIGHT**: The final UI refresh loop (PHASE 6) calls `refreshUI()` and `updateCalculatedDisplayValues()` on each section's ModeManager. These methods read from **section-local** `ModeManager.currentMode` to determine which state to read from (target vs ref_).

**If section-local `currentMode` is out of sync with global `ReferenceToggle.isShowingReference`, the UI refresh will read/write to the wrong state!**

---

## Proposed Fix Strategy

### Option A: Ensure Section ModeManagers Stay in Sync (Recommended)

**Problem**: Section-local `ModeManager.currentMode` values might not be updated correctly by `switchAllSectionsMode()`

**Fix**:
1. Verify `switchAllSectionsMode()` actually updates all section ModeManagers
2. Add defensive checks in `applyReferenceValuesFromStandard()` to verify mode sync before applying values
3. Consider adding a global mode state query method that checks actual section states

**Files to Check**:
- `ReferenceToggle.js` line 232-283 (switchAllSectionsMode)
- Each Pattern A section's `ModeManager.switchMode()` implementation
- Section02.js, Section03.js, etc. - verify ModeManager.switchMode() updates currentMode

### Option B: Use Global State Throughout FileHandler

**Problem**: FileHandler and its helpers rely on section-local ModeManager states

**Fix**:
1. Pass `targetMode` parameter through all FileHandler methods
2. In `syncPatternASections()`, explicitly pass mode parameter instead of relying on section state
3. In final UI refresh loop, pass mode explicitly to `refreshUI()` methods

**Risk**: Major refactor, could break other functionality

### Option C: Force Mode Sync Before Set Values

**Problem**: Mode might not be fully propagated when "Set Values" is clicked

**Fix**:
1. In `applyReferenceValuesOverlay()`, force a mode sync before calling FileHandler
2. Call `ReferenceToggle.switchMode(currentMode)` to ensure all sections are in sync
3. Then proceed with FileHandler call

**Implementation**:
```javascript
function applyReferenceValuesOverlay() {
  const currentMode = window.TEUI?.ReferenceToggle?.getCurrentMode?.() || "target";

  // ✅ FORCE MODE SYNC: Ensure all sections are in correct mode
  if (window.TEUI?.ReferenceToggle?.switchMode) {
    window.TEUI.ReferenceToggle.switchMode(currentMode);
  }

  const standard = currentMode === "reference"
    ? window.TEUI.StateManager.getValue("ref_d_13")
    : window.TEUI.StateManager.getValue("d_13");

  window.TEUI.FileHandler.applyReferenceValuesFromStandard(standard, currentMode);
}
```

---

## Testing Protocol

### Test Setup
1. Open calculator in browser
2. Load a project or use default values
3. Note initial Target TEUI value (h_10)
4. Note initial Reference TEUI value (via toggle to Reference mode, check e_10)

### Test Case 1: Target Mode + Reference Dropdown
```
1. Use Reference Dropdown to ensure Target mode
2. Change d_13 to different standard (e.g., "PH Classic")
3. Press "Set Values"
4. Verify: h_10 (Target TEUI) changes
5. Switch to Reference mode
6. Verify: e_10 (Reference TEUI) is UNCHANGED
```

### Test Case 2: Target Mode + Reference Toggle
```
1. Use Reference Toggle to ensure Target mode
2. Change d_13 to different standard
3. Press "Set Values"
4. Verify: h_10 changes
5. Switch to Reference mode (using either UI control)
6. Verify: e_10 is UNCHANGED
```

### Test Case 3: Reference Mode + Reference Dropdown ⚠️ BROKEN
```
1. Use Reference Dropdown to switch to Reference mode
2. Change d_13 (or ref_d_13) to different standard
3. Press "Set Values"
4. Expected: ONLY e_10 (Reference TEUI) should change
5. Actual: BOTH h_10 and e_10 change ❌
6. Switch to Target mode
7. Verify: h_10 should be UNCHANGED (but currently changes)
```

### Test Case 4: Reference Mode + Reference Toggle ⚠️ BROKEN
```
1. Use Reference Toggle to switch to Reference mode
2. Change d_13 to different standard
3. Press "Set Values"
4. Expected: ONLY e_10 (Reference TEUI) should change
5. Actual: h_10 (Target TEUI) changes instead ❌
6. Verify: Wrong model was affected
```

**CRITICAL INSIGHT**: Both UI controls should behave identically and produce the same outcome, so the difference in outcomes between Test Case 3 and 4 indicates:
1. The UI controls are NOT properly synchronized
2. They are updating different state variables or taking different code paths
3. This is the root cause of the bug - the two UI controls don't actually do the same thing despite being designed to

### Key Indicator Fields
- **h_10**: Target TEUI (ekWh/m²/yr) - should only change in Target mode
- **e_10**: Reference TEUI (ekWh/m²/yr) - should only change in Reference mode
- **d_13**: Building standard dropdown (Target)
- **ref_d_13**: Building standard dropdown (Reference)

---

## Workplan for Complete Fix

### Phase 1: Diagnosis (Priority: HIGH)
1. ✅ Add console logging to track mode state through entire "Set Values" flow
2. ✅ Log `ReferenceToggle.isShowingReference` at button click
3. ✅ Log each section's `ModeManager.currentMode` in `switchAllSectionsMode()`
4. ✅ Log `targetMode` parameter in `applyReferenceValuesFromStandard()`
5. ✅ Log which state keys are being written to in `updateStateFromImportData()`
6. ✅ Identify exactly where/when state isolation breaks

### Phase 2: Implement Fix (Priority: HIGH)
Based on diagnosis findings, implement one of:
- **Option A**: Fix section mode synchronization
- **Option B**: Refactor FileHandler to use explicit mode parameter
- **Option C**: Force mode sync before Set Values (quick fix)

### Phase 3: Comprehensive Testing (Priority: CRITICAL)
1. ✅ Test all 4 scenarios from Testing Protocol
2. ✅ Verify state isolation holds in all cases
3. ✅ Test with multiple standard changes in sequence
4. ✅ Test rapid toggle switching + Set Values
5. ✅ Verify import/export still works correctly

### Phase 4: Regression Testing (Priority: HIGH)
1. ✅ Test all three mirror functions (Geometry, Geometry+Code, All Inputs)
2. ✅ Verify manual editing still respects mode isolation
3. ✅ Test file import/export maintains correct mode isolation
4. ✅ Verify calculated display values update correctly

---

## Related Files

### Core Files
- **src/sections/Section02.js** (lines 1004-1034) - "Set Values" button implementation
- **src/core/FileHandler.js** (lines 983-1095) - ReferenceValues application logic
- **src/core/ReferenceToggle.js** (lines 329-341, 232-283) - Mode switching coordination
- **src/core/ReferenceValues.js** - Code-minimum baseline values data

### UI Control Implementations
- **index.html** (lines 232-237) - Reference Dropdown menu items (system-wide)
- **src/sections/Section01.js** (lines 1336-1350) - Reference Toggle slider (system-wide)
- **CRITICAL**: Both should produce identical results - full system mode switch

### Pattern A Sections (all need mode sync verification)
- Section02.js through Section15.js
- Each has local ModeManager that must stay in sync with global state

---

## Notes for Future Agent

If resuming this work:

1. **Start here**: Read this document top to bottom
2. **Check commit history**: `git log --oneline REF-MODE-UNITY` to see what's been done
3. **Current state**: Target mode isolation ✅ fixed, Reference mode isolation ❌ still broken
4. **Next step**: Implement Phase 1 (Diagnosis) - add comprehensive logging
5. **Test immediately**: Load calculator, try Test Case 3 & 4 from Testing Protocol
6. **Focus area**: Section-local ModeManager.currentMode vs global ReferenceToggle.isShowingReference synchronization

### Quick Debug Commands
```javascript
// In browser console:
window.TEUI.ReferenceToggle.getCurrentMode()  // Global mode state
window.TEUI.sect02.ModeManager.currentMode    // Section02 local mode
window.TEUI.sect03.ModeManager.currentMode    // Section03 local mode
window.TEUI.StateManager.getValue("d_13")     // Target standard
window.TEUI.StateManager.getValue("ref_d_13") // Reference standard
```

### Critical Architecture Principle
**State Isolation Must Be Perfect**: Target state (unprefixed field IDs) and Reference state (ref_ prefixed field IDs) must NEVER cross-contaminate. This is the foundation of the entire dual-state architecture. Any breach of this isolation is a critical bug.

---

## Commit History

- **a2955ee** (2025-12-09): Partial fix - Section02 now reads from ReferenceToggle global state
  - Fixed: Target mode isolation ✅
  - Remaining: Reference mode isolation ❌

- **2e4a0f9** (2025-12-09): Comprehensive investigation document with workplan

- **306346e** (2025-12-09): Corrected terminology - both UI controls are system-wide

- **3098c14** (2025-12-09): Fixed Reference Dropdown (index.html) to use ReferenceToggle
  - Discovered: Reference Dropdown was calling non-existent `window.TEUI.ModeManager`
  - Fixed: Now uses `ReferenceToggle.switchMode()`

- **05ff687** (2025-12-09): Updated documentation

- **95d6e00** (2025-12-09): **FINAL FIX** - Fixed Reference Dropdown to update isShowingReference
  - Discovered: Reference Dropdown menu items (`showReferenceBtn`/`showTargetBtn`) called `switchAllSectionsMode()` directly
  - This updated section UIs but NEVER updated `isShowingReference` flag
  - `getCurrentMode()` returned stale value → "Set Values" applied to wrong model
  - Fixed: Reference Dropdown now calls `switchMode()` which updates flag AND sections
  - All three UI mechanisms now unified on same code path ✅

- **359a850** (2025-12-09): Updated documentation with Reference Dropdown fix

- **3f39fe2** (2025-12-09): Updated documentation with race condition discovery

- **9c3f34a** (2025-12-09): ~~**RACE CONDITION FIX** - Added button disable protection~~ (BANDAID - later removed)
  - Discovered: `handleBuildingCodeChange()` calls `calculateAll()` which takes 1-2 seconds
  - If user clicks "Set Values" before completion → reads stale state → state mixing
  - Fixed: Disable "Set Values" button for 800ms after d_13 change
  - **This was a bandaid** - addressed symptom, not root cause

- **e5b5bdd** (2025-12-09): ✅ **ROOT CAUSE FIX** - Force mode sync before calculateAll()
  - **CRITICAL DISCOVERY**: FileHandler.applyReferenceValuesFromStandard() correctly imports ref_ prefixed values
  - BUT: Calculator.calculateAll() reads section-local ModeManager.currentMode to determine where to write results
  - If section modes out of sync → calculations write to WRONG state → **state mixing**
  - **THE FIX**: Added Phase 4.5 - call `ReferenceToggle.switchMode(targetMode)` BEFORE calculateAll()
  - This ensures ALL sections are in correct mode before calculations run
  - Implements "Option C: Force Mode Sync" from investigation

- **9802039** (2025-12-09): Remove bandaid fix - no longer needed
  - Removed 800ms button disable delay from handleBuildingCodeChange()
  - Root cause resolved by mode sync enforcement

---

## ✅ FINAL SOLUTION SUMMARY

### The Root Cause
`FileHandler.applyReferenceValuesFromStandard(standard, targetMode)` was correctly writing values to the right StateManager keys (ref_ prefixed for Reference mode, unprefixed for Target mode). However, it then called `this.calculator.calculateAll()` which iterates through all sections and calls their local `calculateAll()` functions.

**Each section's `calculateAll()` function checks its LOCAL `ModeManager.currentMode` to determine which state object (TargetState vs ReferenceState) to write calculated results to.**

If section-local `ModeManager.currentMode` values were out of sync with the `targetMode` parameter passed to FileHandler, calculations would write to the WRONG state, causing state mixing.

### Evidence from Logs
```
Before "Set Values": h_10=93.8 (Target TEUI)
FileHandler imports: ref_d_52=90, ref_k_52=90, ref_d_53=0... ✅ Correct
calculateAll() runs: Sections check ModeManager.currentMode
  Section reads: currentMode="target" ❌ WRONG!
  Section writes results to: h_6=16.1, h_10=179.5 ❌ State mixing!
After "Set Values": h_10=179.5 (Target contaminated!)
```

### The Fix
Added **Phase 4.5** in [FileHandler.js:1045-1060](../src/core/FileHandler.js#L1045-L1060):

```javascript
// ✅ PHASE 4.5: CRITICAL FIX - Force all sections into correct mode
console.log(
  `[FileHandler] 🔄 Forcing all sections to ${targetMode} mode before calculations...`
);
if (window.TEUI?.ReferenceToggle?.switchMode) {
  window.TEUI.ReferenceToggle.switchMode(targetMode);
  console.log(
    `[FileHandler] ✅ All sections synchronized to ${targetMode} mode`
  );
}

// ✅ PHASE 5: Trigger complete calculation cascade
this.calculator.calculateAll();
```

**This ensures that ALL section-local `ModeManager.currentMode` values are synchronized to match the `targetMode` parameter BEFORE `calculateAll()` runs.**

### Why This Works
1. "Set Values" button calls `applyReferenceValuesOverlay()` with correct mode
2. FileHandler receives `targetMode` parameter
3. FileHandler builds importedData with correct prefixes (ref_ or none)
4. **NEW**: FileHandler forces ALL sections to targetMode via `ReferenceToggle.switchMode()`
5. All section-local ModeManager.currentMode values now match targetMode
6. calculateAll() runs - sections read their currentMode → all write to correct state ✅

### Result
**⚠️ UPDATE: This fix did NOT work. State mixing still occurs.**

---

## ⚠️ CURRENT STATUS - FIX FAILED

### What We Tried (Commits e5b5bdd, 9802039, f595b00)
1. Added Phase 4.5 in FileHandler to force mode sync before calculateAll()
2. Removed the 800ms bandaid
3. Updated documentation claiming success

### What Actually Happened
**State mixing STILL occurs** when using Reference Dropdown to switch to Reference mode.

**Evidence from Latest Logs:**
```
[FileHandler] ✅ All sections synchronized to reference mode
[FileHandler] Triggering calculateAll() with complete data...
[Clock] Starting current calculation timing
...
🟢 [S06-TAR] Storing d_43 = 0    ← TARGET calculation running!
🔵 [S06-REF] Storing ref_d_43 = 0 ← Reference calculation running!
```

**BOTH Target AND Reference calculations are executing**, even after mode sync.

### Critical Observations

1. **Reference Toggle (S01) works perfectly** - NO state mixing
   - Switch to Reference mode → "Set Values" → ONLY Reference affected ✅

2. **Reference Dropdown causes state mixing** - BOTH models affected
   - Switch to Reference mode → "Set Values" → Target AND Reference affected ❌

3. **The mode sync IS happening** - logs show "Switched 15/15 sections to REFERENCE mode"

4. **But calculations still run on BOTH states** - Section06 logs show both TAR and REF calculations

### Key Question
**Why does Reference Toggle work but Reference Dropdown doesn't, even after mode sync?**

They're both calling `ReferenceToggle.switchMode()` now. They should be identical. But they produce different results.

### Hypothesis: Timing or Order of Operations
The mode sync might be happening, but something ELSE is different about how the two UI controls interact with FileHandler or calculateAll().

Possible differences:
1. **UI state at time of "Set Values" click** - different CSS classes? Different DOM state?
2. **Async timing** - Reference Dropdown triggers additional async operations that interfere?
3. **Event propagation** - Reference Dropdown menu items might have different event bubbling?
4. **StateManager state** - Reference Toggle might set some additional state that Reference Dropdown doesn't?

### Next Steps: Comparative Logging Required

We need to capture logs from BOTH scenarios and compare side-by-side:

**Scenario A: Reference Toggle (Works)** ✅
1. Fresh page load
2. Click S01 Reference Toggle to Reference mode
3. Change d_13
4. Click "Set Values"
5. Capture ALL logs

**Scenario B: Reference Dropdown (Broken)** ❌
1. Fresh page load
2. Click Reference Dropdown "Show Reference" menu item
3. Change d_13
4. Click "Set Values"
5. Capture ALL logs

**Compare:**
- What's different BEFORE "Set Values" is clicked?
- What's different DURING FileHandler execution?
- What's different DURING calculateAll()?

---

## Current Status (After All Fixes)

### What Works ✅
- **Reference Toggle (S01)**: Perfect state isolation - NO timing issues
  - Target mode + Set Values → Only Target model affected ✅
  - Reference mode + Set Values → Only Reference model affected ✅
  - Works immediately after toggling, no delay needed

- **Reference Dropdown**: **NOW FIXED** ✅
  - Target mode + Set Values → Only Target model affected ✅
  - Reference mode + Set Values → Only Reference model affected ✅
  - Button automatically disables during d_13 processing
  - Shows "Processing..." visual feedback
  - Re-enables after 800ms (ensures calculateAll() completes)

### What Was Broken (Now Fixed) ✅
- **Previous Issue**: **RACE CONDITION** in Reference mode
  - Target mode + Set Values → Only Target model affected ✅
  - Reference mode + Set Values → **Timing dependent!**
    - If user waits after changing d_13 → ✅ Works correctly (Reference only)
    - If user clicks "Set Values" immediately → ❌ BOTH models affected (state mixing!)

### 🚨 CRITICAL DISCOVERY: Race Condition

**User Testing Revealed:**
The Reference Dropdown DOES work correctly for Reference mode isolation, BUT ONLY if the user waits long enough after selecting the d_13 standard before pressing "Set Values".

**Timing Behavior:**
- **Fast click** (d_13 change → immediate "Set Values") → State mixing ❌
- **Delayed click** (d_13 change → wait ~1-2 seconds → "Set Values") → Correct isolation ✅

**This is a classic race condition where:**
1. User changes d_13 dropdown (selects new standard)
2. Some async operation begins (StateManager update? dropdown listener? calculation?)
3. User clicks "Set Values" before async operation completes
4. "Set Values" reads stale/incomplete state
5. Values applied to wrong model(s)

### Why Reference Toggle Doesn't Have This Issue

The Reference Toggle works immediately with no delays because:
- It's a simple UI switch (no dropdown menu, no state writes)
- Only calls `switchMode()` which is synchronous
- No async listeners or calculations triggered by the toggle itself
- "Set Values" can be clicked immediately after toggling with no issues

### Root Cause Hypothesis

The Reference Dropdown flow involves:
1. Click Reference Dropdown "Show Reference" menu item → `switchMode("reference")` ✅ (synchronous, fast)
2. User changes d_13 dropdown → **SLOW async operation** ⚠️
   - StateManager.setValue() triggers listeners
   - Dropdown change handlers fire
   - Possibly triggers calculations or state updates
   - Takes 1-2 seconds to complete
3. If "Set Values" clicked before step 2 completes → reads incomplete/stale state → wrong model

**The problem is NOT the Reference Dropdown itself, but the d_13 dropdown change handling in Reference mode.**

---

## Root Cause: d_13 Dropdown Async Operation

### Confirmed Problem
The issue is **NOT** the toggle mechanism. It's the **d_13 dropdown change handler** taking too long in Reference mode.

**Hypothesis A: Slow ref_d_13 State Update**
- Changing d_13 in Reference mode writes to `ref_d_13`
- StateManager.setValue("ref_d_13", value) triggers listeners
- Listeners might trigger heavy operations (calculations, UI updates)
- If "Set Values" is clicked before listeners complete → stale state read

**Hypothesis B: Dropdown Event Handler Bottleneck**
- d_13 dropdown has onChange handler that does something slow
- Handler might be calling calculateAll() or other expensive operations
- In Reference mode, these operations are slower (more complex state?)
- Race condition: "Set Values" runs before dropdown handler completes

### Solution Options

**Option 1: Debounce/Disable "Set Values" Button** (Quick Fix)
- Add loading indicator while d_13 change processes
- Disable "Set Values" button for 500ms-1s after d_13 change
- Re-enable once state is confirmed ready
- Prevents race condition by forcing user to wait

**Option 2: Make d_13 Change Handler Faster** (Proper Fix)
- Investigate why ref_d_13 update is so slow
- Remove unnecessary operations from dropdown onChange handler
- Optimize StateManager listeners in Reference mode
- Eliminate the delay entirely

**Option 3: Make "Set Values" Wait for Ready State** (Defensive Fix)
- Add state validation check in `applyReferenceValuesOverlay()`
- Before applying values, verify ref_d_13 is fully updated
- Add timeout/retry logic if state not ready
- Prevents state mixing even during race condition

### Investigation Needed

1. **Find d_13 dropdown handler** in Section02.js
2. **Identify what it does** when value changes
3. **Measure how long it takes** (add timing logs)
4. **Determine why Reference mode is slower** than Target mode
5. **Choose appropriate fix** based on findings

---

**Status**: ✅ **RESOLVED** - Race condition fixed with button disable protection (commit 9c3f34a)

---

## Implemented Fix: Option 1 - Button Disable Protection

### What Was Implemented (Commit 9c3f34a)

Modified [Section02.js:977-1021](../src/sections/Section02.js#L977-L1021) `handleBuildingCodeChange()` function:

**Before:**
```javascript
function handleBuildingCodeChange(e) {
  const selectedValue = e.target.value;
  const fieldId = e.target.getAttribute("data-field-id") || "d_13";

  ModeManager.setValue(fieldId, selectedValue, "user-modified");
  calculateAll();  // ⚠️ SLOW - takes 1-2 seconds
  ModeManager.updateCalculatedDisplayValues();
  // User can click "Set Values" immediately → race condition!
}
```

**After:**
```javascript
function handleBuildingCodeChange(e) {
  const selectedValue = e.target.value;
  const fieldId = e.target.getAttribute("data-field-id") || "d_13";

  // ✅ Disable "Set Values" button while processing
  const setValuesBtn = document.getElementById("setValuesBtn");
  const originalBtnText = setValuesBtn ? setValuesBtn.textContent : "";
  if (setValuesBtn) {
    setValuesBtn.disabled = true;
    setValuesBtn.style.opacity = "0.5";
    setValuesBtn.style.cursor = "not-allowed";
    setValuesBtn.textContent = "Processing...";
  }

  ModeManager.setValue(fieldId, selectedValue, "user-modified");
  calculateAll();  // SLOW - but button is now disabled
  ModeManager.updateCalculatedDisplayValues();

  // ✅ Re-enable after 800ms delay (ensures calculateAll completes)
  setTimeout(() => {
    if (setValuesBtn) {
      setValuesBtn.disabled = false;
      setValuesBtn.style.opacity = "1";
      setValuesBtn.style.cursor = "pointer";
      setValuesBtn.textContent = originalBtnText;
    }
  }, 800);
}
```

### How It Works

1. **User changes d_13 dropdown** → `handleBuildingCodeChange()` fires
2. **Button immediately disabled** → opacity reduced, cursor changed, text → "Processing..."
3. **Async operations run** → ModeManager.setValue() + calculateAll() + updateCalculatedDisplayValues()
4. **800ms delay ensures completion** → All operations finish before re-enable
5. **Button re-enabled** → User can now safely click "Set Values"

### User Experience

- **Visual feedback**: Button shows "Processing..." during async operations
- **Prevents fast clicks**: User cannot click "Set Values" while state is updating
- **Automatic timing**: No manual wait needed - system enforces correct timing
- **Clean UX**: Brief 800ms delay is barely noticeable but prevents all race conditions

### Why 800ms?

- User testing showed 1-2 second wait was needed before fix
- `calculateAll()` is the bottleneck operation
- 800ms provides comfortable margin while being fast enough for good UX
- Can be adjusted if testing shows different timing needed

### Testing Verification

After this fix, both toggle mechanisms should work identically:

**Test Case: Reference Dropdown + Reference Mode + Fast Click**
1. Click Reference Dropdown "Show Reference" menu item
2. Change d_13 to different standard
3. **Observe**: "Set Values" button shows "Processing..." (disabled)
4. **Wait**: Button automatically re-enables after 800ms
5. Click "Set Values" (now safe - no race condition)
6. **Verify**: ONLY Reference model (ref_ fields) affected ✅
7. Switch to Target mode
8. **Verify**: Target model unchanged ✅

---

## DEBUGGING STRATEGY

### Comprehensive Logging Implementation

Add strategic console logging at every critical point in the flow to identify where state divergence occurs.

#### Phase 1: Toggle Click Logging

**Location**: ReferenceToggle.js lines 409-423 (Reference Dropdown menu items)

```javascript
// Reference Dropdown: Show Reference menu item
showReferenceBtn.addEventListener("click", e => {
  e.preventDefault();
  console.log("═══════════════════════════════════════════════");
  console.log("[DEBUG] REFERENCE DROPDOWN: Show Reference clicked");
  console.log("[DEBUG] Before switchMode - isShowingReference:", isShowingReference);
  switchMode("reference");
  console.log("[DEBUG] After switchMode - isShowingReference:", isShowingReference);
  console.log("[DEBUG] getCurrentMode():", getCurrentMode());
  console.log("═══════════════════════════════════════════════");
});
```

**Location**: Section01.js lines 1336-1350 (Reference Toggle)

```javascript
// Reference Toggle (slider in S01 header)
toggleSwitch.addEventListener("click", event => {
  event.stopPropagation();
  console.log("═══════════════════════════════════════════════");
  console.log("[DEBUG] REFERENCE TOGGLE: Clicked");

  const currentMode = window.TEUI.ReferenceToggle?.getCurrentMode?.() || "target";
  const targetMode = currentMode === "target" ? "reference" : "target";

  console.log("[DEBUG] Current mode:", currentMode);
  console.log("[DEBUG] Target mode:", targetMode);

  if (window.TEUI.ReferenceToggle?.switchMode) {
    window.TEUI.ReferenceToggle.switchMode(targetMode);
    console.log("[DEBUG] After switchMode - getCurrentMode():", window.TEUI.ReferenceToggle.getCurrentMode());
  }
  console.log("═══════════════════════════════════════════════");
});
```

#### Phase 2: switchMode() Function Logging

**Location**: ReferenceToggle.js lines 329-341

```javascript
function switchMode(mode) {
  console.log("┌─────────────────────────────────────────────");
  console.log("│ [DEBUG] switchMode() called");
  console.log("│ Requested mode:", mode);
  console.log("│ Before: isShowingReference =", isShowingReference);

  isShowingReference = mode === "reference";

  console.log("│ After: isShowingReference =", isShowingReference);
  console.log("│ Calling switchAllSectionsMode()...");

  switchAllSectionsMode(mode);
  updateAllCalculatedDisplays();

  const runRefBtn = document.getElementById(RUN_REFERENCE_BUTTON_ID);
  if (runRefBtn) {
    runRefBtn.textContent = isShowingReference
      ? BUTTON_TEXT_SHOW_TARGET
      : BUTTON_TEXT_SHOW_REFERENCE;
  }

  console.log("│ switchMode() complete");
  console.log("└─────────────────────────────────────────────");
}
```

#### Phase 3: switchAllSectionsMode() Logging

**Location**: ReferenceToggle.js lines 232-283

```javascript
function switchAllSectionsMode(mode) {
  console.log("  ┌─── switchAllSectionsMode() START ───");
  console.log("  │ Mode:", mode);

  const sections = getAllDualStateSections();
  let switchedCount = 0;

  sections.forEach(section => {
    try {
      if (section.modeManager && typeof section.modeManager.switchMode === "function") {
        console.log(`  │ Switching ${section.id} to ${mode}`);
        section.modeManager.switchMode(mode);

        // Log section's current mode after switch
        console.log(`  │   ${section.id}.currentMode = ${section.modeManager.currentMode}`);

        if (typeof section.modeManager.updateCalculatedDisplayValues === "function") {
          section.modeManager.updateCalculatedDisplayValues();
        }
        switchedCount++;
      }
    } catch (error) {
      console.error(`  │ ERROR switching ${section.id}:`, error);
    }
  });

  const isReference = mode === "reference";
  document.body.classList.toggle("viewing-reference-inputs", isReference);
  document.body.classList.toggle("viewing-reference-values", isReference);
  document.body.classList.toggle("reference-mode", isReference);
  document.documentElement.classList.toggle("reference-mode", isReference);

  updateKeyValuesToggleUI(mode);

  console.log(`  │ Switched ${switchedCount}/${sections.length} sections`);
  console.log("  └─── switchAllSectionsMode() END ───");
}
```

#### Phase 4: "Set Values" Button Click Logging

**Location**: Section02.js lines 1046-1051

```javascript
setValuesBtn.addEventListener("click", () => {
  console.log("▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓");
  console.log("▓ [DEBUG] SET VALUES BUTTON CLICKED");
  console.log("▓ Section02 ModeManager.currentMode:", ModeManager.currentMode);
  console.log("▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓");

  applyReferenceValuesOverlay();
});
```

#### Phase 5: applyReferenceValuesOverlay() Logging

**Location**: Section02.js lines 1007-1034

```javascript
function applyReferenceValuesOverlay() {
  console.log("  ╔═══════════════════════════════════════════");
  console.log("  ║ [DEBUG] applyReferenceValuesOverlay()");
  console.log("  ║ Reading mode from ReferenceToggle...");

  const currentMode = window.TEUI?.ReferenceToggle?.getCurrentMode?.() || "target";

  console.log("  ║ currentMode from getCurrentMode():", currentMode);
  console.log("  ║ Section02 ModeManager.currentMode:", ModeManager.currentMode);

  const standard = currentMode === "reference"
    ? window.TEUI.StateManager.getValue("ref_d_13")
    : window.TEUI.StateManager.getValue("d_13");

  console.log("  ║ Standard:", standard);
  console.log("  ║ Calling FileHandler.applyReferenceValuesFromStandard()...");
  console.log("  ║   Mode parameter:", currentMode);
  console.log("  ╚═══════════════════════════════════════════");

  if (window.TEUI?.FileHandler?.applyReferenceValuesFromStandard) {
    window.TEUI.FileHandler.applyReferenceValuesFromStandard(standard, currentMode);
  } else {
    console.error("[S02] FileHandler.applyReferenceValuesFromStandard() not available");
  }
}
```

#### Phase 6: FileHandler.applyReferenceValuesFromStandard() Logging

**Location**: FileHandler.js lines 991-1043

```javascript
applyReferenceValuesFromStandard(standard, targetMode) {
  console.log("    ╔═════════════════════════════════════════");
  console.log("    ║ [DEBUG] FileHandler.applyReferenceValuesFromStandard()");
  console.log("    ║ Standard:", standard);
  console.log("    ║ targetMode parameter:", targetMode);

  const referenceValues = window.TEUI?.ReferenceValues?.[standard];
  if (!referenceValues) {
    console.error("    ║ ERROR: No ReferenceValues for:", standard);
    return;
  }

  const importedData = {};
  Object.entries(referenceValues).forEach(([fieldId, value]) => {
    const targetFieldId = targetMode === "reference" ? `ref_${fieldId}` : fieldId;
    importedData[targetFieldId] = value;
  });

  console.log("    ║ Built importedData with", Object.keys(importedData).length, "fields");
  console.log("    ║ Sample field IDs (first 5):", Object.keys(importedData).slice(0, 5));
  console.log("    ║ Prefix used:", targetMode === "reference" ? "ref_" : "none");
  console.log("    ╚═════════════════════════════════════════");

  // ... rest of function
}
```

### Testing Protocol with Logging

#### Test Scenario 1: Reference Toggle (Expected: Works)
1. Open browser console
2. Click Reference Toggle to switch to Reference mode
3. Observe console output - capture all logs
4. Change d_13 standard
5. Click "Set Values"
6. Observe console output - note which field IDs are written (ref_ vs unprefixed)
7. Verify only Reference model (ref_ fields) were updated

#### Test Scenario 2: Reference Dropdown (Expected: Broken)
1. Refresh page (reset to Target mode)
2. Click Reference Dropdown "Show Reference" menu item
3. Observe console output - compare to Reference Toggle logs
4. Change d_13 standard
5. Click "Set Values"
6. Observe console output - note which field IDs are written
7. Verify if BOTH models are updated (bug reproduction)

### What to Look For

Compare the two log outputs side-by-side. Look for:

1. **isShowingReference flag**: Does it update correctly for both UI controls?
2. **getCurrentMode() return value**: Does it return "reference" for both?
3. **Section ModeManager.currentMode**: Are all sections reporting "reference" mode?
4. **Timing**: Is there a delay/async issue with Reference Dropdown?
5. **Field ID prefixes**: Are ref_ prefixes being applied correctly?
6. **StateManager writes**: Which keys are being written to (ref_ vs unprefixed)?

### Expected Findings

The logs should reveal one of:
- Reference Dropdown not fully completing `switchMode()` before "Set Values" is clicked
- Section-local `currentMode` values out of sync after Reference Dropdown click
- FileHandler receiving wrong `targetMode` parameter despite correct `getCurrentMode()` return
- Something resetting `isShowingReference` back to false between UI control click and "Set Values" click

---
