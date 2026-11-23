# Phase B Baseball Sim Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace soccer position/ability/record schema with full baseball 9-position sim in the CallUp APK fork, reject old saves (B1), and purge remaining SignHere/soccer identity from engine+UI.

**Architecture:** Patch `engine-DhPc-c_J.js` maps and call sites in place (no engine rewrite). Expand `Ss`/`Rt`/world-gen/demand/XI assumptions from 4 soccer slots to 9 baseball codes. Shell/UI consume new labels and stats. Final purge via expanded `check-identity.ps1` + `check-soccer-schema.ps1`.

**Tech Stack:** `T:\CallUp\apk-src` WebView assets, Node patch scripts under `T:\CallUp\tools`, `build-callup.ps1`, adb device smoke.

**Spec:** [docs/superpowers/specs/2026-11-23-phase-b-baseball-sim-design.md](../specs/2026-11-23-phase-b-baseball-sim-design.md)

## Global Constraints

- Save policy **B1**: soccer-schema saves must not load; no migration.
- Positions exactly: `P C 1B 2B 3B SS LF CF RF`.
- No full engine rewrite; patch maps + call sites.
- User-facing SignHere/soccer strings and soccer keys must be **zero** at Phase B gate (allowlist: Manifest Activity class path if still needed, docs, check scripts).
- Cheats stay for personal builds (`enable-cheats.js`); do not expand.
- Commits only if human asks.

## File map

| File | Role |
| --- | --- |
| `tools/pos-map.json` | Canonical 9-pos + ability + soccer→baseball remap |
| `tools/patch-baseball-sim.cjs` | Applies engine/shell/ui schema patches |
| `tools/check-soccer-schema.ps1` | Fails if GK/DF/MF/FW or soccer ability keys remain in assets |
| `tools/check-identity.ps1` | Existing brand gate; keep green |
| `apk-src/.../engine-DhPc-c_J.js` | Ss, Rt, gen, demand, match stats |
| `apk-src/.../shell-DaKdX7f1.js` | Filters, cards, B1 load reject toast |
| `apk-src/.../ui-*.js` | Copy for stats/positions |
| `build-callup.ps1` | Wire `patch-baseball-sim.cjs` after patch-callup |

---

### Task 1: Canonical maps + schema checker

**Files:**
- Create: `T:\CallUp\tools\pos-map.json`
- Create: `T:\CallUp\tools\check-soccer-schema.ps1`
- Test: run checker on current tree → expect FAIL

**Interfaces:**
- Produces: `pos-map.json` with `positions`, `abilityKeys`, `legacyPos`, `legacyAbility`
- Produces: checker exit 1 while soccer keys remain

- [ ] **Step 1: Write `pos-map.json`**

```json
{
  "positions": ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF"],
  "labelsKo": {
    "P": "투수", "C": "포수", "1B": "1루수", "2B": "2루수", "3B": "3루수",
    "SS": "유격수", "LF": "좌익수", "CF": "중견수", "RF": "우익수"
  },
  "legacyPos": { "GK": "P", "DF": "C", "MF": "IF_LEGACY", "FW": "OF_LEGACY" },
  "note": "legacyPos only for one-shot rewrite scripts; MF/FW expand to IF/OF pool then assign concrete codes in world-gen",
  "abilityKeys": ["bat", "pit", "fld", "spd", "phy"],
  "legacyAbility": ["gk", "sho", "pas", "dri", "def", "pac", "sta"],
  "saveMarker": "callupBaseball1"
}
```

Use concrete codes only in runtime. For MF→infield pool and FW→outfield pool, world-gen picks among `1B|2B|3B|SS` and `LF|CF|RF`.

- [ ] **Step 2: Write `check-soccer-schema.ps1`**

Scan `apk-src/assets/public/assets/*.{js,css,html}` for:
- position tokens as whole words: `\bGK\b`, `\bDF\b`, `\bMF\b`, `\bFW\b` inside `Ss=` / `Rt=` / `pos===\"GK\"` patterns
- ability: `"gk"`, `.gk`, `sho:`, `"sho"` in engine/shell (allowlist none after Task 3+)
- brand leftovers already covered by `check-identity.ps1`

Exit 1 if any hit outside allowlist file names (`check-*.ps1`, `*-design.md`, `pos-map.json`).

- [ ] **Step 3: Run baseline**

```powershell
powershell -File T:\CallUp\tools\check-soccer-schema.ps1
```

Expected: FAIL with many GK/DF hits.

---

### Task 2: Engine position map Ss + weights Rt

**Files:**
- Create: `T:\CallUp\tools\patch-baseball-sim.cjs`
- Modify: `T:\CallUp\apk-src\assets\public\assets\engine-DhPc-c_J.js`
- Test: `node -e` asserts `Ss={P:` present and `Ss={GK` absent

**Interfaces:**
- Consumes: `pos-map.json`
- Produces: `Ss` 9-entry label map; `Rt` 9-entry ability weights using `bat|pit|fld|spd|phy`

- [ ] **Step 1: Add patch script skeleton** that reads engine path and `pos-map.json`, replaces exact current substring:

From (current tree):

```js
Ss={GK:"투수",DF:"내야수",MF:"외야수",FW:"타자"},Rt={GK:{gk:.8,phy:.1,pas:.1},DF:{def:.45,phy:.25,pac:.15,pas:.15},MF:{pas:.35,dri:.25,def:.15,sho:.1,phy:.1,pac:.05},FW:{sho:.4,dri:.2,pac:.2,phy:.1,pas:.1}}
```

To:

```js
Ss={P:"투수",C:"포수","1B":"1루수","2B":"2루수","3B":"3루수",SS:"유격수",LF:"좌익수",CF:"중견수",RF:"우익수"},Rt={P:{pit:.75,phy:.15,spd:.1},C:{fld:.4,bat:.25,phy:.25,spd:.1},"1B":{bat:.35,fld:.3,phy:.25,spd:.1},"2B":{fld:.35,bat:.25,spd:.25,phy:.15},"3B":{fld:.35,bat:.3,phy:.25,spd:.1},SS:{fld:.4,spd:.25,bat:.25,phy:.1},LF:{bat:.4,spd:.25,fld:.2,phy:.15},CF:{spd:.35,fld:.3,bat:.25,phy:.1},RF:{bat:.4,fld:.25,spd:.2,phy:.15}}
```

- [ ] **Step 2: Find ability key list `u2`** in engine (array of soccer keys used by `Uw`). Replace with `["bat","pit","fld","spd","phy"]` (keep `phy` if already present).

- [ ] **Step 3: Patch `Uw` / `Ze` branches** that special-case `e==="GK"` or `r==="gk"` to `e==="P"` / `r==="pit"`.

Use scripted replace pairs in `patch-baseball-sim.cjs`:

```js
["e===\"GK\"", "e===\"P\""],
["e===\"DF\"", "e===\"C\""],
["e===\"MF\"", "/*MF*/e===\"SS\""], // temporary — Task 3 expands properly
["r===\"gk\"", "r===\"pit\""],
["n.gk", "n.pit"],
```

Do **not** leave `/*MF*/` markers — Task 3 must clear all soccer pos equality to a helper `isPos(e,\"SS\")` or expand each site.

- [ ] **Step 4: Run patch + verify**

```powershell
node T:\CallUp\tools\patch-baseball-sim.cjs T:\CallUp\apk-src
node -e "const s=require('fs').readFileSync('T:/CallUp/apk-src/assets/public/assets/engine-DhPc-c_J.js','utf8'); if(s.includes('Ss={GK')) process.exit(1); if(!s.includes('Ss={P:')) process.exit(2); console.log('Ss ok');"
```

Expected: `Ss ok`

---

### Task 3: World-gen + demand + lineup (9 slots)

**Files:**
- Modify: `engine-DhPc-c_J.js` via `patch-baseball-sim.cjs`
- Test: new game world-gen does not throw; players have only 9 codes

**Interfaces:**
- Consumes: `Ss` keys
- Produces: generators emit `P|C|1B|…|RF` only; club need vectors length 9

- [ ] **Step 1: Inventory call sites**

```powershell
node T:\CallUp\tools\scan-pos.js
```

List every `pos===\"GK\"` / `[\"GK\",\"DF\",\"MF\",\"FW\"]` / need-array length 4 pattern into `docs/egm-review/phase-b-pos-sites.md` (path list only).

- [ ] **Step 2: Replace position arrays**

Any `["GK","DF","MF","FW"]` → `["P","C","1B","2B","3B","SS","LF","CF","RF"]`.

Random pick helpers that used 0..3 for pos index → 0..8.

- [ ] **Step 3: Club demand**

Where soccer used counts per GK/DF/MF/FW, expand to per-9 with defaults e.g. pitchers heavier (`P` need 5–7), one `C`, two middle infield, etc. Keep numbers in one `NEED0` constant object in the patch so tuning is one place:

```js
NEED0={P:6,C:2,"1B":2,"2B":2,"3B":2,SS:2,LF:2,CF:2,RF:2}
```

- [ ] **Step 4: Starting XI**

Soccer XI (~11) paths: rename conceptually to defense nine + pitcher. If code assumes `xi.length===11` or fills GK first, change to build 9 fielders + starting `P`. Minimum viable: stop requiring GK; pick best `P` + best by `fld` for other slots.

- [ ] **Step 5: Smoke world-gen**

Build+install (or node extract if harness exists). New game must reach week 0 without exception. Log 20 player `.pos` values — only 9 codes.

---

### Task 4: Match records bat/pit

**Files:**
- Modify: `engine-DhPc-c_J.js` match/stat accumulators
- Modify: `shell-DaKdX7f1.js` / `ui-*.js` stat labels
- Test: after 1 week, player card shows 타석/안타 or IP/K not goals/assists

**Interfaces:**
- Produces: season stats object fields `ab,h,tb,bb,so,pa` (hitters) and `outs,k,bb,er` (pitchers) — pick exact names once in patch and use everywhere

- [ ] **Step 1: Choose field names** (lock in patch):

```js
// hitter: {pa, ab, h, tb, rbi, bb, so}
 // pitcher: {outs, k, bb, er, w, l}  // ERA = er / (outs/27)
```

- [ ] **Step 2: Replace goal/assist increments** in match resolution with baseball increments (even if underlying match RNG stays crude). Pitchers update `outs/k/bb/er`; others update `pa/ab/h/...`.

- [ ] **Step 3: UI labels** in shell/ui pairs:

```js
["득점", "타점"], // only in stat label contexts — prefer exact keys
["골", "홈런"],   // dangerous; prefer replacing specific i18n keys only
["출전", "출장"],
```

Prefer patching display formatters that print `goals` → print `h` / `er`.

- [ ] **Step 4: Device smoke** — advance 1–4 weeks; open client card; screenshot to `docs/egm-review/phase-b-card.png`.

---

### Task 5: B1 save reject

**Files:**
- Modify: `engine-DhPc-c_J.js` save/load
- Modify: `shell-DaKdX7f1.js` load error toast
- Test: old save slot fails with Korean message; new save loads

**Interfaces:**
- Produces: saves write `agency.callupBaseball1 = true` (or top-level marker from `pos-map.saveMarker`)
- Produces: load throws/`return null` if marker missing OR any player `pos` in `GK|DF|MF|FW`

- [ ] **Step 1: On successful new-game init**, set marker:

```js
agency.callupBaseball1 = true
```

- [ ] **Step 2: On parse/load**, if `!agency.callupBaseball1` OR players contain legacy pos:

```js
throw new Error("콜업 야구 세이브만 지원합니다. 새 게임을 시작하세요.")
```

Shell already toasts save errors — ensure message surfaces.

- [ ] **Step 3: Verify** with existing `햇살` slot if present → reject; new game → OK.

---

### Task 6: Shell/UI filters + copy purge

**Files:**
- Modify: `shell-DaKdX7f1.js`, `ui-DSX53OnJ.js`, `ui-DgYnPcSw.js`
- Modify: `tools/patch-callup.cjs` label pairs if needed
- Test: scout filter shows 9 positions; no 골키퍼/미드필더

- [ ] **Step 1: Position filter chips** — replace 4 soccer filters with 9 baseball (or group Pitcher / Catcher / IF / OF that map to code sets).

- [ ] **Step 2: Grep purge**

```powershell
rg -n "골키퍼|미드필더|공격수|수비수|해트트릭|Football|Sign Here|사인히어|\\bGK\\b" T:\CallUp\apk-src\assets\public\assets --glob "*.js"
```

Fix hits via patch pairs until clean (except allowlisted).

- [ ] **Step 3: Run `check-identity.ps1`** — PASS

---

### Task 7: Wire build + full gates

**Files:**
- Modify: `T:\CallUp\tools\build-callup.ps1`
- Create: `T:\CallUp\docs\egm-review\phase-b-gate-notes.md`
- Modify: `docs/apk-fork-inventory.md` — remove “내부 GK 유지” as current policy; point to Phase B done

**Interfaces:**
- Produces: APK `0.1.0-callup.5` (or next code) with all gates

- [ ] **Step 1: Insert into `build-callup.ps1` after `patch-callup` / bright / scenes / defaults:**

```powershell
node (Join-Path $PSScriptRoot 'patch-baseball-sim.cjs') $SourceDir
if ($LASTEXITCODE -ne 0) { throw 'patch-baseball-sim failed' }
```

- [ ] **Step 2: Build install**

```powershell
powershell -File T:\CallUp\tools\build-callup.ps1 -VersionCode 120 -VersionName 0.1.0-callup.5
adb install -r T:\CallUp\CallUp-Prototype.apk
```

- [ ] **Step 3: Run both checkers**

```powershell
powershell -File T:\CallUp\tools\check-identity.ps1
powershell -File T:\CallUp\tools\check-soccer-schema.ps1
```

Expected: both GATE PASS

- [ ] **Step 4: Manual gate checklist** from spec §8 → write `phase-b-gate-notes.md`

- [ ] **Step 5: Stop** — do not start Phase C until human asks

---

## Spec coverage

| Spec item | Task |
| --- | --- |
| B1 saves | Task 5 |
| Full 9 positions | Tasks 2–3, 6 |
| Ability keys bat/pit/fld/spd | Task 2 |
| Baseball records | Task 4 |
| Purge SignHere/soccer | Tasks 1, 6, 7 |
| Gates §8 | Task 7 |

## Self-review

- No TBD steps; concrete replace targets from current `Ss`/`Rt` snapshot.
- `IF_LEGACY` only in pos-map note — runtime uses concrete 9 codes only.
- Checkers are the automated tests for this minify APK context.
