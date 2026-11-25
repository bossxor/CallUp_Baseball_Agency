/**
 * Phase C1 — season-end domestic (KR) salary negotiation agenda.
 * Mirrors callupOffSeasonCamp week-boundary hook; reuses renewal inbox/nego.
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

const FN_MARK = "/*CALLUP_SEASON_SALARY_FN*/";
const FN = `
function callupSeasonSalary(x,t){try{if(typeof qb!=="function"||!qb(t)||qb(t-1))return;const ag=x.agency;if(!ag||!ag.clients)return;if(ag.seasonSalBlock===r0(t))return;if(typeof O0!=="function"||typeof W!=="function"||typeof T!=="function"||typeof R!=="function"||typeof _!=="function"||typeof C==="undefined")return;ag.seasonSalBlock=r0(t);for(const id of Object.keys(ag.clients)){const p=x.players[id];if(!p||p.retired||p.club<0)continue;const club=W(x,p);if(!club)continue;const lg=C[club.league];if(!lg||lg.country!=="한국")continue;const open=x.inbox.some(m=>!m.done&&m.kind==="renewal"&&m.pid===p.id&&m.data&&m.data.seasonEnd);if(open)continue;const wage=Math.max(p.wage||0,Math.round((p.wage||5e7)*1.05));O0(x,{kind:"renewal",pid:p.id,title:a("시즌 후 연봉 — {p}",{p:p.name}),body:a("{age}세, {club} 소속 {p}. 시즌이 끝나 연봉을 다시 정해요. 제안 연봉 {wage}, 1년.",{age:_(p,t),club:T(club),p:p.name,wage:R(wage)}),data:{seasonEnd:1,wage:wage,years:1},tone:0});}}catch(err){}}
${FN_MARK}
`;

if (eng.includes(FN_MARK)) {
  console.log("season salary fn already");
} else {
  const anchor = "/*CALLUP_OPTOUT_FN*/";
  if (!eng.includes(anchor)) {
    console.error("MISS CALLUP_OPTOUT_FN anchor");
    process.exit(1);
  }
  eng = eng.replace(anchor, anchor + FN);
  n++;
  console.log("season salary fn injected");
}

const HOOK_MARK = "/*CALLUP_SEASON_SALARY_HOOK*/";
const HOOK_OLD = "callupOffSeasonCamp(x,t),/*CALLUP_OFFCAMP_HOOK*/";
const HOOK_NEW =
  "callupOffSeasonCamp(x,t),/*CALLUP_OFFCAMP_HOOK*/callupSeasonSalary(x,t)," +
  HOOK_MARK;

if (eng.includes(HOOK_MARK)) {
  console.log("season salary hook already");
} else if (eng.includes(HOOK_OLD)) {
  eng = eng.replace(HOOK_OLD, HOOK_NEW);
  n++;
  console.log("season salary week hook");
} else {
  console.error("MISS OFFCAMP week hook");
  process.exit(1);
}

// Cheat jump: reuse offCamp week jump if present; add seasonSalTest
const CHEAT_MARK = "/*CALLUP_SEASON_SALARY_CHEAT*/";
if (eng.includes(CHEAT_MARK)) {
  console.log("season salary cheat already");
} else {
  const cheatNeedle = 'case "optOutTest":';
  if (eng.includes(cheatNeedle)) {
    eng = eng.replace(
      cheatNeedle,
      `case "seasonSalTest":{${CHEAT_MARK}
      try{if(game.agency)game.agency.seasonSalBlock=void 0;
      const yw=typeof x0==="function"?x0(game.week):0;
      const w=typeof xd!=="undefined"?xd[0]+yw*52:game.week;
      game.week=w;
      if(typeof callupSeasonSalary==="function")callupSeasonSalary(game,w);
      }catch(e){}
      break;}
    ` + cheatNeedle
    );
    n++;
    console.log("season salary cheat case");
  } else {
    console.log("WARN no optOutTest cheat anchor — skip cheat");
  }
}

fs.writeFileSync(engPath, eng);
console.log("fix-phase-c-salary-season done", { n });
