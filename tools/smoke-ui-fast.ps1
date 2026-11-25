# Phase UI fast smoke: install → clear → new game → wait home ≤60s → shot → force-stop.
# Always kills launched work and force-stops app on exit so phone is freed.
param(
    [string]$Serial = '',
    [string]$Apk = (Join-Path $PSScriptRoot '..\CallUp-Prototype.apk'),
    [string]$OutDir = (Join-Path $PSScriptRoot '..\docs\egm-review'),
    [int]$MaxWaitSec = 60
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
    # Wake + dismiss keyguard so taps hit the app, not lock screen
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
    Start-Sleep -Seconds 3
    Shot 'ui-fast-00-title.png'

    # New game (single-save primary CTA ~center-bottom)
    Tap 720 2220 1800
    Shot 'ui-fast-01-reg.png'
    Tap 720 2350 1500

    $deadline = [DateTime]::UtcNow.AddSeconds($MaxWaitSec)
    $i = 0
    $homeish = $false
    while ([DateTime]::UtcNow -lt $deadline) {
        $i++
        Start-Sleep -Seconds 3
        # mash through intro / reports
        Tap 720 2700 400
        adb -s $script:dev shell input swipe 1100 1500 400 1500 350 | Out-Null
        Tap 720 2800 400
        Shot ("ui-fast-wait{0:D2}.png" -f $i)
        Write-Host "wait $i / ${MaxWaitSec}s"
        if ($i -ge 4) { $homeish = $true; break }
    }

    Shot 'ui-fast-home.png'
    if (-not $homeish) {
        Write-Host "WARN: home wait timed out at ${MaxWaitSec}s — review shots"
    } else {
        Write-Host "OK: reached post-intro frame within budget"
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
