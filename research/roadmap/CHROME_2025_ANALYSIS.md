# Chrome 2025 Features: Analyse für DIN-Brief Neo

> **Datenbasis:** 355 Chrome-Features mit `shipping_year:2025`  
> **Relevante Treffer für Web/UI/Editor:** 214 Features  
> **Reifegrad:** Bereits heute im stabilen Chrome ausgerollt (hohe Produktions-Stabilität!)  

---

## Die wichtigsten 2025-Highlights für DIN-Brief Neo

Während 2026 viele experimentelle und brandneue Entwürfe enthält, sind die 2025-Features
**bereits stabil in Chromium verfügbar**. Hier sind die wertvollsten Funde:

### 1. CSS & Layout (Bereits stabil einsetzbar!)
- **CSS Anchor Positioning (Baseline 2025):** Wurde in Chrome 125–130 finalisiert. Die Format-Toolbar
  kann schon heute ohne ein einziges Pixel JavaScript an die Textauswahl geheftet werden.
- **CSS `@starting-style` & transition-behavior: allow-discrete:** In 2025 finalisiert. Ersetzt alle
  `@keyframes` und `setTimeout`-Klassen für Einblendungen von Toasts.
- **CSS `light-dark()` Funktion:** In 2025 breit ausgerollt. Funktioniert sofort in `variables.css`!
- **CSS `field-sizing: content`:** Wurde ab Chrome 123 scharfgeschaltet und in 2025 konsolidiert.
  Damit kann das gesamte Modul `48-text-fit.js` bereits heute gelöscht werden!

### 2. JavaScript-Vermeidung & DOM-Standards 2025
- **HTML Popover API (finaler Standard):** Native `popover="auto"` und `popover="manual"` sind
  vollständig etabliert. Das Toast-System und die Dropdowns können sofort ohne z-index-Hacks laufen.
- **`contenteditable="plaintext-only"`:** Volle Stabilität in 2025. Ersetzt alle Zeilenbegrenzungs-
  Handler (`enforceLineLimits`) in `03-ui-protections.js`.
- **Native HTML Sanitizer API & `setHTMLUnsafe()`:** Ab 2025 in Chrome verfügbar. Ersetzt `sanitizeNode()`.
- **`Intl.Segmenter` & `Intl.DurationFormat`:** Perfekt für Wort-/Silben-Trennung im Brieftext und
  deutsche Datumsformatierungen nach DIN 5008.

### 3. HTML & Barrierefreiheit 2025
- **Nativer `<dialog>` mit `closedby` & verbesserter Light Dismiss:** Schließt Modal-Dialoge
  automatisch bei Klick außerhalb oder Escape, ohne dass Event-Listener in JS geschrieben werden müssen.
- **`focusgroup`:** Ermöglicht nahtlose Tastatur-Navigation (Pfeiltasten) in der Toolbar und Sidebar.

---

## Gegenüberstellung 2025 (Stabil) vs. 2026 (Zukunft)

| Technologie / Bereich | 2025 Feature (Heute stabil!) | 2026 Feature (Zukunft / Feinschliff) |
| :--- | :--- | :--- |
| **Inputs & Textgröße** | `field-sizing: content` (stabil) | EditContext Batch-Editing |
| **DIN-Abstände** | `calc()` mit `lh`- und `cqw`-Einheiten | `text-box-trim` (echtes Font-Trim) |
| **Theming** | `light-dark()` & `color-mix()` (stabil) | Erweiterte Font-Paletten |
| **Popovers & Toasts** | Popover API + `@starting-style` (stabil) | `interesttarget` (Hover-Invokers) |
| **Buttons & Aktionen** | `<dialog method="dialog">` (stabil) | Standardisierte `commandfor` Invokers |
| **Schalter / Toggles** | Radio-Button `:has()` Styling (stabil) | Nativer `<input type="checkbox" switch>` |
| **KI-Assistent** | Chrome Built-in AI Origin Trials | Finale stabile Built-in AI APIs |