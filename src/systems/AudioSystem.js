/**
 * Manages ambient audio playback and scroll-driven volume/filter automation.
 * Sprint 1: empty stub.
 * Sprint 5+: Web Audio API with low-pass filter tied to scroll progress.
 */
export class AudioSystem {
  constructor() {
    /** @type {AudioContext | null} */
    this.context = null;
  }

  /**
   * Must be called inside a user gesture (click/touch) to satisfy
   * browser autoplay policy before AudioContext is created.
   */
  init() {
    // Populated in Sprint 5
  }

  /** @param {number} progress - scroll progress 0→1 */
  update(_progress) {
    // Populated in Sprint 5
  }

  dispose() {
    this.context?.close();
  }
}
