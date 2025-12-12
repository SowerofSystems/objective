# Section 19 (WOMBAT) - Dual-State Architecture Implementation Plan

**Created**: 2025-12-12
**Status**: Implementation Required
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

**This implementation will achieve full dual-state compliance and bidirectional synchronization between WOMBAT and S12.**
