---
id: SPEC-004
title: Text Snippet Manager
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Text Snippet Manager

**Pattern Source**: `[PAT-NK-01]` (Niekes/brief)

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-SNIPPET]`
- **Lexicon Check**: "Textbaustein", "Snippet", "Feld-Kontext", "Persistenz".
- **Principle Check**: **VII. OFFLINE SOVEREIGNTY**: Snippets MUST be stored locally (LocalStorage). **V. USER SOVEREIGNTY**: Loading a snippet MUST be a conscious user action.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Textbaustein speichern (Priority: P1)
Als Anwender möchte ich einen gerade geschriebenen Text (z.B. eine häufig genutzte Adresse) als Baustein speichern, damit ich ihn später mit einem Klick wiederverwenden kann.

**Why this priority**: Kernelement der Produktivitätssteigerung.

**Independent Test**: Text in Adressfeld eingeben -> "Als Snippet speichern" klicken -> Prüfung im LocalStorage, ob der Text unter dem Feld-Namen abgelegt wurde.

### User Story 2 - Textbaustein laden (Priority: P1)
Als Anwender möchte ich aus einer Liste von gespeicherten Bausteinen wählen können, um ein Feld blitzschnell auszufüllen.

**Why this priority**: Reduziert Tipparbeit und Fehlerquote massiv.

**Independent Test**: Klick auf das "Snippet-Icon" eines Feldes -> Auswahl eines Eintrags -> Prüfung, ob das Feld den exakten Text übernimmt.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Das System MUST für jedes `contenteditable` Feld eine Option zum Speichern des aktuellen Inhalts bieten.
- **FR-002**: Das System MUST Snippets **feld-spezifisch** verwalten (ein Adress-Snippet wird nur bei Adressfeldern vorgeschlagen).
- **FR-003**: Das System MUST die Snippets im `LocalStorage` persistieren, um Offline-Verfügbarkeit zu garantieren.
- **FR-004**: Das System MUST eine einfache Verwaltung (Löschen) von vorhandenen Snippets ermöglichen.
- **FR-005**: Das Laden eines Snippets MUST den aktuellen Feldinhalt ersetzen, ABER den `StateManager` korrekt über die Änderung informieren (Cursor-Safety).

### Data Schema (Ghost Data)
- **Field**: `storage.snippets` | **Type**: `Object` | **UI**: Modal/Dropdown | **Description**: Map von Feld-IDs zu Arrays von Text-Strings.

## Success Criteria *(mandatory)*

- **SC-001**: **Context Awareness**: 100% der Snippets werden nur in den dafür vorgesehenen Feldern angezeigt.
- **SC-002**: **Zero Latency**: Die Liste der Snippets muss sofort ( < 50ms ) nach Klick auf das Auswahlmenü erscheinen.
- **SC-003**: **Data Integrity**: Auch nach einem Browser-Neustart müssen alle gespeicherten Snippets ohne Internetverbindung verfügbar sein.

