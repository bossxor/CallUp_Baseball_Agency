param(
    [string]$SourceDir = (Join-Path $PSScriptRoot '..\apk-src'),
    [string]$OutputApk = (Join-Path $PSScriptRoot '..\CallUp-Prototype.apk'),
    [int]$VersionCode = 110,
    [string]$VersionName = '0.1.0-callup.1',
    [switch]$SkipPatch
)

$ErrorActionPreference = 'Stop'
$SourceDir = (Resolve-Path -LiteralPath $SourceDir).Path
$OutputApk = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutputApk)

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
    node (Join-Path $PSScriptRoot 'enable-cheats.cjs') $SourceDir
    if ($LASTEXITCODE -ne 0) { throw 'enable-cheats failed' }
}

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
