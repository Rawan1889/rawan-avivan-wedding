import * as THREE from 'three';
import { mat } from '../materials/materials.js';

const PATH_WIDTH  = 2.2;
const SEGMENTS    = 160;

/** Control points for the garden walk — elegant single-direction curves. */
const CONTROL_POINTS = [
  new THREE.Vector3( 0.0,  0,  38),
  new THREE.Vector3( 0.4,  0,  30),
  new THREE.Vector3( 0.2,  0,  22),
  new THREE.Vector3( 0.0,  0,  14),   // through arch
  new THREE.Vector3(-0.8,  0,   4),
  new THREE.Vector3(-2.0,  0,  -8),
  new THREE.Vector3(-1.4,  0, -20),
  new THREE.Vector3( 0.5,  0, -34),
  new THREE.Vector3( 1.8,  0, -48),
  new THREE.Vector3( 0.8,  0, -62),
  new THREE.Vector3( 0.0,  0, -78),
];

/**
 * Manages the garden path — geometry, curve, and camera spline.
 * Renders a flat limestone ribbon and exposes the spline for CameraSystem.
 */
export class PathSystem {
  /** @param {import('./SceneManager').SceneManager} sceneManager */
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    /** @type {THREE.CatmullRomCurve3} */
    this.curve = null;
  }

  init() {
    this.curve = new THREE.CatmullRomCurve3(CONTROL_POINTS, false, 'catmullrom', 0.5);
    this.sceneManager.add(this._buildRibbon());
  }

  /**
   * Returns the world position at normalised progress t ∈ [0,1].
   * Pre-allocated — no new Vector3 per call.
   * @param {number} t
   * @param {THREE.Vector3} [target]
   * @returns {THREE.Vector3}
   */
  getPositionAt(t, target = new THREE.Vector3()) {
    return this.curve.getPoint(t, target);
  }

  /**
   * Returns the forward tangent at t. Pre-allocated.
   * @param {number} t
   * @param {THREE.Vector3} [target]
   * @returns {THREE.Vector3}
   */
  getTangentAt(t, target = new THREE.Vector3()) {
    return this.curve.getTangent(t, target);
  }

  /** Builds the flat limestone ribbon mesh along the spline. */
  _buildRibbon() {
    const pts   = this.curve.getPoints(SEGMENTS);
    const pos   = [];
    const norms = [];
    const uvs   = [];
    const idx   = [];

    const _t = new THREE.Vector3();
    const _r = new THREE.Vector3();
    const _up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i <= SEGMENTS; i++) {
      const t  = i / SEGMENTS;
      const p  = pts[i];
      const tA = this.curve.getPoint(Math.max(0, t - 0.002));
      const tB = this.curve.getPoint(Math.min(1, t + 0.002));
      _t.subVectors(tB, tA).normalize();
      _r.crossVectors(_t, _up).normalize();

      const half = PATH_WIDTH / 2;
      pos.push(
        p.x - _r.x * half, 0.014, p.z - _r.z * half,
        p.x + _r.x * half, 0.014, p.z + _r.z * half,
      );
      norms.push(0, 1, 0, 0, 1, 0);
      uvs.push(0, t, 1, t);
    }

    for (let i = 0; i < SEGMENTS; i++) {
      const a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
      idx.push(a, c, b, b, c, d);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal',   new THREE.Float32BufferAttribute(norms, 3));
    geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(idx);

    const mesh = new THREE.Mesh(geo, mat.pathStone);
    mesh.receiveShadow = true;
    return mesh;
  }

  /** @param {number} _delta */
  update(_delta) {}

  dispose() {}
}
