---
id: llm-modern-web-playbook-2026
title: 'LLM Modern Web Playbook 2026: Anweisungen für KIs & Entwickler'
type: reference
status: active
created: '2026-09-04'
updated: '2026-11-09'
tags:
  - din-briefneo
  - din-briefneo/foundation
  - status/active
  - type/reference
doc_links:
  - Immutable-Law-Catalog
  - longevity-guidelines
code_links: []
depends_on: []
supersedes: []
---

# LLM Modern Web Playbook 2026: Anweisungen für KIs & Entwickler

> **Zweck dieses Dokuments:**  
> Viele Large Language Models (LLMs) haben einen veralteten Trainings-Cutoff. Sie kennen moderne W3C-Browser-APIs nicht und generieren aus Gewohnheit veralteten Code aus dem Jahr 2018 (z. B. `scrollWidth`-Messungen, `setTimeout`-Animationsklassen, manuelle z-Index-Verwaltung oder eigene Sanitizer).  
> **Dieses Playbook dient als strikte System-Instruktion:** Jede KI, die dieses Dokument liest, MUSS veraltete Muster ignorieren und zwingend die hier definierten nativen Web-Standards einsetzen.

---

## Kanonischer Feature- & Antipattern-Extrakt (DIN-BriefNEO 2026)

### 1. HTML-Architektur (Platform-First & Zero-Div-Soup)

| Bleeding Edge Feature (Web Platform 2025/2026) | In DIN-BriefNEO verwendete Funktionen / Muster | Deprecated / Verbotene Alt-Funktionen (HARD BAN) |
|---|---|---|
| **Command Invoker API** (`commandfor`, `command="show-modal" \| "close"`) | `#btn-reset` öffnet `#reset-dialog` nativ ohne Klick-Listener; Schließen per `<form method="dialog">`. | 🚫 `addEventListener('click')` zum reinen Öffnen/Schließen von Modals; Bootstrap-/jQuery-Modals. |
| **Top-Layer Popover API** (`popover="auto" \| "manual" \| "hint"`) | `#hinweis-v4` (Toast, `popover="manual"`), Adressvorschläge (`popover="auto"`), Toolbar (`popover="hint"`). | 🚫 `z-index: 9999`-Kriege, manuelle Light-Dismiss-Click-Listener auf `document`. |
| **Semantische Schalter** (`<input type="checkbox" switch>`) | `#btn-hilfslinien-switch` und `#toggle-anlagen` als native OS-Toggles. | 🚫 Segmented Radio-Buttons („An“/„Aus“), künstliche `div.switch-slider`-Hacks. |
| **Nativer Plaintext-Schutz** (`contenteditable="plaintext-only"`) | Alle 16 Einzeiler (Anschrift, Betreff, Datum, Fußzeile); blockiert Format-Pastes in C++. | 🚫 `keydown`/`beforeinput`-Abfangschleifen mit `e.preventDefault()`; manuelle Paste-Regex-Filter. |
| **Mobile Tastatur-Ergonomie** (`enterkeyhint`, `inputmode`) | `enterkeyhint="done"` auf Feldern; `inputmode="numeric"` für PLZ; `inputmode="tel"` für Telefon. | 🚫 Enter-Key-Filterung per JS-Event; generische Standard-Tastaturen für Sonderdaten. |
| **Autonome Custom Elements** (`<din-*>`) | 37 semantische Tags (`<din-briefbogen>`, `<din-anschriftfeld>`, `<din-betreff>`) mit IMR-3/8 Gate. | 🚫 Generische Div-Suppen (`<div class="anschrift">`); unstrukturierte Inline-Spans. |

### 2. CSS-Architektur (Declarative First & Zero-Scroll)

| Bleeding Edge Feature (Web Platform 2025/2026) | In DIN-BriefNEO verwendete Funktionen / Muster | Deprecated / Verbotene Alt-Funktionen (HARD BAN) |
|---|---|---|
| **Natives Feldwachstum** (`field-sizing: content`) | Textareas und einzeilige Eingabefelder wachsen rein deklarativ mit. | 🚫 `element.scrollHeight`-Abfragen per JS; Ghost-Mirror-Divs zur Breitenberechnung. |
| **CSS Anchor Positioning** (`anchor-name`, `position-anchor`, `position-area`) | `#format-toolbar` an `--selection-anchor`; `#plz-suggestions-popover` an Adressfeldern. | 🚫 JS-Tooltips mit `getBoundingClientRect()`; Floating UI, Popper.js. |
| **Entry/Exit Transitions** (`@starting-style`, `transition-behavior: allow-discrete`) | Ein- und Ausblenden von Popovers und Dialogen mit Deckkraft- und Y-Versatz. | 🚫 `setTimeout(..., 300)`-Klassen-Toggle für CSS-Animationen; `max-height: 9999px`-Hack. |
| **Wahrnehmungsgerechter Farbraum & Theming** (`oklch()`, `light-dark()`, `color-mix()`) | 100 % OKLCH-Farbtokens (Law W4); automatische Hell-/Dunkel-Tokens ohne JS-Klassen. | 🚫 Hex-Codes (`#fff`), `rgb()`/`rgba()`, manuelle `.dark-mode`-CSS-Klassenduplikation. |
| **Relationaler Selektor** (`:has()`) | Zustandsmodellierung aus dem DOM: `:root:has(#btn-hilfslinien-switch:checked)`, Form-Status via `:has(:invalid)`. | 🚫 JS-Event-Listener zur reinen Weitergabe von Schalter- und Validitätszuständen. |
| **Zero-Scroll & Physische Isolation** (`overflow: clip; contain: strict;`) | A4-Bogen (`210mm × 297mm`); Wort `scroll` im CSS durch CI-Gate strikt verboten. | 🚫 `overflow: auto`, `overflow-y: scroll` auf dem Bogen; `height: 100vh` statt `100dvh`. |
| **Logische Eigenschaften** (`inline-size`, `margin-block-*`, `inset-inline`) | Konsequente Nutzung logischer CSS-Attribute im gesamten Stylesheet-Katalog. | 🚫 Physische Direktionalität (`margin-left`, `top`, `bottom`, `width`). |
| **Flüssige Schlüsselwort-Interpolation** (`interpolate-size: allow-keywords`) | `:root { interpolate-size: allow-keywords; }` für geschmeidige Accordions. | 🚫 JS-gesteuerte Akkordeon-Slide-Down-Berechnungen. |
| **Accessibility-Motion-Contract** (`prefers-reduced-motion`) | Universal-Reset mit `transition-duration: 0.01ms` (Lifecycle-Events feuern weiter). | 🚫 `animation: none` (zerstört `transitionend`-Listener in JS); Ignorieren reduzierter Bewegung. |

### 3. JavaScript-Architektur (Lean Platform & Zero-Toolchain)

| Bleeding Edge Feature (Web Platform 2025/2026) | In DIN-BriefNEO verwendete Funktionen / Muster | Deprecated / Verbotene Alt-Funktionen (HARD BAN) |
|---|---|---|
| **Zero-Toolchain & Zero-Bundler** (W3C ES-Modules) | Reine native Browser-Module (`<script type="module">`), 0 npm-Dependencies. | 🚫 Webpack, Vite, Rollup, Babel, Transpiler, TS-Build-Steps; Lodash/Underscore. |
| **Strenges XSS-Verbot & DOM-Sicherheit** (Law A61) | `textContent`, `createElement()`, sichere Node-Trees; Sanitizing via Allowlist. | 🚫 `innerHTML`, `outerHTML`, `setHTMLUnsafe()` mit ungeprüften Strings; `document.execCommand`. |
| **Deterministische Zeitrechnung** (Temporal API) | `Temporal.Now.plainDateISO()` und zonierte IANA-Datumsberechnung. | 🚫 `new Date()`, `Date.now()`, `Date.parse()` (unverankerte Systemzeit, Zeitzonenfallen). |
| **Streaming-Kompression** (DecompressionStream) | Lokales Entpacken der 70 KB PLZ-/Orts-Wörterbücher (`.json.gz`) im Stream. | 🚫 Externe Sync-PLZ-APIs; Einbinden schwerer `pako.js`/Gzip-npm-Pakete. |
| **Entkoppelte Speicher-Rollen** (ADR-BINARY-ASSETS) | `localStorage` nur für Text-Entwürfe (`din_draft`); `IndexedDB` für Binär-Blobs (Fonts/Bilder). | 🚫 Base64-Inlining in JS-Modulen (Law A64); Base64 im `localStorage` (Quotasprengung). |
| **Strukturierte Asynchronität & Steuerung** | `AbortController` für Live-Suchen; `Promise.withResolvers()`; `Object.groupBy()`. | 🚫 Veraltete Closure-Promises (`let res, rej; new Promise(...)`); unbereinigte Event-Listener-Leaks. |
| **Modul-Hierarchie & Graph-Disziplin** (L0–L4) | L0 (Foundation) $\rightarrow$ L1 (Storage) $\rightarrow$ L2 (Domain) $\rightarrow$ L3 (UI) $\rightarrow$ L4 (Main). | 🚫 Zirkuläre Importe (`A -> B -> A`); Import-Aufwärtsbezüge aus Core in UI-Controller. |

---

## Die 10 Kernregeln im Detail

### REGEL 1: Dynamische Feldgröße (Inputs & Textareas)

- ❌ **VERBOTENES LLM-MUSTER:**
  Niemals JavaScript-Event-Listener (`input`, `keyup`) registrieren, um `element.scrollWidth` oder `scrollHeight` abzufragen und `style.width` / `style.height` manuell nachzuziehen.
- ✅ **PFLICHT-IMPLEMENTIERUNG (Natives CSS):**
  Ausschließlich die native CSS-Eigenschaft `field-sizing: content` verwenden.
  ```css
  /* MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/field-sizing */
  .single-line,
  #betreff,
  #absender,
  textarea {
    field-sizing: content;
    min-inline-size: 100px;
    max-inline-size: 100%;
  }
  ```
- **Wo in DIN-BriefNEO:** In `website/css/sidebar.css` und `website/css/sheet.css`.

---

### REGEL 2: DIN 5008 Millimeter-Präzision (Font-Leading-Trim)

- ❌ **VERBOTENES LLM-MUSTER:**
  Niemals künstliche `calc()`-Korrekturen, negative Margins oder JS-Pixel-Offsets programmieren, um den unsichtbaren Leerraum über/unter Schriftarten auszugleichen.
- ✅ **PFLICHT-IMPLEMENTIERUNG (Natives CSS):**
  Schriftart-Leerraum an der Versalhöhe (Cap Height) und Grundlinie (Baseline) abschneiden:
  ```css
  /* MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-box-trim */
  din-anschriftfeld,
  din-betreff,
  din-text {
    text-box-trim: both;
    text-box-edge: cap alphabetic;
    margin-block-start: 45mm; /* Entspricht jetzt auf Druck und Screen EXAKT 45mm! */
  }
  ```
- **Wo in DIN-BriefNEO:** In `website/css/sheet-common.css` und `website/css/sheet.css` für alle DIN-Abstände.

---

### REGEL 3: Dark/Light Mode Theming

- ❌ **VERBOTENES LLM-MUSTER:**
  Niemals doppelte Selektoren-Blöcke (`:root { --bg: #fff; }` und `.theme-dark { --bg: #000; }`) schreiben oder Farben per JavaScript im DOM austauschen.
- ✅ **PFLICHT-IMPLEMENTIERUNG (Natives CSS):**
  Die Funktion `light-dark()` mit 100 % OKLCH-Farbtokens (Law W4) einsetzen:
  ```css
  /* MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark */
  :root {
    color-scheme: light dark;
    --c-bg: light-dark(oklch(0.99 0 none), oklch(0.18 0 none));
    --c-text: light-dark(oklch(0.2 0 none), oklch(0.95 0 none));
    --c-border: light-dark(oklch(0.88 0 none), oklch(0.3 0 none));
  }
  ```
- **Wo in DIN-BriefNEO:** In `website/css/base.css`.

---

### REGEL 4: Sanfte Einblendungen von `display: none` / Popovers

- ❌ **VERBOTENES LLM-MUSTER:**
  Niemals `@keyframes`-Blöcke schreiben oder JavaScript-Timer (`setTimeout(..., 300)`) verwenden, um Klassen wie `.is-visible` nachzureichen.
- ✅ **PFLICHT-IMPLEMENTIERUNG (Natives CSS):**
  CSS `@starting-style` in Kombination mit diskreten Transitions nutzen:
  ```css
  /* MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style */
  [popover] {
    transition: opacity 0.2s ease, transform 0.2s ease, display 0.2s allow-discrete;
    opacity: 0;
    transform: translateY(10px);
  }
  [popover]:popover-open {
    opacity: 1;
    transform: translateY(0);
  }
  @starting-style {
    [popover]:popover-open {
      opacity: 0;
      transform: translateY(10px);
    }
  }
  ```
- **Wo in DIN-BriefNEO:** In `website/css/sidebar.css` für `#toast-v4` und Dropdowns.

---

### REGEL 5: Flüssige Höhen-Animationen (`height: auto`)

- ❌ **VERBOTENES LLM-MUSTER:**
  Niemals `element.scrollHeight` mit JavaScript abfragen, um `style.maxHeight` numerisch in Pixeln zu setzen.
- ✅ **PFLICHT-IMPLEMENTIERUNG (Natives CSS):**
  Den Browser anweisen, Schlüsselwörter flüssig zu interpolieren:
  ```css
  /* MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/interpolate-size */
  :root {
    interpolate-size: allow-keywords;
  }
  .collapsible-panel {
    block-size: 0;
    overflow: clip;
    transition: block-size 0.25s ease;
  }
  .collapsible-panel.open {
    block-size: auto; /* Animiert butterweich direkt in CSS! */
  }
  ```
- **Wo in DIN-BriefNEO:** In `website/css/sidebar.css` für Sidebar-Menüs und Adress-Vorschläge.

---

### REGEL 6: Schwebende Toolbars & Verankerungen

- ❌ **VERBOTENES LLM-MUSTER:**
  Niemals `getBoundingClientRect()` in einem `scroll`- oder `selectionchange`-Listener aufrufen, um schwebende Toolbars mit `top`/`left` in Pixeln nachzuführen.
- ✅ **PFLICHT-IMPLEMENTIERUNG (Natives CSS):**
  CSS Anchor Positioning verwenden:
  ```css
  /* MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning */
  #selection-anchor {
    anchor-name: --selected-text;
  }
  #format-toolbar {
    position: fixed;
    position-anchor: --selected-text;
    inset-block-end: anchor(--selected-text top);
    inset-inline-start: anchor(--selected-text center);
    transform: translateX(-50%);
  }
  ```
- **Wo in DIN-BriefNEO:** In `website/css/sidebar.css` für `#format-toolbar`.

---

### REGEL 7: Einzeiliger Schutz für Datums-, Betreff- und Adressfelder

- ❌ **VERBOTENES LLM-MUSTER:**
  Niemals `keydown`-Handler schreiben, die `e.key === 'Enter'` oder `e.keyCode === 13` mit `e.preventDefault()` abwürgen, und keine Regex-Paste-Filter bauen.
- ✅ **PFLICHT-IMPLEMENTIERUNG (Natives HTML):**
  Das HTML-Attribut `contenteditable="plaintext-only"` nutzen:
  ```html
  <din-betreff id="betreff" contenteditable="plaintext-only" enterkeyhint="done" aria-label="Betreff"></din-betreff>
  ```
- **Wo in DIN-BriefNEO:** In allen 16 einzeiligen Feldern in `website/index.html`.

---

### REGEL 8: Lokale Betriebssystem-Schriften ohne Datei-Upload

- ❌ **VERBOTENES LLM-MUSTER:**
  Den Nutzer nicht zwingen, `.woff2`-Dateien herunterzuladen, hochzuladen und als Base64 im LocalStorage abzulegen.
- ✅ **PFLICHT-IMPLEMENTIERUNG (Native Web API):**
  Installierte Betriebssystem-Schriftarten direkt abfragen:
  ```javascript
  /* MDN: https://developer.mozilla.org/en-US/docs/Web/API/Window/queryLocalFonts */
  const availableFonts = await window.queryLocalFonts();
  ```
- **Wo in DIN-BriefNEO:** Im Schriftarten-Manager in `website/js/font-feature.js` und `website/js/settings.js`.

---

### REGEL 9: Strenger DOM-XSS-Schutz & Verbot ungesicherter HTML-Injektion (Law A61)

- ❌ **VERBOTENES LLM-MUSTER (HARD BAN):**
  Niemals `innerHTML`, `outerHTML` oder `setHTMLUnsafe()` mit ungeprüften Strings verwenden! Ebenfalls verboten: `document.execCommand` oder externe schwere Sanitizer-Bibliotheken (DOMPurify).
- ✅ **PFLICHT-IMPLEMENTIERUNG (Sichere W3C-DOM-Manipulation):**
  Ausschließlich text-sichere Methoden und strukturierte Node-Trees verwenden:
  ```javascript
  // 1. Text-Einfügung (100% sicher gegen XSS)
  element.textContent = untrustedText;

  // 2. Strukturiertes DOM-Bauen
  const item = document.createElement('li');
  item.textContent = label;
  container.append(item);

  // 3. Sanitized Rich-Text (falls absolut unumgänglich, via interner Allowlist)
  // Ausschließlich über die zentrale Sanitize-Funktion in website/js/core.js
  ```
- **Wo in DIN-BriefNEO:** Im gesamten JavaScript-Codebase (`website/js/`).

---

### REGEL 10: Absolutes Zero-Scroll-Prinzip (Physisches A4-Papier)

- ❌ **VERBOTENES LLM-MUSTER:**
  Niemals `overflow: auto` oder `overflow-y: scroll` auf dem Briefblatt definieren. Ein Brief hat keinen Scrollbalken!
- ✅ **PFLICHT-IMPLEMENTIERUNG (Natives CSS):**
  Strikte physische Begrenzung mit `overflow: clip; contain: strict;`:
  ```css
  #sheet {
    inline-size: 210mm;
    block-size: 297mm;
    overflow: clip; /* Scrollen ist technisch unmöglich! */
    contain: strict;
  }
  ```
- **Wo in DIN-BriefNEO:** In `website/css/sheet-common.css` und `website/css/sheet.css`.

---

## Zusammenfassung für KIs

Wenn du Code für DIN-BriefNEO schreibst:
1. **Frage dich immer:** Gibt es dafür seit 2025/2026 eine native CSS- oder HTML-Eigenschaft? *(Fast immer: JA!)*
2. **Schreibe kein JavaScript für Layout, Größenanpassung oder Theming.**
3. **Halte den JavaScript-Kern auf das Minimum beschränkt:** Entwurfs-State, Salutation-Grammatik und PDF-Generierung.
