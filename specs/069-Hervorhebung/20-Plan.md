---
id: SPEC-069-PLAN
title: Highlight Editor Technical Architecture
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (Highlighting)

## 1. Architektur-Komponenten

### Layer 1: Highlighting Engine (`CSS Custom Highlight API`)
- **API:** `CSS.highlights.set('din-bold', new Highlight(...ranges))`.
- **Styling:** Definition im CSS via `::highlight(din-bold) { font-weight: bold; }`.
- **Benefit:** Rendering findet zur Paint-Time statt, verändert aber nicht den DOM-Tree.

### Layer 2: Range-Management
- **Logic:** Umrechnung von Index-Paaren (JSON) in DOM-Ranges.
- **Sync:** Kontinuierliche Validierung der Ranges bei Text-Mutationen.

### Layer 3: EditContext Bridge
- `EditContext` liefert die Selektions-Daten (Selection-Offsets).
- `UIController` mappt diese auf die Highlight-Matrix.

## 2. APIs & Standards
- **CSS Custom Highlight API:** Moderne Browser-native Formatierung.
- **Selection API / EditContext:** Akkurate Index-Bestimmung.

## 3. Performance & Stability
- Nutzung von `requestAnimationFrame` zur Aktualisierung der Highlights zur Render-Time.
- Vermeidung von DOM-Reflows durch strikte Trennung von Inhalt und Stil.
