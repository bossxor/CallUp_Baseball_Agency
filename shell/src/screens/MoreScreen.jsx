import { exactWon } from '../labels.js';

export default function MoreScreen({ busy, saved, onSave, onCheat, onReset, facilities, ledger, funds, onUpgrade }) {
  return (
    <>
      <div className="page-title"><h1>설정</h1></div>
      <section className="register">
        <header className="register-head"><h2>저장</h2><span>{saved ? '저장됨' : '저장 확인 필요'}</span></header>
        <div className="settings-actions">
          <button className="secondary" disabled={!!busy} onClick={onSave}>{busy === 'save' ? '저장 중…' : '지금 저장'}</button>
          <button className="danger" disabled={!!busy} onClick={onReset}>저장 데이터 초기화</button>
        </div>
      </section>
      {facilities?.length > 0 && <section className="register">
        <header className="register-head"><h2>시설 관리</h2></header>
        <ul className="settings-list">
          {facilities.map((facility) => {
            const locked = facility.reputation < facility.requiredRep;
            return <li key={facility.id} className="facility-row">
              <div><h3>{facility.name} <small>Lv.{facility.level}</small></h3><p>{facility.description}</p></div>
              {facility.next == null ? <span>최고 단계</span> : <div className="facility-action">
                <button className="secondary" disabled={!!busy || locked || facility.cost > funds}
                  onClick={() => onUpgrade(facility)} aria-label={facility.name + ' Lv.' + facility.next + ' 업그레이드'}>
                  Lv.{facility.next} · {exactWon(facility.cost)}
                </button>
                {locked ? <small>평판 Lv.{facility.requiredRep} 필요</small> : facility.cost > funds && <small>운영 자금 부족</small>}
              </div>}
            </li>;
          })}
        </ul>
      </section>}
      {ledger && <section className="register">
        <header className="register-head"><h2>최근 자금 내역</h2><span>잔액 {exactWon(funds)}</span></header>
        {ledger.length ? <ul className="settings-list">
          {ledger.map((entry, index) => <li key={index} className="ledger-row">
            <div><strong>{entry.label}</strong><small>{entry.date}</small></div>
            <strong>{entry.amount > 0 ? '+' : ''}{exactWon(entry.amount)}</strong>
          </li>)}
        </ul> : <p className="empty">아직 기록된 거래가 없습니다.</p>}
      </section>}
      <details className="register diagnostics">
        <summary>개발용 치트</summary>
        <div className="settings-actions">
          <button className="secondary" disabled={!!busy} onClick={() => onCheat('money')}>운영 자금 1억 추가</button>
          <button className="secondary" disabled={!!busy} onClick={() => onCheat('addUnique')}>테스트 안건 추가</button>
          <button className="secondary" disabled={!!busy} onClick={() => onCheat('clearAgenda')}>안건 비우기</button>
        </div>
      </details>
    </>
  );
}
