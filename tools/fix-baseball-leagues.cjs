/** Give the active league screens and schedules baseball rules while keeping save IDs. */
const fs = require("node:fs");
const path = require("node:path");
const assets = path.resolve(process.argv[2] || path.join(__dirname, "../apk-src"), "assets/public/assets");
const marker = "/*CALLUP_BASEBALL_LEAGUES*/";

function edit(file, update) {
  const target = path.join(assets, file);
  let source = fs.readFileSync(target, "utf8");
  if (source.includes(marker)) return;
  const replace = (pattern, replacement) => {
    const result = source.replace(pattern, replacement);
    if (source === result) throw Error("League patch anchor missing: " + pattern);
    source = result;
  };
  update(replace);
  fs.writeFileSync(target, source.trimEnd() + "\n" + marker + "\n");
}

edit("engine-DhPc-c_J.js", replace => {
  replace(/(N\("[^"]+",)"한국 1군"(?=,"한국")/g, '$1"KBO"');
  replace(/:"한국 1군"(?=[,}])/g, ':"KBO"');
  replace('"한국 1군":"일본 2군"', '"한국 1군":"KBO"');
  replace("한국 1군 우승컵을", "KBO 우승을");
  replace(/"일본 1군"/g, '"NPB"');
  replace(/"일본 2군"/g, '"NPB 2군"');
  replace(/"한국 2군"/g, '"KBO 퓨처스"');
  replace(/"대만 1군"/g, '"CPBL"');
  replace(/"미국 메이저"/g, '"MLB"');
  replace(/"미국 마이너"/g, '"MiLB"');
  replace('season:d==="A"?"AUG_MAY":"FEB_NOV",rr:c.rr??2,releg:c.releg??0,promo:0,down:c.down,split:c.split',
    'season:"FEB_NOV",rr:c.rr??2,releg:0,promo:0');
  // These were football club competitions. National-team games use a separate calendar.
  replace(/const c_=x=>"D:"\+x,wy=\{.*?(?=const pl=\{chat:)/s, "const kl=[],po=()=>false,u_=()=>undefined;");
  replace(/function S8\(x,e\)\{.*?(?=const ML=)/s, "");
  replace('S8(x,r),yield,_E(x,e,t),yield,mE(x,e,t),yield,oM(x,e,t)', 'oM(x,e,t)');
});

edit("shell-DaKdX7f1.js", replace => {
  replace('const Gb=["ENG1","ESP1","GER1","ITA1","FRA1"]', 'const Gb=["KOR1","JPN1","GER1","USA1"]');
  replace('const Jo=["ENG1","ESP1","ITA1","GER1","FRA1","KOR1"]',
    'const Jo=["KOR1","KOR2","JPN1","JPN2","GER1","USA1","USA2"]');
  replace('p.useState((h==null?void 0:h.cont)??"EU")', 'p.useState(h?.cont??"AS")');
  replace('const b5=["EU","SA","NA","AS","AF"]', 'const b5=["AS","NA"]');
  replace('dc.filter(y=>y.cont===u).map(y=>y.country)', 'dc.filter(y=>Jo.includes(y.id)&&y.cont===u).map(y=>y.country)');
  replace('dc.filter(v=>v.country===y)', 'dc.filter(v=>Jo.includes(v.id)&&v.country===y)');
  replace('img",{className:"lg-flag",src:a,alt:n(t.country)}', 'img",{className:"lg-flag",src:a,alt:""}');
  replace('children:n("득실")}),e.jsx("th",{children:n("승점")})', 'children:n("득실점")}),e.jsx("th",{children:n("승률")})');
  replace('e.jsx("small",{children:n(at[h.cont])})', 'e.jsx("small",{children:n(h.country)})');
  replace('children:e.jsx("b",{children:y.pts})', 'children:e.jsx("b",{children:y.w+y.l?(y.w/(y.w+y.l)).toFixed(3):"—"})');
  replace('const v5={GK:0,DF:1,MF:2,FW:3}', 'const v5={P:0,C:1,"1B":2,"2B":3,"3B":4,SS:5,LF:6,CF:7,RF:8}');
});

for (const [file, rate, diff, archive] of [
  ["ui-DgYnPcSw.js", "Win Pct.", "Run Diff.", "Archived Club Competition"],
  ["ui-DSX53OnJ.js", "% de victorias", "Dif. de carreras", "Torneo de clubes archivado"],
]) {
  edit(file, replace => {
    replace(/"한국 1군":"[^"]+",/, "");
    replace('"한국 1군 우승컵을 {n}번 들게 해 주세요"', '"KBO 우승을 {n}번 해 주세요"');
  replace('"미국 마이너":', '"승률":'+JSON.stringify(rate)+',"득실점":'+JSON.stringify(diff)+',"이전 클럽 대회":'+JSON.stringify(archive)+',"미국 마이너":');
  });
}
console.log("Baseball league schedules and labels applied.");
