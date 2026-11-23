# Phase B device smoke: install → new game → flip → home → 4 weeks → save/relaunch → reject probe
param(
    [string]$Serial = '',
    [string]$Apk = (Join-Path $PSScriptRoot '..\CallUp-Prototype.apk'),
    [string]$OutDir = (Join-Path $PSScriptRoot '..\docs\egm-review')
)

$ErrorActionPreference = 'Stop'
$Apk = (Resolve-Path -LiteralPath $Apk).Path
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

function Get-Serial {
    if ($Serial) { return $Serial }
    $line = adb devices | Select-String '\tdevice$' | Select-Object -First 1
    if (-not $line) { throw 'No adb device' }
    return ($line.ToString() -split '\s+')[0]
}

function Shot([string]$name) {
    $remote = '/sdcard/cu-smoke.png'
    $local = Join-Path $OutDir $name
    adb -s $dev shell screencap -p $remote | Out-Null
    adb -s $dev pull $remote $local | Out-Null
    Write-Host "shot $name"
}

function Tap([int]$x, [int]$y, [int]$waitMs = 1500) {
    adb -s $dev shell input tap $x $y | Out-Null
    Start-Sleep -Milliseconds $waitMs
}

function Swipe([int]$x1, [int]$y1, [int]$x2, [int]$y2, [int]$dur = 350) {
    adb -s $dev shell input swipe $x1 $y1 $x2 $y2 $dur | Out-Null
    Start-Sleep -Milliseconds 800
}

function LogcatErrors {
    adb -s $dev logcat -d -t 120 2>$null |
        Select-String -Pattern 'Uncaught|TypeError|ReferenceError|콜업 야구|callupAssert' |
        Select-Object -Last 25
}

$dev = Get-Serial
Write-Host "device $dev"
adb -s $dev install -r $Apk
adb -s $dev shell am force-stop com.callup.agency
adb -s $dev shell pm clear com.callup.agency
adb -s $dev logcat -c
adb -s $dev shell am start -n com.callup.agency/com.signhere.offline.MainActivity
Start-Sleep -Seconds 3
Shot 'smoke13-title.png'

# Slot 1 new game
Tap 721 2221 2000
Shot 'smoke13-reg.png'
# Start
Tap 719 2353 2000

# Wait world gen
$ready = $false
for ($i = 1; $i -le 24; $i++) {
    Start-Sleep -Seconds 5
    Shot ("smoke13-wait{0:D2}.png" -f $i)
    $err = LogcatErrors
    if ($err) { Write-Host "logcat:"; $err | ForEach-Object { $_.Line } }
    # heuristic: leave register/loading by tapping nothing; check via screenshot size change later
    Write-Host "wait $i"
    if ($i -ge 3) {
        # mash through early report/story once loading likely done
        Tap 720 2800 900
        Swipe 1100 1600 400 1600 400
        Tap 720 2626 900
    }
    if ($i -ge 6) { $ready = $true; break }
}

Shot 'smoke13-after-intro.png'

# Advance story / flip reports
for ($i = 0; $i -lt 18; $i++) {
    Swipe 1180 1500 360 1500 380
    Tap 720 2750 700
}
Shot 'smoke13-home.png'

# Try advance weeks (home 다음주 / 패스 UI varies) — tap common bottom actions
for ($w = 1; $w -le 8; $w++) {
    Tap 720 2950 600
    Tap 1100 2900 600
    Tap 360 2900 600
    Tap 720 2700 600
    Shot ("smoke13-week{0}.png" -f $w)
}

# Force-stop + relaunch (save persistence)
adb -s $dev shell am force-stop com.callup.agency
Start-Sleep -Seconds 1
adb -s $dev shell am start -n com.callup.agency/com.signhere.offline.MainActivity
Start-Sleep -Seconds 3
Shot 'smoke13-relaunch.png'

# Reject probe: inject soccer-ish save is hard offline; instead open slot load if any and note
Write-Host '--- logcat assert/errors ---'
LogcatErrors | ForEach-Object { $_.Line }
Write-Host 'SMOKE SCRIPT DONE — review shots in' $OutDir
