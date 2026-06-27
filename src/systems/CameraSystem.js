import * as THREE from 'three';

/**
 * Manages the perspective camera and handles viewport resize.
 * Will receive scroll-driven position/lookAt updates in later sprints.
 */
export class CameraSystem {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    this.camera.position.set(0, 2, 6);
    this.camera.lookAt(0, 0, 0);
  }

  /** Recalculates aspect ratio after a resize event. */
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  /** @returns {THREE.PerspectiveCamera} */
  get() {
    return this.camera;
  }
}
