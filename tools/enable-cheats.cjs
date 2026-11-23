const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "T:/CallUp/apk-src";
const publicDir = path.join(root, "assets/public");
const shellPath = path.join(publicDir, "assets/shell-DaKdX7f1.js");

// Restore cheat CSS (was removed earlier)
fs.copyFileSync("T:/cheat-panel.css", path.join(publicDir, "cheats.css"));
console.log("cheats.css restored");

// Ensure index links cheats.css before theme
let html = fs.readFileSync(path.join(publicDir, "index.html"), "utf8");
if (!html.includes('href="./cheats.css"')) {
  html = html.replace(
    '<link rel="stylesheet" href="./callup-theme.css" />',
    '<link rel="stylesheet" href="./cheats.css" />\n    <link rel="stylesheet" href="./callup-theme.css" />'
  );
}
// remove broken empty cheats if duplicated
html = html.replace(
  /<link rel="stylesheet" href="\.\/cheats\.css" \/>\s*<link rel="stylesheet" href="\.\/cheats\.css" \/>/g,
  '<link rel="stylesheet" href="./cheats.css" />'
);
fs.writeFileSync(path.join(publicDir, "index.html"), html);
console.log("index ok");

let shell = fs.readFileSync(shellPath, "utf8");
const reps = [
  ['"aria-label": "치트"', '"aria-label": "개발용 치트"'],
  ['children: "개인판"', 'children: "개발용 치트 (출시 전 제거)"'],
  ["단장의 인내심 99", "협상 인내심 99"],
  ['group("치트 종류"', 'group("치트 종류 (개인용)"'],
];
for (const [a, b] of reps) {
  const n = shell.split(a).length - 1;
  console.log(JSON.stringify(a), n);
  if (n > 0) shell = shell.split(a).join(b);
}
fs.writeFileSync(shellPath, shell);

// Append theme note styles for cheat panel in bright UI
const themePath = path.join(__dirname, "callup-theme.css");
let theme = fs.readFileSync(themePath, "utf8");
const marker = "/* CHEAT_DEV */";
if (!theme.includes(marker)) {
  theme += `

${marker}
.personal-cheats .set-h,
.personal-cheats > .set-h,
section.personal-cheats {
  outline: 2px dashed color-mix(in srgb, var(--accent) 45%, transparent);
  outline-offset: 4px;
  border-radius: 12px;
}
.cheat-panel {
  background: color-mix(in srgb, var(--accent) 6%, var(--panel));
}
.cheat-toggle[aria-checked="true"] .cheat-toggle-track {
  color: #fff !important;
  background: var(--accent) !important;
  border-color: var(--accent) !important;
}
`;
  fs.writeFileSync(themePath, theme);
}
fs.copyFileSync(themePath, path.join(publicDir, "callup-theme.css"));
console.log("cheats enabled");
