---
id: SPEC-059-TASK
title: Persistence Execution Checklist
status: active
version: 4.0.0
---

# 30 — Aufgaben: Implementierung & Validierung (PWA)

## 1. Implementation Tasks
- [x] Refactoring `StateManager`: Umstellung auf IMR 4.0 Schema.
- [x] Implementierung Debounced Auto-Save.
- [x] Initiales `manifest.json` für Desktop-Standalone erstellt.
- [ ] **Offen:** Vollständige `Cache-First` Logik in `sw.js`.
- [ ] **Offen:** OPFS Integration für Log-Journaling (Flight Recorder).

## 2. Validation
- [x] Test: Refresh-Resilienz (Daten bleiben bei F5 erhalten).
- [ ] **Offen:** Offline-Check: App muss ohne Netzwerk starten.
- [ ] **Offen:** PWA Lighthouse Audit (Target: >90 Score).

## 3. Akzeptanz
- [x] Zero-Action Save aktiv.
- [x] Standalone Mode in Chrome 147 verifiziert.
