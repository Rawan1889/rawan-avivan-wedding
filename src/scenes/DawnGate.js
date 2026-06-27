/**
 * DawnGate — opening chapter of the experience.
 *
 * The visitor arrives at the garden entrance at dawn.
 * Scroll drives the camera through the arch and into the garden.
 *
 * This scene coordinates chapter-specific logic:
 *   - When to trigger the gate open animation (Sprint N)
 *   - Chapter-specific GSAP ScrollTrigger pins (Sprint N)
 *   - Transition to the next chapter (Sprint N)
 *
 * Currently: all environment is built by the shared systems.
 * DawnGate will progressively take ownership as chapters are added.
 */
export class DawnGate {
  /**
   * @param {import('../systems/SceneManager').SceneManager}  sceneManager
   * @param {import('../systems/ScrollSystem').ScrollSystem}   scrollSystem
   * @param {import('../systems/PathSystem').PathSystem}       pathSystem
   */
  constructor(sceneManager, scrollSystem, pathSystem) {
    this.sceneManager = sceneManager;
    this.scrollSystem = scrollSystem;
    this.pathSystem   = pathSystem;
  }

  init() {}

  /** @param {number} _delta */
  update(_delta) {}

  dispose() {}
}
