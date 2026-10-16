---
id: adr-js
title: "ADR-JS: JavaScript Architecture, Constraints & Single Source of Truth (SSOT)"
type: adr
status: active
created: '2026-06-26'
updated: '2026-10-15'
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
  - website/js/core.js
  - website/js/document.js
  - website/js/settings.js
  - website/js/salutation.js
  - website/js/address.js
  - website/js/persistence.js
  - website/js/main.js
  - website/js/boot-theme.js
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
4. **Modulkommunikation & EventBus:** Modulübergreifende Benachrichtigungen und Zustandsänderungen erfolgen lose gekoppelt über den nativen EventBus (`website/js/core.js`, `EventTarget`/`CustomEvent`) gemäß [[ADR-EVENT-DRIVEN-ARCHITECTURE]]. Reine fachliche Berechnungen verbleiben in zustandslosen Domain-Funktionen (`website/js/address.js`).
5. **Reglementierte Aufgaben für JavaScript:**
   * W3C Selection & Range API (Textformatierung im Fließtext)
   * Lokale Datenpersistenz via `localStorage` (netzunabhängiger Betrieb, synchroner Boot-Restore)
   * Deterministisches Offline-PLZ- und Großempfänger-Lookup via `DecompressionStream('brotli')`
   * Deterministischer 0,1ms Clipboard-Impressum-Parser mit juristischem Müllfilter
   * Native Popover-Queue & Lifecycle-Steuerung für Toasts im Top-Layer
   * Canvas-Bildkompression für Unterschriften (`createImageBitmap`)
   * Entkoppelte Pub/Sub-Ereignisse über den nativen EventBus (`dinbrief:`-Namespace)

---

## 3. Single Source of Truth: Aktive Module & Funktions-Registry

Das Projekt verfügt über eine flache Modulstruktur unter `website/js/` (AGENTS.md §7a, keine Unterordner). Module sind nach Schichten strukturiert (`0x` Core, `3x` UI, `4x` Features/Domain, `5x` Storage/Tools):

### 0. `boot-theme.js` (Blocking Head-Script: FOUC-Schutz & Font-Loading)
* Blocking classic script im `<head>` (kein ES-Modul): setzt `data-theme` und `data-layout` auf dem `<html>`-Element VOR dem First Paint (FOUC-Schutz).
* Liest gespeicherte Benutzereinstellungen (`din_settings`) synchron aus dem `localStorage`.
* Validiert gespeicherte Custom-Fonts (Base64 data-URI) und registriert diese via `FontFace` API.

### 1. `core.js` (Natives Pub/Sub-Fundament & Popover-Toast-System)
*Bündelt den vormaligen EventBus (`00-event-bus.js`) und das Toast-System (`32-toast.js`):*
* `createEventBus(target)`: Factory für isolierte EventTarget-Instanzen (ideal für Unit-Tests).
* `eventBus`: Singleton-Instanz für die anwendungsweite Kommunikation.
* `Events`: Typisierte Event-Konstanten mit Pflicht-Namespace `dinbrief:` (`NOTIFICATION_REQUESTED`, `DOCUMENT_SAVE_REQUESTED`, `DOCUMENT_SAVED`, `DOCUMENT_SAVE_FAILED`, `DOCUMENT_CHANGED`).
* `publish(topic, payload)` / `subscribe(topic, handler, options)`: Entkoppelte Kommunikation via `CustomEvent`; `subscribe` gibt Unsubscribe-Funktion zurück und unterstützt `AbortSignal`.
* `initToastSystem()`: Ermittelt `#hinweis-v4` (`popover="manual"`) im DOM, bindet Close-Button und abonniert `Events.NOTIFICATION_REQUESTED`.
* `showToast(message, type)`: Zeigt Toast im Top-Layer via `showPopover()`; dedupliziert bei gleicher Nachricht via Timer-Reset.
* `armCloseWatcher()`: Schließt den Toast nativ über `CloseWatcher` bei Esc / Back-Gesture.
* Verwaltet automatischen Lesezeit-Timer (`2000ms + 30ms × Zeichenanzahl`, max. `5000ms`).

### 2. `document.js` (Dokumenten-Core: DraftManager, UIProtections & SelectionUtils)
* **`DraftManager`**:
  * `constructor(onSaveCallback = null, bus = eventBus)`: Initialisiert History-Stack und lauscht auf `DOCUMENT_SAVE_REQUESTED`.
  * `saveDraft()`: Serialisiert den aktuellen Entwurf, speichert ihn in `localStorage` und publiziert `DOCUMENT_SAVED` bzw. `DOCUMENT_SAVE_FAILED`.
  * `loadDraft()`: Liest gespeicherte Entwurfsdaten aus und befüllt die DOM-Felder via Allowlist-Sanitizer.
  * `undo()` / `redo()`: Schrittweises Rückgängigmachen / Wiederherstellen über Snapshot-Stack; publiziert `DOCUMENT_CHANGED`.
  * `resetDraft()`: Setzt alle Felder auf DIN-5008-Default-Werte zurück und publiziert `DOCUMENT_CHANGED`.
  * `scheduleAutoSave()`: Debounced AutoSave nach Benutzerinaktivität (500 ms).
  * `destroy()`: Bereinigt EventBus-Listener.
* **`UIProtections`**:
  * `constructor()`: Registriert geschützte Selektoren (`multiLineIds`, `maxTwoLinesIds`).
  * `init()`: Initialisiert Tasten-, Shortcut- (`Ctrl+Q` für Blockquotes) und Paste-Schutz.
  * `enforceLineLimits()`: Fängt Enter-Taste auf einzeiligen Feldern ab und begrenzt Betreff/Postvermerk auf max. 2 Zeilen (130 Zeichen). Behandelt Pasting mit Zeilenumbruch-Einebnung (`pastedText.replace(/[\r\n]+/g, ' ')`). (Single-Line Plaintext-Schutz ist nativ über `contenteditable="plaintext-only"` und `enterkeyhint="done"` gelöst).
  * `protectAnlagenList()`: Verhindert die Löschung des letzten Listenelements in `#anlagen-text`.
  * `ensureListStructure(anlagen)`: Stellt sicher, dass `#anlagen-text` stets ein valides `<ul><li>`-Gerüst behält.
* **Selection & Caret Utilities**:
  * `getCaretCharacterOffset(element)` / `setCaretCharacterOffset(element, offset)`: W3C Range- & TreeWalker-basierte Caret-Positionsbestimmung ohne Layout Thrashing.
  * `setCaretToEnd(element)`: Setzt den Fokus und Caret ans Textende.

### 3. `settings.js` (UI-Settings, Layout, Theme, Font & SignatureFeature)
*Bündelt die vormaligen Einzelmodule `02-settings-manager.js`, `42-signature.js` und re-exportiert `sanitizeRichText`:*
* **`SettingsManager`**:
  * `constructor()`: Bindet UI-Elemente für Layout (Form A/B), Theme und Schalter.
  * `init()`: Lädt gespeicherte Einstellungen und injiziert Fonts.
  * `applySettings()`: Synchronisiert Radio-Controls und semantische Switches mit dem State.
  * `applyTheme(theme)`: Setzt Theme (`auto`, `light`, `dark`) mit element-scoped View Transitions.
  * `changeLayout(layout)`: Wechselt DIN-Layout (Form A vs. B) mit View Transition auf `<din-a4>`.
  * `updateSettings()`: Persistiert Einstellungsänderungen via `persistence.js`.
  * `initFontInjection()` / `injectFont(base64Font)`: Injiziert Offline-WOFF2-Fonts via native `FontFace` API.
  * `updateFontStatusUI(hasCustomFont)`: Aktualisiert Schriftstatus in der Sidebar.
  * `attachListeners()`: Event-Handler für Theme, Layout und den semantischen Switch `#btn-hilfslinien-switch`.
* **`SignatureFeature`**:
  * `constructor(settingsContext)`: Verwaltet Bild-Upload und Signatur-Bounding-Box.
  * `init()` / `initWysiwyg()`: Bindet Drag, Resize und Rotation der Unterschrift auf dem Briefblatt.
  * `applyTransform()`: Schreibt individuelle CSS-Transforms (`style.translate`, `style.rotate`, `style.scale`) direkt ohne Layout Thrashing.
  * `processFile(file)` / `compressImage(bitmap)`: Asynchrone Bildkompression via `createImageBitmap` zur Schonung des LocalStorage.
  * `saveAndApply(base64)` / `applyImage(base64)` / `resetImage()`: Speichern, Rendern und Löschen der Signatur.

### 4. `salutation.js` (80/20 Smart Salutation Engine)
* `constructor(settingsContext = null)`: Initialisiert Engine mit 3 Tonalitäten (`formal`, `polite`, `casual`); arbeitet rein regelbasiert und deterministisch ohne externe Namenslisten (Offline/Zero-Dep). Erkennt Geschlecht ausschließlich aus expliziten Präfixen ("Herr", "Herrn", "Frau") im Namensfeld oder adressiert neutral ("Guten Tag", "Hallo", "Sehr geehrte Damen und Herren"). Publiziert `DOCUMENT_SAVE_REQUESTED` über den EventBus bei Änderungen.
* `init()`: Verdrahtet Empfänger-Eingaben mit Anrede und Grußformel.
* `derive({ firstName, lastName, company, formality })`: Ermittelt treffsicher die Anredeform ("Sehr geehrte(r) Frau/Herr [Nachname],", "Guten Tag...", "Hallo...").
* `getClosing(formality)`: Liefert das harmonische DIN-5008-Gegenstück ("Mit freundlichen Grüßen", "Freundliche Grüße", "Beste Grüße").
* `getFallback(formality)`: Fallback-Anrede ("Sehr geehrte Damen und Herren,").
* `splitTitles(name)`: Erkennt akademische Grade (Dr., Prof.) und Adelspartikel (von, zu, van, de).
* `_applyUIState()` / `_wireRecipientName()` / `_wireManualEdits()`: Reagiert auf Eingaben mit In-Flight-Tippschutz und schützt manuelle Nutzereingaben via `data-dirty="true"` (mit Auto-Reset bei Feldleerung).
* `_validatePunctuation(el, kind)`: Erzwingt DIN-Kommasetzung (Komma nach Anrede, strikt KEIN Komma nach Grußformel) via `NOTIFICATION_REQUESTED`.

### 5. `address.js` (Konsolidierter Adress-, PLZ- & Geocoding-Cluster)
*Bündelt die vormaligen Einzelmodule `05-gzip.js`, `44-address-domain.js`, `45-address-intelligence.js`, `46-clipboard-address-parser.js` und `43-geoapify.js`:*
* **Gzip-Decompression (`fetchGzipJson`)**: Nativer `DecompressionStream('gzip')` für `de_plz_ort.json.gz` und `de_grosskunden_plz.json.gz` ohne Fremdbibliotheken.
* **Domain Functions (Zustandslos)**:
  * `normalizePostcode(raw)`: Validiert 5-stellige deutsche Postleitzahlen.
  * `resolvePostcode(plz, plzToCityMap, grosskundenMap)`: Zustandsloser PLZ-Lookup inkl. Großempfänger-Erkennung (OLG Frankfurt Az. 6 U 170/13).
  * `resolveCity(query, cityToPlzMap, plzToCityMap, limit)`: Exakte und präfixbasierte Ortssuche.
  * `filterPostcodePrefix(prefix, plzToCityMap, limit)`: Filtert PLZs nach 2–4-stelligen Ziffern-Präfixen.
  * `detectPlzInputPattern(raw)`: Erkennt semantische Muster (`plz_exact`, `plz_prefix`, `city_name`, `unknown`).
* **`AddressIntelligence`**: 100% Offline PLZ- und Großempfänger-Engine. Initialisiert Datensätze im Speicher, bindet Empfängerfelder via `wireDOM()`, steuert Popover-Vorschläge und publiziert `DOCUMENT_SAVE_REQUESTED` sowie `NOTIFICATION_REQUESTED`.
* **`initSenderSync()`**: Synchronisiert Absender-Formularfelder reaktiv mit der DIN-Rücksendezeile (mit Namenskürzel via `abbreviateName`) und der Maschinenschrift.
* **`ClipboardAddressParser`**: 95%-KISS Multi-Pass Regex-Parser für Zwischenablagen-Texte. Filtert Metadaten (HRB, USt-ID etc.) und öffnet bei Mehrdeutigkeit das Popover `#clipboard-candidates-popover`.
* **`initAddressServices()`**: Optionaler Geoapify-Service mit In-Memory Cache, Adressbuch-Historie (max. 50 Einträge) und Absender-Proximity-Bias.

### 6. `persistence.js` (Konsolidierter Persistenz-, Datums- & Export-Layer)
*Bündelt die vormaligen Einzelmodule `47-date-format.js`, `51-storage.js`, `53-metadata.js` und `52-import-export.js`:*
* **DateFormat (`formatLetterDate`, `applyLetterDate`, `currentISODate`)**: Zoniertes DIN-5008-Datum ("4. September 2026") und maschinenlesbares ISO-Datum via nativer `Intl.DateTimeFormat` und `Temporal API`.
* **Storage Primitives & Konstanten**:
  * `Constants`: SCHEMA-Version, Storage-Keys, System-Limits und Toast-Meldungen.
  * `DEFAULT_SETTINGS` & `STORAGE_KEYS`: Zentrale Speicherschlüssel und Default-Konfiguration.
  * `load`, `save`, `remove`, `loadJSON`, `saveJSON`: Robuste, try-catch-gekapselte LocalStorage-Primitives.
  * `migrateStorage()`: Idempotente Schema-Migration beim App-Start.
  * `StorageManager`: Abwärtskompatible Fassade für bestehende Komponenten.
* **Metadata & Document Identity**:
  * `collectLetterIdentity()` & `buildLetterFileName()`: Ermittelt Empfänger, Absender, Betreff und zoniertes Datum für standardisierte PDF-Dateinamen und Backups.
  * `isPrintTitleActive()`: Koordiniert `document.title` zwischen Druckdialog und DraftManager-Autosave.
  * `MetadataService`: Bereitet PDF-Drucktitel und HTML-Metatags im `<head>` vor und stellt den Urzustand nach dem Drucken wieder her.
* **Import / Export (`DINLETTER_FORMAT = 'dinletter'`)**:
  * `buildDinLetterPayload(draft, settings, font)`: Erzeugt valides DIN-Brief-JSON mit Metadaten-Header.
  * `parseDinLetterPayload(raw)`: Defensiver Validator für importierte JSON-Dateien (Schutz vor Prototyp-Pollution und XSS).
  * `initImportExport()`: Verdrahtet Export- und Import-Dialoge; publiziert `DOCUMENT_SAVE_REQUESTED` und `NOTIFICATION_REQUESTED`.

### 7. `main.js` (Composition Root & Bootstrap)
* `initApp()`: Zentraler Bootstrap beim Laden von `DOMContentLoaded`. Initialisiert EventBus, Module und Adapter.
* `syncPostvermerkFromSidebar()`: Synchronisiert Auswahlliste mit dem Postvermerkfeld.
* `attachGlobalListeners(...)`: Registriert globale Tastenkombinationen und leitet DOM-Eingaben via `DOCUMENT_SAVE_REQUESTED` an den EventBus weiter.

---

### 3.1 Modulkommunikation

Modulübergreifende Benachrichtigungen und Zustandswechsel erfolgen über den nativen EventBus, sofern eine direkte funktionale Abhängigkeit fachlich nicht erforderlich ist. Der EventBus verwendet `EventTarget`, `CustomEvent` und das Topic-Präfix `dinbrief:`.

Der EventBus ersetzt keine reine Domain-Funktion und keinen synchron benötigten Rückgabewert. Berechnungen wie ein PLZ-/Ort-Lookup bleiben unabhängig testbare Funktionen. Die Benachrichtigung über eine daraus resultierende Zustandsänderung kann ereignisgesteuert erfolgen.

Die verbindlichen Topic-Namen und Payload-Verträge sind in [[ADR-EVENT-DRIVEN-ARCHITECTURE]] festgelegt.

### 3.2 Verantwortlichkeiten & Schichten

- **Composition Root (`main.js`):** Initialisierung und Verdrahtung der Module.
- **EventBus & Toasts (`core.js`):** Transport vereinbarter Ereignisse und Popover-Toast-System.
- **Services / Manager:** Koordination von Anwendungsfällen und Zustandsänderungen (`DraftManager`, `SettingsManager`).
- **Domain-Funktionen & Services (`address.js`):** reine fachliche Berechnungen und Adress-Services.
- **DOM-Adapter / Views:** Lesen von UI-Eingaben und Darstellung von Ergebnissen.
- **Storage-Verantwortliche (`persistence.js`):** lokale Persistenz gemäß [[ADR-DATA-PERSISTENCE]].

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
| **`43-geoapify.js`** | Zippopotam.us Fetch-Kaskaden & synchrone externe PLZ-Lookups | 🚫 **HARD BAN** | Catalog A38, Prio 2 | 72 KB Offline Brotli PLZ & Großempfänger Engine (`45-address-intelligence.js`). 100% DSGVO-konform, 0ms Latenz. |
| **`31-format-toolbar.js`** | Floating Toolbar Popover, Selection-Anchor, manuelle Format-Buttons | 🚫 **ELIMINATED** | Rich-Text-Light Doktrin | Nativer Browser-Support (Ctrl+B/Ctrl+U), Plaintext-Paste & Ctrl+Q in `01-document.js`. |
| **Global** | `document.execCommand('bold'|'italic'|...)` | 🚫 **HARD BAN** | Catalog A48, A52 | W3C Selection & Range API sowie native Browser-Shortcuts (`Ctrl+B`, `Ctrl+U`) und Rich-Text-Light. |
| **Global** | `new Date()`, `Date.now()`, `Date.parse()` | 🚫 **HARD BAN** | Catalog TM1, A48 | Temporal API (`Temporal.Now.plainDateISO()`) und standardkonformes DIN-Formatting. |

---

## 5. Konsequenzen & Entwickler-Direktiven

* **Zero Frameworks:** Keine Einführung von React, Vue, Svelte, Lit oder jQuery.
* **Keine Layout-Berechnungen in JS:** Sobald eine Funktion `offsetWidth`, `scrollWidth`, `getBoundingClientRect` o. ä. in einer Schleife aufruft, um Stile zu setzen, greift die Antipattern-Sonde P3.
* **Top-Layer-Mandat:** Modals (`<dialog>`) und Toasts/Dropdowns (`[popover]`) rendern ausschließlich im Browser-Top-Layer. Niemals manuelle `z-index`-Werte über 100 vergeben.
* **Single Source of Truth:** Änderungen an JavaScript-Signaturen, Modulen oder Aufgabenbereichen müssen zwingend in diesem Dokument (`ADR-JS.md`) gepflegt werden.