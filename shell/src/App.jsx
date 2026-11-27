import { useEffect, useRef, useState } from 'react';
import { createAdapter } from './adapter/index.js';
import TitleScreen from './screens/TitleScreen.jsx';
import DeskScreen from './screens/DeskScreen.jsx';
import RosterScreen from './screens/RosterScreen.jsx';
import MoreScreen from './screens/MoreScreen.jsx';
import LeagueScreen from './screens/LeagueScreen.jsx';
import PlayerDetails from './screens/PlayerDetails.jsx';
import NegoScreen from './screens/NegoScreen.jsx';
import WorkspaceNav from './components/BottomNav.jsx';
import { exactWon, formatWon, kindLabel } from './labels.js';

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
      ? () => adapter.newGame({ agencyName }, (value) => setProgress(Math.round((Number(value) || 0) * 100)), setSnapshot)
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

  async function signCandidate(report, player) {
    closeDialog();
    const next = await run('action', () => adapter.signScoutCandidate(report.id, player.id));
    if (next?.clients.some((client) => client.id === player.id)) setRoute('roster');
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
  const openBackups = () => void run('action', async () => {
    setDialog({ type: 'backups', slots: await adapter.listBackups() });
  });
  function applyBackup(slot, mode) {
    closeDialog();
    void run('action', async () => {
      if (mode === 'load') {
        const next = await adapter.restoreBackup(slot.slot);
        setRoute('brief');
        return next;
      }
      const next = await adapter.saveBackup(slot.slot);
      setDialog({ type: 'backups', slots: await adapter.listBackups() });
      return next;
    });
  }

  const openPlayer = (player) => setDialog({ type: 'player', player, details: adapter.playerDetails?.(player.id) });
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
            {busy === 'new' && snapshot.saved === undefined && <div className="feedback" role="status">첫 저장 중…</div>}
            {snapshot.saved === false && (
              <div className="save-warning" role="status">
                <span>저장하지 못했습니다. 앱을 닫기 전에 다시 저장하세요.</span>
                <button className="quiet" disabled={!!busy} onClick={refreshSave}>다시 저장</button>
              </div>
            )}
            {message && <div className="feedback" role="status"><span>{message}</span><button className="quiet" onClick={() => setMessage('')}>닫기</button></div>}
            {snapshot.negoOpen ? (
              <NegoScreen nego={snapshot.negoOpen} busy={!!busy} onClose={closeNegotiation}
                onStart={adapter.startNegotiation && (() => void run('action', () => adapter.startNegotiation()))}
                onRound={(action, tactic) => void run('action', () => adapter.negotiationRound(action, tactic))} />
            ) : route === 'roster' ? (
              <RosterScreen clients={snapshot.clients} onOpen={openPlayer} />
            ) : route === 'leagues' ? (
              <LeagueScreen leagues={adapter.listLeagues()} getStandings={(id) => adapter.leagueStandings(id)}
                onRename={(club) => setDialog({ type: 'rename-club', club })} />
            ) : route === 'settings' ? (
              <MoreScreen busy={busy} saved={snapshot.saved} onSave={refreshSave}
                facilities={snapshot.facilities} ledger={snapshot.ledger} funds={snapshot.funds}
                onUpgrade={(facility) => setDialog({ type: 'upgrade', facility })}
                onCheat={(cmd) => void run('action', () => adapter.cheat(cmd))}
                onBackups={adapter.listBackups && openBackups}
                onReset={() => setDialog({ type: 'reset' })} />
            ) : (
              <DeskScreen route={route} agenda={route === 'scout' ? snapshot.reports ?? snapshot.agenda : snapshot.agenda} week={snapshot.week} funds={snapshot.funds}
                onLeagues={adapter.listLeagues && (() => go('leagues'))}
                scouting={snapshot.scouting} busy={!!busy} onFacilities={() => go('settings')}
                quoteScout={(criteria) => adapter.quoteScout?.(criteria)}
                onDispatch={(criteria) => void run('action', () => adapter.dispatchScout(criteria))}
                onCompare={(offers) => setDialog({ type: 'compare', offers })}
                onOpen={(entry) => setDialog({ type: 'agenda', item: entry })} />
            )}
          </main>

          {route === 'brief' && !snapshot.negoOpen && (
            <div className="advance-bar">
              <div><strong>{snapshot.nextDateLabel ?? '주간 진행'}</strong><span>{busy === 'week' ? '경기와 일정을 계산 중' : busy === 'new' ? '첫 저장 중' : adapter.canAdvance().reason || '진행 예정일'}</span></div>
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
            <li key={player.id}>
              <div><b>{player.name}</b><span>{player.pos} · {player.age}세 · OVR {player.ovr}</span></div>
              {player.contracted ? <span>계약 완료</span> : player.contract && (
                <button className="secondary" onClick={() => setDialog({ type: 'recruit', item, player })}>계약 검토</button>
              )}
            </li>
          )}</ul>}
          <div className="actions">
            {item.done ? <button className="primary" onClick={closeDialog}>확인</button>
              : item.terms ? <button className="primary" disabled={!!busy} onClick={() => resolve(item, 'negotiate')}>제안 검토</button>
              : item.choices?.length ? item.choices.map((choice, index) => (
                <button key={index} disabled={!!busy || choice.lock} className={index === 0 ? 'primary' : 'secondary'} onClick={() => resolve(item, index)}>
                  {choice.label}{choice.hint && <small>{choice.hint}</small>}
                </button>
              )) : <button className="primary" disabled={!!busy} onClick={() => resolve(item, 'dismiss')}>{item.kind === 'scout' ? '검토 완료' : '확인'}</button>}
          </div>
        </Dialog>
      )}
      {dialog?.type === 'recruit' && (
        <Dialog title={`${dialog.player.name} 계약 제안`} onClose={closeDialog}>
          <p className="term">{dialog.player.club} · {dialog.player.pos} · {dialog.player.age}세</p>
          <dl className="terms">
            <div><dt>계약 기간</dt><dd>{dialog.player.contract.years}년</dd></div>
            <div><dt>에이전시 수수료율</dt><dd>{dialog.player.contract.fee * 100}%</dd></div>
            {dialog.player.contract.cost != null && <div><dt>예상 계약 비용</dt><dd>{formatWon(dialog.player.contract.cost)}</dd></div>}
          </dl>
          <div className="actions">
            <button className="secondary" onClick={() => setDialog({ type: 'agenda', item })}>보고서로</button>
            <button className="primary" disabled={!!busy} onClick={() => signCandidate(item, dialog.player)}>계약 제안 보내기</button>
          </div>
        </Dialog>
      )}
      {dialog?.type === 'compare' && (
        <Dialog title={'제안 비교 · ' + dialog.offers[0].player} onClose={closeDialog}>
          <ul className="offer-comparison">
            {dialog.offers.map((offer) => <li key={offer.id}>
              <h3>{offer.terms.club}</h3>
              <dl className="terms">
                <div><dt>연봉</dt><dd>{formatWon(offer.terms.wage)}</dd></div>
                <div><dt>기간</dt><dd>{offer.terms.years ? offer.terms.years + '년' : '—'}</dd></div>
                <div><dt>계약금</dt><dd>{offer.terms.fee > 0 ? formatWon(offer.terms.fee) : '—'}</dd></div>
                {offer.expires != null && <div><dt>기한</dt><dd>{offer.expires > 0 ? offer.expires + '주 남음' : '마감 임박'}</dd></div>}
              </dl>
              <button className="secondary" onClick={() => setDialog({ type: 'agenda', item: offer })}>제안 열기</button>
            </li>)}
          </ul>
        </Dialog>
      )}
      {dialog?.type === 'player' && (
        <Dialog title={dialog.player.name} onClose={closeDialog}>
          <dl className="terms">
            <div><dt>소속</dt><dd>{dialog.player.club}</dd></div>
            <div><dt>포지션</dt><dd>{dialog.player.pos}</dd></div>
            <div><dt>나이</dt><dd>{dialog.player.age}세</dd></div>
            <div><dt>능력치</dt><dd>{dialog.player.ovr}</dd></div>
            {dialog.details?.signed && <div><dt>에이전시 계약일</dt><dd>{dialog.details.signed}</dd></div>}
            {dialog.details?.end && <div><dt>에이전시 만료일</dt><dd>{dialog.details.end}</dd></div>}
          </dl>
          {dialog.details && <PlayerDetails details={dialog.details} pitcher={dialog.player.pos === 'P'} />}
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
      {dialog?.type === 'backups' && (
        <Dialog title="백업 저장과 불러오기" onClose={closeDialog}>
          <ul className="settings-list">
            {dialog.slots.map((slot) => <li key={slot.slot}>
              <div><strong>슬롯 {slot.number}</strong>
                <div>{slot.exists ? [slot.agencyName, slot.date].filter(Boolean).join(' · ') || '저장됨' : '비어 있음'}</div>
              </div>
              <div className="actions">
                <button className="secondary" disabled={!!busy} aria-label={'슬롯 ' + slot.number + '에 저장'} onClick={() => {
                  if (slot.exists) setDialog({ type: 'backup-confirm', slot, mode: 'save' });
                  else applyBackup(slot, 'save');
                }}>저장</button>
                <button className="secondary" disabled={!!busy || !slot.exists} aria-label={'슬롯 ' + slot.number + ' 불러오기'}
                  onClick={() => setDialog({ type: 'backup-confirm', slot, mode: 'load' })}>불러오기</button>
              </div>
            </li>)}
          </ul>
        </Dialog>
      )}
      {dialog?.type === 'backup-confirm' && (
        <Dialog title={dialog.mode === 'load' ? '백업을 불러올까요?' : '이 슬롯에 덮어쓸까요?'} onClose={closeDialog}>
          <p>{dialog.mode === 'load' ? '선택한 백업이 현재 이어하기 데이터를 교체합니다.' : '이 슬롯의 백업을 현재 진행으로 교체합니다.'}</p>
          <div className="actions">
            <button className="secondary" disabled={!!busy} onClick={openBackups}>슬롯 목록</button>
            <button className="primary" disabled={!!busy} onClick={() => applyBackup(dialog.slot, dialog.mode)}>
              {dialog.mode === 'load' ? '백업 불러오기' : '덮어쓰기'}
            </button>
          </div>
        </Dialog>
      )}
      {dialog?.type === 'rename-club' && (
        <Dialog title="구단명 편집" onClose={closeDialog}>
          <form className="new-agency" onSubmit={(event) => {
            event.preventDefault();
            const name = new FormData(event.currentTarget).get('club');
            const id = dialog.club.id;
            closeDialog();
            void run('action', () => adapter.renameClub(id, name));
          }}>
            <label htmlFor="club-name">구단명</label>
            <input id="club-name" name="club" maxLength={24} defaultValue={dialog.club.name} required />
            <small>기본 구단명 · {dialog.club.original}</small>
            <div className="actions">
              {dialog.club.name !== dialog.club.original && <button className="secondary" type="button" disabled={!!busy} onClick={() => {
                const id = dialog.club.id;
                closeDialog();
                void run('action', () => adapter.renameClub(id, ''));
              }}>기본 이름 복원</button>}
              <button className="primary" type="submit" disabled={!!busy}>구단명 저장</button>
            </div>
          </form>
        </Dialog>
      )}
      {dialog?.type === 'upgrade' && (
        <Dialog title={dialog.facility.name + ' Lv.' + dialog.facility.next} onClose={closeDialog}>
          <p>운영 자금에서 {exactWon(dialog.facility.cost)}을 사용합니다.</p>
          <div className="actions">
            <button className="primary" disabled={!!busy} onClick={() => {
              const id = dialog.facility.id;
              closeDialog();
              void run('action', () => adapter.upgradeFacility(id));
            }}>업그레이드 확정</button>
          </div>
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
