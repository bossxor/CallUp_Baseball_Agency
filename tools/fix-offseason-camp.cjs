/**
 * Off-season agenda: 전지훈련 / 아카데미·동계 육성 / 스킵 (news+choices, ev offCamp).
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

const MARK_FN = "/*CALLUP_OFFCAMP_FN*/";
const MARK_HOOK = "/*CALLUP_OFFCAMP_HOOK*/";
const MARK_RES = "/*CALLUP_OFFCAMP_RES*/";

const stats = { fn: 0, hook: 0, res: 0, assert: 0 };

function rep(oldStr, newStr, label) {
  let s = fs.readFileSync(engPath, "utf8");
  if (!oldStr) {
    if (newStr && s.includes(newStr)) {
      console.log("ok", label);
      return;
    }
    console.log("MISS", label);
    process.exitCode = 1;
    return;
  }
  if (!s.includes(oldStr)) {
    if (newStr && s.includes(newStr)) {
      console.log("ok", label);
      return;
    }
    console.log("MISS", label);
    process.exitCode = 1;
    return;
  }
  s = s.split(oldStr).join(newStr);
  fs.writeFileSync(engPath, s);
  stats[label.includes("assert") ? "assert" : label.includes("res") ? "res" : label.includes("hook") ? "hook" : "fn"] =
    (stats[label.includes("hook") ? "hook" : label.includes("res") ? "res" : label.includes("assert") ? "assert" : "fn"] || 0) + 1;
  console.log("patched", label);
}

const OFFCAMP_FN = `function callupOffSeasonCampPick(x,e,t){try{const p=x.players[e.pid];if(!p)return"";if(t===0){p.form=typeof v==="function"?v((p.form??6.6)+.12,4,9):(p.form??6.6)+.12;if(typeof U==="function")U(x,p,a("전지훈련으로 컨디션을 올렸어요."),"growth");return a("전지훈련으로 개막 준비를 했어요.");}if(t===1){const st=p.stats;if(st){const key=p.pos==="P"?"pit":"bat";if(st[key]!=null)st[key]=typeof v==="function"?v(st[key]+1,1,99):st[key]+1;if(typeof Ze==="function")p.ovr=Ze(st,p.pos);}if(typeof U==="function")U(x,p,a("동계 육성 프로그램을 받았어요."),"growth");return a("육성 프로그램으로 조금 성장했어요.");}return a("이번 비시즌은 쉬기로 했어요.");}catch(err){return"";}}function callupOffSeasonCamp(x,t){try{if(typeof qb!=="function"||!qb(t)||qb(t-1))return;const ag=x.agency;if(!ag||!Object.keys(ag.clients||{}).length)return;if(ag.offCampBlock===r0(t))return;if(typeof my!=="function"||typeof O0!=="function")return;const p=my(x);if(!p||p.retired||(p.inj&&p.inj.weeks>0))return;ag.offCampBlock=r0(t);O0(x,{kind:"news",ev:"offCamp",pid:p.id,title:a("동계 준비 — {p}",{p:p.name}),body:a("비시즌이에요. {p} 선수의 동계 계획을 정해 주세요.",{p:p.name}),choices:[{label:a("전지훈련"),hint:a("컨디션·개막 준비")},{label:a("아카데미·동계 육성"),hint:a("기술 성장")},{label:a("스킵"),hint:a("특별 훈련 없음")}],def:2,expires:t+3,tone:0});}catch(err){}}${MARK_FN}`;

let eng = fs.readFileSync(engPath, "utf8");

if (eng.includes(MARK_FN)) {
  console.log("ok offCamp-fn");
} else if (eng.includes("/*CALLUP_OPTOUT_FN*/")) {
  eng = eng.replace("/*CALLUP_OPTOUT_FN*/", `/*CALLUP_OPTOUT_FN*/\n${OFFCAMP_FN}`);
  fs.writeFileSync(engPath, eng);
  stats.fn = 1;
  console.log("patched offCamp-fn");
} else {
  console.log("MISS offCamp-fn anchor");
  process.exitCode = 1;
}

eng = fs.readFileSync(engPath, "utf8");
if (eng.includes(MARK_HOOK) || eng.includes("callupOffSeasonCamp(x,t),")) {
  console.log("ok offCamp-hook");
} else {
  rep(
    "yield,iN(x,e,t),YN(x,t)",
    `yield,iN(x,e,t),callupOffSeasonCamp(x,t),${MARK_HOOK}YN(x,t)`,
    "offCamp-hook"
  );
  eng = fs.readFileSync(engPath, "utf8");
  if (!eng.includes(MARK_HOOK)) {
    rep("iN(x,e,t),YN(x,t)", `iN(x,e,t),callupOffSeasonCamp(x,t),${MARK_HOOK}YN(x,t)`, "offCamp-hook-alt");
  }
}

eng = fs.readFileSync(engPath, "utf8");
if (eng.includes(MARK_RES) || eng.includes('n.ev==="offCamp"?callupOffSeasonCampPick')) {
  console.log("ok offCamp-res");
} else {
  rep(
    'n.ev==="military"?iM(x,n,t):n.ev==="retire"?tj(x,r,n,t):t9(x,r,n,t)',
    `n.ev==="military"?iM(x,n,t):n.ev==="offCamp"?callupOffSeasonCampPick(x,n,t):n.ev==="retire"?tj(x,r,n,t):t9(x,r,n,t)${MARK_RES}`,
    "offCamp-res"
  );
}

const ASSERT_SNIP = "if(!a.callupClauses1)a.callupClauses1=true;/*CALLUP_CLAUSES_ASSERT*/}";
const ASSERT_TERM =
  "if(!a.callupClauses1)a.callupClauses1=true;/*CALLUP_CLAUSES_ASSERT*/if(!a.callupTerms1)a.callupTerms1=true;/*CALLUP_TERMS_ASSERT*/}";
eng = fs.readFileSync(engPath, "utf8");
if (eng.includes("/*CALLUP_TERMS_ASSERT*/")) {
  console.log("ok terms-assert");
} else if (eng.includes(ASSERT_SNIP)) {
  eng = eng.replace(ASSERT_SNIP, ASSERT_TERM);
  fs.writeFileSync(engPath, eng);
  stats.assert = 1;
  console.log("patched terms-assert");
}

const CHEAT_SNIP = 'case "optOutTest":';
const CHEAT_INJECT = `case "offCampTest": {
      game.week = typeof x0 === "function" ? x0(game.week) * 52 + 9 : game.week;
      if (typeof callupOffSeasonCamp === "function") callupOffSeasonCamp(game, game.week);
      break;
    }
    case "optOutTest":`;
eng = fs.readFileSync(engPath, "utf8");
if (eng.includes('case "offCampTest":')) {
  console.log("ok cheat-offCamp");
} else if (eng.includes(CHEAT_SNIP)) {
  eng = eng.replace(CHEAT_SNIP, CHEAT_INJECT);
  fs.writeFileSync(engPath, eng);
  console.log("patched cheat-offCamp");
}

eng = fs.readFileSync(engPath, "utf8");
if (!eng.includes(MARK_FN) || !eng.includes("ev:\"offCamp\"") || !eng.includes(MARK_RES)) {
  console.log("WARN offCamp markers missing");
  process.exitCode = 1;
}

console.log("fix-offseason-camp done", JSON.stringify(stats));
if (process.exitCode) process.exit(process.exitCode);