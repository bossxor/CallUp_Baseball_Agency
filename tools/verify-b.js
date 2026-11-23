const fs = require("fs");
const s = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/engine-DhPc-c_J.js",
  "utf8"
);
const checks = {
  SsP: s.includes('Ss={P:"투수"'),
  noSsGK: !s.includes("Ss={GK"),
  u2: s.includes('u2=["spd","bat","pit","fld","phy"]'),
  noGkKey: !s.includes('"gk"') && !s.includes("===" + '"gk"'),
  Yw: s.includes("컨택:[\"bat\""),
  eO: s.includes("eO={P:[]"),
  assert: s.includes("function callupAssertBaseball"),
  GK_left: (s.match(/"GK"/g) || []).length,
  DF_left: (s.match(/"DF"/g) || []).length,
  sho_left: (s.match(/"sho"/g) || []).length,
  gk_left: (s.match(/"gk"/g) || []).length,
  pac_left: (s.match(/"pac"/g) || []).length,
  가속력: (s.match(/가속력/g) || []).length,
  컨택: (s.match(/컨택/g) || []).length,
};
console.log(checks);

// offlineParseSave export
const i = s.lastIndexOf("offlineParseSave");
console.log("tail", s.slice(i - 200, i + 80));

// nh still old?
const nh = s.indexOf("nh={");
console.log("nh sample", s.slice(nh, nh + 250));
