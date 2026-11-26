/**
 * Formal region names only — drop "수원 1" style suffixes / dups.
 */
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || path.join(__dirname, "..", "apk-src");
const assets = path.join(root, "assets", "public", "assets");
const engPath = path.join(assets, "engine-DhPc-c_J.js");
const shellPath = path.join(assets, "shell-DaKdX7f1.js");
const dataPath = path.join(__dirname, "..", "data", "callup-clubs.json");

const FORMAL = [
  ...new Set(
    Object.values(JSON.parse(fs.readFileSync(dataPath, "utf8")).markets).flatMap(
      (m) => m.clubs
    )
  ),
];

let eng = fs.readFileSync(engPath, "utf8");
const MARK_VW = "/*CALLUP_FORMAL_VW*/";
const MARK_LOAD = "/*CALLUP_FORMAL_LOAD*/";
const MARK_CHEAT = "/*CALLUP_FORMAL_CHEAT*/";

if (!eng.includes(MARK_VW)) {
  const oldVw =
    'function vw(x){let e=wc[x];for(let t=0;!e||au.has(e);t++)e=t<4?nu(x,t):nu(x,0)+" "+(t-2);return au.add(e),e}';
  const newVw =
    MARK_VW +
    "function vw(x){let e=wc[x]||x;e=String(e).replace(/\\s+\\d+$/u,\"\").replace(/(\\D)\\d+$/u,\"$1\").trim()||String(x);if(au.has(e))return e;au.add(e);return e}";
  if (!eng.includes(oldVw)) {
    console.error("MISS vw()");
    process.exit(1);
  }
  eng = eng.replace(oldVw, newVw);
  console.log("patched vw");
} else console.log("ok vw");

if (!eng.includes(MARK_LOAD)) {
  const oldLoad = "return PE(l),j9(l),_I(l),callupAssertBaseball(l),l}";
  const scrub =
    "for(const _c of(Array.isArray(l.clubs)?l.clubs:[])){if(_c&&_c.name)_c.name=String(_c.name).replace(/\\s+\\d+$/u,\"\").replace(/(\\D)\\d+$/u,\"$1\").trim()}";
  const newLoad = scrub + MARK_LOAD + ";" + oldLoad;
  if (!eng.includes(oldLoad)) {
    console.error("MISS load return");
    process.exit(1);
  }
  eng = eng.replace(oldLoad, newLoad);
  console.log("patched load scrub");
} else console.log("ok load");

fs.writeFileSync(engPath, eng);

let shell = fs.readFileSync(shellPath, "utf8");
if (!shell.includes(MARK_CHEAT)) {
  const start = shell.indexOf("/*CALLUP_CHEAT_CLUB_LIST*/");
  const end = shell.indexOf("    return [", start);
  if (start < 0 || end < 0) {
    console.error("MISS cheat club block");
    process.exit(1);
  }
  const block =
    `/*CALLUP_CHEAT_CLUB_LIST*/ ${MARK_CHEAT} const query = clubQuery.trim().toLocaleLowerCase();\n` +
    `    const formal = new Set(${JSON.stringify(FORMAL)});\n` +
    `    const clubs = [];\n` +
    `    const seen = new Set();\n` +
    `    if (player) {\n` +
    `      for (const club of game.clubs) {\n` +
    `        if (club.id === player.club) continue;\n` +
    `        let name = Te(club);\n` +
    `        name = String(name).replace(/\\s+\\d+$/u, \"\").replace(/(\\D)\\d+$/u, \"$1\").trim();\n` +
    `        if (!formal.has(name) || seen.has(name)) continue;\n` +
    `        if (query && !name.toLocaleLowerCase().includes(query)) continue;\n` +
    `        seen.add(name);\n` +
    `        clubs.push([String(club.id), name]);\n` +
    `        if (clubs.length === 60) break;\n` +
    `      }\n` +
    `    }\n`;
  shell = shell.slice(0, start) + block + shell.slice(end);
  fs.writeFileSync(shellPath, shell);
  console.log("patched cheat list", FORMAL.length);
} else console.log("ok cheat list");

console.log("formal club names done");
