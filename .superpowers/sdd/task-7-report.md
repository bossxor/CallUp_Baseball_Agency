# Task 7: Terms copy + off-season camp — report

## Status
**DONE** — `fix-terms-baseball.cjs` + `fix-offseason-camp.cjs` created; wired in `build-callup.ps1` after `fix-intl-baseball`, before `check-soccer-residual.ps1`. No commit.

## Build wire
`build-callup.ps1`: `fix-intl-baseball` → **`fix-terms-baseball`** → **`fix-offseason-camp`** → `check-soccer-residual`.

## `tools/fix-terms-baseball.cjs`
- **Pairs (longer first):** `유소년 아카데미`→`육성 시설`, `아카데미 육성 보상금`→`육성 보상금`, `벤치에서`→`벤치·대기에서`, `주전으로`→`선발로`, `유소년`→`아마추어`.
- **Regex:** bare `메디컬`→`메디컬 체크` (not already `메디컬 체크`); bare `아카데미`→`육성` (preserves `아카데미·동계 육성` via guard).
- **Repair pass:** `메디컬 체크 체크`, `육성 육성 보상금`, `육성·동계 육성`.
- **Files:** engine, shell, ui×2, names, Deadline, yearSay.

### Terms run (first pass, then repair)
- First pass: **233** replacements across **7** files.
- Repair: **45** fixes across **4** files.
- Second pass: **0** (idempotent).

## `tools/fix-offseason-camp.cjs`
- **`callupOffSeasonCamp`:** first off-week (`qb(t) && !qb(t-1)`), top client (`my(x)`), once per block (`agency.offCampBlock = r0(t)`).
- **`O0` agenda:** `kind:"news"`, `ev:"offCamp"`; choices 전지훈련 / 아카데미·동계 육성 / 스킵; `def:2`.
- **`callupOffSeasonCampPick`:** camp +0.12 `form` + timeline; academy +1 pit/bat + `ovr` recalc; skip noop.
- **Hook:** after `iN(x,e,t)` in week advance (`/*CALLUP_OFFCAMP_HOOK*/`).
- **Resolver:** `Cn` news branch `ev==="offCamp"` (`/*CALLUP_OFFCAMP_RES*/`).
- **Assert:** `callupTerms1` / `/*CALLUP_TERMS_ASSERT*/`.
- **Cheat:** `offCampTest` in `offlineCheat` (jumps to off-season week edge).

## Tests
```
node tools/fix-terms-baseball.cjs   → pairs (first run) + repair; second run → {"files":0,"pairs":0}
node tools/fix-offseason-camp.cjs   → fn/hook/res/assert/cheat patched; rerun → all ok
check-soccer-residual.ps1           → GATE PASS (0 hit files)
```

Not run this session: full APK build, device smoke, off-season UI tap-through.

## Concerns
- **Bare `주전`** remains in narrative/i18n (by design — only `주전으로` phrase-level swap).
- **EN/ES ui values** still say “Academy” in places while Korean keys use 육성 시설.
- **`offCampTest` cheat** sets week to `x0(week)*52+9` — approximate; real trigger uses `qb`/`r0`.
- **Gate notes file** `docs/egm-review/baseball-residual-gate-notes.md` not present — not appended.

## Report path
`T:\CallUp\.superpowers\sdd\task-7-report.md`