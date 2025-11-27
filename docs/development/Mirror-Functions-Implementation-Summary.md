# Mirror Functions - Repair & Completion Guide

**Date Created**: 2025-11-27 (Original Implementation)
**Date Updated**: 2025-11-27 (Comprehensive Repair Plan)
**Status**: ❌ FAILED IMPLEMENTATION - Complete Rewrite Required
**Branch**: 2025-11-27-UI-TWEAKS
**Current Commit**: b65ec5f "Docs: Document failed mirror function implementation attempt"

---

## Executive Summary: What Went Wrong

The previous agent implemented mirror functions using a **section-by-section approach with ModeManager setValue()** that fundamentally does not work:

### Critical Failures

1. **❌ Values Not Being Copied** (BLOCKING)
   - Test: Set `ref_d_105=9000`, `d_105=8000`, click "Mirror Geometry"
   - Expected: `ref_d_105` becomes 8000
   - Actual: `ref_d_105` remains 9000 (unchanged)
   - Root Cause: `section.modeManager.setValue(fieldId, value, "imported")` does NOT write to Reference state properly

2. **❌ Visual Highlighting Broken** (HIGH PRIORITY)
   - Expected: Neon yellow highlights on copied fields
   - Actual: No highlights appear
   - Root Cause: DOM selectors fail to find elements - wrong architectural approach

3. **❌ User's Guidance Ignored**
   - User suggested: "Use FieldManager from the start"
   - Agent dismissed: "Would not be necessary"
   - **This was wrong** - we should have listened to domain expertise

### The Correct Approach (FileHandler Pattern)

FileHandler successfully imports bulk values using this proven pattern:

```javascript
// PROVEN WORKING PATTERN from FileHandler.js:422-476
window.TEUI.StateManager.muteListeners(); // Quarantine
try {
  Object.entries(importedData).forEach(([fieldId, value]) => {
    window.TEUI.StateManager.setValue(fieldId, value, "import");
  });
  this.syncPatternASections(); // Sync Pattern A sections
} finally {
  window.TEUI.StateManager.unmuteListeners(); // Always unmute
}
calculator.calculateAll(); // Clean recalculation
// Refresh Pattern A section UIs (FileHandler.js:488-520)
```

**Why this works:**
- ✅ Direct StateManager operations (not section-level)
- ✅ Quarantine pattern prevents calculation storms
- ✅ Pattern A section sync ensures UI updates
- ✅ Centralized - no section file modifications
- ✅ Proven in production for Excel/CSV imports

---

## Implementation Status (Current Reality)

| Component | Status | Notes |
|-----------|--------|-------|
| Three Mirror Functions | ❌ BROKEN | Values not copying, must rewrite |
| Field Classification (d_39, i_41) | ✅ CORRECT | Performance patterns accurate |
| Automatic Calculation Trigger | ⚠️ INCOMPLETE | Pattern exists but functions broken |
| G/C/A Field Classification System | ✅ CORRECT | See Field-Classification-GCA.md |
| Neon Yellow Diff Highlighting | ❌ BROKEN | DOM selector approach failed |
| CSS Styles | ✅ KEEP | `.mirror-highlight` styles are good |

**Current State:** ~300 lines of non-functional code in ReferenceToggle.js
**Next Steps:** Complete rewrite using FileHandler/StateManager pattern

---

## What Was Implemented

### Three New Mirror Functions

1. **Geometry** - Copy only geometric/configuration fields
   - Button ID: `mirrorGeometryBtn`
   - Function: `TEUI.ReferenceToggle.mirrorGeometry()`
   - Copies: ~120 fields (areas, volumes, location, occupancy, energy costs)
   - Excludes: ~40 performance fields (RSI values, equipment efficiencies)
   - Use case: "Same building shape, different performance specs"

2. **Geometry + Code** - Copy geometry + overlay building code minimums
   - Button ID: `mirrorGeometryPlusCodeBtn`
   - Function: `TEUI.ReferenceToggle.mirrorGeometryPlusCode()`
   - Copies: Geometric fields first
   - Then overlays: ReferenceValues.js based on Reference model's `d_13`
   - Use case: "Compare my design vs building code minimums" (most common)

3. **All Inputs** - Perfect clone of Target model
   - Button ID: `mirrorAllInputsBtn`
   - Function: `TEUI.ReferenceToggle.mirrorAllInputs()`
   - Copies: Everything except `d_13` (building standard)
   - Use case: "Start with identical models, then tweak one parameter"

---

## Files Modified

### 1. [src/core/ReferenceToggle.js](../../src/core/ReferenceToggle.js)

**Added:**
- `shouldCopyFieldForMode(fieldId, mode)` - Helper function with field classification logic (~30 lines)
- `mirrorGeometry()` - New function (~120 lines)
- `mirrorGeometryPlusCode()` - New function (~70 lines)
- `mirrorAllInputs()` - New function (~80 lines)
- Updated exports to include new functions
- Updated button wiring in `initialize()`

**Total Addition**: ~300 lines of code

### 2. [index.html](../../index.html)

**Changed:**
- Uncommented Reference dropdown menu items (lines 198-220)
- Renamed buttons:
  - "Mirror Target" → "Geometry"
  - "Mirror Target + Reference" → "Geometry + Code"
  - "Reference Independence" → "All Inputs"
- Updated button IDs to match new naming

### 3. Documentation

**Created:**
- [Mirror-Target-Field-Analysis.md](./Mirror-Target-Field-Analysis.md) - Planning document
- [Field-Classification-for-Mirroring.md](./Field-Classification-for-Mirroring.md) - Complete field categorization
- [Field-Classification-GCA.md](./Field-Classification-GCA.md) - G/C/A system from CSV metadata (2025-11-27)
- [Mirror-Functions-Implementation-Summary.md](./Mirror-Functions-Implementation-Summary.md) - This file

---

## Field Classification Logic

### Performance Field Patterns (Excluded from "Geometry" mode)

```javascript
const performancePatterns = [
  /^[a-z]_(51|52|53)$/,    // DHW system type, efficiency, DWHR
  /^[a-z]_(66|67)$/,       // Lighting density, equipment efficiency
  /^f_(73|74|75|76|77|78)$/, // SHGC values (solar heat gain)
  /^[a-z]_80$/,            // Gains utilization factor
  /^f_(85|86|87|94|95)$/,  // RSI values (thermal resistance)
  /^g_(88|89|90|91|92|93)$/, // U-values (thermal transmittance)
  /^[a-z]_97$/,            // Thermal bridge penalty
  /^[a-z]_(113|115|116|118|119|120)$/, // Equipment types/performance
];
```

### Explicit Exclusions (All modes)
- `d_13` - Building Standard (user sets independently per model)

---

## User Experience

### Menu Structure (Reference Button Dropdown)

```
Reference [dropdown]
  ├─ Copy from Target
  │  ├─ Geometry
  │  ├─ Geometry + Code
  │  └─ All Inputs
  │
  ├─ Display Toggle
  │  ├─ Show Reference
  │  └─ Show Target
  │
  └─ View Cached Inputs
```

### Expected Behavior

#### 1. User clicks "Geometry"
```
Console output:
[ReferenceToggle] User clicked: Geometry
[ReferenceToggle] Mirror Geometry: Processing 9 sections
[ReferenceToggle] Geometry mode: 15 fields to copy, 5 performance fields skipped
[ReferenceToggle] Skipped performance fields: [f_85, f_94, d_113, ...]
🔗 Mirror Geometry: Successfully copied 120 geometry fields, skipped 40 performance fields
✅ Geometry fields copied (areas, volumes, location, occupancy)
❌ Performance fields skipped (RSI values, equipment efficiencies)
```

**Result**: Reference model has same geometry as Target, but performance fields remain at defaults or ReferenceValues

#### 2. User clicks "Geometry + Code"
```
Console output:
[ReferenceToggle] User clicked: Geometry + Code
[ReferenceToggle] Mirror Geometry + Code: Using Reference standard "OBC SB12 3.1.1.2.C1"
[ReferenceToggle] Found 25 reference values for this standard
... (Mirror Geometry output first) ...
[ReferenceToggle] Applying ReferenceValues overlay to sect10...
[ReferenceToggle] Applied 3 code minimum values to sect10: [f_85, f_94, g_88]
🔗 Mirror Geometry + Code: Applied 25 building code minimum values
📋 Standard: "OBC SB12 3.1.1.2.C1" - Reference model now uses Target geometry with code minimum performance
```

**Result**: Reference model = Target geometry + building code performance minimums

#### 3. User clicks "All Inputs"
```
Console output:
[ReferenceToggle] User clicked: All Inputs
[ReferenceToggle] Mirror All Inputs: Processing 9 sections
[ReferenceToggle] Read 18 Target values from sect01
🔗 Mirror All Inputs: Successfully copied 160 total fields
✅ Perfect clone created - Reference model is now identical to Target model
ℹ️  Excluded: d_13 (building standard) - user can set Reference standard independently
```

**Result**: Perfect clone of Target → Reference (except d_13)

---

## Testing Checklist

### Manual Testing Steps

1. **Load application** with sample data (Sherwood CC dataset)
2. **Click "Geometry" button**
   - ✅ Verify console shows ~120 fields copied, ~40 skipped
   - ✅ Verify `h_15` (area), `d_74` (window area), `d_85` (roof area) copied
   - ✅ Verify `f_85` (roof RSI) NOT copied (remains at default)
   - ✅ Verify `d_113` (heating system) NOT copied
   - ✅ Verify `d_13` (building standard) NOT copied

3. **Click "Geometry + Code" button**
   - ✅ Verify console shows geometry copy + ReferenceValues overlay
   - ✅ Verify `f_85`, `f_94` etc. now have values from ReferenceValues.js
   - ✅ Verify Reference model uses its own `d_13` for code lookup

4. **Click "All Inputs" button**
   - ✅ Verify console shows ~160 fields copied
   - ✅ Verify `f_85`, `d_113` etc. now match Target model exactly
   - ✅ Verify `d_13` still NOT copied (excluded)

5. **Switch to Reference display mode**
   - ✅ Verify Reference TEUI (e_10) different from Target TEUI (h_10) after "Geometry"
   - ✅ Verify Reference TEUI uses code minimums after "Geometry + Code"
   - ✅ Verify Reference TEUI equals Target TEUI after "All Inputs"

6. **Test calculation stability**
   - ✅ Verify no "calculation storms" after mirroring
   - ✅ Verify calculations complete without errors
   - ✅ Verify Target model values unchanged after any mirror operation

---

## Known Limitations

1. **No Undo**: Once mirrored, user must manually reset or re-edit Reference values
   - Mitigation: User can use "Factory Reset" or "Undo Changes" from Reset button dropdown

2. **No Visual Feedback**: No confirmation dialog or progress indicator
   - Mitigation: Console logging provides detailed feedback for developers
   - Future enhancement: Add toast notification or modal confirmation

3. **Performance**: Mirrors all sections sequentially
   - Impact: May take 1-2 seconds for large datasets
   - Acceptable: One-time operation, not performance-critical

4. **Field Discovery Dependency**: Relies on `getFieldIdsForSection()` helper
   - Risk: If section doesn't expose fields properly, mirror will skip that section
   - Mitigation: Console warnings logged for sections with no fields found

---

## TODO: Refinements Needed (2025-11-27)

### 1. ✅ Field Classification Fixes (COMPLETE)
- **Exclude from Geometry mode**: `d_39` (Typology Selection) and `i_41` (User Modelled Embodied Carbon)
  - ✅ Rationale: These are code/performance features, not geometry
  - ✅ Updated `shouldCopyFieldForMode()` to exclude these fields from "Geometry" mode
  - ✅ Added pattern: `/^[a-z]_(39|41)$/` to performance exclusions in ReferenceToggle.js:513

### 2. 🔄 Diff Highlighting (HIGH PRIORITY - SPECIFICATION COMPLETE, READY FOR IMPLEMENTATION)
- **Add neon yellow highlighting** for fields that were copied during mirror operation

  **Field Classification System** (from CSV metadata row 4):
  - `G` = Geometry fields (areas, volumes, location, occupancy)
  - `C` = Code/Performance fields (RSI values, equipment efficiencies, SHGC, U-values)
  - `A` = All other fields (everything not in G or C)

  **Highlight Behavior**:
  - ✅ Only highlight fields in **Reference model** (not Target)
  - ✅ Highlight **only the fields that were actually copied** in that mirror operation
  - ✅ Apply neon yellow background to the field fill area (input/select elements)
  - ✅ **Auto-dismiss**: Highlights dissolve after next user interaction with app (any click/input/change event)

  **Per-Method Highlighting**:
  - **"Geometry" button**: Highlight only `G` fields in Reference model
  - **"Geometry + Code" button**: Highlight `G` + `C` fields in Reference model
  - **"All Inputs" button**: Highlight `G` + `C` + `A` fields in Reference model (everything except d_13)

  **Technical Implementation Plan**:
  1. Create field classification mapping from CSV row 4 (G/C/A metadata)
  2. Add `.mirror-highlight` CSS class with neon yellow background
  3. After each mirror operation, apply class to copied fields in Reference DOM
  4. Add one-time event listener to remove highlights on next user interaction
  5. Ensure highlights only appear in Reference mode, cleared when switching modes

### 3. ✅ Calculation Protocol After Mirroring (COMPLETE)
- ✅ **Fixed**: Added automatic `TEUI.Calculator.calculateAll()` trigger after each mirror function
- ✅ **Implementation**: Added Tilt-button pattern to all three mirror functions:
  - `mirrorGeometry()` - ReferenceToggle.js:624-646
  - `mirrorGeometryPlusCode()` - ReferenceToggle.js:695-718
  - `mirrorAllInputs()` - ReferenceToggle.js:781-804
- ✅ **Result**: `e_10` (Reference TEUI) now reflects settled/recalculated values immediately
- ✅ **Console feedback**: Shows "✅ Automatic recalculation complete" after each mirror operation

---

## Future Enhancements (Nice to Have)

1. **User Confirmation Dialog**: "Are you sure you want to copy X fields from Target to Reference?"
2. **Progress Indicator**: Show "Copying fields... 50/120" during operation
3. **Success Toast Notification**: "✅ Copied 120 geometry fields to Reference model"
4. **Undo Last Mirror**: Store previous Reference state, allow one-click undo
5. **Selective Mirror**: Allow user to choose which sections to mirror (checkboxes)

---

## Success Criteria

- ✅ Three mirror functions implemented and wired to UI buttons
- ✅ Field classification helper correctly categorizes ~160 fields
- ✅ "Geometry" excludes ~40 performance fields
- ✅ "Geometry + Code" overlays ReferenceValues.js correctly
- ✅ "All Inputs" creates perfect clone except d_13
- ✅ No calculation storms or performance issues
- ✅ Target model values never affected by mirror operations
- ✅ Console logging provides clear feedback on operations

---

## Next Steps

1. ✅ **Implementation**: Complete (2025-11-27)
2. ⏳ **Testing**: Manual testing with Sherwood CC dataset
3. ⏳ **Documentation**: Update Master-Reference-Roadmap.md with final status
4. ⏳ **User Testing**: Get feedback from Andy on UX and naming
5. ⏳ **Commit & Push**: Commit to 2025-11-27-UI-TWEAKS branch

---

## COMPLETE REWRITE PLAN: FileHandler/StateManager Pattern

### Architecture: Why FileHandler Pattern Works

FileHandler successfully imports hundreds of values (Target + Reference) from Excel/CSV files. This is **exactly** what mirror functions need to do: bulk copy values from Target → Reference.

#### Key Components of FileHandler Success:

1. **StateManager-Level Operations** (FileHandler.js:422-476)
   - Direct `window.TEUI.StateManager.setValue()` calls
   - NO section-level manipulation
   - NO ModeManager involvement
   - Centralized, clean, proven

2. **Quarantine Pattern** (prevent calculation storms)
   ```javascript
   window.TEUI.StateManager.muteListeners();
   try {
     // Bulk value writes here
   } finally {
     window.TEUI.StateManager.unmuteListeners(); // Always unmute
   }
   ```

3. **Pattern A Section Sync** (FileHandler.js:462-469)
   ```javascript
   this.syncPatternASections(); // Critical for UI updates
   ```

4. **Clean Recalculation** (FileHandler.js:478-486)
   ```javascript
   calculator.calculateAll(); // After all values loaded
   ```

5. **Pattern A UI Refresh** (FileHandler.js:488-520)
   ```javascript
   patternASections.forEach(sectionId => {
     const section = window.TEUI?.SectionModules?.[sectionId];
     if (section?.ModeManager?.refreshUI) {
       section.ModeManager.refreshUI();
       if (section.ModeManager.updateCalculatedDisplayValues) {
         section.ModeManager.updateCalculatedDisplayValues();
       }
     }
   });
   ```

### Step-by-Step Rewrite Instructions

#### PHASE 1: Get All Field IDs (Use FieldManager)

**Goal:** Get complete list of all Target input field IDs

**Method 1: Use FieldManager.getAllUserEditableFields()**
```javascript
const allFields = window.TEUI.FieldManager.getAllUserEditableFields();
// Returns array of field IDs: ['d_12', 'd_13', 'h_15', ...]
```

**Method 2: Query StateManager directly**
```javascript
const stateKeys = Object.keys(window.TEUI.StateManager.state);
const targetFields = stateKeys.filter(key => !key.startsWith('ref_'));
```

**Method 3: Use section modules (current broken approach - DON'T USE)**
```javascript
// ❌ BROKEN - Don't use this approach
sections.forEach(section => {
  const fieldIds = getFieldIdsForSection(section.id);
  // This approach failed because section.modeManager.setValue() doesn't work
});
```

#### PHASE 2: Implement Three Mirror Functions (StateManager Pattern)

**Function 1: mirrorGeometry()**
```javascript
function mirrorGeometry() {
  console.log('[ReferenceToggle] 🔗 Mirror Geometry: Starting...');

  // Get all field IDs
  const allFields = window.TEUI.FieldManager.getAllUserEditableFields();

  // Filter to geometry fields only (exclude performance fields)
  const geometryFields = allFields.filter(fieldId => {
    return shouldCopyFieldForMode(fieldId, 'geometry');
  });

  console.log(`[ReferenceToggle] Copying ${geometryFields.length} geometry fields`);

  // QUARANTINE START
  window.TEUI.StateManager.muteListeners();

  try {
    let copiedCount = 0;
    geometryFields.forEach(fieldId => {
      if (fieldId === 'd_13') return; // Never copy building standard

      const targetValue = window.TEUI.StateManager.getValue(fieldId);
      if (targetValue !== null && targetValue !== undefined && targetValue !== '') {
        // Write to Reference state with ref_ prefix
        window.TEUI.StateManager.setValue(`ref_${fieldId}`, targetValue, 'mirror');
        copiedCount++;
      }
    });

    console.log(`[ReferenceToggle] ✅ Copied ${copiedCount} geometry values to Reference state`);

    // Sync Pattern A sections (critical!)
    if (window.TEUI.FileHandler?.syncPatternASections) {
      window.TEUI.FileHandler.syncPatternASections();
    }

  } finally {
    // QUARANTINE END - Always unmute
    window.TEUI.StateManager.unmuteListeners();
  }

  // Clean recalculation
  if (window.TEUI?.Calculator?.calculateAll) {
    window.TEUI.Calculator.calculateAll();
  }

  // Refresh Pattern A section UIs
  refreshPatternAUIs();

  // Apply highlights
  applyMirrorHighlights(geometryFields, 'geometry');

  console.log('🔗 Mirror Geometry: Complete');
}
```

**Function 2: mirrorGeometryPlusCode()**
```javascript
function mirrorGeometryPlusCode() {
  // Step 1: Copy geometry fields (same as mirrorGeometry)
  mirrorGeometry();

  // Step 2: Overlay ReferenceValues.js code minimums
  const standard = window.TEUI.StateManager.getValue('ref_d_13') || 'OBC SB12 3.1.1.2.C1';
  const refValues = window.TEUI.ReferenceValues?.[standard] || {};

  console.log(`[ReferenceToggle] 🔗 Applying code minimums from "${standard}"`);

  window.TEUI.StateManager.muteListeners();
  try {
    Object.entries(refValues).forEach(([fieldId, value]) => {
      window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, 'reference');
    });

    if (window.TEUI.FileHandler?.syncPatternASections) {
      window.TEUI.FileHandler.syncPatternASections();
    }
  } finally {
    window.TEUI.StateManager.unmuteListeners();
  }

  if (window.TEUI?.Calculator?.calculateAll) {
    window.TEUI.Calculator.calculateAll();
  }

  refreshPatternAUIs();

  // Highlight G + C fields
  const allFields = window.TEUI.FieldManager.getAllUserEditableFields();
  applyMirrorHighlights(allFields, 'geometry-plus-code');
}
```

**Function 3: mirrorAllInputs()**
```javascript
function mirrorAllInputs() {
  console.log('[ReferenceToggle] 🔗 Mirror All Inputs: Starting...');

  const allFields = window.TEUI.FieldManager.getAllUserEditableFields();

  window.TEUI.StateManager.muteListeners();
  try {
    let copiedCount = 0;
    allFields.forEach(fieldId => {
      if (fieldId === 'd_13') return; // Never copy building standard

      const targetValue = window.TEUI.StateManager.getValue(fieldId);
      if (targetValue !== null && targetValue !== undefined && targetValue !== '') {
        window.TEUI.StateManager.setValue(`ref_${fieldId}`, targetValue, 'mirror');
        copiedCount++;
      }
    });

    console.log(`[ReferenceToggle] ✅ Perfect clone: ${copiedCount} fields copied`);

    if (window.TEUI.FileHandler?.syncPatternASections) {
      window.TEUI.FileHandler.syncPatternASections();
    }
  } finally {
    window.TEUI.StateManager.unmuteListeners();
  }

  if (window.TEUI?.Calculator?.calculateAll) {
    window.TEUI.Calculator.calculateAll();
  }

  refreshPatternAUIs();
  applyMirrorHighlights(allFields, 'all');
}
```

#### PHASE 3: Fix Visual Highlighting (Use FieldManager)

**Problem:** Previous approach used DOM selectors which failed

**Solution:** Use FieldManager to access field elements or trigger UI updates

**Option 1: Leverage Pattern A refreshUI (RECOMMENDED)**
```javascript
function applyMirrorHighlights(fieldIds, mode) {
  // After refreshPatternAUIs(), DOM should be updated
  // Add highlights to visible fields in Reference mode

  setTimeout(() => {
    // Check if we're in Reference mode
    const isReferenceMode = window.TEUI.ReferenceToggle?.isReferenceMode?.() || false;
    if (!isReferenceMode) {
      console.log('[ReferenceToggle] Not in Reference mode - skipping highlights');
      return;
    }

    fieldIds.forEach(fieldId => {
      if (fieldId === 'd_13') return;

      const classification = getFieldClassification(fieldId);
      let shouldHighlight = false;

      if (mode === 'geometry') shouldHighlight = (classification === 'G');
      else if (mode === 'geometry-plus-code') shouldHighlight = (classification === 'G' || classification === 'C');
      else if (mode === 'all') shouldHighlight = true;

      if (!shouldHighlight) return;

      // Try to find field element (this may still need refinement)
      const refFieldId = `ref_${fieldId}`;
      const element = document.querySelector(`[data-field-id="${refFieldId}"]`) ||
                      document.querySelector(`input[name="${refFieldId}"]`) ||
                      document.querySelector(`select[name="${refFieldId}"]`);

      if (element) {
        element.classList.add('mirror-highlight');
      }
    });

    setupHighlightRemovalListener();
  }, 200); // Delay to ensure UI refresh completes
}
```

**Option 2: Skip visual highlighting initially, focus on working copy**
- Get mirror functions working FIRST
- Add highlighting as polish later
- User can verify copy by inspecting values in UI

#### PHASE 4: Helper Function - Refresh Pattern A UIs

```javascript
function refreshPatternAUIs() {
  const patternASections = [
    'sect02', 'sect03', 'sect04', 'sect05', 'sect06',
    'sect07', 'sect08', 'sect09', 'sect10', 'sect11',
    'sect12', 'sect13', 'sect14', 'sect15'
  ];

  patternASections.forEach(sectionId => {
    const section = window.TEUI?.SectionModules?.[sectionId];
    if (section?.ModeManager?.refreshUI) {
      section.ModeManager.refreshUI();
      if (section.ModeManager.updateCalculatedDisplayValues) {
        section.ModeManager.updateCalculatedDisplayValues();
      }
    }
  });

  console.log('[ReferenceToggle] ✅ Pattern A section UIs refreshed');
}
```

### Testing Protocol (CRITICAL - Test Incrementally!)

**Test 1: Single Field Copy (Smoke Test)**
```javascript
// In browser console
window.TEUI.StateManager.setValue('d_105', 8000, 'user'); // Set Target volume
window.TEUI.StateManager.setValue('ref_d_105', 9000, 'user'); // Set Reference volume
console.log('Before:', window.TEUI.StateManager.getValue('ref_d_105')); // Should show 9000

// Test direct StateManager write
window.TEUI.StateManager.setValue('ref_d_105', 8000, 'mirror');
console.log('After:', window.TEUI.StateManager.getValue('ref_d_105')); // Should show 8000

// If this works, the approach is valid
// If this fails, StateManager itself has issues
```

**Test 2: Geometry Function (Core Functionality)**
```javascript
// Set distinct values in Target vs Reference
window.TEUI.StateManager.setValue('d_105', 8000, 'user');
window.TEUI.StateManager.setValue('ref_d_105', 9000, 'user');
window.TEUI.StateManager.setValue('h_15', 500, 'user'); // Area
window.TEUI.StateManager.setValue('ref_h_15', 600, 'user');

// Call mirror function
window.TEUI.ReferenceToggle.mirrorGeometry();

// Verify values copied
console.log('Volume:', window.TEUI.StateManager.getValue('ref_d_105')); // Should be 8000
console.log('Area:', window.TEUI.StateManager.getValue('ref_h_15')); // Should be 500
```

**Test 3: UI Updates (Visual Verification)**
- Switch to Reference mode
- Verify fields show new values in DOM
- Verify calculations updated (e_10 should change)

**Test 4: Performance Fields Excluded**
```javascript
// Set performance field
window.TEUI.StateManager.setValue('f_85', 5.0, 'user'); // Roof RSI
window.TEUI.StateManager.setValue('ref_f_85', 3.0, 'user');

// Call mirror geometry
window.TEUI.ReferenceToggle.mirrorGeometry();

// Verify f_85 NOT copied (should still be 3.0)
console.log('Roof RSI:', window.TEUI.StateManager.getValue('ref_f_85')); // Should be 3.0 (unchanged)
```

### Files to Modify

1. **src/core/ReferenceToggle.js**
   - Replace current broken mirror functions (lines ~767-1000)
   - Use StateManager pattern (FileHandler approach)
   - Keep field classification helper `shouldCopyFieldForMode()` (lines ~730-760)
   - Keep G/C/A classification `getFieldClassification()` if it exists

2. **src/styles.css**
   - ✅ Keep existing `.mirror-highlight` styles (these are fine)

3. **index.html**
   - ✅ Button wiring already correct (no changes needed)

### What to Keep from Current Implementation

✅ **KEEP:**
- Field classification patterns (d_39, i_41 exclusion)
- G/C/A classification system (Field-Classification-GCA.md)
- CSS `.mirror-highlight` styles
- Button UI structure in index.html
- `shouldCopyFieldForMode()` helper function
- Highlight removal listener logic

❌ **DELETE/REPLACE:**
- All three mirror functions (mirrorGeometry, mirrorGeometryPlusCode, mirrorAllInputs)
- `getFieldIdsForSection()` helper (use FieldManager instead)
- `applyMirrorHighlights()` DOM selector approach (rewrite using Pattern A refresh)

---

## Documentation Consolidation Required

### Current Documentation Files (Conflicting/Redundant)

1. **Mirror-Functions-Implementation-Summary.md** (this file)
   - ✅ KEEP as primary implementation guide
   - ✅ NOW contains complete repair plan with FileHandler pattern
   - ✅ Consolidates all lessons learned

2. **Field-Classification-GCA.md**
   - ✅ KEEP - Accurate G/C/A field classification from CSV metadata
   - Referenced by this document
   - No changes needed

3. **Mirror-Target-Field-Analysis.md**
   - ⚠️ OUTDATED - Original planning document
   - Contains section-by-section approach (proven wrong)
   - **ACTION:** Move to `history (completed)/` folder with date prefix
   - **NEW NAME:** `2025-11-27-Mirror-Target-Field-Analysis-OUTDATED.md`

4. **2025-01-13-Mirror-Target-Postmortem.md** (in history folder)
   - ✅ KEEP - Documents earlier failed attempt (different approach)
   - Already in correct location
   - Provides historical context

### Consolidation Actions

```bash
# Move outdated planning doc to history
mv docs/development/Mirror-Target-Field-Analysis.md \
   docs/development/history\ \(completed\)/2025-11-27-Mirror-Target-Field-Analysis-OUTDATED.md
```

### Primary Documentation Hierarchy

After consolidation:

```
docs/development/
├── Mirror-Functions-Implementation-Summary.md  ← PRIMARY (this file)
├── Field-Classification-GCA.md               ← REFERENCE (field metadata)
└── history (completed)/
    ├── 2025-01-13-Mirror-Target-Postmortem.md     ← Historical failure #1
    └── 2025-11-27-Mirror-Target-Field-Analysis-OUTDATED.md  ← Historical planning (section approach)
```

---

## Summary: Path Forward

### What Failed
- ❌ Section-by-section approach with `section.modeManager.setValue()`
- ❌ DOM selector approach for highlighting
- ❌ Not using FileHandler pattern as reference
- ❌ Not testing incrementally

### What Works (Proven)
- ✅ FileHandler's StateManager bulk operations (FileHandler.js:422-476)
- ✅ Quarantine pattern (mute/unmute listeners)
- ✅ Pattern A section sync
- ✅ Clean recalculation after bulk writes
- ✅ Field classification logic (d_39, i_41 exclusions)

### Implementation Checklist

- [ ] **Test 1:** Verify `StateManager.setValue('ref_fieldId', value, 'mirror')` works in console
- [ ] **Code:** Rewrite `mirrorGeometry()` using StateManager pattern (30 lines)
- [ ] **Code:** Rewrite `mirrorGeometryPlusCode()` using StateManager pattern (40 lines)
- [ ] **Code:** Rewrite `mirrorAllInputs()` using StateManager pattern (30 lines)
- [ ] **Code:** Add `refreshPatternAUIs()` helper function (20 lines)
- [ ] **Test 2:** Verify values copy correctly in StateManager
- [ ] **Test 3:** Verify UI updates after mirror operation
- [ ] **Test 4:** Verify calculations update (e_10 changes)
- [ ] **Test 5:** Verify performance fields excluded in Geometry mode
- [ ] **Polish:** Fix highlighting (use Pattern A refresh or defer)
- [ ] **Docs:** Move Mirror-Target-Field-Analysis.md to history folder
- [ ] **Commit:** Using .clinerules format with Co-Author line

### Estimated Effort (Correct Approach)

- **Code rewrite:** 2-3 hours (100 lines total, mostly copy-paste from FileHandler pattern)
- **Testing:** 1 hour (incremental testing prevents wasted time)
- **Highlighting fix:** 1 hour (or defer as polish)
- **Total:** 4-5 hours vs. days of debugging broken approach

### Key Success Factors

1. **Use proven patterns** - FileHandler already solved this problem
2. **Test incrementally** - Single field → Function → UI → Calculations
3. **Listen to user** - They suggested FieldManager/StateManager from start
4. **Focus on core first** - Get copy working, polish highlighting later
5. **No section modifications** - Centralized StateManager operations only

---

## Commit Message (After Successful Rewrite)

```bash
git commit -m "$(cat <<'EOF'
Feat: Implement mirror functions using FileHandler/StateManager pattern

Three new mirror functions to copy Target → Reference values:
1. Geometry - Copy geometric fields only (~35 G fields)
2. Geometry + Code - Copy geometry + overlay building code minimums (~103 G+C fields)
3. All Inputs - Perfect clone except d_13 (~126 fields)

Uses proven FileHandler pattern:
- Direct StateManager.setValue() operations (not section-level)
- Quarantine pattern (mute/unmute listeners)
- Pattern A section sync for UI updates
- Clean recalculation after bulk writes

Field classification excludes performance parameters (RSI values,
equipment efficiencies, d_39, i_41) from Geometry mode, allowing
users to compare same building with different performance specs.

Files modified:
- src/core/ReferenceToggle.js (rewrite mirror functions, ~150 lines)
- docs/development/Mirror-Functions-Implementation-Summary.md (repair plan)

References:
- FileHandler.js:422-520 (import pattern)
- Field-Classification-GCA.md (G/C/A metadata)

🤖 Co-Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Andy & Claude <andy@openbuilding.ca>
EOF
)"
```
