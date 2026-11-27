/**
 * Engine generators: worldgen eA (TU), week tick eK (JN).
 */

/** Run one in-place week tick. Mutates `game`. Returns week after tick. */
export async function runWeekTick(mod, game) {
  if (!mod?.eK || !Number.isSafeInteger(game?.week)) throw new Error('주간 진행을 시작할 수 없습니다.');
  const before = game.week;
  const gen = mod.eK(game);
  let slice = performance.now();
  for (let steps = 0; steps < 50_000; steps++) {
    if (gen.next().done) {
      if (game.week !== before + 1) throw new Error('이번 주를 진행할 수 없습니다.');
      return game.week;
    }
    if (performance.now() - slice >= 12) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      slice = performance.now();
    }
  }
  gen.return?.();
  throw new Error('주간 진행이 끝나지 않았습니다.');
}

export async function runWorldGen(mod, opts = {}, onProgress) {
  if (!mod?.eA) return null;
  const gen = mod.eA({
    agent: opts.agent || '김야구',
    nat: opts.nat || '대한민국',
    agencyName: opts.agencyName || '콜업 에이전시',
    logo: opts.logo,
    seed: opts.seed,
    worldSeed: opts.worldSeed,
  });

  let step = gen.next();
  let slice = performance.now();
  while (!step.done) {
    if (typeof onProgress === 'function' && step.value != null) {
      onProgress(step.value);
    }
    if (performance.now() - slice >= 12) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      slice = performance.now();
    }
    step = gen.next();
  }

  const game = step.value;
  if (!game) return null;

  try {
    if (typeof mod.eD === 'function') mod.eD(game);
  } catch {
    /* first scout optional */
  }

  game.settings = game.settings || {};
  game.settings.lang = opts.lang || game.settings.lang || 'ko';

  if (game.agency) {
    game.agency.callupBaseball1 = true;
    game.agency.callupAnnual1 = true;
    game.agency.tutDone = 1;
  }

  return game;
}

/** Gunzip engine save Blob → UTF-8 JSON text for offlineParseSave. */
async function blobToSaveText(blob) {
  if (!blob || typeof blob.stream !== 'function') return null;
  if (typeof DecompressionStream === 'undefined') {
    // WebView without gzip stream: try plain text (legacy/uncompressed)
    try {
      return await blob.text();
    } catch {
      return null;
    }
  }
  try {
    return await new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).text();
  } catch {
    try {
      return await blob.text();
    } catch {
      return null;
    }
  }
}

/** Prefer engine gzip Blob (cy). Fallback JSON text. */
export async function serializeWithEngine(mod, game) {
  if (mod?.cy && typeof mod.cy === 'function') {
    try {
      const blob = await mod.cy(game, () => false);
      if (blob && blob.size > 10) return { kind: 'blob', blob };
    } catch (err) {
      console.warn('cy serialize failed', err);
    }
  }
  if (mod?.cz && typeof mod.cz === 'function') {
    try {
      const blob = await mod.cz(game);
      if (blob && blob.size > 10) return { kind: 'blob', blob };
    } catch {
      /* fall through */
    }
  }
  return { kind: 'text', text: JSON.stringify(game) };
}

export async function parseSaveBlob(mod, blob) {
  if (!blob) return null;
  if (mod?.cA && typeof mod.cA === 'function') {
    try {
      return await mod.cA(blob);
    } catch (err) {
      console.warn('cA parse failed', err);
    }
  }
  const text = await blobToSaveText(blob);
  if (!text) return null;
  if (mod?.offlineParseSave) return mod.offlineParseSave(text);
  return JSON.parse(text);
}

export { blobToSaveText };
