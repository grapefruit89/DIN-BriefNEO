---
id: SPEC-005
title: Base64 Asset Persistence
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Base64 Asset Persistence

**Pattern Source**: `[PAT-NK-02]` (Niekes/brief)

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-ASSET]`
- **Lexicon Check**: "Base64", "Asset", "Logo", "Persistenz".
- **Principle Check**: **VII. OFFLINE SOVEREIGNTY**: All assets MUST be local. **IX. SAFETY**: Credential masking does not apply here, but data size limits do.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Eigenes Logo hochladen (Priority: P1)
Als Anwender möchte ich mein Firmenlogo hochladen können, damit es im Briefkopf erscheint.

**Why this priority**: Individualisierung ist ein Hauptgrund für die Nutzung eines Briefgenerators.

**Independent Test**: Bilddatei (.png/.jpg) über "Logo wählen" selektieren -> Prüfung, ob das Bild im Briefkopf gerendert wird.

### User Story 2 - Offline-Verfügbarkeit des Logos (Priority: P1)
Als Anwender möchte ich, dass mein hochgeladenes Logo auch dann vorhanden ist, wenn ich die Seite neu lade oder offline bin.

**Why this priority**: Verhindert kaputte Bilder ("Broken Images") und wahrt die **OFFLINE SOVEREIGNTY**.

**Independent Test**: Logo hochladen -> Browser-Tab schließen -> Internetverbindung trennen -> Seite öffnen -> Prüfung, ob das Logo sofort wieder sichtbar ist.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Das System MUST einen Datei-Upload für Bilder (JPG, PNG, SVG) anbieten.
- **FR-002**: Das System MUST das Bild beim Upload sofort in einen **Base64-String** konvertieren.
- **FR-003**: Der Base64-String MUST im `StateManager` (Profile-Bereich) gespeichert werden.
- **FR-004**: Das System MUST eine Größenbeschränkung für Logos erzwingen (z.B. max. 500KB), um den LocalStorage nicht zu überlasten.
- **FR-005**: Das System MUST eine Option zum Entfernen/Löschen des aktuellen Logos bieten.

### Data Schema (Ghost Data)
- **Field**: `profile.logoData` | **Type**: `String` | **UI**: Hidden (Base64) | **Description**: Der komplette Bildinhalt als Text-String.

## Success Criteria *(mandatory)*

- **SC-001**: **No External Links**: Es dürfen NIEMALS `http://` Links für Benutzer-Assets im State landen.
- **SC-002**: **Print Accuracy**: Das Logo muss in der Druckvorschau (`window.print()`) in der Originalauflösung (innerhalb der Base64-Grenzen) erscheinen.
- **SC-003**: **Instant Load**: Das Logo muss beim Laden der Seite ohne Verzögerung ( < 10ms ) aus dem LocalStorage gerendert werden.

