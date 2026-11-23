/**
 * Personal/CallUp: never block on tutorials.
 * - nego tip always considered seen
 * - Py tutorial overlay auto-finishes (no UI)
 */
const fs = require("fs");
const path = require("path");
const shell = path.join(
  __dirname,
  "..",
  "apk-src",
  "assets",
  "public",
  "assets",
  "shell-DaKdX7f1.js"
);
let s = fs.readFileSync(shell, "utf8");
let n = 0;

function rep(a, b, label) {
  const c = s.split(a).length - 1;
  if (!c) {
    console.log("MISS", label || a.slice(0, 60));
    return;
  }
  s = s.split(a).join(b);
  n += c;
  console.log("patched", c, "x", label || a.slice(0, 40));
}

// never start pnego / force-nego path
rep('!jc(t,"nego")', "!1", "jc nego gate");

// mark nego tip when home tut would finish (if still using Py)
rep(
  'G==="new"||G==="pro"?(R().tutDone=!0,ua(R(),"scout"),xe("home"))',
  'G==="new"||G==="pro"?(R().tutDone=!0,ua(R(),"scout"),ua(R(),"nego"),xe("home"))',
  "tutDone+nego tip"
);
// already-patched form
if (s.includes('ua(R(),"scout"),ua(R(),"nego"),xe("home")')) {
  console.log("ok tutDone+nego tip present");
}

// Auto-finish ANY tutorial mode — run onDone side effects, render null
const pyMount =
  'G&&e.jsx(Py,{mode:G,onDone:()=>{G==="new"||G==="pro"?(R().tutDone=!0,ua(R(),"scout"),ua(R(),"nego"),xe("home")):G==="pnego"?ua(R(),"nego"):G==="replay"?xe("office"):ua(R(),G),de(!1),ke(),U()}})';
const pyAuto =
  'G&&(G==="new"||G==="pro"?(R().tutDone=!0,ua(R(),"scout"),ua(R(),"nego"),xe("home")):G==="pnego"||G==="nego"?(ua(R(),"nego")):G==="replay"?xe("office"):(ua(R(),G),void 0),de(!1),ke(),U(),null)';
if (s.includes(pyAuto)) {
  console.log("already py auto-skip");
} else {
  rep(pyMount, pyAuto, "py auto-skip");
}

// Tip bubbles (Yh / S5): never show
const s5from =
  "function S5({id:s}){const[t,a]=p.useState(()=>!jc(R(),s));if(!t||lr())return null;";
const s5to =
  "function S5({id:s}){const[t,a]=p.useState(()=>!jc(R(),s));if(1||!t||lr())return null;";
if (s.includes(s5to)) console.log("already S5 tip suppress");
else rep(s5from, s5to, "S5 tip suppress");

fs.writeFileSync(shell, s);
console.log("fix-skip-tut done", n);
