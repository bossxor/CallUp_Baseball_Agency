/**
 * Fix world-gen crash: soccer 4-pos identifier buckets vs baseball ji/pos.
 * Also expand shell scout filters to full 9.
 */
const fs = require("fs");
const path = require("path");

const assets = path.join(
  __dirname,
  "..",
  "apk-src",
  "assets",
  "public",
  "assets"
);
const engine = path.join(assets, "engine-DhPc-c_J.js");
const shell = path.join(assets, "shell-DaKdX7f1.js");

const POS_BUCKET =
  '{P:[],C:[],"1B":[],"2B":[],"3B":[],SS:[],LF:[],CF:[],RF:[]}';
const UI_WD =
  'ui=x=>{return{P:1,C:1,"1B":1,"2B":1,"3B":1,SS:1,LF:1,CF:1,RF:1}},Wd=x=>{return{P:5,C:2,"1B":2,"2B":2,"3B":2,SS:2,LF:2,CF:2,RF:2}}';

const pairs = [
  [
    "ui=x=>{const[e,t,n]=Hw[Vn(x)];return{GK:1,DF:e,MF:t,FW:n}},Wd=x=>{const e=ui(x);return{GK:3,DF:e.DF*2,MF:e.MF*2,FW:e.FW*2+2}}",
    UI_WD,
  ],
  // already-partial baseball ui? keep idempotent
  [
    "ui=x=>{const[e,t,n]=Hw[Vn(x)];return{P:1,C:e,SS:t,RF:n}},Wd=x=>{const e=ui(x);return{P:3,C:e.C*2,SS:e.SS*2,RF:e.RF*2+2}}",
    UI_WD,
  ],
  ["{GK:[],DF:[],MF:[],FW:[]}", POS_BUCKET],
  [
    'Du={GK:"투수",DF:"내야수",MF:"외야수",FW:"타자"}',
    'Du={P:"투수",C:"포수","1B":"1루수","2B":"2루수","3B":"3루수",SS:"유격수",LF:"좌익수",CF:"중견수",RF:"우익수"}',
  ],
  [
    "A8={GK:1,DF:4,MF:4,FW:2}",
    'A8={P:1,C:1,"1B":1,"2B":1,"3B":1,SS:1,LF:1,CF:1,RF:1}',
  ],
  [
    "N1={26:{GK:3,DF:9,MF:8,FW:6},23:{GK:3,DF:8,MF:7,FW:5},22:{GK:3,DF:7,MF:7,FW:5},21:{GK:3,DF:7,MF:7,FW:4},20:{GK:2,DF:7,MF:7,FW:4},18:{GK:2,DF:6,MF:6,FW:4}}",
    'N1={26:{P:5,C:2,"1B":2,"2B":3,"3B":2,SS:3,LF:3,CF:3,RF:3},23:{P:5,C:2,"1B":2,"2B":2,"3B":2,SS:2,LF:3,CF:3,RF:2},22:{P:5,C:2,"1B":2,"2B":2,"3B":2,SS:2,LF:2,CF:3,RF:2},21:{P:4,C:2,"1B":2,"2B":2,"3B":2,SS:2,LF:2,CF:3,RF:2},20:{P:4,C:2,"1B":2,"2B":2,"3B":2,SS:2,LF:2,CF:2,RF:2},18:{P:4,C:2,"1B":2,"2B":2,"3B":2,SS:2,LF:1,CF:2,RF:1}}',
  ],
  [
    'GE={GK:"무난한 투수",DF:"무난한 내야수",MF:"무난한 외야수",FW:"무난한 타자"}',
    'GE={P:"무난한 투수",C:"무난한 포수","1B":"무난한 1루수","2B":"무난한 2루수","3B":"무난한 3루수",SS:"무난한 유격수",LF:"무난한 좌익수",CF:"무난한 중견수",RF:"무난한 우익수"}',
  ],
  [
    "k4={GK:[1,1,1,1,13,12,21],DF:[4,5,3,2,6,4,5,15,14],MF:[8,10,6,7,8,10,14,16,17,18,23],FW:[9,7,11,10,9,7,19,20]},US={GK:[1],DF:[4,5,3],MF:[10,8,7],FW:[9,7,11]}",
    'k4={P:[1,11,18,21,34,45,99],C:[2,27,37],"1B":[3,19,25],"2B":[4,14,23],"3B":[5,15],SS:[6,7],LF:[8,16],CF:[8,24],RF:[9,22]},US={P:[1],C:[2],"1B":[3],"2B":[4],"3B":[5],SS:[6],LF:[7],CF:[8],RF:[9]}',
  ],
  [
    "lj={FW:.15,MF:0,DF:-.18,GK:-.1}",
    'lj={RF:.15,CF:.1,LF:.08,SS:.05,"2B":0,"3B":0,"1B":-.05,C:-.08,P:-.1}',
  ],
  [
    "position:{GK:W0.posGK,DF:W0.posDF,MF:W0.posMF,FW:W0.posFW}[e.pos]",
    'position:{P:W0.posGK,C:W0.posDF,"1B":W0.posDF,"2B":W0.posMF,"3B":W0.posMF,SS:W0.posMF,LF:W0.posFW,CF:W0.posFW,RF:W0.posFW}[e.pos]',
  ],
  [
    "{club:p.club,seasons:0,apps:0,goals:0,ast:0};f.seasons+=p.season?1:0,f.apps+=p.apps,f.goals+=p.goals,f.ast+=p.ast",
    "{club:p.club,seasons:0,apps:0,h:0,rbi:0};f.seasons+=p.season?1:0,f.apps+=p.apps,f.h+=(p.h||0),f.rbi+=(p.rbi||0)",
  ],
  [
    "t.st={...t.st,apps:s,goals:d,ast:i.int(1,5),rSum:s*i.range(6.8,7.1)}",
    "t.st={...t.st,apps:s,h:d,rbi:i.int(1,5),rSum:s*i.range(6.8,7.1)}",
  ],
];

let s = fs.readFileSync(engine, "utf8");
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

// Ba highlight kind:goals property keep numeric E but rename field if still goals:
// leave Ba.push goals for now — UI may map; not crash source

fs.writeFileSync(engine, s);
console.log("engine writes", n);

// verify no soccer bucket left
for (const bad of [
  "{GK:[],DF:[],MF:[],FW:[]}",
  "return{GK:1,DF:",
  "return{GK:3,DF:",
  "Du={GK:",
  "A8={GK:",
  "N1={26:{GK:",
  "GE={GK:",
  "k4={GK:",
  "lj={FW:",
  "position:{GK:W0",
]) {
  if (s.includes(bad)) console.error("STILL", bad);
  else console.log("clean", bad.slice(0, 28));
}

// --- shell ---
let sh = fs.readFileSync(shell, "utf8");
const shellPairs = [
  [
    'const e1=()=>[["ANY",n("전체")],["RF","RF"],["SS","SS"],["C","C"],["P","P"]]',
    'const e1=()=>[["ANY",n("전체")],["P",n("투수")],["C",n("포수")],["1B",n("1루수")],["2B",n("2루수")],["3B",n("3루수")],["SS",n("유격수")],["LF",n("좌익수")],["CF",n("중견수")],["RF",n("우익수")]]',
  ],
  [
    'const positions = ["P", "C", "SS", "RF"].map(pos => [pos, Yo(pos)]);',
    'const positions = ["P","C","1B","2B","3B","SS","LF","CF","RF"].map(pos => [pos, Yo(pos)]);',
  ],
  [
    '[["ANY",n("전체")],["RF","RF"],["SS","SS"],["C","C"],["P","P"]]',
    '[["ANY",n("전체")],["P",n("투수")],["C",n("포수")],["1B",n("1루수")],["2B",n("2루수")],["3B",n("3루수")],["SS",n("유격수")],["LF",n("좌익수")],["CF",n("중견수")],["RF",n("우익수")]]',
  ],
];
let sn = 0;
for (const [a, b] of shellPairs) {
  if (!sh.includes(a)) {
    console.log("shell MISS", a.slice(0, 50));
    continue;
  }
  const c = sh.split(a).length - 1;
  sh = sh.split(a).join(b);
  sn += c;
  console.log("shell OK", c, a.slice(0, 40));
}
fs.writeFileSync(shell, sh);
console.log("shell writes", sn);
