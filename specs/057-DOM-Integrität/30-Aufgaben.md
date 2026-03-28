---
id: SPEC-057-TASK
title: DOM-First Execution Checklist
status: in-progress
version: 4.0.0
---

# 30 — Aufgaben: Implementierung & Validierung (DOM-First)

## 1. Implementation Tasks
- [x] Refactoring `ui.js`: Umstellung auf `Batch-Persistence` (Fokus-basiert).
- [ ] **Offen:** Implementierung CSS Anchor Positioning für `#editor-toolbar`.
- [x] IMR 4.0 Atome in `index.html` von statischen Labels befreit.
- [ ] **Offen:** `anchor-name` Zuweisung in `UIController` beim Feld-Fokus integrieren.

## 2. Validation
- [x] Test: Daten bleiben nach Refresh erhalten (Blur-Trigger).
- [ ] **Offen:** Test: Toolbar-Positionierung in Chrome 147 prüfen.
- [x] Test: "Alles Löschen" zerstört Briefstruktur nicht.

## 3. Akzeptanz
- [x] SSoT: DOM ist während der Session führend.
- [x] Zero-Lag beim Tippen (kein synchroner State-Update).
