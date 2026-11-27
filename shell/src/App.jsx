import { useEffect, useRef, useState } from 'react';
import { createAdapter } from './adapter/index.js';
import TitleScreen from './screens/TitleScreen.jsx';
import DeskScreen from './screens/DeskScreen.jsx';
import RosterScreen from './screens/RosterScreen.jsx';
import MoreScreen from './screens/MoreScreen.jsx';
import NegoScreen from './screens/NegoScreen.jsx';
import WorkspaceNav from './components/BottomNav.jsx';
import { kindLabel } from './labels.js';

const adapter = createAdapter();

function Dialog({ title, onClose, children }) {
  const dialog = useRef(null);
  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    return () => node.close();
  }, []);
  return (
    <dialog ref={dialog} className="dialog" aria-label={title}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="dialog-content">
        <header><h2>{title}</h2><button className="quiet" onClick={onClose}>닫기</button></header>
        {children}
      </div>
    </dialog>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [route, setRoute] = useState('brief');
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState('');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const lock = useRef(false);
  const closeDialog = () => setDialog(null);

  useEffect(() => {
    let live = true;
    Promise.resolve(adapter.probeHasSave?.() ?? adapter.hasSave())
      .then((value) => { if (live) setHasSave(value); })
      .catch(() => { if (live) setMessage('저장 상태를 확인하지 못했습니다.'); })
      .finally(() => { if (live) setReady(true); });
    return () => { live = false; };
  }, []);

  async function run(label, work) {
    if (lock.current) return;
    lock.current = true;
    setBusy(label);
    setMessage('');
    try {
      const next = await work();
      if (next) {
        setSnapshot(next);
        if (next.saved !== false) setHasSave(true);
        if (next.notice) setMessage(next.notice);
      }
      return next;
    } catch (error) {
      setMessage(error.message || '잠시 후 다시 시도하세요.');
    } finally {
      lock.current = false;
      setBusy('');
    }
  }

  function enter(mode, agencyName) {
    closeDialog();
    setRoute('brief');
    setProgress(0);
    void run(mode, mode === 'new'
      ? () => adapter.newGame({ agencyName }, (value) => setProgress(Math.round((Number(value) || 0) * 100)))
      : () => adapter.loadSave());
  }

  function advance(confirmed = false) {
    const gate = adapter.canAdvance();
    if (!gate.ok && !confirmed) {
      if (gate.needWarn) setDialog({ type: 'advance', message: gate.reason });
      else setMessage(gate.reason);
      return;
    }
    closeDialog();
    void run('week', async () => {
      if (confirmed) await adapter.confirmAdvanceWarn();
      return adapter.advanceWeek();
    });
  }

  function resolve(item, action) {
    closeDialog();
    void run('action', () => adapter.resolveAgenda(item.id, action));
  }

  function reset() {
    closeDialog();
    void run('action', async () => {
      await adapter.resetSave();
      setSnapshot(null);
      setHasSave(false);
    });
  }

  const askNew = () => setDialog({ type: 'new' });
  const go = (page) => {
    setMessage('');
    if (snapshot?.negoOpen) void run('action', () => adapter.closeNegotiation('cancel'));
    setRoute(page);
    window.scrollTo(0, 0);
  };
  const refreshSave = () => void run('save', () => adapter.saveGame?.());
  const item = dialog?.item;
  const closeNegotiation = (result) => void run('action', () => adapter.closeNegotiation(result));

  return (
    <div className="app" aria-busy={!!busy || !ready}>
      {!snapshot ? (
        <TitleScreen ready={ready} hasSave={hasSave} busy={busy} progress={progress}
          message={message} onContinue={() => enter('load')} onNew={askNew} />
      ) : (
        <>
          <header className="workspace-head">
            <div className="workspace-meta">
              <button className="wordmark" onClick={() => go('brief')} aria-label="콜업 브리핑">콜업<span aria-hidden="true" /></button>
              <div className="agency"><strong>{snapshot.agencyName}</strong><span>{snapshot.dateLabel} <span className="year">{snapshot.year}년차</span></span></div>
              <button className="settings-link" onClick={() => go('settings')}>설정</button>
            </div>
            <WorkspaceNav route={route} onChange={go} />
          </header>

          <main className="workspace" id="content">
            {snapshot.saved === false && (
              <div className="save-warning" role="status">
                <span>저장하지 못했습니다. 앱을 닫기 전에 다시 저장하세요.</span>
                <button className="quiet" disabled={!!busy} onClick={refreshSave}>다시 저장</button>
              </div>
            )}
            {message && <div className="feedback" role="status"><span>{message}</span><button className="quiet" onClick={() => setMessage('')}>닫기</button></div>}
            {snapshot.negoOpen ? (
              <NegoScreen nego={snapshot.negoOpen} busy={!!busy} onClose={closeNegotiation} />
            ) : route === 'roster' ? (
              <RosterScreen clients={snapshot.clients} onOpen={(player) => setDialog({ type: 'player', player })} />
            ) : route === 'settings' ? (
              <MoreScreen busy={busy} saved={snapshot.saved} onSave={refreshSave}
                onCheat={(cmd) => void run('action', () => adapter.cheat(cmd))}
                onReset={() => setDialog({ type: 'reset' })} />
            ) : (
              <DeskScreen route={route} agenda={route === 'scout' ? snapshot.reports ?? snapshot.agenda : snapshot.agenda} week={snapshot.week} funds={snapshot.funds}
                onOpen={(entry) => setDialog({ type: 'agenda', item: entry })} />
            )}
          </main>

          {route === 'brief' && !snapshot.negoOpen && (
            <div className="advance-bar">
              <div><strong>{snapshot.nextDateLabel ?? '주간 진행'}</strong><span>{busy === 'week' ? '경기와 일정을 계산 중' : adapter.canAdvance().reason || '진행 예정일'}</span></div>
              <button className="primary advance" disabled={!!busy} onClick={() => advance()}>
                {busy === 'week' ? '진행 중…' : '다음 주'}<span aria-hidden="true">›</span>
              </button>
            </div>
          )}
        </>
      )}

      {dialog?.type === 'agenda' && (
        <Dialog title={item.title} onClose={closeDialog}>
          <p className="term">{kindLabel(item.kind)}</p>
          {item.body && <p>{item.body}</p>}
          {item.candidates?.length > 0 && <ul className="prospects">{item.candidates.map((player) =>
            <li key={player.id}><b>{player.name}</b><span>{player.pos} · {player.age}세</span><span>OVR {player.ovr}</span></li>
          )}</ul>}
          <div className="actions">
            {item.done ? <button className="primary" onClick={closeDialog}>확인</button>
              : item.terms ? <button className="primary" onClick={() => resolve(item, 'negotiate')}>제안 검토</button>
              : item.choices?.length ? item.choices.map((choice, index) => (
                <button key={index} disabled={choice.lock} className={index === 0 ? 'primary' : 'secondary'} onClick={() => resolve(item, index)}>
                  {choice.label}{choice.hint && <small>{choice.hint}</small>}
                </button>
              )) : <button className="primary" onClick={() => resolve(item, 'dismiss')}>확인</button>}
          </div>
        </Dialog>
      )}
      {dialog?.type === 'player' && (
        <Dialog title={dialog.player.name} onClose={closeDialog}>
          <dl className="terms">
            <div><dt>소속</dt><dd>{dialog.player.club}</dd></div>
            <div><dt>포지션</dt><dd>{dialog.player.pos}</dd></div>
            <div><dt>나이</dt><dd>{dialog.player.age}세</dd></div>
            <div><dt>능력치</dt><dd>{dialog.player.ovr}</dd></div>
          </dl>
        </Dialog>
      )}
      {dialog?.type === 'advance' && (
        <Dialog title="다음 주로 진행할까요?" onClose={closeDialog}>
          <p>{dialog.message}</p>
          <div className="actions"><button className="secondary" onClick={closeDialog}>안건 확인</button><button className="primary" onClick={() => advance(true)}>진행</button></div>
        </Dialog>
      )}
      {dialog?.type === 'new' && (
        <Dialog title="새 에이전시" onClose={closeDialog}>
          <form className="new-agency" onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            enter('new', String(data.get('agency')).trim());
          }}>
            <label htmlFor="agency-name">에이전시 이름</label>
            <input id="agency-name" name="agency" maxLength={24} defaultValue="콜업 에이전시" />
            {hasSave && <p>새 게임 저장에 성공하면 현재 이어하기 슬롯을 교체합니다.</p>}
            <div className="actions"><button className="primary" type="submit">새 게임 시작</button></div>
          </form>
        </Dialog>
      )}
      {dialog?.type === 'reset' && (
        <Dialog title="저장 데이터를 삭제할까요?" onClose={closeDialog}>
          <p>휴대전화의 모든 콜업 저장이 삭제됩니다.</p>
          <div className="actions"><button className="danger" onClick={reset}>모든 저장 삭제</button></div>
        </Dialog>
      )}
    </div>
  );
}
