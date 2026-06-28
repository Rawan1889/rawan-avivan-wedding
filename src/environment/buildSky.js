import * as THREE from 'three';
import { skyVert, skyFrag } from '../shaders/sky.js';

/**
 * Dusk / golden-hour sky dome.
 * Exposes `skyMat` so LightingSystem can animate uSunIntensity.
 * @returns {{ mesh: THREE.Mesh, material: THREE.ShaderMaterial }}
 */
export function buildSky() {
  const geo = new THREE.SphereGeometry(450, 32, 18);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uZenith:      { value: new THREE.Color(0x4a5068) },  // soft dusty blue
      uMid:         { value: new THREE.Color(0xe8c0a0) },  // warm blush peach
      uHorizon:     { value: new THREE.Color(0xf0a060) },  // soft amber-peach
      uGlow:        { value: new THREE.Color(0xffe090) },  // warm golden glow
      uUnderGlow:   { value: new THREE.Color(0x7a4828) },  // warm earth shadow
      uGlowHeight:  { value: 0.06 },
      uSunIntensity:{ value: 0.0 },
    },
    vertexShader:   skyVert,
    fragmentShader: skyFrag,
    side:       THREE.BackSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geo, material);
  mesh.renderOrder = -1;

  return { mesh, material };
}
