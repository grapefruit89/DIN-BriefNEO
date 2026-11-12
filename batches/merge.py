#!/usr/bin/env python3
"""merge.py — baut je Batch eine .txt mit Tree + allen Dateien (ohne prompt.md).

Aufruf:  python3 batches/merge.py          # alle Batches
         python3 batches/merge.py B2       # nur einer

Die Datei ist ein SNAPSHOT. Jede Quelle steht mit Pfad und SHA256-Kurzform im
Kopf — daran ist erkennbar, ob sie zum Repo passt. Nach Aenderungen neu laufen
lassen; das ist billiger als ein veralteter Stand im Chat.
"""
import hashlib
import pathlib
import sys

BASIS = pathlib.Path(__file__).resolve().parent.parent
BATCHES = BASIS / 'batches'
THEMEN = {
    'B1': 'Geometrie-CSS', 'B2': 'HTML + Boot', 'B3': 'Adresslogik',
    'B4': 'Speichern/Undo', 'B5': 'Textkern', 'B6': 'UI/Signatur',
    'B7': 'Testbrief', 'B8': 'Adressdaten',
}
ORDER = {'.html': 0, '.css': 1, '.js': 2, '.txt': 3, '.json': 4}


def quellen(ordner: pathlib.Path):
    dateien = []
    for f in ordner.iterdir():
        if f.name == 'prompt.md' or f.name.endswith('-merged.txt') or f.suffix == '.py':
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

    ziel = ordner / f'{bid}-merged.txt'
    ziel.write_text('\n'.join(teile) + '\n', encoding='utf-8')
    return ziel


ziele = sys.argv[1:] or sorted(THEMEN)
for bid in ziele:
    p = baue(bid)
    print(f'{bid}: {p.name}  {p.stat().st_size / 1024:.0f} KiB')
