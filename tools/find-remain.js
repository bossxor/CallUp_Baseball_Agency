const fs = require("fs");
const s = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/engine-DhPc-c_J.js",
  "utf8"
);
for (const p of ['"GK"', '"DF"', '"MF"', '"FW"', ".gk", "gk:", '"gk"']) {
  let i = 0;
  let c = 0;
  while ((i = s.indexOf(p, i)) >= 0 && c < 8) {
    console.log(p, i, JSON.stringify(s.slice(i - 30, i + p.length + 40)));
    i += p.length;
    c++;
  }
  console.log(p, "total", s.split(p).length - 1);
}

// Find KI / parse save
const k = s.indexOf("KI=");
console.log("\nKI", s.slice(k, k + 500));
const k2 = s.indexOf("function KI");
console.log("fn KI", k2);
// export alias
const k3 = s.search(/KI\s*=\s*function|function\s*\w*\s*\([^)]*\)[^{]*\{[^}]*agency/);
