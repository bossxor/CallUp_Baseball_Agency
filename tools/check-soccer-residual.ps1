# Fail if soccer club / payroll / tournament / transfer-window leftovers in user assets
param(
    [string]$Root = (Join-Path $PSScriptRoot '..\apk-src')
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path -LiteralPath $Root).Path
$assets = Join-Path $Root 'assets\public\assets'
$plan = Join-Path $PSScriptRoot '..\.superpowers\sdd\task-1-brief.md'
$self = $PSCommandPath

if (-not (Test-Path $assets)) { throw "Missing assets: $assets" }

$pattern = '(?i)맨시티|레알 마드리드|바르셀로나|아스널|리버풀|주급|월드컵|FIFA|UEFA|여름 영입|겨울 영입|잉글란드|스페인|독일|이탈리아|네덜란드|벨기에|포르투갈|프랑스|프화련|(?:잉글란드|스페인|독일|이탈리아|네덜란드|벨기에|포르투갈|프랑스|오스트리아|스코틀랜드|튀르키예)\s*(?:1|2|3)부\s*리그|(?:[123]|\{tier\})부\s*리그|(?:점유|역습|압박|측면|롱볼|실리)\s*야구|세트피스 수비|독립리그'
$allowPaths = @(
    (Resolve-Path -LiteralPath $plan -ErrorAction SilentlyContinue).Path,
    (Resolve-Path -LiteralPath $self -ErrorAction SilentlyContinue).Path
) | Where-Object { $_ }

$files = Get-ChildItem -LiteralPath $assets -Include *.js,*.css,*.html -File -Recurse -ErrorAction SilentlyContinue
$hits = @()

foreach ($file in $files) {
    if ($allowPaths -contains $file.FullName) { continue }
    $text = [IO.File]::ReadAllText($file.FullName)
    $m = [regex]::Matches($text, $pattern)
    if ($m.Count -gt 0) {
        $hits += [pscustomobject]@{
            Count = $m.Count
            Path  = $file.FullName.Substring($Root.Length).TrimStart('\', '/')
            Sample = ($m | Select-Object -First 3 | ForEach-Object { $_.Value }) -join ', '
        }
    }
}

Write-Host ("soccer-residual hits: {0} files" -f $hits.Count)
$hits | Format-Table -AutoSize Count, Path, Sample | Out-String | Write-Host

if ($hits.Count -gt 0) {
    Write-Host 'GATE FAIL — soccer residual'
    exit 1
}
Write-Host 'GATE PASS — no soccer residual patterns'
exit 0