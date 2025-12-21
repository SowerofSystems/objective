# WOMBAT Prismatic Extrusion - Terminology & Implementation
## Date: 2025-12-20
## Status: IMPLEMENTATION COMPLETE

---

## Core Concept: Prismatic Extrusion

A **prismatic extrusion** sweeps a 2D profile along an axis to generate a 3D form:

```
2D PROFILE (cross-section)    EXTRUDE ALONG AXIS    3D SOLID
      /\                            ══════>           ________
     /  \                                            /\      /\
    /____\                                          /  \    /  \
                                                   /____\  /____\
```

The profile defines the **cross-sectional shape**, and extrusion creates depth.

---

## Terminology & Notation

### Rational Trigonometry (Wildberger)

Following N.J. Wildberger's rational trigonometry notation:

- **Q (Quadrance)**: Square of a distance, `Q = distance²`
  - Avoids square roots until final value needed
  - Example: `Q_width = width²` instead of `distance = √value`

- **s (Spread)**: Ratio of quadrances, `s = Q/R`
  - Replaces traditional angles
  - Example: `s = 36/100 = 0.36` (from diagram)

- **R**: Quadrance of slope/hypotenuse
  - In roof geometry: `R = slopeLength²`
  - Example: `R = 100` (from diagram: slope² = 100)

### Building Geometry Terms

**Footprint Dimensions:**
- `footprintArea`: Total ground area (d_95, SACRED)
- `width`: SHORT dimension of footprint
- `length`: LONG dimension of footprint
- `aspectRatio`: length/width (from d_154 slider)

**Orientation:**
- `ridgeLength`: Dimension parallel to ridge line
  - Gable: LONG dimension (ridge runs parallel to long walls)
  - Shed: LONG dimension (ridge at one end)
- `span`: Dimension perpendicular to ridge
  - Gable: SHORT dimension (triangle base)
  - Shed: SHORT dimension (slope drop direction)

**Profile vs Extrusion:**
- `profile.width`: Width of 2D cross-section
  - Gable: SHORT (triangle base, perpendicular to ridge)
  - Shed: LONG (trapezoid face, parallel to ridge)
- `extrusionDepth`: Distance to sweep profile
  - Gable: LONG (parallel to ridge)
  - Shed: SHORT (perpendicular to ridge)

---

## Implementation Details

### Gable Roof Geometry

**Ridge Orientation**: Parallel to LONG walls

**2D Profile (cross-section perpendicular to ridge):**
```
      /\          ← Peak at center
     /  \
    /____\        ← Triangle base = SHORT dimension
    width = SHORT = ridgeLength (confusing naming!)
```

**Rational Trig Calculation:**
```javascript
// Roof area constraint
const roofArea = d_85;  // SACRED (e.g., 1411.52 m²)

// Dimensions (SWAPPED from parameter names!)
const actualRidgeLength = span;      // LONG (74.19m)
const actualSpan = ridgeLength;      // SHORT (20.19m)

// Area = 2 slopes × (ridge × slopeLength)
// Each slope is a rectangle: ridge × slopeLength
const slopeLength = roofArea / (2 * actualRidgeLength);

// Pythagorean using Quadrance (Q)
// R = Q_slope = slopeLength²
const R = slopeLength * slopeLength;

// Triangle base = SHORT dimension, half-width from center
const Q_halfBase = (actualSpan * actualSpan) / 4;

// Q_height = R - Q_base (Pythagorean theorem in Q-space)
const Q_height = R - Q_halfBase;

// Final height (expand irrational only when needed)
const roofHeight = Math.sqrt(Q_height);
```

**3D Extrusion:**
```javascript
profile.width = ridgeLength;  // SHORT (20.19m) - triangle base
extrusionDepth = span;         // LONG (74.19m) - ridge direction
```

**Result**: Ridge runs 74.19m parallel to long walls ✓

---

### Shed Roof Geometry

**Ridge Orientation**: At one END of building (perpendicular to length)

**2D Profile (face parallel to ridge):**
```
    ________      ← High ridge
   /
  /
 /___________    ← Low eave
 width = LONG = span
```

**Rational Trig Calculation:**
```javascript
// Dimensions (SWAPPED from parameter names!)
const actualRidgeLength = span;      // LONG (74.19m)
const actualSpan = ridgeLength;      // SHORT (20.19m)

// Area = ridge × slopeLength (one rectangular slope)
const slopeLength = roofArea / actualRidgeLength;

// Pythagorean using Quadrance
const R = slopeLength * slopeLength;
const Q_span = actualSpan * actualSpan;
const Q_height = R - Q_span;
const roofHeight = Math.sqrt(Q_height);
```

**3D Extrusion:**
```javascript
profile.width = span;          // LONG (74.19m) - ridge runs across this
extrusionDepth = ridgeLength;  // SHORT (20.19m) - perpendicular to ridge
```

**Result**: Ridge runs 74.19m at building end ✓

---

## The Confusing Parameter Names (Legacy Issue)

**Historical naming confusion:**
```javascript
function solveGableRoof(roofArea, ridgeLength, span, footprintArea) {
  // INCOMING PARAMETERS:
  // ridgeLength = min(width, length) = SHORT
  // span = max(width, length) = LONG

  // BUT FOR GABLE, WE NEED:
  // Ridge should be LONG
  // Span should be SHORT

  // SO WE SWAP:
  const actualRidgeLength = span;      // LONG (what ridge should be)
  const actualSpan = ridgeLength;      // SHORT (what span should be)
}
```

This naming issue arose because the parameters were initially designed for shed roofs, where:
- Ridge is at the end (could be short or long depending on orientation)
- Span is the distance the slope travels

For gable roofs, the architectural convention differs:
- Ridge runs parallel to long walls (LONG dimension)
- Span is perpendicular to ridge (SHORT dimension)

**TODO (future refactor)**: Rename parameters to be roof-type agnostic:
- `dimension1` and `dimension2` instead of `ridgeLength` and `span`
- Or pass `{width, length}` object and let each roof type decide orientation

---

## Constraint Hierarchy (As Implemented)

### SACRED Constraints (always satisfied):
1. **Footprint Area (d_95)** → determines width × length
2. **Roof Area (d_85)** → determines roof height via rational trig
3. **Aspect Ratio (d_154)** → reshapes footprint maintaining area

### ATTEMPTED Constraints (compressed if needed):
4. **Wall Height (g_106 × stories)** → starting point, may compress
5. **Volume (d_105)** → calculated and compared, may violate

### Volume Resolution Logic:
```javascript
// Start with reference wall height
wallHeightTarget = g_106 × stories;

// Calculate resulting volume
calculatedVolume = wallVolume + roofVolume;

// If exceeds target:
if (calculatedVolume > targetVolume) {
  // Compress walls to fit
  wallHeight = (targetVolume - roofVolume) / footprintArea;
  // Flag violation
  wallHeightViolation = true;
}

// If roof alone exceeds total:
if (roofVolume > targetVolume) {
  // Use reference height anyway (surface area priority)
  wallHeight = wallHeightTarget;
  // Flag critical violation
  console.error("Roof volume exceeds total volume");
}
```

---

## Rational Trigonometry Best Practices

### Defer Square Roots

**Good** (defer expansion):
```javascript
const R = slopeLength * slopeLength;      // Quadrance
const Q_base = (span * span) / 4;         // Quadrance
const Q_height = R - Q_base;              // Arithmetic in Q-space
const height = Math.sqrt(Q_height);       // Expand only at end
```

**Avoid** (premature expansion):
```javascript
const slope = Math.sqrt(someValue);       // Too early!
const result = slope * slope;             // Wasted sqrt then square
```

### Use Ratios

**Good** (work with ratios):
```javascript
const s = Q_base / R;                     // Spread (ratio)
// Calculations with s remain rational
```

**Avoid** (trigonometric functions):
```javascript
const angle = Math.atan2(rise, run);      // Introduces irrationals
const slope = Math.tan(angle);            // Compounds errors
```

---

## Glossary of Current Variable Names

| Variable | Meaning | Typical Value |
|----------|---------|---------------|
| `width` | SHORT footprint dimension | 20.19m |
| `length` | LONG footprint dimension | 54.52m |
| `ridgeLength` | min(width, length) | 20.19m (SHORT) |
| `span` | max(width, length) | 54.52m (LONG) |
| `actualRidgeLength` | SWAPPED for gable/shed | 54.52m (LONG) |
| `actualSpan` | SWAPPED for gable/shed | 20.19m (SHORT) |
| `slopeLength` | Roof slope distance | 9.51m (gable example) |
| `roofHeight` | Vertical rise | 5.61m (gable example) |
| `profile.width` | 2D profile width | Gable: 20.19m, Shed: 54.52m |
| `extrusionDepth` | 3D sweep distance | Gable: 54.52m, Shed: 20.19m |

---

## Future Improvements

1. **Refactor parameter names** to eliminate swap confusion
2. **Implement full rational trig** using `s` (spread) consistently
3. **Add spread-based roof pitch display** instead of degrees
4. **Optimize calculations** to minimize square root operations
5. **Add validation** for geometric feasibility before rendering

---

## References

- N.J. Wildberger: "Divine Proportions: Rational Trigonometry to Universal Geometry"
- ArchiCad GDL: Prismatic extrusion concept
- Current implementation: Section19.js (solveGableRoof, solveShedRoof)
