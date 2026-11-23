const fs = require("fs");
const path = require("path");
const assets = path.join(__dirname, "..", "apk-src", "assets", "public", "assets");
const pairs = [
  ["킥오프", "경기 시작"],
  ["kick-off", "first pitch"],
  ["Kick-off", "First pitch"],
  ["kickoff", "first pitch"],
  ["Kickoff", "First pitch"],
];
for (const f of fs.readdirSync(assets).filter((x) => x.endsWith(".js"))) {
  const fp = path.join(assets, f);
  let s = fs.readFileSync(fp, "utf8");
  const before = s;
  for (const [a, b] of pairs) {
    if (!s.includes(a)) continue;
    const c = s.split(a).length - 1;
    s = s.split(a).join(b);
    console.log(f, c, a);
  }
  if (s !== before) fs.writeFileSync(fp, s);
}
console.log("done");
