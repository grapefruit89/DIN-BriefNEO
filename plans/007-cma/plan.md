---
id: PLAN-007
spec: SPEC-007
title: Technischer Plan — Central Measurement Authority (CMA)
status: active
created: 2026-03-20
version: 1.0.0
anti-patterns: [ANTI-001, ANTI-005, ANTI-014, ANTI-018, ANTI-023, ANTI-024]
pico-decision: SELECTIVE-EXTRACT (kein Full-Framework, ADR-001)
---

# Technical Plan: Central Measurement Authority (CMA)

## Constitution Check

| Gate            | Anforderung              | Status                           |
|-----------------|--------------------------|----------------------------------|
| VANILLA PURITY  | Kein Framework           | OK — Pure JS + CSS Custom Props  |
| VISUAL FREEZE   | CSS immutable            | OK — CMA ist einzige Schreibstelle |
| OFFLINE         | file:// tauglich         | OK — Keine externen Abhaengigkeiten |
| ANTI-001 Guard  | Kein relatives Positioning | OK — CMA liefert absolute Werte  |
| ANTI-014 Guard  | Kein Layout Thrashing    | OK — Einmaliger Batch-Write      |

---

## Architektur: Drei-Schichten-CMA

```
+------------------------------------------+
|  Layer 1: JS Constants  (Primaerquelle)  |  js/core/constants.js
|  Reine Zahlen, kein DOM-Kontakt          |
+------------------------------------------+
|  Layer 2: CSS Bridge    (Styling-Bruecke)|  js/core/cma-bridge.js
|  Injiziert JS-Werte als CSS Variables    |
+------------------------------------------+
|  Layer 3: CSS Fallback  (Static Safety)  |  css/din5008-paper.css
|  Hardcoded Fallbacks fuer file:// Modus  |
+------------------------------------------+
```

## Hardening: Magic Number Guard (FR-005)

Konvention fuer Code Reviews — jede direkt gesetzte Dimension ist ein Alarm:

```
// KORREKT:
element.style.top = `${CMA.INFO_BLOCK_TOP}mm`;

// VERBOTEN — ANTI-PATTERN-ALARM (Magic Number):
element.style.top = '97.4mm';
element.style.top = '97mm';  // Drift!
```

Pre-commit Regex (optional, fuer spaetere CI-Integration):
```
/style\s*\.\s*\w+\s*=\s*`\d+(\.\d+)?(mm|pt|px)/
```
Trifft jede direkt gesetzte Dimension und loest manuelle Review aus.

---

## Pico CSS Audit — Architektur-Entscheidung (ADR-001)

**VERDICT: SELECTIVE EXTRACT — Vanilla Pure. Kein Full-Framework.**

Drei Pico-Konzepte werden als natives Vanilla CSS extrahiert:
- [PICO-EXTRACT-1] aria-invalid Validation States
- [PICO-EXTRACT-2] Natives <dialog> Styling (Paper Control Center)
- [PICO-EXTRACT-3] color-scheme fuer system-native Inputs

Implementiert in: css/din5008-paper.css (Abschnitt "Pico Extracts")

**Grund der Ablehnung von Full-Pico:**
- Pico-Reset kollidiert mit `body { display: flex }` Layout
- Pico kennt keine mm-Units — gesamtes Spacing-System ist rem-basiert
- ~30KB Overhead fuer Styles, die zu 80% mit !important ueberschrieben wuerden
- Pico ist fuer Websites — NEO ist ein Print-First WYSIWYG-Dokument
