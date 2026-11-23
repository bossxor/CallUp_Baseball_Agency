const fs = require("fs");
const p = "T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js";
let s = fs.readFileSync(p, "utf8");
let i = 0,
  n = 0;
while ((i = s.indexOf("st.goals", i)) >= 0 && n < 10) {
  console.log(s.slice(i - 50, i + 40));
  i += 8;
  n++;
}
n = 0;
i = 0;
while ((i = s.indexOf("st.ast", i)) >= 0 && n < 10) {
  console.log("ast", s.slice(i - 50, i + 40));
  i += 6;
  n++;
}
const pairs = [
  ["st.goals", "st.h"],
  ["st.ast", "st.rbi"],
  [".goals", null], // too broad — skip
];
for (const [a, b] of pairs) {
  if (!b) continue;
  const c = s.split(a).length - 1;
  if (c) {
    s = s.split(a).join(b);
    console.log("fixed", a, c);
  }
}
fs.writeFileSync(p, s);
