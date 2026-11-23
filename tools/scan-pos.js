const fs = require("fs");
const s = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/engine-DhPc-c_J.js",
  "utf8"
);
const keys = [
  "GK",
  "DF",
  "MF",
  "FW",
  "Ss=",
  "pos===",
  ".pos",
  "positions",
  "formation",
  "lineup",
  "bench",
  "gk",
  "sho",
  "pas",
  "def",
  "sta",
  "pac",
];
for (const k of keys) {
  console.log(k, s.split(k).length - 1);
}
// sample roster/demand patterns
for (const k of ["need:", "needs", "slots", "xi", "XI", "11명", "포메이션"]) {
  const n = s.split(k).length - 1;
  if (n) console.log("hit", k, n);
}
const i = s.indexOf("Ss={");
console.log("Ss", s.slice(i, i + 120));
