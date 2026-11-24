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
