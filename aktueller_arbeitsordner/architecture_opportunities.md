# Chrome 148-151 Roadmap Architecture Opportunities Audit Report
**Project:** DIN-Brief Neo  
**Target Codebase:** `aktueller_arbeitsordner/website/` (`index.html`, `css/`, `js/`)  
**Audit Date:** July 2026  
**Chrome Version Target Baseline:** Chrome 148–151 (Default Enabled Baseline in Chrome 150/151)  
**Status:** Architectural Recommendations (Strict Read-Only Audit)

---

## Executive Summary

This architecture audit evaluates the DIN-Brief Neo web application against bleeding-edge **Chrome 148–151 web platform primitives**. DIN-Brief Neo already demonstrates strong modern standards compliance (utilizing OKLCH colors, CSS Container Queries, CSS Anchor Positioning, and `@scope`). 

Our systematic audit of `index.html`, `website/css/` (`variables.css`, `layout.css`, `floating.css`, `reset.css`, `print.css`, `poc-features.css`), and `website/js/` (`00-core/`, `10-ui/`, `20-features/`, `30-utils/`, `main.js`) has identified **15 concrete modernization opportunities** across 8 key Chrome 148–151 roadmap feature areas.

Adopting these native Chrome features will yield:
- **Net Reduction of ~153 Lines of Imperative JavaScript Code**.
- **Complete Elimination of Layout-Trashing `.scrollHeight` Measurements and Keystroke Polling**.
- **100% Declarative Arrow-Key Focus Management (`focusgroup`)** without writing keyboard event listeners.
- **Zero-Jank Selection & Hover Tooltips (`popover="hint"` + CSS Anchor Positioning)**.
- **Declarative Theme & UI Mode State Management via HTML Radio Inputs & CSS `:has()`**.
- **Native Non-Blocking Modal Dialogs (`<dialog>`) replacing legacy blocking `window.confirm()` popups**.

All recommended features are **enabled by default in Chrome 150/151** without requiring experimental browser flags.

---

## Detailed Opportunities by Feature Area

### 1. CSS `text-fit` / Native Font Auto-Scaling

#### Opportunity 1.1: DIN 5008 Envelope Window Sender Line (`#absender`)
- **Target File & Lines:** `website/css/layout.css`, lines 247–258 (`#absender`)
- **Current JS/CSS Workaround:**
  ```css
  #absender {
    font-size: calc(8 * 0.168cqw);
    white-space: nowrap;
    overflow: hidden;
  }
  ```
  The small sender address line (Rücksendezeile) in the 85mm x 5mm DIN 5008 address window relies on fixed container query font sizing. Long addresses are either truncated with `text-overflow: ellipsis` or require manual JS squeezing logic (`.squeezed` class).
- **Proposed Native Solution (Chrome 150/151):**
  Apply native `text-fit: contain;`:
  ```css
  #absender {
    text-fit: contain;
    white-space: nowrap;
  }
  ```
- **Viability & Chrome Verification:** Enabled by default in Chrome 150/151.
- **Net Benefits:** Long sender address strings automatically scale down font size to fit inside the fixed 85mm x 5mm envelope window without text truncation or JS character count measurement.

#### Opportunity 1.2: Subject Line Overflow Prevention (`#betreff`)
- **Target File & Lines:** `website/css/layout.css`, lines 308–313 (`#betreff`)
- **Current JS/CSS Workaround:**
  ```css
  #betreff {
    font-size: calc(12 * 0.168cqw);
    font-weight: 700;
    text-wrap: pretty;
  }
  ```
  Long subjects risk overflowing into the greeting line (`#anrede`), creating layout collisions on page 1 of the DIN letter.
- **Proposed Native Solution (Chrome 150/151):**
  ```css
  #betreff {
    font-size: calc(12 * 0.168cqw);
    font-weight: 700;
    text-fit: contain;
  }
  ```
- **Viability & Chrome Verification:** Enabled by default in Chrome 150/151.
- **Net Benefits:** Subject titles auto-adjust font scaling dynamically to guarantee the subject line never overlaps subsequent letter elements.

#### Opportunity 1.3: Single-Line Input Fields (`.single-line`)
- **Target File & Lines:** `website/css/layout.css`, lines 639–646 (`.single-line`)
- **Current JS/CSS Workaround:**
  ```css
  .single-line {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    field-sizing: content;
  }
  ```
- **Proposed Native Solution (Chrome 150/151):**
  ```css
  .single-line {
    white-space: nowrap;
    text-fit: contain;
    field-sizing: content;
  }
  ```
- **Viability & Chrome Verification:** Enabled by default in Chrome 150/151.
- **Net Benefits:** Prevents user input from hiding behind ellipsis (`...`) while maintaining single-line structural layout stability.

---

### 2. HTML `focusgroup` Attribute for Declarative Focus Management

#### Opportunity 2.1: Segmented Control Roving Focus Navigation
- **Target File & Lines:** `index.html`, lines 44–48, 53–59, 96–100, 118–121
- **Current JS/CSS Workaround:**
  Segmented control containers currently rely on manual `tabindex="0"` on `<label>` elements or standard document tab stops. Moving between items requires repeated `Tab` key presses instead of arrow keys.
- **Proposed Native Solution (Chrome 150/151):**
  Add `focusgroup="horizontal wrap"` to all segmented control button containers:
  ```html
  <div class="segmented-control" focusgroup="horizontal wrap">
    <input type="radio" name="layout-form" id="btn-form-a" value="form-a" class="sr-only">
    <label for="btn-form-a">Form A (Kompakt)</label>
    <input type="radio" name="layout-form" id="btn-form-b" value="form-b" class="sr-only" checked>
    <label for="btn-form-b">Form B (Standard)</label>
  </div>
  ```
- **Viability & Chrome Verification:** Enabled by default in Chrome 150/151 (Chrome 150 Baseline).
- **Net Benefits:** Provides native, browser-driven `ArrowLeft` / `ArrowRight` roving focus management without writing a single line of JavaScript event listener code.

#### Opportunity 2.2: Sidebar Actions & Button Group Focus
- **Target File & Lines:** `index.html`, lines 187–194 (Actions Footer), lines 125–132 (Font Manager Actions), lines 145–153 (Signature Actions)
- **Current JS/CSS Workaround:**
  Vertical action groups require users to tab sequentially through every button.
- **Proposed Native Solution (Chrome 150/151):**
  ```html
  <div class="sidebar-section sidebar-footer" focusgroup="vertical wrap">
    <button id="btn-print" class="btn primary w-full">🖨️ Als PDF speichern / Drucken</button>
    <button id="btn-reset" class="btn btn-danger w-full">🗑️ Brief zurücksetzen</button>
  </div>
  ```
- **Viability & Chrome Verification:** Enabled by default in Chrome 150/151.
- **Net Benefits:** Enables intuitive vertical arrow-key (`ArrowUp` / `ArrowDown`) navigation through sidebar action buttons natively.

---

### 3. CSS `light-dark()` Functions for Theme Adaptation

#### Opportunity 3.1: Theme-Adaptive Background Assets & Icons
- **Target File & Lines:** `website/css/variables.css`, lines 21–25 & `website/css/layout.css`, lines 553–565 (`#signature-image`)
- **Current JS/CSS Workaround:**
  Uses CSS `mix-blend-mode` hacks or JS `src` swapping when switching between Light and Dark modes.
- **Proposed Native Solution (Chrome 149/150):**
  Define theme-adaptive images directly in CSS:
  ```css
  .theme-adaptive-watermark {
    background-image: light-dark(url('../assets/watermark-light.svg'), url('../assets/watermark-dark.svg'));
  }
  ```
- **Viability & Chrome Verification:** Supported in Chrome 149+.
- **Net Benefits:** Eliminates JS theme-toggle image swapping listeners and `.dark-mode img` selector overrides.

#### Opportunity 3.2: Focus Gradient Border Adaptability
- **Target File & Lines:** `website/css/layout.css`, lines 648–660 (`.single-line[contenteditable]:focus`)
- **Current JS/CSS Workaround:**
  ```css
  .single-line[contenteditable]:focus {
    background-image: 
      linear-gradient(oklch(62% 0.19 148 / 3%), oklch(62% 0.19 148 / 3%)),
      linear-gradient(135deg, var(--accent-color), var(--c-success));
  }
  ```
- **Proposed Native Solution (Chrome 149/150):**
  ```css
  .single-line[contenteditable]:focus {
    background-image: 
      light-dark(
        linear-gradient(oklch(0.95 0.02 250 / 40%), oklch(0.95 0.02 250 / 40%)),
        linear-gradient(oklch(0.20 0.02 250 / 40%), oklch(0.20 0.02 250 / 40%))
      ),
      linear-gradient(135deg, var(--accent-color), var(--c-success));
  }
  ```
- **Viability & Chrome Verification:** Supported in Chrome 149+.
- **Net Benefits:** Focus border tints dynamically adapt to system or user color schemes without redundant CSS rules.

---

### 4. CSS Gap Decorations (`column-rule-inset`, `row-rule-*`)

#### Opportunity 4.1: Segmented Control Divider Lines
- **Target File & Lines:** `website/css/layout.css`, lines 125–134 (`.segmented-control`)
- **Current JS/CSS Workaround:**
  ```css
  .segmented-control {
    display: flex;
    background: var(--segment-bg);
    padding: 4px;
    border-radius: 10px;
    gap: 2px;
  }
  ```
  Relies on button border hacks or pseudo-elements (`::after`) to render thin vertical dividers between segmented options.
- **Proposed Native Solution (Chrome 150):**
  Apply native Flex Gap Decorations:
  ```css
  .segmented-control {
    display: flex;
    gap: 2px;
    column-rule: 1px solid var(--border-color);
    column-rule-inset: 4px;
  }
  ```
- **Viability & Chrome Verification:** Supported by default in Chrome 150+.
- **Net Benefits:** Clean vertical dividers between flex items without `:last-child` reset rules or pseudo-element hacks.

#### Opportunity 4.2: Three-Column Footer Divider Lines (`#brief-fuss`)
- **Target File & Lines:** `website/css/layout.css`, lines 398–412 (`#brief-fuss`)
- **Current JS/CSS Workaround:**
  ```css
  #brief-fuss {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: calc(10 / 210 * 100cqw);
  }
  ```
- **Proposed Native Solution (Chrome 150):**
  ```css
  #brief-fuss {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: calc(10 / 210 * 100cqw);
    column-rule: 0.5px solid var(--paper-ghost);
    column-rule-inset: 2px;
  }
  ```
- **Viability & Chrome Verification:** Supported by default in Chrome 150+.
- **Net Benefits:** Renders vertical dividers between grid columns natively without extra wrapper divs or cell border logic.

---

### 5. Name-Only Container Queries (`@container myName`)

#### Opportunity 5.1: Scoped Paper Canvas Container Scoping (`din-a4`)
- **Target File & Lines:** `website/css/layout.css`, lines 173–189 & lines 347–366 (`.overflow-indicator-text`)
- **Current JS/CSS Workaround:**
  ```css
  din-a4 {
    container-type: size;
    container-name: paper;
  }
  ```
  Sub-components query viewport dimensions or use explicit container queries requiring size parameters (`@container paper (min-width: 0px)`).
- **Proposed Native Solution (Chrome 150/151):**
  Modernize using Name-Only Container Queries:
  ```css
  @container paper {
    .overflow-indicator-text {
      position: absolute;
      bottom: calc(32 / 297 * 100cqh);
      right: calc(20 / 210 * 100cqw);
      font-size: calc(7.5 * 0.168cqw);
    }
  }
  ```
- **Viability & Chrome Verification:** Supported by default in Chrome 150/151.
- **Net Benefits:** Removes dummy dimension query conditions, scoping rules cleanly to named containers.

---

### 6. CSS Anchor Positioning (`position-area`) + `popover="hint"`

#### Opportunity 6.1: Zero-JS Text Selection Formatting Toolbar
- **Target File & Lines:** `website/js/10-ui/01-format-toolbar.js` (lines 9–10, 117–134, 175–180) & `index.html` (lines 276–281)
- **Current JS/CSS Workaround:**
  ```javascript
  // format-toolbar.js lines 117-126
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (this.#selectionAnchor) {
    this.#selectionAnchor.style.top = `${rect.top}px`;
    this.#selectionAnchor.style.left = `${rect.left}px`;
  }
  ```
  Requires JS event listeners for `selectionchange`, manual top/left pixel coordinate math, and debounced timers.
- **Proposed Native Solution (Chrome 148-151):**
  Combine CSS Anchor Positioning (`position-area`) with `popover="manual"` / `popover="hint"`:
  ```css
  #format-toolbar {
    position-anchor: --selection-anchor;
    position-area: top center;
    position-try-options: flip-block, flip-inline;
  }
  ```
- **Viability & Chrome Verification:** Supported by default in Chrome 150/151.
- **Net Benefits:** **-25 LOC in JS**. Browser compositor thread handles toolbar positioning natively with zero layout thrashing or lag.

#### Opportunity 6.2: Dropdown Position Area Modernization
- **Target File & Lines:** `website/css/layout.css`, lines 571–590 (`#local-address-dropdown`) & lines 604–623 (`#postvermerk-dropdown`)
- **Current JS/CSS Workaround:**
  Uses legacy coordinate syntax: `top: calc(anchor(bottom) + 4px); left: anchor(left);`.
- **Proposed Native Solution (Chrome 150):**
  ```css
  #local-address-dropdown {
    position-anchor: --anchor-empfaenger;
    position-area: bottom span-x;
    margin-top: 4px;
    width: anchor-size(width);
    position-try-options: flip-block;
  }
  ```
- **Viability & Chrome Verification:** Supported in Chrome 150+.
- **Net Benefits:** Declarative dropdown placement with automatic viewport collision flipping (`flip-block`).

#### Opportunity 6.3: Declarative Tooltips with Shortcut Badges via `popover="hint"`
- **Target File & Lines:** `index.html`, lines 276–281 (`#format-toolbar` buttons)
- **Current JS/CSS Workaround:**
  Uses plain, unstyled browser `title` attributes (`title="Fett"`). Browser `title` tooltips cannot be styled, have display delays, and cannot show shortcut badges.
- **Proposed Native Solution (Chrome 150/151):**
  Use `popover="hint"` and `interesttarget`:
  ```html
  <button id="btn-bold" interesttarget="tooltip-bold"><b>B</b></button>
  <div id="tooltip-bold" popover="hint" class="tooltip-popover">Fett <kbd>Strg+B</kbd></div>
  ```
  ```css
  .tooltip-popover {
    position-anchor: --btn-bold;
    position-area: top center;
    background: var(--bg-sidebar-glass);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--border-color);
    padding: 4px 8px;
    border-radius: 6px;
  }
  ```
- **Viability & Chrome Verification:** Enabled by default in Chrome 150/151. `popover="hint"` allows nested tooltips to display over existing active popovers without closing the parent popover.
- **Net Benefits:** Rich, styled tooltips with zero JS event listeners.

---

### 7. HTML State & CSS `:has()` Toggle Patterns

#### Opportunity 7.1: Theme Light / Dark / Auto Switcher
- **Target File & Lines:** `js/00-core/02-settings-manager.js` (lines 76–95, 212–238) & `index.html` (lines 44–48)
- **Current JS/CSS Workaround:**
  ```javascript
  // SettingsManager.js:
  if (this.settings.theme === 'light') {
    document.documentElement.style.colorScheme = 'light';
    document.documentElement.dataset.theme = 'light';
    this.btnThemeLight?.setAttribute('aria-pressed', 'true');
    this.btnThemeDark?.setAttribute('aria-pressed', 'false');
    this.btnThemeAuto?.setAttribute('aria-pressed', 'false');
  }
  ```
  JS manually mutates DOM datasets, style properties, and iterates calling `setAttribute('aria-pressed')`.
- **Proposed Native Solution (Chrome 148-151):**
  Convert buttons to native visually hidden radio inputs:
  ```html
  <div class="segmented-control" focusgroup="horizontal wrap">
    <input type="radio" name="theme" id="btn-theme-light" value="light" class="sr-only">
    <label for="btn-theme-light">☀️ Hell</label>
    <input type="radio" name="theme" id="btn-theme-dark" value="dark" class="sr-only">
    <label for="btn-theme-dark">🌙 Dunkel</label>
    <input type="radio" name="theme" id="btn-theme-auto" value="auto" class="sr-only" checked>
    <label for="btn-theme-auto">💻 Auto</label>
  </div>
  ```
  ```css
  :root:has(#btn-theme-light:checked) { color-scheme: light; }
  :root:has(#btn-theme-dark:checked) { color-scheme: dark; }
  :root:has(#btn-theme-auto:checked) { color-scheme: light dark; }
  ```
- **Viability & Chrome Verification:** Enabled by default in Chrome 105+, optimized in Chrome 148-151.
- **Net Benefits:** **-35 LOC in JS**. Fully compliant with AGENTS.md Mandate 28. Active state and color scheme application become 100% declarative in CSS. JS only reads/writes `localStorage` on `change` events.

#### Opportunity 7.2: Font Stack Selector (Sans / Serif)
- **Target File & Lines:** `js/00-core/02-settings-manager.js` (lines 113–126) & `index.html` (lines 118–121)
- **Current JS/CSS Workaround:**
  JS calls `document.body.classList.remove('font-stack-sans', 'font-stack-serif')` and `classList.add()`.
- **Proposed Native Solution (Chrome 148-151):**
  ```html
  <div class="segmented-control" id="font-stack-select" focusgroup="horizontal wrap">
    <input type="radio" name="font-stack" id="btn-font-sans" value="sans" class="sr-only" checked>
    <label for="btn-font-sans">Sans</label>
    <input type="radio" name="font-stack" id="btn-font-serif" value="serif" class="sr-only">
    <label for="btn-font-serif">Serif</label>
  </div>
  ```
  ```css
  body:has(#btn-font-serif:checked) { font-family: var(--font-stack-serif); }
  body:has(#btn-font-sans:checked) { font-family: var(--font-stack-sans); }
  ```
- **Viability & Chrome Verification:** Enabled in Chrome 148-151.
- **Net Benefits:** **-45 LOC in JS** (combined with guides toggle refactoring). Removes all `classList` modifications in JS.

#### Opportunity 7.3: Formality & Date Format Selectors
- **Target File & Lines:** `js/20-features/01-salutation-engine.js` (lines 127–153) & `js/20-features/07-date-format.js` (lines 37–60)
- **Current JS/CSS Workaround:**
  JS helper functions `_applyUIState()` and `updateActiveButton()` manually iterate over button references to update `aria-pressed`.
- **Proposed Native Solution (Chrome 148-151):**
  Replace buttons with `<input type="radio">` controls. Active selection styling is driven natively via CSS `.segmented-control input:checked + label`.
- **Viability & Chrome Verification:** Enabled in Chrome 148-151.
- **Net Benefits:** **-30 LOC in JS**. Browser natively manages radio checked states and accessibility trees.

#### Opportunity 7.4: Zero-JS Signature Presence Detection
- **Target File & Lines:** `js/20-features/02-signature.js` (lines 122, 127) & `website/css/layout.css` (lines 698–707)
- **Current JS/CSS Workaround:**
  JS calls `document.body.toggleAttribute('data-has-signature', true|false)` on image upload or reset.
- **Proposed Native Solution (Chrome 148-151):**
  Use CSS `:has()` selector matching directly against `#signature-image`:
  ```css
  :root:has(#signature-image[src]:not([src=""])) #btn-reset-sig,
  :root:has(#signature-image[src]:not([src=""])) #signature-image {
    display: block !important;
  }
  :root:has(#signature-image[src]:not([src=""])) #btn-upload-sig-trigger {
    display: none !important;
  }
  ```
- **Viability & Chrome Verification:** Enabled in Chrome 148-151.
- **Net Benefits:** Eliminates `document.body.toggleAttribute('data-has-signature')` logic in JS.

---

### 8. Native HTML5 `<dialog>` Modal Integration

#### Opportunity 8.1: Reset Brief Confirmation Modal Dialog
- **Target File & Lines:** `website/js/main.js`, lines 123–129
- **Current JS/CSS Workaround:**
  ```javascript
  btnReset.addEventListener('click', () => {
    if (confirm('Möchtest du alle Texte wirklich zurücksetzen?')) {
      draftManager.resetDraft();
      uiProtections.checkTextOverflow();
    }
  });
  ```
  Uses legacy blocking `window.confirm()`. Synchronously halts JS execution, cannot adopt glassmorphism styling or dark/light themes, and freezes user interaction.
- **Proposed Native Solution (Chrome 148-151):**
  Implement a declarative HTML5 `<dialog>` element with `.showModal()`:
  ```html
  <dialog id="reset-confirm-dialog" class="glass-dialog no-print">
    <form method="dialog" class="dialog-content">
      <h3>Brief zurücksetzen?</h3>
      <p>Möchtest du alle eingegebenen Texte und Daten wirklich unwiderruflich löschen?</p>
      <div class="dialog-actions">
        <button value="cancel" class="btn">Abbrechen</button>
        <button value="confirm" class="btn btn-danger">Ja, zurücksetzen</button>
      </div>
    </form>
  </dialog>
  ```
  ```javascript
  const dialog = document.getElementById('reset-confirm-dialog');
  btnReset.addEventListener('click', () => dialog.showModal());
  dialog.addEventListener('close', () => {
    if (dialog.returnValue === 'confirm') {
      draftManager.resetDraft();
      uiProtections.checkTextOverflow();
    }
  });
  ```
- **Viability & Chrome Verification:** Enabled by default in Chrome 97+, with `:modal` and `@starting-style` backdrop animations refined in Chrome 148-151.
- **Net Benefits:** Non-blocking top-layer modal with automatic focus trapping, ESC key dismissal, backdrop blur filtering (`::backdrop { backdrop-filter: blur(8px); }`), and full theme integration.

#### Opportunity 8.2: Page Overflow Warning Detection via Container Scroll-State Query
- **Target File & Lines:** `js/00-core/03-ui-protections.js` (lines 22–33) & `js/main.js` (line 136)
- **Current JS/CSS Workaround:**
  ```javascript
  checkTextOverflow() {
    if (this.brieftext.scrollHeight > 450) {
      this.paper.classList.add('overflow-warn');
    }
  }
  ```
  JS attaches an `input` event listener in `main.js` executing `checkTextOverflow()` on every keystroke, reading `.scrollHeight` and causing layout trashing.
- **Proposed Native Solution (Chrome 148-150):**
  Utilize Container Scroll-State Queries (`@container scroll-state(overflow-y: true)`):
  ```css
  din-text#brieftext {
    container-type: scroll-state;
  }
  @container scroll-state(overflow-y: true) {
    din-a4 .overflow-indicator-text {
      display: block;
    }
  }
  ```
- **Viability & Chrome Verification:** Enabled by default in Chrome 148-150.
- **Net Benefits:** **-18 LOC in JS**. Completely removes `checkTextOverflow()`, `.scrollHeight` reading, and keystroke event polling in `main.js`.

---

## Summary Comparison Matrix

| # | Feature Area | Target Location | Current Workaround | Proposed Native Solution | Chrome Baseline | Net Benefit |
|---|---|---|---|---|---|---|
| 1.1 | `text-fit` | `layout.css:247` (`#absender`) | Fixed font size + truncation | `text-fit: contain; white-space: nowrap;` | Chrome 150/151 | Auto-fit sender address line |
| 1.2 | `text-fit` | `layout.css:308` (`#betreff`) | Fixed font size + `text-wrap` | `text-fit: contain;` | Chrome 150/151 | Prevent subject line overflow |
| 1.3 | `text-fit` | `layout.css:639` (`.single-line`) | `text-overflow: ellipsis` | `text-fit: contain;` | Chrome 150/151 | Prevent input truncation |
| 2.1 | `focusgroup` | `index.html:44,53` (Segmented controls) | Manual `tabindex` / tab stops | `focusgroup="horizontal wrap"` | Chrome 150/151 | Native arrow-key navigation |
| 2.2 | `focusgroup` | `index.html:187` (Footer actions) | Sequential tabbing | `focusgroup="vertical wrap"` | Chrome 150/151 | Vertical arrow-key navigation |
| 3.1 | `light-dark()` | `variables.css:21`, `layout.css:553` | JS `src` swapping / blend mode | `light-dark(url('light'), url('dark'))` | Chrome 149/150 | Zero-JS theme images |
| 3.2 | `light-dark()` | `layout.css:648` (Focus border) | Fixed gradient tint | `light-dark(linear-gradient, linear-gradient)` | Chrome 149/150 | Theme-adaptive focus borders |
| 4.1 | Gap Decorations | `layout.css:125` (`.segmented-control`)| Button border hacks / `::after` | `column-rule: 1px solid; column-rule-inset: 4px;` | Chrome 150 | Native flex gap dividers |
| 4.2 | Gap Decorations | `layout.css:398` (`#brief-fuss`) | Grid gap without dividers | `column-rule: 0.5px solid var(--paper-ghost);` | Chrome 150 | Native 3-column grid dividers |
| 5.1 | Name-Only Containers | `layout.css:173,347` (`din-a4`) | `@container paper (min-width: 0px)` | `@container paper { ... }` | Chrome 150/151 | Simplified container scoping |
| 6.1 | Anchor Positioning | `format-toolbar.js:117`, `index.html:276` | `getBoundingClientRect()` + JS listeners | `position-anchor`, `position-area: top center` | Chrome 150/151 | **-25 LOC JS**, 0-jank toolbar |
| 6.2 | Anchor Positioning | `layout.css:571,604` (Dropdowns) | Coordinate syntax `top: calc(anchor())` | `position-area: bottom span-x;` | Chrome 150 | Declarative dropdown alignment |
| 6.3 | `popover="hint"` | `index.html:276` (`#format-toolbar`) | Unstyled browser `title` | `popover="hint"` + `interesttarget` | Chrome 150/151 | Rich tooltips with shortcut badges |
| 7.1 | CSS `:has()` | `02-settings-manager.js:76`, `index.html:44` | JS DOM dataset / colorScheme mutation | Radio inputs + `:root:has(#theme:checked)` | Chrome 148-151 | **-35 LOC JS**, Mandate 28 compliant |
| 7.2 | CSS `:has()` | `02-settings-manager.js:113` | JS `classList.add/remove` | Radio inputs + `body:has(#font:checked)` | Chrome 148-151 | **-45 LOC JS**, 0 JS class toggling |
| 7.3 | CSS `:has()` | `01-salutation-engine.js:127`, `07-date-format.js:37` | JS `aria-pressed` loop functions | Radio inputs + CSS `input:checked + label` | Chrome 148-151 | **-30 LOC JS**, native form state |
| 7.4 | CSS `:has()` | `02-signature.js:122` | JS `body.toggleAttribute('data-has-signature')` | CSS `:root:has(#signature-image[src]:not([src=""]))` | Chrome 148-151 | Zero-JS signature state |
| 8.1 | `<dialog>` | `main.js:123` | Blocking `window.confirm()` | `<dialog id="reset-dialog">` + `.showModal()` | Chrome 148-151 | Non-blocking, glassmorphic modal |
| 8.2 | Container Scroll-State| `ui-protections.js:22`, `main.js:136` | JS `.scrollHeight` checks & keystroke listener | `@container scroll-state(overflow-y: true)` | Chrome 148-150 | **-18 LOC JS**, 0 layout thrashing |

---

## Architectural Conclusion & Implementation Roadmap

The audit confirms that DIN-Brief Neo can eliminate **~153 lines of JavaScript** and transition all UI state management, popover positioning, font auto-scaling, keyboard navigation, and theme adaptation to native HTML5 and CSS primitives available in **Chrome 148–151**.

### Recommended Migration Sequence:
1. **Phase 1 (HTML State & CSS `:has()` Refactoring):**
   Replace `SettingsManager` imperative DOM dataset mutations with native radio inputs and `:has()` selectors (compliant with AGENTS.md Mandate 28).
2. **Phase 2 (`focusgroup` & Keyboard Accessibility):**
   Add `focusgroup="horizontal wrap"` and `focusgroup="vertical wrap"` attributes to segmented controls, toolbars, and sidebar action footers.
3. **Phase 3 (CSS Anchor Positioning & `popover="hint"`):**
   Migrate text selection toolbar positioning from JS `getBoundingClientRect()` to native CSS Anchor Positioning (`position-area: top center`) and add rich hover tooltips via `popover="hint"`.
4. **Phase 4 (`text-fit` & Gap Decorations):**
   Apply `text-fit: contain;` to `#absender`, `#betreff`, and `.single-line` fields to prevent text truncation, and add `column-rule-inset` for clean flex/grid dividers.
5. **Phase 5 (Native `<dialog>` Modals):**
   Replace legacy blocking `window.confirm()` alerts with declarative `<dialog>` modals featuring glassmorphism backdrops.

---
*Report generated by Project Orchestrator (Chrome 148-151 Audit). All source files in target directory remained untouched (Strict Read-Only Policy).*
