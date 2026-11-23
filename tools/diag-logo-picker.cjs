const fs = require("fs");
const s = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js",
  "utf8"
);
const i = s.indexOf('Oc=["다이아"');
console.log(s.slice(i, i + 800));
const j = s.indexOf("로고");
// find registration logo row
let k = s.indexOf('n("로고")');
console.log("\nlabel", s.slice(k - 50, k + 500));
// Jx logo components
const x = s.indexOf("Jx=(()=>{");
console.log("\nJx", s.slice(x, x + 600));
// soccer staff ids still
for (const p of [
  "fox_striker",
  "sweeper_keeper",
  "gk_legend",
  "shot_guru",
  "stc_gk",
  "pkc_gk",
]) {
  console.log(p, (s.split(p).length - 1));
}
