/**
 * Baseball calendar copy: 하절기/동절기 영입창 → 트레이드 / FA·재계약; 데드라인 → 트레이드 데드라인.
 * Requires fix-deadline-midnight (Kt=24) earlier in build-callup.ps1.
 */
const fs = require("fs");
const path = require("path");

const assets = path.join(__dirname, "..", "apk-src", "assets", "public", "assets");
const FILES = [
  "engine-DhPc-c_J.js",
  "shell-DaKdX7f1.js",
  "ui-DgYnPcSw.js",
  "ui-DSX53OnJ.js",
  "Year-BBjDZ4ft.js",
  "Deadline-DD5y1sRo.js",
];

const PAIRS = [
  ["여름 영입시장 오픈", "트레이드 기간 오픈"],
  ["여름 영입시장 마감", "트레이드 기간 마감"],
  ["겨울 영입시장 오픈", "FA·재계약 기간 오픈"],
  ["겨울 영입시장 마감", "FA·재계약 기간 마감"],
  ["여름 영입시장이 열린 밤", "트레이드 기간이 열린 밤"],
  ["하절기 영입창이 열린 밤", "트레이드 기간이 열린 밤"],
  ["하절기 영입창 오픈", "트레이드 기간 오픈"],
  ["하절기 영입창 마감", "트레이드 기간 마감"],
  ["동절기 영입창 오픈", "FA·재계약 기간 오픈"],
  ["동절기 영입창 마감", "FA·재계약 기간 마감"],
  ["하절기 영입창", "트레이드 기간"],
  ["동절기 영입창", "FA·재계약 기간"],
  ["여름 이적 시장", "트레이드 시장"],
  ["겨울 이적 시장", "FA·재계약 시장"],
  ["영입시장 마감 세 시간 전", "트레이드 마감 세 시간 전"],
  ["영입시장 마감, {n}건 성사", "트레이드 시장 마감, {n}건 성사"],
  ["영입시장 마감 직전", "트레이드 마감 직전"],
  ["영입시장 마감일이에요", "트레이드 마감일이에요"],
  [
    "{league} 영입시장은 {d}주 뒤에 열려요",
    "{league} 트레이드 시장은 {d}주 뒤에 열려요",
  ],
  ["{name}, 다음 영입시장부터", "{name}, 다음 트레이드 시장부터"],
  ["영입시장이 열려 있어요", "트레이드 시장이 열려 있어요"],
  ["영입시장이 열렸어요", "트레이드 시장이 열렸어요"],
  ["영입시장이 닫혔어요", "트레이드 시장이 닫혔어요"],
  ["다음 영입시장부터", "다음 트레이드 시장부터"],
  [
    "영입시장 열리면 휴대폰 켜 두세요.",
    "트레이드 시장 열리면 휴대폰 켜 두세요.",
  ],
  ["영입시장 마감", "트레이드 시장 마감"],
  ['tag:n("영입시장")', 'tag:n("트레이드 시장")'],
  [
    "오늘 밤 12시에 영입시장이 닫혀요. 아직 조용해요",
    "오늘 밤 12시에 트레이드 시장이 닫혀요. 아직 조용해요",
  ],
  ["오늘 밤 12시에 영입시장이 닫혀요", "오늘 밤 12시에 트레이드 시장이 닫혀요"],
  ["영입시장이 닫혀요", "트레이드 시장이 닫혀요"],
  ["오늘 밤 12시 영입시장 마감", "오늘 밤 12시 트레이드 시장 마감"],
];

const stats = { files: 0, pairs: 0, deadline: 0 };

function applyPairs(text, file) {
  let n = 0;
  for (const [a, b] of PAIRS) {
    if (!text.includes(a)) continue;
    const c = text.split(a).length - 1;
    text = text.split(a).join(b);
    n += c;
    console.log(file, c, a.slice(0, 48));
  }
  const re = /(?<!트레이드 )데드라인/g;
  const dc = (text.match(re) || []).length;
  if (dc) {
    text = text.replace(re, "트레이드 데드라인");
    n += dc;
    stats.deadline += dc;
    console.log(file, dc, "데드라인→트레이드 데드라인");
  }
  return { text, n };
}

const engPath = path.join(assets, "engine-DhPc-c_J.js");
const eng = fs.readFileSync(engPath, "utf8");
if (eng.includes("const W5=9,Kt=24,")) {
  console.log("ok Kt=24");
} else if (eng.includes("const W5=9,Kt=23,")) {
  console.log("WARN Kt still 23 — run fix-deadline-midnight first");
  process.exitCode = 1;
} else {
  console.log("MISS Kt anchor");
  process.exitCode = 1;
}

for (const file of FILES) {
  const p = path.join(assets, file);
  let s = fs.readFileSync(p, "utf8");
  const { text, n } = applyPairs(s, file);
  if (n) {
    fs.writeFileSync(p, text);
    stats.files++;
    stats.pairs += n;
  }
}

console.log("fix-calendar-baseball done", JSON.stringify(stats));
if (process.exitCode) process.exit(process.exitCode);