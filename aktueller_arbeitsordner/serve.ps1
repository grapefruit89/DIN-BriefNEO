$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir
Write-Host "Starte lokalen Webserver auf Port 8000..." -ForegroundColor Cyan
Start-Process "http://localhost:8000"
python -m http.server 8000 -d website
