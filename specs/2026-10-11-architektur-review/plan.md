---
id: plan-2026-10-11-architektur-review
title: 'Plan: Phasen-Roadmap für sicheres Event-Driven Refactoring'
type: plan
status: active
created: '2026-10-11'
updated: '2026-10-11'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/plan
  - event-bus
  - refactoring
spec_links:
  - spec-2026-10-11-architektur-review
---

# Plan: Phasen-Roadmap für sicheres Event-Driven Refactoring

## Phase 0 — Isolierung & Ausgangsbasis (Erledigt)
- [x] Branch `refactor/architektur-review` angelegt.
- [x] Original-Plan und Prompt gesichert in `specs/2026-10-11-architektur-review/`.
- [x] Spec (`spec.md`) und Plan (`plan.md`) definiert.
- [x] Fitness Gate verifiziert (100 %).

## Phase 1 — EventBus-Fundament (Erledigt)
- [x] `website/js/00-event-bus.js` angelegt (flache Modulstruktur gemäß AGENTS.md §7a, Events + createEventBus + eventBus).
- [x] Basierend auf nativem `EventTarget` und `CustomEvent` mit Namespace `dinbrief:`.
- [x] Unit-Tests in `test/all.js` für Event-Pub/Sub ergänzt (23/23 Tests bestanden).
- [x] Verifikation: Fitness Gate 100 %, keine Seiteneffekte auf bestehenden Code.

## Phase 2 — Toast- & Benachrichtigungssystem entkoppeln (Erledigt)
- [x] `32-toast.js` so erweitert, dass es auf `dinbrief:notification.requested` lauscht.
- [x] In `main.js`: `onToast`-Callback-Übergabe restlos entfernt.
- [x] Alle Publisher umgestellt (`43-geoapify.js`, `52-import-export.js`, `46-clipboard-address-parser.js`, `02-settings-manager.js`, `41-salutation-engine.js` publizieren über den EventBus).
- [x] Verifikation: 24/24 Tests im Browser bestanden, Fitness Gate 100 %.

## Phase 3 — Reine Domain-Funktionen extrahieren
- [ ] Postcode-Lookup Logik aus `45-address-intelligence.js` in pure Funktion extrahieren.
- [ ] Salutation-Berechnung aus `41-salutation-engine.js` prüfen und kapseln.
- [ ] Unit-Tests für pure Domain-Funktionen (ohne DOM/Storage-Mocks).
- [ ] Verifikation: Adresserkennung und Anrede-Ableitung laufen unverändert präzise.

## Phase 4 — Autosave & Save-Events entkoppeln
- [ ] Callback `onSaveDraft: () => draftManager.saveDraft()` durch Event `dinbrief:document.save.requested` ersetzen.
- [ ] `01-draft-manager.js` lauscht auf Speicheranforderungen.
- [ ] Verifikation: Entprelltes Speichern, Statusanzeige (#speicher-status) und Undo/Redo bleiben intakt.

## Phase 5 — Dokumentzustand & History harmonisieren
- [ ] State-Ownership klarer modellieren, ohne die DOM-Eingabeschleife zu stören.
- [ ] Caret-Tracking und Undo-Stack absichern.
- [ ] Vollständiger Regressionstest gegen alte gespeicherte Briefe und Vorlagen.
