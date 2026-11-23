const fs = require("fs");
const s = fs.readFileSync("T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js", "utf8");
// dump more of tear open / after cut UI classes
const i = s.indexOf("function Vc({m:s");
const chunk = s.slice(i, i + 12000);
for (const k of ["cut", "open", "spk-", "className:`pk", "className:\"pk-", "reveal", "fan", "deal"]) {
  let c = 0,
    j = 0;
  while ((j = chunk.indexOf(k, j)) >= 0) {
    c++;
    j += k.length;
  }
  console.log(k, c);
}
// find JSX return of Vc when u==="cut"
const j = chunk.indexOf('u==="cut"');
console.log("cut branch", j);
console.log(chunk.slice(j, j + 1800));
const j2 = chunk.indexOf('u!=="cut"');
console.log("\nnot cut", j2);
console.log(chunk.slice(j2, j2 + 900));
