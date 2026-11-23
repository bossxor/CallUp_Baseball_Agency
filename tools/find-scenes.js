const fs = require("fs");
const s = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js",
  "utf8"
);
for (const key of [
  "goal-BsdxeQ8h",
  "shootout-CQAY",
  "adshoot-CyAu",
  "agency-Cis",
  "office-o22",
  "stadium-aND",
]) {
  const i = s.indexOf(key);
  console.log(key, i, JSON.stringify(s.slice(Math.max(0, i - 100), i + 90)));
}
const keys = ["sc-bg", "scene-bg", "bg-scene", "className:\"bg\"", "backgroundImage"];
for (const k of keys) {
  console.log(k, s.split(k).length - 1);
}
