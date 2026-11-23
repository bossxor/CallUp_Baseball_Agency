const fs = require("fs");
const s = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js",
  "utf8"
);
const keys = [
  '"P"',
  '"1B"',
  '"SS"',
  "투수",
  "포수",
  "유격수",
  "골키퍼",
  "미드필더",
  "Ss=",
  "pos===",
  "callupBaseball1",
];
for (const k of keys) {
  console.log(k, s.split(k).length - 1);
}
