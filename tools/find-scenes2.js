const fs = require("fs");
const s = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js",
  "utf8"
);
const i = s.indexOf("backgroundImage");
console.log("bgImg", JSON.stringify(s.slice(i - 80, i + 200)));
const j = s.indexOf("M_="); // goal const from earlier - actually M_ after goal
// find scene map like goal:M_ or "goal":
for (const key of ["goal:", '"goal"', "shootout", "adshoot", "scene:"]) {
  let idx = 0;
  let c = 0;
  while ((idx = s.indexOf(key, idx)) >= 0 && c < 3) {
    console.log(key, idx, JSON.stringify(s.slice(idx, idx + 120)));
    idx += key.length;
    c++;
  }
}
// look for object assigning webp hrefs
const k = s.indexOf("u_=\"\"+new URL");
console.log("block", JSON.stringify(s.slice(k, k + 2500)).slice(0, 2000));
