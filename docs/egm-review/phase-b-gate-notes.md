# Phase B gate notes

**빌드:** `CallUp-Prototype.apk` · `com.callup.agency` · `0.1.0-callup.12` (versionCode 127)  
**일자:** 2026-11-23  
**세이브:** B1 (`callupBaseball1`) · 포지션 풀 9

## 상태 요약

스키마·월드젠·리포트 책넘김·B1 강화까지 오프라인 구현 완료.  
기기 최종 스모크(4주·저장·재실행)는 폰 연결 후 확인.

## 크래시/제스처 수정 이력

| 이슈 | 수정 |
| --- | --- |
| `undefined.push` 월드젠 | `FN`/`ui`/`Wd` 등 4포지션 버킷 → 9포지션 |
| `undefined.r` | `rj`를 9포지션으로 확장 + `sj` 가드 |
| `J.batp.rareDiv` | `.sho`→`.bat`이 `.shop`을 깨먹음 → `J.shop` 복구 |
| 리포트 안 넘어감 | 히트존이 카드 위쪽이었음 → 우측 책넘김 |
| 카드가 뒤로 엎어짐 | `rotateX` → 책등 `rotateY` |

## §8 게이트

| 게이트 | 결과 |
| --- | --- |
| `check-identity.ps1` | PASS |
| `check-soccer-schema.ps1` | PASS |
| 엔진 `FN`/`rj`/`ui` 9키 | PASS |
| 셸 스카우트 필터 9포지션 | PASS |
| B1: 마커 없거나 레거시 pos → throw | PASS (코드) |
| 기록 UI `st.h`/`st.rbi` | PASS (셸 집계·카피) |
| 리포트 책넘김 `rotateY` | PASS (코드, callup.11+) |
| 기기 새게임→홈→4주→저장 | **대기** (폰 미연결) |
| 구 세이브 로드 거부 실기기 | **대기** |

## B1 동작

- 신규: 셸 `callupBaseball1:!0` 스탬프
- 로드(`KI`/`offlineParseSave`): `callupAssertBaseball`
  - 플레이어 `pos` ∉ 9코드 → throw
  - 마커 없고 플레이어 있음 → throw  
  - 메시지: `콜업 야구 세이브만 지원합니다. 새 게임을 시작하세요.`
- 가져오기 토스트도 동일 취지 문구

## 남은 것 (폰 돌아온 뒤 / 후속)

1. 기기 스모크: 새게임 → 리포트 넘김 → 홈 → 4주 → 저장 → 재실행  
2. 구 사인히어/축구 세이브 슬롯 거부 확인  
3. 등록 로고 아이콘 세트 교체 (선택)  
4. smali `com.signhere.offline` rename (선택)  
5. Phase C 드래프트/연봉 (요청 전 착수 금지)  
6. 카드 EN 카피/`goals` 필드명 일부·`도움` 일반어 — 문맥상 잔존 가능 (스키마 게이트 외)

## 패치 도구

- `patch-baseball-sim.cjs` (+ `cleanupEngineBuckets`)
- `fix-pageflip-hit.cjs` / `fix-pageflip-book.cjs`
- `fix-phase-b-offline.cjs` (B1·기록·카피)
- `build-callup.ps1`에 위 스크립트 연결됨
