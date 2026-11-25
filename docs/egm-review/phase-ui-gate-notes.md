# Phase UI gate notes

Spec: `docs/superpowers/specs/2026-11-24-phase-ui-design.md` §7  
Plan: `docs/superpowers/plans/2026-11-24-phase-ui.md`  
Handoff: `docs/egm-review/phase-ui-to-c-handoff.md`  
Date: 2026-11-25  
APK: callup.34 (fast smoke)

## Checklist

| Gate | Status | Evidence |
|------|--------|----------|
| Title: single save + reset only | PASS (code+device) | `Ua=[1]`; copy 데이터 초기화; CSS hides extra slots — Task 3; `ui-fast-00-title.png` |
| Dark amber on register/home/nego/roster | PASS (code+device) | `callup-theme.css` tokens + roster/nego passes — Tasks 1,6,7; `ui-fast-01-reg.png`, `ui-fast-wait03.png` |
| Home vertical feed (no swipe stack) | PASS (code+device) | flat `he=`; `.callup-feed` column CSS — Task 4; home feed on `ui-fast-wait03.png` / `ui-fast-home.png` |
| Baseball CTA (not diamond) | OPEN residual | Task 2 CSS baseball patch landed; **device still shows house/play mid icon** — `ui-fast-home.png` (house on Players), `ui-fast-wait03.png` (play △) |
| Unique+ blocks week advance | PASS (code+probe) | week-gate blocks legend/offer/renewal/… — Task 5 |
| Common/rare warn 「랜덤으로 선택」 + safe default | PASS (code+probe) | `probe-week-gate-defaults.cjs`; `def??last` no Math.random — Task 5 |
| Legend 3s hold | PASS (code) | `d4=3000`; short tap no-op for legend — Task 6 |
| Logo/tab CallUp assets | PARTIAL | Title emblem+launcher PASS device (`ba1e66e`, `e7a92da`, `ui-fast-00-title.png`); **reg logo default selection OPEN** (contract mark should be default without manual pick) |
| Nego contrast readable | OPEN residual | Task 6 code PASS (`fix-ui-nego-contrast.cjs`); **no dedicated nego device shot yet** |
| A/B residual: new game → home ≤2min | PASS (device) | `smoke-ui-fast.ps1` → worldgen → story → home feed (`ui-fast-wait03.png`, `ui-fast-home.png`) on callup.34 |

## Open residuals (carry)

1. **Mid-CTA house/play** — center tab not always baseball on device. Evidence: `docs/egm-review/ui-fast-home.png`, `ui-fast-wait03.png`.
2. **Logo default selection** — registration agency logo should default to contract-seal mark (Xs case 0); still OPEN for auto-select path.
3. **Nego device shot** — contrast patch code-only; need in-game nego screenshot under dark amber.

## Commits

- `ae062ce` `feat(ui): dark amber theme tokens for Phase UI`
- `36f0d1a` `feat(ui): baseball week CTA instead of diamond tab`
- `e544b24` `feat(ui): single save title and data reset hold`
- `d089def` `fix(ui): use 데이터 초기화 label on single-save wipe`
- `b83346e` `feat(ui): home vertical feed instead of swipe carousel`
- `f339632` `feat(ui): week-advance rarity gate and safe defaults`
- `b77f53a` `feat(ui): legend hold confirm and nego contrast`
- `bea509b` `test(ui): fast smoke and phase-ui gate notes`
- `535f38a` `feat(ui): replace title emblem with CallUp home-plate mark`
- `ba1e66e` `feat(ui): contract-seal mark for title emblem and launcher`
- `e7a92da` `feat(ui): contract brand logos on title, launcher, and reg picker`
- (+ this: Phase UI gate closeout + C handoff docs)

## Device evidence paths

| Shot | Path |
|------|------|
| Title | `docs/egm-review/ui-fast-00-title.png` |
| Reg | `docs/egm-review/ui-fast-01-reg.png` |
| Worldgen / story | `docs/egm-review/ui-fast-02-started.png`, `ui-fast-03-gen.png`, `ui-fast-wait01..11.png` |
| Home feed | `docs/egm-review/ui-fast-wait03.png`, `ui-fast-home.png` |
| Dump | `docs/egm-review/ui-fast-dump.xml` |

## Notes

- Engine tiers are `common|mid|rare|legend` (no unique/epic yet). Gate treats legend + offer/renewal/held scout/story as block; news/agency choices warn+safe-default.
- 「랜덤으로 선택」 is intentional copy; resolve uses `def ?? choices.length-1`.
- Full week-advance phone gate deferred if device busy; fast smoke frees phone via `finally` force-stop.
- Gate = **PASS with OPEN residuals** for Phase C entry; C0 should treat mid-CTA / logo-default / nego-shot as carry, not blockers for C design start.
