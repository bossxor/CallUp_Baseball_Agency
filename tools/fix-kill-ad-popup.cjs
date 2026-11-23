/**
 * Personal build: unlock all save slots, kill ad-removal IAP sheet.
 */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..", "apk-src");
const assets = path.join(root, "assets", "public", "assets");
const shell = path.join(assets, "shell-DaKdX7f1.js");
const html = path.join(root, "assets", "public", "index.html");

let s = fs.readFileSync(shell, "utf8");
const pairs = [
  // locked slot -> open IAP; now just start new game
  [
    "onClick:()=>Mr(M)?be(M):v(!0)",
    "onClick:()=>be(M)",
  ],
  // no lock icon / lk class
  ['`ti-new${Mr(M)?"":" lk"}`', "`ti-new`"],
  ["!Mr(M)&&e.jsx(K,{name:\"lock\",size:14,sw:2.4})", "null"],
  // never render title IAP sheet
  [
    'y&&e.jsxs(Ye,{pop:!0,onClose:()=>v(!1),children:[e.jsx("div",{className:"h1",children:n("광고 없이 계속 플레이")})',
    'false&&e.jsxs(Ye,{pop:!0,onClose:()=>v(!1),children:[e.jsx("div",{className:"h1",children:n("광고 없이 계속 플레이")})',
  ],
  // ad-ask overlay: auto-dismiss path — replace mount with null if whole component return
  [
    'return e.jsxs("div",{className:"sheet-bg ad-ask"',
    'return null;return e.jsxs("div",{className:"sheet-bg ad-ask"',
  ],
  // prologue/pro flag
  [
    'ae=localStorage.getItem("fa-pro")==="1"',
    "ae=true",
  ],
];

for (const [a, b] of pairs) {
  if (!s.includes(a)) {
    console.log("MISS", a.slice(0, 70));
    continue;
  }
  const n = s.split(a).length - 1;
  s = s.split(a).join(b);
  console.log("OK", n, a.slice(0, 56));
}
fs.writeFileSync(shell, s);

if (fs.existsSync(html)) {
  let h = fs.readFileSync(html, "utf8");
  const boot =
    '<script>try{localStorage.setItem("fa-pro","1")}catch(e){}</script>';
  if (!h.includes('localStorage.setItem("fa-pro"')) {
    h = h.replace("<head>", "<head>" + boot);
    fs.writeFileSync(html, h);
    console.log("index boot");
  }
}

console.log("fix-kill-ad-popup done");
