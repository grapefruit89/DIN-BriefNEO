---
id: TASKS-056
plan: PLAN-056
title: Execution of the Pure Native Purge
status: completed
date: 2026-03-21
---

# Tasks: Pure Native Purge

## 1. HTML Härtung
- [x] Radio-Buttons in `sidebar-left` mit eindeutigen IDs (`radio-layout-a`, `radio-layout-b`) versehen.
- [x] Checkbox für Hilfslinien mit ID `toggle-guides` versehen.
- [x] ALLE `onchange`-Handler aus der `index.html` löschen.
- [x] Daten-Aktionen (Export/Reset) mit `data-action` markieren.

## 2. CSS Aktivierung
- [x] `:has()` Selektoren im `@layer project.overrides` implementieren.
- [x] `if()` Logik für alle betroffenen DIN-Zonen zementieren.
- [x] `view-transition-trigger: checked` für alle State-Holder (Radio/Checkbox) setzen.

## 3. JavaScript Sanierung
- [x] Alle UI-State Funktionen aus `ui.js` löschen.
- [x] Zentralen `click`-Delegator für Daten-Aktionen implementieren.
- [x] `parseDate` final auf Temporal umstellen (TOMB-L001).

## 4. Validierung
- [x] Mission Readiness Report (Premium v25) ausführen.
- [x] Visueller Test der Layout-Wechsel (Morphing ok?).
- [x] Sicherstellen, dass kein `new Date()` mehr im Bundle ist.
