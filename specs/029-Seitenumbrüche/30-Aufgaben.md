---
id: SPEC-029-TASK
title: Pagination Implementation Tasks
status: in-progress
version: 4.0.0
---

# 30 — Aufgaben: Implementierung & Validierung

## 1. Implementierung
- [x] Basis `@media print` Setup in `app-ui.css`.
- [x] Renaming `din-text` (ehemals body) in Print-Selektoren.
- [ ] **Offen:** Implementierung von `@page` Counter (Seitenzahlen).
- [ ] **Offen:** CSS-Klasse für `break-inside: avoid` an Schlüsselstellen.

## 2. Test-Matrix
- [x] Test: Brief < 1 Seite → Keine Artefakte.
- [ ] **Offen:** Test: Brief > 2 Seiten → Korrekter Umbruch.
- [ ] **Offen:** Test: Vektorschärfe im PDF-Export prüfen.

## 3. Akzeptanz
- [x] Zero-JS Pagination (ADR-003 Compliance).
- [x] Keine Scrollbars im `din-A4` Container (MANDATE-SCROLL).
