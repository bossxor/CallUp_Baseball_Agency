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
    if (c) console.log(label, c, a.slice(0, 40));
  }
  return s;
}

const pairs = [
  ["안타 어 주세요", "안타 쳐 주세요"],
  ["안타 어야", "안타를 쳐야"],
  ["공을 차며", "공을 던지며"],
  ["공을 차 봤어요", "스윙해 봤어요"],
  ["공을 차는 영상", "스윙하는 영상"],
  ["공을 차는 사진", "스윙하는 사진"],
  ["공을 차며 원터치 패스를 연습해요", "캐치볼로 송구 연습을 해요"],
  ["원터치 패스", "캐치볼"],
  // protect club then remap 슈팅
  ["슈팅 스타스", "§SHOOTING_STARS§"],
  ["슈팅 폼", "스윙 폼"],
  ["슈팅 특훈", "타격 특훈"],
  ["슈팅 100개", "스윙 100개"],
  ["슈팅을 100개씩 차겠대요", "스윙을 100개씩 하겠대요"],
  ["슈팅을 놓쳐 실점", "타구를 놓쳐 실점"],
  ["슈팅을 쏟아부었", "타구를 쏟아부었"],
  ["슈팅만 날렸", "파울만 날렸"],
  ["슈팅이 ", "타구가 "],
  ["슈팅을 ", "타구를 "],
  ["슈팅은 ", "타격은 "],
  ["슈팅에 ", "타구에 "],
  ["슈팅 리듬", "스윙 리듬"],
  ["슈팅 감각", "타격 감각"],
  ['"슈팅"', '"타격"'],
  ["슈팅", "타격"],
  ["§SHOOTING_STARS§", "슈팅 스타스"],
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
console.log("done");
