/**
 * DawnGate — the opening chapter of the experience.
 * The visitor arrives at the garden entrance at dawn, gates slowly open.
 *
 * All environment elements for this chapter are owned by the shared systems
 * (EnvironmentSystem, LightingSystem, ParticleSystem). DawnGate will
 * coordinate chapter-specific animation and transitions in Sprint 3+.
 */
export class DawnGate {
  /**
   * @param {import('../systems/SceneManager').SceneManager} sceneManager
   * @param {import('../systems/ScrollSystem').ScrollSystem} scrollSystem
   */
  constructor(sceneManager, scrollSystem) {
    this.sceneManager = sceneManager;
    this.scrollSystem = scrollSystem;
  }

  init() {}

  /** @param {number} _delta */
  update(_delta) {}
}
