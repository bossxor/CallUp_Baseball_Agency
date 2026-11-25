/**
 * Replace soccer club wc map + league club lists with 4-market baseball city aliases.
 * Collapse y0 nationality table to 한국/일본/대만/미국 (+ 대한민국 alias).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dataPath = path.join(root, "data", "callup-clubs.json");
const assetsDir = path.join(root, "apk-src", "assets", "public", "assets");
const engPath = path.join(assetsDir, "engine-DhPc-c_J.js");
const shellPath = path.join(assetsDir, "shell-DaKdX7f1.js");
const namesGlob = "names-DvEudt3S.js";

const MARKETS = ["KR", "JP", "TW", "US"];
const MARKET_COUNTRY = {
  KR: "한국",
  JP: "일본",
  TW: "대만",
  US: "미국",
};
const PREFIX_MARKET = {
  ENG: "KR",
  ESP: "JP",
  GER: "TW",
  ITA: "US",
  FRA: "KR",
  KOR: "KR",
  JPN: "JP",
  USA: "US",
  TWN: "TW",
  MEX: "US",
  CAN: "US",
};
const ROTATE = ["한국", "일본", "대만", "미국"];

function loadClubs() {
  const j = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const byMarket = {};
  const ordered = [];
  for (const m of MARKETS) {
    byMarket[m] = j.markets[m].clubs.slice();
    ordered.push(...byMarket[m]);
  }
  return { byMarket, ordered, raw: j };
}

function extractBraceBlock(text, openIdx) {
  const brace = text.indexOf("{", openIdx);
  if (brace < 0) return null;
  let depth = 0;
  for (let i = brace; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) return { start: brace, end: i + 1, text: text.slice(brace, i + 1) };
    }
  }
  return null;
}

function parseWcPairs(block) {
  const inner = block.slice(1, -1);
  const pairs = [];
  const re = /(?:"([^"]+)"|([^:,{}]+)):("([^"]+)"|([^,{}]+))/g;
  let m;
  while ((m = re.exec(inner))) {
    const k = (m[1] || m[2]).trim();
    const v = (m[3].startsWith('"') ? m[4] : m[5]).trim();
    if (k) pairs.push([k, v]);
  }
  return pairs;
}

function escKey(k) {
  return /[,\s]/.test(k) ? `"${k}"` : k;
}

function buildWc(pairs, ordered) {
  const next = pairs.map((_, i) => {
    const city = ordered[i % ordered.length];
    return [city, city];
  });
  const body = next.map(([k, v]) => `${escKey(k)}:"${v}"`).join(",");
  return `const wc={${body}}`;
}

function marketForLeague(id) {
  const prefix = id.replace(/\d+$/, "");
  if (PREFIX_MARKET[prefix]) return PREFIX_MARKET[prefix];
  let h = 0;
  for (const c of prefix) h = (h + c.charCodeAt(0)) % ROTATE.length;
  return ["KR", "JP", "TW", "US"][h];
}

function contForCountry(country) {
  return country === "미국" ? "NA" : "AS";
}

let _clubsJson;
function clubsJson() {
  if (!_clubsJson) _clubsJson = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  return _clubsJson;
}

function tierLabel(market, tierNum) {
  const formal = {
    KR: ["KBO", "KBO 퓨처스"],
    JP: ["NPB", "NPB 2군"],
    TW: ["CPBL", "CPBL"],
    US: ["MLB", "MiLB"],
  };
  const pair = formal[market];
  if (pair) return tierNum <= 1 ? pair[0] : pair[1];
  const m = clubsJson().markets[market];
  const label = m.label;
  const tiers = m.tiers;
  if (tierNum <= 1) return `${label} ${tiers[0]}`;
  return `${label} ${tiers[1] || tiers[0]}`;
}

const FOUR_MARKET_LABEL =
  /^(?:KBO(?: 퓨처스)?|NPB(?: 2군)?|CPBL|MLB|MiLB|(한국|일본|대만|미국) (1군|2군|메이저|마이너))$/;

const EU_NAME =
  /잉글란드|스페인|독일|이탈리아|네덜란드|벨기에|포르투갈|프랑스|오스트리아|스코틀랜드|튀르키예|클리블랜드갈/;

const XW_KEY_MARKET = {
  프리미어리그: "KR",
  챔피언십: "KR",
  "리그 원": "KR",
  "리그 1": "KR",
  라리가: "JP",
  "세군다 디비시온": "JP",
  "리그 2": "JP",
  분데스리가: "TW",
  "2. 분데스리가": "TW",
  "3. 리가": "TW",
  "세리에 A": "US",
  "세리에 B": "US",
};

function marketForXwKey(key, val, idx) {
  if (XW_KEY_MARKET[key]) return XW_KEY_MARKET[key];
  if (/^한국|^대한민국/.test(val)) return "KR";
  if (/^일본/.test(val)) return "JP";
  if (/^대만/.test(val)) return "TW";
  if (/^미국/.test(val)) return "US";
  return MARKETS[idx % MARKETS.length];
}

function inferXwTier(key, val) {
  const s = `${key} ${val}`;
  if (/3부|3\.\s*리가|^3\.|3부/.test(s)) return 3;
  if (/2부|2\.\s*|2군|마이너|챔피언십|세리에 B|세군다|2부/.test(s)) return 2;
  return 1;
}

function needsXwPatch(pairs) {
  return pairs.some(([k, v]) => !FOUR_MARKET_LABEL.test(v) || EU_NAME.test(v) || /부 리그|독립리그/.test(v));
}

function patchXw(text) {
  const idx = text.indexOf("const xw=");
  if (idx < 0) return { text, n: 0 };
  const block = extractBraceBlock(text, idx + "const xw=".length - 1);
  if (!block) return { text, n: 0 };
  const pairs = parseWcPairs(block.text);
  if (!needsXwPatch(pairs)) return { text, n: 0 };
  let n = 0;
  const next = pairs.map(([k, v], i) => {
    const mk = marketForXwKey(k, v, i);
    const neu = tierLabel(mk, inferXwTier(k, v));
    if (neu !== v) n++;
    return [k, neu];
  });
  const body = next.map(([k, v]) => `${escKey(k)}:"${v}"`).join(",");
  const neu = `const xw={${body}}`;
  const out = text.slice(0, idx) + neu + text.slice(block.end);
  return { text: out, n };
}

const BW_KEY_MARKET = {
  잉글랜드: "한국",
  스코틀랜드: "한국",
  네덜란드: "한국",
  스페인: "일본",
  벨기에: "일본",
  튀르키예: "일본",
  독일: "대만",
  프화련: "대만",
  프랑스: "대만",
  이탈리아: "미국",
  클리블랜드갈: "미국",
  포르투갈: "미국",
  브라질: "미국",
  아르헨티나: "미국",
  우루과이: "미국",
  멕시코: "미국",
  사우디아라비아: "일본",
};

const BW_KEEP = new Set(["한국", "일본", "대만", "미국", "대한민국"]);

function parseBwPairs(block) {
  const inner = block.slice(1, -1);
  const pairs = [];
  const re = /([^:,{}]+):\[([^\]]+)\]/g;
  let m;
  while ((m = re.exec(inner))) {
    pairs.push([m[1].trim(), m[2].trim()]);
  }
  return pairs;
}

function mergeBwArr(a, b) {
  const av = a.split(",").map(Number);
  const bv = b.split(",").map(Number);
  const len = Math.max(av.length, bv.length);
  const out = [];
  for (let i = 0; i < len; i++) out.push(Math.max(av[i] ?? 0, bv[i] ?? 0));
  return out.join(",");
}

function needsBwPatch(pairs) {
  return pairs.some(([k]) => !BW_KEEP.has(k) || EU_NAME.test(k));
}

function patchBw(text) {
  const idx = text.indexOf("Bw={");
  if (idx < 0) return { text, n: 0 };
  const block = extractBraceBlock(text, idx + 2);
  if (!block) return { text, n: 0 };
  const pairs = parseBwPairs(block.text);
  if (!needsBwPatch(pairs)) return { text, n: 0 };
  const merged = new Map();
  let n = 0;
  for (const [rawKey, arr] of pairs) {
    const neuKey = BW_KEY_MARKET[rawKey] || rawKey;
    const target = BW_KEEP.has(neuKey) ? neuKey : ROTATE[pairs.findIndex(([k]) => k === rawKey) % 4];
    if (rawKey !== target) n++;
    if (merged.has(target)) merged.set(target, mergeBwArr(merged.get(target), arr));
    else merged.set(target, arr);
  }
  for (const k of ["한국", "일본", "대만", "미국", "대한민국"]) {
    if (!merged.has(k)) merged.set(k, "1,2,2,1,2,1,1,1");
  }
  const order = ["한국", "일본", "대만", "미국", "대한민국"];
  const body = order
    .filter((k) => merged.has(k))
    .map((k) => `${k}:[${merged.get(k)}]`)
    .join(",");
  const neu = `Bw={${body}}`;
  const out = text.slice(0, idx) + neu + text.slice(block.end);
  return { text: out, n };
}

const MK_COLLAPSED =
  "mk={대한민국:{한국:1,일본:.9,대만:.6,미국:.5},한국:{대한민국:1,일본:.85,대만:.6,미국:.5},일본:{한국:.85,대만:.7,미국:.6,일본:1},대만:{한국:.8,일본:.75,미국:.5,대만:1},미국:{한국:.4,일본:.4,대만:.35,미국:1}}";

function patchMk(text) {
  const idx = text.indexOf("mk={");
  if (idx < 0) return { text, n: 0 };
  if (text.slice(idx, idx + MK_COLLAPSED.length) === MK_COLLAPSED) return { text, n: 0 };
  const block = extractBraceBlock(text, idx + 2);
  if (!block) return { text, n: 0 };
  const out = text.slice(0, idx) + MK_COLLAPSED + text.slice(block.end);
  return { text: out, n: 1 };
}

function scrubLeagueLabels(s) {
  let n = 0;
  const bump = (a, b) => {
    const c = s.split(a).length - 1;
    if (!c) return;
    s = s.split(a).join(b);
    n += c;
  };
  bump("한국 독립리그", "한국 2군");
  bump("일본 독립리그", "일본 2군");
  bump("대만 독립리그", "대만 1군");
  bump("미국 독립리그", "미국 마이너");
  for (const [eu, mk] of Object.entries(BW_KEY_MARKET)) bump(eu, mk);
  bump("오스트리아", "대만");
  bump("스코틀랜드", "한국");
  bump("튀르키예", "일본");
  bump("덴마크", "한국");
  bump("노르웨이", "한국");
  bump("스위스", "대만");
  bump("클리블랜드갈", "미국");
  const tiers = [
    [/한국 1부 리그/g, "한국 1군"],
    [/한국 2부 리그/g, "한국 2군"],
    [/한국 3부 리그/g, "한국 2군"],
    [/일본 1부 리그/g, "일본 1군"],
    [/일본 2부 리그/g, "일본 2군"],
    [/일본 3부 리그/g, "일본 2군"],
    [/대만 1부 리그/g, "대만 1군"],
    [/대만 2부 리그/g, "대만 1군"],
    [/대만 3부 리그/g, "대만 1군"],
    [/미국 1부 리그/g, "미국 메이저"],
    [/미국 2부 리그/g, "미국 마이너"],
    [/미국 3부 리그/g, "미국 마이너"],
    [/대한민국 1부 리그/g, "한국 1군"],
    [/대한민국 2부 리그/g, "한국 2군"],
  ];
  for (const [re, repl] of tiers) {
    const before = s;
    s = s.replace(re, repl);
    if (s !== before) n++;
  }
  const before = s;
  s = s.replace(/([^\s"{}:,]{2,28}) ([123])부 리그/g, (full, country, tier) => {
    if (/^(한국|일본|대만|미국|1군|2군|메이저|마이너)$/.test(country)) return full;
    let mk = "KR";
    if (/한국|대한민국/.test(country)) mk = "KR";
    else if (/일본/.test(country)) mk = "JP";
    else if (/대만|중국|타이|홍콩/.test(country)) mk = "TW";
    else if (/미국|멕시코|캐나다|브라질|아르헨티나/.test(country)) mk = "US";
    else {
      let h = 0;
      for (const c of country) h = (h + c.charCodeAt(0)) % 4;
      mk = MARKETS[h];
    }
    return tierLabel(mk, +tier);
  });
  if (s !== before) n++;
  return { s, n };
}

function leaguesNeedPatch(text) {
  if (text.includes("독립리그")) return true;
  if (text.includes('N("ENG1"') && text.includes("맨시티,")) return true;
  return !text.includes('N("ENG1","한국 1군","한국"');
}

const Y0_COLLAPSED =
  // name pools must exist in names-*.js (no tw/us → cn/en)
  'y0={한국:{pools:["kr"],cont:"AS",w:5,t:1.15},일본:{pools:["jp"],cont:"AS",w:5,t:1.15},대만:{pools:["cn"],cont:"AS",w:3,t:1.05},미국:{pools:["en"],cont:"NA",w:4,t:1.1},대한민국:{pools:["kr"],cont:"AS",w:5,t:1.15}}';

const COPY_PAIRS = [
  ["한국 아마추어", "한국 2군"],
  ["일본 아마추어", "일본 2군"],
  ["주급", "연봉"],
  ["여름 영입시장", "하절기 영입창"],
  ["겨울 영입시장", "동절기 영입창"],
  ["여름 영입", "하절기 영입"],
  ["겨울 영입", "동절기 영입"],
  ["FIFA", "WBSC"],
  ["UEFA", "CPBL"],
  ["월드컵", "WBC"],
  ["fifa", "wbsc"],
  ["Fifa", "Wbsc"],
  ["리버풀", "부산"],
  ["바르셀로나", "오사카"],
  ["레알 마드리드", "대전"],
  ["아스널", "수원"],
  ["맨시티", "인천"],
  ["2부 리그 수준", "2군 수준"],
  ["1부 리그 임대", "1군 임대"],
  ['1부 리그에서', "1군에서"],
];

function applyPairs(s, pairs) {
  let n = 0;
  for (const [a, b] of pairs) {
    const c = s.split(a).length - 1;
    if (!c) continue;
    s = s.split(a).join(b);
    n += c;
  }
  return { s, n };
}

function patchLeagueRegistrations(text, byMarket) {
  const re =
    /N\("([^"]+)","([^"]+)","([^"]+)","([^"]+)",(\d+),(\d+),([\d.]+),([\d.]+),"([^"]*)","([^"]+)"(\,\{[^}]+\})?\)/g;
  let leagueN = 0;
  let clubN = 0;
  const out = text.replace(re, (full, id, _label, _country, _cont, tier, a6, a7, a8, a9, clubs, tail) => {
    const mk = marketForLeague(id);
    const country = MARKET_COUNTRY[mk];
    const cont = contForCountry(country);
    const label = tierLabel(mk, +tier);
    const pool = byMarket[mk];
    const list = clubs.split(",").filter(Boolean);
    const mapped = list.map((_, i) => pool[i % pool.length]);
    clubN += list.length;
    leagueN++;
    return `N("${id}","${label}","${country}","${cont}",${tier},${a6},${a7},${a8},"${a9}","${mapped.join(",")}"${tail || ""})`;
  });
  return { text: out, leagueN, clubN };
}

function patchNamesEn(ordered) {
  const p = path.join(assetsDir, namesGlob);
  if (!fs.existsSync(p)) {
    console.log("MISS names bundle", namesGlob);
    return 0;
  }
  const entries = ordered
    .map((city) => `${escKey(city)}:"${city} FC"`)
    .join(",");
  const neu = `const a={},e={${entries}};`;
  let s = fs.readFileSync(p, "utf8");
  const m = s.match(/^const a=\{},e=\{[\s\S]*?\};/);
  if (!m) {
    console.log("MISS names e= block");
    return 0;
  }
  if (m[0] === neu) return 0;
  s = s.slice(0, m.index) + neu + s.slice(m.index + m[0].length);
  fs.writeFileSync(p, s);
  return 1;
}

let stats = { wc: 0, y0: 0, xw: 0, bw: 0, mk: 0, leagues: 0, clubs: 0, copy: 0, keys: 0, scrub: 0 };

const { byMarket, ordered } = loadClubs();
let eng = fs.readFileSync(engPath, "utf8");

const wcIdx = eng.indexOf("const wc=");
if (wcIdx < 0) {
  console.error("MISS const wc=");
  process.exit(1);
}

const wcBlock = extractBraceBlock(eng, wcIdx + "const wc=".length - 1);
const oldPairs = parseWcPairs(wcBlock.text);
console.log("probe wc pairs", oldPairs.length);

const soccerProbe = ["맨시티", "레알 마드리드", "아스널"];
const needsWc = soccerProbe.some((k) => oldPairs.some(([ok]) => ok === k));

if (needsWc) {
  const neuWc = buildWc(oldPairs, ordered);
  eng = eng.slice(0, wcIdx) + neuWc + eng.slice(wcBlock.end);
  stats.wc = oldPairs.length;
  console.log("wc replaced", stats.wc);
} else {
  console.log("wc already baseball");
}

function isSafeClubToken(k) {
  if (!k || k.length < 4) return false;
  // Never global-replace short Latin codes (UTC→city ate Date.UTC; KR ate KRW).
  if (/^[A-Za-z0-9ÁÉÍÓÚáéíóúÍí]{1,4}$/.test(k)) return false;
  return true;
}

if (needsWc) {
  const keyMap = new Map();
  for (let i = 0; i < oldPairs.length; i++) {
    const city = ordered[i % ordered.length];
    const [ok, ov] = oldPairs[i];
    if (isSafeClubToken(ok)) keyMap.set(ok, city);
    if (isSafeClubToken(ov)) keyMap.set(ov, city);
  }
  const keysByLen = [...keyMap.keys()].sort((a, b) => b.length - a.length);
  for (const oldK of keysByLen) {
    const neu = keyMap.get(oldK);
    if (oldK === neu || !eng.includes(oldK)) continue;
    const c = eng.split(oldK).length - 1;
    eng = eng.split(oldK).join(neu);
    stats.keys += c;
  }
}

const xw = patchXw(eng);
eng = xw.text;
stats.xw = xw.n;
if (xw.n) console.log("xw labels remapped", xw.n);
else console.log("xw already 4-market");

const bw = patchBw(eng);
eng = bw.text;
stats.bw = bw.n;
if (bw.n) console.log("Bw countries collapsed", bw.n);
else console.log("Bw already 4-market");

const mk = patchMk(eng);
eng = mk.text;
stats.mk = mk.n;
if (mk.n) console.log("mk nationality table collapsed");
else console.log("mk already 4-market");

const y0Idx = eng.indexOf("y0={");
if (y0Idx >= 0) {
  const y0Block = extractBraceBlock(eng, y0Idx + 2);
  if (!eng.slice(y0Idx, y0Idx + Y0_COLLAPSED.length).startsWith(Y0_COLLAPSED)) {
    eng = eng.slice(0, y0Idx) + Y0_COLLAPSED + eng.slice(y0Block.end);
    stats.y0 = 1;
    console.log("y0 collapsed");
  } else console.log("y0 already collapsed");
}

if (leaguesNeedPatch(eng)) {
  const lg = patchLeagueRegistrations(eng, byMarket);
  eng = lg.text;
  stats.leagues = lg.leagueN;
  stats.clubs = lg.clubN;
  console.log("N() leagues", lg.leagueN, "club slots", lg.clubN);
} else {
  console.log("N() leagues already baseball");
}

const cp = applyPairs(eng, COPY_PAIRS);
eng = cp.s;
stats.copy += cp.n;

const scEng = scrubLeagueLabels(eng);
eng = scEng.s;
stats.scrub += scEng.n;

fs.writeFileSync(engPath, eng);

let shell = fs.readFileSync(shellPath, "utf8");
const cpSh = applyPairs(shell, COPY_PAIRS);
const scSh = scrubLeagueLabels(cpSh.s);
shell = scSh.s;
stats.copy += cpSh.n;
stats.scrub += scSh.n;
fs.writeFileSync(shellPath, shell);

const namesPatched = patchNamesEn(ordered);
console.log("names en", namesPatched ? "patched" : "ok");

for (const f of fs.readdirSync(assetsDir)) {
  if (!f.endsWith(".js") || f === path.basename(engPath) || f === path.basename(shellPath)) continue;
  let t = fs.readFileSync(path.join(assetsDir, f), "utf8");
  const r = applyPairs(t, COPY_PAIRS);
  const sc = scrubLeagueLabels(r.s);
  if (r.n || sc.n) {
    fs.writeFileSync(path.join(assetsDir, f), sc.s);
    stats.copy += r.n;
    stats.scrub += sc.n;
  }
}

const probe = (eng.match(/맨시티/g) || []).length + (shell.match(/맨시티/g) || []).length;
console.log("probe 맨시티 engine+shell", probe);
console.log("fix-clubs-baseball done", JSON.stringify(stats));
