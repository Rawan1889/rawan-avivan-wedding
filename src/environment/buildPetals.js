import * as THREE from 'three';

const PETAL_COUNT = 14;

// Petal colour — creamy rose white
const PETAL_MAT = new THREE.MeshBasicMaterial({
  color:       0xfaf0ec,
  side:        THREE.DoubleSide,
  transparent: true,
  opacity:     0.82,
  depthWrite:  false,
});

/**
 * Each petal is a simple thin ellipse that drifts across and down the path.
 * Rotates lazily. Resets when it falls below ground or drifts too far.
 * @typedef {{ mesh:THREE.Mesh, vel:THREE.Vector3, rotSpeed:THREE.Vector3, age:number, life:number }} Petal
 */

/**
 * Creates the petal particle system.
 * Returns a group containing all petals plus an update() function.
 * @param {THREE.CatmullRomCurve3} pathCurve
 * @returns {{ group: THREE.Group, update: (delta:number) => void }}
 */
export function buildPetals(pathCurve) {
  const group  = new THREE.Group();

  // Single shared petal geometry — thin oval
  const geo = new THREE.PlaneGeometry(0.06, 0.04, 1, 1);

  /** @type {Petal[]} */
  const petals = [];

  for (let i = 0; i < PETAL_COUNT; i++) {
    const mesh = new THREE.Mesh(geo, PETAL_MAT);
    const p    = spawnPetal(mesh, pathCurve, i, true);
    group.add(mesh);
    petals.push(p);
  }

  return {
    group,
    update(delta) {
      for (const p of petals) {
        p.mesh.position.addScaledVector(p.vel, delta);
        p.mesh.rotation.x += p.rotSpeed.x * delta;
        p.mesh.rotation.y += p.rotSpeed.y * delta;
        p.mesh.rotation.z += p.rotSpeed.z * delta;
        p.age += delta;

        const landed = p.mesh.position.y < 0.02;
        const expired = p.age > p.life;
        if (landed || expired) {
          spawnPetal(p.mesh, pathCurve, Math.random() * 1000, false);
          p.vel.set(
            (Math.random() - 0.5) * 0.22,
            -0.04 - Math.random() * 0.06,
            (Math.random() - 0.5) * 0.18,
          );
          p.rotSpeed.set(
            (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 0.6,
          );
          p.age  = 0;
          p.life = 6 + Math.random() * 8;
        }
      }
    },
  };
}

/**
 * Resets a petal mesh to a random starting position near the path.
 * @param {THREE.Mesh}              mesh
 * @param {THREE.CatmullRomCurve3}  curve
 * @param {number}                  seed
 * @param {boolean}                 spreadAge - scatter initial y so not all at top
 * @returns {Petal}
 */
function spawnPetal(mesh, curve, seed, spreadAge) {
  const t  = Math.random() * 0.55;
  const pt = curve.getPoint(t);

  mesh.position.set(
    pt.x + (Math.random() - 0.5) * 4,
    1.5 + (spreadAge ? Math.random() * 2.5 : 0),
    pt.z + (Math.random() - 0.5) * 3,
  );
  mesh.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI,
  );

  return {
    mesh,
    vel: new THREE.Vector3(
      (Math.random() - 0.5) * 0.20,
      -0.05 - Math.random() * 0.05,
      (Math.random() - 0.5) * 0.16,
    ),
    rotSpeed: new THREE.Vector3(
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.7,
      (Math.random() - 0.5) * 0.6,
    ),
    age:  spreadAge ? Math.random() * 5 : 0,
    life: 6 + Math.random() * 9,
  };
}
