# S07 Efficiency Consolidation - Test Results

**Date**: 2025-11-30
**Branch**: S07-TWEAK
**Commit**: Testing phase for k_52 → d_52 consolidation

---

## Test Scenario 1: Gas System with 90% Efficiency

**Steps**:
1. Open index.html in browser
2. Navigate to Section 07 (Water Use)
3. Set d_51 dropdown to "Gas"
4. Set d_52 slider to 90%
5. Verify calculations

**Expected Results**:
- ✅ d_52 slider range: 50-98% (step 1)
- ✅ d_52 display shows "90%"
- ✅ e_52 calculated value: 0.90 (90/100)
- ✅ j_51 (Net Thermal Demand) uses e_52 for calculation
- ✅ e_51 (Gas Volume) calculated correctly using e_52
- ✅ k_54 (Oil Volume) = 0.00 (cleared)
- ✅ No console errors

**Actual Results**:
- [ ] TO BE TESTED

---

## Test Scenario 2: Switch Gas → Heatpump (Preserve COP)

**Steps**:
1. Start with Gas system at d_52=85%
2. Switch d_51 dropdown to "Heatpump"
3. Verify slider updates and preserves value if valid

**Expected Results**:
- ✅ d_52 slider range changes to: 100-600% (step 10)
- ✅ d_52 value preserved if valid for Heatpump (85% invalid, should reset to 300%)
- ✅ e_52 recalculated: 3.00 (300/100)
- ✅ Calculations update using new e_52
- ✅ e_51 (Gas Volume) = 0.00 (cleared)
- ✅ No console errors

**Actual Results**:
- [ ] TO BE TESTED

---

## Test Scenario 3: Oil System with 85% Efficiency

**Steps**:
1. Set d_51 dropdown to "Oil"
2. Set d_52 slider to 85%
3. Verify calculations

**Expected Results**:
- ✅ d_52 slider range: 50-98% (step 1)
- ✅ d_52 display shows "85%"
- ✅ e_52 calculated value: 0.85 (85/100)
- ✅ k_54 (Oil Volume) calculated correctly using e_52
- ✅ e_51 (Gas Volume) = 0.00 (cleared)
- ✅ No console errors

**Actual Results**:
- [ ] TO BE TESTED

---

## Test Scenario 4: Electric System with 100% Efficiency

**Steps**:
1. Set d_51 dropdown to "Electric"
2. Verify d_52 slider constraints
3. Set d_52 to 100%

**Expected Results**:
- ✅ d_52 slider range: 90-100% (step 1)
- ✅ d_52 display shows "100%"
- ✅ e_52 calculated value: 1.00 (100/100)
- ✅ e_51 (Gas Volume) = 0.00
- ✅ k_54 (Oil Volume) = 0.00
- ✅ j_54 (Exhaust Losses) = 0.00
- ✅ No console errors

**Actual Results**:
- [ ] TO BE TESTED

---

## Test Scenario 5: Heatpump with COP 300%

**Steps**:
1. Set d_51 dropdown to "Heatpump"
2. Set d_52 slider to 300%
3. Verify calculations

**Expected Results**:
- ✅ d_52 slider range: 100-600% (step 10)
- ✅ d_52 display shows "300%"
- ✅ e_52 calculated value: 3.00 (300/100)
- ✅ j_51 (Net Thermal Demand) = j_50 / 3.00
- ✅ k_51 (Electrical Energy) = j_52 (Net Demand After Recovery)
- ✅ No console errors

**Actual Results**:
- [ ] TO BE TESTED

---

## Test Scenario 6: Reference Mode Isolation Test

**Steps**:
1. Set Target mode: Gas system, d_52=80%
2. Toggle to Reference mode
3. Verify Reference defaults (Electric, 90%)
4. Change Reference d_52 to 95%
5. Toggle back to Target mode
6. Verify Target still shows Gas, d_52=80%

**Expected Results**:
- ✅ Target state: d_51=Gas, d_52=80%
- ✅ Reference state: d_51=Electric, d_52=90% (default)
- ✅ Reference state changes persist independently
- ✅ Target state unchanged after Reference modifications
- ✅ No state contamination between modes
- ✅ Console shows correct ref_ prefix publications

**Actual Results**:
- [ ] TO BE TESTED

---

## Test Scenario 7: Edge Cases - Gas Slider Limits

**Steps**:
1. Set d_51 to "Gas"
2. Test d_52 slider at minimum (50%)
3. Test d_52 slider at maximum (98%)
4. Try to manually enter invalid values (if possible)

**Expected Results**:
- ✅ d_52=50%: Calculations work correctly, no errors
- ✅ d_52=98%: Calculations work correctly, no errors
- ✅ Slider prevents values < 50% or > 98%
- ✅ Console warning if invalid value attempted
- ✅ No crashes or NaN values

**Actual Results**:
- [ ] TO BE TESTED

---

## Test Scenario 8: Excel Formula Parity Verification

**Steps**:
1. Review calculation functions in Section07.js
2. Compare with FORMULAE-3039.csv (Excel source)
3. Verify key formulas:
   - e_52 = d_52 / 100
   - j_51 = j_50 / e_52
   - e_51 (Gas) = j_52 / (0.0373 × 277.7778 × e_52)
   - k_54 (Oil) = j_52 / (10.18 × e_52)
   - j_54 (Exhaust) = j_52 × (1 - e_52)

**Expected Results**:
- ✅ All formulas match Excel exactly
- ✅ No k_52 references remain
- ✅ All calculations use e_52 uniformly

**Actual Results**:
- [ ] TO BE TESTED

---

## Console Error Check

**Steps**:
1. Open browser DevTools Console
2. Reload page
3. Perform all test scenarios
4. Monitor for errors/warnings

**Expected Results**:
- ✅ No errors on page load
- ✅ No errors during system type changes
- ✅ No errors during slider adjustments
- ✅ No errors during Reference mode toggle
- ✅ Only expected console.log statements visible

**Actual Results**:
- [ ] TO BE TESTED

---

## Files Modified Verification

**Expected Files Changed** (8 files):
1. ✅ src/sections/Section07.js (~1848 lines)
2. ✅ src/utils/pcConfig.js (exportFields)
3. ✅ src/utils/ExcelMapper.js (legacy k_52 → d_52 conversion)
4. ✅ src/utils/FileHandler.js (CSV export)
5. ✅ src/utils/QCMonitor.js (validation rules)
6. ✅ src/utils/TooltipManager.js (tooltip references)
7. ✅ docs/development/S07-EFFICIENCY-CONSOLIDATION.md (workplan)
8. ✅ docs/development/S13-EFFICIENCY-CONSOLIDATION.md (updated reference)

**Verify**:
```bash
git status
git diff src/sections/Section07.js | grep -E "^\+|^\-" | head -50
```

---

## Commit Readiness Checklist

Before committing, verify:
- [ ] All 8 test scenarios PASS
- [ ] No console errors
- [ ] Excel formula parity confirmed
- [ ] Dual-state isolation working
- [ ] Backup file created: `src/sections/Section07.js.backup-20251129-192705`
- [ ] Git status clean (only intended files modified)
- [ ] Documentation updated (workplan completed)

---

## Final Test Result: ❓ PENDING

**Overall Status**: 🔄 Testing in progress

**Next Steps**:
1. Execute all 8 test scenarios manually in browser
2. Mark each scenario PASS/FAIL
3. Fix any issues discovered
4. Create final commit with full message

---

**Tester Notes**:
(Add observations, edge cases, or issues discovered during testing)

