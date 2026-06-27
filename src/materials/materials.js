import * as THREE from 'three';

/**
 * Shared material library — singletons reused across all environment builders.
 * Do NOT duplicate these; geometries should reference these by name.
 * All materials use MeshStandardMaterial for physically-correct PBR lighting.
 */
export const mat = Object.freeze({
  /** Warm ivory limestone — primary ground surface */
  limestone: new THREE.MeshStandardMaterial({
    color:     0xc8b896,
    roughness: 0.92,
    metalness: 0.0,
  }),

  /** Slightly lighter & smoother — walking path surface */
  pathStone: new THREE.MeshStandardMaterial({
    color:     0xd8cca8,
    roughness: 0.76,
    metalness: 0.0,
  }),

  /** Warm aged limestone — arch and stone structures */
  archStone: new THREE.MeshStandardMaterial({
    color:     0xbcad8a,
    roughness: 0.88,
    metalness: 0.0,
  }),

  /** Dark-green dense foliage — Italian Cypress, Boxwood */
  foliageDark: new THREE.MeshStandardMaterial({
    color:     0x243318,
    roughness: 0.92,
    metalness: 0.0,
  }),

  /** Silver-green — Olive tree canopy */
  foliageOlive: new THREE.MeshStandardMaterial({
    color:     0x7a8c5a,
    roughness: 0.88,
    metalness: 0.0,
  }),

  /** Hedge — slightly lighter dense green */
  foliageHedge: new THREE.MeshStandardMaterial({
    color:     0x1e3214,
    roughness: 0.90,
    metalness: 0.0,
    side:      THREE.FrontSide,
  }),

  /** Aged bark — tree trunks */
  bark: new THREE.MeshStandardMaterial({
    color:     0x4a3828,
    roughness: 0.96,
    metalness: 0.0,
  }),

  /** Natural dark soil */
  soil: new THREE.MeshStandardMaterial({
    color:     0x5c4a35,
    roughness: 0.98,
    metalness: 0.0,
  }),
});
