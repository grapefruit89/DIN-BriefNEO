---
id: SPEC-029-ANF
title: Pagination & Hybrid-Height Domain-Spec
status: active
version: 4.0.0
---

# 10 — Anforderung: Multi-Page Pagination

## 1. Domain-Spec
Nahtlose Skalierung von Brief-Inhalten über DIN A4 Grenzen hinaus. Differenzierung zwischen Screen-Immersion (Single Sheet) und Print-Flow (Multi Sheet).

## 2. Functional Requirements (FR)

### FR-001: Hybrid-Height Execution
- **State: SCREEN:** Fixe Geometrie (297mm). Overflow-Detection via `CSS Scroll-State` (Chrome 147).
- **State: PRINT:** Auto-Layout. Dynamischer Flow auf Folgeseiten via `CSS Paged Media`.

### FR-002: Typographic Integrity
- **Orphan/Widow Control:** Vermeidung von Einzeilern an Seitenrändern (min-lines: 3).
- **Fragmentation:** Kontrollierter Umbruch von Block-Elementen via `break-inside: avoid`.

### FR-003: Page Metadata
- Dynamische Injektion von Seitenzahlen ("Seite n von m") auf Folgeseiten (Print-only).
