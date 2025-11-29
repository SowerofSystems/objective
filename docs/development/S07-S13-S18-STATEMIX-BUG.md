#### CRITICAL BUG: State Mixing After S18 Decarbonize - S13 d_113 Field

**Discovered**: 2025-11-27
**Updated**: 2025-11-29 - Isolated to S13 d_113 field
**Priority**: HIGH
**Affects**: Target model calculations after S18 Decarbonize + Reference mode toggle
**Root Cause**: S18 Decarbonize value-setting for S13 d_113 (Heating System) field

---

## BREAKTHROUGH: Bug Isolated to ONE Field

After extensive testing with multiple Excel files:
- ✅ Most Gas→Heatpump imports + Decarbonize work perfectly
- ❌ ONE specific file exhibits state mixing
- 🎯 **Root cause**: The `d_113` (Primary Heating System) field value in that specific file

**The smoking gun**: When that file's d_113 value is imported, then S18 Decarbonize changes it to "Heatpump", the state mixing bug occurs. With other files' d_113 values, no bug!

---

## Summary

**Architecture Context**:
- **S01**: State-agnostic (always displays both Target and Reference values side-by-side)
- **S07**: Dual-mode Pattern A section (SHW system - NOT THE ISSUE)
- **S13**: Dual-mode Pattern A section (Heating/Cooling systems - **ISSUE LOCATION**)
- **S18**: State-agnostic (parallel coordinates graph displays both Target and Reference lines simultaneously)

**Trigger Pattern**:
1. Import **specific** Excel file with Gas heating system (sets `d_113="Gas"`, `ref_d_113="Gas"`)
2. Click S18 "Decarbonize" button (converts Target to `d_113="Heatpump"`, `f_113="12.5"`)
3. Toggle global mode to Reference
4. Toggle back to Target mode
5. **BUG**: Target `h_10` value oscillates between 248.9 and 167.0 on each toggle

**Key Discovery**:
- Bug does NOT occur with other Gas building files!
- Bug is specific to how ONE file's d_113 data interacts with S18 Decarbonize
- S07 fields (d_51, d_52) are NOT the issue - they work correctly in all files
- S13 fields (d_113, f_113, j_115) are the issue

---

## The Specific Bug Pattern

### S13 Field Structure

**Heating System Selector**: `d_113` / `ref_d_113`
- Values: "Gas", "Oil", "Heatpump", "Electric", etc.

**Conditional Efficiency Fields** (selected based on d_113):
- `f_113`: HSPF for Heatpump/Electric systems (e.g., 12.5)
- `j_115`: AFUE for Gas/Oil systems (e.g., 0.90)

**Similar to S07 pattern**:
- d_51 selector determines whether to use d_52 (COP) or k_52 (AFUE)
- d_113 selector determines whether to use f_113 (HSPF) or j_115 (AFUE)

### What S18 Decarbonize Does

When converting heating from Gas → Heatpump:

```javascript
// Step 1: Set fuel type to Heatpump
if (sect13?.TargetState) {
  sect13.TargetState.setValue("d_113", "Heatpump");
}
stateManager.setValue("d_113", "Heatpump", "user-modified");

// Step 2: Let section recalculate
if (sect13?.calculateAll) {
  sect13.calculateAll();
}

// Step 3: Set efficiency (f_113 is now the active field for Heatpump)
if (sect13?.TargetState) {
  sect13.TargetState.setValue("f_113", "12.5");
}
stateManager.setValue("f_113", "12.5", "user-modified");
```

**The issue**: Something about how this specific file's d_113 value is stored/handled causes the Target model to use Reference efficiency values during subsequent calculations.

---

## 🔥 BREAKTHROUGH: Field Lock Issue Identified (2025-11-29)

**Root Cause Hypothesis**: j_115 field remains locked/non-editable after S18 Decarbonize

### The Problem Sequence

1. **Import file** with d_113="Gas" and j_115=0.90
   - After import, j_115 field is **locked/non-editable** (user cannot change it)
   - This is correct for the initial import state

2. **Manual d_113 change works correctly**:
   - User manually changes d_113 dropdown from "Heatpump" to "Gas" in S13 UI
   - Dropdown change event fires
   - j_115 field **becomes editable** ✅ (correct behavior)
   - f_113 field becomes disabled
   - This is the expected UI behavior

3. **S18 Decarbonize d_113 change fails**:
   - S18 uses `stateManager.setValue("d_113", "Heatpump")` to bypass UI
   - **No dropdown change event fires** ❌
   - j_115 field **remains locked/non-editable** ❌ (BUG!)
   - f_113 field does not become properly enabled
   - State says d_113="Heatpump" but UI field lock states haven't updated

### Why This Causes State Mixing

**The calculation error cascade**:

1. S18 Decarbonize sets d_113="Heatpump" and f_113="12.5" in StateManager ✅
2. But j_115 field remains locked/disabled in the UI ❌
3. When calculations run and check which efficiency field to use:
   - d_113="Heatpump" → should use f_113 (HSPF 12.5, COP 3.66)
   - But f_113 field is still disabled/locked ❌
   - Falls back to reading j_115=0.90 (Gas AFUE) ❌
4. Result: Target model calculates with Gas efficiency instead of Heatpump efficiency
5. This manifests as:
   - h_10 = 167.0 instead of 248.9 (wrong carbon intensity)
   - j_32 = 1.86M instead of 2.78M (wrong energy consumption)

**Key insight**: The bug is not about StateManager values being wrong. The StateManager has the correct values! The bug is that **UI field lock states** (contenteditable/disabled attributes) don't update when S18 writes directly to StateManager, causing calculation logic to read from the wrong efficiency field.

### Comparison: Manual vs S18 Changes

| Action | d_113 Write Method | Dropdown Event? | j_115 Lock State | Result |
|--------|-------------------|-----------------|------------------|--------|
| **User manual edit** | Dropdown change → event handler → StateManager | ✅ Fires | ✅ Updates correctly | ✅ Works |
| **S18 Decarbonize** | S18 → StateManager.setValue() directly | ❌ Bypassed | ❌ Stuck in old state | ❌ Bug |

### The Fix Direction

**S18 Decarbonize needs to trigger UI field lock updates** after setValue():

Option A: Trigger the dropdown change event programmatically
Option B: Call S13's field enable/disable logic directly
Option C: Have StateManager notify UI of changes (observer pattern)

The next agent should investigate Section13.js to understand:
1. How dropdown changes trigger field lock updates
2. What function controls j_115/f_113 enable/disable logic
3. How to call that logic from S18 after Decarbonize setValue()

---

## Investigation Focus: S18 Value-Setting

### Questions to Answer

1. **What's different about the problematic file's d_113 value?**
   - Is it stored as a string vs number?
   - Are there hidden characters or formatting issues?
   - Does it have a different data type in localStorage?

2. **How does S18 write to both TargetState AND StateManager?**
   - Does this double-write cause a sync issue?
   - Should S18 only write to StateManager (like manual edits do)?
   - Is the order of writes critical?

3. **Why does the bug only appear AFTER mode toggle?**
   - What happens during mode toggle that reads/writes d_113?
   - Does S13.refreshUI() have similar issues to S07 (which we ruled out)?
   - Are dropdown change events firing during mode switch?

4. **How does S13 select between f_113 (HSPF) and j_115 (AFUE)?**
   - Is the field selection logic correct?
   - Does it check d_113 or ref_d_113 when calculating Target values?
   - Could there be a condition where it reads the wrong selector?

---

## What We've Ruled Out

### ✅ NOT the Issue: Import Logic
- File import has worked correctly for 8+ months
- Diagnostic logging shows import sets correct values
- Both Target and Reference states populated properly after import
- **Multiple other files import and work perfectly**

### ✅ NOT the Issue: S01 Display
- S01 is state-agnostic and correctly displays whatever StateManager provides
- S01 does not perform calculations that would cause state mixing
- h_10 changes are a **symptom**, not the cause

### ✅ NOT the Issue: S07 (SHW System)
- Extensive testing shows S07 works correctly
- Multiple Gas→Heatpump files convert d_51 correctly
- S07.refreshUI() does not cause the bug (we tested with and without fixes)
- Manual user edits in S07 do NOT cause state mixing

### ✅ NOT the Issue: S18 Decarbonize Write Logic (Generally)
- Diagnostic logging shows Decarbonize correctly sets values
- Reference state remains unchanged ✅
- **Works correctly with most files** - only fails with ONE file
- The pattern of writes (TargetState + StateManager) is consistent across all files

### ✅ NOT the Issue: pcConfig.js Field Selection
- Axis value reading logic is correct
- Properly uses mode parameter to select Target vs Reference fields
- Correctly implements conditional logic (COP vs AFUE based on system type)
- **Works correctly when StateManager has correct values**

---

## Diagnostic Evidence

### Test Results Summary

**Files Tested**: 5+ different Gas building files
**Result**:
- 4 files: ✅ No state mixing after Decarbonize + mode toggle
- 1 file: ❌ State mixing occurs (h_10 oscillates 248.9 ↔ 167.0)

**Specific Field Identified**: `d_113` (Primary Heating System)

### Logs from Problematic File

**After Decarbonize (Target mode):**
```
h_10 = 248.90516122530227 ✅
j_32 = 2779523.9354029503 ✅ (Target energy - Heatpump efficiency)
```

**After Toggle to Reference, then back to Target:**
```
h_10 = 166.98456781056296 ❌ WRONG!
j_32 = 1864716.6687405566 ❌ Target energy CHANGED!
```

**The calculation error**: Target j_32 drops by ~900k, suggesting Target calculations are using Gas efficiency (0.90) instead of Heatpump efficiency (HSPF 12.5 / COP 3.66).

---

## Investigation Tasks

### 1. Compare d_113 Values Across Files

**Action**: Export and compare the actual stored values
```javascript
// In problematic file
console.log("d_113 type:", typeof stateManager.getValue("d_113"));
console.log("d_113 value:", JSON.stringify(stateManager.getValue("d_113")));
console.log("d_113 from localStorage:", localStorage.getItem("d_113"));

// In working file
// ... same checks
```

**Look for**:
- String vs number differences
- Hidden characters
- Encoding issues
- Unexpected data types

### 2. Add S13-Specific Diagnostic Logging

**Location**: Section13.js calculation functions

**What to log**:
- Which efficiency field is being selected (f_113 vs j_115)
- Value of d_113 when making the selection
- Whether calculation is for Target or Reference model
- Any conditional logic that switches between fields

### 3. Trace S18 Decarbonize Write Sequence for d_113

**Monitor**:
1. TargetState.setValue("d_113", "Heatpump") - does this succeed?
2. StateManager.setValue("d_113", "Heatpump") - does this succeed?
3. Are both writes synchronous?
4. Does calculateAll() run before both writes complete?
5. What is the actual value in StateManager immediately after?

### 4. Check S13 refreshUI() During Mode Toggle

**Similar to S07 investigation**:
- Does S13.refreshUI() update dropdown programmatically?
- Do dropdown change events fire during mode switch?
- Could this trigger unwanted calculations?

---

## Next Steps

1. **Isolate the d_113 data difference** between working and failing files
2. **Add S13 diagnostic logging** similar to what we added for S07
3. **Monitor S18 Decarbonize** specifically for d_113/f_113/j_115 writes
4. **Test hypothesis**: Is S18 writing to TargetState causing a sync issue with StateManager?

---

## Files to Investigate

### Primary Focus
- **src/sections/Section13.js** - Heating/Cooling calculations
  - ModeManager.getValue() / setValue()
  - Field selection logic for f_113 vs j_115
  - refreshUI() - does it have same issue as S07?

- **src/core/ParallelCoordinates.js** - S18 Decarbonize button
  - Lines 1520-1570: Heating system conversion
  - Double-write pattern (TargetState + StateManager)
  - calculateAll() timing

### Supporting Files
- **src/core/pcConfig.js** - Graph axis value reading
  - heating_efficiency axis configuration
  - Field selection based on d_113

- **src/core/StateManager.js** - Global state storage
  - getValue() / setValue() implementation
  - localStorage sync timing

---

## References

- **S13 Heating Conversion**: [ParallelCoordinates.js:1520-1570](../../src/core/ParallelCoordinates.js#L1520-L1570)
- **S13 Section Code**: [Section13.js](../../src/sections/Section13.js)
- **Graph Heating Efficiency**: [pcConfig.js](../../src/core/pcConfig.js)
- **Test Logs**: [Logs.md](../Logs.md)
