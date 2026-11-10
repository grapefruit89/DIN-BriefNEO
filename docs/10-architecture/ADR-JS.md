---
id: adr-js
title: "ADR-JS: JavaScript Architecture, Constraints & Single Source of Truth (SSOT)"
type: adr
status: active
created: '2026-06-26'
updated: '2026-11-09'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
doc_links:
  - ADR-HTML
  - ADR-CSS
  - ADR-ANTIPATTERN
  - ADR-EVENT-DRIVEN-ARCHITECTURE
  - longevity-guidelines
code_links:
  - website/js/boot.js
  - website/js/webapi.d.ts
  - website/js/binary-storage.js
  - website/js/multipage-controller.js
  - website/js/core.js
  - website/js/font-feature.js
  - website/js/signature.js
  - website/js/settings.js
  - website/js/main.js
  - website/js/salutation.js
  - website/js/format.js
  - website/js/draft-manager.js
  - website/js/clipboard-parser.js
  - website/js/document.js
  - website/js/persistence.js
  - website/js/address-data.js
  - website/js/address.js
error_patterns:
  - javascript constraints
  - js as a crutch
  - execCommand verboten
  - selection range api
  - view transitions
  - temporal api
  - localstorage
  - antipattern
  - event bus
supersedes: []
depends_on: []
---

# ADR-JS: JavaScript Architecture, Constraints & Single Source of Truth (SSOT)

## 1. Context & Problemstellung

**Das Antipattern "JS as a Crutch" vs. Lean Web Platform 2026.**

Klassische Webanwendungen missbrauchen JavaScript häufig für visuelle Effekte, Layout-Berechnungen, Textumbruch-Messungen und State-Synchronisationen, die moderne Browser nativ und hochperformant in C++ lösen können.
In DIN-Brief Neo ist JavaScript streng auf eine **logische Begleitschicht** reduziert (< 18 KB Core-Bundle). Es dient als Bindeglied für Datenpersistenz, DOM-Range-Manipulationen und Offline-Suchalgorithmen.

Historisch führte die direkte Kopplung über Callbacks (`onToast`, `onSaveDraft`) zu tiefen Verdrahtungsketten zwischen `main.js` und den Fachmodulen. Diese enge Kopplung wird nach dem Strangler-Fig-Pattern schrittweise durch einen leichtgewichtigen nativen EventBus (`website/js/core.js`) abgelöst, ohne Framework-Abhängigkeiten einzuführen.

---

## 2. Grundlegende Architektur-Entscheidungen

1. **Striktes Verbot von JS-Layouting & DOM-Messschleifen:** JS darf keine CSS-Stile für Layout, Elementpositionen oder Textgrößen berechnen (Toolbar nutzt CSS Anchor Positioning, Text-Fit nutzt `field-sizing: content` und `text-fit: shrink`).
2. **Verbot von `document.execCommand`:** Textformatierungen erfolgen ausschließlich über die standardkonforme W3C Selection & Range API.
3. **View Transitions API:** Zustandswechsel (z. B. Formularwechsel Form A/B, Theme-Wechsel) nutzen `document.startViewTransition()` statt JS-Animationen.
4. **Modulkommunikation & EventBus:** Modulübergreifende Benachrichtigungen und Zustandsänderungen erfolgen lose gekoppelt über den nativen EventBus (`website/js/core.js`, `EventTarget`/`CustomEvent`) gemäß [[ADR-EVENT-DRIVEN-ARCHITECTURE]]. Reine fachliche Berechnungen verbleiben in zustandslosen Domain-Funktionen (primär in `website/js/address-data.js` und `website/js/format.js`).
5. **Reglementierte Aufgaben für JavaScript:**
   * W3C Selection & Range API (Textformatierung im Fließtext)
   * Lokale Datenpersistenz via `localStorage` (netzunabhängiger Betrieb, synchroner Boot-Restore) sowie asynchrone `IndexedDB` via `binary-storage.js` für große Binär-Assets (Custom-Fonts, hochauflösende Unterschriften)
   * Deterministisches Offline-PLZ- und Großempfänger-Lookup via `DecompressionStream('gzip')` (`address-data.js`)
   * Deterministischer 0,1ms Clipboard-Impressum-Parser mit juristischem Müllfilter (`clipboard-parser.js`)
   * Native Popover-Queue & Lifecycle-Steuerung für Toasts im Top-Layer (`core.js`)
   * Canvas-Bildkompression für Unterschriften (`createImageBitmap`)
   * Entkoppelte Pub/Sub-Ereignisse über den nativen EventBus (`dinbrief:`-Namespace)

---

## 3. Single Source of Truth: Aktive Module & Funktions-Registry

Das Projekt verfügt über eine flache Modulstruktur unter `website/js/` (AGENTS.md §7a, keine Unterordner). Die **17 real existierenden Dateien** sind nach fachlichen Domänen, Schichten und Verantwortlichkeiten gegliedert:

### 1. `boot.js` (Blocking Head-Script: FOUC-Schutz, Pre-Paint-Theme & Font-Initialisierung)
* Blocking classic script im `<head>` (kein ES-Modul): setzt `data-theme` und `data-style` auf dem `<html>`-Element VOR dem First Paint (FOUC-Schutz).
* Liest gespeicherte Benutzereinstellungen synchron aus dem `localStorage`.
* Setzt `data-plugin-multipage` fest auf `true` und tauscht **kein** Stylesheet mehr: der Einzelseiten-Modus ist stillgelegt ([[ADR-EINSEITEN-STILLGELEGT]]).
* Validiert gespeicherte Custom-Fonts und registriert diese via `FontFace` API.

### 2. `webapi.d.ts` (Ambient TypeScript-Definitionen)
* Typisierungen für moderne Browser-APIs der Chromium 150+ Baseline.
* Ergänzt globale Typen für die W3C `Temporal` API (`Temporal.Now.plainDateISO()`) und Accessibility-APIs wie `ariaNotify`.

### 3. `binary-storage.js` (Asynchroner Blob-Speicher via IndexedDB)
* Auslagerung großer Binärdaten aus dem synchronen `localStorage` in IndexedDB (`din_brief_binary_db`).
* Multi-Tab-sicherer Transaktions-Handshake (`onversionchange`, `tx.onabort`).
* Methoden: `saveBlob(key, blob)`, `loadBlob(key)`, `deleteBlob(key)` für Custom Fonts (`.woff2`) und hochauflösende Unterschriften.

### 4. `multipage-controller.js` (Mehrseiten-Layout-Engine)
* Steuert den dynamischen Seitenumbruch und die Spaltenverteilung für Mehrseiten-Briefe via CSS Multi-column Level 2.
* Verwaltet dynamische CSSStyleSheet-Injektionen und Kopfzeilen auf Folgeseiten (Seitenzahl, Datum, Betreff-Kurzform).
* Gewährleistet nahtlosen Paged-Media-Druck ohne leere Seiten.

### 5. `core.js` (Natives Pub/Sub-Fundament & Popover-Toast-System)
* `createEventBus(target)`: Factory für isolierte EventTarget-Instanzen (ideal für Unit-Tests).
* `eventBus`: Singleton-Instanz für die anwendungsweite Kommunikation.
* `Events`: Typisierte Event-Konstanten mit Pflicht-Namespace `dinbrief:` (`NOTIFICATION_REQUESTED`, `DOCUMENT_SAVE_REQUESTED`, `DOCUMENT_SAVED`, `DOCUMENT_SAVE_FAILED`, `DOCUMENT_CHANGED`).
* `publish(topic, payload)` / `subscribe(topic, handler, options)`: Entkoppelte Kommunikation via `CustomEvent`; `subscribe` gibt Unsubscribe-Funktion zurück und unterstützt `AbortSignal`.
* `initToastSystem()`: Ermittelt `#hinweis-v4` (`popover="manual"`) im DOM, bindet Close-Button und abonniert `Events.NOTIFICATION_REQUESTED`.
* `showToast(message, type)`: Zeigt Toast im Top-Layer via `showPopover()`; dedupliziert bei gleicher Nachricht via Timer-Reset.
* `armCloseWatcher()`: Schließt den Toast nativ über `CloseWatcher` bei Esc / Back-Gesture.
* Verwaltet automatischen Lesezeit-Timer (`2000ms + 30ms × Zeichenanzahl`, max. `5000ms`).

### 6. `font-feature.js` (Typografie-Manager & Font-Upload)
* Verwaltet System-Font-Stacks und WOFF2/TTF/OTF-Custom-Font-Uploads.
* Asynchrone Persistenz von Schrift-Blobs in `binary-storage.js` mit CSS Font Loading API (`FontFace`).
* Schriftauswahl-UI in der Sidebar mit Status-Indikatoren und Fallback-Handling.

### 7. `signature.js` (Unterschriften- und Stempel-Stage)
* Verwaltet Bild-Upload und die CAD-Bounding-Box auf dem Briefbogen.
* Interaktive WYSIWYG-Transformation: stufenloses Verschieben (Drag), Skalieren (Resize) und Rotieren (Rotate) via CSS-Transforms ohne Layout Thrashing.
* Asynchrone Bildkompression via `createImageBitmap` und Persistenz in IndexedDB via `binary-storage.js`.

### 8. `settings.js` (UI-Settings-Controller)
* Bindet Sidebar-Controls für Layout (Form A/B), Themes (`auto`, `light`, `dark`) und semantische Schalter.
* View Transitions: Zustandswechsel nutzen `document.startViewTransition()` für unterbrechungsfreie optische Übergänge.
* Visualisiert Speicher-Quota und synchronisiert Benutzereinstellungen mit `persistence.js`.

### 9. `main.js` (Composition Root & App-Bootstrapper)
* `initApp()`: Zentraler Bootstrap beim Laden von `DOMContentLoaded`. Initialisiert EventBus, Module und Adapter.
* Synchronisiert Postvermerk-Auswahllisten und bindet Tastenkombinationen (`Ctrl+Enter`, `Ctrl+S`, `Ctrl+P`).
* Koordiniert den Lifecycle zwischen DOM, Fachmodulen und Persistenz.

### 10. `salutation.js` (80/20 Smart Salutation Engine)
* Deterministische, regelbasierte Anrede- und Grußformel-Generierung nach DIN 5008 (3 Tonalitäten: `formal`, `polite`, `casual`).
* Erkennt Titel (Dr., Prof., mult.) und Adelspartikel (von, zu, van, de) ohne externe Wörterbücher.
* Reagiert reaktiv auf Namensänderungen mit In-Flight-Tippschutz und schützt manuelle Nutzereingaben via `data-dirty="true"`.
* Validiert DIN-Kommasetzung (Komma nach Anrede, strikt KEIN Komma nach Grußformel).

### 11. `format.js` (Reine, zustandslose DIN-5008-Formatierer)
* 100 % reine Funktionen ohne DOM-Seiteneffekte.
* Formatierung von Datum (`formatDatum()`, `applyLetterDate()`), Uhrzeit (`formatUhrzeit()`), IBAN (`formatIban()`), Telefonnummern (`formatTelefonnummer()`), Postfächern (`formatPostfach()`) und Währungsbeträgen (`formatGeldbetrag()`).
* Nutzt native Standards: `Intl.DateTimeFormat`, `Intl.NumberFormat` und `Temporal.PlainDate`.

### 12. `draft-manager.js` (Autosave & Undo/Redo-Controller)
* Verwaltet den History-Stack für Undo/Redo über Snapshot-Deltas.
* Debounced Autosave (500 ms) nach Benutzerinaktivität mit automatischer Speicherung in `localStorage`.
* Publiziert `DOCUMENT_SAVED`, `DOCUMENT_SAVE_FAILED` und `DOCUMENT_CHANGED` über den EventBus.

### 13. `clipboard-parser.js` (Zwischenablagen- & Impressum-Parser)
* Heuristischer Multi-Pass-Parser für unstrukturierte Adress- und Kontaktdaten aus der Zwischenablage.
* Extrahiert Name, Straße, PLZ, Ort, Telefon, E-Mail und filtert Metadaten (HRB, USt-ID, Steuernummern, Disclaimer).
* Schlägt Kandidaten bei Mehrdeutigkeiten in Top-Layer-Popovers zur visuellen Übernahme vor.

### 14. `document.js` (DOM-Utilities & Tastaturschutz)
* **`UIProtections`**: Tasten- und Paste-Schutz für DIN-Zonen; begrenzt einzeilige Felder und schützt Betreff/Postvermerk auf max. 2 Zeilen (130 Zeichen).
* Struktursicherung für Anlagenlisten (`ensureListStructure`).
* **Selection & Caret Utilities**: W3C Range- und TreeWalker-basierte Caret-Positionsbestimmung ohne Layout Thrashing (`getCaretCharacterOffset`, `setCaretCharacterOffset`).
* Defensiver Allowlist-Sanitizer für HTML-Inhalte.

### 15. `persistence.js` (Zentraler Persistenz-Hub & Import/Export)
* LocalStorage-IO mit Typsicherheit, Fehlerbehandlung und Schema-Migration.
* Metadata & Document Identity: Generiert standardisierte PDF-Dateinamen (`YYYY-MM-DD_{Empfänger}_{Betreff}`) und HTML-Metatags.
* DINLetter JSON-Payload Schema V4: Defensiver Importer/Exporter mit Validierung gegen Prototyp-Pollution und XSS.

### 16. `address-data.js` (Autarke Adressdaten-Engine)
* 100 % autarke Offline-Suchalgorithmen ohne DOM-Abhängigkeit (Node & Browser tauglich).
* Nativer `DecompressionStream('gzip')` für `orte.json.gz` (Columnar Binary Search) und `grosskunden.json.gz`.
* Zustandsloser PLZ-Lookup inkl. Großempfänger-Erkennung (OLG Frankfurt Az. 6 U 170/13) und Präfixsuche.

### 17. `address.js` (Adress-Fassade & UI-Controller)
* Bündelt Autocomplete-Popovers (`#plz-suggestions-popover`), Tastatur-Pfeilnavigation und Barrierefreiheit (`aria-activedescendant`).
* Synchronisiert Absender-Formularfelder reaktiv mit der DIN-Rücksendezeile (inkl. Namenskürzel) und Maschinenschrift.
* Integriert optionale Geoapify-Services mit Cache und Adressbuch-Historie.

---

### 3.1 Modulkommunikation

Modulübergreifende Benachrichtigungen und Zustandswechsel erfolgen über den nativen EventBus, sofern eine direkte funktionale Abhängigkeit fachlich nicht erforderlich ist. Der EventBus verwendet `EventTarget`, `CustomEvent` und das Topic-Präfix `dinbrief:`.

Der EventBus ersetzt keine reine Domain-Funktion und keinen synchron benötigten Rückgabewert. Berechnungen wie ein PLZ-/Ort-Lookup bleiben unabhängig testbare Funktionen. Die Benachrichtigung über eine daraus resultierende Zustandsänderung kann ereignisgesteuert erfolgen.

Die verbindlichen Topic-Namen und Payload-Verträge sind in [[ADR-EVENT-DRIVEN-ARCHITECTURE]] festgelegt.

### 3.2 Verantwortlichkeiten & Schichtenmodell (L0 bis L4)

Alle 17 Module unter `website/js/` sind strikt hierarchisch in 5 Schichten (Layer 0 bis Layer 4) gegliedert:

- **Layer 4: Orchestrierung (Composition Root & App Lifecycle)**
  - `main.js`: Zentraler Bootstrapper bei `DOMContentLoaded`, globale Event-Bindings, Tastatur-Shortcuts, Lifecycle-Koordination.
- **Layer 3: Feature-Controller, UI-Panels & Layout-Engines**
  - `settings.js`: Einstellungs-Panel, Form A/B, Theme-Switch mit View Transitions, Quota-Anzeige.
  - `font-feature.js`: Schriftarten-Manager, Preset-Auswahl, WOFF2/TTF/OTF Font-Upload & FontFace-Registrierung.
  - `signature.js`: Unterschriften- & Stempel-Stage, Canvas-Kompression, WYSIWYG Drag/Rotate.
  - `multipage-controller.js`: Mehrseiten-Layout-Engine via CSS Multicol L2, CSSStyleSheet-Injektion, Folgeblatt-Köpfe.
  - `draft-manager.js`: Autosave-Lifecycle (debounced 500ms), Snapshot-Historie, Undo/Redo-Stack.
  - `clipboard-parser.js`: Heuristischer Impressum- & Zwischenablage-Parser mit Top-Layer-Kandidaten-Vorschau.
- **Layer 2: Fachlogik, DOM-Adapter & Domänen-Engines**
  - `address.js`: Adress-Fassade, Autocomplete-UI, Tastatur-Pfeilnavigation, Absender-Synchronisation.
  - `salutation.js`: 80/20 KISS Smart Salutation Engine (DIN-5008-Anrede/Gruß, Titel, Dirty-Tracking).
  - `document.js`: DOM-Utilities, Selection/Caret-Offsets, Tastaturschutz (`UIProtections`), Allowlist-Sanitizer.
- **Layer 1: Persistenz & Daten-Hub**
  - `persistence.js`: LocalStorage-IO, DINLetter JSON-Payload V4 Import/Export, Temporal-Datum.
  - `binary-storage.js`: Asynchroner IndexedDB-Speicher für Binär-Blobs (Custom Fonts, Signaturen).
  - `address-data.js`: Autarke Offline-Suche, DecompressionStream('gzip'), Columnar Binary Search.
- **Layer 0: Fundament, Typisierung & zustandslose Werkzeuge**
  - `core.js`: Natives Pub/Sub-Fundament (`eventBus`, `Events`), Top-Layer-Toasts (`#hinweis-v4`), Popover-Guards.
  - `format.js`: Zustandsloses, normgerechtes Parsen und Formatieren nach DIN 5008 (100% reine Funktionen).
  - `boot.js`: Synchrones, blockierendes Head-Script für FOUC-Schutz, Pre-Paint-Theme & Sheet-Selektion.
  - `webapi.d.ts`: Ambient-Typdefinitionen für Chromium 150+ Baseline (`Temporal`, `ariaNotify`).

### 3.3 Grenzen der Entkopplung

Nicht jeder Funktionsaufruf wird zu einem Event. Direkte Aufrufe innerhalb eines Moduls sowie synchrone reine Funktionen bleiben Standard. Events werden ausschließlich für die vereinbarte modulübergreifende Kommunikation verwendet.

Ein Event stellt keine erfolgreiche Persistenz und keine fehlerfreie Ausführung aller Subscriber sicher. Solche Ergebnisse werden nur vom jeweils verantwortlichen Service nach erfolgreichem Abschluss veröffentlicht.

---

## 4. Antipattern- & Deprecation-Registry (Verbotene Alt-Funktionen)

Folgende Funktionen und Module aus früheren Versionen (Stand Commit `1b663fa`) wurden **vollständig eliminiert** und sind im gesamten Repository unter Strafe von Build-Fehlern (Fitness Gate) verboten:

| Modul / Komponente | Eliminierte Funktionen / Konstrukte | Status | Verboten durch | Moderner Ersatz (Web Platform 2026) |
| :--- | :--- | :---: | :--- | :--- |
| **`addons/ai-assistant.js`** | On-Device Gemini Nano Rewriter, `#toggle-experimental-ai`, `#btn-ai-rewrite` | 🚫 **ELIMINATED** | KISS-Bereinigung toten Codes | Wegfall der Format-Toolbar machte Addon funktionslos; Prototyp archiviert unter `research/roadmap/`. |
| **`boot-state.js`** | Doppelter Draft-Restore vor `main.js`, DOM-Vorbelegung | 🚫 **ELIMINATED** | KISS SSoT-Doktrin | `DraftManager` in `document.js` ist alleiniger Restore-Owner. |
| **`48-text-fit.js`** | `constructor`, `init`, `scanDOM`, `isOverflowing`, `attachEventListeners`, `notifyToast`, `restoreCaretToEnd`, `initMutationObserver` | 🚫 **HARD BAN** | Catalog A49, Probe P3 | CSS `field-sizing: content`, `overflow: clip`, `text-fit: shrink 60%`, `text-wrap: balance/pretty`. 0 Zeilen JS, 0 ms Layout Thrashing. |
| **`41-salutation-engine.legacy.js`** | `_wireGender`, Radio-Buttons für Geschlecht, NLP-Regexes für Adelstitel/Paare | 🚫 **HARD BAN** | Catalog A58, Prio 1 | 80/20 Smart Engine (`salutation.js`), deterministische regelbasierte Erkennung ohne externe Namenslisten, ContentEditable Dirty-Flag mit Auto-Reset. |
| **`03-ui-protections.js`** | `beforeInputFormatTypes`, `beforeInputParagraphTypes`, BeforeInput-Event-Listener für Einzeiler | 🚫 **HARD BAN** | Catalog A55, Probe P4 | Natives HTML `contenteditable="plaintext-only"` und `enterkeyhint="done"`. Formatierungs- und Umbruchssperre erfolgt nativ in C++. |
| **`32-toast.js`** | `onPointerDown`, `onPointerMove`, `onPointerUp`, `setPointerCapture`, `swipe.startX`, `--swipe-x`, `z-index: 9999` | 🚫 **HARD BAN** | Catalog A56, Probe P5 | Native HTML Popover API (`popover="manual"`) im Top-Layer, CSS `@starting-style` und `transition-behavior: allow-discrete`. |
| **`43-geoapify.js`** | Zippopotam.us Fetch-Kaskaden & synchrone externe PLZ-Lookups | 🚫 **HARD BAN** | Catalog A38, Prio 2 | 43 KB Offline Gzip PLZ & Großempfänger Engine (`address.js`). 100% DSGVO-konform, 0ms Latenz. |
| **`31-format-toolbar.js`** | Floating Toolbar Popover, Selection-Anchor, manuelle Format-Buttons | 🚫 **ELIMINATED** | Rich-Text-Light Doktrin | Nativer Browser-Support (Ctrl+B/Ctrl+U), Plaintext-Paste & Ctrl+Q in `01-document.js`. |
| **Global** | `document.execCommand('bold'|'italic'|...)` | 🚫 **HARD BAN** | Catalog A48, A52 | W3C Selection & Range API sowie native Browser-Shortcuts (`Ctrl+B`, `Ctrl+U`) und Rich-Text-Light. |
| **Global** | `new Date()`, `Date.now()`, `Date.parse()` | 🚫 **HARD BAN** | Catalog TM1, A48 | Temporal API (`Temporal.Now.plainDateISO()`) und standardkonformes DIN-Formatting. |

---

## 5. Konsequenzen & Entwickler-Direktiven

* **Zero Frameworks:** Keine Einführung von React, Vue, Svelte, Lit oder jQuery.
* **Keine Layout-Berechnungen in JS:** Sobald eine Funktion `offsetWidth`, `scrollWidth`, `getBoundingClientRect` o. ä. in einer Schleife aufruft, um Stile zu setzen, greift die Antipattern-Sonde P3.
* **Top-Layer-Mandat:** Modals (`<dialog>`) und Toasts/Dropdowns (`[popover]`) rendern ausschließlich im Browser-Top-Layer. Niemals manuelle `z-index`-Werte über 100 vergeben.
* **Single Source of Truth:** Änderungen an JavaScript-Signaturen, Modulen oder Aufgabenbereichen müssen zwingend in diesem Dokument (`ADR-JS.md`) gepflegt werden.