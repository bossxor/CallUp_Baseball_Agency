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
