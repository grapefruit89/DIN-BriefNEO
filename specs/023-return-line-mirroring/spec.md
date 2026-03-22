---
id: SPEC-023
title: Return-Line Mirroring
tags: [specification, din-5008, platin]
status: cemented
weight: 80
criticality: HIGH
created: 2026-03-20
---
# Feature Specification: Return-Line Mirroring

**Pattern Source**: `[PAT-NK-01]` / `[PAT-GV-01]`

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-LOGIC-MIRROR]`
- **Lexicon Check**: "Rücksendezeile", "Absenderdaten", "Initialen".
- **Principle Check**: **V. USER SOVEREIGNTY**: Automatische Spiegelung darf manuelle Korrekturen NICHT überschreiben (isDirty Flag).

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: 80 
- **Fulfillment Target**: 100% (Logische Korrektheit)
- **Rationale**: Spart dem Nutzer das doppelte Tippen seiner Adresse für das Fensterfeld.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatische Spiegelung (P1)
Als Anwender möchte ich, dass mein Name und meine Adresse automatisch in der kleinen Rücksendezeile (über dem Empfänger) erscheinen, sobald ich meine Absenderdaten eingebe.

**Acceptance Scenarios**:
1. **Given** Rücksendezeile ist leer, **When** ich "Max Mustermann" als Absender eingebe, **Then** erscheint in der Rücksendezeile "M. Mustermann | [STRASSE] | [ORT]".

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001: Auto-Derivation**: Das System MUST die Rücksendezeile automatisch aus den Feldern `profile.senderName`, `profile.senderStreet` und `profile.senderCity` generieren.
- **FR-002: Smart Shortening**: Das System MUST den Vornamen des Absenders auf die Initiale kürzen (z.B. "Moritz Baumeister" -> "M. Baumeister"), um Platz zu sparen.
- **FR-003: Manual Override**: Sobald der Anwender die `<rucksendezeile>` händisch editiert, MUST die automatische Synchronisation gestoppt werden.
- **FR-004: Delimiter Control**: Die einzelnen Bestandteile MUST durch ein "Mittelpunkt"-Zeichen ( · ) oder eine Pipe ( | ) getrennt werden.

## Success Criteria *(mandatory)*

- **SC-001**: **Sync Speed**: Die Rücksendezeile aktualisiert sich in < 100ms nach Eingabe im Absenderfeld.
- **SC-002**: **No Ghost Overwrite**: Manuelle Änderungen an der Rücksendezeile bleiben dauerhaft erhalten (User Sovereignty).
`n`n---`n`n# ?? Hardening Addendum: PAT-MC-03 (Styling & Initial Logic)`n`n- **FR-005: Micro-Typografie**: Die Rücksendezeile MUST in einer Schriftgröße zwischen 6pt und 8pt gerendert werden.`n- **FR-006: Underline Guard**: Die Rücksendezeile MUST laut DIN 5008 Empfehlung unterstrichen dargestellt werden, um sie optisch vom Anschriftenfeld abzugrenzen.`n- **FR-007: Strict Initial Pattern**: Die Kürzung des Vornamens MUST dem Muster `[ERSTER BUCHSTABE] Punkt Leerzeichen [NACHNAME]` folgen (z.B. "Moritz Baumeister" -> "M. Baumeister").`n- **Rationale**: Maximale Platzeinsparung bei gleichzeitiger Wahrung der Identität und Normkonformität.

