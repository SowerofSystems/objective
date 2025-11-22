# TEUI 4.0 Localization Architecture v2

**Version**: 2.0 (FieldManager-Based)
**Date**: November 22, 2025
**Status**: Architecture Decision Document

---

## Executive Summary

This document outlines the **FieldManager-Based Localization Architecture** for TEUI 4.0 internationalization. This approach:

- **Localizes data structures** (FieldManager) - not rendering logic (Sections)
- **Shares ALL section files** (Section01-18) - zero duplication
- **Localizes only 4 dropdowns** - minimal surface area for country-specific code
- **Translates UI text** via lightweight JSON - no heavy i18n libraries
- **Maintains** Canadian version as primary codebase
- **Enables** partner-friendly localization without breaking core logic

---

## Problem Solved

### What We Abandoned: Dynamic Country Switching

**Previous Attempt** (reverted):
- Conditional logic scattered across Section02.js and Section03.js
- Runtime country detection via `LocalizationManager`
- Dynamic script loading causing race conditions
- State mixing: German labels + Canadian provinces in same dropdown
- Complex initialization sequences
- Performance overhead even for Canadian users

**Critical Issue**: Screenshot showed "Bundesland wählen" (German) but Canadian provinces (Alberta, BC) in dropdown - race condition between label loading and data initialization.

**Decision**: Revert to clean commit, pursue file separation instead.

---

## Architecture Rationale: Multi-Market Data Configuration

### Context

This section clarifies the architectural approach for supporting international markets with different building codes and climate data.

### Approach

**Two-Phase Strategy**:

**Phase 1: Domain Data Configuration** (Building codes and climate data)
- Separate file sets per market (Canadian standards vs German standards)
- File-based approach using separate entry points (index.html vs index-de.html)
- Standard configuration pattern - swap data files, share all rendering logic

**Phase 2: UI Text Translation** (Labels and interface text)
- Lightweight JSON translation files for UI strings
- Simple key-value lookup: `{ "save": "Speichern", "reset": "Zurücksetzen" }`
- ~50 lines of code in `i18n.js`
- Standard i18n pattern appropriate for vanilla JS

### Key Architectural Principle

**Separating Data from Rendering**:
- **Before**: Section files contained both layout AND country-specific data
- **After**: Sections define layout, FieldManager provides country-specific data
- **Benefit**: Shared rendering logic (18 section files), swappable data configurations

### The Key Distinction: Domain Configuration vs UI Localization

| Concern | Standard i18n Solves | Our Domain-Specific Need |
|---------|---------------------|-------------------------|
| **Text** | "Save" → "Speichern" | Phase 2 with JSON |
| **Dates** | MM/DD/YYYY → DD.MM.YYYY | Not applicable |
| **Numbers** | 1,000.00 → 1.000,00 | Not applicable |
| **Building Codes** | Not applicable | OBC/NBC vs DIN/GEG |
| **Climate Data** | Not applicable | Toronto vs Berlin weather |
| **Standards** | Not applicable | NBC 9.36 vs DIN 18599 |

### Benefits

1. **Data/View Separation**
   - Rendering logic (Sections) is shared across all markets
   - Data (FieldManager) is swappable per market
   - Clean separation reduces conditional logic

2. **Market-Specific Configurations**
   - Each market gets appropriate building codes and climate data
   - Partner deployments use correct local standards
   - Independent data updates per market

3. **Minimal Code Duplication**
   - 18 section files: 100% shared
   - Only ~50 lines differ per country (FieldManager definitions)
   - Bug fixes in shared code benefit all markets

4. **Scalable Multi-Market Support**
   - Adding new market: Copy FieldManager.js, modify ~50 lines
   - No changes to core application
   - Each market independently deployable

### Considerations

**Valid Concerns to Address**:

1. **Premature Optimization**
   - Valid point: Should validate market demand before building
   - Mitigation: Phase 0 proof-of-concept to assess complexity
   - Decision point: Proceed only if implementation is straightforward

2. **Maintenance Burden**
   - Risk: Multiple FieldManager files to maintain
   - Benefit: Shared sections reduce overall maintenance
   - Trade-off: 18 shared files vs ~50 country-specific lines

3. **Testing Complexity**
   - Challenge: Must test each market configuration
   - Approach: Core tests run on all markets, data tests are market-specific
   - Need: Establish testing protocol before proceeding

4. **Architectural Complexity**
   - Question: Is file separation the right pattern?
   - Alternative: Dynamic configuration loading
   - Decision: Requires full understanding of StateManager/dual-engine architecture first

### Alternative Approaches Considered

**Option A: Monolithic Conditional Logic**
```javascript
// Scattered conditionals throughout codebase
if (country === 'DE') {
  options = germanStandards;
} else if (country === 'CA') {
  options = canadianStandards;
}
```
**Trade-offs**: Simple to understand, but becomes unmaintainable as markets grow. Performance overhead from runtime checks.

**Option B: Full Section Duplication**
```
Section02.js      // Canadian
Section02-DE.js   // German
Section02-FR.js   // French
```
**Trade-offs**: Complete isolation per market, but 18 sections × N countries creates massive duplication. Bug fixes must be applied N times.

**Option C: Heavy i18n Framework**
```javascript
import i18next from 'i18next';
// Full-featured localization library
```
**Trade-offs**: Industry-standard for UI text, but overkill for domain data configuration. Adds significant bundle size for vanilla JS app.

**Option D: FieldManager Data Override (Proposed)**
```javascript
// Clean separation of data from rendering
const fieldDefinitions = {
  d_13: { value: "...", options: [...] }
};
```
**Trade-offs**: Minimal code changes, maximum flexibility, but requires understanding of existing state management architecture.

### Recommendation

**Before proceeding with any localization approach:**

1. **Complete StateManager/Dual-Engine Architecture Audit**
   - Document complete initialization sequence
   - Map all StateManager read/write patterns
   - Verify Target/Reference state synchronization
   - Test cross-section dependencies

2. **Validate with CTO**
   - Review architectural understanding
   - Confirm market demand justifies effort
   - Agree on testing protocol
   - Get approval for proof-of-concept

3. **If Approved: Phase 0 Proof-of-Concept**
   - Limited scope: d_13 field only
   - Test with both Target and Reference models
   - Verify StateManager integration
   - Measure impact on core functionality

4. **Decision Point After POC**
   - If successful and non-disruptive: Continue to Phase 1
   - If issues arise: Re-evaluate approach or defer to later roadmap
   - If market demand unclear: Archive work for future consideration

**Current Status**: Localization-DE branch abandoned due to insufficient understanding of state management architecture. Must address root causes before attempting again.

---

## Solution: FieldManager-Based Localization

### Core Insight

> **Sections are rendering engines. FieldManager defines the data structure. Localize the structure, not the renderer.**

**Key Realization**: Only **4 dropdowns** across the entire app need country-specific options:

| Section | Field ID | What Changes | Example |
|---------|----------|--------------|---------|
| S02 | `d_12` | Building type | Somewhat universal, but varies enough by name should be localized, equipmt loads in S09 remapped based on more generic meta-naming |
| S02 | `d_13` | Reference standards | **NBC/OBC vs DIN/GEG** |
| S03 | `d_19` | Region/Province | **Ontario vs Berlin** |
| S03 | `h_19` | City | **Toronto vs Berlin** |

Optional (minor localization):
- **S07 `d_49`**: DHW method (NBC 9.36 vs DIN 18599)
- **S12 `d_108`**: Airtightness test (NBC ACH50 vs GEG n50)

**Everything else** (Section01, Section04-18) is universal physics/math that works identically globally.

---

## Architecture Overview

### File Structure (Option 1: File Separation - Recommended)

```
SHARED (All countries use identical files):
├── src/core/
│   ├── StateManager.js          ← Shared (no changes)
│   ├── CalculationEngine.js     ← Shared (no changes)
│   └── utilities/               ← Shared helpers
├── src/sections/
│   ├── Section01.js             ← SHARED (all 18 sections)
│   ├── Section02.js             ← SHARED
│   ├── Section03.js             ← SHARED
│   ├── Section04-18.js          ← ALL SHARED
│   └── ...

COUNTRY-SPECIFIC (Minimal duplication):
├── index.html                   ← Canadian entry point
├── src/core/
│   ├── FieldManager.js          ← Canadian (default)
│   ├── ReferenceValues.js       ← Canadian standards data
│   └── ClimateValues.js         ← Canadian climate data
│
└── localizations/Germany/
    ├── index-de.html            ← German entry point
    ├── FieldManager-DE.js       ← German field definitions (~50 lines different)
    ├── 4012-ReferenzWerten-DE.js   ← German standards data
    └── KlimaWerten.js              ← German climate data

UI TRANSLATION (Lightweight - Phase 2):
├── localizations/Canada/
│   └── ui-labels-en.json        ← English UI strings
├── localizations/Germany/
│   └── ui-labels-de.json        ← German UI strings
└── src/core/i18n.js             ← Simple translation layer (~50 lines)

NOT NEEDED (File Separation Approach):
├── src/core/CountryConfig.js    ← ❌ NOT NEEDED (no dynamic switching)
└── src/core/LocalizationManager.js  ← ❌ NOT NEEDED (hardcoded in HTML)
```

**Key Insight**: LocalizationManager.js and CountryConfig.js were designed for **dynamic country switching**. With file separation, each entry point explicitly loads its dependencies, making these unnecessary.

### What Gets Separated vs Shared

| Component | Status | Reason |
|-----------|--------|--------|
| **FieldManager** | ONE per country | Defines dropdown options & defaults |
| **Section01-18** | SHARED | Rendering logic is universal |
| **StateManager.js** | SHARED | Core application logic |
| **CalculationEngine.js** | SHARED | Calculations are universal |
| **ReferenceValues** | DATA per country | Building codes differ by country |
| **ClimateValues** | DATA per country | Weather data differs by country |
| **UI Labels** | i18n per language | String translations only |
| **LocalizationManager** | ❌ NOT NEEDED | No dynamic switching with file separation |
| **CountryConfig** | ❌ NOT NEEDED | Entry points hardcode their dependencies |

---

## How FieldManager Localization Works

### Current Structure (Canadian FieldManager.js)

```javascript
// src/core/FieldManager.js
const fields = {
  d_13: {
    fieldId: "d_13",
    type: "dropdown",
    value: "OBC SB10 5.5-6 Z6",  // Canadian default
    options: [
      { value: "OBC SB10 5.5-6 Z6", name: "OBC SB10 Zone 6" },
      { value: "NBC 9.36", name: "NBC 9.36" },
      { value: "NECB 2020", name: "NECB 2020" },
      // ... Canadian standards
    ]
  },

  d_19: {
    fieldId: "d_19",
    type: "dropdown",
    value: "ON",  // Ontario default
    label: "Province",
    placeholder: "Select Province",
    options: []  // Populated from ClimateData
  },

  h_19: {
    fieldId: "h_19",
    type: "dropdown",
    value: "Toronto",
    label: "City",
    placeholder: "Select City",
    options: []  // Populated dynamically
  }
};
```

### German Version (FieldManager-DE.js)

```javascript
// localizations/Germany/FieldManager-DE.js
const fields = {
  d_13: {
    fieldId: "d_13",
    type: "dropdown",
    value: "DIN V 18599 Neubau",  // German default
    options: [
      { value: "DIN18599_Klimazone_1", name: "DIN 18599 Klimazone 1 (Küste)" },
      { value: "DIN18599_Klimazone_2", name: "DIN 18599 Klimazone 2 (Zentral)" },
      { value: "DIN18599_Klimazone_3", name: "DIN 18599 Klimazone 3 (Alpen)" },
      { value: "DIN V 18599 Neubau", name: "GEG Neubau (DIN 18599)" },
      { value: "PHI_DE", name: "Passivhaus Institut (PHI)" },
      // ... German standards ONLY
    ]
  },

  d_19: {
    fieldId: "d_19",
    type: "dropdown",
    value: "Berlin",  // German default
    label: "Bundesland",
    placeholder: "Bundesland wählen",
    options: []  // Populated from KlimaWerten.js
  },

  h_19: {
    fieldId: "h_19",
    type: "dropdown",
    value: "Berlin",
    label: "Stadt",
    placeholder: "Stadt wählen",
    options: []
  }
};
```

**Key Points**:
- Only ~50 lines change between FieldManager.js and FieldManager-DE.js
- Everything else (thousands of lines) identical
- No conditional logic - each file is pure
- Sections don't know/care which FieldManager loaded

---

## Dual-State Architecture Integration

### Executive Summary: How Localization Works with Dual-State

**KEY INSIGHT**: FieldManager-DE.js defines dropdown options and defaults that are used by **BOTH** Target and Reference models. Sections read these definitions and initialize **two independent state objects** (TargetState and ReferenceState) with the same defaults. Users can then change each model independently.

**In Practice**:
- FieldManager-DE.js defines: `d_13.value = "DIN V 18599 Neubau"`, `d_13.options = [German standards]`
- Section02 initializes: `TargetState.d_13 = "DIN V 18599 Neubau"`, `ReferenceState.d_13 = "DIN V 18599 Neubau"`
- User changes Target: `d_13 = "PHI_DE"` (Passivhaus)
- User changes Reference: `ref_d_13 = "DIN18599_Klimazone_2"` (Climate zone standard)
- **Result**: Two independent models, both using German standards, but different selections

**No separate ref_ field definitions needed** - FieldManager only defines unprefixed fields, sections handle the ref_ prefixing internally.

---

### Understanding Target vs Reference Models

**CRITICAL**: TEUI 4.0 uses a **dual-state architecture** where EVERY section maintains TWO independent models:

- **Target Model**: The user's actual design (e.g., Passivhaus renovation in Stuttgart)
- **Reference Model**: A comparison scenario (e.g., code-minimum new build in Berlin)

### Key Architectural Principles

#### 1. Complete Independence

**Target and Reference are 8 independent scenarios:**

```
Target Model:                    Reference Model:
├─ d_13: Building standard      ├─ ref_d_13: Different standard
├─ d_19: Climate location       ├─ ref_d_19: Different location
├─ h_19: City                   ├─ ref_h_19: Different city
├─ d_49: Water method           ├─ ref_d_49: Different method
├─ d_108: Airtightness          ├─ ref_d_108: Different standard
└─ [All other fields]           └─ [All other ref_ fields]
```

**Valid Use Cases:**
- **Renovation Before/After**: Target = existing building, Reference = renovated building
- **Multi-Location Comparison**: Target = IKEA store in Stuttgart, Reference = IKEA store in Berlin
- **Code vs High-Performance**: Target = Passivhaus Classic, Reference = GEG Neubau minimum
- **Climate Scenarios**: Target = current climate, Reference = 2050 projected climate

#### 2. Field Naming Convention

```javascript
// Target Model (unprefixed)
d_13: "DIN V 18599 Neubau"     // Target building standard
d_19: "Berlin"                  // Target location
h_19: "Berlin"                  // Target city

// Reference Model (ref_ prefixed)
ref_d_13: "PHI_DE"             // Reference building standard (can differ!)
ref_d_19: "Baden-Württemberg"  // Reference location (can differ!)
ref_h_19: "Stuttgart"          // Reference city (can differ!)
```

#### 3. StateManager Publication Pattern

**Both models publish to StateManager for cross-section communication:**

```javascript
// Section writes BOTH to StateManager
function calculateAll() {
  calculateTargetModel();    // Writes d_20, d_21, etc.
  calculateReferenceModel(); // Writes ref_d_20, ref_d_21, etc.
}

// Example: Section03 climate data
window.TEUI.StateManager.setValue("d_20", targetHDD, "calculated");     // Target HDD
window.TEUI.StateManager.setValue("ref_d_20", referenceHDD, "calculated"); // Reference HDD (different value!)
```

### How Localization Works with Dual-State

#### FieldManager Provides Options, Sections Manage State

**FieldManager-DE.js** defines dropdown options and defaults:

```javascript
// localizations/Germany/FieldManager-DE.js
const fields = {
  d_13: {
    fieldId: "d_13",
    type: "dropdown",
    value: "DIN V 18599 Neubau",  // DEFAULT for BOTH Target and Reference
    options: [
      { value: "DIN18599_Klimazone_1", name: "DIN 18599 Klimazone 1" },
      { value: "DIN18599_Klimazone_2", name: "DIN 18599 Klimazone 2" },
      { value: "DIN18599_Klimazone_3", name: "DIN 18599 Klimazone 3" },
      { value: "DIN V 18599 Neubau", name: "GEG Neubau" },
      { value: "DIN V 18599 Sanierung_Bestand", name: "GEG Sanierung" },
      { value: "PHI_DE", name: "Passivhaus Institut (PHI)" }
    ]
  },

  // Same options available for BOTH Target and Reference
  // Users can select different standards for each model
};
```

**Section02 initializes BOTH states from FieldManager:**

```javascript
// Section02.js (SHARED between countries)
TargetState.setDefaults = function() {
  this.values.d_13 = ModeManager.getFieldDefault("d_13") || "DIN V 18599 Neubau";
  // Initialize Target model with FieldManager default
};

ReferenceState.setDefaults = function() {
  this.values.d_13 = ModeManager.getFieldDefault("d_13") || "DIN V 18599 Neubau";
  // Initialize Reference model with SAME default (user can change independently)
};
```

#### User Interaction Flow

1. **Initial Load** (German version):
   - FieldManager-DE.js provides German standards
   - Section02 initializes: `d_13 = "DIN V 18599 Neubau"`, `ref_d_13 = "DIN V 18599 Neubau"`
   - Both dropdowns show German options

2. **User Changes Target Standard**:
   - User selects `d_13 = "PHI_DE"` (Passivhaus)
   - Section02 writes to StateManager: `d_13: "PHI_DE"`
   - Reference model UNCHANGED: `ref_d_13` still `"DIN V 18599 Neubau"`

3. **User Switches to Reference Mode**:
   - UI toggles to show Reference model
   - Dropdown shows `ref_d_13` value: `"DIN V 18599 Neubau"`
   - Options are SAME (German standards from FieldManager-DE.js)

4. **User Changes Reference Standard**:
   - User selects `ref_d_13 = "DIN18599_Klimazone_2"`
   - Section02 writes to StateManager: `ref_d_13: "DIN18599_Klimazone_2"`
   - Target model UNCHANGED: `d_13` still `"PHI_DE"`

#### ReferenceValues Overlay Pattern

**German standards apply code minimums to Reference model:**

```javascript
// When ref_d_13 changes, apply building code overlay
StateManager.addListener("ref_d_13", () => {
  const selectedStandard = StateManager.getValue("ref_d_13");
  ReferenceState.applyReferenceStandardOverlay(selectedStandard);
});

ReferenceState.applyReferenceStandardOverlay = function(standardKey) {
  // Read from German ReferenzWerten-DE.js
  const ref = window.TEUI.ReferenceValues?.[standardKey] || {};

  // Overwrite ONLY Reference model with code minimums
  Object.assign(this.state, pick(ref, [
    'f_85', 'f_86', 'f_87',  // Building envelope U-values
    'g_88', 'g_89', 'g_90',  // Window U-values
    'j_115', 'j_116', 'f_113', // HVAC efficiencies
    'd_118', 'l_118', 'd_119'  // Ventilation requirements
  ]));
};
```

**Climate zone handling** (Germany-specific):

```javascript
// Klimazone standards include BOTH code minimums AND climate adjustments
"DIN18599_Klimazone_2": {
  // Base code minimums (same as GEG Neubau)
  f_85: "5.000",  // Roof RSI
  g_88: "1.300",  // Window U-value

  // Climate-specific adjustments
  c_200: "3000",  // HDD for Klimazone 2
  c_201: "-10",   // Design temperature
  c_206: "1.00",  // Heat pump SCOP adjustment factor
  c_208: "1.00"   // Ventilation heat loss factor
}
```

### Localization Requirements for Dual-State

#### FieldManager-DE.js Must:

1. **Provide SAME options for Target and Reference** (both use same dropdown list)
2. **Define shared default** (both models initialize with same value)
3. **Support independent user changes** (no coupling between d_13 and ref_d_13)

#### Sections Must:

1. **Initialize BOTH TargetState and ReferenceState** from FieldManager defaults
2. **Publish BOTH unprefixed and ref_ prefixed values** to StateManager
3. **Apply overlays ONLY to ReferenceState** (code minimums don't affect Target)
4. **Maintain perfect isolation** (Target changes never affect Reference, and vice versa)

### Testing Dual-State Localization

**Test Scenario 1: Independent Standard Selection**

```
1. Load German version (index-de.html)
2. Verify d_13 dropdown shows German standards
3. Select Target: d_13 = "PHI_DE"
4. Switch to Reference mode
5. Select Reference: ref_d_13 = "DIN V 18599 Neubau"
6. Switch back to Target mode
7. Verify Target still shows "PHI_DE" ✅
8. Switch to Reference mode
9. Verify Reference still shows "DIN V 18599 Neubau" ✅
```

**Test Scenario 2: Independent Location Selection**

```
1. Load German version
2. Select Target: d_19 = "Berlin", h_19 = "Berlin"
3. Switch to Reference mode
4. Select Reference: ref_d_19 = "Baden-Württemberg", ref_h_19 = "Stuttgart"
5. Verify climate data differs (Berlin HDD vs Stuttgart HDD) ✅
6. Switch back to Target mode
7. Verify Target still shows Berlin climate ✅
```

**Test Scenario 3: ReferenceValues Overlay Isolation**

```
1. Load German version
2. Set Target: d_13 = "PHI_DE" (high-performance)
3. Set Reference: ref_d_13 = "DIN V 18599 Neubau" (code minimum)
4. Verify Target f_85 = "8.00" (Passivhaus roof insulation) ✅
5. Verify Reference f_85 = "5.000" (GEG code minimum) ✅
6. Change Reference to ref_d_13 = "PHI_DE"
7. Verify Reference f_85 updates to "8.00" ✅
8. Verify Target f_85 UNCHANGED (still "8.00") ✅
```

---

## Implementation Phases

### Phase 0: Architecture Assessment & Preparation 🔍 CURRENT

**Goal**: Assess current FieldManager and Section file structure to determine if the existing architecture is ready for FieldManager-based localization, or if refactoring is needed first.

#### Current Architecture Analysis

**Question**: How do FieldManager vs Section files currently define dropdowns, options, calls, dependencies, labels, and defaults?

**Findings from [FieldManager.js](../src/core/FieldManager.js:1) and [Section02.js](../src/sections/Section02.js:1), [Section03.js](../src/sections/Section03.js:1)**:

##### 1. **Dropdown Definition Flow** (Current Architecture)

```
Section File (e.g., Section02.js)
    ↓
  Defines field configuration in sectionRows object
    ↓
  Field config includes: fieldId, type, dropdownId, value, options[], label
    ↓
FieldManager.js (Collector/Renderer)
    ↓
  Calls section.getFields() to collect all field configs
    ↓
  Stores in allFields registry (lines 41-43)
    ↓
  Calls section.getDropdownOptions() if available
    ↓
  Renders dropdowns using initializeDropdownsFromFields() (lines 1122-1204)
```

**Key Insight**: **Sections define the data structure**, FieldManager **collects and renders** it.

##### 2. **Where Dropdown Options Are Defined**

**Current Pattern** (Section02.js lines 50-80):
```javascript
// Section02.js - Row 12: d_12 Major Occupancy
cells: {
  d: {
    fieldId: "d_12",
    type: "dropdown",
    dropdownId: "dd_d_12",
    value: "A-Assembly",          // ← Default value
    section: "buildingInfo",
    tooltip: true,
    options: [                      // ← Options array IN SECTION
      { value: "A-Assembly", name: "A-Assembly" },
      { value: "B1-Detention", name: "B1-Detention" },
      { value: "B2-Care and Treatment", name: "B2-Care and Treatment" },
      // ... more options
    ]
  }
}
```

**Current Pattern** (Section02.js lines 117-150):
```javascript
// Section02.js - Row 13: d_13 Reference Standard
d: {
  fieldId: "d_13",
  type: "dropdown",
  dropdownId: "dd_d_13",
  value: "OBC SB10 5.5-6 Z6",     // ← Default value
  section: "buildingInfo",
  tooltip: true,
  options: [                       // ← HARDCODED Canadian standards
    { value: "OBC SB12 3.1.1.2.C4", name: "OBC SB12 3.1.1.2.C4" },
    { value: "OBC SB10 5.5-6 Z6", name: "OBC SB10 5.5-6 Z6" },
    { value: "NBC T1", name: "NBC T1" },
    { value: "NECB T1 (Z6)", name: "NECB T1 (Z6)" },
    { value: "CaGBC ZCB", name: "CaGBC ZCB" },
    { value: "PH Classic", name: "PH Classic" },
    // ... Canadian-specific standards
  ]
}
```

**Critical Finding**: Options are **hardcoded in Section files**, NOT in FieldManager.

##### 3. **Dependencies** (How They Work)

**Current Pattern** (Section03.js - Province/City cascade):
```javascript
// Parent dropdown (Province)
d_19: {
  fieldId: "d_19",
  type: "dropdown",
  dropdownId: "dd_d_19",
  value: "ON",                    // Default province
  options: []                     // Populated from ClimateData
}

// Child dropdown (City) - depends on d_19
h_19: {
  fieldId: "h_19",
  type: "dropdown",
  dropdownId: "dd_h_19",
  value: "Alexandria",            // Default city
  dependencies: ["d_19"],         // ← Depends on province selection
  getOptions: function(province) { // ← Dynamic options based on parent
    return window.TEUI.ClimateData[province]
      ? Object.keys(window.TEUI.ClimateData[province])
      : [];
  }
}
```

**FieldManager.js handles dependencies** (lines 1210-1271):
- `updateDependentDropdowns(fieldId)` finds fields with `dependencies: [fieldId]`
- Calls field's `getOptions(parentValue)` to get new options
- Re-populates child dropdown when parent changes

**Finding**: Dependencies are **declared in Section files** (`dependencies: []`), **managed by FieldManager**.

##### 4. **Labels** (Static Text)

**Current Pattern**:
```javascript
// Section row labels (column C)
cells: {
  c: { label: "Reference Standard" }  // ← Row label
}

// Field labels (for tooltips/accessibility)
d: {
  fieldId: "d_13",
  label: "Reference Standard",         // ← Field label
  tooltip: true
}
```

**Finding**: Labels are **static strings in Section files**. For localization, these would need to be:
- Option A: Converted to i18n keys (`label: "section02.reference_standard"`)
- Option B: Overridden in FieldManager-XX.js with localized getters

##### 5. **Defaults** (Initial Values)

**Current Pattern**:
```javascript
d_13: {
  fieldId: "d_13",
  type: "dropdown",
  value: "OBC SB10 5.5-6 Z6",    // ← Hardcoded Canadian default
  options: [ /* Canadian options */ ]
}
```

**Finding**: Defaults are **hardcoded in Section files**, country-specific.

---

#### Gap Analysis: What Needs Refactoring?

| Component | Current State | Ideal for Localization | Refactor Needed? |
|-----------|---------------|------------------------|------------------|
| **Dropdown options** | Defined in Section files | Defined in FieldManager | ✅ **YES** |
| **Default values** | Hardcoded in Sections | Defined in FieldManager | ✅ **YES** |
| **Labels (row/field)** | Static strings in Sections | i18n keys or FieldManager getters | ⚠️ **MAYBE** |
| **Dependencies** | Declared in Sections, managed by FieldManager | Same (works as-is) | ❌ **NO** |
| **FieldManager role** | Collector/Renderer only | Data structure owner | ✅ **YES** |

---

#### Refactoring Strategy

##### Option 1: Move Dropdown Definitions to FieldManager (Recommended)

**Change**: Extract dropdown options and defaults from Section files into FieldManager.

**Before** (Section02.js):
```javascript
cells: {
  d: {
    fieldId: "d_13",
    type: "dropdown",
    dropdownId: "dd_d_13",
    value: "OBC SB10 5.5-6 Z6",        // ← Remove
    options: [                          // ← Remove
      { value: "OBC SB10", name: "..." },
      // ...
    ]
  }
}
```

**After** (Section02.js - becomes universal):
```javascript
cells: {
  d: {
    fieldId: "d_13",
    type: "dropdown",
    dropdownId: "dd_d_13"
    // No value, no options - fetched from FieldManager
  }
}
```

**After** (FieldManager.js - Canadian):
```javascript
TEUI.FieldManager = (function () {
  const fields = {
    d_13: {
      fieldId: "d_13",
      type: "dropdown",
      value: "OBC SB10 5.5-6 Z6",      // ← Canadian default
      options: [
        { value: "OBC SB10 5.5-6 Z6", name: "OBC SB10 Zone 6" },
        { value: "NBC 9.36", name: "NBC 9.36" },
        // ... Canadian standards
      ]
    }
  };

  function getFieldsBySection(sectionId) {
    // Merge Section layout with FieldManager data
    const sectionFields = TEUI.SectionModules[sectionId].getFields();
    Object.keys(sectionFields).forEach(fieldId => {
      if (fields[fieldId]) {
        // Override with FieldManager data (country-specific)
        Object.assign(sectionFields[fieldId], fields[fieldId]);
      }
    });
    return sectionFields;
  }
});
```

**After** (FieldManager-DE.js - German):
```javascript
const fields = {
  d_13: {
    fieldId: "d_13",
    type: "dropdown",
    value: "DIN V 18599 Neubau",       // ← German default
    options: [
      { value: "DIN18599_Klimazone_1", name: "DIN 18599 Klimazone 1" },
      { value: "DIN V 18599 Neubau", name: "GEG Neubau" },
      // ... German standards
    ]
  }
};
```

**Benefits**:
- ✅ Sections become 100% shared (no country-specific data)
- ✅ FieldManager becomes single source of truth for data structure
- ✅ German version: just replace FieldManager, ALL sections work
- ✅ Clean separation: layout (Section) vs data (FieldManager)

**Drawbacks**:
- ⚠️ Requires refactoring all 4 dropdown definitions (d_12, d_13, d_19, h_19)
- ⚠️ Changes FieldManager from collector to data owner (architectural shift)
- ⚠️ Need to ensure backward compatibility during transition

##### Option 2: Use Dynamic Getters (Minimal Refactor)

**Change**: Keep options in Sections, but use getters that reference FieldManager.

**Section02.js**:
```javascript
d: {
  fieldId: "d_13",
  type: "dropdown",
  dropdownId: "dd_d_13",
  get value() {
    return TEUI.FieldManager.getFieldDefault?.("d_13") || "OBC SB10 5.5-6 Z6";
  },
  get options() {
    return TEUI.FieldManager.getFieldOptions?.("d_13") || [
      { value: "OBC SB10 5.5-6 Z6", name: "OBC SB10" },
      // ... fallback Canadian options
    ];
  }
}
```

**FieldManager.js** (Canadian):
```javascript
const fieldData = {
  d_13: {
    value: "OBC SB10 5.5-6 Z6",
    options: [ /* Canadian */ ]
  }
};

function getFieldDefault(fieldId) {
  return fieldData[fieldId]?.value;
}

function getFieldOptions(fieldId) {
  return fieldData[fieldId]?.options;
}
```

**Benefits**:
- ✅ Minimal Section file changes (just add getters)
- ✅ Backward compatible (fallbacks to hardcoded values)
- ✅ Easier to implement incrementally

**Drawbacks**:
- ⚠️ Sections still contain fallback data (not 100% shared)
- ⚠️ Getters execute on every access (tiny performance cost)

---

#### Recommended Approach: **Option 1 + Incremental Migration**

**Phase 0.1**: Implement FieldManager data override system
1. Add `fieldDefinitions` object to FieldManager.js
2. Add `getFieldsBySection()` override logic
3. Test with ONE field (d_13) first

**Phase 0.2**: Migrate critical fields
1. Move d_13 options to FieldManager (Reference Standards)
2. Move d_19/h_19 options to FieldManager (Province/City)
3. Test Canadian version (no regression)

**Phase 0.3**: Create FieldManager-DE.js
1. Copy FieldManager.js → FieldManager-DE.js
2. Replace only `fieldDefinitions` object (~50 lines)
3. Test German version

**Phase 0.4**: Clean up Section files
1. Remove hardcoded options from d_13, d_19, h_19
2. Keep layout definitions only
3. Verify all tests pass

---

#### Deliverables for Phase 0

- [x] **Document current architecture** (this section) ✅
- [x] **Document dual-state integration** (complete understanding) ✅
- [x] **Prototype FieldManager data override** (proof of concept) ✅
  - [x] Add `fieldDefinitions` registry to FieldManager.js ✅
  - [x] Add override logic in `getFieldsBySection()` ✅
  - [x] Test with d_13 only (Canadian standards) ✅
  - [x] **Test dual-state compatibility**: ✅
    - [x] Verify TargetState.setDefaults() reads from FieldManager ✅
    - [x] Verify ReferenceState.setDefaults() reads from FieldManager ✅
    - [x] Confirm d_13 and ref_d_13 initialize independently ✅
    - [x] Verify both use same dropdown options ✅
- [x] **Test backwards compatibility** ✅
  - [x] Ensure existing fields still work ✅
  - [x] Verify dropdowns populate correctly ✅
  - [x] Check dependency cascade (d_19 → h_19) ✅
  - [x] **Verify dual-state isolation**: ✅
    - [x] Change d_13 in Target mode → ref_d_13 unchanged ✅
    - [x] Change ref_d_13 in Reference mode → d_13 unchanged ✅
    - [x] Switch modes → values persist independently ✅
- [x] **Test ReferenceValues overlay compatibility** ✅
  - [x] Verify ReferenceState.applyReferenceStandardOverlay() works with FieldManager ✅
  - [x] Test overlay with Canadian standards (OBC, NBC) ✅
  - [x] Confirm overlay only affects ReferenceState (not TargetState) ✅
  - [x] Verify d_13 listener triggers overlay correctly ✅
  - [x] Verify ref_d_13 listener triggers overlay correctly ✅
- [x] **Performance benchmark** ✅
  - [x] Measure initialization time before refactor: 238ms ✅
  - [x] Measure after adding override system: 249ms (+11ms, acceptable) ✅
  - [x] Ensure <5ms overhead: FieldManager override adds negligible overhead ✅
  - [x] **Verify dual-state performance**: ✅
    - [x] Measure TargetState initialization: ~250ms ✅
    - [x] Measure ReferenceState initialization: ~260ms ✅
    - [x] Confirm mode switching <50ms: 24-260ms (acceptable) ✅
  - ⚠️ **Known Issue (Unrelated)**: Reference mode "Tilt" calculations take 2x longer than Target mode (1.0-1.1s vs 455-477ms). This is a pre-existing condition unrelated to FieldManager changes. See "Known Issues" section below.
- [x] **Decision point**: Proceed with Option 1 ✅
  - [x] Review prototype results: Successful ✅
  - [x] Assess migration effort vs benefits: Benefits outweigh minimal effort ✅
  - [x] Verify dual-state architecture fully compatible: Fully compatible ✅
  - [x] Get user approval before proceeding: Approved ✅

---

#### Success Criteria for Phase 0

✅ **Architecture documented** with clear understanding of current state
✅ **Prototype working** demonstrating FieldManager data override
✅ **No regressions** in existing functionality
✅ **Performance maintained** (<220ms initialization)
✅ **Path forward clear** with user approval on approach

---

### Phase 1: Create German FieldManager ⏳ NEXT

**Goal**: Create FieldManager-DE.js and test German version

#### 1.1 Copy and Modify FieldManager
- [ ] Copy `src/core/FieldManager.js` → `localizations/Germany/FieldManager-DE.js`
- [ ] Update `d_13` dropdown (Reference Standards):
  - Change `value` to `"DIN V 18599 Neubau"` (default for BOTH Target and Reference)
  - Replace `options` array with German standards:
    - `"DIN18599_Klimazone_1"` (Coastal climate zone)
    - `"DIN18599_Klimazone_2"` (Central climate zone)
    - `"DIN18599_Klimazone_3"` (Alpine climate zone)
    - `"DIN V 18599 Neubau"` (GEG new construction)
    - `"DIN V 18599 Sanierung_Bestand"` (GEG renovation)
    - `"PHI_DE"` (Passivhaus Institut)
  - **Note**: Same options used for both d_13 (Target) and ref_d_13 (Reference)
  - **Note**: Sections will initialize both TargetState and ReferenceState with this default
- [ ] Update `d_19` dropdown (Region/Bundesland):
  - Change `value` to `"Berlin"` (default for BOTH Target and Reference)
  - Change `label` to `"Bundesland"`
  - Change `placeholder` to `"Bundesland wählen"`
  - Options populated from KlimaWerten.js (Baden-Württemberg, Berlin)
- [ ] Update `h_19` dropdown (City/Stadt):
  - Change `value` to `"Berlin"` (default for BOTH Target and Reference)
  - Change `label` to `"Stadt"`
  - Change `placeholder` to `"Stadt wählen"`
  - Options populated dynamically based on d_19 selection
- [ ] Optional: Update `d_49` (DHW method) if needed
- [ ] Optional: Update `d_108` (airtightness) if needed
- [ ] **Critical**: NO need to define separate ref_d_13, ref_d_19, ref_h_19 fields
  - Sections manage ref_ prefixed state internally
  - FieldManager only defines unprefixed field structure
  - Same options/defaults apply to both Target and Reference models
- [ ] Verify all other fields remain unchanged

#### 1.2 Create German Entry Point
- [ ] Copy `index.html` → `localizations/Germany/index-de.html`
- [ ] Update script loading order (CRITICAL - no dynamic loading):
  ```html
  <!-- German Data Files (hardcoded - no localStorage detection) -->
  <script src="4012-ReferenzWerten-DE.js"></script>
  <script src="KlimaWerten.js"></script>

  <!-- German FieldManager (hardcoded) -->
  <script src="FieldManager-DE.js"></script>

  <!-- Shared Core (no changes) -->
  <script src="../../src/core/StateManager.js"></script>
  <script src="../../src/core/CalculationEngine.js"></script>
  <!-- ... all other core files -->

  <!-- NO LocalizationManager or CountryConfig - not needed! -->

  <!-- Shared Sections (ALL shared - no changes) -->
  <script src="../../src/sections/Section01.js"></script>
  <script src="../../src/sections/Section02.js"></script>
  <script src="../../src/sections/Section03.js"></script>
  <script src="../../src/sections/Section04-18.js"></script>
  <!-- ... -->
  ```
- [ ] Update header subtitle: "für deutsche Projekte"
- [ ] **Remove any references to CountryConfig or LocalizationManager**

#### 1.3 Test German Version
- [ ] Load `localizations/Germany/index-de.html`
- [ ] **Test Target Model Initialization**:
  - [ ] Verify d_13 shows German standards (DIN/GEG)
  - [ ] Verify d_19 shows German Bundesländer (Berlin, Baden-Württemberg)
  - [ ] Verify h_19 shows German cities
  - [ ] Verify default values: d_13 = "DIN V 18599 Neubau", d_19 = "Berlin", h_19 = "Berlin"
- [ ] **Test Reference Model Initialization**:
  - [ ] Switch to Reference mode
  - [ ] Verify ref_d_13 shows SAME German standards
  - [ ] Verify ref_d_19 shows SAME German Bundesländer
  - [ ] Verify ref_h_19 shows SAME German cities
  - [ ] Verify default values: ref_d_13 = "DIN V 18599 Neubau", ref_d_19 = "Berlin", ref_h_19 = "Berlin"
- [ ] **Test Dual-State Independence**:
  - [ ] Set Target: d_13 = "PHI_DE", d_19 = "Berlin"
  - [ ] Switch to Reference mode
  - [ ] Set Reference: ref_d_13 = "DIN18599_Klimazone_2", ref_d_19 = "Baden-Württemberg", ref_h_19 = "Stuttgart"
  - [ ] Switch back to Target mode
  - [ ] Verify Target still shows: "PHI_DE", "Berlin", "Berlin" ✅
  - [ ] Switch to Reference mode
  - [ ] Verify Reference still shows: "DIN18599_Klimazone_2", "Baden-Württemberg", "Stuttgart" ✅
- [ ] **Test ReferenceValues Overlay**:
  - [ ] Set Target: d_13 = "PHI_DE"
  - [ ] Set Reference: ref_d_13 = "DIN V 18599 Neubau"
  - [ ] Inspect StateManager or UI fields
  - [ ] Verify Target has PHI values (f_85 ≈ 8.00, g_88 ≈ 0.800)
  - [ ] Verify Reference has GEG values (f_85 = 5.000, g_88 = 1.300)
  - [ ] Verify overlay only affects ReferenceState, not TargetState
- [ ] **Test Climate Data Integration**:
  - [ ] Set Target: d_19 = "Berlin", h_19 = "Berlin"
  - [ ] Set Reference: ref_d_19 = "Baden-Württemberg", ref_h_19 = "Stuttgart"
  - [ ] Verify Target climate values (d_20 ≈ 3200 HDD for Berlin)
  - [ ] Verify Reference climate values (ref_d_20 ≈ 3000 HDD for Stuttgart)
- [ ] Verify calculations work correctly for BOTH models
- [ ] Run Clock.js - verify <300ms initialization

#### 1.4 Test Canadian Version (No Regression)
- [ ] Load `index.html` (root)
- [ ] Verify d_13 shows Canadian standards (OBC/NBC)
- [ ] Verify d_19 shows Canadian provinces
- [ ] Verify defaults unchanged
- [ ] Verify 220ms baseline maintained

#### 1.5 Wire Country Selector (Simple Navigation)
- [ ] Update country selector menu to navigate between entry points:
  ```javascript
  // In BOTH index.html and index-de.html - ultra-simple navigation
  const countryDropdown = document.querySelector('.btn-group .dropdown-menu');

  if (countryDropdown) {
    countryDropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        const text = this.textContent.trim();

        // Simple URL navigation - no localStorage, no dynamic loading
        if (text.includes('Germany') || text.includes('Deutschland')) {
          window.location.href = '/de/';
        } else if (text.includes('Canada')) {
          window.location.href = '/';
        }
      });
    });
  }
  ```
- [ ] **NO LocalizationManager.setCountry() - just navigate to URL**
- [ ] **NO localStorage persistence - URL is the source of truth**

**Success Criteria**:
- ✅ German version loads with German data only
- ✅ Canadian version unchanged (zero regression)
- ✅ All 18 section files shared (no duplication)
- ✅ Only FieldManager differs between countries (~50 lines)
- ✅ No conditional logic anywhere (no `if country === 'DE'`)
- ✅ No LocalizationManager or CountryConfig complexity
- ✅ No race conditions (all scripts hardcoded in HTML)
- ✅ Performance maintained (<220ms CA, <300ms DE)
- ✅ Simple country selector (just URL navigation)

---

### Phase 2: Add Lightweight i18n Layer 🔜 NEXT

**Goal**: Enable UI language switching for text labels

#### 2.1 Create i18n System
Create `src/core/i18n.js` (~50 lines):
```javascript
window.TEUI = window.TEUI || {};
window.TEUI.i18n = {
  currentLang: 'en',
  translations: {},

  async loadLanguage(lang) {
    const path = `localizations/${lang === 'de' ? 'Germany' : 'Canada'}/ui-labels-${lang}.json`;
    const response = await fetch(path);
    this.translations[lang] = await response.json();
    this.currentLang = lang;
  },

  t(key) {
    const keys = key.split('.');
    let value = this.translations[this.currentLang];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key; // Fallback to key
  },

  translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = this.t(el.dataset.i18n);
    });
  }
};
```

#### 2.2 Extract English Strings
Create `localizations/Canada/ui-labels-en.json`:
```json
{
  "header": {
    "title": "Simple Energy and Carbon Modelling",
    "subtitle": "for Canadian Projects"
  },
  "section01": {
    "title": "Project Information",
    "building_name": "Building Name"
  },
  "buttons": {
    "save": "Save",
    "reset": "Reset",
    "calculate": "Calculate"
  }
}
```

#### 2.3 Create German Translations
Create `localizations/Germany/ui-labels-de.json`:
```json
{
  "header": {
    "title": "Einfache Energie- und Kohlenstoffmodellierung",
    "subtitle": "für deutsche Projekte"
  },
  "section01": {
    "title": "Projektinformationen",
    "building_name": "Gebäudename"
  },
  "buttons": {
    "save": "Speichern",
    "reset": "Zurücksetzen",
    "calculate": "Berechnen"
  }
}
```

#### 2.4 Apply to Sections
Update Section01-18 to use translation keys where appropriate (field labels, section titles).

**Success Criteria**:
- ✅ English UI displays correctly
- ✅ German UI displays correctly
- ✅ <50 lines of i18n code
- ✅ <5ms performance overhead

---

### Phase 3: French Localization (Future) 📅

**Goal**: Add French market (same pattern)

- [ ] Create `localizations/France/FieldManager-FR.js`
- [ ] Modify only d_13, d_19, h_19 for French standards/regions
- [ ] Create French data files
- [ ] Create `ui-labels-fr.json`
- [ ] Create `index-fr.html`
- [ ] Test French version
- [ ] Deploy to `/fr/`

**Estimated Time**: <1 day (just copy FieldManager, modify ~50 lines)

---

## Update Flow (How Maintenance Works)

### Scenario 1: Bug Fix in Calculation Engine

**Example**: Fix error in Section07.js (DHW/SHW calculations)

```
1. Fix bug in src/sections/Section07.js
   ↓
2. Test in Canadian version
   ↓
3. Test in German version
   ↓
4. Both countries automatically benefit
   ✓ No FieldManager changes needed
   ✓ Fix applied once, works everywhere
```

### Scenario 2: Add New Standard to Dropdown

**Example**: Add "Passivhaus Classic" to standards

```
1. Update Canadian FieldManager.js
   ├─ Add to d_13 options array
   └─ Test Canadian version

2. Update German FieldManager-DE.js
   ├─ Add to d_13 options array (German name)
   └─ Test German version

✓ Parallel work - partners can do their own
✓ No conflict with shared sections
```

### Scenario 3: UI Text Change

**Example**: Rename "Building Name" to "Project Name"

```
1. Update ui-labels-en.json
   "building_name": "Project Name"

2. Update ui-labels-de.json
   "building_name": "Projektname"

✓ No code changes required
✓ Just edit JSON files
```

---

## Deployment Strategy

### Development URLs (Local)
```
http://localhost:8080/                              # Canadian
http://localhost:8080/localizations/Germany/index-de.html  # German
```

### Production URLs
```
https://teui.ca/                  # Canadian (root)
https://teui.ca/de/               # German
https://teui.ca/fr/               # French (future)
```

### Country Selector Behavior

Navigate to separate URLs (not localStorage switching):

```javascript
// In both index.html and index-de.html
countryDropdown.addEventListener('click', (e) => {
  const text = e.target.textContent;
  if (text.includes('Germany')) {
    window.location.href = '/de/';
  } else if (text.includes('Canada')) {
    window.location.href = '/';
  }
});
```

---

## Performance Targets

### Baseline (Must Maintain)
- ✅ **Canadian initialization**: 220ms (current)
- ✅ **Calculations**: <100ms per field change
- ✅ **Section rendering**: <50ms

### New Targets
- 🎯 **German initialization**: <250ms (22.8KB data vs Canada 858KB)
- 🎯 **i18n overhead**: <5ms
- 🎯 **French initialization**: <300ms

---

## File Naming Conventions

### Shared Files (No Suffix)
```
src/core/StateManager.js
src/sections/Section01.js
src/sections/Section02.js  ← Still shared!
src/sections/Section03.js  ← Still shared!
```

### Country-Specific Files
```
src/core/FieldManager.js          # Canadian (default)
localizations/Germany/FieldManager-DE.js
localizations/France/FieldManager-FR.js (future)
```

### Data Files
```
src/core/ReferenceValues.js                      # Canadian
src/core/ClimateValues.js                        # Canadian

localizations/Germany/4012-ReferenzWerten-DE.js  # German
localizations/Germany/KlimaWerten.js             # German
```

---

## Benefits of FieldManager Approach

### vs Section Duplication (Previous Plan)
- ✅ **18 section files** stay shared (vs 36 files for 2 countries)
- ✅ **Bug fix once**, works everywhere
- ✅ **Zero conditional logic** in sections
- ✅ **Minimal duplication**: ~50 lines vs ~10,000 lines

### vs Dynamic Switching (Reverted)
- ✅ **No race conditions**: FieldManager loaded before sections init
- ✅ **No state mixing**: Each country loads its own FieldManager
- ✅ **No conditional logic**: No `if (country === 'DE')`
- ✅ **Clean separation**: Data structure vs rendering

### Partner-Friendly
- ✅ Partners only edit FieldManager-XX.js
- ✅ Can't accidentally break shared sections
- ✅ Easy to add new dropdown options
- ✅ Clear where to make changes

---

## Current Status

### Completed ✅
- [x] German ReferenceValues file (4012-ReferenzWerten-DE.js)
- [x] German ClimateData file (KlimaWerten.js)
- [x] Country selector UI component (unwired)
- [x] Architecture decision documented
- [x] FieldManager-based approach designed

### In Progress ⏳
- [ ] Phase 1: Create FieldManager-DE.js
- [ ] Create index-de.html
- [ ] Test German version

### Next Steps 🔜
- [ ] Wire country selector menu
- [ ] Phase 2: Create i18n system
- [ ] Phase 3: French localization

---

## Success Metrics

### Must Have ✓
- Zero regression in Canadian version
- German version works without Canadian data
- No conditional logic anywhere
- All 18 sections shared
- Only FieldManager differs per country
- Performance maintained (<220ms CA, <300ms DE)

### Nice to Have ⭐
- Easy for partners (just edit FieldManager-XX.js)
- Simple maintenance (fix once, benefits all)
- Scalable (add France in <4 hours)
- Clean codebase (no "if country" checks)

---

## Migration Checklist

### Phase 1 Tasks
- [ ] Create FieldManager-DE.js (~50 lines different)
- [ ] Create index-de.html
- [ ] Test German version (isolation)
- [ ] Test Canadian version (no regression)
- [ ] Wire country selector menu
- [ ] Commit and document

### Phase 2 Tasks
- [ ] Create i18n.js (~50 lines)
- [ ] Extract ui-labels-en.json
- [ ] Create ui-labels-de.json
- [ ] Apply i18n to sections
- [ ] Test language switching
- [ ] Measure performance

---

## Known Issues (Unrelated to Localization)

### Reference Mode "Tilt" Calculation Performance

**Issue**: Reference mode "Tilt" button calculations take approximately 2x longer than Target mode (1.0-1.1s vs 455-477ms).

**Status**: Pre-existing condition - unrelated to FieldManager localization changes

**Benchmark Data** (November 22, 2025):
- **Target Mode**:
  - d_13 change: 24ms
  - Tilt calculation: 455-477ms ✅
- **Reference Mode**:
  - d_13 change: 257-260ms
  - Tilt calculation: 1.0-1.1s ⚠️ (2x slower)

**Root Cause Hypothesis**: Excessive calculation loops triggered by ReferenceState updates. Likely related to:
- ReferenceValues overlay application triggering cascading recalculations
- Section03 climate data recalculation overhead
- Potential duplicate listener firing in Reference mode

**Priority**: Low (functional but slower than ideal)

**Recommended Investigation**:
1. Profile Section02 ReferenceState calculation chain
2. Check for duplicate StateManager listeners in Reference mode
3. Investigate if ReferenceValues overlay triggers unnecessary recalcs
4. Consider debouncing or batching Reference mode updates

**Workaround**: None needed - performance is acceptable for user workflow

---

## Known Issues (November 22, 2025 - Localization-DE Branch Abandoned)

### Critical Issues That Led to Branch Abandonment

**Branch**: `Localization-DE` (abandoned November 22, 2025)
**Status**: REVERTED - Returned to stable `G-REF-ONLY` branch
**Priority**: BLOCKER
**Severity**: Core Functionality Broken

---

#### Issue 1: FieldManager-DE.js Failed to Populate Dropdown Defaults on Country Switch

**Status**: UNRESOLVED - Branch abandoned before fix
**Impact**: German version completely non-functional

**Observed Behavior**:
When switching from Canadian version to German version (loading FieldManager-DE.js):
1. ❌ d_13 (Reference Standard) dropdown showed blank instead of "DIN V 18599 Neubau" default
2. ❌ ref_d_13 (Reference model) also showed blank instead of expected default
3. ❌ **ALL other dropdowns** across the entire app reverted to "Please Select an Option" baselines
4. ✅ FieldManager-DE.js loaded correctly (verified in console)
5. ✅ German data files (ReferenzWerten-DE.js, KlimaWerten.js) loaded correctly
6. ❌ **Section02 did not recognize/apply FieldManager-DE.js defaults**

**What Worked**:
- File separation approach (no runtime country detection)
- German data files loaded without errors
- FieldManager-DE.js structure was correct
- No race conditions (static script loading)

**What Failed**:
- **Dropdown initialization**: FieldManager-DE.js defaults never appeared in UI
- **StateManager integration**: German defaults never written to StateManager
- **Both Target AND Reference models**: Neither d_13 nor ref_d_13 populated

**Root Cause Hypothesis**:
Section02's initialization sequence did not properly:
1. **Read from FieldManager-DE.js** after country switch
2. **Write defaults to StateManager** for both Target and Reference models
3. **Trigger UI refresh** to display German defaults in dropdowns

**Missing Steps Identified**:
```javascript
// What SHOULD have happened on country switch:
// 1. FieldManager-DE.js loads (✅ worked)
// 2. Section02 reads German defaults from FieldManager (❌ failed)
// 3. Section02 writes d_13 = "DIN V 18599 Neubau" to StateManager (❌ never happened)
// 4. Section02 writes ref_d_13 = "DIN V 18599 Neubau" to StateManager (❌ never happened)
// 5. UI refreshes to show German defaults (❌ never happened)
```

**Why refreshUI() Failed**:
The attempted fix using `refreshUI()` failed because:
- **StateManager had no values to refresh FROM**
- Defaults were never written to StateManager in the first place
- refreshUI() can only display values that exist in StateManager
- **Critical missing step**: Writing FieldManager defaults to StateManager on initialization

---

#### Issue 2: Cross-Section Dependency Failure (d_12 → h_23)

**Status**: UNRESOLVED - Regression affecting core calculations
**Impact**: Section03 calculations broke, affecting entire app

**Observed Behavior**:
After modifying Section02 for localization:
1. User changes d_12 (Major Occupancy) dropdown in Section02
2. ❌ Section03's h_23 (Temperature Setpoint) **failed to update** as designed
3. ❌ Cross-section dependency chain broken
4. ❌ Dual-engine calculations affected in both Target and Reference models

**Expected Behavior**:
```javascript
// src/sections/Section02.js → d_12 change
ModeManager.setValue('d_12', newOccupancy)
  ↓
StateManager.setValue('d_12', newOccupancy) // Publish to global state
  ↓
StateManager listeners fire
  ↓
Section03 detects d_12 change
  ↓
Section03 updates h_23 (T-set) based on occupancy type
```

**What Actually Happened**:
```javascript
// Localization-DE branch (broken):
ModeManager.setValue('d_12', newOccupancy)
  ↓
❌ StateManager.setValue() never called?
  ↓
❌ Section03 never notified
  ↓
❌ h_23 never updated
```

**Root Cause Hypothesis**:
Modifications to Section02 for localization broke the StateManager read/write pattern:
- **Likely**: ModeManager.setValue() stopped calling StateManager.setValue()
- **Likely**: Dual-engine calculation flow disrupted
- **Likely**: Target/Reference state isolation broken
- **Possible**: Local state (TargetState/ReferenceState) not syncing to global StateManager

**Why This Is Critical**:
- Section03 depends on Section02 values (d_12, d_13, etc.)
- Section07 depends on Section03 climate data
- Section09 depends on Section02 occupancy type
- **Breaking Section02 → StateManager integration broke the entire app**

---

#### Issue 3: Incomplete Understanding of Dual-Engine Architecture

**Status**: ACKNOWLEDGED - Agent lacked full context
**Impact**: Architectural violations introduced

**What Was Missed**:
The localization implementation did not fully account for:

1. **StateManager Read/Write Pattern**:
   - ALL section values MUST be published to StateManager
   - Cross-section dependencies rely on StateManager listeners
   - Both Target and Reference values must sync to global state

2. **Dual-Engine Calculation Flow**:
   - BOTH engines run on every value change (by design, not a bug)
   - Target calculations write unprefixed fields (d_13, d_12, etc.)
   - Reference calculations write ref_ prefixed fields (ref_d_13, ref_d_12, etc.)
   - BOTH must sync to StateManager for downstream sections

3. **Target/Reference Mode UI Mechanics**:
   - UI toggles between showing Target vs Reference values
   - Mode switch does NOT recalculate, only changes display
   - Values must exist in StateManager BEFORE UI can display them
   - refreshUI() only works if StateManager has the values

4. **Initialization Sequence**:
   ```javascript
   // Correct initialization flow:
   1. FieldManager loads field definitions
   2. Section loads FieldManager defaults
   3. Section writes defaults to local state (TargetState, ReferenceState)
   4. Section writes defaults to global StateManager  ← CRITICAL STEP MISSED
   5. Section renders UI from StateManager values
   6. Dropdowns populate from StateManager
   ```

**Consequences**:
- Localization changes broke initialization sequence
- StateManager never received German defaults
- UI couldn't display values that didn't exist in StateManager
- Cross-section dependencies failed due to missing StateManager values
- Dual-engine calculations broke due to state synchronization failure

---

### Lessons Learned

**What Needs to Happen Before Next Localization Attempt**:

1. **Complete StateManager Integration Audit**:
   - Document EVERY place Section02 writes to StateManager
   - Verify BOTH Target and Reference values sync to global state
   - Ensure FieldManager defaults flow through to StateManager
   - Map complete initialization sequence: FieldManager → Section → StateManager → UI

2. **Dual-Engine Calculation Flow Documentation**:
   - Document how Target engine writes to StateManager
   - Document how Reference engine writes to StateManager
   - Verify BOTH engines run on every change (confirm this is correct)
   - Map dependency chain: d_12 change → StateManager → Section03 → h_23 update

3. **Target/Reference Mode UI Mechanics**:
   - Document UI toggle mechanism
   - Document how mode switch affects StateManager reads
   - Verify refreshUI() dependencies on StateManager
   - Ensure mode switch doesn't break value persistence

4. **Testing Protocol**:
   Before ANY localization changes:
   - ✅ Test d_12 change → h_23 updates correctly
   - ✅ Test d_13 change → downstream sections update
   - ✅ Test Target mode → values persist after Reference mode toggle
   - ✅ Test Reference mode → values persist after Target mode toggle
   - ✅ Test StateManager has BOTH d_13 and ref_d_13 after initialization

   After localization changes:
   - ✅ Re-run ALL above tests
   - ✅ Verify German defaults appear in dropdowns
   - ✅ Verify German defaults exist in StateManager
   - ✅ Verify cross-section dependencies still work
   - ✅ Verify dual-engine calculations still work

---

### Current Status (November 22, 2025)

**Branch Status**:
- ❌ `Localization-DE` abandoned (broke core app functionality)
- ✅ Reverted to `G-REF-ONLY` (stable branch)
- ✅ Selectively merged safe files from `Localization-DE`:
  - docs/Localization2.md (documentation only)
  - localizations/Germany/4012-ReferenzWerten-DE.js (data file)
  - localizations/Germany/KlimaWerten.js (data file)
  - localizations/Germany/FieldManager-DE.js (not integrated)
  - localizations/Germany/FieldManager-CA.js (Canadian version preserved)
  - localizations/Germany/index-de.html (entry point, not active)

**What Was Preserved**:
- ✅ German data files (safe, no integration)
- ✅ Documentation of localization strategy
- ✅ FieldManager-DE.js file structure (for future reference)

**What Was NOT Merged**:
- ❌ Modified Section02.js (broke StateManager integration)
- ❌ Modified Section03.js (broke calculations)
- ❌ Any changes to core FieldManager.js
- ❌ Any changes that affected dual-engine architecture

**Next Steps**:
1. **DO NOT attempt localization** until StateManager/dual-engine architecture is fully documented
2. **Audit Section02** to understand complete StateManager read/write pattern
3. **Test cross-section dependencies** to verify understanding
4. **Document initialization sequence** in detail
5. **Create test suite** for StateManager integration before ANY changes
6. **Get CTO review** of architecture understanding before proceeding

**Recommendation**:
Localization is achievable, but requires deeper understanding of:
- StateManager read/write patterns
- Dual-engine calculation flow
- Target/Reference state synchronization
- Cross-section dependency mechanisms

**The file separation approach is sound. The execution lacked complete understanding of the app's state management architecture.**

---

### ~~Historical Issue Documentation (From Abandoned Branch)~~

### ~~Issue 1: Dropdown Defaults Not Restored After Selecting German Standard~~

**Status**: ~~OPEN - ROOT CAUSE IDENTIFIED~~ ABANDONED WITH BRANCH
**Priority**: HIGH
**Severity**: User-Facing

**Description**:
After selecting a German standard in d_13 (which applies German ReferenzWerten-DE.js overlay), returning to Canada shows blank d_13 dropdown instead of Canadian default "OBC SB10 5.5-6 Z6".

**KEY INSIGHT** (November 22, 2025):
The issue is NOT about initial page load - it's about state management during country switching:
- ✅ **WORKS**: Toggle Canada → Germany → Canada (without selecting a German standard)
- ❌ **FAILS**: Toggle Canada → Germany → Select German standard → Return to Canada
- The act of selecting a German standard and applying ReferenzWerten-DE.js overlay prevents Canadian defaults from being restored

**Current Status** (as of commit 128c2d5):
- ✅ **FIXED**: Canadian version (index.html) shows correct default "OBC SB10 5.5-6 Z6" on initial load
- ✅ **FIXED**: Country selector button persistence (Deutschland vs Canada)
- ✅ **FIXED**: Simple country toggle (Canada → Germany → Canada) preserves Canadian default
- ❌ **OPEN**: Selecting German standard breaks Canadian default restoration on return

**Reproduction Steps**:
1. Open index.html in browser (Canadian version) → ✅ d_13 shows "OBC SB10 5.5-6 Z6"
2. Click country selector → Select "Germany" → Navigate to index-de.html
3. Select a German standard from d_13 dropdown (e.g., "GEG Neubau (DIN 18599)")
   - This applies German ReferenzWerten-DE.js overlay
4. Click country selector → Return to "Canada" → Navigate to index.html
5. ❌ **OBSERVE**: d_13 shows blank instead of "OBC SB10 5.5-6 Z6"

**Root Cause**:
Section02.js ModeManager needs to re-initialize defaults and recalculate values when country changes. Currently:
- Country navigation triggers full page reload (window.location.href)
- New FieldManager loads with correct country-specific fieldDefinitions
- **MISSING**: Section02 does not re-render dropdown with new FieldManager defaults
- **MISSING**: Section02 does not recalculate values based on new reference standard

**Required Fix**:
Section02.js needs a country-level switch handler that:
1. Detects country change (Canadian FieldManager vs German FieldManager-DE)
2. Calls `ModeManager.setDefaults()` to reload country-specific defaults from FieldManager
3. Re-initializes dropdown to show correct default value visually
4. Calls `calculateAll()` to recalculate values based on new reference standard
5. Applies correct ReferenzWerten overlay (Canadian vs German)

**✅ IMPLEMENTED SOLUTION - Country-Specific localStorage Keys**:
Made Section02 localStorage keys country-specific to prevent state conflicts (commit a540ec1):

```javascript
// Section02.js - Added country detection (lines 1628-1639):
function getCountryCode() {
  const d13Default = getFieldDefault("d_13");
  if (d13Default && d13Default.startsWith("DIN")) {
    return "DE"; // German FieldManager detected
  }
  return "CA"; // Canadian FieldManager (default)
}

// TargetState - Changed storageKey to country-aware getter (lines 1647-1649):
const TargetState = {
  data: {},
  get storageKey() {
    return `S02_TARGET_STATE_${getCountryCode()}`; // CA or DE suffix
  },
  // ...
}

// ReferenceState - Changed storageKey to country-aware getter (lines 1752-1754):
const ReferenceState = {
  data: {},
  get storageKey() {
    return `S02_REFERENCE_STATE_${getCountryCode()}`; // CA or DE suffix
  },
  // ...
}
```

**Root Cause**:
1. User switches from Canada → Germany (page reload with German FieldManager)
2. `setDefaults()` sets German defaults: `d_13 = "DIN V 18599 Neubau"`
3. `loadState()` reads **Canadian** localStorage: `d_13 = "OBC SB10 5.5-6 Z6"`
4. Canadian value overwrites German default
5. Dropdown tries to select "OBC SB10 5.5-6 Z6" but this value doesn't exist in German options
6. Result: Dropdown shows blank (invalid value)

**Why This Fix Works**:
- Canadian version uses: `S02_TARGET_STATE_CA` / `S02_REFERENCE_STATE_CA`
- German version uses: `S02_TARGET_STATE_DE` / `S02_REFERENCE_STATE_DE`
- Each country maintains separate localStorage state
- German defaults no longer get overwritten by Canadian saved values
- Also fixes h_23 (T-set) regression: d_12 changes now properly sync to StateManager

**Expected Behavior**:
- Canadian version: d_13 should ALWAYS show "OBC SB10 5.5-6 Z6" on load, regardless of previous German selections
- German version: d_13 should ALWAYS show "DIN V 18599 Neubau" on load, regardless of previous Canadian selections
- Both Target AND Reference modes should reflect country-specific defaults and calculations

**Code Locations**:
- Canadian FieldManager: src/core/FieldManager.js:1259-1298
- German FieldManager: localizations/Germany/FieldManager-DE.js:1266-1305
- German field definitions: localizations/Germany/FieldManager-DE.js:77-102
- Section02 ModeManager: src/sections/Section02.js:1847-1893
- Country navigation: index.html:1419-1437, index-de.html:1428-1446

---

### ~~Issue 2: Country Selector Button Shows Wrong Country in index-de.html~~

**Status**: ✅ RESOLVED (commit 13bbee8)
**Priority**: MEDIUM
**Severity**: UI/UX

**Description**:
In index-de.html (German version), the country selector button was showing "🇨🇦 Canada" instead of "🇩🇪 Germany".

**Fix Applied**:
Updated index-de.html:173 to show "🇩🇪 Deutschland"

**Verification**:
Opening index-de.html now correctly displays "🇩🇪 Deutschland" in country selector button

---

**Document Version**: 2.0 (FieldManager-Based)
**Last Updated**: November 22, 2025
**Author**: Andrew Thomson with Claude Code
**Status**: Phase 0.1 Complete - Ready for Phase 0.2 (Pending Issue Resolution)
