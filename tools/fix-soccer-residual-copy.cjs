/** Clear remaining soccer residual phrases flagged by check-soccer-residual. */
const fs = require("node:fs");
const path = require("node:path");

const root = process.argv[2] ?? path.join(__dirname, "../apk-src");
const assets = path.join(root, "assets/public/assets");
const marker = "/*CALLUP_SOCCER_RESIDUAL_COPY*/";

const pairs = [
  // Korean UI / news / scout
  ["결승골이 핸드볼이었어요", "결승 타구가 파울이었는데 인정됐어요"],
  ["{c} 결승전 결승골", "{c} 결승전 결승타"],
  ["결승골", "결승타"],
  ["헤딩골", "끝내기 안타"],
  ["헤딩 동점골", "동점 적시타"],
  ["헤딩", "타구"],
  ["프리킥", "대타 기회"],
  ["승부차기", "끝내기 찬스"],
  ["세트피스 키커감이에요", "대타·클러치감이에요"],
  ["세트피스 사냥꾼", "클러치 사냥꾼"],
  ["세트피스", "클러치 플레이"],
  ["하프타임에", "5회가 끝날 때"],
  ["하프타임", "이닝 교대"],
  ["골망 흔들던 소리가 그리울 거예요", "배트 맞는 소리가 그리울 거예요"],
  ["골망", "펜스"],
  ["승점 3 김치찌개", "연승 김치찌개"],
  ["승점", "승수"],
  ["금 간 정강이 보호대", "금 간 타격용 발등 보호대"],
  ["정강이 보호대", "발등 보호대"],
  ["한 경기 3골 {n}번", "한 경기 3안타 {n}번"],
  ["한 경기 3골", "한 경기 3안타"],
  ["멀티히트", "멀티히트"],

  // English
  ["Hat-Trick", "Multi-Hit"],
  ["Hat-trick", "Multi-hit"],
  ["hat-trick", "multi-hit"],
  ["Free-Kick Duty", "Pinch-Hit Duty"],
  ["Free Kick Duty", "Pinch Hit Duty"],
  ["Free-Kick", "Pinch-Hit"],
  ["Free Kick", "Pinch Hit"],
  ["free-kick", "pinch-hit"],
  ["free kick", "pinch hit"],
  ["set-piece", "clutch play"],
  ["Set Piece", "Clutch Play"],
  ["set piece", "clutch play"],
  ["Late headed goal", "Late tying hit"],
  ["Born set-piece taker", "Born clutch hitter"],
  ["Looks good in shootouts", "Looks good in walk-off spots"],
  ["Winner Was a Handball", "Winner Was a Bad Call"],
  ["I'll miss the sound of the net", "I'll miss the crack of the bat"],

  // Spanish
  ["Tiro libre", "Turno emergente"],
  ["tiro libre", "turno emergente"],
  ["fuera de juego", "fuera de base"],
  ["Balón parado", "Jugada clutch"],
  ["Empate de cabeza", "Hit del empate"],
  ["Se luce en los penales", "Se luce en turnos decisivos"],

  // Nicknames / titles
  ["승부차기의 신", "끝내기 해결사"],
  ["Shootout God", "Walk-off Closer"],
  ["프리킥 장인의 후계자", "클러치 타자의 후계자"],
  ["Free-Kick Heir", "Clutch-Hit Heir"],
];

const regexCleanups = [
  [
    "/결승골|동점골|선제골|역전골|데뷔안타|복귀골|헤더 골|헤딩 ?골|프리킥 골|중거리 골|안타를 치|골을 터|골이 터|골로 |골까지|골 세리머니|득점|골망|타점|PK를 차/",
    "/결승타|동점타|선제 득점|역전타|데뷔안타|복귀 안타|안타를 치|타점|홈런|적시타/",
  ],
];

function patchFile(file) {
  const target = path.join(assets, file);
  if (!fs.existsSync(target)) return false;
  let source = fs.readFileSync(target, "utf8");
  if (source.includes(marker)) return false;

  // Keep migration tables intact: only rewrite live source before markers.
  const eventIdx = source.indexOf("/*CALLUP_BASEBALL_EVENT_COPY*/");
  const saveIdx = source.indexOf("/*CALLUP_BASEBALL_SAVE_COPY*/");
  let head = source;
  let tail = "";
  if (file.startsWith("engine-") && (eventIdx >= 0 || saveIdx >= 0)) {
    const cut = Math.min(
      eventIdx >= 0 ? eventIdx : Infinity,
      saveIdx >= 0 ? saveIdx : Infinity,
    );
    head = source.slice(0, cut);
    tail = source.slice(cut);
  }

  for (const [old, next] of pairs) {
    if (old === next) continue;
    if (head.includes(old)) head = head.split(old).join(next);
  }
  for (const [old, next] of regexCleanups) {
    if (head.includes(old)) head = head.split(old).join(next);
  }

  fs.writeFileSync(target, (head + tail).trimEnd() + "\n" + marker + "\n");
  return true;
}

const files = [
  "engine-DhPc-c_J.js",
  "names-CdWzr2Fb.js",
  "ui-DgYnPcSw.js",
  "ui-DSX53OnJ.js",
  "cards-BIf9GcoI.js",
  "cards-C3OvAKC4.js",
  "shell-DaKdX7f1.js",
  "yearSay-CxPvW4Nr.js",
];
let n = 0;
for (const file of files) if (patchFile(file)) n++;
console.log(`Soccer residual copy cleared in ${n} files.`);
