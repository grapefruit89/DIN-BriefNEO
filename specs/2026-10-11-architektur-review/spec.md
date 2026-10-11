---
id: spec-2026-10-11-architektur-review
title: 'Spec: Architektur-Review & Event-Driven Refactoring'
type: spec
status: active
created: '2026-10-11'
updated: '2026-10-11'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/spec
  - event-bus
  - refactoring
doc_links:
  - DECISION-LOG
  - ADR-JS
code_links:
  - 'website/js/main.js'
  - 'website/js/32-toast.js'
  - 'website/js/01-document.js'
---

# Spec: Architektur-Review & Event-Driven Refactoring

## 1. Hintergrund & Zielsetzung

Aus dem externen Architekturreview (`/home/moritz/Downloads/Architekturreview-Refactoring-Plan.json`) stammt der Vorschlag, DIN-BriefNEO in eine entkoppelte, event-getriebene Client-Architektur (Pub/Sub via native `EventTarget`/`CustomEvent`) umzubauen.

### Das Dilemma („Wenn wir das alles so durchpressen, funktioniert nachher was nicht mehr“):
Ein unreflektierter Big-Bang-Umbau der gesamten Codebasis birgt akute Risiken für Funktionalität, Stabilität und das Evolutionary Fitness Gate:
1. **Governance & Verzeichnis-Konflikt:** Der Vorschlag plant Unterordner (`website/js/core/`, `domain/`, `services/`, `adapters/`). `AGENTS.md` (§7a) und der Law Catalog fordern jedoch flache Dateien mit zweistelligen Präfixen (`0x`, `3x`, `4x`, `5x`). Unterordner brechen automatisierte Linter und `@adr`-Traceability.
2. **Caret-Kollaps in contenteditable:** Ein naives unidirektionales Datenfluss-Modell („Tippen → State-Update → DOM neu schreiben“) zerstört den Cursor (Caret springt an Position 0).
3. **Undo/Redo & Rich-Text:** Die bestehende History in `01-draft-manager.js` speichert Caret-Offsets zusammen mit Snapshots. Ein generischer State-Service ohne Caret-Tracking bricht Ctrl+Z / Ctrl+Y.
4. **Speicher- & Export-Kompatibilität:** Bestehende LocalStorage-Drafts (`din_draft_current`) und das JSON-Exportformat (`DINLETTER_FORMAT`) müssen strikt abwärtskompatibel bleiben.

## 2. Architekturprinzipien für den sicheren Umbau

- **Zero-Dependency & Pure Browser Standards:** Keine npm-Runtimes, kein Framework. Native ES-Module und `EventTarget`.
- **Vertikale Schnitte statt Big-Bang:** Jede Phase muss vollständig lauffähig sein und das Fitness Gate (100 %) bestehen.
- **Surgical EventBus:** Entkopplung primär dort, wo derzeit enge Callbacks übergeben werden (`onToast`, `onSaveDraft`).
- **DOM als Eingabemedium respektieren:** Eingaben im Briefblatt laufen wie gewohnt lokal; der EventBus synchronisiert debounced und reagiert auf externe Events (Undo, Redo, Import, Auto-Fill).

## 3. Akzeptanzkriterien

- **K1:** Branch `refactor/architektur-review` isoliert die Arbeit vollständig von `main`.
- **K2:** Das Fitness Gate (`node tools/build_db.js`) meldet vor und nach jedem Schritt 100 %.
- **K3:** Alle bestehenden Tests in `test/all.js` laufen ohne Fehler durch.
- **K4:** Kein Caret-Springen beim Tippen in Brieftext, Betreff, Empfänger oder Datum.
- **K5:** Undo/Redo (Ctrl+Z / Ctrl+Y) funktioniert lückenlos.
- **K6:** JSON-Import und -Export bleiben 100 % kompatibel zu früheren Versionen.
