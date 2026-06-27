/**
 * Manages ambient audio playback and scroll-driven volume/filter automation.
 * Sprint 5+: Web Audio API with low-pass filter tied to scroll progress.
 */
export class AudioSystem {
  constructor() {
    /** @type {AudioContext | null} */
    this.context = null;
  }

  init() {}

  /** @param {number} _progress */
  update(_progress) {}

  dispose() {
    this.context?.close();
  }
}
