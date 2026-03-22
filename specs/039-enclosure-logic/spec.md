---
id: SPEC-039
title: Enclosure & Distribution Logic
tags: [specification, din-5008, platin]
status: cemented
weight: 80
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Enclosure & Distribution Logic


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-ENCL]`
- **Requirement**: FR-001: Das Wort **Anlage(n)** MUST fett gedruckt sein.
- **Requirement**: FR-002: Beginn exakt 3 Leerzeilen unter der Grußformel oder Unterschrift.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 80 
- **Rationale**: Korrekte Abstände am Briefende sind ein oft übersehenes DIN-Detail.

---

## Requirements *(mandatory)*

### FR-001: Dynamic Vertical Spacing
- **Logik**: Das System MUST den Abstand zu den Anlagen dynamisch berechnen:
    - Ohne Unterschrift-Asset: 3 Leerzeilen nach der Grußformel.
    - Mit Unterschrift-Asset (SPEC-024): 3 Leerzeilen nach der grafischen Unterschrift.
- **Constraint**: Der Abstand MUST exakt dem Hard-Grid (12pt Schritte) entsprechen.

### FR-002: Multi-Column Layout
- **Was**: Behandlung von vielen Anlagen bei Platzmangel.
- **Logik**: Falls die Anlagenliste die Seite sprengen würde (Zero-Scroll Policy), MUST das System die Liste zweispaltig formatieren.

### FR-003: Distribution List (Verteiler)
- **Was**: "Kopie an"-Vermerk.
- **Logik**: Der Verteiler MUST unter den Anlagen erscheinen (Abstand: 1 Leerzeile).

## Success Criteria *(mandatory)*
- **SC-001**: **The 3-Line Rule**: In der Druckvorschau liegen zwischen dem Namen des Unterzeichners und dem Wort "Anlage" exakt 3 leere Zeilenbereiche.
`n`n---`n`n# ?? Duplex Hardening Addendum (from Phoenix4815)`n`n- **FR-004: Duplex-Aware Enclosures**: Das System MUST eine Option "Duplex-Sicherer Druck" bereitstellen.`n- **Logik**: Falls aktiv, MUST das System beim Druck/Export sicherstellen, dass jeder Anhang (falls mehrere PDFs kombiniert werden) auf einer ungeraden Seitenzahl (Vorderseite) beginnt.`n- **Technik**: Automatisches Einfügen einer Vakatseite (Leerseite), falls das vorherige Dokument auf einer ungeraden Seite endet.`n- **Rationale**: Verhindert, dass die erste Seite eines Anhangs auf der Rückseite des Briefes oder eines anderen Anhangs gedruckt wird.

