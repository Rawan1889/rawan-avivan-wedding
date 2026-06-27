import * as THREE from 'three';
import { mat } from '../materials/materials.js';
import { noise2d } from '../utils/mathUtils.js';

const GROUND_SIZE     = 800;
const GROUND_SEGMENTS = 80;
const ELEVATION_SCALE = 0.9;

/**
 * Creates a large warm-limestone terrain with gentle procedural elevation.
 * Receives shadows from all scene lights.
 * @returns {THREE.Mesh}
 */
export function buildGround() {
  const geo = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE, GROUND_SEGMENTS, GROUND_SEGMENTS);

  const pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getY(i); // Y in plane local space = world Z after rotation
    pos.setZ(i, noise2d(x, z) * ELEVATION_SCALE);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, mat.limestone);
  mesh.rotation.x   = -Math.PI / 2;
  mesh.position.set(0, 0, -20);
  mesh.receiveShadow = true;

  return mesh;
}
