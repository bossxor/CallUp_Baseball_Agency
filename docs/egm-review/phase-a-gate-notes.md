# Phase A gate notes

**빌드:** `CallUp-Prototype.apk` · `com.callup.agency` · `0.1.0-callup.3` (versionCode 112)  
**일자:** 2026-11-23

## §3.4 체크

| 게이트 | 결과 |
| --- | --- |
| 타이틀→홈 사인히어/축구 에이전시 오인 불가 | PASS — `callup-a-title.png`: CALLUP 엠블럼 + BASEBALL AGENCY, 밝은 배경. 사인히어/풋볼 문구 없음 |
| user-facing `사인히어\|SignHere\|풋볼\|Football Agency` grep 0 | PASS — `tools/check-identity.ps1` |
| 앱 서랍 라벨 콜업, UI에 `com.signhere` 0 | PASS — 패키지 `com.callup.agency`; shell에 `com.signhere` 문자열 0. Activity 클래스 경로는 Manifest만(게이트 허용) |
| 월드 생성·첫 주 회귀 | 스모크: 설치·런치 성공. 새 게임 1주 수동은 기기에서 확인 권장 |

## 한 일

- 약관/개인정보 EN·title Sign Here 제거
- `SIGN HERE` / Football Agent 브랜드 페어 강화
- 축구 이벤트 카피(해트트릭·매치볼 등) 야구 톤 치환
- `patch-scenes.js`로 goal/shootout/adshoot/court webp 교체
- 씬 CSS wash + 타이틀 스우시 숨김 유지
- 치트 유지 (`enable-cheats.js`)

## 남은 냄새 (B/후속)

- 내부 `GK`/`DF`·축구 스탯 키 (Phase B)
- smali `com.signhere.offline.MainActivity` 경로 (노출 0이면 A 통과)
- 씬 아트 전량 자체 제작 (지금은 덮어쓰기+필터)
- 운영자 표기 `멍때림 스튜디오` (약관·셸 1곳) — 법적 명의면 유지
