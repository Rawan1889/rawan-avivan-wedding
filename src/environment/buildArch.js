import * as THREE from 'three';
import { mat } from '../materials/materials.js';

// Proportions for a European estate entrance arch
const PILLAR_W   = 0.44;
const PILLAR_H   = 4.2;
const SPAN        = 1.6;  // half-width to pillar centre
const ARCH_R      = 1.6;  // arch semicircle radius
const TUBE_R      = 0.22;

/** Reused across left & right pillars */
const _pillarGeo   = new THREE.BoxGeometry(PILLAR_W, PILLAR_H, PILLAR_W);
const _plinthGeo   = new THREE.BoxGeometry(PILLAR_W + 0.20, 0.24, PILLAR_W + 0.20);
const _capitalGeo  = new THREE.BoxGeometry(PILLAR_W + 0.16, 0.20, PILLAR_W + 0.16);
const _lintelGeo   = new THREE.BoxGeometry(SPAN * 2 + PILLAR_W + 0.04, 0.24, PILLAR_W);
const _keystoneGeo = new THREE.BoxGeometry(0.30, 0.42, PILLAR_W);

/** Arch curve: left capital → apex → right capital (semicircle). */
function buildArchCurve() {
  const pts = [];
  const steps = 28;
  for (let i = 0; i <= steps; i++) {
    const angle = Math.PI - (Math.PI * i) / steps;
    pts.push(new THREE.Vector3(
      Math.cos(angle) * ARCH_R,
      PILLAR_H + 0.24 + Math.sin(angle) * ARCH_R,
      0,
    ));
  }
  return new THREE.CatmullRomCurve3(pts);
}

/**
 * Procedural stone entrance arch — luxury European estate proportions.
 * Built entirely from BoxGeometry + TubeGeometry — no imported models.
 * @returns {THREE.Group}
 */
export function buildArch() {
  const group = new THREE.Group();

  // ── Pillars ──────────────────────────────────────────────────────────────
  for (const side of [-1, 1]) {
    const x = side * SPAN;

    const pillar = new THREE.Mesh(_pillarGeo, mat.archStone);
    pillar.position.set(x, PILLAR_H / 2, 0);
    pillar.castShadow = pillar.receiveShadow = true;
    group.add(pillar);

    const plinth = new THREE.Mesh(_plinthGeo, mat.archStone);
    plinth.position.set(x, 0.12, 0);
    plinth.castShadow = plinth.receiveShadow = true;
    group.add(plinth);

    const capital = new THREE.Mesh(_capitalGeo, mat.archStone);
    capital.position.set(x, PILLAR_H + 0.10, 0);
    capital.castShadow = true;
    group.add(capital);
  }

  // ── Lintel ───────────────────────────────────────────────────────────────
  const lintel = new THREE.Mesh(_lintelGeo, mat.archStone);
  lintel.position.set(0, PILLAR_H + 0.24, 0);
  lintel.castShadow = lintel.receiveShadow = true;
  group.add(lintel);

  // ── Arch curve ───────────────────────────────────────────────────────────
  const tubeDef  = new THREE.TubeGeometry(buildArchCurve(), 36, TUBE_R, 10, false);
  const archMesh = new THREE.Mesh(tubeDef, mat.archStone);
  archMesh.castShadow = true;
  group.add(archMesh);

  // ── Keystone ─────────────────────────────────────────────────────────────
  const keystone = new THREE.Mesh(_keystoneGeo, mat.archStone);
  keystone.position.set(0, PILLAR_H + 0.36 + ARCH_R * 2 - TUBE_R, 0);
  keystone.castShadow = true;
  group.add(keystone);

  return group;
}
