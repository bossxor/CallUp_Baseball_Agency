/**
 * CallUp face identity — break SignHere silhouette.
 * 1) Always baseball jersey collar (Cf k:true)
 * 2) Club-color baseball cap on every rendered face
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const shellPath = path.join(
  root,
  "apk-src",
  "assets",
  "public",
  "assets",
  "shell-DaKdX7f1.js"
);

let js = fs.readFileSync(shellPath, "utf8");
let n = 0;

const KIT_OLD = "d&&b.push(Cf(d))";
const KIT_NEW =
  'b.push(Cf(d&&d.k?d:{k:!0,j:(d&&d.j)||g,s:(d&&d.s)||x}))/*CALLUP_FACE_KIT*/';

if (js.includes("/*CALLUP_FACE_KIT*/")) {
  console.log("face kit already");
} else if (js.includes(KIT_OLD)) {
  js = js.replace(KIT_OLD, KIT_NEW);
  n++;
  console.log("face kit → baseball collar");
} else {
  console.error("MISS kit anchor d&&b.push(Cf(d))");
  process.exit(1);
}

const CAP_MARK = "/*CALLUP_FACE_CAP*/";
const CAP_SVG = `${CAP_MARK}b.push(\`<g class="cu-cap" aria-hidden="true"><path d="M 74 122 Q 150 52 226 122 L 220 142 Q 150 88 80 142 Z" fill="\${g}"/><path d="M 150 62 L 138 118 L 162 118 Z" fill="\${ot(g,.28)}"/><circle cx="150" cy="72" r="6" fill="\${x}"/><path d="M 42 134 Q 150 102 258 134 L 252 152 Q 150 122 48 152 Z" fill="\${ot(g,.42)}"/><path d="M 48 140 Q 150 112 252 140" stroke="\${ot(g,.55)}" stroke-width="2" fill="none"/></g>\`);`;

const RET_ANCHOR =
  'return y.push(`<defs><filter id="${l}o" x="-10%" y="-10%" width="120%" height="120%"';

if (js.includes("`),return y.push(`<defs><filter id=\"${l}o\"")) {
  js = js.replace(
    "`),return y.push(`<defs><filter id=\"${l}o\"",
    "`);return y.push(`<defs><filter id=\"${l}o\""
  );
  n++;
  console.log("face cap comma→semicolon repaired");
}
if (js.includes(CAP_MARK)) {
  console.log("face cap already");
} else if (js.includes(RET_ANCHOR)) {
  js = js.replace(RET_ANCHOR, CAP_SVG + RET_ANCHOR);
  n++;
  console.log("face cap injected");
} else {
  console.error("MISS face return anchor");
  process.exit(1);
}

fs.writeFileSync(shellPath, js);
console.log("fix-ui-face-callup done", { n });
