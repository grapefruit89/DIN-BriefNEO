# tools/setup-din-home.ps1
# Idempotentes Setup-Skript für ~/.din-briefneo

$dinHome = if ($env:DIN_BRIEFNEO_HOME) { $env:DIN_BRIEFNEO_HOME } else { Join-Path $HOME ".din-briefneo" }

Write-Host "=== DIN-BriefNEO Home Setup ===" -ForegroundColor Cyan
Write-Host "Zielverzeichnis: $dinHome"

$dirs = @("build", "cache", "node_modules", "research-raw")
foreach ($d in $dirs) {
    $p = Join-Path $dinHome $d
    if (-not (Test-Path $p)) {
        New-Item -ItemType Directory -Path $p -Force | Out-Null
    }
}

$tscBin = Join-Path $dinHome "node_modules\.bin\tsc.cmd"
$tscBinUnix = Join-Path $dinHome "node_modules\.bin\tsc"

if (-not (Test-Path $tscBin) -and -not (Test-Path $tscBinUnix)) {
    Write-Host "Installiere TypeScript in $dinHome..." -ForegroundColor Yellow
    npm install --prefix $dinHome --no-fund --no-audit typescript
} else {
    Write-Host "TypeScript ist bereits in $dinHome installiert." -ForegroundColor Green
}

Write-Host "Setup erfolgreich abgeschlossen." -ForegroundColor Green
