# Phase B gate notes

**빌드:** `CallUp-Prototype.apk` · `com.callup.agency` · `0.1.0-callup.14` (versionCode 129)  
**일자:** 2026-11-23  
**세이브:** B1 (`callupBaseball1`) · 포지션 풀 9

## 상태 요약

오프라인 Phase B + 광고/슬롯잠금 제거까지 반영.  
기기 e2e: 새게임→월드젠→홈(RF 선수)→타이틀 세이브 표시까지 PASS.  
4주 진행·세이브 재진입·구세이브 거부는 아직 미완.

## §8 게이트

| 게이트 | 결과 |
| --- | --- |
| `check-identity.ps1` | PASS |
| `check-soccer-schema.ps1` | PASS |
| B1 assert 유닛 | PASS |
| 등록 로고 / 책넘김 / 9포지션 | PASS (코드) |
| 광고 제거 IAP 팝업 | PASS (callup.14, 슬롯2/3 잠금 해제) |
| 기기 새게임→홈 | PASS (e2e, `니콜라 도나티` RF) |
| 기기 재실행 후 슬롯 세이브 표시 | PASS (`콜업 에이전시 1년차 7월`) |
| 기기 4주 진행 | **미완** (홈 튜토리얼에 막힘) |
| 기기 세이브 재로드 인게임 | **미완** (자동 탭이 등록/다른 슬롯으로 빗나감) |
| 구 세이브 로드 거부 실기기 | **미완** |

## 남은 것

1. 홈 튜토리얼 종료 → 4주+ 진행 → 저장 → 슬롯 재진입 확인  
2. 구 사인히어/축구 세이브 거부 실기기  
3. 스토리/업적 카피 잔여 (`GOAL`/`데뷔골` 등) — 스키마 게이트 외 폴리시  
4. 구단 데이터(유럽 축구 클럽명) 야구화 — Phase B 비범위에 가깝, 후속  
5. smali `com.signhere.offline` rename (선택)  
6. Phase C 드래프트/연봉 — **요청 전 금지**  
7. 내부 `.goals`/`.ast` 키·클럽명 `슈팅 스타스` — 의도적 유지

## 패치 도구

`fix-kill-ad-popup.cjs` 포함, `build-callup.ps1` 연결됨.  
기기: `tools/smoke-e2e.ps1`
