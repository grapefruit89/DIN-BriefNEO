#!/usr/bin/env bash
set -euo pipefail

DIN_HOME="${DIN_BRIEFNEO_HOME:-$HOME/.din-briefneo}"

echo "=== DIN-BriefNEO Home Setup ==="
echo "Zielverzeichnis: $DIN_HOME"

mkdir -p "$DIN_HOME"/{build,cache,node_modules,research-raw}

if [ ! -x "$DIN_HOME/node_modules/.bin/tsc" ]; then
    echo "Installiere TypeScript in $DIN_HOME..."
    npm install --prefix "$DIN_HOME" --no-fund --no-audit typescript
else
    echo "TypeScript ist bereits in $DIN_HOME installiert."
fi

echo "Setup erfolgreich abgeschlossen."
