# Final whole-branch review — Baseball residual (Packages 1–7)

**Date:** 2026-11-24  
**Reviewer:** subagent (read-only)  
**Base:** `579820b` → working tree (no commits per plan)  
**Spec:** `docs/superpowers/specs/2026-11-24-baseball-residual-design.md`  
**Plan:** `docs/superpowers/plans/2026-11-24-baseball-residual.md`  
**APK (tree):** `0.1.0-callup.27` / `versionCode` 142 (`apk-src/apktool.yml`)

---

## Executive verdict

| Axis | Result |
|------|--------|
| **Spec coverage (§2–§9, packages 1–7)** | ✅ All packages landed in tree + build wire |
| **Static gate** | ✅ `check-soccer-residual.ps1` → **GATE PASS** (re-run 2026-11-24) |
| **Interactive / device proof** | ⚠️ **Partial / deferred** (gate notes; per-task smoke gaps) |
| **Merge readiness** | **Conditional GO** — safe to integrate this working tree; treat Important items as **pre-release**, not pre-merge blockers |

---

## Scope verified

| # | Package | Artifacts | Static |
|---|---------|-----------|--------|
| 1 | Clubs 4-market | `data/callup-clubs.json`, `fix-clubs-baseball.cjs` | ✅ KR10/JP12/TW6/US30 JSON; engine `wc` baseball cities; euro club names 0 (`_probe-us-clubs.cjs`) |
| 2 | Club rename | `fix-club-rename.cjs` | ✅ `agency.clubNick`, `yt` resolver, 설정›구단 편집 UI in shell |
| 3 | Annual salary | `fix-salary-annual.cjs` | ✅ `nN` ÷52, `callupAnnual1` assert, shell `연봉` |
| 4 | Clauses | `fix-clauses-baseball.cjs` | ✅ sell-on stripped/blocked; loan **offer** events `cond:()=>!1`; opt-out + `optOutTest` cheat |
| 5 | Calendar | `fix-calendar-baseball.cjs` | ✅ 트레이드/FA copy; midnight chain preserved |
| 6 | Intl 5 events | `fix-intl-baseball.cjs` | ✅ `Q7` sparse WBC·프리미어12·아시안게임·올림픽·아시아야구선수권 |
| 7 | Terms + camp | `fix-terms-baseball.cjs`, `fix-offseason-camp.cjs` | ✅ `callupOffSeasonCamp` + `offCampTest` cheat |

**Build wire (`tools/build-callup.ps1`):** `fix-deadline-midnight` → clubs → rename → salary → clauses → calendar → intl → terms → offseason-camp → **`check-soccer-residual`** → `enable-cheats`. Order matches plan.

**Diff vs base:** 20 tracked files (+8 new `tools/fix-*.cjs`, `check-soccer-residual.ps1`, clubs JSON, engine/shell/assets patches). Large `docs/egm-review/*` and `tools/_*.cjs` probes are **untracked** — out of merge-critical path unless humans curate.

---

## Spec §12 success criteria

| # | Criterion | Assessment |
|---|-----------|------------|
| 1 | 4-market clubs + name edit | ✅ Static; rename smoke **not** fully proven on device |
| 2 | 연봉 + weekly cut ÷52 | ✅ Code + assert; week-fee smoke **deferred** |
| 3 | No 이적시장/월드컵/임대/셀온 user copy (gate list) | ✅ Gate patterns 0 hits |
| 4 | 위약금·옵트아웃 visible + opt-out agenda | ✅ Patched; opt-out **in-play** unverified |
| 5 | Off-season 전지훈련/아카데미 agenda | ✅ Engine hook; UI reachability **deferred** |

---

## Critical

**None.** No spec gate failure, no build-wire break, no checker regression on current assets.

---

## Important (pre-release)

1. **Device deep smoke incomplete** — `baseball-residual-gate-notes.md`: install vc142 noted; interactive checks (nego 연봉 week fee, `optOutTest` → inbox, `offCampTest` / natural off-season UI, rename → card/nego → reset) still **partial/deferred**. Same gap across task-2/3/4 reviews.

2. **Loan / 임대 not fully excised** — Primary paths disabled (`loanOffer`, `rc_loan_offer`, `bench_loan`, `sp_bn_loanask` → `cond:()=>!1`; shell `임대 목록` removed). Engine **narrative / legacy loan branches** (`b.loan`, story copy) remain; gate does **not** assert `loan`/`임대` absence. Matches known carry: strings with unreachable `cond`.

3. **Checker scope gap** — `check-soccer-residual.ps1` does not cover **임대·셀온·loan** or EN/ES bundles. Static PASS is necessary but not sufficient for clause package acceptance.

4. **Opt-out behavior unproven** — `callupOptOutSeason` → `kind:"renewal"` agenda; FA-eligibility hook not exercised. **Renew vs transfer** `optOutYear` formula asymmetry (task-4 review) still undocumented in product terms.

5. **Story / scout copy soccer residue (KO)** — e.g. scout lines still reference **“공을 받는 첫 터치”** in engine; outside gate regex. Low frequency but violates spirit of §8 for long-play narrative.

6. **EN/ES i18n** — `ui-DgYnPcSw.js` / `ui-DSX53OnJ.js` retain soccer-flavored **EN/ES** strings (`fichar`, legacy structure). KO-primary product OK for this gate; bilingual QA still open.

---

## Minor (carry / tech debt)

| Item | Notes |
|------|--------|
| **wc cyclic aliases** | ~277 key slots cycling **58** canonical city names (58 = KR+JP+TW+US clubs). Display OK; internal redundancy. |
| **Club editor textarea** | Seeds `id\|club.name` not resolved display name (`Te`/`G`). |
| **`!1&&` shell guards** | Fragile on minifier churn (sell-on rows). |
| **Untracked probes** | Many `tools/_find-*.cjs`, `diag-*.cjs` — dev-only clutter. |
| **Terms patch side effect** | `fix-clubs-baseball.cjs` still lists `["1부 리그 임대","1군 임대"]` in pairs table — verify no user hit (not in gate set). |

---

## Strengths

- **Repeatable patch pipeline** — eight `fix-*-baseball` scripts + shared `rep()` / marker idempotency (`CALLUP_*`); failures surface at build time via `check-soccer-residual`.
- **Save discipline** — `callupAssertBaseball` stamps `clubNick`, `callupAnnual1`, clauses/terms flags; rejects weekly-scale legacy wages.
- **Defense in depth (clauses)** — remove sell-on from `L_`, `Z_` block, dead-code payout, clause persistence, shell hide.
- **Cheats for QA** — `optOutTest`, `offCampTest` wired for smoke without long calendar grind.
- **4-market collapse** — `y0`/league maps collapsed to 한국·일본·대만·미국; European country labels 0 in engine probe.
- **Plan order respected** — implementation sequence 1→2→5→3→4→6→7 reflected in build wire and progress log.
- **Single final APK line** — progress + `apktool.yml` agree on **callup.27 / vc142**.

---

## Evidence (spot checks)

```
powershell -File tools/check-soccer-residual.ps1
→ soccer-residual hits: 0 files | GATE PASS

node tools/_probe-us-clubs.cjs
→ euro motif 0; 한국/일본/대만/미국 league labels present

apk-src/apktool.yml
→ versionName: 0.1.0-callup.27, versionCode: 142

engine markers present: callupOffSeasonCamp, callupOptOutSeason, CALLUP_ANNUAL_ASSERT, clubNick init
```

---

## Recommended follow-ups (post-merge)

1. One **scripted device pass** on vc142: new game → rename club → nego 연봉 → advance week (fee) → clause opt-out cheat → off-season camp cheat or calendar to `qb`.
2. Optional: extend checker with **임대|셀온|sellOn** allowlist dead-copy only, or grep CI step.
3. Backlog: prune loan narrative strings; baseballize high-traffic story scouts (`Op()` etc.).
4. Human: commit curated set (exclude egm screenshot dump unless desired).

---

## Merge readiness (summary)

**Conditional GO:** Integrate working tree to preserve package 1–7 work. **No Critical defects.** Complete **Important** interactive smoke before marketing a release beyond internal prototype. Static residual gate **PASS** supports merge; release confidence needs device checklist above.