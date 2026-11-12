# DIN-BriefNEO — Modul-Architektur & Codebase-Landkarte (`website/js/`)

> **Stand:** 09. November 2026  
> **Umfang:** 16 Dateien, 6.922 Zeilen JavaScript / TypeScript-Definitionen  
> **Plattform:** Reines natives Chromium 150+ Baseline (Zero-Polyfill, Zero-Dependency, ES Modules)

---

## 1. Modul-Übersicht & Metriken

| Datei | Zeilen | Typ | Primäre Verantwortung | Abhängigkeiten (Imports) |
|---|:---:|---|---|---|
| [`boot.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/boot.js) | 67 | Script / Head | FOUC-Schutz, Pre-Paint-Theme & Font-Initialisierung | *keine* (synchron vor DOM) |
| [`boot-state.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/boot-state.js) | 67 | Script / Body | Setzt den gespeicherten UI-Zustand (Form, Postvermerk, Schalter) vor dem ersten Paint | *keine* (synchron, liest localStorage) |
| [`webapi.d.ts`](file:///home/moritz/repos/DIN-BriefNEO/website/js/webapi.d.ts) | 47 | Typisierung | Ambient Types für Bleeding-Edge-APIs (`Temporal`, `ariaNotify`) | *keine* |
| [`binary-storage.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/binary-storage.js) | 129 | Service | IndexedDB-Speicher für Blobs (Custom Fonts, Unterschriften) | *keine* (autark) |
| [`multipage-controller.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/multipage-controller.js) | 149 | Layout-Engine | Mehrseiten-Brief (CSSStyleSheet-Injektion, Folgeköpfe) | *keine* (DOM/CSSOM) |
| [`core.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/core.js) | 266 | Foundation | EventBus (`Events`), Popover-Toast-System (`#hinweis-v4`), Guards | *keine* (autark) |
| [`font-feature.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/font-feature.js) | 283 | Feature | Preset-Auswahl, Custom-Font-Upload (WOFF2/TTF/OTF), CSS Font Loading API | `binary-storage`, `core`, `persistence` |
| [`signature.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/signature.js) | 310 | Feature | Unterschrift & Stempel (Upload, Canvas-Kompression, Drag/Rotate) | `binary-storage`, `core` |
| [`settings.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/settings.js) | 324 | Feature / UI | Einstellungs-Panel, Form A/B, Theme-Switch, Quota-Visualisierung | `core`, `persistence`, `font-feature` |
| [`main.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/main.js) | 334 | Orchestrator | App-Bootstrapper, Verdrahtung aller Manager & Listener | `core`, `settings`, `draft`, `address`, `signature`, `font-feature` |
| [`salutation.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/salutation.js) | 344 | Domain / Feature | KISS-Anrede-Engine (DIN 5008 Fallback, Titel, Partikel, Auto-Seed) | `core`, `persistence` |
| [`format.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/format.js) | 407 | Domain / Pure | Normative DIN-5008-Formatierer (Datum, Uhrzeit, IBAN, Telefon, Geld) | *keine* (zustandslos) |
| [`draft-manager.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/draft-manager.js) | 424 | Controller | Autosave-Lifecycle, Undo/Redo-Stack, Snapshot-Historie | `core`, `document`, `persistence` |
| [`clipboard-parser.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/clipboard-parser.js) | 613 | Domain / Feature | Heuristischer Impressum- & Zwischenablage-Parser mit Badges | `address-data`, `address`, `core` |
| [`document.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/document.js) | 636 | DOM-Utils | Sanitizer, Caret-Berechnung, Tastatur-Schutz (`UIProtections`) | `format` |
| [`persistence.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/persistence.js) | 742 | Storage-Hub | LocalStorage IO, DINLetter JSON-Payload Schema, Temporal-Datum | `core` |
| [`address-data.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/address-data.js) | 918 | Domain / Pure | Autarke Offline-Suche, Decompression, Columnar Binary Search, Grosskunden | *keine* (100 % DOM-frei) |
| [`address.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/address.js) | 976 | Domain / UI | Autocomplete-Popover UI, Tastatur-Pfeilnavigation, Re-Export-Fassade | `address-data`, `core`, `document`, `persistence` |

---

## 2. Architektur-Schichtenmodell

Die Module folgen einem hierarchischen Schichtenmodell (von unbeeinflussten Grundbausteinen bis zur UI-Verdrahtung):

```
┌────────────────────────────────────────────────────────────────────────┐
│ Layer 4: Orchestrierung                                                │
│   main.js (Bootstrapper, Event-Binding, Lifecycle)                    │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────────────────────┐
│ Layer 3: Feature-Controller & UI-Panels                                │
│   settings.js · font-feature.js · signature.js                         │
│   multipage-controller.js · draft-manager.js · clipboard-parser.js     │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────────────────────┐
│ Layer 2: Fachlogik & Domänen-Engines                                   │
│   address.js (UI-Fassade & Autocomplete) · salutation.js (KISS)        │
│   document.js (UIProtections, Caret, Sanitizer)                        │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────────────────────┐
│ Layer 1: Persistenz & Daten-Hub                                        │
│   persistence.js (LocalStorage, DINLetter JSON)                        │
│   binary-storage.js (IndexedDB Fonts & Blobs)                          │
│   address-data.js (Autarke Adressdaten, Indizes & Binary-Search)       │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────────────────────┐
│ Layer 0: Fundament & zustandslose Werkzeuge                            │
│   core.js (EventBus, Popover-Toasts, Constants)                        │
│   format.js (Pure DIN-5008 Formatters) · boot.js/boot-state.js (FOUC) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detail-Analyse der Dateien

### 3.1 Fundament & Basisdienste (Layer 0 & 1)

#### [`core.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/core.js) (267 Zeilen)
* **Zweck:** Rückgrat der losen Kopplung und Benachrichtigungen.
* **Exports:** `eventBus`, `createEventBus()`, `Events`, `Constants`, `initToastSystem()`, `showToast()`, `notify()`, `showPopoverSafe()`, `hidePopoverSafe()`.
* **Details:**
  - Standardisierter Event-Namespace `dinbrief:*` (z. B. `NOTIFICATION_REQUESTED`, `DOCUMENT_SAVED`, `DOCUMENT_CHANGED`).
  - Native Toast-Verwaltung über die Popover-API (`#hinweis-v4`) ohne externe Bibliotheken.
  - Sichere Popover-Transitionen mit `try/catch`-Guards (`showPopoverSafe`/`hidePopoverSafe`).

#### [`format.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/format.js) (446 Zeilen)
* **Zweck:** Zustandsloses, normgerechtes Parsen und Formatieren nach DIN 5008.
* **Exports:** `formatTelefonnummer()`, `formatDatum()`, `formatUhrzeit()`, `formatIban()`, `formatPostfach()`, `formatGeldbetrag()`, `applyLetterDate()`, `applyMicroTypography()`.
* **Details:**
  - 100 % reine Funktionen ohne Seiteneffekte, kein DOM-Zugriff.
  - Nutzt `Intl.DateTimeFormat`, `Intl.NumberFormat` und `Temporal.PlainDate`.
  - Vorwahlen-Formatierung ohne fehleranfällige Raten-Heuristiken.

#### [`binary-storage.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/binary-storage.js) (130 Zeilen)
* **Zweck:** Asynchroner Binärspeicher im Browser via IndexedDB (`din_brief_binary_db`).
* **Exports:** `saveBlob()`, `loadBlob()`, `deleteBlob()`.
* **Details:**
  - Speichert Custom Fonts (`.woff2`) und Unterschriftsbilder isoliert von `localStorage`.
  - Multi-Tab-sicher via `onversionchange`-Handshake und Transaktions-Abort-Absicherung (`tx.onabort`).

#### [`persistence.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/persistence.js) (758 Zeilen)
* **Zweck:** Textuelle Persistenz in `localStorage`, Schema-Serialisierung und Dateitransfer.
* **Exports:** `loadJSON()`, `saveJSON()`, `buildDinLetterPayload()`, `parseDinLetterPayload()`, `buildDINLetterJSON()`, `registerDraftCollector()`, `initImportExport()`, `applyLetterDate()`, `applyImportedData()`.
* **Details:**
  - Standardisiertes `application/vnd.din-brief+json` Austauschformat.
  - Registry-Pattern für Draft-Kollektoren (`registerDraftCollector`).
  - Native Temporal-API für deterministische ISO-Zeitstempel.

---

### 3.2 Fach- & Text-Engines (Layer 2)

#### [`salutation.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/salutation.js) (345 Zeilen)
* **Zweck:** Automatische Ableitung von Anrede und Grußformel.
* **Exports:** `deriveSalutation()`, `SalutationEngine`, `SalutationFeature`, `SALUTATION_TONES`.
* **Details:**
  - KISS-Architektur: Reines Regelwerk ohne Regex-Overengineering.
  - Strikter DIN-5008-Fallback: Fehlt `Herr`/`Frau`, wird neutral angesprochen (`Sehr geehrte Damen und Herren,`).
  - Erkennt Namenspartikel (`von`, `van der`), dreht Komma-Notation (`Müller, Hans`) und übernimmt akademische Grade (`Dr.`, `Prof.`).
  - Synchronisiert `dataset.dirty` sauber nach Undo/Redo-Aktionen.

#### [`document.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/document.js) (680 Zeilen)
* **Zweck:** DOM-Operationen im Briefblatt, Rich-Text-Schutz, Caret-Steuerung und Mikro-Typografie.
* **Exports:** `UIProtections`, `formatElementMicroTypography()`, `sanitizeRichText()`, `getCaretCharacterOffset()`, `setCaretCharacterOffset()`, `setCaretToEnd()`, `collectDraft()`.
* **Details:**
  - Verhindert das Einschleusen von Formatierungs-Müll beim Pasten (`text/plain` Injection via Range-API).
  - Verhindert versehentliches Löschen von Pflicht-Elementen (Backspace-Guards).
  - Berechnet pixelgenaue Caret-Offsets in verschachtelten DOM-Knoten.

#### [`address-data.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/address-data.js) (918 Zeilen)
* **Zweck:** Autarke In-Memory-Adressdaten, Gzip-Dekomprimierung, Prefix- und Firmen-Indizes sowie Binary Search.
* **Exports:** `AddressIntelligence` (Core Engine), `AddressData` (unveränderliche Fassade), `resolvePostcode()`, `resolveCity()`, `normalizePostcode()`, `getDistrict()`, `buildOrtIndex()`, `buildFirmenIndex()`, `lowerBound()`, `normalizeText()`, `fetchGzipJson()`, `BUNDESLAENDER`.
* **Details:**
  - 100 % DOM-frei, importiert keine externen Module (autarkes Blattmodul).
  - Lädt und dekomprimiert `orte.json.gz` und `grosskunden.json.gz` via nativer `DecompressionStream('gzip')`-API.
  - Führt Binary-Search (`lowerBound`) direkt auf columnar sortierten Arrays aus (< 5 ms Reaktionszeit).
  - Web-Worker- und Node.js-fähig ohne Mocks.

#### [`address.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/address.js) (976 Zeilen)
* **Zweck:** DOM-Verdrahtung, Autocomplete-Popover (`#plz-suggestions-popover`), Tastaturnavigation und Re-Export-Fassade.
* **Exports:** Re-exportiert alle Datensymbole aus `address-data.js` (100 % rückwärtskompatibel) plus `initSenderSync()`, `bindListSelection()`, `wireUniversalInput()`, `renderUniversalSuggestions()`.
* **Details:**
  - Schützt State-Leaks durch gezielten `targetLock`-Reset.
  - Verwaltet Tastatur-Pfeilnavigation, `aria-expanded`/`aria-activedescendant` und Popover-Positionierung.
  - Synchronisiert Absenderdaten bei Bedarf (`initSenderSync`).

#### [`clipboard-parser.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/clipboard-parser.js) (613 Zeilen)
* **Zweck:** Intelligentes Auslesen unstrukturierter Adressen aus Web-Impressen oder E-Mail-Signaturen.
* **Exports:** `ClipboardAddressParser`.
* **Details:**
  - Filtert juristische Stoppwörter (Registergericht, HRB, USt-IdNr, Geschäftsführer, Disclaimer).
  - Importiert `AddressData`, `AddressIntelligence` und `normalizeText` direkt aus `address-data.js`.
  - Rendert Konfidenz-Badges (`verifiziert` vs. `nicht verifiziert`) im UI.

---

### 3.3 UI-Controller & Layout (Layer 3 & 4)

#### [`multipage-controller.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/multipage-controller.js) (126 Zeilen)
* **Zweck:** Verwaltung von Folgeseiten und normgerechten Folgeköpfen (DIN 5008 Form A/B).
* **Exports:** `mountMultipage()` — einmaliger Mount, kein Teardown (ADR-EINSEITEN-STILLGELEGT).
* **Details:**
  - Injiziert dynamische CSS-Regeln via einmalig instanziiertes `CSSStyleSheet` (`replaceSync`).
  - Arbeitet mit CSS Custom Properties (`--i`, `--seite`, `--luecke`) statt inline JS-Top-Styles.
  - Schaltet den Klassen-Status `is-multipage` auf dem Dokument um.

#### [`draft-manager.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/draft-manager.js) (422 Zeilen)
* **Zweck:** Undo/Redo-Verwaltung und automatisches Zwischenspeichern.
* **Exports:** `DraftManager`.
* **Details:**
  - Hält Snapshot-Stack im Speicher; vermeidet redundante `JSON.stringify`-Aufrufe.
  - Debounced Auto-Save auf Inaktivität (500 ms) via EventBus.
  - Informiert Screenreader per nativer `Document.ariaNotify`-API.

#### [`settings.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/settings.js) (324 Zeilen)
* **Zweck:** Steuerung der Seitenleiste und Benutzerkonfiguration (Layout, Theme, Hilfslinien, Plugins).
* **Exports:** `SettingsManager`, `FONT_PRESETS` (Re-Export).
* **Details:**
  - Umschaltung Brief-Layout (Form A vs. Form B).
  - Theme-Auswahl (`light`, `dark`, `auto`) mit Crossfade.
  - Visualisierung der `navigator.storage.estimate()` Speichernutzung.
  - Reine synchrone Settings-Verwaltung ohne Blob- oder Font-Abhängigkeiten.

#### [`font-feature.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/font-feature.js) (283 Zeilen)
* **Zweck:** Preset-Auswahl, Custom-Font-Upload (WOFF2/TTF/OTF), CSS Font Loading API Injection und Persistenz.
* **Exports:** `FontFeature`, `FONT_PRESETS`.
* **Details:**
  - 4 Presets: `default`, `inter`, `aptos`, `michelangelus`.
  - Native CSS Font Loading API: `FontFace`, `document.fonts.add()`, sauberes Entladen via `document.fonts.delete()`.
  - 2-Zustände-Button mit View Transitions und 400-KB-Validierung.
  - Speichert Custom-Font-Blob in IndexedDB (`binary-storage.js`).

#### [`signature.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/signature.js) (310 Zeilen)
* **Zweck:** Einbindung und Ausrichtung von Unterschrifts- und Stempelbildern.
* **Exports:** `SignatureFeature`.
* **Details:**
  - Drag-, Rotate- und Resize-Steuerung über Transformationsgriffe.
  - Performance-Optimierung: Cached BoundingClientRect beim PointerDown statt Move-Pixel-Flooding.
  - Speichert komprimierte Bilddaten als Blob im `binary-storage`.

#### [`main.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/main.js) (334 Zeilen)
* **Zweck:** Zentrale Initialisierung der Gesamtanwendung.
* **Details:**
  - Instanziiert alle Controller, bindet Druck- und Reset-Dialoge.
  - Verwaltet Shortcuts (`Strg+Z`, `Strg+Y`, `Strg+P`, `Strg+S`).
  - Hält In-Memory-Flags für den Session-Status (keine synchronen Storage-Reads im Keydown-Hotpath).

---

## 4. Gezielte Refactoring-Kandidaten (Schwachstellen & Hebel)

| Priorität | Datei | Aktuelle Zeilen | Problem / Befund | Empfohlenes Ziel-Refactoring |
|:---:|---|:---:|---|---|
| 🟢 **P1a** | [`address-data.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/address-data.js) | **918** | *Erledigt (2026-11-09):* Autarke, DOM-freie Adressdaten- und Suchlogik erfolgreich aus `address.js` herausgelöst. `address.js` auf 976 Zeilen halbiert. | 100 % rückwärtskompatible Fassade etabliert. |
| 🟡 **P1b** | [`address.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/address.js) | **976** | Verbleibende Trennung: Straßen-/Hausnummer-Parsing vs. DOM-Popover-UI. | Optional: Extraktion von `address-ui.js` zur weiteren Entlastung. |
| 🟡 **P2** | [`persistence.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/persistence.js) | **742** | **Vermischung von Verantwortlichkeiten:** Low-Level LocalStorage-Helfer, DINLetter-JSON-Schema-Mapping, Datei-Download/Upload und Datumsberechnungen liegen in einer Datei. | Aufteilung in:<br>1. `persistence.js` (reiner Storage-Zugriff & Quota)<br>2. `din-letter-schema.js` (Payload Builder, Serializer, Import/Export) |
| 🟡 **P3** | [`document.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/document.js) | **636** | **Zwei orthogonale Konzepte:** Enthält DOM-Caret-Mathematik (`getCaretCharacterOffset`), Sanitizer (`sanitizeRichText`) UND Event-Listener-Schutzlogik (`UIProtections`). | `UIProtections` als eigene Klasse auslagern oder Caret-Utils in isolierte Helper-Funktionen überführen. |
| ✅ **P4** | [`settings.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/settings.js) | **324** | *Erledigt (2026-11-09):* Font-Management erfolgreich in eigenständiges Modul [`font-feature.js`](file:///home/moritz/repos/DIN-BriefNEO/website/js/font-feature.js) (283 Zeilen) analog zu `signature.js` herausgelöst. | Abgeschlossen. |

---

## 5. Invarianz-Matrix für Refactorings

Vor jeder Änderung an diesen Dateien müssen folgende Qualitäts-Gates grün bleiben:

1. **Automatisierte Test-Suite:** `npm test` (Mindestens 160 Unit-Tests ohne Fehler).
2. **Biome Linter:** `npm run check` (0 Fehler, 0 Warnungen über alle 18 JavaScript-Dateien).
3. **Antipattern-Gate:** `npm run check:antipatterns` (Alle 36 Architektur-Regeln müssen strikt erfüllt sein).
4. **Keine Legacy-Dateien:** Keine `new Date()` oder `Date.now()` Konstrukte in `website/js/` (B2 Hard Ban $\rightarrow$ `Temporal`).
5. **Chromium 150+ Baseline:** Keine Polyfills, keine Cross-Browser-Abzweige für Firefox/Safari.
