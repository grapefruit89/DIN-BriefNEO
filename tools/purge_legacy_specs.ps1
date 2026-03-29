# Purge legacy specs and plans folders
# These files have been consolidated into .brain/00_REQUIREMENTS_MASTER_v1.0.0.md

Write-Host "Purging legacy specs/ and plans/ folders..." -ForegroundColor Yellow

$projectRoot = "C:\Users\morit\Desktop\DIN-BriefNEO"
$specsPath = Join-Path $projectRoot "specs"
$plansPath = Join-Path $projectRoot "plans"

if (Test-Path $specsPath) {
    Remove-Item -Path $specsPath -Recurse -Force
    Write-Host "Removed $specsPath" -ForegroundColor Green
}

if (Test-Path $plansPath) {
    Remove-Item -Path $plansPath -Recurse -Force
    Write-Host "Removed $plansPath" -ForegroundColor Green
}

Write-Host "Purge complete." -ForegroundColor Green
