---
id: adr-antipattern
title: 'ADR-ANTIPATTERN: Forbidden Practices & Antipatterns'
type: adr
status: active
created: '2026-06-26'
updated: '2026-09-02'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
doc_links:
  - Immutable-Law-Catalog
  - longevity-guidelines
  - ADR-HTML
  - ADR-CSS
  - ADR-JS
  - ADR-API
code_links: []
error_patterns:
  - antipattern
  - verboten
  - forbidden
  - framework
  - cdn
  - execCommand
  - localstorage
  - oklch
  - scrollbalken
  - temporal
supersedes: []
depends_on: []
---

# Architectural Decision Record (ADR): Forbidden Practices & Antipatterns

## Status

Akzeptiert

## Rolle

Die **Klassifikation** (HARD BAN / PREFERRED / FALLBACK) steht im [[Immutable-Law-Catalog]].

Dieses ADR begründet die gewählten Verbote und Alternativen. Es ist keine zweite Verfassung und führt keine eigene Browser-Baseline.

Baseline: ausschließlich [[longevity-guidelines]] — **Chrome 148+**.

## Kontext & Problemstellung

> [!info] Hintergrund
> Um Offline-`file://`-Betrieb, Zero Runtime-Dependencies und eine moderne Chrome-148+-Plattform zu halten, sind bestimmte übliche Web-Praktiken ausgeschlossen. Neue Verbote entstehen nur über das Amendment-Protokoll des Catalogs.

---

## Entschiedene Praktiken

Die Stufen unten folgen dem Catalog. Inhaltlich bleiben die bisherigen zwölf Themen erhalten.

### 0. Sanitizer statt `setHTMLUnsafe()` als Default

*   **Catalog:** PREFERRED `setHTML()` / `textContent`; `setHTMLUnsafe()` nur bei bewusst ungefiltertem HTML.
*   **Begründung:** Ungefiltertes HTML ist der XSS-Pfad. Die native Sanitizer API ist auf der Baseline verfügbar.
*   **Keine eigene Versionszahl** in diesem ADR.

### 1. Frameworks & Build-Tools — HARD BAN

*   **Begründung:** Frameworks erzeugen Abhängigkeiten und Build-Systeme. Das Produkt bleibt Vanilla HTML, CSS und JS-ESM, damit `index.html` per Doppelklick startet.

### 2. Externe CDNs & Google Web Fonts — HARD BAN

Es dürfen **keinerlei** externe Scripts, Stylesheets oder Webfonts über CDNs geladen werden.

*   **Begründung:** DSGVO (IP-Abfluss) und Offline-Bruch. Assets lokal.
*   **Verweis:** [[ADR-CSS]], [[ADR-FEATURE]] zum Schriftarten-Manager. Catalog A38, A41.

### 3. IndexedDB, OPFS, File System Access als Produktspeicher — HARD BAN in diesem Produkt

*   **Begründung:** Unter `file://` werfen diese APIs Sicherheits-Exceptions.
*   **Entscheidung:** `localStorage` ist der Produktspeicher (Catalog S1, A34–A36). Das ist keine Aussage über den Wert dieser APIs außerhalb dieses Produkts.

### 4. `document.execCommand` — HARD BAN

*   **Begründung:** Deprecated. Toolbar und Edit nutzen Selection & Range bzw. native Shortcuts.
*   **Verweis:** [[ADR-JS]].

### 5. Unkontrollierte Viewport-Scrollbalken — HARD BAN

*   **Begründung:** Der Viewport ist die Brief-Arbeitsfläche (Catalog A43). Internes Scrollen in abgegrenzter UI bleibt zulässig.
*   **Verweis:** [[ADR-CSS]].

### 6. Legacy-Datums-APIs — HARD BAN

`new Date()`, `Date.parse`, `Date.now` als Zeitquelle sowie `moment.js`, `date-fns`, `luxon` sind im Projekt nicht zulässig.

*   **Begründung:** Temporal ist die verbindliche Datums-/Zeitabstraktion des Projekts. `Date` wird nicht verwendet. Externe Date-Libraries verletzen Zero-Dependency.
*   **Catalog:** TM1, A48.

### 7. Farbe — PREFERRED / FALLBACK, kein Hex-Verbot

Verbindliche Kette (Catalog C1, A16–A20):

**OKLCH → Lab/LCH → HSL → RGB → HEX → Named**

*   OKLCH bleibt Stufe 1 (wahrnehmungsnah, Relative Color).
*   Eine niedrigere Stufe nur, wenn die höhere für den Fall keinen sinnvollen Vorteil bietet oder ungeeignet ist.
*   `#fff` und vergleichbare Tokens sind damit kein Gesetzesbruch.

### 8. CSS-Präprozessoren und CSS-in-JS — HARD BAN

*   **Begründung:** Nesting und Custom Properties sind nativ. Präprozessoren brauchen einen Build; CSS-in-JS erzeugt Laufzeitkosten. Catalog A21, A22.

### 9. Icon-CDNs und Icon-Fonts — HARD BAN

*   **Begründung:** DSGVO und Offline. Ersatz: Inline-SVG oder lokale SVG-Dateien. Catalog A39, A40.

### 10. Lodash/Underscore und Produkt-Transpiler (TypeScript, Babel) — HARD BAN

*   **Begründung:** ES-Module und native Array-/Objektmethoden reichen. Ein Pflicht-Compile-Schritt zerstört den Doppelklick-Start.

### 11. JS-Animationsbibliotheken (GSAP, Anime.js) — HARD BAN

*   **Begründung:** Animation über CSS Transitions, `@starting-style`, `@keyframes` und View Transitions auf dem Compositor.

### 12. Inline-CSS für Layout, Farbe, Position — HARD BAN

*   **Begründung:** Hebelt Stylesheets und Token aus. Ausnahme bleibt kurzlebige Selektions-Koordinaten (Catalog A25).

---

## Konsequenzen

*   Verstöße gegen Catalog-HARD-BANs werden im Review zurückgewiesen.
*   Lauffähigkeit unter `file:///index.html` bleibt QA-Voraussetzung.
*   Baseline-Änderungen nur über Longevity plus ADR, nicht in diesem Dokument.

## Verknüpfungen

*   [[Immutable-Law-Catalog]] — Stufen und Verbote
*   [[longevity-guidelines]] — Chrome 148+
*   [[ADR-HTML]] — `contenteditable`, Popover
*   [[ADR-CSS]] — Viewport, Typografie
*   [[ADR-JS]] — DOM, Selection
*   [[ADR-API]] — Header-Sicherheit
