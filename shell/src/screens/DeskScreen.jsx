import { formatWon, kindLabel } from '../labels.js';

const urgent = new Set(['unique', 'epic', 'legend']);

export default function DeskScreen({ route, agenda, week, funds, onOpen }) {
  const brief = route === 'brief';
  const scouting = route === 'scout';
  const rows = agenda.filter((item) => brief || (scouting ? item.kind === 'scout' : item.terms))
    .sort((a, b) => (a.expires ?? Infinity) - (b.expires ?? Infinity) || Number(urgent.has(b.tier)) - Number(urgent.has(a.tier)));

  return (
    <>
      <div className="page-title">
        <h1>{brief ? '주간 브리핑' : scouting ? '스카우트' : '계약'}</h1>
        {brief && <span className="week-number">{String(week + 1).padStart(2, '0')}<small>주차</small></span>}
      </div>
      {brief && <dl className="brief-stats">
        <div><dt>운영 자금</dt><dd>{formatWon(funds)}</dd></div>
        <div><dt>처리 필요</dt><dd>{rows.filter((item) => urgent.has(item.tier)).length}건</dd></div>
      </dl>}
      <section className="register" aria-label={brief ? '처리할 안건' : scouting ? '받은 보고서' : '받은 제안'}>
        <header className="register-head">
          <h2>{brief ? '처리할 안건' : scouting ? '받은 보고서' : '받은 제안'}</h2>
          <span>{rows.length}건</span>
        </header>
        {rows.length ? <ul className="records">
          {rows.map((item) => <li key={item.id}>
            <button className="record" onClick={() => onOpen(item)}>
              <span className="record-type">{urgent.has(item.tier) && <i aria-label="중요" />}{kindLabel(item.kind)}</span>
              <span className="record-main"><strong>{item.title}</strong>
                {item.terms && !brief ? (
                  <span className="offer-line">{[item.terms.club, item.terms.wage != null ? formatWon(item.terms.wage) : null, item.terms.years ? `${item.terms.years}년` : null].filter(Boolean).join(' · ')}</span>
                ) : scouting && item.candidates?.length ? (
                  <span>{item.candidates.map((candidate) => candidate.name).join(', ')}</span>
                ) : item.body ? <span>{item.body}</span> : null}
              </span>
              <span className="record-end">{item.expires != null && <small>{item.expires > 0 ? `${item.expires}주 남음` : '마감 임박'}</small>}<b aria-hidden="true">›</b></span>
            </button>
          </li>)}
        </ul> : <p className="empty">{brief ? '이번 주에 처리할 안건이 없습니다.' : scouting ? '도착한 스카우트 보고서가 없습니다.' : '검토할 계약 제안이 없습니다.'}</p>}
      </section>
    </>
  );
}
