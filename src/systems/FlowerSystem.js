import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { injectWindSway } from '../shaders/windSway.js';
import { seededRand } from '../utils/mathUtils.js';

/** @enum {string} */
export const FLOWER_TYPES = Object.freeze({
  WHITE_ROSE:   'white_rose',
  CREAM_ROSE:   'cream_rose',
  BLUSH_ROSE:   'blush_rose',
  PEACH_ROSE:   'peach_rose',
  MINI_ROSE:    'mini_rose',
  BABYS_BREATH: 'babys_breath',
  LAVENDER:     'lavender',
  HYDRANGEA:    'hydrangea',
});

// ─── Petal geometry builder ───────────────────────────────────────────────────
// Actual curved petal shape: PlaneGeometry with vertices displaced into a cup.

function makePetalGeo(w, h) {
  const geo = new THREE.PlaneGeometry(w, h, 2, 4);
  const pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = (y / h + 0.5); // 0 at base, 1 at tip
    // Cup inward along x at base, open at tip
    const curve = Math.sin(t * Math.PI) * 0.4;
    pos.setZ(i, pos.getZ(i) + curve * w);
    // Slight upward dish
    pos.setY(i, pos.getY(i) + t * t * h * 0.15);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/**
 * One rose bloom: 8 petals arranged in two rings + small bud centre.
 * Returns a merged geometry — safe for InstancedMesh.
 */
function makeRoseBloom(outerR, innerR, petalW, petalH) {
  const parts = [];
  const _m = new THREE.Matrix4();
  const petalGeo = makePetalGeo(petalW, petalH);

  // Outer ring — 5 open petals
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const p = petalGeo.clone();
    _m.makeRotationY(angle);
    const tilt = new THREE.Matrix4().makeRotationX(-Math.PI * 0.28);
    const trans = new THREE.Matrix4().makeTranslation(
      Math.cos(angle) * outerR * 0.5,
      petalH * 0.1,
      Math.sin(angle) * outerR * 0.5,
    );
    p.applyMatrix4(trans.multiply(tilt).multiply(_m));
    parts.push(p);
  }

  // Inner ring — 4 tighter petals
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const p = petalGeo.clone();
    _m.makeRotationY(angle);
    const tilt = new THREE.Matrix4().makeRotationX(-Math.PI * 0.42);
    const trans = new THREE.Matrix4().makeTranslation(
      Math.cos(angle) * innerR * 0.5,
      petalH * 0.22,
      Math.sin(angle) * innerR * 0.5,
    );
    p.applyMatrix4(trans.multiply(tilt).multiply(_m));
    parts.push(p);
  }

  // Bud centre — tiny sphere
  const bud = new THREE.SphereGeometry(innerR * 0.28, 5, 4);
  bud.applyMatrix4(new THREE.Matrix4().makeTranslation(0, petalH * 0.35, 0));
  parts.push(bud);

  return mergeGeometries(parts);
}

/** Full rose plant: stem + 3 blooms at different heights */
function makeRosePlant(stemH, bloomR) {
  const parts = [];

  // Stem
  const stem = new THREE.CylinderGeometry(0.008, 0.013, stemH, 5);
  stem.applyMatrix4(new THREE.Matrix4().makeTranslation(0, stemH / 2, 0));
  parts.push(stem);

  // 2–3 leaves on stem
  const leafGeo = new THREE.PlaneGeometry(0.06, 0.04, 1, 2);
  for (let i = 0; i < 2; i++) {
    const lh = stemH * (0.35 + i * 0.3);
    const la = (i % 2 === 0) ? 0.6 : -0.5;
    const leaf = leafGeo.clone();
    const m = new THREE.Matrix4()
      .makeRotationZ(la)
      .premultiply(new THREE.Matrix4().makeTranslation(0.04, lh, 0));
    leaf.applyMatrix4(m);
    parts.push(leaf);
  }

  // Main bloom at top
  const bloom = makeRoseBloom(bloomR, bloomR * 0.55, bloomR * 0.85, bloomR * 0.90);
  bloom.applyMatrix4(new THREE.Matrix4().makeTranslation(0, stemH, 0));
  parts.push(bloom);

  // Side bud (smaller)
  const bud = makeRoseBloom(bloomR * 0.55, bloomR * 0.3, bloomR * 0.5, bloomR * 0.55);
  bud.applyMatrix4(
    new THREE.Matrix4().makeTranslation(bloomR * 0.4, stemH * 0.82, bloomR * 0.2)
  );
  parts.push(bud);

  return mergeGeometries(parts);
}

/** Baby's breath: airy branching cloud — use Points-like tiny spheres */
function makeBabysBreathGeo() {
  const parts = [];
  const stemH = 0.35;
  const stem = new THREE.CylinderGeometry(0.006, 0.010, stemH, 4);
  stem.applyMatrix4(new THREE.Matrix4().makeTranslation(0, stemH / 2, 0));
  parts.push(stem);

  const tiny = new THREE.SphereGeometry(0.012, 4, 3);
  for (let i = 0; i < 16; i++) {
    const t = seededRand(i * 11);
    const a = seededRand(i * 7) * Math.PI * 2;
    const r = 0.04 + seededRand(i * 13) * 0.12;
    const yy = stemH * 0.6 + t * stemH * 0.55;
    const b = tiny.clone();
    b.applyMatrix4(new THREE.Matrix4().makeTranslation(
      Math.cos(a) * r, yy, Math.sin(a) * r,
    ));
    parts.push(b);
  }
  return mergeGeometries(parts);
}

/** Lavender spike */
function makeLavenderGeo() {
  const parts = [];
  const stemH = 0.50;
  const stem = new THREE.CylinderGeometry(0.005, 0.009, stemH, 4);
  stem.applyMatrix4(new THREE.Matrix4().makeTranslation(0, stemH / 2, 0));
  parts.push(stem);

  // Dense spike of tiny buds
  const bud = new THREE.SphereGeometry(0.010, 4, 3);
  for (let i = 0; i < 18; i++) {
    const t = i / 17;
    const a = t * Math.PI * 6;
    const r = 0.018 * (1 - t * 0.5);
    const b = bud.clone();
    b.applyMatrix4(new THREE.Matrix4().makeTranslation(
      Math.cos(a) * r, stemH * 0.45 + t * stemH * 0.48, Math.sin(a) * r,
    ));
    parts.push(b);
  }
  return mergeGeometries(parts);
}

/** Hydrangea — flat dome of tiny flowers */
function makeHydrangeaGeo() {
  const parts = [];
  const stemH = 0.30;
  const stem = new THREE.CylinderGeometry(0.010, 0.016, stemH, 5);
  stem.applyMatrix4(new THREE.Matrix4().makeTranslation(0, stemH / 2, 0));
  parts.push(stem);

  const floret = new THREE.SphereGeometry(0.022, 5, 4);
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    const r = 0.04 + seededRand(i * 17) * 0.08;
    const f = floret.clone();
    f.applyMatrix4(new THREE.Matrix4().makeTranslation(
      Math.cos(a) * r,
      stemH + 0.02 + seededRand(i * 23) * 0.04,
      Math.sin(a) * r,
    ));
    parts.push(f);
  }
  return mergeGeometries(parts);
}

// ─── Per-type config ──────────────────────────────────────────────────────────

const FLOWER_CONFIG = {
  [FLOWER_TYPES.WHITE_ROSE]:   {
    color: 0xf8f2e8, emissive: 0x201810, emissiveI: 0.06,
    geo: () => makeRosePlant(0.40, 0.065), max: 300,
  },
  [FLOWER_TYPES.CREAM_ROSE]:   {
    color: 0xf5e8c8, emissive: 0x201408, emissiveI: 0.05,
    geo: () => makeRosePlant(0.38, 0.068), max: 260,
  },
  [FLOWER_TYPES.BLUSH_ROSE]:   {
    color: 0xf0ccc0, emissive: 0x200c08, emissiveI: 0.05,
    geo: () => makeRosePlant(0.36, 0.062), max: 220,
  },
  [FLOWER_TYPES.PEACH_ROSE]:   {
    color: 0xf0c898, emissive: 0x201008, emissiveI: 0.04,
    geo: () => makeRosePlant(0.34, 0.058), max: 180,
  },
  [FLOWER_TYPES.MINI_ROSE]:    {
    color: 0xfce8dc, emissive: 0x1a0c08, emissiveI: 0.04,
    geo: () => makeRosePlant(0.24, 0.040), max: 240,
  },
  [FLOWER_TYPES.BABYS_BREATH]: {
    color: 0xfcfaf5, emissive: 0x101008, emissiveI: 0.02,
    geo: () => makeBabysBreathGeo(), max: 380,
  },
  [FLOWER_TYPES.LAVENDER]:     {
    color: 0xd0c0e0, emissive: 0x100818, emissiveI: 0.04,
    geo: () => makeLavenderGeo(), max: 320,
  },
  [FLOWER_TYPES.HYDRANGEA]:    {
    color: 0xe8e8f0, emissive: 0x0c0c18, emissiveI: 0.03,
    geo: () => makeHydrangeaGeo(), max: 140,
  },
};

// ─── Bed layout ───────────────────────────────────────────────────────────────
// Dense, overflowing beds — roses everywhere, mixed heights

const BEDS = [
  { type: FLOWER_TYPES.WHITE_ROSE,   t: 0.02, side: -1, count: 55, spread: 2.2, depth: 4.5 },
  { type: FLOWER_TYPES.LAVENDER,     t: 0.02, side:  1, count: 65, spread: 2.4, depth: 5.0 },
  { type: FLOWER_TYPES.CREAM_ROSE,   t: 0.06, side: -1, count: 50, spread: 2.0, depth: 4.0 },
  { type: FLOWER_TYPES.BABYS_BREATH, t: 0.06, side:  1, count: 75, spread: 2.5, depth: 4.5 },
  { type: FLOWER_TYPES.BLUSH_ROSE,   t: 0.10, side: -1, count: 55, spread: 2.2, depth: 4.5 },
  { type: FLOWER_TYPES.HYDRANGEA,    t: 0.10, side:  1, count: 30, spread: 2.2, depth: 4.0 },
  { type: FLOWER_TYPES.PEACH_ROSE,   t: 0.15, side: -1, count: 55, spread: 2.2, depth: 4.5 },
  { type: FLOWER_TYPES.LAVENDER,     t: 0.15, side:  1, count: 70, spread: 2.4, depth: 5.0 },
  { type: FLOWER_TYPES.WHITE_ROSE,   t: 0.20, side: -1, count: 65, spread: 2.4, depth: 5.0 },
  { type: FLOWER_TYPES.CREAM_ROSE,   t: 0.20, side:  1, count: 60, spread: 2.2, depth: 4.5 },
  { type: FLOWER_TYPES.BABYS_BREATH, t: 0.26, side: -1, count: 85, spread: 2.6, depth: 5.0 },
  { type: FLOWER_TYPES.BLUSH_ROSE,   t: 0.26, side:  1, count: 60, spread: 2.2, depth: 4.5 },
  { type: FLOWER_TYPES.MINI_ROSE,    t: 0.32, side: -1, count: 70, spread: 2.0, depth: 4.5 },
  { type: FLOWER_TYPES.WHITE_ROSE,   t: 0.32, side:  1, count: 70, spread: 2.2, depth: 5.0 },
  { type: FLOWER_TYPES.LAVENDER,     t: 0.38, side: -1, count: 80, spread: 2.4, depth: 5.0 },
  { type: FLOWER_TYPES.PEACH_ROSE,   t: 0.38, side:  1, count: 55, spread: 2.2, depth: 4.5 },
  { type: FLOWER_TYPES.HYDRANGEA,    t: 0.44, side: -1, count: 35, spread: 2.4, depth: 4.5 },
  { type: FLOWER_TYPES.CREAM_ROSE,   t: 0.44, side:  1, count: 65, spread: 2.2, depth: 5.0 },
  { type: FLOWER_TYPES.WHITE_ROSE,   t: 0.52, side: -1, count: 70, spread: 2.4, depth: 5.0 },
  { type: FLOWER_TYPES.BABYS_BREATH, t: 0.52, side:  1, count: 90, spread: 2.6, depth: 5.5 },
  { type: FLOWER_TYPES.BLUSH_ROSE,   t: 0.60, side: -1, count: 65, spread: 2.2, depth: 5.0 },
  { type: FLOWER_TYPES.LAVENDER,     t: 0.60, side:  1, count: 80, spread: 2.4, depth: 5.0 },
];

// ─── System ───────────────────────────────────────────────────────────────────

const _dummy = new THREE.Object3D();
const _up    = new THREE.Vector3(0, 1, 0);
const _right = new THREE.Vector3();

export class FlowerSystem {
  constructor(sceneManager, pathSystem, windSystem) {
    this.sceneManager = sceneManager;
    this.path         = pathSystem;
    this.wind         = windSystem;
    this._meshes      = new Map();
    this._counts      = new Map();
  }

  init() {
    for (const [type, cfg] of Object.entries(FLOWER_CONFIG)) {
      const geo = cfg.geo();
      const mat = new THREE.MeshStandardMaterial({
        color:            cfg.color,
        emissive:         new THREE.Color(cfg.emissive),
        emissiveIntensity: cfg.emissiveI,
        roughness:        0.68,
        metalness:        0.0,
        side:             THREE.DoubleSide,
      });
      injectWindSway(mat, this.wind.uniforms, 0.14);

      const mesh = new THREE.InstancedMesh(geo, mat, cfg.max);
      mesh.castShadow    = true;
      mesh.receiveShadow = true;
      mesh.count         = 0;

      this._meshes.set(type, mesh);
      this._counts.set(type, 0);
      this.sceneManager.add(mesh);
    }

    const curve = this.path.curve;
    for (const bed of BEDS) this._placeBed(curve, bed);
    this._meshes.forEach(m => { m.instanceMatrix.needsUpdate = true; });
  }

  _placeBed(curve, bed) {
    const mesh = this._meshes.get(bed.type);
    if (!mesh) return;

    const pt   = curve.getPoint(bed.t);
    const tang = curve.getTangent(bed.t);
    _right.crossVectors(tang, _up).normalize();

    const cfg     = FLOWER_CONFIG[bed.type];
    let   idx     = this._counts.get(bed.type);
    const toPlace = Math.min(bed.count, cfg.max - idx);

    for (let i = 0; i < toPlace; i++) {
      const seed = bed.t * 1000 + bed.side * 500 + i;
      const rv   = (n) => seededRand(seed + n);

      // Distance from path — some flowers spill close to edge
      const lateralMin = 0.85 + rv(1) * bed.spread;
      const depthOff   = (rv(2) - 0.5) * bed.depth;
      const overlap    = rv(3) < 0.20 ? -(0.2 + rv(6) * 0.4) : 0;

      const fx = pt.x + _right.x * (bed.side * lateralMin + overlap) + tang.x * depthOff;
      const fz = pt.z + _right.z * (bed.side * lateralMin + overlap) + tang.z * depthOff;

      _dummy.position.set(fx, 0, fz);
      _dummy.rotation.y  = rv(4) * Math.PI * 2;
      _dummy.scale.setScalar(0.75 + rv(5) * 0.55);
      _dummy.updateMatrix();

      mesh.setMatrixAt(idx, _dummy.matrix);
      idx++;
    }

    mesh.count = idx;
    this._counts.set(bed.type, idx);
  }

  update(_delta) {}

  dispose() {
    this._meshes.forEach(m => { m.geometry.dispose(); m.material.dispose(); });
    this._meshes.clear();
  }
}
