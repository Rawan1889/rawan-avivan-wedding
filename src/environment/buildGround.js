import * as THREE from 'three';
import { noise2d } from '../utils/mathUtils.js';

const GROUND_SIZE     = 800;
const GROUND_SEGMENTS = 80;
const ELEVATION_SCALE = 0.75;

/**
 * Grass-based terrain — rich green with subtle elevation.
 * Limestone path ribbon (PathSystem) sits on top at y=0.014.
 * @returns {THREE.Mesh}
 */
export function buildGround() {
  const geo = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE, GROUND_SEGMENTS, GROUND_SEGMENTS);

  const pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getY(i);
    pos.setZ(i, noise2d(x, z) * ELEVATION_SCALE);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color:     0x3d5228,   // rich morning grass
    roughness: 0.95,
    metalness: 0.0,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x   = -Math.PI / 2;
  mesh.position.set(0, 0, -20);
  mesh.receiveShadow = true;

  return mesh;
}

/**
 * Builds soil patches under flower bed areas.
 * Placed at y=0.004 so they sit above grass but below flowers.
 * @param {number} x
 * @param {number} z
 * @param {number} w
 * @param {number} d
 * @returns {THREE.Mesh}
 */
export function buildSoilPatch(x, z, w, d) {
  const geo = new THREE.PlaneGeometry(w, d);
  const mat = new THREE.MeshStandardMaterial({
    color:     0x4a3828,
    roughness: 0.98,
    metalness: 0.0,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0.004, z);
  mesh.receiveShadow = true;
  return mesh;
}
