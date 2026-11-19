#!/usr/bin/env python3
"""Waechter fuer die Charakter-Pipeline.

Verhindert, dass fehlende Adressdaten beim naechsten Pipeline-Lauf wieder zu
erfundenen Werten werden. Prueft statisch beide Skripte und fuehrt
tools/enrich_data.py auf einer TEMPORAEREN Kopie aus — nie auf der produktiven
Datei.

Aufruf:  python3 tools/check-charakter-pipeline.py
Exit:    0 = gruen, 1 = Verstoss
"""
import gzip
import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DATEN = REPO / 'website' / 'addons' / 'testbrief' / 'charactere.json'
ENRICH = REPO / 'tools' / 'enrich_data.py'
CONSOLIDATE = REPO / 'tools' / 'consolidate_all.py'
PLZ_GZ = REPO / 'website' / 'data' / 'de_plz_ort.json.gz'

# Werte, die nachweislich unbelegt sind und nie wieder geschrieben werden duerfen.
BEKANNT_UNBELEGT = {
    'Wayne Manor 1007', 'Berg Paozu Residenz 1',
    '10001 Gotham City', '10002 Gotham City',
    'Daily Planet Plaza 1 / Festung der Einsamkeit',
    'Ligusterweg 4 (ehem.) / Hogwarts',
    'Queen Manor / The Bunker',
    'Dorf der Sieger, Haus 1',
    'Hateno-Dorf Haus 1 / Schloss Hyrule',
    'Route 1 / Ketchum-Residenz',
    'Arkham Asylum Zelle 0801 / Vergnügungspark',
}

# Bereinigter Stand fuer Figuren, deren Anschrift in Runde 2 belegt wurde.
# Der Lauf muss genau diese Werte erzeugen — sonst laeuft das Enrichment dem
# Datenstand hinterher und dreht Korrekturen beim naechsten Mal zurueck.
BEREINIGTE_STRASSEN = {
    'Superman': 'Clinton Street 344',
    'Harry Potter': 'Ligusterweg 4',
    'Green Arrow': 'Queen Manor',
    'Katniss Everdeen': 'Dorf der Sieger',
    'Link': 'Hateno-Dorf',
    'Ash Ketchum': None,
    'The Joker': None,
}
SCHEINANSCHRIFT = re.compile(r'^(.*?)-?\s*residenz\s*\d+$', re.I)

fehler = []
def pruefe(name, ok, detail=''):
    print(f"  [{'OK  ' if ok else 'FEHL'}] {name}{(' — ' + detail) if detail else ''}")
    if not ok:
        fehler.append(name)

def norm(w):
    return re.sub(r'[^a-z0-9]+', ' ', str(w or '').lower()).strip()

def lade_deutsche_orte():
    with gzip.open(PLZ_GZ, 'rt', encoding='utf-8') as fh:
        return {norm(ort) for ort in json.load(fh).values()}

def lade_enrichment():
    quelle = ENRICH.read_text(encoding='utf-8')
    start = quelle.index('ENRICHMENT = {')
    ende = quelle.index('\n}\n', start) + 3
    namensraum = {}
    exec(quelle[start:ende], namensraum)  # noqa: S102 — reines Literal
    return namensraum['ENRICHMENT']

def main():
    orte = lade_deutsche_orte()
    enrichment = lade_enrichment()
    quelle_enrich = ENRICH.read_text(encoding='utf-8')
    quelle_cons = CONSOLIDATE.read_text(encoding='utf-8')

    print('== Statisch: erfundene Werte in tools/enrich_data.py')
    schein = [f'{n}: {v["strasse"]}' for n, v in enrichment.items()
              if v.get('strasse') and SCHEINANSCHRIFT.match(str(v['strasse']))]
    pruefe('keine "<Name>-Residenz N"-Werte', not schein, '; '.join(schein[:3]))

    plz_fremd = []
    for n, v in enrichment.items():
        m = re.match(r'^(\d{5})\s+(.+)$', str(v.get('ort') or ''))
        if m and norm(re.split(r'[,/]', m.group(2))[0]) not in orte:
            plz_fremd.append(f'{n}: {v["ort"]}')
    pruefe('keine PLZ an fiktiver Stadt', not plz_fremd, '; '.join(plz_fremd[:3]))

    bekannt = [f'{n}: {v.get(k)}' for n, v in enrichment.items()
               for k in ('strasse', 'ort') if str(v.get(k)) in BEKANNT_UNBELEGT]
    pruefe('keine bekannten unbelegten Adresswerte', not bekannt, '; '.join(bekannt[:3]))

    falsches_geschlecht = [f'{n}: {v["geschlecht"]!r}' for n, v in enrichment.items()
                           if 'geschlecht' in v and v['geschlecht'] not in ('m', 'w', 'd')]
    pruefe('geschlecht nur m/w/d', not falsches_geschlecht, '; '.join(falsches_geschlecht[:3]))

    print('== Statisch: keine Platzhalter-Erzeugung mehr')
    pruefe('enrich_data.py setzt kein "Hauptstraße 1"',
          'Hauptstraße 1' not in quelle_enrich)
    pruefe('consolidate_all.py erzeugt kein "-Residenz"',
          not re.search(r'f"\{clean_name\}-Residenz', quelle_cons))
    pruefe('consolidate_all.py haengt keine "1" an Gebaeudenamen',
          'return f"{firma} 1"' not in quelle_cons)

    print('== Funktional: Trockenlauf auf temporaerer Kopie')
    hash_vorher = hashlib.sha256(DATEN.read_bytes()).hexdigest()
    with tempfile.TemporaryDirectory() as tmp:
        ziel = Path(tmp) / 'figuren.json'
        shutil.copy2(DATEN, ziel)
        vorher = json.loads(ziel.read_text(encoding='utf-8'))['figuren']
        lauf = subprocess.run([sys.executable, str(ENRICH), str(ziel)],
                              capture_output=True, text=True, timeout=120)
        if lauf.returncode != 0:
            pruefe('enrich_data.py laeuft durch', False, lauf.stderr.strip()[:200])
            return abschluss()
        nachher = json.loads(ziel.read_text(encoding='utf-8'))['figuren']

    pruefe('produktive Datei unveraendert',
          hashlib.sha256(DATEN.read_bytes()).hexdigest() == hash_vorher)
    pruefe('Figurenzahl und Namen unveraendert',
          [f['name'] for f in vorher] == [f['name'] for f in nachher],
          f'{len(nachher)} Figuren')

    verlorene_aliase = []
    for f, g in zip(vorher, nachher):
        fehlend = [a for a in (f.get('alias') or []) if a not in (g.get('alias') or [])]
        if fehlend:
            verlorene_aliase.append(f"{f['name']}: {', '.join(fehlend[:3])}")
    pruefe('kein Alias-Eintrag geht verloren', not verlorene_aliase,
          '; '.join(verlorene_aliase[:3]))

    stand = {g['name']: g.get('strasse') for g in nachher}
    abweichend = [f'{n}: {stand[n]!r}' for n, soll in BEREINIGTE_STRASSEN.items()
                  if n in stand and stand[n] != soll]
    pruefe('Lauf reproduziert die bereinigten Strassen', not abweichend,
          '; '.join(abweichend[:3]))

    erfunden = [f"{f['name']}: {f.get('strasse')!r}" for f, g in zip(vorher, nachher)
                for _ in [0]
                if (str(g.get('strasse') or '') in BEKANNT_UNBELEGT
                    or SCHEINANSCHRIFT.match(str(g.get('strasse') or ''))
                    or str(g.get('strasse') or '') == 'Hauptstraße 1')
                and str(f.get('strasse') or '') != str(g.get('strasse') or '')]
    pruefe('keine vom Lauf erfundene Strasse', not erfunden, '; '.join(erfunden[:3]))

    # Altlasten im Bestand sind ein Datenbefund, kein Pipeline-Rueckfall:
    # sie verschwinden mit der Uebernahme der bereinigten Kopie.
    altlast = [f['name'] for f in nachher
               if SCHEINANSCHRIFT.match(str(f.get('strasse') or ''))]
    if altlast:
        print(f"  [INFO] {len(altlast)} Platzhalter stammen noch aus der produktiven Datei "
              f"und werden nicht vom Lauf erzeugt")

    # Kern der Regel: fehlend bleibt fehlend, ausser das Enrichment liefert
    # einen kuratierten Wert fuer genau diese Figur.
    aufgefuellt = [f"{f['name']}: {f.get('strasse')!r}" for f, g in zip(vorher, nachher)
                   if not str(f.get('strasse') or '').strip()
                   and str(g.get('strasse') or '').strip()
                   and f['name'] not in enrichment]
    pruefe('fehlende Strasse bleibt fehlend', not aufgefuellt, '; '.join(aufgefuellt[:3]))

    return abschluss()

def abschluss():
    print()
    if fehler:
        print(f'FEHLGESCHLAGEN: {len(fehler)} Verstoss/Verstoesse')
        return 1
    print('GRUEN: Pipeline erzeugt keine unbelegten Adressen mehr.')
    return 0

if __name__ == '__main__':
    sys.exit(main())
