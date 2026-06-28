import * as THREE from 'three';

/**
 * Dusk / golden-hour lighting.
 * Warm amber sun just above horizon, deep blue-green fill, warm ground bounce.
 * Exposes sunLight + skyMaterial for GSAP intensity ramp.
 */
export class LightingSystem {
  /** @param {import('./SceneManager').SceneManager} sceneManager */
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.sunLight     = null;
    /** @type {THREE.ShaderMaterial|null} set by EnvironmentSystem after sky is built */
    this.skyMaterial  = null;
  }

  init() {
    // Sky/ground ambient — warm amber top, deep blue-green ground bounce
    const hemi = new THREE.HemisphereLight(0xf0a860, 0x2a4020, 0.80);
    this.sceneManager.add(hemi);

    // Primary sun — very low angle, long shadows, warm amber
    const sun = new THREE.DirectionalLight(0xff9040, 0.0); // GSAP ramps to 2.8
    sun.position.set(-8, 5, 22);   // low left of camera for dramatic side-lighting
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near   = 1;
    sun.shadow.camera.far    = 160;
    sun.shadow.camera.left   = -60;
    sun.shadow.camera.right  =  60;
    sun.shadow.camera.top    =  50;
    sun.shadow.camera.bottom = -50;
    sun.shadow.bias          = -0.0003;
    sun.shadow.normalBias    =  0.018;
    this.sceneManager.add(sun);
    this.sunLight = sun;

    // Cool blue fill from opposite side — open-sky bounce in shadows
    const fill = new THREE.DirectionalLight(0x8090c8, 0.18);
    fill.position.set(12, 10, -18);
    this.sceneManager.add(fill);

    // Warm rim from far right — catches olive tree silhouettes
    const rim = new THREE.DirectionalLight(0xffb060, 0.35);
    rim.position.set(18, 3, 10);
    this.sceneManager.add(rim);
  }

  /** @param {number} _delta */
  update(_delta) {}

  dispose() {}
}
