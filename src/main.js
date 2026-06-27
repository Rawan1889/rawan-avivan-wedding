import * as THREE from 'three';
import { SceneManager } from './systems/SceneManager.js';
import { CameraSystem } from './systems/CameraSystem.js';
import { LightingSystem } from './systems/LightingSystem.js';
import { EnvironmentSystem } from './systems/EnvironmentSystem.js';
import { ScrollSystem } from './systems/ScrollSystem.js';
import { FlowerSystem } from './systems/FlowerSystem.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { AudioSystem } from './systems/AudioSystem.js';
import { DawnGate } from './scenes/DawnGate.js';

// ─── Renderer ────────────────────────────────────────────────────────────────

const canvas = document.getElementById('canvas');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ─── Systems ─────────────────────────────────────────────────────────────────

const sceneManager    = new SceneManager();
const cameraSystem    = new CameraSystem();
const lightingSystem  = new LightingSystem(sceneManager);
const envSystem       = new EnvironmentSystem(sceneManager);
const scrollSystem    = new ScrollSystem();
const flowerSystem    = new FlowerSystem(sceneManager);
const particleSystem  = new ParticleSystem(sceneManager);
const audioSystem     = new AudioSystem();

// ─── Scenes ──────────────────────────────────────────────────────────────────

const dawnGate = new DawnGate(sceneManager, scrollSystem);

// ─── Init ─────────────────────────────────────────────────────────────────────

lightingSystem.init();
envSystem.init();
scrollSystem.init();
flowerSystem.init();
particleSystem.init();
dawnGate.init();

// ─── Rotating Cube ───────────────────────────────────────────────────────────

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 1.5, 1.5),
  new THREE.MeshNormalMaterial()
);
sceneManager.add(cube);

// ─── Clock ───────────────────────────────────────────────────────────────────

const clock = new THREE.Clock();

// ─── Resize ──────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  cameraSystem.onResize();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Animation Loop ──────────────────────────────────────────────────────────

function tick() {
  requestAnimationFrame(tick);

  const delta   = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  scrollSystem.update();

  lightingSystem.update(delta);
  envSystem.update(delta);
  flowerSystem.update(delta);
  particleSystem.update(elapsed);
  dawnGate.update(delta);

  cube.rotation.x += delta * 0.5;
  cube.rotation.y += delta * 0.8;

  renderer.render(sceneManager.get(), cameraSystem.get());
}

tick();
