#!/usr/bin/env node
/**
 * Safe CallUp fork patch: branding + visual + display labels.
 * Does NOT rewrite engine position codes (GK/DF/…) — that broke world-gen.
 * Usage: node patch-callup.cjs <apk-src-root>
 */
const fs = require("node:fs");
const path = require("node:path");

const root = process.argv[2];
if (!root) {
  console.error("Usage: node patch-callup.cjs <apk-src-root>");
  process.exit(1);
}

const publicDir = path.join(root, "assets", "public");
const assetsDir = path.join(publicDir, "assets");
const read = (p) => fs.readFileSync(p, "utf8");
const write = (p, s) => fs.writeFileSync(p, s, "utf8");
const replaceAll = (s, a, b) => s.split(a).join(b);

// --- index.html ---
{
  const htmlPath = path.join(publicDir, "index.html");
  let html = read(htmlPath);
  html = replaceAll(html, 'style="background:#141516"', 'style="background:#0A1628"');
  html = replaceAll(html, "선수를 찾고, 키우고, 파는 축구 에이전트 게임", "선수를 발굴하고 구단과 협상하는 야구 에이전시 게임");
  html = replaceAll(html, 'content="사인히어"', 'content="콜업"');
  html = replaceAll(html, "<title>사인히어: 풋볼 에이전시</title>", "<title>콜업: 야구 에이전시</title>");
  html = replaceAll(html, 'content="#141516"', 'content="#0A1628"');
  // cheats.css kept for personal builds; enable-cheats.js wires it after this patch
  if (!html.includes("callup-theme.css")) {
    html = html.replace("</head>", '    <link rel="stylesheet" href="./callup-theme.css" />\n  </head>');
  }
  write(htmlPath, html);
  console.log("patched index.html");
}

write(path.join(publicDir, "callup-theme.css"), read(path.join(__dirname, "callup-theme.css")));
console.log("wrote callup-theme.css");

// --- shell CSS palette ---
{
  const cssPath = path.join(assetsDir, "shell-DGv3wu-g.css");
  let css = read(cssPath);
  const oldRoot =
    "--bg: #141516;--bg2: #101112;--panel: #1C1E20;--panel2: #222528;--panel3: #2A2D30;--line: #26292C;--line2: #33373B;--ink: #E8E1CF;--body: #C2C5C7;--sub: #8A8F93;--dim: #5E6468;--accent: #C5F23C;--accent-ink: #121A03;--accent-soft: rgba(197, 242, 60, .12);--accent-line: rgba(197, 242, 60, .45);--accent-hi: #E2FB8A;--accent-lo: #9CCB1A;";
  const newRoot =
    "--bg: #0A1628;--bg2: #07101C;--panel: #132338;--panel2: #1A3148;--panel3: #243F5A;--line: #2A455F;--line2: #3A5A78;--ink: #F4F1E8;--body: #C9D0D6;--sub: #8A9AAB;--dim: #5E7388;--accent: #F0C75E;--accent-ink: #1A1400;--accent-soft: rgba(240, 199, 94, .14);--accent-line: rgba(240, 199, 94, .45);--accent-hi: #FFE08A;--accent-lo: #C9922E;";
  if (css.includes(oldRoot)) css = css.replace(oldRoot, newRoot);
  else if (
    !css.includes("--bg: #0A1628") &&
    !css.includes("--bg: #F2F5EF") &&
    !css.includes("--bg: #12151A")
  ) {
    throw new Error("shell CSS :root block missing");
  }
  // Phase UI dark amber already applied — skip navy remap of accent greens
  if (css.includes("--bg: #12151A")) {
    write(cssPath, css);
    console.log("shell CSS already CallUp dark amber");
  } else {
  css = replaceAll(css, "rgba(197, 242, 60,", "rgba(240, 199, 94,");
  css = replaceAll(css, "#C5F23C", "#F0C75E");
  css = replaceAll(css, "#E2FB8A", "#FFE08A");
  css = replaceAll(css, "#9CCB1A", "#C9922E");
  css = replaceAll(css, "#121A03", "#1A1400");
  css = replaceAll(css, "--good: #C5F23C", "--good: #B8E986");
  css = replaceAll(css, "--tag-good: #D6F57A", "--tag-good: #B8E986");
  css = replaceAll(css, "--zebra: #17191B", "--zebra: #0D1C2E");
  css = replaceAll(css, "font-family:Damion,cursive", "font-family:var(--f-num)");
  css = replaceAll(css, 'font-family:"Bebas Neue",var(--f-num)', "font-family:var(--f-num)");
  css = replaceAll(css, "font-family:Bebas Neue", "font-family:var(--f-num)");
  css = replaceAll(css, "font-family:Damion", "font-family:var(--f-num)");
  css = replaceAll(css, "--paper: #F4EFE2", "--paper: #FFFCF5");
  css = replaceAll(css, "#141516", "#0A1628");
  write(cssPath, css);
  console.log("patched shell CSS");
  }
}

/** Branding + title — safe everywhere */
const brandPairs = [
  ["사인히어: 풋볼 에이전시", "콜업: 야구 에이전시"],
  ["풋볼 에이전시", "야구 에이전시"],
  ["축구 에이전트", "야구 에이전트"],
  ["축구 에이전시", "야구 에이전시"],
  ["사인히어", "콜업"],
  ["Sign Here: Football Agent", "Call Up: Baseball Agency"],
  ["Sign Here: Football Agency", "Call Up: Baseball Agency"],
  ["Sign Here: Baseball Agency", "Call Up: Baseball Agency"],
  ["콜업 Sign Here", "콜업"],
  ["SignHere", "CallUp"],
  ["signhere", "callup"],
  ['children:"Sign here"', 'children:"Call Up"'],
  ['children:"Sign Here"', 'children:"Call Up"'],
  ['children:"SIGN HERE"', 'children:"CALL UP"'],
  ['children:"FOOTBALL AGENCY"', 'children:"BASEBALL AGENCY"'],
  ["SIGN HERE ★ FOOTBALL AGENCY ★ OFFICIAL ★", "CALL UP ★ BASEBALL AGENCY ★ OFFICIAL ★"],
  ["SIGN HERE", "CALL UP"],
  ["Sign Here", "Call Up"],
  ['k02lka:"Sign here"', 'k02lka:"Call Up"'],
  ['"1dpf4g9":"Sign here"', '"1dpf4g9":"Call Up"'],
  ['"Sign Here Save"', '"Call Up Save"'],
  ["football agent game", "baseball agency game"],
  ["Football Agent", "Baseball Agency"],
  ["FOOTBALL AGENCY", "BASEBALL AGENCY"],
  ["Football Agency", "Baseball Agency"],
  ["football agency", "baseball agency"],
  ["#141516", "#0A1628"],
  ["#C5F23C", "#F0C75E"],
  ["햇살 에이전시", "콜업 에이전시"],
  ["Sunshine Agency", "Call Up Agency"],
  ["Ag. Sunshine", "Ag. Call Up"],
];

/** Display-only Korean sport terms — UI/shell/i18n, NOT engine core sim keys */
const labelPairs = [
  ["골키퍼", "투수"],
  ["미드필더", "외야수"],
  ["공격수", "타자"],
  ["수비수", "내야수"],
  ["골키핑", "투구"],
  ["어시스트", "타점"],
  ["이적시장", "영입시장"],
  ["이적료", "계약금"],
  ["해트트릭을 기록했어요", "한 경기 맹타를 휘둘렀어요"],
  ["해트트릭!", "멀티히트!"],
  ["매치볼을 품에 안고 퇴근했어요", "경기 MVP 트로피를 안고 퇴근했어요"],
  ["골 폭발", "안타 폭발"],
  ["공이 발에 붙었대요", "방망이에 공이 붙었대요"],
  ["축구", "야구"],
  ["풋볼", "야구"],
  ['Oc=["불꽃","여우","햇살","클로버","북극성","인장"]', 'Oc=["다이아","글러브","홈런","마운드","파울","콜업"]'],
  [
    '불꽃:"Blaze",여우:"Fox",햇살:"Sunshine",클로버:"Clover",북극성:"Polaris",인장:"Seal"',
    '다이아:"Diamond",글러브:"Glove",홈런:"Homer",마운드:"Mound",파울:"Foul",콜업:"CallUp"',
  ],
];

/** League display names (engine + names) */
const leaguePairs = [
  ["잉글랜드 1부 리그", "한국 1군"],
  ["잉글랜드 2부 리그", "한국 2군"],
  ["잉글랜드 3부 리그", "한국 독립리그"],
  ["스페인 1부 리그", "일본 1군"],
  ["스페인 2부 리그", "일본 2군"],
  ["독일 1부 리그", "대만 1군"],
  ["독일 2부 리그", "대만 2군"],
  ["이탈리아 1부 리그", "미국 메이저"],
  ["이탈리아 2부 리그", "미국 마이너"],
  ["프랑스 1부 리그", "한국 아마추어"],
  ["프랑스 2부 리그", "일본 아마추어"],
];

function applyPairs(s, pairs) {
  for (const [a, b] of pairs) s = replaceAll(s, a, b);
  return s;
}

function patchFile(name, pairs) {
  const p = path.join(assetsDir, name);
  if (!fs.existsSync(p)) {
    console.warn("skip", name);
    return;
  }
  const before = read(p);
  const after = applyPairs(before, pairs);
  if (after !== before) {
    write(p, after);
    console.log("patched", name);
  } else console.log("unchanged", name);
}

// Branding on all major bundles including engine (names only, no code IDs)
const allJs = fs.readdirSync(assetsDir).filter((f) => f.endsWith(".js"));
for (const name of allJs) patchFile(name, brandPairs);

// Labels + leagues: UI/shell/names/index/ceremony — and engine for display strings only
const labelTargets = [
  "shell-DaKdX7f1.js",
  "ui-DSX53OnJ.js",
  "ui-DgYnPcSw.js",
  "index-B5T0JNgO.js",
  "i18n-D-FAABCZ.js",
  "names-CdWzr2Fb.js",
  "names-DvEudt3S.js",
  "Ceremony-CAFGx9I2.js",
  "yearSay-CxPvW4Nr.js",
  "Year-BBjDZ4ft.js",
  "Auction-Ig9vAomU.js",
  "Deadline-DD5y1sRo.js",
  "disk-ClprvGM1.js",
  "engine-DhPc-c_J.js",
];
for (const name of labelTargets) {
  patchFile(name, [...labelPairs, ...leaguePairs]);
}

// Position display map only (keep GK/DF/MF/FW codes)
{
  const p = path.join(assetsDir, "engine-DhPc-c_J.js");
  let s = read(p);
  const from = 'Ss={GK:"투수",DF:"내야수",MF:"외야수",FW:"타자"}';
  // after labelPairs, 골키퍼 already → 투수 etc.
  const alt = 'Ss={GK:"골키퍼",DF:"수비수",MF:"미드필더",FW:"공격수"}';
  if (s.includes(alt)) {
    s = s.replace(alt, 'Ss={GK:"투수",DF:"내야수",MF:"외야수",FW:"타자"}');
    write(p, s);
    console.log("patched Ss position labels");
  } else if (s.includes('Ss={GK:"투수"')) {
    console.log("Ss labels already baseball");
  } else {
    console.warn("Ss map not found in expected form");
  }
}

for (const f of ["privacy.html", "terms.html"]) {
  const p = path.join(publicDir, f);
  if (!fs.existsSync(p)) continue;
  let s = read(p);
  s = applyPairs(s, brandPairs.concat(labelPairs));
  write(p, s);
  console.log("patched", f);
}

console.log("patch-callup done (safe mode)");
