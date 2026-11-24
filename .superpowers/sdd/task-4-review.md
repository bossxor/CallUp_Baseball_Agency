# Task 4 Review — Contract clauses (임대/셀온 제거, 위약금, 옵트아웃)

**Reviewer:** subagent (read-only; independent verification)  
**Date:** 2026-11-24  
**Inputs:** `task-4-brief.md`, `task-4-report.md`, `tools/fix-clauses-baseball.cjs`, patched `engine-DhPc-c_J.js` / `shell-DaKdX7f1.js`, `build-callup.ps1`

## Verdict

| Axis | Result |
|------|--------|
| **Spec** | ✅ |
| **Quality** | **Changes requested** |

## Spec checklist

| Step | Brief | Verified |
|------|-------|----------|
| 1 | Inventory (임대/sellOn/buyout/loan ids) | ✅ Report + spot-check: `L_` has no `sellOn:{label`; markers present |
| 2 | Disable loan/sell-on user paths | ✅ Four loan offer events `cond:()=>!1`; `Z_` blocks `sellOn`; sell-on payout dead-coded; shell sell-on rows `!1&&`; no `k:"loan"` / no `임대 목록` in `shell-DaKdX7f1.js` |
| 3 | Opt-out clause + season agenda | ✅ `optOut` in `L_`; `optOutYear` on transfer/renew writes; `callupOptOutSeason` + week-loop hook |
| 4 | Wire + smoke | ⚠️ Build wire ✅; **APK / in-game smoke not run** (report concurs) |

### Interface (brief)

| Requirement | Status |
|-------------|--------|
| No user path to **임대** / **셀온** | ✅ Primary offer events off; nego `sellOn` removed; UI picker/list rows removed or gated |
| **buyout** labeled **위약금** (계약 해제 의미) | ✅ Engine `L_` + shell contract summary `n("위약금")`; shell `바이아웃` → 0 matches |
| **`optOutYear`** on contracts; week tick → agenda | ✅ Written on clause commit; `x0(week)===optOutYear` → `O0` renewal inbox |
| `tools/fix-clauses-baseball.cjs` + build chain | ✅ Script exists; idempotent re-run |
| No commit required | ✅ (not performed) |

## Quality

### Critical

_None._

### Important

1. **Brief Step 4 smoke missing** — no check that nego shows **옵트아웃** / no **셀온**, contract row **위약금**, or `optOutTest` cheat → renewal agenda in inbox.

2. **Loan not fully excised** — engine still carries **임대/loan** narrative and other loan-touched code paths; only enumerated **offer** events are disabled (`report` concern). Residual `loan` mechanics (e.g. week-44 `b.loan` branch) unchanged.

3. **Opt-out vs brief “FA-eligible”** — fires **`kind:"renewal"`** agenda only; no explicit FA-eligibility flag hook verified (brief allowed “reuse existing FA/recontract hooks” but behavior is unproven in play).

4. **`optOutYear` asymmetry** — transfer: `x0(r)+1…2`; renew: always `x0(x.week)+1`. May not match “year index 1 or 2” intent on renegotiation path.

5. **`callupClauses1` assert** — stamps on load like annual; does **not** reject legacy saves still carrying `sellOn` in `player.clauses` (mitigated by engine gate + dead payout).

### Minor

1. **Shell `!1&&` guards** — hide sell-on rows without deleting JSX; fragile if minifier/layout shifts.

2. **`callupOptOutSeason` hook placement** — single prefix on existing week-44 client loop; other season boundaries not exhaustively covered.

3. **i18n bundles** — `ui-*.js` may still list **임대 목록** strings; not surfaced in patched shell routes (dead copy).

4. **Idempotency** — `ENGINE.pop()` skips duplicate week-hook patch when hook already present; other hunks rely on `ok`/`MISS` per anchor (same pattern as prior fix scripts).

5. **Residual gate** — `check-soccer-residual.ps1` does not assert loan/sell-on absence; manual grep relied upon.

## Strengths

- **`fix-clauses-baseball.cjs`** — consistent fix-script shape: literal anchors, `stats`, assert extension beside `CALLUP_ANNUAL_ASSERT`, smoke cheat `optOutTest`.
- **Defense in depth** — remove `sellOn` from `L_`, block in `Z_`, zero payout in `go()`, strip from clause persistence, hide shell rows.
- **Build wire** — `fix-clubs-baseball` → `fix-club-rename` → `fix-salary-annual` → **`fix-clauses-baseball`** → `check-soccer-residual` (`build-callup.ps1` L67–76).
- **Idempotency** — `node tools/fix-clauses-baseball.cjs` → all `ok`; `{"eng":0,"shell":0,"cheat":0,"assert":0}`.
- **Markers** — `CALLUP_CLAUSES_V1`, `CALLUP_NO_SELLON`, `CALLUP_OPTOUT_FN`, `CALLUP_CLAUSES_ASSERT` present in tree.

## Recommended follow-ups

1. Run **Step 4 smoke**: nego clause picker → no 셀온; opt-out selectable; contract UI **위약금**; cheat `optOutTest` → inbox renewal card.
2. Inventory remaining **loan** event ids / `loan:!0` opts; gate or no-op if any still reachable outside the four patched ids.
3. Align **renew** `optOutYear` formula with transfer (year offset 1–2) or document intentional shortcut.
4. Optional: extend assert to flag `clauses.sellOn` on loaded saves.

## Evidence (spot checks)

```
node tools/fix-clauses-baseball.cjs → all ok; stats eng/shell/cheat/assert 0
engine: L_={/*CALLUP_CLAUSES_V1*/buyout:{label:"위약금"…}; optOut clause present
engine: sellOn:{label → no matches
engine: e==="sellOn"?!1 in Z_
engine: CALLUP_NO_SELLON in go()
engine: loanOffer/rc_loan_offer/bench_loan/sp_bn_loanask → cond:()=>!1
engine: callupOptOutSeason + /*CALLUP_OPTOUT_FN*/; case "optOutTest"
engine: /*CALLUP_CLAUSES_ASSERT*/ / callupClauses1 stamp
shell: k:"loan" / 임대 목록 / 바이아웃 → no matches in shell-DaKdX7f1.js
shell: children:n("위약금") on buyout row
build-callup.ps1 L67–76 → clubs → rename → salary → clauses → residual
check-soccer-residual.ps1 → GATE PASS (0 files)
```