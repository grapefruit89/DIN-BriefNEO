---
id: SPEC-046
title: Digital Postage Overlay (Internetmarke)
tags: [specification, din-5008, platin]
status: cemented
weight: 70
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Digital Postage Overlay (Internetmarke)


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-POSTAGE]`
- **Requirement**: Integration eines Asset-Layers fr digitale Briefmarken innerhalb der Vermerkzone.
- **Rationale**: Ermglicht den Direktdruck von frankierten Briefen fr Fensterumschlge.

---

## ?? Requirements *(mandatory)*

### FR-001: Postage Dropzone (Anschriftfeld)
- **Was**: Ein dedizierter Bereich innerhalb der **Zusatz- und Vermerkzone** (obere 17,7 mm des 45x85mm Fensters).
- **Position**: Die Marke MUST rechtsbndig innerhalb dieser Zone platziert werden, um nicht mit der Rcksendezeile (linksbndig) zu kollidieren.

### FR-002: Asset Upload & Transformation
- **Was**: Upload-Funktion fr Internetmarken-Dateien (PDF oder PNG).
- **Logik**: Das System MUST den DataMatrix-Code und den Preis-Block aus dem Asset extrahieren oder das Asset passgenau skalieren und im definierten Bereich einblenden.

### FR-003: Integrated Address Mode (Kombidruck)
- **Was**: Unterstützung fr Internetmarken, die bereits die Empfngeradresse enthalten.
- **Logik**: Falls aktiv, MUST die normale Adress-Anzeige von NEO in der Anschriftzone ausgeblendet werden, um Dopplungen zu vermeiden.

### FR-004: Visual Guard
- **Was**: Warnung bei Grenberschreitung.
- **Logik**: Falls die hochgeladene Marke grer als 17,7 mm ist, MUST ein Toast ("Asset zu gro fr Fenster") ausgegeben werden.

## Success Criteria *(mandatory)*
- **SC-001**: **Post-Check**: Die gedruckte Internetmarke ist durch die Post-Scanner (DL-Fensterumschlag) lesbar.
- **SC-002**: **No Overlap**: Die Internetmarke verdeckt niemals die Rcksendeangabe (links).
`n`n---`n`n# ??? Safety & API Addendum: The "Dead Man Switch"`n`n- **FR-005: The Arming Switch (Sicherheitsschalter)**: `n    - Das System MUST einen expliziten Schalter "Frankierung scharf schalten" besitzen.`n    - Nur wenn dieser Schalter aktiv ist, darf der Button "Marke kostenpflichtig erzeugen" eingeblendet werden.`n- **FR-006: Double-Confirmation Flow**: Vor jedem API-Call zum Kauf einer Marke MUST ein Bestätigungs-Dialog erscheinen: "Achtung: Es werden jetzt [Betrag] € von Ihrer Portokasse abgebucht. Fortfahren?"`n- **FR-007: Visual Indicator (Armed State)**: Solange die Frankierung "scharf" ist, MUST ein auffälliger Warn-Rahmen oder ein Icon in der Sidebar erscheinen, um versehentliche Käufe beim normalen Test-Druck zu verhindern.`n- **FR-008: Private Key Model**: Das System nutzt das "Aviation-Grade Privacy Model": Der Nutzer trägt seine *eigene* Client-ID und Secret in den NEO-Einstellungen ein. NEO agiert nur als lokaler Vermittler (keine zentrale Registrierung durch den Entwickler nötig).

