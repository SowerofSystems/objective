# Section 19 (WOMBAT) - Dual-State Architecture Implementation Plan

**Created**: 2025-12-12
**Updated**: 2025-12-13
**Status**: Nearly Complete - Table Display Updates Needed
**Related**: S12 bidirectional sync, Pattern A compliance

---

## 🎯 OBJECTIVE

Implement full Pattern A dual-state architecture in Section 19 to enable bidirectional synchronization with Section 12 for volume (d_105/d_198) and stories (d_103/d_199) fields.

---

## 🚨 CURRENT STATE ANALYSIS

### **What's Working** ✅
- One-way sync from S12 → S19 (lines 860-912)
- DOM event listeners for d_198/d_199 (lines 743-796)
- StateManager publication on user edits (but not mode-aware)
- 3D visualization engine (WOMBAT)

### **What's Missing** ❌

#### **1. Pattern A Dual-State Objects**
```javascript
// MISSING: TargetState object
const TargetState = {
  values: {
    d_198: "8000.00",  // Volume (mirrors S12 d_105)
    d_199: "1.5",      // Stories (mirrors S12 d_103)
    d_202: "0.0",      // Aspect ratio slider
  },
  getValue: function(fieldId) { ... },
  setValue: function(fieldId, value) { ... },
  setDefaults: function() { ... },
  syncFromGlobalState: function() { ... },
};

// MISSING: ReferenceState object (same structure)
const ReferenceState = { ... };

// MISSING: ModeManager facade
const ModeManager = {
  currentMode: "target",
  switchMode: function(mode) { ... },
  refreshUI: function() { ... },
  updateCalculatedDisplayValues: function() { ... },
  getValue: function(fieldId) { ... },
  setValue: function(fieldId, value, source) { ... },
};
```

#### **2. Mode-Aware StateManager Publishing**
```javascript
// ❌ CURRENT (Line 752, 784): Always unprefixed
window.TEUI.StateManager.setValue(fieldId, value, "user-modified");

// ✅ REQUIRED: Mode-aware (S02/S12 pattern)
ModeManager.setValue: function(fieldId, value, source = "user-modified") {
  const currentState = this.currentMode === "target" ? TargetState : ReferenceState;
  currentState.setValue(fieldId, value);

  // Target mode: publish unprefixed
  if (this.currentMode === "target") {
    window.TEUI.StateManager.setValue(fieldId, value, source);
  }

  // Reference mode: publish with ref_ prefix
  if (this.currentMode === "reference") {
    window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, source);
  }
}
```

#### **3. Bidirectional Sync - Missing S12 Listeners**

**CURRENT**: S19 listens to S12 changes ✅

**MISSING**: S12 must listen to S19 changes ❌

Add to **Section12.js** `initializeEventHandlers()`:

```javascript
// ✅ NEW: S12 listens to WOMBAT mirror field changes
if (window.TEUI?.StateManager) {
  // Target volume/stories from WOMBAT
  window.TEUI.StateManager.addListener("d_198", (newValue) => {
    const currentValue = ModeManager.getValue("d_105");
    if (currentValue !== newValue) {
      ModeManager.setValue("d_105", newValue, "external");
      console.log(`[S12] Synced d_105 = ${newValue} from WOMBAT (d_198)`);
      calculateAll();
      ModeManager.updateCalculatedDisplayValues();
    }
  });

  window.TEUI.StateManager.addListener("d_199", (newValue) => {
    const currentValue = ModeManager.getValue("d_103");
    if (currentValue !== newValue) {
      ModeManager.setValue("d_103", newValue, "external");
      console.log(`[S12] Synced d_103 = ${newValue} from WOMBAT (d_199)`);
      calculateAll();
      ModeManager.updateCalculatedDisplayValues();
    }
  });

  // Reference volume/stories from WOMBAT
  window.TEUI.StateManager.addListener("ref_d_198", (newValue) => {
    const currentValue = ReferenceState.getValue("d_105");
    if (currentValue !== newValue) {
      ReferenceState.setValue("d_105", newValue);
      window.TEUI.StateManager.setValue("ref_d_105", newValue, "external");
      console.log(`[S12] Synced ref_d_105 = ${newValue} from WOMBAT (ref_d_198)`);
      calculateAll();
      ModeManager.updateCalculatedDisplayValues();
    }
  });

  window.TEUI.StateManager.addListener("ref_d_199", (newValue) => {
    const currentValue = ReferenceState.getValue("d_103");
    if (currentValue !== newValue) {
      ReferenceState.setValue("d_103", newValue);
      window.TEUI.StateManager.setValue("ref_d_103", newValue, "external");
      console.log(`[S12] Synced ref_d_103 = ${newValue} from WOMBAT (ref_d_199)`);
      calculateAll();
      ModeManager.updateCalculatedDisplayValues();
    }
  });
}
```

#### **4. Dual-Engine Calculation Pattern**

```javascript
// ❌ CURRENT: Single-mode visualization
function calculateAll() {
  if (isActivated) {
    updateVisualization();
  }
}

// ✅ REQUIRED: Dual-engine pattern
function calculateAll() {
  // ALWAYS run both engines
  calculateTargetModel();
  calculateReferenceModel();

  // Only update visualization if activated
  if (isActivated) {
    // Show appropriate mode's visualization
    const mode = ModeManager?.currentMode || "target";
    updateVisualization(mode);
  }
}

function calculateTargetModel() {
  const geometry = solveGeometry(false); // isReferenceCalculation = false

  // Store calculated dimensions in TargetState
  TargetState.setValue("h_200", geometry.footprint.length.toString());
  TargetState.setValue("h_201", geometry.footprint.width.toString());
  TargetState.setValue("h_203", geometry.storyHeight.toString());

  // Publish to StateManager for S12 consumption
  window.TEUI.StateManager.setValue("h_200", geometry.footprint.length.toString(), "calculated");
  window.TEUI.StateManager.setValue("h_201", geometry.footprint.width.toString(), "calculated");
  window.TEUI.StateManager.setValue("h_203", geometry.storyHeight.toString(), "calculated");
}

function calculateReferenceModel() {
  const geometry = solveGeometry(true); // isReferenceCalculation = true

  // Store calculated dimensions in ReferenceState
  ReferenceState.setValue("h_200", geometry.footprint.length.toString());
  ReferenceState.setValue("h_201", geometry.footprint.width.toString());
  ReferenceState.setValue("h_203", geometry.storyHeight.toString());

  // Publish to StateManager with ref_ prefix
  window.TEUI.StateManager.setValue("ref_h_200", geometry.footprint.length.toString(), "calculated");
  window.TEUI.StateManager.setValue("ref_h_201", geometry.footprint.width.toString(), "calculated");
  window.TEUI.StateManager.setValue("ref_h_203", geometry.storyHeight.toString(), "calculated");
}

function solveGeometry(isReferenceCalculation = false) {
  // Read from appropriate state based on calculation mode
  const volume = isReferenceCalculation
    ? parseFloat(window.TEUI.parseNumeric(ReferenceState.getValue("d_198")) || 8000)
    : parseFloat(window.TEUI.parseNumeric(TargetState.getValue("d_198")) || 8000);

  const stories = isReferenceCalculation
    ? parseFloat(ReferenceState.getValue("d_199") || 1)
    : parseFloat(TargetState.getValue("d_199") || 1);

  const aspectRatioRaw = isReferenceCalculation
    ? parseFloat(ReferenceState.getValue("d_202") || 0)
    : parseFloat(TargetState.getValue("d_202") || 0);

  // ... rest of geometry calculations ...

  return solvedGeometry;
}
```

#### **5. DOM Update Function (Missing)**

```javascript
// ✅ ADD: updateWombatDOM helper function
function updateWombatDOM(fieldId, value) {
  if (!window.TEUI?.FieldManager?.updateFieldDisplay) {
    console.warn(`[WOMBAT] FieldManager.updateFieldDisplay not available for ${fieldId}`);
    return;
  }

  const fieldDef = window.TEUI.FieldManager.getField(fieldId);
  if (fieldDef) {
    try {
      window.TEUI.FieldManager.updateFieldDisplay(fieldId, value, fieldDef);
    } catch (e) {
      console.error(`[WOMBAT] Error updating DOM for ${fieldId}:`, e);
    }
  }
}
```

---

## 📋 STEP-BY-STEP IMPLEMENTATION

### **Phase 1: Add Pattern A State Objects** (30 min)

1. Add `TargetState` object with `values`, `getValue()`, `setValue()`, `setDefaults()`, `syncFromGlobalState()`
2. Add `ReferenceState` object (mirror structure)
3. Add `ModeManager` facade with `switchMode()`, `refreshUI()`, `updateCalculatedDisplayValues()`, `getValue()`, `setValue()`
4. Expose ModeManager globally: `window.TEUI.sect19.ModeManager = ModeManager;`

### **Phase 2: Fix User Input Handling** (20 min)

1. Update `setupFieldListeners()` to use `ModeManager.setValue()` instead of direct StateManager writes
2. Implement mode-aware publishing (unprefixed for Target, `ref_` for Reference)
3. Test: User edits in Reference mode should publish `ref_d_198`/`ref_d_199` only

### **Phase 3: Implement Dual-Engine Calculations** (30 min)

1. Refactor `solveGeometry()` to accept `isReferenceCalculation` parameter
2. Create `calculateTargetModel()` function
3. Create `calculateReferenceModel()` function
4. Update `calculateAll()` to run both engines
5. Update `updateVisualization()` to accept mode parameter

### **Phase 4: Add Bidirectional Listeners to S12** (15 min)

1. Edit `Section12.js` → `initializeEventHandlers()`
2. Add listeners for `d_198`, `d_199`, `ref_d_198`, `ref_d_199`
3. Each listener should sync to S12's appropriate state and recalculate

### **Phase 5: Testing & Validation** (30 min)

1. **Test 1**: Edit d_105 in S12 Target mode → verify d_198 updates in S19
2. **Test 2**: Edit d_198 in S19 Target mode → verify d_105 updates in S12
3. **Test 3**: Switch to Reference mode → repeat tests with ref_ values
4. **Test 4**: Verify no cross-contamination (Target changes don't affect Reference)
5. **Test 5**: 3D visualization updates correctly in both modes

---

## 🎯 SUCCESS CRITERIA

- ✅ S19 has complete Pattern A architecture (TargetState, ReferenceState, ModeManager)
- ✅ User edits in S19 publish mode-aware to StateManager
- ✅ S12 listens to S19 changes and syncs bidirectionally
- ✅ S19 listens to S12 changes (already working)
- ✅ Dual-engine calculations run on every change
- ✅ No state contamination (Target/Reference isolated)
- ✅ 3D visualization works in both modes
- ✅ Volume/stories fields stay synchronized across S12/S19 in both modes

---

## 🚨 ANTI-PATTERNS TO AVOID

### **❌ Anti-Pattern 6: Cross-Section DOM Listeners**
Don't listen to S12's DOM elements directly - use StateManager listeners only.

### **❌ Anti-Pattern 7: Self-Listening to Own Fields**
Don't add StateManager listeners for S19's own input fields (d_198, d_199) - user edits already call `calculateAll()`.

### **❌ Direct StateManager Writes**
Always use `ModeManager.setValue()` for user inputs to ensure mode-aware publishing.

### **❌ Missing updateCalculatedDisplayValues()**
After `calculateAll()`, always call `ModeManager.updateCalculatedDisplayValues()` to refresh DOM.

---

## 📚 REFERENCE PATTERNS

- **Dual-State Template**: `SectionXX.js` (lines 207-462)
- **Bidirectional Sync**: S11 Pattern (CHEATSHEET lines 1627-1692)
- **Mode-Aware Publishing**: S02/S12 `ModeManager.setValue()` pattern
- **Dual-Engine Calculations**: S07/S10/S11 proven patterns

---

## 🚧 IMPLEMENTATION IN PROGRESS (WOMBAT3D Branch)

**Status**: Partial Implementation - 2025-12-13
**Branch**: `WOMBAT3D` (SVG migration + mode-aware fixes)
**Affected Files**:
- `src/sections/Section19.js` (Pattern A architecture + SVG rendering)
- `index.html` (SVG container replaces Canvas)

### **What Was Implemented**

#### **Phase 1-2: Pattern A Architecture** ✅
- Added TargetState, ReferenceState, ModeManager objects (S19:37-204)
- Mode-aware publishing in user input handlers (S19:922, 954)
- Global exposure of ModeManager (S19:1167-1169)

#### **Phase 3: Dual-Engine Calculations** ✅
- Refactored `solveGeometry(isReferenceCalculation)` (S19:464)
- Added `calculateTargetModel()` and `calculateReferenceModel()` (S19:1165-1185)
- Updated `calculateAll()` to run both engines (S19:1187-1201)
- Mode-aware `updateVisualization(mode)` (S19:600)
- Added `updateWombatDOM()` helper (S19:904-918)

#### **Phase 4: Bidirectional Sync** ✅
- S12 → S19 listeners updated to use TargetState/ReferenceState (S19:1060-1110)
- S19 → S12 listeners with DOM updates added (S12:3086-3136)
- FieldManager.updateFieldDisplay() for d_105 (S12:3097-3102)
- Direct dropdown.value update for d_103 (S12:3117-3120)

#### **Bug Fixes Applied** ✅
1. **S19→S12 DOM Stale Issue**: Added FieldManager updates in S12 listeners
2. **3D Visualization Not Updating**: Changed S12→S19 listeners to call `calculateAll()` instead of direct `updateVisualization()`

### **How Bidirectional Sync Works**

```
User edits d_105 in S12:
  S12: ModeManager.setValue("d_105", value)
    → StateManager.setValue("d_105", value)
    → S19 listener catches "d_105"
    → S19: TargetState.setValue("d_198", value)
    → S19: updateWombatDOM("d_198", value)
    → S19: calculateAll() → both engines + visualization

User edits d_198 in S19:
  S19: ModeManager.setValue("d_198", value)
    → StateManager.setValue("d_198", value)
    → S12 listener catches "d_198"
    → S12: ModeManager.setValue("d_105", value)
    → S12: FieldManager.updateFieldDisplay("d_105", value)
    → S12: calculateAll() + updateCalculatedDisplayValues()
```

### **Testing Checklist**

- [x] Edit d_105 in S12 → verify d_198 updates in S19 table AND 3D visualization ✅
- [ ] Edit d_198 in S19 → verify d_105 updates in S12 DOM ⚠️ **KNOWN ISSUE**
- [x] Edit d_103 dropdown in S12 → verify d_199 updates in S19 AND 3D redraws ✅
- [x] Edit d_199 dropdown in S19 → verify d_103 dropdown updates in S12 ✅
- [ ] Switch to Reference mode → verify ref_ fields work bidirectionally
- [x] Verify 3D visualization updates from BOTH S12 and S19 changes ✅
- [x] Verify no cross-contamination (Target ≠ Reference calculations) ✅
- [x] Aspect ratio slider triggers recalculation and visualization ✅

---

## ⚠️ KNOWN ISSUES

### **Volume Field (d_198) Input Locked After First Edit**

**Status**: Deferred for investigation
**Severity**: High - Blocks S19 → S12 user input flow
**Affects**: Volume field (d_198) contenteditable input in S19 table

**Symptoms:**
- First edit works correctly: value syncs to S12, calculations update, 3D redraws
- Second click into field: field appears to accept focus but rejects typed input
- Field becomes locked and unresponsive to user input
- S12 → S19 direction works perfectly (editing d_105 updates d_198 correctly)

**Evidence from Logs:**
```
Line 158: [WOMBAT] setupFieldListeners: Volume field found = null
Line 596: [FieldManager] Section sect19 has no ModeManager - using direct write for d_198
```

**Root Cause Hypothesis:**
Volume field not found during initialization (`setupFieldListeners()`), likely due to:
1. Field selector too specific: `[data-field-id="d_198"][contenteditable="true"]`
2. Field rendered by FieldManager AFTER event handler setup runs
3. Blur handler never attached → no input processing after first DOM update

**Attempted Fixes (Reverted):**
- Focus detection to skip DOM updates ❌
- Value comparison to prevent unnecessary updates ❌
- Contenteditable attribute preservation ❌
- Simplified field selector ❌

**Next Steps:**
1. Investigate field rendering timing (when does FieldManager create d_198?)
2. Consider deferring `setupFieldListeners()` until after FieldManager renders fields
3. Alternative: Use global blur handler pattern instead of field-specific attachment
4. Check if field needs `contenteditable="true"` added to field definition

**Workaround:**
Use S12 d_105 field for volume input (bidirectional sync S12→S19 works correctly)

---

---

## 📊 WOMBAT3D BRANCH STATUS (2025-12-13)

### **✅ Completed This Session**

1. **Canvas → SVG Migration** (Commit: 9f1852a)
   - Replaced `<canvas>` with `<svg>` element (800×600)
   - Ported all rendering from Canvas 2D API to SVG DOM manipulation
   - Wireframe topology style (edges + nodes, no filled faces)
   - S18 aesthetic: 3px edges, 5px nodes with white borders

2. **ModeManager Export Fix** (Commit: af7842d) 🔥 **CRITICAL**
   - **Problem**: ModeManager not in module return{} → undefined globally
   - **Evidence**: Diagnostic showed `mode: 'UNKNOWN'`, FieldManager warnings
   - **Fix**: Added ModeManager, TargetState, ReferenceState to exports
   - **Fix**: Added lowercase `modeManager` alias for ReferenceToggle
   - **Result**: FieldManager now routes through ModeManager ✅

3. **getModeAwareValue() for State Isolation** (Commit: 489c2ff)
   - **Problem**: solveGeometry() read external deps without ref_ prefix
   - **Evidence**: Reference mode showed Target geometry
   - **Fix**: Added S16-pattern getModeAwareValue(fieldId, isReferenceCalculation)
   - **Result**: Reference calculations read ref_h_15, ref_d_85, ref_d_86 ✅

4. **Local State Sync Fix** (Commit: 920b6a3) 🔥 **CRITICAL**
   - **Problem**: Calculation engines didn't update TargetState/ReferenceState
   - **Evidence**: refreshUI() read stale values, mode switch showed old geometry
   - **Fix**: calculateTargetModel/ReferenceModel now update local state FIRST
   - **Pattern**: Update local → publish to StateManager (Anti-Pattern 4)

5. **switchMode() Visualization Update** (Commit: 5833f3d)
   - **Problem**: Mode toggle didn't redraw visualization
   - **Fix**: Added updateVisualization(mode) call in switchMode()
   - **Pattern**: S17/S18 passive visualization redraw on mode change

6. **Diagnostic Script** (Commit: d5a8348)
   - Created comprehensive state inspection tool
   - Reports: mode, state isolation, visualization color, issues
   - File: `docs/development/S19-DIAGNOSTIC.js`

### **❌ STILL BROKEN**

#### **1. Mode Switching Shows Stale Values** 🔴 **CRITICAL - ROOT CAUSE**
**Status**: Core dual-state architecture not working
**Expected**: Switching modes shows each mode's isolated state
**Actual**: Shows "last values set" - no state isolation

**User Report**: "What we see after any mode switch is the last values set, no isolated state data"

**This means BOTH issues are the same root cause**:
- Visualization stays blue (last rendered color)
- Table shows stale values (last written values)
- Neither visualization NOR table update when mode switches

**Broken Functions**:
1. `switchMode()` - Not actually switching displayed state
2. `refreshUI()` - Not updating DOM from state objects
3. `updateVisualization(mode)` - Not redrawing with new mode

**Evidence from Latest Diagnostic**:
```
mode: 'target'  // ✅ ModeManager working now
Wireframe Color: #007bff
Expected Color: #dc3545 (reference mode)
❌ Color Match: WRONG!
```

**Possible Causes**:
1. updateVisualization() not being called when mode switches
2. updateVisualization() receiving wrong mode parameter
3. isReference variable calculation issue in updateVisualization()
4. SVG not being redrawn (stale DOM)
5. Mode switching not triggering at all from ReferenceToggle

**Next Debug Step**: Add console logging to updateVisualization() to see:
- Is it being called?
- What mode parameter is it receiving?
- What is isReference evaluating to?

#### **2. Stories Dropdown State Isolation** ⚠️
**Status**: May not be broken, just same values by coincidence
**Evidence**: Diagnostic shows `d_199 === ref_d_199`
**Next**: Change one value and verify isolation works

#### **3. Stories Dropdown "undefined" Errors**
**Evidence from Logs**:
```
[WOMBAT] ❌ Dropdown value is invalid: "undefined"
```
**Possible Cause**: refreshUI() or mode switching passing undefined to dropdown
**Impact**: May prevent proper state display

### **🔍 ROOT CAUSE ANALYSIS**

**The visualization color issue is the blocker**. We've fixed:
✅ ModeManager export (mode detection works)
✅ State isolation (geometry calculations are mode-aware)
✅ Local state sync (refreshUI has correct values)
✅ switchMode() calls updateVisualization(mode)

But the SVG is still blue. This suggests:
1. **updateVisualization()** isn't receiving the mode parameter correctly, OR
2. **The SVG isn't being cleared/redrawn**, OR
3. **isReference** variable inside updateVisualization() is always false

### **📋 NEXT SESSION ACTION PLAN**

#### **Priority 1: Fix Visualization Color** 🔥
1. Add logging to updateVisualization(mode = "target") to trace:
   ```javascript
   console.log(`[WOMBAT VIZ] updateVisualization called with mode="${mode}"`);
   console.log(`[WOMBAT VIZ] isReference = ${isReference}`);
   console.log(`[WOMBAT VIZ] modelColor = ${modelColor}`);
   ```

2. Add logging to switchMode() to verify it's being called:
   ```javascript
   console.log(`[WOMBAT ModeManager] switchMode("${mode}") called`);
   console.log(`[WOMBAT ModeManager] About to call updateVisualization("${mode}")`);
   ```

3. Test: Toggle to Reference mode and check logs
   - Is switchMode() being called?
   - Is updateVisualization() being called?
   - What values are the variables?

#### **Priority 2: Fix Stories Dropdown Undefined**
1. Check where "undefined" is coming from
2. Add guard in dropdown change handler
3. Ensure refreshUI() doesn't pass undefined

#### **Priority 3: Verify State Isolation**
1. Change Reference volume to different value
2. Change Reference stories to different value
3. Run diagnostic to verify isolation

---

## 🎉 SESSION UPDATE: 2025-12-13 (WOMBAT3D Branch)

### **MAJOR BREAKTHROUGH - Root Cause Found & Fixed**

**Critical Discovery**: ReferenceToggle.js was missing sect19 from its hardcoded section list!
- Lines 192-209 in ReferenceToggle.js listed sect02-sect16 only
- **sect19 was NOT registered** - ReferenceToggle never called `sect19.modeManager.switchMode()`
- This explained ALL symptoms: no mode switching, stale values, always blue visualization

**Fix Applied** (commit 8f21465):
```javascript
const sectionIds = [
  "sect02", "sect03", ..., "sect16",
  "sect19", // WOMBAT - 3D Thermal Topology  <-- ADDED
];
```

### **Architectural Simplification - Passive Pattern (commit 0959c5d)**

Simplified S19 to follow S16's passive visualization pattern per user guidance:
- **Removed**: `refreshUI()` function (circular loop trigger)
- **Removed**: `updateWombatDOM()` function (caused field locking)
- **Simplified**: `switchMode()` now only re-renders visualization (like S16)
- **Fixed**: S12→S19 listeners publish to StateManager instead of direct DOM updates
- **Result**: 68 lines of problematic code removed, 22 lines of clean code added

### **CURRENT STATUS - 95% Complete** ✅

**What Works Perfectly**:
1. ✅ **S12 → S19 diagram updates** (both Target and Reference modes)
2. ✅ **S19 table → S12 updates** (Target mode only)
3. ✅ **S19 table → diagram updates** (both modes)
4. ✅ **State isolation** - 100% perfect between Target/Reference
5. ✅ **Visualization color switching** - RED in Reference, BLUE in Target
6. ✅ **Volume field input** - No longer locks (passive pattern fixed it!)
7. ✅ **Bidirectional sync logic** - All StateManager flows correct

**Remaining Issue - Table Display Updates**: ⚠️

**Symptom**:
- S12 edits → S19 **diagram** updates ✅ (both modes)
- S12 edits → S19 **table** remains stale ❌ (both modes)
- Workaround: Toggle mode Reference→Target→Reference forces table refresh

**Root Cause Hypothesis**:
S19 table fields need to subscribe to StateManager changes like passive sections do.
Currently:
- Diagram updates via `calculateAll()` → `updateVisualization()` ✅
- Table should update via FieldManager listening to StateManager ❌ (not wired)

**Solution Path**:
FieldManager should automatically update S19's table fields when StateManager publishes:
- `d_198` changes → update table row for Volume
- `d_199` changes → update table row for Stories
- `h_200`, `h_201`, `h_203` changes → update calculated fields

This is standard FieldManager behavior for other sections - need to verify S19 fields are properly registered.

### **🎯 NEXT SESSION GOAL**

Fix table display updates by ensuring FieldManager updates S19 table on StateManager changes:
1. Verify S19 fields are registered with FieldManager
2. Check if FieldManager has listeners for d_198/d_199
3. Add logging to trace why table doesn't update on StateManager publish
4. Test: Edit d_105 in S12 → should update both diagram AND table in S19

**Expected Code Change**: Likely 5-10 lines to wire FieldManager listeners for S19 table fields.

---

**Session Summary**: We found and fixed the root cause (ReferenceToggle registration), simplified to passive pattern (removed 68 lines of problematic code), and achieved 95% functionality. Table display updates are the final piece - very close to complete solution!**
