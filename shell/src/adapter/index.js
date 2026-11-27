import { createFixtureAdapter } from './fixture.js';
import { createEngineAdapter, loadEngineModule } from './engineBridge.js';

/**
 * Prefer engine-backed adapter when module/preload is available.
 * Falls back to fixture for desktop/dev without engine assets.
 */
export function createAdapter() {
  if (import.meta.env?.DEV && new URLSearchParams(window.location.search).has('fixture')) {
    return createFixtureAdapter();
  }
  return createEngineAdapter();
}

export { createFixtureAdapter, createEngineAdapter, loadEngineModule };
