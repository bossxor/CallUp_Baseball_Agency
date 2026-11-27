import { useState } from 'react';

export default function LeagueScreen({ leagues, getStandings, onRename }) {
  const [leagueId, setLeagueId] = useState(leagues[0]?.id);
  const clubs = getStandings(leagueId);
  return (
    <>
      <div className="page-title"><h1>리그 순위</h1></div>
      <section className="register">
        <header className="register-head">
          <label className="sort"><span>리그</span><select value={leagueId ?? ''} onChange={(event) => setLeagueId(event.target.value)}>
            {leagues.map((league) => <option key={league.id} value={league.id}>{league.name}</option>)}
          </select></label>
          <span>{clubs.length}개 구단</span>
        </header>
        {clubs.length ? <table className="league-standings">
          <thead><tr>
            <th scope="col">순위</th><th scope="col">구단</th><th scope="col">승</th><th scope="col">패</th>
            <th scope="col">무</th><th scope="col">승률</th>
          </tr></thead>
          <tbody>{clubs.map((club) => <tr key={club.id}>
            <td>{club.rank ?? '—'}</td>
            <th scope="row"><button className="club-link" title="구단명 편집" onClick={() => onRename(club)}>{club.name}</button></th>
            <td>{club.wins}</td><td>{club.losses}</td><td>{club.ties}</td>
            <td>{club.rate == null ? '—' : (club.rate * 100).toLocaleString('ko-KR', { maximumFractionDigits: 1 }) + '%'}</td>
          </tr>)}</tbody>
        </table> : <p className="empty">이 리그의 순위 기록이 없습니다.</p>}
      </section>
    </>
  );
}
