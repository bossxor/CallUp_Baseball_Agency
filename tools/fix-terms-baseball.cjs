/**
 * Baseball terms §8 — longer phrases first; phrase-level 주전/벤치 only.
 * Run before fix-offseason-camp.cjs in build-callup.ps1.
 */
const fs = require("fs");
const path = require("path");

const assets = path.join(__dirname, "..", "apk-src", "assets", "public", "assets");

const FILES = [
  "engine-DhPc-c_J.js",
  "shell-DaKdX7f1.js",
  "ui-DgYnPcSw.js",
  "ui-DSX53OnJ.js",
  "names-CdWzr2Fb.js",
  "Deadline-DD5y1sRo.js",
  "yearSay-CxPvW4Nr.js",
];

const GUARD_OFFCAMP = "\uE000CALLUP_OFFCAMP_OPT\uE000";

/** Longer phrases first */
const PAIRS = [
  ["유소년 아카데미", "육성 시설"],
  ["아카데미 육성 보상금", "육성 보상금"],
  ["벤치에서", "벤치·대기에서"],
  ["주전으로", "선발로"],
  ["유소년", "아마추어"],
];

const REPAIRS = [
  ["메디컬 체크 체크", "메디컬 체크"],
  ["육성 육성 보상금", "육성 보상금"],
  ["육성·동계 육성", "아카데미·동계 육성"],
];

const stats = { files: 0, pairs: 0 };

function applyPairs(text, file) {
  let n = 0;
  for (const [a, b] of REPAIRS) {
    if (!text.includes(a)) continue;
    const c = text.split(a).length - 1;
    text = text.split(a).join(b);
    n += c;
    console.log(file, "repair", c, a);
  }

  text = text.split("아카데미·동계 육성").join(GUARD_OFFCAMP);

  for (const [a, b] of PAIRS) {
    if (a === "메디컬") {
      const re = /메디컬(?! 체크)/g;
      const c = (text.match(re) || []).length;
      if (!c) continue;
      text = text.replace(re, b);
      n += c;
      console.log(file, c, a);
      continue;
    }
    if (a === "아카데미") {
      const re = /아카데미(?!·)/g;
      const c = (text.match(re) || []).length;
      if (!c) continue;
      text = text.replace(re, b);
      n += c;
      console.log(file, c, a);
      continue;
    }
    if (!text.includes(a)) continue;
    const c = text.split(a).length - 1;
    text = text.split(a).join(b);
    n += c;
    console.log(file, c, a);
  }

  if (!PAIRS.some(([a]) => a === "메디컬")) {
    const re = /메디컬(?! 체크)/g;
    const c = (text.match(re) || []).length;
    if (c) {
      text = text.replace(re, "메디컬 체크");
      n += c;
      console.log(file, c, "메디컬");
    }
  }

  text = text.split(GUARD_OFFCAMP).join("아카데미·동계 육성");
  return { text, n };
}

for (const file of FILES) {
  const p = path.join(assets, file);
  if (!fs.existsSync(p)) continue;
  let s = fs.readFileSync(p, "utf8");
  const { text, n } = applyPairs(s, file);
  if (n) {
    fs.writeFileSync(p, text);
    stats.files++;
    stats.pairs += n;
  }
}

const engPath = path.join(assets, "engine-DhPc-c_J.js");
const eng = fs.readFileSync(engPath, "utf8");
const bad = ["메디컬 체크 체크", "육성 육성 보상금", "유소년"].filter((t) => eng.includes(t));
if (bad.length) {
  console.log("WARN engine terms:", bad.join(", "));
  process.exitCode = 1;
}

console.log("fix-terms-baseball done", JSON.stringify(stats));
if (process.exitCode) process.exit(process.exitCode);