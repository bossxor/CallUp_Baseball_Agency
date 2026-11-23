const fs = require("fs");
const p = "T:/CallUp/apk-src/assets/public/assets/engine-DhPc-c_J.js";
let s = fs.readFileSync(p, "utf8");
const pairs = [
  [
    "x.st={apps:0,goals:0,ast:0,rSum:0,capps:0,cgoals:0}",
    "x.st={apps:0,h:0,rbi:0,rSum:0,capps:0,ch:0}",
  ],
  [
    "st:{apps:0,goals:0,ast:0,rSum:0,capps:0,cgoals:0}",
    "st:{apps:0,h:0,rbi:0,rSum:0,capps:0,ch:0}",
  ],
  // career season rows: keep goals/ast keys but source from h/rbi already
];
let n = 0;
for (const [a, b] of pairs) {
  const c = s.split(a).length - 1;
  if (c) {
    s = s.split(a).join(b);
    n += c;
    console.log("fixed", a.slice(0, 40), c);
  }
}
fs.writeFileSync(p, s);
console.log("done", n);

// find world create string
const i = s.indexOf("세계를 만들고");
console.log("world str", i);
