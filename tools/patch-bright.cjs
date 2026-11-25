/**
 * Sync CallUp theme into shell CSS + index.
 * Phase UI: dark charcoal + warm amber (replaces former sage-bright pass).
 */
const fs = require("fs");
const path = require("path");
const root = process.argv[2] || "T:/CallUp/apk-src";
const publicDir = path.join(root, "assets/public");
const cssPath = path.join(publicDir, "assets/shell-DGv3wu-g.css");
const htmlPath = path.join(publicDir, "index.html");

const DARK_ROOT =
  "--bg: #12151A;--bg2: #0E1116;--panel: #1A1F27;--panel2: #222833;--panel3: #2A3140;--line: #333B4A;--line2: #3E4758;--ink: #F2EDE4;--body: #C8C2B8;--sub: #8B857A;--dim: #5E5952;--accent: #C4924A;--accent-ink: #1A1208;--accent-soft: rgba(196, 146, 74, .16);--accent-line: rgba(196, 146, 74, .45);--accent-hi: #D4A85C;--accent-lo: #A67A38;";

const SAGE_ROOT =
  "--bg: #F2F5EF;--bg2: #E6EBE2;--panel: #FFFFFF;--panel2: #F7FAF4;--panel3: #EEF3EA;--line: #D3DCCE;--line2: #BFCAB8;--ink: #1B2A20;--body: #3A4A40;--sub: #66766C;--dim: #8A978E;--accent: #2F7D4A;--accent-ink: #FFFFFF;--accent-soft: rgba(47, 125, 74, .12);--accent-line: rgba(47, 125, 74, .4);--accent-hi: #4CA86A;--accent-lo: #246B3C;";

const NAVY_ROOT =
  "--bg: #0A1628;--bg2: #07101C;--panel: #132338;--panel2: #1A3148;--panel3: #243F5A;--line: #2A455F;--line2: #3A5A78;--ink: #F4F1E8;--body: #C9D0D6;--sub: #8A9AAB;--dim: #5E7388;--accent: #F0C75E;--accent-ink: #1A1400;--accent-soft: rgba(240, 199, 94, .14);--accent-line: rgba(240, 199, 94, .45);--accent-hi: #FFE08A;--accent-lo: #C9922E;";

const SH_ROOT =
  "--bg: #141516;--bg2: #101112;--panel: #1C1E20;--panel2: #222528;--panel3: #2A2D30;--line: #26292C;--line2: #33373B;--ink: #E8E1CF;--body: #C2C5C7;--sub: #8A8F93;--dim: #5E6468;--accent: #C5F23C;--accent-ink: #121A03;--accent-soft: rgba(197, 242, 60, .12);--accent-line: rgba(197, 242, 60, .45);--accent-hi: #E2FB8A;--accent-lo: #9CCB1A;";

let css = fs.readFileSync(cssPath, "utf8");
if (css.includes(DARK_ROOT)) {
  console.log("shell css already dark amber");
} else if (css.includes(SAGE_ROOT)) {
  css = css.replace(SAGE_ROOT, DARK_ROOT);
} else if (css.includes(NAVY_ROOT)) {
  css = css.replace(NAVY_ROOT, DARK_ROOT);
} else if (css.includes(SH_ROOT)) {
  css = css.replace(SH_ROOT, DARK_ROOT);
} else if (css.includes("--bg: #12151A")) {
  console.log("shell css dark partial — leave");
} else {
  throw new Error("root block not found for theme patch");
}

css = css.split("#2F7D4A").join("#C4924A");
css = css.split("#4CA86A").join("#D4A85C");
css = css.split("#246B3C").join("#A67A38");
css = css.split("rgba(47, 125, 74,").join("rgba(196, 146, 74,");
css = css.split("#F0C75E").join("#C4924A");
css = css.split("rgba(240, 199, 94,").join("rgba(196, 146, 74,");
css = css.split("--zebra: #EAF0E6").join("--zebra: #181C24");
css = css.split("--zebra: #0D1C2E").join("--zebra: #181C24");
css = css.split("--good: #2F7D4A").join("--good: #6BBF7A");
css = css.split("--good: #B8E986").join("--good: #6BBF7A");
css = css.split("--tag-good: #2F7D4A").join("--tag-good: #6BBF7A");
css = css.split("--tag-good: #B8E986").join("--tag-good: #6BBF7A");
css = css.split("--tut-bub: #FFFFFF").join("--tut-bub: #1A1F27");
css = css.split("--tut-bub:#FFFFFF").join("--tut-bub:#1A1F27");
css = css.split("--tut-bub: #2F3338").join("--tut-bub: #1A1F27");
css = css
  .split(
    ".ti-logos button{display:grid;place-items:center;height:50px;border-radius:var(--r-s);background:#fff;opacity:1;border:1px solid var(--line);"
  )
  .join(
    ".ti-logos button{display:grid;place-items:center;height:50px;border-radius:var(--r-s);background:var(--panel2);opacity:1;border:1px solid var(--line);"
  );

fs.writeFileSync(cssPath, css);
console.log("shell css dark amber");

let html = fs.readFileSync(htmlPath, "utf8");
for (const from of ["#F2F5EF", "#0A1628", "#141516"]) {
  html = html.split(`style="background:${from}"`).join('style="background:#12151A"');
  html = html.split(`content="${from}"`).join('content="#12151A"');
}
if (!html.includes("callup-theme.css")) {
  html = html.replace(
    "</head>",
    '    <link rel="stylesheet" href="./callup-theme.css" />\n  </head>'
  );
}
fs.writeFileSync(htmlPath, html);
console.log("index dark amber");

fs.copyFileSync(
  path.join(__dirname, "callup-theme.css"),
  path.join(publicDir, "callup-theme.css")
);
console.log("theme synced");
