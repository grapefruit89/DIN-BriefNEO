---
id: longevity-guidelines
title: 'Guide: Longevity & W3C Native Standards Guidelines'
type: guide
status: active
created: '2026-06-26'
updated: '2026-09-02'
tags:
  - din-briefneo
  - din-briefneo/foundation
  - status/active
  - type/guide
doc_links:
  - constitution
  - Immutable-Law-Catalog
code_links: []
error_patterns:
  - longevity
  - wartungsfreiheit
  - w3c living standards
  - zero-dependency
  - deprecated apis
  - langlebigkeit
  - 10 jahre
supersedes: []
depends_on: []
---

# Longevity & Native Standards Guidelines

## 1. Wartungsarme Lebensdauer

Frameworks, Bundler und CDNs sind die häufigste Todesursache alter Webprojekte. DIN-BriefNEO setzt auf native HTML-, CSS- und JS-Schnittstellen und Zero Runtime-Dependencies, damit dieselbe Datei in Jahren noch öffnet.

Das ist ein Ziel, keine mythische „W3C-Garantie der Abwärtskompatibilität“. Living Standards können sich ändern. Deshalb gilt ein Entscheidungsmodell, nicht ein Ewigkeitsversprechen.

### 1.1 Projekt-Baseline

**Einzige projektweite Baseline: Chrome 148+.**

Andere Dokumente nennen keine zweite Zahl. Eine Anhebung der Baseline ist eine Longevity-Entscheidung plus ADR, kein stilles Editieren verstreuter Versionszahlen.

Chrome 150–152 darf aktueller Entwicklungsfokus sein. Das ändert diese Baseline nicht.

Entscheidungsmodell für Features:

1. Standardstatus (Living Standard / REC / Draft)
2. diese Baseline
3. Feature-Reife
4. Fallback-Politik (CSS-Fallback ja; JS-Polyfill für Layout nein)

---

## 2. Fünf Säulen

### Säule 1: Zero Runtime-Dependency

Keine npm-Pakete und keine CDN-Skripte im Produkt. DOM nativ, Datum über `Temporal`, Netz nur wo ein explizites optionales Feature es braucht (`fetch`). `Date` ist im Projekt nicht zulässig (Catalog TM1).

### Säule 2: Offline / `file://`

Die Anwendung muss als lokale HTML-Datei funktionieren. Keine Pflicht auf HTTPS-only-APIs für Kernfunktionen.

### Säule 3: Native Standards vor Experimenten

Vendor-Präfixe und unstabile Experimente sind kein Fundament. Neue native APIs dürfen nach Abschnitt 1.1 nachziehen — genau deshalb ist der Law Catalog keine ewige API-Pflichtliste.

Konkret heute tragfähig: Popover, Container Queries für die Blatt-Skala, Selection/Range statt `execCommand`, Anchor Positioning ab der Baseline.

### Säule 4: Kein Compiler für das Produkt

Kein Webpack/Vite/Babel/Sass als Voraussetzung. ESM mit Dateiendung `.js`. CSS mit Nesting und Custom Properties.

### Säule 5: localStorage als gewählter Speicher

Produktdaten liegen in localStorage, weil das unter `file://` zuverlässig ist. Das disqualifiziert IndexedDB nicht weltweit; es ist hier nicht der Produktspeicher.

---

## 3. Schreibregeln

### JavaScript

- Keine deprecated Editing-APIs (`execCommand`).
- Keine eigenen Handler für Standard-Shortcuts im `contenteditable`, die der Browser schon liefert.
- ESM-Importe mit `.js`.
- Keine JS-Klasse und kein `customElements.define()`, nur weil ein `<din-…>`-Tag Semantik trägt.
- Keine parallelen DIN-Millimeter in JS.
- Kein `Date` als Zeitquelle.

### CSS

- Layout und Blatt-Skala in CSS, nicht in `ResizeObserver`-Schleifen.
- Kein `filter: invert(1)` für Themes.
- `var(--x, fallback)`.
- Farbe nach Catalog-Kette (OKLCH zuerst).
- CSS setzt das IMR-Modell um. Es führt keine eigene normative Millimetertabelle.

### Geometrie

Normative belegte Geometrie steht in der IMR-Registry. HTML implementiert sie. CSS rendert sie. JS erzeugt keine konkurrierende Normquelle.

---

## 4. Review

Diese Richtlinien alle zwei Jahre oder bei Baseline-Wechsel prüfen. Neue stabile native APIs dürfen bevorzugte MUST-USE-Einträge im Catalog ersetzen, sobald das Modell in 1.1 erfüllt ist.
