const fs = require("fs");
const shell = fs.readFileSync("T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js", "utf8");
const idx = fs.readFileSync("T:/CallUp/apk-src/assets/public/assets/index-B5T0JNgO.js", "utf8");
for (const t of [
  "보고서 열기",
  "FLIP TO READ",
  "SCOUT REPORT",
  "CALL UP SCOUT REPORT",
  "팩 위쪽",
  "보고서 위쪽",
  "TEAR TO OPEN",
  "팩 열기",
]) {
  console.log(JSON.stringify(t), shell.split(t).length - 1);
}
console.log("emblem refs", idx.split("emblem").length - 1 + shell.split("emblem").length - 1);
console.log("theme exists", fs.existsSync("T:/CallUp/apk-src/assets/public/callup-theme.css"));
console.log("emblem size", fs.statSync("T:/CallUp/apk-src/assets/public/emblem.webp").size);
