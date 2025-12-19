# S19 Defaults Cleanup - DRY Violation Workplan

**Date**: 2025-12-18 (Created) | 2025-12-18 (Failed Attempt)
**Issue**: Default values duplicated across 3+ locations in Section19.js
**Priority**: Medium - Code quality/maintainability issue (but tricky!)
**Pattern**: Should follow CHEATSHEET.md Pattern A (single source of truth)
**Status**: ⚠️ **FAILED ATTEMPT** - Reverted, needs different approach

---

## ⚠️ FAILED ATTEMPT (2025-12-18 22:42)

**What We Tried**:
- Removed hardcoded initial values from `TargetState.values` and `ReferenceState.values`
- Created `getFieldDefault()` helper to read from field definitions
- Consolidated defaults into `setDefaults()` methods only

**Why It Failed**:
1. **Timing Issue**: `getFieldDefault()` tries to read `fieldDefinitions` before it's defined
   - Helper defined at line 42
   - `fieldDefinitions` defined around line 306+
   - `setDefaults()` called during initialization when `fieldDefinitions` is `undefined`
   - Result: All defaults return `null`, dropdown breaks

2. **Hardcoding Workaround Didn't Help**:
   - Removed helper, hardcoded values in `setDefaults()`
   - Still broken - suggests the issue is NOT just timing
   - Empty initial values object causes problems elsewhere

3. **Root Cause Unknown**:
   - Dropdown shows just "1" without frame/chevron
   - Same symptom as "0" vs "1" bug from earlier
   - But field definitions have correct value: "1"
   - Something else depends on initial values being populated

**Commits**:
- c8470d5: Attempted consolidation (BROKEN)
- 020eaf0: Revert (back to working state)

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

## Investigation Needed (Before Next Attempt)

**Questions to Answer**:

1. **What depends on initial values being populated?**
   - Is there code that reads `TargetState.values.d_150` before `setDefaults()` is called?
   - Does FieldManager initialization depend on pre-populated values?
   - Check initialization sequence carefully

2. **Why does empty initial object break dropdown?**
   - Dropdown shows "1" but without frame/chevron (broken UI)
   - Field definition has correct value
   - setDefaults() sets correct value
   - Something in rendering chain breaks when values start empty

3. **How does S12 handle this?**
   - S12 successfully consolidated defaults (CHEATSHEET Pattern A)
   - Compare S12's initialization sequence with S19
   - Key difference: S12 doesn't have dropdowns in state objects?

4. **Is there a FieldManager dependency?**
   - Does FieldManager read initial values before setDefaults()?
   - Check FieldManager initialization in index.html
   - May need to ensure setDefaults() runs BEFORE FieldManager renders

**Next Approach** (for tomorrow):

1. Add console.log statements to trace initialization order
2. Check when FieldManager reads field values
3. Verify setDefaults() is called before any field rendering
4. Consider calling setDefaults() IMMEDIATELY in state object definition
5. Or move field definitions ABOVE state objects (architectural change)

---

**Status**: ⚠️ REVERTED - Needs investigation before retry
**Branch**: WOMBAT-SHED
**Estimated Effort**: Unknown - requires debugging initialization sequence first
**Lesson**: Empty initial values break something in the rendering chain
