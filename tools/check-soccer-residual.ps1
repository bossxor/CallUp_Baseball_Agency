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
$pattern += '|헤딩(?:골|안타)?|프리킥|오프사이드|오버헤드킥|승부차기|페널티\s*킥|코너킥|스로인|골키퍼|골망|정강이 보호대|하프타임|킥오프|결승골|세트피스|승점|하프라인|풀백|보복성 태클|(?<![\p{L}])태클(?![\p{L}])|(?<![\p{L}])(?:free[ -]kick|penalty shoot[ -]?out|corner kick|goalkeeper|set[ -]piece|hat[ -]trick|long ball|guardameta|fuera de juego|tiro libre|balón parado|full-?back|halfway sniper|revenge tackle)(?![\p{L}])'
$allowPaths = @(
    (Resolve-Path -LiteralPath $plan -ErrorAction SilentlyContinue).Path,
    (Resolve-Path -LiteralPath $self -ErrorAction SilentlyContinue).Path
) | Where-Object { $_ }

$files = Get-ChildItem -LiteralPath $assets -Include *.js,*.css,*.html -File -Recurse -ErrorAction SilentlyContinue
$hits = @()

foreach ($file in $files) {
    if ($allowPaths -contains $file.FullName) { continue }
    $text = [IO.File]::ReadAllText($file.FullName)
    if ($file.Name -eq 'engine-DhPc-c_J.js') {
        # Old copy is retained only as input to save migration.
        $text = $text -replace '(?s)/\*CALLUP_BASEBALL_EVENT_COPY\*/.*$', ''
        $text = $text -replace '(?s)/\*CALLUP_BASEBALL_SAVE_COPY\*/.*?(?=function KI\(x\)\{)', ''
    }
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
