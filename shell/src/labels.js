const TIER = {
  common: '커먼',
  rare: '레어',
  unique: '유니크',
  epic: '에픽',
  legend: '레전드',
};

export const SCOUT_MARKETS = { KR: '한국', JP: '일본', TW: '대만', US: '미국' };
export const SCOUT_POSITIONS = { ANY: '전체', P: '투수', C: '포수', '1B': '1루수', '2B': '2루수', '3B': '3루수', SS: '유격수', LF: '좌익수', CF: '중견수', RF: '우익수' };

const KIND = {
  offer: '이적 제안',
  renewal: '연봉·재계약',
  news: '소식',
  scout: '스카우트',
};

export function tierLabel(t) {
  return TIER[t] || t || '커먼';
}

export function kindLabel(k) {
  return KIND[k] || k || '안건';
}

export function exactWon(value) {
  return value.toLocaleString('ko-KR') + '원';
}

export function formatWon(value) {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) >= 100_000_000) return `${(value / 100_000_000).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}억 원`;
  if (Math.abs(value) >= 10_000) return `${Math.round(value / 10_000).toLocaleString('ko-KR')}만 원`;
  return `${Math.round(value).toLocaleString('ko-KR')}원`;
}
