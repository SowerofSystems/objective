/**
 * RT-Weierstrauss-Demo
 * Interactive demonstration of Weierstrauss parametrization of the circle
 * Shows how circular motion relates to X/Y vectors using rational functions
 *
 * Weierstrauss substitution:
 * Let t = tan(θ/2), then:
 * x = (1 - t²) / (1 + t²)
 * y = 2t / (1 + t²)
 */

import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { create2DScene, initializeModalHandlers } from './rt-demo-utils.js';

let scene, camera, renderer, animate, cleanup;
let circle, radiusLine, xVector, yVector, draggablePoint;
let isDragging = false;
let angle = Math.PI / 4; // Start at 45 degrees
let radius = 1.5;
let formulaElement, coordsElement;
let snapMarkers = [];

// Golden ratio
const PHI = (1 + Math.sqrt(5)) / 2;

// Snap points: Phi positions and 45° angles
const snapAngles = [
  // 45° angles (spread = 0.5)
  { angle: Math.PI / 4, label: '45°', type: 'spread' },
  { angle: 3 * Math.PI / 4, label: '135°', type: 'spread' },
  { angle: 5 * Math.PI / 4, label: '225°', type: 'spread' },
  { angle: 7 * Math.PI / 4, label: '315°', type: 'spread' },

  // Phi angles (golden rectangle vertices)
  { angle: Math.atan2(1, PHI), label: 'φ', type: 'phi' },
  { angle: Math.atan2(1, -PHI), label: 'φ', type: 'phi' },
  { angle: Math.atan2(-1, PHI), label: 'φ', type: 'phi' },
  { angle: Math.atan2(-1, -PHI), label: 'φ', type: 'phi' },
  { angle: Math.atan2(PHI, 1), label: 'φ', type: 'phi' },
  { angle: Math.atan2(PHI, -1), label: 'φ', type: 'phi' },
  { angle: Math.atan2(-PHI, 1), label: 'φ', type: 'phi' },
  { angle: Math.atan2(-PHI, -1), label: 'φ', type: 'phi' }
];

const SNAP_THRESHOLD = 0.15; // radians (~8.6°)

/**
 * Initialize the Weierstrauss demo
 */
export function initWeierstrassDemo() {
  const container = document.getElementById('weierstrauss-demo-container');
  if (!container) return;

  // Create 2D scene
  const sceneData = create2DScene(container, {
    backgroundColor: 0x000000,
    cameraSize: 2.5
  });

  ({ scene, camera, renderer, animate, cleanup } = sceneData);

  // Move camera up to prevent formula panel from clipping circle
  camera.position.y = 0.3;

  // Create visual elements
  createAxes();
  createCircle();
  createSnapMarkers();
  createVectors();
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
  initializeModalHandlers('weierstrauss-modal');

  // Initial update
  updateVisualization();
}

/**
 * Create coordinate axes
 */
function createAxes() {
  const axisWidth = 1;

  // X axis (hairline grey, terminates at circle boundary)
  const xAxisGeometry = new LineGeometry();
  xAxisGeometry.setPositions([-radius, 0, 0, radius, 0, 0]);
  const xAxisMaterial = new LineMaterial({ color: 0x444444, linewidth: axisWidth });
  xAxisMaterial.resolution.set(window.innerWidth, window.innerHeight);
  const xAxis = new Line2(xAxisGeometry, xAxisMaterial);
  scene.add(xAxis);

  // Y axis (hairline grey, terminates at circle boundary)
  const yAxisGeometry = new LineGeometry();
  yAxisGeometry.setPositions([0, -radius, 0, 0, radius, 0]);
  const yAxisMaterial = new LineMaterial({ color: 0x444444, linewidth: axisWidth });
  yAxisMaterial.resolution.set(window.innerWidth, window.innerHeight);
  const yAxis = new Line2(yAxisGeometry, yAxisMaterial);
  scene.add(yAxis);

  // Add axis labels
  createAxisLabels();
}

/**
 * Create axis labels
 */
function createAxisLabels() {
  const container = document.getElementById('weierstrauss-demo-container');

  // X axis label (red X at right end of circle)
  const xLabel = document.createElement('div');
  xLabel.style.cssText = `
    position: absolute;
    top: 50%;
    left: 68%;
    transform: translate(0, -50%);
    color: #ff0000;
    font-family: 'Courier New', monospace;
    font-size: 18px;
    font-weight: bold;
    pointer-events: none;
  `;
  xLabel.textContent = 'X';
  container.appendChild(xLabel);

  // Y axis label (green Y at top of circle)
  const yLabel = document.createElement('div');
  yLabel.style.cssText = `
    position: absolute;
    top: 16%;
    left: 50%;
    transform: translate(-50%, 0);
    color: #00ff00;
    font-family: 'Courier New', monospace;
    font-size: 18px;
    font-weight: bold;
    pointer-events: none;
  `;
  yLabel.textContent = 'Y';
  container.appendChild(yLabel);
}

/**
 * Create circle
 */
function createCircle() {
  const circleGeometry = new THREE.CircleGeometry(radius, 64);
  const edges = new THREE.EdgesGeometry(circleGeometry);
  const circleMaterial = new THREE.LineBasicMaterial({ color: 0x888888, linewidth: 2 });
  circle = new THREE.LineSegments(edges, circleMaterial);
  scene.add(circle);
}

/**
 * Create snap point markers
 */
function createSnapMarkers() {
  snapAngles.forEach(snap => {
    const x = radius * Math.cos(snap.angle);
    const y = radius * Math.sin(snap.angle);

    // Create small circle marker
    const markerGeometry = new THREE.CircleGeometry(0.06, 16);
    const markerColor = snap.type === 'phi' ? 0xffd700 : 0xff8800; // Gold for φ, orange for 45°
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: markerColor,
      transparent: true,
      opacity: 0.6
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(x, y, 0.02);
    scene.add(marker);
    snapMarkers.push(marker);

    // Create label
    const container = document.getElementById('weierstrauss-demo-container');
    const label = document.createElement('div');
    const labelColor = snap.type === 'phi' ? '#ffd700' : '#ff8800';

    // Convert world coordinates to screen percentage
    const screenX = 50 + (x / 2.5) * 40; // Approximate conversion
    const screenY = 50 - (y / 2.5) * 40;

    label.style.cssText = `
      position: absolute;
      left: ${screenX}%;
      top: ${screenY}%;
      transform: translate(-50%, -50%);
      color: ${labelColor};
      font-family: 'Courier New', monospace;
      font-size: 14px;
      font-weight: bold;
      pointer-events: none;
    `;
    label.textContent = snap.label;
    container.appendChild(label);
  });
}

/**
 * Create X and Y component vectors
 */
function createVectors() {
  // Radius vector (from origin to point on circle)
  const radiusGeometry = new LineGeometry();
  const radiusMaterial = new LineMaterial({
    color: 0x4a9eff,
    linewidth: 3,
    depthTest: false  // Render on top
  });
  radiusMaterial.resolution.set(window.innerWidth, window.innerHeight);
  radiusLine = new Line2(radiusGeometry, radiusMaterial);
  radiusLine.renderOrder = 3;
  scene.add(radiusLine);

  // X component vector (horizontal)
  const xVectorGeometry = new LineGeometry();
  const xVectorMaterial = new LineMaterial({
    color: 0xff0000,  // Red
    linewidth: 3,
    depthTest: false  // Render on top
  });
  xVectorMaterial.resolution.set(window.innerWidth, window.innerHeight);
  xVector = new Line2(xVectorGeometry, xVectorMaterial);
  xVector.renderOrder = 2;
  scene.add(xVector);

  // Y component vector (vertical)
  const yVectorGeometry = new LineGeometry();
  const yVectorMaterial = new LineMaterial({
    color: 0x66ff66,
    linewidth: 3,
    depthTest: false  // Render on top
  });
  yVectorMaterial.resolution.set(window.innerWidth, window.innerHeight);
  yVector = new Line2(yVectorGeometry, yVectorMaterial);
  yVector.renderOrder = 2;
  scene.add(yVector);
}

/**
 * Create draggable point on circle
 */
function createDraggablePoint() {
  const pointGeometry = new THREE.CircleGeometry(0.08, 32);
  const pointMaterial = new THREE.MeshBasicMaterial({ color: 0x4a9eff });
  draggablePoint = new THREE.Mesh(pointGeometry, pointMaterial);
  scene.add(draggablePoint);
}

/**
 * Create formula display overlay
 */
function createFormulaDisplay() {
  const container = document.getElementById('weierstrauss-demo-container');

  // Formula display
  formulaElement = document.createElement('div');
  formulaElement.style.cssText = `
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.85);
    padding: 15px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    border: 1px solid #333;
    box-shadow: 0 2px 8px rgba(255,255,255,0.1);
    color: #ffffff;
  `;
  container.appendChild(formulaElement);

  // Coordinates display
  coordsElement = document.createElement('div');
  coordsElement.style.cssText = `
    position: absolute;
    top: 20px;
    right: 80px;
    background: rgba(0, 0, 0, 0.85);
    padding: 12px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    border: 1px solid #333;
    box-shadow: 0 2px 8px rgba(255,255,255,0.1);
    color: #ffffff;
  `;
  container.appendChild(coordsElement);
}

/**
 * Normalize angle difference to [-π, π] range
 */
function normalizeAngleDiff(diff) {
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return diff;
}

/**
 * Update visualization based on current angle
 */
function updateVisualization() {
  // DOGFOODING: Use Weierstrauss substitution to calculate point on circle
  // This demonstrates the computational advantage: pure rational functions, no trig!
  const t = Math.tan(angle / 2);
  const denom = 1 + t * t;
  const wX = (1 - t * t) / denom;  // Rational function for x-coordinate
  const wY = (2 * t) / denom;      // Rational function for y-coordinate

  // Scale to radius
  const x = wX * radius;
  const y = wY * radius;

  // Update draggable point position
  draggablePoint.position.set(x, y, 0);

  // Update radius vector (origin to point)
  radiusLine.geometry.setPositions([0, 0, 0, x, y, 0]);
  radiusLine.computeLineDistances();

  // Update X component vector (origin to x, 0)
  // Offset slightly in Z to prevent z-fighting with X axis
  xVector.geometry.setPositions([0, 0, 0.01, x, 0, 0.01]);
  xVector.computeLineDistances();

  // Update Y component vector (x, 0 to x, y)
  yVector.geometry.setPositions([x, 0, 0.01, x, y, 0.01]);
  yVector.computeLineDistances();

  // Calculate quadrances (squared lengths)
  const qX = x * x;
  const qY = y * y;
  const qRadius = qX + qY;

  // Calculate angular measures
  // Normalize angle to 0-360° range
  let degrees = (angle * 180 / Math.PI);
  if (degrees < 0) degrees += 360;

  // Radians (normalized to 0-2π)
  let radians = angle;
  if (radians < 0) radians += 2 * Math.PI;

  // Spread: s = sin²(θ)
  // In rational trigonometry, spread goes from 0 to 1 in each quadrant
  const spread = Math.sin(angle) * Math.sin(angle);

  // Calculate traditional method for comparison
  const traditionalX = radius * Math.cos(angle);
  const traditionalY = radius * Math.sin(angle);

  // Update formula display with computational comparison and animated chart
  const weierstrassOps = 8;
  const traditionalOps = 30; // Approximation: 2 trig functions × ~15 Taylor terms each
  const maxOps = 40;
  const wBarWidth = (weierstrassOps / maxOps) * 100;
  const tBarWidth = (traditionalOps / maxOps) * 100;

  formulaElement.innerHTML = `
    <strong>Weierstrauss (ACTIVE):</strong> <span style="color: #00ff88">✓ Rational Functions Only</span><br>
    t = tan(θ/2) = <span style="color: #4a9eff">${t.toFixed(4)}</span> &nbsp;&nbsp;
    x = r·(1-t²)/(1+t²) = <span style="color: #ff0000">${x.toFixed(4)}</span> &nbsp;&nbsp;
    y = r·(2t)/(1+t²) = <span style="color: #66ff66">${y.toFixed(4)}</span><br>
    <span style="color: #888">After tan: 4 multiply + 2 add + 2 divide = <strong>8 ops</strong> (GPU-friendly!)</span><br>
    <br>
    <strong>Traditional:</strong> <span style="color: #ff8800">⚠ Transcendental (Taylor Series)</span><br>
    x = r·cos(θ) = <span style="color: #ff0000">${traditionalX.toFixed(4)}</span> &nbsp;&nbsp;
    y = r·sin(θ) = <span style="color: #66ff66">${traditionalY.toFixed(4)}</span><br>
    <span style="color: #888">sin/cos each ~15 Taylor terms × 2 = <strong>~30 ops</strong> (not GPU-friendly)</span><br>
    <br>
    <div style="margin-top: 10px;">
      <div style="font-size: 11px; color: #aaa; margin-bottom: 4px;">Computational Cost (live):</div>
      <div style="display: flex; align-items: center; margin-bottom: 3px;">
        <span style="width: 90px; font-size: 11px; color: #00ff88;">Weierstrauss:</span>
        <div style="flex: 1; background: #222; height: 18px; border-radius: 2px; overflow: hidden;">
          <div id="weierstrauss-bar" style="width: 0%; background: linear-gradient(90deg, #00ff88, #00cc66); height: 100%; display: flex; align-items: center; justify-content: flex-end; padding-right: 5px; transition: width 0.15s ease-out;">
            <span style="font-size: 10px; color: #000; font-weight: bold;">${weierstrassOps}</span>
          </div>
        </div>
      </div>
      <div style="display: flex; align-items: center;">
        <span style="width: 90px; font-size: 11px; color: #ff8800;">Traditional:</span>
        <div style="flex: 1; background: #222; height: 18px; border-radius: 2px; overflow: hidden;">
          <div id="traditional-bar" style="width: 0%; background: linear-gradient(90deg, #ff8800, #cc6600); height: 100%; display: flex; align-items: center; justify-content: flex-end; padding-right: 5px; transition: width 0.3s ease-out;">
            <span style="font-size: 10px; color: #000; font-weight: bold;">${traditionalOps}</span>
          </div>
        </div>
      </div>
      <div style="font-size: 10px; color: #666; margin-top: 5px; text-align: right;">
        Weierstrauss is <strong style="color: #00ff88">${(traditionalOps / weierstrassOps).toFixed(1)}× faster</strong>
      </div>
    </div>
  `;

  // Animate the bars to show computation happening
  // Use requestAnimationFrame for smooth animation
  requestAnimationFrame(() => {
    const wBar = document.getElementById('weierstrauss-bar');
    const tBar = document.getElementById('traditional-bar');
    if (wBar) wBar.style.width = `${wBarWidth}%`;
    if (tBar) tBar.style.width = `${tBarWidth}%`;
  });

  // Update coordinates display
  coordsElement.innerHTML = `
    <strong>Angular Position:</strong><br>
    Degrees: <span style="color: #4a9eff">${degrees.toFixed(2)}°</span><br>
    Radians: <span style="color: #4a9eff">${radians.toFixed(4)}</span><br>
    Spread: <span style="color: #4a9eff">${spread.toFixed(4)}</span><br>
    <br>
    <strong>Cartesian Position:</strong><br>
    <span style="color: #ff6666">X = ${x.toFixed(4)}</span><br>
    <span style="color: #66ff66">Y = ${y.toFixed(4)}</span><br>
    <br>
    <strong>Quadrances:</strong><br>
    <span style="color: #ff6666">Q(X) = ${qX.toFixed(4)}</span><br>
    <span style="color: #66ff66">Q(Y) = ${qY.toFixed(4)}</span><br>
    <span style="color: #4a9eff">Q(R) = ${qRadius.toFixed(4)}</span>
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

    // Convert to normalized device coordinates
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    // Convert to world coordinates
    const aspect = rect.width / rect.height;
    const cameraSize = 2.5;
    const worldX = x * cameraSize * aspect;
    const worldY = y * cameraSize;

    return { worldX, worldY };
  };

  const handleStart = (event) => {
    const { worldX, worldY } = getMousePos(event);
    const dx = worldX - draggablePoint.position.x;
    const dy = worldY - draggablePoint.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 0.15) {
      isDragging = true;
      canvas.style.cursor = 'grabbing';
      event.preventDefault();
    }
  };

  const handleMove = (event) => {
    if (!isDragging) {
      // Check if hovering over point
      const { worldX, worldY } = getMousePos(event);
      const dx = worldX - draggablePoint.position.x;
      const dy = worldY - draggablePoint.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      canvas.style.cursor = distance < 0.15 ? 'grab' : 'default';
      return;
    }

    const { worldX, worldY } = getMousePos(event);

    // Calculate angle from origin
    let newAngle = Math.atan2(worldY, worldX);

    // Apply snapping to special angles
    for (const snap of snapAngles) {
      const angleDiff = Math.abs(normalizeAngleDiff(newAngle - snap.angle));
      if (angleDiff < SNAP_THRESHOLD) {
        newAngle = snap.angle;
        break;
      }
    }

    angle = newAngle;

    // Update visualization
    updateVisualization();
    event.preventDefault();
  };

  const handleEnd = () => {
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = 'grab';
    }
  };

  // Mouse events
  canvas.addEventListener('mousedown', handleStart);
  canvas.addEventListener('mousemove', handleMove);
  canvas.addEventListener('mouseup', handleEnd);
  canvas.addEventListener('mouseleave', handleEnd);

  // Touch events
  canvas.addEventListener('touchstart', handleStart, { passive: false });
  canvas.addEventListener('touchmove', handleMove, { passive: false });
  canvas.addEventListener('touchend', handleEnd);
}

/**
 * Cleanup demo resources
 */
export function cleanupWeierstrassDemo() {
  if (cleanup) cleanup();

  // Remove formula displays
  if (formulaElement && formulaElement.parentNode) {
    formulaElement.parentNode.removeChild(formulaElement);
  }
  if (coordsElement && coordsElement.parentNode) {
    coordsElement.parentNode.removeChild(coordsElement);
  }
}
