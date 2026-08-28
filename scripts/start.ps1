# scripts/start.ps1
# Einfacher, robuster Einstiegspunkt für DIN-Brief Neo (Light Mode by Default)
# Macht den täglichen Build + Reconciliation so automatisch wie möglich.
#
# Caching: create_context.js und build_db.py sind reine Artefakt-Generatoren
# und werden übersprungen, wenn sich ihre relevanten Eingabedateien seit dem
# letzten Lauf nicht geändert haben (siehe tools/pipeline-cache.ps1).
# reconciliation.js / build_db.js (der Fitness Gate) läuft IMMER, ungecacht --
# AGENTS.md Paragraph 2 verlangt den Fitness Score vor und nach jeder
# Änderung, das darf durch Caching nicht unterlaufen werden.
# Mit -Force werden alle Caches ignoriert und die volle Pipeline läuft durch.

param (
    [switch]$Help,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

if ($Help) {
    Write-Host "=== DIN-Brief Neo Start-Skript ===" -ForegroundColor Cyan
    Write-Host "Nutzung: .\scripts\start.ps1 [-Force]"
    Write-Host "Prüft ob Node.js installiert ist und startet den Reconciliation/Build-Prozess."
    Write-Host "Es muss zwingend ein Fitness Score von 100% erreicht werden."
    Write-Host "-Force: ignoriert alle Caches, führt die komplette Pipeline aus."
    exit 0
}

Write-Host "=== DIN-Brief Neo - Start / Build (Light Mode) ===" -ForegroundColor Cyan
Write-Host "Ziel: Einfacher Einstieg mit Reconciliation + Fitness Gate (100% Score)" -ForegroundColor Gray
Write-Host ""

$targetDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)  # scripts/ -> Repo-Root
Set-Location $targetDir

. (Join-Path $targetDir "tools\pipeline-cache.ps1")

Write-Host "[1/5] Prüfe Node.js..." -ForegroundColor Yellow
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

Write-Host "[2/5] Generiere aktuellen LLM-System-Prompt..." -ForegroundColor Yellow
$contextInputs = @(
    (Join-Path $targetDir "README.md"),
    (Join-Path $targetDir "docs\index.md"),
    (Join-Path $targetDir "AGENTS.md"),
    (Join-Path $targetDir "docs\00-foundation")
)
$contextOutput = Join-Path $targetDir "build\LLM_CONTEXT.md"
$buildDir = Join-Path $targetDir "build"
if (-not (Test-Path $buildDir)) {
    New-Item -ItemType Directory -Path $buildDir -Force | Out-Null
}
if ($Force -or (Test-StepNeedsRun -StepName "create_context" -InputPaths $contextInputs -OutputPath $contextOutput)) {
    node tools/create_context.js
    Update-StepCache -StepName "create_context" -InputPaths $contextInputs
} else {
    Write-Host "    Uebersprungen (keine Aenderung seit letztem Lauf, build/LLM_CONTEXT.md ist aktuell)." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "[3/5] Starte Reconciliation + Build (Fitness Score muss 100% sein)..." -ForegroundColor Yellow
Write-Host "    (immer aktiv, kein Caching -- Fitness Gate darf nie uebersprungen werden)" -ForegroundColor DarkGray
node tools/build_db.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Error "Build fehlgeschlagen (Fitness < 100% oder kritische Violations). Siehe Ausgabe oben."
    exit 1
}

Write-Host ""
Write-Host "[4/5] Starte Python SQLite OmniTraceability Parser (Phase 1)..." -ForegroundColor Yellow

# Repo-lokale venv bevorzugen; falls keine existiert, auf System-Python zurückfallen
# statt an einem hartcodierten, umgebungsabhaengigen Pfad zu scheitern.
$venvPython = Join-Path $targetDir ".venv\Scripts\python.exe"
if (Test-Path $venvPython) {
    $pythonExe = $venvPython
} else {
    $pythonExe = "python"
    Write-Host "    (Keine .venv/ im Projekt gefunden, nutze System-Python)" -ForegroundColor DarkGray
}

$dbInputs = @(
    (Join-Path $targetDir "docs"),
    (Join-Path $targetDir "website")
)
$dbOutput = Join-Path $targetDir "build\DIN-Brief_docs.db"
if ($Force -or (Test-StepNeedsRun -StepName "build_db_py" -InputPaths $dbInputs -OutputPath $dbOutput)) {
    & $pythonExe tools/build_db.py

    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Error "Python OmniTraceability Build fehlgeschlagen."
        exit 1
    }
    Update-StepCache -StepName "build_db_py" -InputPaths $dbInputs
} else {
    Write-Host "    Uebersprungen (keine Aenderung in docs/ oder website/ seit letztem Lauf)." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "[5/5] Fertig. Fitness Score: 100% ! Datenbank und Reconciliation erfolgreich." -ForegroundColor Green
Write-Host ""
Write-Host "Nächste Schritte (Light Mode - der Default):"
Write-Host "  - Aenderungen machen (siehe AGENTS.md)"
Write-Host "  - Erneut .\scripts\start.ps1 ausfuehren (Pre + Post Gate)"
Write-Host "  - Wichtige Aktionen mit node tools/log_session.js loggen"
Write-Host ""
Write-Host "Tipp: Light Mode fuer die meisten Aenderungen (Bugfixes, kleine Refactorings)."
Write-Host "Full Mode (mit spec/plan/tasks) nur für bewusst wichtige Features (siehe AGENTS.md)." -ForegroundColor Gray
Write-Host "Tipp: -Force ignoriert alle Caches und fuehrt die komplette Pipeline aus." -ForegroundColor Gray
Write-Host ""
Write-Host "=== ENDE ===" -ForegroundColor Cyan
