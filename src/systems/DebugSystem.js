import * as THREE from 'three';

/** Activate by appending ?debug to the URL. */
const IS_DEBUG = new URLSearchParams(window.location.search).has('debug');

/**
 * Debug utilities — FPS counter, scene helpers, OrbitControls.
 * All code is tree-shaken from production builds (dynamic imports).
 * In production: IS_DEBUG = false, init() and update() are no-ops.
 */
export class DebugSystem {
  constructor() {
    this.enabled   = IS_DEBUG;
    this._controls = null;
    this._panel    = null;
    this._frames   = 0;
    this._lastMs   = 0;
  }

  /**
   * @param {THREE.PerspectiveCamera} camera
   * @param {THREE.WebGLRenderer}     renderer
   * @param {THREE.Scene}             scene
   */
  init(camera, renderer, scene) {
    if (!this.enabled) return;

    // Dynamic import — tree-shaken when IS_DEBUG = false
    import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
      this._controls = new OrbitControls(camera, renderer.domElement);
      this._controls.enableDamping  = true;
      this._controls.dampingFactor  = 0.05;
      this._controls.target.set(0, 1.68, 0);
    });

    scene.add(new THREE.AxesHelper(5));

    // FPS panel
    this._panel = document.createElement('div');
    this._panel.id = 'debug-panel';
    this._panel.textContent = '-- fps';
    document.body.appendChild(this._panel);
    this._lastMs = performance.now();
  }

  /** @param {number} _delta */
  update(_delta) {
    if (!this.enabled) return;
    this._controls?.update();

    this._frames++;
    const now = performance.now();
    if (now - this._lastMs >= 1000) {
      if (this._panel) this._panel.textContent = `${this._frames} fps`;
      this._frames = 0;
      this._lastMs = now;
    }
  }

  dispose() {
    this._controls?.dispose();
    this._panel?.remove();
  }
}
