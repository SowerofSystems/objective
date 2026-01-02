/**
 * RT-Quadrance-Demo
 * Interactive demonstration of quadrance in rational trigonometry
 * Quadrance Q = (x2-x1)² + (y2-y1)² (the square of classical distance)
 */

import * as THREE from 'three';
import { create2DScene, create2DGrid, create2DAxes, initializeModalHandlers } from './rt-demo-utils.js';

let scene, camera, renderer, animate, cleanup;

/**
 * Initialize the quadrance demo
 */
export function initQuadranceDemo() {
  const container = document.getElementById('quadrance-demo-container');
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

  // TODO: Add interactive quadrance visualization
  // - Two draggable points
  // - Line segment between them
  // - Display quadrance value
  // - Visual representation of quadrance geometry

  // Start animation loop
  const renderLoop = () => {
    animate();
    requestAnimationFrame(renderLoop);
  };
  renderLoop();

  // Initialize modal handlers
  initializeModalHandlers('quadrance-modal');
}

/**
 * Cleanup demo resources
 */
export function cleanupQuadranceDemo() {
  if (cleanup) cleanup();
}
