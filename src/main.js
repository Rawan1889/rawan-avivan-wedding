import * as THREE from 'three';
import gsap from 'gsap';

import { SceneManager }     from './systems/SceneManager.js';
import { RendererSystem }   from './systems/RendererSystem.js';
import { CameraSystem }     from './systems/CameraSystem.js';
import { LightingSystem }   from './systems/LightingSystem.js';
import { EnvironmentSystem } from './systems/EnvironmentSystem.js';
import { ScrollSystem }     from './systems/ScrollSystem.js';
import { PathSystem }       from './systems/PathSystem.js';
import { ParticleSystem }   from './systems/ParticleSystem.js';
import { FlowerSystem }     from './systems/FlowerSystem.js';
import { WindSystem }       from './systems/WindSystem.js';
import { AudioSystem }      from './systems/AudioSystem.js';
import { AssetManager }     from './systems/AssetManager.js';
import { DebugSystem }      from './systems/DebugSystem.js';
import { DawnGate }         from './scenes/DawnGate.js';

// ── Bootstrap ─────────────────────────────────────────────────────────────────

const canvas   = document.getElementById('canvas');
const renderer = new RendererSystem(canvas);
const scene    = new SceneManager();
const assets   = new AssetManager();

// Systems with dependencies — order matters
const scroll   = new ScrollSystem();
const path     = new PathSystem(scene);
const camera   = new CameraSystem(path, scroll);
const lighting = new LightingSystem(scene);
const env      = new EnvironmentSystem(scene, path);
const wind     = new WindSystem();
const particles = new ParticleSystem(scene);
const flowers  = new FlowerSystem(scene, path, wind);
const audio    = new AudioSystem();
const debug    = new DebugSystem();

const dawnGate = new DawnGate(scene, scroll, path);

// ── Register systems (update order matters) ───────────────────────────────────

scene
  .register(scroll)
  .register(camera)
  .register(lighting)
  .register(env)
  .register(wind)
  .register(particles)
  .register(flowers)
  .register(audio)
  .register(assets)
  .register(debug)
  .register(dawnGate)
  .register(renderer);  // renderer registered so onResize() is called

// ── Init all systems ──────────────────────────────────────────────────────────

renderer.init();
assets.init();
scroll.init();
path.init();                     // must run before camera.init()
camera.init(renderer.get());
lighting.init();
env.init();
wind.init();
particles.init();
flowers.init();
audio.init();
debug.init(camera.get(), renderer.get(), scene.get());
dawnGate.init();

// ── Opening sequence ─────────────────────────────────────────────────────────
// Black overlay fades out; sun intensity ramps from 0.1 → 2.2.

gsap.ticker.lagSmoothing(0);   // prevents catch-up bursts after tab focus
gsap.timeline({ delay: 0.4 })
  .to('#intro', {
    opacity:  0,
    duration: 2.8,
    ease:     'power2.inOut',
  }, 0)
  .to(lighting.sunLight, {
    intensity: 2.2,
    duration:  3.5,
    ease:      'power1.inOut',
  }, 0.6)
  .call(() => {
    const el = document.getElementById('intro');
    if (el) el.remove();
  });

// ── Resize ────────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  scene.resize();
  renderer.onResize();
  camera.onResize();
});

// ── Animation loop ────────────────────────────────────────────────────────────

const clock = new THREE.Clock();

function tick() {
  requestAnimationFrame(tick);
  const delta = clock.getDelta();
  scene.update(delta);
  scene.render(renderer.get(), camera.get());
}

tick();
