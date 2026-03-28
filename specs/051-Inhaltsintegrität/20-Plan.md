---
id: SPEC-051-PLAN
title: Content Integrity & Ghost-Mirror Technical Plan
status: cemented
version: 4.0.0
---

# 20 â€” Plan: Technische Realisierung (Integrity)

## 1. Architektur-Konzept
Unidirektionaler Render-Cycle zur Sicherstellung der Datenreinheit.

### Layer 1: Input Engine (`EditContext API`)
- Abstraktion des Texteingabeprozesses vom DOM.
- `EditContext` liefert Roh-Text ohne HTML-StÃ¶rsignale.

### Layer 2: Transform Engine (`js/logic/logic.js`)
- **Parser:** `parseMarkdownToHTML(text)` wandelt Plaintext-Tokens in semantisches HTML um.
- **Sanitization:** Nutzung der `Native Sanitizer API` zur Validierung des generierten Markups vor Injektion.

### Layer 3: Output Layer (`js/ui/ghost-mirror.js`)
- **Target:** `<din-text-mirror>` (Positioned via CSS Anchor/Absolute Ã¼ber Source).
- **Injektion:** `mirror.setHTML(html, { sanitizer: v4.0 Standard_SANITIZER })`.

## 2. CSS Visibility State Machine
- `din-text:focus { opacity: 1; }`
- `din-text:focus + din-text-mirror { opacity: 0; pointer-events: none; }`
- `din-text:not(:focus) { opacity: 0; }`
- `din-text:not(:focus) + din-text-mirror { opacity: 1; }`

## 3. APIs
- **EditContext API:** High-Performance Input Handling.
- **Blink Sanitizer API:** Native XSS Prevention.
- **CSS Custom Highlight API:** Optional fÃ¼r Syntax-Highlighting im Edit-Mode.

