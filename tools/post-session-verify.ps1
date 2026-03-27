# scripts/post-session-verify.ps1
# -----------------------------------------------------------------
# DIN-BriefNEO -- Post-Session Schaden-Pruefung
# BRAIN-013 | Zeigt was die Agenten-Session veraendert hat
#
# USAGE: .\scripts\post-session-verify.ps1
# Nach JEDER Agenten-Session ausfuehren.
# -----------------------------------------------------------------

$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot

try {
    $branch = git branch --show-current

    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host "  [SEARCH] Post-Session Verifikation" -ForegroundColor Cyan
    Write-Host "  Branch: $branch" -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Cyan

    # Diff gegen letzten Checkpoint
    $diffStat = git diff HEAD --stat
    $unstaged = git status --porcelain

    if (-not $diffStat -and -not $unstaged) {
        Write-Host ""
        Write-Host "  [OK] Keine Aenderungen seit letztem Checkpoint." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "  Aenderungen seit letztem Commit:" -ForegroundColor Yellow
        Write-Host ""

        # Farbige Ausgabe
        git diff HEAD --stat | ForEach-Object {
            if ($_ -match "deletion") {
                if ($_ -match "(\d+) deletion" -and [int]$Matches[1] -gt 10) {
                    Write-Host "  [!] $_" -ForegroundColor Red
                } else {
                    Write-Host "  $_" -ForegroundColor Gray
                }
            } elseif ($_ -match "insertion") {
                Write-Host "  $_" -ForegroundColor Green
            } else {
                Write-Host "  $_" -ForegroundColor Gray
            }
        }

        # Ungetrackte Aenderungen
        if ($unstaged) {
            Write-Host ""
            Write-Host "  Uncommitted Aenderungen:" -ForegroundColor Yellow
            git status --short | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
        }
    }

    # Kritische Dateien explizit pruefen
    $criticalFiles = @(
        "js/core/constants.js",
        "js/logic/logic.js",
        "GEMINI.md",
        "index.html",
        ".brain/08_isomorphic_schema.md"
    )

    Write-Host ""
    Write-Host "  Kritische Dateien (BRAIN-013):" -ForegroundColor Cyan
    foreach ($f in $criticalFiles) {
        if (Test-Path $f) {
            $lineCount = (Get-Content $f).Count
            $diffLines = git diff HEAD -- $f | Where-Object { $_ -match "^[-+][^-+]" }
            $deletions = ($diffLines | Where-Object { $_ -match "^-" }).Count
            if ($deletions -gt 10) {
                Write-Host "  [!] $f ($lineCount Zeilen, -$deletions Zeilen verloren!)" -ForegroundColor Red
            } else {
                Write-Host "  [OK] $f ($lineCount Zeilen)" -ForegroundColor Green
            }
        } else {
            Write-Host "  [ERROR] $f NICHT GEFUNDEN!" -ForegroundColor Red
        }
    }

    # -------------------------------------------------------------------------
    # PLATINUM MANDATE CHECK (SPEC-061)
    # -------------------------------------------------------------------------
    Write-Host ""
    Write-Host "  [SHIELD] PLATINUM MANDATE CHECK (v16.0.1):" -ForegroundColor Cyan

    # A. MANDATE-INJ (Zero innerHTML)
    # Ignoriere Zeilen mit // @pvp-ignore: innerHTML
    $innerHtmlMatches = Select-String -Path "js/**/*.js" -Pattern "\.innerHTML\s*=" -Exclude "js/logic/mirror-renderer.js" | Where-Object { $_.Line -notmatch "// @pvp-ignore: innerHTML" }
    if ($innerHtmlMatches) {
        Write-Host "  [ERROR] MANDATE-INJ VERSTOSS: .innerHTML gefunden!" -ForegroundColor Red
        $innerHtmlMatches | ForEach-Object { Write-Host "      -> $($_.Path):$($_.LineNumber)" -ForegroundColor Gray }
    } else {
        Write-Host "  [OK] MANDATE-INJ (Zero innerHTML): Bestaetigt." -ForegroundColor Green
    }

    # B. MANDATE-PLN (Plaintext-Only)
    # Liest das ganze File als String um Multiline-Tags zu finden
    $indexContent = Get-Content "index.html" -Raw
    # Regex sucht nach <din-TAG ... >, aber ignoriert din-body-mirror
    $tags = [regex]::Matches($indexContent, '(?s)<din-(?!body-mirror)([\w-]+)([^>]*?)>')
    $missingPlaintext = @()
    foreach ($tag in $tags) {
        if ($tag.Value -notmatch 'contenteditable="plaintext-only"') {
            $missingPlaintext += $tag.Value.Replace("`n", " ").Replace("`r", "").Trim()
        }
    }

    if ($missingPlaintext.Count -gt 0) {
        Write-Host "  [ERROR] MANDATE-PLN VERSTOSS: <din-*> Tag ohne plaintext-only!" -ForegroundColor Red
        $missingPlaintext | ForEach-Object { Write-Host "      -> $_" -ForegroundColor Gray }
    } else {
        Write-Host "  [OK] MANDATE-PLN (Plaintext-Only): Bestaetigt." -ForegroundColor Green
    }

    # C. MANDATE-NAT (Native-First)
    $externalScripts = Select-String -Path "index.html" -Pattern "<script.*src=`"http"
    if ($externalScripts) {
        Write-Host "  [!] MANDATE-NAT WARNUNG: Externes Script gefunden!" -ForegroundColor Yellow
        $externalScripts | ForEach-Object { Write-Host "      -> $($_.Line.Trim())" -ForegroundColor Gray }
    } else {
        Write-Host "  [OK] MANDATE-NAT (Native-First): Bestaetigt." -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "  [!] Zeilenverluste > 10 bei kritischen Dateien = ALARM." -ForegroundColor Yellow
    Write-Host "  [FIX] Wiederherstellung: git checkout HEAD -- filename" -ForegroundColor Gray
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host ""

} finally {
    Pop-Location
}
