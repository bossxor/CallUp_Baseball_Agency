const fs = require("fs");
const s = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/engine-DhPc-c_J.js",
  "utf8"
);
for (const k of [
  "offlineParseSave",
  "function load",
  "parseSave",
  "JSON.parse",
  "localStorage",
]) {
  console.log(k, s.split(k).length - 1);
}
const i = s.indexOf("offlineParseSave");
console.log(s.slice(i, i + 400));
const sh = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js",
  "utf8"
);
const j = sh.indexOf("offlineParseSave");
console.log("shell", j, sh.slice(j - 80, j + 200));
