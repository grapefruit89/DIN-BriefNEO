---
aliases:
- JavaScript Constraints
- JS as a Crutch
chosen_option: ''
created: '2026-07-06'
date: 2026-05-24
deciders:
- morit
- antigravity
decision_options: []
depends_on: []
last-reviewed: 2026-07-02
project: DIN-BriefNEO
related:
- '[[ADR-HTML]]'
- '[[ADR-CSS]]'
- '[[longevity-guidelines]]'
status: accepted
tags:
- adr
- js
- scripting
- event-handling
- dom-selection
- constraints
title: 'ADR-JS: JavaScript Constraints & ''JS as a Crutch'''
type: adr
updated: '2026-07-06'
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
- **Sichere DOM-Manipulation (`setHTML` vs `setHTMLUnsafe`):** `innerHTML` ist als Antipattern eingestuft und strikt verboten (XSS-Gefahr). Als Standardfall ist die W3C Sanitizer API (`setHTML()`) zu bevorzugen. `setHTMLUnsafe()` darf nur als absoluter Ausnahmefall (oder Fallback für ältere Engines) verwendet werden, wenn bewusst ungefiltertes HTML injiziert werden muss. Für reinen Text ist ausschließlich `textContent` zu nutzen.
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
- Die reine DOM-basierte Datenkopplung (wie in `sender-sync.js`) demonstriert den Verzicht auf globale State-Stores zugunsten reaktiver DOM-Updates für das Ausfüllen des Absenders.
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