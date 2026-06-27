import * as THREE from 'three';
import { mat } from '../materials/materials.js';
import { seededRand } from '../utils/mathUtils.js';

// Shared primitive geometries — never reallocated
const _coneGeo   = new THREE.ConeGeometry(1, 1, 7);
const _sphereGeo = new THREE.SphereGeometry(1, 9, 7);
const _cylGeo    = new THREE.CylinderGeometry(1, 1, 1, 6);

// ── Individual tree builders ──────────────────────────────────────────────────

/** Italian Cypress — tall narrow sentinel, 8–13m. */
function buildCypress(seed) {
  const r = (i) => seededRand(seed + i);
  const h    = 8.5 + r(0) * 4.5;
  const maxR = 0.40 + r(1) * 0.18;
  const g    = new THREE.Group();

  const trunk = new THREE.Mesh(_cylGeo, mat.bark);
  trunk.scale.set(0.10, h, 0.10);
  trunk.position.y = h / 2;
  g.add(trunk);

  const LAYERS = 10;
  for (let i = 0; i < LAYERS; i++) {
    const t  = i / (LAYERS - 1);
    const cr = maxR * (1 - t * 0.72) * (0.88 + r(i + 2) * 0.24);
    const ch = h * 0.19 * (0.85 + r(i + 12) * 0.3);
    const cone = new THREE.Mesh(_coneGeo, mat.foliageDark);
    cone.scale.set(cr, ch, cr);
    cone.position.y = h * 0.12 + t * h * 0.74;
    cone.rotation.y = r(i + 22) * Math.PI;
    cone.castShadow = true;
    g.add(cone);
  }
  return g;
}

/** Olive tree — irregular silver-green, 3–6m. */
function buildOlive(seed) {
  const r = (i) => seededRand(seed + i);
  const h  = 3.5 + r(0) * 2.5;
  const cr = 1.3 + r(1) * 1.0;
  const g  = new THREE.Group();

  // Slightly leaning trunk
  const trunk = new THREE.Mesh(_cylGeo, mat.bark);
  trunk.scale.set(0.13, h, 0.13);
  trunk.position.y = h / 2;
  trunk.rotation.z = (r(2) - 0.5) * 0.14;
  trunk.castShadow = true;
  g.add(trunk);

  // 3–4 irregular canopy spheres for organic silhouette
  const lobes = 3 + Math.floor(r(3) * 2);
  for (let i = 0; i < lobes; i++) {
    const lx = (r(i + 4) - 0.5) * cr;
    const ly = h + (r(i + 8) - 0.4) * cr * 0.5;
    const lr = cr * (0.6 + r(i + 12) * 0.55);
    const lobe = new THREE.Mesh(_sphereGeo, mat.foliageOlive);
    lobe.scale.set(lr, lr * 0.80, lr);
    lobe.position.set(lx, ly, (r(i + 16) - 0.5) * cr * 0.5);
    lobe.castShadow = true;
    g.add(lobe);
  }
  return g;
}

/** Decorative shrub — low rounded mounds, 0.5–1.1m. */
function buildShrub(seed) {
  const r = (i) => seededRand(seed + i);
  const br = 0.45 + r(0) * 0.55;
  const g  = new THREE.Group();
  const lobes = 2 + Math.floor(r(1) * 3);
  for (let i = 0; i < lobes; i++) {
    const lr = br * (0.7 + r(i + 2) * 0.5);
    const lobe = new THREE.Mesh(_sphereGeo, mat.foliageHedge);
    lobe.scale.set(lr, lr * 0.72, lr);
    lobe.position.set((r(i + 5) - 0.5) * br * 0.9, lr * 0.55, (r(i + 8) - 0.5) * br * 0.7);
    lobe.castShadow = true;
    g.add(lobe);
  }
  return g;
}

/** Sculpted hedge block with organic surface micro-noise. */
function buildHedge(w, h, d) {
  const geo = new THREE.BoxGeometry(w, h, d, 3, 2, 2);
  const pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * 0.05);
    pos.setY(i, pos.getY(i) + (Math.random() - 0.5) * 0.03);
    pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * 0.05);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, mat.foliageHedge);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

// ── Placement ────────────────────────────────────────────────────────────────

const _right = new THREE.Vector3();
const _tang  = new THREE.Vector3();
const _up    = new THREE.Vector3(0, 1, 0);

/**
 * Places all vegetation naturally along the path curve.
 * - 12 Italian Cypress (6 per side)
 * - 8 Olive trees (scattered)
 * - 20 Decorative shrubs
 * - Continuous low hedges
 * @param {THREE.Scene}              scene
 * @param {THREE.CatmullRomCurve3}   curve
 */
export function placeVegetation(scene, curve) {

  // ── Boxwood hedges — continuous low wall either side ──────────────────────
  const HEDGE_STEPS = 28;
  for (let i = 0; i < HEDGE_STEPS; i++) {
    const t    = i / (HEDGE_STEPS - 1);
    const pt   = curve.getPoint(t);
    _tang.subVectors(
      curve.getPoint(Math.min(1, t + 0.005)),
      curve.getPoint(Math.max(0, t - 0.005)),
    ).normalize();
    _right.crossVectors(_tang, _up).normalize();

    const hh  = 0.85 + seededRand(i * 7)  * 0.35;   // 0.85–1.2m
    const hw  = 1.80 + seededRand(i * 13) * 0.60;
    const hd  = 1.40 + seededRand(i * 19) * 0.40;
    const gap = 2.55 + seededRand(i * 23) * 0.30;

    for (const side of [-1, 1]) {
      const hx = pt.x + _right.x * side * gap;
      const hz = pt.z + _right.z * side * gap;
      const hedge = buildHedge(hw * 0.50, hh, hd);
      hedge.position.set(hx, hh / 2, hz);
      hedge.rotation.y = Math.atan2(_tang.x, _tang.z);
      scene.add(hedge);
    }
  }

  // ── 12 Italian Cypress — 6 per side, uneven spacing ──────────────────────
  const CYPRESS_POSITIONS = [0.03, 0.09, 0.17, 0.26, 0.37, 0.50,
                              0.04, 0.11, 0.20, 0.30, 0.42, 0.55];
  CYPRESS_POSITIONS.forEach((tBase, idx) => {
    const side    = idx < 6 ? -1 : 1;
    const t       = tBase + (seededRand(idx * 31) - 0.5) * 0.02;
    const pt      = curve.getPoint(Math.min(1, t));
    const tang    = curve.getTangent(Math.min(1, t));
    _right.crossVectors(tang, _up).normalize();

    const dist = 5.5 + seededRand(idx * 17) * 2.0;
    const cx   = pt.x + _right.x * side * dist;
    const cz   = pt.z + _right.z * side * dist;

    const tree  = buildCypress(idx * 100 + 7);
    tree.position.set(cx, 0, cz);
    tree.rotation.y    = seededRand(idx * 41) * Math.PI * 2;
    tree.scale.setScalar(0.88 + seededRand(idx * 59) * 0.24);
    scene.add(tree);
  });

  // ── 8 Olive trees — scattered beyond cypress ──────────────────────────────
  const OLIVE_PL = [
    { t: 0.06, side: -1, d: 9.5 }, { t: 0.07, side:  1, d: 10.5 },
    { t: 0.22, side: -1, d: 8.5 }, { t: 0.24, side:  1, d: 9.0  },
    { t: 0.40, side: -1, d: 9.0 }, { t: 0.41, side:  1, d: 8.0  },
    { t: 0.60, side: -1, d: 10.0}, { t: 0.61, side:  1, d: 9.5  },
  ];
  OLIVE_PL.forEach(({ t, side, d }, idx) => {
    const pt   = curve.getPoint(t);
    const tang = curve.getTangent(t);
    _right.crossVectors(tang, _up).normalize();
    const ox = pt.x + _right.x * side * d;
    const oz = pt.z + _right.z * side * d;
    const tree = buildOlive(idx * 77 + 13);
    tree.position.set(ox, 0, oz);
    tree.rotation.y    = seededRand(idx * 53) * Math.PI * 2;
    tree.scale.setScalar(0.80 + seededRand(idx * 67) * 0.40);
    scene.add(tree);
  });

  // ── 20 Decorative shrubs — between hedges and cypress ────────────────────
  for (let i = 0; i < 20; i++) {
    const t    = 0.02 + (i / 20) * 0.78 + (seededRand(i * 61) - 0.5) * 0.04;
    const pt   = curve.getPoint(Math.min(1, t));
    const tang = curve.getTangent(Math.min(1, t));
    _right.crossVectors(tang, _up).normalize();

    const side = (i % 2 === 0) ? -1 : 1;
    const dist = 3.2 + seededRand(i * 37) * 1.8;
    const sx   = pt.x + _right.x * side * dist;
    const sz   = pt.z + _right.z * side * dist;

    const shrub = buildShrub(i * 200 + side * 50);
    shrub.position.set(sx, 0, sz);
    shrub.rotation.y = seededRand(i * 83) * Math.PI * 2;
    shrub.scale.setScalar(0.75 + seededRand(i * 97) * 0.50);
    scene.add(shrub);
  }
}
