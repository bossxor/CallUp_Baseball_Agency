/** Force KR Seoul-area place names: 잠실·고척·목동. */
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || path.join(__dirname, "..", "apk-src");
const assets = path.join(root, "assets", "public", "assets");
const engPath = path.join(assets, "engine-DhPc-c_J.js");
const shellPath = path.join(assets, "shell-DaKdX7f1.js");
const namesPath = path.join(assets, "names-DvEudt3S.js");
const dataPath = path.join(__dirname, "..", "data", "callup-clubs.json");

const j = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const kr = j.markets.KR.clubs.join(",");
const jp = j.markets.JP.clubs.join(",");
const formal = [...new Set(Object.values(j.markets).flatMap((m) => m.clubs))];

// Exact token renames (club display / wc keys)
const map = [
  ["서울북", "잠실"],
  ["서울남", "고척"],
  ["고양", "목동"],
  ["청주", "고척"],
];

function applyMap(s) {
  let n = 0;
  for (const [a, b] of map) {
    const c = s.split(a).length - 1;
    if (!c) continue;
    s = s.split(a).join(b);
    n += c;
  }
  // bare 서울 as wc/club token only (quoted or wc pair)
  const before = s;
  s = s.replace(/"서울"/g, '"잠실"');
  s = s.replace(/(?<=[:,{])서울(?=[:,}])/g, "잠실");
  n += before === s ? 0 : 1;
  return { s, n };
}

for (const f of [engPath, shellPath, namesPath]) {
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, "utf8");
  const r = applyMap(s);
  s = r.s;
  if (f === shellPath) {
    s = s.replace(
      /const formal = new Set\(\[[^\]]*\]\);/,
      `const formal = new Set(${JSON.stringify(formal)});`
    );
  }
  fs.writeFileSync(f, s);
  console.log(path.basename(f), "replacements~", r.n);
}

let eng = fs.readFileSync(engPath, "utf8");
let hits = 0;
eng = eng.replace(
  /N\("(ENG\d+)","([^"]+)","한국","AS",(\d+),([^,]*),([^,]*),([^,]*),"([^"]*)","[^"]+"/g,
  (_, id, label, tier, a, b, c, d) => {
    hits++;
    return `N("${id}","${label}","한국","AS",${tier},${a},${b},${c},"${d}","${kr}"`;
  }
);
eng = eng.replace(
  /N\("(ESP\d+)","([^"]+)","일본","AS",(\d+),([^,]*),([^,]*),([^,]*),"([^"]*)","[^"]+"/g,
  (_, id, label, tier, a, b, c, d) => {
    hits++;
    return `N("${id}","${label}","일본","AS",${tier},${a},${b},${c},"${d}","${jp}"`;
  }
);

// load-time legacy rename
const mark = "/*CALLUP_KR_PLACE*/";
if (!eng.includes(mark)) {
  const needle =
    'if(_c&&_c.name)_c.name=String(_c.name).replace(/\\s+\\d+$/u,"").replace(/(\\D)\\d+$/u,"$1").trim()';
  const mapExpr =
    '{서울:"잠실",서울북:"잠실",서울남:"고척",고양:"목동",청주:"고척"}';
  if (eng.includes(needle)) {
    eng = eng.replace(
      needle,
      needle + mark + `;_c.name=${mapExpr}[_c.name]||_c.name`
    );
    console.log("patched load place map");
  } else if (eng.includes("CALLUP_KR_CITY_MAP")) {
    eng = eng.replace(
      /\/\*CALLUP_KR_CITY_MAP\*\/;_c\.name=\{[^}]+\}|_c\.name\]\|\|_c\.name/,
      mark + `;_c.name=${mapExpr}[_c.name]||_c.name`
    );
    console.log("replaced old city map");
  } else {
    console.log("WARN no load hook for place map");
  }
}

fs.writeFileSync(engPath, eng);
console.log("N() refreshed", hits);
console.log("KR", kr);
