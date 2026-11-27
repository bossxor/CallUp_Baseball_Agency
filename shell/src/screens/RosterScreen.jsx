import { useState } from 'react';
import { SCOUT_POSITIONS } from '../labels.js';

const SORTS = { ovr: (a, b) => b.ovr - a.ovr, name: (a, b) => a.name.localeCompare(b.name, 'ko'), apps: (a, b) => b.appearances - a.appearances };

export default function RosterScreen({ clients, onOpen }) {
  const [sort, setSort] = useState('ovr');
  const [position, setPosition] = useState('ANY');
  const [query, setQuery] = useState('');
  const search = query.trim().toLocaleLowerCase('ko');
  const positions = [...new Set(clients.map((player) => player.pos))];
  const list = clients.filter((player) => (position === 'ANY' || player.pos === position)
    && (player.name + ' ' + player.club).toLocaleLowerCase('ko').includes(search)).sort(SORTS[sort]);
  return (
    <>
      <div className="page-title"><h1>선수단</h1><span>{clients.length}명</span></div>
      <section className="register" aria-label="계약 선수">
        <header className="register-head">
          <h2>계약 선수</h2>
          <label className="sort"><span>정렬</span><select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="ovr">능력치순</option><option value="name">이름순</option><option value="apps">출장순</option>
          </select></label>
        </header>
        {clients.length > 0 && <div className="roster-filters scout-fields">
          <label>이름·구단<input type="search" value={query} placeholder="선수 검색" onChange={(event) => setQuery(event.target.value)} /></label>
          <label>포지션<select value={position} onChange={(event) => setPosition(event.target.value)}>
            <option value="ANY">전체</option>
            {positions.map((pos) => <option key={pos} value={pos}>{SCOUT_POSITIONS[pos] ?? pos}</option>)}
          </select></label>
        </div>}
        {list.length ? <ul className="records">
          {list.map((player) => <li key={player.id}>
            <button className="record player-record" onClick={() => onOpen(player)}>
              <span className="position">{player.pos}</span>
              <span className="record-main"><strong>{player.name}</strong><span>{player.club}{player.age && ` · ${player.age}세`}</span></span>
              <span className="player-strength"><small>OVR</small><b>{player.ovr}</b></span>
            </button>
          </li>)}
        </ul> : <p className="empty">{clients.length ? '조건에 맞는 선수가 없습니다.' : '계약한 선수가 없습니다.'}</p>}
      </section>
    </>
  );
}
