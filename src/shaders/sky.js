/**
 * Dusk / golden-hour sky — moody, warm, romantic.
 * Calibrated to the reference images: deep amber horizon,
 * blush-peach mid-sky, dusty mauve-blue zenith.
 */

export const skyVert = /* glsl */`
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const skyFrag = /* glsl */`
  uniform vec3 uZenith;      // deep dusty blue-mauve at top
  uniform vec3 uMid;         // blush peach in the middle
  uniform vec3 uHorizon;     // warm amber at horizon
  uniform vec3 uGlow;        // intense sun-glow band
  uniform vec3 uUnderGlow;   // ground reflection warmth below horizon
  uniform float uGlowHeight;
  uniform float uSunIntensity; // 0→1 animated by GSAP

  varying vec3 vDir;

  void main() {
    float h = vDir.y; // -1 (nadir) → +1 (zenith)

    // Base sky gradient — horizon to zenith
    vec3 sky = mix(uHorizon, uMid,  smoothstep(-0.05, 0.30, h));
    sky       = mix(sky,     uZenith, smoothstep(0.15, 0.75, h));

    // Warm glow band at sun position
    float glow = pow(1.0 - clamp(abs(h - uGlowHeight) * 4.2, 0.0, 1.0), 2.8);
    sky = mix(sky, uGlow, glow * 0.72 * uSunIntensity);

    // Below horizon — deep warm ground shadow
    float belowH = 1.0 - smoothstep(-0.25, 0.0, h);
    sky = mix(sky, uUnderGlow, belowH * 0.65);

    gl_FragColor = vec4(sky, 1.0);
  }
`;
