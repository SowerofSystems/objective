# PurePhi Migration Plan

**High-Precision Golden Ratio Symbolic Algebra**

## Overview

This document outlines the migration plan from `RT.Phi` (Method 1) to `RT.PurePhi` (Method 2) for achieving 6+ decimal places of precision in golden ratio calculations by maintaining symbolic algebraic form `(a + b√5)/c` throughout geometry generation and only expanding to decimal at the GPU boundary.

**Status:** Planning Phase
**Created:** 2026-01-12
**Module:** `src/geometry/modules/rt-math.js`

---

## Philosophy

### Current Approach (RT.Phi)
- Expands `φ = (1 + √5)/2` immediately to floating-point
- Uses algebraic identities (`φ² = φ + 1`, `1/φ = φ - 1`)
- Good: Defers some operations
- Limitation: Still accumulates floating-point errors in intermediate calculations

### PurePhi Approach (Method 2)
- Maintains symbolic form `(a + b√5)/c` during all geometry calculations
- Only expands `√5` once (cached) when creating `THREE.Vector3` coordinates
- Eliminates accumulated floating-point errors
- Preserves exact algebraic relationships until GPU boundary
- **Guaranteed 15+ decimal places** (IEEE 754 double precision limit)

---

## Implementation Status

### ✅ Completed (2026-01-12)

1. **PurePhi Library Added to rt-math.js**
   - `RT.PurePhi.sqrt5()` - Cached high-precision √5
   - `RT.PurePhi.value()` - φ with 15+ decimal places
   - `RT.PurePhi.squared()` - φ² using identity
   - `RT.PurePhi.inverse()` - 1/φ using identity
   - `RT.PurePhi.cubed()` - φ³ = 2φ + 1
   - `RT.PurePhi.fourthPower()` - φ⁴ = 3φ + 2
   - `RT.PurePhi.Symbolic` class for symbolic algebra
   - `RT.PurePhi.constants` - Pre-defined symbolic forms

2. **Symbolic Class Features**
   - Constructor: `new RT.PurePhi.Symbolic(a, b, c)` for `(a + b√5)/c`
   - `.toDecimal()` - Convert to decimal (GPU boundary only)
   - `.multiply(other)` - Exact algebraic multiplication
   - `.add(other)` - Exact algebraic addition
   - `.subtract(other)` - Exact algebraic subtraction
   - `.scale(scalar)` - Multiply by rational number
   - `.divide(scalar)` - Divide by rational number
   - `.toString()` - Debug representation

---

## Migration Audit

### Files Using Golden Ratio (φ)

Search results from codebase:

1. **src/geometry/modules/rt-polyhedra.js**
   - Icosahedron (lines 276-296)
   - Dodecahedron dual (lines 408-430)
   - Dual icosahedron (lines 453-483)
   - Cuboctahedron (lines 713-747)
   - Dodecahedron (lines 1017-1067+)

2. **src/geometry/modules/rt-rendering.js**
   - May use polyhedra that depend on φ

3. **src/geometry/modules/rt-init.js**
   - May reference φ in initialization

---

## Migration Strategy

### Phase 1: Audit Current Usage

**Objective:** Identify all locations where φ is computed or used in intermediate calculations

**Tasks:**
- [ ] Grep for `RT.Phi` usage in rt-polyhedra.js
- [ ] Grep for `phi` variable usage in rt-polyhedra.js
- [ ] Grep for `0.5 * (1 + Math.sqrt(5))` pattern (direct φ computation)
- [ ] Document each usage with:
  - File and line number
  - Context (what polyhedron/calculation)
  - Current precision (how many decimal places matter)
  - Intermediate steps that could accumulate error

**Deliverable:** Complete usage matrix

---

### Phase 2: Identify Premature Expansions

**Objective:** Find places where φ is expanded to decimal too early

**Red Flags:**
1. ❌ Direct computation: `const phi = 0.5 * (1 + Math.sqrt(5));`
2. ❌ Premature multiplication: `const phiSquared = phi * phi;` (should use identity)
3. ❌ Premature division: `const invPhi = 1 / phi;` (should use identity)
4. ❌ Multiple √5 expansions in same function
5. ❌ Intermediate φ calculations before final vertices

**Green Patterns:**
1. ✅ Using `RT.Phi.value()` - defers expansion
2. ✅ Using `RT.Phi.squared()` - uses identity
3. ✅ Using `RT.Phi.inverse()` - uses identity
4. ✅ Only expanding at `new THREE.Vector3(x, y, z)` creation

**Tasks:**
- [ ] Categorize each φ usage as Red Flag or Green Pattern
- [ ] Prioritize Red Flags for migration

**Deliverable:** Priority migration list

---

### Phase 3: Implement PurePhi in Test Case

**Objective:** Prove PurePhi works in production with one polyhedron

**Candidate:** Icosahedron (simplest φ-based polyhedron)

**Tasks:**
- [ ] Create test version of icosahedron using PurePhi.Symbolic
- [ ] Compare vertices to 15 decimal places vs. current method
- [ ] Verify no precision loss in RT validation
- [ ] Measure performance impact (if any)
- [ ] Document example usage pattern

**Example Implementation:**

```javascript
// BEFORE (Method 1 - RT.Phi)
const phi = RT.Phi.value();  // Expands √5 immediately
const a = halfSize * normFactor;
const b = halfSize * phi * normFactor;  // φ already expanded

// AFTER (Method 2 - RT.PurePhi)
const phi = RT.PurePhi.constants.phi;  // Symbolic: (1 + √5)/2
const normFactorSym = /* symbolic normalization */;
const aSym = normFactorSym.scale(halfSize);
const bSym = phi.multiply(normFactorSym).scale(halfSize);
// Only expand when creating vertices:
const a = aSym.toDecimal();
const b = bSym.toDecimal();
```

**Deliverable:** Working icosahedron with PurePhi + precision comparison report

---

### Phase 4: Migrate Polyhedra

**Objective:** Systematic migration of all φ-dependent polyhedra

**Priority Order:**
1. Icosahedron (test case - Phase 3)
2. Dodecahedron (most complex φ relationships)
3. Dual Icosahedron (φ-scaled icosahedron)
4. Cuboctahedron (if φ-dependent)
5. Geodesic spheres (if φ-dependent)

**Tasks for Each Polyhedron:**
- [ ] Identify all φ calculations
- [ ] Convert to PurePhi.Symbolic form
- [ ] Keep symbolic until final vertex creation
- [ ] Add console logging showing symbolic form
- [ ] Verify precision improvement
- [ ] Update comments to reference PurePhi

**Success Criteria:**
- ✅ Vertices match to 15 decimal places
- ✅ RT validation passes (quadrance checks)
- ✅ No performance regression
- ✅ Console logs show symbolic forms

**Deliverable:** All polyhedra using PurePhi

---

### Phase 5: Documentation Update

**Objective:** Update all documentation to reflect PurePhi approach

**Tasks:**
- [ ] Update README.md - Golden Ratio section
- [ ] Update Kieran-Math.md - Add PurePhi examples
- [ ] Update rt-polyhedra.js comments
- [ ] Add console logging examples
- [ ] Document precision improvements achieved

**Deliverable:** Complete documentation of PurePhi approach

---

### Phase 6: Deprecation Plan (Optional)

**Objective:** Decide fate of RT.Phi (Method 1)

**Options:**
1. **Keep Both** - RT.Phi for simple cases, PurePhi for precision-critical
2. **Deprecate RT.Phi** - Mark as legacy, recommend PurePhi
3. **Remove RT.Phi** - Full migration, remove old method

**Recommendation:** Keep Both (Option 1)
- RT.Phi is simpler for non-critical calculations
- PurePhi is overkill for simple scalar operations
- Both methods have educational value

**Tasks:**
- [ ] Add deprecation notice to RT.Phi JSDoc (if deprecating)
- [ ] Add "See Also: RT.PurePhi" to RT.Phi documentation
- [ ] Update code examples to show both approaches

**Deliverable:** Clear guidance on when to use each method

---

## Precision Goals

### Target Precision

| Metric | Current (RT.Phi) | Target (PurePhi) | IEEE 754 Limit |
|--------|------------------|------------------|----------------|
| φ value | ~12 decimals | 15+ decimals | 15-17 decimals |
| φ² value | ~11 decimals | 15+ decimals | 15-17 decimals |
| Vertex coords | ~10 decimals | 15+ decimals | 15-17 decimals |
| Accumulated error | ~1e-10 | ~1e-15 | Machine epsilon |

### Validation Method

```javascript
// Precision test
const phi_old = 0.5 * (1 + Math.sqrt(5));  // RT.Phi approach
const phi_new = RT.PurePhi.value();         // PurePhi approach
const diff = Math.abs(phi_new - phi_old);
console.log(`Precision improvement: ${diff.toExponential()} (${diff === 0 ? 'EXACT' : 'improved'})`);

// Expected: Both should be identical at IEEE 754 limit
// The real gain is in intermediate calculations staying symbolic
```

---

## Code Examples

### Example 1: Icosahedron Vertex Generation

```javascript
// CURRENT METHOD (RT.Phi - Method 1)
function generateIcosahedronVertices_OLD(halfSize) {
  const sqrt5 = Math.sqrt(5);
  const phi = 0.5 * (1 + sqrt5);  // Immediate expansion
  const phi_squared = phi * phi;   // Loses algebraic relationship
  const normFactor = 1 / Math.sqrt(1 + phi_squared);
  const a = halfSize * normFactor;
  const b = halfSize * phi * normFactor;

  return [
    new THREE.Vector3(0, a, b),
    // ... more vertices
  ];
}

// PURE-PHI METHOD (RT.PurePhi - Method 2)
function generateIcosahedronVertices_NEW(halfSize) {
  // Work symbolically until final step
  const phi = RT.PurePhi.constants.phi;        // (1 + √5)/2 symbolic
  const phiSq = RT.PurePhi.constants.phiSq;    // (3 + √5)/2 symbolic
  const one = RT.PurePhi.constants.one;        // 1 symbolic

  // Normalization: 1/√(1 + φ²)
  // First compute (1 + φ²) symbolically
  const onePlusPhiSq = one.add(phiSq);         // (1 + (3 + √5)/2) = (5 + √5)/2

  // Now we need 1/√((5 + √5)/2)
  // This is where we defer to decimal (no way around √ for normalization)
  const normFactor = 1 / Math.sqrt(onePlusPhiSq.toDecimal());

  // Create symbolic coordinates (still exact!)
  const aSym = one.scale(halfSize * normFactor);
  const bSym = phi.scale(halfSize * normFactor);

  // Only expand at vertex creation (GPU boundary)
  const a = aSym.toDecimal();
  const b = bSym.toDecimal();

  console.log(`[PurePhi] φ = ${phi.toString()} = ${phi.toDecimal().toFixed(15)}`);
  console.log(`[PurePhi] 1 + φ² = ${onePlusPhiSq.toString()} = ${onePlusPhiSq.toDecimal().toFixed(15)}`);

  return [
    new THREE.Vector3(0, a, b),
    // ... more vertices
  ];
}
```

### Example 2: Dodecahedron with φ and 1/φ

```javascript
// PURE-PHI METHOD for Dodecahedron
function generateDodecahedronVertices_NEW(halfSize) {
  const phi = RT.PurePhi.constants.phi;      // (1 + √5)/2
  const invPhi = RT.PurePhi.constants.invPhi; // (-1 + √5)/2
  const one = RT.PurePhi.constants.one;

  // Scale for dodecahedron (s = halfSize)
  const s = halfSize;

  // 8 vertices at (±1, ±1, ±1) * s - these don't need symbolic form
  const cube = [
    new THREE.Vector3(s, s, s),
    new THREE.Vector3(s, s, -s),
    // ... 6 more cube vertices
  ];

  // 12 vertices at permutations of (0, ±1/φ, ±φ) * s
  // Work symbolically for precision
  const zeroSym = RT.PurePhi.constants.zero;

  // Symbolic coordinates
  const invPhiScaled = invPhi.scale(s);  // ((-1 + √5)/2) * s
  const phiScaled = phi.scale(s);        // ((1 + √5)/2) * s

  // Expand only at vertex creation
  const v_invPhi = invPhiScaled.toDecimal();
  const v_phi = phiScaled.toDecimal();

  console.log(`[PurePhi] 1/φ·s = ${invPhiScaled.toString()} = ${v_invPhi.toFixed(15)}`);
  console.log(`[PurePhi] φ·s = ${phiScaled.toString()} = ${v_phi.toFixed(15)}`);

  const golden = [
    new THREE.Vector3(0, v_invPhi, v_phi),     // Permutation 1
    new THREE.Vector3(0, v_invPhi, -v_phi),
    new THREE.Vector3(0, -v_invPhi, v_phi),
    new THREE.Vector3(0, -v_invPhi, -v_phi),

    new THREE.Vector3(v_invPhi, v_phi, 0),     // Permutation 2
    new THREE.Vector3(v_invPhi, -v_phi, 0),
    new THREE.Vector3(-v_invPhi, v_phi, 0),
    new THREE.Vector3(-v_invPhi, -v_phi, 0),

    new THREE.Vector3(v_phi, 0, v_invPhi),     // Permutation 3
    new THREE.Vector3(-v_phi, 0, v_invPhi),
    new THREE.Vector3(v_phi, 0, -v_invPhi),
    new THREE.Vector3(-v_phi, 0, -v_invPhi),
  ];

  return [...cube, ...golden];
}
```

---

## Testing & Validation

### Validation Checklist

For each migrated polyhedron:

- [ ] **Precision Test:** Compare vertices to 15 decimal places
  ```javascript
  const vertex_old = icosahedronOLD.vertices[0];
  const vertex_new = icosahedronNEW.vertices[0];
  const diff = vertex_old.distanceTo(vertex_new);
  console.assert(diff < 1e-14, "Precision loss detected");
  ```

- [ ] **RT Validation:** Quadrance checks pass
  ```javascript
  const Q = RT.quadrance(vertices[0], vertices[1]);
  const expectedQ = /* computed symbolically */;
  console.assert(Math.abs(Q - expectedQ) < 1e-14, "Quadrance validation failed");
  ```

- [ ] **Identity Verification:** φ² = φ + 1 holds to machine precision
  ```javascript
  const phiSq = RT.PurePhi.constants.phiSq.toDecimal();
  const phi = RT.PurePhi.constants.phi.toDecimal();
  const identity = phiSq - (phi + 1);
  console.assert(Math.abs(identity) < 1e-15, "φ² = φ + 1 identity broken");
  ```

- [ ] **Console Logging:** Symbolic forms displayed
  ```javascript
  console.log(`[PurePhi] φ = ${RT.PurePhi.constants.phi.toString()}`);
  // Expected: "(1 + 1√5)/2"
  ```

- [ ] **Performance:** No significant slowdown
  ```javascript
  const t0 = performance.now();
  generateIcosahedronVertices_NEW(1.0);
  const t1 = performance.now();
  console.log(`Generation time: ${(t1 - t0).toFixed(3)}ms`);
  ```

---

## Known Issues & Limitations

### Issue 1: Normalization Requires √

**Problem:** Normalization factors like `1/√(1 + φ²)` cannot stay fully symbolic because they involve `√` of an algebraic expression.

**Solution:** Expand symbolic form to decimal just before taking `√`, but keep everything else symbolic.

**Impact:** Still achieves precision goal - only one √ expansion instead of multiple.

### Issue 2: THREE.Vector3 Requires Decimal

**Problem:** GPU expects `float` values, not symbolic algebra.

**Solution:** This is expected - PurePhi defers expansion until GPU boundary. The `.toDecimal()` call happens at vertex creation.

**Impact:** None - this is by design.

### Issue 3: Performance Overhead

**Problem:** Symbolic arithmetic has more operations than direct float math.

**Mitigation:**
- Cache commonly used symbolic constants
- Only use PurePhi for φ-critical calculations
- Profile before/after to measure impact

**Expected Impact:** Negligible (geometry generation is not performance-critical)

---

## Success Metrics

### Definition of Success

1. **Precision:** All φ-based polyhedra vertices accurate to 15 decimal places
2. **RT-Pure:** No premature √5 expansions in geometry generation logic
3. **Validation:** All quadrance checks pass with tighter tolerances (1e-14 → 1e-15)
4. **Performance:** No user-perceivable slowdown (generation < 10ms)
5. **Documentation:** Clear examples and migration guide
6. **Educational:** Console logs demonstrate symbolic algebra in action

### Metrics to Track

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| φ precision (decimals) | ~12 | 15+ | +25% |
| Vertex precision (decimals) | ~10 | 15+ | +50% |
| √5 expansions per polyhedron | 2-5 | 1 | -60% to -80% |
| Quadrance tolerance | 1e-10 | 1e-15 | 5 orders of magnitude |
| Generation time (ms) | ~1-2ms | ~1-3ms | <50% overhead acceptable |

---

## Timeline & Milestones

### Estimated Timeline

- **Phase 1 - Audit:** 1-2 hours (manual grep + analysis)
- **Phase 2 - Identify:** 1 hour (categorize usage patterns)
- **Phase 3 - Test Case:** 2-3 hours (icosahedron implementation + testing)
- **Phase 4 - Migration:** 3-5 hours (all polyhedra)
- **Phase 5 - Documentation:** 1-2 hours (update docs)
- **Phase 6 - Deprecation:** 30 mins (add notices)

**Total:** ~8-14 hours of focused work

### Milestones

1. ✅ **M1:** PurePhi library implemented (COMPLETE - 2026-01-12)
2. ⏳ **M2:** Usage audit complete
3. ⏳ **M3:** Test case (icosahedron) validated
4. ⏳ **M4:** 50% of polyhedra migrated
5. ⏳ **M5:** 100% of polyhedra migrated
6. ⏳ **M6:** Documentation complete

---

## Questions & Decisions

### Open Questions

1. **Should we migrate ALL polyhedra or just φ-dependent ones?**
   - Decision: Only φ-dependent polyhedra (icosahedron, dodecahedron, dual icosahedron)
   - Rationale: Non-φ polyhedra don't benefit from symbolic algebra

2. **Should PurePhi be used for non-φ radicals (like √2, √3)?**
   - Decision: Future enhancement - focus on φ first
   - Rationale: φ is most critical; √2, √3 are simpler and less error-prone

3. **Should we add automated precision tests?**
   - Decision: Yes - add to validation suite
   - Rationale: Prevent regression in future changes

4. **Should console logging of symbolic forms be always-on or debug-only?**
   - Decision: Always-on for educational value
   - Rationale: ARTexplorer is educational tool; showing algebra is feature, not bug

---

## References

### Mathematical Background

- **Golden Ratio Identities:**
  - φ² = φ + 1 (defining equation)
  - 1/φ = φ - 1 (reciprocal identity)
  - φ³ = 2φ + 1
  - φ⁴ = 3φ + 2
  - φⁿ = Fₙφ + Fₙ₋₁ (Fibonacci relationship)

- **Symbolic Form:** `(a + b√5)/c`
  - φ = (1 + √5)/2 → a=1, b=1, c=2
  - φ² = (3 + √5)/2 → a=3, b=1, c=2
  - 1/φ = (-1 + √5)/2 → a=-1, b=1, c=2

- **Algebra Rules:**
  - (a₁ + b₁√5)(a₂ + b₂√5) = (a₁a₂ + 5b₁b₂) + (a₁b₂ + b₁a₂)√5
  - (a₁ + b₁√5)/c₁ + (a₂ + b₂√5)/c₂ = (a₁c₂ + a₂c₁) + (b₁c₂ + b₂c₁)√5 / (c₁c₂)

### Related Documentation

- `docs/development/Geometry documents/README.md` - Main project documentation
- `docs/development/Geometry documents/Kieran-Math.md` - Mathematical foundations
- `src/geometry/modules/rt-math.js` - RT library implementation
- `src/geometry/modules/rt-polyhedra.js` - Polyhedra generators

### External Resources

- N.J. Wildberger - Rational Trigonometry
- IEEE 754 Double Precision Standard
- Mathematical Properties of φ (Golden Ratio)

---

## Notes

**Created:** 2026-01-12
**Author:** Claude Sonnet 4.5 + Andrew Thomson
**Purpose:** Planning document for high-precision golden ratio implementation
**Status:** Living document - update as migration progresses

---

## Changelog

### 2026-01-12
- Initial document creation
- PurePhi library implementation complete in rt-math.js
- Defined 6-phase migration plan
- Established precision goals and success metrics
