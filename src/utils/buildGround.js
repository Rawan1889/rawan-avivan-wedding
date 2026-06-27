import * as THREE from 'three';

/**
 * Creates the large limestone terrain plane.
 * @returns {THREE.Mesh}
 */
export function buildGround() {
  const geo = new THREE.PlaneGeometry(800, 800, 8, 8);

  const mat = new THREE.MeshStandardMaterial({
    color: 0xd4c4a0,
    roughness: 0.9,
    metalness: 0.0,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0;
  mesh.receiveShadow = true;

  return mesh;
}
