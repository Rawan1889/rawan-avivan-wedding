import * as THREE from 'three';
import { seededRand } from '../utils/mathUtils.js';

const _up = new THREE.Vector3(0, 1, 0);
const _r  = new THREE.Vector3();

const _wallMat = new THREE.MeshStandardMaterial({
  color:     0xa89070,
  roughness: 0.92,
  metalness: 0.0,
});

const _capMat = new THREE.MeshStandardMaterial({
  color:     0xb8a080,
  roughness: 0.85,
  metalness: 0.0,
});

/**
 * Builds low stone raised-bed walls along the path — key element from reference images.
 * Each wall segment is a slightly irregular box to feel hand-laid.
 */
export function buildStoneWalls(scene, curve) {
  const STEPS = 32;
  const WALL_H = 0.28;
  const WALL_W = 0.22;
  const GAP    = 1.20; // distance from path edge

  for (let i = 0; i < STEPS; i++) {
    const t    = 0.01 + (i / (STEPS - 1)) * 0.78;
    const pt   = curve.getPoint(t);
    const tang = curve.getTangent(t);
    _r.crossVectors(tang, _up).normalize();

    // Wall segment length varies slightly
    const segLen = 1.4 + seededRand(i * 19) * 0.6;
    const h      = WALL_H + seededRand(i * 29) * 0.08;

    for (const side of [-1, 1]) {
      const wx = pt.x + _r.x * side * GAP;
      const wz = pt.z + _r.z * side * GAP;
      const angle = Math.atan2(tang.x, tang.z);

      // Main wall block
      const wallGeo = new THREE.BoxGeometry(WALL_W, h, segLen);
      // Add micro-displacement for stone feel
      const pos = wallGeo.getAttribute('position');
      for (let v = 0; v < pos.count; v++) {
        pos.setX(v, pos.getX(v) + (seededRand(i * 100 + v * 3)     - 0.5) * 0.03);
        pos.setY(v, pos.getY(v) + (seededRand(i * 100 + v * 3 + 1) - 0.5) * 0.015);
        pos.setZ(v, pos.getZ(v) + (seededRand(i * 100 + v * 3 + 2) - 0.5) * 0.03);
      }
      pos.needsUpdate = true;
      wallGeo.computeVertexNormals();

      const wall = new THREE.Mesh(wallGeo, _wallMat);
      wall.position.set(wx, h / 2, wz);
      wall.rotation.y = angle;
      wall.castShadow = wall.receiveShadow = true;
      scene.add(wall);

      // Cap stones on top — slightly wider
      const capGeo = new THREE.BoxGeometry(WALL_W + 0.06, 0.06, segLen + 0.04);
      const cap    = new THREE.Mesh(capGeo, _capMat);
      cap.position.set(wx, h + 0.03, wz);
      cap.rotation.y = angle;
      cap.castShadow = cap.receiveShadow = true;
      scene.add(cap);
    }
  }
}
