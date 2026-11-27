#!/usr/bin/env python3
"""
tools/fonts/subset_fonts.py — DIN 5008 Font-Subsetting & WOFF2-Optimierung

Dampft die variable Inter (opsz 14-32, wght 100-900) auf den lückenlosen
DIN-5008-Zeichensatz (Anhang H/F: Latein, Umlaute, ẞ, Sonderzeichen, tnum,
Maße, Haken, Brüche) in EINE kompakte .woff2 nach website/fonts/.

Die Optical-Size-Achse wird auf 18pt festgenagelt (Inter 18pt ist der
Brief-Standard), die Gewichtsachse bleibt voll variabel (100..900). Damit
deckt eine einzige Datei Fließtext (400), Fett (600) und Betreff (700) ab.

Zusätzlich werden die rein lokalen Testschriften (Aptos, Michelangelus,
American Typewriter) mit demselben Zeichensatz und denselben Features
subsettet. Ihre .woff2 landen direkt in fonts/ und werden nur vom
Dev-Server (tools/static-server.mjs) ausgeliefert — niemals von website/.

Seit Etappe 6 liegt die Pipeline in `tools/fonts/`; `fonts/subset_fonts.py`
bleibt als Shim der stabile Aufrufpfad.
"""

import sys
import subprocess
import tempfile
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

# tools/fonts/subset_fonts.py -> tools/fonts -> tools -> Repo-Wurzel
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
# Rohschriften und lokale Subsets bleiben am Repo-Root in fonts/ (gitignored).
SRC_DIR = REPO_ROOT / "fonts"
DEST_DIR = REPO_ROOT / "website" / "fonts"

DEST_DIR.mkdir(parents=True, exist_ok=True)

# Lückenloser DIN-5008-Zeichensatz (Anhang H/F):
# Basic Latin, Latin-1 Supplement (ä, ö, ü, ß, §, ®, ©), OE/oe, großes ẞ,
# Typografische Striche/Quotes/Bullets, Schmal-Leerzeichen (U+202F), Euro,
# Brüche, Promille, Mathe (≤, ≥, ≈, −, ±, ×, ·), Durchmesser (⌀), Haken (✓, ✗), Winkelklammern
UNICODES = (
    # --- DACH + DIN-5008 (Nutzerentscheidung 2026-11-27) --------------------
    # Grundvorrat bleibt DACH: keine Latin-Ext-A, keine polnischen/
    # tschechischen/tuerkischen Zeichen. Neu dazu kommen die Zeichen, die
    # deutsche QWERTZ-Tastaturen und franzoesische Eigennamen in einem
    # DIN-Brief tatsaechlich brauchen: Akut, Guillemets und a/c/e mit
    # Gravis/Aigu/Cedille (Renée, François, Garçon). DIN 5008 Kap. 5 schreibt
    # keinen Zeichenvorrat vor, verlangt nur ISO/IEC 10646 (Unicode).
    "U+0020-007E,"            # ASCII: Buchstaben, Ziffern, alle Satzzeichen
    # --- DACH-Buchstaben ----------------------------------------------------
    "U+00C4,U+00D6,U+00DC,"   # Ae Oe Ue
    "U+00DF,"                 # sz
    "U+1E9E,"                 # grosses Eszett (amtlich seit 2017)
    "U+00B7,"                 # Mittelpunkt (Trennzeichen in Zeilen)
    "U+00E4,U+00F6,U+00FC,"   # ae oe ue
    # --- Akzente & Guillemets (QWERTZ/DIN, Nutzerentscheidung 2026-11-27) ---
    "U+00B4,"                 # Akut (Dead-Key auf deutschem QWERTZ)
    "U+00AB,U+00BB,"          # Guillemets « »
    "U+00E0,U+00E7,U+00E8,U+00E9,"  # a-grave, c-cedille, e-grave, e-aigu
    # --- von DIN 5008 ausdruecklich verlangt --------------------------------
    "U+00A0,"                 # geschuetztes Leerzeichen (7.2)
    "U+00AD,"                 # bedingter Trennstrich (6.1)
    "U+201E,U+201C,U+201D,U+201A,U+2018,U+2019,"  # Anfuehrungszeichen (8.3-8.5)
    "U+00A7,"                 # Paragraph (9.1)
    # --- Satz- und Sonderzeichen -------------------------------------------
    "U+00A9,U+00AE,U+00B0,U+00B1,U+00D7,"   # (c) (R) Grad Plusminus Mal
    "U+00B2-00B3,U+00B5,"            # hoch2 hoch3 mikro
    "U+00BC-00BE,"                   # 1/4 1/2 3/4
    "U+2010-2027,"            # Striche, Quotes, Bullets, Ellipse, ...
    "U+202F-2044,"            # Schmal-Leerzeichen, Bruchstrich, ...
    "U+20AC,"                 # Euro
    "U+2116,"                 # Numero
    "U+2122,"                 # Trademark
    "U+2212,U+2248,U+2264-2265,"     # Minus, ungefaehr, kleiner/gleich
    "U+2300,"                 # Durchmesser
    "U+2713-2718,"            # Haken/Kreuz
    "U+27E8-27E9"             # spitze Klammern
)

FEATURES = "kern,liga,calt,tnum"

# Fixierte Optical-Size-Achse der Variablen Inter (Achsen: opsz 14..32,
# wght 100..900). 18pt ist der eingefrorene Brief-Standard; wght bleibt
# variabel, damit 400/600/700 ohne zweite Datei funktionieren.
OPSZ_PT = 18

# Budget: eine Datei, die alle drei Gewichte traegt.
MAX_BYTES = 38 * 1024

# Was gebaut wird: Quelldatei in fonts/ -> Zielname in website/fonts/.
# Nur diese Schrift darf ins Repo (Lizenz). Aptos (Microsoft) und
# Michelangelus (kommerziell) bleiben ausschliesslich lokal.
# Inter steht unter SIL OFL 1.1 — die Lizenzdatei liegt als
# website/fonts/LICENSE-Inter.txt daneben.
# Die frueheren statischen Schnitte (Inter_18pt-Regular/Bold.ttf) und
# Liberation Sans sind am 2026-11-27 entfallen: EINE variable Datei ist
# der einzige Brief-Standard. Die Rohschriften bleiben hoechstens lokal.
BAUT = (
    ("Inter-Variable.ttf", "inter-variable.woff2"),
)

# Lokale Testschriften: gleicher Zeichensatz, gleiche Features, aber das
# Ziel ist SRC_DIR selbst (fonts/). fonts/ ist komplett gitignoriert, also
# entsteht hier kein Repo-Artefakt. Ausgeliefert wird nur ueber den
# Dev-Server (tools/static-server.mjs, /__fonts).
LOKAL_BAUT = (
    ("Aptos.ttf", "aptos.woff2"),
    ("Aptos-Bold.ttf", "aptos-bold.woff2"),
    ("Michelangelus-Regular.ttf", "michelangelus-regular.woff2"),
    ("Michelangelus-Bold.ttf", "michelangelus-bold.woff2"),
    ("American Typewriter Regular.ttf", "american-typewriter-regular.woff2"),
)

# Budget je lokaler Testschrift.
MAX_LOKAL_BYTES = 30 * 1024


def pin_opsz(font_path: Path, out_dir: Path) -> Path:
    """Fixiert die opsz-Achse auf OPSZ_PT und schreibt das TTF nach out_dir.

    Nicht-variable Quellen werden unveraendert zurueckgegeben, damit das
    Skript auch kuenftige statische Schnitte baut.
    """
    font = TTFont(font_path)
    axes = [a.axisTag for a in font["fvar"].axes] if "fvar" in font else []
    if "opsz" not in axes:
        return font_path

    instantiateVariableFont(font, {"opsz": OPSZ_PT}, inplace=True, updateFontNames=True)
    frozen = out_dir / f"{font_path.stem}-opsz{OPSZ_PT}.ttf"
    font.save(frozen)
    return frozen


def subset(src: Path, out_path: Path) -> int:
    """Subsettet src auf UNICODES/FEATURES und schreibt out_path als woff2."""
    cmd = [
        sys.executable, "-m", "fontTools.subset",
        str(src),
        f"--output-file={out_path}",
        "--flavor=woff2",
        f"--unicodes={UNICODES}",
        f"--layout-features={FEATURES}",
        "--desubroutinize"
    ]
    subprocess.run(cmd, check=True)
    return out_path.stat().st_size


def baue(quelle: str, zielname: str, ziel_dir: Path, tmp_dir: Path, budget: int) -> bool:
    """Baut einen Eintrag. False = Quelle fehlt oder Budget gerissen."""
    font_path = SRC_DIR / quelle
    if not font_path.exists():
        print(f"  FEHLT   {quelle} — uebersprungen")
        return False

    # Variable Quelle: opsz=18 einfrieren, wght-Achse bleibt erhalten.
    frozen = pin_opsz(font_path, tmp_dir)

    out_path = ziel_dir / zielname
    new_bytes = subset(frozen, out_path)
    orig_kb = font_path.stat().st_size / 1024
    new_kb = new_bytes / 1024
    saved_pct = 100 - (new_kb / orig_kb * 100) if orig_kb else 0
    print(f"  OK      {quelle:28} -> {str(out_path):55} {orig_kb:6.1f} KB -> {new_kb:5.1f} KB (-{saved_pct:.1f}%)")

    if new_bytes >= budget:
        print(f"  FEHLER  {zielname} ist {new_bytes} B — Budget {budget} B gerissen")
        sys.exit(1)
    return True


def main():
    if not SRC_DIR.exists():
        print(f"Quellordner fehlt: {SRC_DIR}")
        sys.exit(1)

    with tempfile.TemporaryDirectory(prefix="din-fonts-") as tmp:
        tmp_dir = Path(tmp)

        print(f"Starte DACH-Subsetting nach {DEST_DIR}...\n")
        gebaut = 0
        for quelldatei, zielname in BAUT:
            if baue(quelldatei, zielname, DEST_DIR, tmp_dir, MAX_BYTES):
                gebaut += 1

        if not gebaut:
            print("\nNichts gebaut: keine der erwarteten Quelldateien lag in fonts/.")
            sys.exit(1)

        print(f"\nFertig: {gebaut} Datei(en) nach website/fonts/ geschrieben.")

        print(f"\nStarte lokale Subsets nach {SRC_DIR}...\n")
        lokal = 0
        for quelldatei, zielname in LOKAL_BAUT:
            if baue(quelldatei, zielname, SRC_DIR, tmp_dir, MAX_LOKAL_BYTES):
                lokal += 1

    print(f"Lokal: {lokal}/{len(LOKAL_BAUT)} Testschrift(en) in fonts/ gebaut (nur Dev-Server, nie website/).")


if __name__ == "__main__":
    main()
