---
id: SPEC-069-ANF
title: Highlight Editor Domain-Spec
status: active
version: 4.0.0
---

# 10 â€” Anforderung: Native Highlight Editor

## 1. Domain-Spec
ErmÃ¶glichung von WYSIWYG-Formatierungen ohne Verletzung der Plaintext-IntegritÃ¤t. Komplette Entkopplung von Daten (Text) und Darstellung (Paint-Time Styles).

## 2. Functional Requirements (FR)

### FR-001: Zero-Tag Data Integrity
- **Constraint:** Der Daten-State (`body`) MUSS zu 100% frei von HTML-Tags bleiben.
- **Enforcement:** `innerHTML` == `textContent`.

### FR-002: Coordinate-based Formatting
- **Logic:** Definition von Formaten Ã¼ber Start/End-Indizes (Offsets) statt Markup.
- **Example:** `{"type": "bold", "start": 0, "end": 5}` markiert die ersten 5 Zeichen als fett.

### FR-003: Persistence & Rehydration
- **Storage:** Speicherung der Format-Matrix im IMR-Zustand.
- **Restore:** Automatische Wiederherstellung der visuellen Layer beim Boot.

### FR-004: EditContext Autonomousty
- **Execution:** Nutzung der `EditContext API` zur Abstraktion von OS-Eingaben (IME, Dictation).

