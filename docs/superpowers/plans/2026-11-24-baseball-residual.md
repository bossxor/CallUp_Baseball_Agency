# Baseball Residual Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align remaining soccer systems/copy in the CallUp APK fork to baseball (4 markets, annual salary, trade/FA windows, 5 intl events, contract clauses, terms, off-season camp choice).

**Architecture:** Same as Phase A/B — Node `tools/fix-*.cjs` string/map patches on minify assets, wired into `build-callup.ps1`. No engine rewrite. One APK smoke per package task when possible; do not land all packages untested.

**Tech Stack:** `apk-src` WebView JS, Node patch scripts, `build-callup.ps1`, adb/`tools/android` device smoke, `data/callup-clubs.json`.

**Spec:** [docs/superpowers/specs/2026-11-24-baseball-residual-design.md](../specs/2026-11-24-baseball-residual-design.md)

## Global Constraints

- Spec order: packages **1 → 2 → 5 → 3 → 4 → 6 → 7**.
- Markets only: 한국 · 일본 · 대만 · 미국. No Europe in user-facing leagues/clubs.
- Korea tiers: 1군 · 2군 only (no 성남 야구고 / amateur club slot).
- US tiers: 메이저 + 마이너 1단 (no AA/AAA).
- Salary stored/negotiated as **연봉**; weekly agency cut = 연봉/52 × rate.
- Delete soccer **임대** and **셀온**. Keep 위약금. Add **옵트아웃**.
- Intl labels: WBC · 프리미어12 · 아시안게임 · 올림픽 · 아시아야구선수권 only (no APBC, no FIFA/UEFA user copy).
- Phase C draft / new domestic salary season flow: **out of scope**.
- Commits only when human asks.
- Cheats stay.

## File map

| File | Role |
| --- | --- |
| `data/callup-clubs.json` | Canonical club names (add US 30; drop KR amateur) |
| `tools/fix-clubs-baseball.cjs` | Replace `wc` map + league country collapse + name display |
| `tools/fix-club-rename.cjs` | Bulk rename UI + save nicknames |
| `tools/fix-salary-annual.cjs` | 주급→연봉, weekly /52 fee math |
| `tools/fix-clauses-baseball.cjs` | Remove loan/sell-on; buyout labels; opt-out |
| `tools/fix-calendar-baseball.cjs` | Summer/winter → trade/FA; deadline copy |
| `tools/fix-intl-baseball.cjs` | WC/FIFA/U17 calendar → 5 baseball events |
| `tools/fix-terms-baseball.cjs` | 주전/메디컬/유소년 copy |
| `tools/fix-offseason-camp.cjs` | Off-season camp vs academy agenda |
| `tools/check-soccer-residual.ps1` | Gate: euro clubs, 주급, 월드컵, 임대, 셀온 |
| `tools/build-callup.ps1` | Wire new fix scripts after `fix-deadline-midnight.cjs` |
| `apk-src/.../engine-DhPc-c_J.js` | Maps, calendar, contracts, fees |
| `apk-src/.../shell-DaKdX7f1.js` | UI labels, rename, agendas |
| `apk-src/.../names-*.js` / `ui-*.js` | i18n club/event strings as needed |
| `docs/egm-review/phase-b-gate-notes.md` or new residual gate notes | Smoke log |

---

### Task 1: Clubs data + Europe → 4 markets

**Files:**
- Modify: `data/callup-clubs.json`
- Create: `tools/fix-clubs-baseball.cjs`
- Modify: `tools/build-callup.ps1`
- Create: `tools/check-soccer-residual.ps1` (baseline FAIL then tighten per task)
- Modify: `apk-src/assets/public/assets/engine-DhPc-c_J.js` (via script)
- Modify: `apk-src/assets/public/assets/names-*.js` if club display keys live there

**Interfaces:**
- Produces: JSON with KR10 / JP12 / TW6 / US30 city aliases; no `amateur`
- Produces: engine `wc` (or successor display map) keyed only to baseball aliases
- Consumes: existing club id slots — remap names in place; shrink/hide non-4-market leagues

- [ ] **Step 1: Update `callup-clubs.json`**

Remove `amateur` / 성남. Set KR tiers `["1군","2군"]`. Add US clubs array (30 city aliases), example:

```json
"US": {
  "label": "미국",
  "tiers": ["메이저", "마이너"],
  "clubs": [
    "뉴욕", "보스턴", "필라델피아", "워싱턴", "애틀랜타",
    "마이애미", "탬파", "토론토", "볼티모어", "시카고북",
    "시카고남", "클리블랜드", "디트로이트", "미네소타", "캔자스시티",
    "휴스턴", "세인트루이스", "밀워키", "신시내티", "피츠버그",
    "LA", "샌프란", "샌디에이고", "애리조나", "콜로라도",
    "시애틀", "텍사스", "오클랜드", "LA남", "탬파만"
  ]
}
```

Keep KR/JP/TW clubs already in file. Drop duplicate placeholder note about soccer mapping.

- [ ] **Step 2: Write failing residual checker**

`tools/check-soccer-residual.ps1` scans `apk-src/assets/public/assets/*.{js,css,html}` for user-facing hits:

```
맨시티|레알 마드리드|바르셀로나|아스널|리버풀
주급
월드컵|FIFA|UEFA
여름 영입|겨울 영입
```

(Allowlist: this plan/spec, check script itself.) Exit 1 on hit. Run once → expect FAIL.

- [ ] **Step 3: Implement `fix-clubs-baseball.cjs`**

Pattern like `fix-deadline-midnight.cjs`:

1. Load `data/callup-clubs.json`.
2. Build ordered alias list length matching current top-flight club count used by world gen for KR/JP/TW/US only.
3. Replace `const wc={...}` soccer real→alias map with baseball city aliases (values = display names from JSON).
4. Replace league display maps that still say 잉글랜드/스페인/… with 한국/일본/대만/미국 (and 1군/2군/메이저/마이너). Prefer **collapse**: clubs whose `league.country` is outside KR/JP/TW/US get reassigned or filtered from scout/world lists — find `y0` / country table near agency nat and patch so generation only picks 4 markets.
5. Grep after patch: `맨시티` count 0 in engine+shell user strings.

Exact replace targets must be discovered with a one-off probe in the task (print `wc` length, league label counts) before writing the final join pairs — do not invent substrings that are not in the file.

- [ ] **Step 4: Wire build + unit probe**

Add to `build-callup.ps1` after `fix-deadline-midnight.cjs`:

```powershell
    node (Join-Path $PSScriptRoot 'fix-clubs-baseball.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-clubs-baseball failed' }
```

Run: `node tools/fix-clubs-baseball.cjs`  
Expected: log replaced pair counts > 0; re-run idempotent.

- [ ] **Step 5: Build APK + smoke**

```powershell
powershell -File T:\CallUp\tools\build-callup.ps1
# install via existing flow; new game; open league / club list
```

Expected: only KR/JP/TW/US names; no European club labels on first screens.

---

### Task 2: Club rename (bulk edit)

**Files:**
- Create: `tools/fix-club-rename.cjs`
- Modify: `shell-DaKdX7f1.js` (league / settings surface)
- Modify: engine display helper that resolves club name (wrap `T(club)` / `wc[...]` path)

**Interfaces:**
- Produces: save field e.g. `agency.clubNick: { [clubId:number]: string }`
- Produces: UI “구단 이름 편집” — textarea or list; Reset defaults
- Consumes: Task 1 default names

- [ ] **Step 1: Locate display**

```powershell
node -e "const fs=require('fs');const e=fs.readFileSync('apk-src/assets/public/assets/engine-DhPc-c_J.js','utf8'); console.log(/function T\(|wc\[|club\.name/.test(e));"
```

Find single function used for club label in UI (often `T(club)` importing from i18n). Plan: nick map overrides default before i18n.

- [ ] **Step 2: Patch save + resolver**

Minimal approach:
- On load/new game ensure `agency.clubNick = agency.clubNick || {}`.
- Display: `nick[id] || defaultName(club)`.
- Shell league panel: button opens textarea `id|name` lines or per-row inputs; Save writes `clubNick`; Reset clears map.

If prototype source for bulk edit is not in repo, implement this minimal shell modal — do not rebuild full v0.1.10 React league page.

- [ ] **Step 3: Wire `fix-club-rename.cjs` into build; smoke**

Rename one club → appear on player card / nego → Reset restores JSON default.

---

### Task 3: Annual salary

**Files:**
- Create: `tools/fix-salary-annual.cjs`
- Modify: engine (wage fields, `*52` fee paths that mean weekly↔annual), shell (주급 labels)

**Interfaces:**
- Produces: negotiated/stored amount = annual; weekly income `Math.floor(annual/52 * feeRate)` (match existing fee field names after probe)
- Produces: UI `주급` → `연봉` (except explanatory “연봉의 주간 분” if needed)
- Old weekly-schema saves: reject via existing soft assert / B1 family (extend message if needed)

- [ ] **Step 1: Probe fee sites**

```powershell
node -e "const fs=require('fs');const e=fs.readFileSync('apk-src/assets/public/assets/engine-DhPc-c_J.js','utf8'); let i=0; for (const m of e.matchAll(/\*52/g)) { if(i++<8) console.log(e.slice(m.index-60,m.index+40)); }"
```

Classify each `*52`: calendar week-of-year vs wage. **Only patch wage/fee sites**, not `e*52` calendar keys / U-17 week math.

- [ ] **Step 2: Patch script**

```js
// examples — replace with exact strings from probe
["주급 수수료", "연봉 수수료"],
["주급", "연봉"], // careful: run count; prefer longer phrases first
```

For weekly tick: if code does `wage * rate` assuming weekly wage, change to `(wage/52)*rate` when wage is now annual. If code already does `wage*52` for annual display, invert consistently so **one** meaning of the stored number = annual.

- [ ] **Step 3: Shell copy + build wire + smoke**

Nego screen shows 연봉. Advance one week; agency cash change matches ÷52 expectation (use cheats to set known annual).

---

### Task 4: Contract clauses (loan/sell-on out, buyout, opt-out)

**Files:**
- Create: `tools/fix-clauses-baseball.cjs`
- Modify: engine contract flags / event tables (`rc_loan_*`, `sellOn`, `buyout`)
- Modify: shell contract rows

**Interfaces:**
- Produces: no user path to 임대 / 셀온
- Produces: buyout labeled 위약금/계약 해제
- Produces: `optOutYear` (or reuse unused flag slot) on contracts; week tick may fire agenda when `year==optOutYear`

- [ ] **Step 1: Inventory**

Count `임대`, `sellOn`, `셀온`, `buyout`, `위약금` in engine+shell. List event ids containing `loan`.

- [ ] **Step 2: Disable loan/sell-on**

- Remove/replace loan offer event copy with no-op or delete opts that set `{loan:!0}` from appearing (prefer `when:()=>false` on loan events if id-stable).
- Zero sell-on UI rows; force sell-on fee 0.

- [ ] **Step 3: Opt-out**

Minimal: when generating multi-year deals, set `optOut` to year index 1 or 2 with low probability OR always show toggle in nego stamp rows. On season boundary if `optOut` triggers → mark player FA-eligible / open re-nego agenda (reuse existing FA/recontract hooks).

- [ ] **Step 4: Wire + smoke**

No 임대/셀온 in contract UI. 위약금 visible. Force opt-out via cheat or test flag → agenda appears.

---

### Task 5: Calendar windows + deadline copy

**Files:**
- Create: `tools/fix-calendar-baseball.cjs`
- Modify: engine strings around `여름 영입시장` / `겨울 영입시장` / deadline (post-midnight patch)

**Interfaces:**
- Produces: labels 트레이드 기간 / FA·재계약 기간 / 트레이드 데드라인
- Keeps `Kt=24` midnight behavior from `fix-deadline-midnight.cjs`

- [ ] **Step 1: Exact replacements**

```js
const pairs = [
  ["여름 영입시장 오픈", "트레이드 기간 오픈"],
  ["여름 영입시장 마감", "트레이드 기간 마감"],
  ["겨울 영입시장 오픈", "FA·재계약 기간 오픈"],
  ["겨울 영입시장 마감", "FA·재계약 기간 마감"],
  ["여름 영입시장이 열린 밤", "트레이드 기간이 열린 밤"],
  ["영입시장이 닫혀요", "트레이드 시장이 닫혀요"],
  ["데드라인", "트레이드 데드라인"], // verify counts; prefer longer phrases first
];
```

Adjust after `split` counts on live file.

- [ ] **Step 2: Wire after clubs/salary; smoke calendar news labels**

---

### Task 6: International events (5)

**Files:**
- Create: `tools/fix-intl-baseball.cjs`
- Modify: engine calendar array that builds `WC` / `U17` / UEFA cup name maps (`ew={...}`)

**Interfaces:**
- Produces: event names only from: WBC, 프리미어12, 아시안게임, 올림픽, 아시아야구선수권
- Reuses existing week offsets / conts flags; remap names and team counts lightly

- [ ] **Step 1: Find calendar seed**

Probe showed pattern like:

```js
x.push({key:"U17"+e,name:e+" U-17 세계 선수권",w:t+20,...})
```

and `ew={"UEFA 챔피언스리그":...}`.

Replace UEFA/AFC club competition **user labels** with baseball intl set or remove from display map. Remap World Cup style keys to WBC / Premier12 / Asian Games / Olympics / Asian Championship on a repeating multi-year schedule (keep sparse — not every year all five).

Suggested cadence (patch constants, not a new simulator):

| Event | Offset idea |
| --- | --- |
| WBC | every 4 years, week ~10 |
| 프리미어12 | every 4 years offset +2 |
| 아시안게임 | every 4 years |
| 올림픽 | every 4 years |
| 아시아야구선수권 | every 2 years |

- [ ] **Step 2: Checker update** — `월드컵|FIFA|UEFA` must be 0 in assets (allowlist docs).

- [ ] **Step 3: Wire + smoke** — office news eventually shows one baseball intl name (cheat week jump if available).

---

### Task 7: Terms copy + off-season camp

**Files:**
- Create: `tools/fix-terms-baseball.cjs`
- Create: `tools/fix-offseason-camp.cjs`
- Modify: engine/shell/ui copy; agenda generator for off-season

**Interfaces:**
- Terms table from spec §8
- Off-season agenda: options 전지훈련 / 아카데미·동계 육성 / 스킵; small bonuses only

- [ ] **Step 1: Terms pairs** (longer first)

```js
[
  ["유소년 아카데미", "육성 시설"],
  ["유소년", "아마추어"],
  ["아카데미", "육성"],
  ["메디컬", "메디컬 체크"],
  // 주전/벤치: context-sensitive — prefer phrase-level
  ["주전으로", "선발로"],
  ["벤치에서", "벤치·대기에서"],
]
```

Run counts; avoid breaking unrelated “주전” in baseball-correct sentences.

- [ ] **Step 2: Off-season camp**

Find off-season week predicate (post-season / before preseason flags). Inject agenda once per off-season per top client:

```js
{
  title: "동계 준비 — {player}",
  opts: [
    { label: "전지훈련", run: /* cond +1 small */ },
    { label: "아카데미·동계 육성", run: /* growth small */ },
    { label: "스킵", run: /* noop */ },
  ]
}
```

Reuse existing `O0` / mail agenda API from scout-return patterns (exact symbol names from probe).

- [ ] **Step 3: Final checker**

`check-soccer-residual.ps1` must PASS for blocked patterns. Build APK. Full smoke: new game → weeks → nego 연봉 → club rename → off-season choice when reachable (cheat calendar if needed).

- [ ] **Step 4: Gate notes**

Append `docs/egm-review/baseball-residual-gate-notes.md` with APK version, checker result, device id, pass/fail per package.

---

## Self-review (author)

1. **Spec coverage:** §3 clubs→T1+T2; §4 salary→T3; §5 calendar→T5; §6 intl→T6; §7 clauses→T4; §8–9 terms/camp→T7; §10 save/smoke embedded; order matches §2.
2. **Placeholders:** Probe steps are explicit commands; replace pairs marked to verify on live file before commit.
3. **Consistency:** Annual wage meaning single-valued; `fix-deadline-midnight` kept; build wire order after midnight fix.

## Execution

Plan complete and saved to `docs/superpowers/plans/2026-11-24-baseball-residual.md`.

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between  
**2. Inline Execution** — this session with executing-plans checkpoints  

Which approach?
