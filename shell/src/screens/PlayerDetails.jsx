function rating(value) {
  return Number.isFinite(value) ? value.toFixed(1) : '—';
}

export default function PlayerDetails({ details, pitcher }) {
  return (
    <div className="player-details">
      <section aria-labelledby="player-season">
        <h3 id="player-season">이번 시즌 · 리그</h3>
        <dl className="player-numbers">
          <div><dt>{pitcher ? '등판' : '출장'}</dt><dd>{details.games}</dd></div>
          {!pitcher && <><div><dt>안타</dt><dd>{details.hits}</dd></div><div><dt>타점</dt><dd>{details.rbi}</dd></div></>}
          <div><dt>평균 평점</dt><dd>{rating(details.rating)}</dd></div>
        </dl>
      </section>
      <section aria-labelledby="player-games">
        <h3 id="player-games">최근 경기</h3>
        {details.recent.length ? <ul className="player-history">
          {details.recent.map((game, index) => <li key={index}>
            <div className="player-game"><strong>{game.opponent}</strong><strong>{game.score}</strong></div>
            <small>{game.date} · {pitcher ? '' : game.hits + '안타 ' + game.rbi + '타점 · '}평점 {rating(game.rating)}</small>
          </li>)}
        </ul> : <p>기록된 출전 경기가 없습니다.</p>}
      </section>
      {details.seasons.length > 0 && <section aria-labelledby="player-seasons">
        <h3 id="player-seasons">지난 시즌 · 리그</h3>
        <ul className="player-history">
          {details.seasons.map((season, index) => <li key={index}>
            <strong>{season.year} · {season.club}</strong>
            <small>{season.games}경기 · {pitcher ? '' : season.hits + '안타 ' + season.rbi + '타점 · '}평점 {rating(season.rating)}</small>
          </li>)}
        </ul>
      </section>}
      <section aria-labelledby="player-moves">
        <h3 id="player-moves">계약·이적 이력</h3>
        {details.moves.length ? <ul className="player-history">
          {details.moves.map((event, index) => <li key={index}><strong>{event.text}</strong><small>{event.date}</small></li>)}
        </ul> : <p>기록된 이적·재계약이 없습니다.</p>}
      </section>
    </div>
  );
}
