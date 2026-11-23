const fs = require("fs");
const s = fs.readFileSync("T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js", "utf8");
const css = fs.readFileSync("T:/CallUp/apk-src/assets/public/assets/shell-DGv3wu-g.css", "utf8");

function dump(needle, before = 80, after = 700) {
  const i = s.indexOf(needle);
  console.log("\n===", JSON.stringify(needle), "at", i, "===");
  if (i >= 0) console.log(s.slice(Math.max(0, i - before), i + after));
}
function dumpCss(needle, after = 900) {
  const i = css.indexOf(needle);
  console.log("\n=== CSS", JSON.stringify(needle), "at", i, "===");
  if (i >= 0) console.log(css.slice(i, i + after));
}

dump("function Vc");
dump("const Vc=");
dump("Vc=function");
dump("function qu");
dump("sr-pk");
dump("className:`pk");
dump("spk-sig");
dump("ti-sig");

for (const k of [".sr-pk", ".spk", ".pk-open", ".pack", "pkOpen", "srOpen", "@keyframes pk", "@keyframes deal", "@keyframes flip", ".paper", "pageTurn"]) {
  dumpCss(k, 600);
}
