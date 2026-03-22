---
id: SPEC-022
title: Business Reference Suite
tags: [specification, din-5008, platin]
status: cemented
weight: 30
criticality: OPTIONAL
created: 2026-03-20
---
# Feature Specification: Business Reference Suite


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-BIZ]`
- **Source Pattern**: `[PAT-MV-03]` (Business Zones).
- **Comment for Forks**: "This suite is designed to be easily extensible. Add new keys to the LabelMap to support more business fields."

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 30 
- **Fulfillment Target**: 100% (Erweiterbarkeit)
- **Rationale**: Macht NEO für Freiberufler und kleine Firmen nutzbar.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Extended Field Map**: Das System MUST Felder für `Kunden-Nr.`, `Rechnungs-Nr.`, `Ihr Zeichen` und `Unser Zeichen` bereitstellen.
- **FR-002: Dynamic Toggle**: Nicht ausgefüllte Geschäftsfelder MUST im PDF automatisch ausgeblendet werden (via SPEC-013 :empty Logic).
- **FR-003: Label-Decoupling**: Die Bezeichnungen MUST über die Translation-Map (SPEC-008) konfigurierbar sein.

## Success Criteria *(mandatory)*

- **SC-001**: **Clean PDF**: Ein Privatbrief (ohne BIZ-Daten) darf keine leeren Beschriftungen wie "Kunden-Nr: " im PDF anzeigen.
- **SC-002**: **Business Pro**: Alle Geschäftsdaten sind perfekt am 12pt Hard-Grid ausgerichtet.

