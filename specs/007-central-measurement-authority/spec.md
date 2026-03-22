---
id: SPEC-007
title: Central Measurement Authority (CMA)
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Central Measurement Authority (CMA)

**Pattern Source**: `[PAT-MM-01]` (metaminded/dinbrief)

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-CMA]`
- **Lexicon Check**: "Wahrheitstabelle", "Konstante", "Millimeter-Präzision", "SSoT".
- **Principle Check**: **I. TRUTH**: The .brain/ rules are implemented via a single constants file. **III. VISUAL FREEZE**: CSS variables are derived from this authority to ensure zero drift.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Zentrale Anpassung der Norm (Priority: P1)
Als Administrator/Entwickler möchte ich alle Maße des Briefes an einem einzigen Ort ändern können, falls sich die DIN-Norm ändert, ohne hunderte CSS-Zeilen oder JS-Funktionen durchsuchen zu müssen.

**Why this priority**: Das Herzstück der "Aviation-Grade" Wartbarkeit.

**Independent Test**: Ändern der Lochmarken-Position in `constants.js` -> Prüfung, ob sowohl die visuelle Markierung (SVG) als auch das Layout-Verhalten im Editor sofort folgen.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Das System MUST eine zentrale JS-Datei (`js/logic/constants.js`) besitzen, die als **Single Source of Truth (SSoT)** für alle physikalischen Maße dient.
- **FR-002**: Die CMA MUST Maße in Millimetern (`mm`) und typografische Werte in Punkt (`pt`) definieren.
- **FR-003**: Alle UI-Komponenten (CSS via CSS-Variables und SVG via JS-Attributes) MUST ihre Werte dynamisch von dieser CMA beziehen.
- **FR-004**: Die CMA MUST zwischen Form A und Form B Maßen unterscheiden (z.B. `ADDR_TOP_A` vs. `ADDR_TOP_B`).
- **FR-005**: Das System MUST sicherstellen, dass keine "Magic Numbers" (hartkodierte Zahlenwerte) außerhalb der CMA existieren.

### Key Entities

- **MeasurementMap**: Das Objekt, das alle DIN-Koordinaten hält.
- **StyleBridge**: Die Logik, die JS-Konstanten in CSS-Variablen injiziert.

## Success Criteria *(mandatory)*

- **SC-001**: **Single-Point-of-Change**: Eine Änderung eines Maßes in der CMA wirkt sich ohne weiteren manuellen Eingriff auf das gesamte System (Editor, Druck, Hilfslinien) aus.
- **SC-002**: **Strict Type Conversion**: Alle mm-Werte werden mit einer Genauigkeit von mindestens 3 Dezimalstellen verarbeitet.
- **SC-003**: **Zero Redundancy**: Es darf kein Maß existieren, das an mehr als einer Stelle im Quellcode definiert ist.
`n`n---`n`n# ?? Hardening Addendum: Exact Coordinate Map`n`n- **FR-006**: Die CMA MUST folgende exakte Werte (Form B) enthalten:`n    - `SENDER_ZONE_TOP`: 27mm`n    - `ADDRESS_TOP`: 45mm`n    - `INFO_BLOCK_TOP`: 97.4mm`n    - `SUBJECT_TOP`: 103.4mm`n    - `FOOTER_TOP`: 269mm`n- **Rationale**: Diese Werte garantieren 100%ige Konformität mit modernen Geschäftsbrief-Standards.
`n`n---`n`n# ?? Validation Addendum: Discrepancy Management`n`n- **FR-007: Conflict Logging**: Das System MUST alle widersprüchlichen Maße in einem "Validation Pool" (`.brain/07_measurement_conflict_log.md`) erfassen.`n- **FR-008: Decision Rationale**: Jede Entscheidung für ein Maß in der CMA MUST begründet sein (z.B. Abgleich gegen Referenzquelle MehrCurry).`n- **Weighting Update**: Die Korrektheit der CMA-Werte gegenüber dem Conflict Log wird mit 100/100 bewertet.

