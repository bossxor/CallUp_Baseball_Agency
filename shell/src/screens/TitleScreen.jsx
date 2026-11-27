export default function TitleScreen({ ready, hasSave, busy, progress, message, onContinue, onNew }) {
  const generating = busy === 'new';
  return (
    <main className="entry">
      <div className="entry-brand">
        <div className="entry-title"><h1>콜업<span aria-hidden="true" /></h1><p>야구 에이전시</p></div>
      </div>
      <div className="entry-actions">
        {generating ? (
          <div className="generation">
            <span role="status">{progress >= 100 ? '첫 시즌 준비 중…' : '야구 세계 생성 중'}</span>
            <progress aria-label="야구 세계 생성" value={Math.max(0, Math.min(100, progress))} max="100" />
          </div>
        ) : !ready || busy === 'load' ? (
          <p role="status" className="entry-status">{busy ? '저장 불러오는 중…' : '저장 확인 중…'}</p>
        ) : (
          <>
            {message && <p role="status" className="entry-error">{message}</p>}
            {hasSave && <button className="primary" onClick={onContinue}>이어하기<span aria-hidden="true">›</span></button>}
            <button className={hasSave ? 'secondary' : 'primary'} onClick={onNew}>새 게임<span aria-hidden="true">›</span></button>
          </>
        )}
      </div>
    </main>
  );
}
