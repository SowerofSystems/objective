# Localization Strategy & Implementation Plan

## Overview

This document outlines the comprehensive strategy for internationalizing the TEUI 4.0 application to support multiple countries, languages, and regional building standards. The initial implementation focuses on Germany (DE) as a pilot, with a scalable structure for future expansions.

## Guiding Principles

1. **Separation of Concerns**: Localization data is isolated from core application logic
2. **Scalability**: Structure supports easy addition of new countries/regions
3. **Minimal Code Changes**: Core application code remains language-agnostic
4. **Progressive Enhancement**: Features can be added incrementally without breaking existing functionality
5. **Developer Experience**: Clear organization makes it easy for international partners to contribute

---

## Architecture Components

### A. Directory Structure

```
localizations/
├── Germany/
│   ├── 4012-ReferenzWerten-DE.js    # Building standards data
│   ├── KlimaWerten.js                # Climate/weather data
│   ├── ui-labels-de.json             # UI text translations
│   ├── regions-de.json               # German states/regions
│   └── assets/
│       └── flag-de.svg               # Country flag icon
├── Canada/
│   ├── ReferenceValues.js            # Canadian standards (existing)
│   ├── ClimateValues.js              # Canadian climate data (existing)
│   ├── ui-labels-en.json             # English UI labels
│   ├── regions-en.json               # Canadian provinces
│   └── assets/
│       └── flag-ca.svg
└── [Future Countries]/
```

### B. Country-Level Weather/Climate Files

**Purpose**: Provide region-specific climate data for energy calculations

**Implementation**:
- Each country has a `KlimaWerten.js` (or equivalent) file
- Structure mirrors existing `ClimateValues.js` format
- Contains nested hierarchy: Country → Region/State → City
- All field IDs remain consistent across countries for calculation compatibility

**Example Structure** (Germany):
```javascript
window.TEUI.ClimateData = {
  "Baden-Württemberg": {
    Stuttgart: { /* climate data */ },
    Freiburg: { /* climate data */ }
  },
  Berlin: {
    Berlin: { /* climate data */ }
  }
}
```

**Status**: ✅ Completed for Germany (Stuttgart, Berlin)

---

### C. Country-Level Reference Values

**Purpose**: Define building code standards and requirements per country

**Implementation**:
- Each country has a reference values file (e.g., `4012-ReferenzWerten-DE.js`)
- Contains multiple standards within each country (e.g., DIN18599, GEG, PHI for Germany)
- Field IDs match the application's DOM structure
- Comments are in the local language for partner review
- Helper functions provide consistent API

**Example Standards** (Germany):
```javascript
TEUI.ReferenceValues = {
  "DIN18599_Klimazone_1": { /* standards */ },
  "DIN18599_Klimazone_2": { /* standards */ },
  "DIN18599_Klimazone_3": { /* standards */ },
  "DIN V 18599 Neubau": { /* standards */ },
  "DIN V 18599 Sanierung_Bestand": { /* standards */ },
  "PHI_DE": { /* standards */ }
}
```

**Status**: ✅ Completed for Germany with comprehensive German comments

---

### D. Index.html Module Loading Strategy

**Current State**: `index.html` loads core Canadian files:
```html
<script src="src/core/ReferenceValues.js"></script>
<script src="src/core/ClimateValues.js"></script>
```

**Proposed Strategy**: Dynamic loading based on selected country

**Option 1: Conditional Script Loading**
```html
<!-- Country detection/selection -->
<script src="src/core/LocalizationManager.js"></script>

<!-- Dynamically loaded based on country -->
<script id="reference-values-script"></script>
<script id="climate-values-script"></script>
```

**Option 2: Module Bundler Approach**
- Create a `LocalizationLoader.js` that imports appropriate modules
- Use ES6 dynamic imports: `import('./localizations/Germany/KlimaWerten.js')`

**Option 3: Country Configuration Object** (Recommended)
```javascript
// src/core/CountryConfig.js
window.TEUI.Countries = {
  CA: {
    name: "Canada",
    referenceValuesPath: "src/core/ReferenceValues.js",
    climateValuesPath: "src/core/ClimateValues.js",
    uiLabelsPath: "localizations/Canada/ui-labels-en.json",
    regionsPath: "localizations/Canada/regions-en.json",
    flagPath: "localizations/Canada/assets/flag-ca.svg",
    defaultLanguage: "en"
  },
  DE: {
    name: "Deutschland",
    referenceValuesPath: "localizations/Germany/4012-ReferenzWerten-DE.js",
    climateValuesPath: "localizations/Germany/KlimaWerten.js",
    uiLabelsPath: "localizations/Germany/ui-labels-de.json",
    regionsPath: "localizations/Germany/regions-de.json",
    flagPath: "localizations/Germany/assets/flag-de.svg",
    defaultLanguage: "de"
  }
}
```

**Status**: 🔲 To be implemented

---

### E. Country Selection UI

**Location**: Header/Navigation area of `index.html`

**Design**:
```html
<div id="country-selector" class="country-selector">
  <button class="country-flag-btn active" data-country="CA">
    <img src="localizations/Canada/assets/flag-ca.svg" alt="Canada" />
  </button>
  <button class="country-flag-btn" data-country="DE">
    <img src="localizations/Germany/assets/flag-de.svg" alt="Germany" />
  </button>
  <!-- Future countries -->
</div>
```

**Behavior**:
1. User clicks country flag
2. LocalizationManager loads appropriate files
3. Application reinitializes with new data
4. Selection persisted in localStorage
5. Page shows appropriate language/standards

**Integration with Section03.js**:
- Country selection triggers update of region/province dropdown
- City dropdown populates based on selected country's regions
- Existing dropdown logic remains, but data source changes

**Status**: 🔲 To be implemented

---

### F. UI Language Translation System

**Scope**:
- ✅ Labels, tooltips, help text
- ✅ Dropdown options (where appropriate)
- ✅ Error messages
- ✅ Button text
- ❌ Code/logic (remains English)
- ❌ Comments in ReferenceValues/ClimateValues (local language for partners)

**File Structure**: JSON-based translation files
```json
// localizations/Germany/ui-labels-de.json
{
  "nav": {
    "project": "Projekt",
    "envelope": "Gebäudehülle",
    "systems": "Systeme",
    "performance": "Leistung"
  },
  "section03": {
    "climate": {
      "title": "Klimastandort",
      "region_label": "Bundesland",
      "region_placeholder": "Bundesland auswählen...",
      "city_label": "Stadt",
      "city_placeholder": "Stadt auswählen...",
      "hdd_label": "Heizgradtage (HDD18)",
      "design_temp_label": "Auslegungstemperatur"
    }
  },
  "tooltips": {
    "hdd18": "Heizgradtage Basis 18°C für Heizlastberechnungen"
  },
  "buttons": {
    "save": "Speichern",
    "cancel": "Abbrechen",
    "reset": "Zurücksetzen"
  },
  "errors": {
    "required_field": "Dieses Feld ist erforderlich",
    "invalid_value": "Ungültiger Wert"
  }
}
```

**Implementation Approach**:

**Option 1: Simple Lookup Function**
```javascript
// src/core/i18n.js
const i18n = {
  currentLanguage: 'en',
  translations: {},

  async loadLanguage(lang) {
    const response = await fetch(`localizations/${lang}/ui-labels-${lang}.json`);
    this.translations[lang] = await response.json();
    this.currentLanguage = lang;
  },

  t(key) {
    const keys = key.split('.');
    let value = this.translations[this.currentLanguage];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  }
};

// Usage
document.getElementById('saveBtn').textContent = i18n.t('buttons.save');
```

**Option 2: Data Attributes** (Recommended for HTML-heavy sections)
```html
<label data-i18n="section03.climate.region_label">Region</label>
<button data-i18n="buttons.save">Save</button>

<script>
function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = i18n.t(el.dataset.i18n);
  });
}
</script>
```

**Status**: 🔲 To be implemented

---

### G. Region/Province and City Dropdown Integration

**Current Implementation** (Section03.js):
- Hardcoded Canadian provinces
- City dropdown populated from ClimateValues.js

**New Implementation**:

**1. Regions Configuration File**
```json
// localizations/Germany/regions-de.json
{
  "regions": [
    {
      "id": "BW",
      "name": "Baden-Württemberg",
      "cities": ["Stuttgart", "Freiburg", "Heidelberg"]
    },
    {
      "id": "BY",
      "name": "Bayern",
      "cities": ["München", "Nürnberg", "Augsburg"]
    },
    {
      "id": "BE",
      "name": "Berlin",
      "cities": ["Berlin"]
    }
  ]
}
```

**2. Updated Section03.js Logic**
```javascript
class ClimateSelector {
  constructor() {
    this.currentCountry = 'CA';
    this.regions = [];
  }

  async loadCountryData(countryCode) {
    this.currentCountry = countryCode;
    const config = window.TEUI.Countries[countryCode];

    // Load regions
    const response = await fetch(config.regionsPath);
    this.regions = await response.json();

    // Rebuild region dropdown
    this.populateRegionDropdown();
  }

  populateRegionDropdown() {
    const regionSelect = document.getElementById('region-select');
    regionSelect.innerHTML = '<option value="">Select Region...</option>';

    this.regions.regions.forEach(region => {
      const option = document.createElement('option');
      option.value = region.id;
      option.textContent = region.name;
      regionSelect.appendChild(option);
    });
  }

  populateCityDropdown(regionId) {
    const region = this.regions.regions.find(r => r.id === regionId);
    const citySelect = document.getElementById('city-select');
    citySelect.innerHTML = '<option value="">Select City...</option>';

    if (region) {
      region.cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
      });
    }
  }

  getClimateData(regionName, cityName) {
    // Access the currently loaded climate data
    return window.TEUI.ClimateData[regionName]?.[cityName];
  }
}
```

**Benefits**:
- Existing Section03.js dropdown logic mostly preserved
- Data source becomes dynamic based on country
- Easy to add new countries by adding region configuration files

**Status**: 🔲 To be implemented

---

## Implementation Phases

### Phase 1: Foundation (Germany Pilot) ✅ COMPLETED
- [x] Create localization folder structure
- [x] Develop Germany reference values with German comments
- [x] Create German climate data file (Stuttgart, Berlin)
- [x] Establish file naming conventions
- [x] Document structure in this workplan

### Phase 2: Core Infrastructure 🔄 IN PROGRESS
**Priority**: High
**Timeline**: 2-3 weeks

- [ ] Create `LocalizationManager.js` core module
- [ ] Implement `CountryConfig.js` with CA and DE configs
- [ ] Build dynamic script loading system
- [ ] Create i18n translation system
- [ ] Develop country flag selector UI component
- [ ] Test with Germany data

**Deliverables**:
- Working country switcher
- German data successfully loads
- UI elements in German when DE selected

### Phase 3: UI Translation System
**Priority**: Medium
**Timeline**: 2 weeks

- [ ] Create English UI labels baseline (`ui-labels-en.json`)
- [ ] Create German UI labels (`ui-labels-de.json`)
- [ ] Implement translation lookup functions
- [ ] Apply data-i18n attributes to HTML
- [ ] Add translation support to Section03.js
- [ ] Create translation guide for contributors

**Deliverables**:
- Complete English and German UI translations
- Automated translation application system
- Documentation for adding new languages

### Phase 4: Dropdown Integration
**Priority**: High
**Timeline**: 1 week

- [ ] Create region configuration files (CA, DE)
- [ ] Refactor Section03.js dropdown logic
- [ ] Implement dynamic region/city loading
- [ ] Connect to climate data properly
- [ ] Add error handling for missing data
- [ ] Test region → city → climate data flow

**Deliverables**:
- Dynamic dropdowns working for both countries
- Climate data properly loaded based on selections
- Smooth switching between countries

### Phase 5: Testing & Refinement
**Priority**: High
**Timeline**: 1 week

- [ ] End-to-end testing with both countries
- [ ] Performance optimization (lazy loading)
- [ ] Browser compatibility testing
- [ ] Accessibility audit (WCAG compliance)
- [ ] User testing with German partners
- [ ] Documentation updates

**Deliverables**:
- Tested, production-ready localization system
- Performance benchmarks
- Partner feedback incorporated

### Phase 6: Additional Countries (Future)
**Priority**: Low
**Timeline**: Per-country basis

Template for adding new countries:
1. Create country folder in `localizations/`
2. Add reference values file
3. Add climate values file
4. Create regions configuration
5. Translate UI labels
6. Add flag asset
7. Update `CountryConfig.js`
8. Test integration

---

## Data Standards

### Field ID Consistency
All localization files must use the same field IDs to ensure calculations work across countries:

```javascript
// These IDs must match across all countries
{
  h_23: "20",      // Heating setpoint temperature
  d_52: "100",     // DHW system efficiency electric
  k_52: "92",      // DHW AFUE gas/oil
  f_85: "5.000",   // Roof RSI value
  // ... etc
}
```

### Comment Language Policy
- **Code/Logic**: English only (universal)
- **ReferenceValues comments**: Local language (for partner review/validation)
- **ClimateValues comments**: Local language (for partner review/validation)
- **UI Labels**: Local language (for end users)

### Climate Data Requirements
Each city entry must include at minimum:
- Location name
- Elevation (m)
- Design temperatures (heating/cooling)
- Heating degree days (HDD18, HDD15)
- Cooling degree days (CDD24)
- Precipitation data
- Wind data
- Average temperatures

---

## Technical Considerations

### Performance
- **Lazy Loading**: Only load data for selected country
- **Caching**: Use localStorage to cache loaded translations
- **Minification**: Compress localization files for production
- **CDN**: Consider CDN hosting for flag assets

### Browser Support
- ES6 modules for dynamic imports
- Fallback for older browsers (polyfills)
- Test on IE11 if required (consider graceful degradation)

### State Management
- Track current country in application state
- Persist country selection across sessions
- Handle country switching without full page reload
- Clear/reset calculation state when switching countries

### Error Handling
- Graceful fallback to English if translation missing
- Error messages if country data fails to load
- Validation that required fields exist in loaded data
- Console warnings for development/debugging

---

## Migration Path from Current System

### Existing Canadian Data
1. Move `src/core/ReferenceValues.js` → `localizations/Canada/ReferenceValues.js`
2. Move `src/core/ClimateValues.js` → `localizations/Canada/ClimateValues.js`
3. Create `ui-labels-en.json` from existing English text
4. Create `regions-en.json` from hardcoded province data
5. Update `index.html` to use LocalizationManager
6. Test that existing functionality unchanged

### Backward Compatibility
- Default to Canada if no country selected
- Maintain all existing Canadian functionality
- Ensure calculations produce identical results
- Keep existing URL structure/routing

---

## Collaboration with International Partners

### Contribution Workflow
1. Partner receives localization template folder
2. Partner populates reference values (in local language)
3. Partner provides climate data for major cities
4. Partner translates UI labels
5. Partner reviews and validates integration
6. Pull request submitted to Localization-[COUNTRY] branch
7. Testing and QA
8. Merge to main when approved

### Documentation for Partners
Provide partners with:
- This workplan document
- Field ID reference guide
- Climate data requirements specification
- UI translation template
- Example (Germany) as reference
- Setup instructions for local testing

---

## Future Enhancements

### Advanced Features (Post-MVP)
- [ ] Multi-language support within single country (e.g., EN and FR for Canada)
- [ ] User-preferred language separate from country
- [ ] Regional standards within countries (e.g., California Title 24 for US)
- [ ] Automatic currency conversion for cost calculations
- [ ] Unit system switching (Imperial/Metric) separate from country
- [ ] Climate zone auto-detection based on geolocation
- [ ] Crowdsourced climate data contributions
- [ ] API for third-party integrations

### Potential Integrations
- Weather API services for real-time data
- Building code databases (ICC, BSI, etc.)
- Energy modeling tools (EnergyPlus, PHPP)
- Government data portals (DWD, NOAA, etc.)

---

## Success Metrics

### Phase 2 Completion Criteria
- [ ] User can switch between Canada and Germany
- [ ] All dropdowns populate correctly
- [ ] Calculations use correct country data
- [ ] UI text displays in appropriate language
- [ ] No breaking changes to existing Canadian functionality

### Long-term Goals
- Support 5+ countries within 12 months
- Partner-contributed localization files
- Community translation contributions
- 95%+ translation coverage for major languages
- <200ms country switching time

---

## Maintenance & Support

### Ongoing Responsibilities
- Keep reference values updated with code changes
- Add new cities/regions as requested
- Update translations when UI changes
- Monitor for data quality issues
- Review and merge partner contributions

### Version Control
- Localization files versioned with application
- Breaking changes documented in changelog
- Migration guides for major updates
- Backward compatibility for at least 2 major versions

---

## Appendix

### A. Germany Climate Zones (DIN 18599)
- **Klimazone 1**: Mild coastal and Rhine-Main region (Hamburg, Bremen, Düsseldorf, Köln)
- **Klimazone 2**: Moderate continental (Berlin, Frankfurt, Leipzig, Nürnberg)
- **Klimazone 3**: Cold upland/alpine (Oberpfalz, Schwarzwald, Alps)

### B. Germany Building Standards
- **GEG** (Gebäudeenergiegesetz): National building energy law
- **DIN V 18599**: Energy efficiency calculation standard
  - Neubau: New construction
  - Sanierung: Renovation/existing buildings
- **PHI**: Passivhaus Institut standards
  - Classic, Plus, Premium tiers

### C. Useful Resources
- DWD (Deutscher Wetterdienst): https://www.dwd.de/
- PHI Climate Data: https://passiv.de/
- GEG Text: https://www.gesetze-im-internet.de/geg/
- DIN Standards: https://www.din.de/

---

**Document Version**: 1.0
**Last Updated**: 2025-01-21
**Author**: Andrew Thomson with Claude Code
**Status**: Living Document - Update as implementation progresses
