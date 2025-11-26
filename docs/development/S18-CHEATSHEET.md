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

## Version History

| Date | Version | Changes |
|------|---------|---------|
| Nov 25, 2025 | 1.0 | Initial cheatsheet - 5 interactive axes, 4 financial formulas complete |

---

**For detailed explanations, implementation history, and troubleshooting:** See [S18-OPTIMIZE.md](./S18-OPTIMIZE.md)
