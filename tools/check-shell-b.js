const fs = require("fs");
const s = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js",
  "utf8"
);
console.log({
  stamp: s.includes("callupBaseball1"),
  POS9: s.includes('"1B"'),
  GK: s.includes('"GK"'),
});
