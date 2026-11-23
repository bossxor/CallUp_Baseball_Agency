const fs = require("fs");
const s = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/engine-DhPc-c_J.js",
  "utf8"
);
const i = s.indexOf("B8={");
console.log("B8", s.slice(i, i + 120));
const z = s.indexOf("Z8=");
console.log("Z8", s.slice(z, z + 400));
const q = s.indexOf("Q8=");
console.log("Q8", s.slice(q, q + 120));

let idx = 0;
let c = 0;
while ((idx = s.indexOf("offlineParseSave", idx)) >= 0 && c < 5) {
  console.log("ops", idx, s.slice(idx - 100, idx + 80));
  idx++;
  c++;
}
// find KI assignment
const m = s.match(/.{0,40}KI.{0,80}/g);
console.log(
  (m || []).filter((x) => /KI\s*=/.test(x) || /as offlineParseSave/.test(x)).slice(0, 10)
);
const k = s.indexOf("as offlineParseSave");
console.log(s.slice(k - 300, k + 40));
