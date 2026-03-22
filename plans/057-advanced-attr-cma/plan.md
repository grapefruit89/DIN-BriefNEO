---
id: PLAN-057
spec: SPEC-007
title: Final Death of CMA-Bridge via Advanced attr()
status: active
anti-patterns: [ANTI-025]
adr: ADR-009
---

# Plan: Final Death of CMA-Bridge via Advanced attr() (Chrome 149+)

## 1. Zielstellung
Vollständige Eliminierung von JavaScript für die Millimeter-genaue Positionierung der DIN-Zonen. Die CMA-Variablen werden direkt aus HTML-Attributen des `<div id="paper">` oder der `<din-*>` Tags bezogen.

## 2. Technische Umsetzung
Sobald die Typisierung in `attr()` (Chrome 149) vollständig stabil ist, stellen wir die CSS-Variablen um.

### 2.1 CSS Blueprint
Anstatt JS-Werte in CSS-Variablen zu injizieren, liest das CSS die Werte direkt:
```css
@layer din.core {
  #anschriftzone {
    /* Liest das Attribut data-cma-top direkt als Millimeter-Wert */
    top: attr(data-cma-top type(<length>), 45mm);
  }
}
```

## 3. Nutzen
- **Zero-JS Overhead**: Keine `cma-bridge.js`, kein Resize-Observer, kein Layout-Sync nötig.
- **Aviation Grade**: Die physische Wahrheit liegt im HTML-Attribut (SSoT).
