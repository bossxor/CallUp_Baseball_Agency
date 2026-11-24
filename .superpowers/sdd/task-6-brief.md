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
