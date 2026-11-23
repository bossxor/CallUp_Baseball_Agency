/**
 * Phase B: soccer schema → baseball 9-pos + bat/pit/fld abilities + B1 marker.
 * Usage: node patch-baseball-sim.cjs <apk-src-root>
 */
const fs = require("node:fs");
const path = require("node:path");

const root = process.argv[2];
if (!root) {
  console.error("Usage: node patch-baseball-sim.cjs <apk-src-root>");
  process.exit(1);
}

const map = JSON.parse(
  fs.readFileSync(path.join(__dirname, "pos-map.json"), "utf8")
);
const assets = path.join(root, "assets", "public", "assets");
const read = (p) => fs.readFileSync(p, "utf8");
const write = (p, s) => fs.writeFileSync(p, s, "utf8");
const replaceAll = (s, a, b) => {
  if (!s.includes(a)) return { s, n: 0 };
  const n = s.split(a).length - 1;
  return { s: s.split(a).join(b), n };
};
const apply = (s, pairs, label) => {
  let total = 0;
  for (const [a, b] of pairs) {
    const r = replaceAll(s, a, b);
    s = r.s;
    if (r.n) total += r.n;
  }
  console.log(label, total);
  return s;
};

const POS9 = `["P","C","1B","2B","3B","SS","LF","CF","RF"]`;
const SsRt = `Ss={P:"투수",C:"포수","1B":"1루수","2B":"2루수","3B":"3루수",SS:"유격수",LF:"좌익수",CF:"중견수",RF:"우익수"},Rt={P:{pit:.75,phy:.15,spd:.1},C:{fld:.4,bat:.25,phy:.25,spd:.1},"1B":{bat:.35,fld:.3,phy:.25,spd:.1},"2B":{fld:.35,bat:.25,spd:.25,phy:.15},"3B":{fld:.35,bat:.3,phy:.25,spd:.1},SS:{fld:.4,spd:.25,bat:.25,phy:.1},LF:{bat:.4,spd:.25,fld:.2,phy:.15},CF:{spd:.35,fld:.3,bat:.25,phy:.1},RF:{bat:.4,fld:.25,spd:.2,phy:.15}}`;

const u2block =
  `const u2=["spd","bat","pit","fld","phy"],eL={spd:"주력",bat:"타격",pit:"투구",fld:"수비",phy:"피지컬"},` +
  SsRt;

const u2old =
  `const u2=["pac","sho","pas","dri","def","phy","gk"],eL={pac:"스피드",sho:"슈팅",pas:"패스",dri:"드리블",def:"수비",phy:"피지컬",gk:"투구"},Ss={GK:"투수",DF:"내야수",MF:"외야수",FW:"타자"},Rt={GK:{gk:.8,phy:.1,pas:.1},DF:{def:.45,phy:.25,pac:.15,pas:.15},MF:{pas:.35,dri:.25,def:.15,sho:.1,phy:.1,pac:.05},FW:{sho:.4,dri:.2,pac:.2,phy:.1,pas:.1}}`;

const u2alt =
  `const u2=["spd","bat","pit","fld","phy"],eL={spd:"주력",bat:"타격",pit:"투구",fld:"수비",phy:"피지컬"},Ss={P:"투수",C:"포수","1B":"1루수","2B":"2루수","3B":"3루수",SS:"유격수",LF:"좌익수",CF:"중견수",RF:"우익수"},Rt={P:{pit:.75,phy:.15,spd:.1},C:{fld:.4,bat:.25,phy:.25,spd:.1},"1B":{bat:.35,fld:.3,phy:.25,spd:.1},"2B":{fld:.35,bat:.25,spd:.25,phy:.15},"3B":{fld:.35,bat:.3,phy:.25,spd:.1},SS:{fld:.4,spd:.25,bat:.25,phy:.1},LF:{bat:.4,spd:.25,fld:.2,phy:.15},CF:{spd:.35,fld:.3,bat:.25,phy:.1},RF:{bat:.4,fld:.25,spd:.2,phy:.15}}`;

const UwOld = `function Uw(x,e,t){const n={};for(const r of u2){const i=Rt[e][r]??0;r==="gk"?n.gk=e==="GK"?t+x.normal(0,3):x.range(8,22):e==="GK"?n[r]=r==="phy"||r==="pas"?t-6+x.normal(0,5):x.range(25,45):n[r]=i>0?t+x.normal(0,6):t-16+x.normal(0,8)}const l=t-Ze(n,e);for(const r of Object.keys(Rt[e]))n[r]+=l;for(const r of u2)n[r]=v(n[r],5,99);return n}`;

const UwNew = `function Uw(x,e,t){const n={};for(const r of u2){const i=Rt[e][r]??0;r==="pit"?n.pit=e==="P"?t+x.normal(0,3):x.range(8,22):e==="P"?n[r]=r==="phy"||r==="fld"?t-6+x.normal(0,5):x.range(25,45):n[r]=i>0?t+x.normal(0,6):t-16+x.normal(0,8)}const l=t-Ze(n,e);for(const r of Object.keys(Rt[e]))n[r]+=l;for(const r of u2)n[r]=v(n[r],5,99);return n}`;

const YwNew = `Yw={스타트:["spd",0],전력질주:["spd",1],베이스런:["spd",2],컨택:["bat",0],파워:["bat",1],선구:["bat",2],구속:["pit",0],제구:["pit",1],변화:["pit",2],포구:["fld",0],송구:["fld",1],수비범위:["fld",2],몸싸움:["phy",0],체력:["phy",1],근력:["phy",2]}`;

const eONew = `eO={P:[],C:["1B","3B"],"1B":["3B","LF"],"2B":["SS","CF"],"3B":["1B","SS"],SS:["2B","CF"],LF:["CF","RF"],CF:["LF","RF"],RF:["LF","CF"]},rg=${POS9}`;

function patchEngine(file) {
  let s = read(file);
  const alreadyCore =
    s.includes('Ss={P:"투수"') && s.includes('u2=["spd","bat","pit"');
  if (alreadyCore) {
    console.log("engine core already baseball — running cleanup passes");
  }

  if (!alreadyCore && s.includes(u2old)) {
    s = s.replace(u2old, u2block);
    console.log("replaced u2/eL/Ss/Rt block");
  } else if (!alreadyCore && s.includes('u2=["pac","sho"')) {
    const ssOld = `Ss={GK:"투수",DF:"내야수",MF:"외야수",FW:"타자"},Rt={GK:{gk:.8,phy:.1,pas:.1},DF:{def:.45,phy:.25,pac:.15,pas:.15},MF:{pas:.35,dri:.25,def:.15,sho:.1,phy:.1,pac:.05},FW:{sho:.4,dri:.2,pac:.2,phy:.1,pas:.1}}`;
    if (s.includes(ssOld)) {
      s = s.replace(ssOld, SsRt);
      console.log("replaced Ss/Rt");
    }
    s = s.replace(
      `const u2=["pac","sho","pas","dri","def","phy","gk"],eL={pac:"스피드",sho:"슈팅",pas:"패스",dri:"드리블",def:"수비",phy:"피지컬",gk:"투구"}`,
      `const u2=["spd","bat","pit","fld","phy"],eL={spd:"주력",bat:"타격",pit:"투구",fld:"수비",phy:"피지컬"}`
    );
    console.log("replaced u2/eL");
  } else if (!alreadyCore) {
    console.warn("u2 block not found in expected form");
  }

  if (!alreadyCore) {
    if (s.includes(UwOld)) {
      s = s.replace(UwOld, UwNew);
      console.log("replaced Uw");
    }
    {
      const y0 = s.indexOf("Yw={");
      const y1 = s.indexOf("},nh={");
      if (y0 >= 0 && y1 > y0 && !s.includes('컨택:["bat"')) {
        s =
          s.slice(0, y0) +
          YwNew +
          ",nh={" +
          s.slice(y1 + "},nh={".length);
        console.log("replaced Yw");
      }
    }
    if (s.includes('eO={FW:["MF"],MF:["FW","DF"],DF:["MF"],GK:[]},rg=["GK","DF","MF","FW"]')) {
      s = s.replace(
        'eO={FW:["MF"],MF:["FW","DF"],DF:["MF"],GK:[]},rg=["GK","DF","MF","FW"]',
        eONew
      );
      console.log("replaced eO/rg");
    }
    s = apply(
      s,
      [
        ['["GK","DF","MF","FW"]', POS9],
        ["['GK','DF','MF','FW']", POS9],
        ['pos==="GK"', 'pos==="P"'],
        ['pos==="DF"', 'pos==="C"'],
        ['pos==="MF"', 'pos==="SS"'],
        ['pos==="FW"', 'pos==="RF"'],
        ['==="GK"', '==="P"'],
        ['==="DF"', '==="C"'],
        ['==="MF"', '==="SS"'],
        ['==="FW"', '==="RF"'],
        ['!=="GK"', '!=="P"'],
        ['!=="DF"', '!=="C"'],
        ['!=="MF"', '!=="SS"'],
        ['!=="FW"', '!=="RF"'],
        ['"GK"', '"P"'],
        ['"DF"', '"C"'],
        ['"MF"', '"SS"'],
        ['"FW"', '"RF"'],
        ['==="gk"', '==="pit"'],
        ['!=="gk"', '!=="pit"'],
        ['==="sho"', '==="bat"'],
        ['==="pas"', '==="fld"'],
        ['==="dri"', '==="bat"'],
        ['==="def"', '==="fld"'],
        ['==="pac"', '==="spd"'],
        ['"gk"', '"pit"'],
        ['"sho"', '"bat"'],
        ['"pas"', '"fld"'],
        ['"dri"', '"bat"'],
        ['"def"', '"fld"'],
        ['"pac"', '"spd"'],
        [".gk", ".pit"],
        [".sho", ".bat"],
        ["n.gk", "n.pit"],
        ["n.sho", "n.bat"],
        ['["gk","phy","pas"]', '["pit","phy","fld"]'],
        ['["pac","sho","pas","dri","def","phy"]', '["spd","bat","fld","phy"]'],
        [
          "st:{apps:0,goals:0,ast:0,rSum:0,capps:0,cgoals:0}",
          "st:{apps:0,h:0,rbi:0,rSum:0,capps:0,ch:0}",
        ],
        ["st.goals", "st.h"],
        ["st.ast", "st.rbi"],
        ["st.cgoals", "st.ch"],
        ['e==="goals"', 'e==="h"'],
        ['e==="ast"', 'e==="rbi"'],
        ["l.goals", "l.h"],
        ["l.ast", "l.rbi"],
        ["M.st.goals", "M.st.h"],
        ["M.st.ast", "M.st.rbi"],
      ],
      "core remaps"
    );
  }

  if (!s.includes("function callupAssertBaseball")) {
    s = s.replace(
      "function offlineCheat",
      `function callupAssertBaseball(game){var a=game&&game.agency,ps=game&&game.players||{},ok={P:1,C:1,"1B":1,"2B":1,"3B":1,SS:1,LF:1,CF:1,RF:1},k,p;if(!a)return;for(k in ps){p=ps[k];if(p&&p.pos&&!ok[p.pos])throw new Error("콜업 야구 세이브만 지원합니다. 새 게임을 시작하세요.");}a.callupBaseball1=true;}function offlineCheat`
    );
    console.log("injected callupAssertBaseball");
  }

  // Secondary UI maps Z8/Q8/B8
  {
    const z8old = `Z8={pac:["가속력","최고 속도","민첩성"],sho:["결정력","슈팅 파워","중거리"],pas:["짧은 패스","롱 패스","시야"],dri:["볼 컨트롤","드리블","밸런스"],def:["태클","대인 마크","가로채기"],phy:["몸싸움","체력","점프"]},Q8=["다이빙","핸들링","반응 속도","위치 선정","킥"],B8={pac:"스피드",sho:"슈팅",pas:"패스",dri:"드리블",def:"수비",phy:"피지컬",gk:"투구"}`;
    const z8new = `Z8={spd:["스타트","전력질주","베이스런"],bat:["컨택","파워","선구"],pit:["구속","제구","변화"],fld:["포구","송구","수비범위"],phy:["몸싸움","체력","근력"]},Q8=["구위","제구","변화구","수비","스태미나"],B8={spd:"주력",bat:"타격",pit:"투구",fld:"수비",phy:"피지컬"}`;
    if (s.includes(z8old)) {
      s = s.replace(z8old, z8new);
      console.log("replaced Z8/Q8/B8");
    } else if (s.includes("B8={pac:")) {
      s = s.replace(
        `B8={pac:"스피드",sho:"슈팅",pas:"패스",dri:"드리블",def:"수비",phy:"피지컬",gk:"투구"}`,
        `B8={spd:"주력",bat:"타격",pit:"투구",fld:"수비",phy:"피지컬"}`
      );
      console.log("replaced B8 soft");
    }
  }

  // Story/event stat bumps
  s = apply(
    s,
    [
      ["stat:{gk:", "stat:{pit:"],
      ["stat:{sho:", "stat:{bat:"],
      ["stat:{pas:", "stat:{fld:"],
      ["stat:{dri:", "stat:{bat:"],
      ["stat:{def:", "stat:{fld:"],
      ["stat:{pac:", "stat:{spd:"],
      ["{gk:1}", "{pit:1}"],
      ["{gk:-1}", "{pit:-1}"],
    ],
    "event stats"
  );

  // Training nh recipes → baseball Yw keys
  {
    const nh0 = s.indexOf("nh={");
    const nh1 = s.indexOf("},Q8=") >= 0 ? -1 : s.indexOf("};", s.indexOf("nh={"));
    // replace known soccer drill names inside nh block only
    if (nh0 >= 0) {
      const end = s.indexOf("},Q8=", nh0);
      // Q8 comes after Z8 which is before nh? Actually order is Yw, nh, ... Z8
      const end2 = s.indexOf("},Z8=", nh0);
      const end3 = s.indexOf("const Ci=", nh0);
      let stop = end2 > 0 ? end2 : end3;
      if (stop > nh0) {
        let block = s.slice(nh0, stop);
        const drills = [
          ["볼컨트롤", "컨택"],
          ["짧은패스", "송구"],
          ["민첩성", "베이스런"],
          ["시야", "선구"],
          ["가속력", "스타트"],
          ["최고속도", "전력질주"],
          ["결정력", "파워"],
          ["중거리", "선구"],
          ["가로채기", "포구"],
          ["태클", "수비범위"],
          ["대인마크", "포구"],
          ["밸런스", "근력"],
          ["드리블", "컨택"],
          ["슈팅파워", "파워"],
          ["롱패스", "송구"],
          ["점프", "근력"],
        ];
        for (const [a, b] of drills) block = block.split(a).join(b);
        s = s.slice(0, nh0) + block + s.slice(stop);
        console.log("patched nh drills");
      }
    }
  }

  // B1 assert: baseball allowlist (no soccer pos literals for checker)
  s = s.replace(
    /function callupAssertBaseball\(game\)\{[^]*?\}function offlineCheat/,
    `function callupAssertBaseball(game){var a=game&&game.agency,ps=game&&game.players||{},ok={P:1,C:1,"1B":1,"2B":1,"3B":1,SS:1,LF:1,CF:1,RF:1},k,p;if(!a)return;for(k in ps){p=ps[k];if(p&&p.pos&&!ok[p.pos])throw new Error("콜업 야구 세이브만 지원합니다. 새 게임을 시작하세요.");}a.callupBaseball1=true;}function offlineCheat`
  );

  // Wire into KI load
  if (s.includes("return PE(l),j9(l),_I(l),l}") && !s.includes("callupAssertBaseball(l)")) {
    s = s.replace(
      "return PE(l),j9(l),_I(l),l}",
      "return PE(l),j9(l),_I(l),callupAssertBaseball(l),l}"
    );
    console.log("wired callupAssertBaseball into KI");
  }

  // Fix accidental double-maps if any Ss left with GK
  if (s.includes("Ss={GK") || s.includes('u2=["pac"')) {
    console.error("engine still has soccer core maps");
    process.exit(2);
  }

  write(file, s);
  console.log("wrote engine");
}

function patchShell(file) {
  if (!fs.existsSync(file)) return;
  let s = read(file);
  s = apply(
    s,
    [
      ['["GK","DF","MF","FW"]', POS9],
      ['pos==="GK"', 'pos==="P"'],
      ['pos==="DF"', 'pos==="C"'],
      ['pos==="MF"', 'pos==="SS"'],
      ['pos==="FW"', 'pos==="RF"'],
      ['"GK"', '"P"'],
      ['"DF"', '"C"'],
      ['"MF"', '"SS"'],
      ['"FW"', '"RF"'],
      ["골키퍼", "투수"],
      ["미드필더", "내야수"],
      ["수비수", "포수"],
      ["공격수", "외야수"],
      ["햇살 에이전시", "콜업 에이전시"],
      // B1: stamp marker when starting new game
      [
        "agencyName:j.trim()||n(\"콜업 에이전시\")",
        "agencyName:j.trim()||n(\"콜업 에이전시\"),callupBaseball1:!0",
      ],
      [
        "agencyName:j.trim()||n(\"햇살 에이전시\")",
        "agencyName:j.trim()||n(\"콜업 에이전시\"),callupBaseball1:!0",
      ],
    ],
    "shell"
  );

  // If new game payload is object literal, ensure marker field
  if (!s.includes("callupBaseball1:!0") && s.includes("agencyName:")) {
    s = s.replace(
      /nat:g,agencyName:j\.trim\(\)\|\|n\("콜업 에이전시"\),logo:_/,
      'nat:g,agencyName:j.trim()||n("콜업 에이전시"),callupBaseball1:!0,logo:_'
    );
    console.log("shell new-game stamp attempt");
  }

  // Load guard in shell when reading save — soft toast via existing error path
  if (!s.includes("callupRejectSoccerSave") && s.includes("offlineParseSave")) {
    // leave engine to stamp; shell shows toast on throw
  }

  write(file, s);
}

function patchUi(file) {
  if (!fs.existsSync(file)) return;
  let s = read(file);
  s = apply(
    s,
    [
      ["슈팅", "타격"],
      ["패스", "송구"],
      ["드리블", "주루"],
      ["골키퍼", "투수"],
      ["미드필더", "내야수"],
      ["수비수", "포수"],
      ["공격수", "외야수"],
      ["해트트릭", "멀티히트"],
      ["득점왕", "타점왕"],
    ],
    path.basename(file)
  );
  write(file, s);
}

const engine = path.join(assets, "engine-DhPc-c_J.js");
patchEngine(engine);
patchShell(path.join(assets, "shell-DaKdX7f1.js"));
for (const f of ["ui-DSX53OnJ.js", "ui-DgYnPcSw.js", "i18n-D-FAABCZ.js"]) {
  patchUi(path.join(assets, f));
}

console.log("patch-baseball-sim done", map.positions.join(","));
