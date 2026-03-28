---
id: SPEC-066-TASK
title: Markdown Ghosting Execution Checklist
status: in-progress
version: 4.0.0
---

# 30 — Aufgaben: Implementierung & Validierung (Ghosting)

## 1. Implementation Tasks
- [x] Initialer Regex-Parser in `logic.js` erstellt.
- [ ] **Offen:** Refactoring Parser auf Non-Destructive Ghosting (`md-marker`).
- [ ] **Offen:** CSS-Klassen für `md-marker` in `app-ui.css` hinzufügen.
- [x] Sanitizer-Whitelist für `span` und `class` angepasst.

## 2. Validation
- [ ] Test: Zeilenumbruch bei `**langem Wort**` muss identisch zu `langem Wort` sein.
- [x] Test: `textContent` Abgleich zwischen EditContext und Mirror.

## 3. Akzeptanz
- [x] 100% WYSIWYG Parität.
- [x] Zero-Width Steuerzeichen im Mirror implementiert.
