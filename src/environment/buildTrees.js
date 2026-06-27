import * as THREE from 'three';
import { mat } from '../materials/materials.js';
import { seededRand } from '../utils/mathUtils.js';

// ── Shared geometries (reused across instances) ───────────────────────────────

const _cypressConeGeo  = new THREE.ConeGeometry(1, 1, 7);
const _sphereGeo       = new THREE.SphereGeometry(1, 9, 7);
const _cylGeo          = new THREE.CylinderGeometry(1, 1, 1, 6);
const _boxGeo          = new THREE.BoxGeometry(1, 1, 1);

// ── Builders ─────────────────────────────────────────────────────────────────

/**
 * Italian Cypress — tall narrow sentinel.
 * @param {number} seed
 * @returns {THREE.Group}
 */
function buildCypress(seed) {
  const rng  = (i) => seededRand(seed + i);
  const h    = 8 + rng(0) * 4;    // 8–12m
  const maxR = 0.45 + rng(1) * 0.2;
  const group = new THREE.Group();

  // trunk
  const trunk = new THREE.Mesh(_cylGeo, mat.bark);
  trunk.scale.set(0.12, h, 0.12);
  trunk.position.y = h / 2;
  trunk.castShadow = true;
  group.add(trunk);

  // stacked cones narrowing toward top
  const layers = 9;
  for (let i = 0; i < layers; i++) {
    const t = i / (layers - 1);
    const r = maxR * (1 - t * 0.75) * (0.9 + rng(i + 2) * 0.2);
    const ch = h * 0.18;
    const cone = new THREE.Mesh(_cypressConeGeo, mat.foliageDark);
    cone.scale.set(r, ch, r);
    cone.position.y = h * 0.15 + t * h * 0.72;
    cone.castShadow = true;
    group.add(cone);
  }
  return group;
}

/**
 * Olive tree — irregular silver-green canopy, multi-trunk suggestion.
 * @param {number} seed
 * @returns {THREE.Group}
 */
function buildOlive(seed) {
  const rng  = (i) => seededRand(seed + i);
  const h    = 3.5 + rng(0) * 2;
  const cr   = 1.4 + rng(1) * 0.8;
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(_cylGeo, mat.bark);
  trunk.scale.set(0.14, h, 0.14);
  trunk.position.y = h / 2;
  trunk.rotation.z = (rng(2) - 0.5) * 0.18;
  trunk.castShadow = true;
  group.add(trunk);

  // 3 irregular canopy spheres
  for (let i = 0; i < 3; i++) {
    const cx = (rng(i + 3) - 0.5) * cr * 0.8;
    const cy = h + (rng(i + 6) - 0.3) * cr * 0.5;
    const r  = cr * (0.7 + rng(i + 9) * 0.5);
    const s  = new THREE.Mesh(_sphereGeo, mat.foliageOlive);
    s.scale.set(r, r * 0.85, r);
    s.position.set(cx, cy, (rng(i + 12) - 0.5) * cr * 0.5);
    s.castShadow = true;
    group.add(s);
  }
  return group;
}

/**
 * Boxwood sphere — dense small topiary.
 * @param {number} seed
 * @returns {THREE.Group}
 */
function buildBoxwood(seed) {
  const rng  = (i) => seededRand(seed + i);
  const r    = 0.5 + rng(0) * 0.3;
  const h    = 1.0 + rng(1) * 0.6;
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(_cylGeo, mat.bark);
  trunk.scale.set(0.07, h, 0.07);
  trunk.position.y = h / 2;
  group.add(trunk);

  const ball = new THREE.Mesh(_sphereGeo, mat.foliageHedge);
  ball.scale.setScalar(r);
  ball.position.y = h + r;
  ball.castShadow = true;
  group.add(ball);

  return group;
}

/**
 * Hedge block — sculpted rectangular hedge section.
 * @param {number} w
 * @param {number} h
 * @param {number} d
 * @returns {THREE.Mesh}
 */
function buildHedge(w, h, d) {
  const geo = new THREE.BoxGeometry(w, h, d, 3, 2, 2);
  // subtle organic surface noise
  const pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * 0.06);
    pos.setY(i, pos.getY(i) + (Math.random() - 0.5) * 0.04);
    pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * 0.06);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, mat.foliageHedge);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

// ── Public placement function ─────────────────────────────────────────────────

/**
 * Places all vegetation in the scene, following the path curve.
 * @param {THREE.Scene} scene
 * @param {THREE.CatmullRomCurve3} curve
 */
export function placeVegetation(scene, curve) {
  const _right = new THREE.Vector3();
  const _tangent = new THREE.Vector3();
  const _up = new THREE.Vector3(0, 1, 0);

  // ── Hedges flanking path ──────────────────────────────────────────────────
  const HEDGE_STEPS = 22;
  const HEDGE_D = 2.6; // distance from path centre
  for (let i = 0; i < HEDGE_STEPS; i++) {
    const t = i / (HEDGE_STEPS - 1);
    const pt      = curve.getPoint(t);
    const tang    = curve.getTangent(t);
    _right.crossVectors(tang, _up).normalize();

    const hedgeH  = 1.6 + seededRand(i * 7) * 0.6;
    const hedgeW  = 2.4 + seededRand(i * 13) * 0.8;

    for (const side of [-1, 1]) {
      const hx = pt.x + _right.x * side * HEDGE_D;
      const hz = pt.z + _right.z * side * HEDGE_D;
      const hedge = buildHedge(hedgeW * 0.55, hedgeH, 2.0);
      hedge.position.set(hx, hedgeH / 2, hz);
      const angle = Math.atan2(tang.x, tang.z);
      hedge.rotation.y = angle;
      scene.add(hedge);
    }
  }

  // ── Italian Cypress — tall sentinels at intervals ─────────────────────────
  const CYPRESS_COUNT = 18;
  const CYPRESS_D = 5.5;
  for (let i = 0; i < CYPRESS_COUNT; i++) {
    const t    = (i / CYPRESS_COUNT) * 0.82 + 0.01;
    const pt   = curve.getPoint(t);
    const tang = curve.getTangent(t);
    _right.crossVectors(tang, _up).normalize();

    for (const side of [-1, 1]) {
      const offset = CYPRESS_D + seededRand(i * 31 + side * 17) * 2.0;
      const cx = pt.x + _right.x * side * offset;
      const cz = pt.z + _right.z * side * offset;
      const tree = buildCypress(i * 100 + side * 50);
      tree.position.set(cx, 0, cz);
      tree.rotation.y = seededRand(i * 41) * Math.PI * 2;
      scene.add(tree);
    }
  }

  // ── Olive trees — scattered beyond cypress line ───────────────────────────
  const OLIVE_PLACEMENTS = [
    { t: 0.05, side: -1, d: 9 }, { t: 0.05,  side: 1, d: 10 },
    { t: 0.20, side: -1, d: 8 }, { t: 0.22,  side: 1, d: 11 },
    { t: 0.40, side: -1, d: 9 }, { t: 0.38,  side: 1, d: 8  },
    { t: 0.60, side: -1, d: 10}, { t: 0.62,  side: 1, d: 9  },
    { t: 0.78, side: -1, d: 8 }, { t: 0.80,  side: 1, d: 10 },
  ];
  OLIVE_PLACEMENTS.forEach(({ t, side, d }, idx) => {
    const pt   = curve.getPoint(t);
    const tang = curve.getTangent(t);
    _right.crossVectors(tang, _up).normalize();
    const ox = pt.x + _right.x * side * d;
    const oz = pt.z + _right.z * side * d;
    const tree = buildOlive(idx * 77 + 13);
    tree.position.set(ox, 0, oz);
    tree.rotation.y = seededRand(idx * 53) * Math.PI * 2;
    scene.add(tree);
  });

  // ── Boxwood topiaries — accent points along path ──────────────────────────
  const BW_STEPS = 10;
  const BW_D = 2.0;
  for (let i = 0; i < BW_STEPS; i++) {
    const t    = (i / BW_STEPS) * 0.75 + 0.05;
    const pt   = curve.getPoint(t);
    const tang = curve.getTangent(t);
    _right.crossVectors(tang, _up).normalize();

    for (const side of [-1, 1]) {
      const bx = pt.x + _right.x * side * BW_D;
      const bz = pt.z + _right.z * side * BW_D;
      const box = buildBoxwood(i * 200 + side * 30);
      box.position.set(bx, 0, bz);
      scene.add(box);
    }
  }
}
