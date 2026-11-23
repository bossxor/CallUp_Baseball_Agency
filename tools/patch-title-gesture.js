/** Hide yellow-swoosh Call Up title; scout open = bottom→top swipe. */
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "T:/CallUp/apk-src";
const assets = path.join(root, "assets/public/assets");
const publicDir = path.join(root, "assets/public");
const shellPath = path.join(assets, "shell-DaKdX7f1.js");

let s = fs.readFileSync(shellPath, "utf8");

const reps = [
  [
    "_e=216,w=376,Z=4,P=_e/Z+1",
    "_e=216,w=376,Z=4,P=(w/Z|0)+1",
  ],
  [
    'const V=B=>{const W=F.current.getBoundingClientRect();return[Math.max(0,Math.min(_e,(B.clientX-W.left)*_e/W.width)),Math.max(14,Math.min(84,(B.clientY-W.top)*w/W.height))]}',
    'const V=B=>{const W=F.current.getBoundingClientRect();return[Math.max(24,Math.min(_e-24,(B.clientX-W.left)*_e/W.width)),Math.max(56,Math.min(w-20,(B.clientY-W.top)*w/W.height))]}',
  ],
  [
    "ye=(B,W)=>{const ce=Y.current.ys,Ae=Math.round(B[0]/Z),Ce=Math.round(W[0]/Z),Pe=Math.max(1,Math.abs(Ce-Ae));for(let ts=0;ts<=Pe;ts++){const ps=ts/Pe;ce[Math.round(Ae+(Ce-Ae)*ps)]=B[1]+(W[1]-B[1])*ps}}",
    "ye=(B,W)=>{const ce=Y.current.ys,Ae=Math.round(B[1]/Z),Ce=Math.round(W[1]/Z),Pe=Math.max(1,Math.abs(Ce-Ae));for(let ts=0;ts<=Pe;ts++){const ps=ts/Pe;ce[Math.round(Ae+(Ce-Ae)*ps)]=B[0]+(W[0]-B[0])*ps}}",
  ],
  // polyline builder: index was X, value was Y → index Y, value X
  [
    "Ce!==null?ce.push(`${Pe*Z},${Ce.toFixed(1)}`)",
    "Ce!==null?ce.push(`${Ce.toFixed(1)},${Pe*Z}`)",
  ],
  [
    'points:"4,44 212,44"',
    'points:"108,340 108,56"',
  ],
  [
    "보고서 위쪽을 가로로 쓸어 넘겨요",
    "보고서 아래쪽을 위로 쓸어 올려요",
  ],
  [
    "보고서 위쪽을 가로로 쓸어 넘겨 주세요",
    "보고서 아래쪽을 위로 쓸어 올려 주세요",
  ],
];

for (const [a, b] of reps) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error(`expected 1× ${JSON.stringify(a).slice(0, 60)} got ${n}`);
  s = s.split(a).join(b);
  console.log("ok", JSON.stringify(a).slice(0, 48));
}
fs.writeFileSync(shellPath, s);
console.log("shell patched");

// theme: hide swoosh title + vertical gesture chrome
const themeSrc = path.join(__dirname, "callup-theme.css");
let theme = fs.readFileSync(themeSrc, "utf8");
const marker = "/* TITLE_SWOOSH_HIDE */";
if (!theme.includes(marker)) {
  theme += `

${marker}
/* Keep emblem only — drop big Call Up + yellow swoosh duplicate */
.ti-sign,
.ti-sig,
.ti-swoosh {
  display: none !important;
}

/* Bottom → top page lift hit area */
.spk-band2 {
  top: 48px !important;
  right: -12px !important;
  bottom: 8px !important;
  left: -12px !important;
  height: auto !important;
}
.spk-finger {
  left: 50% !important;
  top: auto !important;
  bottom: 36px !important;
  animation: callupFgUp 1.9s ease-in-out infinite !important;
}
@keyframes callupFgUp {
  0% { transform: translate(-50%, 0); opacity: 0; }
  15% { opacity: 1; }
  70% { transform: translate(-50%, -220px); opacity: 1; }
  100% { transform: translate(-50%, -260px); opacity: 0; }
}
.spk-trail .gd {
  stroke-dasharray: 3 7 !important;
}
`;
  fs.writeFileSync(themeSrc, theme);
  console.log("theme extended");
}
fs.copyFileSync(themeSrc, path.join(publicDir, "callup-theme.css"));
console.log("theme synced");
