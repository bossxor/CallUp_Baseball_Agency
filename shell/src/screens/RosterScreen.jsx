import { useState } from 'react';

export default function RosterScreen({ clients, onOpen }) {
  const [sort, setSort] = useState('ovr');
  const list = [...clients].sort((a, b) =>
    sort === 'name' ? a.name.localeCompare(b.name, 'ko') : b.ovr - a.ovr);
  return (
    <>
      <div className="page-title"><h1>선수단</h1><span>{clients.length}명</span></div>
      <section className="register" aria-label="계약 선수">
        <header className="register-head">
          <h2>계약 선수</h2>
          <label className="sort"><span>정렬</span><select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="ovr">능력치순</option><option value="name">이름순</option>
          </select></label>
        </header>
        {clients.length ? <ul className="records">
          {list.map((player) => <li key={player.id}>
            <button className="record player-record" onClick={() => onOpen(player)}>
              <span className="position">{player.pos}</span>
              <span className="record-main"><strong>{player.name}</strong><span>{player.club}{player.age && ` · ${player.age}세`}</span></span>
              <span className="player-strength"><small>OVR</small><b>{player.ovr}</b></span>
            </button>
          </li>)}
        </ul> : <p className="empty">계약한 선수가 없습니다.</p>}
      </section>
    </>
  );
}
