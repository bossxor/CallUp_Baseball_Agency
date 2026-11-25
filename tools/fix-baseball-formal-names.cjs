/** Map informal 1군/2군 labels to official league abbreviations. */
const fs = require("node:fs");
const path = require("node:path");

const root = process.argv[2] ?? path.join(__dirname, "../apk-src");
const assets = path.join(root, "assets/public/assets");
const marker = "/*CALLUP_BASEBALL_FORMAL_NAMES*/";

const renames = [
  ["한국 1군", "KBO"],
  ["한국 2군", "KBO 퓨처스"],
  ["일본 1군", "NPB"],
  ["일본 2군", "NPB 2군"],
  ["대만 1군", "CPBL"],
  ["미국 메이저", "MLB"],
  ["미국 마이너", "MiLB"],
];

const localeValueRenames = [
  ["Korea First Team", "KBO"],
  ["Korea Second Team", "KBO Futures"],
  ["Japan First Team", "NPB"],
  ["Japan Second Team", "NPB Farm"],
  ["Taiwan First Team", "CPBL"],
  ["US Major League", "MLB"],
  ["US Minor League", "MiLB"],
  ["Corea · primer equipo", "KBO"],
  ["Corea · segundo equipo", "KBO Futures"],
  ["Japón · primer equipo", "NPB"],
  ["Japón · segundo equipo", "NPB Farm"],
  ["Taiwán · primer equipo", "CPBL"],
  ["EE. UU. · liga mayor", "MLB"],
  ["EE. UU. · liga menor", "MiLB"],
];

function applyPairs(source, pairs) {
  let out = source;
  for (const [old, next] of pairs) {
    if (out.includes(old)) out = out.split(old).join(next);
  }
  return out;
}

const saveRewrites = [
  [String.raw`.replace(/한국 1군/g,"KBO")`, String.raw`.replace(/한국 1군/g,"KBO")
    .replace(/한국 2군/g,"KBO 퓨처스")
    .replace(/일본 1군/g,"NPB")
    .replace(/일본 2군/g,"NPB 2군")
    .replace(/대만 1군/g,"CPBL")
    .replace(/미국 메이저/g,"MLB")
    .replace(/미국 마이너/g,"MiLB")`],
];

function patchFile(file) {
  const target = path.join(assets, file);
  if (!fs.existsSync(target)) return false;
  let source = fs.readFileSync(target, "utf8");
  if (source.includes(marker)) return false;

  if (file.startsWith("engine-")) {
    const cuts = [
      "/*CALLUP_BASEBALL_SAVE_COPY*/",
      "/*CALLUP_BASEBALL_EVENT_COPY*/",
    ]
      .map((m) => source.indexOf(m))
      .filter((i) => i >= 0);
    const cut = cuts.length ? Math.min(...cuts) : -1;
    if (cut >= 0) {
      let head = applyPairs(source.slice(0, cut), renames);
      let tail = source.slice(cut);
      for (const [old, next] of saveRewrites) {
        if (tail.includes(old) && !tail.includes('.replace(/일본 1군/g,"NPB")')) {
          tail = tail.replace(old, next);
        }
      }
      source = head + tail;
    } else {
      source = applyPairs(source, renames);
    }
  } else {
    source = applyPairs(source, [...renames, ...localeValueRenames]);
  }

  fs.writeFileSync(target, source.trimEnd() + "\n" + marker + "\n");
  return true;
}

const files = fs.readdirSync(assets).filter((f) => f.endsWith(".js"));
let n = 0;
for (const file of files) if (patchFile(file)) n++;
console.log(`Formal baseball league names applied in ${n} files (KBO/NPB/CPBL/MLB/MiLB).`);
