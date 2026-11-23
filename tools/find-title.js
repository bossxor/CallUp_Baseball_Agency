const fs = require("fs");
const shell = fs.readFileSync("T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js", "utf8");
const idx = fs.readFileSync("T:/CallUp/apk-src/assets/public/assets/index-B5T0JNgO.js", "utf8");
const css = fs.readFileSync("T:/CallUp/apk-src/assets/public/assets/shell-DGv3wu-g.css", "utf8");

for (const [name, s] of [
  ["index", idx],
  ["shell", shell],
]) {
  for (const k of ["ti-sig", "ti-swoosh", "Call Up", "BASEBALL", "className:\"ti", "emblem"]) {
    let c = 0,
      i = 0;
    while ((i = s.indexOf(k, i)) >= 0) {
      c++;
      i += k.length;
    }
    console.log(name, JSON.stringify(k), c);
  }
}

const i = idx.indexOf('children:"Call Up"');
console.log("\n=== title block ===");
console.log(idx.slice(Math.max(0, i - 200), i + 500));

const j = shell.indexOf("function Vc({m:s");
const chunk = shell.slice(j, j + 15000);
// tear gesture Y range
for (const k of ["clientY", "44", "14", "84", "Ne=", "ys:", "spk-band2", "spk-trail"]) {
  const x = chunk.indexOf(k);
  console.log("Vc", k, x);
}
console.log("\n=== Ne tear check ===");
const ne = chunk.indexOf("Ne=()=>{");
console.log(chunk.slice(ne, ne + 400));
console.log("\n=== V pointer ===");
const v = chunk.indexOf("const V=B=>{");
console.log(chunk.slice(v, v + 350));

for (const k of [".ti-sig", ".ti-swoosh", ".ti-logo", ".title"]) {
  const x = css.indexOf(k);
  console.log("css", k, x);
  if (x >= 0) console.log(css.slice(x, x + 280));
}
