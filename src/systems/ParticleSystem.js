import * as THREE from 'three';

const COUNT    = 300;
const X_HALF   = 14;
const Z_NEAR   = -25;
const Z_FAR    =  40;
const Y_MIN    =  0.3;
const Y_MAX    =  5.0;
const DRIFT_Y  =  0.07; // m/s upward drift

/**
 * 300 ambient particles — morning pollen, dust motes, seed drift.
 * Single Points object. Float32Array mutated in-place — zero allocations per frame.
 */
export class ParticleSystem {
  /** @param {import('./SceneManager').SceneManager} sceneManager */
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this._pos   = new Float32Array(COUNT * 3);
    this._speed = new Float32Array(COUNT);
    this._geo   = null;
  }

  init() {
    for (let i = 0; i < COUNT; i++) {
      this._pos[i * 3]     = (Math.random() - 0.5) * X_HALF * 2;
      this._pos[i * 3 + 1] = Y_MIN + Math.random() * (Y_MAX - Y_MIN);
      this._pos[i * 3 + 2] = Z_NEAR + Math.random() * (Z_FAR - Z_NEAR);
      this._speed[i]        = 0.35 + Math.random() * 0.9;
    }

    this._geo = new THREE.BufferGeometry();
    this._geo.setAttribute('position', new THREE.BufferAttribute(this._pos, 3));

    const mat = new THREE.PointsMaterial({
      color:          0xf0e0c0,
      size:           0.025,
      sizeAttenuation: true,
      transparent:    true,
      opacity:        0.50,
      depthWrite:     false,
    });

    this.sceneManager.add(new THREE.Points(this._geo, mat));
  }

  /** @param {number} delta */
  update(delta) {
    for (let i = 0; i < COUNT; i++) {
      const yIdx = i * 3 + 1;
      this._pos[yIdx] += DRIFT_Y * this._speed[i] * delta;

      // Subtle lateral drift
      this._pos[i * 3]     += Math.sin(this._pos[yIdx] * 1.2 + i) * 0.002;

      if (this._pos[yIdx] > Y_MAX) {
        this._pos[yIdx]      = Y_MIN;
        this._pos[i * 3]     = (Math.random() - 0.5) * X_HALF * 2;
        this._pos[i * 3 + 2] = Z_NEAR + Math.random() * (Z_FAR - Z_NEAR);
      }
    }
    this._geo.attributes.position.needsUpdate = true;
  }

  dispose() {}
}
