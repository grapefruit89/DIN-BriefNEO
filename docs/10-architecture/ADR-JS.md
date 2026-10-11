---
id: adr-js
title: "ADR-JS: JavaScript Architecture, Constraints & Single Source of Truth (SSOT)"
type: adr
status: active
created: '2026-06-26'
updated: '2026-10-11'
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
  - website/js/00-event-bus.js
  - website/js/01-draft-manager.js
  - website/js/02-settings-manager.js
  - website/js/03-ui-protections.js
  - website/js/04-sanitize.js
  - website/js/32-toast.js
  - website/js/41-salutation-engine.js
  - website/js/42-signature.js
  - website/js/43-geoapify.js
  - website/js/44-address-domain.js
  - website/js/45-address-intelligence.js
  - website/js/46-clipboard-address-parser.js
  - website/js/47-date-format.js
  - website/js/51-storage.js
  - website/js/52-import-export.js
  - website/js/53-metadata.js
  - website/js/main.js
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

Historisch führte die direkte Kopplung über Callbacks (`onToast`, `onSaveDraft`) zu tiefen Verdrahtungsketten zwischen `main.js` und den Fachmodulen. Diese enge Kopplung wird nach dem Strangler-Fig-Pattern schrittweise durch einen leichtgewichtigen nativen EventBus (`website/js/00-event-bus.js`) abgelöst, ohne Framework-Abhängigkeiten einzuführen.

---

## 2. Grundlegende Architektur-Entscheidungen

1. **Striktes Verbot von JS-Layouting & DOM-Messschleifen:** JS darf keine CSS-Stile für Layout, Elementpositionen oder Textgrößen berechnen (Toolbar nutzt CSS Anchor Positioning, Text-Fit nutzt `field-sizing: content` und `text-fit: shrink`).
2. **Verbot von `document.execCommand`:** Textformatierungen erfolgen ausschließlich über die standardkonforme W3C Selection & Range API.
3. **View Transitions API:** Zustandswechsel (z. B. Formularwechsel Form A/B, Theme-Wechsel) nutzen `document.startViewTransition()` statt JS-Animationen.
4. **Modulkommunikation & EventBus:** Modulübergreifende Benachrichtigungen und Zustandsänderungen erfolgen lose gekoppelt über den nativen EventBus (`website/js/00-event-bus.js`, `EventTarget`/`CustomEvent`) gemäß [[ADR-EVENT-DRIVEN-ARCHITECTURE]]. Reine fachliche Berechnungen verbleiben in zustandslosen Domain-Funktionen (`website/js/44-address-domain.js`).
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

### 0. `00-event-bus.js` (Natives Pub/Sub-Fundament)
* `createEventBus(target)`: Factory für isolierte EventTarget-Instanzen (ideal für Unit-Tests).
* `eventBus`: Singleton-Instanz für die anwendungsweite Kommunikation.
* `Events`: Typisierte Event-Konstanten mit Pflicht-Namespace `dinbrief:` (`NOTIFICATION_REQUESTED`, `DOCUMENT_SAVE_REQUESTED`, `DOCUMENT_SAVED`, `DOCUMENT_SAVE_FAILED`, `DOCUMENT_CHANGED`).
* `publish(topic, payload)` / `subscribe(topic, handler, options)`: Entkoppelte Kommunikation via `CustomEvent`; `subscribe` gibt Unsubscribe-Funktion zurück und unterstützt `AbortSignal`.

### 1. `01-draft-manager.js` (Entwurfs- & History-Management)
* `constructor(onSaveCallback = null, bus = eventBus)`: Initialisiert History-Stack und lauscht auf `DOCUMENT_SAVE_REQUESTED`.
* `saveDraft()`: Serialisiert den aktuellen Entwurf, speichert ihn in `localStorage` und publiziert `DOCUMENT_SAVED` bzw. `DOCUMENT_SAVE_FAILED`.
* `loadDraft()`: Liest gespeicherte Entwurfsdaten aus und befüllt die DOM-Felder via Allowlist-Sanitizer.
* `undo()` / `redo()`: Schrittweises Rückgängigmachen / Wiederherstellen über Snapshot-Stack; publiziert `DOCUMENT_CHANGED`.
* `resetDraft()`: Setzt alle Felder auf DIN-5008-Default-Werte zurück und publiziert `DOCUMENT_CHANGED`.
* `scheduleAutoSave()`: Debounced AutoSave nach Benutzerinaktivität (500 ms).
* `destroy()`: Bereinigt EventBus-Listener.

### 2. `02-settings-manager.js` (Layout & Plattform-Schalter)
* `constructor()`: Bindet UI-Elemente für Layout (Form A/B), Theme und Schalter.
* `init()`: Lädt gespeicherte Einstellungen und injiziert Fonts.
* `applySettings()`: Synchronisiert Radio-Controls und semantische Switches mit dem State.
* `applyThemeDim(dim)`: Setzt CSS Custom Property `--theme-dim` für stufenloses Darkmode-Dimming.
* `updateSettings()`: Persistiert Einstellungsänderungen via `StorageManager`.
* `initFontInjection()` / `injectFont(base64Font)`: Injiziert Offline-WOFF2-Fonts via `@font-face`.
* `updateFontStatusUI(hasCustomFont)`: Aktualisiert Schriftstatus in der Sidebar.
* `attachListeners()`: Event-Handler für Theme, Layout und den semantischen `<input type="checkbox" switch id="btn-hilfslinien-switch">`.

### 3. `03-ui-protections.js` (Eingabeschutz & Listen-Integrität)
* `constructor()`: Registriert geschützte Selektoren (`multiLineIds`, `maxTwoLinesIds`).
* `init()`: Initialisiert Tasten- und Paste-Schutz.
* `enforceLineLimits()`: Fängt Enter-Taste auf einzeiligen Feldern ab und begrenzt Betreff/Postvermerk auf max. 2 Zeilen (130 Zeichen). Behandelt Pasting mit Zeilenumbruch-Einebnung (`pastedText.replace(/[\r\n]+/g, ' ')`). (Single-Line Plaintext-Schutz ist nativ über `contenteditable="plaintext-only"` und `enterkeyhint="done"` gelöst).
* `protectAnlagenList()`: Verhindert die Löschung des letzten Listenelements in `#anlagen-text`.
* `ensureListStructure(anlagen)`: Stellt sicher, dass `#anlagen-text` stets ein valides `<ul><li>`-Gerüst behält.

### 4. `04-sanitize.js` (Rich-Text-Sanitizer & Allowlist-Guard)
* `sanitizeRichText(htmlString, options)`: Bereinigt HTML-Strings für den Brieftext (`#text`) und Anlagen (`#anlagen-text`) vor dem Restore über eine strikte Allowlist (`B`, `STRONG`, `U`, `S`, `BLOCKQUOTE`, `BR`, `DIV`, `P` und optional `UL`/`LI`). Verhindert XSS und unerlaubte Attribute/Tags.
*(Hinweis: Die frühere Floating-Toolbar `31-format-toolbar.js` wurde zugunsten des robusteren **Rich-Text-Light**-Ansatzes eliminiert: Fett/Unterstrichen erfolgen browser-nativ via Chromium Core, Blockquote via `Ctrl+Q` in `03-ui-protections.js`, und Paste filtert fremdes Styling bei Erhalt aller Zeilenumbrüche).*

### 5. `32-toast.js` (Native Popover Top-Layer Queue & EventBus-Subscriber)
* `initToastSystem()`: Ermittelt `#hinweis-v4` (`popover="manual"`) im DOM, bindet Close-Button und abonniert `Events.NOTIFICATION_REQUESTED`.
* `showToast(message, type)`: Zeigt Toast im Top-Layer via `showPopover()`; dedupliziert bei gleicher Nachricht via Timer-Reset.
* `armCloseWatcher()`: Schließt den Toast nativ über `CloseWatcher` bei Esc / Back-Gesture.
* Verwaltet automatischen Lesezeit-Timer (`2000ms + 30ms × Zeichenanzahl`, max. `5000ms`).

### 6. `41-salutation-engine.js` (80/20 Smart Salutation Engine V2)
* `constructor(saveDraftDataCallback = null, settingsContext = null)`: Initialisiert Engine mit 3 B2B-Pärchen; die 951 Vornamen werden aus `data/de_vornamen_gender.json.br` geladen. Publiziert `DOCUMENT_SAVE_REQUESTED` über den EventBus bei Änderungen.
* `init()`: Verdrahtet Empfänger-Eingaben mit Anrede und Grußformel.
* `derive({ firstName, lastName, company, formality })`: Ermittelt treffsicher die Anredeform ("Sehr geehrte(r) Frau/Herr [Nachname],", "Guten Tag...", "Hallo...").
* `getClosing(formality)`: Liefert das harmonische DIN-5008-Gegenstück ("Mit freundlichen Grüßen", "Freundliche Grüße", "Beste Grüße").
* `getFallback(formality)`: Fallback-Anrede ("Sehr geehrte Damen und Herren,").
* `splitTitles(name)`: Erkennt akademische Grade (Dr., Prof.) und Adelspartikel (von, zu, van, de).
* `_applyUIState()` / `_wireRecipientName()` / `_wireManualEdits()`: Reagiert auf Eingaben mit In-Flight-Tippschutz und schützt manuelle Nutzereingaben via `data-dirty="true"` (mit Auto-Reset bei Feldleerung).
* `_validatePunctuation(el, kind)`: Erzwingt DIN-Kommasetzung (Komma nach Anrede, strikt KEIN Komma nach Grußformel) via `NOTIFICATION_REQUESTED`.

### 7. `42-signature.js` (Unterschriften-Manager)
* `constructor(uiContext)`: Verwaltet Bild-Upload und Signatur-Bounding-Box.
* `init()` / `initWysiwyg()`: Bindet Drag, Resize und Rotation der Unterschrift auf dem Briefblatt.
* `applyTransform()`: Setzt Transformations-Matrix auf das Unterschriftenbild.
* `processFile(file)` / `compressImage(bitmap)`: Asynchrone Bildkompression via `createImageBitmap` zur Schonung des LocalStorage.
* `saveAndApply(base64)` / `applyImage(base64)` / `resetImage()`: Speichern, Rendern und Löschen der Signatur.

### 8. `43-geoapify.js` (Remote-Adress-Autocomplete mit Dynamic Target Lock)
* `initAddressServices({ onToast, onSaveDraft })`: Initialisiert Adress-Suche; publiziert `DOCUMENT_SAVE_REQUESTED` und `NOTIFICATION_REQUESTED` bei Fehlen von Callbacks.
* `validateKeyWithHeartbeat(key)`: Prüft Gültigkeit des API-Keys.
* `performAddressSearch(query, localMatches)`: Führt Remote-Suche durch, wenn Offline-Treffer nicht ausreichen.
* `setTargetLock(plz, city)`: Dynamische Sperre des Bonn-Bias zugunsten des erkannten Zielorts.
* `renderSuggestions(suggestions, query)` / `selectSuggestion(item)`: Dropdown-Rendering und Auswahl.

### 9. `44-address-domain.js` (Reine Domain-Funktionen für PLZ- & Adresslogik)
* `normalizePostcode(raw)`: Validiert und bereinigt 5-stellige deutsche Postleitzahlen.
* `resolvePostcode(plz, plzToCityMap, grosskundenMap)`: Zustandsloser Lookup von PLZ zu Ort inkl. Großempfänger-Erkennung (OLG Frankfurt Az. 6 U 170/13).
* `resolveCity(query, cityToPlzMap, plzToCityMap)`: Exakte und präfixbasierte Ortssuche (mind. 2 Zeichen).
* `filterPostcodePrefix(prefix, plzToCityMap)`: Filtert PLZs nach 2–4-stelligen Ziffern-Präfixen.
* `detectPlzInputPattern(raw)`: Erkennt semantische Muster (`plz_exact`, `plz_prefix`, `city_name`, `unknown`).
*(100% reine Funktionen: frei von DOM, Storage, Netzwerk und EventBus; isoliert testbar).*

### 10. `45-address-intelligence.js` (Adress-Domain: Offline Brotli PLZ & Großkunden-Engine + Absender-Sync)
*Ehemals `45-address-intelligence.js` + `44-sender-sync.js` (zusammengeführt am 2026-09-09, Kohäsion: beide bedienen das Empfänger-/Absender-Adressfeld).*
* `initAddressIntelligence()`: Dekomprimiert `de_plz_ort.json.br` (10.831 PLZs) und `de_grosskunden_plz.json.br` (2.258 Großempfänger) via `DecompressionStream('brotli')`.
* `lookupPlz(plz)` / `lookupCity(name)`: Delegiert an pure Domain-Funktionen in `44-address-domain.js`.
* `wireDOM({ onToast, onSaveDraft })`: Verbindet Empfängerfelder mit Popover-Vorschlägen; publiziert `DOCUMENT_SAVE_REQUESTED` und `NOTIFICATION_REQUESTED`.
* `abbreviateName(fullName)`: Erzeugt platzsparende Namenskürzel für die DIN-Rücksendezeile.
* `initSenderSync()`: Verbindet Absender-Formularfelder reaktiv mit der Rücksendezeile.

### 11. `46-clipboard-address-parser.js` (Smart Clipboard Impressum-Parser)
* `parseAddressFromText(rawText)`: Heuristischer 0,1ms Multi-Pass Regex-Parser. Filtert juristischen Müll (Handelsregister HRB, Amtsgerichte, USt-ID, Cookie-Texte) und extrahiert DIN-5008-Anschriften.
* `wireSidebarButton({ onToast, onSaveDraft })`: Verbindet den Sidebar-Button `📋 Zwischenablage lesen` mit dem System; publiziert `DOCUMENT_SAVE_REQUESTED` und `NOTIFICATION_REQUESTED`.
* `showAddressCandidates(candidates)`: Öffnet bei mehreren Standorten das Top-Layer Popover `#clipboard-candidates-popover` zur Ein-Klick-Auswahl.

### 12. `47-date-format.js` (DIN 5008 Datumsformatierung)
* `formatLetterDate()`: Erzeugt DIN-konformes Datum ("4. September 2026", ohne führende Null) via `Intl.DateTimeFormat('de-DE')` mit Temporal-Objekt.
* `applyLetterDate()`: Befüllt das Datumsfeld des Briefes beim Laden.

### 13. `51-storage.js` (State-Layer: System-Konstanten & Persistenz)
* `Constants`: SCHEMA-Version, Storage-Keys, System-Limits und Toast-Meldungen.
* `saveDraft(key, data)` / `loadDraft(key)`: Persistiert Brieftexte im `localStorage`.
* `saveSettings(settings)` / `loadSettings()`: Persistiert Layout-, Theme- und Schalter-Einstellungen.
* `saveCustomFont(base64Font)` / `loadCustomFont()`: Speichert benutzerdefinierte WOFF2-Schrift.
* `saveGeoapifyKey(key)` / `loadGeoapifyKey()`: Speichert API-Key.

### 14. `52-import-export.js` (JSON-Datenaustausch & Backup)
* `buildDinLetterPayload(draft, settings, font)`: Erzeugt valides DIN-Brief-JSON mit Metadaten-Header.
* `parseDinLetterPayload(raw)`: Defensiver Validator für importierte JSON-Dateien (Schutz vor Prototyp-Pollution und XSS).
* `initImportExport({ onSaveDraft, onToast })`: Verdrahtet Export- und Import-Dialoge; publiziert `DOCUMENT_SAVE_REQUESTED` und `NOTIFICATION_REQUESTED`.

### 15. `53-metadata.js` (Dokument-Metadaten für Export)
* `prepare()`: Extrahiert Empfänger und Betreff für standardkonforme PDF-Drucktitel.
* `_injectMetaTags(data)`: Injiziert Meta-Tags in den `<head>`.
* `restore(context)`: Stellt den ursprünglichen DOM-Zustand nach dem Drucken wieder her.

### 16. `main.js` (Composition Root & Bootstrap)
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
- **EventBus (`00-event-bus.js`):** Transport vereinbarter Ereignisse ohne fachliche Kenntnis.
- **Services / Manager:** Koordination von Anwendungsfällen und Zustandsänderungen (`DraftManager`, `SettingsManager`).
- **Domain-Funktionen (`44-address-domain.js`):** reine fachliche Berechnungen ohne DOM-, Storage- oder Netzwerkzugriff.
- **DOM-Adapter / Views:** Lesen von UI-Eingaben und Darstellung von Ergebnissen.
- **Storage-Verantwortliche (`51-storage.js`):** lokale Persistenz gemäß [[ADR-DATA-PERSISTENCE]].

### 3.3 Grenzen der Entkopplung

Nicht jeder Funktionsaufruf wird zu einem Event. Direkte Aufrufe innerhalb eines Moduls sowie synchrone reine Funktionen bleiben Standard. Events werden ausschließlich für die vereinbarte modulübergreifende Kommunikation verwendet.

Ein Event stellt keine erfolgreiche Persistenz und keine fehlerfreie Ausführung aller Subscriber sicher. Solche Ergebnisse werden nur vom jeweils verantwortlichen Service nach erfolgreichem Abschluss veröffentlicht.

---

## 4. Antipattern- & Deprecation-Registry (Verbotene Alt-Funktionen)

Folgende Funktionen und Module aus früheren Versionen (Stand Commit `1b663fa`) wurden **vollständig eliminiert** und sind im gesamten Repository unter Strafe von Build-Fehlern (Fitness Gate) verboten:

| Modul / Komponente | Eliminierte Funktionen / Konstrukte | Status | Verboten durch | Moderner Ersatz (Web Platform 2026) |
| :--- | :--- | :---: | :--- | :--- |
| **`addons/ai-assistant.js`** | On-Device Gemini Nano Rewriter, `#toggle-experimental-ai`, `#btn-ai-rewrite` | 🚫 **ELIMINATED** | KISS-Bereinigung toten Codes | Wegfall der Format-Toolbar machte Addon funktionslos; Prototyp archiviert unter `research/roadmap/`. |
| **`boot-state.js`** | Doppelter Draft-Restore vor `main.js`, DOM-Vorbelegung | 🚫 **ELIMINATED** | KISS SSoT-Doktrin | `DraftManager` in `01-draft-manager.js` ist alleiniger Restore-Owner. |
| **`48-text-fit.js`** | `constructor`, `init`, `scanDOM`, `isOverflowing`, `attachEventListeners`, `notifyToast`, `restoreCaretToEnd`, `initMutationObserver` | 🚫 **HARD BAN** | Catalog A49, Probe P3 | CSS `field-sizing: content`, `overflow: clip`, `text-fit: shrink 60%`, `text-wrap: balance/pretty`. 0 Zeilen JS, 0 ms Layout Thrashing. |
| **`41-salutation-engine.legacy.js`** | `_wireGender`, Radio-Buttons für Geschlecht, NLP-Regexes für Adelstitel/Paare | 🚫 **HARD BAN** | Catalog A58, Prio 1 | 80/20 Smart Engine (`41-salutation-engine.js`), 951 Offline-Vornamen, ContentEditable Dirty-Flag mit Auto-Reset. |
| **`03-ui-protections.js`** | `beforeInputFormatTypes`, `beforeInputParagraphTypes`, BeforeInput-Event-Listener für Einzeiler | 🚫 **HARD BAN** | Catalog A55, Probe P4 | Natives HTML `contenteditable="plaintext-only"` und `enterkeyhint="done"`. Formatierungs- und Umbruchssperre erfolgt nativ in C++. |
| **`32-toast.js`** | `onPointerDown`, `onPointerMove`, `onPointerUp`, `setPointerCapture`, `swipe.startX`, `--swipe-x`, `z-index: 9999` | 🚫 **HARD BAN** | Catalog A56, Probe P5 | Native HTML Popover API (`popover="manual"`) im Top-Layer, CSS `@starting-style` und `transition-behavior: allow-discrete`. |
| **`43-geoapify.js`** | Zippopotam.us Fetch-Kaskaden & synchrone externe PLZ-Lookups | 🚫 **HARD BAN** | Catalog A38, Prio 2 | 72 KB Offline Brotli PLZ & Großempfänger Engine (`45-address-intelligence.js`). 100% DSGVO-konform, 0ms Latenz. |
| **`31-format-toolbar.js`** | Floating Toolbar Popover, Selection-Anchor, manuelle Format-Buttons | 🚫 **ELIMINATED** | Rich-Text-Light Doktrin | Nativer Browser-Support (Ctrl+B/Ctrl+U), Plaintext-Paste & Ctrl+Q in `03-ui-protections.js`. |
| **Global** | `document.execCommand('bold'|'italic'|...)` | 🚫 **HARD BAN** | Catalog A48, A52 | W3C Selection & Range API sowie native Browser-Shortcuts (`Ctrl+B`, `Ctrl+U`) und Rich-Text-Light. |
| **Global** | `new Date()`, `Date.now()`, `Date.parse()` | 🚫 **HARD BAN** | Catalog TM1, A48 | Temporal API (`Temporal.Now.plainDateISO()`) und standardkonformes DIN-Formatting. |

---

## 5. Konsequenzen & Entwickler-Direktiven

* **Zero Frameworks:** Keine Einführung von React, Vue, Svelte, Lit oder jQuery.
* **Keine Layout-Berechnungen in JS:** Sobald eine Funktion `offsetWidth`, `scrollWidth`, `getBoundingClientRect` o. ä. in einer Schleife aufruft, um Stile zu setzen, greift die Antipattern-Sonde P3.
* **Top-Layer-Mandat:** Modals (`<dialog>`) und Toasts/Dropdowns (`[popover]`) rendern ausschließlich im Browser-Top-Layer. Niemals manuelle `z-index`-Werte über 100 vergeben.
* **Single Source of Truth:** Änderungen an JavaScript-Signaturen, Modulen oder Aufgabenbereichen müssen zwingend in diesem Dokument (`ADR-JS.md`) gepflegt werden.