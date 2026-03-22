---
id: SPEC-017
title: Bottom-Up Endorsements
tags: [specification, din-5008, platin]
status: cemented
weight: 80
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Bottom-Up Endorsements


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-UI-ENDORSEMENT]`
- **Source Pattern**: `[PAT-RC-02]` (rucub100)
- **Anti-Pattern Check**: Verhindert unprofessionelle Lücken zwischen Vermerk (z.B. Einschreiben) und der eigentlichen Adresse.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 80 
- **Fulfillment Target**: 100% (Visuelle Ausrichtung)
- **Rationale**: Sorgt für ein professionelles Erscheinungsbild, indem Vermerke "bei der Adresse kleben" bleiben.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatische Stapelung nach unten (P1)
Als Anwender möchte ich einen oder mehrere Vermerke (z.B. "Einschreiben", "Persönlich") eingeben, die sich automatisch so ausrichten, dass der letzte Vermerk direkt über der ersten Adresszeile steht.

**Acceptance Scenarios**:
1. **Given** die Vermerkzone ist leer, **When** ich "Einschreiben" eingebe, **Then** steht dieses Wort in der untersten Zeile der Vermerkzone (direkt über der Anschriftzone).
2. **Given** ein Vermerk ist vorhanden, **When** ich einen zweiten Vermerk in einer neuen Zeile hinzufüge, **Then** stapelt sich der neue Vermerk darüber.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Bottom-Up Alignment**: Das Element `<vermerkzone>` MUST den Text am unteren Rand des Containers ausrichten (Flexbox: `justify-content: flex-end` oder ähnliche Mechanismen).
- **FR-002: Line-By-Line Stability**: Jede Zeile in der Vermerkzone MUST die Standard-DIN-Zeilenhöhe (Hard Grid) einhalten.
- **FR-003: Direct WYSIWYG**: Der Anwender editiert direkt in der Zone, während die Logik die Stapelung von unten nach oben sicherstellt.
- **FR-004: Triple-Zone Harmony**: Die Vermerkzone MUST nahtlos an die Anschriftzone anschließen, um den optischen Block zu wahren.

## Success Criteria *(mandatory)*

- **SC-001**: **Zero Gap**: Zwischen dem untersten Vermerk und dem Namen des Empfängers darf keine leere Zeile entstehen (außer vom Nutzer explizit gewünscht).
- **SC-002**: **Constraint Fidelity**: Die Zone darf nicht höher als 12.7mm werden (Hard Constraint).

