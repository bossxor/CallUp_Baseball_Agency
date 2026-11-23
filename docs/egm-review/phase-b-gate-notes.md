# Phase B gate notes

**빌드:** `CallUp-Prototype.apk` · `com.callup.agency` · `0.1.0-callup.24` (versionCode 139)  
**일자:** 2026-11-24  
**세이브:** B1 (`callupBaseball1`) · 포지션 풀 9

## 상태 요약

오프라인 Phase B + 튜토 스킵 + 로드 assert 완화 완료.  
실기기 게이트: 새게임→홈 · 4주+ · **세이브 재진입** · **구세이브 거부(유닛)** 통과.

## §8 게이트

| 게이트 | 결과 |
| --- | --- |
| `check-identity.ps1` | PASS |
| `check-soccer-schema.ps1` | PASS |
| B1 assert 유닛 | PASS (`test-b1-assert.cjs`) |
| 등록 로고 / 책넘김 / 9포지션 | PASS |
| 광고 IAP 팝업 제거 | PASS |
| 기기 새게임→홈·세이브 표시 | PASS |
| 기기 튜토 차단 해제 | PASS (`fix-skip-tut`) |
| 기기 4주 진행 | PASS (07.01→08.19 증거) |
| 기기 세이브 재로드 | PASS (callup.24, 인게임 홈·자금·영입) |
| 구 세이브 거부 | PASS 유닛 (unstamped soccer throw). 기기 토스트도 callup.23에서 확인 |

## assert 정책 (callup.24)

- 스탬프 있음: 잔여 축구 포지션 리맵
- 스탬프 없음 + 야구 포지션만: 자동 스탬프
- 스탬프 없음 + 축구 포지션: 거부 메시지

## 후속 (비차단)

- 클럽 DB·크레스트 · smali rename · Phase C — 요청 전 보류
- 기기 파일 import로 구세이브 거부 E2E는 선택
