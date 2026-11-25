# Phase UI fast smoke: install → clear → new game → wait home ≤budget → shot → force-stop.
# Always force-stops app on exit so phone is freed.
# Device probe (1440x3120): 새 게임 y≈2600, 시작하기 y≈2300.
param(
    [string]$Serial = '',
    [string]$Apk = (Join-Path $PSScriptRoot '..\CallUp-Prototype.apk'),
    [string]$OutDir = (Join-Path $PSScriptRoot '..\docs\egm-review'),
    [int]$MaxWaitSec = 90
)

$ErrorActionPreference = 'Stop'
$Apk = (Resolve-Path -LiteralPath $Apk).Path
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$pkg = 'com.callup.agency'
$activity = 'com.callup.agency/com.signhere.offline.MainActivity'
$script:dev = $null

function Get-Serial {
    if ($Serial) { return $Serial }
    $line = adb devices | Select-String '\tdevice$' | Select-Object -First 1
    if (-not $line) { throw 'No adb device' }
    return ($line.ToString() -split '\s+')[0]
}

function Shot([string]$name) {
    $remote = '/sdcard/cu-ui-fast.png'
    $local = Join-Path $OutDir $name
    adb -s $script:dev shell screencap -p $remote | Out-Null
    adb -s $script:dev pull $remote $local | Out-Null
    Write-Host "shot $name"
}

function Tap([int]$x, [int]$y, [int]$waitMs = 1200) {
    adb -s $script:dev shell input tap $x $y | Out-Null
    Start-Sleep -Milliseconds $waitMs
}

function Swipe([int]$x1, [int]$y1, [int]$x2, [int]$y2, [int]$dur = 350) {
    adb -s $script:dev shell input swipe $x1 $y1 $x2 $y2 $dur | Out-Null
    Start-Sleep -Milliseconds 700
}

function Cleanup {
    if ($script:dev) {
        try { adb -s $script:dev shell am force-stop $pkg | Out-Null } catch {}
        Write-Host "force-stop $pkg"
    }
}

trap {
    Write-Host "SMOKE ERROR: $_"
    Cleanup
    break
}

try {
    $script:dev = Get-Serial
    Write-Host "device $($script:dev)"
    adb -s $script:dev shell input keyevent KEYCODE_WAKEUP | Out-Null
    Start-Sleep -Milliseconds 400
    adb -s $script:dev shell input keyevent KEYCODE_BACK | Out-Null
    adb -s $script:dev shell wm dismiss-keyguard | Out-Null
    adb -s $script:dev shell input swipe 700 2400 700 400 250 | Out-Null
    Start-Sleep -Milliseconds 600

    adb -s $script:dev install -r $Apk
    adb -s $script:dev shell am force-stop $pkg
    adb -s $script:dev shell pm clear $pkg
    adb -s $script:dev logcat -c
    adb -s $script:dev shell am start -n $activity
    Start-Sleep -Seconds 5
    Shot 'ui-fast-00-title.png'

    # 새 게임 (probed y≈2600 on 1440x3120)
    Tap 720 2600 2200
    Shot 'ui-fast-01-reg.png'
    # pick first logo (contract mark) then 시작하기
    Tap 280 1980 800
    Tap 720 2300 1500
    Shot 'ui-fast-02-started.png'

    $deadline = [DateTime]::UtcNow.AddSeconds($MaxWaitSec)
    $i = 0
    $homeish = $false
    while ([DateTime]::UtcNow -lt $deadline) {
        $i++
        Start-Sleep -Seconds 5
        # story next / skip / pageflip
        Tap 1100 2850 350
        Tap 720 2850 350
        Swipe 1180 1600 360 1600 400
        Tap 400 2850 350
        Shot ("ui-fast-wait{0:D2}.png" -f $i)
        Write-Host "wait $i / ${MaxWaitSec}s"
        if ([DateTime]::UtcNow -ge $deadline.AddSeconds(-8)) { $homeish = $true; break }
    }

    # Mid CTA first tap goes home if not already; second shot captures chrome
    Tap 720 2950 1200
    Shot 'ui-fast-home.png'
    Shot 'ui-fast-mid-cta.png'
    if (-not $homeish) {
        Write-Host "WARN: home wait timed out at ${MaxWaitSec}s — review shots"
    } else {
        Write-Host "OK: finished wait budget — review ui-fast-home.png + mid-cta"
    }

    $log = adb -s $script:dev logcat -d -t 80 2>$null |
        Select-String -Pattern 'Uncaught|TypeError|ReferenceError|callupAssert'
    if ($log) {
        Write-Host '--- logcat ---'
        $log | ForEach-Object { $_.Line }
    }
    Write-Host "SMOKE UI FAST DONE → $OutDir"
}
finally {
    Cleanup
}
