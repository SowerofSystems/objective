# Condensation Risk Feature - Implementation Workplan

**Status**: Draft Workplan
**Date**: 2025-12-07
**Feature**: Surface condensation risk detection and warning system

---

## Overview

This feature calculates interior surface temperatures for building envelope assemblies and warns users when condensation risk exists. The implementation follows the dual-state architecture with calculations in Section03 (Climate) and visual indicators in Section11 (Transmission Losses).

### User Value
- **Early warning**: Identifies condensation-prone assemblies during design phase
- **Visual feedback**: Water droplet icon (💧) in U-value column when risk detected
- **Climate-aware**: Uses winter seasonal average temperature instead of peak cold for realistic assessment
- **Mode-aware**: Works correctly in both Target and Reference models

---

## Part 1: Section03 Climate Calculations

### 1.1 Add Row 25 to Field Definitions

**Location**: `src/sections/Section03.js` - `sectionRows` object (around line 678)

**Action**: Add new row definition after row 24:

```javascript
// Row 25: Winter Average Temperature (for condensation calculations)
25: {
  id: "L.3.3",
  rowId: "L.3.3",
  label: "Winter Average Temp. (Location Specific)",
  cells: {
    c: {
      content: "Winter Average Temp. (Location Specific)",
      type: "label"
    },
    d: {
      fieldId: "d_25",
      type: "calculated",
      value: "0",
      section: "climateCalculations",
      dependencies: ["d_20", "m_19"],  // HDD and Cooling Days
      label: "Winter Average Temperature ºC"
    },
    e: {
      fieldId: "e_25",
      type: "calculated",
      value: "32",
      section: "climateCalculations",
      dependencies: ["d_25"],
      label: "Winter Average Temperature ºF"
    },
    f: { content: "", classes: ["label-prefix"] },
    g: { content: "", classes: ["label-main"] },
    h: { content: "", classes: [] },
    i: { content: "", classes: [] },
    j: { content: "", classes: [] },
    k: { content: "", classes: [] },
    l: { content: "", classes: [] },
    m: { content: "", classes: [] },
    n: { content: "", classes: [] }
  }
}
```

**Notes**:
- `b_25`: Row ID is "L.3.3" (Location category)
- `c_25`: Label describes the calculated value
- `d_25`: Celsius value (calculated from HDD and cooling days)
- `e_25`: Fahrenheit conversion (calculated from d_25)
- Remaining cells (f-n) are empty placeholders for table alignment

---

### 1.2 Calculation Functions

**Location**: `src/sections/Section03.js` - Add after `calculateGroundFacing()` (around line 2287)

#### Function 1: Calculate Winter Average Temperature (d_25)

```javascript
/**
 * Calculate Winter Average Temperature (d_25) - For condensation risk assessment
 * Excel Formula: =18 - (D20 / (365 - M19))
 * Where:
 *   - 18°C is the HDD base temperature
 *   - D20 is HDD18 (Heating Degree Days)
 *   - M19 is Cooling Days
 *   - (365 - M19) is the heating season length in days
 */
function calculateWinterAverageTemperature() {
  const hdd18 = getNumericValue("d_20");         // HDD from climate data
  const coolingDays = getNumericValue("m_19");   // User-set cooling days

  // Calculate heating season days
  const heatingDays = 365 - coolingDays;

  // Prevent division by zero
  if (heatingDays <= 0) {
    console.warn("[S03] Invalid heating days calculation - defaulting to 0°C");
    setFieldValue("d_25", 0);
    setFieldValue("e_25", 32);  // 0°C = 32°F
    return 0;
  }

  // Calculate winter average: base temp - (HDD / heating days)
  const winterAvgC = 18 - (hdd18 / heatingDays);

  // Round to 2 decimal places for storage
  const winterAvgC_rounded = Math.round(winterAvgC * 100) / 100;

  // Store Celsius value
  setFieldValue("d_25", winterAvgC_rounded);

  // Calculate and store Fahrenheit conversion
  const winterAvgF = Math.round((winterAvgC_rounded * 9 / 5) + 32);
  setFieldValue("e_25", winterAvgF);

  return winterAvgC_rounded;
}
```

**Key Points**:
- Uses HDD base of 18°C (Canadian standard)
- Calculates actual heating season length from user's cooling days setting
- Provides more realistic condensation risk than peak cold temperature
- Returns rounded value for consistency

---

### 1.3 Integration into Calculation Engines

**Location**: `src/sections/Section03.js`

#### Update `calculateTargetModel()` (around line 1824)

Add call after `calculateGroundFacing()`:

```javascript
function calculateTargetModel() {
  // ... existing code ...

  calculateTemperatures();
  calculateGroundFacing();

  // ✅ NEW: Calculate winter average temperature for condensation risk
  calculateWinterAverageTemperature();

  updateCoolingDependents();
  updateCriticalOccupancyFlag();

  // ... rest of function ...
}
```

#### Update `calculateReferenceModel()` (around line 1901)

Add call after `calculateGroundFacing()`:

```javascript
function calculateReferenceModel() {
  // ... existing code ...

  calculateTemperatures();
  calculateGroundFacing();

  // ✅ NEW: Calculate winter average temperature for condensation risk
  calculateWinterAverageTemperature();

  updateCoolingDependents();

  // ... rest of function ...
}
```

---

### 1.4 Publish to StateManager

**Location**: `src/sections/Section03.js`

#### Update `storeTargetResults()` (around line 2005)

Add d_25 and e_25 to published results:

```javascript
function storeTargetResults() {
  if (!window.TEUI?.StateManager) return;

  const targetResults = {
    h_23: TargetState.getValue("h_23"),
    h_24: TargetState.getValue("h_24"),
    d_22: TargetState.getValue("d_22"),
    h_22: TargetState.getValue("h_22"),

    // ✅ NEW: Winter average temperature for condensation calculations
    d_25: TargetState.getValue("d_25"),  // Winter avg °C
    e_25: TargetState.getValue("e_25"),  // Winter avg °F
  };

  // Store unprefixed for downstream sections (Target mode)
  Object.entries(targetResults).forEach(([fieldId, value]) => {
    if (value !== null && value !== undefined) {
      window.TEUI.StateManager.setValue(fieldId, String(value), "calculated");
    }
  });
}
```

#### Update `storeReferenceResults()` (around line 1962)

Add d_25 and e_25 to published results:

```javascript
function storeReferenceResults() {
  if (!window.TEUI?.StateManager) return;

  const referenceResults = {
    d_20: ReferenceState.getValue("d_20"),
    d_21: ReferenceState.getValue("d_21"),
    j_19: ReferenceState.getValue("j_19"),
    d_23: ReferenceState.getValue("d_23"),
    d_24: ReferenceState.getValue("d_24"),
    l_22: ReferenceState.getValue("l_22"),
    h_23: ReferenceState.getValue("h_23"),
    h_24: ReferenceState.getValue("h_24"),
    d_22: ReferenceState.getValue("d_22"),
    h_22: ReferenceState.getValue("h_22"),

    // ✅ NEW: Winter average temperature for condensation calculations
    d_25: ReferenceState.getValue("d_25"),  // Winter avg °C
    e_25: ReferenceState.getValue("e_25"),  // Winter avg °F
  };

  // Store with ref_ prefix for downstream sections
  Object.entries(referenceResults).forEach(([fieldId, value]) => {
    if (value !== null && value !== undefined) {
      window.TEUI.StateManager.setValue(
        `ref_${fieldId}`,
        String(value),
        "calculated"
      );
    }
  });
}
```

---

### 1.5 Update Display Values Function

**Location**: `src/sections/Section03.js` - `updateCalculatedDisplayValues()` (around line 341)

Add d_25 and e_25 to the calculated fields array:

```javascript
updateCalculatedDisplayValues: function() {
  const calculatedFields = [
    "j_19",
    "d_20", "d_21", "d_22",
    "h_22",
    "d_23", "e_23",
    "h_23", "i_23",
    "m_23", "n_23",
    "d_24", "e_24",
    "h_24", "i_24",
    "m_24", "n_24",

    // ✅ NEW: Winter average temperature fields
    "d_25", "e_25"
  ];

  calculatedFields.forEach(fieldId => {
    // ... existing display logic ...
  });
}
```

---

## Part 2: Section11 Condensation Risk Indicators

**Status**: Ready for implementation

### 2.1 Overview

Section11 calculates interior surface temperatures for each envelope assembly (rows 85-95) and displays a water droplet icon (💧) in Column G (U-value) when condensation risk is detected (surface temperature < 15°C).

**Key Design Decisions**:
- Surface temperatures calculated but **not displayed** (hidden Column O in Excel)
- Values stored in StateManager for future use (can expose Column O later if desired)
- Visual indicator only: water droplet in Column G when o_[row] < 15°C
- Uses winter average temperature (d_25) for realistic seasonal assessment
- Mode-aware: works correctly in both Target and Reference models

---

### 2.2 Add Hidden Field Definitions (Column O)

**Location**: `src/sections/Section11.js` - Update each row's cell definitions (rows 85-95)

Add Column O field to each assembly row (not rendered in DOM by default):

```javascript
// Example: Row 85 (Roof)
85: {
  id: "B.4",
  rowId: "B.4",
  label: "Roof",
  cells: {
    // ... existing cells c through n ...

    // ✅ NEW: Hidden surface temperature field (Column O)
    o: {
      fieldId: "o_85",
      type: "calculated",
      value: "0.00",
      dependencies: ["d_85", "g_85", "h_23", "d_25"],
      label: "Roof: Interior Surface Temperature (°C)",
      tooltip: true,  // "Temp Surface and Condensate Risk: T_si = T_interior - (U × ΔT × R_si)"
      hidden: true    // Not rendered in DOM (for future use)
    }
  }
}
```

**Repeat for all rows**: 85-95 (each with appropriate row-specific dependencies)

---

### 2.3 Surface Temperature Calculation Functions

**Location**: `src/sections/Section11.js` - Add in calculation helpers section

#### Helper Function: Calculate Surface Temperature

```javascript
/**
 * Calculate interior surface temperature for an envelope assembly
 * Excel Formula Pattern: =IF(D_row=0, "", $H$23 - (G_row * ($H$23 - $D$25) * R_si))
 *
 * @param {number} area - Assembly area (d_row)
 * @param {number} uValue - Assembly U-value (g_row)
 * @param {number} interiorTemp - Indoor setpoint h_23 (°C)
 * @param {number} exteriorTemp - Winter average d_25 (°C)
 * @param {number} rSi - Internal surface resistance (0.10, 0.13, or 0.17 m²K/W)
 * @returns {number|null} - Interior surface temperature (°C) or null if no area
 */
function calculateSurfaceTemperature(area, uValue, interiorTemp, exteriorTemp, rSi) {
  // Guard: No calculation if area is zero (assembly doesn't exist)
  if (area === 0 || !area) {
    return null;
  }

  // Formula: T_si = T_interior - (U × ΔT × R_si)
  const deltaT = interiorTemp - exteriorTemp;
  const surfaceTemp = interiorTemp - (uValue * deltaT * rSi);

  // Round to 2 decimal places
  return Math.round(surfaceTemp * 100) / 100;
}
```

#### Helper Function: Check Condensation Risk

```javascript
/**
 * Determine if surface temperature indicates condensation risk
 * @param {number|null} surfaceTemp - Interior surface temperature (°C)
 * @returns {boolean} - True if surface temp < 15°C (condensation risk)
 */
function hasCondensationRisk(surfaceTemp) {
  if (surfaceTemp === null || surfaceTemp === undefined) {
    return false;  // No risk if assembly doesn't exist
  }

  return surfaceTemp < 15;  // Risk threshold: 15°C
}
```

---

### 2.4 Component-Specific Calculations

**Location**: `src/sections/Section11.js` - Within calculation engines

Add surface temperature calculations for each assembly row. **Note**: Ground-facing assemblies (rows 94-95) use 10°C ground temperature instead of d_25.

#### Example: Row 85 (Roof - R_si = 0.10)

```javascript
// In calculateTargetModel() or calculateReferenceModel()

// ✅ NEW: Calculate roof surface temperature (o_85)
const roofArea = getNumericValue("d_85");
const roofUValue = getNumericValue("g_85");
const interiorTemp = getGlobalNumericValue("h_23");  // From S03
const winterAvgTemp = getGlobalNumericValue("d_25"); // From S03
const roofRsi = 0.10;  // Upward heat flow (ceiling)

const roofSurfaceTemp = calculateSurfaceTemperature(
  roofArea,
  roofUValue,
  interiorTemp,
  winterAvgTemp,
  roofRsi
);

// Store to local state and StateManager
if (roofSurfaceTemp !== null) {
  setCalculatedValue("o_85", roofSurfaceTemp);
} else {
  setCalculatedValue("o_85", "");  // Empty if no area
}
```

#### Complete Formula Mapping (Excel → JavaScript)

| Row | Assembly | Excel Formula | R_si | Exterior Temp |
|-----|----------|--------------|------|---------------|
| 85 | Roof | `=IF(D85=0,"",$H$23-(G85*($H$23-$D$25)*0.1))` | 0.10 | d_25 (winter avg) |
| 86 | Walls AG | `=IF(D86=0,"",$H$23-(G86*($H$23-$D$25)*0.13))` | 0.13 | d_25 (winter avg) |
| 87 | Floor Exposed | `=IF(D87=0,"",$H$23-(G87*($H$23-$D$25)*0.17))` | 0.17 | d_25 (winter avg) |
| 88 | Doors | `=IF(D88=0,"",$H$23-(G88*($H$23-$D$25)*0.13))` | 0.13 | d_25 (winter avg) |
| 89 | Window N | `=IF(D89=0,"",$H$23-(G89*($H$23-$D$25)*0.13))` | 0.13 | d_25 (winter avg) |
| 90 | Window E | `=IF(D90=0,"",$H$23-(G90*($H$23-$D$25)*0.13))` | 0.13 | d_25 (winter avg) |
| 91 | Window S | `=IF(D91=0,"",$H$23-(G91*($H$23-$D$25)*0.13))` | 0.13 | d_25 (winter avg) |
| 92 | Window W | `=IF(D92=0,"",$H$23-(G92*($H$23-$D$25)*0.13))` | 0.13 | d_25 (winter avg) |
| 93 | Skylights | `=IF(D93=0,"",$H$23-(G93*($H$23-$D$25)*0.1))` | 0.10 | d_25 (winter avg) |
| 94 | Walls BG | `=IF(D94=0,"",$H$23-(G94*($H$23-10)*0.13))` | 0.13 | 10°C (ground) |
| 95 | Floor Slab | `=IF(D95=0,"",$H$23-(G95*($H$23-10)*0.17))` | 0.17 | 10°C (ground) |

**Note**: Rows 94-95 use **10°C ground temperature** (constant) instead of d_25 winter average.

---

### 2.5 Visual Indicator Implementation

**Location**: `src/sections/Section11.js` - DOM update functions

#### Design: Icon Placement in Column G

- **Icon position**: Left side of U-value input (prepend to cell)
- **Cactus 🌵**: Surface temp ≥ 15°C (no condensation risk)
- **Water droplet 💧**: Surface temp < 15°C (condensation risk)
- **Layout**: `[icon] [U-value input]` within same Column G cell
- **Tooltip**: Attached to icon, explains surface temperature and R_si values

#### Function: Update Condensation Risk Icons

```javascript
/**
 * Update condensation risk icons in Column G (U-value) for all assemblies
 * Shows 🌵 when safe (≥15°C) or 💧 when risk (<15°C)
 * Icon placed to the left of U-value input within same cell
 * Called after all surface temperatures calculated
 */
function updateCondensationWarnings() {
  // Assembly rows with condensation checks
  const assemblyRows = [85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95];

  assemblyRows.forEach(rowNum => {
    const surfaceTemp = getNumericValue(`o_${rowNum}`);  // Get calculated surface temp
    const hasRisk = hasCondensationRisk(surfaceTemp);

    // Find the U-value cell (Column G) - this is the container
    const gCell = document.querySelector(`[data-field-id="g_${rowNum}"]`)?.parentElement;

    if (!gCell) return;

    // Remove existing condensation icon if present
    let condIcon = gCell.querySelector('.condensation-risk-icon');

    // Skip if no surface temp calculated (assembly doesn't exist)
    if (surfaceTemp === null || surfaceTemp === undefined || surfaceTemp === "") {
      condIcon?.remove();
      return;
    }

    if (!condIcon) {
      // Create new icon element
      condIcon = document.createElement('span');
      condIcon.className = 'condensation-risk-icon';
      condIcon.style.cssText = `
        margin-right: 6px;
        font-size: 1.2em;
        cursor: help;
        display: inline-block;
        vertical-align: middle;
      `;

      // Insert at beginning of cell (before U-value input)
      gCell.insertBefore(condIcon, gCell.firstChild);
    }

    // Update icon and tooltip based on risk
    if (hasRisk) {
      // RISK: Water droplet
      condIcon.textContent = '💧';
      condIcon.title = `CONDENSATION RISK DETECTED

Surface Temperature: ${surfaceTemp.toFixed(1)}°C (below 15°C threshold)

Formula: T_si = T_interior - (U × ΔT × R_si)

Surface Resistance (R_si) by orientation:
• Walls (horizontal heat flow): 0.13 m²K/W
• Ceilings (upward heat flow): 0.10 m²K/W
• Floors (downward heat flow): 0.17 m²K/W

Mitigation: Increase RSI value or reduce U-value to raise surface temperature above 15°C`;
    } else {
      // SAFE: Cactus (dry conditions)
      condIcon.textContent = '🌵';
      condIcon.title = `NO CONDENSATION RISK

Surface Temperature: ${surfaceTemp.toFixed(1)}°C (above 15°C threshold)

Formula: T_si = T_interior - (U × ΔT × R_si)

Surface Resistance (R_si) by orientation:
• Walls (horizontal heat flow): 0.13 m²K/W
• Ceilings (upward heat flow): 0.10 m²K/W
• Floors (downward heat flow): 0.17 m²K/W

Assembly is performing well for condensation control.`;
    }
  });
}
```

**CSS Considerations** (may need to adjust cell flexbox if U-value input shifts):
```css
/* Ensure Column G cell accommodates icon + input */
[data-field-id^="g_"] {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
```

---

### 2.6 Integration into Calculation Engines

**Location**: `src/sections/Section11.js` - Both calculation engines

#### Add to `calculateTargetModel()`

```javascript
function calculateTargetModel() {
  // ... existing envelope calculations ...

  // ✅ NEW: Calculate surface temperatures for all assemblies
  calculateAllSurfaceTemperatures();  // New function (see 2.7)

  // ✅ NEW: Update condensation warning icons in DOM
  updateCondensationWarnings();

  // ... rest of calculations ...
}
```

#### Add to `calculateReferenceModel()`

```javascript
function calculateReferenceModel() {
  // ... existing envelope calculations ...

  // ✅ NEW: Calculate surface temperatures for all assemblies
  calculateAllSurfaceTemperatures();  // New function (see 2.7)

  // ✅ NEW: Update condensation warning icons in DOM
  updateCondensationWarnings();

  // ... rest of calculations ...
}
```

---

### 2.7 Consolidated Surface Temperature Calculator

**Location**: `src/sections/Section11.js` - Helper functions section

```javascript
/**
 * Calculate surface temperatures for all envelope assemblies (rows 85-95)
 * Stores results in o_85 through o_95 fields (hidden Column O)
 */
function calculateAllSurfaceTemperatures() {
  // Get global climate values from Section03
  const interiorTemp = getGlobalNumericValue("h_23");  // Heating setpoint
  const winterAvgTemp = getGlobalNumericValue("d_25"); // Winter average exterior
  const groundTemp = 10;  // Constant for ground-facing assemblies

  // Assembly configurations: [row, R_si, exteriorTemp]
  const assemblies = [
    // Air-facing assemblies (use winter average d_25)
    [85, 0.10, winterAvgTemp],  // Roof (upward heat flow)
    [86, 0.13, winterAvgTemp],  // Walls AG (horizontal)
    [87, 0.17, winterAvgTemp],  // Floor Exposed (downward)
    [88, 0.13, winterAvgTemp],  // Doors (horizontal)
    [89, 0.13, winterAvgTemp],  // Window N (horizontal)
    [90, 0.13, winterAvgTemp],  // Window E (horizontal)
    [91, 0.13, winterAvgTemp],  // Window S (horizontal)
    [92, 0.13, winterAvgTemp],  // Window W (horizontal)
    [93, 0.10, winterAvgTemp],  // Skylights (upward)

    // Ground-facing assemblies (use constant 10°C)
    [94, 0.13, groundTemp],     // Walls BG (horizontal)
    [95, 0.17, groundTemp],     // Floor Slab (downward)
  ];

  assemblies.forEach(([row, rSi, exteriorTemp]) => {
    const area = getNumericValue(`d_${row}`);
    const uValue = getNumericValue(`g_${row}`);

    const surfaceTemp = calculateSurfaceTemperature(
      area,
      uValue,
      interiorTemp,
      exteriorTemp,
      rSi
    );

    // Store result (or empty string if no area)
    if (surfaceTemp !== null) {
      setCalculatedValue(`o_${row}`, surfaceTemp);
    } else {
      setCalculatedValue(`o_${row}`, "");
    }
  });
}
```

---

### 2.8 Mode-Aware Display Updates

**Location**: `src/sections/Section11.js` - `ModeManager.updateCalculatedDisplayValues()`

Add surface temperature fields to mode-aware display updates:

```javascript
updateCalculatedDisplayValues: function() {
  const calculatedFields = [
    // ... existing fields ...

    // ✅ NEW: Surface temperature fields (hidden Column O)
    "o_85", "o_86", "o_87", "o_88", "o_89",
    "o_90", "o_91", "o_92", "o_93", "o_94", "o_95"
  ];

  calculatedFields.forEach(fieldId => {
    // ... existing display logic ...
  });

  // ✅ CRITICAL: Update condensation warnings after display values updated
  updateCondensationWarnings();
}
```

---

## Testing Checklist

### Part 1: Section03 Climate Calculations

- [ ] Row 25 renders correctly in Section03 table
- [ ] `d_25` calculates correct winter average temp from HDD and cooling days
- [ ] `e_25` shows correct Fahrenheit conversion
- [ ] Values update when location changes (province/city)
- [ ] Values update when cooling days (m_19) changes
- [ ] Target model publishes d_25/e_25 to StateManager (unprefixed)
- [ ] Reference model publishes d_25/e_25 to StateManager (ref_ prefixed)
- [ ] Mode toggle switches between Target and Reference values correctly
- [ ] Import/export includes d_25 and e_25 fields
- [ ] QC Monitor shows no violations for new fields

### Part 2: Section11 Condensation Indicators

- [ ] Surface temperature fields (o_85 through o_95) added to field definitions
- [ ] `calculateSurfaceTemperature()` helper function implemented
- [ ] `hasCondensationRisk()` helper function implemented
- [ ] `calculateAllSurfaceTemperatures()` calculates all 11 assembly temperatures
- [ ] `updateCondensationWarnings()` adds/removes water droplets in Column G
- [ ] Water droplet (💧) appears when surface temp < 15°C
- [ ] Droplet disappears when risk resolved (e.g., higher RSI value)
- [ ] Tooltip shows surface temperature and explains R_si values
- [ ] Works correctly in both Target and Reference modes
- [ ] Updates in real-time when envelope values change (d_85-d_95, g_85-g_95)
- [ ] Updates when climate location changes (d_25 winter average)
- [ ] Updates when heating setpoint changes (h_23)
- [ ] Ground-facing assemblies (94-95) correctly use 10°C instead of d_25
- [ ] Air-facing assemblies (85-93) correctly use d_25 winter average
- [ ] Surface resistance values correct (0.10 ceiling, 0.13 walls, 0.17 floors)
- [ ] Column O fields stored in StateManager but not rendered in DOM
- [ ] Import/export includes o_85 through o_95 fields

---

## Dependencies

### Required StateManager Values (from Section03)
- `d_20` - HDD18 (Heating Degree Days)
- `m_19` - Cooling Days (user input)
- `d_25` - Winter Average Temperature °C (NEW - calculated)
- `e_25` - Winter Average Temperature °F (NEW - calculated)
- `h_23` - Heating Setpoint °C

### Required StateManager Values (for Part 2 - from other sections)
- Section08: Indoor RH% (for dew point calculation)
- Section11: Component U-values (g_85, g_86, etc.)
- Section11: Component areas (d_85, d_86, etc.)

---

## Architecture Compliance

### Dual-State Pattern ✅
- Target calculations use TargetState values
- Reference calculations use ReferenceState values
- Both engines publish to StateManager with correct prefixes
- No state mixing between Target and Reference

### StateManager Publication ✅
- All cross-section values published to StateManager
- Target values unprefixed (d_25, e_25)
- Reference values prefixed (ref_d_25, ref_e_25)
- Source marked as "calculated"

### Calculation Order ✅
- Section03 runs before Section11 in Calculator.js
- d_25/e_25 available when Section11 needs them
- No circular dependencies introduced

---

## Future Enhancements

### Phase 1 (Current Plan)
- Basic winter average temperature calculation
- StateManager publication for downstream use

### Phase 2 (Part 2 - Condensation Indicators)
- Visual indicators in Section11
- Surface temperature calculations per assembly
- Dew point comparison

### Phase 3 (Future)
- Interstitial condensation analysis (inside wall assemblies)
- Vapor barrier positioning recommendations
- Monthly condensation risk charts
- Integration with material hygrothermal properties

---

## Notes

**Excel Formula Reference**:
```
D25: =18 - (D20 / (365 - M19))
E25: =D25 * (9/5) + 32
```

**Why Winter Average vs Peak Cold**:
- Peak cold (-24°C) represents extreme 2.5% design condition
- Winter average (~0°C to -5°C) is more realistic for condensation assessment
- Assemblies may show condensation at average temps but not at peak (due to lower RH)
- Provides better guidance for typical operating conditions vs. rare extremes

**Surface Resistance Values** (for Part 2):
- Roof (upward heat flow): R_si = 0.10 m²K/W
- Walls (horizontal heat flow): R_si = 0.13 m²K/W
- Floor (downward heat flow): R_si = 0.17 m²K/W

**Interior Surface Temperature Formula** (for Part 2):
```
T_si = T_interior - (U × ΔT × R_si)
```
Where:
- T_si = Interior surface temperature
- T_interior = Room setpoint (h_23)
- U = Assembly U-value (g_85, g_86, etc.)
- ΔT = Temperature difference (h_23 - d_25)
- R_si = Internal surface resistance (by orientation)
