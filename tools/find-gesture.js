const fs = require("fs");
const s = fs.readFileSync("T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js", "utf8");
const css = fs.readFileSync("T:/CallUp/apk-src/assets/public/assets/shell-DGv3wu-g.css", "utf8");

const anchors = [
  "const V=B=>{",
  "ye=(B,W)=>{",
  "Ne=()=>{",
  'points:"4,44 212,44"',
  "보고서 위쪽을 가로로 쓸어 넘겨요",
  "팩 위쪽을 가로로 그어 뜯어요",
  "보고서 위쪽을 가로로 쓸어 넘겨 주세요",
  "_e=216,w=376,Z=4,P=_e/Z+1",
  "spk-band2",
  "spk-finger",
];
for (const a of anchors) {
  const i = s.indexOf(a);
  console.log("\n===", JSON.stringify(a), i, "===");
  if (i >= 0) console.log(s.slice(i, i + Math.min(420, s.length - i)));
}

for (const a of [".spk-band2", ".spk-finger", ".spk-trail", ".spk-tip"]) {
  const i = css.indexOf(a);
  console.log("\nCSS", a, i);
  if (i >= 0) console.log(css.slice(i, i + 350));
}
