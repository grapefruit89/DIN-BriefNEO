@echo off



title DIN-BriefNEO - Server starten

echo.
echo ============================================
echo   DIN-BriefNEO wird gestartet...
echo ============================================
echo.

cd /d "%~dp0\website"

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
:: Erstelle temporäres Python-Skript fur No-Cache Server
echo import http.server, socketserver > "%TEMP%\no_cache_server.py"
echo class NoCacheHandler(http.server.SimpleHTTPRequestHandler): >> "%TEMP%\no_cache_server.py"
echo     def end_headers(self): >> "%TEMP%\no_cache_server.py"
echo         self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0') >> "%TEMP%\no_cache_server.py"
echo         self.send_header('Pragma', 'no-cache') >> "%TEMP%\no_cache_server.py"
echo         self.send_header('Expires', '0') >> "%TEMP%\no_cache_server.py"
echo         super().end_headers() >> "%TEMP%\no_cache_server.py"
echo socketserver.TCPServer(("", 8088), NoCacheHandler).serve_forever() >> "%TEMP%\no_cache_server.py"

start "" /B python "%TEMP%\no_cache_server.py"
ping 127.0.0.1 -n 2 >nul
goto open_browser

:run_node
echo [INFO] Python nicht gefunden. Versuche Node.js Fallback...
echo [INFO] Starte Server mit npx serve...
start "" /B npx serve -p 8088
ping 127.0.0.1 -n 3 >nul
goto open_browser

:open_browser
:: Öffne im Standard-Browser
start "" "http://localhost:8088/index.html?nocache=%RANDOM%"

echo.
echo [ERFOLG] Server läuft auf http://localhost:8088
echo [INFO] Caching wurde deaktiviert!
echo Du kannst dieses Fenster jetzt schließen.
echo.
ping 127.0.0.1 -n 4 >nul
exit /b
