export default function MoreScreen({ busy, saved, onSave, onCheat, onReset }) {
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
