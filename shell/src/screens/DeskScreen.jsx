import { useState } from 'react';
import { exactWon, formatWon, kindLabel, SCOUT_MARKETS, SCOUT_POSITIONS } from '../labels.js';

const urgent = new Set(['unique', 'epic', 'legend']);

function ScoutDispatch({ scouting, funds, busy, quoteScout, onDispatch, onFacilities }) {
  const [region, setRegion] = useState(scouting.markets[0]);
  const [position, setPosition] = useState('ANY');
  const [age, setAge] = useState('base');
  const [grade, setGrade] = useState('all');
  const [tier, setTier] = useState(0);
  const pos = scouting.canPickPosition ? position : 'ANY';
  const criteria = { region, pos, age, grade, tier };
  const quote = quoteScout(criteria);
  const insufficient = quote && quote.cost > funds;
  const full = scouting.occupied >= scouting.capacity;

  return (
    <section className="register" aria-labelledby="dispatch-title">
      <header className="register-head">
        <h2 id="dispatch-title">스카우트 파견</h2>
        <span>사용 중 {scouting.occupied}/{scouting.capacity}팀</span>
      </header>
      <form className="scout-dispatch" onSubmit={(event) => {
        event.preventDefault();
        if (!busy && quote && !insufficient && !full) onDispatch(criteria);
      }}>
        <div className="scout-fields">
          <label>지역<select value={region} onChange={(event) => setRegion(event.target.value)}>
            {scouting.markets.map((market) => <option key={market} value={market}>{SCOUT_MARKETS[market]}</option>)}
          </select></label>
          <label>포지션<select value={pos} disabled={!scouting.canPickPosition} onChange={(event) => setPosition(event.target.value)}>
            {Object.entries(SCOUT_POSITIONS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select></label>
        </div>
        {!scouting.canPickPosition && (
          <div className="scout-lock">
            <small>Lv.{scouting.positionLevel}부터 포지션 지정</small>
            <button className="quiet" type="button" onClick={onFacilities}>시설 관리</button>
          </div>
        )}
        <details className="scout-options">
          <summary>파견 조건 더 보기</summary>
          <div className="scout-fields">
            <label>연령대<select value={age} onChange={(event) => setAge(event.target.value)}>
              {scouting.ages.map((option) => <option key={option.id} value={option.id} disabled={option.locked}>
                {option.label}{option.locked ? ' · 스카우트실 Lv.5' : ''}
              </option>)}
            </select></label>
            <label>선수 수준<select value={grade} onChange={(event) => setGrade(event.target.value)}>
              {scouting.grades[age].map((option) => <option key={option.id} value={option.id} disabled={option.locked}>
                {option.label}{option.locked ? ' · Lv.' + option.required : ''}
              </option>)}
            </select></label>
            <label>파견 등급<select value={tier} onChange={(event) => setTier(Number(event.target.value))}>
              {scouting.tiers.map((option) => <option key={option.id} value={option.id} disabled={option.locked}>
                {option.label}{option.locked ? ' · 평판 Lv.' + option.required : ''}
              </option>)}
            </select></label>
          </div>
        </details>
        {quote && <div className="scout-quote" aria-live="polite">
          <strong>{exactWon(quote.cost)} · {quote.weeks}주</strong>
          <span>{quote.returnDate} 귀환{insufficient && ' · 자금 부족'}</span>
        </div>}
        <button className="primary" type="submit" disabled={busy || !quote || insufficient || full}>파견 보내기</button>
        {full && <small>받은 보고서 검토를 마치면 파견 자리가 비워집니다.</small>}
      </form>
      {scouting.missions.length > 0 && <ul className="scout-missions" aria-label="파견 중">
        {scouting.missions.map((mission) => <li key={mission.id}>
          <div>
            <strong>{SCOUT_MARKETS[mission.region] ?? mission.region} · {SCOUT_POSITIONS[mission.pos] ?? mission.pos}</strong>
            {mission.details && <small>{mission.details}</small>}
          </div>
          <span>{mission.returnDate} 귀환</span>
        </li>)}
      </ul>}
    </section>
  );
}

export default function DeskScreen({ route, agenda, week, funds, onOpen, scouting, busy, quoteScout, onDispatch, onFacilities, onCompare, onLeagues }) {
  const brief = route === 'brief';
  const isScout = route === 'scout';
  const rows = agenda.filter((item) => brief || (isScout ? item.kind === 'scout' : item.terms))
    .sort((a, b) => isScout ? Number(b.id) - Number(a.id) : (a.expires ?? Infinity) - (b.expires ?? Infinity) || Number(urgent.has(b.tier)) - Number(urgent.has(a.tier)));

  const byPlayer = new Map();
  if (route === 'contracts') {
    for (const row of rows) {
      if (row.kind !== 'offer' || !row.player) continue;
      if (!byPlayer.has(row.pid)) byPlayer.set(row.pid, []);
      byPlayer.get(row.pid).push(row);
    }
  }
  const comparisons = [...byPlayer.values()].filter((offers) => new Set(offers.map((offer) => offer.terms.club)).size > 1);

  return (
    <>
      {brief ? (
        <section className="brief-cover" aria-labelledby="brief-title">
          <div className="brief-heading">
            <h1 id="brief-title">주간 브리핑</h1>
            <span className="week-number">{String(week + 1).padStart(2, '0')}<small>주차</small></span>
          </div>
          <dl className="brief-stats">
            <div><dt>운영 자금</dt><dd>{formatWon(funds)}</dd></div>
            <div><dt>처리 필요</dt><dd>{rows.filter((item) => urgent.has(item.tier)).length}건</dd></div>
          </dl>
        </section>
      ) : <div className="page-title"><h1>{isScout ? '스카우트' : '계약'}</h1></div>}
      {brief && onLeagues && <div className="brief-links"><button className="secondary" onClick={onLeagues}>리그 순위</button></div>}
      {isScout && scouting?.markets.length > 0 && <ScoutDispatch scouting={scouting} funds={funds} busy={busy} quoteScout={quoteScout} onDispatch={onDispatch} onFacilities={onFacilities} />}
      {comparisons.length > 0 && <section className="register offer-compare">
        <header className="register-head"><h2>구단별 조건 비교</h2></header>
        <ul className="settings-list">{comparisons.map((offers) => (
          <li key={offers[0].pid}><strong>{offers[0].player}</strong>
            <button className="secondary" onClick={() => onCompare(offers)}>{offers.length}건 비교</button>
          </li>
        ))}</ul>
      </section>}
      <section className="register" aria-label={brief ? '처리할 안건' : isScout ? '받은 보고서' : '받은 제안'}>
        <header className="register-head">
          <h2>{brief ? '처리할 안건' : isScout ? '받은 보고서' : '받은 제안'}</h2>
          <span>{rows.length}건</span>
        </header>
        {rows.length ? <ul className="records">
          {rows.map((item) => <li key={item.id}>
            <button className="record" data-kind={item.kind} onClick={() => onOpen(item)}>
              <span className="record-type">{urgent.has(item.tier) && <i aria-label="중요" />}{kindLabel(item.kind)}</span>
              <span className="record-main"><strong>{item.title}</strong>
                {item.terms && !brief ? (
                  <span className="offer-line">{[item.terms.club, item.terms.wage != null ? formatWon(item.terms.wage) : null, item.terms.years ? `${item.terms.years}년` : null].filter(Boolean).join(' · ')}</span>
                ) : isScout && item.candidates?.length ? (
                  <span>{item.candidates.map((candidate) => candidate.name).join(', ')}</span>
                ) : item.body ? <span>{item.body}</span> : null}
              </span>
              <span className="record-end">{item.expires != null && <small>{item.expires > 0 ? `${item.expires}주 남음` : '마감 임박'}</small>}<b aria-hidden="true">›</b></span>
            </button>
          </li>)}
        </ul> : <p className="empty">{brief ? '이번 주에 처리할 안건이 없습니다.' : isScout ? '도착한 스카우트 보고서가 없습니다.' : '검토할 계약 제안이 없습니다.'}</p>}
      </section>
    </>
  );
}
