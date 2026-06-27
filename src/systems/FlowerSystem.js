/**
 * Flower system — instanced rendering architecture.
 * Sprint N: instantiate per-type InstancedMesh with full LOD support.
 *
 * Supports:
 *   WHITE_ROSE / CREAM_ROSE / MINI_ROSE
 *   BABYS_BREATH / HYDRANGEA / LAVENDER / PEONY / JASMINE
 */

/** @enum {string} */
export const FLOWER_TYPES = Object.freeze({
  WHITE_ROSE:   'white_rose',
  CREAM_ROSE:   'cream_rose',
  MINI_ROSE:    'mini_rose',
  BABYS_BREATH: 'babys_breath',
  HYDRANGEA:    'hydrangea',
  LAVENDER:     'lavender',
  PEONY:        'peony',
  JASMINE:      'jasmine',
});

export class FlowerSystem {
  /** @param {import('./SceneManager').SceneManager} sceneManager */
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    /** @type {Map<string, import('three').InstancedMesh>} */
    this._instances = new Map();
  }

  init() {
    // Instance meshes created per type in Sprint N
    // Each type will use InstancedMesh(geo, mat, maxCount) with LOD ranges
  }

  /** @param {number} _delta */
  update(_delta) {}

  dispose() {
    this._instances.forEach(m => m.dispose());
    this._instances.clear();
  }
}
