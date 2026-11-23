const fs = require("fs");
const s = fs.readFileSync("T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js", "utf8");
const pats = [
  '==="pack"',
  "className:\"pk",
  "className:`pk",
  "view:\"pack\"",
  "팩 열기",
  "이 선수로",
  "function Vu",
  "Vu({",
  "sty-cand",
  ".pk ",
];
for (const p of pats) {
  let i = 0,
    c = 0;
  while ((i = s.indexOf(p, i)) >= 0) {
    c++;
    i += p.length;
  }
  console.log(JSON.stringify(p), c);
}
function dumpAround(needle, before = 120, after = 500) {
  let i = s.indexOf(needle);
  console.log("\n===", needle, "at", i, "===");
  if (i >= 0) console.log(s.slice(Math.max(0, i - before), i + after));
}
dumpAround('==="pack"');
dumpAround('className:"pk');
dumpAround("팩 열기");

const css = fs.readFileSync("T:/CallUp/apk-src/assets/public/assets/shell-DGv3wu-g.css", "utf8");
const ci = css.indexOf(".pk{");
console.log("\n=== css .pk at", ci, "===");
if (ci >= 0) console.log(css.slice(ci, ci + 1200));
const cj = css.indexOf("@keyframes");
// find pack related keyframes
for (const k of ["pkFlip", "pack", "cardFlip", "deal", "reveal", "tilt"]) {
  const ix = css.indexOf(k);
  if (ix >= 0) console.log("css has", k, "at", ix);
}
