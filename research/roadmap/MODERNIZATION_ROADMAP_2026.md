# Modernisierungs-Roadmap 2026: DIN-Brief Neo (Native Web Platform)

> **Status:** Analysiert & Konsolidiert  
> **Basis:** DIN-Brief Neo (`origin/main`) vs. Chrome Platform Status 2026 (433 Web Features)  
> **Ziel:** Maximale Reduktion von JavaScript und Legacy-CSS durch native HTML5-, CSS4/5- und moderne Browser-APIs.

---

## Executive Summary: Einsparungspotenziale

| Disziplin | Aktueller Zustand | Potenzial mit Web-Standards 2026 | Haupthebel |
| :--- | :--- | :--- | :--- |
| **JavaScript** | ~1.225 Zeilen in 13 Modulen | **~61 % Code-Reduktion** (~470 Zeilen) | `plaintext-only`, `field-sizing`, Sanitizer API, Popover API |
| **CSS** | ~1.370 Zeilen in 5 Dateien | **~40 % Bereinigung** (~830 Zeilen) | `text-box-trim`, `light-dark()`, `@starting-style`, `@page` |
| **HTML / DOM** | Komplexe `sr-only` Radio-Workarounds | **100 % Deklarativ & Barrierefrei** | `<input switch>`, `interesttarget`, Customizable `<select>` |

---

## 1. JavaScript Modernisierungs-Tabelle (JS durch native APIs ersetzen)

| Modul / Datei | Heutige JS-Implementierung | Chrome 2026 Web Feature | Ersetzungsgrad | Konkreter Nutzen & Einsparung |
| :--- | :--- | :--- | :--- | :--- |
| **02-settings-manager.js** | Eigene Toggle-Logik, Event-Listener & `.is-active` Klassen für Darkmode & Hilfslinien | `<input type="checkbox" switch>` (ID: 5178587742339072) | **100 % Nativ** | Keine Wrapper-Divs, keine ARIA-Synchronisation per JS nötig. Spart ~40 Zeilen JS. |
| **03-ui-protections.js** | Keydown-Abfangen von Enter, Regex-Filterung von Zeilenumbrüchen in einzeiligen Feldern | `contenteditable="plaintext-only"` & `enterkeyhint="done"` | **100 % Nativ** | Browser verbietet Zeilenumbrüche und HTML-Formatting nativ auf Parser-Ebene. Spart ~115 Zeilen JS. |
| **31-format-toolbar.js** | Rekursive DOM-Sanitizer `traverseNodes()` / `sanitizeNode()` gegen unerlaubte Tags/Styles | Native HTML Sanitizer API (`Element.setHTMLUnsafe()`) | **100 % Nativ** | C++-native Ausführung in der Browser-Engine. Sicherer gegen XSS und spart ~210 Zeilen JS-Parsing. |
| **32-toast.js** | Manuelles z-index-Handling, DOM-Mounting, `setTimeout`-Timer & CSS-Klassen für Einblendung | Popover API (`popover="manual"`) + CSS `@starting-style` | **100 % Nativ** | Rendert nativ im Browser Top-Layer. Übergänge laufen rein in CSS ohne JS-Transitions-Timer. Spart ~180 Zeilen JS. |
| **48-text-fit.js** | Polling von `scrollWidth > clientWidth` & MutationObserver für Textanpassung | CSS `field-sizing: content` | **100 % Nativ** | Inputs und Textareas wachsen rein deklarativ mit dem Text. Verhindert Layout Thrashing / Reflows komplett. Spart ~120 Zeilen JS. |
| **47-date-format.js** | Manuelles Zusammenbauen von Tag/Monat/Jahr mit `Date()`-Methoden | `Temporal.Now.plainDateISO()` / `Intl.DateTimeFormat` | **100 % Nativ** | Keine Padding-Funktionen oder Monats-Arrays nötig. Standardkonform nach DIN 5008. Spart ~17 Zeilen JS. |
| **31-format-toolbar.js / main.js** | Dutzende `button.addEventListener('click', ...)` für Dialoge und Menüs | Invoker Buttons (`command`, `commandfor`, `invoketarget`) | **80 % Deklarativ** | Buttons öffnen/schließen Popovers und Dialoge direkt im HTML ohne JavaScript-Handler. |
| **42-signature.js** | Manuelle Canvas 2D Draw-Calls, Skalierung & Base64-Encodings | `createImageBitmap` + WebP/AVIF Encoding Streams | **60 % Modernisiert** | Asynchrone Bildverarbeitung ohne Blockierung des UI-Threads. |

---

## 2. CSS Modernisierungs-Tabelle (Hacks & Workarounds ablösen)

| Datei / Bereich | Heutige CSS-Technik & Problem | Chrome 2026 CSS-Feature | Konkreter Vorteil für DIN-Brief Neo |
| :--- | :--- | :--- | :--- |
| **layout.css**<br>*(DIN 5008 Maße)* | `margin-top: 45mm` mit ungenauen `calc()`-Korrekturen wegen unsichtbarem Font-Ascender | `text-box-trim: both`<br>`text-box-edge: cap alphabetic` | **Echte Millimeter-Genauigkeit:** Schneidet den Schriftart-Leerraum exakt an der Versalhöhe und Grundlinie ab. 45 mm sind jetzt auf Druck und Screen exakt 45 mm. |
| **layout.css**<br>*(Falz- & Lochmarken)* | Starres `position: absolute; left: 0; top: 105mm` mit Anfälligkeit für Zoom-Verschiebungen | CSS Anchor Positioning (`anchor()`, `position-anchor`) | Verankert Falz- und Lochmarken direkt an den echten Rändern des DIN-A4-Blattcontainers. |
| **variables.css**<br>*(Farb-Theming)* | Doppelte Definition aller Variablen in `:root` und `.theme-dark` / `[data-theme='dark']` | CSS `light-dark(#light, #dark)` Funktion | Halbiert die Theming-Deklarationen. Der Browser schaltet Tokens automatisch nach `color-scheme` um. |
| **variables.css**<br>*(Farb-Nuancen)* | Statische Hilfs-Farbcodes für Dim-, Hover- und Border-Zustände | CSS `color-mix(in srgb, ...)` & OKLCH | Farbnuancen und Transparenzen werden dynamisch berechnet: `color-mix(in srgb, var(--paper) 90%, black)`. |
| **floating.css**<br>*(Toasts & Dialoge)* | `@keyframes toastSlideIn` und z-index-Kämpfe (`z-index: 1000+`) | CSS `@starting-style` & `allow-keywords` | Sanfte Transitions von `display: none` auf `display: block` und weiche Höhen-Animationen (`height: auto`). |
| **layout.css**<br>*(Typografie)* | Unkontrollierte Zeilenumbrüche und einzelne Wörter am Zeilenende | `text-wrap: balance`<br>`text-wrap: pretty` | Verhindert 'Waisen'-Wörter im Brieftext und balanciert Betreff- und Adresszeilen optisch perfekt aus. |
| **print.css**<br>*(Paginierung)* | Künstlich im DOM verankerte Fußzeilen mit absoluter Positionierung | `@page` Margin-Boxes (`@bottom-right { content: counter(page); }`) | Echte native Druck-Paginierung ('Seite X von Y') direkt durch die Browser-Druck-Engine. |

---

## 3. HTML & DOM Modernisierungs-Tabelle (Semantik & Barrierefreiheit)

| Komponente in index.html | Heutiges HTML-Konstrukt | Chrome 2026 HTML/DOM Standard | Barrierefreiheit & UX-Vorteil |
| :--- | :--- | :--- | :--- |
| **Sidebar Schalter**<br>*(Zeilen 51–89)* | `<input type="radio" class="sr-only">` + `<label>` + CSS `:has()` Hacks | `<input type="checkbox" switch id="...">` | Nativer Plattform-Schalter (OS-Look), native Tastatursteuerung (Space/Pfeile), kein Wrapper-Code. |
| **Button-Tooltips**<br>*(Form A/B, Toolbar)* | `title="..."` (reagiert verzögert, auf Mobile nicht nutzbar, unstylebar) | `interesttarget="tip-id"`<br>`<div id="tip-id" popover="hint">` | Öffnet Tooltips bei Hover und Tastaturfokus verzögerungsfrei; voll über CSS im Top-Layer anpassbar. |
| **Postvermerk-Auswahl**<br>*(Zeilen 90–104)* | Standard `<select>` mit unflexibler Betriebssystem-Darstellung | Customizable `<select>` | Ermöglicht freies Styling des Auswahlbuttons und der Optionen (mit Icons und DIN-Kürzeln). |
| **Dialog- & Menü-Trigger**<br>*(Reset, Print, Sidebar)* | `button.addEventListener('click')` in JavaScript | `commandfor="dialog-id" command="show-modal"` | Vollständig deklarative Aktionssteuerung direkt im HTML-Markup. |

---

## Ordnerstruktur & Dateiablage

```text
C:\Users\morit\Documents\dinbrief-temp\
├── research_scripts\
│   ├── chrome_scraper.py            # API-Scraper für Chromestatus 2026
│   ├── js_extraction.py             # Analyse aller JS-Funktionen im Repo
│   ├── css_extraction.py            # Extraktion von Selektoren, Variablen & @media
│   ├── html_extraction.py           # DOM-, Tag- und Form-Analyse von index.html
│   ├── build_roadmap_js.py          # Generator für JS-Feature-Abgleich
│   ├── build_roadmap_css.py         # Generator für CSS-Feature-Abgleich
│   ├── build_roadmap_html.py        # Generator für HTML-Feature-Abgleich
│   ├── repo_tool_update.ps1         # Git Pull Tool für DIN-Brief Neo
│   └── repo_tool_validate.ps1       # Test- und Validierungs-Tool
├── research_results\
│   ├── chrome_features_2026.json    # Rohdaten aller 433 Chrome-Features
│   ├── chrome_features_2026_overview.txt # Formatierte Übersicht aller Chrome-Features
│   ├── js_extraction_overview.txt   # Detail-Liste aller extrahierten JS-Funktionen
│   ├── js_extraction_summary.txt    # Strukturübersicht der 13 JS-Module
│   ├── css_extraction_overview.txt  # Selektoren- und Regelliste des Projekt-CSS
│   ├── css_extraction_summary.txt   # Architekturübersicht des Projekt-CSS
│   ├── html_extraction_overview.txt # Detaillierte DOM- und Tag-Aufstellung
│   ├── html_extraction_summary.txt  # Zusammenfassung des HTML-Aufbaus
│   ├── js_targeted_findings_2026.json   # 266 passende JS-Treffer
│   ├── css_targeted_findings_2026.json  # 128 passende CSS-Treffer
│   └── html_targeted_findings_2026.json # 278 passende HTML-Treffer
└── roadmap\
    ├── MODERNIZATION_ROADMAP_2026.md    # MASTER-ROADMAP (Diese Datei mit Tabellen)
    ├── roadmap_js_details.txt           # Detaillierter Textbericht für JavaScript
    ├── roadmap_css_details.txt          # Detaillierter Textbericht für CSS
    └── roadmap_html_details.txt         # Detaillierter Textbericht für HTML
```
