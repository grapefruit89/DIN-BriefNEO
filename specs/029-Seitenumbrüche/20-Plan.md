---
id: SPEC-029-PLAN
title: Pagination Technical Architecture
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (Pagination)

## 1. Architektur-Konzept
Zero-JS Pagination. Die Steuerung erfolgt rein deklarativ über CSS-Media-Queries.

### Layer 1: Screen-Safety
- **Container:** `#paper-viewport` nutzt `place-items: center`.
- **Overflow:** `din-text` mit `max-height: 180mm` (Rest-Raum). Visual-Indicator bei Overflow via CSS `:after` Overlay.

### Layer 2: Print-Engine (`@media print`)
- **Root-Swap:** `din-A4` wechselt von `height: 297mm` auf `height: auto`.
- **Header-Isolation:** `din-header` und `din-anschriftfeld` erhalten `position: absolute` auf Page 1.
- **Body-Flow:** `din-text` fließt in den globalen Dokumenten-Kontext.

## 2. APIs & Standards
- **CSS Paged Media (Level 3):** Nutzung von `@page` Regeln für Margins und Counter.
- **Fragmentation API:** `widows: 3`, `orphans: 3` für saubere Umbrüche.
- **View Transitions:** Flüssiger Wechsel in die Print-Preview (Chrome 147 native).
