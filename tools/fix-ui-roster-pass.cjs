/**
 * Phase UI Task 7a — roster/player list token pass (readability only).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const themePath = path.join(__dirname, "callup-theme.css");
const pubTheme = path.join(root, "apk-src", "assets", "public", "callup-theme.css");
const MARK = "/* CALLUP_ROSTER_PASS */";

let theme = fs.readFileSync(themePath, "utf8");
if (theme.includes(MARK)) {
  console.log("roster pass already");
} else {
  theme += `
${MARK}
/* Roster / player list — same dark amber tokens, readable rows */
.plist,
.pcards {
  background: var(--bg) !important;
  color: var(--ink) !important;
}
.plist > .prow2,
.pcards > .prow2,
.prow2.pr2 {
  background: var(--panel) !important;
  color: var(--ink) !important;
  border-bottom: 1px solid var(--line) !important;
  min-height: 56px !important;
}
.prow2 .nm,
.prow2 b,
.plist .nm {
  color: var(--ink) !important;
  font-weight: 600 !important;
}
.prow2 .sub,
.prow2 small,
.plist .sub {
  color: var(--body) !important;
}
.mine {
  background: color-mix(in srgb, var(--accent) 10%, var(--panel)) !important;
}
.ovr {
  color: var(--ink) !important;
}
`;
  fs.writeFileSync(themePath, theme);
  console.log("theme roster pass CSS");
}
fs.copyFileSync(themePath, pubTheme);
console.log("fix-ui-roster-pass done");
