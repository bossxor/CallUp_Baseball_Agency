/**
 * Offline Phase B leftovers: strict B1, shell record keys, soccer copy → baseball.
 */
const fs = require("fs");
const path = require("path");
const assets = path.join(__dirname, "..", "apk-src", "assets", "public", "assets");

function rep(s, pairs, label) {
  let n = 0;
  for (const [a, b] of pairs) {
    if (!s.includes(a)) continue;
    const c = s.split(a).length - 1;
    s = s.split(a).join(b);
    n += c;
    console.log(label, c, a.slice(0, 48).replace(/\n/g, " "));
  }
  return { s, n };
}

// --- engine B1 ---
{
  const p = path.join(assets, "engine-DhPc-c_J.js");
  let s = fs.readFileSync(p, "utf8");
  const oldAssert =
    /function callupAssertBaseball\(game\)\{[^]*?\}function offlineCheat/;
  const neu =
    `function callupAssertBaseball(game){var a=game&&game.agency,ps=game&&game.players||{},ok={P:1,C:1,"1B":1,"2B":1,"3B":1,SS:1,LF:1,CF:1,RF:1},k,p,n=0;if(!a)return;for(k in ps){p=ps[k];if(!p)continue;n++;if(p.pos&&!ok[p.pos])throw new Error("콜업 야구 세이브만 지원합니다. 새 게임을 시작하세요.");}if(a.callupBaseball1!==true&&a.callupBaseball1!==1){if(n>0)throw new Error("콜업 야구 세이브만 지원합니다. 새 게임을 시작하세요.");a.callupBaseball1=true;}}function offlineCheat`;
  if (!oldAssert.test(s)) console.error("ASSERT MISS");
  else {
    s = s.replace(oldAssert, neu);
    console.log("B1 assert strict");
  }
  const engPairs = [
    ['label:a("해트트릭")', 'label:a("멀티히트")'],
    ['a("한 경기 3골 {n}번"', 'a("한 경기 3안타 {n}번"'],
    ['{n:"해트트릭 장인"', '{n:"멀티히트 장인"'],
    ['"{s} {l} 득점왕 ({n}골)"', '"{s} {l} 타점왕 ({n}타점)"'],
    [
      "해트트릭|멀티골|두 골|세 골|득점왕|골 가뭄|연속 골|연속골",
      "멀티히트|멀티안타|두 안타|세 안타|타점왕|안타 가뭄|연속 안타|연속안타",
    ],
    ["자기 자신을 골라 해트트릭을 했어요", "자기 자신을 골라 멀티히트를 했어요"],
    ["해트트릭 냄새가 나요", "안타 냄새가 나요"],
    ["해트트릭", "멀티히트"],
    ["득점왕", "타점왕"],
  ];
  const r0 = rep(s, engPairs, "eng");
  s = r0.s;
  fs.writeFileSync(p, s);
}

// --- shell records + copy ---
{
  const p = path.join(assets, "shell-DaKdX7f1.js");
  let s = fs.readFileSync(p, "utf8");
  const pairs = [
    [
      "s.career.reduce((i,o)=>i+o.goals,0)+s.st.goals",
      "s.career.reduce((i,o)=>i+(o.h||o.goals||0),0)+((s.st.h||s.st.goals)||0)",
    ],
    [
      "s.career.reduce((i,o)=>i+o.ast,0)+s.st.ast",
      "s.career.reduce((i,o)=>i+(o.rbi||o.ast||0),0)+((s.st.rbi||s.st.ast)||0)",
    ],
    ["ye.st.goals", "ye.st.h"],
    ["ye.st.ast", "ye.st.rbi"],
    ["w.st.goals", "w.st.h"],
    ["o.st.goals", "o.st.h"],
    ["o.goals,0)+o.st.goals", "o.h||0,0)+(o.st.h||0)"],
    [
      'n("{a}경기 {g}골 {s}도움, 평점 {r}"',
      'n("{a}경기 {g}안타 {s}타점, 평점 {r}"',
    ],
    ['n("해트트릭 봤죠?")', 'n("멀티히트 봤죠?")'],
    ['n("매치볼 챙겼어요!")', 'n("끝내기 안타!")'],
    ["해트트릭 냄새가 나요", "안타 냄새가 나요"],
    ['.endsWith("득점왕")', '.endsWith("타점왕")'],
    ['.endsWith("도움왕")', '.endsWith("안타왕")'],
    // career row goals field reads
    ["o.goals,0)+o.st.goals", "(o.h||o.goals||0),0)+(o.st.h||o.st.goals||0)"],
  ];
  const r = rep(s, pairs, "shell");
  fs.writeFileSync(p, r.s);
}

// --- ui EN leftovers ---
for (const f of ["ui-DgYnPcSw.js", "ui-DSX53OnJ.js"]) {
  const p = path.join(assets, f);
  if (!fs.existsSync(p)) continue;
  let s = fs.readFileSync(p, "utf8");
  const pairs = [
    ['"매치볼 챙겼어요!":"Got the ball!"', '"끝내기 안타!":"Walk-off hit!"'],
    ['"Hat-trick!"', '"Multi-hit!"'],
    ['"Football finally makes sense,"', '"Baseball finally makes sense,"'],
    ['"Football\'s governing body', '"Baseball\'s governing body'],
    ['"Football first.', '"Baseball first.'],
    ['"Football is fun!"', '"Baseball is fun!"'],
    ['"Football isn\'t fun like before."', '"Baseball isn\'t fun like before."'],
    ["The Lab-Grown Footballer", "The Lab-Grown Ballplayer"],
    ["매치볼 챙겼어요!", "끝내기 안타!"],
  ];
  const r = rep(s, pairs, f);
  fs.writeFileSync(p, r.s);
}

// --- names / year ---
for (const f of fs.readdirSync(assets)) {
  if (!f.endsWith(".js")) continue;
  const p = path.join(assets, f);
  let s = fs.readFileSync(p, "utf8");
  if (!s.includes("해트트릭") && !s.includes("득점왕") && !s.includes("Football")) continue;
  const pairs = [
    ['"해트트릭 장인"', '"멀티히트 장인"'],
    ["해트트릭 장인", "멀티히트 장인"],
    ["해트트릭", "멀티히트"],
    ["득점왕", "타점왕"],
  ];
  const before = s;
  const r = rep(s, pairs, f);
  if (r.s !== before) fs.writeFileSync(p, r.s);
}

// sync assert into patch-baseball-sim template
console.log("fix-phase-b-offline done");
