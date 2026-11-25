/** Turn the leftover soccer-ball glyph into a baseball, and point scout POS at it. */
const fs = require("node:fs");
const path = require("node:path");

const root = process.argv[2] ?? path.join(__dirname, "../apk-src");
const shell = path.join(root, "assets/public/assets/shell-DaKdX7f1.js");
const marker = "/*CALLUP_BASEBALL_BALL_ICON*/";

const oldPath =
  'ball:"M12 3 A9 9 0 1 1 12 21 A9 9 0 1 1 12 3 Z M12 8.3 L15.5 10.9 L14.2 15 H9.8 L8.5 10.9 Z M12 8.3 V3.4 M15.5 10.9 L20.3 9.5 M14.2 15 L17.1 19 M9.8 15 L6.9 19 M8.5 10.9 L3.7 9.5"';
const newPath =
  'ball:"M12 3 A9 9 0 1 1 12 21 A9 9 0 1 1 12 3 Z M6.2 5.8 C9.2 9.2 9.2 14.8 6.2 18.2 M17.8 5.8 C14.8 9.2 14.8 14.8 17.8 18.2"';

const oldPos = 'name:{region:"globe",pos:"ball",age:"cake",grade:"star"}';
// keep pos:"ball" once the glyph itself is baseball

let source = fs.readFileSync(shell, "utf8");
if (source.includes(marker)) {
  console.log("Baseball ball icon already applied.");
  process.exit(0);
}
if (!source.includes(oldPath)) throw Error("Soccer ball icon path missing");
source = source.replace(oldPath, newPath);
if (!source.includes(oldPos)) {
  console.warn("Scout pos map already changed; icon path still updated.");
}
fs.writeFileSync(shell, source.trimEnd() + "\n" + marker + "\n");
console.log("Soccer ball glyph → baseball stitches.");
