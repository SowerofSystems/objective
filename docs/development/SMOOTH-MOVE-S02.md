# SMOOTH-MOVE-S02: Eliminate Circular Calculation Cascade from d_13 Changes

**Status:** Ready for Implementation
**Priority:** High - Performance Issue
**Date:** 2025-11-20
**Branch:** G-REF-ONLY

---

## Problem Statement

### Symptom
When the user changes the building standard dropdown (d_13 in Section02), the application generates **~35,000 lines of console logs** before the user even presses the "Set Values" button. This represents approximately **48 complete recalculation cycles** cascading through the entire section hierarchy.

### Root Cause
A **circular listener feedback loop** is triggered by d_13 changes:

1. User changes **d_13** (Section02 dropdown)
2. **Section09** listener fires immediately → recalculates plug loads based on PH detection
3. **Section03** listener fires immediately → recalculates h_23 (Tset Heating) based on PH detection
4. S09 publishes values → triggers **S10** listeners
5. S10 recalculates → publishes `ref_m_121` → triggers **Section14**
6. Section14 calculates → publishes `ref_d_122` (cooling energy)
7. **Section14's own listener for `ref_d_122`** fires (line 1445) → triggers **Section13**
8. Section13 recalculates → triggers **Cooling module** (both reference and target)
9. Cooling publishes results → **triggers Section14 AGAIN**
10. Section14 → Section10 → Section09 → **Back to step 2**

This loop repeats **48 times** until values converge and stop triggering change detection.

### Key Metrics from Logs.md
- **Total lines:** 42,466
- **Lines after initialization:** ~37,000 (from single d_13 change)
- **`calculateAll` calls:** 5,017
- **`handleSectionDropdownChange` invocations:** 48
- **Section14 `ref_d_122` listener fires:** 122 times
- **Each cycle:** ~800-1000 lines of stack traces

### Current Problematic Listeners

**Section03.js lines 2526-2529:**
```javascript
// ❌ PROBLEM: Immediate calculation on d_13 change
window.TEUI.StateManager.addListener("d_13", function () {
  calculateAll(); // Triggers h_23 PH override logic
});
```

**Section03.js lines 2533-2536:**
```javascript
// ❌ PROBLEM: Immediate calculation on ref_d_13 change
window.TEUI.StateManager.addListener("ref_d_13", function () {
  calculateAll(); // Triggers ref_h_23 PH override logic
});
```

**Section09.js lines 2433-2437:**
```javascript
// ❌ PROBLEM: Immediate calculation on d_13 change
sm.addListener("d_13", () => {
  calculateTargetModel(); // Triggers d_65/d_66 PH plug load logic
  updateAllReferenceIndicators();
  ModeManager.updateCalculatedDisplayValues();
});
```

**Section09.js lines 2441-2444:**
```javascript
// ❌ PROBLEM: Immediate calculation on ref_d_13 change
sm.addListener("ref_d_13", () => {
  calculateReferenceModel(); // Triggers PH plug load recalculation
  ModeManager.updateCalculatedDisplayValues();
});
```

---

## Analysis

### Why This Happens

**Section02** is correctly implemented - it has NO listeners causing this issue. The problem is that **Section03 and Section09 immediately react to d_13 changes** to apply Passive House (PH) standard-specific logic:

- **Section03:** Sets h_23 (Tset Heating) to 20°C when "PH" is detected in d_13 standard name
- **Section09:** Sets d_65/d_66 plug loads to 2.1 W/m² when "PH" is detected in d_13 standard name

These immediate calculations cascade through downstream sections (S10, S13, S14, Cooling) before the user presses "Set Values", creating unnecessary churn.

### Why Section02 is Not the Problem

Looking at Section02.js:
- Line 1010: `ModeManager.setValue(fieldId, selectedValue, "user-modified")` - Sets d_13 value
- Line 1013: `calculateAll()` - Triggers one calculation (expected)
- **No listeners registered** in `registerCalculations()` function (lines 685-716)

Section02 does NOT listen to its own values or to downstream cooling calculations (`ref_d_122`). This is correct architecture.

### Existing Solution: Import Quarantine Pattern

**FileHandler.js** already implements a proven pattern (lines 154-190) for bulk value updates without triggering cascading calculations:

```javascript
// 🔒 START IMPORT QUARANTINE - Mute listeners
window.TEUI.StateManager.muteListeners();

try {
  // Write ALL values without triggering listeners
  this.updateStateFromImportData(importedData, 0, false);
  // ... more writes ...
} finally {
  // 🔓 END IMPORT QUARANTINE - Always unmute
  window.TEUI.StateManager.unmuteListeners();
}

// NOW trigger clean recalculation with all values loaded
this.calculator.calculateAll();
// Runs 2 rounds: full calculation + DOM refresh
```

This pattern ensures:
1. All values are written atomically without triggering listeners
2. Listeners fire only AFTER all values are in place
3. Predictable 2-round calculation instead of cascading chaos

---

## Solution

### Architectural Approach: Move PH Logic into ReferenceValues.js

The **cleanest architectural solution** is to move ALL standard-specific value overrides into `ReferenceValues.js`, eliminating conditional logic scattered across S03 and S09.

#### Why This Is Superior

1. **Single Source of Truth:** All standard-specific values live in one place (ReferenceValues.js)
2. **No Conditional Logic:** Sections don't need to detect "PH" in standard names
3. **Consistent Pattern:** Uses the existing Import Quarantine workflow
4. **Maintainable:** Adding new standards or modifying PH values is trivial
5. **Predictable:** No listener cascades, just quarantine → unmute → 2-round calc

#### Implementation Strategy

**Add PH-specific values to ReferenceValues.js for all PH standards:**

For each PH standard (e.g., "PH Classic", "PH Low Energy", etc.):
- **h_23:** 20 (Tset Heating in °C)
- **d_65:** 2.1 (Plug load lighting W/m²)
- **d_66:** 2.1 (Plug load equipment W/m²)

For non-PH standards:
- Omit these fields, allowing section defaults to govern

**Remove conditional PH detection logic from:**
- Section03: h_23 PH override calculation
- Section09: d_65/d_66 PH plug load calculations

**Remove d_13/ref_d_13 listeners from:**
- Section03.js lines 2526-2536
- Section09.js lines 2433-2444

#### How It Works

1. User changes **d_13** dropdown → value updates, NO calculations triggered
2. User presses **"Set Values"** button → calls `applyReferenceValuesFromStandard()`
3. FileHandler applies **Import Quarantine:**
   - Mutes listeners
   - Writes ALL values from ReferenceValues.js (including h_23, d_65, d_66 for PH standards)
   - Unmutes listeners
4. Triggers **2-round calculation** with all values in place
5. DOM refreshes with final values

---

## Work Plan

### Phase 1: Update ReferenceValues.js ✅
**Files:** `src/data/ReferenceValues.js`

Add PH-specific values to ALL Passive House standards in the ReferenceValues object:

```javascript
"PH Classic": {
  // ... existing values ...
  h_23: 20,        // Tset Heating (°C) - PH override
  d_65: 2.1,       // Plug load lighting (W/m²) - PH standard
  d_66: 2.1,       // Plug load equipment (W/m²) - PH standard
},
"PH Low Energy": {
  // ... existing values ...
  h_23: 20,
  d_65: 2.1,
  d_66: 2.1,
},
// Repeat for all PH standards...
```

For **non-PH standards**, do NOT add these fields. The sections' default logic will handle them.

**Standards to Update:**
- PH Classic
- PH Low Energy
- PH Plus
- (Any other PH variants in ReferenceValues.js)

---

### Phase 2: Remove S03 PH Conditional Logic ✅
**Files:** `src/sections/Section03.js`

#### Step 2.1: Remove d_13 Listeners
**Location:** Lines 2524-2536

Remove:
```javascript
// ✅ NEW: Listener for d_13 (Target Reference Standard) changes
// Required for PH override logic in h_23 calculation
window.TEUI.StateManager.addListener("d_13", function () {
  calculateAll();
});

// ✅ NEW: Listener for ref_d_13 (Reference Reference Standard) changes
// Required for PH override logic in Reference mode h_23 calculation
window.TEUI.StateManager.addListener("ref_d_13", function () {
  calculateAll();
});
```

#### Step 2.2: Remove PH Override Logic from h_23 Calculation
**Search for:** PH detection logic in h_23 calculation functions

Look for code patterns like:
```javascript
// Check if PH is in the standard name
const standard = getModeAwareGlobalValue("d_13");
if (standard && standard.includes("PH")) {
  h_23 = 20; // PH override
}
```

**Remove** this conditional logic. Let h_23 come from:
- ReferenceValues.js (if PH standard selected)
- Section defaults (if non-PH standard)

---

### Phase 3: Remove S09 PH Conditional Logic ✅
**Files:** `src/sections/Section09.js`

#### Step 3.1: Remove d_13 Listeners
**Location:** Lines 2433-2444

Remove:
```javascript
// ✅ CRITICAL: Keep d_13 listener for Plug/Light/Equipment loads recalculation
sm.addListener("d_13", () => {
  calculateTargetModel();
  updateAllReferenceIndicators();
  ModeManager.updateCalculatedDisplayValues();
});

// ✅ RESTORED: ref_d_13 listener needed for Reference model plug load recalculation
sm.addListener("ref_d_13", () => {
  calculateReferenceModel();
  ModeManager.updateCalculatedDisplayValues();
});
```

#### Step 3.2: Remove PH Plug Load Logic from d_65/d_66 Calculations
**Search for:** PH detection logic in plug load calculations

Look for code patterns like:
```javascript
// Check if PH is in the standard name
const standard = getModeAwareGlobalValue("d_13");
if (standard && standard.includes("PH")) {
  d_65 = 2.1; // PH plug load override
  d_66 = 2.1;
}
```

**Remove** this conditional logic. Let d_65/d_66 come from:
- ReferenceValues.js (if PH standard selected)
- Section defaults (if non-PH standard)

---

### Phase 4: Update Documentation ✅
**Files:**
- `src/sections/Section03.js` (inline comments)
- `src/sections/Section09.js` (inline comments)
- `src/data/ReferenceValues.js` (header comments)

Update comments to reflect the new architecture:

**Section03.js:**
```javascript
/**
 * h_23 (Tset Heating) calculation
 * - For PH standards: Value comes from ReferenceValues.js (20°C)
 * - For non-PH standards: Uses section defaults or climate-based logic
 * - No conditional PH detection needed (handled by "Set Values" button)
 */
```

**Section09.js:**
```javascript
/**
 * d_65/d_66 (Plug loads) calculation
 * - For PH standards: Values come from ReferenceValues.js (2.1 W/m²)
 * - For non-PH standards: Uses section defaults (5-7 W/m²)
 * - No conditional PH detection needed (handled by "Set Values" button)
 */
```

**ReferenceValues.js:**
```javascript
/**
 * ReferenceValues.js
 * Single source of truth for ALL standard-specific value overrides
 *
 * PH Standards include:
 * - h_23: Tset Heating override (20°C)
 * - d_65: Plug load lighting (2.1 W/m²)
 * - d_66: Plug load equipment (2.1 W/m²)
 *
 * Non-PH standards omit these fields, allowing section defaults to govern.
 */
```

---

### Phase 5: Testing & Validation ✅

#### Test 1: d_13 Change Should Be Passive
1. Load app, change d_13 dropdown
2. **Expected:** Dropdown updates, NO console cascade
3. **Check:** Console shows ~5000 lines (initialization only), not 40,000+

#### Test 2: "Set Values" Applies PH Overrides
1. Select "PH Classic" at d_13
2. Press "Set Values" button
3. **Expected:**
   - h_23 = 20°C
   - d_65 = 2.1 W/m²
   - d_66 = 2.1 W/m²
4. **Check:** Values appear in Section03 and Section09, calculations complete in 2 rounds

#### Test 3: Non-PH Standards Use Defaults
1. Select "OBC SB10 5.5-6 Z6" at d_13
2. Press "Set Values" button
3. **Expected:**
   - h_23 = (climate-based default, not 20°C)
   - d_65 = (section default, not 2.1)
   - d_66 = (section default, not 2.1)
4. **Check:** Default logic governs, no PH overrides applied

#### Test 4: Reference Mode Works Identically
1. Switch to Reference mode
2. Select PH standard at ref_d_13
3. Press "Set Values"
4. **Expected:** Same PH overrides apply with `ref_` prefix
5. **Check:** ref_h_23, ref_d_65, ref_d_66 all get PH values

#### Test 5: No Circular Cascade
1. Open browser console
2. Change d_13 from non-PH to PH standard
3. Press "Set Values"
4. **Count:** `calculateAll` invocations should be ≤ 5 (not 5,017!)
5. **Check:** Section14 listener fires once, not 122 times

---

## Expected Outcomes

### Performance Improvements
- **Before:** ~35,000 log lines from single d_13 change
- **After:** ~100 log lines from d_13 change (just dropdown update)
- **Calculation reduction:** From 5,017 calculateAll calls → ~4-5 calls

### Architectural Benefits
1. **Single Source of Truth:** All standard values in ReferenceValues.js
2. **No Listener Cascade:** d_13 changes are passive until "Set Values" pressed
3. **Predictable Calculations:** Import Quarantine → 2 rounds → Done
4. **Maintainable:** Adding new standards = adding entries to ReferenceValues.js
5. **Debuggable:** Console logs are clean and comprehensible

### User Experience
- d_13 dropdown changes are instant (no lag from calculations)
- "Set Values" button triggers single, controlled calculation
- Console remains clean for actual debugging

---

## Rollback Plan

If issues arise, rollback is straightforward:

1. **Restore S03 listeners** (lines 2526-2536)
2. **Restore S09 listeners** (lines 2433-2444)
3. **Restore PH conditional logic** in h_23 and d_65/d_66 calculations
4. **Remove h_23/d_65/d_66** entries from ReferenceValues.js PH standards

All changes are isolated to 3 files, making rollback safe.

---

## Notes

### Why Not Direct StateManager Writes Under Quarantine?

While we COULD write h_23/d_65/d_66 directly to StateManager inside the quarantine using conditional PH detection, this approach is **inferior** because:

1. **Scattered Logic:** PH detection logic remains in S03/S09
2. **Maintenance Burden:** Changing PH values requires editing multiple section files
3. **Inconsistent Pattern:** Mixing ReferenceValues.js overlay with conditional writes
4. **Harder to Debug:** Logic split between FileHandler and section files

Adding PH values to ReferenceValues.js is cleaner, simpler, and more maintainable.

### Alternative: Keep Listeners But Add Debouncing

We considered keeping S03/S09 listeners but adding debouncing/batching to prevent cascades. This was rejected because:

1. Adds complexity (debounce timers, batch queues)
2. Still allows partial cascades during debounce window
3. Doesn't eliminate the architectural issue (scattered PH logic)
4. Harder to reason about timing/race conditions

The ReferenceValues.js approach eliminates the problem at the root.

---

## References

- **Logs.md:** Full console output showing 48-cycle cascade
- **4012-CHEATSHEET.md:** Self-listener anti-pattern documentation
- **FileHandler.js lines 154-190:** Import Quarantine pattern implementation
- **Section02.js lines 1000-1016:** handleBuildingCodeChange (correctly implemented)
- **Section03.js lines 2526-2536:** d_13 listeners to be removed
- **Section09.js lines 2433-2444:** d_13 listeners to be removed

---

## Implementation Checklist

- [ ] Phase 1: Add h_23/d_65/d_66 to PH standards in ReferenceValues.js
- [ ] Phase 2.1: Remove S03 d_13/ref_d_13 listeners (lines 2526-2536)
- [ ] Phase 2.2: Remove S03 h_23 PH conditional logic
- [ ] Phase 3.1: Remove S09 d_13/ref_d_13 listeners (lines 2433-2444)
- [ ] Phase 3.2: Remove S09 d_65/d_66 PH conditional logic
- [ ] Phase 4: Update inline documentation in S03, S09, ReferenceValues.js
- [ ] Phase 5: Run all 5 validation tests
- [ ] Final: Verify console logs show <200 lines for d_13 change (not 35,000+)
- [ ] Final: Confirm "Set Values" applies PH overrides correctly

---

---

## ADDENDUM: h_23 (Tset) State Persistence Bug

**Status:** UNRESOLVED - Shelved for future investigation
**Date:** 2025-11-20
**Severity:** Low (most users won't encounter this workflow)

---

## EXECUTIVE SUMMARY

**THE BUG:**
h_23 (Tset Heating) gets stuck at 18°C when it should be 22°C for Critical Occupancy buildings using non-PH standards.

**REQUIRED BEHAVIOR:**
- IF d_12 = "C-Residential" OR any "Care" occupancy (Critical Occupancy)
- AND d_13 = any NON-PH standard (e.g., "OBC SB10 5.5-6 Z6")
- THEN h_23 MUST = 22°C
- (Currently: h_23 stays stuck at 18°C)

**TRIGGER:**
User changes d_13 standard dropdown AFTER setting d_12 to Critical Occupancy

**WORKAROUND:**
Toggle d_12 dropdown to any value and back to Critical - unsticks h_23

**LIKELY CAUSES:**
1. State mixing: Something reads `ref_d_12` instead of `d_12` during d_13 calculations
2. Fallback logic: Code falls back to "A-Assembly" default when d_12 lookup fails
3. Timing: Section03 calculates before Section02's setValue() propagates

**INVESTIGATION ARTIFACTS:**
- 37,586 line console log showing d_12="A-Assembly" when DOM shows "C-Residential"
- Diagnostic logging in Section03 (lines 2039-2071) - can be removed
- Multiple failed fix attempts in commit history (reverted)

---

### Problem Description (Original)

After removing d_13 listeners, a state persistence bug was discovered where h_23 (Tset Heating) does NOT update correctly when **switching FROM PH standards TO non-PH standards** with Critical Occupancy selected.

**CLARIFICATION:** The issue is NOT that PH standards set h_23 to 18°C (this is correct and intentional). The bug is that when switching AWAY FROM PH to a non-PH standard, h_23 fails to restore occupancy-based logic (Critical Occupancy should get 22°C, not stay stuck at 18°C).

### Bug Scenario

**Steps to Reproduce:**
1. App loads: d_13 = "OBC SB10", d_12 = "A2-Assembly" → h_23 = 18°C ✅
2. User changes to PH: d_13 = "PH Classic" → h_23 = 18°C ✅
3. User changes occupancy: d_12 = "C-Residential" (Critical) → h_23 stays 18°C ✅ (PH overrides, correct)
4. User changes BACK to OBC: d_13 = "OBC SB10 5.5-6 Z6" → h_23 **STAYS 18°C** ❌ (should be 22°C!)

**Expected:** h_23 should update to 22°C in step 4 (Critical Occupancy + non-PH standard = 22°C)
**Actual:** h_23 remains 18°C (stuck at PH value even after switching away from PH)

### Key Observation

**This bug occurs regardless of whether Section02's `handleBuildingCodeChange()` calls `calculateAll()` or not.** The issue persists in both scenarios:
- WITH `calculateAll()`: h_23 doesn't update
- WITHOUT `calculateAll()`: h_23 doesn't update

This suggests the problem is NOT with calculation triggering, but with HOW h_23 is calculated or stored.

### Analysis: How h_23 Works

**Location:** `Section03.js` lines 2033-2065

#### Current Logic in `calculateHeatingSetpoint()`

```javascript
function calculateHeatingSetpoint() {
  const referenceStandard = getModeAwareGlobalValue("d_13");  // Reads from StateManager
  const occupancyType = getModeAwareGlobalValue("d_12");      // Reads from StateManager
  let heatingSetpoint;

  // Priority 1: Check if PH standard
  if (referenceStandard && referenceStandard.toUpperCase().includes("PH")) {
    heatingSetpoint = 18;  // PH always gets 18°C, regardless of occupancy
  } else {
    // Priority 2: Check occupancy type
    if (occupancyType === "C-Residential" || occupancyType.includes("Care")) {
      heatingSetpoint = 22;  // Critical occupancy
    } else {
      heatingSetpoint = 18;  // Other occupancies
    }
  }

  setFieldValue("h_23", heatingSetpoint);  // Write to state
  return heatingSetpoint;
}
```

#### Decision Tree

```
d_13 contains "PH"?
├─ YES → h_23 = 18°C (END, ignore d_12)
└─ NO  → Check d_12
         ├─ Critical Occupancy (Residential/Care) → h_23 = 22°C
         └─ Other Occupancy → h_23 = 18°C
```

### The Logic is CORRECT

The logic in `calculateHeatingSetpoint()` is actually **architecturally sound**:
1. PH standards mandate 18°C regardless of occupancy (matches your ReferenceValues.js approach)
2. Non-PH standards respect occupancy-based code requirements (22°C for Critical, 18°C for others)

### Possible Root Causes

#### Hypothesis 1: `calculateHeatingSetpoint()` Not Being Called
**Test:** Add console.log in `calculateHeatingSetpoint()` when d_13 changes
**Check:** Does it log when switching from PH → OBC?

#### Hypothesis 2: StateManager Read Lag
**Issue:** `getModeAwareGlobalValue("d_13")` might be reading the OLD value (cached)
**Test:** Check what value `referenceStandard` has when switching from PH → OBC
**Symptom:** If it reads "PH Classic" when d_13 has already changed to "OBC SB10", logic would fail

#### Hypothesis 3: Calculation Order Issue
**Issue:** Section03 calculates BEFORE Section02's `setValue()` completes
**Flow:**
1. Section02 dropdown changes
2. Event handler calls `ModeManager.setValue("d_13", "OBC SB10")`
3. Section02 calls `calculateAll()`
4. Section03's `calculateHeatingSetpoint()` runs
5. BUT: Did StateManager finish notifying listeners of d_13 change?

#### Hypothesis 4: Value Overwrite from Another Source
**Issue:** Something ELSE writes h_23 = 18°C AFTER `calculateHeatingSetpoint()` runs
**Candidates:**
- FileHandler applying values from ReferenceValues.js (but shouldn't happen without "Set Values")
- Another section overwriting h_23
- DOM-to-State sync overwriting calculated value

### Investigation Needed

**Add diagnostic logging to trace the issue:**

```javascript
function calculateHeatingSetpoint() {
  const referenceStandard = getModeAwareGlobalValue("d_13");
  const occupancyType = getModeAwareGlobalValue("d_12");

  console.log(`[S03 h_23] CALCULATING: d_13="${referenceStandard}", d_12="${occupancyType}"`);

  let heatingSetpoint;
  if (referenceStandard && referenceStandard.toUpperCase().includes("PH")) {
    heatingSetpoint = 18;
    console.log(`[S03 h_23] PH detected → 18°C`);
  } else {
    if (occupancyType === "C-Residential" || occupancyType.includes("Care")) {
      heatingSetpoint = 22;
      console.log(`[S03 h_23] Critical occupancy → 22°C`);
    } else {
      heatingSetpoint = 18;
      console.log(`[S03 h_23] Other occupancy → 18°C`);
    }
  }

  console.log(`[S03 h_23] SETTING h_23 = ${heatingSetpoint}`);
  setFieldValue("h_23", heatingSetpoint);
  return heatingSetpoint;
}
```

### Expected Console Output (Successful Scenario)

```
User changes d_13 from "PH Classic" to "OBC SB10" with d_12 = "C-Residential":
[S03 h_23] CALCULATING: d_13="OBC SB10 5.5-6 Z6", d_12="C-Residential"
[S03 h_23] Critical occupancy → 22°C
[S03 h_23] SETTING h_23 = 22
```

### Expected Console Output (Bug Scenario)

If Hypothesis 2 is correct (stale read):
```
[S03 h_23] CALCULATING: d_13="PH Classic", d_12="C-Residential"
[S03 h_23] PH detected → 18°C
[S03 h_23] SETTING h_23 = 18
```

### Architectural Implications

This bug reveals a potential flaw in the SMOOTH-MOVE-S02 approach:

**Original Design Assumption:**
- d_13 changes should NOT trigger calculations
- Values come from ReferenceValues.js via "Set Values" button only

**Reality:**
- h_23 MUST respond to BOTH d_13 AND d_12 changes dynamically
- h_23 is NOT just a "standard override" - it's a **calculated field** with business logic
- Removing d_13 calculations may have broken the dynamic recalculation loop

### Potential Solutions

#### Option A: Keep Section02's `calculateAll()` (Current State)
**Pros:**
- h_23 recalculates when d_13 changes (if bug is fixed)
- Dynamic behavior preserved
- No "stuck value" issues

**Cons:**
- Still triggers cascade through sections
- May re-introduce some console noise (though much less than 48 cycles)

#### Option B: Add d_12 Listener to Section03
**Approach:** Listen to d_12 changes specifically to recalculate h_23
**Pros:**
- Targeted recalculation only for occupancy changes
- d_13 remains passive

**Cons:**
- h_23 won't update when switching FROM PH to non-PH (unless d_12 also changes)
- User must change occupancy dropdown to "unstick" h_23

#### Option C: Make h_23 User-Editable with Smart Defaults
**Approach:**
- h_23 becomes editable field (like d_65/d_66)
- Auto-calculates on d_13/d_12 changes
- User can override manually
- "Set Values" applies standard-specific override

**Pros:**
- Maximum flexibility
- User control over Tset
- Clear when value is from standard vs calculated vs user-modified

**Cons:**
- Increases UI complexity
- May confuse users about which value to use

#### Option D: Re-architect h_23 as Pure Lookup (Not Recommended)
**Approach:** h_23 comes ONLY from ReferenceValues.js, no calculation logic
**Pros:**
- Simple, predictable
- Consistent with d_65/d_66 pattern

**Cons:**
- Loses occupancy-based code compliance logic
- Would need separate ReferenceValues entry for EVERY standard × occupancy combination
- Not maintainable (combinatorial explosion)

### Diagnostic Logging Added

**Status:** ✅ Implemented (Section03.js lines 2039-2071)
**Date:** 2025-11-20

Added comprehensive console logging to `calculateHeatingSetpoint()` to trace:
1. What values are read from StateManager (d_13, d_12)
2. Which conditional branch executes (PH vs Critical vs Other)
3. What value is calculated
4. Confirmation that `setFieldValue()` completes

**Log Tags:** All logs use `[S03 h_23 DEBUG]` prefix for easy filtering

### Test Procedure

**To reproduce and diagnose:**
1. Open browser console
2. Filter for: `[S03 h_23 DEBUG]`
3. Perform scenario:
   - Start: d_13 = "OBC SB10", d_12 = "A2-Assembly"
   - Change to: d_13 = "PH Classic"
   - Change to: d_12 = "C-Residential" (Critical)
   - **Change BACK to: d_13 = "OBC SB10 5.5-6 Z6"** ← This is where bug occurs
4. Check console for last `calculateHeatingSetpoint()` call

**Expected Output (if working correctly):**
```
[S03 h_23 DEBUG] CALCULATING: d_13="OBC SB10 5.5-6 Z6", d_12="C-Residential"
[S03 h_23 DEBUG] ✅ Critical occupancy (non-PH) → h_23 = 22°C
[S03 h_23 DEBUG] ⚡ SETTING h_23 = 22
[S03 h_23 DEBUG] ✓ setFieldValue() completed
```

**Bug Symptom (if broken):**
```
[S03 h_23 DEBUG] CALCULATING: d_13="PH Classic", d_12="C-Residential"  ← Stale d_13!
[S03 h_23 DEBUG] ✅ PH standard detected → h_23 = 18°C
[S03 h_23 DEBUG] ⚡ SETTING h_23 = 18
[S03 h_23 DEBUG] ✓ setFieldValue() completed
```

OR no logs at all (function not being called).

### Next Steps

**After testing with diagnostic logs:**

1. **If logs show correct values but h_23 doesn't update in DOM:**
   - Problem is in `setFieldValue()` or StateManager → DOM sync
   - Check if value is in StateManager but DOM not refreshing
   - Fix: Investigate `ModeManager.updateCalculatedDisplayValues()`

2. **If logs show stale d_13 value ("PH Classic" when should be "OBC"):**
   - Problem is StateManager read lag or calculation timing
   - Fix: Add `setTimeout()` or ensure StateManager.setValue completes before calculateAll()

3. **If no logs appear:**
   - Problem is `calculateHeatingSetpoint()` not being called
   - Fix: Ensure Section02's `calculateAll()` triggers Section03 calculations
   - OR: Add listener for d_13 changes specifically in Section03

4. **If logs show h_23 = 22 but then DOM shows 18:**
   - Problem is value overwrite from another source after calculation
   - Check: FileHandler, other sections, DOM-to-State sync
   - Fix: Identify and remove the overwrite source

**Do NOT remove diagnostic logging until bug is confirmed fixed and tested.**

---

## RESOLUTION: Root Cause Identified

**Status:** ✅ Bug Found
**Date:** 2025-11-20

### Diagnostic Results from Logs.md

The diagnostic logging revealed the TRUE root cause:

**Line 2555 (when d_12 changed to C-Residential):**
```
[S03 h_23 DEBUG] CALCULATING: d_13="PH Classic", d_12="C-Residential"
[S03 h_23 DEBUG] ✅ PH standard detected → h_23 = 18°C
```

**Line 2608 (when d_13 changed back to OBC):**
```
[S03 h_23 DEBUG] CALCULATING: d_13="OBC SB10 5.5-6 Z6", d_12="A-Assembly"  ← BUG!
[S03 h_23 DEBUG] ✅ Other occupancy (non-PH) → h_23 = 18°C
```

### The Real Problem

**d_12 is being RESET from "C-Residential" to "A-Assembly" when d_13 changes!**

This is NOT a calculation bug or state persistence bug - it's a **user selection overwrite bug**.

Between line 2555 and line 2608:
1. User had selected d_12 = "C-Residential" ✅
2. User changed d_13 from "PH Classic" to "OBC SB10"
3. **Something reset d_12 to "A-Assembly"** ❌
4. Calculation reads d_12 = "A-Assembly" (correctly!)
5. h_23 = 18°C (correct for A-Assembly, wrong expectation)

### Root Cause Investigation: Enhanced Diagnostics

**Known Facts:**
1. Field definition default for d_12 is "A-Assembly" ([Section02.js:60](../src/sections/Section02.js#L60))
2. User selects "C-Residential" which persists correctly until d_13 changes
3. When d_13 changes, d_12 reverts to "A-Assembly" (the field definition default)

**Hypothesis:** When d_13 changes, something is re-applying field definition defaults. Likely culprits:

1. **Section02's `handleBuildingCodeChange()`** might be calling something that resets dependent fields
2. **TargetState.setDefaults()** or **ReferenceState.setDefaults()** might be called during calculation cascade
3. **refreshUI()** might be reading from the wrong state or re-initializing state

**Enhanced Diagnostics Added:**

1. **[Section02.js:960-970](../src/sections/Section02.js#L960-L970)** - Track user d_12 changes in `handleMajorOccupancyChange()`
2. **[Section02.js:1933-1956](../src/sections/Section02.js#L1933-L1956)** - Track ALL d_12 setValue() calls with stack traces
3. **[Section02.js:1994-1997](../src/sections/Section02.js#L1994-L1997)** - Track refreshUI() d_12 dropdown sync

**Test Procedure (Enhanced):**
1. Open browser console
2. Set d_12 to "C-Residential" → Should see `[S02 d_12 DEBUG] 🔵 USER CHANGED`
3. Set d_13 to "PH Classic" → May see d_12 logs (expected)
4. Change d_13 from "PH Classic" to "OBC SB10 5.5-6 Z6" → **Watch for d_12 logs!**
5. Check if any `[S02 d_12 DEBUG] 🟡 ModeManager.setValue("d_12", "A-Assembly")` appears
6. Examine stack trace to find WHERE the reset is coming from

**Possible Sources of Reset:**
- ReferenceValues.js might include d_12 defaults
- Calculator.calculateAll() might have initialization logic
- Section02 state sync might reload defaults when standard changes

### ROOT CAUSE IDENTIFIED ✅

**The Real Issue:** Section02's dual-state architecture (TargetState/ReferenceState) was NOT syncing to StateManager during initialization.

**What was happening:**
1. User loads page → Section02 initializes TargetState with field defaults (d_12 = "A-Assembly")
2. TargetState loads from localStorage (might have saved user selections)
3. **BUT StateManager was never updated with these values!**
4. User changes d_12 to "C-Residential" → Saves to TargetState AND StateManager ✅
5. User changes d_13 → Section02's calculateAll() runs
6. Section03 reads d_12 from StateManager → Gets OLD/STALE value!

**The DOM showed "C-Residential"** because TargetState had the correct value and refreshUI() synced it to the dropdown.

**StateManager showed "A-Assembly"** because it was never initialized from TargetState - it still had defaults or undefined.

### Attempted Fix #1: Initialization Sync ❌ NOT SUFFICIENT

**Location:** [Section02.js:1855-1881](../src/sections/Section02.js#L1855-L1881)

Added Target state sync to StateManager during ModeManager.initialize():

```javascript
// ✅ FIX: Sync Target state to StateManager for downstream sections
if (window.TEUI?.StateManager) {
  ["d_12", "d_13", "d_14", "d_15", "h_12", "h_13", "h_14", "h_15",
   "i_16", "i_17", "l_12", "l_13", "l_14", "l_15", "l_16"].forEach(id => {
    const val = TargetState.getValue(id);
    if (val != null && val !== "") {
      window.TEUI.StateManager.setValue(id, val, "calculated");
    }
  });
}
```

**What This Fixed:**
- StateManager now gets initialized with TargetState values on page load
- Eliminated one source of state desync

**What This Did NOT Fix:**
- User changes to d_12 dropdown still don't persist in StateManager
- Latest logs (37,586 lines) show h_23 still reading d_12="A-Assembly" even after user selects "C-Residential"
- Symptoms persist: DOM shows "C-Residential", StateManager shows "A-Assembly"

### Current Investigation: Why User Changes Don't Persist

**Test Results (37,586 line log file):**
1. User changed d_12 to "C-Residential" ✅ (visible in DOM)
2. User changed d_13 between PH Classic and OBC SB10
3. All h_23 calculations read d_12="A-Assembly" ❌ (StateManager has stale value)

**Possible Causes:**
1. **Section02's `handleMajorOccupancyChange()` not being called**
   - Maybe FieldManager is intercepting the event?
   - Maybe event delegation isn't working?

2. **ModeManager.setValue() not writing to StateManager**
   - Code looks correct (line 1935 calls StateManager.setValue)
   - But maybe there's a condition preventing it?

3. **StateManager value being overwritten immediately after**
   - Something else writes "A-Assembly" right after user changes it
   - FieldManager? Another section? refreshUI()?

4. **localStorage corruption**
   - User's previous session saved "A-Assembly"
   - Every page load restores the wrong value
   - User changes appear in DOM but don't persist across events

**Next Steps:**
- Need to add targeted logging to ModeManager.setValue() to confirm it's being called
- Need to check if StateManager.getValue("d_12") returns correct value immediately after user change
- Need to identify what (if anything) is overwriting StateManager AFTER the user change

### BUG STATUS: UNRESOLVED ❌ (SHELVED FOR FUTURE)

**Issue Tracking:** Will be added to GitHub Issues for remote tracking

**THE BUG (Simple Statement):**
When `d_12` = Critical Occupancy (C-Residential or Care types) AND `d_13` = any NON-PH standard, `h_23` MUST be 22°C. Currently it gets stuck at 18°C after switching away from PH standards.

**User Impact:**
- **Severity:** Low - Most users set Occupancy first, then Standard, avoiding the bug
- **Trigger:** Only occurs when user switches d_13 AFTER setting d_12 to Critical Occupancy
- **Workaround:** User can toggle d_12 dropdown to "unstick" the value

**Likely Root Causes (Narrowed Down):**

1. **State Mixing (ref_d_12 vs d_12)** ⭐ MOST LIKELY
   - When d_13 changes, something reads `ref_d_12` instead of `d_12`
   - Classic state contamination pattern (seen before in other sections)
   - Check: Any code that reads d_12 during d_13 change calculations

2. **Fallback Logic Reading Wrong Default** ❌ ELIMINATED
   - Checked: All d_12 getValue() calls use `|| ""` fallback (empty string)
   - No code has `|| "A-Assembly"` fallback pattern
   - Section02.js lines 1225-1226: `|| ""`
   - Section03.js lines 617, 621, 2215-2216: `|| ""`

3. **Calculation Timing/Order Issue** ⭐ POSSIBLE
   - Section03 calculates before Section02's setValue() propagates
   - StateManager notification race condition
   - Calculator.calculateAll() order may cause stale reads

**What We Know For Sure:**
- Section02 DOES write d_12 to StateManager (downstream sections receive it)
- The calculation logic in Section03 is CORRECT
- DOM shows correct value, StateManager shows stale value
- 37,586 console log lines from simple d_12/d_13 changes (cascade issue)

**Next Investigation Steps:**
1. Search for `ref_d_12` reads during d_13 change handling
2. Search for fallback patterns: `getValue("d_12") || "A-Assembly"`
3. Check calculation order in Calculator.calculateAll()
4. Add targeted logging ONLY for d_12 reads (not writes)

---

### Fix Strategy (Original - No Longer Needed)

**Option 1: Preserve d_12 During d_13 Changes**
- Before changing d_13, save current d_12 value
- After d_13 change completes, restore d_12 if user had modified it
- Mark d_12 as "user-modified" to prevent overwrites

**Option 2: Remove d_12 from Standard Change Reset**
- Find where d_12 is being reset when d_13 changes
- Add d_12 to exclusion list (don't reset user selections)
- Only reset calculated fields, not user inputs

**Option 3: Add d_12 Protection Flag**
- When user changes d_12, set flag: `d_12_user_modified = true`
- In reset logic, check flag before overwriting d_12
- Clear flag only on explicit user reset or file import

### Recommended Fix: Option 2

**Find and fix the reset source:**

1. Search Section02 for where d_12 might be reset when d_13 changes
2. Check if ReferenceValues.js includes d_12 (it shouldn't - occupancy is user choice)
3. Look for initialization code in Calculator.calculateAll()
4. Add safeguards to preserve user-modified input fields

**The calculation logic is CORRECT - we just need to stop d_12 from being reset!**

---

**End of Document**
