---
id: PLAN-051
spec: SPEC-051
title: Ghost-Mirror & Plaintext Integrity Implementation
status: draft
anti-patterns: [ANTI-023, ANTI-025]
adr: ADR-008
---

# Plan: Ghost-Mirror & Plaintext Integrity (HOW)

## 1. Constitution Check (Aviation Grade)
| Gate | Status | Notiz |
|---|---|---|
| Vanilla Purity | OK | Nur nativ HTML/CSS/JS |
| Visual Freeze | OK | Mirror-Positionierung absolut, kein Shift |
| No-JS Doctrine | OK | Sichtbarkeit des Mirrors rein via CSS :has() |
| IMR-Integrity | OK | SSoT bleibt Plaintext im din-body |

## 2. Technische Umsetzung

### 2.1 HTML-Ebene (Struktur)
- `<din-body>` bekommt `contenteditable="plaintext-only"`.
- `<din-body-mirror>` wird als direktes Geschwister-Element nach `<din-body>` eingefügt.
- Der Mirror erhält `aria-hidden="true"`, `user-select: none` und `pointer-events: none`.

### 2.2 CSS-Ebene (Geometrie & Sichtbarkeit)
- `@layer din.core`:
  ```css
  din-body, din-body-mirror {
    position: absolute;
    top: var(--salutation-top); /* plus offset */
    left: var(--margin-left);
    width: var(--text-width);
    font-size: var(--font-size-body);
    line-height: var(--line-height);
  }
  din-body-mirror { color: transparent; white-space: pre-wrap; word-wrap: break-word; }
  ```
- `@layer project.overrides`:
  ```css
  /* Ghost-Mirror Sichtbarkeit */
  #paper:not(:has(din-body:focus)) din-body-mirror { opacity: 1; visibility: visible; }
  #paper:has(din-body:focus) din-body-mirror     { opacity: 0; visibility: hidden; }
  
  /* Print: Nur Mirror anzeigen */
  @media print {
    din-body { display: none !important; }
    din-body-mirror { display: block !important; color: black; }
  }
  ```

### 2.3 JS-Ebene (Logic & Sync)
- **Logic**: Eine neue Funktion `parseMarkdown(text)` in `js/logic/logic.js`:
  ```javascript
  // Snippet zur Illustration
  text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  ```
- **UI**: Im `UIController.init()` einen Listener auf `din-body` (input), der bei jeder Änderung `logic.parseMarkdown(el.textContent)` aufruft und das Ergebnis in `din-body-mirror.innerHTML` schreibt.

## 3. Anti-Pattern Guard
- **ANTI-025 (JS-String-Engine in UI)**: Wir verhindern dies, indem die Logik in `logic.js` (Pure) liegt und der Mirror nur als Anzeige-Element dient.
- **ANTI-023 (Magic Numbers)**: Alle Koordinaten werden aus dem CMA-System (`constants.js`) bezogen.

## 4. Cemetery Update
- Das begrabene `richText: true` Flag aus `constants.js` wird im `UIController` final ignoriert/entfernt (TOMB-L008).
