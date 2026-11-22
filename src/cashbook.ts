import type {State} from "./game.js";

export interface Cashbook {
  openingBalance:number;
  entries:{week:number;amount:number;label:string}[];
}

const retainedEntries=50;

export function recordCash(state:State, amount:number, label:string):void {
  if (amount===0) return;
  state.money+=amount;
  const {cashbook}=state;
  cashbook.entries.push({week:state.week,amount,label});
  if (cashbook.entries.length>retainedEntries) cashbook.openingBalance+=cashbook.entries.shift()!.amount;
}

export function validateCashbook(state:State):void {
  if (state.cashbook===undefined) state.cashbook={openingBalance:state.money,entries:[]};
  const book=state.cashbook;
  const invalid=()=>new Error("운영 장부가 손상되었습니다.");
  if (!book || !Number.isSafeInteger(book.openingBalance) || book.openingBalance<0 ||
      !Array.isArray(book.entries) || book.entries.length>retainedEntries) throw invalid();
  let balance=book.openingBalance;
  let week=0;
  for (const entry of book.entries) {
    if (!entry || !Number.isSafeInteger(entry.week) || entry.week<Math.max(week,1) || entry.week>state.week ||
        !Number.isSafeInteger(entry.amount) || entry.amount===0 ||
        typeof entry.label!=="string" || !entry.label || entry.label.length>80) throw invalid();
    week=entry.week;
    balance+=entry.amount;
    if (!Number.isSafeInteger(balance) || balance<0) throw invalid();
  }
  if (balance!==state.money) throw invalid();
}
