/**
 * Center week CTA: always baseball sphere (never house / play / SignHere diamond).
 * - CSS: sphere + stitches; hide any inner SVG/text
 * - Shell: empty mid <i> children so K(house|play) cannot paint
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const themePath = path.join(__dirname, "callup-theme.css");
const pubTheme = path.join(root, "apk-src", "assets", "public", "callup-theme.css");
const shellPath = path.join(
  root,
  "apk-src",
  "assets",
  "public",
  "assets",
  "shell-DaKdX7f1.js"
);
const MARK = "/* CALLUP_TAB_BASEBALL */";
const SHELL_MARK = "/*CALLUP_MID_BALL*/";

const BLOCK = `
${MARK}
/* Center week CTA: baseball sphere — hide house/play/news glyphs in ALL states */
.tabs .mid i,
.tabs .mid.go i,
.tabs .mid.busy i,
.tabs .mid.dd i,
.tabs .mid.go.dd i,
.tabs .mid.news i{
  transform:none !important;
  border-radius:50% !important;
  width:54px !important;
  height:54px !important;
  background:
    radial-gradient(circle at 32% 28%, #fff9f2 0%, #f0e6da 42%, #d4c4b0 78%, #b8a690 100%) !important;
  box-shadow:
    0 0 0 3px var(--bg2),
    0 6px 14px -4px rgba(0,0,0,.55),
    inset 0 0 0 2px rgba(196,146,74,.55) !important;
  position:relative !important;
  overflow:hidden !important;
  color:transparent !important;
}
.tabs .mid i:before,
.tabs .mid i:after,
.tabs .mid.go i:after,
.tabs .mid.busy i:after,
.tabs .mid.dd i:after,
.tabs .mid.go.dd i:after{
  content:"" !important;
  position:absolute !important;
  pointer-events:none !important;
  border:1.5px solid rgba(180,60,50,.75) !important;
  border-radius:50% !important;
  width:120% !important;
  height:120% !important;
  top:-10% !important;
  right:auto !important;
  bottom:auto !important;
  left:-10% !important;
  opacity:.9 !important;
  display:block !important;
  animation:none !important;
  background:transparent !important;
  box-shadow:none !important;
  margin:0 !important;
  rotate:none !important;
  z-index:1 !important;
}
.tabs .mid i:before{ clip-path:inset(0 52% 0 0); transform:translateX(-6%) !important; }
.tabs .mid i:after,
.tabs .mid.go i:after,
.tabs .mid.busy i:after,
.tabs .mid.dd i:after,
.tabs .mid.go.dd i:after{
  clip-path:inset(0 0 0 52%);
  transform:translateX(6%) !important;
}
/* Kill house / play / mid-news glyphs on top of sphere */
.tabs .mid i>*,
.tabs .mid i svg,
.tabs .mid i .mid-news{
  display:none !important;
  visibility:hidden !important;
  opacity:0 !important;
  width:0 !important;
  height:0 !important;
  overflow:hidden !important;
  pointer-events:none !important;
}
.tabs .mid.go{ color:var(--accent-hi) !important; font-weight:700 !important; }
.tabs .mid.busy i{ animation:callupSpinBall 1s linear infinite !important; }
@keyframes callupSpinBall{
  0%{ transform:rotate(0) !important; }
  to{ transform:rotate(360deg) !important; }
}
.tabs .mid.dd:before{
  border-radius:50% !important;
  rotate:none !important;
  background:var(--accent-line) !important;
}
`;

function upsertThemeBlock(css) {
  const start = css.indexOf(MARK);
  if (start === -1) return css + BLOCK;
  const after = css.slice(start + MARK.length);
  const next = after.search(/\n\/\* CALLUP_/);
  const end = next === -1 ? css.length : start + MARK.length + next;
  return css.slice(0, start).trimEnd() + BLOCK + css.slice(end);
}

let theme = fs.readFileSync(themePath, "utf8");
theme = upsertThemeBlock(theme);
fs.writeFileSync(themePath, theme);
fs.copyFileSync(themePath, pubTheme);
console.log("theme baseball CTA CSS upserted");

const OLD_MID =
  'children:e.jsx("i",{children:h?e.jsxs("span",{className:"mid-news",children:[e.jsx("b",{className:"n",children:h}),n("뉴스")]}):i?e.jsx(K,{name:"play",size:28,fill:!0}):e.jsx(K,{name:"house",size:26,fill:!0})})';
const NEW_MID = `children:e.jsx("i",{children:null ${SHELL_MARK}})`;

let shell = fs.readFileSync(shellPath, "utf8");
if (shell.includes(SHELL_MARK)) {
  console.log("shell mid already empty baseball");
} else if (shell.includes(OLD_MID)) {
  shell = shell.replace(OLD_MID, NEW_MID);
  fs.writeFileSync(shellPath, shell);
  console.log("shell mid house/play → empty baseball");
} else {
  console.error("MISS mid house/play icon branch in shell");
  process.exitCode = 1;
}

console.log("fix-ui-tab-baseball done");
if (process.exitCode) process.exit(process.exitCode);
