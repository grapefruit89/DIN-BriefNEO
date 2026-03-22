---
id: SPEC-001
title: DIN 5008 Layout Baseline
tags: [layout, din-5008, aviation-grade]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-19
traceability: [DIN-LAYOUT-BASE]
---
# Feature Specification: DIN 5008 Layout Baseline


## User Scenarios & Testing *(mandatory)*

### User Story 1 - Exakte Positionierung der Elemente (Priority: P1)
Als Anwender möchte ich, dass alle Elemente (Anschrift, Betreff, Text) exakt an den von der DIN 5008 vorgeschriebenen Positionen sitzen, damit der Brief professionell wirkt und in Fensterumschläge passt.

**Why this priority**: Das ist der Kernzweck der Anwendung. Ohne präzise Positionierung ist das Produkt wertlos.

**Independent Test**: Kann durch Ausmessen der Elemente in der Druckvorschau (PDF) mit einem digitalen Lineal oder Testdruck verifiziert werden.

**Acceptance Scenarios**:
1. **Given** der Editor ist im Modus "Form B", **When** die Seite gerendert wird, **Then** muss das Anschriftenfeld exakt 45mm von der Oberkante entfernt beginnen.
2. **Given** eine Adresse wird eingegeben, **When** der Text die Höhe von 45mm überschreitet, **Then** muss der überstehende Text abgeschnitten werden (Overflow Hidden).

---

### User Story 2 - Umschalten zwischen Form A und Form B (Priority: P2)
Als Anwender möchte ich zwischen den beiden Standard-Layouts (Form A mit kleinem Briefkopf, Form B mit großem Briefkopf) wählen können.

**Why this priority**: Erhöht die Flexibilität für verschiedene Briefbögen.

**Independent Test**: Umschalten des Layout-Parameters und Prüfung der vertikalen Verschiebung der Anschriftzone.

**Acceptance Scenarios**:
1. **Given** das Layout wird auf "Form A" gestellt, **When** die Seite gerendert wird, **Then** muss das Anschriftenfeld bei 27mm von oben beginnen.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Das System MUST ein Blatt im Format A4 (210mm x 297mm) simulieren.
- **FR-002**: Der linke Seitenrand MUST konstant 25mm betragen.
- **FR-003**: Das Anschriftenfeld MUST eine feste Größe von 85mm Breite und 45mm Höhe haben.
- **FR-004**: Das System MUST einen "Hard Constraint" für das Anschriftenfeld erzwingen (kein vertikaler Overflow).
- **FR-005**: Die vertikale Position der Anschriftzone MUST umschaltbar sein: Form A (27mm von oben) und Form B (45mm von oben).
- **FR-006**: Das System MUST Faltmarken bei 105mm und 210mm (von oben) sowie eine Lochmarke bei 148,5mm (Zentrum) optional anzeigen können.

### Key Entities

- **Page**: Das digitale A4-Blatt mit festen Millimeter-Koordinaten.
- **AddressZone**: Ein Container mit den Maßen 85x45mm und striktem Overflow-Schutz.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **Zero Pixel Shift**: Die Positionierung der Zonen darf in modernen Browsern (Chrome/Firefox) um weniger als 0,5mm von der DIN-Vorgabe abweichen.
- **SC-002**: **Window Fit**: In 100% der Testfälle muss die Adresse in einem Standard-Fensterumschlag (DL) vollständig sichtbar sein.
- **SC-003**: **No Spillover**: In keinem Fall darf Text aus der 45mm hohen Anschriftzone in darunterliegende Bereiche fließen.
`n`n---`n`n# ??? Hardening Addendum: Absolute Positioning & Weighting`n`n## ?? Brain-First Alignment`n- **Absolute Positioning Doctrine**: Alle Koordinaten beziehen sich zwingend auf die obere linke Ecke (0,0) des Blattes. (Keine relativen Offsets zu variablen Rändern).`n- **Anti-Pattern Check**: Verhindert aktiv [ANTI-001] (Relative Zone Positioning).`n`n## Feature Weighting (Bedeutung)`n- **Importance**: 100/100 (CRITICAL)`n- **Fulfillment Target**: 100% Strict`n- **Rationale**: Die physikalische Korrektheit ist die Daseinsberechtigung von NEO.`n`n## Additional Requirements`n- **FR-007**: Das System MUST alle Koordinaten vom Fixpunkt (0,0) berechnen.`n- **FR-008**: Das WYSIWYG-Layout MUST zu 100% mit dem finalen Druckergebnis übereinstimmen.
`n`n---`n`n# ?? Validation Addendum: Agent-Grade Precision (MehrCurry)`n`n## ?? Triple-Validated Measurements`n- **Top Margin**: 27mm (Absenderzone).`n- **Information Block**: 97.4mm.`n- **Subject Line**: 103.4mm.`n- **Footer**: 269mm.`n- **Verification**: Diese Werte wurden gegen MehrCurry/briefversand abgeglichen und sind ab sofort als "Aviation Grade" zementiert.

