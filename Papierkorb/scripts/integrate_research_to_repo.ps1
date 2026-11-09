# PowerShell script to integrate dinbrief-temp into DIN-Brief Neo /research
# Excludes __pycache__ and respects .gitignore rules.

$ErrorActionPreference = "Stop"

$SourceDir = "C:\Users\morit\Documents\dinbrief-temp"
$RepoDir = "C:\Users\morit\Documents\Obsidian_Main\Websites & Software\DIN-Brief Neo"
$TargetDir = Join-Path $RepoDir "research"

Write-Host "=== Integrating dinbrief-temp into DIN-Brief Neo /research ==="

# 1. Ensure target directory exists
if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
    Write-Host "Created folder: $TargetDir"
}

# 2. Copy files excluding __pycache__
Write-Host "Copying research files to $TargetDir..."

Get-ChildItem -Path $SourceDir -Recurse | ForEach-Object {
    $item = $_
    $relPath = $item.FullName.Substring($SourceDir.Length).TrimStart("\", "/")
    
    # Skip __pycache__
    if ($relPath -like "*__pycache__*") {
        return
    }

    $destPath = Join-Path $TargetDir $relPath
    if ($item.PSIsContainer) {
        if (-not (Test-Path $destPath)) {
            New-Item -ItemType Directory -Path $destPath -Force | Out-Null
        }
    } else {
        $parent = Split-Path $destPath -Parent
        if (-not (Test-Path $parent)) {
            New-Item -ItemType Directory -Path $parent -Force | Out-Null
        }
        Copy-Item -Path $item.FullName -Destination $destPath -Force
    }
}

Write-Host "Files copied successfully to: $TargetDir"

# 3. Check Git status
Write-Host "`n=== Git Status in DIN-Brief Neo ==="
Set-Location -Path $RepoDir
git status --short
