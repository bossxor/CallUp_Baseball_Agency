# Phase A identity gate — user-facing SignHere/football leftovers
param(
    [string]$Root = (Join-Path $PSScriptRoot '..\apk-src')
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path -LiteralPath $Root).Path
$patterns = @(
    '사인히어',
    'Sign Here',
    'SignHere',
    'Football Agent',
    'Football Agency',
    '풋볼',
    '축구 에이전'
)

$targets = @()
$targets += Get-ChildItem -LiteralPath (Join-Path $Root 'assets\public') -Recurse -Include *.html,*.js,*.css -File -ErrorAction SilentlyContinue
$targets += Get-ChildItem -LiteralPath (Join-Path $Root 'res') -Recurse -Include *.xml -File -ErrorAction SilentlyContinue
$manifest = Join-Path $Root 'AndroidManifest.xml'
if (Test-Path -LiteralPath $manifest) { $targets += Get-Item -LiteralPath $manifest }

function Test-Allowlisted([string]$path, [string]$line) {
    $norm = $path.Replace('\', '/')
    # Phase A: smali Activity path may remain; must not appear in user UI
    if ($norm -match 'AndroidManifest\.xml$' -and $line -match 'android:name="com\.signhere\.offline') { return $true }
    if ($norm -match 'callup-theme\.css$' -and $line -match 'SignHere|사인히어') { return $true }
    if ($norm -match 'cheats\.css$' -and $line -match '#141516') { return $true }
    if ($line -match '^\s*/\*' -or $line -match '^\s*\*' -or $line -match '^\s*//') {
        if ($norm -match 'callup-theme\.css$') { return $true }
    }
    return $false
}

$hits = @()
foreach ($file in $targets) {
    $i = 0
    foreach ($line in [IO.File]::ReadAllLines($file.FullName)) {
        $i++
        foreach ($p in $patterns) {
            if ($line -notlike "*$p*") { continue }
            if (Test-Allowlisted $file.FullName $line) { continue }
            $hits += [pscustomobject]@{
                Pattern = $p
                Path    = $file.FullName.Substring($Root.Length).TrimStart('\', '/')
                Line    = $i
                Text    = if ($line.Length -gt 160) { $line.Substring(0, 160) + '…' } else { $line }
            }
        }
    }
}

Write-Host ("identity hits: {0}" -f $hits.Count)
$hits | Group-Object Pattern | ForEach-Object { Write-Host ("  {0}: {1}" -f $_.Name, $_.Count) }
$hits | Select-Object -First 40 | Format-Table -AutoSize Pattern, Path, Line | Out-String | Write-Host

if ($hits.Count -gt 0) {
    Write-Host 'GATE FAIL — user-facing identity leftovers'
    exit 1
}
Write-Host 'GATE PASS — no user-facing identity leftovers'
exit 0
