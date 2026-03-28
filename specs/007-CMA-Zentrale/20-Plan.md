---
id: SPEC-007-PLAN
title: CMA Technical Implementation
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (CMA)

## 1. Architektur-Layer

### Layer 1: JS-Core (`js/core/constants.js`)
- Export von `CMA` Object (Frozen).
- Definition der `IMR` (Isomorphic Master Registry) Atome.
- Precision Logic: `Object.freeze()` verhindert Runtime-Mutationen.

### Layer 2: CSS-Level (`css/app-ui.css`)
- Injection der CMA-Werte in CSS Custom Properties (`--din-*`).
- Layout-Steuerung via CSS Variables.
- **Chrome 147 Upgrade:** Nutzung von `@property` zur Typisierung der Maße (`syntax: '<length>'`).

## 2. Synchronisations-Strategie
- **JS → DOM:** `UIController` liest `IMR` und setzt Initial-Werte.
- **CSS → Render:** Millimeter-genaue Positionierung via `top`, `left`, `width` basierend auf `--din-*` Variablen.

## 3. APIs
- **IMR 4.0 Registry:** Mapping zwischen `Key` und `Tag`.
- **CMA Central Object:** SSoT für numerische Werte.
