# Task 5: Calendar windows + deadline copy — report

## Status
**DONE** — `tools/fix-calendar-baseball.cjs` created; wired in `build-callup.ps1` after `fix-clauses-baseball.cjs`, before `check-soccer-residual.ps1`. `Kt=24` verified (no change). No commit.

## Pre-patch inventory (engine)
| String | count |
|--------|------:|
| 하절기 영입창* | 4 (incl. 오픈/마감/열린 밤) |
| 동절기 영입창* | 7 |
| 영입시장이 닫혀요 | 2 |
| 데드라인 (bare) | 9 eng + 2 shell + chunks/ui |

Brief keys `여름/겨울 영입시장` absent in live assets (already `하절기/동절기 영입창` from `fix-clubs-baseball.cjs`); script includes both alias sets for idempotency.

## Patches

### `tools/fix-calendar-baseball.cjs`
- Long→short pair replace on: `engine-DhPc-c_J.js`, `shell-DaKdX7f1.js`, `ui-DgYnPcSw.js`, `ui-DSX53OnJ.js`, `Year-BBjDZ4ft.js`, `Deadline-DD5y1sRo.js`.
- Window labels: **하절기 영입창** → **트레이드 기간** (+ 오픈/마감/열린 밤); **동절기 영입창** → **FA·재계약 기간** (+ 오픈/마감).
- Midnight close copy: `영입시장이 닫혀요` → **트레이드 시장이 닫혀요** (incl. `오늘 밤 12시…` variants); shell `오늘 밤 12시 영입시장 마감` → **트레이드 시장 마감**.
- `(?<!트레이드 )데드라인` → **트레이드 데드라인** (avoids double-prefix on existing 트레이드 strings).
- Asserts `Kt=24` present; exits non-zero if `Kt=23` or anchor missing.

### Build
- `build-callup.ps1` L73–76: `fix-clauses-baseball` → **`fix-calendar-baseball`** → `check-soccer-residual`.

## Tests
```
node tools/fix-calendar-baseball.cjs  → files 6, pairs 74, deadline 38 (first run)
node tools/fix-calendar-baseball.cjs  → files 0, pairs 0, deadline 0 (idempotent)
```
Post-patch engine: `트레이드 기간 오픈/마감`, `FA·재계약 기간 오픈/마감`, `트레이드 기간이 열린 밤`, `트레이드 시장이 닫혀요`; no `하절기/동절기 영입창`; bare `데드라인` count 0; `Kt=24` yes.

## Concerns
- Narrative strings still use **여름/겨울 이적 시장** (2 each in engine); not in Task 5 pair list.
- Shell/home calendar UI still shows generic **영입시장** (opened/closed headlines, tab title) — only deadline-night + 마감 banner remapped.
- EN/ES `ui-*.js` values may still read “transfer window” / “deadline day” while keys are Korean baseball terms.
- Step 2 APK smoke (calendar news / deadline screen) **not run** this session.

## Report path
`T:\CallUp\.superpowers\sdd\task-5-report.md`

---

## Leftover pass (2025-11-24)

### Status
**DONE** — Task 5 calendar leftovers patched in `fix-calendar-baseball.cjs`; assets re-run; idempotent + `check-soccer-residual.ps1` PASS. No commit.

### New pairs (16)
- **이적 시장 narrative:** `여름 이적 시장` → `트레이드 시장` (2 eng); `겨울 이적 시장` → `FA·재계약 시장` (2 eng).
- **Calendar UI labels:** open/close/마감 headlines, league countdown, deadline countdown, shell tab `tag:n("영입시장")`, coach tip, FA listing copy — mapped to **트레이드 시장** / **트레이드 마감** wording (engine 8, shell 7, ui×2 keys each, Deadline 1).

### Tests
```
node tools/fix-calendar-baseball.cjs  → files 5, pairs 40, deadline 0
node tools/fix-calendar-baseball.cjs  → files 0, pairs 0, deadline 0 (idempotent)
check-soccer-residual.ps1             → GATE PASS (0 hit files)
Kt=24                                 → ok
```

### Post-patch residual (intentional)
| Pattern | engine | shell | ui×2 | notes |
|---------|-------:|------:|-----:|-------|
| `여름/겨울 이적` | 0 | — | — | cleared |
| Calendar `영입시장*` UI | 0 | 0 | 0 | keys synced |
| Meta `영입시장` (achievements/rumor copy) | 3 | 1 | 2 each | e.g. `영입시장의 손`, `영입시장 주가`, EN/ES achievement keys |