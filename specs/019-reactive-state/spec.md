---
id: SPEC-019
title: Reactive State Authority
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: Reactive State Authority


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-PROXY]`
- **Source Pattern**: `[PAT-CL-01]` (Claude Proxy) & `[PAT-CL-02]` (Cursor-Safety).
- **Principle Check**: **II. HYBRID ARCHITECTURE**: Pure JS Proxy as the central authority.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 100 
- **Fulfillment Target**: 100% (Strict)
- **Rationale**: Das technische Herzstück. Ohne reaktiven State funktioniert kein Auto-Save, kein Undo und kein intelligenter Briefkopf.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatische UI-Updates (P1)
Als Entwickler/Anwender möchte ich, dass sich die UI (z.B. der Briefkopf) sofort ändert, wenn ich Daten im Profil ändere, ohne manuelle DOM-Befehle zu schreiben.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Proxy Authority**: Das System MUST alle Zustandsänderungen über ein natives ES6 `Proxy`-Objekt abwickeln.
- **FR-002: Cursor-Safety Contract**: Das System MUST UI-Updates für das gerade fokussierte Element (`activeElement`) überspringen, um Cursor-Sprünge beim Tippen zu verhindern.
- **FR-003: Deep Watch**: Der Proxy MUST verschachtelte Objekte (z.B. `content.recipient.name`) zuverlässig überwachen.
- **FR-004: Undo-Hook**: Jede State-Änderung MUST automatisch einen Snapshot in der History (SPEC-012) auslösen.

## Success Criteria *(mandatory)*

- **SC-001**: **No Manual DOM Sync**: Es darf keine Funktion im Code geben, die manuell `element.innerText = ...` aufruft, außer dem zentralen State-Listener.
- **SC-002**: **Cursor Stability**: Während des Tippens darf der Cursor NIEMALS an den Anfang oder das Ende des Feldes springen (100% Stabilität).

