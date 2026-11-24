# Task 2 Review — Club rename (bulk edit)

**Reviewer:** subagent (read-only; independent verification)  
**Date:** 2026-11-24  
**Inputs:** `task-2-brief.md`, `task-2-report.md`, `tools/fix-club-rename.cjs`, patched assets, `build-callup.ps1`

## Verdict

| Axis | Result |
|------|--------|
| **Spec** | ✅ |
| **Quality** | **Changes requested** |

## Spec checklist

| Step | Brief | Verified |
|------|-------|----------|
| 1 | Locate club display (`T(club)` / i18n `yt`) | ✅ `i18n-D-FAABCZ.js` exports `yt as c`; engine `import{c as T}`; shell `import{c as Te}` |
| 2 | `agency.clubNick` save + resolver + UI + Reset | ✅ assert + `Cc()` init; `yt` chain `S(name)` → `clubNick[id]` → `G(name)`; `CallupClubNickEditor` with 저장/기본값으로 |
| 3 | Wire build + smoke (rename → card/nego → Reset) | ⚠️ wired ✅; **APK/device smoke not run** (report concurs) |

### Global constraints

| Constraint | Status |
|------------|--------|
| Nicknames in save (`agency.clubNick`) | ✅ |
| Reset defaults (clear map) | ✅ `reset()` sets `{}` and refreshes textarea |
| Display override (not raw JSON mutation) | ✅ club objects unchanged; label via `yt` only |
| YAGNI | ✅ single fix script, textarea bulk edit, no React league page rebuild |

### UI placement

**설정 › 구단** (not 리그 tab): acceptable per review brief — editor is reachable alongside existing `h1` clubpatch entry; not a spec fail.

## Quality

### Critical

_None._

### Important

1. **Brief Step 3 smoke missing** — no proof renamed club appears on player card / nego (`Nr` → `T(club)`) or that Reset restores Task-1 default display after reload. Static `_probe-club-nick.cjs` does not execute bundled `yt` (reimplements a subset without `S` / `G`).

2. **`globalThis.__callupG` coupling** — i18n reads live save only after `Cc()` binds game; correct in normal play but fragile if any code path calls `yt` before bind (documented in report; acceptable for fork but worth one load-order check in smoke).

### Minor

1. **Editor default lines use `l.name`** — textarea seed uses raw `club.name`, not `Te(l)` / `G`; defaults in UI may diverge from in-game labels (Task 1 city map) until user saves.

2. **Save replaces entire `clubNick` map** — only `id|name` lines with non-empty trimmed names are kept; malformed lines silently dropped (expected for bulk edit, but easy to lose edits on partial paste).

3. **`_probe-club-nick.cjs`** — string-presence checks only; does not validate `S(name)` hook still wins over `clubNick` when `vt` is set.

4. **Review package diff** — `task-2-review-pkg.diff` is UTF-16 / binary-text; human diff review awkward (content matches repo files).

## Strengths

- **`tools/fix-club-rename.cjs`** — clear anchors, idempotent `rep()`, marker `/*CALLUP_CLUBNICK*/`, stats logging; **two consecutive runs → all stats `0`** (re-verified).
- **Build order** — `fix-club-rename.cjs` immediately after `fix-clubs-baseball.cjs`, before `check-soccer-residual.ps1` (`build-callup.ps1` L67–72) — correct dependency (Task 1 names before nick overlay).
- **Display path** — centralized on `yt` used as `T`/`Te` in engine and shell (e.g. nego `Nr`, player card `Te(d)`).
- **Persistence init** — `callupAssertBaseball` and `Cc()` both ensure `agency.clubNick` object exists.
- **UI** — expand/collapse editor, `id|name` format, hint for empty name → default; theme hooks in `callup-theme.css`.

## Recommended follow-ups

1. Run **Step 3 smoke**: rename one club in 설정 › 구단 → verify label on player card and nego → 기본값으로 → reload save → default restored.
2. Optionally extend probe to **eval export `yt`** from i18n bundle (or minimal vm extract) including `S` stub.
3. Optional UX: seed textarea with `Te(l)` for default column consistency with Task 1.

## Evidence (spot checks)

```
node tools/_probe-club-nick.cjs → override PASS, default PASS; i18n/shell/assert flags true
node tools/fix-club-rename.cjs ×2 → {"i18n":0,"assert":0,"cc":0,"ui":0,"css":0}
engine callupAssertBaseball → if(!a.clubNick)a.clubNick={};/*CALLUP_CLUBNICK*/
i18n yt → clubNick[t.id] after S(t.name), else G(t.name)
build-callup.ps1 → fix-clubs-baseball → fix-club-rename → check-soccer-residual
```