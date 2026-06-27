/**
 * Central asset cache — prevents duplicate loads.
 * Supports any Three.js loader via the loadAsync() API.
 */
export class AssetManager {
  constructor() {
    /** @type {Map<string, any>} */
    this._cache = new Map();
  }

  init() {}

  /**
   * Loads an asset via the provided loader and caches it by key.
   * Returns immediately if already cached.
   * @param {string} key     - unique cache key
   * @param {string} url     - asset URL
   * @param {object} loader  - any Three.js loader with loadAsync()
   * @returns {Promise<any>}
   */
  async load(key, url, loader) {
    if (this._cache.has(key)) return this._cache.get(key);
    const asset = await loader.loadAsync(url);
    this._cache.set(key, asset);
    return asset;
  }

  /**
   * Retrieves a previously loaded asset.
   * @param {string} key
   * @returns {any | undefined}
   */
  get(key) {
    return this._cache.get(key);
  }

  /** @param {number} _delta */
  update(_delta) {}

  dispose() {
    this._cache.forEach(asset => asset?.dispose?.());
    this._cache.clear();
  }
}
