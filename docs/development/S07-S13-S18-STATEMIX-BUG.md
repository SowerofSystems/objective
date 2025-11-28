#### CRITICAL BUG: S07 UI Corruption During Reference Mode Display

**Discovered**: 2025-11-27
**Priority**: HIGH
**Affects**: Target model calculations after S18 Decarbonize + Reference mode toggle
**Root Cause**: Section07.refreshUI() updates Target UI elements when in Reference viewing mode

---

## Summary

**Architecture Context**:
- **S01**: State-agnostic (always displays both Target and Reference values side-by-side)
- **S07**: Dual-mode Pattern A section (single UI that switches between Target/Reference states)
- **S18**: State-agnostic (parallel coordinates graph displays both Target and Reference lines simultaneously)

**Trigger Pattern**:
1. Import file with Gas system (sets `d_51="Gas"`, `k_52=0.94` for both Target and Reference)
2. Click S18 "Decarbonize" button (converts Target to `d_51="Heatpump"`, `d_52=300`)
3. Toggle global mode to Reference (S07 UI shows Reference state: `d_51="Gas"`)
4. Click S18 "Refresh Graph" in Reference viewing mode
5. **BUG**: Target line in S18 graph nosedives below 0 (displays at ~9000% instead of 300%)
6. Toggle back to Target mode
7. **BUG**: Target `h_10` value has changed (should remain stable at 248.9, shows 167.0 instead)

**Key Insight**: Manual user edits in S07 do NOT cause state mixing. Only S18 operations trigger the bug. This proves the issue is in how S18 reads/writes values, not in S07's core logic.

---

## Root Cause Analysis

### The Bug: S07.refreshUI() Corrupts Target UI During Reference Mode

**Location**: [Section07.js:197-323](../../src/sections/Section07.js#L197-L323)

When Section07 switches to Reference viewing mode, `refreshUI()` performs these steps:

```javascript
// Line 203-208: Get field IDs and read from correct state
const fields = getFields(); // Returns unprefixed IDs: "d_51", "d_52", etc.
Object.keys(fields).forEach(fieldId => {
  const currentState = this.currentMode === "target" ? TargetState : ReferenceState;
  const storedValue = currentState.getValue(fieldId); // ✅ Reads from ReferenceState
  const element = document.querySelector(`[data-field-id="${fieldId}"]`); // ❌ Selects Target UI element!
```

**The Critical Flaw**:
1. When `currentMode="reference"`, code reads from `ReferenceState.getValue("d_51")` → gets "Gas"
2. Selects UI element using `[data-field-id="d_51"]` → **finds the Target UI dropdown**
3. Updates dropdown: `targetElement.value = "Gas"` → **overwrites Target UI to show "Gas"**

**Result**: The physical d_51 dropdown on screen now shows "Gas" even though Target state still has "Heatpump" in StateManager!

### Evidence from Logs (Line 12369-12371)

```
[S07] refreshUI: fieldId=d_51, default=Heatpump, valueToShow=Gas, elementType=SELECT
[S07] refreshUI: Setting dropdown d_51 from "Heatpump" to "Gas" (mode=reference)
[S07] refreshUI: Dropdown d_51 now shows "Gas"
```

When in Reference mode, S07 correctly reads Reference value ("Gas") but **incorrectly updates the Target UI element**.

### The Cascade: How UI Corruption Breaks S18 Graph

**S18 Graph Reading Logic** ([pcConfig.js:251-324](../../src/core/pcConfig.js#L251-L324)):

When S18 refreshes the graph in Reference viewing mode, it reads values for BOTH lines:
- **Target line (blue)**: Calls `getAxisValue(axis, "target")`
- **Reference line (red)**: Calls `getAxisValue(axis, "reference")`

For Target SHW efficiency, pcConfig performs:

```javascript
// Line 284: Read Target system type to determine which efficiency field to use
const selectorField = "d_51"; // mode="target"
const selectorValue = stateManager.getValue("d_51");
```

**The Problem**: After S07.refreshUI() corrupted the d_51 dropdown UI to show "Gas", when the user toggled to Reference mode:

**Evidence from Logs (Line 12501-12505)**:
```
[pcConfig] getAxisValue: axis="shw_efficiency", mode="target"
  selectorField="d_51", selectorValue="Gas"    ← ❌ WRONG! Should be "Heatpump"!
  primaryField="d_52", altField="k_52"
  fieldToUse="k_52", rawValue="90", multiplier=100
  → RETURN: 9000                                ← Target line shows 9000% instead of 300%
```

**Why This Happened**: S07's dropdown corruption likely triggered a change event that wrote "Gas" back to StateManager, or StateManager is somehow reading from the corrupted DOM.

---

## What We've Ruled Out

### ✅ NOT the Issue: Import Logic
- File import has worked correctly for 8+ months
- Diagnostic logging shows import sets correct values
- Both Target and Reference states populated properly after import

### ✅ NOT the Issue: S01 Display
- S01 is state-agnostic and correctly displays whatever StateManager provides
- S01 does not perform calculations that would cause state mixing
- h_10 changes are a **symptom**, not the cause

### ✅ NOT the Issue: S18 Decarbonize Write Logic
- Diagnostic logging shows Decarbonize correctly sets:
  - `d_51 = "Heatpump"` ✅
  - `d_52 = "300"` ✅
  - Reference state unchanged ✅
- The Decarbonize function itself works perfectly

### ✅ NOT the Issue: pcConfig.js Field Selection
- Axis value reading logic is correct
- Properly uses mode parameter to select Target vs Reference fields
- Correctly implements conditional logic (COP vs AFUE based on system type)
- **Evidence**: When d_51 correctly reads "Heatpump", graph displays 300% properly (Log line 13172-13176)

### ✅ NOT the Issue: Manual User Edits in S07
- User manually changing d_51 from "Gas" to "Heatpump" does NOT cause h_10 state mixing
- Proves S07's calculation and state management logic is sound
- Only S18 operations trigger the bug

---

## The Real Problem: S07 Has No Separate Reference UI Elements

**S07 Architecture** (Pattern A - Dual Mode Section):
- Single set of UI elements with unprefixed field IDs (`d_51`, `d_52`, `k_52`)
- No separate Reference UI (no `ref_d_51` dropdowns in HTML)
- UI switches between displaying Target and Reference **states** using the same elements

**This is CORRECT for Pattern A sections!** The bug is in the implementation, not the pattern.

**The Fix Needed**: Section07.refreshUI() must NOT query/update UI elements during Reference mode because:
1. S07 is a dual-mode section - when in Reference mode, the UI should display Reference values
2. Updating the UI dropdown is correct for displaying Reference values
3. **BUT** this should not trigger writes back to StateManager
4. **AND** S18 should not be reading StateManager values that were corrupted by UI updates

---

## Diagnostic Evidence

### Test: Axis Read Logging (2025-11-28)

**Enable Logging**:
```javascript
window.TEUI_DEBUG_AXIS_READS = true
```

**Results When Working Correctly** (Target mode, Log 13172-13176):
```
[pcConfig] getAxisValue: axis="shw_efficiency", mode="target"
  selectorField="d_51", selectorValue="Heatpump"  ✅
  primaryField="d_52", altField="k_52"
  fieldToUse="d_52", rawValue="300"               ✅
  → RETURN: 300                                   ✅
```

**Results When Bug Occurs** (Reference mode viewing, Log 12501-12505):
```
[pcConfig] getAxisValue: axis="shw_efficiency", mode="target"
  selectorField="d_51", selectorValue="Gas"       ❌ Should be "Heatpump"
  primaryField="d_52", altField="k_52"
  fieldToUse="k_52", rawValue="90"                ❌ Wrong field selected
  → RETURN: 9000                                  ❌ 10x multiplier error
```

**Conclusion**: StateManager.getValue("d_51") returns "Gas" instead of "Heatpump" after S07 switches to Reference mode.

### Test: S07 RefreshUI Logging (2025-11-28)

**When Switching to Reference Mode** (Log 12369-12390):
```
[S07] refreshUI: fieldId=d_51, valueToShow=Gas
[S07] refreshUI: Setting dropdown d_51 from "Heatpump" to "Gas" (mode=reference)
[S07] refreshUI: Dropdown d_51 now shows "Gas"
[S07] refreshUI: Setting slider d_52 = "94"
[S07] refreshUI: Updating d_52 slider range for system="Gas"
```

**Problem Identified**:
- Line 12370 shows d_51 dropdown changing from "Heatpump" to "Gas"
- This is correct for **displaying** Reference state
- But the physical dropdown is the **Target UI element** (no separate ref_d_51 dropdown exists)
- Line 12389 shows slider range changing to Gas range (50-98 instead of 100-450)

---

## Leading Theory: Dropdown Change Event Triggers StateManager Write

**Hypothesis**: When S07.refreshUI() sets `dropdown.value = "Gas"` (line 259), this triggers the dropdown's change event listener, which writes "Gas" back to StateManager.

**Evidence Needed**:
1. Check if dropdown change listeners are disabled during refreshUI()
2. Check if there's a guard to prevent writes during programmatic value changes
3. Verify StateManager doesn't read from DOM elements

**Code to Investigate**:
- [Section07.js:1733](../../src/sections/Section07.js#L1733): `dropdown.addEventListener("change", handleGenericDropdownChange)`
- [Section07.js:1534-1549](../../src/sections/Section07.js#L1534-L1549): `handleGenericDropdownChange` function
- Line 1549: `ModeManager.setValue(fieldId, value, "user-modified")` - Does this fire when refreshUI() changes dropdown?

---

## Next Steps

### 1. Prevent Dropdown Events During RefreshUI

Add a flag to disable event handlers during programmatic UI updates:

```javascript
// Section07.js - Add to refreshUI()
this._isRefreshing = true; // Set flag before UI updates

// In handleGenericDropdownChange
if (this._isRefreshing) {
  return; // Skip handler during programmatic refresh
}
```

### 2. Verify StateManager Isolation

Ensure StateManager never reads from DOM:
- Audit all `StateManager.getValue()` calls
- Confirm values only come from internal state storage (localStorage/memory)

### 3. Fix S18 to Read Directly from StateManager

Ensure pcConfig.js never reads from section states:
- Already correctly uses `stateManager.getValue(selectorField)` (line 284)
- Verify stateManager is the global StateManager, not section-local state

### 4. Consider Event Listener Cleanup

Review if dropdown event listeners should be removed/re-added during mode switches:
```javascript
// Disable during refresh
dropdown.removeEventListener("change", handleGenericDropdownChange);

// Re-enable after refresh
dropdown.addEventListener("change", handleGenericDropdownChange);
```

---

## References

- **Section07 refreshUI**: [Section07.js:197-323](../../src/sections/Section07.js#L197-L323)
- **Dropdown Change Handler**: [Section07.js:1534-1549](../../src/sections/Section07.js#L1534-L1549)
- **S18 Axis Value Reading**: [pcConfig.js:251-324](../../src/core/pcConfig.js#L251-L324)
- **S18 Decarbonize Function**: [ParallelCoordinates.js:1406-1637](../../src/core/ParallelCoordinates.js#L1406-L1637)
- **Test Logs**: [Logs.md:12369-12505](../Logs.md#L12369-L12505)
