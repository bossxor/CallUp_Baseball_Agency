/**
 * Scout report flip: hit target was top band; UX asks bottom→up.
 * Move band2 to bottom, ease threshold, complete on release if swiped enough.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "apk-src");
const shellPath = path.join(root, "assets/public/assets/shell-DaKdX7f1.js");
const themeSrc = path.join(__dirname, "callup-theme.css");
const themeDst = path.join(root, "assets/public/callup-theme.css");

let s = fs.readFileSync(shellPath, "utf8");
const pairs = [
  [
    "Ne=()=>{const B=Y.current;return!!B.down&&!B.finished&&B.x0-B.last[1]>=110}",
    "Ne=()=>{const B=Y.current;return!!B.down&&!B.finished&&B.x0-B.last[1]>=56}",
  ],
  [
    'Ls=()=>{var ce;const B=Y.current;if(!B.down||B.finished)return;B.down=!1,B.ys.fill(null),B.base&&(B.base.style.transform="");const W=(ce=oe.current)==null?void 0:ce.animate([{opacity:1},{opacity:0}],{duration:250});W&&(W.onfinish=()=>{var Ae;Y.current.finished||(Ae=oe.current)==null||Ae.setAttribute("points","")})}',
    'Ls=()=>{var ce;const B=Y.current;if(!B.down||B.finished)return;const Pe=B.x0-(B.last?B.last[1]:B.x0);if(Pe>=56){es(1);return}B.down=!1,B.ys.fill(null),B.base&&(B.base.style.transform=""),(ce=F.current)==null||ce.classList.remove("lifting","cutting");const W=(ce=oe.current)==null?void 0:ce.animate([{opacity:1},{opacity:0}],{duration:250});W&&(W.onfinish=()=>{var Ae;Y.current.finished||(Ae=oe.current)==null||Ae.setAttribute("points","")})}',
  ],
  // also accept pointer on whole pack base, not only band2
  [
    'e.jsx("div",{className:"spk-band2",onPointerDown:qe,onPointerMove:is,onPointerUp:Ls,onPointerCancel:Ls})',
    'e.jsx("div",{className:"spk-band2",onPointerDown:qe,onPointerMove:is,onPointerUp:Ls,onPointerCancel:Ls}),e.jsx("div",{className:"spk-grab",onPointerDown:qe,onPointerMove:is,onPointerUp:Ls,onPointerCancel:Ls})',
  ],
];

let n = 0;
for (const [a, b] of pairs) {
  if (!s.includes(a)) {
    console.log("MISS", a.slice(0, 70));
    continue;
  }
  const c = s.split(a).length - 1;
  s = s.split(a).join(b);
  n += c;
  console.log("OK", c, a.slice(0, 50));
}
fs.writeFileSync(shellPath, s);
console.log("shell", n);

let theme = fs.readFileSync(themeSrc, "utf8");
const marker = "/* PAGEFLIP_HIT_BOTTOM */";
if (!theme.includes(marker)) {
  theme += `

${marker}
/* Hit zone: bottom of report (UX says grab below & flip up) */
.spk-band2 {
  top: auto !important;
  bottom: 0 !important;
  left: -20px !important;
  right: -20px !important;
  height: 55% !important;
  z-index: 12 !important;
  touch-action: none !important;
}
.spk-grab {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 9;
  touch-action: none;
}
.spk.cut .spk-grab,
.spk.pageflip .spk-grab {
  pointer-events: none;
}
.spk-tip {
  z-index: 13 !important;
  pointer-events: none !important;
}
`;
  fs.writeFileSync(themeSrc, theme);
  console.log("theme extended");
}
fs.copyFileSync(themeSrc, themeDst);
console.log("done");
