# Phase C Kickoff — CallUp Baseball

**Date:** 2026-11-24  
**Status:** DRAFT (design not approved yet)  
**Precondition:** Residual packages A–G landed (`0.1.0-callup.29` / vc144). Worldgen crash fixed (`Date.UTC` + name pools). Full week-advance device gate deferred (phone time).

## Where we are

| Phase | Status |
|-------|--------|
| D → B (+B1) core baseball | Done |
| Residual (clubs/salary/clauses/calendar/intl/terms/camp) | Implemented; fast worldgen OK |
| Deep week/save smoke | Deferred |
| **Phase C** | **Not started — this kickoff** |

Residual design/implement is finished. We are **not** “still implementing residual.” Next is **Phase C design**, then implement.

## Phase C pillars (proposed)

### 1. UI/UX readability overhaul (MUST)

Evidence from device shots (`dg-01-reg`, `dg-03-home`):

- Label contrast too low (gray on white).
- Home card dead space; hierarchy weak (huge “8주 뒤”, empty lower half).
- Soccer-era chrome (sage gradient, stadium lights, dense pills) fights baseball brand.
- Form helper text tiny; bottom nav + center diamond compete with content.

**Scope for design pass:**

- Contrast / type scale / spacing system (WCAG-ish targets on phone).
- Home card information density: what must show above the fold.
- Registration, nego, office, player list — screen-by-screen readability audit.
- Theme tokens (CSS vars) for baseball, not soccer leftover palette.
- Kill clutter: pills, overlapping badges, low-contrast gold-on-gradient titles.

**Out of scope until approved:** full visual rebrand art; only structural readability + token pass first.

### 2. Gameplay / systems (TBD in brainstorm)

Hold for approved brainstorm — candidates from prior roadmap talk (not committed):

- Deeper baseball-specific loops beyond residual copy maps
- Market / FA / trade feel after residual rename
- Any Phase C feature list from product owner

### 3. Verification

- Fast smoke (worldgen + home) as default gate; full week smoke only when phone free.
- Design regression shots: reg + home + nego before/after.

## Next actions

1. Human approve this kickoff shape (UI overhaul in C = yes/no).
2. Brainstorm → write `2026-*-phase-c-design.md` + plan.
3. Commit residual crashfix if not yet pushed.
4. Implement only after design GO.
