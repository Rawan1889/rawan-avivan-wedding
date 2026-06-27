import * as THREE from 'three';

const CURVE_POINTS = [
  new THREE.Vector3(0.2, 0, 22),
  new THREE.Vector3(0.5, 0, 17),
  new THREE.Vector3(0.1, 0, 12),
  new THREE.Vector3(-1.0, 0, 5),
  new THREE.Vector3(-1.5, 0, -5),
  new THREE.Vector3(-0.5, 0, -16),
  new THREE.Vector3(0.5, 0, -30),
];

const PATH_WIDTH = 2.2;
const SEGMENTS = 120;

/**
 * Procedural flat ribbon path along a CatmullRom curve.
 * @returns {THREE.Mesh}
 */
export function buildPath() {
  const curve = new THREE.CatmullRomCurve3(CURVE_POINTS);
  const pts = curve.getPoints(SEGMENTS);

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  const _tangent = new THREE.Vector3();
  const _right = new THREE.Vector3();
  const _up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    const p = pts[i];

    // tangent via finite difference to avoid curve.getTangent() edge issues
    const tPrev = Math.max(0, t - 0.001);
    const tNext = Math.min(1, t + 0.001);
    const pPrev = curve.getPoint(tPrev);
    const pNext = curve.getPoint(tNext);
    _tangent.subVectors(pNext, pPrev).normalize();
    _right.crossVectors(_tangent, _up).normalize();

    const half = PATH_WIDTH / 2;
    positions.push(
      p.x - _right.x * half, 0.012, p.z - _right.z * half,
      p.x + _right.x * half, 0.012, p.z + _right.z * half,
    );
    normals.push(0, 1, 0, 0, 1, 0);
    uvs.push(0, t, 1, t);
  }

  for (let i = 0; i < SEGMENTS; i++) {
    const a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
    indices.push(a, c, b, b, c, d);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);

  const mat = new THREE.MeshStandardMaterial({
    color: 0xe0d4b8,
    roughness: 0.75,
    metalness: 0.0,
  });

  return new THREE.Mesh(geo, mat);
}
