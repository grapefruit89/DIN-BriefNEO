# start.ps1
# Einfacher, robuster Einstiegspunkt für DIN-Brief Neo (Light Mode by Default)
# Macht den täglichen Build + Reconciliation so automatisch wie möglich.
#
# Kann von zwei Orten aufgerufen werden:
# - Direkt aus aktueller_arbeitsordner/  (empfohlen)
# - Vom übergeordneten "DIN-Brief Neo/" Ordner aus (wird automatisch in den aktiven Ordner wechseln)

param (
    [switch]$Help
)

$ErrorActionPreference = "Stop"

if ($Help) {
    Write-Host "=== DIN-Brief Neo Start-Skript ===" -ForegroundColor Cyan
    Write-Host "Nutzung: .start.ps1"
    Write-Host "Dieses Skript wechselt automatisch in das richtige Verzeichnis,"
    Write-Host "prüft ob Node.js installiert ist und startet den Reconciliation/Build-Prozess."
    Write-Host "Es muss zwingend ein Fitness Score von 100% erreicht werden."
    exit 0
}

Write-Host "=== DIN-Brief Neo - Start / Build (Light Mode) ===" -ForegroundColor Cyan
Write-Host "Ziel: Einfacher Einstieg mit Reconciliation + Fitness Gate (100% Score)" -ForegroundColor Gray
Write-Host ""

# Intelligentes Verzeichnis-Handling
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$targetDir = $scriptDir

# Wenn wir im Parent-Ordner sind (der "DIN-Brief Neo" Ordner), wechsle in den aktiven Unterordner
if ((Split-Path -Leaf $scriptDir) -ne "aktueller_arbeitsordner") {
    $possibleActive = Join-Path $scriptDir "aktueller_arbeitsordner"
    if (Test-Path $possibleActive) {
        $targetDir = $possibleActive
        Write-Host "  (Automatisch in aktueller_arbeitsordner/ gewechselt)" -ForegroundColor DarkGray
    }
}

Set-Location $targetDir

Write-Host "[1/3] Prüfe Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "    Node gefunden: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Error "Node.js nicht gefunden. Bitte installieren (https://nodejs.org)."
    exit 1
}

Write-Host "[X] Injiziere Build-Timestamp in index.html..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "dd.MM.yyyy HH:mm"
$indexPath = Join-Path $targetDir "website\index.html"
$indexContent = [IO.File]::ReadAllText($indexPath)
$indexContent = $indexContent -replace '(?<=<button id="btn-dev-mode"[^>]*>).*?(?=</button>)', "$timestamp"
[IO.File]::WriteAllText($indexPath, $indexContent)
Write-Host "    Version aktualisiert auf: Build: $timestamp" -ForegroundColor Green

Write-Host "[X] Prüfe auf verbotene 'scroll' Begriffe in HTML und CSS..." -ForegroundColor Yellow
$scrollMatches = Select-String -Path "$targetDir\website\*.html", "$targetDir\website\css\*.css" -Pattern "scroll" -AllMatches -SimpleMatch
if ($scrollMatches) {
    Write-Host "GEFAHR: Verbotener Begriff 'scroll' in UI-Dateien gefunden!" -ForegroundColor Red
    foreach ($match in $scrollMatches) {
        Write-Host "  $($match.Filename):$($match.LineNumber) - $($match.Line.Trim())" -ForegroundColor Red
    }
    Write-Error "Scroll-Elemente (Klassen, Attribute, Kommentare) sind in diesem Projekt absolut verboten! Bitte entfernen."
    exit 1
}
Write-Host "    Keine Scroll-Begriffe gefunden. Sauber!" -ForegroundColor Green

Write-Host "[2/4] Generiere aktuellen LLM-System-Prompt..." -ForegroundColor Yellow
node tools/create_context.js

Write-Host ""
Write-Host "[3/5] Starte Reconciliation + Build (Fitness Score muss 100% sein)..." -ForegroundColor Yellow
node tools/build_db.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Error "Build fehlgeschlagen (Fitness < 100% oder kritische Violations). Siehe Ausgabe oben."
    exit 1
}

Write-Host ""
Write-Host "[4/5] Starte Python SQLite OmniTraceability Parser (Phase 1)..." -ForegroundColor Yellow
& ..\.venv\Scripts\python.exe tools/build_db.py

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Error "Python OmniTraceability Build fehlgeschlagen."
    exit 1
}

Write-Host ""
Write-Host "[5/5] Fertig. Fitness Score: 100% ! Datenbank und Reconciliation erfolgreich." -ForegroundColor Green
Write-Host ""
Write-Host "Nächste Schritte (Light Mode - der Default):"
Write-Host "  - Aenderungen machen (siehe AGENTS.md)"
Write-Host "  - Erneut .\start.ps1 ausfuehren (Pre + Post Gate)"
Write-Host "  - Wichtige Aktionen mit node tools/log_session.js loggen"
Write-Host ""
Write-Host "Tipp: Light Mode fuer die meisten Aenderungen (Bugfixes, kleine Refactorings)."
Write-Host "Full Mode (mit spec/plan/tasks) nur für bewusst wichtige Features (siehe AGENTS.md)." -ForegroundColor Gray
Write-Host ""
Write-Host "=== ENDE ===" -ForegroundColor Cyan