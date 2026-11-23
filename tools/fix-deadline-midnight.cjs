/**
 * Baseball flavor: transfer deadline at midnight (24:00), not soccer 23:00.
 */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..", "apk-src", "assets", "public", "assets");
const eng = path.join(root, "engine-DhPc-c_J.js");
const shell = path.join(root, "shell-DaKdX7f1.js");

let e = fs.readFileSync(eng, "utf8");
let n = 0;
if (e.includes("const W5=9,Kt=23,")) {
  e = e.split("const W5=9,Kt=23,").join("const W5=9,Kt=24,");
  n++;
  console.log("Kt 23→24");
} else if (e.includes("const W5=9,Kt=24,")) console.log("Kt already 24");
else console.log("MISS Kt");

const copies = [
  ["오늘 밤 11시에 영입시장이 닫혀요", "오늘 밤 12시에 영입시장이 닫혀요"],
  ["오늘 밤 11시에 영입시장이 닫혀요. 아직 조용해요", "오늘 밤 12시에 영입시장이 닫혀요. 아직 조용해요"],
];
for (const [a, b] of copies) {
  const c = e.split(a).length - 1;
  if (!c) {
    console.log("MISS eng", a.slice(0, 20));
    continue;
  }
  e = e.split(a).join(b);
  n += c;
  console.log("eng copy", c);
}
fs.writeFileSync(eng, e);

let s = fs.readFileSync(shell, "utf8");
const shellCopies = [
  ["오늘 밤 11시 영입시장 마감", "오늘 밤 12시 영입시장 마감"],
  ["밤 11시 전에 서류까지 끝내요.", "밤 12시 전에 서류까지 끝내요."],
];
for (const [a, b] of shellCopies) {
  const c = s.split(a).length - 1;
  if (!c) {
    console.log("MISS shell", a.slice(0, 20));
    continue;
  }
  s = s.split(a).join(b);
  n += c;
  console.log("shell copy", c);
}
fs.writeFileSync(shell, s);
console.log("fix-deadline-midnight done", n);
