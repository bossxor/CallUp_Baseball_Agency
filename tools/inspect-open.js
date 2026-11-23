const fs = require("fs");
const s = fs.readFileSync("T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js", "utf8");
const i = s.indexOf("function Vc({m:s");
const chunk = s.slice(i, i + 20000);

// dump key handlers after Ne
const keys = ["Ne=()=>{", "Ls=", "qe=", "is=", "finished", 'm("pick"', "m(\"pick\"", "m(\"cut\"", "spk-lid", "cut", "openPack", "Q=", "Y.current.finished"];
for (const k of keys) {
  let c = 0, j = 0;
  while ((j = chunk.indexOf(k, j)) >= 0) { c++; j += k.length; }
  console.log(JSON.stringify(k), c);
}

function dump(needle, n = 800) {
  const x = chunk.indexOf(needle);
  console.log("\n===", needle, x, "===");
  if (x >= 0) console.log(chunk.slice(x, x + n));
}

dump("Ne=()=>{");
dump("const Ls=");
dump("Ls=()=>{");
dump("qe=B=>{");
dump("is=B=>{");
dump('m("pick"');
dump("finished:!1");

// current V/ye/P
dump("_e=216,w=376");
dump("const V=B=>{");
dump("ye=(B,W)=>{");
dump('points:"108,340');
dump("보고서 아래쪽");
