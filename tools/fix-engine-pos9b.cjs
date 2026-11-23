const fs = require("fs");
const path = require("path");
const engine = path.join(
  __dirname,
  "..",
  "apk-src",
  "assets",
  "public",
  "assets",
  "engine-DhPc-c_J.js"
);

let s = fs.readFileSync(engine, "utf8");
let n = 0;
const rep = (a, b, label) => {
  if (!s.includes(a)) {
    console.log("MISS", label || a.slice(0, 50));
    return;
  }
  const c = s.split(a).length - 1;
  s = s.split(a).join(b);
  n += c;
  console.log("OK", c, label || a.slice(0, 50));
};

const xFnew =
  'const xF={P:{spd:42,bat:28,pit:62,fld:48,phy:55},C:{spd:45,bat:55,pit:18,fld:62,phy:58},"1B":{spd:45,bat:60,pit:12,fld:55,phy:58},"2B":{spd:58,bat:55,pit:12,fld:60,phy:50},"3B":{spd:48,bat:58,pit:12,fld:58,phy:55},SS:{spd:60,bat:55,pit:12,fld:62,phy:50},LF:{spd:58,bat:60,pit:10,fld:52,phy:52},CF:{spd:65,bat:55,pit:10,fld:60,phy:50},RF:{spd:55,bat:62,pit:10,fld:52,phy:54}},eF=["spd","bat","pit","fld","phy"]';

rep(
  'const xF={FW:{pac:50.6,sho:59.1,pas:58.1,dri:57.1,def:40.7,phy:54.2},MF:{pac:51.6,sho:56.7,pas:60.6,dri:55.3,def:59,phy:52},DF:{pac:51.1,sho:41.3,pas:59.1,dri:41,def:61.7,phy:52.3}},eF=["spd","bat","fld","bat","fld","phy"]',
  xFnew,
  "xF/eF"
);

rep(
  "eF.reduce((r,i)=>r+n(i),0)/6",
  "eF.reduce((r,i)=>r+n(i),0)/eF.length",
  "oF divisor"
);

rep(
  "d=Math.max(1,{FW:i.int(6,9),MF:i.int(2,4),DF:i.int(1,2),GK:0}[t.pos])",
  'd=t.pos==="P"?0:Math.max(1,{RF:i.int(6,9),CF:i.int(5,8),LF:i.int(5,8),SS:i.int(3,6),"2B":i.int(3,6),"3B":i.int(3,6),"1B":i.int(4,7),C:i.int(2,5)}[t.pos]??i.int(2,5))',
  "goals-by-pos"
);

// event / story stat bumps still on soccer keys
const eventPairs = [
  ["{stat:{phy:1,pac:-1}}", "{stat:{phy:1,spd:-1}}"],
  ["{stat:{phy:1,pac:1}", "{stat:{phy:1,spd:1}"],
  ["{stat:{bat:1,pac:1}}", "{stat:{bat:1,spd:1}}"],
  ["{stat:{fld:3,pac:-1}}", "{stat:{fld:3,spd:-1}}"],
  ["{stat:{phy:1,pac:1},pot:1", "{stat:{phy:1,spd:1},pot:1"],
  ["stat:{pac:", "stat:{spd:"],
  ["stat:{sho:", "stat:{bat:"],
  ["stat:{pas:", "stat:{fld:"],
  ["stat:{dri:", "stat:{bat:"],
  ["stat:{def:", "stat:{fld:"],
  ["stat:{gk:", "stat:{pit:"],
  [",pac:", ",spd:"],
  [",sho:", ",bat:"],
  [",pas:", ",fld:"],
  [",dri:", ",bat:"],
  // careful: ,def: might hit defend words — only in stat objects already mostly done
];
for (const [a, b] of eventPairs) rep(a, b, a.slice(0, 30));

// highlight / cup leftovers
rep('kind:"hattrick"', 'kind:"multi"', "hattrick kind");
rep("cgoals", "ch", "cgoals→ch");

// Ba.push goals field → h when writing match feats
rep("kind:\"multi\",goals:", 'kind:"multi",h:', "multi.h");
rep("kind:\"motm\",goals:", 'kind:"motm",h:', "motm.h");
rep("kind:\"cupgoal\",goals:", 'kind:"cuphit",h:', "cuphit");
rep('kind:"cupgoal"', 'kind:"cuphit"', "cupgoal kind");

fs.writeFileSync(engine, s);
console.log("total", n);

// verify
for (const bad of [
  "FW:{pac:",
  "xF={FW:",
  "{FW:i.int",
  "GK:0}[t.pos]",
  "eF=[\"spd\",\"bat\",\"fld\",\"bat\"",
  "/6}function Gb",
]) {
  console.log(s.includes(bad) ? "STILL " + bad : "clean " + bad.slice(0, 40));
}
console.log("pac: left", (s.match(/pac:/g) || []).length);
console.log("hattrick left", (s.match(/hattrick/g) || []).length);
console.log("cgoals left", (s.match(/cgoals/g) || []).length);
