# Task 2 Report — Club rename (bulk edit)

## Status

**DONE** — `agency.clubNick` wired; i18n `yt` override; settings UI; idempotent fix script; residual **PASS**.

## Commits

None (per instructions).

## Deliverables

| Item | Path |
|------|------|
| Fix script | `tools/fix-club-rename.cjs` |
| Build wire (after `fix-clubs-baseball.cjs`) | `tools/build-callup.ps1` |
| Display resolver | `apk-src/.../i18n-D-FAABCZ.js` (`yt` → `clubNick[id]` then `G(name)`) |
| Save init | `engine-DhPc-c_J.js` `callupAssertBaseball` |
| UI | `shell-DaKdX7f1.js` `CallupClubNickEditor` (오피스 › 설정 › 구단) |
| Styles | `tools/callup-theme.css` → `callup-theme.css` |

## Design

1. **Display** — Engine `T(club)` = i18n `yt`. After patch: existing patch hook `S(name)` → `agency.clubNick[club.id]` → default `G(club.name)` (Task 1 city / wc path).
2. **Persistence** — `agency.clubNick: { [id]: string }`; `{}` on load/new via assert + `Cc()`.
3. **UI** — Expand “구단 이름 편집”; textarea `id|name` per club; **저장** / **기본값으로** (clears map, refreshes lines from `club.name`).
4. **Game bind** — `globalThis.__callupG` set in `Cc()` so i18n resolver reads live save.

## Test log

```
node tools/fix-club-rename.cjs          → patched i18n, assert, cc, ui×2, css
node tools/fix-club-rename.cjs          → ok* (idempotent stats 0)
node tools/_probe-club-nick.cjs         → override PASS, default PASS
powershell -File tools/check-soccer-residual.ps1 → GATE PASS
```

Brief engine probe (`wc[`, club names): **true** pre-patch; resolver anchored on i18n `yt` not raw `wc`.

## Not run

- Full APK / device smoke (rename on player card / nego).

## Concerns

- **UI on 설정 › 구단**, not separate 리그 탭 (prototype league page absent; coexists with existing zip/json “구단 설정”).
- **`globalThis.__callupG`** couples i18n to shell; acceptable for fork, not upstream-clean.
- **58 unique cities / 213 slots** — editor lists all `game.clubs` ids (full engine set); nick is per club id.

## Report path

`T:\CallUp\.superpowers\sdd\task-2-report.md`