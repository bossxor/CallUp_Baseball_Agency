/**
 * Phase A: replace soccer-readable scene webps with nearby neutral baseball-office art.
 * Same hashed filenames so shell imports keep working.
 */
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "T:/CallUp/apk-src";
const dir = path.join(root, "assets/public/assets");

const swaps = [
  // soccer-forward → neutral / diamond-adjacent
  ["goal-BsdxeQ8h.webp", "stadium-aNDQ45iG.webp"],
  ["goal-bg-jM0lj6E_.webp", "stadium-aNDQ45iG.webp"],
  ["shootout-CQAYG6MO.webp", "training-IFqjAQlg.webp"],
  ["adshoot-CyAuPWax.webp", "press-OvdAyDZ8.webp"],
  ["court-CviIAXVd.webp", "park-C4VF5vsp.webp"],
];

for (const [dest, src] of swaps) {
  const from = path.join(dir, src);
  const to = path.join(dir, dest);
  if (!fs.existsSync(from) || !fs.existsSync(to)) {
    console.warn("skip missing", dest, src);
    continue;
  }
  fs.copyFileSync(from, to);
  console.log("scene swap", dest, "<=", src);
}
console.log("patch-scenes done");
