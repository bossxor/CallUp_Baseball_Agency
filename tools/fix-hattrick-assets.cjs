const fs = require("fs");
const path = require("path");
const dir = path.join(
  __dirname,
  "..",
  "apk-src",
  "assets",
  "public",
  "assets"
);
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".js")) continue;
  const p = path.join(dir, f);
  let s = fs.readFileSync(p, "utf8");
  if (!s.includes("hattrick")) continue;
  const before = (s.match(/hattrick/g) || []).length;
  s = s.split("tm_hattrick_ball").join("tm_multi_ball");
  s = s.split("hattrick").join("multi");
  fs.writeFileSync(p, s);
  console.log(f, before, "->", (s.match(/hattrick/g) || []).length);
}
