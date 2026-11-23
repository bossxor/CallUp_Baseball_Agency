/** Offline unit check for callupAssertBaseball extracted from engine. */
const fs = require("fs");
const path = require("path");
const eng = fs.readFileSync(
  path.join(__dirname, "..", "apk-src", "assets", "public", "assets", "engine-DhPc-c_J.js"),
  "utf8"
);
const m = eng.match(/function callupAssertBaseball\(game\)\{[\s\S]*?\n\}/);
if (!m) {
  console.error("ASSERT FN MISS");
  process.exit(1);
}
// eslint-disable-next-line no-new-func
const callupAssertBaseball = new Function(m[0] + "; return callupAssertBaseball;")();

function expectThrow(label, game) {
  try {
    callupAssertBaseball(game);
    console.error("FAIL expect throw:", label);
    process.exit(1);
  } catch (e) {
    if (!String(e.message).includes("콜업 야구")) {
      console.error("FAIL message:", label, e.message);
      process.exit(1);
    }
    console.log("OK throw", label);
  }
}
function expectOk(label, game) {
  try {
    callupAssertBaseball(game);
    console.log("OK pass", label);
  } catch (e) {
    console.error("FAIL pass:", label, e.message);
    process.exit(1);
  }
}

expectOk("empty new", { agency: {}, players: {} });
expectOk("marked baseball", {
  agency: { callupBaseball1: true },
  players: { 1: { pos: "P" }, 2: { pos: "SS" } },
});
expectThrow("legacy soccer pos", {
  agency: { callupBaseball1: true },
  players: { 1: { pos: "GK" } },
});
expectThrow("no marker with players", {
  agency: {},
  players: { 1: { pos: "P" } },
});
expectThrow("FW leftover", {
  agency: { callupBaseball1: 1 },
  players: { 1: { pos: "FW" } },
});
console.log("B1 assert unit PASS");
