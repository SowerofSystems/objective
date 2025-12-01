# Launch Sequence Improvements - First Impression UX

**Goal**: Open directly to Section 18 (Optimize) with the graph activated, showcasing the tool's graphically rich UI and optimization features on first load.

---

## Current Launch Behavior

1. ✅ Disclaimer modal appears (good - keep this)
2. ❌ Navigation defaults to **Vertical Layout** (lists all sections)
3. ❌ First visible content is **Section 1 (Key Values)** with default data
4. ❌ User must manually:
   - Click layout toggle to switch to Tabbed (Horizontal) mode
   - Navigate to Section 18 tab
   - Click "Activate Optimization View" button

**Result**: Users don't immediately see the tool's visual strengths.

---

## Proposed Launch Behavior

1. ✅ Disclaimer modal appears (unchanged)
2. ✅ Navigation defaults to **Horizontal (Tabbed) Layout**
3. ✅ **Section 18 (Optimize)** tab is pre-selected and active
4. ✅ Parallel Coordinates graph is **automatically activated** on first load
5. ✅ Key Values section remains visible (sticky at top)

**Result**: Users see graphically rich optimization interface immediately, with Key Values context available.

---

## Implementation Steps

### 1. Change Default Layout Mode
**File**: [src/core/init.js:126](src/core/init.js#L126)

**Current**:
```javascript
let isVerticalLayout = true;
```

**Change to**:
```javascript
let isVerticalLayout = false; // Default to horizontal (tabbed) for better first impression
```

**Also update**:
- Line 130: Remove `body.classList.add("vertical-layout");`
- Line 130: Add `body.classList.add("horizontal-layout");`
- Line 409: Add `initializeTabs();` call during initial setup
- Line 464: Update button icon to match horizontal mode

---

### 2. Set Default Active Tab to S18
**File**: [src/core/init.js:226-231](src/core/init.js#L226-L231)

**Current**:
```javascript
// Activate first tab by default (for horizontal layout)
const firstTab = tabContainer.querySelector(".tab");
if (firstTab) {
  const sectionId = firstTab.getAttribute("data-section-id");
  activateTab(sectionId);
}
```

**Change to**:
```javascript
// Activate Section 18 (Optimize) by default to showcase visual features
const s18Tab = tabContainer.querySelector('[data-section-id="parallelCoordinates"]');
if (s18Tab) {
  activateTab("parallelCoordinates");
} else {
  // Fallback to first tab if S18 doesn't exist (shouldn't happen)
  const firstTab = tabContainer.querySelector(".tab");
  if (firstTab) {
    const sectionId = firstTab.getAttribute("data-section-id");
    activateTab(sectionId);
  }
}
```

---

### 3. Auto-Activate S18 Graph on First Load
**File**: [src/core/ParallelCoordinates.js:167-181](src/core/ParallelCoordinates.js#L167-L181)

**Current**: `activateVisualization()` only fires on button click

**Options**:

#### Option A: Auto-activate on first page load only (Recommended)
```javascript
// In ParallelCoordinates.js initialization (after DOMContentLoaded)
document.addEventListener("DOMContentLoaded", function () {
  // ... existing initialization ...

  // Auto-activate on first load if not seen before
  if (!localStorage.getItem("s18_ever_activated")) {
    setTimeout(() => {
      if (window.TEUI?.ParallelCoordinates?.activate) {
        window.TEUI.ParallelCoordinates.activate();
        localStorage.setItem("s18_ever_activated", "true");
      }
    }, 500); // Delay to ensure tab is active and visible
  }
});
```

#### Option B: Always auto-activate when S18 tab becomes active
```javascript
// In init.js activateTab() function
function activateTab(sectionId) {
  // ... existing code ...

  // If activating S18 and graph not yet activated, auto-activate
  if (sectionId === "parallelCoordinates" &&
      window.TEUI?.ParallelCoordinates?.isActivated &&
      !window.TEUI.ParallelCoordinates.isActivated()) {
    setTimeout(() => {
      window.TEUI.ParallelCoordinates.activate();
    }, 300);
  }
}
```

**Recommendation**: Use **Option A** (localStorage flag) to avoid re-activating every time user switches tabs.

---

### 4. Update User Preferences Restoration Logic
**File**: [src/core/init.js:456-479](src/core/init.js#L456-L479)

**Current**: Restores saved layout preference from localStorage

**Update**: Only restore user preference if it exists; otherwise default to horizontal + S18

```javascript
function restoreUserPreferences() {
  const savedLayout = localStorage.getItem("layoutMode");

  // If user has a saved preference, respect it
  if (savedLayout === "vertical") {
    isVerticalLayout = true;
    body.classList.add("vertical-layout");
    body.classList.remove("horizontal-layout");
    layoutToggleButton.innerHTML = '<i class="bi bi-arrow-right-circle"></i>';
    restoreCollapsedState();
  }
  // Default to horizontal layout for first-time users
  else {
    isVerticalLayout = false;
    body.classList.add("horizontal-layout");
    body.classList.remove("vertical-layout");
    layoutToggleButton.innerHTML = '<i class="bi bi-arrow-down-circle"></i>';
    initializeTabs();

    // Activate S18 if no saved active section
    const savedActiveSection = localStorage.getItem("activeSection");
    if (savedActiveSection) {
      activateTab(savedActiveSection);
    } else {
      // First-time user - activate S18 to showcase features
      activateTab("parallelCoordinates");
    }

    updateStickyElementHeights();
  }

  updateExpandCollapseButtonState();
}
```

---

## Testing Checklist

- [ ] Clear localStorage and refresh → Should see horizontal layout + S18 active + graph activated
- [ ] Disclaimer modal still appears first
- [ ] Key Values section stays visible at top
- [ ] Graph activates automatically after ~500ms delay
- [ ] localStorage flag prevents re-activation on subsequent loads
- [ ] User can still toggle to vertical layout (preference saved)
- [ ] Switching back to horizontal respects last active tab (if not first load)
- [ ] Mobile/tablet responsive behavior still works

---

## Benefits

1. **Immediate Visual Impact**: Users see the tool's best feature first
2. **Reduced Clicks**: 3 fewer clicks to see optimization graph (layout toggle, S18 tab, activate button)
3. **Better Onboarding**: First-time users understand the tool's capabilities immediately
4. **Preserved Flexibility**: Advanced users can still switch to vertical layout and navigate as needed
5. **Smart Defaults**: Only auto-activates once (localStorage flag prevents annoying re-renders)

---

**Last Updated**: 2025-12-01
**Branch**: M-N-COMPLIANCE
**Related Files**:
- [src/core/init.js](src/core/init.js)
- [src/core/ParallelCoordinates.js](src/core/ParallelCoordinates.js)
- [index.html](index.html) (lines 683-692 - disclaimer modal logic)
