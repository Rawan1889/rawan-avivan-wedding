import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Smooth scroll — Lenis + GSAP ScrollTrigger.
 * Exposes `progress` (0→1) for camera and GSAP animations.
 * Lenis is driven from the main Three.js RAF via update() — single loop.
 */
export class ScrollSystem {
  constructor() {
    /** @type {number} Normalised scroll position 0 (top) → 1 (bottom) */
    this.progress = 0;
    /** @type {Lenis | null} */
    this._lenis   = null;
  }

  init() {
    gsap.registerPlugin(ScrollTrigger);

    this._lenis = new Lenis({
      duration:    2.0,
      easing:      (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2.0,
    });

    // Keep ScrollTrigger in sync with Lenis
    this._lenis.on('scroll', ScrollTrigger.update);

    this._lenis.on('scroll', ({ progress }) => {
      this.progress = progress;
    });
  }

  /** Must be called every animation frame. Drives Lenis from Three.js RAF. */
  update(_delta) {
    this._lenis?.raf(performance.now());
  }

  dispose() {
    this._lenis?.destroy();
  }
}
