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

### Minor Enhancement: Highlighting Persistence
**Current behavior**: Highlights dismiss on any user interaction (click, input, change)
**Desired behavior**: Highlights should persist until next **calculation** (user edit that triggers recalc)
**Rationale**: User needs time to review copied values; highlights should stay until they start editing

**Implementation**: Hook into Clock.js update or Calculator.calculateAll() completion instead of generic DOM events

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
- Import-related d_113 calculation bug in S13 (unrelated to mirror functions)

---

## References

- **FileHandler Pattern**: [src/core/FileHandler.js:422-520](../../src/core/FileHandler.js#L422-L520)
- **FieldManager API**: [src/core/FieldManager.js:314-350](../../src/core/FieldManager.js#L314-L350)
- **Field Classification**: [Field-Classification-GCA.md](Field-Classification-GCA.md)
- **Failed Attempt History**: [history (completed)/2025-11-27-Mirror-Target-Field-Analysis-OUTDATED.md](history (completed)/2025-11-27-Mirror-Target-Field-Analysis-OUTDATED.md)
