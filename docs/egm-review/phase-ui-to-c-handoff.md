# Phase UI → Phase C handoff

**Date:** 2026-11-25  
**Gate notes:** `docs/egm-review/phase-ui-gate-notes.md`  
**UI plan:** `docs/superpowers/plans/2026-11-24-phase-ui.md`  
**UI spec:** `docs/superpowers/specs/2026-11-24-phase-ui-design.md`

## What UI shipped

- Dark amber theme tokens (`callup-theme.css`) on title / reg / home / roster / nego paths
- Title: single save + 데이터 초기화 hold
- Home: vertical feed (no swipe stack) + rarity week-advance gate + 「랜덤으로 선택」 copy with safe defaults
- Legend: 3s hold confirm
- Baseball mid-CTA CSS patch (diamond removed in code)
- Contract-seal title emblem + launcher + reg Xs brand logos (`ba1e66e`, `e7a92da`)
- Fast smoke: new game → home ≤2min (`smoke-ui-fast.ps1`; shots under `docs/egm-review/ui-fast-*.png`)

## Open residuals (do not treat as C blockers for design start)

| Residual | Status | Pointer |
|----------|--------|---------|
| Mid CTA house/play | OPEN | Device: `ui-fast-home.png` (house), `ui-fast-wait03.png` (play △). Code: `fix-ui-tab-baseball.cjs` |
| Logo default selection | OPEN | Reg should auto-pick contract-seal (Xs case 0). Brand patch: `fix-ui-brand-logo.cjs` / `e7a92da` |
| Nego device shot | OPEN | Contrast code in `fix-ui-nego-contrast.cjs`; need in-game nego screenshot |

## Phase C entry

| Doc | Path |
|-----|------|
| Design | `docs/superpowers/specs/2026-11-25-phase-c-design.md` |
| Plan | `docs/superpowers/plans/2026-11-25-phase-c.md` |
| Kickoff (earlier) | `docs/superpowers/specs/2026-11-24-phase-c-kickoff.md` |
| Index | `docs/superpowers/specs/2026-11-25-full-design-plan-index.md` |

**C0:** Confirm this handoff + gate notes (PASS with OPEN residuals). Wire `fix-phase-c-*.cjs` **after** Phase UI scripts in `build-callup.ps1`. Reuse home feed rarity stops for draft/salary unique+.
