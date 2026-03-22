---
id: SPEC-009
title: Ghost Templates (CSS-Based)
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: Ghost Templates (CSS-Based)


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-UI-GHOST]`
- **Anti-Pattern Check**: Verhindert aktiv das Einbrennen von Hilfstexten in das PDF (Anti-Pattern: Pixel-Müll oder hartkodierte Strings).
- **Vanilla-Check**: Rein CSS-basierte Lösung ohne JS-Loop für das Ein/Ausblenden.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 100 
- **Fulfillment Target**: Strict (100% unsichtbar beim Druck)
- **Rationale**: Benutzerführung ohne Beeinträchtigung des physischen Briefes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Intuitive Führung (P1)
Als Anwender möchte ich in leeren Feldern (z.B. Betreff) sehen, was ich dort eingeben soll, ohne dass der Text ein physischer Teil des Inhalts ist.

**Acceptance Scenarios**:
1. **Given** ein Feld ist leer, **When** es nicht fokussiert ist, **Then** erscheint der Text aus `data-placeholder` in hellem Grau.
2. **Given** ein Feld hat Inhalt, **When** ich tippe, **Then** verschwindet der Platzhalter sofort.

### User Story 2 - Sauberer Druck (P1)
Als Anwender möchte ich sicher sein, dass Platzhalter NIEMALS auf dem gedruckten Brief erscheinen.

**Independent Test**: Leeren Brief mit allen Platzhaltern in die Druckvorschau laden -> Prüfung: Das Blatt muss absolut leer sein.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Das System MUST das HTML-Attribut `data-placeholder` für alle `contenteditable` Felder unterstützen.
- **FR-002**: Die Anzeige des Platzhalters MUST rein über CSS (Pseudo-Element `::before`) erfolgen.
- **FR-003**: Das System MUST den Platzhalter ausblenden, sobald das Feld fokussiert wird ODER Inhalt enthält.
- **FR-004**: **Global Print Guard**: Das System MUST eine `@media print` Regel enthalten, die alle `::before` Elemente von `data-placeholder` unterdrückt.

## Success Criteria *(mandatory)*

- **SC-001**: **Zero JS Overhead**: Für die reine Anzeige des Platzhalters darf kein JS-Event genutzt werden.
- **SC-002**: **Print Stealth**: In 100% der Druckfälle (PDF/Papier) sind keine Hilfstexte sichtbar.
- **SC-003**: **Optical Harmony**: Die Farbe des Platzhalters muss dem 7pt Soft-Grid Design entsprechen (dezent, aber lesbar).

