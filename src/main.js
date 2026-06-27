import * as THREE from 'three';
import { SceneManager }    from './systems/SceneManager.js';
import { CameraSystem }    from './systems/CameraSystem.js';
import { LightingSystem }  from './systems/LightingSystem.js';
import { EnvironmentSystem } from './systems/EnvironmentSystem.js';
import { ScrollSystem }    from './systems/ScrollSystem.js';
import { FlowerSystem }    from './systems/FlowerSystem.js';
import { ParticleSystem }  from './systems/ParticleSystem.js';
import { AudioSystem }     from './systems/AudioSystem.js';
import { DawnGate }        from './scenes/DawnGate.js';

// ── Renderer ─────────────────────────────────────────────────────────────────

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping        = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace   = THREE.SRGBColorSpace;
renderer.shadowMap.enabled  = true;
renderer.shadowMap.type     = THREE.PCFSoftShadowMap;

// ── Systems ───────────────────────────────────────────────────────────────────

const sceneManager   = new SceneManager();
const cameraSystem   = new CameraSystem();
const lightingSystem = new LightingSystem(sceneManager);
const envSystem      = new EnvironmentSystem(sceneManager);
const scrollSystem   = new ScrollSystem();
const flowerSystem   = new FlowerSystem(sceneManager);
const particleSystem = new ParticleSystem(sceneManager);
const audioSystem    = new AudioSystem();

// ── Scenes ───────────────────────────────────────────────────────────────────

const dawnGate = new DawnGate(sceneManager, scrollSystem);

// ── Register with SceneManager ───────────────────────────────────────────────
// CameraSystem registered first so drift happens before render.

sceneManager.register(cameraSystem);
sceneManager.register(lightingSystem);
sceneManager.register(envSystem);
sceneManager.register(scrollSystem);
sceneManager.register(flowerSystem);
sceneManager.register(particleSystem);
sceneManager.register(audioSystem);
sceneManager.register(dawnGate);

// ── Init ──────────────────────────────────────────────────────────────────────

lightingSystem.init();
envSystem.init();
scrollSystem.init();
flowerSystem.init();
particleSystem.init();
audioSystem.init();
dawnGate.init();

// ── Resize ───────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  sceneManager.resize();
});

// ── Loop ─────────────────────────────────────────────────────────────────────

const clock = new THREE.Clock();

function tick() {
  requestAnimationFrame(tick);
  const delta = clock.getDelta();
  sceneManager.update(delta);
  sceneManager.render(renderer, cameraSystem.get());
}

tick();
