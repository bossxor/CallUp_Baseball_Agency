const fs = require("fs");
const s = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/engine-DhPc-c_J.js",
  "utf8"
);
const i = s.indexOf("Ss={");
console.log(s.slice(i, i + 500));
const j = s.indexOf("Rt={");
console.log("\nRt", s.slice(j, j + 400));
// save version markers
for (const k of ["saveVersion", "version:", "schema", "offlinePatience", "parseSave"]) {
  console.log(k, s.split(k).length - 1);
}
