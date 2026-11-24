#!/usr/bin/env bash
# din-dev — Dev-Server + Debug-Browser für DIN-BriefNEO in einem Aufruf.
#
# Warum: der Agent braucht einen Browser MIT `--remote-debugging-port`, sonst
# kann er nichts nachmessen; und ein alter Server auf Port 8088 liefert sonst
# weiter den Stand von vorgestern. Beides wird hier deterministisch neu gebaut.
#
#   din-dev                alles neu: alte Instanzen weg, Server an, Debug-Browser an
#   din-dev --vanilla      wie oben, aber vorher Logs und Dev-Caches leeren
#   din-dev --stop         nur stoppen (Server, Live-Kanal, Debug-Browser)
#   din-dev --status       Status zeigen (Ports, Prozesse, Tabs)
#   din-dev live           MCP-Live-Kanal im Vordergrund (tools/mcp-live.mjs)
#
# Absichtlich NICHT angefasst: der normale Helium des Nutzers (Arbeitsprofil
# `~/.config/net.imput.helium`, Debug 9223). Es sterben nur Prozesse mit
# UNSEREN Debug-Profilen und unsere eigenen Dev-Server.

set -u

# Repo dynamisch: funktioniert aus jedem Checkout, ohne Pfadpflege.
REPO="${DIN_DEV_REPO:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
PORT="${DIN_DEV_PORT:-8088}"
CDP="${DIN_DEV_CDP:-9222}"
LIVE_PORT="${DIN_DEV_LIVE_PORT:-8765}"
# Bewusst das LLM-Profil: darauf zeigt der chrome-devtools-MCP
# (--browserUrl http://127.0.0.1:9222). So koennen MCP und dieses Skript
# denselben Browser benutzen, statt zwei Profile zu pflegen.
PROFIL="${DIN_DEV_PROFILE:-$HOME/.config/net.imput.helium-llm}"
# Profile früherer Fassungen (tools/start.sh und dev.sh v1). Sie halten sonst
# Port 9222 und der neue Browser kann nicht binden (gemessen 2026-11-12).
PROFILE_ALT=(
  "$HOME/.local/share/din-briefneo/debug-profil"
  "$HOME/.local/share/helium-din-briefneo"
)
LOG_DIR="${DIN_DEV_LOG_DIR:-/tmp/din-dev}"
SERVER_LOG="$LOG_DIR/server.log"
BROWSER_LOG="$LOG_DIR/browser.log"
URL="http://127.0.0.1:${PORT}/index.html"

mkdir -p "$LOG_DIR" "$PROFIL"

# Desktop-Umgebung, damit der Browser ein Fenster bekommt (Agent laeuft ohne TTY)
export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/run/user/1000}"
export DBUS_SESSION_BUS_ADDRESS="${DBUS_SESSION_BUS_ADDRESS:-unix:path=/run/user/1000/bus}"
export DISPLAY="${DISPLAY:-:0}"
export WAYLAND_DISPLAY="${WAYLAND_DISPLAY:-wayland-0}"

port_offen() { ss -ltn 2>/dev/null | grep -qE "[:.]$1[[:space:]]"; }

port_halter() {
  ss -ltnp 2>/dev/null | grep -E "[:.]$1[[:space:]]" | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2
}

# Liest die Argumentliste eines Prozesses NUL-sicher in einen benannten Array.
# Wichtig: nur so unterscheidet sich ein echter `node tools/serve.mjs` von einem
# Agenten-/Shell-Aufruf, der den Dateinamen bloß im Prompt-Text traegt.
argv_von() {
  local -n _argv="$1"
  local _arg
  _argv=()
  [ -r "/proc/$2/cmdline" ] || return 1
  while IFS= read -r -d '' _arg; do _argv+=("$_arg"); done < "/proc/$2/cmdline" 2>/dev/null
  [ "${#_argv[@]}" -gt 0 ]
}

alle_pids() {
  local d
  for d in /proc/[0-9]*; do
    [ "${d#/proc/}" = "$$" ] && continue
    # /proc/<pid>/cmdline meldet in stat size 0 — deshalb -r statt -s.
    [ -r "$d/cmdline" ] && printf '%s\n' "${d#/proc/}"
  done
}

# Dev-Server dieses Repos: node auf einem bekannten Skript, python http.server
# auf unserem Port bzw. im Repo-Pfad. Alles andere bleibt unangetastet.
ist_dev_server() {
  local pid="$1" arg basis
  local -a argv=()
  argv_von argv "$pid" || return 1
  basis="${argv[0]##*/}"
  case "$basis" in
    node|nodejs|python|python3|python3.*) ;;
    *) return 1 ;;
  esac
  for arg in "${argv[@]:1}"; do
    case "$arg" in
      */tools/serve.mjs|tools/serve.mjs) return 0 ;;
      */tools/static-server.mjs|tools/static-server.mjs) return 0 ;;
      */tools/mcp-live.mjs|tools/mcp-live.mjs) return 0 ;;
    esac
  done
  for arg in "${argv[@]:1}"; do
    case "$arg" in
      http.server)
        for arg in "${argv[@]:1}"; do
          [ "$arg" = "$PORT" ] && return 0
          case "$arg" in "$REPO"/*) return 0 ;; esac
        done
        return 1
        ;;
    esac
  done
  return 1
}

# Debug-Browser mit einem UNSERER Profile. Chromium ueberschreibt seine
# /proc/<pid>/cmdline mit EINEM space-getrennten String — argv-Vergleich wuerde
# nie treffen. Deshalb Textvergleich mit Pfadgrenze, damit das Arbeitsprofil
# `~/.config/net.imput.helium` nicht per Prefix mitgetroffen wird.
ist_unser_browser() {
  local pid="$1" p text
  [ -r "/proc/$pid/cmdline" ] || return 1
  text=$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null) || return 1
  [ -n "$text" ] || return 1
  case "$text" in
    *helium*|*chromium*|*chrome*|*msedge*) ;;
    *) return 1 ;;
  esac
  for p in "$PROFIL" "${PROFILE_ALT[@]}"; do
    case "$text" in
      *"--user-data-dir=$p "*) return 0 ;;
      *"--user-data-dir=$p") return 0 ;;
    esac
  done
  return 1
}

ist_browser_kind() {
  [ -r "/proc/$1/cmdline" ] || return 1
  tr '\0' ' ' < "/proc/$1/cmdline" 2>/dev/null | grep -q -- "--type="
}

pids_dev_server() {
  local pid
  for pid in $(alle_pids); do
    ist_dev_server "$pid" && printf '%s\n' "$pid"
  done
}

pids_unser_browser() {
  local pid
  for pid in $(alle_pids); do
    ist_unser_browser "$pid" && printf '%s\n' "$pid"
  done
}

# Erst TERM, kurz warten, dann KILL. 1 s Deckel — Start bleibt zackig.
beende_pids() {
  local p i
  local -a rest=() ziele=("$@")
  [ "${#ziele[@]}" -eq 0 ] && return 0
  for p in "${ziele[@]}"; do
    kill "$p" 2>/dev/null && echo "  beendet: PID $p"
  done
  for i in $(seq 1 10); do
    rest=()
    for p in "${ziele[@]}"; do kill -0 "$p" 2>/dev/null && rest+=("$p"); done
    [ "${#rest[@]}" -eq 0 ] && return 0
    sleep 0.1
  done
  for p in "${rest[@]}"; do
    kill -9 "$p" 2>/dev/null && echo "  hart beendet: PID $p"
  done
}

warte_port() {
  local port="$1" was="$2"
  for _ in $(seq 1 60); do
    if [ "$was" = "auf" ]; then port_offen "$port" || return 0; else port_offen "$port" && return 0; fi
    sleep 0.1
  done
  return 1
}

cmdline_kurz() {
  local pid="$1"
  [ -r "/proc/$pid/cmdline" ] || { echo "?"; return 0; }
  tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null | cut -c1-80
}

# Port freimachen: nur bekannte Dev-Server und unsere Debug-Browser werden
# beendet. Fremde Halter (z. B. der Arbeits-Browser) bleiben stehen — dann
# bricht der Start mit einer klaren Meldung ab, statt fremde Tabs zu schliessen.
freie_port() {
  local port="$1" pid
  port_offen "$port" || return 0
  pid=$(port_halter "$port")
  if [ -z "${pid:-}" ]; then
    echo "  WARNUNG: Port $port belegt, Halter nicht feststellbar"
    return 1
  fi
  if ist_dev_server "$pid" || ist_unser_browser "$pid"; then
    beende_pids "$pid"
    warte_port "$port" auf >/dev/null 2>&1
    port_offen "$port" || return 0
  fi
  echo "  WARNUNG: Port $port gehoert PID $pid ($(cmdline_kurz "$pid")) — nicht angefasst"
  return 1
}

stoppe() {
  local pid
  local -a haupt=() kinder=()

  # 1) Browser: erst der Hauptprozess (Kinder tragen --type=..., der Vater nicht;
  #    einzelne Kinder zu killen laesst den Vater sie neu starten).
  for pid in $(pids_unser_browser); do
    if ist_browser_kind "$pid"; then kinder+=("$pid"); else haupt+=("$pid"); fi
  done
  if [ "${#haupt[@]}" -gt 0 ]; then
    echo "  Debug-Browser:"
    beende_pids "${haupt[@]}"
  fi
  if [ "${#kinder[@]}" -gt 0 ]; then
    beende_pids "${kinder[@]}" >/dev/null
  fi
  warte_port "$CDP" auf >/dev/null 2>&1

  # 2) Server + Live-Kanal (serve.mjs, static-server.mjs, mcp-live.mjs,
  #    python http.server auf 8088/in diesem Repo).
  local -a server=()
  for pid in $(pids_dev_server); do server+=("$pid"); done
  if [ "${#server[@]}" -gt 0 ]; then
    echo "  Dev-Server / Live-Kanal:"
    beende_pids "${server[@]}"
  fi
  warte_port "$PORT" auf >/dev/null 2>&1
  warte_port "$LIVE_PORT" auf >/dev/null 2>&1

  # 3) Reste, die einen Port noch halten (z. B. Waisen nach SIGKILL).
  freie_port "$PORT" >/dev/null || true
  freie_port "$CDP" >/dev/null || true
}

# Logs dieses Werkzeugs + abgeleitete Dev-Caches. Kein Nutzerstand:
# Browser-Profil (Logins), Entwuerfe und Medien bleiben unberuehrt.
vanilla() {
  local cache
  echo "Vanilla: Logs und temporäre Dev-Caches"
  find "$LOG_DIR" -maxdepth 1 -name '*.log' -delete 2>/dev/null
  rm -f /tmp/din-server.log /tmp/opencode/din-dev-server.log /tmp/opencode/din-dev-browser.log
  for cache in "$HOME/.din-briefneo/cache" "$HOME/.din-briefneo/feature-cache"; do
    [ -d "$cache" ] || continue
    find "$cache" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null
    echo "  geleert: $cache"
  done
  echo "  Logs: $LOG_DIR"
}

status() {
  local server="aus" cdp="aus" live="aus" pid pids_txt
  port_offen "$PORT" && server="an"
  port_offen "$CDP" && cdp="an"
  port_offen "$LIVE_PORT" && live="an"

  pids_txt=$(pids_dev_server | tr '\n' ' ' | sed 's/ $//')
  echo "Repo    : $REPO"
  echo "Server  : $server   http://127.0.0.1:$PORT   PID(s): ${pids_txt:-–}"
  echo "Debug   : $cdp   http://127.0.0.1:$CDP   Profil: $PROFIL"
  echo "Live    : $live   http://127.0.0.1:$LIVE_PORT (din-dev live)"
  echo "Logs    : $LOG_DIR"
  if [ "$cdp" = "an" ]; then
    curl -fsS "http://127.0.0.1:$CDP/json/list" 2>/dev/null \
      | tr -d '\n' | sed 's/}, {/}\n{/g' \
      | sed -n 's/.*"title": *"\([^"]*\)".*"url": *"\(http[^"]*\)".*/  \1 — \2/p' \
      | head -6
  fi
  for p in "${PROFILE_ALT[@]}"; do
    [ -e "$p" ] && echo "  Altprofil vorhanden (wird beim Start beendet): $p"
  done
}

hilfe() {
  cat <<'HILFE'
din-dev — Dev-Server + Debug-Browser für DIN-BriefNEO

  din-dev                 alles neu: alte Instanzen weg → Server → Debug-Browser
  din-dev --vanilla       wie oben, aber Logs + Dev-Caches vorher leeren
  din-dev stop            nur stoppen (Server, Live-Kanal, Debug-Browser)
  din-dev status          Ports, Prozesse und offene Tabs
  din-dev live [args…]    MCP-Live-Kanal im Vordergrund (tools/mcp-live.mjs)
                          z. B. din-dev live --check
  din-dev mess [id ...]   Messwerte des laufenden Tabs, eine Zeile JSON in mm
                          Beispiel: din-dev mess betreff unterschrift
  din-dev mess --print    dasselbe in Druck-Emulation (eigener headless-Browser)
  din-dev key [--port N]  Geoapify-Key aus ~/.secrets/geoapify in den Browser legen
  din-dev help            diese Hilfe

Was gestoppt wird (deterministisch, vor jedem Start):
  node tools/serve.mjs · static-server.mjs · mcp-live.mjs · python http.server
  auf 8088 bzw. im Repo-Pfad · Debug-Browser mit den Profilen
  ~/.config/net.imput.helium-llm, ~/.local/share/din-briefneo/debug-profil,
  ~/.local/share/helium-din-briefneo.
  Der Arbeits-Browser (~/.config/net.imput.helium, CDP 9223) bleibt unberührt.

Mess-Ergebnis:
  {"b":[297,null],"f":{"betreff":[86.2,5.9,1], ...}}
  b = [Blatthöhe_mm, data-ueberlauf] · f = { id: [y_mm, höhe_mm, sichtbar] }

Statt Bild (Token sparen): mess misst Geometrie numerisch. Ein Screenshot nur
bei echter Optik-Frage — dann elementscharf, nie fullPage.

Im Agenten-Chat (chrome-devtools-MCP, hängt an Port 9222):
  evaluate_script({ sourcePath: "/home/moritz/repos/DIN-BriefNEO/tools/mess.js",
                    format: "function", pageId: 1 })

Eigenes Profil: ~/.config/net.imput.helium-llm · Arbeitsprofil (9223) bleibt unberührt.
Logs: /tmp/din-dev (server.log, browser.log) · Repo wird aus dem Skriptpfad ermittelt
(Override: DIN_DEV_REPO, Ports: DIN_DEV_PORT/DIN_DEV_CDP)
HILFE
}

# Schalter unabhängig von der Position einsammeln: `din-dev --vanilla stop`
# wirkt wie `din-dev stop --vanilla`. `--vanilla` gehört zu start/stop;
# `status` und `help` bleiben reine Lesebefehle.
VANILLA=0
ARGS=()
for arg in "$@"; do
  case "$arg" in
    --vanilla|--clean|vanilla|clean) VANILLA=1 ;;
    *) ARGS+=("$arg") ;;
  esac
done
BEFEHL="${ARGS[0]:-start}"

case "$BEFEHL" in
  --stop|stop)
    echo "Stoppe (nur dieses Werkzeug):"
    stoppe
    [ "$VANILLA" -eq 1 ] && vanilla
    status
    exit 0
    ;;
  --status|status) status; exit 0 ;;
  --help|-h|help) hilfe; exit 0 ;;
  live|--live)
    cd "$REPO" || { echo "Repo fehlt: $REPO"; exit 1; }
    exec node tools/mcp-live.mjs "${ARGS[@]:1}"
    ;;
  --key|key)
    cd "$REPO" || { echo "Repo fehlt: $REPO"; exit 1; }
    node tools/seed-geoapify.mjs "${ARGS[@]:1}"
    exit $?
    ;;
  --mess|mess)
    cd "$REPO" || { echo "Repo fehlt: $REPO"; exit 1; }
    if [ "${ARGS[1]:-}" = "--print" ]; then
      node tools/mess-print.mjs "${ARGS[@]:2}"
    else
      node tools/mess.mjs "${ARGS[@]:1}"
    fi
    exit $?
    ;;
  ""|--start|start) ;;
  *) echo "Unbekannt: $BEFEHL"; echo; hilfe; exit 2 ;;
esac

[ "$VANILLA" -eq 1 ] && vanilla

echo "[0/3] Alte Instanzen"
stoppe

echo "[1/3] Dev-Server"
cd "$REPO" || { echo "Repo fehlt: $REPO"; exit 1; }
nohup node tools/serve.mjs website "$PORT" >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!
if ! warte_port "$PORT" an; then
  echo "  FEHLER: Port $PORT antwortet nicht. Log: $SERVER_LOG"; tail -5 "$SERVER_LOG"; exit 1
fi
echo "  PID $SERVER_PID auf http://127.0.0.1:$PORT (no-cache)"

echo "[2/3] Debug-Browser"
if ! freie_port "$CDP"; then
  echo "  FEHLER: Debug-Port $CDP bleibt belegt — fremder Halter (Arbeits-Browser?). Siehe din-dev help."
  kill "$SERVER_PID" 2>/dev/null
  exit 1
fi
HAUPT=$(pids_unser_browser | head -1)
if [ -n "$HAUPT" ]; then
  echo "  alter Browser haengt noch — hart beendet (PID $HAUPT)"
  # shellcheck disable=SC2046 # Wortliste: ein PID je Zeile
  beende_pids $(pids_unser_browser) >/dev/null
  sleep 0.2
fi
# helium-llm setzt Profil + Debug-Port 9222 selbst (siehe ~/.local/bin/helium-llm)
nohup helium-llm "$URL" >"$BROWSER_LOG" 2>&1 &
if ! warte_port "$CDP" an; then
  echo "  FEHLER: Debug-Port $CDP antwortet nicht. Log: $BROWSER_LOG"; tail -5 "$BROWSER_LOG"; exit 1
fi

echo "[3/3] Tab + Key"
# Tab-Polling: 50 × 0,1 s = max. 5 s, im Normalfall < 1 s.
TAB=""
for _ in $(seq 1 50); do
  TAB=$(curl -fsS "http://127.0.0.1:$CDP/json/list" 2>/dev/null | grep -o '"url": *"[^"]*index.html[^"]*"' | head -1)
  [ -n "$TAB" ] && break
  sleep 0.1
done
echo "  CDP auf http://127.0.0.1:$CDP"

# Geoapify-Key aus ~/.secrets/geoapify in den localStorage legen (nie im Repo).
node "$REPO/tools/seed-geoapify.mjs" --port "$CDP"

[ -n "$TAB" ] && echo "  Tab: $URL" || echo "  Tab noch nicht gemeldet — Log: $BROWSER_LOG"

echo
status
echo
echo "Stoppen: din-dev --stop"
