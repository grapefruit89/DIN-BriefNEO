---
id: plattform-watchlist
title: "Plattform-Watchlist: Was Chrome angekündigt hat und wann es uns trifft"
type: reference
status: active
created: '2026-11-15'
updated: '2026-11-15'
tags:
  - din-briefneo
  - meta
  - web-platform
  - watchlist
summary: "Dokumentation und Spezifikation für Plattform-Watchlist: Was Chrome angekündigt hat und wann es uns trifft."
doc_links:
  - [[DECISION-LOG]]
  - [[BACKLOG]]
  - [[AGENTS]]
code_links:
  - website/js/document.js
  - website/css/base.css
  - website/css/sheet-multipage.css
depends_on:
---
# Plattform-Watchlist

**Zweck:** Diese Datei ist der Vorraum, nicht die Werkbank. Hier stehen
angekündigte, aber **noch nicht ausgelieferte** Web-Plattform-Features. Sobald
eine Version tatsächlich ausgeliefert ist, wird der Eintrag **einmal** gegen
die Primärquelle geprüft, bewertet — und das Ergebnis landet im
[[DECISION-LOG]] (mit «übernommen» oder «verworfen, weil …»). Danach fliegt die
Zeile hier raus.

**Warum erst bei Auslieferung prüfen:** Der Testlauf meldet **Chrome 156**
(gemessen 2026-11-15, `Chrome/156.0.8078.47`). Alles darüber ist Zukunft. Bei
diesem Projekt hielten von zwölf Behauptungen aus einer solchen Liste **fünf
nicht** (`docs/90-archive/upstream-befund-2026-11-10.md`). Ein Design, das auf
einer erfundenen API aufsetzt, kostet einen Tag.

**Prüfweg pro Zeile:** `chromestatus.com/api/v0/features` (oder die
Skill `web-platform-pulse`), dann `browser-compat-data`/`web-features` für die
Auslieferung. Ergebnis: `belegt`, `erfunden` oder `noch nicht ausgeliefert`.

## Quellenlage

Alle Zeilen unten stammen aus **GitHub #22** — einer eingefügten Chat-Antwort,
**keine geprüfte Quelle**. Sie sind als Behauptung markiert, nicht als Fakt.
Nichts davon ist im Code benutzt.

## CSS

| Behauptung | Ab | Für uns relevant? | Status |
|---|---|---|---|
| `text-decoration-inset` | 157 | Typografie — ja, klein | ungeprüft |
| `text-overflow: <string>` (eigener Text statt „…") | 157 | nein, wir kürzen nicht | ungeprüft |
| `position-visibility: anchor-valid` | 157 | nein | ungeprüft |
| `::highlight(*)` (alle Custom Highlights) | 158 | **ja** — Live-Validierung im Blatt | ungeprüft |
| `flow-start` / `flow-end` (Aliase) | 158 | nein, Kosmetik | ungeprüft |
| Scroll-Snap für einachsige Container | 158 | nein | ungeprüft |
| `object-fit` für SVG in `<object>`/`<embed>` | 158 | nein | ungeprüft |
| `AccentColor` / `AccentColorText` (Systemfarben) | 159 | nein | ungeprüft |
| Background-Layer-Anzahl bleibt erhalten | 159 | nein | ungeprüft |
| Optionale Deskriptoren bei `@property` | 159 | nein | ungeprüft |
| `CSSImportRule.styleSheet` → `null` | 159 | nein (kein `@import`) | ungeprüft |
| Anker-Namen case-sensitive im Quirks-Modus | 160 | nein (Standards-Modus) | ungeprüft |

## HTML

| Behauptung | Ab | Für uns relevant? | Status |
|---|---|---|---|
| HTML-in-Canvas **stabil** | 157 | nein | ungeprüft |
| Neue Einfüge-Methoden (`beforeHTML`, `appendHTML`, `streamAppendHTML`) | 157 | **vielleicht** — `document.js` baut Rich-Text mit `DOMParser` + `replaceChildren` | ungeprüft |
| `<install>`-Element (deklarative Installation) | 158 | nein, kein PWA | ungeprüft |

## JavaScript

| Behauptung | Ab | Für uns relevant? | Status |
|---|---|---|---|
| Language Detector API (nur Android) | 157 | nein | ungeprüft |
| Long Animation Frames: `styleDuration` | 157 | nein, Diagnose | ungeprüft |
| Web Install API (`navigator.install()`) | 158 | nein | ungeprüft |
| Medien-Pseudoklassen (`:playing`, `:paused`, …) | 158 | nein, kein Audio | ungeprüft |
| **Sanitizer API erweitert** (bereinigt auch `javascript:`-URLs) | 159 | **ja** — könnte `sanitizeRichText` vereinfachen | ungeprüft |
| Prerendering cross-origin iframes | 159 | nein | ungeprüft |
| SpeechRecognition-Timestamps | 159 | nein | ungeprüft |
| Erweiterte Canvas-`TextMetrics` | 159 | nein | ungeprüft |
| `\A`, `\z`, `\Z` in Unicode-Regexen | 159 | nein | ungeprüft |
| Prompt-API-Sampling | 160 | nein, keine KI im Produkt (A37) | ungeprüft |
| `maxWriteWithoutResponseSize` (Bluetooth) | 160 | nein | ungeprüft |

## Die drei Zeilen, die uns wirklich treffen könnten

1. **Sanitizer API (159)** — wenn sie wirklich `javascript:`-URLs bereinigt,
   könnte `sanitizeRichText` (`website/js/document.js`) einen Teil seiner
   Handarbeit abgeben. Bedingung: sie muss `span.brief-kommentar` erhalten,
   sonst ist sie kein Ersatz (gemessen 2026-11-14: die native `setHTML()`
   verwirft `class`).
2. **`::highlight(*)` (158)** — einheitliche Basis-Formatierung für
   Live-Validierungen, ohne pro Feld eigene Pseudo-Elemente.
3. **`appendHTML`/`streamAppendHTML` (157)** — falls sie Attribute sauber
   behandeln, wäre das der native Weg für den Rich-Text-Restore im Seeder.

## Wartung

- Nach jedem Chrome-Versionssprung: prüfen, welche Zeilen ausgeliefert sind.
- Ausgeliefert → eine Zeile im [[DECISION-LOG]] mit Ergebnis, Zeile hier
  löschen. Nicht ausgeliefert → `Ab` korrigieren.
- Diese Datei ist **kein** Backlog. Sie enthält keine Aufgaben, nur Aussichten.
