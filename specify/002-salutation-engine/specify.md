---
id: SPEC-002
title: Salutation Engine & Gender Parsing
tags: [salutation, logic, automation, din-5008, html-hybrid]
status: active
weight: 100
criticality: HIGH
created: 2026-03-19
updated: 2026-03-20
version: 2.0.0
traceability: [DIN-LOGIC-SALUT]
source: DIN 5008:2020-03, DIN 5008 Etikette-Addendum
depends-on: [SPEC-007]
required-by: [SPEC-013, SPEC-022]
---

# Specify: Salutation Engine & Gender Parsing

## Fachbeschreibung

Ein DIN 5008-konformer Brief erfordert eine praezise, normgerechte Anrede.
Das System erkennt aus der Empfaengereingabe das Geschlecht (Praefix) und
generiert automatisch die korrekte Anrede. Manuelle Ueberschreibungen durch
den Nutzer sind immer moeglich und dauerhaft (USER-001 Nutzersouveraenitaet).

---

## Fachliche Anforderungen (WHAT)

### FR-001: Schluesselwort-Erkennung
Das System MUSS das Empfaengerfeld nach diesen Praefixen scannen:
- `Herr` / `Herrn` → Maennlich (m)
- `Frau` → Weiblich (f)
- `Familie` / `Eheleute` → Familie (fam)
- Kein Praefix erkannt → Neutral (n)

### FR-002: Titel-Erkennung
Das System MUSS akademische Titel extrahieren und in der Anrede behalten:
- `Dr.`, `Prof.`, `Prof. Dr.`, `Dipl.-Ing.`, `Mag.`

### FR-003: Nachnamen-Extraktion
Das System MUSS den Nachnamen korrekt isolieren (letztes Wort nach Praefix + Titel).

### FR-004: Manual Override Protection (USER-001)
Sobald ein Nutzer das Anredefeld manuell editiert, MUSS die Automatik
deaktiviert werden. Kennzeichnung via `data-auto="false"` am Feld-Element.
Eine erneute Automatik ist nur nach explizitem Zuruecksetzen aktiv.

### FR-005: Frmlichkeitsstufen (3 Stufen)
Das System MUSS drei Stufen unterstuetzen:
- `formal`: "Sehr geehrter Herr / Sehr geehrte Frau / Sehr geehrte Damen und Herren,"
- `polite`: "Guten Tag, Herr / Guten Tag, Frau / Guten Tag,"
- `casual`:  "Hallo [Vorname] / Hallo zusammen,"

### FR-006: Signatur-Zustze
Das System MUSS Vertretungs-Zustze unterhalb der Unterschrift anbieten:
- `i. A.` (im Auftrag), `i. V.` (in Vollmacht), `ppa.` (Prokura)

### FR-007: Branchen-Grussformeln
Das System MUSS branchenspezifische Grussformeln als Snippets anbieten
(z.B. "Mit sportlichem Gruss", "Glueck auf!", "Mit kollegialen Gruessen").

### FR-008: Punktuation Guard (DIN 5008)
- Kein Komma am Ende der Grussformel (deutsches DIN-Standard).
- Kein Punkt am Ende der Grussformel.
- Beide Faelle MUESSEN als Warnung markiert werden (aria-invalid="true").

### FR-009: 3-Leerzeilen-Regel
Zwischen Grussformel und maschinenschriftlichem Namen MUSS ein Platz von
exakt 3 Leerzeilen (ca. 12.7mm) fuer die handschriftliche Unterschrift
reserviert werden. Dieser Abstand ist ein DIN-Pflichtmass (Aufnahme in CMA).

### Anrede-Matrix (normativ)

| Formality | Gender m                          | Gender f                          | Gender n                         | Gender fam                        |
|-----------|-----------------------------------|-----------------------------------|----------------------------------|-----------------------------------|
| formal    | Sehr geehrter Herr [Titel] [Name] | Sehr geehrte Frau [Titel] [Name]  | Sehr geehrte Damen und Herren    | Sehr geehrte Familie [Name]       |
| polite    | Guten Tag, Herr [Name]            | Guten Tag, Frau [Name]            | Guten Tag                        | Guten Tag, Familie [Name]         |
| casual    | Hallo [Vorname]                   | Hallo [Vorname]                   | Hallo zusammen                   | Hallo Familie [Name]              |

---

## Erfolgskriterien

| ID     | Kriterium                                                             | Messung        |
|--------|-----------------------------------------------------------------------|----------------|
| SC-001 | Erkennung in >= 95% der Standardfaelle korrekt                       | Unit-Test       |
| SC-002 | Manuelle Korrekturen bleiben nach Neurendering erhalten              | Integrationstest|
| SC-003 | Komma/Punkt am Ende der Grussformel → Warnung sichtbar (aria-invalid)| UI-Test         |
| SC-004 | 3-Leerzeilen-Abstand vor Unterschrift exakt 12.7mm                   | Drucktest       |
