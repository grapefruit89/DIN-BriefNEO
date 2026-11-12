# Review-Batches

Ein Batch = ein Chat mit einem starken Modell. Symlinks statt Kopien:
**jede Datei zeigt auf das Original im Repo, es kann also keinen veralteten
Stand geben.** Nach Änderungen im Repo ist nichts nachzuziehen.

| Batch | Thema | Dateien | ~Token |
|---|---|---|---|
| B1 | Geometrie-CSS | base.css, sheet-common.css, sheet-multipage.css | 10,8k |
| B2 | HTML + Boot | index.html, core.js, boot.js, field.js (+ llms.txt) | 12,1k |
| B2b | Orchestrierung | index.html, main.js, boot.js, core.js, field.js | 15k |
| B3 | Adresslogik | address.js, clipboard-parser.js | 15,6k |
| B4 | Speichern/Undo | persistence.js, draft-manager.js, binary-storage.js | 13,2k |
| B5 | Textkern | document.js, format.js, salutation.js | 13,4k |
| B6 | UI/Signatur | sidebar.css, settings.js, signature.js | 13,4k |
| B7 | Testbrief | addons/testbrief/testbrief.js | 14,4k |
| B8 | Adressdaten | address-data.js, font-feature.js | 10,3k |

**B2b** ist der Folgeauftrag zu B2: `main.js` war dort nicht enthalten, damit
waren Boot-Reihenfolge, Marker und Aufrufer nicht prüfbar. Der Prompt enthält
außerdem eine Liste bereits widerlegter Befunde, damit sie nicht erneut
berichtet werden.

## Merge-Dateien

In jedem Batch liegt zusätzlich `B<x>-merged.txt`: **alle** Quelldateien in
einer Datei, mit Tree und SHA256-Kurzform je Quelle im Kopf. `prompt.md` ist
bewusst nicht enthalten — den klickst du separat an.

Der Kopf trägt drei Dinge, die ein Reviewer nicht selbst ermitteln kann:

| Kopfzeile | Warum |
|---|---|
| `Quellstand: HEAD <hash>` | ein Befund bleibt einem Code-Stand zuordenbar |
| SHA256 je Datei | veralteter Snapshot ist mechanisch erkennbar, nicht durch Raten |
| `## Messwerte` | Zeilen, Exporte, Listener, Aufrufstellen — gezählt, nicht geschätzt |

Die Merge-Datei enthält **keine Zeilennummern**. Deshalb verlangt der Prompt
„Datei + wörtliche Zeile" statt „datei:ZEILE": ein Modell kann in 427 Zeilen
nicht zuverlässig bis Zeile 331 zählen, ein Zitat dagegen ist per `grep -n`
prüfbar.

```bash
python3 /home/moritz/repos/DIN-BriefNEO/batches/merge.py      # alle neu bauen
python3 /home/moritz/repos/DIN-BriefNEO/batches/merge.py B2   # nur einer
```

Die Datei ist ein **Snapshot**: nach Änderungen im Repo neu bauen, sonst zeigt
der SHA256 im Kopf, dass sie nicht mehr passt. Ein zweiter Lauf ohne
Repo-Änderung erzeugt byte-gleiche Dateien.

## Benutzung

1. Dateien für den Chat bereitstellen (Symlinks in echte Dateien auflösen):

   ```bash
   bash /home/moritz/repos/DIN-BriefNEO/batches/collect.sh B2
   # -> /tmp/din-review/B2/ mit echten Dateien + prompt.md
   ```

   Oder ZIP zum Anhängen:

   ```bash
   bash /home/moritz/repos/DIN-BriefNEO/batches/collect.sh B2 --zip
   # -> /tmp/din-review/B2.zip
   ```

2. `prompt.md` aus dem Ordner in den Chat kopieren, Dateien anhängen.
3. Ergebnis nicht sofort umsetzen: **BUG** → Auftrag, **RISIKO** → Messung,
   **SMELL** → Backlog.
4. Befunde sammeln in `todo/18-review-<datum>-<thema>.md`.
