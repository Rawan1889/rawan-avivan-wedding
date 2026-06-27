import * as THREE from 'three';

/**
 * Simulates wind — direction, strength, and gusts over time.
 * Exposes GLSL uniforms for vegetation animation shaders (Sprint N).
 */
export class WindSystem {
  constructor() {
    this._time     = 0;
    this.strength  = 0.25;
    this.direction = new THREE.Vector3(0.8, 0, 0.4).normalize();

    /**
     * Shared uniforms injected into wind-responsive materials.
     * @type {{ uWindTime: {value: number}, uWindStrength: {value: number}, uWindDir: {value: THREE.Vector3} }}
     */
    this.uniforms = {
      uWindTime:     { value: 0 },
      uWindStrength: { value: this.strength },
      uWindDir:      { value: this.direction },
    };
  }

  init() {}

  /** @param {number} delta */
  update(delta) {
    this._time   += delta;
    // Layered sine waves for organic gusting
    this.strength = 0.20
      + Math.sin(this._time * 0.38) * 0.10
      + Math.sin(this._time * 1.12) * 0.04;

    this.uniforms.uWindTime.value     = this._time;
    this.uniforms.uWindStrength.value = this.strength;
  }

  dispose() {}
}
