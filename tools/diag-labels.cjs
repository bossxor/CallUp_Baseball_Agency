const fs = require("fs");
const path = require("path");
const assets = path.join(__dirname, "..", "apk-src", "assets", "public", "assets");

function snip(s, needle, w = 80) {
  const i = s.indexOf(needle);
  if (i < 0) return null;
  return s.slice(Math.max(0, i - 40), i + needle.length + w);
}

for (const f of ["engine-DhPc-c_J.js", "shell-DaKdX7f1.js"]) {
  const s = fs.readFileSync(path.join(assets, f), "utf8");
  console.log("===", f);
  for (const k of [
    "Ss={",
    "Rt={",
    'P:"',
    "투수",
    "포수",
    "타격",
    "투구",
    "수비",
    "체력",
    "스피드",
    "속력",
    "pac:",
    "sho:",
    "bat:",
    "pit:",
    "fld:",
    "phy:",
    "spd:",
    'Yo=',
    "function Yo",
    'GK:',
    'DF:',
  ]) {
    const hit = snip(s, k);
    if (hit) console.log(k, "→", hit.replace(/\n/g, " ").slice(0, 120));
  }
}
