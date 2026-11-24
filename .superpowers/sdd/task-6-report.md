# Task 6: International events (5) — report

## Status
**DONE** — `tools/fix-intl-baseball.cjs` created; wired in `build-callup.ps1` after `fix-calendar-baseball.cjs`, before `check-soccer-residual.ps1`. No commit.

## Pre-patch (engine)
| Pattern | count |
|---------|------:|
| `function Q7` soccer slots (U17/WC/EURO/COPA/…) | 12 event types / loop |
| `세계 선수권` | 73 |
| `아시아 종합대회` | 9 |
| `FIFA` / `UEFA` / `월드컵` | 0 (clubs pass) |
| `ew={…}` club + FIFA label map | 528 chars |

## Patches

### `tools/fix-intl-baseball.cjs`
- **`Q7()`** — sparse 5-event calendar (2026–2052), reusing week hooks: `WC`→`{year} WBC` @ `w:t`; `P12` 프리미어12 @ `w:t+2` (4y from 2032); `AG` 아시안게임 @ `w:t+(e===2030?22:12)`; `OLY` 올림픽 @ `w:t+5`; `ABC` 아시아야구선수권 @ `w:t-24` (even years). Marker `/*CALLUP_INTL_CAL*/`.
- **`ew` display map** — user labels collapse to WBC / 프리미어12 / 아시안게임 / 올림픽 / 아시아야구선수권 (+ 청소년 WBC, 골든보이). Marker `/*CALLUP_INTL_EW*/`.
- **`gI()` regex** — Euro/Copa/Olympics year strings → WBC / 프리미어12 / 올림픽.
- **Copy pairs** — engine, ui×2, `names-CdWzr2Fb.js`: soccer intl / club trophy strings → 5-event set (longer phrases first).

### Build
- `build-callup.ps1` L75–79: `fix-calendar-baseball` → **`fix-intl-baseball`** → `check-soccer-residual`.

### Residual checker
- No pattern change — existing `월드컵|FIFA|UEFA` gate already sufficient post-patch.

## Tests
```
node tools/fix-intl-baseball.cjs  → engine 3, pairs 153, files 4 (first run)
node tools/fix-intl-baseball.cjs  → engine 0, pairs 0, files 0 (idempotent)
check-soccer-residual.ps1         → GATE PASS (0 hit files)
```

Post-patch engine:
- `Q7` names: only WBC, 프리미어12, 아시안게임, 올림픽, 아시아야구선수권
- `유럽 선수권` / `세계 선수권` / `U-17` / `아시아 종합대회` / `FIFA` / `UEFA` / `월드컵`: **0**
- `Lp` WC week hook unchanged (`key.startsWith("WC")`, `w===year*52`)

## Concerns
- Narrative still has **청소년 WBC** and generic **유럽 클럽/아프리카 클럽** copy in some news keys (values remapped via `ew`, not deleted).
- **`names-CdWzr2Fb.js` EN values** partially updated; not every legacy tournament key removed from the locale table.
- **Step 3 smoke** (office news / week cheat to intl headline) **not run** this session.
- **ENG/ES ui** i18n values may still mention “World Cup” in EN strings while Korean keys are baseball terms.

## Report path
`T:\CallUp\.superpowers\sdd\task-6-report.md`