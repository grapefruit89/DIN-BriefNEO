---
id: SPEC-056-TASK
title: Environment Integrity Checklist
status: in-progress
version: 4.0.0
---

# 30 â€” Aufgaben: Implementierung & Validierung (Environment)

## 1. Implementation Tasks
- [x] Entfernung aller JS-basierten UI-Toggles (Refactoring `ui.js`).
- [x] Etablierung der `:has()` Logik in `app-ui.css`.
- [x] Definition von `@property` fÃ¼r CMA-MaÃŸe (High-Integrity Animation).
- [ ] **Offen:** Audit des Service Workers (`sw.js`) auf vollstÃ¤ndige Cache-Purity.
- [ ] **Offen:** Validierung des Web-Manifests fÃ¼r Chrome 147 Standalone Mode.

## 2. Validation
- [x] Test: JS deaktivieren â†’ UI-Buttons (Radio) mÃ¼ssen Geometrie Ã¤ndern.
- [x] Test: Form A/B Wechsel â†’ Smooth Transition (kein Pixel-Jump).
- [ ] **Offen:** Lighthouse Audit fÃ¼r PWA Installability.

## 3. Akzeptanz
- [x] Zero-JS UI Doctrine enforced.
- [x] Offline-VerfÃ¼gbarkeit des Kern-Layouts gegeben.

