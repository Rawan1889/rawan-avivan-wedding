import * as THREE from 'three';

/**
 * Owns the Three.js Scene and provides helpers for adding/removing objects.
 * All world objects are added through here — never directly to scene elsewhere.
 */
export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
  }

  /** @param {THREE.Object3D} object */
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
}
