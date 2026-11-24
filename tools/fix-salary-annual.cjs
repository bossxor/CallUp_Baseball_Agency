/**
 * Stored player.wage = annual; weekly agency cut = floor(annual/52 * wageRate chain).
 * Removes wage/fee *52 helpers; scales oe() and event thresholds ×52.
 * PR (hp_loyal): same weekly intent as wl — wage/52*4/1e3 vs old wage*4/1e3.
 * Unstamped saves: callupAnnual1 is authoritative; legacy-weekly hint only if
 * any client has 0 < wage < 3e4 (weekly-scale magnitudes, not sub-6e4 annual edge cases).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const engPath = path.join(root, "apk-src", "assets", "public", "assets", "engine-DhPc-c_J.js");
const shellPath = path.join(root, "apk-src", "assets", "public", "assets", "shell-DaKdX7f1.js");

const stats = { eng: 0, shell: 0, assert: 0 };
const MARK = "/*CALLUP_ANNUAL_V1*/";

function rep(file, oldStr, newStr, label) {
  let s = fs.readFileSync(file, "utf8");
  if (s.includes(MARK) && label !== "assert" && label !== "shell-copy") {
    if (newStr && s.includes(newStr)) {
      console.log("ok", label);
      return;
    }
    if (!oldStr || !s.includes(oldStr)) {
      console.log("ok", label);
      return;
    }
  }
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
  stats[label.startsWith("shell") ? "shell" : "eng"] =
    (stats[label.startsWith("shell") ? "shell" : "eng"] || 0) + 1;
  console.log("patched", label);
}

const ENGINE = [
  [
    "return Math.round(900*Math.pow(10,(l-50)/17)*((e==null?void 0:e.wealth)??.3))}const wF=",
    "return Math.round(900*Math.pow(10,(l-50)/17)*((e==null?void 0:e.wealth)??.3))*52}const wF=",
    "oe-annual",
  ],
  [
    "af=(x,e,t)=>Sx(x*52*e*t*.6),Wo=J.nego",
    `af=(x,e,t)=>Sx(x*e*t*.6),Wo=J.nego${MARK}`,
    "af-fee",
  ],
  [
    "Jy=(x,e,t)=>Math.min(Wo.faCap,x*52*e*t*Wo.faK)",
    "Jy=(x,e,t)=>Math.min(Wo.faCap,x*e*t*Wo.faK)",
    "Jy-fa",
  ],
  [
    "nN=(x,e)=>e&&x.club>=0&&!x.retired?x.wage*WS(e.wageRate):0",
    "nN=(x,e)=>e&&x.club>=0&&!x.retired?Math.floor(x.wage/52*WS(e.wageRate)):0",
    "nN-week",
  ],
  [
    "s=r.wage*52*((i==null?void 0:i.feeRate)??.05)*.5",
    "s=r.wage*((i==null?void 0:i.feeRate)??.05)*.5",
    "Vl-renew",
  ],
  [
    "const l=Sx(t.wage*x.agency.clients[+e].wageRate*2*J.nego.wageMul*li[n].weeks)",
    "const l=Sx(t.wage/52*x.agency.clients[+e].wageRate*2*J.nego.wageMul*li[n].weeks)",
    "loyalty-weeks",
  ],
  [
    "function wl(x,e){return e?v(e.wage/4e3,.5,30)*J.cards.income",
    "function wl(x,e){return e?v(e.wage/208e3,.5,30)*J.cards.income",
    "wl-cards",
  ],
  [
    "PR=x=>Math.min(2e5,Math.max(7e4,Math.round(x.wage*4/1e3)*1e3))",
    "PR=x=>Math.min(2e5,Math.max(7e4,Math.round(x.wage/52*4/1e3)*1e3))",
    "PR-hp_loyal",
  ],
];

const THRESHOLDS = [
  ["wage>=5e4", "wage>=260e4"],
  ["wage>=4e4", "wage>=208e4"],
  ["wage>=3e4", "wage>=156e4"],
  ["wage>=2e4", "wage>=104e4"],
  ["wage>=1e4", "wage>=520e3"],
  ["wage>=3e3", "wage>=156e3"],
  ["wage>2e3", "wage>104e3"],
];

let eng = fs.readFileSync(engPath, "utf8");
for (const [a, b, label] of ENGINE) {
  rep(engPath, a, b, label);
}
for (const [a, b] of THRESHOLDS) {
  if (eng.includes(MARK)) {
    if (eng.includes(b)) console.log("ok threshold", a);
    else if (!eng.includes(a)) console.log("ok threshold", a);
    else {
      eng = fs.readFileSync(engPath, "utf8");
      const n = eng.split(a).length - 1;
      if (n) {
        eng = eng.split(a).join(b);
        fs.writeFileSync(engPath, eng);
        stats.eng += n;
        console.log("patched threshold", a, n);
      }
    }
  } else {
    eng = fs.readFileSync(engPath, "utf8");
    if (eng.includes(a)) {
      eng = eng.split(a).join(b);
      fs.writeFileSync(engPath, eng);
      stats.eng += eng.split(b).length - 1;
      console.log("patched threshold", a);
    }
  }
}

const ASSERT_OLD =
  'if(!stamped){if(soccer>0)throw new Error("콜업 야구 세이브만 지원합니다. 새 게임을 시작하세요.");a.callupBaseball1=true;}}function offlineCheat';
const ASSERT_NEW =
  'if(!stamped){if(soccer>0)throw new Error("콜업 야구 세이브만 지원합니다. 새 게임을 시작하세요.");a.callupBaseball1=true;}var annual=!!(a.callupAnnual1===true||a.callupAnnual1===1),wk=0;if(a.clients&&!annual){for(k in a.clients){if(!a.clients[k])continue;p=ps[k];if(p&&p.wage>0&&p.wage<3e4)wk++;}if(wk)throw new Error("콜업 연봉 세이브만 지원합니다. 새 게임을 시작하세요.");}if(!annual)a.callupAnnual1=true;/*CALLUP_ANNUAL_ASSERT*/}function offlineCheat';

eng = fs.readFileSync(engPath, "utf8");
if (eng.includes("/*CALLUP_ANNUAL_ASSERT*/")) {
  console.log("ok assert");
  rep(engPath, "p.wage>0&&p.wage<6e4", "p.wage>0&&p.wage<3e4", "assert-wk-threshold");
} else if (eng.includes(ASSERT_OLD)) {
  eng = eng.replace(ASSERT_OLD, ASSERT_NEW);
  fs.writeFileSync(engPath, eng);
  stats.assert = 1;
  console.log("patched assert");
} else {
  console.log("MISS assert annual");
  process.exitCode = 1;
}

const SHELL_COPY = [
  ["주급 수수료", "연봉 수수료"],
  ["주급", "연봉"],
];
let shell = fs.readFileSync(shellPath, "utf8");
for (const [a, b] of SHELL_COPY) {
  if (!shell.includes(a)) {
    console.log("ok shell-copy", a);
    continue;
  }
  const c = shell.split(a).length - 1;
  shell = shell.split(a).join(b);
  stats.shell += c;
  console.log("patched shell-copy", a, c);
}
fs.writeFileSync(shellPath, shell);

console.log("fix-salary-annual done", JSON.stringify(stats));
if (process.exitCode) process.exit(process.exitCode);