@echo off

:: Self-Minimize Trick: Startet das Skript sofort minimiert neu, falls nicht schon minimiert
if not "%MINIMIZED%"=="1" (
    set MINIMIZED=1
    start /min cmd /c "%~f0" %*
    exit /b
)

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
if not errorlevel 1 goto run_python

:: ============================================
:: 2. Versuch: Node.js (npx serve) als Fallback
:: ============================================
where node >nul 2>nul
if not errorlevel 1 goto run_node

:: ============================================
:: Kein Python und kein Node.js gefunden
:: ============================================
echo [FEHLER] Weder Python noch Node.js wurden gefunden!
echo.
echo Bitte installiere eines der beiden Programme:
echo.
echo   Python: https://www.python.org/downloads/
echo           (Wichtig: "Add Python to PATH" anhaken!)
echo.
echo   Node.js: https://nodejs.org/
echo.
echo Nach der Installation diese Datei erneut starten.
echo.
pause
exit /b

:run_python
echo [OK] Python gefunden. Starte Server mit Python...
start "" /B python -m http.server 8000
:: Nutze ping als robusten Timeout
ping 127.0.0.1 -n 2 >nul
start http://localhost:8000/website/index.html

echo.
echo [ERFOLG] Server läuft auf http://localhost:8000
echo Du kannst dieses Fenster jetzt schließen.
echo.
ping 127.0.0.1 -n 4 >nul
exit /b

:run_node
echo [INFO] Python nicht gefunden. Versuche Node.js Fallback...
echo [INFO] Starte Server mit npx serve...
start "" /B npx serve -p 8000
ping 127.0.0.1 -n 3 >nul
start http://localhost:8000/website/index.html

echo.
echo [ERFOLG] Server läuft auf http://localhost:8000
echo Du kannst dieses Fenster jetzt schließen.
echo.
ping 127.0.0.1 -n 4 >nul
exit /b
