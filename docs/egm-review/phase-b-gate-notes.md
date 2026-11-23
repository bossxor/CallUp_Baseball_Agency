# Phase B gate notes

**빌드:** `CallUp-Prototype.apk` · `com.callup.agency` · `0.1.0-callup.7` (versionCode 122)  
**일자:** 2026-11-23  
**세이브:** B1 (`callupBaseball1`) · 포지션 풀 9

## 크래시 수정

월드젠 `세계를 만들고 있어요` 무한 대기 원인:

`TypeError: Cannot read properties of undefined (reading 'push')`

- `ji`·플레이어 `pos`는 이미 9코드(`P`…`RF`)
- `FN`/`Xf` 버킷·`ui`/`Wd`는 축구 4키(`GK`/`DF`/`MF`/`FW`)로 남아 `e[t.pos]`가 `undefined`

→ 식별자 키 맵을 9포지션으로 교체 (`tools/fix-engine-pos9*.cjs` → `patch-baseball-sim.cjs` `cleanupEngineBuckets`).

## §8 게이트

| 게이트 | 결과 |
| --- | --- |
| `check-identity.ps1` | PASS |
| `check-soccer-schema.ps1` (Ss/Rt/버킷/Du/xF/hattrick/SignHere) | PASS |
| 엔진 `FN` 버킷 9키 | PASS |
| 셸 스카우트 필터 9포지션 | PASS (`e1` + `positions`) |
| B1 마커 `callupBaseball1` | 셸 신규·엔진 assert |
| 기기 새게임→홈 스모크 | **미실행** (요청: 중간 테스트 생략). 수정 후 빌드만 |

## 한 일

- `ui`/`Wd`/`BN` 정합, `FN`/`Xf` 버킷, `Du`/`A8`/`N1`/`GE`/`k4`/`US`/`lj`/fee map
- `xF` 베이스라인·`eF` 능력키 야구화
- 시즌/커리어 `goals`/`ast` → `h`/`rbi`, `cgoals`→`ch`
- `hattrick`/`cupgoal` → `multi`/`cuphit` (엔진·cards·셸)
- 셸 필터 칩 풀 9 + 한글 라벨

## 남은 냄새 / 후속

- 기기 스모크: 새 게임 → 홈 → 4주 → 저장 재실행
- Activity smali `com.signhere.offline` 경로 rename (선택)
- Phase C 드래프트/연봉
- 로고/크레스트 픽셀 재작화
- `W0.posGK` 등 수수료 필드명은 수치 상수로만 잔존 (포지션 코드 아님)
