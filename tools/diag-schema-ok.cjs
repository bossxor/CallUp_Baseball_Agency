const fs = require("fs");
const path = require("path");
const e = fs.readFileSync(
  path.join(__dirname, "..", "apk-src", "assets", "public", "assets", "engine-DhPc-c_J.js"),
  "utf8"
);
const checks = [
  'Ss={P:"투수"',
  'eL={spd:"주력"',
  "callupBaseball1",
  "callupAssertBaseball",
  'u2=["spd","bat","pit","fld","phy"]',
  "Rt={P:{pit:",
  'ok={P:1,C:1,"1B":1',
];
for (const c of checks) console.log(e.includes(c) ? "OK" : "MISS", c);
