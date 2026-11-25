/**
 * Phase UI Task 1 — ensure dark amber theme is the published SSOT.
 * Idempotent: copies tools/callup-theme.css → public; asserts no sage bg.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(__dirname, "callup-theme.css");
const dst = path.join(root, "apk-src", "assets", "public", "callup-theme.css");
const htmlPath = path.join(root, "apk-src", "assets", "public", "index.html");

if (!fs.existsSync(src)) {
  console.error("MISS tools/callup-theme.css");
  process.exit(1);
}
const theme = fs.readFileSync(src, "utf8");
if (!theme.includes("--bg: #12151A") || !theme.includes("--accent: #C4924A")) {
  console.error("MISS dark amber tokens in tools/callup-theme.css");
  process.exit(1);
}
if (theme.includes("--bg: #F2F5EF")) {
  console.error("FAIL sage --bg still in theme source");
  process.exit(1);
}
fs.copyFileSync(src, dst);

let html = fs.readFileSync(htmlPath, "utf8");
if (!html.includes("callup-theme.css")) {
  html = html.replace(
    "</head>",
    '    <link rel="stylesheet" href="./callup-theme.css" />\n  </head>'
  );
  fs.writeFileSync(htmlPath, html);
}
html = html.split("#F2F5EF").join("#12151A");
fs.writeFileSync(htmlPath, html);

const pub = fs.readFileSync(dst, "utf8");
const ok =
  pub.includes("--tier-common:") &&
  pub.includes("--tier-legend:") &&
  pub.includes("#12151A");
console.log(
  ok
    ? "fix-ui-theme-dark OK dark amber + tiers"
    : "fix-ui-theme-dark WARN missing tier tokens"
);
if (!ok) process.exit(1);
