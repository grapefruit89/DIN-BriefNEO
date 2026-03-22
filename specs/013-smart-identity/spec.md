---
id: SPEC-013
title: Smart Document Identity
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: Smart Document Identity


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-IDENTITY]`
- **Anti-Pattern Check**: Verhindert unbenannte PDF-Exporte ("Unbenannt.pdf").
- **Principle Check**: **VI. NAMING PARITY**: Synchronisation zwischen Fachinhalt (Betreff) und System-Metadaten (Title).

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 100 
- **Fulfillment Target**: 100% Strict
- **Rationale**: Ein professionelles Dokument muss seine Identität im Dateisystem und im Browser-Tab klar kommunizieren.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Echtzeit-Tab-Synchronisation (P1)
Als Anwender möchte ich, dass der Browsertab sofort anzeigt, woran ich gerade arbeite, damit ich bei vielen offenen Tabs den Überblick behalte.

**Acceptance Scenarios**:
1. **Given** der Brief-Editor ist offen, **When** ich den Betreff auf "Kündigung Fitnessstudio" ändere, **Then** ändert sich der Titel des Browsertabs in Echtzeit auf "Kündigung Fitnessstudio".

### User Story 2 - Perfekter Dateiname beim Export (P1)
Als Anwender möchte ich, dass mein PDF beim Speichern bereits den richtigen Namen hat, ohne dass ich ihn händisch eintippen muss.

**Independent Test**: Betreff "Rechnung 2024-001" eingeben -> Drucken klicken -> Prüfung im Speichern-Dialog: Der vorgeschlagene Dateiname muss "2026-03-19_Rechnung_2024-001.pdf" lauten.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Live Sync**: Das System MUST das `input`-Event des Betreff-Feldes überwachen und den `document.title` aktualisieren.
- **FR-002: Filename Sanitization**: Das System MUST ungültige Dateisystem-Zeichen (z.B. `/ \ : * ? " < > |`) im Titel durch Unterstriche oder Bindestriche ersetzen, bevor der Export ausgelöst wird.
- **FR-003: Date Prefix**: Dem Dateinamen MUST automatisch das aktuelle Datum im ISO-Format (`YYYY-MM-DD`) vorangestellt werden.
- **FR-004: Fallback**: Falls der Betreff leer ist, MUST das System einen Standardwert nutzen (z.B. `YYYY-MM-DD_DIN-Brief.pdf`).

## Success Criteria *(mandatory)*

- **SC-001**: **Instant Feedback**: Die Änderung im Browsertab erfolgt mit einer Verzögerung von < 50ms.
- **SC-002**: **Export Match**: Der vorgeschlagene Name im PDF-Speicherdialog entspricht zu 100% dem bereinigten Betreff.

