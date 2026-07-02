@echo off
setlocal enabledelayedexpansion

title DIN-BriefNEO - Server starten

echo.
echo ============================================
echo   DIN-BriefNEO wird gestartet...
echo ============================================
echo.

cd /d "%~dp0"

:: ============================================
:: 1. Versuch: Python Webserver
:: ============================================
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Python gefunden. Starte Server mit Python...
    start "" /B python -m http.server 8000
    timeout /t 1 /nobreak >nul
    start http://localhost:8000/website/index.html
    
    echo.
    echo [ERFOLG] Server läuft auf http://localhost:8000
    echo Du kannst dieses Fenster jetzt schließen.
    echo.
    timeout /t 3 >nul
    exit /b
)

:: ============================================
:: 2. Versuch: Node.js (npx serve) als Fallback
:: ============================================
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [INFO] Python nicht gefunden. Versuche Node.js Fallback...
    echo [INFO] Starte Server mit npx serve...
    start "" /B npx serve -p 8000
    timeout /t 2 /nobreak >nul
    start http://localhost:8000/website/index.html

    echo.
    echo [ERFOLG] Server läuft auf http://localhost:8000
    echo Du kannst dieses Fenster jetzt schließen.
    echo.
    timeout /t 3 >nul
    exit /b
)

:: ============================================
:: Kein Python und kein Node.js gefunden
:: ============================================
echo [FEHLER] Weder Python noch Node.js wurden gefunden!
echo.
echo Bitte installiere eines der beiden Programme:
echo.
echo   Python: https://www.python.org/downloads/
echo           ^(Wichtig: "Add Python to PATH" anhaken!^)
echo.
echo   Node.js: https://nodejs.org/
echo.
echo Nach der Installation diese Datei erneut starten.
echo.
pause
exit /b
