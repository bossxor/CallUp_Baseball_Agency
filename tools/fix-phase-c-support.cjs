/**
 * Phase C3 — injury / form support agenda + follow-up report.
 */
const fs = require("fs");
const path = require("path");

const engPath = path.join(
  __dirname,
  "..",
  "apk-src",
  "assets",
  "public",
  "assets",
  "engine-DhPc-c_J.js"
);

let eng = fs.readFileSync(engPath, "utf8");
let n = 0;

const FN_MARK = "/*CALLUP_SUPPORT_FN*/";
const FN = `
function callupSupportAgenda(x,t){try{const ag=x.agency;if(!ag||!ag.clients)return;if(typeof O0!=="function"||typeof R!=="function"||typeof _!=="function")return;for(const id of Object.keys(ag.clients)){const p=x.players[id];if(!p||p.retired)continue;const severe=p.inj&&p.inj.severe&&(p.inj.weeks|0)>=4;const slump=p.form>0&&p.form<=5.2&&(p.st&&p.st.apps>=5);if(!severe&&!slump)continue;const key=severe?"inj":"form";if(ag.supportBlock&&ag.supportBlock[p.id]===key+":"+jc(t))continue;const open=x.inbox.some(m=>!m.done&&m.kind==="news"&&m.ev==="support"&&m.pid===p.id);if(open)continue;ag.supportBlock=ag.supportBlock||{};ag.supportBlock[p.id]=key+":"+jc(t);const cost=Math.round((severe?8e7:4e7)/kc.KRW);const review=t+(severe?4:3);O0(x,{kind:"news",ev:"support",pid:p.id,tier:severe?"unique":"rare",title:a(severe?"장기 부상 지원 — {p}":"부진 지원 — {p}",{p:p.name}),body:a(severe?"{age}세 {p}, 큰 부상이에요. 재활·케어에 {c}을 쓸까요? {n}주 뒤 보고가 와요.":"{age}세 {p}, 폼이 가라앉았어요. 멘탈·컨디션 케어에 {c}을 쓸까요? {n}주 뒤 보고가 와요.",{age:_(p,t),p:p.name,c:R(cost),n:severe?4:3}),data:{support:key,cost:cost,review:review},choices:[{label:a("지원한다"),hint:a("비용 {c}",{c:R(cost)})},{label:a("지켜본다"),hint:a("비용 없음")}],def:1,expires:t+2,tone:severe?-1:0});}}catch(err){}}
function callupSupportPick(x,e,t){try{const p=x.players[e.pid];if(!p)return"";const d=e.data||{};if(t===0){const cost=d.cost??Math.round(4e7/kc.KRW);if(x.agency.money<cost)return $x;A(x,-cost,a("선수 지원 — {p}",{p:p.name}));p._supportReview=x.week+(d.support==="inj"?4:3);p._supportKind=d.support||"form";if(d.support==="inj"&&p.inj)p.inj.weeks=Math.max(1,Math.round((p.inj.weeks||4)*.75));if(d.support==="form")p.form=Math.min(7.2,(p.form||5)+.4);return a("지원을 시작했어요. 점검 주에 보고가 옵니다.");}return a("이번엔 지켜보기로 했어요.");}catch(err){return"";}}
function callupSupportReport(x,t){try{const ag=x.agency;if(!ag||!ag.clients||typeof O0!=="function")return;for(const id of Object.keys(ag.clients)){const p=x.players[id];if(!p||p._supportReview==null||p._supportReview>t)continue;const kind=p._supportKind||"form";delete p._supportReview;delete p._supportKind;O0(x,{kind:"news",ev:"supportReport",pid:p.id,tier:"mid",title:a("지원 점검 — {p}",{p:p.name}),body:a(kind==="inj"?"{p} 재활 점검이에요. 경기는 구단이 정하지만, 상태는 한결 나아 보여요.":"{p} 컨디션 점검이에요. 폼이 조금씩 돌아오는 느낌이에요.",{p:p.name}),tone:1});}}catch(err){}}
${FN_MARK}
`;

if (eng.includes(FN_MARK)) {
  console.log("support fn already");
} else {
  const anchor = "/*CALLUP_DRAFT_FN*/";
  if (!eng.includes(anchor)) {
    console.error("MISS CALLUP_DRAFT_FN");
    process.exit(1);
  }
  eng = eng.replace(anchor, anchor + FN);
  n++;
  console.log("support fn injected");
}

// Resolve support news like offCamp
const RES_OLD =
  'n.ev==="offCamp"?callupOffSeasonCampPick(x,n,t):n.ev==="retire"?tj(x,r,n,t):t9(x,r,n,t)/*CALLUP_OFFCAMP_RES*/';
const RES_NEW =
  'n.ev==="offCamp"?callupOffSeasonCampPick(x,n,t):n.ev==="support"?callupSupportPick(x,n,t):n.ev==="retire"?tj(x,r,n,t):t9(x,r,n,t)/*CALLUP_OFFCAMP_RES*//*CALLUP_SUPPORT_RES*/';

if (eng.includes("/*CALLUP_SUPPORT_RES*/")) {
  console.log("support resolve already");
} else if (eng.includes(RES_OLD)) {
  eng = eng.replace(RES_OLD, RES_NEW);
  n++;
  console.log("support resolve wired");
} else {
  console.error("MISS offCamp resolve anchor");
  process.exit(1);
}

const HOOK_MARK = "/*CALLUP_SUPPORT_HOOK*/";
const HOOK_OLD = "callupKoreanDraft(x,t),/*CALLUP_DRAFT_HOOK*/";
const HOOK_NEW =
  "callupKoreanDraft(x,t),/*CALLUP_DRAFT_HOOK*/callupSupportAgenda(x,t),callupSupportReport(x,t)," +
  HOOK_MARK;

if (eng.includes(HOOK_MARK)) {
  console.log("support hook already");
} else if (eng.includes(HOOK_OLD)) {
  eng = eng.replace(HOOK_OLD, HOOK_NEW);
  n++;
  console.log("support week hook");
} else {
  console.error("MISS draft hook");
  process.exit(1);
}

fs.writeFileSync(engPath, eng);
console.log("fix-phase-c-support done", { n });
