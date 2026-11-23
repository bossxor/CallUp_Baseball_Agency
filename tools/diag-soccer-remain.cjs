const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "apk-src", "assets", "public", "assets");
const keys = [
  "Football",
  "득점왕",
  "골키퍼",
  "슈팅",
  "축구",
  "Soccer",
  "해트트릭",
  "도움왕",
  "골대",
  "공을 차",
  "매치볼",
  '"goals"',
  ".goals",
  "SignHere",
  "사인히어",
  "골 넣",
  "멀티골",
  "offside",
  "페널티킥",
  "코너킥",
];
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const s = fs.readFileSync(path.join(dir, f), "utf8");
  const hits = [];
  for (const k of keys) {
    const n = s.split(k).length - 1;
    if (n) hits.push(k + ":" + n);
  }
  if (hits.length) console.log(f, hits.join(" "));
}
