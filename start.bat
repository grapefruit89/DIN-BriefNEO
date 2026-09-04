@echo off
title DIN-BriefNEO - Server starten

echo.
echo ============================================
echo   DIN-BriefNEO wird gestartet...
echo ============================================
echo.

cd /d "%~dp0"

echo [INFO] Pruefe auf alte Prozesse (Port 8088)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8088') do (
    if not "%%a"=="0" (
        taskkill /F /T /PID %%a >nul 2>&1
    )
)

echo [OK] Starte Live-Reload-Dev-Server (PowerShell)...
start "" /B powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\dev_server.ps1"
ping 127.0.0.1 -n 2 >nul

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "http://localhost:8088/index.html?nocache=%RANDOM%"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "http://localhost:8088/index.html?nocache=%RANDOM%"
) else (
    echo [INFO] Chrome nicht gefunden, oeffne Standard-Browser...
    start "" "http://localhost:8088/index.html?nocache=%RANDOM%"
)

echo.
echo [ERFOLG] Server laeuft auf http://localhost:8088
echo [INFO] Caching deaktiviert, Live-Reload aktiv.
echo Du kannst dieses Fenster jetzt schliessen.
echo.
ping 127.0.0.1 -n 4 >nul
exit /b