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

## Phase 1 — EventBus-Fundament (Zero Risk)
- [ ] `website/js/00-event-bus.js` und `website/js/00-event-types.js` anlegen (flache Modulstruktur gemäß AGENTS.md §7a).
- [ ] Basierend auf nativem `EventTarget` und `CustomEvent` mit Namespace `dinbrief:`.
- [ ] Unit-Tests in `test/all.js` für Event-Pub/Sub ergänzen.
- [ ] Verifikation: Fitness Gate 100 %, keine Seiteneffekte auf bestehenden Code.

## Phase 2 — Toast- & Benachrichtigungssystem entkoppeln (Erster vertikaler Schnitt)
- [ ] `32-toast.js` so erweitern, dass es auf `dinbrief:notification.requested` lauscht.
- [ ] In `main.js`: `onToast`-Callback-Übergabe schrittweise ablösen.
- [ ] Publisher umstellen (`43-geoapify.js`, `52-import-export.js`, `46-clipboard-address-parser.js` publizieren Event statt Callback-Aufruf).
- [ ] Verifikation: Toasts erscheinen zuverlässig bei Import, Adresssuche und Fehlern.

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
