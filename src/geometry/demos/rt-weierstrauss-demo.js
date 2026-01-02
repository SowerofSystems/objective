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

/**
 * Initialize the Weierstrauss demo
 */
export function initWeierstrassDemo() {
  const container = document.getElementById('weierstrauss-demo-container');
  if (!container) return;

  // Create 2D scene
  const sceneData = create2DScene(container, {
    backgroundColor: 0xffffff,
    cameraSize: 2.5
  });

  ({ scene, camera, renderer, animate, cleanup } = sceneData);

  // Create visual elements
  createAxes();
  createCircle();
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
  const axisLength = 2.5;
  const axisWidth = 2;

  // X axis (red)
  const xAxisGeometry = new LineGeometry();
  xAxisGeometry.setPositions([-axisLength, 0, 0, axisLength, 0, 0]);
  const xAxisMaterial = new LineMaterial({ color: 0xff0000, linewidth: axisWidth });
  xAxisMaterial.resolution.set(window.innerWidth, window.innerHeight);
  const xAxis = new Line2(xAxisGeometry, xAxisMaterial);
  scene.add(xAxis);

  // Y axis (green)
  const yAxisGeometry = new LineGeometry();
  yAxisGeometry.setPositions([0, -axisLength, 0, 0, axisLength, 0]);
  const yAxisMaterial = new LineMaterial({ color: 0x00ff00, linewidth: axisWidth });
  yAxisMaterial.resolution.set(window.innerWidth, window.innerHeight);
  const yAxis = new Line2(yAxisGeometry, yAxisMaterial);
  scene.add(yAxis);
}

/**
 * Create circle
 */
function createCircle() {
  const circleGeometry = new THREE.CircleGeometry(radius, 64);
  const edges = new THREE.EdgesGeometry(circleGeometry);
  const circleMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 });
  circle = new THREE.LineSegments(edges, circleMaterial);
  scene.add(circle);
}

/**
 * Create X and Y component vectors
 */
function createVectors() {
  // Radius vector (from origin to point on circle)
  const radiusGeometry = new LineGeometry();
  const radiusMaterial = new LineMaterial({ color: 0x4a9eff, linewidth: 3 });
  radiusMaterial.resolution.set(window.innerWidth, window.innerHeight);
  radiusLine = new Line2(radiusGeometry, radiusMaterial);
  scene.add(radiusLine);

  // X component vector (horizontal)
  const xVectorGeometry = new LineGeometry();
  const xVectorMaterial = new LineMaterial({ color: 0xff6666, linewidth: 3 });
  xVectorMaterial.resolution.set(window.innerWidth, window.innerHeight);
  xVector = new Line2(xVectorGeometry, xVectorMaterial);
  scene.add(xVector);

  // Y component vector (vertical)
  const yVectorGeometry = new LineGeometry();
  const yVectorMaterial = new LineMaterial({ color: 0x66ff66, linewidth: 3 });
  yVectorMaterial.resolution.set(window.innerWidth, window.innerHeight);
  yVector = new Line2(yVectorGeometry, yVectorMaterial);
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
    background: rgba(255, 255, 255, 0.95);
    padding: 15px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    border: 1px solid #ddd;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  `;
  container.appendChild(formulaElement);

  // Coordinates display
  coordsElement = document.createElement('div');
  coordsElement.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.95);
    padding: 12px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    border: 1px solid #ddd;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  `;
  container.appendChild(coordsElement);
}

/**
 * Update visualization based on current angle
 */
function updateVisualization() {
  // Calculate point on circle
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);

  // Update draggable point position
  draggablePoint.position.set(x, y, 0);

  // Update radius vector (origin to point)
  radiusLine.geometry.setPositions([0, 0, 0, x, y, 0]);

  // Update X component vector (origin to x, 0)
  xVector.geometry.setPositions([0, 0, 0, x, 0, 0]);

  // Update Y component vector (x, 0 to x, y)
  yVector.geometry.setPositions([x, 0, 0, x, y, 0]);

  // Calculate Weierstrauss parameters
  const t = Math.tan(angle / 2);
  const denom = 1 + t * t;
  const wX = (1 - t * t) / denom;
  const wY = (2 * t) / denom;

  // Normalize to radius
  const normX = wX * radius;
  const normY = wY * radius;

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

  // Update formula display
  formulaElement.innerHTML = `
    <strong>Weierstrauss Parametrization:</strong><br>
    Let t = tan(θ/2) = <span style="color: #4a9eff">${t.toFixed(4)}</span><br>
    <br>
    x = r · (1 - t²) / (1 + t²) = ${radius} · <span style="color: #ff6666">${wX.toFixed(4)}</span> = <span style="color: #ff6666">${x.toFixed(4)}</span><br>
    y = r · (2t) / (1 + t²) = ${radius} · <span style="color: #66ff66">${wY.toFixed(4)}</span> = <span style="color: #66ff66">${y.toFixed(4)}</span>
  `;

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
    angle = Math.atan2(worldY, worldX);

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
