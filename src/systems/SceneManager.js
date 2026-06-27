import * as THREE from 'three';

/**
 * Owns the Three.js scene and orchestrates all registered systems.
 * Every system must be registered here — no external update() calls.
 *
 * Responsibilities: update(), resize(), render().
 */
export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();

    /** @type {Array<{update?: (d:number)=>void, onResize?: ()=>void, dispose?: ()=>void}>} */
    this._systems = [];
  }

  /**
   * Registers a system to receive lifecycle calls.
   * @param {object} system
   */
  register(system) {
    this._systems.push(system);
    return this;
  }

  /** @param {THREE.Object3D} object */
  add(object) { this.scene.add(object); }

  /** @param {THREE.Object3D} object */
  remove(object) { this.scene.remove(object); }

  /** @returns {THREE.Scene} */
  get() { return this.scene; }

  /** @param {number} delta - seconds since last frame */
  update(delta) {
    for (const s of this._systems) s.update?.(delta);
  }

  /** Propagate resize to all registered systems. */
  resize() {
    for (const s of this._systems) s.onResize?.();
  }

  /**
   * @param {THREE.WebGLRenderer} renderer
   * @param {THREE.Camera}        camera
   */
  render(renderer, camera) {
    renderer.render(this.scene, camera);
  }

  dispose() {
    for (const s of this._systems) s.dispose?.();
    this._systems.length = 0;
  }
}
