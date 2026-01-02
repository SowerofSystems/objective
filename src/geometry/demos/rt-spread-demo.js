/**
 * RT-Spread-Demo
 * Interactive demonstration of spread in rational trigonometry
 * Spread s = (cross product)² / (quadrance product)
 * Replaces the classical sine function with a rational alternative
 */

import * as THREE from 'three';
import { create2DScene, create2DGrid, create2DAxes, initializeModalHandlers } from './rt-demo-utils.js';

let scene, camera, renderer, animate, cleanup;

/**
 * Initialize the spread demo
 */
export function initSpreadDemo() {
  const container = document.getElementById('spread-demo-container');
  if (!container) return;

  // Create 2D scene
  const sceneData = create2DScene(container, {
    width: container.clientWidth,
    height: container.clientHeight,
    backgroundColor: 0xfafafa,
    cameraSize: 10
  });

  ({ scene, camera, renderer, animate, cleanup } = sceneData);

  // Add grid and axes
  scene.add(create2DGrid());
  scene.add(create2DAxes());

  // TODO: Add interactive spread visualization
  // - Two lines emanating from origin
  // - Draggable endpoints to adjust angle
  // - Display spread value
  // - Visual representation of spread geometry
  // - Compare with classical sine

  // Start animation loop
  const renderLoop = () => {
    animate();
    requestAnimationFrame(renderLoop);
  };
  renderLoop();

  // Initialize modal handlers
  initializeModalHandlers('spread-modal');
}

/**
 * Cleanup demo resources
 */
export function cleanupSpreadDemo() {
  if (cleanup) cleanup();
}
