# 콜업

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

가상 선수와 기록은 시제품 데이터입니다. 실제 네 리그 경기·순위 집계, 드래프트, 해외 계약, 선수 지원, 시즌 전환은 후속 구현 범위입니다. 고객 계약의 기간과 수수료도 현재는 시제품 고정 조건입니다.

설계 기준은 [게임 설계서](docs/game-design.md)와 [구현 설계서](docs/implementation-design.md)입니다.
