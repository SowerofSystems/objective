# Global Reference Toggle Only - Remove Section-Specific Toggles

**Date**: November 20, 2025
**Branch**: `D13-UPDATE`
**Status**: 🎯 PLANNED - Eliminate mode awareness confusion

---

## Problem Statement

The application currently has TWO mode switching mechanisms:

1. **Global Toggle** (`window.TEUI.ModeManager` in index.html) - Production feature ✅
2. **Section-Specific Toggles** (local `ModeManager` in each section) - Development/testing feature ⚠️

This creates mode awareness confusion:
- Section code reads `ModeManager.currentMode` (local instance)
- Global toggle changes `window.TEUI.ModeManager.currentMode` (global instance)
- These can be out of sync, causing state contamination bugs
- Example: S09 state contamination bug (commits a1a0fbe, b057ae9, bdd45b0)
- Local reset buttons also add confusion about state management

**Goal**: ONE source of truth for current mode - the global toggle only.

---

## Current Architecture Analysis

### Section-Specific ModeManager Pattern

Each section (S02-S16) has:

```javascript
const ModeManager = {
  currentMode: "target",  // Local state - can drift from global!

  initialize: function() { ... },

  setValue: function(fieldId, value, state) {
    // Uses local currentMode to determine namespace
    if (this.currentMode === "reference") {
      ReferenceState.setValue(fieldId, value);
      window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, state);
    } else {
      TargetState.setValue(fieldId, value);
      window.TEUI.StateManager.setValue(fieldId, value, state);
    }
  },

  refreshUI: function() { ... },
  updateCalculatedDisplayValues: function() { ... },

  // Toggle functionality (development feature)
  toggleMode: function() {
    this.currentMode = this.currentMode === "target" ? "reference" : "target";
    this.refreshUI();
  }
};
```

### Global ModeManager (Production)

Located in index.html or core file:
- `window.TEUI.ModeManager.currentMode` - Single source of truth
- Global toggle button updates this value
- Should be the ONLY mode switch in production

---

## Implementation Plan

### Phase 1: Audit and Understand (1 section)

**Section to test**: Section09 (already has state contamination fixes)

1. **Map all ModeManager references in S09**:
   - Where `ModeManager.currentMode` is read
   - Where `ModeManager.setValue()` is called
   - Where `ModeManager.refreshUI()` is called
   - Any toggle UI buttons in section header
   - Any reset buttons in section header (development-only)

2. **Verify global ModeManager exists**:
   - Check `window.TEUI.ModeManager` is available
   - Confirm it has same methods: `setValue()`, `refreshUI()`, etc.
   - Test that global toggle updates `window.TEUI.ModeManager.currentMode`

3. **Create replacement pattern**:
   - Replace `ModeManager.currentMode` → `window.TEUI.ModeManager.currentMode`
   - Keep local helper methods if they provide value (setValue, refreshUI)
   - OR: Delegate to global ModeManager methods entirely

4. **Test in S09**:
   - Load app, verify global toggle works
   - Test d_13 PH standard changes in both modes
   - Verify no state contamination (d_65, h_10 isolation)
   - Check that local toggle button is gone from S09 header

### Phase 2: Apply Pattern to All Sections (S02-S16)

For each section (in order):

**Sections**: S02, S03, S04, S05, S06, S07, S08, S09 ✅, S10, S11, S12, S13, S14, S15, S16

**Per-Section Steps**:

1. **Find all `ModeManager.currentMode` reads**:
   ```javascript
   // BEFORE:
   if (ModeManager.currentMode === "reference") { ... }

   // AFTER:
   if (window.TEUI.ModeManager.currentMode === "reference") { ... }
   ```

2. **Update setValue() helper** (if section has custom implementation):
   ```javascript
   // Keep helper function but read from global mode
   setValue: function(fieldId, value, state) {
     const currentMode = window.TEUI.ModeManager.currentMode;
     if (currentMode === "reference") {
       ReferenceState.setValue(fieldId, value);
       window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, state);
     } else {
       TargetState.setValue(fieldId, value);
       window.TEUI.StateManager.setValue(fieldId, value, state);
     }
   }
   ```

3. **Remove local toggle UI** (if exists):
   - Search for toggle button injection in section header
   - Remove button creation code
   - Remove `toggleMode()` method from ModeManager
   - Remove local `currentMode` property
   - **Remove local reset buttons** - these are also development-only features

4. **Keep useful helper methods**:
   - `initialize()` - needed for dual-state setup
   - `setValue()` - convenience wrapper (now reads global mode)
   - `getValue()` - convenience wrapper (now reads global mode)
   - `refreshUI()` - section-specific UI updates
   - `updateCalculatedDisplayValues()` - section-specific display logic

5. **Test after each section**:
   - Global toggle switches modes correctly
   - Section calculations respect global mode
   - No state contamination between models
   - Import/Export still works
   - "Set Values" button works in both modes

### Phase 3: Cleanup and Verification

1. **Remove unused toggle infrastructure**:
   - Check `src/core/ToggleUISync.js` - still needed?
   - Check `src/core/ReferenceToggle.js` - global toggle implementation
   - Remove any dead code for section-specific toggles

2. **Update documentation**:
   - CLAUDE.md - note that only global toggle exists
   - 4012-CHEATSHEET.md - clarify mode-awareness uses global ModeManager
   - Add note about removing section toggles (this workplan)

3. **Final integration test**:
   - Load app fresh
   - Switch to Reference mode via global toggle
   - Click "Set Values" with PH Classic selected
   - Verify ref_d_65, ref_d_66 update correctly
   - Switch back to Target mode
   - Verify d_65, d_66 unchanged (state isolation)
   - Test all 14 sections' basic functionality
   - Run full calculation cascade test (d_80, d_97 changes)

---

## Success Criteria

✅ **ONE source of truth**: Only `window.TEUI.ModeManager.currentMode` determines mode
✅ **No local toggles**: Section headers have no mode toggle buttons
✅ **State isolation**: Target and Reference models remain independent
✅ **Global toggle works**: All sections respond to global mode switch
✅ **Calculations correct**: No state contamination in any section
✅ **Import/Export works**: FileHandler operations respect global mode
✅ **Set Values works**: ReferenceValues.js applies correctly in both modes

---

## Rollback Plan

If issues arise:
1. **Per-section rollback**: Revert individual section files to before changes
2. **Full rollback point**: Current HEAD (commit bdd45b0) has working global toggle
3. **Test branch**: Create `global-ref-only` branch before starting work

---

## Risk Assessment

**Low Risk**:
- Global ModeManager already exists and works
- Pattern is simple: replace local reference with global reference
- Changes are incremental (one section at a time)
- Easy to test after each change

**Medium Risk**:
- Some sections might have custom toggle logic we don't understand yet
- Helper methods might have side effects beyond mode switching
- Could break if global ModeManager doesn't have expected methods

**Mitigation**:
- Test S09 first (we know it well from recent fixes)
- Keep local helper methods (setValue, refreshUI) - only change mode source
- Test thoroughly after each section update
- Commit after each successful section conversion

---

## Implementation Order (Recommended)

1. **S09** - We just fixed state contamination here, know it well ✅
2. **S02** - Simple inputs section, good test case
3. **S10** - Internal gains, has complex calculations
4. **S11** - Envelope, thermal bridge logic
5. **S12** - Mechanical systems, dropdown logic
6. **S13** - Heating/cooling loops
7. **S14** - Final energy calculations
8. **S03-S08** - Simpler sections, lower risk
9. **S15-S16** - Last sections to convert

---

## Code Pattern Reference

### Before (Section-Specific Toggle):

```javascript
const ModeManager = {
  currentMode: "target",  // ❌ Local state

  setValue: function(fieldId, value, state) {
    if (this.currentMode === "reference") {  // ❌ Reads local
      // ...
    }
  },

  toggleMode: function() {  // ❌ Local toggle
    this.currentMode = this.currentMode === "target" ? "reference" : "target";
    this.refreshUI();
  }
};
```

### After (Global Toggle Only):

```javascript
const ModeManager = {
  // ❌ REMOVED: currentMode property
  // ❌ REMOVED: toggleMode method

  setValue: function(fieldId, value, state) {
    const currentMode = window.TEUI.ModeManager.currentMode;  // ✅ Reads global
    if (currentMode === "reference") {
      ReferenceState.setValue(fieldId, value);
      window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, state);
    } else {
      TargetState.setValue(fieldId, value);
      window.TEUI.StateManager.setValue(fieldId, value, state);
    }
  },

  refreshUI: function() {
    const currentMode = window.TEUI.ModeManager.currentMode;  // ✅ Reads global
    // Section-specific UI refresh logic...
  },

  // Keep other helper methods that provide value
  initialize: function() { ... },
  getValue: function(fieldId) { ... },
  updateCalculatedDisplayValues: function() { ... }
};
```

---

## Questions to Resolve

1. **Does global ModeManager have all needed methods?**
   - setValue(), getValue(), refreshUI(), etc.?
   - Or do sections need to keep local helper wrappers?

2. **Where is global ModeManager defined?**
   - index.html?
   - Separate core file?
   - Need to verify it's loaded before sections initialize

3. **Are there any sections without local toggles?**
   - S01 might be different (summary section)
   - S16, S17, S18 might have different patterns

4. **What about ReferenceToggle.js?**
   - Is this the global toggle implementation?
   - Does it sync with window.TEUI.ModeManager?

---

**Next Steps**:
1. Answer questions above via code inspection
2. Test S09 conversion first (tomorrow morning)
3. Document working pattern for other sections
4. Proceed incrementally through S02-S16

**Estimated Time**: 1-2 hours (assuming pattern is consistent across sections)

**Branch Strategy**: Create `global-ref-only` branch from current HEAD before starting
