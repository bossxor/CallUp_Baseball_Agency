/**
 * Phase UI Task 2 — center week CTA: diamond → baseball sphere (CSS).
 */
const fs = require("fs");
const path = require("path");

const themePath = path.join(__dirname, "callup-theme.css");
const pubTheme = path.join(
  __dirname,
  "..",
  "apk-src",
  "assets",
  "public",
  "callup-theme.css"
);
const MARK = "/* CALLUP_TAB_BASEBALL */";

const BLOCK = `
${MARK}
/* Center week CTA: baseball, not SignHere diamond */
.tabs .mid i{
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
}
.tabs .mid i:before,
.tabs .mid i:after{
  content:"" !important;
  position:absolute !important;
  pointer-events:none !important;
  border:1.5px solid rgba(180,60,50,.75) !important;
  border-radius:50% !important;
  width:120% !important;
  height:120% !important;
  top:-10% !important;
  left:-10% !important;
  opacity:.9 !important;
  display:block !important;
  animation:none !important;
  background:transparent !important;
  box-shadow:none !important;
  margin:0 !important;
  rotate:none !important;
}
.tabs .mid i:before{ clip-path:inset(0 52% 0 0); transform:translateX(-6%) !important; }
.tabs .mid i:after{ clip-path:inset(0 0 0 52%); transform:translateX(6%) !important; }
.tabs .mid i>*{ transform:none !important; color:var(--accent-lo) !important; }
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

let theme = fs.readFileSync(themePath, "utf8");
if (theme.includes(MARK)) {
  console.log("tab baseball already in theme");
} else {
  theme += BLOCK;
  fs.writeFileSync(themePath, theme);
  console.log("appended baseball CTA CSS");
}
fs.copyFileSync(themePath, pubTheme);
console.log("fix-ui-tab-baseball done");
