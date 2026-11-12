#!/usr/bin/env bash
# collect.sh <B1..B8> [--zip]
# Loest die Symlinks eines Batches in echte Dateien auf (kein veralteter Stand).
set -euo pipefail
BID="${1:?Batch angeben, z.B. B2}"
ZIP="${2:-}"
SRC="/home/moritz/repos/DIN-BriefNEO/batches/${BID}"
ZIEL="/tmp/din-review/${BID}"

[ -d "$SRC" ] || { echo "Batch $BID existiert nicht"; exit 2; }
rm -rf "$ZIEL"; mkdir -p "$ZIEL"
cp -L "$SRC"/* "$ZIEL"/ 2>/dev/null || true
echo "bereit: $ZIEL"
ls -1 "$ZIEL"

if [ "$ZIP" = "--zip" ]; then
  ( cd /tmp/din-review && zip -qr "${BID}.zip" "$BID" )
  echo "zip: /tmp/din-review/${BID}.zip"
fi
