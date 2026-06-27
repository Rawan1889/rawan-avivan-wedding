import * as THREE from 'three';

const DEBUG = false;

const INITIAL_POS  = new THREE.Vector3(0, 1.68, 22);
const LOOK_TARGET  = new THREE.Vector3(0.1, 1.4, 8);
const DRIFT_SPEED  = 0.22; // metres per second — almost imperceptible

/**
 * Manages the perspective camera.
 * Height set to human eye level (1.68 m).
 * Camera drifts forward automatically — no user input in production.
 *
 * Set DEBUG = true to enable OrbitControls during development.
 */
export class CameraSystem {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.05,
      600,
    );
    this.camera.position.copy(INITIAL_POS);
    this.camera.lookAt(LOOK_TARGET);

    /** @type {import('three/examples/jsm/controls/OrbitControls').OrbitControls | null} */
    this._controls = null;

    if (DEBUG) {
      // Dynamically import so it tree-shakes out of production builds
      import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
        const canvas = document.getElementById('canvas');
        this._controls = new OrbitControls(this.camera, canvas);
        this._controls.target.copy(LOOK_TARGET);
        this._controls.enableDamping = true;
      });
    }
  }

  /** @param {number} delta */
  update(delta) {
    if (this._controls) {
      this._controls.update();
      return;
    }
    // Auto-drift — camera walks slowly forward along -Z
    this.camera.position.z -= DRIFT_SPEED * delta;
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  /** @returns {THREE.PerspectiveCamera} */
  get() {
    return this.camera;
  }
}
