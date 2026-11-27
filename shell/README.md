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

월드 생성과 주차 진행은 APK 엔진의 `eA`와 `eK`를 쓴다. 기기에서는 `saves/slot0.bin`에 gzip을 저장하고, 이전 슬롯과 `.fasave`도 읽는다.

```powershell
node --test shell/tests/adapter.test.mjs
```
