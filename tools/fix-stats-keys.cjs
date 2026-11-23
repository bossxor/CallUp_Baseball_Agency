const fs = require("fs");
const p = "T:/CallUp/apk-src/assets/public/assets/engine-DhPc-c_J.js";
let s = fs.readFileSync(p, "utf8");
const pairs = [
  ["stats.pac", "stats.spd"],
  ["stats.pas", "stats.fld"],
  ["stats.sho", "stats.bat"],
  ["stats.dri", "stats.bat"],
  ["stats.def", "stats.fld"],
  ["stats.gk", "stats.pit"],
];
let n = 0;
for (const [a, b] of pairs) {
  const c = s.split(a).length - 1;
  if (!c) continue;
  s = s.split(a).join(b);
  n += c;
  console.log(a, "->", b, c);
}
fs.writeFileSync(p, s);
console.log("total", n);
