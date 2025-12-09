# Reference Mode UI/DOM Refresh Bug Investigation

**Status**: 🔍 **UNDER INVESTIGATION**
**Branch**: REF-MODE-UNITY
**Date**: 2025-12-09
**Priority**: CRITICAL - State mixing violates dual-state architecture

---

## Problem Statement

**CENTRAL ISSUE**: ReferenceValues overlay is being applied to BOTH models instead of just the Reference model.

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

## Notes

- **No more bandaids**: Focus on root cause, not symptoms
- **Logging over code changes**: Understand before modifying
- **KISS principle**: Keep investigation focused and simple
- **Historical context matters**: Per-section toggles were retired, verify cleanup complete
