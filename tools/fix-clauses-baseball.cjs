/**
 * Baseball: no loan/sell-on user paths; buyout → 위약금; minimal opt-out clause + season agenda.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const engPath = path.join(root, "apk-src", "assets", "public", "assets", "engine-DhPc-c_J.js");
const shellPath = path.join(root, "apk-src", "assets", "public", "assets", "shell-DaKdX7f1.js");

const MARK = "/*CALLUP_CLAUSES_V1*/";
const OPT_FN = "/*CALLUP_OPTOUT_FN*/";
const stats = { eng: 0, shell: 0, cheat: 0, assert: 0 };

function rep(file, oldStr, newStr, label, bucket = "eng") {
  let s = fs.readFileSync(file, "utf8");
  if (!oldStr) {
    if (s.includes(newStr)) {
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
  fs.writeFileSync(file, s);
  stats[bucket] = (stats[bucket] || 0) + 1;
  console.log("patched", label);
}

const ENGINE = [
  [
    'L_={sellOn:{label:"셀온",gain:"다시 팔릴 때 차익 일부가 에이전시로 (한 번)",cost:"이번 계약금가 꽤 깎여요",pat:32,base:.75},buyout:{label:"바이아웃"',
    `L_={${MARK}buyout:{label:"위약금"`,
    "L_-buyout-label",
  ],
  [
    'buyout:{label:"위약금",gain:"그 금액 이상 제안이 오면 구단이 못 막아요"',
    'buyout:{label:"위약금",gain:"해당 금액 이상이면 구단이 거부할 수 없어요"',
    "L_-buyout-gain",
  ],
  [
    'pat:42,base:.55},guar:{label:"출전 보장"',
    'pat:42,base:.55},optOut:{label:"옵트아웃",gain:"지정 시즌 후 FA·재협상 권리",cost:"연봉이 조금 올라요",pat:38,base:.6},guar:{label:"출전 보장"',
    "L_-optOut",
  ],
  [
    'const Z_=(x,e)=>{var t,n;return x.state==="open"&&x.phase==="clause"',
    'const Z_=(x,e)=>{var t,n;return e==="sellOn"?!1:x.state==="open"&&x.phase==="clause"',
    "Z_-block-sellOn",
  ],
  [
    "if(d!=null&&d.sellOn&&(s==null?void 0:s.id)===d.club&&l>0&&!x.silent)",
    "if(!1/*CALLUP_NO_SELLON*/&&d!=null&&d.sellOn&&(s==null?void 0:s.id)===d.club&&l>0&&!x.silent)",
    "go-no-sellOn",
  ],
  [
    "m.length&&(l.clauses={club:r.id,sellOn:m.includes(\"sellOn\")?e.sellOn:void 0,base:m.includes(\"sellOn\")?s:void 0,buyout:m.includes(\"buyout\")?e.buyout:void 0,guarN:m.includes(\"guar\")?I_:void 0})",
    "m.length&&(l.clauses={club:r.id,buyout:m.includes(\"buyout\")?e.buyout:void 0,guarN:m.includes(\"guar\")?I_:void 0,optOutYear:m.includes(\"optOut\")?x0(r)+Math.max(1,Math.min(2,(i.years??2)-1)):void 0})",
    "transfer-clauses",
  ],
  [
    "d.length&&(l.clauses={...m,club:r.id,buyout:d.includes(\"buyout\")?e.buyout:void 0,guarN:d.includes(\"guar\")?I_:void 0})",
    "d.length&&(l.clauses={...m,club:r.id,buyout:d.includes(\"buyout\")?e.buyout:void 0,guarN:d.includes(\"guar\")?I_:void 0,optOutYear:d.includes(\"optOut\")?x0(x.week)+1:void 0})",
    "renew-clauses",
  ],
  [
    'id:"loanOffer",tier:"mid",cond:({p:x,w:e})=>x.club>=0&&_(x,e)<=22&&x.pt<.35&&!x.loan,weight:()=>2',
    'id:"loanOffer",tier:"mid",cond:()=>!1,weight:()=>0,make:()=>null,_x:"loanOffer"',
    "ev-loanOffer",
  ],
  [
    'id:"rc_loan_offer",tier:"mid",cond:x=>wO(x)&&Oe(x)<=23',
    'id:"rc_loan_offer",tier:"mid",cond:()=>!1',
    "ev-rc_loan_offer",
  ],
  [
    'id:"bench_loan",tier:"common",situ:!0,cond:x=>Z2(x)&&ye(x)&&_(x.p,x.w)<=28,weight:()=>1.5',
    'id:"bench_loan",tier:"common",situ:!0,cond:()=>!1,weight:()=>0,make:()=>null',
    "ev-bench_loan",
  ],
  [
    'id:"sp_bn_loanask",tier:"common",cond:$m,',
    'id:"sp_bn_loanask",tier:"common",cond:()=>!1,',
    "ev-sp_bn_loanask",
  ],
  [
    "r0(t)===44&&b.loan&&b.mil!==3&&b.until===x0(t)+1&&Fl(x,b);",
    "callupOptOutSeason(x,t,b);r0(t)===44&&b.loan&&b.mil!==3&&b.until===x0(t)+1&&Fl(x,b);",
    "week-optOut-hook",
  ],
];

let engPre = fs.readFileSync(engPath, "utf8");
if (engPre.includes("callupOptOutSeason(x,t,b);")) {
  ENGINE.pop();
}

for (const [a, b, label] of ENGINE) rep(engPath, a, b, label);

const OPTOUT_FN = `function callupOptOutSeason(x,t,p){try{var c=p&&p.clauses;if(!c||c.optOutYear==null||c._optOutFired)return;if(typeof x0!=="function"||x0(t)!==c.optOutYear)return;c._optOutFired=1;var club=typeof W==="function"?W(x,p):null;if(typeof O0!=="function")return;O0(x,{kind:"renewal",pid:p.id,title:a("{p} 옵트아웃 시즌",{p:p.name}),body:a("옵트아웃 시즌이에요. {c}와 재협상하거나 FA를 노릴 수 있어요.",{c:club?T(club):a("소속 구단")}),data:{optOut:1,wage:p.wage,years:2},tone:0});}catch(err){}}${OPT_FN}`;

let eng = fs.readFileSync(engPath, "utf8");
if (eng.includes(OPT_FN)) {
  console.log("ok optOut-fn");
} else if (eng.includes("function callupAssertBaseball")) {
  eng = eng.replace("function callupAssertBaseball", `${OPTOUT_FN}\nfunction callupAssertBaseball`);
  fs.writeFileSync(engPath, eng);
  stats.eng++;
  console.log("patched optOut-fn");
} else {
  console.log("MISS optOut-fn anchor");
  process.exitCode = 1;
}

const ASSERT_SNIP = "if(!annual)a.callupAnnual1=true;/*CALLUP_ANNUAL_ASSERT*/}";
const ASSERT_OPT =
  "if(!annual)a.callupAnnual1=true;/*CALLUP_ANNUAL_ASSERT*/if(!a.callupClauses1)a.callupClauses1=true;/*CALLUP_CLAUSES_ASSERT*/}";
eng = fs.readFileSync(engPath, "utf8");
if (eng.includes("/*CALLUP_CLAUSES_ASSERT*/")) {
  console.log("ok clauses-assert");
} else if (eng.includes(ASSERT_SNIP)) {
  eng = eng.replace(ASSERT_SNIP, ASSERT_OPT);
  fs.writeFileSync(engPath, eng);
  stats.assert = 1;
  console.log("patched clauses-assert");
} else {
  console.log("MISS clauses-assert");
  process.exitCode = 1;
}

const CHEAT_SNIP = 'case "heal":';
const CHEAT_INJECT = `case "optOutTest": {
      const y = typeof x0 === "function" ? x0(game.week) : 0;
      if (!player.clauses) player.clauses = { club: player.club };
      player.clauses.optOutYear = y;
      delete player.clauses._optOutFired;
      if (typeof callupOptOutSeason === "function") callupOptOutSeason(game, game.week, player);
      break;
    }
    case "heal":`;
eng = fs.readFileSync(engPath, "utf8");
if (eng.includes('case "optOutTest":')) {
  console.log("ok cheat-optOut");
} else if (eng.includes(CHEAT_SNIP)) {
  eng = eng.replace(CHEAT_SNIP, CHEAT_INJECT);
  fs.writeFileSync(engPath, eng);
  stats.cheat = 1;
  console.log("patched cheat-optOut");
} else {
  console.log("MISS cheat-optOut");
  process.exitCode = 1;
}

const SHELL = [
  [
    '{k:"loan",label:()=>n("임대 목록")},',
    "",
    "shell-no-loan-list",
  ],
  [
    "((E=s.clauses)==null?void 0:E.sellOn)&&",
    "!1&&",
    "shell-hide-sellOn-kv",
  ],
  [
    "(((F=s.clauses)==null?void 0:F.sellOn)||(((se=x==null?void 0:x.by)==null?void 0:se.sell)??0)>0)&&",
    "!1&&",
    "shell-hide-sellOn-wt",
  ],
  [
    'children:n("바이아웃")}),e.jsx("span",{className:"n",children:Ke(s.clauses.buyout)',
    'children:n("위약금")}),e.jsx("span",{className:"n",children:Ke(s.clauses.buyout)',
    "shell-buyout-label",
  ],
  [
    'h==="sellOn"&&r?n("셀온 {round}%",{round:Math.round(r*100)}):n(er[h].label)',
    'h==="sellOn"?null:n(er[h].label)',
    "shell-dealdone-sellOn",
  ],
];

for (const [a, b, label] of SHELL) {
  if (label === "shell-no-loan-list" && !fs.readFileSync(shellPath, "utf8").includes(a)) {
    console.log("ok", label);
    continue;
  }
  rep(shellPath, a, b, label, "shell");
}

console.log("fix-clauses-baseball done", JSON.stringify(stats));
if (process.exitCode) process.exit(process.exitCode);