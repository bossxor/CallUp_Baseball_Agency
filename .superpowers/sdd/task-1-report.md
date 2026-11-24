# Task 1 Report — Clubs data + Europe → 4 markets

## Status

**DONE** — checker PASS after `fix-clubs-baseball.cjs`; second run idempotent (`copy:0`).

## Deliverables

| Item | Path |
|------|------|
| Clubs JSON (4 markets, US 30 cities, no amateur) | `data/callup-clubs.json` |
| Residual gate | `tools/check-soccer-residual.ps1` |
| Engine/shell patch | `tools/fix-clubs-baseball.cjs` |
| Build wire (after `fix-deadline-midnight.cjs`) | `tools/build-callup.ps1` |

## Probe (pre-patch)

| Probe | Value |
|-------|-------|
| `const wc=` pairs | **213** |
| `N()` league rows | **99** |
| Main remap labels | ENG→한국 1군, ESP→일본 1군, GER→대만 1군, ITA→미국 메이저 (from prior `patch-callup.cjs`) |
| `y0` countries (pre) | EU/SA/NA/AS full soccer table (~3.5k blob) |

## Changes (logic)

1. **`callup-clubs.json`** — KR `1군/2군` only; removed `amateur` / 성남 야구고; US `clubs` array = 30 city aliases from brief verbatim.
2. **`fix-clubs-baseball.cjs`**
   - Rebuilt `const wc={...}` — 213 slots, cyclic KR→JP→TW→US cities; display value = JSON city name.
   - Global replace of old wc keys/values → city aliases in `engine-DhPc-c_J.js`.
   - Collapsed `y0` to `{한국, 일본, 대만, 미국, 대한민국}` only (`AS` except `미국` → `NA`).
   - Rewrote all **99** `N("…")` league registrations: `country`/`cont`/display label + comma club lists from market pools.
   - Rebuilt `names-DvEudt3S.js` club English map to `{city: "city FC"}`.
   - Idempotent copy scrub across assets: `주급`→`연봉`, transfer-window strings, `FIFA/UEFA/월드컵`, `fifa`, residual euro club tokens in name bundles.
3. **`check-soccer-residual.ps1`** — scans `apk-src/assets/public/assets/*.{js,css,html}`; allowlist brief + self.

## Test log

```
# Before
powershell -File tools/check-soccer-residual.ps1  → FAIL (12 files; engine 맨시티×287, …)

# Patch
node tools/fix-clubs-baseball.cjs
  → wc replaced 213, y0 collapsed, N() 99 / clubs 1571, names patched, 맨시티 engine+shell 0

node tools/fix-clubs-baseball.cjs  (2nd)
  → wc already baseball, copy:0, keys:0

# After (re-run fix for fifa/name residuals)
node tools/fix-clubs-baseball.cjs ×2 → copy:0 on 2nd
powershell -File tools/check-soccer-residual.ps1 → PASS (0 files)
```

**Idempotency:** 2nd `fix-clubs-baseball.cjs` — `wc:0`, `leagues:0`, `copy:0`, `keys:0`.

**Probe grep:** `맨시티` in `engine-DhPc-c_J.js` + `shell-DaKdX7f1.js` = **0**.

## Example post-patch (`ENG1`)

`N("ENG1","한국 1군","한국","AS",…,"인천,수원,대전,…")` — country `한국`, clubs = KR pool.

## Not run

- Full `build-callup.ps1` / APK install smoke (Step 5 brief) — not executed in this task window.

## Commits

None (per instructions).

## Concerns

- **First-run `N()` always rewrites** 99 leagues even when already baseball; guarded on 2nd+ via `ENG1`/`맨시티` heuristics.
- **58 unique cities / 213 wc slots** — aliases repeat cyclically; lower-tier leagues share city names across markets by design.
- **Non–top-flight leagues** (e.g. POR1) keep old *display* tier strings but `country` + club list now map to one of 4 markets via prefix hash — scout reach is limited by collapsed `y0`.

## Report path

`T:\CallUp\.superpowers\sdd\task-1-report.md`

---

## Task 1 review follow-up (2026-11-24)

### Status

**DONE** — widened gate FAIL→fix→PASS; 2nd `fix-clubs-baseball.cjs` all stats `0`.

### Fixed

1. **`const xw`** — 88 display values → 한국/일본/대만/미국 `1군·2군·메이저·마이너` only (`tierLabel`, no `독립리그`).
2. **`Bw`** — EU/soccer country keys collapsed to `한국·일본·대만·미국·대한민국`.
3. **`mk`** — nationality affinity table collapsed to 4 markets.
4. **`tierLabel` / `N()`** — tier≥3 uses JSON `2군`/`마이너`; leagues idempotent when `ENG1` baseball.
5. **`check-soccer-residual.ps1`** — EU country + `N부 리그` + `독립리그` patterns.
6. **Assets scrub** — `names-*`, `ui-*` league/country leftovers + narrative `1부/2부 리그` copy.

### Test log

```
# Gate before fix (post-review tree)
powershell -File tools/check-soccer-residual.ps1 → FAIL (4 files: engine/names/ui×2)

# Patch
node tools/fix-clubs-baseball.cjs
  → xw:88 bw:15 mk:1 leagues:99 scrub:201 (1st pass after xw/bw)
node tools/fix-clubs-baseball.cjs  (2nd)
  → {"wc":0,"y0":0,"xw":0,"bw":0,"mk":0,"leagues":0,"clubs":0,"copy":0,"keys":0,"scrub":0}

powershell -File tools/check-soccer-residual.ps1 → PASS (0 files)
```

### Not run

- Full `build-callup.ps1` / APK smoke (Step 5).

### Commits

None.
## Controller follow-up
- Wired check-soccer-residual into build-callup.ps1
- build-callup.ps1 SUCCESS; residual GATE PASS during build
- Spec Step 5: APK built; interactive league UI smoke deferred if no device

