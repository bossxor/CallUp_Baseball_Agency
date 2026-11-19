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
export interface Mission {id:string; market:Market; sent:number; due:number}
export interface Candidate {player:Player; low:number; high:number}
export interface Report {id:string; market:Market; week:number; page:number; candidates:Candidate[]}
export interface Matter {
  id:string; playerId:string; title:string; body:string; due:number; done:boolean;
}
export interface Summary {week:number; text:string}
export interface State {
  version:1; seed:number; week:number; agency:string; money:number; nextId:number;
  missions:Mission[]; reports:Report[]; interests:string[]; clients:string[];
  meetings:{playerId:string; due:number}[]; matters:Matter[]; summaries:Summary[];
}
export type Command =
  | {type:"dispatch"; market:Market}
  | {type:"interest"; playerId:string}
  | {type:"meeting"; playerId:string}
  | {type:"sign"; matterId:string}
  | {type:"decline"; matterId:string}
  | {type:"page"; reportId:string; page:number};
export const missionCost = (market:Market) => market === "한국" ? 500000 : 1200000;
export const missionWeeks = (market:Market) => market === "한국" ? 2 : 3;

export function createState(agency = "콜업 에이전시", seed = 20261119):State {
  return {version:1,seed,week:1,agency:agency.trim().slice(0,24) || "콜업 에이전시",
    money:15000000,nextId:1,missions:[],reports:[],interests:[],clients:[],meetings:[],matters:[],
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
    case "dispatch":
      if (!markets.includes(command.market)) throw new Error("조사 지역을 선택하세요.");
      if (state.missions.length) throw new Error("파견 중인 스카우트가 돌아오면 다시 보낼 수 있습니다.");
      if (state.money < missionCost(command.market)) throw new Error("파견 비용이 부족합니다.");
      state.money -= missionCost(command.market);
      state.missions.push({id:"report-"+state.nextId++,market:command.market,sent:state.week,
        due:state.week+missionWeeks(command.market)});
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
export function step(current:State):{state:State; important:boolean} {
  const state = structuredClone(current);
  state.week++;
  let important = false;
  const notes:string[] = [];
  for (const mission of state.missions.filter(item=>item.due <= state.week)) {
    const pool = players.filter(player=>player.market===mission.market && !state.clients.includes(player.id));
    const candidates = pool.filter((_,index)=>draw(state.seed,state.week,index+state.nextId) > .16)
      .map(player=>({player:structuredClone(player),low:Math.max(player.ability,player.potential-10),
        high:Math.min(99,player.potential+5)}));
    state.reports.push({id:mission.id,market:mission.market,week:state.week,page:0,candidates});
    notes.push(mission.market+" 스카우트 보고서가 도착했습니다.");
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
  state.summaries.unshift({week:state.week,text:notes.join(" ") ||
    "새로 도착한 안건이 없습니다. 선수 기록과 조사 현황을 살펴보거나 다음 주로 진행하세요."});
  state.summaries = state.summaries.slice(0,52);
  return {state,important};
}
export function advance(current:State, count:number):State[] {
  if (!Number.isInteger(count) || count < 1 || count > 4) throw new Error("1~4주를 선택하세요.");
  const weeks = current.matters.some(item=>!item.done) ? 1 : count;
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
  return state;
}
