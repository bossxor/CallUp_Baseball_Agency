/**
 * Phase C2 — Korean amateur draft class → result / first-club offer.
 * No amateur club rows. Pool lives on agency.draftClass (player ids, club:-1).
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

const FN_MARK = "/*CALLUP_DRAFT_FN*/";
const FN = `
function callupEnsureDraftClass(x,t){try{const ag=x.agency;if(!ag)return;if(ag.draftClassYear===jc(t))return;if(typeof ke!=="function"||typeof Qe!=="function")return;const rng=ke(x,"cudraft",t|0);const ids=[];const pos=["P","C","1B","2B","3B","SS","LF","CF","RF"];for(let i=0;i<3;i++){const p=Qe(x,rng,rng,{club:-1,pos:pos[rng.int(0,pos.length-1)],ovr:rng.range(56,67),age:rng.int(17,18),nat:"대한민국"});p.agent=0;ids.push(p.id);}ag.draftClass=ids;ag.draftClassYear=jc(t);}catch(err){}}
function callupKoreanDraft(x,t){try{callupEnsureDraftClass(x,t);if(r0(t)!==(callupSeasonRound()+1)%52)return;const ag=x.agency;if(!ag)return;if(ag.draftBlock===jc(t))return;if(typeof O0!=="function"||typeof ke!=="function"||typeof C==="undefined"||typeof T!=="function"||typeof R!=="function"||typeof _!=="function")return;callupEnsureDraftClass(x,t);ag.draftBlock=jc(t);const rng=ke(x,"cudraftRun",t);const ids=new Set();for(const id of Object.keys(ag.clients||{})){const p=x.players[id];if(p&&!p.retired&&p.club<0&&p.nat==="대한민국"&&_(p,t)<=19)ids.add(+id);}const kr=x.clubs.filter(c=>{return c.league==="KOR1";});for(const id of ids){const p=x.players[id];if(!p||p.retired||p.club>=0)continue;const open=x.inbox.some(m=>!m.done&&((m.kind==="offer"&&m.data&&m.data.draft)||(m.kind==="news"&&m.ev==="draftMiss"))&&m.pid===p.id);if(open)continue;const chance=.35+Math.max(0,(p.ovr-55))*.02;const picked=kr.length&&rng.next()<Math.min(.85,chance);if(picked){const club=kr[rng.int(0,kr.length-1)];const wage=Math.max(Math.round(3e7/kc.KRW),Math.round((p.wage||4e7/kc.KRW)*rng.range(.9,1.15)));const years=rng.int(2,4);O0(x,{kind:"offer",pid:p.id,tier:"unique",title:a("드래프트 지명 — {c}",{c:T(club)}),body:a("{c이} {p을} 지명했어요. 첫 프로 계약입니다. 자유계약, 연봉 {w}, {y}년.",{c:T(club),p:p.name,w:R(wage),y:years}),data:{club:club.id,fee:0,wage:wage,years:years,draft:1},choices:[{label:a("수락"),hint:a("입단 협상으로 이어져요")},{label:a("연봉 20% 인상 요구"),hint:a("결렬될 수 있어요")},{label:a("거절"),hint:""}],def:2,expires:t+3,tone:1});}else{O0(x,{kind:"news",ev:"draftMiss",pid:p.id,tier:"rare",title:a("드래프트 미지명 — {p}",{p:p.name}),body:a("{age}세 {p}. 이번 드래프트에서 지명되지 않았어요. 내년을 준비합시다.",{age:_(p,t),p:p.name}),tone:0});}}}catch(err){}}
${FN_MARK}
`;

if (eng.includes(FN_MARK)) {
  console.log("draft fn already");
} else {
  const anchor = "/*CALLUP_SEASON_SALARY_FN*/";
  if (!eng.includes(anchor)) {
    console.error("MISS CALLUP_SEASON_SALARY_FN — run salary patch first");
    process.exit(1);
  }
  eng = eng.replace(anchor, anchor + FN);
  n++;
  console.log("draft fn injected");
}

const HOOK_MARK = "/*CALLUP_DRAFT_HOOK*/";
const HOOK_OLD =
  "callupSeasonSalary(x,t),/*CALLUP_SEASON_SALARY_HOOK*/";
const HOOK_NEW =
  "callupSeasonSalary(x,t),/*CALLUP_SEASON_SALARY_HOOK*/callupKoreanDraft(x,t)," +
  HOOK_MARK;

if (eng.includes(HOOK_MARK)) {
  console.log("draft hook already");
} else if (eng.includes(HOOK_OLD)) {
  eng = eng.replace(HOOK_OLD, HOOK_NEW);
  n++;
  console.log("draft week hook");
} else {
  console.error("MISS season salary hook");
  process.exit(1);
}

const CHEAT_MARK = "/*CALLUP_DRAFT_CHEAT*/";
if (eng.includes(CHEAT_MARK)) {
  console.log("draft cheat already");
} else if (eng.includes('case "seasonSalTest":')) {
  eng = eng.replace(
    'case "seasonSalTest":',
    `case "draftTest":{${CHEAT_MARK}
      try{if(game.agency){game.agency.draftBlock=void 0;}
      const yw=typeof x0==="function"?x0(game.week):0;
      const w=(callupSeasonRound()+1)%52+yw*52;
      game.week=w;
      if(typeof callupKoreanDraft==="function")callupKoreanDraft(game,w);
      }catch(e){}
      break;}
    case "seasonSalTest":`
  );
  n++;
  console.log("draft cheat case");
} else {
  console.log("WARN no seasonSalTest for draft cheat");
}

fs.writeFileSync(engPath, eng);
console.log("fix-phase-c-draft done", { n });
