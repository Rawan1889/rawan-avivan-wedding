import * as THREE from 'three';

const COUNT    = 200;
const X_SPREAD = 12;
const Z_NEAR   = -20;
const Z_FAR    = 24;
const Y_MIN    = 0.3;
const Y_MAX    = 4.2;
const DRIFT_Y  = 0.08; // metres per second upward drift

/**
 * 200 ambient floating particles — morning pollen / dust motes.
 * Efficient: single Points object, Float32Array reused every frame.
 * No allocations inside update().
 */
export class ParticleSystem {
  /** @param {import('./SceneManager').SceneManager} sceneManager */
  constructor(sceneManager) {
    this.sceneManager = sceneManager;

    /** @type {Float32Array} */
    this._positions = new Float32Array(COUNT * 3);

    /** @type {Float32Array} Unique per-particle drift speed multiplier */
    this._speeds = new Float32Array(COUNT);

    /** @type {THREE.BufferGeometry | null} */
    this._geometry = null;
  }

  init() {
    for (let i = 0; i < COUNT; i++) {
      this._positions[i * 3]     = (Math.random() - 0.5) * X_SPREAD * 2;
      this._positions[i * 3 + 1] = Y_MIN + Math.random() * (Y_MAX - Y_MIN);
      this._positions[i * 3 + 2] = Z_NEAR + Math.random() * (Z_FAR - Z_NEAR);
      this._speeds[i] = 0.4 + Math.random() * 0.8;
    }

    this._geometry = new THREE.BufferGeometry();
    this._geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this._positions, 3),
    );

    const mat = new THREE.PointsMaterial({
      color: 0xf5e8c8,
      size: 0.028,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });

    this.sceneManager.add(new THREE.Points(this._geometry, mat));
  }

  /** @param {number} delta */
  update(delta) {
    for (let i = 0; i < COUNT; i++) {
      const idx = i * 3 + 1; // y component
      this._positions[idx] += DRIFT_Y * this._speeds[i] * delta;

      // Reset to bottom when particle drifts above ceiling
      if (this._positions[idx] > Y_MAX) {
        this._positions[idx] = Y_MIN;
        // Randomise x/z on reset so it feels alive, not looping
        this._positions[i * 3]     = (Math.random() - 0.5) * X_SPREAD * 2;
        this._positions[i * 3 + 2] = Z_NEAR + Math.random() * (Z_FAR - Z_NEAR);
      }
    }
    this._geometry.attributes.position.needsUpdate = true;
  }
}
