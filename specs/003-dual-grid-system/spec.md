---
id: SPEC-003
title: Dual-Grid-System
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Dual-Grid-System


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-GRID]`
- **Lexicon Check**: "Hard Grid", "Soft Grid", "Resonanz-Punkt", "Falzmarken".
- **Principle Check**: **III. VISUAL FREEZE**: Zero-Pixel-Shift via mathematical alignment.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Harmonische Positionierung (Priority: P1)
Als Anwender möchte ich, dass die DIN-Vorgaben (wie Falzmarken) exakt eingehalten werden, während der Brief gleichzeitig eine optische Ruhe ausstrahlt, die durch ein harmonisches Raster (7pt) erzeugt wird.

**Why this priority**: Das Alleinstellungsmerkmal von NEO - die Verbindung von Ingenieurs-Präzision und Design-Ästhetik.

**Independent Test**: Überlagerung des Dokuments mit einem visuellen 7pt-Grid im Editor. Prüfung, ob alle DIN-Zonen (Hard Grid) auf Vielfachen von 12pt liegen und alle UI-Elemente (Soft Grid) auf Vielfachen von 7pt.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Layer 1 (The Hard Grid - 12pt)**:
    - Das System MUST alle DIN-relevanten Zonen (Anschriftzone, Betreff, Falz- und Lochmarken) an einem 12pt (4,233mm) Raster ausrichten.
    - Die `line-height` im Haupttext MUST exakt 12pt (oder ein Vielfaches davon) betragen.
- **FR-002: Layer 2 (The Soft Grid - 7pt)**:
    - Das System MUST alle nicht-normativen Abstände (Paddings, Sidebar-Abstände, Button-Gaps) an einem 7pt Raster ausrichten.
- **FR-003: Mathematische Resonanz**:
    - Das System MUST sicherstellen, dass sich beide Raster alle 84pt (29,63mm) treffen, um kumulative Rundungsfehler zu vermeiden.
- **FR-004: Visual Baseline Grid**:
    - Der Editor MUST eine zuschaltbare visuelle Hilfe bieten, die das Hard-Grid (DIN-Zeilen) anzeigt.

### Key Entities

- **HardGrid (12pt)**: Die "Schiene" für die Norm-Einhaltung.
- **SoftGrid (7pt)**: Der "Puls" für die visuelle Ästhetik.

## Success Criteria *(mandatory)*

- **SC-001**: **Fold-Mark Precision**: Die Falzmarken (105mm / 210mm) müssen mathematisch exakt auf dem Hard-Grid liegen.
- **SC-002**: **Optical Balance**: Abstände zwischen UI-Elementen dürfen NIEMALS krumme Werte (z.B. 13px oder 5mm) annehmen, sondern müssen immer durch 7pt teilbar sein.
- **SC-003**: **Zero Layout Drift**: Selbst nach 100 Zeilen Text darf das Raster nicht um mehr als 0,1mm von der theoretischen Position abweichen.

