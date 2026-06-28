import * as THREE from 'three';

/**
 * Owns the WebGL renderer — physically-correct rendering pipeline.
 * ACES Filmic, sRGB output, PCF soft shadows, high-performance GPU hint.
 */
export class RendererSystem {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias:       true,
      alpha:           false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure  = 0.72;  // lower = less colour burn from warm lights
    this.renderer.outputColorSpace    = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled   = true;
    this.renderer.shadowMap.type      = THREE.PCFSoftShadowMap;
  }

  init() {}

  /** @param {number} _delta */
  update(_delta) {}

  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * @param {THREE.Scene}  scene
   * @param {THREE.Camera} camera
   */
  render(scene, camera) {
    this.renderer.render(scene, camera);
  }

  /** @returns {THREE.WebGLRenderer} */
  get() { return this.renderer; }

  dispose() {
    this.renderer.dispose();
  }
}
