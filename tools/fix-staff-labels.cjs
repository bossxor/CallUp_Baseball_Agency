/** Only user-visible soccer staff labels — do NOT rename item ids. */
const fs = require("fs");
const path = require("path");
const assets = path.join(__dirname, "..", "apk-src", "assets", "public", "assets");

const pairs = [
  ['name:"골키퍼 레전드"', 'name:"투수 레전드"'],
  ['name:"슈팅 구루"', 'name:"타격 구루"'],
  ['"골키퍼 레전드"', '"투수 레전드"'],
  ['"슈팅 구루"', '"타격 구루"'],
  ['"스위퍼 키퍼"', '"수비형 포수"'],
  ['"GK Voice"', '"Pitcher Voice"'],
  ['"Shot Guru"', '"Bat Guru"'],
  ['"Sweeper Keeper"', '"Framing Catcher"'],
  ["골키퍼 코치", "투수 코치"],
  ["슈팅 코치", "타격 코치"],
];

for (const f of fs.readdirSync(assets)) {
  if (!f.endsWith(".js")) continue;
  const fp = path.join(assets, f);
  let s = fs.readFileSync(fp, "utf8");
  let n = 0;
  for (const [a, b] of pairs) {
    if (!s.includes(a)) continue;
    const c = s.split(a).length - 1;
    s = s.split(a).join(b);
    n += c;
    console.log(f, a, c);
  }
  if (n) fs.writeFileSync(fp, s);
}
console.log("done");
