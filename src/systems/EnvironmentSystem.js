import * as THREE from 'three';
import { buildGround } from '../utils/buildGround.js';
import { buildPath } from '../utils/buildPath.js';
import { buildArch } from '../utils/buildArch.js';
import { buildSky } from '../utils/buildSky.js';

/**
 * Assembles the full botanical garden environment for the Dawn Gate chapter.
 * Owns: ground, curved path, entrance arch, sky dome, atmospheric fog.
 */
export class EnvironmentSystem {
  /** @param {import('./SceneManager').SceneManager} sceneManager */
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
  }

  init() {
    this.sceneManager.add(buildSky());
    this.sceneManager.add(buildGround());
    this.sceneManager.add(buildPath());
    this.sceneManager.add(buildArch());

    // Warm exponential fog — adds depth without swallowing the scene
    this.sceneManager.get().fog = new THREE.FogExp2(0xe8dfc8, 0.012);
  }

  /** @param {number} _delta */
  update(_delta) {}
}
