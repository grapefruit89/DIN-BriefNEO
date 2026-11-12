# Review-Batches

Ein Batch = ein Chat mit einem starken Modell. Symlinks statt Kopien:
**jede Datei zeigt auf das Original im Repo, es kann also keinen veralteten
Stand geben.** Nach Änderungen im Repo ist nichts nachzuziehen.

| Batch | Thema | Dateien | ~Token |
|---|---|---|---|
| B1 | Geometrie-CSS | base.css, sheet-common.css, sheet-multipage.css | 10,8k |
| B2 | HTML + Boot | index.html, core.js, boot.js, field.js (+ llms.txt) | 12,1k |
| B3 | Adresslogik | address.js, clipboard-parser.js | 15,6k |
| B4 | Speichern/Undo | persistence.js, draft-manager.js, binary-storage.js | 13,2k |
| B5 | Textkern | document.js, format.js, salutation.js | 13,4k |
| B6 | UI/Signatur | sidebar.css, settings.js, signature.js | 13,4k |
| B7 | Testbrief | addons/testbrief/testbrief.js | 14,4k |
| B8 | Adressdaten | address-data.js, font-feature.js | 10,3k |

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
