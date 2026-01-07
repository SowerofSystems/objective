/**
 * RT-Cross-Demo
 * Interactive demonstration of Cross (c) in Rational Trigonometry
 * Shows Cross as the complement of Spread in the fundamental identity: s + c = 1
 *
 * Key RT Concepts:
 * - Cross (c) = cos²(θ) = x² (horizontal quadrance on unit circle)
 * - Spread (s) = sin²(θ) = y² (vertical quadrance on unit circle)
 * - RT Fundamental Identity: s + c = 1
 * - Cross measures "parallelism" (how aligned with horizontal)
 * - Spread measures "perpendicularity" (how aligned with vertical)
 */

import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { create2DScene, initializeModalHandlers } from "./rt-demo-utils.js";
import { RT } from "../modules/rt-math.js";

let scene, camera, renderer, animate, cleanup;
let circle, radiusLine, crossBar, spreadBar;
let draggablePoint;
let isDragging = false;
let angle = Math.PI / 4; // Start at 45 degrees (s = c = 0.5)
let radius = 1.5;
let formulaElement;
let snapMarkers = [];
let crossRectangle, spreadRectangle;
let crossRectangleFill, spreadRectangleFill;

// Snappoints for exact rational cross/spread values
const snapPoints = [
  // Cardinal directions
  { x: 1, y: 0, c: 1.0, s: 0.0, label: "c=1", type: "cardinal" }, // 0°
  { x: 0, y: 1, c: 0.0, s: 1.0, label: "s=1", type: "cardinal" }, // 90°

  // 45° - Exact rational 1/2
  {
    x: 1 / Math.sqrt(2),
    y: 1 / Math.sqrt(2),
    c: 0.5,
    s: 0.5,
    label: "c=s=½",
    type: "special",
  },

  // 30-60-90 triangle points
  {
    x: Math.sqrt(3) / 2,
    y: 0.5,
    c: 0.75,
    s: 0.25,
    label: "c=¾",
    type: "rational",
  },
  {
    x: 0.5,
    y: Math.sqrt(3) / 2,
    c: 0.25,
    s: 0.75,
    label: "s=¾",
    type: "rational",
  },
];

const SNAP_THRESHOLD = 0.04; // radians (~2.3°)

/**
 * Initialize the Cross demo
 */
export function initCrossDemo() {
  const container = document.getElementById("cross-demo-container");
  if (!container) return;

  // Create 2D scene with purple/magenta theme to distinguish from other demos
  const sceneData = create2DScene(container, {
    backgroundColor: 0x1a001a, // Dark purple background
    cameraSize: 1.2, // Zoomed for Q1 focus
  });

  ({ scene, camera, renderer, animate, cleanup } = sceneData);

  // Shift camera to center on Q1 (positive x, positive y quadrant)
  camera.position.x = radius * 0.45;
  camera.position.y = radius * 0.45;

  // Create visual elements
  createAxes();
  createCircle();
  createSnapMarkers();
  createComplementaryRectangles();
  createRadiusLine();
  createDraggablePoint();
  createFormulaDisplay();

  // Set up interaction
  setupInteraction(container);

  // Start animation loop
  const renderLoop = () => {
    animate();
    requestAnimationFrame(renderLoop);
  };
  renderLoop();

  // Initialize modal handlers
  initializeModalHandlers("cross-modal");

  // Initial update
  updateVisualization();
}

/**
 * Create coordinate axes (Q1 only - positive X and Y)
 */
function createAxes() {
  const axisWidth = 2;

  // X axis (positive only, red)
  const xAxisGeometry = new LineGeometry();
  xAxisGeometry.setPositions([0, 0, 0, radius, 0, 0]);
  const xAxisMaterial = new LineMaterial({
    color: 0xff0000,
    linewidth: axisWidth,
  });
  xAxisMaterial.resolution.set(window.innerWidth, window.innerHeight);
  const xAxis = new Line2(xAxisGeometry, xAxisMaterial);
  scene.add(xAxis);

  // Y axis (positive only, green)
  const yAxisGeometry = new LineGeometry();
  yAxisGeometry.setPositions([0, 0, 0, 0, radius, 0]);
  const yAxisMaterial = new LineMaterial({
    color: 0x00ff00,
    linewidth: axisWidth,
  });
  yAxisMaterial.resolution.set(window.innerWidth, window.innerHeight);
  const yAxis = new Line2(yAxisGeometry, yAxisMaterial);
  scene.add(yAxis);
}

/**
 * Create the Q1 arc (0° to 90° only) using RT parametrization
 */
function createCircle() {
  // RT METHOD: Generate arc using Weierstrass parametrization
  const points = [];
  const numPoints = 64;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const t_squared = t * t;
    const denominator = 1 + t_squared;
    const x = ((1 - t_squared) / denominator) * radius;
    const y = ((2 * t) / denominator) * radius;
    points.push(new THREE.Vector3(x, y, 0));
  }

  const arcGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const arcMaterial = new THREE.LineBasicMaterial({
    color: 0x888888,
    linewidth: 1,
  });
  circle = new THREE.Line(arcGeometry, arcMaterial);
  scene.add(circle);
}

/**
 * Create snap point markers
 */
function createSnapMarkers() {
  const container = document.getElementById("cross-demo-container");

  snapPoints.forEach((snap) => {
    const x = radius * snap.x;
    const y = radius * snap.y;

    let markerGeometry, markerColor, labelColor;

    if (snap.type === "cardinal") {
      markerGeometry = new THREE.CircleGeometry(0.03, 16);
      markerColor = 0x666666;
      labelColor = "#666666";
    } else if (snap.type === "special") {
      // Orange for 45° (c = s = 0.5)
      markerGeometry = new THREE.CircleGeometry(0.03, 16);
      markerColor = 0xff8800;
      labelColor = "#ff8800";
    } else {
      // Cyan for rational values
      markerGeometry = new THREE.CircleGeometry(0.03, 16);
      markerColor = 0x00cccc;
      labelColor = "#00cccc";
    }

    const markerMaterial = new THREE.MeshBasicMaterial({
      color: markerColor,
      transparent: true,
      opacity: 0.6,
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(x, y, 0.02);
    scene.add(marker);
    snapMarkers.push(marker);

    // Create label
    const label = document.createElement("div");
    const rect = container.getBoundingClientRect();
    const aspect = rect.width / rect.height;
    const cameraSize = 1.2;
    const cameraOffsetX = radius * 0.45;
    const cameraOffsetY = radius * 0.45;

    const labelOffset = 0.15;
    const labelX = x + (x / radius) * labelOffset;
    const labelY = y + (y / radius) * labelOffset;

    const screenX = 50 + ((labelX - cameraOffsetX) / (cameraSize * aspect)) * 50;
    const screenY = 50 - ((labelY - cameraOffsetY) / cameraSize) * 50;

    label.style.cssText = `
      position: absolute;
      left: ${screenX}%;
      top: ${screenY}%;
      transform: translate(-50%, -50%);
      color: ${labelColor};
      font-family: 'Courier New', monospace;
      font-size: 12px;
      font-weight: bold;
      pointer-events: none;
      text-shadow: 0 0 3px rgba(0,0,0,0.8);
    `;
    label.textContent = snap.label;
    container.appendChild(label);
  });
}

/**
 * Create complementary rectangles showing Cross (c) and Spread (s)
 */
function createComplementaryRectangles() {
  // Cross rectangle (horizontal component) - BLUE
  const crossFillGeometry = new THREE.BufferGeometry();
  const crossFillVertices = new Float32Array([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  crossFillGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(crossFillVertices, 3)
  );
  crossFillGeometry.setIndex([0, 1, 2, 0, 2, 3]);

  const crossFillMaterial = new THREE.MeshBasicMaterial({
    color: 0x4a9eff, // Blue for cross (horizontal/parallel)
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });

  crossRectangleFill = new THREE.Mesh(crossFillGeometry, crossFillMaterial);
  crossRectangleFill.position.z = -0.03;
  scene.add(crossRectangleFill);

  // Cross rectangle outline
  const crossGeometry = new LineGeometry();
  crossGeometry.setPositions([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const crossMaterial = new LineMaterial({
    color: 0x4a9eff,
    linewidth: 2,
    transparent: true,
    opacity: 0.8,
  });
  crossMaterial.resolution.set(window.innerWidth, window.innerHeight);
  crossRectangle = new Line2(crossGeometry, crossMaterial);
  crossRectangle.position.z = -0.02;
  scene.add(crossRectangle);

  // Spread rectangle (vertical component) - ORANGE/RED
  const spreadFillGeometry = new THREE.BufferGeometry();
  const spreadFillVertices = new Float32Array([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  spreadFillGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(spreadFillVertices, 3)
  );
  spreadFillGeometry.setIndex([0, 1, 2, 0, 2, 3]);

  const spreadFillMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6600, // Orange for spread (vertical/perpendicular)
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });

  spreadRectangleFill = new THREE.Mesh(spreadFillGeometry, spreadFillMaterial);
  spreadRectangleFill.position.z = -0.03;
  scene.add(spreadRectangleFill);

  // Spread rectangle outline
  const spreadGeometry = new LineGeometry();
  spreadGeometry.setPositions([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const spreadMaterial = new LineMaterial({
    color: 0xff6600,
    linewidth: 2,
    transparent: true,
    opacity: 0.8,
  });
  spreadMaterial.resolution.set(window.innerWidth, window.innerHeight);
  spreadRectangle = new Line2(spreadGeometry, spreadMaterial);
  spreadRectangle.position.z = -0.02;
  scene.add(spreadRectangle);
}

/**
 * Create radius line
 */
function createRadiusLine() {
  const radiusGeometry = new LineGeometry();
  const radiusMaterial = new LineMaterial({
    color: 0xffffff,
    linewidth: 2,
  });
  radiusMaterial.resolution.set(window.innerWidth, window.innerHeight);
  radiusLine = new Line2(radiusGeometry, radiusMaterial);
  radiusLine.position.z = 0.01;
  scene.add(radiusLine);
}

/**
 * Create draggable point on circle
 */
function createDraggablePoint() {
  const pointGeometry = new THREE.CircleGeometry(0.05, 32);
  const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  draggablePoint = new THREE.Mesh(pointGeometry, pointMaterial);
  draggablePoint.position.z = 0.02;
  scene.add(draggablePoint);
}

/**
 * Create formula display panel
 */
function createFormulaDisplay() {
  const container = document.getElementById("cross-demo-container");

  // Title overlay (top-left)
  const titleElement = document.createElement("div");
  titleElement.style.cssText = `
    position: absolute;
    top: 10px;
    left: 15px;
    font-family: 'Courier New', monospace;
    font-size: 16px;
    font-weight: bold;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
    pointer-events: none;
  `;
  titleElement.textContent = "Cross (c) - The Complement of Spread";
  container.appendChild(titleElement);

  // Close button
  const closeButton = document.createElement("button");
  closeButton.className = "close-modal";
  closeButton.innerHTML = "&times;";
  closeButton.style.cssText = `
    position: absolute;
    top: 5px;
    right: 10px;
    background: transparent;
    border: none;
    font-size: 32px;
    color: #888;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
    z-index: 10;
  `;
  closeButton.onmouseover = () => (closeButton.style.color = "#fff");
  closeButton.onmouseout = () => (closeButton.style.color = "#888");
  closeButton.onclick = () => {
    document.getElementById("cross-modal").style.display = "none";
  };
  container.appendChild(closeButton);

  // Formula display (bottom panel) - FIXED HEIGHT with tighter padding
  formulaElement = document.createElement("div");
  formulaElement.style.cssText = `
    position: absolute;
    bottom: 10px;
    left: 10px;
    right: 10px;
    height: 180px;
    background: rgba(26, 0, 26, 0.95);
    padding: 6px 8px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    border: 1px solid #cc00cc;
    box-shadow: 0 2px 8px rgba(255,0,255,0.3);
    color: #ffffff;
    overflow: hidden;
  `;
  container.appendChild(formulaElement);
}

/**
 * Update visualization based on current angle
 */
function updateVisualization() {
  // Calculate point on circle
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);

  // Update draggable point
  draggablePoint.position.set(x, y, 0.02);

  // Update radius line
  radiusLine.geometry.dispose();
  const radiusGeom = new LineGeometry();
  radiusGeom.setPositions([0, 0, 0, x, y, 0]);
  radiusLine.geometry = radiusGeom;

  // Calculate Cross and Spread (normalized to unit circle)
  const normX = x / radius;
  const normY = y / radius;
  const cross = normX * normX; // c = x² (horizontal quadrance)
  const spread = normY * normY; // s = y² (vertical quadrance)
  const identity = cross + spread; // Should equal 1.000

  // Update Cross rectangle (from origin to (x, 0))
  const crossPositions = crossRectangleFill.geometry.attributes.position;
  crossPositions.setXYZ(0, 0, 0, 0); // origin
  crossPositions.setXYZ(1, x, 0, 0); // along X axis
  crossPositions.setXYZ(2, x, 0, 0); // stay on X axis
  crossPositions.setXYZ(3, 0, 0, 0); // back to origin
  crossPositions.needsUpdate = true;

  crossRectangle.geometry.dispose();
  const crossRectGeom = new LineGeometry();
  crossRectGeom.setPositions([0, 0, 0, x, 0, 0, x, 0, 0, 0, 0, 0, 0, 0, 0]);
  crossRectangle.geometry = crossRectGeom;

  // Update Spread rectangle (from (x, 0) to (x, y))
  const spreadPositions = spreadRectangleFill.geometry.attributes.position;
  spreadPositions.setXYZ(0, x, 0, 0); // start at end of cross
  spreadPositions.setXYZ(1, x, y, 0); // up to point on circle
  spreadPositions.setXYZ(2, x, y, 0); // stay at point
  spreadPositions.setXYZ(3, x, 0, 0); // back to start
  spreadPositions.needsUpdate = true;

  spreadRectangle.geometry.dispose();
  const spreadRectGeom = new LineGeometry();
  spreadRectGeom.setPositions([x, 0, 0, x, y, 0, x, y, 0, x, 0, 0, x, 0, 0]);
  spreadRectangle.geometry = spreadRectGeom;

  // Calculate degrees for reference
  let degrees = (angle * 180) / Math.PI;
  if (degrees < 0) degrees += 360;

  // Find matching snap point for special messages
  let snapInfo = "";
  const currentSnap = snapPoints.find((snap) => {
    const dx = normX - snap.x;
    const dy = normY - snap.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < 0.01;
  });

  if (currentSnap) {
    if (currentSnap.type === "special") {
      snapInfo = `<strong style="color: #ff8800;">45° - Exact Rational ½</strong><br>Perfect balance: c = s = 0.5 (used in grid rotation)`;
    } else if (currentSnap.type === "cardinal") {
      if (currentSnap.c === 1) {
        snapInfo = `<strong style="color: #4a9eff;">0° - Pure Horizontal</strong><br>Maximum cross: c = 1, perfectly aligned`;
      } else {
        snapInfo = `<strong style="color: #ff6600;">90° - Pure Vertical</strong><br>Maximum spread: s = 1, perfectly perpendicular`;
      }
    } else if (currentSnap.c === 0.75) {
      snapInfo = `<strong style="color: #00cccc;">30° - Rational ¾</strong><br>30-60-90 triangle: c = ¾, s = ¼`;
    } else {
      snapInfo = `<strong style="color: #00cccc;">60° - Rational ¾</strong><br>30-60-90 triangle: s = ¾, c = ¼`;
    }
  }

  // Create visual identity bar
  const crossBarWidth = cross * 100;
  const spreadBarWidth = spread * 100;

  // Update formula display with left-aligned titles and horizontal layout
  formulaElement.innerHTML = `
    <div style="display: flex; gap: 15px; font-size: 13px; line-height: 1.3;">
      <!-- Left column: Titles -->
      <div style="display: flex; flex-direction: column; gap: 3px; padding-right: 10px; border-right: 1px solid #440044;">
        <strong style="color: #cc00cc; font-size: 12px;">Position</strong>
        <strong style="color: #4a9eff; font-size: 12px;">Cross (c)</strong>
        <strong style="color: #ff6600; font-size: 12px;">Spread (s)</strong>
        <strong style="color: #cc00cc; font-size: 12px;">RT Identity</strong>
      </div>

      <!-- Right side: Values in horizontal layout -->
      <div style="flex: 1;">
        <!-- Position values -->
        <div style="margin-bottom: 3px;">
          <span style="color: #ff6666">x = ${normX.toFixed(4)}</span> &nbsp;
          <span style="color: #66ff66">y = ${normY.toFixed(4)}</span> &nbsp;
          <span style="color: #888; font-size: 11px;">θ ≈ ${degrees.toFixed(1)}°</span>
        </div>

        <!-- Cross value -->
        <div style="margin-bottom: 3px;">
          c = x² = <span style="color: #4a9eff">${cross.toFixed(4)}</span> &nbsp;
          <span style="color: #888; font-size: 11px;">Horizontal Q</span> &nbsp;
          <span style="color: #888; font-size: 11px;">Parallelism</span>
        </div>

        <!-- Spread value -->
        <div style="margin-bottom: 3px;">
          s = y² = <span style="color: #ff6600">${spread.toFixed(4)}</span> &nbsp;
          <span style="color: #888; font-size: 11px;">Vertical Q</span> &nbsp;
          <span style="color: #888; font-size: 11px;">Perpendicularity</span>
        </div>

        <!-- RT Identity -->
        <div>
          s + c = <span style="color: ${Math.abs(identity - 1.0) < 0.0001 ? "#00ff88" : "#ff4444"}">${identity.toFixed(4)}</span> &nbsp;
          ${Math.abs(identity - 1.0) < 0.0001 ? '<span style="color: #00ff88; font-size: 11px;">✓ Verified</span>' : '<span style="color: #ff4444; font-size: 11px;">✗ Error</span>'} &nbsp;
          <span style="color: #888; font-size: 11px;">s + c = 1</span>
        </div>
      </div>
    </div>

    <div style="margin-top: 5px; padding-top: 4px; border-top: 1px solid #440044;">
      <div style="display: flex; height: 10px; border-radius: 2px; overflow: hidden; box-shadow: 0 0 4px rgba(255,0,255,0.3);">
        <div style="width: ${crossBarWidth}%; background: linear-gradient(90deg, #4a9eff, #2a7edf); display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 8px; color: white; font-weight: bold;">${cross > 0.15 ? `c=${cross.toFixed(2)}` : ""}</span>
        </div>
        <div style="width: ${spreadBarWidth}%; background: linear-gradient(90deg, #ff6600, #dd4400); display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 8px; color: white; font-weight: bold;">${spread > 0.15 ? `s=${spread.toFixed(2)}` : ""}</span>
        </div>
      </div>
    </div>

    ${snapInfo ? `<div style="margin-top: 5px; padding: 5px 6px; background: rgba(255,255,255,0.05); border-radius: 2px; font-size: 11px; line-height: 1.35;">${snapInfo}</div>` : '<div style="height: 35px;"></div>'}

    <div style="margin-top: 5px; font-size: 10px; color: #aaa; line-height: 1.4;">
      <strong style="color: #cc00cc;">RT Principle:</strong> Cross and Spread partition the radius quadrance. Cross measures horizontal alignment (parallelism), Spread measures vertical alignment (perpendicularity).
    </div>
  `;
}

/**
 * Set up mouse/touch interaction
 */
function setupInteraction(container) {
  const canvas = renderer.domElement;

  const getMousePos = (event) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const aspect = rect.width / rect.height;
    const cameraSize = 1.2;
    const worldX = x * cameraSize * aspect + camera.position.x;
    const worldY = y * cameraSize + camera.position.y;

    return { worldX, worldY };
  };

  const handleStart = (event) => {
    const { worldX, worldY } = getMousePos(event);
    const dx = worldX - draggablePoint.position.x;
    const dy = worldY - draggablePoint.position.y;
    const clickQuadrance = dx * dx + dy * dy;
    const hitThresholdQ = 0.08 * 0.08;

    if (clickQuadrance < hitThresholdQ) {
      isDragging = true;
      canvas.style.cursor = "grabbing";
      event.preventDefault();
    }
  };

  const handleMove = (event) => {
    const { worldX, worldY } = getMousePos(event);

    if (!isDragging) {
      const dx = worldX - draggablePoint.position.x;
      const dy = worldY - draggablePoint.position.y;
      const hoverQuadrance = dx * dx + dy * dy;
      const hitThresholdQ = 0.08 * 0.08;
      canvas.style.cursor = hoverQuadrance < hitThresholdQ ? "grab" : "default";
      return;
    }

    // Normalize to circle and constrain to Q1
    const dist = Math.sqrt(worldX * worldX + worldY * worldY);
    let normX = Math.max(0, worldX / dist);
    let normY = Math.max(0, worldY / dist);

    // Re-normalize after clamping
    const newDist = Math.sqrt(normX * normX + normY * normY);
    if (newDist > 0) {
      normX /= newDist;
      normY /= newDist;
    }

    // RT OPTIMIZATION: Quadrance-based snapping
    let snappedX = normX;
    let snappedY = normY;
    const snapThresholdQ = SNAP_THRESHOLD * SNAP_THRESHOLD;

    for (const snap of snapPoints) {
      const dx = normX - snap.x;
      const dy = normY - snap.y;
      const quadrance = dx * dx + dy * dy;

      if (quadrance < snapThresholdQ) {
        snappedX = snap.x;
        snappedY = snap.y;
        break;
      }
    }

    // Calculate angle from snapped coordinates
    angle = Math.atan2(snappedY, snappedX);

    updateVisualization();
    event.preventDefault();
  };

  const handleEnd = () => {
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = "default";
    }
  };

  // Mouse events
  canvas.addEventListener("mousedown", handleStart);
  canvas.addEventListener("mousemove", handleMove);
  canvas.addEventListener("mouseup", handleEnd);
  canvas.addEventListener("mouseleave", handleEnd);

  // Touch events
  canvas.addEventListener("touchstart", handleStart, { passive: false });
  canvas.addEventListener("touchmove", handleMove, { passive: false });
  canvas.addEventListener("touchend", handleEnd);
}

/**
 * Cleanup demo resources
 */
export function cleanupCrossDemo() {
  if (cleanup) cleanup();

  if (formulaElement && formulaElement.parentNode) {
    formulaElement.parentNode.removeChild(formulaElement);
  }
}
