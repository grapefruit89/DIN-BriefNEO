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

## Phase 3 — Reine Domain-Funktionen extrahieren (Erledigt)
- [x] Postcode- und City-Lookup-Logik aus `45-address-intelligence.js` in pure Domain-Funktionen nach `44-address-domain.js` extrahiert.
- [x] `resolvePostcode`, `resolveCity`, `filterPostcodePrefix` und `detectPlzInputPattern` isoliert und typisiert.
- [x] Unit-Tests für pure Domain-Funktionen in `test/all.js` ergänzt (29/29 Tests bestanden).
- [x] Verifikation: Fitness Gate 100 %, zero regressions.

## Phase 4 — Autosave & Save-Events entkoppeln (Erledigt)
- [x] Callback `onSaveDraft: () => draftManager.saveDraft()` durch Event `dinbrief:document.save.requested` ersetzt.
- [x] `01-draft-manager.js` lauscht auf Speicheranforderungen (`DOCUMENT_SAVE_REQUESTED`) und publiziert `DOCUMENT_SAVED` / `DOCUMENT_CHANGED`.
- [x] Publisher entkoppelt (`43-geoapify.js`, `45-address-intelligence.js`, `46-clipboard-address-parser.js`, `41-salutation-engine.js`, `52-import-export.js`, `main.js`).
- [x] Verifikation: Entprelltes Speichern, Statusanzeige (#save-status), Caret-Tracking und Undo/Redo bleiben intakt (33/33 Tests bestanden, Fitness Gate 100 %).

## Phase 5 — Dokumentzustand, History & Modul-Konsolidierung (Erledigt)
- [x] Konsolidierung der 21 JS-Dateien auf 7 LLM-optimale Domänen-Module (`00-`, `01-`, `02-`, `32-`, `41-`, `45-`, `51-`).
- [x] State-Ownership in `01-document.js` konsolidiert, Caret-Tracking und Undo/Redo abgesichert.
- [x] Settings, Signatur & Sanitize in `02-ui-settings.js` gebündelt.
- [x] Adress- und Geodaten in `45-address.js` gebündelt.
- [x] Storage, Metadaten, Datum & Export in `51-persistence.js` gebündelt.
- [x] Vollständiger Testlauf: 33/33 Tests bestanden, Evolutionary Fitness Gate bei 100 %.
