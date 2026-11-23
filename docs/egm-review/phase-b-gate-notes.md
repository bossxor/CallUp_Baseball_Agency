# Phase B gate notes

**빌드:** `CallUp-Prototype.apk` · `com.callup.agency` · `0.1.0-callup.16` (versionCode 131)  
**일자:** 2026-11-23  
**세이브:** B1 (`callupBaseball1`) · 포지션 풀 9

## 상태 요약

오프라인 Phase B + 카피 추가 퍼지(A매치/윙어/자책골/도움 라벨 등)까지 완료.  
실기기 잔여(4주·재로드·구세이브 거부) + 대형 후속(구단 DB·시뮬 심화·Phase C) 남음.

## §8 게이트

| 게이트 | 결과 |
| --- | --- |
| `check-identity.ps1` | PASS |
| `check-soccer-schema.ps1` | PASS (데뷔골/GOAL/스트라이커/Football/축구 추가) |
| B1 assert 유닛 | PASS |
| 등록 로고 / 책넘김 / 9포지션 | PASS |
| 광고 IAP 팝업 제거 | PASS (callup.14+) |
| 카피: 데뷔골/GOAL/스트라이커/페널티/킥오프 | PASS (callup.15) |
| 기기 새게임→홈·세이브 표시 | PASS (callup.14 e2e) |
| 기기 4주 진행 | **실기기 대기** |
| 기기 세이브 재로드 | **실기기 대기** |
| 구 세이브 거부 실기기 | **실기기 대기** |

## 의도적 유지 / 후속

- 내부 기록 키 `.goals`/`.ast` (UI는 h/rbi 폴백)
- 클럽명 `슈팅 스타스` 등 고유명
- 유럽 축구 구단 데이터·크레스트 전량 재작화 — Phase B §7 비범위
- smali `com.signhere.offline` — 사용자 미노출, §8.1 허용 → rename 티켓 보류
- Phase C 드래프트/연봉 — 요청 전 금지

## 패치 도구

`fix-purge-copy-final.cjs` · `fix-purge-copy-final2.cjs` · `fix-purge-kickoff.cjs` · `fix-kill-ad-popup.cjs` 등 `build-callup.ps1` 연결.
