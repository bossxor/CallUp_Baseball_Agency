/**
 * Intl calendar: sparse WBC · 프리미어12 · 아시안게임 · 올림픽 · 아시아야구선수권.
 * Run after fix-calendar-baseball.cjs in build-callup.ps1.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const assets = path.join(root, "apk-src", "assets", "public", "assets");
const engPath = path.join(assets, "engine-DhPc-c_J.js");

const FILES = [
  "engine-DhPc-c_J.js",
  "shell-DaKdX7f1.js",
  "ui-DgYnPcSw.js",
  "ui-DSX53OnJ.js",
  "names-CdWzr2Fb.js",
];

const MARK_CAL = "/*CALLUP_INTL_CAL*/";
const MARK_EW = "/*CALLUP_INTL_EW*/";

const Q7_OLD =
  'function Q7(){const x=[];for(let e=2026;e<=2052;e++){const t=(e-2026)*52;x.push({key:"U17"+e,name:e+" U-17 세계 선수권",w:t+20,conts:"ALL",teams:24,ageMax:17,size:21,free:!0}),e>=2028&&e%2===0&&x.push({key:"U23AC"+e,name:e+" U-23 아시아 선수권",w:t-24,conts:["AS"],teams:16,ageMax:23,size:23,free:!0}),e>=2027&&e%2===1&&(x.push({key:"E1"+e,name:e+" 동아시아 선수권",w:t+2,conts:["AS"],teams:3,domestic:!0,nations:["대한민국","일본","중국"]}),x.push({key:"UNL"+e,name:e+" 유럽 국가 리그 결선",w:t,conts:["EU"],teams:4})),e>=2026&&e%2===0&&x.push({key:"AFF"+e,name:e+" 동남아 선수권",w:t+24,conts:["AS"],teams:3,nations:["태국","베트남","인도네시아"],free:!0}),e>=2029&&(e-2029)%4===0&&x.push({key:"FIN"+e,name:e+" 대륙 챔피언 결정전",w:t-15,conts:"ALL",teams:2,fixed:n=>[C1(n,"EURO"),C1(n,"COPA")].filter(l=>!!l)}),e>=2030&&(e-2030)%4===0&&x.push({key:"WC"+e,name:e+" 세계 선수권",w:t,conts:"ALL",teams:48,size:26}),e>=2028&&(e-2028)%4===0&&(x.push({key:"EURO"+e,name:e+" 유럽 선수권",w:t,conts:["EU"],teams:24,size:26}),x.push({key:"COPA"+e,name:e+" 남미 선수권",w:t+1,conts:["SA"],teams:10,size:26}),x.push({key:"OLY"+e,name:e+" 하계 종합대회",w:t+5,conts:"ALL",teams:16,ageMax:23,oa:3,exempt:"medal",size:18,free:!0})),e>=2027&&(e-2027)%4===0&&x.push({key:"AC"+e,name:e+" 아시아 선수권",w:t-24,conts:["AS"],teams:24,size:26}),e>=2027&&(e-2027)%2===0&&(x.push({key:"AFCON"+e,name:e+" 아프리카 선수권",w:t+2,conts:["AF"],teams:24,size:26}),x.push({key:"GOLD"+e,name:e+" 북중미 선수권",w:t+3,conts:["NA"],teams:12}),x.push({key:"U20"+e,name:e+" U-20 세계 선수권",w:t+14,conts:"ALL",teams:24,ageMax:20,size:21,free:!0})),(e-2026)%4===0&&x.push({key:"AG"+e,name:e+" 아시아 종합대회",w:t+(e===2030?22:12),conts:["AS"],teams:16,ageMax:23,oa:3,exempt:"gold",size:22,free:!0})}return x}';

const Q7_NEW =
  'function Q7(){const x=[];for(let e=2026;e<=2052;e++){const t=(e-2026)*52;e>=2030&&(e-2030)%4===0&&x.push({key:"WC"+e,name:e+" WBC",w:t,conts:"ALL",teams:20,size:26}),e>=2032&&(e-2032)%4===0&&x.push({key:"P12"+e,name:e+" 프리미어12",w:t+2,conts:"ALL",teams:12,size:26}),(e-2026)%4===0&&x.push({key:"AG"+e,name:e+" 아시안게임",w:t+(e===2030?22:12),conts:["AS"],teams:16,ageMax:23,oa:3,exempt:"gold",size:22,free:!0}),e>=2028&&(e-2028)%4===0&&x.push({key:"OLY"+e,name:e+" 올림픽",w:t+5,conts:"ALL",teams:16,ageMax:23,oa:3,exempt:"medal",size:18,free:!0}),e>=2028&&e%2===0&&x.push({key:"ABC"+e,name:e+" 아시아야구선수권",w:t-24,conts:["AS"],teams:16,size:26,free:!0})}return x}' +
  MARK_CAL;

const EW_NEW =
  'ew={"WBC":"WBC","프리미어12":"프리미어12","아시안게임":"아시안게임","올림픽":"올림픽","아시아야구선수권":"아시아야구선수권","세계 선수권":"WBC","청소년 WBC":"청소년 WBC","세계 클럽 선수권":"WBC","대륙 간 클럽컵":"WBC","유럽 클럽 챔피언십":"WBC","유럽 클럽 트로피":"프리미어12","유럽 클럽 실드":"프리미어12","아시아 클럽 챔피언십":"아시아야구선수권","아시아 클럽컵":"아시아야구선수권","남미 클럽 챔피언십":"WBC","남미 클럽컵":"프리미어12","북중미 클럽컵":"프리미어12","아프리카 클럽 챔피언십":"WBC","CPBL 챔피언스리그":"아시아야구선수권","CPBL 유로파리그":"프리미어12","CPBL 컨퍼런스리그":"아시아야구선수권","AFC 챔피언스리그 엘리트":"아시아야구선수권","AFC 챔피언스리그 2":"아시아야구선수권","코파 리베르타도레스":"WBC","코파 수다메리카나":"프리미어12","CONCACAF 챔피언스컵":"프리미어12","CAF 챔피언스리그":"WBC","WBSC 클럽 WBC":"WBC","WBSC 인터컨티넨털컵":"WBC","U-23 아시아 선수권":"아시아야구선수권","U-23 아시안컵":"아시아야구선수권","동아시아 선수권":"아시아야구선수권",동아시안컵:"아시아야구선수권","유럽 국가 리그 결선":"WBC","CPBL 네이션스리그 파이널":"WBC","동남아 선수권":"아시아야구선수권","아세안 챔피언십":"아시아야구선수권","대륙 챔피언 결정전":"WBC",피날리시마:"WBC","청소년 세계 선수권":"청소년 WBC","유럽 선수권":"WBC","남미 선수권":"프리미어12","아시아 선수권":"아시아야구선수권",아시안컵:"아시아야구선수권","아프리카 선수권":"WBC","아프리카 네이션스컵":"WBC","북중미 선수권":"프리미어12",골드컵:"프리미어12","아시아 종합대회":"아시안게임",아시안게임:"아시안게임","하계 종합대회":"올림픽",골든보이:"올해의 유망주"},' +
  MARK_EW;

const GI_OLD =
  '.replace(/(\\d{4}) 올림픽/g,"$1 하계 종합대회").replace(/유로 (\\d{4})/g,"$1 유럽 선수권").replace(/코파 아메리카 (\\d{4})/g,"$1 남미 선수권")';

const GI_NEW =
  '.replace(/(\\d{4}) 올림픽/g,"$1 올림픽").replace(/유로 (\\d{4})/g,"$1 WBC").replace(/코파 아메리카 (\\d{4})/g,"$1 프리미어12")';

/** Longer phrases first */
const PAIRS = [
  ["U-17 세계 선수권", "청소년 WBC"],
  ["U-20 세계 선수권", "청소년 WBC"],
  ["U-23 아시아 선수권", "아시아야구선수권"],
  ["유럽 국가 리그 결선", "WBC"],
  ["대륙 챔피언 결정전", "WBC"],
  ["세계 클럽 선수권", "WBC"],
  ["청소년 세계 선수권", "청소년 WBC"],
  ["아시아 종합대회", "아시안게임"],
  ["하계 종합대회", "올림픽"],
  ["동아시아 선수권", "아시아야구선수권"],
  ["동남아 선수권", "아시아야구선수권"],
  ["아프리카 선수권", "WBC"],
  ["북중미 선수권", "프리미어12"],
  ["유럽 클럽 챔피언십", "WBC"],
  ["아시아 클럽 챔피언십", "아시아야구선수권"],
  ["남미 클럽 챔피언십", "WBC"],
  ["유럽 선수권", "WBC"],
  ["남미 선수권", "프리미어12"],
  ["아시아 선수권", "아시아야구선수권"],
  ["세계 선수권", "WBC"],
  ['"U-17 Globe Cup"', '"Youth WBC"'],
  ['"Pan Asia Games"', '"Asian Games"'],
  ['"Euro Championship"', '"WBC"'],
  ['"Copa America"', '"Premier12"'],
  ['"Africa Cup"', '"WBC"'],
  ['"Gold Cup"', '"Premier12"'],
  ['"World Cup"', '"WBC"'],
];

const stats = { engine: 0, pairs: 0, files: 0 };

function rep(text, oldStr, newStr, label, bucket = "engine") {
  if (!text.includes(oldStr)) {
    if (newStr && text.includes(newStr)) {
      console.log("ok", label);
      return text;
    }
    if (oldStr && !text.includes(MARK_CAL) && label.startsWith("Q7")) {
      console.log("MISS", label);
      process.exitCode = 1;
    }
    return text;
  }
  text = text.split(oldStr).join(newStr);
  stats[bucket] = (stats[bucket] || 0) + 1;
  console.log("patched", label);
  return text;
}

function applyPairs(text, file) {
  let n = 0;
  for (const [a, b] of PAIRS) {
    if (!text.includes(a)) continue;
    const c = text.split(a).length - 1;
    text = text.split(a).join(b);
    n += c;
    console.log(file, c, a.slice(0, 44));
  }
  return { text, n };
}

let eng = fs.readFileSync(engPath, "utf8");

if (!eng.includes(MARK_CAL)) {
  eng = rep(eng, Q7_OLD, Q7_NEW, "Q7-calendar");
} else {
  console.log("ok Q7-calendar");
}

if (!eng.includes(MARK_EW)) {
  const ewRe = /ew=\{[^}]+\},/;
  if (!ewRe.test(eng)) {
    console.log("MISS ew-map");
    process.exitCode = 1;
  } else {
    eng = eng.replace(ewRe, EW_NEW);
    stats.engine++;
    console.log("patched ew-map");
  }
} else {
  console.log("ok ew-map");
}

if (eng.includes(GI_OLD)) {
  eng = rep(eng, GI_OLD, GI_NEW, "gI-intl-regex");
} else if (eng.includes(GI_NEW)) {
  console.log("ok gI-intl-regex");
} else {
  console.log("MISS gI-intl-regex");
  process.exitCode = 1;
}

const { text: eng2, n: pn } = applyPairs(eng, "engine-DhPc-c_J.js");
eng = eng2;
if (pn) {
  stats.pairs += pn;
  fs.writeFileSync(engPath, eng);
  stats.files++;
} else if (stats.engine) {
  fs.writeFileSync(engPath, eng);
  stats.files++;
}

for (const file of FILES) {
  if (file === "engine-DhPc-c_J.js") continue;
  const p = path.join(assets, file);
  let s = fs.readFileSync(p, "utf8");
  const { text, n } = applyPairs(s, file);
  if (n) {
    fs.writeFileSync(p, text);
    stats.files++;
    stats.pairs += n;
  }
}

const verify = fs.readFileSync(engPath, "utf8");
const allow = ["WBC", "프리미어12", "아시안게임", "올림픽", "아시아야구선수권", "청소년 WBC", "골든보이"];
const bad = [
  "U-17 세계",
  "유럽 선수권",
  "남미 선수권",
  "동아시아 선수권",
  "동남아 선수권",
  "아프리카 선수권",
  "북중미 선수권",
  "유럽 국가 리그",
  "아시아 종합대회",
  "하계 종합대회",
  "U-23 아시아 선수권",
].filter((t) => verify.includes(t));
if (bad.length) {
  console.log("WARN engine intl leftovers:", bad.join(", "));
  process.exitCode = 1;
}
if (!verify.includes(MARK_CAL) || !verify.includes(MARK_EW)) {
  console.log("WARN markers missing");
  process.exitCode = 1;
}
if (!verify.includes('name:e+" WBC"')) {
  console.log("WARN WC→WBC calendar name missing");
  process.exitCode = 1;
}

console.log("fix-intl-baseball done", JSON.stringify(stats));
if (process.exitCode) process.exit(process.exitCode);