/**
 * Wraps Lenis smooth scroll and exposes a normalised 0→1 progress value.
 * Sprint 2: stub — camera drift is automatic this sprint.
 * Sprint 3+: drives camera walk-through and GSAP timeline scrubbing.
 */
export class ScrollSystem {
  constructor() {
    /** @type {number} 0 at top, 1 at bottom of scroll track */
    this.progress = 0;
  }

  init() {}

  /** @param {number} _delta */
  update(_delta) {}

  dispose() {}
}
