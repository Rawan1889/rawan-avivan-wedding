import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { injectWindSway } from '../shaders/windSway.js';
import { seededRand } from '../utils/mathUtils.js';

/** @enum {string} */
export const FLOWER_TYPES = Object.freeze({
  WHITE_ROSE:   'white_rose',
  CREAM_ROSE:   'cream_rose',
  PINK_ROSE:    'pink_rose',
  MINI_ROSE:    'mini_rose',
  BABYS_BREATH: 'babys_breath',
  HYDRANGEA:    'hydrangea',
  LAVENDER:     'lavender',
  PEONY:        'peony',
});

// ── Geometry helpers ──────────────────────────────────────────────────────────

function translated(geo, x, y, z) {
  const g = geo.clone();
  g.applyMatrix4(new THREE.Matrix4().makeTranslation(x, y, z));
  return g;
}

const _stemGeo  = new THREE.CylinderGeometry(0.012, 0.018, 1, 5);
const _headGeo  = new THREE.SphereGeometry(1, 8, 6);
const _coneGeo  = new THREE.ConeGeometry(1, 1, 6);

/** Build merged flower geometry (stem + head). */
function makeFlowerGeo(stemH, headR, headY, flattenHead = 1) {
  const stem = translated(_stemGeo.clone().scale(1, stemH, 1), 0, stemH / 2, 0);
  const h    = _headGeo.clone();
  h.scale(headR, headR * flattenHead, headR);
  const head = translated(h, 0, headY, 0);
  return mergeGeometries([stem, head]);
}

/** Baby's Breath: thin stem + cloud of tiny spheres. */
function makeBabysBreathGeo() {
  const stemH = 0.32;
  const stem  = translated(_stemGeo.clone().scale(0.6, stemH, 0.6), 0, stemH / 2, 0);
  const parts = [stem];
  const tinyGeo = new THREE.SphereGeometry(0.018, 5, 4);
  for (let i = 0; i < 8; i++) {
    const r = seededRand(i * 13);
    const t = translated(
      tinyGeo.clone(),
      (seededRand(i * 7) - 0.5) * 0.12,
      stemH + 0.04 + r * 0.08,
      (seededRand(i * 11) - 0.5) * 0.10,
    );
    parts.push(t);
  }
  return mergeGeometries(parts);
}

/** Lavender: stem + elongated cone. */
function makeLavenderGeo() {
  const stemH = 0.48;
  const stem  = translated(_stemGeo.clone().scale(0.55, stemH, 0.55), 0, stemH / 2, 0);
  const spike = _coneGeo.clone();
  spike.scale(0.038, 0.18, 0.038);
  const head  = translated(spike, 0, stemH + 0.09, 0);
  return mergeGeometries([stem, head]);
}

// ── Per-type config ───────────────────────────────────────────────────────────

const FLOWER_CONFIG = {
  [FLOWER_TYPES.WHITE_ROSE]:   { color: 0xf8f4f0, geo: () => makeFlowerGeo(0.38, 0.075, 0.42), max: 250 },
  [FLOWER_TYPES.CREAM_ROSE]:   { color: 0xf5e8d0, geo: () => makeFlowerGeo(0.36, 0.078, 0.40), max: 200 },
  [FLOWER_TYPES.PINK_ROSE]:    { color: 0xf0d8d5, geo: () => makeFlowerGeo(0.34, 0.072, 0.38), max: 160 },
  [FLOWER_TYPES.MINI_ROSE]:    { color: 0xfce8e0, geo: () => makeFlowerGeo(0.24, 0.050, 0.27), max: 200 },
  [FLOWER_TYPES.BABYS_BREATH]: { color: 0xfcfcfa, geo: () => makeBabysBreathGeo(),              max: 320 },
  [FLOWER_TYPES.HYDRANGEA]:    { color: 0xf2eee8, geo: () => makeFlowerGeo(0.26, 0.120, 0.32, 0.65), max: 100 },
  [FLOWER_TYPES.LAVENDER]:     { color: 0xe0d4ec, geo: () => makeLavenderGeo(),                 max: 280 },
  [FLOWER_TYPES.PEONY]:        { color: 0xfff0ee, geo: () => makeFlowerGeo(0.38, 0.130, 0.44, 0.88), max: 80 },
};

// ── Bed definitions (t = path progress, side = ±1) ───────────────────────────

const BEDS = [
  // Near entrance — medium density
  { type: FLOWER_TYPES.WHITE_ROSE,   t: 0.03, side: -1, count: 30, spread: 1.8, depth: 3.5 },
  { type: FLOWER_TYPES.LAVENDER,     t: 0.03, side:  1, count: 40, spread: 2.0, depth: 4.0 },
  { type: FLOWER_TYPES.CREAM_ROSE,   t: 0.07, side: -1, count: 25, spread: 1.6, depth: 3.0 },
  { type: FLOWER_TYPES.BABYS_BREATH, t: 0.07, side:  1, count: 50, spread: 2.2, depth: 3.5 },
  { type: FLOWER_TYPES.MINI_ROSE,    t: 0.11, side: -1, count: 35, spread: 1.5, depth: 2.8 },
  { type: FLOWER_TYPES.HYDRANGEA,    t: 0.11, side:  1, count: 18, spread: 2.0, depth: 3.2 },

  // Mid — higher density, path edge overlap
  { type: FLOWER_TYPES.PINK_ROSE,    t: 0.18, side: -1, count: 45, spread: 2.0, depth: 4.0 },
  { type: FLOWER_TYPES.LAVENDER,     t: 0.18, side:  1, count: 55, spread: 2.2, depth: 4.5 },
  { type: FLOWER_TYPES.BABYS_BREATH, t: 0.24, side: -1, count: 65, spread: 2.4, depth: 4.0 },
  { type: FLOWER_TYPES.PEONY,        t: 0.24, side:  1, count: 20, spread: 1.8, depth: 3.5 },
  { type: FLOWER_TYPES.WHITE_ROSE,   t: 0.31, side: -1, count: 50, spread: 2.0, depth: 4.0 },
  { type: FLOWER_TYPES.CREAM_ROSE,   t: 0.31, side:  1, count: 45, spread: 2.0, depth: 4.0 },

  // Deep garden — lush and abundant
  { type: FLOWER_TYPES.HYDRANGEA,    t: 0.40, side: -1, count: 30, spread: 2.4, depth: 4.5 },
  { type: FLOWER_TYPES.LAVENDER,     t: 0.40, side:  1, count: 70, spread: 2.5, depth: 5.0 },
  { type: FLOWER_TYPES.MINI_ROSE,    t: 0.48, side: -1, count: 55, spread: 2.0, depth: 4.5 },
  { type: FLOWER_TYPES.WHITE_ROSE,   t: 0.48, side:  1, count: 60, spread: 2.2, depth: 4.5 },
  { type: FLOWER_TYPES.BABYS_BREATH, t: 0.56, side: -1, count: 80, spread: 2.6, depth: 5.0 },
  { type: FLOWER_TYPES.PEONY,        t: 0.56, side:  1, count: 28, spread: 2.0, depth: 4.0 },
  { type: FLOWER_TYPES.PINK_ROSE,    t: 0.65, side: -1, count: 55, spread: 2.2, depth: 4.5 },
  { type: FLOWER_TYPES.CREAM_ROSE,   t: 0.65, side:  1, count: 50, spread: 2.0, depth: 4.5 },
];

// ── System ───────────────────────────────────────────────────────────────────

const _dummy = new THREE.Object3D();
const _up    = new THREE.Vector3(0, 1, 0);
const _right = new THREE.Vector3();

/**
 * Instanced flower system.
 * Creates one InstancedMesh per flower type, places beds along path spline.
 * Wind sway injected via onBeforeCompile — no per-frame material allocations.
 */
export class FlowerSystem {
  /**
   * @param {import('./SceneManager').SceneManager} sceneManager
   * @param {import('./PathSystem').PathSystem}      pathSystem
   * @param {import('./WindSystem').WindSystem}      windSystem
   */
  constructor(sceneManager, pathSystem, windSystem) {
    this.sceneManager = sceneManager;
    this.path         = pathSystem;
    this.wind         = windSystem;
    /** @type {Map<string, THREE.InstancedMesh>} */
    this._meshes    = new Map();
    /** @type {Map<string, number>} Running instance index per type */
    this._counts    = new Map();
  }

  init() {
    // 1. Create one InstancedMesh per flower type
    for (const [type, cfg] of Object.entries(FLOWER_CONFIG)) {
      const geo = cfg.geo();
      const mat = new THREE.MeshStandardMaterial({
        color:     cfg.color,
        roughness: 0.72,
        metalness: 0.0,
      });
      injectWindSway(mat, this.wind.uniforms, 0.18);

      const mesh = new THREE.InstancedMesh(geo, mat, cfg.max);
      mesh.castShadow    = true;
      mesh.receiveShadow = true;
      mesh.count         = 0;

      this._meshes.set(type, mesh);
      this._counts.set(type, 0);
      this.sceneManager.add(mesh);
    }

    // 2. Place beds along path
    const curve = this.path.curve;
    for (const bed of BEDS) {
      this._placeBed(curve, bed);
    }

    // 3. Commit instance matrices
    this._meshes.forEach(m => { m.instanceMatrix.needsUpdate = true; });
  }

  /**
   * Places one flower bed cluster.
   * @param {THREE.CatmullRomCurve3} curve
   * @param {{ type:string, t:number, side:number, count:number, spread:number, depth:number }} bed
   */
  _placeBed(curve, bed) {
    const mesh = this._meshes.get(bed.type);
    if (!mesh) return;

    const pt   = curve.getPoint(bed.t);
    const tang = curve.getTangent(bed.t);
    _right.crossVectors(tang, _up).normalize();

    const cfg    = FLOWER_CONFIG[bed.type];
    let   idx    = this._counts.get(bed.type);
    const toPlace = Math.min(bed.count, cfg.max - idx);

    for (let i = 0; i < toPlace; i++) {
      const seed = bed.t * 1000 + bed.side * 500 + i;
      const r    = (n) => seededRand(seed + n);

      // Clustered distribution: slight bias toward bed centre
      const lateralOff = 1.2 + r(1) * bed.spread;
      const depthOff   = (r(2) - 0.5) * bed.depth;

      // Some flowers slightly overlap the path edge (more natural)
      const pathOverlap = r(3) < 0.15 ? -0.35 : 0;

      const fx = pt.x + _right.x * (bed.side * lateralOff + pathOverlap) + tang.x * depthOff;
      const fz = pt.z + _right.z * (bed.side * lateralOff + pathOverlap) + tang.z * depthOff;

      _dummy.position.set(fx, 0, fz);
      _dummy.rotation.y  = r(4) * Math.PI * 2;
      _dummy.scale.setScalar(0.80 + r(5) * 0.45);
      _dummy.updateMatrix();

      mesh.setMatrixAt(idx, _dummy.matrix);
      idx++;
    }

    mesh.count = idx;
    this._counts.set(bed.type, idx);
  }

  /** @param {number} _delta */
  update(_delta) {
    // Wind uniforms are updated by WindSystem.update() — nothing to do here
  }

  dispose() {
    this._meshes.forEach(m => { m.geometry.dispose(); m.material.dispose(); });
    this._meshes.clear();
  }
}
