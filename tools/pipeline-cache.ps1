# tools/pipeline-cache.ps1
# Kleine Hash-basierte Skip-Logik fuer start.ps1.
#
# Zweck: create_context.js und build_db.py sind reine Artefakt-Generatoren
# (kein Fitness-Gate-Bestandteil) und muessen NICHT bei jedem Aufruf neu
# laufen, wenn sich die relevanten Quelldateien seit dem letzten Lauf nicht
# geaendert haben. reconciliation.js (der Fitness Gate) ist davon bewusst
# AUSGENOMMEN und laeuft immer -- AGENTS.md Paragraph 2 verlangt den
# Fitness Score vor UND nach jeder Aenderung, ungecacht.
#
# Herkunft: ChatGPT-Brainstorm "Repo Struktur Refactoring", Antwort 5 --
# "Agenten-Infrastruktur entschlacken", start.ps1-Pipeline laeuft bislang
# immer komplett durch.

$CacheDir = Join-Path $PSScriptRoot "..\agent\cache"
$CacheFile = Join-Path $CacheDir "pipeline-hashes.json"

function Get-PathsHash {
    <#
    .SYNOPSIS
    Berechnet einen einzelnen Hash ueber den Inhalt aller gegebenen Dateien.
    Nicht ueber generierte Outputs (die haben oft Zeitstempel eingebettet,
    siehe create_context.js PREAMBLE) -- nur ueber die Quelldateien, die
    tatsaechlich bestimmen ob eine Neugenerierung noetig ist.
    #>
    param([string[]]$Paths)

    $hasher = [System.Security.Cryptography.SHA256]::Create()
    $combined = New-Object System.Text.StringBuilder

    foreach ($p in ($Paths | Sort-Object)) {
        if (Test-Path $p -PathType Leaf) {
            $bytes = [IO.File]::ReadAllBytes($p)
            $fileHash = [BitConverter]::ToString($hasher.ComputeHash($bytes)) -replace '-', ''
            [void]$combined.Append("$p`:$fileHash;")
        } elseif (Test-Path $p -PathType Container) {
            Get-ChildItem -Path $p -Recurse -File | Sort-Object FullName | ForEach-Object {
                $bytes = [IO.File]::ReadAllBytes($_.FullName)
                $fileHash = [BitConverter]::ToString($hasher.ComputeHash($bytes)) -replace '-', ''
                [void]$combined.Append("$($_.FullName):$fileHash;")
            }
        }
        # Fehlende Pfade werden bewusst NICHT als Fehler behandelt --
        # ein fehlendes optionales Verzeichnis aendert einfach den Hash nicht.
    }

    $finalBytes = [Text.Encoding]::UTF8.GetBytes($combined.ToString())
    $finalHash = [BitConverter]::ToString($hasher.ComputeHash($finalBytes)) -replace '-', ''
    $hasher.Dispose()
    return $finalHash
}

function Get-CachedHashes {
    if (Test-Path $CacheFile) {
        try {
            return Get-Content $CacheFile -Raw | ConvertFrom-Json -AsHashtable
        } catch {
            # Korrupte/leere Cache-Datei: wie "kein Cache" behandeln,
            # nicht das ganze Pipeline abbrechen.
            return @{}
        }
    }
    return @{}
}

function Save-CachedHash {
    param([string]$StepName, [string]$Hash)

    if (-not (Test-Path $CacheDir)) {
        New-Item -ItemType Directory -Path $CacheDir -Force | Out-Null
    }

    $hashes = Get-CachedHashes
    $hashes[$StepName] = $Hash
    $hashes | ConvertTo-Json | Set-Content -Path $CacheFile -Encoding utf8
}

function Test-StepNeedsRun {
    <#
    .SYNOPSIS
    Prueft ob ein Pipeline-Schritt laufen muss: ja, wenn sich der Hash der
    Eingabedateien seit dem letzten gespeicherten Lauf geaendert hat, oder
    wenn noch kein Cache-Eintrag existiert, oder wenn das erwartete Output-
    Artefakt fehlt (z.B. nach einem frischen Checkout / build/ geloescht).
    #>
    param(
        [string]$StepName,
        [string[]]$InputPaths,
        [string]$OutputPath
    )

    if ($OutputPath -and -not (Test-Path $OutputPath)) {
        return $true
    }

    $currentHash = Get-PathsHash -Paths $InputPaths
    $cached = Get-CachedHashes

    if (-not $cached.ContainsKey($StepName)) {
        return $true
    }

    return $cached[$StepName] -ne $currentHash
}

function Update-StepCache {
    param([string]$StepName, [string[]]$InputPaths)
    $hash = Get-PathsHash -Paths $InputPaths
    Save-CachedHash -StepName $StepName -Hash $hash
}
