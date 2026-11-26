/** Cheat category: reliable full-width tab buttons (WebView-safe). */
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || path.join(__dirname, "..", "apk-src");
const publicDir = path.join(root, "assets", "public");
const shellPath = path.join(publicDir, "assets", "shell-DaKdX7f1.js");
const cssSrc = path.join(__dirname, "cheat-panel.css");
const cssDst = path.join(publicDir, "cheats.css");

const MARK = "/*CALLUP_CHEAT_TAB_LIST*/";
const TAB_UI =
  MARK +
  ' e.jsxs("div", {className: "cheat-tab-list", role: "group", "aria-label": "치트 종류", children: ' +
  '[["players", "선수·자금"], ["negotiation", "협상"], ["scout", "스카우트"], ["qa", "Phase C 테스트"]]' +
  '.map(([key, title]) => e.jsx("button", {type: "button", className: "btn cheat-tab-btn" + (key === tab ? " on" : " ghost"),' +
  ' "aria-pressed": key === tab, onClick: () => setTab(key), children: title}, key))}),';

let shell = fs.readFileSync(shellPath, "utf8");
if (shell.includes(MARK)) {
  console.log("ok cheat-tab-list");
} else {
  const patterns = [
    /\/\*CALLUP_CHEAT_TAB_SELECT\*\/[\s\S]*?\}\)\}\),/,
    /group\("치트 종류 \(개인용\)", \[\["players", "선수·자금"\], \["negotiation", "협상"\], \["scout", "스카우트"\], \["qa", "Phase C 테스트"\]\], tab, setTab\),/,
    /group\("치트 종류 \(개인용\)", \[\["players", "선수·자금"\], \["negotiation", "협상"\], \["scout", "스카우트"\]\], tab, setTab\),/,
  ];
  let hit = false;
  for (const re of patterns) {
    if (re.test(shell)) {
      shell = shell.replace(re, TAB_UI);
      hit = true;
      break;
    }
  }
  if (!hit) {
    console.error("MISS cheat tab UI");
    process.exit(1);
  }
  fs.writeFileSync(shellPath, shell);
  console.log("patched cheat-tab-list");
}

let css = fs.readFileSync(cssSrc, "utf8");
const listMark = "/*CALLUP_CHEAT_TAB_LIST_CSS*/";
if (!css.includes(listMark)) {
  css += `

${listMark}
section.personal-cheats .sw-row.set-link,
section.personal-cheats .sw-row.set-link b {
  background: #1a2030 !important;
  color: #f2ede4 !important;
  -webkit-text-fill-color: #f2ede4 !important;
  border: 1px solid #3a4250 !important;
  border-radius: 10px !important;
  min-height: 48px;
}
.cheat-panel .cheat-tab-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}
.cheat-panel .cheat-tab-btn {
  min-height: 48px;
  width: 100%;
  padding: 12px 8px;
  font-size: 15px;
  position: relative;
  z-index: 2;
  touch-action: manipulation;
}
.cheat-panel .cheat-tab-btn.on {
  border: 1px solid var(--accent, #c4924a) !important;
  color: var(--accent, #c4924a) !important;
  font-weight: 700;
}
`;
  fs.writeFileSync(cssSrc, css);
  console.log("patched cheat-panel tab-list css");
}
fs.copyFileSync(cssSrc, cssDst);
console.log("cheats.css synced");
