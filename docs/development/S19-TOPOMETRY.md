# Section 20: TOPOMETRY - 3D Building Wireframe Visualization

**Branch**: `TOPOMETRY`
**Status**: Planning Phase
**Created**: 2025-12-08
**Target Release**: 4.013

---

## Executive Summary

OBJECTIVE TEUI currently tracks comprehensive building envelope geometry (roof, walls, windows, doors, foundation) by orientation and thermal performance. However, this data exists as **area-based thermal abstractions** without spatial representation.

**TOPOMETRY** will leverage existing geometry data to generate a **3D wireframe building model** that:
- Visualizes building form derived from envelope areas and volumetric data
- Provides interactive exploration of thermal performance in 3D space
- Enables geometric validation (does my WWR visually match the building I designed?)
- Creates export-ready 3D models for integration with external tools

This feature will be implemented as **Section 20** following TEUI's modular architecture.

---

## Table of Contents

1. [Project Vision](#1-project-vision)
2. [Current State Analysis](#2-current-state-analysis)
3. [Technology Stack Options](#3-technology-stack-options)
4. [Data Requirements & Geometry Derivation](#4-data-requirements--geometry-derivation)
5. [Architecture Plan](#5-architecture-plan)
6. [Implementation Phases](#6-implementation-phases)
7. [Integration Points](#7-integration-points)
8. [Future Enhancements](#8-future-enhancements)
9. [Technical Challenges](#9-technical-challenges)
10. [References & Resources](#10-references--resources)

---

## 1. Project Vision

### 1.1 Problem Statement

**Current limitation**: Users enter building geometry as abstract areas (roof: 120 m², walls: 180 m², windows by orientation) without visual feedback of the resulting building form.

**User pain points**:
- No way to validate if entered geometry represents a realistic building
- Cannot visualize thermal performance distribution across building surfaces
- Difficult to communicate design intent to stakeholders
- No export path to 3D modeling tools (SketchUp, Rhino, Revit)

### 1.2 Solution Approach - "Thermal Topology" Philosophy

**TOPOMETRY** generates a **constraint-driven 3D thermal topology** from TEUI's area-based geometry:

```
Thermal Areas (Input) → Constraint Solver → Deformable Geometry → Visual Feedback
d_85-d_95, d_105        "Jello Cube"       Vertices adapt to     Color-coded
(user enters areas)     Area = Priority     satisfy area targets  thermal performance
```

**Revolutionary insight**: This is **NOT** an architectural model—it's a **thermal model as topology**.

**Core Principles**:

1. **Areas Drive Form** (not the other way around)
   - User enters roof area = 240 m² and floor area = 120 m²? → Roof pitch emerges automatically (2:1 ratio → ~45° slope)
   - North wall area ≠ South wall area? → Building deforms asymmetrically (like a "jello cube")
   - **No validation errors**—the model adapts to match the thermal data

2. **Topology First, Realism Second**
   - Floor slabs always in X-Y plane (horizontal)
   - Default to square footprint (aspect ratio = 1.0) unless user adjusts slider
   - Walls stretch/compress to satisfy area constraints (North facade may be taller/wider than South)
   - Windows distribute to fill specified areas per orientation

3. **Constraint Satisfaction Over Geometric Truth**
   - If constraints are impossible (e.g., roof smaller than floor), model shows this visually (inverted pyramid)
   - Overlapping walls? Show them transparently so user sees the conflict
   - Crazy-looking model = user feedback: "Your areas don't represent a typical building"

4. **Volume is Sacred**
   - User-specified volume (d_105) ALWAYS satisfied exactly
   - All other dimensions emerge from: Volume + Area constraints + User preferences (aspect ratio, symmetry)

**Example "Jello Cube" Behavior**:

```
User Input:
- Volume: 1000 m³
- Roof: 300 m² (larger than floor!)
- Floor: 150 m²
- North wall net: 100 m²
- South wall net: 60 m²
- East/West walls: 80 m² each

Traditional CAD: ERROR - "Roof cannot be larger than floor in rectangular building"

TOPOMETRY Response:
✓ Floor: 150 m² rectangle (12.2m × 12.2m, assuming square)
✓ Height: 1000 m³ / 150 m² = 6.67m
✓ Roof: Pitched/curved to achieve 300 m² (pitch angle emerges: ~53°)
✓ North wall: Stretches taller/wider to reach 100 m² (may bulge out)
✓ South wall: Compresses to 60 m² (may be shorter or narrower)
✓ Model looks asymmetric and weird → User sees "Hmm, maybe I entered wrong areas"
```

**This is a visualization of thermal CONSTRAINTS, not architectural INTENT.**

---

### 1.2.1 User Education: "How OBJECTIVE Sees Your Building"

**Problem**: Architects and designers think geometrically (walls, windows, roofs as physical objects), but **OBJECTIVE** thinks thermally (areas, U-values, heat flows).

**Solution**: TOPOMETRY is the **translation layer** - it shows users how their thermal inputs are interpreted by the energy model.

**Analogy for Users**:

> **"Think of TOPOMETRY as OBJECTIVE's sketch of your building based on the thermal data you provided."**
>
> You told **OBJECTIVE**:
> - "My building contains 1,000 m³ of conditioned space"
> - "It has 120 m² of roof losing heat at U = 0.35 W/m²K"
> - "The North facade has 30 m² of windows"
> - etc.
>
> **OBJECTIVE** doesn't know if your building is a cube, a rectangle, or an L-shape. It only knows the **thermal surfaces** you defined.
>
> TOPOMETRY creates a **wireframe representation** that satisfies these thermal constraints. If the model looks strange:
> - ✓ It's working correctly! It's showing you what your areas imply.
> - ✓ Use this feedback to refine your inputs until the model matches your design intent.
>
> **This is not a CAD model** - it's a **thermal topology diagram** that helps you validate your energy model inputs.

**UI Tooltip** (shown when user first opens Section 20):

```
┌──────────────────────────────────────────────────────────────────┐
│  💡 What is TOPOMETRY?                                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  TOPOMETRY shows how OBJECTIVE "sees" your building based on     │
│  the thermal areas you entered (roof, walls, windows, etc.).     │
│                                                                   │
│  This is NOT a 3D architectural model - it's a THERMAL MODEL.    │
│                                                                   │
│  ✓ If the model looks correct → Your thermal inputs are         │
│    consistent and represent a realistic building.               │
│                                                                   │
│  ⚠ If the model looks strange → The areas you entered may       │
│    not match a typical building shape - this is fine, its an | │  abstract, topological model of your building, not the real thing!       │
│                                                                   │
│  Think of it as "OBJECTIVE's sketch" of your building from       │
│  thermal data alone.                                             │
│                                                                   │
│  [Got it!]  [Learn More]                                         │
└──────────────────────────────────────────────────────────────────┘
```

**Educational Examples** (in documentation):

**Example 1: Typical Residential Building**
```
User Input:
✓ Volume: 400 m³
✓ Floor: 100 m² (10m × 10m)
✓ Roof: 100 m² (flat roof)
✓ Walls: 160 m² (4 walls × 10m × 4m)
✓ Windows evenly distributed: 6 m² per orientation

TOPOMETRY Result:
→ Renders as a simple 10m × 10m × 4m box with flat roof
→ Constraint satisfaction: 100% (all green)
→ User sees: "This matches my design intent!"
```

**Example 2: Unusual Input (Large Roof)**
```
User Input:
⚠ Volume: 400 m³
⚠ Floor: 100 m² (10m × 10m)
⚠ Roof: 200 m² (2× floor area!)
✓ Walls: 160 m²
✓ Windows: Balanced

TOPOMETRY Result:
→ Renders with steep pitched roof (~45° gable)
→ Constraint satisfaction: Roof 98%, Volume 100%, Walls 85% (yellow)
→ User sees: "Oh! My roof area implies a steep pitch I didn't intend.
   Let me check if I entered the wrong value or if this is correct."
```

**Example 3: Asymmetric Building**
```
User Input:
✓ Volume: 400 m³
✓ Floor: 100 m²
⚠ North wall net: 60 m² (tall/wide)
⚠ South wall net: 30 m² (short/narrow)
⚠ East/West walls: 40 m² each

TOPOMETRY Result:
→ Renders with North facade taller than South facade
→ Building looks tilted/asymmetric
→ Constraint satisfaction: Walls 92% (yellow)
→ User sees: "Hmm, this looks lopsided. Did I enter different wall
   areas by mistake, or does my building actually have asymmetric facades?"
```

**Key Learning Outcome**:
Users develop intuition for **how thermal areas translate to building form**, improving the quality of their energy model inputs.

---



**Primary use cases**:
1. **Geometry Validation**: "Does my 120 m² roof on a 1.5-story building look reasonable?"
2. **Thermal Visualization**: Color-code surfaces by U-value, interior surface temperature, or heat loss %
3. **Stakeholder Communication**: Export 3D view as image/video for presentations
4. **Design Iteration**: Adjust areas in calculator, see 3D model update in real-time
5. **Code Compliance Reporting**: Visual representation of building envelope for permit submissions

**Future use cases** (post-MVP):
6. **Model Import**: Load existing 3D models (IFC, OBJ, glTF) to populate TEUI geometry
7. **Multi-Building Portfolios**: Visualize multiple buildings side-by-side
8. **Solar Analysis Integration**: Overlay solar radiation maps from Section 10 radiant gains
9. **Parametric Optimization**: S18 Parallel Coordinates → S20 3D view shows optimized building form

---

## 2. Current State Analysis

### 2.1 Available Geometry Data

Based on architecture exploration (2025-12-08), TEUI provides:

#### Section 11: Transmission Losses (Envelope Components)
| Field ID | Component | Units | Data Quality |
|----------|-----------|-------|--------------|
| d_85 | Roof Area | m² | ✅ Direct user input |
| d_86 | Walls Above Grade | m² | ✅ Direct user input |
| d_87 | Floor Exposed | m² | ✅ Direct user input |
| d_88 | Doors | m² | ✅ Synced from S10 |
| d_89 | Windows North | m² | ✅ Synced from S10 |
| d_90 | Windows East | m² | ✅ Synced from S10 |
| d_91 | Windows South | m² | ✅ Synced from S10 |
| d_92 | Windows West | m² | ✅ Synced from S10 |
| d_93 | Skylights | m² | ✅ Direct user input |
| d_94 | Walls Below Grade | m² | ✅ Direct user input |
| d_95 | Floor Slab (Ground) | m² | ✅ Direct user input |

#### Section 12: Volume & Surface Metrics
| Field ID | Description | Units | Notes |
|----------|-------------|-------|-------|
| d_103 | Number of Stories | count | Discrete: 1, 1.5, 2, 2.5, 3, etc. |
| d_105 | Conditioned Volume | m³ | Direct user input |
| d_106 | Total Floor Area | m² | Calculated or user input |
| d_107 | Window:Wall Ratio | % | Calculated from d_89-d_92 |
| g_105 | Volume to Area Ratio | m³/m² | Derived metric |
| i_105 | Area to Volume Ratio | m²/m³ | Derived metric |

#### Section 11: Thermal Performance Data (for color-coding)
| Field ID | Metric | Units | Visualization Use |
|----------|--------|-------|-------------------|
| g_85-g_95 | U-Values by Component | W/m²·K | Color-code surface thermal quality |
| o_85-o_95 | Interior Surface Temp | °C | Condensation risk visualization |
| k_85-k_95 | Heat Loss % by Component | % | Relative heat loss intensity |
| d_97 | Thermal Bridge Penalty | % | Overall envelope quality indicator |

### 2.2 Data Gaps & Derivation Needs

#### Missing Data (Not Currently Tracked):
| Parameter | Impact | Mitigation Strategy |
|-----------|--------|---------------------|
| **Building Length/Width** | Cannot determine plan aspect ratio | Derive from floor area using user-specified or assumed aspect ratio |
| **Individual Story Heights** | Cannot distribute windows vertically | Derive from volume / (floor area × stories) |
| **Roof Pitch/Slope** | Affects roof geometry | Assume flat roof (MVP), add pitch parameter in Phase 2 |
| **Building Orientation (Azimuth)** | Affects cardinal direction mapping | Assume True North alignment, add rotation parameter in Phase 2 |
| **Basement/Foundation Depth** | Underground wall height unknown | Derive from d_94 (wall area) using assumed height |
| **Vertical Window Distribution** | Windows may be on multiple floors | Distribute proportionally across above-grade stories |
| **Wall Thickness** | Wireframe needs edge definition | Use negligible thickness (wireframe), or parameterize later |

#### Derivation Strategy:
```javascript
// Phase 1: Minimal Assumptions (Rectangular Prism)
footprintArea = d_106 / d_103;  // Floor area per story
aspectRatio = 1.5;  // Default (can be user parameter later)
buildingLength = Math.sqrt(footprintArea * aspectRatio);
buildingWidth = footprintArea / buildingLength;
storyHeight = d_105 / d_106;  // Volume / Total floor area
totalHeight = storyHeight * d_103;

// Validate derived dimensions against envelope areas
derivedWallArea = 2 * (buildingLength + buildingWidth) * totalHeight;
if (Math.abs(derivedWallArea - d_86) > tolerance) {
  // Adjust aspect ratio or warn user
}
```

### 2.3 Existing D3.js Infrastructure

**Current D3 implementations in TEUI**:
- **D3.js v7** loaded globally (index.html:60)
- **Parallel Coordinates** (Section 18): Complex interactive visualization with drag-and-drop
- **Dependency Graph**: D3 force layout (Section 17, uses dagre-d3)
- **Sankey Diagram**: Energy flow visualization (Section 16, uses d3-sankey)

**D3 rendering patterns used**:
```javascript
// Standard pattern from pcRendering.js
const svg = d3.select(container).append("svg")
  .attr("width", width)
  .attr("height", height);

const scale = d3.scaleLinear()
  .domain([min, max])
  .range([0, width]);

// Smooth curves
d3.line().curve(d3.curveMonotoneX)

// Animations
.transition()
  .duration(300)
  .ease(d3.easeCubicInOut);
```

**Key takeaway**: D3.js is well-integrated and familiar. However, **D3 is primarily a 2D visualization library**. For 3D wireframes, we need additional tools.

---

## 3. Technology Stack Options

### 3.1 Option A: Three.js (3D Graphics Library) ✅ SELECTED

**Library**: [Three.js](https://threejs.org/) - Industry-standard WebGL 3D library
**Version**: r160+ (latest stable)
**License**: MIT
**Bundle Size**: ~600 KB (minified)

**Preferred Format**: **glTF 2.0** (GL Transmission Format)
- Native Three.js support for both import and export
- Industry standard for web-based 3D (Khronos Group spec)
- Binary (.glb) and JSON (.gltf) variants
- Embeds geometry, materials, and custom metadata (for TEUI field values)
- Compatible with external tools (Blender, SketchUp, Rhino via plugins)

**Pros**:
- ✅ Purpose-built for 3D WebGL rendering
- ✅ Extensive geometry primitives (`BoxGeometry`, `PlaneGeometry`, custom shapes)
- ✅ Built-in camera controls (`OrbitControls`, `TrackballControls`)
- ✅ Material system for color-coding surfaces by thermal performance
- ✅ **Native glTF 2.0 support** (GLTFLoader, GLTFExporter) - PREFERRED FORMAT
- ✅ Additional export formats (OBJ, STL) available via addons
- ✅ Mature ecosystem with extensive documentation
- ✅ Used in architecture/BIM tools (Speckle, BIM Track, etc.)

**Cons**:
- ❌ New dependency (adds ~600 KB to bundle)
- ❌ Separate learning curve from D3.js
- ❌ No direct D3 integration (separate rendering pipeline)

**Example code**:
```javascript
// Three.js wireframe building
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Building geometry
const geometry = new THREE.BoxGeometry(buildingLength, totalHeight, buildingWidth);
const edges = new THREE.EdgesGeometry(geometry);
const wireframe = new THREE.LineSegments(edges,
  new THREE.LineBasicMaterial({ color: 0x000000 })
);

// Add color-coded surfaces (thermal performance)
const material = new THREE.MeshBasicMaterial({
  color: getColorFromUValue(uValue),
  transparent: true,
  opacity: 0.3
});
const mesh = new THREE.Mesh(geometry, material);

scene.add(wireframe);
scene.add(mesh);

// Interactive controls
const controls = new OrbitControls(camera, renderer.domElement);
```

**Verdict**: **Recommended for MVP**. Three.js provides the most robust 3D capabilities with minimal complexity.

---

### 3.2 Option B: D3.js + Custom 2.5D Projection

**Approach**: Use D3.js with custom projection to render isometric or perspective wireframe
**Libraries**: D3.js v7 (already loaded)
**Bundle Size**: 0 KB (no new dependencies)

**Pros**:
- ✅ No new dependencies
- ✅ Familiar D3.js patterns (selection, scales, transitions)
- ✅ Tight integration with existing TEUI D3 visualizations
- ✅ Lightweight

**Cons**:
- ❌ Limited 3D interaction (rotation requires complex matrix transforms)
- ❌ No built-in camera/orbit controls
- ❌ Manual perspective/isometric projection math
- ❌ Difficult to export 3D models (only 2D SVG)
- ❌ Performance issues with complex geometries

**Example code**:
```javascript
// D3.js isometric projection
const isometric = d3.geoProjection((x, y) => {
  const angle = Math.PI / 6;  // 30° isometric
  return [
    (x - y) * Math.cos(angle),
    (x + y) * Math.sin(angle) - z
  ];
});

const path = d3.geoPath(isometric);

svg.selectAll("path")
  .data(buildingFaces)
  .enter().append("path")
  .attr("d", path)
  .attr("fill", d => getColorFromUValue(d.uValue))
  .attr("stroke", "#000");
```

**Verdict**: **Not recommended**. While clever, D3's 2D nature makes 3D interactions cumbersome. Better to use a purpose-built 3D library.

---

### 3.3 Option C: Topologic.py + Python Backend

**Library**: [Topologic](https://topologic.app/) - Python library for topological building modeling
**Architecture**: Python backend API + JavaScript frontend
**License**: GPL-3.0

**Pros**:
- ✅ Purpose-built for architectural topology
- ✅ Advanced spatial analysis (adjacency graphs, space syntax)
- ✅ IFC import/export for BIM interoperability
- ✅ Powerful for future advanced features (space planning, zone analysis)

**Cons**:
- ❌ Requires Python backend (TEUI is currently pure client-side)
- ❌ Adds deployment complexity (server, API, CORS)
- ❌ GPL license may conflict with TEUI's open-source goals
- ❌ Overkill for wireframe visualization (designed for complex BIM workflows)
- ❌ Latency: geometry must round-trip to server

**Verdict**: **Not recommended for MVP**. Topologic is too heavyweight and breaks TEUI's zero-backend architecture. Consider for future **model import** feature only.

---

### 3.4 Option D: Babylon.js (Alternative 3D Engine)

**Library**: [Babylon.js](https://www.babylonjs.com/) - WebGL game engine for 3D
**Version**: 6.x
**License**: Apache 2.0
**Bundle Size**: ~1.2 MB (larger than Three.js)

**Pros**:
- ✅ Powerful 3D engine with physics, lighting, materials
- ✅ Excellent documentation and playground
- ✅ Built-in glTF/OBJ export
- ✅ Strong TypeScript support

**Cons**:
- ❌ Larger bundle size than Three.js
- ❌ Designed for games, not architectural visualization (overkill)
- ❌ Steeper learning curve

**Verdict**: **Not recommended**. Three.js is more established in architecture/BIM domain and lighter weight.

---

### 3.5 Recommended Stack: **Three.js + D3.js**

**MVP Technology Stack**:
- **Three.js r160+** for 3D wireframe rendering
- **D3.js v7** (existing) for UI controls, color scales, and data binding
- **OrbitControls** (Three.js addon) for camera interaction
- **No backend** (pure client-side, maintains TEUI's architecture)

**Why this combination works**:
1. Three.js handles 3D geometry and rendering
2. D3.js handles data-to-visual mapping (U-values → colors, areas → dimensions)
3. Both libraries can coexist (Three.js renders to WebGL canvas, D3 renders SVG UI overlays)
4. Export path: Three.js → glTF → external tools (SketchUp, Rhino, Revit via IFC converters)

---

## 4. Data Requirements & Geometry Derivation

### 4.1 Input Parameters (from TEUI State)

**Required fields** (read from StateManager):

| Field ID | Source Section | Description | Usage in 3D Model |
|----------|----------------|-------------|-------------------|
| d_85 | S11 | Roof Area (m²) | Top surface geometry |
| d_86 | S11 | Walls Above Grade (m²) | Vertical surface area validation |
| d_87 | S11 | Floor Exposed (m²) | Bottom surface (if exposed) |
| d_88 | S11 | Door Area (m²) | Opening geometry |
| d_89-d_92 | S11 | Window Areas by Orientation (m²) | Fenestration distribution |
| d_93 | S11 | Skylights (m²) | Roof openings |
| d_94 | S11 | Walls Below Grade (m²) | Underground geometry |
| d_95 | S11 | Floor Slab (m²) | Foundation footprint |
| d_103 | S12 | Number of Stories | Vertical segmentation |
| d_105 | S12 | Conditioned Volume (m³) | Overall building volume |
| d_106 | S12 | Total Floor Area (m²) | Footprint derivation |
| g_85-g_95 | S11 | U-Values | Surface color-coding |
| o_85-o_95 | S11 | Interior Surface Temps | Thermal visualization |

### 4.2 Constraint-Driven Geometry Solver ("Jello Cube" Algorithm)

**Philosophy**: Instead of deriving rigid dimensions and validating errors, we **solve for geometry that satisfies area constraints**, allowing the model to deform naturally.

**New fields to add to TEUI** (Section 20 user preferences):

| Field ID | Label | Type | Default | Description |
|----------|-------|------|---------|-------------|
| **d_200** | Footprint Length | number | (solved) | X-dimension at ground level (m) |
| **d_201** | Footprint Width | number | (solved) | Y-dimension at ground level (m) |
| **d_202** | Footprint Aspect Ratio | slider | 1.0 | L:W ratio (1.0 = square, 2.0 = 2:1 rectangle) |
| **d_203** | Nominal Height | number | (solved) | Average building height (m) |
| **d_204** | Roof Pitch Mode | dropdown | "Auto" | "Auto" (solve from area), "Flat", "Custom" |
| **d_205** | Building Azimuth | slider | 0° | Rotation from True North (0-360°) |
| **d_206** | Allow Asymmetry | checkbox | ✓ | Let facades deform independently to match areas |
| **d_207** | Constraint Priority | dropdown | "Volume+Areas" | What to satisfy exactly |

---

#### 4.2.1 Constraint Hierarchy (Priority Order)

```
1. SACRED (Never violated):
   └─ Volume (d_105) - Building MUST enclose this exact volume

2. PRIMARY (Satisfy if possible, show conflict if not):
   ├─ Roof Area (d_85)
   ├─ Floor Area (d_106 or d_95)
   └─ Total Wall Area (d_86 + d_94)

3. SECONDARY (Distribute across PRIMARY constraints):
   ├─ Window Areas by Orientation (d_89-d_92)
   ├─ Door Areas (d_88)
   └─ Skylight Area (d_93)

4. PREFERENTIAL (User aesthetics - deformable):
   ├─ Aspect Ratio (d_202) - "I prefer square-ish footprints"
   ├─ Symmetry (d_206) - "I prefer symmetric facades"
   └─ Roof Type (d_204) - "I prefer flat roofs"
```

---

#### 4.2.2 Solver Algorithm (Constraint Satisfaction)

**Phase 1: Establish Footprint (X-Y Plane)**

```javascript
function solveFootprint() {
  const volume = getNumericValue("d_105");           // SACRED
  const floorArea = getNumericValue("d_106");        // PRIMARY (or use d_95 if ground slab)
  const aspectRatio = getNumericValue("d_202");      // PREFERENTIAL (default 1.0 = square)

  // Assume floor is X-Y plane
  const footprintArea = floorArea;  // Start with user's floor area

  // Solve for L × W given aspect ratio preference
  const width = Math.sqrt(footprintArea / aspectRatio);
  const length = footprintArea / width;

  return { length, width, footprintArea };
}
```

**Phase 2: Solve Nominal Height (from Volume)**

```javascript
function solveHeight(footprint) {
  const volume = getNumericValue("d_105");  // SACRED

  // Height must satisfy: Volume = footprint × height
  const nominalHeight = volume / footprint.footprintArea;

  return nominalHeight;
}
```

**Phase 3: Solve Roof Geometry (from Roof Area Constraint)**

```javascript
function solveRoof(footprint) {
  const roofArea = getNumericValue("d_85");     // PRIMARY
  const floorArea = footprint.footprintArea;
  const roofMode = getValue("d_204");           // User preference

  if (roofMode === "Flat" || Math.abs(roofArea - floorArea) < 0.01) {
    // Flat roof: Roof area ≈ Floor area
    return {
      type: "flat",
      pitch: 0,
      peakHeight: 0,
      effectiveArea: floorArea
    };
  }

  // Pitched roof: Roof area > Floor area
  // For gabled roof: roofArea = 2 × (sloped surface area)
  //   where sloped surface = (width/2) × sqrt((width/2)² + peakHeight²)
  //
  // Solve for pitch that gives target roof area:

  const areaRatio = roofArea / floorArea;

  if (areaRatio < 1.0) {
    // CONFLICT: Roof smaller than floor (physically impossible for standard building)
    console.warn(`[TOPOMETRY] Roof area (${roofArea} m²) < Floor area (${floorArea} m²) - Creating inverted pyramid`);
    return {
      type: "inverted",
      pitch: -Math.atan((1 - areaRatio) * 2),  // Negative pitch (inverted)
      peakHeight: 0,  // No peak, goes downward
      effectiveArea: roofArea,
      warning: "Inverted geometry - check roof area input"
    };
  }

  // Standard pitched roof
  // Approximate pitch angle from area ratio (simplified for gabled roof)
  // roofArea ≈ floorArea × sqrt(1 + (2×pitch/width)²)
  const pitchAngle = Math.asin((areaRatio - 1) / 2);  // Radians
  const peakHeight = (footprint.width / 2) * Math.tan(pitchAngle);

  return {
    type: "gabled",
    pitch: pitchAngle * (180 / Math.PI),  // Degrees
    peakHeight: peakHeight,
    effectiveArea: roofArea
  };
}
```

**Phase 4: Solve Wall Deformations (from Wall Area Constraints)**

```javascript
function solveWallGeometry(footprint, nominalHeight) {
  const allowAsymmetry = getValue("d_206");  // User preference

  // Wall areas by orientation (net of openings)
  const wallAreas = {
    north: getNumericValue("d_86") * 0.25,  // Assume 1/4 of total per side (default)
    east: getNumericValue("d_86") * 0.25,
    south: getNumericValue("d_86") * 0.25,
    west: getNumericValue("d_86") * 0.25
  };

  // If user entered orientation-specific walls, override:
  // (Future enhancement: add d_86_north, d_86_east fields)

  const perimeter = 2 * (footprint.length + footprint.width);
  const nominalWallArea = perimeter * nominalHeight;

  if (!allowAsymmetry) {
    // SYMMETRIC mode: All walls same height
    // Scale height uniformly to match total wall area
    const totalWallArea = getNumericValue("d_86");
    const scaledHeight = totalWallArea / perimeter;

    return {
      north: { width: footprint.width, height: scaledHeight },
      south: { width: footprint.width, height: scaledHeight },
      east: { width: footprint.length, height: scaledHeight },
      west: { width: footprint.length, height: scaledHeight }
    };
  }

  // ASYMMETRIC mode: Each wall deforms independently
  // Solve wall height from: wallArea = wallWidth × wallHeight

  return {
    north: {
      width: footprint.width,
      height: wallAreas.north / footprint.width,  // May differ from nominal!
      area: wallAreas.north
    },
    south: {
      width: footprint.width,
      height: wallAreas.south / footprint.width,
      area: wallAreas.south
    },
    east: {
      width: footprint.length,
      height: wallAreas.east / footprint.length,
      area: wallAreas.east
    },
    west: {
      width: footprint.length,
      height: wallAreas.west / footprint.length,
      area: wallAreas.west
    }
  };
}
```

**Phase 5: Distribute Windows (Fill Window Area Constraints)**

```javascript
function distributeWindows(wallGeometry) {
  const windowAreas = {
    north: getNumericValue("d_89"),
    east: getNumericValue("d_90"),
    south: getNumericValue("d_91"),
    west: getNumericValue("d_92")
  };

  const windows = [];

  Object.keys(windowAreas).forEach(orientation => {
    const windowArea = windowAreas[orientation];
    if (windowArea === 0) return;

    const wall = wallGeometry[orientation];

    // CONSTRAINT: Window area must fit on wall
    const wallArea = wall.width * wall.height;

    if (windowArea > wallArea * 0.9) {
      console.warn(`[TOPOMETRY] ${orientation} window area (${windowArea} m²) exceeds wall area (${wallArea} m²)`);
      // Create oversized window (visualization shows conflict)
    }

    // Assume standard window proportions (1.5m high × variable width)
    const windowHeight = Math.min(1.5, wall.height * 0.6);
    const windowWidth = windowArea / windowHeight;

    // Distribute across facade
    const numWindows = Math.max(1, Math.floor(wall.width / windowWidth));
    const actualWindowWidth = windowArea / (numWindows * windowHeight);

    for (let i = 0; i < numWindows; i++) {
      windows.push({
        orientation: orientation,
        x: (i + 0.5) * (wall.width / numWindows),
        y: wall.height * 0.3,  // 30% up from floor (typical sill height)
        width: actualWindowWidth,
        height: windowHeight,
        area: actualWindowWidth * windowHeight
      });
    }
  });

  return windows;
}
```

**Phase 6: Volume Verification (Post-Solve Check)**

```javascript
function verifyVolume(solvedGeometry) {
  const targetVolume = getNumericValue("d_105");  // SACRED

  // Calculate volume of solved geometry
  let calculatedVolume = 0;

  // Base box volume
  const { length, width } = solvedGeometry.footprint;
  const avgHeight = (
    solvedGeometry.walls.north.height +
    solvedGeometry.walls.south.height +
    solvedGeometry.walls.east.height +
    solvedGeometry.walls.west.height
  ) / 4;

  calculatedVolume += length * width * avgHeight;

  // Add roof volume (if pitched)
  if (solvedGeometry.roof.type === "gabled") {
    const roofVolume = (length * width * solvedGeometry.roof.peakHeight) / 2;
    calculatedVolume += roofVolume;
  }

  const volumeError = Math.abs(calculatedVolume - targetVolume) / targetVolume;

  if (volumeError > 0.02) {  // 2% tolerance
    console.error(`[TOPOMETRY] Volume mismatch: Solved ${calculatedVolume.toFixed(1)} m³ vs Target ${targetVolume.toFixed(1)} m³`);

    // CORRECTION: Scale entire model uniformly to match target volume
    const scaleFactor = Math.cbrt(targetVolume / calculatedVolume);

    console.log(`[TOPOMETRY] Applying uniform scale: ${scaleFactor.toFixed(3)}× to preserve volume`);

    // Scale all dimensions
    solvedGeometry.footprint.length *= scaleFactor;
    solvedGeometry.footprint.width *= scaleFactor;
    Object.values(solvedGeometry.walls).forEach(wall => {
      wall.width *= scaleFactor;
      wall.height *= scaleFactor;
    });
  }

  return {
    targetVolume,
    calculatedVolume,
    error: volumeError,
    isValid: volumeError < 0.02
  };
}
```

### 4.3 Visual Feedback System (Not Validation - No Errors!)

**Philosophy Change**: Instead of validation errors, provide **visual feedback** showing how well constraints are satisfied.

**No red error messages** - the model ALWAYS renders, even if it looks impossible/weird.

```javascript
function calculateConstraintSatisfaction(solvedGeometry) {
  // Calculate how well each constraint is satisfied (0% = not met, 100% = perfect)

  const constraints = {};

  // 1. Volume constraint (SACRED - should always be 100%)
  const targetVolume = getNumericValue("d_105");
  const actualVolume = calculateGeometryVolume(solvedGeometry);
  constraints.volume = {
    target: targetVolume,
    actual: actualVolume,
    satisfaction: 100 - Math.abs(actualVolume - targetVolume) / targetVolume * 100,
    color: getColorForSatisfaction(100)  // Always green (volume is SACRED)
  };

  // 2. Roof area constraint
  const targetRoofArea = getNumericValue("d_85");
  const actualRoofArea = solvedGeometry.roof.effectiveArea;
  const roofSatisfaction = 100 - Math.abs(actualRoofArea - targetRoofArea) / targetRoofArea * 100;
  constraints.roof = {
    target: targetRoofArea,
    actual: actualRoofArea,
    satisfaction: Math.max(0, roofSatisfaction),
    color: getColorForSatisfaction(roofSatisfaction),
    message: roofSatisfaction > 95 ? "✓ Roof area matches" :
             roofSatisfaction > 80 ? "⚠ Roof area approximate" :
             "⚠ Roof area significantly different (check if pitched roof intended)"
  };

  // 3. Wall area constraints (sum all facades)
  const targetWallArea = getNumericValue("d_86");
  const actualWallArea = Object.values(solvedGeometry.walls)
    .reduce((sum, wall) => sum + (wall.width * wall.height), 0);
  const wallSatisfaction = 100 - Math.abs(actualWallArea - targetWallArea) / targetWallArea * 100;
  constraints.walls = {
    target: targetWallArea,
    actual: actualWallArea,
    satisfaction: Math.max(0, wallSatisfaction),
    color: getColorForSatisfaction(wallSatisfaction),
    message: wallSatisfaction > 95 ? "✓ Wall area matches" :
             wallSatisfaction > 80 ? "⚠ Wall area approximate (asymmetric facades?)" :
             "⚠ Wall area differs (may indicate unusual building proportions)"
  };

  // 4. Floor area constraint
  const targetFloorArea = getNumericValue("d_106");
  const actualFloorArea = solvedGeometry.footprint.footprintArea;
  const floorSatisfaction = 100 - Math.abs(actualFloorArea - targetFloorArea) / targetFloorArea * 100;
  constraints.floor = {
    target: targetFloorArea,
    actual: actualFloorArea,
    satisfaction: Math.max(0, floorSatisfaction),
    color: getColorForSatisfaction(floorSatisfaction),
    message: floorSatisfaction > 95 ? "✓ Floor area matches" : "⚠ Floor area differs"
  };

  return constraints;
}

function getColorForSatisfaction(percentage) {
  // Color gradient: Red (0%) → Yellow (80%) → Green (100%)
  if (percentage >= 95) return "#00ff00";      // Green (excellent)
  if (percentage >= 80) return "#ffff00";      // Yellow (acceptable)
  if (percentage >= 60) return "#ff9900";      // Orange (concerning)
  return "#ff0000";                             // Red (significant mismatch)
}

// Visual feedback display (in UI)
function displayConstraintFeedback(constraints) {
  const feedbackHTML = `
    <div class="constraint-feedback">
      <h3>Constraint Satisfaction</h3>
      <ul>
        <li style="color: ${constraints.volume.color}">
          🎯 Volume: ${constraints.volume.satisfaction.toFixed(0)}%
          (${constraints.volume.actual.toFixed(0)} / ${constraints.volume.target.toFixed(0)} m³)
        </li>
        <li style="color: ${constraints.roof.color}">
          🏠 Roof: ${constraints.roof.satisfaction.toFixed(0)}%
          (${constraints.roof.actual.toFixed(0)} / ${constraints.roof.target.toFixed(0)} m²)
          <br><small>${constraints.roof.message}</small>
        </li>
        <li style="color: ${constraints.walls.color}">
          🧱 Walls: ${constraints.walls.satisfaction.toFixed(0)}%
          (${constraints.walls.actual.toFixed(0)} / ${constraints.walls.target.toFixed(0)} m²)
          <br><small>${constraints.walls.message}</small>
        </li>
        <li style="color: ${constraints.floor.color}">
          📐 Floor: ${constraints.floor.satisfaction.toFixed(0)}%
          (${constraints.floor.actual.toFixed(0)} / ${constraints.floor.target.toFixed(0)} m²)
        </li>
      </ul>
      <p><small>Tip: If satisfaction is low, the 3D model shows what thermal areas you entered,
      even if they represent an unusual building shape.</small></p>
    </div>
  `;

  document.getElementById("constraint-feedback-container").innerHTML = feedbackHTML;
}
```

**Key difference from old approach**:
- ❌ Old: `if (error > threshold) throw ValidationError`
- ✅ New: `satisfaction = 100 - error; displayFeedback(satisfaction, color)`

**User experience**:
- Model ALWAYS renders (even if roof < floor → inverted pyramid)
- Color-coded feedback shows which constraints are well-satisfied
- Low satisfaction = visual signal to user: "Check your inputs, model looks weird because areas don't match typical building"

### 4.4 Fenestration Distribution

**Window placement algorithm**:
```javascript
function distributeWindows(derivedDims) {
  const { length, width, height, storyHeight, stories } = derivedDims;

  // Window areas by orientation (from S11)
  const windowAreas = {
    north: getNumericValue("d_89"),
    east: getNumericValue("d_90"),
    south: getNumericValue("d_91"),
    west: getNumericValue("d_92")
  };

  // Default window geometry assumptions
  const windowHeight = 1.5;  // m (typical window height)
  const sillHeight = getNumericValue("d_207");  // Offset from floor

  const windows = [];

  // North facade (along width dimension)
  if (windowAreas.north > 0) {
    const numWindows = Math.ceil(windowAreas.north / (windowHeight * 1.2));  // Assume 1.2m wide windows
    const windowWidth = windowAreas.north / (numWindows * windowHeight);

    for (let i = 0; i < numWindows; i++) {
      windows.push({
        orientation: "north",
        x: (i + 0.5) * (width / numWindows) - (width / 2),  // Center along facade
        y: sillHeight + (windowHeight / 2),  // Vertical position
        z: -length / 2,  // North face (negative Z)
        width: windowWidth,
        height: windowHeight,
        area: windowWidth * windowHeight
      });
    }
  }

  // East, South, West facades (similar logic)
  // ... distribute remaining window areas ...

  return windows;
}
```

---

## 5. Architecture Plan

### 5.1 Module Structure

Following TEUI's Pattern A architecture (see [TECHNICAL2.md](../TECHNICAL2.md)):

```
src/
├── core/
│   └── Topometry.js              # NEW: 3D rendering engine (Three.js wrapper)
│
├── sections/
│   └── Section20.js              # NEW: TOPOMETRY section module (Pattern A)
│
└── lib/
    └── three/                    # NEW: Three.js library + addons
        ├── three.module.js       # Three.js r160 (ESM build)
        ├── OrbitControls.js      # Camera controls
        └── GLTFExporter.js       # Model export
```

**File responsibilities**:

| File | Lines (est.) | Purpose |
|------|--------------|---------|
| `Topometry.js` | ~800 | Core 3D engine: geometry generation, rendering, materials |
| `Section20.js` | ~1200 | UI module: field definitions, state management, event handlers |
| `three.module.js` | ~15000 | External library (loaded from CDN or bundled) |

### 5.2 Section20.js Structure (Pattern A)

```javascript
// Section20.js - TOPOMETRY Module
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

window.TEUI.SectionModules.sect20 = (function() {
  "use strict";

  // ========================================
  // 1. FIELD DEFINITIONS
  // ========================================
  const sectionRows = [
    {
      id: "d_200",
      type: "number",
      label: "Building Length",
      defaultValue: "20.0",
      unit: "m",
      editable: false,  // Derived from volume/area
      tooltip: "Primary horizontal dimension (derived from volume and aspect ratio)"
    },
    {
      id: "d_202",
      type: "slider",
      label: "Aspect Ratio (L:W)",
      defaultValue: "1.5",
      min: 0.5,
      max: 4.0,
      step: 0.1,
      editable: true,
      tooltip: "Building length to width ratio (1.0 = square, 3.0 = narrow)"
    },
    {
      id: "d_208",
      type: "dropdown",
      label: "Building Shape",
      defaultValue: "Rectangular Box",
      options: [
        "Rectangular Box",
        "L-Shape",
        "U-Shape",
        "Courtyard",
        "Custom"
      ],
      tooltip: "Simplified building massing geometry"
    }
    // ... more fields ...
  ];

  // ========================================
  // 2. STATE OBJECTS (Pattern A)
  // ========================================
  const TargetState = {
    state: {},
    initialize() { /* ... */ },
    getValue(fieldId) { /* ... */ },
    setValue(fieldId, value) { /* ... */ }
  };

  const ReferenceState = {
    // Same structure as TargetState
  };

  const ModeManager = {
    currentMode: "target",
    switchMode(mode) { /* ... */ },
    getValue(fieldId) { /* ... */ },
    setValue(fieldId, value) { /* ... */ }
  };

  // ========================================
  // 3. GEOMETRY DERIVATION
  // ========================================
  function deriveGeometry() {
    // Implement 4.2 derivation formulas
  }

  function validateGeometry(derivedDims) {
    // Implement 4.3 validation checks
  }

  function distributeWindows(derivedDims) {
    // Implement 4.4 fenestration distribution
  }

  // ========================================
  // 4. CALCULATION ENGINES
  // ========================================
  function calculateTargetModel() {
    const dims = deriveGeometry();
    const validation = validateGeometry(dims);
    const windows = distributeWindows(dims);

    // Update 3D model via Topometry.js
    if (window.TEUI?.Topometry?.updateModel) {
      window.TEUI.Topometry.updateModel(dims, windows, "target");
    }
  }

  function calculateReferenceModel() {
    // Same logic but reads from ReferenceState
  }

  function calculateAll() {
    calculateReferenceModel();  // Reference first (M-N compliance pattern)
    calculateTargetModel();
  }

  // ========================================
  // 5. EVENT HANDLERS
  // ========================================
  function initializeEventHandlers() {
    // Listen to aspect ratio slider
    const aspectSlider = document.querySelector('[data-field-id="d_202"] input[type="range"]');
    aspectSlider?.addEventListener("input", (e) => {
      ModeManager.setValue("d_202", e.target.value);
      calculateAll();  // Re-derive geometry
    });

    // Listen to S11/S12 changes (external dependencies)
    const geometryFields = ["d_85", "d_86", "d_105", "d_106", "d_103"];
    geometryFields.forEach(fieldId => {
      window.TEUI.StateManager.addListener(fieldId, () => {
        calculateTargetModel();  // Geometry changed, update 3D model
      });

      window.TEUI.StateManager.addListener(`ref_${fieldId}`, () => {
        calculateReferenceModel();
      });
    });
  }

  // ========================================
  // 6. PUBLIC API
  // ========================================
  return {
    getFields: () => sectionRows,
    getLayout: () => `
      <div class="section-header">
        <h2>Section 20: TOPOMETRY - 3D Building Visualization</h2>
        <button class="mode-toggle" data-section="sect20">
          <span class="toggle-indicator">Target</span>
        </button>
      </div>
      <div class="section-content">
        <!-- Field containers -->
        <div data-field-id="d_200"></div>
        <div data-field-id="d_202"></div>
        <div data-field-id="d_208"></div>

        <!-- 3D canvas container -->
        <div id="topometry-canvas-container" style="width: 100%; height: 600px; margin: 20px 0;">
          <canvas id="topometry-canvas"></canvas>
        </div>

        <!-- Export controls -->
        <div class="export-controls">
          <button id="export-gltf">Export 3D Model (glTF)</button>
          <button id="export-screenshot">Save Screenshot</button>
        </div>
      </div>
    `,
    calculateAll: calculateAll,
    initializeEventHandlers: initializeEventHandlers,

    // Pattern A exports
    TargetState: TargetState,
    ReferenceState: ReferenceState,
    ModeManager: ModeManager
  };
})();
```

### 5.3 Topometry.js Core Engine

```javascript
// src/core/Topometry.js - Three.js rendering engine
window.TEUI = window.TEUI || {};

window.TEUI.Topometry = (function() {
  "use strict";

  let scene, camera, renderer, controls;
  let buildingMesh, wireframe;

  // ========================================
  // INITIALIZATION
  // ========================================
  function initialize(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error("[TOPOMETRY] Canvas container not found");
      return;
    }

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    // Camera setup
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(30, 30, 30);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById("topometry-canvas"),
      antialias: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Grid helper
    const gridHelper = new THREE.GridHelper(50, 50);
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Animation loop
    animate();

    console.log("[TOPOMETRY] 3D engine initialized");
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  // ========================================
  // MODEL GENERATION
  // ========================================
  function updateModel(dimensions, windows, mode) {
    // Remove existing building
    if (buildingMesh) scene.remove(buildingMesh);
    if (wireframe) scene.remove(wireframe);

    const { length, width, height } = dimensions;

    // Create building box geometry
    const geometry = new THREE.BoxGeometry(length, height, width);
    geometry.translate(0, height / 2, 0);  // Base at ground level

    // Wireframe edges
    const edges = new THREE.EdgesGeometry(geometry);
    wireframe = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
    );
    scene.add(wireframe);

    // Semi-transparent surfaces (color-coded by U-value)
    const uValue = window.TEUI.StateManager.getValue("g_104");  // Average envelope U-value
    const color = getColorFromUValue(parseFloat(uValue) || 0.5);

    const material = new THREE.MeshLambertMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });

    buildingMesh = new THREE.Mesh(geometry, material);
    scene.add(buildingMesh);

    // Add window geometry
    addWindows(windows, dimensions);

    console.log(`[TOPOMETRY] Model updated: ${length.toFixed(1)}m × ${width.toFixed(1)}m × ${height.toFixed(1)}m (${mode})`);
  }

  function addWindows(windows, dimensions) {
    windows.forEach(win => {
      const windowGeometry = new THREE.PlaneGeometry(win.width, win.height);
      const windowMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,  // Sky blue
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });

      const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
      windowMesh.position.set(win.x, win.y, win.z);

      // Rotate to face correct orientation
      if (win.orientation === "north" || win.orientation === "south") {
        windowMesh.rotation.y = 0;
      } else {
        windowMesh.rotation.y = Math.PI / 2;
      }

      scene.add(windowMesh);
    });
  }

  // ========================================
  // COLOR MAPPING (Thermal Performance)
  // ========================================
  function getColorFromUValue(uValue) {
    // Color scale: Green (low U-value, good) → Red (high U-value, bad)
    // Typical range: 0.15 (Passivhaus) to 1.0 (poor)
    const normalized = Math.min(Math.max((uValue - 0.15) / 0.85, 0), 1);

    const green = new THREE.Color(0x00ff00);
    const yellow = new THREE.Color(0xffff00);
    const red = new THREE.Color(0xff0000);

    if (normalized < 0.5) {
      return green.clone().lerp(yellow, normalized * 2);
    } else {
      return yellow.clone().lerp(red, (normalized - 0.5) * 2);
    }
  }

  // ========================================
  // EXPORT FUNCTIONS
  // ========================================
  function exportGLTF() {
    const exporter = new THREE.GLTFExporter();
    exporter.parse(
      scene,
      (gltf) => {
        const blob = new Blob([JSON.stringify(gltf)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'building-model.gltf';
        link.click();
        console.log("[TOPOMETRY] Model exported as glTF");
      },
      { binary: false }
    );
  }

  function saveScreenshot() {
    renderer.render(scene, camera);
    const dataURL = renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'building-screenshot.png';
    link.click();
    console.log("[TOPOMETRY] Screenshot saved");
  }

  // ========================================
  // PUBLIC API
  // ========================================
  return {
    initialize: initialize,
    updateModel: updateModel,
    exportGLTF: exportGLTF,
    saveScreenshot: saveScreenshot
  };
})();
```

---

## 6. Implementation Phases

### Phase 1: MVP - Basic Rectangular Box (2-3 weeks)

**Goal**: Render simple wireframe box from existing TEUI geometry data

**Deliverables**:
- ✅ Three.js integration (library loaded, canvas rendering)
- ✅ Section20.js Pattern A module
- ✅ Topometry.js core engine
- ✅ Derive building dimensions (L × W × H) from volume/area
- ✅ Render rectangular box with wireframe edges
- ✅ Color-code surfaces by average U-value
- ✅ Orbit controls (rotate, zoom, pan)
- ✅ Basic window distribution (no vertical detail)

**Field additions** (Section 20):
- d_200: Building Length (derived)
- d_201: Building Width (derived)
- d_202: Aspect Ratio (user slider)
- d_203: Story Height (derived)

**Validation**:
- Visual inspection: Does the box look reasonable for the given areas?
- Geometry check: Derived roof area matches d_85 within 5%
- Volume check: Box volume matches d_105 within 2%

**Excluded from MVP**:
- ❌ Roof pitch (assume flat)
- ❌ Vertical window distribution (all windows at mid-height)
- ❌ L-shapes, U-shapes, complex geometry
- ❌ Model export (glTF)
- ❌ Basement/underground visualization

---

### Phase 2: Enhanced Geometry (3-4 weeks)

**Goal**: Add roof pitch, multi-story detail, fenestration distribution

**Deliverables**:
- ✅ Roof pitch parameter (d_204) with gabled/hipped roof geometry
- ✅ Per-story window distribution (respect story count)
- ✅ Skylight geometry (d_93)
- ✅ Foundation/basement visualization (d_94, d_95)
- ✅ Building orientation/azimuth (d_205)
- ✅ Thermal performance color-coding by surface (not just average)

**Field additions**:
- d_204: Roof Pitch (0-45°)
- d_205: Building Azimuth (0-360°)
- d_206: Foundation Depth (m)
- d_207: Window Sill Height (m)

**Validation**:
- Multi-story buildings show horizontal floor divisions
- Windows distribute across facades proportionally
- Roof pitch affects roof area (validation warning if mismatch)

---

### Phase 3: Model Export & Import (2-3 weeks)

**Goal**: Enable glTF export and basic model import

**Deliverables**:
- ✅ glTF 2.0 export (binary and ASCII)
- ✅ OBJ export (for legacy tools)
- ✅ Screenshot export (PNG)
- ✅ Basic glTF import (populate TEUI from uploaded model)
- ✅ Model metadata (embed TEUI field values in glTF custom properties)

**Use case**:
1. User exports TEUI building as glTF
2. Opens in SketchUp/Rhino for detailed design
3. Exports refined model from SketchUp
4. Re-imports to TEUI to update geometry (envelope areas auto-calculated)

---

### Phase 4: Advanced Shapes & Solar Integration (4-5 weeks)

**Goal**: L-shapes, U-shapes, courtyard buildings, solar radiation overlay

**Deliverables**:
- ✅ Building shape presets (d_208):
  - Rectangular Box
  - L-Shape
  - U-Shape
  - Courtyard
  - Custom (user-defined polygon)
- ✅ Solar radiation overlay from Section 10 radiant gains
- ✅ Shading analysis (self-shading, neighbor shading)
- ✅ Integration with S18 Parallel Coordinates (optimize building form)

**Field additions**:
- d_208: Building Shape preset
- d_209: L-Shape wing ratio (for L/U shapes)
- d_210: Courtyard size % (for courtyard buildings)

**Validation**:
- Complex shapes: Perimeter and area calculations match S11 inputs
- Solar overlay: Incident radiation matches S10 calculations

---

## 7. Integration Points

### 7.1 StateManager Integration

Section 20 follows Pattern A dual-state architecture:

```javascript
// Read geometry from S11/S12
const roofArea = window.TEUI.StateManager.getValue("d_85");
const volume = window.TEUI.StateManager.getValue("d_105");
const stories = window.TEUI.StateManager.getValue("d_103");

// Write derived dimensions (dual storage)
function setCalculatedValue(fieldId, value) {
  const state = ModeManager.getCurrentState();
  state.setValue(fieldId, value, "calculated");

  const prefix = ModeManager.currentMode === "reference" ? "ref_" : "";
  window.TEUI.StateManager.setValue(`${prefix}${fieldId}`, value, "calculated");
}

// Listen to geometry changes
window.TEUI.StateManager.addListener("d_85", () => {
  calculateTargetModel();  // Roof area changed, re-derive building
});
```

### 7.2 Calculator.js Integration

Add Section 20 to calculation order:

```javascript
// In Calculator.js
const calcOrder = [
  "sect02",  // Building Info
  "sect03",  // Climate
  // ... existing sections ...
  "sect15",  // TEUI Summary
  "sect16",  // Sankey Diagram
  "sect17",  // Dependency Graph
  "sect20",  // TOPOMETRY (NEW - runs after all geometry sections)
  "sect01"   // Key Values (Dashboard)
];
```

**Why S20 runs late**: Section 20 consumes geometry from S11/S12 and thermal data from S11, so it must run after those sections complete.

### 7.3 FieldManager Integration

Register Section 20 fields:

```javascript
// In FieldManager.js renderAllSections()
const sections = [
  "sect01", "sect02", /* ... */ "sect19", "sect20"  // Add S20
];
```

### 7.4 FileHandler Integration

**Import/Export Section 20 fields**:

```javascript
// In FileHandler.js
const section20Fields = ["d_200", "d_201", "d_202", "d_203", "d_204", "d_205", "d_206", "d_207", "d_208"];

// CSV export: Include derived dimensions
function exportToCSV() {
  // ... existing export logic ...
  section20Fields.forEach(fieldId => {
    const value = window.TEUI.StateManager.getValue(fieldId);
    csvRows.push([fieldId, value]);
  });
}

// CSV import: Sync S20 isolated state
function importFromCSV(data) {
  window.TEUI.StateManager.muteListeners();

  // ... import all values ...

  // Sync Section 20 Pattern A state
  const sect20 = window.TEUI.SectionModules.sect20;
  if (sect20) {
    sect20.TargetState.syncFromGlobalState(section20Fields);
    sect20.ReferenceState.syncFromGlobalState(section20Fields);
  }

  window.TEUI.StateManager.unmuteListeners();
  window.TEUI.Calculator.calculateAll();
}
```

### 7.5 Dependency.js Integration

Register S20 dependencies for Dependency Graph (Section 17):

```javascript
// Section20.js - Register dependencies
function registerDependencies() {
  const geometryInputs = ["d_85", "d_86", "d_105", "d_106", "d_103"];
  const derivedOutputs = ["d_200", "d_201", "d_203"];

  geometryInputs.forEach(inputField => {
    derivedOutputs.forEach(outputField => {
      window.TEUI.StateManager.registerDependency(inputField, outputField);
    });
  });
}
```

This ensures the Dependency Graph shows S11/S12 → S20 relationships.

---

## 8. Future Enhancements

### 8.1 Model Import Pipeline

**Vision**: Upload IFC/glTF models to auto-populate TEUI geometry

**Workflow**:
1. User uploads IFC file (from Revit/ArchiCAD)
2. Topometry.js parses IFC geometry (using IFC.js library)
3. Extract envelope areas:
   - Roof area → d_85
   - Wall areas by orientation → d_86, d_89-d_92
   - Floor area → d_106
   - Volume → d_105
4. Auto-populate TEUI fields
5. User reviews/adjusts thermal properties (RSI values, equipment)

**Technical approach**:
- **IFC.js** library for IFC parsing (https://ifcjs.github.io/info/)
- **Three.js IFC loader** for geometry extraction
- **Area calculation** from mesh triangles

**Challenges**:
- IFC complexity (need to filter only relevant geometry)
- Orientation detection (which facade is "North"?)
- Multi-zone buildings (need to aggregate spaces)

### 8.2 Solar Radiation Overlay

**Vision**: Color-code surfaces by incident solar radiation (kWh/m²/year)

**Data source**: Section 10 radiant gains already calculates solar exposure by orientation

**Implementation**:
```javascript
function applySolarOverlay() {
  const solarGains = {
    north: window.TEUI.StateManager.getValue("i_74"),   // Solar gain North (kWh/year)
    east: window.TEUI.StateManager.getValue("i_75"),
    south: window.TEUI.StateManager.getValue("i_76"),
    west: window.TEUI.StateManager.getValue("i_77")
  };

  // Map to per-m² radiation
  const windowAreas = {
    north: window.TEUI.StateManager.getValue("d_89"),
    east: window.TEUI.StateManager.getValue("d_90"),
    south: window.TEUI.StateManager.getValue("d_91"),
    west: window.TEUI.StateManager.getValue("d_92")
  };

  const radiationPerM2 = {
    north: solarGains.north / windowAreas.north,
    east: solarGains.east / windowAreas.east,
    south: solarGains.south / windowAreas.south,
    west: solarGains.west / windowAreas.west
  };

  // Apply color gradient to building facades
  updateFacadeColors(radiationPerM2);
}
```

### 8.3 Parametric Optimization with S18

**Vision**: S18 Parallel Coordinates "Decarbonize" optimization → S20 shows optimized building form

**Workflow**:
1. User runs S18 optimization (finds optimal envelope RSI values)
2. S18 updates S11 fields (f_85, f_89, etc.)
3. S20 automatically updates 3D model colors (better U-values = greener surfaces)
4. User visually sees building "improve" as optimization runs

**Implementation**: Already supported! S20 listens to S11 field changes via StateManager.

### 8.4 Multi-Building Portfolio View

**Vision**: Compare multiple buildings side-by-side in 3D

**Use case**: Portfolio managers want to see all buildings in a development

**Implementation**:
- Load multiple CSV files (one per building)
- Render buildings in grid layout or actual site plan
- Color-code by TEUI performance (green = good, red = poor)

### 8.5 Shading Analysis

**Vision**: Simulate neighbor shading impact on solar gains

**Workflow**:
1. User places "neighbor buildings" in 3D view
2. Topometry.js runs ray-tracing to calculate shading
3. Updates Section 10 solar gains based on reduced exposure
4. TEUI recalculates with adjusted solar heat gains

**Technical approach**:
- Three.js raycasting API
- Simple box neighbors (no detailed geometry needed)
- Hourly sun position (from latitude/longitude in S03)

---

## 9. Technical Challenges

### 9.1 Geometry Under-Determination

**Problem**: TEUI provides areas and volume but not explicit dimensions (L × W × H)

**Solutions**:
1. **User-specified aspect ratio** (d_202): Let user control L:W ratio
2. **Optimization approach**: Find L × W × H that minimizes error between derived and user-provided areas
3. **Sensitivity analysis**: Show user multiple valid geometries (slider to explore alternatives)

**Example optimization**:
```javascript
function optimizeDimensions(targetVolume, targetRoofArea, targetWallArea) {
  let bestFit = null;
  let minError = Infinity;

  // Grid search over aspect ratios
  for (let aspectRatio = 0.5; aspectRatio <= 4.0; aspectRatio += 0.1) {
    const footprint = targetRoofArea;  // Assume flat roof
    const length = Math.sqrt(footprint * aspectRatio);
    const width = footprint / length;
    const height = targetVolume / footprint;

    const derivedWallArea = 2 * (length + width) * height;
    const error = Math.abs(derivedWallArea - targetWallArea);

    if (error < minError) {
      minError = error;
      bestFit = { length, width, height, aspectRatio };
    }
  }

  return bestFit;
}
```

### 9.2 Bundle Size (Three.js)

**Problem**: Three.js adds ~600 KB to bundle (significant for TEUI's lightweight philosophy)

**Solutions**:
1. **Lazy loading**: Only load Three.js when user opens Section 20
2. **CDN delivery**: Load from unpkg.com or jsDelivr (no bundle impact)
3. **Tree-shaking**: Use ES6 modules to import only needed Three.js components

**Recommended approach** (CDN + lazy load):
```javascript
// In Section20.js initializeEventHandlers()
function loadThreeJS() {
  if (window.THREE) {
    // Already loaded
    initializeTopometry();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
  script.type = 'module';
  script.onload = () => {
    console.log("[TOPOMETRY] Three.js loaded");
    initializeTopometry();
  };
  document.head.appendChild(script);
}

// Only load when S20 is visible
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadThreeJS();
    observer.disconnect();
  }
});
observer.observe(document.getElementById('topometry-canvas-container'));
```

### 9.3 Performance (Mobile Devices)

**Problem**: 3D rendering may be slow on low-end devices

**Solutions**:
1. **Level of detail (LOD)**: Simplify geometry on mobile (fewer window details)
2. **Conditional rendering**: Only render when S20 is visible (IntersectionObserver)
3. **Static fallback**: Show 2D isometric projection on unsupported devices

**Detection**:
```javascript
// In Topometry.js
function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch (e) {
    return false;
  }
}

function initialize(containerId) {
  if (!checkWebGLSupport()) {
    console.warn("[TOPOMETRY] WebGL not supported, falling back to 2D view");
    render2DFallback(containerId);
    return;
  }

  // ... normal Three.js initialization ...
}
```

### 9.4 Dual-State 3D Models (Target vs Reference)

**Problem**: Section 20 is Pattern A (dual-state), so it needs to render **two separate 3D models**

**Challenge**: How to visualize Target vs Reference building simultaneously?

**Solutions**:
1. **Side-by-side view**: Two canvases, one for Target (left), one for Reference (right)
2. **Toggle mode**: Single canvas, switch between Target and Reference models
3. **Overlay mode**: Semi-transparent overlay showing differences (red = worse, green = better)

**Recommended approach** (Toggle mode for MVP):
```javascript
// In Section20.js ModeManager
function switchMode(mode) {
  this.currentMode = mode;

  // Update 3D model
  if (mode === "target") {
    window.TEUI.Topometry.updateModel(targetDimensions, targetWindows, "target");
  } else {
    window.TEUI.Topometry.updateModel(referenceDimensions, referenceWindows, "reference");
  }

  this.updateCalculatedDisplayValues();
}
```

**Phase 2 enhancement** (Comparison view):
```javascript
// Show both models with color-coded differences
function showComparisonView() {
  const targetModel = generateModel(targetDimensions, "target");
  const refModel = generateModel(referenceDimensions, "reference");

  // Position side-by-side
  targetModel.position.x = -15;
  refModel.position.x = 15;

  // Color-code by performance delta
  const uValueDelta = targetUValue - referenceUValue;
  const color = uValueDelta < 0 ? 0x00ff00 : 0xff0000;  // Green if Target better
  targetModel.material.color.set(color);

  scene.add(targetModel);
  scene.add(refModel);
}
```

---

## 10. References & Resources

### 10.1 Libraries & Documentation

**Three.js**:
- Official site: https://threejs.org/
- Documentation: https://threejs.org/docs/
- Examples: https://threejs.org/examples/
- GitHub: https://github.com/mrdoob/three.js

**OrbitControls** (Three.js addon):
- Docs: https://threejs.org/docs/#examples/en/controls/OrbitControls
- Example: https://threejs.org/examples/#misc_controls_orbit

**GLTFExporter** (Three.js addon):
- Docs: https://threejs.org/docs/#examples/en/exporters/GLTFExporter
- glTF 2.0 spec: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

**IFC.js** (for future model import):
- Official site: https://ifcjs.github.io/info/
- Web-IFC: https://github.com/IFCjs/web-ifc

### 10.2 Architecture References

**TEUI Documentation**:
- [TECHNICAL2.md](../TECHNICAL2.md) - Core architecture (StateManager, Calculator, Pattern A)
- [S07-S13-S18-STATEMIX-BUG.md](S07-S13-S18-STATEMIX-BUG.md) - Known state mixing issues
- [SectionXX.js](../../src/sections/SectionXX.js) - Pattern A template
- [Section07.js](../../src/sections/Section07.js) - Latest Pattern A reference
- [Section11.js](../../src/sections/Section11.js) - Envelope geometry source

### 10.3 Building Geometry Standards

**Canadian Building Codes**:
- NBC 2020 - Envelope performance requirements
- OBC SB-10 - Energy efficiency standards

**BIM Standards**:
- IFC 4.3 - Industry Foundation Classes (building data schema)
- gbXML - Green Building XML (energy modeling exchange format)

### 10.4 Inspiration Projects

**Web-based 3D Building Visualizations**:
- **Speckle** (https://speckle.systems/) - BIM data platform with Three.js viewer
- **BIM Track** - Issue tracking with 3D model overlay
- **Ubakus.de** (https://ubakus.de/) - 2D thermal bridge calculator (mentioned in TECHNICAL2.md)

**Energy Modeling Tools**:
- **cove.tool** - Early-phase energy modeling with 3D visualization
- **Sefaira** - SketchUp plugin for real-time energy analysis

---

## Appendix A: Field ID Assignments

Section 20 field IDs (200-series):

| Field ID | Label | Type | Default | Source |
|----------|-------|------|---------|--------|
| **d_200** | Building Length | number | (derived) | Calculated |
| **d_201** | Building Width | number | (derived) | Calculated |
| **d_202** | Building Aspect Ratio (L:W) | slider | 1.5 | User input |
| **d_203** | Typical Story Height | number | (derived) | Calculated |
| **d_204** | Roof Pitch | slider | 0° | User input (Phase 2) |
| **d_205** | Building Azimuth | slider | 0° | User input (Phase 2) |
| **d_206** | Foundation Depth | number | 2.4 m | User input (Phase 2) |
| **d_207** | Window Sill Height | number | 0.9 m | User input (Phase 2) |
| **d_208** | Building Shape Preset | dropdown | "Rectangular Box" | User input (Phase 4) |
| **d_209** | L-Shape Wing Ratio | slider | 0.5 | User input (Phase 4) |
| **d_210** | Courtyard Size % | slider | 20% | User input (Phase 4) |

---

## Appendix B: Dependency Graph

```
Section Dependencies (for Section 20):

S02 (Building Info)
  └─> d_103 (Number of Stories) ──┐
                                   │
S11 (Transmission Losses)         │
  ├─> d_85 (Roof Area) ────────┐  │
  ├─> d_86 (Walls) ────────────┤  │
  ├─> d_89-d_92 (Windows) ─────┤  │
  ├─> d_94 (Walls Below Grade) ┤  │
  ├─> d_95 (Floor Slab) ───────┤  │
  └─> g_85-g_95 (U-Values) ────┤  │
                                │  │
S12 (Volume Metrics)             │  │
  ├─> d_105 (Volume) ───────────┤  │
  └─> d_106 (Floor Area) ───────┤  │
                                │  │
                                ▼  ▼
                        ┌──────────────────┐
                        │   SECTION 20     │
                        │   TOPOMETRY      │
                        │                  │
                        │  Derive Geometry │
                        │  Render 3D Model │
                        └──────────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │   Outputs:       │
                        │   d_200 (Length) │
                        │   d_201 (Width)  │
                        │   d_203 (Height) │
                        │   3D Visualization│
                        └──────────────────┘
```

---

## Appendix C: Mockup (ASCII Art)

```
┌───────────────────────────────────────────────────────────────────────┐
│  Section 20: TOPOMETRY - 3D Building Visualization         [Target ▼] │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Building Geometry (Derived from Envelope Areas)                      │
│  ┌─────────────────────────┬─────────────────────────┐               │
│  │ Building Length         │ 24.5 m    (derived)     │               │
│  │ Building Width          │ 16.3 m    (derived)     │               │
│  │ Aspect Ratio (L:W)      │ [====●===] 1.5          │  ← User Slider│
│  │ Typical Story Height    │ 3.2 m     (derived)     │               │
│  │ Total Height            │ 4.8 m     (1.5 stories) │               │
│  └─────────────────────────┴─────────────────────────┘               │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                                                                  │ │
│  │                    3D BUILDING VIEW                             │ │
│  │                                                                  │ │
│  │         ┌───────────────────────────────┐                       │ │
│  │        ╱│                               │╲                      │ │
│  │       ╱ │         Roof (120 m²)        │ ╲                     │ │
│  │      ╱  │     [Green - Low U-value]    │  ╲                    │ │
│  │     ╱   └───────────────────────────────┘   ╲                   │ │
│  │    ╱   ╱│                               │╲   ╲                  │ │
│  │   ╱   ╱ │  North Wall                  │ ╲   ╲                 │ │
│  │  ╱   ╱  │  [Yellow]                    │  ╲   ╲                │ │
│  │ ╱   ╱   │  ▢ ▢ Windows                │   ╲   ╲               │ │
│  │╱   ╱    │                               │    ╲   ╲              │ │
│  │   ╱     └───────────────────────────────┘     ╲   ╲             │ │
│  │  │                                              │   │            │ │
│  │  │  West Wall                  East Wall       │   │            │ │
│  │  │  [Orange]                   [Yellow]        │   │            │ │
│  │  │  ▢ Windows                  ▢ ▢ Windows    │   │            │ │
│  │  │                                              │   │            │ │
│  │  └──────────────────────────────────────────────┘   │            │ │
│  │       Ground Level (Foundation shown below)         │            │ │
│  │                                                                  │ │
│  │  [Drag to rotate | Scroll to zoom | Right-click to pan]         │ │
│  │                                                                  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  Thermal Performance Color Legend:                                    │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │ 🟢 Green   U < 0.25 W/m²K  (Excellent)                        │   │
│  │ 🟡 Yellow  U = 0.25-0.50   (Good)                             │   │
│  │ 🟠 Orange  U = 0.50-0.75   (Code Minimum)                     │   │
│  │ 🔴 Red     U > 0.75        (Poor)                             │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌──────────────────┬──────────────────┬──────────────────┐          │
│  │ Export 3D Model  │ Save Screenshot  │ Show Comparison  │          │
│  │ (glTF)           │ (PNG)            │ (Target vs Ref)  │          │
│  └──────────────────┴──────────────────┴──────────────────┘          │
│                                                                        │
│  Validation Messages:                                                 │
│  ✅ Roof area: Derived 120.2 m² matches user input 120.0 m² (0.2%)   │
│  ✅ Wall area: Derived 178.5 m² matches user input 180.0 m² (0.8%)   │
│  ✅ Volume: Derived 1,176 m³ matches user input 1,176 m³ (0.0%)      │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘
```

---

---

## Summary: Key Architectural Decisions

### What Makes TOPOMETRY Different

**Traditional 3D Building Modelers**:
- Start with geometry → Calculate thermal performance
- Errors if geometry is invalid (roof < floor, overlapping walls, etc.)
- User must know building dimensions

**TOPOMETRY (Thermal Topology Approach)**:
- Start with thermal areas → Solve for geometry that satisfies constraints
- **NO errors** - model deforms to show what areas imply
- User only needs thermal data (already in OBJECTIVE for energy modeling)

### Core Design Principles

1. **Volume is Sacred** - User's conditioned volume (d_105) is ALWAYS preserved exactly
2. **Areas Drive Form** - Roof pitch, wall heights, proportions all emerge from area constraints
3. **No Validation Errors** - Impossible geometry renders visually (e.g., inverted pyramid if roof < floor)
4. **Constraint Satisfaction Feedback** - Color-coded UI shows how well areas match solved geometry
5. **Educational Tool** - Helps users understand how OBJECTIVE "sees" their building from thermal data

### Implementation Strategy

**Technology**: Three.js (3D rendering) + D3.js (existing, for UI)
**Architecture**: Pattern A dual-state module (Section20.js + Topometry.js core engine)
**Phased Development**:
- Phase 1 (MVP): Rectangular box with pitched roof, asymmetric wall deformation
- Phase 2: Enhanced roof types, per-story detail
- Phase 3: Export to glTF/OBJ
- Phase 4: L-shapes, U-shapes, solar overlay

### Success Metrics

✅ **User understands**: "If my model looks weird, my thermal areas don't match a typical building"
✅ **No frustration**: Model always renders, never blocks workflow with validation errors
✅ **Improved data quality**: Users refine area inputs to match design intent after seeing 3D visualization
✅ **Communication tool**: Stakeholders can see thermal performance spatially (color-coded U-values)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-12-08 | Andy & Claude (AI Assistant) | Initial draft based on codebase exploration |
| 0.2 | 2025-12-08 | Andy & Claude (AI Assistant) | Updated to "Thermal Topology" philosophy per user guidance |

---

**END OF WORKPLAN - Ready for Implementation on `TOPOMETRY` branch**
