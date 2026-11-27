import { useEffect, useRef, useState } from 'react';
import { formatWon } from '../labels.js';

export default function NegoScreen({ nego, busy, onClose, onStart, onRound }) {
  const [holding, setHolding] = useState(false);
  const [pending, setPending] = useState(null);
  const renewal = nego.kind === 'renewal';
  const seasonSalary = nego.terms?.seasonSalary;
  const actions = [
    { result: 'deal', label: seasonSalary ? '제안 연봉 수락' : '제안 수락' },
    { result: 'counter', label: renewal ? '연봉 30% 인상 요구' : nego.terms?.fee > 0 ? '계약금 20% 인상 요구' : '연봉 20% 인상 요구' },
    { result: 'decline', label: seasonSalary ? '기존 연봉 유지' : renewal ? 'FA로 나가기' : '제안 거절' },
  ];
  const review = pending && actions.find((action) => action.result === pending);
  const reviewHint = pending === 'counter'
    ? (seasonSalary ? '구단이 거절하면 기존 연봉을 유지합니다.' : nego.choices?.[1]?.hint || '인상 요구가 거절되면 협상이 끝납니다.')
    : (renewal && !seasonSalary ? '계약이 끝나면 선수가 자유계약 시장에 나갑니다.' : '');

  const timer = useRef(null);
  const hold = nego.tier === 'legend';
  const live = nego.live;

  function stop() {
    clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  }

  function start(action) {
    if (busy || timer.current) return;
    setHolding(true);
    timer.current = setTimeout(() => { stop(); action(); }, 3000);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const holdButton = (action) => (
    <button className="primary hold" data-holding={holding} disabled={busy}
      onPointerDown={(event) => { event.currentTarget.setPointerCapture?.(event.pointerId); start(action); }}
      onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop} onBlur={stop}
      onKeyDown={(event) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); start(action); } }}
      onKeyUp={stop}>3초 눌러 확정</button>
  );

  if (live) {
    const confirm = live.phase === 'fee' ? '계약금 합의'
      : live.phase === 'wage' ? '연봉 합의' : '선수에게 조건 전달';
    return (
      <>
        <div className="page-title"><h1>협상 테이블</h1>
          <button className="quiet" disabled={busy} onClick={() => onClose('cancel')}>목록으로</button>
        </div>
        <section className="register contract-note">
          <header className="register-head"><h2>{nego.terms.club}</h2><span>인내심 {live.patience}</span></header>
          <dl className="terms">
            {nego.player && <div><dt>선수</dt><dd>{nego.player}</dd></div>}
            <div><dt>{live.phase === 'fee' ? '제시 계약금' : '제시 연봉'}</dt><dd>{formatWon(live.offer)}</dd></div>
            {live.phase !== 'fee' && live.fee > 0 && <div><dt>합의 계약금</dt><dd>{formatWon(live.fee)}</dd></div>}
            <div><dt>기간</dt><dd>{live.years}년</dd></div>
          </dl>
          <ol className="negotiation-lines" aria-live="polite">
            {live.lines.map((line, index) => <li key={index}>
              <strong>{({ me: '에이전시', club: '구단', player: '선수', seller: '소속 구단' })[line.who] ?? '협상'}</strong>
              <span>{line.text}</span>
            </li>)}
          </ol>
          {live.durationOffer && <div className="negotiation-confirm">
            <h3>구단의 기간 제안</h3>
            <p>{live.durationOffer.years}년 · 연봉 {formatWon(live.durationOffer.wage)}</p>
            <div className="actions">
              <button className="secondary" disabled={busy} onClick={() => onRound('duration')}>{live.durationOffer.years}년으로 변경</button>
              <button className="quiet" disabled={busy} onClick={() => onRound('keepDuration')}>{live.years}년 유지</button>
            </div>
          </div>}
          {live.agreedClauses.length > 0 && <p>합의 조항 · {live.agreedClauses.join(', ')}</p>}
          {live.clauses.length > 0 && <div className="negotiation-confirm">
            <h3>요청할 조항</h3>
            <ul className="settings-list">
              {live.clauses.map((clause) => <li key={clause.id}>
                <div><strong>{clause.label}</strong><p>{clause.gain} · {clause.cost}</p></div>
                <button className="secondary" disabled={busy} onClick={() => onRound('clause', clause.id)} aria-label={clause.label + ' 요청'}>요청</button>
              </li>)}
            </ul>
          </div>}
          {live.tactics.length > 0 && <div className="actions">
            {live.tactics.map((tactic) => <button key={tactic.id} className="secondary" disabled={busy}
              onClick={() => onRound('demand', tactic.id)}>{tactic.label}</button>)}
          </div>}
          <div className="actions">
            {hold && live.phase === 'clause' ? holdButton(() => onRound('accept'))
              : <button className="primary" disabled={busy} onClick={() => onRound('accept')}>{confirm}</button>}
            <button className="quiet" disabled={busy} onClick={() => onRound('leave')}>협상에서 일어나기</button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <div className="page-title">
        <h1>계약 검토</h1><button className="quiet" disabled={busy} onClick={() => onClose('cancel')}>목록으로</button>
      </div>
      <section className="register contract-note">
        <header className="register-head"><h2>{nego.title}</h2></header>
        {nego.body && <p>{nego.body}</p>}
        <dl className="terms">
          {nego.player && <div><dt>선수</dt><dd>{nego.player}</dd></div>}
          <div><dt>구단</dt><dd>{nego.terms?.club ?? '—'}</dd></div>
          <div><dt>제시 연봉</dt><dd>{nego.terms?.wage == null ? '—' : formatWon(nego.terms.wage)}</dd></div>
          {nego.terms?.fee > 0 && <div><dt>계약금</dt><dd>{formatWon(nego.terms.fee)}</dd></div>}
          <div><dt>기간</dt><dd>{nego.terms?.years ? `${nego.terms.years}년` : '—'}</dd></div>
          {nego.expires != null && <div><dt>응답 기한</dt><dd>{nego.expires > 0 ? `${nego.expires}주 남음` : '마감 임박'}</dd></div>}
        </dl>
        {review ? (
          <div className="negotiation-confirm">
            <h3>{review.label}</h3>
            {reviewHint && <p>{reviewHint}</p>}
            <div className="actions">
              <button className="secondary" disabled={busy} onClick={() => setPending(null)}>다시 보기</button>
              <button className="primary" disabled={busy} onClick={() => onClose(review.result)}>확정</button>
            </div>
          </div>
        ) : <div className="actions">
          {!seasonSalary && onStart && <button className="secondary" disabled={busy} onClick={onStart}>협상 테이블 열기</button>}
          {hold ? holdButton(() => onClose('deal')) : <button className="primary" disabled={busy} onClick={() => onClose('deal')}>{actions[0].label}</button>}
          <button className="secondary" disabled={busy} onClick={() => setPending('counter')}>{actions[1].label}</button>
          <button className="quiet" disabled={busy} onClick={() => setPending('decline')}>{actions[2].label}</button>
        </div>}
      </section>
    </>
  );
}
