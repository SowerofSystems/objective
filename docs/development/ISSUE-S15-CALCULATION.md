# Issue: Section 15 TEUI Component Calculations Not Running

## Summary

Four out of six TEUI component fields (h_121, h_122, h_123, h_125) are returning `null` instead of calculated values, causing incorrect TEUI totals.

## Impact

**Severity**: High - Affects core TEUI calculation accuracy

**Observed**: TEUI shows 5,678,628 ekWh/m²/yr instead of expected 511.4 ekWh/m²/yr

**Affects**: All scenarios (import, manual entry, reset/undo)

## Symptoms

| Field | Component | Status | Value |
|-------|-----------|--------|-------|
| h_121 | Heating ekWh/yr | ❌ Broken | `null` |
| h_122 | Cooling ekWh/yr | ❌ Broken | `null` |
| h_123 | DHW ekWh/yr | ❌ Broken | `null` |
| h_124 | Ventilation ekWh/yr | ✅ Working | 36,856.77 |
| h_125 | Lighting ekWh/yr | ❌ Broken | `null` |
| h_126 | Plug Loads ekWh/yr | ✅ Working | 83.50 |

**Result**: Only 2 of 6 components are calculated, leading to wildly incorrect TEUI totals.

## How to Reproduce

1. Open https://objective.openbuilding.ca/
2. Import any Excel file OR enter values manually
3. Check Section 01 - TEUI Target value (f_32)
4. Open browser console
5. Run: `TEUI.StateManager.getValue('h_121')` → Returns `null`
6. Run: `TEUI.StateManager.getValue('h_122')` → Returns `null`
7. Run: `TEUI.StateManager.getValue('h_123')` → Returns `null`
8. Run: `TEUI.StateManager.getValue('h_125')` → Returns `null`

## Expected Behavior

All 6 TEUI component fields should contain calculated values:
- h_121 (Heating) should have heating energy total
- h_122 (Cooling) should have cooling energy total
- h_123 (DHW) should have domestic hot water energy total
- h_124 (Ventilation) should have ventilation energy total ✅ Works
- h_125 (Lighting) should have lighting energy total
- h_126 (Plug Loads) should have plug load energy total ✅ Works

These values should sum to create the final TEUI in f_32.

## Diagnostic Evidence

Comprehensive diagnostics were run using `RESET-DIAGNOSTIC-SCRIPT.js` across 3 stages:

```
=== DIAGNOSTIC 3: Check TEUI Calculation Fields ===
TEUI Field Values:
  h_15 (Conditioned Area (m²)): 11167 [imported]
  d_27 (Actual Elec Use (kWh)): 2000299 [imported]
  d_28 (Actual Gas Use (m³)): 355013 [imported]
  d_29 (Actual Propane Use (L)): 0 [imported]
  d_30 (Actual Oil Use (L)): 0 [imported]
  d_31 (Actual Wood Use (kg)): 0 [imported]
  d_44 (PV kWh/yr): 0 [imported]
  d_45 (Wind kWh/yr): 0 [imported]
  d_46 (Remove EV Charging kWh/yr): 0 [imported]
  h_121 (Heating ekWh/yr): null [unknown]        ← BROKEN
  h_122 (Cooling ekWh/yr): null [unknown]        ← BROKEN
  h_123 (DHW ekWh/yr): null [unknown]            ← BROKEN
  h_124 (Vent ekWh/yr): 36856.77 [calculated]    ← WORKS
  h_125 (Lighting ekWh/yr): null [unknown]       ← BROKEN
  h_126 (Plug ekWh/yr): 83.50 [calculated]       ← WORKS
  f_32 (TEUI Target (ekWh/m²/yr)): 5678628.43 [calculated]
  j_32 (TEUI Actual (ekWh/m²/yr)): 5710470.35 [calculated]

Manual TEUI Calculation:
  Total ekWh: 36940.27 (only h_124 + h_126)
  Area: 11167.00 m²
  Expected TEUI: 3.31 ekWh/m²/yr
  Actual f_32: 5678628.43315522
  ⚠️ MISMATCH! Expected 3.31 but got 5678628.43315522
```

Full diagnostic output available in: `docs/development/Logs.md`

## Investigation Questions

1. **Does Section15.js have calculation methods for h_121, h_122, h_123, h_125?**
   - Check if these fields are defined in Section15.js
   - Check if calculation functions exist

2. **Are these fields registered with StateManager?**
   - Run: `TEUI.StateManager.getDebugInfo('h_121')`
   - Check if fields exist in StateManager.fields

3. **Is Section15.calculate() being called by Calculator.calculateAll()?**
   - Add logging to Section15.js calculate method
   - Check if it's in the calculation sequence

4. **Are there dependency issues?**
   - Check if h_121-h_125 depend on fields that aren't available
   - Check calculation order in Calculator.js

5. **Why do h_124 and h_126 work but others don't?**
   - What's different about ventilation and plug loads?
   - Different calculation method or data source?

## Files to Investigate

- `src/sections/Section15.js` - TEUI component calculations
- `src/core/Calculator.js` - Calculation sequencing
- `src/core/StateManager.js` - Field registration

## Related Context

- Discovered during testing of PR #XX (3-tier reset system)
- The reset feature is working correctly - it just exposed this bug
- Bug exists in all scenarios, not just after reset/undo
- This is a pre-existing issue, not introduced by recent changes

## Workaround

None currently available - TEUI calculations are incorrect until this is fixed.

## Priority

**High** - Core functionality broken, affects all TEUI calculations

## Labels

- `bug`
- `high-priority`
- `calculation`
- `section-15`

## Acceptance Criteria

- [ ] All 6 TEUI component fields (h_121-h_126) return calculated values
- [ ] f_32 (TEUI Target) shows correct total (~511.4 in test case)
- [ ] j_32 (TEUI Actual) shows correct total
- [ ] Manual calculation matches StateManager values
- [ ] Verified across import, manual entry, and reset scenarios
