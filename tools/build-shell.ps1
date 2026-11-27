# Build callup-shell. Uses %TEMP% when source is on network drive (Vite ENOENT).
$ErrorActionPreference = 'Stop'
$shell = (Resolve-Path (Join-Path $PSScriptRoot '..\shell')).Path
$local = Join-Path $env:TEMP 'callup-shell-build'
New-Item -ItemType Directory -Force -Path $local | Out-Null
# robocopy: network drive Copy-Item can hang
robocopy (Join-Path $shell 'src') (Join-Path $local 'src') /MIR /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
Copy-Item (Join-Path $shell 'index.html') $local -Force
Copy-Item (Join-Path $shell 'package.json') $local -Force
Copy-Item (Join-Path $shell 'package-lock.json') $local -Force
Copy-Item (Join-Path $shell 'vite.config.js') $local -Force
Push-Location $local
try {
    if (-not (Test-Path 'node_modules\vite')) {
        npm ci --no-fund --no-audit
        if ($LASTEXITCODE -ne 0) { throw 'npm ci failed' }
    }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw 'vite build failed' }
} finally {
    Pop-Location
}
$dest = Join-Path $shell 'dist'
New-Item -ItemType Directory -Force -Path $dest | Out-Null
robocopy (Join-Path $local 'dist') $dest /MIR /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
Write-Host "ok shell dist -> $dest"
