const fs = require("fs");
const s = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js",
  "utf8"
);
const keys = [
  "치트",
  "PersonalCheats",
  "personal-cheats",
  "단장",
  "인내심",
  "offlineCheat",
  "offlinePatience99",
  "children: \"치트\"",
  'aria-label": "치트"',
];
for (const k of keys) {
  let i = 0;
  let c = 0;
  while ((i = s.indexOf(k, i)) >= 0) {
    c++;
    if (c <= 3) {
      console.log(
        k,
        i,
        JSON.stringify(s.slice(Math.max(0, i - 50), i + k.length + 80))
      );
    }
    i += k.length;
  }
  console.log(k, "count", c);
}
