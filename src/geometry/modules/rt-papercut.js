/**
 * RT-Papercut Module
 * Print-optimized rendering with cutplane and depth-based line weights
 *
 * Initial MVP: "One-shot" print export tool
 * - Dynamic cutplane with slider control
 * - Depth-based line weights (LOD)
 * - White background for print
 * - SVG export via browser print
 */

export const RTPapercut = {
  // Module state (local, not persisted)
  state: {
    printModeEnabled: false,
    cutplaneEnabled: false,
    cutplaneValue: 0,      // Current slider position
    cutplaneAxis: 'z',     // 'x', 'y', or 'z'
    cutplaneNormal: null,  // THREE.Vector3
    lineWeightEnabled: true,
    lineWeightMin: 0.5,
    lineWeightMax: 3.0,
    currentView: 'top'
  },

  // Store references to THREE.js objects
  _scene: null,
  _camera: null,
  _renderer: null,
  _intersectionLines: null, // Group to hold cutplane intersection edge lines

  /**
   * Initialize Papercut module and wire up UI controls
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   * @param {THREE.WebGLRenderer} renderer
   */
  init: function(scene, camera, renderer) {
    console.log('🎨 Initializing RT-Papercut module...');

    // Store references
    RTPapercut._scene = scene;
    RTPapercut._camera = camera;
    RTPapercut._renderer = renderer;

    // 1. Enable Cutplane checkbox
    const cutplaneCheckbox = document.getElementById('enableCutPlane');
    if (cutplaneCheckbox) {
      cutplaneCheckbox.disabled = false;
      cutplaneCheckbox.addEventListener('change', (e) => {
        RTPapercut.state.cutplaneEnabled = e.target.checked;
        RTPapercut.updateCutplane(RTPapercut.state.cutplaneValue, scene);
      });
    }

    // 2. Create Cutplane slider UI dynamically
    RTPapercut._createCutplaneSlider();

    // 3. Wire up slider to cutplane updates
    const cutplaneSlider = document.getElementById('cutplaneSlider');
    const cutplaneValue = document.getElementById('cutplaneValue');

    if (cutplaneSlider) {
      cutplaneSlider.addEventListener('input', (e) => {
        RTPapercut.state.cutplaneValue = parseFloat(e.target.value);
        if (cutplaneValue) {
          cutplaneValue.textContent = e.target.value;
        }
        RTPapercut.updateCutplane(RTPapercut.state.cutplaneValue, scene);
      });
    }

    // 4. Listen to camera view changes to update cutplane axis
    const viewButtons = [
      { id: 'viewTop', view: 'top' },
      { id: 'viewBottom', view: 'bottom' },
      { id: 'viewLeft', view: 'left' },
      { id: 'viewRight', view: 'right' },
      { id: 'viewFront', view: 'front' },
      { id: 'viewBack', view: 'back' },
      { id: 'viewAxo', view: 'axo' },
      { id: 'viewPerspective', view: 'perspective' }
    ];

    viewButtons.forEach(({ id, view }) => {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener('click', () => {
          RTPapercut._updateCutplaneAxisForView(view, scene);
        });
      }
    });

    // 5. Update slider range based on current grid extent
    RTPapercut._updateSliderRange();

    // 6. Listen to grid extent changes
    const cartesianSlider = document.getElementById('cartesianTessSlider');
    if (cartesianSlider) {
      cartesianSlider.addEventListener('change', () => {
        RTPapercut._updateSliderRange();
      });
    }

    console.log('✅ RT-Papercut module initialized');
  },

  /**
   * Create cutplane slider UI and inject into Papercut section
   * @private
   */
  _createCutplaneSlider: function() {
    const papercutSection = document.getElementById('papercut-section');
    if (!papercutSection) {
      console.warn('⚠️ Papercut section not found in HTML');
      return;
    }

    // Check if slider already exists
    if (document.getElementById('cutplaneSlider')) {
      return; // Already created
    }

    // Create slider container
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'control-item';
    sliderContainer.innerHTML = `
      <label class="label-subsection">Cut Plane Position</label>
      <div class="slider-container">
        <input
          type="range"
          id="cutplaneSlider"
          min="-10"
          max="10"
          step="0.1"
          value="0"
        />
        <span class="slider-value" id="cutplaneValue">0.0</span>
      </div>
      <p class="info-text" id="cutplaneAxisInfo">Axis: Z (Top/Bottom view)</p>
    `;

    // Find the "Enable Cut Plane" checkbox and insert slider after it
    const cutplaneCheckbox = document.getElementById('enableCutPlane');
    if (cutplaneCheckbox && cutplaneCheckbox.parentElement) {
      const checkboxContainer = cutplaneCheckbox.parentElement.parentElement;
      checkboxContainer.parentNode.insertBefore(sliderContainer, checkboxContainer.nextSibling);
    } else {
      // Fallback: append to papercut section
      papercutSection.appendChild(sliderContainer);
    }

    console.log('✅ Cutplane slider UI created');
  },

  /**
   * Update slider range based on current grid extent
   * @private
   */
  _updateSliderRange: function() {
    const slider = document.getElementById('cutplaneSlider');
    if (!slider) return;

    const range = RTPapercut._getCutplaneRange();
    slider.min = range.min;
    slider.max = range.max;

    // Reset to center if current value is out of bounds
    const currentValue = parseFloat(slider.value);
    if (currentValue < range.min || currentValue > range.max) {
      slider.value = 0;
      RTPapercut.state.cutplaneValue = 0;
      const valueDisplay = document.getElementById('cutplaneValue');
      if (valueDisplay) {
        valueDisplay.textContent = '0.0';
      }
    }

    console.log(`📐 Cutplane range updated: ${range.min} to ${range.max}`);
  },

  /**
   * Get cutplane range based on current grid extent
   * XYZ grid is always -10 to +10 units (independent of grid divisions)
   * @returns {{min: number, max: number}}
   * @private
   */
  _getCutplaneRange: function() {
    // XYZ grid extent is fixed at ±10 units
    // Grid divisions control line spacing, not extent
    return {
      min: -10,
      max: 10
    };
  },

  /**
   * Update cutplane position and clip geometry
   * @param {number} value - Cutplane position along current axis
   * @param {THREE.Scene} scene
   */
  updateCutplane: function(value, scene) {
    if (!RTPapercut.state.cutplaneEnabled) {
      // Remove clipping planes from all materials
      scene.traverse((object) => {
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => {
              mat.clippingPlanes = [];
              mat.needsUpdate = true;
            });
          } else {
            object.material.clippingPlanes = [];
            object.material.needsUpdate = true;
          }
        }
      });

      // Disable renderer clipping
      if (RTPapercut._renderer) {
        RTPapercut._renderer.localClippingEnabled = false;
        console.log('🔧 Renderer clipping disabled');
      }

      // Remove intersection lines
      if (RTPapercut._intersectionLines) {
        scene.remove(RTPapercut._intersectionLines);
        RTPapercut._intersectionLines.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        RTPapercut._intersectionLines = null;
      }

      console.log('✂️ Cutplane disabled');
      return;
    }

    // 1. Create clipping plane based on current axis
    // Invert normal to clip top-down (architectural style)
    // Show geometry CLOSEST to camera, hide what's farther away
    const normal = new THREE.Vector3();
    if (RTPapercut.state.cutplaneAxis === 'x') {
      normal.set(-1, 0, 0);  // Inverted for top-down clipping
    } else if (RTPapercut.state.cutplaneAxis === 'y') {
      normal.set(0, -1, 0);  // Inverted for top-down clipping
    } else { // 'z'
      normal.set(0, 0, -1);  // Inverted for top-down clipping
    }

    // THREE.Plane(normal, constant)
    // constant = -d where d is distance from origin along normal
    // Clip everything on the far side of the plane from camera
    const plane = new THREE.Plane(normal, value);
    RTPapercut.state.cutplaneNormal = plane;

    // 2. Apply clipping plane to all renderable objects
    let materialCount = 0;
    scene.traverse((object) => {
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => {
            mat.clippingPlanes = [plane];
            mat.clipShadows = true;
            mat.needsUpdate = true;
            materialCount++;
          });
        } else {
          object.material.clippingPlanes = [plane];
          object.material.clipShadows = true;
          object.material.needsUpdate = true;
          materialCount++;
        }
      }
    });
    console.log(`📦 Applied clipping plane to ${materialCount} materials`);

    // 3. Enable renderer local clipping
    if (RTPapercut._renderer) {
      RTPapercut._renderer.localClippingEnabled = true;
      console.log('🔧 Renderer clipping ENABLED');
    } else {
      console.error('❌ Renderer reference not found!');
    }

    // 4. Update slider value display
    const valueDisplay = document.getElementById('cutplaneValue');
    if (valueDisplay) {
      valueDisplay.textContent = value.toFixed(1);
    }

    console.log(`✂️ Cutplane updated: ${RTPapercut.state.cutplaneAxis.toUpperCase()} = ${value.toFixed(1)}`);

    // 5. Generate intersection edges where cutplane slices through geometry
    RTPapercut._generateIntersectionEdges(scene, plane);
  },

  /**
   * Generate visible edge lines where cutplane intersects geometry
   * @param {THREE.Scene} scene
   * @param {THREE.Plane} plane - The cutplane
   * @private
   */
  _generateIntersectionEdges: function(scene, plane) {
    // Remove previous intersection lines
    if (RTPapercut._intersectionLines) {
      scene.remove(RTPapercut._intersectionLines);
      RTPapercut._intersectionLines.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      RTPapercut._intersectionLines = null;
    }

    // Create new group for intersection lines
    const intersectionGroup = new THREE.Group();
    intersectionGroup.name = 'CutplaneIntersectionEdges';

    // Material for intersection edges (thicker, brighter)
    const intersectionMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000, // Red for visibility (can be changed)
      linewidth: 2.0,   // Thicker than regular edges
      opacity: 1.0,
      transparent: false
    });

    // Process MESH objects (not line objects) to get face intersections
    scene.traverse((object) => {
      // Skip non-mesh objects
      if (object.type !== 'Mesh' || !object.geometry) return;

      // Skip invisible/hidden meshes
      if (!object.visible) return;

      // Skip grid-related meshes
      if (object.parent && object.parent.name &&
          (object.parent.name.includes('Grid') || object.parent.name.includes('grid'))) {
        return;
      }

      // Get geometry vertices and faces
      const geometry = object.geometry;
      const positionAttr = geometry.attributes.position;
      if (!positionAttr) return;

      // Collect unique intersection points by checking face edges
      const intersectionSegments = [];
      const vertices = [];

      // Build vertex array
      for (let i = 0; i < positionAttr.count; i++) {
        const vertex = new THREE.Vector3(
          positionAttr.getX(i),
          positionAttr.getY(i),
          positionAttr.getZ(i)
        );
        vertex.applyMatrix4(object.matrixWorld);
        vertices.push(vertex);
      }

      // Get index or create sequential indices
      const indices = geometry.index ? geometry.index.array :
                      Array.from({ length: positionAttr.count }, (_, i) => i);

      // Process triangular faces (groups of 3 indices)
      for (let i = 0; i < indices.length; i += 3) {
        const v1 = vertices[indices[i]];
        const v2 = vertices[indices[i + 1]];
        const v3 = vertices[indices[i + 2]];

        // Check each edge of the triangle for intersection
        const edges = [[v1, v2], [v2, v3], [v3, v1]];
        const faceIntersections = [];

        edges.forEach(([p1, p2]) => {
          const intersection = RTPapercut._lineIntersectPlane(p1, p2, plane);
          if (intersection) {
            faceIntersections.push(intersection);
          }
        });

        // If exactly 2 intersections, we have a line segment crossing this face
        if (faceIntersections.length === 2) {
          intersectionSegments.push([faceIntersections[0], faceIntersections[1]]);
        }
      }

      // Create line segments from intersection pairs
      if (intersectionSegments.length > 0) {
        intersectionSegments.forEach(([p1, p2]) => {
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
          const line = new THREE.LineSegments(lineGeometry, intersectionMaterial);
          intersectionGroup.add(line);
        });
      }
    });

    // Add intersection group to scene
    if (intersectionGroup.children.length > 0) {
      scene.add(intersectionGroup);
      RTPapercut._intersectionLines = intersectionGroup;
      console.log(`✏️ Generated ${intersectionGroup.children.length} intersection segments`);
    }
  },

  /**
   * Calculate intersection point of line segment with plane
   * @param {THREE.Vector3} p1 - Line start point
   * @param {THREE.Vector3} p2 - Line end point
   * @param {THREE.Plane} plane - The plane
   * @returns {THREE.Vector3|null} Intersection point or null if no intersection
   * @private
   */
  _lineIntersectPlane: function(p1, p2, plane) {
    const line = new THREE.Line3(p1, p2);
    const intersection = new THREE.Vector3();

    // Check if line intersects plane
    const result = plane.intersectLine(line, intersection);

    return result; // Returns Vector3 if intersection, null otherwise
  },

  /**
   * Update cutplane axis based on camera view
   * @param {string} view - Camera view name (top, front, left, etc.)
   * @param {THREE.Scene} scene
   * @private
   */
  _updateCutplaneAxisForView: function(view, scene) {
    const axisMap = {
      top: 'z',
      bottom: 'z',
      front: 'y',
      back: 'y',
      left: 'x',
      right: 'x',
      axo: 'z',      // Default to Z for axonometric
      perspective: 'z'
    };

    const newAxis = axisMap[view] || 'z';

    if (newAxis !== RTPapercut.state.cutplaneAxis) {
      RTPapercut.state.cutplaneAxis = newAxis;
      RTPapercut.state.currentView = view;

      // Update axis info display
      const axisInfo = document.getElementById('cutplaneAxisInfo');
      if (axisInfo) {
        const axisNames = { x: 'X', y: 'Y', z: 'Z' };
        const viewNames = {
          top: 'Top/Bottom',
          bottom: 'Top/Bottom',
          front: 'Front/Back',
          back: 'Front/Back',
          left: 'Left/Right',
          right: 'Left/Right',
          axo: 'Axonometric',
          perspective: 'Perspective'
        };
        axisInfo.textContent = `Axis: ${axisNames[newAxis]} (${viewNames[view]} view)`;
      }

      // Update slider range based on grid extent
      RTPapercut._updateSliderRange();

      // Re-apply cutplane with new axis if enabled
      if (RTPapercut.state.cutplaneEnabled) {
        RTPapercut.updateCutplane(RTPapercut.state.cutplaneValue, scene);
      }

      console.log(`📐 Cutplane axis updated: ${newAxis.toUpperCase()} (view: ${view})`);
    }
  }
};
