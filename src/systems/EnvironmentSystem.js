import * as THREE from 'three';
import { buildGround, buildSoilPatch } from '../environment/buildGround.js';
import { buildSky }                    from '../environment/buildSky.js';
import { buildArch }                   from '../environment/buildArch.js';
import { placeVegetation }             from '../environment/buildTrees.js';
import { buildPetals }                 from '../environment/buildPetals.js';
import { buildLanterns }               from '../environment/buildLanterns.js';
import { buildStoneWalls }             from '../environment/buildStoneWalls.js';

/**
 * Assembles the full garden — ground, sky, fog, arch, vegetation,
 * stone walls, lanterns, and falling petals.
 */
export class EnvironmentSystem {
  constructor(sceneManager, pathSystem, lightingSystem) {
    this.sceneManager   = sceneManager;
    this.pathSystem     = pathSystem;
    this.lightingSystem = lightingSystem;
    this._petals        = null;
  }

  init() {
    const scene = this.sceneManager.get();
    const curve = this.pathSystem.curve;

    // Sky — built first, exposes material for GSAP
    const { mesh: skyMesh, material: skyMat } = buildSky();
    this.sceneManager.add(skyMesh);
    // Give lighting system access to sky material for sun-intensity sync
    if (this.lightingSystem) this.lightingSystem.skyMaterial = skyMat;
    this._skyMat = skyMat;

    // Terrain
    this.sceneManager.add(buildGround());

    // Stone raised walls — close to path, before flowers
    buildStoneWalls(scene, curve);

    // Entrance arch
    const arch = buildArch();
    arch.position.set(0.05, 0, 14);
    this.sceneManager.add(arch);

    // Vegetation
    placeVegetation(scene, curve);

    // Path lanterns
    buildLanterns(scene, curve);

    // Soil patches under main bed zones
    const _up = new THREE.Vector3(0, 1, 0);
    const _r  = new THREE.Vector3();
    const soilTs = [0.04, 0.12, 0.22, 0.34, 0.46, 0.58];
    for (const t of soilTs) {
      const pt   = curve.getPoint(t);
      const tang = curve.getTangent(t);
      _r.crossVectors(tang, _up).normalize();
      for (const side of [-1, 1]) {
        const sx = pt.x + _r.x * side * 2.8;
        const sz = pt.z + _r.z * side * 2.8;
        this.sceneManager.add(buildSoilPatch(sx, sz, 6.0, 9.0));
      }
    }

    // Warm dusk fog — linear, starts further out, warmer colour
    scene.fog = new THREE.Fog(0xd49060, 35, 95);

    // Falling petals
    this._petals = buildPetals(curve);
    this.sceneManager.add(this._petals.group);
  }

  /** @param {number} delta */
  update(delta) {
    this._petals?.update(delta);
    // Keep sky sun-intensity in sync with light ramp
    if (this._skyMat && this.lightingSystem?.sunLight) {
      this._skyMat.uniforms.uSunIntensity.value =
        Math.min(1, this.lightingSystem.sunLight.intensity / 2.8);
    }
  }

  dispose() {}
}
