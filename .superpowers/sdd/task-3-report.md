# Task 3: Annual salary — report

## Status
**DONE** — `tools/fix-salary-annual.cjs` created; wired in `build-callup.ps1` after `fix-club-rename`.

## Probe (*52 vs calendar)
| Site | Class | Action |
|------|-------|--------|
| `Lp`/`cM`/`LM`/`e*52` contract weeks | calendar | untouched |
| `af`/`Jy` nego signing fees | wage×52→annual | ÷52 removed |
| `nN`/`Z6` weekly tick | weekly wage | `floor(wage/52*…)` |
| `Vl` renew upfront fee | wage×52 | removed `*52` |
| loyalty `t.wage*weeks` | weekly | `wage/52*…` |
| `oe()` market wage | weekly basis | `*52` on return |
| event `wage>N` thresholds | weekly scale | ×52 literals |

## Patches (engine)
- `oe()` output ×52; `af`/`Jy` drop `*52`; `nN` uses `Math.floor(wage/52*…)`; `Vl` renew fee; loyalty bonus; `wl` cards income (`wage/208e3`).
- Event thresholds `2e3…5e4` → annual equivalents (`104e3…260e4`).
- `callupAssertBaseball`: `callupAnnual1` stamp; reject client wage `<6e4` when unstamped (`/*CALLUP_ANNUAL_ASSERT*/`).
- Marker `/*CALLUP_ANNUAL_V1*/` on `af` for idempotency.

## Shell
- Labels: `주급` already 0 in assets (Task 1); script idempotent no-op on copy pass.

## Tests
```
node tools/fix-salary-annual.cjs  → eng 16, assert 1
node tools/fix-salary-annual.cjs  → eng 0 (idempotent)
tools/check-soccer-residual.ps1   → GATE PASS (0 files, 주급 0)
Post-patch grep: no af/Jy/nN/Vl wage*52 fee paths
```

## Concerns
- Weekly-save heuristic (`wage<6e4`) may false-reject ultra-low annual edge cases; tune if user reports.
- `oe()*52` raises all new contract numbers — thresholds patched in-engine but untested in-game APK smoke.
- No commit per brief.

## Report path
`T:\CallUp\.superpowers\sdd\task-3-report.md`

---

## Follow-up (review Important #2–#3) — 2026-11-24

### Status
**DONE** — PR annual scaling + softened weekly-save heuristic; no commit.

### Changes
| Area | Before | After |
|------|--------|-------|
| `PR` (`hp_loyal`) | `Math.round(x.wage*4/1e3)` | `Math.round(x.wage/52*4/1e3)` (matches old weekly intent on annual storage, parallel to `wl` `/208e3`) |
| Legacy save hint | unstamped + any client `wage<6e4` | unstamped + any client `0<wage<3e4`; `callupAnnual1` still authoritative |
| `fix-salary-annual.cjs` | — | `PR-hp_loyal` patch; `assert-wk-threshold` migration `6e4→3e4`; header docs |

### Tests
```
node tools/fix-salary-annual.cjs  → eng 2 (PR + assert threshold), shell 0
node tools/fix-salary-annual.cjs  → eng 0 (idempotent)
tools/check-soccer-residual.ps1   → GATE PASS (0 files)
grep engine: wage*4/1e3 → 0; PR uses wage/52*4/1e3; wage<6e4 → 0; wage<3e4 in assert
```

### Remaining concerns
- Step 3 APK smoke (nego 연봉 + weekly cash tick) still not run.
- `oe()*52` / event thresholds unchanged from prior pass.