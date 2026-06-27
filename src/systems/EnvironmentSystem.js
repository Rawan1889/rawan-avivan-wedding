import * as THREE from 'three';

/**
 * Builds the botanical garden environment — ground, hedges, trees, path, sky.
 * Sprint 1: empty stub.
 * Sprint 2+: procedural garden geometry loaded here.
 */
export class EnvironmentSystem {
  /** @param {import('./SceneManager').SceneManager} sceneManager */
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
  }

  /** Builds and adds all environment geometry to the scene. */
  init() {
    // Populated in Sprint 2
  }

  /** @param {number} delta */
  update(_delta) {
    // Populated in Sprint 2
  }
}
