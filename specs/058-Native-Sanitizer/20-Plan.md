---
id: SPEC-058-PLAN
title: Native Sanitizer Technical Architecture
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (Sanitizer)

## 1. Architektur-Konzept
Zentralisierung der Sicherheit durch eine globale Sanitizer-Instanz.

### Layer 1: Central Config (`js/core/constants.js`)
- **Instanziierung:** `new Sanitizer(SANITIZER_CONFIG)`.
- **Export:** `PLATINUM_SANITIZER`.
- **Fallback:** Graceful Degradation auf `textContent`, falls die API in Legacy-Umgebungen fehlt (obwohl Chrome 147 Baseline ist).

### Layer 2: Secure Injection Gate (`js/ui/ui.js`)
- **Methode:** `_updateDOMSafe(el, html)`.
- **Logic:**
  ```javascript
  if (el.setHTML && PLATINUM_SANITIZER) {
    el.setHTML(html, { sanitizer: PLATINUM_SANITIZER });
  } else {
    el.textContent = html; // Strip all HTML as fallback
  }
  ```

### Layer 3: Ghost-Mirror Sync
- Alle durch `Logic.parseMarkdownToHTML` generierten Strings MÜSSEN via `setHTML` in den Mirror injiziert werden.

## 2. APIs & Standards
- **Blink Native Sanitizer API:** Kern-Sicherheitstechnologie.
- **IMR 4.0 Registry:** Definiert die erlaubten Custom-Tags (`din-*`).

## 3. Security Hardening
- **MANDATE-INJ:** Automatischer Pipeline-Check auf `innerHTML` Vorkommen im Code.
- **Audit:** Regelmäßiger Review der `SANITIZER_CONFIG` Whitelist.
