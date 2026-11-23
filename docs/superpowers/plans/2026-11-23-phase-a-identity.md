# Phase A Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove SignHere/football identity from user-facing CallUp APK surfaces so title→home cannot be mistaken for SignHere, without touching engine sim keys.

**Architecture:** Keep APK-fork patch pipeline (`patch-callup.cjs` → `patch-bright.js` → `enable-cheats.js` → `build-callup.ps1`). Extend safe string/CSS/asset overlays only. Do not rename internal `GK`/`DF` or ability keys. Activity smali path may stay `com.signhere.offline.MainActivity`; user-visible `com.signhere` must be zero.

**Tech Stack:** apktool tree `T:\CallUp\apk-src`, Node patch scripts under `T:\CallUp\tools`, WebView assets in `assets/public`, Android `res/`, adb device install.

**Spec:** [docs/superpowers/specs/2026-11-23-new-game-roadmap-design.md](../specs/2026-11-23-new-game-roadmap-design.md) §3 Phase A

## Global Constraints

- No engine internal position/ability key renames (world-gen break history).
- Forbidden look: bg `#141516` + accent `#C5F23C` + Damion/Bebas combo reintroduced as product look.
- Package label stays `콜업` / `com.callup.agency`.
- Cheats stay enabled for personal builds via `enable-cheats.js`; do not expand cheat features.
- Work only under `T:\CallUp` APK fork unless a task says otherwise.
- Commits only if the human asks.

---

### Task 1: Identity grep baseline

**Files:**
- Create: `T:\CallUp\tools\check-identity.ps1`
- Test: run script; capture baseline counts

**Interfaces:**
- Consumes: none
- Produces: exit 0 when user-facing hits == 0 (after later tasks); for this task, script exists and prints counts

- [ ] **Step 1: Write check script**

Script greps (case-sensitive where noted) under `apk-src`:

User-facing paths:
- `assets/public/**/*.{html,js,css}` excluding comments-only lines if easy
- `res/**/*.xml`
- `AndroidManifest.xml`

Patterns: `사인히어`, `Sign Here`, `SignHere`, `Football Agent`, `Football Agency`, `풋볼`, `축구 에이전`

Allowlist (do not fail):
- `callup-theme.css` comments containing `SignHere`
- `cheats.css` hex `#141516` if any
- minify engine keys that are not user strings (document any false positives in script comments)

- [ ] **Step 2: Run baseline**

```powershell
powershell -File T:\CallUp\tools\check-identity.ps1
```

Expected: FAIL or non-zero counts (terms.html / privacy.html still dirty). Save output path note in chat; no commit required.

- [ ] **Step 3: Stop** — baseline only. Next task fixes legal HTML.

---

### Task 2: Legal / meta HTML brand wipe

**Files:**
- Modify: `T:\CallUp\apk-src\assets\public\terms.html`
- Modify: `T:\CallUp\apk-src\assets\public\privacy.html`
- Modify: `T:\CallUp\tools\patch-callup.cjs` (ensure re-apply on rebuild)

**Interfaces:**
- Consumes: brandPairs pattern from patch-callup
- Produces: pages titled/body as Call Up / 콜업 baseball agency; no Sign Here Football Agent

- [ ] **Step 1: Replace user-visible strings in terms.html and privacy.html**

Examples of required end state:
- Title: `서비스 약관 | 콜업` / `개인정보처리방침 | 콜업`
- App name EN: `Call Up: Baseball Agency`
- Body game name: `Call Up: Baseball Agency` (or Korean `콜업: 야구 에이전시`)
- Operator string: keep or replace `멍때림 스튜디오` per product choice — if kept, do not reintroduce Sign Here

- [ ] **Step 2: Add durable pairs to `patch-callup.cjs` privacy/terms patch section** so rebuild does not regress

- [ ] **Step 3: Re-run identity check focused on html**

```powershell
powershell -File T:\CallUp\tools\check-identity.ps1
```

Expected: zero hits in `terms.html` / `privacy.html`

---

### Task 3: Shell/UI copy residual pass

**Files:**
- Modify: `T:\CallUp\tools\patch-callup.cjs` (`brandPairs` / `labelPairs`)
- Modify (via patch): `apk-src/assets/public/assets/shell-DaKdX7f1.js`, `ui-*.js`, `i18n-*.js` as patch targets already listed

**Interfaces:**
- Consumes: existing `applyPairs` pipeline
- Produces: no user-visible SignHere/Football/축구 에이전 in patched bundles

- [ ] **Step 1: Grep remaining hits in js bundles**

```powershell
rg -n "Sign Here|SignHere|Football Agent|사인히어|풋볼 에이전|축구 에이전" T:\CallUp\apk-src\assets\public\assets --glob "*.js"
```

- [ ] **Step 2: Add missing safe replace pairs to patch-callup only for user strings** (not engine ability keys)

- [ ] **Step 3: Run patch + identity check**

```powershell
node T:\CallUp\tools\patch-callup.cjs T:\CallUp\apk-src
node T:\CallUp\tools\patch-bright.js T:\CallUp\apk-src
node T:\CallUp\tools\enable-cheats.js T:\CallUp\apk-src
powershell -File T:\CallUp\tools\check-identity.ps1
```

Expected: allowlisted leftovers only

---

### Task 4: Title / emblem / soccer-scene exposure

**Files:**
- Modify: `T:\CallUp\tools\callup-theme.css` (and sync to `apk-src/.../callup-theme.css`)
- Modify: existing title patches (`patch-title-gesture.js` / pageflip tools if still used) OR fold CSS hides into `callup-theme.css`
- Reference assets: `goal-*.webp`, `shootout-*.webp`, `adshoot-*.webp`, `stadium-*.webp`, `office-*.webp`, `agency-*.webp`

**Interfaces:**
- Consumes: current title hide rules (`.ti-sign`, `.ti-sig`, `.ti-swoosh`)
- Produces: title hero = Call Up only; soccer-readable scenes covered or replaced on first screens

- [ ] **Step 1: List which webp appear on title + home + office** (devtools or shell string refs). Write short list into `docs/apk-fork-inventory.md` under new `## Phase A scene priority` (3–10 filenames)

- [ ] **Step 2: For each priority soccer-readable asset — either replace webp with baseball-neutral art OR CSS-cover with gradient/overlay in `callup-theme.css`** (prefer CSS cover if no art yet; YAGNI)

- [ ] **Step 3: Confirm title has single Call Up mark** (no yellow swoosh duplicate)

- [ ] **Step 4: Build install smoke** (Task 6) after Task 5 if packaging changed; else continue

---

### Task 5: Launcher label + About exposure

**Files:**
- Modify: `T:\CallUp\apk-src\AndroidManifest.xml` (via `build-callup.ps1` already sets label `콜업`)
- Modify: `T:\CallUp\apk-src\res\drawable\launcher.xml` if needed
- Modify: shell About / settings strings if they print package name

**Interfaces:**
- Consumes: `build-callup.ps1` package rewrite
- Produces: launcher + in-app About show 콜업 / com.callup.agency only

- [ ] **Step 1: Search UI for package or signhere string**

```powershell
rg -n "com\.signhere|signhere\.offline" T:\CallUp\apk-src\assets\public T:\CallUp\apk-src\res
```

- [ ] **Step 2: Hide or rewrite any About debug line that shows smali class name to users**

- [ ] **Step 3: Confirm Manifest activity name may remain `com.signhere.offline.MainActivity` (allowed). No full smali rename in Phase A unless free.

---

### Task 6: Build, install, gate evidence

**Files:**
- Modify: none required if patches clean
- Create: `T:\CallUp\docs\egm-review\phase-a-gate-notes.md` (short evidence list + screenshot paths if saved)

**Interfaces:**
- Consumes: `build-callup.ps1`
- Produces: installed `com.callup.agency` APK; gate checklist filled

- [ ] **Step 1: Build**

```powershell
powershell -File T:\CallUp\tools\build-callup.ps1 -VersionCode 112 -VersionName 0.1.0-callup.3
```

Expected: `Built T:\CallUp\CallUp-Prototype.apk`, package `com.callup.agency`

- [ ] **Step 2: Install + launch**

```powershell
adb install -r T:\CallUp\CallUp-Prototype.apk
adb shell am start -n com.callup.agency/com.signhere.offline.MainActivity
```

- [ ] **Step 3: Manual gate**

1. Title screenshot  
2. New game → home screenshot  
3. One player card or league screen  
4. World gen + advance 1 week works  
5. `check-identity.ps1` exit success (allowlist only)

- [ ] **Step 4: Write `phase-a-gate-notes.md` with pass/fail per §3.4 gate bullets from roadmap spec

- [ ] **Step 5: Update `apk-fork-inventory.md` — note Phase A identity status; keep sim “후속 = Phase B” pointer to roadmap spec

---

### Task 7: Phase A done → handoff

**Files:**
- Modify: `T:\CallUp\docs\superpowers\specs\2026-11-23-new-game-roadmap-design.md` status line only if desired (`Phase A: done`)
- Create later (not this plan): Phase B design spec when A gates pass

- [ ] **Step 1: Confirm all §3.4 checkboxes passed**
- [ ] **Step 2: Stop implementation. Do not start Phase B internal key migration**
- [ ] **Step 3: Ask human for Phase B detailed spec brainstorm when ready

---

## Execution note

Prefer `executing-plans` or `subagent-driven-development` after human says to implement this plan. Do not start Task 1 coding until that go-ahead if still in review; this file is the plan artifact for Phase A.
