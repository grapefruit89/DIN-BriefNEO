param([string]$Path, [string]$Content, [string]$Mode = "rewrite")

$MIN_RATIO = 0.80  # Datei darf maximal 20% schrumpfen

if (Test-Path $Path) {
    if ($Mode -eq "rewrite") {
        Write-Error "FATAL: rewrite auf existierende Datei '$Path' VERBOTEN (BRAIN-013)"
        exit 1
    }
    # Zeilen-Check für append/patch
    $before = (Get-Content $Path).Count
    $after = ($Content -split "`n").Count
    if ($after -lt ($before * $MIN_RATIO)) {
        Write-Error "SHRINK-ALARM: '$Path' würde von $before auf $after Zeilen schrumpfen. ABBRUCH."
        exit 1
    }
}

Set-Content -Path $Path -Value $Content -Encoding UTF8
Write-Host "OK: $Path geschrieben ($((Get-Content $Path).Count) Zeilen)"
