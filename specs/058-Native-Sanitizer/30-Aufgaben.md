---
id: SPEC-058-TASK
title: Native Sanitizer Execution Checklist
status: in-progress
version: 4.0.0
---

# 30 — Aufgaben: Implementierung & Validierung (Sanitizer)

## 1. Implementation Tasks
- [x] Definition `SANITIZER_CONFIG` in `constants.js`.
- [x] Whitelist für IMR 4.0 Atome vervollständigt.
- [x] Initialisierung `PLATINUM_SANITIZER` Instanz.
- [x] Refactoring `UIController._updateDOMSafe` auf `setHTML` Workflow.
- [x] Refactoring `GhostMirror.updateMirror` auf `setHTML` Workflow.
- [ ] **Offen:** Verifizierung der Sanitization bei `Blockquote` Verschachtelung.

## 2. Validation
- [x] Test: Injektion von `<script>alert(1)</script>` via Markdown-Parser → MUSS neutralisiert werden.
- [ ] **Offen:** Test: Erhalt von erlaubten Tags (`<strong>`) nach `setHTML`.
- [ ] **Offen:** Browser-Kompatibilitäts-Check (Chrome 147 Baseline).

## 3. Akzeptanz
- [x] MANDATE-INJ: Keine `innerHTML` Aufrufe in der UI-Schicht.
- [x] SSoT: `PLATINUM_SANITIZER` ist die einzige Instanz für Injektionen.
