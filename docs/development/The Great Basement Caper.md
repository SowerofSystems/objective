# The Great Basement Caper 🕵️

**Date:** 2025-12-16
**Issue:** When basement wall area is added in S11, WOMBAT story heights get squashed to impossibly small values
**Status:** ✅ **SOLVED** - See [The Great Basement Caper - SOLVED.md](./The%20Great%20Basement%20Caper%20-%20SOLVED.md)

---

## ⚠️ INVESTIGATION SUPERSEDED

**This document contains the original investigation with INCORRECT assumptions.**

**For the correct solution, see:** [The Great Basement Caper - SOLVED.md](./The%20Great%20Basement%20Caper%20-%20SOLVED.md)

**TL;DR:** The roof volume calculation is CORRECT. The problem is we're NOT subtracting basement volume, so basement height gets divided across above-grade stories!

**The Fix:**
```javascript
// WRONG (current):
rectangularVolume = conditionedVolume - roofVolume  // Missing basement!

// CORRECT:
rectangularVolume = conditionedVolume - roofVolume - basementVolume  // Both!
```

---

## Original Investigation (Archived)

---

## The Mystery

We have a simple, logical requirement:
- **d_105 (Total Conditioned Volume)** includes ALL conditioned space: basement + above-grade walls + roof
- **d_150 (Stories)** refers ONLY to above-grade stories (basement is NOT a "story")
- **Story Height** should be calculated from above-grade wall height only, divided by number of stories

### The Math (That Makes Perfect Sense) //BUT WE DON'T KNOW BASEMENT DEPTH

```javascript
basementVolume = footprint × basementDepth
rectangularVolume = conditionedVolume - roofVolume - basementVolume
wallHeight = rectangularVolume / footprint
storyHeight = wallHeight / storiesDeclared
```
//but all we have is user declared total volume, slab area and basement wall area, we need to surmise basement wall height from footprint basement wall area... it may be easier to add a wall height parameter in S11!! IN FACT we should add LxWxH for each wall, then let area be calculated. This is the explicit geometric input we were trying to 'spare' the user from inputting. May need a complete architectural overhaul, to allow 20+ wall rows, 20+ roof rows, 20+ window rows (all by orientation) 

This logic is sound:
1. Calculate how much volume the basement takes up
2. Subtract it (along with roof volume) from total volume
3. What's left is the above-grade rectangular box volume
4. Divide by footprint to get wall height
5. Divide wall height by stories to get story height

---

## What We've Tried (And Failed)

### Attempt 1: Initial Implementation
- Added basement volume calculation
- Subtracted from total volume
- **Result:** Story heights became NEGATIVE (e.g., -0.16m)
- **Conclusion:** We subtracted too much

### Attempt 2: Adjusted Subtraction Order
- Tried different order: `conditionedVolume - roofVolume - basementVolume`
- **Result:** Story heights still squashed (e.g., 0.22m for 1.5 stories, 0.64m for 6 stories)
- **Conclusion:** Still subtracting too much somehow

### Attempt 3: Git Revert and Analyze
- Reverted to baseline (no basement volume subtraction)
- Without basement subtraction, story heights look reasonable
- **Observation:** Adding basement wall area in S11 causes immediate story height collapse

---

## The Paradox

Here's what doesn't make sense:

### Scenario: Building WITH Full Basement
**Given:**
- Total Conditioned Volume: 8000 m³
- Footprint: 1100 m² (example)
- Basement Wall Area: 365 m² (example from screenshot showing 3.2m depth)
- Basement Depth: ~3.2m (calculated from wall area ÷ perimeter)
- Stories: 1.5

**Expected Calculation:**
```
basementVolume = 1100 × 3.2 = 3520 m³
aboveGradeVolume = 8000 - 3520 = 4480 m³
(ignoring roof for simplicity)
wallHeight = 4480 / 1100 = 4.07m
storyHeight = 4.07 / 1.5 = 2.71m ✅ REASONABLE
```

**What Actually Happens:**
```
storyHeight = 0.22m ❌ IMPOSSIBLY SMALL
```

---

## Hypothesis: The Double-Counting Bug

### Theory 1: Basement Volume Already Excluded?
**Question:** Is `d_105` (Total Conditioned Volume) already calculated WITHOUT basement volume in S12?

**Evidence Needed:**
- Check S12 calculation for d_105
- Does it include basement walls (d_94) and slab (d_95)?
- Or does it only count above-grade volume?

**If TRUE:** Then we're DOUBLE-SUBTRACTING the basement volume
- S12 already excluded it from d_105
- S19 subtracts it again
- Result: We remove basement volume twice → story heights collapse

### Theory 2: Basement Depth Calculation Error
**Question:** Is `basementDepth = basementWallArea / perimeter` correct?

**Concerns:**
- Perimeter used is footprint perimeter (at grade level)
- If basement is smaller than footprint, this would be wrong
- But S11 doesn't specify basement footprint separately

**Check:** Look at S11 fields:
- `d_94`: Basement Wall Area
- `d_95`: Slab Area (footprint at grade)
- Does basement always have same footprint as grade?

### Theory 3: Volume Units Mismatch
**Question:** Are all volumes in the same units?

**Check:**
- d_105 is in m³ (confirmed)
- Footprint is in m² (confirmed)
- basementWallArea is in m² (confirmed)
- All math uses meters consistently

**Likelihood:** LOW (units appear consistent)

---

## Next Steps

### 1. Trace d_105 Calculation in S12
Look at Section12.js to see HOW d_105 (Total Conditioned Volume) is calculated:
- Does it sum all volumes including basement?
- Or is it entered by user independently?
- Is there a formula that might already exclude basement?

### 2. Add Diagnostic Logging
Before/after comparison with basement:
```javascript
console.log('[WOMBAT DEBUG] Volume breakdown:');
console.log('  d_105 (input): ', conditionedVolume);
console.log('  Basement volume: ', basementVolume);
console.log('  Roof volume: ', roofVolume);
console.log('  Remaining: ', conditionedVolume - basementVolume - roofVolume);
console.log('  Expected wall height: ', (conditionedVolume - basementVolume - roofVolume) / footprintArea);
```

### 3. Check S11 → S19 Data Flow
- What field does S19 read for basement wall area? (`d_94`)
- Is that field populated correctly from S11?
- Does basement depth calculation match S11's intent?

### 4. Test with Simple Numbers
Create a test case with round numbers:
- 1000 m² footprint
- 3000 m³ total volume
- 1000 m³ basement volume
- Expected: 2000 m³ above-grade → 2m wall height
- Actual: ???

---

## The Smoking Gun We're Looking For

One of these must be true:

1. ✅ **d_105 already excludes basement** (most likely!)
   - Fix: DON'T subtract basement volume in S19
   - But then: How do we get basement volume for visualization?

2. ⚠️ **Basement depth calculation is wrong**
   - Fix: Correct the formula for basementDepth
   - Question: What's the right formula?

3. 🤔 **There's a circular dependency**
   - S12 calculates d_105 based on S11 basement
   - S19 reads d_105 and tries to back-calculate basement
   - Result: Mathematical contradiction

4. 🐛 **The math is actually wrong**
   - Our formula has a logical error we haven't spotted
   - Need fresh eyes on the algebra

---

---

## 🔍 INVESTIGATION FINDINGS

### Discovery: d_105 is USER-ENTERED from BIM software

**Critical Finding:** In Section12.js line 932, d_105 is defined as `type: "editable"`, which means it's a user input field, NOT a calculated field.

**Important Context (from Andrew):**
- Users enter d_105 from their BIM software
- **d_105 INCLUDES basement volume** (it's "total one-zone conditioned volume of all stories AND conditioned basements")
- The value is generally correct (comes from professional BIM software)

**The REAL Problem:** Our math was actually CORRECT, but we have a different issue:
1. User enters d_105 = 8000 m³ (includes basement + above-grade)
2. User enters basement wall area in S11
3. S19 calculates basement volume from wall area
4. S19 subtracts basement volume: 8000 - basement = above-grade only ✅ CORRECT SO FAR
5. **BUT SOMETHING ELSE IS GOING WRONG** - story heights still collapse

### Actual Numbers from Screenshot Analysis

**From screenshot showing 0.22m story height:**
```
Stories: 1.5
Total Volume: 8000 m³
Footprint: 18.5m × 59.3m = 1097 m² (approximately)
Story Height: 0.22m ❌ IMPOSSIBLY SMALL
Basement depth shown: 3.2m
Ag: 1600.4 m²
```

**Let's trace the calculation:**
```javascript
// Phase 1: Basement volume
basementDepth = 3.2m (from screenshot)
footprintArea = 1097 m²
basementVolume = 1097 × 3.2 = 3510 m³

// Phase 2: Roof volume (gable shown in viz)
roofHeight = 7.4m (from "Gable: 7.4m" in screenshot)
roofVolume = (1097 × 7.4) / 2 = 4059 m³

// Phase 3: Above-grade rectangular volume
rectangularVolume = 8000 - 4059 - 3510 = 431 m³ ⚠️ VERY SMALL!

// Phase 4: Wall height
wallHeight = 431 / 1097 = 0.39m

// Phase 5: Story height
storyHeight = 0.39 / 1.5 = 0.26m ❌ MATCHES SCREENSHOT (~0.22m)
```

**THE SMOKING GUN:** The roof volume (4059 m³) is HUGE compared to the total volume (8000 m³)!

**Root Cause Found:** The roof area entered by user creates a MASSIVE roof volume that eats up more than half the total building volume. When we subtract both roof AND basement, there's almost nothing left for the above-grade walls.

### The Real Issue: Roof Volume is Too Large

From the screenshot:
- Roof Area: 1411.52 m²
- Footprint: ~1097 m²
- Ratio: 1411.52 / 1097 = **1.29** (roof is 29% larger than footprint)

This ratio drives a HUGE ridge height (7.4m shown), which creates enormous roof volume that consumes most of the building's volume budget.

**The Math Paradox:**
```
Total volume: 8000 m³
Basement takes: 3510 m³ (44%)
Roof takes: 4059 m³ (51%)
Walls get: 431 m³ (5%) ← NOT ENOUGH!
```

**The problem:** The user's inputs create an impossible geometry where the roof and basement consume 95% of the total volume, leaving only 5% for the actual above-grade conditioned space.

---

## 💡 THE SOLUTION

**NEW UNDERSTANDING:** The math for subtracting basement volume is CORRECT. The issue is that **conditioned roof volume should NOT be included in d_105** (BIM software doesn't count attic space as conditioned volume).

### The Conceptual Error

**What we thought d_105 contained:**
```
d_105 = basement volume + above-grade rectangular + roof volume
```

**What d_105 ACTUALLY contains (from BIM):**
```
d_105 = basement volume + above-grade rectangular ONLY
        (roof attic space is NOT conditioned, so NOT in d_105)
```

### Option A: DON'T SUBTRACT ROOF VOLUME (Correct Fix!)

The roof volume calculation is for VISUALIZATION only (to show the roof geometry). It should NOT be subtracted from the conditioned volume because:

1. **Conditioned space** = space with HVAC (basement + stories)
2. **Roof attic** = typically unconditioned space (NOT in d_105)
3. **Roof geometry** = needed for envelope area calculations, but not volume

**Fix:**
```javascript
// Calculate basement volume (below-grade conditioned space)
basementVolume = footprintArea × basementDepth

// Calculate ABOVE-GRADE rectangular volume ONLY
// DO NOT subtract roof volume - it's not part of conditioned volume!
rectangularVolume = conditionedVolume - basementVolume

// Wall height from rectangular volume
wallHeight = rectangularVolume / footprintArea
storyHeight = wallHeight / storiesDeclared

// Roof volume calculated separately for envelope area, NOT subtracted from d_105
roofVolume = (footprintArea × roofHeight) / 2  // For visualization only
```

**This makes sense because:**
- BIM software reports conditioned volume (heated/cooled space)
- Attic space under a pitched roof is typically NOT conditioned
- d_105 = basement + rectangular box of stories (flat ceiling)
- Roof is ABOVE the conditioned space, adds envelope area but not volume

### Option B: Make it User-Selectable

Add a checkbox: "Roof space is conditioned (cathedral ceiling)"
- If checked: subtract roof volume from d_105
- If unchecked: don't subtract roof volume (default)

This handles both cases:
- **Flat ceiling + attic** (most common): Don't subtract roof volume
- **Cathedral ceiling** (rare): Subtract roof volume

### Option C: Detect from Ceiling Type

If we have ceiling data, use it to determine:
- Flat ceiling → attic → don't subtract roof volume
- Cathedral ceiling → conditioned roof → subtract roof volume

---

## Current State

**Code Status:** Reverted to baseline (no basement volume subtraction, NO roof volume subtraction)
**Story Heights:** Correct when no basement present
**Story Heights:** Collapse when basement added
**Root Cause:** We're subtracting roof volume from d_105, but d_105 doesn't include roof volume (only conditioned space)
**Recommended Fix:** Option A - Don't subtract roof volume from d_105 (only subtract basement)
**Key Insight:** Roof volume is for visualization and envelope area only, NOT part of conditioned volume calculation

## Recommended Implementation

```javascript
// Phase 1: Calculate basement volume
basementVolume = hasBasement ? (footprintArea × basementDepth) : 0

// Phase 2: Calculate above-grade rectangular volume
// d_105 = basement + above-grade rectangular (NO ROOF VOLUME)
rectangularVolume = conditionedVolume - basementVolume

// Phase 3: Calculate wall height
wallHeight = rectangularVolume / footprintArea
storyHeight = wallHeight / storiesDeclared

// Phase 4: Calculate roof volume separately (for viz and envelope only)
roofVolume = (footprintArea × roofHeight) / 2  // NOT subtracted from d_105!
```

---

## 🧪 ATTEMPTED FIX (2025-12-16)

### What We Tried

Implemented the "don't subtract roof volume" fix in Section19.js:

```javascript
if (conditionedVolume > 0) {
  // Read basement data early to calculate basement volume
  const slabArea_temp = parseFloat(getModeAwareValue("d_95", isReferenceCalculation)) || 0;
  const basementWallArea_temp = parseFloat(getModeAwareValue("d_94", isReferenceCalculation)) || 0;
  const hasBasement_temp = basementWallArea_temp > 0;
  const basementDepth_temp = hasBasement_temp ? basementWallArea_temp / perimeter : 0;

  // Calculate basement volume (conditioned space below grade)
  let basementVolume = 0;
  if (hasBasement_temp && basementDepth_temp > 0) {
    basementVolume = footprintArea * basementDepth_temp;
  }

  // CRITICAL: d_105 includes ALL conditioned volume (basement + above-grade + roof space if cathedral ceiling)
  // We ONLY subtract basement to get above-grade volume
  // We do NOT subtract roof volume - it's already part of d_105 from BIM software
  const rectangularVolume = conditionedVolume - basementVolume;
  wallHeightFromVolume = rectangularVolume / footprintArea;

  console.log(`[WOMBAT] Volume-constrained wall height:`);
  console.log(`  Total conditioned volume (d_105): ${conditionedVolume.toFixed(2)} m³`);
  console.log(`  Basement volume: ${basementVolume.toFixed(2)} m³`);
  console.log(`  Above-grade volume: ${rectangularVolume.toFixed(2)} m³`);
  console.log(`  Wall height from volume: ${wallHeightFromVolume.toFixed(3)} m`);

  wallHeight = wallHeightFromVolume;
}
```

### Result: FAILED ❌

**New Bug Discovered:** "Basement getting bigger and bigger with subsequent refreshes"

**Symptoms:**
- Basement geometry appears to grow on each refresh/recalculation
- Suggests a circular dependency or state accumulation bug
- Code reverted to stable baseline (git checkout HEAD)

**Hypothesis:**
The basement data is being read multiple times in the calculation cycle, potentially:
1. Reading basement wall area from S11
2. Calculating basement volume
3. Somehow writing back to basement wall area (?)
4. Next cycle reads larger value
5. Cycle repeats, basement grows

**Additional Issues:**
- The `_temp` variable suffix pattern creates duplicate variable declarations
- Basement data is read twice: once early for volume calc, once later for visualization
- Potential race condition or state update loop

### Status: REVERTED

Code reverted to last stable commit. Need to:
1. Investigate the circular dependency causing basement growth
2. Review state update flow in Section19.js
3. Check if basement wall area (d_94) is being modified during calculations
4. Ensure basement data is read once and reused, not recalculated

**Next Steps:**
- Read through this document completely
- Determine approach that avoids circular state updates
- Consider single-read pattern for basement data
- Add safeguards against accumulation bugs

---

## Commit Message (Per .clinerules)

```bash
git commit -m "$(cat <<'EOF'
Feat: Add basement volume handling to WOMBAT story height calculation

Attempted to fix story height collapse when basement present by:
- Reading basement wall area early in volume calculation
- Subtracting basement volume from d_105 to get above-grade volume
- NOT subtracting roof volume (already in d_105 from BIM)

REVERTED: Caused "basement getting bigger" bug on refresh
- Suggests circular dependency or state accumulation issue
- Basement geometry grows with each recalculation cycle
- Need to investigate state update flow before re-implementing

See docs/development/The Great Basement Caper.md for full analysis

🤖 Co-Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Andy & Claude <andy@openbuilding.ca>
EOF
)"
```

(Note: This commit was NOT actually made - code was reverted before commit)
