#### CRITICAL BUG: State Mixing in S07 (and possibly S13) - Dual Efficiency Field Confusion

**Discovered**: 2025-11-27
**Priority**: HIGH
**Affects**: S07 Water Use efficiency calculations, S18 Optimize graph, TEUI calculations
**Symptom**: When S18 converts SHW system from Gas → Heatpump, efficiency value reads from wrong field, causing SHW% to be extremely low (off-chart in S18 graph, delta of +9900%)

**REVISED THEORY - S07 Dual Efficiency Fields**:
Section 07 defines **two different efficiency fields**:
- `d_52`: DHW EF/COP (Slider) - Used for **Heatpump** systems (COP values, e.g., 3.0)
- `k_52`: SHW AFUE (Editable Number) - Used for **Gas/Oil** systems (AFUE values, e.g., 0.90)

**The Problem**:
When S18 Optimize converts SHW system from Gas → Heatpump:
- System should flip from reading `k_52` (AFUE, ~0.90) to `d_52` (COP, ~3.0)
- BUT system reads the **wrong field** after conversion
- Result: SHW efficiency dramatically incorrect (9900% delta in S18 graph)
- Cascades to wrong TEUI calculations in S01

**Similar Issue in S13**:
- `d_113`: Primary Heating System dropdown (Gas/Heatpump/etc.)
- `j_115`: AFUE for Gas/Oil systems
- `f_113`: HSPF for Heatpump systems
- `j_116`: Cooling COP (conditionally calculated vs. editable)

**Pattern**: Multiple sections have **conditional efficiency fields** that change based on system type, but field selection logic may not properly update during S18 optimization

**🎯 CRITICAL DISCOVERY - S18 "Decarbonize" Button is the Trigger**:
- State mixing is **introduced by S18's "Decarbonize" button**
- After clicking Decarbonize, calculations remain **permanently broken** until page reload or re-import
- This strongly suggests S18 is:
  1. Setting field values incorrectly during optimization
  2. Skipping required field updates when switching system types
  3. Not triggering proper recalculation after state changes
  4. Leaving StateManager in inconsistent state (mixed old/new values)

**Why This Matters**:
- Bug is **not in import logic** (that works correctly for 8 months)
- Bug is **not in S01 display** (that also worked correctly for 8 months)
- Bug is **in S18 optimization** when it updates system type dropdowns
- S18 needs to update BOTH the system type AND clear/recalculate conditional efficiency fields

---

## S07 Evidence: SHW% Delta of +9900%

**Observed in S18 Optimize Graph**:
- After "Refresh Graph" with SHW system converted to Heatpump
- SHW% value so low it appears **off-chart** (below visible range)
- Delta calculation shows **+9900%** increase
- This indicates efficiency value is reading ~100x lower than expected

**Expected Behavior**:
```
Gas SHW System:
  d_51 = "Gas"
  k_52 = 0.90 (AFUE)
  System reads k_52 for efficiency → 90% efficient

Heatpump SHW System:
  d_51 = "Heatpump"
  d_52 = 300 (COP 3.0 stored as percentage)
  System should read d_52 for efficiency → 300% efficient (COP 3.0)
```

**Actual Behavior (BUG)**:
```
After S18 converts Gas → Heatpump:
  d_51 = "Heatpump" ✅ (updated correctly)
  d_52 = 300 ✅ (COP value set correctly)
  k_52 = 0.90 ⚠️ (old AFUE value still present)

  System reads k_52 instead of d_52 → 0.90 instead of 300
  Result: SHW efficiency appears 333x LOWER than expected
  Delta: (300 - 0.90) / 0.90 = 332.22 = +33,222%
  (Screenshot shows +9900%, suggesting partial calculation error)
```

**Impact on TEUI**:
- S07 calculates domestic hot water energy use
- Wrong efficiency (0.90 vs 300) → energy use calculated 333x higher
- Cascades to S04 energy totals (j_32)
- Cascades to S01 TEUI calculation (h_10 = j_32 / h_15)
- **Result**: h_10 shows 159 instead of expected 511

---

## Root Cause (HYPOTHESIS):
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

**Testing Results (2025-11-27 - Commit 01b062f)**:

**Initial Test - Import with d_113="Heatpump" conversion**:
1. ✅ Exported file with `d_113="Gas"`, `j_116=0.90`
2. ✅ Re-imported file
3. ✅ User changed `d_113` to "Heatpump" in app
4. ✅ Toggled Target ↔ Reference modes multiple times

**Partial Success**:
- ✅ **Actual TEUI stabilized**: `e_10` (Actual kWh/yr) and `k_10` (Actual TEUI kWh/m²) no longer change on mode toggle
- ❌ **Target TEUI still recalculates**: `h_10` (Target TEUI kWh/m²) changes value on every mode toggle

**Implications**:
- Two-pass import successfully prevents Reference field state mixing for j_116
- Additional investigation needed: Target calculation cascade during mode toggle
- Likely causes:
  1. Section13 or dependent section triggering calculations during refreshUI()
  2. Pattern A refreshUI() inadvertently calling setValue() → Calculator cascade
  3. Mode toggle listener calling calculateAll() when it should only update display

**Diagnostic Script** (paste in console to log mode toggle behavior):

```javascript
// Mode Toggle Diagnostic Logger
(function() {
  const log = [];
  const startTime = Date.now();

  // Capture h_10 before toggle
  const h10Before = window.TEUI.StateManager.getValue('h_10');
  const e10Before = window.TEUI.StateManager.getValue('e_10');
  const k10Before = window.TEUI.StateManager.getValue('k_10');

  log.push(`=== MODE TOGGLE DIAGNOSTIC START ===`);
  log.push(`Time: ${new Date().toISOString()}`);
  log.push(`BEFORE TOGGLE:`);
  log.push(`  h_10 (Target TEUI): ${h10Before}`);
  log.push(`  e_10 (Actual kWh):  ${e10Before}`);
  log.push(`  k_10 (Actual TEUI): ${k10Before}`);
  log.push(``);

  // Hook into StateManager setValue to catch what changes h_10
  const originalSetValue = window.TEUI.StateManager.setValue;
  window.TEUI.StateManager.setValue = function(fieldId, value, source) {
    if (fieldId === 'h_10' || fieldId === 'e_10' || fieldId === 'k_10') {
      const stack = new Error().stack;
      const caller = stack.split('\n')[2]?.trim() || 'unknown';
      log.push(`🔴 ${fieldId} CHANGED → ${value} (source: ${source})`);
      log.push(`   Called from: ${caller}`);
    }
    return originalSetValue.call(this, fieldId, value, source);
  };

  // Hook into Calculator.calculateAll
  const originalCalculateAll = window.TEUI.Calculator.calculateAll;
  window.TEUI.Calculator.calculateAll = function() {
    log.push(`⚡ Calculator.calculateAll() CALLED`);
    const stack = new Error().stack;
    const caller = stack.split('\n')[2]?.trim() || 'unknown';
    log.push(`   Called from: ${caller}`);
    return originalCalculateAll.call(this);
  };

  console.log('✅ Diagnostic logger active. Toggle mode, then run: window.TEUI_DIAGNOSTIC_DUMP()');

  // Dump function
  window.TEUI_DIAGNOSTIC_DUMP = function() {
    const h10After = window.TEUI.StateManager.getValue('h_10');
    const e10After = window.TEUI.StateManager.getValue('e_10');
    const k10After = window.TEUI.StateManager.getValue('k_10');

    log.push(``);
    log.push(`AFTER TOGGLE:`);
    log.push(`  h_10 (Target TEUI): ${h10After} ${h10After !== h10Before ? '⚠️ CHANGED' : '✅ stable'}`);
    log.push(`  e_10 (Actual kWh):  ${e10After} ${e10After !== e10Before ? '⚠️ CHANGED' : '✅ stable'}`);
    log.push(`  k_10 (Actual TEUI): ${k10After} ${k10After !== k10Before ? '⚠️ CHANGED' : '✅ stable'}`);
    log.push(``);
    log.push(`Duration: ${Date.now() - startTime}ms`);
    log.push(`=== MODE TOGGLE DIAGNOSTIC END ===`);

    // Restore original functions
    window.TEUI.StateManager.setValue = originalSetValue;
    window.TEUI.Calculator.calculateAll = originalCalculateAll;

    // Output
    const output = log.join('\n');
    console.log(output);
    return output; // Return for copy/paste to Logs.md
  };
})();
```

**Usage**:
1. Paste script in console → Activates logger
2. Toggle Target ↔ Reference mode ONCE
3. Run `window.TEUI_DIAGNOSTIC_DUMP()` in console
4. Copy output and paste into Logs.md for analysis

**CRITICAL DISCOVERY (2025-11-27)**:
🎯 **Root cause identified**: Issue only occurs when **S18 (Parallel Coordinates)** sets d_113 to "Heatpump"
- ✅ **S13 edit stable**: User editing d_113 directly in Section13 → No h_10 recalculation on toggle
- ❌ **S18 edit unstable**: S18 setting d_113 via optimization → h_10 recalculates on every toggle

**Error Fixed (Commit 43f813e)**:
- ✅ Added guard for undefined `stateIndicator` in `updateKeyValuesToggleUI()`
- ✅ Prevents TypeError during mode toggle
- ❌ **BUT** error was symptom, not cause - h_10 recalculation persists

**Actual Root Cause Identified from Logs.md**:

```
Section01.js:943 🔍 [S01DB] UPDATING h_10: 167.0 (from j_32=1864716.6687405566, area=11167)
```

**The Real Problem**: `Section01.updateTEUIDisplay()` is **recalculating AND writing** h_10 back to StateManager during mode toggle.

**Call Chain**:
1. Mode toggle occurs (Target ↔ Reference)
2. Some listener fires → calls `Section01.runAllCalculations()`
3. `runAllCalculations()` → calls `updateTEUIDisplay()` (line 1254)
4. `updateTEUIDisplay()` → recalculates h_10 from j_32 and area
5. `updateTEUIDisplay()` → calls `updateDisplayValue("h_10", h10Formatted)` (line 945)
6. `updateDisplayValue()` → likely calls `StateManager.setValue("h_10", ...)` with source that triggers listeners
7. **h_10 value changes during what should be view-only mode toggle**

**Why This Violates Architecture**:
- `updateTEUIDisplay()` claims to be "PURE DISPLAY CONSUMER" (comment at line 759)
- **But** it's actually a calculator that writes back to StateManager
- Should only read state and update DOM, NEVER write state during display update
- Mode toggle should be pure view operation - no calculations, no state writes

**Why S13 Edit Works But S18 Doesn't**:
- **S13 direct edit**: User changes d_113 → Section13 handles calculation → h_10 stabilizes before mode toggle
- **S18 optimization**: Sets d_113 → Some code path leaves listeners in unstable state → Every mode toggle retrigggers `runAllCalculations()` → h_10 recalculates indefinitely

**The Fix Required**:

Section01's `updateTEUIDisplay()` must be split into two separate functions:

```javascript
// OPTION 1: Calculate h_10 during Calculator.calculateAll() chain
function calculateTEUIValues() {
  // Called BY Calculator, not by display updates
  // Calculates h_10 from j_32/area
  // Writes to StateManager with 'calculated' source
  const targetEnergy = getGlobalNumericValue("j_32") || 0;
  const targetArea = getGlobalNumericValue("h_15") || 1427.2;
  const h_10 = Math.round((targetEnergy / targetArea) * 10) / 10;

  window.TEUI.StateManager.setValue("h_10", h_10, "calculated");
}

// OPTION 2: Pure display - reads from StateManager, updates DOM only
function updateTEUIDisplay() {
  // PURE CONSUMER: No calculations, no setState writes
  // Just reads h_10 from StateManager and updates DOM
  const h_10 = window.TEUI.StateManager.getValue("h_10");
  const h10Element = document.querySelector('[data-field-id="h_10"]');
  if (h10Element) {
    h10Element.textContent = h_10;
  }
}
```

**Current Antipattern**:
```javascript
// Section01.js:763 - Claims "PURE DISPLAY CONSUMER" but calculates AND writes
function updateTEUIDisplay() {
  // Reads j_32, area
  const targetEnergy = getGlobalNumericValue("j_32") || 0;
  const targetArea = getGlobalNumericValue("h_15") || 1427.2;

  // Calculates h_10 (should be in Calculator, not display function)
  const h_10 = Math.round((targetEnergy / targetArea) * 10) / 10;

  // ❌ WRITES BACK TO STATE (antipattern for "display consumer")
  updateDisplayValue("h_10", h_10); // Likely calls setState()
}
```

**Next Steps** (REVISED FOCUS - S18 Decarbonize Button):
1. ~~**Audit Section01.js**~~ - S01 is working correctly, not the source of bug
2. ~~**Fix import logic**~~ - Import has worked for 8 months, not the source of bug
3. **INVESTIGATE S18 Decarbonize Button** - THIS IS THE BUG SOURCE:
   - What does "Decarbonize" button do when it changes system types?
   - When it sets `d_51="Heatpump"` (SHW), does it also update `d_52` and clear `k_52`?
   - When it sets `d_113="Heatpump"` (Heating), does it update `f_113` and clear `j_115`?
   - Does it trigger proper recalculation after changing fields?
   - Does it set values with correct source parameter for StateManager?

4. **Audit S18 field update logic**:
   - Find "Decarbonize" button handler in Section18.js or ParallelCoordinates.js
   - Check if it updates conditional efficiency fields when changing system types
   - Verify it clears old efficiency values to prevent state mixing
   - Ensure it triggers Calculator.calculateAll() after updates

5. **Fix S18 to update ALL related fields when changing system type**:
   - When changing d_51 (DHW type) → update both d_52 AND k_52
   - When changing d_113 (Heating type) → update f_113, j_115, AND j_116
   - Clear stale values to prevent reading wrong efficiency field

**Files to Investigate**:
- Section18.js - Find "Decarbonize" button handler
- ParallelCoordinates.js - Optimization logic
- Look for: `d_51`, `d_52`, `k_52` field updates
- Look for: `d_113`, `f_113`, `j_115`, `j_116` field updates

**Priority**: HIGH - This breaks "mode toggle is view-only" principle, causing h_10 to drift over time

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

From Chat:

runAllCalculations() at line 1219 is triggering updateTEUIDisplay(). This function is called by listeners. The issue is that mode toggle is triggering these listeners, causing h_10 to recalculate. The problem: When you toggle modes, some section (likely S13 or the mode toggle itself) is calling setState() with a source that triggers listeners, which then calls runAllCalculations() → updateTEUIDisplay() → recalculates and writes h_10 back to StateManager. The key issue from your log line 943:
updateDisplayValue("h_10", h10Formatted, calculatedTier);
This is calling updateDisplayValue() which likely does StateManager.setValue(), triggering the cascade! The actual root cause: updateTEUIDisplay() should be display-only (updating DOM), but it's calling updateDisplayValue() which writes back to StateManager, creating a calculation loop. This is beyond the scope of the current session, but the fix would be to ensure updateTEUIDisplay() only updates DOM elements, never calls setState() with a source that triggers listeners. The function should be truly "display consumer" as its comment claims, not a "calculator + writer". Should I document this finding for future work?
