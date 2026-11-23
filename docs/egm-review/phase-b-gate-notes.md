# Phase B gate notes

**빌드:** `CallUp-Prototype.apk` · `com.callup.agency` · `0.1.0-callup.22` (versionCode 137)  
**일자:** 2026-11-23  
**세이브:** B1 (`callupBaseball1`) · 포지션 풀 9

## 상태 요약

오프라인 Phase B + 튜토 스킵(`fix-skip-tut`) + bright contrast 반영.  
실기기: 새게임→홈·**4주+ 진행 증거 OK** (07.01→07.08→…→08.19).  
세이브 슬롯 표시 OK. **세이브 탭→인게임 재진입**·**구세이브 거부**는 미완(다음에).

## §8 게이트

| 게이트 | 결과 |
| --- | --- |
| `check-identity.ps1` | PASS |
| `check-soccer-schema.ps1` | PASS |
| B1 assert 유닛 | PASS |
| 등록 로고 / 책넘김 / 9포지션 | PASS |
| 광고 IAP 팝업 제거 | PASS |
| 기기 새게임→홈·세이브 표시 | PASS (callup.22) |
| 기기 튜토 차단 해제 | PASS (`fix-skip-tut` Py/S5/nego) |
| 기기 4주 진행 | PASS (증거: `dg-05-week02`~`week14`, DATE 전진) |
| 기기 세이브 재로드 | **다음에** (슬롯 라벨은 보이나 탭→인게임 미확인) |
| 구 세이브 거부 실기기 | **다음에** (release APK `run-as` 불가) |

## 오늘 막힌 포인트 / 고친 것

- 협상·스카우트 튜토 `noskip` → `fix-skip-tut.cjs`로 오버레이 즉시 종료
- 스모크 AD 오탐: SMS `(광고)` → IAP 문자열만 판정
- 주 진행: 중앙 탭(`.tabs .mid`) + 미션 `확인` 닫기
- DATE0 빈 값으로 PASS 미표기 버그 → smoke 스크립트 수정(커밋 포함)

## 의도적 유지 / 후속

- 클럽 DB·크레스트 전량 · smali rename · Phase C — 요청 전 보류
