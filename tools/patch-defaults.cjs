/**
 * Apply CallUp default agency name + logo stamp pool.
 * Also covered by patch-callup.cjs brand/label pairs on full rebuild.
 */
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "T:/CallUp/apk-src";
const assets = path.join(root, "assets/public/assets");

const pairs = [
  ["햇살 에이전시", "콜업 에이전시"],
  ["Sunshine Agency", "Call Up Agency"],
  ["Ag. Sunshine", "Ag. Call Up"],
  [
    'Oc=["불꽃","여우","햇살","클로버","북극성","인장"]',
    'Oc=["다이아","글러브","홈런","마운드","파울","콜업"]',
  ],
  [
    '불꽃:"Blaze",여우:"Fox",햇살:"Sunshine",클로버:"Clover",북극성:"Polaris",인장:"Seal"',
    '다이아:"Diamond",글러브:"Glove",홈런:"Homer",마운드:"Mound",파울:"Foul",콜업:"CallUp"',
  ],
];

for (const f of [
  "shell-DaKdX7f1.js",
  "ui-DSX53OnJ.js",
  "ui-DgYnPcSw.js",
]) {
  const p = path.join(assets, f);
  if (!fs.existsSync(p)) continue;
  let s = fs.readFileSync(p, "utf8");
  let n = 0;
  for (const [a, b] of pairs) {
    const c = s.split(a).length - 1;
    if (c) {
      s = s.split(a).join(b);
      n += c;
    }
  }
  if (n) {
    fs.writeFileSync(p, s);
    console.log("defaults", f, n);
  } else console.log("unchanged", f);
}
console.log("patch-defaults done");
