const fs = require("fs");
const p = "T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js";
let s = fs.readFileSync(p, "utf8");
const a =
  "Ls=()=>{var ce;const B=Y.current;if(!B.down||B.finished)return;B.down=!1,B.ys.fill(null);";
const b =
  'Ls=()=>{var ce;const B=Y.current;if(!B.down||B.finished)return;B.down=!1,B.ys.fill(null),B.base&&(B.base.style.transform="");';
const n = s.split(a).length - 1;
console.log("count", n);
if (n !== 1) process.exit(1);
fs.writeFileSync(p, s.split(a).join(b));
console.log("ok");
