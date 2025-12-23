# WOMBAT Windows Implementation

**Goal**: Add window visualization to WOMBAT 3D thermal topology renderer using lightweight algebraic geometry.

**Philosophy**: Keep it simple - windows are centered rectangular/square offsets on vertical wall facades. No complex iteration, no roof shape considerations above eave line.

---

## Design Principles

1. **Facade-only**: Windows placed on vertical wall facades between grade and eave line
2. **Ignore roof shapes**: Shed roofs may allow more area on tall side, but we don't consider this complexity
3. **Single-storey for now**: Multi-storey horizontal division is Phase 3 (future)
4. **Center placement**: Windows centered on facade using diagonal bisection to find center point
5. **Simple geometry**: Square windows by default, rectangle only if square hits eave/grade constraints
6. **Algebraic solution**: Direct calculation, no iteration (except optional square→rectangle conversion)
7. **Validation**: Flag geometric warning if window area exceeds facade area
8. **Skylights deferred**: Roof-mounted skylights (d_78) are Phase 2 (future)

---

## Data Sources

### Section10.js - Radiant Gains Fields

**Window Areas** (user input):
- `d_73`: Door area (m²)
- `d_74`: Window area North (m²)
- `d_75`: Window area East (m²)
- `d_76`: Window area South (m²)
- `d_77`: Window area West (m²)
- `d_78`: Skylight area (m²) - *Phase 2: Roof placement (future)*

**Orientation Dropdowns** (d_74-d_77):
- `e_73`: Door orientation
- `e_74`: North window orientation
- `e_75`: East window orientation
- `e_76`: South window orientation
- `e_77`: West window orientation

Options: `"North"`, `"East"`, `"South"`, `"West"`, `"Northeast"`, `"Southeast"`, `"Southwest"`, `"Northwest"`

**SHGC Values** (solar heat gain coefficient):
- `f_73` through `f_78`: SHGC multipliers (0.0 to 1.0)

**Shading Percentages**:
- `g_73`/`h_73` through `g_77`/`h_77`: Winter/summer shading (%) - *not visualized*

---

## Phase Scope

### Phase 1: Vertical Facade Windows (Current)
- ✅ Windows on N/E/S/W facades
- ✅ Single-storey buildings (total wall area per facade)
- ✅ Center-placed rectangular/square geometry
- ✅ Validation and warnings
- ❌ Skylights deferred to Phase 2
- ❌ Multi-storey division deferred to Phase 3

### Phase 2: Skylights (Future)
- Roof-mounted skylight placement (d_78)
- Requires roof surface geometry integration
- Different placement logic (roof planes vs vertical facades)

### Phase 3: Multi-Storey Windows (Future)
- Horizontal division of facade area by storey count
- Multiple window rows per facade
- Storey-height constraints

---

## Geometric Strategy (Phase 1)

### Step 1: Calculate Facade Areas

For each wall facade, calculate total available area:

```javascript
// Facade dimensions (single-storey only)
const facadeWidth = {
  north: width,   // Short dimension for N/S facades
  south: width,
  east: length,   // Long dimension for E/W facades
  west: length
};

const facadeHeight = wallHeight;  // From grade to eave (full wall height)

const facadeArea = {
  north: facadeWidth.north * facadeHeight,
  south: facadeWidth.south * facadeHeight,
  east: facadeWidth.east * facadeHeight,
  west: facadeWidth.west * facadeHeight
};
```

**Notes**:
- Wall height is from grade (z=0) to eave line (z=wallHeight)
- Roof shape above eave line is IGNORED (shed roofs don't affect window placement)
- All facades have same height constraint
- Multi-storey horizontal division is Phase 3 (deferred)

### Step 2: Map Window Areas to Facades

For each window field (d_74 through d_77):

1. **Read orientation** from corresponding dropdown (e_74-e_77)
2. **Accumulate area** by cardinal direction:
   ```javascript
   const windowsByFacade = {
     north: 0,
     east: 0,
     south: 0,
     west: 0
   };

   // Example: d_74 (North windows) with e_74 = "North"
   windowsByFacade.north += parseFloat(d_74.value);

   // Handle diagonal orientations by splitting area
   // (e.g., "Northeast" → 50% North, 50% East)

   // Skip d_78 (skylights) - Phase 2 only
   ```

3. **Handle diagonal orientations**:
   - `"Northeast"`: Split 50/50 between North and East facades
   - `"Southeast"`: Split 50/50 between South and East facades
   - `"Southwest"`: Split 50/50 between South and West facades
   - `"Northwest"`: Split 50/50 between North and West facades

### Step 3: Validate Window Areas

For each facade:

```javascript
if (windowsByFacade[facade] > facadeArea[facade]) {
  console.warn(`[WOMBAT] Windows exceed ${facade} facade area!`);
  console.warn(`  Facade area: ${facadeArea[facade].toFixed(2)}m²`);
  console.warn(`  Window area: ${windowsByFacade[facade].toFixed(2)}m²`);

  // Flag in legend
  geometricWarnings.push(`Windows > ${facade} facade area`);
}
```

Display warnings in canvas legend (red text).

---

## Window Geometry Generation

### Find Facade Center Point

For each facade, bisect opposite corners to find center:

```javascript
// Example: North facade (front face, y = -length/2)
const northFacade = {
  bottomLeft: { x: -width/2, y: -length/2, z: 0 },
  bottomRight: { x: width/2, y: -length/2, z: 0 },
  topLeft: { x: -width/2, y: -length/2, z: wallHeight },
  topRight: { x: width/2, y: -length/2, z: wallHeight }
};

// Diagonal bisection
const centerX = (northFacade.bottomLeft.x + northFacade.topRight.x) / 2;  // = 0
const centerY = northFacade.bottomLeft.y;  // = -length/2
const centerZ = (northFacade.bottomLeft.z + northFacade.topRight.z) / 2;  // = wallHeight/2

const facadeCenter = { x: centerX, y: centerY, z: centerZ };
```

### Calculate Window Dimensions

**Step 1: Try square window first**

```javascript
const windowArea = windowsByFacade.north;  // m²
const squareSide = Math.sqrt(windowArea);

// Check if square fits within facade height
const maxHeight = wallHeight;  // Eave constraint
const maxWidth = facadeWidth.north;  // Facade width constraint

if (squareSide <= maxHeight && squareSide <= maxWidth) {
  // Square window fits!
  windowWidth = squareSide;
  windowHeight = squareSide;
} else {
  // Square doesn't fit - convert to rectangle
  // ... (see Step 2)
}
```

**Step 2: Convert to rectangle if needed**

```javascript
if (squareSide > maxHeight) {
  // Window hits eave line - make it a horizontal rectangle
  windowHeight = maxHeight * 0.9;  // 90% of max (inset from eave)
  windowWidth = windowArea / windowHeight;

  // Check if width now exceeds facade
  if (windowWidth > maxWidth) {
    console.error(`[WOMBAT] Window area too large for ${facade} facade`);
    // Clamp to max and recalculate
    windowWidth = maxWidth * 0.9;
    windowHeight = windowArea / windowWidth;
  }
} else if (squareSide > maxWidth) {
  // Window hits facade edge - make it a vertical rectangle
  windowWidth = maxWidth * 0.9;  // 90% of max (inset from edge)
  windowHeight = windowArea / windowWidth;

  // Check if height now exceeds eave
  if (windowHeight > maxHeight) {
    console.error(`[WOMBAT] Window area too large for ${facade} facade`);
    // Clamp to max
    windowHeight = maxHeight * 0.9;
    windowWidth = windowArea / windowHeight;
  }
}
```

**Step 3: Generate window corner nodes**

```javascript
// Offset from facade center
const halfWidth = windowWidth / 2;
const halfHeight = windowHeight / 2;

// Inset slightly from wall plane (0.05m outward for visibility)
const insetDepth = 0.05;

// Example: North facade window (y = -length/2 + inset)
const windowNodes = {
  bottomLeft: {
    x: facadeCenter.x - halfWidth,
    y: facadeCenter.y - insetDepth,  // Outward from wall
    z: facadeCenter.z - halfHeight
  },
  bottomRight: {
    x: facadeCenter.x + halfWidth,
    y: facadeCenter.y - insetDepth,
    z: facadeCenter.z - halfHeight
  },
  topRight: {
    x: facadeCenter.x + halfWidth,
    y: facadeCenter.y - insetDepth,
    z: facadeCenter.z + halfHeight
  },
  topLeft: {
    x: facadeCenter.x - halfWidth,
    y: facadeCenter.y - insetDepth,
    z: facadeCenter.z + halfHeight
  }
};
```

---

## Rendering Specification

### Render Order (Z-index layering)

1. **Foundation/basement** (if visible)
2. **Wall edges** (blue lines)
3. **Windows** (yellow planes with blue borders) ← NEW
4. **Roof edges** (blue lines)
5. **Nodes** (blue circles)
6. **Legend text** (black/red)

### Window Visual Style

**Fill**:
- Color: `#FFFF00` (yellow)
- Opacity: `0.4` (semi-transparent to see walls behind)

**Stroke** (border):
- Color: `#0066CC` (blue, matching wall edges)
- Width: `2px`
- Style: Solid

**Corner Nodes**:
- Color: `#0066CC` (blue)
- Radius: `3px` (slightly smaller than wall nodes at 4px)
- Style: Filled circles

### SVG Implementation (wombatRender.js)

```javascript
/**
 * Render windows on facades
 * @param {Object} geometry - Contains windowsByFacade data
 * @param {SVGElement} svg - Target SVG canvas
 * @param {Object} options - Rendering options (scale, center, etc.)
 */
function renderWindows(geometry, svg, options) {
  if (!geometry.windows || geometry.windows.length === 0) {
    return;  // No windows to render
  }

  const { scale, centerX, centerY } = options;

  geometry.windows.forEach(window => {
    // Convert 3D window corners to 2D isometric
    const corners2D = window.nodes.map(node =>
      toIsometric(node.x, node.y, node.z, scale, centerX, centerY)
    );

    // Create yellow filled rectangle
    const windowPath = `
      M ${corners2D[0].x} ${corners2D[0].y}
      L ${corners2D[1].x} ${corners2D[1].y}
      L ${corners2D[2].x} ${corners2D[2].y}
      L ${corners2D[3].x} ${corners2D[3].y}
      Z
    `;

    const windowPlane = document.createElementNS("http://www.w3.org/2000/svg", "path");
    windowPlane.setAttribute("d", windowPath);
    windowPlane.setAttribute("fill", "#FFFF00");
    windowPlane.setAttribute("fill-opacity", "0.4");
    windowPlane.setAttribute("stroke", "#0066CC");
    windowPlane.setAttribute("stroke-width", "2");
    svg.appendChild(windowPlane);

    // Add corner nodes
    corners2D.forEach(corner => {
      const node = createNode(corner, "#0066CC", 3);
      svg.appendChild(node);
    });
  });
}
```

---

## Implementation Workflow

### Phase 1: Data Integration

**File**: `src/sections/Section19.js`

1. **Read window data** from StateManager:
   ```javascript
   const d_74 = window.TEUI.StateManager.getValue('d_74');  // North area
   const e_74 = window.TEUI.StateManager.getValue('e_74');  // North orientation
   // ... repeat for d_75-d_77
   ```

2. **Calculate facade areas**:
   ```javascript
   const facadeAreas = calculateFacadeAreas(width, length, wallHeight);
   ```

3. **Map windows to facades**:
   ```javascript
   const windowsByFacade = mapWindowsToFacades(
     { d_74, e_74, d_75, e_75, d_76, e_76, d_77, e_77 }
   );
   ```

4. **Validate areas**:
   ```javascript
   const warnings = validateWindowAreas(windowsByFacade, facadeAreas);
   ```

### Phase 2: Geometry Generation

**File**: `src/sections/Section19.js`

1. **Generate window geometries**:
   ```javascript
   const windows = [];

   for (const [facade, area] of Object.entries(windowsByFacade)) {
     if (area > 0) {
       const windowGeometry = generateWindowGeometry(
         facade,
         area,
         facadeCenter[facade],
         facadeWidth[facade],
         wallHeight
       );
       windows.push(windowGeometry);
     }
   }

   // Add to geometry object
   geometry.windows = windows;
   geometry.windowWarnings = warnings;
   ```

### Phase 3: Rendering

**File**: `src/core/wombatRender.js`

1. **Add window rendering** to main render function:
   ```javascript
   function render(geometry, mode, svg, options) {
     // ... existing code (walls, roof, etc.)

     // Render windows (after walls, before nodes)
     if (geometry.windows) {
       renderWindows(geometry, svg, options);
     }

     // ... existing code (nodes, legend)
   }
   ```

2. **Add window stats** to legend:
   ```javascript
   // Add to upper-left canvas legend
   if (geometry.windows && geometry.windows.length > 0) {
     legendItems.push({
       label: "Total Window Area",
       value: calculateTotalWindowArea(geometry.windows),
       units: "m²",
       decimals: 2
     });
   }

   // Show warnings in red
   if (geometry.windowWarnings && geometry.windowWarnings.length > 0) {
     geometry.windowWarnings.forEach(warning => {
       legendItems.push({
         label: "⚠️ " + warning,
         color: "#CC0000"  // Red warning text
       });
     });
   }
   ```

---

## Edge Cases and Constraints

### 1. Diagonal Orientations

**Problem**: User selects "Northeast" orientation for windows.

**Solution**: Split area 50/50 between North and East facades.

```javascript
const orientationMap = {
  "North": { north: 1.0 },
  "East": { east: 1.0 },
  "South": { south: 1.0 },
  "West": { west: 1.0 },
  "Northeast": { north: 0.5, east: 0.5 },
  "Southeast": { south: 0.5, east: 0.5 },
  "Southwest": { south: 0.5, west: 0.5 },
  "Northwest": { north: 0.5, west: 0.5 }
};
```

### 2. Multiple Windows on Same Facade

**Problem**: User specifies both d_74 (North, 50m²) and d_75 (East, 30m²), but e_75 is set to "North".

**Solution**: Accumulate total area per facade, render as single merged window.

```javascript
// Accumulate areas
windowsByFacade.north = parseFloat(d_74.value) + parseFloat(d_75.value);

// Render one large window (80m² on North facade)
```

**Future Enhancement**: Render multiple separate windows if visual clarity needed.

### 3. Window Area Exceeds Facade

**Problem**: User enters 200m² window on a 150m² facade.

**Solution**:
1. Flag geometric warning in legend (red text)
2. Clamp window to 90% of facade max dimensions
3. Log error to console

```javascript
if (windowArea > facadeArea) {
  console.error(`[WOMBAT] Window area (${windowArea}m²) exceeds facade area (${facadeArea}m²)`);

  // Clamp to facade limits
  const maxWidth = facadeWidth * 0.9;
  const maxHeight = wallHeight * 0.9;
  const clampedArea = maxWidth * maxHeight;

  // Render at clamped size
  windowArea = clampedArea;

  // Flag warning
  warnings.push(`${facade} windows exceed facade area`);
}
```

### 4. Zero Window Area

**Problem**: User leaves window fields blank or zero.

**Solution**: Skip rendering for that facade (no empty window objects).

```javascript
if (windowArea <= 0) {
  continue;  // Don't create window geometry
}
```

### 5. Aspect Ratio and Orientation

**Problem**: Building orientation affects which facades are N/E/S/W.

**Solution**: Use building orientation (d_155) to rotate facade mapping.

```javascript
const orientation = window.TEUI.StateManager.getValue('d_155');  // 0°, 90°, 180°, 270°

// Rotate facade assignments based on orientation
const facadeMap = rotateFacadeMap(orientation);

// Example: If orientation = 90°, "North" facade is now on the East side
```

---

## Testing Strategy

### Test Case 1: Simple Square Window

**Input**:
- Building: 20m × 20m, wallHeight = 3m
- d_74 = 9m² (North), e_74 = "North"

**Expected**:
- Square window: 3m × 3m
- Centered on North facade
- Yellow fill, blue border, 4 corner nodes

### Test Case 2: Rectangle Window (Hits Eave)

**Input**:
- Building: 20m × 20m, wallHeight = 3m
- d_74 = 25m² (North), e_74 = "North"

**Expected**:
- Rectangle window: height = 2.7m (90% of eave), width = 9.26m
- Centered on North facade
- Warning: "North windows near eave limit"

### Test Case 3: Window Exceeds Facade

**Input**:
- Building: 10m × 10m, wallHeight = 3m
- d_74 = 100m² (North), e_74 = "North"
- Facade area = 10m × 3m = 30m²

**Expected**:
- Clamped window: 9m × 2.7m = 24.3m²
- Red warning in legend: "⚠️ North windows exceed facade area"
- Console error logged

### Test Case 4: Diagonal Orientation

**Input**:
- Building: 20m × 30m, wallHeight = 3m
- d_74 = 20m² (North), e_74 = "Northeast"

**Expected**:
- North facade: 10m² window (√10 = 3.16m square)
- East facade: 10m² window (√10 = 3.16m square)
- Both centered on respective facades

### Test Case 5: Multiple Roof Types

**Input**:
- Test with flat, gable, shed, hip roofs
- Same window area across all tests

**Expected**:
- Windows identical in all cases (roof shape ignored)
- All windows between grade (z=0) and eave (z=wallHeight)
- Shed roof's tall side does NOT affect window height

### Test Case 6: Skylight Ignored (Phase 1)

**Input**:
- d_78 = 50m² (Skylight area)
- All other windows = 0

**Expected**:
- No windows rendered (skylights deferred to Phase 2)
- No errors or warnings
- Legend shows "No windows" or omits window section

### Test Case 7: Multi-Storey Ignored (Phase 1)

**Input**:
- d_150 = 2 storeys
- d_74 = 40m² (North windows)
- Facade area = 60m² total

**Expected**:
- Single large window rendered (40m² centered on facade)
- No horizontal division by storey count
- Multi-storey handled in Phase 3

---

## Legend Display Additions

Add to upper-left canvas legend:

```
┌─────────────────────────────────────┐
│ Roof Area: 1411.52 m²              │  (existing)
│ Floorplate Area: 1100.00 m²        │  (existing)
│ Storey Height: 3.00 m              │  (existing)
│                                     │
│ Window Area North: 50.00 m²        │  ← NEW
│ Window Area East: 30.00 m²         │  ← NEW
│ Window Area South: 45.00 m²        │  ← NEW
│ Window Area West: 25.00 m²         │  ← NEW
│ Total Window Area: 150.00 m²       │  ← NEW
│                                     │
│ ⚠️ North windows exceed facade     │  ← NEW (if warning)
└─────────────────────────────────────┘
```

**Conditional Display**:
- Only show facades with windows > 0
- Only show "Total Window Area" if multiple facades have windows
- Only show warnings if validation fails

---

## File Structure

### New Core Module

**src/core/wombatWindows.js** (~400 lines, NEW FILE)
```javascript
/**
 * wombatWindows.js - WOMBAT Window Placement Module
 * TEUI 4.012
 *
 * Phase 1: Vertical facade windows (N/E/S/W)
 * Phase 2: Skylights on roof surfaces (future)
 * Phase 3: Multi-storey division (future)
 */

window.TEUI = window.TEUI || {};
window.TEUI.WombatWindows = (function () {
  "use strict";

  //==========================================================================
  // WINDOW DATA INTEGRATION
  //==========================================================================

  function mapWindowsToFacades() { /* ... */ }
  function calculateFacadeAreas(geometry) { /* ... */ }
  function validateWindowAreas(windowsByFacade, facadeAreas) { /* ... */ }

  //==========================================================================
  // WINDOW GEOMETRY GENERATION
  //==========================================================================

  function generateWindowGeometry(facade, area, center, maxWidth, maxHeight) { /* ... */ }
  function getFacadeCenter(facade, geometry) { /* ... */ }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  function calculateWindows(geometry) {
    // 1. Map window areas to facades
    // 2. Calculate facade areas
    // 3. Validate constraints
    // 4. Generate window geometries
    // 5. Return windows array + warnings
    return {
      windows: [...],
      warnings: [...]
    };
  }

  return {
    calculateWindows: calculateWindows
  };
})();
```

### Modified Files

1. **src/sections/Section19.js** (~5 lines added)
   - In `solveGeometry()` function:
     ```javascript
     // Add windows (Phase 1: Facade windows only)
     const windowData = window.TEUI.WombatWindows?.calculateWindows(geometry);
     if (windowData) {
       geometry.windows = windowData.windows;
       geometry.windowWarnings = windowData.warnings;
     }
     ```

2. **src/core/wombatRender.js** (~80 lines added)
   - `renderWindows(geometry, svg, options)` - Draw yellow window planes
   - Update `render()` - Call renderWindows() after walls, before nodes
   - Update legend rendering - Add window stats and warnings

3. **index.html** (~1 line added)
   - Add script tag:
     ```html
     <script src="src/core/wombatWindows.js"></script>
     ```
   - Load order: after StateManager.js, before Section19.js

### Helper Functions (wombatWindows.js)

```javascript
// Section19.js additions

/**
 * Map window areas from Section10 to cardinal facades
 */
function mapWindowsToFacades(windowData) {
  const { d_74, e_74, d_75, e_75, d_76, e_76, d_77, e_77 } = windowData;

  const windowsByFacade = { north: 0, east: 0, south: 0, west: 0 };

  // Map each window field
  addWindowToFacade(windowsByFacade, parseFloat(d_74), e_74);
  addWindowToFacade(windowsByFacade, parseFloat(d_75), e_75);
  addWindowToFacade(windowsByFacade, parseFloat(d_76), e_76);
  addWindowToFacade(windowsByFacade, parseFloat(d_77), e_77);

  return windowsByFacade;
}

/**
 * Add window area to facade(s) based on orientation
 */
function addWindowToFacade(windowsByFacade, area, orientation) {
  if (area <= 0) return;

  const orientationMap = {
    "North": { north: 1.0 },
    "East": { east: 1.0 },
    "South": { south: 1.0 },
    "West": { west: 1.0 },
    "Northeast": { north: 0.5, east: 0.5 },
    "Southeast": { south: 0.5, east: 0.5 },
    "Southwest": { south: 0.5, west: 0.5 },
    "Northwest": { north: 0.5, west: 0.5 }
  };

  const distribution = orientationMap[orientation] || { north: 1.0 };

  for (const [facade, ratio] of Object.entries(distribution)) {
    windowsByFacade[facade] += area * ratio;
  }
}

/**
 * Calculate facade dimensions and areas
 */
function calculateFacadeAreas(width, length, wallHeight) {
  return {
    north: { width: width, height: wallHeight, area: width * wallHeight },
    south: { width: width, height: wallHeight, area: width * wallHeight },
    east: { width: length, height: wallHeight, area: length * wallHeight },
    west: { width: length, height: wallHeight, area: length * wallHeight }
  };
}

/**
 * Generate window geometry for a facade
 */
function generateWindowGeometry(facade, windowArea, center, facadeWidth, maxHeight) {
  // Try square first
  let squareSide = Math.sqrt(windowArea);
  let windowWidth, windowHeight;

  if (squareSide <= facadeWidth * 0.9 && squareSide <= maxHeight * 0.9) {
    // Square fits
    windowWidth = squareSide;
    windowHeight = squareSide;
  } else {
    // Convert to rectangle
    if (squareSide > maxHeight * 0.9) {
      windowHeight = maxHeight * 0.9;
      windowWidth = windowArea / windowHeight;
    } else {
      windowWidth = facadeWidth * 0.9;
      windowHeight = windowArea / windowWidth;
    }
  }

  // Generate corner nodes
  const halfW = windowWidth / 2;
  const halfH = windowHeight / 2;
  const inset = 0.05;  // Outward from wall for visibility

  return {
    facade: facade,
    area: windowArea,
    width: windowWidth,
    height: windowHeight,
    nodes: [
      { x: center.x - halfW, y: center.y - inset, z: center.z - halfH },
      { x: center.x + halfW, y: center.y - inset, z: center.z - halfH },
      { x: center.x + halfW, y: center.y - inset, z: center.z + halfH },
      { x: center.x - halfW, y: center.y - inset, z: center.z + halfH }
    ]
  };
}
```

---

## Comparison to Existing WOMBAT Features

| Feature | Roof Solvers | Window Placement |
|---------|-------------|------------------|
| **Geometry** | 3D polyhedral (8-10 nodes) | 2D rectangular planes (4 nodes per window) |
| **Solver Type** | Algebraic (rational trig) | Algebraic (direct area→dimensions) |
| **Iteration** | None (direct solution) | None (except square→rectangle check) |
| **Constraints** | Area, volume, footprint | Area, facade dimensions, eave height |
| **Validation** | Area error < 1% | Geometric warnings if area > facade |
| **Rendering** | Blue edges, corner nodes | Yellow fill, blue borders, corner nodes |
| **Legend** | Area, height, pitch | Window area by facade, warnings |
| **Complexity** | High (multi-planar roofs) | Low (single plane per facade) |

**Consistency**: Windows follow the same WOMBAT philosophy:
- ✅ Algebraic geometry (no iteration)
- ✅ Direct constraint solving
- ✅ Visual validation via rendered geometry
- ✅ Legend-based verification
- ✅ Blue edge + node rendering style

---

## Architecture Decision: Core Module Approach

**Decision**: Create `src/core/wombatWindows.js` as a new core module (not embedded in Section19.js)

**Rationale**:
1. **Clean Separation**: Section19.js = roof solvers, wombatWindows.js = window solver, wombatRender.js = rendering
2. **Follows Pattern**: Matches existing `wombatRender.js` core module architecture
3. **Scalability**: Phase 2 (skylights) and Phase 3 (multi-storey) fit naturally into wombatWindows.js
4. **File Size**: Section19.js already 2,747 lines; avoid bloating with ~400 lines of window logic
5. **Reusability**: Core modules are more discoverable than section internals

## Implementation Plan

### Phase 1: Vertical Facade Windows (Current Sprint)

1. **Create feature branch**: `WOMBAT-WINDOWS` (already created)

2. **Step 1.1**: Create wombatWindows.js core module
   - File: `src/core/wombatWindows.js`
   - Pattern: IIFE following wombatRender.js structure
   - Functions:
     - `mapWindowsToFacades()` - Read d_74-d_77, accumulate by N/E/S/W
     - `calculateFacadeAreas()` - Width × height per facade
     - `validateWindowAreas()` - Check constraints, warnings
     - `generateWindowGeometry()` - Center-bisect, square-first, corner nodes
   - Public API: `window.TEUI.WombatWindows.calculateWindows(geometry)`

3. **Step 1.2**: Integrate with Section19.js (minimal changes)
   - File: `src/sections/Section19.js`
   - Add single line in `solveGeometry()`:
     ```javascript
     geometry.windows = window.TEUI.WombatWindows.calculateWindows(geometry);
     ```
   - No refactoring needed, keeps roof solver logic separate

4. **Step 1.3**: Add rendering to wombatRender.js
   - File: `src/core/wombatRender.js`
   - Add `renderWindows(geometry.windows)` function
   - Call after wall rendering, before legend
   - Yellow window planes with blue borders
   - Corner nodes (3px radius)

5. **Step 1.4**: Update index.html
   - Add `<script src="src/core/wombatWindows.js"></script>`
   - Load order: after StateManager.js, before Section19.js

6. **Test**: All 7 test cases across all roof types

7. **Merge**: PR to main

### Phase 2: Skylights (Future Sprint)

- Implement d_78 skylight placement on roof surfaces
- Requires roof plane normal vectors
- Different geometry (roof-mounted vs facade-mounted)

### Phase 3: Multi-Storey Division (Future Sprint)

- Horizontal division by storey count (d_150)
- Multiple window rows per facade
- Storey-height spacing and alignment

**Current Complexity**: LOW (facade windows only, no skylight/multi-storey complexity!)

---

## Document Scope

**Phase 1 ONLY** (This Document):
- ✅ Vertical facade windows (N/E/S/W)
- ✅ Single-storey (total wall area per facade)
- ✅ d_74-d_77 window areas
- ❌ d_78 skylights (Phase 2)
- ❌ Multi-storey division (Phase 3)

**Future Phases**:
- Phase 2: Skylight placement on roof surfaces
- Phase 3: Multi-storey horizontal window division

---

## Known Issues and Proposed Fixes

### Issue #1: Window Orientation During Aspect Ratio Sign Change

**Status**: IDENTIFIED - Needs Fix

**Problem Description**:

When aspect ratio crosses zero (from positive to negative range), window placement doesn't follow the correct cardinal orientation.

**BIM Coordinate Convention** (ALWAYS CONSTANT):
- **Y+ = North** (always, regardless of aspect ratio)
- **Y- = South** (always)
- **X+ = East** (always)
- **X- = West** (always)

**Aspect Ratio Behavior**:
- **Positive (0 to +5)**: Length > Width, building oriented North-South (long axis aligned with Y)
- **Zero (0)**: Square footprint
- **Negative (0 to -5)**: Width > Length, building oriented East-West (long axis aligned with X)

**What Happens Now** (Incorrect):

When aspect ratio goes negative (e.g., -0.50):
1. Footprint nodes rotate 90° to accommodate width > length orientation
2. Windows stay locked to footprint edge midpoints (correct)
3. BUT window facade assignments don't update to match new orientation
4. Result: "South" windows end up on East-facing wall, "East" windows on South-facing wall, etc.

**Example** (Aspect Ratio = -0.50):
- Largest window area assigned to "South" orientation (e_76 = "South")
- Window renders on East-facing wall (wrong!)
- Should render on South-facing wall (Y- direction)

**Root Cause**:

The `getFacadeCenter()` function uses fixed ground node indices:
```javascript
// Current implementation (INCORRECT for negative aspect ratio)
if (facade === "north") {
  centerX = (ground[0].x + ground[1].x) / 2;  // Front edge
  centerY = (ground[0].y + ground[1].y) / 2;
}
```

This assumes:
- Front edge (nodes 0-1) = North
- Back edge (nodes 3-2) = South
- Right edge (nodes 1-2) = East
- Left edge (nodes 0-3) = West

**But when aspect ratio flips negative**, the footprint rotates 90°, and these node indices no longer correspond to the same cardinal directions!

**Proposed Fix**:

Instead of using fixed node indices, determine facade assignment based on **actual node positions relative to cardinal axes**:

```javascript
function getFacadeCenter(facade, geometry) {
  const wallHeight = geometry.wallHeight || 0;

  if (geometry.nodes3D && geometry.nodes3D.ground) {
    const ground = geometry.nodes3D.ground;

    // Calculate edge midpoints for all 4 edges
    const edges = {
      edge01: {
        center: {
          x: (ground[0].x + ground[1].x) / 2,
          y: (ground[0].y + ground[1].y) / 2
        },
        nodes: [0, 1]
      },
      edge12: {
        center: {
          x: (ground[1].x + ground[2].x) / 2,
          y: (ground[1].y + ground[2].y) / 2
        },
        nodes: [1, 2]
      },
      edge23: {
        center: {
          x: (ground[2].x + ground[3].x) / 2,
          y: (ground[2].y + ground[3].y) / 2
        },
        nodes: [2, 3]
      },
      edge30: {
        center: {
          x: (ground[3].x + ground[0].x) / 2,
          y: (ground[3].y + ground[0].y) / 2
        },
        nodes: [3, 0]
      }
    };

    // Find which edge has the most extreme position in each cardinal direction
    let northEdge, southEdge, eastEdge, westEdge;
    let maxY = -Infinity, minY = Infinity, maxX = -Infinity, minX = Infinity;

    for (const [edgeName, edge] of Object.entries(edges)) {
      if (edge.center.y > maxY) {
        maxY = edge.center.y;
        northEdge = edge;  // Y+ = North
      }
      if (edge.center.y < minY) {
        minY = edge.center.y;
        southEdge = edge;  // Y- = South
      }
      if (edge.center.x > maxX) {
        maxX = edge.center.x;
        eastEdge = edge;   // X+ = East
      }
      if (edge.center.x < minX) {
        minX = edge.center.x;
        westEdge = edge;   // X- = West
      }
    }

    // Return center of the requested cardinal facade
    const facadeMap = {
      north: northEdge,
      south: southEdge,
      east: eastEdge,
      west: westEdge
    };

    const selectedEdge = facadeMap[facade];

    return {
      x: selectedEdge.center.x,
      y: selectedEdge.center.y,
      z: wallHeight / 2
    };
  }

  // Fallback...
}
```

**Why This Works**:

1. Calculates all 4 edge midpoints from actual node positions
2. Finds which edge is most extreme in each cardinal direction:
   - **North** = edge with highest Y value (Y+)
   - **South** = edge with lowest Y value (Y-)
   - **East** = edge with highest X value (X+)
   - **West** = edge with lowest X value (X-)
3. Returns the correct edge center regardless of footprint rotation

**Result**: Windows will correctly follow cardinal directions across all aspect ratios (-5 to +5), matching the BIM coordinate convention.

**Testing Plan**:
1. Set aspect ratio to +2.0 (North-South orientation) → South windows on Y- edge ✓
2. Set aspect ratio to -2.0 (East-West orientation) → South windows STILL on Y- edge ✓
3. Verify all 4 cardinal directions at multiple aspect ratios

**Priority**: HIGH - Core functionality for proper window-to-wall mapping

---

**Document Status**: IMPLEMENTATION COMPLETE, FIX IDENTIFIED ✅
**Created**: 2025-12-22
**Updated**: 2025-12-22 (Issue #1: Aspect ratio orientation fix documented)
**Scope**: Phase 1 - Vertical facade windows only
**Branch**: WOMBAT-WINDOWS (already created)
**Next Action**: Implement Issue #1 fix - cardinal direction detection from node positions
