---
id: SPEC-056-TASK
title: Environment Integrity Checklist
status: in-progress
version: 4.0.0
---

# 30 — Aufgaben: Implementierung & Validierung (Environment)

## 1. Implementation Tasks
- [x] Entfernung aller JS-basierten UI-Toggles (Refactoring `ui.js`).
- [x] Etablierung der `:has()` Logik in `app-ui.css`.
- [x] Definition von `@property` für CMA-Maße (Aviation Grade Animation).
- [ ] **Offen:** Audit des Service Workers (`sw.js`) auf vollständige Cache-Purity.
- [ ] **Offen:** Validierung des Web-Manifests für Chrome 147 Standalone Mode.

## 2. Validation
- [x] Test: JS deaktivieren → UI-Buttons (Radio) müssen Geometrie ändern.
- [x] Test: Form A/B Wechsel → Smooth Transition (kein Pixel-Jump).
- [ ] **Offen:** Lighthouse Audit für PWA Installability.

## 3. Akzeptanz
- [x] Zero-JS UI Doctrine enforced.
- [x] Offline-Verfügbarkeit des Kern-Layouts gegeben.
