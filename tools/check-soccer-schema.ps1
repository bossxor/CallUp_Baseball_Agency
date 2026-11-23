# Phase B — fail if soccer position/ability schema remains in assets
param(
    [string]$Root = (Join-Path $PSScriptRoot '..\apk-src')
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path -LiteralPath $Root).Path
$assets = Join-Path $Root 'assets\public\assets'
$public = Join-Path $Root 'assets\public'

$patterns = @(
    @{ Name = 'Ss_GK';   Regex = 'Ss=\{GK:' },
    @{ Name = 'Rt_GK';   Regex = 'Rt=\{GK:' },
    @{ Name = 'pos_GK';  Regex = 'Ss=\{GK:|Rt=\{GK:|pos==="GK"|"GK","DF","MF","FW"' },
    @{ Name = 'bucket_GK'; Regex = '\{GK:\[\],DF:\[\],MF:\[\],FW:\[\]\}|return\{GK:1,DF:' },
    @{ Name = 'Du_GK';  Regex = 'Du=\{GK:' },
    @{ Name = 'xF_FW';  Regex = 'xF=\{FW:\{pac:' },
    @{ Name = 'ability_gk'; Regex = 'stat:\{gk:|"gk":|\.gk(?=[^A-Za-z]|$)|B8=\{[^}]*gk:' },
    @{ Name = 'hattrick'; Regex = 'hattrick' },
    @{ Name = 'SignHere'; Regex = 'Sign Here|SignHere|사인히어|Football Agent|Football Agency' },
    @{ Name = '축구에이전'; Regex = '축구 에이전|풋볼 에이전' },
    @{ Name = 'debut_goal'; Regex = '데뷔골|프로 첫 골' },
    @{ Name = 'GOAL_badge'; Regex = 'children:"GOAL"|\"GOAL!\"' },
    @{ Name = 'striker'; Regex = '스트라이커' },
    @{ Name = 'Football_word'; Regex = '(?<![A-Za-z])Football(?![A-Za-z])' },
    @{ Name = '축구_word'; Regex = '축구' }
)

$files = @()
$files += Get-ChildItem -LiteralPath $assets -Filter *.js -File -ErrorAction SilentlyContinue
$files += Get-ChildItem -LiteralPath $public -Filter *.html -File -ErrorAction SilentlyContinue

$hits = @()
foreach ($file in $files) {
    $text = [IO.File]::ReadAllText($file.FullName)
    foreach ($p in $patterns) {
        $m = [regex]::Matches($text, $p.Regex)
        if ($m.Count -gt 0) {
            $hits += [pscustomobject]@{
                Pattern = $p.Name
                Count   = $m.Count
                Path    = $file.FullName.Substring($Root.Length).TrimStart('\', '/')
            }
        }
    }
}

Write-Host ("soccer-schema hits: {0} file-pattern rows" -f $hits.Count)
$hits | Format-Table -AutoSize Pattern, Count, Path | Out-String | Write-Host

if ($hits.Count -gt 0) {
    Write-Host 'GATE FAIL — soccer schema / SignHere leftovers'
    exit 1
}
Write-Host 'GATE PASS — soccer schema clean'
exit 0
