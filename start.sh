#!/usr/bin/env bash
# ==============================================================================
# DIN-BriefNEO — Lokaler Start-Server für Linux
# ==============================================================================
# Startet einen Zero-Dependency Python-Webserver auf Port 8088 und öffnet die
# Anwendung in Helium MIT DevTools-Protokoll (CDP auf Port 9222).
#
# Warum ein eigenes Profil: Läuft Helium bereits, öffnet ein neuer Aufruf nur
# einen Tab im bestehenden Prozess — der CDP-Port entsteht dann NICHT. Mit
# eigenem user-data-dir ist der Port garantiert, und die Tabs des Nutzers
# bleiben unberührt (kein Tab wird geschlossen).
#
# Helium deaktiviert die HTTP-Discovery (/json -> 404). Die WebSocket-Adresse
# steht in $PROFILE/DevToolsActivePort: Zeile 1 = Port, Zeile 2 = Pfad.
#
# Sicherheit: --remote-debugging-address wird NICHT gesetzt. Standard ist
# 127.0.0.1; 0.0.0.0 würde den Debug-Port im Netz öffnen (RCE-Risiko).
# ==============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

PORT_HTTP=8088
PORT_CDP=9222
PROFILE="$HOME/.local/share/helium-din-briefneo"
URL="http://127.0.0.1:${PORT_HTTP}"

# 1. Alte Prozesse auf dem HTTP-Port beenden
if command -v fuser >/dev/null 2>&1; then
    fuser -k "${PORT_HTTP}/tcp" >/dev/null 2>&1 || true
elif command -v lsof >/dev/null 2>&1; then
    OLD_PID=$(lsof -ti tcp:"${PORT_HTTP}" || true)
    if [ -n "${OLD_PID}" ]; then
        kill -9 ${OLD_PID} >/dev/null 2>&1 || true
    fi
fi

# 2. HTTP-Server starten (website/ als Document Root)
python3 -m http.server "$PORT_HTTP" --directory website > /tmp/din-server.log 2>&1 &
SERVER_PID=$!
echo "[OK] Server: ${URL}/ (PID ${SERVER_PID})"

cleanup() {
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    echo "[OK] Server beendet."
}
trap cleanup INT TERM EXIT

# 3. Helium mit CDP öffnen (sichtbar, eigenes Profil)
if [ -x /home/moritz/.local/bin/helium ]; then
    export XDG_RUNTIME_DIR=/run/user/1000
    export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/1000/bus"
    export DISPLAY=:0
    export WAYLAND_DISPLAY=wayland-0
    mkdir -p "$PROFILE"
    setsid /home/moritz/.local/bin/helium \
        --remote-debugging-port="${PORT_CDP}" \
        --user-data-dir="$PROFILE" \
        "${URL}/index.html" >/dev/null 2>&1 &
    echo "[OK] Helium mit CDP auf Port ${PORT_CDP} (Profil: ${PROFILE})"
else
    echo "[WARN] Helium nicht gefunden — bitte manuell öffnen: ${URL}/index.html"
fi

# 4. Auf DevToolsActivePort warten und WebSocket-Adresse nennen
for _ in $(seq 1 40); do
    if [ -f "$PROFILE/DevToolsActivePort" ]; then
        break
    fi
    sleep 0.25
done

if [ -f "$PROFILE/DevToolsActivePort" ]; then
    WS_PATH=$(sed -n '2p' "$PROFILE/DevToolsActivePort")
    echo "[OK] CDP: ws://127.0.0.1:${PORT_CDP}${WS_PATH}"
else
    echo "[WARN] DevToolsActivePort fehlt — CDP vermutlich nicht aktiv."
fi

echo "[INFO] Agent kann die Konsole per CDP lesen. Beenden mit Ctrl+C."
wait "$SERVER_PID"
