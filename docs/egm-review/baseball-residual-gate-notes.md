# Baseball residual gate notes

**Date:** 2026-11-24  
**Plan:** `docs/superpowers/plans/2026-11-24-baseball-residual.md`  
**APK:** `0.1.0-callup.27` / versionCode **142** (installed R5KL10FHTTN)

## Package status

| Task | Status | Notes |
| --- | --- | --- |
| 1 Clubs 4-market | PASS (static) | xw/Bw/y0/wc; residual gate |
| 2 Club rename | PASS (static) | 설정›구단; `agency.clubNick` |
| 3 Annual salary | PASS (static) | ÷52 fee; PR scaled; `callupAnnual1` |
| 4 Clauses | PASS (static) | loan/sell-on blocked; buyout; optOut |
| 5 Calendar | PASS (static) | trade/FA windows; Kt=24 |
| 6 Intl | PASS (static) | WBC·프리미어12·아시안게임·올림픽·아시아야구선수권 |
| 7 Terms + camp | PASS (static) | terms + offCamp agenda |

## Checker

`tools/check-soccer-residual.ps1` → GATE PASS during builds.

## Device

- Device: R5KL10FHTTN  
- Interactive deep smoke (nego week fee, opt-out fire, off-season camp UI): **deferred / partial** — install after final rebuild.

## Carry (Minor)

- wc 213 slots / 58 unique city cycle  
- Some EN/ES i18n leftovers  
- Loan narrative strings may remain with cond false  
