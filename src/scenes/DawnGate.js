/**
 * DawnGate — the opening chapter of the experience.
 * The visitor arrives at the garden entrance at dawn, gates slowly open.
 * Sprint 1: empty stub.
 * Sprint 2+: gate geometry, dawn sky gradient, opening animation on scroll.
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

  /** Builds the gate geometry and adds to scene. */
  init() {
    // Populated in Sprint 2
  }

  /** @param {number} delta */
  update(_delta) {
    // Populated in Sprint 2
  }
}
