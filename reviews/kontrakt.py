#!/usr/bin/env python3
"""kontrakt.py — schreibt KONTRAKT.md: was eine Review-Scheibe von aussen braucht.

Problem, das dieses Skript loest: eine Scheibe wird nach Thema geschnitten, der
Code haengt aber an Importen. Fehlt ein Modul, kann der Reviewer seine eigene
Frage nicht beantworten und schreibt "fehlt: main.js" statt zu pruefen. Genau
das ist im Batch B2 passiert.

KONTRAKT.md nennt jedes Modul ausserhalb der Scheibe mit Zeilenzahl, Rolle
(aus dem Dateikopf) und den tatsaechlich importierten Symbolen — und umgekehrt,
wer die Scheibe von aussen benutzt. Die Naht wird damit pruefbar, ohne den Code
zu duplizieren.

Aufruf: python3 reviews/kontrakt.py reviews/<ordner>
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
IMPORT = re.compile(
    r"""import\s+(?:\{([^}]*)\}|(\*\s+as\s+\w+)|\w+)\s+from\s+['"]([^'"]+)['"]"""
    r"""|import\s+['"]([^'"]+)['"]""",
)


def quellen(ordner: pathlib.Path) -> list:
    liste = ordner / 'files.txt'
    if not liste.exists():
        raise SystemExit(f'{ordner.name}: files.txt fehlt')
    pfade = []
    for zeile in liste.read_text(encoding='utf-8').splitlines():
        zeile = zeile.strip()
        if not zeile or zeile.startswith('#'):
            continue
        p = pathlib.Path(zeile)
        pfade.append((p if p.is_absolute() else ROOT / p).resolve())
    return pfade


def rolle(pfad: pathlib.Path) -> str:
    """Erste Kopfzeile, die kein Code ist — Rolle des Moduls, ohne Modellwissen."""
    text = pfad.read_text(encoding='utf-8')
    for zeile in text.splitlines()[:25]:
        z = zeile.strip().strip('/*').strip()
        if not z or z in ('*/', '*') or z.startswith('@'):
            continue
        if z.startswith(('import ', 'export ', 'const ', 'let ', 'function ', '"use')):
            continue
        return z[:110]
    return '(kein Dateikopf)'


def importe(pfad: pathlib.Path) -> list:
    text = pfad.read_text(encoding='utf-8')
    treffer = []
    for m in IMPORT.finditer(text):
        namen, stern, ziel, nur = m.groups()
        ziel = ziel or nur
        if not ziel or not ziel.startswith('.'):
            continue
        datei = (pfad.parent / ziel).resolve()
        treffer.append((datei, namen.strip() if namen else ('*' if stern else '(seiteneffekt)')))
    return treffer


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        raise SystemExit(2)
    ordner = pathlib.Path(sys.argv[1]).resolve()
    scheibe = quellen(ordner)
    in_scheibe = set(scheibe)
    js = [p for p in scheibe if p.suffix == '.js']

    aussen = {}
    for p in js:
        for datei, symbole in importe(p):
            if datei in in_scheibe:
                continue
            eintrag = aussen.setdefault(datei, {'nutzer': set(), 'symbole': set()})
            eintrag['nutzer'].add(p.name)
            eintrag['symbole'].update(s.strip() for s in symbole.split(',') if s.strip())

    zeilen = [
        f'# Verträge zu {ordner.name}',
        '',
        'Diese Scheibe ist nach Thema geschnitten, der Code haengt aber an',
        'Importen. Alles, was sie von aussen braucht, steht hier mit Rolle und',
        'den tatsaechlich importierten Symbolen — ohne den Code der fremden',
        'Module. Beurteile, ob die Scheibe die Naht richtig benutzt, nicht wie',
        'die fremden Module intern aussehen.',
        '',
        'Quelle: die `import`-Zeilen der Scheibe. Keine transitive Analyse —',
        'was ein fremdes Modul selbst importiert, steht hier nicht.',
        '',
        '## Was diese Scheibe von aussen braucht',
        '',
        '| Modul | Zeilen | Rolle (Dateikopf) | genutzte Symbole |',
        '|---|---:|---|---|',
    ]
    for datei in sorted(aussen, key=lambda d: str(d)):
        rel = datei.relative_to(ROOT) if ROOT in datei.parents else datei
        n = datei.read_text(encoding='utf-8').count('\n') + 1
        symbole = ', '.join(f'`{s}`' for s in sorted(aussen[datei]['symbole'])) or '—'
        zeilen.append(f'| `{rel}` | {n} | {rolle(datei)} | {symbole} |')

    # Umgekehrt: wer importiert die Scheibe?
    nutzer = []
    for fremd in (ROOT / 'website' / 'js').glob('*.js'):
        if fremd.resolve() in in_scheibe:
            continue
        for datei, symbole in importe(fremd):
            if datei in in_scheibe:
                nutzer.append((fremd.name, datei.name, symbole))
    zeilen += ['', '## Wer diese Scheibe von aussen benutzt', '']
    if nutzer:
        zeilen += ['| Modul | importiert aus | Symbole |', '|---|---|---|']
        for fremd, ziel, symbole in sorted(set(nutzer)):
            zeilen.append(f'| `{fremd}` | `{ziel}` | `{symbole}` |')
    else:
        zeilen.append('(niemand ausserhalb der Scheibe)')

    (ordner / 'KONTRAKT.md').write_text('\n'.join(zeilen) + '\n', encoding='utf-8')
    print(f'{ordner.name}: KONTRAKT.md  {len(aussen)} externe Module  {len(nutzer)} Nutzer')


if __name__ == '__main__':
    main()
