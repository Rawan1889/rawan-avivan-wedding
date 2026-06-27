import * as THREE from 'three';

const ARCH_Z        = 12;
const PILLAR_W      = 0.42;
const PILLAR_H      = 4.0;
const PILLAR_OFFSET = 1.55;
const ARCH_RADIUS   = 1.55;
const TUBE_RADIUS   = 0.20;

/** Warm limestone shared across all arch pieces. */
const MAT = new THREE.MeshStandardMaterial({
  color: 0xcbbf9e,
  roughness: 0.88,
  metalness: 0.0,
});

/**
 * Builds a procedural stone entrance arch from primitives.
 * Returns a THREE.Group containing all parts.
 * @returns {THREE.Group}
 */
export function buildArch() {
  const group = new THREE.Group();
  group.position.set(0, 0, ARCH_Z);

  // ── Pillars ─────────────────────────────────────────────────────────────
  const pillarGeo = new THREE.BoxGeometry(PILLAR_W, PILLAR_H, PILLAR_W);

  for (const sign of [-1, 1]) {
    const pillar = new THREE.Mesh(pillarGeo, MAT);
    pillar.position.set(sign * PILLAR_OFFSET, PILLAR_H / 2, 0);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    group.add(pillar);

    // base plinth
    const plinthGeo = new THREE.BoxGeometry(PILLAR_W + 0.18, 0.22, PILLAR_W + 0.18);
    const plinth = new THREE.Mesh(plinthGeo, MAT);
    plinth.position.set(sign * PILLAR_OFFSET, 0.11, 0);
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    group.add(plinth);

    // capital
    const capGeo = new THREE.BoxGeometry(PILLAR_W + 0.14, 0.18, PILLAR_W + 0.14);
    const cap = new THREE.Mesh(capGeo, MAT);
    cap.position.set(sign * PILLAR_OFFSET, PILLAR_H + 0.09, 0);
    cap.castShadow = true;
    group.add(cap);
  }

  // ── Lintel ──────────────────────────────────────────────────────────────
  const lintelGeo = new THREE.BoxGeometry(PILLAR_OFFSET * 2 + PILLAR_W, 0.22, PILLAR_W);
  const lintel = new THREE.Mesh(lintelGeo, MAT);
  lintel.position.set(0, PILLAR_H + 0.22, 0);
  lintel.castShadow = true;
  lintel.receiveShadow = true;
  group.add(lintel);

  // ── Arch Curve ──────────────────────────────────────────────────────────
  const archPts = [];
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const angle = Math.PI - (Math.PI * i) / steps; // π → 0 (left to right)
    archPts.push(new THREE.Vector3(
      Math.cos(angle) * ARCH_RADIUS,
      PILLAR_H + 0.32 + Math.sin(angle) * ARCH_RADIUS,
      0,
    ));
  }
  const archCurve = new THREE.CatmullRomCurve3(archPts);
  const archTube = new THREE.TubeGeometry(archCurve, 32, TUBE_RADIUS, 8, false);
  const archMesh = new THREE.Mesh(archTube, MAT);
  archMesh.castShadow = true;
  group.add(archMesh);

  // ── Keystone ────────────────────────────────────────────────────────────
  const keystoneGeo = new THREE.BoxGeometry(0.28, 0.38, PILLAR_W);
  const keystone = new THREE.Mesh(keystoneGeo, MAT);
  keystone.position.set(0, PILLAR_H + 0.32 + ARCH_RADIUS + TUBE_RADIUS + 0.1, 0);
  keystone.castShadow = true;
  group.add(keystone);

  return group;
}
