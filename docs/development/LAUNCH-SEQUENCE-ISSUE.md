# Launch Sequence Issue - Missing S18 Axes (Ae/Ag)

**Issue**: When auto-activating Section 18 (Optimize) on page load, two axes don't render: Ae (g_101) and Ag (g_102).

**Root Cause**: Timing issue - S18 graph activates (800ms delay) before Section 12 completes calculating the U-value aggregations for g_101 and g_102.

---

## Technical Analysis

### Field Dependencies
- **Ae (g_101)**: Aggregate U-value for elements facing air - calculated in Section 12
- **Ag (g_102)**: Aggregate U-value for elements facing ground - calculated in Section 12

Both are **calculated fields** that depend on:
- Section 11 envelope component U-values (g_85-g_95)
- Section 11 component areas (d_85-d_95)
- Thermal bridging penalty (d_97)

### Current Timing
1. Page loads (0ms)
2. Disclaimer modal appears
3. DOM initializes sections
4. Calculator.calculateAll() runs (starts at ~300ms per index.html:1318)
5. **S18 auto-activates (800ms)** ← TOO EARLY
6. Section 12 finishes calculating g_101/g_102 (~1000-1500ms)

Result: pcConfig.js reads undefined/null values for g_101 and g_102, axes are skipped.

---

## Solutions

### Option 1: Increase S18 Activation Delay (Quick Fix)
**Change**: Increase delay from 800ms to 1800ms

**File**: [src/core/ParallelCoordinates.js:716](src/core/ParallelCoordinates.js#L716)

```javascript
}, 1800); // Was 800ms - increased to allow S12 calculations to complete
```

**Pros**:
- Simple one-line change
- Keeps S18 as showcase section
- Ensures all axes have data

**Cons**:
- Longer wait for first-time users
- Still a race condition (may fail on slow devices)

---

### Option 2: Switch to Section 16 (Sankey Diagram)
**Change**: Use S16 instead of S18 as default active tab

**File**: [src/core/init.js:227-237](src/core/init.js#L227-L237)

```javascript
// Activate Section 16 (Sankey) by default to showcase visual features
const s16Tab = tabContainer.querySelector('[data-section-id="sankeyDiagram"]');
if (s16Tab) {
  activateTab("sankeyDiagram");
} else {
  // Fallback to first tab if S16 doesn't exist (shouldn't happen)
  const firstTab = tabContainer.querySelector(".tab");
  if (firstTab) {
    const sectionId = firstTab.getAttribute("data-section-id");
    activateTab(sectionId);
  }
}
```

**Also add auto-activation for S16**:
```javascript
// In Section16.js or similar location - auto-activate Sankey on first load
if (!localStorage.getItem("s16_ever_activated")) {
  setTimeout(() => {
    if (window.TEUI?.sect16?.activateSankey) {
      console.log("[Section16] First-time activation - showcasing Sankey");
      window.TEUI.sect16.activateSankey();
      localStorage.setItem("s16_ever_activated", "true");
    }
  }, 1800); // Same timing concern
}
```

**Pros**:
- Energy flow Sankey is also visually impressive
- Less dependent on complex calculations
- More stable rendering

**Cons**:
- Still requires activation button click
- Same timing issues may apply
- Parallel coordinates is more interactive

---

### Option 3: Switch to Section 14 or 15 (TEDI/TEUI Summary) - **RECOMMENDED**
**Change**: Use S14 (TEDI) or S15 (TEUI) as default - no activation needed

**File**: [src/core/init.js:227-237](src/core/init.js#L227-L237)

```javascript
// Activate Section 14 (TEDI) by default to showcase results immediately
const s14Tab = tabContainer.querySelector('[data-section-id="tediSummary"]');
if (s14Tab) {
  activateTab("tediSummary");
} else {
  // Fallback
  const firstTab = tabContainer.querySelector(".tab");
  if (firstTab) {
    const sectionId = firstTab.getAttribute("data-section-id");
    activateTab(sectionId);
  }
}
```

**Pros**:
- **No activation required** - content visible immediately
- Shows calculated results (TEDI/TEUI values, charts)
- No timing issues - calculated values render when ready
- Still visually rich (charts, summary tables)
- Key metrics users care about

**Cons**:
- Less "wow factor" than interactive graphs
- Not as unique as parallel coordinates

---

### Option 4: Add Calculation Completion Event (Proper Fix - More Work)
**Change**: Don't auto-activate S18 until Calculator signals completion

**Implementation**:
1. Add event to Calculator.js when calculations finish:
   ```javascript
   // In Calculator.js calculateAll()
   window.dispatchEvent(new CustomEvent('TEUI:calculations-complete'));
   ```

2. Listen for event in ParallelCoordinates.js:
   ```javascript
   if (!localStorage.getItem("s18_ever_activated")) {
     window.addEventListener('TEUI:calculations-complete', () => {
       setTimeout(() => {
         window.TEUI.ParallelCoordinates.activate();
         localStorage.setItem("s18_ever_activated", "true");
       }, 200); // Small delay for DOM updates
     }, { once: true }); // Only listen once
   }
   ```

**Pros**:
- Robust - no race conditions
- Activates as soon as data is ready
- Proper event-driven architecture

**Cons**:
- More code changes
- Requires testing calculation completion detection
- Slightly more complex

---

## Recommendation

**For immediate testing**: Use **Option 3** (S14 or S15 default tab)
- No activation needed
- No timing issues
- Still showcases the tool's capabilities
- Users can explore S18 when they're ready

**For production**: Implement **Option 4** (event-driven activation)
- Proper fix for the root cause
- Future-proof
- Better user experience (activates ASAP without arbitrary delays)

---

## Quick Fix Command

To test Option 3 (TEDI as default):
```bash
# Edit init.js line 227-229 to activate tediSummary instead of parallelCoordinates
# Remove S18 auto-activation from ParallelCoordinates.js lines 708-731
```

To test Option 1 (longer delay):
```bash
# Edit ParallelCoordinates.js line 716: change 800 to 1800
# Edit ParallelCoordinates.js line 730: change 800 to 1800
```

---

**Last Updated**: 2025-12-01
**Related Files**:
- [src/core/init.js:227-237](src/core/init.js#L227-L237)
- [src/core/ParallelCoordinates.js:708-731](src/core/ParallelCoordinates.js#L708-L731)
- [src/core/pcConfig.js:97-120](src/core/pcConfig.js#L97-L120) (Ae/Ag axis definitions)
- [src/sections/Section12.js:1737-1738](src/sections/Section12.js#L1737-L1738) (g_101/g_102 calculation)
