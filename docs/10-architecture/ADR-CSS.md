---
id: adr-css
title: "ADR-CSS: CSS Architecture, Constraints & Single Source of Truth (SSOT)"
type: adr
status: active
created: '2026-06-26'
updated: '2026-11-09'
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
  - website/css/sheet-common.css
  - website/css/sheet.css
  - website/css/sheet-multipage.css
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
   Der Briefbogen `<din-blatt>` wird über `aspect-ratio: var(--blatt-breite) / var(--blatt-hoehe)` (210 / 297) fixiert und über `min(100cqw, calc(100cqh * var(--blatt-breite) / var(--blatt-hoehe)))` verzerrungsfrei in den Viewport eingepasst.
2. **Container Queries (`cqw`, `cqh`):**
   Sämtliche inneren Maße, Ränder, Faltmarken und typografischen Größen verwenden `cqw` und `cqh`, um proportional zum Papierbogen zu skalieren (`calc(10 * 0.168cqw)` für 10pt Fließtext).
3. **Absolute Viewport- & Blatt-Sperre (Zero-Scroll-Garantie):**
   `overflow: hidden` auf `html`/`body` und `overflow: clip; contain: strict;` auf `<din-blatt>` und `#kern` verbieten jegliches Scrollen physisch. Der Substring `scroll` ist in allen Produktionsdateien unter `website/*.html` und `website/css/*.css` durch das CI-Gate (`tools/start.ps1`) strikt verboten.
4. **Natives Feldwachstum & Text-Fitting (JS-Kill Phase 1):**
   `field-sizing: content` lässt einzeilige und mehrzeilige Textfelder mitwachsen. `text-fit: shrink 60%` und `text-fit: shrink` stauchen überlange Empfänger- und Betreffzeilen rein deklarativ ohne JS-DOM-Messschleifen (Catalog A49).
5. **Typografische Umbruchbalance:**
   `text-wrap: balance` im Betreff und `text-wrap: pretty` im Fließtext verhindern unschöne Waisen- und Witwenwörter vollautomatisch in C++ auf Engine-Ebene.
6. **Natives Theming mit OKLCH & `light-dark()`:**
   Vollständige Nutzung von `color-scheme: light dark`, `light-dark()` und W3C Relative Color Syntax (RCS) im wahrnehmungsgerechten OKLCH-Farbraum. Sämtliche Farbableitungen erfolgen über `color-mix(in oklch, ...)`. Es gibt keine JS-basierten Theme-Klassen.
7. **CSS Anchor Positioning (W3C Standard):**
   Schwebende Dropdowns und die Format-Toolbar werden nativ über CSS Anchor Positioning an ihren DOM-Ankern befestigt (`position-anchor: --selection-anchor`, `position-area: top center`, `flip-block` für `#format-toolbar`; `--anchor-anschrift-suche` für `#anschrift-vorschlaege`; `--anchor-empfaenger-ort` für `#plz-suggestions-popover`).
8. **Top-Layer Popovers & Deklarative Transitions:**
   Overlays (`#hinweis-v4`, `#anschrift-vorschlaege`, `#plz-suggestions-popover`) nutzen die native HTML Popover API und rendern im Browser-Top-Layer. Transitions laufen 100% deklarativ über CSS `@starting-style` und `transition-behavior: allow-discrete`.
9. **Semantische Schalter (`<input type="checkbox" switch>`):**
   Zustände (z. B. Fußzeile) werden semantisch gerendert und direkt im CSS via `:root:has(#toggle-fuss:checked)` ausgewertet (JS-Kill Phase 2).
10. **CSS @scope:**
    Vollständige Kapselung der Briefblatt-Stile (`@scope (din-blatt)`), um Leckagen zwischen App-Shell und Briefdokument auszuschließen.
11. **Modern Form Control Styling:**
    Auswahllisten nutzen `appearance: base-select` mit nativ gestalteten Dropdown-Icons (`::picker-icon`) und Optionen (`::picker(select)`).
12. **Nativer Print-Workflow & Dynamischer PDF-Titel:**
    Ausschließliche Nutzung des nativen Browser-Drucks (`window.print()`) mit `@page { size: A4 portrait; margin: 0; }`. Externe PDF-Generatoren sind verboten. Der PDF-Dateiname wird dynamisch vor dem Drucken über `document.title = YYYY-MM-DD_{Empfänger}_{Betreff}` gesetzt.
13. **W3C CSS Functions (`@function`):**
    Relative mathematische Funktionen (`@function --mm-rel-x`, `--mm-rel-y`, `--pt-rel`) in `base.css` und absolute Geometriefunktionen (`--mm-abs-x`, `--mm-abs-y`, `--pt-abs`) in `sheet-multipage.css` für hochpräzise, deklarative DIN-5008-Koordinaten ohne JS-Laufzeitkosten.
14. **CSS Multi-column Level 2 für Mehrseiten-Layout:**
    Ermöglicht in `sheet-multipage.css` über `column-fill: auto; column-width: var(--page-width); column-gap: var(--page-gap);` das nahtlose Fließen des Fließtexts über beliebig viele DIN-A4-Bögen inklusive dynamischer Folgeblatt-Köpfe.
15. **Visueller D1-Overflow-Indikator:**
    Der Selektor `[data-ueberlauf]` signalisiert im Einseiten-Modus (`sheet.css`) rein deklarativ über CSS einen Textüberlauf, um das Abschneiden von Briefinhalten vor dem Druck zu visualisieren.

---

## 3. Single Source of Truth: Aktive CSS-Dateien & Komponenten-Registry

Das Projekt verfügt über **5 aktive CSS-Dateien** unter `website/css/` (modularisiert für Einseiten- und Mehrseitenbetrieb):

```
website/css/
├── base.css            (351 Zeilen | Reset, Design-Tokens, OKLCH, Theming, App-Shell Grid, relative @function)
├── sheet-common.css    (426 Zeilen | Gemeinsame DIN-5008-Geometrien, Falt-/Lochmarken, Anschriftfeld, Infoblock)
├── sheet.css           (299 Zeilen | Einzelseiten-Logik, Skalierungs-Container, @page & Einzelseiten-Druck)
├── sheet-multipage.css (541 Zeilen | Mehrseiten-Layout, CSS Multicol L2 Spaltenfluss, dynamische Folgeköpfe & Druck)
└── sidebar.css         (1.260 Zeilen | Sidebar-Navigation, Custom Inputs, Autocomplete, Popovers, Anchor Positioning)

> Stand 2026-11-09. 5-Dateien-Architektur: Saubere Trennung zwischen gemeinsamen DIN-5008-Normmaßen
> (`sheet-common.css`), Einzelseiten-Spezialisierung (`sheet.css`) und CSS-Multicol-Mehrseitenfluss (`sheet-multipage.css`).
> Eine separate `print.css` existiert nicht mehr; Druck- und Paged-Media-Regeln (@page) sind direkt in die jeweiligen
> Sheet-Module und base.css integriert.
```

---

### 1. `base.css` (Fundament: Reset, Design-Tokens, OKLCH, Theming & App-Shell Grid)

Bündelt Reset, mathematische `@function`-Definitionen, Design-Tokens und das globale App-Shell-Grid:
* **Reset & Viewport-Lockdown:**
  * Universelles Box-Sizing: `*, *::before, *::after { box-sizing: border-box; }`.
  * Absolute Viewport-Sperre: `html, body { width: 100vw; height: 100dvh; overflow: hidden; margin: 0; padding: 0; }`.
  * Typografische Basis & System-Font-Stacks (`system-ui, -apple-system, "Segoe UI", Roboto...`).
  * Accessibility: `@media (prefers-reduced-motion: reduce)` als Kill-Switch für alle Animationen und Transitions.
* **Mathematische CSS Functions (`@function`):**
  * Relative Umrechnungsfunktionen (`--mm-rel-x`, `--mm-rel-y`, `--pt-rel`) zur proportionalen Skalierung im Viewport.
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

### 2. `sheet-common.css` (Gemeinsame DIN-5008-Geometrien, Faltmarken & Briefzonen)

Bündelt alle geteilten Geometriedefinitionen, Form-A/B-Umschaltung und Zonen der DIN 5008:
* **HTML Attribute Parsing via CSS `attr()` (Single Source of Truth):**
  * `din-blatt` liest DIN-Koordinaten direkt aus HTML-Attributen: `attr(data-width-mm type(<number>))` und `attr(data-height-mm type(<number>))`.
  * Form A / Form B Reaktivität: `:root[data-layout="form-a"] din-blatt` bzw. `body:has(#btn-form-a:checked) din-blatt` schaltet Faltmarken (`--falzmarke-1-y`, etc.) und Briefkernstart dynamisch um.
* **DIN-5008 Briefzonen:**
  * `#rucksendezeile` (Rücksendeangabe 5 mm Höhe, 8pt Schrift, mit Trennlinie im Druck).
  * `#anschriftfeld` (85 × 45 mm, 10pt Schrift).
  * `#infoblock` (Zusatzinformationen rechtsbündig ab 125 mm).
  * `#datum` (Datumszeile normgerecht auf 92 mm in Form B).
  * `#betreff`, `#anrede`, `#text`, `#grussformel`, `#unterschrift`, `#anlagen`.
* **Falt- und Lochmarken:**
  * `din-falz-oben`, `din-falz-unten`, `din-lochmarke`: exakt auf 8 mm begrenzt, um Betreffkollisionen physisch auszuschließen.
  * Sichtbarkeit gesteuert über den Schalter „Falz- & Lochmarken“ (`data-marks`).
* **Signatur-Overlay (CAD-Geometrie & Snapping):**
  * Interaktiver Transformations-Rahmen (`.unterschriftsbild-rahmen`, `.unterschriftsbild-griff`, `.unterschriftsbild-drehgriff`) für stufenloses Skalieren, Verschieben und Rotieren der Signatur.
* **ContentEditable & Micro-Copyfitting:**
  * Ghost-Platzhalter (`[contenteditable]:empty::before { content: attr(placeholder); }`).
  * Stauchung überlanger Inhalte via CSS: `text-fit: shrink 60%` und `text-fit: shrink`.
  * Typografische Balance: `text-wrap: balance;` für Betreff, `text-wrap: pretty;` für Fließtext.

---

### 3. `sheet.css` (Einzelseiten-Logik, Skalierungs-Container & Einzelseiten-Druck)

Spezialisiert auf den einseitigen Standardbrief:
* **Stage & Scoped Canvas (`@scope (din-blatt)`):**
  * Kapselt Einseiten-Stile strikt gegen die App-Shell ab.
  * Fixiert Maße auf `aspect-ratio: var(--blatt-breite) / var(--blatt-hoehe)`, `overflow: clip; contain: strict; container-type: size; container-name: paper;`.
  * Verhindert horizontales und vertikales Ausbrechen über `width: min(100cqw, calc(100cqh * var(--blatt-breite) / var(--blatt-hoehe)))`.
* **Einzelseiten-Briefkern (`#kern`):**
  * Exakter Fließtextbereich mit Fluchträndern (25 mm links, 20 mm rechts).
* **Visueller D1-Overflow-Indikator:**
  * `[data-ueberlauf]` signalisiert im Einseiten-Modus Textüberlauf und warnt vor Abschneidungen.
* **Integrierte Druckregeln (`@media print` & `@page`):**
  * `@page { size: A4 portrait; margin: 0; }`.
  * Viewport-Freistellung: `html, body { overflow: visible !important; height: auto !important; }`.
  * UI-Ausblendung (`aside, .nicht-drucken, [popover] { display: none !important; }`).
  * `din-blatt { transform: none !important; box-shadow: none !important; margin: 0 !important; page-break-after: avoid; }`.

---

### 4. `sheet-multipage.css` (Mehrseiten-Layout, CSS Multicol L2 & Dynamische Folgeköpfe)

Spezialisiert auf mehrseitige Dokumente:
* **CSS Multi-column Level 2:**
  * Nutzt moderne Spaltenfluss-Eigenschaften (`column-fill: auto; column-width: var(--page-width); column-gap: var(--page-gap);`), um Fließtext nahtlos über mehrere DIN-A4-Seiten umbrechen zu lassen.
* **Dynamische Folgeblatt-Köpfe:**
  * Automatisierte Kopfzeilen für Folgeseiten (Seitenzahl, Datum, Betreff-Kurzform) ohne DOM-Duplikate.
* **Absolute Geometrie-Funktionen (`@function`):**
  * `--mm-abs-x`, `--mm-abs-y`, `--pt-abs` für mm-genaue Platzierung unabhängig von variablen Container-Breiten.
* **Mehrseiten-Druckarchitektur:**
  * Spezifische `@page`-Regeln für fortlaufenden Paged-Media-Druck ohne Leerseiten.

---

### 5. `sidebar.css` (Sidebar-Navigation, Form-Controls, Floating Popovers & Anchor Positioning)

Bündelt Sidebar-Shell, Form-Controls, Auswahllisten sowie die Top-Layer-Overlays:
* **Sidebar-Shell & Navigation:**
  * `#seitenleiste`: Feste Breite `290px`, Glassmorphism mit `backdrop-filter: var(--glass-blur);`, `touch-action: pan-y;`, `overscroll-behavior: contain;`.
  * Akkordeon-Bereiche (`.seitenleiste-setup`), Zonengruppierungen und Buttons.
  * Sliding-Pill Segmented Controls via `:has(:checked)`.
* **Moderne Form-Controls & Base Select:**
  * Formular-Controls gestaltet mit nativem `appearance: base-select`, `::picker(select)` und `::picker-icon`.
  * Semantische HTML-Switches (`input[type="checkbox"][switch]`) für Hilfslinien und Anlagen.
* **CSS Anchor Positioning für schwebende UI (W3C Standard):**
  * `#format-toolbar`: Verankert an `--selection-anchor` mit `position-area: top center; position-try-fallbacks: flip-block;`.
  * `#anschrift-vorschlaege`: Verankert an `--anchor-anschrift-suche` (Geoapify Remote-Vorschläge).
  * `#plz-suggestions-popover`: Verankert an `--anchor-empfaenger-ort` (0,9ms Offline-PLZ/Ort-Vorschläge).
* **Top-Layer Popovers & Deklarative Transitions:**
  * `#hinweis-v4`: Natives HTML `popover="manual"`. Rendert im Top-Layer ohne `z-index`.
  * Ein-/Ausblendung 100 % deklarativ über `@starting-style` und `transition-behavior: allow-discrete`.
  * `.toast-badge` für Deduplizierungs-Zähler (`x2`, `x3`) und `.toast-action-btn` für Inline-Aktionen; leere Elemente deklarativ versteckt (`:empty { display: none; }`).
  * `#clipboard-candidates-popover`: Vorschlags-Overlay bei Zwischenablagen-Parsing.
* **Dialoge & Modals:**
  * Native `<dialog>`-Elemente (`#import-dialog`, `#dialog-adressbuch`) im Top-Layer mit abgedunkeltem `::backdrop`.

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
| **`page-break-before: always;`** | Seitenumbruch-Erzwingung auf Container-Ebene | 🚫 **HARD BAN** | Catalog A46 | Erzeugt zwingend leere Seiten im Chromium-Druck-Manager. Strikte Nutzung von `page-break-after: avoid;` auf `<din-blatt>`. |
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