# RT Cross Demo - Planning Document

**Date:** 2026-01-06
**Purpose:** Educational demonstration of cross (c) in Rational Trigonometry
**Relationship:** Cross is the complement of spread in RT's fundamental identity

---

## 1. Core Concept

Demonstrate **cross** (c) as the dual concept to spread (s) in Rational Trigonometry, where:

```
RT Fundamental Identity: s + c = 1

Where:
- s = spread = sin²(θ)  (perpendicularity measure)
- c = cross = cos²(θ)   (parallelism measure)
```

**Key Insight:** While spread measures how "perpendicular" two directions are, **cross measures how "parallel" they are**.

---

## 2. Mathematical Foundation

### Cross Definition (RT)

**In classical trigonometry:**
- cos²(θ) = adjacent² / hypotenuse²
- Range: 0 ≤ cos²(θ) ≤ 1

**In Rational Trigonometry:**
- **Cross (c)** replaces cos²(θ)
- For a point (x, y) on the unit circle: `c = x²`
- Cross is the quadrance of the horizontal projection
- Range: 0 ≤ c ≤ 1

### Relationship to Spread

```
For unit circle: x² + y² = 1

Therefore:
- Spread: s = y²  (vertical quadrance)
- Cross:  c = x²  (horizontal quadrance)
- Identity: s + c = y² + x² = 1
```

### The Cross Function (General Form)

**Beyond the unit circle**, cross generalizes to measure oriented separation between vectors:

**For two vectors u and v:**
```
cross(u, v) = (u·u)(v·v) - (u·v)²
            = Q(u) × Q(v) - (dot product)²
```

**Interpretation:**
- Square of the usual vector cross product magnitude
- Equals **4 × (area of parallelogram)²** formed by the vectors
- Replaces sin²(θ) expressions without square roots or transcendental functions

**For a triangle with quadrances Q₁, Q₂, Q₃ opposite spreads s₁, s₂, s₃:**
```
C = Q₁ × Q₂ × (1 - s₃)
```

This cross value enables the **Spread Law** and **Triple Spread Formula** - RT's algebraic replacements for the Law of Sines and triangle area formulas.

### Why "Cross" Matters

1. **Replaces Trigonometric Functions:**
   - Traditional: Area = ½ab sin(θ) (requires transcendental sin function)
   - RT: Area² = ¼ × cross(a, b) (pure algebra!)
   - **Area = ½√cross(u, v)** - only one sqrt, deferred to final step

2. **Triangle Area Calculation:**
   - Cross provides 4 × area² directly
   - No need for Heron's formula or angle calculations
   - Works over any field (rationals, finite fields)

3. **Spread Law (RT's Law of Sines):**
   - For triangle with quadrances Q₁, Q₂, Q₃ and spreads s₁, s₂, s₃:
   - **s₁/Q₁ = s₂/Q₂ = s₃/Q₃** (purely algebraic ratios!)
   - Cross enables verification and calculation without sin/cos

4. **Rotation Matrices:** Cross values determine rotation transforms
   - 45° rotation: s = 0.5, c = 0.5 (used in matrix grid alignment)
   - 180° rotation: s = 0, c = 1 (used in tet orientation flips)

5. **Deferred Square Root Extraction:** Work with cross directly, extract √ only when needed
   - Example: c = 0.5 → cos = √(0.5) = √2/2 (deferred until matrix construction)

6. **Exact Rational Values:** Many useful configurations have exact rational cross values
   - 0°: s = 0, c = 1 (exact!)
   - 45°: s = 0.5, c = 0.5 (exact rational 1/2)
   - 90°: s = 1, c = 0 (exact!)
   - 180°: s = 0, c = 1 (exact!)

7. **Algebraic Backbone:**
   - Cross function allows trigonometry done entirely with **polynomials**
   - Avoids irrational numbers while retaining full geometric meaning
   - Symmetric and invariant under rigid motions
   - Enables rational versions of perpendicularity, area, and triangle laws

---

## 3. Visualization Approach

### Primary Visual: Complementary Rectangles on Unit Circle

**Concept:** Show how spread and cross partition the unit circle's radius quadrance

```
Unit Circle Point: (x, y) where x² + y² = 1

Rectangle Decomposition:
┌─────────────────────────────────┐
│  Spread Rectangle (vertical)    │  Height: y, Base: 1
│  Area ≈ y (spread component)    │  Quadrance: y²
├─────────────────────────────────┤
│  Cross Rectangle (horizontal)   │  Height: x, Base: 1  
│  Area ≈ x (cross component)     │  Quadrance: x²
└─────────────────────────────────┘
        Total: x² + y² = 1
```

**Interactive Elements:**
1. Draggable point on unit circle
2. Two stacked rectangles showing s and c
3. Real-time display: `s = [value], c = [value], s+c = 1.000 ✓`
4. Angle parameter (for reference, but not primary)

### Visual Design

**Color Coding:**
- **Spread (s):** Red/Orange (vertical component, "perpendicular energy")
- **Cross (c):** Blue/Cyan (horizontal component, "parallel energy")
- **Identity Bar:** Split-color bar showing s + c = 1

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Title: "Cross (c) - The Complement of Spread" │
├─────────────────────────────────────────────────┤
│                                                 │
│   [Unit Circle with draggable point]           │
│                                                 │
│   Point: (x, y) = (0.707, 0.707)               │
│   Cross:  c = x² = 0.500 ████████               │
│   Spread: s = y² = 0.500 ████████               │
│   ─────────────────────────────────             │
│   Identity: s + c = 1.000 ✓                     │
│                                                 │
│   [Stacked rectangles showing c and s]         │
│                                                 │
├─────────────────────────────────────────────────┤
│  "Cross measures parallelism to horizontal"    │
│  "As cross → 1, direction → horizontal (0°)"   │
│  "As cross → 0, direction → vertical (90°)"    │
└─────────────────────────────────────────────────┘
```

---

## 4. Demonstration Sequence

### Sequence 1: The Fundamental Identity (s + c = 1)

**Goal:** Show that spread and cross always sum to 1 on the unit circle

**Steps:**
1. Start at (1, 0): c = 1, s = 0 → "Pure horizontal (0°)"
2. Drag to (√2/2, √2/2): c = 0.5, s = 0.5 → "45° - Equal split"
3. Drag to (0, 1): c = 0, s = 1 → "Pure vertical (90°)"
4. Continuous verification: Display `s + c = 1.000 ✓` at all points

**Key Message:** "Cross and spread are complementary - together they account for the entire radius quadrance"

### Sequence 2: Exact Rational Cross Values

**Goal:** Highlight useful rotations with exact rational cross values

**Snappoints:**
- **0°:** (1, 0) → c = 1, s = 0 → "No rotation needed"
- **45°:** (√2/2, √2/2) → c = 0.5, s = 0.5 → "Grid alignment rotation (exact 1/2!)"
- **90°:** (0, 1) → c = 0, s = 1 → "Perpendicular"
- **180°:** (-1, 0) → c = 1, s = 0 → "Flip rotation (trivial sqrt: cos = -1)"

**Key Message:** "Common rotations have exact rational cross values - no transcendental functions needed!"

### Sequence 3: RT-Pure Rotation Construction

**Goal:** Show how cross enables RT-pure rotation matrices

**Example: 45° Rotation**
```javascript
// Traditional Trigonometry (transcendental!):
const angle = 45 * Math.PI / 180;
const cos = Math.cos(angle);  // ≈ 0.7071...
const sin = Math.sin(angle);  // ≈ 0.7071...

// Rational Trigonometry (algebraic!):
const c = 0.5;  // Cross = cos²(45°) = 1/2 (exact rational!)
const s = 0.5;  // Spread = sin²(45°) = 1/2 (exact rational!)
const cos = Math.sqrt(c);  // √(1/2) - deferred sqrt extraction
const sin = Math.sqrt(s);  // √(1/2) - deferred sqrt extraction
```

**Visual:**
- Show the two code paths side-by-side
- Highlight "exact rational 1/2" vs "transcendental approximation"
- Emphasize: "Work in c/s space, extract sqrt only when building matrix"

### Sequence 4: Cross Function for Triangle Area

**Goal:** Demonstrate how cross replaces sine in area calculations

**Interactive Triangle:**
```
For vectors u = (u_x, u_y) and v = (v_x, v_y):

Classical:
  Area = ½ × |u| × |v| × sin(θ)  (requires angle θ!)

Rational Trigonometry:
  cross(u, v) = (u·u)(v·v) - (u·v)²
              = Q(u) × Q(v) × s
  Area² = ¼ × cross(u, v)
  Area = ½√cross(u, v)  (only ONE sqrt, at final step!)
```

**Demonstration:**
1. Display two draggable vectors from origin
2. Show live calculation:
   - Q(u) = u_x² + u_y²
   - Q(v) = v_x² + v_y²
   - dot = u_x×v_x + u_y×v_y
   - cross = Q(u)×Q(v) - dot²
   - Area² = cross/4
   - Area = √(cross/4) (final deferred sqrt)
3. Compare with traditional formula requiring sin(θ)

**Key Message:** "Cross provides area² directly - no angles, no sine, just algebra!"

### Sequence 5: Spread Law Visualization

**Goal:** Show how cross enables the Spread Law (RT's Law of Sines)

**Interactive Triangle with Spreads:**
```
For triangle with sides of quadrances Q₁, Q₂, Q₃
and opposite spreads s₁, s₂, s₃:

Spread Law: s₁/Q₁ = s₂/Q₂ = s₃/Q₃

Cross relationship:
  C = Q₁ × Q₂ × (1 - s₃)
```

**Demonstration:**
1. Display draggable triangle vertices
2. Calculate quadrances for all three sides
3. Calculate spreads at all three angles
4. Verify Spread Law ratios are equal
5. Show cross calculations between pairs of sides

**Key Message:** "Cross connects spreads and quadrances without trigonometry!"

---

## 5. Interactive Features

### Core Interactions

1. **Draggable Circle Point**
   - Drag point around unit circle
   - Live update: x, y, c, s values
   - Visual feedback: rectangles resize, color bars adjust

2. **Snappoints Toggle**
   - Click to snap to exact rational values: 0°, 45°, 90°, 180°
   - Highlight the exact cross value (e.g., "c = 0.5 exactly!")

3. **Identity Verification Bar**
   - Horizontal bar split into two sections: [c portion][s portion]
   - Always sums to exactly 1.000
   - Visual proof of s + c = 1

### Educational Callouts

**Callout 1: "Why Cross, Not Cosine?"**
```
Classical:  cos(θ) = adjacent / hypotenuse  (requires division, ranges -1 to 1)
RT Cross:   c = (adjacent)² / (hypotenuse)²  (ranges 0 to 1, always positive)

Benefits:
✓ No negative values (simpler algebra)
✓ Quadrance-based (no square roots)
✓ Exact rationals for common angles
✓ Direct extraction: c = x² from circle point
```

**Callout 2: "The RT Identity (s + c = 1)"**
```
Classical: sin²(θ) + cos²(θ) = 1  (requires trig functions)
RT Identity: s + c = 1             (pure algebra!)

On unit circle:
- s = y² (vertical quadrance)
- c = x² (horizontal quadrance)
- s + c = y² + x² = 1 (Pythagoras!)
```

**Callout 3: "Cross in Rotation Matrices"**
```
From our rt-math.js RT.applyRotation45():

// Work in spread/cross space (exact rationals)
const s = 0.5;  // Spread = 1/2
const c = 0.5;  // Cross = 1/2

// Extract sin/cos ONLY when building matrix (deferred √)
const sin_val = Math.sqrt(s);  // √(1/2) = √2/2
const cos_val = Math.sqrt(c);  // √(1/2) = √2/2

// Build rotation matrix
[  cos_val, -sin_val, 0, 0 ]
[  sin_val,  cos_val, 0, 0 ]
[  0,        0,       1, 0 ]
[  0,        0,       0, 1 ]
```

---

## 6. Implementation Plan

### Phase 1: Core Visualization (Week 1)
- [ ] Unit circle with draggable point
- [ ] Real-time c and s calculation
- [ ] Stacked rectangle visualization
- [ ] Identity verification display (s + c = 1.000 ✓)

### Phase 2: Educational Enhancements (Week 2)
- [ ] Snappoints for exact rational values
- [ ] Color-coded cross/spread bars
- [ ] Side-by-side code comparison (trig vs RT)
- [ ] Interactive callouts (click to expand)

### Phase 3: Integration & Polish (Week 3)
- [ ] Match visual style of Quadrance Demo
- [ ] Add to demos menu in ARTexplorer
- [ ] Rename spread-demo.js → cross-demo.js
- [ ] Documentation in ARTexplorer.md

---

## 7. Technical Specifications

### File Structure
```
src/geometry/demos/
  ├── rt-cross-demo.js       (renamed from spread-demo.js)
  ├── rt-quadrance-demo.js   (existing)
  └── rt-weierstrass-demo.js (existing)
```

### Key Functions (rt-cross-demo.js)

```javascript
// Calculate cross and spread from circle point
function calculateCrossSpread(x, y) {
  const c = x * x;  // Cross = horizontal quadrance
  const s = y * y;  // Spread = vertical quadrance
  return { c, s, identity: c + s };  // Should equal 1.000
}

// Snappoints for exact rational values
const SNAPPOINTS = [
  { angle: 0,   x: 1,    y: 0,    c: 1.0,  s: 0.0,  label: "0° - Horizontal" },
  { angle: 45,  x: M√½,  y: M√½,  c: 0.5,  s: 0.5,  label: "45° - Exact 1/2" },
  { angle: 90,  x: 0,    y: 1,    c: 0.0,  s: 1.0,  label: "90° - Vertical" },
  { angle: 180, x: -1,   y: 0,    c: 1.0,  s: 0.0,  label: "180° - Flip" }
];

// Render stacked rectangles showing c and s
function renderComplementaryRectangles(c, s) {
  // Blue rectangle (cross) - horizontal component
  // Red rectangle (spread) - vertical component
  // Total height = 1.0 (identity)
}
```

---

## 8. Key Messages

### Primary Teaching Points

1. **Cross = Horizontal Quadrance**
   - "Cross measures the quadrance of the horizontal projection"
   - "On unit circle: c = x²"

2. **Cross + Spread = 1 (Always!)**
   - "The RT fundamental identity"
   - "Spread and cross partition the radius quadrance"

3. **Cross Enables RT-Pure Rotations**
   - "Work with exact rational cross values (c = 0.5, not cos ≈ 0.707...)"
   - "Defer sqrt extraction until matrix construction"

4. **Exact Rationals for Common Angles**
   - "45°: c = 0.5 (exact 1/2)"
   - "180°: c = 1 (trivial sqrt extraction)"

### Differentiation from Spread Demo

**Quadrance Demo:** Shows s and Q relationship in right triangles
**Cross Demo:** Shows c and s complementarity on unit circle
**Weierstrass Demo:** Shows rational circle parameterization (t parameter)

**Together:** Complete picture of RT's algebraic approach to geometry

---

## 9. Success Criteria

### Educational Goals
- [ ] User understands cross as "parallelism measure" (dual to spread)
- [ ] User sees the RT identity (s + c = 1) visually verified
- [ ] User appreciates exact rational cross values vs transcendental trig
- [ ] User understands how cross enables RT-pure rotation matrices

### Technical Goals
- [ ] Smooth draggable circle interaction
- [ ] Real-time c, s, and identity calculation
- [ ] Accurate snappoints for exact rational values
- [ ] Clean visual design matching other demos

### Integration Goals
- [ ] Accessible from demos menu
- [ ] Referenced in ARTexplorer.md documentation
- [ ] Complements Quadrance and Weierstrass demos
- [ ] Code reusability across demo suite

---

## 10. Future Enhancements (Post-MVP)

- [ ] Animate transitions between snappoints
- [ ] Show rotation matrix construction in real-time
- [ ] Add "spread/cross slider" for precise value selection
- [ ] 3D visualization showing x, y, z projections
- [ ] Export snappoint data as JSON
- [ ] Link to Fuller's IVM geometry applications

---

**Document Version:** 1.0
**Status:** Planning Complete - Ready for Implementation
**Priority:** Medium (completes RT demo trilogy)
**Estimated Completion:** 3 weeks from start
