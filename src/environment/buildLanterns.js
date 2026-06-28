import * as THREE from 'three';
import { seededRand } from '../utils/mathUtils.js';

const _up = new THREE.Vector3(0, 1, 0);
const _r  = new THREE.Vector3();

// Shared geometries
const _postGeo   = new THREE.CylinderGeometry(0.025, 0.030, 0.90, 6);
const _baseGeo   = new THREE.BoxGeometry(0.14, 0.06, 0.14);
const _bodyGeo   = new THREE.BoxGeometry(0.10, 0.14, 0.10);
const _roofGeo   = new THREE.ConeGeometry(0.09, 0.08, 4);
const _glowGeo   = new THREE.BoxGeometry(0.07, 0.11, 0.07);

const _stoneMat = new THREE.MeshStandardMaterial({ color: 0x9a8868, roughness: 0.90, metalness: 0.0 });
const _glassMat = new THREE.MeshStandardMaterial({
  color:       0xffcc60,
  emissive:    new THREE.Color(0xff9020),
  emissiveIntensity: 1.4,
  transparent: true,
  opacity:     0.72,
  roughness:   0.1,
  metalness:   0.0,
});

function buildOneLantern() {
  const g = new THREE.Group();

  const base = new THREE.Mesh(_baseGeo, _stoneMat);
  base.position.y = 0.03;
  base.castShadow = true;
  g.add(base);

  const post = new THREE.Mesh(_postGeo, _stoneMat);
  post.position.y = 0.03 + 0.45;
  post.castShadow = true;
  g.add(post);

  const body = new THREE.Mesh(_bodyGeo, _stoneMat);
  body.position.y = 0.03 + 0.90 + 0.07;
  body.castShadow = true;
  g.add(body);

  const glass = new THREE.Mesh(_glowGeo, _glassMat);
  glass.position.y = 0.03 + 0.90 + 0.07;
  g.add(glass);

  const roof = new THREE.Mesh(_roofGeo, _stoneMat);
  roof.position.y = 0.03 + 0.90 + 0.14 + 0.04;
  g.add(roof);

  // Warm point light — short radius, candle-like
  const light = new THREE.PointLight(0xff8820, 0.9, 4.5, 2);
  light.position.y = 0.03 + 0.90 + 0.07;
  g.add(light);

  return g;
}

/**
 * Places stone garden lanterns along both sides of the path.
 * @param {THREE.Scene}            scene
 * @param {THREE.CatmullRomCurve3} curve
 */
export function buildLanterns(scene, curve) {
  const STEPS = 18;
  const GAP   = 1.55; // lateral distance from path centre

  for (let i = 0; i < STEPS; i++) {
    const t    = 0.02 + (i / (STEPS - 1)) * 0.72;
    const pt   = curve.getPoint(t);
    const tang = curve.getTangent(t);
    _r.crossVectors(tang, _up).normalize();

    const nudge = (seededRand(i * 37) - 0.5) * 0.18; // slight position variation

    for (const side of [-1, 1]) {
      const lx = pt.x + _r.x * side * (GAP + nudge);
      const lz = pt.z + _r.z * side * (GAP + nudge);
      const lantern = buildOneLantern();
      lantern.position.set(lx, 0, lz);
      lantern.rotation.y = Math.atan2(_r.x * side, _r.z * side) + (seededRand(i * 53) - 0.5) * 0.15;
      scene.add(lantern);
    }
  }
}
