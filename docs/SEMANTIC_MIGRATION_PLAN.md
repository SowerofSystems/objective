# Migration Plan: Legacy IDs to Semantic Paths

## Goal
Replace meaningless spreadsheet references (m_129, d_117, k_71) with semantic paths (energy.ced.mitigated, mechanical.cooling.electricalDemand, internal.coolingLoad.occupants).

## User Requirements
- **Import**: Auto-detect format (legacy or semantic), translate legacy on load
- **Export**: Semantic paths (new format)
- **Backwards compatible**: Old CSV files still work

## Architecture Decision
**Option B**: MultiModelState becomes primary state system. StateManager becomes adapter during transition, then deprecated.

---

## Phase 1: Complete FieldRegistry Mappings

**Goal**: Every field has a semantic path mapping.

### Files to modify:
- `src/core/computation/FieldRegistry.js`

### Tasks:
1. Audit all field IDs used in Section*.js files
2. Add missing mappings to INITIAL_FIELDS array
3. Target: ~320 complete field mappings

### Naming convention:
```
domain.category.field

Domains: building, climate, geometry, envelope, mechanical, energy,
         internal, ventilation, transmissionLoss, radiantGains, emissions, keyValues

Examples:
- m_129 → energy.ced.mitigated
- d_117 → mechanical.cooling.electricalDemand
- k_71  → internal.coolingLoad.occupants
- h_15  → building.conditionedFloorArea
- d_127 → energy.ted.total
```

### Verification:
```javascript
FieldRegistry.getAllFields().length >= 320
```

---

## Phase 2: StateManager Adapter

**Goal**: Intercept StateManager calls, route through MultiModelState.

### Files to modify:
- `src/core/computation/LegacyAdapter.js`
- `src/core/StateManager.js` (wrap, don't rewrite)

### Implementation:
```javascript
// Wrap StateManager methods to route through semantic system
const originalGetValue = StateManager.getValue;
StateManager.getValue = function(fieldId) {
  const semantic = FieldRegistry.toSemantic(fieldId);
  if (semantic && MultiModelState) {
    return MultiModelState.getValue(semantic);
  }
  return originalGetValue.call(this, fieldId);
};
```

### Dual-write during transition:
- Writes go to MultiModelState (primary)
- Also sync to legacy StateManager (for unmigrated code)

### Verification:
- Existing tests pass unchanged
- ComputationGraph validation: 12/12 case studies

---

## Phase 3: CSV Import/Export

**Goal**: Import old files, export semantic format.

### Files to modify:
- `src/core/FileHandler.js`

### Import (auto-detect):
```javascript
function processCSV(data) {
  const firstHeader = headers[0];
  const isSemanticFormat = firstHeader.includes('.');

  if (isSemanticFormat) {
    return importSemanticCSV(data);
  } else {
    // Translate legacy → semantic on load
    return importLegacyCSV(data);
  }
}
```

### Export (semantic):
```javascript
function exportCSV() {
  const headers = fields.map(f => f.semanticPath);
  // e.g., "building.conditionedFloorArea", "energy.ted.total"
}
```

### Verification:
- Round-trip test: export → import → values match
- Import old CSV file → values load correctly

---

## Phase 4: DOM Elements

**Goal**: data-field-id uses semantic paths.

### Files to modify:
- `src/core/ui/DOMBridge.js`
- Section*.js files (html generation)

### Transition approach:
```html
<!-- During transition: both attributes -->
<input data-field-id="d_85" data-semantic="envelope.roof.rsiValue">

<!-- Final: semantic only -->
<input data-field-id="envelope.roof.rsiValue">
```

### DOMBridge enhancement:
```javascript
function getFieldPath(element) {
  // Prefer semantic
  return element.dataset.semantic ||
         FieldRegistry.toSemantic(element.dataset.fieldId) ||
         element.dataset.fieldId;
}
```

---

## Phase 5: Section Migration (Incremental)

**Goal**: Migrate Section*.js files one at a time.

### Order (simplest first):
1. Section06 (14 calls) - Renewable
2. Section08 (9 calls) - Air Quality
3. Section07 (34 calls) - DHW
4. Section14/15 (11 calls) - TEDI/TEUI summaries
5. Section09 (44 calls) - Internal Gains
6. Section10 (27 calls) - Radiant Gains
7. Section11 (47 calls) - Transmission Loss
8. Section02/03 (51 calls) - Building/Climate
9. Section04/05 (72 calls) - Energy/Emissions
10. Section12 (65 calls) - Volume Metrics
11. Section13 (61 calls) - Mechanical (most complex)
12. Section01 (28 calls) - Key Values (last, aggregates others)

### Per-section pattern:
```javascript
// BEFORE
const value = StateManager.getValue('m_129');

// AFTER (adapter handles translation - no code change needed initially!)
// Then migrate to direct semantic:
const value = MultiModelState.getValue('energy.ced.mitigated');
```

---

## Phase 6: Cleanup

**Goal**: Remove legacy dependencies.

### Tasks:
1. Disable dual-write mode
2. Remove StateManager wrapper
3. Update all DOM to semantic-only
4. Remove FieldRegistry legacy→semantic maps (no longer needed)

---

## Critical Files

| File | Role | Phase |
|------|------|-------|
| `src/core/computation/FieldRegistry.js` | Complete mappings | 1 |
| `src/core/computation/LegacyAdapter.js` | StateManager wrapper | 2 |
| `src/core/FileHandler.js` | CSV import/export | 3 |
| `src/core/ui/DOMBridge.js` | DOM binding | 4 |
| `src/sections/Section*.js` | Migrate 19 files | 5 |

---

## Verification

### After each phase:
1. `npm test` - all tests pass
2. Load app - no console errors
3. Import old CSV - values correct
4. Export CSV - semantic headers
5. ComputationGraph validation - 12/12 case studies

### Final verification:
- TEDI/TEUI calculations match reference
- Reference mode toggle works
- CSV round-trip preserves all values
- No legacy IDs in codebase (grep confirms)

---

## First Step

Start with **Phase 1**: Audit and complete FieldRegistry mappings. This is the foundation - nothing else works without complete mappings.

```bash
# Find all field IDs in sections
grep -rh "getValue\|setValue" src/sections/*.js | grep -oE "'[a-z]_[0-9]+'" | sort -u
```
