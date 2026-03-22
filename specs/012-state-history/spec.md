---
id: SPEC-012
title: Git-Inspired State History
tags: [specification, din-5008, platin]
status: cemented
weight: 80
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Git-Inspired State History


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-HISTORY]`
- **Anti-Pattern Check**: Ersetzt einfaches "60-Schritte-Limit" durch eine robustere Architektur.
- **Principle Check**: **IV. VANILLA PURITY**: Implementierung ohne externe Diff-Libraries.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 80 
- **Fulfillment Target**: Strict (Kein Einfrieren bei großen Historien)
- **Rationale**: Ein exzellentes Undo/Redo System ist das Sicherheitsnetz für kreatives Schreiben.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tiefes Undo (P1)
Als Anwender möchte ich auch nach hunderten Änderungen (z.B. komplettes Umformulieren eines Absatzes) noch zu einem sehr frühen Zustand zurückkehren können.

**Independent Test**: 200 Wörter einzeln tippen -> 200x Undo drücken -> Prüfung: Ist das Dokument wieder leer?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: High-Capacity Buffer**: Das System MUST mindestens **200 Snapshots** des gesamten Zustands (Content + Config) vorhalten.
- **FR-002: Snapshot Logic**: Ein Snapshot wird bei "signifikanten" Änderungen (z.B. Wortende, Paste, Stil-Wechsel) erstellt, nicht bei jedem einzelnen Buchstaben (Debouncing).
- **FR-003: Session-Persistence**: Der History-Stack MUST im `SessionStorage` abgelegt werden.
    - **Vorteil**: Er belastet nicht den permanenten `LocalStorage`, bleibt aber bei einem Seiten-Reload (F5) erhalten.
- **FR-004: Memory Management**: Bei Überschreiten des Limits (z.B. 200) MUST der älteste Snapshot gelöscht werden (Circular Buffer).

### Data Schema (Ghost Data)
- **Field**: `history.undoStack` | **Type**: `Array` | **Storage**: SessionStorage | **Description**: Liste der State-Objekte.

## Success Criteria *(mandatory)*

- **SC-001**: **No Lag**: Das Erstellen eines Snapshots darf niemals zu einem spürbaren Ruckeln beim Tippen führen.
- **SC-002**: **Reload-Safety**: Nach einem Druck auf F5 muss das Undo/Redo Gedächtnis innerhalb derselben Sitzung vollständig erhalten bleiben.

