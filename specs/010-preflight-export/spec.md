---
id: SPEC-010
title: Pre-Flight Export Engine
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: Pre-Flight Export Engine


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-PREFLIGHT]`
- **Anti-Pattern Check**: Verhindert [ANTI-003] (Pixel-PDF) durch Nutzung der nativen Engine.
- **Principle Check**: **X. DESKTOP FIRST**: Fokus auf perfekte PDF-Dateinamen und Druck-Präzision.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 100 
- **Fulfillment Target**: 100% (Safety First)
- **Rationale**: Ein Brief, der beim Export Fehler aufweist (Überfüllung), ist ein technisches Versagen.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatischer Dateiname (P1)
Als Anwender möchte ich, dass das PDF beim Speichern automatisch nach meinem Betreff benannt wird, damit ich die Datei nicht händisch umbenennen muss.

**Acceptance Scenarios**:
1. **Given** Betreff ist "Rechnung Nr. 123", **When** Drucken gestartet wird, **Then** ist der Dateiname `2026-03-19_Rechnung_Nr._123.pdf`.

### User Story 2 - Adressfeld-Audit (P1)
Als Anwender möchte ich gewarnt werden, wenn meine Adresse so lang ist, dass sie nicht mehr vollständig im Fenster des Briefumschlags sichtbar wäre.

**Independent Test**: Adresse mit 12 Zeilen eingeben -> "Drucken" klicken -> Prüfung: Ein modaler Dialog muss erscheinen: "Warnung: Adressfeld überfüllt!"

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Identity Bridge**:
    - Das System MUST beim Auslösen des Druckbefehls den `document.title` temporär auf `[DATUM]_[BETREFF]` setzen.
    - Nach Schließen des Druckdialogs MUST der Titel auf den Originalwert zurückgesetzt werden.
- **FR-002: Overflow Audit**:
    - Das System MUST vor dem Druck prüfen, ob ein visueller Overflow in der `AddressZone` (85x45mm) vorliegt.
    - Bei Überfüllung MUST eine Warnung ausgegeben werden, der Druckvorgang darf jedoch auf expliziten Wunsch des Nutzers fortgesetzt werden.
- **FR-003: UI-Cleanup**:
    - Die Engine MUST sicherstellen, dass alle Sidebars und Editor-Hilfen (außer den Falzmarken) vor dem Druck auf `display: none` stehen (via CSS).

## Success Criteria *(mandatory)*

- **SC-001**: **Accuracy**: Der vorgeschlagene Dateiname enthält keine ungültigen Zeichen (Sonderzeichen-Mapping).
- **SC-002**: **Reliability**: Die Überfüllungs-Warnung muss bei exakt 45,1mm Inhalt zuverlässig auslösen.
- **SC-003**: **Zero-Lag**: Der Pre-Flight-Check darf die Zeit bis zum Öffnen des Druckdialogs um maximal 100ms verzögern.
`n`n---`n`n# ?? UI Addendum: Toast Notifications`n`n- **FR-004: Short-Lived Toasts**: Warnungen (wie der Adress-Overflow) MUST als Toast-Nachricht im UI erscheinen.`n- **Toast Duration**: Die Anzeige darf nur sehr kurz (max. 2-3 Sekunden) sein, um den Workflow nicht zu blockieren.`n- **Non-Intrusive**: Toasts dürfen keine Bestätigung erfordern, es sei denn, sie verhindern den Druckvorgang.

