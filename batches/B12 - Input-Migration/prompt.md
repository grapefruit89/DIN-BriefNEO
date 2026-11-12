# Review-Auftrag B12 — input vs. contenteditable: welche Annahme gilt noch?

## Rolle

Senior Frontend-Architekt für Vanilla-JS ohne Framework, ohne Build. Du änderst
**nichts**, du analysierst und schlägst vor. Leitfrage: *Welche Stelle im Code
geht noch von `contenteditable` aus, obwohl dort seit der Migration ein
`<input>` steht — und welche tut es still, ohne Fehler?*

## Kontext

**DIN-BriefNEO** ist ein Brief-Editor, der DIN 5008 als A4 druckt. Kein
Framework, kein Build, ES-Module direkt im Browser. Baseline **Chrome 150+**
(`attr(… type(<number>))`, `@scope`, `:has()`, `field-sizing`, Popover,
`<dialog>`, `input switch`, `ariaNotify` sind vorhanden und Absicht).

Auslieferung öffentlich über GitHub Pages, CSP `script-src 'self'`.
Debug-Betrieb lokal auf `http://127.0.0.1:8088`.

Harte Regeln (Auszug, gelten):
- **A37:** kein Service Worker.
- **A49:** kein JS-Textfitting / DOM-Layout-Polling.
- **A61:** kein schreibender `innerHTML`-Zugriff (DOMParser + `replaceChildren`).
- **A48/TM1:** keine Legacy-Datums-API. **A50:** Temporal nur mit expliziter Zone.

## Dateien dieses Batches

| Datei | Warum dabei |
|---|---|
| `field.js` | die Abstraktion: `isNative` / `getValue` / `setValue` |
| `document.js` | `EDITABLE_FIELD_SELECTOR`, Caret-/Tastatur-/Paste-Regeln, `FIELD_MAX_LENGTHS`, Absatz-Normalisierung |
| `draft-manager.js` | Restore, Caret, Migration, Undo/Reset |
| `boot-state.js` | Seeder: input/textarea vs. `isContentEditable` |
| `main.js` | Save-Trigger, Feld-Listener |
| `format.js` | Datum/Typografie, die auf Feldwerte schreibt |
| `persistence.js` | `collectDraft`/`applyImportedData`, Schema, Export/Import |
| *(nicht dabei)* `address-data.js` | enthält dieselben Feld-Helfer, ist aber ein Datenkorpus (1066 Zeilen) — Zitate stehen in der Inventur |
| `salutation.js` | Anrede/Gruß schreiben in Felder |
| `clipboard-parser.js` | Anschrift übernehmen, Felder füllen |
| `index.html` | der Ist-Zustand: 28 `input[data-atom]`, 1 `textarea[data-feldtyp]`, 1 `contenteditable` (`#text`) |
| `base.css`, `sheet-common.css` | Feld-Chrom, Platzhalter, Fokus, Druck |
| *(nicht dabei)* `test/all.js` | 4530 Zeilen; die relevanten Ratschen (P38, Migrationstest) sind in der Inventur zitiert |
| `feldtyp-inventur.txt` | **Fundstellen**: Annahmen mit Datei + Zeile, offene Fragen |

## Der Befund in einem Satz

Die Migration der Einzeiler auf `<input>` ist **fertig**, der Code ist es
**nicht überall** — und die Fehler sind still: `draft-manager` suchte in der
`toggle-fuss`-Migration weiter `[contenteditable]` in `#geschaeftsangaben`,
`some()` war immer `false`, Alt-Entwürfe ohne `toggle-fuss` verloren ihre
Fußzeile. Aufgefallen ist es nur, weil ein Review die Stelle zufällig las.

Belege in `feldtyp-inventur.txt`, Abschnitt B — u. a.:

```
document.js  L673  Paste-Sanitizing nur für closest('[contenteditable]')
                   -> <input> bekommt natives Paste ohne sanitizeRichText
draft-manager L217 Caret-Restore nur für hasAttribute('contenteditable')
sheet-common L403  .single-line[contenteditable]:focus (Klasse noch in Gebrauch?)
base.css     L325  [contenteditable]:empty::before als Platzhalter
```

## Deine Aufgaben

1. **Ist-Matrix.** Für jeden Pfad, der Feldwerte liest/schreibt (collectDraft,
   Restore, Undo, Reset, Import, Caret, Paste, Tastatur, Dirty-Tracking,
   Save-Trigger, Formular-Sync): Behandelt er beide Typen? Beleg mit Datei +
   wörtlichem Zitat. Markiere jede Stelle, die nur einen Typ behandelt.
2. **Stille Ausfälle.** Nenne konkret die Pfade, die bei einem `<input>`
   nichts tun, ohne Fehler und ohne Log (genau die Migrationsklasse). Für jeden:
   Symptom, Auslöser, betroffene Felder.
3. **Sicherheit.** Paste/Clipboard in `<input>`: was kommt durch, was wird
   geprüft? Gibt es einen Pfad, in dem aus dem Clipboard ein Attribut oder
   Markup in ein Feld/Attribut gelangt? Belege oder als **ungeprüft** markieren.
4. **Vertrag.** Formuliere die kleinste Regel, die den Feldtyp an **einer**
   Stelle festlegt (Selektor/API), und sag, was daraus folgt: Wer darf
   `tagName`/`contenteditable` noch direkt prüfen, wer nicht?
5. **Migrationsplan.** Kleinste Schritte, jeder einzeln widerlegbar
   (Datei → Änderung → Messung/Test). Nenne auch, was **bleiben soll**
   (`#text` als Rich-Text, `contenteditable`-Tastaturregeln).
6. **Ratsche.** Welche Tests fehlen, damit die nächste stille Annahme auffällt?
   Formuliere sie so, dass sie ohne Browser laufen (Quelltext-Prüfung) und
   trotzdem den Fehler reproduzieren würden.
7. **Druck und Optik.** Welche CSS-Regeln behandeln nur einen Typ, obwohl sie
   beide meinen (Platzhalter `::placeholder` vs. `::before`, Fokus,
   `font-size: inherit`, Druck transparent)? Beleg mit Selektor + Zitat.

## Form deiner Antwort

- Kurz. Keine Zusammenfassung der Dateien — ich kenne sie.
- Jede Behauptung mit Beleg: Datei + wörtliches Zitat. Ohne Beleg: als
  **ungeprüft** markieren.
- Am Ende drei Blöcke:
  1. **Matrix** (Pfad × Feldtyp × tut/nichts × Beleg),
  2. **Vertrag** (die eine Regel + Folgen),
  3. **Schritte** (nummeriert, je mit Gegenprobe).

## Was du NICHT tun sollst

- Kein Framework, kein Build, keine npm-Abhängigkeit vorschlagen.
- Kein Service Worker (`A37`), kein `text-fit` (`P39`).
- `#text` nicht auf `<input>` umbauen wollen — Rich-Text (fett/kursiv/Zitat)
  ist die bewusste Ausnahme.
- Keine Screenshots als Beweis fordern; Zahlen und Zitate reichen.
- `sheet.css` ist **nicht eingebunden** (kein `<link>`, kein `@import`) — als
  Befund melden, nicht als Quelle behandeln.
- Nichts „nebenbei" refactorn: der Auftrag ist Prüfung, nicht Umbau.
