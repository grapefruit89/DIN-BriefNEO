---
id: SPEC-002-TASK
title: Aufgabenliste Anrede-Engine
tags: [checklist, implementation, testing]
status: in-progress
version: 4.0.0
---

# 30 — Aufgaben: Implementierung & Validierung

## 1. Implementierungs-Tasks
- [x] IMR 4.0 Mapping für `<din-anrede>` erstellen.
- [x] `parseRecipient` Funktion in `logic.js` auf granulare Atome umstellen.
- [x] Event-Binding in `ui.js` für `<din-empfaenger-name>` hinzufügen.
- [ ] **Offen:** Punktuation Guard für Grußformel implementieren (Warnung bei Komma).
- [ ] **Offen:** `Casual`-Stufe in der UI wählbar machen.

## 2. Test-Szenarien
- [ ] Test: "Frau Dr. Erika Mustermann" → "Sehr geehrte Frau Dr. Mustermann,"
- [ ] Test: "Herr Max Muster" → "Sehr geehrter Herr Muster,"
- [ ] Test: Manuelle Änderung → Automatik muss stoppen (`data-auto="false"`).

## 3. Abnahme-Kriterien
- [x] Keine `new Date()` Altlasten.
- [x] OKLCH Farbschema für Warnungen aktiv.
- [x] EditContext-Binding stabil.
