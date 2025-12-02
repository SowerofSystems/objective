# M-N Column Compliance Pattern Guide

**Purpose**: This document provides a standardized pattern for implementing compliance checks in columns M (comparison/reference values) and N (pass/fail indicators) across all TEUI sections.

**Status Update (2025-01-12)**: S01-S08 completed and verified. S07 uses Reference model comparison with "lower is better" logic. S08 row 59 (RH%) updated to show acceptable range "30-60%" in m_59, with dual-slider range check (both d_59 and i_59 must be within range). Next: S09, S12, S13. 

## Overview

The M-N compliance pattern allows sections to compare calculated or user-input values against reference standards, code requirements, or reference model values, providing visual pass/fail feedback, especially useful for plans examiners/OBOA or other Building Code Officials, as well as designers, as visual feedback on compliance divergence. 

## Column Roles

### Column M: Reference/Comparison Values
- **Purpose**: Displays the threshold, limit, or reference value for comparison
- **Value Sources** (in order of priority):
  1. **Code/Standard Lookup**: Value from `CodeValues.js` based on selected standard (e.g., OBC requirements)
  2. **Reference Model Comparison**: Value from `ref_` prefixed field in Reference state
  3. **Static Calculation**: Fixed formula or constant (e.g., NBC upper limit of 26°C)
  4. **Conditional Logic**: Value determined by occupancy type, climate zone, or other factors

### Column N: Pass/Fail Indicators
- **Purpose**: Visual compliance indicator comparing actual value against M column threshold
- **Display**: Symbol (✓ or ✗) with color styling
- **Logic**: Boolean comparison determining pass/fail state

---

## Implementation Patterns

### Pattern 1: Code/Standard Comparison (S03 Example: m_23/n_23)

**Use Case**: Compare against building code requirements that vary by occupancy type.

**M Column (m_23 - OBC Required Heating Setpoint)**:
```javascript
function calculateOBCHeatingSetpoint() {
  const occupancyType = getModeAwareGlobalValue("d_12"); // From Section 02
  let obcHeatingSetpoint;

  // OBC baseline logic (occupancy-dependent)
  if (
    occupancyType === "C-Residential" ||
    occupancyType === "B2-Care and Treatment" ||
    occupancyType === "B3-Detention Care & Treatment" ||
    occupancyType.includes("Care")
  ) {
    obcHeatingSetpoint = 22;
  } else {
    obcHeatingSetpoint = 18;
  }

  setFieldValue("m_23", obcHeatingSetpoint);
  return obcHeatingSetpoint;
}
```

**N Column (n_23 - Heating Setpoint Compliance)**:
```javascript
function calculateHeatingCompliance() {
  const actualSetpoint = getNumericValue("h_23");
  const obcRequirement = getNumericValue("m_23");

  // Pass if actual >= required, fail if actual < required
  const isCompliant = actualSetpoint >= obcRequirement;

  // Set the symbol as text (S08 pattern)
  setFieldValue("n_23", isCompliant ? "✓" : "✗");

  // Apply CSS class directly to DOM element (S08 pattern)
  setElementClass("n_23", isCompliant ? "checkmark" : "warning");

  return isCompliant;
}
```

**Field Definitions**:
```javascript
// Row 23 cells:
m: {
  fieldId: "m_23",
  type: "calculated",
  label: "OBC Required Heating Setpoint",
  value: "22",
  section: "climateCalculations",
  dependencies: ["d_12"], // Triggers recalc when occupancy changes
  tooltip: true,
},
n: {
  fieldId: "n_23",
  type: "calculated",
  label: "Heating Setpoint Compliance",
  value: "✓",
  section: "climateCalculations",
  dependencies: ["h_23", "m_23"], // Triggers when either value changes
  tooltip: true,
},
```

---

### Pattern 2: Static Limit Comparison (S03 Example: m_24/n_24)

**Use Case**: Compare against fixed code limits (e.g., NBC cooling upper limit).

**M Column (m_24 - NBC Upper Cooling Limit)**:
```javascript
function calculateNBCCoolingLimit() {
  const nbcUpperLimit = 26; // NBC standard upper limit in °C
  setFieldValue("m_24", nbcUpperLimit);
  return nbcUpperLimit;
}
```

**N Column (n_24 - Cooling Setpoint Compliance)**:
```javascript
function calculateCoolingCompliance() {
  const actualSetpoint = getNumericValue("h_24");
  const nbcUpperLimit = getNumericValue("m_24");

  // Pass if actual <= limit, fail if actual > limit
  const isCompliant = actualSetpoint <= nbcUpperLimit;

  // Set the symbol as text (S08 pattern)
  setFieldValue("n_24", isCompliant ? "✓" : "✗");

  // Apply CSS class directly to DOM element (S08 pattern)
  setElementClass("n_24", isCompliant ? "checkmark" : "warning");

  return isCompliant;
}
```

---

### Pattern 3: Reference Model Comparison (S11 Example: m_85/n_85)

**Use Case**: Compare Target model value against Reference model value.

**M Column (m_85 - Reference Model Percentage)**:
```javascript
// In updateReferenceIndicators(rowNumber):
const currentValue = getNumericValue(valueSourceFieldId); // Target RSI
const referenceValue = ReferenceState.getValue(referenceFieldId); // ref_e_85
const referenceNumeric = window.TEUI.parseNumeric(referenceValue) || 0;

let referencePercent = 0;
if (componentType === "rsi") {
  // RSI: Higher is better (current ÷ reference × 100%)
  if (referenceNumeric > 0 && !isNaN(currentValue)) {
    referencePercent = (currentValue / referenceNumeric) * 100;
  }
}

setCalculatedValue(mFieldId, referencePercent / 100, "percent"); // Format as %
```

**N Column (n_85 - RSI Compliance)**:
```javascript
// In updateReferenceIndicators(rowNumber):
const isGood = currentValue >= referenceNumeric; // Pass if Target >= Reference

const nElement = document.querySelector(`[data-field-id="${nFieldId}"]`);
if (nElement) nElement.textContent = isGood ? "✓" : "✗";
setElementClass(nFieldId, isGood); // Pass boolean to helper
```

---

### Pattern 4: Multi-Threshold Comparison (S08 Example: m_56/n_56)

**Use Case**: Compare against health/safety thresholds (e.g., radon, CO2, TVOC).

**M Column (m_56 - Radon as % of Limit)**:
```javascript
const radonValue = getNumericValue("d_56");
const radonPercent = radonValue / 150; // 150 Bq/m³ limit
setCalculatedValue("m_56", radonPercent); // Display as %
```

**N Column (n_56 - Radon Compliance)**:
```javascript
setCalculatedValue("n_56", radonValue <= 150 ? "✓" : "✗");
setElementClass("n_56", radonValue <= 150 ? "checkmark" : "warning");
```

---

## Required Components

### 1. Helper Functions

Every section implementing M-N compliance needs:

```javascript
/**
 * Apply CSS class to DOM element for compliance indicators (S08 pattern)
 * Only applies in Target mode - Reference mode should not override Target's visual indicators
 * @param {string} fieldId - The field ID to target
 * @param {string} className - The class name to add ("checkmark" or "warning")
 */
function setElementClass(fieldId, className) {
  // ⚠️ CRITICAL: Only apply styling in Target mode
  // Without this check, Reference calculations will overwrite Target's compliance styling
  if (ModeManager.currentMode !== "target") return;

  const element = document.querySelector(`[data-field-id="${fieldId}"]`);
  if (element) {
    element.classList.remove("checkmark", "warning");
    if (className) element.classList.add(className);
  }
}
```

**CRITICAL**: The mode check (`if (ModeManager.currentMode !== "target") return;`) is **REQUIRED** for dual-state sections (S03, S08, S11, etc.). Without it, Reference mode calculations will overwrite Target mode's visual indicators, causing incorrect colors (e.g., green X instead of red X).

---

### 2. Field Definition Requirements

**M Column Field**:
```javascript
m: {
  fieldId: "m_XX",
  type: "calculated",
  label: "Descriptive Name of Threshold/Limit",
  value: "default_value",
  section: "sectionName",
  dependencies: ["related_field_ids"], // Fields that trigger recalculation
  tooltip: true, // Enable tooltip explaining what this represents
}
```

**N Column Field**:
```javascript
n: {
  fieldId: "n_XX",
  type: "calculated",
  label: "Compliance Status",
  value: "✓", // Default to pass symbol
  section: "sectionName",
  dependencies: ["h_XX", "m_XX"], // Must include both compared fields
  tooltip: true, // Enable tooltip explaining pass/fail criteria
}
```

**Key Points**:
- **DO NOT** add `htmlContent: true` - we apply CSS classes directly to DOM
- **DO NOT** add `classes` array to N column field definitions - let JavaScript apply dynamically
- **DO** include both compared fields in `dependencies` array
- **DO** use descriptive labels explaining what's being compared

---

### 3. Global CSS Classes (styles.css)

Already defined globally - **do not redefine in sections**:

```css
/* Column N: Compliance indicators - prevent vertical expansion in tall rows */
.data-table td.col-n {
  vertical-align: middle;
  font-weight: bold;
  font-size: 1.2rem;
}

.checkmark {
  color: #28a745;      /* Green */
}

.warning {
  color: #dc3545;      /* Red */
}
```

**CRITICAL**: Keep CSS simple - do NOT use `!important`, `display`, `margin`, or other layout properties on `.checkmark`/`.warning`. These caused false positives (red checkmarks, green X's). The minimal approach above is the most reliable pattern tested across S05, S08, S11.

---

### 4. Number Formatting

**M Column** formatting depends on value type:

```javascript
// For percentages (S08, S11):
setCalculatedValue("m_XX", percentValue, "percent"); // Handles % formatting

// For temperatures/numeric values (S03):
setFieldValue("m_23", numericValue); // No special formatting needed

// For ratios displayed as % (S11):
setCalculatedValue("m_85", ratio, "percent"); // ratio = 0.85 → displays "85%"
```

**N Column** formatting:
- Always plain text symbols: `"✓"` or `"✗"`
- CSS class provides color styling

---

## Calculation Flow

### When to Call Compliance Functions

1. **Initial Calculation**: During section's `calculateAll()` or equivalent
2. **Dependency Changes**: When any field in `dependencies` array changes
3. **Mode Switch**: When switching between Target/Reference modes (dual-state sections)

### Call Order (Critical!)

```javascript
// STEP 1: Calculate M column value FIRST
calculateThresholdValue(); // e.g., calculateOBCHeatingSetpoint()

// STEP 2: Calculate N column compliance SECOND (depends on M)
calculateCompliance(); // e.g., calculateHeatingCompliance()
```

**Example from S03**:
```javascript
function calculateTargetModel() {
  // ... other calculations ...

  calculateHeatingSetpoint();           // h_23: Actual value
  calculateOBCHeatingSetpoint();        // m_23: Threshold (MUST run first)
  calculateHeatingCompliance();         // n_23: Compare h_23 vs m_23

  calculateCoolingSetpoint_h24();       // h_24: Actual value
  calculateNBCCoolingLimit();           // m_24: Threshold (MUST run first)
  // ... later in updateCoolingDependents():
  calculateCoolingCompliance();         // n_24: Compare h_24 vs m_24
}
```

---

## Common Comparison Logic Patterns

### Higher is Better (RSI, Efficiency)
```javascript
const isCompliant = actualValue >= thresholdValue;
```

### Lower is Better (U-value, Energy Use, Pollutants)
```javascript
const isCompliant = actualValue <= thresholdValue;
```

### Range Check (Humidity, Temperature Range)
```javascript
const isCompliant = actualValue >= minThreshold && actualValue <= maxThreshold;
```

### Exact Match
```javascript
const isCompliant = actualValue === requiredValue;
```

---

## Tooltips

### M Column Tooltip Content
Should explain:
- What standard/code this represents
- How the value is determined
- Why this threshold matters

**Example (m_23)**:
```
OBC Required Heating Setpoint
The minimum indoor heating setpoint required by the Ontario Building Code.
Residential and Care occupancies require 22°C; all others require 18°C.
```

### N Column Tooltip Content
Should explain:
- What's being compared
- Pass/fail criteria
- Implications of failing

**Example (n_23)**:
```
Heating Setpoint Compliance
Compares your heating setpoint (h_23) against OBC requirements (m_23).
✓ Pass: Your setpoint meets or exceeds code requirements
✗ Fail: Your setpoint is below code minimum - increase to comply
```

---

## Troubleshooting

### Issue: Green X appears instead of Red X

**Symptoms**: Symbol shows ✗ but in green color instead of red.

**CRITICAL RULE**: ✗ is ALWAYS red (`.warning`), ✓ is ALWAYS green (`.checkmark`)

**Root Causes**:
1. **❗ MOST COMMON**: Hardcoded `classes: ["checkmark"]` in N column field definition
2. **Missing mode check**: Missing mode check in `setElementClass()` - Reference mode overwrites Target styling
3. **Inverted logic**: `isCompliant` boolean is backwards
4. **Class not applied**: `setElementClass()` not called or called with wrong parameter
5. **Timing issue**: Class applied before DOM element exists

**Debug Steps**:
```javascript
// Add console logging to compliance function:
function calculateHeatingCompliance() {
  const actualSetpoint = getNumericValue("h_23");
  const obcRequirement = getNumericValue("m_23");
  const isCompliant = actualSetpoint >= obcRequirement;

  console.log(`[S03] n_23 Compliance: h_23=${actualSetpoint}, m_23=${obcRequirement}, isCompliant=${isCompliant}`);

  setFieldValue("n_23", isCompliant ? "✓" : "✗");
  setElementClass("n_23", isCompliant ? "checkmark" : "warning");

  // Verify class was applied:
  const element = document.querySelector('[data-field-id="n_23"]');
  console.log(`[S03] n_23 class list:`, element?.classList.toString());

  return isCompliant;
}
```

**Solutions**:
1. **REMOVE HARDCODED CLASSES** from N column field definitions - see [Section11.js](../src/sections/Section11.js) as reference
   ```javascript
   // ❌ WRONG - hardcoded class prevents dynamic styling:
   n: { fieldId: "n_38", type: "calculated", value: "✓", classes: ["checkmark"], ... }

   // ✅ CORRECT - no classes array, JavaScript applies dynamically:
   n: { fieldId: "n_38", type: "calculated", value: "✓", ... }
   ```
2. **ADD MODE CHECK** to `setElementClass()` (see Required Components section)
3. Verify comparison logic matches "Higher/Lower is Better" pattern
4. Ensure `setElementClass()` is called AFTER `setFieldValue()`
5. Check console logs to confirm Reference mode is overwriting Target styling

**Real Example from S05 (Dec 2025)**:
```
Issue 1: ✗ symbol at 260% displays in green instead of red
Root Cause: Field definitions had `classes: ["checkmark"]` hardcoded
Effect: CSS couldn't apply .warning class because .checkmark was baked into field definition
Fix: Removed classes array from n_38, n_39, n_40, n_41 field definitions
Result: Underline artifact fixed, JavaScript can now apply correct classes dynamically

Issue 2: Underline artifact appeared in taller rows (with dropdowns)
Root Cause: Complex CSS with display/margin/flex properties
Fix: Simplified to minimal CSS - just color on .checkmark/.warning, styling on .col-n parent
Result: Clean vertical centering, no artifacts

Issue 3: Using !important caused red checkmarks (false positives)
Root Cause: !important forced colors regardless of which class was applied
Fix: Removed !important, let CSS cascade work naturally
Result: ✓ is green, ✗ is red - working perfectly

Reference: Section11.js has correct implementation (no hardcoded classes)
```

**Real Example from S03 (Nov 2025)**:
```
Line 26-28: Target mode applies "warning" (h_23=18 < m_23=22) ✓ CORRECT
Line 30-32: Reference mode overwrites with "checkmark" (h_23=18 = m_23=18) ✗ WRONG
Result: Green checkmark displayed instead of red X
Fix: Added `if (ModeManager.currentMode !== "target") return;` to setElementClass()
```

---

### Issue: M/N columns show 0% on initial app load

**Symptoms**: On initial page load, compliance percentages show "0%" and checkmarks/X's appear incorrectly, then flash to correct values after a moment.

**CRITICAL RULE**: In dual-engine sections, **Reference calculations must run BEFORE Target calculations** in `calculateAll()`.

**Root Cause**: Target mode compliance calculations need Reference values (e.g., `ref_h_49`, `ref_h_50`) to exist in StateManager before they can calculate the ratio. If Target runs first, these values don't exist yet and compliance reads 0.

**Example from S07 (Dec 2025)**:
```javascript
// ❌ WRONG - Target runs first, ref_h_49 doesn't exist yet:
function calculateAll() {
  calculateTargetModel();      // Calls calculateCompliance(false)
                                // Tries to read ref_h_49 → doesn't exist → 0%
  calculateReferenceModel();   // NOW publishes ref_h_49 to StateManager
}

// ✅ CORRECT - Reference runs first, publishes values before Target needs them:
function calculateAll() {
  // ✅ S11 PATTERN: Calculate Reference first so ref_* values exist before Target compliance runs
  calculateReferenceModel();   // Publishes ref_h_49, ref_h_50, etc. to StateManager
  calculateTargetModel();      // NOW can read ref_h_49 for compliance calculation
}
```

**Why This Happens**:
1. `calculateReferenceModel()` calculates values (e.g., `h_49 = 40`) and stores to ReferenceState
2. Then publishes to StateManager as `ref_h_49` for cross-mode access
3. `calculateTargetModel()` calls `calculateCompliance()` which needs `ref_h_49` from StateManager
4. If Reference hasn't run yet, `ref_h_49` is undefined → parseNumeric returns 0 → ratio is 0%

**Solution**:
```javascript
function calculateAll() {
  calculateReferenceModel();  // Reference FIRST
  calculateTargetModel();      // Target SECOND
}
```

**Performance Note**: S07 is noticeably snappier than S05 with this fix because there's no flash/reflow from 0% → correct values. The calculations run in the correct order on first render.

**Real Example from S07 (Dec 2025)**:
```
Issue: M columns showing 0%, 0%, 333%, N/A on initialization
Root Cause: calculateAll() ran Target before Reference
Effect: Target compliance calculated before ref_h_49/ref_h_50 existed in StateManager
Fix: Swapped order to calculateReferenceModel() → calculateTargetModel()
Result: Clean initialization, no flashing, snappier than S05
Pattern Source: Section11.js (lines 2907-2908) uses this order
```

---

### Issue: Compliance doesn't update when dependencies change

**Symptoms**: M or N values don't recalculate when related fields change.

**Solutions**:
1. Add missing dependencies to field definition's `dependencies` array
2. Add StateManager listeners for cross-section dependencies (e.g., d_12, d_13)
3. Ensure compliance function is called in `calculateAll()` flow

### Issue: Wrong number format in M column

**Symptoms**: M column shows "0.85" instead of "85%" or vice versa.

**Solutions**:
- Use `setCalculatedValue(fieldId, value, "percent")` for percentage display
- Use `setFieldValue(fieldId, value)` for raw numeric display
- Check StateManager number format configuration

---

## Reference Implementations

### Working Examples
- **S03**: Code-based comparison (m_23/n_23, m_24/n_24)
- **S08**: Health threshold comparison (m_56-59/n_56-59)
- **S11**: Reference model comparison (m_85-95/n_85-95)

### Key Files
- **Field Rendering**: `src/core/FieldManager.js` (lines 586-723)
- **Global CSS**: `src/styles.css` (lines 2097-2112)
- **State Management**: `src/core/StateManager.js`
- **Mode Management**: `src/core/ModeManager.js`

---

## Quick Reference Checklist

When implementing M-N compliance:

- [ ] M column calculation function created and called BEFORE N
- [ ] N column compliance function compares correct values
- [ ] Both M and N field definitions include `dependencies` array
- [ ] `setElementClass()` helper function exists in section
- [ ] Compliance function calls `setFieldValue()` then `setElementClass()`
- [ ] Comparison logic matches "Higher/Lower is Better" pattern
- [ ] Global CSS classes (`.checkmark`, `.warning`) used - not redefined
- [ ] Tooltips explain what's compared and pass/fail criteria
- [ ] Cross-section dependencies have StateManager listeners
- [ ] Console logging added for debugging (remove after verification)

---

## Implementation Status

### ✅ Completed Sections
- **S03** (Climate Calculations): Code-based comparison (m_23/n_23, m_24/n_24)
- **S05** (Envelope): Reference model comparison (m_38-41/n_38-41) - Uses `calculateComplianceRatio()` helper pattern, Reference mode = 100%
- **S07** (Water): ✅ **VERIFIED 2025-01-12** - Reference model comparison (m_49-50, m_52-53/n_49-50, n_52-53) with proper "lower is better" logic for water/energy metrics. Formula `h_49/ref_h_49` correctly shows >100% as fail (excessive use), ≤100% as pass. Uses `calculateComplianceRatio()` helper + correct Reference-first calculation order.
- **S08** (Indoor Air Quality): ✅ **VERIFIED 2025-01-12** - Health threshold comparison (m_56-59/n_56-59). Row 59 (RH%) uses dual-slider range check: m_59 displays acceptable range "30-60%", n_59 passes only if BOTH d_59 (heating season) AND i_59 (cooling season) are within 30-60% range.
- **S11** (Embodied Carbon): Reference model comparison (m_85-95/n_85-95) - Good styling reference example

### 🚧 Pending Implementation
- **S06** (Envelope - remaining rows): Additional M/N fields may be needed
- **S09** (Renewables): M/N compliance not yet implemented
- **S10** (Water): M/N compliance not yet implemented
- **S12** (Operational Carbon): M/N compliance not yet implemented
- **S13** (Costs): Cost comparison - not yet implemented
- **S14** (Life Cycle): M/N compliance not yet implemented
- **S15** (Schedule): M/N compliance not yet implemented

### ❌ Not Applicable
- **S01, S02, S04, S06, S10, S12**: Do not require M/N compliance fields

---

## Advanced Pattern: Dual-Mode Styling (Target + Reference)

### Issue: Styling Disappears When Switching Modes

**Symptoms**: In sections with dual-state architecture (Target/Reference modes), the checkmark/warning colors work in one mode but not the other when switching.

**Root Cause**: The `setElementClass()` function only applies styling during calculation. When switching modes, `updateCalculatedDisplayValues()` updates the text content (✓/✗ symbols) but doesn't reapply the CSS classes.

**Solution Pattern** (S08 Implementation - Nov 2025):

```javascript
updateCalculatedDisplayValues: function () {
  const calculatedFields = ["n_56", "n_57", "n_58", "n_59", /* ... */];

  calculatedFields.forEach((fieldId) => {
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      // Get value from current mode's state
      let value;
      if (this.currentMode === "reference") {
        value = ReferenceState.getValue(fieldId) || "0";
      } else {
        value = TargetState.getValue(fieldId) || "0";
      }

      const formatType = getFieldFormat(fieldId);
      const formattedValue = formatType === "raw"
        ? value
        : (window.TEUI?.formatNumber?.(value, formatType) ?? value);
      element.textContent = formattedValue;

      // ✅ CRITICAL: Reapply CSS classes for status fields after updating text
      if (fieldId.startsWith("n_") && formatType === "raw") {
        element.classList.remove("checkmark", "warning");
        element.classList.add(value === "✓" ? "checkmark" : "warning");
      }
    }
  });
}
```

**Key Points**:
1. **DO** reapply classes in `updateCalculatedDisplayValues()` for dual-mode sections
2. **DO** remove the mode check from `setElementClass()` if using this pattern
3. **DO** check the symbol value (✓ vs ✗) to determine the correct class
4. This ensures styling persists when switching between Target and Reference modes

---

## Advanced Pattern: Reference Mode User Overrides (S09 Challenge)

### The Problem

**Context**: Section 09 (Internal Gains) allows users to override Reference model defaults:
- d_65 (Plug Load Density): Can override ReferenceValues.js default
- d_66 (Lighting Density): Can override 1.5 W/m² default
- g_67 (Equipment Efficiency): Can override "Efficient" default

**Reference Model Philosophy**: Should always show 100% compliance (the baseline by definition)

**The Challenge**: When user overrides Reference defaults, what should M-column show?
- Original philosophy: ref_d_66 / d_66 in Target mode
- Edge case: User changes ref_d_66 from 1.5 → 2.0 in Reference mode
- Question: Compare against original 1.5 or edited 2.0?

### Solution Options (For Future Implementation)

#### Option 1: "Original Reference" State Snapshot (Most Complete)

**Concept**: Store the original ReferenceValues.js defaults separately from user-editable Reference state.

```javascript
// On Reference mode initialization:
ReferenceState.setDefaults(); // Sets d_66 = 1.5 from ReferenceValues.js
ReferenceState.captureOriginalDefaults(); // NEW: Store ref_original_d_66 = 1.5

// M-column calculation (Target mode):
const compliance = ref_d_66 / d_66; // Compare Target vs current Reference

// M-column calculation (Reference mode):
const compliance = ref_d_66 / ref_original_d_66; // Compare edited Reference vs original Reference
```

**Pros**:
- Pure implementation of "comparison against code baseline"
- Shows when user has deviated from ReferenceValues.js defaults
- Handles all edge cases consistently
- Clear semantic meaning: "How far from original reference?"

**Cons**:
- Requires storing `ref_original_*` values (small memory overhead)
- Adds complexity to state management
- Need to decide: Should editing Reference mode update "original" or not?

**When to Use**: When it's important to track deviations from code-prescribed baselines.

---

#### Option 2: Trust ReferenceValues.js as Source of Truth (Always Fetch)

**Concept**: Always fetch reference values directly from ReferenceValues.js, never from state.

```javascript
// Import at top of section:
import { ReferenceValues } from '../core/ReferenceValues.js';

// M-column calculation:
const buildingType = getModeAwareGlobalValue("d_12");
const referenceStandard = getModeAwareGlobalValue("d_13");

// Always fetch fresh from ReferenceValues.js (authoritative source)
const referencePlugLoad = ReferenceValues.getPlugLoadDensity(buildingType, referenceStandard);

// Get current value from appropriate state
const currentValue = ModeManager.currentMode === "reference"
  ? ReferenceState.getValue("d_65")
  : TargetState.getValue("d_65");

const compliance = referencePlugLoad / currentValue;
setCalculatedValue("m_65", compliance, "percent-auto");
```

**Pros**:
- No additional state storage needed
- ReferenceValues.js remains single source of truth
- Works correctly even if user overrides Reference defaults
- Clear: "Compliance always measured against code values"

**Cons**:
- Duplicates lookup logic already in Reference initialization
- Couples compliance calculation to ReferenceValues.js API
- Slightly more computation (re-fetches on every calculation)

**When to Use**: When code compliance must always reference authoritative standards, regardless of user edits.

---

#### Option 3: Force 100% in Reference Mode (Pragmatic - Recommended)

**Concept**: Reference mode always shows 100% compliance. Target mode compares against Reference state.

```javascript
// In calculatePlugLoadCompliance() or similar:
if (ModeManager.currentMode === "reference") {
  // Reference mode: Always 100% compliant (it IS the reference)
  setCalculatedValue("m_65", 1.0, "percent-auto"); // 100%
  setCalculatedValue("n_65", "✓", "raw");

  // Reapply class for dual-mode styling (S08 pattern)
  const element = document.querySelector('[data-field-id="n_65"]');
  if (element) {
    element.classList.remove("checkmark", "warning");
    element.classList.add("checkmark");
  }
} else {
  // Target mode: Compare against Reference values
  const refValue = window.TEUI.parseNumeric(ReferenceState.getValue("d_65")) || 7;
  const targetValue = window.TEUI.parseNumeric(TargetState.getValue("d_65")) || 7;
  const compliance = targetValue > 0 ? refValue / targetValue : 0;

  setCalculatedValue("m_65", compliance, "percent-auto");
  setCalculatedValue("n_65", compliance >= 1.0 ? "✓" : "✗", "raw");

  // Apply class
  const element = document.querySelector('[data-field-id="n_65"]');
  if (element) {
    element.classList.remove("checkmark", "warning");
    element.classList.add(compliance >= 1.0 ? "checkmark" : "warning");
  }
}
```

**Pros**:
- **Zero bloat**: Simple mode check, no new storage or lookups
- **Philosophy match**: "Reference model IS 100% by definition"
- **User intent respect**: If user overrides, they're saying "this IS my reference now"
- **Target mode accuracy**: Still shows accurate ref_d_65/d_65 comparison
- **Simplest implementation**: Minimal code, easy to understand

**Cons**:
- Doesn't explicitly show when user has overridden Reference defaults
- Could be confusing if user expects to see "compliance against original code values"
- Reference mode M-column becomes somewhat redundant (always 100%)

**When to Use**: When Reference mode represents "the user's chosen baseline" rather than strictly "code minimum". Best for scenarios where informed users may legitimately want to use stricter-than-code reference values.

---

### Implementation Recommendation

**For Section 09 (and similar user-editable Reference sections)**:

Start with **Option 3 (Force 100%)** because:

1. **Matches existing philosophy**: Other sections treat Reference mode as "the baseline = 100%"
2. **Minimal complexity**: No state management changes needed
3. **User empowerment**: Allows informed users to set their own reference standards
4. **Target mode clarity**: Target vs Reference comparison remains meaningful

**Future consideration**: If code compliance tracking becomes critical (e.g., for official plan reviews), consider implementing **Option 1 (Original Snapshot)** or **Option 2 (Always Fetch)** to distinguish between:
- Code-prescribed reference values (from ReferenceValues.js)
- User-modified reference values (edited in Reference mode)

### Related Sections

This pattern applies to any section where:
- Reference mode values can be user-edited (not just display-only)
- Compliance is measured as a ratio/percentage (not absolute thresholds)
- Both Target and Reference modes need M/N compliance indicators

**Current applicability**: S09 (Internal Gains) - d_65, d_66, g_67

---

## S09 Implementation Task (For Tomorrow's Agent)

**CRITICAL: Follow Pattern 3 + Dual-Mode Styling Pattern EXACTLY**

### Task Overview
Implement M-N compliance for Section 09 (Internal Gains) rows 65, 66, 67:
- m_65/n_65: Plug Load Compliance
- m_66/n_66: Lighting Compliance
- m_67/n_67: Equipment Compliance

**Problem**: Currently M-N fields show same values in both Target (values correct) and Reference (values = Target, when they must be 100%) modes. Reference mode must ALWAYS show 100%.

### Step-by-Step Implementation

**STEP 1: Study S11's Working Pattern First**
- Read `src/sections/Section11.js` lines ~2700-2900
- Find the `updateReferenceIndicators()` function - this is the pattern to copy
- Note how it handles mode-aware calculations and CSS class application

**STEP 2: Formula Requirements**
- **Target mode**: m_65 = ref_d_65 / d_65, m_66 = ref_d_66 / d_66, m_67 = ref_d_67 / d_67
- **Reference mode**: m_65 = ref_d_65 / ref_d_65 = 100%, same for m_66, m_67
- **Pass threshold**: ratio ≥ 1.0 (100%) = green ✓, ratio < 1.0 = red ✗
- **Logic**: "Lower is better" - if target uses less than reference, compliance > 100% = pass

**STEP 3: Check for Existing Infrastructure**
Search S09 for:
- `updateReferenceIndicators` function (may already exist)
- `updateCalculatedDisplayValues` function (needed for dual-mode styling)
- `setElementClass` helper (should exist)

**STEP 4: Implementation Pattern (from docs lines 737-770)**
```javascript
// Use Option 3: Force 100% in Reference Mode
if (ModeManager.currentMode === "reference") {
  // Reference mode: Always 100%
  setCalculatedValue("m_65", 1.0, "percent");
  setCalculatedValue("n_65", "✓");

  // Apply class (S08 Dual-Mode Pattern from lines 631-635)
  const element = document.querySelector('[data-field-id="n_65"]');
  if (element) {
    element.classList.remove("checkmark", "warning");
    element.classList.add("checkmark");
  }
} else {
  // Target mode: Calculate actual ratio
  const refValue = window.TEUI.parseNumeric(window.TEUI.StateManager.getValue("ref_d_65")) || 0;
  const targetValue = window.TEUI.parseNumeric(window.TEUI.StateManager.getValue("d_65")) || 0;
  const compliance = targetValue > 0 ? refValue / targetValue : 0;

  setCalculatedValue("m_65", compliance, "percent");
  setCalculatedValue("n_65", compliance >= 1.0 ? "✓" : "✗");

  const element = document.querySelector('[data-field-id="n_65"]');
  if (element) {
    element.classList.remove("checkmark", "warning");
    element.classList.add(compliance >= 1.0 ? "checkmark" : "warning");
  }
}
```

Repeat for m_66, m_67.

**STEP 5: Dual-Mode Styling (CRITICAL - lines 600-645)**
Update `updateCalculatedDisplayValues()` to reapply CSS classes when switching modes:
```javascript
if (fieldId.startsWith("n_") && formatType === "raw") {
  element.classList.remove("checkmark", "warning");
  element.classList.add(value === "✓" ? "checkmark" : "warning");
}
```

**STEP 6: Remove Mode Check from setElementClass()**
Per line 643: If using dual-mode styling pattern, REMOVE the `if (ModeManager.currentMode !== "target") return;` check from `setElementClass()`.

**STEP 7: Verify Field Definitions**
Check that n_65, n_66, n_67 field definitions do NOT have hardcoded `classes: ["checkmark"]` arrays (lines 428-435).

### What NOT to Do
❌ Do NOT create new standalone functions without first checking S11's pattern
❌ Do NOT try to call from calculateTargetModel/calculateReferenceModel without understanding existing architecture
❌ Do NOT add M-N values to the results object in calculateModel()
❌ Do NOT over-engineer - use the simplest working pattern from S11
❌ Do NOT skip reading S11's implementation first

### Success Criteria
✅ Target mode shows actual ref_d_XX/d_XX ratios with correct pass/fail colors
✅ Reference mode shows 100% with green checkmarks for all three rows
✅ Switching between modes updates both values AND colors correctly
✅ No hardcoded classes in field definitions
✅ Pattern matches S11's implementation style

### If You Get Stuck
1. Re-read S11's `updateReferenceIndicators()` function
2. Re-read "Advanced Pattern: Dual-Mode Styling" (lines 600-645)
3. Re-read "Option 3: Force 100% in Reference Mode" (lines 737-770)
4. Ask user for clarification - don't invent solutions

---

## Dec 2, 2025 Solution: The Dead Simple Formula

**Analysis of Current S09 Implementation**:

### m_65 (Plug Loads) - Lines 1610-1624
- **Current approach**: Hardcoded conditional logic based on building type string matching
- Hardcoded values: 5 W/m² for residential/care, 7 W/m² for others
- Formula: `currentValue / hardcodedReference * 100`
- **Problem**: Not mode-aware, doesn't use ReferenceState

### m_66 (Lighting Loads) - Lines 1664-1669
- **Current approach**: Partially using `ReferenceState.getValue("d_66")`
- Formula: `currentValue / ReferenceState.getValue("d_66") * 100`
- **Problem**: Uses same ReferenceState value in both modes (no mode awareness)

### m_67 (Equipment Loads) - Line 1739
- **Current approach**: Hardcoded to 100%
- **Problem**: No actual comparison performed

### The Dead Simple Fix

All three functions already use `getFieldValueModeAware()` to get the **current** value (which correctly returns Target or Reference state depending on mode). The fix is to also get the **reference** value mode-aware:

```javascript
// Get current value (mode-aware via getFieldValueModeAware)
const currentValue = getFieldValueModeAware("d_65");

// Get reference value (always from ReferenceState, regardless of current mode)
const referenceValue = ReferenceState.getValue("d_65");

// Calculate ratio
const percentOfReference = (currentValue / referenceValue) * 100;
```

**Why this works**:
- **Target mode**: `TargetState.d_65 / ReferenceState.d_65` → actual comparison
- **Reference mode**: `ReferenceState.d_65 / ReferenceState.d_65` → 100%

**Zero conditionals needed**. The mode awareness is already built into `getFieldValueModeAware()`.

### Comparison: S07 vs S11 Approaches

**S07 Approach** ([Section07.js:1196-1203](../src/sections/Section07.js)):
```javascript
function calculateComplianceRatio(targetField, refField, isReferenceCalculation) {
  if (isReferenceCalculation) {
    return 1.0; // Reference mode: Always 100% (self-comparison)
  } else {
    const targetValue = window.TEUI.parseNumeric(window.TEUI.StateManager.getValue(targetField)) || 0;
    const refValue = window.TEUI.parseNumeric(window.TEUI.StateManager.getValue(refField)) || 0;
    return refValue > 0 ? targetValue / refValue : 0;
  }
}
```
- **Verbosity**: 9 lines + boolean parameter
- **Requires**: Passing `isReferenceCalculation` flag to every call
- **Performance**: One conditional check per field
- **Readability**: Explicit mode handling, clear intent

**S11 Approach** ([Section11.js:2438-2514](../src/sections/Section11.js)):
```javascript
function updateReferenceIndicators(rowId) {
  // Early return for Reference mode
  if (ModeManager.currentMode === "reference") {
    referencePercent = 100;
    isGood = true;
    setCalculatedValue(mFieldId, 1.0, "percent");
    // ... set checkmark ...
    return;
  }

  // Target mode: Get values and calculate
  const currentValue = getNumericValue(valueSourceFieldId);
  const referenceValue = ReferenceState.getValue(referenceFieldId);
  const referenceNumeric = window.TEUI.parseNumeric(referenceValue) || 0;

  // Calculate percentage based on component type
  if (componentType === "rsi") {
    referencePercent = (currentValue / referenceNumeric) * 100;
    isGood = currentValue >= referenceNumeric;
  } // ... other types ...
}
```
- **Verbosity**: ~80 lines for full implementation (includes RSI/U-value/penalty logic)
- **Requires**: Single mode check at function start, early return pattern
- **Performance**: One conditional check per update call (not per field)
- **Readability**: Clear separation between Reference (always 100%) and Target (actual calc)

**S09 "Dead Simple" Approach** (Implemented):
```javascript
// Inside calculatePlugLoads(), calculateLightingLoads(), calculateEquipmentLoads():
const currentValue = getFieldValueModeAware("d_65"); // Mode-aware current
const referenceValue = ReferenceState.getValue("d_65"); // Always Reference

// ⚠️ IMPORTANT: S09 uses "lower is better" logic (like S07 water/energy)
const percentOfReference = (referenceValue / currentValue) * 100; // INVERTED ratio
const isCompliant = percentOfReference >= 100; // Pass if target ≤ reference

setCalculatedValue("m_65", percentOfReference, "percent-auto");
setCalculatedValue("n_65", isCompliant ? "✓" : "✗", "raw");
setElementClass("n_65", isCompliant ? "checkmark" : "warning");
```
- **Verbosity**: 3 lines inline in existing calculation functions
- **Requires**: Nothing - leverages existing `getFieldValueModeAware()` helper
- **Performance**: Zero explicit conditionals (mode check happens inside helper)
- **Readability**: Self-documenting formula matches mathematical definition
- **Formula Direction**: Reference/Target (lower is better, like S07)

### Recommendation: Use S09 "Dead Simple" Approach

**Winner**: S09's inline approach is the **most performant and least verbose** because:

1. **No extra functions**: Calculation happens inline in existing `calculatePlugLoads()`, `calculateLightingLoads()`, `calculateEquipmentLoads()`
2. **No boolean flags**: No need to pass `isReferenceCalculation` parameter
3. **No mode checks**: Mode awareness built into `getFieldValueModeAware()` helper
4. **Self-documenting**: Formula reads exactly like the mathematical definition
5. **Minimal changes**: Just fix the reference value source (ReferenceState instead of hardcoded/conditional logic)

**When to use S07 approach**: When you need a reusable helper for many similar fields (S07 has 4 water metrics)

**When to use S11 approach**: When you need different comparison logic per component type (RSI vs U-value vs penalty)

**When to use S09 approach**: When each field has unique calculation logic but same comparison pattern (plug/lighting/equipment are different calculations)

---

---

## Dec 2, 2025 REVISED: Format-Stable Dead Simple Solution

**Baseline Commit**: `e97fe23` (M-N-COMPLIANCE branch)

### Root Cause Analysis: Format Fighting

**Problem identified**: Previous sessions achieved correct calculations (100% in Reference mode, actual ratios in Target mode) but encountered number format conflicts:
- M columns stored as **decimal ratios** (0.85, 1.0) but displayed as **percentages** ("85%", "100%")
- `updateCalculatedDisplayValues()` attempted to re-format already-formatted strings
- `setCalculatedValue()` using `"percent-auto"` format created ambiguity

### S07 Solution Pattern (Lines 1206-1332, 345-406, 905-935)

**Key insight from Section07.js**:

1. **Format ONCE during calculation** (lines 1222-1232):
   ```javascript
   // Calculate as decimal ratio
   const m_49_percent = calculateComplianceRatio("h_49", "ref_h_49", isReferenceCalculation);

   // Format IMMEDIATELY to string
   const m_49_formatted = window.TEUI?.formatNumber?.(m_49_percent, "percent-0dp") ?? "0%";

   // Store formatted string to BOTH StateManager AND local state
   window.TEUI.StateManager.setValue("m_49", m_49_formatted, "calculated");
   setSectionValue("m_49", m_49_formatted, isReferenceCalculation);
   ```

2. **Mark M/N fields as "raw" format** (lines 923-932):
   ```javascript
   function getFieldFormat(fieldId) {
     const formatMap = {
       // ... other fields ...
       // M columns: already formatted as percentages, return as-is
       m_49: "raw",
       m_50: "raw",
       // N columns: checkmarks/warnings, no formatting needed
       n_49: "raw",
       n_50: "raw",
     };
     return formatMap[fieldId] || "number-2dp-comma";
   }
   ```

3. **Skip re-formatting in updateCalculatedDisplayValues** (lines 392-396):
   ```javascript
   if (fieldId.startsWith("m_") || fieldId.startsWith("n_")) {
     formattedValue = displayValue; // Already formatted percentages or checkmarks
   } else {
     const formatType = getFieldFormat(fieldId);
     formattedValue = window.TEUI?.formatNumber?.(displayValue, formatType) ?? displayValue;
   }
   ```

### Revised S09 Implementation Strategy

**Critical changes from original "Dead Simple" approach**:

1. ❌ **DON'T** use `setCalculatedValue("m_65", percentOfReference, "percent-auto")`
   - This causes format ambiguity (is it 0.85 or 85%?)

2. ✅ **DO** format immediately and store as string:
   ```javascript
   // Calculate as decimal ratio
   const percentOfReference = (referenceValue / currentValue) * 100;

   // Format to string IMMEDIATELY
   const m_65_formatted = window.TEUI?.formatNumber?.(percentOfReference / 100, "percent-0dp") ?? "100%";

   // Store formatted string
   setCalculatedValue("m_65", m_65_formatted, "raw");
   ```

3. ✅ **DO** add M/N fields to `getFieldFormat()` map (if it exists in S09):
   ```javascript
   // If S09 has getFieldFormat, add:
   m_65: "raw",
   m_66: "raw",
   m_67: "raw",
   n_65: "raw",
   n_66: "raw",
   n_67: "raw",
   ```

4. ✅ **DO** update `updateCalculatedDisplayValues()` to skip M/N re-formatting:
   ```javascript
   calculatedFields.forEach(fieldId => {
     // ... get value logic ...

     // Format based on field type
     let formatType = "number";
     if (fieldId === "d_65" || fieldId === "d_67") {
       formatType = "number-1dp";
     } else if (fieldId.startsWith("m_") || fieldId.startsWith("n_")) {
       formatType = "raw"; // ✅ CRITICAL: Already formatted, use as-is
     } else if (/* ... other conditions ... */) {
       formatType = fieldId === "i_63" ? "raw" : "number-2dp-comma";
     }

     const formattedValue = window.TEUI.formatNumber(value, formatType);
     element.textContent = formattedValue;
   });
   ```

### Implementation Checklist

- [ ] **Step 1**: Add `getFieldFormat()` helper function (if missing) with M/N → "raw" mappings
- [ ] **Step 2**: Update `calculatePlugLoads()` to format m_65 as string immediately
- [ ] **Step 3**: Update `calculateLightingLoads()` to format m_66 as string immediately
- [ ] **Step 4**: Update `calculateEquipmentLoads()` to format m_67 as string immediately
- [ ] **Step 5**: Update `updateCalculatedDisplayValues()` to skip M/N re-formatting
- [ ] **Step 6**: Verify N column checkmarks use "raw" format for status symbols

### Expected Outcome

After implementation:
- ✅ M columns display "100%" in Reference mode, actual ratios in Target mode
- ✅ Format remains stable across mode toggles (no "1" → "100%" flashing)
- ✅ No format ambiguity (values are always stored as formatted strings)
- ✅ Performance identical to S07 (format once, display many)

---

**Last Updated**: 2025-12-02 (Revised with format-stable solution)
**Baseline Commit**: e97fe23
**Sections Using Pattern**: S03, S05, S07, S08
**Global CSS Defined**: src/styles.css lines 2097-2112
