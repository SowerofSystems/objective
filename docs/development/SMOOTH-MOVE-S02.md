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

**End of Document**
