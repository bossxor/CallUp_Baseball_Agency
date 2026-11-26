/** Cheat category: 4-col ghost buttons → native <select> (WebView touch). */
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || path.join(__dirname, "..", "apk-src");
const publicDir = path.join(root, "assets", "public");
const shellPath = path.join(publicDir, "assets", "shell-DaKdX7f1.js");
const cssSrc = path.join(__dirname, "cheat-panel.css");
const cssDst = path.join(publicDir, "cheats.css");

const MARK = "/*CALLUP_CHEAT_TAB_SELECT*/";
const OLD_GROUP =
  'group("치트 종류 (개인용)", [["players", "선수·자금"], ["negotiation", "협상"], ["scout", "스카우트"], ["qa", "Phase C 테스트"]], tab, setTab),';
const NEW_SELECT =
  MARK +
  ' e.jsxs("label", {className: "cheat-tab-select", children: ["치트 종류", e.jsx("select", {' +
  'value: tab, onChange: event => setTab(event.target.value),' +
  'children: [["players", "선수·자금"], ["negotiation", "협상"], ["scout", "스카우트"], ["qa", "Phase C 테스트"]]' +
  '.map(([key, title]) => e.jsx("option", {value: key, children: title}, key))' +
  "})]}),";

let shell = fs.readFileSync(shellPath, "utf8");
if (shell.includes(MARK)) {
  console.log("ok cheat-tab-select");
} else if (!shell.includes(OLD_GROUP)) {
  console.error("MISS cheat tab group()");
  process.exit(1);
} else {
  shell = shell.replace(OLD_GROUP, NEW_SELECT);
  fs.writeFileSync(shellPath, shell);
  console.log("patched cheat-tab-select");
}

let css = fs.readFileSync(cssSrc, "utf8");
const cssMark = "/*CALLUP_CHEAT_TOUCH*/";
if (!css.includes(cssMark)) {
  css += `

${cssMark}
.cheat-panel .cheat-tab-select {
  display: grid;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 14px;
}
.cheat-panel .cheat-tab-select select {
  width: 100%;
  min-height: 48px;
  font-size: 16px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, currentColor 28%, transparent);
  background: var(--panel2, #1a1c22);
  color: inherit;
}
.cheat-panel .cheat-options {
  grid-auto-flow: row;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.cheat-panel .cheat-options > button {
  min-height: 44px;
  padding: 10px 8px;
}
`;
  fs.writeFileSync(cssSrc, css);
  console.log("patched cheat-panel.css touch");
}
fs.copyFileSync(cssSrc, cssDst);
console.log("cheats.css synced");
