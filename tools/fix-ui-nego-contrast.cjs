/**
 * Phase UI Task 6b — nego sheet contrast + touch targets on dark amber.
 * No gold-on-gradient low-contrast titles; bump type and hit areas.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const themePath = path.join(__dirname, "callup-theme.css");
const pubTheme = path.join(root, "apk-src", "assets", "public", "callup-theme.css");
const MARK = "/* CALLUP_NEGO_CONTRAST */";

let theme = fs.readFileSync(themePath, "utf8");
if (theme.includes(MARK)) {
  console.log("nego contrast already");
} else {
  theme += `
${MARK}
/* Nego: high contrast on dark charcoal + amber */
.nego {
  background: var(--bg) !important;
  color: var(--ink) !important;
}
.nego .nh {
  background: var(--panel) !important;
  color: var(--ink) !important;
  border-bottom: 1px solid var(--line) !important;
  box-shadow: none !important;
}
.nego .nh .nm,
.nego .nh b,
.nego .nh .ttl,
.nego .nh h1,
.nego .nh .h1 {
  color: var(--ink) !important;
  text-shadow: none !important;
  background: none !important;
  -webkit-text-fill-color: var(--ink) !important;
}
.nego .nh .sub,
.nego .nh small {
  color: var(--body) !important;
}
.nego .btn,
.nego button.btn,
.nego .hcd,
.nego .chip {
  min-height: 44px !important;
}
.nego .btn.go,
.nego button.go {
  background: var(--fill-accent) !important;
  color: var(--accent-ink) !important;
  box-shadow: var(--sh-accent) !important;
  font-weight: 700 !important;
}
.nego .hand .hcd {
  background: var(--panel2) !important;
  color: var(--ink) !important;
  border: 1px solid var(--line) !important;
  box-shadow: var(--sh-panel) !important;
}
.nego .say,
.nego .bubble {
  background: var(--panel2) !important;
  color: var(--ink) !important;
  border: 1px solid var(--line) !important;
}
`;
  fs.writeFileSync(themePath, theme);
  console.log("theme nego contrast CSS");
}
fs.copyFileSync(themePath, pubTheme);
console.log("fix-ui-nego-contrast done");
