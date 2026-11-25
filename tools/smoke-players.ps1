# Install current APK → resume or new game → 선수 tab shots.
param(
    [string]$Serial = '',
    [string]$Apk = (Join-Path $PSScriptRoot '..\CallUp-Prototype.apk'),
    [string]$OutDir = (Join-Path $PSScriptRoot '..\docs\egm-review'),
    [switch]$Fresh
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
    $remote = '/sdcard/cu-players.png'
    $local = Join-Path $OutDir $name
    adb -s $script:dev shell screencap -p $remote | Out-Null
    adb -s $script:dev pull $remote $local | Out-Null
    Write-Host "shot $name"
}

function Tap([int]$x, [int]$y, [int]$waitMs = 1000) {
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
    adb -s $script:dev shell input keyevent KEYCODE_WAKEUP | Out-Null
    Start-Sleep -Milliseconds 400
    adb -s $script:dev shell wm dismiss-keyguard | Out-Null
    adb -s $script:dev shell input swipe 700 2400 700 400 250 | Out-Null
    Start-Sleep -Milliseconds 500

    adb -s $script:dev install -r -d $Apk
    if ($LASTEXITCODE -ne 0) { throw "install failed" }
    if ($Fresh) {
        adb -s $script:dev shell am force-stop $pkg
        adb -s $script:dev shell pm clear $pkg
        adb -s $script:dev shell am start -n $activity
        Start-Sleep -Seconds 5
        Tap 720 2600 2000
        Tap 280 1980 800
        Tap 720 2300 1500
        for ($i = 0; $i -lt 12; $i++) {
            Tap 1100 2850 300
            Tap 720 2850 300
            adb -s $script:dev shell input swipe 1180 1600 360 1600 350 | Out-Null
            Start-Sleep -Milliseconds 400
        }
        Tap 720 2950 1200
    } else {
        adb -s $script:dev shell am force-stop $pkg
        adb -s $script:dev shell am start -n $activity
        Start-Sleep -Seconds 5
        # continue save: gold slot button center
        Tap 720 2650 2000
        Tap 720 2950 1200
    }

    Shot 'ui-players-00-home.png'
    # 선수 tab ≈ x=360 y=3000 on 1440x3120
    Tap 360 3000 1500
    Shot 'ui-players-01-list.png'
    # tap first dossier card
    Tap 360 900 1200
    Shot 'ui-players-02-detail.png'
    # back if detail
    Tap 80 180 800
    Shot 'ui-players-03-back.png'
    Write-Host "SMOKE PLAYERS DONE → $OutDir"
}
finally {
    Cleanup
}
