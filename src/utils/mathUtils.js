/**
 * Trigonometric pseudo-noise — no allocations, deterministic.
 * Returns a value in approximately [-1, 1].
 * @param {number} x
 * @param {number} z
 * @returns {number}
 */
export function noise2d(x, z) {
  return (
    Math.sin(x * 0.05  + 1.7) * Math.cos(z * 0.04  + 0.3) * 0.60 +
    Math.sin(x * 0.13  + 3.2) * Math.cos(z * 0.09  + 1.9) * 0.28 +
    Math.sin(x * 0.23  + 0.8) * Math.cos(z * 0.18  + 2.7) * 0.12
  );
}

/**
 * Clamps value between min and max.
 * @param {number} v
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Linear interpolation.
 * @param {number} a
 * @param {number} b
 * @param {number} t  0–1
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Smoothstep — smooth 0→1 transition.
 * @param {number} edge0
 * @param {number} edge1
 * @param {number} x
 * @returns {number}
 */
export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Seeded pseudo-random in [0, 1) — deterministic, no state.
 * @param {number} seed
 * @returns {number}
 */
export function seededRand(seed) {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}
