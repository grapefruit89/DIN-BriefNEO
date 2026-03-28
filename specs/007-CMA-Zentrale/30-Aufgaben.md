---
id: SPEC-007-TASK
title: CMA Execution Checklist
status: active
version: 4.0.0
---

# 30 — Aufgaben: Implementierung & Validierung (CMA)

## 1. Implementation Tasks
- [x] IMR 4.0 Granular Update in `constants.js`.
- [x] Migration der `app-ui.css` auf `--din-*` Präfixe.
- [x] Standalone Datum-Positionierung (50mm).
- [ ] **Offen:** Vollständige `@property` Definitionen in CSS für alle CMA-Werte.
- [ ] **Offen:** Validierungs-Script für Unit-Tests (mm precision check).

## 2. Validation
- [x] Zero-Pixel-Drift Check (Chrome 147).
- [x] IMR-Key Consistency Check.
- [ ] **Offen:** Cross-Form-Umschaltung Test (Form A vs Form B).

## 3. Abnahme
- [x] No-Scroll Doctrine enforced.
- [x] No "Magic Numbers" in `ui.js`.
