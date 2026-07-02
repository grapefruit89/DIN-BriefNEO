---
title: "ADR-CSS: CSS Architecture & Proportional Zoom"
status: accepted
date: 2026-05-24
deciders: [morit, antigravity]
tags: [adr, css, layout, zoom, containers, theming]
aliases: ["CSS Architecture & Proportional Zoom"]
related: 
  - "[[ADR-HTML]]"
  - "[[ADR-JS]]"
  - "[[longevity-guidelines]]"
---

# ADR-CSS: CSS Architecture & Proportional Zoom

## 1. Context & Problem

**WYSIWYG Skalierung ohne Scrollbalken.**
- Klassische Webanwendungen brechen oft das WYSIWYG-Prinzip durch unkontrolliertes Scrollen oder verzerrte Proportionen.
- Der DIN-BriefNEO-Bogen muss unter allen Bedingungen pixelperfekt proportional skaliert und absolut ohne Scrollbalken im Fenster dargestellt werden.
- Komplexe Layout-Aufgaben (Zoom, Theming, Positionierung) sollen ohne JavaScript gelöst werden, um die Langlebigkeit zu maximieren.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Pure CSS) | `aspect-ratio`, Container Queries (`cqw`/`cqh`), native APIs (`light-dark`, Anchor Positioning) | 100% Zero-JS, maximale Performance | Erfordert Chrome 148+ | Text overflow bei zu viel Text | **Gewählt** |
| **Option B** (JS-Driven) | ResizeObserver + `transform: scale()` | Abwärtskompatibel | Ruckeln, asynchrone Berechnungen | Hoher Wartungsaufwand | Abgelehnt |

## 3. Decision

**Wir haben uns für Option A (Pure CSS Architecture) entschieden.**

### Begründung
- **Reiner CSS-Zoom:** `<din-a4>` wird auf `height: 94vh` und `aspect-ratio: 210 / 297` fixiert.
- **Container Queries:** Alle inneren Maße verwenden `cqw` und `cqh`, um proportional zum Papierbogen zu skalieren.
- **Absolute Viewport-Sperre:** `overflow: hidden` auf `html` und `body` verhindert Scrollbalken.
- **Natives Theming:** Nutzung von `light-dark()` und W3C Relative Color Syntax (RCS) im OKLCH-Farbraum.
- **Anchor Positioning:** W3C CSS Anchor Positioning für Dropdowns (z.B. `#address-suggestions`).
- **CSS @property & interpolate-size:** Für flüssige native Transitionen auf Custom Properties und `auto`-Maße.
- **CSS @scope:** Vollständige Kapselung der Briefblatt-Stile (`@scope (din-a4)`).
- **Zero-JS State Toggles:** Nutzung von `:has()` und Checkboxen für UI-State.

## 4. Consequences

### Positive Auswirkungen
- Absolut flüssige, stufenlose Echtzeit-Skalierung auf allen Displays.
- 100% WYSIWYG-konform: Druck = Bildschirm.
- JavaScript wird von Layout-Aufgaben vollständig befreit.
- Automatisch harmonisierte Farbschemata (RCS) im perceptually uniform OKLCH-Farbraum.

### Risiken & Negative Auswirkungen
- Texte müssen in der Höhe begrenzt sein (z. B. auf 1 A4-Seite), da Overflow-Scrolling deaktiviert ist.
- Bindung an hochmoderne Chromium-Engines (Chrome 148+).

### Langfristige Auswirkungen
- **Architektur-Stabilität:** Die Codebasis bleibt extrem JS-arm und profitiert direkt von Engine-Optimierungen.

## 5. Implementation & Verification

- Alle CSS-Variablen sind in `layout.css` als OKLCH deklariert.
- Container-Maße (`cqw`, `cqh`) sind in der CSS-Basis verankert.
- `overflow: hidden` ist produktiv.
- Einhaltung wird durch die Anti-Pattern-Linter-Regeln für JS-basiertes Styling überprüft.

## 6. Related Documents

- [[ADR-HTML]]
- [[ADR-JS]]
- [[longevity-guidelines]]
- [[ADR-ANTIPATTERN]]

---

### Feature Checks

```javascript feature-check
// f("Feature Name", Bedingung, "Chrome XXX", "Status")
f("CSS :has() Selektor", typeof CSS !== "undefined" && CSS.supports && CSS.supports("selector(:has(div))"), "Chrome 105", "Produktiv"),
f("CSS field-sizing: content", typeof CSS !== "undefined" && CSS.supports && CSS.supports("field-sizing: content"), "Chrome 123", "Produktiv")
```
