@echo off



title DIN-BriefNEO - Server starten

echo.
echo ============================================
echo   DIN-BriefNEO wird gestartet...
echo ============================================
echo.

cd /d "%~dp0"

:: ============================================
:: 0. Alte Prozesse auf Port 8088 aufräumen
:: ============================================
echo [INFO] Prüfe auf alte Prozesse (Port 8088)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8088') do (
    if not "%%a"=="0" (
        taskkill /F /T /PID %%a >nul 2>&1
    )
)

:: ============================================
:: 1. Live-Reload-Dev-Server starten (reines PowerShell,
::    kein Python/Node.js noetig -- in jedem Windows eingebaut)
:: ============================================
echo [OK] Starte Live-Reload-Dev-Server (PowerShell)...
start "" /B powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0dev_server.ps1"
ping 127.0.0.1 -n 2 >nul
goto open_browser

:open_browser
:: Bevorzugt Chrome, faellt sonst auf den Standard-Browser zurueck
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "http://localhost:8088/index.html?nocache=%RANDOM%"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "http://localhost:8088/index.html?nocache=%RANDOM%"
) else (
    echo [INFO] Chrome nicht gefunden, oeffne Standard-Browser...
    start "" "http://localhost:8088/index.html?nocache=%RANDOM%"
)

echo.
echo [ERFOLG] Server läuft auf http://localhost:8088
echo [INFO] Caching deaktiviert, Live-Reload aktiv -- Aenderungen an Dateien in
echo        website/ laden die Seite automatisch neu (bis zu ~0,7s Verzoegerung).
echo [INFO] Kein Python/Node.js noetig, kein Execution-Policy-Prompt
echo        (-ExecutionPolicy Bypass gilt nur fuer diesen einen Aufruf).
echo Du kannst dieses Fenster jetzt schließen.
echo.
ping 127.0.0.1 -n 4 >nul
exit /b
