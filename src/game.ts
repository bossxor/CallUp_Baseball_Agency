export interface ScoutPlayer {
  name: string;
  club: string;
  position: string;
  age: number;
  sample: string;
  stats: string;
  potential: string;
  note: string;
}

export interface WeekSummary {
  week: number;
  games: number;
  headline: string | null;
  kind: 'quiet' | 'scout' | 'callup' | 'offer';
}

export interface GameState {
  version: 1;
  week: number;
  balance: number;
  history: readonly WeekSummary[];
  reportPage: number;
}

interface AdvanceResult {
  state: GameState;
  advanced: number;
  reason: 'complete' | 'important' | 'pending' | 'save-error';
}

export const reportPlayers: readonly ScoutPlayer[] = [
  {
    name: '린보쉰',
    club: '타이중 피너클스 2군',
    position: '우완 선발',
    age: 22,
    sample: '최근 3경기 선발 · 15⅔이닝',
    stats: '평균자책점 2.87 · 탈삼진 17 · 볼넷 4',
    potential: '64–77점 / 100점 · 1군 선발 후보',
    note: '낮게 떨어지는 슬라이더로 헛스윙을 끌어냈다. 투구 수 70개 이후 직구 제구가 흔들리는지 추가 관찰이 필요하다.',
  },
  {
    name: '쉬이청',
    club: '타이난 하버스 2군',
    position: '유격수',
    age: 21,
    sample: '최근 8경기 · 34타석',
    stats: '타율 .310 · 출루율 .412 · 2루타 3개',
    potential: '61–72점 / 100점 · 1군 수비형 유격수 후보',
    note: '박스 안에서 변화구를 잘 골라냈다. 깊은 타구를 잡은 뒤 송구가 한 차례 빠져 수비를 더 살펴볼 계획이다.',
  },
];

// shortcut: Fixture schedule serves the prototype until the league simulation is available.
const headlines: Partial<Record<number, Pick<WeekSummary, 'kind' | 'headline'>>> = {
  4: { kind: 'scout', headline: '스카우트 보고서 도착' },
  7: { kind: 'callup', headline: '소속 선수 서지한, 1군 등록' },
  9: { kind: 'offer', headline: '서지한에게 구단 계약 제안 도착' },
};

export function createGame(): GameState {
  return { version: 1, week: 1, balance: 50_000_000, history: [], reportPage: 0 };
}

export function advanceWeeks(
  state: GameState,
  requested: number,
  persist: (next: GameState) => boolean,
): AdvanceResult {
  const count = Number.isFinite(requested) ? Math.max(1, Math.min(4, Math.trunc(requested))) : 1;
  const limitedByOffer = count > 1 && state.week >= 9 && state.week <= 10;
  const limit = limitedByOffer ? 1 : count;
  let advanced = 0;

  while (advanced < limit) {
    const week = state.week + 1;
    const event = headlines[week] ?? { kind: 'quiet', headline: null };
    const weeklyReport: WeekSummary = { week, games: 12 + (week % 3) * 3, ...event };
    const next = { ...state, week, history: [...state.history, weeklyReport] };
    try {
      if (!persist(next)) return { state, advanced, reason: 'save-error' };
    } catch {
      return { state, advanced, reason: 'save-error' };
    }
    state = next;
    advanced += 1;
    if (weeklyReport.kind !== 'quiet') return { state, advanced, reason: 'important' };
  }
  return { state, advanced, reason: limitedByOffer ? 'pending' : 'complete' };
}

export function moveReportPage(state: GameState, delta: number): GameState {
  if (state.week < 4 || !Number.isFinite(delta)) return state;
  const reportPage = Math.max(0, Math.min(reportPlayers.length - 1, state.reportPage + Math.trunc(delta)));
  return reportPage === state.reportPage ? state : { ...state, reportPage };
}

export function readSave(raw: string | null): GameState | null {
  if (raw === null) return null;
  try {
    const save: Partial<GameState> | null = JSON.parse(raw);
    if (
      !save || save.version !== 1 ||
      typeof save.week !== 'number' || !Number.isSafeInteger(save.week) || save.week < 1 ||
      typeof save.balance !== 'number' || !Number.isSafeInteger(save.balance) || save.balance < 0 ||
      typeof save.reportPage !== 'number' || !Number.isInteger(save.reportPage) ||
      save.reportPage < 0 || save.reportPage >= (save.week < 4 ? 1 : reportPlayers.length) ||
      !Array.isArray(save.history) || save.history.length !== save.week - 1
    ) return null;

    for (const [index, entry] of save.history.entries()) {
      if (!entry || entry.week !== index + 2 || !Number.isSafeInteger(entry.games) || entry.games < 0) return null;
      if (entry.kind !== (headlines[entry.week]?.kind ?? 'quiet')) return null;
      if (entry.kind === 'quiet' ? entry.headline !== null : typeof entry.headline !== 'string' || !entry.headline.trim()) return null;
    }
    return { version: 1, week: save.week, balance: save.balance, history: save.history, reportPage: save.reportPage };
  } catch {
    return null;
  }
}
