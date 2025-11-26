# Section 18: Parallel Coordinates - Quick Reference Cheatsheet

**Purpose:** Fast reference for implementing interactive axes and financial calculations
**Full Documentation:** [S18-OPTIMIZE.md](./S18-OPTIMIZE.md)
**Date:** November 25, 2025

---

## Table of Contents

- [Interactive Axes - Quick Setup](#interactive-axes---quick-setup)
- [Financial Calculations - Quick Setup](#financial-calculations---quick-setup)
- [⚠️ Critical Pattern A Rule](#️-critical-pattern-a-rule)
- [Status Tracker](#status-tracker)
- [Common Patterns Reference](#common-patterns-reference)

---

## ⚠️ Critical Pattern A Rule

**THE #1 RULE - NO MODE SWITCHING:**

```javascript
// ❌ NEVER DO THIS
owningSection.ModeManager.switchMode(targetMode);

// ✅ ALWAYS DO THIS
const stateToUpdate = isTarget ? owningSection.TargetState : owningSection.ReferenceState;
stateToUpdate.setValue(fieldId, value);
```

**Why:** Sections stay in user-selected mode. S18 updates states without forcing mode changes. Prevents UI cross-contamination.

---

## Interactive Axes - Quick Setup

### Step 1: Add to EDITABLE_AXES (ParallelCoordinates.js)

**Location:** [ParallelCoordinates.js ~line 1098](../../src/core/ParallelCoordinates.js#L1098)

```javascript
// Simple slider pattern (most common)
'axis_id': {
  targetField: 'd_XX',           // Field ID in section
  refField: 'ref_d_XX',          // Reference field (always ref_ prefix)
  min: 0,                        // Minimum value
  max: 100,                      // Maximum value
  step: 1,                       // Snap interval (1, 5, 10, 0.1, etc.)
  unit: '%',                     // Display unit
  label: 'Label',                // Short label for modal
  owningSection: 'sectXX'        // Section module name
}
```

### Step 2: Verify CSS (Already Done)

**Location:** [styles.css lines 1923-1965](../../src/styles.css#L1923-L1965)

All interactive axes automatically get:
- Hover glow effect
- Cursor: grab/grabbing
- Drag modal styling
- No additional CSS needed

### Step 3: Test

1. Drag Target node (blue) - updates Target state
2. Drag Reference node (red) - updates Reference state
3. Section stays in current mode (doesn't force mode switch)
4. Values update in owning section
5. Graph refreshes automatically

---

## Financial Calculations - Quick Setup

### Step 1: Add to pcFinancials.js calculations object

**Location:** [pcFinancials.js ~line 44](../../src/core/pcFinancials.js#L44)

**Pattern 1: Standard (cost = bad, lower is better)**
```javascript
axis_id: {
  target: () => {
    const energy = getValue('field_id');      // Get energy/volume
    const rate = getValue('rate_field');      // Get cost rate
    return energy * rate;                     // Cost in CAD$
  },
  reference: () => {
    const energy = getValue('ref_field_id');
    const rate = getValue('ref_rate_field');
    return energy * rate;
  },
  savings: function() {
    const delta = this.reference() - this.target();  // Ref - Target
    return delta > 0 ? delta : 0;  // Only positive savings
  }
}
```

**Pattern 2: Reversed (benefit = good, higher is better)**
```javascript
axis_id: {
  target: () => {
    // Calculate benefit value (e.g., energy recovered)
    return benefitAmount * rate;
  },
  reference: () => {
    return refBenefitAmount * refRate;
  },
  savings: function() {
    const delta = this.target() - this.reference();  // Target - Ref (reversed!)
    return delta > 0 ? delta : 0;
  }
}
```

### Step 2: Test in Browser Console

```javascript
// Get financial calculations
const financials = window.TEUI.pcFinancials.calculateFinancials('axis_id', 'target');
console.log('Target cost:', financials.cost);

const savings = window.TEUI.pcFinancials.calculateFinancials('axis_id', 'savings');
console.log('Savings:', savings.cost);
```

---

## Status Tracker

### Interactive Axes (5 of 14 complete)

| Axis | Label | Section | Status | Notes |
|------|-------|---------|--------|-------|
| shw_efficiency | SHW% | S05 | ✅ DONE | Multi-fuel conditional |
| dwhr_efficiency | DWHR% | S05 | ✅ DONE | Standard slider |
| net_gains | nGains% | S11 | ✅ DONE | Discrete dropdown |
| thermal_bridge | TB% | S11 | ✅ DONE | 5% step intervals |
| ach50 | ACH50 | S12 | ✅ DONE | Dropdown flip pattern |
| aggregate_ground_uvalue | Ag | S11 | ⏳ TODO | Standard slider |
| aggregate_air_uvalue | Ae | S11 | ⏳ TODO | Standard slider |
| window_wall_ratio | WWR | S11 | ⏳ TODO | Standard slider |
| heating_efficiency | HEAT% | S13 | ⏳ TODO | Multi-fuel conditional |
| mvhr_efficiency | MVHR% | S13 | ⏳ TODO | Standard slider |
| tedi | TEDI | - | ❌ N/A | Calculated only |
| teli | TELI | - | ❌ N/A | Calculated only |
| ghgi | GHGI | - | ❌ N/A | Calculated only |
| teui | TEUI | - | ❌ N/A | Calculated only |

### Financial Calculations (4 of 14 complete)

| Axis | Target | Reference | Savings | Pattern | Status |
|------|--------|-----------|---------|---------|--------|
| SHW% | ✅ | ✅ | ✅ | Multi-fuel | DONE |
| DWHR% | ✅ | ✅ | ✅ | Recovery benefit | DONE |
| nGains% | ✅ | ✅ | ⚠️ | Reversed (TBD) | DONE* |
| TB% | ✅ | ✅ | ✅ | Standard cost | DONE |
| Ag | ⏳ | ⏳ | ⏳ | TBD | TODO |
| Ae | ⏳ | ⏳ | ⏳ | TBD | TODO |
| ACH50 | ⏳ | ⏳ | ⏳ | TBD | TODO |
| WWR | ⏳ | ⏳ | ⏳ | TBD | TODO |
| HEAT% | ⏳ | ⏳ | ⏳ | Multi-fuel | TODO |
| MVHR% | ⏳ | ⏳ | ⏳ | TBD | TODO |
| TEDI | ⏳ | ⏳ | ⏳ | TBD | TODO |
| TELI | ⏳ | ⏳ | ⏳ | TBD | TODO |
| GHGI | ⏳ | ⏳ | ❌ N/A | Emissions (no $) | TODO |
| TEUI | ⏳ | ⏳ | ⏳ | Grand total | TODO |

*nGains% savings logic needs verification - see pcFinancials.js line 173

---

## Common Patterns Reference

### Pattern A: Multi-Fuel Cost Calculation

**Used by:** SHW%, nGains%, TB%, HEAT% (upcoming)

```javascript
target: () => {
  const energy = getValue('thermal_kwh_field');
  const heatingDemand = getValue('d_114');  // Total heating demand

  if (heatingDemand === 0) return 0;

  const oilHeatingL = getValue('f_115');    // Oil volume from S13
  const electricRate = getValue('l_12');    // $/kWh
  const gasRate = getValue('l_13');         // $/kWh
  const oilRate = getValue('l_16');         // $/litre

  // All fuels calculated, only one will be non-zero
  const electricCost = energy * electricRate;
  const gasCost = energy * gasRate;

  const oilLitresPerKWh = heatingDemand > 0 ? oilHeatingL / heatingDemand : 0;
  const oilLitres = energy * oilLitresPerKWh;
  const oilCost = oilLitres * oilRate;

  return electricCost + gasCost + oilCost;
}
```

### Pattern B: Recovery/Benefit Calculation

**Used by:** DWHR%

```javascript
target: () => {
  const baseCost = calculations.shw_efficiency.target();  // Get SHW cost
  const recoveryPercent = getValue('d_53');  // DWHR% (0-100)
  return baseCost * (recoveryPercent / 100);  // Portion recovered
},
savings: function() {
  // Higher recovery = more savings (reversed pattern)
  const delta = this.target() - this.reference();
  return delta > 0 ? delta : 0;
}
```

### Pattern C: Conditional Field Selection

**Used by:** SHW%, HEAT%

```javascript
// In pcConfig.js
{
  id: "shw_efficiency",
  targetField: "d_52",              // Electric/Heatpump path
  targetFieldAlt: "k_52",           // Oil/Gas AFUE path
  targetFieldSelector: "d_51",      // Fuel type selector
  // ... reference equivalents
}

// In getAxisValue helper
if (selectorValue === "Oil" || selectorValue === "Gas") {
  fieldToUse = altField;
  multiplierToUse = altMultiplier;
}
```

### Pattern D: Discrete Dropdown

**Used by:** nGains%

```javascript
// In EDITABLE_AXES
'net_gains': {
  // ... standard fields
  isDiscrete: true,
  valueMap: {
    0: "NRC 0%",
    40: "NRC 40%",
    50: "NRC 50%",
    60: "NRC 60%",
    70: "PH Method"
  },
  discreteValues: [0, 40, 50, 60, 70],
  dropdownField: 'd_80'  // Field to write dropdown value to
}
```

### Pattern E: Dropdown Flip (Conditional Editability)

**Used by:** ACH50

```javascript
// In EDITABLE_AXES
'ach50': {
  targetField: 'g_109',        // Write field (measured value)
  dropdownField: 'd_108',      // Dropdown to flip to "MEASURED"
  // ... other fields
}

// dragEnded() automatically handles:
// 1. Set d_108 to "MEASURED"
// 2. This enables g_109 to become editable
// 3. Write new value to g_109
```

### Pattern F: Decimal Precision

**Used by:** ACH50, WWR, SHW% (conditional)

```javascript
'axis_id': {
  // ... standard fields
  step: 0.10,              // Decimal step intervals
  isDecimal: true,         // Store with decimal precision
  // Result: Uses .toFixed(2) instead of Math.round()
}
```

### Pattern G: Storage Multiplier

**Used by:** SHW% (Gas/Oil AFUE), HEAT% (Gas/Oil AFUE)

```javascript
'axis_id': {
  // ... standard fields
  targetFieldAltMultiplier: 100,  // Convert 0.90 AFUE to 90%
  // Display: 90%, Storage: 0.90
}
```

### Pattern H: Auto Fuel-Type Switching

**Used by:** HEAT% (Gas/Oil → Heatpump when dragging past 100%)

```javascript
// When user drags HEAT% node past 100% efficiency:
// 1. Gas/Oil AFUE maxes out at 100% (physical limit)
// 2. User drags to 105% → Auto-switch to Heatpump mode
// 3. Selector field (d_113 or ref_d_113) changes to "Heatpump"
// 4. HSPF inversion activates: 105% → COP 1.05 → HSPF 3.58
// 5. Section 13 recalculates and displays new fuel type
// 6. Graph refreshes with heatpump efficiency curve

// Example flow:
// Initial: Gas @ 90% (j_115 = 0.90)
// User drags to 105%
// → d_113 = "Heatpump"
// → f_113 = 3.58 (HSPF)
// → h_113 = 1.05 (COP)
// → Display: 105%
```

---

## Quick Field Reference

### Common Field IDs

| Field | Description | Type |
|-------|-------------|------|
| l_12 | Electricity rate ($/kWh) | Cost rate |
| l_13 | Gas rate ($/kWh) | Cost rate |
| l_16 | Oil rate ($/litre) | Cost rate |
| d_114 | Total heating demand (kWh) | Energy |
| f_115 | Oil heating volume (litres) | Volume |
| k_51 | SHW electric demand (kWh) | Energy |
| e_51 | SHW gas energy (kWh) | Energy |
| k_54 | SHW oil volume (litres) | Volume |
| i_80 | Internal gains avoided heating (kWh) | Energy |
| i_97 | Thermal bridging loss (kWh) | Energy |

### Prefix Conventions

- **d_XX**: User input (direct)
- **e_XX**: Calculated (engine)
- **f_XX**: Fuel/volume
- **g_XX**: Calculated (general)
- **h_XX**: Calculated (high-level)
- **i_XX**: Intermediate
- **j_XX**: Fuel efficiency
- **k_XX**: Final energy
- **l_XX**: Cost rates
- **ref_XX**: Reference mode (always prefix)

---

## File Locations

| File | Purpose | Line Range |
|------|---------|------------|
| [ParallelCoordinates.js](../../src/core/ParallelCoordinates.js) | Interactive dragging | 941-1415 |
| [pcConfig.js](../../src/core/pcConfig.js) | Axis definitions | 25-242 |
| [pcFinancials.js](../../src/core/pcFinancials.js) | Cost calculations | 44-346 |
| [styles.css](../../src/styles.css) | Visual styling | 1923-1965 |

---

## Testing Checklist

### Interactive Axis Testing

- [ ] Drag Target node (blue) → Target state updates
- [ ] Drag Reference node (red) → Reference state updates
- [ ] Section stays in current mode (no forced mode switch)
- [ ] Owning section slider/field updates correctly
- [ ] Values snap to correct intervals
- [ ] Modal shows correct label and unit
- [ ] Modal color: Blue for Target, Red for Reference
- [ ] Graph refreshes after drag
- [ ] StateManager has correct values (ref_ prefix for Reference)
- [ ] No console errors

### Financial Calculation Testing

```javascript
// In browser console
const axis = 'axis_id';

// Test Target cost
const targetCost = window.TEUI.pcFinancials.calculateFinancials(axis, 'target');
console.log('Target:', targetCost.cost);

// Test Reference cost
const refCost = window.TEUI.pcFinancials.calculateFinancials(axis, 'reference');
console.log('Reference:', refCost.cost);

// Test Savings
const savings = window.TEUI.pcFinancials.calculateFinancials(axis, 'savings');
console.log('Savings:', savings.cost);

// Verify pattern
// Standard: Savings = Ref - Target (should be positive when Target < Ref)
// Reversed: Savings = Target - Ref (should be positive when Target > Ref)
```

---

## Common Issues and Solutions

### Issue 1: Values Not Updating in Section

**Symptom:** Drag node in S18, section doesn't update

**Check:**
1. `owningSection` field matches section module name (e.g., 'sect11', not 'section11')
2. `targetField` matches exact field ID in section
3. Section has `calculateAll()` and `refreshUI()` methods
4. Section is registered in `window.TEUI.SectionModules`

**Fix:** Verify field IDs with grep: `grep -n "fieldId: \"d_XX\"" src/sections/SectionXX.js`

### Issue 2: Wrong Mode Displayed After Drag

**Symptom:** Drag Reference node, section shows Reference values even though global toggle is Target

**Cause:** Forced mode switch (obsolete pattern)

**Fix:** Ensure dragEnded() does NOT call `ModeManager.switchMode()`. Section should stay in current mode.

### Issue 3: Decimal Values Rounding to Whole Numbers

**Symptom:** ACH50 rounds 1.30 to 1

**Cause:** Missing `isDecimal: true` flag

**Fix:**
```javascript
'axis_id': {
  // ... other fields
  step: 0.10,
  isDecimal: true  // Add this flag
}
```

### Issue 4: Financial Calculations Return 0

**Symptom:** `calculateFinancials()` returns { cost: 0 }

**Check:**
1. Field IDs correct (check for typos)
2. StateManager has values for those fields
3. getValue() properly strips currency formatting
4. Rates (l_12, l_13, l_16) are not zero

**Debug:**
```javascript
const axisId = 'axis_id';
const calc = window.TEUI.pcFinancials.calculateFinancials;

// Check intermediate values
console.log('Target calc:', calc(axisId, 'target'));
console.log('Ref calc:', calc(axisId, 'reference'));

// Check StateManager values
console.log('Field value:', window.TEUI.StateManager.getValue('field_id'));
console.log('Rate value:', window.TEUI.StateManager.getValue('l_12'));
```

---

## Next Steps

### Remaining Interactive Axes (2)

1. **HEAT%** (Section 13) - Multi-fuel conditional pattern
2. **MVHR%** (Section 13) - Standard slider pattern

### Remaining Financial Calculations (10)

Priority order:
1. **HEAT%** - Multi-fuel heating cost (high impact)
2. **MVHR%** - Ventilation heat recovery cost
3. **ACH50** - Airtightness impact on heating
4. **WWR** - Window-to-wall ratio impact
5. **Ag / Ae** - U-value impact on heat loss
6. **TEDI / TELI** - Thermal energy metrics
7. **TEUI** - Grand total energy cost
8. **GHGI** - Emissions (no $ savings, display only)

---

## Capital Budget & Simple ROI - Implementation Guide

### Overview

**Purpose:** Allow users to enter capital cost premiums for Target improvements and calculate simple payback period (ROI in years).

**Table Structure:**
```
Header Row
Capital Budget Row        (NEW - user-editable inputs)
Reference Cost Row
Target Cost Row
Target Savings Row
Target Simple ROI Row     (NEW - calculated payback period)
```

### Capital Budget Row

**Position:** Immediately after header row, before Reference Cost row

**Features:**
- User-editable `<input type="text">` fields for each axis
- Format: `$0,000.00` with live formatting on blur
- Storage: localStorage key `pc_capital_budget_{axisId}`
- Cleared by: Global reset function
- Label: "Capital Budget"

**Implementation Pattern:**
```javascript
// Create Capital Budget row
const capitalBudgetRow = document.createElement("tr");
capitalBudgetRow.innerHTML = `<td class="pc-row-label"><strong>Capital Budget</strong></td>`;

axes.forEach(axis => {
  const savedValue = localStorage.getItem(`pc_capital_budget_${axis.id}`) || "0";
  const formattedValue = formatCurrency(parseFloat(savedValue));

  const inputHTML = `
    <td class="text-center">
      <input
        type="text"
        class="pc-capital-input"
        data-axis="${axis.id}"
        value="${formattedValue}"
        style="width: 100px; text-align: center;"
      />
    </td>
  `;
  capitalBudgetRow.innerHTML += inputHTML;
});

tbody.appendChild(capitalBudgetRow);

// Attach event listeners
document.querySelectorAll('.pc-capital-input').forEach(input => {
  input.addEventListener('blur', (e) => {
    const axisId = e.target.dataset.axis;
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(rawValue) || 0;

    // Save to localStorage
    localStorage.setItem(`pc_capital_budget_${axisId}`, numValue.toString());

    // Format display
    e.target.value = formatCurrency(numValue);

    // Recalculate ROI row
    updateROIRow();
  });
});
```

### Target Simple ROI Row

**Position:** After Target Savings row (last row in table)

**Formula:**
```javascript
Simple ROI (years) = Capital Budget ÷ Annual Savings
```

**Key Requirements:**
1. **Always use annual savings** (ROI Term = 1 year), NOT the multiplied savings shown in Target Savings row
2. Display format: `X.X years` (1 decimal place)
3. Special cases:
   - If Capital Budget = 0: Display `-` (no investment)
   - If Annual Savings = 0: Display `∞` (infinite payback)
   - If Annual Savings < 0: Display `N/A` (negative savings, no ROI)

**Implementation Pattern:**
```javascript
// Target Simple ROI row
const roiRow = document.createElement("tr");
roiRow.innerHTML = `<td class="pc-row-label"><strong>Target Simple ROI</strong></td>`;
roiRow.classList.add('pc-roi-row'); // For easy updates

axes.forEach(axis => {
  const capitalBudget = parseFloat(localStorage.getItem(`pc_capital_budget_${axis.id}`) || "0");

  if (hasPro) {
    // Get ANNUAL savings (ROI Term = 1, not the multiplied display value)
    const annualSavingsResult = window.TEUI.pcFinancials.calculateFinancials(
      axis.id,
      "savings"
    );
    const annualSavings = annualSavingsResult.cost; // Already annual (1yr term)

    let roiDisplay;
    if (capitalBudget === 0) {
      roiDisplay = '-'; // No investment
    } else if (annualSavings <= 0) {
      roiDisplay = 'N/A'; // No savings or negative
    } else {
      const roiYears = capitalBudget / annualSavings;
      roiDisplay = `${roiYears.toFixed(1)} yrs`;
    }

    roiRow.innerHTML += `<td class="text-center">${roiDisplay}</td>`;
  } else {
    roiRow.innerHTML += `<td class="text-center">-</td>`;
  }
});

tbody.appendChild(roiRow);
```

### localStorage Management

**Why localStorage and not StateManager?**
- Capital budgets are **UI-specific settings** (like user preferences), not building model data
- They have no Excel field equivalents (web-app only feature)
- StateManager is for model fields that sync with Excel import/export
- localStorage is appropriate for app settings that persist across sessions

**Keys:**
- `pc_capital_budget_shw_efficiency`
- `pc_capital_budget_dwhr_efficiency`
- `pc_capital_budget_net_gains`
- `pc_capital_budget_thermal_bridge`
- `pc_capital_budget_ach50`
- `pc_capital_budget_aggregate_ground_uvalue`
- `pc_capital_budget_aggregate_air_uvalue`
- `pc_capital_budget_window_wall_ratio`
- `pc_capital_budget_heating_efficiency`
- `pc_capital_budget_mvhr_efficiency`
- `pc_capital_budget_tedi`
- `pc_capital_budget_teli`
- `pc_capital_budget_ghgi`
- `pc_capital_budget_teui`

**Default Values (hardcoded):**
Applied only when localStorage key doesn't exist (first load or after clear):
```javascript
const defaultCapitalBudgets = {
  'shw_efficiency': 10000,
  'dwhr_efficiency': 5000,
  'net_gains': 100000,
  'thermal_bridge': 50000,
  'aggregate_ground_uvalue': 20000,
  'aggregate_air_uvalue': 100000,
  'ach50': 30000,
  'window_wall_ratio': 50000,
  'heating_efficiency': 50000,
  'mvhr_efficiency': 50000,
  'tedi': 1,
  'teli': 100000,
  'ghgi': 0,
  'teui': 0
};
```

**Clear on Global Reset:**
✅ **Already implemented** in [StateManager.js:292-302](../../src/core/StateManager.js#L292-L302)
- User clicks global reset button
- All `pc_capital_budget_*` keys removed from localStorage
- On next page load/refresh, hardcoded defaults return

**Clear on File Import:**
✅ **Implemented** in [FileHandler.js:160-171](../../src/core/FileHandler.js#L160-L171) & [FileHandler.js:414-425](../../src/core/FileHandler.js#L414-L425)
- When user imports Excel/CSV file
- All capital budgets set to $0.00 (not defaults)
- New building = new costs, old budgets irrelevant
- User can set new values after import
- Applied to both `processImportedExcel()` and `processImportedCSV()`

### ROI Calculation Logic

**Critical Rule:** Simple ROI always uses **annual savings** (1-year term), regardless of ROI Term setting in modal.

**Why:**
- Target Savings row displays cumulative savings over ROI Term (e.g., 5 years × $1,000 = $5,000)
- But payback period is always in years, so we need annual rate
- Simple ROI = Capital ÷ Annual Savings = $3,000 ÷ $1,000/yr = 3.0 years

**Example:**
```
ROI Term Setting: 5 years
Annual Savings: $1,000/yr
Target Savings Row Shows: $5,000 (5 × $1,000)
Capital Budget: $3,000

Simple ROI = $3,000 ÷ $1,000/yr = 3.0 years ✅
NOT: $3,000 ÷ $5,000 = 0.6 years ❌
```

### GHGI Carbon Pricing Support

**NEW (Nov 26, 2025):** GHGI now supports carbon pricing for jurisdictions with carbon markets

**How it works:**
- GHGI Capital Budget field represents **carbon price per metric ton** ($/tCO2e)
- Simple ROI row displays **annual carbon cost savings** instead of payback years
- Formula: `Carbon Cost Savings = Emissions Reduction (MT) × Carbon Price ($/MT)`
- Conversion: kgCO2e ÷ 1000 = Metric Tons (MT)

**Example:**
```
Emissions Reduction: 7,000 kgCO2e/yr = 7.0 MT/yr
Carbon Price: $50/MT (entered in GHGI Capital Budget field)
Carbon Cost Savings: 7.0 × $50 = $350.00/yr

Display: GHGI Simple ROI shows "$350.00" (not years)
```

**Jurisdictions:**
- No carbon pricing (default): Leave GHGI Capital Budget at $0.00 → Shows "N/A"
- With carbon pricing: Enter $/MT → Shows annual carbon cost savings

```javascript
if (axis.id === 'ghgi') {
  roiRow.innerHTML += `<td class="text-center">N/A</td>`;
} else {
  // Normal ROI calculation
}
```

### CSS Styling

**Capital Budget Input:**
```css
.pc-capital-input {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  background: #fff;
  transition: border-color 0.2s;
}

.pc-capital-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
```

### Testing Checklist

**Capital Budget Input:**
- [ ] Enter value → formats to $X,XXX.XX on blur
- [ ] Saves to localStorage correctly
- [ ] Persists across page reloads
- [ ] Clears on global reset
- [ ] Handles decimal inputs (e.g., 1234.56)
- [ ] Handles invalid inputs gracefully (defaults to 0)

**Simple ROI Calculation:**
- [ ] Capital = $3,000, Annual Savings = $1,000 → Shows "3.0 yrs"
- [ ] Capital = $0 → Shows "-"
- [ ] Annual Savings = $0 → Shows "∞" or "N/A"
- [ ] Annual Savings < $0 → Shows "N/A"
- [ ] GHGI column → Shows "N/A"
- [ ] ROI updates when Capital Budget changes
- [ ] ROI respects annual savings, NOT ROI Term multiplier

**ROI Term Interaction:**
- [ ] Set ROI Term = 1 year → Savings row shows $1,000, ROI = 3.0 yrs
- [ ] Set ROI Term = 5 years → Savings row shows $5,000, ROI still = 3.0 yrs ✅
- [ ] Change term → Savings row updates, ROI stays consistent

---

---

## Optimization Button Logic

### Overview

Four optimization buttons provide automated parameter adjustments:
- **Decarbonize** (Green): Minimize GHGI by switching fossil fuels to heat pumps
- **Optimize** (Teal): Balanced cost/performance optimization (moderate efficiency improvements)
- **Super Optimize** (Orange): Aggressive multi-objective optimization (high efficiency improvements)
- **PassivHaus-ify** (Yellow/Red): Set values to achieve PH certification target (120 PER at f_35)

---

## Common Implementation Framework

All optimization buttons follow the same architectural pattern to ensure consistency and reliability.

### Core Pattern A Architecture

**CRITICAL RULES:**
1. ✅ **Pattern A Compliance**: Update `TargetState` + `StateManager` (NEVER force mode switching)
2. ✅ **Conditional Field Switching**: Set dropdown FIRST, recalculate, THEN set efficiency value
3. ✅ **Section Recalculation**: Call `calculateAll()` and `refreshUI()` after changes
4. ✅ **User Feedback**: Show clear feedback console message with what changed
5. ✅ **Graph Refresh**: Use `setTimeout()` with 200ms delay to let calculations propagate

### Standard Implementation Template

```javascript
function handleOptimizationButton() {
  console.log("[ParallelCoordinates] Button action triggered");

  const stateManager = window.TEUI?.StateManager;
  if (!stateManager) {
    console.error("[ParallelCoordinates] StateManager not available");
    return;
  }

  let changesMade = false;
  const changes = []; // Track changes for user feedback

  // ========================================================================
  // For each field to set:
  // ========================================================================
  const sectionModule = window.TEUI?.SectionModules?.sectXX;

  // Pattern 1: Simple value setting (no dropdown switching)
  if (sectionModule?.TargetState) {
    sectionModule.TargetState.setValue("field_id", "value");
  }
  stateManager.setValue("field_id", "value", "user-modified");
  changes.push("Field description");
  changesMade = true;

  // Pattern 2: Conditional field switching (dropdown changes active field)
  // Step 1: Set dropdown value FIRST
  if (sectionModule?.TargetState) {
    sectionModule.TargetState.setValue("dropdown_field", "new_option");
  }
  stateManager.setValue("dropdown_field", "new_option", "user-modified");

  // Step 2: Recalculate to activate new field set
  if (sectionModule?.calculateAll) {
    sectionModule.calculateAll();
  }

  // Step 3: NOW set the efficiency value (field is active)
  if (sectionModule?.TargetState) {
    sectionModule.TargetState.setValue("efficiency_field", "value");
  }
  stateManager.setValue("efficiency_field", "value", "user-modified");
  changes.push("Fuel type + efficiency change");
  changesMade = true;

  // Trigger section recalculation
  if (sectionModule && changesMade) {
    if (sectionModule.calculateAll) {
      sectionModule.calculateAll();
    }
    if (sectionModule.ModeManager?.refreshUI) {
      sectionModule.ModeManager.refreshUI();
    }
  }

  // ========================================================================
  // Show feedback and refresh graph
  // ========================================================================
  if (changesMade) {
    const message = changes.join(", ");
    showFeedback(message, 6000);
    console.log("[Button] Optimization complete - refreshing graph");
    setTimeout(() => {
      refresh();
    }, 200); // 200ms delay for section calculations
  } else {
    showFeedback("No changes needed", 4000);
    console.log("[Button] No changes needed");
  }
}
```

---

## Button 1: Decarbonize (Green)

**Purpose:** Minimize greenhouse gas emissions by transitioning fossil fuel systems to heat pumps

**Strategy:** Switch Gas/Oil → Heatpump (Electric stays unchanged)

**Implementation:** ✅ **COMPLETE** - See [ParallelCoordinates.js:1237-1386](../../src/core/ParallelCoordinates.js#L1237-L1386)

### Field Changes

| Section | Field | Current Value | New Value | Notes |
|---------|-------|---------------|-----------|-------|
| S07 | d_51 | Oil/Gas | Heatpump | SHW fuel type dropdown |
| S07 | d_52 | varies | 300 | SHW COP% (Heatpump only) |
| S13 | d_113 | Oil/Gas | Heatpump | Heating fuel type dropdown |
| S13 | f_113 | varies | 12.5 | HSPF (Heatpump only) |

### Logic Flow

1. **Service Hot Water (S07 - SHW%)**
   ```javascript
   const d_51 = stateManager.getValue('d_51');

   if (d_51 === "Oil" || d_51 === "Gas") {
     // CRITICAL: Dropdown FIRST, recalc, THEN efficiency
     // Step 1: Set fuel type
     sect07.TargetState.setValue("d_51", "Heatpump");
     stateManager.setValue("d_51", "Heatpump", "user-modified");

     // Step 2: Recalculate (switches from k_52 to d_52)
     sect07.calculateAll();

     // Step 3: Set efficiency (d_52 now active)
     sect07.TargetState.setValue("d_52", "300");
     stateManager.setValue("d_52", "300", "user-modified");
   } else if (d_51 === "Heatpump") {
     // Already Heatpump - ensure minimum 300% COP
     const d_52 = parseFloat(stateManager.getValue("d_52")) || 0;
     if (d_52 < 300) {
       sect07.TargetState.setValue("d_52", "300");
       stateManager.setValue("d_52", "300", "user-modified");
     }
   }
   // Electric: No change (already low carbon)
   ```

2. **Space Heating (S13 - HEAT%)**
   ```javascript
   const d_113 = stateManager.getValue('d_113');

   if (d_113 === "Oil" || d_113 === "Gas") {
     // CRITICAL: Dropdown FIRST, recalc, THEN efficiency
     // Step 1: Set fuel type
     sect13.TargetState.setValue("d_113", "Heatpump");
     stateManager.setValue("d_113", "Heatpump", "user-modified");

     // Step 2: Recalculate (switches from j_115 to f_113)
     sect13.calculateAll();

     // Step 3: Set efficiency (f_113 now active)
     sect13.TargetState.setValue("f_113", "12.5");
     stateManager.setValue("f_113", "12.5", "user-modified");
   } else if (d_113 === "Heatpump") {
     // Already Heatpump - ensure minimum HSPF 12.5
     const f_113 = parseFloat(stateManager.getValue("f_113")) || 0;
     if (f_113 < 12.5) {
       sect13.TargetState.setValue("f_113", "12.5");
       stateManager.setValue("f_113", "12.5", "user-modified");
     }
   }
   // Electric: No change (already low carbon)
   ```

### User Feedback Messages

- Oil/Gas SHW → Heatpump: `"Oil SHW → Heatpump 300%"`
- Oil/Gas Heating → Heatpump: `"Gas Heating → Heatpump HSPF 12.5"`
- Already optimized: `"Nice! Your building is already zero emissions!"`

### Testing Checklist

- [x] Oil SHW → Heatpump @ 300%
- [x] Gas SHW → Heatpump @ 300%
- [x] Electric SHW → No change
- [x] Heatpump SHW < 300% → Raised to 300%
- [x] Heatpump SHW >= 300% → No change
- [x] Oil Heating → Heatpump @ HSPF 12.5
- [x] Gas Heating → Heatpump @ HSPF 12.5
- [x] Electric Heating → No change
- [x] Heatpump Heating < 12.5 → Raised to HSPF 12.5
- [x] Heatpump Heating >= 12.5 → No change
- [x] Graph refreshes with new values
- [x] GHGI axis shows reduction
- [x] No mode switching occurs
- [x] Feedback console shows changes

---

## Button 2: Optimize (Teal)

**Purpose:** Balanced cost/performance optimization with moderate efficiency improvements

**Strategy:** Set standard efficiency values across all editable parameters

**Implementation:** ⏳ **IN PROGRESS** - Ready to code

### Field Changes

| Section | Field | Description | Value | Notes |
|---------|-------|-------------|-------|-------|
| S07 | d_51 / d_52 | SHW fuel + efficiency | Heatpump @ 300% | **Must switch to Heatpump first!** |
| S07 | d_53 | DWHR recovery % | 50 | Standard slider |
| S13 | d_113 / j_115 / f_113 | Heating efficiency | See below | Conditional logic |
| S13 | d_120 | MVHR efficiency % | 75 | Standard slider |
| S11 | d_88 | Thermal bridging % | 20 | Standard slider |
| S12 | d_108 / g_109 | ACH50 | 1.00 | Dropdown flip + value |
| S11 | d_80 | Net gains method | NRC 60% | Dropdown value |

**SHW Efficiency Logic (300%):**
- **CRITICAL:** 300% efficiency requires Heatpump (not Electric/Oil/Gas)
- Step 1: IF d_51 ≠ "Heatpump" → Set d_51 = "Heatpump", recalculate
- Step 2: Set d_52 = "300"

**Heating Efficiency Logic:**
- IF current fuel = Gas/Oil → Set j_115 (AFUE) = 0.98
- ELSE IF current fuel = Heatpump → Set f_113 (HSPF) = 12.5
- ELSE IF current fuel = Electric → No change

### Implementation Placeholder

```javascript
function handleOptimize() {
  console.log("[ParallelCoordinates] Optimize action triggered");

  const stateManager = window.TEUI?.StateManager;
  if (!stateManager) {
    console.error("[ParallelCoordinates] StateManager not available");
    return;
  }

  let changesMade = false;
  const changes = [];

  // ========================================================================
  // Field changes will be added here
  // ========================================================================
  // Example pattern:
  // const sectXX = window.TEUI?.SectionModules?.sectXX;
  // if (sectXX?.TargetState) {
  //   sectXX.TargetState.setValue("field_id", "value");
  // }
  // stateManager.setValue("field_id", "value", "user-modified");
  // changes.push("Field description");
  // changesMade = true;

  // ========================================================================
  // Section recalculations
  // ========================================================================
  // Add section recalculations as needed

  // ========================================================================
  // Feedback and refresh
  // ========================================================================
  if (changesMade) {
    const message = changes.join(", ");
    showFeedback(message, 6000);
    setTimeout(() => { refresh(); }, 200);
  } else {
    showFeedback("No changes needed", 4000);
  }
}
```

### User Feedback Messages

- TBD based on field changes

---

## Button 3: Super Optimize (Orange)

**Purpose:** Aggressive multi-objective optimization with high efficiency improvements

**Strategy:** Set high-performance efficiency values across all editable parameters

**Implementation:** ⏳ **IN PROGRESS** - Ready to code

### Field Changes

| Section | Field | Description | Value | Notes |
|---------|-------|-------------|-------|-------|
| S07 | d_51 / d_52 | SHW fuel + efficiency | Heatpump @ 400% | **Must switch to Heatpump first!** |
| S07 | d_53 | DWHR recovery % | 70 | Standard slider |
| S13 | d_113 / j_115 / f_113 | Heating efficiency | See below | Conditional logic |
| S13 | d_120 | MVHR efficiency % | 90 | Standard slider |
| S11 | d_88 | Thermal bridging % | 5 | Standard slider |
| S12 | d_108 / g_109 | ACH50 | 0.60 | Dropdown flip + value |
| S11 | d_80 | Net gains method | PH Method | Dropdown switch to PHPP |

**SHW Efficiency Logic (400%):**
- **CRITICAL:** 400% efficiency requires Heatpump (not Electric/Oil/Gas)
- Step 1: IF d_51 ≠ "Heatpump" → Set d_51 = "Heatpump", recalculate
- Step 2: Set d_52 = "400"

**Heating Efficiency Logic:**
- IF current fuel = Gas/Oil → Set j_115 (AFUE) = 0.98
- ELSE IF current fuel = Heatpump → Set f_113 (HSPF) = 15
- ELSE IF current fuel = Electric → No change

### Implementation Placeholder

```javascript
function handleSuperOptimize() {
  console.log("[ParallelCoordinates] Super Optimize action triggered");

  const stateManager = window.TEUI?.StateManager;
  if (!stateManager) {
    console.error("[ParallelCoordinates] StateManager not available");
    return;
  }

  let changesMade = false;
  const changes = [];

  // ========================================================================
  // Field changes will be added here (higher values than Optimize)
  // ========================================================================
  // Same pattern as Optimize, different values

  // ========================================================================
  // Section recalculations
  // ========================================================================
  // Add section recalculations as needed

  // ========================================================================
  // Feedback and refresh
  // ========================================================================
  if (changesMade) {
    const message = changes.join(", ");
    showFeedback(message, 6000);
    setTimeout(() => { refresh(); }, 200);
  } else {
    showFeedback("No changes needed", 4000);
  }
}
```

### User Feedback Messages

- TBD based on field changes

---

## Button 4: PassivHaus-ify (Yellow/Red)

**Purpose:** Set values to achieve PassivHaus certification target (120 PER at f_35)

**Strategy:** For now, applies same optimizations as Super Optimize. Sequential PER targeting to be added later.

**Implementation:** ⏳ **IN PROGRESS** - Ready to code (Phase 1: Same as Super Optimize)

### Phase 1: Field Changes (Same as Super Optimize)

| Section | Field | Description | Value | Notes |
|---------|-------|-------------|-------|-------|
| S07 | d_51 / d_52 | SHW fuel + efficiency | Heatpump @ 400% | **Must switch to Heatpump first!** |
| S07 | d_53 | DWHR recovery % | 70 | Standard slider |
| S13 | d_113 / j_115 / f_113 | Heating efficiency | See below | Conditional logic |
| S13 | d_120 | MVHR efficiency % | 90 | Standard slider |
| S11 | d_88 | Thermal bridging % | 5 | Standard slider |
| S12 | d_108 / g_109 | ACH50 | 0.60 | Dropdown flip + value |
| S11 | d_80 | Net gains method | PH Method | Dropdown switch to PHPP |

**SHW Efficiency Logic (400%):**
- **CRITICAL:** 400% efficiency requires Heatpump (not Electric/Oil/Gas)
- Step 1: IF d_51 ≠ "Heatpump" → Set d_51 = "Heatpump", recalculate
- Step 2: Set d_52 = "400"

**Heating Efficiency Logic:**
- IF current fuel = Gas/Oil → Set j_115 (AFUE) = 0.98
- ELSE IF current fuel = Heatpump → Set f_113 (HSPF) = 15
- ELSE IF current fuel = Electric → No change

### Phase 2: PER Targeting (Future Enhancement)

**CRITICAL:** Will add sequential execution with intermediate recalculations to check progress toward PER target (f_35 ≤ 120).

**Sequence Pattern:**
```javascript
function handlePassivHausIfy() {
  console.log("[ParallelCoordinates] PassivHaus-ify action triggered");

  const stateManager = window.TEUI?.StateManager;
  if (!stateManager) {
    console.error("[ParallelCoordinates] StateManager not available");
    return;
  }

  let changesMade = false;
  const changes = [];

  // ========================================================================
  // Step 1: Set initial field values
  // ========================================================================
  // TBD

  // Recalculate and check f_35 (PER value)
  // const f_35 = parseFloat(stateManager.getValue("f_35")) || 0;

  // ========================================================================
  // Step 2: Conditional adjustments based on f_35
  // ========================================================================
  // if (f_35 > 120) {
  //   // Adjust additional fields
  // }

  // ========================================================================
  // Step 3: Final validation
  // ========================================================================
  // const final_f_35 = parseFloat(stateManager.getValue("f_35")) || 0;
  // if (final_f_35 <= 120) {
  //   changes.push("PassivHaus target achieved (PER ≤ 120)");
  // } else {
  //   changes.push(`Close! PER = ${final_f_35.toFixed(1)}`);
  // }

  // ========================================================================
  // Feedback and refresh
  // ========================================================================
  if (changesMade) {
    const message = changes.join(", ");
    showFeedback(message, 6000);
    setTimeout(() => { refresh(); }, 200);
  } else {
    showFeedback("No changes needed", 4000);
  }
}
```

### Field Changes Template

| Step | Section | Field | Description | Value | Notes |
|------|---------|-------|-------------|-------|-------|
| TBD | TBD | TBD | TBD | TBD | TBD |

### User Feedback Messages

- Success: `"PassivHaus target achieved! (PER ≤ 120)"`
- Close: `"Close! PER = XXX (target: 120)"`
- TBD based on sequential steps

---

## Field Reference for All Buttons

### Common Field Reference

| Section | Field | Type | Values/Range | Description |
|---------|-------|------|--------------|-------------|
| S05 | d_51 | Dropdown | Oil, Gas, Electric, Heatpump | SHW fuel type |
| S05 | d_52 | Slider | 100-450 | SHW efficiency % (Heatpump/Electric) |
| S05 | k_52 | Decimal | 0.50-0.98 | SHW AFUE (Oil/Gas) |
| S05 | d_53 | Slider | 0-80 | DWHR% recovery |
| S11 | d_80 | Dropdown | NRC 0%, 40%, 50%, 60%, PH Method | Net internal gains method |
| S11 | d_88 | Slider | 0-50 | Thermal bridging % |
| S11 | d_92 | Slider | 0.10-2.00 | Aggregate ground U-value (Ag) |
| S11 | d_96 | Slider | 0.10-2.00 | Aggregate air U-value (Ae) |
| S11 | d_104 | Slider | 10-90 | Window-to-wall ratio % (WWR) |
| S12 | d_108 | Dropdown | NRC, MEASURED, PH (9999) | ACH50 test method |
| S12 | g_109 | Decimal | 0.60-15.00 | ACH50 measured value |
| S13 | d_113 | Dropdown | Oil, Gas, Electric, Heatpump | Heating fuel type |
| S13 | f_113 | Slider | 6.8-20.0 | HSPF (Heatpump only) |
| S13 | h_113 | Calculated | - | COP = f_113 ÷ 3.412 |
| S13 | j_115 | Decimal | 0.50-1.00 | Heating AFUE (Oil/Gas) |
| S13 | d_120 | Slider | 0-100 | MVHR efficiency % |
| S03 | f_35 | Calculated | - | PER (PassivHaus Energy Rating) |

### Storage Format Notes

- **Dropdown values**: Stored as exact string matches ("Heatpump", "Electric", "Oil", "Gas", "NRC 40%", etc.)
- **Percentage sliders**: Stored as string numbers ("300" = 300%, "80" = 80%)
- **Decimal sliders**: Stored as string decimals ("12.5", "1.30", "0.90")
- **CRITICAL**: When setting dropdown-dependent fields, always set dropdown FIRST, recalculate, THEN set value

---

## Next Steps for Implementation

### For Optimize & Super Optimize Buttons

**Awaiting:** Field values list in format:

```
| Section | Field | Description | Optimize Value | Super Optimize Value |
|---------|-------|-------------|----------------|----------------------|
| S05 | d_53 | DWHR% | 40 | 60 |
| S11 | d_88 | TB% | 20 | 10 |
| ... | ... | ... | ... | ... |
```

### For PassivHaus-ify Button

**Awaiting:** Sequential steps with intermediate PER checks:

```
Step 1: Set fields A, B, C → recalculate → check f_35
Step 2: If f_35 > 120, set fields D, E → recalculate → check f_35
Step 3: If f_35 still > 120, set fields F, G → recalculate → final check
```

---

## Implementation Tracking

| Button | Status | Lines | Notes |
|--------|--------|-------|-------|
| Decarbonize | ✅ COMPLETE | [PC.js:1237-1386](../../src/core/ParallelCoordinates.js#L1237-L1386) | Fully tested, Pattern A compliant |
| Optimize | ✅ COMPLETE | [PC.js:1394-1562](../../src/core/ParallelCoordinates.js#L1394-L1562) | Ready to test - includes SHW fuel switching |
| Super Optimize | ✅ COMPLETE | [PC.js:1569-1746](../../src/core/ParallelCoordinates.js#L1569-L1746) | Ready to test - includes SHW fuel switching |
| PassivHaus-ify | ✅ COMPLETE (Phase 1) | [PC.js:1754-1889](../../src/core/ParallelCoordinates.js#L1754-L1889) | Phase 1 done (= Super Optimize), Phase 2 (PER targeting) TBD |

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| Nov 25, 2025 | 1.0 | Initial cheatsheet - 5 interactive axes, 4 financial formulas complete |
| Nov 26, 2025 | 1.1 | Added Capital Budget & Simple ROI implementation guide |
| Nov 26, 2025 | 1.2 | Added Decarbonize button logic specification |
| Nov 26, 2025 | 1.3 | Complete optimization button framework - updated Decarbonize to match implementation, added templates for Optimize/Super Optimize/PassivHaus-ify |
| Nov 26, 2025 | 1.4 | **ALL FOUR BUTTONS IMPLEMENTED** - Optimize, Super Optimize, PassivHaus-ify complete with critical SHW fuel-switching logic (Heatpump required for 300%/400%) |

---

**For detailed explanations, implementation history, and troubleshooting:** See [S18-OPTIMIZE.md](./S18-OPTIMIZE.md)
