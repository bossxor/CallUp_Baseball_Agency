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
    console.log(label, c, a.slice(0, 48));
  }
  return s;
}

const pairs = [
  // corruption from 골 넣 → 안타
  ["안타 어야", "안타를 쳐야"],
  ["안타 고", "안타 치고"],
  ["마수걸이 안타 ", "마수걸이 안타를 "],
  // EN Football left as values
  [":\"Football's a job, really.\"", ":\"Baseball's a job, really.\""],
  [":\"Football is art to me.\"", ":\"Baseball is art to me.\""],
  [":\"Football is life.\"", ":\"Baseball is life.\""],
  ["Football's a job", "Baseball's a job"],
  ["Football is art", "Baseball is art"],
  ["Football is life", "Baseball is life"],
  // ball kick narrative keys
  ["고개를 들고 공을 차요", "고개를 들고 공을 봐요"],
  ["바로 공을 차러 갔다", "바로 야구하러 갔다"],
  ["몇 번 공을 차다 말고", "몇 번 스윙하다 말고"],
  ["혼자 공을 차던 아이", "혼자 배트 휘두르던 아이"],
  ["그냥 공을 차고 싶었어요", "그냥 야구하고 싶었어요"],
  ["공을 차러", "야구하러"],
  ["공을 차다", "스윙하다"],
  ["공을 차던", "배트 휘두르던"],
  ["공을 차고", "야구하고"],
  ["공을 차요", "공을 봐요"],
  // shooting / goal mouth
  ["슈팅 궤적", "타구 궤적"],
  ["슈팅이 계속", "타구가 계속"],
  ["슈팅이 자꾸", "타구가 자꾸"],
  ["골문으로 빨려", "펜스로 빨려"],
  ["골문", "스트라이크존"],
  // shell EN pos roles (display map)
  [
    'Nj={FW:"FORWARD",MF:"MIDFIELDER",DF:"DEFENDER",GK:"GOALKEEPER"}',
    'Nj={RF:"OUTFIELD",CF:"OUTFIELD",LF:"OUTFIELD",SS:"INFIELD",P:"PITCHER",C:"CATCHER","1B":"INFIELD","2B":"INFIELD","3B":"INFIELD",FW:"OUTFIELD",MF:"INFIELD",DF:"INFIELD",GK:"PITCHER"}',
  ],
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
console.log("fix-labels-purge3 done");
