/**
 * Unit-ish probe: safe-default index never uses Math.random.
 * Mirrors fix-ui-week-gate resolve: def ?? choices.length-1
 */
function safeIx(item) {
  return item.def != null ? item.def : item.choices.length - 1;
}

const cases = [
  { id: 1, choices: ["a", "b", "c"], def: 0, expect: 0 },
  { id: 2, choices: ["a", "b", "c"], def: 2, expect: 2 },
  { id: 3, choices: ["reject", "ok"], expect: 1 },
  { id: 4, choices: ["only"], expect: 0 },
  { id: 5, choices: ["x", "y", "z"], def: null, expect: 2 },
];

let ok = 0;
for (const c of cases) {
  const got = safeIx(c);
  if (got !== c.expect) {
    console.error("FAIL", c.id, "got", got, "want", c.expect);
    process.exitCode = 1;
  } else ok++;
}

// Ensure resolve path source has no Math.random in gate block
const fs = require("fs");
const path = require("path");
const shell = fs.readFileSync(
  path.join(
    __dirname,
    "..",
    "apk-src",
    "assets",
    "public",
    "assets",
    "shell-DaKdX7f1.js"
  ),
  "utf8"
);
const mark = "진행하면 랜덤으로 선택됩니다";
const i = shell.indexOf(mark);
if (i < 0) {
  console.error("FAIL: week-gate mark missing in shell");
  process.exitCode = 1;
} else {
  const block = shell.slice(i - 900, i + 450);
  if (block.includes("Math.random")) {
    console.error("FAIL: Math.random inside week-gate block");
    process.exitCode = 1;
  }
  if (!block.includes("Be.def!=null?Be.def:Be.choices.length-1")) {
    console.error("FAIL: safe-default expression missing");
    process.exitCode = 1;
  }
  if (!block.includes("중요한 안건을 먼저 처리해 주세요")) {
    console.error("FAIL: block toast missing");
    process.exitCode = 1;
  }
  console.log("shell gate OK");
}

console.log("probe-week-gate-defaults", { ok, total: cases.length });
if (process.exitCode) process.exit(process.exitCode);
