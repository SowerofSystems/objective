# Section 19: WOMBAT - 3D Thermal Topology Visualization

**Branch**: `WOMBAT-DEBUG` (ready for PR)
**Status**: 100% Complete - All bugs fixed, architecture normalized ✅
**Created**: 2025-12-08
**Major Updates**:
- 2025-12-12: Pattern A Dual-State Implementation (PR #63 Merged)
- 2025-12-13: Canvas → SVG Migration + Mode-Aware Fixes (WOMBAT3D Branch Merged)
- 2025-12-13: Final debugging (WOMBAT-DEBUG Branch - Active)
- 2025-12-14: Architectural normalization complete - Steps 1-3 finished

**Target Release**: 4.013

---

## Executive Summary

WOMBAT generates a **3D thermal topology model** from OBJECTIVE's envelope geometry data. Like a wombat creates cubic output from inputs, we transform thermal area-based abstractions into volumetric spatial representations.

**Key Achievement**: Full dual-state Pattern A architecture with bidirectional synchronization between Section 12 and Section 19, maintaining 100% state isolation between Target and Reference models.

---

## Table of Contents

1. [Current Status: 98% Complete](#current-status-98-complete)
2. [Architecture: Pattern A Dual-State](#architecture-pattern-a-dual-state)
3. [Bidirectional Sync with Section 12](#bidirectional-sync-with-section-12)
4. [3D Visualization: SVG Wireframe](#3d-visualization-svg-wireframe)
5. [Geometry Solver: Constraint-Driven](#geometry-solver-constraint-driven)
6. [Final Bug: Target Mode Volume Upstream Write](#final-bug-target-mode-volume-upstream-write)
7. [Testing & Validation](#testing--validation)
8. [References](#references)

---

## Current Status: 98% Complete

### ✅ **What Works Perfectly**

#### **1. Dual-State Architecture** ✅
- **TargetState & ReferenceState** objects with sovereign storage
- **ModeManager** facade with mode-aware StateManager publishing
- **100% state isolation** - no cross-contamination between modes
- **Global exposure** for ReferenceToggle integration

**Location**: [Section19.js:47-242](../../src/sections/Section19.js#L47-L242)

#### **2. Dual-Engine Calculations** ✅
- `calculateAll()` ALWAYS runs both Target and Reference engines
- `calculateTargetModel()` - unprefixed StateManager publishing
- `calculateReferenceModel()` - `ref_` prefixed StateManager publishing
- `solveGeometry(isReferenceCalculation)` - mode-aware constraint solver

**Location**: [Section19.js:1291-1342](../../src/sections/Section19.js#L1291-L1342)

#### **3. Bidirectional Sync - Stories Dropdown** ✅
| Direction | Target Mode | Reference Mode |
|-----------|-------------|----------------|
| S12 d_103 → S19 d_199 | ✅ Works | ✅ Works |
| S19 d_199 → S12 d_103 | ✅ Works | ✅ Works |

**Both directions work in both modes** - perfect bidirectional sync.

#### **4. Bidirectional Sync - Volume (Partial)** ⚠️
| Direction | Target Mode | Reference Mode |
|-----------|-------------|----------------|
| S12 d_105 → S19 d_198 | ✅ Works | ✅ Works |
| S19 d_198 → S12 d_105 | ❌ **BROKEN** | ✅ Works |

**S19 → S12 in Reference mode works perfectly** - only Target mode broken.

**S19 Listeners**: [Section19.js:1188-1234](../../src/sections/Section19.js#L1188-L1234)
**S12 Listeners**: Need to verify Target mode `d_198` listener exists in Section12.js

#### **5. 3D Visualization** ✅
- **SVG wireframe rendering** (migrated from Canvas 2D API)
- **Mode-aware color coding**: BLUE for Target, RED for Reference
- **Isometric projection** with multi-story stacking
- **Dimension annotations** (length, width, height in meters)
- **Activation controls** with status indicator and info modal
- **Updates from both S12 and S19 changes** in both modes

**Location**: [Section19.js:617-887](../../src/sections/Section19.js#L617-L887)

#### **6. ReferenceToggle Integration** ✅
- **Registered with ReferenceToggle.js** (commit 8f21465)
- **Mode switching calls S19 switchMode()** correctly
- **Passive visualization pattern** (like Section 16)
- **updateCalculatedDisplayValues()** refreshes table on mode switch

**Critical Fix**: Added `sect19` to ReferenceToggle's hardcoded section list

---

### ❌ **The One Remaining Bug**

#### **Target Mode Volume Upstream Write (S19 → S12)** 🔴

**Symptom**:
- User edits `d_198` in S19 (Target mode)
- ModeManager publishes `d_198` to StateManager ✅ (verified in logs)
- S12's `d_105` field does NOT update ❌

**Why This Is Strange**:
- **Reference mode works perfectly**: editing `ref_d_198` updates `ref_d_105`
- **Stories dropdown works in both modes**: editing `d_199` updates `d_103`
- **S19's publishing logic is identical** for Target and Reference modes
- **Only difference is the prefix** (`d_198` vs `ref_d_198`)

**Root Cause Hypothesis**:
S12 may be missing a Target mode listener for `d_198`, or the listener doesn't call `FieldManager.updateFieldDisplay()` for `d_105`.

**Evidence Needed**:
1. Does S12 have a `d_198` StateManager listener?
2. Does it mirror the `ref_d_198` listener structure?
3. Does it update the DOM for `d_105`?

**Expected Fix Location**: Section12.js `initializeEventHandlers()` function

**Investigation Path**:
1. Search Section12.js for `addListener("d_198"` to verify Target mode listener exists
2. Compare with `addListener("d_103"` (stories - works in both modes) vs `addListener("d_105"` (volume - check structure)
3. Verify the `d_198` listener calls `FieldManager.updateFieldDisplay("d_105", newValue, fieldDef)`
4. Check if `d_105` field definition requires special handling compared to dropdown `d_103`

**Key Observation**:
The ModeManager.setValue() logic is IDENTICAL for both Target and Reference modes ([Section19.js:227-241](../../src/sections/Section19.js#L227-L241)). Since Reference mode works perfectly and Target mode doesn't, the issue must be in S12's listener implementation, not S19's publishing logic.

---

## Architecture: Pattern A Dual-State

### State Objects

**TargetState** - Holds Target mode values:
```javascript
const TargetState = {
  values: {
    d_198: "8000.00",  // Volume (mirrors S12 d_105)
    d_199: "1.5",      // Stories (mirrors S12 d_103)
    d_202: "0.0",      // Aspect ratio slider
    h_200: "0.00",     // Calculated: Footprint length
    h_201: "0.00",     // Calculated: Footprint width
    h_203: "0.00",     // Calculated: Story height
  },
  getValue(fieldId),
  setValue(fieldId, value),
  setDefaults(),
  syncFromGlobalState()
};
```

**ReferenceState** - Holds Reference mode values (identical structure).

### ModeManager Facade

**Mode-Aware Publishing** - The Key Pattern:
```javascript
ModeManager.setValue: function(fieldId, value, source = "user-modified") {
  const currentState = this.currentMode === "target" ? TargetState : ReferenceState;
  currentState.setValue(fieldId, value);

  if (this.currentMode === "target") {
    // Target mode: publish unprefixed
    window.TEUI.StateManager.setValue(fieldId, value, source);
  } else {
    // Reference mode: publish with ref_ prefix
    window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, source);
  }
}
```

**Passive Visualization Pattern** (S16 style):
```javascript
switchMode: function(mode) {
  this.currentMode = mode;

  // Re-render visualization with new mode's geometry
  if (isActivated) {
    updateVisualization(mode);
  }

  // No refreshUI() - causes circular loops
  // No updateWombatDOM() - causes field locking
  // Just redraw visualization - FieldManager handles table updates
}
```

---

## Bidirectional Sync with Section 12

### Mirror Fields

| S12 Field | S19 Field | Description |
|-----------|-----------|-------------|
| d_105 / ref_d_105 | d_198 / ref_d_198 | Conditioned Volume (m³) |
| d_103 / ref_d_103 | d_199 / ref_d_199 | Number of Stories |

### S12 → S19 Listeners (Working Perfectly)

**Target Mode**:
```javascript
window.TEUI.StateManager.addListener("d_105", (newValue) => {
  const currentValue = TargetState.getValue("d_198");
  if (currentValue !== newValue) {
    TargetState.setValue("d_198", newValue);
    calculateAll(); // Runs dual-engine + updates visualization
  }
});
```

**Reference Mode** (same structure with `ref_` prefix).

### S19 → S12 Listeners (Reference Mode Works, Target Mode Broken)

**What We Know**:
1. S19 publishes `d_198` correctly in Target mode (verified in logs)
2. S12 has a `ref_d_198` listener that works perfectly
3. S12's `d_199` (stories) listener works in both modes
4. **Need to verify**: Does S12 have a working `d_198` listener?

**Expected Pattern** (needs verification in Section12.js):
```javascript
window.TEUI.StateManager.addListener("d_198", (newValue) => {
  const currentValue = TargetState.getValue("d_105");
  if (currentValue !== newValue) {
    TargetState.setValue("d_105", newValue);
    window.TEUI.StateManager.setValue("d_105", newValue, "external");

    // Critical: DOM update
    const fieldDef = window.TEUI.FieldManager.getField("d_105");
    window.TEUI.FieldManager.updateFieldDisplay("d_105", newValue, fieldDef);

    calculateAll();
  }
});
```

---

## 3D Visualization: SVG Wireframe

### Canvas → SVG Migration (2025-12-13)

**Why SVG?**
- DOM-based manipulation (easier debugging)
- Resolution independence
- Better integration with web standards
- Matches Section 18's graph visualization pattern

### Rendering Pipeline

**updateVisualization(mode)** - [Section19.js:673-887](../../src/sections/Section19.js#L673-L887)

1. **Solve Geometry**: `solveGeometry(isReferenceCalculation)`
2. **Clear SVG**: Remove all child elements
3. **Calculate Isometric Projection**: Convert 3D → 2D with Y-up convention
4. **Draw Wireframe**:
   - Edges: 3px colored lines (blue/red based on mode)
   - Nodes: 5px colored circles with white borders
   - Multi-story stacking with per-floor area labels
5. **Dimension Annotations**: Length, width, height in meters
6. **Geometry Info Overlay**: Stories, footprint, story height, total volume

### Mode-Aware Color Coding

```javascript
const modelColor = isReference ? "#dc3545" : "#007bff";
// Red for Reference, Blue for Target
```

**Critical**: Color changes immediately when mode switches (verified working).

---

## Geometry Solver: Constraint-Driven

### Input Dependencies

**External** (from StateManager):
- `h_15` / `ref_h_15` - Conditioned Area (m²) from S12
- `d_85` / `ref_d_85` - Roof Area (m²) from S11
- `d_86` / `ref_d_86` - Wall Area (m²) from S11

**Internal** (from TargetState/ReferenceState):
- `d_198` - Volume (m³) - **SACRED** (always preserved exactly)
- `d_199` - Stories (1, 1.5, 2, 3, 4, 5, 6)
- `d_202` - Aspect Ratio Slider (-4 to +4, 0 = square)

### Constraint Solving Algorithm

**Phase 1: Footprint** (X-Y plane)
```
footprintArea = conditionedArea / stories
width = sqrt(footprintArea / aspectRatio)
length = footprintArea / width
```

**Phase 2: Height** (Z-axis) - **Volume-First**
```
totalBuildingHeight = volume / footprintArea  // SACRED
storyHeight = totalBuildingHeight / stories
```

**Phase 3: Roof Geometry** (pitch emerges from roof area)
```
areaRatio = roofArea / footprintArea
if (areaRatio > 1.01) → gabled roof
if (areaRatio < 0.99) → inverted pyramid (visual conflict indicator)
roofPitch = arcsin((areaRatio - 1) / 2) * (180 / π)
```

**Phase 4: Wall Geometry**
```
perimeter = 2 * (length + width)
wallHeight = wallArea / perimeter
```

### Outputs

**Calculated Fields** (published to StateManager):
- `h_200` / `ref_h_200` - Footprint Length (m)
- `h_201` / `ref_h_201` - Footprint Width (m)
- `h_203` / `ref_h_203` - Story Height (m)

---

## Final Bug: Target Mode Volume Upstream Write

### Investigation Checklist

**Step 1: Verify S12 Listener Exists**
```bash
# Search Section12.js for d_198 listener
grep -n 'addListener("d_198"' src/sections/Section12.js
```

**Step 2: Compare with Working Reference Listener**
- Find `ref_d_198` listener in Section12.js
- Check if `d_198` listener has identical structure
- Verify DOM update calls

**Step 3: Compare with Working Stories Listener**
- Stories works in both modes
- Check `d_199` listener pattern
- Apply same pattern to `d_198`

**Step 4: Add Diagnostic Logging**
```javascript
// In S12's d_198 listener (if it exists):
console.log(`[S12 LISTENER] d_198 changed: ${newValue}`);
console.log(`[S12 LISTENER] Current d_105: ${currentValue}`);
console.log(`[S12 LISTENER] About to update DOM...`);
```

### Expected Solution

**Most Likely Fix**: S12 missing Target mode listener for `d_198`.

**Add to Section12.js `initializeEventHandlers()`**:
```javascript
window.TEUI.StateManager.addListener("d_198", (newValue) => {
  const currentValue = TargetState.getValue("d_105");
  console.log(`[S12→WOMBAT SYNC] d_198 changed: ${currentValue} → ${newValue}`);

  if (currentValue !== newValue) {
    // Update TargetState
    TargetState.setValue("d_105", newValue);

    // Publish to StateManager
    window.TEUI.StateManager.setValue("d_105", newValue, "external");

    // Update DOM (CRITICAL - why Reference works)
    const fieldDef = window.TEUI.FieldManager.getField("d_105");
    if (fieldDef && window.TEUI.FieldManager.updateFieldDisplay) {
      window.TEUI.FieldManager.updateFieldDisplay("d_105", newValue, fieldDef);
      console.log(`[S12→WOMBAT SYNC] ✅ Updated d_105 DOM = ${newValue}`);
    }

    // Recalculate
    calculateAll();
    ModeManager.updateCalculatedDisplayValues();
  }
});
```

---

## Testing & Validation

### Test Matrix

| Test Case | Target Mode | Reference Mode |
|-----------|-------------|----------------|
| Edit d_105 in S12 → d_198 updates in S19 table | ✅ Pass | ✅ Pass |
| Edit d_105 in S12 → S19 diagram updates | ✅ Pass | ✅ Pass |
| Edit d_198 in S19 → d_105 updates in S12 | ❌ **FAIL** | ✅ Pass |
| Edit d_198 in S19 → S19 diagram updates | ✅ Pass | ✅ Pass |
| Edit d_103 dropdown in S12 → d_199 updates | ✅ Pass | ✅ Pass |
| Edit d_199 dropdown in S19 → d_103 updates | ✅ Pass | ✅ Pass |
| Mode switch → visualization color changes | ✅ Pass | ✅ Pass |
| Mode switch → table values update | ✅ Pass | ✅ Pass |
| State isolation (Target ≠ Reference) | ✅ Pass | ✅ Pass |
| Aspect ratio slider triggers update | ✅ Pass | ✅ Pass |

**Success Rate**: 19/20 tests passing (95%)

### Validation Criteria

✅ **Pattern A Compliance**
- Dual-state objects implemented
- Mode-aware publishing
- No state contamination

✅ **Bidirectional Sync**
- Stories: 100% working both directions, both modes
- Volume: 75% working (3 of 4 flows work)

✅ **Visualization**
- SVG rendering works
- Mode-aware colors
- Updates from all changes

❌ **Final Bug**
- Target mode volume upstream write (S19 → S12)

---

## References

### Key Commits

1. **8f21465** - Added sect19 to ReferenceToggle registration (CRITICAL FIX)
2. **0959c5d** - Passive pattern simplification (removed 68 lines)
3. **9f1852a** - Canvas → SVG migration
4. **af7842d** - ModeManager export fix

### Related Documents

- [S19-DUAL-STATE-IMPLEMENTATION.md](./S19-DUAL-STATE-IMPLEMENTATION.md) - Working document with bug tracking
- [S19-DOM-REFRESH-WORKFLOW.md](./S19-DOM-REFRESH-WORKFLOW.md) - DOM update patterns
- [4012-CHEATSHEET.md](./4012-CHEATSHEET.md) - Pattern A architecture guidelines

### Section Dependencies

**Upstream** (S19 reads from):
- Section 11 (Envelope Components) - `d_85`, `d_86`, `g_85`, `g_86`
- Section 12 (Volume Metrics) - `h_15` (Conditioned Area)

**Bidirectional** (S19 mirrors):
- Section 12 - `d_105`/`d_198` (Volume), `d_103`/`d_199` (Stories)

**Downstream** (S19 publishes to):
- Section 12 - Geometry dimensions `h_200`, `h_201`, `h_203`

---

## Next Steps & Roadmap

### 🚨 **IMMEDIATE: Architectural Normalization** (CRITICAL - Before Bug Fix)

**Problem**: S19 has been over-engineered with non-standard patterns that deviate from the established architecture used across 19 sections. This introduces maintenance chaos and may be contributing to bugs.

**Philosophy**: Field types should be identical across the app. Custom event listeners for standard field types violate DRY principles and create technical debt.

---

#### **Phase 0: Architectural Audit & Normalization Plan**

**Objective**: Eliminate idiosyncratic methods, restore architectural standards, fix remaining bug.

**Critical Findings**:

1. **❌ Non-Standard: d_199 Dropdown Custom Listener** (lines 1050-1072)
   - S12's d_103 dropdown has NO custom listener - FieldManager handles it
   - S19's d_199 dropdown has CUSTOM `addEventListener("change")`
   - **This creates double listeners** (FieldManager + custom)
   - Likely causing "undefined" error spam

2. **❌ Non-Standard: d_198 Volume Field Custom Keydown** (lines 1080-1110)
   - S12's d_105 editable field uses blur event (FieldManager standard)
   - S19's d_198 uses custom `addEventListener("keydown")` for Enter key
   - Added to prevent "field lockout" but violates standard pattern
   - **May be interfering with FieldManager's handling**

3. **✅ CORRECT: d_202 Aspect Ratio Slider** (lines 1149-1158)
   - Matches S11's d_97 slider pattern exactly
   - Custom `input` + `change` listeners required for live feedback
   - **This is the correct pattern for sliders**

**Root Cause Hypothesis**:
The custom listeners in S19 may be preventing FieldManager from routing through `ModeManager.setValue()` correctly, which could explain why:
- Reference mode works (somehow bypasses the conflict)
- Target mode fails (hits the conflict)
- Dropdown shows "undefined" errors (double listener firing)

---

#### **Normalization Workplan: Step-by-Step Regression Prevention**

**RULE**: Test after EACH step. Do not proceed if regression occurs.

---

##### **Step 1: Fix Dropdown "Undefined" Error** (15 min)

**Goal**: Eliminate custom d_199 dropdown listener, trust FieldManager.

**Current State**:
```javascript
// Section19.js:1050-1072 - CUSTOM LISTENER (NON-STANDARD)
storiesDropdown.addEventListener("change", function(event) {
  const value = this.value;
  if (value && value !== "undefined") {
    ModeManager.setValue(fieldId, value, "user-modified");
    if (isActivated) { calculateAll(); }
  } else {
    console.error(`[WOMBAT] ❌ Dropdown value is invalid: "${value}"`);
  }
});
```

**Target State**:
```javascript
// Section19.js - NO custom listener needed
// Delete lines 1050-1072
// FieldManager handles dropdown changes automatically
```

**Pre-Check**:
1. Verify FieldManager registers `section: "wombat"` fields
2. Verify FieldManager has mode-aware handling for dropdowns
3. Add diagnostic logging to FieldManager to trace d_199 changes

**Test Criteria**:
- ✅ Dropdown changes in Target mode update d_199
- ✅ Dropdown changes in Reference mode update ref_d_199
- ✅ No "undefined" errors in console
- ✅ S12 d_103 still receives updates from S19 d_199
- ✅ 3D visualization still updates on dropdown change

**Rollback Plan**: If tests fail, restore custom listener and investigate FieldManager registration.

---

##### **Step 2: Investigate FieldManager Registration** (20 min)

**Goal**: Understand why custom listeners were needed in the first place.

**Questions to Answer**:
1. Does FieldManager recognize `section: "wombat"` fields?
2. When FieldManager updates a dropdown, does it call `ModeManager.setValue()`?
3. Does FieldManager have special handling for `type: "number"` vs `type: "editable"`?

**Investigation Path**:
```bash
# Search FieldManager for section registration
grep -n 'section.*wombat' src/core/FieldManager.js

# Search for dropdown handling
grep -n 'type.*dropdown' src/core/FieldManager.js

# Search for mode-aware handling
grep -n 'ModeManager.setValue' src/core/FieldManager.js
```

**Document Findings**:
- If FieldManager doesn't recognize "wombat", register it
- If FieldManager doesn't call ModeManager for wombat fields, add that logic
- If FieldManager has a bug, fix it there (not with custom workarounds in S19)

---

##### **Step 3: Normalize Volume Field to Standard Pattern** (30 min)

**Goal**: Replace custom keydown listener with standard blur event OR fix FieldManager to handle it correctly.

**Current State**:
```javascript
// Section19.js:1080-1110 - CUSTOM KEYDOWN LISTENER
volumeField.addEventListener("keydown", function(event) {
  if (event.key === "Enter" || event.keyCode === 13) {
    event.preventDefault();
    const value = window.TEUI.parseNumeric(this.value) || "8000.00";
    ModeManager.setValue(fieldId, formattedValue, "user-modified");
    if (isActivated) { calculateAll(); }
  }
});
```

**Option A: Change Field Type to "editable"** (RECOMMENDED)
```javascript
// Section19.js:307-314 - Field definition
d: {
  fieldId: "d_198",
  type: "editable",  // ← Change from "number" to "editable"
  value: "8000.00",
  classes: ["user-input"],
  tooltip: true,
  label: "Conditioned volume (mirrored from S12)",
}

// Delete custom keydown listener (lines 1080-1110)
// FieldManager handles contenteditable blur events automatically
```

**Option B: Add Blur Event (Fallback)**
```javascript
// Replace keydown with blur (standard pattern)
volumeField.addEventListener("blur", function() {
  const value = window.TEUI.parseNumeric(this.value) || "8000.00";
  const formattedValue = parseFloat(value).toFixed(2);
  ModeManager.setValue(fieldId, formattedValue, "user-modified");
  if (isActivated) { calculateAll(); }
});
```

**Test Criteria**:
- ✅ User can focus on d_198 field
- ✅ User can type new value
- ✅ User can Tab or click away (blur triggers update)
- ✅ User can press Enter (triggers blur, then update)
- ✅ No "field lockout" (can edit multiple times)
- ✅ Target mode: d_198 → d_105 updates S12 DOM ⚠️ **THE BUG WE'RE FIXING**
- ✅ Reference mode: ref_d_198 → ref_d_105 still works

**Rollback Plan**: If field lockout returns, investigate FieldManager's contenteditable handling.

---

##### **Step 4: Fix Target Mode Volume Bug** (30 min)

**Goal**: Verify/add S12's d_198 listener with DOM update.

**Investigation**:
```bash
# Search S12 for d_198 listener
grep -n 'addListener("d_198"' src/sections/Section12.js

# Compare with working ref_d_198 listener
grep -A 15 'addListener("ref_d_198"' src/sections/Section12.js

# Compare with working d_199 listener
grep -A 15 'addListener("d_199"' src/sections/Section12.js
```

**Expected Fix** (if listener missing):
```javascript
// Section12.js - Add to initializeEventHandlers()
window.TEUI.StateManager.addListener("d_198", (newValue) => {
  const currentValue = TargetState.getValue("d_105");

  if (currentValue !== newValue) {
    // Update TargetState
    TargetState.setValue("d_105", newValue);

    // Publish to StateManager
    window.TEUI.StateManager.setValue("d_105", newValue, "external");

    // Update DOM (CRITICAL - why Reference works but Target doesn't)
    const fieldDef = window.TEUI.FieldManager.getField("d_105");
    if (fieldDef && window.TEUI.FieldManager.updateFieldDisplay) {
      window.TEUI.FieldManager.updateFieldDisplay("d_105", newValue, fieldDef);
      console.log(`[S12→WOMBAT SYNC] ✅ d_105 DOM updated = ${newValue}`);
    }

    // Recalculate
    calculateAll();
    ModeManager.updateCalculatedDisplayValues();
  }
});
```

**Test Criteria**:
- ✅ Edit d_198 in S19 Target mode → d_105 updates in S12 DOM
- ✅ Edit d_198 in S19 Target mode → S12 recalculates
- ✅ Edit ref_d_198 in S19 Reference mode → ref_d_105 still works
- ✅ No regression in S12 → S19 direction

---

##### **Step 5: Final Validation & Documentation** (30 min)

**Full Test Matrix** (20/20 tests must pass):

| Test Case | Target Mode | Reference Mode |
|-----------|-------------|----------------|
| Edit d_105 in S12 → d_198 updates in S19 table | ✅ | ✅ |
| Edit d_105 in S12 → S19 diagram updates | ✅ | ✅ |
| **Edit d_198 in S19 → d_105 updates in S12** | **✅ FIXED** | ✅ |
| Edit d_198 in S19 → S19 diagram updates | ✅ | ✅ |
| Edit d_103 dropdown in S12 → d_199 updates | ✅ | ✅ |
| Edit d_199 dropdown in S19 → d_103 updates | ✅ | ✅ |
| **No "undefined" dropdown errors** | **✅ FIXED** | **✅ FIXED** |
| Mode switch → visualization color changes | ✅ | ✅ |
| Mode switch → table values update | ✅ | ✅ |
| State isolation (Target ≠ Reference) | ✅ | ✅ |
| Aspect ratio slider triggers update | ✅ | ✅ |
| **No field lockout on d_198** | **✅ FIXED** | **✅ FIXED** |

**Documentation Updates**:
1. Update S19-WOMBAT-3.md with "100% Complete" status
2. Document removed non-standard patterns
3. Add "Architectural Compliance" section
4. Update test matrix to show all passing

**Code Cleanup**:
```javascript
// Remove these non-standard patterns from Section19.js:
// - Custom d_199 dropdown listener (lines 1050-1072)
// - Custom d_198 keydown listener (lines 1080-1110)

// Keep these correct patterns:
// - d_202 slider listeners (lines 1149-1158) ✅
// - StateManager listeners for external deps (lines 1166-1234) ✅
```

---

#### **Success Metrics**

**Before Normalization**:
- ❌ Non-standard custom listeners (2 violations)
- ❌ "undefined" dropdown errors (console spam)
- ❌ Target mode volume upstream write broken
- ⚠️ Field lockout workaround (technical debt)

**After Normalization**:
- ✅ 100% architectural compliance (no custom listeners for standard fields)
- ✅ Zero console errors
- ✅ 20/20 test matrix passing
- ✅ No field lockout
- ✅ Maintainable alongside 18 other sections

---

#### **Risk Assessment**

**Low Risk** (Step 1: Dropdown):
- Dropdown works in both modes currently
- FieldManager handles all other dropdowns in app
- Easy rollback if needed

**Medium Risk** (Step 3: Volume Field):
- Field lockout was a real problem
- Need to understand root cause before removing workaround
- Test extensively in both modes

**Low Risk** (Step 4: S12 Listener):
- Adding listener to S12 (not modifying S19)
- Reference mode already works as template
- Isolated change

---

#### **Timeline**

**Day 1 (2-3 hours)**:
- Step 1: Fix dropdown error (15 min)
- Step 2: Investigate FieldManager (20 min)
- Step 3: Normalize volume field (30 min)
- Step 4: Fix S12 listener (30 min)
- Step 5: Final validation (30 min)
- Buffer for debugging (30 min)

**Day 2 (1 hour)**:
- Documentation updates
- Code cleanup
- Commit & PR
- Merge to main

**Total**: 3-4 hours to 100% architectural compliance + bug fix

---

#### **✅ COMPLETION REPORT: 2025-12-14**

**Steps Completed**:
- ✅ **Step 1**: Removed custom dropdown listener (23 lines) - FieldManager handles d_199 correctly
- ✅ **Step 2**: Confirmed FieldManager recognizes "wombat" section and routes through ModeManager
- ✅ **Step 3**: Normalized d_198 volume field to use standard "editable" type with blur handler

**Code Changes**:
- Changed d_198 field type from "number" to "editable" (matches S12's d_105 pattern)
- Replaced 46 lines of custom keydown logic with standard blur+keydown pattern (12 lines)
- Net removal: 57 lines of non-standard code across Steps 1-3
- Added minimal Enter key handler to prevent newlines (matches S12 pattern)

**Bug Fixes**:
- ✅ Target mode volume upstream write now works (d_198 → d_105 sync)
- ✅ No dropdown "undefined" errors
- ✅ No field lockout on volume field
- ✅ Enter key prevents newlines and triggers blur
- ✅ Tab key advances focus and triggers state update
- ✅ Click away triggers blur and state update

**Code Cleanup**:
- Removed all [WOMBAT] diagnostic console logging from Section19.js
- Removed all [S12→WOMBAT] diagnostic console logging from Section12.js
- Removed all wombat-related logging from FieldManager.js
- Ran Prettier on core/ and sections/ (formatted 3 files)
- Ran ESLint on core/ and sections/ (0 errors, warnings only)

**Test Results**:
- ✅ 20/20 test matrix passing (100%)
- ✅ Target mode: All bidirectional sync working
- ✅ Reference mode: All bidirectional sync working
- ✅ Mode switching: Visualization color changes correctly
- ✅ State isolation: No cross-contamination

**Commits**:
1. `a24c6ef` - Cleanup: Remove diagnostic logging from FieldManager
2. `cc186f9` - Step 1: Remove non-standard dropdown listener from S19
3. `42f734e` - Docs: Add architectural normalization workplan to S19-WOMBAT-3
4. `cde54af` - Refactor: Step 3 - Normalize S19 volume field to standard pattern

**Ready for**: Final cleanup commit, then PR to main

---

### 🎯 **Post-Normalization: Merge to Main** (Next)

1. **Squash WOMBAT-DEBUG commits**
2. **Update CHANGELOG.md**
   - Architectural normalization
   - Fixed Target mode volume bug
   - Eliminated dropdown errors
   - Zero custom listeners for standard fields
3. **Tag release 4.013**

---

### 🎨 **Phase 2: Enhanced Graphics Rendering** (Week 1-2)

**Goal**: Migrate from SVG wireframe to Three.js for true 3D interaction and export capabilities

#### **Why Three.js?**

| Feature | SVG (Current) | Three.js (Phase 2) |
|---------|---------------|---------------------|
| **Vector quality** | Crisp at any scale | GPU-accelerated |
| **Interactivity** | CSS hover, click | Raycasting API |
| **3D rotation** | No | OrbitControls (real-time) |
| **Export** | PNG screenshot | glTF/OBJ for CAD tools |
| **Performance** | DOM-limited | WebGL optimized |
| **Solar shading** | No | Directional lights |

#### **Dual-Model Visualization Design**

Show Target vs Reference models simultaneously with interactive toggle:

```
┌─────────────────────────────────────────────────────────────┐
│  WOMBAT - 3D Thermal Topology                               │
├─────────────────────────────────────────────────────────────┤
│  Display Mode:                                               │
│  ( ) Target Only  ( ) Reference Only  (●) Both (Overlay)     │
│                                                               │
│         Target (Blue)           Reference (Red)              │
│       ┌────────────┐            ┌──────────┐                │
│      ╱│            │╲          ╱│          │╲               │
│     ╱ │            │ ╲        ╱ │          │ ╲              │
│    ╱  │   8000 m³  │  ╲      ╱  │  6500 m³ │  ╲             │
│   ●───●────────────●───●    ●──●──────────●──●            │
│   │   │            │   │    │  │          │  │             │
│   │   │  ▢ ▢ ▢    │   │    │  │  ▢ ▢    │  │             │
│   │   │            │   │    │  │          │  │             │
│   ●───●────────────●───●    ●──●──────────●──●            │
│                                                               │
│  Legend:                                                     │
│  ● Vertex nodes | ─ Edges | ▢ Windows                      │
│  Blue = Target (Proposed) | Red = Reference (Baseline)      │
│                                                               │
│  [Rotate] [Reset View] [Export glTF] [Screenshot]           │
└─────────────────────────────────────────────────────────────┘
```

#### **Implementation Plan: Three.js Migration**

**Phase 2A: Basic Three.js Scene** (3 days)

1. **Setup Three.js renderer**
   ```javascript
   import * as THREE from 'three';
   import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

   const scene = new THREE.Scene();
   const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
   const renderer = new THREE.WebGLRenderer({ antialias: true });

   const controls = new OrbitControls(camera, renderer.domElement);
   controls.enableDamping = true;
   ```

2. **Convert SVG wireframe to Three.js LineSegments**
   ```javascript
   function renderModel(geometry, mode, color) {
     const edges = [];

     // Building edges
     for (let story = 0; story < geometry.stories; story++) {
       const z0 = story * geometry.storyHeight;
       const z1 = (story + 1) * geometry.storyHeight;

       // Floor edges
       edges.push(
         new THREE.Vector3(-w/2, -l/2, z0),
         new THREE.Vector3(w/2, -l/2, z0),
         // ... all 12 edges
       );
     }

     const lineGeometry = new THREE.BufferGeometry().setFromPoints(edges);
     const lineMaterial = new THREE.LineBasicMaterial({ color: color });
     const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
     scene.add(lineSegments);
   }
   ```

3. **Add vertex spheres**
   ```javascript
   const vertexGeometry = new THREE.SphereGeometry(0.2, 16, 16);
   const vertexMaterial = new THREE.MeshBasicMaterial({ color: modelColor });

   vertices.forEach(vertex => {
     const sphere = new THREE.Mesh(vertexGeometry, vertexMaterial);
     sphere.position.set(vertex.x, vertex.y, vertex.z);
     scene.add(sphere);
   });
   ```

**Phase 2B: Interactive Features** (2 days)

1. **Raycasting for hover/click**
   ```javascript
   const raycaster = new THREE.Raycaster();
   const mouse = new THREE.Vector2();

   renderer.domElement.addEventListener('click', (event) => {
     mouse.x = (event.clientX / width) * 2 - 1;
     mouse.y = -(event.clientY / height) * 2 + 1;

     raycaster.setFromCamera(mouse, camera);
     const intersects = raycaster.intersectObjects(scene.children);

     if (intersects.length > 0) {
       // Highlight clicked face, show S11 field reference
       highlightFace(intersects[0].object);
     }
   });
   ```

2. **Hover tooltips with face properties**
   ```javascript
   function showFaceTooltip(face) {
     const tooltip = document.createElement('div');
     tooltip.className = 'wombat-tooltip';
     tooltip.innerHTML = `
       ${face.orientation} Wall<br>
       Area: ${face.area.toFixed(1)} m²<br>
       U-Value: ${face.uValue} W/m²K
     `;
     // Position at mouse cursor
   }
   ```

**Phase 2C: Dual-Model Overlay** (2 days)

1. **Render both models with opacity**
   ```javascript
   function updateVisualization(displayMode) {
     scene.clear();

     if (displayMode === "target" || displayMode === "both") {
       const opacity = displayMode === "both" ? 0.6 : 1.0;
       renderModel(targetGeometry, "target", 0x007bff, opacity);
     }

     if (displayMode === "reference" || displayMode === "both") {
       const opacity = displayMode === "both" ? 0.6 : 1.0;
       renderModel(referenceGeometry, "reference", 0xdc3545, opacity);
     }

     if (displayMode === "both") {
       showGeometryDeltas(targetGeometry, referenceGeometry);
     }
   }
   ```

2. **Show dimension deltas**
   ```javascript
   function showGeometryDeltas(target, ref) {
     const volumeDelta = target.volume - ref.volume;
     const heightDelta = target.height - ref.height;

     // Draw dimension lines with delta values
     drawDimensionLine(targetVertices, refVertices, volumeDelta);
   }
   ```

---

### 📐 **Phase 3: Roof Pitch & Window Distribution** (Week 3-4)

**Goal**: Add detailed facade geometry with windows, doors, and pitched roofs

#### **Pitched Roof Rendering**

1. **Gabled roof geometry**
   ```javascript
   if (geometry.roof.type === "gabled") {
     const ridgeHeight = Math.tan(geometry.roof.pitch * Math.PI/180) * (width/2);
     const roofVertices = [
       new THREE.Vector3(-width/2, -length/2, topZ),
       new THREE.Vector3(width/2, -length/2, topZ),
       new THREE.Vector3(0, -length/2, topZ + ridgeHeight),
       // ... mirror for back side
     ];

     const roofGeometry = new THREE.BufferGeometry().setFromPoints(roofVertices);
     const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
     scene.add(roofMesh);
   }
   ```

2. **Skylight placement** (from d_93)
   ```javascript
   const skylightArea = parseFloat(getModeAwareValue("d_93", isReference));
   const skylightCount = Math.floor(skylightArea / 2); // 2m² per skylight

   // Distribute evenly across roof slope
   for (let i = 0; i < skylightCount; i++) {
     const skylight = createSkylight(2, 1); // 2m x 1m
     skylight.position.set(x, y, roofZ);
     scene.add(skylight);
   }
   ```

#### **Window Distribution by Orientation**

1. **Parse window areas by cardinal direction**
   ```javascript
   const windows = {
     north: parseFloat(getModeAwareValue("d_89", isReference)),
     east: parseFloat(getModeAwareValue("d_90", isReference)),
     south: parseFloat(getModeAwareValue("d_91", isReference)),
     west: parseFloat(getModeAwareValue("d_92", isReference)),
   };
   ```

2. **Distribute windows on facade**
   ```javascript
   function distributeWindows(orientation, wallArea, windowArea, stories) {
     const windowsPerStory = Math.ceil(windowArea / (stories * 2)); // 2m² per window
     const windowWidth = 1.5; // meters
     const windowHeight = 1.333; // maintain 2m² area

     for (let story = 0; story < stories; story++) {
       const z = story * storyHeight + 1.0; // 1m above floor

       for (let i = 0; i < windowsPerStory; i++) {
         const window = createWindow(windowWidth, windowHeight);
         window.position.set(x, y, z);
         scene.add(window);
       }
     }
   }
   ```

3. **Door placement** (from d_88)
   ```javascript
   const doorArea = parseFloat(getModeAwareValue("d_88", isReference));
   const doorCount = Math.floor(doorArea / 2); // 2m² per door (1m x 2m)

   // Place on South facade (primary entrance)
   for (let i = 0; i < doorCount; i++) {
     const door = createDoor(1.0, 2.0);
     door.position.set(southX, southY, 0);
     scene.add(door);
   }
   ```

---

### 🌍 **Phase 4: Export & Import** (Week 5-6)

**Goal**: Enable interoperability with CAD/BIM tools via standard 3D formats

#### **glTF 2.0 Export**

```javascript
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

function exportGLTF() {
  const exporter = new GLTFExporter();

  exporter.parse(
    scene,
    (gltf) => {
      const blob = new Blob([JSON.stringify(gltf)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `TEUI-WOMBAT-${Date.now()}.gltf`;
      link.click();
    },
    { binary: false } // ASCII glTF for human-readable output
  );
}
```

**Export Options**:
- **glTF 2.0** (ASCII) - Best for web/inspection
- **glTF 2.0** (Binary `.glb`) - Compact for SketchUp/Rhino
- **OBJ** (legacy) - Widest compatibility
- **PNG Screenshot** - Quick visual export

#### **Basic glTF Import** (populate TEUI from 3D model)

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function importGLTF(file) {
  const loader = new GLTFLoader();

  loader.load(file, (gltf) => {
    const model = gltf.scene;

    // Extract bounding box
    const bbox = new THREE.Box3().setFromObject(model);
    const size = bbox.getSize(new THREE.Vector3());

    // Calculate volume
    const volume = size.x * size.y * size.z;

    // Populate TEUI fields
    window.TEUI.StateManager.setValue("d_198", volume.toFixed(2), "imported");

    // Estimate surface areas by raycasting
    const surfaceAreas = estimateSurfaceAreas(model);
    window.TEUI.StateManager.setValue("d_85", surfaceAreas.roof.toFixed(2), "imported");
    window.TEUI.StateManager.setValue("d_86", surfaceAreas.walls.toFixed(2), "imported");
  });
}
```

---

### ☀️ **Phase 5: Solar Radiation Overlay** (Week 7-8)

**Goal**: Visualize solar gains on building surfaces

#### **Solar Position Calculation**

```javascript
import { getPosition } from 'suncalc';

function calculateSolarPosition(lat, lon, date) {
  const sunPos = getPosition(date, lat, lon);

  return {
    azimuth: sunPos.azimuth * 180 / Math.PI,
    altitude: sunPos.altitude * 180 / Math.PI,
  };
}
```

#### **Surface Irradiance Coloring**

```javascript
function colorBySolarGain(face, solarPosition) {
  // Calculate angle between face normal and sun vector
  const sunVector = new THREE.Vector3(
    Math.cos(solarPosition.altitude) * Math.sin(solarPosition.azimuth),
    Math.cos(solarPosition.altitude) * Math.cos(solarPosition.azimuth),
    Math.sin(solarPosition.altitude)
  );

  const cosAngle = face.normal.dot(sunVector);
  const irradiance = Math.max(0, cosAngle) * 1000; // W/m² (direct normal)

  // Map to color gradient (blue → yellow → red)
  const color = new THREE.Color().setHSL(0.6 - (irradiance/1000) * 0.6, 1, 0.5);
  face.material.color = color;
}
```

#### **Annual Solar Gains** (integrate with Section 10)

```javascript
function calculateAnnualSolarGains(geometry) {
  const gains = {
    north: 0, east: 0, south: 0, west: 0, roof: 0,
  };

  // Sample 365 days × 24 hours
  for (let day = 0; day < 365; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const date = new Date(2024, 0, 1 + day, hour);
      const sunPos = calculateSolarPosition(lat, lon, date);

      // Calculate incident radiation on each face
      Object.keys(gains).forEach(orientation => {
        gains[orientation] += calculateIncidentRadiation(
          geometry.faces[orientation],
          sunPos
        );
      });
    }
  }

  // Publish to Section 10 fields
  window.TEUI.StateManager.setValue("solar_gains_north", gains.north.toFixed(0), "calculated");
  // ... etc
}
```

---

### 🏗️ **Phase 6: Advanced Shapes** (Future)

**Goal**: Support complex building forms beyond simple boxes

#### **L-Shaped Buildings**

```javascript
const lShape = {
  wing1: { length: 20, width: 10, height: 12 },
  wing2: { length: 10, width: 15, height: 12 },
  junction: { x: 0, y: 0 },
};

function renderLShape(shape) {
  renderWing(shape.wing1, 0, 0, 0);
  renderWing(shape.wing2, shape.junction.x, shape.junction.y, 0);
}
```

#### **Custom Polygon Footprints**

```javascript
function renderCustomFootprint(vertices2D, height) {
  const shape = new THREE.Shape(vertices2D.map(v => new THREE.Vector2(v.x, v.y)));
  const extrudeSettings = { depth: height, bevelEnabled: false };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const mesh = new THREE.Mesh(geometry, buildingMaterial);
  scene.add(mesh);
}
```

---

## Project Vision & Thermal Topology Philosophy

### Problem Statement

**Current limitation**: Users enter building geometry as abstract areas (roof: 120 m², walls: 180 m², windows by orientation) without visual feedback of the resulting building form.

**User pain points**:
- No way to validate if entered geometry represents a realistic building
- Cannot visualize thermal performance distribution across building surfaces
- Difficult to communicate design intent to stakeholders
- No export path to 3D modeling tools

### Solution Approach - "Thermal Topology"

**WOMBAT** generates a **constraint-driven 3D thermal topology** from TEUI's area-based geometry:

```
Thermal Areas (Input) → Constraint Solver → Deformable Geometry → Visual Feedback
d_85-d_95, d_105        "Jello Cube"       Vertices adapt to     Color-coded
(user enters areas)     Area = Priority     satisfy area targets  thermal performance
```

**Revolutionary insight**: This is **NOT** an architectural model—it's a **thermal model as topology**.

### Core Principles

1. **Areas Drive Form** (not the other way around)
   - Roof area = 240 m², floor = 120 m² → Roof pitch emerges (~45° slope)
   - North wall ≠ South wall → Building deforms asymmetrically
   - **No validation errors** - model adapts to match thermal data

2. **Topology First, Realism Second**
   - Floor slabs always horizontal (X-Y plane)
   - Default square footprint unless user adjusts aspect ratio slider
   - Walls stretch/compress to satisfy area constraints

3. **Constraint Satisfaction Over Geometric Truth**
   - Impossible constraints (roof < floor) → renders as inverted pyramid
   - Overlapping walls → shown transparently (visual conflict indicator)
   - Strange model = feedback: "Your areas don't match typical proportions"

4. **Volume is Sacred**
   - d_105/d_198 ALWAYS satisfied exactly
   - All dimensions emerge from: Volume + Areas + User preferences

### User Education

**UI Tooltip** (shown in Info modal):

> **"WOMBAT shows how OBJECTIVE 'sees' your building from thermal data."**
>
> You entered:
> - Volume: 1,000 m³
> - Roof: 120 m²
> - Walls: 180 m²
> - Windows: 30 m²
>
> OBJECTIVE doesn't know if your building is square, rectangular, or L-shaped.
> It only knows the **thermal surfaces** you defined.
>
> WOMBAT creates a wireframe that satisfies these constraints.
> If it looks strange, that's **feedback** - check your inputs!
>
> **This is not a CAD model** - it's a **thermal topology diagram**.

---

## References

### Key Commits

1. **8f21465** - Added sect19 to ReferenceToggle registration (CRITICAL FIX)
2. **0959c5d** - Passive pattern simplification (removed 68 lines)
3. **9f1852a** - Canvas → SVG migration
4. **af7842d** - ModeManager export fix

### Related Documents

- [S19-DUAL-STATE-IMPLEMENTATION.md](./S19-DUAL-STATE-IMPLEMENTATION.md) - Bug tracking & investigation
- [S19-DOM-REFRESH-WORKFLOW.md](./S19-DOM-REFRESH-WORKFLOW.md) - DOM update patterns (to be deprecated)
- [4012-CHEATSHEET.md](./4012-CHEATSHEET.md) - Pattern A architecture guidelines
- [TECHNICAL2.md](../TECHNICAL2.md) - Core architecture

### Graphics Libraries

**Three.js** (Phase 2+ target)
- Official site: https://threejs.org/
- OrbitControls: https://threejs.org/docs/#examples/en/controls/OrbitControls
- GLTFExporter: https://threejs.org/docs/#examples/en/exporters/GLTFExporter
- glTF 2.0 spec: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

**Solar Calculations**
- SunCalc.js: https://github.com/mourner/suncalc

### Inspiration Projects

- **Speckle** (https://speckle.systems/) - BIM data platform with Three.js viewer
- **cove.tool** - Early-phase energy modeling with 3D visualization
- **Sefaira** - SketchUp plugin for real-time energy analysis

### Section Dependencies

**Upstream** (S19 reads from):
- Section 11 (Envelope Components) - `d_85`, `d_86`, `g_85`, `g_86`
- Section 12 (Volume Metrics) - `h_15` (Conditioned Area)

**Bidirectional** (S19 mirrors):
- Section 12 - `d_105`/`d_198` (Volume), `d_103`/`d_199` (Stories)

**Downstream** (S19 publishes to):
- Section 12 - Geometry dimensions `h_200`, `h_201`, `h_203`

**Display-Only** (S19 reads from S12 for display, no ownership):
- Section 12 - `d_101`/`g_101` (Ae - Area Exposed to Air), `d_102`/`g_102` (Ag - Area Exposed to Ground)

---

## ✅ **WOMBAT-Ae-Ag: Successful Implementation** (2025-12-14)

**Branch**: `WOMBAT-Ae-Ag` (from main after PR#68)
**Status**: ✅ Target mode working perfectly, Reference mode needs testing

### Implementation Summary

Added two display-only rows to S19 showing S12's aggregate envelope areas:
- **row101**: Ae (Area Exposed to Air) - `d_101` area (m²), `g_101` U-value (W/m²·K)
- **row102**: Ag (Area Exposed to Ground) - `d_102` area (m²), `g_102` U-value (W/m²·K)

### The Successful Pattern: Robot Fingers 🤖👆

**Key Architecture Insights:**
1. **Ownership**: d_101/g_101/d_102/g_102 are S12 fields, NOT S19 fields
2. **StateManager is Single Source**: S12 publishes to StateManager, S19 reads from it
3. **Robot Fingers Required**: S19 needs StateManager listeners to know when S12 recalculates
4. **DOM Scoping Critical**: Multiple sections can display same field IDs if scoped to containers

### Implementation Details

**1. Field Definitions (S19 lines 327-381)**
```javascript
row101: {
  id: "19.Ae",
  cells: {
    d: {
      fieldId: "d_101",  // Same field ID as S12
      type: "calculated",
      value: "2476.62",  // Default value (single source of truth)
      classes: ["text-air-facing"],
    },
    g: {
      fieldId: "g_101",
      type: "calculated",
      value: "0.278",
      // ... etc
    }
  }
}
```

**2. Robot Fingers Listeners (S19 lines 1368-1464)**
```javascript
// ✅ Scoped to #wombat container to avoid querySelector collision with S12
const wombatContainer = document.getElementById("wombat");

// Target mode listeners
window.TEUI.StateManager.addListener("d_101", (newValue) => {
  if (!wombatContainer) return;
  const element = wombatContainer.querySelector('[data-field-id="d_101"]');
  if (element && newValue !== null && newValue !== undefined) {
    element.textContent = window.TEUI.formatNumber(
      window.TEUI.parseNumeric(newValue),
      "number-2dp-comma"
    );
  }
});

// Reference mode listeners (same pattern with ref_ prefix)
window.TEUI.StateManager.addListener("ref_d_101", (newValue) => {
  // ... checks isReferenceMode() before updating
});
```

**3. No Initialization Function Needed**
- Field definitions contain defaults → FieldManager handles initial render
- Robot fingers listeners handle live updates when S12 recalculates
- No fallback logic, no setTimeout, no DOM reads from other sections

### Why It Works

**Problem Solved #1: querySelector Collision**
- Before: `document.querySelector('[data-field-id="d_101"]')` found S12's element first
- After: `wombatContainer.querySelector('[data-field-id="d_101"]')` finds S19's element
- Both sections can safely display the same field IDs

**Problem Solved #2: Robot Fingers**
- S11 changes TB% slider → calls `sect12.calculateAll()` via robot fingers
- S12 recalculates g_101/g_102 → publishes to StateManager via `setCalculatedValue()`
- S19's listeners fire → update S19's DOM elements
- Perfect one-way data flow: S11 → S12 → StateManager → S19

**Problem Solved #3: Single Source of Truth**
- Defaults ONLY in field definitions (lines 327-381)
- No initialization arrays, no fallback reads
- Silent failures eliminated

### Testing Results

✅ **Target Mode**: WORKS PERFECTLY
- Values display current S12 data on load
- Values update live when TB% slider changes in S11
- Formatting correct (2dp with commas for areas, 3dp for U-values)

⚠️ **Reference Mode**: NEEDS TESTING
- Listeners check `isReferenceMode()` before updating
- Should work same as Target mode but requires verification

### Code Stats

- **Lines added**: ~140 (field definitions + listeners)
- **No initialization function**: Defaults handle first render
- **No over-engineering**: Simple pattern, no technical debt

### Pattern for Future Cross-Section Display Fields

When Section X needs to display fields owned by Section Y:

1. **Field definitions**: Use same `fieldId`, add defaults
2. **Robot fingers**: Add StateManager listeners scoped to Section X's container
3. **No initialization**: Let field definitions handle defaults
4. **Both modes**: Listen to both `fieldId` and `ref_fieldId` with mode checks

---

## 🏗️ **Next Phase: Below-Grade Geometry Visualization** (Phase 2)

**Goal**: Visualize basement/below-grade components using brown nodes and vectors to distinguish ground-facing surfaces (Ag) from air-facing surfaces (Ae).

### Rationale

**Current limitation**: WOMBAT shows above-grade building geometry but doesn't indicate when a building has:
- A slab-on-grade foundation (`d_95` > 0)
- Below-grade walls (basement walls, `d_94` > 0)
- Combined basement with slab (`d_94` + `d_95` = `d_102` = Ag)

**User value**:
- Visual confirmation that basement geometry is included in thermal model
- Clear distinction between air-facing (blue) and ground-facing (brown) surfaces
- Matches S12's color coding (Ae = powder blue, Ag = brown)

### Data Sources (from S11)

All values available via StateManager (S11 publishes to StateManager):

| Field | Description | Color |
|-------|-------------|-------|
| `d_95` / `ref_d_95` | Slab Area (m²) | Brown (ground-facing) |
| `d_94` / `ref_d_94` | Below-Grade Wall Area (m²) | Brown (ground-facing) |
| `d_85-d_93` | Above-grade components | Blue (air-facing) |

**Key Insight**: `d_102` (Ag total) = `d_94` + `d_95` (basement walls + slab)

### Implementation Options

#### **Option A: Ground Plane + Basement Extension** (RECOMMENDED)

**Visual Design**:
```
Above Grade (Blue):          Below Grade (Brown):
      ┌────┐                      ═══════  ← Grade line
     ╱│    │╲                     ┌────┐
    ╱ │    │ ╲                    │    │   ← Basement walls (d_94)
   ●──●────●──●                   │    │
   │  │    │  │                   ●══●═●══● ← Slab (d_95)
   │  │    │  │
   ●──●────●──●
   ═══════════  ← Grade line (new)
   ●──●────●──● ← Basement nodes (brown)
   │  │    │  │
   ●══●════●══● ← Slab nodes (brown)
```

**Rendering Logic**:
1. **Ground Plane**: If `d_95 > 0` OR `d_94 > 0`, draw grade line at z=0
2. **Above-Grade Stories**: d_199 stories ALWAYS stacked from z=0 upward (blue)
3. **Basement Nodes**: Create 4 perimeter nodes at z=0 (brown, at grade level)
4. **Basement Walls**: If `d_94 > 0`, extend brown vectors downward from grade nodes (z=0 to z=-depth)
5. **Slab**: If `d_95 > 0`, draw brown vectors connecting basement floor nodes

**Critical Rule**:
- **Stories (d_199)**: ALWAYS z+ (above grade)
  - 1 storey = one floor from z=0 to z=storyHeight
  - Basement is NOT counted in stories - it's additional below-grade space
- **Basement**: ALWAYS z- (below grade)
  - Independent of storey count
  - Rendered in brown to distinguish from above-grade blue

**Depth Calculation**:
```javascript
// Calculate basement depth from wall area
const basementPerimeter = 2 * (footprint.length + footprint.width);
const basementDepth = d_94 > 0 ? d_94 / basementPerimeter : 0;

// Above-grade building: z = 0 to z = stories * storyHeight (BLUE)
// Basement: z = 0 to z = -basementDepth (BROWN)
```

#### **Option B: Grade Line Only** (SIMPLER)

If `d_95 > 0` (slab exists), draw a thin brown line at z=0 labeled "Grade" to indicate slab-on-grade foundation.

**Use Case**: Buildings with slab but no basement (d_94 = 0).

### Visual Color Coding

**Above Grade** (Air-Facing - Ae):
- Nodes: Blue circles with white borders
- Edges: Blue lines (3px)
- Label: "Ae" with area value

**Below Grade** (Ground-Facing - Ag):
- Nodes: Brown circles with white borders
- Edges: Brown lines (3px)
- Label: "Ag" with area value
- Grade line: Dashed brown line

**Color Constants**:
```javascript
const COLORS = {
  air: "#b0e0e6",      // Powder blue (text-air-facing)
  ground: "#8b4513",    // SaddleBrown (text-ground-facing)
  target: "#007bff",    // Blue (Target mode)
  reference: "#dc3545", // Red (Reference mode)
};
```

### Implementation Steps

**Step 1: Read S11 Slab/Basement Data** (5 min)
```javascript
// In solveGeometry(), read from StateManager
const slabArea = parseFloat(getModeAwareValue("d_95", isReferenceCalculation)) || 0;
const basementWallArea = parseFloat(getModeAwareValue("d_94", isReferenceCalculation)) || 0;

const hasBasement = basementWallArea > 0;
const hasSlab = slabArea > 0;
```

**Step 2: Calculate Basement Geometry** (10 min)
```javascript
function calculateBasementGeometry(footprint, basementWallArea, slabArea) {
  const perimeter = 2 * (footprint.length + footprint.width);
  const basementDepth = basementWallArea > 0 ? basementWallArea / perimeter : 0;

  return {
    depth: basementDepth,
    nodes: [
      { x: -footprint.width/2, y: -footprint.length/2, z: -basementDepth },
      { x: footprint.width/2, y: -footprint.length/2, z: -basementDepth },
      { x: footprint.width/2, y: footprint.length/2, z: -basementDepth },
      { x: -footprint.width/2, y: footprint.length/2, z: -basementDepth },
    ],
  };
}
```

**Step 3: Draw Grade Line** (5 min)
```javascript
// SVG dashed line at z=0
if (hasSlab || hasBasement) {
  const gradeLine = document.createElementNS(svgNS, "line");
  gradeLine.setAttribute("x1", -50);
  gradeLine.setAttribute("y1", isoY(0, 0, 0).y);
  gradeLine.setAttribute("x2", 350);
  gradeLine.setAttribute("y2", isoY(0, 0, 0).y);
  gradeLine.setAttribute("stroke", COLORS.ground);
  gradeLine.setAttribute("stroke-width", "2");
  gradeLine.setAttribute("stroke-dasharray", "5,5");
  svgElement.appendChild(gradeLine);
}
```

**Step 4: Draw Basement Walls** (10 min)
```javascript
// Brown vertical vectors from grade to basement floor
if (hasBasement) {
  for (let i = 0; i < 4; i++) {
    const topNode = { ...gradeNodes[i], z: 0 };
    const bottomNode = basementNodes[i];

    drawEdge(topNode, bottomNode, COLORS.ground, 3);
  }
}
```

**Step 5: Draw Basement Floor (Slab)** (10 min)
```javascript
// Brown horizontal vectors at basement floor level
if (hasSlab) {
  const z = hasBasement ? -basementDepth : 0;

  // 4 perimeter edges
  for (let i = 0; i < 4; i++) {
    const node1 = basementNodes[i];
    const node2 = basementNodes[(i + 1) % 4];
    drawEdge(node1, node2, COLORS.ground, 3);
  }

  // Brown nodes at corners
  basementNodes.forEach(node => {
    drawNode(node, COLORS.ground, 5);
  });
}
```

**Step 6: Add Ag Label** (5 min)
```javascript
// Label showing total ground-facing area
const agTotal = slabArea + basementWallArea;
if (agTotal > 0) {
  const label = document.createElementNS(svgNS, "text");
  label.textContent = `Ag: ${agTotal.toFixed(1)} m²`;
  label.setAttribute("fill", COLORS.ground);
  // Position below basement geometry
}
```

### Testing Scenarios

| S11 Input | Foundation Type | Expected S19 Visualization |
|-----------|-----------------|----------------------------|
| d_87 > 0, d_94 = 0, d_95 = 0 | **Crawlspace (vented)** | Blue floor vectors at base (z=0), all air-facing |
| d_94 = 0, d_95 > 0, d_87 = 0 | **Slab-on-grade** | Brown grade line + brown slab perimeter at z=0 |
| d_94 > 0, d_95 > 0, d_87 = 0 | **Full basement** | Brown box below grade (walls + slab) |
| d_94 > 0, d_95 = 0, d_87 = 0 | **Basement walls only** | Brown walls extending down (unusual but render) |
| **d_87 > 0, d_95 > 0, d_94 = 0** | **Mixed: Floor over slab** | **EDGE CASE - See below** |
| **d_87 > 0, d_94 > 0, d_95 > 0** | **Mixed: Floor over basement** | **EDGE CASE - See below** |

**Foundation Type Logic**:
- **d_87 (Floor Exposed to Air)**: Crawlspace or raised floor - blue vectors
  - Floor at z=0 is air-facing (blue)
  - Example: Conditioned space over unheated garage
- **d_95 (Slab)**: Slab-on-grade foundation - brown vectors at grade level
  - Ground-facing (Ag)
  - Grade line at z=0
- **d_94 (Below-Grade Walls)**: Basement walls - brown vectors extending downward
  - Ground-facing (Ag)
  - Basement depth calculated from wall area

**Edge Case: Mixed Floor Types (d_87 > 0 AND (d_94 > 0 OR d_95 > 0))**

This represents a building with BOTH:
- Floor exposed to air (e.g., conditioned space over garage)
- AND ground-facing components (basement or slab in another part)

**Example Scenario**: 2-story house with:
- 1st floor partially over basement (d_95 > 0)
- 1st floor partially over garage (d_87 > 0)
- Total floor area = d_87 + d_95

**Rendering Challenge**:
- **Cannot determine spatial layout** from area values alone
- S11 provides TOTAL areas, not spatial distribution
- Need to make reasonable assumption for visualization

**Proposed Visualization Strategy**:
```javascript
// If BOTH floor types exist, show both but indicate uncertainty
if (d_87 > 0 && (d_94 > 0 || d_95 > 0)) {
  // Option A: Split footprint (show both foundation types)
  // Draw blue floor on one side, brown basement on other
  // Add visual indicator: "Mixed foundation (partial areas shown)"

  // Option B: Layered approach (simpler)
  // Draw basement/slab in brown (z < 0)
  // Draw air-exposed floor in blue AT z=0
  // Label: "Floor: X m² air-facing, Y m² ground-facing"

  // Option C: Warning indicator (safest for Phase 2)
  // Render as if d_87 = 0 (show basement/slab only)
  // Add warning badge: "⚠️ Mixed foundation - visualization simplified"
}
```

**Recommendation for Phase 2**:
Use **Option C** initially - show ground-facing components and add warning indicator when d_87 > 0 exists alongside d_94/d_95. This acknowledges the limitation without over-engineering a spatial layout we can't infer from area data.

**Future Enhancement (Phase 4)**:
- Allow user to specify foundation type distribution
- Add UI control: "Foundation split: [Basement: 60%] [Crawlspace: 40%]"
- Or auto-detect from ratio: if d_87 < 20% of total, treat as minor (show basement only)

**Validation**:
- If d_87 = 0 AND d_94 = 0 AND d_95 = 0: ❌ Invalid (building needs a floor!)
- If d_87 > 0 ONLY: Ag = 0 (no ground contact), all geometry blue, no grade line
- If (d_94 > 0 OR d_95 > 0) ONLY: Ag = d_94 + d_95, show basement/slab, grade line at z=0
- If d_87 > 0 AND (d_94 > 0 OR d_95 > 0): ⚠️ Mixed foundation - Phase 2 shows basement with warning
- Brown color matches text-ground-facing CSS class (#8b4513)
- Blue color matches text-air-facing CSS class (#b0e0e6)
- Grade line visible ONLY when ground-facing components exist
- Basement depth reasonable (typical: 2-3m for ~200-300 m² wall area)
- Total floor area in S12 = d_87 + d_95 (air + ground floor components)

### Code Stats (Estimated)

- **Lines added**: ~80 (basement geometry calculation + rendering)
- **Complexity**: Low (reuses existing isometric projection)
- **Dependencies**: S11 fields already published to StateManager
- **Risk**: Low (additive feature, doesn't modify existing above-grade logic)

### Future Enhancements (Phase 3+)

1. **Ground Temperature Gradient**: Color basement walls darker → lighter from floor to grade
2. **Soil Contact Annotation**: Label showing frost depth or ground temperature zone
3. **Basement Window Wells**: If basement has windows (d_92 allocated below grade)
4. **Walkout Basement**: Detect if one wall is above grade (asymmetric basement)

---

**Document Status**: ACTIVE - Single source of truth (replaces S19-WOMBAT.md)
**Last Updated**: 2025-12-14
**Next Phase**: Below-grade geometry visualization (before window distribution)
**Next Review**: After Ae/Ag display fields complete
