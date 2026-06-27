import * as THREE from 'three';

const vertexShader = /* glsl */`
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */`
  uniform vec3 uSkyTop;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  varying vec3 vDir;

  void main() {
    float h = clamp(vDir.y, 0.0, 1.0);
    // horizon glow band
    float glowBand = pow(1.0 - clamp(abs(vDir.y) * 3.5, 0.0, 1.0), 2.5);
    vec3 color = mix(uHorizon, uSkyTop, smoothstep(0.0, 0.55, h));
    color = mix(color, uGlow, glowBand * 0.72);
    gl_FragColor = vec4(color, 1.0);
  }
`;

/**
 * Procedural gradient sky dome — no HDR, no texture.
 * Inverted sphere so faces point inward.
 * @returns {THREE.Mesh}
 */
export function buildSky() {
  const geo = new THREE.SphereGeometry(400, 32, 16);

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uSkyTop: { value: new THREE.Color(0x9bbfd4) },   // soft pale blue
      uHorizon: { value: new THREE.Color(0xf5e8d0) },  // warm cream
      uGlow:    { value: new THREE.Color(0xf0c06a) },  // golden peach
    },
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = -1;
  return mesh;
}
