---
id: SPEC-027
title: SVG Precision Markers
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
---
# Feature Specification: SVG Precision Markers


## ?? Brain-First Alignment
- **Traceability ID**: `[DIN-UI-MARKERS]`
- **Requirement**: FR-001: Lochmarke bei 148.5mm. FR-002: Faltmarken bei 105mm/210mm (B) oder 87mm/192mm (A).



---

# ? Anchor Positioning Upgrade

- **FR-003: Native Anchor Positioning**: Die Positionierung der Faltmarken MUST via CSS Anchor Positioning API erfolgen.
- **?? JS-ELIMINATION**: Mathematische JavaScript-Berechnungen zur Bestimmung der Marken-Koordinaten sind ERSATZLOS GESTRICHEN. Die Marken werden im CSS direkt an die Blattkanten oder Container-Grenzen 'geankert'.
