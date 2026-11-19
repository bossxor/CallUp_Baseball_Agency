# 콜업

야구 에이전시 시뮬레이션. 첫 시제품은 주차를 진행하고 스카우트 보고서를 읽는 흐름을 검증한다.

## 로컬 실행

Node.js 24를 사용한다.

```sh
npm ci
npm run dev
npm test
npm run build
```

개발 서버를 연 주소에서 플레이한다. 세이브는 해당 브라우저 또는 Android 앱에 저장된다. 첫 주에서 여러 주 진행을 선택하면 4주차의 스카우트 복귀에서 멈춘다. 보고서를 넘긴 뒤 사무실로 돌아가거나 앱을 다시 열어도 마지막으로 본 장이 유지된다.

## Android 시제품

Windows에서 JDK 21, Android SDK Platform 35와 Build Tools 35.0.0을 준비한다. `ANDROID_SDK_ROOT` 또는 `ANDROID_HOME`으로 SDK 위치를 지정할 수 있다.

```powershell
.\scripts\build-android.ps1
adb install -r .\build\callup-debug.apk
```

APK는 디버그 키로 서명한다. 웹 자산을 APK에 포함해 네트워크 연결 없이 실행한다.

[게임 설계](docs/game-design.md) · [구현 설계](docs/implementation-design.md) · [시제품 구현 계획](docs/prototype-plan.md)
