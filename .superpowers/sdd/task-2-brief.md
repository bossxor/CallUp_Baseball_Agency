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
