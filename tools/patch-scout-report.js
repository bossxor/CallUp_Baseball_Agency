/** Restyle copy: pack → scout report page turn. */
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "T:/CallUp/apk-src";
const assets = path.join(root, "assets/public/assets");
const publicDir = path.join(root, "assets/public");

function patch(file, pairs) {
  const p = path.join(assets, file);
  if (!fs.existsSync(p)) return;
  let s = fs.readFileSync(p, "utf8");
  const before = s;
  for (const [a, b] of pairs) s = s.split(a).join(b);
  if (s !== before) {
    fs.writeFileSync(p, s);
    console.log("patched", file);
  } else console.log("unchanged", file);
}

const pairs = [
  ["팩 열기", "보고서 열기"],
  ["스카우트 팩 열기", "스카우트 보고서 열기"],
  ["팩 위쪽을 가로로 그어 뜯어요", "보고서 위쪽을 가로로 쓸어 넘겨요"],
  ["팩 위쪽을 가로로 그어서 뜯어 주세요", "보고서 위쪽을 가로로 쓸어 넘겨 주세요"],
  ["팩 뜯기", "보고서 넘기기"],
  ["SCOUT PACK", "SCOUT REPORT"],
  ["SIGN HERE SCOUT PACK ", "CALL UP SCOUT REPORT "],
  ["SIGN HERE SCOUT REPORT ", "CALL UP SCOUT REPORT "],
  ["TEAR TO OPEN", "FLIP TO READ"],
  ["Tear to open", "Flip to read"],
  ["카드 팩", "스카우트 보고서"],
  ["리포트 팩", "스카우트 보고서"],
  ["팩을", "보고서를"],
  ["팩을 ", "보고서를 "],
];

for (const f of [
  "shell-DaKdX7f1.js",
  "engine-DhPc-c_J.js",
  "ui-DgYnPcSw.js",
  "ui-DSX53OnJ.js",
  "index-B5T0JNgO.js",
  "i18n-D-FAABCZ.js",
]) {
  patch(f, pairs);
}

// theme overlay
fs.copyFileSync(
  path.join(__dirname, "callup-theme.css"),
  path.join(publicDir, "callup-theme.css")
);
console.log("theme synced");

// emblem if present in tools/assets
const emblemSrcCandidates = [
  path.join(__dirname, "../assets/callup-emblem.jpg"),
  "C:/Users/N-052/.cursor/projects/t/assets/callup-emblem.jpg",
];
for (const src of emblemSrcCandidates) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(publicDir, "emblem.webp"));
    console.log("emblem installed from", src);
    break;
  }
}
