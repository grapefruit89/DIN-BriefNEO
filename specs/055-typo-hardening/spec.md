---
id: SPEC-055
title: Aviation Typography Hardening
tags: [typography, aesthetics, platin]
status: cemented
weight: 85
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Aviation Typography Hardening

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-TYPE-HARDEN]`
- **Requirement**: Implementierung von High-End Typografie-Standards.
- **Rationale**: Ein professioneller Brief muss ein perfektes, lückenloses Schriftbild aufweisen.

---

## ??? Requirements *(mandatory)*

### FR-001: Language-Aware Hyphenation
- **Was**: Automatische Silbentrennung basierend auf der Sprache.
- **Zement**: Das Root-Element MUST `lang="de"` (oder die gewählte Sprache) tragen.
- **CSS**: Der Brieftext MUST `hyphens: auto` nutzen, um "Löcher" im Textfluss bei schmalen Spalten zu vermeiden.

### FR-002: Optimized Justification (Blocksatz)
- **Was**: Harmonisierung von Wortabständen im Blocksatz.
- **Logik**: Das System MUST `text-align: justify` in Kombination mit `text-justify: inter-word` nutzen.
- **Ziel**: Vermeidung von "weißen Straßen" (zu großen Lücken zwischen Wörtern).

### FR-003: Optical Margin Alignment
- **Logik**: Das System MUST sicherstellen, dass Satzzeichen am rechten Rand (Punkte, Kommata) leicht in den Rand ragen dürfen (Optical Kerning), um eine gerade visuelle Linie zu erzeugen.

## Success Criteria *(mandatory)*
- **SC-001**: **Text Harmony**: Der Grauwert des Textes ist über die gesamte Seite hinweg gleichmäßig. Keine auffälligen Lücken durch fehlende Silbentrennung.
