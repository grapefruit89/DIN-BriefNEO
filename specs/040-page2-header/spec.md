---
id: SPEC-040
title: Folgeseiten-Kopf (Page 2+ Header)
tags: [specification, din-5008, platin]
status: cemented
weight: 85
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Folgeseiten-Kopf (Page 2+ Header)


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-PAGE2]`
- **Requirement**: Automatische Generierung der Kurz-Referenz ab der zweiten Seite.
- **Rationale**: Sicherstellung des Kontextes bei mehrseitigen Dokumenten (Anti-Verlust-Schutz).

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 85 
- **Rationale**: Ein professioneller Brief-Generator darf den Empfnger auf Folgeseiten niemals "im Dunkeln" lassen.

---

## Requirements *(mandatory)*

### FR-001: Automatic Header Generation
- **Was**: Sobald der Brief eine zweite Seite (SPEC-033) erzeugt, MUST oben auf dieser Seite ein Kopfbereich erscheinen.
- **Position**: Der Kopf beginnt bei **20 mm** von der oberen Blattkante (analog zum linken Rand).

### FR-002: Kurz-Referenz Content
- **Was**: Der Inhalt der Kopfzeile auf Folgeseiten.
- **Zusammensetzung**: Das System MUST folgende Daten in einer Zeile (getrennt durch Pipe `|` oder Mittelpunkt `·`) anzeigen:
    - **Empfnger**: "An: [Name des Empfngers]"
    - **Datum**: "vom [Datum des Briefes]"
    - **Paginierung**: "Seite [X] von [Y]" (z.B. "Seite 2 von 3")

### FR-003: Visual Styling
- **Schrift**: 9pt bis 10pt (etwas kleiner als der Haupttext, um sich abzuheben).
- **Separator**: Optionaler dezenter horizontaler Strich (0.25pt) unter der Kurz-Referenz zur visuellen Trennung vom Folgetext.

### FR-004: Text-Start Offset
- **Logik**: Der eigentliche Brieftext auf Folgeseiten MUST erst nach einem definierten Abstand (z.B. bei **35 mm** bis **40 mm**) beginnen, um Platz fr den Kopf zu lassen.

## Success Criteria *(mandatory)*
- **SC-001**: **Multi-Page Context**: Auf jeder gedruckten Folgeseite ist sofort ersichtlich, zu welchem Vorgang das Blatt gehrt.
- **SC-002**: **Aviation Precision**: Die Paginierung "X von Y" ist auf jeder Seite (inklusive Seite 1, falls > 1) in Echtzeit korrekt berechnet.

`n`n---`n`n# ?? Document Factory Addendum (from WeasyPrint)`n`n- **FR-005: CSS-Native Pagination**: Das System MUST `counter(page)` und `counter(pages)` im CSS nutzen, um die Seitenzahlen ("X von Y") rein über die Print-Engine des Browsers zu generieren.`n- **FR-006: Running Headers**: Falls technisch möglich (via `@page`), MUST die Kopfzeile der Folgeseiten als "Running Element" definiert werden, um absolute Layout-Stabilität zu garantieren.
