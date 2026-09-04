---
id: adr-js
title: "ADR-JS: JavaScript Constraints & 'JS as a Crutch'"
type: adr
status: active
created: '2026-06-26'
updated: '2026-07-07'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
doc_links:
  - ADR-HTML
  - ADR-CSS
  - ADR-ANTIPATTERN
  - longevity-guidelines
code_links:
  - website/js/main.js
error_patterns:
  - javascript constraints
  - js as a crutch
  - execCommand verboten
  - selection range api
  - view transitions
  - temporal api
  - localstorage
supersedes: []
depends_on: []
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

- **Reglementierte Aufgaben:** JS darf nur genutzt werden für: (1) Selection/Range API, (2) Paste-Sanitizing, (3) LocalStorage, (4) Externe API-Anfragen, (5) Toast-Queue, (6) Canvas-Bildkomprimierung für LocalStorage-Limits, (7) deterministisches Offline-Anrede- und Adress-Lookup.

- **TextFitEngine vollständig eliminiert (JS-Kill Phase 1, 2026-09-04):** Das Modul `website/js/48-text-fit.js` wurde archiviert und gelöscht. Sämtliche DOM-Messungen (`scrollWidth > clientWidth`) und MutationObserver-Schleifen sind als Antipattern (Catalog A49) verboten. Das Text-Fitting und dynamische Feldwachstum erfolgen zu 100% über natives CSS (`field-sizing: content`, `overflow: clip`, `text-wrap: balance/pretty`, CSS `text-fit: shrink 60%`).

- **Verbot von `execCommand`:** Textformatierungen werden über die W3C Selection & Range API umgesetzt.

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