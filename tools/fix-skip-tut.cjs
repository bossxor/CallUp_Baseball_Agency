/**
 * Personal/CallUp: never block on nego / tip tutorials.
 * Marks nego tip as already seen so pnego overlay never mounts.
 */
const fs = require("fs");
const path = require("path");
const shell = path.join(
  __dirname,
  "..",
  "apk-src",
  "assets",
  "public",
  "assets",
  "shell-DaKdX7f1.js"
);
let s = fs.readFileSync(shell, "utf8");
const pairs = [
  // never start pnego / force-nego path
  ['!jc(t,"nego")', "!1"],
  // tut foot always has next (no pure wait-only block) — keep act waits but allow skip via smoke
];
let n = 0;
for (const [a, b] of pairs) {
  const c = s.split(a).length - 1;
  if (!c) {
    console.log("MISS", a);
    continue;
  }
  s = s.split(a).join(b);
  n += c;
  console.log("patched", c, "x", a.slice(0, 40));
}
// Auto-mark tips.nego when tutDone flips true (home tut finish)
const needle =
  'G==="new"||G==="pro"?(R().tutDone=!0,ua(R(),"scout"),xe("home"))';
const repl =
  'G==="new"||G==="pro"?(R().tutDone=!0,ua(R(),"scout"),ua(R(),"nego"),xe("home"))';
if (s.includes(needle)) {
  s = s.replace(needle, repl);
  n++;
  console.log("patched tutDone+nego tip");
} else if (s.includes(repl)) {
  console.log("already tutDone+nego tip");
} else {
  console.log("MISS tutDone onDone");
}
fs.writeFileSync(shell, s);
console.log("fix-skip-tut done", n);
