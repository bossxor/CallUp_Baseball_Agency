const fs = require("fs");
const s = fs.readFileSync("T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js", "utf8");
const css = fs.readFileSync("T:/CallUp/apk-src/assets/public/assets/shell-DGv3wu-g.css", "utf8");

// Bu logo const
for (const needle of ["Bu=", "const Bu", "Bu=", "spk-logo", 'src:Bu']) {
  const i = s.indexOf(needle);
  console.log(needle, i);
  if (i >= 0) console.log(s.slice(Math.max(0, i - 40), i + 200));
}

// Vc state machine cut/open
const i = s.indexOf("function Vc({m:s");
console.log("\n=== Vc body excerpt ===");
console.log(s.slice(i, i + 3500));

// TEAR / open anim classes
for (const k of ["TEAR TO OPEN", "spk-open", "u===\"cut\"", 'u==="cut"', 'm("cut"', 'm("open"', "legendIn", "spk-lid"]) {
  let c = 0,
    j = 0;
  while ((j = s.indexOf(k, j)) >= 0) {
    c++;
    j += k.length;
  }
  console.log(JSON.stringify(k), c);
}

dumpCss = (n, a = 1500) => {
  const x = css.indexOf(n);
  console.log("\nCSS", n, x);
  if (x >= 0) console.log(css.slice(x, x + a));
};
dumpCss(".spk-body");
dumpCss("@keyframes spk");
dumpCss(".spk-lid");
