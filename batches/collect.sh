#!/usr/bin/env bash
# collect.sh <B1..B8> [--zip]
#
# Loest die Symlinks eines Batches in echte Dateien auf und gibt einen
# Fingerabdruck aus. Der ZIP-Name traegt Commit und Zeitpunkt — ein veralteter
# Anhang ist damit am Dateinamen erkennbar, bevor er im Chat landet.
#
# Anlass (2026-11-12): zwei Review-Laeufe bekamen eine 53-KiB-Fassung von
# B2-merged.txt ohne main.js und ohne KONTRAKT.md, obwohl im Repo 86 KiB mit
# acht Bloecken lagen. Der Inhalt war richtig, der Versand veraltet.
set -euo pipefail

BID="${1:?Batch angeben, z.B. B2}"
ZIP="${2:-}"
REPO="/home/moritz/repos/DIN-BriefNEO"
SRC="$REPO/batches/${BID}"
ZIEL="/tmp/din-review/${BID}"
MERGED="$SRC/${BID}-merged.txt"

[ -d "$SRC" ] || { echo "Batch $BID existiert nicht" >&2; exit 2; }

COMMIT="$(git -C "$REPO" rev-parse --short HEAD)"
BLOCKS="$(grep -c '^===== ' "$MERGED" 2>/dev/null || echo 0)"

rm -rf "$ZIEL"
mkdir -p "$ZIEL"
# Bewusst ohne 2>/dev/null: ein kaputter Symlink soll auffallen, nicht
# stillschweigend einen unvollstaendigen Batch erzeugen.
cp -L "$SRC"/* "$ZIEL"/

echo "bereit: $ZIEL"
ls -1 "$ZIEL"

echo
echo "Fingerabdruck von ${BID}-merged.txt"
echo "  Commit : $COMMIT"
echo "  Bloecke: $BLOCKS   (Quelldateien im Snapshot)"
echo "  Bytes  : $(stat -c%s "$MERGED")"
echo "  SHA256 : $(sha256sum "$MERGED" | cut -d' ' -f1)"

if [ "$ZIP" = "--zip" ]; then
  STAMP="$(date +%Y%m%d-%H%M)"
  NAME="${BID}-${COMMIT}-${STAMP}.zip"
  ( cd /tmp/din-review && zip -qr "$NAME" "$BID" )
  echo
  echo "zip: /tmp/din-review/$NAME"
  echo "     $(stat -c%s "/tmp/din-review/$NAME") Bytes"
  echo "     SHA256 $(sha256sum "/tmp/din-review/$NAME" | cut -d' ' -f1)"
fi
