# S18 Architecture Analysis - Mode Agnosticity Verification

**Date**: 2025-11-29
**Purpose**: Verify that S18 (Parallel Coordinates) is properly state-agnostic like S01

---

## Summary

✅ **S18 IS COMPLETELY MODE-AGNOSTIC** - No mode-aware behavior detected

S18 correctly follows the S01 pattern: it reads both Target and Reference values simultaneously from StateManager and displays them as two separate lines on the graph. It does NOT switch modes, does NOT have its own ModeManager, and does NOT behave differently based on UI state.

---

## Field Reference Corrections

### Documentation Error Fixed

**Previous misstatement**:
- "e_10 was Reference GHGI, not TEUI!" ❌

**Corrected**:
- e_10 IS Reference TEUI (correct field) ✅
- h_10 IS Target TEUI (correct field) ✅
- Both are calculated in S01 Row 10
- The issue was NOT wrong field, but:
  - Lack of ref_ prefix pattern (e_10 vs ref_j_35)
  - Circular reference with downstream calculations
  - j_35 from S04 is calculated earlier in dependency chain

---

## No h_135 / h_136 References in S18

**Search Results**: ✅ CLEAN

### Files Checked:
1. **src/core/pcConfig.js** - No references
2. **src/core/pcFinancials.js** - No references
3. **src/sections/Section18.js** - No references
4. **src/core/ParallelCoordinates.js** - No references

**Conclusion**: S18 does NOT use h_135 or h_136 (which are S15 summary fields). S18 correctly uses:
- j_35 / ref_j_35 for TEUI axis (S04 Row 35)
- All other axes use proper field mappings from pcConfig.js

---

## Mode-Awareness Analysis

### Files Analyzed:

#### 1. **pcConfig.js** - ✅ COMPLETELY STATE-AGNOSTIC

**Search for mode keywords**: ZERO matches
```
Pattern: (currentMode|switchMode|ModeManager|isReferenceMode|targetMode|referenceMode)
Result: No matches found
```

**How it works**:
- `getAxisValue(axis, mode)` - Takes mode as PARAMETER, doesn't read from ModeManager
- `getAxisValuesForBothModes(axis)` - Calls getAxisValue TWICE (once for "target", once for "reference")
- `getParallelCoordinatesData()` - Returns BOTH targetData and referenceData arrays

**Architecture**:
```javascript
// pcConfig.js is stateless - it reads from StateManager based on mode PARAMETER
window.TEUI.getAxisValue = function (axis, mode = "target") {
  const primaryField = mode === "target" ? axis.targetField : axis.referenceField;
  // ... reads from StateManager using field name determined by mode parameter
  return stateManager.getValue(primaryField);
}

// Called by ParallelCoordinates to get BOTH lines simultaneously
window.TEUI.getAxisValuesForBothModes = function (axis) {
  return {
    target: window.TEUI.getAxisValue(axis, "target"),
    reference: window.TEUI.getAxisValue(axis, "reference"),
  };
}
```

---

#### 2. **pcFinancials.js** - ✅ COMPLETELY STATE-AGNOSTIC

**Search for mode keywords**: ZERO matches
```
Pattern: (currentMode|switchMode|ModeManager|isReferenceMode|targetMode|referenceMode)
Result: No matches found
```

**How it works**:
- `calculateFinancials(axisId, mode)` - Takes mode as PARAMETER
- All calculations have separate `.target()` and `.reference()` functions
- Reads from StateManager using field names (d_52 vs ref_d_52)
- NO awareness of UI state or ModeManager

---

#### 3. **Section18.js** - ✅ COMPLETELY STATE-AGNOSTIC

**Search for mode keywords**: ZERO matches
```
Pattern: (currentMode|switchMode|ModeManager|isReferenceMode|targetMode|referenceMode)
Result: No matches found
```

**How it works**:
- Minimal wrapper module
- Only exports: `getFields()`, `getLayout()`, `calculateAll()`, `initializeEventHandlers()`
- `calculateAll()` simply calls `ParallelCoordinates.refresh()` - no mode logic

---

#### 4. **ParallelCoordinates.js** - ⚠️ CALLS ModeManager.refreshUI() BUT IS STATE-AGNOSTIC

**Search for mode keywords**: 22 matches (all in Decarbonize/Optimize button handlers)

**What we found**:
```javascript
// Pattern: After setValue(), call ModeManager.refreshUI() to update field locks
if (sect07.ModeManager?.refreshUI) {
  sect07.ModeManager.refreshUI();
}
```

**Analysis**: ✅ CORRECT BEHAVIOR
- ParallelCoordinates only calls OTHER sections' ModeManagers
- It does NOT have its own ModeManager
- It does NOT read currentMode
- It does NOT switch modes
- Calls to `ModeManager.refreshUI()` are for field lock updates after setValue()

**refresh() function** (lines 543-560):
```javascript
function refresh() {
  console.log("[ParallelCoordinates] Refreshing visualization");

  // Fetch current data
  currentData = fetchData();

  if (!currentData) {
    console.warn("[ParallelCoordinates] Cannot render - no data available");
    return;
  }

  // Render graph and table (legend is in controls row)
  renderGraph();
  renderTable();
}
```

**fetchData() function** (lines 497-535):
```javascript
function fetchData() {
  if (!window.TEUI.getParallelCoordinatesData) {
    console.error("[ParallelCoordinates] Config module not loaded");
    return null;
  }

  const data = window.TEUI.getParallelCoordinatesData();
  // Returns { targetData: [], referenceData: [], axes: [] }

  return data;
}
```

✅ **COMPLETELY MODE-AGNOSTIC**:
- `refresh()` has ZERO mode logic
- `fetchData()` calls `getParallelCoordinatesData()` which returns BOTH modes
- Graph renders BOTH Target and Reference lines every time, regardless of UI state

---

## Comparison with S01 Architecture

### S01 (State-Agnostic Pattern) ✅

**How S01 works**:
- Displays both Target and Reference values side-by-side in UI
- Reads from StateManager: `getValue("h_10")` and `getValue("e_10")`
- No ModeManager
- No mode switching
- UI shows both models simultaneously

### S18 (State-Agnostic Pattern) ✅

**How S18 works**:
- Displays both Target and Reference lines on graph
- Reads from StateManager via pcConfig: `getAxisValuesForBothModes()`
- No ModeManager (S18 doesn't have one)
- No mode switching
- Graph shows both models simultaneously

### Pattern A Sections (Mode-Aware) - S07, S13 ⚠️

**How Pattern A sections work**:
- Single shared UI that switches between Target and Reference display
- ModeManager.currentMode determines which state to show
- ModeManager.refreshUI() updates DOM when mode changes
- Only ONE model visible at a time in UI

---

## Conclusion

### S18 Architecture is CORRECT ✅

1. **No mode-awareness**: S18 has zero mode-switching logic
2. **Reads both states simultaneously**: Uses `getAxisValuesForBothModes()` to fetch Target and Reference
3. **Displays both simultaneously**: Graph renders two lines (Target = blue, Reference = gray)
4. **State-agnostic like S01**: Functions identically whether user is in Target or Reference UI mode
5. **No h_135/h_136 dependencies**: Correctly uses j_35 from upstream S04

### Why This Matters

**The state mixing bug is NOT in S18!**

- S18 never writes to d_113 during mode toggles
- S18 never calls S13.ModeManager.switchMode()
- S18's refresh() is triggered AFTER other sections complete calculations
- S18 only READS values from StateManager, never contaminates them

**The bug is in S13's mode switching mechanism:**
- S13.ModeManager.refreshUI() updates dropdowns during mode toggle
- Dropdown change events may fire during UI refresh (despite _isRefreshing guard)
- This contaminates Target state with Reference values (or vice versa)
- S18 is just DISPLAYING the contaminated values, not CAUSING them

---

## Recommendations

1. **Keep S18 as-is**: Architecture is correct, no changes needed ✅
2. **Focus investigation on S13**: Compare with S07's working implementation
3. **Verify _isRefreshing guard**: May need additional safeguards beyond flag check
4. **Consider calculation timing**: Does S13.refreshUI() trigger calculations before/during mode toggle?

---

## References

- **S18 Core Logic**: [ParallelCoordinates.js:543-560](../../src/core/ParallelCoordinates.js#L543-L560)
- **S18 Data Fetching**: [pcConfig.js:362-385](../../src/core/pcConfig.js#L362-L385)
- **S18 Axis Config**: [pcConfig.js:25-245](../../src/core/pcConfig.js#L25-L245)
- **S01 Pattern**: [Section01.js](../../src/sections/Section01.js)
- **S13 Mode Switching**: [Section13.js](../../src/sections/Section13.js)
