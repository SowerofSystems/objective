# Reference Mode State Isolation Bug - RESOLVED

**Status**: ⚠️ **PARTIALLY RESOLVED - POST-IMPORT REGRESSION**
**Branch**: REF-MODE-UNITY
**Date**: 2025-12-09
**Resolution**: Two critical fixes - skipRecalculation parameter + refreshUI state source
**Commits**: 066b910, 1049ed8, 1a7f6d3, f661113, 3a4f188
**Regression**: Bug returns after CSV/Excel file import

---

## Problem Statement

**CENTRAL ISSUE**: ReferenceValues overlay was being applied to BOTH models instead of just the Reference model.

### How d_13 Standard Selection Should Work

TEUI maintains two completely independent models with separate state variables:
- **Target model**: `d_13`, `h_10`, etc. (unprefixed)
- **Reference model**: `ref_d_13`, `e_10`, etc. (ref_ prefixed)

**Two-stage setting process** (intentional safety mechanism):
1. User selects standard from d_13 dropdown (writes to `d_13` or `ref_d_13` depending on mode)
2. User clicks "Set Values" to apply ReferenceValues.js overlay (prevents accidental overwrites)

**Expected state isolation**:
- Changing `d_13` dropdown in Reference mode: Only `ref_d_13` changes, `d_13` untouched
- Changing `d_13` dropdown in Target mode: Only `d_13` changes, `ref_d_13` untouched
- Switching modes: UI refreshes to show correct value (`d_13` in Target, `ref_d_13` in Reference)

### Bug 1: d_13 Dropdown Stuck After "Set Values"
**Working correctly**: Changing d_13 dropdown respects state isolation. Can toggle between Target/Reference modes any number of times.

**Bug triggers**: As soon as "Set Values" is clicked, d_13 dropdown shows the last selected standard in BOTH modes.

**Root cause**: ReferenceValues overlay is contaminating both `d_13` AND `ref_d_13` state variables.

### Bug 2: "Set Values" Applies ReferenceValues to BOTH Models
**Expected**: "Set Values" in Reference mode should ONLY write to `ref_*` prefixed variables (Reference model).

**Actual**: ReferenceValues overlay is applied to BOTH Target model AND Reference model. Both `h_10` (Target TEUI) and `e_10` (Reference TEUI) change.

---

## UI Controls Reference

TEUI has **two distinct UI controls** for switching between Target and Reference modes:

### 1. Reference Dropdown
- **Location**: Top button bar in [index.html:232-237](../../index.html#L232-L237)
- **Visual**: Dropdown button showing "Reference" or "Target"
- **Menu items**:
  - `showReferenceBtn` (id) - "Show Reference" menu item
  - `showTargetBtn` (id) - "Show Target" menu item

### 2. Reference Toggle
- **Location**: Section 01 "Key Values" header in [Section01.js:1336](../../src/sections/Section01.js#L1336)
- **Visual**: Slider switch (no label)
- **Position**: Left = Target mode, Right = Reference mode

**IMPORTANT**: Both controls are system-wide and should produce identical behavior.

---

## Historical Context: Toggle Retirement

### Original Architecture (Development)
Each section had its own Reference/Target toggle for quick state persistence testing. This was for development/debugging to verify 100% value independence between models.

### Current Architecture (Production)
- ✅ **All per-section toggles retired**
- ✅ **Reference Dropdown** controls ALL sections (original "global" toggle)
- ✅ **Reference Toggle** added later for horizontal/tabbed navigation mode (dropdown not accessible)
- ✅ **Both should do EXACTLY the same thing**: Flip ALL sections' UI into Reference or Target mode

### Critical Principle
**Two completely independent models**. Pure and simple. 100% isolated.

---

## Bug Analysis

### Root Cause Hypotheses

**Hypothesis 1: Incomplete Section Mode Switch**
- Reference Dropdown doesn't properly switch ALL sections to Reference mode
- Some sections remain in Target mode
- "Set Values" operates on mixed-mode sections → state contamination

**Hypothesis 2: Residual Per-Section Toggle Code**
- Old per-section toggle code not properly removed
- Conflicting mode state between section-local and global toggle
- UI refresh functions read wrong mode state

**Hypothesis 3: refreshUI() Failure**
- `ModeManager.refreshUI()` not properly implemented in all sections
- Dropdown selections don't refresh when switching modes
- d_13 shows stale value because DOM never updated to Target mode's value

**Hypothesis 4: Mode State Synchronization**
- `ReferenceToggle.isShowingReference` out of sync with section-local `ModeManager.currentMode`
- Section 02 reads one state, FileHandler operates on another
- State mixing occurs during "Set Values" operation

---

## Investigation Plan

### Phase 1: Mode Switch Verification
**Objective**: Verify that BOTH UI controls properly switch ALL sections

**Test Protocol**:
1. Fresh page load
2. Click Reference Dropdown "Show Reference"
3. **Log**: Check `ReferenceToggle.isShowingReference`
4. **Log**: Check `sect02.ModeManager.currentMode` through `sect15.ModeManager.currentMode`
5. Verify ALL sections report "reference" mode

Repeat for Reference Toggle.

**Success Criteria**: Both UI controls produce identical mode states across ALL sections.

### Phase 2: refreshUI() Audit
**Objective**: Verify all sections properly refresh DOM when mode switches

**Audit Checklist for Each Section**:
- ✅ Does section have `ModeManager.refreshUI()` function?
- ✅ Does `refreshUI()` update ALL user input fields (dropdowns, sliders, editable)?
- ✅ Is `refreshUI()` called by `switchMode()`?
- ✅ Does d_13 dropdown get refreshed from correct state (Target vs Reference)?

**Detection**:
```bash
grep -A 20 "refreshUI.*function" src/sections/Section*.js
grep "d_13" src/sections/Section02.js | grep -i refresh
```

### Phase 3: "Set Values" Flow Analysis
**Objective**: Trace complete flow from button click to ReferenceValues application

**Flow to Trace**:
1. Section 02: "Set Values" button click
2. Section 02: `applyReferenceValuesOverlay()`
3. Section 02: Read current mode from `ReferenceToggle.getCurrentMode()`
4. FileHandler: `applyReferenceValuesFromStandard(standard, currentMode)`
5. FileHandler: Build `importedData` with correct prefix (ref_ or none)
6. FileHandler: `calculateAll()` - which sections? which modes?
7. Sections: Do calculations respect `ModeManager.currentMode`?
8. FileHandler: Final UI refresh - reads from correct state?

**Key Questions**:
- Does `getCurrentMode()` return correct value?
- Does FileHandler respect `targetMode` parameter?
- Do section calculations write to correct state (ref_ vs unprefixed)?
- Does final UI refresh read from correct state?

### Phase 4: Residual Code Search
**Objective**: Find any leftover per-section toggle code

**Search Patterns**:
```bash
# Look for section-local toggle variables
grep -r "sectionToggle\|localToggle\|showReference.*section" src/sections/

# Look for section-specific mode state
grep -r "this.mode\|this.isReference" src/sections/

# Look for direct DOM manipulation of mode
grep -r "classList.*reference.*section" src/sections/
```

---

## Debugging Tools

### Browser Console Commands
```javascript
// Check global mode state
window.TEUI.ReferenceToggle.getCurrentMode()

// Check all section modes
['sect02', 'sect03', 'sect04', 'sect05', 'sect06', 'sect07', 'sect08',
 'sect09', 'sect10', 'sect11', 'sect12', 'sect13', 'sect14', 'sect15']
  .map(id => ({
    section: id,
    mode: window.TEUI[id]?.ModeManager?.currentMode
  }))

// Check d_13 values
{
  target_d_13: window.TEUI.StateManager.getValue('d_13'),
  ref_d_13: window.TEUI.StateManager.getValue('ref_d_13')
}

// Check TEUI values
{
  target_h_10: window.TEUI.StateManager.getValue('h_10'),
  ref_e_10: window.TEUI.StateManager.getValue('e_10')
}
```

---

## Test Cases

### Test Case 1: Target Mode + Reference Dropdown
```
1. Fresh page load
2. Verify Target mode active
3. Note d_13 value (e.g., "Code Minimum")
4. Switch to Reference mode via Reference Dropdown
5. Change d_13 to different value (e.g., "PH Classic")
6. Switch back to Target mode via Reference Dropdown
7. EXPECTED: d_13 shows "Code Minimum" (original Target value)
8. ACTUAL: Does d_13 show "PH Classic" (Reference value)? → BUG
```

### Test Case 2: Reference Mode + Set Values Isolation
```
1. Fresh page load
2. Note h_10 (Target TEUI) value
3. Switch to Reference mode via Reference Dropdown
4. Change d_13 to different standard
5. Click "Set Values"
6. EXPECTED: Only e_10 (Reference TEUI) changes
7. Switch to Target mode
8. EXPECTED: h_10 unchanged from step 2
9. ACTUAL: Did h_10 change? → BUG
```

### Test Case 3: Reference Toggle vs Reference Dropdown Consistency
```
1. Fresh page load
2. Switch to Reference mode via Reference Toggle
3. Perform Test Case 2 steps 4-8
4. Compare results to Test Case 2
5. EXPECTED: Identical behavior
6. ACTUAL: Different behavior? → BUG in one control
```

---

## Success Criteria

✅ **Perfect UI Isolation**: d_13 dropdown shows correct value for current mode
✅ **Perfect State Isolation**: "Set Values" affects ONLY current mode's model
✅ **Toggle Consistency**: Both UI controls produce identical results
✅ **refreshUI Compliance**: All sections properly refresh DOM on mode switch
✅ **No Residual Code**: All per-section toggle code removed

---

## Related Files

### Core Files
- [Section02.js:1004-1034](../../src/sections/Section02.js#L1004-L1034) - "Set Values" implementation
- [FileHandler.js:991-1095](../../src/core/FileHandler.js#L991-L1095) - ReferenceValues application
- [ReferenceToggle.js:232-283, 329-341](../../src/core/ReferenceToggle.js#L232-L283) - Mode switching

### UI Controls
- [index.html:232-237](../../index.html#L232-L237) - Reference Dropdown
- [Section01.js:1336-1350](../../src/sections/Section01.js#L1336-L1350) - Reference Toggle

### Pattern A Sections (All need verification)
- Section02.js through Section15.js - Each has ModeManager.refreshUI()

---

## Resolution Summary

### Root Cause Identified

**Line 1045 in FileHandler.js**: `updateStateFromImportData(importedData, 0, **false**)`

When `skipRecalculation=false`, the function executed this code at lines 848-853:
```javascript
const finalD13 = this.stateManager.getApplicationValue("d_13"); // Target model standard!
this.stateManager.loadReferenceData(finalD13); // Contaminated Target model!
```

**The Bug Flow**:
1. User in Reference mode clicks "Set Values" ✅
2. `applyReferenceValuesFromStandard()` builds `importedData` with `ref_` prefixes ✅
3. Writes `ref_f_85`, `ref_f_86`, etc. to StateManager ✅
4. Calls `loadReferenceData(d_13)` ❌ **BUG: Used Target standard, not Reference!**
5. Overwrites Target model values with Reference standard ❌

### The Fix

**One line change** - [FileHandler.js:1045](../../src/core/FileHandler.js#L1045):
```javascript
// BEFORE (bug):
this.updateStateFromImportData(importedData, 0, false);

// AFTER (fixed):
this.updateStateFromImportData(importedData, 0, true); // Skip loadReferenceData
```

**Why it works**: The `skipRecalculation` parameter was already designed for this scenario - when importing reference data that's correctly prefixed, skip additional reference loading to prevent contamination.

### Verification

**Logging confirmed**:
- ✅ Mode correctly detected: `ModeManager.currentMode: reference`
- ✅ importedData correctly built: `{ref_f_85: '5.30', ref_f_86: '4.10', ref_f_87: '6.60'}`
- ✅ Only REF fields written: `ref_f_85`, `ref_f_86`, `ref_f_87`
- ✅ NO Target fields contaminated: No unprefixed writes detected

**User testing confirmed**:
- ✅ Switch to Reference mode, change d_13, click "Set Values"
- ✅ Target model values (h_10, f_85) remain unchanged
- ✅ Only Reference model values (e_10, ref_f_85) updated
- ✅ Perfect state isolation restored

### Files Modified

**Commit 1049ed8** - Primary fix (state contamination):
- [FileHandler.js:1045](../../src/core/FileHandler.js#L1045) - Changed `skipRecalculation` from `false` to `true`
- [Section02.js:1013-1015](../../src/sections/Section02.js#L1013-L1015) - Simplified logging
- [FileHandler.js](../../src/core/FileHandler.js) - Removed debug logging

**Commit 1a7f6d3** - Secondary fix (d_13 dropdown refresh):
- [Section02.js:1866-1868](../../src/sections/Section02.js#L1866-L1868) - Changed refreshUI() to read d_13 from StateManager instead of section-local state

### Secondary Issue: d_13 Dropdown Not Refreshing

**Problem**: After fixing state contamination, d_13 dropdown still showed wrong value when switching modes.

**Root Cause**:
- "Set Values" writes to StateManager (`ref_d_13` or `d_13`)
- `refreshUI()` reads from section-local state (`currentState.getValue("d_13")`)
- Section-local state not synced from StateManager
- Dropdown showed stale value from local state

**Fix** - [Section02.js:1866-1868](../../src/sections/Section02.js#L1866-L1868):
```javascript
// BEFORE (bug):
const d13Value = currentState.getValue("d_13");

// AFTER (fixed):
const d13FieldId = this.currentMode === "reference" ? "ref_d_13" : "d_13";
const d13Value = window.TEUI.StateManager.getValue(d13FieldId);
```

**Why it works**: Now reads from StateManager (global state) with correct mode prefix, same location where "Set Values" writes.

### Lessons Learned

1. **Code reuse requires careful parameter analysis** - `updateStateFromImportData` was designed for CSV imports where `loadReferenceData` is needed, but ReferenceValues overlay already has correct prefixes
2. **Logging is invaluable** - Strategic logging at 3 points revealed the exact contamination source
3. **Existing infrastructure often has the solution** - The `skipRecalculation` flag was already there for this exact scenario
4. **State source consistency is critical** - When feature writes to global state, UI refresh must read from same location
5. **One-line fixes can solve critical bugs** - Two simple changes (parameter + state source) restored perfect state isolation

---

## POST-IMPORT REGRESSION (Dec 9, 2025)

### Executive Summary: The 24-Hour Bug Hunt

**Status**: Root cause identified after extensive analysis involving multiple agents and approaches.

**The Bug**: After CSV/Excel import, clicking "Set Values" in Reference mode contaminates **BOTH** Target and Reference models with the same ReferenceValues.js data.

**Root Cause Discovery**: ReferenceValues.js is a **legacy single-state data structure** that was never updated for dual-state architecture. It contains only **unprefixed field names** (`d_52`, `f_85`) with no `ref_` variants, unlike CSV imports which explicitly separate Target (row 2) and Reference (row 3) data.

**Key Insight**: CSV imports work because they have **mode-aware structure** (separate rows for Target/Reference). ReferenceValues.js overlay fails because it has **mode-unaware structure** (unprefixed field names only). The prefix logic in FileHandler is correct, but something downstream is contaminating both models.

**Next Step**: Diagnostic logging to confirm whether:
- Option A: Prefix logic builds `importedData` incorrectly (both prefixed and unprefixed fields)
- Option B: Prefix logic correct, but `updateStateFromImportData()` or `syncPatternASections()` writes to both models

---

### New Discovery: Bug Returns After File Import

**Symptom**: After importing CSV/Excel file, the bug reappears when using "Set Values" in Reference mode.

**Test Sequence**:
1. ✅ Import CSV/Excel file with Target AND Reference values
2. ✅ Both models import correctly, perfect state isolation
3. ✅ Switch to Reference mode
4. ✅ Change d_13 dropdown to different standard (e.g., "PH Classic")
5. ❌ Click "Set Values" → **BUG RETURNS**: Both Target and Reference models change

**Key Observation from Logs**:
```
FileHandler.js:838 [FileHandler] All imported values set. Explicitly calling loadReferenceData for standard: OBC SB10 5.5-6 Z5 (2010)
StateManager.js:1656 [StateManager] Step 1: Copied application state to activeReferenceDataSet
```

### Root Cause Analysis (Complete)

**THREE-STATE ARCHITECTURE IN STATEMANAGER:**

StateManager maintains three separate state containers:

1. **`fields` Map** - Target model state (unprefixed fieldIds: `d_13`, `h_10`, `f_85`, etc.)
2. **`independentReferenceState` Object** - Reference model state for user-editable fields (stores `ref_` prefixed values)
3. **`activeReferenceDataSet` Object** - **CACHE** for Reference mode `getValue()` calls

**THE CONTAMINATION MECHANISM:**

When `getValue(fieldId)` is called in Reference mode ([StateManager.js:325-356](../../src/core/StateManager.js#L325-L356)):

```javascript
function getValue(fieldId) {
  if (ReferenceToggle.isReferenceMode()) {
    // Priority 1: Check independentReferenceState
    if (independentReferenceState[fieldId]) {
      value = independentReferenceState[fieldId];
    }
    // Priority 2: Check activeReferenceDataSet ⚠️ STALE CACHE!
    else if (activeReferenceDataSet[fieldId]) {
      value = activeReferenceDataSet[fieldId]; // ❌ Returns Target values post-import
    }
    // Priority 3: Fallback to fields Map
    else {
      value = fields.get(fieldId)?.value; // ✅ Would return ref_* values if reached
    }
  }
}
```

**WHY THE CACHE BECOMES STALE:**

**Phase 1: File Import (Working Correctly for Import Itself)**
1. CSV/Excel import writes with correct prefixes:
   - Target: `fields.set("d_13", "OBC SB10 5.5-6 Z5")`, `fields.set("f_85", "5.30")`
   - Reference: `fields.set("ref_d_13", "PH Classic")`, `fields.set("ref_f_85", "4.10")`
2. Import calls `loadReferenceData("OBC SB10 5.5-6 Z5")` at [FileHandler.js:841](../../src/core/FileHandler.js#L841)
3. `loadReferenceData()` **REBUILDS** `activeReferenceDataSet` by ([StateManager.js:1621-1797](../../src/core/StateManager.js#L1621-L1797)):
   - Step 1: Copying **Target model values** from `fields` Map (lines 1640-1654)
   - Step 2: Overlaying ReferenceValues.js for **Target's d_13 standard** (lines 1737-1760)
4. **Result**: `activeReferenceDataSet["f_85"] = "5.30"` (Target's OBC standard value)

**Phase 2: User Changes d_13 in Reference Mode**
1. User switches to Reference mode, selects "PH Classic" from d_13 dropdown
2. Section02 writes `fields.set("ref_d_13", "PH Classic")` ✅ Correct
3. **`activeReferenceDataSet` NOT UPDATED** - still contains Target values

**Phase 3: "Set Values" Click (BUG TRIGGERS)**

**⚠️ CRITICAL: ACTUAL OBSERVED BUG** (confirmed by user testing post-import):

**Test Scenario:**
1. Import CSV/Excel with Target model using "OBC SB10 5.5-6 Z5 (2010)" and Reference model using "PH Classic"
2. Switch to **Reference mode**
3. Change d_13 dropdown to **"OBC SB10 5.5-6 Z5 (2010)"** (different from imported Reference standard)
4. Click **"Set Values"** button

**EXPECTED BEHAVIOR:**
- Reference model receives OBC values: `ref_f_85 = "5.30"`, `ref_f_86 = "4.10"`, `ref_f_87 = "6.60"`
- **Target model UNCHANGED**: `f_85`, `f_86`, `f_87` retain original imported values
- Section 11 Reference TEUI updates, Target TEUI unchanged

**ACTUAL BEHAVIOR (BUG):**
- Reference model receives OBC values: `ref_f_85 = "5.30"`, `ref_f_86 = "4.10"`, `ref_f_87 = "6.60"` ✅
- **Target model CONTAMINATED**: `f_85 = "5.30"`, `f_86 = "4.10"`, `f_87 = "6.60"` ❌
- **BOTH** Section 11 Target TEUI AND Reference TEUI change to OBC values
- **Visual proof**: User observes both calculated results change when only Reference should change

**This is DIRECT WRITE CONTAMINATION:**
- Literal ReferenceValues.js data for "OBC SB10 5.5-6 Z5 (2010)" overwrites **BOTH** Target (`f_85`) AND Reference (`ref_f_85`) fields
- Not a stale cache read issue - actual StateManager writes to wrong fields
- Both engines run (correct per CHEATSHEET.md), but **Target engine calculates with contaminated inputs**

### BREAKTHROUGH: ReferenceValues.js is Mode-Unaware (Dec 9, 2025 - Evening)

**THE FUNDAMENTAL ARCHITECTURAL MISMATCH:**

**CSV Import Structure (Mode-Aware - WORKS):**
```csv
Row 1 (headers):  d_52,  f_85,   f_86,   ...
Row 2 (Target):   "90",  "5.30", "4.10", ...  → writes to d_52, f_85, f_86
Row 3 (Reference):"92",  "4.87", "4.21", ...  → writes to ref_d_52, ref_f_85, ref_f_86
```

FileHandler processes CSV with **explicit dual-state rows**:
- Row 2 → Target model (unprefixed)
- Row 3 → Reference model (`ref_` prefix added during import)

**ReferenceValues.js Structure (Mode-Unaware - BROKEN):**
```javascript
TEUI.ReferenceValues = {
  "OBC SB10 5.5-6 Z5 (2010)": {
    d_52: "90",    // ← UNPREFIXED field names only
    f_85: "5.30",  // ← NO ref_ variants exist
    f_86: "4.10",  // ← Data is mode-agnostic
    // NO ref_d_52, NO ref_f_85, NO ref_f_86
  }
}
```

**Critical Insight:** ReferenceValues.js was designed when TEUI was **single-state only**. Field IDs are **unprefixed** because there was only one model. The file was **never updated** for dual-state architecture.

**Code Flow Analysis:**

```javascript
// FileHandler.applyReferenceValuesFromStandard("OBC SB10...", "reference")
const referenceValues = window.TEUI.ReferenceValues["OBC SB10 5.5-6 Z5 (2010)"];
// Returns: { d_52: "90", f_85: "5.30", f_86: "4.10" }  ← UNPREFIXED!

const importedData = {};
Object.entries(referenceValues).forEach(([fieldId, value]) => {
  // fieldId = "f_85" (unprefixed from ReferenceValues.js)
  const targetFieldId = targetMode === "reference" ? `ref_${fieldId}` : fieldId;
  // targetFieldId = "ref_f_85" ✅ Correct prefixing
  importedData[targetFieldId] = value;
});
// Should build: { ref_d_52: "90", ref_f_85: "5.30", ref_f_86: "4.10" } ✅

// Writes to StateManager
this.updateStateFromImportData(importedData, 0, true); // skipRecalculation=true ✅
```

**The prefix logic at [FileHandler.js:1003-1004](../../src/core/FileHandler.js#L1003-L1004) is CORRECT.**

**❌ SUSPECTED CONTAMINATION POINTS:**

1. **Double-write in updateStateFromImportData()**:
   - Receives `{ref_f_85: "5.30"}` correctly
   - But may be writing **BOTH** `ref_f_85` AND `f_85` to StateManager
   - Possible cause: Loop processing unprefixed field names from original ReferenceValues.js structure

2. **syncPatternASections() bidirectional copy**:
   - May be copying `ref_*` values back to unprefixed fields
   - Pattern A sections share DOM elements between modes
   - Sync might be contaminating Target state with Reference values

3. **calculateAll() writeback contamination**:
   - Both engines run (correct per CHEATSHEET.md)
   - Reference engine calculates with `ref_*` inputs
   - Results may be written to BOTH `ref_*` AND unprefixed fields

4. **Residual loadReferenceData() effects**:
   - Import calls `loadReferenceData(d_13)` which populates `activeReferenceDataSet`
   - Cache may be causing subsequent reads to return wrong values
   - These wrong values get written back during calculations

**CRITICAL DIAGNOSTIC QUESTIONS:**

1. **Does `importedData` object contain ONLY prefixed fields?**
   - Expected: `{ref_f_85: "5.30", ref_f_86: "4.10"}` only
   - Bug: `{d_52: "90", ref_d_52: "90", f_85: "5.30", ref_f_85: "5.30"}` (double write)

2. **What setValue() calls does StateManager receive?**
   - Expected: `setValue("ref_f_85", "5.30")` only
   - Bug: BOTH `setValue("f_85", "5.30")` AND `setValue("ref_f_85", "5.30")`

3. **Does syncPatternASections() copy bidirectionally?**
   - Expected: Sync reads from global StateManager to populate section-local state
   - Bug: Sync WRITES from section-local state back to global StateManager (bidirectional contamination)

**WHY OUR FIX WORKS FOR DEFAULT STATE:**

- Fresh page load → `activeReferenceDataSet` is empty `{}`
- User selects d_13, clicks "Set Values" → writes `ref_*` values
- Our fix prevents `loadReferenceData()` → cache stays empty
- `getValue("f_85")` falls through Priority 2 (empty cache) to Priority 3
- Reads `fields.get("f_85")` → Returns correct Target value in Target mode ✅
- In Reference mode, should read `fields.get("ref_f_85")` but Priority 2 prevents reaching Priority 3

**WHY FIX FAILS POST-IMPORT:**

- Import populates `activeReferenceDataSet` with Target values
- User changes `ref_d_13`, clicks "Set Values" → writes `ref_*` values
- Our fix prevents **second** `loadReferenceData()` → cache **NOT CLEARED**
- `getValue("f_85")` in Reference mode hits Priority 2 → returns stale cache ❌
- Never reaches Priority 3 where fresh `ref_f_85` value exists

### Architectural Issue: activeReferenceDataSet Purpose

**Critical Question**: What is `activeReferenceDataSet` supposed to cache?

**Analysis of `loadReferenceData()` logic:**
- Copies **Target** model values (Step 1: lines 1640-1654)
- Overlays ReferenceValues.js for **Target's** d_13 standard (Step 3: lines 1737-1760)
- **Conclusion**: Cache represents "what Reference model WOULD look like if based on Target's standard"

**This is WRONG for true dual-state isolation:**
- Reference model should be **100% independent** (per CHEATSHEET.md)
- `ref_*` fields should be authoritative for Reference state
- Cache creates hidden coupling between Target standard (d_13) and Reference state
- **User observation confirms contamination**: After import + "Set Values" in Reference mode, **BOTH** Target and Reference models change, proving the stale cache affects calculations on both sides

### Proposed Solutions

**Option 1: Priority Reordering in getValue() (RECOMMENDED)**

Change Reference mode priority to check `ref_*` fields FIRST:

```javascript
function getValue(fieldId) {
  if (ReferenceToggle.isReferenceMode()) {
    // Priority 1: Check ref_* prefixed field in fields Map (FRESH DATA)
    const refFieldId = `ref_${fieldId}`;
    if (fields.has(refFieldId)) {
      value = fields.get(refFieldId).value; // ✅ Always fresh, authoritative
    }
    // Priority 2: Check independentReferenceState (user-editable fields)
    else if (independentReferenceState[fieldId]) {
      value = independentReferenceState[fieldId];
    }
    // Priority 3: Check activeReferenceDataSet (legacy cache)
    else if (activeReferenceDataSet[fieldId]) {
      value = activeReferenceDataSet[fieldId];
    }
    // Priority 4: Fallback to Target value
    else {
      value = fields.get(fieldId)?.value;
    }
  }
}
```

**Advantages**:
- Minimal code change (5 lines in StateManager.js)
- Preserves existing architecture
- Fixes both default and post-import scenarios
- `ref_*` fields become authoritative (true dual-state isolation)

**Disadvantages**:
- Doesn't address why `activeReferenceDataSet` exists
- Cache becomes redundant but remains in codebase

**Option 2: Clear Cache When Writing ref_* Fields**

Invalidate cache entries when corresponding `ref_*` field is written:

```javascript
function setValue(fieldId, value, state) {
  // ... existing code ...

  // If writing a ref_* field, clear corresponding cache entry
  if (fieldId.startsWith("ref_")) {
    const baseFieldId = fieldId.substring(4);
    if (activeReferenceDataSet[baseFieldId]) {
      delete activeReferenceDataSet[baseFieldId];
    }
  }

  // ... rest of setValue ...
}
```

**Advantages**:
- Maintains cache for performance
- Ensures cache never stale

**Disadvantages**:
- More complex (cache invalidation is hard)
- Doesn't fix fundamental design issue
- Cache rebuilds on every `loadReferenceData()` call anyway

**Option 3: Deprecate activeReferenceDataSet Entirely**

Remove cache, always read from authoritative sources:

```javascript
function getValue(fieldId) {
  if (ReferenceToggle.isReferenceMode()) {
    // Check ref_* field first
    const refFieldId = `ref_${fieldId}`;
    if (fields.has(refFieldId)) {
      return fields.get(refFieldId).value;
    }
    // Check independentReferenceState
    if (independentReferenceState[fieldId]) {
      return independentReferenceState[fieldId];
    }
    // Fallback to Target (for fields without ref_* variants)
    return fields.get(fieldId)?.value || null;
  }
}
```

**Advantages**:
- Simplest architecture
- No cache staleness possible
- True dual-state isolation
- Removes 200+ lines of cache management code

**Disadvantages**:
- Requires understanding why cache was added (performance? legacy?)
- May break assumptions in other code

### Additional Import Code Paths

**Are there THREE separate code paths that all need fixes?**

1. ✅ **ReferenceValues overlay** ([FileHandler.js:1022](../../src/core/FileHandler.js#L1022)) - FIXED with `skipRecalculation=true`
2. ❌ **CSV import** ([FileHandler.js:457](../../src/core/FileHandler.js#L457)) - Uses `skipRecalculation=false`
3. ❌ **Excel import** ([FileHandler.js:189](../../src/core/FileHandler.js#L189)) - Uses `skipRecalculation=false`
4. ❓ **Copy from Target** (menu option) - Unknown status

**Analysis**: Import paths SHOULD call `loadReferenceData(d_13)` because:
- Imports Target values (unprefixed) into `fields` Map
- Need to initialize `activeReferenceDataSet` for Reference mode display
- **BUT** this creates the stale cache problem for subsequent operations

**Import paths are NOT the bug** - they correctly populate both models. The bug is that `activeReferenceDataSet` is never updated when `ref_*` fields change.

### Recommendation

**Implement Option 1 (Priority Reordering)** as the immediate fix:
- Minimal risk, surgical change
- Fixes both default and post-import scenarios
- Makes `ref_*` fields authoritative for Reference state
- Preserves existing architecture for backward compatibility

**Future refactor (v4.013)**: Consider Option 3 to simplify architecture and remove cache entirely.

### Diagnostic Logging Strategy

**CRITICAL: Before implementing any fix, we must confirm if prefix logic works or if double-write occurs.**

**Phase 1: Verify Prefix Logic in applyReferenceValuesFromStandard**

Add logging at [FileHandler.js:985-1088](../../src/core/FileHandler.js#L985-L1088) to confirm `importedData` structure:

```javascript
// AFTER building importedData (around line 1006)
console.log(`[FileHandler] ===== REFERENCE VALUES OVERLAY DEBUG =====`);
console.log(`[FileHandler] Standard: "${standard}"`);
console.log(`[FileHandler] Target Mode: "${targetMode}"`);
console.log(`[FileHandler] ReferenceValues (unprefixed source):`, Object.keys(referenceValues).slice(0, 10));
console.log(`[FileHandler] Built importedData (after prefix logic):`, Object.keys(importedData).slice(0, 10));
console.log(`[FileHandler] CRITICAL CHECK - Does importedData contain unprefixed fields?`);
console.log(`[FileHandler] Sample fields:`, {
  f_85: importedData.f_85,       // Should be UNDEFINED in Reference mode
  ref_f_85: importedData.ref_f_85, // Should be "5.30" in Reference mode
  f_86: importedData.f_86,       // Should be UNDEFINED in Reference mode
  ref_f_86: importedData.ref_f_86  // Should be "4.10" in Reference mode
});
console.log(`[FileHandler] ==========================================`);
```

**Expected Log Output (CORRECT):**
```
[FileHandler] Standard: "OBC SB10 5.5-6 Z5 (2010)"
[FileHandler] Target Mode: "reference"
[FileHandler] ReferenceValues (unprefixed source): ["d_52", "f_85", "f_86", ...]
[FileHandler] Built importedData (after prefix logic): ["ref_d_52", "ref_f_85", "ref_f_86", ...]
[FileHandler] Sample fields: { f_85: undefined, ref_f_85: "5.30", f_86: undefined, ref_f_86: "4.10" }
```

**Bug Log Output (DOUBLE-WRITE):**
```
[FileHandler] Sample fields: { f_85: "5.30", ref_f_85: "5.30", f_86: "4.10", ref_f_86: "4.10" }
                               ^^^^^^^^^^^^ CONTAMINATION!
```

2. **FileHandler.updateStateFromImportData** [FileHandler.js:536-856](../../src/core/FileHandler.js#L536-L856)
   ```javascript
   // PASS 1 & PASS 2 logging
   allEntries.forEach(([fieldId, value]) => {
     if (fieldId === 'f_85' || fieldId === 'ref_f_85' || fieldId === 'f_86' || fieldId === 'ref_f_86') {
       console.log(`[FileHandler] Writing ${fieldId} = "${value}" (pass ${passNumber})`);
       console.trace(`[FileHandler] Stack trace for ${fieldId} write`);
     }
   });
   ```

3. **StateManager.setValue** [StateManager.js:365](../../src/core/StateManager.js#L365)
   ```javascript
   // Track BOTH f_85 and ref_f_85 writes
   if (['f_85', 'ref_f_85', 'f_86', 'ref_f_86', 'f_87', 'ref_f_87'].includes(fieldId)) {
     console.log(`[StateManager.setValue] ${fieldId} = "${value}" (state: ${state})`);
     console.trace(`[StateManager] Stack trace for ${fieldId} write`);
   }
   ```

4. **Pattern A Section Sync** [FileHandler.js:864-975](../../src/core/FileHandler.js#L864-L975)
   ```javascript
   // syncPatternASections() - check if bidirectional copy
   console.log(`[FileHandler] BEFORE sync - Target f_85:`, this.stateManager.getValue('f_85'));
   console.log(`[FileHandler] BEFORE sync - Ref ref_f_85:`, this.stateManager.getValue('ref_f_85'));

   this.syncPatternASections();

   console.log(`[FileHandler] AFTER sync - Target f_85:`, this.stateManager.getValue('f_85'));
   console.log(`[FileHandler] AFTER sync - Ref ref_f_85:`, this.stateManager.getValue('ref_f_85'));
   ```

**Phase 2: Test Sequence with Logging**

1. Import CSV/Excel file (Target="OBC SB10 5.5-6 Z5 (2010)", Reference="PH Classic")
2. Verify import values:
   ```javascript
   {
     target_f_85: window.TEUI.StateManager.getValue('f_85'),
     ref_f_85: window.TEUI.StateManager.getValue('ref_f_85')
   }
   ```
3. Switch to Reference mode
4. Change d_13 to "OBC SB10 5.5-6 Z5 (2010)"
5. **BEFORE** clicking "Set Values", log baseline:
   ```javascript
   console.log('BASELINE BEFORE "Set Values":');
   console.log('Target f_85:', window.TEUI.StateManager.getValue('f_85'));
   console.log('Ref ref_f_85:', window.TEUI.StateManager.getValue('ref_f_85'));
   ```
6. Click "Set Values"
7. **AFTER** "Set Values", compare:
   ```javascript
   console.log('AFTER "Set Values":');
   console.log('Target f_85:', window.TEUI.StateManager.getValue('f_85')); // Should be UNCHANGED
   console.log('Ref ref_f_85:', window.TEUI.StateManager.getValue('ref_f_85')); // Should be "5.30"
   ```

**Phase 3: Analyze Logs**

Look for:
- ❌ **Direct contamination**: `setValue('f_85', '5.30')` called when it should only be `setValue('ref_f_85', '5.30')`
- ❌ **Bidirectional sync**: `syncPatternASections()` copying `ref_f_85 → f_85`
- ❌ **Double write**: Both `ref_f_85` and `f_85` in `importedData` object
- ❌ **Calculation writeback**: `calculateAll()` writing Reference results to Target fields

**Expected Log Pattern (CORRECT behavior):**
```
[FileHandler] Built importedData: ["ref_f_85", "ref_f_86", "ref_f_87", ...]
[FileHandler] Sample fields: { ref_f_85: "5.30", f_85: undefined }
[StateManager.setValue] ref_f_85 = "5.30" (state: imported)
AFTER "Set Values":
Target f_85: [unchanged]
Ref ref_f_85: "5.30"
```

**Bug Log Pattern (CONTAMINATION):**
```
[FileHandler] Built importedData: ["ref_f_85", "ref_f_86", "f_85", "f_86", ...]
[FileHandler] Sample fields: { ref_f_85: "5.30", f_85: "5.30" } ← BUG!
[StateManager.setValue] ref_f_85 = "5.30" (state: imported)
[StateManager.setValue] f_85 = "5.30" (state: imported) ← CONTAMINATION!
```

### Next Steps

1. **IMMEDIATE**: Add diagnostic logging to trace contamination point
2. **BEFORE ANY CODE CHANGES**: Run test sequence and capture full log output
3. **ANALYZE**: Identify exact line/function writing to unprefixed fields
4. **FIX**: Surgical correction at contamination source
5. **VERIFY**: Retest with logging to confirm fix

**DO NOT IMPLEMENT SOLUTION UNTIL CONTAMINATION SOURCE CONFIRMED BY LOGS.**

---

## Notes

- **Two bugs, two fixes (for default/initialization scenario)**:
  1. State contamination: `loadReferenceData(d_13)` after correct ref_* writes
  2. UI refresh: `refreshUI()` reading from wrong state location
- **Fixes verified for default state**: Perfect state isolation + correct dropdown display
- **REGRESSION**: Bug returns after file import - suggests deeper architectural issue
- **Historical bug**: Existed since PR#57 (2025.12-POLISH branch), partially resolved
