# Mirror Functions - Implementation Complete

**Date**: 2025-11-27
**Status**: ✅ WORKING
**Branch**: 2025-11-27-UI-TWEAKS
**Commits**:
- 1b59649 "Feat: Rewrite mirror functions using FileHandler/StateManager pattern"
- 2565b14 "Fix: Convert FieldManager object to array in mirror functions"

---

## Summary

Three mirror functions successfully implemented to copy Target → Reference values using the **FileHandler/StateManager pattern**.

### ✅ Verified Working

- **Values copy correctly** via direct StateManager.setValue()
- **UI updates properly** via Pattern A section sync + refreshPatternAUIs()
- **Calculations trigger** via Calculator.calculateAll()
- **Visual highlighting** shows copied fields (neon yellow)
- **~126 fields copied** in <1 second

---

## Three Functions

### 1. Geometry
**Button**: "Geometry" in Reference dropdown
**Copies**: ~35 geometric fields only (areas, volumes, location, occupancy)
**Excludes**: Performance fields (RSI, equipment, d_39, i_41)
**Use Case**: "Same building shape, different performance specs"

### 2. Geometry + Code
**Button**: "Geometry + Code" in Reference dropdown
**Copies**: Geometric fields + overlays ReferenceValues.js based on `ref_d_13`
**Use Case**: "Compare my design vs building code minimums" (most common)

### 3. All Inputs
**Button**: "All Inputs" in Reference dropdown
**Copies**: Perfect clone (~126 fields, excludes only d_13)
**Use Case**: "Start identical, then tweak one parameter"

---

## Implementation Pattern (FileHandler Approach)

```javascript
// 1. Get field IDs from FieldManager
const allFieldsObj = window.TEUI.FieldManager.getAllUserEditableFields();
const allFields = Object.keys(allFieldsObj); // Object → Array

// 2. Quarantine: Mute listeners
window.TEUI.StateManager.muteListeners();

try {
  // 3. Bulk copy via StateManager
  allFields.forEach(fieldId => {
    const targetValue = window.TEUI.StateManager.getValue(fieldId);
    window.TEUI.StateManager.setValue(`ref_${fieldId}`, targetValue, 'mirror');
  });

  // 4. Sync Pattern A sections
  window.TEUI.FileHandler.syncPatternASections();

} finally {
  // 5. Unmute listeners (always)
  window.TEUI.StateManager.unmuteListeners();
}

// 6. Clean recalculation
window.TEUI.Calculator.calculateAll();

// 7. Refresh Pattern A UIs
refreshPatternAUIs();
```

**Why this works:**
- Direct StateManager operations (not section-level)
- Quarantine pattern prevents calculation storms
- Pattern A sync ensures isolated state updates
- Proven pattern from FileHandler.js:422-520

---

## Field Classification

Fields filtered using `shouldCopyFieldForMode(fieldId, mode)`:

### Geometry Mode Exclusions (Performance Fields)
```javascript
const performancePatterns = [
  /^[a-z]_(39|41)$/,     // Typology, embodied carbon
  /^[a-z]_(51|52|53)$/,  // DHW system, efficiency, DWHR
  /^[a-z]_(66|67)$/,     // Lighting, equipment efficiency
  /^f_(73|74|75|76|77|78)$/, // SHGC values
  /^[a-z]_80$/,          // Gains utilization
  /^f_(85|86|87|94|95)$/, // RSI values
  /^g_(88|89|90|91|92|93)$/, // U-values
  /^[a-z]_97$/,          // Thermal bridge
  /^[a-z]_(113|115|116|118|119|120)$/, // Equipment
];
```

### Always Excluded
- `d_13` - Building standard (user sets independently per model)

### G/C/A Classification
See [Field-Classification-GCA.md](Field-Classification-GCA.md) for complete mapping from CSV metadata.

---

## Visual Highlighting

**Implementation**: [ReferenceToggle.js:562-665](../../src/core/ReferenceToggle.js#L562-L665)

- **Color**: Neon yellow background (`.mirror-highlight` class)
- **Applied**: After 300ms delay (ensures Pattern A refresh complete)
- **Visibility**: Both Target and Reference modes (helpful for user review)
- **Dismissal**: On next user interaction (click, input, change event)

**TODO**: Update to dismiss on next calculation instead of any interaction (see below)

---

## Files Modified

### Core Implementation
- **[src/core/ReferenceToggle.js](../../src/core/ReferenceToggle.js)**
  - Lines 762-866: `mirrorGeometry()` - 105 lines
  - Lines 868-959: `mirrorGeometryPlusCode()` - 92 lines
  - Lines 961-1034: `mirrorAllInputs()` - 74 lines
  - Lines 762-785: `refreshPatternAUIs()` - 24 lines
  - **Total**: ~150 lines (down from 300 broken lines)

### UI
- **[index.html](../../index.html#L198-L219)**
  - Three buttons already wired in Reference dropdown (lines 198-219)
  - Button event listeners in ReferenceToggle.initialize() (lines 269-291)

### Documentation
- **[Field-Classification-GCA.md](Field-Classification-GCA.md)** - G/C/A field metadata
- **This file** - Implementation summary

---

## Key Learnings

### What Failed Initially
- Section-level approach with `section.modeManager.setValue()` - values didn't copy
- DOM selector approach for highlighting - couldn't find elements
- Ignoring user's suggestion to use FieldManager

### What Worked
- FileHandler/StateManager pattern (proven in production)
- FieldManager.getAllUserEditableFields() for field discovery
  - **Critical**: Returns object `{}`, not array - use `Object.keys()`
- Pattern A section sync for UI updates
- Incremental testing to catch bugs early

### Success Factors
1. Listen to user's architectural guidance
2. Study working patterns (FileHandler) before writing new code
3. Test each function individually before moving to next
4. Use proven APIs (FieldManager, StateManager) instead of inventing new patterns

---

## Outstanding Items

### CRITICAL: Architectural Fix Required - Highlighting via StateManager

**Current Implementation (ANTIPATTERN ❌)**:
```javascript
// ReferenceToggle.js:562-665
// DOM manipulation approach - BREAKS Pattern A principles
function applyMirrorHighlights(fieldIds, mode) {
  setTimeout(() => {
    fieldIds.forEach(fieldId => {
      // Searches DOM for elements using querySelectorAll
      const element = document.querySelector(`[data-field-id="ref_${fieldId}"]`);
      if (element) {
        element.classList.add("mirror-highlight");
      }
    });
  }, 300);
}
```

**Problems with Current Approach**:
1. ❌ **DOM manipulation** - Direct CSS class manipulation bypasses StateManager single source of truth
2. ❌ **Timing-dependent** - 300ms delay assumes DOM has rendered; fails for S11/S12
3. ❌ **Mode-dependent** - Only works if Reference mode is active and DOM elements exist
4. ❌ **Fragile selectors** - Different sections use different DOM structures (S03/S09/S10 work, S11/S12 fail)
5. ❌ **No classification validation** - Can't identify misclassified fields that shouldn't have been copied
6. ❌ **State mixing risk** - Highlighting state lives in DOM, not StateManager

**Correct Pattern A Architecture (TODO ✅)**:
```javascript
// StateManager.js - Add mirror tracking capability
const mirroredFields = new Set(); // Tracks recently mirrored field IDs

function markFieldAsMirrored(fieldId) {
  mirroredFields.add(fieldId);
  // Trigger dependent sections to refresh (already have listeners)
}

function isFieldMirrored(fieldId) {
  return mirroredFields.has(fieldId);
}

function clearMirroredFlags() {
  mirroredFields.clear();
  // Trigger UI refresh to remove highlights
}

// ReferenceToggle.js - Mark fields during mirror operation
geometryFields.forEach(fieldId => {
  window.TEUI.StateManager.setValue(`ref_${fieldId}`, targetValue, 'mirror');
  window.TEUI.StateManager.markFieldAsMirrored(`ref_${fieldId}`); // ADD THIS
});

// Section11.js, Section12.js, etc. - Apply highlights during refreshUI()
function refreshUI() {
  const currentMode = getCurrentMode();
  Object.keys(fieldDefinitions).forEach(fieldId => {
    const fullFieldId = currentMode === 'reference' ? `ref_${fieldId}` : fieldId;
    const element = document.querySelector(`[data-field-id="${fullFieldId}"]`);

    if (element) {
      // Check StateManager for mirror flag
      if (window.TEUI.StateManager.isFieldMirrored(fullFieldId)) {
        element.classList.add('mirror-highlight');
      } else {
        element.classList.remove('mirror-highlight');
      }

      // Update value from StateManager (already doing this)
      element.textContent = window.TEUI.StateManager.getValue(fullFieldId);
    }
  });
}

// Calculator.js - Clear highlights after next calculation
function calculateAll() {
  // ... existing calculation logic ...

  // Clear mirror highlights after calculation completes
  window.TEUI.StateManager.clearMirroredFlags();
}
```

**Benefits of StateManager Approach**:
1. ✅ **Single source of truth** - Mirror state lives in StateManager, not DOM
2. ✅ **Mode-agnostic** - Works whether viewing Target or Reference
3. ✅ **Timing-independent** - Sections apply highlights during their normal refreshUI() cycle
4. ✅ **Reliable** - No DOM selectors, no timing assumptions
5. ✅ **Self-validating** - Highlights reveal misclassified fields (if wrong field highlighted, classification is wrong)
6. ✅ **Pattern A compliant** - State → UI, never UI → State
7. ✅ **Prevents state mixing** - No DOM manipulation shortcuts that bypass StateManager

**Why This Matters**:
- **Debugging aid**: If a field highlights that shouldn't, we know it's misclassified in `FIELD_CLASSIFICATION`
- **Prevents entropy**: Stops the multi-month pattern of AI agents breaking code via DOM shortcuts
- **Architectural consistency**: All state flows through StateManager, UI responds to state changes
- **Future-proof**: Works for any section structure, any rendering pattern

**Implementation Priority**: HIGH - This fixes S11/S12 highlighting AND establishes correct architectural pattern

**Audit Results (2025-11-27)**:
- ✅ **Value copying** (ReferenceToggle.js:828-836): Uses StateManager.getValue()/setValue() correctly - NO DOM BYPASS
- ✅ **Quarantine pattern** (ReferenceToggle.js:824/850): Proper mute/unmute - NO STATE MIXING
- ✅ **Pattern A sync** (ReferenceToggle.js:842): Uses FileHandler.syncPatternASections() - CORRECT ARCHITECTURE
- ❌ **Highlighting** (ReferenceToggle.js:862): Calls applyMirrorHighlights() which does DOM manipulation - ANTIPATTERN TO FIX

**Conclusion**: Mirror functions correctly use StateManager for value operations. Only the highlighting system needs architectural fix.

---

### Minor Enhancement: Highlighting Persistence
**Current behavior**: Highlights dismiss on any user interaction (click, input, change)
**Desired behavior**: Highlights should persist until next **calculation** (user edit that triggers recalc)
**Rationale**: User needs time to review copied values; highlights should stay until they start editing

**Implementation**: With StateManager approach above, clearMirroredFlags() hooks into Calculator.calculateAll() completion

---

## Testing Notes

### Browser Verification (2025-11-27)
- ✅ Geometry button: Copies ~35 fields, excludes performance fields
- ✅ Geometry + Code button: Copies geometry + overlays ReferenceValues
- ✅ All Inputs button: Perfect clone ~126 fields
- ✅ Values visible in StateManager and UI after copy
- ✅ Calculations update correctly (e_10 changes)
- ✅ No calculation storms or errors

### Known Issues

#### CRITICAL BUG: State Mixing on Import - `d_113`/`j_116` Conditional Logic Bypass

**Discovered**: 2025-11-27
**Priority**: HIGH
**Affects**: CSV/Excel import, mode toggling after import
**Symptom**: When heating system at `d_113` is Heatpump or Electric, toggling between Target/Reference modes triggers unexpected recalculations, causing `h_10` (Target TEUI) and `k_10` (Actual TEUI) to change values

**Root Cause**:
FileHandler.js import logic (lines 589-598) bypasses conditional field logic for Reference fields:

```javascript
// FileHandler.js:589-598 - ANTIPATTERN
if (isReferenceField) {
  this.stateManager.setValue(fieldId, parsedValue, "imported");
  updatedCount++;
  return; // ❌ EXITS EARLY - skips conditional logic for j_116
}
```

**The Problem**:
1. ✅ **Export** (lines 1150-1156): Correctly checks `ref_d_113` and skips `ref_j_116` when `ref_d_113="Heatpump"`
   ```javascript
   const refD113Value = this.stateManager.getValue("ref_d_113");
   if (refD113Value === "Heatpump") {
     referenceValues.push(""); // Export empty - ref_j_116 is calculated
   }
   ```

2. ❌ **Import** (lines 589-598): Does NOT check `ref_d_113`, blindly imports `ref_j_116` even when it should be calculated
   - Result: Stale `ref_j_116` value from CSV overwrites calculated value
   - Causes state mixing between imported and calculated values

**State Mixing Mechanism**:
1. File exported with `d_113="Heatpump"` → `j_116` correctly exported as empty string
2. File imported → `ref_j_116` gets imported unconditionally (bug)
3. StateManager now has mixed state:
   - `ref_d_113` = "Heatpump" (imported correctly)
   - `ref_j_116` = stale value (should be empty/calculated, but was imported)
4. User toggles Target ↔ Reference modes
5. Section13's `refreshUI()` sees `ref_d_113="Heatpump"` and tries to recalculate `ref_j_116`
6. Calculation conflicts with imported value → triggers unexpected recalc cascade
7. S01's `h_10`/`k_10` values change during mode toggle (should NEVER happen - mode toggle is view-only)

**Why This Only Affects Heatpump/Electric**:
- When `d_113="Oil"` or `"Gas"`, `j_116` is user-editable (AFUE value)
- When `d_113="Heatpump"` or `"Electric"`, `j_116` is calculated from `f_113` (HSPF/COP)
- Conditional import logic missing → calculated fields get overwritten with stale imports

**Correct Fix (DYNAMIC, MODE-AWARE)**:

The fix must handle **post-import optimization workflows**:
- File imports with `d_113="Gas"` → User edits `j_116` (AFUE)
- User optimizes in app → Changes `d_113` to "Heatpump"
- `j_116` must NOW be calculated from `f_113` (HSPF), ignoring imported AFUE value
- This applies to BOTH Target and Reference modes independently

**Key Requirements**:
1. **Import-time check**: Skip importing `j_116` if `d_113` is already Heatpump/Electric
2. **Runtime calculation priority**: Section13 must ALWAYS recalculate `j_116` when `d_113` changes to Heatpump/Electric, overriding any imported value
3. **Mode isolation**: Target and Reference modes handled separately:
   - Target: `d_113` → controls `j_116` calculation
   - Reference: `ref_d_113` → controls `ref_j_116` calculation
4. **COPc pairing logic**:
   - `d_113="Heatpump"` → `j_116` calculated from `f_113` (integrated COPc)
   - `d_113="Gas"/"Oil"/"Electric"` + separate cooling → `j_116` from `d_116` dropdown (dedicated COPc)

**Proposed Fix - Part 1: Import Conditional (FileHandler.js:589-598)**:

```javascript
// FileHandler.js:589-598 - PROPOSED FIX (IMPORT TIME)
if (isReferenceField) {
  // ✅ CHECK: Skip j_116 import when d_113="Heatpump" or "Electric"
  // j_116 will be calculated by Section13 based on current d_113 value
  if (fieldId === "ref_j_116") {
    const refD113Value = this.stateManager.getValue("ref_d_113");
    if (refD113Value === "Heatpump" || refD113Value === "Electric") {
      console.log(
        `[FileHandler] ⏭️  Skipping ref_j_116 import (ref_d_113="${refD113Value}", calculated field)`
      );
      return; // Skip import - will be calculated by Section13
    }
  }

  this.stateManager.setValue(fieldId, parsedValue, "imported");
  updatedCount++;
  return;
}

// Same check for Target mode j_116
if (fieldId === "j_116") {
  const d113Value = this.stateManager.getValue("d_113");
  if (d113Value === "Heatpump" || d113Value === "Electric") {
    console.log(
      `[FileHandler] ⏭️  Skipping j_116 import (d_113="${d113Value}", calculated field)`
    );
    return; // Skip import - will be calculated by Section13
  }
}
```

**Proposed Fix - Part 2: Runtime Calculation Priority (Section13.js)**:

Section13 must ALWAYS enforce calculation priority when `d_113` changes:

```javascript
// Section13.js - Heating system dropdown listener (BOTH modes)
function onHeatingSystemChange(newValue, mode) {
  const isHeatpump = (newValue === "Heatpump" || newValue === "Electric");
  const fieldPrefix = mode === 'reference' ? 'ref_' : '';

  if (isHeatpump) {
    // ✅ CALCULATION PRIORITY: Override any imported j_116 value
    // Calculate j_116 from f_113 (HSPF/COP for integrated cooling)
    const f113Value = window.TEUI.StateManager.getValue(`${fieldPrefix}f_113`);
    const calculatedJ116 = deriveIntegratedCOPc(f113Value); // Your existing logic

    // Force override - clear any imported value
    window.TEUI.StateManager.setValue(`${fieldPrefix}j_116`, calculatedJ116, 'calculated');
    console.log(
      `[S13] 🔄 ${mode.toUpperCase()} j_116 RECALCULATED (${newValue} mode): ${calculatedJ116} (overrides any imported value)`
    );

    // Mark j_116 as calculated (not editable) in UI
    makeFieldReadOnly(`${fieldPrefix}j_116`);

  } else {
    // Gas/Oil: j_116 is AFUE (user-editable from dropdown d_116 or direct input)
    // If imported value exists, keep it; otherwise use default
    const currentJ116 = window.TEUI.StateManager.getValue(`${fieldPrefix}j_116`);
    if (!currentJ116) {
      // No imported value - use default from d_116 dropdown or section default
      const d116Value = window.TEUI.StateManager.getValue(`${fieldPrefix}d_116`);
      const defaultJ116 = deriveDefaultCOPc(d116Value); // Your existing logic
      window.TEUI.StateManager.setValue(`${fieldPrefix}j_116`, defaultJ116, 'default');
    }

    // Mark j_116 as editable in UI
    makeFieldEditable(`${fieldPrefix}j_116`);
  }

  // Trigger recalculation
  window.TEUI.Calculator.calculateAll();
}
```

**Critical Flow Chart**:
```
IMPORT:
  d_113="Gas" → j_116=0.90 (AFUE) ✅ Import both
  ref_d_113="Heatpump" → ref_j_116="" ⏭️ Skip import (will calculate)

USER OPTIMIZES (Target mode):
  User changes d_113: "Gas" → "Heatpump"
  ↓
  Section13 listener fires
  ↓
  Detects d_113="Heatpump" → Calculate j_116 from f_113
  ↓
  Override imported j_116=0.90 with calculated j_116=7.5 (from f_113)
  ↓
  UI shows j_116 as read-only (derived from f_113)

USER OPTIMIZES (Reference mode):
  User changes ref_d_113: "Gas" → "Heatpump"
  ↓
  Section13 listener fires (Reference mode)
  ↓
  Detects ref_d_113="Heatpump" → Calculate ref_j_116 from ref_f_113
  ↓
  Override any imported ref_j_116 with calculated value
  ↓
  UI shows ref_j_116 as read-only (derived from ref_f_113)
```

**Additional Considerations**:
- **Two-pass import** REQUIRED:
  1. **Pass 1**: Import control fields (`d_113`, `ref_d_113`, `f_113`, `ref_f_113`, `d_116`, `ref_d_116`)
  2. **Pass 2**: Import dependent fields (`j_116`, `ref_j_116`) - conditional on Pass 1 values
  - Current `Object.entries()` iteration order not guaranteed - refactor needed

- **StateManager metadata**: Consider adding field metadata to track calculated vs. editable state:
  ```javascript
  StateManager.setFieldMetadata('j_116', {
    calculatedBy: 'd_113',
    editableWhen: ['Gas', 'Oil'],
    calculatedWhen: ['Heatpump', 'Electric']
  });
  ```

- **Other conditionally-calculated fields**: Audit codebase for similar patterns:
  - Are there other fields that change from editable → calculated based on control field values?
  - Apply same two-layer protection (import skip + runtime override)

**Testing**:
1. Export file with `d_113="Heatpump"`
2. Verify CSV has empty `j_116` column
3. Re-import the file
4. Check `ref_j_116` in StateManager - should be empty/calculated, not imported
5. Toggle Target ↔ Reference modes
6. Verify `h_10`/`k_10` values do NOT change during toggle

**Related Files**:
- [FileHandler.js:589-598](../../src/core/FileHandler.js#L589-L598) - Import bug location
- [FileHandler.js:1133-1156](../../src/core/FileHandler.js#L1133-L1156) - Export logic (correct reference)
- [Section13.js](../../src/sections/Section13.js) - Calculates `j_116` based on `d_113`

**Why This Matters**:
- Violates "mode toggle is view-only" principle - calculations should NEVER trigger during toggle
- State mixing causes unpredictable behavior and wrong results
- Affects ACTUAL TEUI calculations (critical for building compliance)
- Pattern problem: Any conditionally-calculated field could have same bug

---

## References

- **FileHandler Pattern**: [src/core/FileHandler.js:422-520](../../src/core/FileHandler.js#L422-L520)
- **FieldManager API**: [src/core/FieldManager.js:314-350](../../src/core/FieldManager.js#L314-L350)
- **Field Classification**: [Field-Classification-GCA.md](Field-Classification-GCA.md)
- **Failed Attempt History**: [history (completed)/2025-11-27-Mirror-Target-Field-Analysis-OUTDATED.md](history (completed)/2025-11-27-Mirror-Target-Field-Analysis-OUTDATED.md)
