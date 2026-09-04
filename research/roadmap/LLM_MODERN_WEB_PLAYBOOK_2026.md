# LLM Modern Web Playbook 2026: Anweisungen für KIs & Entwickler

> **Zweck dieses Dokuments:**  
> Viele Large Language Models (LLMs) haben einen Trainings-Cutoff vor 2024/2025. Sie kennen diese modernen Browser-APIs nicht und generieren aus Gewohnheit veralteten JavaScript-Code aus dem Jahr 2018 (z. B. `scrollWidth`-Messungen, `setTimeout`-Animationsklassen, manuelle z-Index-Verwaltung oder eigene Sanitizer).  
> **Dieses Playbook dient als strikte System-Instruktion:** Jede KI, die dieses Dokument liest, MUSS veraltete Muster ignorieren und zwingend die hier definierten nativen Web-Standards einsetzen.

---

## REGEL 1: Dynamische Feldgröße (Inputs & Textareas)

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
    min-width: 100px;
    max-width: 100%;
  }
  ```
- **Wo in DIN-Brief Neo:** Ersetzt das gesamte JavaScript-Modul `48-text-fit.js`.

---

## REGEL 2: DIN 5008 Millimeter-Präzision (Font-Leading-Trim)

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
    margin-top: 45mm; /* Entspricht jetzt auf Druck und Screen EXAKT 45mm! */
  }
  ```
- **Wo in DIN-Brief Neo:** In `website/css/layout.css` für alle DIN-Abstände.

---

## REGEL 3: Dark/Light Mode Theming

- ❌ **VERBOTENES LLM-MUSTER:**
  Niemals doppelte Selektoren-Blöcke (`:root { --bg: #fff; }` und `.theme-dark { --bg: #000; }`) schreiben oder Farben per JavaScript im DOM austauschen.
- ✅ **PFLICHT-IMPLEMENTIERUNG (Natives CSS):**
  Die Funktion `light-dark()` einsetzen. Der Browser schaltet Tokens automatisch um:
  ```css
  /* MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark */
  :root {
    color-scheme: light dark;
    --bg-paper: light-dark(#ffffff, #1e1e1e);
    --text-main: light-dark(#111111, #f5f5f7);
    --border-dim: light-dark(#e5e5e7, #333333);
  }
  ```
- **Wo in DIN-Brief Neo:** In `website/css/variables.css`.

---

## REGEL 4: Sanfte Einblendungen von `display: none` / Popovers

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
- **Wo in DIN-Brief Neo:** In `website/css/floating.css` für `#toast-v4`.

---

## REGEL 5: Flüssige Höhen-Animationen (`height: auto`)

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
    height: 0;
    overflow: hidden;
    transition: height 0.25s ease;
  }
  .collapsible-panel.open {
    height: auto; /* Animiert butterweich direkt in CSS! */
  }
  ```
- **Wo in DIN-Brief Neo:** In `website/css/layout.css` für Sidebar-Menüs und Adress-Vorschläge.

---

## REGEL 6: Schwebende Toolbars & Verankerungen

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
    bottom: anchor(--selected-text top);
    left: anchor(--selected-text center);
    transform: translateX(-50%);
  }
  ```
- **Wo in DIN-Brief Neo:** In `website/css/floating.css` für `#format-toolbar`.

---

## REGEL 7: Einzeiliger Schutz für Datums-, Betreff- und Adressfelder

- ❌ **VERBOTENES LLM-MUSTER:**
  Niemals `keydown`-Handler schreiben, die `e.key === 'Enter'` oder `e.keyCode === 13` mit `e.preventDefault()` abwürgen, und keine Regex-Paste-Filter bauen.
- ✅ **PFLICHT-IMPLEMENTIERUNG (Natives HTML):**
  Das HTML-Attribut `contenteditable="plaintext-only"` nutzen:
  ```html
  <din-betreff id="betreff" contenteditable="plaintext-only" enterkeyhint="done" aria-label="Betreff"></din-betreff>
  ```
- **Wo in DIN-Brief Neo:** In allen 11 einzeiligen Feldern in `website/index.html`. Ersetzt `enforceLineLimits()` in `03-ui-protections.js`.

---

## REGEL 8: Lokale Windows-Schriften ohne Datei-Upload

- ❌ **VERBOTENES LLM-MUSTER:**
  Den Nutzer nicht zwingen, `.woff2`-Dateien herunterzuladen, hochzuladen und als Base64 im LocalStorage abzulegen.
- ✅ **PFLICHT-IMPLEMENTIERUNG (Native Web API):**
  Installierte Betriebssystem-Schriftarten direkt abfragen:
  ```javascript
  /* MDN: https://developer.mozilla.org/en-US/docs/Web/API/Window/queryLocalFonts */
  const availableFonts = await window.queryLocalFonts();
  // Nutzer kann direkt Aptos, Calibri, Arial oder DIN Next auswählen!
  ```
- **Wo in DIN-Brief Neo:** Im Schriftarten-Manager in `02-settings-manager.js`.

---

## REGEL 9: HTML-Sanitization ohne Bibliotheken

- ❌ **VERBOTENES LLM-MUSTER:**
  Niemals DOMPurify als externes Bundle einbinden oder rekursive `traverseNodes()`-Funktionen schreiben, um Tags per Hand zu filtern.
- ✅ **PFLICHT-IMPLEMENTIERUNG (Native Web API):**
  Natives `setHTMLUnsafe()` oder die Browser Sanitizer API nutzen:
  ```javascript
  /* C++-native Bereinigung in der Browser-Engine */
  targetElement.setHTMLUnsafe(untrustedInput);
  ```
- **Wo in DIN-Brief Neo:** In `31-format-toolbar.js` (ersetzt `sanitizeNode()`).

---

## REGEL 10: Absolutes Zero-Scroll-Prinzip (Physisches A4-Papier)

- ❌ **VERBOTENES LLM-MUSTER:**
  Niemals `overflow: auto` oder `overflow-y: scroll` auf dem Briefblatt definieren. Ein Brief hat keinen Scrollbalken!
- ✅ **PFLICHT-IMPLEMENTIERUNG (Natives CSS):**
  Strikte physische Begrenzung mit `overflow: clip; contain: strict;`:
  ```css
  din-a4 {
    width: 210mm;
    height: 297mm;
    overflow: clip; /* Scrollen ist technisch unmöglich! */
    contain: strict;
  }
  ```
- **Wo in DIN-Brief Neo:** In `website/css/layout.css`.

---

## Zusammenfassung für KIs

Wenn du Code für DIN-Brief Neo schreibst:
1. **Frage dich immer:** Gibt es dafür seit 2025/2026 eine native CSS- oder HTML-Eigenschaft? *(Fast immer: JA!)*
2. **Schreibe kein JavaScript für Layout, Größenanpassung oder Theming.**
3. **Halte den JavaScript-Kern auf das Minimum beschränkt:** Entwurfs-State, Salutation-Grammatik und PDF-Generierung.
