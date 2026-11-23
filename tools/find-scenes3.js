const fs = require("fs");
const s = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js",
  "utf8"
);
const i = s.indexOf("Wx=Object");
console.log(JSON.stringify(s.slice(i, i + 800)));
const j = s.indexOf("className:\"sc ");
console.log("sc ", j, JSON.stringify(s.slice(j, j + 200)));
const k = s.indexOf('className:`sc');
console.log("sc`", k, JSON.stringify(s.slice(k, k + 200)));
for (const p of ["sc-scene", "scene-art", "sty-bg", "ev-bg", "bgurl", "Gx("]) {
  console.log(p, s.indexOf(p));
}
// find function that sets scene background style
const m = s.match(/style:\{[^}]{0,40}background[^}]{0,80}\}/g);
console.log("styles", (m || []).slice(0, 15));
