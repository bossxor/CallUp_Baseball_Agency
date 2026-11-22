import {recordCash} from "./cashbook.js";
import {calendar, domesticTeams, koreaSeason, renewalRegistration} from "./korea.js";
import type {State} from "./game.js";

export const prospectId="kr-2";
export const draftRound=34;
const statuses=["undrafted","open","counter","pending","registered","expired"] as const;
interface DraftResult {
  season:number;
  team:0|1|null;
  round:1|2|null;
  status:typeof statuses[number];
  salary:number;
  bonus:number;
  counter:"unused"|"sent"|"accepted"|"rejected";
  replyWeek:number|null;
  represented:boolean;
}
export type Draft = DraftResult|null;
export type DraftCommand = {type:"draft-counter"|"draft-accept";season:number};
export const draftDeadline=(season:number)=>(season-1)*52+37;
export const draftRegistration=renewalRegistration;
export const draftFee=(draft:DraftResult)=>draft.represented ? Math.floor((draft.salary+draft.bonus)/20) : 0;
const draftBonus=(round:DraftResult["round"])=>round===1?60000000:round===2?35000000:0;

export function applyDraft(state:State, command:DraftCommand):void {
  const draft=state.domestic.draft;
  if (!draft || draft.season!==command.season || !state.clients.includes(prospectId))
    throw new Error("담당 선수의 신인 계약 제안을 확인하세요.");
  if (command.type==="draft-accept" && draft.represented && (draft.status==="pending" || draft.status==="registered")) return;
  if (draft.status!=="open" || state.week>draftDeadline(draft.season)) throw new Error("응답할 수 있는 신인 계약 제안이 없습니다.");
  if (command.type==="draft-accept") {
    draft.represented=true;
    draft.status="pending";
  } else {
    if (draft.counter!=="unused" || state.week>=draftDeadline(draft.season))
      throw new Error("계약금 역제안은 마감 전에 한 번 가능합니다.");
    draft.counter="sent";
    draft.replyWeek=state.week+1;
    draft.status="counter";
  }
}

export function advanceDraft(state:State, roll:number):string {
  const {round:weekOfSeason,season}=calendar(state.week);
  const client=state.clients.includes(prospectId);
  const watched=client || state.interests.includes(prospectId);
  const prior=state.domestic.draft;
  if (weekOfSeason===draftRound && (prior===null || prior.status==="undrafted" || prior.status==="expired")) {
    const round=roll<.55?1:roll<.86?2:null;
    const league=koreaSeason(state.seed,state.week,state.domestic,"1군");
    const team=round===null?null:league.wins[0]<league.wins[1]?0:1;
    state.domestic.draft={season,team,round,status:round===null?"undrafted":"open",salary:round===null?0:30000000,
      bonus:draftBonus(round),counter:"unused",replyWeek:null,represented:false};
    if (!watched) return "";
    return team===null ? "한지후가 신인 드래프트에서 지명받지 못했습니다. 다음 시즌 다시 참가할 수 있습니다." :
      domesticTeams[team]+"가 "+round+"라운드에서 한지후를 지명했습니다.";
  }
  if (!prior || prior.team===null) return "";
  const club=domesticTeams[prior.team];
  if (prior.status==="counter" && prior.replyWeek===state.week) {
    prior.counter=prior.round===1?"accepted":"rejected";
    if (prior.counter==="accepted") prior.bonus=prior.bonus*6/5;
    prior.status="open";
    return prior.counter==="accepted" ? club+"가 한지후의 계약금 인상을 받아들였습니다." : club+"가 한지후에게 기존 계약금 조건을 유지했습니다.";
  }
  if (prior.status==="open" && state.week>draftDeadline(prior.season)) {
    prior.status=client?"expired":"pending";
    return client ? "한지후의 신인 계약 기한이 지났습니다. 다음 시즌 드래프트에서 다시 도전합니다." : "";
  }
  if (prior.status==="pending" && state.week===draftRegistration(prior.season)) {
    prior.status="registered";
    recordCash(state,draftFee(prior),"한지후 신인 계약 수수료");
    if (watched) {
      const feeNote=prior.represented?" 에이전시 수수료가 입금됐습니다.":"";
      return club+"가 한지후를 2군에 등록했습니다."+feeNote;
    }
  }
  return "";
}

export function validateDraft(state:State):void {
  if (state.domestic.draft===undefined) state.domestic.draft=null;
  const draft=state.domestic.draft;
  if (draft===null) return;
  const invalid=()=>new Error("국내 드래프트 기록이 손상되었습니다.");
  if (!draft || !Number.isSafeInteger(draft.season) || draft.season<1 || draft.season>calendar(state.week).season ||
      !statuses.includes(draft.status) || typeof draft.represented!=="boolean" ||
      !["unused","sent","accepted","rejected"].includes(draft.counter)) throw invalid();
  const deadline=draftDeadline(draft.season);
  const hasCounter=draft.counter!=="unused";
  if (hasCounter && !state.clients.includes(prospectId)) throw invalid();
  if (state.week<deadline-3 ||
      (hasCounter ? !Number.isSafeInteger(draft.replyWeek) || draft.replyWeek!<deadline-2 || draft.replyWeek!>deadline : draft.replyWeek!==null) ||
      (draft.status==="counter")!==(draft.counter==="sent") ||
      (hasCounter && (draft.status==="counter" ? draft.replyWeek!==state.week+1 : draft.replyWeek!>state.week)) ||
      (draft.represented && (!state.clients.includes(prospectId) || !["pending","registered"].includes(draft.status)))) throw invalid();
  if (draft.status==="undrafted") {
    if (draft.team!==null || draft.round!==null || draft.salary!==0 || draft.bonus!==0 || hasCounter) throw invalid();
    return;
  }
  if ((draft.team!==0 && draft.team!==1) || (draft.round!==1 && draft.round!==2) || draft.salary!==30000000 ||
      (draft.counter==="accepted" && draft.round!==1) || (draft.counter==="rejected" && draft.round!==2) ||
      draft.bonus!==draftBonus(draft.round)*(draft.counter==="accepted"?1.2:1) ||
      (draft.status==="open" && state.week>deadline) || (draft.status==="expired" && state.week<=deadline) ||
      (draft.status==="pending" && ((!draft.represented && state.week<=deadline) || state.week>=draftRegistration(draft.season))) ||
      (draft.status==="registered" && state.week<draftRegistration(draft.season))) throw invalid();
}
