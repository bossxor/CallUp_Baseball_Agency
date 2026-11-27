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

import { SCOUT_MARKETS, SCOUT_POSITIONS } from '../labels.js';

const FACILITIES = ['scout', 'admin', 'medical', 'training'];
const ENGINE_SAVE_KEY = 'callup-engine-raw-v1';
const ACTIVE_SLOT = 0;
const SCOUT_CONTRACT = { years: 2, fee: .05 };
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

function moneyLabel(value, scale) {
  return String(value ?? '').replace(/¤(-?\d+)¤/g, (_, amount) => (Number(amount) * scale).toLocaleString('ko-KR') + '원');
}

function scoutFilter(region, pos) {
  return { region, pos, ageMax: 23, tier: 0, grade: 'all', age: 'base' };
}

function scoutIds(report) {
  return Object.entries(report.data ?? {}).filter(([key]) => /^p\d+$/.test(key)).map(([, id]) => id);
}

function upgrades(game, mod, scale) {
  if (!mod?.ex) return [];
  const reputation = mod.b1(game.agency);
  return FACILITIES.map((id) => {
    const level = mod.ad(game, id);
    const facility = mod.bY[id];
    const next = level < mod.e7 ? level + 1 : null;
    return {
      id, level, name: facility.name, description: facility.desc(level),
      next, requiredRep: next ? mod.el(next) : null, reputation,
      cost: next ? mod.e6(game, id, next) * scale : null,
    };
  });
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
  const describeCandidate = (player) => ({
    ...describe(player),
    contracted: Boolean(agency.clients?.[player.id]),
    contract: mod?.w && !player.retired && player.agent !== 2 ? {
      years: SCOUT_CONTRACT.years,
      fee: SCOUT_CONTRACT.fee,
      cost: mod.A && mod.B ? (mod.A(game, player, SCOUT_CONTRACT.years) + mod.B(player)) * scale : null,
    } : null,
  });
  const moneyText = (value) => moneyLabel(value, scale);
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
      candidates: m.kind === 'scout' ? scoutIds(m).map((id) => game.players?.[id])
        .filter((player) => player && !player.retired).map(describeCandidate) : [],
      terms: m.kind === 'offer' || m.kind === 'renewal' ? {
        club: clubName(game, m.data?.club != null ? { club: m.data.club } : game.players?.[m.pid]),
        wage: Number.isFinite(m.data?.wage) ? m.data.wage * scale : null,
        years: m.data?.years ?? null,
        fee: Number.isFinite(m.data?.fee) ? m.data.fee * scale : null,
        seasonSalary: Boolean(m.data?.seasonEnd),
      } : null,
    }));

  const playerMap = game.players && !Array.isArray(game.players) ? game.players : {};
  const clients = Object.keys(agency.clients || {})
    .map((id) => playerMap[id] || playerMap[+id])
    .filter((p) => p && !p.retired)
    .map(describe);

  const missions = agency.missions ?? [];
  return {
    agencyName: agency.name || '콜업 에이전시',
    dateLabel: dateLabel(week, mod),
    nextDateLabel: dateLabel(week + 1, mod),
    week,
    year: Math.floor(week / 52) + 1,
    funds: (agency.money ?? 0) * scale,
    agenda: entries.filter((item) => !item.done),
    reports: entries.filter((item) => item.kind === 'scout'),
    scouting: mod?.c_ ? {
      markets: mod.cE().filter((region) => Object.hasOwn(SCOUT_MARKETS, region)),
      positionLevel: mod.cK,
      canPickPosition: mod.cL(agency.fac?.scout ?? 1),
      capacity: mod.cF?.(agency),
      occupied: missions.filter((mission) => !mission.ad).length
        + inbox.filter((item) => item?.kind === 'scout' && !item.done && item.data?.held && !item.data.ad && !item.data.gift).length,
      missions: missions.map((mission) => ({
        id: mission.id,
        region: mission.filter?.region,
        pos: mission.filter?.pos,
        // The engine delivers during back; the player sees the report on the next date.
        returnDate: dateLabel(mission.back + 1, mod),
      })),
    } : null,
    facilities: upgrades(game, mod, scale),
    ledger: (agency.ledger ?? []).slice(-12).reverse().map(({ w, text, amt }) => ({
      date: dateLabel(w, mod), label: moneyText(text), amount: amt * scale,
    })),
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
  let table = null;
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
      table = negoOpen = null;
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
          table = negoOpen = null;
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
      game = table = negoOpen = null;
    },

    getSnapshot: snap,
    listAgenda: () => snap()?.agenda ?? [],
    listClients: () => snap()?.clients ?? [],

    playerHistory(id) {
      const player = game?.players?.[id];
      if (!player) return null;
      const client = game.agency.clients?.[id];
      const scale = mod.offlineMoneyScale?.('KRW') ?? 1500;
      return {
        signed: Number.isSafeInteger(client?.since) ? dateLabel(client.since, mod) : null,
        end: Number.isSafeInteger(client?.until) ? dateLabel(client.until, mod) : null,
        moves: (player.timeline ?? []).filter((event) => event.kind === 'move' && Number.isSafeInteger(event.w))
          .slice(-12).reverse().map((event) => ({ date: dateLabel(event.w, mod), text: moneyLabel(event.text, scale) })),
      };
    },

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

    quoteScout(region, pos) {
      if (!game || !mod?.c_ || !Object.hasOwn(SCOUT_MARKETS, region) || !mod.cE().includes(region)
        || !Object.hasOwn(SCOUT_POSITIONS, pos) || (pos !== 'ANY' && !mod.cL(game.agency.fac?.scout ?? 1))) return null;
      const filter = scoutFilter(region, pos);
      const scale = mod.offlineMoneyScale?.('KRW') ?? 1500;
      return { cost: mod.cH(game.agency, filter) * scale, weeks: mod.cY(game.agency, filter) + 1 };
    },

    async dispatchScout(region, pos) {
      if (!this.quoteScout(region, pos)) throw new Error('파견 지역과 포지션을 다시 선택하세요.');
      const reason = mod.c_(game, scoutFilter(region, pos));
      notice = reason || (SCOUT_MARKETS[region] + '에 스카우트를 보냈습니다.');
      return reason ? snap() : persist();
    },

    async upgradeFacility(id) {
      if (!game || !mod?.ex || !FACILITIES.includes(id)) throw new Error('시설을 다시 선택하세요.');
      const reason = mod.ex(game, id);
      notice = reason || (mod.bY[id].name + ' Lv.' + mod.ad(game, id) + ' 업그레이드 완료');
      return reason ? snap() : persist();
    },

    async signScoutCandidate(reportId, candidateId) {
      const report = game?.inbox?.find((item) => String(item.id) === String(reportId) && item.kind === 'scout');
      if (!report || !scoutIds(report).includes(candidateId) || !game.players?.[candidateId] || !mod?.w) {
        throw new Error('이 보고서에서 선수에게 계약을 제안할 수 없습니다.');
      }
      const result = mod.w(game, candidateId, SCOUT_CONTRACT);
      if (result.ok && scoutIds(report).every((id) => game.agency.clients[id] || game.players[id]?.retired)) {
        report.done = true;
      }
      notice = result.text;
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

    startNegotiation() {
      if (!game || !negoOpen || table || negoOpen.terms?.seasonSalary) return snap();
      const next = structuredClone(game);
      const item = next.inbox.find((entry) => String(entry.id) === negoOpen.id && !entry.done);
      if (!item?.data || !next.players[item.pid]) throw new Error('제안 조건을 다시 확인하세요.');
      const deal = item.kind === 'renewal' ? mod.dr(next, item)
        : item.data.aucFee ? mod.ds(next, item, item.data.aucFee) : mod.dt(next, item);
      if (!deal) throw new Error('현재는 이 제안으로 협상을 시작할 수 없습니다.');
      table = { next, deal };
      return this.negotiationRound();
    },

    async negotiationRound(action, tactic) {
      if (!table || !negoOpen) return snap();
      const { next, deal } = table;
      if (action === 'accept') mod.dK(next, deal);
      else if (action === 'leave') mod.dH(next, deal);
      else if (action === 'duration') mod.dI(next, deal);
      else if (action === 'keepDuration') mod.dJ(deal);
      else if (action === 'clause' && Object.hasOwn(mod.dh, tactic) && mod.dj(deal, tactic)) mod.dF(next, deal, tactic);
      else if (action === 'demand' && mod.dy(next, deal)
        && mod.dD(next, deal).includes(tactic) && !deal.used.includes(tactic)) mod.dG(next, deal, tactic);
      const scale = mod.offlineMoneyScale?.('KRW') ?? 1500;
      if (deal.state !== 'open') {
        game = next;
        table = negoOpen = null;
        notice = deal.result || '협상을 마쳤습니다.';
        return persist();
      }
      const tactics = mod.dy(next, deal) ? mod.dD(next, deal).filter((id) => !deal.used.includes(id)) : [];
      negoOpen = { ...negoOpen, live: {
        phase: deal.phase, offer: deal.offer * scale, fee: deal.fee * scale, years: deal.years,
        patience: deal.patience,
        durationOffer: deal.yOffer && mod.dB(deal) ? { years: deal.yOffer.y, wage: deal.yOffer.wage * scale } : null,
        clauses: Object.entries(mod.dh).filter(([id]) => mod.dj(deal, id)).map(([id, data]) => ({ id, ...data })),
        agreedClauses: (deal.clauses ?? []).map((id) => mod.dh[id]?.label ?? id),
        lines: deal.lines.slice(-6).map(({ text, who }) => ({ text: moneyLabel(text, scale), who })),
        tactics: tactics.map((id) => ({ id, label: mod.dk[id].label })),
      } };
      return snap();
    },

    async closeNegotiation(result = 'cancel') {
      if (!negoOpen) return snap();
      const id = negoOpen.id;
      negoOpen = null;
      table = null;
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
