#!/usr/bin/env python3
"""
tools/subset_fonts.py — DIN 5008 Font-Subsetting & WOFF2-Optimierung

Dampft TTF/OTF-Dateien aus Fonts/ mit dem lückenlosen DIN-5008-Zeichensatz
(Anhang H/F: Latein, Umlaute, ẞ, Sonderzeichen, tnum, Maße, Haken, Brüche)
in extrem kompakte .woff2-Dateien nach website/fonts/ ein.
"""

import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SRC_DIR = BASE_DIR / "Fonts"
DEST_DIR = BASE_DIR / "website" / "fonts"

DEST_DIR.mkdir(parents=True, exist_ok=True)

# Lückenloser DIN-5008-Zeichensatz (Anhang H/F):
# Basic Latin, Latin-1 Supplement (ä, ö, ü, ß, §, ®, ©), OE/oe, großes ẞ,
# Typografische Striche/Quotes/Bullets, Schmal-Leerzeichen (U+202F), Euro,
# Brüche, Promille, Mathe (≤, ≥, ≈, −, ±, ×, ·), Durchmesser (⌀), Haken (✓, ✗), Winkelklammern
UNICODES = (
    "U+0020-007E,"
    "U+00A0-00FF,"
    "U+0152-0153,"
    "U+1E9E,"
    "U+2010-2027,"
    "U+202F-2044,"
    "U+20AC,"
    "U+2116,"
    "U+2212,"
    "U+2248,"
    "U+2264-2265,"
    "U+2300,"
    "U+2713-2718,"
    "U+27E8-27E9"
)

FEATURES = "kern,liga,calt,tnum"

def main():
    if not SRC_DIR.exists():
        print(f"Quellordner fehlt: {SRC_DIR}")
        sys.exit(1)

    fonts = sorted(SRC_DIR.glob("*.[to]tf"))
    if not fonts:
        print(f"Keine TTF/OTF-Schriften in {SRC_DIR} gefunden.")
        sys.exit(1)

    print(f"Starte DIN-5008 Subsetting für {len(fonts)} Schriften nach {DEST_DIR}...\n")
    for font_path in fonts:
        out_name = f"{font_path.stem.lower().replace(' ', '-')}.woff2"
        out_path = DEST_DIR / out_name

        cmd = [
            sys.executable, "-m", "fontTools.subset",
            str(font_path),
            f"--output-file={out_path}",
            "--flavor=woff2",
            f"--unicodes={UNICODES}",
            f"--layout-features={FEATURES}",
            "--desubroutinize"
        ]

        subprocess.run(cmd, check=True)
        orig_kb = font_path.stat().st_size / 1024
        new_kb = out_path.stat().st_size / 1024
        saved_pct = 100 - (new_kb / orig_kb * 100) if orig_kb else 0
        print(f"  ✓ {font_path.name:25} -> {out_name:28} {orig_kb:5.1f} KB -> {new_kb:4.1f} KB (−{saved_pct:.1f}%)")

    print("\n✓ Alle Schriften erfolgreich eingedampft!")

if __name__ == "__main__":
    main()
