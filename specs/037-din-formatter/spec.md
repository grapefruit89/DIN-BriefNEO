---
id: SPEC-037
title: DIN-Logic Formatter (Aviation Grade)
tags: [specification, din-5008, platin]
status: cemented
weight: 90
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: DIN-Logic Formatter (Aviation Grade)


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-LOGIC-FORMAT]`
- **Lexicon Check**: "Adaptive Visual Gap", "Durchwahl", "ISO-Datum", "Ortsnetzkennzahl".
- **Principle Check**: **V. USER SOVEREIGNTY**: The formatter MUST NOT destroy user input but "beautify" it.

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 90 
- **Fulfillment Target**: 100% (Norm-Konformitt)
- **Rationale**: Ein Platinum-Briefgenerator muss sicherstellen, dass Zahlen und Daten den hchsten professionellen Standards entsprechen.

---

## Requirements *(mandatory)*

### FR-001: Adaptive Visual Gap (Telephone)
- **Was**: Ersetzung des physischen Leerzeichens zwischen Vorwahl und Rufnummer durch einen visuellen Abstand.
- **Logik**: Das System MUST einen `<span>` mit einem `margin-right` (entsprechend ca. einem halben Leerzeichen) zwischen Vorwahl und Nummer einfgen.
- **Clipboard-Safety**: Der `<span>` MUST so konfiguriert sein, dass beim Kopieren (Copy-Paste) KEIN Leerzeichen im Clipboard landet (reiner Zahlen-String).
- **Heuristic**: Das System MUST versuchen, die Vorwahl (3-5 Stellen beginnend mit 0) automatisch zu erkennen. Falls uneindeutig, bleibt die manuelle Trennung des Nutzers gewahrt.

### FR-002: Extension Handling (Durchwahl)
- **Was**: Anschluss von Durchwahlnummern.
- **Logik**: Durchwahlnummern MUST mit einem Bindestrich `-` ohne Leerzeichen an die Hauptnummer angehngt werden (Beispiel: `030 123456-78`).

### FR-003: IBAN Beautifier
- **Was**: Formatierung der IBAN in Viererblcken.
- **Logik**: Das System MUST die IBAN visuell in Blcke unterteilen, wobei das Clipboard-Inhalt-Prinzip (keine Leerzeichen beim Kopieren) ebenfalls angewendet wird.

### FR-004: Date Autopilot
- **Was**: Normgerechte Wandlung von Datumsangaben.
- **Logik**: Eingaben wie "19 3 26" MUST automatisch in `19.03.2026` oder (optional einstellbar) in das ISO-Format `2026-03-19` umgewandelt werden.

## Success Criteria *(mandatory)*

- **SC-001**: **Clipboard Purity**: Kopierte Telefonnummern aus NEO enthalten in 100% der Flle keine strenden Leerzeichen im Zielsystem (z.B. Telefonie-App).
- **SC-002**: **Optical Precision**: Der visuelle Abstand im Brief entspricht exakt dem DIN-Schriftbild (ca. 0.25em bis 0.5em).
- **SC-003**: **Zero Data Corruption**: Die Formatierung darf niemals Zahlenwerte verndern oder lschen.
`n`n---`n`n# ??? Guardrail Addendum: DIN-Compliance Toasts`n`n- **FR-005: Compliance Toast Warning**: Das System MUST beim Tippen von nicht DIN-konformen Zeichen (z.B. Klammern in Telefonnummern) eine Toast-Nachricht anzeigen.`n- **Toast Message**: "Hinweis: Klammern sind laut DIN 5008 in Rufnummern nicht mehr vorgesehen."`n- **FR-006: User Choice (Guardrail Toggle)**: Beim ersten Erscheinen des Toasts MUST der Nutzer gefragt werden:`n    - [A] "Strikt einhalten (Automatisch korrigieren)"`n    - [B] "Trotzdem zulassen (Ignorieren)"`n- **FR-007: Preference Persistence**: Die Entscheidung MUST im `localStorage` gespeichert werden und ist jederzeit in den Einstellungen änderbar.
`n`n---`n`n# ?? Time Formatting Addendum (from Wikipedia)`n`n- **FR-008: DIN-Time Pattern (Germany/Austria)**: `n    - Das System MUST Uhrzeiten im Format `HH:MM` oder `HH:MM:SS` (Doppelpunkt-Trennung) formatieren.`n    - **Leading Zero Logic**: Bei alleiniger Stundenangabe KEINE führende Null (z.B. "9 Uhr"). Bei Minutenangabe PFLICHT zur führenden Null (z.B. "09:31 Uhr").`n    - **Space Guard**: Zwischen Zahl und "Uhr" MUST ein geschütztes Leerzeichen (`&nbsp;`) stehen.`n- **FR-009: Swiss-Time Pattern**: `n    - Falls Land = Schweiz, MUST ein Punkt als Trenner verwendet werden (z.B. "15.00 Uhr").`n- **FR-010: Period Consistency**: In Zeiträumen MUST der Detailgrad auf beiden Seiten gleich sein (z.B. "09:00–11:30 Uhr" statt "9–11:30 Uhr").

