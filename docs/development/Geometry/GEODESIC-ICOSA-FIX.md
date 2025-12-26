# Geodesic Icosahedron Bug Fixes

## Issues Identified

### 1. **CRITICAL: Incorrect InSphere and MidSphere Radius Formulas**

**Location**: `ARTexplorer.html` lines 1272-1285

**Current (WRONG) Code**:
```javascript
} else if (projection === 'in') {
  // InSphere: Tangent to face centers
  const phi = 0.5 * (1 + Math.sqrt(5));
  const cos_arctan_2_sq = 1 / (1 + 4); // cos²(arctan(2)) = 1/(1+2²) = 1/5
  Q_target = (halfSize * halfSize) * (phi * phi / (3 * Math.sqrt(3)));
  console.log(`  Projection: InSphere (tangent to face centers)`);
} else if (projection === 'mid') {
  // MidSphere: Tangent to edge centers
  const phi = 0.5 * (1 + Math.sqrt(5));
  Q_target = (halfSize * halfSize) * (phi / Math.sqrt(3));
  console.log(`  Projection: MidSphere (tangent to edge centers)`);
}
```

**Problems**:
1. The formulas are completely garbled and mathematically incorrect
2. `cos_arctan_2_sq` is calculated but never used
3. The relationship between halfSize (which is OutSphere radius) and InSphere/MidSphere is wrong

**Correct Icosahedron Sphere Radii** (for unit edge length `a = 1`):
```
OutSphere (circumradius, through vertices):
  r_out = (φ/2) * √(φ + 2/φ)
  r_out ≈ 0.9511

MidSphere (tangent to edge midpoints):
  r_mid = φ/2
  r_mid ≈ 0.8090

InSphere (tangent to face centers):
  r_in = (φ²) / (2√3)
  r_in ≈ 0.7558

Ratios:
  r_mid / r_out = 1/√(φ + 2/φ) ≈ 0.8507
  r_in / r_out = φ / √(3(φ + 2/φ)) ≈ 0.7947
```

**For icosahedron scaled to OutSphere radius = `halfSize`**:
```javascript
// OutSphere: Through vertices (user specifies this radius)
Q_out = halfSize * halfSize;

// MidSphere: Tangent to edge midpoints
const ratio_mid = 1 / Math.sqrt((1 + Math.sqrt(5))/2 + 2/((1 + Math.sqrt(5))/2));
Q_mid = Q_out * (ratio_mid * ratio_mid);

// InSphere: Tangent to face centers
const phi = (1 + Math.sqrt(5)) / 2;
const ratio_in = phi / Math.sqrt(3 * ((1 + Math.sqrt(5))/2 + 2/((1 + Math.sqrt(5))/2)));
Q_in = Q_out * (ratio_in * ratio_in);
```

**RT-Pure Alternative** (using golden ratio relationships):
```javascript
const phi = (1 + Math.sqrt(5)) / 2;  // Golden ratio

// For icosahedron with given OutSphere radius:
Q_out = halfSize * halfSize;

// MidSphere: r_mid = r_out * cos(dihedral_angle/2)
// For icosahedron: cos(dihedral/2) = 1/√(φ²+1) = 1/φ√φ
const Q_mid = Q_out * (1 / (phi * Math.sqrt(phi)));

// InSphere: r_in = r_out * (φ²)/(2φ√(φ+2/φ))
const Q_in = Q_out * ((phi*phi*phi*phi) / (12 * (phi + 2/phi)));
```

### 2. **Frequency Slider Glitching**

**Location**: `ARTexplorer.html` line 2179

**Current Code**:
```javascript
document.getElementById('geodesicFrequency').addEventListener('input', updateGeometry);
```

**Problem**:
- The `input` event fires continuously as the slider moves
- Each event triggers complete geodesic rebuild (expensive for high frequencies)
- Causes UI freezing/glitching during slider movement

**Solution**: Use `change` event instead of `input`:
```javascript
document.getElementById('geodesicFrequency').addEventListener('change', updateGeometry);
```

This will only rebuild geometry when user **releases** the slider, not during dragging.

**Alternative**: Debounce the input event to limit rebuild frequency.

---

## Implementation Plan

### Phase 1: Fix Sphere Radius Calculations

1. **Read** the current `geodesicIcosahedron` function (lines 1245-1311)
2. **Calculate correct ratios** using golden ratio φ
3. **Replace** InSphere and MidSphere Q_target calculations with correct formulas
4. **Add comments** explaining the geometric relationships
5. **Test** with console logs to verify radii are correct

### Phase 2: Fix Frequency Slider Event

1. **Change** `input` event to `change` event for all geodesic frequency sliders:
   - `geodesicFrequency` (icosahedron)
   - `geodesicTetraFrequency` (tetrahedron)
   - `geodesicOctaFrequency` (octahedron)

2. **Test** slider behavior to ensure no more glitching

### Phase 3: Verify Other Geodesic Functions

Check if the same radius calculation bugs exist in:
- `geodesicTetrahedron` (lines ~1314-1381)
- `geodesicOctahedron` (lines ~1382-1450)

Fix any similar issues found.

---

## Testing Checklist

After fixes:
- [ ] OutSphere projection matches base icosahedron size
- [ ] MidSphere projection is visibly smaller (tangent to edges)
- [ ] InSphere projection is smallest (tangent to faces)
- [ ] Console logs show correct radius values
- [ ] Frequency slider doesn't glitch/freeze when dragging
- [ ] Geometry only rebuilds when slider is released
- [ ] All three geodesic polyhedra (tetra, octa, icosa) work correctly

---

## RT-Pure Considerations

The current code uses `Math.sqrt()` extensively, which is a deferred sqrt approach (RT-acceptable).

However, the **relationships between sphere radii** should be expressed using:
1. Golden ratio φ = (1 + √5)/2
2. Rational expressions in terms of φ
3. Deferred sqrt only at final projection step

The fix will maintain RT purity by:
- Calculating Q_target (quadrance) directly
- Only using sqrt once at final sphere projection: `r_target = Math.sqrt(Q_target)`
- Expressing ratios algebraically using φ

---

**Status**: 📋 Ready for Implementation
**Estimated Time**: 45-60 minutes
**Priority**: HIGH - Incorrect sphere projections are core geometry bugs
