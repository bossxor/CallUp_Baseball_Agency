const SAVE_KEY = 'callup-shell-fixture-v1';

const TIER_RANK = { common: 0, rare: 1, unique: 2, epic: 3, legend: 4 };

function seedState() {
  return {
    agencyName: '콜업 에이전시',
    week: 28,
    year: 1,
    funds: 600_000_000,
    warnedCommon: false,
    agenda: [
      {
        id: 'a1',
        kind: 'offer',
        tier: 'unique',
        title: '남선우 이적 제안',
        body: '고척에서 제안이 도착했습니다.',
        expires: 1,
        terms: { club: '고척', wage: 180_000_000, years: 2 },
        pid: 1,
        done: false,
      },
      {
        id: 'a4',
        kind: 'scout',
        tier: 'common',
        title: '국내 스카우트 보고서',
        body: '내야수 후보 1명',
        candidates: [{ id: 4, name: '이도현', age: 19, pos: 'SS', ovr: 58 }],
        done: false,
      },
      {
        id: 'a2',
        kind: 'news',
        tier: 'rare',
        title: '성장 급등',
        body: '남선우 OVR이 이번 시즌 +3 올랐어요.',
        pid: 1,
        done: false,
      },
      {
        id: 'a3',
        kind: 'news',
        tier: 'common',
        title: '라커룸 소식',
        body: '남선우, 구단 식당 반찬을 두 번 받다 영양사에게 걸렸어요.',
        pid: 1,
        done: false,
      },
    ],
    clients: [
      {
        id: 1,
        name: '남선우',
        pos: 'RF',
        age: 19,
        ovr: 63,
        club: '잠실',
      },
    ],
    negoOpen: null,
  };
}

function loadRaw() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function persist(state) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function dateLabel(state) {
  const month = Math.min(12, Math.floor(((state.week - 1) % 52) / 4.3) + 1);
  const day = 1 + ((state.week * 7) % 28);
  return `2026.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
}

function toSnapshot(state) {
  return {
    agencyName: state.agencyName,
    dateLabel: dateLabel(state),
    week: state.week,
    year: state.year,
    funds: state.funds,
    saved: true,
    agenda: state.agenda.filter((a) => !a.done),
    clients: state.clients,
    warnedCommon: !!state.warnedCommon,
    negoOpen: state.negoOpen,
  };
}

function openAgenda(state) {
  return state.agenda.filter((a) => !a.done);
}

function canAdvanceInfo(state) {
  const open = openAgenda(state);
  const blockers = open.filter((a) => TIER_RANK[a.tier] >= TIER_RANK.unique);
  if (blockers.length) {
    return {
      ok: false,
      reason: `유니크 이상 안건 ${blockers.length}건을 먼저 처리하세요.`,
      needWarn: false,
    };
  }
  const soft = open.filter((a) => TIER_RANK[a.tier] <= TIER_RANK.rare);
  if (soft.length && !state.warnedCommon) {
    return {
      ok: false,
      reason: '남은 일반 안건을 기본 선택으로 처리합니다.',
      needWarn: true,
    };
  }
  return { ok: true, reason: '', needWarn: false };
}

/** @type {import('./index.js').CallupAdapter} */
export function createFixtureAdapter() {
  let state = loadRaw() || null;

  return {
    hasSave() {
      return !!loadRaw() || !!state;
    },

    async newGame(opts = {}) {
      state = seedState();
      if (opts.agencyName) state.agencyName = opts.agencyName;
      persist(state);
      return toSnapshot(state);
    },

    async loadSave() {
      state = loadRaw() || seedState();
      persist(state);
      return toSnapshot(state);
    },

    async resetSave() {
      localStorage.removeItem(SAVE_KEY);
      state = null;
    },

    getSnapshot() {
      if (!state) return null;
      return toSnapshot(state);
    },

    listAgenda() {
      if (!state) return [];
      return openAgenda(state);
    },

    async resolveAgenda(id, action = 'dismiss') {
      if (!state) return null;
      const item = state.agenda.find((a) => a.id === id);
      if (!item || item.done) return toSnapshot(state);
      if (action === 'negotiate' && (item.kind === 'offer' || item.kind === 'renewal')) {
        state.negoOpen = { ...item, agendaId: id };
        persist(state);
        return toSnapshot(state);
      }
      item.done = true;
      if (action === 'accept' && item.kind === 'offer') {
        state.funds += 5_000_000;
      }
      persist(state);
      return toSnapshot(state);
    },

    canAdvance() {
      if (!state) return { ok: false, reason: '세이브 없음', needWarn: false };
      return canAdvanceInfo(state);
    },

    async confirmAdvanceWarn() {
      if (!state) return null;
      state.warnedCommon = true;
      persist(state);
      return toSnapshot(state);
    },

    async advanceWeek() {
      if (!state) return null;
      const gate = canAdvanceInfo(state);
      if (!gate.ok && !gate.needWarn) return toSnapshot(state);
      if (gate.needWarn && !state.warnedCommon) return toSnapshot(state);

      // Safety default: dismiss remaining common/rare (not random).
      for (const a of openAgenda(state)) {
        if (TIER_RANK[a.tier] <= TIER_RANK.rare) a.done = true;
      }
      state.week += 1;
      if (state.week > 52) {
        state.week = 1;
        state.year += 1;
      }
      state.warnedCommon = false;
      state.agenda.push({
        id: `w${state.week}-n`,
        kind: 'news',
        tier: 'common',
        title: `${state.week}주차 브리핑`,
        body: '주간 리포트가 도착했습니다.',
        done: false,
      });
      persist(state);
      return toSnapshot(state);
    },

    listClients() {
      return state?.clients ?? [];
    },

    openNegotiation(agendaId) {
      if (!state) return null;
      const item = state.agenda.find((a) => a.id === agendaId);
      if (!item) return null;
      state.negoOpen = { ...item, agendaId };
      persist(state);
      return state.negoOpen;
    },

    async closeNegotiation(result = 'done') {
      if (!state?.negoOpen) return toSnapshot(state);
      const id = state.negoOpen.agendaId;
      const item = state.agenda.find((a) => a.id === id);
      if (item && result !== 'cancel') item.done = true;
      if (result === 'deal') state.funds += 12_000_000;
      state.negoOpen = null;
      persist(state);
      return toSnapshot(state);
    },

    async cheat(cmd) {
      if (!state) return null;
      if (cmd === 'money') state.funds += 100_000_000;
      if (cmd === 'clearAgenda') {
        for (const a of state.agenda) a.done = true;
      }
      if (cmd === 'addUnique') {
        state.agenda.push({
          id: `cheat-${Date.now()}`,
          kind: 'offer',
          tier: 'unique',
          title: '치트 제안',
          body: '개발용 유니크 안건',
          pid: state.clients[0]?.id,
          done: false,
        });
      }
      persist(state);
      return toSnapshot(state);
    },
  };
}
