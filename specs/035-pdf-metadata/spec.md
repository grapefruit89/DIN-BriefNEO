---
id: SPEC-035
title: PDF Metadata Autopilot
tags: [specification, din-5008, platin]
status: cemented
weight: 50
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: PDF Metadata Autopilot


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-METADATA]`
- **Requirement**: Automatische Befüllung von PDF-Dokumenteigenschaften.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 50
- **Rationale**: Verbessert die Durchsuchbarkeit und Archivierbarkeit der generierten PDFs.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Property Sync**: Das System MUST beim PDF-Export folgende Eigenschaften setzen:
    - **Titel**: Betreffzeile (bereinigt).
    - **Autor**: Absendername.
    - **Sprache**: Deutsch (de-DE).
    - **Ersteller**: DIN-BriefNEO.
- **FR-002: Automatic Mapping**: Die Daten MUST direkt aus dem `StateManager` (Profile & Content) bezogen werden.

## Success Criteria *(mandatory)*

- **SC-001**: **Archive Integrity**: Beim Öffnen des PDFs in Acrobat oder Vorschau müssen die Metadaten in den Dokumenteigenschaften (STRG+D) korrekt angezeigt werden.

---

# ?? Deep Indexing Addendum: Searchable PDF Metadata

- **FR-003: Deep Searchability Fields**: Das System MUST beim Export folgende Daten in das "Stichwörter" (Keywords) Feld des PDFs schreiben:
    - Empfänger-Name
    - Empfänger-Stadt
    - Dokumenten-Datum
    - Aktenzeichen / Referenz
- **FR-004: Invisible Indexing Layer (Vanilla Fallback)**:
    - Falls technisch möglich (via Print-Engine), MUST ein unsichtbarer Text-Block (opacity: 0) am Seitenende eingefügt werden, der diese Metadaten als reinen Text enthält.
    - Ziel: OS-Indexierung (Spotlight/Windows Search) muss den Brief finden, wenn man nach dem Empfänger sucht, auch wenn dieser Name nicht im Dateinamen steht.
- **FR-005: Privacy Scrubber**: Das System MUST sicherstellen, dass keine hochsensiblen Daten (wie IBAN oder Passwörter) in die Metadaten gelangen.
- **Weighting Update**: Die Suchbarkeit der PDF-Inhalte wird mit 80/100 bewertet.

---

# ?? Machine-Readable Addendum: The DNA-Marker (Anchor)

- **FR-006: The BRIEF-METADATA Anchor**: Das System MUST am Ende des Dokuments einen maschinenlesbaren DNA-Marker einfügen.
    - **Marker-Präfix**: `###BRIEF-METADATA`
    - **Format**: `###BRIEF-METADATA:{"app":"DIN-BriefNEO","ver":"10.0","recipient":"[NAME]","city":"[STADT]","date":"[ISO-DATUM]","subject":"[BETREFF]"}###`
    - **Position**: Am untersten Rand des Blattes, außerhalb des sichtbaren Bereichs (via `opacity: 0`).
- **FR-007: Indexing Catalyst**: Dieser Marker dient als eindeutiger Anker für spezialisierte Such-Tools und Skripte (z.B. PowerShell/Python), um Briefe in Lichtgeschwindigkeit zu identifizieren und zu katalogisieren.
- **FR-008: Dual-Path Logic (Architectural Choice)**: Beide Pfade MUST als gültige Ideen für die Implementierung dokumentiert bleiben:
    - **Pfad A (Profi-Library/jsPDF)**: Daten werden direkt in die offiziellen binären PDF-Metadaten-Felder geschrieben.
    - **Pfad B (Vanilla/Native Print)**: Der unsichtbare DNA-Marker im Text-Layer dient als universeller Lebensretter für die Durchsuchbarkeit.
    - **Entscheidung**: Der endgültige Pfad wird während der Implementierungs-Phase gewählt.

