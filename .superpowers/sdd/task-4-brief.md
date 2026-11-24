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
