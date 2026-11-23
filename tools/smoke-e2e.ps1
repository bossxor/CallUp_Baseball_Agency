# Careful Phase B e2e for callup.14+
param([string]$Serial = '')
$ErrorActionPreference = 'Stop'
$apk = (Resolve-Path (Join-Path $PSScriptRoot '..\CallUp-Prototype.apk')).Path
$out = Join-Path $PSScriptRoot '..\docs\egm-review'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$env:Path = "C:\Users\N-052\AppData\AndroidCLI;" + $env:Path

function Dev {
  if ($Serial) { return $Serial }
  $l = adb devices | Select-String '\tdevice$' | Select-Object -First 1
  if (-not $l) { throw 'no device' }
  ($l.ToString() -split '\s+')[0]
}
function Shot($n) {
  adb -s $dev shell screencap -p /sdcard/cu.png | Out-Null
  adb -s $dev pull /sdcard/cu.png (Join-Path $out $n) | Out-Null
  Write-Host "shot $n"
}
function Tap($x,$y,$ms=1200){ adb -s $dev shell input tap $x $y | Out-Null; Start-Sleep -Milliseconds $ms }
function Swipe($x1,$y1,$x2,$y2,$d=350){ adb -s $dev shell input swipe $x1 $y1 $x2 $y2 $d | Out-Null; Start-Sleep -Milliseconds 600 }
function Texts {
  $p = Join-Path $out '_lay.json'
  android layout --device=$dev --flat -o $p 2>$null | Out-Null
  if (-not (Test-Path $p)) { return @() }
  $j = Get-Content $p -Raw -Encoding UTF8
  [regex]::Matches($j, '"text":"((?:\\.|[^"\\])*)"') | ForEach-Object {
    ($_.Groups[1].Value -replace '\\"','"' -replace '\\n',' ')
  } | Where-Object { $_ -and $_.Length -lt 60 } | Select-Object -Unique
}
function Has($arr, $pat){ ($arr | Where-Object { $_ -match $pat }).Count -gt 0 }

$dev = Dev
Write-Host "device $dev"
adb -s $dev install -r $apk
adb -s $dev shell am force-stop com.callup.agency
adb -s $dev shell pm clear com.callup.agency
adb -s $dev logcat -c
adb -s $dev shell am start -n com.callup.agency/com.signhere.offline.MainActivity
Start-Sleep 3
Shot 'e2e-00-title.png'
$t = Texts
if (Has $t '광고') { throw 'AD_POPUP_ON_TITLE' }
Write-Host 'title texts:' ($t -join ' | ')

# Slot 1 only (green first)
Tap 721 2221 2000
Shot 'e2e-01-reg.png'
$t = Texts
if (-not (Has $t '시작하기')) { throw 'NO_REG' }
Tap 719 2353 2000

# Wait world gen / first content (max ~2min)
$stage = 'loading'
for ($i=1; $i -le 24; $i++) {
  Start-Sleep 5
  $t = Texts
  Write-Host ("wait{0}: {1}" -f $i, (($t | Select-Object -First 8) -join ' / '))
  if (Has $t '광고 없이|광고 제거') { throw 'AD_POPUP' }
  if (Has $t '세계를 만들고') { $stage='loading'; continue }
  if (Has $t '시작하기' -and Has $t '에이전트 등록') { $stage='reg'; continue }
  if (Has $t '이 선수로|다음 선수|보고서|다음|확인|첫 ') { $stage='play'; Shot ("e2e-02-play{0:D2}.png" -f $i); break }
  Shot ("e2e-02-wait{0:D2}.png" -f $i)
}
if ($stage -ne 'play') { Shot 'e2e-02-stuck.png'; throw "STUCK_$stage" }

# Advance story/report — prefer 확인 then 다음, book swipe
for ($i=0; $i -lt 40; $i++) {
  $t = Texts
  if (Has $t '광고') { throw 'AD_MID' }
  # home-ish: tabs / 오피스 / 주 진행
  if ((Has $t '오피스|선수|구단|스카우트|알림|보관함') -and -not (Has $t '데뷔골|GOAL|이 선수로|STORY')) {
    Write-Host "home-ish at $i"
    Shot 'e2e-03-home.png'
    break
  }
  if (Has $t '확인') { Tap 720 2100 900; continue }
  if (Has $t '이 선수로') { Tap 1000 2700 1200; continue }
  if (Has $t '다음 선수') { Tap 400 2700 900; continue }
  if (Has $t '보고서 열기') { Tap 720 2600 1200; Swipe 1180 1500 360 1500 400; continue }
  Swipe 1180 1550 360 1550 380
  Tap 720 2850 800
  if (($i % 5) -eq 4) { Shot ("e2e-03-adv{0:D2}.png" -f $i) }
}
Shot 'e2e-03-after-adv.png'
$t = Texts
Write-Host 'after-adv:' ($t -join ' | ')

# Try advance weeks via common UI
for ($w=1; $w -le 12; $w++) {
  $t = Texts
  if (Has $t '다음 주|다음주|주 넘기기|패스|시간 보내기|진행') {
    # tap bottom-rightish actions
    Tap 1100 2900 700
  }
  Tap 720 2950 500
  Tap 720 2700 500
  if (($w % 3) -eq 0) {
    Shot ("e2e-04-week{0}.png" -f $w)
    $t = Texts
    Write-Host ("week{0}: {1}" -f $w, (($t | Select-Object -First 10) -join ' / '))
  }
}

# Persist check
adb -s $dev shell am force-stop com.callup.agency
Start-Sleep 1
adb -s $dev shell am start -n com.callup.agency/com.signhere.offline.MainActivity
Start-Sleep 3
Shot 'e2e-05-relaunch.png'
$t = Texts
Write-Host 'relaunch:' ($t -join ' | ')
$saveOk = Has $t '콜업|1년차|년차'
if (-not $saveOk) { Write-Host 'WARN no save label' }

# Load slot1
Tap 720 2180 3000
Shot 'e2e-06-loaded.png'
$t = Texts
Write-Host 'loaded:' ($t -join ' | ')
if (Has $t '광고') { throw 'AD_AFTER_LOAD' }

# Soccer residue scan
$bad = @('사인히어','Sign Here','FOOTBALL','축구 에이전','골키퍼','득점왕','해트트릭')
$hits = @()
foreach ($b in $bad) { if (Has $t $b) { $hits += $b } }
Write-Host 'residue:' (($hits -join ',') )
if ($hits.Count) { Write-Host 'RESIDUE_FOUND' } else { Write-Host 'RESIDUE_OK' }

Write-Host 'E2E_DONE'
Write-Host ("SAVE={0} STAGE={1}" -f $saveOk, $stage)
