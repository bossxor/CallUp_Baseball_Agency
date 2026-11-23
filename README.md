# 콜업 최신 문서

원격: https://github.com/bossxor/CallUp_Baseball_Agency (`main`)  
작업 루트: `T:\CallUp` — 의미 있는 단위마다 `git commit` 후 `git push origin main`.

2026년 11월 23일 기준. **현재 PC 작업선은 사인히어 오프라인 99 APK 포크**다. 에이전시 루프·WebView 골격은 유지하고, 브랜드·팔레트·표시 문구를 야구 에이전시(콜업)로 교체한다.

## 먼저 볼 문서

| 문서 | 내용 |
| --- | --- |
| [게임 설계서 v0.7](docs/game-design.md) | 플레이 흐름, 화면 이동, 완료 기준 · APK 포크/비주얼 금칙 |
| [APK 포크 인벤토리](docs/apk-fork-inventory.md) | 디코드 구조·화면 매핑 |
| [구현 설계서 v0.7](docs/implementation-design.md) | 주차·계약·저장 규칙과 검증 계획 |
| [EGM 통합 검토 보고서](docs/consolidated_review_report.md) | 발견 사항과 두 설계서에 반영한 변경 |
| [새 게임 로드맵 스펙](docs/superpowers/specs/2026-11-23-new-game-roadmap-design.md) | A 정체성 → B 야구 시뮬 → C 플레이 게이트 |
| [Phase A 구현 플랜](docs/superpowers/plans/2026-11-23-phase-a-identity.md) | 정체성 제거 작업 단위 |
| [Phase B 시뮬 스펙](docs/superpowers/specs/2026-11-23-phase-b-baseball-sim-design.md) | 풀 9포지션·B1·축구 퍼지 |
| [Phase B 구현 플랜](docs/superpowers/plans/2026-11-23-phase-b-baseball-sim.md) | 엔진 스키마 치환 작업 단위 |
| [첫 시제품 구현 계획](docs/superpowers/plans/2026-11-19-prototype.md) | 11월 19일 당시의 계획과 기준 |
| [단계별 EGM 메모](docs/egm-review/README.md) | 통합 보고서의 단계별 근거 |

## APK 포크 빌드

기준 APK: `T:\사인히어 오프라인 99.apk`  
작업 트리: `apk-src/` · 패치: `tools/patch-callup.cjs` · 빌드: `tools/build-callup.ps1`

```powershell
# 최초 1회: apktool d -o apk-src "T:\사인히어 오프라인 99.apk"
node tools/patch-callup.cjs apk-src
powershell -File tools/build-callup.ps1 -SkipPatch -OutputApk .\CallUp-Prototype.apk
```

패키지 `com.callup.agency`, 라벨 `콜업`. 산출물: `CallUp-Prototype.apk`.  
엔진 포지션 코드(GK/DF 등)는 월드 생성 안정성을 위해 내부 유지하고, 표시 라벨·리그명·브랜드만 야구로 바꾼다.

### 개인용 치트 (출시 전 제거)

설정 → **개발용 치트**. `tools/enable-cheats.js`가 `cheats.css`를 넣고 라벨을 표시한다.  
뺄 때: 빌드에서 `enable-cheats.js` 호출 제거 + shell의 `PersonalCheats` 마운트·엔진 `offlineCheat` 훅 정리.

## 브랜치별 구현 상태

| 기준 | 확인한 내용 |
| --- | --- |
| PC 작업본 feature/player-support-office, 23e382d | v0.1.10 앱의 UI 개편, 국내 10팀 경기, 4개 시장의 프로 구단 58팀 배지와 구단명 일괄 편집, v0.7 설계서 및 EGM 검토 |
| 원격 main, 9366af5 | 36주차 국내 연봉 협상, 34주차 신인 드래프트, 서도윤·한지후 선수 지원, 최근 50건의 운영 자금 내역 |

원격 main에서는 국내 경기를 인천·수원 두 팀으로 집계합니다. PC 작업본의 EGM 보고서는 v0.1.10 기준이므로 연봉 협상·드래프트를 후속 작업으로 적고 있습니다. 원격과 PC 작업본의 기능을 합친 버전은 아직 없습니다.

아래 실행 방법과 기능 설명은 PC 작업본을 기준으로 합니다.

오프라인 야구 에이전시 게임의 첫 시제품입니다.

## 실행

Node.js 22 이상을 사용합니다.

```powershell
npm ci
npm test
python -m http.server 8766 --bind 127.0.0.1
```

브라우저에서 http://127.0.0.1:8766 을 엽니다.

## Android

Android SDK 35의 플랫폼, 빌드 도구 35.0.0, Java 17 이상과 PowerShell 7이 필요합니다. 프로젝트 루트의 debug.keystore에서 androiddebugkey 별칭을 사용합니다. 키스토어와 키 비밀번호는 개발용 기본값 android입니다.

```powershell
npm run android
```

CallUp-Prototype.apk를 설치합니다. 패키지는 com.callup.agency이며 네트워크 권한 없이 내장 화면을 실행합니다. 키스토어와 APK는 Git에서 제외합니다.

## 현재 범위

사무실, 1~4주 진행, 국내외 스카우트, 스냅샷 보고서의 페이지 복구, 관심 등록, 면담 회신과 고객 계약을 제공합니다. 선택한 행동과 완료한 주차는 기기에 저장합니다. 저장 실패 시 마지막으로 저장한 상태를 유지합니다.

홈의 주간 이벤트에서 보고서, 면담 답변, 계약 제안을 바로 열 수 있습니다. 선수 카드에는 상태·성적·계약 화면이 있고, 영입 데스크에서 파견·보고서·구단 협상을 확인합니다.

리그 메뉴의 구단 이름 편집에서 한국 10팀, 일본 12팀, 대만 6팀, 미국 30팀의 가상 프로 구단 이름을 바꾸거나 기본값으로 되돌릴 수 있습니다. 성남 야구고는 아마추어 소속으로 별도 표시합니다. 새 이름은 현재 경기판, 선수 소속, 협상과 이후 주간 기록에 표시됩니다.

전체 구단 일괄 편집에서 `구단코드 = 이름` 목록을 복사하거나 붙여넣고 한 번에 저장합니다. 목록에 없는 구단은 기존 이름을 유지하고, 이름을 비운 줄은 기본 이름으로 복원합니다.

파견할 때 전체 선수, 투수, 야수 중 조사 대상을 고릅니다. 정밀 조사는 50만 원과 한 주를 더 쓰는 대신 추정 범위를 좁힙니다. 첫 파견 자리는 한 개이며 고객 수에 따라 세 자리까지 늘어납니다. 주차 전광판은 실제로 진행한 주만 넘기고, 기기의 모션 줄이기 설정이 켜져 있으면 곧바로 홈을 표시합니다.

미국 조사에서 자유계약 투수 마커스 리드를 고객으로 영입하면 대만과 일본 구단에 추천할 수 있습니다. 협상 화면에서 두 제안을 비교하고 연봉 역제안을 보냅니다. 선수가 동의한 계약을 확정하면 다음 주 등록과 함께 수수료를 받습니다.

첫 주에는 인천 2군 외야수 서도윤의 소개서를 받아 면담할 수 있습니다. 보고서에서 만난 선수에게 30만 원을 들여 추가 조사를 보내면 한 주 뒤 좁혀진 추정치와 두 번째 관찰 의견을 받습니다.

국내 프로 10팀은 매 시즌 4~33주차에 1군·2군에서 팀당 주 1경기를 치릅니다. 승무패와 서도윤의 타격 기록은 같은 타석 결과로 집계합니다. 서도윤은 2군에서 16타수 이상, 타율 3할 이상을 기록하면 다음 주에 1군으로 올라갑니다. 이전 버전 저장은 완료한 경기 결과를 유지하고 업데이트 이후 진행하는 경기부터 10팀 일정을 적용합니다.

서도윤이 고객으로 1군에 등록되면 선수 지원 안건이 생깁니다. 무료 상담은 다음 주에, 45만 원의 코치 상담은 2주 뒤에 실제 1군 타석과 함께 점검 결과를 보여줍니다.

가상 선수, 구단 수요와 계약 조건은 시제품 데이터입니다. 일본·대만·미국 경기 집계, 드래프트, 전체 로스터를 반영한 시장, 부상·장기 부진 지원과 시즌 전환은 후속 구현 범위입니다.

설계 기준은 [게임 설계서](docs/game-design.md)와 [구현 설계서](docs/implementation-design.md)입니다.
