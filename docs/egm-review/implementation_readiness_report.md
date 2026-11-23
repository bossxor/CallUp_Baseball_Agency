# Implementation Readiness

**Result: not ready for the first playable release.**

1. **Blocker — Week boundary.** Pin W → W+1 and save each completed week before calculating the next. A later simulation error currently occurs before the first write. Test failure and retry, inclusive offer deadlines, and simultaneous registration and replies. (Implementation §§2–3; `advance`, `step`, `commit`.)
2. **Blocker — Registration and ledger.** Current contracts are single-player with static budget and slots. Require player-scoped offers, stable contract IDs, budget and slot reservations, explicit failure and release, and a once-per-contract fee. Migrate pending and previously paid contracts without charging twice. (Implementation §3; `src/club-deals.ts`.)
3. **Blocker — Migration and checkpoints.** Establish exact files and tests per phase, and guarantee successful writes can reopen. Preserve club aliases and report pages. Verify installed APK and AAB release separately. (Implementation §§1, 5–6; `MainActivity.java`, `android/build.ps1`.)
4. **Major — Events and deadlines.** Specify event ID/source, read vs resolved, tie-break order and expiration. Distinguish stop from answer, and quiet weeks from weeks with due replies. (Implementation §§2, 4–5; `Matter`, `Summary`.)
5. **Major — Fixture and roster correctness.** Set market calendars, lineup eligibility, immutable results and seasonal carryover. Ensure a player contributes only to the proper fixture and moves markets on registration. (Implementation §§2–3; `src/korea.ts`, `src/main.ts`.)
6. **Major — UX readiness.** Specify return destination and persisted report page. Verify Android Back, narrow portrait and OS reduced motion with a fixed fixture. (Implementation §§4–6; `report`, `callup-back`.)
