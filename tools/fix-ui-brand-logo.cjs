/**
 * Phase UI — brand logo: registration Xs default (CU) → contract/seal/pen mark
 * matching chosen title emblem + launcher.
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
const MARK = "/*CALLUP_BRAND_CONTRACT*/";

let s = fs.readFileSync(shellPath, "utf8");
if (s.includes(MARK)) {
  console.log("brand logo Xs already patched");
  process.exit(0);
}

const start = s.indexOf("function Xs({n:s,size:t})");
const end = s.indexOf('return e.jsx("svg",{width:t,height:t,viewBox:"0 0 40 40"', start);
if (start < 0 || end < 0) {
  console.error("Xs bounds miss");
  process.exit(1);
}
const retEnd = s.indexOf("})}", end) + 3;

// Contract seal + pen mark as default (case 5 / CU slot) + case 0 primary
const neu = `function Xs({n:s,size:t})${MARK}{const a=p.useId().replace(/[^a-zA-Z0-9]/g,""),r=(i,o)=>e.jsxs("linearGradient",{id:\`\${a}b\`,x1:"0",y1:"0",x2:"0",y2:"1",children:[e.jsx("stop",{offset:"0",stopColor:i}),e.jsx("stop",{offset:"1",stopColor:o})]}),c=\`url(#\${a}b)\`;let l;switch(s){case 0:l=e.jsxs(e.Fragment,{children:[e.jsx("defs",{children:r("#1A1F27","#12151A")}),e.jsx("rect",{x:"4",y:"4",width:"32",height:"32",rx:"8",fill:c}),e.jsx("path",{d:"M12 10h14l2 2v16H12Z",fill:"#DBC6A3"}),e.jsx("path",{d:"M26 10l4 4h-4Z",fill:"#C4B08E"}),e.jsx("rect",{x:"14",y:"14",width:"10",height:"2.2",rx:"1",fill:"#2A2A2A"}),e.jsx("rect",{x:"14",y:"18",width:"8",height:"2.2",rx:"1",fill:"#2A2A2A"}),e.jsx("circle",{cx:"17",cy:"26",r:"4.2",fill:"#B53D35"}),e.jsx("circle",{cx:"17",cy:"26",r:"2.4",fill:"#F0E6DA"}),e.jsx("path",{d:"M15.6 25.2c.5.6 1 .9 1.4.9s.9-.3 1.4-.9",fill:"none",stroke:"#B53D35",strokeWidth:"0.7"}),e.jsx("path",{d:"M24 22l6 8",stroke:"#C4924A",strokeWidth:"2.2",strokeLinecap:"round"}),e.jsx("path",{d:"M22 30c2-1 4-1 6 0",fill:"none",stroke:"#1A1A1A",strokeWidth:"1.4",strokeLinecap:"round"})]});break;case 1:l=e.jsxs(e.Fragment,{children:[e.jsx("defs",{children:r("#C4924A","#A67A38")}),e.jsx("path",{d:"M12 8h16v10l-8 12-8-12Z",fill:c}),e.jsx("circle",{cx:"20",cy:"16",r:"5",fill:"#F0E6DA"}),e.jsx("path",{d:"M16.5 14.5c1 .8 1.8 1.3 3.5 1.3s2.5-.5 3.5-1.3",fill:"none",stroke:"#B53D35",strokeWidth:"1.1"})]});break;case 2:l=e.jsxs(e.Fragment,{children:[e.jsx("defs",{children:r("#E8E1CF","#C2B89A")}),e.jsx("circle",{cx:"20",cy:"20",r:"12",fill:c,stroke:"#2A2A2A",strokeWidth:"1"}),e.jsx("path",{d:"M12 14c3 2 5 6 5 12M28 14c-3 2-5 6-5 12",fill:"none",stroke:"#B53D35",strokeWidth:"1.5",strokeLinecap:"round"})]});break;case 3:l=e.jsxs(e.Fragment,{children:[e.jsx("defs",{children:r("#5B8C5A","#3D6B3C")}),e.jsx("ellipse",{cx:"20",cy:"28",rx:"14",ry:"6",fill:c}),e.jsx("ellipse",{cx:"20",cy:"24",rx:"8",ry:"3.5",fill:"#8FBC8F"}),e.jsx("rect",{x:"18.5",y:"8",width:"3",height:"16",rx:"1.2",fill:"#F0E6DA"})]});break;case 4:l=e.jsxs(e.Fragment,{children:[e.jsx("defs",{children:r("#D4A85C","#C4924A")}),e.jsx("circle",{cx:"18",cy:"18",r:"10",fill:"none",stroke:c,strokeWidth:"3"}),e.jsx("circle",{cx:"18",cy:"18",r:"7",fill:"#F0E6DA"}),e.jsx("path",{d:"M14 16c1.2 1 2 1.6 4 1.6s2.8-.6 4-1.6",fill:"none",stroke:"#B53D35",strokeWidth:"1.2"}),e.jsx("rect",{x:"24",y:"24",width:"10",height:"3.2",rx:"1.4",fill:c,transform:"rotate(40 29 25.6)"})]});break;default:l=e.jsxs(e.Fragment,{children:[e.jsx("defs",{children:r("#1A1F27","#12151A")}),e.jsx("rect",{x:"4",y:"4",width:"32",height:"32",rx:"8",fill:c}),e.jsx("path",{d:"M12 10h14l2 2v16H12Z",fill:"#DBC6A3"}),e.jsx("path",{d:"M26 10l4 4h-4Z",fill:"#C4B08E"}),e.jsx("rect",{x:"14",y:"14",width:"10",height:"2.2",rx:"1",fill:"#2A2A2A"}),e.jsx("rect",{x:"14",y:"18",width:"8",height:"2.2",rx:"1",fill:"#2A2A2A"}),e.jsx("circle",{cx:"17",cy:"26",r:"4.2",fill:"#B53D35"}),e.jsx("circle",{cx:"17",cy:"26",r:"2.4",fill:"#F0E6DA"}),e.jsx("path",{d:"M24 22l6 8",stroke:"#C4924A",strokeWidth:"2.2",strokeLinecap:"round"}),e.jsx("path",{d:"M22 30c2-1 4-1 6 0",fill:"none",stroke:"#1A1A1A",strokeWidth:"1.4",strokeLinecap:"round"})]});break}return e.jsx("svg",{width:t,height:t,viewBox:"0 0 40 40","aria-hidden":"true",style:{flex:"none",display:"block"},children:l})}`;

s = s.slice(0, start) + neu + s.slice(retEnd);
fs.writeFileSync(shellPath, s);
console.log("fix-ui-brand-logo done — Xs contract mark");
