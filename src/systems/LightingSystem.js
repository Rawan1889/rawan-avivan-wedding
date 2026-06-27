import * as THREE from 'three';

/**
 * Sunrise lighting — 7:00 AM golden hour.
 * HemisphereLight for sky/ground ambient gradient.
 * DirectionalLight for long warm shadows from low sun.
 */
export class LightingSystem {
  /** @param {import('./SceneManager').SceneManager} sceneManager */
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
  }

  init() {
    // Sky-to-ground ambient gradient
    const hemi = new THREE.HemisphereLight(
      0xfcebd4, // sky — warm peach
      0x8a7a5a, // ground — muted ochre
      0.9,
    );
    this.sceneManager.add(hemi);

    // Primary sun — low angle, long shadows
    const sun = new THREE.DirectionalLight(0xffe4b5, 2.2);
    sun.position.set(-18, 12, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near   = 1;
    sun.shadow.camera.far    = 120;
    sun.shadow.camera.left   = -40;
    sun.shadow.camera.right  = 40;
    sun.shadow.camera.top    = 40;
    sun.shadow.camera.bottom = -40;
    sun.shadow.bias          = -0.0004;
    sun.shadow.normalBias    = 0.02;
    this.sceneManager.add(sun);

    // Cool blue fill from opposite side — open sky bounce
    const fill = new THREE.DirectionalLight(0xb8c8e0, 0.35);
    fill.position.set(12, 8, -20);
    this.sceneManager.add(fill);
  }

  /** @param {number} _delta */
  update(_delta) {}
}
