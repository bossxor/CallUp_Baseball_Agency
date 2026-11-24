# Task 3 Review — Annual salary (주급 → 연봉)

**Reviewer:** subagent (read-only; independent verification)  
**Date:** 2026-11-24  
**Inputs:** `task-3-brief.md`, `task-3-report.md`, `tools/fix-salary-annual.cjs`, patched `engine-DhPc-c_J.js` / `shell-DaKdX7f1.js`, `build-callup.ps1`

## Verdict

| Axis | Result |
|------|--------|
| **Spec** | ✅ |
| **Quality** | **Changes requested** |

## Spec checklist

| Step | Brief | Verified |
|------|-------|----------|
| 1 | Probe `*52` sites; wage vs calendar | ✅ Re-probed engine: remaining `*52` uses are calendar/contract-week (`Lp`, `cM`, `LM`, `t*52` years, U17 keys, etc.); wage fee paths classified and patched per report |
| 2 | `tools/fix-salary-annual.cjs` + engine/shell patches | ✅ Script exists; idempotent; markers `CALLUP_ANNUAL_V1` / `CALLUP_ANNUAL_ASSERT` present in tree |
| 3 | Shell copy + build wire + smoke (nego 연봉, weekly cash ÷52) | ⚠️ Wired ✅; **APK / in-game smoke not run** (report concurs) |

### Interface (brief)

| Requirement | Status |
|-------------|--------|
| Stored / negotiated `player.wage` = **annual** | ✅ `oe()` return ×52; nego `af`/`Jy` use annual `x` without `*52` |
| Weekly agency income `floor(annual/52 * rate chain)` | ✅ `nN=(x,e)=>…Math.floor(x.wage/52*WS(e.wageRate))`; `Z6` delegates to `nN` |
| Calendar `*52` untouched | ✅ No `wage*52` / `x*52*e` fee helpers post-patch; calendar `*52` sites unchanged |
| UI `주급` → `연봉` | ✅ `apk-src` grep `주급` → **0**; shell shows `n("연봉")` in nego copy |
| Old weekly-schema saves rejected | ✅ `callupAnnual1` stamp + `wage<6e4` client heuristic when unstamped |
| No commit required | ✅ (not performed) |

## Quality

### Critical

_None._

### Important

1. **Brief Step 3 smoke missing** — no independent check that nego UI shows 연봉 amounts, or that advancing one week changes agency cash by ≈ `floor(annual/52 × wageRate chain)` vs pre-patch weekly semantics.

2. **`PR` value heuristic still weekly-scaled** — `PR=x=>Math.min(2e5,Math.max(7e4,Math.round(x.wage*4/1e3)*1e3))` (`hp_loyal` path) was not rescaled like `wl` (`wage/208e3`). Annual wages will skew toward the 2e5 cap; card/event weighting may diverge from design intent.

3. **Weekly-save rejection threshold `wage<6e4`** — reasonable for legacy weekly saves but may false-reject legitimate very-low annual contracts; monitor user reports (report flags this).

### Minor

1. **`oe()*52` + threshold literals** — event `wage>=N` gates scaled ×52; static grep confirms patches, but no runtime validation that story/event firing still matches intent.

2. **Shell COPY idempotent no-op** — labels already 연봉 from Task 1; script correctly skips; no regression.

3. **Idempotency via `CALLUP_ANNUAL_V1` only on `af`** — sufficient for current patch set; if future engine edits break a single anchor, script may early-exit other hunks as `ok` without re-validating all sites.

4. **Gate scope** — `check-soccer-residual.ps1` does not assert absence of wage `*52`; rely on post-patch grep (re-verified: **no** `wage*52`).

## Strengths

- **`fix-salary-annual.cjs`** — follows existing fix-script pattern: literal anchors, stats, shell copy order (`주급 수수료` before `주급`), assert extension in `callupAssertBaseball`.
- **Core fee math** — `af`/`Jy` signing fees on annual base; `Vl` renew upfront `r.wage*feeRate` without `*52`; loyalty `t.wage/52*…weeks`.
- **Build wire** — `fix-salary-annual.cjs` after `fix-club-rename.cjs`, before `check-soccer-residual.ps1` (`build-callup.ps1` L69–74).
- **Idempotency** — `node tools/fix-salary-annual.cjs` → `{"eng":0,"shell":0,"assert":0}` (re-run on patched tree).
- **Residual gate** — `check-soccer-residual.ps1` → PASS (0 files).

## Recommended follow-ups

1. Run **Step 3 smoke**: set known annual via cheats → nego label 연봉 → advance 1 week → compare agency cash delta to `floor(annual/52 × WS(wageRate))`.
2. Rescale or document **`PR` (`x.wage*4/1e3`)** (and any similar display/value heuristics) for annual storage.
3. Optional: add engine grep gate for `wage\*52` in build or document in fix-script header.

## Evidence (spot checks)

```
node tools/fix-salary-annual.cjs → all ok; stats eng/shell/assert 0
engine: af=(x,e,t)=>Sx(x*e*t*.6)/*CALLUP_ANNUAL_V1*/
engine: nN=(x,e)=>…Math.floor(x.wage/52*WS(e.wageRate))…
engine: oe() …wealth)??.3))*52
engine: wage*52 → no matches
engine: remaining *52 contexts → calendar/contract-week only (+ oe annual scale)
apk-src: 주급 → 0 files
shell: n("연봉") in nego tutorial strings
callupAssertBaseball: callupAnnual1 + /*CALLUP_ANNUAL_ASSERT*/
build-callup.ps1 → fix-club-rename → fix-salary-annual → check-soccer-residual
check-soccer-residual.ps1 → GATE PASS
```