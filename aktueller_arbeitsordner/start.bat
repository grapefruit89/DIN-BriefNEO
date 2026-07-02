@echo off
setlocal enabledelayedexpansion

title DIN-BriefNEO - Server starten

echo.
echo ============================================
echo   DIN-BriefNEO wird gestartet...
echo ============================================
echo.

:: Ins Verzeichnis der .bat-Datei wechseln
cd /d "%~dp0"

:: Prüfen, ob Python verfügbar ist
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [FEHLER] Python wurde nicht gefunden!
    echo.
    echo Bitte installiere Python von https://www.python.org/downloads/
    echo und aktiviere beim Installieren die Option "Add Python to PATH".
    echo.
    pause
    exit /b
)

echo [OK] Python gefunden.
echo [INFO] Starte lokalen Webserver auf Port 8000...
echo.

:: Webserver im Hintergrund starten (ohne extra Fenster)
start "" /B python -m http.server 8000

:: Kurze Wartezeit, damit der Server hochfährt
timeout /t 1 /nobreak >nul

:: Browser öffnen
echo [INFO] Öffne Browser...
start http://localhost:8000/website/index.html

echo.
echo ============================================
echo   Server läuft unter: http://localhost:8000
echo   Du kannst dieses Fenster jetzt schließen.
echo ============================================
echo.
timeout /t 3 >nul
