---
scope: LOCAL — specify/ & plans/
version: 1.0.0
updated: 2026-03-20
parent: /GEMINI.md
see-also: specs/GEMINI.md (gleiche Regeln, lese beide)
---

# GEMINI.md — specify/ & plans/ (SDD-Ausgaben)

Diese Ordner enthalten die destillierten Ausgaben des Knowledge Shredders.
Vollstaendige Regeln: siehe `specs/GEMINI.md`.

## Kurzregel
- `specify/` → nur WHAT (Fachlogik, keine Technik)
- `plans/`   → nur HOW (Technik, kein Fachwissen)
- Beide Ordner setzen eine cemented spec/ voraus.

## Sofort-Check vor jeder Aenderung
1. Existiert eine Original-Spec in `/specs/[id]/spec.md`?
2. Hat der Plan-Status `cemented`? (sonst: erst planEN, dann coden)
3. Ist der Metadaten-Header vollstaendig? (id, version, traceability)

Detaillierte Regeln, Qualitaets-Gates und Cemetery:
→ `specs/GEMINI.md` lesen.
