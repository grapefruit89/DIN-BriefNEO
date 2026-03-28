---
id: SPEC-066-ANF
title: Markdown Ghosting Domain-Spec
status: active
version: 4.0.0
---

# 10 — Anforderung: Markdown Ghosting & Zero-Width Logic

## 1. Domain-Spec
Gewährleistung einer 100%igen Umbruch-Parität zwischen Editor und Print. Etablierung eines "gewichtslosen" Markdown-Steuerzeichensystems (Ghosting) im visuellen Mirror.

## 2. Functional Requirements (FR)

### FR-001: Non-Destructive Transformation
- **Logic:** Der Parser DARF Steuerzeichen (`*`, `**`, `>`) NICHT löschen.
- **Execution:** Einwicklung der Zeichen in `<span class="md-marker">` zur Erhaltung der `textContent` Länge.

### FR-002: Zero-Width Rendering
- **Constraint:** Marker-Elemente MÜSSEN für den Browser-Line-Breaker eine Breite von 0px haben.
- **UI:** Überlauf sichtbar (Ghosting-Effekt), aber ohne Einfluss auf den Textfluss des restlichen Satzes.

### FR-003: EditContext Offset Parity
- **Constraint:** Die logische Cursor-Position im `EditContext` MUSS exakt mit der sichtbaren Position im Mirror korrespondieren.
- **Beweis:** `textContent` des Mirrors inkl. Marker == Rohdaten-String.

### FR-004: Typography Guard
- Vermeidung von optischem "Kleben" der Marker an Wörtern via negativem Margin-Korrektor im CSS.
