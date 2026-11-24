const fs = require("fs");
const n = Number(process.argv[2] || 1);
const p = fs.readFileSync(
  "docs/superpowers/plans/2026-11-24-baseball-residual.md",
  "utf8"
);
const lines = p.split(/\r?\n/);
let on = false;
const out = [];
for (const L of lines) {
  if (/^### Task /.test(L)) {
    if (on) break;
    on = new RegExp(`^### Task ${n}:`).test(L);
    if (on) {
      out.push(L);
      continue;
    }
  } else if (on) out.push(L);
}
const o = `.superpowers/sdd/task-${n}-brief.md`;
fs.writeFileSync(o, out.join("\n"));
console.log("wrote", o, out.length);
