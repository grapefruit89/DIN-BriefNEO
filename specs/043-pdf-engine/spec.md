---
id: SPEC-043
title: High-Fidelity PDF Engine
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: FUNDAMENTAL
created: 2026-03-20
---
# Feature Specification: High-Fidelity PDF Engine

**Decision**: **Enhanced Native Browser Print**

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-PDF]`
- **Rationale**: jsPDF wurde abgelehnt (veraltet, bricht CSS-Przision, hohe Redundanz). Native Print garantiert 100%ige Deckungsgleichheit zwischen Editor und PDF.

---

## ?? Requirements *(mandatory)*

### FR-001: The "What You See Is What You Get" (WYSIWYG) Mandate
- **Zement**: Das System MUST den browser-eigenen Druckdialog (`window.print()`) nutzen.
- **Vorteil**: Die physikalische Render-Engine von Chrome/Firefox ist jedem JS-PDF-Generator in Bezug auf Typografie und Vektorgrafik (SVG) haushoch berlegen.

### FR-002: Print-UI Pre-Flight
- **Was**: Automatisches Aufrumen des UI vor dem Druck.
- **Logik**: Bei Klick auf "Drucken" MUST das System via CSS (`@media print`) alle Sidebars, Buttons, Grid-Hilfslinien und Platzhalter-Texte (SPEC-013) instantan ausblenden.

### FR-003: Metadata Inception (Title Sync)
- **Logik**: Da Native Print keine binren Metadaten setzen kann, MUST das System das `document.title` Attribut vor dem Aufruf von `print()` auf den Betreff setzen. Browser nutzen den Seitentitel standardmig als Dateinamen beim "Speichern als PDF".

### FR-004: DNA-Marker Inclusion
- **Logik**: Der DNA-Marker (SPEC-035) MUST im Print-Layout enthalten sein (unsichtbar), um die Durchsuchbarkeit der erzeugten PDF-Datei zu garantieren.

## Success Criteria *(mandatory)*
- **SC-001**: **Zero Deviation**: Der Brief im Editor und das PDF sind auf den Mikrometer identisch.
- **SC-002**: **No Bloat**: Keine externe PDF-Library belastet das Projektbundle.

`n`n---`n`n# ??? High-Fidelity Hardening Addendum (from Smashing Magazine)`n`n- **FR-005: @page Physical Boundary**: Das System MUST das `@page` Rule-Set nutzen, um das physikalische Blatt (A4) vom Content-Layer zu isolieren.`n- **FR-006: Color Fidelity Guarantee**: NEO MUST `print-color-adjust: exact !important` setzen, damit Logos und farbige Elemente (SPEC-046) im PDF niemals verblassen.`n- **FR-007: Atomic Zone Break Protection**: Die Zonen Anschrift, Betreff und Signatur MUST mit `break-inside: avoid` markiert werden, um einen Seitenumbruch innerhalb dieser kritischen Blöcke zu verhindern.`n- **Rationale**: Stellt sicher, dass das PDF nicht nur wie der Editor aussieht, sondern auch auf jedem physischen Drucker weltweit die exakt gleichen Ergebnisse liefert.
