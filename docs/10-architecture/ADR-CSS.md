---
id: adr-css
title: "ADR-CSS: CSS Architecture, Constraints & Single Source of Truth (SSOT)"
type: adr
status: active
created: '2026-06-26'
updated: '2026-09-04'
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
  - website/css/variables.css
  - website/css/reset.css
  - website/css/layout.css
  - website/css/floating.css
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

Um maximale Langlebigkeit, Robustheit und 0 ms Render-Latenz zu garantieren, werden Layout, Theming, Skalierung, Text-Fitting und Top-Layer-Overlays zu **100 % deklarativ über moderne Web-Platform-Standards (Chrome 148+ / Baseline 2024–2026)** gelöst.

---

## 2. Grundlegende Architektur-Entscheidungen

1. **Reiner CSS-Zoom & Seitenverhältnis (`aspect-ratio`):**
   Der Briefbogen `<din-a4>` wird über `aspect-ratio: var(--din-width) / var(--din-height)` (210 / 297) fixiert und über `min(100cqw, calc(100cqh * var(--din-width) / var(--din-height)))` verzerrungsfrei in den Viewport eingepasst.
2. **Container Queries (`cqw`, `cqh`):**
   Sämtliche inneren Maße, Ränder, Faltmarken und typografischen Größen verwenden `cqw` und `cqh`, um proportional zum Papierbogen zu skalieren (`calc(10 * 0.168cqw)` für 10pt Fließtext).
3. **Absolute Viewport- & Blatt-Sperre (Zero-Scroll-Garantie):**
   `overflow: hidden` auf `html`/`body` und `overflow: clip; contain: strict;` auf `<din-a4>` und `#briefkern` verbieten jegliches Scrollen physisch. Der Substring `scroll` ist in allen Produktionsdateien unter `website/*.html` und `website/css/*.css` durch das CI-Gate (`tools/start.ps1`) strikt verboten.
4. **Natives Feldwachstum & Text-Fitting (JS-Kill Phase 1):**
   `field-sizing: content` lässt einzeilige und mehrzeilige Textfelder mitwachsen. `text-fit: shrink 60%` und `text-fit: contain` stauchen überlange Empfänger- und Betreffzeilen rein deklarativ ohne JS-DOM-Messschleifen (Catalog A49).
5. **Typografische Umbruchbalance:**
   `text-wrap: balance` im Betreff und `text-wrap: pretty` im Fließtext verhindern unschöne Waisen- und Witwenwörter vollautomatisch in C++ auf Engine-Ebene.
6. **Natives Theming mit OKLCH & `light-dark()`:**
   Vollständige Nutzung von `color-scheme: light dark`, `light-dark()` und W3C Relative Color Syntax (RCS) im wahrnehmungsgerechten OKLCH-Farbraum. Sämtliche Farbableitungen erfolgen über `color-mix(in oklch, ...)`. Es gibt keine JS-basierten Theme-Klassen.
7. **CSS Anchor Positioning (W3C Standard):**
   Schwebende Dropdowns und die Format-Toolbar werden nativ über CSS Anchor Positioning an ihren DOM-Ankern befestigt (`position-anchor: --selection-anchor`, `position-area: top center`, `flip-block` für `#format-toolbar`; `--anchor-address-search` für `#address-suggestions`; `--anchor-empfaenger-ort` für `#plz-suggestions-popover`).
8. **Top-Layer Popovers & Deklarative Transitions:**
   Overlays (`#toast-v4`, `#address-suggestions`, `#plz-suggestions-popover`) nutzen die native HTML Popover API und rendern im Browser-Top-Layer. Transitions laufen 100% deklarativ über CSS `@starting-style` und `transition-behavior: allow-discrete`.
9. **Semantische Schalter (`<input type="checkbox" switch>`):**
   Zustände (z. B. Hilfslinien) werden semantisch gerendert und direkt im CSS via `:root:has(#btn-guides-switch:checked)` ausgewertet (JS-Kill Phase 2).
10. **CSS @scope:**
    Vollständige Kapselung der Briefblatt-Stile (`@scope (din-a4)`), um Leckagen zwischen App-Shell und Briefdokument auszuschließen.
11. **Modern Form Control Styling:**
    Auswahllisten nutzen `appearance: base-select` mit nativ gestalteten Dropdown-Icons (`::picker-icon`) und Optionen (`::picker(select)`).
12. **Nativer Print-Workflow & Dynamischer PDF-Titel:**
    Ausschließliche Nutzung des nativen Browser-Drucks (`window.print()`) mit `@page { size: A4 portrait; margin: 0; }`. Externe PDF-Generatoren sind verboten. Der PDF-Dateiname wird dynamisch vor dem Drucken über `document.title = YYYY-MM-DD_{Empfänger}_{Betreff}` gesetzt.

---

## 3. Single Source of Truth: Aktive CSS-Dateien & Komponenten-Registry

Das Projekt verfügt über exakt **5 aktive CSS-Dateien** unter `website/css/`:

```
website/css/
├── variables.css  (106 Zeilen | 57 Vars  | Design Tokens, @property, OKLCH, light-dark)
├── reset.css      (43 Zeilen  |  2 Vars  | Box-Sizing, Viewport-Lockdown, Font-Stacks)
├── layout.css     (1146 Zeilen| 32 Vars  | DIN 5008 Geometrie, App Shell, @scope, Text-Fit)
├── floating.css   (457 Zeilen |  3 Vars  | Top-Layer Popovers, @starting-style, Anchor Positioning)
└── print.css      (49 Zeilen  |  0 Vars  | @media print, 0mm Margins, DIN-Trennlinie)
```

---

### 1. `variables.css` (Design-Tokens, Farbraum & Registered Custom Properties)

* **Cascade Layers:** Definiert die hierarchische Schichtung `@layer reset, tokens, layout, floating;`.
* **Registered Custom Properties (`@property`):**
  * `@property --guide-opacity`: Syntax `<number>`, inherits `true`, initial `0` — ermöglicht flüssige CSS-Interpolation beim Ein-/Ausschalten der Hilfslinien.
  * `@property --theme-dim`: Syntax `<number>`, inherits `true`, initial `0` — stufenlose Helligkeitsregulierung im Dark Mode.
* **Farbmetrik (OKLCH-Farbraum):**
  * Sämtliche Farben sind mathematisch als wahrnehmungsgleich im OKLCH-Farbraum definiert (z. B. `--c-viewport-day: oklch(0.96 0.01 250);`, `--c-viewport-night: oklch(0.2735 0.0179 251.92);`).
  * Reines Weiß (`oklch(100% 0 0)`) und Tiefschwarz (`oklch(0% 0 0)`).
* **Natives Theming (`light-dark()`):**
  * `--bg-viewport`, `--bg-sidebar`, `--bg-card`, `--border-color`, `--text-primary`, `--text-muted`.
  * `--paper-bg`, `--paper-text`, `--paper-ghost`.
  * Glassmorphism via `color-mix`: `--bg-sidebar-glass: color-mix(in oklch, light-dark(...) 80%, transparent);`.
* **Semantische Statusfarben:**
  * `--c-primary`, `--c-success` (Grün), `--c-warning` (Orange), `--c-danger` (Rot).
* **Theming-Selektoren (3-Wege Toggle Auto/Light/Dark):**
  * `:root[data-theme="light"] { color-scheme: light; }`
  * `:root[data-theme="dark"] { color-scheme: dark; }`
  * `:root[data-theme="auto"] { color-scheme: light dark; }`
* **State-Bindings via `:has()`:**
  * `body:has(#btn-font-sans:checked)`, `body:has(#btn-font-serif:checked)` steuern `--font-active-stack`.
  * `[popover] { color-scheme: inherit; }` (stellt sicher, dass Top-Layer-Elemente das Parent-Farbschema erben).

---

### 2. `reset.css` (Globaler Reset & Viewport-Lockdown)

* **Box-Sizing:** Universell `*, *::before, *::after { box-sizing: border-box; }`.
* **Viewport-Sperre:** `html, body { width: 100vw; height: 100dvh; overflow: hidden; margin: 0; padding: 0; }`.
* **Schrift-Glättung:** `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`.
* **Typografische Basis:** `system-ui, -apple-system, "Segoe UI", Roboto...` für die App-Shell.
* **Font-Stack Umschaltung:**
  * `body.font-stack-sans` aktiviert moderne Sans-Serif-Glyphen.
  * `body.font-stack-serif` schaltet auf DIN-konforme Serifenschriften um (`Georgia, Times New Roman`).
  * `body.font-custom-active din-a4` aktiviert injizierte WOFF2-Schriften (`'AptosCustom'`).
* **Theme Transition:** Sanfter Hintergrundfarbwechsel auf `body` mit `transition: background-color 0.4s, color 0.4s`.

---

### 3. `layout.css` (DIN-5008 Geometrie, App-Shell & Blatt-Styling)

* **HTML Attribute Parsing via CSS `attr()`:**
  * `din-a4` liest DIN-Koordinaten direkt aus den HTML-Attributen: `attr(data-width-mm type(<number>), 210)`.
  * Form A / Form B Reaktivität: `body:has(#btn-form-a:checked) din-a4` berechnet Faltmarken (`--fold-1-y: calc(87 / 297 * 100cqh);`) und Briefkernstart dynamisch um.
* **App-Shell Layout:**
  * `#app-shell`: CSS Grid mit `clamp(200px, 20dvw, 280px) 1fr;` und `overflow: hidden;`.
  * `aside`: Glassmorphism-Sidebar mit `backdrop-filter: var(--glass-blur);`, `z-index: 10;`.
* **Segmented Controls & Modern Switches:**
  * `.segmented-control`: Gleitender Hintergrund via `::before` und dynamischem `:checked + label`-Offset.
  * `.sidebar-switch-row` & `input[type="checkbox"][switch]`: Semantischer HTML-Switch mit nativem Track und Thumb.
* **Stage & Scoped Canvas (`@scope (din-a4)`):**
  * `#viewport`: Flex-Container mit `container-type: size; container-name: viewport;`.
  * `#din-a4-viewport`: Grid mit `container-type: size; container-name: sheet-stage;`.
  * `@scope (din-a4)`: Kapselt alle Blattstile. Fixiert Maße auf `aspect-ratio: 210 / 297`, `overflow: clip; contain: strict; container-type: size; container-name: paper;`.
* **ContentEditable-Veredelung:**
  * `[contenteditable] { field-sizing: content; outline: 1px dashed oklch(...); }`.
  * Hover- und Focus-Zustände mit dynamischen OKLCH-Aura-Ringen (`box-shadow: 0 0 0 3px oklch(...)`).
  * `.squeezed`: Minimale Schriftstauchung (`letter-spacing: -0.015em`) bei Zeichenlimits.
  * Ghost-Platzhalter: `[contenteditable]:empty::before { content: attr(placeholder); }`.
* **DIN-5008 Briefzonen:**
  * `#absender`: Rücksendezeile (45 mm von oben in Form B, 5 mm Höhe, 8pt Schrift).
  * `#empfaenger`: Anschriftfeld (85 × 45 mm, 10pt Schrift).
  * `#infoblock`: Zusatzinformationen rechtsbündig ab 125 mm.
  * `#datum`: Datumszeile normgerecht auf 92 mm (Form B).
  * `#briefkern`: Fließtextbereich mit Fluchträndern 25 mm links und 20 mm rechts; `overflow: clip;`.
  * `#betreff`: Betreffzeile mit `font-weight: 700; text-fit: contain; text-wrap: balance;`.
  * `#anrede`: 10.5pt Schriftgröße, 1 Leerzeile Abstand.
  * `#brieftext`: Blocksatz (`text-align: justify; hyphens: auto; text-wrap: pretty; line-height: 1.4;`).
  * `#grussformel`: 1 Leerzeile vor Gruß, 3 Leerzeilen für Unterschrift.
  * `#unterschrift`: Signaturzone.
* **Natives Text-Fitting & Font-Shrink:**
  * `#empfaenger, #infoblock, #briefkern, #anrede, #grussformel, #unterschrift { text-fit: shrink 60%; }`.
  * `.single-line`: `white-space: nowrap; overflow: clip; text-overflow: ellipsis; text-fit: contain; field-sizing: content;`.
* **Moderne Form-Controls & Base Select:**
  * `#sidebar-pv-select`: Gestaltet via `appearance: base-select`, `::picker(select)` und `::picker-icon`.
* **Hilfslinien & Faltmarken:**
  * `.din-mark`: Faltmarken 1 und 2 sowie Lochmarke am linken Rand auf exakt 8 mm begrenzt (`width: calc(8 / 210 * 100cqw);`), um Betreffkollisionen physisch zu verhindern.
  * Sichtbarkeit gesteuert über `--guide-opacity`: `:root:has(#btn-guides-switch:checked) { --guide-opacity: 0.55; }`.
* **Signatur-Bounding-Box:**
  * `.sig-bounding-box`, `.sig-handle`, `.sig-rotate-handle`: Interaktive Transformations-Handles für die Unterschrift.

---

### 4. `floating.css` (Top-Layer Overlays, Popovers & Anchor Positioning)

* **Architektur-Wächter Popover Top-Layer:**
  * `#toast-v4`: Verwendet natives HTML `popover="manual"`. Rendert direkt im Browser-Top-Layer ohne `z-index`.
  * Einblendung/Ausblendung über `@starting-style` und `transition-behavior: allow-discrete`:
    ```css
    @starting-style {
      #toast-v4:popover-open {
        opacity: 0;
        transform: translateY(-20px);
      }
    }
    ```
  * Enthält `.toast-badge` für Deduplizierungs-Zähler (`x2`, `x3`) und `.toast-action-btn` für Inline-Aktionen.
  * Schüttel-Animation bei Deduplizierung: `@keyframes shakeToast`.
* **CSS Anchor Positioning für schwebende UI:**
  * `#format-toolbar`: Verankert an `--selection-anchor` mit `position-area: top center; position-try-fallbacks: flip-block;`.
  * `#address-suggestions`: Verankert an `--anchor-address-search` (Geoapify Remote-Vorschläge).
  * `#plz-suggestions-popover`: Verankert an `--anchor-empfaenger-ort` (0,9ms Offline-PLZ/Ort-Vorschläge).
  * `#postvermerk-dropdown`: Verankert an `--anchor-postvermerk`.
* **Visuelle Trennung:**
  * Alle schwebenden Dropdowns nutzen `backdrop-filter: var(--glass-blur);`, abgerundete Ecken und dezente Schatten (`var(--shadow-lg)`).
* **Inline-Feedback:**
  * `.input-feedback-msg`: Statusmeldungen für ungültige API-Keys oder Tastaturbeschränkungen.
* **Sichtbarkeitsdeklarationen:**
  * Explizite Block-Deklaration für DIN-Custom-Elemente (`din-rucksendezeile`, `din-betreff`, etc.).

---

### 5. `print.css` (Druckarchitektur & PDF-Erzeugung)

* **Print-Spezifität & Viewport-Freistellung:**
  * `html, body { overflow: visible !important; height: auto !important; }`.
  * `body { background: oklch(100% 0 0) !important; }`.
  * `#app-shell { display: block !important; width: auto !important; height: auto !important; overflow: visible !important; }`.
* **Chrome-Ausblendung:**
  * `aside, .no-print, [popover], #toast-v4, #font-uploader { display: none !important; }`.
* **Exakte DIN-A4-Papiermaße im Druck:**
  * `din-a4`: `transform: none !important; box-shadow: none !important; margin: 0 !important; page-break-after: avoid; width: calc(210 * 1mm) !important; height: calc(297 * 1mm) !important;`.
* **Bereinigung von Hilfselementen:**
  * `[contenteditable]:empty::before, [placeholder]:empty::before { display: none !important; }`.
  * `[contenteditable] { outline: none !important; box-shadow: none !important; background: transparent !important; }`.
* **DIN-5008 Druck-Trennlinie:**
  * `#absender { border-bottom: 0.5pt solid oklch(0% 0 0) !important; padding-bottom: 2px !important; }` — die genormte Trennlinie unter der Rücksendezeile erscheint ausschließlich auf dem Papier/PDF.
* **Dropdown-Icons neutralisieren:**
  * `.pv-select { appearance: none !important; border: none !important; background: transparent !important; }`.
  * `.pv-select::picker-icon { display: none !important; }`.

---

## 4. Antipattern- & Deprecation-Registry (Verbotene CSS-Praktiken)

Folgende CSS-Praktiken und Alt-Techniken sind im Projekt **strikt verboten (HARD BAN)** und führen bei Erkennung durch das Fitness-Gate oder Linter zu sofortigem Abbruch:

| CSS-Technik / Konstrukt | Frühere Verwendung | Status | Verboten durch | Moderner Ersatz (Web Platform 2026) |
| :--- | :--- | :---: | :--- | :--- |
| **`z-index: 9999` Wars** | Toast-, Modal- und Dropdown-Schichtung | 🚫 **HARD BAN** | ADR-ANTIPATTERN Abs. 15, Probe P5 | Native HTML Popover API (`popover="manual"`) und `<dialog>` im Browser-Top-Layer. |
| **Viewport- / Papier-Scrollbalken** | `overflow: auto;`, `overflow: scroll;` | 🚫 **HARD BAN** | Zero-Scroll-Mandat, Catalog A46 | `overflow: clip; contain: strict;`. Der Substring `scroll` ist in `website/*.html` und `website/css/*.css` komplett verboten. |
| **JS-gesteuertes Layout & Text-Fit** | `48-text-fit.js`, `ResizeObserver`, DOM-Messschleifen | 🚫 **HARD BAN** | Catalog A49, Probe P3 | CSS `field-sizing: content`, `text-fit: shrink 60%`, `text-fit: contain`, `text-wrap: balance/pretty`. 0ms Latenz. |
| **Statische Hex/RGB-Farbduplikation** | Manuelle `.dark-mode`-Klassen mit HEX-Dopplung | 🚫 **HARD BAN** | Longevity Guidelines, ADR-CSS | CSS `color-scheme: light dark;`, `light-dark()` und W3C Relative Color Syntax im OKLCH-Farbraum. |
| **`calc()` Font-Leading Hacks** | Negative Ränder zur Ausgleichung von Schrift-Freiräumen | 🚫 **HARD BAN** | Catalog A49 | Native CSS Half-Leading-Neutralisierung (`text-box-trim: both`, `text-box-edge: cap alphabetic`). |
| **CSS-Frameworks & Utility-Klassen** | Kein Tailwind, kein Bootstrap, kein Bulma | 🚫 **HARD BAN** | Catalog A45, Longevity Guidelines | 100% Handcrafted Vanilla CSS mit `@layer`, `@scope`, Container Queries und Semantic Tokens. |
| **`page-break-before: always;`** | Seitenumbruch-Erzwingung auf Container-Ebene | 🚫 **HARD BAN** | Catalog A46 | Erzeugt zwingend leere Seiten im Chromium-Druck-Manager. Strikte Nutzung von `page-break-after: avoid;` auf `<din-a4>`. |
| **Inline-Styles auf Textknoten** | `style="color: red; font-size: 14px"` aus Pastes | 🚫 **HARD BAN** | Catalog A48, ADR-ANTIPATTERN Abs. 4 | W3C Selection & Range API Sanitizer (`31-format-toolbar.js`) bereinigt alle fremden Inline-Styles. |

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