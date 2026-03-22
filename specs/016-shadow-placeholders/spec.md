---
id: SPEC-016
title: Realistic Shadow Placeholders (Funny/Random)
tags: [specification, din-5008, platin]
status: cemented
weight: 60
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Realistic Shadow Placeholders (Funny/Random)


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-UI-SHADOW]`
- **Source Pattern**: `[PAT-RC-03]` (rucub100)
- **Principle Check**: **IV. VANILLA PURITY**: Randomizer-Logik ohne externe Bibliotheken.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 60 
- **Fulfillment Target**: 100% (Zufall & Optik)
- **Rationale**: Erhöht die Benutzerfreundlichkeit durch klare Strukturvorgaben und sorgt für eine positive User Experience durch Humor.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Orientierung durch Beispiele (P1)
Als Anwender möchte ich in leeren Feldern sehen, welche Art von Daten dort erwartet wird (z.B. Name, Straße), um den Brief intuitiv auszufüllen.

### User Story 2 - Der "NEO-Geist" (Humor) (P2)
Als Anwender möchte ich ab und zu durch lustige Namen ("Bibo Beutlin", "Harry Potter") überrascht werden, damit die Arbeit mit dem Tool Spaß macht.

**Independent Test**: Seite 5x neu laden -> Prüfung: Jedes Mal müssen andere Beispiel-Namen in den Platzhaltern erscheinen.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Sample Data Pool**: Das System MUST eine Liste von realistischen (aber fiktiven) und humorvollen Beispieldaten für Namen, Straßen und Städte vorhalten.
- **FR-002: Random Assignment**: Bei jedem Initial-Load (wenn kein Entwurf im LocalStorage ist) MUST das System die `data-placeholder` Attribute zufällig aus dem Pool befüllen.
- **FR-003: Diversity**: Der Pool MUST eine Mischung aus Standardnamen (Erika Mustermann) und popkulturellen Anspielungen enthalten.
- **FR-004: Synchronized Shadow**: Straße und Stadt im Platzhalter sollten (sofern möglich) logisch zusammenpassen (z.B. "Winkelgasse" -> "London").

## Success Criteria *(mandatory)*

- **SC-001**: **Variation**: Die Wahrscheinlichkeit, zweimal hintereinander exakt dieselbe Kombination von Platzhaltern zu sehen, muss unter 1% liegen.
- **SC-002**: **Optical Harmony**: Die Platzhalter müssen in einem dezenten Grau erscheinen und beim ersten Tastendruck verschwinden.

