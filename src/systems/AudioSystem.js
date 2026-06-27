/**
 * Ambient audio — bird ambience, soft wind, atmospheric tone.
 * Must be initialized inside a user gesture to satisfy autoplay policy.
 * Sprint N: Web Audio API with low-pass filter tied to scroll progress.
 */
export class AudioSystem {
  constructor() {
    /** @type {AudioContext | null} */
    this._ctx    = null;
    /** @type {GainNode | null} */
    this._master = null;
    this._ready  = false;
  }

  init() {
    // Delay AudioContext creation until first user interaction
    const activate = () => {
      if (this._ready) return;
      this._ctx    = new AudioContext();
      this._master = this._ctx.createGain();
      this._master.connect(this._ctx.destination);
      this._master.gain.setValueAtTime(0, this._ctx.currentTime);
      this._ready = true;
      window.removeEventListener('pointerdown', activate);
      window.removeEventListener('keydown', activate);
    };
    window.addEventListener('pointerdown', activate, { once: true });
    window.addEventListener('keydown',     activate, { once: true });
  }

  /**
   * Loads and starts an audio file at the given URL.
   * No-op if AudioContext not yet created.
   * @param {string} url
   * @param {boolean} loop
   */
  async play(url, loop = true) {
    if (!this._ctx || !this._master) return;
    const res  = await fetch(url);
    const buf  = await res.arrayBuffer();
    const data = await this._ctx.decodeAudioData(buf);
    const src  = this._ctx.createBufferSource();
    src.buffer = data;
    src.loop   = loop;
    src.connect(this._master);
    src.start();
    this._master.gain.linearRampToValueAtTime(1, this._ctx.currentTime + 2);
  }

  /** @param {number} _delta */
  update(_delta) {}

  dispose() {
    this._ctx?.close();
  }
}
