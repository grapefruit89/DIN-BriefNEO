---
id: SPEC-057-ANF
title: DOM-First Integrity Domain-Spec
status: active
version: 4.0.0
---

# 10 â€” Anforderung: DOM-First Integrity

## 1. Domain-Spec
Etablierung des DOM als primÃ¤re Single Source of Truth (Single Source of Truth) wÃ¤hrend der Runtime. Elimination von synchronem JS-State-Overhead beim Tippen. Kontextsensitive UI-Ausrichtung via physikalischer Anker.

## 2. Functional Requirements (FR)

### FR-001: Passive State Sync
- **Doctrine:** Keine JS-Speicherung pro Tastendruck (Debounce/Sync-Storm Prevention).
- **Execution:** Persistierung erfolgt ereignisbasiert (`blur`, `visibilitychange`, `pagehide`).
- **Source:** Das DOM liefert die Daten fÃ¼r den `StateManager`.

### FR-002: Contextual Tooling (Anchor-Direct)
- **Constraint:** Die Editor-Toolbar MUSS physisch an das aktive Atom (`<din-*>`) gebunden sein.
- **Precision:** Ausrichtung ohne JS-Offsets oder `getBoundingClientRect`.

### FR-003: Structural Immortality
- **Constraint:** Schutz von DIN-Labels (z.B. "Ihr Zeichen") vor LÃ¶schung durch den Nutzer.
- **Execution:** Trennung von dekorativem Label und funktionalem Input-Atom.

