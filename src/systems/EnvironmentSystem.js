import * as THREE from 'three';
import { buildGround, buildSoilPatch } from '../environment/buildGround.js';
import { buildSky }                    from '../environment/buildSky.js';
import { buildArch }                   from '../environment/buildArch.js';
import { placeVegetation }             from '../environment/buildTrees.js';
import { buildPetals }                 from '../environment/buildPetals.js';

const ARCH_Z = 14; // world-z position of the entrance arch

/**
 * Assembles the full botanical garden — ground, sky, fog, arch, vegetation.
 * Receives PathSystem to correctly place elements along the curve.
 */
export class EnvironmentSystem {
  /**
   * @param {import('./SceneManager').SceneManager} sceneManager
   * @param {import('./PathSystem').PathSystem}      pathSystem
   */
  constructor(sceneManager, pathSystem) {
    this.sceneManager = sceneManager;
    this.pathSystem   = pathSystem;
  }

  init() {
    const scene = this.sceneManager.get();

    // Sky — rendered first, no depth write
    this.sceneManager.add(buildSky());

    // Terrain
    this.sceneManager.add(buildGround());

    // Entrance arch — centred over path at z = ARCH_Z
    const arch = buildArch();
    arch.position.set(0.05, 0, ARCH_Z);
    this.sceneManager.add(arch);

    // Vegetation along the path curve
    placeVegetation(scene, this.pathSystem.curve);

    // Warm exponential fog — adds depth without swallowing the scene
    scene.fog = new THREE.FogExp2(0xd8ccb4, 0.009);

    // Soil patches under the main flower bed zones
    const curve = this.pathSystem.curve;
    const soilBeds = [
      { t: 0.05, side: -1 }, { t: 0.05, side:  1 },
      { t: 0.18, side: -1 }, { t: 0.18, side:  1 },
      { t: 0.31, side: -1 }, { t: 0.31, side:  1 },
      { t: 0.48, side: -1 }, { t: 0.48, side:  1 },
      { t: 0.62, side: -1 }, { t: 0.62, side:  1 },
    ];
    const _up  = new THREE.Vector3(0, 1, 0);
    const _r   = new THREE.Vector3();
    for (const { t, side } of soilBeds) {
      const pt   = curve.getPoint(t);
      const tang = curve.getTangent(t);
      _r.crossVectors(tang, _up).normalize();
      const sx = pt.x + _r.x * side * 3.0;
      const sz = pt.z + _r.z * side * 3.0;
      this.sceneManager.add(buildSoilPatch(sx, sz, 5.5, 8.5));
    }

    // Falling rose petals
    this._petals = buildPetals(curve);
    this.sceneManager.add(this._petals.group);
  }

  /** @param {number} delta */
  update(delta) {
    this._petals?.update(delta);
  }

  dispose() {}
}
