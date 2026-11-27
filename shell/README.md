# callup-shell

콜업 모바일 프런트오피스 UI. 브리핑, 선수단, 스카우트, 계약에서 같은 게임 상태를 읽는다.

## Dev

네트워크 드라이브에서 Vite가 실패하면:

```powershell
pwsh -File ..\tools\build-shell.ps1
```

로컬:

```bash
npm install
npm run build
```

`npm run dev`에서 `/?fixture`를 열면 기기 저장과 분리된 화면 검수용 데이터가 표시된다.

## APK

저장소 루트에서 `pwsh -File tools/build-callup.ps1 -SkipPatch`를 실행한다. 셸 빌드와 주입 후 기존 엔진을 포함한 APK를 만든다.

## Adapter

월드 생성과 주차 진행은 APK 엔진의 `eA`와 `eK`를 쓴다. 오프라인 APK는 기존 WebView 저장소에 gzip 슬롯을 기록한다. 이전 WebView 슬롯과 `saves/slot0.bin`, `.fasave`도 읽는다.

기본 새 게임은 엔진으로 미리 만든 첫 시즌을 열고, 이후 주간 진행에는 새 게임 시드를 쓴다. 엔진 저장 포맷이 바뀌면 저장소 루트에서 `node tools/build-callup-starter.cjs`로 시작 월드를 다시 만든다.

스카우트 보고서에서 후보의 계약을 검토하고 제안할 수 있다. 계약 결과와 비용은 기존 엔진이 처리하고, 계약이 성사된 선수는 선수단에 표시된다.

```powershell
node --test shell/tests/adapter.test.mjs
```
