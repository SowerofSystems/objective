# ARTexplorer RT-Pure Formulas - Mathematical Review

**Purpose:** Reference document for mathematical review and optimization
**Reviewer:** Kieran Thomson
**Date Created:** 2025-12-26

**Task:** Check all formulas for potential algebraic simplifications or optimizations using golden ratio identities.

---

## Core Constants & Identities

### Golden Ratio φ (phi)

```javascript
const phi = 0.5 * (1 + Math.sqrt(5));  // φ ≈ 1.618033988749...
```

### Fundamental Golden Ratio Identities

```
φ² = φ + 1                    // Primary identity
φ³ = 2φ + 1                   // Derived from φ² = φ + 1
φ⁴ = 3φ + 2                   // Derived from φ³ = 2φ + 1
φ⁵ = 5φ + 3                   // Fibonacci pattern emerges

1/φ = φ - 1                   // Reciprocal identity
φ - 1/φ = 1                   // Related identity
φ + 1/φ = √5                  // Sum identity
```

**Note:** Any expression with φ can potentially be simplified using these identities.

---

## Rational Trigonometry Foundations

### Core RT Concepts

**Quadrance (Q):** Replaces "distance squared"
```
Q = (x₂ - x₁)² + (y₂ - y₁)² + (z₂ - z₁)²
```

**Spread (s):** Replaces "sin²θ"
```
s = 1 - ((v₁ · v₂)² / (Q₁ · Q₂))
```

### RT Principles Applied

1. ✅ Work in quadrance space (Q) throughout calculations
2. ✅ Only use √ for final visualization (deferred sqrt expansion)
3. ✅ Express all relationships algebraically (no trig functions)
4. ❌ NO Math.PI, Math.sin, Math.cos, Math.tan, Math.atan, etc.

---

## Icosahedron Geometry

### Base Construction

**Vertices:** Located at cyclic permutations of `(0, ±a, ±b)` where:

```javascript
// Given OutSphere radius r_out (what user specifies as halfSize):
const phi = 0.5 * (1 + Math.sqrt(5));

a = r_out / Math.sqrt(phi + 2);
b = phi * a = (phi * r_out) / Math.sqrt(phi + 2);
```

**Simplification Check:**
Can `√(φ + 2)` be expressed using golden ratio identities?
```
φ + 2 = φ + 2
      = (φ² + φ + 1) - φ   // Since φ² = φ + 1
      = φ² + 1
```
So: `√(φ + 2) = √(φ² + 1)`

**Question:** Is there a simpler form?

### Vertex Quadrance Validation

```
Q_vertex = a² + b²
         = a²(1 + φ²)
         = a²(φ + 2)          // Using φ² = φ + 1
         = [r_out²/(φ+2)] · (φ+2)
         = r_out²             // ✓ Confirms OutSphere
```

---

## Geodesic Sphere Projections - CRITICAL FORMULAS

### Icosahedron: OutSphere (Circumsphere)

**Passes through all vertices.**

```javascript
// User specifies this radius as halfSize
Q_out = halfSize * halfSize;
```

**Quadrance Ratio:** `Q_out/Q_out = 1` (trivial)

---

### Icosahedron: MidSphere (Midsphere)

**Tangent to all edge midpoints.**

**Current Implementation:**
```javascript
const phi = 0.5 * (1 + Math.sqrt(5));
const ratio_mid_sq = (phi + 1) / (phi + 2);
Q_mid = Q_out * ratio_mid_sq;
```

**Derivation:**
```
Edge midpoint example: midpoint of vertices (0, a, b) and (a, b, 0)
Midpoint = (a/2, (a+b)/2, b/2)

Q_mid = (a/2)² + ((a+b)/2)² + (b/2)²
      = (a² + (a+b)² + b²) / 4
      = (a² + a² + 2ab + b² + b²) / 4
      = (2a² + 2ab + 2b²) / 4
      = (a² + ab + b²) / 2

Substitute b = φ·a:
Q_mid = (a² + a·φa + φ²a²) / 2
      = a²(1 + φ + φ²) / 2

Using φ² = φ + 1:
Q_mid = a²(1 + φ + φ + 1) / 2
      = a²(2φ + 2) / 2
      = a²(φ + 1)

Since a² = r_out² / (φ + 2):
Q_mid = r_out² · (φ + 1) / (φ + 2)
```

**Quadrance Ratio:**
```
Q_mid/Q_out = (φ + 1) / (φ + 2)
            = φ² / (φ + 2)      // Using φ² = φ + 1
```

**Numerical Check:**
```
φ ≈ 1.618
φ + 1 ≈ 2.618
φ + 2 ≈ 3.618
Ratio ≈ 2.618/3.618 ≈ 0.7236
√0.7236 ≈ 0.8507 (radius ratio)
```

**QUESTION FOR KIERAN:**
Can `(φ + 1) / (φ + 2)` be simplified further? Or is `φ² / (φ + 2)` the canonical form?

---

### Icosahedron: InSphere (Insphere)

**Tangent to all face planes (perpendicular distance from origin to faces).**

**Current Implementation:**
```javascript
const phi = 0.5 * (1 + Math.sqrt(5));
const ratio_in_sq = (3 * phi + 2) / (3 * (phi + 2));
Q_in = Q_out * ratio_in_sq;
```

**Derivation:**

Sample face with vertices: `v0 = (0, a, b)`, `v4 = (a, b, 0)`, `v8 = (b, 0, a)`

**Step 1: Face normal (cross product)**
```
v1 - v0 = (a, b-a, -b)
v2 - v0 = (b, -a, a-b)

Normal n = (v1-v0) × (v2-v0)
         = |  i      j      k    |
           |  a    b-a    -b     |
           |  b    -a    a-b     |

n_x = (b-a)(a-b) - (-b)(-a) = -(b-a)² - ab
n_y = (-b)(b) - (a)(a-b) = -b² - a(a-b) = -b² - a² + ab
n_z = (a)(-a) - (b-a)(b) = -a² - b(b-a) = -a² - b² + ab

By symmetry of regular icosahedron, face normal direction is (1, 1, 1).
Normalized: n̂ = (1, 1, 1) / √3
```

**Step 2: Perpendicular distance to face plane**
```
Face center = (v0 + v1 + v2) / 3
            = ((a+b)/3, (a+b)/3, (a+b)/3)
            = (a+b)/3 · (1, 1, 1)

Distance d = |face_center · n̂|
           = |(a+b)/3 · (1,1,1) · (1,1,1)/√3|
           = |(a+b)/3 · 3/√3|
           = (a+b) / √3

Q_in = d²
     = [(a+b) / √3]²
     = (a+b)² / 3
```

**Step 3: Substitute b = φ·a**
```
Q_in = (a + φa)² / 3
     = a²(1 + φ)² / 3
     = a²φ⁴ / 3         // Using (1 + φ)² = φ² · φ² = φ⁴

Wait, let me verify: (1 + φ)² = 1 + 2φ + φ²
                              = 1 + 2φ + φ + 1    // Using φ² = φ + 1
                              = 2 + 3φ

So:
Q_in = a²(2 + 3φ) / 3
```

**Step 4: Substitute a² = r_out² / (φ + 2)**
```
Q_in = [r_out² / (φ + 2)] · (2 + 3φ) / 3
     = r_out² · (2 + 3φ) / [3(φ + 2)]
```

**Quadrance Ratio:**
```
Q_in/Q_out = (2 + 3φ) / [3(φ + 2)]
           = (3φ + 2) / [3(φ + 2)]    // Reordered terms
```

**Alternative form using φ⁴:**
```
Since (1 + φ)² = φ² · φ² and we need to express (3φ + 2):
φ⁴ = 3φ + 2              // From identity list

So: Q_in/Q_out = φ⁴ / [3(φ + 2)]
```

**Numerical Check:**
```
φ ≈ 1.618
3φ + 2 ≈ 3(1.618) + 2 = 4.854 + 2 = 6.854
3(φ + 2) ≈ 3(3.618) = 10.854
Ratio ≈ 6.854/10.854 ≈ 0.6315
√0.6315 ≈ 0.7947 (radius ratio)
```

**CRITICAL QUESTION FOR KIERAN:**

You suggested simplifications during our conversation:
1. First attempt: `9 / (7φ)`
2. Second attempt: `9 / 7`

Let me check these numerically:
```
9/(7φ) ≈ 9/(7·1.618) ≈ 9/11.326 ≈ 0.7947   // This is the RADIUS ratio!
(9/(7φ))² ≈ 0.6316                          // This is the QUADRANCE ratio!

Our formula: (3φ + 2) / [3(φ + 2)] ≈ 0.6315  // Matches!
```

**So the question is:** Can we prove algebraically that:
```
(3φ + 2) / [3(φ + 2)] = (9 / (7φ))²
```

Or equivalently (for radius):
```
√[(3φ + 2) / [3(φ + 2)]] = 9 / (7φ)
```

**If this is true, it would simplify the code significantly!**

---

### Tetrahedron Sphere Projections

**Tetrahedron vertices:** `(±1, ±1, ±1)` with appropriate sign pattern

#### Tetrahedron: OutSphere
```javascript
// Circumsphere through vertices at (±1, ±1, ±1)
// Q_vertex = 1² + 1² + 1² = 3
Q_out = 3 * halfSize * halfSize;  // 3s²
```

#### Tetrahedron: MidSphere
```javascript
// Midsphere tangent to edge midpoints
// Edge midpoint example: midpoint of (1,1,1) and (1,-1,-1) = (1, 0, 0)
// Q_mid = 1² = 1 (for unit tetrahedron)
// Ratio: Q_mid/Q_vertex = 1/3
const ratio_mid_sq = 1 / 3;
Q_mid = (3 * halfSize * halfSize) * ratio_mid_sq;
// Simplifies to: Q_mid = halfSize²
```

**QUESTION FOR KIERAN:**
Is there a golden ratio relationship for tetrahedron spheres, or is it purely rational (1/3)?

#### Tetrahedron: InSphere
```javascript
// Insphere tangent to face planes
// For regular tetrahedron: r_in/r_out = 1/3
// Q_in/Q_out = (1/3)² = 1/9
const ratio_in_sq = 1 / 9;
Q_in = (3 * halfSize * halfSize) * ratio_in_sq;
// Simplifies to: Q_in = (1/3) * halfSize²
```

**Ratios Summary:**
```
Q_out : Q_mid : Q_in = 3 : 1 : (1/3)
                     = 9 : 3 : 1      // Integer ratio!
```

---

### Octahedron Sphere Projections

**Octahedron vertices:** `(±s, 0, 0)`, `(0, ±s, 0)`, `(0, 0, ±s)`

#### Octahedron: OutSphere
```javascript
// Circumsphere through vertices
// Q_vertex = s² (each vertex is distance s from origin)
Q_out = halfSize * halfSize;  // s²
```

#### Octahedron: MidSphere
```javascript
// Midsphere tangent to edge midpoints
// Edge midpoint example: midpoint of (s,0,0) and (0,s,0) = (s/2, s/2, 0)
// Q_mid = (s/2)² + (s/2)² = s²/2
// Ratio: Q_mid/Q_out = (s²/2) / s² = 1/2
const ratio_mid_sq = 1 / 2;
Q_mid = Q_out * ratio_mid_sq;
```

#### Octahedron: InSphere
```javascript
// Insphere tangent to face planes
// For regular octahedron: r_in/r_out = 1/√3
// Q_in/Q_out = (1/√3)² = 1/3
const ratio_in_sq = 1 / 3;
Q_in = Q_out * ratio_in_sq;
```

**Ratios Summary:**
```
Q_out : Q_mid : Q_in = 1 : (1/2) : (1/3)
                     = 6 : 3 : 2      // Integer ratio!
```

**QUESTION FOR KIERAN:**
Octahedron ratios are all simple fractions. Any connection to φ, or purely rational?

---

## Edge Quadrance Calculations

### Edge Quadrance Formula (3D)

```javascript
// RT.edgeQuadrance(v1, v2)
const dx = v2.x - v1.x;
const dy = v2.y - v1.y;
const dz = v2.z - v1.z;
return dx * dx + dy * dy + dz * dz;
```

### Expected Edge Quadrances

**Cube (halfSize = s):**
```
Q_edge = 4s²              // Edge length = 2s
```

**Tetrahedron (halfSize = s):**
```
Vertices at (±1, ±1, ±1) scaled to circumsphere radius s√3
Edge example: (1,1,1) to (1,-1,-1)
Q_edge = (0)² + (2)² + (2)² = 8
Scaled: Q_edge = 8s² for circumsphere radius s√3
        Q_edge = 8·(s²/3) for halfSize s
```

**Icosahedron (halfSize = s):**
```
Edge quadrance in terms of a, b:
Q_edge = (varies, but should be constant for regular icosahedron)

Need to verify: What is Q_edge for icosahedron with r_out = s?
```

**QUESTION FOR KIERAN:**
What is the edge quadrance for a regular icosahedron in terms of OutSphere radius?

---

## Geodesic Subdivision

### Barycentric Subdivision (Frequency f)

**Subdivides each triangular face into f² smaller triangles.**

```javascript
// For each face triangle with vertices v0, v1, v2:
// Generate grid of points using barycentric coordinates

for (let i = 0; i <= freq; i++) {
  for (let j = 0; j <= freq - i; j++) {
    const k = freq - i - j;

    // Barycentric weights (sum to freq)
    const u = i / freq;  // Weight for v0
    const v = j / freq;  // Weight for v1
    const w = k / freq;  // Weight for v2

    // Interpolated vertex
    const x = u * v0.x + v * v1.x + w * v2.x;
    const y = u * v0.y + v * v1.y + w * v2.y;
    const z = u * v0.z + v * v1.z + w * v2.z;
  }
}
```

**No optimization needed here - purely linear interpolation (RT-pure by nature).**

---

## Sphere Projection (Normalization)

### Current Implementation

```javascript
// Given target quadrance Q_target and subdivided vertex v:
const Q_current = v.x * v.x + v.y * v.y + v.z * v.z;
const scale = Math.sqrt(Q_target / Q_current);

v_projected = {
  x: v.x * scale,
  y: v.y * scale,
  z: v.z * scale
};
```

### RT-Pure Verification

**Is this RT-pure?**
- ✅ Q_current calculated directly (no sqrt)
- ✅ Q_target calculated from algebraic formula
- ⚠️ Uses ONE sqrt for final projection (deferred sqrt expansion - acceptable in RT)

**Alternative formulation (avoid normalization language):**
```javascript
// Scale vertex to target quadrance
const Q_current = v.x² + v.y² + v.z²;
const scale_squared = Q_target / Q_current;
const scale = Math.sqrt(scale_squared);  // Deferred sqrt - only used once
```

---

## Potential Optimizations - Review Checklist

### For Kieran to Check:

1. **Icosahedron InSphere Formula:**
   - Current: `Q_in/Q_out = (3φ + 2) / [3(φ + 2)]`
   - Proposed: `Q_in/Q_out = (9/(7φ))²` or equivalent
   - **Task:** Prove algebraically if these are equal

2. **Icosahedron MidSphere Formula:**
   - Current: `Q_mid/Q_out = (φ + 1) / (φ + 2)`
   - Alternative: `Q_mid/Q_out = φ² / (φ + 2)`
   - **Task:** Which form is simpler for computation?

3. **Icosahedron Base Construction:**
   - Current: `a = r_out / √(φ + 2)` and `b = φ·a`
   - Note: `φ + 2 = φ² + 1`
   - **Task:** Can `√(φ² + 1)` be simplified?

4. **Golden Ratio Higher Powers:**
   - We use: `φ² = φ + 1`, `φ⁴ = 3φ + 2`
   - **Task:** Are there identities that simplify expressions like `(3φ + 2) / (3φ + 6)`?

5. **Tetrahedron & Octahedron:**
   - Currently use simple rational fractions (1/2, 1/3, 1/9, etc.)
   - **Task:** Verify these have no golden ratio relationships (should be purely rational)

6. **General Question:**
   - Are there any expressions with nested √ that can be denested?
   - Example: `√(φ + 2)` versus `√(φ² + 1)` - is one "simpler"?

---

## Code Implementation Locations

### Current Formulas in ARTexplorer.html

**Icosahedron Geodesic (lines 1273-1294):**
```javascript
} else if (projection === 'in') {
  const phi = 0.5 * (1 + Math.sqrt(5));
  const ratio_in_sq = (3 * phi + 2) / (3 * (phi + 2));
  Q_target = (halfSize * halfSize) * ratio_in_sq;
} else if (projection === 'mid') {
  const phi = 0.5 * (1 + Math.sqrt(5));
  const ratio_mid_sq = (phi + 1) / (phi + 2);
  Q_target = (halfSize * halfSize) * ratio_mid_sq;
}
```

**Tetrahedron Geodesic (lines ~1314-1381)**
**Octahedron Geodesic (lines ~1382-1450)**

---

## Testing & Validation

### Numerical Verification Values

**Icosahedron (OutSphere radius = 1):**
```
φ ≈ 1.6180339887
φ + 1 ≈ 2.6180339887
φ + 2 ≈ 3.6180339887
3φ + 2 ≈ 6.8541019662

Q_mid/Q_out ≈ 2.618/3.618 ≈ 0.7236
Q_in/Q_out ≈ 6.854/10.854 ≈ 0.6315

r_mid/r_out ≈ √0.7236 ≈ 0.8507
r_in/r_out ≈ √0.6315 ≈ 0.7947
```

**Tetrahedron (OutSphere radius = √3):**
```
Q_out = 3
Q_mid = 1
Q_in = 1/3

r_mid/r_out = 1/√3 ≈ 0.5774
r_in/r_out = 1/3 ≈ 0.3333
```

**Octahedron (OutSphere radius = 1):**
```
Q_out = 1
Q_mid = 1/2
Q_in = 1/3

r_mid/r_out = 1/√2 ≈ 0.7071
r_in/r_out = 1/√3 ≈ 0.5774
```

---

## Questions Summary for Kieran

1. **Can you prove algebraically that `(3φ + 2) / [3(φ + 2)] = (9/(7φ))²`?**
   - If true, this would simplify InSphere calculation significantly

2. **Is `(φ + 1) / (φ + 2)` or `φ² / (φ + 2)` the better form for MidSphere?**
   - Which is more computationally efficient?

3. **Can `√(φ + 2)` be simplified using golden ratio identities?**
   - We know `φ + 2 = φ² + 1`, but is `√(φ² + 1)` simpler somehow?

4. **Are there any denesting opportunities?**
   - Any nested radicals that can be simplified?

5. **General optimization suggestions?**
   - Any other algebraic simplifications you see?

---

**END OF MATHEMATICAL REFERENCE**

**Next Steps:**
1. Kieran reviews formulas for algebraic simplifications
2. Check proposed equivalences (especially InSphere 9/(7φ) claim)
3. Suggest any computational optimizations
4. Verify all golden ratio identities are correctly applied
