import {recordCash} from "./cashbook.js";
import type {State} from "./game.js";

// shortcut: one eligible free agent and fixed club needs until the roster simulation drives the market.
export const freeAgentId = "us-1";
export const clubs = {
  tainan:{name:"타이난 하버",market:"대만",role:"선발",delay:1,years:1,salary:160000000,budget:190000000,slots:1,currency:"TWD",rate:44},
  nagoya:{name:"나고야 크레인스",market:"일본",role:"불펜",delay:2,years:2,salary:220000000,budget:520000000,slots:1,currency:"JPY",rate:9},
  taichung:{name:"타이중 그로브",market:"대만",role:"선발",delay:1,years:1,salary:155000000,budget:180000000,slots:0,currency:"TWD",rate:44},
} as const;
export type ClubId = keyof typeof clubs;
const statuses = ["waiting","open","counter","expired","closed","accepted"] as const;
const replies = ["none","improved","declined"] as const;
export interface ClubOffer {
  id:string; clubId:ClubId; status:typeof statuses[number]; reply:typeof replies[number];
  salary:number; replyWeek:number; deadline:number; requestedSalary:number | null;
}
export interface ClubContract {
  offerId:string; clubId:ClubId; registrationWeek:number;
  salary:number; fee:number; status:"pending"|"registered";
}
export interface ClubDeals { offers:ClubOffer[]; contract:ClubContract | null }
export type DealCommand =
  | {type:"recommend"; clubId:ClubId; playerId:string}
  | {type:"counter"; offerId:string; salary:number}
  | {type:"accept-offer"; offerId:string};

function knownClub(id:unknown):id is ClubId {
  return typeof id === "string" && Object.hasOwn(clubs,id);
}

export function playerAgrees(offer:ClubOffer):boolean {
  return clubs[offer.clubId].role==="선발" || offer.salary>=245000000;
}

function checkCapacity(clubId:ClubId,salary:number):void {
  const club = clubs[clubId];
  if (!club.slots) throw new Error("외국인 등록 자리가 없습니다.");
  if (salary*club.years>club.budget) throw new Error("구단의 보장 연봉 예산을 초과합니다.");
}

export function applyClubDeal(state:State, command:DealCommand):void {
  const {offers,contract} = state.clubDeals;
  if (command.type==="recommend") {
    if (!state.clients.includes(command.playerId)) throw new Error("담당 고객만 추천할 수 있습니다.");
    if (command.playerId!==freeAgentId || contract) throw new Error("해외 구단에 추천할 수 있는 자유계약 선수가 필요합니다.");
    if (!knownClub(command.clubId)) throw new Error("구단을 찾을 수 없습니다.");
    const club = clubs[command.clubId];
    checkCapacity(command.clubId,club.salary);
    if (offers.some(offer=>offer.clubId===command.clubId && offer.status!=="expired")) return;
    const replyWeek=state.week+club.delay;
    offers.push({id:"offer-"+state.nextId++,clubId:command.clubId,status:"waiting",reply:"none",
      salary:club.salary,replyWeek,deadline:replyWeek+3,requestedSalary:null});
    return;
  }

  const offer = offers.find(item=>item.id===command.offerId);
  if (!offer) throw new Error("제안을 찾을 수 없습니다.");
  if (command.type==="accept-offer" && contract?.offerId===offer.id) return;
  if (state.week>offer.deadline || offer.status==="expired") throw new Error("제안 기한이 지났습니다.");
  if (offer.status!=="open" || contract) throw new Error("응답할 수 있는 구단 제안이 없습니다.");
  if (!state.clients.includes(freeAgentId)) throw new Error("선수의 에이전시 계약을 확인하세요.");
  if (command.type==="counter") {
    if (offer.requestedSalary!==null) throw new Error("연봉 역제안은 한 번만 할 수 있습니다.");
    if (state.week>=offer.deadline) throw new Error("회신을 받으려면 마감까지 한 주 이상 필요합니다.");
    if (!Number.isSafeInteger(command.salary) || command.salary<=offer.salary || command.salary>1000000000)
      throw new Error("기존 연봉보다 높고 10억 원 이하인 정수 금액을 입력하세요.");
    offer.requestedSalary=command.salary;
    offer.replyWeek=state.week+1;
    offer.status="counter";
    return;
  }

  checkCapacity(offer.clubId,offer.salary);
  if (!playerAgrees(offer)) throw new Error("선수가 현재 연봉과 예상 역할에 동의하지 않습니다.");
  state.clubDeals.contract={offerId:offer.id,clubId:offer.clubId,salary:offer.salary,
    registrationWeek:state.week+1,fee:Math.floor(offer.salary*clubs[offer.clubId].years/20),status:"pending"};
  offer.status="accepted";
  for (const other of offers) if (other!==offer && other.status!=="expired") other.status="closed";
}

export function advanceClubDeals(state:State):string[] {
  const notes:string[]=[];
  const {offers,contract}=state.clubDeals;
  for (const offer of offers) {
    const club=clubs[offer.clubId];
    if (!["waiting","counter","open"].includes(offer.status)) continue;
    if (offer.deadline<state.week) {
      offer.status="expired";
      notes.push(club.name+" 제안의 응답 기한이 지났습니다.");
      continue;
    }
    if (offer.replyWeek>state.week) continue;
    if (offer.status==="waiting") {
      offer.status="open";
      notes.push(club.name+"의 구단 제안이 도착했습니다.");
    } else if (offer.status==="counter") {
      const requested=offer.requestedSalary!;
      offer.reply=requested*club.years<=club.budget ? "improved" : "declined";
      if (offer.reply==="improved") offer.salary=requested;
      offer.status="open";
      notes.push(club.name+"에서 연봉 역제안에 답했습니다.");
    }
  }
  if (contract?.status==="pending" && contract.registrationWeek<=state.week) {
    checkCapacity(contract.clubId,contract.salary);
    if (!state.clients.includes(freeAgentId)) throw new Error("등록할 선수의 에이전시 계약을 확인하세요.");
    contract.status="registered";
    recordCash(state,contract.fee,clubs[contract.clubId].name+" 계약 수수료");
    notes.push(clubs[contract.clubId].name+" 등록 완료. 에이전시 수수료가 입금됐습니다.");
  }
  return notes;
}

export function validateClubDeals(state:State):void {
  if (state.clubDeals===undefined) {
    state.clubDeals={offers:[],contract:null};
    return;
  }
  const badSave=()=>new Error("저장된 구단 협상 정보가 손상되었습니다.");
  const deals=state.clubDeals;
  if (!deals || !Array.isArray(deals.offers)) throw badSave();
  const validSalary=(value:number)=>Number.isSafeInteger(value) && value>0 && value<=1000000000;
  const ids=new Set<string>();
  for (const offer of deals.offers) {
    if (!offer || typeof offer.id!=="string" || !/^offer-\d+$/.test(offer.id) || ids.has(offer.id) ||
        !knownClub(offer.clubId) || !statuses.includes(offer.status) || !replies.includes(offer.reply) ||
        !validSalary(offer.salary) || offer.salary*clubs[offer.clubId].years>clubs[offer.clubId].budget ||
        !Number.isSafeInteger(offer.replyWeek) || offer.replyWeek<1 || !Number.isSafeInteger(offer.deadline) ||
        offer.deadline<offer.replyWeek ||
        (offer.requestedSalary!==null && !validSalary(offer.requestedSalary)) ||
        (offer.status==="counter" && offer.requestedSalary===null)) throw badSave();
    ids.add(offer.id);
  }
  const contract=deals.contract;
  const accepted=deals.offers.filter(offer=>offer.status==="accepted");
  if (contract===null && accepted.length===0) return;
  if (!contract || accepted.length!==1) throw badSave();
  const [offer]=accepted;
  if (contract.offerId!==offer.id || contract.clubId!==offer.clubId || contract.salary!==offer.salary ||
      !clubs[offer.clubId].slots || !playerAgrees(offer) || !state.clients.includes(freeAgentId) ||
      !Number.isSafeInteger(contract.registrationWeek) || contract.registrationWeek<1 ||
      contract.fee!==Math.floor(offer.salary*clubs[offer.clubId].years/20) ||
      (contract.status==="pending" ? contract.registrationWeek<=state.week :
        contract.status!=="registered" || contract.registrationWeek>state.week)) throw badSave();
}
