---
id: SPEC-008
title: Dynamic Information Block & Label Translation Map
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Dynamic Information Block & Label Translation Map

**Pattern Source**: `[PAT-MM-02]` (metaminded/dinbrief)

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-INFOBLOCK]`
- **Lexicon Check**: "Informationsblock", "Label", "Daten-Key", "Translation Map".
- **Principle Check**: **VI. NAMING PARITY**: Key-Names must match the Lexicon. **IV. VANILLA PURITY**: Logic must remain simple JS objects.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dynamische Beschriftung des Infoblocks (Priority: P1)
Als Anwender möchte ich, dass die Beschriftungen im Informationsblock (z.B. "Ihr Zeichen") korrekt angezeigt werden, auch wenn ich das System für einen Fork oder eine andere Sprache vorbereite.

**Why this priority**: Ermöglicht professionelle Geschäftskorrespondenz mit komplexen Bezugszeichen.

**Independent Test**: Ändern des Labels für "oursign" in der Translation-Map von "Unser Zeichen" auf "Unsere Ref." -> Prüfung, ob die Anzeige im Informationsblock sofort wechselt.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Das System MUST eine Translation-Map (`js/logic/labels.js`) besitzen, die technische Keys (z.B. `yoursign`) auf menschlich lesbare Labels (z.B. "Ihr Zeichen") abbildet.
- **FR-002**: Der Informationsblock MUST dynamisch basierend auf dieser Map gerendert werden.
- **FR-003**: Das System MUST Kommentare in der Map bereitstellen, die erklären, wie Fremdsprachen oder alternative Stile (z.B. Englisch: "Your ref.") implementiert werden können.
- **FR-004**: Die Verknüpfung zwischen State-Daten und UI-Label MUST über den technischen Key erfolgen (Decoupling).
- **FR-005**: Das System MUST sicherstellen, dass der Informationsblock die exakten DIN-Abstände (beginnend bei 125mm von links) einhält.

### Key Entities

- **LabelMap**: Das Wörterbuch für den Informationsblock.
- **ReferenceBlock**: Die UI-Komponente, die Labels und Daten zusammenführt.

## Success Criteria *(mandatory)*

- **SC-001**: **Clean Separation**: Es darf KEIN hartkodierter deutscher Text ("Ihr Zeichen", "Datum") direkt in den HTML-Templates des Infoblocks stehen.
- **SC-002**: **Fork-Readiness**: Ein versierter Anwender muss in der Lage sein, die Sprache des Infoblocks durch Bearbeitung einer einzigen JS-Datei zu ändern.
- **SC-003**: **State Integrity**: Das Ändern eines Labels darf NIEMALS die zugrundeliegenden Daten im `StateManager` beeinflussen.

