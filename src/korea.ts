export type Tier = "1군" | "2군";
export interface Domestic {
  firstWeek:number;
  promotionWeek:number|null;
  renewals:Renewal[];
}
const renewalStatuses=["open","counter","pending","registered","declined","expired"] as const;
interface Renewal {
  season:number;
  salary:number;
  status:typeof renewalStatuses[number];
  raise:10|25|null;
  replyWeek:number|null;
}
export type RenewalCommand =
  | {type:"renewal-counter"; season:number; raise:10|25}
  | {type:"renewal-accept"|"renewal-decline"; season:number};
export const renewalDeadline=(season:number)=>(season-1)*52+39;
export const renewalRegistration=(season:number)=>season*52+1;
export const renewalFee=(salary:number)=>Math.floor(salary/20);
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

function renewalTerms(seed:number, domestic:Domestic, season:number) {
  const seasonEnd=(season-1)*52+33;
  const first=koreaSeason(seed,seasonEnd,domestic,"1군").batting;
  const second=koreaSeason(seed,seasonEnd,domestic,"2군").batting;
  const salary=32000000+Math.min(16000000,first.pa*100000+second.pa*50000);
  const ab=first.pa-first.walks;
  return {played:first.pa+second.pa>0,salary,raiseLimit:ab>=50 && first.hits/ab>=.32 ? 25 : 10};
}

export const renewalOpeningSalary=(seed:number,domestic:Domestic,season:number)=>renewalTerms(seed,domestic,season).salary;

export function applyRenewal(domestic:Domestic, week:number, command:RenewalCommand):void {
  const renewal=domestic.renewals.find(item=>item.season===command.season);
  if (command.type==="renewal-accept" && (renewal?.status==="pending" || renewal?.status==="registered")) return;
  if (!renewal || renewal.status!=="open" || week>renewalDeadline(renewal.season))
    throw new Error("응답할 수 있는 국내 연봉 제안이 없습니다.");
  if (command.type==="renewal-counter") {
    if (renewal.raise!==null || week>=renewalDeadline(renewal.season) || (command.raise!==10 && command.raise!==25))
      throw new Error("역제안은 마감 전까지 10% 또는 25%로 한 번 가능합니다.");
    renewal.raise=command.raise;
    renewal.replyWeek=week+1;
    renewal.status="counter";
    return;
  }
  renewal.status=command.type==="renewal-accept"?"pending":"declined";
}

export function advanceRenewals(seed:number, week:number, domestic:Domestic, client:boolean) {
  const {round,season}=calendar(week);
  const notes:string[]=[];
  let fee=0;
  if (round===36 && client) {
    const terms=renewalTerms(seed,domestic,season);
    if (terms.played) {
      domestic.renewals.push({season,salary:terms.salary,status:"open",raise:null,replyWeek:null});
      notes.push("인천 웨이브스가 서도윤의 다음 시즌 연봉을 제안했습니다.");
    }
  }
  for (const renewal of domestic.renewals.slice(-2)) {
    if (renewal.status==="open" && week>renewalDeadline(renewal.season)) {
      renewal.status="expired";
      notes.push("서도윤의 연봉 제안 기한이 지났습니다.");
    } else if (renewal.status==="counter" && renewal.replyWeek===week) {
      const terms=renewalTerms(seed,domestic,renewal.season);
      const raise=renewal.raise!;
      if (raise<=terms.raiseLimit) {
        renewal.salary=Math.floor(terms.salary*(100+raise)/100);
        notes.push("인천이 서도윤의 연봉 인상 요청을 받아들였습니다.");
      } else notes.push("인천이 기존 연봉 조건을 유지했습니다.");
      renewal.status="open";
    } else if (renewal.status==="pending" && renewalRegistration(renewal.season)===week) {
      renewal.status="registered";
      fee=renewalFee(renewal.salary);
      notes.push("서도윤의 재계약을 등록하고 에이전시 수수료가 입금됐습니다.");
    }
  }
  return {notes,fee};
}

export function validateRenewals(domestic:Domestic, seed:number, week:number, client:boolean) {
  if (domestic.renewals===undefined) domestic.renewals=[];
  const invalid=()=>new Error("국내 연봉 협상 정보가 손상되었습니다.");
  if (!Array.isArray(domestic.renewals) || (domestic.renewals.length>0 && !client)) throw invalid();
  let previous=0;
  for (const item of domestic.renewals) {
    if (!item || !Number.isSafeInteger(item.season) || item.season<=previous || item.season>calendar(week).season ||
        !renewalStatuses.includes(item.status)) throw invalid();
    const deadline=renewalDeadline(item.season);
    if (week<deadline-3 || domestic.firstWeek>deadline-6) throw invalid();
    if (item.raise===null ? item.replyWeek!==null || item.status==="counter" :
        (item.raise!==10 && item.raise!==25) || !Number.isSafeInteger(item.replyWeek) || item.replyWeek!<deadline-2 ||
        item.replyWeek!>deadline || (item.status==="counter" ? item.replyWeek!<=week : item.replyWeek!>week)) throw invalid();
    if (item.status==="open" && week>deadline || item.status==="expired" && week<=deadline ||
        item.status==="pending" && week>=renewalRegistration(item.season) ||
        item.status==="registered" && week<renewalRegistration(item.season)) throw invalid();
    const terms=renewalTerms(seed,domestic,item.season);
    const raise=item.raise??0;
    const salary=item.status!=="counter" && raise<=terms.raiseLimit ? Math.floor(terms.salary*(100+raise)/100) : terms.salary;
    if (!terms.played || item.salary!==salary) throw invalid();
    previous=item.season;
  }
}
