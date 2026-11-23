/**
 * Replace registration logo SVGs (Xs) to match baseball Oc labels.
 * Also dedupe callupBaseball1 stamp; soft-purge Football→Baseball in cards.
 */
const fs = require("fs");
const path = require("path");

const shellPath = path.join(
  __dirname,
  "..",
  "apk-src",
  "assets",
  "public",
  "assets",
  "shell-DaKdX7f1.js"
);
let s = fs.readFileSync(shellPath, "utf8");

const start = s.indexOf("function Xs({n:s,size:t})");
const end = s.indexOf('return e.jsx("svg",{width:t,height:t,viewBox:"0 0 40 40"', start);
if (start < 0 || end < 0) {
  console.error("Xs bounds miss", start, end);
  process.exit(1);
}
const retEnd = s.indexOf("})}", end) + 3; // end of return e.jsx(...)}

const neu = `function Xs({n:s,size:t}){const a=p.useId().replace(/[^a-zA-Z0-9]/g,""),r=(i,o)=>e.jsxs("linearGradient",{id:\`\${a}b\`,x1:"0",y1:"0",x2:"0",y2:"1",children:[e.jsx("stop",{offset:"0",stopColor:i}),e.jsx("stop",{offset:"1",stopColor:o})]}),c=\`url(#\${a}b)\`;let l;switch(s){case 0:l=e.jsxs(e.Fragment,{children:[e.jsx("defs",{children:r("#2F7D4A","#1B4D2E")}),e.jsx("path",{d:"M20 4 L36 20 L20 36 L4 20 Z",fill:c}),e.jsx("path",{d:"M20 10 L30 20 L20 30 L10 20 Z",fill:"none",stroke:"rgba(255,255,255,.45)",strokeWidth:"1.4"}),e.jsx("circle",{cx:"20",cy:"20",r:"3.2",fill:"#F4F1EA"})]});break;case 1:l=e.jsxs(e.Fragment,{children:[e.jsx("defs",{children:r("#C9922E","#8A6420")}),e.jsx("path",{d:"M10 12c0-6 5-9 10-9s10 3 10 9c0 4-2 7-5 9l-5 11-5-11c-3-2-5-5-5-9Z",fill:c}),e.jsx("path",{d:"M14 14c1.5-2 4-3 6-3s4.5 1 6 3",fill:"none",stroke:"#F7F0DE",strokeWidth:"1.6",strokeLinecap:"round"}),e.jsx("path",{d:"M20 22v8",fill:"none",stroke:"#F7F0DE",strokeWidth:"1.6",strokeLinecap:"round"})]});break;case 2:l=e.jsxs(e.Fragment,{children:[e.jsx("defs",{children:r("#E8E1CF","#C2B89A")}),e.jsx("circle",{cx:"16",cy:"22",r:"11",fill:c,stroke:"#2A2A2A",strokeWidth:"1"}),e.jsx("path",{d:"M9 16c3 2 5 6 5 11M23 16c-3 2-5 6-5 11",fill:"none",stroke:"#C45C4A",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M22 8l10 3-2 8-10-3Z",fill:"#8B5A2B"}),e.jsx("path",{d:"M24 10l6 1.8",fill:"none",stroke:"#F4E4C8",strokeWidth:"1.2"})]});break;case 3:l=e.jsxs(e.Fragment,{children:[e.jsx("defs",{children:r("#5B8C5A","#3D6B3C")}),e.jsx("ellipse",{cx:"20",cy:"28",rx:"14",ry:"6",fill:c}),e.jsx("ellipse",{cx:"20",cy:"24",rx:"8",ry:"3.5",fill:"#8FBC8F"}),e.jsx("rect",{x:"18.5",y:"8",width:"3",height:"16",rx:"1.2",fill:"#F4F1EA"}),e.jsx("path",{d:"M12 12h16",fill:"none",stroke:"#F4F1EA",strokeWidth:"2",strokeLinecap:"round",opacity:".5"})]});break;case 4:l=e.jsxs(e.Fragment,{children:[e.jsx("defs",{children:r("#F2D27A","#C9922E")}),e.jsx("rect",{x:"18",y:"6",width:"4",height:"28",rx:"1",fill:c}),e.jsx("path",{d:"M22 8h10l-3 5 3 5H22Z",fill:"#2F7D4A"}),e.jsx("path",{d:"M8 30h24",fill:"none",stroke:"#6B8F71",strokeWidth:"2",strokeLinecap:"round"})]});break;default:l=e.jsxs(e.Fragment,{children:[e.jsx("defs",{children:r("#1B2A4A","#0D1528")}),e.jsx("rect",{x:"4",y:"4",width:"32",height:"32",rx:"8",fill:c}),e.jsx("path",{d:"M20 9 L28 20 L20 31 L12 20 Z",fill:"#E8C15A"}),e.jsx("text",{x:"20",y:"27",textAnchor:"middle",fill:"#F7F4EC",fontSize:"7",fontWeight:"700",fontFamily:"sans-serif",children:"CU"})]});break}return e.jsx("svg",{width:t,height:t,viewBox:"0 0 40 40","aria-hidden":"true",style:{flex:"none",display:"block"},children:l})}`;

s = s.slice(0, start) + neu + s.slice(retEnd);
console.log("Xs replaced", neu.length);

// dedupe stamp
const stamp =
  'callupBaseball1:!0,callupBaseball1:!0,callupBaseball1:!0';
if (s.includes(stamp)) {
  s = s.split(stamp).join("callupBaseball1:!0");
  console.log("deduped callupBaseball1");
} else if (s.includes("callupBaseball1:!0,callupBaseball1:!0")) {
  s = s.split("callupBaseball1:!0,callupBaseball1:!0").join("callupBaseball1:!0");
  console.log("deduped callupBaseball1 x2");
}

fs.writeFileSync(shellPath, s);

// Football → Baseball in card EN strings (word only)
const assets = path.join(__dirname, "..", "apk-src", "assets", "public", "assets");
for (const f of fs.readdirSync(assets)) {
  if (!f.startsWith("cards-") || !f.endsWith(".js")) continue;
  const fp = path.join(assets, f);
  let t = fs.readFileSync(fp, "utf8");
  const before = (t.match(/Football/g) || []).length;
  if (!before) continue;
  t = t.split("Football").join("Baseball");
  t = t.split("football").join("baseball");
  fs.writeFileSync(fp, t);
  console.log(f, "Football", before, "->", (t.match(/Football/g) || []).length);
}

console.log("done");
