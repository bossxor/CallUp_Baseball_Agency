import { useEffect, useRef, useState } from 'react';
import { formatWon } from '../labels.js';

export default function NegoScreen({ nego, busy, onClose }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef(null);
  const hold = nego.tier === 'legend';

  function stop() {
    clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  }

  function start() {
    if (busy || timer.current) return;
    setHolding(true);
    timer.current = setTimeout(() => { stop(); onClose('deal'); }, 3000);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <>
      <div className="page-title">
        <h1>계약 검토</h1><button className="quiet" disabled={busy} onClick={() => onClose('cancel')}>목록으로</button>
      </div>
      <section className="register contract-note">
        <header className="register-head"><h2>{nego.title}</h2></header>
        {nego.body && <p>{nego.body}</p>}
        <dl className="terms">
          <div><dt>구단</dt><dd>{nego.terms?.club ?? '—'}</dd></div>
          <div><dt>제시 연봉</dt><dd>{nego.terms?.wage == null ? '—' : formatWon(nego.terms.wage)}</dd></div>
          <div><dt>기간</dt><dd>{nego.terms?.years ? `${nego.terms.years}년` : '—'}</dd></div>
          {nego.expires != null && <div><dt>응답 기한</dt><dd>{nego.expires > 0 ? `${nego.expires}주 남음` : '마감 임박'}</dd></div>}
        </dl>
        <div className="actions">
          {hold ? (
            <button className="primary hold" data-holding={holding} disabled={busy}
              onPointerDown={(event) => { event.currentTarget.setPointerCapture?.(event.pointerId); start(); }}
              onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop} onBlur={stop}
              onKeyDown={(event) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); start(); } }}
              onKeyUp={stop}>3초 눌러 수락</button>
          ) : <button className="primary" disabled={busy} onClick={() => onClose('deal')}>제안 수락</button>}
          <button className="secondary" disabled={busy} onClick={() => onClose('counter')}>조건 상향 제안</button>
          <button className="quiet" disabled={busy} onClick={() => onClose('decline')}>제안 거절</button>
        </div>
      </section>
    </>
  );
}
