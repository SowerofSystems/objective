# S11-S12 Reference Mode Area Update Bug

**Date**: December 8, 2025
**Branch**: `2025.12-DEBUG-PURGE`
**Commit Reference**: b982b1d (partial fix - listeners added, but DOM not updating)

## Problem Summary

When editing Reference mode area fields in Section 11 (e.g., `d_86` walls AG area), Section 12's calculated area fields (`d_101`, `d_102`, `d_104`) update in the **Target** mode but **NOT** in Reference mode. The calculations run correctly in the background, but the DOM display doesn't refresh to show the updated Reference values.

## Investigation Results

### A) Is the area write from S11 when in Reference mode, actually a mode-aware write?

**YES** ✅ - S11 correctly writes `ref_d_86` to StateManager when in Reference mode.

**Evidence**: [Section11.js:466-508](../../../src/sections/Section11.js#L466-L508)

```javascript
setValue: function (fieldId, value, source = "user") {
  this.getCurrentState().setValue(fieldId, value, source);

  if (this.currentMode === "target") {
    window.TEUI.StateManager.setValue(fieldId, value, writeSource);
  } else if (this.currentMode === "reference") {
    window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, writeSource);  // ✅ CORRECT
  }
}
```

### B) Does S12 trigger a DOM refresh for the d_101, d_102 area value changes?

**PARTIALLY** ❌ - S12 triggers calculations but NOT correct DOM refresh.

**The Flow**:
1. ✅ S11 writes `ref_d_86` to StateManager ([Section11.js:508](../../../src/sections/Section11.js#L508))
2. ✅ S12 listener fires (correctly added at [Section12.js:3292-3305](../../../src/sections/Section12.js#L3292-L3305))
3. ✅ `calculateAll()` runs → `calculateReferenceModel()` → `calculateVolumeMetrics(true)`
4. ✅ `setCalculatedValue()` writes `ref_d_101`, `ref_d_102` to StateManager ([Section12.js:1445-1449](../../../src/sections/Section12.js#L1445-L1449))
5. ❌ **BUT**: `setCalculatedValue()` with `isReferenceCalculation=true` **skips DOM update** ([Section12.js:1474-1491](../../../src/sections/Section12.js#L1474-L1491))
6. ❌ `ModeManager.updateCalculatedDisplayValues()` is called at [Section12.js:2818](../../../src/sections/Section12.js#L2818), but reads **wrong values** because it checks S12's local `currentMode` instead of global Reference toggle

### C) Is the Reference flow (broken) following the Target flow (working) pattern?

**NO** ❌ - Critical difference in mode awareness.

**Target Flow (Working)**:
1. Edit `d_86` in Target mode
2. S11 writes `d_86` to StateManager
3. S12 listener fires → `calculateAll()` → `calculateTargetModel()`
4. `setCalculatedValue("d_101", value, format, false)` writes to StateManager **AND updates DOM immediately** ✅
5. DOM shows updated value ✅

**Reference Flow (Broken)**:
1. Edit `d_86` in Reference mode
2. S11 writes `ref_d_86` to StateManager
3. S12 listener fires → `calculateAll()` → `calculateReferenceModel()`
4. `setCalculatedValue("d_101", value, format, true)` writes `ref_d_101` to StateManager **BUT skips DOM update** ([Section12.js:1474](../../../src/sections/Section12.js#L1474))
5. `ModeManager.updateCalculatedDisplayValues()` runs ([Section12.js:2818](../../../src/sections/Section12.js#L2818))
6. ❌ **BUT**: Checks `this.currentMode` at [Section12.js:298](../../../src/sections/Section12.js#L298), which is S12's **local** `ModeManager.currentMode`
7. ❌ S12's `currentMode` defaults to `"target"` and is **never synchronized with global Reference toggle**
8. ❌ Reads `d_101` (Target value) instead of `ref_d_101` (Reference value)
9. ❌ DOM shows stale Target value instead of updated Reference value

## Root Cause

**S12's `ModeManager.currentMode` is not synchronized with the global `window.TEUI.ReferenceToggle.isReferenceMode()` state.**

At [Section12.js:214](../../../src/sections/Section12.js#L214), S12's `ModeManager.currentMode` defaults to `"target"` and is never updated when the global Reference toggle changes. When `updateCalculatedDisplayValues()` checks `this.currentMode` at line 298, it always sees `"target"`, so it reads unprefixed values (`d_101`) instead of Reference values (`ref_d_101`).

## Architectural Compliance

Per **4012-CHEATSHEET.md**:

### Anti-Pattern 1: State Contamination via Fallbacks
- **S12's issue**: Not using fallbacks, but **reading wrong namespace** due to local mode not syncing with global state
- **Compliance**: Should read **ONLY** `ref_d_101` in Reference mode, **ONLY** `d_101` in Target mode

### Core Principle: State Sovereignty
- **S11 compliance**: ✅ Correctly publishes `ref_d_86` when in Reference mode
- **S12 non-compliance**: ❌ Reads from wrong state namespace due to local/global mode mismatch

## Solution Options

### Option 1: Read Global Reference Toggle State Directly (RECOMMENDED)

**Rationale**: Most performant and architecturally sound. Eliminates need for S12 to maintain local mode state.

```javascript
// Section12.js:245 - updateCalculatedDisplayValues()
updateCalculatedDisplayValues: function () {
  if (!window.TEUI?.StateManager) return;

  // ✅ FIX: Read global Reference toggle state, not local currentMode
  const isReferenceMode = window.TEUI?.ReferenceToggle?.isReferenceMode?.() || false;

  const calculatedFields = ["d_101", "d_102", "d_104", /* ... */];

  calculatedFields.forEach(fieldId => {
    let valueToDisplay;

    if (isReferenceMode) {  // ✅ Changed from this.currentMode === "reference"
      valueToDisplay = window.TEUI.StateManager.getValue(`ref_${fieldId}`);
      if (valueToDisplay === null || valueToDisplay === undefined) {
        valueToDisplay = "0"; // Safe default, NEVER fallback to Target
      }
    } else {
      valueToDisplay = window.TEUI.StateManager.getValue(fieldId);
    }

    // ... rest of display logic
  });
}
```

**Advantages**:
- ✅ Single source of truth (global Reference toggle)
- ✅ No need to sync S12's local state
- ✅ Matches pattern used in S11 (see commented line 3247)
- ✅ Minimal code change
- ✅ No additional listeners needed

### Option 2: Sync Local ModeManager with Global Toggle

**Rationale**: Maintains architectural consistency if S12 needs local mode state for other purposes.

```javascript
// Section12.js - Add in addStateManagerListeners() or initialization
if (window.TEUI?.ReferenceToggle) {
  window.TEUI.ReferenceToggle.addListener((isReference) => {
    ModeManager.currentMode = isReference ? "reference" : "target";
    ModeManager.updateCalculatedDisplayValues();
  });
}
```

**Disadvantages**:
- ❌ Adds complexity (listener management)
- ❌ Requires ReferenceToggle to expose listener API
- ❌ More state to maintain and debug

## Recommendation

**Implement Option 1** - Read global state directly in `updateCalculatedDisplayValues()`.

### Justification:
1. **Simplest fix** - Single line change
2. **Most reliable** - No state synchronization needed
3. **Architecturally sound** - Single source of truth principle
4. **Proven pattern** - S11 uses same approach (line 3247 comment shows awareness of global state)
5. **Performance** - No additional listeners, no state sync overhead

## Testing Protocol

After implementing fix:

1. **Load app** → Verify Target mode shows correct values
2. **Switch to Reference mode** → Verify display updates to Reference values
3. **Edit `d_86` in Reference mode** → Verify `d_101`, `d_102`, `d_104` update in display
4. **Switch back to Target mode** → Verify Target values unchanged (state isolation)
5. **Edit `d_86` in Target mode** → Verify Target `d_101`, `d_102`, `d_104` update

## Success Criteria

✅ Reference mode area edits in S11 immediately update S12 area displays
✅ Target mode area edits work as before (no regression)
✅ Perfect state isolation maintained (Reference changes don't affect Target display)
✅ No console errors or warnings
✅ No calculation storms or performance issues

## Related Commits

- `b982b1d` - Added Reference area listeners to S12 (fixed listener issue, but not DOM update)
- Reference: CHEATSHEET Anti-Pattern 1 (State Contamination via Fallbacks)
- Reference: CHEATSHEET Section on Mode-Aware DOM Updates

## Files Affected

- `src/sections/Section12.js` - Line 298 in `updateCalculatedDisplayValues()` function
