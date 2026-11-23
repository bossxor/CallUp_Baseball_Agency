# Phase B device gates: home tutorial clear, 4+ weeks, save reload, optional reject probe
param([string]$Serial = '')
$ErrorActionPreference = 'Stop'
$apk = (Resolve-Path (Join-Path $PSScriptRoot '..\CallUp-Prototype.apk')).Path
$out = Join-Path $PSScriptRoot '..\docs\egm-review'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$env:Path = "C:\Users\N-052\AppData\AndroidCLI;" + $env:Path
$dev = if ($Serial) { $Serial } else {
  $l = adb devices | Select-String '\tdevice$' | Select-Object -First 1
  if (-not $l) { throw 'no device' }
  ($l.ToString() -split '\s+')[0]
}
Write-Host "device $dev"

function Shot($n) {
  adb -s $dev shell screencap -p /sdcard/cu.png | Out-Null
  adb -s $dev pull /sdcard/cu.png (Join-Path $out $n) | Out-Null
  Write-Host "shot $n"
}
function Tap($x,$y,$ms=900){ adb -s $dev shell input tap $x $y | Out-Null; Start-Sleep -Milliseconds $ms }
function Swipe($x1,$y1,$x2,$y2,$d=350){ adb -s $dev shell input swipe $x1 $y1 $x2 $y2 $d | Out-Null; Start-Sleep -Milliseconds 500 }
function Lay {
  $p = Join-Path $out '_dg.json'
  android layout --device=$dev --flat -o $p 2>$null | Out-Null
  if (-not (Test-Path $p)) { return '' }
  Get-Content $p -Raw -Encoding UTF8
}
function Texts([string]$j) {
  if (-not $j) { $j = Lay }
  [regex]::Matches($j, '"text":"((?:\\.|[^"\\])*)"') | ForEach-Object {
    ($_.Groups[1].Value -replace '\\"','"' -replace '\\n',' ')
  } | Where-Object { $_ -and $_.Length -lt 80 } | Select-Object -Unique
}
function Has($arr,$pat){ ($arr | Where-Object { $_ -match $pat }).Count -gt 0 }
function FindCenter([string]$j, [string]$want) {
  # bounds like [x1,y1][x2,y2] near text — android CLI json may have center
  if ($j -match ('"text":"' + [regex]::Escape($want) + '"[^}]*"center":"(\d+),(\d+)"')) {
    return @([int]$Matches[1], [int]$Matches[2])
  }
  if ($j -match ('"text":"' + [regex]::Escape($want) + '"[^}]*"bounds":"\[(\d+),(\d+)\]\[(\d+),(\d+)\]"')) {
    $x = [int](([int]$Matches[1] + [int]$Matches[3]) / 2)
    $y = [int](([int]$Matches[2] + [int]$Matches[4]) / 2)
    return @($x, $y)
  }
  return $null
}
function TapText($want, $ms=1000) {
  $j = Lay
  $c = FindCenter $j $want
  if ($c) { Tap $c[0] $c[1] $ms; return $true }
  return $false
}

# --- install fresh ---
adb -s $dev install -r $apk
adb -s $dev shell am force-stop com.callup.agency
adb -s $dev shell pm clear com.callup.agency
adb -s $dev logcat -c
adb -s $dev shell am start -n com.callup.agency/com.signhere.offline.MainActivity
Start-Sleep 3
Shot 'dg-00-title.png'
$t = Texts
if (Has $t '광고') { throw 'AD_ON_TITLE' }

# slot1 new game
if (-not (TapText '1번 새 게임' 1800)) { Tap 721 2221 1800 }
Shot 'dg-01-reg.png'
if (-not (TapText '시작하기' 2000)) { Tap 719 2353 2000 }

# wait play
$ok = $false
for ($i=1; $i -le 30; $i++) {
  Start-Sleep 4
  $t = Texts
  Write-Host ("w{0}: {1}" -f $i, (($t | Select-Object -First 6) -join ' / '))
  if (Has $t '광고 없이|광고 제거') { throw 'AD_POPUP' }
  if (Has $t '세계를 만들고') { continue }
  if (Has $t '이 선수로|다음 선수|확인|다음|회상|보고서|홈 화면|오피스') {
    $ok = $true; Shot ("dg-02-play{0:D2}.png" -f $i); break
  }
}
if (-not $ok) { Shot 'dg-02-stuck.png'; throw 'STUCK_WORLDGEN' }

function DriveNegoOrTut([string]$j, $t) {
  # tutorial / nego action prompts — must tap targets, not just "다음"
  if (Has $t '카드를 눌러|한 번 더 눌러') {
    # hand cards across bottom third
    foreach ($xy in @(@(360,2300),@(720,2300),@(1080,2300),@(540,2450),@(900,2450))) {
      Tap $xy[0] $xy[1] 350
    }
    return $true
  }
  if (Has $t '수락을 눌러') {
    if (TapText '수락' 900) { return $true }
    Tap 1180 2100 900
    return $true
  }
  if (Has $t '제안을 눌러') {
    if (TapText '제안' 900) { return $true }
    Tap 720 1600 900
    return $true
  }
  if (Has $t '협상하기를 눌러|협상하기') {
    if (TapText '협상하기' 1000) { return $true }
    return $false
  }
  if (Has $t '파견하기를 눌러|파견하기') {
    if (TapText '파견하기' 1200) { return $true }
    return $false
  }
  if (Has $t '받아치기|협상 기술|단장의|예상 시세|느긋함') {
    # mid-nego: try accept / play card / next
    if (TapText '다음' 700) { return $true }
    if (TapText '수락' 700) { return $true }
    if (TapText '확인' 700) { return $true }
    foreach ($xy in @(@(720,2300),@(1080,2300),@(360,2300),@(1180,2000),@(720,2850))) {
      Tap $xy[0] $xy[1] 300
    }
    return $true
  }
  return $false
}

# advance to home / clear overlays + tutorial (incl. nego)
for ($i=0; $i -lt 80; $i++) {
  $j = Lay
  $t = Texts $j
  if (Has $t '광고') { throw 'AD_MID' }
  if (DriveNegoOrTut $j $t) {
    if (($i % 8) -eq 7) { Shot ("dg-03-adv{0:D2}.png" -f $i) }
    continue
  }
  # prefer explicit buttons
  $hit = $false
  foreach ($lab in @('확인','이 선수로','다음 선수','보고서 열기','다음','마치기','닫기')) {
    if (Has $t $lab) {
      if (TapText $lab 900) { $hit = $true; break }
    }
  }
  if ($hit) { continue }
  if ((Has $t '오피스|홈 화면|영입시장|자금|다음 주|시간 보내') -and -not (Has $t '여기는 홈|튜토리얼|이 선수로|데뷔|STORY|확인|받아치기|카드를 눌러|수락을 눌러|예상 시세|협상 기술')) {
    Write-Host "HOME_READY $i"
    Shot 'dg-03-home.png'
    break
  }
  if (Has $t '여기는 홈|할 일이 여기') {
    TapText '다음' 800 | Out-Null
    continue
  }
  Swipe 1180 1500 360 1500 350
  Tap 720 2850 700
  if (($i % 8) -eq 7) { Shot ("dg-03-adv{0:D2}.png" -f $i) }
}
Shot 'dg-03-after.png'
$t = Texts
Write-Host 'home-ish:' (($t | Select-Object -First 20) -join ' | ')

# dismiss remaining tutorial next / finish any leftover nego
for ($i=0; $i -lt 30; $i++) {
  $j = Lay
  $t = Texts $j
  if (DriveNegoOrTut $j $t) { continue }
  if (-not (Has $t '다음|여기는|눌러|튜토리얼|알려|받아치기|협상|수락|예상 시세')) { break }
  TapText '다음' 700 | Out-Null
  TapText '확인' 700 | Out-Null
  Tap 720 2850 600
}
Shot 'dg-04-tut-clear.png'
$t0 = Texts
$date0 = ($t0 | Where-Object { $_ -match '\d{4}\.\d{2}\.\d{2}' } | Select-Object -First 1)
Write-Host "DATE0=$date0"

# advance weeks — look for week controls
$weekAdvanced = $false
for ($w=1; $w -le 20; $w++) {
  $j = Lay
  $t = Texts $j
  $hit = $false
  foreach ($lab in @('다음 주','다음주','주 넘기기','시간 보내기','패스','진행','보내기')) {
    if (Has $t $lab) {
      if (TapText $lab 1200) { $hit = $true; Write-Host "tap $lab" }
    }
  }
  if (-not $hit) {
    # common FAB / bottom actions
    Tap 1200 3000 500
    Tap 720 3050 500
    Tap 1100 2800 500
  }
  if (($w % 2) -eq 0) {
    Shot ("dg-05-week{0:D2}.png" -f $w)
    $t = Texts
    $date = ($t | Where-Object { $_ -match '\d{4}\.\d{2}\.\d{2}' } | Select-Object -First 1)
    Write-Host ("week{0} DATE={1} sample={2}" -f $w, $date, (($t | Select-Object -First 8) -join ' / '))
    if ($date0 -and $date -and ($date -ne $date0)) {
      $weekAdvanced = $true
      Write-Host "WEEK_ADVANCE_OK $date0 -> $date"
      break
    }
  }
}
if (-not $weekAdvanced) { Write-Host 'WEEK_ADVANCE_FAIL' } else { Write-Host 'WEEK_ADVANCE_PASS' }

# save + relaunch
adb -s $dev shell am force-stop com.callup.agency
Start-Sleep 1
adb -s $dev shell am start -n com.callup.agency/com.signhere.offline.MainActivity
Start-Sleep 3
Shot 'dg-06-relaunch.png'
$t = Texts
Write-Host 'relaunch:' ($t -join ' | ')
$saveLabel = Has $t '년차|콜업 에이전시'
Write-Host ("SAVE_SLOT={0}" -f $saveLabel)

# load into game — tap green save row (agency name), not lock slots
$loaded = $false
foreach ($lab in @('콜업 에이전시','1년차')) {
  if (Has $t $lab) {
    # tap left side of first slot button
    if (TapText $lab 2500) { $loaded = $true; break }
  }
}
if (-not $loaded) { Tap 600 2200 2500 }
Start-Sleep 2
Shot 'dg-07-loaded.png'
$t = Texts
Write-Host 'loaded:' (($t | Select-Object -First 15) -join ' | ')
$inGame = Has $t '오피스|자금|영입|홈 화면|선수|구단'
$onTitle = Has $t '새 게임|BASEBALL|1번'
Write-Host ("LOAD_INGAME={0} ON_TITLE={1}" -f $inGame, $onTitle)
if (Has $t '콜업 야구 세이브만|새 게임을 시작') { Write-Host 'REJECT_MSG_SHOWN' }

# --- old save reject probe via injected localStorage soccer fingerprint ---
Write-Host '--- reject probe ---'
adb -s $dev shell am force-stop com.callup.agency
# dump shared prefs / webview localstorage paths
adb -s $dev shell run-as com.callup.agency ls app_webview 2>$null
adb -s $dev shell run-as com.callup.agency ls shared_prefs 2>$null
adb -s $dev shell "run-as com.callup.agency find . -name '*Local Storage*' 2>/dev/null | head" 2>$null

Write-Host 'DEVICE_GATES_DONE'
Write-Host ("WEEK={0} SAVE={1} LOAD={2}" -f $weekAdvanced, $saveLabel, $inGame)
