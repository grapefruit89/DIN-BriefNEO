---
title: "ADR-JS: JavaScript Constraints & 'JS as a Crutch'"
status: accepted
date: 2026-05-24
last-reviewed: 2026-07-02
deciders:
  - morit
  - antigravity
type: adr
tags:
  - adr
  - js
  - scripting
  - event-handling
  - dom-selection
  - constraints
aliases:
  - "JavaScript Constraints"
  - "JS as a Crutch"
related: 
  - "[[ADR-HTML]]"
  - "[[ADR-CSS]]"
  - "[[longevity-guidelines]]"
project: DIN-BriefNEO
---

# ADR-JS: JavaScript Constraints & "JS as a Crutch"

## 1. Context & Problem

**JS-Überladung und "JS as a Crutch".**
- Webapplikationen nutzen oft JavaScript für visuelle Effekte und Layout-Berechnungen.
- Das führt zu Performance-Einbußen, Rucklern und technischer Schuld.
- In DIN-BriefNEO soll JS streng auf eine logische Begleitschicht reduziert werden.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Strikt reglementiertes JS) | JS nur für DOM-Range-Selektion, APIs, Persistenz, View Transitions | Maximale Stabilität, CSS übernimmt Layout (Anchor) | Höherer Lernaufwand bei CSS | Keine | **Gewählt** |
| **Option B** (JS-Driven UI) | JS für ResizeObserver, `execCommand`, Toolbar-Position | Einfach, bekannt | Veraltete APIs, Ruckeln bei Repaints | Wartbarkeit | Abgelehnt |

## 3. Decision

**Wir haben uns für Option A (Striktes JS-Einsatzverbot für Rendering) entschieden.**

### Begründung
- **Verbot von JS-Layouting:** JS darf keine CSS-Stile für Layout, Rendering oder visuelle Effekte setzen (Toolbar nutzt CSS Anchor Positioning).
- **Reglementierte Aufgaben:** JS darf nur genutzt werden für: (1) Selection/Range API, (2) Paste-Sanitizing, (3) LocalStorage, (4) Externe API-Anfragen, (5) Toast-Queue, (6) Canvas-Bildkomprimierung für LocalStorage-Limits.
- **Verbot von `execCommand`:** Textformatierungen werden über die W3C Selection & Range API umgesetzt.
- **Sichere DOM-Manipulation:** Die Verwendung von `innerHTML` ist als Antipattern eingestuft und strikt verboten (XSS-Gefahr). Es dürfen ausschließlich sichere Native-Methoden wie `setHTML()`, `setHTMLUnsafe()` oder `textContent` zur DOM-Injektion genutzt werden.
- **View Transitions API:** Native `document.startViewTransition()` wird für UI-Zustandswechsel verwendet, anstatt händisch via JS zu animieren.

## 4. Consequences

### Positive Auswirkungen
- **Schlanker Code:** JavaScript-Logik bleibt absolut minimiert (<18 KB).
- **Robustheit:** Die App läuft layout-stabil, selbst wenn JS verzögert oder blockiert.
- **Zukunftssicherheit:** Veraltete APIs wie `execCommand` werden nicht mehr verwendet.

### Risiken & Negative Auswirkungen
- Visuelle Statustoggles erfordern teilweise fortgeschrittenes CSS (z.B. Segmented Controls, `:has()`).

## 5. Implementation & Verification

- CSS Anchor Positioning ersetzt ehemalige JS-Koordinatenberechnung.
- `execCommand` ist in den Anti-Pattern-Regeln verboten.
- View Transitions sind in `main.js` für Formularwechsel und Theme-Toggles produktiv.

## 6. Related Documents

- [[ADR-HTML]]
- [[ADR-CSS]]
- [[ADR-ANTIPATTERN]]
- [[longevity-guidelines]]

---

### Feature Checks

```javascript feature-check
f("Temporal API", typeof globalThis.Temporal !== "undefined", "Chrome 146", "Future-Proof"),
f("View Transitions (Scoped)", typeof document.startViewTransition !== "undefined", "Chrome 146", "Future-Proof"),
f("Sanitizer API (Native)", typeof globalThis.Sanitizer !== "undefined", "Chrome 147", "Future-Proof"),
f("Promise.withResolvers()", typeof Promise.withResolvers !== "undefined", "Chrome 119", "Produktiv")
```
