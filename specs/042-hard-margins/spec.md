---
id: SPEC-042
title: Hard Margin Transitions
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Hard Margin Transitions


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-UI-BARRIERS]`
- **Requirement**: Schutz der DIN-Zonen gegen gegenseitiges Verschieben.
- **Rationale**: Ein Text in Zone A darf niemals die Position von Zone B verndern.

---

## ?? Requirements *(mandatory)*

### FR-001: Absolute Vertical Anchors
- **Was**: Jede Hauptzone (Absender, Anschrift, Infoblock, Betreff, Text) MUST einen festen vertikalen Startpunkt (Y-Koordinate) besitzen.
- **Technik**: Nutzung von `position: absolute` oder `grid-template-areas` mit fixen Zeilenhhen in Millimetern.

### FR-002: Overflow Containment (The Barrier)
- **Was**: "Physikalische Barriere".
- **Logik**: Wenn der Text innerhalb einer Zone (z.B. Anschriftzone) das Ende des reservierten Bereichs erreicht, MUST er abgeschnitten (`overflow: hidden`) oder auf die nchste Paginierungs-Ebene geschoben werden.
- **Verbot**: Es ist VERBOTEN, dass eine Zone eine nachfolgende Zone nach unten "drckt" (kein relativer Flow zwischen Zonen).

### FR-003: Transition Margins
- **Was**: Die exakten Leerbereiche zwischen Zonen.
- **Zement**: Der Abstand zwischen Adressfenster (Ende bei 90mm) und Betreffzeile (Beginn bei 103.4mm) MUST eine unzerstrbare "Todeszone" von 13.4mm sein, in die kein Text flieen darf.

## Success Criteria *(mandatory)*
- **SC-001**: **Zero Pixel Shift**: Egal wie viel Text in das Adressfeld kopiert wird, die Betreffzeile bleibt exakt auf Millimeter 103.4 stehen.

