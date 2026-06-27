import * as THREE from 'three';
import { buildGround }       from '../environment/buildGround.js';
import { buildSky }          from '../environment/buildSky.js';
import { buildArch }         from '../environment/buildArch.js';
import { placeVegetation }   from '../environment/buildTrees.js';

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
  }

  /** @param {number} _delta */
  update(_delta) {}

  dispose() {}
}
