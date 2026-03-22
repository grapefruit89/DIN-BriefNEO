# scripts/pre-session.ps1
# -----------------------------------------------------------------
# DIN-BriefNEO -- Pre-Session Git Checkpoint
# BRAIN-013 | INCIDENT-001 Praevention
#
# USAGE: .\scripts\pre-session.ps1
# Vor JEDER Agenten-Session ausfuehren.
# -----------------------------------------------------------------

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$projectRoot = Split-Path -Parent $PSScriptRoot

Push-Location $projectRoot

try {
    # 1. Sicherstellen dass wir im richtigen Repo sind
    $repoCheck = git rev-parse --show-toplevel 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Kein Git-Repository gefunden in: $projectRoot" -ForegroundColor Red
        exit 1
    }

    # 2. Aktuellen Status pruefen
    $status = git status --porcelain
    $branch = git branch --show-current

    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host "  [PROTECT] DIN-BriefNEO -- Pre-Session Checkpoint" -ForegroundColor Cyan
    Write-Host "  Branch: $branch | $timestamp" -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Cyan

    if ($status) {
        # Geaenderte Dateien anzeigen
        Write-Host ""
        Write-Host "  Offene Aenderungen werden committed:" -ForegroundColor Yellow
        git status --short | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }

        # Commit erstellen
        git add -A
        git commit -m "chore: pre-session checkpoint [$timestamp]"

        Write-Host ""
        Write-Host "  [OK] Checkpoint committed: [$timestamp]" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "  [OK] Clean Working Tree -- kein Commit noetig." -ForegroundColor Green
    }

    # 4. Enforce Tool Ban (MANDATE-BANNED)
    if (Test-Path "scripts/enforce-tool-ban.ps1") {
        . ./scripts/enforce-tool-ban.ps1
    }

    # 5. Letzten Commit anzeigen als Bestaetigung
    $lastCommit = git log --oneline -1
    Write-Host "  [INFO] Letzter Commit: $lastCommit" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  [READY] Git-Schutz und Tool-Ban aktiv." -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host ""

} finally {
    Pop-Location
}
