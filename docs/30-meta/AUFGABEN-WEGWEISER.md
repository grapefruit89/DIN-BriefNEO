---
id: aufgaben-wegweiser
title: 'Aufgaben-Wegweiser — Absicht → Datei → Test → Gate'
type: reference
status: active
created: '2026-11-10'
updated: '2026-11-10'
tags:
  - din-briefneo
  - meta
  - navigation
  - agent
doc_links:
  - '[[AGENTS]]'
  - '[[STRUCTURE]]'
  - '[[ARCHITECTURE-MAP]]'
  - '[[ADR-JS]]'
  - '[[DECISION-LOG]]'
code_links:
  - 'website/js/main.js'
  - 'website/js/document.js'
  - 'test/all.js'
depends_on: []
---

# Aufgaben-Wegweiser

**Zweck:** Ein Agent soll für eine typische Aufgabe nach **1–2 Tool-Calls** die
richtige Datei offen haben. Diese Datei ordnet Absicht zu — keinen Dateibaum,
keine Modulbeschreibung (das leistet [[STRUCTURE]]). Bei Widerspruch gilt der
Code; dann diesen Wegweiser korrigieren.

## 1. Aufgabe → Dateien → Test → Gate

| Aufgabe | Primär lesen | Test (`node tools/test-runner.mjs`) | Gate |
|---|---|---|---|
| Paste, Caret, Zeilenlimit, `contenteditable` | `website/js/document.js`, `website/css/sheet-common.css` | `--filter=DraftManager` | beide |
| Adress-Autocomplete, PLZ, Großkunden | `website/js/address.js`, `website/js/address-data.js` | `--filter="PLZ|Address"` | beide |
| Zwischenablage-Parsing | `website/js/clipboard-parser.js` | `--filter=Clipboard` | test-runner |
| Persistenz, Export/Import, Undo | `website/js/persistence.js`, `website/js/draft-manager.js`, `website/js/binary-storage.js` | `--filter="DraftManager|Import/Export|51-storage"` | beide |
| Form A/B, Mehrseiten, Umbruch | `website/css/sheet.css`, `website/css/sheet-multipage.css`, `website/js/multipage-controller.js`, `website/js/settings.js` | `--filter="Layout|Scrollbars"` (nur indirekt) | beide |
| Anrede, Grußformel, Stil | `website/js/salutation.js` | `--filter=Salutation` | test-runner |
| Telefon/Datum/IBAN/Geld | `website/js/format.js` | `--filter=format` | test-runner |
| Unterschrift, Stempel | `website/js/signature.js`, `website/css/sheet-common.css` | `--filter=Signature` | test-runner |
| Schriften, Font-Upload | `website/js/font-feature.js`, `website/fonts/`, `tools/subset_fonts.py` | `--filter=FontFeature` | test-runner |
| Testbrief-Generator | `website/addons/testbrief/testbrief.js`, `website/addons/testbrief/figuren.json`, `docs/20-implementation/testbrief-generator.md` | `node tools/testbrief-messung.mjs` | Messgate |
| Neue Figur oder Hook | `website/addons/testbrief/figuren.json` | `node tools/testbrief-messung.mjs` | Messgate |
| Seitenleiste, Dialoge, Theme | `website/index.html`, `website/css/sidebar.css`, `website/js/settings.js` | `--filter=SettingsManager` | test-runner |
| Boot, FOUC, Reihenfolge | `website/js/boot.js`, `website/js/main.js` | `--filter="Zero Scrollbars"` (lädt die App) | beide |
| Antipattern-Regel, Gate | `tools/reconciliation.js`, `tools/antipatterns/project.json` | `node tools/reconciliation.js --only-rules` | beide |

## 2. Module in einem Satz

```
website/js/boot.js               FOUC-Guard, blockierend im <head>, VOR dem DOM
website/js/main.js               Orchestrator: bootStep()-Kette, verdrahtet alle Module
website/js/core.js               EventBus + Hinweise + Constants. KEINE Fachlogik.
website/js/document.js           contenteditable, Sanitizer, Caret, Feldlimits, collectDraft()
website/js/persistence.js        localStorage, DIN-Letter-Schema, Metadaten, Export/Import
website/js/draft-manager.js      Autosave, Undo/Redo, Mehr-Tab-Sync, Reset
website/js/address.js            UI-Fassade für Adressen: Vorschlagsliste, Tastatur, Geoapify
website/js/address-data.js       100 % DOM-frei: Offline-Index, Suche, Dekompression
website/js/clipboard-parser.js   Heuristik für unstrukturierte Anschriften (Impressum, CSV)
website/js/salutation.js         Anrede/Grußformel-Engine, Auto-Seed
website/js/field.js             Minimale Feld-Abstraktion (isNative/getValue/setValue)
website/js/format.js             Reine DIN-5008-Formatter + Mikro-Typografie
website/js/signature.js          Unterschrift-Upload, Kompression, Drag/Rotate
website/js/font-feature.js       Font-Presets, Upload, FontFace + IndexedDB
website/js/settings.js           Layout, Theme, Hilfslinien, Plugin-Schalter
website/js/binary-storage.js     Einziger IndexedDB-Speicher (Schrift, Unterschrift)
website/js/multipage-controller.js  CSS-Multicol-Mehrseiten, per import() gemountet
website/js/webapi.d.ts          Ambient-Types (ariaNotify, CloseWatcher) — kein Laufzeitcode
```

## 3. Datenflüsse

```
Autosave:  DOM → collectDraft() → DraftManager.saveDraft() → localStorage('din_draft_current')
                               → Events.DOCUMENT_SAVED
Export:    collectDraft() → buildDinLetterPayload() → buildDINLetterJSON() → JSON-Datei
Import:    parseDinLetterPayload() → applyImportedData() → saveJSON → Reload
Fonts:     Datei-Input → FontFeature.injectFont() → FontFace + document.fonts
                     → saveBlob('font') → IndexedDB
Reset:     resetDraft() → DOCUMENT_CHANGED → Salutation.refresh() → saveDraft() (ein Schreibvorgang)
Undo:      undo() → restoreDraft() → DOCUMENT_CHANGED → Salutation.seedAuto()
```

**Merksatz:** `collectDraft()` ist die einzige Quelle für Export- und Speicherdaten.
Nie direkt aus dem DOM exportieren.

## 4. Fallstricke

- **`docs/STRUCTURE.md` ist nicht veraltet.** `Stand: <hash>` ist ein SHA-256 über den
  Dateirumpf, kein Commit-Hash. Die Reconciliation prüft ihn als `structure-fresh`
  (critical). Nicht „reparieren".
- **`figuren.json` ist Tupel-Schema 2.1** (Arrays, keine Objekte). Die Spalten stehen in
  `_meta.schema`; `hooks` ist der letzte Index.
- **Kein `new Date()`, kein `Date.now()`.** Nur `Temporal` mit `Europe/Berlin` (A48/A50).
- **Keine Demo- oder Beispielknöpfe.** Testbrief- und Mehrseiten-Plugin bleiben
  standardmäßig aktiv.
- **Schriften nur über `tools/subset_fonts.py`** aus dem gitignorierten `Fonts/`.
  Kein manuelles Kopieren nach `website/fonts/`.
- **Antipattern-Ratsche:** `max_violations` in `tools/antipatterns/*.json` ist ein
  Budget. Baseline nur **senken**, nie anheben, um grün zu werden.
- **Tests filtern:** `node tools/test-runner.mjs --filter=<regex>` (Suite: 189 Fälle).
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
erweitert sie. `tools/repo-map-check.mjs` erzwingt, dass alle genannten Pfade
existieren und jedes Modul aus `website/js/` erwähnt ist.
