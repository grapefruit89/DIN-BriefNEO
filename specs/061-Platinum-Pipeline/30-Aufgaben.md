---
id: SPEC-061-TASK
title: PVP Execution Checklist
status: in-progress
version: 4.0.0
---

# 30 — Aufgaben: Implementierung & Validierung (Pipeline)

## 1. Implementation Tasks
- [x] Script `get-catalog.mjs` implementiert.
- [x] Basis `post-session-verify.ps1` in `tools/` erstellt.
- [ ] **Offen:** Integration von `Shrink-Guard` in die Git-Hooks.
- [ ] **Offen:** Automatisierte Prüfung auf `oklch()` Farbraum in CSS-Dateien.

## 2. Validation
- [x] Test: Fehlerhafte Injektion (`innerHTML`) wird erkannt.
- [ ] **Offen:** Test: Schema-Extraktion bei IMR-Änderung verifizieren.

## 3. Akzeptanz
- [x] 0% Halluzinations-Rate bei Tag-Namen durch PVP-Katalog.
- [x] Aviation Grade Security-Net aktiv.
