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
