## Pyramidal Roof Height (Rational / Quadrance-Based)

This note defines how to compute the height of a pyramidal roof for use in
geometry rendering (e.g. D3), following a rational / Wildberger-style approach.
Angles are not used; all calculations are based on areas and quadrance.
Square roots are deferred until the final render step.

---

### Definitions

- Base dimensions:
  - `w` = width
  - `l` = length
- Base area:
  - `A_base = w * l`
- Roof-area ratio:
  - `R = totalRoofArea / A_base`
- Apex is centered above the base.

Constraint:
- `R >= 1` (roof area must be at least the base area)

---

### Square Base (w = l = a)

For a symmetric square pyramid:

- Slant height:
  - `s = (R * a) / 2`
- Height quadrance:
  - `h² = (a² / 4) * (R² - 1)`
- Height:
  - `h = (a / 2) * sqrt(R² - 1)`

```js
// Symmetric square pyramid
function pyramidHeightSquare(side, areaRatio) {
  if (areaRatio < 1) {
    throw new Error("Roof area ratio must be >= 1");
  }

  const h2 = (side * side / 4) * (areaRatio * areaRatio - 1);
  return Math.sqrt(h2); // defer sqrt if desired
}

Rectangular Base (w ≠ l)
A centered apex with equal face areas is generally not possible unless
w === l or R === 1.
In practice, treat width-faces and length-faces independently.
Roof area:
A_roof = R * w * l
Area per face:
A_face = A_roof / 4
Slant heights:
s_w = (2 * A_face) / w = (R * l) / 2
s_l = (2 * A_face) / l = (R * w) / 2
Height quadrance (per axis):
h_w² = s_w² - (w / 2)²
h_l² = s_l² - (l / 2)²

// Rectangular base, independent face slants
function pyramidHeightRectangle(width, length, areaRatio) {
  if (areaRatio < 1) {
    throw new Error("Roof area ratio must be >= 1");
  }

  const roofArea = areaRatio * width * length;
  const faceArea = roofArea / 4;

  const sW = (2 * faceArea) / width;
  const sL = (2 * faceArea) / length;

  const h2w = sW * sW - (width * width) / 4;
  const h2l = sL * sL - (length * length) / 4;

  if (Math.abs(h2w - h2l) > 1e-9) {
    console.warn("Non-congruent faces: height differs by axis");
  }

  // Conservative choice for rendering
  return Math.sqrt(Math.min(h2w, h2l));
}

Prefer working with h² (height quadrance) internally.
Only take sqrt at the final render step.
No angles, trig functions, or slopes are required.
This formulation is stable, algebraic, and suitable for programmatic geometry.


