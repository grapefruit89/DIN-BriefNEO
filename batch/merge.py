#!/usr/bin/env python3
"""merge.py — baut aus einer Review-Scheibe EINE Anhaenge-Datei.

Eine Scheibe ist ein Ordner unter `reviews/` mit:

    batch/2026-11-13-seitenleiste/
    ├── prompt.md     ← der Auftrag, den der Reviewer liest
    ├── files.txt     ← eine Pfadzeile je Quelle (Kommentare mit #)
    └── merge.txt     ← Build-Output (nicht committen)

Warum genau eine Datei: ein Review mit acht Einzelanhaengen ist nicht
reproduzierbar. Man weiss nie, ob der Reviewer dieselbe Fassung gesehen hat.
Hier steht am Kopf jeder Quelle ein SHA256, und die Zahl der Bloecke wird gegen
die Zahl der Quelldateien geprueft — ein unvollstaendiger Anhang bricht ab,
statt still zu entstehen.

Aufruf:
    python3 reviews/merge.py reviews/2026-11-13-seitenleiste
    python3 reviews/merge.py --alle

Kein Zeitstempel im Kopf: der macht die Datei bei jedem Lauf anders und damit
nicht vergleichbar. Verbindlich ist die SHA256-Tabelle.
"""
import hashlib
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
REVIEWS = ROOT / 'batch'
ORDER = {'.html': 0, '.css': 1, '.js': 2, '.txt': 3, '.json': 4, '.md': 5}


def kopf_commit() -> str:
    try:
        return subprocess.run(
            ['git', '-C', str(ROOT), 'rev-parse', '--short', 'HEAD'],
            capture_output=True, text=True, check=True,
        ).stdout.strip() or '?'
    except Exception:
        return '?'


def quellen(ordner: pathlib.Path) -> list:
    liste = ordner / 'files.txt'
    if not liste.exists():
        raise SystemExit(f'{ordner.name}: files.txt fehlt — welche Dateien gehoeren in den Anhang?')
    pfade = []
    for zeile in liste.read_text(encoding='utf-8').splitlines():
        zeile = zeile.strip()
        if not zeile or zeile.startswith('#'):
            continue
        p = pathlib.Path(zeile)
        p = p if p.is_absolute() else ROOT / p
        if not p.exists():
            raise SystemExit(f'{ordner.name}: {zeile} existiert nicht')
        pfade.append(p)
    if not pfade:
        raise SystemExit(f'{ordner.name}: files.txt ist leer')
    return sorted(pfade, key=lambda p: (ORDER.get(p.suffix, 9), p.name))


def messwerte(text: str) -> dict:
    """Grobe Zaehlung. Kein Parser — Alias-Aufrufe zaehlen nicht."""
    return {
        'export': len(re.findall(r'^export\s', text, re.M)),
        'funktionen': len(re.findall(r'\bfunction\s+\w+\s*\(', text))
        + len(re.findall(r'=>', text)),
        'listener': len(re.findall(r'addEventListener\s*\(', text)),
        'dom': len(re.findall(r'(?:getElementById|querySelector(?:All)?)\s*\(', text)),
    }


def baue(ordner: pathlib.Path) -> tuple:
    dateien = quellen(ordner)
    commit = kopf_commit()
    gesamt = 0
    zeilen_kopf = []

    for f in dateien:
        text = f.read_text(encoding='utf-8')
        gesamt += len(text)
        rel = f.relative_to(ROOT) if ROOT in f.parents else f
        kurz = hashlib.sha256(text.encode('utf-8')).hexdigest()[:8]
        n = text.count('\n') + (0 if text.endswith('\n') else 1)
        zeilen_kopf.append((f.name, str(rel), n, kurz, text))

    tree = [f'{ordner.name}/']
    for name, _, n, _, _ in zeilen_kopf:
        tree.append(f'├── {name:<30} {n:>5} Zeilen')

    teile = [
        f'# Review {ordner.name} — Snapshot',
        '',
        'Dieses Dokument enthaelt den Auftrag UND alle Quelldateien der',
        'Review-Scheibe in EINER Datei. Reihenfolge = Tree. Der Auftrag steht',
        'unter „Auftrag" — er muss nicht mitgeschickt werden.',
        '',
        f'Quellstand: Arbeitsbaum auf Basis HEAD {commit}. Verbindlich ist die',
        'SHA256-Tabelle unten: passt sie nicht, ist der Anhang veraltet — dann',
        'sag das, statt gegen einen unbekannten Stand zu argumentieren.',
        '',
        '## Inhalt',
        '```',
        *tree,
        '```',
        '',
    ]

    # Der Auftrag gehoert in DIESE Datei und VOR die SHA-Tabelle: eine gekuerzte
    # Ansicht (2026-11-15: der Reviewer sah nur Zeilen 122-1088) muss den
    # Auftrag trotzdem zeigen. Ein Snapshot ohne Auftrag ist nicht reviewbar.
    auftrag = ordner / 'prompt.md'
    if auftrag.exists():
        teile += ['---', '', '## Auftrag', '', auftrag.read_text(encoding='utf-8').rstrip(), '']
    else:
        teile += ['---', '', '## Auftrag', '', '**FEHLT: prompt.md** — Scheibe ohne Auftrag.', '']

    teile += [
        '---',
        '',
        '## Quellen (Snapshot)',
        '| Datei | Pfad im Repo | Zeilen | SHA256 |',
        '|---|---|---:|---|',
    ]
    for name, rel, n, kurz, _ in zeilen_kopf:
        teile.append(f'| `{name}` | `{rel}` | {n} | `{kurz}` |')
    teile += ['', f'Gesamt: {gesamt} Zeichen ≈ {gesamt // 4 // 1000}k Token.', '']


    # Die Messwerte sind JS-spezifisch (export, Funktionen, Listener, DOM).
    # Fuer eine reine CSS-Scheibe waeren alle Spalten null - das ist Rauschen,
    # nicht Information, also entfaellt die Tabelle dann ganz.
    if any(name.endswith('.js') for name, _, _, _, _ in zeilen_kopf):
        teile += [
            '## Messwerte (maschinell gezaehlt — hier nachlesen statt schaetzen)',
            '',
            '| Datei | Zeilen | export-Zeilen | Funktionen | addEventListener | DOM-Abfragen |',
            '|---|---:|---:|---:|---:|---:|',
        ]
        for name, _, n, _, text in zeilen_kopf:
            if not name.endswith('.js'):
                continue
            m = messwerte(text)
            teile.append(
                f'| `{name}` | {n} | {m["export"]} | {m["funktionen"]} '
                f'| {m["listener"]} | {m["dom"]} |'
            )
        teile += [
            '',
            'Gezählt per Textsuche auf `name(`. Aufrufe über Callback, Alias,',
            '`window[name]` oder dynamisches Dispatch sind **nicht** erkannt — die',
            'Zahlen sind eine Untergrenze. Nicht nachzählen, sondern interpretieren.',
            '',
        ]

    for name, rel, n, kurz, text in zeilen_kopf:
        teile += [
            '',
            '=' * 78,
            f'===== {name}  ({rel}, {n} Zeilen, sha256:{kurz})',
            '=' * 78,
            '',
            text.rstrip('\n'),
            '',
        ]

    ziel = ordner / 'merge.txt'
    ziel.write_text('\n'.join(teile) + '\n', encoding='utf-8')

    # Selbstkontrolle: jeder Quellblock genau einmal. Nur echte Blockkoepfe
    # zaehlen — CSS-Dateien enthalten selbst Bannerzeilen mit "=====".
    bloecke = len(re.findall(r'^===== \S+  \(', ziel.read_text(encoding='utf-8'), re.M))
    if bloecke != len(zeilen_kopf):
        raise SystemExit(f'{ordner.name}: {bloecke} Bloecke fuer {len(zeilen_kopf)} Dateien — Abbruch')
    return ziel, len(zeilen_kopf)


def pruefe(ordner: pathlib.Path, ziel: pathlib.Path) -> list:
    """Selbstkontrolle einer fertigen Scheibe. Gibt die Fehlerliste zurueck."""
    fehler = []
    if not (ordner / 'prompt.md').exists():
        fehler.append('prompt.md fehlt')
    if not (ordner / 'files.txt').exists():
        fehler.append('files.txt fehlt')
    if not (ordner / 'KONTRAKT.md').exists():
        fehler.append('KONTRAKT.md fehlt (python3 batch/kontrakt.py <ordner>)')
    text = ziel.read_text(encoding='utf-8') if ziel.exists() else ''
    if '## Auftrag' not in text:
        fehler.append('merge.txt enthaelt keinen Abschnitt "Auftrag"')
    if '**FEHLT: prompt.md**' in text:
        fehler.append('merge.txt meldet fehlenden Auftrag')
    # Der Auftrag muss VOR den Quellen stehen, sonst sieht ihn eine gekuerzte
    # Ansicht nicht (2026-11-15: Reviewer sah nur Zeilen 122-1088).
    i_auftrag = text.find('## Auftrag')
    i_quellen = text.find('## Quellen (Snapshot)')
    if i_auftrag > -1 and i_quellen > -1 and i_auftrag > i_quellen:
        fehler.append('Auftrag steht NACH der SHA-Tabelle (gehoert davor)')
    return fehler


def main() -> None:
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        raise SystemExit(2)
    ordner = sorted(p for p in REVIEWS.iterdir() if p.is_dir() and (p / 'files.txt').exists()) \
        if args[0] == '--alle' else [pathlib.Path(a).resolve() for a in args]
    gesamt_fehler = 0
    for o in ordner:
        ziel, n = baue(o)
        fehler = pruefe(o, ziel)
        status = 'OK' if not fehler else 'FEHLER: ' + '; '.join(fehler)
        print(f'{o.name}: {ziel.name}  {n} Dateien  {ziel.stat().st_size / 1024:.0f} KiB  [{status}]')
        gesamt_fehler += len(fehler)
    if gesamt_fehler:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
