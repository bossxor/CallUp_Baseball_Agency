export type Tier = "1군" | "2군";
export interface Domestic {
  firstWeek:number;
  promotionWeek:number|null;
}
export const domesticPlayer = "kr-1";
export const domesticTeams = ["인천 웨이브스", "수원 레일스"] as const;
const emptyBatting = () => ({pa:0, hits:0, walks:0, bases:0});
type Batting = ReturnType<typeof emptyBatting>;

export function calendar(week:number) {
  const round=(week-1)%52+1;
  return {round, season:Math.floor((week-1)/52)+1,
    phase:round<4 ? "프리시즌" : round<=33 ? "정규시즌" : round<=35 ? "시즌 결산" : "오프시즌"};
}
export const tierAt = (domestic:Domestic, week:number):Tier =>
  domestic.promotionWeek!==null && domestic.promotionWeek<=week ? "1군" : "2군";

function game(seed:number, week:number, tier:Tier, playerTier:Tier) {
  let rng=(seed ^ Math.imul(week,2654435761) ^ (tier==="1군"?7349:9127))>>>0;
  const random=() => {
    rng=(Math.imul(rng,1664525)+1013904223)>>>0;
    return rng/4294967296;
  };
  const runs=[0,0];
  const nextBatter=[0,0];
  const batting=emptyBatting();
  const home=week%2;
  for (let inning=1; inning<=9; inning++) {
    for (const team of [1-home,home]) {
      if (inning===9 && team===home && runs[home]>runs[1-home]) break;
      let outs=0;
      const occupied=[false,false,false];
      while (outs<3) {
        const tracked=team===0 && tier===playerTier && nextBatter[team]===3;
        nextBatter[team]=(nextBatter[team]+1)%9;
        const roll=random();
        if (tracked) batting.pa++;
        if (roll<.08) {
          // Only forced runners advance on a walk.
          const empty=occupied.indexOf(false);
          if (empty===-1) runs[team]++;
          else occupied[empty]=true;
          if (tracked) batting.walks++;
        } else if (roll<(tracked && tier==="2군" ? .38 : .32)) {
          const distance=roll<.099 ? 4 : roll<.15 ? 2 : 1;
          for (let base=2;base>=0;base--) {
            if (!occupied[base]) continue;
            occupied[base]=false;
            if (base+distance>=3) runs[team]++;
            else occupied[base+distance]=true;
          }
          if (distance===4) runs[team]++;
          else occupied[distance-1]=true;
          if (tracked) { batting.hits++; batting.bases+=distance; }
        } else outs++;
        if (inning===9 && team===home && runs[home]>runs[1-home]) break;
      }
    }
  }
  return {week, runs, batting};
}

export function koreaSeason(seed:number, week:number, domestic:Domestic, tier:Tier) {
  const games=[];
  const wins=[0,0];
  const batting=emptyBatting();
  let draws=0;
  const start=week-calendar(week).round+1;
  for (let played=Math.max(start+3,domestic.firstWeek);played<=Math.min(start+32,week);played++) {
    const result=game(seed,played,tier,tierAt(domestic,played));
    games.push(result);
    if (result.runs[0]===result.runs[1]) draws++;
    else wins[result.runs[0]>result.runs[1]?0:1]++;
    batting.pa+=result.batting.pa;
    batting.walks+=result.batting.walks;
    batting.hits+=result.batting.hits;
    batting.bases+=result.batting.bases;
  }
  return {games, wins, draws, batting};
}

export function battingLine(b:Batting):string {
  const ab=b.pa-b.walks;
  const rate=(n:number,d:number)=>d ? (n/d).toFixed(3).replace(/^0/,"") : "—";
  return `${b.pa}타석 · ${b.hits}안타 · 타율 ${rate(b.hits,ab)} · 출루율 ${rate(b.hits+b.walks,b.pa)} · 장타율 ${rate(b.bases,ab)}`;
}

export function schedulePromotion(seed:number, week:number, domestic:Domestic):void {
  if (domestic.promotionWeek!==null || calendar(week).phase!=="정규시즌") return;
  const {batting}=koreaSeason(seed,week,domestic,"2군");
  const ab=batting.pa-batting.walks;
  if (ab>=16 && batting.hits/ab>=.300) domestic.promotionWeek=week+1;
}
