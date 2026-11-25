/**
 * Phase UI — new-game registration logo default → contract mark (index 0).
 * Upstream randomizes: useState(()=>Math.floor(Math.random()*Oc.length))
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
const MARK = "/*CALLUP_LOGO_DEFAULT*/";
const FROM =
  "[_,b]=p.useState(()=>Math.floor(Math.random()*Oc.length))";
const TO = `[_,b]=p.useState(0)${MARK}`;

let s = fs.readFileSync(shellPath, "utf8");
if (s.includes(MARK) || s.includes("[_,b]=p.useState(0)")) {
  console.log("logo default already 0");
  process.exit(0);
}
if (!s.includes(FROM)) {
  console.error("MISS logo useState random init");
  process.exit(1);
}
s = s.split(FROM).join(TO);
fs.writeFileSync(shellPath, s);
console.log("fix-ui-logo-default done — logo index 0 (contract)");
