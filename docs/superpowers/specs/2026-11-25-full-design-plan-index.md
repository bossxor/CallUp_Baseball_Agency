# 콜업 “새 게임” — 전체 설계·플랜 인덱스

**날짜:** 2026-11-25  
**목적:** A→B→Residual→UI→C 문서가 빠짐없이 있는지 한눈에 보기.

| 단계 | 설계 스펙 | 구현 플랜 | 구현 |
|------|-----------|-----------|------|
| 로드맵 | [2026-11-23-new-game-roadmap-design.md](2026-11-23-new-game-roadmap-design.md) | — | — |
| A | roadmap §3 + phase-a 산출 | phase-a plan (기존) | ✅ |
| B | [phase-b-baseball-sim-design](2026-11-23-phase-b-baseball-sim-design.md) | phase-b plan | ✅ |
| Residual | [baseball-residual-design](2026-11-24-baseball-residual-design.md) | [baseball-residual plan](../plans/2026-11-24-baseball-residual.md) | ✅ |
| UI | [phase-ui-design](2026-11-24-phase-ui-design.md) | [phase-ui plan](../plans/2026-11-24-phase-ui.md) | ❌ |
| C | [phase-c-design](2026-11-25-phase-c-design.md) | [phase-c plan](../plans/2026-11-25-phase-c.md) | ❌ (UI 후) |

**플레이 SSOT:** `docs/game-design.md` · **검증 SSOT:** `docs/implementation-design.md`

**실행 순서:** Phase UI plan Task 1–7 → 게이트 → Phase C plan C0–C5 → 새 게임 로드맵 종료 (A∧B∧UI∧C).
