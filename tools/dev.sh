#!/usr/bin/env bash
# din-dev — Dev-Server + Debug-Browser für DIN-BriefNEO in einem Aufruf.
#
# Warum: der Agent braucht einen Browser MIT `--remote-debugging-port`, sonst
# kann er nichts nachmessen; und ein alter Server auf Port 8088 liefert sonst
# weiter den Stand von vorgestern. Beides wird hier deterministisch neu gebaut.
#
#   din-dev            alles neu: alte Instanzen weg, Server an, Debug-Browser an
#   din-dev --stop     nur stoppen (Server + Debug-Browser dieses Werkzeugs)
#   din-dev --status   Status zeigen (Ports, Tabs)
#
# Absichtlich NICHT angefasst: der normale Helium/Browser des Nutzers mit
# seinem Alltagsprofil. Es sterben nur Prozesse mit UNSEREM Debug-Profil und
# unsere eigenen serve.mjs-Instanzen.

set -u

REPO="/home/moritz/repos/DIN-BriefNEO"
PORT="${DIN_DEV_PORT:-8088}"
CDP="${DIN_DEV_CDP:-9222}"
# Bewusst das LLM-Profil: darauf zeigt der chrome-devtools-MCP
# (--browserUrl http://127.0.0.1:9222). So koennen MCP und dieses Skript
# denselben Browser benutzen, statt zwei Profile zu pflegen.
PROFIL="${DIN_DEV_PROFILE:-$HOME/.config/net.imput.helium-llm}"
SERVER_LOG="/tmp/opencode/din-dev-server.log"
BROWSER_LOG="/tmp/opencode/din-dev-browser.log"
URL="http://127.0.0.1:${PORT}/index.html"

mkdir -p /tmp/opencode "$PROFIL"

# Desktop-Umgebung, damit der Browser ein Fenster bekommt (Agent laeuft ohne TTY)
export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/run/user/1000}"
export DBUS_SESSION_BUS_ADDRESS="${DBUS_SESSION_BUS_ADDRESS:-unix:path=/run/user/1000/bus}"
export DISPLAY="${DISPLAY:-:0}"
export WAYLAND_DISPLAY="${WAYLAND_DISPLAY:-wayland-0}"

pids() { ps -eo pid,args | grep -F -- "$1" | grep -v grep | awk '{print $1}'; }
# Nur der Hauptprozess des Browsers: Kinder tragen --type=..., der Vater nicht.
# Einzelne Kinder zu killen laesst den Vater sie neu starten (gemessen 2026-11-12).
browser_haupt() {
  ps -eo pid,args | grep -F -- "user-data-dir=$PROFIL" | grep -v -- "--type=" | grep -v grep \
    | awk '{print $1}' | head -1
}
port_offen() { ss -ltn 2>/dev/null | grep -qE "[:.]$1[[:space:]]"; }
warte_port() {
  local port="$1" was="$2" i
  for i in $(seq 1 60); do
    if [ "$was" = "auf" ]; then port_offen "$port" || return 0; else port_offen "$port" && return 0; fi
    sleep 0.2
  done
  return 1
}

stoppe() {
  local p haupt
  haupt=$(browser_haupt)
  if [ -n "$haupt" ]; then
    kill "$haupt" 2>/dev/null && echo "  Browser beendet (PID $haupt)"
    warte_port "$CDP" auf >/dev/null 2>&1
  fi
  if port_offen "$CDP"; then
    echo "  Browser reagiert nicht — hart beendet"
    kill -9 "$haupt" 2>/dev/null
    for p in $(pids "user-data-dir=$PROFIL"); do kill -9 "$p" 2>/dev/null; done
    warte_port "$CDP" auf >/dev/null 2>&1
  fi
  for p in $(pids "tools/serve.mjs"); do
    kill "$p" 2>/dev/null && echo "  Dev-Server beendet (PID $p)"
  done
  warte_port "$PORT" auf >/dev/null 2>&1
}

status() {
  local server="aus" cdp="aus"
  port_offen "$PORT" && server="an"
  port_offen "$CDP" && cdp="an"
  echo "Server  : $server   http://127.0.0.1:$PORT"
  echo "Debug   : $cdp   http://127.0.0.1:$CDP"
  if [ "$cdp" = "an" ]; then
    curl -fsS "http://127.0.0.1:$CDP/json/list" 2>/dev/null \
      | grep -E '"(url|title)"' | paste - - | sed 's/^/  /' | head -8
  fi
}

case "${1:-}" in
  --stop)   echo "Stoppe (nur dieses Werkzeug):"; stoppe; status; exit 0 ;;
  --status) status; exit 0 ;;
  ""|--start) ;;
  *) echo "Unbekannt: $1 (erlaubt: --stop, --status)"; exit 2 ;;
esac

echo "[0/2] Alte Instanzen"
stoppe

echo "[1/2] Dev-Server"
cd "$REPO" || { echo "Repo fehlt: $REPO"; exit 1; }
nohup node tools/serve.mjs website "$PORT" >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!
if ! warte_port "$PORT" an; then
  echo "  FEHLER: Port $PORT antwortet nicht. Log: $SERVER_LOG"; tail -5 "$SERVER_LOG"; exit 1
fi
echo "  PID $SERVER_PID auf http://127.0.0.1:$PORT (no-cache)"

echo "[2/2] Debug-Browser"
HAUPT=$(browser_haupt)
if [ -n "$HAUPT" ]; then
  echo "  alter Browser haengt noch — hart beendet (PID $HAUPT)"
  kill -9 "$HAUPT" 2>/dev/null
  for p in $(pids "user-data-dir=$PROFIL"); do kill -9 "$p" 2>/dev/null; done
  sleep 0.6
fi
# helium-llm setzt Profil + Debug-Port 9222 selbst (siehe ~/.local/bin/helium-llm)
nohup helium-llm "$URL" >"$BROWSER_LOG" 2>&1 &
if ! warte_port "$CDP" an; then
  echo "  FEHLER: Debug-Port $CDP antwortet nicht. Log: $BROWSER_LOG"; tail -5 "$BROWSER_LOG"; exit 1
fi
# Tab kurz warten und melden
for i in $(seq 1 40); do
  TAB=$(curl -fsS "http://127.0.0.1:$CDP/json/list" 2>/dev/null | grep -o '"url": *"[^"]*index.html[^"]*"' | head -1)
  [ -n "$TAB" ] && break
  sleep 0.25
done
echo "  CDP auf http://127.0.0.1:$CDP"
[ -n "${TAB:-}" ] && echo "  Tab: $URL" || echo "  Tab noch nicht gemeldet — Log: $BROWSER_LOG"

echo
status
echo
echo "Stoppen: din-dev --stop"
