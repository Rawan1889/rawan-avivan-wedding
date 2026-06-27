import * as THREE from 'three';

/**
 * Creates and manages all scene lights.
 * Sprint 1: empty stub — no lights needed for white background + cube.
 * Sprint 2+: golden-hour sun, fill, rim, and ambient.
 */
export class LightingSystem {
  /** @param {import('./SceneManager').SceneManager} sceneManager */
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
  }

  /** Instantiates lights and adds them to the scene. */
  init() {
    // Populated in Sprint 2
  }

  /** @param {number} delta - seconds since last frame */
  update(_delta) {
    // Populated in Sprint 2
  }
}
