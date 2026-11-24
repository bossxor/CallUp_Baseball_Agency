# Task 4: Contract clauses — report

## Status
**DONE** — `tools/fix-clauses-baseball.cjs` created; wired in `build-callup.ps1` after `fix-salary-annual`, before `check-soccer-residual.ps1`. No commit.

## Inventory (pre-patch, engine+shell)
| Term | eng | shell |
|------|-----|-------|
| 임대 | 108 | 7 |
| 셀온 | 17 | 3 |
| sellOn | 25 | 12 |
| buyout | 29 | 4 |
| 위약금 | 35 | 7 |
| loan event ids | 26 | — |

Loan UX events targeted: `loanOffer`, `rc_loan_offer`, `bench_loan`, `sp_bn_loanask` (`tloan` was already `cond:()=>!1`).

## Patches

### Engine
- Remove `sellOn` from nego table `L_`; relabel `buyout` → **위약금**; add **optOut** clause (`/*CALLUP_CLAUSES_V1*/`).
- Block `sellOn` in `Z_` gate + disable sell-on payout in `go()` (`/*CALLUP_NO_SELLON*/`).
- Transfer/renew clause write: no `sellOn`; set `optOutYear` when `optOut` chosen.
- Disable four loan offer/situ events (`cond:()=>!1`, zero weight where applicable).
- `callupOptOutSeason` — on season week tick, if `x0(week)===clauses.optOutYear` → `O0` **renewal** agenda (`/*CALLUP_OPTOUT_FN*/`).
- `callupAssertBaseball`: stamp `callupClauses1` (`/*CALLUP_CLAUSES_ASSERT*/`).
- Offline cheat action `optOutTest` for smoke.

### Shell
- Remove **임대 목록** from transfer-status picker.
- Hide sell-on contract rows (`!1&&` guards).
- Contract summary: **바이아웃** → **위약금**; strip sell-on from deal-done clause line.

### Build
- `build-callup.ps1`: `fix-clauses-baseball.cjs` after `fix-salary-annual` (club/salary chain preserved).

## Tests
```
node tools/fix-clauses-baseball.cjs  → eng 13, shell 5, assert 1, cheat 1 (first run)
node tools/fix-clauses-baseball.cjs  → eng 0, shell 0 (idempotent)
```
Post-patch: `L_` has no `sellOn`; `Z_` blocks `sellOn`; loan offer events `cond:()=>!1`; shell has no `임대 목록`; buyout row shows `위약금`; markers `CALLUP_CLAUSES_V1`, `CALLUP_OPTOUT_FN`, `CALLUP_CLAUSES_ASSERT` present.

## Concerns
- Engine still contains loan **narrative** strings (events not fully enumerated); user **offer** paths above are off, not every `loan` substring.
- Opt-out fires from week-44 client loop hook; other season boundaries not exhaustively proven without APK week advance.
- Step 4 APK smoke (협상 UI, cheat `optOutTest` → inbox) **not run** this session.
- `build-callup.ps1` was briefly overwritten during implementation; restored with full club/salary/residual wire + clauses step.

## Report path
`T:\CallUp\.superpowers\sdd\task-4-report.md`