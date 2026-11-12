#!/usr/bin/env python3
"""kontrakt.py — schreibt je Batch ein KONTRAKT.md aus dem echten Importgraph.

Problem, das dieses Skript loest: die Batches sind nach Thema geschnitten, der
Code ist aber ueber Importe gekoppelt. B2 enthielt `main.js` nicht und konnte
deshalb seine eigene Frage ("ist der Boot-Pfad deterministisch?") nicht
beantworten — ein Reviewer schreibt dann "fehlt: main.js" und prueft nichts.

KONTRAKT.md nennt fuer jedes Modul ausserhalb des Batches Signatur und Rolle
(aus dem Dateikopf, nicht aus dem Modell) und listet umgekehrt, wer den Batch
von aussen benutzt. Damit ist die Naht pruefbar, ohne den Code zu duplizieren.

Aufruf: python3 batches/kontrakt.py [B1 B2 ...]
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
BATCHES = ROOT / 'batches'


def rolle(pfad: pathlib.Path) -> str:
    """Erste aussagekraeftige Zeile aus dem Dateikopf (Kommentar, kein Code)."""
    zeilen = pfad.read_text(encoding='utf-8').splitlines()[:24]
    for z in zeilen:
        t = z.strip().lstrip('/*#!').strip()
        t = re.sub(r'^(//|/\*|\*)\s*', '', t).strip()
        t = re.sub(r'^\d+\.\s*', '', t)
        if len(t) < 20 or t.startswith(('@', 'eslint', 'ts-')) or t.endswith(':'):
            continue
        return t.rstrip('.')
    return '—'


def exporte(pfad: pathlib.Path):
    t = pfad.read_text(encoding='utf-8')
    namen = re.findall(r'^export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)', t, re.M)
    namen += re.findall(r'^export\s*\{([^}]*)\}', t, re.M)[0].split(',') if re.search(r'^export\s*\{', t, re.M) else []
    return [n.strip().split(' as ')[-1].strip() for n in namen if n.strip()]


def importe(pfad: pathlib.Path):
    """(zielpfad, [symbole]) je Import-Statement.

    Basis ist das AUFGELOESTE Verzeichnis: die Batch-Dateien sind Symlinks, ein
    `./x.js` zeigt also auf `website/js/x.js` und nicht auf `batches/Bx/x.js`
    (genau daran ist die erste Fassung dieses Skripts gescheitert).
    """
    t = pfad.read_text(encoding='utf-8')
    basis = pfad.resolve().parent
    aus = []
    for m in re.finditer(r"import\s+(?:\{([^}]*)\}|(\w+)|\*\s+as\s+(\w+))?\s*from\s*'(\.{1,2}/[^']+)'", t):
        ziel = (basis / m.group(4)).resolve()
        roh = (m.group(1) or m.group(2) or m.group(3) or '').replace('\n', ' ')
        syms = [s.strip().split(' as ')[0].strip() for s in roh.split(',') if s.strip()]
        aus.append((ziel, syms))
    # Re-Export zaehlt als Abhaengigkeit: `export { X } from './y.js'`
    for m in re.finditer(r"export\s+(?:\{([^}]*)\}|\*)\s*from\s*'(\..*)'", t):
        ziel = (basis / m.group(2)).resolve()
        roh = (m.group(1) or '').replace('\n', ' ')
        syms = [s.strip().split(' as ')[0].strip() for s in roh.split(',') if s.strip()]
        aus.append((ziel, syms))
    return aus


def baue(bid: str) -> pathlib.Path:
    ordner = BATCHES / bid
    eigene = {f.resolve() for f in ordner.iterdir() if f.suffix in ('.js', '.css')}
    dateien = sorted(f for f in ordner.iterdir() if f.suffix in ('.js', '.css'))

    braucht = {}
    for f in dateien:
        for ziel, syms in importe(f):
            if ziel in eigene or not ziel.exists():
                continue
            eintrag = braucht.setdefault(ziel, {'syms': set(), 'von': set()})
            eintrag['syms'] |= set(syms)
            eintrag['von'].add(f.name)

    extern = {}
    for p in (ROOT / 'website').rglob('*'):
        if p.suffix != '.js' or not p.is_file():
            continue
        if p.name in {f.name for f in dateien} and p.parent == ROOT / 'website' / 'js':
            continue
        for ziel, syms in importe(p):
            if ziel in eigene and ziel.suffix == '.js':
                extern.setdefault(p.relative_to(ROOT), set()).update(syms)

    teile = [
        f'# Verträge zu {bid}',
        '',
        f'Dieser Batch enthält {len(dateien)} Module. Alles, was er importiert und',
        'nicht enthält, steht unten mit **Signatur und Rolle, ohne Code**. Das ist',
        'Absicht: die Naht ist prüfbar, die Implementierung gehört in ihren eigenen',
        'Batch. Beurteile, ob dieser Batch den Vertrag richtig benutzt — nicht, ob',
        'es die Module gibt, und nicht, wie sie intern aussehen.',
        '',
        '## Was dieser Batch von außen braucht',
        '',
    ]
    if braucht:
        teile += ['| Modul | Zeilen | erste Kopfzeile (kein Anspruch auf Vollständigkeit) | genutzte Symbole |', '|---|---:|---|---|']
        for ziel, d in sorted(braucht.items()):
            rel = ziel.relative_to(ROOT)
            syms = ', '.join(f'`{s}`' for s in sorted(d['syms'])) or '(Seiteneffekt)'
            teile.append(f'| `{rel}` | {len(ziel.read_text(encoding="utf-8").splitlines())} | {rolle(ziel)} | {syms} |')
        teile += ['', 'Die Kopfzeile kann irreführen: mehrere Module bündeln mehrere Abschnitte',
                  '(z. B. `persistence.js`). Maßgeblich ist die Spalte „genutzte Symbole".']
    else:
        teile += ['Keine — dieser Batch ist in sich geschlossen.', '']

    teile += ['', '## Wer diesen Batch von außen benutzt', '']
    if extern:
        teile += ['| Modul | nutzt |', '|---|---|']
        for p, syms in sorted(extern.items()):
            teile.append(f'| `{p}` | {", ".join(f"`{s}`" for s in sorted(syms))} |')
    else:
        teile += ['Niemand — dieser Batch wird nur intern benutzt.']

    teile += [
        '',
        '## Export-Fläche dieses Batches',
        '',
        '(Was die Außenwelt erwarten darf. Gezählt aus den `export`-Zeilen.)',
        '',
    ]
    for f in dateien:
        if f.suffix != '.js':
            continue
        teile.append(f'- `{f.name}`: {", ".join(f"`{n}`" for n in exporte(f)) or "nur Seiteneffekte"}')

    ziel_datei = ordner / 'KONTRAKT.md'
    ziel_datei.write_text('\n'.join(teile) + '\n', encoding='utf-8')
    return ziel_datei


ziele = sys.argv[1:] or sorted(p.name for p in BATCHES.iterdir() if p.is_dir() and p.name.startswith('B'))
for bid in ziele:
    p = baue(bid)
    print(f'{bid}: {p.name}  {p.stat().st_size / 1024:.1f} KiB')
