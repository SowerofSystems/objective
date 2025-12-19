# S19 Defaults Cleanup - DRY Violation Workplan

**Date**: 2025-12-18
**Issue**: Default values duplicated across 3+ locations in Section19.js
**Priority**: Medium - Code quality/maintainability issue
**Pattern**: Should follow CHEATSHEET.md Pattern A (single source of truth)

---

## Current Problem: Triple (or Quadruple) Defaults

S19 currently defines the same default values in **MULTIPLE locations**:

### 1. TargetState.values (Line 43-50)
```javascript
const TargetState = {
  values: {
    d_150: "1",        // Stories
    d_151: "8319.50",  // Volume
    d_154: "0.0",      // Aspect ratio
    d_158: "mezzanine", // Floorplate options
    d_159: "biplanar",  // Roof type
    // ...
  }
}
```

### 2. TargetState.setDefaults() (Line 62-68)
```javascript
setDefaults: function () {
  this.values.d_150 = "1.0";  // ❌ DUPLICATE! (also "1" vs "1.0" inconsistency)
  this.values.d_151 = "8319.50";
  this.values.d_154 = "0.0";
  this.values.d_158 = "mezzanine";
  this.values.d_159 = "biplanar";
}
```

### 3. ReferenceState.values (Line 103-110)
```javascript
const ReferenceState = {
  values: {
    d_150: "1.0",      // Stories
    d_151: "8319.50",  // Volume
    d_154: "0.0",      // Aspect ratio
    d_158: "mezzanine", // Floorplate options
    d_159: "biplanar",  // Roof type
    // ...
  }
}
```

### 4. ReferenceState.setDefaults() (Line 122-128)
```javascript
setDefaults: function () {
  this.values.d_150 = "1.0";  // ❌ DUPLICATE!
  this.values.d_151 = "8319.50";
  this.values.d_154 = "0.0";
  this.values.d_158 = "mezzanine";
  this.values.d_159 = "biplanar";
}
```

### 5. Field Definitions (Lines 318-394)
```javascript
d: {
  fieldId: "d_150",
  value: "1",  // ❌ ANOTHER DUPLICATE! (also "1" vs "1.0")
  // ...
}
```

### 6. Dropdown Options (Lines 592-606)
```javascript
dd_d_150: [
  { value: "1", name: "1" },  // ❌ Yet another place!
  { value: "1.5", name: "1.5" },
  // ...
]
```

---

## Problems with Current Approach

1. **DRY Violation**: Same values in 4-6 places
2. **Inconsistency Risk**: "1" vs "1.0" discrepancy already exists
3. **Maintenance Burden**: Updating defaults requires changes in multiple locations
4. **Error Prone**: Easy to miss one location when updating
5. **Violates CHEATSHEET Pattern**: Should have single source of truth

---

## The Correct Pattern (from CHEATSHEET.md)

**Pattern A - Dual-State Module** (Lines 383-412):

```javascript
// ✅ CORRECT: Field definitions are the SINGLE source of truth
const fieldDefinitions = {
  d_150: { value: "1", type: "dropdown", /* ... */ },
  d_151: { value: "8319.50", type: "editable", /* ... */ },
  // ...
};

// ✅ CORRECT: setDefaults() reads from field definitions
TargetState.setDefaults = function() {
  this.state = {
    d_150: getFieldDefault("d_150") || "1",
    d_151: getFieldDefault("d_151") || "8319.50",
    // ...
  };
};

// ✅ CORRECT: ReferenceState can override selectively
ReferenceState.setDefaults = function() {
  this.state = {
    d_150: getFieldDefault("d_150") || "1",  // Same as Target
    d_151: getFieldDefault("d_151") || "8319.50",  // Same as Target
    // OR override: d_103: "Exposed",  // Different from Target
  };
};
```

---

## Recommended Cleanup Steps

### Step 1: Create Helper Function
```javascript
function getFieldDefault(fieldId) {
  // Look up field definition from fieldDefinitions
  const fieldDef = fieldDefinitions?.row150?.cells?.d;  // Example
  return fieldDef?.value || null;
}
```

### Step 2: Simplify TargetState
```javascript
const TargetState = {
  values: {},  // ✅ Start empty, populate in setDefaults()

  setDefaults: function() {
    // ✅ SINGLE source: Read from field definitions
    this.values.d_150 = getFieldDefault("d_150") || "1";
    this.values.d_151 = getFieldDefault("d_151") || "8319.50";
    this.values.d_154 = getFieldDefault("d_154") || "0.0";
    this.values.d_158 = getFieldDefault("d_158") || "mezzanine";
    this.values.d_159 = getFieldDefault("d_159") || "biplanar";
  }
};
```

### Step 3: Simplify ReferenceState
```javascript
const ReferenceState = {
  values: {},  // ✅ Start empty, populate in setDefaults()

  setDefaults: function() {
    // ✅ Same as Target (both use field definitions)
    this.values.d_150 = getFieldDefault("d_150") || "1";
    this.values.d_151 = getFieldDefault("d_151") || "8319.50";
    this.values.d_154 = getFieldDefault("d_154") || "0.0";
    this.values.d_158 = getFieldDefault("d_158") || "mezzanine";
    this.values.d_159 = getFieldDefault("d_159") || "biplanar";
  }
};
```

### Step 4: Fix "1" vs "1.0" Inconsistency
Decide on canonical format (recommend "1" for dropdown values) and ensure field definitions use it consistently.

---

## Benefits of Cleanup

1. ✅ **DRY Compliance**: Single source of truth (field definitions)
2. ✅ **Consistency**: No more "1" vs "1.0" discrepancies
3. ✅ **Maintainability**: Update in one place, propagates everywhere
4. ✅ **Follows CHEATSHEET**: Matches proven Pattern A from S02/S12
5. ✅ **Less Error-Prone**: Can't forget to update one location

---

## Testing After Cleanup

1. ✅ Load fresh page → verify defaults appear correctly
2. ✅ Clear localStorage → verify defaults still work
3. ✅ Switch Target/Reference modes → verify both use same defaults
4. ✅ Import CSV → verify values override defaults correctly
5. ✅ Export CSV → verify defaults don't leak into exports

---

## Notes

**NOT URGENT**: This is a code quality issue, not a functional bug. The duplicated defaults work correctly, they're just harder to maintain.

**TIMING**: Good candidate for cleanup after WOMBAT-SHED is merged, or as part of a larger S19 refactor.

**PATTERN**: This cleanup should follow the exact pattern from S02 (CHEATSHEET lines 383-412), which successfully consolidated defaults after similar duplication issues.

---

**Status**: DOCUMENTED - Ready for implementation
**Branch**: WOMBAT-SHED (or future cleanup branch)
**Estimated Effort**: ~30 minutes (low risk, straightforward pattern application)
