# 사인히어 오프라인 99 → 콜업 포크 인벤토리

기준 APK: `T:\사인히어 오프라인 99.apk`  
작업 트리: `T:\CallUp\apk-src` (apktool decode)

## 기술 골격

| 항목 | 내용 |
| --- | --- |
| 패키지(원본) | `com.signhere.offline.patience` |
| Activity | `com.signhere.offline.MainActivity` (WebView) |
| UI | `assets/public` React 번들, 오프라인 |
| 엔진 | `engine-DhPc-c_J.js` (~2.6MB) |
| 셸 | `shell-DaKdX7f1.js` + `shell-DGv3wu-g.css` |
| UI 카피 | `ui-DSX53OnJ.js` / `ui-DgYnPcSw.js` |
| 카드/이름 | `cards-*.js`, `names-*.js` |
| 크레스트 | `assets/public/crests` (~1571) |
| 씬 아트 | `assets/public/assets/*.webp` (agency, office, stadium 등 ~45) |

## 화면 매핑

| 사인히어 | 콜업 | 비고 |
| --- | --- | --- |
| 홈 / 주간 진행 | 홈 · 전광판 · 안건 | 동선 유지, 룩=전광판 |
| 스카우트 복귀 보고서 | 스카우트 용지 보고서 | 한 장씩 넘김 유지 |
| 선수 상세 · 영입/이적 | 선수 · 영입 데스크 | 축구 용어→야구 |
| 협상 · 이적료 · 경쟁 제안 | 구단 제안 · 수수료 | 골격 유지 |
| 리그 / 순위 | 리그 (한·일·대·미) | 리그명 치환 |
| 사무실 / 자금 | 사무실 | 씬·카피 교체 |
| 타이틀 · 엠블럼 | 콜업 타이틀 | 브랜드 전면 교체 |

## 원본 비주얼 토큰 (금칙 재사용)

- `--bg: #141516`, accent lime `#C5F23C`
- Damion / Bebas Neue 디스플레이 조합
- 축구 씬 웹프 · 사인히어 엠블럼 · “풋볼 에이전시” 카피

## 콜업 패치 산출물

- `tools/patch-callup.cjs` — 브랜드·팔레트·표시 라벨·리그명 (안전 모드)
- `tools/build-callup.ps1` — `com.callup.agency` APK 빌드
- `assets/public/callup-theme.css` — 전광판/용지 오버레이

## Phase B 스키마 (2026-11-23)

- 포지션 풀 9: `P C 1B 2B 3B SS LF CF RF`
- 능력키: `spd bat pit fld phy` (라벨: 주력/타격/투구/수비/피지컬)
- 기록: `st.h` / `st.rbi` / `st.ch` (UI; 내부 `.goals` 폴백 잔존 가능)
- 세이브 B1: `callupBaseball1` + `callupAssertBaseball`
- 등록 로고: `fix-logo-baseball.cjs` (Xs 야구 SVG)
- 패치: `patch-baseball-sim.cjs` · pageflip · phase-b-offline · purge2/3 · shooting-narrative
- 게이트: `check-soccer-schema.ps1` · `docs/egm-review/phase-b-gate-notes.md`
- 빌드: `0.1.0-callup.13` (vc128)

## Phase A scene priority

�౸�� �ٷ� ������ �ؽ� webp�� ���� �߸� ������ ��� (`tools/patch-scenes.js`):

| ��� (soccer-forward) | ��ü |
| --- | --- |
| `goal-*.webp` | `stadium-aNDQ45iG.webp` |
| `shootout-*.webp` | `training-IFqjAQlg.webp` |
| `adshoot-*.webp` | `press-OvdAyDZ8.webp` |
| `court-*.webp` | `park-C4VF5vsp.webp` |

��ü�� ����Ʈ: `tools/check-identity.ps1`. Manifest Activity `com.signhere.offline.*` ��δ� Phase A ���. �ù� ��ü�� Phase B �ε��.
