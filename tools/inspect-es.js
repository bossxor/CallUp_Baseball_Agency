const fs = require("fs");
const s = fs.readFileSync("T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js", "utf8");
const css = fs.readFileSync("T:/CallUp/apk-src/assets/public/assets/shell-DGv3wu-g.css", "utf8");
const i = s.indexOf("function Vc({m:s");
const chunk = s.slice(i, i + 12000);
const es = chunk.indexOf("es=B=>{");
console.log(chunk.slice(es, es + 2200));
console.log("\n--- cutting css ---");
for (const k of [".cutting", ".spk.cut", "spk-top", "tear", "spk-open"]) {
  const x = css.indexOf(k);
  console.log(k, x);
  if (x >= 0) console.log(css.slice(x, x + 400));
}
