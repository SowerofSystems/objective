# RT-Pure Icosahedron Sphere Radii Calculation

## Base Icosahedron Construction

Vertices at `(0, ±a, ±b)` and cyclic permutations where:
- `a = r_out / √(1 + φ²)`
- `b = φ · a = φ · r_out / √(1 + φ²)`
- Using φ² = φ + 1, we get: `1 + φ² = φ + 2`

So:
- `a = r_out / √(φ + 2)`
- `b = φ · r_out / √(φ + 2)`

Vertex quadrance from origin:
```
Q_vertex = a² + b² = a²(1 + φ²) = a²(φ + 2)
         = (r_out² / (φ + 2)) · (φ + 2)
         = r_out²
```
✓ Confirms vertices lie on OutSphere of radius `r_out`

## Face Centers

Take a triangular face with vertices v0, v1, v2.
Example: vertices (0, a, b), (a, b, 0), (-a, b, 0)

Face center = (v0 + v1 + v2) / 3

For icosahedron, by symmetry, all face centers have the same quadrance from origin.

**RT Calculation:**
For regular icosahedron with edge length `e`:
- r_out = (φ/2)√(φ + 2/φ) · e
- r_in = (φ²/12)√3 · e

Ratio: r_in/r_out = [φ²√3/12] / [φ√(φ + 2/φ)/2]
                  = φ√3 / [6√(φ + 2/φ)]

Using φ² = φ + 1 and simplifying:
```
r_in/r_out = φ / (2√(3(φ + 2/φ))) = φ / (2√(3φ² + 6)/φ)) = φ² / (2√(3φ² + 6))
           = (φ + 1) / (2√(3(φ + 1) + 6)) = (φ + 1) / (2√(3φ + 9))
```

Quadrance ratio:
```
Q_in/Q_out = [(φ + 1)/(2√(3φ + 9))]²
           = (φ + 1)² / (4(3φ + 9))
           = (φ² + 2φ + 1) / (12φ + 36)
```

Using φ² = φ + 1:
```
Q_in/Q_out = (φ + 1 + 2φ + 1) / (12φ + 36)
           = (3φ + 2) / (12φ + 36)
           = (3φ + 2) / (12(φ + 3))
```

Let me verify this differently...

## Alternative: Direct Geometric Calculation

For icosahedron vertices at (0, ±a, ±b), (±a, 0, ±b), (±b, ±a, 0):

**Sample face:** vertices at (0, a, b), (-a, 0, b), (a, 0, b)
Wait, that's not right. Let me use actual vertex coordinates.

**Sample face vertices:**
- v0 = (0, a, b)  [vertex 0]
- v1 = (-a, b, 0) [vertex 6]
- v2 = (b, 0, a)  [vertex 8]

Face center = ((0 - a + b)/3, (a + b + 0)/3, (b + 0 + a)/3)
            = ((b - a)/3, (a + b)/3, (a + b)/3)

Quadrance from origin:
```
Q_face = [(b-a)/3]² + [(a+b)/3]² + [(a+b)/3]²
       = [(b-a)² + 2(a+b)²] / 9
       = [b² - 2ab + a² + 2a² + 4ab + 2b²] / 9
       = [3a² + 2ab + 3b²] / 9
```

Substituting b = φa and using φ² = φ + 1:
```
Q_face = [3a² + 2a·φa + 3φ²a²] / 9
       = a²[3 + 2φ + 3φ²] / 9
       = a²[3 + 2φ + 3(φ + 1)] / 9
       = a²[3 + 2φ + 3φ + 3] / 9
       = a²[6 + 5φ] / 9
```

Since a² = r_out² / (φ + 2):
```
Q_in = r_out² · (6 + 5φ) / [9(φ + 2)]
```

**Ratio:**
```
Q_in/Q_out = (6 + 5φ) / [9(φ + 2)]
```

Let me verify with φ ≈ 1.618:
- 6 + 5φ ≈ 6 + 8.09 = 14.09
- 9(φ + 2) ≈ 9(3.618) = 32.56
- Ratio ≈ 14.09/32.56 ≈ 0.433

sqrt(0.433) ≈ 0.658 for radius ratio
Expected r_in/r_out for icosahedron ≈ 0.7558

**This doesn't match! Let me recalculate the face vertices.**

## CORRECT Face Vertices

Looking at icosahedron edges, a proper triangular face would be:
- v0 = (0, a, b)
- v4 = (a, b, 0)
- v8 = (b, 0, a)

Face center = (a + b)/3 · (1, 1, 1)

Quadrance:
```
Q_face = [(a+b)/3]² · 3 = (a+b)² / 3
```

Using b = φa:
```
Q_face = a²(1 + φ)² / 3 = a²φ² / 3
```

Since φ² = φ + 1 and a² = r_out²/(φ + 2):
```
Q_in = r_out² · (φ + 1) / [3(φ + 2)]
     = r_out² · φ² / [3(φ + 2)]
```

**RT-Pure InSphere Ratio:**
```
Q_in/Q_out = φ² / [3(φ + 2)]
           = (φ + 1) / [3(φ + 2)]
```

Checking: (1.618 + 1) / (3 × 3.618) = 2.618 / 10.854 ≈ 0.241
sqrt(0.241) ≈ 0.491

Still wrong! The issue is I need to find the CLOSEST point on the face to origin, not the face center.

## CORRECT Approach: InSphere = Distance to Face Plane

For InSphere, we need the perpendicular distance from origin to the triangular face PLANE.

The face plane equation for face with vertices v0, v1, v2:
- Normal n = (v1 - v0) × (v2 - v0) normalized
- Distance d = |v0 · n̂|

For regular icosahedron, all faces are equidistant from center (by symmetry).

**Standard icosahedron inscribed/circumscribed radii:**
- OutSphere: r_out = (φ/2)√(φ√5) = (φ²/2)√(5/φ²)
- InSphere: r_in = φ²/(2√3)

For icosahedron with r_out = 1:
```
r_in/r_out = [φ²/(2√3)] / [(φ/2)√(φ√5)]
```

This is getting complex. Let me use known ratios:

**Known RT-Pure Ratios for Regular Icosahedron:**
```
r_in/r_out = √(3(φ+1)/20) ≈ 0.7558
r_mid/r_out = 1/√φ ≈ 0.8090 ≈ φ/2
```

Actually, simpler:
- MidSphere: r_mid² = r_out² · φ²/(φ² + 1) = r_out² · φ/(φ + 2)
- InSphere: Need to calculate properly from face plane distance

Let me look up the exact formula...
