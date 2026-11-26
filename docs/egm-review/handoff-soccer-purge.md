# 핸드오프 — 축구 제거 · 정식 리그명

## 상태
- APK `0.1.0-callup.47` / vc162 실기기 설치
- Git `bbf657c` push 완료 (soccer purge + formal leagues)
- 선수 로스터: **2열 그리드** (카드 커짐). 고객 1명이면 왼쪽 칸만 참
- 리그 탭: 칩 `KBO` / `KBO 퓨처스` / `NPB` / `NPB 2군` 확인
- 순위표: `득실점` + `승률` 컬럼 확인 (축구 승점 아님)
- 선수 상세: 포지션 `RF`, 소속 `체바 17` (야구)

## 스모크 캡처
- `docs/egm-review/ui-callup47-roster.png`
- `docs/egm-review/ui-callup47-league-ok.png`
- `docs/egm-review/ui-callup47-detail.png`

## 이적·스카우트 (추가 확인)
- 이적 탭 스카우트: 야구공 포지션 아이콘
- 포지션 시트: 투수·포수·1~3루·유격·좌/중/우익 (축구 포지션 없음). Lv.3 잠금
- 협상 0 — 제안 카드 리그명 확인은 제안 생성 후

## 뉴스 홈 (추가)
- 티커: 안타·치바 등 야구 카피 확인 (`ui-callup47-advance.png`)
- 트레이드 기간 카드·RF 성장 카드 OK
- 오피스 › 설정 › 개발용 치트 열림 확인. 치트 하위탭(협상/Phase C)은 adb 탭이 안 먹어 제안 생성 스모크 보류

## 다음
1. 손으로 치트 › 협상 › 제안 생성 후 KBO/NPB 표기 캡처 (또는 WebView 디버깅 주입)
2. Phase C: 시즌2 연속, 2군→1군(KBO) 전체 흐름
3. 로스터 고객 2명+일 때 2열 배치 육안 재확인
