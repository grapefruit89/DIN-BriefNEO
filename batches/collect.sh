#!/usr/bin/env bash
# collect.sh <B1..B8>
#
# Loest die Symlinks eines Batches in echte Dateien auf und gibt den
# Fingerabdruck der Merge-Datei aus. Anhaenge an den Chat sind reine .txt —
# kein ZIP.
#
# Anlass (2026-11-12): zwei Review-Laeufe bekamen eine veraltete
# B2-merged.txt (53 KiB, fuenf Bloecke, ohne main.js). Deshalb traegt die
# Merge-Datei den Commit im Namen, und dieses Skript druckt Commit, Blockzahl,
# Bytes und SHA256, damit der Anhang vor dem Senden pruefbar ist.
set -euo pipefail

BID="${1:?Batch angeben, z.B. B3}"
REPO="/home/moritz/repos/DIN-BriefNEO"
SRC="$REPO/batches/${BID}"
ZIEL="/tmp/din-review/${BID}"

[ -d "$SRC" ] || { echo "Batch $BID existiert nicht" >&2; exit 2; }

MERGED="$(ls -1 "$SRC"/${BID}-merged-*.txt 2>/dev/null | tail -1 || true)"
[ -n "$MERGED" ] || { echo "keine Merge-Datei in $SRC (python3 batches/merge.py $BID)" >&2; exit 2; }

rm -rf "$ZIEL"
mkdir -p "$ZIEL"
# Bewusst ohne 2>/dev/null: ein kaputter Symlink soll auffallen, statt
# stillschweigend einen unvollstaendigen Batch zu erzeugen.
cp -L "$SRC"/* "$ZIEL"/ 2>/dev/null || cp -L "$SRC"/* "$ZIEL"/

echo "bereit: $ZIEL"
ls -1 "$ZIEL"

echo
echo "Fingerabdruck (das ist der Anhang, den der Chat bekommt)"
echo "  Datei  : $(basename "$MERGED")"
echo "  Bloecke: $(grep -c '^===== ' "$MERGED")"
echo "  Bytes  : $(stat -c%s "$MERGED")"
echo "  SHA256 : $(sha256sum "$MERGED" | cut -d' ' -f1)"
