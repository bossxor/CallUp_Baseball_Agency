import {recordCash} from "./cashbook.js";
import {prospectId} from "./draft.js";
import {battingLine, calendar, domesticPlayer, koreaSeason, pitchingLine} from "./korea.js";
import type {State} from "./game.js";

const names:Record<string,string>={[domesticPlayer]:"서도윤",[prospectId]:"한지후"};
const statuses=["open","scheduled","done","expired"] as const;
export const coachingCost=400000;
export interface SupportCase {
  playerId:string;
  deadline:number;
  status:typeof statuses[number];
  choice:"talk"|"coach"|null;
  reviewWeek:number|null;
  report:string;
}
export type SupportCommand={type:"support-talk"|"support-coach";playerId:string};

export function applySupport(state:State, command:SupportCommand):void {
  const item=state.support.find(entry=>entry.playerId===command.playerId);
  if (!item || item.status!=="open" || state.week>item.deadline || !state.clients.includes(item.playerId))
    throw new Error("처리할 수 있는 선수 지원 안건이 없습니다.");
  const coach=command.type==="support-coach";
  if (coach && state.money<coachingCost) throw new Error("외부 코칭 비용이 부족합니다.");
  item.choice=coach?"coach":"talk";
  item.reviewWeek=state.week+(coach?2:1);
  item.status="scheduled";
  if (coach) recordCash(state,-coachingCost,names[item.playerId]+" 외부 코칭");
}

export function advanceSupport(state:State):string[] {
  const {week,domestic}=state;
  const draft=domestic.draft;
  const season=calendar(week);
  const notes:string[]=[];
  const playerId=domestic.promotionWeek===week ? domesticPlayer :
    draft?.status==="registered" && season.season===draft.season+1 && season.round===4 ? prospectId : null;
  if (playerId && state.clients.includes(playerId)) {
    state.support.push({playerId,status:"open",deadline:week+2,choice:null,reviewWeek:null,report:""});
    notes.push(names[playerId]+"의 새 역할에 대한 지원 안건이 도착했습니다.");
  }
  for (const item of state.support) {
    if (item.status==="open" && week>item.deadline) item.status="expired";
    if (item.status!=="scheduled" || item.reviewWeek!==week) continue;
    const hitter=item.playerId===domesticPlayer;
    if (item.choice==="talk") item.report=hitter
      ? "역할 상담 · 1군 외야에서 기회를 꾸준히 얻는 것을 우선합니다. 다음 상담에서 타석 수와 출루 추이를 확인하기로 했습니다."
      : "역할 상담 · 2군 불펜에 적응 중입니다. 다음 상담에서 등판마다 볼넷과 주자 허용이 어떤지 확인하기로 했습니다.";
    else {
      const stats=koreaSeason(state.seed,week,domestic,hitter?"1군":"2군");
      item.report=hitter
        ? "외부 코치 · "+battingLine(stats.batting)+". 타석 표본을 더 모으면서 빠른 볼 승부와 출루율을 함께 점검합니다."
        : "외부 코치 · "+pitchingLine(stats.pitching)+". 피안타 "+stats.pitching.hits+"개. 볼넷과 피안타를 구분해 불펜 등판 내용을 점검합니다.";
    }
    item.status="done";
    notes.push(names[item.playerId]+"의 선수 지원 결과가 도착했습니다.");
  }
  return notes;
}

export function validateSupport(state:State):void {
  if (state.support===undefined) state.support=[];
  const invalid=()=>new Error("선수 지원 기록이 손상되었습니다.");
  if (!Array.isArray(state.support) || state.support.length>2) throw invalid();
  const players=new Set<string>();
  for (const item of state.support) {
    if (!item || !Object.hasOwn(names,item.playerId) || !state.clients.includes(item.playerId) || players.has(item.playerId) ||
        !Number.isSafeInteger(item.deadline) || item.deadline<3 || item.deadline>state.week+2 || !statuses.includes(item.status) ||
        typeof item.report!=="string" || item.report.length>500) throw invalid();
    const reviewed=item.status==="scheduled" || item.status==="done";
    if (reviewed) {
      if (item.choice!=="talk" && item.choice!=="coach") throw invalid();
      const lag=item.choice==="coach"?2:1;
      if (!Number.isSafeInteger(item.reviewWeek) || item.reviewWeek!<item.deadline-2+lag || item.reviewWeek!>item.deadline+lag ||
          (item.status==="scheduled" ? item.reviewWeek!<=state.week || item.report!=="" : item.reviewWeek!>state.week || !item.report))
        throw invalid();
    } else if (item.choice!==null || item.reviewWeek!==null || item.report!=="" ||
        (item.status==="open" ? state.week>item.deadline : state.week<=item.deadline)) throw invalid();
    players.add(item.playerId);
  }
}
