const fs = require("fs");
const path = require("path");
const root = process.argv[2] || "T:/CallUp/apk-src";
const publicDir = path.join(root, "assets/public");
const cssPath = path.join(publicDir, "assets/shell-DGv3wu-g.css");
const htmlPath = path.join(publicDir, "index.html");

let css = fs.readFileSync(cssPath, "utf8");
const oldRoot =
  "--bg: #0A1628;--bg2: #07101C;--panel: #132338;--panel2: #1A3148;--panel3: #243F5A;--line: #2A455F;--line2: #3A5A78;--ink: #F4F1E8;--body: #C9D0D6;--sub: #8A9AAB;--dim: #5E7388;--accent: #F0C75E;--accent-ink: #1A1400;--accent-soft: rgba(240, 199, 94, .14);--accent-line: rgba(240, 199, 94, .45);--accent-hi: #FFE08A;--accent-lo: #C9922E;";
const newRoot =
  "--bg: #F2F5EF;--bg2: #E6EBE2;--panel: #FFFFFF;--panel2: #F7FAF4;--panel3: #EEF3EA;--line: #D3DCCE;--line2: #BFCAB8;--ink: #1B2A20;--body: #3A4A40;--sub: #66766C;--dim: #8A978E;--accent: #2F7D4A;--accent-ink: #FFFFFF;--accent-soft: rgba(47, 125, 74, .12);--accent-line: rgba(47, 125, 74, .4);--accent-hi: #4CA86A;--accent-lo: #246B3C;";
if (!css.includes(oldRoot) && !css.includes("--bg: #F2F5EF")) {
  // try original SignHere dark if somehow restored
  const sh =
    "--bg: #141516;--bg2: #101112;--panel: #1C1E20;--panel2: #222528;--panel3: #2A2D30;--line: #26292C;--line2: #33373B;--ink: #E8E1CF;--body: #C2C5C7;--sub: #8A8F93;--dim: #5E6468;--accent: #C5F23C;--accent-ink: #121A03;--accent-soft: rgba(197, 242, 60, .12);--accent-line: rgba(197, 242, 60, .45);--accent-hi: #E2FB8A;--accent-lo: #9CCB1A;";
  if (css.includes(sh)) css = css.replace(sh, newRoot);
  else throw new Error("root block not found");
} else if (css.includes(oldRoot)) {
  css = css.replace(oldRoot, newRoot);
}
css = css.split("#F0C75E").join("#2F7D4A");
css = css.split("rgba(240, 199, 94,").join("rgba(47, 125, 74,");
css = css.split("--zebra: #0D1C2E").join("--zebra: #EAF0E6");
css = css.split("--good: #B8E986").join("--good: #2F7D4A");
css = css.split("--tag-good: #B8E986").join("--tag-good: #2F7D4A");
fs.writeFileSync(cssPath, css);
console.log("shell css bright");

let html = fs.readFileSync(htmlPath, "utf8");
html = html.split('style="background:#0A1628"').join('style="background:#F2F5EF"');
html = html.split('content="#0A1628"').join('content="#F2F5EF"');
html = html.split('style="background:#141516"').join('style="background:#F2F5EF"');
html = html.split('content="#141516"').join('content="#F2F5EF"');
if (!html.includes("callup-theme.css")) {
  html = html.replace("</head>", '    <link rel="stylesheet" href="./callup-theme.css" />\n  </head>');
}
fs.writeFileSync(htmlPath, html);
console.log("index bright");

fs.copyFileSync(path.join(__dirname, "callup-theme.css"), path.join(publicDir, "callup-theme.css"));
console.log("theme synced");
