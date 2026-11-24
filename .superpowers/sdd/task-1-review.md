# Task 1 Review — Clubs data + Europe → 4 markets

**Base:** `579820b` (working tree)  
**Reviewer:** subagent (read-only; independent verification)  
**Date:** 2026-11-24

## Verdict

| Axis | Result |
|------|--------|
| **Spec** | ❌ |
| **Quality** | **Changes requested** |

## Spec checklist

| Step | Brief | Verified |
|------|-------|----------|
| 1 | `callup-clubs.json` 4 markets, no amateur, US 30 cities, KR 1군/2군 | ✅ |
| 2 | `check-soccer-residual.ps1` + baseline FAIL | ⚠️ script exists; PASS on tree; baseline FAIL not re-verified |
| 3 | `fix-clubs-baseball.cjs` wc/y0/N()/names | ⚠️ partial — see findings |
| 4 | `build-callup.ps1` wire after `fix-deadline-midnight.cjs` | ✅ lines 65–68 |
| 5 | Full build + APK smoke | ❌ not run (report concurs) |

### Missing

- **Step 5** end-to-end build/install smoke.
- **`xw` league display map** in `engine-DhPc-c_J.js` still maps many soccer league keys to **European tier labels** (e.g. `에레디비시:"네덜란드 1부 리그"`, `"3. 리가":"독일 3부 리그"`, dozens more). Not touched by `fix-clubs-baseball.cjs`; violates “no Europe user-facing leagues.”
- **`Bw` country table** still keys `잉글랜드` / `스페인` / `독일` / `이탈리아` (engine probe).

### Extra

- `tierLabel()` emits **`{market} 독립리그`** for tier ≥3 (e.g. `N("ENG3",…)` → `한국 독립리그`), outside brief’s KR **1군·2군** tier vocabulary for data (may be acceptable as filler for legacy tier-3 slots — still user-visible).

### Misunderstood / ⚠️

- **Residual gate scope too narrow:** `check-soccer-residual.ps1` PASS (re-run: 0 files) does **not** cover European league/country strings left in `xw` / `Bw`. Brief asked grep after patch for soccer clubs; global constraint is broader (no Europe user-facing).
- **`const wc` rebuild:** 213 pair literals but **58 unique keys** (`city:"city"` cycles). Relies on global old-key replace + engine using city names; risks broken lookups if any code still indexes `wc` by legacy unique ids.
- **99 `N()` rows** keep legacy league **ids** (`POR1`, …) with remapped country/clubs — OK for patch approach, but `xw` can still surface old soccer league names → European labels.

## Quality

### Critical

1. **`xw` European display strings** — user-facing path likely still shows 네덜란드/독일/… tier names when old league keys resolve through `xw` (independent of patched `N()` labels).

### Important

1. **`wc` duplicate keys** — object collapses to 58 entries; needs confirmation against engine lookup paths or preserve 213 unique keys mapping to cities.
2. **Step 5 not executed** — no proof first screens show only KR/JP/TW/US.
3. **Checker not in `build-callup.ps1`** — regression possible on future asset edits.
4. **`COPY_PAIRS` global replace** — brittle band-aid (e.g. `UEFA`→`CPBL`); passes gate but not semantic cleanup.

### Minor

1. `tierLabel()` re-reads JSON each call.
2. `N()` idempotency heuristics (`ENG1` + `맨시티`) are implicit; document in script header.
3. Report’s “58 cities / 213 slots” cyclic alias design is intentional but worth UI smoke.

## Strengths

- **`data/callup-clubs.json`** matches brief (US list verbatim, no amateur/성남, 4 markets).
- **`fix-clubs-baseball.cjs`** follows existing fix-script pattern: probe logging, `y0` collapse, `N()` rewrite, names bundle, asset copy scrub.
- **Top-flight samples verified:** `ENG1` 한국 1군, `ENG2` 한국 2군, `USA1` 미국 메이저, `USA2` 미국 마이너, `POR1` → 일본 1군 / 일본.
- **Idempotency:** two consecutive runs → all stats `0`; `맨시티` engine+shell = 0.
- **Gate (narrow pattern):** `powershell -File tools/check-soccer-residual.ps1` → PASS.
- **Build wiring** correct order after deadline fix.

## Recommended follow-ups

1. Extend `fix-clubs-baseball.cjs` (or sibling fix) to rewrite **`xw`** values to 4-market tier labels only (and collapse/remove `Bw` EU keys or remap).
2. Tighten **`check-soccer-residual.ps1`** (or add second gate) for `잉글란드|스페인|…|1부 리그|3부 리그|독일|네덜란드` in user assets.
3. Fix **`buildWc`** to keep **unique keys** (old soccer keys → city alias values) if engine depends on 213 entries.
4. Run **Step 5** build + first-screen smoke; wire checker into build optional.

## Evidence (spot checks)

```
check-soccer-residual.ps1 → PASS (0 files)
fix-clubs-baseball.cjs ×2 → {"wc":0,"y0":0,"leagues":0,"clubs":0,"copy":0,"keys":0}
wc key literals: 213, unique: 58
ENG1/ENG2/ENG3/POR1/USA1/USA2 labels → 한국 1군 | 한국 2군 | 한국 독립리그 | 일본 1군 | 미국 메이저 | 미국 마이너
engine: const xw={…,"에레디비시":"네덜란드 1부 리그",…}
```

---

## RE-REVIEW (post follow-up fix)

**Date:** 2026-11-24  
**Reviewer:** subagent (read-only; independent verification)

### Verdict

| Axis | Result |
|------|--------|
| **Spec** | ❌ |
| **Quality** | **Approved** |

### Fix claims verified

| Prior finding | Code / tree | Result |
|---------------|-------------|--------|
| **`const xw` EU tier labels** | `patchXw` + `tierLabel` (1군/2군·메이저/마이너 only); engine sample `에레디비시:"대만 1군"`, EU substring grep in assets **0** | **Resolved** |
| **`Bw` EU keys** | `patchBw` → `Bw={한국,…,대한민국}` only | **Resolved** |
| **`mk` nationality table** | `MK_COLLAPSED` 4-market replace | **Resolved** |
| **`독립리그` / tier≥3** | `tierLabel` uses `tiers[1]`; `ENG3` → **한국 2군**; gate includes `독립리그` | **Resolved** |
| **Narrow checker** | L14 EU countries, `N부 리그`, `독립리그`; re-run **PASS (0 files)** | **Resolved** |

### Spec checklist (re-run)

| Step | Verified |
|------|----------|
| 1 JSON | ✅ unchanged |
| 2 Residual gate | ✅ widened; independent `check-soccer-residual.ps1` → PASS |
| 3 Patch script | ✅ wc/y0/xw/Bw/mk/N()/names/scrub; idempotent all-zeros |
| 4 Build wire | ✅ |
| 5 APK smoke | ❌ still not run |

### Quality (remaining)

| Severity | Items |
|----------|-------|
| **Critical** | — (none) |
| **Important** | Step 5 build/install first-screen smoke; `wc` 213 literals → **58 unique keys** (lookup risk unproven at runtime); checker **not** chained in `build-callup.ps1` |
| **Minor** | `COPY_PAIRS` semantic band-aid; script idempotency heuristics undocumented |

### Evidence

```
check-soccer-residual.ps1 → PASS (0 files)
fix-clubs-baseball.cjs → all stats 0 (patched tree)
xw: 프리미어리그:"한국 1군", 에레디비시:"대만 1군", …
Bw: 한국/일본/대만/미국/대한민국 only
ENG1–3 → 한국 1군 | 2군 | 2군; POR1 → 일본 1군; 맨시티 → 0 (engine+shell)
```

### Step 5 note

Patch + gate evidence supports **static** 4-market user strings; without full `build-callup.ps1` + device smoke, first-screen UI/runtime paths are **not** independently confirmed (acceptable deferral for patch task; blocks **full** brief sign-off).