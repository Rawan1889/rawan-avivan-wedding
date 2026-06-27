import * as THREE from 'three';

/**
 * Central hub for the Three.js scene.
 * Owns update(), resize(), and render() — no other module calls these.
 * Systems register themselves; SceneManager drives their lifecycle.
 */
export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();

    /** @type {Array<{update?: (delta: number) => void, onResize?: () => void}>} */
    this._systems = [];
  }

  /**
   * Registers a system to receive update and resize calls.
   * @param {object} system
   */
  register(system) {
    this._systems.push(system);
  }

  /**
   * Adds an Object3D directly to the scene.
   * @param {THREE.Object3D} object
   */
  add(object) {
    this.scene.add(object);
  }

  /** @param {THREE.Object3D} object */
  remove(object) {
    this.scene.remove(object);
  }

  /** @returns {THREE.Scene} */
  get() {
    return this.scene;
  }

  /** @param {number} delta - seconds since last frame */
  update(delta) {
    for (const sys of this._systems) {
      sys.update?.(delta);
    }
  }

  /** Propagates viewport resize to all registered systems. */
  resize() {
    for (const sys of this._systems) {
      sys.onResize?.();
    }
  }

  /**
   * @param {THREE.WebGLRenderer} renderer
   * @param {THREE.Camera} camera
   */
  render(renderer, camera) {
    renderer.render(this.scene, camera);
  }
}
