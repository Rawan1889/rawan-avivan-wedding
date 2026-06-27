/**
 * Procedural sunrise sky — GLSL gradient in a dome.
 * Colors calibrated for 7:00 AM European garden light.
 */

export const skyVert = /* glsl */`
  varying vec3 vDir;

  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const skyFrag = /* glsl */`
  uniform vec3 uTop;       // zenith — soft muted blue
  uniform vec3 uMid;       // mid-sky — warm cream
  uniform vec3 uHorizon;   // horizon — golden peach
  uniform vec3 uGlow;      // sun glow band
  uniform float uGlowHeight; // vertical center of glow band

  varying vec3 vDir;

  void main() {
    float h = vDir.y; // -1 → 1

    // Sky tone: cream at horizon, soft blue at zenith
    vec3 sky = mix(uMid, uTop, smoothstep(0.0, 0.6, h));

    // Warm horizon bleed near y=0
    float horizonBlend = 1.0 - smoothstep(-0.08, 0.22, h);
    sky = mix(sky, uHorizon, horizonBlend * 0.85);

    // Sun glow — warm band slightly above horizon
    float glow = pow(1.0 - clamp(abs(h - uGlowHeight) * 5.5, 0.0, 1.0), 2.2);
    sky = mix(sky, uGlow, glow * 0.55);

    gl_FragColor = vec4(sky, 1.0);
  }
`;
