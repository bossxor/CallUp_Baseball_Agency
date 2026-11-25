/** Replace soccer Best11 pitch SVG with a baseball diamond wireframe. */
const fs = require("node:fs");
const path = require("node:path");

const root = process.argv[2] ?? path.join(__dirname, "../apk-src");
const shell = path.join(root, "assets/public/assets/shell-DaKdX7f1.js");
const themeSrc = path.join(__dirname, "callup-theme.css");
const themeDst = path.join(root, "assets/public/callup-theme.css");
const marker = "/*CALLUP_BASEBALL_PITCH_SVG*/";

const oldChildren =
  'children:[e.jsx("rect",{className:"f",x:"8",y:"6",width:"344",height:"428",rx:"14"}),e.jsx("path",{d:"M8 220 H352"}),e.jsx("circle",{cx:"180",cy:"220",r:"40"}),e.jsx("rect",{className:"f2",x:"92",y:"6",width:"176",height:"66"}),e.jsx("rect",{x:"138",y:"6",width:"84",height:"24"}),e.jsx("path",{d:"M150 72 A32 32 0 0 0 210 72"}),e.jsx("rect",{className:"f2",x:"92",y:"368",width:"176",height:"66"}),e.jsx("rect",{x:"138",y:"410",width:"84",height:"24"}),e.jsx("path",{d:"M150 368 A32 32 0 0 1 210 368"})]';

const newChildren =
  'children:[e.jsx("rect",{className:"f",x:"8",y:"6",width:"344",height:"428",rx:"14"}),e.jsx("path",{d:"M180 400 L48 255 L180 110 L312 255 Z"}),e.jsx("path",{d:"M180 110 Q270 185 330 255 Q270 325 180 400 Q90 325 30 255 Q90 185 180 110 Z",opacity:.35}),e.jsx("circle",{cx:"180",cy:"255",r:"16"}),e.jsx("circle",{cx:"180",cy:"110",r:"5"}),e.jsx("circle",{cx:"48",cy:"255",r:"5"}),e.jsx("circle",{cx:"312",cy:"255",r:"5"}),e.jsx("circle",{cx:"180",cy:"400",r:"5"}),e.jsx("path",{d:"M172 408 L180 396 L188 408 Z"})]';

let source = fs.readFileSync(shell, "utf8");
if (source.includes(marker)) {
  console.log("b11-pitch already baseball.");
} else {
  if (!source.includes(oldChildren)) throw Error("Soccer b11-pitch children missing");
  // Only rewrite the pitch that sits on the Best11 svg.
  const anchor = 'className:"b11-pitch",viewBox:"0 0 360 440",preserveAspectRatio:"none","aria-hidden":"true",';
  const at = source.indexOf(anchor);
  if (at < 0) throw Error("b11-pitch svg anchor missing");
  const before = source.slice(0, at + anchor.length);
  const after = source.slice(at + anchor.length);
  if (!after.startsWith(oldChildren)) throw Error("b11-pitch children not adjacent to svg props");
  source = before + newChildren + after.slice(oldChildren.length);
  fs.writeFileSync(shell, source.trimEnd() + "\n" + marker + "\n");
  console.log("Baseball diamond SVG applied to b11-pitch.");
}

const cssMark = "/*CALLUP_BASEBALL_DIAMOND_CSS*/";
for (const theme of [themeDst, themeSrc]) {
  if (!fs.existsSync(theme)) continue;
  let css = fs.readFileSync(theme, "utf8");
  if (css.includes(cssMark)) {
    console.log("Diamond CSS already in", path.basename(theme));
    continue;
  }
  css += `

${cssMark}
.b11-pitch rect.f { opacity: 0.28; }
`;
  fs.writeFileSync(theme, css);
  console.log("Diamond CSS appended to", path.basename(theme));
}
