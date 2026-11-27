/**
 * Maps CallUp engine game object ↔ shell snapshot.
 * Engine module is loaded lazily from APK public assets.
 */

import {
  clearHasSaveFlag,
  deleteSlot,
  flagHasSave,
  markHasSave,
  slotCandidates,
  writeSlotBlob,
} from './diskSave.js';
import { blobToSaveText, loadStarterWorld, parseSaveBlob, runWeekTick, runWorldGen, serializeWithEngine } from './worldgen.js';

const ENGINE_SAVE_KEY = 'callup-engine-raw-v1';
const ACTIVE_SLOT = 0;
const TIER_RANK = { common: 0, rare: 1, unique: 2, epic: 3, legend: 4 };

const TIER_MAP = {
  0: 'common',
  1: 'rare',
  2: 'unique',
  3: 'epic',
  4: 'legend',
  common: 'common',
  rare: 'rare',
  unique: 'unique',
  epic: 'epic',
  legend: 'legend',
};

function normalizeTier(raw) {
  if (raw == null) return 'common';
  if (typeof raw === 'number') return TIER_MAP[raw] || 'common';
  const s = String(raw).toLowerCase();
  return TIER_MAP[s] || 'common';
}

function clubName(game, player) {
  if (!player || player.club < 0) return '무소속';
  const c = game.clubs?.[player.club];
  return game.agency?.clubNick?.[player.club] || c?.name || `구단 ${player.club}`;
}

function dateLabel(week, mod) {
  return mod?.d?.(week) ?? new Date(Date.UTC(2026, 6, 1 + week * 7)).toISOString().slice(0, 10).replaceAll('-', '.');
}

export function mapGameToSnapshot(game, extras = {}) {
  const agency = game.agency || {};
  const inbox = Array.isArray(game.inbox) ? game.inbox : [];
  const mod = extras.mod;
  const week = game.week ?? 0;
  const scale = mod?.offlineMoneyScale?.('KRW') ?? 1500;
  const describe = (player) => ({
    id: player.id,
    name: player.name,
    pos: player.pos,
    age: mod?.offlineAge?.(player, week) ?? player.age,
    ovr: Math.round(player.ovr ?? 0),
    club: clubName(game, player),
  });
  const moneyText = (value) => String(value ?? '').replace(/¤(-?\d+)¤/g, (_, amount) => `${(Number(amount) * scale).toLocaleString('ko-KR')}원`);
  const entries = inbox
    .filter((m) => m && (!m.done || m.kind === 'scout'))
    .map((m) => ({
      id: String(m.id),
      kind: m.kind || m.type || 'news',
      done: !!m.done,
      tier: normalizeTier(m.tier ?? m.tone ?? m.rarity),
      title: moneyText(m.title || m.name || '안건'),
      body: moneyText(m.body || m.text || m.desc),
      pid: m.pid,
      player: game.players?.[m.pid]?.name,
      expires: Number.isSafeInteger(m.expires) ? m.expires - week : null,
      choices: m.choices?.map(({ label, hint, lock }) => ({ label: moneyText(label), hint: moneyText(hint), lock })) ?? [],
      candidates: m.kind === 'scout' ? Object.entries(m.data ?? {})
        .filter(([key, id]) => /^p\d+$/.test(key) && game.players?.[id])
        .map(([, id]) => describe(game.players[id])) : [],
      terms: m.kind === 'offer' || m.kind === 'renewal' ? {
        club: clubName(game, m.data?.club != null ? { club: m.data.club } : game.players?.[m.pid]),
        wage: Number.isFinite(m.data?.wage) ? m.data.wage * scale : null,
        years: m.data?.years ?? null,
      } : null,
    }));

  const playerMap = game.players && !Array.isArray(game.players) ? game.players : {};
  const clients = Object.keys(agency.clients || {})
    .map((id) => playerMap[id] || playerMap[+id])
    .filter((p) => p && !p.retired)
    .map(describe);

  return {
    agencyName: agency.name || '콜업 에이전시',
    dateLabel: dateLabel(week, mod),
    nextDateLabel: dateLabel(week + 1, mod),
    week,
    year: Math.floor(week / 52) + 1,
    funds: (agency.money ?? 0) * scale,
    agenda: entries.filter((item) => !item.done),
    reports: entries.filter((item) => item.kind === 'scout'),
    clients,
    warnedCommon: !!extras.warnedCommon,
    negoOpen: extras.negoOpen || null,
    source: 'engine',
    saved: extras.saved,
    notice: moneyText(extras.notice),
  };
}

export function canAdvanceFromAgenda(agenda, warnedCommon) {
  const blockers = agenda.filter((a) => TIER_RANK[a.tier] >= TIER_RANK.unique);
  if (blockers.length) {
    return {
      ok: false,
      reason: `중요 안건 ${blockers.length}건을 먼저 처리하세요.`,
      needWarn: false,
    };
  }
  const soft = agenda.filter((a) => TIER_RANK[a.tier] <= TIER_RANK.rare);
  if (soft.length && !warnedCommon) {
    return {
      ok: false,
      reason: '남은 일반 안건을 기본 선택으로 처리합니다.',
      needWarn: true,
    };
  }
  return { ok: true, reason: '', needWarn: false };
}

let engineMod = null;

export async function loadEngineModule() {
  if (engineMod) return engineMod;
  if (typeof window !== 'undefined' && window.CallUpEngine) {
    engineMod = window.CallUpEngine;
    return engineMod;
  }
  try {
    const url = new URL('./assets/engine-DhPc-c_J.js', window.location.href).href;
    engineMod = await import(/* @vite-ignore */ url);
    if (typeof window !== 'undefined') window.CallUpEngine = engineMod;
    return engineMod;
  } catch (err) {
    console.warn('engine module load failed', err);
    return null;
  }
}

export function readRawSave() {
  try {
    return localStorage.getItem(ENGINE_SAVE_KEY);
  } catch {
    return null;
  }
}

export function writeRawSave(raw) {
  localStorage.setItem(ENGINE_SAVE_KEY, raw);
}

export function clearRawSave() {
  localStorage.removeItem(ENGINE_SAVE_KEY);
}

export function serializeGame(game) {
  // Engine saves are JSON; players may be object map.
  return JSON.stringify(game);
}

export async function parseRawSave(raw) {
  const mod = await loadEngineModule();
  if (mod?.offlineParseSave) {
    return mod.offlineParseSave(raw);
  }
  return JSON.parse(raw);
}

function validGame(game) {
  return game?.agency && Number.isSafeInteger(game.week) && Array.isArray(game.clubs)
    && game.players && !Array.isArray(game.players) && !Array.isArray(game.players.rows);
}

async function parseCandidate(mod, candidate) {
  let raw = candidate.raw;
  if (candidate.blob) {
    try { return await parseSaveBlob(mod, candidate.blob); }
    catch { raw = await blobToSaveText(candidate.blob); }
  }
  try {
    return mod.offlineParseSave(raw);
  } catch (error) {
    const legacy = JSON.parse(raw);
    if (!validGame(legacy) || !legacy.agency.callupBaseball1) throw error;
    return legacy;
  }
}

export function createEngineAdapter() {
  let game = null;
  let warnedCommon = false;
  let negoOpen = null;
  let mod = null;
  let saved = false;
  let notice = '';
  let saveProbe;

  const snap = () => game && mapGameToSnapshot(game, { mod, warnedCommon, negoOpen, saved, notice });
  const requireEngine = async () => {
    mod ||= await loadEngineModule();
    if (!mod?.eA || !mod?.eK || !mod?.bC || !mod?.offlineParseSave) throw new Error('게임 엔진을 불러오지 못했습니다.');
    return mod;
  };

  const persist = async () => {
    saved = false;
    try {
      const packed = await serializeWithEngine(mod, game);
      let blob = packed.blob;
      if (!blob) {
        const stream = new Blob([packed.text]).stream().pipeThrough(new CompressionStream('gzip'));
        blob = await new Response(stream).blob();
      }
      saved = await writeSlotBlob(blob, ACTIVE_SLOT);
      if (saved) clearRawSave();
    } catch (error) {
      console.warn('Save write failed', error);
    }
    return snap();
  };

  async function* candidates() {
    yield* slotCandidates();
    const raw = readRawSave();
    if (raw) yield { raw };
  }

  function resolve(targetGame, item, choice) {
    if (item.kind === 'offer' && (!item.data || !targetGame.players?.[item.pid])) {
      item.done = true;
      return '테스트 제안을 닫았습니다.';
    }
    return mod.bC(targetGame, item.id, choice);
  }

  return {
    mode: 'engine',

    hasSave() {
      return saved || flagHasSave() || Boolean(readRawSave());
    },

    probeHasSave() {
      return saveProbe ||= (async () => {
        for await (const candidate of candidates()) {
          if (candidate.raw) return true;
          const header = new Uint8Array(await candidate.blob.slice(0, 2).arrayBuffer());
          if (header[0] === 31 && header[1] === 139) return true;
        }
        clearHasSaveFlag();
        return false;
      })();
    },

    async newGame(opts = {}, onProgress, onReady) {
      await requireEngine();
      const world = await loadStarterWorld(mod, opts) ?? await runWorldGen(mod, opts, onProgress);
      if (!validGame(world)) throw new Error('월드를 생성하지 못했습니다.');
      game = world;
      warnedCommon = false;
      negoOpen = null;
      notice = '';
      saved = undefined;
      onReady?.(snap());
      return persist();
    },

    async loadSave() {
      await requireEngine();
      for await (const candidate of candidates()) {
        try {
          const loaded = await parseCandidate(mod, candidate);
          if (!validGame(loaded)) continue;
          game = loaded;
          warnedCommon = false;
          negoOpen = null;
          saved = true;
          notice = '';
          markHasSave();
          return snap();
        } catch (error) {
          console.warn('Could not read this save copy', error);
        }
      }
      throw new Error('저장을 불러오지 못했습니다. 파일을 확인한 뒤 다시 시도하세요.');
    },

    async saveGame() {
      return game ? persist() : null;
    },

    async resetSave() {
      for (const slot of [0, 1, 2, 3]) await deleteSlot(slot);
      clearRawSave();
      clearHasSaveFlag();
      saveProbe = null;
      saved = false;
      game = negoOpen = null;
    },

    getSnapshot: snap,
    listAgenda: () => snap()?.agenda ?? [],
    listClients: () => snap()?.clients ?? [],

    openNegotiation(agendaId) {
      const item = snap()?.agenda.find((entry) => entry.id === String(agendaId) && entry.terms);
      negoOpen = item ?? null;
      return negoOpen;
    },

    async resolveAgenda(id, action = 'dismiss') {
      const item = game?.inbox?.find((entry) => String(entry.id) === String(id) && !entry.done);
      if (!item) return snap();
      if (action === 'negotiate') {
        this.openNegotiation(id);
        return snap();
      }
      const choice = Number.isInteger(action) ? action : item.def ?? 0;
      notice = resolve(game, item, choice) || '';
      return persist();
    },

    canAdvance() {
      return canAdvanceFromAgenda(snap()?.agenda ?? [], warnedCommon);
    },

    async confirmAdvanceWarn() {
      warnedCommon = true;
      return snap();
    },

    async advanceWeek() {
      if (!game || !this.canAdvance().ok) return snap();
      await requireEngine();
      const next = structuredClone(game);
      for (const item of next.inbox ?? []) {
        if (item.done || TIER_RANK[normalizeTier(item.tier ?? item.tone ?? item.rarity)] > TIER_RANK.rare) continue;
        if (item.kind === 'offer' || item.kind === 'renewal') resolve(next, item, 2);
        else if (Number.isInteger(item.def) || !item.choices?.length) resolve(next, item, item.def ?? 0);
      }
      await runWeekTick(mod, next);
      game = next;
      warnedCommon = false;
      notice = '';
      return persist();
    },

    async closeNegotiation(result = 'cancel') {
      if (!negoOpen) return snap();
      const id = negoOpen.id;
      negoOpen = null;
      if (result === 'cancel') return snap();
      return this.resolveAgenda(id, result === 'deal' ? 0 : result === 'counter' ? 1 : 2);
    },

    async cheat(cmd) {
      if (!game) return null;
      if (cmd === 'money') mod.offlineCheat?.(game, 'money', null, new URLSearchParams({ money: '100000000' }), 'KRW');
      if (cmd === 'clearAgenda') for (const item of game.inbox) item.done = true;
      if (cmd === 'addUnique') {
        game.inbox.push({ id: Date.now(), kind: 'offer', tier: 'unique', title: '테스트 제안', body: '개발용 안건', done: false });
      }
      return persist();
    },
  };
}
