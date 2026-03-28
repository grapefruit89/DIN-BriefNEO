---
id: SPEC-051-ANF
title: Content Integrity & Ghost-Mirror Domain-Spec
status: active
version: 4.0.0
---

# 10 — Anforderung: Content Integrity & Ghost-Mirror

## 1. Domain-Spec
Verhinderung von "Data Poisoning" durch unkontrolliertes HTML-Injection via `contenteditable`. Etablierung eines unidirektionalen Datenflusses: Plaintext (Source) → HTML-Mirror (View).

## 2. Functional Requirements (FR)

### FR-001: Plaintext-Only Enforcement
- **Constraint:** Jedes Atom (`<din-*>`) MUSS `contenteditable="plaintext-only"` nutzen.
- **Circuit Breaker:** Unterbindung jeglicher HTML-Schreibvorgänge (Paste/D&D).
- **Source of Truth:** Export-Basis ist exklusiv `textContent`.

### FR-002: Markdown Syntax Support
- **Scope:** `<din-text>` (ehemals body).
- **Tokens:**
  - `**text**` → Bold representation.
  - `*text*` → Italic representation.
  - `> text` → Blockquote representation.
  - `\n\n` → Paragraph separation.

### FR-003: Ghost-Mirror UX
- **Real-time Sync:** Synchronisierung des Plaintext-Inputs in ein schreibgeschütztes Mirror-Element (`<din-text-mirror>`).
- **Visibility Logic:** Mirror aktiv im Read-Mode (Blur), Inaktiv im Edit-Mode (Focus).
- **A11Y:** Mirror MUSS `aria-hidden="true"` tragen.

### FR-004: Typographic Guard
- **Constraint:** Vermeidung von typografischen Fehlern (Widows/Orphans) via CSS Fragmentation.
