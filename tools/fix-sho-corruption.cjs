const fs = require("fs");
const path = require("path");
const assets = path.join(
  __dirname,
  "..",
  "apk-src",
  "assets",
  "public",
  "assets"
);

function fix(file) {
  let s = fs.readFileSync(file, "utf8");
  const before = s;
  // undo .sho → .bat damage inside longer identifiers
  const pairs = [
    ["J.batp", "J.shop"],
    [".batp", ".shop"], // property access
    ["batp.", "shop."],
    // .sho → .bat also breaks .shot / .short if any
    [".batt", ".shot"],
    [".batrt", ".short"],
    // .pac → .spd would break .pack → .spdk
    [".spdk", ".pack"],
    ["J.spdk", "J.pack"],
  ];
  let n = 0;
  for (const [a, b] of pairs) {
    const c = s.split(a).length - 1;
    if (!c) continue;
    s = s.split(a).join(b);
    n += c;
    console.log(path.basename(file), a, "->", b, c);
  }
  if (s !== before) fs.writeFileSync(file, s);
  return n;
}

let total = 0;
for (const f of fs.readdirSync(assets)) {
  if (!f.endsWith(".js")) continue;
  total += fix(path.join(assets, f));
}
console.log("total fixes", total);

// verify
const eng = fs.readFileSync(path.join(assets, "engine-DhPc-c_J.js"), "utf8");
console.log("J.shop", eng.includes("J.shop.rareDiv") || eng.includes("J.shop"));
console.log("J.batp left", eng.includes("J.batp"));
console.log("shop:Cw", eng.includes("shop:Cw"));
