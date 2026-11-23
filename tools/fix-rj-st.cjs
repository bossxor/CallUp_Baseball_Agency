const fs = require("fs");
const p = "T:/CallUp/apk-src/assets/public/assets/engine-DhPc-c_J.js";
let s = fs.readFileSync(p, "utf8");
const pairs = [
  [
    'rj=["RF","SS","C","P"]',
    'rj=["P","C","1B","2B","3B","SS","LF","CF","RF"]',
  ],
  [
    'function sj(x,e,{p:t,l:n},l=!1){const r=e.st[t.pos],i=Math.min(4,(n.avg-r.r)/r.rs),s=t.pos==="RF"||t.pos==="SS"?Math.min(4,(n.ga/n.apps-r.g)/r.gs):i',
    'function sj(x,e,{p:t,l:n},l=!1){const r=e.st[t.pos]||{r:n.avg||0,rs:1,g:0,gs:1},i=Math.min(4,(n.avg-r.r)/r.rs),s=t.pos!=="P"?Math.min(4,(n.ga/n.apps-r.g)/r.gs):i',
  ],
  // negotiation leftover soccer ability checks
  ["e.stats.pac>=80", "e.stats.spd>=80"],
  ["e.stats.pas>=78", "e.stats.fld>=78"],
  ["e.stats.bat>=74||e.stats.pas>=78", "e.stats.bat>=74||e.stats.fld>=78"],
];
let n = 0;
for (const [a, b] of pairs) {
  if (!s.includes(a)) {
    console.log("MISS", a.slice(0, 60));
    continue;
  }
  const c = s.split(a).length - 1;
  s = s.split(a).join(b);
  n += c;
  console.log("OK", c, a.slice(0, 50));
}
fs.writeFileSync(p, s);
console.log("done", n);
console.log("rj", s.includes('rj=["P","C","1B"'));
console.log("sj guard", s.includes("e.st[t.pos]||{r:"));
