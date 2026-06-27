import * as THREE from 'three';

/**
 * Sunrise lighting — 7:00 AM European garden.
 * HemisphereLight for sky/ground ambient gradient.
 * DirectionalLight as warm low-angle sun with long shadows.
 * Fill light for open-sky bounce on shadow side.
 */
export class LightingSystem {
  /** @param {import('./SceneManager').SceneManager} sceneManager */
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    /** Exposed for GSAP intro animation (intensity ramp). */
    this.sunLight     = null;
  }

  init() {
    // Sky→ground ambient gradient — warm peach sky, muted ochre ground
    const hemi = new THREE.HemisphereLight(0xfcd8a0, 0x8a7050, 0.85);
    this.sceneManager.add(hemi);

    // Primary sun — low azimuth, long dramatic shadows
    const sun = new THREE.DirectionalLight(0xffe0a0, 0.1); // starts dim — GSAP ramps up
    sun.position.set(-20, 14, 28);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near   = 1;
    sun.shadow.camera.far    = 140;
    sun.shadow.camera.left   = -50;
    sun.shadow.camera.right  = 50;
    sun.shadow.camera.top    = 50;
    sun.shadow.camera.bottom = -50;
    sun.shadow.bias          = -0.0004;
    sun.shadow.normalBias    = 0.02;
    this.sceneManager.add(sun);
    this.sunLight = sun;

    // Cool open-sky fill from the opposite side — no shadows
    const fill = new THREE.DirectionalLight(0xb8c8d8, 0.28);
    fill.position.set(14, 8, -22);
    this.sceneManager.add(fill);
  }

  /** @param {number} _delta */
  update(_delta) {}

  dispose() {}
}
