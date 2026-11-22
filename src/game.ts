import {advanceRenewals, applyRenewal, battingLine, calendar, domesticTeams, domesticPlayer, koreaSeason, schedulePromotion, tierAt, validateRenewals, type Domestic, type RenewalCommand} from "./korea.js";
import {advanceClubDeals, applyClubDeal, validateClubDeals,
  type ClubDeals, type DealCommand} from "./club-deals.js";

export const markets = ["한국", "일본", "대만", "미국"] as const;
export type Market = typeof markets[number];
export interface Player {
  id: string; name: string; age: number; position: string; market: Market;
  club: string; level: string; ability: number; potential: number;
  appearances: number; line: string; opinion: string;
}
export const players: Player[] = [
  {id:"kr-1",name:"서도윤",age:20,position:"외야수",market:"한국",club:"인천 웨이브스",level:"2군",
    ability:52,potential:79,appearances:84,line:"84타석 · .286 / .369 / .429",opinion:"빠른 공에 배트가 밀리지 않습니다. 바깥쪽 변화구를 고르는 장면은 더 지켜봐야 합니다."},
  {id:"kr-2",name:"한지후",age:18,position:"우완 투수",market:"한국",club:"성남 야구고",level:"아마추어",
    ability:44,potential:83,appearances:72,line:"24이닝 · 29탈삼진 · 11볼넷",opinion:"직구 끝이 좋고 긴 이닝에도 구속이 유지됩니다. 주자가 나갔을 때 제구가 흔들립니다."},
  {id:"tw-1",name:"린위천",age:21,position:"유격수",market:"대만",club:"타이중 그로브",level:"1군",
    ability:58,potential:78,appearances:96,line:"96타석 · .271 / .344 / .396",opinion:"첫발과 송구가 안정적입니다. 타석에서는 높은 공을 참는 빈도가 늘었습니다."},
  {id:"tw-2",name:"천보위",age:19,position:"좌완 투수",market:"대만",club:"타이난 하버",level:"육성",
    ability:47,potential:85,appearances:57,line:"19이닝 · 23탈삼진 · 8볼넷",opinion:"좌타자에게 바깥쪽 승부를 합니다. 선발로 길게 던지는 경기를 한 번 더 봐야 합니다."},
  {id:"jp-1",name:"사토 렌",age:22,position:"포수",market:"일본",club:"나고야 크레인스",level:"육성",
    ability:55,potential:76,appearances:61,line:"61타석 · .262 / .338 / .377",opinion:"낮은 공을 막는 자세가 좋습니다. 송구 동작은 정확하지만 시간이 조금 걸립니다."},
  {id:"us-1",name:"마커스 리드",age:25,position:"우완 투수",market:"미국",club:"오클랜드 베이",level:"마이너",
    ability:65,potential:73,appearances:111,line:"37이닝 · 41탈삼진 · 13볼넷",opinion:"선발과 불펜을 모두 경험했습니다. 꾸준한 등판 기회와 보장 계약을 원합니다."},
];
const followUpNotes:Record<string,string>={
  "kr-1":"바깥쪽 변화구에 배트가 먼저 나갑니다. 빠른 공 대처와 외야 수비가 상위 리그에서 출전할 근거입니다.",
  "kr-2":"주자가 없을 때는 같은 높이로 직구를 반복합니다. 세트 포지션에서는 릴리스가 빨라져 공이 높아집니다.",
  "tw-1":"깊은 타구를 잡은 뒤에도 첫 송구가 정확합니다. 높은 공을 흘려보내며 유리한 볼카운트를 만듭니다.",
  "tw-2":"선발 등판 후반에도 좌타자 바깥쪽 제구를 유지했습니다. 우타자 상대 변화구는 높은 쪽으로 빠졌습니다.",
  "jp-1":"낮은 변화구를 몸 앞에 떨어뜨립니다. 주자가 뛸 때 공을 빼는 동작이 길어 송구 시간을 더 줄여야 합니다.",
  "us-1":"선발로 타순이 한 바퀴 돈 뒤에도 직구 제구를 유지했습니다. 짧은 등판에서는 변화구 선택이 단순해집니다.",
};
export const introId="intro-kr-1";
export interface Mission {id:string; market:Market; sent:number; due:number; playerId?:string}
export interface Candidate {player:Player; low:number; high:number}
export interface Report {id:string; market:Market; week:number; page:number; candidates:Candidate[]; playerId?:string}
export interface Matter {
  id:string; playerId:string; title:string; body:string; due:number; done:boolean;
}
export interface Summary {week:number; text:string}
export interface State {
  version:1; seed:number; week:number; agency:string; money:number; nextId:number;
  missions:Mission[]; reports:Report[]; interests:string[]; clients:string[];
  meetings:{playerId:string; due:number}[]; matters:Matter[]; summaries:Summary[];
  domestic:Domestic;
  clubDeals:ClubDeals;
}
export type Command = DealCommand | RenewalCommand
  | {type:"introduction"}
  | {type:"dispatch"; market:Market}
  | {type:"follow-up"; playerId:string}
  | {type:"interest"|"unwatch"; playerId:string}
  | {type:"meeting"; playerId:string}
  | {type:"sign"; matterId:string}
  | {type:"decline"; matterId:string}
  | {type:"page"; reportId:string; page:number};
export const followUpCost=300000;
export const missionCost = (market:Market) => market === "한국" ? 500000 : 1200000;
export const missionWeeks = (market:Market) => market === "한국" ? 2 : 3;

export function createState(agency = "콜업 에이전시", seed = 20261119):State {
  return {version:1,seed,week:1,agency:agency.trim().slice(0,24) || "콜업 에이전시",
    money:15000000,nextId:1,missions:[],reports:[],interests:[],clients:[],meetings:[],matters:[],
    domestic:{firstWeek:2,promotionWeek:null,renewals:[]}, clubDeals:{offers:[],contract:null},
    summaries:[{week:1,text:"창업 첫 주입니다. 국내외 조사 지역을 정하고 첫 파견을 준비하세요."}]};
}
function requirePlayer(id:string):Player {
  const player = players.find(player => player.id === id);
  if (!player) throw new Error("선수를 찾을 수 없습니다.");
  return player;
}
export function act(current:State, command:Command):State {
  const state = structuredClone(current);
  switch (command.type) {
    case "recommend":
    case "counter":
    case "accept-offer":
      applyClubDeal(state,command);
      break;
    case "renewal-counter":
    case "renewal-accept":
    case "renewal-decline":
      if (!state.clients.includes(domesticPlayer)) throw new Error("선수의 에이전시 계약을 확인하세요.");
      applyRenewal(state.domestic,state.week,command);
      break;
    case "introduction": {
      if (state.reports.some(r=>r.id===introId)) return current;
      if (state.week!==1) throw new Error("창업 첫 주에 받을 수 있는 소개입니다.");
      const player=structuredClone(requirePlayer(domesticPlayer));
      state.reports.push({id:introId,page:0,week:1,market:player.market,
        candidates:[{player,low:player.potential-10,high:player.potential+5}]});
      break;
    }
    case "dispatch":
      if (!markets.includes(command.market)) throw new Error("조사 지역을 선택하세요.");
      if (state.missions.length) throw new Error("파견 중인 스카우트가 돌아오면 다시 보낼 수 있습니다.");
      if (state.money < missionCost(command.market)) throw new Error("파견 비용이 부족합니다.");
      state.money -= missionCost(command.market);
      state.missions.push({id:"report-"+state.nextId++,market:command.market,sent:state.week,
        due:state.week+missionWeeks(command.market)});
      break;
    case "follow-up": {
      const player=requirePlayer(command.playerId);
      if (state.missions.some(item=>item.playerId===player.id) || state.reports.some(item=>item.playerId===player.id)) return current;
      if (!state.reports.some(report=>report.candidates.some(candidate=>candidate.player.id===player.id)))
        throw new Error("먼저 지역 파견에서 선수를 관찰하세요.");
      if (state.missions.length) throw new Error("스카우트가 복귀하면 추가 조사를 보낼 수 있습니다.");
      if (state.money<followUpCost) throw new Error("추가 조사 비용이 부족합니다.");
      state.money-=followUpCost;
      state.missions.push({id:"report-"+state.nextId++,market:player.market,playerId:player.id,sent:state.week,due:state.week+1});
      break;
    }
    case "unwatch":
      requirePlayer(command.playerId);
      state.interests=state.interests.filter(id=>id!==command.playerId);
      break;
    case "interest":
      requirePlayer(command.playerId);
      if (!state.interests.includes(command.playerId)) state.interests.push(command.playerId);
      break;
    case "meeting":
      requirePlayer(command.playerId);
      if (state.clients.includes(command.playerId) || state.meetings.some(item=>item.playerId===command.playerId) ||
          state.matters.some(item=>item.playerId===command.playerId && !item.done)) return current;
      if (!state.reports.some(report=>report.candidates.some(item=>item.player.id===command.playerId)))
        throw new Error("보고서에서 조사한 선수에게 면담을 요청할 수 있습니다.");
      state.meetings.push({playerId:command.playerId,due:state.week+1});
      break;
    case "decline":
    case "sign": {
      const matter = state.matters.find(item=>item.id===command.matterId);
      if (!matter) throw new Error("해당 안건을 찾을 수 없습니다.");
      if (matter.done) return current;
      if (state.week > matter.due) throw new Error("답변 기한이 지났습니다.");
      if (command.type === "sign") {
        if (state.clients.length >= 3) throw new Error("현재 고객은 3명까지 담당할 수 있습니다.");
        if (!state.clients.includes(matter.playerId)) state.clients.push(matter.playerId);
      }
      matter.done = true;
      break;
    }
    case "page": {
      const report = state.reports.find(item=>item.id===command.reportId);
      if (!report || !Number.isInteger(command.page) || command.page < 0 ||
          command.page >= Math.max(1,report.candidates.length)) throw new Error("보고서의 장을 찾을 수 없습니다.");
      report.page = command.page;
      break;
    }
  }
  return state;
}
function draw(seed:number, week:number, salt:number):number {
  let value = (seed ^ Math.imul(week,2654435761) ^ Math.imul(salt,2246822519)) >>> 0;
  value = Math.imul(value ^ value >>> 16, 3266489917);
  return (value >>> 0) / 4294967296;
}
export function currentProfile(state:State, player:Player):Player {
  if (player.id!==domesticPlayer) return player;
  const level=tierAt(state.domestic,state.week);
  const {batting}=koreaSeason(state.seed,state.week,state.domestic,level);
  if (!batting.pa) return {...player,level,line:"이번 시즌 출전 전",appearances:0};
  return {...player,level,line:battingLine(batting),appearances:batting.pa};
}
export function step(current:State):{state:State; important:boolean} {
  const state = structuredClone(current);
  state.week++;
  let important = false;
  const notes:string[] = [];
  schedulePromotion(state.seed,state.week,state.domestic);
  if (state.domestic.promotionWeek===state.week) {
    notes.push("인천 웨이브스가 서도윤을 1군에 등록했습니다.");
    important=state.clients.includes(domesticPlayer) || state.interests.includes(domesticPlayer);
  }
  for (const mission of state.missions.filter(item=>item.due <= state.week)) {
    const pool = mission.playerId ? [requirePlayer(mission.playerId)] :
      players.filter(player=>player.market===mission.market && !state.clients.includes(player.id))
        .filter((_,index)=>draw(state.seed,state.week,index+state.nextId) > .16);
    const candidates=pool.map(original=>{
      const player=currentProfile(state,original);
      const snapshot=structuredClone(player);
      if (mission.playerId) snapshot.opinion=followUpNotes[player.id];
      return {player:snapshot,low:Math.max(player.ability,player.potential-(mission.playerId?3:10)),
        high:Math.min(99,player.potential+(mission.playerId?2:5))};
    });
    state.reports.push({id:mission.id,market:mission.market,week:state.week,page:0,candidates,...(mission.playerId ? {playerId:mission.playerId} : {})});
    notes.push((mission.playerId ? requirePlayer(mission.playerId).name+" 추가 조사" : mission.market+" 스카우트")+" 보고서가 도착했습니다.");
    important = true;
  }
  state.missions = state.missions.filter(item=>item.due > state.week);
  for (const meeting of state.meetings.filter(item=>item.due <= state.week)) {
    const player = requirePlayer(meeting.playerId);
    state.matters.push({id:"matter-"+state.nextId++,playerId:player.id,due:state.week+2,done:false,
      title:player.name+"의 면담 답변",body:"출전 기회와 장기적인 지원을 함께 논의하고 싶어 합니다. 고객 계약은 2년, 수수료는 5%입니다."});
    notes.push(player.name+"에게 면담 답변이 왔습니다.");
    important = true;
  }
  state.meetings = state.meetings.filter(item=>item.due > state.week);
  for (const matter of state.matters) if (!matter.done && state.week > matter.due) {
    matter.done = true;
    notes.push(matter.title+"의 답변 기한이 지났습니다.");
  }
  const clubNews=advanceClubDeals(state);
  notes.push(...clubNews);
  const renewal=advanceRenewals(state.seed,state.week,state.domestic,state.clients.includes(domesticPlayer));
  state.money+=renewal.fee;
  notes.push(...renewal.notes);
  important ||= clubNews.length>0 || renewal.notes.length>0;
  if (calendar(state.week).phase==="정규시즌") {
    const latest=koreaSeason(state.seed,state.week,state.domestic,"1군").games.at(-1);
    if (latest) notes.push(`국내 1군 · ${domesticTeams[0]} ${latest.runs[0]} : ${latest.runs[1]} ${domesticTeams[1]}`);
  }
  state.summaries.unshift({week:state.week,text:notes.join(" ") ||
    "새로 도착한 안건이 없습니다. 선수 기록과 조사 현황을 살펴보거나 다음 주로 진행하세요."});
  state.summaries = state.summaries.slice(0,52);
  return {state,important};
}
export function hasPendingDecision(state:State):boolean {
  return state.matters.some(item=>!item.done) || state.clubDeals.offers.some(offer=>offer.status==="open") ||
    state.domestic.renewals.at(-1)?.status==="open";
}

export function advance(current:State, count:number):State[] {
  if (!Number.isInteger(count) || count < 1 || count > 4) throw new Error("1~4주를 선택하세요.");
  const weeks = hasPendingDecision(current) ? 1 : count;
  const states:State[] = [];
  let state = current;
  for (let index=0;index<weeks;index++) {
    const result = step(state);
    state = result.state;
    states.push(state);
    if (result.important) break;
  }
  return states;
}
export function parseSave(text:string):State {
  if (text.length > 1000000) throw new Error("저장 파일이 너무 큽니다.");
  const state = JSON.parse(text) as State;
  if (state.version!==1 || !Number.isSafeInteger(state.week) || state.week<1 ||
      !Number.isSafeInteger(state.seed) || typeof state.agency!=="string" || state.agency.length>24 ||
      !Number.isSafeInteger(state.money) || state.money<0 || !Number.isSafeInteger(state.nextId) || state.nextId<1)
    throw new Error("지원하지 않거나 손상된 저장 데이터입니다.");
  for (const key of ["missions","reports","interests","clients","meetings","matters","summaries"] as const)
    if (!Array.isArray(state[key])) throw new Error("저장 데이터의 목록이 손상되었습니다.");
  if (state.clients.length>3 || new Set(state.clients).size!==state.clients.length ||
      [...state.clients,...state.interests].some(id=>!players.some(player=>player.id===id)))
    throw new Error("저장 데이터의 선수 정보가 손상되었습니다.");
  if (state.missions.length>1 || state.missions.some(item=>!markets.includes(item.market) ||
      !Number.isSafeInteger(item.due) || !Number.isSafeInteger(item.sent) || item.due<=item.sent))
    throw new Error("저장 데이터의 파견 정보가 손상되었습니다.");
  for (const report of state.reports) {
    if (typeof report.id!=="string" || !markets.includes(report.market) || !Number.isSafeInteger(report.week) ||
        !Array.isArray(report.candidates) || !Number.isInteger(report.page) || report.page<0 ||
        report.page>=Math.max(1,report.candidates.length)) throw new Error("저장된 보고서를 읽을 수 없습니다.");
    for (const candidate of report.candidates) {
      const snapshot=candidate.player;
      requirePlayer(snapshot?.id);
      if (typeof snapshot.name!=="string" || typeof snapshot.club!=="string" ||
          typeof snapshot.level!=="string" || typeof snapshot.position!=="string" ||
          typeof snapshot.line!=="string" || typeof snapshot.opinion!=="string" ||
          !markets.includes(snapshot.market) || !Number.isSafeInteger(snapshot.age) ||
          !Number.isFinite(snapshot.ability) || !Number.isFinite(snapshot.potential) ||
          !Number.isSafeInteger(snapshot.appearances) || !Number.isFinite(candidate.low) ||
          !Number.isFinite(candidate.high) || candidate.low>candidate.high)
        throw new Error("보고서의 후보 정보가 손상되었습니다.");
    }
  }
  if (state.meetings.some(item=>!players.some(player=>player.id===item.playerId) || !Number.isSafeInteger(item.due)) ||
      state.matters.some(item=>typeof item.id!=="string" || typeof item.title!=="string" ||
        typeof item.body!=="string" || typeof item.done!=="boolean" || !Number.isSafeInteger(item.due) ||
        !players.some(player=>player.id===item.playerId)) ||
      state.summaries.some(item=>!Number.isSafeInteger(item.week) || typeof item.text!=="string"))
    throw new Error("저장된 업무 이력이 손상되었습니다.");
  if (state.domestic===undefined) state.domestic={firstWeek:state.week+1,promotionWeek:null,renewals:[]};
  const d=state.domestic;
  if (!d || !Number.isSafeInteger(d.firstWeek) || d.firstWeek<1 || d.firstWeek>state.week+1 ||
      (d.promotionWeek!==null && (!Number.isSafeInteger(d.promotionWeek) || d.promotionWeek<=d.firstWeek || d.promotionWeek>state.week+1)))
    throw new Error("국내 리그 기록이 손상되었습니다.");
  for (const item of [...state.missions,...state.reports]) {
    if (item.playerId===undefined) continue;
    if (requirePlayer(item.playerId).market!==item.market ||
        ("candidates" in item && (item.candidates.length!==1 || item.candidates[0].player.id!==item.playerId)))
      throw new Error("추가 조사 기록이 손상되었습니다.");
  }
  validateRenewals(state.domestic,state.seed,state.week,state.clients.includes(domesticPlayer));
  validateClubDeals(state);
  return state;
}
