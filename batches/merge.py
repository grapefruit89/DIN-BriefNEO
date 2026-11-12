#!/usr/bin/env python3
"""merge.py — baut je Batch eine .txt mit Tree + allen Dateien (ohne prompt.md).

Aufruf:  python3 batches/merge.py          # alle Batches
         python3 batches/merge.py B2       # nur einer

Die Datei ist ein SNAPSHOT. Jede Quelle steht mit Pfad und SHA256-Kurzform im
Kopf — daran ist erkennbar, ob sie zum Repo passt. Nach Aenderungen neu laufen
lassen; das ist billiger als ein veralteter Stand im Chat.

Zusaetzlich steht im Kopf: Commit + Zeitpunkt (damit ein Befund "index.html:331"
zuordenbar bleibt) und eine Messwerte-Tabelle. Die Zahlen zaehlt dieses Skript,
weil ein Reviewer sie nicht zuverlaessig aus dem Text abzaehlen kann — er soll
urteilen, nicht schaetzen.
"""
import hashlib
import pathlib
import re
import subprocess
import sys

BASIS = pathlib.Path(__file__).resolve().parent.parent
BATCHES = BASIS / 'batches'
THEMEN = {
    'B1': 'Geometrie-CSS', 'B2': 'HTML + Boot', 'B3': 'Adresslogik',
    'B4': 'Speichern/Undo', 'B5': 'Textkern', 'B6': 'UI/Signatur',
    'B7': 'Testbrief', 'B8': 'Adressdaten',
    'B9 - PWA-Manifest': 'PWA-Manifest ohne Service Worker',
    'B10 - Boot-Zustand': 'Boot-Zustand, FOUC und doppelte Wahrheit',
    'B11 - FOUC-Vollstaendigkeit': 'FOUC-Vollstaendigkeit: welcher Zustand kommt zu spaet?',
    'B12 - Input-Migration': 'input vs. contenteditable: welche Annahme gilt noch?',
}
ORDER = {'.html': 0, '.css': 1, '.js': 2, '.txt': 3, '.json': 4}


def git_kopf() -> str:
    """Commit zum Buildzeitpunkt.

    Bewusst ohne Zeitstempel und ohne "Arbeitsbaum schmutzig": beides aendert
    sich bei jedem Lauf und macht die Merge-Datei nicht reproduzierbar. Ob der
    Snapshot zum Repo passt, beantwortet die SHA256-Tabelle — maschinell.
    """
    try:
        commit = subprocess.run(
            ['git', '-C', str(BASIS), 'rev-parse', '--short', 'HEAD'],
            capture_output=True, text=True, check=True
        ).stdout.strip()
    except Exception:
        commit = '?'
    return (
        f'Quellstand: Arbeitsbaum auf Basis HEAD {commit}. '
        'Verbindlich ist die SHA256-Tabelle unten: passt sie nicht, ist der Snapshot veraltet.'
    )


def messwerte(text: str) -> dict:
    """Grobe Zaehlung im Dateitext. Kein Parser — Callbacks/Aliase zaehlen nicht."""
    return {
        'export': len(re.findall(r'^export\s', text, re.M)),
        'funktionen': len(re.findall(r'\bfunction\s+\w+\s*\(', text)) + len(re.findall(r'=>', text)),
        'listener': len(re.findall(r'addEventListener\s*\(', text)),
        'dom': len(re.findall(r'(?:getElementById|querySelector(?:All)?)\s*\(', text)),
    }


def aufrufstellen(texte: list) -> tuple:
    """Namen mit genau einer Aufrufstelle bzw. ohne jede Aufrufstelle im Batch.

    Grundlage ist die Textsuche nach `name(`. Aufrufe ueber Callback, Alias,
    `window[name]` oder dynamisches Dispatch werden nicht erkannt — deshalb
    sind die Zahlen eine Untergrenze, kein Beweis.
    """
    alles = '\n'.join(texte)
    namen = set(re.findall(r'\bfunction\s+([A-Za-z_$][\w$]*)\s*\(', alles))
    namen |= set(re.findall(r'\b(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function|\()', alles))
    einmal = ohne = 0
    for n in sorted(namen):
        treffer = len(re.findall(rf'\b{re.escape(n)}\s*\(', alles))
        if treffer == 2:
            einmal += 1
        elif treffer <= 1:
            ohne += 1
    return einmal, ohne, len(namen)


def quellen(ordner: pathlib.Path):
    dateien = []
    for f in ordner.iterdir():
        if f.name in ('prompt.md', 'merge.txt') or '-merged' in f.name or f.suffix == '.py':
            continue
        if f.suffix == '.md' and f.name != 'prompt.md':
            dateien.append(f)
            continue
        if f.is_symlink() or f.is_file():
            if f.name in ('collect.sh',):
                continue
            dateien.append(f)
    return sorted(dateien, key=lambda p: (ORDER.get(p.suffix, 9), p.name))


def baue(bid: str) -> pathlib.Path:
    ordner = BATCHES / bid
    dateien = quellen(ordner)
    gesamt = 0
    kopf_dateien = []
    for f in dateien:
        text = f.read_text(encoding='utf-8')
        gesamt += len(text)
        ziel = f.resolve()
        rel = ziel.relative_to(BASIS) if BASIS in ziel.parents else ziel
        kurz = hashlib.sha256(text.encode('utf-8')).hexdigest()[:8]
        zeilen = text.count('\n') + (0 if text.endswith('\n') else 1)
        kopf_dateien.append((f.name, str(rel), zeilen, kurz, text))

    tree = [f'{bid}/']
    for name, _, zeilen, _, _ in kopf_dateien:
        tree.append(f'├── {name:<28} {zeilen:>5} Zeilen')
    tree.append('└── prompt.md                    (nicht enthalten — separat anklicken)')

    teile = [
        f'# {bid} — {THEMEN.get(bid, "")}',
        '',
        'Dieses Dokument enthaelt alle Quelldateien des Batches in EINER Datei,',
        'damit ein Agent ohne Einzelanhaenge arbeiten kann. Reihenfolge = Tree.',
        '',
        git_kopf(),
        '',
        '## Inhalt',
        '```',
        *tree,
        '```',
        '',
        '## Quellen (Snapshot)',
        '| Datei | Pfad im Repo | Zeilen | SHA256 |',
        '|---|---|---:|---|',
    ]
    for name, rel, zeilen, kurz, _ in kopf_dateien:
        teile.append(f'| `{name}` | `{rel}` | {zeilen} | `{kurz}` |')
    teile += ['', f'Gesamt: {gesamt} Zeichen ≈ {gesamt // 4 // 1000}k Token.', '']

    einmal, ohne, gesamt_namen = aufrufstellen([t for *_, t in kopf_dateien])
    teile += [
        '## Messwerte (maschinell gezaehlt — nicht schaetzen, hier nachlesen)',
        '',
        '| Datei | Zeilen | export-Zeilen | Funktionen | addEventListener | DOM-Abfragen |',
        '|---|---:|---:|---:|---:|---:|',
    ]
    for name, _, zeilen, _, text in kopf_dateien:
        m = messwerte(text)
        teile.append(
            f'| `{name}` | {zeilen} | {m["export"]} | {m["funktionen"]} '
            f'| {m["listener"]} | {m["dom"]} |'
        )
    if gesamt_namen:
        teile += [
            '',
            f'- Benannte Funktionen/Konstanten im Batch: {gesamt_namen}',
            f'- davon mit genau einer Aufrufstelle: {einmal}',
            f'- davon ohne erkennbare Aufrufstelle: {ohne}',
            '',
            'Gezählt per Textsuche auf `name(`. Aufrufe per Callback, Alias,',
            '`window[name]` oder dynamischem Dispatch sind **nicht** erkannt — die',
            'Zahlen sind eine Untergrenze. Nicht nachzaehlen, sondern interpretieren.',
        ]
    teile.append('')

    for name, rel, zeilen, kurz, text in kopf_dateien:
        teile += [
            '',
            '=' * 78,
            f'===== {name}  ({rel}, {zeilen} Zeilen, sha256:{kurz})',
            '=' * 78,
            '',
            text.rstrip('\n'),
            '',
        ]

    # Der Dateiname traegt den Commit: ein veralteter Anhang ist dann am Namen
    # erkennbar, bevor er im Chat landet (zwei Review-Laeufe 2026-11-12 haben
    # eine alte B2-merged.txt ohne main.js bekommen). Alte Fassungen fliegen
    # raus, damit nie zwei Staende nebeneinander liegen.
    for alt_datei in ordner.glob(f'{bid}-merged*.txt'):
        alt_datei.unlink()
    for alt_datei in ordner.glob('merge.txt'):
        alt_datei.unlink()
    commit = subprocess.run(
        ['git', '-C', str(BASIS), 'rev-parse', '--short', 'HEAD'],
        capture_output=True, text=True
    ).stdout.strip() or 'unbekannt'
    ziel = ordner / 'merge.txt'
    ziel.write_text('\n'.join(teile) + '\n', encoding='utf-8')

    # Selbstkontrolle: jede Datei aus dem Ordner muss als Block drin sein.
    # Sonst entsteht still ein unvollstaendiger Anhang — genau der Fehler, der
    # zwei Review-Laeufe gekostet hat.
    # Nur echte Blockkoepfe zaehlen ("===== name  (pfad, ..."): CSS-Dateien
    # enthalten selbst Bannerzeilen mit '=====', die sonst mitzaehlen.
    bloecke = len(re.findall(r'^===== \S+  \(', ziel.read_text(encoding='utf-8'), re.M))
    if bloecke != len(kopf_dateien):
        raise SystemExit(f'{bid}: {bloecke} Bloecke fuer {len(kopf_dateien)} Dateien — Abbruch')
    return ziel, len(kopf_dateien)


ziele = sys.argv[1:] or sorted(THEMEN)
for bid in ziele:
    p, n = baue(bid)
    print(f'{bid}: {p.name}  {n} Dateien  {p.stat().st_size / 1024:.0f} KiB')
