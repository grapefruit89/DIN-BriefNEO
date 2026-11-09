Set-Location -Path "C:\Users\morit\Documents\Obsidian_Main\Websites & Software\DIN-Brief Neo"
Write-Host "Pulling latest changes from origin/main..." -ForegroundColor Cyan
git pull --ff-only origin main

Write-Host "Running static fitness check (build_db.js)..." -ForegroundColor Cyan
node tools/build_db.js

Write-Host "Git Status:" -ForegroundColor Cyan
git status
