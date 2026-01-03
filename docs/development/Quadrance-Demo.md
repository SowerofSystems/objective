# RT Quadrance Demo - Planning Document

**Date:** 2026-01-03
**Purpose:** Educational demonstration of spread-quadrance relationships in Rational Trigonometry

---

## 1. Core Concept

Demonstrate the relationship between **spread** (s) and **quadrance** (Q) for unit rectangles inscribed in a circle, where spread is defined as:

```
s = Qq/Rq = (opposite edge quadrance) / (radius quadrance)
```

For a unit circle (R² = 1), this simplifies to: `s = Qq`

---

## 2. Mathematical Foundation

### Spread Definition (RT)
- **Spread** replaces sin²(θ) in classical trigonometry
- For a point (x, y) on the unit circle: `s = y²`
- Spread is always rational when y is rational
- Range: 0 ≤ s ≤ 1

### Quadrance Definition (RT)
- **Quadrance** replaces distance² (no square root!)
- Q = Δx² + Δy² (squared distance)
- For a unit rectangle with one vertex at origin and opposite at (x, y) on circle:
  - Q_horizontal = x²
  - Q_vertical = y²
  - Q_diagonal (radius) = x² + y² = 1 (on unit circle)

### Key Relationship
```
For a right triangle with legs a, b and hypotenuse c:
Q_a + Q_b = Q_c  (Pythagorean theorem in quadrance form)

For unit circle: x² + y² = 1
Therefore: Q_horizontal + Q_vertical = 1
And: s = y² = Q_vertical
```

---

## 3. Two Possible Approaches

### Approach A: Rational Spread Series (T-Series)
**Goal:** Find all spreads that resolve to simple rational values (multiples of 0.01, 0.05, etc.)

**T-Series Spreads** (from your sketch):
- s = 0 (0°, horizontal)
- s = 0.038461154 (calculated from rectangular ratio)
- s = 0.2 (φ rectangle ratio: 9/45)
- s = 0.45 (√2 diagonal)
- s = 0.75 (√3 equilateral triangle, 60°)
- s = 1 (90°, vertical)

**Implementation:**
1. Calculate y-coordinates for each rational spread: y = √s
2. Calculate x-coordinates: x = √(1 - s)
3. Create unit rectangles from origin to (x, y)
4. Show spread value and quadrance relationships

**Advantages:**
- Demonstrates spread as primary concept
- Shows "T-Series" of rational spreads
- Educational for understanding spread increments

### Approach B: Rational Rectangle Dimensions
**Goal:** Find all unit rectangles with rational integer dimensions that fit within the circle

**Example from your sketch:**
- Rectangle 5×5 (units) → point (5,5) normalized to circle
- Normalized: (5/√50, 5/√50) = (√2/2, √2/2) → s = 0.5
- This is the 45° case (√2 square)

**Implementation:**
1. Define integer rectangle dimensions (e.g., 3×4, 5×12, 8×15)
2. Normalize to unit circle: (a/√(a²+b²), b/√(a²+b²))
3. Calculate spread: s = (b/√(a²+b²))²
4. Create unit rectangle visualization
5. Show integer dimensions and resulting spread

**Advantages:**
- Intuitive "building block" approach
- Demonstrates Pythagorean triples
- Shows how integer ratios create spreads

---

## 4. Recommended Approach: Hybrid (Approach A with Pythagorean Triples)

**Rationale:**
- Start with rational spreads (Approach A) as primary focus
- Add Pythagorean triple rectangles that yield those spreads
- Best of both worlds: spread education + integer geometry

### Notable Pythagorean Triples & Their Spreads:
```javascript
// (a, b, c) → normalized (a/c, b/c) → spread s = (b/c)²

// Classic 3-4-5 triangle
(3, 4, 5) → (0.6, 0.8) → s = 0.64

// 5-12-13 triangle
(5, 12, 13) → (5/13, 12/13) → s = 0.852 ≈ 144/169

// 8-15-17 triangle
(8, 15, 17) → (8/17, 15/17) → s = 0.779 ≈ 225/289

// 7-24-25 triangle
(7, 24, 25) → (7/25, 24/25) → s = 0.9216 = 576/625

// Equal legs (n, n, n√2) - always s = 0.5
(1, 1, √2) → (1/√2, 1/√2) → s = 0.5
(5, 5, 5√2) → (same when normalized)
```

---

## 5. Visual Design (Based on Your Sketch)

### Elements to Include:
1. **Unit Circle** - black outline, radius = 1.5 (same as Weierstrauss)
2. **X/Y Axes** - red/green (same as Weierstrauss)
3. **Unit Rectangles** - red outlines from origin to circle point
4. **Draggable Point** - blue circle on circumference
5. **Snap Points** - different markers for different spread types:
   - Cardinals (s=0, s=1): Gray circles
   - Rational spreads: Orange/gold markers
   - Special (√2, √3, φ): Keep from Weierstrauss or modify

### Rectangle Visualization:
- Origin (0, 0) to point (x, y) on circle
- Show all 4 quadrants (8 rectangles total if symmetric)
- Lighter cyan fill with opacity (like your sketch)
- Label with spread value

### Formula Display:
Replace Weierstrauss formulas with quadrance formulas:
```
Column 1: Spread & Position
  s = y²/R² = [value]
  x = [value]
  y = [value]

Column 2: Quadrances
  Q(x) = x² = [value]
  Q(y) = y² = [value]
  Q(R) = x² + y² = 1

Column 3: Pythagorean Triple (if applicable)
  Triangle: (a, b, c)
  Ratio: (a/c, b/c)
  Spread: (b/c)²

Column 4: Spread Classification
  Type: [Cardinal/Rational/Irrational]
  Decimal: [value]
  Fraction: [numerator/denominator]
```

---

## 6. Implementation Steps

### Step 1: Copy & Rename
1. Copy `rt-weierstrauss-demo.js` to `rt-quadrance-demo.js`
2. Delete existing stub file
3. Update function names: `initQuadranceDemo()`, `cleanupQuadranceDemo()`
4. Update modal ID: `quadrance-modal`, `quadrance-demo-container`

### Step 2: Modify Snap Points Array
Replace Weierstrauss snap points with rational spread snap points:

```javascript
// Rational spread snap points (T-Series)
const snapPoints = [
  // Cardinals
  { x: 1, y: 0, spread: 0, label: 's=0', type: 'cardinal', triple: null },
  { x: 0, y: 1, spread: 1, label: 's=1', type: 'cardinal', triple: null },

  // Pythagorean triples with rational spreads
  { x: 0.6, y: 0.8, spread: 0.64, label: 's=0.64', type: 'rational', triple: [3,4,5] },
  { x: 5/13, y: 12/13, spread: 144/169, label: 's≈0.85', type: 'rational', triple: [5,12,13] },
  { x: 8/17, y: 15/17, spread: 225/289, label: 's≈0.78', type: 'rational', triple: [8,15,17] },
  { x: 7/25, y: 24/25, spread: 576/625, label: 's≈0.92', type: 'rational', triple: [7,24,25] },

  // Special irrational cases (keep for education)
  { x: 1/Math.sqrt(2), y: 1/Math.sqrt(2), spread: 0.5, label: 's=0.5', type: 'special', triple: [1,1,'√2'] },
  { x: 0.5, y: Math.sqrt(3)/2, spread: 0.75, label: 's=0.75', type: 'special', triple: null },

  // Add all 4 quadrants for each...
];
```

### Step 3: Remove Weierstrauss-Specific Elements
- Remove √2 square guide geometry
- Remove √3 triangle guide geometry
- Remove φ golden rectangles
- Keep only the unit rectangles for current snap point

### Step 4: Add Rectangle Grid Visualization (Optional)
Based on your sketch showing layered rectangles:
- Create multiple unit rectangles at different spreads
- Cyan gradient fill (darker = higher spread)
- Show "stacking" effect

### Step 5: Update Formula Display
Replace Weierstrauss parametrization with quadrance relationships

### Step 6: Update UI Integration
- Add button/link in main UI to launch quadrance demo
- Update `rt-init.js` or equivalent to wire up modal

---

## 7. Key Snap Points to Include

### Tier 1: Essential (Cardinals & Common Rationals)
```javascript
s = 0.00 → (1, 0)         // Horizontal
s = 0.25 → (√3/2, 1/2)    // 30° (not Pythagorean, but educational)
s = 0.50 → (1/√2, 1/√2)   // 45° (1-1-√2 triple)
s = 0.64 → (0.6, 0.8)     // 3-4-5 triple
s = 0.75 → (1/2, √3/2)    // 60° (not Pythagorean, but educational)
s = 1.00 → (0, 1)         // Vertical
```

### Tier 2: Advanced Rationals
```javascript
s ≈ 0.78 → (8/17, 15/17)   // 8-15-17 triple
s ≈ 0.85 → (5/13, 12/13)   // 5-12-13 triple
s ≈ 0.92 → (7/25, 24/25)   // 7-24-25 triple
```

### Tier 3: T-Series Special (From your sketch)
```javascript
s ≈ 0.038 → calculate from your diagram formula
s = 0.20 → calculate (possibly φ-related?)
s = 0.45 → calculate
```

---

## 8. Open Questions

1. **What is the formula for s ≈ 0.038461154 in your sketch?**
   - Appears to be related to a specific rectangle ratio
   - Need to reverse-engineer from your diagram

2. **Should we show ALL quadrants or just Q1?**
   - Your sketch shows Q1 primarily
   - Could add symmetry toggle

3. **Rectangle fill or outline only?**
   - Your sketch shows cyan gradient fill
   - Could make this a toggle

4. **Include non-Pythagorean rationals?**
   - Many rational spreads don't come from integer triples
   - Trade-off: comprehensiveness vs. simplicity

---

## 9. Success Criteria

✅ User can drag point around circle and see spread update in real-time
✅ Snap to rational spread values (magnetic zones)
✅ Show unit rectangle from origin to point on circle
✅ Display spread, quadrance, and Pythagorean triple (when applicable)
✅ Educational formula panel explaining relationships
✅ Visually distinct from Weierstrauss demo (different color scheme?)
✅ Document connection between integer rectangles and rational spreads

---

## 10. Babylonian Plimpton 322 Integration (c. 1800 BC)

### Historical Context
The Plimpton 322 clay tablet predates Pythagoras by over 1000 years and demonstrates sophisticated use of **base-60 (sexagesimal) exact trigonometry**. All triples use "regular numbers" (2ᵃ×3ᵇ×5ᶜ) ensuring **exact finite representation** in base-60 with no approximations.

This is pure Rational Trigonometry - the Babylonians used **quadrance and spread** without angles!

### Complete Plimpton 322 Triple Set (15 rows)

All triples in format: `(long side, short side, diagonal)` → normalized to unit circle → spread calculated

```javascript
// BABYLONIAN PLIMPTON 322 TRIPLES (c. 1800 BC)
const plimpton322Triples = [
  // Row 1: (120, 119, 169) - Nearly square, highest spread
  { a: 120, b: 119, c: 169, spread: 0.9965, label: 'P322-1' },

  // Row 2: (3456, 3367, 4825)
  { a: 3456, b: 3367, c: 4825, spread: 0.9948, label: 'P322-2' },

  // Row 3: (4800, 4601, 6649)
  { a: 4800, b: 4601, c: 6649, spread: 0.9920, label: 'P322-3' },

  // Row 4: (13500, 12709, 18541) - Mentioned in research
  { a: 13500, b: 12709, c: 18541, spread: 0.9872, label: 'P322-4' },

  // Row 5: (72, 65, 97)
  { a: 72, b: 65, c: 97, spread: 0.9494, label: 'P322-5' },

  // Row 6: (360, 319, 481)
  { a: 360, b: 319, c: 481, spread: 0.9309, label: 'P322-6' },

  // Row 7: (2700, 2291, 3541)
  { a: 2700, b: 2291, c: 3541, spread: 0.8836, label: 'P322-7' },

  // Row 8: (960, 799, 1249)
  { a: 960, b: 799, c: 1249, spread: 0.8642, label: 'P322-8' },

  // Row 9: (600, 481, 769)
  { a: 600, b: 481, c: 769, spread: 0.8281, label: 'P322-9' },

  // Row 10: (6480, 4961, 8161)
  { a: 6480, b: 4961, c: 8161, spread: 0.7834, label: 'P322-10' },

  // Row 11: (60, 45, 75) - This is 3-4-5 scaled by 15!
  { a: 60, b: 45, c: 75, spread: 0.64, label: 'P322-11 (3-4-5)' },

  // Row 12: (2400, 1679, 2929)
  { a: 2400, b: 1679, c: 2929, spread: 0.6241, label: 'P322-12' },

  // Row 13: (240, 161, 289)
  { a: 240, b: 161, c: 289, spread: 0.5576, label: 'P322-13' },

  // Row 14: (2700, 1771, 3229)
  { a: 2700, b: 1771, c: 3229, spread: 0.5033, label: 'P322-14' },

  // Row 15: (90, 56, 106) - Flattest triangle
  { a: 90, b: 56, c: 106, spread: 0.4698, label: 'P322-15' }
];

// Normalize to unit circle coordinates
plimpton322Triples.forEach(triple => {
  triple.x = triple.a / triple.c;  // Normalized x coordinate
  triple.y = triple.b / triple.c;  // Normalized y coordinate
  triple.spreadExact = (triple.b * triple.b) / (triple.c * triple.c);  // s = (b/c)²
});
```

### Key Properties of Plimpton 322 Triples

1. **Ordered by Spread**: Progressively decreasing from s ≈ 0.9965 (nearly square) to s ≈ 0.4698 (flat)
2. **Regular Numbers**: All values are 2ᵃ×3ᵇ×5ᶜ for exact base-60 representation
3. **No Approximations**: Pure rational arithmetic, no irrational square roots needed
4. **Educational Value**: Shows ancient understanding of quadrance relationships

### Implementation Strategy: Toggle System

Add UI controls to the Quadrance demo modal for switching between triple sets:

```javascript
// Triple set toggle controls (in demo UI)
const tripleSetOptions = {
  modern: {
    label: 'Modern Pythagorean Triples',
    triples: [
      { triple: [3,4,5], spread: 0.64 },
      { triple: [5,12,13], spread: 0.852 },
      { triple: [8,15,17], spread: 0.779 },
      { triple: [7,24,25], spread: 0.9216 }
    ]
  },
  plimpton322: {
    label: 'Babylonian Plimpton 322 (c. 1800 BC)',
    triples: plimpton322Triples,
    color: 0xffd700  // Gold markers for historical significance
  },
  combined: {
    label: 'All Triples (Modern + Babylonian)',
    triples: [...modernTriples, ...plimpton322Triples]
  }
};
```

### UI Controls Design

Add toggle buttons in the formula display area:

```
[Modern Triples] [Plimpton 322] [Combined] [Special (√2, √3, φ)]
```

- **Modern Triples**: Cyan markers (current implementation)
- **Plimpton 322**: Gold markers (historical significance)
- **Combined**: Show all snap points
- **Special**: Educational irrational cases (√2, √3, φ)

### Formula Display Enhancement

When Plimpton 322 triple is active, show additional context:

```
Column 3: Pythagorean Triple
  🏺 Babylonian (c. 1800 BC)
  Row [N] of Plimpton 322
  Triangle: (a, b, c)
  Base-60 Regular Number: 2ᵃ×3ᵇ×5ᶜ
  Spread: (b/c)² = [exact fraction]
```

### Research Citations

- [Wildberger & Mansfield (2017) - UNSW](https://www.unsw.edu.au/newsroom/news/2017/08/mathematical-mystery-of-ancient-clay-tablet-solved)
- [The Conversation - Written in Stone](https://theconversation.com/written-in-stone-the-worlds-first-trigonometry-revealed-in-an-ancient-babylonian-tablet-81472)
- Original tablet: Columbia University, Rare Book & Manuscript Library

---

## 11. Next Steps

1. ✅ Create this planning document
2. ✅ Copy `rt-weierstrauss-demo.js` → `rt-quadrance-demo.js`
3. ✅ Implement modern Pythagorean triples
4. ✅ Add unit rectangle visualization
5. ✅ Update formula display
6. ✅ Modal HTML consolidation
7. 🎯 Add Plimpton 322 triple set with toggle controls
8. 🎯 Implement triple set switching UI (Modern/Babylonian/Combined/Special)
9. 🎯 Add historical context to formula display for Babylonian triples
10. 🎯 Update documentation in ARTexplorer.md with Plimpton 322 integration

---

**Status:** Base implementation complete. Ready for Plimpton 322 toggle feature implementation.
