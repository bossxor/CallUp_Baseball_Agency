# Phase UI gate notes

Spec: `docs/superpowers/specs/2026-11-24-phase-ui-design.md` §7  
Plan: `docs/superpowers/plans/2026-11-24-phase-ui.md`  
Date: 2026-11-25

## Checklist

| Gate | Status | Evidence |
|------|--------|----------|
| Title: single save + reset only | PASS (code) | `Ua=[1]`; copy 데이터 초기화; CSS hides extra slots — Task 3 |
| Dark amber on register/home/nego/roster | PASS (code) | `callup-theme.css` tokens + roster/nego passes — Tasks 1,6,7 |
| Home vertical feed (no swipe stack) | PASS (code) | flat `he=`; `.callup-feed` column CSS — Task 4 |
| Baseball CTA (not diamond) | PASS (code) | Task 2 tab baseball asset |
| Unique+ blocks week advance | PASS (code+probe) | week-gate blocks legend/offer/renewal/… — Task 5 |
| Common/rare warn 「랜덤으로 선택」 + safe default | PASS (code+probe) | `probe-week-gate-defaults.cjs`; `def??last` no Math.random — Task 5 |
| Legend 3s hold | PASS (code) | `d4=3000`; short tap no-op for legend — Task 6 |
| Logo/tab CallUp assets | PASS (code) | Tasks 1–2 |
| A/B residual: new game → home ≤2min | PENDING (device) | `smoke-ui-fast.ps1` ready; first run hit lock screen, paused for phone — retry later |

## Commits

- `feat(ui): dark amber theme tokens for Phase UI`
- `feat(ui): baseball week CTA instead of diamond tab`
- `feat(ui): single save title and data reset hold`
- `feat(ui): home vertical feed instead of swipe carousel`
- `feat(ui): week-advance rarity gate and safe defaults`
- `feat(ui): legend hold confirm and nego contrast`
- (+ this: roster pass + fast smoke harness)

## Notes

- Engine tiers are `common|mid|rare|legend` (no unique/epic yet). Gate treats legend + offer/renewal/held scout/story as block; news/agency choices warn+safe-default.
- 「랜덤으로 선택」 is intentional copy; resolve uses `def ?? choices.length-1`.
- Full week-advance phone gate deferred if device busy; fast smoke frees phone via `finally` force-stop.
