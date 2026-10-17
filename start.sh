#!/usr/bin/env bash
# ==============================================================================
# DIN-BriefNEO — Lokaler Start-Server für Linux
# ==============================================================================
# Startet einen Zero-Dependency Python-Webserver auf Port 8088 und öffnet
# die Anwendung im Standard-Browser.
# ==============================================================================

set -euo pipefail

# Ins Repo-Wurzelverzeichnis wechseln
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

PORT=8088
URL="http://localhost:${PORT}/"

echo "============================================"
echo "  DIN-BriefNEO wird gestartet..."
echo "============================================"

# 1. Prüfe, ob Python 3 vorhanden ist
if ! command -v python3 >/dev/null 2>&1; then
    echo "Fehler: python3 wurde nicht gefunden. Bitte Python 3 installieren." >&2
    exit 1
fi

# 2. Beende evtl. alte Prozesse auf Port 8088
if command -v fuser >/dev/null 2>&1; then
    fuser -k "${PORT}/tcp" >/dev/null 2>&1 || true
elif command -v lsof >/dev/null 2>&1; then
    PID=$(lsof -ti tcp:${PORT} || true)
    if [ -n "$PID" ]; then
        kill -9 $PID >/dev/null 2>&1 || true
    fi
fi

# 3. Starte HTTP-Server im Hintergrund (website/ als Document Root)
echo "[OK] Starte Webserver auf Port ${PORT}..."
python3 -m http.server "$PORT" --directory website >/dev/null 2>&1 &
SERVER_PID=$!

# Kurze Pause für den Socket-Aufbau
sleep 0.5

# 4. Browser öffnen
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 &
elif command -v google-chrome >/dev/null 2>&1; then
    google-chrome "$URL" >/dev/null 2>&1 &
elif command -v firefox >/dev/null 2>&1; then
    firefox "$URL" >/dev/null 2>&1 &
fi

echo "[ERFOLG] DIN-BriefNEO läuft unter ${URL} (PID ${SERVER_PID})"
echo "Drücke Ctrl+C oder schließe dieses Fenster, um den Server zu beenden."

# 5. Sauber aufräumen bei Beendigung
cleanup() {
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    exit 0
}
trap cleanup INT TERM EXIT

wait "$SERVER_PID"
