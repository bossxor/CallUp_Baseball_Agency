import { useRef } from 'react';
import { BACKUP_FILE_ACCEPT } from '../adapter/diskSave.js';

export default function TitleScreen({ ready, hasSave, busy, progress, message, onContinue, onNew, onBackupFile }) {
  const backupInput = useRef(null);
  const generating = busy === 'new';
  return (
    <main className="entry">
      <div className="entry-brand">
        <div className="entry-title"><h1>콜업<span aria-hidden="true" /></h1><p>야구 에이전시</p></div>
      </div>
      <div className="entry-actions">
        {generating ? (
          <div className="generation">
            <span role="status">{progress > 0 && progress < 100 ? `야구 세계 생성 중 ${progress}%` : '첫 시즌 준비 중…'}</span>
            <progress aria-label="첫 시즌 준비" value={progress > 0 ? Math.min(100, progress) : undefined} max="100" />
          </div>
        ) : !ready || busy === 'load' ? (
          <p role="status" className="entry-status">{busy ? '저장 불러오는 중…' : '저장 확인 중…'}</p>
        ) : (
          <>
            {message && <p role="status" className="entry-error">{message}</p>}
            {hasSave && <button className="primary" onClick={onContinue}>이어하기<span aria-hidden="true">›</span></button>}
            <button className={hasSave ? 'secondary' : 'primary'} onClick={onNew}>새 게임<span aria-hidden="true">›</span></button>
            {onBackupFile && <>
              <button className="secondary" disabled={!!busy} onClick={() => backupInput.current.click()}>백업 파일로 시작</button>
              <input ref={backupInput} type="file" hidden aria-label="시작할 백업 파일" accept={BACKUP_FILE_ACCEPT}
                onChange={(event) => {
                  const file = event.currentTarget.files[0];
                  event.currentTarget.value = '';
                  if (file) onBackupFile(file);
                }} />
            </>}
          </>
        )}
      </div>
    </main>
  );
}
