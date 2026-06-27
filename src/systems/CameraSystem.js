import * as THREE from 'three';

const EYE_HEIGHT  = 1.68;      // metres — human eye level
const LOOK_AHEAD  = 0.025;     // path-t units — look-ahead for dolly feel
const DAMP_POS    = 4.5;       // higher = snappier position
const DAMP_LOOK   = 3.5;       // higher = snappier look-at

/**
 * Cinematic dolly camera — Steadicam behaviour, not FPS, not orbit.
 *
 * Movement is entirely scroll-driven via PathSystem + ScrollSystem.
 * OrbitControls available only in DEBUG mode (?debug in URL).
 *
 * No new Vector3 inside update() — all pre-allocated.
 */
export class CameraSystem {
  /**
   * @param {import('./PathSystem').PathSystem}     pathSystem
   * @param {import('./ScrollSystem').ScrollSystem} scrollSystem
   */
  constructor(pathSystem, scrollSystem) {
    this._path   = pathSystem;
    this._scroll = scrollSystem;
    this._debug  = new URLSearchParams(window.location.search).has('debug');

    this.camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.05,
      600,
    );

    // Pre-allocated — never create in update()
    this._targetPos  = new THREE.Vector3();
    this._targetLook = new THREE.Vector3();
    this._smoothPos  = new THREE.Vector3();
    this._smoothLook = new THREE.Vector3();

    this._controls = null;
    this._initialised = false;
  }

  /** @param {THREE.WebGLRenderer} renderer */
  init(renderer) {
    // Seed smooth vectors at t=0 so there's no startup jump
    const p0 = this._path.getPositionAt(0, this._smoothPos);
    this._smoothPos.set(p0.x, p0.y + EYE_HEIGHT, p0.z);
    const l0 = this._path.getPositionAt(LOOK_AHEAD, this._smoothLook);
    this._smoothLook.set(l0.x, l0.y + EYE_HEIGHT * 0.75, l0.z);
    this.camera.position.copy(this._smoothPos);
    this.camera.lookAt(this._smoothLook);
    this._initialised = true;

    if (this._debug) {
      import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
        this._controls = new OrbitControls(this.camera, renderer.domElement);
        this._controls.enableDamping = true;
        this._controls.target.copy(this._smoothLook);
      });
    }
  }

  /** @param {number} delta */
  update(delta) {
    if (!this._initialised) return;

    if (this._controls) {
      this._controls.update();
      return;
    }

    const t     = this._scroll.progress;
    const lookT = Math.min(1, t + LOOK_AHEAD);

    // Compute targets
    const raw  = this._path.getPositionAt(t, this._targetPos);
    this._targetPos.set(raw.x, raw.y + EYE_HEIGHT, raw.z);

    const rawL = this._path.getPositionAt(lookT, this._targetLook);
    this._targetLook.set(rawL.x, rawL.y + EYE_HEIGHT * 0.72, rawL.z);

    // Smooth damping — frame-rate independent lerp
    const lp = Math.min(1, DAMP_POS  * delta);
    const ll = Math.min(1, DAMP_LOOK * delta);
    this._smoothPos.lerp(this._targetPos, lp);
    this._smoothLook.lerp(this._targetLook, ll);

    this.camera.position.copy(this._smoothPos);
    this.camera.lookAt(this._smoothLook);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  /** @returns {THREE.PerspectiveCamera} */
  get() { return this.camera; }

  dispose() {
    this._controls?.dispose();
  }
}
