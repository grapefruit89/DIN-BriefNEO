---
id: BRAIN-003-APR
title: "Anti-Pattern Registry (Banned & Deprecated)"
status: "verified"
enforcement: "AUTOMATED VALIDATION (PVP)"
last_audit: 2026-03-28
tags:
  - anti-pattern
  - technical-debt
  - constraints
related:
  - "[[CONSTITUTION]]"
  - "[[CORE_SPEC]]"
---

# Anti-Pattern Registry (Banned Patterns)

## 1. PERSISTENCE & STATE (DEP-P)

- **DEP-P001:** `localStorage` for high-volume data (Use OPFS/Batch instead).
- **DEP-P002:** External cloud sync for draft state (Violation of Local-First architecture).
- **DEP-P003:** `JSON.stringify()` on primary input thread (Performance regression).
- **DEP-P004:** Hard-coded state keys (e.g., `signatureName`). Use IMR 4.0 keys (`signature`).

## 2. LAYOUT & STRUCTURE (DEP-L)

- **DEP-L001:** `innerHTML` for user content (Security risk: XSS). Use `setHTML()`.
- **DEP-L002:** `contenteditable="true"` (Use `plaintext-only` or `EditContext`).
- **DEP-L003:** `execCommand` (Deprecated legacy API).
- **DEP-L004:** External CSS frameworks (Tailwind/Bootstrap).
- **DEP-L005:** `popovertarget` / `popovertargetaction` (Use `commandfor` + `command`).
- **DEP-L006:** Inline `onchange` or `onclick` handlers in HTML.

## 3. LOGIC & APIS (DEP-C)

- **DEP-C001:** Legacy `Date` object (Use `Temporal API`). Exceptions: `parseDate` input handling.
- **DEP-C002:** Server-side dependencies for core logic (Client-Side-Only requirement).
- **DEP-C003:** External utility libraries (Moment.js, jspdf).
- **DEP-C004:** `setTimeout` / `requestIdleCallback` for debouncing (Use **IdleDetector API**).

## 4. STYLING (DEP-S)

- **DEP-S001:** Hex colors (`#ffffff`) or `rgba()` in CSS. Use `oklch()`.
- **DEP-S002:** Hard-coded Hover colors. Use **Relative Color Syntax (RCS)**.
- **DEP-S003:** Scrollbars in DIN-A4 container. Use `field-sizing: content` and `overflow: hidden`.
- **DEP-S004:** `@supports` guards for Baseline features (Chrome 147+ is the floor).

## 5. TOOLING (DEP-T)

- **DEP-T001:** Context-fragmenting tools (`head`/`tail`).
- **DEP-T002:** Environment-specific stream syntax (`cat <<EOF`).
- **DEP-T003:** Manual file versioning via filename (`_v1.0.md`). Use Git.

## 6. INPUT & SECURITY (APR-I)

- **APR-I001:** `contenteditable="true"` ohne EditContext (Use `EditContext API` + `plaintext-only`).
- **APR-I002:** Manuelle HTML-Sanitizer (Use `Sanitizer API` + `setHTML()`).
- **APR-I003:** `requestIdleCallback` für Autosave (Use `IdleDetector API` or `scheduler.postTask()`).
- **APR-I004:** `RegExp.$1-$9` / `RegExp.input` (Use modern named capture groups).
- **APR-I005:** `document.execCommand()` (Use **EditContext API** or direct DOM manipulation).

## 7. UI & ANIMATION (APR-U)

- **APR-U001:** JS-Dialog-Handler (Use **Invoker Commands** + `popover`).
- **APR-U002:** JS-Tooltip-Positionierung (Use **CSS Anchor Positioning**).
- **APR-U003:** JS-Layout-Transitions (Use **Scoped View Transitions**).
- **APR-U004:** Annex B String methods like `.fontsize()`, `.blink()` (Use modern CSS).

## 8. UPGRADE PATH (MODERN BASELINE)

| Area             | Legacy Pattern (BANNED)   | Modern API (TARGET)                    |
| :--------------- | :------------------------ | :------------------------------------- |
| **Date/Time**    | `new Date()`              | **Temporal API**                       |
| **Color**        | `rgba()`, `hex`           | `oklch()`                              |
| **Theme**        | `JS-Toggles`              | `light-dark()` & RCS                   |
| **Math**         | `JS-rounding`             | `round()`, `mod()` (CSS Math)          |
| **Typography**   | `<br>` hacks              | `text-wrap: balance / pretty`          |
| **Auto-Resize**  | `scrollHeight` listeners  | `field-sizing: content`                |
| **Animations**   | `JS height calc`          | `calc-size(auto)` / View Transitions   |
| **Modals**       | `div` + Focus Trap JS     | `<dialog>` + `popover`                 |
| **Popovers**     | `addEventListener`        | **Invoker Commands** (`commandfor`)    |
| **Positioning**  | `getBoundingClientRect()` | **CSS Anchor Positioning**             |
| **Input**        | `contenteditable="true"`  | `plaintext-only` + **EditContext API** |
| **Security**     | `innerHTML`               | **Sanitizer API** + `setHTML()`        |
| **Reactivity**   | `setTimeout`              | **IdleDetector API**                   |
| **Scheduling**   | `requestIdleCallback`     | `scheduler.postTask()`                 |
| **Scrolling**    | `JS Scroll-Listeners`     | **Scroll-driven Animations**           |
| **Conditionals** | `Complex Selectors`       | **CSS `if()` logic**                   |
