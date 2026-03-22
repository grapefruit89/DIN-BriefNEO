---
id: SPEC-015
title: Triple-Zone Address Field
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: Triple-Zone Address Field


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-UI-TRIPLEZONE]`
- **Source Pattern**: `[PAT-RC-01]` (rucub100)
- **Anti-Pattern Check**: Verhindert ungenaue Positionierung und unklare Adress-Strukturen.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 100 
- **Fulfillment Target**: 100% Strict
- **Rationale**: Die exakte physikalische Aufteilung des Adressfeldes ist entscheidend für die Einhaltung der DIN 5008 Norm.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Strukturierte Adress-Eingabe (P1)
Als Anwender möchte ich eine Adresse eingeben, die exakt in die drei normgerechten Zonen unterteilt ist, damit ich sicher bin, dass alle Angaben (Rücksendung, Vermerk, Anschrift) an der richtigen Stelle stehen.

**Acceptance Scenarios**:
1. **Given** das Adressfeld ist aktiv, **When** ich den DOM untersuche, **Then** sehe ich die Elemente `<rucksendezeile>`, `<vermerkzone>` und `<anschriftzone>`.
2. **Given** die Zonen sind gerendert, **When** ich messe, **Then** ist die Rücksendezeile exakt 5mm hoch.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Semantic Containers**: Das System MUST das Adressfeld (85x45mm) in drei semantische Container unterteilen:
    - `<rucksendezeile>` (Höhe: 5mm)
    - `<vermerkzone>` (Höhe: 12.7mm)
    - `<anschriftzone>` (Höhe: 27.3mm)
- **FR-002: Direct-In-Place Editing**: Jede dieser Zonen MUST direkt auf dem Papier via `contenteditable` editierbar sein (WYSIWYG).
- **FR-003: Zone Guarding**: Das System MUST sicherstellen, dass Text aus einer Zone nicht physikalisch in die nächste "fließt" (Overflow Hidden pro Zone).

## Success Criteria *(mandatory)*

- **SC-001**: **Millimeter Accuracy**: Die Summe der drei Zonen (5 + 12.7 + 27.3) ergibt exakt 45mm.
- **SC-002**: **HTML Clarity**: Die Bezeichner der HTML-Elemente müssen exakt der DIN-Terminologie entsprechen.

`n`n---`n`n# ?? CSS-First Synchronicity Addendum`n`n- **FR-004: Variable-Driven Vertical Position**: Die vertikale Position des gesamten Adress-Containers MUST strikt an die CSS-Variable `--header-height` gebunden sein (definiert in SPEC-044).`n- **FR-005: Zero-JS Movement**: Das Verschieben des Empfängers beim Wechsel von Form A zu B darf NICHT durch JavaScript-Berechnungen erfolgen, sondern MUST rein durch die Kaskadierung der CSS-Variablen ausgelöst werden.`n- **Rationale**: Stellt sicher, dass Empfänger und Faltmarken immer perfekt synchron wandern.
