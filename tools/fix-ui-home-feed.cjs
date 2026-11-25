/**
 * Phase UI Task 4 — home agenda: horizontal swipe carousel → vertical feed.
 * - Drop infinite clone cards (0:/2: keys)
 * - Add callup-feed class aliases
 * - CSS: column scroll, full-width cards
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const shellPath = path.join(
  root,
  "apk-src",
  "assets",
  "public",
  "assets",
  "shell-DaKdX7f1.js"
);
const themePath = path.join(__dirname, "callup-theme.css");
const pubTheme = path.join(root, "apk-src", "assets", "public", "callup-theme.css");
const MARK = "/* CALLUP_HOME_FEED */";

let shell = fs.readFileSync(shellPath, "utf8");
let n = 0;

const OLD_HE =
  "he=k.length>1?[{...k[k.length-1],key:`0:${k[k.length-1].k}`},...k.map(w=>({...w,key:`1:${w.k}`})),{...k[0],key:`2:${k[0].k}`}]:k.map(w=>({...w,key:w.k}))";
const NEW_HE = "he=k.map(w=>({...w,key:w.k}))";

if (shell.includes(NEW_HE) && !shell.includes(OLD_HE)) {
  console.log("he feed already flat");
} else if (shell.includes(OLD_HE)) {
  shell = shell.replace(OLD_HE, NEW_HE);
  n++;
  console.log("he carousel → flat list");
} else {
  console.error("MISS he= carousel expression");
  process.exitCode = 1;
}

const classPairs = [
  [
    'e.jsx("div",{className:"hs-row",ref:g,onScroll:N,children:',
    'e.jsx("div",{className:"hs-row callup-feed",ref:g,children:',
  ],
  [
    'e.jsxs("div",{className:"hs-c","data-k":w.key,children:',
    'e.jsxs("div",{className:"hs-c callup-feed-item","data-k":w.key,"data-tier":(w.tier||w.rar||"common"),children:',
  ],
  [
    'e.jsxs("section",{className:"hs","aria-label":n("일정"),children:',
    'e.jsxs("section",{className:"hs callup-home","aria-label":n("일정"),children:',
  ],
];

for (const [a, b] of classPairs) {
  if (shell.includes(b)) {
    console.log("ok already", b.slice(0, 48));
    continue;
  }
  if (!shell.includes(a)) {
    console.log("MISS", a.slice(0, 60));
    process.exitCode = 1;
    continue;
  }
  shell = shell.split(a).join(b);
  n++;
  console.log("patched", a.slice(0, 40));
}

fs.writeFileSync(shellPath, shell);

let theme = fs.readFileSync(themePath, "utf8");
if (!theme.includes(MARK)) {
  theme += `
${MARK}
/* Home: vertical feed (no horizontal swipe stack) */
.hs.callup-home,
.hs {
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
}
.hs-row.callup-feed,
.hs-row {
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  gap: 12px !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  scroll-snap-type: y proximity !important;
  margin: 0 !important;
  padding: 4px 0 20px !important;
  scroll-padding: 0 !important;
  -webkit-overflow-scrolling: touch !important;
}
.hs-row.callup-feed .hs-c,
.hs-c.callup-feed-item,
.hs-row .hs-c {
  flex: none !important;
  width: 100% !important;
  max-width: 100% !important;
  scroll-snap-align: start !important;
  min-height: 0 !important;
}
.hs-row .hs-c * {
  overscroll-behavior-x: none !important;
}
.hs-c.callup-feed-item .hs-img {
  flex: 0 0 72px !important;
}
.hs-c.callup-feed-item .hs-b {
  padding: 10px 14px 4px !important;
}
.hs-c.callup-feed-item .hc-body {
  padding: 0 14px 14px !important;
}
`;
  fs.writeFileSync(themePath, theme);
  console.log("theme home feed CSS");
} else console.log("theme home feed already");
fs.copyFileSync(themePath, pubTheme);

console.log("fix-ui-home-feed done", { n });
if (process.exitCode) process.exit(process.exitCode);
