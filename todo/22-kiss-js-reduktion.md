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

## B5-Audit (2026-11-12)

### Sofort behoben

| Befund | Fix |
|---|---|
| B5-01 `#nameText()` las `textContent` auf einem `<input>` → automatische Anrede fiel still auf die neutrale Form zurück | `Field.getValue()` für Name und Firma. Live belegt: `Herr Max Mustermann` → „Sehr geehrter Herr Mustermann," |
| B5-02 `setCaretCharacterOffset(el, 0)` fokussierte nur | Range am Elementanfang bzw. `setSelectionRange(0,0)` bei nativen Feldern |
| B5-03 Längenlimit griff bei `input[data-atom]` nie (`textContent` leer) | `Field.getValue()` + `setSelectionRange` bei nativen Feldern. Live belegt: 80 Zeichen per JS gesetzt → auf `maxlength` gekürzt |
| B5-09 Abschnittstitel behauptete „DRAFT MANAGER" | richtiggestellt: DRAFT COLLECTION |

### Geprüft und verworfen

| Befund | Warum nicht |
|---|---|
| B5-07 `#seedAuto` ruft `Field.getValue()` vor dem Null-Check | `Field.getValue(null)` gibt `''` zurück (`field.js:16`); beide Elemente sind danach zusätzlich geprüft. Kein Absturz. |
| B5-08 `CLOSINGS`/`FALLBACK` duplizieren `SALUTATION_TONES` | Sie sind **abgeleitet** (`salutation.js:43-53`), nicht kopiert. Kein Drift möglich. |

### Offen — Entscheidung nötig

**K5 — `destroy()` räumt DOM-Listener nicht ab (`UIProtections`, `SalutationFeature`).**
*(entschieden 2026-11-12: **A** — so lassen)*

Beleg: beide werden in `main.js` **genau einmal** erzeugt
(`new UIProtections()` Z. 137, `new SalutationFeature(...)` Z. 161). Es gibt
keinen Re-Init-Pfad im Produktivcode; `destroy()` existiert nur für Tests, die
jeweils eine frische Instanz bauen. Kein Leak erreichbar.

- **A)** so lassen (gewählt)
- **B)** Listener über einen `AbortController` registrieren und in `destroy()` abbrechen (~10 Zeilen je Klasse)

**K6 — `formatLetterDate()` ohne Temporal-Fallback.**
*(entschieden 2026-11-12: **A** — kein Fallback)*

Beleg (im laufenden Browser gemessen): `typeof Temporal === 'object'`,
`typeof Temporal.Now.zonedDateTimeISO === 'function'`. Temporal ist im
Zielbrowser vorhanden; ein Fallback würde zonenloses `Date` einführen, was
`A48`/`A50` verbietet.

`currentISODate()` nutzt ausschließlich `Temporal.Now.zonedDateTimeISO('Europe/Berlin')`;
`formatDatum()` hat dagegen einen Fallback. Ohne Temporal bleibt `#datum` leer.

- **A)** so lassen: Temporal ist Projekt-Baseline (Chrome 150+), und `A48`/`A50` verbieten
  zonenlose `Date`-Pfade — ein Fallback würde genau das wieder einführen
- **B)** Fallback auf `formatDatum()`'s Logik

**K7 — Der echte JS-Hebel bleibt D7** (21 `contenteditable` → `<input>`/`<textarea>`):
`FIELD_MAX_LENGTHS`, `#handleInputLimit` und Teile von `#handleDocumentPaste` würden
weitgehend durch `maxlength` ersetzt. Kein eigener Punkt, nur der Vollständigkeit halber.

---

## B7/B8 — Restentscheidungen (Stand 2026-11-12)

### Erledigt in B8 (`71cfce3`)

| Befund | Was passiert ist |
|---|---|
| B8-01 Init-Fehler dauerhaft gecacht | `#initPromise` wird bei `false` zurückgesetzt; ein späterer Versuch lädt erneut |
| B8-02 unsortierte `plzList` nur geloggt | wird jetzt einmal sortiert (nur im Fehlerfall) + Test 6b über die gelieferten 10184 PLZ |
| B8-04 Font-Input nach Fehlschlag | `target.value = ''` vor dem `return` |
| B8-05 `ae/oe/ue` fanden nichts | Rückfall auf die Umlautform; echte Namen gewinnen (Munster/Münster, Neuenkirchen/Neunkirchen) |
| B8-06 doppelter Button-Zustand | nur noch `data-font-state` |
| B8-07 Preset-CSS dreimal | `#applyPresetCss()` |
| B8-08 Lowercase-Aliase im `ortIndex` | entfernt (wird nur kanonisch gelesen) |
| B8-09 `totalCount` gekappt | zählt jetzt alle Firmen-Treffer |
| B8-10/#12 tote Fallbacks | `plzList`-Ternary und `sortedPlzArray` weg |
| B8-11 leeres `wireDOM()` | bleibt, mit Begründung (Deklarations-Stub für `address.js`) |

### Geprüft und verworfen

| Befund | Warum nicht |
|---|---|
| B8-03 eindeutiger Stadtpräfix → `city_list` statt `city_plzs` | Kein Bug: `berli` liefert `city_list` mit Berlin (284 PLZ); `address.js:404` öffnet beim Klick die PLZ-Liste. Ein Klick mehr, kein Datenverlust. |
| B7-01 „99 Zeilen tote Exporte" | `slugify` und `buildAnschriftLines` werden von `test/all.js` benutzt, `fuelleDemoText` von `main.js`. Nur `erstelleLangenDemoText` + `DEMO_SAETZE` sind ohne Aufrufer. |
| B7-08 toter Default bei `randomBetreff` | Ohne Default ist `szenario` „possibly undefined" (tsc); der Default ist die Absicherung. |

### Offen — Entscheidung nötig

**K12 — B7-04: `SZENARIEN`/`FLOSKELN` nach JSON (M).**
Rund 330 Zeilen Textbausteine stehen als JS-Literale im Modul, obwohl
`figuren.json` das Muster „Daten liegen in JSON" etabliert. `SZENARIEN` enthält
aber **Funktionen** (`betreff`, `text`), keine reinen Strings — JSON braucht
eine Template-Engine (Platzhalter `{{thema}}`, `{{sName}}`, `{{rOrt}}`).

- **A)** so lassen — Text und Logik bleiben an einem Ort, kein Engine-Bau
- **B)** nach JSON + kleine Platzhalter-Ersetzung (M, ~1 Tag inkl. Tests)

**K13 — B7-07: `waehleBesetzung` gibt bei leerem Pool `[]` zurück (S).**
`zufall([])` liefert `undefined`, `fuelleBrief` schreibt dann leere
Empfängerfelder. Der einzige Aufrufer (`wuerfelTestbrief`) prüft vorher
`usableHeroes.length < 5`, die Invariante steht aber nur dort.

- **A)** `null` zurückgeben und den Aufrufer prüfen lassen (API-Änderung, S)
- **B)** so lassen — der Aufrufer ist die einzige Stelle

---

## K14 — Feldtext klippt: Maximallaenge, Marker oder nichts? (offen)

Gemessen 2026-11-12 am laufenden Brief (canvas `measureText` mit der echten
Schrift, Feldbreite aus `getBoundingClientRect`):

| Feld | Breite px | passt mit `i` | mit `R` | realistischer Text | maxlength heute |
|---|---:|---:|---:|---:|---:|
| Betreff | 624 | 140 | 53 | 78 | 140 |
| Anrede / Gruß / Unterschrift | 624 | 200 | 61 | 94 | 70 / 45 / 45 |
| Rücksendezeile | 302 | 97 | 29 | 45 | 120 |
| Empfänger (Name/Straße/Ort) | 302 | 97 | 29 | 45 | 45 |
| Empfänger Firma | 302 | 97 | 29 | 45 | 50 |
| Absender (Name/Straße/Ort/Tel/Mail) | 246 | 78 | 24 | 37 | 50 |
| Datum | 246 | 78 | 24 | 37 | 30 |

Eine feste Zeichenzahl kann „passt" nicht garantieren: die Spanne zwischen
schmalen und breiten Buchstaben ist **2,6×**.

Der exakte Test wäre ein Vergleich (`scrollWidth > clientWidth`) — **A49
verbietet ihn** (HARD BAN: JS-Textfitting/Layout-Polling). Der von A49
vorgeschlagene CSS-Weg trägt in Chrome 156 nicht: `text-fit: shrink 60%` wird
geparst (`CSS.supports` → true), aber nicht angewandt (Schriftgröße bleibt
16 px, Text läuft über) — an `<input>` **und** an `<div>` gemessen.

Optionen:
- **A)** `maxlength` auf den „breite Buchstaben"-Wert senken (Betreff 53,
  Empfänger 29, Absender 24 …). Gesetz-konform, aber harte Deckel.
- **B)** Ausnahme von A49 für EINE Messung pro `input`-Event (kein Polling,
  keine MutationObserver). Braucht Eintrag im DECISION-LOG und eine
  Ausnahme in `tools/antipatterns/project.json`.
- **C)** so lassen: Text klippt still mit Ellipse.

**Entschieden 2026-11-12: B.** Kein Marker, sondern **Sperre**: die Eingabe
wird verworfen, sobald die Feldbreite erreicht ist (`scrollWidth > clientWidth`,
einmal pro `input`). Option A scheidet aus, weil die Spanne 2,6× ist; Option C
schiebt den Text beim Weitertippen aus dem Feld. A49-Ausnahme und Begründung
stehen im `docs/30-meta/DECISION-LOG.md`, die Ausnahme in
`tools/antipatterns/project.json` (P3). Beleg: 200 Anschläge → 54 Zeichen,
`scrollWidth` = `clientWidth` = 624.
