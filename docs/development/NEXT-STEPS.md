# NEXT STEPS - "Set Values" Button Implementation

**Date**: November 19, 2025
**Branch**: `D13-UPDATE`
**Status**: Ready for implementation - 2 simple tasks remaining

---

## Quick Start (For Fresh Agent)

You're picking up work on the "Set Values" button feature. **Phases 1-6 are complete** (listener unwiring, state isolation, TargetState methods added).

**What's left**: Fix Phase 4 by delegating to FileHandler instead of implementing in Section02.

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

## After Implementation is Complete

Proceed to **Phase 7: Integration Testing & Validation** in [D13-ARCHITECTURE-OPTIONS.md](./D13-ARCHITECTURE-OPTIONS.md) line 1271

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
