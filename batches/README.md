# Review-Batches

Ein Batch = ein Chat mit einem starken Modell. Symlinks statt Kopien:
**jede Datei zeigt auf das Original im Repo, es kann also keinen veralteten
Stand geben.** Nach Änderungen im Repo ist nichts nachzuziehen.

| Batch | Thema | Dateien | ~Token |
|---|---|---|---|
| B1 | Geometrie-CSS | base.css, sheet-common.css, sheet-multipage.css + index.html (Beilage) | 20k |
| B2 | HTML + Boot (Folgefragen) | index.html, main.js, core.js, boot.js, field.js (+ llms.txt) | 17k |
| B3 | Adresslogik | address.js, clipboard-parser.js, field.js | 17k |
| B4 | Speichern/Undo | persistence.js, draft-manager.js, binary-storage.js | 14k |
| B5 | Textkern | document.js, format.js, salutation.js | 14k |
| B6 | UI/Signatur | sidebar.css, settings.js, signature.js + index.html (Beilage) | 23k |
| B7 | Testbrief | addons/testbrief/testbrief.js | 15k |
| B8 | Adressdaten | address-data.js, font-feature.js | 11k |
| B9 - PWA-Manifest | Installierbar ohne Service Worker? | web.dev add-manifest + install-criteria (Rohtext), index.html, 02-pwa-plan.md, Law-Catalog | 15k |
| B10 - Boot-Zustand | FOUC und doppelte Wahrheit | boot.js, boot-state.js, main.js, settings.js, draft-manager.js, persistence.js, index.html, 3 CSS + Messprotokoll | 49k |

Jeder Batch enthält zusätzlich `KONTRAKT.md` (aus dem echten Importgraph
erzeugt): was er von außen braucht, wer ihn von außen benutzt, und seine
Export-Fläche. Ohne dieses Blatt wiederholt sich der B2-Fehler — dort fehlte
`main.js`, und die eigene Frage nach dem Boot-Pfad war nicht beantwortbar.

B1 und B6 bekommen `index.html` als **Beilage**: ihre Frage („welche Regel
trifft kein Element?") ist ohne Markup nicht beantwortbar. Das Markup steht
dort ausdrücklich außerhalb der Bewertung.

**B2** ist zweistufig aufgebaut: der Prompt enthält eine Tabelle „Was die erste
Runde ergeben hat" mit allen bereits am Code widerlegten oder entschiedenen
Befunden, und darunter fünf **Folgefragen** (Critical-Auswahl, Reihenfolge,
Idempotenz, `data-ready`, klassisches Boot-Skript). Ein zweiter Batch `B2b` gab
es kurzzeitig; er ist in B2 aufgegangen, weil er dieselben Dateien brauchte.

## Pro Batch genau zwei Dateien

```
batches/B3/
├── prompt.md      ← in den Chat kopieren
├── merge.txt      ← anhängen (alles andere steckt darin)
├── KONTRAKT.md    ┐
├── address.js     │ Zutaten für merge.txt — nicht einzeln anhängen
├── clipboard-parser.js │
└── field.js       ┘
```

`merge.txt` enthält **jede** Datei des Ordners außer `prompt.md` — in einer
Datei, mit Tree und SHA256 je Quelle im Kopf. `merge.py` prüft nach dem Bau,
ob die Blockzahl zur Dateizahl im Ordner passt, und bricht sonst ab: ein
unvollständiger Anhang kann so nicht mehr entstehen.

### Warum der Kopf so aussieht

| Kopfzeile | Warum |
|---|---|
| `Quellstand: Arbeitsbaum auf Basis HEAD <hash>` | ein Befund bleibt einem Code-Stand zuordenbar |
| Tree | zeigt sofort, welche Dateien drin sind — und welche fehlen |
| SHA256 je Datei | veralteter Snapshot ist mechanisch erkennbar, nicht durch Raten |
| `## Messwerte` | Zeilen, Exporte, Listener, Aufrufstellen — gezählt, nicht geschätzt |

`merge.txt` hat **keine Zeilennummern**. Deshalb verlangt der Prompt „Datei +
wörtliche Zeile" statt „datei:ZEILE": ein Modell kann in 400 Zeilen nicht
zuverlässig bis Zeile 331 zählen, ein Zitat ist per `grep -n` prüfbar.

### Neu bauen

```bash
python3 /home/moritz/repos/DIN-BriefNEO/batches/kontrakt.py   # KONTRAKT.md
python3 /home/moritz/repos/DIN-BriefNEO/batches/merge.py      # alle merge.txt
python3 /home/moritz/repos/DIN-BriefNEO/batches/merge.py B3   # nur einer
```

`kontrakt.py` liest die Importe der Symlinks (aufgelöst, nicht relativ zum
Link) und schreibt `KONTRAKT.md` in jeden Batch. Nach Umbauten am Importgraph
neu laufen lassen — sonst beschreibt der Vertrag einen alten Stand.

`merge.txt` ist Build-Output (`.gitignore`): es wird bei jedem Bau neu erzeugt,
es liegt immer genau ein Stand im Ordner. Ein zweiter Lauf ohne Repo-Änderung
erzeugt byte-gleiche Dateien.

## Benutzung

1. `batches/<Bn>/prompt.md` in den Chat kopieren.
2. `batches/<Bn>/merge.txt` anhängen — sonst nichts.
3. Ergebnis nicht sofort umsetzen: **BUG** → Auftrag, **RISIKO** → Messung,
   **SMELL** → Backlog.
4. Befunde sammeln in `todo/18-review-<datum>-<thema>.md`.
