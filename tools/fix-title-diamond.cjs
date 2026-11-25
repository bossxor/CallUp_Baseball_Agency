/** Replace title-screen soccer pitch wireframe with a baseball diamond. */
const fs = require("node:fs");
const path = require("node:path");

const root = process.argv[2] ?? path.join(__dirname, "../apk-src");
const index = path.join(root, "assets/public/assets/index-B5T0JNgO.js");
const marker = "/*CALLUP_TITLE_DIAMOND*/";

const oldGeo =
  '_.jsxs("g",{fill:"none",stroke:"var(--line2)",strokeWidth:"1.2",children:[_.jsx("polyline",{points:"110,0 280,0"}),_.jsx("line",{x1:"110",y1:"0",x2:"-170",y2:"370"}),_.jsx("line",{x1:"280",y1:"0",x2:"560",y2:"370"}),_.jsx("line",{x1:"36",y1:"100",x2:"354",y2:"100"}),_.jsx("ellipse",{cx:"195",cy:"100",rx:"56",ry:"16"}),_.jsx("polyline",{points:"-24,370 18,296 372,296 414,370"}),_.jsx("path",{d:"M150 296 Q195 268 240 296"}),_.jsx("polyline",{points:"164,0 170,7 220,7 226,0"})]}),_.jsx("circle",{cx:"195",cy:"100",r:"2",fill:"var(--sub)"})';

const newGeo =
  '_.jsxs("g",{fill:"none",stroke:"var(--line2)",strokeWidth:"1.2",children:[_.jsx("path",{d:"M195 320 L70 200 L195 80 L320 200 Z"}),_.jsx("path",{d:"M195 80 Q280 140 350 200 Q280 260 195 320 Q110 260 40 200 Q110 140 195 80"}),_.jsx("circle",{cx:"195",cy:"200",r:"14"}),_.jsx("circle",{cx:"195",cy:"80",r:"3"}),_.jsx("circle",{cx:"70",cy:"200",r:"3"}),_.jsx("circle",{cx:"320",cy:"200",r:"3"}),_.jsx("circle",{cx:"195",cy:"320",r:"3"}),_.jsx("path",{d:"M188 328 L195 316 L202 328 Z"})]}),_.jsx("circle",{cx:"195",cy:"200",r:"2",fill:"var(--sub)"})';

let source = fs.readFileSync(index, "utf8");
if (source.includes(marker)) {
  console.log("Title diamond already applied.");
  process.exit(0);
}
if (!source.includes(oldGeo)) throw Error("Title soccer pitch geometry missing");
source = source.replace(oldGeo, newGeo);
fs.writeFileSync(index, source.trimEnd() + "\n" + marker + "\n");
console.log("Title screen baseball diamond applied.");
