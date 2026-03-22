---
id: SPEC-002
title: Salutation Engine & Gender Parsing
tags: [logic, automation, salutation]
status: draft
weight: 100
criticality: HIGH
created: 2026-03-19
traceability: [DIN-LOGIC-SALUT]
---
# Feature Specification: Salutation Engine & Gender Parsing


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-LOGIC-SALUT]`
- **Lexicon Check**: "Anrede", "Empfngername", "Prfix".
- **Principle Check**: **V. USER SOVEREIGNTY**: Automation NEVER overwrites manual user input.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatische Anrede-Erkennung (Priority: P1)
Als Anwender mchte ich, dass das System automatisch erkennt, ob ich "Herr", "Frau" oder einen Titel eingebe, und mir die passende Anrede generiert, um Zeit zu sparen.

**Acceptance Scenarios**:
1. **Given** Empfngerfeld ist leer, **When** "Frau Erika Mustermann" eingetippt wird, **Then** erscheint in der Anrede "Sehr geehrte Frau Mustermann,".
2. **Given** ein Titel wird erkannt ("Dr. Mller"), **When** [action], **Then** erscheint "Sehr geehrter Herr Dr. Mller," oder "Sehr geehrte Frau Dr. Mller,".

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Das System MUST das Empfngerfeld nach Schlsselwrtern ("Herr", "Frau", "Dr.", "Prof.") scannen.
- **FR-002**: Das System MUST basierend auf dem erkannten Geschlecht (Prfix) die Anrede generieren.
- **FR-003**: Das System MUST den Nachnamen korrekt extrahieren.
- **FR-004**: **Manual Override Protection**: Sobald ein Anwender das Feld "Anrede" manuell editiert, MUST die Automatik deaktiviert werden (`isDirty` Flag).
- **FR-005**: Das System MUST verschiedene "Frmlichkeitsstufen" untersttzen (Frmlich, Hflich, Modern).  

### Data Schema (Ghost Data)
- **Field**: `content.salutationDirty` | **Type**: `Boolean` | **UI**: Hidden | **Description**: Verhindert das berschreiben manueller Eingaben.

## Success Criteria *(mandatory)*

- **SC-001**: **Accuracy**: Erkennung funktioniert in 95% der Standardflle korrekt.
- **SC-002**: **No Ghost Overwrite**: Manuelle Korrekturen bleiben dauerhaft erhalten.

---

# ??? Signature Suffix Addendum (from Antigravity)

- **FR-006: Signature Suffixes**: Das System MUST Untersttzung fr offizielle Vertretungs-Zustze bieten:
    - `i. A.` (im Auftrag)
    - `i. V.` (in Vollmacht)
    - `ppa.` (Prokura)

---

# ?? Wikipedia Intelligence Addendum: The "Etikette" Update

- **FR-007: Group-Identity Snippets**: Untersttzung fr branchenspezifische Gre ("Mit sportlichem Gru", "Glck auf!", "Mit kollegialen Gren").
- **FR-008: Punctuation Guard**: 
    - Das System MUST das Komma am Ende der Gruformel als Fehler markieren (auer bei englischer Spracheinstellung).
    - Das System MUST sicherstellen, dass KEIN Punkt am Ende der Gruformel steht.
- **FR-009: The 3-Line Signature Rule**: Zwischen Gruformel und maschinenschriftlichem Namen MUST ein Platz von exakt 3 Leerzeilen (ca. 12,7mm) fr die handschriftliche Unterschrift reserviert werden.

