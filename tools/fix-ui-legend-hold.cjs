/**
 * Phase UI Task 6a — legend confirm requires ≥3000ms hold.
 * Engine already charges via d4; bump 1400 → 3000. Short tap stays no-op.
 * CSS: stronger .opt .chg fill on legend cards.
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
const MARK = "/* CALLUP_LEGEND_HOLD */";

let shell = fs.readFileSync(shellPath, "utf8");
let n = 0;

const OLD = ",ra=vl,Yr=.42,d4=1400;function Du(";
const NEW = ",ra=vl,Yr=.42,d4=3000;function Du(";

if (shell.includes(NEW)) {
  console.log("legend d4 already 3000");
} else if (shell.includes(OLD)) {
  shell = shell.replace(OLD, NEW);
  n++;
  console.log("legend hold d4 1400→3000");
} else if (shell.includes("d4=3000")) {
  console.log("legend d4 already 3000 (alt)");
} else {
  console.error("MISS d4=1400 Du anchor");
  process.exitCode = 1;
}

fs.writeFileSync(shellPath, shell);

let theme = fs.readFileSync(themePath, "utf8");
if (!theme.includes(MARK)) {
  theme += `
${MARK}
/* Legend: hold fill more visible on dark amber */
.card.k-legend .opt .chg,
.news .card.k-legend .opt .chg {
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--tier-legend) 35%, transparent),
    color-mix(in srgb, var(--tier-legend) 85%, transparent)
  ) !important;
}
.card.k-legend .opt {
  min-height: 48px !important;
  position: relative !important;
  overflow: hidden !important;
}
.card.k-legend .opt.on {
  color: var(--accent-ink) !important;
  background: var(--fill-accent) !important;
}
`;
  fs.writeFileSync(themePath, theme);
  console.log("theme legend hold CSS");
} else console.log("theme legend hold already");
fs.copyFileSync(themePath, pubTheme);

console.log("fix-ui-legend-hold done", { n });
if (process.exitCode) process.exit(process.exitCode);
