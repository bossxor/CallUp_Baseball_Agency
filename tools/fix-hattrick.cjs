const fs = require("fs");
const p = "T:/CallUp/apk-src/assets/public/assets/engine-DhPc-c_J.js";
let s = fs.readFileSync(p, "utf8");
const pairs = [
  ["tm_hattrick_ball", "tm_multi_ball"],
  ['e.kind==="hattrick"', 'e.kind==="multi"'],
  ['kind:"hattrick"', 'kind:"multi"'],
];
let n = 0;
for (const [a, b] of pairs) {
  const c = s.split(a).length - 1;
  if (c) {
    s = s.split(a).join(b);
    n += c;
    console.log("ok", c, a);
  } else console.log("miss", a);
}
fs.writeFileSync(p, s);
console.log("n", n, "left", (s.match(/hattrick/g) || []).length);
