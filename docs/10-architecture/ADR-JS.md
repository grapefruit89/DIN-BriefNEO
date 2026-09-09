---
id: adr-js
title: "ADR-JS: JavaScript Architecture, Constraints & Single Source of Truth (SSOT)"
type: adr
status: active
created: '2026-06-26'
updated: '2026-09-09'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
doc_links:
  - ADR-HTML
  - ADR-CSS
  - ADR-ANTIPATTERN
  - longevity-guidelines
code_links:
  - website/js/01-draft-manager.js
  - website/js/02-settings-manager.js
  - website/js/03-ui-protections.js
  - website/js/31-format-toolbar.js
  - website/js/32-toast.js
  - website/js/41-salutation-engine.js
  - website/js/42-signature.js
  - website/js/43-geoapify.js
  - website/js/45-address-intelligence.js
  - website/js/46-clipboard-address-parser.js
  - website/js/47-date-format.js
  - website/js/51-storage.js
  - website/js/53-metadata.js
  - website/js/main.js
  - website/js/addons/ai-assistant.js
error_patterns:
  - javascript constraints
  - js as a crutch
  - execCommand verboten
  - selection range api
  - view transitions
  - temporal api
  - localstorage
  - antipattern
supersedes: []
depends_on: []
---

# ADR-JS: JavaScript Architecture, Constraints & Single Source of Truth (SSOT)

## 1. Context & Problemstellung

**Das Antipattern "JS as a Crutch" vs. Lean Web Platform 2026.**

Klassische Webanwendungen missbrauchen JavaScript häufig für visuelle Effekte, Layout-Berechnungen, Textumbruch-Messungen und State-Synchronisationen, die moderne Browser nativ und hochperformant in C++ lösen können.
In DIN-Brief Neo ist JavaScript streng auf eine **logische Begleitschicht** reduziert (< 18 KB Core-Bundle). Es dient als Bindeglied für Datenpersistenz, DOM-Range-Manipulationen und Offline-Suchalgorithmen.

---

## 2. Grundlegende Architektur-Entscheidungen

1. **Striktes Verbot von JS-Layouting & DOM-Messschleifen:** JS darf keine CSS-Stile für Layout, Elementpositionen oder Textgrößen berechnen (Toolbar nutzt CSS Anchor Positioning, Text-Fit nutzt `field-sizing: content` und `text-fit: shrink`).
2. **Verbot von `document.execCommand`:** Textformatierungen erfolgen ausschließlich über die standardkonforme W3C Selection & Range API.
3. **View Transitions API:** Zustandswechsel (z. B. Formularwechsel Form A/B, Theme-Wechsel) nutzen `document.startViewTransition()` statt JS-Animationen.
4. **Reglementierte Aufgaben für JavaScript:**
   * W3C Selection & Range API (Textformatierung im Fließtext)
   * Lokale Datenpersistenz via `localStorage` (garantierter Offline-Betrieb unter `file:///`)
   * Deterministisches Offline-PLZ- und Großempfänger-Lookup via `DecompressionStream('brotli')`
   * Deterministischer 0,1ms Clipboard-Impressum-Parser mit juristischem Müllfilter
   * Native Popover-Queue & Lifecycle-Steuerung für Toasts im Top-Layer
   * Canvas-Bildkompression für Unterschriften (`createImageBitmap`)

---

## 3. Single Source of Truth: Aktive Module & Funktions-Registry

Das Projekt verfügt über exakt **14 aktive JavaScript-Module** unter `website/js/` (13 Fach-Module + Bootstrap `main.js`), dazu 1 Add-on. Letzte Konsolidierung 2026-09-09: `44-sender-sync.js` → in `45-address-intelligence.js` (Adress-Domain), `51-constants.js` + `52-storage.js` → `51-storage.js` (State-Layer); `healthcheck.js` wurde bereits aus dem Produkt entfernt:

### 1. `01-draft-manager.js` (Entwurfs- & History-Management)
* `constructor(onSaveCallback)`: Initialisiert den Manager und den History-Stack.
* `saveDraft()`: Serialisiert den aktuellen Briefentwurf und speichert ihn in `localStorage`.
* `loadDraft()`: Liest gespeicherte Entwurfsdaten aus und befüllt die DOM-Felder.
* `undo()` / `redo()`: Schrittweises Rückgängigmachen / Wiederherstellen über internen Snapshot-Stack.
* `resetDraft()`: Setzt alle Felder auf DIN-5008-Default-Werte zurück.
* `scheduleAutoSave()`: Debounced AutoSave nach Benutzerinaktivität.
* `_updateDocumentTitle()`: Aktualisiert den Fenstertitel dynamisch basierend auf Empfänger und Betreff.

### 2. `02-settings-manager.js` (Layout & Plattform-Schalter)
* `constructor()`: Bindet UI-Elemente für Layout (Form A/B), Theme und Schalter.
* `init()`: Lädt gespeicherte Einstellungen und injiziert Fonts.
* `applySettings()`: Synchronisiert Radio-Controls und semantische Switches mit dem State.
* `applyThemeDim(dim)`: Setzt CSS Custom Property `--theme-dim` für stufenloses Darkmode-Dimming.
* `updateSettings()`: Persistiert Einstellungsänderungen via `StorageManager`.
* `initFontInjection()` / `injectFont(base64Font)`: Injiziert Offline-WOFF2-Fonts via `@font-face`.
* `updateFontStatusUI(hasCustomFont)`: Aktualisiert Schriftstatus in der Sidebar.
* `attachListeners()`: Event-Handler für Theme, Layout und den semantischen `<input type="checkbox" switch id="btn-guides-switch">`.

### 3. `03-ui-protections.js` (Eingabeschutz & Listen-Integrität)
* `constructor()`: Registriert geschützte Selektoren (`multiLineIds`, `maxTwoLinesIds`).
* `init()`: Initialisiert Tasten- und Paste-Schutz.
* `enforceLineLimits()`: Fängt Enter-Taste auf einzeiligen Feldern ab und begrenzt Betreff/Postvermerk auf max. 2 Zeilen (130 Zeichen). Behandelt Pasting mit Zeilenumbruch-Einebnung (`pastedText.replace(/[\r\n]+/g, ' ')`). (Single-Line Plaintext-Schutz ist nativ über `contenteditable="plaintext-only"` und `enterkeyhint="done"` gelöst).
* `protectAnlagenList()`: Verhindert die Löschung des letzten Listenelements in `#anlagen-text`.
* `ensureListStructure(anlagen)`: Stellt sicher, dass `#anlagen-text` stets ein valides `<ul><li>`-Gerüst behält.

### 4. `31-format-toolbar.js` (Textformatierung & Sanitization)
* `constructor(brieftextEl, toolbarEl, onSaveDraft)`: Bindet Toolbar an den Fließtext.
* `init()`: Registriert Command-Buttons für Fett, Kursiv, Unterstrichen, Zitat und Kommentar.
* `sanitizeNode(node)`: Bereinigt eingefügte HTML-Knoten von unerlaubten Inline-Styles und Attributen.
* `toggleFormat(tagName)`: Schaltet Inline-Formatierungen über Range-Splitting um.

### 5. `32-toast.js` (Native Popover Top-Layer Queue)
* `constructor()`: Initialisiert schlanke FIFO-Queue mit Deduplizierung und State.
* `initDOM()`: Ermittelt `#toast-v4` (`popover="manual"`) im DOM und bindet Hover-Pause sowie Close-Button.
* `show(message, type, options)`: Fügt Toast zur Queue hinzu; dedupliziert wiederholte Nachrichten via Badge-Counter (`x2`, `x3`) und Triggering von CSS-Shake.
* `update(id, message, type)`: Aktualisiert laufende Progress-Toasts.
* `processQueue()`: Zeigt den nächsten Toast nativ im Top-Layer via `dom.global.showPopover()`.
* `startTimer(duration, sticky)` / `pauseTimer()` / `resumeTimer()` / `clearTimer()`: Timer-Steuerung.
* `cleanupPopover()`: Schließt den Toast deklarativ via `dom.global.hidePopover()`.
* `showToast(...)` / `updateToast(...)` / `initToastSystem()`: Exportierte globale Hilfsfunktionen.

### 6. `41-salutation-engine.js` (80/20 Smart Salutation Engine V2)
* `constructor(saveDraftDataCallback)`: Initialisiert Engine mit 3 B2B-Pärchen; die 951 Vornamen werden aus `data/de_vornamen_gender.json.br` geladen (Brotli via DecompressionStream, Muster wie ADR-006).
* `init()`: Verdrahtet Empfänger-Eingaben mit Anrede und Grußformel.
* `derive({ firstName, lastName, company, formality })`: Ermittelt treffsicher die Anredeform ("Sehr geehrte(r) Frau/Herr [Nachname],", "Guten Tag...", "Hallo...").
* `getClosing(formality)`: Liefert das harmonische DIN-5008-Gegenstück ("Mit freundlichen Grüßen", "Freundliche Grüße", "Beste Grüße").
* `getFallback(formality)`: Fallback-Anrede ("Sehr geehrte Damen und Herren,").
* `splitTitles(name)`: Erkennt akademische Grade (Dr., Prof.) und Adelspartikel (von, zu, van, de).
* `_applyUIState()` / `_wireRecipientName()` / `_wireManualEdits()`: Reagiert auf Eingaben mit In-Flight-Tippschutz und schützt manuelle Nutzereingaben via `data-dirty="true"` (mit Auto-Reset bei Feldleerung).
* `_validatePunctuation(el, kind)`: Erzwingt DIN-Kommasetzung (Komma nach Anrede, strikt KEIN Komma nach Grußformel).

### 7. `42-signature.js` (Unterschriften-Manager)
* `constructor(uiContext)`: Verwaltet Bild-Upload und Signatur-Bounding-Box.
* `init()` / `initWysiwyg()`: Bindet Drag, Resize und Rotation der Unterschrift auf dem Briefblatt.
* `applyTransform()`: Setzt Transformations-Matrix auf das Unterschriftenbild.
* `processFile(file)` / `compressImage(bitmap)`: Asynchrone Bildkompression via `createImageBitmap` zur Schonung des LocalStorage.
* `saveAndApply(base64)` / `applyImage(base64)` / `resetImage()`: Speichern, Rendern und Löschen der Signatur.

### 8. `43-geoapify.js` (Remote-Adress-Autocomplete mit Dynamic Target Lock)
* `initAddressServices({ onToast, onSaveDraft })`: Initialisiert Adress-Suche.
* `validateKeyWithHeartbeat(key)`: Prüft Gültigkeit des API-Keys.
* `performAddressSearch(query, localMatches)`: Führt Remote-Suche durch, wenn Offline-Treffer nicht ausreichen.
* `setTargetLock(plz, city)`: Dynamische Sperre des Bonn-Bias zugunsten des erkannten Zielorts.
* `renderSuggestions(suggestions, query)` / `selectSuggestion(item)`: Dropdown-Rendering und Auswahl.

### 9. `45-address-intelligence.js` (Adress-Domain: Offline Brotli PLZ & Großkunden-Engine + Absender-Sync)
*Ehemals `45-address-intelligence.js` + `44-sender-sync.js` (zusammengeführt am 2026-09-09, Kohäsion: beide bedienen das Empfänger-/Absender-Adressfeld).*
* `initAddressIntelligence()`: Dekomprimiert `de_plz_ort.json.br` (10.831 PLZs) und `de_grosskunden_plz.json.br` (2.258 Großempfänger) in unter 1 ms via `DecompressionStream('brotli')`.
* `lookupPlz(plz)`: Sofort-Lookup von PLZ zu Ort und Bundesland.
* `lookupGrosskunde(plz)`: Erkennt Großkunden (Bundestag, Kanzleramt, Konzerne) und setzt Straßenzeile normgerecht auf entbehrlich.
* `searchByCity(cityName)`: Bidirektionale Suche nach Ort oder Stadtteil.
* `wireAutocomplete(inputField, options)`: Verbindet Adressfelder mit dem Offline-Kandidaten-Popover.
* `abbreviateName(fullName)`: Erzeugt platzsparende Namenskürzel für die DIN-Rücksendezeile.
* `initSenderSync()`: Verbindet Absender-Formularfelder reaktiv mit der Rücksendezeile; `sync()` schreibt Absenderzeile und Maschinenschrift synchron zusammen.

### 10. `46-clipboard-address-parser.js` (Smart Clipboard Impressum-Parser)
* `parseAddressFromText(rawText)`: Heuristischer 0,1ms Multi-Pass Regex-Parser. Filtert juristischen Müll (Handelsregister HRB, Amtsgerichte, USt-ID, Cookie-Texte) und extrahiert DIN-5008-Anschriften.
* `wireSidebarButton({ onToast, onSaveDraft })`: Verbindet den Sidebar-Button `📋 Zwischenablage lesen` mit dem System.
* `showAddressCandidates(candidates)`: Öffnet bei mehreren Standorten das Top-Layer Popover `#clipboard-candidates-popover` zur Ein-Klick-Auswahl.

### 11. `47-date-format.js` (DIN 5008 Datumsformatierung)
* `formatLetterDate()`: Erzeugt DIN-konformes Datum ("4. September 2026", ohne führende Null) via `Intl.DateTimeFormat('de-DE')` mit Temporal-Objekt — keine manuelle Monatstabelle (Context7: Intl.DateTimeFormat.format() akzeptiert Temporal-Instanzen nativ).
* `applyLetterDate()`: Befüllt das Datumsfeld des Briefes beim Laden.

**Down-Breaking vom 2026-09-09 (17 → 16 Zeilen, Monatsblock eliminiert, Config auf Einzeiler verdichtet):**
Die Vorgängerversion pflegte ein `MONTHS`-Array (12 handgepflegte Strings), Index-Arithmetik (`MONTHS[t.month - 1]`) und `padStart(2, '0')` — letzteres erzeugte "04. September" und widersprach damit DIN 5008 sowie dem HTML-Placeholder (`placeholder="4. September 2026"`). Ersetzt durch `Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })`.

| Bestandteil | Status | Grund |
| :--- | :---: | :--- |
| `MONTHS`-Array, Index-Mathematik, `padStart` | 🗑️ **eliminiert** | Platform-ICU liefert Locale-Strings deterministisch und normgerecht |
| `Intl.DateTimeFormat('de-DE', { dateStyle: 'long' })` (1 Zeile) | 🔒 **irreduzibel** | Temporal ist die Datums-Mathe-API (Kalender, Zeitzonen, Arithmetik); Locale-Formatierung ist bewusst ein Job von Intl, nicht von Temporal |
| `formatLetterDate()` + `@type {any}`-Cast | 🔒 **irreduzibel** | Ortszeit `Europe/Berlin` (DIN-Zustelldatum); Cast nur, weil die TS-Libs die Intl↔Temporal-Overloads noch nicht führen (Runtime läuft) |
| `applyLetterDate()` (DOM-Glue) | 🔒 **irreduzibel** | Kein Datums-API schreibt Text in `#datum` — das ist App-Verdrahtung, keine Datumstechnik |

Die Datei ist als Single-Responsibility-Modul ("Datum-Stempel") damit am irreduziblen Minimum. Verbleibende Verkleinerungsoptionen (nicht umgesetzt): **B)** Funktionen nach `main.js` inline ziehen und das Modul löschen (47 importiert nichts — zirkelfrei; konträr zur Regel "Bootstrap bleibt dünn"). *(Option A — `dateStyle: 'long'` als Einzeiler — wurde am 2026-09-09 umgesetzt; Verifikation: de-DE-ICU liefert "4. September 2026" / "1. Januar 2026" identisch zur Komponenten-Konfiguration.)*

### 12. `51-storage.js` (State-Layer: System-Konstanten & Persistenz)
*Ehemals `51-constants.js` + `52-storage.js` (zusammengeführt am 2026-09-09, Kohäsion: `Constants.STORAGE` definiert die Keys, `StorageManager` konsumiert sie).*
* `Constants`: SCHEMA-Version, Storage-Keys, System-Limits (History-Cap, Debounce, Font-Größe) und standardisierte Toast-Meldungen.
* `saveDraft(key, data)` / `loadDraft(key)`: Persistiert Brieftexte im `localStorage`.
* `saveSettings(settings)` / `loadSettings()`: Persistiert Layout-, Theme- und Schalter-Einstellungen.
* `saveCustomFont(base64Font)` / `loadCustomFont()`: Speichert benutzerdefinierte WOFF2-Schrift.
* `saveGeoapifyKey(key)` / `loadGeoapifyKey()`: Speichert API-Key.

### 13. `53-metadata.js` (Dokument-Metadaten für Export)
* `prepare()`: Extrahiert Empfänger und Betreff für standardkonforme PDF-Drucktitel.
* `_injectMetaTags(data)`: Injiziert Meta-Tags in den `<head>`.
* `restore(context)`: Stellt den ursprünglichen DOM-Zustand nach dem Drucken wieder her.

### 14. `main.js` (Bootstrap)
* `initApp()`: Zentraler Bootstrap beim Laden von `DOMContentLoaded`. Initialisiert alle Module in geordneter Reihenfolge.
* `syncPostvermerkFromSidebar()`: Synchronisiert Auswahlliste mit dem Postvermerkfeld.
* `attachGlobalListeners(...)`: Registriert globale Tastenkombinationen (Strg+S, Strg+Z, Strg+Y, Strg+P).

### 15. `addons/ai-assistant.js` (Experimenteller On-Device KI-Assistent via Gemini Nano)
* `constructor()`: Liest Opt-in-Status aus `localStorage` (`din_addon_ai_enabled`) und initialisiert Element-Referenzen (`#toggle-experimental-ai`, `#btn-ai-rewrite`).
* `init()`: Asynchroner, 100% crash-proof Bootstrapper. Prüft `window.ai`, `window.ai.rewriter` und `window.ai.writer` auf Verfügbarkeit (`'readily'` / `'after-download'`). Fällt bei Nicht-Unterstützung geräuschlos aus (Silent Degradation).
* `_checkAvailability()`: Ermittelt den Verfügbarkeitsstatus der lokalen KI-Engine.
* `_updateUIUnsupported(reason)` / `_updateUISupported(statusText)`: Schaltet den Sidebar-Switch aktiv bzw. disabled mit erklärendem Tooltip.
* `_attachListeners()`: Reagiert auf den W3C `<input switch>` in der Sidebar und blendet den Format-Toolbar-Button `#btn-ai-rewrite` dynamisch ein/aus.
* `rewriteSelection()`: Liest Text über die W3C Selection & Range API aus und formuliert ihn lokal via `window.ai.rewriter.create({ tone: 'more-formal', length: 'as-is' })` um. Ersetzt den Inhalt inline via `range.deleteContents()` und `range.insertNode()`, triggert AutoSave.

---

## 4. Antipattern- & Deprecation-Registry (Verbotene Alt-Funktionen)

Folgende Funktionen und Module aus früheren Versionen (Stand Commit `1b663fa`) wurden **vollständig eliminiert** und sind im gesamten Repository unter Strafe von Build-Fehlern (Fitness Gate) verboten:

| Modul / Komponente | Eliminierte Funktionen / Konstrukte | Status | Verboten durch | Moderner Ersatz (Web Platform 2026) |
| :--- | :--- | :---: | :--- | :--- |
| **`48-text-fit.js`** | `constructor`, `init`, `scanDOM`, `isOverflowing`, `attachEventListeners`, `notifyToast`, `restoreCaretToEnd`, `initMutationObserver` | 🚫 **HARD BAN** | Catalog A49, Probe P3 | CSS `field-sizing: content`, `overflow: clip`, `text-fit: shrink 60%`, `text-wrap: balance/pretty`. 0 Zeilen JS, 0 ms Layout Thrashing. |
| **`41-salutation-engine.legacy.js`** | `_wireGender`, Radio-Buttons für Geschlecht, NLP-Regexes für Adelstitel/Paare | 🚫 **HARD BAN** | ADR-ANTIPATTERN, Prio 1 | 80/20 Smart Engine (`41-salutation-engine.js`), 951 Offline-Vornamen, ContentEditable Dirty-Flag mit Auto-Reset. |
| **`03-ui-protections.js`** | `beforeInputFormatTypes`, `beforeInputParagraphTypes`, BeforeInput-Event-Listener für Einzeiler | 🚫 **HARD BAN** | ADR-ANTIPATTERN Abs. 14, Probe P4 | Natives HTML `contenteditable="plaintext-only"` und `enterkeyhint="done"`. Formatierungs- und Umbruchssperre erfolgt nativ in C++. |
| **`32-toast.js`** | `onPointerDown`, `onPointerMove`, `onPointerUp`, `setPointerCapture`, `swipe.startX`, `--swipe-x`, `z-index: 9999` | 🚫 **HARD BAN** | ADR-ANTIPATTERN Abs. 15, Probe P5 | Native HTML Popover API (`popover="manual"`) im Top-Layer, CSS `@starting-style` und `transition-behavior: allow-discrete`. |
| **`43-geoapify.js`** | Zippopotam.us Fetch-Kaskaden & synchrone externe PLZ-Lookups | 🚫 **HARD BAN** | Catalog A38, Prio 2 | 72 KB Offline Brotli PLZ & Großempfänger Engine (`45-address-intelligence.js`). 100% DSGVO-konform, 0ms Latenz. |
| **`02-settings-manager.js`** | Radio-Segmented-Controls für Hilfslinien (`btn-guides-on`, `btn-guides-off`) | ⚠️ **DEPRECATED** | ADR-ANTIPATTERN Abs. 16, Prio 5 | Semantisches `<input type="checkbox" switch id="btn-guides-switch">`. Direkte CSS `:has()` Auswertung ohne JS-Synchronisation. |
| **Global** | `document.execCommand('bold'|'italic'|...)` | 🚫 **HARD BAN** | Catalog A48, ADR-ANTIPATTERN Abs. 4 | W3C Selection & Range API in `31-format-toolbar.js` sowie native Command Invokers. |
| **Global** | `new Date()`, `Date.now()`, `Date.parse()` | 🚫 **HARD BAN** | Catalog TM1, A48 | Temporal API (`Temporal.Now.plainDateISO()`) und standardkonformes DIN-Formatting. |

---

## 5. Konsequenzen & Entwickler-Direktiven

* **Zero Frameworks:** Keine Einführung von React, Vue, Svelte, Lit oder jQuery.
* **Keine Layout-Berechnungen in JS:** Sobald eine Funktion `offsetWidth`, `scrollWidth`, `getBoundingClientRect` o. ä. in einer Schleife aufruft, um Stile zu setzen, greift die Antipattern-Sonde P3.
* **Top-Layer-Mandat:** Modals (`<dialog>`) und Toasts/Dropdowns (`[popover]`) rendern ausschließlich im Browser-Top-Layer. Niemals manuelle `z-index`-Werte über 100 vergeben.
* **Single Source of Truth:** Änderungen an JavaScript-Signaturen, Modulen oder Aufgabenbereichen müssen zwingend in diesem Dokument (`ADR-JS.md`) gepflegt werden.