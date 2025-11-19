# NEXT STEPS - "Set Values" Button Implementation

**Date**: November 19, 2025
**Branch**: `D13-UPDATE`
**Status**: ✅ Phase 4 COMPLETE - FileHandler delegation implemented

---

## Implementation Summary (Nov 19, 2025)

**Phase 4 Complete**: "Set Values" button now delegates to FileHandler using Import Quarantine pattern

### What Was Implemented

1. **FileHandler.applyReferenceValuesFromStandard()** - [src/core/FileHandler.js:736-844](../../src/core/FileHandler.js#L736-L844)
   - Mode-aware: Only applies values to the currently active model (Target OR Reference, not both)
   - Uses proven Import Quarantine pattern (mute → apply → sync → unmute → calculate → refresh)
   - Treats ReferenceValues.js as internal import source (consistent with Excel import)

2. **Section02.applyReferenceValuesOverlay()** - [src/sections/Section02.js:1095-1117](../../src/sections/Section02.js#L1095-L1117)
   - Simplified from 56 lines to 17 lines
   - Section02 now handles UI events only - delegates all logic to FileHandler

### Key Fix: Mode-Aware Behavior
- When "Set Values" is clicked in **Target mode**: Only applies to Target model (leaves Reference model untouched)
- When "Set Values" is clicked in **Reference mode**: Only applies to Reference model (leaves Target model untouched)
- This prevents state contamination and preserves default values in Target mode after initialization

---

## ⚠️ Known Issues - Partial Implementation

### ✅ Working: Target Mode
- Clicking "Set Values" in Target mode correctly applies values to Target model only
- Reference model remains untouched ✅
- Import/Export functionality fully restored ✅

### ❌ Bug: Reference Mode
- Clicking "Set Values" in Reference mode incorrectly applies values to **Target model**
- Reference model remains unaltered (no values applied) ❌
- Root cause: `publishToStateManager()` only publishes ref_ fields, but doesn't trigger ReferenceState update in the same way TargetState does

### Critical Difference from FileHandler Import
FileHandler's Excel import recalculates **both models** because it's importing user data.

"Set Values" button is different:
- Should only apply values to the **currently active model**
- Must NOT overwrite defaults or user-defined values in the inactive model
- This prevents state contamination when switching between design scenarios

### Fix Strategy (Deferred)
Need to ensure ReferenceState changes properly sync and refresh in Reference mode, similar to how TargetState syncs in Target mode (lines 802-810).

---

## 🎯 Your Mission: 2 Simple Tasks

### Task 1: Add Method to FileHandler.js

**File**: `src/core/FileHandler.js`
**Where**: After existing import methods (~line 735+)
**What**: Add new method `applyReferenceValuesFromStandard(standard, targetMode)`

**Get complete code from**: [SETTING-VALUES.md](./SETTING-VALUES.md) lines 327-442

**Pattern**: 5-phase Import Quarantine
1. Mute listeners
2. Apply values (to TargetState or ReferenceState based on mode)
3. Sync to StateManager
4. Refresh DOM (shows inputs)
5. Unmute listeners
6. Trigger calculateAll()
7. Refresh DOM again (shows calculated results)

---

### Task 2: Simplify Section02.js Button Handler

**File**: `src/sections/Section02.js`
**What**: Replace entire `applyReferenceValuesOverlay()` function (lines 1070-1130)
**New implementation**: ~15 lines that delegate to FileHandler

**Get complete code from**: [SETTING-VALUES.md](./SETTING-VALUES.md) lines 295-325

**Simple approach**:
```javascript
// In initializeEventHandlers()
const setValuesBtn = document.getElementById("setValuesBtn");
if (setValuesBtn) {
  setValuesBtn.addEventListener("click", () => {
    const currentMode = window.TEUI?.ModeManager?.currentMode || "target";
    const standard = currentMode === "reference"
      ? window.TEUI.StateManager.getValue("ref_d_13")
      : window.TEUI.StateManager.getValue("d_13");

    // Delegate to FileHandler
    window.TEUI.FileHandler.applyReferenceValuesFromStandard(standard, currentMode);
  });
}
```

---

## Test Your Implementation

### Test 1: Target Mode
1. Load app in Target mode
2. Select d_13 = "PH Classic"
3. Click "Set Values"
4. **Expected**: d_66 changes to 1.1, DOM updates immediately

### Test 2: Reference Mode
1. Switch to Reference mode
2. Select ref_d_13 = "OBC SB10 5.5-6 Z6"
3. Click "Set Values"
4. **Expected**: ref_d_66 changes to 2.0, DOM updates immediately

### Test 3: State Isolation
1. After Test 1-2, switch between modes
2. **Expected**: Values don't contaminate each other (d_66=1.1, ref_d_66=2.0)

### Test 4: Stability
1. Repeat Test 1-2 multiple times
2. **Expected**: No value drift, h_10 (S01 grand total) remains stable

---

## Why This Approach?

✅ **FileHandler already has the working pattern** (Excel import uses Import Quarantine)
✅ **Treats ReferenceValues.js as internal import source** (consistent architecture)
✅ **No code duplication** (one place to maintain)
✅ **Proven to work** (FileHandler's import never has the DOM update / drift issues)

---

## Next Steps

1. **✅ Phase 3 Cleanup COMPLETE** (Commit: a9a488f)
   - Removed obsolete PASSIVE d_13/ref_d_13 listeners from S05, S06, S09, S11, S12, S13, S14
   - Kept S03 listeners (Thermostat Setpoint updates) and S09 d_13 listener (Plug/Light/Equipment loads)
   - FileHandler now handles 100% of ReferenceValues application via "Set Values" button

2. **Fix Reference Mode Bug** (Next Priority): Make "Set Values" work correctly in Reference mode
   - Currently applies to wrong model (Target instead of Reference)
   - Need to mirror the TargetState sync logic (lines 802-810) for ReferenceState

3. **Phase 7: Integration Testing & Validation** - See [D13-ARCHITECTURE-OPTIONS.md](./D13-ARCHITECTURE-OPTIONS.md) line 1271

---

## Key Reference Documents

1. **[SETTING-VALUES.md](./SETTING-VALUES.md)** - Complete code examples and pattern explanation
2. **[D13-ARCHITECTURE-OPTIONS.md](./D13-ARCHITECTURE-OPTIONS.md)** - Full workplan (read "IMPLEMENTATION READY" section at top)
3. **[ReferenceValues.js](../../src/core/ReferenceValues.js)** - The internal "import" source

---

## Questions?

- **Why delegate to FileHandler?** Because it already has the Import Quarantine pattern that works perfectly for Excel imports. Don't duplicate code.
- **What's Import Quarantine?** Mute listeners → Set all values → Sync states → Unmute → Calculate. Prevents premature calculations and value drift.
- **What if tests fail?** Check console for FileHandler logs. Pattern should match Excel import behavior exactly.

---

**Good luck! The pattern is proven, the code is documented, and the tests are clear. This should be straightforward. 🚀**
