/** App-like WebView: no pinch-zoom, no text select/copy callout. */
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || path.join(__dirname, "..", "apk-src");
const publicDir = path.join(root, "assets", "public");
const themeSrc = path.join(__dirname, "callup-theme.css");
const themeDst = path.join(publicDir, "callup-theme.css");
const indexPath = path.join(publicDir, "index.html");
const smaliPath = path.join(root, "smali", "com", "signhere", "offline", "MainActivity.smali");
const jsPath = path.join(publicDir, "assets", "callup-no-zoom.js");

const JS = `(() => {
  const stop = (e) => { e.preventDefault(); };
  document.addEventListener("gesturestart", stop, { passive: false });
  document.addEventListener("gesturechange", stop, { passive: false });
  document.addEventListener("gestureend", stop, { passive: false });
  document.addEventListener("contextmenu", stop);
  let lastTouchEnd = 0;
  document.addEventListener("touchend", (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
})();
`;

fs.writeFileSync(jsPath, JS);
console.log("wrote callup-no-zoom.js");

let html = fs.readFileSync(indexPath, "utf8");
const vpOld = '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />';
const vpNew =
  '<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />';
if (html.includes(vpOld)) {
  html = html.replace(vpOld, vpNew);
  console.log("patched viewport");
} else if (!html.includes("user-scalable=no")) {
  console.error("MISS viewport meta");
  process.exit(1);
} else {
  console.log("ok viewport");
}

if (!html.includes("callup-no-zoom.js")) {
  html = html.replace(
    '<link rel="stylesheet" href="./callup-theme.css" />',
    '<link rel="stylesheet" href="./callup-theme.css" />\n    <script src="./assets/callup-no-zoom.js" defer></script>'
  );
  console.log("patched index script");
} else {
  console.log("ok index script");
}
fs.writeFileSync(indexPath, html);

const cssMark = "/*CALLUP_NO_ZOOM*/";
const cssBlock = `
${cssMark}
html, body, #root {
  -webkit-user-select: none !important;
  user-select: none !important;
  -webkit-touch-callout: none !important;
  -webkit-text-size-adjust: 100% !important;
  text-size-adjust: 100% !important;
  touch-action: pan-x pan-y !important;
  overscroll-behavior: none;
}
input, textarea, select, [contenteditable="true"] {
  -webkit-user-select: text !important;
  user-select: text !important;
}
`;

let theme = fs.readFileSync(themeSrc, "utf8");
if (!theme.includes(cssMark)) {
  theme += cssBlock;
  fs.writeFileSync(themeSrc, theme);
  console.log("patched callup-theme.css");
} else {
  console.log("ok callup-theme.css");
}
fs.copyFileSync(themeSrc, themeDst);

const smaliMark = "CALLUP_NO_ZOOM";
let smali = fs.readFileSync(smaliPath, "utf8");
const nl = smali.includes("\r\n") ? "\r\n" : "\n";
if (smali.includes(smaliMark)) {
  console.log("ok MainActivity zoom");
} else {
  const anchor =
    `    invoke-virtual {p1, v1}, Landroid/webkit/WebSettings;->setBlockNetworkLoads(Z)V${nl}${nl}    .line 36`;
  const insert = [
    "    invoke-virtual {p1, v1}, Landroid/webkit/WebSettings;->setBlockNetworkLoads(Z)V",
    "",
    `    # ${smaliMark}`,
    "    iget-object p1, p0, Lcom/signhere/offline/MainActivity;->game:Landroid/webkit/WebView;",
    "",
    "    invoke-virtual {p1}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;",
    "",
    "    move-result-object p1",
    "",
    "    invoke-virtual {p1, v2}, Landroid/webkit/WebSettings;->setSupportZoom(Z)V",
    "",
    "    iget-object p1, p0, Lcom/signhere/offline/MainActivity;->game:Landroid/webkit/WebView;",
    "",
    "    invoke-virtual {p1}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;",
    "",
    "    move-result-object p1",
    "",
    "    invoke-virtual {p1, v2}, Landroid/webkit/WebSettings;->setBuiltInZoomControls(Z)V",
    "",
    "    iget-object p1, p0, Lcom/signhere/offline/MainActivity;->game:Landroid/webkit/WebView;",
    "",
    "    invoke-virtual {p1}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;",
    "",
    "    move-result-object p1",
    "",
    "    invoke-virtual {p1, v2}, Landroid/webkit/WebSettings;->setDisplayZoomControls(Z)V",
    "",
    "    iget-object p1, p0, Lcom/signhere/offline/MainActivity;->game:Landroid/webkit/WebView;",
    "",
    "    invoke-virtual {p1}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;",
    "",
    "    move-result-object p1",
    "",
    "    const/16 v3, 0x64",
    "",
    "    invoke-virtual {p1, v3}, Landroid/webkit/WebSettings;->setTextZoom(I)V",
    "",
    "    iget-object p1, p0, Lcom/signhere/offline/MainActivity;->game:Landroid/webkit/WebView;",
    "",
    "    invoke-virtual {p1, v2}, Landroid/webkit/WebView;->setLongClickable(Z)V",
    "",
    "    iget-object p1, p0, Lcom/signhere/offline/MainActivity;->game:Landroid/webkit/WebView;",
    "",
    "    invoke-virtual {p1, v2}, Landroid/webkit/WebView;->setHapticFeedbackEnabled(Z)V",
    "",
    "    .line 36",
  ].join(nl);
  if (!smali.includes(anchor)) {
    console.error("MISS MainActivity zoom anchor");
    process.exit(1);
  }
  smali = smali.replace(anchor, insert);
  fs.writeFileSync(smaliPath, smali);
  console.log("patched MainActivity zoom");
}

console.log("webview no-zoom applied");
