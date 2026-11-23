/**
 * Final user-facing soccer copy → baseball. Ordered long→short. No schema keys.
 */
const fs = require("fs");
const path = require("path");
const assets = path.join(__dirname, "..", "apk-src", "assets", "public", "assets");

function rep(s, pairs, label) {
  let n = 0;
  for (const [a, b] of pairs) {
    if (!s.includes(a)) continue;
    const c = s.split(a).length - 1;
    s = s.split(a).join(b);
    n += c;
    console.log(label, c, a.slice(0, 56));
  }
  return s;
}

const pairs = [
  // achievements / story
  ["대표팀 데뷔골", "대표팀 데뷔안타"],
  ["데뷔전 데뷔골", "데뷔전 데뷔안타"],
  ["데뷔골", "데뷔안타"],
  ["{c}에서 프로 첫 골", "{c}에서 프로 첫 안타"],
  ["프로 첫 골", "프로 첫 안타"],
  ['children:"GOAL"', 'children:"HIT"'],
  ['children: "GOAL"', 'children: "HIT"'],
  ['"GOAL!"', '"HIT!"'],
  ["골!", "안타!"],
  // EN/ES ui maps
  ['데뷔안타:"First Goal"', '데뷔안타:"First Hit"'],
  ['데뷔골:"First Goal"', '데뷔안타:"First Hit"'],
  ['"대표팀 데뷔안타":"Int\'l Goal #1"', '"대표팀 데뷔안타":"Int\'l Hit #1"'],
  ['"대표팀 데뷔골":"Int\'l Goal #1"', '"대표팀 데뷔안타":"Int\'l Hit #1"'],
  ['"{c}에서 프로 첫 안타":"First goal ({c})"', '"{c}에서 프로 첫 안타":"First hit ({c})"'],
  ['"{c}에서 프로 첫 골":"First goal ({c})"', '"{c}에서 프로 첫 안타":"First hit ({c})"'],
  ['"프로 첫 안타":"First goal"', '"프로 첫 안타":"First hit"'],
  ['"프로 첫 골":"First goal"', '"프로 첫 안타":"First hit"'],
  ['"안타!":"GOAL!"', '"안타!":"HIT!"'],
  ['"골!":"GOAL!"', '"안타!":"HIT!"'],
  ['데뷔안타:"Primer gol"', '데뷔안타:"Primer hit"'],
  ['데뷔골:"Primer gol"', '데뷔안타:"Primer hit"'],
  ['"대표팀 데뷔안타":"Gol selec. nº 1"', '"대표팀 데뷔안타":"Hit selec. nº 1"'],
  ['"대표팀 데뷔골":"Gol selec. nº 1"', '"대표팀 데뷔안타":"Hit selec. nº 1"'],
  ['"{c}에서 프로 첫 안타":"Primer gol ({c})"', '"{c}에서 프로 첫 안타":"Primer hit ({c})"'],
  ['"{c}에서 프로 첫 골":"Primer gol ({c})"', '"{c}에서 프로 첫 안타":"Primer hit ({c})"'],
  ['"프로 첫 안타":"Primer gol"', '"프로 첫 안타":"Primer hit"'],
  ['"프로 첫 골":"Primer gol"', '"프로 첫 안타":"Primer hit"'],
  // roles / banter
  ["스크린의 스트라이커", "스크린의 슬러거"],
  ["등지는 타깃형 스트라이커", "등지는 타깃형 타자"],
  ["스트라이커 밥 떠먹여 줬죠", "타자 밥 떠먹여 줬죠"],
  ["Spoon-fed the striker", "Spoon-fed the batter"],
  ["Old-school target man", "Old-school cleanup hitter"],
  ["스트라이커", "타자"],
  // pen / clutch
  ["페널티 공포증", "클러치 공포증"],
  ["PK 트라우마", "클러치 트라우마"],
  ["Pen Phobia", "Clutch Phobia"],
  ["Pen Panic", "Clutch Panic"],
  ["Fobia al penal", "Fobia al clutch"],
  ["Miedo penal", "Miedo clutch"],
  // score lines still soccer-ish
  ["{c} 결승전 {n}골", "{c} 결승전 {n}안타"],
  ["결승전 {n}골", "결승전 {n}안타"],
  ["택배 크로스 봤어요?", "정확한 송구 봤어요?"],
  ["Saw my cross?", "Saw my throw?"],
  // flash GOAL before kick-off style
  ['scoreboard flashes "GOAL!" before kick-off', 'scoreboard flashes "HIT!" before first pitch'],
  ["before kick-off", "before first pitch"],
  ["직접 찬 PK가 스트라이크존 구석에 꽂혔어요", "결정타가 담장 구석에 꽂혔어요"],
  ["His PK nestled in the corner", "His hit nestled in the corner"],
];

for (const f of fs.readdirSync(assets)) {
  if (!f.endsWith(".js")) continue;
  const fp = path.join(assets, f);
  let s = fs.readFileSync(fp, "utf8");
  const before = s;
  s = rep(s, pairs, f);
  if (s !== before) {
    fs.writeFileSync(fp, s);
    console.log("wrote", f);
  }
}

// shell achievement kind label map if any
{
  const fp = path.join(assets, "shell-DaKdX7f1.js");
  let s = fs.readFileSync(fp, "utf8");
  s = rep(
    s,
    [
      ['n("프로 첫 안타")', 'n("프로 첫 안타")'], // noop ensure
      ['text:n("프로 첫 골")', 'text:n("프로 첫 안타")'],
    ],
    "shell+"
  );
  fs.writeFileSync(fp, s);
}

console.log("fix-purge-copy-final done");
