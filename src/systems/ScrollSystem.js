/**
 * Wraps Lenis smooth scroll and exposes a normalised 0→1 progress value.
 * Sprint 1: empty stub.
 * Sprint 2+: drives camera walk-through and GSAP timeline scrubbing.
 */
export class ScrollSystem {
  constructor() {
    /** @type {number} 0 at top, 1 at bottom of scroll track */
    this.progress = 0;
  }

  /** Instantiates Lenis and wires scroll listeners. */
  init() {
    // Populated in Sprint 2
  }

  /** Must be called every animation frame. */
  update() {
    // Populated in Sprint 2
  }

  dispose() {
    // Populated in Sprint 2
  }
}
