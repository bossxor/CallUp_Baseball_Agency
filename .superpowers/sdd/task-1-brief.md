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
