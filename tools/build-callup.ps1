param(
    [string]$SourceDir = (Join-Path $PSScriptRoot '..\apk-src'),
    [string]$OutputApk = (Join-Path $PSScriptRoot '..\CallUp-Prototype.apk'),
    [int]$VersionCode = 184,
    [string]$VersionName = '0.1.0-callup.69',
    [switch]$SkipPatch,
    [switch]$SkipShell
)

$ErrorActionPreference = 'Stop'
$SourceDir = (Resolve-Path -LiteralPath $SourceDir).Path
$OutputApk = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutputApk)

if (-not $SkipShell) {
    powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'build-shell.ps1')
    if ($LASTEXITCODE -ne 0) { throw 'build-shell failed' }
    node (Join-Path $PSScriptRoot 'inject-shell.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'inject-shell failed' }
}

$sdkCandidates = @(
    'C:/Android/Sdk/build-tools/37.0.0',
    'C:/Android/Sdk/build-tools/36.0.0',
    'C:/Android/Sdk/build-tools/35.0.0'
)
$sdk = $sdkCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $sdk) { throw 'Android build-tools not found under C:/Android/Sdk/build-tools' }

$androidJar = 'C:/Android/Sdk/platforms/android-35/android.jar'
if (-not (Test-Path $androidJar)) { throw "Missing $androidJar" }

if (-not $SkipPatch) {
    node (Join-Path $PSScriptRoot 'patch-callup.cjs') $SourceDir
    if ($LASTEXITCODE -ne 0) { throw 'patch-callup failed' }
    node (Join-Path $PSScriptRoot 'patch-bright.cjs') $SourceDir
    if ($LASTEXITCODE -ne 0) { throw 'patch-bright failed' }
    node (Join-Path $PSScriptRoot 'patch-scenes.cjs') $SourceDir
    if ($LASTEXITCODE -ne 0) { throw 'patch-scenes failed' }
    node (Join-Path $PSScriptRoot 'patch-defaults.cjs') $SourceDir
    if ($LASTEXITCODE -ne 0) { throw 'patch-defaults failed' }
    node (Join-Path $PSScriptRoot 'patch-baseball-sim.cjs') $SourceDir
    if ($LASTEXITCODE -ne 0) { throw 'patch-baseball-sim failed' }
    node (Join-Path $PSScriptRoot 'fix-pageflip-hit.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-pageflip-hit failed' }
    node (Join-Path $PSScriptRoot 'fix-pageflip-book.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-pageflip-book failed' }
    node (Join-Path $PSScriptRoot 'fix-phase-b-offline.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-phase-b-offline failed' }
    node (Join-Path $PSScriptRoot 'fix-logo-baseball.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-logo-baseball failed' }
    node (Join-Path $PSScriptRoot 'fix-staff-labels.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-staff-labels failed' }
    node (Join-Path $PSScriptRoot 'fix-purge2-copy.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-purge2-copy failed' }
    node (Join-Path $PSScriptRoot 'fix-labels-purge3.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-labels-purge3 failed' }
    node (Join-Path $PSScriptRoot 'fix-shooting-narrative.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-shooting-narrative failed' }
    node (Join-Path $PSScriptRoot 'fix-kill-ad-popup.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-kill-ad-popup failed' }
    node (Join-Path $PSScriptRoot 'fix-purge-copy-final.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-purge-copy-final failed' }
    node (Join-Path $PSScriptRoot 'fix-purge-copy-final2.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-purge-copy-final2 failed' }
    node (Join-Path $PSScriptRoot 'fix-purge-kickoff.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-purge-kickoff failed' }
    node (Join-Path $PSScriptRoot 'fix-purge-more.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-purge-more failed' }
    node (Join-Path $PSScriptRoot 'fix-skip-tut.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-skip-tut failed' }
    node (Join-Path $PSScriptRoot 'fix-load-assert.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-load-assert failed' }
    node (Join-Path $PSScriptRoot 'fix-deadline-midnight.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-deadline-midnight failed' }
    node (Join-Path $PSScriptRoot 'fix-clubs-baseball.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-clubs-baseball failed' }
    node (Join-Path $PSScriptRoot 'fix-club-rename.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-club-rename failed' }
    node (Join-Path $PSScriptRoot 'fix-salary-annual.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-salary-annual failed' }
    node (Join-Path $PSScriptRoot 'fix-clauses-baseball.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-clauses-baseball failed' }
    node (Join-Path $PSScriptRoot 'fix-calendar-baseball.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-calendar-baseball failed' }
    node (Join-Path $PSScriptRoot 'fix-intl-baseball.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-intl-baseball failed' }
    node (Join-Path $PSScriptRoot 'fix-terms-baseball.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-terms-baseball failed' }
    node (Join-Path $PSScriptRoot 'fix-offseason-camp.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-offseason-camp failed' }
    node (Join-Path $PSScriptRoot 'enable-cheats.cjs') $SourceDir
    if ($LASTEXITCODE -ne 0) { throw 'enable-cheats failed' }
    node (Join-Path $PSScriptRoot 'fix-ui-theme-dark.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-ui-theme-dark failed' }
    node (Join-Path $PSScriptRoot 'fix-ui-tab-baseball.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-ui-tab-baseball failed' }
    node (Join-Path $PSScriptRoot 'fix-ui-title-single-save.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-ui-title-single-save failed' }
    node (Join-Path $PSScriptRoot 'fix-ui-home-feed.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-ui-home-feed failed' }
    node (Join-Path $PSScriptRoot 'fix-ui-week-gate.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-ui-week-gate failed' }
    node (Join-Path $PSScriptRoot 'fix-ui-legend-hold.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-ui-legend-hold failed' }
    node (Join-Path $PSScriptRoot 'fix-ui-nego-contrast.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-ui-nego-contrast failed' }
    node (Join-Path $PSScriptRoot 'fix-ui-roster-pass.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-ui-roster-pass failed' }
    node (Join-Path $PSScriptRoot 'fix-ui-brand-logo.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-ui-brand-logo failed' }
    node (Join-Path $PSScriptRoot 'fix-ui-logo-default.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-ui-logo-default failed' }
    node (Join-Path $PSScriptRoot 'fix-ui-player-skin.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-ui-player-skin failed' }
    node (Join-Path $PSScriptRoot 'fix-ui-face-callup.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-ui-face-callup failed' }
    node (Join-Path $PSScriptRoot 'fix-phase-c-salary-season.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-phase-c-salary-season failed' }
    node (Join-Path $PSScriptRoot 'fix-phase-c-draft.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-phase-c-draft failed' }
    node (Join-Path $PSScriptRoot 'fix-phase-c-support.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-phase-c-support failed' }
    node (Join-Path $PSScriptRoot 'fix-phase-c-regress-copy.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-phase-c-regress-copy failed' }
    node (Join-Path $PSScriptRoot 'fix-phase-c-stop-rules.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'fix-phase-c-stop-rules failed' }
    node (Join-Path $PSScriptRoot 'fix-cheat-tabs-touch.cjs') $SourceDir
    if ($LASTEXITCODE -ne 0) { throw 'fix-cheat-tabs-touch failed' }
    node (Join-Path $PSScriptRoot 'fix-webview-no-zoom.cjs') $SourceDir
    if ($LASTEXITCODE -ne 0) { throw 'fix-webview-no-zoom failed' }
    foreach ($patch in @(
        'fix-baseball-leagues.cjs',
        'fix-baseball-engine-copy.cjs',
        'fix-baseball-shell-copy.cjs',
        'fix-baseball-events.cjs',
        'fix-baseball-save-copy.cjs',
        'fix-baseball-formal-names.cjs',
        'fix-clubs-baseball.cjs',
        'fix-club-formal-names.cjs',
        'fix-soccer-residual-copy.cjs',
        'fix-soccer-broad-copy.cjs',
        'fix-baseball-pitch-svg.cjs',
        'fix-title-diamond.cjs',
        'fix-baseball-ball-icon.cjs'
    )) {
        node (Join-Path $PSScriptRoot $patch) $SourceDir
        if ($LASTEXITCODE -ne 0) { throw "$patch failed" }
    }
}

powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'check-soccer-residual.ps1') -Root $SourceDir
if ($LASTEXITCODE -ne 0) { throw 'check-soccer-residual failed' }

$manifest = Join-Path $SourceDir 'AndroidManifest.xml'
[xml]$xml = Get-Content -Raw -Encoding UTF8 -LiteralPath $manifest
$androidNamespace = 'http://schemas.android.com/apk/res/android'
$xml.manifest.SetAttribute('package', 'com.callup.agency')
$xml.manifest.application.SetAttribute('label', $androidNamespace, '콜업')
# Keep existing MainActivity class path so smali does not need rename.
$xml.Save($manifest)

$meta = Join-Path $SourceDir 'apktool.yml'
$metadata = Get-Content -LiteralPath $meta -Raw -Encoding UTF8
$metadata = $metadata -replace '(?m)^apkFileName: .+', 'apkFileName: CallUp-Prototype.apk'
$metadata = $metadata -replace '(?m)^  versionCode: \d+', "  versionCode: $VersionCode"
$metadata = $metadata -replace '(?m)^  versionName: [^\r\n]+', "  versionName: $VersionName"
[IO.File]::WriteAllText($meta, $metadata)

$work = Join-Path $env:TEMP ('callup-build-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $work | Out-Null
$unsigned = Join-Path $work 'unsigned.apk'
$aligned = Join-Path $work 'aligned.apk'

# Call apktool.jar directly — Windows apktool.bat pauses when launched with cmd /c.
$apktoolJar = @(
    'C:\Windows\apktool.jar',
    (Join-Path $env:LOCALAPPDATA 'apktool\apktool.jar'),
    'C:\apktool\apktool.jar'
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if ($apktoolJar) {
    & java -jar $apktoolJar b -f $SourceDir -o $unsigned
} else {
    # Fallback: avoid /c so bat won't pause
    cmd /c "apktool b -f `"$SourceDir`" -o `"$unsigned`" < nul"
}
if ($LASTEXITCODE -ne 0) { throw 'apktool build failed' }

& "$sdk/zipalign.exe" -f -p 4 $unsigned $aligned
if ($LASTEXITCODE -ne 0) { throw 'zipalign failed' }

$ks = Join-Path $env:USERPROFILE '.android\debug.keystore'
if (-not (Test-Path $ks)) {
    $ksAlt = Join-Path $SourceDir '..\debug.keystore'
    if (Test-Path $ksAlt) { $ks = (Resolve-Path $ksAlt).Path }
    else { throw "debug.keystore not found at $ks" }
}

& "$sdk/apksigner.bat" sign --ks $ks --ks-pass pass:android --key-pass pass:android --out $OutputApk $aligned
if ($LASTEXITCODE -ne 0) { throw 'apksigner sign failed' }
& "$sdk/apksigner.bat" verify $OutputApk
if ($LASTEXITCODE -ne 0) { throw 'apksigner verify failed' }

$info = & "$sdk/aapt.exe" dump badging $OutputApk | Select-String '^package:'
if ($info -notmatch "name='com\.callup\.agency'") {
    throw "Unexpected package: $info"
}
$info | ForEach-Object Line
Write-Host "Built $OutputApk"
Remove-Item -Recurse -Force $work
