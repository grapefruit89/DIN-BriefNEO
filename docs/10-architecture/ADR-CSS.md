---
id: adr-css
title: "ADR-CSS: CSS Architecture, Constraints & Single Source of Truth (SSOT)"
type: adr
status: active
created: '2026-06-26'
updated: '2026-10-15'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
  - tech/css
doc_links:
  - ADR-HTML
  - ADR-JS
  - ADR-ANTIPATTERN
  - longevity-guidelines
code_links:
  - website/css/base.css
  - website/css/sidebar.css
  - website/css/sheet.css
  - website/css/print.css
error_patterns:
  - css architektur
  - container queries
  - cqw cqh
  - anchor positioning
  - oklch
  - light-dark
  - aspect-ratio
  - overflow hidden
  - betreff
  - falzmarken
  - pdf titel
  - pdf dateiname
  - window.print
  - field-sizing content
  - text-fit
  - zero scroll
  - starting-style
  - popover top layer
  - input switch
supersedes:
  - adr-betreff
depends_on: []
---

# ADR-CSS: CSS Architecture, Constraints & Single Source of Truth (SSOT)

## 1. Context & Problemstellung

**WYSIWYG-Skalierung ohne Scrollbalken vs. fragile JavaScript-Layout-Loops.**

Klassische Webanwendungen brechen das WYSIWYG-Prinzip fortlaufend durch unkontrolliertes Scrollen, verzerrte Proportionen oder asynchrone JavaScript-Berechnungen (`ResizeObserver`, `getBoundingClientRect`, Font-Leading-Kompensation).
Ein physischer DIN-A4-Briefbogen hat jedoch feste Kanten und **scrollt niemals**.
In DIN-Brief Neo wird das Dokument unter allen Bildschirmgrößen, DPI-Skalierungen und Fenstertypen **pixelperfekt proportional skaliert und absolut ohne Scrollbalken** gerendert.

Um maximale Langlebigkeit, Robustheit und 0 ms Render-Latenz zu garantieren, werden Layout, Theming, Skalierung, Text-Fitting und Top-Layer-Overlays zu **100 % deklarativ über moderne Web-Platform-Standards (Chrome 150+ / Baseline 2024–2026)** gelöst.

---

## 2. Grundlegende Architektur-Entscheidungen

1. **Reiner CSS-Zoom & Seitenverhältnis (`aspect-ratio`):**
   Der Briefbogen `<din-a4>` wird über `aspect-ratio: var(--blatt-breite) / var(--blatt-hoehe)` (210 / 297) fixiert und über `min(100cqw, calc(100cqh * var(--blatt-breite) / var(--blatt-hoehe)))` verzerrungsfrei in den Viewport eingepasst.
2. **Container Queries (`cqw`, `cqh`):**
   Sämtliche inneren Maße, Ränder, Faltmarken und typografischen Größen verwenden `cqw` und `cqh`, um proportional zum Papierbogen zu skalieren (`calc(10 * 0.168cqw)` für 10pt Fließtext).
3. **Absolute Viewport- & Blatt-Sperre (Zero-Scroll-Garantie):**
   `overflow: hidden` auf `html`/`body` und `overflow: clip; contain: strict;` auf `<din-a4>` und `#kern` verbieten jegliches Scrollen physisch. Der Substring `scroll` ist in allen Produktionsdateien unter `website/*.html` und `website/css/*.css` durch das CI-Gate (`tools/start.ps1`) strikt verboten.
4. **Natives Feldwachstum & Text-Fitting (JS-Kill Phase 1):**
   `field-sizing: content` lässt einzeilige und mehrzeilige Textfelder mitwachsen. `text-fit: shrink 60%` und `text-fit: shrink` stauchen überlange Empfänger- und Betreffzeilen rein deklarativ ohne JS-DOM-Messschleifen (Catalog A49).
5. **Typografische Umbruchbalance:**
   `text-wrap: balance` im Betreff und `text-wrap: pretty` im Fließtext verhindern unschöne Waisen- und Witwenwörter vollautomatisch in C++ auf Engine-Ebene.
6. **Natives Theming mit OKLCH & `light-dark()`:**
   Vollständige Nutzung von `color-scheme: light dark`, `light-dark()` und W3C Relative Color Syntax (RCS) im wahrnehmungsgerechten OKLCH-Farbraum. Sämtliche Farbableitungen erfolgen über `color-mix(in oklch, ...)`. Es gibt keine JS-basierten Theme-Klassen.
7. **CSS Anchor Positioning (W3C Standard):**
   Schwebende Dropdowns und die Format-Toolbar werden nativ über CSS Anchor Positioning an ihren DOM-Ankern befestigt (`position-anchor: --selection-anchor`, `position-area: top center`, `flip-block` für `#format-toolbar`; `--anchor-anschrift-suche` für `#anschrift-vorschlaege`; `--anchor-empfaenger-ort` für `#plz-suggestions-popover`).
8. **Top-Layer Popovers & Deklarative Transitions:**
   Overlays (`#toast-v4`, `#anschrift-vorschlaege`, `#plz-suggestions-popover`) nutzen die native HTML Popover API und rendern im Browser-Top-Layer. Transitions laufen 100% deklarativ über CSS `@starting-style` und `transition-behavior: allow-discrete`.
9. **Semantische Schalter (`<input type="checkbox" switch>`):**
   Zustände (z. B. Hilfslinien) werden semantisch gerendert und direkt im CSS via `:root:has(#btn-hilfslinien-switch:checked)` ausgewertet (JS-Kill Phase 2).
10. **CSS @scope:**
    Vollständige Kapselung der Briefblatt-Stile (`@scope (din-a4)`), um Leckagen zwischen App-Shell und Briefdokument auszuschließen.
11. **Modern Form Control Styling:**
    Auswahllisten nutzen `appearance: base-select` mit nativ gestalteten Dropdown-Icons (`::picker-icon`) und Optionen (`::picker(select)`).
12. **Nativer Print-Workflow & Dynamischer PDF-Titel:**
    Ausschließliche Nutzung des nativen Browser-Drucks (`window.print()`) mit `@page { size: A4 portrait; margin: 0; }`. Externe PDF-Generatoren sind verboten. Der PDF-Dateiname wird dynamisch vor dem Drucken über `document.title = YYYY-MM-DD_{Empfänger}_{Betreff}` gesetzt.

---

## 3. Single Source of Truth: Aktive CSS-Dateien & Komponenten-Registry

Das Projekt verfügt über exakt **4 aktive CSS-Dateien** unter `website/css/` (konsolidiert am 2026-10-11, Commit `0621dde`):

```
website/css/
├── base.css       (193 Zeilen | Reset, Design-Tokens, OKLCH, No-Flip, Theming, Viewport-Lockdown & Font-Stacks)
├── sheet.css      (531 Zeilen | DIN-5008 Blatt-Geometrie, @scope (din-a4), Briefzonen, Text-Fit, Signatur-Canvas)
├── sidebar.css    (918 Zeilen | Sidebar-Navigation, Custom Inputs, Autocomplete, Popovers/Overlays, Anchor Positioning)
└── print.css      (86 Zeilen  | @media print, @page, 0mm Margins, DIN-Trennlinie, PDF-Erzeugung)

> Stand 2026-10-15. 4-Domänen-Konsolidierung: Klare Trennung nach Lebenszyklus und Kapselungsgrenzen
> statt künstlicher Schichten-Splits. Beseitigt Kaskaden-Konflikte und zirkuläre Spezifitäts-Fixes.
```

---

### 1. `base.css` (Fundament: Reset, Design-Tokens, OKLCH, Theming & App-Shell Grid)

Bündelt die vormaligen Einzeldateien `reset.css`, `variables.css` und `layers.css` sowie das globale App-Shell-Grid:
* **Reset & Viewport-Lockdown:**
  * Universelles Box-Sizing: `*, *::before, *::after { box-sizing: border-box; }`.
  * Absolute Viewport-Sperre: `html, body { width: 100vw; height: 100dvh; overflow: hidden; margin: 0; padding: 0; }`.
  * Typografische Basis & System-Font-Stacks (`system-ui, -apple-system, "Segoe UI", Roboto...`).
  * Accessibility: `@media (prefers-reduced-motion: reduce)` als Kill-Switch für alle Animationen und Transitions.
* **Registered Custom Properties (`@property`):**
  * `@property --hilfslinien-deckkraft`: Syntax `<number>`, inherits `true`, initial `0` — flüssige CSS-Interpolation beim Umschalten der Hilfslinien.
* **Design Tokens & Wahrnehmungsgerechter Farbraum (OKLCH):**
  * Sämtliche Farben im OKLCH-Farbraum definiert (`--c-viewport-day`, `--c-viewport-night`, etc.).
  * Reines Weiß (`oklch(100% 0 0)`) und Tiefschwarz (`oklch(0% 0 0)`).
* **Natives Theming mit `light-dark()` & No-Flip Nachtmodus:**
  * `--bg-viewport`, `--bg-seitenleiste`, `--bg-card`, `--border-color`, `--text-primary`, `--text-muted`.
  * No-Flip Ergonomie: Der Papierbogen bleibt auch im Dark Mode als Dokument lesbar (`--blatt-hintergrund`, `--blatt-text`), während Viewport und Sidebar abgedunkelt werden.
  * Glassmorphism via `color-mix`: `--bg-seitenleiste-glass: color-mix(in oklch, light-dark(...) 80%, transparent);`.
* **State-Bindings via `:has()` & Theme-Selektoren:**
  * `:root[data-theme="light"] { color-scheme: light; }`, `:root[data-theme="dark"] { color-scheme: dark; }`, `:root[data-theme="auto"] { color-scheme: light dark; }`.
  * `body:has(#btn-font-sans:checked)`, `body:has(#btn-font-serif:checked)` steuern Schriftauswahl.
  * `[popover] { color-scheme: inherit; }` (Top-Layer-Elemente erben das Farbschema).
* **App-Shell Grid & Viewport:**
  * `#app-shell`: Flexbox-/Grid-Layout mit `height: 100dvh; overflow: hidden;`.
  * `#viewport`: Flex-Container für das Briefblatt mit `container-type: size; container-name: viewport;`.

---

### 2. `sheet.css` (DIN-5008 Blatt-Geometrie, Scoped Isolation, Briefzonen & Signatur-Stage)

Bündelt die DIN-5008-Geometrie, ContentEditable-Schutz und die vormalige `signature.css`:
* **HTML Attribute Parsing via CSS `attr()` (Single Source of Truth):**
  * `din-a4` liest DIN-Koordinaten direkt aus HTML-Attributen: `attr(data-width-mm type(<number>))` und `attr(data-height-mm type(<number>))`.
  * Form A / Form B Reaktivität: `:root[data-layout="form-a"] din-a4` bzw. `body:has(#btn-form-a:checked) din-a4` schaltet Faltmarken (`--falz-oben-y`, etc.) und Briefkernstart dynamisch um.
* **Stage & Scoped Canvas (`@scope (din-a4)`):**
  * Kapselt alle Blattstile strikt gegen die App-Shell ab.
  * Fixiert Maße auf `aspect-ratio: var(--blatt-breite) / var(--blatt-hoehe)`, `overflow: clip; contain: strict; container-type: size; container-name: paper;`.
  * Verhindert horizontales und vertikales Ausbrechen über `width: min(100cqw, calc(100cqh * var(--blatt-breite) / var(--blatt-hoehe)))`.
* **ContentEditable & Micro-Copyfitting:**
  * `[contenteditable] { field-sizing: content; outline: 1px dashed oklch(...); }`.
  * Ghost-Platzhalter: `[contenteditable]:empty::before { content: attr(placeholder); }`.
  * Fokuszustände mit OKLCH-Aura-Ringen (`box-shadow: 0 0 0 3px oklch(...)`).
  * Stauchung überlanger Inhalte via CSS: `text-fit: shrink 60%` und `text-fit: shrink`.
  * Typografische Balance: `text-wrap: balance;` für Betreff, `text-wrap: pretty;` für Fließtext.
* **DIN-5008 Briefzonen:**
  * `#rucksendezeile` (Rücksendeangabe 5 mm Höhe, 8pt Schrift).
  * `#anschriftfeld` (85 × 45 mm, 10pt Schrift).
  * `#infoblock` (Zusatzinformationen rechtsbündig ab 125 mm).
  * `#datum` (Datumszeile normgerecht auf 92 mm in Form B).
  * `#kern` (Fließtextbereich mit Fluchträndern 25 mm links, 20 mm rechts).
  * `#betreff`, `#anrede`, `#text`, `#grussformel`, `#unterschrift`, `#anlagen`.
* **Falt- und Lochmarken:**
  * `din-falz-oben`, `din-falz-unten`, `din-lochmarke`: exakt auf 8 mm begrenzt (`calc(8 / 210 * 100cqw)`), um Betreffkollisionen physisch auszuschließen.
  * Sichtbarkeit gesteuert über `--hilfslinien-deckkraft`: `:root:has(#btn-hilfslinien-switch:checked) { --hilfslinien-deckkraft: 0.55; }`.
* **Signatur-Overlay (CAD-Geometrie & Snapping):**
  * Interaktiver Transformations-Rahmen (`.unterschriftsbild-rahmen`, `.unterschriftsbild-griff`, `.unterschriftsbild-drehgriff`) für stufenloses Skalieren, Verschieben und Rotieren der Signatur.

---

### 3. `sidebar.css` (Sidebar-Navigation, Form-Controls, Floating Popovers & Anchor Positioning)

Bündelt Sidebar-Shell, Form-Controls, Auswahllisten sowie die ehemals in `floating.css` ausgelagerten Top-Layer-Overlays:
* **Sidebar-Shell & Navigation:**
  * `#seitenleiste`: Feste Breite `290px`, Glassmorphism mit `backdrop-filter: var(--glass-blur);`, `touch-action: pan-y;`, `overscroll-behavior: contain;`.
  * Akkordeon-Bereiche (`.seitenleiste-setup`), Zonengruppierungen und Buttons.
* **Moderne Form-Controls & Base Select:**
  * Formular-Controls gestaltet mit nativem `appearance: base-select`, `::picker(select)` und `::picker-icon`.
  * Semantische HTML-Switches (`input[type="checkbox"][switch]`) für Hilfslinien und Anlagen.
* **CSS Anchor Positioning für schwebende UI (W3C Standard):**
  * `#format-toolbar`: Verankert an `--selection-anchor` mit `position-area: top center; position-try-fallbacks: flip-block;`.
  * `#anschrift-vorschlaege`: Verankert an `--anchor-anschrift-suche` (Geoapify Remote-Vorschläge).
  * `#plz-suggestions-popover`: Verankert an `--anchor-empfaenger-ort` (0,9ms Offline-PLZ/Ort-Vorschläge).
* **Top-Layer Popovers & Deklarative Transitions:**
  * `#hinweis-v4` / `#toast-v4`: Natives HTML `popover="manual"`. Rendert im Top-Layer ohne `z-index`.
  * Ein-/Ausblendung 100 % deklarativ über `@starting-style` und `transition-behavior: allow-discrete`:
    ```css
    @starting-style {
      #hinweis-v4:popover-open {
        opacity: 0;
        transform: translateY(-20px);
      }
    }
    ```
  * `.toast-badge` für Deduplizierungs-Zähler (`x2`, `x3`) und `.toast-action-btn` für Inline-Aktionen; leere Elemente deklarativ versteckt (`:empty { display: none; }`).
* **Dialoge & Modals:**
  * Native `<dialog>`-Elemente (`#import-dialog`, `#dialog-adressbuch`) im Top-Layer mit abgedunkeltem `::backdrop`.

---

### 4. `print.css` (Druckarchitektur & PDF-Erzeugung)

* **Exakte Druck-Vermaßung (Chrome 150+ Baseline):**
  * `@page { size: A4; margin: 0; page-margin-safety: auto; }` — pinnt A4 fest, setzt Margen auf 0 (Falzmarken/Lochmarke an physischer DIN-Position) und nutzt `page-margin-safety: auto`.
* **Print-Spezifität & Viewport-Freistellung:**
  * `html, body { overflow: visible !important; height: auto !important; }`.
  * `body { background: oklch(100% 0 0) !important; color-scheme: light !important; }`.
  * `#app-shell { display: block !important; width: auto !important; height: auto !important; overflow: visible !important; }`.
* **Chrome- & UI-Ausblendung:**
  * `aside, .nicht-drucken, [popover], #hinweis-v4, #schrift-uploader, .unterschriftsbild-griff { display: none !important; }`.
* **DIN-A4 Papiermaße im Druck:**
  * `din-a4`: `transform: none !important; box-shadow: none !important; margin: 0 !important; page-break-after: avoid; width: calc(attr(data-width-mm type(<number>)) * 1mm) !important; height: calc(attr(data-height-mm type(<number>)) * 1mm) !important;`.
* **DIN-5008 Druck-Trennlinie:**
  * `#rucksendezeile { border-bottom: 0.5pt solid oklch(0% 0 0) !important; padding-bottom: 1.5pt !important; }` — erscheint ausschließlich im Druck, wenn die Zeile befüllt ist (`#rucksendezeile:empty { border-bottom: none !important; }`).
* **Typografischer Schutz:**
  * `#text { orphans: 3 !important; widows: 3 !important; }`.
  * `#grussformel { break-after: avoid !important; }`.
  * `.unterschrift-zeile, #unterschriftsbild-container { break-inside: avoid !important; }`.

---

## 4. Antipattern- & Deprecation-Registry (Verbotene CSS-Praktiken)

Folgende CSS-Praktiken und Alt-Techniken sind im Projekt **strikt verboten (HARD BAN)** und führen bei Erkennung durch das Fitness-Gate oder Linter zu sofortigem Abbruch:

| CSS-Technik / Konstrukt | Frühere Verwendung | Status | Verboten durch | Moderner Ersatz (Web Platform 2026) |
| :--- | :--- | :---: | :--- | :--- |
| **`z-index: 9999` Wars** | Toast-, Modal- und Dropdown-Schichtung | 🚫 **HARD BAN** | Catalog A56, Probe P5 | Native HTML Popover API (`popover="manual"`) und `<dialog>` im Browser-Top-Layer. |
| **Viewport- / Papier-Scrollbalken** | `overflow: auto;`, `overflow: scroll;` | 🚫 **HARD BAN** | Zero-Scroll-Mandat, Catalog A46 | `overflow: clip; contain: strict;`. Der Substring `scroll` ist in `website/*.html` und `website/css/*.css` komplett verboten. |
| **JS-gesteuertes Layout & Text-Fit** | `48-text-fit.js`, `ResizeObserver`, DOM-Messschleifen | 🚫 **HARD BAN** | Catalog A49, Probe P3 | CSS `field-sizing: content`, `text-fit: shrink 60%`, `text-fit: shrink`, `text-wrap: balance/pretty`. 0ms Latenz. |
| **Statische Hex/RGB-Farbduplikation** | Manuelle `.dark-mode`-Klassen mit HEX-Dopplung | 🚫 **HARD BAN** | Longevity Guidelines, ADR-CSS | CSS `color-scheme: light dark;`, `light-dark()` und W3C Relative Color Syntax im OKLCH-Farbraum. |
| **`calc()` Font-Leading Hacks** | Negative Ränder zur Ausgleichung von Schrift-Freiräumen | 🚫 **HARD BAN** | Catalog A49 | Native CSS Half-Leading-Neutralisierung (`text-box-trim: both`, `text-box-edge: cap alphabetic`). |
| **CSS-Frameworks & Utility-Klassen** | Kein Tailwind, kein Bootstrap, kein Bulma | 🚫 **HARD BAN** | Catalog A45, Longevity Guidelines | 100% Handcrafted Vanilla CSS mit `@layer`, `@scope`, Container Queries und Semantic Tokens. |
| **`page-break-before: always;`** | Seitenumbruch-Erzwingung auf Container-Ebene | 🚫 **HARD BAN** | Catalog A46 | Erzeugt zwingend leere Seiten im Chromium-Druck-Manager. Strikte Nutzung von `page-break-after: avoid;` auf `<din-a4>`. |
| **Inline-Styles auf Textknoten** | `style="color: red; font-size: 14px"` aus Pastes | 🚫 **HARD BAN** | Catalog A48, A52 | Plaintext-Paste-Filter und Rich-Text-Sanitizer (`01-document.js`) bereinigen alle fremden Inline-Styles. |

---

## 5. Konsequenzen & Entwickler-Direktiven

1. **Zero-Scroll-Garantie:**
   Ein physischer Briefbogen hat feste Ränder und scrollt niemals. Sobald eine CSS-Regel ein Scrollen des Blattes ermöglicht oder das Wort `scroll` in HTML/CSS verwendet wird, schlägt die CI-Pipeline (`tools/start.ps1`) fehl.
2. **Container Queries First:**
   Alle Abstände und Abmessungen auf dem Blatt müssen als Funktion von `cqw` oder `cqh` definiert werden. Absolute Pixelmaße (`px`) sind auf dem Papierbogen verboten.
3. **Top-Layer-Pflicht für Schwebendes:**
   Jedes neue Popover, Dropdown oder Modal muss im Top-Layer rendern. Niemals dürfen manuelle `z-index`-Werte zur Überdeckung anderer Elemente vergeben werden.
4. **Single Source of Truth:**
   Jede Modifikation an Farbtokens, DIN-Koordinaten oder CSS-Architekturregeln muss zwingend in diesem Dokument (`ADR-CSS.md`) nachgeführt werden.

---

## 6. Related Documents

- [[ADR-HTML]]
- [[ADR-JS]]
- [[longevity-guidelines]]
- [[ADR-ANTIPATTERN]]

---

### Feature Checks

```javascript feature-check
// f("Feature Name", Bedingung, "Chrome XXX", "Status")
f("CSS :has() Selektor", typeof CSS !== "undefined" && CSS.supports && CSS.supports("selector(:has(div))"), "Chrome 105", "Produktiv"),
f("CSS Container Queries (cqw/cqh)", typeof CSS !== "undefined" && CSS.supports && CSS.supports("width: 100cqw"), "Chrome 105", "Produktiv"),
f("CSS field-sizing: content", typeof CSS !== "undefined" && CSS.supports && CSS.supports("field-sizing: content"), "Chrome 123", "Produktiv"),
f("CSS light-dark() Farbfunktion", typeof CSS !== "undefined" && CSS.supports && CSS.supports("color: light-dark(white, black)"), "Chrome 123", "Produktiv"),
f("CSS Anchor Positioning", typeof CSS !== "undefined" && CSS.supports && CSS.supports("position-anchor: --test"), "Chrome 125", "Produktiv"),
f("CSS @starting-style Transitionen", typeof CSS !== "undefined" && CSS.supports && CSS.supports("@starting-style {}"), "Chrome 117", "Produktiv"),
f("CSS text-wrap: balance", typeof CSS !== "undefined" && CSS.supports && CSS.supports("text-wrap: balance"), "Chrome 114", "Produktiv"),
f("HTML Checkbox Switch", typeof document !== "undefined" && "switch" in document.createElement("input"), "Chrome 135", "Produktiv")
```