---
id: PLAN-059
spec: SPEC-053
title: Accessibility v3 via native contrast-color()
status: active
anti-patterns: [ANTI-025]
adr: ADR-011
---

# Plan: Accessibility v3 via native contrast-color() (Chrome 147+)

## 1. Zielstellung
Automatische Auswahl der optimalen Textfarbe (Schwarz/Weiß) auf farbigen Briefköpfen.

## 2. Technische Umsetzung
Anstatt JS-Helligkeitsberechnungen zu nutzen, übernimmt Chrome 147 die Auswahl nativ.

### 2.1 CSS Blueprint
```css
@layer ui.theme {
  :root {
    /* Die Hauptfarbe wird im Profil gesetzt */
    --brand-color: var(--p-brand, #2980b9);
    
    /* Chrome 147: Wählt automatisch die bessere Kontrastfarbe */
    --brand-text-color: contrast-color(var(--brand-color));
  }
}
```

## 3. Nutzen
- **WCAG-Konformität**: 100% garantierte Kontrastrate ohne manuelle Tests.
- **Zero-JS Logic**: Keine Farbraum-Konvertierungen im JS nötig.
