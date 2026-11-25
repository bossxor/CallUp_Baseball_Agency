/**
 * Phase UI Task 3 — title: one save slot + data reset label.
 * Collapses Ua=[1,2,3] → [1]; renames new-game / clear copy; CSS hides extra slots.
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
const MARK = "/* CALLUP_TITLE_SINGLE */";

let shell = fs.readFileSync(shellPath, "utf8");
let n = 0;

if (shell.includes("Ua=[1,2,3]")) {
  shell = shell.replace("Ua=[1,2,3]", "Ua=[1]");
  n++;
  console.log("Ua → [1]");
} else if (shell.includes("Ua=[1]")) {
  console.log("Ua already [1]");
} else {
  console.error("MISS Ua=[1,2,3]");
  process.exitCode = 1;
}

const copyPairs = [
  ['"{n}번 새 게임"', '"새 게임"'],
  ['"{n}번 칸 지우기 (3초 동안 누르기)"', '"데이터 초기화 (3초 유지)"'],
  ['"세이브 삭제 (3초 유지)"', '"데이터 초기화 (3초 유지)"'],
  [
    'n("3초 동안 누르고 있으면 삭제돼요")',
    'n("3초 유지하면 데이터가 초기화돼요")',
  ],
];
for (const [a, b] of copyPairs) {
  if (!shell.includes(a)) {
    console.log("MISS copy", a.slice(0, 48));
    continue;
  }
  const c = shell.split(a).length - 1;
  shell = shell.split(a).join(b);
  n += c;
  console.log("copy", a.slice(0, 28), "→", b.slice(0, 28), "x", c);
}

// Add settings entry hint: if ghost close near PersonalSaveTools, inject reset label nearby via i18n only — CSS note
fs.writeFileSync(shellPath, shell);

let theme = fs.readFileSync(themePath, "utf8");
if (!theme.includes(MARK)) {
  theme += `
${MARK}
/* Single-save title: hide any leftover slot chrome beyond first */
.ti-btns .ti-slot:nth-child(n+2),
.ti-btns > button.ti-new:nth-child(n+2),
.ti-btns > button.ti-first:nth-child(n+2) {
  display: none !important;
}
.ti-btns {
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
  max-width: 420px !important;
  margin: 0 auto !important;
}
.ti-slot .ti-cont {
  min-height: 64px !important;
  font-weight: 700 !important;
}
.ti-del {
  font-weight: 600 !important;
  color: var(--sub) !important;
}
`;
  fs.writeFileSync(themePath, theme);
  console.log("theme single-save CSS");
} else console.log("theme single-save already");
fs.copyFileSync(themePath, pubTheme);

console.log("fix-ui-title-single-save done", { n });
if (process.exitCode) process.exit(process.exitCode);
