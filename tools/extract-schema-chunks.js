const fs = require("fs");
const s = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/engine-DhPc-c_J.js",
  "utf8"
);
const start = s.indexOf('const u2=["pac"');
console.log(s.slice(start, start + 900));
console.log("\n---Yw---");
const y = s.indexOf("Yw={");
console.log(s.slice(y, y + 700));
console.log("\n---eO---");
const e = s.indexOf("eO={FW:");
console.log(s.slice(e, e + 200));
console.log("\n---st init---");
const st = s.indexOf("st:{apps:0,goals:0");
console.log(s.slice(st, st + 80));
