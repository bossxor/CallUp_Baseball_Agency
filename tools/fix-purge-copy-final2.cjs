const fs = require("fs");
const path = require("path");
const assets = path.join(__dirname, "..", "apk-src", "assets", "public", "assets");

const pairs = [
  ["고의사구을", "고의사구를"],
  ["고의사구이", "고의사구가"],
  ["고의사구은", "고의사구는"],
  ["다시 선 페널티 지점", "다시 선 타석"],
  ["페널티 지점", "타석"],
  ["팀 페널티 키커", "팀 대타"],
  ["페널티 키커", "대타"],
  ["담 키커 자리", "담 대타 자리"], // if truncated
  ["키커를 맡을지", "대타를 맡을지"],
  ["키커 자리", "대타 자리"],
  ["페널티 ", "클러치 "],
  ["PK ", "클러치 "],
  ['"골"', '"안타"'],
  [" n골", " n안타"],
  ["{n}골", "{n}안타"],
  ["몇 골", "몇 안타"],
  ["골을 넣", "안타를 치"],
  ["골 넣", "안타 "],
];

for (const f of fs.readdirSync(assets).filter((x) => x.endsWith(".js"))) {
  const fp = path.join(assets, f);
  let s = fs.readFileSync(fp, "utf8");
  let n = 0;
  const before = s;
  for (const [a, b] of pairs) {
    if (!s.includes(a)) continue;
    const c = s.split(a).length - 1;
    s = s.split(a).join(b);
    n += c;
    console.log(f, c, a);
  }
  if (s !== before) {
    fs.writeFileSync(fp, s);
    console.log("wrote", f, n);
  }
}
console.log("done");
