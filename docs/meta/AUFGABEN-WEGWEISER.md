---
id: aufgaben-wegweiser
title: "Aufgaben-Wegweiser — Absicht → Datei → Test → Gate"
type: reference
status: active
created: '2026-11-10'
updated: '2026-11-10'
tags:
  - din-briefneo
  - meta
summary: "Dokumentation und Spezifikation für Aufgaben-Wegweiser — Absicht → Datei → Test → Gate."
doc_links:
code_links:
  - website/js/main.js
  - website/js/document.js
  - test/all.js
depends_on:
sections:
  - 1-aufgabe-dateien-test-gate
  - 1b-immer-zuerst-din-dev
  - 1c-messen-statt-screenshot
  - 2-module-in-einem-satz
  - 3-datenfluesse
  - 4-fallstricke
  - 5-stand-bewusst-fluechtig
  - 6-wenn-die-aufgabe-nicht-in-sektion-1-steht
---
# Aufgaben-Wegweiser

> 🧭 **Kompakter Einstieg (Root-Cockpit):**  
> Für den sofortigen O(1)-Sprung bei Standard-Aufgaben existiert die schlanke [`map.md`](../../map.md) im Projekt-Root (≤ 100 Zeilen).  
> Dieses Dokument dient als vollständige, tiefgehende Referenz für alle Spezialaufgaben.

**Zweck:** Ein Agent soll für eine typische Aufgabe nach **1–2 Tool-Calls** die
richtige Datei offen haben. Diese Datei ordnet Absicht zu — keinen Dateibaum,
keine Modulbeschreibung (das leistet [[STRUCTURE]]). Bei Widerspruch gilt der
Code; dann diesen Wegweiser korrigieren.

## 1. Aufgabe → Dateien → Test → Gate

| Aufgabe | Primär lesen | Test (`node tools/runtime.mjs test`) | Gate |
|---|---|---|---|
| Paste, Caret, Zeilenlimit, `contenteditable` | `website/js/document.js`, `website/css/sheet-common.css` | `--filter=DraftManager` | beide |
| Adress-Autocomplete, PLZ, Großkunden | `website/js/address.js`, `website/js/address-data.js` | `--filter="PLZ|Address"` | beide |
| Persistenz, Export/Import, Undo | `website/js/persistence.js`, `website/js/draft-manager.js`, `website/js/binary-storage.js` | `--filter="DraftManager|Import/Export|51-storage"` | beide |
| Form A/B, Mehrseiten, Umbruch | `website/css/sheet.css`, `website/css/sheet-multipage.css`, `website/js/multipage-controller.js`, `website/js/settings.js` | `--filter="Layout|Scrollbars"` (nur indirekt) | beide |
| Druck-/Layout-Bug (visuell) | `docs/css/ADR-MESS-SCHLEIFE.md`, `website/css/sheet-multipage.css`, `tools/measure.mjs` | `--filter=Druck`, `node tools/measure.mjs pdf --saetze 42` | test-runner |
| Prompt für eine Aufgabe schreiben | `docs/meta/PERFEKTER-PROMPT.md` (Pflichtfelder, Anti-Patterns) | — | — |
| Anrede, Grußformel, Stil | `website/js/salutation.js` | `--filter=Salutation` | test-runner |
| Telefon/Datum/IBAN/Geld | `website/js/format.js` | `--filter=format` | test-runner |
| Unterschrift, Stempel | `website/js/signature.js`, `website/css/sheet-common.css` | `--filter=Signature` | test-runner |
| Schriften, Font-Upload | `website/js/font-feature.js`, `website/fonts/`, `tools/fonts/subset_fonts.py` | `--filter=FontFeature` | test-runner |
| Testbrief-Generator | `website/addons/testbrief/testbrief.js`, `website/addons/testbrief/figuren.json`, `docs/js/testbrief-generator.md` | `node tools/measure.mjs brief` | Messgate |
| Neue Figur oder Hook | `website/addons/testbrief/figuren.json` | `node tools/measure.mjs brief` | Messgate |
| Seitenleiste, Dialoge, Theme | `website/index.html`, `website/css/sidebar.css`, `website/js/settings.js` | `--filter=SettingsManager` | test-runner |
| Addons, Plugins, Erweiterungen | `website/js/addons.js`, `website/addons/` | `--filter="Addon"` | test-runner |
| Agenten, WebMCP, MCP-Bridge | `website/js/webmcp.js`, `website/js/api.js`, `tools/runtime.mjs`, `docs/js/AGENTEN-WEBMCP.md` | `--filter="dinBriefAgent\|WebMCP"`, `node tools/runtime.mjs live --check` | beide |
| Boot, FOUC, Reihenfolge | `website/js/boot.js`, `website/js/boot-state.js`, `website/js/main.js` | `--filter="Zero Scrollbars"` (lädt die App) | beide |
| Dev-Server + Debug-Browser | `tools/dev.sh` (= `din-dev`) | `din-dev --status`, Tabs via CDP `:9222` | — |
| Messen am Bildschirm (ohne Bild) | `tools/measure.mjs` | `node tools/measure.mjs sheet` | — |
| Messen im Druck (ohne PDF) | `tools/measure.mjs` | `node tools/measure.mjs print [url] [breite]` | — |
| Antipattern-Regel, Gate | `tools/fitness.mjs`, `tools/antipatterns/project.json` | `node tools/fitness.mjs --only-rules` | beide |
| contenteditable-Feld migrieren | `docs/js/ADR-CONTENTEDITABLE-MIGRATION.md` (13 Fallstricke), `website/js/field.js` | `--filter="Anlagen-Migration|Field"` | test-runner |

## 1b. Immer zuerst: `din-dev`

Ein Aufruf räumt auf und startet beides neu — **das ist der Standardweg**, nicht
`node tools/runtime.mjs serve` von Hand:

```
din-dev                 # [0] alte Instanzen weg  [1] Server  [2] Debug-Browser (CDP 9222)
din-dev stop            # nur stoppen
din-dev status          # Ports + offene Tabs
din-dev mess [id ...]   # Messwerte, eine Zeile JSON in mm
din-dev mess --print    # dasselbe in Druck-Emulation
din-dev key             # Geoapify-Key aus ~/.secrets/geoapify in den Browser
din-dev help            # alles im Kopf, inkl. MCP-Aufruf
```

Warum: ein alter Server auf Port 8088 liefert sonst einen veralteten Stand
(ES-Module ohne Version), und ein Browser **ohne** `--remote-debugging-port`
kann nicht nachgemessen werden. `din-dev` benutzt ein eigenes Profil
(`~/.local/share/din-briefneo/debug-profil`) und fasst den normalen
Alltags-Browser nicht an — es sterben nur Prozesse mit diesem Profil und die
eigenen Dev-Server-Instanzen.

## 1c. Messen statt Screenshot

Ein Screenshot kostet Bild-Token und liefert **keine Zahl**. Für Geometrie,
Verschiebungen und Überlauf reicht ein Aufruf, der Millimeter zurückgibt:

```
din-dev mess betreff anrede
  → {"b":[297,null],"f":{"betreff":[86.2,5.9,1],"anrede":[100.5,5.2,1]}}
     b = [Blatthöhe_mm, data-ueberlauf], f = { id: [y_mm, h_mm, sichtbar] }

din-dev mess --print            # Druck-Emulation (eigener headless-Browser)

Im Chat alternativ über den MCP:
evaluate_script({ sourcePath: ".../tools/measure/inpage.js", format: "function", pageId: 1 })
```

Andere Felder: vorher `window.__messIds = ['id1','id2']` setzen. Bild nur, wenn
es wirklich um Optik geht — dann `take_screenshot` mit `uid` (Element) statt
`fullPage`.

## 2. Module in einem Satz

```
website/js/boot.js               FOUC-Guard, blockierend im <head>, VOR dem DOM
website/js/boot-state.js         UI-Zustand (Form, Postvermerk) am Body-Ende, VOR dem ersten Paint
website/js/main.js               Orchestrator: bootStep()-Kette, verdrahtet alle Module
website/js/core.js               EventBus + Hinweise + Constants. KEINE Fachlogik.
website/js/schema.js             Kanonische Feld-Reihenfolge (Schema v5), reine Daten
website/js/draft-model.js        Gemeinsamer Feld-Kern: Selektor, Sanitizer, istAn, ein Wert-Schreiber
website/js/state.js              Briefzustand im RAM (werte/meta/rev/ids) + Patch-API
website/js/state-binding.js      Naht DOM↔Zustand: input/change-Listener, render(), Echo-Regel
website/js/document.js           contenteditable, Sanitizer, Caret, Feldlimits, collectDraft()
website/js/persistence.js        localStorage, DIN-Letter-Schema, Metadaten, Export/Import
website/js/draft-manager.js      Autosave, Undo/Redo, Mehr-Tab-Sync, Reset
website/js/address.js            UI-Fassade für Adressen: Vorschlagsliste, Tastatur, Geoapify
website/js/address-data.js       100 % DOM-frei: Offline-Index, Suche, Dekompression
website/js/salutation.js         Anrede/Grußformel-Engine, Auto-Seed
website/js/field.js             Minimale Feld-Abstraktion (isNative/getValue/setValue)
website/js/suggestion-list.js   Gemeinsames Gerüst für Vorschlagslisten (Klick, Tasten, Blur)
website/js/geo-cache.js         Ringspeicher für Geoapify-Treffer (1 MB, localStorage)
website/js/debug-panel.js       Selbstauskunft (Schalter „Debug-Panel“ in den Einstellungen)
website/js/ansicht.js           Benutzer-Anzeige: Blatt-Zoom, Nachtpalette (gespeichert in din_settings)
website/js/geo-cache.js         Ringspeicher (1 MB, LFU) — Review: docs/meta/REVIEW-anrede-dropdown.md
website/js/api.js             window.dinApi: Brief-Schnittstelle für Agenten (lesen/setzen/anrede/adresse/datum/export)
website/js/webmcp.js          Agenten-Werkzeuge: WebMCP-Registrierung + window.dinBriefAgent (Vertrag für tools/runtime.mjs live)
website/js/live-bridge.js     Agenten-Kanal ohne Debug-Port: Seite wählt sich per #agent=<token> bei tools/runtime.mjs live ein (SSE)
website/js/date-picker.js      Kalender-Popover für #datum (Temporal, deutsche Langform, Monatsansicht, Heute)
website/js/log.js               Ringpuffer der letzten 50 Fehler/Warnungen (Debug-Panel)
website/js/format.js             Reine DIN-5008-Formatter + Mikro-Typografie
website/js/signature.js          Unterschrift-Upload, Kompression, Drag/Rotate
website/js/font-feature.js       Font-Presets, Upload, FontFace + IndexedDB
website/js/settings.js           Layout, Theme, Hilfslinien, Plugin-Schalter
website/js/binary-storage.js     Einziger IndexedDB-Speicher (Schrift, Unterschrift)
website/js/multipage-controller.js  CSS-Multicol-Mehrseiten, per import() gemountet
website/js/addons.js                Addon-Manager & Plugin-Punkt (B52), laedt Erweiterungen on-demand
website/js/webapi.d.ts          Ambient-Types (ariaNotify, CloseWatcher) — kein Laufzeitcode
```

## 3. Datenflüsse

```
Autosave:  input/change → state-binding.commit() → letterState → DraftManager.saveDraft()
                       → toWire(letterState) → localStorage('din_draft_current')
                       → Events.DOCUMENT_SAVED
Export:    toWire(letterState) → buildDinLetterPayload() → buildDINLetterJSON() → JSON-Datei
Import:    parseDinLetterPayload() → applyImportedData() → saveJSON-Gate
                       → applyState() (RAM + DOM, OHNE Reload)
Fonts:     Datei-Input → FontFeature.injectFont() → FontFace + document.fonts
                     → saveBlob('font') → IndexedDB
Reset:     resetDraft() → DOCUMENT_CHANGED → Salutation.refresh() → saveDraft() (ein Schreibvorgang)
Undo:      undo() → restoreDraft() → DOCUMENT_CHANGED → Salutation.seedAuto()
```

**Merksatz:** `letterState` ist die einzige Quelle für Speicher- und Exportdaten;
der DOM ist seine Projektion. `collectDraft()` ist kein Speicherpfad mehr, sondern
Drift-Wächter (Tests) und Grundlage des Kaltstart-Restores.

## 4. Fallstricke

- **`docs/STRUCTURE.md` ist nicht veraltet.** `Stand: <hash>` ist ein SHA-256 über den
  Dateirumpf, kein Commit-Hash. Die Reconciliation prüft ihn als `structure-fresh`
  (critical). Nicht „reparieren".
- **`figuren.json` ist Tupel-Schema 2.1** (Arrays, keine Objekte). Die Spalten stehen in
  `_meta.schema`; `hooks` ist der letzte Index.
- **Kein `new Date()`, kein `Date.now()`.** Nur `Temporal` mit `Europe/Berlin` (A48/A50).
- **Keine Demo- oder Beispielknöpfe.** Testbrief- und Mehrseiten-Plugin bleiben
  standardmäßig aktiv.
- **Schriften nur über `fonts/subset_fonts.py`** aus dem gitignorierten `fonts/`.
  Kein manuelles Kopieren nach `website/fonts/`.
- **Antipattern-Ratsche:** `max_violations` in `tools/antipatterns/*.json` ist ein
  Budget. Baseline nur **senken**, nie anheben, um grün zu werden.
- **contenteditable-Migration:** Lies
  `docs/js/ADR-CONTENTEDITABLE-MIGRATION.md` vor dem ersten Feld.
  13 Fallstricke, die der Anlagen-Pilot aufgedeckt hat. Die Ratsche `P38` meldet
  jedes einzeilige `contenteditable` als `warning` (kein Gate, nur Sichtbarkeit).
- **Tests filtern:** `node tools/runtime.mjs test --filter=<regex>` (Suite: 430 Fälle).
- **Visuelle Bugs (Druck, Layout, Umbruch):** Lies
  `docs/css/ADR-MESS-SCHLEIFE.md`. Heatmap als Prozess (wo ist der
  Unterschied?), `pdftotext -bbox` in Millimetern als Messmethode, Wort-Kollision
  und Anker-Verschiebung als Diagnose, Mechanismus statt Symptom als Fix.
  Rot-Nachweis ist Pflicht. Die Print-Emulation liefert nur Hinweise, das PDF
  ist die Wahrheit.
- **Die Briefansicht nicht ausblenden.** Das Pop-in-Fenster ist 8–20 ms; ein Gate
  würde ~160 ms Unsichtbarkeit und einen Fail-closed-Zustand erzeugen.
- **`website/` ist hermetisch** (A45): kein Pfad darf aus dem Ordner herausführen.

## 5. Stand (bewusst flüchtig)

**Nach jedem größeren Batch nachziehen** — Datum, Testzahl, Regelzahl, Fitness.

```text
2026-11-10 (zuletzt gepflegt)
Testsuite:        222 Fälle
Antipattern:      48 Regeln (4 base + 7 web + 37 project), Ratsche aktiv
Fitness:          100.0 % (clean)
Figurenkatalog:   297 Figuren, 729 Hooks, Tupel-Schema 2.1
Schriften:        Aptos, Inter 18pt (regular/bold), Michelangelus als WOFF2 gebündelt
Stillgelegt:      Einzelseiten-Modus — website/css/sheet.css ungenutzt
                  (ADR-EINSEITEN-STILLGELEGT)
```

## 6. Wenn die Aufgabe nicht in Sektion 1 steht

1. Grep/LS machen, Datei finden, Aufgabe lösen.
2. **Vor dem Commit:** neuen Eintrag in Sektion 1 ergänzen (mit Testfilter und Gate).
3. Neue Kategorie? Sektion 2 prüfen und das Modul ergänzen.

Das ist der einzige Mechanismus, der diese Tabelle aktuell hält: Wer sie benutzt,
erweitert sie. `tools/fitness.mjs repo-map` erzwingt, dass alle genannten Pfade
existieren und jedes Modul aus `website/js/` erwähnt ist.
