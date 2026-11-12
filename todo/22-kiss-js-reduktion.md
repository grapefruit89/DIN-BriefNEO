# 22 — KISS/JS-Reduktion: geprüfte Vorschläge, offene Entscheidungen

Belegt am Code (2026-11-12). Hier steht nur, was **nicht** sofort umgesetzt wurde,
weil es ein Umbau ist oder eine Entscheidung braucht. Erledigtes steht im Chat
bzw. in den Commits.

## Sofort behoben (nicht hier)

| Befund | Wo |
|---|---|
| B4-O1: `saveState` und `data-state` liefen auseinander (fremder Speicherfehler setzte nur die Anzeige) | `draft-manager.js`, Abo auf `DOCUMENT_SAVE_FAILED` |
| B4-01/02/03/09: Serialisierungsfehler schrieb `{}`, Undo-Historie überlebte fremden Entwurf, `saveJSON`-Fehler unsichtbar | `draft-manager.js` |
| B3-01/03: eigene Ziel-Sperre gelöscht, überholte Suchantwort gerendert | `address.js` |
| B3-02 (E1): Herkunft `auto/manuell` reist im Entwurf | `document.js`, `draft-manager.js`, `address.js` |

## Geprüft und verworfen (kein Umbau, kein Nutzen)

| Vorschlag | Warum nicht |
|---|---|
| „`prefers-reduced-motion` in `address.js` per CSS ersetzen" | Steht in `clipboard-parser.js:504`, nicht in `address.js`. Und der Vorschlag ist falsch: `animation: none` aus `base.css:27` stoppt **keine** WAAPI-Animation (`element.animate()`), deshalb ist die JS-Abfrage Pflicht. |
| „Typ-Klammern `[Kunde]` per `::before/::after`" | Kosmetik in CSS, dafür verliert der Badge seinen Textknoten (Selektion, Vorlesen unsicher). Kein Gewinn. |
| „`Field` auf freie Funktionen verkleinern" | 8 Verbraucher, 3 Importstellen; netto ±0 Zeilen. |
| „EventBus auf 15 Zeilen" | Prefix-Prüfung, `Object.freeze`, Rückgabe-Unsubscribe sind der Wert; 8 Consumer müssten mit. |
| „`data-plugin-multipage` ins Markup" | Wird an zwei Stellen gesetzt, ein Test hält die Invariante fest (`test/all.js:3253`). |
| „Status-Label per `::after`" | `title` bleibt JS → 2 Zeilen gespart, Text nicht mehr markierbar, Live-Region unsicher. |
| „`asBool` inline" | Dupliziert eine Drei-Zustands-Regel an zwei Stellen. |

## Offen — Entscheidung nötig

### Entschieden 2026-11-12

| | Entscheidung | Begründung |
|---|---|---|
| **K1** | **A — bleibt** (`window.innerWidth`, 8/12) | Kein Bug, kein Gewinn durch Verschieben nach CSS; der Breakpoint ist ein echter UX-Wert |
| **K2** | **A — `persistence.js` bleibt eine Datei** | 6 Module importieren daraus (font-feature, main, settings, address, draft-manager, salutation). Teilen hieße 7 Dateien anfassen für 0 Funktionsgewinn — Zerfaserung ohne Nutzen |
| **K3** | **A — Markup bleibt im JS** | `renderUniversalSuggestions` 111 Z., `renderSuggestions` 47 Z.; ein Template ersetzt nur die Element-Erzeugung (real ~25–40 Z.), nicht Filter, ARIA und Handler — bei zwei Renderern, die parallel gepflegt werden müssten |

**K1 — Vorschlagsliste: Anzahl im JS oder im CSS?** *(entschieden: A)*

Heute: `maxSuggestions()` liest `window.innerWidth` und liefert 8 oder 12
(`address.js:142`, drei Aufrufstellen). Das ist eine Layout-Entscheidung im JS.

- **A)** so lassen (0 Zeilen, funktioniert, kein Resize-Handler)
- **B)** fester Wert (15) + `max-height`/`overflow-y` im Popover, CSS kürzt (~6 Zeilen weniger, etwas mehr DOM-Knoten)

**K4 — Export-Format: Objekt statt Tuple (Schema v6)?** *(offen, entschieden: A jetzt, C wenn das Format angefasst wird; B verworfen)*

Heute: `_meta.schema` trägt die Spaltennamen, `fields` die Werte in
kanonischer Reihenfolge. Die Reihenfolge-Prüfung (`persistence.js:546`,
Regel P4 / 2026-11-10) existiert nur, weil die Position Bedeutung trägt.

**C** heißt konkret:

```json
{ "format": "dinletter", "schema_version": 6, "app": "...", "created": "...",
  "fields": { "betreff": "...", "anrede": "...", "empfaenger-ort": "..." },
  "layout": { "form": "form-b", "copyfit": false, "marks": true },
  "signature": { "transform": { "x": 0, "y": 0, "scale": 1, "rot": 0 } } }
```

| | Wirkung |
|---|---|
| Feldbedeutung | am **Namen**, nicht an der Position → Falschzuordnung strukturell unmöglich |
| P4-Reihenfolge-Prüfung | entfällt (−15 Zeilen) |
| Feld hinzufügen | additiv: unbekannte Felder ignorieren (Warnung), fehlende auf Default |
| Dateigröße | +525 Zeichen (33 Feldnamen von 360 Zeichen) — bei ~5 KB Brief ≈ 10 % |
| Alte Dateien | v5 wird abgewiesen — Projektregel „keine Abwärtskompatibilität", keine Migration |

**B** (Tuple behalten, Import ordnet über die Namen zu) löst beides halb und
wird nicht verfolgt.

Auslöser für C: sobald das Export-Format ohnehin angefasst wird. **Dann gehört
der Beschluss in den `DECISION-LOG`** (append-only), nicht nur hierher — sonst
steht die Regel implizit im Code.

**K2 — `persistence.js` aufteilen?** *(entschieden: A — bleibt eine Datei)*

Was „teilen" konkret hieße: `storage.js` (load/save/loadJSON/saveJSON/remove),
`print-metadata.js` (MetadataService, Print-Titel), `dinletter-io.js`
(build/parse/apply, Datei-Picker). Sechs Importeure müssten ihre Import-Zeilen
ändern, das Testfile ebenfalls.

849 Zeilen, 22 Exporte, fünf Verantwortungen: Storage, Metadaten/Print,
Import, Export, Draft-Collector. Kein Fehler, aber der breiteste Punkt im Repo.

- **A)** so lassen (0)
- **B)** in `storage.js` / `print-metadata.js` / `dinletter-io.js` teilen (M, ~1 Tag mit Tests) — **erst nach D7**, weil dieselben Dateien dann ohnehin angefasst werden

**K3 — Vorschlags-Markup in `<template>`?**

`renderUniversalSuggestions` und `renderSuggestions` bauen je Vorschlag 3–5
`<span>` per `createElement` (zusammen ~90 Zeilen).

- **A)** so lassen (0)
- **B)** ein `<template id="tpl-suggestion">` + `cloneNode`, beide Renderer darauf (M, ~50 Zeilen weniger, Markup wird testbar)

## Dokumentiert, nicht angefasst

- **B4-O2**: `error` in den Import-Rückgaben ist überall identisch mit `reason` und wird von niemandem gelesen (18 Stellen). Entfernen beim nächsten Anfassen des Import-Pfads.
- **B4-O6**: `schemaVersion` im Rückgabeobjekt von `parseDinLetterPayload` hat keinen Leser.
- **B4-O3**: Print-Kontext-Stack (`printContextStack`) in `persistence.js` ist für `beforeprint`/`afterprint` gebaut, die Browser nicht verschachteln. Vereinfachen = Verhaltensänderung, kein Nutzen.
- **B4-O5**: Export ist ein Tuple-Format (`_meta.schema` = Spaltennamen, `fields` = Werte in kanonischer Reihenfolge). Die Reihenfolge-Prüfung ist **Absicht** (P4, 2026-11-10: verhindert stille Fehlzuordnung). Ein Key-Value-Format wäre Schema **v6** — Entscheidung dort, nicht hier.
- **B3-F4**: kein `online`-Listener — nach Offline-Rückkehr startet die Suche erst beim nächsten Tastendruck. Feature, kein Bug.
- **B3-Punkt 5** (Leerzeichen als Textknoten, `address.js:436`): `.suggestion-main` ist `inline-flex` mit `gap: 6px`, der Textknoten erzeugt ein zusätzliches Flex-Item. Entfernen ändert den Abstand sichtbar → nur mit Messung.
- **`clipboard-parser.js:75`**: „95%-KISS" ist eine Scope-Entscheidung (DECISION-LOG 2026-10-06), keine Trefferquote. Umformulieren, wenn die Datei ohnehin dran ist.
