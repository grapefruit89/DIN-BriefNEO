---
id: PLAN-061
spec: SPEC-061
title: Implementation of the Platinum Validation Pipeline (PVP)
status: cemented
anti-patterns: [ANTI-023, ANTI-025]
adr: [ADR-003, ADR-008]
---

# PLAN-061: Platinum Validation Pipeline (PVP)

## Constitution Check
| Mandate | Status | Note |
|---|---|---|
| [MANDATE-INJ] | OK | Actively checks for `innerHTML` violations. |
| [MANDATE-FREEZE] | OK | Monitors `din.core` and CMA-coordinates via the catalog. |
| [MANDATE-NAT] | OK | Checks for unauthorized external dependencies. |
| [MANDATE-PLN] | OK | Verifies `plaintext-only` attribute on all custom tags. |

## 1. Implementierung des IMR-Katalogs
Das Tool `scripts/get-catalog.mjs` ist bereits als ES-Modul angelegt. Es extrahiert die Daten direkt aus `js/core/constants.js`.

### Aufruf
```bash
node scripts/get-catalog.mjs
```

## 2. Erweiterung der Post-Session Verifikation
Die Datei `scripts/post-session-verify.ps1` wird um die Sektion `PLATINUM MANDATE CHECK` erweitert.

### Prüf-Logik (PowerShell)

#### A. MANDATE-INJ (Zero innerHTML)
```powershell
$innerHtmlMatches = Select-String -Path "js/**/*.js" -Pattern "\.innerHTML\s*=" -Exclude "js/logic/mirror-renderer.js"
if ($innerHtmlMatches) {
    Write-Host "  ❌ MANDATE-INJ VERSTOSS: .innerHTML gefunden!" -ForegroundColor Red
    $innerHtmlMatches | ForEach-Object { Write-Host "     -> $($_.Path):$($_.LineNumber)" -ForegroundColor Gray }
}
```

#### B. MANDATE-PLN (Plaintext-Only)
```powershell
$tagsWithoutPlaintext = Select-String -Path "index.html" -Pattern "<din-[\w-]+" | Where-Object { $_.Line -notmatch 'contenteditable="plaintext-only"' }
if ($tagsWithoutPlaintext) {
    Write-Host "  ❌ MANDATE-PLN VERSTOSS: <din-*> Tag ohne plaintext-only!" -ForegroundColor Red
    $tagsWithoutPlaintext | ForEach-Object { Write-Host "     -> $($_.Line.Trim())" -ForegroundColor Gray }
}
```

#### C. MANDATE-NAT (Native-First)
```powershell
$externalScripts = Select-String -Path "index.html" -Pattern "<script.*src=`"http"
if ($externalScripts) {
    Write-Host "  ⚠️  MANDATE-NAT WARNUNG: Externes Script gefunden!" -ForegroundColor Yellow
}
```

## 3. Rollout & Training
- Der Katalog wird in die `speckit.tasks.toml` als Vorbereitungs-Schritt aufgenommen.
- Alle Agenten werden instruiert, `get-catalog.js` zu nutzen, um Halluzinationen zu vermeiden.
