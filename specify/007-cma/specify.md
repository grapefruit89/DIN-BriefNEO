---
id: SPEC-007
title: Central Measurement Authority (CMA)
tags: [cma, din-5008, ssot, aviation-grade]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
updated: 2026-03-20
version: 2.0.0
traceability: [DIN-SYS-CMA]
source: DIN 5008:2020-03, MehrCurry/briefversand (triple-validated)
depends-on: []
required-by: [SPEC-001, SPEC-003, SPEC-006, SPEC-027, SPEC-042]
---

# Specify: Central Measurement Authority (CMA)

## Fachbeschreibung: Warum eine "Wahrheitstabelle"?

Ein DIN 5008-Brief hat ~15 physikalische Zonen, jede mit exakt definierten
Millimeter-Koordinaten. Ohne zentrales Masssystem passiert folgendes:

- Der Entwickler schreibt `top: 97mm` direkt in das CSS einer Komponente.
- Eine andere Komponente nutzt `top: 97.5mm` — 0.5mm Drift.
- Im Druck: Adresse und Informationsblock ueberlappen im DL-Umschlag.

Die CMA verhindert das durch eine **Single Source of Truth (SSoT)**:
Jedes Mass existiert exakt einmal. Alle anderen Systemteile referenzieren
diese eine Quelle — niemals eigene Werte.

---

## Fachliche Anforderungen (WHAT — keine Technik)

### Datentabelle: Kanonische DIN 5008-Masse (Aviation Grade)

| ID    | Konstante        | Mass    | Einheit | Quelle            | Form |
|-------|------------------|---------|---------|-------------------|------|
| M-001 | PAGE_WIDTH       | 210.000 | mm      | DIN 5008 §3       | A+B  |
| M-002 | PAGE_HEIGHT      | 297.000 | mm      | DIN 5008 §3       | A+B  |
| M-003 | MARGIN_LEFT      |  25.000 | mm      | DIN 5008 §4.1     | A+B  |
| M-004 | SENDER_ZONE_TOP  |  27.000 | mm      | DIN 5008 §6.1     | A+B  |
| M-005 | ADDRESS_TOP_A    |  27.000 | mm      | DIN 5008 §6.1a    | A    |
| M-006 | ADDRESS_TOP_B    |  45.000 | mm      | DIN 5008 §6.1b    | B    |
| M-007 | ADDRESS_WIDTH    |  85.000 | mm      | DIN 5008 §5.2     | A+B  |
| M-008 | ADDRESS_HEIGHT   |  45.000 | mm      | DIN 5008 §5.2     | A+B  |
| M-009 | INFO_BLOCK_TOP   |  97.400 | mm      | MehrCurry (✓)     | A+B  |
| M-010 | SUBJECT_TOP      | 103.400 | mm      | MehrCurry (✓)     | A+B  |
| M-011 | FOLD_MARK_1      | 105.000 | mm      | DIN 5008 §7       | A+B  |
| M-012 | PUNCH_MARK       | 148.500 | mm      | DIN 5008 §7       | A+B  |
| M-013 | FOLD_MARK_2      | 210.000 | mm      | DIN 5008 §7       | A+B  |
| M-014 | FOOTER_TOP       | 269.000 | mm      | MehrCurry (✓)     | A+B  |
| M-015 | MARGIN_RIGHT     |  20.000 | mm      | DIN 5008 §4.2     | A+B  |

### Funktionale Anforderungen

| ID     | Anforderung                                                                              |
|--------|------------------------------------------------------------------------------------------|
| FR-001 | Die CMA MUSS alle physikalischen Masse an exakt einer Stelle im System definieren        |
| FR-002 | Masse MUESSEN in Millimetern (mm), typografische Werte in Punkt (pt) vorliegen           |
| FR-003 | Alle Systemteile (Layout, Druck, Hilfslinien, Berechnungen) MUESSEN Werte aus CMA nutzen |
| FR-004 | Die CMA MUSS Form A und Form B als separate, benannte Werte unterscheiden                |
| FR-005 | Das System MUSS das Vorhandensein von "Magic Numbers" ausserhalb der CMA verhindern      |
| FR-006 | Praezision MUSS mindestens 3 Dezimalstellen betragen (0.001mm Aufloesung)               |
| FR-007 | Widerspruechliche Masse MUESSEN im `.brain/07_measurement_conflict_log.md` dokumentiert werden |
| FR-008 | Jedes Mass MUSS eine Traceability-Referenz (Quelle) besitzen                            |

### Toleranzgrenzen (Aviation Grade)

| Metrik                            | Grenzwert  | Rationale                      |
|-----------------------------------|------------|--------------------------------|
| Visuelle Abweichung (Screen)      | < 0.5mm    | DL-Umschlag-Toleranz           |
| Druck-Abweichung (PDF)            | < 0.1mm    | Professioneller Druckstandard  |
| Rundungsfehler bei Konvertierung  | < 0.001mm  | 3-Dezimalstellen-Pflicht       |

### Warum duerfen Zonen ihre Masse nicht selbst definieren?

Dies ist ein **fachliches Prinzip**, kein technisches. Eine Zone wie
"Informationsblock" ist fachlich **kein unabhaengiges Objekt** — sie ist
eine **Referenz** auf einen DIN-definierten Bereich des Briefs. Wuerde
die Zone ihr eigenes Mass kennen, entstuende eine zweite "Wahrheit".
Zwei Wahrheiten fuer dasselbe Mass sind strukturell identisch mit einem Fehler.

### Erfolgskriterien

| ID     | Kriterium                                                                 | Messung                 |
|--------|---------------------------------------------------------------------------|-------------------------|
| SC-001 | Single-Point-of-Change: Eine Aenderung in der CMA wirkt systemweit       | Integrationstest        |
| SC-002 | Zero Redundancy: Kein Mass ist doppelt definiert                          | Statische Code-Analyse  |
| SC-003 | Full Traceability: Jedes Mass hat eine Quellenangabe                      | Code-Review             |
| SC-004 | Precision: Alle Werte auf >= 3 Dezimalstellen gespeichert                | Unit-Test               |
