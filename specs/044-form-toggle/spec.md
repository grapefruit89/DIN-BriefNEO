---
id: SPEC-044
title: Form A/B Dynamic Toggle
tags: [specification, din-5008, platin]
status: cemented
weight: 90
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Form A/B Dynamic Toggle


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-UI-TOGGLE]`
- **Principle Check**: **V. USER SOVEREIGNTY**: Immediate feedback on layout change.
- **Visual Goal**: Clear distinction between Form A (27mm) and Form B (45mm).

---

## ?? Requirements *(mandatory)*

### FR-001: The Sliding Toggle (Schiebeschalter)
- **Was**: Die Auswahl zwischen Form A und B erfolgt nicht ber Radio-Buttons, sondern ber einen modernen, visuellen Schiebeschalter.
- **UI Design**: 
    - Links: Label "Form A"
    - Rechts: Label "Form B"
    - Ein aktiver "Slider" (Daumen), der sanft zwischen beiden Positionen gleitet.
- **Feedback**: Der aktive Zustand MUST durch eine Primrfarbe (z.B. Blau) und Fettschrift des entsprechenden Labels deutlich hervorgehoben werden.

### FR-002: Dynamic Layout Transition
- **Logik**: Bei Betaetigung des Schalters MUST das System alle physikalischen Koordinaten (CMA) instantan anpassen.
- **Visuals**: Das "Papier" im Editor soll die Verschiebung des Anschriftfelds und des Informationsblocks visuell (ggf. mit einer minimalen Animation) widerspiegeln.

### FR-003: Persistence
- **Logik**: Die gewaehlte Form (A oder B) MUST im `localStorage` gespeichert werden, damit beim nchsten Start die bevorzugte Vorlage geladen wird.

## Success Criteria *(mandatory)*
- **SC-001**: **Clarity**: Ein Nutzer erkennt in < 200ms auf den ersten Blick, welche Form (A oder B) gerade aktiv ist.
- **SC-002**: **Aviation Accuracy**: Die Umschaltung landet auf beiden Seiten exakt auf den Mikrometer-Werten der SVG-Referenz (27mm vs 45mm).

`n`n---`n`n# ?? Synchronous Layout Logic Addendum (from CSS-First)`n`n- **FR-004: CSS-Variable Layout Control**: Das gesamte Layout (Anschrift + Faltmarken) MUST ber zentrale CSS-Variablen auf dem Root-Element (`<body>` oder `.paper`) gesteuert werden.`n    - Form A: `--header-height: 27mm; --fold-1: 87mm; --fold-2: 192mm;` `n    - Form B: `--header-height: 45mm; --fold-1: 105mm; --fold-2: 210mm;` `n- **FR-005: Atomic Switch**: Ein einziger Attribut-Wechsel am Body (`data-form="A"`) MUST durch Kaskadierung alle abhängigen Elemente (Anschriftfeld, Informationsblock, SVG-Faltmarken) simultan und perfekt synchron verschieben.`n- **FR-006: SVG-Anchoring**: Die Faltmarken (SPEC-002) MUST via `top: var(--fold-1)` absolut zum Blatt positioniert werden, damit sie immer im perfekten DIN-Verhältnis zum Rest des Briefes bleiben.
`n- **FR-007: Mandatory Synchronicity**: Das System MUST garantieren, dass die CSS-Variable `--header-height` sowohl die `top`-Eigenschaft des Anschriftfeldes als auch die relative Position der Faltmarken steuert. Ein "Auseinanderdriften" dieser Elemente ist technisch unmöglich.

- **?? JS-ELIMINATION**: Das manuelle Verschieben von DOM-Elementen via JavaScript-Styles ist für den Layout-Wechsel VERBOTEN. Alles erfolgt rein über CSS-Kaskadierung und Variablen-Switch am Root-Element.
