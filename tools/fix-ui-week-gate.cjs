/**
 * Phase UI Task 5 — week-advance rarity gate + safe-default resolve.
 *
 * Engine tiers: common < mid < rare < legend (no unique/epic yet).
 * Spec map: unique+/legend → BLOCK; common/mid/rare news·agency → WARN once
 * then resolve via safe default (item.def ?? last choice). Player copy says
 * 「랜덤으로 선택」 (intentional mismatch — not Math.random).
 *
 * Safe-default table:
 * | kind                         | default                         |
 * |------------------------------|---------------------------------|
 * | news/agency with choices     | def ?? choices.length-1 (last)  |
 * | offer / renewal / scout held | BLOCK (manual)                  |
 * | tier legend/unique/epic      | BLOCK (manual)                  |
 * | bigcall/retire/military/…    | BLOCK (manual)                  |
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
const MARK = "진행하면 랜덤으로 선택됩니다";

const OLD =
  'const Re=A.inbox.filter(Be=>wa(Be)&&Be.expires!==void 0&&Be.expires<=A.week);if(Re.length&&re.current!==A.week){C({k:"confirm",title:n("마감되는 카드 {length}장",{length:Re.length}),body:n("넘기면 기본 선택지로 처리돼요. 넘길까요?"),ok:n("넘기기"),run:()=>{re.current=A.week,J(I)}});return}';

const NEW = `{const _cgAll=A.inbox.filter(Be=>{var _d;return!Be.done&&(Be.kind==="offer"||Be.kind==="renewal"||Be.kind==="scout"&&!!((_d=Be.data)!=null&&_d.held)||Be.tier==="legend"||Be.tier==="unique"||Be.tier==="epic"||Be.ev==="bigcall"||Be.ev==="retire"||Be.ev==="military"||Be.ev==="story"||Be.ev==="hp_final"||!!(Be.choices&&Be.choices.length&&(Be.kind==="news"||Be.kind==="agency")))});const _cgBlock=_cgAll.filter(Be=>{var _d;return Be.kind==="offer"||Be.kind==="renewal"||Be.kind==="scout"&&!!((_d=Be.data)!=null&&_d.held)||Be.tier==="legend"||Be.tier==="unique"||Be.tier==="epic"||Be.ev==="bigcall"||Be.ev==="retire"||Be.ev==="military"||Be.ev==="story"||Be.ev==="hp_final"});if(_cgBlock.length){he(n("중요한 안건을 먼저 처리해 주세요"));return}const _cgWarn=_cgAll.filter(Be=>Be.choices&&Be.choices.length&&(Be.kind==="news"||Be.kind==="agency"));if(_cgWarn.length&&re.current!==A.week){C({k:"confirm",title:n("남은 안건 {length}건",{length:_cgWarn.length}),body:n("아직 남은 안건이 있습니다. 진행하면 랜덤으로 선택됩니다."),ok:n("진행"),run:()=>{re.current=A.week;for(const Be of _cgWarn){const _ix=Be.def!=null?Be.def:Be.choices.length-1;Ft(A,Be.id,_ix);Be.done||(Be.done=!0)}ke(),J(I)}});return}}`;

let shell = fs.readFileSync(shellPath, "utf8");
let n = 0;

if (shell.includes(MARK)) {
  console.log("week-gate already patched");
} else if (shell.includes(OLD)) {
  shell = shell.replace(OLD, NEW);
  n++;
  console.log("week-gate: rarity block + warn/safe-default");
} else {
  console.error("MISS expire-confirm advance block");
  process.exitCode = 1;
}

fs.writeFileSync(shellPath, shell);
console.log("fix-ui-week-gate done", { n });
if (process.exitCode) process.exit(process.exitCode);
