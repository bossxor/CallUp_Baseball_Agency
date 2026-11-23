/**
 * Extra user-facing soccer → baseball copy. No schema key remaps (.goals/.ast).
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
    console.log(label, c, String(a).slice(0, 64).replace(/\n/g, " "));
  }
  return { s, n };
}

const pairs = [
  ["도움왕", "안타왕"],
  ["득점왕", "타점왕"],
  ["멀티골", "멀티안타"],
  ["해트트릭", "멀티히트"],
  ["페널티킥", "고의사구"],
  ["코너킥", "번트"],
  ["오프사이드", "견제아웃"],
  ["offside trap", "pickoff move"],
  ["an offside", "a pickoff"],
  ["Offside!", "Picked off!"],
  ["offside", "picked off"],
  ["공을 차고 있었다", "배트를 휘두르고 있었다"],
  ["맨발로 차는데 아무도 공을 못 뺏어", "맨발로 던지는데 아무도 못 치더라"],
  ["공을 차는데", "배트를 휘두르는데"],
  ["골대 하나는", "백스탑 하나는"],
  ["골대", "펜스"],
  ["골 넣고", "안타 치고"],
  ["골을 넣었", "안타를 쳤"],
  ["골을 넣", "안타를 치"],
  ["골 넣", "안타 "],
  ["매치볼 챙겼어요", "끝내기 안타"],
  ["매치볼", "끝내기"],
  ["Football finally", "Baseball finally"],
  ["Football's governing", "Baseball's governing"],
  ["Football first", "Baseball first"],
  ["Football is fun", "Baseball is fun"],
  ["Football isn't", "Baseball isn't"],
  ["Lab-Grown Footballer", "Lab-Grown Ballplayer"],
  ["슈팅 연습", "타격 연습"],
  ["슈팅 코치", "타격 코치"],
  ['label:a("슈팅")', 'label:a("타격")'],
  ['a("슈팅")', 'a("타격")'],
  ['n("슈팅")', 'n("타격")'],
  ['"슈팅":', '"타격":'],
  ["/득점|골/", "/타점|안타|홈런/"],
];

for (const f of fs.readdirSync(assets)) {
  if (!f.endsWith(".js")) continue;
  const fp = path.join(assets, f);
  let s = fs.readFileSync(fp, "utf8");
  const before = s;
  const r = rep(s, pairs, f);
  s = r.s.replace(/안타  ([가-힣])/g, "안타 $1");
  if (s !== before) {
    fs.writeFileSync(fp, s);
    console.log("wrote", f);
  }
}
console.log("fix-purge2-copy done");
