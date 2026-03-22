---
id: SPEC-051
title: Document Typography & Content Integrity
tags: [typography, printing, aviation-grade]
status: cemented
weight: 85
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Document Typography & Content Integrity

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-TYPE-INTEGRITY]`
- **Requirement**: Schutz des Schriftbildes gegen logische Zerstörung beim Druck.
- **Rationale**: Ein professioneller Brief darf keine "verlorenen" Zeilen auf Folgeseiten haben.

---

## ??? Requirements *(mandatory)*

### FR-001: Widow & Orphan Guard
- **Was**: Schutz gegen einsame Zeilen am Seitenanfang oder -ende.
- **Logik**: Das System MUST via CSS (`widows: 3; orphans: 3;`) sicherstellen, dass mindestens 3 Zeilen eines Absatzes zusammengehalten werden.
- **Ziel**: Vermeidung von unschönen "Witwen" (einsame Zeile am Seitenanfang) und "Waisen" (einsame Zeile am Seitenende).

### FR-002: Print Link Expansion
- **Was**: Sichtbarkeit von URLs in gedruckten Dokumenten.
- **Logik**: Im Druckmodus MUST das System hinter jedem Link im Brieftext automatisch die Ziel-URL in Klammern einblenden.
- **CSS**: `a::after { content: " (" attr(href) ")"; font-size: 0.9em; }`
- **Ausnahme**: Interne Links (Anker) sind von dieser Regel ausgeschlossen.

### FR-003: Heading-Text Bonding
- **Was**: Verbot von Überschriften am Seitenende.
- **Logik**: Das System MUST `break-after: avoid` auf Betreffzeilen und Zwischenüberschriften anwenden, damit diese niemals ohne nachfolgenden Text am Ende einer Seite stehen.

## Success Criteria *(mandatory)*
- **SC-001**: **Visual Flow**: In 100% der Testfälle mit Seitenumbrüchen bleiben logische Sinneinheiten (Absätze) optisch zusammenhängend.
- **SC-002**: **Functional Print**: Ein Leser des physischen Briefes kann jede verlinkte Webseite manuell über die aufgedruckte URL aufrufen.
`n`n---`n`n# ?? Document Factory Hardening Addendum (from WeasyPrint)`n`n- **FR-004: Native Hyphenation**: Das System MUST `hyphens: auto` in Verbindung mit dem korrekten `lang` Attribut (z.B. `lang="de"`) nutzen.`n- **FR-005: Advanced Justification**: Fließtext MUST mit `text-align: justify` und `text-justify: inter-word` formatiert werden, um ein ruhiges, gedrucktes Schriftbild ohne "Lcher" zu erzeugen.`n- **FR-006: Dynamic Page Counters**: Die Paginierung ("Seite X von Y") MUST bevorzugt via CSS Generated Content (`content: counter(page) " von " counter(pages)`) berechnet werden.`n- **Rationale**: Diese Techniken heben das Schriftbild von einer "Webseite" auf das Niveau einer professionellen "Dokumenten-Fabrik".
