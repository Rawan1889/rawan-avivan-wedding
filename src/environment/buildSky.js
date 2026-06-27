import * as THREE from 'three';
import { skyVert, skyFrag } from '../shaders/sky.js';

/**
 * Procedural gradient sky dome — no HDR, no texture, no skybox.
 * Calibrated for European garden at 7:00 AM sunrise.
 * @returns {THREE.Mesh}
 */
export function buildSky() {
  const geo = new THREE.SphereGeometry(450, 32, 18);

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTop:        { value: new THREE.Color(0x8bafc8) },  // muted pale blue
      uMid:        { value: new THREE.Color(0xf0e2cc) },  // warm cream
      uHorizon:    { value: new THREE.Color(0xe8c49a) },  // golden peach
      uGlow:       { value: new THREE.Color(0xf5c87a) },  // warm sun glow
      uGlowHeight: { value: 0.06 },
    },
    vertexShader:   skyVert,
    fragmentShader: skyFrag,
    side:       THREE.BackSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = -1;

  return mesh;
}
