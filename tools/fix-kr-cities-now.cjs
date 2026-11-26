/** Force KR city rename: 고양/청주 → 서울북/서울남 everywhere club-facing. */
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || path.join(__dirname, "..", "apk-src");
const assets = path.join(root, "assets", "public", "assets");
const files = [
  path.join(assets, "engine-DhPc-c_J.js"),
  path.join(assets, "shell-DaKdX7f1.js"),
  path.join(assets, "names-DvEudt3S.js"),
];

const map = [
  ["고양", "서울북"],
  ["청주", "서울남"],
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, "utf8");
  let n = 0;
  for (const [a, b] of map) {
    const c = s.split(a).length - 1;
    if (!c) continue;
    s = s.split(a).join(b);
    n += c;
  }
  // refresh formal set in cheat if present
  if (f.endsWith("shell-DaKdX7f1.js") && s.includes("CALLUP_FORMAL_CHEAT")) {
    const j = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "data", "callup-clubs.json"), "utf8")
    );
    const formal = [
      ...new Set(Object.values(j.markets).flatMap((m) => m.clubs)),
    ];
    s = s.replace(
      /const formal = new Set\(\[[^\]]*\]\);/,
      `const formal = new Set(${JSON.stringify(formal)});`
    );
  }
  fs.writeFileSync(f, s);
  console.log(path.basename(f), "replacements", n);
}

// also rebuild N() KR club lists from JSON uniquely
const engPath = path.join(assets, "engine-DhPc-c_J.js");
let eng = fs.readFileSync(engPath, "utf8");
const j = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "callup-clubs.json"), "utf8")
);
const kr = j.markets.KR.clubs.join(",");
const jp = j.markets.JP.clubs.join(",");
let hits = 0;
eng = eng.replace(
  /N\("(ENG\d+)","([^"]+)","한국","AS",(\d+),([^,]*),([^,]*),([^,]*),"([^"]*)","[^"]+"/g,
  (full, id, label, tier, a, b, c, d) => {
    hits++;
    return `N("${id}","${label}","한국","AS",${tier},${a},${b},${c},"${d}","${kr}"`;
  }
);
eng = eng.replace(
  /N\("(ESP\d+)","([^"]+)","일본","AS",(\d+),([^,]*),([^,]*),([^,]*),"([^"]*)","[^"]+"/g,
  (full, id, label, tier, a, b, c, d) => {
    hits++;
    return `N("${id}","${label}","일본","AS",${tier},${a},${b},${c},"${d}","${jp}"`;
  }
);
fs.writeFileSync(engPath, eng);
console.log("N() KR/JP club lists refreshed", hits);
console.log("KR now", kr);
